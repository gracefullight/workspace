import type { I18n } from "@/lib/i18n";
import type { CreatorLevel, State } from "@/types";

interface LevelConfig {
  greetingStyle: "formal" | "casual" | "minimal" | "chaotic";
  detailLevel: "high" | "medium" | "low";
  useEmoji: boolean;
  technicalTerms: boolean;
}

const LEVEL_CONFIGS: Record<CreatorLevel, LevelConfig> = {
  technical: {
    greetingStyle: "minimal",
    detailLevel: "high",
    useEmoji: false,
    technicalTerms: true,
  },
  "semi-technical": {
    greetingStyle: "casual",
    detailLevel: "medium",
    useEmoji: false,
    technicalTerms: true,
  },
  "non-technical": {
    greetingStyle: "formal",
    detailLevel: "low",
    useEmoji: true,
    technicalTerms: false,
  },
  chaotic: {
    greetingStyle: "chaotic",
    detailLevel: "medium",
    useEmoji: true,
    technicalTerms: true,
  },
};

export function getLevelConfig(level: CreatorLevel | null): LevelConfig {
  return LEVEL_CONFIGS[level ?? "technical"];
}

export function adaptMessage(message: string, state: State): string {
  const config = getLevelConfig(state.project.creatorLevel);

  if (config.greetingStyle === "minimal") {
    return message.replace(/^#+\s*/gm, "").trim();
  }

  if (config.greetingStyle === "chaotic") {
    const chaosEmojis = ["🔥", "⚡", "🚀", "💥", "✨"];
    const emoji = chaosEmojis[Math.floor(Math.random() * chaosEmojis.length)];
    return `${emoji} ${message}`;
  }

  return message;
}

export function formatGreeting(i18n: I18n, state: State): string {
  const config = getLevelConfig(state.project.creatorLevel);
  const name = state.project.name;

  switch (config.greetingStyle) {
    case "minimal":
      return i18n.t("level.greeting.minimal", {
        project: name,
        sessions: state.journey.sessionCount,
        patterns: state.patterns.length,
      });
    case "casual":
      return i18n.t("level.greeting.casual", {
        project: name,
        sessions: state.journey.sessionCount,
      });
    case "formal":
      return i18n.t("level.greeting.formal", {
        project: name,
        sessions: state.journey.sessionCount,
      });
    case "chaotic": {
      const greetings = [
        i18n.t("level.greeting.chaotic.chomp"),
        i18n.t("level.greeting.chaotic.lid_creaks"),
        i18n.t("level.greeting.chaotic.teeth_gleam"),
        i18n.t("level.greeting.chaotic.tongue_flicks"),
      ];
      const g = greetings[Math.floor(Math.random() * greetings.length)];
      return i18n.t("level.greeting.chaotic.template", {
        tag: g,
        project: name,
        sessions: state.journey.sessionCount,
      });
    }
  }
}

export function formatSuggestion(i18n: I18n, suggestion: string, state: State): string {
  const config = getLevelConfig(state.project.creatorLevel);

  if (!config.technicalTerms) {
    const replacements: Array<[string, string]> = [
      [i18n.t("level.term.tool"), i18n.t("level.term.shortcut")],
      [i18n.t("level.term.pattern"), i18n.t("level.term.habit")],
      [i18n.t("level.term.hook"), i18n.t("level.term.automation")],
    ];
    let result = suggestion;
    for (const [from, to] of replacements) {
      if (!from || from === to) continue;
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, "gi"), to);
    }
    return result;
  }

  return suggestion;
}
