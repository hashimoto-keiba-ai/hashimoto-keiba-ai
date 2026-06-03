(() => {
  const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value || 0) * 10) / 10));
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const normalizeText = (value) => String(value || "").trim();

  const COURSE_CORRECTION_TABLE = {
    中山: { frontAdvantage: 2.8, closerAdvantage: -0.8, insideDraw: 1.4, outsideDraw: -1.1, hillAptitude: 2.4, tightTurnAptitude: 2.2, straightLength: -0.8 },
    東京: { frontAdvantage: -0.7, closerAdvantage: 2.7, insideDraw: 0.8, outsideDraw: 0.9, hillAptitude: 1.6, tightTurnAptitude: -1.2, straightLength: 3.0 },
    京都: { frontAdvantage: 1.2, closerAdvantage: 1.4, insideDraw: 1.1, outsideDraw: 0.2, hillAptitude: 0.3, tightTurnAptitude: 0.4, straightLength: 1.4 },
    阪神: { frontAdvantage: 0.6, closerAdvantage: 1.7, insideDraw: 0.5, outsideDraw: 0.5, hillAptitude: 2.6, tightTurnAptitude: 0.8, straightLength: 1.6 },
    中京: { frontAdvantage: -0.2, closerAdvantage: 1.8, insideDraw: 0.4, outsideDraw: 0.7, hillAptitude: 1.9, tightTurnAptitude: -0.4, straightLength: 1.9 },
    新潟: { frontAdvantage: -0.8, closerAdvantage: 2.4, insideDraw: -0.2, outsideDraw: 1.2, hillAptitude: -0.8, tightTurnAptitude: -1.4, straightLength: 3.2 },
    福島: { frontAdvantage: 2.5, closerAdvantage: -0.9, insideDraw: 1.5, outsideDraw: -1.3, hillAptitude: 0.7, tightTurnAptitude: 2.7, straightLength: -1.6 },
    小倉: { frontAdvantage: 2.2, closerAdvantage: -0.5, insideDraw: 1.2, outsideDraw: -0.8, hillAptitude: 0.2, tightTurnAptitude: 2.4, straightLength: -1.3 },
  };

  const DISTANCE_CORRECTION_TABLE = {
    芝短距離: { frontAdvantage: 2.4, closerAdvantage: -0.5, stamina: -0.8, speed: 2.2, darkHorse: 0.8, risk: 0.5 },
    芝マイル: { frontAdvantage: 0.8, closerAdvantage: 1.2, stamina: 0.2, speed: 1.4, darkHorse: 1.1, risk: 0 },
    芝中距離: { frontAdvantage: 0.2, closerAdvantage: 1.3, stamina: 1.4, speed: 0.6, darkHorse: 0.6, risk: 0.2 },
    芝長距離: { frontAdvantage: -1.0, closerAdvantage: 1.8, stamina: 2.8, speed: -0.5, darkHorse: 0.3, risk: 1.1 },
    ダート短距離: { frontAdvantage: 2.8, closerAdvantage: -1.1, stamina: -0.5, speed: 2.0, darkHorse: 0.7, risk: 0.6 },
    ダート1400: { frontAdvantage: 1.9, closerAdvantage: -0.1, stamina: 0.2, speed: 1.6, darkHorse: 0.9, risk: 0.2 },
    ダート1800: { frontAdvantage: 1.2, closerAdvantage: 0.4, stamina: 1.5, speed: 0.4, darkHorse: 0.5, risk: 0.4 },
    ダート中長距離: { frontAdvantage: 0.3, closerAdvantage: 1.0, stamina: 2.3, speed: -0.3, darkHorse: 0.3, risk: 0.9 },
  };

  const SURFACE_CORRECTION_TABLE = {
    芝: { frontAdvantage: 0.2, closerAdvantage: 0.8, insideDraw: 0.3, outsideDraw: 0.2, speed: 0.9, stamina: 0.4, risk: 0 },
    ダート: { frontAdvantage: 1.4, closerAdvantage: -0.5, insideDraw: 0.4, outsideDraw: -0.2, speed: 0.6, stamina: 0.8, risk: 0.4 },
    障害: { frontAdvantage: 0.3, closerAdvantage: 0.2, insideDraw: 0, outsideDraw: 0, speed: -0.5, stamina: 1.6, risk: 1.3 },
  };

  const PACE_STYLE_CORRECTION_TABLE = {
    逃げ: { ai: 2.4, darkHorse: 1.0, risk: 1.1, frontAdvantageWeight: 1.0, closerAdvantageWeight: -0.6, longStraightWeight: -0.45, tightTurnWeight: 0.55 },
    先行: { ai: 2.0, darkHorse: 0.9, risk: 0.5, frontAdvantageWeight: 0.82, closerAdvantageWeight: -0.25, longStraightWeight: -0.2, tightTurnWeight: 0.42 },
    好位: { ai: 1.7, darkHorse: 0.8, risk: 0.2, frontAdvantageWeight: 0.55, closerAdvantageWeight: 0.2, longStraightWeight: 0.05, tightTurnWeight: 0.22 },
    自在: { ai: 1.6, darkHorse: 0.8, risk: 0.1, frontAdvantageWeight: 0.45, closerAdvantageWeight: 0.35, longStraightWeight: 0.15, tightTurnWeight: 0.16 },
    中団: { ai: 1.1, darkHorse: 1.1, risk: -0.1, frontAdvantageWeight: -0.15, closerAdvantageWeight: 0.62, longStraightWeight: 0.35, tightTurnWeight: -0.18 },
    差し: { ai: 1.3, darkHorse: 1.5, risk: -0.2, frontAdvantageWeight: -0.45, closerAdvantageWeight: 0.9, longStraightWeight: 0.58, tightTurnWeight: -0.35 },
    追込: { ai: 0.4, darkHorse: 1.9, risk: 0.4, frontAdvantageWeight: -0.75, closerAdvantageWeight: 1.05, longStraightWeight: 0.75, tightTurnWeight: -0.58 },
  };

  const scorePresenceKeys = {
    aiIndex: ["aiIndex", "AI指数"],
    kamianaIndex: ["kamianaIndex", "神穴指数"],
    dangerIndex: ["dangerIndex", "危険人気馬指数"],
  };

  const hasScoreInput = (horse, field) => scorePresenceKeys[field].some((key) => {
    const value = horse?.[key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  const trainingBonus = (training) => ({ S: 12, A: 8, B: 4, C: -4, D: -9 }[normalizeText(training).toUpperCase()] ?? 0);
  const popularityBonus = (popularity) => {
    const rank = toNumber(popularity, 18);
    if (rank <= 1) return 14;
    if (rank <= 3) return 10;
    if (rank <= 5) return 6;
    if (rank <= 8) return 2;
    if (rank <= 12) return -1;
    return -4;
  };
  const oddsBonus = (odds) => {
    const value = toNumber(odds, 99);
    if (value <= 2.5) return 7;
    if (value <= 5) return 9;
    if (value <= 10) return 7;
    if (value <= 20) return 4;
    if (value <= 40) return 0;
    return -4;
  };
  const styleBonus = (style) => ({ 逃げ: 8, 先行: 7, 好位: 6, 自在: 6, 中団: 4, 差し: 5, 追込: 2 }[normalizeText(style)] ?? 3);
  const cornerBonus = (cornerPosition, fieldSize = 18) => {
    const position = toNumber(cornerPosition, fieldSize);
    const size = Math.max(1, toNumber(fieldSize, 18));
    const ratio = position / size;
    if (ratio <= 0.2) return 10;
    if (ratio <= 0.4) return 7;
    if (ratio <= 0.65) return 3;
    if (ratio <= 0.82) return -2;
    return -7;
  };
  const trackStyleBonus = (style, going) => {
    const runningStyle = normalizeText(style);
    const condition = normalizeText(going || "良");
    if (["重", "不良"].includes(condition)) return ["逃げ", "先行", "自在"].includes(runningStyle) ? 7 : -5;
    if (condition === "稍重") return ["先行", "自在", "差し"].includes(runningStyle) ? 4 : 0;
    return ["差し", "自在", "先行"].includes(runningStyle) ? 4 : runningStyle === "追込" ? 1 : 2;
  };
  const distanceBonus = (horse) => {
    const distance = toNumber(horse.distance ?? horse.raceDistance, 0);
    const style = normalizeText(horse.runningStyle);
    if (!distance) return -3;
    if (distance <= 1400) return ["逃げ", "先行"].includes(style) ? 6 : style === "追込" ? -3 : 3;
    if (distance <= 1800) return ["先行", "自在", "差し"].includes(style) ? 5 : 1;
    if (distance <= 2400) return ["自在", "差し", "先行"].includes(style) ? 4 : -1;
    return ["差し", "追込", "自在"].includes(style) ? 5 : -3;
  };
  const unfavorableStylePenalty = (horse) => {
    const fieldSize = toNumber(horse.fieldSize, 18);
    const style = normalizeText(horse.runningStyle);
    const corner = toNumber(horse.cornerPosition, fieldSize);
    let penalty = 0;
    if (["逃げ", "先行"].includes(style) && corner > Math.ceil(fieldSize * 0.45)) penalty += 10;
    if (["差し", "追込"].includes(style) && corner > Math.ceil(fieldSize * 0.75)) penalty += 8;
    if (style === "追込" && ["重", "不良"].includes(normalizeText(horse.going))) penalty += 6;
    return penalty;
  };

  const normalizeCourseKey = (value) => normalizeText(value).replace(/競馬場/g, "");
  const normalizeSurfaceKey = (value) => normalizeText(value) || "芝";
  const normalizeRunningStyleKey = (style) => {
    const normalized = normalizeText(style);
    if (normalized === "自在") return "好位";
    return PACE_STYLE_CORRECTION_TABLE[normalized] ? normalized : "中団";
  };
  const resolveDistanceCategory = (horse = {}) => {
    const surface = normalizeSurfaceKey(horse.surface ?? horse.track ?? horse["芝ダート"]);
    const distance = toNumber(horse.distance ?? horse.raceDistance, 0);
    if (surface === "ダート") {
      if (distance <= 1300) return "ダート短距離";
      if (distance <= 1500) return "ダート1400";
      if (distance <= 1900) return "ダート1800";
      return "ダート中長距離";
    }
    if (distance <= 1400) return "芝短距離";
    if (distance <= 1600) return "芝マイル";
    if (distance <= 2400) return "芝中距離";
    return "芝長距離";
  };
  const signed = (value) => {
    const numeric = Math.round(toNumber(value, 0) * 10) / 10;
    return numeric > 0 ? `+${numeric}` : String(numeric);
  };
  const roundCorrection = (value) => Math.round(toNumber(value, 0) * 10) / 10;

  const calculateCourseCorrection = (horse = {}, scoreType = "ai") => {
    const course = COURSE_CORRECTION_TABLE[normalizeCourseKey(horse.course ?? horse.raceCourse)] || null;
    if (!course) return 0;
    const fieldSize = Math.max(1, toNumber(horse.fieldSize, 18));
    const number = toNumber(horse.number ?? horse.horseNumber, Math.ceil(fieldSize / 2));
    const style = PACE_STYLE_CORRECTION_TABLE[normalizeRunningStyleKey(horse.runningStyle)];
    const corner = toNumber(horse.cornerPosition, fieldSize);
    const isInside = number <= Math.ceil(fieldSize * 0.38);
    const isOutside = number >= Math.floor(fieldSize * 0.68);
    const drawCorrection = isInside ? course.insideDraw : isOutside ? course.outsideDraw : 0;
    const slopeCorrection = course.hillAptitude * (trainingBonus(horse.training) > 0 ? 0.32 : trainingBonus(horse.training) < 0 ? -0.2 : 0.08);
    const tightTurnCorrection = course.tightTurnAptitude * style.tightTurnWeight;
    const straightCorrection = course.straightLength * style.longStraightWeight;
    const paceBiasCorrection = (course.frontAdvantage * style.frontAdvantageWeight) + (course.closerAdvantage * style.closerAdvantageWeight);
    const positionRisk = scoreType === "risk" && corner > Math.ceil(fieldSize * 0.7) ? Math.max(0, course.frontAdvantage) * 0.45 : 0;
    const typeWeight = scoreType === "darkHorse" ? 0.78 : scoreType === "risk" ? 0.42 : 1;
    return roundCorrection((drawCorrection + slopeCorrection + tightTurnCorrection + straightCorrection + paceBiasCorrection) * typeWeight + positionRisk);
  };

  const calculateDistanceCorrection = (horse = {}, scoreType = "ai") => {
    const table = DISTANCE_CORRECTION_TABLE[resolveDistanceCategory(horse)];
    const style = PACE_STYLE_CORRECTION_TABLE[normalizeRunningStyleKey(horse.runningStyle)];
    const popularity = toNumber(horse.popularity, 18);
    const odds = toNumber(horse.odds, 99);
    const longshotBoost = scoreType === "darkHorse" && (popularity >= 6 || odds >= 12) ? table.darkHorse : 0;
    const riskBoost = scoreType === "risk" ? table.risk + (table.frontAdvantage > 1.5 && ["差し", "追込"].includes(normalizeRunningStyleKey(horse.runningStyle)) ? 1.1 : 0) : 0;
    const paceFit = (table.frontAdvantage * style.frontAdvantageWeight) + (table.closerAdvantage * style.closerAdvantageWeight);
    const staminaFit = table.stamina * (["差し", "追込", "中団"].includes(normalizeRunningStyleKey(horse.runningStyle)) ? 0.35 : 0.18);
    const speedFit = table.speed * (["逃げ", "先行", "好位"].includes(normalizeRunningStyleKey(horse.runningStyle)) ? 0.36 : 0.18);
    const typeWeight = scoreType === "darkHorse" ? 0.82 : scoreType === "risk" ? 0.38 : 1;
    return roundCorrection((paceFit + staminaFit + speedFit) * typeWeight + longshotBoost + riskBoost);
  };

  const calculateSurfaceCorrection = (horse = {}, scoreType = "ai") => {
    const surface = SURFACE_CORRECTION_TABLE[normalizeSurfaceKey(horse.surface ?? horse.track ?? horse["芝ダート"])] || SURFACE_CORRECTION_TABLE.芝;
    const style = PACE_STYLE_CORRECTION_TABLE[normalizeRunningStyleKey(horse.runningStyle)];
    const surfaceFit = (surface.frontAdvantage * style.frontAdvantageWeight) + (surface.closerAdvantage * style.closerAdvantageWeight);
    const typeWeight = scoreType === "darkHorse" ? 0.55 : scoreType === "risk" ? 0.35 : 0.75;
    return roundCorrection(surfaceFit * typeWeight + (scoreType === "risk" ? surface.risk : 0));
  };

  const calculateStyleCorrection = (horse = {}, scoreType = "ai") => {
    const style = PACE_STYLE_CORRECTION_TABLE[normalizeRunningStyleKey(horse.runningStyle)];
    return roundCorrection((style[scoreType === "darkHorse" ? "darkHorse" : scoreType === "risk" ? "risk" : "ai"] || 0) + calculateSurfaceCorrection(horse, scoreType));
  };

  const createScoreBreakdown = (baseScore, horse, scoreType) => {
    const courseCorrection = calculateCourseCorrection(horse, scoreType);
    const distanceCorrectionValue = calculateDistanceCorrection(horse, scoreType);
    const styleCorrectionValue = calculateStyleCorrection(horse, scoreType);
    const total = baseScore + courseCorrection + distanceCorrectionValue + styleCorrectionValue;
    return {
      baseScore: roundCorrection(baseScore),
      courseCorrection,
      distanceCorrection: distanceCorrectionValue,
      styleCorrection: styleCorrectionValue,
      finalScore: clampScore(total),
      course: normalizeCourseKey(horse.course ?? horse.raceCourse) || "未設定",
      distanceCategory: resolveDistanceCategory(horse),
      surface: normalizeSurfaceKey(horse.surface ?? horse.track ?? horse["芝ダート"]),
      runningStyle: normalizeRunningStyleKey(horse.runningStyle),
    };
  };

  const formatScoreBreakdown = (breakdown) => breakdown
    ? `基本${breakdown.baseScore} / 競馬場${signed(breakdown.courseCorrection)} / 距離${signed(breakdown.distanceCorrection)} / 脚質${signed(breakdown.styleCorrection)} / 最終${breakdown.finalScore}`
    : "補正内訳なし";

  const buildNamedScoreComponents = (horse = {}, riskScore = calculateRiskScore(horse)) => {
    const fieldSize = toNumber(horse.fieldSize, 18);
    const popularity = toNumber(horse.popularity, 18);
    const odds = toNumber(horse.odds, 99);
    const riskPenalty = riskScore >= 80 ? -14 : riskScore >= 65 ? -8 : riskScore >= 50 ? -4 : 0;
    return {
      aiIndex: {
        popularityCorrection: roundCorrection(popularityBonus(popularity)),
        oddsCorrection: roundCorrection(oddsBonus(odds)),
        styleCorrection: roundCorrection(styleBonus(horse.runningStyle)),
        cornerCorrection: roundCorrection(cornerBonus(horse.cornerPosition, fieldSize)),
        trainingCorrection: roundCorrection(trainingBonus(horse.training)),
        courseCorrection: calculateCourseCorrection(horse, "ai"),
        distanceCorrection: roundCorrection(distanceBonus(horse) + calculateDistanceCorrection(horse, "ai")),
        goingCorrection: roundCorrection(trackStyleBonus(horse.runningStyle, horse.going) + calculateSurfaceCorrection(horse, "ai")),
        dangerPopularPenalty: riskPenalty,
      },
      kamianaIndex: {
        popularityValue: popularity >= 10 ? 22 : popularity >= 6 ? 18 : popularity >= 4 ? 10 : 0,
        oddsValue: odds > 50 ? 7 : odds > 20 ? 15 : odds >= 8 ? 18 : 0,
        stylePaceFit: roundCorrection(Math.max(0, styleBonus(horse.runningStyle) - 2) + Math.max(0, cornerBonus(horse.cornerPosition, fieldSize))),
        kamianaConditionFit: roundCorrection(Math.max(0, trainingBonus(horse.training)) + calculateCourseCorrection(horse, "darkHorse") + calculateDistanceCorrection(horse, "darkHorse")),
        jackpotPatternFit: roundCorrection((odds >= 12 ? 8 : odds >= 6 ? 4 : -5) + (riskScore < 50 ? 10 : riskScore >= 70 ? -14 : 0)),
      },
      dangerIndex: {
        overPopularity: popularity <= 3 && odds <= 3 ? 28 : popularity <= 3 && odds <= 5 ? 22 : popularity <= 5 && odds <= 8 ? 14 : 0,
        paceMismatch: roundCorrection(unfavorableStylePenalty({ ...horse, fieldSize })),
        positionDisadvantage: cornerBonus(horse.cornerPosition, fieldSize) < 0 ? roundCorrection(Math.abs(cornerBonus(horse.cornerPosition, fieldSize)) + 5) : 0,
        trainingConcern: ["D", ""].includes(normalizeText(horse.training).toUpperCase()) ? 18 : normalizeText(horse.training).toUpperCase() === "C" ? 12 : 0,
        goingMismatch: trackStyleBonus(horse.runningStyle, horse.going) < 0 ? 12 : 0,
        distanceConcern: !toNumber(horse.distance ?? horse.raceDistance, 0) ? 10 : Math.max(0, calculateDistanceCorrection(horse, "risk")),
      },
    };
  };


  const calculateRiskScoreBase = (horse = {}) => {
    const popularity = toNumber(horse.popularity, 18);
    const odds = toNumber(horse.odds, 99);
    const fieldSize = toNumber(horse.fieldSize, 18);
    let score = 10;
    if (popularity <= 3 && odds <= 3) score += 28;
    else if (popularity <= 3 && odds <= 5) score += 22;
    else if (popularity <= 5 && odds <= 8) score += 14;
    score += unfavorableStylePenalty({ ...horse, fieldSize });
    if (cornerBonus(horse.cornerPosition, fieldSize) < 0) score += Math.abs(cornerBonus(horse.cornerPosition, fieldSize)) + 5;
    const training = normalizeText(horse.training).toUpperCase();
    if (training === "C") score += 12;
    if (training === "D" || !training) score += 18;
    if (trackStyleBonus(horse.runningStyle, horse.going) < 0) score += 12;
    if (!toNumber(horse.distance ?? horse.raceDistance, 0)) score += 10;
    return score;
  };

  const calculateRiskScoreBreakdown = (horse = {}) => createScoreBreakdown(calculateRiskScoreBase(horse), horse, "risk");

  const calculateRiskScore = (horse = {}) => calculateRiskScoreBreakdown(horse).finalScore;

  const calculateAiScoreBase = (horse = {}) => {
    const correctedRisk = calculateRiskScore(horse);
    const riskPenalty = correctedRisk >= 80 ? 14 : correctedRisk >= 65 ? 8 : correctedRisk >= 50 ? 4 : 0;
    return 38
      + popularityBonus(horse.popularity)
      + oddsBonus(horse.odds)
      + styleBonus(horse.runningStyle)
      + cornerBonus(horse.cornerPosition, horse.fieldSize)
      + trainingBonus(horse.training)
      + trackStyleBonus(horse.runningStyle, horse.going)
      + distanceBonus(horse)
      - riskPenalty;
  };

  const calculateAiScoreBreakdown = (horse = {}) => createScoreBreakdown(calculateAiScoreBase(horse), horse, "ai");

  const calculateAiScore = (horse = {}) => calculateAiScoreBreakdown(horse).finalScore;

  const calculateDarkHorseScoreBase = (horse = {}) => {
    const popularity = toNumber(horse.popularity, 18);
    const odds = toNumber(horse.odds, 99);
    let score = 22;
    if (popularity >= 6 && popularity <= 9) score += 18;
    else if (popularity >= 10) score += 22;
    else if (popularity >= 4) score += 10;
    if (odds >= 8 && odds <= 20) score += 18;
    else if (odds > 20 && odds <= 50) score += 15;
    else if (odds > 50) score += 7;
    score += Math.max(0, styleBonus(horse.runningStyle) - 2);
    score += Math.max(0, cornerBonus(horse.cornerPosition, horse.fieldSize));
    score += Math.max(0, trainingBonus(horse.training));
    score += odds >= 12 ? 8 : odds >= 6 ? 4 : -5;
    score += calculateRiskScore(horse) < 50 ? 10 : calculateRiskScore(horse) >= 70 ? -14 : 0;
    return score;
  };

  const calculateDarkHorseScoreBreakdown = (horse = {}) => createScoreBreakdown(calculateDarkHorseScoreBase(horse), horse, "darkHorse");

  const calculateDarkHorseScore = (horse = {}) => calculateDarkHorseScoreBreakdown(horse).finalScore;

  const applyManualScoreToBreakdown = (breakdown, manualScore) => ({
    ...breakdown,
    manualScore: clampScore(manualScore),
    finalScore: clampScore(manualScore),
  });

  const calculateAllHorseScores = (horses = [], raceContext = {}) => horses.map((horse) => {
    const scoringBase = { ...raceContext, ...horse, fieldSize: raceContext.fieldSize || horse.fieldSize || horses.length || 18 };
    const aiManual = hasScoreInput(horse, "aiIndex");
    const kamianaManual = hasScoreInput(horse, "kamianaIndex");
    const dangerManual = hasScoreInput(horse, "dangerIndex");
    const aiBreakdown = calculateAiScoreBreakdown(scoringBase);
    const kamianaBreakdown = calculateDarkHorseScoreBreakdown(scoringBase);
    const dangerBreakdown = calculateRiskScoreBreakdown(scoringBase);
    const namedComponents = buildNamedScoreComponents(scoringBase, dangerBreakdown.finalScore);
    const aiIndex = aiManual ? clampScore(horse.aiIndex ?? horse["AI指数"]) : aiBreakdown.finalScore;
    const kamianaIndex = kamianaManual ? clampScore(horse.kamianaIndex ?? horse["神穴指数"]) : kamianaBreakdown.finalScore;
    const dangerIndex = dangerManual ? clampScore(horse.dangerIndex ?? horse["危険人気馬指数"]) : dangerBreakdown.finalScore;
    return {
      ...horse,
      aiIndex,
      kamianaIndex,
      dangerIndex,
      scoreBreakdown: {
        aiIndex: { ...(aiManual ? applyManualScoreToBreakdown(aiBreakdown, aiIndex) : aiBreakdown), components: namedComponents.aiIndex },
        kamianaIndex: { ...(kamianaManual ? applyManualScoreToBreakdown(kamianaBreakdown, kamianaIndex) : kamianaBreakdown), components: namedComponents.kamianaIndex },
        dangerIndex: { ...(dangerManual ? applyManualScoreToBreakdown(dangerBreakdown, dangerIndex) : dangerBreakdown), components: namedComponents.dangerIndex },
      },
      scoreSource: {
        aiIndex: aiManual ? "manual" : "auto",
        kamianaIndex: kamianaManual ? "manual" : "auto",
        dangerIndex: dangerManual ? "manual" : "auto",
      },
    };
  });

  window.HashimotoKeibaAiScoreEngine = {
    calculateAiScore,
    calculateDarkHorseScore,
    calculateRiskScore,
    calculateAiScoreBreakdown,
    calculateDarkHorseScoreBreakdown,
    calculateRiskScoreBreakdown,
    calculateAllHorseScores,
    formatScoreBreakdown,
    buildNamedScoreComponents,
    COURSE_CORRECTION_TABLE,
    DISTANCE_CORRECTION_TABLE,
    SURFACE_CORRECTION_TABLE,
    PACE_STYLE_CORRECTION_TABLE,
  };
  window.calculateAiScore = calculateAiScore;
  window.calculateDarkHorseScore = calculateDarkHorseScore;
  window.calculateRiskScore = calculateRiskScore;
  window.calculateAllHorseScores = calculateAllHorseScores;
})();


(() => {
  const STORAGE_KEY = "hashimoto-keiba-ai:score-verification-adjustments:v1";
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value || 0) * 10) / 10));
  const roundAdjustment = (value) => Math.round(toNumber(value, 0) * 10) / 10;
  const normalizeHorseNumber = (value) => String(value ?? "").trim();
  const defaultAdjustment = () => ({ aiIndex: 0, kamianaIndex: 0, dangerIndex: 0, memo: "" });

  const normalizeAdjustment = (adjustment = {}) => ({
    aiIndex: roundAdjustment(adjustment.aiIndex),
    kamianaIndex: roundAdjustment(adjustment.kamianaIndex),
    dangerIndex: roundAdjustment(adjustment.dangerIndex),
    memo: String(adjustment.memo || ""),
  });

  const normalizeAdjustmentMap = (adjustments = {}) => Object.fromEntries(
    Object.entries(adjustments || {})
      .filter(([horseNumber]) => normalizeHorseNumber(horseNumber))
      .map(([horseNumber, adjustment]) => [normalizeHorseNumber(horseNumber), normalizeAdjustment(adjustment)]),
  );

  const loadAdjustments = (storage = window.localStorage) => {
    try {
      return normalizeAdjustmentMap(JSON.parse(storage?.getItem(STORAGE_KEY) || "{}"));
    } catch (error) {
      return {};
    }
  };

  const saveAdjustments = (adjustments = {}, storage = window.localStorage) => {
    const normalized = normalizeAdjustmentMap(adjustments);
    storage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  };

  const hasAdjustment = (adjustment = {}) => ["aiIndex", "kamianaIndex", "dangerIndex"].some((field) => roundAdjustment(adjustment[field]) !== 0) || String(adjustment.memo || "").trim() !== "";

  const applyScoreAdjustment = (horse, field, value) => {
    const baseField = `verificationBase${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    const baseScore = toNumber(horse[baseField] ?? horse[field], 0);
    const adjustment = roundAdjustment(value);
    horse[baseField] = Math.round(baseScore * 10) / 10;
    horse[field] = clampScore(baseScore + adjustment);
    if (horse.scoreBreakdown?.[field]) {
      horse.scoreBreakdown[field] = {
        ...horse.scoreBreakdown[field],
        baseFinalScore: Math.round(baseScore * 10) / 10,
        manualAdjustment: adjustment,
        finalScore: horse[field],
      };
    }
  };

  const applyManualAdjustments = (horses = [], adjustments = {}) => {
    const normalizedAdjustments = normalizeAdjustmentMap(adjustments);
    return horses.map((horse) => {
      const horseNumber = normalizeHorseNumber(horse.number);
      const adjustment = normalizedAdjustments[horseNumber] || defaultAdjustment();
      const adjustedHorse = { ...horse, scoreBreakdown: { ...(horse.scoreBreakdown || {}) }, manualScoreAdjustment: adjustment, correctionMemo: adjustment.memo };
      ["aiIndex", "kamianaIndex", "dangerIndex"].forEach((field) => applyScoreAdjustment(adjustedHorse, field, adjustment[field]));
      adjustedHorse.scoreSource = {
        ...(horse.scoreSource || {}),
        aiIndex: roundAdjustment(adjustment.aiIndex) !== 0 ? "adjusted" : horse.scoreSource?.aiIndex,
        kamianaIndex: roundAdjustment(adjustment.kamianaIndex) !== 0 ? "adjusted" : horse.scoreSource?.kamianaIndex,
        dangerIndex: roundAdjustment(adjustment.dangerIndex) !== 0 ? "adjusted" : horse.scoreSource?.dangerIndex,
      };
      adjustedHorse.hasManualScoreAdjustment = hasAdjustment(adjustment);
      return adjustedHorse;
    });
  };

  window.HashimotoScoreVerificationEngine = {
    STORAGE_KEY,
    loadAdjustments,
    saveAdjustments,
    normalizeAdjustment,
    normalizeAdjustmentMap,
    applyManualAdjustments,
  };
})();

(() => {
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const sortByScore = (horses, field) => [...horses].sort((a, b) => toNumber(b[field]) - toNumber(a[field]));
  const uniqueByHorseNumber = (horses) => [...new Map(horses.filter(Boolean).map((horse) => [horse.number, horse])).values()];
  const formatHorse = (horse) => horse ? `${horse.number} ${horse.name}` : "該当なし";
  const isDangerPopular = (horse) => toNumber(horse?.dangerIndex) >= 80;
  const isLongshot = (horse) => toNumber(horse?.popularity, 99) >= 6 || toNumber(horse?.odds, 0) >= 15;
  const describeScores = (horse) => `AI${toNumber(horse.aiIndex).toFixed(1)} / 神穴${toNumber(horse.kamianaIndex).toFixed(1)} / 危険${toNumber(horse.dangerIndex).toFixed(1)}`;
  const horseReason = (horse, reason) => ({
    number: horse.number,
    name: horse.name,
    aiIndex: toNumber(horse.aiIndex),
    kamianaIndex: toNumber(horse.kamianaIndex),
    dangerIndex: toNumber(horse.dangerIndex),
    popularity: toNumber(horse.popularity),
    odds: toNumber(horse.odds),
    reason,
  });

  const getTrifectaTargetPointCount = (fieldSize, horseCount = 0) => {
    const size = Number(fieldSize) || horseCount;
    if (size <= 10) return 8;
    if (size <= 14) return 12;
    return 16;
  };

  const createTrifectaTicket = (first, second, third, type, reason) => {
    if (!first || !second || !third) return null;
    if (first.number === second.number || first.number === third.number || second.number === third.number) return null;
    return {
      key: `${first.number}-${second.number}-${third.number}`,
      first,
      second,
      third,
      type,
      reason,
      notation: `${first.number} → ${second.number} → ${third.number}`,
      evidence: [
        horseReason(first, `1着: ${reason}`),
        horseReason(second, "2着: AI指数上位4頭から危険人気馬指数80以上を除外"),
        horseReason(third, isDangerPopular(third) ? "3着: 危険人気馬だがAI上位5頭または神穴上位2頭のため条件付き残し" : "3着: AI上位5頭＋神穴上位2頭の採用枠"),
      ],
    };
  };

  const pushTrifectaTickets = (tickets, sourceTickets, limit) => {
    sourceTickets.some((ticket) => {
      if (!ticket || tickets.some((item) => item.key === ticket.key)) return false;
      tickets.push(ticket);
      return tickets.length >= limit;
    });
  };

  const buildTrifectaPayload = (horses = [], options = {}) => {
    const fieldSize = Number(options.fieldSize) || horses.length;
    const targetPoints = getTrifectaTargetPointCount(fieldSize, horses.length);
    const aiTop = sortByScore(horses, "aiIndex");
    const kamianaTop = sortByScore(horses, "kamianaIndex");
    const dangerExcluded = horses.filter(isDangerPopular);
    const isNotDanger = (horse) => horse && !isDangerPopular(horse);
    const firstCandidates = uniqueByHorseNumber(aiTop.slice(0, 2).filter(isNotDanger));
    const secondCandidates = uniqueByHorseNumber(aiTop.slice(0, 4).filter(isNotDanger));
    const kamianaThird = uniqueByHorseNumber(kamianaTop.slice(0, 2));
    const thirdCandidates = uniqueByHorseNumber([...aiTop.slice(0, 5), ...kamianaThird]);
    const attackHeads = uniqueByHorseNumber([...firstCandidates, ...kamianaThird.filter(isNotDanger)]);
    const jackpotHeads = uniqueByHorseNumber(kamianaThird.filter((horse) => isNotDanger(horse) && isLongshot(horse)));
    const base = {
      storageVersion: 2,
      provider: options.provider || "localStorage",
      extensibleProvider: "github-ready",
      repositoryPath: "万馬券DB/三連単買い目/",
      generatedAt: new Date().toISOString(),
      race: options.race || {},
      fieldSize,
      targetPoints,
      rules: {
        firstRule: "1着候補はAI指数上位2頭から危険人気馬指数80以上を除外",
        secondRule: "2着候補はAI指数上位4頭から危険人気馬指数80以上を除外",
        thirdRule: "3着候補はAI指数上位5頭＋神穴指数上位2頭。危険人気馬も3着では条件付き残し",
        pointControl: "10頭以下8点 / 11〜14頭12点 / 15〜18頭16点",
      },
      candidates: {
        firstCandidates,
        secondCandidates,
        thirdCandidates,
        kamianaThird,
        dangerHeadExcluded: dangerExcluded,
        aZone: firstCandidates,
        bZone: secondCandidates.filter((horse) => !firstCandidates.some((first) => first.number === horse.number)),
        cZone: kamianaThird.filter(isNotDanger),
        dangerExcluded,
      },
      tickets: { main: [], attack: [], jackpot: [] },
      summary: { total: 0, stakeYen: 0 },
    };

    if (horses.length < 3) return base;

    const mainSource = firstCandidates.flatMap((first) => secondCandidates.flatMap((second) => thirdCandidates.map((third) => createTrifectaTicket(first, second, third, "本線", "AI指数上位2頭の頭固定で指数信頼度を優先"))));
    const attackSource = attackHeads.flatMap((first) => secondCandidates.flatMap((second) => thirdCandidates.map((third) => createTrifectaTicket(first, second, third, "攻撃型", "神穴上位2頭を頭または3着に混ぜて高配当化"))));
    const jackpotThird = kamianaThird.length ? kamianaThird : thirdCandidates;
    const jackpotSource = uniqueByHorseNumber([...jackpotHeads, ...attackHeads]).flatMap((first) => secondCandidates.flatMap((second) => jackpotThird.map((third) => createTrifectaTicket(first, second, third, "万馬券型", "人気薄＋神穴指数高の爆発力を3着候補へ厚め反映"))));

    const tickets = [];
    pushTrifectaTickets(tickets, mainSource, Math.ceil(targetPoints * 0.5));
    pushTrifectaTickets(tickets, attackSource, Math.ceil(targetPoints * 0.75));
    pushTrifectaTickets(tickets, jackpotSource, targetPoints);
    if (tickets.length < targetPoints) pushTrifectaTickets(tickets, [...mainSource, ...attackSource, ...jackpotSource], targetPoints);

    base.tickets.main = tickets.filter((ticket) => ticket.type === "本線");
    base.tickets.attack = tickets.filter((ticket) => ticket.type === "攻撃型");
    base.tickets.jackpot = tickets.filter((ticket) => ticket.type === "万馬券型");
    base.summary.total = tickets.length;
    base.summary.stakeYen = tickets.length * 100;
    return base;
  };

  const buildWin5ClassificationPayload = (horses = [], options = {}) => {
    const aiTop = sortByScore(horses, "aiIndex");
    const kamianaTop = sortByScore(horses, "kamianaIndex");
    const dangerExcluded = horses.filter(isDangerPopular);
    const available = (horse) => horse && !isDangerPopular(horse);
    const alreadyIn = (zones, horse) => Object.values(zones).some((items) => items.some((item) => item.number === horse.number));
    const zones = { a: [], b: [], c: [], d: [] };
    const add = (key, source, limit, reason) => {
      source.forEach((horse) => {
        if (zones[key].length >= limit || !available(horse) || alreadyIn(zones, horse)) return;
        zones[key].push({ ...horse, win5Reason: reason(horse) });
      });
    };

    add("a", aiTop.slice(0, 1), 1, (horse) => `AI指数最上位かつ危険指数${horse.dangerIndex}で低リスクのA固定候補`);
    add("b", aiTop.slice(0, 4), 3, (horse) => `AI指数上位評価（${describeScores(horse)}）で本線候補`);
    add("c", kamianaTop.filter((horse) => toNumber(horse.kamianaIndex) >= 70), 2, (horse) => `神穴指数上位（${horse.kamianaIndex}）でCゾーンへ自動追加`);
    add("d", kamianaTop.filter((horse) => isLongshot(horse) && toNumber(horse.kamianaIndex) >= 70), 2, (horse) => `人気薄＋神穴指数${horse.kamianaIndex}の爆発候補`);

    return {
      storageVersion: 2,
      provider: options.provider || "localStorage",
      repositoryPath: "WIN5/買い目/",
      generatedAt: new Date().toISOString(),
      race: options.race || {},
      zones,
      dangerExcluded,
      summary: {
        totalCandidates: Object.values(zones).reduce((total, items) => total + items.length, 0),
        zoneCounts: Object.fromEntries(Object.entries(zones).map(([key, items]) => [key, items.length])),
      },
      rules: {
        a: "AI指数最上位かつ危険指数80未満",
        b: "AI指数上位。ただし危険人気馬指数80以上は除外",
        c: "神穴指数上位。ただし危険人気馬指数80以上は除外",
        d: "人気薄＋神穴指数高。ただし危険人気馬指数80以上は除外",
      },
    };
  };

  window.HashimotoBetEngine = {
    buildTrifectaPayload,
    buildWin5ClassificationPayload,
    getTrifectaTargetPointCount,
    isDangerPopular,
    formatHorse,
  };
})();


(() => {
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clampRate = (value, fallback = 0) => Math.max(0, Math.min(100, toNumber(value, fallback)));
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const sortBy = (items, field) => [...items].sort((a, b) => toNumber(b[field]) - toNumber(a[field]));
  const probabilityFromPercent = (value) => clampRate(value) / 100;
  const normalizeProbability = (score, total) => total > 0 ? Math.max(0.001, toNumber(score) / total) : 0;

  const inferAiWinRate = (horse = {}) => {
    if (horse.aiWinRate !== undefined && horse.aiWinRate !== "") return clampRate(horse.aiWinRate);
    const ai = clampRate(horse.aiIndex, 50);
    const danger = clampRate(horse.dangerIndex, 50);
    const popularityLift = Math.max(0, 8 - toNumber(horse.popularity, 12)) * 1.2;
    return clampRate((ai * 0.32) - (danger * 0.08) + popularityLift, 0);
  };

  const inferAiQuinellaRate = (horse = {}) => {
    if (horse.aiQuinellaRate !== undefined && horse.aiQuinellaRate !== "") return clampRate(horse.aiQuinellaRate);
    return clampRate(inferAiWinRate(horse) * 1.75 + clampRate(horse.aiIndex) * 0.08, 0);
  };

  const inferAiPlaceRate = (horse = {}) => {
    if (horse.aiPlaceRate !== undefined && horse.aiPlaceRate !== "") return clampRate(horse.aiPlaceRate);
    return clampRate(inferAiWinRate(horse) * 2.35 + clampRate(horse.kamianaIndex) * 0.08 - clampRate(horse.dangerIndex) * 0.05, 0);
  };

  const classifyEV = (ev) => {
    if (ev >= 120) return "strong-overlay";
    if (ev >= 100) return "overlay";
    if (ev < 80) return "underlay";
    return "fair";
  };

  const calculateEV = (input = {}) => {
    const currentOdds = Math.max(1, toNumber(input.currentOdds ?? input.odds, 1));
    const aiWinRate = inferAiWinRate(input);
    const aiQuinellaRate = inferAiQuinellaRate(input);
    const aiPlaceRate = inferAiPlaceRate(input);
    const marketImpliedRate = currentOdds > 0 ? round((1 / currentOdds) * 100, 1) : 0;
    const winEV = round(currentOdds * probabilityFromPercent(aiWinRate) * 100, 1);
    const quinellaEV = round(currentOdds * 0.62 * probabilityFromPercent(aiQuinellaRate) * 100, 1);
    const placeEV = round(currentOdds * 0.38 * probabilityFromPercent(aiPlaceRate) * 100, 1);
    const blendedEV = round((winEV * 0.52) + (quinellaEV * 0.25) + (placeEV * 0.23), 1);
    const ev = round(input.mode === "win" ? winEV : blendedEV, 1);
    const status = classifyEV(ev);
    return {
      number: input.number,
      name: input.name,
      popularity: toNumber(input.popularity),
      currentOdds,
      aiWinRate,
      aiQuinellaRate,
      aiPlaceRate,
      marketImpliedRate,
      fairOdds: aiWinRate > 0 ? round(100 / aiWinRate, 2) : null,
      winEV,
      quinellaEV,
      placeEV,
      ev,
      status,
      overlay: status === "overlay" || status === "strong-overlay",
      underlay: status === "underlay",
      valueGap: round(aiWinRate - marketImpliedRate, 1),
      recommendation: status === "strong-overlay" ? "強オーバーレイ" : status === "overlay" ? "オーバーレイ" : status === "underlay" ? "アンダーレイ" : "適正圏",
    };
  };

  const calculateTrifectaEV = (tickets = [], horses = []) => {
    const scoreTotal = horses.reduce((total, horse) => total + Math.max(1, toNumber(horse.aiIndex)), 0);
    const byNumber = new Map(horses.map((horse) => [horse.number, horse]));
    return tickets.map((ticket) => {
      const first = byNumber.get(ticket.first?.number) || ticket.first;
      const second = byNumber.get(ticket.second?.number) || ticket.second;
      const third = byNumber.get(ticket.third?.number) || ticket.third;
      const probability = normalizeProbability(first?.aiIndex, scoreTotal)
        * normalizeProbability(second?.aiIndex, scoreTotal - Math.max(1, toNumber(first?.aiIndex)))
        * normalizeProbability(third?.aiIndex, scoreTotal - Math.max(1, toNumber(first?.aiIndex)) - Math.max(1, toNumber(second?.aiIndex)));
      const estimatedOdds = round(Math.max(1, toNumber(first?.odds, 1) * toNumber(second?.odds, 1) * toNumber(third?.odds, 1) * 0.7), 1);
      const ev = round(estimatedOdds * probability * 100, 1);
      return { ...ticket, estimatedOdds, probability: round(probability * 100, 3), ev, status: classifyEV(ev), overlay: ev >= 100, underlay: ev < 80 };
    }).sort((a, b) => b.ev - a.ev);
  };

  const calculateWin5EV = (win5Payload = {}) => {
    const zoneItems = Object.values(win5Payload.zones || {}).flat();
    const candidates = zoneItems.map((horse) => {
      const winRate = inferAiWinRate(horse);
      const estimatedLegOdds = Math.max(1, toNumber(horse.odds, 1) * 0.82);
      const ev = round(estimatedLegOdds * probabilityFromPercent(winRate) * 100, 1);
      return { ...horse, aiWinRate: winRate, estimatedLegOdds: round(estimatedLegOdds, 1), ev, status: classifyEV(ev), overlay: ev >= 100, underlay: ev < 80 };
    }).sort((a, b) => b.ev - a.ev);
    const combinedProbability = candidates.slice(0, 5).reduce((probability, horse) => probability * probabilityFromPercent(horse.aiWinRate), candidates.length ? 1 : 0);
    const estimatedPayoutOdds = round(candidates.slice(0, 5).reduce((odds, horse) => odds * Math.max(1, toNumber(horse.odds, 1)), candidates.length ? 0.55 : 0), 1);
    const ev = round(estimatedPayoutOdds * combinedProbability * 100, 1);
    return { candidates, combinedProbability: round(combinedProbability * 100, 4), estimatedPayoutOdds, ev, status: classifyEV(ev), overlay: ev >= 100, underlay: ev < 80 };
  };

  const buildEVDashboardPayload = (horses = [], options = {}) => {
    const horseEVs = horses.map(calculateEV);
    const evRanking = sortBy(horseEVs, "ev");
    const kamianaEVRanking = sortBy(horseEVs.filter((item) => toNumber(horses.find((horse) => horse.number === item.number)?.kamianaIndex) >= 70 || toNumber(item.popularity, 99) >= 6 || item.currentOdds >= 15), "ev");
    const dangerWarnings = sortBy(horseEVs.filter((item) => toNumber(item.popularity, 99) <= 5 && (item.underlay || toNumber(horses.find((horse) => horse.number === item.number)?.dangerIndex) >= 75)), "marketImpliedRate");
    const allTickets = options.trifectaPayload ? Object.values(options.trifectaPayload.tickets || {}).flat() : [];
    const trifectaEV = calculateTrifectaEV(allTickets, horses);
    const win5EV = options.win5Payload ? calculateWin5EV(options.win5Payload) : calculateWin5EV({ zones: {} });
    return {
      generatedAt: new Date().toISOString(),
      horseEVs,
      evRanking,
      kamianaEVRanking,
      dangerWarnings,
      trifectaEV,
      win5EV,
      summary: {
        topOverlay: evRanking.find((item) => item.overlay) || null,
        topUnderlay: sortBy(horseEVs.filter((item) => item.underlay), "marketImpliedRate")[0] || null,
        overlayCount: horseEVs.filter((item) => item.overlay).length,
        underlayCount: horseEVs.filter((item) => item.underlay).length,
      },
    };
  };

  window.HashimotoEVEngine = {
    calculateEV,
    buildEVDashboardPayload,
    calculateTrifectaEV,
    calculateWin5EV,
    inferAiWinRate,
    inferAiQuinellaRate,
    inferAiPlaceRate,
  };
  window.calculateEV = calculateEV;
})();

(() => {
  const STORAGE_KEY = "godRaceJudgementResults";
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, toNumber(value)));
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const average = (items = [], getter = (item) => item) => {
    const values = items.map(getter).filter((value) => Number.isFinite(Number(value)));
    return values.length ? values.reduce((sum, value) => sum + Number(value), 0) / values.length : 0;
  };
  const sortBy = (items = [], field = "score") => [...items].sort((a, b) => toNumber(b[field]) - toNumber(a[field]));

  const saveToLocalStorage = (payload) => {
    if (!window.localStorage) return false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  };

  const loadFromLocalStorage = (fallback = null) => {
    if (!window.localStorage) return fallback;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const evaluateGrade = (score = 0, blockerCount = 0) => {
    if (blockerCount >= 2 || score < 52) return { grade: "C", label: "C 見送り", action: "見送り", battle: false, skip: true };
    if (score >= 88) return { grade: "S", label: "S 神勝負", action: "強勝負", battle: true, skip: false };
    if (score >= 76) return { grade: "A", label: "A 勝負", action: "通常勝負", battle: true, skip: false };
    if (score >= 62) return { grade: "B", label: "B 条件付き", action: "小額勝負", battle: false, skip: false };
    return { grade: "C", label: "C 見送り", action: "見送り", battle: false, skip: true };
  };

  const buildGodRacePayload = ({ horses = [], evPayload = {}, capitalPayload = null, simulationPayload = null, race = {}, roi = 0, persist = false } = {}) => {
    const normalizedHorses = Array.isArray(horses) ? horses : [];
    const evRanking = evPayload.evRanking || evPayload.horseEVs || [];
    const trifectaEV = evPayload.trifectaEV || [];
    const win5EV = evPayload.win5EV || {};
    const simulationRankings = simulationPayload?.rankings || {};
    const fieldSize = Math.max(1, toNumber(race.fieldSize || normalizedHorses.length, normalizedHorses.length || 1));

    const topEV = evRanking[0] || null;
    const topTrifectaEV = trifectaEV[0] || null;
    const topWinRate = Math.max(
      toNumber(topEV?.aiWinRate),
      toNumber(simulationRankings.winRate?.[0]?.firstRate),
      average(normalizedHorses.slice(0, 3), (horse) => horse.aiWinRate),
    );
    const overlayCount = evPayload.summary?.overlayCount ?? evRanking.filter((item) => item.overlay || toNumber(item.ev) >= 100).length;
    const strongOverlayCount = evRanking.filter((item) => toNumber(item.ev) >= 120).length;
    const topEvValue = Math.max(toNumber(topEV?.ev), toNumber(topTrifectaEV?.ev), toNumber(win5EV.ev));
    const avgTopEv = average(evRanking.slice(0, 3), (item) => item.ev);
    const dangerPopular = normalizedHorses.filter((horse) => toNumber(horse.popularity, 99) <= 5 && toNumber(horse.dangerIndex) >= 75);
    const maxPopularDanger = dangerPopular.reduce((max, horse) => Math.max(max, toNumber(horse.dangerIndex)), 0);
    const darkHorseCount = normalizedHorses.filter((horse) => (toNumber(horse.popularity, 99) >= 6 || toNumber(horse.odds) >= 15) && toNumber(horse.kamianaIndex) >= 70 && toNumber(horse.dangerIndex) < 65).length;
    const oddsSpread = normalizedHorses.length ? Math.max(...normalizedHorses.map((horse) => toNumber(horse.odds, 1))) - Math.min(...normalizedHorses.map((horse) => toNumber(horse.odds, 1))) : 0;
    const simulationTop = simulationRankings.winRate?.[0] || null;
    const simulationPlace = simulationRankings.placeRate?.[0] || null;
    const simulationConfidence = Math.max(toNumber(simulationTop?.firstRate), toNumber(simulationPlace?.placeRate) * 0.42);
    const capitalStrongCount = capitalPayload?.summary?.strongCount ?? 0;
    const capitalNormalCount = capitalPayload?.summary?.normalCount ?? 0;

    const components = {
      ev: clamp((topEvValue * 0.42) + (avgTopEv * 0.28) + (overlayCount * 4) + (strongOverlayCount * 5), 0, 100),
      aiWinRate: clamp((topWinRate * 2.25) + average(normalizedHorses.slice(0, 3), (horse) => horse.aiIndex) * 0.18, 0, 100),
      roi: clamp(50 + (toNumber(roi) * 0.75), 0, 100),
      dangerPopular: clamp(100 - (maxPopularDanger * 0.85) - (dangerPopular.length * 8), 0, 100),
      chaos: clamp((darkHorseCount / fieldSize) * 80 + Math.min(20, oddsSpread * 0.35), 0, 100),
      simulation: clamp(simulationConfidence * 1.15 + (simulationPayload?.simulationCount >= 1000 ? 8 : simulationPayload?.simulationCount >= 300 ? 4 : 0), 0, 100),
      capital: clamp(48 + (capitalStrongCount * 14) + (capitalNormalCount * 6) - (capitalPayload?.summary?.skipCount || 0) * 0.8, 0, 100),
    };

    const score = round(
      components.ev * 0.28
      + components.aiWinRate * 0.18
      + components.roi * 0.13
      + components.dangerPopular * 0.17
      + components.chaos * 0.09
      + components.simulation * 0.10
      + components.capital * 0.05,
      1,
    );
    const blockers = [
      topEvValue < 90 ? "EV90未満" : null,
      maxPopularDanger >= 90 ? "危険人気馬指数90以上" : null,
      toNumber(roi) < -25 ? "ROI大幅マイナス" : null,
      topWinRate < 8 && overlayCount === 0 ? "AI勝率・オーバーレイ不足" : null,
    ].filter(Boolean);
    const judgement = evaluateGrade(score, blockers.length);
    const payload = {
      generatedAt: new Date().toISOString(),
      storageVersion: 1,
      provider: "localStorage",
      race,
      score,
      godRaceScore: score,
      grade: judgement.grade,
      label: judgement.label,
      action: judgement.action,
      battleRace: judgement.battle,
      skip: judgement.skip,
      components,
      blockers,
      metrics: {
        topEV: round(topEvValue, 1),
        avgTopEV: round(avgTopEv, 1),
        topAiWinRate: round(topWinRate, 1),
        roi: round(roi, 1),
        overlayCount,
        strongOverlayCount,
        dangerPopularCount: dangerPopular.length,
        maxPopularDanger: round(maxPopularDanger, 1),
        darkHorseCount,
        simulationCount: simulationPayload?.simulationCount || 0,
        capitalStrongCount,
        capitalNormalCount,
      },
      linked: {
        topEV,
        dangerPopular: sortBy(dangerPopular, "dangerIndex").slice(0, 5),
        topSimulation: simulationTop,
        capitalGodRaceCandidates: capitalPayload?.godRaceCandidates || [],
      },
      reasons: [
        topEvValue >= 120 ? "EVエンジンが強オーバーレイを検出" : topEvValue >= 100 ? "EVエンジンがオーバーレイを検出" : "EV妙味が不足",
        maxPopularDanger >= 75 ? "危険人気馬指数が人気馬リスクを警告" : "危険人気馬リスクは許容圏",
        darkHorseCount > 0 ? "荒れ度・神穴候補が配当妙味を補強" : "荒れ度は低めで堅め想定",
        simulationPayload ? `未来シミュレーション${simulationPayload.simulationCount}回を反映` : "未来シミュレーション未反映",
        capitalPayload ? "資金配分AIの強弱判定を連動" : "資金配分AI連動前",
      ],
    };
    if (persist) saveToLocalStorage(payload);
    return payload;
  };

  window.HashimotoGodRaceEngine = {
    STORAGE_KEY,
    buildGodRacePayload,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
})();


(() => {
  const FUND_SETTINGS_KEY = "fundManagementSettings";
  const FUND_RESULTS_KEY = "fundAllocationResults";
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, toNumber(value)));
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const roundStake = (value, unit = 100) => Math.max(0, Math.floor(toNumber(value) / unit) * unit);

  const ticketTypeLabels = {
    trifecta: "三連単",
    win5: "WIN5",
    win: "単勝",
    place: "複勝",
    quinella: "馬連",
    wide: "ワイド",
  };

  const ticketTypeCaps = {
    trifecta: 0.025,
    win5: 0.035,
    win: 0.018,
    place: 0.014,
    quinella: 0.02,
    wide: 0.016,
  };

  const getKellyFraction = ({ probability = 0, odds = 1 } = {}) => {
    const p = clamp(probability, 0, 1);
    const decimalOdds = Math.max(1, toNumber(odds, 1));
    const b = decimalOdds - 1;
    if (b <= 0 || p <= 0) return 0;
    return Math.max(0, ((b * p) - (1 - p)) / b);
  };

  const calculateKellyStake = ({ hitProbability = 0, probability, odds = 1, bankroll = 0, riskCoefficient = 0.25, unit = 100 } = {}) => {
    const normalizedProbability = toNumber(probability ?? hitProbability, 0);
    const p = normalizedProbability > 1 ? clamp(normalizedProbability / 100, 0, 1) : clamp(normalizedProbability, 0, 1);
    const rawKellyFraction = getKellyFraction({ probability: p, odds });
    const recommendedRatio = clamp(rawKellyFraction * clamp(riskCoefficient, 0, 1), 0, 1);
    return {
      hitProbability: round(p * 100, 3),
      odds: Math.max(1, toNumber(odds, 1)),
      bankroll: Math.max(0, toNumber(bankroll, 0)),
      riskCoefficient: clamp(riskCoefficient, 0, 1),
      rawKellyRatio: round(rawKellyFraction, 6),
      recommendedRatio: round(recommendedRatio, 6),
      rawKellyPercent: round(rawKellyFraction * 100, 3),
      recommendedPercent: round(recommendedRatio * 100, 3),
      recommendedAmount: roundStake(Math.max(0, toNumber(bankroll, 0)) * recommendedRatio, unit),
    };
  };

  const normalizeProbability = (item = {}) => {
    if (item.probability !== undefined && item.probability !== null && item.probability !== "") {
      const raw = toNumber(item.probability);
      return raw > 1 ? clamp(raw / 100, 0, 1) : clamp(raw, 0, 1);
    }
    if (item.aiWinRate !== undefined && item.aiWinRate !== null && item.aiWinRate !== "") return clamp(item.aiWinRate / 100, 0, 1);
    const ev = toNumber(item.ev);
    const odds = Math.max(1, toNumber(item.estimatedOdds ?? item.estimatedLegOdds ?? item.currentOdds ?? item.odds, 1));
    return odds > 0 ? clamp((ev / 100) / odds, 0, 1) : 0;
  };

  const getDangerMultiplier = (dangerIndex = 0) => {
    const danger = clamp(dangerIndex, 0, 100);
    if (danger >= 90) return 0;
    if (danger >= 80) return 0.25;
    if (danger >= 70) return 0.55;
    if (danger >= 55) return 0.8;
    return 1;
  };

  const getGodRaceMultiplier = (godRaceIndex = 0) => {
    const index = clamp(godRaceIndex, 0, 100);
    if (index >= 90) return 1.35;
    if (index >= 80) return 1.18;
    if (index >= 70) return 1.05;
    if (index >= 55) return 0.85;
    return 0.55;
  };

  const getROIMultiplier = (roi = 0) => {
    const value = toNumber(roi, 0);
    if (value >= 45) return 1.22;
    if (value >= 20) return 1.1;
    if (value >= 0) return 1;
    if (value >= -20) return 0.72;
    return 0.45;
  };

  const classifyStake = ({ ev = 0, aiWinRate = 0, kellyFraction = 0, roi = 0, godRaceIndex = 0, dangerIndex = 0, amount = 0 } = {}) => {
    if (dangerIndex >= 90) return { status: "skip", label: "見送り", reason: "危険人気馬指数90以上のため投資停止" };
    if (ev < 90) return { status: "skip", label: "見送り", reason: "EV90未満のため投資停止" };
    if (kellyFraction <= 0) return { status: "skip", label: "見送り", reason: "ケリー基準が0以下" };
    if (ev < 100 && godRaceIndex < 85) return { status: "skip", label: "見送り", reason: "EV100未満かつ神レース指数不足" };
    if (roi < 0 && ev < 115) return { status: "skip", label: "見送り", reason: "ROIマイナスかつEV補強不足" };
    if (amount <= 0) return { status: "skip", label: "見送り", reason: "推奨額が100円未満" };
    if (dangerIndex >= 80) return { status: "light", label: "小額勝負", reason: "危険人気馬指数が高いため減額" };
    if (ev >= 135 && aiWinRate >= 18 && roi >= 0 && godRaceIndex >= 80 && dangerIndex < 55) return { status: "strong", label: "強勝負", reason: "高EV＋高AI勝率＋低危険度＋神レース連動" };
    if (ev >= 110 && roi >= 0 && dangerIndex < 70) return { status: "normal", label: "通常勝負", reason: "EV・ROI・危険度が投資条件を満たす" };
    return { status: "light", label: "小額勝負", reason: "条件クリアだがリスクを抑制" };
  };

  const formatRaceName = (item = {}, fallback = "対象レース") => {
    const race = item.race || {};
    const course = race.course || item.course || "";
    const raceNumber = race.raceNumber || item.raceNumber || "";
    const raceName = race.raceName || item.raceName || item.name || fallback;
    const number = raceNumber ? `${raceNumber}R` : "";
    return `${course}${number} ${raceName}`.trim() || fallback;
  };

  const getTicketROI = (ticketType, options = {}, item = {}) => {
    const map = options.ticketTypeROI || {};
    if (options.roi !== undefined) return toNumber(options.roi, 0);
    if (map[ticketType] !== undefined) return toNumber(map[ticketType], 0);
    if (ticketType === "trifecta") return toNumber(options.trifectaROI ?? item.roi, 0);
    if (ticketType === "win5") return toNumber(options.win5ROI ?? item.roi, 0);
    return toNumber(options[`${ticketType}ROI`] ?? item.roi, 0);
  };

  const calculateStake = (item = {}, options = {}) => {
    const bankroll = Math.max(0, toNumber(options.bankroll ?? options.dailyBudget, 50000));
    const riskCoefficient = clamp(options.riskCoefficient ?? options.fractionalKelly ?? 0.25, 0.05, 1);
    const unit = Math.max(100, toNumber(options.unit, 100));
    const ticketType = item.ticketType || options.ticketType || "trifecta";
    const odds = Math.max(1, toNumber(item.estimatedOdds ?? item.estimatedLegOdds ?? item.currentOdds ?? item.odds, 1));
    const probability = normalizeProbability(item);
    const ev = round(toNumber(item.ev, odds * probability * 100), 1);
    const aiWinRate = round(toNumber(item.aiWinRate, probability * 100), 1);
    const roi = getTicketROI(ticketType, options, item);
    const godRaceIndex = clamp(options.godRaceIndex ?? item.godRaceIndex ?? item.kamianaIndex ?? 0, 0, 100);
    const dangerIndex = clamp(item.dangerIndex ?? item.dangerPopularIndex ?? options.dangerIndex ?? 0, 0, 100);
    const kelly = calculateKellyStake({ hitProbability: probability, odds, bankroll, riskCoefficient, unit });
    const adjustedFraction = kelly.rawKellyRatio * riskCoefficient * getGodRaceMultiplier(godRaceIndex) * getROIMultiplier(roi) * getDangerMultiplier(dangerIndex);
    const capRatio = ticketTypeCaps[ticketType] ?? 0.018;
    const maxPerTicket = Math.max(unit, toNumber(options.maxPerTicket ?? options.raceLimit, bankroll));
    const typeCap = ticketType === "win5" ? toNumber(options.win5Limit, maxPerTicket) : maxPerTicket;
    const battleRaceCap = Math.max(unit, bankroll / Math.max(1, toNumber(options.battleRaceCount, 1)));
    const cappedFraction = Math.min(adjustedFraction, capRatio);
    const rawAmount = roundStake(bankroll * cappedFraction, unit);
    const amount = Math.min(rawAmount, roundStake(typeCap, unit), roundStake(battleRaceCap, unit));
    const decision = classifyStake({ ev, aiWinRate, kellyFraction: kelly.rawKellyRatio, roi, godRaceIndex, dangerIndex, amount });
    return {
      ...item,
      raceName: formatRaceName(item),
      ticketType,
      ticketTypeLabel: ticketTypeLabels[ticketType] || ticketType,
      bankroll,
      odds,
      probability: round(probability * 100, 3),
      aiWinRate,
      ev,
      roi: round(roi, 1),
      godRaceIndex,
      dangerIndex,
      rawKellyFraction: kelly.rawKellyPercent,
      adjustedKellyFraction: round(cappedFraction * 100, 3),
      recommendedRatio: decision.status === "skip" ? 0 : round(cappedFraction, 6),
      recommendedAmount: decision.status === "skip" ? 0 : amount,
      decision: decision.status,
      decisionLabel: decision.label,
      decisionReason: decision.reason,
      godRaceCandidate: ev >= 110 && godRaceIndex >= 80 && dangerIndex < 60,
    };
  };

  const buildSingleTicketCandidates = (raceEV = [], options = {}) => {
    const horseEVs = Array.isArray(raceEV) ? raceEV : [];
    const raceMeta = options.race || {};
    const create = (horse, ticketType, oddsFactor, probabilityField, evField) => {
      const probability = clamp(toNumber(horse[probabilityField] ?? horse.aiWinRate, 0) / 100, 0, 1);
      const odds = Math.max(1, toNumber(horse.currentOdds ?? horse.odds, 1) * oddsFactor);
      return {
        ...horse,
        race: raceMeta,
        ticketType,
        notation: `${horse.number ?? ""} ${horse.name ?? "候補"}`.trim(),
        probability: round(probability * 100, 3),
        aiWinRate: toNumber(horse.aiWinRate, probability * 100),
        estimatedOdds: round(odds, 1),
        ev: round(toNumber(horse[evField], odds * probability * 100), 1),
      };
    };
    return {
      win: horseEVs.slice(0, 8).map((horse) => create(horse, "win", 1, "aiWinRate", "winEV")),
      place: horseEVs.slice(0, 8).map((horse) => create(horse, "place", 0.38, "aiPlaceRate", "placeEV")),
      quinella: horseEVs.slice(0, 8).map((horse) => create(horse, "quinella", 0.62, "aiQuinellaRate", "quinellaEV")),
      wide: horseEVs.slice(0, 8).map((horse) => create(horse, "wide", 0.42, "aiPlaceRate", "placeEV")),
    };
  };

  const saveToLocalStorage = (key, payload) => {
    if (!window.localStorage) return false;
    window.localStorage.setItem(key, JSON.stringify(payload));
    return true;
  };

  const loadFromLocalStorage = (key, fallback = null) => {
    if (!window.localStorage) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  };


  const normalizeInvestmentRecord = (record = {}, index = 0) => {
    const stake = Math.max(0, toNumber(record.stake, 0));
    const payout = Math.max(0, toNumber(record.payout, 0));
    const date = record.date || record.savedAt || "未設定";
    return {
      ...record,
      sortKey: `${date}:${String(index).padStart(4, "0")}`,
      date,
      course: record.course || "未設定",
      raceNumber: record.raceNumber || "-",
      ticketType: record.ticketType || "未設定",
      stake,
      payout,
      profit: toNumber(record.profit ?? record.computed?.profit, payout - stake),
      hit: Boolean(record.hit || payout > 0),
    };
  };

  const summarizeRecordGroup = (records = []) => records.reduce((stats, record) => {
    stats.stake += record.stake;
    stats.payout += record.payout;
    stats.profit += record.profit;
    stats.total += 1;
    if (record.hit) stats.hits += 1;
    stats.roi = stats.stake > 0 ? (stats.payout / stats.stake) * 100 : 0;
    stats.hitRate = stats.total > 0 ? (stats.hits / stats.total) * 100 : 0;
    return stats;
  }, { stake: 0, payout: 0, profit: 0, total: 0, hits: 0, roi: 0, hitRate: 0 });

  const classifyCapitalMonitor = ({ roi = 0, drawdownRate = 0, recentRoi = 0, profit = 0, warningRoi = 85, stopRoi = 70, targetRoi = 110, drawdownLimit = 20 } = {}) => {
    if (drawdownRate >= drawdownLimit || roi < stopRoi) {
      return { status: "stop", label: "投資停止", action: "危険水準。次レースは見送り、AI指数SかつEV120以上のみ少額再開。" };
    }
    if (roi < warningRoi || recentRoi < warningRoi || profit < 0) {
      return { status: "protect", label: "防御運用", action: "基準資金を50%へ圧縮し、危険人気馬・低EV券種を除外。" };
    }
    if (roi >= targetRoi && recentRoi >= 100 && drawdownRate < drawdownLimit * 0.5) {
      return { status: "grow", label: "攻撃運用", action: "神レースA/Sのみ上限内で増額。利益分の一部だけを再投資。" };
    }
    return { status: "neutral", label: "標準運用", action: "現行資金配分を維持し、券種別ROIの高い買い目へ優先配分。" };
  };

  const buildCapitalCurveMonitorPayload = ({ results = [], startingBankroll = 0, allocationPayload = null, warningRoi = 85, stopRoi = 70, targetRoi = 110, drawdownLimit = 20, movingWindow = 5 } = {}) => {
    const normalized = (Array.isArray(results) ? results : [])
      .map(normalizeInvestmentRecord)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const initialBankroll = Math.max(0, toNumber(startingBankroll, 0)) || normalized.reduce((sum, record) => sum + record.stake, 0);
    let cumulativeStake = 0;
    let cumulativePayout = 0;
    let cumulativeProfit = 0;
    let peakBankroll = initialBankroll;
    let maxDrawdownRate = 0;

    const curve = normalized.map((record, index) => {
      cumulativeStake += record.stake;
      cumulativePayout += record.payout;
      cumulativeProfit += record.profit;
      const bankroll = Math.max(0, initialBankroll + cumulativeProfit);
      peakBankroll = Math.max(peakBankroll, bankroll);
      const drawdown = bankroll - peakBankroll;
      const drawdownRate = peakBankroll > 0 ? Math.abs(drawdown / peakBankroll) * 100 : 0;
      maxDrawdownRate = Math.max(maxDrawdownRate, drawdownRate);
      const roi = cumulativeStake > 0 ? (cumulativePayout / cumulativeStake) * 100 : 0;
      const windowRecords = normalized.slice(Math.max(0, index + 1 - movingWindow), index + 1);
      const recent = summarizeRecordGroup(windowRecords);
      return {
        index: index + 1,
        date: record.date,
        label: `${record.date} ${record.course}${record.raceNumber}R ${record.ticketType}`,
        stake: round(cumulativeStake, 0),
        payout: round(cumulativePayout, 0),
        profit: round(cumulativeProfit, 0),
        bankroll: round(bankroll, 0),
        roi: round(roi, 1),
        drawdown: round(drawdown, 0),
        drawdownRate: round(drawdownRate, 1),
        recentRoi: round(recent.roi, 1),
        record,
      };
    });

    const total = summarizeRecordGroup(normalized);
    const latest = curve.at(-1) || { roi: 0, profit: 0, bankroll: initialBankroll, drawdownRate: 0, recentRoi: 0 };
    const previous = curve.at(-2) || latest;
    const trend = latest.roi > previous.roi ? "up" : latest.roi < previous.roi ? "down" : "flat";
    const ticketTypes = normalized.reduce((accumulator, record) => {
      accumulator[record.ticketType] = accumulator[record.ticketType] || [];
      accumulator[record.ticketType].push(record);
      return accumulator;
    }, {});
    const ticketTypeSummary = Object.fromEntries(Object.entries(ticketTypes).map(([type, records]) => [type, summarizeRecordGroup(records)]));
    const bestTicketType = Object.entries(ticketTypeSummary).sort(([, a], [, b]) => b.roi - a.roi || b.profit - a.profit)[0] || null;
    const worstTicketType = Object.entries(ticketTypeSummary).sort(([, a], [, b]) => a.roi - b.roi || a.profit - b.profit)[0] || null;
    const monitor = classifyCapitalMonitor({ roi: total.roi, drawdownRate: maxDrawdownRate, recentRoi: latest.recentRoi, profit: total.profit, warningRoi, stopRoi, targetRoi, drawdownLimit });
    const allocationSummary = allocationPayload?.summary || null;

    return {
      generatedAt: new Date().toISOString(),
      storageVersion: 1,
      settings: { startingBankroll: initialBankroll, warningRoi, stopRoi, targetRoi, drawdownLimit, movingWindow },
      total: { ...total, roi: round(total.roi, 1), hitRate: round(total.hitRate, 1), maxDrawdownRate: round(maxDrawdownRate, 1), endingBankroll: latest.bankroll, trend },
      latest,
      curve,
      ticketTypeSummary,
      bestTicketType: bestTicketType ? { ticketType: bestTicketType[0], ...bestTicketType[1], roi: round(bestTicketType[1].roi, 1), hitRate: round(bestTicketType[1].hitRate, 1) } : null,
      worstTicketType: worstTicketType ? { ticketType: worstTicketType[0], ...worstTicketType[1], roi: round(worstTicketType[1].roi, 1), hitRate: round(worstTicketType[1].hitRate, 1) } : null,
      monitor,
      recommendations: [
        monitor.action,
        bestTicketType ? `${bestTicketType[0]}はROI ${round(bestTicketType[1].roi, 1)}%。次回の優先券種候補。` : "券種別ROIを蓄積してください。",
        worstTicketType && bestTicketType && worstTicketType[0] !== bestTicketType[0] ? `${worstTicketType[0]}はROI ${round(worstTicketType[1].roi, 1)}%。点数削減または見送り候補。` : "低ROI券種の判定待ち。",
        allocationSummary ? `現在のAI推奨投資合計は${round(allocationSummary.totalRecommended, 0).toLocaleString("ja-JP")}円。資金曲線ステータスに合わせて調整。` : "AI資金配分エンジン連携待ち。",
      ],
    };
  };

  const buildCapitalAllocationPayload = ({ trifectaEV = [], win5EV = {}, raceEV = [], evRanking = [], godRaceIndex = 0, bankroll, dailyBudget = 50000, raceLimit = 10000, win5Limit = 5000, riskCoefficient, fractionalKelly = 0.25, battleRaceCount = 3, ticketTypeROI = {}, trifectaROI = 0, win5ROI = 0, race = {}, persist = false } = {}) => {
    const budget = Math.max(0, toNumber(bankroll ?? dailyBudget, 50000));
    const commonOptions = { bankroll: budget, dailyBudget: budget, raceLimit, win5Limit, riskCoefficient: riskCoefficient ?? fractionalKelly, fractionalKelly, battleRaceCount, godRaceIndex, ticketTypeROI, trifectaROI, win5ROI, race };
    const singleCandidates = buildSingleTicketCandidates(raceEV.length ? raceEV : evRanking, { race });
    const trifecta = (trifectaEV || []).slice(0, 12).map((item) => calculateStake({ ...item, race }, { ...commonOptions, ticketType: "trifecta" }));
    const win5Candidates = Array.isArray(win5EV) ? win5EV : (win5EV.candidates || []);
    const win5 = win5Candidates.slice(0, 8).map((item) => calculateStake({ ...item, race }, { ...commonOptions, ticketType: "win5" }));
    const win = singleCandidates.win.map((item) => calculateStake(item, { ...commonOptions, ticketType: "win" }));
    const place = singleCandidates.place.map((item) => calculateStake(item, { ...commonOptions, ticketType: "place" }));
    const quinella = singleCandidates.quinella.map((item) => calculateStake(item, { ...commonOptions, ticketType: "quinella" }));
    const wide = singleCandidates.wide.map((item) => calculateStake(item, { ...commonOptions, ticketType: "wide" }));
    const ticketGroups = { trifecta, win5, win, place, quinella, wide };
    const allItems = Object.values(ticketGroups).flat();
    const godRaceCandidates = allItems
      .filter((item) => item.godRaceCandidate)
      .sort((a, b) => (b.ev - a.ev) || (a.dangerIndex - b.dangerIndex))
      .slice(0, 5);
    const totalByTicketType = Object.fromEntries(Object.entries(ticketGroups).map(([key, items]) => [key, items.reduce((sum, item) => sum + item.recommendedAmount, 0)]));
    const payload = {
      generatedAt: new Date().toISOString(),
      storageVersion: 2,
      provider: "localStorage",
      settings: { dailyBudget: budget, bankroll: budget, raceLimit, win5Limit, riskCoefficient: commonOptions.riskCoefficient, fractionalKelly, battleRaceCount, godRaceIndex, ticketTypeROI, trifectaROI, win5ROI },
      ticketGroups,
      trifecta,
      win5,
      win,
      place,
      quinella,
      wide,
      godRaceCandidates,
      summary: {
        totalRecommended: allItems.reduce((sum, item) => sum + item.recommendedAmount, 0),
        trifectaRecommended: totalByTicketType.trifecta,
        win5Recommended: totalByTicketType.win5,
        totalByTicketType,
        skipCount: allItems.filter((item) => item.decision === "skip").length,
        strongCount: allItems.filter((item) => item.decision === "strong").length,
        normalCount: allItems.filter((item) => item.decision === "normal").length,
        lightCount: allItems.filter((item) => item.decision === "light").length,
      },
    };
    if (persist) {
      saveToLocalStorage(FUND_SETTINGS_KEY, payload.settings);
      saveToLocalStorage(FUND_RESULTS_KEY, payload);
    }
    return payload;
  };

  window.HashimotoCapitalEngine = {
    FUND_SETTINGS_KEY,
    FUND_RESULTS_KEY,
    ticketTypeLabels,
    getKellyFraction,
    calculateKellyStake,
    calculateStake,
    buildCapitalAllocationPayload,
    buildCapitalCurveMonitorPayload,
    classifyCapitalMonitor,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
  window.calculateKellyStake = calculateKellyStake;
})();

(() => {
  const STORAGE_KEY = "hashimoto-keiba-ai:self-evolution-logs:v1";
  const DATA_URL = "./data/selfEvolutionLogs.json";

  const form = document.querySelector("#self-evolution-form");
  const resetButton = document.querySelector("#reset-self-evolution-form");
  const list = document.querySelector("#self-evolution-required-log-list");
  const countLabel = document.querySelector("#self-evolution-required-count");
  const statusBadge = document.querySelector("#self-evolution-status");

  if (!form || !list) return;

  let currentItems = [];

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = (value) => value || new Date().toISOString().slice(0, 10);

  const createPayload = (items = [], provider = "localStorage") => ({
    storageVersion: 1,
    type: "selfEvolutionLogs",
    provider,
    description: "橋本競馬AIの自己進化ループログ。採用/保留/却下の判断と根拠レース、次回反映メモを管理します。",
    updatedAt: new Date().toISOString(),
    items,
    logs: {
      resultVerifications: [],
      backtests: [],
      improvementProposals: [],
    },
  });

  const normalizeItem = (item = {}, index = 0) => ({
    id: item.id || `self-evolution-${Date.now()}-${index}`,
    date: formatDate(item.date || item.createdAt?.slice(0, 10)),
    course: item.course || item.race?.course || item.filters?.course || "未設定",
    distance: item.distance || item.race?.distance || item.filters?.distance || "未設定",
    targetAi: item.targetAi || item.targetAI || item.ai || item.title || "AI指数エンジン",
    improvement: item.improvement || item.body || item.lesson || item.summary || "改善内容未設定",
    status: ["採用", "保留", "却下"].includes(item.status) ? item.status : "保留",
    evidenceRace: item.evidenceRace || item.raceName || item.race?.name || item.source || "根拠レース未設定",
    nextReflectionMemo: item.nextReflectionMemo || item.nextMemo || item.memo || item.action || "次回反映メモ未設定",
  });

  const extractItems = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload.items)) return payload.items.map(normalizeItem);

    const logs = payload.logs || {};
    const resultItems = (logs.resultVerifications || []).map((item) => normalizeItem({
      ...item,
      targetAi: "結果検証AI",
      improvement: item.lesson || item.summary,
      evidenceRace: item.raceName || item.race?.name,
      nextReflectionMemo: item.nextAction || item.memo,
      status: "保留",
    }));
    const backtestItems = (logs.backtests || []).map((item) => normalizeItem({
      ...item,
      targetAi: "AI精度テスト",
      improvement: item.improvements?.join(" / ") || item.summary,
      evidenceRace: `${item.filters?.course || "全競馬場"} バックテスト`,
      nextReflectionMemo: item.weaknesses?.join(" / ") || item.memo,
      status: "保留",
    }));
    const proposalItems = (logs.improvementProposals || []).map((item) => normalizeItem({
      ...item,
      targetAi: item.title,
      improvement: item.body,
      evidenceRace: item.source || "バックテスト改善提案",
      nextReflectionMemo: item.nextAction || item.body,
      status: "採用",
    }));

    return [...resultItems, ...backtestItems, ...proposalItems];
  };

  const readLocalPayload = () => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  };

  const writeLocalPayload = (items) => {
    const previousPayload = readLocalPayload();
    const payload = {
      ...createPayload(items, "localStorage"),
      logs: previousPayload?.logs || createPayload().logs,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  };

  const readJsonPayload = async () => {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`selfEvolutionLogs.json ${response.status}`);
    return response.json();
  };

  const renderLogs = (items, sourceLabel) => {
    currentItems = items;
    const statusCounts = items.reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, { 採用: 0, 保留: 0, 却下: 0 });

    if (countLabel) {
      countLabel.textContent = `${sourceLabel} / ${items.length}件（採用${statusCounts.採用 || 0}・保留${statusCounts.保留 || 0}・却下${statusCounts.却下 || 0}）`;
    }
    if (statusBadge) {
      statusBadge.textContent = `${items.length} SELF EVOLUTION LOGS`;
    }

    list.innerHTML = items.length ? items.map((item) => `
      <article class="self-evolution-required-card self-evolution-required-card--${escapeHtml(item.status)}">
        <div class="self-evolution-required-card__meta">
          <span>${escapeHtml(item.date)}</span>
          <span>${escapeHtml(item.course)} / ${escapeHtml(item.distance)}</span>
          <strong>${escapeHtml(item.status)}</strong>
        </div>
        <h3>${escapeHtml(item.targetAi)}</h3>
        <dl>
          <div><dt>改善対象AI</dt><dd>${escapeHtml(item.targetAi)}</dd></div>
          <div><dt>改善内容</dt><dd>${escapeHtml(item.improvement)}</dd></div>
          <div><dt>採用/保留/却下</dt><dd>${escapeHtml(item.status)}</dd></div>
          <div><dt>根拠レース</dt><dd>${escapeHtml(item.evidenceRace)}</dd></div>
          <div><dt>次回反映メモ</dt><dd>${escapeHtml(item.nextReflectionMemo)}</dd></div>
        </dl>
      </article>
    `).join("") : '<p class="self-evolution-empty">自己進化ログがまだありません。フォームから改善内容を追加してください。</p>';
  };

  const loadAndRender = async () => {
    const localPayload = readLocalPayload();
    if (localPayload) {
      renderLogs(extractItems(localPayload), "localStorage");
      return;
    }

    const jsonPayload = await readJsonPayload();
    const items = extractItems(jsonPayload);
    renderLogs(items, "data/selfEvolutionLogs.json");
  };

  const resetForm = () => {
    form.reset();
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    form.elements.status.value = "採用";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const existingItems = extractItems(readLocalPayload());
    const baseItems = existingItems.length ? existingItems : currentItems;
    const newItem = normalizeItem({
      ...values,
      id: `self-evolution-${values.date}-${values.course}-${Date.now()}`,
    });
    const payload = writeLocalPayload([newItem, ...baseItems].slice(0, 100));
    renderLogs(extractItems(payload), "localStorageへ追加保存済み");
    resetForm();
  });

  resetButton?.addEventListener("click", resetForm);
  resetForm();
  loadAndRender().catch((error) => {
    renderLogs([], `読込エラー: ${error.message}`);
  });
})();

(() => {
  const form = document.querySelector("#pages-check-form");
  const urlInput = document.querySelector("#pages-public-url");
  const helpText = document.querySelector("#pages-check-help");
  const overall = document.querySelector("#pages-check-overall");
  const items = Array.from(document.querySelectorAll("[data-pages-check]"));

  if (!form || !urlInput || !items.length) return;

  const STORAGE_KEY = "hashimoto-keiba-ai:pages-public-url:v1";
  try {
    const savedUrl = window.localStorage.getItem(STORAGE_KEY);
    if (savedUrl) urlInput.value = savedUrl;
  } catch (_) {
    // localStorage availability is checked explicitly in the panel.
  }

  const setStatus = (key, status, detail = "") => {
    const item = items.find((entry) => entry.dataset.pagesCheck === key);
    if (!item) return;
    const badge = item.querySelector(".pages-check-status");
    const small = item.querySelector("small");
    const label = status === "ok" ? "OK" : status === "warning" ? "注意" : "未確認";
    badge.textContent = label;
    badge.className = `pages-check-status pages-check-status--${status}`;
    if (detail && small) small.textContent = detail;
  };

  const toBaseUrl = () => {
    const raw = urlInput.value.trim() || window.location.href;
    const parsed = new URL(raw, window.location.href);
    if (!parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/[^/]*$/, "/");
    }
    parsed.search = "";
    parsed.hash = "";
    return parsed;
  };

  const assetUrl = (baseUrl, path) => new URL(path, baseUrl).toString();

  const fetchText = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`.trim());
    return response.text();
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`.trim());
    return response.json();
  };

  const checkLocalStorage = () => {
    const key = "hashimoto-keiba-ai:pages-check:test";
    window.localStorage.setItem(key, "ok");
    const isAvailable = window.localStorage.getItem(key) === "ok";
    window.localStorage.removeItem(key);
    if (!isAvailable) throw new Error("読み書き結果を確認できませんでした");
  };

  const updateOverall = () => {
    const statuses = items.map((item) => item.querySelector(".pages-check-status")?.textContent || "未確認");
    const okCount = statuses.filter((status) => status === "OK").length;
    const warningCount = statuses.filter((status) => status === "注意").length;
    overall.textContent = warningCount ? `注意 ${warningCount}件 / OK ${okCount}件` : `OK ${okCount}/${statuses.length}`;
    overall.classList.toggle("status-pill--live", okCount === statuses.length);
    overall.classList.toggle("status-pill--danger", warningCount > 0);
  };

  const runCheck = async () => {
    items.forEach((item) => setStatus(item.dataset.pagesCheck, "unchecked"));
    overall.textContent = "確認中";
    overall.classList.remove("status-pill--live", "status-pill--danger");

    const baseUrl = toBaseUrl();
    const base = baseUrl.toString();
    if (urlInput.value.trim()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, urlInput.value.trim());
      } catch (_) {
        // Do not stop the public asset checks when URL persistence is blocked.
      }
    }
    helpText.textContent = `チェック基準URL: ${base}`;

    let indexText = "";
    let cssText = "";

    try {
      indexText = await fetchText(assetUrl(baseUrl, "index.html"));
      setStatus("index", indexText.includes("橋本競馬AI") ? "ok" : "warning", indexText.includes("橋本競馬AI") ? "index.htmlを取得しました" : "HTMLは取得できましたがタイトル確認が必要です");
    } catch (error) {
      setStatus("index", "warning", `index.html取得エラー: ${error.message}`);
    }

    try {
      cssText = await fetchText(assetUrl(baseUrl, "src/dashboard.css"));
      setStatus("css", cssText.includes("--gold") && cssText.includes("--bg") ? "ok" : "warning", cssText.includes("--gold") ? "黒×金デザインCSSを取得しました" : "CSSは取得できましたが黒×金設定の確認が必要です");
    } catch (error) {
      setStatus("css", "warning", `CSS取得エラー: ${error.message}`);
    }

    try {
      const jsText = await fetchText(assetUrl(baseUrl, "src/dashboard.js"));
      setStatus("javascript", jsText.includes("pages-check-form") || jsText.includes("self-evolution" ) ? "ok" : "warning", "JavaScriptファイルを取得しました");
    } catch (error) {
      setStatus("javascript", "warning", `JavaScript取得エラー: ${error.message}`);
    }

    try {
      const manifest = await fetchJson(assetUrl(baseUrl, "manifest.json"));
      setStatus("manifest", manifest.name || manifest.short_name ? "ok" : "warning", manifest.name || manifest.short_name ? "manifest.jsonをJSONとして取得しました" : "manifest.jsonのname設定を確認してください");
    } catch (error) {
      setStatus("manifest", "warning", `manifest取得エラー: ${error.message}`);
    }

    try {
      const data = await fetchJson(assetUrl(baseUrl, "data/selfEvolutionLogs.json"));
      setStatus("data-json", data && typeof data === "object" ? "ok" : "warning", "data/selfEvolutionLogs.jsonをJSONとして取得しました");
    } catch (error) {
      setStatus("data-json", "warning", `data JSON取得エラー: ${error.message}`);
    }

    try {
      checkLocalStorage();
      setStatus("localstorage", "ok", "localStorageへテスト書き込みできました");
    } catch (error) {
      setStatus("localstorage", "warning", `localStorage利用不可: ${error.message}`);
    }

    const hasViewport = indexText.includes('name="viewport"') || indexText.includes("name='viewport'");
    const hasIpadCss = cssText.includes("max-width: 1180px") && cssText.includes("device-command-ui");
    setStatus("ipad", hasViewport && hasIpadCss ? "ok" : "warning", hasViewport && hasIpadCss ? "iPad用クイックUIとviewport設定を確認しました" : "iPad幅の表示は実機Safariでも確認してください");

    const hasSmartphoneCss = cssText.includes("max-width: 760px") || cssText.includes("max-width: 560px");
    setStatus("smartphone", hasViewport && hasSmartphoneCss ? "ok" : "warning", hasViewport && hasSmartphoneCss ? "スマホ用media queryとviewport設定を確認しました" : "スマホ表示は実機でも確認してください");

    updateOverall();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runCheck();
  });

  if (document.readyState === "complete") {
    runCheck();
  } else {
    window.addEventListener("load", runCheck, { once: true });
  }
})();
