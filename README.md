# Saju Monorepo

> 사주명리(四柱命理) 관련 TypeScript 패키지 모노레포

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**한국어** | [English](./README.en.md)

## 패키지

| 패키지 | 설명 | 버전 |
|--------|------|------|
| [@gracefullight/saju](./packages/saju) | 사주 계산 핵심 라이브러리 | [![npm](https://img.shields.io/npm/v/@gracefullight/saju.svg)](https://www.npmjs.com/package/@gracefullight/saju) |

## 주요 기능

### @gracefullight/saju

- **정확한 사주 계산** - 천문학적 정확도로 전통 중국 역법 알고리즘 구현
- **유연한 날짜 어댑터** - Luxon, date-fns 또는 원하는 날짜 라이브러리 사용 가능
- **십신 분석** - 장간(藏干)을 포함한 상세 십신 및 오행 분포 분석
- **신강/신약 판정** - 9단계 신강도 분석
- **합충형파해** - 천간합, 육합, 삼합, 방합 및 충, 해, 형, 파 분석
- **대운/세운/월운/일운** - 절기 기반 운세 계산
- **십이운성** - 장생~양 12단계 생명주기 분석
- **신살** - 도화살, 역마살, 천을귀인 등 16종 신살 분석
- **용신 추출** - 격국, 억부, 조후 순서로 용신 추천
- **절기 분석** - 24절기 정보 및 경과일 계산

## 빠른 시작

```bash
pnpm add @gracefullight/saju luxon @types/luxon
```

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getSaju } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const result = getSaju(DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
), {
  adapter,
  gender: "male",
});

console.log(result.pillars);      // 사주 팔자
console.log(result.tenGods);      // 십신 분석
console.log(result.strength);     // 신강/신약
console.log(result.twelveStages); // 십이운성
console.log(result.sinsals);      // 신살
console.log(result.yongShen);     // 용신
```

## 개발

```bash
# 의존성 설치
pnpm install

# 테스트
pnpm test

# 빌드
pnpm build

# 린트
pnpm lint
```

## 라이선스

MIT
