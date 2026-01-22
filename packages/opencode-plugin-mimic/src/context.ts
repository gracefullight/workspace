import type { I18n } from "@/i18n";
import type { StateManager } from "@/state";

export interface MimicContext {
  stateManager: StateManager;
  directory: string;
  i18n: I18n;
}
