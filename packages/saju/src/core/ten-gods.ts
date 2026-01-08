import type { Element, Label, Polarity } from "@/types";
import { ELEMENTS } from "@/utils";

export type { Element, Polarity };
export { ELEMENTS };

export interface ElementLabel extends Label<Element> {}

const ELEMENT_DATA: Record<Element, { korean: string; hanja: string }> = {
  wood: { korean: "목", hanja: "木" },
  fire: { korean: "화", hanja: "火" },
  earth: { korean: "토", hanja: "土" },
  metal: { korean: "금", hanja: "金" },
  water: { korean: "수", hanja: "水" },
};

export function getElementLabel(key: Element): ElementLabel {
  const data = ELEMENT_DATA[key];
  return { key, ...data };
}

export const TEN_GOD_KEYS = [
  "companion",
  "robWealth",
  "eatingGod",
  "hurtingOfficer",
  "indirectWealth",
  "directWealth",
  "sevenKillings",
  "directOfficer",
  "indirectSeal",
  "directSeal",
] as const;

export type TenGodKey = (typeof TEN_GOD_KEYS)[number];

export interface TenGodLabel extends Label<TenGodKey> {}

const TEN_GOD_DATA: Record<TenGodKey, { korean: string; hanja: string }> = {
  companion: { korean: "비견", hanja: "比肩" },
  robWealth: { korean: "겁재", hanja: "劫財" },
  eatingGod: { korean: "식신", hanja: "食神" },
  hurtingOfficer: { korean: "상관", hanja: "傷官" },
  indirectWealth: { korean: "편재", hanja: "偏財" },
  directWealth: { korean: "정재", hanja: "正財" },
  sevenKillings: { korean: "편관", hanja: "偏官" },
  directOfficer: { korean: "정관", hanja: "正官" },
  indirectSeal: { korean: "편인", hanja: "偏印" },
  directSeal: { korean: "정인", hanja: "正印" },
};

export function getTenGodLabel(key: TenGodKey): TenGodLabel {
  const data = TEN_GOD_DATA[key];
  return { key, ...data };
}

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

const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

export function getStemElement(stem: string): Element {
  const element = STEM_ELEMENT[stem];
  if (!element) throw new Error(`Invalid stem: ${stem}`);
  return element;
}

export function getStemPolarity(stem: string): Polarity {
  const polarity = STEM_POLARITY[stem];
  if (!polarity) throw new Error(`Invalid stem: ${stem}`);
  return polarity;
}

export function getBranchElement(branch: string): Element {
  const element = BRANCH_ELEMENT[branch];
  if (!element) throw new Error(`Invalid branch: ${branch}`);
  return element;
}

export function getBranchPolarity(branch: string): Polarity {
  const polarity = BRANCH_POLARITY[branch];
  if (!polarity) throw new Error(`Invalid branch: ${branch}`);
  return polarity;
}

export function getHiddenStems(branch: string): string[] {
  const hidden = HIDDEN_STEMS[branch];
  if (!hidden) throw new Error(`Invalid branch: ${branch}`);
  return [...hidden];
}

export function getTenGodKey(dayMaster: string, targetStem: string): TenGodKey {
  const dmElement = getStemElement(dayMaster);
  const dmPolarity = getStemPolarity(dayMaster);
  const targetElement = getStemElement(targetStem);
  const targetPolarity = getStemPolarity(targetStem);

  const samePolarity = dmPolarity === targetPolarity;

  if (dmElement === targetElement) {
    return samePolarity ? "companion" : "robWealth";
  }

  if (GENERATES[dmElement] === targetElement) {
    return samePolarity ? "eatingGod" : "hurtingOfficer";
  }

  if (CONTROLS[dmElement] === targetElement) {
    return samePolarity ? "indirectWealth" : "directWealth";
  }

  if (CONTROLS[targetElement] === dmElement) {
    return samePolarity ? "sevenKillings" : "directOfficer";
  }

  if (GENERATES[targetElement] === dmElement) {
    return samePolarity ? "indirectSeal" : "directSeal";
  }

  throw new Error(`Unable to determine ten god relationship: ${dayMaster} -> ${targetStem}`);
}

export function getTenGodForBranch(dayMaster: string, branch: string): TenGodLabel {
  const hiddenStems = getHiddenStems(branch);
  return getTenGodLabel(getTenGodKey(dayMaster, hiddenStems[0]));
}

export function getTenGodsForBranch(
  dayMaster: string,
  branch: string,
): { stem: string; tenGod: TenGodLabel; type: "본기" | "중기" | "여기" }[] {
  const hiddenStems = getHiddenStems(branch);
  const types: ("본기" | "중기" | "여기")[] = ["본기", "중기", "여기"];

  return hiddenStems.map((stem, i) => ({
    stem,
    tenGod: getTenGodLabel(getTenGodKey(dayMaster, stem)),
    type: types[i],
  }));
}

export interface DayMasterLabel extends Label<"dayMaster"> {}

const DAY_MASTER_LABEL: DayMasterLabel = {
  key: "dayMaster",
  korean: "일간",
  hanja: "日干",
};

export interface FourPillarsTenGods {
  year: {
    stem: { char: string; tenGod: TenGodLabel };
    branch: {
      char: string;
      tenGod: TenGodLabel;
      hiddenStems: { stem: string; tenGod: TenGodLabel }[];
    };
  };
  month: {
    stem: { char: string; tenGod: TenGodLabel };
    branch: {
      char: string;
      tenGod: TenGodLabel;
      hiddenStems: { stem: string; tenGod: TenGodLabel }[];
    };
  };
  day: {
    stem: { char: string; tenGod: DayMasterLabel };
    branch: {
      char: string;
      tenGod: TenGodLabel;
      hiddenStems: { stem: string; tenGod: TenGodLabel }[];
    };
  };
  hour: {
    stem: { char: string; tenGod: TenGodLabel };
    branch: {
      char: string;
      tenGod: TenGodLabel;
      hiddenStems: { stem: string; tenGod: TenGodLabel }[];
    };
  };
  dayMaster: string;
}

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
      tenGod: getTenGodLabel(getTenGodKey(dayMaster, hs)),
    }));

    return {
      stem: {
        char: stem,
        tenGod: isDayPillar ? DAY_MASTER_LABEL : getTenGodLabel(getTenGodKey(dayMaster, stem)),
      },
      branch: {
        char: branch,
        tenGod: getTenGodLabel(getTenGodKey(dayMaster, hiddenStems[0].stem)),
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

export function countTenGods(analysis: FourPillarsTenGods): Record<TenGodKey, number> {
  const counts: Record<TenGodKey, number> = {
    companion: 0,
    robWealth: 0,
    eatingGod: 0,
    hurtingOfficer: 0,
    indirectWealth: 0,
    directWealth: 0,
    sevenKillings: 0,
    directOfficer: 0,
    indirectSeal: 0,
    directSeal: 0,
  };

  const stems = [analysis.year.stem, analysis.month.stem, analysis.hour.stem];
  for (const s of stems) {
    counts[s.tenGod.key]++;
  }

  const branches = [
    analysis.year.branch,
    analysis.month.branch,
    analysis.day.branch,
    analysis.hour.branch,
  ];
  for (const b of branches) {
    counts[b.tenGod.key]++;
  }

  return counts;
}

export function countElements(analysis: FourPillarsTenGods): Record<Element, number> {
  const counts: Record<Element, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  const stems = [
    analysis.year.stem.char,
    analysis.month.stem.char,
    analysis.day.stem.char,
    analysis.hour.stem.char,
  ];
  for (const s of stems) {
    counts[getStemElement(s)]++;
  }

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
