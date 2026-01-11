"use client";

import {
  type BranchSixCombination,
  countElements,
  type Gender,
  getSaju,
  type SajuResult,
  type StemCombination,
} from "@gracefullight/saju";
import { createDateFnsAdapter } from "@gracefullight/saju/adapters/date-fns";
import { fromZonedTime } from "date-fns-tz";
import { useAtom, useSetAtom } from "jotai";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { sajuFormAtom, syncFormToUrlAtom } from "@/store/saju-form";

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

const STEM_KOREAN: Record<string, string> = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
};

const BRANCH_KOREAN: Record<string, string> = {
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
};

function getPillarKorean(pillar: string): string {
  const stem = pillar[0];
  const branch = pillar[1];
  return `${STEM_KOREAN[stem] || stem}${BRANCH_KOREAN[branch] || branch}`;
}

export default function HomePage() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const [formData, setFormData] = useAtom(sajuFormAtom);
  const syncToUrl = useSetAtom(syncFormToUrlAtom);
  const [result, setResult] = useState<SajuResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const birthDate = new Date(formData.year, formData.month - 1, formData.day);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      });
    }
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setFormData({ hour, minute });
  };

  const handleGenderChange = (gender: Gender) => {
    setFormData({ gender });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    syncToUrl();

    try {
      const adapter = await createDateFnsAdapter();
      const birthDateTime = {
        date: fromZonedTime(
          new Date(formData.year, formData.month - 1, formData.day, formData.hour, formData.minute),
          "Asia/Seoul",
        ),
        timeZone: "Asia/Seoul",
      };

      const sajuResult = getSaju(birthDateTime, {
        adapter,
        gender: formData.gender,
        longitudeDeg: SEOUL_LONGITUDE,
      });

      setResult(sajuResult);
    } catch {
      setError(t("form.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
            <LanguageSwitcher />
          </div>
          <p className="text-muted-foreground">{t("description")}</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.submit")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("form.birthdate")}</Label>
                  <DatePicker
                    date={birthDate}
                    onSelect={handleDateChange}
                    placeholder={t("form.select_date")}
                    fromYear={1920}
                    toYear={2025}
                    locale={locale}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("form.birthtime")}</Label>
                  <TimePicker
                    hour={formData.hour}
                    minute={formData.minute}
                    onTimeChange={handleTimeChange}
                    placeholder={t("form.select_time")}
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <Label>{t("form.gender")}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={() => handleGenderChange("male")}
                      className="w-4 h-4 accent-primary"
                    />
                    <span>{t("form.male")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={() => handleGenderChange("female")}
                      className="w-4 h-4 accent-primary"
                    />
                    <span>{t("form.female")}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={loading} className="cursor-pointer">
                  {loading ? t("form.submitting") : t("form.submit")}
                </Button>
              </div>
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
  const t = useTranslations("HomePage");

  const pillars = [
    { label: t("result.year_pillar"), value: result.pillars.year },
    { label: t("result.month_pillar"), value: result.pillars.month },
    { label: t("result.day_pillar"), value: result.pillars.day },
    { label: t("result.hour_pillar"), value: result.pillars.hour },
  ];

  const elementCounts = countElements(result.tenGods);

  const stemCombinations = result.relations.combinations.filter(
    (c): c is StemCombination => c.type.key === "stemCombination",
  );
  const branchSixCombinations = result.relations.combinations.filter(
    (c): c is BranchSixCombination => c.type.key === "sixCombination",
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("result.pillars")}</CardTitle>
          <CardDescription>
            {t("result.pillars_desc", {
              year: result.lunar.lunarYear,
              month: result.lunar.lunarMonth,
              day: result.lunar.lunarDay,
              leap: result.lunar.isLeapMonth ? t("result.leap_month") : "",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {pillars.map((pillar) => (
              <div key={pillar.label} className="bg-secondary rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">{pillar.label}</p>
                <p className="text-3xl font-bold">{pillar.value}</p>
                <p className="text-sm text-primary">{getPillarKorean(pillar.value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("result.ten_gods")}</CardTitle>
          <CardDescription>
            {t("result.ten_gods_desc", { dayMaster: result.tenGods.dayMaster })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["year", "month", "day", "hour"] as const).map((pos) => (
              <div key={pos} className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  {pos === "year"
                    ? t("result.year_pillar")
                    : pos === "month"
                      ? t("result.month_pillar")
                      : pos === "day"
                        ? t("result.day_pillar")
                        : t("result.hour_pillar")}
                </p>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("result.heavenly_stem")}</p>
                    <p className="text-xl font-bold">{result.tenGods[pos].stem.tenGod.hanja}</p>
                    <p className="text-sm text-primary">{result.tenGods[pos].stem.tenGod.korean}</p>
                  </div>
                  <div className="text-center border-t pt-2">
                    <p className="text-xs text-muted-foreground">{t("result.earthly_branch")}</p>
                    <div className="space-y-1">
                      {result.tenGods[pos].branch.hiddenStems.map((h) => (
                        <div key={h.stem}>
                          <span className="font-bold">{h.tenGod.hanja}</span>
                          <span className="text-sm text-primary ml-1">({h.tenGod.korean})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("result.strength")}</CardTitle>
          <CardDescription>{t("result.strength_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-primary text-primary-foreground px-8 py-6 rounded-lg text-center">
              <p className="text-3xl font-bold mb-1">{result.strength.level.hanja}</p>
              <p className="text-lg">{result.strength.level.korean}</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("result.strength_score")}</span>
                <span className="font-bold text-lg">{result.strength.score.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{result.strength.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("result.elements")}</CardTitle>
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
          <CardTitle>{t("result.yongshen")}</CardTitle>
          <CardDescription>{t("result.yongshen_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-accent/20 p-6 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">{t("result.yongshen_primary")}</p>
              <p className={`text-3xl font-bold ${ELEMENT_COLORS[result.yongShen.primary.key]}`}>
                {result.yongShen.primary.hanja}
              </p>
              <p className={`text-lg ${ELEMENT_COLORS[result.yongShen.primary.key]}`}>
                {result.yongShen.primary.korean}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t("result.yongshen_primary_desc")}
              </p>
            </div>
            {result.yongShen.secondary && (
              <div className="flex-1 bg-muted p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("result.yongshen_secondary")}
                </p>
                <p
                  className={`text-3xl font-bold ${ELEMENT_COLORS[result.yongShen.secondary.key]}`}
                >
                  {result.yongShen.secondary.hanja}
                </p>
                <p className={`text-lg ${ELEMENT_COLORS[result.yongShen.secondary.key]}`}>
                  {result.yongShen.secondary.korean}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("result.yongshen_secondary_desc")}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 p-3 bg-secondary rounded-lg">
            <p className="text-sm">
              <span className="text-muted-foreground">{t("result.method")}</span>
              <span className="font-medium">{result.yongShen.method.hanja}</span>
              <span className="text-primary ml-1">({result.yongShen.method.korean})</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("result.twelve_stages")}</CardTitle>
          <CardDescription>{t("result.twelve_stages_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["year", "month", "day", "hour"] as const).map((pos) => (
              <div key={pos} className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {pos === "year"
                    ? t("result.year_pillar")
                    : pos === "month"
                      ? t("result.month_pillar")
                      : pos === "day"
                        ? t("result.day_pillar")
                        : t("result.hour_pillar")}
                </p>
                <p className="text-2xl font-bold mb-1">{result.twelveStages[pos].hanja}</p>
                <p className="text-sm text-primary font-medium mb-2">
                  {result.twelveStages[pos].korean}
                </p>
                <p className="text-xs text-muted-foreground">{result.twelveStages[pos].meaning}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("result.major_luck")}</CardTitle>
          <CardDescription>
            {t("result.major_luck_desc", {
              years: result.majorLuck.startAgeDetail.years,
              months: result.majorLuck.startAgeDetail.months,
            })}
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
          <CardTitle>{t("result.yearly_luck")}</CardTitle>
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
          <CardTitle>{t("result.solar_terms")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">{t("result.current_term")}</p>
              <p className="text-xl font-bold">
                {result.solarTerms.current.korean} ({result.solarTerms.current.hanja})
              </p>
              <p className="text-sm text-muted-foreground">
                {t("result.days_since", { days: result.solarTerms.daysSinceCurrent })}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">{t("result.next_term")}</p>
              <p className="text-xl font-bold">
                {result.solarTerms.next.korean} ({result.solarTerms.next.hanja})
              </p>
              <p className="text-sm text-muted-foreground">
                {t("result.days_until", { days: result.solarTerms.daysUntilNext })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.sinsals.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("result.sinsals")}</CardTitle>
            <CardDescription>{t("result.sinsals_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {(["year", "month", "day", "hour"] as const).map((position) => {
                const pillarSinsals = result.sinsals.matches
                  .filter((s) => s.position === position)
                  .sort((a, b) => {
                    const order = { auspicious: 0, neutral: 1, inauspicious: 2 };
                    return order[a.sinsal.type] - order[b.sinsal.type];
                  });

                return (
                  <div key={position} className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground text-center font-medium border-b pb-1">
                      {position === "year"
                        ? t("result.year_pillar")
                        : position === "month"
                          ? t("result.month_pillar")
                          : position === "day"
                            ? t("result.day_pillar")
                            : t("result.hour_pillar")}
                    </p>
                    {pillarSinsals.map((sinsal, index) => (
                      <div
                        key={`${sinsal.sinsal.key}-${sinsal.position}-${index}`}
                        className={`p-3 rounded-lg text-center ${
                          sinsal.sinsal.type === "auspicious"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : sinsal.sinsal.type === "inauspicious"
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-muted"
                        }`}
                      >
                        <p className="text-xl font-bold mb-1">{sinsal.sinsal.hanja}</p>
                        <p className="text-sm text-primary font-medium">{sinsal.sinsal.korean}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {sinsal.sinsal.meaning}
                        </p>
                      </div>
                    ))}
                    {pillarSinsals.length === 0 && (
                      <div className="p-3 rounded-lg text-center bg-muted/50">
                        <p className="text-xs text-muted-foreground">-</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {stemCombinations.length > 0 ||
      branchSixCombinations.length > 0 ||
      result.relations.clashes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("result.relations")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stemCombinations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("result.stem_combine")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {stemCombinations.map((combo, index) => (
                    <span
                      key={`${combo.pair.join("-")}-${index}`}
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
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("result.branch_six_combine")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {branchSixCombinations.map((combo, index) => (
                    <span
                      key={`${combo.pair.join("-")}-${index}`}
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
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("result.clash")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.relations.clashes.map((clash, index) => (
                    <span
                      key={`${clash.pair.join("-")}-${index}`}
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
