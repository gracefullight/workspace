import '../types/types.dart';

/// Stem combination data
class StemCombinationData {
  const StemCombinationData(this.stem1, this.stem2, this.resultElement);

  final Stem stem1;
  final Stem stem2;
  final Element resultElement;
}

/// All stem combinations
const stemCombinations = [
  StemCombinationData(Stem.jia, Stem.ji, Element.earth),
  StemCombinationData(Stem.yi, Stem.geng, Element.metal),
  StemCombinationData(Stem.bing, Stem.xin, Element.water),
  StemCombinationData(Stem.ding, Stem.ren, Element.wood),
  StemCombinationData(Stem.wu, Stem.gui, Element.fire),
];

/// Branch six combination data
class BranchSixCombinationData {
  const BranchSixCombinationData(this.branch1, this.branch2, this.resultElement);

  final Branch branch1;
  final Branch branch2;
  final Element resultElement;
}

/// All branch six combinations
const branchSixCombinations = [
  BranchSixCombinationData(Branch.zi, Branch.chou, Element.earth),
  BranchSixCombinationData(Branch.yin, Branch.hai, Element.wood),
  BranchSixCombinationData(Branch.mao, Branch.xu, Element.fire),
  BranchSixCombinationData(Branch.chen, Branch.you, Element.metal),
  BranchSixCombinationData(Branch.si, Branch.shen, Element.water),
  BranchSixCombinationData(Branch.wu, Branch.wei, Element.earth),
];

/// Triple combination data
class TripleCombinationData {
  const TripleCombinationData(this.branches, this.resultElement);

  final List<Branch> branches;
  final Element resultElement;
}

/// All triple combinations
const branchTripleCombinations = [
  TripleCombinationData([Branch.yin, Branch.wu, Branch.xu], Element.fire),
  TripleCombinationData([Branch.shen, Branch.zi, Branch.chen], Element.water),
  TripleCombinationData([Branch.hai, Branch.mao, Branch.wei], Element.wood),
  TripleCombinationData([Branch.si, Branch.you, Branch.chou], Element.metal),
];

/// Directional combinations
const branchDirectionalCombinations = [
  TripleCombinationData([Branch.yin, Branch.mao, Branch.chen], Element.wood),
  TripleCombinationData([Branch.si, Branch.wu, Branch.wei], Element.fire),
  TripleCombinationData([Branch.shen, Branch.you, Branch.xu], Element.metal),
  TripleCombinationData([Branch.hai, Branch.zi, Branch.chou], Element.water),
];

/// Branch clashes
const branchClashes = [
  [Branch.zi, Branch.wu],
  [Branch.chou, Branch.wei],
  [Branch.yin, Branch.shen],
  [Branch.mao, Branch.you],
  [Branch.chen, Branch.xu],
  [Branch.si, Branch.hai],
];

/// Branch harms
const branchHarms = [
  [Branch.zi, Branch.wei],
  [Branch.chou, Branch.wu],
  [Branch.yin, Branch.si],
  [Branch.mao, Branch.chen],
  [Branch.shen, Branch.hai],
  [Branch.you, Branch.xu],
];

/// Branch punishments
class PunishmentData {
  const PunishmentData(this.branches, this.type);

  final List<Branch> branches;
  final PunishmentType type;
}

const branchPunishments = [
  PunishmentData([Branch.yin, Branch.si, Branch.shen], PunishmentType.ungrateful),
  PunishmentData([Branch.chou, Branch.xu, Branch.wei], PunishmentType.power),
  PunishmentData([Branch.zi, Branch.mao], PunishmentType.rude),
  PunishmentData([Branch.chen, Branch.chen], PunishmentType.selfPunishment),
  PunishmentData([Branch.wu, Branch.wu], PunishmentType.selfPunishment),
  PunishmentData([Branch.you, Branch.you], PunishmentType.selfPunishment),
  PunishmentData([Branch.hai, Branch.hai], PunishmentType.selfPunishment),
];

/// Branch destructions
const branchDestructions = [
  [Branch.zi, Branch.you],
  [Branch.chou, Branch.chen],
  [Branch.yin, Branch.hai],
  [Branch.mao, Branch.wu],
  [Branch.si, Branch.shen],
  [Branch.wei, Branch.xu],
];

/// Stem combination result
class StemCombination {
  const StemCombination({
    required this.pair,
    required this.positions,
    required this.resultElement,
    required this.transformStatus,
    required this.transformReason,
  });

  final List<Stem> pair;
  final List<PillarPosition> positions;
  final Element resultElement;
  final TransformationStatus transformStatus;
  final String transformReason;
}

/// Branch six combination result
class BranchSixCombination {
  const BranchSixCombination({
    required this.pair,
    required this.positions,
    required this.resultElement,
    required this.transformStatus,
    required this.transformReason,
  });

  final List<Branch> pair;
  final List<PillarPosition> positions;
  final Element resultElement;
  final TransformationStatus transformStatus;
  final String transformReason;
}

/// Branch triple/directional combination result
class BranchTripleCombination {
  const BranchTripleCombination({
    required this.branches,
    required this.positions,
    required this.resultElement,
    required this.isComplete,
    required this.transformStatus,
    required this.transformReason,
    required this.isDirectional,
  });

  final List<Branch> branches;
  final List<PillarPosition> positions;
  final Element resultElement;
  final bool isComplete;
  final TransformationStatus transformStatus;
  final String transformReason;
  final bool isDirectional;
}

/// Branch clash result
class BranchClash {
  const BranchClash({
    required this.pair,
    required this.positions,
  });

  final List<Branch> pair;
  final List<PillarPosition> positions;
}

/// Branch harm result
class BranchHarm {
  const BranchHarm({
    required this.pair,
    required this.positions,
  });

  final List<Branch> pair;
  final List<PillarPosition> positions;
}

/// Branch punishment result
class BranchPunishment {
  const BranchPunishment({
    required this.branches,
    required this.positions,
    required this.punishmentType,
  });

  final List<Branch> branches;
  final List<PillarPosition> positions;
  final PunishmentType punishmentType;
}

/// Branch destruction result
class BranchDestruction {
  const BranchDestruction({
    required this.pair,
    required this.positions,
  });

  final List<Branch> pair;
  final List<PillarPosition> positions;
}

/// All relations analysis result
class RelationsResult {
  const RelationsResult({
    required this.stemCombinations,
    required this.sixCombinations,
    required this.tripleCombinations,
    required this.clashes,
    required this.harms,
    required this.punishments,
    required this.destructions,
  });

  final List<StemCombination> stemCombinations;
  final List<BranchSixCombination> sixCombinations;
  final List<BranchTripleCombination> tripleCombinations;
  final List<BranchClash> clashes;
  final List<BranchHarm> harms;
  final List<BranchPunishment> punishments;
  final List<BranchDestruction> destructions;
}

/// Check transformation conditions
({TransformationStatus status, String reason}) _checkTransformationCondition(
  Element resultElement,
  Branch monthBranch,
  List<Branch> allBranches,
  bool isComplete,
) {
  if (!isComplete) {
    return (status: TransformationStatus.halfCombined, reason: '불완전 삼합');
  }

  final monthElement = monthBranch.element;
  if (monthElement == resultElement) {
    return (status: TransformationStatus.transformed, reason: '월지가 화오행과 동일');
  }

  final hasSupport =
      allBranches.any((b) => b.element == resultElement && b != monthBranch);
  if (hasSupport) {
    return (status: TransformationStatus.transformed, reason: '화오행 지지 존재');
  }

  return (status: TransformationStatus.notTransformed, reason: '화 조건 불충족');
}

/// Analyze all relations in four pillars
RelationsResult analyzeRelations(FourPillars pillars) {
  final monthBranch = pillars.month.branch;

  // Create positioned lists
  final stems = <({Stem stem, PillarPosition position})>[
    (stem: pillars.year.stem, position: PillarPosition.year),
    (stem: pillars.month.stem, position: PillarPosition.month),
    (stem: pillars.day.stem, position: PillarPosition.day),
    (stem: pillars.hour.stem, position: PillarPosition.hour),
  ];

  final branches = <({Branch branch, PillarPosition position})>[
    (branch: pillars.year.branch, position: PillarPosition.year),
    (branch: pillars.month.branch, position: PillarPosition.month),
    (branch: pillars.day.branch, position: PillarPosition.day),
    (branch: pillars.hour.branch, position: PillarPosition.hour),
  ];

  final allBranches = pillars.branches;

  final resultStemCombinations = <StemCombination>[];
  final resultSixCombinations = <BranchSixCombination>[];
  final resultTripleCombinations = <BranchTripleCombination>[];
  final resultClashes = <BranchClash>[];
  final resultHarms = <BranchHarm>[];
  final resultPunishments = <BranchPunishment>[];
  final resultDestructions = <BranchDestruction>[];

  // Find stem combinations
  for (var i = 0; i < stems.length; i++) {
    for (var j = i + 1; j < stems.length; j++) {
      final s1 = stems[i];
      final s2 = stems[j];
      for (final combo in stemCombinations) {
        if ((s1.stem == combo.stem1 && s2.stem == combo.stem2) ||
            (s1.stem == combo.stem2 && s2.stem == combo.stem1)) {
          resultStemCombinations.add(
            StemCombination(
              pair: [s1.stem, s2.stem],
              positions: [s1.position, s2.position],
              resultElement: combo.resultElement,
              transformStatus: TransformationStatus.combined,
              transformReason: '천간합',
            ),
          );
        }
      }
    }
  }

  // Find branch relations
  for (var i = 0; i < branches.length; i++) {
    for (var j = i + 1; j < branches.length; j++) {
      final b1 = branches[i];
      final b2 = branches[j];

      // Six combinations
      for (final combo in branchSixCombinations) {
        if ((b1.branch == combo.branch1 && b2.branch == combo.branch2) ||
            (b1.branch == combo.branch2 && b2.branch == combo.branch1)) {
          final transform = _checkTransformationCondition(
            combo.resultElement,
            monthBranch,
            allBranches,
            true,
          );
          resultSixCombinations.add(
            BranchSixCombination(
              pair: [b1.branch, b2.branch],
              positions: [b1.position, b2.position],
              resultElement: combo.resultElement,
              transformStatus: transform.status,
              transformReason: transform.reason,
            ),
          );
        }
      }

      // Clashes
      for (final clash in branchClashes) {
        if ((b1.branch == clash[0] && b2.branch == clash[1]) ||
            (b1.branch == clash[1] && b2.branch == clash[0])) {
          resultClashes.add(
            BranchClash(
              pair: [b1.branch, b2.branch],
              positions: [b1.position, b2.position],
            ),
          );
        }
      }

      // Harms
      for (final harm in branchHarms) {
        if ((b1.branch == harm[0] && b2.branch == harm[1]) ||
            (b1.branch == harm[1] && b2.branch == harm[0])) {
          resultHarms.add(
            BranchHarm(
              pair: [b1.branch, b2.branch],
              positions: [b1.position, b2.position],
            ),
          );
        }
      }

      // Destructions
      for (final dest in branchDestructions) {
        if ((b1.branch == dest[0] && b2.branch == dest[1]) ||
            (b1.branch == dest[1] && b2.branch == dest[0])) {
          resultDestructions.add(
            BranchDestruction(
              pair: [b1.branch, b2.branch],
              positions: [b1.position, b2.position],
            ),
          );
        }
      }
    }
  }

  // Find triple combinations
  final branchChars = pillars.branches;
  for (final combo in branchTripleCombinations) {
    final matched = combo.branches.where((b) => branchChars.contains(b)).toList();
    if (matched.length >= 2) {
      final positions = matched
          .map((m) => branches.firstWhere((b) => b.branch == m).position)
          .toList();
      final transform = _checkTransformationCondition(
        combo.resultElement,
        monthBranch,
        allBranches,
        matched.length == 3,
      );
      resultTripleCombinations.add(
        BranchTripleCombination(
          branches: matched,
          positions: positions,
          resultElement: combo.resultElement,
          isComplete: matched.length == 3,
          transformStatus: transform.status,
          transformReason: transform.reason,
          isDirectional: false,
        ),
      );
    }
  }

  // Find directional combinations
  for (final combo in branchDirectionalCombinations) {
    final matched = combo.branches.where((b) => branchChars.contains(b)).toList();
    if (matched.length >= 2) {
      final positions = matched
          .map((m) => branches.firstWhere((b) => b.branch == m).position)
          .toList();
      final transform = _checkTransformationCondition(
        combo.resultElement,
        monthBranch,
        allBranches,
        matched.length == 3,
      );
      resultTripleCombinations.add(
        BranchTripleCombination(
          branches: matched,
          positions: positions,
          resultElement: combo.resultElement,
          isComplete: matched.length == 3,
          transformStatus: transform.status,
          transformReason: transform.reason,
          isDirectional: true,
        ),
      );
    }
  }

  // Find punishments
  for (final punishment in branchPunishments) {
    final matched =
        punishment.branches.where((b) => branchChars.contains(b)).toList();
    final isTriple = punishment.branches.length == 3;
    final isSelfPunishment = punishment.type == PunishmentType.selfPunishment;

    if (isSelfPunishment) {
      final count = branchChars.where((b) => b == punishment.branches[0]).length;
      if (count >= 2) {
        final positions = branches
            .where((b) => b.branch == punishment.branches[0])
            .map((b) => b.position)
            .toList();
        resultPunishments.add(
          BranchPunishment(
            branches: List.filled(count, punishment.branches[0]),
            positions: positions,
            punishmentType: punishment.type,
          ),
        );
      }
    } else if (isTriple && matched.length >= 2) {
      final positions = matched
          .map((m) => branches.firstWhere((b) => b.branch == m).position)
          .toList();
      resultPunishments.add(
        BranchPunishment(
          branches: matched,
          positions: positions,
          punishmentType: punishment.type,
        ),
      );
    } else if (!isTriple && matched.length == 2) {
      final positions = matched
          .map((m) => branches.firstWhere((b) => b.branch == m).position)
          .toList();
      resultPunishments.add(
        BranchPunishment(
          branches: matched,
          positions: positions,
          punishmentType: punishment.type,
        ),
      );
    }
  }

  return RelationsResult(
    stemCombinations: resultStemCombinations,
    sixCombinations: resultSixCombinations,
    tripleCombinations: resultTripleCombinations,
    clashes: resultClashes,
    harms: resultHarms,
    punishments: resultPunishments,
    destructions: resultDestructions,
  );
}
