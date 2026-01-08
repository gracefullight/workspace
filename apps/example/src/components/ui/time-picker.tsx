"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";

interface TimePickerProps {
  hour: number;
  minute: number;
  onTimeChange: (hour: number, minute: number) => void;
  placeholder?: string;
}

export function TimePicker({
  hour,
  minute,
  onTimeChange,
  placeholder = "시간 선택",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal cursor-pointer")}
        >
          <Clock className="mr-2 size-4" />
          {formatTime(hour, minute)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">시</span>
            <Select
              value={hour.toString()}
              onChange={(e) => onTimeChange(Number(e.target.value), minute)}
              className="w-20"
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h.toString().padStart(2, "0")}
                </option>
              ))}
            </Select>
          </div>
          <span className="text-xl mt-5">:</span>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">분</span>
            <Select
              value={minute.toString()}
              onChange={(e) => onTimeChange(hour, Number(e.target.value))}
              className="w-20"
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, "0")}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
