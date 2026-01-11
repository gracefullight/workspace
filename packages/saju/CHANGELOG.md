# @gracefullight/saju

## 1.0.0

### Major Changes

- c849df2: Move adapter from first argument to options object

  BREAKING CHANGE: All public API functions now take datetime as the first argument and adapter as part of the options object.

  Before: `getSaju(adapter, datetime, options)`
  After: `getSaju(datetime, { adapter, ...options })`

  Affected functions:

  - getSaju, getFourPillars
  - yearPillar, monthPillar, hourPillar, effectiveDayDate
  - analyzeSolarTerms, getSolarTermsForYear
  - calculateMajorLuck

## 0.7.0

### Minor Changes

- 78264c2: feat: add Gongmang, Wonjin and activate Mangshin, Geopsal, Jaesal, Hongran, Cheonhui, Jangseong, Banan sinsals

## 0.6.0

### Minor Changes

- b0b1c09: Remove deprecated APIs and add alternativeBalance to YongShen

  BREAKING CHANGES:

  - Removed deprecated types: `TenGod`, `TwelveStage`, `Sinsal`, `YongShenMethod`, `StrengthLevel`, `TransformationStatus`
  - Removed deprecated constants: `TEN_GODS`, `TEN_GOD_HANJA`, `TEN_GOD_ENGLISH`, `STRENGTH_LEVELS`, `STAGE_INFO`
  - Removed deprecated functions: `getTenGod`, `getTwelveStage`

  Migration guide:

  - `TenGod` → `TenGodKey`
  - `TwelveStage` → `TwelveStageKey`
  - `Sinsal` → `SinsalKey`
  - `YongShenMethod` → `YongShenMethodKey`
  - `StrengthLevel` → `StrengthLevelKey`
  - `TransformationStatus` → `TransformationStatusKey`
  - `getTenGod(a, b)` → `getTenGodLabel(getTenGodKey(a, b))`
  - `getTwelveStage()` → `analyzeTwelveStages()`
  - `STAGE_INFO[key]` → `getTwelveStageLabel(key)`
  - `STRENGTH_LEVELS` → `STRENGTH_LEVEL_KEYS`

  New features:

  - Added `alternativeBalance` to `YongShenResult` for formation (종격) cases
  - Exported `getTenGodKey` function for direct ten god key calculation

  Bug fixes:

  - Fixed major luck start age rounding
  - Fixed yongshen calculation for strong day masters (CONTROLS → CONTROLLED_BY)

## 0.5.0

### Minor Changes

- 06c5dfc: Introduce Label objects across all analysis modules

  - TwelveStages, TenGods, Strength, YongShen, SolarTerms, Relations, and Sinsals modules now return Label objects containing hanja (Chinese characters), korean (Korean text), and meaning (description)
  - Replace plain string return values with structured Label objects for better i18n and detailed display support
  - Improve example app UI to display hanja + korean + meaning across all analysis sections

## 0.4.2

### Patch Changes

- 3f1e5c1: Test release pipeline with GH_TOKEN

## 0.4.0

### Minor Changes

- **BREAKING**: Enable mean solar time correction by default in STANDARD_PRESET
  - `useMeanSolarTimeForHour` is now `true` by default
  - This matches the behavior of popular Korean fortune-telling services like 포스텔러
  - If you need the old behavior, create a custom preset with `useMeanSolarTimeForHour: false`

## 0.3.0

### Minor Changes

- Add comprehensive saju analysis features
  - Ten Gods (십신) analysis with hidden stems
  - Strength (신강약) assessment with 9 levels
  - Relations (합충형파해) analysis
  - Major/Yearly Luck (대운/세운) calculation
  - Yongshen (용신) extraction with recommendations
  - Solar Terms (절기) analysis

## 0.2.0

### Minor Changes

- Add lunar calendar conversion functions
  - `getLunarDate()` - Convert solar to lunar date
  - `getSolarDate()` - Convert lunar to solar date
- Improve four pillars calculation accuracy

## 0.1.1

### Patch Changes

- Fix date adapter type exports
- Improve TypeScript definitions

## 0.1.0

### Minor Changes

- Initial release of @gracefullight/saju
  - Implement four pillars calculation (year, month, day, hour)
  - Add date adapter pattern for Luxon and date-fns
  - Create comprehensive test suite
  - Add STANDARD_PRESET and TRADITIONAL_PRESET configurations
  - Include detailed documentation in Korean and English
