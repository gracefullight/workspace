import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { enUS, ko } from "date-fns/locale";
import type { MimicContext } from "@/core/context";
import { formatCapabilityType } from "@/lib/i18n";
import type { State } from "@/types";

export type SessionStatus =
  | "first-time"
  | "continuing"
  | "same-day"
  | "short-break"
  | "week-break"
  | "long-break";

export function analyzeTimeSinceLastSession(lastSession: string | null): SessionStatus {
  if (!lastSession) return "first-time";
  const hours = differenceInHours(new Date(), new Date(lastSession));
  if (hours < 1) return "continuing";
  if (hours < 24) return "same-day";
  if (hours < 72) return "short-break";
  if (hours < 168) return "week-break";
  return "long-break";
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex narrative formatting for Mimic's journey display
export function formatJourney(ctx: MimicContext, state: State, gitHistory: string[]): string {
  const milestones = state.journey.milestones.slice(-10);
  const observations = state.journey.observations.slice(-5);
  const locale = ctx.i18n.language === "ko-KR" ? ko : enUS;

  let output = `${ctx.i18n.t("journey.title", { project: state.project.name })}\n\n`;
  output += `${ctx.i18n.t("journey.subtitle")}\n\n`;
  output += `${ctx.i18n.t("journey.sessions_survived", {
    count: state.journey.sessionCount,
  })}\n`;
  output += `${ctx.i18n.t("journey.first_encounter", {
    date: format(state.project.firstSession, "yyyy-MM-dd"),
  })}\n`;
  output += `${ctx.i18n.t("journey.abilities_gained", {
    count: state.evolution.capabilities.length,
  })}\n\n`;

  if (state.project.stack && state.project.stack.length > 0) {
    output += `${ctx.i18n.t("journey.treasures", {
      stack: state.project.stack.join(", "),
    })}\n`;
  }
  if (state.project.focus) {
    output += `${ctx.i18n.t("journey.current_hunt", { focus: state.project.focus })}\n`;
  }
  output += "\n";

  if (milestones.length > 0) {
    output += `${ctx.i18n.t("journey.victories")}\n`;
    for (const m of milestones) {
      const timeAgo = formatDistanceToNow(new Date(m.timestamp), { addSuffix: true, locale });
      output += `- ${m.milestone} (${timeAgo})\n`;
    }
    output += "\n";
  }

  if (observations.length > 0) {
    output += `${ctx.i18n.t("journey.witnessed")}\n`;
    for (const o of observations) {
      output += `- ${o.observation}\n`;
    }
    output += "\n";
  }

  if (state.evolution.capabilities.length > 0) {
    output += `${ctx.i18n.t("journey.powers")}\n`;
    for (const cap of state.evolution.capabilities.slice(-5)) {
      output += `- **${cap.name}** (${formatCapabilityType(
        ctx.i18n,
        cap.type,
      )}): ${cap.description}\n`;
    }
    output += "\n";
  }

  if (gitHistory.length > 0) {
    output += `${ctx.i18n.t("journey.scrolls")}\n`;
    for (const commit of gitHistory.slice(0, 5)) {
      output += `- ${commit}\n`;
    }
  }

  return output;
}

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 1000 / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

export function formatGrowAnalysis(
  ctx: MimicContext,
  state: State,
  _gitHistory: string[],
  recentFiles: string[],
): string {
  let output = `${ctx.i18n.t("grow.title", { project: state.project.name })}\n\n`;
  output += `${ctx.i18n.t("grow.subtitle")}\n\n`;

  const fileFrequency = Object.entries(state.statistics.filesModified)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (fileFrequency.length > 0) {
    output += `${ctx.i18n.t("grow.feeding_grounds")}\n`;
    for (const [file, count] of fileFrequency) {
      output += `- \`${file}\` ${ctx.i18n.t("grow.files_modified", { count })}\n`;
    }
    output += "\n";
  }

  const toolPatterns = state.patterns
    .filter((p) => p.type === "tool")
    .sort((a, b) => b.count - a.count);
  if (toolPatterns.length > 0) {
    output += `${ctx.i18n.t("grow.favorite_prey")}\n`;
    for (const p of toolPatterns.slice(0, 5)) {
      output += `- ${p.description}: ${p.count}\n`;
    }
    output += "\n";
  }

  if (recentFiles.length > 0) {
    const dirCount = new Map<string, number>();
    for (const file of recentFiles) {
      const dir = file.split("/").slice(0, -1).join("/") || ".";
      dirCount.set(dir, (dirCount.get(dir) || 0) + 1);
    }
    const sortedDirs = [...dirCount.entries()].sort((a, b) => b[1] - a[1]);

    output += `${ctx.i18n.t("grow.hunting_grounds")}\n`;
    for (const [dir, count] of sortedDirs.slice(0, 5)) {
      output += `- \`${dir}/\` ${ctx.i18n.t("grow.prey", { count })}\n`;
    }
    output += "\n";
  }

  output += `${ctx.i18n.t("grow.questions")}\n`;
  output += `${ctx.i18n.t("grow.question1")}\n`;
  output += `${ctx.i18n.t("grow.question2")}\n`;
  output += `${ctx.i18n.t("grow.question3")}\n`;

  if (state.project.focus) {
    output += `\n${ctx.i18n.t("grow.current_hunt", { focus: state.project.focus })}\n`;
  }

  return output;
}
