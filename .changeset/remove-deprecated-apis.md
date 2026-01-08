---
"@gracefullight/saju": minor
---

Remove deprecated APIs and add alternativeBalance to YongShen

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
