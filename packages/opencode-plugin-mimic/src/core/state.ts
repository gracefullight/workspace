import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Domain, ErrorPattern, Instinct, Macro, State } from "@/types";

const STATE_JSON_GITIGNORE_LINE = ".opencode/mimic/";

export const createDefaultState = (projectName: string): State => ({
  version: "0.1.0",
  project: {
    name: projectName,
    creatorLevel: null,
    firstSession: Date.now(),
    stack: [],
    focus: undefined,
    identity: undefined,
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
    lastObserverRun: null,
    evolvedDomains: {},
    instinctIndex: {},
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
    toolSequences: [],
  },
});

export class StateManager {
  private readonly mimicDir: string;
  private readonly statePath: string;
  private readonly sessionsDir: string;
  private readonly instinctsDir: string;
  private readonly errorPatternsDir: string;
  private readonly macrosDir: string;
  private readonly projectName: string;

  constructor(directory: string) {
    this.mimicDir = join(directory, ".opencode", "mimic");
    this.statePath = join(this.mimicDir, "state.json");
    this.sessionsDir = join(this.mimicDir, "sessions");
    this.instinctsDir = join(this.mimicDir, "instincts");
    this.errorPatternsDir = join(this.mimicDir, "error-patterns");
    this.macrosDir = join(this.mimicDir, "macros");
    this.projectName = directory.split("/").pop() || "unknown";
  }

  async ensureGitIgnore(): Promise<void> {
    const gitIgnorePath = join(this.mimicDir, "..", "..", ".gitignore");

    if (!existsSync(gitIgnorePath)) {
      await writeFile(gitIgnorePath, `${STATE_JSON_GITIGNORE_LINE}\n`, "utf-8");
      return;
    }

    const content = await readFile(gitIgnorePath, "utf-8");
    const lines = content.split(/\r?\n/);
    const alreadyExists = lines.some((line) => line.trim() === STATE_JSON_GITIGNORE_LINE);

    if (!alreadyExists) {
      await writeFile(gitIgnorePath, `${content}\n${STATE_JSON_GITIGNORE_LINE}\n`, "utf-8");
    }
  }

  async initialize(): Promise<void> {
    await this.ensureGitIgnore();

    if (!existsSync(this.mimicDir)) {
      await mkdir(this.mimicDir, { recursive: true });
    }
    if (!existsSync(this.sessionsDir)) {
      await mkdir(this.sessionsDir, { recursive: true });
    }
    if (!existsSync(this.instinctsDir)) {
      await mkdir(this.instinctsDir, { recursive: true });
    }
    if (!existsSync(this.errorPatternsDir)) {
      await mkdir(this.errorPatternsDir, { recursive: true });
    }
    if (!existsSync(this.macrosDir)) {
      await mkdir(this.macrosDir, { recursive: true });
    }
    if (!existsSync(this.statePath)) {
      await this.save(createDefaultState(this.projectName));
    }
  }

  async read(): Promise<State> {
    if (!existsSync(this.statePath)) {
      await this.initialize();
    }
    return JSON.parse(await readFile(this.statePath, "utf-8"));
  }

  async save(state: State): Promise<void> {
    if (!existsSync(this.mimicDir)) {
      await mkdir(this.mimicDir, { recursive: true });
    }
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

  getInstinctsDir(): string {
    return this.instinctsDir;
  }

  async writeInstinct(instinct: Instinct): Promise<string> {
    const filePath = join(this.instinctsDir, `${instinct.id}.json`);
    await writeFile(filePath, JSON.stringify(instinct, null, 2));

    // Update index in state
    const state = await this.read();
    if (!state.evolution.instinctIndex) {
      state.evolution.instinctIndex = {};
    }
    state.evolution.instinctIndex[instinct.id] = {
      domain: instinct.domain,
      status: instinct.status,
      confidence: instinct.confidence,
      createdAt: instinct.createdAt,
    };
    await this.save(state);

    return filePath;
  }

  async listInstincts(): Promise<Instinct[]> {
    const files = await readdir(this.instinctsDir).catch(() => []);
    const instincts: Instinct[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const content = await readFile(join(this.instinctsDir, file), "utf-8");
        instincts.push(JSON.parse(content));
      } catch {
        // Skip invalid files
      }
    }

    return instincts;
  }

  async hasInstinct(id: string): Promise<boolean> {
    const state = await this.read();
    return !!state.evolution.instinctIndex?.[id];
  }

  async initializeIdentity(): Promise<void> {
    const state = await this.read();
    if (!state.project.identity) {
      state.project.identity = {
        awakened: new Date().toISOString(),
        personality: this.pickPersonality(),
        totalInstinctsLearned: 0,
        totalEvolutions: 0,
        favoriteDomainsRank: [],
      };
      await this.save(state);
    }
  }

  private pickPersonality(): string {
    const personalities = ["curious", "efficient", "playful", "vigilant", "methodical"];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  async exportInstincts(): Promise<{
    instincts: Instinct[];
    metadata: { exportedAt: string; projectName: string; count: number };
  }> {
    const instincts = await this.listInstincts();
    const personalInstincts = instincts.filter((i) => i.source === "personal" || !i.source);

    return {
      instincts: personalInstincts,
      metadata: {
        exportedAt: new Date().toISOString(),
        projectName: this.projectName,
        count: personalInstincts.length,
      },
    };
  }

  async importInstincts(instincts: Instinct[], fromProject: string): Promise<number> {
    let imported = 0;

    for (const instinct of instincts) {
      if (await this.hasInstinct(instinct.id)) {
        continue;
      }

      const inheritedInstinct: Instinct = {
        ...instinct,
        id: `inherited-${instinct.id}`,
        source: "inherited",
        createdAt: new Date().toISOString(),
        evidence: {
          ...instinct.evidence,
          examples: [`Imported from ${fromProject}`],
        },
      };

      await this.writeInstinct(inheritedInstinct);
      imported++;
    }

    return imported;
  }

  async recordToolSequence(tools: string[]): Promise<void> {
    if (tools.length < 2) return;

    const state = await this.read();
    if (!state.statistics.toolSequences) {
      state.statistics.toolSequences = [];
    }

    const sequenceKey = tools.slice(-3).join(" → ");
    const existing = state.statistics.toolSequences.find(
      (s) => s.tools.join(" → ") === sequenceKey,
    );

    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
    } else {
      state.statistics.toolSequences.push({
        tools: tools.slice(-3),
        count: 1,
        lastSeen: Date.now(),
      });
    }

    state.statistics.toolSequences.sort((a, b) => b.count - a.count);
    state.statistics.toolSequences = state.statistics.toolSequences.slice(0, 20);

    await this.save(state);
  }

  async updateIdentityStats(): Promise<void> {
    const state = await this.read();
    if (!state.project.identity) return;

    const instincts = await this.listInstincts();
    state.project.identity.totalInstinctsLearned = instincts.filter(
      (i) => i.source !== "inherited",
    ).length;
    state.project.identity.totalEvolutions = state.evolution.capabilities.length;

    const domainCounts = new Map<string, number>();
    for (const instinct of instincts) {
      domainCounts.set(instinct.domain, (domainCounts.get(instinct.domain) || 0) + 1);
    }

    state.project.identity.favoriteDomainsRank = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain]) => domain) as Domain[];

    await this.save(state);
  }

  async listErrorPatterns(): Promise<ErrorPattern[]> {
    const files = await readdir(this.errorPatternsDir).catch(() => []);
    const patterns: ErrorPattern[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const content = await readFile(join(this.errorPatternsDir, file), "utf-8");
        patterns.push(JSON.parse(content));
      } catch {
        // Skip invalid files
      }
    }

    return patterns;
  }

  async writeErrorPattern(pattern: ErrorPattern): Promise<void> {
    const filePath = join(this.errorPatternsDir, `${pattern.id}.json`);
    await writeFile(filePath, JSON.stringify(pattern, null, 2));
  }

  async getErrorPattern(id: string): Promise<ErrorPattern | null> {
    const filePath = join(this.errorPatternsDir, `${id}.json`);
    if (!existsSync(filePath)) return null;

    try {
      const content = await readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  getMacrosDir(): string {
    return this.macrosDir;
  }

  async listMacros(): Promise<Macro[]> {
    const files = await readdir(this.macrosDir).catch(() => []);
    const macros: Macro[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const content = await readFile(join(this.macrosDir, file), "utf-8");
        macros.push(JSON.parse(content));
      } catch {
        // Skip invalid files
      }
    }

    return macros.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async writeMacro(macro: Macro): Promise<void> {
    if (!existsSync(this.macrosDir)) {
      await mkdir(this.macrosDir, { recursive: true });
    }
    const filePath = join(this.macrosDir, `${macro.id}.json`);
    await writeFile(filePath, JSON.stringify(macro, null, 2));
  }

  async getMacro(id: string): Promise<Macro | null> {
    const filePath = join(this.macrosDir, `${id}.json`);
    if (!existsSync(filePath)) return null;

    try {
      const content = await readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async deleteMacro(id: string): Promise<boolean> {
    const filePath = join(this.macrosDir, `${id}.json`);
    if (!existsSync(filePath)) return false;

    try {
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
