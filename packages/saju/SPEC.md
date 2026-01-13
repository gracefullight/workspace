# @gracefullight/saju - Library Specification

> **Version:** 1.0.1  
> **Purpose:** This document defines the canonical specification for the Saju (Four Pillars of Destiny, 四柱命理) library. It serves as the source of truth for both TypeScript and Dart implementations.

---

## 1. Overview

A cross-platform library for calculating and analyzing Four Pillars of Destiny (사주팔자, 四柱八字) based on traditional Chinese/Korean astrology. The library provides:

- Four Pillars calculation from birth date/time
- Ten Gods (십신) analysis
- Day Master strength assessment
- Relations analysis (combinations, clashes, harms, punishments)
- Twelve Life Stages (십이운성) analysis
- Yongshen (용신) extraction
- Solar Terms (절기) calculation
- Major Luck (대운) and Yearly Luck (세운) calculation
- Sinsals (신살) analysis
- Lunar calendar conversion

---

## 2. Core Concepts

### 2.1 Heavenly Stems (天干, 천간)

10 stems representing Yin/Yang manifestations of the Five Elements:

| Index | Stem | Element | Polarity | Korean | English |
|-------|------|---------|----------|--------|---------|
| 0 | 甲 | Wood | Yang | 갑 | jia |
| 1 | 乙 | Wood | Yin | 을 | yi |
| 2 | 丙 | Fire | Yang | 병 | bing |
| 3 | 丁 | Fire | Yin | 정 | ding |
| 4 | 戊 | Earth | Yang | 무 | wu |
| 5 | 己 | Earth | Yin | 기 | ji |
| 6 | 庚 | Metal | Yang | 경 | geng |
| 7 | 辛 | Metal | Yin | 신 | xin |
| 8 | 壬 | Water | Yang | 임 | ren |
| 9 | 癸 | Water | Yin | 계 | gui |

### 2.2 Earthly Branches (地支, 지지)

12 branches representing the zodiac and time divisions:

| Index | Branch | Element | Polarity | Korean | Zodiac |
|-------|--------|---------|----------|--------|--------|
| 0 | 子 | Water | Yang | 자 | Rat |
| 1 | 丑 | Earth | Yin | 축 | Ox |
| 2 | 寅 | Wood | Yang | 인 | Tiger |
| 3 | 卯 | Wood | Yin | 묘 | Rabbit |
| 4 | 辰 | Earth | Yang | 진 | Dragon |
| 5 | 巳 | Fire | Yin | 사 | Snake |
| 6 | 午 | Fire | Yang | 오 | Horse |
| 7 | 未 | Earth | Yin | 미 | Goat |
| 8 | 申 | Metal | Yang | 신 | Monkey |
| 9 | 酉 | Metal | Yin | 유 | Rooster |
| 10 | 戌 | Earth | Yang | 술 | Dog |
| 11 | 亥 | Water | Yin | 해 | Pig |

### 2.3 Five Elements (五行, 오행)

| Key | Korean | Hanja | Generates | Controls |
|-----|--------|-------|-----------|----------|
| wood | 목 | 木 | fire | earth |
| fire | 화 | 火 | earth | metal |
| earth | 토 | 土 | metal | water |
| metal | 금 | 金 | water | wood |
| water | 수 | 水 | wood | fire |

### 2.4 Hidden Stems (藏干, 지장간)

Each branch contains hidden stems with weights:

| Branch | Primary (본기) | Secondary (중기) | Tertiary (여기) |
|--------|---------------|-----------------|-----------------|
| 子 | 癸 (1.0) | - | - |
| 丑 | 己 (0.6) | 癸 (0.25) | 辛 (0.15) |
| 寅 | 甲 (0.6) | 丙 (0.25) | 戊 (0.15) |
| 卯 | 乙 (1.0) | - | - |
| 辰 | 戊 (0.6) | 乙 (0.25) | 癸 (0.15) |
| 巳 | 丙 (0.6) | 庚 (0.25) | 戊 (0.15) |
| 午 | 丁 (0.7) | 己 (0.3) | - |
| 未 | 己 (0.6) | 丁 (0.25) | 乙 (0.15) |
| 申 | 庚 (0.6) | 壬 (0.25) | 戊 (0.15) |
| 酉 | 辛 (1.0) | - | - |
| 戌 | 戊 (0.6) | 辛 (0.25) | 丁 (0.15) |
| 亥 | 壬 (0.7) | 甲 (0.3) | - |

---

## 3. Data Types

### 3.1 Primitive Types

```typescript
type Stem = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";
type Branch = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";
type Gender = "male" | "female";
type PillarPosition = "year" | "month" | "day" | "hour";
```

### 3.2 Label Interface

All domain objects support trilingual labels:

```typescript
interface Label<T extends string = string> {
  key: T;
  korean: string;
  hanja: string;
}
```

### 3.3 Pillar Interface

```typescript
interface Pillar {
  stem: Stem;
  branch: Branch;
  pillar: string; // stem + branch (e.g., "甲子")
}
```

---

## 4. Date Adapter Pattern

The library uses an adapter pattern for date/time operations to support multiple date libraries.

### 4.1 DateAdapter Interface

```typescript
interface DateAdapter<T = unknown> {
  // Component getters
  getYear(date: T): number;
  getMonth(date: T): number;      // 1-12
  getDay(date: T): number;
  getHour(date: T): number;       // 0-23
  getMinute(date: T): number;     // 0-59
  getSecond(date: T): number;     // 0-59
  getZoneName(date: T): string;

  // Arithmetic
  plusMinutes(date: T, minutes: number): T;
  plusDays(date: T, days: number): T;
  minusDays(date: T, days: number): T;

  // Timezone operations
  toUTC(date: T): T;
  setZone(date: T, zoneName: string): T;

  // Conversions
  toISO(date: T): string;
  toMillis(date: T): number;
  fromMillis(millis: number, zone: string): T;
  createUTC(year: number, month: number, day: number, hour: number, minute: number, second: number): T;

  // Comparison
  isGreaterThanOrEqual(date1: T, date2: T): boolean;
}
```

### 4.2 Supported Adapters (TypeScript)

- **Luxon** (recommended)
- **date-fns** with date-fns-tz
- Custom implementations

### 4.3 Dart Implementation (No Adapter Pattern)

Dart version uses **Jiffy + timezone** directly as required dependencies (no adapter pattern):

```yaml
# pubspec.yaml
dependencies:
  jiffy: ^6.4.0
  timezone: ^0.10.0
```

**Rationale:** Unlike TypeScript ecosystem with multiple date library choices (Luxon, date-fns, Day.js), Dart lacks comparable alternatives. Using Jiffy + timezone directly simplifies the API.

**Key Differences from TypeScript:**

| Aspect | TypeScript | Dart |
|--------|------------|------|
| Date handling | `DateAdapter<T>` interface | Direct `Jiffy` / `TZDateTime` usage |
| Dependencies | Peer deps (optional) | Required deps |
| Timezone | Via adapter | `timezone` package |
| User provides | Date object + adapter | Date object only |

**Dart DateTime Wrapper:**

```dart
import 'package:jiffy/jiffy.dart';
import 'package:timezone/timezone.dart' as tz;

class SajuDateTime {
  final TZDateTime dateTime;
  
  SajuDateTime(this.dateTime);
  
  factory SajuDateTime.from({
    required int year,
    required int month,
    required int day,
    required int hour,
    int minute = 0,
    int second = 0,
    required String timezone,  // e.g., 'Asia/Seoul'
  }) {
    final location = tz.getLocation(timezone);
    return SajuDateTime(tz.TZDateTime(location, year, month, day, hour, minute, second));
  }
  
  int get year => dateTime.year;
  int get month => dateTime.month;
  int get day => dateTime.day;
  int get hour => dateTime.hour;
  int get minute => dateTime.minute;
  int get second => dateTime.second;
  String get timeZoneName => dateTime.location.name;
  
  SajuDateTime addMinutes(int minutes) => 
      SajuDateTime(dateTime.add(Duration(minutes: minutes)));
  
  SajuDateTime addDays(int days) => 
      SajuDateTime(dateTime.add(Duration(days: days)));
  
  SajuDateTime subtractDays(int days) => 
      SajuDateTime(dateTime.subtract(Duration(days: days)));
  
  SajuDateTime toUTC() => 
      SajuDateTime(tz.TZDateTime.utc(
        dateTime.year, dateTime.month, dateTime.day,
        dateTime.hour, dateTime.minute, dateTime.second
      ));
  
  int toMillis() => dateTime.millisecondsSinceEpoch;
  
  static SajuDateTime fromMillis(int millis, String timezone) {
    final location = tz.getLocation(timezone);
    return SajuDateTime(tz.TZDateTime.fromMillisecondsSinceEpoch(location, millis));
  }
  
  static SajuDateTime createUTC(int year, int month, int day, int hour, int minute, int second) =>
      SajuDateTime(tz.TZDateTime.utc(year, month, day, hour, minute, second));
  
  bool operator >=(SajuDateTime other) => 
      dateTime.isAfter(other.dateTime) || dateTime.isAtSameMomentAs(other.dateTime);
}
```

**Usage Example (Dart):**

```dart
import 'package:saju/saju.dart';
import 'package:timezone/data/latest.dart' as tz;

void main() {
  tz.initializeTimeZones();
  
  final birthDateTime = SajuDateTime.from(
    year: 2000,
    month: 1,
    day: 1,
    hour: 18,
    minute: 0,
    timezone: 'Asia/Seoul',
  );
  
  final result = getSaju(
    birthDateTime,
    gender: Gender.male,
    // longitudeDeg: 126.9778,  // Optional
  );
  
  print(result.pillars);  // {year: 己卯, month: 丙子, ...}
}
```

---

## 5. Configuration Presets

### 5.1 STANDARD_PRESET

Contemporary interpretation:

```typescript
const STANDARD_PRESET = {
  dayBoundary: "midnight",           // Day changes at 00:00
  useMeanSolarTimeForHour: true,     // Apply solar time for hour calculation
  useMeanSolarTimeForBoundary: false // Use local time for day boundary
};
```

### 5.2 TRADITIONAL_PRESET

Traditional interpretation:

```typescript
const TRADITIONAL_PRESET = {
  dayBoundary: "zi23",               // Day changes at 23:00 (子時)
  useMeanSolarTimeForHour: true,     // Apply solar time for hour
  useMeanSolarTimeForBoundary: true  // Apply solar time for day boundary
};
```

---

## 6. Core Algorithms

### 6.1 Julian Day Number (JDN)

Used for day pillar calculation:

```
if (month <= 2) { year--; month += 12; }
A = floor(year / 100)
B = 2 - A + floor(A / 4)
JDN = floor(365.25 * (year + 4716)) + floor(30.6001 * (month + 1)) + day + B - 1524.5
```

### 6.2 Day Pillar Index

```
idx60 = ((JDN - 11) mod 60 + 60) mod 60
```

### 6.3 Year Pillar

- Year changes at **Lichun (立春, Start of Spring)** - solar longitude 315°
- Index: `((solarYear - 1984) mod 60 + 60) mod 60`

### 6.4 Month Pillar

Based on solar longitude:

```
branchIndex = (floor(((longitude + 45) mod 360) / 30) + 2) mod 12
monthNo = (branchIndex - 2 + 12) mod 12
```

First month stem index by year stem:
| Year Stem Index | First Month Stem Index |
|-----------------|------------------------|
| 0, 5 (甲, 己) | 2 (丙) |
| 1, 6 (乙, 庚) | 4 (戊) |
| 2, 7 (丙, 辛) | 6 (庚) |
| 3, 8 (丁, 壬) | 8 (壬) |
| 4, 9 (戊, 癸) | 0 (甲) |

### 6.5 Hour Pillar

Traditional Chinese double-hour system (時辰):

```
branchIndex = floor((hour + 1) / 2) mod 12
stemIndex = (dayStemIndex * 2 + branchIndex) mod 10
```

Hour to Branch mapping:
| Hours | Branch |
|-------|--------|
| 23:00-00:59 | 子 |
| 01:00-02:59 | 丑 |
| 03:00-04:59 | 寅 |
| 05:00-06:59 | 卯 |
| 07:00-08:59 | 辰 |
| 09:00-10:59 | 巳 |
| 11:00-12:59 | 午 |
| 13:00-14:59 | 未 |
| 15:00-16:59 | 申 |
| 17:00-18:59 | 酉 |
| 19:00-20:59 | 戌 |
| 21:00-22:59 | 亥 |

### 6.6 Mean Solar Time Correction

```
deltaMinutes = 4 * (longitudeDeg - 15 * tzOffsetHours)
adjustedTime = localTime + deltaMinutes
```

---

## 7. Ten Gods (十神, 십신)

### 7.1 Ten God Keys

| Key | Korean | Hanja | Relationship |
|-----|--------|-------|--------------|
| companion | 비견 | 比肩 | Same element, same polarity |
| robWealth | 겁재 | 劫財 | Same element, different polarity |
| eatingGod | 식신 | 食神 | Generated element, same polarity |
| hurtingOfficer | 상관 | 傷官 | Generated element, different polarity |
| indirectWealth | 편재 | 偏財 | Controlled element, same polarity |
| directWealth | 정재 | 正財 | Controlled element, different polarity |
| sevenKillings | 편관 | 偏官 | Controlling element, same polarity |
| directOfficer | 정관 | 正官 | Controlling element, different polarity |
| indirectSeal | 편인 | 偏印 | Generating element, same polarity |
| directSeal | 정인 | 正印 | Generating element, different polarity |

### 7.2 Ten God Determination Algorithm

```
Given: dayMaster (stem), targetStem
1. Get elements and polarities of both stems
2. Compare elements:
   - Same element → companion/robWealth
   - Day master generates target → eatingGod/hurtingOfficer
   - Day master controls target → indirectWealth/directWealth
   - Target controls day master → sevenKillings/directOfficer
   - Target generates day master → indirectSeal/directSeal
3. Same polarity → first option, different → second option
```

---

## 8. Strength Assessment (신강신약)

### 8.1 Strength Level Keys

| Key | Korean | Hanja | Score Range |
|-----|--------|-------|-------------|
| extremelyWeak | 극약 | 極弱 | ≤10 |
| veryWeak | 태약 | 太弱 | 11-20 |
| weak | 신약 | 身弱 | 21-30 |
| neutralWeak | 중화신약 | 中和身弱 | 31-38 |
| neutral | 중화 | 中和 | 39-45 |
| neutralStrong | 중화신강 | 中和身強 | 46-55 |
| strong | 신강 | 身強 | 56-70 |
| veryStrong | 태강 | 太強 | 71-85 |
| extremelyStrong | 극왕 | 極旺 | >85 |

### 8.2 Strength Factors

```typescript
interface StrengthFactors {
  deukryeong: number;   // Monthly strength (득령) 0-1
  deukji: number;       // Position strength (득지) 
  deukse: number;       // Supporting stems (득세)
  tonggeun: number;     // Root strength (통근)
  helpCount: number;    // Helpful ten gods count
  weakenCount: number;  // Weakening ten gods count
}
```

### 8.3 Scoring Formula

```
score = deukryeong * 35 
      + tonggeun * 20 
      + transparentBonus * 15 
      + deukse * 8 
      + helpCount * 5 
      - weakenCount * 6
```

### 8.4 Monthly Strength (득령) Table

Seasonal element strength by day master element:

| Day Master | Spring | Summer | Autumn | Winter |
|------------|--------|--------|--------|--------|
| Wood | 1.0 | 0.3 | 0.1 | 0.7 |
| Fire | 0.7 | 1.0 | 0.1 | 0.1 |
| Earth | 0.1 | 0.7 | 0.3-0.7 | 0.1 |
| Metal | 0.1 | 0.1 | 1.0 | 0.3 |
| Water | 0.3 | 0.1 | 0.7 | 1.0 |

---

## 9. Relations (합충형파해)

### 9.1 Stem Combinations (天干合)

| Stems | Result Element |
|-------|----------------|
| 甲-己 | Earth |
| 乙-庚 | Metal |
| 丙-辛 | Water |
| 丁-壬 | Wood |
| 戊-癸 | Fire |

### 9.2 Branch Six Combinations (六合)

| Branches | Result Element |
|----------|----------------|
| 子-丑 | Earth |
| 寅-亥 | Wood |
| 卯-戌 | Fire |
| 辰-酉 | Metal |
| 巳-申 | Water |
| 午-未 | Earth |

### 9.3 Branch Triple Combinations (三合)

| Branches | Result Element |
|----------|----------------|
| 寅-午-戌 | Fire |
| 申-子-辰 | Water |
| 亥-卯-未 | Wood |
| 巳-酉-丑 | Metal |

### 9.4 Directional Combinations (方合)

| Branches | Result Element | Direction |
|----------|----------------|-----------|
| 寅-卯-辰 | Wood | East |
| 巳-午-未 | Fire | South |
| 申-酉-戌 | Metal | West |
| 亥-子-丑 | Water | North |

### 9.5 Branch Clashes (沖)

| Pair 1 | Pair 2 | Pair 3 | Pair 4 | Pair 5 | Pair 6 |
|--------|--------|--------|--------|--------|--------|
| 子-午 | 丑-未 | 寅-申 | 卯-酉 | 辰-戌 | 巳-亥 |

### 9.6 Branch Harms (害)

| Pair 1 | Pair 2 | Pair 3 | Pair 4 | Pair 5 | Pair 6 |
|--------|--------|--------|--------|--------|--------|
| 子-未 | 丑-午 | 寅-巳 | 卯-辰 | 申-亥 | 酉-戌 |

### 9.7 Branch Punishments (刑)

| Type | Korean | Hanja | Branches |
|------|--------|-------|----------|
| ungrateful | 무은지형 | 無恩之刑 | 寅-巳-申 |
| power | 시세지형 | 恃勢之刑 | 丑-戌-未 |
| rude | 무례지형 | 無禮之刑 | 子-卯 |
| self | 자형 | 自刑 | 辰-辰, 午-午, 酉-酉, 亥-亥 |

### 9.8 Branch Destructions (破)

| Pair 1 | Pair 2 | Pair 3 | Pair 4 | Pair 5 | Pair 6 |
|--------|--------|--------|--------|--------|--------|
| 子-酉 | 丑-辰 | 寅-亥 | 卯-午 | 巳-申 | 未-戌 |

### 9.9 Transformation Status

| Key | Korean | Hanja | Description |
|-----|--------|-------|-------------|
| combined | 합 | 合 | Combined |
| halfCombined | 반합 | 半合 | Half combined (2 of 3) |
| transformed | 화 | 化 | Transformed to result element |
| notTransformed | 불화 | 不化 | Not transformed |

---

## 10. Twelve Life Stages (十二運星, 십이운성)

### 10.1 Stage Keys

| Index | Key | Korean | Hanja | Meaning | Strength |
|-------|-----|--------|-------|---------|----------|
| 0 | longLife | 장생 | 長生 | New beginning | strong |
| 1 | bathing | 목욕 | 沐浴 | Instability | neutral |
| 2 | crownBelt | 관대 | 冠帶 | Growth | strong |
| 3 | establishment | 건록 | 建祿 | Stability | strong |
| 4 | imperial | 제왕 | 帝旺 | Peak | strong |
| 5 | decline | 쇠 | 衰 | Decline | weak |
| 6 | illness | 병 | 病 | Difficulty | weak |
| 7 | death | 사 | 死 | Ending | weak |
| 8 | tomb | 묘 | 墓 | Storage | neutral |
| 9 | extinction | 절 | 絶 | Severance | weak |
| 10 | conception | 태 | 胎 | Planning | neutral |
| 11 | nurturing | 양 | 養 | Nurturing | neutral |

### 10.2 Birth Branch by Stem

**Yang Stems:**
| Stem | Birth Branch |
|------|--------------|
| 甲 | 亥 |
| 丙 | 寅 |
| 戊 | 寅 |
| 庚 | 巳 |
| 壬 | 申 |

**Yin Stems:**
| Stem | Birth Branch |
|------|--------------|
| 乙 | 午 |
| 丁 | 酉 |
| 己 | 酉 |
| 辛 | 子 |
| 癸 | 卯 |

### 10.3 Stage Calculation

```
if (isYangStem) {
  stageIndex = (targetBranchIndex - birthBranchIndex + 12) mod 12
} else {
  stageIndex = (birthBranchIndex - targetBranchIndex + 12) mod 12
}
```

---

## 11. Yongshen (用神, 용신)

### 11.1 Method Keys

| Key | Korean | Hanja | Description |
|-----|--------|-------|-------------|
| formation | 격국 | 格局 | Special formation method |
| balance | 억부 | 抑扶 | Suppression/Support method |
| climate | 조후 | 調候 | Climate adjustment method |
| bridge | 통관 | 通關 | Bridging method |
| disease | 병약 | 病藥 | Disease-medicine method |

### 11.2 Balance (억부) Method

For **strong** day masters:
- Primary: Element that controls day master
- Secondary: Element generated by day master (exhaust energy)

For **weak** day masters:
- Primary: Element that generates day master
- Secondary: Same element as day master

### 11.3 Climate (조후) Adjustment

Season-based recommendations for each day master element:

| Season | Wood | Fire | Earth | Metal | Water |
|--------|------|------|-------|-------|-------|
| Spring | Fire, Water | Water, Wood | Fire, Wood | Fire, Earth | Fire, Metal |
| Summer | Water, Metal | Water, Metal | Water, Metal | Water, Earth | Metal, Water |
| Autumn | Water, Fire | Wood, Earth | Fire, Water | Fire, Water | Fire, Metal |
| Winter | Fire, Earth | Wood, Earth | Fire, Wood | Fire, Earth | Fire, Earth |

### 11.4 Element Recommendations

| Element | Colors | Direction | Numbers |
|---------|--------|-----------|---------|
| Wood | Blue, Green | East | 3, 8 |
| Fire | Red, Purple | South | 2, 7 |
| Earth | Yellow, Brown | Center | 5, 10 |
| Metal | White, Gold | West | 4, 9 |
| Water | Black, Navy | North | 1, 6 |

---

## 12. Solar Terms (節氣, 절기)

### 12.1 Solar Term Keys

24 solar terms with their solar longitudes:

| Index | Key | Korean | Hanja | Longitude |
|-------|-----|--------|-------|-----------|
| 0 | minorCold | 소한 | 小寒 | 285° |
| 1 | majorCold | 대한 | 大寒 | 300° |
| 2 | springBegins | 입춘 | 立春 | 315° |
| 3 | rainWater | 우수 | 雨水 | 330° |
| 4 | awakeningInsects | 경칩 | 驚蟄 | 345° |
| 5 | vernalEquinox | 춘분 | 春分 | 0° |
| 6 | pureBrightness | 청명 | 淸明 | 15° |
| 7 | grainRain | 곡우 | 穀雨 | 30° |
| 8 | summerBegins | 입하 | 立夏 | 45° |
| 9 | grainBuds | 소만 | 小滿 | 60° |
| 10 | grainInEar | 망종 | 芒種 | 75° |
| 11 | summerSolstice | 하지 | 夏至 | 90° |
| 12 | minorHeat | 소서 | 小暑 | 105° |
| 13 | majorHeat | 대서 | 大暑 | 120° |
| 14 | autumnBegins | 입추 | 立秋 | 135° |
| 15 | heatStops | 처서 | 處暑 | 150° |
| 16 | whiteDew | 백로 | 白露 | 165° |
| 17 | autumnalEquinox | 추분 | 秋分 | 180° |
| 18 | coldDew | 한로 | 寒露 | 195° |
| 19 | frostDescends | 상강 | 霜降 | 210° |
| 20 | winterBegins | 입동 | 立冬 | 225° |
| 21 | minorSnow | 소설 | 小雪 | 240° |
| 22 | majorSnow | 대설 | 大雪 | 255° |
| 23 | winterSolstice | 동지 | 冬至 | 270° |

### 12.2 Jie (節) vs Qi (氣)

- **Jie (節)**: Odd-indexed terms (0, 2, 4, ...) - mark month boundaries
- **Qi (氣)**: Even-indexed terms (1, 3, 5, ...) - mid-month markers

---

## 13. Major Luck (大運, 대운)

### 13.1 Direction Determination

```
isForward = (yearStemPolarity === "yang" && gender === "male") ||
            (yearStemPolarity === "yin" && gender === "female")
```

### 13.2 Start Age Calculation

```
daysToTerm = isForward ? daysToNextJie : daysSincePrevJie
totalMonths = round((daysToTerm / 3) * 12)
years = floor(totalMonths / 12)
months = totalMonths mod 12
startAge = months >= 6 ? years + 1 : years  // Round if >= 6 months
```

### 13.3 Luck Pillar Calculation

```
for i = 1 to count:
  pillarIdx = isForward ? monthPillarIdx + i : monthPillarIdx - i
  pillar = pillarFromIndex(pillarIdx)
  startAge = baseStartAge + (i - 1) * 10
  endAge = startAge + 9
```

---

## 14. Yearly Luck (歲運, 세운)

### 14.1 Calculation

```
yearIdx60 = ((year - 1984) mod 60 + 60) mod 60
pillar = pillarFromIndex(yearIdx60)
age = year - birthYear + 1
```

---

## 15. Monthly Luck (月運, 월운)

### 15.1 Calculation

```
yearIdx60 = ((year - 1984) mod 60 + 60) mod 60
yearStemIdx = yearIdx60 mod 10
baseMonthStemIdx = (yearStemIdx * 2 + 2) mod 10
monthStemIdx = (baseMonthStemIdx + (month - 1)) mod 10
monthBranchIdx = ((month - 1) + 2) mod 12
```

---

## 16. Daily Luck (日運, 일운)

Uses Julian Day Number algorithm (same as day pillar calculation).

---

## 17. Sinsals (神煞, 신살)

### 17.1 Sinsal Types

| Type | Korean | Description |
|------|--------|-------------|
| auspicious | 길신 | Beneficial influence |
| inauspicious | 흉신 | Harmful influence |
| neutral | 중성 | Neutral influence |

### 17.2 Major Sinsals (39 total)

**Auspicious (길신):**
- heavenlyVirtue (천덕귀인), monthlyVirtue (월덕귀인)
- skyNoble (천을귀인), moonNoble (월을귀인)
- literaryNoble (문창귀인), academicHall (학당귀인)
- heavenlyDoctor (천의성), taijiNoble (태극귀인)
- goldenCarriage (금여성), officialStar (건록)
- hiddenWealth (암록), officialAcademicHall (관귀학관)
- heavenlyKitchen (천주귀인), literaryCurve (문곡귀인)
- imperialPardon (황은대사), generalStar (장성살)
- saddleMount (반안살), redPhoenix (홍란살), heavenlyJoy (천희살)

**Inauspicious (흉신):**
- ghostGate (귀문관살), solitaryStar (고진살), widowStar (과숙살)
- bloodKnife (혈인살), sixHarms (육해살), whiteCloth (백호살)
- suspendedNeedle (현침살), sheepBlade (양인살), redFlame (홍염살)
- whiteTiger (백호대살), lostSpirit (망신살), robbery (겁살)
- disaster (재살), gongmang (공망), wonjin (원진살)

**Neutral (중성):**
- peachBlossom (도화살), skyHorse (역마살)
- floweryCanopy (화개살), kuiGang (괴강살), heavenlyGate (천문성)

---

## 18. Lunar Calendar Conversion

Uses the `lunar-javascript` library for conversions.

### 18.1 LunarDate Interface

```typescript
interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  yearGanZhi: string;   // 干支年
  monthGanZhi: string;  // 干支月
  dayGanZhi: string;    // 干支日
}
```

---

## 19. Main API Functions

### 19.1 getSaju (Complete Analysis)

```typescript
function getSaju<T>(
  dtLocal: T,
  options: {
    adapter: DateAdapter<T>;
    gender: "male" | "female";
    longitudeDeg?: number;
    tzOffsetHours?: number;
    preset?: Preset;
    currentYear?: number;
    yearlyLuckRange?: { from: number; to: number };
  }
): SajuResult;
```

### 19.2 SajuResult Interface

```typescript
interface SajuResult {
  pillars: { year: string; month: string; day: string; hour: string };
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
```

### 19.3 Individual Functions

- `getFourPillars(dt, options)` - Calculate four pillars only
- `yearPillar(dt, options)` - Year pillar
- `monthPillar(dt, options)` - Month pillar
- `dayPillarFromDate({ year, month, day })` - Day pillar (no adapter needed)
- `hourPillar(dt, options)` - Hour pillar
- `analyzeTenGods(year, month, day, hour)` - Ten gods analysis
- `analyzeStrength(year, month, day, hour)` - Strength assessment
- `analyzeRelations(year, month, day, hour)` - Relations analysis
- `analyzeTwelveStages(year, month, day, hour)` - Twelve stages
- `analyzeYongShen(year, month, day, hour)` - Yongshen extraction
- `analyzeSolarTerms(dt, options)` - Solar terms info
- `analyzeSinsals(year, month, day, hour)` - Sinsals analysis
- `calculateMajorLuck(dt, gender, year, month, options)` - Major luck
- `calculateYearlyLuck(birthYear, from, to)` - Yearly luck
- `calculateMonthlyLuck(year, from, to)` - Monthly luck
- `calculateDailyLuck(year, month, from, to)` - Daily luck
- `getLunarDate(year, month, day)` - Lunar calendar conversion

---

## 20. Export Structure

### 20.1 Main Exports

```
@gracefullight/saju
├── getSaju
├── getFourPillars
├── yearPillar, monthPillar, dayPillarFromDate, hourPillar
├── analyzeTenGods, countTenGods, countElements
├── analyzeStrength, getStrengthLevelLabel
├── analyzeRelations
├── analyzeTwelveStages, getTwelveStageLabel
├── analyzeYongShen, getElementRecommendations
├── analyzeSolarTerms, getSolarTermsForYear
├── analyzeSinsals, getSinsalLabel
├── calculateMajorLuck, calculateYearlyLuck, calculateMonthlyLuck, calculateDailyLuck
├── getLunarDate, getSolarDate
├── STANDARD_PRESET, TRADITIONAL_PRESET
├── STEMS, BRANCHES, ELEMENTS, HIDDEN_STEMS
├── TEN_GOD_KEYS, STRENGTH_LEVEL_KEYS, SOLAR_TERM_KEYS, TWELVE_STAGES, SINSALS
└── Types: DateAdapter, SajuResult, various interfaces
```

### 20.2 Adapter Exports

```
@gracefullight/saju/adapters/luxon
└── createLuxonAdapter()

@gracefullight/saju/adapters/date-fns
└── createDateFnsAdapter()
```

---

## 21. Test Coverage Requirements

- **Minimum Coverage:** 90%+
- **Test Cases:** 180+
- **Critical Path Testing:**
  - All pillar calculations with known dates
  - Edge cases: year boundaries, day boundaries
  - All ten god combinations
  - All relation types
  - Solar term transitions

---

## 22. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | Initial release |
| 1.0.1 | Current | Added sinsals, twelve stages, monthly/daily luck |
