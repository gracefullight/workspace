import type { Plugin } from "@opencode-ai/plugin";
import type { Event } from "@opencode-ai/sdk";
import type { MimicContext } from "@/context";
import { analyzeTimeSinceLastSession, formatDuration } from "@/format";
import { createI18n, loadMimicConfig, resolveLanguage } from "@/i18n";
import { detectPatterns, surfacePatterns } from "@/patterns";
import { StateManager } from "@/state";
import { createTools } from "@/tools";
import type { ToolCall } from "@/types";

export const mimic: Plugin = async ({ directory, client }) => {
  const stateManager = new StateManager(directory);
  await stateManager.initialize();
  const i18n = createI18n(resolveLanguage(await loadMimicConfig()));
  const ctx: MimicContext = { stateManager, directory, i18n, client };

  const sessionId = crypto.randomUUID();
  const sessionStartTime = Date.now();
  const toolCalls: ToolCall[] = [];
  const filesEdited: Set<string> = new Set();

  const handleSessionCreated = async () => {
    const state = await stateManager.read();
    const timeSince = analyzeTimeSinceLastSession(state.journey.lastSession);

    state.statistics.totalSessions += 1;
    state.statistics.lastSessionId = sessionId;
    state.journey.sessionCount += 1;
    state.journey.lastSession = new Date().toISOString();

    await stateManager.save(state);

    if (timeSince === "long-break") {
      await stateManager.addObservation(i18n.t("obs.returned_after_long_break"));
    }

    await client.tui.showToast({
      body: {
        message: i18n.t("log.session_started", {
          sessions: state.journey.sessionCount,
          patterns: state.patterns.length,
        }),
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
    if (!("properties" in event)) return;

    const filename = (event.properties as { filename?: string })?.filename;
    if (!filename) return;

    filesEdited.add(filename);
    const state = await stateManager.read();
    state.statistics.filesModified[filename] = (state.statistics.filesModified[filename] || 0) + 1;
    await stateManager.save(state);
  };

  return {
    async event({ event }: { event: Event }) {
      switch (event.type) {
        case "session.created":
          await handleSessionCreated();
          return;
        case "session.idle":
          await handleSessionIdle();
          return;
        case "file.edited":
          await handleFileEdited(event);
      }
    },

    async "tool.execute.after"(
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

      const toolPattern = input.tool;
      const existing = state.patterns.find(
        (p) => p.type === "tool" && p.description === toolPattern,
      );
      if (existing) {
        existing.count += 1;
        existing.lastSeen = Date.now();
      } else {
        state.patterns.push({
          id: crypto.randomUUID(),
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
