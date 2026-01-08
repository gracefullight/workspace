import { analyzeStrength, type StrengthLevelKey, type StrengthLevelLabel } from "./strength";
import {
  ELEMENTS,
  type Element,
  type ElementLabel,
  getBranchElement,
  getElementLabel,
  getStemElement,
} from "./ten-gods";

export type YongShenMethodKey = "formation" | "balance" | "climate" | "bridge" | "disease";

export interface YongShenMethodLabel extends Label<YongShenMethodKey> {}

const YONGSHEN_METHOD_DATA: Record<YongShenMethodKey, { korean: string; hanja: string }> = {
  formation: { korean: "격국", hanja: "格局" },
  balance: { korean: "억부", hanja: "抑扶" },
  climate: { korean: "조후", hanja: "調候" },
  bridge: { korean: "통관", hanja: "通關" },
  disease: { korean: "병약", hanja: "病藥" },
};

export function getYongShenMethodLabel(key: YongShenMethodKey): YongShenMethodLabel {
  const data = YONGSHEN_METHOD_DATA[key];
  return { key, ...data };
}

export interface YongShenResult {
  primary: ElementLabel;
  secondary: ElementLabel | null;
  method: YongShenMethodLabel;
  reasoning: string;
  allElements: Record<Element, { isYongShen: boolean; isKiShen: boolean }>;
  johuAdjustment: ElementLabel | null;
  /** 종격 성립 시 억부 기준 용신도 함께 제공 */
  alternativeBalance?: {
    primary: ElementLabel;
    secondary: ElementLabel | null;
  };
}

import type { Label } from "@/types";

const SEASON_MONTH_BRANCHES: Record<string, string[]> = {
  spring: ["寅", "卯", "辰"],
  summer: ["巳", "午", "未"],
  autumn: ["申", "酉", "戌"],
  winter: ["亥", "子", "丑"],
};

function getSeason(monthBranch: string): "spring" | "summer" | "autumn" | "winter" {
  for (const [season, branches] of Object.entries(SEASON_MONTH_BRANCHES)) {
    if (branches.includes(monthBranch)) {
      return season as "spring" | "summer" | "autumn" | "winter";
    }
  }
  return "spring";
}

const JOHU_YONGSHEN: Record<string, Record<Element, Element[]>> = {
  spring: {
    wood: ["fire", "water"],
    fire: ["water", "wood"],
    earth: ["fire", "wood"],
    metal: ["fire", "earth"],
    water: ["fire", "metal"],
  },
  summer: {
    wood: ["water", "metal"],
    fire: ["water", "metal"],
    earth: ["water", "metal"],
    metal: ["water", "earth"],
    water: ["metal", "water"],
  },
  autumn: {
    wood: ["water", "fire"],
    fire: ["wood", "earth"],
    earth: ["fire", "water"],
    metal: ["fire", "water"],
    water: ["fire", "metal"],
  },
  winter: {
    wood: ["fire", "earth"],
    fire: ["wood", "earth"],
    earth: ["fire", "wood"],
    metal: ["fire", "earth"],
    water: ["fire", "earth"],
  },
};

const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const GENERATED_BY: Record<Element, Element> = {
  fire: "wood",
  earth: "fire",
  metal: "earth",
  water: "metal",
  wood: "water",
};

const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

const CONTROLLED_BY: Record<Element, Element> = {
  earth: "wood",
  water: "earth",
  fire: "water",
  metal: "fire",
  wood: "metal",
};

const STRONG_LEVEL_KEYS: StrengthLevelKey[] = [
  "strong",
  "veryStrong",
  "extremelyStrong",
  "neutralStrong",
];

function isStrongLevel(level: StrengthLevelLabel): boolean {
  return STRONG_LEVEL_KEYS.includes(level.key);
}

function getYokbuYongShen(
  dayMasterElement: Element,
  level: StrengthLevelLabel,
): { primary: Element; secondary: Element | null } {
  if (isStrongLevel(level)) {
    const primary = CONTROLLED_BY[dayMasterElement];
    const secondary = GENERATES[dayMasterElement];
    return { primary, secondary };
  }
  const primary = GENERATED_BY[dayMasterElement];
  const secondary = dayMasterElement;
  return { primary, secondary };
}

function hasSpecialFormation(
  dayMasterElement: Element,
  level: StrengthLevelLabel,
  allElements: Element[],
): { isSpecial: boolean; type: string | null; followElement: Element | null } {
  if (level.key === "extremelyWeak") {
    const elementCounts: Record<Element, number> = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };
    for (const elem of allElements) {
      elementCounts[elem]++;
    }

    let dominantElement: Element | null = null;
    let maxCount = 0;
    for (const [elem, count] of Object.entries(elementCounts)) {
      if (count > maxCount && elem !== dayMasterElement) {
        maxCount = count;
        dominantElement = elem as Element;
      }
    }

    if (dominantElement && maxCount >= 3) {
      return { isSpecial: true, type: "종격", followElement: dominantElement };
    }
  }

  return { isSpecial: false, type: null, followElement: null };
}

function getJohuAdjustment(
  dayMasterElement: Element,
  season: string,
  yokbuPrimary: Element,
): Element | null {
  const johuElements = JOHU_YONGSHEN[season][dayMasterElement];
  const johuPrimary = johuElements[0];

  if (johuPrimary !== yokbuPrimary) {
    return johuPrimary;
  }
  return null;
}

export function analyzeYongShen(
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  hourPillar: string,
): YongShenResult {
  const dayMaster = dayPillar[0];
  const dayMasterElement = getStemElement(dayMaster);
  const monthBranch = monthPillar[1];
  const season = getSeason(monthBranch);

  const strength = analyzeStrength(yearPillar, monthPillar, dayPillar, hourPillar);

  const allBranches = [yearPillar[1], monthPillar[1], dayPillar[1], hourPillar[1]];
  const allBranchElements: Element[] = allBranches.map((b) => getBranchElement(b));

  const specialFormation = hasSpecialFormation(dayMasterElement, strength.level, allBranchElements);

  let primaryKey: Element;
  let secondaryKey: Element | null = null;
  let methodKey: YongShenMethodKey;
  let reasoning: string;
  let johuAdjustmentKey: Element | null = null;
  let alternativeBalance: { primary: Element; secondary: Element | null } | undefined;

  if (specialFormation.isSpecial && specialFormation.followElement) {
    primaryKey = specialFormation.followElement;
    secondaryKey = GENERATES[specialFormation.followElement];
    methodKey = "formation";
    reasoning = `종격 성립. ${getElementLabel(specialFormation.followElement).korean} 세력을 따름`;

    const yokbu = getYokbuYongShen(dayMasterElement, strength.level);
    alternativeBalance = { primary: yokbu.primary, secondary: yokbu.secondary };
  } else {
    const yokbu = getYokbuYongShen(dayMasterElement, strength.level);
    primaryKey = yokbu.primary;
    secondaryKey = yokbu.secondary;
    methodKey = "balance";

    const strong = isStrongLevel(strength.level);
    if (strong) {
      reasoning = `${strength.level.korean} 상태로 설기(洩氣) 필요. ${getElementLabel(primaryKey).korean}로 기운을 발산`;
    } else {
      reasoning = `${strength.level.korean} 상태로 부조(扶助) 필요. ${getElementLabel(primaryKey).korean}로 일간을 생조`;
    }

    johuAdjustmentKey = getJohuAdjustment(dayMasterElement, season, primaryKey);
    if (johuAdjustmentKey) {
      reasoning += `. 조후 보정: ${season} 계절에 ${getElementLabel(johuAdjustmentKey).korean} 참고`;
    }
  }

  const allElements: Record<Element, { isYongShen: boolean; isKiShen: boolean }> = {
    wood: { isYongShen: false, isKiShen: false },
    fire: { isYongShen: false, isKiShen: false },
    earth: { isYongShen: false, isKiShen: false },
    metal: { isYongShen: false, isKiShen: false },
    water: { isYongShen: false, isKiShen: false },
  };

  allElements[primaryKey].isYongShen = true;
  if (secondaryKey) allElements[secondaryKey].isYongShen = true;

  const strong = isStrongLevel(strength.level);
  if (methodKey !== "formation") {
    if (strong) {
      allElements[dayMasterElement].isKiShen = true;
      allElements[GENERATED_BY[dayMasterElement]].isKiShen = true;
    } else {
      allElements[CONTROLS[dayMasterElement]].isKiShen = true;
      allElements[CONTROLLED_BY[dayMasterElement]].isKiShen = true;
    }
  }

  for (const elem of ELEMENTS) {
    if (allElements[elem].isYongShen) {
      allElements[elem].isKiShen = false;
    }
  }

  return {
    primary: getElementLabel(primaryKey),
    secondary: secondaryKey ? getElementLabel(secondaryKey) : null,
    method: getYongShenMethodLabel(methodKey),
    reasoning,
    allElements,
    johuAdjustment: johuAdjustmentKey ? getElementLabel(johuAdjustmentKey) : null,
    alternativeBalance: alternativeBalance
      ? {
          primary: getElementLabel(alternativeBalance.primary),
          secondary: alternativeBalance.secondary
            ? getElementLabel(alternativeBalance.secondary)
            : null,
        }
      : undefined,
  };
}

export function getElementRecommendations(yongShen: YongShenResult): {
  colors: string[];
  directions: string[];
  numbers: number[];
} {
  const elementData: Record<Element, { colors: string[]; direction: string; numbers: number[] }> = {
    wood: { colors: ["청색", "녹색"], direction: "동", numbers: [3, 8] },
    fire: { colors: ["적색", "자주색"], direction: "남", numbers: [2, 7] },
    earth: { colors: ["황색", "갈색"], direction: "중앙", numbers: [5, 10] },
    metal: { colors: ["백색", "금색"], direction: "서", numbers: [4, 9] },
    water: { colors: ["흑색", "남색"], direction: "북", numbers: [1, 6] },
  };

  const primary = elementData[yongShen.primary.key];
  const colors = [...primary.colors];
  const directions = [primary.direction];
  const numbers = [...primary.numbers];

  if (yongShen.secondary) {
    const secondary = elementData[yongShen.secondary.key];
    colors.push(...secondary.colors);
    directions.push(secondary.direction);
    numbers.push(...secondary.numbers);
  }

  return {
    colors: [...new Set(colors)],
    directions: [...new Set(directions)],
    numbers: [...new Set(numbers)].sort((a, b) => a - b),
  };
}
