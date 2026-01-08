import { getBranchIndex, isYangStem } from "@/utils";
import type { Label } from "@/types/common";

export const TWELVE_STAGES = [
  "longLife",
  "bathing",
  "crownBelt",
  "establishment",
  "imperial",
  "decline",
  "illness",
  "death",
  "tomb",
  "extinction",
  "conception",
  "nurturing",
] as const;

export type TwelveStageKey = (typeof TWELVE_STAGES)[number];

export type TwelveStageStrength = "strong" | "neutral" | "weak";

export interface TwelveStageLabel extends Label<TwelveStageKey> {
  meaning: string;
  strength: TwelveStageStrength;
}

const YANG_STEM_BIRTH_BRANCH: Record<string, string> = {
  甲: "亥",
  丙: "寅",
  戊: "寅",
  庚: "巳",
  壬: "申",
};

const YIN_STEM_BIRTH_BRANCH: Record<string, string> = {
  乙: "午",
  丁: "酉",
  己: "酉",
  辛: "子",
  癸: "卯",
};

const STAGE_DATA: Record<
  TwelveStageKey,
  { korean: string; hanja: string; meaning: string; strength: TwelveStageStrength }
> = {
  longLife: {
    korean: "장생",
    hanja: "長生",
    meaning: "새로운 시작, 성장의 기운",
    strength: "strong",
  },
  bathing: { korean: "목욕", hanja: "沐浴", meaning: "불안정, 변화, 도화", strength: "neutral" },
  crownBelt: { korean: "관대", hanja: "冠帶", meaning: "성장, 준비, 학업", strength: "strong" },
  establishment: { korean: "건록", hanja: "建祿", meaning: "안정, 직업, 녹봉", strength: "strong" },
  imperial: { korean: "제왕", hanja: "帝旺", meaning: "최고 전성기, 권력", strength: "strong" },
  decline: { korean: "쇠", hanja: "衰", meaning: "기운 약화, 후퇴", strength: "weak" },
  illness: { korean: "병", hanja: "病", meaning: "질병, 곤란", strength: "weak" },
  death: { korean: "사", hanja: "死", meaning: "끝, 전환점", strength: "weak" },
  tomb: { korean: "묘", hanja: "墓", meaning: "저장, 숨김, 보관", strength: "neutral" },
  extinction: { korean: "절", hanja: "絶", meaning: "단절, 새로운 국면", strength: "weak" },
  conception: { korean: "태", hanja: "胎", meaning: "잉태, 계획, 구상", strength: "neutral" },
  nurturing: { korean: "양", hanja: "養", meaning: "양육, 준비, 축적", strength: "neutral" },
};

export function getTwelveStageLabel(key: TwelveStageKey): TwelveStageLabel {
  const data = STAGE_DATA[key];
  return { key, ...data };
}

function getTwelveStageKey(stem: string, branch: string): TwelveStageKey {
  const isYang = isYangStem(stem);
  const birthBranch = isYang ? YANG_STEM_BIRTH_BRANCH[stem] : YIN_STEM_BIRTH_BRANCH[stem];

  if (!birthBranch) {
    throw new Error(`Invalid stem: ${stem}`);
  }

  const birthIndex = getBranchIndex(birthBranch);
  const targetIndex = getBranchIndex(branch);

  if (birthIndex === -1 || targetIndex === -1) {
    throw new Error(`Invalid branch: ${branch}`);
  }

  let stageIndex: number;

  if (isYang) {
    stageIndex = (targetIndex - birthIndex + 12) % 12;
  } else {
    stageIndex = (birthIndex - targetIndex + 12) % 12;
  }

  return TWELVE_STAGES[stageIndex];
}

export interface TwelveStagesResult {
  year: TwelveStageLabel;
  month: TwelveStageLabel;
  day: TwelveStageLabel;
  hour: TwelveStageLabel;
}

export function analyzeTwelveStages(
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  hourPillar: string,
): TwelveStagesResult {
  const dayMaster = dayPillar[0];

  return {
    year: getTwelveStageLabel(getTwelveStageKey(dayMaster, yearPillar[1])),
    month: getTwelveStageLabel(getTwelveStageKey(dayMaster, monthPillar[1])),
    day: getTwelveStageLabel(getTwelveStageKey(dayMaster, dayPillar[1])),
    hour: getTwelveStageLabel(getTwelveStageKey(dayMaster, hourPillar[1])),
  };
}
