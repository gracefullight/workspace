export interface Observation {
  observation: string;
  timestamp: string;
}

export interface Milestone {
  milestone: string;
  timestamp: string;
}

export interface Pattern {
  id: string;
  type: "tool" | "file" | "commit" | "sequence";
  description: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  surfaced: boolean;
  examples: unknown[];
}

export type CreatorLevel = "technical" | "semi-technical" | "non-technical" | "chaotic";

export type CapabilityType = "command" | "skill" | "hook" | "shortcut" | "agent" | "mcp";

export interface EvolvedCapability {
  id: string;
  type: CapabilityType;
  name: string;
  description: string;
  createdAt: string;
  fromPattern?: string;
}

export interface State {
  version: string;
  project: {
    name: string;
    creatorLevel: CreatorLevel | null;
    firstSession: number;
    stack?: string[];
    focus?: string;
  };
  journey: {
    observations: Observation[];
    milestones: Milestone[];
    sessionCount: number;
    lastSession: string | null;
  };
  patterns: Pattern[];
  evolution: {
    capabilities: EvolvedCapability[];
    lastEvolution: string | null;
    pendingSuggestions: string[];
  };
  preferences: {
    suggestionEnabled: boolean;
    learningEnabled: boolean;
    minPatternCount: number;
  };
  statistics: {
    totalSessions: number;
    totalToolCalls: number;
    filesModified: Record<string, number>;
    lastSessionId: string | null;
  };
}

export interface ToolCall {
  tool: string;
  callID: string;
  timestamp: number;
}

export interface SessionData {
  sessionId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  toolCalls: number;
  filesEdited: string[];
}
