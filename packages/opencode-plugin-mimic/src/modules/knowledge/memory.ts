import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Domain, SessionData } from "@/types";
import { generateId } from "@/utils/id";

/**
 * Session context summary for cross-session analysis
 */
export interface SessionMemory {
  sessionId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  summary: {
    toolCalls: number;
    filesEdited: string[];
    dominantDomains: Domain[];
    patterns: string[];
  };
  context: {
    branch?: string;
    focus?: string;
    keyActions: string[];
  };
}

/**
 * Session pattern detected across multiple sessions
 */
export interface CrossSessionPattern {
  id: string;
  type: "workflow" | "time" | "focus" | "tool-combo";
  description: string;
  frequency: number;
  confidence: number;
  sessionIds: string[];
  lastSeen: string;
}

const MAX_MEMORIES = 50;
const RECENT_SESSIONS_FOR_ANALYSIS = 10;

/**
 * Manages session-level memory and cross-session pattern detection.
 * Enables the plugin to learn from session history and identify recurring workflows.
 */
export class SessionMemoryManager {
  private readonly memoryPath: string;
  private readonly sessionsDir: string;

  constructor(mimicDir: string, sessionsDir: string) {
    this.memoryPath = join(mimicDir, "session-memory.json");
    this.sessionsDir = sessionsDir;
  }

  /**
   * Load all session memories
   */
  async loadMemories(): Promise<SessionMemory[]> {
    if (!existsSync(this.memoryPath)) {
      return [];
    }
    try {
      const content = await readFile(this.memoryPath, "utf-8");
      const data = JSON.parse(content);
      return data.memories || [];
    } catch {
      return [];
    }
  }

  /**
   * Save session memories
   */
  async saveMemories(memories: SessionMemory[]): Promise<void> {
    // Keep only the most recent memories
    const trimmed = memories.slice(-MAX_MEMORIES);
    await writeFile(
      this.memoryPath,
      JSON.stringify({ memories: trimmed, updatedAt: new Date().toISOString() }, null, 2),
      "utf-8",
    );
  }

  /**
   * Create a memory from a completed session
   */
  async createMemory(
    sessionData: SessionData,
    domains: Domain[],
    patterns: string[],
    context: SessionMemory["context"],
  ): Promise<SessionMemory> {
    const memory: SessionMemory = {
      sessionId: sessionData.sessionId,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      durationMs: sessionData.durationMs,
      summary: {
        toolCalls: sessionData.toolCalls,
        filesEdited: sessionData.filesEdited,
        dominantDomains: domains.slice(0, 3) as Domain[],
        patterns,
      },
      context,
    };

    const memories = await this.loadMemories();
    memories.push(memory);
    await this.saveMemories(memories);

    return memory;
  }

  /**
   * Get recent sessions for context
   */
  async getRecentMemories(count: number = RECENT_SESSIONS_FOR_ANALYSIS): Promise<SessionMemory[]> {
    const memories = await this.loadMemories();
    return memories.slice(-count);
  }

  /**
   * Load raw session data from session files
   */
  async loadRecentSessions(count: number = RECENT_SESSIONS_FOR_ANALYSIS): Promise<SessionData[]> {
    if (!existsSync(this.sessionsDir)) {
      return [];
    }

    const files = await readdir(this.sessionsDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json")).slice(-count);

    const sessions: SessionData[] = [];
    for (const file of jsonFiles) {
      try {
        const content = await readFile(join(this.sessionsDir, file), "utf-8");
        sessions.push(JSON.parse(content));
      } catch {
        // Skip invalid files
      }
    }

    return sessions.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }

  /**
   * Analyze cross-session patterns
   */
  async analyzeCrossSessionPatterns(): Promise<CrossSessionPattern[]> {
    const memories = await this.getRecentMemories();
    if (memories.length < 3) {
      return [];
    }

    const patterns: CrossSessionPattern[] = [];

    // Detect workflow patterns (repeated sequences of domains)
    const domainSequences = new Map<string, { count: number; sessions: string[] }>();
    for (const memory of memories) {
      const key = memory.summary.dominantDomains.join(" → ");
      if (key) {
        const existing = domainSequences.get(key) || { count: 0, sessions: [] };
        existing.count++;
        existing.sessions.push(memory.sessionId);
        domainSequences.set(key, existing);
      }
    }

    for (const [sequence, data] of domainSequences) {
      if (data.count >= 2) {
        patterns.push({
          id: `workflow-${generateId(8)}`,
          type: "workflow",
          description: `Workflow pattern: ${sequence}`,
          frequency: data.count,
          confidence: Math.min(0.9, 0.5 + data.count * 0.1),
          sessionIds: data.sessions,
          lastSeen: memories[memories.length - 1].endTime,
        });
      }
    }

    // Detect time-based patterns (sessions at similar times)
    const hourCounts = new Map<number, { count: number; sessions: string[] }>();
    for (const memory of memories) {
      const hour = new Date(memory.startTime).getHours();
      const bucket = Math.floor(hour / 3) * 3; // 3-hour buckets
      const existing = hourCounts.get(bucket) || { count: 0, sessions: [] };
      existing.count++;
      existing.sessions.push(memory.sessionId);
      hourCounts.set(bucket, existing);
    }

    for (const [bucket, data] of hourCounts) {
      if (data.count >= 3) {
        const timeLabel = `${bucket}:00-${bucket + 3}:00`;
        patterns.push({
          id: `time-${bucket}`,
          type: "time",
          description: `Peak activity window: ${timeLabel}`,
          frequency: data.count,
          confidence: Math.min(0.8, data.count / memories.length),
          sessionIds: data.sessions,
          lastSeen: memories[memories.length - 1].endTime,
        });
      }
    }

    // Detect focus patterns (repeated focus areas)
    const focusCounts = new Map<string, { count: number; sessions: string[] }>();
    for (const memory of memories) {
      if (memory.context.focus) {
        const existing = focusCounts.get(memory.context.focus) || { count: 0, sessions: [] };
        existing.count++;
        existing.sessions.push(memory.sessionId);
        focusCounts.set(memory.context.focus, existing);
      }
    }

    for (const [focus, data] of focusCounts) {
      if (data.count >= 2) {
        patterns.push({
          id: `focus-${generateId(8)}`,
          type: "focus",
          description: `Repeated focus: ${focus}`,
          frequency: data.count,
          confidence: Math.min(0.85, 0.5 + data.count * 0.15),
          sessionIds: data.sessions,
          lastSeen: memories[memories.length - 1].endTime,
        });
      }
    }

    // Detect tool combination patterns
    const toolCombos = new Map<string, { count: number; sessions: string[] }>();
    for (const memory of memories) {
      if (memory.summary.patterns.length >= 2) {
        const key = memory.summary.patterns.slice(0, 3).join("+");
        const existing = toolCombos.get(key) || { count: 0, sessions: [] };
        existing.count++;
        existing.sessions.push(memory.sessionId);
        toolCombos.set(key, existing);
      }
    }

    for (const [combo, data] of toolCombos) {
      if (data.count >= 2) {
        patterns.push({
          id: `combo-${generateId(8)}`,
          type: "tool-combo",
          description: `Tool combination: ${combo}`,
          frequency: data.count,
          confidence: Math.min(0.8, 0.5 + data.count * 0.1),
          sessionIds: data.sessions,
          lastSeen: memories[memories.length - 1].endTime,
        });
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  /**
   * Get context summary for the current session
   */
  async getContextSummary(): Promise<string> {
    const memories = await this.getRecentMemories(5);
    if (memories.length === 0) {
      return "No previous session context available.";
    }

    const parts: string[] = [];

    // Last session info
    const last = memories[memories.length - 1];
    const lastDate = new Date(last.endTime);
    const hoursAgo = Math.round((Date.now() - lastDate.getTime()) / (1000 * 60 * 60));
    parts.push(`Last session: ${hoursAgo}h ago, ${last.summary.toolCalls} tool calls`);

    // Dominant domains
    const allDomains = memories.flatMap((m) => m.summary.dominantDomains);
    const domainCounts = new Map<string, number>();
    for (const d of allDomains) {
      domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
    }
    const topDomains = [...domainCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([d]) => d);
    if (topDomains.length > 0) {
      parts.push(`Focus areas: ${topDomains.join(", ")}`);
    }

    // Recent patterns
    const crossPatterns = await this.analyzeCrossSessionPatterns();
    if (crossPatterns.length > 0) {
      const topPattern = crossPatterns[0];
      parts.push(`Notable pattern: ${topPattern.description} (${topPattern.frequency}x)`);
    }

    return parts.join("\n");
  }

  /**
   * Get session continuity hints for the AI
   */
  async getContinuityHints(): Promise<string[]> {
    const memories = await this.getRecentMemories(3);
    const hints: string[] = [];

    if (memories.length === 0) {
      return hints;
    }

    const last = memories[memories.length - 1];

    // Suggest continuing work on recently edited files
    if (last.summary.filesEdited.length > 0) {
      const recentFiles = last.summary.filesEdited.slice(0, 3);
      hints.push(`Recent files: ${recentFiles.map((f) => f.split("/").pop()).join(", ")}`);
    }

    // Suggest based on focus
    if (last.context.focus) {
      hints.push(`Previous focus: ${last.context.focus}`);
    }

    // Check for unfinished work patterns
    if (last.durationMs < 5 * 60 * 1000 && last.summary.toolCalls < 5) {
      hints.push("Previous session was brief - may have unfinished work");
    }

    return hints;
  }
}

/**
 * Detect dominant domains from tool calls
 */
export function detectDomainsFromTools(tools: string[]): Domain[] {
  const domainScores = new Map<Domain, number>();

  const toolDomainMap: Record<string, Domain> = {
    // Testing
    vitest: "testing",
    jest: "testing",
    test: "testing",
    // Git
    git: "git",
    commit: "git",
    push: "git",
    // Debugging
    debug: "debugging",
    log: "debugging",
    trace: "debugging",
    // File organization
    mkdir: "file-organization",
    mv: "file-organization",
    rename: "file-organization",
    // Tooling
    npm: "tooling",
    pnpm: "tooling",
    yarn: "tooling",
    // Refactoring
    refactor: "refactoring",
    extract: "refactoring",
    // Documentation
    doc: "documentation",
    readme: "documentation",
    // Code style
    lint: "code-style",
    format: "code-style",
    prettier: "code-style",
    eslint: "code-style",
    biome: "code-style",
  };

  for (const tool of tools) {
    const lower = tool.toLowerCase();
    for (const [keyword, domain] of Object.entries(toolDomainMap)) {
      if (lower.includes(keyword)) {
        domainScores.set(domain, (domainScores.get(domain) || 0) + 1);
      }
    }
  }

  return [...domainScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);
}
