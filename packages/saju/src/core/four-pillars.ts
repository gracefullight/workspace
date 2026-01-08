import type { DateAdapter } from "@/adapters/date-adapter";
import { getLunarDate, type LunarDate } from "@/core/lunar";
import { BRANCHES, jdnFromDate, pillarFromIndex, STEMS } from "@/utils";

export { STEMS, BRANCHES };

export const STANDARD_PRESET = {
  dayBoundary: "midnight" as const,
  useMeanSolarTimeForHour: false,
  useMeanSolarTimeForBoundary: false,
};

export const TRADITIONAL_PRESET = {
  dayBoundary: "zi23" as const,
  useMeanSolarTimeForHour: true,
  useMeanSolarTimeForBoundary: true,
};

export const presetA = STANDARD_PRESET;
export const presetB = TRADITIONAL_PRESET;

function normDeg(x: number): number {
  x %= 360;
  return x < 0 ? x + 360 : x;
}

export function dayPillarFromDate({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}): {
  idx60: number;
  pillar: string;
} {
  const jdn = jdnFromDate(year, month, day);
  const idx60 = (((jdn - 11) % 60) + 60) % 60;
  return { idx60, pillar: pillarFromIndex(idx60) };
}

export function applyMeanSolarTime<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  longitudeDeg: number,
  tzOffsetHours = 9,
): T {
  const deltaMinutes = 4 * (longitudeDeg - 15 * tzOffsetHours);
  return adapter.plusMinutes(dtLocal, deltaMinutes);
}

function sunApparentLongitude<T>(adapter: DateAdapter<T>, dtUtc: T): number {
  let y = adapter.getYear(dtUtc);
  let m = adapter.getMonth(dtUtc);
  const d =
    adapter.getDay(dtUtc) +
    (adapter.getHour(dtUtc) + (adapter.getMinute(dtUtc) + adapter.getSecond(dtUtc) / 60) / 60) / 24;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;

  const T = (JD - 2451545.0) / 36525.0;

  const L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);

  const deg2rad = (deg: number) => (deg * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(deg2rad(M)) +
    (0.019993 - 0.000101 * T) * Math.sin(deg2rad(2 * M)) +
    0.000289 * Math.sin(deg2rad(3 * M));

  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(deg2rad(omega));
  return normDeg(lambda);
}

function angleDiffDeg(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

function findTermUtc<T>(adapter: DateAdapter<T>, targetDeg: number, startUtc: T, endUtc: T): T {
  let a = startUtc;
  let b = endUtc;

  const f = (dt: T) => angleDiffDeg(sunApparentLongitude(adapter, dt), targetDeg);
  let fa = f(a);
  let fb = f(b);

  let expand = 0;
  while (fa * fb > 0 && expand < 10) {
    a = adapter.minusDays(a, 1);
    b = adapter.plusDays(b, 1);
    fa = f(a);
    fb = f(b);
    expand += 1;
  }
  if (fa * fb > 0) throw new Error("Failed to bracket solar term");

  for (let i = 0; i < 80; i++) {
    const midMillis = (adapter.toMillis(a) + adapter.toMillis(b)) / 2;
    const mid = adapter.fromMillis(midMillis, "utc");

    const fm = f(mid);
    if (Math.abs(fm) < 1e-6) return mid;

    if (fa * fm <= 0) {
      b = mid;
      fb = fm;
    } else {
      a = mid;
      fa = fm;
    }
  }
  return adapter.fromMillis((adapter.toMillis(a) + adapter.toMillis(b)) / 2, "utc");
}

function lichunUtc<T>(adapter: DateAdapter<T>, year: number): T {
  const start = adapter.createUTC(year, 2, 1, 0, 0, 0);
  const end = adapter.createUTC(year, 2, 7, 0, 0, 0);
  return findTermUtc(adapter, 315.0, start, end);
}

export function yearPillar<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
): {
  idx60: number;
  pillar: string;
  solarYear: number;
} {
  const y = adapter.getYear(dtLocal);
  const lichunLocal = adapter.setZone(lichunUtc(adapter, y), adapter.getZoneName(dtLocal));
  const solarYear = adapter.isGreaterThanOrEqual(dtLocal, lichunLocal) ? y : y - 1;

  const idx60 = (((solarYear - 1984) % 60) + 60) % 60;
  return { idx60, pillar: pillarFromIndex(idx60), solarYear };
}

function monthBranchIndexFromSunLon(lon: number): number {
  return (Math.floor(((lon + 45) % 360) / 30) + 2) % 12;
}

function firstMonthStemIndex(yearStemIdx: number): number {
  const map = new Map([
    [0, 2],
    [5, 2],
    [1, 4],
    [6, 4],
    [2, 6],
    [7, 6],
    [3, 8],
    [8, 8],
    [4, 0],
    [9, 0],
  ]);
  return map.get(yearStemIdx) ?? 0;
}

export function monthPillar<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
): {
  pillar: string;
  sunLonDeg: number;
} {
  const { idx60: yIdx60 } = yearPillar(adapter, dtLocal);
  const yearStemIdx = yIdx60 % 10;

  const lon = sunApparentLongitude(adapter, adapter.toUTC(dtLocal));
  const mBranchIdx = monthBranchIndexFromSunLon(lon);

  const monthNo = (mBranchIdx - 2 + 12) % 12;
  const mStemIdx = (firstMonthStemIndex(yearStemIdx) + monthNo) % 10;

  return { pillar: STEMS[mStemIdx] + BRANCHES[mBranchIdx], sunLonDeg: lon };
}

export function effectiveDayDate<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  {
    dayBoundary = "midnight",
    longitudeDeg,
    tzOffsetHours = 9,
    useMeanSolarTimeForBoundary = false,
  }: {
    dayBoundary?: "midnight" | "zi23";
    longitudeDeg?: number;
    tzOffsetHours?: number;
    useMeanSolarTimeForBoundary?: boolean;
  } = {},
): { year: number; month: number; day: number } {
  let dtChk = dtLocal;
  if (useMeanSolarTimeForBoundary) {
    if (typeof longitudeDeg !== "number")
      throw new Error("longitudeDeg required when useMeanSolarTimeForBoundary=true");
    dtChk = applyMeanSolarTime(adapter, dtLocal, longitudeDeg, tzOffsetHours);
  }

  let d = dtChk;
  if (dayBoundary === "zi23") {
    if (adapter.getHour(dtChk) >= 23) d = adapter.plusDays(dtChk, 1);
  } else if (dayBoundary !== "midnight") {
    throw new Error("dayBoundary must be 'midnight' or 'zi23'");
  }

  return { year: adapter.getYear(d), month: adapter.getMonth(d), day: adapter.getDay(d) };
}

function hourBranchIndexFromHour(h: number): number {
  // Traditional Chinese hours (時辰) mapping:
  // Each branch represents a 2-hour period, starting from 子時 at 23:00
  // 子時 (0): 23:00-01:00, 丑時 (1): 01:00-03:00, ..., 亥時 (11): 21:00-23:00
  // Formula: floor((hour + 1) / 2) % 12
  // Examples: 0->0(子), 1->1(丑), 3->2(寅), 23->0(子)
  return Math.floor((h + 1) / 2) % 12;
}

export function hourPillar<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  {
    longitudeDeg,
    tzOffsetHours = 9,
    useMeanSolarTimeForHour = false,
    dayBoundary = "midnight",
    useMeanSolarTimeForBoundary = false,
  }: {
    longitudeDeg?: number;
    tzOffsetHours?: number;
    useMeanSolarTimeForHour?: boolean;
    dayBoundary?: "midnight" | "zi23";
    useMeanSolarTimeForBoundary?: boolean;
  } = {},
): {
  pillar: string;
  adjustedDt: T;
  effectiveDate: { year: number; month: number; day: number };
} {
  let dtUsed = dtLocal;
  if (useMeanSolarTimeForHour) {
    if (typeof longitudeDeg !== "number")
      throw new Error("longitudeDeg required when useMeanSolarTimeForHour=true");
    dtUsed = applyMeanSolarTime(adapter, dtLocal, longitudeDeg, tzOffsetHours);
  }

  const effDate = effectiveDayDate(adapter, dtLocal, {
    dayBoundary,
    longitudeDeg,
    tzOffsetHours,
    useMeanSolarTimeForBoundary,
  });

  const { idx60: dIdx60 } = dayPillarFromDate(effDate);
  const dayStemIdx = dIdx60 % 10;

  const hb = hourBranchIndexFromHour(adapter.getHour(dtUsed));
  const hs = (dayStemIdx * 2 + hb) % 10;

  return { pillar: STEMS[hs] + BRANCHES[hb], adjustedDt: dtUsed, effectiveDate: effDate };
}

export function getFourPillars<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  {
    longitudeDeg,
    tzOffsetHours = 9,
    preset = presetA,
  }: {
    longitudeDeg: number;
    tzOffsetHours?: number;
    preset?: typeof presetA | typeof presetB;
  },
): {
  year: string;
  month: string;
  day: string;
  hour: string;
  lunar: LunarDate;
  meta: {
    solarYearUsed: number;
    sunLonDeg: number;
    effectiveDayDate: { year: number; month: number; day: number };
    adjustedDtForHour: string;
    preset: typeof preset;
  };
} {
  if (typeof longitudeDeg !== "number") throw new Error("longitudeDeg is required");

  const dayBoundary = preset.dayBoundary ?? "midnight";
  const useMeanSolarTimeForHour = preset.useMeanSolarTimeForHour ?? false;
  const useMeanSolarTimeForBoundary = preset.useMeanSolarTimeForBoundary ?? false;

  const y = yearPillar(adapter, dtLocal);
  const m = monthPillar(adapter, dtLocal);

  const effDate = effectiveDayDate(adapter, dtLocal, {
    dayBoundary,
    longitudeDeg,
    tzOffsetHours,
    useMeanSolarTimeForBoundary,
  });
  const d = dayPillarFromDate(effDate);

  const h = hourPillar(adapter, dtLocal, {
    longitudeDeg,
    tzOffsetHours,
    useMeanSolarTimeForHour,
    dayBoundary,
    useMeanSolarTimeForBoundary,
  });

  const lunar = getLunarDate(effDate.year, effDate.month, effDate.day);

  return {
    year: y.pillar,
    month: m.pillar,
    day: d.pillar,
    hour: h.pillar,
    lunar,
    meta: {
      solarYearUsed: y.solarYear,
      sunLonDeg: m.sunLonDeg,
      effectiveDayDate: effDate,
      adjustedDtForHour: adapter.toISO(h.adjustedDt),
      preset,
    },
  };
}
