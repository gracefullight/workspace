import type { Branch, Stem } from "@/types";

export const STEMS: readonly Stem[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

export const BRANCHES: readonly Branch[] = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

export const ELEMENTS = ["wood", "fire", "earth", "metal", "water"] as const;

export function getStemIndex(stem: Stem | string): number {
  return STEMS.indexOf(stem as Stem);
}

export function getBranchIndex(branch: Branch | string): number {
  return BRANCHES.indexOf(branch as Branch);
}

export function pillarFromIndex(idx60: number): string {
  const normalized = ((idx60 % 60) + 60) % 60;
  return STEMS[normalized % 10] + BRANCHES[normalized % 12];
}

export function getPillarIndex(pillar: string): number {
  const stem = pillar[0] as Stem;
  const branch = pillar[1] as Branch;
  const stemIdx = getStemIndex(stem);
  const branchIdx = getBranchIndex(branch);

  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) {
      return i;
    }
  }
  return 0;
}

export function jdnFromDate(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y2 = year + 4800 - a;
  const m2 = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

export function dayPillarIndexFromJdn(jdn: number): number {
  return (((jdn + 49) % 60) + 60) % 60;
}

export function isYangStem(stem: Stem | string): boolean {
  return ["甲", "丙", "戊", "庚", "壬"].includes(stem);
}

export function isYinStem(stem: Stem | string): boolean {
  return ["乙", "丁", "己", "辛", "癸"].includes(stem);
}
