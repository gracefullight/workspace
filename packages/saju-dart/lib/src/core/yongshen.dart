import '../types/types.dart';
import 'strength.dart';

/// Season from month branch
enum _Season { spring, summer, autumn, winter }

_Season _getSeason(Branch monthBranch) {
  return switch (monthBranch) {
    Branch.yin || Branch.mao || Branch.chen => _Season.spring,
    Branch.si || Branch.wu || Branch.wei => _Season.summer,
    Branch.shen || Branch.you || Branch.xu => _Season.autumn,
    Branch.hai || Branch.zi || Branch.chou => _Season.winter,
  };
}

/// Johu (調候) yongshen by season and day master element
const _johuYongshen = {
  _Season.spring: {
    Element.wood: [Element.fire, Element.water],
    Element.fire: [Element.water, Element.wood],
    Element.earth: [Element.fire, Element.wood],
    Element.metal: [Element.fire, Element.earth],
    Element.water: [Element.fire, Element.metal],
  },
  _Season.summer: {
    Element.wood: [Element.water, Element.metal],
    Element.fire: [Element.water, Element.metal],
    Element.earth: [Element.water, Element.metal],
    Element.metal: [Element.water, Element.earth],
    Element.water: [Element.metal, Element.water],
  },
  _Season.autumn: {
    Element.wood: [Element.water, Element.fire],
    Element.fire: [Element.wood, Element.earth],
    Element.earth: [Element.fire, Element.water],
    Element.metal: [Element.fire, Element.water],
    Element.water: [Element.fire, Element.metal],
  },
  _Season.winter: {
    Element.wood: [Element.fire, Element.earth],
    Element.fire: [Element.wood, Element.earth],
    Element.earth: [Element.fire, Element.wood],
    Element.metal: [Element.fire, Element.earth],
    Element.water: [Element.fire, Element.earth],
  },
};

/// Get yokbu (억부) yongshen based on strength
({Element primary, Element? secondary}) _getYokbuYongshen(
  Element dayMasterElement,
  StrengthLevel level,
) {
  if (level.isStrong) {
    // Strong: need to weaken - use controlling element and exhaust
    final primary = dayMasterElement.controlledBy;
    final secondary = dayMasterElement.generates;
    return (primary: primary, secondary: secondary);
  } else {
    // Weak: need to strengthen - use generating element and same
    final primary = dayMasterElement.generatedBy;
    final secondary = dayMasterElement;
    return (primary: primary, secondary: secondary);
  }
}

/// Check for special formation (종격)
({bool isSpecial, String? type, Element? followElement}) _hasSpecialFormation(
  Element dayMasterElement,
  StrengthLevel level,
  List<Element> allBranchElements,
) {
  if (level == StrengthLevel.extremelyWeak) {
    final elementCounts = <Element, int>{};
    for (final elem in Element.values) {
      elementCounts[elem] = 0;
    }
    for (final elem in allBranchElements) {
      elementCounts[elem] = elementCounts[elem]! + 1;
    }

    Element? dominantElement;
    var maxCount = 0;
    for (final entry in elementCounts.entries) {
      if (entry.value > maxCount && entry.key != dayMasterElement) {
        maxCount = entry.value;
        dominantElement = entry.key;
      }
    }

    if (dominantElement != null && maxCount >= 3) {
      return (isSpecial: true, type: '종격', followElement: dominantElement);
    }
  }

  return (isSpecial: false, type: null, followElement: null);
}

/// Get johu adjustment element
Element? _getJohuAdjustment(
  Element dayMasterElement,
  _Season season,
  Element yokbuPrimary,
) {
  final johuElements = _johuYongshen[season]?[dayMasterElement];
  if (johuElements == null || johuElements.isEmpty) return null;

  final johuPrimary = johuElements[0];
  if (johuPrimary != yokbuPrimary) {
    return johuPrimary;
  }
  return null;
}

/// Element status for yongshen
class ElementStatus {
  const ElementStatus({
    required this.isYongShen,
    required this.isKiShen,
  });

  final bool isYongShen;
  final bool isKiShen;
}

/// Alternative balance yongshen (for special formations)
class AlternativeBalance {
  const AlternativeBalance({
    required this.primary,
    this.secondary,
  });

  final Element primary;
  final Element? secondary;
}

/// Yongshen analysis result
class YongShenResult {
  const YongShenResult({
    required this.primary,
    this.secondary,
    required this.method,
    required this.reasoning,
    required this.allElements,
    this.johuAdjustment,
    this.alternativeBalance,
  });

  final Element primary;
  final Element? secondary;
  final YongShenMethod method;
  final String reasoning;
  final Map<Element, ElementStatus> allElements;
  final Element? johuAdjustment;
  final AlternativeBalance? alternativeBalance;
}

/// Analyze yongshen
YongShenResult analyzeYongShen(FourPillars pillars) {
  final dayMaster = pillars.dayMaster;
  final dayMasterElement = dayMaster.element;
  final monthBranch = pillars.month.branch;
  final season = _getSeason(monthBranch);

  final strength = analyzeStrength(pillars);
  final allBranchElements = pillars.branches.map((b) => b.element).toList();

  final specialFormation = _hasSpecialFormation(
    dayMasterElement,
    strength.level,
    allBranchElements,
  );

  Element primaryKey;
  Element? secondaryKey;
  YongShenMethod methodKey;
  String reasoning;
  Element? johuAdjustmentKey;
  AlternativeBalance? alternativeBalance;

  if (specialFormation.isSpecial && specialFormation.followElement != null) {
    primaryKey = specialFormation.followElement!;
    secondaryKey = primaryKey.generates;
    methodKey = YongShenMethod.formation;
    reasoning = '종격 성립. ${primaryKey.korean} 세력을 따름';

    final yokbu = _getYokbuYongshen(dayMasterElement, strength.level);
    alternativeBalance = AlternativeBalance(
      primary: yokbu.primary,
      secondary: yokbu.secondary,
    );
  } else {
    final yokbu = _getYokbuYongshen(dayMasterElement, strength.level);
    primaryKey = yokbu.primary;
    secondaryKey = yokbu.secondary;
    methodKey = YongShenMethod.balance;

    if (strength.level.isStrong) {
      reasoning =
          '${strength.level.korean} 상태로 설기(洩氣) 필요. ${primaryKey.korean}로 기운을 발산';
    } else {
      reasoning =
          '${strength.level.korean} 상태로 부조(扶助) 필요. ${primaryKey.korean}로 일간을 생조';
    }

    johuAdjustmentKey = _getJohuAdjustment(dayMasterElement, season, primaryKey);
    if (johuAdjustmentKey != null) {
      final seasonName = switch (season) {
        _Season.spring => '춘',
        _Season.summer => '하',
        _Season.autumn => '추',
        _Season.winter => '동',
      };
      reasoning += '. 조후 보정: $seasonName 계절에 ${johuAdjustmentKey.korean} 참고';
    }
  }

  // Build all elements status
  final allElements = <Element, ElementStatus>{};
  for (final elem in Element.values) {
    allElements[elem] = const ElementStatus(isYongShen: false, isKiShen: false);
  }

  allElements[primaryKey] = const ElementStatus(isYongShen: true, isKiShen: false);
  if (secondaryKey != null) {
    allElements[secondaryKey] =
        const ElementStatus(isYongShen: true, isKiShen: false);
  }

  // Set ki-shen (기신)
  if (methodKey != YongShenMethod.formation) {
    if (strength.level.isStrong) {
      allElements[dayMasterElement] =
          const ElementStatus(isYongShen: false, isKiShen: true);
      allElements[dayMasterElement.generatedBy] =
          const ElementStatus(isYongShen: false, isKiShen: true);
    } else {
      allElements[dayMasterElement.controls] =
          const ElementStatus(isYongShen: false, isKiShen: true);
      allElements[dayMasterElement.controlledBy] =
          const ElementStatus(isYongShen: false, isKiShen: true);
    }
  }

  // Yongshen overrides kishen
  if (allElements[primaryKey]?.isYongShen == true) {
    allElements[primaryKey] =
        const ElementStatus(isYongShen: true, isKiShen: false);
  }
  if (secondaryKey != null && allElements[secondaryKey]?.isYongShen == true) {
    allElements[secondaryKey] =
        const ElementStatus(isYongShen: true, isKiShen: false);
  }

  return YongShenResult(
    primary: primaryKey,
    secondary: secondaryKey,
    method: methodKey,
    reasoning: reasoning,
    allElements: allElements,
    johuAdjustment: johuAdjustmentKey,
    alternativeBalance: alternativeBalance,
  );
}

/// Element recommendations based on yongshen
class ElementRecommendations {
  const ElementRecommendations({
    required this.colors,
    required this.directions,
    required this.numbers,
  });

  final List<String> colors;
  final List<String> directions;
  final List<int> numbers;
}

/// Get recommendations based on yongshen
ElementRecommendations getElementRecommendations(YongShenResult yongShen) {
  const elementData = {
    Element.wood: (colors: ['청색', '녹색'], direction: '동', numbers: [3, 8]),
    Element.fire: (colors: ['적색', '자주색'], direction: '남', numbers: [2, 7]),
    Element.earth: (colors: ['황색', '갈색'], direction: '중앙', numbers: [5, 10]),
    Element.metal: (colors: ['백색', '금색'], direction: '서', numbers: [4, 9]),
    Element.water: (colors: ['흑색', '남색'], direction: '북', numbers: [1, 6]),
  };

  final primary = elementData[yongShen.primary]!;
  final colors = [...primary.colors];
  final directions = [primary.direction];
  final numbers = [...primary.numbers];

  if (yongShen.secondary != null) {
    final secondary = elementData[yongShen.secondary]!;
    colors.addAll(secondary.colors);
    directions.add(secondary.direction);
    numbers.addAll(secondary.numbers);
  }

  return ElementRecommendations(
    colors: colors.toSet().toList(),
    directions: directions.toSet().toList(),
    numbers: numbers.toSet().toList()..sort(),
  );
}
