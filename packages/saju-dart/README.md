# saju

[![pub version](https://img.shields.io/pub/v/saju.svg)](https://pub.dev/packages/saju)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Dart/Flutter library for calculating Four Pillars of Destiny (Saju, 四柱命理) with comprehensive analysis features.

## Features

- **Four Pillars Calculation** - Accurate calculation using astronomical algorithms
- **Ten Gods Analysis** - Complete 십신 analysis with hidden stems
- **Strength Assessment** - 9-level strength analysis (신강신약)
- **Relations Analysis** - Combinations, clashes, harms, punishments (합충형파해)
- **Twelve Life Stages** - 십이운성 analysis
- **Yongshen Extraction** - 용신 recommendation with 격국→억부→조후 priority
- **Solar Terms** - 24 절기 calculation with precise timing
- **Major/Yearly Luck** - 대운, 세운, 월운, 일운 calculation
- **Lunar Calendar** - Solar to lunar date conversion

## Installation

```yaml
dependencies:
  saju: ^0.1.0
```

## Quick Start

```dart
import 'package:saju/saju.dart';
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

void main() {
  // Initialize timezone data
  tzdata.initializeTimeZones();

  // Create birth datetime with timezone
  final location = tz.getLocation('Asia/Seoul');
  final birthDateTime = tz.TZDateTime(location, 2000, 1, 1, 18, 0);

  // Calculate complete Saju analysis
  final result = getSaju(
    birthDateTime,
    gender: Gender.male,
  );

  // Access results
  print('Four Pillars: ${result.pillars.toMap()}');
  print('Day Master: ${result.pillars.dayMaster.hanja}');
  print('Strength: ${result.strength.level.korean}');
  print('Yongshen: ${result.yongShen.primary.korean}');
}
```

## Usage

### Calculate Four Pillars Only

```dart
final location = tz.getLocation('Asia/Seoul');
final dt = tz.TZDateTime(location, 2000, 1, 1, 18, 0);

final result = getFourPillars(dt);

print(result.pillars.year.hanja);  // 己卯
print(result.pillars.month.hanja); // 丙子
print(result.pillars.day.hanja);   // 辛巳
print(result.pillars.hour.hanja);  // 戊戌
```

### Ten Gods Analysis

```dart
final pillars = FourPillars(
  year: Pillar.fromHanja('己卯'),
  month: Pillar.fromHanja('丙子'),
  day: Pillar.fromHanja('辛巳'),
  hour: Pillar.fromHanja('戊戌'),
);

final tenGods = analyzeTenGods(pillars);
print('Day Master: ${tenGods.dayMaster.hanja}');
print('Year Stem Ten God: ${tenGods.year.stem.tenGod.korean}');
```

### Strength Assessment

```dart
final strength = analyzeStrength(pillars);
print('Level: ${strength.level.korean}');  // e.g., 신약, 신강
print('Score: ${strength.score}');
print('Factors: ${strength.factors.deukryeong}');
```

### Relations Analysis

```dart
final relations = analyzeRelations(pillars);

// Combinations
for (final combo in relations.sixCombinations) {
  print('${combo.pair[0].hanja}-${combo.pair[1].hanja} -> ${combo.resultElement.korean}');
}

// Clashes
for (final clash in relations.clashes) {
  print('Clash: ${clash.pair[0].hanja}-${clash.pair[1].hanja}');
}
```

### Yongshen Extraction

```dart
final yongShen = analyzeYongShen(pillars);
print('Primary Yongshen: ${yongShen.primary.korean}');
print('Method: ${yongShen.method.korean}');
print('Reasoning: ${yongShen.reasoning}');

// Get recommendations
final recommendations = getElementRecommendations(yongShen);
print('Lucky colors: ${recommendations.colors}');
print('Lucky directions: ${recommendations.directions}');
print('Lucky numbers: ${recommendations.numbers}');
```

### Luck Calculation

```dart
// Major Luck
print('Major Luck Start Age: ${result.majorLuck.startAge}');
for (final pillar in result.majorLuck.pillars) {
  print('Age ${pillar.startAge}-${pillar.endAge}: ${pillar.pillar.hanja}');
}

// Yearly Luck
final yearlyLuck = calculateYearlyLuck(1999, 2024, 2030);
for (final luck in yearlyLuck) {
  print('${luck.year} (Age ${luck.age}): ${luck.pillar.hanja}');
}
```

### Configuration Presets

```dart
// Standard Preset (default): Midnight day boundary
final standard = getFourPillars(dt, preset: standardPreset);

// Traditional Preset: Zi hour (23:00) day boundary with solar time
final traditional = getFourPillars(dt, preset: traditionalPreset);
```

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `getSaju()` | Complete Saju analysis |
| `getFourPillars()` | Calculate four pillars |
| `yearPillar()` | Year pillar only |
| `monthPillar()` | Month pillar only |
| `dayPillarFromDate()` | Day pillar only |
| `hourPillar()` | Hour pillar only |
| `analyzeTenGods()` | Ten gods analysis |
| `analyzeStrength()` | Strength assessment |
| `analyzeRelations()` | Relations analysis |
| `analyzeTwelveStages()` | Twelve stages analysis |
| `analyzeYongShen()` | Yongshen extraction |
| `analyzeSolarTerms()` | Solar terms info |
| `calculateMajorLuck()` | Major luck calculation |
| `calculateYearlyLuck()` | Yearly luck calculation |
| `calculateMonthlyLuck()` | Monthly luck calculation |
| `calculateDailyLuck()` | Daily luck calculation |
| `getLunarDate()` | Lunar date conversion |

### Enums

- `Stem` - 10 Heavenly Stems (천간)
- `Branch` - 12 Earthly Branches (지지)
- `Element` - 5 Elements (오행)
- `Polarity` - Yin/Yang (음양)
- `Gender` - Male/Female
- `TenGod` - 10 Gods (십신)
- `StrengthLevel` - 9 strength levels
- `TwelveStage` - 12 life stages (십이운성)
- `SolarTerm` - 24 solar terms (절기)

## Dependencies

- [timezone](https://pub.dev/packages/timezone) - IANA timezone database
- [jiffy](https://pub.dev/packages/jiffy) - Date manipulation
- [lunar](https://pub.dev/packages/lunar) - Lunar calendar conversion

## Related

- TypeScript version: [@gracefullight/saju](https://www.npmjs.com/package/@gracefullight/saju)

## License

MIT © [gracefullight](https://github.com/gracefullight)
