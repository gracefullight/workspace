import type { EvolvedCapability } from "@/types/evolution";
import type { Domain, InstinctIndex } from "@/types/instinct";
import type { Milestone, Observation } from "@/types/journey";
import type { Pattern, ToolSequence } from "@/types/pattern";

export type CreatorLevel = "technical" | "semi-technical" | "non-technical" | "chaotic";

export interface Identity {
  awakened: string;
  personality: string;
  totalInstinctsLearned: number;
  totalEvolutions: number;
  favoriteDomainsRank: Domain[];
}

export interface State {
  version: string;
  project: {
    name: string;
    creatorLevel: CreatorLevel | null;
    firstSession: number;
    stack?: string[];
    focus?: string;
    identity?: Identity;
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
    lastObserverRun?: string | null;
    evolvedDomains?: Record<string, string>; // domain -> ISO timestamp
    instinctIndex?: InstinctIndex;
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
    toolSequences?: ToolSequence[];
  };
}
