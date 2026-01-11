# @gracefullight/saju

> 유연한 날짜 어댑터를 지원하는 사주(四柱命理) 계산 TypeScript 라이브러리

[![npm version](https://img.shields.io/npm/v/@gracefullight/saju.svg)](https://www.npmjs.com/package/@gracefullight/saju)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**한국어** | [English](./README.en.md)

## 주요 기능

- **정확한 사주 계산** - 천문학적 정확도로 전통 중국 역법 알고리즘 구현
- **유연한 날짜 어댑터 패턴** - Luxon, date-fns 또는 원하는 날짜 라이브러리 사용 가능
- **타임존 & 위치 지원** - 타임존 및 지리적 좌표를 올바르게 처리
- **태양시 보정** - 경도 기반 평균 태양시 조정 옵션
- **트리쉐이킹 지원** - 필요한 것만 import
- **완전한 타입 지원** - TypeScript 정의 완비
- **풍부한 테스트** - 180개 이상 테스트, 91% 이상 커버리지
- **십신 분석** - 장간(藏干)을 포함한 상세 십신 및 오행 분포 분석
- **신강/신약 판정** - 월령 득령(得令), 통근(通根), 투간(透干), 본중여기(本中餘氣) 가중치를 고려한 9단계 신강도 분석
- **합충형파해** - 천간합, 육합, 삼합, 방합 및 충, 해, 형, 파 분석. 합(合)과 화(化) 성립 조건 분리 표기
- **대운/세운 계산** - 절기(節氣) 기반 정확한 기운(起運) 계산, 성별 및 연간 음양을 고려한 대운 및 연도별 세운 계산
- **용신 추출** - 격국(格局), 억부(抑扶), 조후(調候) 순서로 용신 추천 및 개운법 가이드
- **절기 분석** - 현재/다음 절기 정보 및 경과일 계산

## 사주(四柱)란?

사주(四柱), 또는 사주명리는 출생 연월일시를 기반으로 한 전통 한국/중국 운명 분석 시스템입니다. 각 기둥은 다음으로 구성됩니다:
- **천간(天干)**: 10개 원소 (甲乙丙丁戊己庚辛壬癸)
- **지지(地支)**: 12지지 (子丑寅卯辰巳午未申酉戌亥)

이 라이브러리는 다음을 사용하여 기둥을 계산합니다:
- **입춘(立春)** 을 기준으로 한 연주 전환
- **태양 황경** 을 이용한 월주 결정
- **율리우스 적일** 을 이용한 일주 계산
- **전통 중국 시진(時辰) 체계** 를 이용한 시주

## 설치

```bash
# pnpm 사용
pnpm add @gracefullight/saju

# npm 사용
npm install @gracefullight/saju

# yarn 사용
yarn add @gracefullight/saju
```

### 날짜 라이브러리 어댑터

선호도에 따라 선택:

```bash
# 옵션 1: Luxon (현대적인 앱에 권장)
pnpm add luxon @types/luxon

# 옵션 2: date-fns (가벼운 대안)
pnpm add date-fns date-fns-tz
```

## 빠른 시작

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getSaju } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const birthDateTime = DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
);

// getSaju: 사주 팔자, 십신, 신강약, 합충, 용신, 절기, 대운, 세운을 한 번에 계산
const result = getSaju(birthDateTime, {
  adapter,
  gender: "male",  // 필수: 대운 계산에 필요
  // longitudeDeg: 126.9778,  // 선택: 생략 시 타임존 기준 경도 사용
  // preset: STANDARD_PRESET, // 선택: 기본값은 STANDARD_PRESET
  // yearlyLuckRange: { from: 2024, to: 2030 },  // 선택: 세운 범위 지정
});

console.log(result.pillars);     // { year: "己卯", month: "丙子", ... }
console.log(result.tenGods);     // 십신 및 장간 분석
console.log(result.strength);    // 신강/신약 판정 (예: "신약")
console.log(result.relations);   // 합충형파해 분석
console.log(result.yongShen);    // 용신 및 개운법
console.log(result.solarTerms);  // 절기 정보 (현재/다음 절기, 경과일)
console.log(result.majorLuck);   // 대운 정보
console.log(result.yearlyLuck);  // 세운 정보
```

### 사주 팔자만 계산하기

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getFourPillars } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const birthDateTime = DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
);

const result = getFourPillars(birthDateTime, { adapter });

console.log(result);
```

## 사용법

### Luxon 사용

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getFourPillars, STANDARD_PRESET, TRADITIONAL_PRESET } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

const dt = DateTime.fromObject(
  { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
  { zone: "Asia/Seoul" }
);

// 표준 프리셋: 자정(00:00) 날짜 경계, 태양시 보정 없음
const resultStandard = getFourPillars(dt, {
  adapter,
  longitudeDeg: 126.9778,
  preset: STANDARD_PRESET,
});

// 전통 프리셋: 자시(23:00) 날짜 경계, 태양시 보정 사용
const resultTraditional = getFourPillars(dt, {
  adapter,
  longitudeDeg: 126.9778,
  preset: TRADITIONAL_PRESET,
});
```

### date-fns 사용

```typescript
import { createDateFnsAdapter } from "@gracefullight/saju/adapters/date-fns";
import { getFourPillars, STANDARD_PRESET } from "@gracefullight/saju";

const adapter = await createDateFnsAdapter();

const dt = {
  date: new Date(1985, 4, 15, 14, 30), // 주의: 월은 0부터 시작
  timeZone: "Asia/Seoul",
};

const result = getFourPillars(dt, {
  adapter,
  longitudeDeg: 126.9778,
  preset: STANDARD_PRESET,
});
```

### 커스텀 날짜 어댑터

`DateAdapter` 인터페이스를 구현하여 원하는 날짜 라이브러리 사용:

```typescript
import type { DateAdapter } from "@gracefullight/saju";

const myAdapter: DateAdapter<MyDateType> = {
  // 날짜 컴포넌트 getter
  getYear: (date) => date.year,
  getMonth: (date) => date.month,
  getDay: (date) => date.day,
  getHour: (date) => date.hour,
  getMinute: (date) => date.minute,
  getSecond: (date) => date.second,
  getZoneName: (date) => date.zoneName,

  // 날짜 연산
  plusMinutes: (date, minutes) => date.add({ minutes }),
  plusDays: (date, days) => date.add({ days }),
  minusDays: (date, days) => date.subtract({ days }),

  // 타임존 연산
  toUTC: (date) => date.toUTC(),
  setZone: (date, zoneName) => date.setZone(zoneName),

  // 변환
  toISO: (date) => date.toISO(),
  toMillis: (date) => date.valueOf(),
  fromMillis: (millis, zone) => MyDate.fromMillis(millis, zone),

  // 유틸리티
  createUTC: (year, month, day, hour, minute, second) =>
    MyDate.utc(year, month, day, hour, minute, second),
  isGreaterThanOrEqual: (date1, date2) => date1 >= date2,
};
```

## API 레퍼런스

### 설정 프리셋

#### `STANDARD_PRESET`
현대적 해석: 자정 날짜 경계와 태양시 보정 없음

```typescript
{
  dayBoundary: "midnight",           // 날짜는 00:00에 시작
  useMeanSolarTimeForHour: false,    // 시주는 현지 시간 사용
  useMeanSolarTimeForBoundary: false // 날짜 경계는 현지 시간 사용
}
```

#### `TRADITIONAL_PRESET`
전통적 해석: 자시(23:00) 날짜 경계와 태양시 보정 사용

```typescript
{
  dayBoundary: "zi23",               // 날짜는 23:00(子時)에 시작
  useMeanSolarTimeForHour: true,     // 시주는 태양시 사용
  useMeanSolarTimeForBoundary: true  // 날짜 경계는 태양시 사용
}
```

### 핵심 함수

#### `getSaju(datetime, options)`

사주 분석의 모든 결과(팔자, 십신, 신강약, 합충, 용신, 대운)를 한 번에 계산합니다.

```typescript
function getSaju<T>(
  dtLocal: T,
  options: {
    adapter: DateAdapter<T>;
    longitudeDeg?: number;
    gender: "male" | "female";  // 필수
    tzOffsetHours?: number;
    preset?: typeof STANDARD_PRESET;
    currentYear?: number;  // 세운 기본 범위 계산용
    yearlyLuckRange?: { from: number; to: number };  // 세운 범위 직접 지정
  }
): SajuResult;
```

#### `getFourPillars(datetime, options)`

네 기둥(연주, 월주, 일주, 시주) 모두 계산

```typescript
function getFourPillars<T>(
  datetime: T,
  options: {
    adapter: DateAdapter<T>;
    longitudeDeg?: number;
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

**매개변수:**
- `datetime`: 어댑터 형식의 날짜/시간 객체
- `options`:
  - `adapter`: DateAdapter 인스턴스
  - `longitudeDeg`: 지리적 경도(도 단위) (예: 서울 126.9778), 선택사항
  - `preset`: 설정 프리셋 (`STANDARD_PRESET` 또는 `TRADITIONAL_PRESET` 사용)
  - `tzOffsetHours`: 타임존 오프셋(시간 단위), 선택사항 (기본값: 9, KST)

**반환값:** 연월일시 기둥, 음력 날짜, 메타데이터를 포함한 객체

#### `yearPillar(datetime, options)`

입춘(立春, 봄의 시작) 기준으로 연주만 계산

```typescript
function yearPillar<T>(
  datetime: T,
  options: { adapter: DateAdapter<T> }
): {
  idx60: number;
  pillar: string;
  solarYear: number;
}
```

#### `monthPillar(datetime, options)`

태양 황경 기준으로 월주만 계산

```typescript
function monthPillar<T>(
  datetime: T,
  options: { adapter: DateAdapter<T> }
): {
  pillar: string;
  sunLonDeg: number;
}
```

#### `dayPillarFromDate({ year, month, day })`

율리우스 적일을 사용하여 일주만 계산

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

### 음력 변환 함수

#### `getLunarDate(year, month, day)`

양력(그레고리력) 날짜를 음력 날짜로 변환

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

**예시:**
```typescript
import { getLunarDate } from "@gracefullight/saju";

const lunar = getLunarDate(2000, 1, 1);
// { lunarYear: 1999, lunarMonth: 11, lunarDay: 25, isLeapMonth: false }
```

#### `getSolarDate(lunarYear, lunarMonth, lunarDay, isLeapMonth)`

음력 날짜를 양력(그레고리력) 날짜로 변환

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

**예시:**
```typescript
import { getSolarDate } from "@gracefullight/saju";

const solar = getSolarDate(1999, 11, 25, false);
// { year: 2000, month: 1, day: 1 }
```

#### `hourPillar(datetime, options)`

태양시 보정 옵션과 함께 시주만 계산

```typescript
function hourPillar<T>(
  datetime: T,
  options: {
    adapter: DateAdapter<T>;
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

### 상수

```typescript
// 10 천간(天干)
export const STEMS: string[];
// ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]

// 12 지지(地支)
export const BRANCHES: string[];
// ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
```

### 헬퍼 함수

#### `applyMeanSolarTime(adapter, dtLocal, longitudeDeg, tzOffsetHours)`

경도 기반 평균 태양시 보정 적용

```typescript
function applyMeanSolarTime<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  longitudeDeg: number,
  tzOffsetHours: number
): T
```

#### `effectiveDayDate(dtLocal, options)`

날짜 경계 규칙을 고려한 유효 날짜 계산

```typescript
function effectiveDayDate<T>(
  dtLocal: T,
  options: {
    adapter: DateAdapter<T>;
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

### 분석 함수

#### `analyzeTenGods(year, month, day, hour)`

사주 팔자의 십신과 지장간을 분석합니다.

```typescript
function analyzeTenGods(
  year: string,
  month: string,
  day: string,
  hour: string
): FourPillarsTenGods;
```

#### `analyzeStrength(year, month, day, hour)`

사주의 신강/신약을 9단계로 판정합니다.

```typescript
function analyzeStrength(
  year: string,
  month: string,
  day: string,
  hour: string
): StrengthResult;
```

#### `analyzeRelations(year, month, day, hour)`

천간과 지지의 합, 충, 형, 파, 해 관계를 분석합니다.

```typescript
function analyzeRelations(
  year: string,
  month: string,
  day: string,
  hour: string
): RelationsResult;
```

#### `calculateMajorLuck(birthDateTime, gender, yearPillar, monthPillar, options)`

대운의 흐름과 시작 연령을 계산합니다.

```typescript
function calculateMajorLuck<T>(
  birthDateTime: T,
  gender: "male" | "female",
  yearPillar: string,
  monthPillar: string,
  options: { adapter: DateAdapter<T>; longitudeDeg?: number; tzOffsetHours?: number }
): MajorLuckResult;
```

#### `analyzeYongShen(year, month, day, hour)`

억부와 조후를 고려하여 용신과 희신을 추출합니다.

```typescript
function analyzeYongShen(
  year: string,
  month: string,
  day: string,
  hour: string
): YongShenResult;
```

#### `analyzeSolarTerms(datetime, options)`

현재 및 다음 절기 정보와 경과일을 계산합니다.

```typescript
function analyzeSolarTerms<T>(
  dtLocal: T,
  options: { adapter: DateAdapter<T> }
): SolarTermInfo;
```

**반환값:**
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

#### `getSolarTermsForYear(year, options)`

특정 연도의 24절기 날짜를 모두 계산합니다.

```typescript
function getSolarTermsForYear<T>(
  year: number,
  options: { adapter: DateAdapter<T>; timezone: string }
): Array<{ term: SolarTerm; date: {...} }>;
```

## 고급 사용법

### 태양시 보정

태양시 보정은 현지 시계 시간과 실제 태양시의 차이를 고려하여 경도에 따라 현지 시간을 조정합니다.

```typescript
import { applyMeanSolarTime, createLuxonAdapter } from "@gracefullight/saju";
import { DateTime } from "luxon";

const adapter = await createLuxonAdapter();
const localTime = DateTime.local(2024, 1, 1, 12, 0, 0, { zone: "Asia/Seoul" });

// 서울은 경도 126.9778°E이지만 UTC+9(표준 자오선 135°E) 사용
// 이로 인해 약 32분 차이 발생
const solarTime = applyMeanSolarTime(adapter, localTime, 126.9778, 9);
console.log(solarTime.hour); // ~11.47 (11:28)
```

### 날짜 경계 모드

**자정 모드** (`dayBoundary: "midnight"`):
- 날짜가 00:00 현지 시간에 변경
- 더 단순하고 현대 달력과 일치
- 일반적인 사용에 적합

**자시 모드** (`dayBoundary: "zi23"`):
- 날짜가 23:00 현지 시간에 변경
- 전통 중국 시간 체계
- 자시(子時)가 자정을 걸침 (23:00-01:00)

```typescript
const result1 = getFourPillars(dt, {
  adapter,
  longitudeDeg: 126.9778,
  preset: { ...STANDARD_PRESET, dayBoundary: "midnight" },
});

const result2 = getFourPillars(dt, {
  adapter,
  longitudeDeg: 126.9778,
  preset: { ...STANDARD_PRESET, dayBoundary: "zi23" },
});
```

### 커스텀 설정

특정 요구사항에 맞게 설정 조합:

```typescript
const customConfig = {
  dayBoundary: "midnight" as const,      // 현대적인 자정 경계
  useMeanSolarTimeForHour: true,         // 하지만 시주는 태양시 사용
  useMeanSolarTimeForBoundary: false,    // 날짜 경계는 현지 시간 사용
};

const result = getFourPillars(dt, {
  adapter,
  longitudeDeg: 126.9778,
  preset: customConfig,
});
```

## 지리적 좌표

참고용 주요 도시 경도:

| 도시 | 경도 | 예시 |
|------|------|------|
| 서울, 대한민국 | 126.9778°E | `longitudeDeg: 126.9778` |
| 베이징, 중국 | 116.4074°E | `longitudeDeg: 116.4074` |
| 도쿄, 일본 | 139.6917°E | `longitudeDeg: 139.6917` |
| 상하이, 중국 | 121.4737°E | `longitudeDeg: 121.4737` |
| 타이베이, 대만 | 121.5654°E | `longitudeDeg: 121.5654` |

## 예제

### 대운과 세운 계산

```typescript
const saju = getSaju(dt, {
  adapter,
  longitudeDeg: 126.9778,
  gender: "female",
  yearlyLuckRange: { from: 2024, to: 2030 }
});

// 대운 확인
console.log(saju.majorLuck.pillars); // 대운 목록
console.log(saju.majorLuck.startAge); // 대운 시작 나이

// 세운 확인
saju.yearlyLuck.forEach(luck => {
  console.log(`${luck.year}년(${luck.pillar}): ${luck.age}세`);
});
```

### 절기 정보 확인

```typescript
const saju = getSaju(dt, {
  adapter,
  longitudeDeg: 126.9778,
  gender: "male",
});

// 현재 절기
console.log(saju.solarTerms.current.name);  // "소한"
console.log(saju.solarTerms.current.hanja); // "小寒"
console.log(saju.solarTerms.daysSinceCurrent); // 5 (절기 경과일)

// 다음 절기
console.log(saju.solarTerms.next.name);     // "대한"
console.log(saju.solarTerms.daysUntilNext); // 10 (다음 절기까지 남은 일)

// 절기 시작 날짜
console.log(saju.solarTerms.currentDate);   // { year: 2024, month: 1, day: 6, ... }
console.log(saju.solarTerms.nextDate);      // { year: 2024, month: 1, day: 20, ... }
```

### 십신 및 오행 분석

```typescript
import { analyzeTenGods, countElements } from "@gracefullight/saju";

const tenGods = analyzeTenGods("己卯", "丙子", "辛巳", "戊戌");
console.log(tenGods.dayMaster); // "辛"

const elements = countElements(tenGods);
console.log(elements); // { wood: 1, fire: 1, earth: 3, metal: 1, water: 2 }
```

### 신강약 및 용신 분석

```typescript
import { analyzeStrength, analyzeYongShen, getElementRecommendations } from "@gracefullight/saju";

const strength = analyzeStrength("己卯", "丙子", "辛巳", "戊戌");
console.log(strength.level); // "신약"

const yongShen = analyzeYongShen("己卯", "丙子", "辛巳", "戊戌");
console.log(yongShen.primary); // 용신 오행 (예: "earth")

const tips = getElementRecommendations(yongShen);
console.log(tips.colors); // 행운의 색상
```

### 합충형파해 분석

```typescript
import { analyzeRelations } from "@gracefullight/saju";

const relations = analyzeRelations("己卯", "丙子", "辛巳", "戊戌");
relations.clashes.forEach(c => {
  console.log(`${c.positions[0]}-${c.positions[1]} 지지 충: ${c.pair[0]}-${c.pair[1]}`);
});
```

### 다양한 타임존에서 계산

```typescript
import { DateTime } from "luxon";
import { createLuxonAdapter, getFourPillars, TRADITIONAL_PRESET } from "@gracefullight/saju";

const adapter = await createLuxonAdapter();

// 뉴욕 출생 시간
const nyTime = DateTime.fromObject(
  { year: 1985, month: 5, day: 15, hour: 6, minute: 30 },
  { zone: "America/New_York" }
);

const result = getFourPillars(nyTime, {
  adapter,
  longitudeDeg: -74.0060, // 뉴욕 경도
  tzOffsetHours: -5,      // EST 오프셋
  preset: TRADITIONAL_PRESET,
});
```

### 개별 기둥 계산

```typescript
import { yearPillar, monthPillar, dayPillarFromDate, hourPillar } from "@gracefullight/saju";

// 연주
const year = yearPillar(dt, { adapter });
console.log(year.pillar, year.solarYear);

// 월주
const month = monthPillar(dt, { adapter });
console.log(month.pillar, month.sunLonDeg);

// 일주 (어댑터 불필요)
const day = dayPillarFromDate({ year: 1985, month: 5, day: 15 });
console.log(day.pillar);

// 태양시를 사용한 시주
const hour = hourPillar(dt, {
  adapter,
  longitudeDeg: 126.9778,
  useMeanSolarTimeForHour: true,
});
console.log(hour.pillar, hour.adjustedHour);
```

### 일괄 처리

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
    pillars: getFourPillars(dt, {
      adapter,
      longitudeDeg: 126.9778,
      preset: STANDARD_PRESET,
    }),
  };
});
```

## 개발

### 설정

```bash
# 저장소 클론
git clone https://github.com/gracefullight/saju.git
cd saju

# 의존성 설치
pnpm install

# 테스트 실행
pnpm test

# 커버리지 확인
pnpm test:coverage

# 빌드
pnpm build

# 린트
pnpm lint

# 포맷
pnpm lint:fix
```

### 프로젝트 구조

```
packages/saju/
├── src/
│   ├── adapters/           # 날짜 라이브러리 어댑터
│   │   ├── date-adapter.ts # 어댑터 인터페이스
│   │   ├── luxon.ts        # Luxon 어댑터
│   │   └── date-fns.ts     # date-fns 어댑터
│   ├── core/               # 핵심 계산 로직
│   │   ├── four-pillars.ts # 사주 팔자 계산
│   │   ├── ten-gods.ts     # 십신 분석
│   │   ├── strength.ts     # 신강/신약 판정
│   │   ├── relations.ts    # 합충형파해 분석
│   │   ├── luck.ts         # 대운/세운 계산
│   │   ├── yongshen.ts     # 용신 추출
│   │   ├── solar-terms.ts  # 절기 계산
│   │   └── lunar.ts        # 음력 변환
│   ├── types/              # 타입 정의
│   ├── __tests__/          # 테스트 스위트
│   └── index.ts            # 공개 API
├── dist/                   # 컴파일된 출력
├── coverage/               # 테스트 커버리지 리포트
└── README.md
```

### 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# watch 모드로 테스트 실행
pnpm test:watch

# 커버리지 리포트 생성
pnpm test:coverage
```

커버리지 결과:
```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|----------
All files          |   91.45 |    80.68 |   96.55 |   91.45
 src/adapters      |   94.59 |    90.24 |     100 |   94.59
 src/core          |   96.87 |    75.55 |     100 |   96.87
```

## 자주 묻는 질문

### 단일 날짜 라이브러리 대신 날짜 어댑터를 사용하는 이유는?

프로젝트마다 다른 날짜 라이브러리를 사용합니다. 어댑터 패턴을 통해:
- 추가 의존성 없이 기존 날짜 라이브러리 사용 가능
- 필요한 것만 포함하여 번들 크기 최소화
- 프로젝트의 날짜 처리 방식과 일관성 유지

### STANDARD_PRESET과 TRADITIONAL_PRESET의 차이는?

**STANDARD_PRESET**은 현대적 관례 사용:
- 날짜가 자정(00:00)에 시작
- 현지 시계 시간 사용
- 일반적인 사용에 더 간단

**TRADITIONAL_PRESET**은 전통 중국 점성술을 따름:
- 날짜가 자시(23:00)에 시작
- 경도 기반 태양시 보정 적용
- 역사적으로 더 정확

### 계산은 얼마나 정확한가요?

이 라이브러리는 다음을 구현합니다:
- 일주를 위한 율리우스 적일 알고리즘 (모든 역사적 날짜에 정확)
- 월주를 위한 천문학적 태양 황경 계산
- 연주를 위한 입춘(봄의 시작) 계산
- 시주를 위한 전통 중국 시진(時辰) 체계

모든 알고리즘은 알려진 역사적 날짜로 테스트되었으며 전통 중국 달력 참고자료와 일치합니다.

### 역사적 날짜에도 사용할 수 있나요?

네! 율리우스 적일 알고리즘은 다음에서 올바르게 작동합니다:
- 그레고리력의 모든 날짜 (1582년 이후)
- 율리우스력의 대부분 날짜 (적절한 달력 변환 포함)
- 먼 미래의 날짜

다만, 약 1970년 이전 날짜의 타임존 데이터는 덜 정확할 수 있습니다.

### 같은 출생 시간이 다른 프리셋에서 다른 결과를 주는 이유는?

프리셋은 다음에 영향을 미칩니다:
1. **날짜 경계**: 날짜가 실제로 변경되는 시점 (자정 vs. 23:00)
2. **태양시**: 경도 차이에 대한 조정 여부

예를 들어, 23:30은 다음과 같을 수 있습니다:
- 같은 날의 자시 (자정 경계 사용 시)
- 다음 날의 자시 (자시23 경계 사용 시)

이는 의도적이며 사주 해석의 다양한 전통을 반영합니다.

## 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

1. 저장소 포크
2. feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 오픈

### 가이드라인

- 새 기능에 대한 테스트 작성
- 코드 커버리지 유지 또는 개선
- 기존 코드 스타일 따르기 (Biome으로 강제)
- 필요에 따라 문서 업데이트

## 라이선스

MIT © [gracefullight](https://github.com/gracefullight)

## 크레딧

이 라이브러리는 사주명리(四柱命理)에 사용되는 전통 중국 역법 알고리즘과 천문 계산을 기반으로 합니다.

## 관련 프로젝트

- [Luxon](https://moment.github.io/luxon/) - 현대적인 날짜/시간 라이브러리
- [date-fns](https://date-fns.org/) - 현대적인 JavaScript 날짜 유틸리티 라이브러리

## 지원

- [문서](https://github.com/gracefullight/saju#readme)
- [이슈 트래커](https://github.com/gracefullight/saju/issues)
- [토론](https://github.com/gracefullight/saju/discussions)
