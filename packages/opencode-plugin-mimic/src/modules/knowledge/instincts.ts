import type { MimicContext } from "@/core/context";
import type { Domain, Instinct, Pattern } from "@/types";
import { DOMAINS } from "@/types";
import { generateDeterministicId } from "@/utils/id";

const MIN_CONFIDENCE = 0.6;
const MIN_INSTINCTS_FOR_EVOLUTION = 5;

export function generateInstinctId(domain: string, title: string): string {
  return generateDeterministicId(domain, title);
}

export function normalizeDomain(rawDomain: string): Domain {
  const lower = rawDomain.toLowerCase().trim();

  const synonyms: Record<string, Domain> = {
    "code-style": "code-style",
    codestyle: "code-style",
    style: "code-style",
    formatting: "code-style",
    testing: "testing",
    test: "testing",
    tests: "testing",
    git: "git",
    vcs: "git",
    "version-control": "git",
    debugging: "debugging",
    debug: "debugging",
    "file-organization": "file-organization",
    files: "file-organization",
    organization: "file-organization",
    tooling: "tooling",
    tools: "tooling",
    refactoring: "refactoring",
    refactor: "refactoring",
    documentation: "documentation",
    docs: "documentation",
  };

  if (synonyms[lower]) {
    return synonyms[lower];
  }

  if (DOMAINS.includes(lower as Domain)) {
    return lower as Domain;
  }

  return "other";
}

export function groupByDomain(instincts: Instinct[]): Map<Domain, Instinct[]> {
  const map = new Map<Domain, Instinct[]>();

  for (const instinct of instincts) {
    if (instinct.status !== "approved") continue;
    if (instinct.confidence < MIN_CONFIDENCE) continue;

    const list = map.get(instinct.domain) || [];
    list.push(instinct);
    map.set(instinct.domain, list);
  }

  return map;
}

export function getEligibleDomains(domainMap: Map<Domain, Instinct[]>): Domain[] {
  const eligible: Domain[] = [];

  for (const [domain, instincts] of domainMap) {
    if (instincts.length >= MIN_INSTINCTS_FOR_EVOLUTION) {
      eligible.push(domain);
    }
  }

  return eligible;
}

export function shouldTriggerEvolution(
  domain: Domain,
  evolvedDomains: Record<string, string> | undefined,
  cooldownDays = 7,
): boolean {
  if (!evolvedDomains?.[domain]) {
    return true;
  }

  const lastEvolved = new Date(evolvedDomains[domain]);
  const now = new Date();
  const diffDays = (now.getTime() - lastEvolved.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= cooldownDays;
}

export function findRepresentativePattern(
  instincts: Instinct[],
  patterns: Pattern[],
): Pattern | null {
  const patternIDs = new Set<string>();
  for (const instinct of instincts) {
    for (const id of instinct.evidence.patternIDs) {
      patternIDs.add(id);
    }
  }

  let bestPattern: Pattern | null = null;
  let maxCount = 0;

  for (const pattern of patterns) {
    if (patternIDs.has(pattern.id) && pattern.count > maxCount) {
      maxCount = pattern.count;
      bestPattern = pattern;
    }
  }

  if (!bestPattern && patterns.length > 0) {
    const unsurfaced = patterns.find((p) => !p.surfaced);
    bestPattern = unsurfaced || patterns[0];
  }

  return bestPattern;
}

export async function clusterDomainsAndTriggerEvolution(ctx: MimicContext): Promise<Domain[]> {
  const state = await ctx.stateManager.read();
  const instincts = await ctx.stateManager.listInstincts();

  const domainMap = groupByDomain(instincts);
  const eligible = getEligibleDomains(domainMap);
  const triggered: Domain[] = [];

  for (const domain of eligible) {
    if (!shouldTriggerEvolution(domain, state.evolution.evolvedDomains)) {
      continue;
    }

    triggered.push(domain);

    if (!state.evolution.pendingSuggestions.includes(domain)) {
      state.evolution.pendingSuggestions.push(domain);
    }
  }

  if (triggered.length > 0) {
    await ctx.stateManager.save(state);
  }

  return triggered;
}
