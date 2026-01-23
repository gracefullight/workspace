import type { MimicContext } from "@/core/context";
import type { Language } from "@/lib/i18n";
import type { Domain, Instinct } from "@/types";

interface AppliedInstinct {
  instinct: Instinct;
  relevance: "high" | "medium" | "low";
}

/**
 * Domain keywords for pattern detection.
 * English keywords are always matched (base).
 * Korean keywords are additionally matched when language is ko-KR.
 */
const DOMAIN_KEYWORDS_BY_LANG: Record<Language, Record<Domain, string[]>> = {
  "en-US": {
    "code-style": ["style", "format", "lint", "prettier", "eslint", "naming", "convention"],
    testing: ["test", "spec", "jest", "vitest", "mocha", "coverage", "assert", "expect"],
    git: ["commit", "branch", "merge", "push", "pull", "rebase", "stash", "git"],
    debugging: ["debug", "error", "fix", "bug", "issue", "trace", "log", "breakpoint"],
    "file-organization": ["move", "rename", "organize", "structure", "folder", "directory"],
    tooling: ["tool", "script", "build", "compile", "bundle", "config"],
    refactoring: ["refactor", "extract", "inline", "rename", "move", "simplify"],
    documentation: ["doc", "readme", "comment", "jsdoc", "markdown", "wiki"],
    other: [],
  },
  "ko-KR": {
    "code-style": ["스타일", "포맷", "린트", "네이밍", "컨벤션", "코딩규칙", "정렬"],
    testing: ["테스트", "단위테스트", "커버리지", "검증", "확인", "단언"],
    git: ["커밋", "브랜치", "병합", "푸시", "풀", "리베이스", "스태시", "깃"],
    debugging: ["디버그", "디버깅", "오류", "에러", "수정", "버그", "이슈", "추적", "로그"],
    "file-organization": ["이동", "이름변경", "정리", "구조", "폴더", "디렉토리", "파일정리"],
    tooling: ["도구", "스크립트", "빌드", "컴파일", "번들", "설정", "구성"],
    refactoring: ["리팩터", "리팩토링", "추출", "인라인", "단순화", "개선"],
    documentation: ["문서", "문서화", "주석", "리드미", "마크다운", "위키", "설명"],
    other: [],
  },
};

/**
 * Get combined keywords for a domain based on language.
 * Always includes en-US keywords, adds ko-KR keywords if language is Korean.
 */
function getDomainKeywords(domain: Domain, language: Language = "en-US"): string[] {
  const enKeywords = DOMAIN_KEYWORDS_BY_LANG["en-US"][domain] || [];
  if (language === "ko-KR") {
    const koKeywords = DOMAIN_KEYWORDS_BY_LANG["ko-KR"][domain] || [];
    return [...enKeywords, ...koKeywords];
  }
  return enKeywords;
}

export function detectCurrentDomain(
  recentTools: string[],
  recentFiles: string[],
  language: Language = "en-US",
): Domain[] {
  const domains: Domain[] = [];
  const context = [...recentTools, ...recentFiles].join(" ").toLowerCase();

  const allDomains: Domain[] = [
    "code-style",
    "testing",
    "git",
    "debugging",
    "file-organization",
    "tooling",
    "refactoring",
    "documentation",
  ];

  for (const domain of allDomains) {
    const keywords = getDomainKeywords(domain, language);
    if (keywords.some((kw) => context.includes(kw))) {
      domains.push(domain);
    }
  }

  // Additional heuristics for common patterns
  if (recentTools.some((t) => t.includes("test") || t.includes("vitest") || t.includes("테스트"))) {
    if (!domains.includes("testing")) domains.push("testing");
  }

  if (recentTools.some((t) => t.includes("git") || t.includes("commit") || t.includes("커밋"))) {
    if (!domains.includes("git")) domains.push("git");
  }

  return domains.length > 0 ? domains : ["other"];
}

export function filterRelevantInstincts(
  instincts: Instinct[],
  currentDomains: Domain[],
): AppliedInstinct[] {
  const applied: AppliedInstinct[] = [];

  for (const instinct of instincts) {
    if (instinct.status !== "approved") continue;
    if (instinct.confidence < 0.5) continue;

    if (currentDomains.includes(instinct.domain)) {
      applied.push({
        instinct,
        relevance:
          instinct.confidence >= 0.8 ? "high" : instinct.confidence >= 0.6 ? "medium" : "low",
      });
    }
  }

  return applied.sort((a, b) => b.instinct.confidence - a.instinct.confidence).slice(0, 3);
}

export function formatInstinctSuggestion(
  applied: AppliedInstinct,
  _i18n: MimicContext["i18n"],
): string {
  const confidenceBar =
    "●".repeat(Math.round(applied.instinct.confidence * 5)) +
    "○".repeat(5 - Math.round(applied.instinct.confidence * 5));

  const sourceTag = applied.instinct.source === "inherited" ? " 📥" : "";

  return `[${confidenceBar}] ${applied.instinct.title}${sourceTag}`;
}

export async function getApplicableInstincts(
  ctx: MimicContext,
  recentTools: string[],
  recentFiles: string[],
): Promise<AppliedInstinct[]> {
  const instincts = await ctx.stateManager.listInstincts();
  const currentDomains = detectCurrentDomain(recentTools, recentFiles, ctx.i18n.language);
  return filterRelevantInstincts(instincts, currentDomains);
}

/**
 * Build a context string from approved instincts for auto-injection.
 * This simulates Homunculus's instinct-apply skill behavior.
 */
export async function buildInstinctContext(ctx: MimicContext): Promise<string | null> {
  const instincts = await ctx.stateManager.listInstincts();
  const approvedInstincts = instincts.filter((i) => i.status === "approved" && i.confidence >= 0.6);

  if (approvedInstincts.length === 0) {
    return null;
  }

  // Group by domain for organized presentation
  const byDomain: Record<string, Instinct[]> = {};
  for (const instinct of approvedInstincts) {
    if (!byDomain[instinct.domain]) {
      byDomain[instinct.domain] = [];
    }
    byDomain[instinct.domain].push(instinct);
  }

  const sections: string[] = ["## Learned Behaviors (Auto-Applied)"];

  for (const [domain, domainInstincts] of Object.entries(byDomain)) {
    const sorted = domainInstincts.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
    sections.push(`\n### ${domain}`);

    for (const instinct of sorted) {
      const confidenceLabel =
        instinct.confidence >= 0.8 ? "strong" : instinct.confidence >= 0.6 ? "moderate" : "weak";
      sections.push(`- **${instinct.title}** (${confidenceLabel}): ${instinct.description}`);
    }
  }

  sections.push(
    "\n_These behaviors were learned from your patterns. They are auto-applied to help maintain consistency._",
  );

  return sections.join("\n");
}

/**
 * Get instincts relevant to the current context (for real-time surfacing)
 */
export async function getContextualInstincts(
  ctx: MimicContext,
  tools: string[],
  files: string[],
): Promise<{ context: string; count: number }> {
  const applicable = await getApplicableInstincts(ctx, tools, files);

  if (applicable.length === 0) {
    return { context: "", count: 0 };
  }

  const lines = applicable.map((a) => formatInstinctSuggestion(a, ctx.i18n));

  return {
    context: `**Relevant Instincts:**\n${lines.join("\n")}`,
    count: applicable.length,
  };
}
