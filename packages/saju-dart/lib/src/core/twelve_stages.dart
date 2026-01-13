import '../types/types.dart';

/// Birth branch for Yang stems
const _yangStemBirthBranch = {
  Stem.jia: Branch.hai,
  Stem.bing: Branch.yin,
  Stem.wu: Branch.yin,
  Stem.geng: Branch.si,
  Stem.ren: Branch.shen,
};

/// Birth branch for Yin stems
const _yinStemBirthBranch = {
  Stem.yi: Branch.wu,
  Stem.ding: Branch.you,
  Stem.ji: Branch.you,
  Stem.xin: Branch.zi,
  Stem.gui: Branch.mao,
};

/// Get twelve stage for a stem-branch combination
TwelveStage getTwelveStage(Stem stem, Branch branch) {
  final isYang = stem.polarity == Polarity.yang;
  final birthBranch = isYang
      ? _yangStemBirthBranch[stem]
      : _yinStemBirthBranch[stem];

  if (birthBranch == null) {
    throw ArgumentError('Invalid stem: $stem');
  }

  final birthIndex = birthBranch.index;
  final targetIndex = branch.index;

  int stageIndex;
  if (isYang) {
    stageIndex = (targetIndex - birthIndex + 12) % 12;
  } else {
    stageIndex = (birthIndex - targetIndex + 12) % 12;
  }

  return TwelveStage.values[stageIndex];
}

/// Twelve stages analysis result
class TwelveStagesResult {
  const TwelveStagesResult({
    required this.year,
    required this.month,
    required this.day,
    required this.hour,
  });

  final TwelveStage year;
  final TwelveStage month;
  final TwelveStage day;
  final TwelveStage hour;
}

/// Analyze twelve stages for all four pillars
TwelveStagesResult analyzeTwelveStages(FourPillars pillars) {
  final dayMaster = pillars.dayMaster;

  return TwelveStagesResult(
    year: getTwelveStage(dayMaster, pillars.year.branch),
    month: getTwelveStage(dayMaster, pillars.month.branch),
    day: getTwelveStage(dayMaster, pillars.day.branch),
    hour: getTwelveStage(dayMaster, pillars.hour.branch),
  );
}
