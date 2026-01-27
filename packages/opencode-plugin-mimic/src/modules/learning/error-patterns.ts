import type { MimicContext } from "@/core/context";
import type { ErrorFix, ErrorPattern } from "@/types";
import { generateId } from "@/utils/id";

const FILE_PATH_REGEX = /(?:\/[\w.-]+)+(?:\.\w+)?/g;
const LINE_NUMBER_REGEX = /(?:line\s*)?:?\s*\d+(?::\d+)?/gi;
const MEMORY_ADDRESS_REGEX = /0x[0-9a-fA-F]+/g;
const TIMESTAMP_REGEX = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/g;
const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function normalizeErrorSignature(error: string): string {
  let normalized = error;

  normalized = normalized.replace(FILE_PATH_REGEX, "<PATH>");
  normalized = normalized.replace(LINE_NUMBER_REGEX, "<LINE>");
  normalized = normalized.replace(MEMORY_ADDRESS_REGEX, "<ADDR>");
  normalized = normalized.replace(TIMESTAMP_REGEX, "<TIMESTAMP>");
  normalized = normalized.replace(UUID_REGEX, "<UUID>");

  normalized = normalized.replace(/\s+/g, " ").trim();
  normalized = normalized.slice(0, 200);

  return normalized;
}

export function detectErrorType(error: string): string {
  const lowerError = error.toLowerCase();

  if (
    lowerError.includes("typescript") ||
    lowerError.includes("tsc") ||
    lowerError.includes("type error") ||
    lowerError.includes("cannot find module") ||
    lowerError.includes("compilation failed") ||
    lowerError.includes("syntax error")
  ) {
    return "compile";
  }

  if (
    lowerError.includes("eslint") ||
    lowerError.includes("biome") ||
    lowerError.includes("prettier") ||
    lowerError.includes("warning:") ||
    lowerError.includes("lint error")
  ) {
    return "lint";
  }

  if (
    lowerError.includes("test") ||
    lowerError.includes("vitest") ||
    lowerError.includes("jest") ||
    lowerError.includes("expect") ||
    lowerError.includes("assertion") ||
    lowerError.includes("failed to match")
  ) {
    return "test";
  }

  return "runtime";
}

export async function recordError(
  ctx: MimicContext,
  error: string,
  _sessionId: string,
): Promise<ErrorPattern> {
  const signature = normalizeErrorSignature(error);
  const errorType = detectErrorType(error);

  const existingPatterns = await ctx.stateManager.listErrorPatterns();
  const existing = existingPatterns.find((p) => p.errorSignature === signature);

  if (existing) {
    existing.occurrences += 1;
    existing.lastSeen = new Date().toISOString();
    await ctx.stateManager.writeErrorPattern(existing);
    return existing;
  }

  const newPattern: ErrorPattern = {
    id: `err-${generateId()}`,
    errorSignature: signature,
    errorType,
    fixes: [],
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    occurrences: 1,
  };

  await ctx.stateManager.writeErrorPattern(newPattern);
  return newPattern;
}

export async function recordFix(
  ctx: MimicContext,
  errorId: string,
  fix: Partial<ErrorFix>,
): Promise<void> {
  const pattern = await ctx.stateManager.getErrorPattern(errorId);
  if (!pattern) return;

  const existingFix = pattern.fixes.find(
    (f) => f.description === fix.description || arraysEqual(f.toolSequence, fix.toolSequence || []),
  );

  if (existingFix) {
    existingFix.successCount += 1;
    existingFix.confidence =
      existingFix.successCount / (existingFix.successCount + existingFix.failCount);
    if (fix.filesChanged) {
      existingFix.filesChanged = [...new Set([...existingFix.filesChanged, ...fix.filesChanged])];
    }
  } else {
    const newFix: ErrorFix = {
      description: fix.description || "Unknown fix",
      toolSequence: fix.toolSequence || [],
      filesChanged: fix.filesChanged || [],
      confidence: 1.0,
      successCount: 1,
      failCount: 0,
    };
    pattern.fixes.push(newFix);
  }

  pattern.lastSeen = new Date().toISOString();
  await ctx.stateManager.writeErrorPattern(pattern);
}

export async function findSimilarErrors(ctx: MimicContext, error: string): Promise<ErrorPattern[]> {
  const signature = normalizeErrorSignature(error);
  const errorType = detectErrorType(error);
  const patterns = await ctx.stateManager.listErrorPatterns();

  const exactMatch = patterns.find((p) => p.errorSignature === signature);
  if (exactMatch) {
    return [exactMatch];
  }

  const signatureWords = signature.split(" ").filter((w) => w.length > 3);
  const scored = patterns
    .filter((p) => p.errorType === errorType)
    .map((p) => {
      const patternWords = p.errorSignature.split(" ").filter((w) => w.length > 3);
      const common = signatureWords.filter((w) => patternWords.includes(w)).length;
      const score = common / Math.max(signatureWords.length, patternWords.length);
      return { pattern: p, score };
    })
    .filter((s) => s.score > 0.3)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((s) => s.pattern);
}

export async function suggestFixes(ctx: MimicContext, error: string): Promise<ErrorFix[]> {
  const similarPatterns = await findSimilarErrors(ctx, error);

  const allFixes = similarPatterns.flatMap((p) => p.fixes);
  const uniqueFixes = allFixes.reduce<ErrorFix[]>((acc, fix) => {
    const exists = acc.find((f) => f.description === fix.description);
    if (!exists) {
      acc.push(fix);
    }
    return acc;
  }, []);

  return uniqueFixes.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
