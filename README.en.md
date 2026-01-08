# Saju Monorepo

> TypeScript packages for Korean/Chinese Four Pillars (Saju) astrology

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[한국어](./README.md) | **English**

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@gracefullight/saju](./packages/saju) | Core Saju calculation library | [![npm](https://img.shields.io/npm/v/@gracefullight/saju.svg)](https://www.npmjs.com/package/@gracefullight/saju) |

## Key Features

### @gracefullight/saju

- **Accurate Four Pillars Calculation** - Traditional Chinese calendar algorithms with astronomical precision
- **Flexible Date Adapters** - Use Luxon, date-fns, or your preferred date library
- **Ten Gods Analysis** - Detailed ten gods and five elements distribution including hidden stems
- **Strength Analysis** - 9-level day master strength evaluation
- **Relationships** - Stems combinations, six combinations, triple combinations, clashes, harms, punishments
- **Luck Cycles** - Major luck, yearly luck, monthly luck, daily luck based on solar terms
- **Twelve Life Stages** - Long life to nurturing 12-stage life cycle analysis
- **Sinsals (Spirit Stars)** - 16 types including Peach Blossom, Sky Horse, Sky Noble
- **Yongshen Extraction** - Useful god recommendation following proper methodology
- **Solar Terms** - 24 solar terms information and elapsed days

## Quick Start

```bash
pnpm add @gracefullight/saju luxon @types/luxon
```

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getSaju, STANDARD_PRESET } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const result = getSaju(adapter, DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
), {
  longitudeDeg: 126.9778,
  gender: "male",
  preset: STANDARD_PRESET,
});

console.log(result.pillars);      // Four Pillars
console.log(result.tenGods);      // Ten Gods analysis
console.log(result.strength);     // Day master strength
console.log(result.twelveStages); // Twelve life stages
console.log(result.sinsals);      // Spirit stars
console.log(result.yongShen);     // Useful god
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint
```

## License

MIT
