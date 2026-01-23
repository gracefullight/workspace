import type { Plugin } from "@opencode-ai/plugin";
import type { Part, UserMessage } from "@opencode-ai/sdk";
import { type Event, OPENCODE_EVENTS } from "@/constants/opencode-events";
import type { MimicContext } from "@/core/context";
import { StateManager } from "@/core/state";
import { createI18n, loadMimicConfig, resolveLanguage } from "@/lib/i18n";
import { evolveDomain } from "@/modules/evolution/engine";
import { buildInstinctContext } from "@/modules/knowledge/instinct-apply";
import { clusterDomainsAndTriggerEvolution } from "@/modules/knowledge/instincts";
import { detectDomainsFromTools, SessionMemoryManager } from "@/modules/knowledge/memory";
import { SkillGenerator } from "@/modules/knowledge/skills";
import { ObservationLog } from "@/modules/observation/log";
import { runObserver, shouldRunObserver } from "@/modules/observation/observer";
import { detectPatterns, surfacePatterns } from "@/modules/observation/patterns";
import { createTools } from "@/tools";
import type { ToolCall } from "@/types";
import { analyzeTimeSinceLastSession, formatDuration } from "@/utils/format";
import { generateId } from "@/utils/id";

export const mimic: Plugin = async ({ directory, client }) => {
  const stateManager = new StateManager(directory);
  await stateManager.initialize();

  const i18n = createI18n(resolveLanguage(await loadMimicConfig()));
  const observationLog = new ObservationLog(
    stateManager.getInstinctsDir().replace("/instincts", ""),
  );
  await observationLog.initialize();

  const sessionMemory = new SessionMemoryManager(
    stateManager.getInstinctsDir().replace("/instincts", ""),
    stateManager.getSessionsDir(),
  );

  const skillGenerator = new SkillGenerator(directory);
  await skillGenerator.initialize();

  const ctx: MimicContext = { stateManager, directory, i18n, client };

  const sessionId = generateId();
  const sessionStartTime = Date.now();
  const toolCalls: ToolCall[] = [];
  const filesEdited: Set<string> = new Set();
  let currentBranch: string | undefined;

  const handleSessionCreated = async () => {
    // Initialize identity on first session
    await stateManager.initializeIdentity();

    const state = await stateManager.read();
    const timeSince = analyzeTimeSinceLastSession(state.journey.lastSession);

    state.statistics.totalSessions += 1;
    state.statistics.lastSessionId = sessionId;
    state.journey.sessionCount += 1;
    state.journey.lastSession = new Date().toISOString();

    await stateManager.save(state);

    // Log session start to observation log
    await observationLog.logSessionStart(sessionId);

    if (timeSince === "long-break") {
      await stateManager.addObservation(i18n.t("obs.returned_after_long_break"));
    }

    // Get continuity hints from session memory
    const hints = await sessionMemory.getContinuityHints();
    const hintMessage = hints.length > 0 ? `\n${hints[0]}` : "";

    // Auto-apply instincts at session start (like Homunculus instinct-apply skill)
    const instinctContext = await buildInstinctContext(ctx);
    if (instinctContext) {
      await client.tui.showToast({
        body: {
          title: "[Mimic] 🧠",
          message: i18n.t("instincts.auto_applied"),
          variant: "info",
        },
      });
    }

    await client.tui.showToast({
      body: {
        message:
          i18n.t("log.session_started", {
            sessions: state.journey.sessionCount,
            patterns: state.patterns.length,
          }) + hintMessage,
        variant: "info",
      },
    });
  };

  const handleSessionIdle = async () => {
    const newPatterns = await detectPatterns(ctx);
    if (newPatterns.length > 0) {
      const state = await stateManager.read();
      state.patterns.push(...newPatterns);
      await stateManager.save(state);
    }

    // Run background observer to generate instincts
    if (await shouldRunObserver(ctx)) {
      const newInstincts = await runObserver(ctx);
      if (newInstincts.length > 0) {
        await client.tui.showToast({
          body: {
            title: "[Mimic]",
            message: i18n.t("observer.new_instincts", { count: newInstincts.length }),
            variant: "info",
          },
        });
      }

      // Check for domain clustering and trigger evolution
      const triggeredDomains = await clusterDomainsAndTriggerEvolution(ctx);
      for (const domain of triggeredDomains) {
        const result = await evolveDomain(ctx, domain);
        if (result) {
          // Also generate a declarative skill
          try {
            const skill = await skillGenerator.fromCapability(ctx, result.capability);
            if (skill) {
              await client.tui.showToast({
                body: {
                  title: "[Mimic] 📚",
                  message: i18n.t("observer.skill_generated", { name: skill.name }),
                  variant: "success",
                },
              });
            }
          } catch {
            // Skill generation is optional, don't fail
          }

          await client.tui.showToast({
            body: {
              title: "[Mimic] ✨",
              message: i18n.t("observer.evolved", {
                name: result.capability.name,
                domain,
              }),
              variant: "success",
            },
          });
        }
      }
    }

    const suggestions = await surfacePatterns(ctx);
    for (const suggestion of suggestions) {
      await client.tui.showToast({
        body: {
          title: "[Mimic]",
          message: suggestion,
          variant: "info",
        },
      });
    }
  };

  const handleFileEdited = async (event: Event) => {
    if (!(event.type === OPENCODE_EVENTS.FILE_EDITED && "properties" in event)) return;

    const file = (event.properties as { file?: string })?.file;
    if (!file) return;

    filesEdited.add(file);

    // Log to observation log
    await observationLog.logFileEdit(file, sessionId);

    const state = await stateManager.read();
    state.statistics.filesModified[file] = (state.statistics.filesModified[file] || 0) + 1;
    await stateManager.save(state);
  };

  const handleVcsBranchUpdated = async (event: Event) => {
    if (!(event.type === OPENCODE_EVENTS.VCS_BRANCH_UPDATED && "properties" in event)) return;

    const branch = (event.properties as { branch?: string })?.branch;
    if (branch !== currentBranch) {
      currentBranch = branch;
      await observationLog.logBranchChange(branch);
    }
  };

  const handleCommandExecuted = async (event: Event) => {
    if (!(event.type === OPENCODE_EVENTS.COMMAND_EXECUTED && "properties" in event)) return;

    const props = event.properties as { name?: string; sessionID?: string; arguments?: string };
    if (props.name) {
      await observationLog.logCommand(props.name, sessionId, props.arguments);
    }
  };

  const handleMessageUpdated = async (event: Event) => {
    if (!(event.type === OPENCODE_EVENTS.MESSAGE_UPDATED && "properties" in event)) return;

    const info = (
      event.properties as {
        info?: { role?: string; id?: string; tokens?: { input: number; output: number } };
      }
    )?.info;
    if (!info) return;

    if (info.role === "assistant" && info.tokens) {
      await observationLog.logAssistantMessage(
        sessionId,
        info.id || "",
        info.tokens.input + info.tokens.output,
      );
    }
  };

  return {
    async event({ event }: { event: Event }) {
      switch (event.type) {
        case OPENCODE_EVENTS.SESSION_CREATED:
          await handleSessionCreated();
          return;
        case OPENCODE_EVENTS.SESSION_IDLE:
          await handleSessionIdle();
          return;
        case OPENCODE_EVENTS.FILE_EDITED:
          await handleFileEdited(event);
          return;
        case OPENCODE_EVENTS.VCS_BRANCH_UPDATED:
          await handleVcsBranchUpdated(event);
          return;
        case OPENCODE_EVENTS.COMMAND_EXECUTED:
          await handleCommandExecuted(event);
          return;
        case OPENCODE_EVENTS.MESSAGE_UPDATED:
          await handleMessageUpdated(event);
          return;
      }
    },

    /**
     * Hook into user messages to capture prompts for pattern analysis
     */
    async [OPENCODE_EVENTS.CHAT_MESSAGE](
      input: { sessionID: string; messageID?: string },
      output: { message: UserMessage; parts: Part[] },
    ) {
      // Extract text from user message parts
      const textParts = output.parts
        .filter((p): p is Extract<Part, { type: "text" }> => p.type === "text")
        .map((p) => p.text);

      if (textParts.length > 0) {
        const textPreview = textParts.join(" ").slice(0, 200);
        await observationLog.logUserMessage(sessionId, input.messageID || "", textPreview);
      }
    },

    async [OPENCODE_EVENTS.TOOL_EXECUTE_AFTER](
      input: { tool: string; sessionID: string; callID: string },
      _output: { title: string; output: string; metadata: unknown },
    ) {
      const state = await stateManager.read();
      if (!state.preferences.learningEnabled) return;

      const toolCall: ToolCall = {
        tool: input.tool,
        callID: input.callID,
        timestamp: Date.now(),
      };

      toolCalls.push(toolCall);
      state.statistics.totalToolCalls += 1;

      // Log to observation log
      await observationLog.logToolCall(input.tool, input.callID, sessionId);

      const toolPattern = input.tool;
      const existing = state.patterns.find(
        (p) => p.type === "tool" && p.description === toolPattern,
      );
      if (existing) {
        existing.count += 1;
        existing.lastSeen = Date.now();
      } else {
        state.patterns.push({
          id: generateId(),
          type: "tool",
          description: toolPattern,
          count: 1,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          surfaced: false,
          examples: [toolCall],
        });
      }

      await stateManager.save(state);

      // Record tool sequence (last 3 tools)
      if (toolCalls.length >= 2) {
        const recentTools = toolCalls.slice(-3).map((t) => t.tool);
        await stateManager.recordToolSequence(recentTools);
      }
    },

    async stop() {
      const sessionDuration = Date.now() - sessionStartTime;

      const sessionData = {
        sessionId,
        startTime: new Date(sessionStartTime).toISOString(),
        endTime: new Date().toISOString(),
        durationMs: sessionDuration,
        toolCalls: toolCalls.length,
        filesEdited: Array.from(filesEdited),
      };

      await stateManager.saveSession(sessionId, sessionData);

      // Log session end to observation log
      await observationLog.logSessionEnd(sessionId, sessionDuration, toolCalls.length);

      // Create session memory for cross-session analysis
      const state = await stateManager.read();
      const recentToolNames = toolCalls.slice(-20).map((t) => t.tool);
      const dominantDomains = detectDomainsFromTools(recentToolNames);
      const recentPatterns = state.patterns
        .filter((p) => p.lastSeen > sessionStartTime)
        .map((p) => p.description);

      try {
        await sessionMemory.createMemory(sessionData, dominantDomains, recentPatterns, {
          branch: currentBranch,
          focus: state.project.focus,
          keyActions: recentToolNames.slice(-5),
        });
      } catch {
        // Session memory is optional
      }

      if (toolCalls.length > 20) {
        await stateManager.addObservation(
          i18n.t("obs.intensive_session", { tools: toolCalls.length }),
        );
      }
      if (filesEdited.size > 10) {
        await stateManager.addMilestone(
          i18n.t("milestone.major_refactor", { files: filesEdited.size }),
        );
      }

      await client.tui.showToast({
        body: {
          message: i18n.t("log.session_ended", {
            duration: formatDuration(sessionDuration),
            tools: toolCalls.length,
            files: filesEdited.size,
          }),
          variant: "info",
        },
      });
    },

    tool: createTools(stateManager, directory, toolCalls, i18n),
  };
};

export default mimic;
