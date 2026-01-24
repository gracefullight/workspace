import type { MimicContext } from "@/core/context";
import { loadMimicConfig, type MimicUserConfig } from "@/lib/i18n";
import { normalizeDomain } from "@/modules/knowledge/instincts";
import { ObservationLog } from "@/modules/observation/log";
import type { Instinct, Pattern, SessionData } from "@/types";
import { generateDeterministicId } from "@/utils/id";

const MAX_INSTINCTS_PER_RUN = 5;
const OBSERVER_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

const DEFAULT_OBSERVER_MODEL = "opencode/glm-4.7";
const DEFAULT_OBSERVER_PROVIDER = "opencode";

interface ObserverInput {
  patterns: Pattern[];
  recentSessions: SessionData[];
  observations: string[];
  statistics: {
    totalSessions: number;
    totalToolCalls: number;
    topFiles: [string, number][];
  };
}

interface RawInstinct {
  title: string;
  description: string;
  domain: string;
  confidence: number;
  patternIDs: string[];
}

/**
 * Build the prompt for LLM-based pattern analysis
 */
function buildObserverPrompt(input: ObserverInput): string {
  const patternsSummary = input.patterns
    .slice(0, 20)
    .map((p) => `- [${p.type}] ${p.description} (${p.count}x, surfaced: ${p.surfaced})`)
    .join("\n");

  const observationsSummary = input.observations.slice(0, 50).join("\n");

  const filesSummary = input.statistics.topFiles
    .slice(0, 10)
    .map(([file, count]) => `- ${file}: ${count}x`)
    .join("\n");

  return `You are an observer agent that analyzes developer behavior patterns to create "instincts" - learned behaviors that can help automate workflows.

## Current Data

### Patterns (${input.patterns.length} total)
${patternsSummary || "No patterns detected yet."}

### Recent Observations (${input.observations.length} total)
${observationsSummary || "No observations yet."}

### Statistics
- Total sessions: ${input.statistics.totalSessions}
- Total tool calls: ${input.statistics.totalToolCalls}

### Most Modified Files
${filesSummary || "No file modifications recorded."}

## Your Task

Analyze the patterns and observations to identify 1-5 behavioral "instincts" the developer has. Look for:

1. **Repeated Sequences**: Same tools used in order 3+ times
2. **Preferences**: Certain tools always chosen over alternatives
3. **Code Style Patterns**: Consistent patterns in file modifications
4. **Workflow Patterns**: Common sequences of actions
5. **Testing Habits**: How tests are written/run
6. **Git Patterns**: Commit message styles, branching habits

## Output Format

Return a JSON array of instincts. Each instinct should have:
- title: Short descriptive name (max 50 chars)
- description: What this instinct represents (max 200 chars)
- domain: One of: code-style, testing, git, debugging, file-organization, tooling, refactoring, documentation, other
- confidence: 0.3-0.9 based on evidence strength
- patternIDs: Array of pattern IDs that support this instinct

Example output:
\`\`\`json
[
  {
    "title": "Prefers vitest for testing",
    "description": "Consistently uses vitest over jest for running tests, with watch mode preferred",
    "domain": "testing",
    "confidence": 0.75,
    "patternIDs": ["abc123", "def456"]
  }
]
\`\`\`

IMPORTANT:
- Only return the JSON array, no other text
- Minimum 3 occurrences for behavioral instincts
- Keep confidence calibrated - don't overstate
- Avoid duplicating obvious patterns
- Focus on actionable insights

Return your analysis:`;
}

/**
 * Parse LLM response into raw instincts
 */
function parseInstinctsFromResponse(response: string): RawInstinct[] {
  try {
    // Extract JSON from response (may have markdown code blocks)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      return [];
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is RawInstinct =>
          typeof item.title === "string" &&
          typeof item.description === "string" &&
          typeof item.domain === "string" &&
          typeof item.confidence === "number",
      )
      .map((item) => ({
        ...item,
        patternIDs: Array.isArray(item.patternIDs) ? item.patternIDs : [],
        confidence: Math.min(0.9, Math.max(0.3, item.confidence)),
      }))
      .slice(0, MAX_INSTINCTS_PER_RUN);
  } catch {
    return [];
  }
}

/**
 * Heuristic-based pattern analysis (fallback when LLM not available)
 */
/**
 * Heuristic-based pattern analysis (fallback when LLM not available)
 */
function analyzePatterns(input: ObserverInput): RawInstinct[] {
  const instincts: RawInstinct[] = [
    ...extractToolInstincts(input.patterns),
    ...extractFileInstincts(input.patterns),
    ...extractCommitInstincts(input.patterns),
    ...extractSequenceInstincts(input.patterns),
    ...extractHotspotInstincts(input.statistics.topFiles),
  ];

  return instincts.slice(0, MAX_INSTINCTS_PER_RUN);
}

function extractToolInstincts(patterns: Pattern[]): RawInstinct[] {
  const toolPatterns = patterns.filter((p) => p.type === "tool" && p.count >= 5);
  if (toolPatterns.length < 3) return [];

  const topTools = toolPatterns
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((p) => p.description);

  return [
    {
      title: `Preferred tools: ${topTools.slice(0, 3).join(", ")}`,
      description: `Frequently uses ${topTools.join(", ")} based on ${toolPatterns.reduce((sum, p) => sum + p.count, 0)} observations`,
      domain: "tooling",
      confidence: Math.min(0.9, 0.5 + toolPatterns.length * 0.1),
      patternIDs: toolPatterns.map((p) => p.id),
    },
  ];
}

function extractFileInstincts(patterns: Pattern[]): RawInstinct[] {
  const filePatterns = patterns.filter((p) => p.type === "file" && p.count >= 5);
  if (filePatterns.length < 2) return [];

  const extensions = new Set<string>();
  for (const p of filePatterns) {
    const ext = p.description.split(".").pop();
    if (ext) extensions.add(ext);
  }

  return [
    {
      title: `Focus on ${Array.from(extensions).slice(0, 3).join(", ")} files`,
      description: `Frequently modifies files with extensions: ${Array.from(extensions).join(", ")}`,
      domain: "file-organization",
      confidence: Math.min(0.85, 0.5 + filePatterns.length * 0.08),
      patternIDs: filePatterns.map((p) => p.id),
    },
  ];
}

function extractCommitInstincts(patterns: Pattern[]): RawInstinct[] {
  const commitPatterns = patterns.filter((p) => p.type === "commit" && p.count >= 3);
  if (commitPatterns.length < 2) return [];

  const prefixes = commitPatterns
    .map((p) => p.description.split(":")[0] || p.description.split(" ")[0])
    .filter(Boolean);

  const uniquePrefixes = [...new Set(prefixes)];
  if (uniquePrefixes.length === 0) return [];

  return [
    {
      title: `Commit style: ${uniquePrefixes.slice(0, 3).join(", ")}`,
      description: `Uses commit message patterns like: ${uniquePrefixes.join(", ")}`,
      domain: "git",
      confidence: Math.min(0.8, 0.5 + commitPatterns.length * 0.1),
      patternIDs: commitPatterns.map((p) => p.id),
    },
  ];
}

function extractSequenceInstincts(patterns: Pattern[]): RawInstinct[] {
  const sequencePatterns = patterns.filter((p) => p.type === "sequence" && p.count >= 3);
  const instincts: RawInstinct[] = [];

  for (const seq of sequencePatterns.slice(0, 2)) {
    let domain = "tooling";
    const desc = seq.description.toLowerCase();
    if (desc.includes("test")) domain = "testing";
    else if (desc.includes("debug") || desc.includes("error")) domain = "debugging";
    else if (desc.includes("refactor")) domain = "refactoring";

    instincts.push({
      title: `Workflow: ${seq.description}`,
      description: `Repeats sequence "${seq.description}" (${seq.count}x observed)`,
      domain,
      confidence: Math.min(0.85, 0.5 + seq.count * 0.05),
      patternIDs: [seq.id],
    });
  }

  return instincts;
}

function extractHotspotInstincts(topFiles: [string, number][]): RawInstinct[] {
  if (topFiles.length < 3) return [];

  const hotspots = topFiles.slice(0, 5);
  const totalMods = hotspots.reduce((sum, [, count]) => sum + count, 0);

  if (totalMods < 10) return [];

  return [
    {
      title: "Hotspot files identified",
      description: `Frequently modified files: ${hotspots.map(([f]) => f.split("/").pop()).join(", ")}`,
      domain: "file-organization",
      confidence: Math.min(0.75, 0.4 + totalMods * 0.02),
      patternIDs: [],
    },
  ];
}

/**
 * Run LLM-based pattern analysis
 */
async function analyzePatternsWithLLM(
  ctx: MimicContext,
  input: ObserverInput,
  config: MimicUserConfig,
): Promise<RawInstinct[]> {
  if (!ctx.client) {
    return analyzePatterns(input);
  }

  const observerConfig = "observer" in config ? config.observer : undefined;
  const rawModelId = observerConfig?.model || DEFAULT_OBSERVER_MODEL;
  // Extract provider and model from model ID (e.g., "anthropic/claude-3-haiku" -> provider: "anthropic", model: "claude-3-haiku")
  const hasSlash = rawModelId.includes("/");
  const extractedProvider = hasSlash ? rawModelId.split("/")[0] : undefined;
  const modelId = hasSlash ? rawModelId.split("/").slice(1).join("/") : rawModelId;
  const providerId = observerConfig?.provider || extractedProvider || DEFAULT_OBSERVER_PROVIDER;

  try {
    const prompt = buildObserverPrompt(input);

    // Create a temporary session for analysis
    const session = await ctx.client.session.create({
      body: { title: "Mimic Observer Analysis" },
    });

    if (!session.data?.id) {
      return analyzePatterns(input);
    }

    // Send the analysis prompt using session.prompt
    const response = await ctx.client.session.prompt({
      path: { id: session.data.id },
      body: {
        model: {
          providerID: providerId,
          modelID: modelId,
        },
        parts: [{ type: "text" as const, text: prompt }],
      },
    });

    // Extract text from response parts
    const responseParts = response.data?.parts || [];
    let responseText = "";
    for (const part of responseParts) {
      if ("text" in part && typeof part.text === "string") {
        responseText = part.text;
        break;
      }
    }

    if (!responseText) {
      // Delete the temporary session
      await ctx.client.session.delete({ path: { id: session.data.id } }).catch(() => {});
      return analyzePatterns(input);
    }

    const llmInstincts = parseInstinctsFromResponse(responseText);

    // Delete the temporary session
    await ctx.client.session.delete({ path: { id: session.data.id } }).catch(() => {});

    return llmInstincts.length > 0 ? llmInstincts : analyzePatterns(input);
  } catch {
    // Fallback to heuristic analysis on any LLM error
    return analyzePatterns(input);
  }
}

export async function shouldRunObserver(ctx: MimicContext): Promise<boolean> {
  const state = await ctx.stateManager.read();

  if (!state.preferences.learningEnabled) {
    return false;
  }

  if (!state.evolution.lastObserverRun) {
    return true;
  }

  const lastRun = new Date(state.evolution.lastObserverRun).getTime();
  const now = Date.now();

  return now - lastRun >= OBSERVER_COOLDOWN_MS;
}

export async function runObserver(ctx: MimicContext): Promise<Instinct[]> {
  const state = await ctx.stateManager.read();
  const config = await loadMimicConfig().catch(() => ({}));
  const newInstincts: Instinct[] = [];

  const recentPatterns = state.patterns.filter((p) => {
    const age = Date.now() - p.lastSeen;
    return age < 7 * 24 * 60 * 60 * 1000; // 7 days
  });

  if (recentPatterns.length === 0) {
    state.evolution.lastObserverRun = new Date().toISOString();
    await ctx.stateManager.save(state);
    return [];
  }

  // Load recent observations from JSONL
  const mimicDir = ctx.stateManager.getInstinctsDir().replace("/instincts", "");
  const observationLog = new ObservationLog(mimicDir);
  const recentObs = await observationLog.getRecentObservations(7);
  const observations = recentObs.map((o) => `[${o.type}] ${JSON.stringify(o.data)}`);

  const topFiles = Object.entries(state.statistics.filesModified)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) as [string, number][];

  const input: ObserverInput = {
    patterns: recentPatterns,
    recentSessions: [],
    observations,
    statistics: {
      totalSessions: state.statistics.totalSessions,
      totalToolCalls: state.statistics.totalToolCalls,
      topFiles,
    },
  };

  // Use LLM if enabled, otherwise fall back to heuristics
  const observerCfg = "observer" in config ? config.observer : undefined;
  const useLLM = observerCfg?.enabled !== false && (observerCfg?.model || ctx.client);
  const rawInstincts = useLLM
    ? await analyzePatternsWithLLM(ctx, input, config)
    : analyzePatterns(input);

  for (const raw of rawInstincts) {
    const domain = normalizeDomain(raw.domain);
    const id = generateDeterministicId(domain, raw.title);

    if (await ctx.stateManager.hasInstinct(id)) {
      continue;
    }

    const instinct: Instinct = {
      id,
      title: raw.title,
      description: raw.description,
      domain,
      confidence: raw.confidence,
      status: "approved",
      source: "personal",
      createdAt: new Date().toISOString(),
      evidence: {
        patternIDs: raw.patternIDs,
      },
    };

    await ctx.stateManager.writeInstinct(instinct);
    newInstincts.push(instinct);
  }

  state.evolution.lastObserverRun = new Date().toISOString();
  await ctx.stateManager.save(state);

  return newInstincts;
}
