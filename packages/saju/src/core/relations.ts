import type { Label } from "@/types";
import type { Element, ElementLabel } from "./ten-gods";
import { getBranchElement, getElementLabel, getStemElement } from "./ten-gods";

export const RELATION_TYPE_KEYS = [
  "stemCombination",
  "sixCombination",
  "tripleCombination",
  "directionalCombination",
  "clash",
  "harm",
  "punishment",
  "destruction",
] as const;

export type RelationTypeKey = (typeof RELATION_TYPE_KEYS)[number];

export interface RelationTypeLabel extends Label<RelationTypeKey> {}

const RELATION_TYPE_DATA: Record<RelationTypeKey, { korean: string; hanja: string }> = {
  stemCombination: { korean: "천간합", hanja: "天干合" },
  sixCombination: { korean: "육합", hanja: "六合" },
  tripleCombination: { korean: "삼합", hanja: "三合" },
  directionalCombination: { korean: "방합", hanja: "方合" },
  clash: { korean: "충", hanja: "沖" },
  harm: { korean: "해", hanja: "害" },
  punishment: { korean: "형", hanja: "刑" },
  destruction: { korean: "파", hanja: "破" },
};

export function getRelationTypeLabel(key: RelationTypeKey): RelationTypeLabel {
  const data = RELATION_TYPE_DATA[key];
  return { key, ...data };
}

export const TRANSFORMATION_STATUS_KEYS = [
  "combined",
  "halfCombined",
  "transformed",
  "notTransformed",
] as const;

export type TransformationStatusKey = (typeof TRANSFORMATION_STATUS_KEYS)[number];

export interface TransformationStatusLabel extends Label<TransformationStatusKey> {}

const TRANSFORMATION_STATUS_DATA: Record<
  TransformationStatusKey,
  { korean: string; hanja: string }
> = {
  combined: { korean: "합", hanja: "合" },
  halfCombined: { korean: "반합", hanja: "半合" },
  transformed: { korean: "화", hanja: "化" },
  notTransformed: { korean: "불화", hanja: "不化" },
};

export function getTransformationStatusLabel(
  key: TransformationStatusKey,
): TransformationStatusLabel {
  const data = TRANSFORMATION_STATUS_DATA[key];
  return { key, ...data };
}

export const PUNISHMENT_TYPE_KEYS = ["ungrateful", "power", "rude", "self"] as const;

export type PunishmentTypeKey = (typeof PUNISHMENT_TYPE_KEYS)[number];

export interface PunishmentTypeLabel extends Label<PunishmentTypeKey> {}

const PUNISHMENT_TYPE_DATA: Record<PunishmentTypeKey, { korean: string; hanja: string }> = {
  ungrateful: { korean: "무은지형", hanja: "無恩之刑" },
  power: { korean: "시세지형", hanja: "恃勢之刑" },
  rude: { korean: "무례지형", hanja: "無禮之刑" },
  self: { korean: "자형", hanja: "自刑" },
};

export function getPunishmentTypeLabel(key: PunishmentTypeKey): PunishmentTypeLabel {
  const data = PUNISHMENT_TYPE_DATA[key];
  return { key, ...data };
}

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

export const BRANCH_PUNISHMENTS: { branches: string[]; type: PunishmentTypeKey }[] = [
  { branches: ["寅", "巳", "申"], type: "ungrateful" },
  { branches: ["丑", "戌", "未"], type: "power" },
  { branches: ["子", "卯"], type: "rude" },
  { branches: ["辰", "辰"], type: "self" },
  { branches: ["午", "午"], type: "self" },
  { branches: ["酉", "酉"], type: "self" },
  { branches: ["亥", "亥"], type: "self" },
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
  type: RelationTypeLabel;
  pair: [string, string];
  positions: [string, string];
  resultElement: ElementLabel;
  transformStatus: TransformationStatusLabel;
  transformReason: string;
}

export interface BranchSixCombination {
  type: RelationTypeLabel;
  pair: [string, string];
  positions: [string, string];
  resultElement: ElementLabel;
  transformStatus: TransformationStatusLabel;
  transformReason: string;
}

export interface BranchTripleCombination {
  type: RelationTypeLabel;
  branches: string[];
  positions: string[];
  resultElement: ElementLabel;
  isComplete: boolean;
  transformStatus: TransformationStatusLabel;
  transformReason: string;
}

export interface BranchDirectionalCombination {
  type: RelationTypeLabel;
  branches: string[];
  positions: string[];
  resultElement: ElementLabel;
  isComplete: boolean;
  transformStatus: TransformationStatusLabel;
  transformReason: string;
}

export interface BranchClash {
  type: RelationTypeLabel;
  pair: [string, string];
  positions: [string, string];
}

export interface BranchHarm {
  type: RelationTypeLabel;
  pair: [string, string];
  positions: [string, string];
}

export interface BranchPunishment {
  type: RelationTypeLabel;
  branches: string[];
  positions: string[];
  punishmentType: PunishmentTypeLabel;
}

export interface BranchDestruction {
  type: RelationTypeLabel;
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

const MONTH_BRANCH_ELEMENT_SUPPORT: Record<string, Element[]> = {
  寅: ["wood"],
  卯: ["wood"],
  辰: ["wood", "earth", "water"],
  巳: ["fire"],
  午: ["fire"],
  未: ["fire", "earth"],
  申: ["metal"],
  酉: ["metal"],
  戌: ["metal", "earth", "fire"],
  亥: ["water"],
  子: ["water"],
  丑: ["water", "earth", "metal"],
};

function checkTransformationCondition(
  resultElement: Element,
  monthBranch: string,
  allBranches: string[],
  isComplete: boolean,
): { status: TransformationStatusLabel; reason: string } {
  const supportedElements = MONTH_BRANCH_ELEMENT_SUPPORT[monthBranch] || [];
  const hasMonthSupport = supportedElements.includes(resultElement);

  const branchElements = allBranches.map((b) => getBranchElement(b));
  const resultElementCount = branchElements.filter((e) => e === resultElement).length;
  const hasStrengthSupport = resultElementCount >= 2;

  if (!isComplete) {
    return {
      status: getTransformationStatusLabel("halfCombined"),
      reason: "불완전 합 - 일부 지지 부재",
    };
  }

  if (hasMonthSupport) {
    return {
      status: getTransformationStatusLabel("transformed"),
      reason: `월령(${monthBranch})이 ${resultElement}을(를) 지지`,
    };
  }

  if (hasStrengthSupport) {
    return {
      status: getTransformationStatusLabel("transformed"),
      reason: `${resultElement} 기세 충분(${resultElementCount}개)`,
    };
  }

  return {
    status: getTransformationStatusLabel("notTransformed"),
    reason: "월령 및 기세 미충족으로 화 불성립",
  };
}

function checkStemTransformationCondition(
  resultElement: Element,
  monthBranch: string,
  allStems: string[],
): { status: TransformationStatusLabel; reason: string } {
  const supportedElements = MONTH_BRANCH_ELEMENT_SUPPORT[monthBranch] || [];
  const hasMonthSupport = supportedElements.includes(resultElement);

  const stemElements = allStems.map((s) => getStemElement(s));
  const resultElementCount = stemElements.filter((e) => e === resultElement).length;
  const hasStrengthSupport = resultElementCount >= 2;

  if (hasMonthSupport) {
    return {
      status: getTransformationStatusLabel("transformed"),
      reason: `월령(${monthBranch})이 ${resultElement}을(를) 지지`,
    };
  }

  if (hasStrengthSupport) {
    return {
      status: getTransformationStatusLabel("transformed"),
      reason: `${resultElement} 기세 충분(${resultElementCount}개)`,
    };
  }

  return {
    status: getTransformationStatusLabel("notTransformed"),
    reason: "월령 및 기세 미충족으로 화 불성립",
  };
}

export function analyzeRelations(
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  hourPillar: string,
): RelationsResult {
  const monthBranch = monthPillar[1];

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

  const allStemChars = stems.map((s) => s.char);
  const allBranchChars = branches.map((b) => b.char);

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
          const transform = checkStemTransformationCondition(
            combo.resultElement,
            monthBranch,
            allStemChars,
          );
          combinations.push({
            type: getRelationTypeLabel("stemCombination"),
            pair: [s1.char, s2.char],
            positions: [s1.position, s2.position],
            resultElement: getElementLabel(combo.resultElement),
            transformStatus: transform.status,
            transformReason: transform.reason,
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
          const transform = checkTransformationCondition(
            combo.resultElement,
            monthBranch,
            allBranchChars,
            true,
          );
          combinations.push({
            type: getRelationTypeLabel("sixCombination"),
            pair: [b1.char, b2.char],
            positions: [b1.position, b2.position],
            resultElement: getElementLabel(combo.resultElement),
            transformStatus: transform.status,
            transformReason: transform.reason,
          });
        }
      }

      for (const clash of BRANCH_CLASHES) {
        if (
          (b1.char === clash[0] && b2.char === clash[1]) ||
          (b1.char === clash[1] && b2.char === clash[0])
        ) {
          clashes.push({
            type: getRelationTypeLabel("clash"),
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
            type: getRelationTypeLabel("harm"),
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
            type: getRelationTypeLabel("destruction"),
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
      // biome-ignore lint/style/noNonNullAssertion: matched is filtered from branchChars, find is guaranteed
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      const isComplete = matched.length === 3;
      const transform = checkTransformationCondition(
        combo.resultElement,
        monthBranch,
        allBranchChars,
        isComplete,
      );
      combinations.push({
        type: getRelationTypeLabel("tripleCombination"),
        branches: matched,
        positions,
        resultElement: getElementLabel(combo.resultElement),
        isComplete,
        transformStatus: transform.status,
        transformReason: transform.reason,
      });
    }
  }

  for (const combo of BRANCH_DIRECTIONAL_COMBINATIONS) {
    const matched = combo.branches.filter((b) => branchChars.includes(b));
    if (matched.length >= 2) {
      // biome-ignore lint/style/noNonNullAssertion: matched is filtered from branchChars, find is guaranteed
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      const isComplete = matched.length === 3;
      const transform = checkTransformationCondition(
        combo.resultElement,
        monthBranch,
        allBranchChars,
        isComplete,
      );
      combinations.push({
        type: getRelationTypeLabel("directionalCombination"),
        branches: matched,
        positions,
        resultElement: getElementLabel(combo.resultElement),
        isComplete,
        transformStatus: transform.status,
        transformReason: transform.reason,
      });
    }
  }

  for (const punishment of BRANCH_PUNISHMENTS) {
    const matched = punishment.branches.filter((b) => branchChars.includes(b));
    const isTriple = punishment.branches.length === 3;
    const isSelfPunishment = punishment.type === "self";

    if (isSelfPunishment) {
      const count = branchChars.filter((b) => b === punishment.branches[0]).length;
      if (count >= 2) {
        punishments.push({
          type: getRelationTypeLabel("punishment"),
          branches: Array(count).fill(punishment.branches[0]),
          positions: branches
            .filter((b) => b.char === punishment.branches[0])
            .map((b) => b.position),
          punishmentType: getPunishmentTypeLabel(punishment.type),
        });
      }
    } else if (isTriple && matched.length >= 2) {
      // biome-ignore lint/style/noNonNullAssertion: matched is filtered from branchChars, find is guaranteed
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      punishments.push({
        type: getRelationTypeLabel("punishment"),
        branches: matched,
        positions,
        punishmentType: getPunishmentTypeLabel(punishment.type),
      });
    } else if (!isTriple && matched.length === 2) {
      // biome-ignore lint/style/noNonNullAssertion: matched is filtered from branchChars, find is guaranteed
      const positions = matched.map((m) => branches.find((b) => b.char === m)!.position);
      punishments.push({
        type: getRelationTypeLabel("punishment"),
        branches: matched,
        positions,
        punishmentType: getPunishmentTypeLabel(punishment.type),
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
