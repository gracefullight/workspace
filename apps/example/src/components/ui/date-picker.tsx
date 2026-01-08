"use client";

import * as React from "react";
import type { Locale } from "date-fns";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  locale?: string;
}

const DATE_FNS_LOCALES: Record<string, Locale> = {
  ko: ko,
  en: enUS,
};

export function DatePicker({
  date,
  onSelect,
  placeholder = "날짜 선택",
  fromYear = 1920,
  toYear = 2025,
  locale = "ko",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dateFnsLocale = DATE_FNS_LOCALES[locale] || ko;

  const formatDate = (d: Date) => {
    return locale === "ko"
      ? format(d, "yyyy년 M월 d일", { locale: dateFnsLocale })
      : format(d, "MMMM d, yyyy", { locale: dateFnsLocale });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal cursor-pointer",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? formatDate(date) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect(selectedDate);
            setOpen(false);
          }}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          defaultMonth={date}
          locale={dateFnsLocale}
        />
      </PopoverContent>
    </Popover>
  );
}
