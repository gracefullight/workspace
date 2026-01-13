import 'package:saju/saju.dart';
import 'package:test/test.dart';
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

void main() {
  setUpAll(() {
    tzdata.initializeTimeZones();
  });

  group('getSaju', () {
    test('returns complete analysis for valid input', () {
      final location = tz.getLocation('Asia/Seoul');
      final dt = tz.TZDateTime(location, 2000, 1, 1, 18, 0);

      final result = getSaju(dt, gender: Gender.male);

      // Check pillars (from TypeScript reference)
      expect(result.pillars.year.hanja, equals('己卯'));
      expect(result.pillars.month.hanja, equals('丙子'));
      expect(result.pillars.day.hanja, equals('戊午'));
      expect(result.pillars.hour.hanja, equals('辛酉'));

      // Check day master (戊 from 戊午)
      expect(result.pillars.dayMaster, equals(Stem.wu));

      // Check ten gods analysis exists
      expect(result.tenGods.dayMaster, equals(Stem.wu));

      // Check strength analysis exists
      expect(result.strength.score, isA<double>());
      expect(result.strength.level, isA<StrengthLevel>());

      // Check relations analysis exists
      expect(result.relations, isA<RelationsResult>());

      // Check yongshen analysis exists
      expect(result.yongShen.primary, isA<Element>());
      expect(result.yongShen.method, isA<YongShenMethod>());

      // Check solar terms exists
      expect(result.solarTerms.current, isA<SolarTerm>());

      // Check major luck exists
      expect(result.majorLuck.pillars, isNotEmpty);
      expect(result.majorLuck.gender, equals(Gender.male));

      // Check yearly luck exists
      expect(result.yearlyLuck, isNotEmpty);

      // Check twelve stages exists
      expect(result.twelveStages, isA<TwelveStagesResult>());

      // Check lunar date exists
      expect(result.lunar.year, isA<int>());

      // Check meta exists
      expect(result.meta.solarYearUsed, equals(1999));
    });

    test('handles female gender correctly', () {
      final location = tz.getLocation('Asia/Seoul');
      final dt = tz.TZDateTime(location, 2000, 1, 1, 18, 0);

      final result = getSaju(dt, gender: Gender.female);

      expect(result.majorLuck.gender, equals(Gender.female));
      // Female with yin year stem should go backward
      // 己 is yin, so female goes forward
      expect(result.majorLuck.isForward, isTrue);
    });

    test('handles custom yearly luck range', () {
      final location = tz.getLocation('Asia/Seoul');
      final dt = tz.TZDateTime(location, 2000, 1, 1, 18, 0);

      final result = getSaju(
        dt,
        gender: Gender.male,
        yearlyLuckRange: (from: 2024, to: 2030),
      );

      expect(result.yearlyLuck.first.year, equals(2024));
      expect(result.yearlyLuck.last.year, equals(2030));
    });
  });

  group('Strength Analysis', () {
    test('calculates strength correctly', () {
      final pillars = FourPillars(
        year: Pillar.fromHanja('己卯'),
        month: Pillar.fromHanja('丙子'),
        day: Pillar.fromHanja('戊午'),
        hour: Pillar.fromHanja('辛酉'),
      );

      final result = analyzeStrength(pillars);

      expect(result.score, isA<double>());
      expect(result.level, isA<StrengthLevel>());
      expect(result.factors.deukryeong, greaterThanOrEqualTo(0));
      expect(result.factors.deukryeong, lessThanOrEqualTo(1));
    });
  });

  group('Relations Analysis', () {
    test('finds branch clashes', () {
      // 子午冲
      final pillars = FourPillars(
        year: Pillar.fromHanja('甲子'),
        month: Pillar.fromHanja('丙午'),
        day: Pillar.fromHanja('戊寅'),
        hour: Pillar.fromHanja('庚申'),
      );

      final result = analyzeRelations(pillars);

      expect(result.clashes, isNotEmpty);
      final ziWuClash = result.clashes.firstWhere(
        (c) => c.pair.contains(Branch.zi) && c.pair.contains(Branch.wu),
      );
      expect(ziWuClash, isNotNull);
    });

    test('finds stem combinations', () {
      // 甲己合
      final pillars = FourPillars(
        year: Pillar.fromHanja('甲子'),
        month: Pillar.fromHanja('己丑'),
        day: Pillar.fromHanja('丙寅'),
        hour: Pillar.fromHanja('庚辰'),
      );

      final result = analyzeRelations(pillars);

      expect(result.stemCombinations, isNotEmpty);
      final jiaJiCombo = result.stemCombinations.firstWhere(
        (c) => c.pair.contains(Stem.jia) && c.pair.contains(Stem.ji),
      );
      expect(jiaJiCombo.resultElement, equals(Element.earth));
    });
  });

  group('Twelve Stages', () {
    test('calculates twelve stages correctly', () {
      final pillars = FourPillars(
        year: Pillar.fromHanja('己卯'),
        month: Pillar.fromHanja('丙子'),
        day: Pillar.fromHanja('戊午'),
        hour: Pillar.fromHanja('辛酉'),
      );

      final result = analyzeTwelveStages(pillars);

      expect(result.year, isA<TwelveStage>());
      expect(result.month, isA<TwelveStage>());
      expect(result.day, isA<TwelveStage>());
      expect(result.hour, isA<TwelveStage>());
    });
  });

  group('Luck Calculation', () {
    test('calculates yearly luck correctly', () {
      final result = calculateYearlyLuck(1999, 2024, 2026);

      expect(result.length, equals(3));
      expect(result[0].year, equals(2024));
      expect(result[0].age, equals(26)); // 2024 - 1999 + 1
    });

    test('calculates monthly luck correctly', () {
      final result = calculateMonthlyLuck(2024, 1, 3);

      expect(result.length, equals(3));
      expect(result[0].month, equals(1));
      expect(result[2].month, equals(3));
    });
  });
}
