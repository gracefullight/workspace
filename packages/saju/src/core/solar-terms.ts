import type { DateAdapter } from "@/adapters/date-adapter";
import type { Label } from "@/types";

export const SOLAR_TERM_KEYS = [
  "minorCold",
  "majorCold",
  "springBegins",
  "rainWater",
  "awakeningInsects",
  "vernalEquinox",
  "pureBrightness",
  "grainRain",
  "summerBegins",
  "grainBuds",
  "grainInEar",
  "summerSolstice",
  "minorHeat",
  "majorHeat",
  "autumnBegins",
  "heatStops",
  "whiteDew",
  "autumnalEquinox",
  "coldDew",
  "frostDescends",
  "winterBegins",
  "minorSnow",
  "majorSnow",
  "winterSolstice",
] as const;

export type SolarTermKey = (typeof SOLAR_TERM_KEYS)[number];

export interface SolarTermLabel extends Label<SolarTermKey> {
  longitude: number;
}

const SOLAR_TERM_DATA: Record<SolarTermKey, { korean: string; hanja: string; longitude: number }> =
  {
    minorCold: { korean: "소한", hanja: "小寒", longitude: 285 },
    majorCold: { korean: "대한", hanja: "大寒", longitude: 300 },
    springBegins: { korean: "입춘", hanja: "立春", longitude: 315 },
    rainWater: { korean: "우수", hanja: "雨水", longitude: 330 },
    awakeningInsects: { korean: "경칩", hanja: "驚蟄", longitude: 345 },
    vernalEquinox: { korean: "춘분", hanja: "春分", longitude: 0 },
    pureBrightness: { korean: "청명", hanja: "淸明", longitude: 15 },
    grainRain: { korean: "곡우", hanja: "穀雨", longitude: 30 },
    summerBegins: { korean: "입하", hanja: "立夏", longitude: 45 },
    grainBuds: { korean: "소만", hanja: "小滿", longitude: 60 },
    grainInEar: { korean: "망종", hanja: "芒種", longitude: 75 },
    summerSolstice: { korean: "하지", hanja: "夏至", longitude: 90 },
    minorHeat: { korean: "소서", hanja: "小暑", longitude: 105 },
    majorHeat: { korean: "대서", hanja: "大暑", longitude: 120 },
    autumnBegins: { korean: "입추", hanja: "立秋", longitude: 135 },
    heatStops: { korean: "처서", hanja: "處暑", longitude: 150 },
    whiteDew: { korean: "백로", hanja: "白露", longitude: 165 },
    autumnalEquinox: { korean: "추분", hanja: "秋分", longitude: 180 },
    coldDew: { korean: "한로", hanja: "寒露", longitude: 195 },
    frostDescends: { korean: "상강", hanja: "霜降", longitude: 210 },
    winterBegins: { korean: "입동", hanja: "立冬", longitude: 225 },
    minorSnow: { korean: "소설", hanja: "小雪", longitude: 240 },
    majorSnow: { korean: "대설", hanja: "大雪", longitude: 255 },
    winterSolstice: { korean: "동지", hanja: "冬至", longitude: 270 },
  };

export function getSolarTermLabel(key: SolarTermKey): SolarTermLabel {
  const data = SOLAR_TERM_DATA[key];
  return { key, ...data };
}

export const SOLAR_TERMS = SOLAR_TERM_KEYS.map((key) => getSolarTermLabel(key));

export type SolarTermName = (typeof SOLAR_TERM_DATA)[SolarTermKey]["korean"];
export type SolarTermHanja = (typeof SOLAR_TERM_DATA)[SolarTermKey]["hanja"];

export interface SolarTerm {
  key: SolarTermKey;
  korean: string;
  hanja: string;
  longitude: number;
}

export interface SolarTermDateInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface SolarTermInfo {
  /** Current solar term (the one that has passed) */
  current: SolarTerm;
  /** Date when the current solar term started */
  currentDate: SolarTermDateInfo;
  /** Milliseconds timestamp of current solar term (for calculations) */
  currentMillis: number;
  /** Days elapsed since the current solar term */
  daysSinceCurrent: number;
  /** Next solar term (upcoming) */
  next: SolarTerm;
  /** Date when the next solar term will start */
  nextDate: SolarTermDateInfo;
  /** Milliseconds timestamp of next solar term (for calculations) */
  nextMillis: number;
  /** Days until the next solar term */
  daysUntilNext: number;
  /** Previous "節" (Jie) - the solar term that marks month boundary (for major luck calculation) */
  prevJie: SolarTerm;
  /** Date of previous Jie */
  prevJieDate: SolarTermDateInfo;
  /** Milliseconds timestamp of previous Jie */
  prevJieMillis: number;
  /** Next "節" (Jie) - the solar term that marks month boundary (for major luck calculation) */
  nextJie: SolarTerm;
  /** Date of next Jie */
  nextJieDate: SolarTermDateInfo;
  /** Milliseconds timestamp of next Jie */
  nextJieMillis: number;
}

function normDeg(x: number): number {
  x %= 360;
  return x < 0 ? x + 360 : x;
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

/**
 * Find the exact UTC datetime when a solar term occurs
 */
function findSolarTermDate<T>(
  adapter: DateAdapter<T>,
  term: SolarTerm,
  year: number,
  month: number,
): T {
  // Approximate dates for solar terms
  const startUtc = adapter.createUTC(year, month, 1, 0, 0, 0);
  const endUtc = adapter.createUTC(year, month, 28, 0, 0, 0);
  return findTermUtc(adapter, term.longitude, startUtc, endUtc);
}

/**
 * Get the solar term index from solar longitude
 */
function getSolarTermIndexFromLongitude(longitude: number): number {
  // Each term is 15 degrees apart
  // 소한 (285°) is index 0
  // Normalize to start from 소한
  const normalized = (longitude - 285 + 360) % 360;
  return Math.floor(normalized / 15);
}

/**
 * Get approximate month for a solar term
 */
function getApproximateMonth(termIndex: number): number {
  // 소한(0) -> 1월, 대한(1) -> 1월, 입춘(2) -> 2월, ...
  const months = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12];
  return months[termIndex];
}

function isJie(termIndex: number): boolean {
  return termIndex % 2 === 0;
}

function findPrevJie<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  currentIndex: number,
): { term: SolarTerm; termLocal: T } {
  const year = adapter.getYear(dtLocal);
  const zone = adapter.getZoneName(dtLocal);
  const dtMillis = adapter.toMillis(dtLocal);

  let jieIndex = isJie(currentIndex) ? currentIndex : currentIndex - 1;
  if (jieIndex < 0) jieIndex = 22;

  for (let attempts = 0; attempts < 3; attempts++) {
    const term = SOLAR_TERMS[jieIndex];
    const month = getApproximateMonth(jieIndex);

    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const tryYear = year - yearOffset;
      const termUtc = findSolarTermDate(adapter, term, tryYear, month);
      const termLocal = adapter.setZone(termUtc, zone);

      if (adapter.toMillis(termLocal) <= dtMillis) {
        return { term, termLocal };
      }
    }

    jieIndex = jieIndex - 2;
    if (jieIndex < 0) jieIndex += 24;
  }

  const fallbackTerm = SOLAR_TERMS[jieIndex];
  const fallbackMonth = getApproximateMonth(jieIndex);
  const fallbackUtc = findSolarTermDate(adapter, fallbackTerm, year - 1, fallbackMonth);
  return { term: fallbackTerm, termLocal: adapter.setZone(fallbackUtc, zone) };
}

function findNextJie<T>(
  adapter: DateAdapter<T>,
  dtLocal: T,
  currentIndex: number,
): { term: SolarTerm; termLocal: T } {
  const year = adapter.getYear(dtLocal);
  const zone = adapter.getZoneName(dtLocal);
  const dtMillis = adapter.toMillis(dtLocal);

  let jieIndex = isJie(currentIndex) ? (currentIndex + 2) % 24 : (currentIndex + 1) % 24;

  for (let attempts = 0; attempts < 3; attempts++) {
    const term = SOLAR_TERMS[jieIndex];
    const month = getApproximateMonth(jieIndex);

    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const tryYear = year + yearOffset;
      const termUtc = findSolarTermDate(adapter, term, tryYear, month);
      const termLocal = adapter.setZone(termUtc, zone);

      if (adapter.toMillis(termLocal) > dtMillis) {
        return { term, termLocal };
      }
    }

    jieIndex = (jieIndex + 2) % 24;
  }

  const fallbackTerm = SOLAR_TERMS[jieIndex];
  const fallbackMonth = getApproximateMonth(jieIndex);
  const fallbackUtc = findSolarTermDate(adapter, fallbackTerm, year + 1, fallbackMonth);
  return { term: fallbackTerm, termLocal: adapter.setZone(fallbackUtc, zone) };
}

function toDateInfo<T>(adapter: DateAdapter<T>, dt: T): SolarTermDateInfo {
  return {
    year: adapter.getYear(dt),
    month: adapter.getMonth(dt),
    day: adapter.getDay(dt),
    hour: adapter.getHour(dt),
    minute: adapter.getMinute(dt),
  };
}

export function analyzeSolarTerms<T>(
  dtLocal: T,
  { adapter }: { adapter: DateAdapter<T> },
): SolarTermInfo {
  const dtUtc = adapter.toUTC(dtLocal);
  const currentLongitude = sunApparentLongitude(adapter, dtUtc);

  const currentIndex = getSolarTermIndexFromLongitude(currentLongitude);
  const currentTerm = SOLAR_TERMS[currentIndex];
  const nextIndex = (currentIndex + 1) % 24;
  const nextTerm = SOLAR_TERMS[nextIndex];

  const year = adapter.getYear(dtLocal);
  const currentMonth = getApproximateMonth(currentIndex);
  const nextMonth = getApproximateMonth(nextIndex);

  let currentYear = year;
  if (currentMonth === 12 && adapter.getMonth(dtLocal) <= 2) {
    currentYear = year - 1;
  } else if (currentMonth === 1 && adapter.getMonth(dtLocal) >= 11) {
    currentYear = year + 1;
  }

  let currentTermUtc = findSolarTermDate(adapter, currentTerm, currentYear, currentMonth);
  let currentTermLocal = adapter.setZone(currentTermUtc, adapter.getZoneName(dtLocal));

  if (adapter.toMillis(currentTermLocal) > adapter.toMillis(dtLocal)) {
    if (currentMonth <= 2) {
      currentYear -= 1;
    }
    currentTermUtc = findSolarTermDate(adapter, currentTerm, currentYear, currentMonth);
    currentTermLocal = adapter.setZone(currentTermUtc, adapter.getZoneName(dtLocal));
  }

  let nextYear = year;
  if (nextMonth === 1 && adapter.getMonth(dtLocal) >= 11) {
    nextYear = year + 1;
  }

  let nextTermUtc = findSolarTermDate(adapter, nextTerm, nextYear, nextMonth);
  let nextTermLocal = adapter.setZone(nextTermUtc, adapter.getZoneName(dtLocal));

  if (adapter.toMillis(nextTermLocal) <= adapter.toMillis(dtLocal)) {
    if (nextMonth >= 11) {
      nextYear += 1;
    }
    nextTermUtc = findSolarTermDate(adapter, nextTerm, nextYear, nextMonth);
    nextTermLocal = adapter.setZone(nextTermUtc, adapter.getZoneName(dtLocal));
  }

  const { term: prevJie, termLocal: prevJieLocal } = findPrevJie(adapter, dtLocal, currentIndex);
  const { term: nextJie, termLocal: nextJieLocal } = findNextJie(adapter, dtLocal, currentIndex);

  const msPerDay = 24 * 60 * 60 * 1000;
  const currentMillis = adapter.toMillis(currentTermLocal);
  const nextMillis = adapter.toMillis(nextTermLocal);
  const dtMillis = adapter.toMillis(dtLocal);

  const daysSinceCurrent = Math.floor((dtMillis - currentMillis) / msPerDay);
  const daysUntilNext = Math.ceil((nextMillis - dtMillis) / msPerDay);

  return {
    current: { ...currentTerm },
    currentDate: toDateInfo(adapter, currentTermLocal),
    currentMillis,
    daysSinceCurrent,
    next: { ...nextTerm },
    nextDate: toDateInfo(adapter, nextTermLocal),
    nextMillis,
    daysUntilNext,
    prevJie: { ...prevJie },
    prevJieDate: toDateInfo(adapter, prevJieLocal),
    prevJieMillis: adapter.toMillis(prevJieLocal),
    nextJie: { ...nextJie },
    nextJieDate: toDateInfo(adapter, nextJieLocal),
    nextJieMillis: adapter.toMillis(nextJieLocal),
  };
}

/**
 * Get all solar term dates for a given year
 */
export function getSolarTermsForYear<T>(
  year: number,
  { adapter, timezone }: { adapter: DateAdapter<T>; timezone: string },
): Array<{
  term: SolarTerm;
  date: SolarTermDateInfo;
}> {
  const result: Array<{
    term: SolarTerm;
    date: SolarTermDateInfo;
  }> = [];

  for (let i = 0; i < SOLAR_TERMS.length; i++) {
    const term = SOLAR_TERMS[i];
    const month = getApproximateMonth(i);

    // Handle year boundary for 소한/대한 (January terms)
    const termYear = month === 1 && i < 2 ? year : month === 12 ? year : year;

    const termUtc = findSolarTermDate(adapter, term, termYear, month);
    const termLocal = adapter.setZone(termUtc, timezone);

    result.push({
      term: { ...term },
      date: toDateInfo(adapter, termLocal),
    });
  }

  return result;
}
