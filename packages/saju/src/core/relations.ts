import type { Element } from "./ten-gods";

export type StemCombinationResult = {
  stems: [string, string];
  resultElement: Element;
};

export const STEM_COMBINATIONS: StemCombinationResult[] = [
  { stems: ["甲", "己"], resultElement: "earth" },
  { stems: ["乙", "庚"], resultElement: "metal" },
  { stems: ["丙", "辛"], resultElement: "water" },
  { stems: ["丁", "壬"], resultElement: "wood" },
  { stems: ["戊", "癸"], resultElement: "fire" },
];

export type BranchCombinationResult = {
  branches: [string, string];
  resultElement: Element;
};

export const BRANCH_SIX_COMBINATIONS: BranchCombinationResult[] = [
  { branches: ["子", "丑"], resultElement: "earth" },
  { branches: ["寅", "亥"], resultElement: "wood" },
  { branches: ["卯", "戌"], resultElement: "fire" },
  { branches: ["辰", "酉"], resultElement: "metal" },
  { branches: ["巳", "申"], resultElement: "water" },
  { branches: ["午", "未"], resultElement: "earth" },
];

export type TripleCombinationResult = {
  branches: [string, string, string];
  resultElement: Element;
};

export const BRANCH_TRIPLE_COMBINATIONS: TripleCombinationResult[] = [
  { branches: ["寅", "午", "戌"], resultElement: "fire" },
  { branches: ["申", "子", "辰"], resultElement: "water" },
  { branches: ["亥", "卯", "未"], resultElement: "wood" },
  { branches: ["巳", "酉", "丑"], resultElement: "metal" },
];

export const BRANCH_DIRECTIONAL_COMBINATIONS: TripleCombinationResult[] = [
  { branches: ["寅", "卯", "辰"], resultElement: "wood" },
  { branches: ["巳", "午", "未"], resultElement: "fire" },
  { branches: ["申", "酉", "戌"], resultElement: "metal" },
  { branches: ["亥", "子", "丑"], resultElement: "water" },
];

export const BRANCH_CLASHES: [string, string][] = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

export const BRANCH_HARMS: [string, string][] = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "巳"],
  ["卯", "辰"],
  ["申", "亥"],
  ["酉", "戌"],
];

export const BRANCH_PUNISHMENTS: { branches: string[]; type: string }[] = [
  { branches: ["寅", "巳", "申"], type: "무은지형" },
  { branches: ["丑", "戌", "未"], type: "무례지형" },
  { branches: ["子", "卯"], type: "무례지형" },
  { branches: ["辰", "辰"], type: "자형" },
  { branches: ["午", "午"], type: "자형" },
  { branches: ["酉", "酉"], type: "자형" },
  { branches: ["亥", "亥"], type: "자형" },
];

export const BRANCH_DESTRUCTIONS: [string, string][] = [
  ["子", "酉"],
  ["丑", "辰"],
  ["寅", "亥"],
  ["卯", "午"],
  ["巳", "申"],
  ["未", "戌"],
];

export interface StemCombination {
  type: "천간합";
  pair: [string, string];
  positions: [string, string];
  resultElement: Element;
}

export interface BranchSixCombination {
  type: "육합";
  pair: [string, string];
  positions: [string, string];
  resultElement: Element;
}

export interface BranchTripleCombination {
  type: "삼합";
  branches: string[];
  positions: string[];
  resultElement: Element;
  isComplete: boolean;
}

export interface BranchDirectionalCombination {
  type: "방합";
  branches: string[];
  positions: string[];
  resultElement: Element;
  isComplete: boolean;
}

export interface BranchClash {
  type: "충";
  pair: [string, string];
  positions: [string, string];
}

export interface BranchHarm {
  type: "해";
  pair: [string, string];
  positions: [string, string];
}

export interface BranchPunishment {
  type: "형";
  branches: string[];
  positions: string[];
  punishmentType: string;
}

export interface BranchDestruction {
  type: "파";
  pair: [string, string];
  positions: [string, string];
}

export type Relation =
  | StemCombination
  | BranchSixCombination
  | BranchTripleCombination
  | BranchDirectionalCombination
  | BranchClash
  | BranchHarm
  | BranchPunishment
  | BranchDestruction;

export interface RelationsResult {
  combinations: (
    | StemCombination
    | BranchSixCombination
    | BranchTripleCombination
    | BranchDirectionalCombination
  )[];
  clashes: BranchClash[];
  harms: BranchHarm[];
  punishments: BranchPunishment[];
  destructions: BranchDestruction[];
  all: Relation[];
}

type PillarPosition = "year" | "month" | "day" | "hour";

export function analyzeRelations(
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  hourPillar: string,
): RelationsResult {
  const stems: { char: string; position: PillarPosition }[] = [
    { char: yearPillar[0], position: "year" },
    { char: monthPillar[0], position: "month" },
    { char: dayPillar[0], position: "day" },
    { char: hourPillar[0], position: "hour" },
  ];

  const branches: { char: string; position: PillarPosition }[] = [
    { char: yearPillar[1], position: "year" },
    { char: monthPillar[1], position: "month" },
    { char: dayPillar[1], position: "day" },
    { char: hourPillar[1], position: "hour" },
  ];

  const combinations: RelationsResult["combinations"] = [];
  const clashes: BranchClash[] = [];
  const harms: BranchHarm[] = [];
  const punishments: BranchPunishment[] = [];
  const destructions: BranchDestruction[] = [];

  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const s1 = stems[i];
      const s2 = stems[j];
      for (const combo of STEM_COMBINATIONS) {
        if (
          (s1.char === combo.stems[0] && s2.char === combo.stems[1]) ||
          (s1.char === combo.stems[1] && s2.char === combo.stems[0])
        ) {
          combinations.push({
            type: "천간합",
            pair: [s1.char, s2.char],
            positions: [s1.position, s2.position],
            resultElement: combo.resultElement,
          });
        }
      }
    }
  }

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];

      for (const combo of BRANCH_SIX_COMBINATIONS) {
        if (
          (b1.char === combo.branches[0] && b2.char === combo.branches[1]) ||
          (b1.char === combo.branches[1] && b2.char === combo.branches[0])
        ) {
          combinations.push({
            type: "육합",
            pair: [b1.char, b2.char],
            positions: [b1.position, b2.position],
            resultElement: combo.resultElement,
          });
        }
      }

      for (const clash of BRANCH_CLASHES) {
        if (
          (b1.char === clash[0] && b2.char === clash[1]) ||
          (b1.char === clash[1] && b2.char === clash[0])
        ) {
          clashes.push({
            type: "충",
            pair: [b1.char, b2.char],
            positions: [b1.position, b2.position],
          });
        }
      }

      for (const harm of BRANCH_HARMS) {
        if (
          (b1.char === harm[0] && b2.char === harm[1]) ||
          (b1.char === harm[1] && b2.char === harm[0])
        ) {
          harms.push({
            type: "해",
            pair: [b1.char, b2.char],
            positions: [b1.position, b2.position],
          });
        }
      }

      for (const dest of BRANCH_DESTRUCTIONS) {
        if (
          (b1.char === dest[0] && b2.char === dest[1]) ||
          (b1.char === dest[1] && b2.char === dest[0])
        ) {
          destructions.push({
            type: "파",
            pair: [b1.char, b2.char],
            positions: [b1.position, b2.position],
          });
        }
      }
    }
  }

  const branchChars = branches.map((b) => b.char);
  for (const combo of BRANCH_TRIPLE_COMBINATIONS) {
    const matched = combo.branches.filter((b) => branchChars.includes(b));
    if (matched.length >= 2) {
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      combinations.push({
        type: "삼합",
        branches: matched,
        positions,
        resultElement: combo.resultElement,
        isComplete: matched.length === 3,
      });
    }
  }

  for (const combo of BRANCH_DIRECTIONAL_COMBINATIONS) {
    const matched = combo.branches.filter((b) => branchChars.includes(b));
    if (matched.length >= 2) {
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      combinations.push({
        type: "방합",
        branches: matched,
        positions,
        resultElement: combo.resultElement,
        isComplete: matched.length === 3,
      });
    }
  }

  for (const punishment of BRANCH_PUNISHMENTS) {
    const matched = punishment.branches.filter((b) => branchChars.includes(b));
    const isTriple = punishment.branches.length === 3;
    const isSelfPunishment = punishment.type === "자형";

    if (isSelfPunishment) {
      const count = branchChars.filter((b) => b === punishment.branches[0]).length;
      if (count >= 2) {
        punishments.push({
          type: "형",
          branches: Array(count).fill(punishment.branches[0]),
          positions: branches
            .filter((b) => b.char === punishment.branches[0])
            .map((b) => b.position),
          punishmentType: punishment.type,
        });
      }
    } else if (isTriple && matched.length >= 2) {
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      punishments.push({
        type: "형",
        branches: matched,
        positions,
        punishmentType: punishment.type,
      });
    } else if (!isTriple && matched.length === 2) {
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      punishments.push({
        type: "형",
        branches: matched,
        positions,
        punishmentType: punishment.type,
      });
    }
  }

  const all: Relation[] = [...combinations, ...clashes, ...harms, ...punishments, ...destructions];

  return {
    combinations,
    clashes,
    harms,
    punishments,
    destructions,
    all,
  };
}

export function findStemCombination(stem1: string, stem2: string): StemCombinationResult | null {
  for (const combo of STEM_COMBINATIONS) {
    if (
      (stem1 === combo.stems[0] && stem2 === combo.stems[1]) ||
      (stem1 === combo.stems[1] && stem2 === combo.stems[0])
    ) {
      return combo;
    }
  }
  return null;
}

export function findBranchClash(branch1: string, branch2: string): boolean {
  for (const clash of BRANCH_CLASHES) {
    if (
      (branch1 === clash[0] && branch2 === clash[1]) ||
      (branch1 === clash[1] && branch2 === clash[0])
    ) {
      return true;
    }
  }
  return false;
}

export function findBranchSixCombination(
  branch1: string,
  branch2: string,
): BranchCombinationResult | null {
  for (const combo of BRANCH_SIX_COMBINATIONS) {
    if (
      (branch1 === combo.branches[0] && branch2 === combo.branches[1]) ||
      (branch1 === combo.branches[1] && branch2 === combo.branches[0])
    ) {
      return combo;
    }
  }
  return null;
}
