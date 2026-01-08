import { atom } from "jotai";
import { atomWithLocation } from "jotai-location";
import type { Gender } from "@gracefullight/saju";

export interface SajuFormData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
}

const locationAtom = atomWithLocation();

const DEFAULT_FORM: SajuFormData = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  gender: "male",
};

function parseQueryToForm(searchParams: URLSearchParams): Partial<SajuFormData> {
  const result: Partial<SajuFormData> = {};

  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const day = searchParams.get("day");
  const hour = searchParams.get("hour");
  const minute = searchParams.get("minute");
  const gender = searchParams.get("gender");

  if (year) result.year = Number.parseInt(year, 10);
  if (month) result.month = Number.parseInt(month, 10);
  if (day) result.day = Number.parseInt(day, 10);
  if (hour) result.hour = Number.parseInt(hour, 10);
  if (minute) result.minute = Number.parseInt(minute, 10);
  if (gender && (gender === "male" || gender === "female")) {
    result.gender = gender;
  }

  return result;
}

export const sajuFormAtom = atom(
  (get) => {
    const location = get(locationAtom);
    const searchParams = new URLSearchParams(location.searchParams?.toString() || "");
    const fromUrl = parseQueryToForm(searchParams);

    return {
      ...DEFAULT_FORM,
      ...fromUrl,
    };
  },
  (get, set, update: Partial<SajuFormData>) => {
    const current = get(sajuFormAtom);
    const newForm = { ...current, ...update };

    const searchParams = new URLSearchParams();
    searchParams.set("year", newForm.year.toString());
    searchParams.set("month", newForm.month.toString());
    searchParams.set("day", newForm.day.toString());
    searchParams.set("hour", newForm.hour.toString());
    searchParams.set("minute", newForm.minute.toString());
    searchParams.set("gender", newForm.gender);

    set(locationAtom, (prev) => ({
      ...prev,
      searchParams,
    }));
  },
);

export const birthDateAtom = atom((get) => {
  const form = get(sajuFormAtom);
  return new Date(form.year, form.month - 1, form.day);
});

export const syncFormToUrlAtom = atom(null, (get, set) => {
  const form = get(sajuFormAtom);
  set(sajuFormAtom, form);
});
