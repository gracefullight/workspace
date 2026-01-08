import type { DateAdapter } from "@/adapters/date-adapter";
import { STEMS, BRANCHES } from "./four-pillars";
import { getStemPolarity, type Polarity } from "./ten-gods";

export type Gender = "male" | "female";

export interface LuckPillar {
  index: number;
  startAge: number;
  endAge: number;
  stem: string;
  branch: string;
  pillar: string;
}

export interface MajorLuckResult {
  gender: Gender;
  yearStemPolarity: Polarity;
  isForward: boolean;
  startAge: number;
  pillars: LuckPillar[];
}

function getMonthPillarIndex(monthPillar: string): number {
  const stem = monthPillar[0];
  const branch = monthPillar[1];
  const stemIdx = STEMS.indexOf(stem);
  const branchIdx = BRANCHES.indexOf(branch);

  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) {
      return i;
    }
  }
  return 0;
}

function pillarFromIndex(idx60: number): string {
  const normalized = ((idx60 % 60) + 60) % 60;
  return STEMS[normalized % 10] + BRANCHES[normalized % 12];
}

export function calculateMajorLuck<T>(
  adapter: DateAdapter<T>,
  birthDateTime: T,
  gender: Gender,
  yearPillar: string,
  monthPillar: string,
  options: {
    count?: number;
    nextTermDate?: T;
    prevTermDate?: T;
  } = {},
): MajorLuckResult {
  const { count = 8 } = options;

  const yearStem = yearPillar[0];
  const yearStemPolarity = getStemPolarity(yearStem);

  const isForward =
    (yearStemPolarity === "yang" && gender === "male") ||
    (yearStemPolarity === "yin" && gender === "female");

  let daysToTerm = 30;

  if (options.nextTermDate && options.prevTermDate) {
    const birthMillis = adapter.toMillis(birthDateTime);
    if (isForward) {
      const nextTermMillis = adapter.toMillis(options.nextTermDate);
      daysToTerm = Math.abs(nextTermMillis - birthMillis) / (1000 * 60 * 60 * 24);
    } else {
      const prevTermMillis = adapter.toMillis(options.prevTermDate);
      daysToTerm = Math.abs(birthMillis - prevTermMillis) / (1000 * 60 * 60 * 24);
    }
  }

  const startAge = Math.round(daysToTerm / 3);

  const monthIdx60 = getMonthPillarIndex(monthPillar);
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
