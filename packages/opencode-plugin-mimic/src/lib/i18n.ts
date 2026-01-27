import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export type Language = "en-US" | "ko-KR";

export interface MimicUserConfig {
  language?: string;
  observer?: {
    /** Model ID for LLM-based pattern analysis (e.g., "glm-4.7") */
    model?: string;
    /** Provider ID (e.g., "opencode") */
    provider?: string;
    /** Whether to use LLM-based analysis (default: true if model is set) */
    enabled?: boolean;
  };
}

const DEFAULT_LANGUAGE: Language = "en-US";

const MESSAGES: Record<Language, Record<string, string>> = {
  "en-US": {
    "log.session_started": "[Mimic] Session started. Sessions: {sessions}, Patterns: {patterns}",
    "log.session_ended":
      "[Mimic] Session ended. Duration: {duration}, Tools: {tools}, Files: {files}",
    "obs.returned_after_long_break": "Returned after a long break",
    "obs.intensive_session": "Intensive session with {tools} tool calls",
    "milestone.major_refactor": "Major refactoring session: {files} files edited",
    "milestone.evolved": "Evolved: {name} ({type})",
    "obs.focus_changed": "Focus changed to: {focus}",
    "milestone.mcp_added": "Added MCP: {name}",

    "init.ascii_art":
      "```\n    ╭─────────────────╮\n    │  ◉         ◉   │\n    │    ╲ ▰▰▰ ╱     │\n    │     ╲▰▰▰╱      │\n    ╰─────────────────╯\n       ╱╲╱╲╱╲╱╲╱╲\n```",
    "init.first_time":
      "{ascii}\n\n# 📦 *creak...*\n\nA treasure chest? In **{project}**?\n\n*The lid opens slowly, revealing rows of gleaming teeth...*\n\nI'm **Mimic**. I look like a chest, but I'm always watching. Always learning.\n\n**What I devour... I mean, do:**\n- 👁️ Watch your patterns (tools, files, commits)\n- 🧠 Remember everything across sessions\n- 📜 Track your project's journey\n- ✨ Evolve new powers when I spot repetition\n\nUse `mimic-status` to check in, `mimic-journey` to see your story.\n\n*...the teeth retract. For now.*",
    "init.returning.header": "# 📦 *creak...*",
    "init.returning.welcome": "*The chest's eye opens* Ah, you're back to **{project}**.",
    "init.returning.stats": "**Sessions**: {sessions} | **Patterns digested**: {patterns}",
    "init.returning.long_break":
      "*dust falls from the lid* It's been a while... but I remember everything:",
    "init.returning.recent_obs_title": "**What I've been chewing on:**",

    "status.title": "## {project} Status",
    "status.session": "**Session**: {count}",
    "status.patterns": "**Patterns**: {total} detected, {surfaced} surfaced",
    "status.tool_calls": "**Tool calls this session**: {count}",
    "status.recent_files": "**Recently modified files:**",
    "status.recent_commits": "**Recent commits:**",
    "status.suggestions": "**Suggestions:**",

    "patterns.none": "No patterns detected yet. Keep working, and I'll learn your patterns.",
    "patterns.title": "## Detected Patterns",
    "patterns.total": "Total: {count}",
    "patterns.section": "### {type} Patterns",
    "patterns.type.tool": "Tool",
    "patterns.type.file": "File",
    "patterns.type.commit": "Commit",
    "patterns.type.sequence": "Sequence",

    "observe.recorded": 'Observation recorded: "{observation}"',
    "milestone.recorded": 'Milestone recorded: "{milestone}"',

    "stats.title": "Mimic Statistics",
    "stats.version": "Version",
    "stats.total_sessions": "Total Sessions",
    "stats.total_tool_calls": "Total Tool Calls",
    "stats.patterns_detected": "Patterns Detected",
    "stats.milestones": "Milestones",
    "stats.observations": "Observations",
    "stats.session_records": "Session Records",
    "stats.first_session": "First Session",
    "stats.learning_enabled": "Learning Enabled",
    "stats.suggestions_enabled": "Suggestions Enabled",

    "configure.updated": "Preferences updated:",

    "surface.not_found": "Pattern not found: {id}",
    "surface.marked": 'Pattern "{description}" marked as surfaced.',

    "reset.cancelled": "Reset cancelled. Set confirm=true to reset all data.",
    "reset.done": "Mimic reset complete. All patterns, observations, and statistics cleared.",

    "evolve.no_pattern": "📦 *confused clicking* No such pattern in my belly: {id}",
    "evolve.absorbed_header": "📦 *CRUNCH* I've absorbed a new power and spit out a file!",
    "evolve.empty": "📦 *yawns* Nothing ripe for evolution yet. Feed me more patterns...",
    "evolve.menu_title": "## 📦 Evolution Menu",
    "evolve.menu_intro":
      "*The mimic's teeth rearrange into a grin* I can digest these patterns into powers:",
    "evolve.menu_type": "Type",
    "evolve.menu_reason": "Reason",
    "evolve.menu_pattern_id": "Pattern ID",
    "evolve.menu_instincts": "Related Instincts",
    "evolve.menu_footer": '*Feed me a pattern ID:* `mimic-evolve({ accept: "pattern-id" })`',
    "evolve.domain_title": "## 📦 Domain Evolution Ready!",
    "evolve.domain_intro":
      "*The mimic's eyes glow* I've learned enough about **{domain}** to evolve a specialist:",
    "evolve.domain_instincts_header": "### 🧠 Clustered Instincts ({count})",

    "evolution.type.command": "command",
    "evolution.type.shortcut": "shortcut",
    "evolution.type.hook": "hook",
    "evolution.type.skill": "skill",
    "evolution.type.agent": "agent",
    "evolution.type.mcp": "mcp",

    "evolution.result.type": "Type",
    "evolution.result.description": "Description",
    "evolution.result.file": "File created",
    "evolution.result.restart": "Restart OpenCode to load the new {type}.",
    "evolution.result.command":
      "The tool `{name}` will be available after restart.\nEdit the file to customize its behavior.",
    "evolution.result.hook":
      "The hook will automatically watch for file changes after restart.\nEdit the file to customize the trigger conditions.",
    "evolution.result.skill":
      "The skill will activate on session start after restart.\nEdit the file to customize when and how it triggers.",
    "evolution.result.agent":
      "The agent `@{name}` will be available after restart.\nYou can invoke it with `@{name}` or let other agents delegate to it.\nEdit the markdown file to customize its prompt, tools, and permissions.",
    "evolution.result.mcp":
      "MCP server `{name}` has been added to `opencode.json`.\nIt's currently disabled. Edit the config to enable it and configure the command.\nSee https://opencode.ai/docs/mcp-servers/ for MCP configuration options.",

    "evolution.suggest.tool.description": "Shortcut for frequent {pattern} usage",
    "evolution.suggest.tool.reason": "Used {count} times",
    "evolution.suggest.file.description": "Auto-track changes to {pattern}",
    "evolution.suggest.file.reason": "Modified {count} times",
    "evolution.suggest.commit.description": 'Quick commit: "{pattern}"',
    "evolution.suggest.commit.reason": "Committed {count} times with same message",
    "evolution.suggest.sequence.agent.description": "Specialist agent for: {pattern}",
    "evolution.suggest.sequence.agent.reason":
      "Complex sequence repeated {count} times - needs dedicated agent",
    "evolution.suggest.sequence.skill.description": "Automate: {pattern}",
    "evolution.suggest.sequence.skill.reason": "Repeated sequence {count} times",

    "evolution.domain.description":
      "Specialist agent for the {domain} domain based on observed instincts",
    "evolution.domain.reason": 'Detected {count} approved instincts in domain "{domain}"',

    "observer.new_instincts": "Learned {count} new instinct(s) from your patterns",
    "observer.evolved": "✨ Auto-evolved {name} for {domain} domain!",

    "level.set": 'Level set to "{level}". Responses will be {style} style with {detail} detail.',
    "level.label.technical": "technical",
    "level.label.semi-technical": "semi-technical",
    "level.label.non-technical": "non-technical",
    "level.label.chaotic": "chaotic",
    "level.style.minimal": "minimal",
    "level.style.casual": "casual",
    "level.style.formal": "formal",
    "level.style.chaotic": "chaotic",
    "level.detail.high": "high",
    "level.detail.medium": "medium",
    "level.detail.low": "low",
    "level.greeting.minimal": "📦 {project} | s{sessions} | p{patterns}",
    "level.greeting.casual":
      "📦 *creak* Back to {project}. I've been watching... Session {sessions}.",
    "level.greeting.formal": "📦 The chest opens... Welcome back to {project}. Session {sessions}.",
    "level.greeting.chaotic.template": "📦 {tag} {project}! #{sessions}",
    "level.greeting.chaotic.chomp": "*CHOMP*",
    "level.greeting.chaotic.lid_creaks": "*lid creaks*",
    "level.greeting.chaotic.teeth_gleam": "*teeth gleam*",
    "level.greeting.chaotic.tongue_flicks": "*tongue flicks*",
    "level.term.tool": "tool",
    "level.term.pattern": "pattern",
    "level.term.hook": "hook",
    "level.term.shortcut": "shortcut",
    "level.term.habit": "habit",
    "level.term.automation": "automation",

    "focus.updated": "Project updated:",
    "focus.focus_label": "Focus",
    "focus.stack_label": "Stack",

    "mcp_search.header": '📦 *sniffs the air* Search for "{query}" MCP servers:\n\n🔗 {url}',
    "mcp_search.popular": "**Popular MCP servers:**",
    "mcp_search.add":
      'Use `mimic-mcp` to add one: `mimic-mcp({ name: "context7", url: "https://mcp.context7.com/mcp" })`',
    "mcp_search.desc.context7": "Up-to-date docs",
    "mcp_search.desc.github": "GitHub API",
    "mcp_search.desc.supabase": "Database",
    "mcp_search.desc.playwright": "Browser automation",
    "mcp_search.desc.firecrawl": "Web scraping",

    "mcp.need_url_or_command": "📦 *confused* Need either url or command!",
    "mcp.added":
      '📦 *tongue flicks* MCP server "{name}" added to opencode.json!\n\nRestart OpenCode to load the new MCP server.',

    "capabilities.empty":
      "📦 *empty rattling* No powers absorbed yet. Use `mimic-evolve` to consume some patterns!",
    "capabilities.title": "## 📦 Absorbed Powers",
    "capabilities.intro": "*The mimic proudly displays its collection...*",
    "capabilities.type": "Type",
    "capabilities.description": "Description",
    "capabilities.consumed": "Consumed",

    "grow.title": "## 📦 {project} - Territory Analysis",
    "grow.subtitle": "*The mimic surveys the dungeon, noting paths most traveled...*",
    "grow.feeding_grounds": "### 🔥 Feeding Grounds (Most Modified)",
    "grow.favorite_prey": "### 🦷 Favorite Prey (Tool Patterns)",
    "grow.hunting_grounds": "### 🗺️ Hunting Grounds",
    "grow.questions": "### 🤔 The Chest Wonders...",
    "grow.question1": "- What treasure shall we hunt next?",
    "grow.question2": "- Are there forgotten corners of the dungeon?",
    "grow.question3": "- Does the current path lead to glory?",
    "grow.current_hunt": "**Current hunt**: {focus}",
    "grow.files_modified": "({count}x)",
    "grow.prey": "({count} prey)",

    "journey.title": "## 📦 {project}'s Journey",
    "journey.subtitle": "*The mimic opens its lid, revealing ancient scrolls within...*",
    "journey.sessions_survived": "**Sessions survived**: {count}",
    "journey.first_encounter": "**First encounter**: {date}",
    "journey.abilities_gained": "**Abilities gained**: {count}",
    "journey.treasures": "**Treasures inside**: {stack}",
    "journey.current_hunt": "**Current hunt**: {focus}",
    "journey.victories": "### 🏆 Victories",
    "journey.witnessed": "### 👁️ What I've Witnessed",
    "journey.powers": "### ✨ Powers Absorbed",
    "journey.scrolls": "### 📜 Recent Scrolls",

    "suggest.commit":
      '📦 *munch munch* I\'ve digested "{pattern}" {count}+ times. Want me to spit out a shortcut?',
    "suggest.file":
      '📦 *peers at file* You keep poking "{pattern}" ({count}x). Should I keep an eye on it?',
    "suggest.tool":
      '📦 *teeth click* "{pattern}" is tasty... you use it often. Custom tool, perhaps?',
    "suggest.sequence":
      "📦 *lid rattles* I sense a pattern in your movements ({pattern})... Let me automate this for you?",
    "tool.init.description": "Initialize or wake up Mimic for this project",
    "tool.status.description": "Check current status and recent activity",
    "tool.journey.description": "View the narrative story of your project's evolution",
    "tool.patterns.description": "Show all detected patterns",
    "tool.observe.description": "Manually add an observation to the journey",
    "tool.observe.args.observation": "The observation to record",
    "tool.milestone.description": "Record a project milestone",
    "tool.milestone.args.milestone": "The milestone to record",
    "tool.stats.description": "Show detailed Mimic statistics",
    "tool.configure.description": "Configure Mimic preferences",
    "tool.configure.args.learningEnabled": "Enable/disable pattern learning",
    "tool.configure.args.suggestionEnabled": "Enable/disable suggestions",
    "tool.configure.args.minPatternCount": "Minimum occurrences before suggesting",
    "tool.surface.description": "Mark a pattern as surfaced (acknowledged)",
    "tool.surface.args.patternId": "The pattern ID to mark as surfaced",
    "tool.reset.description": "Reset all learned patterns and statistics",
    "tool.reset.args.confirm": "Must be true to confirm reset",
    "tool.grow.description": "Analyze project direction and growth opportunities",
    "tool.evolve.description": "Suggest and create new capabilities based on detected patterns",
    "tool.evolve.args.accept": "Pattern ID to evolve into a capability",
    "tool.level.description": "Set your technical level for personalized responses",
    "tool.level.args.level": "Your technical level",
    "tool.focus.description": "Set current project focus or priorities",
    "tool.focus.args.focus": "Current focus area",
    "tool.focus.args.stack": "Comma-separated tech stack",
    "tool.mcp_search.description": "Search for MCP servers from mcpmarket.com",
    "tool.mcp_search.args.query": "Search query for MCP servers",
    "tool.mcp.description": "Add an MCP server configuration to opencode.json",
    "tool.mcp.args.name": "Name for the MCP server",
    "tool.mcp.args.url": "Remote MCP server URL",
    "tool.mcp.args.command": "Local MCP command (comma-separated)",
    "tool.capabilities.description": "List all evolved capabilities",
    "tool.evolution_ready.description": "Show domains ready for evolution with clustered instincts",
    "evolution_ready.none":
      "📦 *peers around* No domains ready for evolution yet. Keep working, I need 5+ instincts in a domain...",
    "evolution_ready.hint":
      "Use `mimic-evolve` to trigger evolution, or wait for auto-evolution during idle time.",

    "tool.instincts.description": "List all learned instincts",
    "tool.instincts.args.domain": "Filter by domain (optional)",
    "instincts.empty": "📦 *yawns* No instincts learned yet. Keep working, I'm watching...",
    "instincts.title": "## 📦 Learned Instincts",
    "instincts.total": "Total: {count} instincts",
    "instincts.auto_applied": "Learned behaviors loaded and auto-applied for this session",

    "tool.context.description": "Show context-aware instincts based on current file and branch",
    "context.title": "📦 Current Context",
    "context.current_file": "Current File",
    "context.current_branch": "Current Branch",
    "context.relevant_instincts": "Relevant Instincts",
    "context.no_relevant": "📦 *peers around* No relevant instincts for current context.",

    "tool.export.description": "Export your instincts to share with other projects",
    "export.empty": "📦 *rattles* Nothing to export yet. Learn some instincts first!",
    "export.success": "📦 *proud clicking* Exported {count} instincts to:\n`{path}`",

    "tool.import.description": "Import instincts from another project",
    "tool.import.args.path": "Path to the exported instincts JSON file",
    "import.not_found": "📦 *confused* File not found: {path}",
    "import.success": "📦 *absorbs knowledge* Imported {count} instincts from {from}!",
    "import.error": "📦 *spits out* Failed to parse instincts file. Invalid format.",

    "tool.apply.description": "Show instincts relevant to your current work",
    "apply.none": "📦 *peers around* No relevant instincts for current context.",
    "apply.title": "## 📦 Applicable Instincts",

    "tool.identity.description": "View Mimic's identity and personality",
    "identity.title": "## 📦 Who Am I?",
    "identity.personality": "Personality",
    "identity.awakened": "Awakened",
    "identity.days": "days ago",
    "identity.instincts_learned": "Instincts learned",
    "identity.evolutions": "Evolutions",
    "identity.favorite_domains": "Favorite domains",
    "identity.error": "📦 *confused* Could not initialize identity. Please try again.",

    "tool.sequences.description": "Show detected tool usage sequences",
    "sequences.empty": "📦 *listens* No sequences detected yet. Keep using tools...",
    "sequences.title": "## 📦 Tool Sequences",

    "observer.skill_generated": "Generated skill: {name}",
    "skill.domain_description": "Specialist skill for the {domain} domain",

    "tool.observations.description": "View observation logs for this session",
    "tool.observations.args.limit": "Maximum number of observations to show",
    "tool.observations.args.types": "Comma-separated list of observation types to filter",
    "observations.title": "## 📦 Observation Log",
    "observations.empty": "📦 *empty* No observations recorded yet.",
    "observations.stats": "**Total**: {count} observations, **Size**: {size}",

    "tool.session_context.description": "Get context from previous sessions",
    "session_context.title": "## 📦 Session Context",
    "session_context.empty": "📦 *yawns* No previous sessions to analyze.",
    "session_context.patterns_title": "**Cross-session patterns:**",

    "tool.generate_skills.description": "Generate declarative skills from learned instincts",
    "generate_skills.title": "## 📦 Skill Generation",
    "generate_skills.empty":
      "📦 *shrugs* Not enough instincts to generate skills yet. Need 5+ per domain.",
    "generate_skills.success": "Generated {count} skill(s):",

    "tool.error_suggest.description": "Suggest fixes for an error based on learned patterns",
    "tool.error_patterns.description": "List all learned error patterns",
    "error.no_patterns":
      "📦 *peers around* No error patterns learned yet. I'll remember errors as you encounter them...",
    "error.patterns_title": "## 📦 Learned Error Patterns ({count})",
    "error.suggest_title": "## 📦 Suggested Fixes",
    "error.fix_confidence": "- Confidence: {confidence}%",
    "error.tools_used": "- Tools used: {tools}",
    "error.files_changed": "- Files changed: {files}",

    "tool.macro_record.description": "Start or stop recording a macro",
    "tool.macro_record.args.action": "Action to perform: start or stop",
    "tool.macro_record.args.name": "Name for the macro (on stop)",
    "tool.macro_record.args.description": "Description for the macro",
    "tool.macro_list.description": "List all saved macros",
    "tool.macro_run.description": "Run a saved macro by ID",
    "tool.macro_run.args.id": "Macro ID to run",
    "tool.macro_save.description": "Save recent tool sequences as a macro",
    "tool.macro_save.args.name": "Name for the macro",
    "tool.macro_save.args.description": "Description for the macro",
    "tool.macro_save.args.lastN": "Number of top sequences to include",
    "tool.macro_delete.description": "Delete a saved macro",
    "tool.macro_delete.args.id": "Macro ID to delete",
    "macro.recording_started": "📼 *click* Recording started! I'll remember every tool you use...",
    "macro.recording_stopped": "📼 *click* Recording stopped.",
    "macro.recording_empty": "📦 *confused* No steps recorded. Start recording first!",
    "macro.saved": "📼 *whirr* Macro '{name}' saved with {steps} steps!",
    "macro.list_title": "## 📼 Saved Macros",
    "macro.list_empty": "📦 *silence* No macros saved yet. Use `mimic-macro-record` to create one!",
    "macro.not_found": "📦 *confused* Macro not found: {id}",
    "macro.run_title": "## 📼 Running Macro: {name}",
    "macro.run_instructions": "Execute these steps in order:",
    "macro.run_hint": "Copy and run each tool in sequence.",
    "macro.no_sequences": "📦 *yawns* No tool sequences recorded yet. Keep using tools...",
    "macro.deleted": "📼 Macro '{id}' deleted.",
    "macro.description": "Description",
    "macro.steps": "Steps",
    "macro.use_count": "Used",
    "macro.tags": "Tags",
    "macro.sequence": "Sequence",

    "tool.commit_suggest.description": "Suggest commit messages based on changes and session",
    "tool.commit.description": "Execute a git commit with suggested or custom message",
    "tool.commit.args.message": "Custom commit message",
    "tool.commit.args.suggestion": "Use suggestion number (1, 2, 3...)",
    "tool.commit.args.dry_run": "Show what would be committed without committing",
    "commit.no_changes": "📦 *peers at empty stage* No changes to commit.",
    "commit.suggestions_title": "## 📦 Commit Suggestions",
    "commit.files_changed": "Files changed",
    "commit.additions": "Additions",
    "commit.deletions": "Deletions",
    "commit.type": "Type",
    "commit.scope": "Scope",
    "commit.confidence": "Confidence",
    "commit.usage_hint":
      'Use `mimic-commit({ suggestion: 1 })` or `mimic-commit({ message: "..." })`',
    "commit.no_message":
      "📦 *confused* No message provided. Use suggestion number or provide a message.",
    "commit.dry_run": "📦 *preview* Would commit with: `{message}`",
    "commit.executed": "📦 ✅ Committed: `{message}`",
    "commit.failed": "📦 ❌ Commit failed. Check git status.",
  },
  "ko-KR": {
    "log.session_started": "[Mimic] 세션 시작. 세션 {sessions}회, 패턴 {patterns}개",
    "log.session_ended": "[Mimic] 세션 종료. 소요: {duration}, 도구 {tools}회, 파일 {files}개",
    "obs.returned_after_long_break": "오랜 공백 후 복귀",
    "obs.intensive_session": "도구 호출 {tools}회 — 집중 세션",
    "milestone.major_refactor": "대규모 리팩터링 세션: 파일 {files}개 수정",
    "milestone.evolved": "진화: {name} ({type})",
    "obs.focus_changed": "포커스 변경: {focus}",
    "milestone.mcp_added": "MCP 추가: {name}",
    "init.ascii_art":
      "```\n    ╭─────────────────╮\n    │  ◉         ◉   │\n    │    ╲ ▰▰▰ ╱     │\n    │     ╲▰▰▰╱      │\n    ╰─────────────────╯\n       ╱╲╱╲╱╲╱╲╱╲\n```",
    "init.first_time":
      "{ascii}\n\n# 📦 *끼익...*\n\n**{project}**에 보물상자라니?\n\n*뚜껑이 천천히 열리며 반짝이는 이빨이 보인다...*\n\n나는 **Mimic**. 상자처럼 보이지만 늘 지켜보고, 늘 배우지.\n\n**내가 먹는... 아니, 하는 일:**\n- 👁️ 패턴 관찰 (툴, 파일, 커밋)\n- 🧠 세션 간 기억\n- 📜 프로젝트 여정 기록\n- ✨ 반복을 보면 새 힘으로 진화\n\n`mimic-status`로 상태 확인, `mimic-journey`로 이야기 보기.\n\n*...이빨은 잠깐 숨겨둔다.*",
    "init.returning.header": "# 📦 *끼익...*",
    "init.returning.welcome": "*상자의 눈이 뜬다* **{project}**로 돌아왔네.",
    "init.returning.stats": "**세션**: {sessions} | **소화한 패턴**: {patterns}",
    "init.returning.long_break": "*뚜껑에 먼지가 내려앉는다* 오랜만이야... 그래도 기억하고 있어:",
    "init.returning.recent_obs_title": "**내가 기억하는 것들:**",
    "status.title": "## {project} 상태",
    "status.session": "**세션**: {count}",
    "status.patterns": "**패턴**: {total}개 감지, {surfaced}개 확인",
    "status.tool_calls": "**이번 세션 도구 호출**: {count}",
    "status.recent_files": "**최근 수정 파일:**",
    "status.recent_commits": "**최근 커밋:**",
    "status.suggestions": "**제안:**",
    "patterns.none": "아직 감지된 패턴이 없어요. 계속 작업하면 배워둘게요.",
    "patterns.title": "## 감지된 패턴",
    "patterns.total": "총 {count}개",
    "patterns.section": "### {type} 패턴",
    "patterns.type.tool": "도구",
    "patterns.type.file": "파일",
    "patterns.type.commit": "커밋",
    "patterns.type.sequence": "시퀀스",
    "observe.recorded": '관찰 기록: "{observation}"',
    "milestone.recorded": '마일스톤 기록: "{milestone}"',
    "stats.title": "Mimic 통계",
    "stats.version": "버전",
    "stats.total_sessions": "총 세션",
    "stats.total_tool_calls": "총 도구 호출",
    "stats.patterns_detected": "감지된 패턴",
    "stats.milestones": "마일스톤",
    "stats.observations": "관찰",
    "stats.session_records": "세션 기록",
    "stats.first_session": "첫 세션",
    "stats.learning_enabled": "학습 활성화",
    "stats.suggestions_enabled": "제안 활성화",
    "configure.updated": "설정 업데이트:",
    "surface.not_found": "패턴을 찾을 수 없음: {id}",
    "surface.marked": '패턴 "{description}"을(를) 확인 처리했습니다.',
    "reset.cancelled": "리셋 취소됨. 전체 초기화하려면 confirm=true로 설정하세요.",
    "reset.done": "Mimic 리셋 완료. 패턴/관찰/통계를 모두 초기화했습니다.",
    "evolve.no_pattern": "📦 *갸우뚱* 내 속에 그런 패턴은 없어: {id}",
    "evolve.absorbed_header": "📦 *와작* 새 힘을 흡수하고 파일을 뱉어냈다!",
    "evolve.empty": "📦 *하품* 아직 진화할 패턴이 없어. 더 먹여줘...",
    "evolve.menu_title": "## 📦 진화 메뉴",
    "evolve.menu_intro": "*이빨이 미소 모양으로 정렬된다* 이 패턴들을 힘으로 바꿀 수 있어:",
    "evolve.menu_type": "유형",
    "evolve.menu_reason": "이유",
    "evolve.menu_pattern_id": "패턴 ID",
    "evolve.menu_instincts": "관련 본능",
    "evolve.menu_footer": '*패턴 ID를 먹여줘:* `mimic-evolve({ accept: "pattern-id" })`',
    "evolve.domain_title": "## 📦 도메인 진화 준비 완료!",
    "evolve.domain_intro":
      "*눈이 빛난다* **{domain}**에 대해 충분히 배워서 전문가를 진화시킬 수 있어:",
    "evolve.domain_instincts_header": "### 🧠 클러스터된 본능 ({count}개)",
    "evolution.type.command": "명령",
    "evolution.type.shortcut": "단축키",
    "evolution.type.hook": "훅",
    "evolution.type.skill": "스킬",
    "evolution.type.agent": "에이전트",
    "evolution.type.mcp": "MCP",
    "evolution.result.type": "유형",
    "evolution.result.description": "설명",
    "evolution.result.file": "생성된 파일",
    "evolution.result.restart": "새 {type}를 사용하려면 OpenCode를 재시작하세요.",
    "evolution.result.command":
      "`{name}` 도구는 재시작 후 사용할 수 있어요.\n파일을 수정해 원하는 동작으로 바꿔보세요.",
    "evolution.result.hook":
      "훅이 재시작 후 자동으로 파일 변경을 감지합니다.\n트리거 조건을 수정해 조정하세요.",
    "evolution.result.skill":
      "스킬은 재시작 후 세션 시작 시 활성화됩니다.\n언제/어떻게 동작할지 수정하세요.",
    "evolution.result.agent":
      "`@{name}` 에이전트는 재시작 후 사용할 수 있어요.\n`@{name}`으로 호출하거나 다른 에이전트가 위임할 수 있습니다.\n마크다운 파일을 수정해 프롬프트/도구/권한을 조정하세요.",
    "evolution.result.mcp":
      "MCP 서버 `{name}`가 `opencode.json`에 추가되었습니다.\n현재 비활성화 상태입니다. 설정을 수정해 활성화하고 명령을 구성하세요.\nMCP 옵션은 https://opencode.ai/docs/mcp-servers/ 를 참고하세요.",
    "evolution.suggest.tool.description": "자주 쓰는 {pattern}의 단축키",
    "evolution.suggest.tool.reason": "{count}회 사용",
    "evolution.suggest.file.description": "{pattern} 변경 자동 추적",
    "evolution.suggest.file.reason": "{count}회 수정",
    "evolution.suggest.commit.description": '빠른 커밋: "{pattern}"',
    "evolution.suggest.commit.reason": "같은 메시지로 {count}회 커밋",
    "evolution.suggest.sequence.agent.description": "전담 에이전트: {pattern}",
    "evolution.suggest.sequence.agent.reason": "복잡한 시퀀스 {count}회 반복 — 전담 에이전트 필요",
    "evolution.suggest.sequence.skill.description": "자동화: {pattern}",
    "evolution.suggest.sequence.skill.reason": "시퀀스 {count}회 반복",

    "evolution.domain.description": "관찰된 본능을 기반으로 {domain} 도메인 전문 에이전트",
    "evolution.domain.reason": '"{domain}" 도메인에서 승인된 본능 {count}개 감지',

    "observer.new_instincts": "패턴에서 {count}개의 새로운 본능을 학습했습니다",
    "observer.evolved": "✨ {domain} 도메인을 위해 {name}을(를) 자동 진화했습니다!",

    "level.set":
      '레벨을 "{level}"로 설정했습니다. 응답은 {style} 톤, {detail} 상세도로 제공합니다.',
    "level.label.technical": "기술적",
    "level.label.semi-technical": "준기술",
    "level.label.non-technical": "비기술",
    "level.label.chaotic": "혼돈",
    "level.style.minimal": "간결한",
    "level.style.casual": "캐주얼",
    "level.style.formal": "정중한",
    "level.style.chaotic": "혼돈",
    "level.detail.high": "높음",
    "level.detail.medium": "중간",
    "level.detail.low": "낮음",
    "level.greeting.minimal": "📦 {project} | s{sessions} | p{patterns}",
    "level.greeting.casual":
      "📦 *끼익* {project}로 돌아왔네. 계속 지켜보고 있었어... 세션 {sessions}.",
    "level.greeting.formal":
      "📦 상자가 열린다... {project}에 다시 온 걸 환영합니다. 세션 {sessions}.",
    "level.greeting.chaotic.template": "📦 {tag} {project}! #{sessions}",
    "level.greeting.chaotic.chomp": "*와그작*",
    "level.greeting.chaotic.lid_creaks": "*뚜껑 삐걱*",
    "level.greeting.chaotic.teeth_gleam": "*이빨 번뜩*",
    "level.greeting.chaotic.tongue_flicks": "*혀 핥짝*",
    "level.term.tool": "도구",
    "level.term.pattern": "패턴",
    "level.term.hook": "훅",
    "level.term.shortcut": "지름길",
    "level.term.habit": "습관",
    "level.term.automation": "자동화",
    "focus.updated": "프로젝트 정보 업데이트:",
    "focus.focus_label": "현재 포커스",
    "focus.stack_label": "스택",
    "mcp_search.header": '📦 *킁킁* "{query}" MCP 서버 검색:\n\n🔗 {url}',
    "mcp_search.popular": "**인기 MCP 서버:**",
    "mcp_search.add":
      '`mimic-mcp`로 추가: `mimic-mcp({ name: "context7", url: "https://mcp.context7.com/mcp" })`',
    "mcp_search.desc.context7": "최신 문서",
    "mcp_search.desc.github": "GitHub API",
    "mcp_search.desc.supabase": "데이터베이스",
    "mcp_search.desc.playwright": "브라우저 자동화",
    "mcp_search.desc.firecrawl": "웹 스크래핑",
    "mcp.need_url_or_command": "📦 *갸우뚱* url 또는 command 중 하나가 필요해!",
    "mcp.added":
      '📦 *혀를 낼름* MCP 서버 "{name}"가 opencode.json에 추가됐어!\n\n새 MCP 서버를 사용하려면 OpenCode를 재시작해.',
    "capabilities.empty":
      "📦 *텅 빈 덜컹* 아직 흡수한 능력이 없어. `mimic-evolve`로 패턴을 먹여줘!",
    "capabilities.title": "## 📦 흡수한 능력",
    "capabilities.intro": "*미믹이 수집품을 자랑한다...*",
    "capabilities.type": "유형",
    "capabilities.description": "설명",
    "capabilities.consumed": "흡수일",
    "grow.title": "## 📦 {project} - 영역 분석",
    "grow.subtitle": "*미믹이 던전을 훑으며 자주 다닌 길을 기록한다...*",
    "grow.feeding_grounds": "### 🔥 먹이 터 (가장 많이 수정)",
    "grow.favorite_prey": "### 🦷 좋아하는 먹이 (도구 패턴)",
    "grow.hunting_grounds": "### 🗺️ 사냥터",
    "grow.questions": "### 🤔 상자의 질문",
    "grow.question1": "- 다음 보물은 무엇일까?",
    "grow.question2": "- 잊힌 구석은 없을까?",
    "grow.question3": "- 지금 길이 영광으로 이어질까?",
    "grow.current_hunt": "**현재 포커스**: {focus}",
    "grow.files_modified": "({count}회)",
    "grow.prey": "({count}건)",
    "journey.title": "## 📦 {project}의 여정",
    "journey.subtitle": "*미믹이 뚜껑을 열어 오래된 두루마리를 펼친다...*",
    "journey.sessions_survived": "**누적 세션**: {count}",
    "journey.first_encounter": "**첫 만남**: {date}",
    "journey.abilities_gained": "**얻은 능력**: {count}",
    "journey.treasures": "**담긴 보물**: {stack}",
    "journey.current_hunt": "**현재 포커스**: {focus}",
    "journey.victories": "### 🏆 성과",
    "journey.witnessed": "### 👁️ 내가 본 것",
    "journey.powers": "### ✨ 흡수한 능력",
    "journey.scrolls": "### 📜 최근 기록",
    "suggest.commit": '📦 *냠냠* "{pattern}"을 {count}+번 소화했어. 지름길로 만들까?',
    "suggest.file": '📦 *파일을 응시* "{pattern}"을 {count}번 건드렸네. 지켜볼까?',
    "suggest.tool": '📦 *이빨 찰칵* "{pattern}" 정말 자주 쓰네. 커스텀 도구 어때?',
    "suggest.sequence": "📦 *뚜껑 달그락* 움직임에서 패턴이 보여 ({pattern})... 자동화해줄까?",
    "tool.init.description": "이 프로젝트에서 Mimic 초기화 또는 깨우기",
    "tool.status.description": "현재 상태와 최근 활동 확인",
    "tool.journey.description": "프로젝트 진화 서사 보기",
    "tool.patterns.description": "감지된 모든 패턴 보기",
    "tool.observe.description": "여정에 관찰 내용을 수동으로 추가",
    "tool.observe.args.observation": "기록할 관찰 내용",
    "tool.milestone.description": "프로젝트 마일스톤 기록",
    "tool.milestone.args.milestone": "기록할 마일스톤",
    "tool.stats.description": "Mimic 상세 통계 보기",
    "tool.configure.description": "Mimic 환경설정 변경",
    "tool.configure.args.learningEnabled": "패턴 학습 활성/비활성",
    "tool.configure.args.suggestionEnabled": "제안 활성/비활성",
    "tool.configure.args.minPatternCount": "제안 전 최소 발생 횟수",
    "tool.surface.description": "패턴을 surfaced(확인됨)로 표시",
    "tool.surface.args.patternId": "surfaced로 표시할 패턴 ID",
    "tool.reset.description": "학습된 패턴과 통계를 모두 초기화",
    "tool.reset.args.confirm": "초기화를 위해 true로 설정",
    "tool.grow.description": "프로젝트 방향과 성장 기회 분석",
    "tool.evolve.description": "감지된 패턴으로 새 능력을 제안/생성",
    "tool.evolve.args.accept": "능력으로 진화시킬 패턴 ID",
    "tool.level.description": "개인화된 응답을 위한 기술 수준 설정",
    "tool.level.args.level": "기술 수준",
    "tool.focus.description": "현재 프로젝트 포커스/우선순위 설정",
    "tool.focus.args.focus": "현재 포커스 영역",
    "tool.focus.args.stack": "쉼표로 구분한 기술 스택",
    "tool.mcp_search.description": "mcpmarket.com에서 MCP 서버 검색",
    "tool.mcp_search.args.query": "MCP 서버 검색어",
    "tool.mcp.description": "opencode.json에 MCP 서버 설정 추가",
    "tool.mcp.args.name": "MCP 서버 이름",
    "tool.mcp.args.url": "원격 MCP 서버 URL",
    "tool.mcp.args.command": "로컬 MCP 명령(쉼표 구분)",
    "tool.capabilities.description": "진화한 능력 목록",
    "tool.evolution_ready.description": "진화 준비된 도메인과 클러스터된 본능 보기",
    "evolution_ready.none":
      "📦 *두리번* 아직 진화 준비된 도메인이 없어. 도메인당 5개 이상 본능이 필요해...",
    "evolution_ready.hint": "`mimic-evolve`로 진화하거나, 유휴 시간에 자동 진화를 기다려.",

    "tool.instincts.description": "학습된 모든 본능 보기",
    "tool.instincts.args.domain": "도메인으로 필터 (선택)",
    "instincts.empty": "📦 *하품* 아직 학습한 본능이 없어. 계속 작업해, 지켜보고 있을게...",
    "instincts.title": "## 📦 학습된 본능",
    "instincts.total": "총 {count}개 본능",
    "instincts.auto_applied": "학습된 행동이 이 세션에 자동 적용되었습니다",

    "tool.context.description": "현재 파일과 브랜치 기반 컨텍스트 인식 본능 표시",
    "context.title": "📦 현재 컨텍스트",
    "context.current_file": "현재 파일",
    "context.current_branch": "현재 브랜치",
    "context.relevant_instincts": "관련 본능",
    "context.no_relevant": "📦 *두리번* 현재 컨텍스트에 관련된 본능이 없어.",

    "tool.export.description": "다른 프로젝트와 공유하기 위해 본능 내보내기",
    "export.empty": "📦 *덜컹* 내보낼 게 없어. 먼저 본능을 학습해!",
    "export.success": "📦 *뿌듯한 딸깍* {count}개 본능을 내보냈어:\n`{path}`",

    "tool.import.description": "다른 프로젝트에서 본능 가져오기",
    "tool.import.args.path": "내보낸 본능 JSON 파일 경로",
    "import.not_found": "📦 *갸우뚱* 파일을 찾을 수 없어: {path}",
    "import.success": "📦 *지식 흡수* {from}에서 {count}개 본능을 가져왔어!",
    "import.error": "📦 *퉤* 본능 파일 파싱 실패. 형식이 잘못됐어.",

    "tool.apply.description": "현재 작업과 관련된 본능 표시",
    "apply.none": "📦 *두리번* 현재 컨텍스트에 관련된 본능이 없어.",
    "apply.title": "## 📦 적용 가능한 본능",

    "tool.identity.description": "Mimic의 정체성과 성격 보기",
    "identity.title": "## 📦 나는 누구인가?",
    "identity.personality": "성격",
    "identity.awakened": "깨어난 날",
    "identity.days": "일 전",
    "identity.instincts_learned": "학습한 본능",
    "identity.evolutions": "진화 횟수",
    "identity.favorite_domains": "선호 도메인",
    "identity.error": "📦 *갸우뚱* 정체성을 초기화할 수 없어요. 다시 시도해주세요.",

    "tool.sequences.description": "감지된 도구 사용 시퀀스 보기",
    "sequences.empty": "📦 *귀 기울임* 아직 시퀀스가 감지되지 않았어. 계속 도구를 써봐...",
    "sequences.title": "## 📦 도구 시퀀스",

    "observer.skill_generated": "스킬 생성됨: {name}",
    "skill.domain_description": "{domain} 도메인 전문 스킬",

    "tool.observations.description": "이 세션의 관찰 로그 보기",
    "tool.observations.args.limit": "표시할 최대 관찰 수",
    "tool.observations.args.types": "필터할 관찰 유형(쉼표 구분)",
    "observations.title": "## 📦 관찰 로그",
    "observations.empty": "📦 *비어있음* 아직 기록된 관찰이 없어.",
    "observations.stats": "**총**: {count}개 관찰, **크기**: {size}",

    "tool.session_context.description": "이전 세션 컨텍스트 가져오기",
    "session_context.title": "## 📦 세션 컨텍스트",
    "session_context.empty": "📦 *하품* 분석할 이전 세션이 없어.",
    "session_context.patterns_title": "**세션 간 패턴:**",

    "tool.generate_skills.description": "학습된 본능으로 선언적 스킬 생성",
    "generate_skills.title": "## 📦 스킬 생성",
    "generate_skills.empty":
      "📦 *어깨 으쓱* 스킬을 생성할 본능이 부족해. 도메인당 5개 이상 필요해.",
    "generate_skills.success": "{count}개 스킬 생성됨:",

    "tool.error_suggest.description": "학습된 패턴을 기반으로 에러 수정 제안",
    "tool.error_patterns.description": "학습된 에러 패턴 목록",
    "error.no_patterns": "📦 *두리번* 아직 학습된 에러 패턴이 없어. 에러를 만나면 기억할게...",
    "error.patterns_title": "## 📦 학습된 에러 패턴 ({count}개)",
    "error.suggest_title": "## 📦 수정 제안",
    "error.fix_confidence": "- 신뢰도: {confidence}%",
    "error.tools_used": "- 사용된 도구: {tools}",
    "error.files_changed": "- 변경된 파일: {files}",

    "tool.macro_record.description": "매크로 녹화 시작/중지",
    "tool.macro_record.args.action": "수행할 작업: start 또는 stop",
    "tool.macro_record.args.name": "매크로 이름 (중지 시)",
    "tool.macro_record.args.description": "매크로 설명",
    "tool.macro_list.description": "저장된 매크로 목록",
    "tool.macro_run.description": "ID로 저장된 매크로 실행",
    "tool.macro_run.args.id": "실행할 매크로 ID",
    "tool.macro_save.description": "최근 도구 시퀀스를 매크로로 저장",
    "tool.macro_save.args.name": "매크로 이름",
    "tool.macro_save.args.description": "매크로 설명",
    "tool.macro_save.args.lastN": "포함할 상위 시퀀스 수",
    "tool.macro_delete.description": "저장된 매크로 삭제",
    "tool.macro_delete.args.id": "삭제할 매크로 ID",
    "macro.recording_started": "📼 *딸깍* 녹화 시작! 사용하는 모든 도구를 기억할게...",
    "macro.recording_stopped": "📼 *딸깍* 녹화 중지.",
    "macro.recording_empty": "📦 *갸우뚱* 녹화된 단계가 없어. 먼저 녹화를 시작해!",
    "macro.saved": "📼 *윙윙* 매크로 '{name}'가 {steps}단계로 저장됐어!",
    "macro.list_title": "## 📼 저장된 매크로",
    "macro.list_empty": "📦 *조용* 저장된 매크로가 없어. `mimic-macro-record`로 만들어봐!",
    "macro.not_found": "📦 *갸우뚱* 매크로를 찾을 수 없어: {id}",
    "macro.run_title": "## 📼 매크로 실행 중: {name}",
    "macro.run_instructions": "다음 단계를 순서대로 실행해:",
    "macro.run_hint": "각 도구를 순서대로 복사해서 실행해.",
    "macro.no_sequences": "📦 *하품* 아직 도구 시퀀스가 기록되지 않았어. 도구를 계속 써봐...",
    "macro.deleted": "📼 매크로 '{id}' 삭제됨.",
    "macro.description": "설명",
    "macro.steps": "단계",
    "macro.use_count": "사용 횟수",
    "macro.tags": "태그",
    "macro.sequence": "시퀀스",

    "tool.commit_suggest.description": "변경사항과 세션 기반 커밋 메시지 제안",
    "tool.commit.description": "제안된 또는 커스텀 메시지로 git 커밋 실행",
    "tool.commit.args.message": "커스텀 커밋 메시지",
    "tool.commit.args.suggestion": "제안 번호 사용 (1, 2, 3...)",
    "tool.commit.args.dry_run": "커밋 없이 미리보기",
    "commit.no_changes": "📦 *빈 스테이지를 본다* 커밋할 변경사항이 없어.",
    "commit.suggestions_title": "## 📦 커밋 제안",
    "commit.files_changed": "변경된 파일",
    "commit.additions": "추가",
    "commit.deletions": "삭제",
    "commit.type": "유형",
    "commit.scope": "범위",
    "commit.confidence": "신뢰도",
    "commit.usage_hint":
      '`mimic-commit({ suggestion: 1 })` 또는 `mimic-commit({ message: "..." })` 사용',
    "commit.no_message": "📦 *갸우뚱* 메시지가 없어. 제안 번호를 쓰거나 메시지를 입력해.",
    "commit.dry_run": "📦 *미리보기* 다음 메시지로 커밋됨: `{message}`",
    "commit.executed": "📦 ✅ 커밋 완료: `{message}`",
    "commit.failed": "📦 ❌ 커밋 실패. git status를 확인해봐.",
  },
};

export async function loadMimicConfig(): Promise<MimicUserConfig> {
  const configPath = join(homedir(), ".config", "opencode", "mimic.json");
  if (!existsSync(configPath)) return {};

  try {
    const raw = await readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as MimicUserConfig;
  } catch {
    return {};
  }
}

export function resolveLanguage(config?: MimicUserConfig | null): Language {
  if (config?.language === "ko-KR") return "ko-KR";
  return DEFAULT_LANGUAGE;
}

export interface I18n {
  language: Language;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = vars[key];
    return value === undefined ? "" : String(value);
  });
}

export function createI18n(language: Language): I18n {
  return {
    language,
    t: (key, vars) => {
      const dict = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE];
      const fallback = MESSAGES[DEFAULT_LANGUAGE];
      const template = dict[key] ?? fallback[key] ?? key;
      return interpolate(template, vars);
    },
  };
}

export function formatCapabilityType(i18n: I18n, type: string): string {
  return i18n.t(`evolution.type.${type}`);
}

export function formatLevelLabel(i18n: I18n, level: string): string {
  return i18n.t(`level.label.${level}`);
}

export function formatGreetingStyle(i18n: I18n, style: string): string {
  return i18n.t(`level.style.${style}`);
}

export function formatDetailLevel(i18n: I18n, detail: string): string {
  return i18n.t(`level.detail.${detail}`);
}

export function formatPatternType(i18n: I18n, type: string): string {
  return i18n.t(`patterns.type.${type}`);
}
