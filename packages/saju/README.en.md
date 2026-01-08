# @gracefullight/saju

> TypeScript library for calculating Four Pillars of Destiny (Saju, 四柱命理) with flexible date adapter support.

[![npm version](https://img.shields.io/npm/v/@gracefullight/saju.svg)](https://www.npmjs.com/package/@gracefullight/saju)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[한국어](./README.md) | **English**

## Features

- **Accurate Four Pillars Calculation** - Implements traditional Chinese calendar algorithms with astronomical precision
- **Flexible Date Adapter Pattern** - Use Luxon, date-fns, or bring your own date library
- **Timezone & Location Support** - Proper handling of timezones and geographic coordinates
- **Solar Time Correction** - Optional mean solar time adjustment based on longitude
- **Tree-shakeable** - Import only what you need
- **Fully Typed** - Complete TypeScript definitions
- **Well Tested** - 180+ tests with 91%+ coverage
- **Ten Gods Analysis** - Detailed ten gods and five elements distribution with hidden stems
- **Strength Assessment** - 9-level strength analysis with monthly strength (得令), root strength (通根), transparency (透干), and hidden stem weights (本中餘氣)
- **Relations Analysis** - Combinations, clashes, harms, punishments with transformation (化) status and conditions
- **Major/Yearly Luck** - Solar term (節氣) based accurate luck start calculation, major luck and yearly luck based on gender and year pillar
- **Yongshen Extraction** - Favorable element recommendation following 格局→抑扶→調候 priority with fortune enhancement guide
- **Solar Terms Analysis** - Current/next solar term info with elapsed days calculation

## What is Saju (四柱)?

Saju (Four Pillars of Destiny, 四柱命理) is a traditional Korean and Chinese divination system based on one's birth year, month, day, and hour. Each pillar consists of:
- **Heavenly Stem (天干)**: 10 elements (甲乙丙丁戊己庚辛壬癸)
- **Earthly Branch (地支)**: 12 zodiac signs (子丑寅卯辰巳午未申酉戌亥)

This library calculates these pillars using:
- **Lichun (立春, Start of Spring)** for year pillar transitions
- **Solar longitude** for month pillar determination
- **Julian Day Number** for day pillar calculation
- **Traditional Chinese double-hour system (時辰, shichen)** for hour pillar

## Installation

```bash
# Using pnpm
pnpm add @gracefullight/saju

# Using npm
npm install @gracefullight/saju

# Using yarn
yarn add @gracefullight/saju
```

### Date Library Adapters

Choose one based on your preference:

```bash
# Option 1: Luxon (recommended for modern apps)
pnpm add luxon @types/luxon

# Option 2: date-fns (lightweight alternative)
pnpm add date-fns date-fns-tz
```

## Quick Start

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getSaju } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const birthDateTime = DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
);

// getSaju: Calculate pillars, ten gods, strength, relations, yongshen, solar terms, major luck, yearly luck all at once
const result = getSaju(adapter, birthDateTime, {
  gender: "male",  // Required: needed for major luck calculation
  // longitudeDeg: 126.9778,  // Optional: uses timezone-based longitude if omitted
  // preset: STANDARD_PRESET, // Optional: defaults to STANDARD_PRESET
  // yearlyLuckRange: { from: 2024, to: 2030 },  // Optional: specify yearly luck range
});

console.log(result.pillars);     // { year: "己卯", month: "丙子", ... }
console.log(result.tenGods);     // Ten gods and hidden stems analysis
console.log(result.strength);    // Strength assessment (e.g., "weak")
console.log(result.relations);   // Relations analysis
console.log(result.yongShen);    // Yongshen and fortune tips
console.log(result.solarTerms);  // Solar term info (current/next term, elapsed days)
console.log(result.majorLuck);   // Major luck info
console.log(result.yearlyLuck);  // Yearly luck info
```

### Calculate Four Pillars Only

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getFourPillars } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const birthDateTime = DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
);

const result = getFourPillars(adapter, birthDateTime);

console.log(result);
```

## Usage

### With Luxon

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getFourPillars, STANDARD_PRESET, TRADITIONAL_PRESET } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const dt = DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
);

// Standard Preset: Midnight (00:00) day boundary, no solar time correction
const resultStandard = getFourPillars(adapter, dt, {
  longitudeDeg: 126.9778,
  preset: STANDARD_PRESET,
});

// Traditional Preset: Zi hour (23:00) day boundary, with solar time correction
const resultTraditional = getFourPillars(adapter, dt, {
  longitudeDeg: 126.9778,
  preset: TRADITIONAL_PRESET,
});
```

### With date-fns

```typescript
import { createDateFnsAdapter } from "@gracefullight/saju/adapters/date-fns";
import { getFourPillars, STANDARD_PRESET } from "@gracefullight/saju";

const adapter = await createDateFnsAdapter();

const dt = {
  date: new Date(1985, 4, 15, 14, 30), // Note: month is 0-indexed
  timeZone: "Asia/Seoul",
};

const result = getFourPillars(adapter, dt, {
  longitudeDeg: 126.9778,
  preset: STANDARD_PRESET,
});
```

### Custom Date Adapter

Implement the `DateAdapter` interface to use any date library:

```typescript
import type { DateAdapter } from "@gracefullight/saju";

const myAdapter: DateAdapter<MyDateType> = {
  // Date component getters
  getYear: (date) => date.year,
  getMonth: (date) => date.month,
  getDay: (date) => date.day,
  getHour: (date) => date.hour,
  getMinute: (date) => date.minute,
  getSecond: (date) => date.second,
  getZoneName: (date) => date.zoneName,

  // Date arithmetic
  plusMinutes: (date, minutes) => date.add({ minutes }),
  plusDays: (date, days) => date.add({ days }),
  minusDays: (date, days) => date.subtract({ days }),

  // Timezone operations
  toUTC: (date) => date.toUTC(),
  setZone: (date, zoneName) => date.setZone(zoneName),

  // Conversions
  toISO: (date) => date.toISO(),
  toMillis: (date) => date.valueOf(),
  fromMillis: (millis, zone) => MyDate.fromMillis(millis, zone),

  // Utilities
  createUTC: (year, month, day, hour, minute, second) =>
    MyDate.utc(year, month, day, hour, minute, second),
  isGreaterThanOrEqual: (date1, date2) => date1 >= date2,
};
```

## API Reference

### Configuration Presets

#### `STANDARD_PRESET`
Contemporary interpretation with midnight day boundary and no solar time correction.

```typescript
{
  dayBoundary: "midnight",           // Day starts at 00:00
  useMeanSolarTimeForHour: false,    // Use local time for hour
  useMeanSolarTimeForBoundary: false // Use local time for day boundary
}
```

#### `TRADITIONAL_PRESET`
Traditional interpretation with Zi hour (23:00) day boundary and solar time correction.

```typescript
{
  dayBoundary: "zi23",               // Day starts at 23:00 (子時)
  useMeanSolarTimeForHour: true,     // Use solar time for hour
  useMeanSolarTimeForBoundary: true  // Use solar time for day boundary
}
```

### Core Functions

#### `getSaju(adapter, datetime, options)`

Calculate all saju analysis results (pillars, ten gods, strength, relations, yongshen, solar terms, major luck, yearly luck) at once.

```typescript
function getSaju<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  options: {
    longitudeDeg: number;
    gender: "male" | "female";  // Required
    tzOffsetHours?: number;
    preset?: typeof STANDARD_PRESET;
    currentYear?: number;  // For default yearly luck range
    yearlyLuckRange?: { from: number; to: number };  // Specify yearly luck range directly
  }
): SajuResult;
```

#### `getFourPillars(adapter, datetime, options)`

Calculate all four pillars (year, month, day, hour).

```typescript
function getFourPillars<T>(
  adapter: DateAdapter<T>,
  datetime: T,
  options: {
    longitudeDeg: number;
    preset?: {
      dayBoundary: "midnight" | "zi23";
      useMeanSolarTimeForHour: boolean;
      useMeanSolarTimeForBoundary: boolean;
    };
    tzOffsetHours?: number;
  }
): {
  year: string;
  month: string;
  day: string;
  hour: string;
  lunar: {
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
  };
  meta: {
    solarYearUsed: number;
    sunLonDeg: number;
    effectiveDayDate: { year: number; month: number; day: number };
    adjustedDtForHour: string;
  };
}
```

**Parameters:**
- `adapter`: DateAdapter instance
- `datetime`: Date/time object in the adapter's format
- `options`:
  - `longitudeDeg`: Geographic longitude in degrees (e.g., Seoul: 126.9778)
  - `preset`: Configuration preset (use `STANDARD_PRESET` or `TRADITIONAL_PRESET`)
  - `tzOffsetHours`: Optional timezone offset in hours (default: 9 for KST)

**Returns:** Object with year, month, day, hour pillars, lunar date, and metadata

#### `yearPillar(adapter, datetime)`

Calculate only the year pillar based on Lichun (立春, Start of Spring).

```typescript
function yearPillar<T>(
  adapter: DateAdapter<T>,
  datetime: T
): {
  idx60: number;
  pillar: string;
  solarYear: number;
}
```

#### `monthPillar(adapter, datetime)`

Calculate only the month pillar based on solar longitude.

```typescript
function monthPillar<T>(
  adapter: DateAdapter<T>,
  datetime: T
): {
  pillar: string;
  sunLonDeg: number;
}
```

#### `dayPillarFromDate({ year, month, day })`

Calculate only the day pillar using Julian Day Number.

```typescript
function dayPillarFromDate(date: {
  year: number;
  month: number;
  day: number;
}): {
  idx60: number;
  pillar: string;
}
```

### Lunar Conversion Functions

#### `getLunarDate(year, month, day)`

Convert a solar (Gregorian) date to a lunar date.

```typescript
function getLunarDate(
  year: number,
  month: number,
  day: number
): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
}
```

**Example:**
```typescript
import { getLunarDate } from "@gracefullight/saju";

const lunar = getLunarDate(2000, 1, 1);
// { lunarYear: 1999, lunarMonth: 11, lunarDay: 25, isLeapMonth: false }
```

#### `getSolarDate(lunarYear, lunarMonth, lunarDay, isLeapMonth)`

Convert a lunar date to a solar (Gregorian) date.

```typescript
function getSolarDate(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth?: boolean
): {
  year: number;
  month: number;
  day: number;
}
```

**Example:**
```typescript
import { getSolarDate } from "@gracefullight/saju";

const solar = getSolarDate(1999, 11, 25, false);
// { year: 2000, month: 1, day: 1 }
```

#### `hourPillar(adapter, datetime, options)`

Calculate only the hour pillar with optional solar time correction.

```typescript
function hourPillar<T>(
  adapter: DateAdapter<T>,
  datetime: T,
  options?: {
    longitudeDeg?: number;
    tzOffsetHours?: number;
    useMeanSolarTimeForHour?: boolean;
    dayBoundary?: "midnight" | "zi23";
    useMeanSolarTimeForBoundary?: boolean;
  }
): {
  pillar: string;
  adjustedDt: T;
  adjustedHour: number;
}
```

### Constants

```typescript
// 10 Heavenly Stems (天干)
export const STEMS: string[];
// ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]

// 12 Earthly Branches (地支)
export const BRANCHES: string[];
// ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
```

### Helper Functions

#### `applyMeanSolarTime(adapter, dtLocal, longitudeDeg, tzOffsetHours)`

Apply mean solar time correction based on longitude.

```typescript
function applyMeanSolarTime<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  longitudeDeg: number,
  tzOffsetHours: number
): T
```

#### `effectiveDayDate(adapter, dtLocal, options)`

Calculate the effective date considering day boundary rules.

```typescript
function effectiveDayDate<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  options: {
    dayBoundary?: "midnight" | "zi23";
    longitudeDeg?: number;
    tzOffsetHours?: number;
    useMeanSolarTimeForBoundary?: boolean;
  }
): {
  year: number;
  month: number;
  day: number;
}
```

### Analysis Functions

#### `analyzeTenGods(year, month, day, hour)`

Analyzes ten gods and hidden stems of the four pillars.

```typescript
function analyzeTenGods(
  year: string,
  month: string,
  day: string,
  hour: string
): FourPillarsTenGods;
```

#### `analyzeStrength(year, month, day, hour)`

Assesses the strength of the day master on a 7-level scale.

```typescript
function analyzeStrength(
  year: string,
  month: string,
  day: string,
  hour: string
): StrengthResult;
```

#### `analyzeRelations(year, month, day, hour)`

Analyzes combinations, clashes, harms, and punishments between stems and branches.

```typescript
function analyzeRelations(
  year: string,
  month: string,
  day: string,
  hour: string
): RelationsResult;
```

#### `calculateMajorLuck(adapter, datetime, gender, year, month)`

Calculates major luck periods and starting age.

```typescript
function calculateMajorLuck<T>(
  adapter: DateAdapter<T>,
  birthDateTime: T,
  gender: "male" | "female",
  yearPillar: string,
  monthPillar: string
): MajorLuckResult;
```

#### `analyzeYongShen(year, month, day, hour)`

Extracts favorable elements considering suppression and climate adjustment.

```typescript
function analyzeYongShen(
  year: string,
  month: string,
  day: string,
  hour: string
): YongShenResult;
```

#### `analyzeSolarTerms(adapter, datetime)`

Calculates current and next solar term info with elapsed days.

```typescript
function analyzeSolarTerms<T>(
  adapter: DateAdapter<T>,
  dtLocal: T
): SolarTermInfo;
```

**Returns:**
```typescript
{
  current: { name: "소한", hanja: "小寒", longitude: 285 },
  currentDate: { year: 2024, month: 1, day: 6, hour: 5, minute: 30 },
  daysSinceCurrent: 5,
  next: { name: "대한", hanja: "大寒", longitude: 300 },
  nextDate: { year: 2024, month: 1, day: 20, hour: 12, minute: 15 },
  daysUntilNext: 10
}
```

#### `getSolarTermsForYear(adapter, year, timezone)`

Calculates all 24 solar terms for a specific year.

```typescript
function getSolarTermsForYear<T>(
  adapter: DateAdapter<T>,
  year: number,
  timezone: string
): Array<{ term: SolarTerm; date: {...} }>;
```

## Advanced Usage

### Solar Time Correction

Solar time correction adjusts local time based on longitude to account for the difference between local clock time and actual solar time.

```typescript
import { applyMeanSolarTime, createLuxonAdapter } from "@gracefullight/saju";
import { DateTime } from "luxon";

const adapter = await createLuxonAdapter();
const localTime = DateTime.local(2024, 1, 1, 12, 0, 0, { zone: "Asia/Seoul" });

// Seoul is at 126.9778°E, but uses UTC+9 (135°E standard meridian)
// This creates a ~32 minute difference
const solarTime = applyMeanSolarTime(adapter, localTime, 126.9778, 9);
console.log(solarTime.hour); // ~11.47 (11:28)
```

### Day Boundary Modes

**Midnight Mode** (`dayBoundary: "midnight"`):
- Day changes at 00:00 local time
- Simpler, aligns with contemporary calendar systems
- Suitable for general use

**Zi Hour Mode** (`dayBoundary: "zi23"`):
- Day changes at 23:00 local time
- Traditional Chinese timekeeping
- Zi hour (子時) straddles midnight (23:00-01:00)

```typescript
const result1 = getFourPillars(adapter, dt, {
  longitudeDeg: 126.9778,
  preset: { ...STANDARD_PRESET, dayBoundary: "midnight" },
});

const result2 = getFourPillars(adapter, dt, {
  longitudeDeg: 126.9778,
  preset: { ...STANDARD_PRESET, dayBoundary: "zi23" },
});
```

### Custom Configuration

Mix and match settings for specific needs:

```typescript
const customConfig = {
  dayBoundary: "midnight" as const,      // Contemporary midnight boundary
  useMeanSolarTimeForHour: true,         // But use solar time for hour
  useMeanSolarTimeForBoundary: false,    // Local time for day boundary
};

const result = getFourPillars(adapter, dt, {
  longitudeDeg: 126.9778,
  preset: customConfig,
});
```

## Geographic Coordinates

Common city longitudes for reference:

| City | Longitude | Example |
|------|-----------|---------|
| Seoul, South Korea | 126.9778°E | `longitudeDeg: 126.9778` |
| Beijing, China | 116.4074°E | `longitudeDeg: 116.4074` |
| Tokyo, Japan | 139.6917°E | `longitudeDeg: 139.6917` |
| Shanghai, China | 121.4737°E | `longitudeDeg: 121.4737` |
| Taipei, Taiwan | 121.5654°E | `longitudeDeg: 121.5654` |

## Examples

### Major and Yearly Luck Calculation

```typescript
const saju = getSaju(adapter, dt, {
  longitudeDeg: 126.9778,
  gender: "female",
  yearlyLuckRange: { from: 2024, to: 2030 }
});

// Check major luck
console.log(saju.majorLuck.pillars); // Major luck pillars list
console.log(saju.majorLuck.startAge); // Starting age for major luck

// Check yearly luck
saju.yearlyLuck.forEach(luck => {
  console.log(`Year ${luck.year} (${luck.pillar}): Age ${luck.age}`);
});
```

### Solar Terms Info

```typescript
const saju = getSaju(adapter, dt, {
  longitudeDeg: 126.9778,
  gender: "male",
});

// Current solar term
console.log(saju.solarTerms.current.name);  // "소한"
console.log(saju.solarTerms.current.hanja); // "小寒"
console.log(saju.solarTerms.daysSinceCurrent); // 5 (days since term started)

// Next solar term
console.log(saju.solarTerms.next.name);     // "대한"
console.log(saju.solarTerms.daysUntilNext); // 10 (days until next term)

// Solar term dates
console.log(saju.solarTerms.currentDate);   // { year: 2024, month: 1, day: 6, ... }
console.log(saju.solarTerms.nextDate);      // { year: 2024, month: 1, day: 20, ... }
```

### Ten Gods and Five Elements Analysis

```typescript
import { analyzeTenGods, countElements } from "@gracefullight/saju";

const tenGods = analyzeTenGods("己卯", "丙子", "辛巳", "戊戌");
console.log(tenGods.dayMaster); // "辛"

const elements = countElements(tenGods);
console.log(elements); // { wood: 1, fire: 1, earth: 3, metal: 1, water: 2 }
```

### Strength and Yongshen Analysis

```typescript
import { analyzeStrength, analyzeYongShen, getElementRecommendations } from "@gracefullight/saju";

const strength = analyzeStrength("己卯", "丙子", "辛巳", "戊戌");
console.log(strength.level); // "weak"

const yongShen = analyzeYongShen("己卯", "丙子", "辛巳", "戊戌");
console.log(yongShen.primary); // Favorable element (e.g., "earth")

const tips = getElementRecommendations(yongShen);
console.log(tips.colors); // Lucky colors
```

### Relations Analysis

```typescript
import { analyzeRelations } from "@gracefullight/saju";

const relations = analyzeRelations("己卯", "丙子", "辛巳", "戊戌");
relations.clashes.forEach(c => {
  console.log(`${c.positions[0]}-${c.positions[1]} branch clash: ${c.pair[0]}-${c.pair[1]}`);
});
```

### Calculate for Different Timezones

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter, getFourPillars, TRADITIONAL_PRESET } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

// New York birth time
const nyTime = DateTime.fromObject(
  { year: 1985, month: 5, day: 15, hour: 6, minute: 30 },
  { zone: "America/New_York" }
);

const result = getFourPillars(adapter, nyTime, {
  longitudeDeg: -74.0060, // NYC longitude
  tzOffsetHours: -5,      // EST offset
  preset: TRADITIONAL_PRESET,
});
```

### Calculate Individual Pillars

```typescript
import { yearPillar, monthPillar, dayPillarFromDate, hourPillar } from "@gracefullight/saju";

// Year pillar
const year = yearPillar(adapter, dt);
console.log(year.pillar, year.solarYear);

// Month pillar
const month = monthPillar(adapter, dt);
console.log(month.pillar, month.sunLonDeg);

// Day pillar (no adapter needed)
const day = dayPillarFromDate({ year: 1985, month: 5, day: 15 });
console.log(day.pillar);

// Hour pillar with solar time
const hour = hourPillar(adapter, dt, {
  longitudeDeg: 126.9778,
  useMeanSolarTimeForHour: true,
});
console.log(hour.pillar, hour.adjustedHour);
```

### Batch Processing

```typescript
const birthDates = [
  { year: 1990, month: 1, day: 15, hour: 10, minute: 30 },
  { year: 1995, month: 5, day: 20, hour: 14, minute: 45 },
  { year: 2000, month: 12, day: 25, hour: 18, minute: 0 },
];

const adapter = await createLuxonAdapter();

const results = birthDates.map((birth) => {
  const dt = DateTime.fromObject(birth, { zone: "Asia/Seoul" });
  return {
    birth,
    pillars: getFourPillars(adapter, dt, {
      longitudeDeg: 126.9778,
      preset: STANDARD_PRESET,
    }),
  };
});
```

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/gracefullight/saju.git
cd saju

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build
pnpm build

# Lint
pnpm lint

# Format
pnpm lint:fix
```

### Project Structure

```
packages/saju/
├── src/
│   ├── adapters/           # Date library adapters
│   │   ├── date-adapter.ts # Adapter interface
│   │   ├── luxon.ts        # Luxon adapter
│   │   └── date-fns.ts     # date-fns adapter
│   ├── core/               # Core calculation logic
│   │   ├── four-pillars.ts # Four pillars calculation
│   │   ├── ten-gods.ts     # Ten gods analysis
│   │   ├── strength.ts     # Strength assessment
│   │   ├── relations.ts    # Relations analysis
│   │   ├── luck.ts         # Major/yearly luck
│   │   ├── yongshen.ts     # Yongshen extraction
│   │   ├── solar-terms.ts  # Solar terms calculation
│   │   └── lunar.ts        # Lunar conversion
│   ├── types/              # Type definitions
│   ├── __tests__/          # Test suites
│   └── index.ts            # Public API
├── dist/                   # Compiled output
├── coverage/               # Test coverage reports
└── README.md
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

Coverage results:
```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|----------
All files          |   91.45 |    80.68 |   96.55 |   91.45
 src/adapters      |   94.59 |    90.24 |     100 |   94.59
 src/core          |   96.87 |    75.55 |     100 |   96.87
```

## FAQ

### Why use date adapters instead of a single date library?

Different projects use different date libraries. The adapter pattern allows you to:
- Use your existing date library without adding another dependency
- Keep bundle size minimal by only including what you need
- Maintain consistency with your project's date handling

### What's the difference between STANDARD_PRESET and TRADITIONAL_PRESET?

**STANDARD_PRESET** uses contemporary conventions:
- Day starts at midnight (00:00)
- Uses local clock time
- Simpler for general use

**TRADITIONAL_PRESET** follows traditional Chinese astrology practices:
- Day starts at Zi hour (23:00)
- Applies solar time correction based on longitude
- More historically accurate

### How accurate are the calculations?

The library implements:
- Julian Day Number algorithm for day pillars (accurate across all historical dates)
- Astronomical solar longitude calculations for month pillars
- Lichun (Start of Spring) calculation for year pillars
- Traditional Chinese hour system (時辰) for hour pillars

All algorithms are tested with known historical dates and match traditional Chinese calendar references.

### Can I use this for historical dates?

Yes! The Julian Day Number algorithm works correctly for:
- All dates in the Gregorian calendar (1582 onwards)
- Most dates in the Julian calendar (with appropriate calendar conversion)
- Dates far in the future

However, note that timezone data may be less accurate for dates before ~1970.

### Why does the same birth time give different results with different presets?

The presets affect:
1. **Day boundary**: When the day actually changes (midnight vs. 23:00)
2. **Solar time**: Whether to adjust for longitude difference

For example, 23:30 could be:
- Same day's Zi hour (with midnight boundary)
- Next day's Zi hour (with Zi23 boundary)

This is intentional and reflects different interpretative traditions in Saju analysis.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Write tests for new features
- Maintain or improve code coverage
- Follow existing code style (enforced by Biome)
- Update documentation as needed

## License

MIT © [gracefullight](https://github.com/gracefullight)

## Credits

This library is based on traditional Chinese calendar algorithms and astronomical calculations used in Four Pillars astrology (四柱命理).

## Related Projects

- [Luxon](https://moment.github.io/luxon/) - Modern date/time library
- [date-fns](https://date-fns.org/) - Modern JavaScript date utility library

## Support

- [Documentation](https://github.com/gracefullight/saju#readme)
- [Issue Tracker](https://github.com/gracefullight/saju/issues)
- [Discussions](https://github.com/gracefullight/saju/discussions)
