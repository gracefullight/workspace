export interface Observation {
  observation: string;
  timestamp: string;
}

export interface Milestone {
  milestone: string;
  timestamp: string;
}

export interface SessionData {
  sessionId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  toolCalls: number;
  filesEdited: string[];
}
