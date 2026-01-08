import {
  type Element,
  getStemElement,
  getBranchElement,
  getHiddenStems,
  ELEMENTS,
} from "./ten-gods";
import { type StrengthLevel, analyzeStrength } from "./strength";

export type YongShenMethod = "억부" | "조후" | "통관" | "병약";

export interface YongShenResult {
  primary: Element;
  secondary: Element | null;
  method: YongShenMethod;
  reasoning: string;
  allElements: Record<Element, { isYongShen: boolean; isKiShen: boolean }>;
}

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

function getYokbuYongShen(
  dayMasterElement: Element,
  strengthLevel: StrengthLevel,
): { primary: Element; secondary: Element | null } {
  const isStrong = ["신강", "태강", "극왕", "중화신강"].includes(strengthLevel);

  if (isStrong) {
    const primary = CONTROLS[dayMasterElement];
    const secondary = GENERATES[dayMasterElement];
    return { primary, secondary };
  }
  const primary = GENERATED_BY[dayMasterElement];
  const secondary = dayMasterElement;
  return { primary, secondary };
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

  const yokbu = getYokbuYongShen(dayMasterElement, strength.level);

  const johuElements = JOHU_YONGSHEN[season][dayMasterElement];

  let primary: Element;
  let secondary: Element | null = null;
  let method: YongShenMethod;
  let reasoning: string;

  const isExtreme = ["극약", "극왕"].includes(strength.level);
  const isModerate = ["중화", "중화신약", "중화신강"].includes(strength.level);

  if (isModerate) {
    primary = johuElements[0];
    secondary = johuElements[1] || null;
    method = "조후";
    reasoning = `중화 상태로 조후용신 적용. ${season} 계절, 일간 ${dayMasterElement}에 ${primary} 필요`;
  } else if (isExtreme) {
    primary = yokbu.primary;
    secondary = yokbu.secondary;
    method = "억부";
    reasoning = `${strength.level} 상태로 억부용신 적용. ${strength.level === "극왕" ? "설기" : "부조"} 필요`;
  } else {
    if (yokbu.primary === johuElements[0]) {
      primary = yokbu.primary;
      secondary = johuElements[1] || yokbu.secondary;
      method = "억부";
      reasoning = `억부와 조후 일치. ${strength.level} 상태, ${season} 계절`;
    } else {
      primary = yokbu.primary;
      secondary = johuElements[0];
      method = "억부";
      reasoning = `억부용신 우선 적용. ${strength.level} 상태. 조후(${johuElements[0]})도 고려`;
    }
  }

  const allElements: Record<Element, { isYongShen: boolean; isKiShen: boolean }> = {
    wood: { isYongShen: false, isKiShen: false },
    fire: { isYongShen: false, isKiShen: false },
    earth: { isYongShen: false, isKiShen: false },
    metal: { isYongShen: false, isKiShen: false },
    water: { isYongShen: false, isKiShen: false },
  };

  allElements[primary].isYongShen = true;
  if (secondary) allElements[secondary].isYongShen = true;

  const isStrong = ["신강", "태강", "극왕", "중화신강"].includes(strength.level);
  if (isStrong) {
    allElements[dayMasterElement].isKiShen = true;
    allElements[GENERATED_BY[dayMasterElement]].isKiShen = true;
  } else {
    allElements[CONTROLS[dayMasterElement]].isKiShen = true;
    allElements[CONTROLLED_BY[dayMasterElement]].isKiShen = true;
  }

  for (const elem of ELEMENTS) {
    if (allElements[elem].isYongShen) {
      allElements[elem].isKiShen = false;
    }
  }

  return {
    primary,
    secondary,
    method,
    reasoning,
    allElements,
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

  const primary = elementData[yongShen.primary];
  const colors = [...primary.colors];
  const directions = [primary.direction];
  const numbers = [...primary.numbers];

  if (yongShen.secondary) {
    const secondary = elementData[yongShen.secondary];
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
