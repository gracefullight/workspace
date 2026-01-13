/// Saju (Four Pillars of Destiny, 四柱命理) calculation library.
///
/// This library provides comprehensive tools for calculating and analyzing
/// Four Pillars of Destiny based on traditional Chinese/Korean astrology.
///
/// ## Features
///
/// - Four Pillars calculation from birth date/time
/// - Ten Gods (십신) analysis
/// - Day Master strength assessment
/// - Relations analysis (combinations, clashes, harms, punishments)
/// - Twelve Life Stages (십이운성) analysis
/// - Yongshen (용신) extraction
/// - Solar Terms (절기) calculation
/// - Major Luck (대운) and Yearly Luck (세운) calculation
///
/// ## Quick Start
///
/// ```dart
/// import 'package:saju/saju.dart';
/// import 'package:timezone/data/latest.dart' as tz;
/// import 'package:timezone/timezone.dart' as tz;
///
/// void main() {
///   tz.initializeTimeZones();
///
///   final location = tz.getLocation('Asia/Seoul');
///   final birthDateTime = tz.TZDateTime(location, 2000, 1, 1, 18, 0);
///
///   final result = getSaju(
///     birthDateTime,
///     gender: Gender.male,
///   );
///
///   print(result.pillars.toMap());
///   print(result.strength.level.korean);
///   print(result.yongShen.primary.korean);
/// }
/// ```
library;

export 'src/saju.dart';
