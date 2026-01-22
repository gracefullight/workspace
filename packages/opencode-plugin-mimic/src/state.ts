import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { State } from "@/types";

export const createDefaultState = (projectName: string): State => ({
  version: "0.1.0",
  project: {
    name: projectName,
    creatorLevel: null,
    firstSession: Date.now(),
    stack: [],
    focus: undefined,
  },
  journey: {
    observations: [],
    milestones: [],
    sessionCount: 0,
    lastSession: null,
  },
  patterns: [],
  evolution: {
    capabilities: [],
    lastEvolution: null,
    pendingSuggestions: [],
  },
  preferences: {
    suggestionEnabled: true,
    learningEnabled: true,
    minPatternCount: 3,
  },
  statistics: {
    totalSessions: 0,
    totalToolCalls: 0,
    filesModified: {},
    lastSessionId: null,
  },
});

export class StateManager {
  private readonly mimicDir: string;
  private readonly statePath: string;
  private readonly sessionsDir: string;
  private readonly projectName: string;

  constructor(directory: string) {
    this.mimicDir = join(directory, ".opencode", "mimic");
    this.statePath = join(this.mimicDir, "state.json");
    this.sessionsDir = join(this.mimicDir, "sessions");
    this.projectName = directory.split("/").pop() || "unknown";
  }

  async initialize(): Promise<void> {
    if (!existsSync(this.mimicDir)) {
      await mkdir(this.mimicDir, { recursive: true });
    }
    if (!existsSync(this.sessionsDir)) {
      await mkdir(this.sessionsDir, { recursive: true });
    }
    if (!existsSync(this.statePath)) {
      await this.save(createDefaultState(this.projectName));
    }
  }

  async read(): Promise<State> {
    return JSON.parse(await readFile(this.statePath, "utf-8"));
  }

  async save(state: State): Promise<void> {
    await writeFile(this.statePath, JSON.stringify(state, null, 2));
  }

  async addObservation(observation: string): Promise<void> {
    const state = await this.read();
    state.journey.observations.push({
      observation,
      timestamp: new Date().toISOString(),
    });
    if (state.journey.observations.length > 100) {
      state.journey.observations = state.journey.observations.slice(-100);
    }
    await this.save(state);
  }

  async addMilestone(milestone: string): Promise<void> {
    const state = await this.read();
    state.journey.milestones.push({
      milestone,
      timestamp: new Date().toISOString(),
    });
    await this.save(state);
  }

  async saveSession(sessionId: string, data: Record<string, unknown>): Promise<void> {
    await writeFile(join(this.sessionsDir, `${sessionId}.json`), JSON.stringify(data, null, 2));
  }

  getSessionsDir(): string {
    return this.sessionsDir;
  }

  getProjectName(): string {
    return this.projectName;
  }

  getStatePath(): string {
    return this.statePath;
  }
}
