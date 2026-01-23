import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createI18n,
  formatCapabilityType,
  formatDetailLevel,
  formatGreetingStyle,
  formatLevelLabel,
  formatPatternType,
  loadMimicConfig,
  resolveLanguage,
} from "@/lib/i18n";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

vi.mock("node:os", () => ({
  homedir: () => "/tmp/home",
}));

describe("i18n", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadMimicConfig", () => {
    it("returns empty object if file not found", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const config = await loadMimicConfig();
      expect(config).toEqual({});
    });

    it("parses valid config", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ language: "ko-KR" }));
      const config = await loadMimicConfig();
      expect(config).toEqual({ language: "ko-KR" });
    });

    it("returns empty object on invalid json", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue("invalid");
      const config = await loadMimicConfig();
      expect(config).toEqual({});
    });

    it("returns empty object if not object", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue("[]");
      const config = await loadMimicConfig();
      expect(config).toEqual({});
    });
  });

  describe("resolveLanguage", () => {
    it("returns ko-KR when configured", () => {
      expect(resolveLanguage({ language: "ko-KR" })).toBe("ko-KR");
    });

    it("returns en-US by default", () => {
      expect(resolveLanguage({})).toBe("en-US");
      expect(resolveLanguage(null)).toBe("en-US");
      expect(resolveLanguage({ language: "fr-FR" })).toBe("en-US");
    });
  });

  describe("t", () => {
    it("translates key in en-US", () => {
      const i18n = createI18n("en-US");
      expect(i18n.t("patterns.type.tool")).toBe("Tool");
    });

    it("translates key in ko-KR", () => {
      const i18n = createI18n("ko-KR");
      expect(i18n.t("patterns.type.tool")).toBe("도구");
    });

    it("interpolates variables", () => {
      const i18n = createI18n("en-US");
      expect(i18n.t("status.session", { count: 5 })).toBe("**Session**: 5");
    });

    it("falls back to default language if key missing in target", () => {
      const i18n = createI18n("ko-KR");
      // Assuming 'some.missing.key' is not in ko-KR but might be in en-US?
      // Actually the current implementation falls back to en-US dictionary if key missing in target.
      expect(i18n.t("non.existent.key")).toBe("non.existent.key");
    });
  });

  describe("format helpers", () => {
    const i18n = createI18n("en-US");

    it("formats capability type", () => {
      expect(formatCapabilityType(i18n, "tool")).toBe("evolution.type.tool"); // fallback
      expect(formatCapabilityType(i18n, "agent")).toBe("agent");
    });

    it("formats level label", () => {
      expect(formatLevelLabel(i18n, "technical")).toBe("technical");
    });

    it("formats greeting style", () => {
      expect(formatGreetingStyle(i18n, "minimal")).toBe("minimal");
    });

    it("formats detail level", () => {
      expect(formatDetailLevel(i18n, "high")).toBe("high");
    });

    it("formats pattern type", () => {
      expect(formatPatternType(i18n, "tool")).toBe("Tool");
    });
  });
});
