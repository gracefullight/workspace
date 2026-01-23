export type CapabilityType = "command" | "skill" | "hook" | "shortcut" | "agent" | "mcp";

export interface EvolvedCapability {
  id: string;
  type: CapabilityType;
  name: string;
  description: string;
  createdAt: string;
  fromPattern?: string;
}
