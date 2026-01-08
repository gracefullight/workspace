import type { DateAdapter } from "@/adapters/date-adapter";
import { getStemPolarity } from "@/core/ten-gods";
import type { Gender, Polarity } from "@/types";
import { BRANCHES, getPillarIndex, jdnFromDate, pillarFromIndex, STEMS } from "@/utils";

export type { Gender };

export interface LuckPillar {
  index: number;
  startAge: number;
  endAge: number;
  stem: string;
  branch: string;
  pillar: string;
}

export interface StartAgeDetail {
  years: number;
  months: number;
  days: number;
}

export interface MajorLuckResult {
  gender: Gender;
  yearStemPolarity: Polarity;
  isForward: boolean;
  startAge: number;
  startAgeDetail: StartAgeDetail;
  daysToTerm: number;
  pillars: LuckPillar[];
}

export function calculateMajorLuck<T>(
  adapter: DateAdapter<T>,
  birthDateTime: T,
  gender: Gender,
  yearPillar: string,
  monthPillar: string,
  options: {
    count?: number;
    nextJieMillis?: number;
    prevJieMillis?: number;
  } = {},
): MajorLuckResult {
  const { count = 8 } = options;

  const yearStem = yearPillar[0];
  const yearStemPolarity = getStemPolarity(yearStem);

  const isForward =
    (yearStemPolarity === "yang" && gender === "male") ||
    (yearStemPolarity === "yin" && gender === "female");

  const birthMillis = adapter.toMillis(birthDateTime);
  const msPerDay = 1000 * 60 * 60 * 24;

  let daysToTerm: number;

  if (options.nextJieMillis !== undefined && options.prevJieMillis !== undefined) {
    if (isForward) {
      daysToTerm = Math.abs(options.nextJieMillis - birthMillis) / msPerDay;
    } else {
      daysToTerm = Math.abs(birthMillis - options.prevJieMillis) / msPerDay;
    }
  } else {
    daysToTerm = 30;
  }

  const totalMonths = Math.round((daysToTerm / 3) * 12);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = Math.round(((daysToTerm / 3) * 12 - totalMonths) * 30);

  // 전통적으로 6개월 이상이면 반올림하여 1년 추가
  const startAge = months >= 6 ? years + 1 : years;
  const startAgeDetail: StartAgeDetail = { years, months, days: Math.abs(days) };

  const monthIdx60 = getPillarIndex(monthPillar);
  const pillars: LuckPillar[] = [];

  for (let i = 1; i <= count; i++) {
    const pillarIdx = isForward ? monthIdx60 + i : monthIdx60 - i;
    const pillar = pillarFromIndex(pillarIdx);

    pillars.push({
      index: i,
      startAge: startAge + (i - 1) * 10,
      endAge: startAge + i * 10 - 1,
      stem: pillar[0],
      branch: pillar[1],
      pillar,
    });
  }

  return {
    gender,
    yearStemPolarity,
    isForward,
    startAge,
    startAgeDetail,
    daysToTerm: Math.round(daysToTerm * 10) / 10,
    pillars,
  };
}

export interface YearlyLuckResult {
  year: number;
  stem: string;
  branch: string;
  pillar: string;
  age: number;
}

export function calculateYearlyLuck(
  birthYear: number,
  fromYear: number,
  toYear: number,
): YearlyLuckResult[] {
  const results: YearlyLuckResult[] = [];

  for (let year = fromYear; year <= toYear; year++) {
    const idx60 = (((year - 1984) % 60) + 60) % 60;
    const pillar = pillarFromIndex(idx60);
    const age = year - birthYear + 1;

    results.push({
      year,
      stem: pillar[0],
      branch: pillar[1],
      pillar,
      age,
    });
  }

  return results;
}

export function getYearPillar(year: number): string {
  const idx60 = (((year - 1984) % 60) + 60) % 60;
  return pillarFromIndex(idx60);
}

export function getCurrentMajorLuck(majorLuck: MajorLuckResult, age: number): LuckPillar | null {
  for (const pillar of majorLuck.pillars) {
    if (age >= pillar.startAge && age <= pillar.endAge) {
      return pillar;
    }
  }
  return null;
}

export interface MonthlyLuckResult {
  year: number;
  month: number;
  stem: string;
  branch: string;
  pillar: string;
}

export function calculateMonthlyLuck(
  year: number,
  fromMonth: number,
  toMonth: number,
): MonthlyLuckResult[] {
  const results: MonthlyLuckResult[] = [];

  const yearIdx60 = (((year - 1984) % 60) + 60) % 60;
  const yearStem = STEMS[yearIdx60 % 10];
  const yearStemIdx = STEMS.indexOf(yearStem);

  const baseMonthStemIdx = (yearStemIdx * 2 + 2) % 10;

  for (let month = fromMonth; month <= toMonth; month++) {
    const monthOffset = month - 1;
    const stemIdx = (baseMonthStemIdx + monthOffset) % 10;
    const branchIdx = (monthOffset + 2) % 12;

    const stem = STEMS[stemIdx];
    const branch = BRANCHES[branchIdx];
    const pillar = stem + branch;

    results.push({
      year,
      month,
      stem,
      branch,
      pillar,
    });
  }

  return results;
}

export interface DailyLuckResult {
  year: number;
  month: number;
  day: number;
  stem: string;
  branch: string;
  pillar: string;
}

export function calculateDailyLuck(
  year: number,
  month: number,
  fromDay: number,
  toDay: number,
): DailyLuckResult[] {
  const results: DailyLuckResult[] = [];

  for (let day = fromDay; day <= toDay; day++) {
    const jdn = jdnFromDate(year, month, day);
    const idx60 = (((jdn + 49) % 60) + 60) % 60;
    const stem = STEMS[idx60 % 10];
    const branch = BRANCHES[idx60 % 12];
    const pillar = stem + branch;

    results.push({
      year,
      month,
      day,
      stem,
      branch,
      pillar,
    });
  }

  return results;
}

export function getDayPillar(year: number, month: number, day: number): string {
  const jdn = jdnFromDate(year, month, day);
  const idx60 = (((jdn + 49) % 60) + 60) % 60;
  return STEMS[idx60 % 10] + BRANCHES[idx60 % 12];
}

export function getMonthPillar(year: number, month: number): string {
  const yearIdx60 = (((year - 1984) % 60) + 60) % 60;
  const yearStem = STEMS[yearIdx60 % 10];
  const yearStemIdx = STEMS.indexOf(yearStem);

  const baseMonthStemIdx = (yearStemIdx * 2 + 2) % 10;
  const monthOffset = month - 1;
  const stemIdx = (baseMonthStemIdx + monthOffset) % 10;
  const branchIdx = (monthOffset + 2) % 12;

  return STEMS[stemIdx] + BRANCHES[branchIdx];
}
