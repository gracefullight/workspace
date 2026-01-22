# opencode-plugin-mimic

[![npm version](https://img.shields.io/npm/v/opencode-plugin-mimic)](https://www.npmjs.com/package/opencode-plugin-mimic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [한국어](./README.ko.md)

> An OpenCode plugin that learns from your patterns and adapts to your workflow.

Mimic watches how you work, remembers across sessions, and suggests actions based on what you do repeatedly.

## Features

- **Pattern Detection**: Automatically detects repeated tool usage, file edits, and git commit messages
- **Session Memory**: Remembers observations and milestones across sessions
- **Journey Tracking**: Narrative storytelling of your project's evolution
- **Git History Analysis**: Analyzes commit messages and file modifications
- **Smart Suggestions**: Offers to create shortcuts for repeated actions
- **Per-Project State**: Each project gets its own learned patterns
- **Configurable**: Enable/disable learning and suggestions, adjust thresholds
- **Internationalization**: English or Korean UI based on user config

## How It Works

1. **Track**: Mimic tracks tool calls, file edits, and analyzes git history
2. **Detect**: Patterns are categorized by type (tool, file, commit)
3. **Remember**: Observations and milestones are recorded for your project's journey
4. **Suggest**: When patterns reach thresholds, Mimic surfaces suggestions and can evolve them into tools/hooks
5. **Persist**: All state persists in `.opencode/mimic/`

## Installation

### Via npm (Recommended)

```bash
npm install -g opencode-plugin-mimic
```

Then add to your `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-plugin-mimic"]
}
```

## Configuration

Mimic reads `~/.config/opencode/mimic.json` for user-level settings.

```json
{
  "language": "ko-KR"
}
```

Default language is `en-US`.

Project preferences live in `.opencode/mimic/state.json` and can be adjusted via `mimic:configure`:

```
mimic:configure({ learningEnabled: false })
mimic:configure({ suggestionEnabled: false })
mimic:configure({ minPatternCount: 5 })
```

## Flow Diagram (draw.io)

- Diagram file: `docs/mimic-flow.drawio`
- Open it in diagrams.net (draw.io) to view or edit.

## Usage

### Custom Tools

Mimic adds the following tools to OpenCode:

#### `mimic:init`

Initialize or wake up Mimic for this project. Shows welcome message with session stats and recent observations.

#### `mimic:status`

Check current status including:

- Session count and pattern stats
- Recently modified files (from git)
- Recent commits
- Active suggestions

#### `mimic:journey`

View the narrative story of your project's evolution:

- Milestones achieved
- Recent observations
- Git activity timeline

#### `mimic:patterns`

View all detected patterns organized by type:

- **Tool patterns**: Frequently used tools
- **File patterns**: Frequently modified files
- **Commit patterns**: Repeated commit messages
- **Sequence patterns**: Reserved for future detection

#### `mimic:observe`

Manually add an observation:

```
mimic:observe({ observation: "Refactored auth module for better security" })
```

#### `mimic:milestone`

Record a project milestone:

```
mimic:milestone({ milestone: "v1.0.0 released" })
```

#### `mimic:stats`

View detailed statistics:

- Total sessions and tool calls
- Pattern and milestone counts
- Session records
- Configuration status

#### `mimic:configure`

Adjust Mimic's behavior:

```
mimic:configure({ learningEnabled: false })     # Stop learning
mimic:configure({ suggestionEnabled: false })   # Stop suggestions
mimic:configure({ minPatternCount: 5 })         # Require 5 repetitions
```

#### `mimic:surface`

Mark a pattern as acknowledged:

```
mimic:surface({ patternId: "pattern-uuid" })
```

#### `mimic:reset`

Clear all learned data:

```
mimic:reset({ confirm: true })
```

#### `mimic:grow`

Analyze project direction and growth opportunities.

#### `mimic:evolve`

Suggest and create new capabilities based on detected patterns.

> When you accept a suggestion, Mimic writes files into your project:
> - `shortcut` / `command` / `hook` / `skill`: `.opencode/plugins/<name>.js`
> - `agent`: `.opencode/agents/<name>.md`
> - `mcp`: updates `opencode.json`

#### `mimic:level`

Set your technical level (technical, semi-technical, non-technical, chaotic). This is stored in state and used for personalization.

#### `mimic:focus`

Set current project focus or tech stack.

#### `mimic:mcp-search`

Returns a search link to mcpmarket.com and a list of popular MCP servers.

#### `mimic:mcp`

Add an MCP server configuration to the **project-level** `opencode.json`.

#### `mimic:capabilities`

List all evolved capabilities.

## State Structure

```
your-project/
├── .opencode/
│   └── mimic/
│       ├── state.json          # Main state file
│       └── sessions/           # Individual session records
│           └── {session-id}.json
└── opencode.json
```

### state.json

```json
{
  "version": "0.3.0",
  "project": {
    "name": "your-project",
    "creatorLevel": null,
    "firstSession": 1705940400000,
    "stack": ["node", "typescript"],
    "focus": "auth refactor"
  },
  "journey": {
    "observations": [
      { "observation": "Intensive session with 25 tool calls", "timestamp": "..." }
    ],
    "milestones": [
      { "milestone": "Major refactoring session: 15 files edited", "timestamp": "..." }
    ],
    "sessionCount": 10,
    "lastSession": "2026-01-22T12:00:00.000Z"
  },
  "patterns": [
    {
      "id": "uuid",
      "type": "tool",
      "description": "Read",
      "count": 50,
      "firstSeen": 1705940400000,
      "lastSeen": 1706026800000,
      "surfaced": false,
      "examples": [{ "tool": "read", "callID": "abc", "timestamp": 1706026800000 }]
    }
  ],
  "evolution": {
    "capabilities": [],
    "lastEvolution": null,
    "pendingSuggestions": []
  },
  "preferences": {
    "learningEnabled": true,
    "suggestionEnabled": true,
    "minPatternCount": 3
  },
  "statistics": {
    "totalSessions": 10,
    "totalToolCalls": 250,
    "filesModified": { "src/index.ts": 15 },
    "lastSessionId": null
  }
}
```

## Pattern Thresholds

| Pattern Type | Threshold | Result |
|--------------|-----------|--------|
| Tool usage | 3+ times (default) | Suggest action |
| Tool usage | 10+ times | Offer shortcut evolution |
| File modified | 5+ times | Offer hook evolution |
| Commit message | 3+ identical | Offer command evolution |

> Note: File/commit patterns are only created after their thresholds. Tool patterns accumulate from the first use.

## Automatic Behaviors

- **Session Start**: Increments session count, detects long breaks
- **Tool Execution**: Tracks every tool call for pattern detection
- **File Edit**: Tracks file modification frequency
- **Session Idle**: Analyzes commit/file patterns and surfaces suggestions
- **Session End**: Records intensive sessions, major refactoring milestones

> Git-based insights require a git repository. If none is available, git sections will be empty.

## Development

```bash
pnpm install
pnpm run build
pnpm run dev  # watch mode
```

## License

MIT
