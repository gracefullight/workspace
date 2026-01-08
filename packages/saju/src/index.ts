export type { DateAdapter } from "@/adapters/date-adapter";
export {
  applyMeanSolarTime,
  BRANCHES,
  dayPillarFromDate,
  effectiveDayDate,
  getFourPillars,
  hourPillar,
  monthPillar,
  presetA,
  presetB,
  STANDARD_PRESET,
  STEMS,
  TRADITIONAL_PRESET,
  yearPillar,
} from "@/core/four-pillars";
export {
  calculateDailyLuck,
  calculateMajorLuck,
  calculateMonthlyLuck,
  calculateYearlyLuck,
  type DailyLuckResult,
  type Gender,
  getCurrentMajorLuck,
  getDayPillar,
  getMonthPillar,
  getYearPillar,
  type LuckPillar,
  type MajorLuckResult,
  type MonthlyLuckResult,
  type StartAgeDetail,
  type YearlyLuckResult,
} from "@/core/luck";
export { getLunarDate, getSolarDate, type LunarDate } from "@/core/lunar";
export {
  analyzeRelations,
  BRANCH_CLASHES,
  BRANCH_DESTRUCTIONS,
  BRANCH_DIRECTIONAL_COMBINATIONS,
  BRANCH_HARMS,
  BRANCH_PUNISHMENTS,
  BRANCH_SIX_COMBINATIONS,
  BRANCH_TRIPLE_COMBINATIONS,
  type BranchClash,
  type BranchDestruction,
  type BranchDirectionalCombination,
  type BranchHarm,
  type BranchPunishment,
  type BranchSixCombination,
  type BranchTripleCombination,
  findBranchClash,
  findBranchSixCombination,
  findStemCombination,
  type Relation,
  type RelationsResult,
  STEM_COMBINATIONS,
  type StemCombination,
} from "@/core/relations";
export {
  analyzeSinsals,
  getSinsalLabel,
  SINSAL_INFO,
  SINSALS,
  type SinsalKey,
  type SinsalLabel,
  type SinsalMatch,
  type SinsalResult,
  type SinsalType,
} from "@/core/sinsals";
export {
  analyzeSolarTerms,
  getSolarTermLabel,
  getSolarTermsForYear,
  SOLAR_TERM_KEYS,
  SOLAR_TERMS,
  type SolarTerm,
  type SolarTermDateInfo,
  type SolarTermHanja,
  type SolarTermInfo,
  type SolarTermKey,
  type SolarTermLabel,
  type SolarTermName,
} from "@/core/solar-terms";
export {
  analyzeStrength,
  getStrengthLevelLabel,
  STRENGTH_LEVEL_KEYS,
  type StrengthFactors,
  type StrengthLevelKey,
  type StrengthLevelLabel,
  type StrengthResult,
} from "@/core/strength";
export {
  analyzeTenGods,
  countElements,
  countTenGods,
  type DayMasterLabel,
  ELEMENTS,
  type Element,
  type ElementLabel,
  type FourPillarsTenGods,
  getBranchElement,
  getBranchPolarity,
  getElementLabel,
  getHiddenStems,
  getStemElement,
  getStemPolarity,
  getTenGodForBranch,
  getTenGodKey,
  getTenGodLabel,
  getTenGodsForBranch,
  HIDDEN_STEMS,
  type Polarity,
  TEN_GOD_KEYS,
  type TenGodKey,
  type TenGodLabel,
} from "@/core/ten-gods";
export {
  analyzeTwelveStages,
  getTwelveStageLabel,
  TWELVE_STAGES,
  type TwelveStageKey,
  type TwelveStageLabel,
  type TwelveStagesResult,
} from "@/core/twelve-stages";

export {
  analyzeYongShen,
  getElementRecommendations,
  getYongShenMethodLabel,
  type YongShenMethodKey,
  type YongShenMethodLabel,
  type YongShenResult,
} from "@/core/yongshen";
export type { Branch, Label, Pillar, PillarPosition, Stem } from "@/types";

import type { DateAdapter } from "@/adapters/date-adapter";
import { getFourPillars, type presetA } from "@/core/four-pillars";
import {
  calculateMajorLuck,
  calculateYearlyLuck,
  type Gender,
  type MajorLuckResult,
  type YearlyLuckResult,
} from "@/core/luck";
import type { LunarDate } from "@/core/lunar";
import { analyzeRelations, type RelationsResult } from "@/core/relations";
import { analyzeSinsals, type SinsalResult } from "@/core/sinsals";
import { analyzeSolarTerms, type SolarTermInfo } from "@/core/solar-terms";
import { analyzeStrength, type StrengthResult } from "@/core/strength";
import { analyzeTenGods, type FourPillarsTenGods } from "@/core/ten-gods";
import { analyzeTwelveStages, type TwelveStagesResult } from "@/core/twelve-stages";
import { analyzeYongShen, type YongShenResult } from "@/core/yongshen";

export interface SajuResult {
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  lunar: LunarDate;
  tenGods: FourPillarsTenGods;
  strength: StrengthResult;
  relations: RelationsResult;
  yongShen: YongShenResult;
  solarTerms: SolarTermInfo;
  majorLuck: MajorLuckResult;
  yearlyLuck: YearlyLuckResult[];
  twelveStages: TwelveStagesResult;
  sinsals: SinsalResult;
  meta: {
    solarYearUsed: number;
    sunLonDeg: number;
    effectiveDayDate: { year: number; month: number; day: number };
    adjustedDtForHour: string;
  };
}

export interface GetSajuOptions {
  longitudeDeg?: number;
  gender: Gender;
  tzOffsetHours?: number;
  preset?: typeof presetA;
  currentYear?: number;
  yearlyLuckRange?: { from: number; to: number };
}

export function getSaju<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  options: GetSajuOptions,
): SajuResult {
  const fourPillars = getFourPillars(adapter, dtLocal, {
    longitudeDeg: options.longitudeDeg,
    tzOffsetHours: options.tzOffsetHours,
    preset: options.preset,
  });

  const { year, month, day, hour } = fourPillars;

  const tenGods = analyzeTenGods(year, month, day, hour);
  const strength = analyzeStrength(year, month, day, hour);
  const relations = analyzeRelations(year, month, day, hour);
  const yongShen = analyzeYongShen(year, month, day, hour);
  const solarTerms = analyzeSolarTerms(adapter, dtLocal);
  const twelveStages = analyzeTwelveStages(year, month, day, hour);
  const sinsals = analyzeSinsals(year, month, day, hour);

  const result: SajuResult = {
    pillars: { year, month, day, hour },
    lunar: fourPillars.lunar,
    tenGods,
    strength,
    relations,
    yongShen,
    solarTerms,
    majorLuck: calculateMajorLuck(adapter, dtLocal, options.gender, year, month, {
      nextJieMillis: solarTerms.nextJieMillis,
      prevJieMillis: solarTerms.prevJieMillis,
    }),
    yearlyLuck: calculateYearlyLuck(
      fourPillars.meta.solarYearUsed,
      options.yearlyLuckRange?.from ?? (options.currentYear ?? new Date().getFullYear()) - 5,
      options.yearlyLuckRange?.to ?? (options.currentYear ?? new Date().getFullYear()) + 10,
    ),
    twelveStages,
    sinsals,
    meta: {
      solarYearUsed: fourPillars.meta.solarYearUsed,
      sunLonDeg: fourPillars.meta.sunLonDeg,
      effectiveDayDate: fourPillars.meta.effectiveDayDate,
      adjustedDtForHour: fourPillars.meta.adjustedDtForHour,
    },
  };

  return result;
}
