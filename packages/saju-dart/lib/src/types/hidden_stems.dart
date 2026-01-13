import 'enums.dart';

/// Hidden stem with its weight
class HiddenStem {
  const HiddenStem({
    required this.stem,
    required this.weight,
    required this.type,
  });

  final Stem stem;
  final double weight;
  final HiddenStemType type;
}

/// Hidden stem type (본기/중기/여기)
enum HiddenStemType {
  primary('primary', '본기', '本氣'),
  secondary('secondary', '중기', '中氣'),
  tertiary('tertiary', '여기', '餘氣');

  const HiddenStemType(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Hidden stems data for each branch
class HiddenStems {
  HiddenStems._();

  static const Map<Branch, List<HiddenStem>> data = {
    Branch.zi: [
      HiddenStem(stem: Stem.gui, weight: 1.0, type: HiddenStemType.primary),
    ],
    Branch.chou: [
      HiddenStem(stem: Stem.ji, weight: 0.6, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.gui, weight: 0.25, type: HiddenStemType.secondary),
      HiddenStem(stem: Stem.xin, weight: 0.15, type: HiddenStemType.tertiary),
    ],
    Branch.yin: [
      HiddenStem(stem: Stem.jia, weight: 0.6, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.bing, weight: 0.25, type: HiddenStemType.secondary),
      HiddenStem(stem: Stem.wu, weight: 0.15, type: HiddenStemType.tertiary),
    ],
    Branch.mao: [
      HiddenStem(stem: Stem.yi, weight: 1.0, type: HiddenStemType.primary),
    ],
    Branch.chen: [
      HiddenStem(stem: Stem.wu, weight: 0.6, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.yi, weight: 0.25, type: HiddenStemType.secondary),
      HiddenStem(stem: Stem.gui, weight: 0.15, type: HiddenStemType.tertiary),
    ],
    Branch.si: [
      HiddenStem(stem: Stem.bing, weight: 0.6, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.geng, weight: 0.25, type: HiddenStemType.secondary),
      HiddenStem(stem: Stem.wu, weight: 0.15, type: HiddenStemType.tertiary),
    ],
    Branch.wu: [
      HiddenStem(stem: Stem.ding, weight: 0.7, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.ji, weight: 0.3, type: HiddenStemType.secondary),
    ],
    Branch.wei: [
      HiddenStem(stem: Stem.ji, weight: 0.6, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.ding, weight: 0.25, type: HiddenStemType.secondary),
      HiddenStem(stem: Stem.yi, weight: 0.15, type: HiddenStemType.tertiary),
    ],
    Branch.shen: [
      HiddenStem(stem: Stem.geng, weight: 0.6, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.ren, weight: 0.25, type: HiddenStemType.secondary),
      HiddenStem(stem: Stem.wu, weight: 0.15, type: HiddenStemType.tertiary),
    ],
    Branch.you: [
      HiddenStem(stem: Stem.xin, weight: 1.0, type: HiddenStemType.primary),
    ],
    Branch.xu: [
      HiddenStem(stem: Stem.wu, weight: 0.6, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.xin, weight: 0.25, type: HiddenStemType.secondary),
      HiddenStem(stem: Stem.ding, weight: 0.15, type: HiddenStemType.tertiary),
    ],
    Branch.hai: [
      HiddenStem(stem: Stem.ren, weight: 0.7, type: HiddenStemType.primary),
      HiddenStem(stem: Stem.jia, weight: 0.3, type: HiddenStemType.secondary),
    ],
  };

  /// Get hidden stems for a branch
  static List<HiddenStem> forBranch(Branch branch) {
    return data[branch] ?? [];
  }

  /// Get primary hidden stem for a branch
  static Stem primaryStem(Branch branch) {
    final stems = data[branch];
    if (stems == null || stems.isEmpty) {
      throw ArgumentError('No hidden stems for branch: $branch');
    }
    return stems.first.stem;
  }
}
