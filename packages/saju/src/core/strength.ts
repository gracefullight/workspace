import type { Label } from "@/types";
import {
  type Element,
  getStemElement,
  getStemPolarity,
  getTenGodKey,
  type TenGodKey,
} from "./ten-gods";

export const STRENGTH_LEVEL_KEYS = [
  "extremelyWeak",
  "veryWeak",
  "weak",
  "neutralWeak",
  "neutral",
  "neutralStrong",
  "strong",
  "veryStrong",
  "extremelyStrong",
] as const;

export type StrengthLevelKey = (typeof STRENGTH_LEVEL_KEYS)[number];

export interface StrengthLevelLabel extends Label<StrengthLevelKey> {}

const STRENGTH_LEVEL_DATA: Record<StrengthLevelKey, { korean: string; hanja: string }> = {
  extremelyWeak: { korean: "극약", hanja: "極弱" },
  veryWeak: { korean: "태약", hanja: "太弱" },
  weak: { korean: "신약", hanja: "身弱" },
  neutralWeak: { korean: "중화신약", hanja: "中和身弱" },
  neutral: { korean: "중화", hanja: "中和" },
  neutralStrong: { korean: "중화신강", hanja: "中和身強" },
  strong: { korean: "신강", hanja: "身強" },
  veryStrong: { korean: "태강", hanja: "太強" },
  extremelyStrong: { korean: "극왕", hanja: "極旺" },
};

export function getStrengthLevelLabel(key: StrengthLevelKey): StrengthLevelLabel {
  const data = STRENGTH_LEVEL_DATA[key];
  return { key, ...data };
}

interface HiddenStemWeight {
  stem: string;
  weight: number;
  type: "본기" | "중기" | "여기";
}

const HIDDEN_STEM_WEIGHTS: Record<string, HiddenStemWeight[]> = {
  子: [{ stem: "癸", weight: 1.0, type: "본기" }],
  丑: [
    { stem: "己", weight: 0.6, type: "본기" },
    { stem: "癸", weight: 0.25, type: "중기" },
    { stem: "辛", weight: 0.15, type: "여기" },
  ],
  寅: [
    { stem: "甲", weight: 0.6, type: "본기" },
    { stem: "丙", weight: 0.25, type: "중기" },
    { stem: "戊", weight: 0.15, type: "여기" },
  ],
  卯: [{ stem: "乙", weight: 1.0, type: "본기" }],
  辰: [
    { stem: "戊", weight: 0.6, type: "본기" },
    { stem: "乙", weight: 0.25, type: "중기" },
    { stem: "癸", weight: 0.15, type: "여기" },
  ],
  巳: [
    { stem: "丙", weight: 0.6, type: "본기" },
    { stem: "庚", weight: 0.25, type: "중기" },
    { stem: "戊", weight: 0.15, type: "여기" },
  ],
  午: [
    { stem: "丁", weight: 0.7, type: "본기" },
    { stem: "己", weight: 0.3, type: "중기" },
  ],
  未: [
    { stem: "己", weight: 0.6, type: "본기" },
    { stem: "丁", weight: 0.25, type: "중기" },
    { stem: "乙", weight: 0.15, type: "여기" },
  ],
  申: [
    { stem: "庚", weight: 0.6, type: "본기" },
    { stem: "壬", weight: 0.25, type: "중기" },
    { stem: "戊", weight: 0.15, type: "여기" },
  ],
  酉: [{ stem: "辛", weight: 1.0, type: "본기" }],
  戌: [
    { stem: "戊", weight: 0.6, type: "본기" },
    { stem: "辛", weight: 0.25, type: "중기" },
    { stem: "丁", weight: 0.15, type: "여기" },
  ],
  亥: [
    { stem: "壬", weight: 0.7, type: "본기" },
    { stem: "甲", weight: 0.3, type: "중기" },
  ],
};

type SeasonalElement = "wood" | "fire" | "wet_earth" | "dry_earth" | "metal" | "water";

const MONTH_BRANCH_SEASONAL: Record<string, SeasonalElement> = {
  寅: "wood",
  卯: "wood",
  辰: "wet_earth",
  巳: "fire",
  午: "fire",
  未: "dry_earth",
  申: "metal",
  酉: "metal",
  戌: "dry_earth",
  亥: "water",
  子: "water",
  丑: "wet_earth",
};

function getMonthlyStrengthMultiplier(dayMasterElement: Element, monthBranch: string): number {
  const seasonal = MONTH_BRANCH_SEASONAL[monthBranch];

  const strengthTable: Record<Element, Record<SeasonalElement, number>> = {
    wood: {
      wood: 1.0,
      fire: 0.3,
      wet_earth: 0.5,
      dry_earth: 0.2,
      metal: 0.1,
      water: 0.7,
    },
    fire: {
      wood: 0.7,
      fire: 1.0,
      wet_earth: 0.3,
      dry_earth: 0.5,
      metal: 0.1,
      water: 0.1,
    },
    earth: {
      wood: 0.1,
      fire: 0.7,
      wet_earth: 0.8,
      dry_earth: 1.0,
      metal: 0.3,
      water: 0.1,
    },
    metal: {
      wood: 0.1,
      fire: 0.1,
      wet_earth: 0.5,
      dry_earth: 0.7,
      metal: 1.0,
      water: 0.3,
    },
    water: {
      wood: 0.3,
      fire: 0.1,
      wet_earth: 0.2,
      dry_earth: 0.1,
      metal: 0.7,
      water: 1.0,
    },
  };

  return strengthTable[dayMasterElement][seasonal];
}

function calculateRootStrength(dayMaster: string, branch: string): number {
  const dayMasterElement = getStemElement(dayMaster);
  const dayMasterPolarity = getStemPolarity(dayMaster);

  const hiddenStems = HIDDEN_STEM_WEIGHTS[branch] || [];
  let strength = 0;

  for (const hs of hiddenStems) {
    const hsElement = getStemElement(hs.stem);
    const hsPolarity = getStemPolarity(hs.stem);

    if (hsElement === dayMasterElement) {
      if (hsPolarity === dayMasterPolarity) {
        strength += hs.weight * 1.0;
      } else {
        strength += hs.weight * 0.7;
      }
    } else if (
      (dayMasterElement === "wood" && hsElement === "water") ||
      (dayMasterElement === "fire" && hsElement === "wood") ||
      (dayMasterElement === "earth" && hsElement === "fire") ||
      (dayMasterElement === "metal" && hsElement === "earth") ||
      (dayMasterElement === "water" && hsElement === "metal")
    ) {
      strength += hs.weight * 0.5;
    }
  }

  return strength;
}

function isTransparent(stem: string, allStems: string[]): boolean {
  return allStems.includes(stem);
}

const HELPFUL_TEN_GODS: TenGodKey[] = ["companion", "robWealth", "directSeal", "indirectSeal"];
const WEAKENING_TEN_GODS: TenGodKey[] = [
  "eatingGod",
  "hurtingOfficer",
  "indirectWealth",
  "directWealth",
  "sevenKillings",
  "directOfficer",
];

function isHelpfulTenGod(tenGod: TenGodKey): boolean {
  return HELPFUL_TEN_GODS.includes(tenGod);
}

function isWeakeningTenGod(tenGod: TenGodKey): boolean {
  return WEAKENING_TEN_GODS.includes(tenGod);
}

export interface StrengthFactors {
  deukryeong: number;
  deukji: number;
  deukse: number;
  tonggeun: number;
  helpCount: number;
  weakenCount: number;
}

export interface StrengthResult {
  level: StrengthLevelLabel;
  score: number;
  factors: StrengthFactors;
  description: string;
}

export function analyzeStrength(
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  hourPillar: string,
): StrengthResult {
  const dayMaster = dayPillar[0];
  const dayMasterElement = getStemElement(dayMaster);
  const monthBranch = monthPillar[1];

  const deukryeong = getMonthlyStrengthMultiplier(dayMasterElement, monthBranch);

  const allBranches = [yearPillar[1], monthPillar[1], dayPillar[1], hourPillar[1]];
  let tonggeun = 0;
  for (const branch of allBranches) {
    tonggeun += calculateRootStrength(dayMaster, branch);
  }

  const allStems = [yearPillar[0], monthPillar[0], dayPillar[0], hourPillar[0]];

  const monthHiddenStems = HIDDEN_STEM_WEIGHTS[monthBranch] || [];
  let transparentBonus = 0;
  for (const hs of monthHiddenStems) {
    if (isTransparent(hs.stem, allStems)) {
      const tenGod = getTenGodKey(dayMaster, hs.stem);
      if (isHelpfulTenGod(tenGod)) {
        transparentBonus += hs.weight * 0.3;
      }
    }
  }

  let deukji = 0;
  const nearBranches = [dayPillar[1], hourPillar[1]];
  for (const branch of nearBranches) {
    deukji += calculateRootStrength(dayMaster, branch);
  }

  let deukse = 0;
  const otherStems = [yearPillar[0], monthPillar[0], hourPillar[0]];
  for (const stem of otherStems) {
    const tenGod = getTenGodKey(dayMaster, stem);
    if (isHelpfulTenGod(tenGod)) {
      deukse += 1;
    }
  }

  let helpCount = 0;
  let weakenCount = 0;

  for (const stem of otherStems) {
    const tenGod = getTenGodKey(dayMaster, stem);
    if (isHelpfulTenGod(tenGod)) helpCount++;
    if (isWeakeningTenGod(tenGod)) weakenCount++;
  }

  for (const branch of allBranches) {
    const hiddenStems = HIDDEN_STEM_WEIGHTS[branch] || [];
    const mainStem = hiddenStems[0]?.stem;
    if (mainStem) {
      const tenGod = getTenGodKey(dayMaster, mainStem);
      if (isHelpfulTenGod(tenGod)) helpCount++;
      if (isWeakeningTenGod(tenGod)) weakenCount++;
    }
  }

  let score = 0;

  score += deukryeong * 35;
  score += tonggeun * 20;
  score += transparentBonus * 15;
  score += deukse * 8;
  score += helpCount * 5;
  score -= weakenCount * 6;

  score = Math.round(score * 10) / 10;

  let levelKey: StrengthLevelKey;
  if (score <= 10) levelKey = "extremelyWeak";
  else if (score <= 20) levelKey = "veryWeak";
  else if (score <= 30) levelKey = "weak";
  else if (score <= 38) levelKey = "neutralWeak";
  else if (score <= 45) levelKey = "neutral";
  else if (score <= 55) levelKey = "neutralStrong";
  else if (score <= 70) levelKey = "strong";
  else if (score <= 85) levelKey = "veryStrong";
  else levelKey = "extremelyStrong";

  const factors: StrengthFactors = {
    deukryeong: Math.round(deukryeong * 100) / 100,
    deukji: Math.round(deukji * 100) / 100,
    deukse,
    tonggeun: Math.round(tonggeun * 100) / 100,
    helpCount,
    weakenCount,
  };

  const deukryeongDesc = deukryeong >= 0.7 ? "득령" : deukryeong >= 0.4 ? "반득령" : "실령";
  let description = `일간 ${dayMaster}(${dayMasterElement}), ${deukryeongDesc}(${Math.round(deukryeong * 100)}%)`;
  description += tonggeun > 0 ? `, 통근(${Math.round(tonggeun * 100) / 100})` : "";
  description += deukse > 0 ? `, 득세(${deukse})` : "";

  return {
    level: getStrengthLevelLabel(levelKey),
    score,
    factors,
    description,
  };
}
