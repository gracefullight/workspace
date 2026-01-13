import 'package:timezone/timezone.dart' as tz;

import '../types/types.dart';
import '../utils/julian_day.dart';
import '../utils/mean_solar_time.dart';
import '../utils/solar_longitude.dart';

/// Day boundary configuration
enum DayBoundary {
  /// Day changes at midnight (00:00)
  midnight,

  /// Day changes at Zi hour start (23:00)
  zi23,
}

/// Configuration preset for pillar calculation
class PillarPreset {
  const PillarPreset({
    required this.dayBoundary,
    required this.useMeanSolarTimeForHour,
    required this.useMeanSolarTimeForBoundary,
  });

  final DayBoundary dayBoundary;
  final bool useMeanSolarTimeForHour;
  final bool useMeanSolarTimeForBoundary;
}

/// Standard preset: midnight day boundary, solar time for hour only
const standardPreset = PillarPreset(
  dayBoundary: DayBoundary.midnight,
  useMeanSolarTimeForHour: true,
  useMeanSolarTimeForBoundary: false,
);

/// Traditional preset: Zi hour (23:00) day boundary, solar time for all
const traditionalPreset = PillarPreset(
  dayBoundary: DayBoundary.zi23,
  useMeanSolarTimeForHour: true,
  useMeanSolarTimeForBoundary: true,
);

/// Calculate day pillar from date
Pillar dayPillarFromDate(int year, int month, int day) {
  final jdn = jdnFromDate(year, month, day);
  final idx60 = (((jdn - 11) % 60) + 60) % 60;
  return Pillar.fromIndex(idx60);
}

/// Calculate year pillar from datetime
({Pillar pillar, int solarYear}) yearPillar(tz.TZDateTime dtLocal) {
  final y = dtLocal.year;
  final lichunLocal = tz.TZDateTime.from(lichunUtc(y), dtLocal.location);
  final solarYear = dtLocal.isAfter(lichunLocal) || dtLocal == lichunLocal ? y : y - 1;
  final idx60 = (((solarYear - 1984) % 60) + 60) % 60;
  return (pillar: Pillar.fromIndex(idx60), solarYear: solarYear);
}

/// Get month branch index from sun longitude
int _monthBranchIndexFromSunLon(double lon) {
  return (((lon + 45) % 360) ~/ 30 + 2) % 12;
}

/// Get first month stem index from year stem index
int _firstMonthStemIndex(int yearStemIdx) {
  const map = {
    0: 2,
    5: 2,
    1: 4,
    6: 4,
    2: 6,
    7: 6,
    3: 8,
    8: 8,
    4: 0,
    9: 0,
  };
  return map[yearStemIdx] ?? 0;
}

/// Calculate month pillar from datetime
({Pillar pillar, double sunLonDeg}) monthPillar(tz.TZDateTime dtLocal) {
  final yearResult = yearPillar(dtLocal);
  final yearStemIdx = yearResult.pillar.stem.index;

  final lon = sunApparentLongitude(dtLocal.toUtc());
  final mBranchIdx = _monthBranchIndexFromSunLon(lon);

  final monthNo = (mBranchIdx - 2 + 12) % 12;
  final mStemIdx = (_firstMonthStemIndex(yearStemIdx) + monthNo) % 10;

  final pillar = Pillar(
    stem: Stem.values[mStemIdx],
    branch: Branch.values[mBranchIdx],
  );

  return (pillar: pillar, sunLonDeg: lon);
}

/// Get effective day date considering day boundary and solar time
({int year, int month, int day}) effectiveDayDate(
  tz.TZDateTime dtLocal, {
  DayBoundary dayBoundary = DayBoundary.midnight,
  double? longitudeDeg,
  double tzOffsetHours = 9.0,
  bool useMeanSolarTimeForBoundary = false,
}) {
  var dtChk = dtLocal;
  if (useMeanSolarTimeForBoundary) {
    if (longitudeDeg == null) {
      throw ArgumentError(
        'longitudeDeg required when useMeanSolarTimeForBoundary=true',
      );
    }
    dtChk = applyMeanSolarTime(dtLocal, longitudeDeg, tzOffsetHours: tzOffsetHours);
  }

  var d = dtChk;
  if (dayBoundary == DayBoundary.zi23) {
    if (dtChk.hour >= 23) {
      d = dtChk.add(const Duration(days: 1));
    }
  }

  return (year: d.year, month: d.month, day: d.day);
}

/// Get hour branch index from hour (0-23)
int _hourBranchIndexFromHour(int h) {
  // Traditional Chinese hours (時辰) mapping:
  // Each branch represents a 2-hour period, starting from 子時 at 23:00
  return ((h + 1) ~/ 2) % 12;
}

/// Calculate hour pillar from datetime
({Pillar pillar, tz.TZDateTime adjustedDt, ({int year, int month, int day}) effectiveDate})
    hourPillar(
  tz.TZDateTime dtLocal, {
  double? longitudeDeg,
  double tzOffsetHours = 9.0,
  bool useMeanSolarTimeForHour = false,
  DayBoundary dayBoundary = DayBoundary.midnight,
  bool useMeanSolarTimeForBoundary = false,
}) {
  var dtUsed = dtLocal;
  if (useMeanSolarTimeForHour) {
    if (longitudeDeg == null) {
      throw ArgumentError('longitudeDeg required when useMeanSolarTimeForHour=true');
    }
    dtUsed = applyMeanSolarTime(dtLocal, longitudeDeg, tzOffsetHours: tzOffsetHours);
  }

  final effDate = effectiveDayDate(
    dtLocal,
    dayBoundary: dayBoundary,
    longitudeDeg: longitudeDeg,
    tzOffsetHours: tzOffsetHours,
    useMeanSolarTimeForBoundary: useMeanSolarTimeForBoundary,
  );

  final dayPillar = dayPillarFromDate(effDate.year, effDate.month, effDate.day);
  final dayStemIdx = dayPillar.stem.index;

  final hb = _hourBranchIndexFromHour(dtUsed.hour);
  final hs = (dayStemIdx * 2 + hb) % 10;

  final pillar = Pillar(
    stem: Stem.values[hs],
    branch: Branch.values[hb],
  );

  return (pillar: pillar, adjustedDt: dtUsed, effectiveDate: effDate);
}

/// Result of four pillars calculation
class FourPillarsResult {
  const FourPillarsResult({
    required this.pillars,
    required this.solarYear,
    required this.sunLonDeg,
    required this.effectiveDayDate,
    required this.adjustedDtForHour,
  });

  final FourPillars pillars;
  final int solarYear;
  final double sunLonDeg;
  final ({int year, int month, int day}) effectiveDayDate;
  final tz.TZDateTime adjustedDtForHour;
}

/// Calculate all four pillars
FourPillarsResult getFourPillars(
  tz.TZDateTime dtLocal, {
  double? longitudeDeg,
  double tzOffsetHours = 9.0,
  PillarPreset preset = standardPreset,
}) {
  final effectiveLongitude = longitudeDeg ?? tzOffsetHours * 15;

  final yearResult = yearPillar(dtLocal);
  final monthResult = monthPillar(dtLocal);

  final effDate = effectiveDayDate(
    dtLocal,
    dayBoundary: preset.dayBoundary,
    longitudeDeg: effectiveLongitude,
    tzOffsetHours: tzOffsetHours,
    useMeanSolarTimeForBoundary: preset.useMeanSolarTimeForBoundary,
  );
  final dayPillar = dayPillarFromDate(effDate.year, effDate.month, effDate.day);

  final hourResult = hourPillar(
    dtLocal,
    longitudeDeg: effectiveLongitude,
    tzOffsetHours: tzOffsetHours,
    useMeanSolarTimeForHour: preset.useMeanSolarTimeForHour,
    dayBoundary: preset.dayBoundary,
    useMeanSolarTimeForBoundary: preset.useMeanSolarTimeForBoundary,
  );

  return FourPillarsResult(
    pillars: FourPillars(
      year: yearResult.pillar,
      month: monthResult.pillar,
      day: dayPillar,
      hour: hourResult.pillar,
    ),
    solarYear: yearResult.solarYear,
    sunLonDeg: monthResult.sunLonDeg,
    effectiveDayDate: effDate,
    adjustedDtForHour: hourResult.adjustedDt,
  );
}
