import type { Merge, SetOptional, Simplify } from "type-fest";
import type { ShareData } from "@/types/data";
import type {
  FacebookOptions,
  KakaoOptions,
  NativeOptions,
  PinterestOptions,
  TwitterOptions,
  WhatsAppOptions,
} from "@/types/options";
import type { SharePlatform } from "@/types/platform";

export interface PlatformOptionsRegistry {
  facebook: FacebookOptions;
  kakao: KakaoOptions;
  twitter: TwitterOptions;
  pinterest: PinterestOptions;
  whatsapp: WhatsAppOptions;
  line: Record<string, never>;
  threads: Record<string, never>;
  native: NativeOptions;
  link: Record<string, never>;
}

export type RequiredOptionsPlatforms = "facebook" | "kakao";
export type NoOptionsPlatforms = "line" | "threads" | "link";
export type OptionalOptionsPlatforms = Exclude<
  SharePlatform,
  RequiredOptionsPlatforms | NoOptionsPlatforms
>;

type ApplyOptionality<T extends Record<SharePlatform, unknown>> = Merge<
  {
    [K in RequiredOptionsPlatforms]: T[K];
  } & {
    [K in OptionalOptionsPlatforms]: SetOptional<T[K], keyof T[K]>;
  } & {
    [K in NoOptionsPlatforms]: Record<string, never>;
  },
  T
>;

export type PlatformOptions = ApplyOptionality<PlatformOptionsRegistry>;

export type PlatformConfig = {
  [K in SharePlatform]: { type: K; options: PlatformOptions[K] };
}[SharePlatform];

export type FormatTextFunction = (data: {
  title?: string;
  description?: string | null;
  url: string;
}) => string;

export type HeadlessShareOptions = {
  [K in SharePlatform as `${K}`]?: PlatformOptionsRegistry[K];
} & {
  textMaxLength?: number;
  formatText?: FormatTextFunction;
};

export interface HeadlessShareListeners {
  onShareError?: (error: unknown) => void;
  onCopySuccess?: () => void;
}

export interface HeadlessShareState {
  isLoading?: boolean;
}

type SharePropsForPlatform<K extends SharePlatform> = Simplify<
  { type: K } & { options?: PlatformOptions[K] } & HeadlessShareListeners
>;

export type UseHeadlessShareProps = {
  [K in SharePlatform]: SharePropsForPlatform<K>;
}[SharePlatform];

export interface ShareStrategy {
  share: (data: ShareData, options?: HeadlessShareOptions) => Promise<void> | void;
}
