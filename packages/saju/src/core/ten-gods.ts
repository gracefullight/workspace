import type { Element, Polarity } from "@/types";
import { ELEMENTS } from "@/utils";

export type { Element, Polarity };
export { ELEMENTS };

export type TenGod =
  | "비견"
  | "겁재"
  | "식신"
  | "상관"
  | "편재"
  | "정재"
  | "편관"
  | "정관"
  | "편인"
  | "정인";

export const TEN_GODS: TenGod[] = [
  "비견",
  "겁재",
  "식신",
  "상관",
  "편재",
  "정재",
  "편관",
  "정관",
  "편인",
  "정인",
];

// 십신 한자 매핑
export const TEN_GOD_HANJA: Record<TenGod, string> = {
  비견: "比肩",
  겁재: "劫財",
  식신: "食神",
  상관: "傷官",
  편재: "偏財",
  정재: "正財",
  편관: "偏官",
  정관: "正官",
  편인: "偏印",
  정인: "正印",
};

// 십신 영문 매핑
export const TEN_GOD_ENGLISH: Record<TenGod, string> = {
  비견: "Companion",
  겁재: "Rob Wealth",
  식신: "Eating God",
  상관: "Hurting Officer",
  편재: "Indirect Wealth",
  정재: "Direct Wealth",
  편관: "Seven Killings",
  정관: "Direct Officer",
  편인: "Indirect Seal",
  정인: "Direct Seal",
};

// 천간별 오행
const STEM_ELEMENT: Record<string, Element> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

// 천간별 음양
const STEM_POLARITY: Record<string, Polarity> = {
  甲: "yang",
  乙: "yin",
  丙: "yang",
  丁: "yin",
  戊: "yang",
  己: "yin",
  庚: "yang",
  辛: "yin",
  壬: "yang",
  癸: "yin",
};

// 지지별 오행
const BRANCH_ELEMENT: Record<string, Element> = {
  子: "water",
  丑: "earth",
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
};

// 지지별 음양
const BRANCH_POLARITY: Record<string, Polarity> = {
  子: "yang",
  丑: "yin",
  寅: "yang",
  卯: "yin",
  辰: "yang",
  巳: "yin",
  午: "yang",
  未: "yin",
  申: "yang",
  酉: "yin",
  戌: "yang",
  亥: "yin",
};

// 장간(藏干) - 지지 속에 숨은 천간들
// 순서: [본기(本氣), 중기(中氣)?, 여기(餘氣)?]
export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

// 오행 상생 관계 (A가 B를 생함)
// 목생화, 화생토, 토생금, 금생수, 수생목
const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

// 오행 상극 관계 (A가 B를 극함)
// 목극토, 토극수, 수극화, 화극금, 금극목
const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

/**
 * 천간의 오행을 반환
 */
export function getStemElement(stem: string): Element {
  const element = STEM_ELEMENT[stem];
  if (!element) throw new Error(`Invalid stem: ${stem}`);
  return element;
}

/**
 * 천간의 음양을 반환
 */
export function getStemPolarity(stem: string): Polarity {
  const polarity = STEM_POLARITY[stem];
  if (!polarity) throw new Error(`Invalid stem: ${stem}`);
  return polarity;
}

/**
 * 지지의 오행을 반환
 */
export function getBranchElement(branch: string): Element {
  const element = BRANCH_ELEMENT[branch];
  if (!element) throw new Error(`Invalid branch: ${branch}`);
  return element;
}

/**
 * 지지의 음양을 반환
 */
export function getBranchPolarity(branch: string): Polarity {
  const polarity = BRANCH_POLARITY[branch];
  if (!polarity) throw new Error(`Invalid branch: ${branch}`);
  return polarity;
}

/**
 * 지지의 장간(숨은 천간들)을 반환
 */
export function getHiddenStems(branch: string): string[] {
  const hidden = HIDDEN_STEMS[branch];
  if (!hidden) throw new Error(`Invalid branch: ${branch}`);
  return [...hidden];
}

/**
 * 일간(Day Master)과 다른 천간의 관계에서 십신을 판정
 * @param dayMaster 일간 (예: "甲")
 * @param targetStem 비교 대상 천간
 * @returns 십신
 */
export function getTenGod(dayMaster: string, targetStem: string): TenGod {
  const dmElement = getStemElement(dayMaster);
  const dmPolarity = getStemPolarity(dayMaster);
  const targetElement = getStemElement(targetStem);
  const targetPolarity = getStemPolarity(targetStem);

  const samePolarity = dmPolarity === targetPolarity;

  // 같은 오행
  if (dmElement === targetElement) {
    return samePolarity ? "비견" : "겁재";
  }

  // 내가 생하는 오행 (식상)
  if (GENERATES[dmElement] === targetElement) {
    return samePolarity ? "식신" : "상관";
  }

  // 내가 극하는 오행 (재성)
  if (CONTROLS[dmElement] === targetElement) {
    return samePolarity ? "편재" : "정재";
  }

  // 나를 극하는 오행 (관성)
  if (CONTROLS[targetElement] === dmElement) {
    return samePolarity ? "편관" : "정관";
  }

  // 나를 생하는 오행 (인성)
  if (GENERATES[targetElement] === dmElement) {
    return samePolarity ? "편인" : "정인";
  }

  throw new Error(`Unable to determine ten god relationship: ${dayMaster} -> ${targetStem}`);
}

/**
 * 지지에 대한 십신 판정 (본기 기준)
 */
export function getTenGodForBranch(dayMaster: string, branch: string): TenGod {
  const hiddenStems = getHiddenStems(branch);
  // 본기(첫 번째 장간)를 기준으로 판정
  return getTenGod(dayMaster, hiddenStems[0]);
}

/**
 * 지지의 모든 장간에 대한 십신 분석
 */
export function getTenGodsForBranch(
  dayMaster: string,
  branch: string,
): { stem: string; tenGod: TenGod; type: "본기" | "중기" | "여기" }[] {
  const hiddenStems = getHiddenStems(branch);
  const types: ("본기" | "중기" | "여기")[] = ["본기", "중기", "여기"];

  return hiddenStems.map((stem, i) => ({
    stem,
    tenGod: getTenGod(dayMaster, stem),
    type: types[i],
  }));
}

/**
 * 사주 전체의 십신 분석
 */
export interface FourPillarsTenGods {
  year: {
    stem: { char: string; tenGod: TenGod };
    branch: { char: string; tenGod: TenGod; hiddenStems: { stem: string; tenGod: TenGod }[] };
  };
  month: {
    stem: { char: string; tenGod: TenGod };
    branch: { char: string; tenGod: TenGod; hiddenStems: { stem: string; tenGod: TenGod }[] };
  };
  day: {
    stem: { char: string; tenGod: "일간" };
    branch: { char: string; tenGod: TenGod; hiddenStems: { stem: string; tenGod: TenGod }[] };
  };
  hour: {
    stem: { char: string; tenGod: TenGod };
    branch: { char: string; tenGod: TenGod; hiddenStems: { stem: string; tenGod: TenGod }[] };
  };
  dayMaster: string;
}

/**
 * 사주 팔자에서 십신 분석
 * @param yearPillar 연주 (예: "甲子")
 * @param monthPillar 월주
 * @param dayPillar 일주
 * @param hourPillar 시주
 */
export function analyzeTenGods(
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  hourPillar: string,
): FourPillarsTenGods {
  const dayMaster = dayPillar[0];

  const analyzePillar = (pillar: string, isDayPillar = false) => {
    const stem = pillar[0];
    const branch = pillar[1];
    const hiddenStems = getHiddenStems(branch).map((hs) => ({
      stem: hs,
      tenGod: getTenGod(dayMaster, hs),
    }));

    return {
      stem: {
        char: stem,
        tenGod: isDayPillar ? ("일간" as const) : getTenGod(dayMaster, stem),
      },
      branch: {
        char: branch,
        tenGod: getTenGod(dayMaster, hiddenStems[0].stem),
        hiddenStems,
      },
    };
  };

  return {
    year: analyzePillar(yearPillar) as FourPillarsTenGods["year"],
    month: analyzePillar(monthPillar) as FourPillarsTenGods["month"],
    day: analyzePillar(dayPillar, true) as FourPillarsTenGods["day"],
    hour: analyzePillar(hourPillar) as FourPillarsTenGods["hour"],
    dayMaster,
  };
}

/**
 * 십신 통계 (각 십신이 몇 개 있는지)
 */
export function countTenGods(analysis: FourPillarsTenGods): Record<TenGod, number> {
  const counts: Record<TenGod, number> = {
    비견: 0,
    겁재: 0,
    식신: 0,
    상관: 0,
    편재: 0,
    정재: 0,
    편관: 0,
    정관: 0,
    편인: 0,
    정인: 0,
  };

  // 천간 십신 카운트 (일간 제외)
  const stems = [analysis.year.stem, analysis.month.stem, analysis.hour.stem];
  for (const s of stems) {
    counts[s.tenGod]++;
  }

  // 지지 본기 십신 카운트
  const branches = [
    analysis.year.branch,
    analysis.month.branch,
    analysis.day.branch,
    analysis.hour.branch,
  ];
  for (const b of branches) {
    counts[b.tenGod]++;
  }

  return counts;
}

/**
 * 오행별 개수 (천간 + 지지 본기)
 */
export function countElements(analysis: FourPillarsTenGods): Record<Element, number> {
  const counts: Record<Element, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 모든 천간의 오행
  const stems = [
    analysis.year.stem.char,
    analysis.month.stem.char,
    analysis.day.stem.char,
    analysis.hour.stem.char,
  ];
  for (const s of stems) {
    counts[getStemElement(s)]++;
  }

  // 모든 지지의 오행
  const branches = [
    analysis.year.branch.char,
    analysis.month.branch.char,
    analysis.day.branch.char,
    analysis.hour.branch.char,
  ];
  for (const b of branches) {
    counts[getBranchElement(b)]++;
  }

  return counts;
}
