import type { createOpencodeClient } from "@opencode-ai/sdk";
import type { StateManager } from "@/core/state";
import type { I18n } from "@/lib/i18n";

export interface MimicContext {
  stateManager: StateManager;
  directory: string;
  i18n: I18n;
  client?: ReturnType<typeof createOpencodeClient>;
}
