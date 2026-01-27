import { DOMAIN_KEYWORDS_BY_LANG } from "@/constants/domain";
import type { MimicContext } from "@/core/context";
import type { Language } from "@/lib/i18n";
import type { Domain, Instinct } from "@/types";

interface AppliedInstinct {
  instinct: Instinct;
  relevance: "high" | "medium" | "low";
}

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

export interface BuildInstinctContextOptions {
  currentFile?: string;
  currentBranch?: string;
  recentTools?: string[];
  recentFiles?: string[];
}

/**
 * Build a context string from approved instincts for auto-injection.
 * This simulates Homunculus's instinct-apply skill behavior.
 * Optionally accepts context information for context-aware filtering.
 */
export async function buildInstinctContext(
  ctx: MimicContext,
  options?: BuildInstinctContextOptions,
): Promise<string | null> {
  const instincts = await ctx.stateManager.listInstincts();
  let approvedInstincts = instincts.filter((i) => i.status === "approved" && i.confidence >= 0.6);

  if (approvedInstincts.length === 0) {
    return null;
  }

  if (options) {
    const contextDomains = detectContextDomains(options, ctx.i18n.language);
    if (contextDomains.length > 0) {
      const contextFiltered = approvedInstincts.filter((i) => contextDomains.includes(i.domain));
      if (contextFiltered.length > 0) {
        approvedInstincts = contextFiltered;
      }
    }
  }

  return formatInstinctsOutput(approvedInstincts);
}

function formatInstinctsOutput(instincts: Instinct[]): string {
  const byDomain: Record<string, Instinct[]> = {};
  for (const instinct of instincts) {
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

function detectContextDomains(options: BuildInstinctContextOptions, language: Language): Domain[] {
  const domains: Set<Domain> = new Set();

  collectFileDomains(domains, options.currentFile);
  collectBranchDomains(domains, options.currentBranch);
  collectRecentFilesDomains(domains, options.recentFiles);
  collectToolDomains(domains, options.recentTools, options.recentFiles, language);

  return Array.from(domains);
}

function collectFileDomains(domains: Set<Domain>, file?: string) {
  if (file) {
    const d = inferDomainFromFilePath(file);
    if (d) domains.add(d);
  }
}

function collectBranchDomains(domains: Set<Domain>, branch?: string) {
  if (branch) {
    const d = inferDomainFromBranchName(branch);
    if (d) domains.add(d);
  }
}

function collectRecentFilesDomains(domains: Set<Domain>, files?: string[]) {
  if (files) {
    for (const file of files) {
      const d = inferDomainFromFilePath(file);
      if (d) domains.add(d);
    }
  }
}

function collectToolDomains(
  domains: Set<Domain>,
  tools?: string[],
  files: string[] = [],
  language: Language = "en-US",
) {
  if (tools) {
    const toolDomains = detectCurrentDomain(tools, files, language);
    for (const d of toolDomains) {
      domains.add(d);
    }
  }
}

function inferDomainFromFilePath(filePath: string): Domain | null {
  const lowerPath = filePath.toLowerCase();

  if (
    lowerPath.includes("/test/") ||
    lowerPath.includes("/__tests__/") ||
    /\.(test|spec)\.[jt]sx?$/.test(lowerPath)
  ) {
    return "testing";
  }

  if (lowerPath.includes("/docs/") || lowerPath.includes("/documentation/")) {
    return "documentation";
  }

  if (/\.config\.[jt]s$/.test(lowerPath) || /\.config\.json$/.test(lowerPath)) {
    return "tooling";
  }

  if (lowerPath.includes("/.git/") || lowerPath.includes("/git/")) {
    return "git";
  }

  return null;
}

function inferDomainFromBranchName(branch: string): Domain | null {
  const lowerBranch = branch.toLowerCase();

  if (lowerBranch.startsWith("feature/test") || lowerBranch.startsWith("test/")) {
    return "testing";
  }

  if (
    lowerBranch.startsWith("fix/") ||
    lowerBranch.startsWith("bugfix/") ||
    lowerBranch.startsWith("hotfix/")
  ) {
    return "debugging";
  }

  if (lowerBranch.startsWith("docs/") || lowerBranch.startsWith("documentation/")) {
    return "documentation";
  }

  if (lowerBranch.startsWith("refactor/") || lowerBranch.startsWith("refactoring/")) {
    return "refactoring";
  }

  if (lowerBranch.startsWith("chore/") || lowerBranch.startsWith("tooling/")) {
    return "tooling";
  }

  return null;
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
