"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import {
  getSaju,
  countElements,
  type SajuResult,
  type Gender,
  type StemCombination,
  type BranchSixCombination,
} from "@gracefullight/saju";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SEOUL_LONGITUDE = 126.9778;

const ELEMENT_COLORS: Record<string, string> = {
  wood: "text-[oklch(0.55_0.15_145)]",
  fire: "text-[oklch(0.55_0.2_25)]",
  earth: "text-[oklch(0.6_0.12_75)]",
  metal: "text-[oklch(0.5_0.02_260)]",
  water: "text-[oklch(0.45_0.15_260)]",
};

const ELEMENT_BG_COLORS: Record<string, string> = {
  wood: "bg-[oklch(0.55_0.15_145)]",
  fire: "bg-[oklch(0.55_0.2_25)]",
  earth: "bg-[oklch(0.6_0.12_75)]",
  metal: "bg-[oklch(0.5_0.02_260)]",
  water: "bg-[oklch(0.45_0.15_260)]",
};

const ELEMENT_NAMES: Record<string, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  gender: Gender;
}

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
    year: "1990",
    month: "1",
    day: "1",
    hour: "12",
    minute: "0",
    gender: "male",
  });
  const [result, setResult] = useState<SajuResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const adapter = await createLuxonAdapter();
      const birthDateTime = DateTime.fromObject(
        {
          year: Number.parseInt(formData.year),
          month: Number.parseInt(formData.month),
          day: Number.parseInt(formData.day),
          hour: Number.parseInt(formData.hour),
          minute: Number.parseInt(formData.minute),
        },
        { zone: "Asia/Seoul" },
      );

      const sajuResult = getSaju(adapter, birthDateTime, {
        gender: formData.gender,
        longitudeDeg: SEOUL_LONGITUDE,
      });

      setResult(sajuResult);
    } catch {
      setError("사주 계산 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">사주 분석기</h1>
          <p className="text-muted-foreground">생년월일시와 성별을 입력하여 사주를 분석해보세요</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>생년월일시 입력</CardTitle>
            <CardDescription>출생 정보를 입력해주세요 (도시: 서울)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">년</Label>
                  <Select
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">월</Label>
                  <Select
                    id="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day">일</Label>
                  <Select
                    id="day"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hour">시</Label>
                  <Select
                    id="hour"
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}시
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minute">분</Label>
                  <Select
                    id="minute"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}분
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <Label>성별</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as Gender,
                        })
                      }
                      className="w-4 h-4 accent-primary"
                    />
                    <span>남성</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as Gender,
                        })
                      }
                      className="w-4 h-4 accent-primary"
                    />
                    <span>여성</span>
                  </label>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "분석 중..." : "사주 분석하기"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && <SajuResultDisplay result={result} />}
      </div>
    </main>
  );
}

function SajuResultDisplay({ result }: { result: SajuResult }) {
  const pillars = [
    { label: "년주", value: result.pillars.year },
    { label: "월주", value: result.pillars.month },
    { label: "일주", value: result.pillars.day },
    { label: "시주", value: result.pillars.hour },
  ];

  const elementCounts = countElements(result.tenGods);

  const stemCombinations = result.relations.combinations.filter(
    (c): c is StemCombination => c.type === "천간합",
  );
  const branchSixCombinations = result.relations.combinations.filter(
    (c): c is BranchSixCombination => c.type === "육합",
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>사주 팔자 (四柱八字)</CardTitle>
          <CardDescription>
            음력: {result.lunar.lunarYear}년 {result.lunar.lunarMonth}월 {result.lunar.lunarDay}일
            {result.lunar.isLeapMonth && " (윤달)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {pillars.map((pillar) => (
              <div key={pillar.label} className="bg-secondary rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">{pillar.label}</p>
                <p className="text-3xl font-bold">{pillar.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>십신 분석</CardTitle>
          <CardDescription>일간(日干): {result.tenGods.dayMaster}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {(["year", "month", "day", "hour"] as const).map((pos) => (
              <div key={pos} className="space-y-2">
                <div className="bg-muted p-2 rounded">
                  <p className="text-muted-foreground">천간</p>
                  <p className="font-medium">{result.tenGods[pos].stem.tenGod}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-muted-foreground">지지</p>
                  <p className="font-medium">
                    {result.tenGods[pos].branch.hiddenStems.map((h) => h.tenGod).join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>신강약 판정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-xl font-bold">
              {result.strength.level}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>점수: {result.strength.score.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>오행 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(elementCounts).map(([element, count]) => (
              <div key={element} className="text-center p-4 rounded-lg bg-secondary">
                <div
                  className={`w-8 h-8 rounded-full mx-auto mb-2 ${ELEMENT_BG_COLORS[element]}`}
                />
                <p className={`font-bold ${ELEMENT_COLORS[element]}`}>{ELEMENT_NAMES[element]}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>용신 (用神)</CardTitle>
          <CardDescription>운세 개선에 도움이 되는 오행</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 bg-accent/20 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">용신</p>
              <p className={`text-2xl font-bold ${ELEMENT_COLORS[result.yongShen.primary]}`}>
                {ELEMENT_NAMES[result.yongShen.primary]}
              </p>
            </div>
            {result.yongShen.secondary && (
              <div className="flex-1 bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">희신</p>
                <p className={`text-2xl font-bold ${ELEMENT_COLORS[result.yongShen.secondary]}`}>
                  {ELEMENT_NAMES[result.yongShen.secondary]}
                </p>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">분석 방법: {result.yongShen.method}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>십이운성</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {(["year", "month", "day", "hour"] as const).map((pos) => (
              <div key={pos} className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  {pos === "year"
                    ? "년주"
                    : pos === "month"
                      ? "월주"
                      : pos === "day"
                        ? "일주"
                        : "시주"}
                </p>
                <p className="text-xl font-bold">{result.twelveStages[pos]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>대운 (大運)</CardTitle>
          <CardDescription>
            대운 시작 나이: {result.majorLuck.startAgeDetail.years}세{" "}
            {result.majorLuck.startAgeDetail.months}개월
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {result.majorLuck.pillars.map((luck, index) => (
              <div
                key={`${luck.pillar}-${index}`}
                className="flex-shrink-0 bg-secondary p-3 rounded-lg text-center min-w-[80px]"
              >
                <p className="text-lg font-bold">{luck.pillar}</p>
                <p className="text-sm text-muted-foreground">{luck.startAge}세</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>세운 (歲運)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {result.yearlyLuck.map((luck) => (
              <div key={luck.year} className="bg-muted p-2 rounded text-center text-sm">
                <p className="font-bold">{luck.year}</p>
                <p>{luck.pillar}</p>
                <p className="text-muted-foreground">{luck.age}세</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>절기 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">현재 절기</p>
              <p className="text-xl font-bold">
                {result.solarTerms.current.name} ({result.solarTerms.current.hanja})
              </p>
              <p className="text-sm text-muted-foreground">
                {result.solarTerms.daysSinceCurrent}일 경과
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">다음 절기</p>
              <p className="text-xl font-bold">
                {result.solarTerms.next.name} ({result.solarTerms.next.hanja})
              </p>
              <p className="text-sm text-muted-foreground">
                {result.solarTerms.daysUntilNext}일 후
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.sinsals.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>신살 (神殺)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.sinsals.matches.map((sinsal, index) => (
                <span
                  key={`${sinsal.sinsal}-${index}`}
                  className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm"
                >
                  {sinsal.sinsal}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stemCombinations.length > 0 ||
      branchSixCombinations.length > 0 ||
      result.relations.clashes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>합충 관계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stemCombinations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">천간합</p>
                <div className="flex flex-wrap gap-2">
                  {stemCombinations.map((combo, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {combo.pair[0]}-{combo.pair[1]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {branchSixCombinations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">육합</p>
                <div className="flex flex-wrap gap-2">
                  {branchSixCombinations.map((combo, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {combo.pair[0]}-{combo.pair[1]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.relations.clashes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">충</p>
                <div className="flex flex-wrap gap-2">
                  {result.relations.clashes.map((clash, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                    >
                      {clash.pair[0]}-{clash.pair[1]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
