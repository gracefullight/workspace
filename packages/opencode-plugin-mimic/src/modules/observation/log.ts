import { existsSync } from "node:fs";
import { appendFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateId } from "@/utils/id";

/**
 * Observation types for JSONL logging
 */
export type ObservationType =
  | "tool.call"
  | "message.user"
  | "message.assistant"
  | "session.start"
  | "session.end"
  | "file.edit"
  | "command"
  | "vcs.branch"
  | "pattern.detected"
  | "instinct.created"
  | "evolution.triggered";

export interface ObservationEntry {
  id: string;
  type: ObservationType;
  timestamp: string;
  sessionId?: string;
  data: Record<string, unknown>;
}

export interface ObservationQuery {
  types?: ObservationType[];
  startDate?: Date;
  endDate?: Date;
  sessionId?: string;
  limit?: number;
}

const ARCHIVE_THRESHOLD = 5 * 1024 * 1024; // 5MB

/**
 * Manages JSONL-based observation logging for the Mimic plugin.
 * Provides real-time event capture and historical query capabilities.
 */
export class ObservationLog {
  private readonly logPath: string;
  private readonly archiveDir: string;

  constructor(mimicDir: string) {
    this.logPath = join(mimicDir, "observations.jsonl");
    this.archiveDir = join(mimicDir, "archives");
  }

  /**
   * Initialize the observation log directory structure
   */
  async initialize(): Promise<void> {
    const dir = join(this.logPath, "..");
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    if (!existsSync(this.archiveDir)) {
      await mkdir(this.archiveDir, { recursive: true });
    }
  }

  /**
   * Append a new observation entry to the log
   */
  async append(entry: Omit<ObservationEntry, "id" | "timestamp">): Promise<ObservationEntry> {
    const fullEntry: ObservationEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    const line = `${JSON.stringify(fullEntry)}\n`;
    await appendFile(this.logPath, line, "utf-8");

    // Check if rotation is needed
    await this.maybeRotate();

    return fullEntry;
  }

  /**
   * Log a tool call observation
   */
  async logToolCall(
    tool: string,
    callId: string,
    sessionId: string,
    args?: Record<string, unknown>,
  ): Promise<ObservationEntry> {
    return this.append({
      type: "tool.call",
      sessionId,
      data: { tool, callId, args },
    });
  }

  /**
   * Log a user message observation
   */
  async logUserMessage(
    sessionId: string,
    messageId: string,
    textPreview?: string,
  ): Promise<ObservationEntry> {
    return this.append({
      type: "message.user",
      sessionId,
      data: {
        messageId,
        // Only store first 200 chars to avoid storing sensitive data
        textPreview: textPreview?.slice(0, 200),
      },
    });
  }

  /**
   * Log an assistant message observation
   */
  async logAssistantMessage(
    sessionId: string,
    messageId: string,
    tokensUsed?: number,
  ): Promise<ObservationEntry> {
    return this.append({
      type: "message.assistant",
      sessionId,
      data: { messageId, tokensUsed },
    });
  }

  /**
   * Log a file edit observation
   */
  async logFileEdit(file: string, sessionId?: string): Promise<ObservationEntry> {
    return this.append({
      type: "file.edit",
      sessionId,
      data: { file, extension: file.split(".").pop() },
    });
  }

  /**
   * Log a command execution observation
   */
  async logCommand(command: string, sessionId: string, args?: string): Promise<ObservationEntry> {
    return this.append({
      type: "command",
      sessionId,
      data: { command, args },
    });
  }

  /**
   * Log a VCS branch change observation
   */
  async logBranchChange(branch: string | undefined): Promise<ObservationEntry> {
    return this.append({
      type: "vcs.branch",
      data: { branch },
    });
  }

  /**
   * Log a session start observation
   */
  async logSessionStart(sessionId: string): Promise<ObservationEntry> {
    return this.append({
      type: "session.start",
      sessionId,
      data: {},
    });
  }

  /**
   * Log a session end observation
   */
  async logSessionEnd(
    sessionId: string,
    durationMs: number,
    toolCallCount: number,
  ): Promise<ObservationEntry> {
    return this.append({
      type: "session.end",
      sessionId,
      data: { durationMs, toolCallCount },
    });
  }

  /**
   * Query observations with filters
   */
  async query(options: ObservationQuery = {}): Promise<ObservationEntry[]> {
    if (!existsSync(this.logPath)) {
      return [];
    }

    const content = await readFile(this.logPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    let entries: ObservationEntry[] = [];

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as ObservationEntry;
        entries.push(entry);
      } catch {
        // Skip malformed lines
      }
    }

    // Apply filters
    const filterTypes = options.types;
    if (filterTypes && filterTypes.length > 0) {
      entries = entries.filter((e) => filterTypes.includes(e.type));
    }

    if (options.sessionId) {
      entries = entries.filter((e) => e.sessionId === options.sessionId);
    }

    if (options.startDate) {
      const start = options.startDate.getTime();
      entries = entries.filter((e) => new Date(e.timestamp).getTime() >= start);
    }

    if (options.endDate) {
      const end = options.endDate.getTime();
      entries = entries.filter((e) => new Date(e.timestamp).getTime() <= end);
    }

    // Sort by timestamp descending (most recent first)
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (options.limit && options.limit > 0) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  /**
   * Get observations from the last N days
   */
  async getRecentObservations(
    days: number,
    types?: ObservationType[],
  ): Promise<ObservationEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return this.query({ startDate, types });
  }

  /**
   * Get observation count by type
   */
  async getStats(): Promise<Record<ObservationType, number>> {
    const entries = await this.query();
    const stats: Record<string, number> = {};

    for (const entry of entries) {
      stats[entry.type] = (stats[entry.type] || 0) + 1;
    }

    return stats as Record<ObservationType, number>;
  }

  /**
   * Check and rotate log file if it exceeds threshold
   */
  private async maybeRotate(): Promise<boolean> {
    if (!existsSync(this.logPath)) {
      return false;
    }

    const stats = await stat(this.logPath);
    if (stats.size < ARCHIVE_THRESHOLD) {
      return false;
    }

    // Create archive with timestamp
    const archiveName = `observations-${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`;
    const archivePath = join(this.archiveDir, archiveName);

    const content = await readFile(this.logPath, "utf-8");
    await writeFile(archivePath, content, "utf-8");

    // Clear current log
    await writeFile(this.logPath, "", "utf-8");

    return true;
  }

  /**
   * Prune old observations (keep last N days)
   */
  async prune(keepDays: number): Promise<number> {
    const entries = await this.query();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - keepDays);
    const cutoffTime = cutoff.getTime();

    const keep = entries.filter((e) => new Date(e.timestamp).getTime() >= cutoffTime);
    const pruned = entries.length - keep.length;

    if (pruned > 0) {
      const content = `${keep.map((e) => JSON.stringify(e)).join("\n")}\n`;
      await writeFile(this.logPath, content, "utf-8");
    }

    return pruned;
  }

  /**
   * Get the current log file size in bytes
   */
  async getLogSize(): Promise<number> {
    if (!existsSync(this.logPath)) {
      return 0;
    }
    const stats = await stat(this.logPath);
    return stats.size;
  }
}
