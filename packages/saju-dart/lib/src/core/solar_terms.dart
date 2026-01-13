import 'package:timezone/timezone.dart' as tz;

import '../types/types.dart';
import '../utils/solar_longitude.dart';

/// Solar term date info
class SolarTermDateInfo {
  const SolarTermDateInfo({
    required this.year,
    required this.month,
    required this.day,
    required this.hour,
    required this.minute,
  });

  final int year;
  final int month;
  final int day;
  final int hour;
  final int minute;
}

/// Solar term analysis result
class SolarTermInfo {
  const SolarTermInfo({
    required this.current,
    required this.currentDate,
    required this.currentMillis,
    required this.daysSinceCurrent,
    required this.next,
    required this.nextDate,
    required this.nextMillis,
    required this.daysUntilNext,
    required this.prevJie,
    required this.prevJieDate,
    required this.prevJieMillis,
    required this.nextJie,
    required this.nextJieDate,
    required this.nextJieMillis,
  });

  final SolarTerm current;
  final SolarTermDateInfo currentDate;
  final int currentMillis;
  final int daysSinceCurrent;

  final SolarTerm next;
  final SolarTermDateInfo nextDate;
  final int nextMillis;
  final int daysUntilNext;

  final SolarTerm prevJie;
  final SolarTermDateInfo prevJieDate;
  final int prevJieMillis;

  final SolarTerm nextJie;
  final SolarTermDateInfo nextJieDate;
  final int nextJieMillis;
}

/// Get solar term index from longitude
int _getSolarTermIndexFromLongitude(double longitude) {
  // Each term is 15 degrees apart
  // 소한 (285°) is index 0
  final normalized = (longitude - 285 + 360) % 360;
  return (normalized / 15).floor();
}

/// Get approximate month for a solar term
int _getApproximateMonth(int termIndex) {
  const months = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12];
  return months[termIndex];
}

/// Find solar term date
DateTime _findSolarTermDate(SolarTerm term, int year, int month) {
  final startUtc = DateTime.utc(year, month, 1);
  final endUtc = DateTime.utc(year, month, 28);
  return findTermUtc(term.longitude.toDouble(), startUtc, endUtc);
}

/// Convert DateTime to SolarTermDateInfo
SolarTermDateInfo _toDateInfo(tz.TZDateTime dt) {
  return SolarTermDateInfo(
    year: dt.year,
    month: dt.month,
    day: dt.day,
    hour: dt.hour,
    minute: dt.minute,
  );
}

/// Find previous Jie (節)
({SolarTerm term, tz.TZDateTime termLocal}) _findPrevJie(
  tz.TZDateTime dtLocal,
  int currentIndex,
) {
  final year = dtLocal.year;
  final dtMillis = dtLocal.millisecondsSinceEpoch;

  var jieIndex = currentIndex.isEven ? currentIndex : currentIndex - 1;
  if (jieIndex < 0) jieIndex = 22;

  for (var attempts = 0; attempts < 3; attempts++) {
    final term = SolarTerm.values[jieIndex];
    final month = _getApproximateMonth(jieIndex);

    for (var yearOffset = 0; yearOffset <= 1; yearOffset++) {
      final tryYear = year - yearOffset;
      final termUtc = _findSolarTermDate(term, tryYear, month);
      final termLocal = tz.TZDateTime.from(termUtc, dtLocal.location);

      if (termLocal.millisecondsSinceEpoch <= dtMillis) {
        return (term: term, termLocal: termLocal);
      }
    }

    jieIndex = jieIndex - 2;
    if (jieIndex < 0) jieIndex += 24;
  }

  final fallbackTerm = SolarTerm.values[jieIndex];
  final fallbackMonth = _getApproximateMonth(jieIndex);
  final fallbackUtc = _findSolarTermDate(fallbackTerm, year - 1, fallbackMonth);
  return (
    term: fallbackTerm,
    termLocal: tz.TZDateTime.from(fallbackUtc, dtLocal.location),
  );
}

/// Find next Jie (節)
({SolarTerm term, tz.TZDateTime termLocal}) _findNextJie(
  tz.TZDateTime dtLocal,
  int currentIndex,
) {
  final year = dtLocal.year;
  final dtMillis = dtLocal.millisecondsSinceEpoch;

  var jieIndex = currentIndex.isEven ? (currentIndex + 2) % 24 : (currentIndex + 1) % 24;

  for (var attempts = 0; attempts < 3; attempts++) {
    final term = SolarTerm.values[jieIndex];
    final month = _getApproximateMonth(jieIndex);

    for (var yearOffset = 0; yearOffset <= 1; yearOffset++) {
      final tryYear = year + yearOffset;
      final termUtc = _findSolarTermDate(term, tryYear, month);
      final termLocal = tz.TZDateTime.from(termUtc, dtLocal.location);

      if (termLocal.millisecondsSinceEpoch > dtMillis) {
        return (term: term, termLocal: termLocal);
      }
    }

    jieIndex = (jieIndex + 2) % 24;
  }

  final fallbackTerm = SolarTerm.values[jieIndex];
  final fallbackMonth = _getApproximateMonth(jieIndex);
  final fallbackUtc = _findSolarTermDate(fallbackTerm, year + 1, fallbackMonth);
  return (
    term: fallbackTerm,
    termLocal: tz.TZDateTime.from(fallbackUtc, dtLocal.location),
  );
}

/// Analyze solar terms for a given datetime
SolarTermInfo analyzeSolarTerms(tz.TZDateTime dtLocal) {
  final dtUtc = dtLocal.toUtc();
  final currentLongitude = sunApparentLongitude(dtUtc);

  final currentIndex = _getSolarTermIndexFromLongitude(currentLongitude);
  final currentTerm = SolarTerm.values[currentIndex];
  final nextIndex = (currentIndex + 1) % 24;
  final nextTerm = SolarTerm.values[nextIndex];

  final year = dtLocal.year;
  final currentMonth = _getApproximateMonth(currentIndex);
  final nextMonth = _getApproximateMonth(nextIndex);

  var currentYear = year;
  if (currentMonth == 12 && dtLocal.month <= 2) {
    currentYear = year - 1;
  } else if (currentMonth == 1 && dtLocal.month >= 11) {
    currentYear = year + 1;
  }

  var currentTermUtc = _findSolarTermDate(currentTerm, currentYear, currentMonth);
  var currentTermLocal = tz.TZDateTime.from(currentTermUtc, dtLocal.location);

  if (currentTermLocal.millisecondsSinceEpoch > dtLocal.millisecondsSinceEpoch) {
    if (currentMonth <= 2) {
      currentYear -= 1;
    }
    currentTermUtc = _findSolarTermDate(currentTerm, currentYear, currentMonth);
    currentTermLocal = tz.TZDateTime.from(currentTermUtc, dtLocal.location);
  }

  var nextYear = year;
  if (nextMonth == 1 && dtLocal.month >= 11) {
    nextYear = year + 1;
  }

  var nextTermUtc = _findSolarTermDate(nextTerm, nextYear, nextMonth);
  var nextTermLocal = tz.TZDateTime.from(nextTermUtc, dtLocal.location);

  if (nextTermLocal.millisecondsSinceEpoch <= dtLocal.millisecondsSinceEpoch) {
    if (nextMonth >= 11) {
      nextYear += 1;
    }
    nextTermUtc = _findSolarTermDate(nextTerm, nextYear, nextMonth);
    nextTermLocal = tz.TZDateTime.from(nextTermUtc, dtLocal.location);
  }

  final prevJieResult = _findPrevJie(dtLocal, currentIndex);
  final nextJieResult = _findNextJie(dtLocal, currentIndex);

  const msPerDay = 24 * 60 * 60 * 1000;
  final currentMillis = currentTermLocal.millisecondsSinceEpoch;
  final nextMillis = nextTermLocal.millisecondsSinceEpoch;
  final dtMillis = dtLocal.millisecondsSinceEpoch;

  final daysSinceCurrent = ((dtMillis - currentMillis) / msPerDay).floor();
  final daysUntilNext = ((nextMillis - dtMillis) / msPerDay).ceil();

  return SolarTermInfo(
    current: currentTerm,
    currentDate: _toDateInfo(currentTermLocal),
    currentMillis: currentMillis,
    daysSinceCurrent: daysSinceCurrent,
    next: nextTerm,
    nextDate: _toDateInfo(nextTermLocal),
    nextMillis: nextMillis,
    daysUntilNext: daysUntilNext,
    prevJie: prevJieResult.term,
    prevJieDate: _toDateInfo(prevJieResult.termLocal),
    prevJieMillis: prevJieResult.termLocal.millisecondsSinceEpoch,
    nextJie: nextJieResult.term,
    nextJieDate: _toDateInfo(nextJieResult.termLocal),
    nextJieMillis: nextJieResult.termLocal.millisecondsSinceEpoch,
  );
}

/// Get all solar term dates for a year
List<({SolarTerm term, SolarTermDateInfo date})> getSolarTermsForYear(
  int year,
  tz.Location location,
) {
  final results = <({SolarTerm term, SolarTermDateInfo date})>[];

  for (var i = 0; i < SolarTerm.values.length; i++) {
    final term = SolarTerm.values[i];
    final month = _getApproximateMonth(i);

    final termYear = (month == 1 && i < 2) ? year : (month == 12 ? year : year);

    final termUtc = _findSolarTermDate(term, termYear, month);
    final termLocal = tz.TZDateTime.from(termUtc, location);

    results.add((term: term, date: _toDateInfo(termLocal)));
  }

  return results;
}
