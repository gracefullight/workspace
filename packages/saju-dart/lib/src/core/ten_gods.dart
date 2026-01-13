import '../types/types.dart';

/// Determine ten god relationship between day master and target stem
TenGod getTenGodKey(Stem dayMaster, Stem targetStem) {
  final dmElement = dayMaster.element;
  final dmPolarity = dayMaster.polarity;
  final targetElement = targetStem.element;
  final targetPolarity = targetStem.polarity;

  final samePolarity = dmPolarity == targetPolarity;

  // Same element
  if (dmElement == targetElement) {
    return samePolarity ? TenGod.companion : TenGod.robWealth;
  }

  // Day master generates target
  if (dmElement.generates == targetElement) {
    return samePolarity ? TenGod.eatingGod : TenGod.hurtingOfficer;
  }

  // Day master controls target
  if (dmElement.controls == targetElement) {
    return samePolarity ? TenGod.indirectWealth : TenGod.directWealth;
  }

  // Target controls day master
  if (targetElement.controls == dmElement) {
    return samePolarity ? TenGod.sevenKillings : TenGod.directOfficer;
  }

  // Target generates day master
  if (targetElement.generates == dmElement) {
    return samePolarity ? TenGod.indirectSeal : TenGod.directSeal;
  }

  throw ArgumentError(
    'Unable to determine ten god relationship: $dayMaster -> $targetStem',
  );
}

/// Ten god info for a stem
class StemTenGod {
  const StemTenGod({
    required this.stem,
    required this.tenGod,
  });

  final Stem stem;
  final TenGod tenGod;
}

/// Ten god info for a branch (with hidden stems)
class BranchTenGod {
  const BranchTenGod({
    required this.branch,
    required this.tenGod,
    required this.hiddenStems,
  });

  final Branch branch;
  final TenGod tenGod;
  final List<StemTenGod> hiddenStems;
}

/// Pillar ten gods analysis
class PillarTenGods {
  const PillarTenGods({
    required this.stem,
    required this.branch,
  });

  final StemTenGod stem;
  final BranchTenGod branch;
}

/// Day master info (special case - not a ten god)
class DayMasterInfo {
  const DayMasterInfo({
    required this.stem,
  });

  final Stem stem;
}

/// Day pillar ten gods (day stem is day master, not a ten god)
class DayPillarTenGods {
  const DayPillarTenGods({
    required this.dayMaster,
    required this.branch,
  });

  final DayMasterInfo dayMaster;
  final BranchTenGod branch;
}

/// Full four pillars ten gods analysis
class FourPillarsTenGods {
  const FourPillarsTenGods({
    required this.year,
    required this.month,
    required this.day,
    required this.hour,
    required this.dayMaster,
  });

  final PillarTenGods year;
  final PillarTenGods month;
  final DayPillarTenGods day;
  final PillarTenGods hour;
  final Stem dayMaster;
}

/// Analyze ten gods for a pillar
PillarTenGods _analyzePillar(Stem dayMaster, Pillar pillar) {
  final stemTenGod = getTenGodKey(dayMaster, pillar.stem);

  final hiddenStems = HiddenStems.forBranch(pillar.branch);
  final hiddenStemTenGods = hiddenStems
      .map(
        (hs) => StemTenGod(
          stem: hs.stem,
          tenGod: getTenGodKey(dayMaster, hs.stem),
        ),
      )
      .toList();

  final branchTenGod = hiddenStemTenGods.isNotEmpty
      ? hiddenStemTenGods.first.tenGod
      : TenGod.companion;

  return PillarTenGods(
    stem: StemTenGod(stem: pillar.stem, tenGod: stemTenGod),
    branch: BranchTenGod(
      branch: pillar.branch,
      tenGod: branchTenGod,
      hiddenStems: hiddenStemTenGods,
    ),
  );
}

/// Analyze ten gods for all four pillars
FourPillarsTenGods analyzeTenGods(FourPillars pillars) {
  final dayMaster = pillars.dayMaster;

  final yearAnalysis = _analyzePillar(dayMaster, pillars.year);
  final monthAnalysis = _analyzePillar(dayMaster, pillars.month);
  final hourAnalysis = _analyzePillar(dayMaster, pillars.hour);

  // Day pillar - stem is day master, branch has ten gods
  final dayHiddenStems = HiddenStems.forBranch(pillars.day.branch);
  final dayHiddenStemTenGods = dayHiddenStems
      .map(
        (hs) => StemTenGod(
          stem: hs.stem,
          tenGod: getTenGodKey(dayMaster, hs.stem),
        ),
      )
      .toList();

  final dayBranchTenGod = dayHiddenStemTenGods.isNotEmpty
      ? dayHiddenStemTenGods.first.tenGod
      : TenGod.companion;

  final dayAnalysis = DayPillarTenGods(
    dayMaster: DayMasterInfo(stem: dayMaster),
    branch: BranchTenGod(
      branch: pillars.day.branch,
      tenGod: dayBranchTenGod,
      hiddenStems: dayHiddenStemTenGods,
    ),
  );

  return FourPillarsTenGods(
    year: yearAnalysis,
    month: monthAnalysis,
    day: dayAnalysis,
    hour: hourAnalysis,
    dayMaster: dayMaster,
  );
}

/// Count ten gods occurrences
Map<TenGod, int> countTenGods(FourPillarsTenGods analysis) {
  final counts = <TenGod, int>{};
  for (final tenGod in TenGod.values) {
    counts[tenGod] = 0;
  }

  // Count stems (excluding day master)
  counts[analysis.year.stem.tenGod] = counts[analysis.year.stem.tenGod]! + 1;
  counts[analysis.month.stem.tenGod] = counts[analysis.month.stem.tenGod]! + 1;
  counts[analysis.hour.stem.tenGod] = counts[analysis.hour.stem.tenGod]! + 1;

  // Count branches (main hidden stem only)
  counts[analysis.year.branch.tenGod] = counts[analysis.year.branch.tenGod]! + 1;
  counts[analysis.month.branch.tenGod] =
      counts[analysis.month.branch.tenGod]! + 1;
  counts[analysis.day.branch.tenGod] = counts[analysis.day.branch.tenGod]! + 1;
  counts[analysis.hour.branch.tenGod] = counts[analysis.hour.branch.tenGod]! + 1;

  return counts;
}

/// Count elements occurrences
Map<Element, int> countElements(FourPillars pillars) {
  final counts = <Element, int>{};
  for (final element in Element.values) {
    counts[element] = 0;
  }

  // Count stems
  for (final stem in pillars.stems) {
    counts[stem.element] = counts[stem.element]! + 1;
  }

  // Count branches
  for (final branch in pillars.branches) {
    counts[branch.element] = counts[branch.element]! + 1;
  }

  return counts;
}
