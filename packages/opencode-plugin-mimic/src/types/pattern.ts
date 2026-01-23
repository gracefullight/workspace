export interface ToolSequence {
  tools: string[];
  count: number;
  lastSeen: number;
}

export interface ToolCall {
  tool: string;
  callID: string;
  timestamp: number;
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
