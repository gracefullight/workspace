// Domain constants for clustering
export const DOMAINS = [
  "code-style",
  "testing",
  "git",
  "debugging",
  "file-organization",
  "tooling",
  "refactoring",
  "documentation",
  "other",
] as const;

export type Domain = (typeof DOMAINS)[number];

export type InstinctStatus = "approved" | "pending" | "rejected";

export type InstinctSource = "personal" | "inherited";

export interface Instinct {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  confidence: number; // 0.0 - 1.0
  status: InstinctStatus;
  source: InstinctSource;
  createdAt: string;
  evidence: {
    patternIDs: string[];
    sessionIDs?: string[];
    examples?: string[];
  };
}

export interface InstinctIndex {
  [id: string]: {
    domain: Domain;
    status: InstinctStatus;
    confidence: number;
    createdAt: string;
  };
}
