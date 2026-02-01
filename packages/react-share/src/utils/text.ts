export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

import type { FormatTextFunction } from "@/types";

export function formatShareText(
  title: string | undefined,
  description: string | undefined | null,
  url: string,
  options?: {
    descriptionMaxLength?: number;
    separator?: string;
    formatText?: FormatTextFunction;
  },
): string {
  const { descriptionMaxLength = 100, separator = "\n", formatText } = options ?? {};

  if (formatText) {
    return formatText({ title, description, url });
  }

  const truncatedDescription = description
    ? truncateText(description, descriptionMaxLength)
    : undefined;

  if (truncatedDescription && title) {
    return `${title}${separator}${truncatedDescription}${separator}${url}`;
  }

  return `${title || ""}${separator}${url}`.trim();
}

export function formatTweetText(
  title: string | undefined,
  description: string | undefined | null,
  options?: {
    descriptionMaxLength?: number;
    formatText?: FormatTextFunction;
  },
): string {
  const { descriptionMaxLength = 60, formatText } = options ?? {};

  if (formatText) {
    return formatText({ title, description, url: "" });
  }

  const truncatedDescription = description
    ? truncateText(description, descriptionMaxLength)
    : undefined;

  if (truncatedDescription && title) {
    return `${title} - ${truncatedDescription}`;
  }

  return title || "";
}
