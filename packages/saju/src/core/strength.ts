import {
  type Element,
  type TenGod,
  getStemElement,
  getBranchElement,
  getHiddenStems,
  getTenGod,
  type FourPillarsTenGods,
} from "./ten-gods";

export type StrengthLevel =
  | "극약"
  | "태약"
  | "신약"
  | "중화신약"
  | "중화"
  | "중화신강"
  | "신강"
  | "태강"
  | "극왕";

export const STRENGTH_LEVELS: StrengthLevel[] = [
  "극약",
  "태약",
  "신약",
  "중화신약",
  "중화",
  "중화신강",
  "신강",
  "태강",
  "극왕",
];

const MONTH_BRANCH_SEASON: Record<string, Element> = {
  寅: "wood",
  卯: "wood",
  辰: "earth",
  巳: "fire",
  午: "fire",
  未: "earth",
  申: "metal",
  酉: "metal",
  戌: "earth",
  亥: "water",
  子: "water",
  丑: "earth",
};

const STRONG_SEASON: Record<Element, Element[]> = {
  wood: ["wood", "water"],
  fire: ["fire", "wood"],
  earth: ["earth", "fire"],
  metal: ["metal", "earth"],
  water: ["water", "metal"],
};

function isHelpfulTenGod(tenGod: TenGod): boolean {
  return ["비견", "겁재", "정인", "편인"].includes(tenGod);
}

function isWeakeningTenGod(tenGod: TenGod): boolean {
  return ["식신", "상관", "편재", "정재", "편관", "정관"].includes(tenGod);
}

export interface StrengthFactors {
  deukryeong: boolean;
  deukji: number;
  deukse: number;
  helpCount: number;
  weakenCount: number;
}

export interface StrengthResult {
  level: StrengthLevel;
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
  const monthElement = MONTH_BRANCH_SEASON[monthBranch];

  const deukryeong = STRONG_SEASON[dayMasterElement].includes(monthElement);

  let deukji = 0;
  const branches = [dayPillar[1], hourPillar[1]];
  for (const branch of branches) {
    const hiddenStems = getHiddenStems(branch);
    for (const hs of hiddenStems) {
      const tenGod = getTenGod(dayMaster, hs);
      if (isHelpfulTenGod(tenGod)) {
        deukji++;
        break;
      }
    }
  }

  let deukse = 0;
  const stems = [yearPillar[0], monthPillar[0], hourPillar[0]];
  for (const stem of stems) {
    const tenGod = getTenGod(dayMaster, stem);
    if (isHelpfulTenGod(tenGod)) {
      deukse++;
    }
  }

  let helpCount = 0;
  let weakenCount = 0;

  const allStems = [yearPillar[0], monthPillar[0], hourPillar[0]];
  for (const stem of allStems) {
    const tenGod = getTenGod(dayMaster, stem);
    if (isHelpfulTenGod(tenGod)) helpCount++;
    if (isWeakeningTenGod(tenGod)) weakenCount++;
  }

  const allBranches = [yearPillar[1], monthPillar[1], dayPillar[1], hourPillar[1]];
  for (const branch of allBranches) {
    const hiddenStems = getHiddenStems(branch);
    const mainStem = hiddenStems[0];
    const tenGod = getTenGod(dayMaster, mainStem);
    if (isHelpfulTenGod(tenGod)) helpCount++;
    if (isWeakeningTenGod(tenGod)) weakenCount++;
  }

  let score = 0;

  if (deukryeong) score += 30;
  score += deukji * 15;
  score += deukse * 10;
  score += helpCount * 8;
  score -= weakenCount * 8;

  let level: StrengthLevel;
  if (score <= -40) level = "극약";
  else if (score <= -25) level = "태약";
  else if (score <= -10) level = "신약";
  else if (score <= -3) level = "중화신약";
  else if (score <= 3) level = "중화";
  else if (score <= 10) level = "중화신강";
  else if (score <= 25) level = "신강";
  else if (score <= 40) level = "태강";
  else level = "극왕";

  const factors: StrengthFactors = {
    deukryeong,
    deukji,
    deukse,
    helpCount,
    weakenCount,
  };

  let description = `일간 ${dayMaster}(${dayMasterElement})`;
  description += deukryeong ? ", 득령" : ", 실령";
  description += deukji > 0 ? `, 득지(${deukji})` : "";
  description += deukse > 0 ? `, 득세(${deukse})` : "";

  return {
    level,
    score,
    factors,
    description,
  };
}
