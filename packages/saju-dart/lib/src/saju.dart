import 'package:lunar/lunar.dart';
import 'package:timezone/timezone.dart' as tz;

import 'core/core.dart';
import 'types/types.dart';

export 'core/core.dart';
export 'types/types.dart';

/// Lunar date information
class LunarDate {
  const LunarDate({
    required this.year,
    required this.month,
    required this.day,
    required this.isLeapMonth,
    required this.yearGanZhi,
    required this.monthGanZhi,
    required this.dayGanZhi,
  });

  final int year;
  final int month;
  final int day;
  final bool isLeapMonth;
  final String yearGanZhi;
  final String monthGanZhi;
  final String dayGanZhi;
}

/// Get lunar date from solar date
LunarDate getLunarDate(int year, int month, int day) {
  final solar = Solar.fromYmd(year, month, day);
  final lunar = solar.getLunar();

  return LunarDate(
    year: lunar.getYear(),
    month: lunar.getMonth().abs(),
    day: lunar.getDay(),
    isLeapMonth: lunar.getMonth() < 0,
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
  );
}

/// Complete Saju analysis result
class SajuResult {
  const SajuResult({
    required this.pillars,
    required this.lunar,
    required this.tenGods,
    required this.strength,
    required this.relations,
    required this.yongShen,
    required this.solarTerms,
    required this.majorLuck,
    required this.yearlyLuck,
    required this.twelveStages,
    required this.meta,
  });

  final FourPillars pillars;
  final LunarDate lunar;
  final FourPillarsTenGods tenGods;
  final StrengthResult strength;
  final RelationsResult relations;
  final YongShenResult yongShen;
  final SolarTermInfo solarTerms;
  final MajorLuckResult majorLuck;
  final List<YearlyLuckResult> yearlyLuck;
  final TwelveStagesResult twelveStages;
  final SajuMeta meta;
}

/// Saju calculation metadata
class SajuMeta {
  const SajuMeta({
    required this.solarYearUsed,
    required this.sunLonDeg,
    required this.effectiveDayDate,
    required this.adjustedDtForHour,
  });

  final int solarYearUsed;
  final double sunLonDeg;
  final ({int year, int month, int day}) effectiveDayDate;
  final tz.TZDateTime adjustedDtForHour;
}

/// Calculate complete Saju analysis
SajuResult getSaju(
  tz.TZDateTime dtLocal, {
  required Gender gender,
  double? longitudeDeg,
  double tzOffsetHours = 9.0,
  PillarPreset preset = standardPreset,
  int? currentYear,
  ({int from, int to})? yearlyLuckRange,
}) {
  // Calculate four pillars
  final fourPillarsResult = getFourPillars(
    dtLocal,
    longitudeDeg: longitudeDeg,
    tzOffsetHours: tzOffsetHours,
    preset: preset,
  );

  final pillars = fourPillarsResult.pillars;

  // Analyze components
  final tenGods = analyzeTenGods(pillars);
  final strength = analyzeStrength(pillars);
  final relations = analyzeRelations(pillars);
  final yongShen = analyzeYongShen(pillars);
  final solarTerms = analyzeSolarTerms(dtLocal);
  final twelveStages = analyzeTwelveStages(pillars);

  // Calculate luck
  final majorLuck = calculateMajorLuck(
    birthMillis: dtLocal.millisecondsSinceEpoch,
    gender: gender,
    yearPillar: pillars.year,
    monthPillar: pillars.month,
    nextJieMillis: solarTerms.nextJieMillis,
    prevJieMillis: solarTerms.prevJieMillis,
  );

  final effectiveCurrentYear = currentYear ?? DateTime.now().year;
  final yearlyLuck = calculateYearlyLuck(
    fourPillarsResult.solarYear,
    yearlyLuckRange?.from ?? effectiveCurrentYear - 5,
    yearlyLuckRange?.to ?? effectiveCurrentYear + 10,
  );

  // Get lunar date
  final effDate = fourPillarsResult.effectiveDayDate;
  final lunar = getLunarDate(effDate.year, effDate.month, effDate.day);

  return SajuResult(
    pillars: pillars,
    lunar: lunar,
    tenGods: tenGods,
    strength: strength,
    relations: relations,
    yongShen: yongShen,
    solarTerms: solarTerms,
    majorLuck: majorLuck,
    yearlyLuck: yearlyLuck,
    twelveStages: twelveStages,
    meta: SajuMeta(
      solarYearUsed: fourPillarsResult.solarYear,
      sunLonDeg: fourPillarsResult.sunLonDeg,
      effectiveDayDate: effDate,
      adjustedDtForHour: fourPillarsResult.adjustedDtForHour,
    ),
  );
}
