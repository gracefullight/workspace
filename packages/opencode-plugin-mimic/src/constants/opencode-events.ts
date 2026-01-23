import type {
  EventCommandExecuted,
  EventFileEdited,
  EventFileWatcherUpdated,
  EventInstallationUpdateAvailable,
  EventInstallationUpdated,
  EventLspClientDiagnostics,
  EventLspUpdated,
  EventMessagePartRemoved,
  EventMessagePartUpdated,
  EventMessageRemoved,
  EventMessageUpdated,
  EventPermissionReplied,
  EventPermissionUpdated,
  EventPtyCreated,
  EventPtyDeleted,
  EventPtyExited,
  EventPtyUpdated,
  EventServerConnected,
  EventServerInstanceDisposed,
  EventSessionCompacted,
  EventSessionCreated,
  EventSessionDeleted,
  EventSessionDiff,
  EventSessionError,
  EventSessionIdle,
  EventSessionStatus,
  EventSessionUpdated,
  EventTodoUpdated,
  EventTuiCommandExecute,
  EventTuiPromptAppend,
  EventTuiToastShow,
  EventVcsBranchUpdated,
} from "@opencode-ai/sdk";

export const OPENCODE_EVENTS = {
  SERVER_INSTANCE_DISPOSED: "server.instance.disposed",
  INSTALLATION_UPDATED: "installation.updated",
  INSTALLATION_UPDATE_AVAILABLE: "installation.update.available",
  LSP_CLIENT_DIAGNOSTICS: "lsp.client.diagnostics",
  LSP_UPDATED: "lsp.updated",
  MESSAGE_UPDATED: "message.updated",
  MESSAGE_REMOVED: "message.removed",
  MESSAGE_PART_UPDATED: "message.part.updated",
  MESSAGE_PART_REMOVED: "message.part.removed",
  PERMISSION_UPDATED: "permission.updated",
  PERMISSION_REPLIED: "permission.replied",
  SESSION_STATUS: "session.status",
  SESSION_IDLE: "session.idle",
  SESSION_COMPACTED: "session.compacted",
  FILE_EDITED: "file.edited",
  TODO_UPDATED: "todo.updated",
  COMMAND_EXECUTED: "command.executed",
  SESSION_CREATED: "session.created",
  SESSION_UPDATED: "session.updated",
  SESSION_DELETED: "session.deleted",
  SESSION_DIFF: "session.diff",
  SESSION_ERROR: "session.error",
  FILE_WATCHER_UPDATED: "file.watcher.updated",
  VCS_BRANCH_UPDATED: "vcs.branch.updated",
  TUI_PROMPT_APPEND: "tui.prompt.append",
  TUI_COMMAND_EXECUTE: "tui.command.execute",
  TUI_TOAST_SHOW: "tui.toast.show",
  PTY_CREATED: "pty.created",
  PTY_UPDATED: "pty.updated",
  PTY_EXITED: "pty.exited",
  PTY_DELETED: "pty.deleted",
  SERVER_CONNECTED: "server.connected",
  // Hooks
  CHAT_MESSAGE: "chat.message",
  TOOL_EXECUTE_AFTER: "tool.execute.after",
} as const;

export type Event =
  | EventServerInstanceDisposed
  | EventInstallationUpdated
  | EventInstallationUpdateAvailable
  | EventLspClientDiagnostics
  | EventLspUpdated
  | EventMessageUpdated
  | EventMessageRemoved
  | EventMessagePartUpdated
  | EventMessagePartRemoved
  | EventPermissionUpdated
  | EventPermissionReplied
  | EventSessionStatus
  | EventSessionIdle
  | EventSessionCompacted
  | EventFileEdited
  | EventTodoUpdated
  | EventCommandExecuted
  | EventSessionCreated
  | EventSessionUpdated
  | EventSessionDeleted
  | EventSessionDiff
  | EventSessionError
  | EventFileWatcherUpdated
  | EventVcsBranchUpdated
  | EventTuiPromptAppend
  | EventTuiCommandExecute
  | EventTuiToastShow
  | EventPtyCreated
  | EventPtyUpdated
  | EventPtyExited
  | EventPtyDeleted
  | EventServerConnected;
