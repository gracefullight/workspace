import '../types/types.dart';
import 'ten_gods.dart';

/// Seasonal element type (includes wet/dry earth distinction)
enum _SeasonalElement {
  wood,
  fire,
  wetEarth,
  dryEarth,
  metal,
  water,
}

/// Get seasonal element from month branch
_SeasonalElement _getSeasonalElement(Branch monthBranch) {
  return switch (monthBranch) {
    Branch.yin => _SeasonalElement.wood,
    Branch.mao => _SeasonalElement.wood,
    Branch.chen => _SeasonalElement.wetEarth,
    Branch.si => _SeasonalElement.fire,
    Branch.wu => _SeasonalElement.fire,
    Branch.wei => _SeasonalElement.dryEarth,
    Branch.shen => _SeasonalElement.metal,
    Branch.you => _SeasonalElement.metal,
    Branch.xu => _SeasonalElement.dryEarth,
    Branch.hai => _SeasonalElement.water,
    Branch.zi => _SeasonalElement.water,
    Branch.chou => _SeasonalElement.wetEarth,
  };
}

/// Monthly strength multiplier table
double _getMonthlyStrengthMultiplier(Element dayMasterElement, Branch monthBranch) {
  final seasonal = _getSeasonalElement(monthBranch);

  final strengthTable = <Element, Map<_SeasonalElement, double>>{
    Element.wood: {
      _SeasonalElement.wood: 1.0,
      _SeasonalElement.fire: 0.3,
      _SeasonalElement.wetEarth: 0.5,
      _SeasonalElement.dryEarth: 0.2,
      _SeasonalElement.metal: 0.1,
      _SeasonalElement.water: 0.7,
    },
    Element.fire: {
      _SeasonalElement.wood: 0.7,
      _SeasonalElement.fire: 1.0,
      _SeasonalElement.wetEarth: 0.3,
      _SeasonalElement.dryEarth: 0.5,
      _SeasonalElement.metal: 0.1,
      _SeasonalElement.water: 0.1,
    },
    Element.earth: {
      _SeasonalElement.wood: 0.1,
      _SeasonalElement.fire: 0.7,
      _SeasonalElement.wetEarth: 0.8,
      _SeasonalElement.dryEarth: 1.0,
      _SeasonalElement.metal: 0.3,
      _SeasonalElement.water: 0.1,
    },
    Element.metal: {
      _SeasonalElement.wood: 0.1,
      _SeasonalElement.fire: 0.1,
      _SeasonalElement.wetEarth: 0.5,
      _SeasonalElement.dryEarth: 0.7,
      _SeasonalElement.metal: 1.0,
      _SeasonalElement.water: 0.3,
    },
    Element.water: {
      _SeasonalElement.wood: 0.3,
      _SeasonalElement.fire: 0.1,
      _SeasonalElement.wetEarth: 0.2,
      _SeasonalElement.dryEarth: 0.1,
      _SeasonalElement.metal: 0.7,
      _SeasonalElement.water: 1.0,
    },
  };

  return strengthTable[dayMasterElement]?[seasonal] ?? 0.5;
}

/// Calculate root strength (통근) for a branch
double _calculateRootStrength(Stem dayMaster, Branch branch) {
  final dayMasterElement = dayMaster.element;
  final dayMasterPolarity = dayMaster.polarity;

  final hiddenStems = HiddenStems.forBranch(branch);
  var strength = 0.0;

  for (final hs in hiddenStems) {
    final hsElement = hs.stem.element;
    final hsPolarity = hs.stem.polarity;

    if (hsElement == dayMasterElement) {
      // Same element
      if (hsPolarity == dayMasterPolarity) {
        strength += hs.weight * 1.0;
      } else {
        strength += hs.weight * 0.7;
      }
    } else if (hsElement.generates == dayMasterElement) {
      // Hidden stem generates day master
      strength += hs.weight * 0.5;
    }
  }

  return strength;
}

/// Check if stem appears in the list
bool _isTransparent(Stem stem, List<Stem> allStems) {
  return allStems.contains(stem);
}

/// Helpful ten gods (help day master)
const _helpfulTenGods = [
  TenGod.companion,
  TenGod.robWealth,
  TenGod.directSeal,
  TenGod.indirectSeal,
];

/// Weakening ten gods
const _weakeningTenGods = [
  TenGod.eatingGod,
  TenGod.hurtingOfficer,
  TenGod.indirectWealth,
  TenGod.directWealth,
  TenGod.sevenKillings,
  TenGod.directOfficer,
];

bool _isHelpfulTenGod(TenGod tenGod) => _helpfulTenGods.contains(tenGod);
bool _isWeakeningTenGod(TenGod tenGod) => _weakeningTenGods.contains(tenGod);

/// Strength factors
class StrengthFactors {
  const StrengthFactors({
    required this.deukryeong,
    required this.deukji,
    required this.deukse,
    required this.tonggeun,
    required this.helpCount,
    required this.weakenCount,
  });

  /// Monthly strength (득령) 0-1
  final double deukryeong;

  /// Position strength (득지)
  final double deukji;

  /// Supporting stems (득세)
  final int deukse;

  /// Root strength (통근)
  final double tonggeun;

  /// Helpful ten gods count
  final int helpCount;

  /// Weakening ten gods count
  final int weakenCount;
}

/// Strength analysis result
class StrengthResult {
  const StrengthResult({
    required this.level,
    required this.score,
    required this.factors,
    required this.description,
  });

  final StrengthLevel level;
  final double score;
  final StrengthFactors factors;
  final String description;
}

/// Analyze day master strength
StrengthResult analyzeStrength(FourPillars pillars) {
  final dayMaster = pillars.dayMaster;
  final dayMasterElement = dayMaster.element;
  final monthBranch = pillars.month.branch;

  // 1. 득령 (deukryeong) - monthly strength
  final deukryeong = _getMonthlyStrengthMultiplier(dayMasterElement, monthBranch);

  // 2. 통근 (tonggeun) - root strength in all branches
  var tonggeun = 0.0;
  for (final branch in pillars.branches) {
    tonggeun += _calculateRootStrength(dayMaster, branch);
  }

  // 3. 투간 (transparent bonus) - hidden stems appearing in pillars
  final allStems = pillars.stems;
  final monthHiddenStems = HiddenStems.forBranch(monthBranch);
  var transparentBonus = 0.0;
  for (final hs in monthHiddenStems) {
    if (_isTransparent(hs.stem, allStems)) {
      final tenGod = getTenGodKey(dayMaster, hs.stem);
      if (_isHelpfulTenGod(tenGod)) {
        transparentBonus += hs.weight * 0.3;
      }
    }
  }

  // 4. 득지 (deukji) - position strength (day and hour branches)
  var deukji = 0.0;
  deukji += _calculateRootStrength(dayMaster, pillars.day.branch);
  deukji += _calculateRootStrength(dayMaster, pillars.hour.branch);

  // 5. 득세 (deukse) - supporting stems count
  var deukse = 0;
  final otherStems = [pillars.year.stem, pillars.month.stem, pillars.hour.stem];
  for (final stem in otherStems) {
    final tenGod = getTenGodKey(dayMaster, stem);
    if (_isHelpfulTenGod(tenGod)) {
      deukse += 1;
    }
  }

  // 6. Count helpful and weakening ten gods
  var helpCount = 0;
  var weakenCount = 0;

  for (final stem in otherStems) {
    final tenGod = getTenGodKey(dayMaster, stem);
    if (_isHelpfulTenGod(tenGod)) helpCount++;
    if (_isWeakeningTenGod(tenGod)) weakenCount++;
  }

  for (final branch in pillars.branches) {
    final hiddenStems = HiddenStems.forBranch(branch);
    if (hiddenStems.isNotEmpty) {
      final mainStem = hiddenStems.first.stem;
      final tenGod = getTenGodKey(dayMaster, mainStem);
      if (_isHelpfulTenGod(tenGod)) helpCount++;
      if (_isWeakeningTenGod(tenGod)) weakenCount++;
    }
  }

  // Calculate score
  var score = 0.0;
  score += deukryeong * 35;
  score += tonggeun * 20;
  score += transparentBonus * 15;
  score += deukse * 8;
  score += helpCount * 5;
  score -= weakenCount * 6;
  score = (score * 10).round() / 10;

  // Determine strength level
  final level = switch (score) {
    <= 10 => StrengthLevel.extremelyWeak,
    <= 20 => StrengthLevel.veryWeak,
    <= 30 => StrengthLevel.weak,
    <= 38 => StrengthLevel.neutralWeak,
    <= 45 => StrengthLevel.neutral,
    <= 55 => StrengthLevel.neutralStrong,
    <= 70 => StrengthLevel.strong,
    <= 85 => StrengthLevel.veryStrong,
    _ => StrengthLevel.extremelyStrong,
  };

  final factors = StrengthFactors(
    deukryeong: (deukryeong * 100).round() / 100,
    deukji: (deukji * 100).round() / 100,
    deukse: deukse,
    tonggeun: (tonggeun * 100).round() / 100,
    helpCount: helpCount,
    weakenCount: weakenCount,
  );

  // Build description
  final deukryeongDesc =
      deukryeong >= 0.7 ? '득령' : (deukryeong >= 0.4 ? '반득령' : '실령');
  var description =
      '일간 ${dayMaster.hanja}(${dayMasterElement.korean}), $deukryeongDesc(${(deukryeong * 100).round()}%)';
  if (tonggeun > 0) {
    description += ', 통근(${(tonggeun * 100).round() / 100})';
  }
  if (deukse > 0) {
    description += ', 득세($deukse)';
  }

  return StrengthResult(
    level: level,
    score: score,
    factors: factors,
    description: description,
  );
}
