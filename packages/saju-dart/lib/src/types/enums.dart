/// Heavenly Stems (天干, 천간)
enum Stem {
  jia('甲', 'wood', Polarity.yang, '갑'),
  yi('乙', 'wood', Polarity.yin, '을'),
  bing('丙', 'fire', Polarity.yang, '병'),
  ding('丁', 'fire', Polarity.yin, '정'),
  wu('戊', 'earth', Polarity.yang, '무'),
  ji('己', 'earth', Polarity.yin, '기'),
  geng('庚', 'metal', Polarity.yang, '경'),
  xin('辛', 'metal', Polarity.yin, '신'),
  ren('壬', 'water', Polarity.yang, '임'),
  gui('癸', 'water', Polarity.yin, '계');

  const Stem(this.hanja, this.elementKey, this.polarity, this.korean);

  final String hanja;
  final String elementKey;
  final Polarity polarity;
  final String korean;

  Element get element => Element.values.firstWhere((e) => e.key == elementKey);

  static Stem fromHanja(String hanja) {
    return Stem.values.firstWhere(
      (s) => s.hanja == hanja,
      orElse: () => throw ArgumentError('Invalid stem hanja: $hanja'),
    );
  }
}

/// Earthly Branches (地支, 지지)
enum Branch {
  zi('子', 'water', Polarity.yang, '자', 'Rat'),
  chou('丑', 'earth', Polarity.yin, '축', 'Ox'),
  yin('寅', 'wood', Polarity.yang, '인', 'Tiger'),
  mao('卯', 'wood', Polarity.yin, '묘', 'Rabbit'),
  chen('辰', 'earth', Polarity.yang, '진', 'Dragon'),
  si('巳', 'fire', Polarity.yin, '사', 'Snake'),
  wu('午', 'fire', Polarity.yang, '오', 'Horse'),
  wei('未', 'earth', Polarity.yin, '미', 'Goat'),
  shen('申', 'metal', Polarity.yang, '신', 'Monkey'),
  you('酉', 'metal', Polarity.yin, '유', 'Rooster'),
  xu('戌', 'earth', Polarity.yang, '술', 'Dog'),
  hai('亥', 'water', Polarity.yin, '해', 'Pig');

  const Branch(
    this.hanja,
    this.elementKey,
    this.polarity,
    this.korean,
    this.zodiac,
  );

  final String hanja;
  final String elementKey;
  final Polarity polarity;
  final String korean;
  final String zodiac;

  Element get element => Element.values.firstWhere((e) => e.key == elementKey);

  static Branch fromHanja(String hanja) {
    return Branch.values.firstWhere(
      (b) => b.hanja == hanja,
      orElse: () => throw ArgumentError('Invalid branch hanja: $hanja'),
    );
  }
}

/// Five Elements (五行, 오행)
enum Element {
  wood('wood', '목', '木'),
  fire('fire', '화', '火'),
  earth('earth', '토', '土'),
  metal('metal', '금', '金'),
  water('water', '수', '水');

  const Element(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;

  /// Element that this element generates (생)
  Element get generates {
    return switch (this) {
      Element.wood => Element.fire,
      Element.fire => Element.earth,
      Element.earth => Element.metal,
      Element.metal => Element.water,
      Element.water => Element.wood,
    };
  }

  /// Element that generates this element (생)
  Element get generatedBy {
    return switch (this) {
      Element.fire => Element.wood,
      Element.earth => Element.fire,
      Element.metal => Element.earth,
      Element.water => Element.metal,
      Element.wood => Element.water,
    };
  }

  /// Element that this element controls (극)
  Element get controls {
    return switch (this) {
      Element.wood => Element.earth,
      Element.earth => Element.water,
      Element.water => Element.fire,
      Element.fire => Element.metal,
      Element.metal => Element.wood,
    };
  }

  /// Element that controls this element (극)
  Element get controlledBy {
    return switch (this) {
      Element.earth => Element.wood,
      Element.water => Element.earth,
      Element.fire => Element.water,
      Element.metal => Element.fire,
      Element.wood => Element.metal,
    };
  }
}

/// Yin/Yang Polarity
enum Polarity {
  yang('yang', '양', '陽'),
  yin('yin', '음', '陰');

  const Polarity(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Gender
enum Gender {
  male('male', '남', '男'),
  female('female', '여', '女');

  const Gender(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Pillar Position
enum PillarPosition {
  year('year', '년주', '年柱'),
  month('month', '월주', '月柱'),
  day('day', '일주', '日柱'),
  hour('hour', '시주', '時柱');

  const PillarPosition(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Ten Gods (십신)
enum TenGod {
  companion('companion', '비견', '比肩'),
  robWealth('robWealth', '겁재', '劫財'),
  eatingGod('eatingGod', '식신', '食神'),
  hurtingOfficer('hurtingOfficer', '상관', '傷官'),
  indirectWealth('indirectWealth', '편재', '偏財'),
  directWealth('directWealth', '정재', '正財'),
  sevenKillings('sevenKillings', '편관', '偏官'),
  directOfficer('directOfficer', '정관', '正官'),
  indirectSeal('indirectSeal', '편인', '偏印'),
  directSeal('directSeal', '정인', '正印');

  const TenGod(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Strength Level (신강신약)
enum StrengthLevel {
  extremelyWeak('extremelyWeak', '극약', '極弱'),
  veryWeak('veryWeak', '태약', '太弱'),
  weak('weak', '신약', '身弱'),
  neutralWeak('neutralWeak', '중화신약', '中和身弱'),
  neutral('neutral', '중화', '中和'),
  neutralStrong('neutralStrong', '중화신강', '中和身強'),
  strong('strong', '신강', '身強'),
  veryStrong('veryStrong', '태강', '太強'),
  extremelyStrong('extremelyStrong', '극왕', '極旺');

  const StrengthLevel(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;

  bool get isStrong =>
      this == StrengthLevel.strong ||
      this == StrengthLevel.veryStrong ||
      this == StrengthLevel.extremelyStrong ||
      this == StrengthLevel.neutralStrong;
}

/// Twelve Life Stages (십이운성)
enum TwelveStage {
  longLife('longLife', '장생', '長生', 'strong'),
  bathing('bathing', '목욕', '沐浴', 'neutral'),
  crownBelt('crownBelt', '관대', '冠帶', 'strong'),
  establishment('establishment', '건록', '建祿', 'strong'),
  imperial('imperial', '제왕', '帝旺', 'strong'),
  decline('decline', '쇠', '衰', 'weak'),
  illness('illness', '병', '病', 'weak'),
  death('death', '사', '死', 'weak'),
  tomb('tomb', '묘', '墓', 'neutral'),
  extinction('extinction', '절', '絶', 'weak'),
  conception('conception', '태', '胎', 'neutral'),
  nurturing('nurturing', '양', '養', 'neutral');

  const TwelveStage(this.key, this.korean, this.hanja, this.strengthKey);

  final String key;
  final String korean;
  final String hanja;
  final String strengthKey;
}

/// Solar Terms (절기)
enum SolarTerm {
  minorCold('minorCold', '소한', '小寒', 285),
  majorCold('majorCold', '대한', '大寒', 300),
  springBegins('springBegins', '입춘', '立春', 315),
  rainWater('rainWater', '우수', '雨水', 330),
  awakeningInsects('awakeningInsects', '경칩', '驚蟄', 345),
  vernalEquinox('vernalEquinox', '춘분', '春分', 0),
  pureBrightness('pureBrightness', '청명', '淸明', 15),
  grainRain('grainRain', '곡우', '穀雨', 30),
  summerBegins('summerBegins', '입하', '立夏', 45),
  grainBuds('grainBuds', '소만', '小滿', 60),
  grainInEar('grainInEar', '망종', '芒種', 75),
  summerSolstice('summerSolstice', '하지', '夏至', 90),
  minorHeat('minorHeat', '소서', '小暑', 105),
  majorHeat('majorHeat', '대서', '大暑', 120),
  autumnBegins('autumnBegins', '입추', '立秋', 135),
  heatStops('heatStops', '처서', '處暑', 150),
  whiteDew('whiteDew', '백로', '白露', 165),
  autumnalEquinox('autumnalEquinox', '추분', '秋分', 180),
  coldDew('coldDew', '한로', '寒露', 195),
  frostDescends('frostDescends', '상강', '霜降', 210),
  winterBegins('winterBegins', '입동', '立冬', 225),
  minorSnow('minorSnow', '소설', '小雪', 240),
  majorSnow('majorSnow', '대설', '大雪', 255),
  winterSolstice('winterSolstice', '동지', '冬至', 270);

  const SolarTerm(this.key, this.korean, this.hanja, this.longitude);

  final String key;
  final String korean;
  final String hanja;
  final int longitude;

  /// Whether this is a Jie (節) - marks month boundary
  bool get isJie => index % 2 == 0;

  /// Whether this is a Qi (氣) - mid-month marker
  bool get isQi => index % 2 == 1;
}

/// Yongshen Method (용신 추출법)
enum YongShenMethod {
  formation('formation', '격국', '格局'),
  balance('balance', '억부', '抑扶'),
  climate('climate', '조후', '調候'),
  bridge('bridge', '통관', '通關'),
  disease('disease', '병약', '病藥');

  const YongShenMethod(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Sinsal Type (신살 유형)
enum SinsalType {
  auspicious('auspicious', '길신'),
  inauspicious('inauspicious', '흉신'),
  neutral('neutral', '중성');

  const SinsalType(this.key, this.korean);

  final String key;
  final String korean;
}

/// Relation Type (합충형파해)
enum RelationType {
  stemCombination('stemCombination', '천간합', '天干合'),
  sixCombination('sixCombination', '육합', '六合'),
  tripleCombination('tripleCombination', '삼합', '三合'),
  directionalCombination('directionalCombination', '방합', '方合'),
  clash('clash', '충', '沖'),
  harm('harm', '해', '害'),
  punishment('punishment', '형', '刑'),
  destruction('destruction', '파', '破');

  const RelationType(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Transformation Status (화 상태)
enum TransformationStatus {
  combined('combined', '합', '合'),
  halfCombined('halfCombined', '반합', '半合'),
  transformed('transformed', '화', '化'),
  notTransformed('notTransformed', '불화', '不化');

  const TransformationStatus(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}

/// Punishment Type (형의 종류)
enum PunishmentType {
  ungrateful('ungrateful', '무은지형', '無恩之刑'),
  power('power', '시세지형', '恃勢之刑'),
  rude('rude', '무례지형', '無禮之刑'),
  selfPunishment('self', '자형', '自刑');

  const PunishmentType(this.key, this.korean, this.hanja);

  final String key;
  final String korean;
  final String hanja;
}
