import '../types/types.dart';

/// Luck pillar information
class LuckPillar {
  const LuckPillar({
    required this.index,
    required this.startAge,
    required this.endAge,
    required this.pillar,
  });

  final int index;
  final int startAge;
  final int endAge;
  final Pillar pillar;

  Stem get stem => pillar.stem;
  Branch get branch => pillar.branch;
}

/// Start age detail
class StartAgeDetail {
  const StartAgeDetail({
    required this.years,
    required this.months,
    required this.days,
  });

  final int years;
  final int months;
  final int days;
}

/// Major luck result
class MajorLuckResult {
  const MajorLuckResult({
    required this.gender,
    required this.yearStemPolarity,
    required this.isForward,
    required this.startAge,
    required this.startAgeDetail,
    required this.daysToTerm,
    required this.pillars,
  });

  final Gender gender;
  final Polarity yearStemPolarity;
  final bool isForward;
  final int startAge;
  final StartAgeDetail startAgeDetail;
  final double daysToTerm;
  final List<LuckPillar> pillars;
}

/// Calculate major luck (대운)
MajorLuckResult calculateMajorLuck({
  required int birthMillis,
  required Gender gender,
  required Pillar yearPillar,
  required Pillar monthPillar,
  int count = 8,
  int? nextJieMillis,
  int? prevJieMillis,
}) {
  final yearStemPolarity = yearPillar.stem.polarity;

  final isForward =
      (yearStemPolarity == Polarity.yang && gender == Gender.male) ||
      (yearStemPolarity == Polarity.yin && gender == Gender.female);

  const msPerDay = 1000 * 60 * 60 * 24;

  double daysToTerm;
  if (nextJieMillis != null && prevJieMillis != null) {
    if (isForward) {
      daysToTerm = (nextJieMillis - birthMillis).abs() / msPerDay;
    } else {
      daysToTerm = (birthMillis - prevJieMillis).abs() / msPerDay;
    }
  } else {
    daysToTerm = 30;
  }

  final totalMonths = ((daysToTerm / 3) * 12).round();
  final years = totalMonths ~/ 12;
  final months = totalMonths % 12;
  final days = (((daysToTerm / 3) * 12 - totalMonths) * 30).round().abs();

  // Traditional rounding: if >= 6 months, add 1 year
  final startAge = months >= 6 ? years + 1 : years;
  final startAgeDetail = StartAgeDetail(years: years, months: months, days: days);

  final monthIdx60 = monthPillar.index;
  final pillars = <LuckPillar>[];

  for (var i = 1; i <= count; i++) {
    final pillarIdx = isForward ? monthIdx60 + i : monthIdx60 - i;
    final pillar = Pillar.fromIndex(pillarIdx);

    pillars.add(
      LuckPillar(
        index: i,
        startAge: startAge + (i - 1) * 10,
        endAge: startAge + i * 10 - 1,
        pillar: pillar,
      ),
    );
  }

  return MajorLuckResult(
    gender: gender,
    yearStemPolarity: yearStemPolarity,
    isForward: isForward,
    startAge: startAge,
    startAgeDetail: startAgeDetail,
    daysToTerm: (daysToTerm * 10).round() / 10,
    pillars: pillars,
  );
}

/// Get current major luck pillar for an age
LuckPillar? getCurrentMajorLuck(MajorLuckResult majorLuck, int age) {
  for (final pillar in majorLuck.pillars) {
    if (age >= pillar.startAge && age <= pillar.endAge) {
      return pillar;
    }
  }
  return null;
}

/// Yearly luck result
class YearlyLuckResult {
  const YearlyLuckResult({
    required this.year,
    required this.pillar,
    required this.age,
  });

  final int year;
  final Pillar pillar;
  final int age;

  Stem get stem => pillar.stem;
  Branch get branch => pillar.branch;
}

/// Calculate yearly luck (세운)
List<YearlyLuckResult> calculateYearlyLuck(
  int birthYear,
  int fromYear,
  int toYear,
) {
  final results = <YearlyLuckResult>[];

  for (var year = fromYear; year <= toYear; year++) {
    final idx60 = (((year - 1984) % 60) + 60) % 60;
    final pillar = Pillar.fromIndex(idx60);
    final age = year - birthYear + 1;

    results.add(
      YearlyLuckResult(year: year, pillar: pillar, age: age),
    );
  }

  return results;
}

/// Get year pillar for a specific year
Pillar getYearPillar(int year) {
  final idx60 = (((year - 1984) % 60) + 60) % 60;
  return Pillar.fromIndex(idx60);
}

/// Monthly luck result
class MonthlyLuckResult {
  const MonthlyLuckResult({
    required this.year,
    required this.month,
    required this.pillar,
  });

  final int year;
  final int month;
  final Pillar pillar;

  Stem get stem => pillar.stem;
  Branch get branch => pillar.branch;
}

/// Calculate monthly luck (월운)
List<MonthlyLuckResult> calculateMonthlyLuck(
  int year,
  int fromMonth,
  int toMonth,
) {
  final results = <MonthlyLuckResult>[];

  final yearIdx60 = (((year - 1984) % 60) + 60) % 60;
  final yearStemIdx = yearIdx60 % 10;
  final baseMonthStemIdx = (yearStemIdx * 2 + 2) % 10;

  for (var month = fromMonth; month <= toMonth; month++) {
    final monthOffset = month - 1;
    final stemIdx = (baseMonthStemIdx + monthOffset) % 10;
    final branchIdx = (monthOffset + 2) % 12;

    final pillar = Pillar(
      stem: Stem.values[stemIdx],
      branch: Branch.values[branchIdx],
    );

    results.add(
      MonthlyLuckResult(year: year, month: month, pillar: pillar),
    );
  }

  return results;
}

/// Daily luck result
class DailyLuckResult {
  const DailyLuckResult({
    required this.year,
    required this.month,
    required this.day,
    required this.pillar,
  });

  final int year;
  final int month;
  final int day;
  final Pillar pillar;

  Stem get stem => pillar.stem;
  Branch get branch => pillar.branch;
}

/// Calculate daily luck (일운)
List<DailyLuckResult> calculateDailyLuck(
  int year,
  int month,
  int fromDay,
  int toDay,
) {
  final results = <DailyLuckResult>[];

  for (var day = fromDay; day <= toDay; day++) {
    // Use the dayPillarFromDate logic inline
    var y = year;
    var m = month;

    if (m <= 2) {
      y -= 1;
      m += 12;
    }

    final a = y ~/ 100;
    final b = 2 - a + (a ~/ 4);
    final jdn = (365.25 * (y + 4716)).floor() +
        (30.6001 * (m + 1)).floor() +
        day +
        b -
        1525;

    final idx60 = (((jdn - 11) % 60) + 60) % 60;
    final pillar = Pillar.fromIndex(idx60);

    results.add(
      DailyLuckResult(year: year, month: month, day: day, pillar: pillar),
    );
  }

  return results;
}
