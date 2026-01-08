export type { DateAdapter } from "@/adapters/date-adapter";

export { getLunarDate, getSolarDate, type LunarDate } from "@/core/lunar";

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
  type Element,
  type Polarity,
  type TenGod,
  ELEMENTS,
  TEN_GODS,
  TEN_GOD_HANJA,
  TEN_GOD_ENGLISH,
  HIDDEN_STEMS,
  getStemElement,
  getStemPolarity,
  getBranchElement,
  getBranchPolarity,
  getHiddenStems,
  getTenGod,
  getTenGodForBranch,
  getTenGodsForBranch,
  analyzeTenGods,
  countTenGods,
  countElements,
  type FourPillarsTenGods,
} from "@/core/ten-gods";

export {
  type StrengthLevel,
  STRENGTH_LEVELS,
  analyzeStrength,
  type StrengthFactors,
  type StrengthResult,
} from "@/core/strength";

export {
  STEM_COMBINATIONS,
  BRANCH_SIX_COMBINATIONS,
  BRANCH_TRIPLE_COMBINATIONS,
  BRANCH_DIRECTIONAL_COMBINATIONS,
  BRANCH_CLASHES,
  BRANCH_HARMS,
  BRANCH_PUNISHMENTS,
  BRANCH_DESTRUCTIONS,
  analyzeRelations,
  findStemCombination,
  findBranchClash,
  findBranchSixCombination,
  type StemCombination,
  type BranchSixCombination,
  type BranchTripleCombination,
  type BranchDirectionalCombination,
  type BranchClash,
  type BranchHarm,
  type BranchPunishment,
  type BranchDestruction,
  type Relation,
  type RelationsResult,
} from "@/core/relations";

export {
  type Gender,
  type LuckPillar,
  type MajorLuckResult,
  type YearlyLuckResult,
  calculateMajorLuck,
  calculateYearlyLuck,
  getYearPillar,
  getCurrentMajorLuck,
} from "@/core/luck";

export {
  type YongShenMethod,
  type YongShenResult,
  analyzeYongShen,
  getElementRecommendations,
} from "@/core/yongshen";

import type { DateAdapter } from "@/adapters/date-adapter";
import { getFourPillars, type presetA } from "@/core/four-pillars";
import { analyzeTenGods, type FourPillarsTenGods } from "@/core/ten-gods";
import { analyzeStrength, type StrengthResult } from "@/core/strength";
import { analyzeRelations, type RelationsResult } from "@/core/relations";
import { analyzeYongShen, type YongShenResult } from "@/core/yongshen";
import {
  calculateMajorLuck,
  calculateYearlyLuck,
  type Gender,
  type MajorLuckResult,
  type YearlyLuckResult,
} from "@/core/luck";
import type { LunarDate } from "@/core/lunar";

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
  majorLuck?: MajorLuckResult;
  yearlyLuck?: YearlyLuckResult[];
  meta: {
    solarYearUsed: number;
    sunLonDeg: number;
    effectiveDayDate: { year: number; month: number; day: number };
    adjustedDtForHour: string;
  };
}

export interface GetSajuOptions {
  longitudeDeg: number;
  tzOffsetHours?: number;
  preset?: typeof presetA;
  gender?: Gender;
  includeMajorLuck?: boolean;
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

  const result: SajuResult = {
    pillars: { year, month, day, hour },
    lunar: fourPillars.lunar,
    tenGods,
    strength,
    relations,
    yongShen,
    meta: {
      solarYearUsed: fourPillars.meta.solarYearUsed,
      sunLonDeg: fourPillars.meta.sunLonDeg,
      effectiveDayDate: fourPillars.meta.effectiveDayDate,
      adjustedDtForHour: fourPillars.meta.adjustedDtForHour,
    },
  };

  if (options.gender && options.includeMajorLuck) {
    result.majorLuck = calculateMajorLuck(adapter, dtLocal, options.gender, year, month);
  }

  if (options.yearlyLuckRange) {
    const birthYear = fourPillars.meta.solarYearUsed;
    result.yearlyLuck = calculateYearlyLuck(
      birthYear,
      options.yearlyLuckRange.from,
      options.yearlyLuckRange.to,
    );
  }

  return result;
}
