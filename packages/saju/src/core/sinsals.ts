import type { Label, PillarPosition } from "@/types";

export const SINSALS = [
  "peachBlossom",
  "skyHorse",
  "floweryCanopy",
  "ghostGate",
  "solitaryStar",
  "widowStar",
  "heavenlyVirtue",
  "monthlyVirtue",
  "skyNoble",
  "moonNoble",
  "literaryNoble",
  "academicHall",
  "bloodKnife",
  "sixHarms",
  "whiteCloth",
  "heavenlyDoctor",
] as const;

export type SinsalKey = (typeof SINSALS)[number];

export type SinsalType = "auspicious" | "inauspicious" | "neutral";

export interface SinsalLabel extends Label<SinsalKey> {
  meaning: string;
  type: SinsalType;
}

const PEACH_BLOSSOM_MAP: Record<string, string> = {
  寅: "卯",
  午: "卯",
  戌: "卯",
  申: "酉",
  子: "酉",
  辰: "酉",
  巳: "午",
  酉: "午",
  丑: "午",
  亥: "子",
  卯: "子",
  未: "子",
};

const SKY_HORSE_MAP: Record<string, string> = {
  寅: "申",
  午: "申",
  戌: "申",
  申: "寅",
  子: "寅",
  辰: "寅",
  巳: "亥",
  酉: "亥",
  丑: "亥",
  亥: "巳",
  卯: "巳",
  未: "巳",
};

const FLOWERY_CANOPY_MAP: Record<string, string> = {
  寅: "戌",
  午: "戌",
  戌: "戌",
  申: "辰",
  子: "辰",
  辰: "辰",
  巳: "丑",
  酉: "丑",
  丑: "丑",
  亥: "未",
  卯: "未",
  未: "未",
};

const GHOST_GATE_MAP: Record<string, string> = {
  子: "卯",
  丑: "寅",
  寅: "丑",
  卯: "子",
  辰: "亥",
  巳: "戌",
  午: "酉",
  未: "申",
  申: "未",
  酉: "午",
  戌: "巳",
  亥: "辰",
};

const SOLITARY_STAR_MAP: Record<string, string> = {
  子: "寅",
  丑: "寅",
  寅: "巳",
  卯: "巳",
  辰: "巳",
  巳: "申",
  午: "申",
  未: "申",
  申: "亥",
  酉: "亥",
  戌: "亥",
  亥: "寅",
};

const WIDOW_STAR_MAP: Record<string, string> = {
  子: "戌",
  丑: "戌",
  寅: "丑",
  卯: "丑",
  辰: "丑",
  巳: "辰",
  午: "辰",
  未: "辰",
  申: "未",
  酉: "未",
  戌: "未",
  亥: "戌",
};

const HEAVENLY_VIRTUE_MAP: Record<string, string> = {
  寅: "丁",
  卯: "申",
  辰: "壬",
  巳: "辛",
  午: "亥",
  未: "甲",
  申: "癸",
  酉: "寅",
  戌: "丙",
  亥: "乙",
  子: "巳",
  丑: "庚",
};

const MONTHLY_VIRTUE_MAP: Record<string, string> = {
  寅: "丙",
  卯: "甲",
  辰: "壬",
  巳: "庚",
  午: "丙",
  未: "甲",
  申: "壬",
  酉: "庚",
  戌: "丙",
  亥: "甲",
  子: "壬",
  丑: "庚",
};

const SKY_NOBLE_MAP: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
  辛: ["午", "寅"],
};

const LITERARY_NOBLE_MAP: Record<string, string> = {
  甲: "巳",
  乙: "午",
  丙: "申",
  丁: "酉",
  戊: "申",
  己: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
};

const ACADEMIC_HALL_MAP: Record<string, string> = {
  甲: "亥",
  乙: "子",
  丙: "寅",
  丁: "卯",
  戊: "寅",
  己: "卯",
  庚: "巳",
  辛: "午",
  壬: "申",
  癸: "酉",
};

const BLOOD_KNIFE_MAP: Record<string, string> = {
  子: "酉",
  丑: "戌",
  寅: "亥",
  卯: "子",
  辰: "丑",
  巳: "寅",
  午: "卯",
  未: "辰",
  申: "巳",
  酉: "午",
  戌: "未",
  亥: "申",
};

const HEAVENLY_DOCTOR_MAP: Record<string, string> = {
  子: "亥",
  丑: "子",
  寅: "丑",
  卯: "寅",
  辰: "卯",
  巳: "辰",
  午: "巳",
  未: "午",
  申: "未",
  酉: "申",
  戌: "酉",
  亥: "戌",
};

export interface SinsalMatch {
  sinsal: SinsalLabel;
  position: PillarPosition;
}

export interface SinsalResult {
  matches: SinsalMatch[];
  summary: Partial<Record<SinsalKey, PillarPosition[]>>;
}

function checkBranchBasedSinsal(
  baseBranch: string,
  targetBranches: string[],
  positions: PillarPosition[],
  map: Record<string, string>,
  sinsalKey: SinsalKey,
): SinsalMatch[] {
  const matches: SinsalMatch[] = [];
  const targetSinsal = map[baseBranch];

  if (targetSinsal) {
    targetBranches.forEach((branch, idx) => {
      if (branch === targetSinsal) {
        matches.push({ sinsal: getSinsalLabel(sinsalKey), position: positions[idx] });
      }
    });
  }

  return matches;
}

function checkStemBasedSinsal(
  baseStem: string,
  targetBranches: string[],
  positions: PillarPosition[],
  map: Record<string, string | string[]>,
  sinsalKey: SinsalKey,
): SinsalMatch[] {
  const matches: SinsalMatch[] = [];
  const targetSinsal = map[baseStem];

  if (targetSinsal) {
    const targets = Array.isArray(targetSinsal) ? targetSinsal : [targetSinsal];
    targetBranches.forEach((branch, idx) => {
      if (targets.includes(branch)) {
        matches.push({ sinsal: getSinsalLabel(sinsalKey), position: positions[idx] });
      }
    });
  }

  return matches;
}

export function analyzeSinsals(
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  hourPillar: string,
): SinsalResult {
  const yearBranch = yearPillar[1];
  const monthBranch = monthPillar[1];
  const dayBranch = dayPillar[1];
  const hourBranch = hourPillar[1];

  const dayStem = dayPillar[0];
  const yearStem = yearPillar[0];

  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const positions: PillarPosition[] = ["year", "month", "day", "hour"];

  const matches: SinsalMatch[] = [];

  matches.push(
    ...checkBranchBasedSinsal(
      yearBranch,
      allBranches,
      positions,
      PEACH_BLOSSOM_MAP,
      "peachBlossom",
    ),
  );
  matches.push(
    ...checkBranchBasedSinsal(dayBranch, allBranches, positions, PEACH_BLOSSOM_MAP, "peachBlossom"),
  );

  matches.push(
    ...checkBranchBasedSinsal(yearBranch, allBranches, positions, SKY_HORSE_MAP, "skyHorse"),
  );
  matches.push(
    ...checkBranchBasedSinsal(dayBranch, allBranches, positions, SKY_HORSE_MAP, "skyHorse"),
  );

  matches.push(
    ...checkBranchBasedSinsal(
      yearBranch,
      allBranches,
      positions,
      FLOWERY_CANOPY_MAP,
      "floweryCanopy",
    ),
  );
  matches.push(
    ...checkBranchBasedSinsal(
      dayBranch,
      allBranches,
      positions,
      FLOWERY_CANOPY_MAP,
      "floweryCanopy",
    ),
  );

  matches.push(
    ...checkBranchBasedSinsal(dayBranch, allBranches, positions, GHOST_GATE_MAP, "ghostGate"),
  );

  matches.push(
    ...checkBranchBasedSinsal(
      yearBranch,
      allBranches,
      positions,
      SOLITARY_STAR_MAP,
      "solitaryStar",
    ),
  );

  matches.push(
    ...checkBranchBasedSinsal(yearBranch, allBranches, positions, WIDOW_STAR_MAP, "widowStar"),
  );

  matches.push(
    ...checkBranchBasedSinsal(
      monthBranch,
      [yearPillar[0], monthPillar[0], dayPillar[0], hourPillar[0]].map((s) => s),
      positions,
      HEAVENLY_VIRTUE_MAP,
      "heavenlyVirtue",
    ),
  );

  matches.push(
    ...checkBranchBasedSinsal(
      monthBranch,
      [yearPillar[0], monthPillar[0], dayPillar[0], hourPillar[0]].map((s) => s),
      positions,
      MONTHLY_VIRTUE_MAP,
      "monthlyVirtue",
    ),
  );

  matches.push(...checkStemBasedSinsal(dayStem, allBranches, positions, SKY_NOBLE_MAP, "skyNoble"));
  matches.push(
    ...checkStemBasedSinsal(yearStem, allBranches, positions, SKY_NOBLE_MAP, "moonNoble"),
  );

  matches.push(
    ...checkStemBasedSinsal(dayStem, allBranches, positions, LITERARY_NOBLE_MAP, "literaryNoble"),
  );

  matches.push(
    ...checkStemBasedSinsal(dayStem, allBranches, positions, ACADEMIC_HALL_MAP, "academicHall"),
  );

  matches.push(
    ...checkBranchBasedSinsal(dayBranch, allBranches, positions, BLOOD_KNIFE_MAP, "bloodKnife"),
  );

  matches.push(
    ...checkBranchBasedSinsal(
      monthBranch,
      allBranches,
      positions,
      HEAVENLY_DOCTOR_MAP,
      "heavenlyDoctor",
    ),
  );

  const uniqueMatches = matches.filter(
    (match, index, self) =>
      index ===
      self.findIndex((m) => m.sinsal.key === match.sinsal.key && m.position === match.position),
  );

  const summary: Partial<Record<SinsalKey, PillarPosition[]>> = {};
  for (const match of uniqueMatches) {
    if (!summary[match.sinsal.key]) {
      summary[match.sinsal.key] = [];
    }
    summary[match.sinsal.key]?.push(match.position);
  }

  return { matches: uniqueMatches, summary };
}

export const SINSAL_INFO: Record<
  SinsalKey,
  {
    korean: string;
    hanja: string;
    meaning: string;
    type: SinsalType;
  }
> = {
  peachBlossom: {
    korean: "도화살",
    hanja: "桃花煞",
    meaning: "이성 인연, 매력, 색정",
    type: "neutral",
  },
  skyHorse: { korean: "역마살", hanja: "驛馬煞", meaning: "이동, 변화, 해외", type: "neutral" },
  floweryCanopy: {
    korean: "화개살",
    hanja: "華蓋煞",
    meaning: "예술, 종교, 고독",
    type: "neutral",
  },
  ghostGate: {
    korean: "귀문관살",
    hanja: "鬼門關煞",
    meaning: "귀신, 영적 감각, 불안",
    type: "inauspicious",
  },
  solitaryStar: {
    korean: "고진살",
    hanja: "孤辰煞",
    meaning: "고독, 독립, 자립",
    type: "inauspicious",
  },
  widowStar: {
    korean: "과숙살",
    hanja: "寡宿煞",
    meaning: "외로움, 배우자 인연 약함",
    type: "inauspicious",
  },
  heavenlyVirtue: {
    korean: "천덕귀인",
    hanja: "天德貴人",
    meaning: "하늘의 덕, 재난 해소",
    type: "auspicious",
  },
  monthlyVirtue: {
    korean: "월덕귀인",
    hanja: "月德貴人",
    meaning: "달의 덕, 흉화 해소",
    type: "auspicious",
  },
  skyNoble: {
    korean: "천을귀인",
    hanja: "天乙貴人",
    meaning: "귀인의 도움, 위기 극복",
    type: "auspicious",
  },
  moonNoble: { korean: "월을귀인", hanja: "月乙貴人", meaning: "귀인의 도움", type: "auspicious" },
  literaryNoble: {
    korean: "문창귀인",
    hanja: "文昌貴人",
    meaning: "학업, 시험, 문서",
    type: "auspicious",
  },
  academicHall: {
    korean: "학당귀인",
    hanja: "學堂貴人",
    meaning: "학문, 교육, 지식",
    type: "auspicious",
  },
  bloodKnife: {
    korean: "혈인살",
    hanja: "血刃煞",
    meaning: "수술, 출혈, 부상",
    type: "inauspicious",
  },
  sixHarms: { korean: "육해살", hanja: "六害煞", meaning: "인관계 해침", type: "inauspicious" },
  whiteCloth: {
    korean: "백호살",
    hanja: "白虎煞",
    meaning: "상해, 사고, 흉사",
    type: "inauspicious",
  },
  heavenlyDoctor: {
    korean: "천의성",
    hanja: "天醫星",
    meaning: "치료, 의료, 건강 회복",
    type: "auspicious",
  },
};

export function getSinsalLabel(key: SinsalKey): SinsalLabel {
  const info = SINSAL_INFO[key];
  return {
    key,
    korean: info.korean,
    hanja: info.hanja,
    meaning: info.meaning,
    type: info.type,
  };
}
