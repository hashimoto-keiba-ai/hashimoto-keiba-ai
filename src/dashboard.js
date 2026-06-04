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

  const JOCKEY_RISK_CORRECTION_TABLE = {
    ルメール: -8,
    川田: -7,
    武豊: -5,
    戸崎: -4,
    横山武: -3,
    松山: -3,
    坂井: -2,
    モレイラ: -8,
    レーン: -6,
    新人: 10,
    若手: 7,
    乗替: 6,
    未設定: 8,
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
  const clampDangerScore = (value) => clampScore(value);

  const getJockeyRiskCorrection = (jockey) => {
    const normalized = normalizeText(jockey) || "未設定";
    const matchedKey = Object.keys(JOCKEY_RISK_CORRECTION_TABLE).find((key) => normalized.includes(key));
    return JOCKEY_RISK_CORRECTION_TABLE[matchedKey] ?? 2;
  };

  const createDangerReason = (label, score, detail) => ({ label, score: roundCorrection(score), detail });

  const calculateDangerPopularAssessment = (horse = {}) => {
    const popularity = toNumber(horse.popularity, 99);
    const odds = toNumber(horse.odds, 99);
    const fieldSize = Math.max(1, toNumber(horse.fieldSize, 18));
    const style = normalizeRunningStyleKey(horse.runningStyle);
    const corner = toNumber(horse.cornerPosition, fieldSize);
    const distance = toNumber(horse.distance ?? horse.raceDistance, 0);
    const going = normalizeText(horse.going || "良");
    const aiWinRate = toNumber(horse.aiWinRate, 0);
    const marketWinRate = odds > 0 ? 100 / odds : 0;
    const isPopularTarget = popularity >= 1 && popularity <= 3;
    const components = {
      overPopularity: isPopularTarget ? (popularity === 1 ? 26 : popularity === 2 ? 22 : 18) + (odds <= 2.5 ? 12 : odds <= 4 ? 8 : odds <= 6 ? 4 : 0) + (aiWinRate && marketWinRate - aiWinRate >= 8 ? 10 : 0) : 0,
      paceMismatch: unfavorableStylePenalty({ ...horse, fieldSize }),
      positionMismatch: (["逃げ", "先行", "好位"].includes(style) && corner > Math.ceil(fieldSize * 0.45)) || (["差し", "追込"].includes(style) && corner > Math.ceil(fieldSize * 0.78)) ? 12 : 0,
      distanceMismatch: !distance ? 10 : distance <= 1400 && ["差し", "追込"].includes(style) ? 7 : distance >= 2200 && ["逃げ", "先行"].includes(style) ? 8 : 0,
      goingMismatch: trackStyleBonus(horse.runningStyle, going) < 0 ? 12 : 0,
      jockeyCorrection: getJockeyRiskCorrection(horse.jockey),
    };
    const rawScore = Object.values(components).reduce((total, value) => total + toNumber(value), 8);
    const dangerScore = isPopularTarget ? clampDangerScore(rawScore) : 0;
    const reasons = [
      components.overPopularity > 0 ? createDangerReason("過剰人気", components.overPopularity, `${popularity}人気 ${odds}倍で市場評価が先行`) : null,
      components.paceMismatch > 0 ? createDangerReason("展開不一致", components.paceMismatch, `${normalizeText(horse.runningStyle) || "脚質未設定"}と想定位置が噛み合わない`) : null,
      components.positionMismatch > 0 ? createDangerReason("位置取り不一致", components.positionMismatch, `想定4角${corner}番手が脚質の理想位置から外れる`) : null,
      components.distanceMismatch > 0 ? createDangerReason("距離不一致", components.distanceMismatch, distance ? `${distance}mで${style}の適性に不安` : "距離データ不足で適性不明") : null,
      components.goingMismatch > 0 ? createDangerReason("馬場不一致", components.goingMismatch, `${going}馬場と${style}の相性が悪い`) : null,
      components.jockeyCorrection > 0 ? createDangerReason("騎手補正", components.jockeyCorrection, `${normalizeText(horse.jockey) || "騎手未設定"}で人気馬リスクを加点`) : null,
      components.jockeyCorrection < 0 ? createDangerReason("騎手補正", components.jockeyCorrection, `${normalizeText(horse.jockey)}で人気馬リスクを軽減`) : null,
    ].filter(Boolean);
    return {
      isDangerPopularTarget: isPopularTarget,
      dangerScore,
      components: Object.fromEntries(Object.entries(components).map(([key, value]) => [key, roundCorrection(value)])),
      reasons,
      reasonText: reasons.length ? reasons.map((reason) => `${reason.label}:${reason.detail}`).join(" / ") : "危険材料なし",
      trifectaHeadExcluded: dangerScore >= 75,
      win5Excluded: dangerScore >= 70,
    };
  };

  const detectDangerPopularHorses = (horses = [], raceContext = {}) => horses
    .map((horse) => ({ ...horse, dangerPopularAssessment: calculateDangerPopularAssessment({ ...raceContext, ...horse, fieldSize: raceContext.fieldSize || horse.fieldSize || horses.length || 18 }) }))
    .filter((horse) => horse.dangerPopularAssessment.isDangerPopularTarget && horse.dangerPopularAssessment.dangerScore > 0)
    .sort((a, b) => b.dangerPopularAssessment.dangerScore - a.dangerPopularAssessment.dangerScore);

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
        jockeyConcern: Math.max(0, getJockeyRiskCorrection(horse.jockey)),
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
    const dangerPopularAssessment = calculateDangerPopularAssessment(scoringBase);
    const namedComponents = buildNamedScoreComponents(scoringBase, dangerBreakdown.finalScore);
    const aiIndex = aiManual ? clampScore(horse.aiIndex ?? horse["AI指数"]) : aiBreakdown.finalScore;
    const kamianaIndex = kamianaManual ? clampScore(horse.kamianaIndex ?? horse["神穴指数"]) : kamianaBreakdown.finalScore;
    const dangerIndex = dangerManual ? clampScore(horse.dangerIndex ?? horse["危険人気馬指数"]) : Math.max(dangerBreakdown.finalScore, dangerPopularAssessment.dangerScore);
    return {
      ...horse,
      aiIndex,
      kamianaIndex,
      dangerIndex,
      dangerPopularAssessment,
      dangerReasons: dangerPopularAssessment.reasons,
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
    calculateDangerPopularAssessment,
    detectDangerPopularHorses,
    getJockeyRiskCorrection,
    calculateAllHorseScores,
    formatScoreBreakdown,
    buildNamedScoreComponents,
    COURSE_CORRECTION_TABLE,
    DISTANCE_CORRECTION_TABLE,
    SURFACE_CORRECTION_TABLE,
    PACE_STYLE_CORRECTION_TABLE,
    JOCKEY_RISK_CORRECTION_TABLE,
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
  const dangerReasonSummary = (horse) => horse?.dangerPopularAssessment?.reasonText || (horse?.dangerReasons || []).map((reason) => `${reason.label}:${reason.detail}`).join(" / ") || `危険人気馬指数${toNumber(horse?.dangerIndex).toFixed(1)}`;
  const isDangerPopular = (horse) => toNumber(horse?.dangerIndex) >= 80 || Boolean(horse?.dangerPopularAssessment?.trifectaHeadExcluded);
  const isWin5DangerExcluded = (horse) => isDangerPopular(horse) || Boolean(horse?.dangerPopularAssessment?.win5Excluded);
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
        horseReason(second, "2着: AI指数上位4頭から危険人気馬検出馬を除外"),
        horseReason(third, isDangerPopular(third) ? `3着: 危険人気馬だが条件付き残し（${dangerReasonSummary(third)}）` : "3着: AI上位5頭＋神穴上位2頭の採用枠"),
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
        firstRule: "1着候補はAI指数上位2頭から危険人気馬検出馬を除外",
        secondRule: "2着候補はAI指数上位4頭から危険人気馬検出馬を除外",
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
    const dangerExcluded = horses.filter(isWin5DangerExcluded);
    const available = (horse) => horse && !isWin5DangerExcluded(horse);
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
        b: "AI指数上位。ただし危険人気馬検出馬は除外",
        c: "神穴指数上位。ただし危険人気馬検出馬は除外",
        d: "人気薄＋神穴指数高。ただし危険人気馬検出馬は除外",
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
  const RACE_DATABASE_STORAGE_KEY = "raceDatabase";
  const PRODUCTION_RACE_STORAGE_KEY = "hashimoto-keiba-ai:production-race-entry:v1";
  const PRODUCTION_RUN_REPORT_STORAGE_KEY = "productionRunReports";
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const normalizeText = (value) => String(value || "").trim();

  const normalizeRace = (race = {}) => ({
    date: race.date || new Date().toISOString().slice(0, 10),
    course: normalizeText(race.course || race.racecourse || "未設定"),
    raceNumber: toNumber(race.raceNumber, race.raceNo || 0),
    raceName: normalizeText(race.raceName || race.name || "本番入力レース"),
    distance: toNumber(race.distance, 0),
    surface: normalizeText(race.surface || race["芝ダート"] || ""),
    going: normalizeText(race.going || race.trackCondition || race["馬場状態"] || "良"),
    weather: normalizeText(race.weather || ""),
    fieldSize: toNumber(race.fieldSize, race.runnerCount || 0),
  });

  const normalizeHorse = (horse = {}) => ({
    ...horse,
    number: toNumber(horse.number ?? horse["馬番"], 0),
    name: normalizeText(horse.name ?? horse["馬名"]),
    popularity: toNumber(horse.popularity ?? horse["人気"], 18),
    odds: toNumber(horse.odds ?? horse["オッズ"], 99),
    jockey: normalizeText(horse.jockey ?? horse["騎手"]),
    trainer: normalizeText(horse.trainer ?? horse["調教師"]),
    runningStyle: normalizeText(horse.runningStyle ?? horse["脚質"]),
    training: normalizeText((horse.training ?? horse["調教評価"]) || "B"),
    cornerPosition: toNumber(horse.cornerPosition ?? horse["想定4角位置"], horse.number ?? horse["馬番"] ?? 18),
  });

  const validateProductionInput = ({ race = {}, horses = [] } = {}) => {
    const normalizedRace = normalizeRace(race);
    const normalizedHorses = horses.map(normalizeHorse).filter((horse) => horse.number && horse.name);
    const errors = [
      !normalizedRace.course || normalizedRace.course === "未設定" ? "競馬場を入力してください" : null,
      !normalizedRace.raceNumber ? "レース番号を入力してください" : null,
      !normalizedRace.raceName || normalizedRace.raceName === "本番入力レース" ? "レース名を入力してください" : null,
      normalizedHorses.length < 3 ? "出走馬を3頭以上入力してください" : null,
    ].filter(Boolean);
    const warnings = [
      !normalizedRace.distance ? "距離が未入力です" : null,
      !normalizedRace.surface ? "芝/ダートが未入力です" : null,
      normalizedHorses.some((horse) => !horse.jockey) ? "騎手未入力の馬がいます" : null,
      normalizedHorses.some((horse) => !horse.runningStyle) ? "脚質未入力の馬がいます" : null,
    ].filter(Boolean);
    return { ok: errors.length === 0, errors, warnings, race: normalizedRace, horses: normalizedHorses };
  };

  const requireProductionInput = (options = {}) => {
    const validation = validateProductionInput(options);
    if (!validation.ok) {
      const error = new Error(`本番AI一括実行の入力チェックで停止: ${validation.errors.join(" / ")}`);
      error.validation = validation;
      throw error;
    }
    return validation;
  };

  const flattenTickets = (tickets = {}) => [
    ...(Array.isArray(tickets.main) ? tickets.main : []),
    ...(Array.isArray(tickets.attack) ? tickets.attack : []),
    ...(Array.isArray(tickets.jackpot) ? tickets.jackpot : []),
  ];

  const flattenWin5Candidates = (zones = {}) => Object.entries(zones).flatMap(([zone, horses]) => (Array.isArray(horses) ? horses : []).map((horse) => ({ ...horse, zone: zone.toUpperCase() })));

  const summarizeTicket = (ticket = null) => ticket?.notation || [ticket?.first, ticket?.second, ticket?.third]
    .filter(Boolean)
    .map((horse) => horse?.number ?? horse)
    .join("→") || "該当なし";

  const buildProductionPredictionLog = (payload = {}) => ({
    generatedAt: payload.generatedAt,
    race: payload.race,
    aiTop5: (payload.aiIndexRanking || []).slice(0, 5),
    kamianaTop5: (payload.kamianaRanking || payload.kamiana || []).slice(0, 5),
    dangerTop5: (payload.dangerPopularRanking || payload.dangerPopular || []).slice(0, 5),
    trifectaCandidates: flattenTickets(payload.trifecta?.tickets).slice(0, 8),
    win5Candidates: flattenWin5Candidates(payload.win5?.zones).slice(0, 8),
    simulationWinTop5: (payload.raceSimulation?.rankings?.winRate || []).slice(0, 5),
    simulationCount: payload.raceSimulation?.simulationCount || null,
    evTop: (payload.ev?.evRanking || []).slice(0, 8),
    capitalSummary: payload.capital?.summary || {},
    recommendedInvestments: Object.values(payload.capital?.ticketGroups || {}).flat().slice(0, 8),
    godRace: payload.godRace,
  });

  const topHorseFields = (horses = [], limit = 3) => horses.slice(0, limit).map((horse, index) => ({
    rank: index + 1,
    number: horse.number,
    name: horse.name,
    popularity: horse.popularity,
    odds: horse.odds,
    aiIndex: horse.aiIndex,
    kamianaIndex: horse.kamianaIndex,
    dangerIndex: horse.dangerIndex,
  }));

  const buildRaceDatabaseRecord = ({ payload = {}, validationReport = null } = {}) => {
    if (!payload?.race) throw new Error("raceDatabase保存用の本番レースpayloadがありません");
    const race = normalizeRace(payload.race);
    const existingResult = payload.result || payload.validationReport || null;
    const result = validationReport || existingResult;
    return {
      id: payload.id || `production:${race.date}:${race.course}:${race.raceNumber}`,
      savedAt: new Date().toISOString(),
      generatedAt: payload.generatedAt || new Date().toISOString(),
      storageVersion: 2,
      date: race.date,
      course: race.course,
      raceNumber: race.raceNumber,
      raceName: race.raceName,
      distance: race.distance,
      surface: race.surface,
      going: race.going,
      fieldSize: race.fieldSize || payload.summary?.runnerCount || (Array.isArray(payload.horses) ? payload.horses.length : 0),
      aiIndexTop3: topHorseFields(payload.aiIndexRanking || [], 3),
      kamianaTop3: topHorseFields(payload.kamianaRanking || payload.kamiana || [], 3),
      dangerPopularTop3: topHorseFields(payload.dangerPopularRanking || payload.dangerPopular || [], 3),
      trifectaCandidates: flattenTickets(payload.trifecta?.tickets).slice(0, 12),
      win5Candidates: flattenWin5Candidates(payload.win5?.zones).slice(0, 12),
      evTop: (payload.ev?.evRanking || payload.summary?.evTop || []).slice(0, 8),
      recommendedInvestmentAmount: toNumber(payload.capital?.summary?.totalRecommended ?? payload.summary?.recommendedInvestmentAmount, 0),
      result: result?.result || null,
      trifectaPayout: result?.result?.trifectaPayout ?? result?.trifectaPayout ?? null,
      investmentAmount: result?.totalInvestment ?? result?.investment ?? result?.result?.investmentAmount ?? null,
      payoutAmount: result?.payout ?? result?.result?.payoutAmount ?? null,
      roi: result?.roi ?? result?.summary?.roi ?? null,
      hit: result?.summary?.hit ?? result?.trifectaHit ?? result?.judgements?.trifectaHit ?? null,
      verificationMemo: result?.result?.memo || result?.memo || "",
      godRaceJudgement: payload.godRace || payload.summary?.godRaceJudgement || null,
      summary: payload.summary || { runnerCount: Array.isArray(payload.horses) ? payload.horses.length : 0 },
      predictionPayload: payload,
      validationReport: result || null,
    };
  };

  const normalizeRaceDatabaseRecord = (entry = {}) => entry?.predictionPayload
    ? entry
    : buildRaceDatabaseRecord({ payload: entry, validationReport: entry.validationReport || null });

  const buildProductionRunReport = ({ payload, validation = null, operationReportEngine = window.HashimotoOperationDiagnosticReportEngine } = {}) => {
    if (!payload) throw new Error("本番AI一括実行レポートのpayloadがありません");
    const inputCheck = validation || validateProductionInput({ race: payload.race, horses: payload.horses });
    const predictionLog = buildProductionPredictionLog(payload);
    const diagnosticReport = operationReportEngine?.buildOperationDiagnosticReport
      ? operationReportEngine.buildOperationDiagnosticReport({ predictionLog, source: "production-ai-batch-run", generatedAt: payload.generatedAt })
      : null;
    const mainTrifecta = payload.trifecta?.tickets?.main?.[0] || flattenTickets(payload.trifecta?.tickets)[0] || null;
    const attackTrifecta = payload.trifecta?.tickets?.attack?.[0] || flattenTickets(payload.trifecta?.tickets).find((ticket) => ticket.type === "攻撃型") || null;
    const win5Candidates = flattenWin5Candidates(payload.win5?.zones).slice(0, 5);
    const evTop = (payload.ev?.evRanking || []).slice(0, 5);
    const operationMode = inputCheck.ok && (payload.godRace?.skip === false || toNumber(payload.summary?.topEV) >= 100) && toNumber(payload.capital?.summary?.totalRecommended) > 0
      ? "本番運用可能"
      : "要確認";
    return {
      id: `production-run-${(payload.generatedAt || new Date().toISOString()).replace(/[:.]/g, "-")}`,
      generatedAt: payload.generatedAt || new Date().toISOString(),
      storageKey: PRODUCTION_RUN_REPORT_STORAGE_KEY,
      source: "production-ai-batch-run",
      inputCheck,
      executionSteps: [
        "入力チェック",
        "AI指数自動計算",
        "神穴指数計算",
        "危険人気馬指数計算",
        "AI指数ランキング更新",
        "神穴ランキング更新",
        "危険人気馬ランキング更新",
        "三連単生成",
        "WIN5候補生成",
        "未来シミュレーター",
        "EV計算",
        "資金配分",
        "神レース判定",
        "診断レポート生成",
      ].map((label, index) => ({ order: index + 1, label, status: "完了" })),
      race: payload.race,
      summary: {
        aiIndexTop: payload.summary?.topAi || payload.aiIndexRanking?.[0] || null,
        kamianaTop: payload.summary?.topKamiana || payload.kamiana?.[0] || payload.kamianaRanking?.[0] || null,
        dangerPopularTop: payload.summary?.topDangerPopular || payload.dangerPopular?.[0] || payload.dangerPopularRanking?.[0] || null,
        mainTrifecta,
        attackTrifecta,
        mainTrifectaText: summarizeTicket(mainTrifecta),
        attackTrifectaText: summarizeTicket(attackTrifecta),
        win5Candidates,
        evTop,
        recommendedInvestmentAmount: toNumber(payload.capital?.summary?.totalRecommended, 0),
        godRaceJudgement: payload.godRace || null,
        operationMode,
      },
      diagnosticReport,
      productionPayload: payload,
    };
  };

  const buildAiAnalysisPayload = ({ race = {}, horses = [], simulationCount = 1000, capitalSettings = {}, persistEngines = true } = {}) => {
    const scoreEngine = window.HashimotoKeibaAiScoreEngine;
    const betEngine = window.HashimotoBetEngine;
    const evEngine = window.HashimotoEVEngine;
    const capitalEngine = window.HashimotoCapitalEngine;
    const godRaceEngine = window.HashimotoGodRaceEngine;
    const raceSimulator = window.HashimotoRaceSimulator;
    if (!scoreEngine || !betEngine || !evEngine || !capitalEngine || !godRaceEngine) {
      throw new Error("本番レースAI実行に必要なエンジンが未読込です");
    }

    const normalizedRace = normalizeRace(race);
    const normalizedHorses = horses.map(normalizeHorse).filter((horse) => horse.number && horse.name);
    const raceContext = { ...normalizedRace, fieldSize: normalizedRace.fieldSize || normalizedHorses.length };
    const scoredHorses = scoreEngine.calculateAllHorseScores(normalizedHorses, raceContext);
    const aiIndexRanking = [...scoredHorses].sort((a, b) => b.aiIndex - a.aiIndex);
    const kamianaRanking = [...scoredHorses].sort((a, b) => b.kamianaIndex - a.kamianaIndex);
    const dangerPopularRanking = [...scoredHorses].sort((a, b) => b.dangerIndex - a.dangerIndex);
    const kamiana = kamianaRanking.filter((horse) => toNumber(horse.popularity, 99) >= 6 || toNumber(horse.odds) >= 15);
    const dangerPopular = dangerPopularRanking.filter((horse) => toNumber(horse.popularity, 99) <= 5);
    const trifectaPayload = betEngine.buildTrifectaPayload(scoredHorses, { race: raceContext, fieldSize: raceContext.fieldSize });
    const win5Payload = betEngine.buildWin5ClassificationPayload(scoredHorses, { race: raceContext });
    const simulationPayload = raceSimulator && scoredHorses.length >= 3
      ? raceSimulator.runMonteCarloSimulation(scoredHorses, { simulationCount, raceContext, seed: `${raceContext.date}:${raceContext.course}:${raceContext.raceNumber}:${scoredHorses.length}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) })
      : null;
    const evPayload = evEngine.buildEVDashboardPayload(scoredHorses, { trifectaPayload, win5Payload });
    const preliminaryGodRace = godRaceEngine.buildGodRacePayload({ horses: scoredHorses, evPayload, simulationPayload, race: raceContext, persist: false });
    const capitalPayload = capitalEngine.buildCapitalAllocationPayload({
      trifectaEV: evPayload.trifectaEV,
      win5EV: evPayload.win5EV,
      raceEV: evPayload.evRanking,
      race: raceContext,
      godRaceIndex: preliminaryGodRace.score,
      persist: persistEngines,
      ...capitalSettings,
    });
    const godRacePayload = godRaceEngine.buildGodRacePayload({ horses: scoredHorses, evPayload, capitalPayload, simulationPayload, race: raceContext, persist: persistEngines });

    return {
      id: `production:${raceContext.date}:${raceContext.course}:${raceContext.raceNumber}`,
      mode: "production-race-input",
      source: "netkeiba-entry-manual",
      storageKeys: { production: PRODUCTION_RACE_STORAGE_KEY, raceDatabase: RACE_DATABASE_STORAGE_KEY, productionRunReports: PRODUCTION_RUN_REPORT_STORAGE_KEY },
      generatedAt: new Date().toISOString(),
      storageVersion: 1,
      race: raceContext,
      horses: scoredHorses,
      aiIndexRanking,
      kamiana,
      kamianaRanking,
      dangerPopular,
      dangerPopularRanking,
      trifecta: trifectaPayload,
      win5: win5Payload,
      ev: evPayload,
      capital: capitalPayload,
      godRace: godRacePayload,
      raceSimulation: simulationPayload,
      summary: {
        runnerCount: scoredHorses.length,
        topAi: aiIndexRanking[0] || null,
        topKamiana: kamiana[0] || kamianaRanking[0] || null,
        topDangerPopular: dangerPopular[0] || dangerPopularRanking[0] || null,
        trifectaTicketCount: trifectaPayload.summary?.total || 0,
        win5CandidateCount: Object.values(win5Payload.zones || {}).flat().length,
        topEV: evPayload.evRanking?.[0]?.ev || 0,
        recommendedAmount: capitalPayload.summary?.totalRecommended || 0,
        godRaceScore: godRacePayload.score,
        godRaceLabel: godRacePayload.label,
      },
    };
  };

  const loadRaceDatabase = (storage = window.localStorage) => {
    try {
      const raw = storage?.getItem?.(RACE_DATABASE_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const records = Array.isArray(parsed) ? parsed : Array.isArray(parsed.races) ? parsed.races : [];
      return records.map((record) => {
        try { return normalizeRaceDatabaseRecord(record); } catch (error) { return record; }
      });
    } catch (error) {
      return [];
    }
  };

  const saveRaceDatabaseRecord = (record, storage = window.localStorage) => {
    if (!storage?.setItem) return record;
    const existing = loadRaceDatabase(storage).filter((race) => race.id !== record.id);
    storage.setItem(RACE_DATABASE_STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 200)));
    return record;
  };

  const saveProductionRace = (payload, storage = window.localStorage) => {
    if (!storage?.setItem) return payload;
    storage.setItem(PRODUCTION_RACE_STORAGE_KEY, JSON.stringify(payload));
    saveRaceDatabaseRecord(buildRaceDatabaseRecord({ payload }), storage);
    return payload;
  };

  const updateRaceDatabaseResult = ({ payload = {}, validationReport = null } = {}, storage = window.localStorage) => {
    if (!storage?.setItem || !payload?.race) return null;
    const record = buildRaceDatabaseRecord({ payload, validationReport });
    saveRaceDatabaseRecord(record, storage);
    return record;
  };

  const searchRaceDatabase = (filters = {}, storage = window.localStorage) => {
    const course = normalizeText(filters.course || filters.racecourse);
    const going = normalizeText(filters.going || filters.trackCondition);
    const distance = normalizeText(filters.distance);
    const surface = normalizeText(filters.surface);
    const godRace = normalizeText(filters.godRace || filters.godRaceJudgement);
    const roiSign = normalizeText(filters.roiSign);
    const hitStatus = normalizeText(filters.hitStatus);
    const from = filters.from || filters.startDate || filters.dateFrom || "";
    const to = filters.to || filters.endDate || filters.dateTo || "";
    return loadRaceDatabase(storage).filter((record) => {
      if (course && !normalizeText(record.course || record.race?.course).includes(course)) return false;
      if (going && normalizeText(record.going || record.race?.going) !== going) return false;
      if (surface && normalizeText(record.surface || record.race?.surface) !== surface) return false;
      if (distance && String(record.distance || record.race?.distance || "") !== distance) return false;
      if (godRace) {
        const label = normalizeText(record.godRaceJudgement?.label || record.godRaceJudgement?.grade || record.godRaceJudgement?.action);
        const isGodRace = /神|S|A|勝負/.test(label) && !/見送り/.test(label);
        if (godRace === "god" && !isGodRace) return false;
        if (godRace === "skip" && isGodRace) return false;
      }
      const roi = record.roi;
      if (roiSign === "plus" && !(Number(roi) >= 100)) return false;
      if (roiSign === "minus" && !(Number(roi) < 100)) return false;
      const isHit = record.hit ?? record.validationReport?.summary?.hit ?? record.validationReport?.judgements?.trifectaHit ?? (toNumber(record.payoutAmount, 0) > 0);
      if (hitStatus === "hit" && !isHit) return false;
      if (hitStatus === "miss" && isHit) return false;
      const date = record.date || record.race?.date || "";
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });
  };

  const summarizeRaceDatabase = (records = []) => {
    const collection = records.map((record) => ({
      ...record,
      investmentAmount: toNumber(record.investmentAmount ?? record.validationReport?.totalInvestment ?? record.validationReport?.investment, 0),
      payoutAmount: toNumber(record.payoutAmount ?? record.validationReport?.payout, 0),
      roi: record.roi ?? record.validationReport?.roi ?? null,
      hit: record.hit ?? record.validationReport?.summary?.hit ?? record.validationReport?.judgements?.trifectaHit ?? false,
    }));
    const totalInvestment = collection.reduce((sum, record) => sum + record.investmentAmount, 0);
    const totalPayout = collection.reduce((sum, record) => sum + record.payoutAmount, 0);
    const buildGroup = (key) => Object.values(collection.reduce((groups, record) => {
      const label = normalizeText(record[key] || record.race?.[key] || "未設定");
      groups[label] = groups[label] || { label, races: 0, investment: 0, payout: 0, roi: 0 };
      groups[label].races += 1;
      groups[label].investment += record.investmentAmount;
      groups[label].payout += record.payoutAmount;
      groups[label].roi = groups[label].investment > 0 ? round((groups[label].payout / groups[label].investment) * 100, 1) : 0;
      return groups;
    }, {})).sort((a, b) => b.roi - a.roi || b.races - a.races);
    return {
      raceCount: collection.length,
      hitCount: collection.filter((record) => record.hit).length,
      hitRate: collection.length ? round((collection.filter((record) => record.hit).length / collection.length) * 100, 1) : 0,
      totalInvestment,
      totalPayout,
      totalRoi: totalInvestment > 0 ? round((totalPayout / totalInvestment) * 100, 1) : 0,
      roiByCourse: buildGroup("course"),
      roiByDistance: buildGroup("distance"),
    };
  };

  const exportRaceDatabaseJson = (records = [], filters = {}) => JSON.stringify({
    exportedAt: new Date().toISOString(),
    storageKey: RACE_DATABASE_STORAGE_KEY,
    filters,
    summary: summarizeRaceDatabase(records),
    races: records,
  }, null, 2);

  const saveProductionRunReportToRaceDatabase = (report, storage = window.localStorage) => {
    const payload = report?.productionPayload || report?.payload || null;
    if (!payload?.race) return null;
    return saveRaceDatabaseRecord(buildRaceDatabaseRecord({ payload, validationReport: report.validationReport || null }), storage);
  };

  const saveProductionRunReportsToRaceDatabase = (reports = [], storage = window.localStorage) => reports
    .map((report) => saveProductionRunReportToRaceDatabase(report, storage))
    .filter(Boolean);

  const buildAndSaveProductionRace = (options = {}, storage = window.localStorage) => {
    const payload = buildAiAnalysisPayload(options);
    return saveProductionRace(payload, storage);
  };

  const loadProductionRunReports = (storage = window.localStorage) => {
    try {
      const parsed = JSON.parse(storage?.getItem?.(PRODUCTION_RUN_REPORT_STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const saveProductionRunReport = (report, storage = window.localStorage) => {
    if (!storage?.setItem) return [report];
    const reports = [report, ...loadProductionRunReports(storage).filter((item) => item.id !== report.id)].slice(0, 50);
    storage.setItem(PRODUCTION_RUN_REPORT_STORAGE_KEY, JSON.stringify(reports));
    return reports;
  };

  const buildAndSaveProductionRunReport = (options = {}, storage = window.localStorage) => {
    const validation = requireProductionInput(options);
    const payload = buildAiAnalysisPayload(options);
    saveProductionRace(payload, storage);
    const report = buildProductionRunReport({ payload, validation });
    saveProductionRunReport(report, storage);
    return report;
  };

  window.HashimotoProductionRaceEngine = {
    RACE_DATABASE_STORAGE_KEY,
    PRODUCTION_RACE_STORAGE_KEY,
    PRODUCTION_RUN_REPORT_STORAGE_KEY,
    normalizeRace,
    normalizeHorse,
    validateProductionInput,
    buildAiAnalysisPayload,
    buildProductionPredictionLog,
    buildProductionRunReport,
    buildRaceDatabaseRecord,
    loadRaceDatabase,
    saveRaceDatabaseRecord,
    searchRaceDatabase,
    summarizeRaceDatabase,
    exportRaceDatabaseJson,
    saveProductionRunReportToRaceDatabase,
    saveProductionRunReportsToRaceDatabase,
    updateRaceDatabaseResult,
    saveProductionRace,
    buildAndSaveProductionRace,
    loadProductionRunReports,
    saveProductionRunReport,
    buildAndSaveProductionRunReport,
  };
})();


(() => {
  const STORAGE_KEY = "sampleRaceResultValidationLog";
  const SELF_EVOLUTION_STORAGE_KEY = "hashimoto-keiba-ai:self-evolution-logs:v1";
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const normalizeNumber = (value) => String(value ?? "").trim();
  const asArray = (value) => Array.isArray(value) ? value : [];
  const ticketNumbers = (ticket = {}) => [ticket.first, ticket.second, ticket.third].map((entry) => normalizeNumber(typeof entry === "object" ? entry?.number : entry));
  const horseNumber = (horse = {}) => normalizeNumber(horse.number ?? horse.horseNumber ?? horse["馬番"]);
  const includesHorse = (items = [], number) => asArray(items).some((item) => horseNumber(item) === normalizeNumber(number));

  const normalizeResultInput = (input = {}) => ({
    firstNumber: normalizeNumber(input.firstNumber),
    secondNumber: normalizeNumber(input.secondNumber),
    thirdNumber: normalizeNumber(input.thirdNumber),
    trifectaPayout: toNumber(input.trifectaPayout, 0),
    actualPace: String(input.actualPace || "").trim(),
    trackBias: String(input.trackBias || input.trackTrend || "").trim(),
    memo: String(input.memo || "").trim(),
  });

  const normalizePredictionLog = (log = {}) => ({
    ...log,
    aiTop: asArray(log.aiTop || log.aiTop5),
    trifectaCandidates: asArray(log.trifectaCandidates),
    win5Candidates: asArray(log.win5Candidates),
    dangerCandidates: asArray(log.dangerCandidates || log.dangerTop5),
    kamianaCandidates: asArray(log.kamianaCandidates || log.kamianaTop5),
    evTop: asArray(log.evTop || log.evRanking),
    recommendedInvestments: asArray(log.recommendedInvestments),
  });

  const calculateInvestment = (prediction) => {
    const capitalTotal = toNumber(prediction.capitalSummary?.totalRecommended, 0);
    if (capitalTotal > 0) return capitalTotal;
    const recommendedTotal = prediction.recommendedInvestments.reduce((sum, item) => sum + toNumber(item.recommendedAmount, 0), 0);
    if (recommendedTotal > 0) return recommendedTotal;
    const trifectaStake = prediction.trifectaCandidates.length * 100;
    const win5Stake = prediction.win5Candidates.length * 100;
    return trifectaStake + win5Stake;
  };

  const buildJudgements = (prediction, result, totalInvestment, payout) => {
    const topAiNumber = horseNumber(prediction.aiTop[0]);
    const actualTop3 = [result.firstNumber, result.secondNumber, result.thirdNumber].filter(Boolean);
    const trifectaHit = prediction.trifectaCandidates.some((ticket) => ticketNumbers(ticket).join("-") === actualTop3.join("-"));
    const win5Hit = includesHorse(prediction.win5Candidates, result.firstNumber);
    const kamianaHit = prediction.kamianaCandidates.some((horse) => actualTop3.includes(horseNumber(horse)));
    const dangerCandidates = prediction.dangerCandidates.filter((horse) => toNumber(horse.popularity, 99) <= 5 || toNumber(horse.dangerIndex, 0) >= 75);
    const dangerPopularSuccess = dangerCandidates.length ? dangerCandidates.every((horse) => !actualTop3.includes(horseNumber(horse))) : false;
    const evSuccess = prediction.evTop.length ? prediction.evTop.slice(0, 3).some((item) => actualTop3.includes(horseNumber(item))) : payout > totalInvestment;
    const capitalSuccess = totalInvestment > 0 ? payout >= totalInvestment : false;
    const godRace = prediction.godRace || {};
    const godRaceBattle = Boolean(godRace.battle) || [godRace.grade, godRace.label, godRace.action].some((value) => /S|A|勝負|神/.test(String(value || "")) && !/見送り/.test(String(value || "")));
    const godRaceSuccess = godRaceBattle ? payout > 0 || evSuccess : payout === 0;
    return {
      mainHit: Boolean(topAiNumber && topAiNumber === result.firstNumber),
      trifectaHit,
      win5Hit,
      kamianaHit,
      dangerPopularSuccess,
      godRaceSuccess,
      evSuccess,
      capitalSuccess,
    };
  };

  const buildSelfEvolutionLog = ({ prediction, result, judgements, roi, totalInvestment, payout }) => {
    const race = prediction.race || {};
    const missed = Object.entries(judgements).filter(([, value]) => !value).map(([key]) => key);
    const status = roi >= 100 && missed.length <= 2 ? "採用" : roi >= 60 ? "保留" : "削除";
    const beforeRule = "AI指数TOP、三連単候補、WIN5候補、神穴、危険人気馬、EV上位、推奨投資額をサンプル予想どおり評価";
    const afterRule = judgements.trifectaHit
      ? "三連単的中パターンとEV/資金配分条件を次回サンプル運用の採用候補へ昇格"
      : "外れた買い目・EV・資金配分の閾値を保留し、実ペース/馬場傾向との乖離を再補正";
    return {
      id: `sample-validation:${race.date || result.date || new Date().toISOString().slice(0, 10)}:${race.course || "course"}:${race.raceNumber || "R"}`,
      savedAt: new Date().toISOString(),
      source: "sample-race-result-validation",
      date: race.date || new Date().toISOString().slice(0, 10),
      racecourse: race.course || "未設定",
      raceNumber: race.raceNumber || "未設定",
      targetAi: "橋本競馬AIサンプル実戦運用",
      beforeRule,
      afterRule,
      reason: `本命${judgements.mainHit ? "的中" : "不的中"} / 三連単${judgements.trifectaHit ? "的中" : "不的中"} / ROI ${round(roi, 1)}% / 投資${totalInvestment}円 / 払戻${payout}円`,
      evidenceRace: `${race.date || "未日付"} ${race.course || "未競馬場"} ${race.raceNumber || "?"}R ${race.raceName || "サンプルレース"} / 1-2-3着 ${result.firstNumber}-${result.secondNumber}-${result.thirdNumber}`,
      status,
      nextUsageNote: result.actualPace || result.trackBias
        ? `次回は実ペース「${result.actualPace || "未入力"}」・馬場傾向「${result.trackBias || "未入力"}」を展開/馬場補正に反映。${result.memo || ""}`.trim()
        : `次回は外れ項目（${missed.join(" / ") || "なし"}）の閾値を重点確認。`,
      race,
      predictionCheck: judgements,
      learningPoint: afterRule,
      adoptRule: status === "採用" ? afterRule : "",
      pendingRule: status === "保留" ? afterRule : "",
      deleteRule: status === "削除" ? afterRule : "",
    };
  };

  const buildOsUpdateCandidates = (judgements, result, roi) => ({
    adopt: [
      judgements.mainHit ? "AI指数TOPを本命軸として継続採用" : null,
      judgements.trifectaHit ? "的中三連単フォーメーションを同条件で採用候補化" : null,
      judgements.dangerPopularSuccess ? "危険人気馬の消し/軽視判定を採用候補化" : null,
      roi >= 100 ? "ROIプラスの資金配分ルールを採用候補化" : null,
    ].filter(Boolean),
    pending: [
      !judgements.evSuccess ? "EV上位と実着順の乖離を保留検証" : null,
      !judgements.kamianaHit ? "神穴候補の人気薄条件・馬場傾向一致条件を保留検証" : null,
      result.actualPace ? `実ペース「${result.actualPace}」の展開補正を次回テストで保留検証` : null,
    ].filter(Boolean),
    delete: [
      !judgements.trifectaHit ? "不的中三連単の重複/低EV買い目を削除候補化" : null,
      !judgements.capitalSuccess ? "回収不足の推奨投資配分を削除候補化" : null,
      !judgements.dangerPopularSuccess ? "馬券内に残った危険人気馬の消し条件を削除候補化" : null,
    ].filter(Boolean),
  });

  const validateSampleRaceResult = ({ predictionLog = {}, resultInput = {} } = {}) => {
    const prediction = normalizePredictionLog(predictionLog);
    const result = normalizeResultInput(resultInput);
    const totalInvestment = calculateInvestment(prediction);
    const payout = result.trifectaPayout > 0 && prediction.trifectaCandidates.some((ticket) => ticketNumbers(ticket).join("-") === [result.firstNumber, result.secondNumber, result.thirdNumber].join("-")) ? result.trifectaPayout : 0;
    const roi = totalInvestment > 0 ? round((payout / totalInvestment) * 100, 1) : 0;
    const judgements = buildJudgements(prediction, result, totalInvestment, payout);
    const selfEvolutionLog = buildSelfEvolutionLog({ prediction, result, judgements, roi, totalInvestment, payout });
    const osUpdateCandidates = buildOsUpdateCandidates(judgements, result, roi);
    return {
      generatedAt: new Date().toISOString(),
      storageKey: STORAGE_KEY,
      race: prediction.race || {},
      result,
      judgements,
      labels: {
        mainHit: judgements.mainHit ? "本命的中" : "本命不的中",
        trifectaHit: judgements.trifectaHit ? "三連単的中" : "三連単不的中",
        win5Hit: judgements.win5Hit ? "WIN5候補的中" : "WIN5候補不的中",
        kamianaHit: judgements.kamianaHit ? "神穴的中" : "神穴不的中",
        dangerPopularSuccess: judgements.dangerPopularSuccess ? "危険人気馬判定成功" : "危険人気馬判定失敗",
        godRaceSuccess: judgements.godRaceSuccess ? "神レース判定成功" : "神レース判定失敗",
        evSuccess: judgements.evSuccess ? "EV判定成功" : "EV判定失敗",
        capitalSuccess: judgements.capitalSuccess ? "資金配分成功" : "資金配分失敗",
      },
      totalInvestment,
      payout,
      roi,
      selfEvolutionLog,
      osUpdateCandidates,
    };
  };

  const saveValidationLog = (validation, storage = window.localStorage) => {
    storage?.setItem(STORAGE_KEY, JSON.stringify(validation));
    return validation;
  };

  const appendSelfEvolutionLog = (validation, storage = window.localStorage) => {
    if (!validation?.selfEvolutionLog || !storage) return null;
    let payload;
    try {
      payload = JSON.parse(storage.getItem(SELF_EVOLUTION_STORAGE_KEY) || "null");
    } catch (error) {
      payload = null;
    }
    const logs = payload?.logs || { resultVerifications: [], backtests: [], improvementProposals: [] };
    const collection = Array.isArray(logs.resultVerifications) ? logs.resultVerifications : [];
    const index = collection.findIndex((item) => item.id === validation.selfEvolutionLog.id);
    if (index >= 0) collection[index] = validation.selfEvolutionLog;
    else collection.unshift(validation.selfEvolutionLog);
    const nextPayload = {
      storageVersion: 1,
      type: "selfEvolutionLogs",
      provider: "localStorage",
      updatedAt: new Date().toISOString(),
      logs: { ...logs, resultVerifications: collection.slice(0, 100) },
    };
    storage.setItem(SELF_EVOLUTION_STORAGE_KEY, JSON.stringify(nextPayload));
    return nextPayload;
  };

  window.HashimotoSampleRaceValidationEngine = {
    STORAGE_KEY,
    SELF_EVOLUTION_STORAGE_KEY,
    normalizeResultInput,
    normalizePredictionLog,
    validateSampleRaceResult,
    saveValidationLog,
    appendSelfEvolutionLog,
  };
})();


(() => {
  const STORAGE_KEY = "productionResultValidationReports";
  const PRODUCTION_RUN_REPORT_STORAGE_KEY = "productionRunReports";
  const SELF_EVOLUTION_STORAGE_KEY = "hashimoto-keiba-ai:self-evolution-logs:v1";
  const SELF_EVOLUTION_LEGACY_KEY = "selfEvolutionLogs";
  const FUND_CURVE_STORAGE_KEY = "fundCurveRecords";
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const normalizeText = (value) => String(value || "").trim();
  const normalizeNumber = (value) => String(value ?? "").trim();
  const asArray = (value) => Array.isArray(value) ? value : [];
  const horseNumber = (horse = {}) => normalizeNumber(horse.number ?? horse.horseNumber ?? horse["馬番"]);
  const ticketNumbers = (ticket = {}) => [ticket.first, ticket.second, ticket.third].map((entry) => normalizeNumber(typeof entry === "object" ? entry?.number : entry));
  const flattenTickets = (tickets = {}) => [
    ...asArray(tickets.main),
    ...asArray(tickets.attack),
    ...asArray(tickets.jackpot),
  ];
  const flattenWin5Candidates = (zones = {}) => Object.entries(zones || {}).flatMap(([zone, horses]) => asArray(horses).map((horse) => ({ ...horse, zone: zone.toUpperCase() })));

  const safeParse = (storage, key, fallback) => {
    try {
      const value = storage?.getItem?.(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const normalizeCourse = (value) => normalizeText(value).replace(/競馬場$/, "");

  const normalizeResultInput = (input = {}) => ({
    date: normalizeText(input.date || new Date().toISOString().slice(0, 10)),
    course: normalizeText(input.course || input.racecourse),
    raceNumber: toNumber(input.raceNumber, 0),
    firstNumber: normalizeNumber(input.firstNumber),
    secondNumber: normalizeNumber(input.secondNumber),
    thirdNumber: normalizeNumber(input.thirdNumber),
    trifectaPayout: toNumber(input.trifectaPayout, 0),
    actualPace: normalizeText(input.actualPace),
    cornerMemo: normalizeText(input.cornerMemo || input.fourthCornerMemo),
    trackBias: normalizeText(input.trackBias || input.trackTrend),
    payoutAmount: toNumber(input.payoutAmount ?? input.payout, 0),
    investmentAmount: toNumber(input.investmentAmount ?? input.totalInvestment, 0),
    memo: normalizeText(input.memo),
  });

  const normalizeReport = (report = {}) => {
    const payload = report.productionPayload || {};
    const predictionLog = {
      race: report.race || payload.race || {},
      aiTop: asArray(report.summary?.aiIndexTop ? [report.summary.aiIndexTop] : []).concat(asArray(payload.aiIndexRanking)).filter(Boolean),
      trifectaCandidates: flattenTickets(payload.trifecta?.tickets).length ? flattenTickets(payload.trifecta?.tickets) : [report.summary?.mainTrifecta, report.summary?.attackTrifecta].filter(Boolean),
      win5Candidates: asArray(report.summary?.win5Candidates).length ? asArray(report.summary.win5Candidates) : flattenWin5Candidates(payload.win5?.zones),
      kamianaCandidates: asArray(payload.kamiana).length ? asArray(payload.kamiana) : asArray(payload.kamianaRanking),
      dangerCandidates: asArray(payload.dangerPopular).length ? asArray(payload.dangerPopular) : asArray(payload.dangerPopularRanking),
      evTop: asArray(report.summary?.evTop).length ? asArray(report.summary.evTop) : asArray(payload.ev?.evRanking),
      recommendedInvestmentAmount: toNumber(report.summary?.recommendedInvestmentAmount ?? payload.capital?.summary?.totalRecommended, 0),
      recommendedInvestments: Object.values(payload.capital?.ticketGroups || {}).flat(),
      godRace: report.summary?.godRaceJudgement || payload.godRace || null,
    };
    predictionLog.aiTop = predictionLog.aiTop.filter((horse, index, array) => horse && array.findIndex((item) => horseNumber(item) === horseNumber(horse)) === index);
    return { ...report, predictionLog };
  };

  const loadProductionRunReports = (storage = window.localStorage) => {
    const parsed = safeParse(storage, PRODUCTION_RUN_REPORT_STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  };

  const findMatchingProductionRunReport = (resultInput = {}, storage = window.localStorage) => {
    const result = normalizeResultInput(resultInput);
    return loadProductionRunReports(storage).find((report) => {
      const race = report.race || report.productionPayload?.race || {};
      return normalizeText(race.date) === result.date
        && normalizeCourse(race.course || race.racecourse) === normalizeCourse(result.course)
        && toNumber(race.raceNumber, 0) === result.raceNumber;
    }) || null;
  };

  const buildJudgements = (prediction, result, payout, totalInvestment) => {
    const actualTop3 = [result.firstNumber, result.secondNumber, result.thirdNumber].filter(Boolean);
    const aiTopNumber = horseNumber(prediction.aiTop[0]);
    const aiTopRank = actualTop3.indexOf(aiTopNumber) >= 0 ? actualTop3.indexOf(aiTopNumber) + 1 : "4着以下";
    const trifectaHit = prediction.trifectaCandidates.some((ticket) => ticketNumbers(ticket).join("-") === actualTop3.join("-"));
    const win5Hit = prediction.win5Candidates.some((horse) => horseNumber(horse) === result.firstNumber);
    const kamianaHit = prediction.kamianaCandidates.some((horse) => actualTop3.includes(horseNumber(horse)));
    const dangerCandidates = prediction.dangerCandidates.filter((horse) => toNumber(horse.popularity, 99) <= 5 || toNumber(horse.dangerIndex, 0) >= 75);
    const dangerPopularFlew = dangerCandidates.length ? dangerCandidates.every((horse) => !actualTop3.includes(horseNumber(horse))) : false;
    const evSuccess = prediction.evTop.length ? prediction.evTop.slice(0, 5).some((item) => actualTop3.includes(horseNumber(item))) || payout > totalInvestment : payout > totalInvestment;
    const recommendedAmount = toNumber(prediction.recommendedInvestmentAmount, 0);
    const capitalSuccess = recommendedAmount > 0 ? totalInvestment > 0 && payout >= totalInvestment : totalInvestment === 0;
    const godRace = prediction.godRace || {};
    const godRaceBattle = Boolean(godRace.battle) || [godRace.grade, godRace.label, godRace.action].some((value) => /S|A|勝負|神/.test(String(value || "")) && !/見送り/.test(String(value || "")));
    const godRaceSuccess = godRaceBattle ? (trifectaHit || win5Hit || payout > 0 || evSuccess) : payout === 0 || totalInvestment === 0;
    return {
      aiTopRank,
      mainHit: aiTopRank === 1,
      trifectaHit,
      win5Hit,
      kamianaHit,
      dangerPopularFlew,
      godRaceSuccess,
      evSuccess,
      capitalSuccess,
    };
  };

  const labelsFromJudgements = (judgements = {}) => ({
    mainHit: `AI指数1位: ${judgements.aiTopRank === "4着以下" ? "4着以下" : `${judgements.aiTopRank}着`}`,
    trifectaHit: judgements.trifectaHit ? "三連単的中" : "三連単不的中",
    win5Hit: judgements.win5Hit ? "WIN5候補的中" : "WIN5候補不的中",
    kamianaHit: judgements.kamianaHit ? "神穴候補が馬券内" : "神穴候補は馬券外",
    dangerPopularFlew: judgements.dangerPopularFlew ? "危険人気馬が飛んだ" : "危険人気馬が馬券内",
    godRaceSuccess: judgements.godRaceSuccess ? "神レース判定成功" : "神レース判定失敗",
    evSuccess: judgements.evSuccess ? "EV判定成功" : "EV判定失敗",
    capitalSuccess: judgements.capitalSuccess ? "資金配分成功" : "資金配分失敗",
  });

  const buildOsUpdateCandidates = (judgements, result, roi) => ({
    adopt: [
      judgements.mainHit ? "AI指数1位の軸評価を採用" : null,
      judgements.trifectaHit ? "的中三連単フォーメーションを採用" : null,
      judgements.dangerPopularFlew ? "危険人気馬の消し条件を採用" : null,
      roi >= 100 && judgements.capitalSuccess ? "資金配分ルールを採用" : null,
    ].filter(Boolean),
    pending: [
      !judgements.kamianaHit ? "神穴条件と馬場傾向の相関を保留検証" : null,
      !judgements.evSuccess ? "EV上位と実着順のズレを保留検証" : null,
      result.actualPace ? `実ペース「${result.actualPace}」補正を保留検証` : null,
      result.trackBias ? `馬場傾向「${result.trackBias}」補正を保留検証` : null,
    ].filter(Boolean),
    delete: [
      !judgements.trifectaHit ? "不的中三連単の低EV・重複買い目を削除候補化" : null,
      !judgements.dangerPopularFlew ? "危険人気馬の過剰な消し条件を削除候補化" : null,
      !judgements.capitalSuccess ? "回収不足の資金配分を削除候補化" : null,
    ].filter(Boolean),
  });

  const buildSelfEvolutionLog = ({ report, result, judgements, roi, totalInvestment, payout, osUpdateCandidates }) => {
    const race = report.predictionLog.race || {};
    const badKeys = Object.entries(judgements).filter(([key, value]) => key !== "aiTopRank" && !value).map(([key]) => key);
    const status = roi >= 100 && badKeys.length <= 2 ? "採用" : roi >= 50 || judgements.evSuccess || judgements.kamianaHit ? "保留" : "削除";
    const afterRule = osUpdateCandidates.adopt[0] || osUpdateCandidates.pending[0] || osUpdateCandidates.delete[0] || "本番結果検証を次回閾値調整へ反映";
    return {
      id: `production-validation:${result.date}:${result.course}:${result.raceNumber}`,
      savedAt: new Date().toISOString(),
      source: "production-result-validation",
      date: result.date,
      racecourse: result.course || race.course || "未設定",
      raceNumber: result.raceNumber || race.raceNumber || "未設定",
      targetAi: "橋本競馬AI 本番レース検証",
      beforeRule: "productionRunReportsのAI指数・三連単・WIN5・神穴・危険人気馬・神レース・EV・資金配分を本番結果と照合",
      afterRule,
      reason: `三連単${judgements.trifectaHit ? "的中" : "不的中"} / AI指数1位 ${judgements.aiTopRank} / ROI ${round(roi, 1)}% / 投資${totalInvestment}円 / 払戻${payout}円`,
      evidenceRace: `${result.date} ${result.course} ${result.raceNumber}R / 1-2-3着 ${result.firstNumber}-${result.secondNumber}-${result.thirdNumber}`,
      status,
      nextUsageNote: `次回修正: ${badKeys.length ? badKeys.join(" / ") : "現行ルール継続"}。実ペース「${result.actualPace || "未入力"}」/ 4角「${result.cornerMemo || "未入力"}」/ 馬場「${result.trackBias || "未入力"}」。${result.memo || ""}`.trim(),
      race,
      predictionCheck: judgements,
      learningPoint: afterRule,
      adoptRule: status === "採用" ? afterRule : "",
      pendingRule: status === "保留" ? afterRule : "",
      deleteRule: status === "削除" ? afterRule : "",
    };
  };

  const buildFundCurveRecord = ({ report, result, totalInvestment, payout, roi }) => ({
    id: `fund-curve:${result.date}:${result.course}:${result.raceNumber}`,
    source: "production-result-validation",
    savedAt: new Date().toISOString(),
    date: result.date,
    course: result.course || report.predictionLog.race?.course || "未設定",
    raceNumber: result.raceNumber,
    ticketType: "本番レース合計",
    stake: totalInvestment,
    payout,
    profit: payout - totalInvestment,
    roi,
    hit: payout > 0,
    memo: result.memo,
  });

  const validateProductionResult = ({ resultInput = {}, runReport = null, storage = window.localStorage } = {}) => {
    const result = normalizeResultInput(resultInput);
    const matchedReport = normalizeReport(runReport || findMatchingProductionRunReport(result, storage));
    if (!matchedReport?.id) throw new Error("productionRunReportsに一致する本番予想レポートがありません");
    const prediction = matchedReport.predictionLog;
    const totalInvestment = result.investmentAmount || prediction.recommendedInvestmentAmount || prediction.recommendedInvestments.reduce((sum, item) => sum + toNumber(item.recommendedAmount, 0), 0);
    const expectedTrifectaHit = prediction.trifectaCandidates.some((ticket) => ticketNumbers(ticket).join("-") === [result.firstNumber, result.secondNumber, result.thirdNumber].join("-"));
    const payout = result.payoutAmount || (expectedTrifectaHit ? result.trifectaPayout : 0);
    const roi = totalInvestment > 0 ? round((payout / totalInvestment) * 100, 1) : 0;
    const judgements = buildJudgements(prediction, result, payout, totalInvestment);
    const labels = labelsFromJudgements(judgements);
    const goodJudgements = [
      judgements.mainHit ? labels.mainHit : null,
      judgements.trifectaHit ? labels.trifectaHit : null,
      judgements.win5Hit ? labels.win5Hit : null,
      judgements.kamianaHit ? labels.kamianaHit : null,
      judgements.dangerPopularFlew ? labels.dangerPopularFlew : null,
      judgements.godRaceSuccess ? labels.godRaceSuccess : null,
      judgements.evSuccess ? labels.evSuccess : null,
      judgements.capitalSuccess ? labels.capitalSuccess : null,
    ].filter(Boolean);
    const badJudgements = [
      !judgements.mainHit ? labels.mainHit : null,
      !judgements.trifectaHit ? labels.trifectaHit : null,
      !judgements.win5Hit ? labels.win5Hit : null,
      !judgements.kamianaHit ? labels.kamianaHit : null,
      !judgements.dangerPopularFlew ? labels.dangerPopularFlew : null,
      !judgements.godRaceSuccess ? labels.godRaceSuccess : null,
      !judgements.evSuccess ? labels.evSuccess : null,
      !judgements.capitalSuccess ? labels.capitalSuccess : null,
    ].filter(Boolean);
    const osUpdateCandidates = buildOsUpdateCandidates(judgements, result, roi);
    const nextFixPoints = [
      !judgements.trifectaHit ? "三連単フォーメーションの相手順序と点数を再調整" : null,
      !judgements.kamianaHit ? "神穴候補の馬場傾向・4角条件を再学習" : null,
      !judgements.dangerPopularFlew ? "危険人気馬の消し閾値を緩和" : null,
      !judgements.evSuccess ? "EV上位のオッズ妙味閾値を再検証" : null,
      !judgements.capitalSuccess ? "資金配分を防御寄りに補正" : null,
      result.cornerMemo ? `4角位置メモ「${result.cornerMemo}」を展開補正へ反映` : null,
      result.trackBias ? `馬場傾向「${result.trackBias}」を馬場バイアス補正へ反映` : null,
    ].filter(Boolean);
    const selfEvolutionLog = buildSelfEvolutionLog({ report: matchedReport, result, judgements, roi, totalInvestment, payout, osUpdateCandidates });
    const fundCurveRecord = buildFundCurveRecord({ report: matchedReport, result, totalInvestment, payout, roi });
    return {
      id: `production-result-validation:${result.date}:${result.course}:${result.raceNumber}`,
      generatedAt: new Date().toISOString(),
      storageKey: STORAGE_KEY,
      matchedRunReportId: matchedReport.id,
      race: prediction.race || {},
      result,
      judgements,
      labels,
      summary: {
        hit: judgements.trifectaHit || judgements.win5Hit || payout > 0,
        hitLabel: judgements.trifectaHit || judgements.win5Hit || payout > 0 ? "的中" : "不的中",
        roi,
        goodJudgements,
        badJudgements,
        nextFixPoints,
      },
      totalInvestment,
      payout,
      roi,
      osUpdateCandidates,
      selfEvolutionLog,
      fundCurveRecord,
    };
  };

  const loadValidationReports = (storage = window.localStorage) => {
    const parsed = safeParse(storage, STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  };

  const saveValidationReport = (validation, storage = window.localStorage) => {
    if (!storage?.setItem) return [validation];
    const reports = [validation, ...loadValidationReports(storage).filter((item) => item.id !== validation.id)].slice(0, 100);
    storage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return reports;
  };

  const appendSelfEvolutionLog = (validation, storage = window.localStorage) => {
    if (!validation?.selfEvolutionLog || !storage?.setItem) return null;
    const current = safeParse(storage, SELF_EVOLUTION_STORAGE_KEY, null) || safeParse(storage, SELF_EVOLUTION_LEGACY_KEY, null) || {};
    const logs = current.logs || { resultVerifications: [], backtests: [], improvementProposals: [] };
    const collection = asArray(logs.resultVerifications);
    const index = collection.findIndex((item) => item.id === validation.selfEvolutionLog.id);
    if (index >= 0) collection[index] = validation.selfEvolutionLog;
    else collection.unshift(validation.selfEvolutionLog);
    const payload = {
      storageVersion: 1,
      type: "selfEvolutionLogs",
      provider: "localStorage",
      updatedAt: new Date().toISOString(),
      logs: { ...logs, resultVerifications: collection.slice(0, 100) },
    };
    storage.setItem(SELF_EVOLUTION_STORAGE_KEY, JSON.stringify(payload));
    storage.setItem(SELF_EVOLUTION_LEGACY_KEY, JSON.stringify(payload));
    return payload;
  };

  const appendFundCurveRecord = (validation, storage = window.localStorage) => {
    if (!validation?.fundCurveRecord || !storage?.setItem) return [];
    const records = safeParse(storage, FUND_CURVE_STORAGE_KEY, []);
    const collection = Array.isArray(records) ? records : asArray(records.records);
    const nextRecords = [validation.fundCurveRecord, ...collection.filter((item) => item.id !== validation.fundCurveRecord.id)].slice(0, 500);
    storage.setItem(FUND_CURVE_STORAGE_KEY, JSON.stringify(nextRecords));
    return nextRecords;
  };

  const validateAndPersistProductionResult = (options = {}, storage = window.localStorage) => {
    const validation = validateProductionResult({ ...options, storage });
    saveValidationReport(validation, storage);
    appendSelfEvolutionLog(validation, storage);
    appendFundCurveRecord(validation, storage);
    const matchedReport = loadProductionRunReports(storage).find((report) => report.id === validation.matchedRunReportId);
    if (matchedReport?.productionPayload && window.HashimotoProductionRaceEngine?.updateRaceDatabaseResult) {
      window.HashimotoProductionRaceEngine.updateRaceDatabaseResult({ payload: matchedReport.productionPayload, validationReport: validation }, storage);
    }
    return validation;
  };

  window.HashimotoProductionResultValidationEngine = {
    STORAGE_KEY,
    PRODUCTION_RUN_REPORT_STORAGE_KEY,
    SELF_EVOLUTION_STORAGE_KEY,
    SELF_EVOLUTION_LEGACY_KEY,
    FUND_CURVE_STORAGE_KEY,
    normalizeResultInput,
    loadProductionRunReports,
    findMatchingProductionRunReport,
    validateProductionResult,
    loadValidationReports,
    saveValidationReport,
    appendSelfEvolutionLog,
    appendFundCurveRecord,
    validateAndPersistProductionResult,
  };
})();


(() => {
  const REPORT_STORAGE_KEY = "performanceDashboardReports";
  const FUND_CURVE_STORAGE_KEY = "fundCurveRecords";
  const OPERATION_LOG_STORAGE_KEY = "productionOperationLogs";
  const SELF_EVOLUTION_STORAGE_KEY = "selfEvolutionLogs";
  const SELF_EVOLUTION_COMPAT_KEY = "hashimoto-keiba-ai:self-evolution-logs:v1";
  const VALIDATION_REPORT_STORAGE_KEY = "productionResultValidationReports";

  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, toNumber(value)));
  const asArray = (value) => Array.isArray(value) ? value : [];
  const safeParse = (raw, fallback = null) => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const readJson = (storage, key, fallback) => safeParse(storage?.getItem?.(key), fallback);
  const compactText = (value, fallback = "未設定") => String(value ?? "").trim() || fallback;
  const normalizeDate = (value) => String(value || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const pct = (hits, total) => total > 0 ? round((hits / total) * 100, 1) : 0;

  const normalizeFundCurveRecords = (value) => {
    const records = Array.isArray(value) ? value : asArray(value?.records);
    return records.map((record, index) => {
      const stake = toNumber(record.stake ?? record.investment ?? record.investmentAmount, 0);
      const payout = toNumber(record.payout ?? record.payoutAmount, 0);
      return {
        ...record,
        id: record.id || `fund-curve-${index}`,
        date: normalizeDate(record.date ?? record.savedAt ?? record.generatedAt),
        course: compactText(record.course ?? record.race?.course ?? record.racecourse),
        raceNumber: compactText(record.raceNumber ?? record.race?.raceNumber, "?"),
        distance: toNumber(record.distance ?? record.race?.distance, 0),
        raceType: compactText(record.raceType ?? record.ticketType ?? record.race?.surface, "本番レース"),
        stake,
        payout,
        profit: toNumber(record.profit, payout - stake),
        roi: stake > 0 ? round((payout / stake) * 100, 1) : toNumber(record.roi, 0),
      };
    });
  };

  const normalizeValidationReports = (value) => asArray(value).map((report, index) => {
    const judgements = report.judgements || {};
    const race = report.race || {};
    const result = report.result || {};
    return {
      ...report,
      id: report.id || `validation-${index}`,
      date: normalizeDate(result.date ?? report.generatedAt ?? report.date),
      course: compactText(result.course ?? race.course ?? report.course ?? report.racecourse),
      raceNumber: compactText(result.raceNumber ?? race.raceNumber ?? report.raceNumber, "?"),
      distance: toNumber(race.distance ?? result.distance ?? report.distance, 0),
      raceType: compactText(race.surface ? `${race.surface}${race.distance ? ` ${race.distance}m` : ""}` : report.raceType, "本番レース"),
      totalInvestment: toNumber(report.totalInvestment ?? report.investment ?? report.summary?.investment, 0),
      payout: toNumber(report.payout ?? report.summary?.payout, 0),
      roi: toNumber(report.roi ?? report.summary?.roi, 0),
      osUpdateCandidates: report.osUpdateCandidates || {},
      judgements: {
        mainHit: Boolean(judgements.mainHit ?? report.mainHit ?? report.topAiHit),
        trifectaHit: Boolean(judgements.trifectaHit ?? report.trifectaHit),
        win5Hit: Boolean(judgements.win5Hit ?? report.win5Hit),
        kamianaHit: Boolean(judgements.kamianaHit ?? report.kamianaHit),
        dangerPopularSuccess: Boolean(judgements.dangerPopularSuccess ?? judgements.dangerPopularFlew ?? report.dangerPopularSuccess),
        godRaceSuccess: Boolean(judgements.godRaceSuccess ?? judgements.godRaceHit ?? report.godRaceSuccess),
        evSuccess: Boolean(judgements.evSuccess ?? report.evSuccess),
        capitalSuccess: Boolean(judgements.capitalSuccess ?? report.capitalSuccess),
      },
    };
  });

  const normalizeOperationLogs = (value) => asArray(value).map((log, index) => ({
    ...log,
    id: log.id || `operation-${index}`,
    date: normalizeDate(log.timestamp ?? log.generatedAt ?? log.date),
    course: compactText(log.racecourse ?? log.race?.course ?? log.payload?.race?.course),
    raceNumber: compactText(log.raceNumber ?? log.race?.raceNumber ?? log.payload?.race?.raceNumber, "?"),
    operationType: compactText(log.operationType, "未分類"),
  }));

  const flattenSelfEvolutionLogs = (payload) => {
    if (Array.isArray(payload)) return payload;
    const logs = payload?.logs || payload || {};
    return [
      ...asArray(logs.resultVerifications),
      ...asArray(logs.backtests),
      ...asArray(logs.improvementProposals),
      ...asArray(logs.osUpdates),
      ...asArray(logs.adoptedRules),
    ];
  };

  const loadDashboardSources = (storage = window.localStorage) => {
    const selfEvolutionPrimary = readJson(storage, SELF_EVOLUTION_STORAGE_KEY, null);
    const selfEvolutionCompat = readJson(storage, SELF_EVOLUTION_COMPAT_KEY, null);
    const primaryLogs = flattenSelfEvolutionLogs(selfEvolutionPrimary);
    const compatLogs = flattenSelfEvolutionLogs(selfEvolutionCompat);
    const mergedEvolution = [...primaryLogs, ...compatLogs.filter((item) => !primaryLogs.some((base) => base.id && base.id === item.id))];
    return {
      fundCurveRecords: normalizeFundCurveRecords(readJson(storage, FUND_CURVE_STORAGE_KEY, [])),
      operationLogs: normalizeOperationLogs(readJson(storage, OPERATION_LOG_STORAGE_KEY, [])),
      selfEvolutionLogs: mergedEvolution,
      validationReports: normalizeValidationReports(readJson(storage, VALIDATION_REPORT_STORAGE_KEY, [])),
    };
  };

  const uniqueRaceKey = (item) => [normalizeDate(item.date), compactText(item.course), compactText(item.raceNumber ?? item.race?.raceNumber ?? "?")].join("|");
  const countByJudgement = (reports, key) => reports.filter((report) => report.judgements?.[key]).length;

  const summarizeRates = (validationReports) => {
    const total = validationReports.length;
    return {
      mainHitRate: pct(countByJudgement(validationReports, "mainHit"), total),
      trifectaHitRate: pct(countByJudgement(validationReports, "trifectaHit"), total),
      win5HitRate: pct(countByJudgement(validationReports, "win5Hit"), total),
      kamianaHitRate: pct(countByJudgement(validationReports, "kamianaHit"), total),
      dangerPopularSuccessRate: pct(countByJudgement(validationReports, "dangerPopularSuccess"), total),
      godRaceSuccessRate: pct(countByJudgement(validationReports, "godRaceSuccess"), total),
      evSuccessRate: pct(countByJudgement(validationReports, "evSuccess"), total),
      capitalSuccessRate: pct(countByJudgement(validationReports, "capitalSuccess"), total),
    };
  };

  const summarizeRevenue = (fundCurveRecords, validationReports) => {
    const source = fundCurveRecords.length ? fundCurveRecords : validationReports.map((report) => ({ stake: report.totalInvestment, payout: report.payout }));
    const totalInvestment = source.reduce((sum, record) => sum + toNumber(record.stake ?? record.totalInvestment, 0), 0);
    const totalPayout = source.reduce((sum, record) => sum + toNumber(record.payout, 0), 0);
    return {
      totalInvestment,
      totalPayout,
      totalProfit: totalPayout - totalInvestment,
      roi: totalInvestment > 0 ? round((totalPayout / totalInvestment) * 100, 1) : 0,
    };
  };

  const calculateAiOperationScore = ({ rates = {}, revenue = {}, operation = {} } = {}) => {
    const hitRate = round(((toNumber(rates.mainHitRate) + toNumber(rates.trifectaHitRate) + toNumber(rates.win5HitRate)) / 3), 1);
    const roiScore = clamp(revenue.roi);
    const verificationRate = clamp(operation.verificationRate);
    const score = round(
      (hitRate * 0.25) +
      (roiScore * 0.25) +
      (toNumber(rates.godRaceSuccessRate) * 0.15) +
      (toNumber(rates.dangerPopularSuccessRate) * 0.12) +
      (toNumber(rates.kamianaHitRate) * 0.12) +
      (verificationRate * 0.11),
      0,
    );
    return {
      score: clamp(score),
      hitRate,
      roiScore,
      verificationRate,
      components: {
        hitRate,
        roi: roiScore,
        godRaceSuccessRate: toNumber(rates.godRaceSuccessRate),
        dangerPopularSuccessRate: toNumber(rates.dangerPopularSuccessRate),
        kamianaHitRate: toNumber(rates.kamianaHitRate),
        verificationRate,
      },
    };
  };

  const buildWeaknessGroups = (validationReports, keyGetter) => {
    const groups = new Map();
    validationReports.forEach((report) => {
      const key = compactText(keyGetter(report));
      const current = groups.get(key) || { label: key, races: 0, misses: 0, roiTotal: 0 };
      current.races += 1;
      current.roiTotal += toNumber(report.roi, 0);
      if (!report.judgements.trifectaHit && !report.judgements.mainHit && toNumber(report.roi, 0) < 100) current.misses += 1;
      groups.set(key, current);
    });
    return Array.from(groups.values())
      .map((item) => ({ ...item, averageRoi: item.races ? round(item.roiTotal / item.races, 1) : 0 }))
      .sort((a, b) => (b.misses - a.misses) || (a.averageRoi - b.averageRoi));
  };

  const distanceBucket = (distance) => {
    const value = toNumber(distance, 0);
    if (!value) return "距離未設定";
    if (value <= 1400) return "短距離";
    if (value <= 1800) return "マイル";
    if (value <= 2200) return "中距離";
    return "長距離";
  };

  const summarizeImprovements = (validationReports, selfEvolutionLogs) => {
    const osCandidates = validationReports.flatMap((report) => [
      ...asArray(report.osUpdateCandidates?.pending),
      ...asArray(report.osUpdateCandidates?.delete),
      ...asArray(report.summary?.nextFixPoints),
    ]);
    const evolutionCandidates = selfEvolutionLogs.map((log) => log.afterRule || log.learningPoint || log.pendingRule || log.deleteRule).filter(Boolean);
    return [...osCandidates, ...evolutionCandidates].slice(0, 6);
  };

  const buildTrendSeries = ({ fundCurveRecords, validationReports, selfEvolutionLogs, totalRaceCount }) => {
    const dates = Array.from(new Set([
      ...fundCurveRecords.map((record) => normalizeDate(record.date ?? record.savedAt)),
      ...validationReports.map((report) => normalizeDate(report.date ?? report.generatedAt)),
      ...selfEvolutionLogs.map((log) => normalizeDate(log.date ?? log.savedAt)),
    ])).sort();
    let cumulativeStake = 0;
    let cumulativePayout = 0;
    return dates.map((date) => {
      fundCurveRecords.filter((record) => normalizeDate(record.date ?? record.savedAt) === date).forEach((record) => {
        cumulativeStake += toNumber(record.stake ?? record.totalInvestment, 0);
        cumulativePayout += toNumber(record.payout, 0);
      });
      const reportsUntilDate = validationReports.filter((report) => normalizeDate(report.date ?? report.generatedAt) <= date);
      const revenue = cumulativeStake > 0
        ? { roi: round((cumulativePayout / cumulativeStake) * 100, 1), totalInvestment: cumulativeStake, totalPayout: cumulativePayout }
        : summarizeRevenue([], reportsUntilDate);
      const operation = {
        totalRaceCount,
        verifiedRaceCount: reportsUntilDate.length,
        verificationRate: totalRaceCount > 0 ? pct(reportsUntilDate.length, totalRaceCount) : 0,
      };
      const rates = summarizeRates(reportsUntilDate);
      return {
        date,
        roi: revenue.roi,
        aiOperationScore: calculateAiOperationScore({ rates, revenue, operation }).score,
        selfEvolutionCount: selfEvolutionLogs.filter((log) => normalizeDate(log.date ?? log.savedAt) <= date).length,
      };
    });
  };

  const buildPerformanceDashboardReport = ({ storage = window.localStorage } = {}) => {
    const sources = loadDashboardSources(storage);
    const raceKeys = new Set([
      ...sources.operationLogs.map(uniqueRaceKey),
      ...sources.validationReports.map(uniqueRaceKey),
      ...sources.fundCurveRecords.map(uniqueRaceKey),
    ].filter(Boolean));
    const totalRaceCount = raceKeys.size;
    const analyzedRaceCount = sources.operationLogs.filter((log) => /AI|一括|分析|買い目|神レース/.test(log.operationType)).length;
    const verifiedRaceCount = sources.validationReports.length;
    const operation = {
      totalRaceCount,
      analyzedRaceCount,
      verifiedRaceCount,
      selfEvolutionCount: sources.selfEvolutionLogs.length,
      verificationRate: totalRaceCount > 0 ? pct(verifiedRaceCount, totalRaceCount) : 0,
    };
    const rates = summarizeRates(sources.validationReports);
    const revenue = summarizeRevenue(sources.fundCurveRecords, sources.validationReports);
    const aiOperationScore = calculateAiOperationScore({ rates, revenue, operation });
    const weakRaceTypes = buildWeaknessGroups(sources.validationReports, (report) => report.raceType);
    const weakCourses = buildWeaknessGroups(sources.validationReports, (report) => report.course);
    const weakDistances = buildWeaknessGroups(sources.validationReports, (report) => distanceBucket(report.distance));
    return {
      id: `performance-dashboard:${new Date().toISOString()}`,
      generatedAt: new Date().toISOString(),
      storageKey: REPORT_STORAGE_KEY,
      sourceStorageKeys: [FUND_CURVE_STORAGE_KEY, OPERATION_LOG_STORAGE_KEY, SELF_EVOLUTION_STORAGE_KEY, VALIDATION_REPORT_STORAGE_KEY],
      operation,
      hitRates: rates,
      revenue,
      aiEvaluation: {
        godRaceSuccessRate: rates.godRaceSuccessRate,
        evSuccessRate: rates.evSuccessRate,
        capitalSuccessRate: rates.capitalSuccessRate,
        aiOperationScore: aiOperationScore.score,
        scoreComponents: aiOperationScore.components,
      },
      trends: buildTrendSeries({ ...sources, totalRaceCount }),
      improvements: {
        weakRaceTypes: weakRaceTypes.slice(0, 3),
        weakCourses: weakCourses.slice(0, 3),
        weakDistances: weakDistances.slice(0, 3),
        osCandidates: summarizeImprovements(sources.validationReports, sources.selfEvolutionLogs),
      },
      sourceCounts: {
        fundCurveRecords: sources.fundCurveRecords.length,
        productionOperationLogs: sources.operationLogs.length,
        selfEvolutionLogs: sources.selfEvolutionLogs.length,
        productionResultValidationReports: sources.validationReports.length,
      },
    };
  };

  const savePerformanceDashboardReport = (report, storage = window.localStorage) => {
    if (!storage?.setItem) return [report];
    const current = asArray(readJson(storage, REPORT_STORAGE_KEY, []));
    const next = [report, ...current.filter((item) => item.id !== report.id)].slice(0, 50);
    storage.setItem(REPORT_STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const exportPerformanceDashboardJson = ({ storage = window.localStorage } = {}) => {
    const report = buildPerformanceDashboardReport({ storage });
    savePerformanceDashboardReport(report, storage);
    return JSON.stringify(report, null, 2);
  };

  window.HashimotoPerformanceDashboardEngine = {
    REPORT_STORAGE_KEY,
    FUND_CURVE_STORAGE_KEY,
    OPERATION_LOG_STORAGE_KEY,
    SELF_EVOLUTION_STORAGE_KEY,
    SELF_EVOLUTION_COMPAT_KEY,
    VALIDATION_REPORT_STORAGE_KEY,
    normalizeFundCurveRecords,
    normalizeValidationReports,
    normalizeOperationLogs,
    loadDashboardSources,
    summarizeRates,
    summarizeRevenue,
    calculateAiOperationScore,
    buildTrendSeries,
    buildPerformanceDashboardReport,
    savePerformanceDashboardReport,
    exportPerformanceDashboardJson,
  };

})();


(() => {
  const STORAGE_KEY = "weaknessAnalysisReports";
  const SOURCE_KEYS = ["raceDatabase", "fundCurveRecords", "productionResultValidationReports"];
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const clamp = (value) => Math.max(0, Math.min(100, round(value, 1)));
  const asArray = (value) => Array.isArray(value) ? value : [];
  const normalizeText = (value, fallback = "未設定") => String(value ?? "").trim() || fallback;
  const normalizeCourse = (value) => normalizeText(value).replace(/競馬場$/, "") || "未設定";
  const normalizeSurface = (value) => {
    const text = normalizeText(value);
    return text === "ダ" ? "ダート" : text;
  };
  const conditionSurface = (value) => normalizeSurface(value).replace("ダート", "ダ");
  const normalizeDistance = (value) => {
    const distance = toNumber(value, 0);
    return distance > 0 ? String(distance) : normalizeText(value);
  };
  const readJson = (storage, key, fallback) => {
    try {
      const raw = storage?.getItem?.(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  };
  const compactKey = (record = {}) => [record.date, normalizeCourse(record.course), record.raceNumber].join(":");
  const popularityZone = (value) => {
    const rank = toNumber(value, 0);
    if (!rank) return "人気未設定";
    if (rank <= 1) return "1番人気";
    if (rank <= 3) return "2〜3番人気";
    if (rank <= 5) return "4〜5番人気";
    if (rank <= 8) return "6〜8番人気";
    if (rank <= 12) return "9〜12番人気";
    return "13番人気以下";
  };
  const inferBestStyle = (record = {}) => {
    const payload = record.predictionPayload || record.productionPayload || {};
    const topNumber = String(record.result?.firstNumber || record.resultInput?.firstNumber || record.aiIndexTop3?.[0]?.number || "");
    const horses = asArray(payload.horses).concat(asArray(payload.aiIndexRanking), asArray(payload.kamianaRanking));
    const matched = horses.find((horse) => String(horse.number ?? horse.horseNumber ?? "") === topNumber) || horses[0] || {};
    return normalizeText(matched.runningStyle || matched.style || matched["脚質"] || record.runningStyle || record.style || record["脚質"]);
  };
  const inferPopularity = (record = {}) => {
    const result = record.result || record.resultInput || {};
    return result.firstPopularity || result.popularity || record.aiIndexTop3?.[0]?.popularity || record.predictionPayload?.aiIndexRanking?.[0]?.popularity || record.popularity;
  };
  const normalizeRecord = (entry = {}, source = "raceDatabase") => {
    const race = entry.race || entry.result || entry.resultInput || entry.predictionPayload?.race || entry.productionPayload?.race || entry.fundCurveRecord?.race || entry;
    const investment = toNumber(entry.investmentAmount ?? entry.totalInvestment ?? entry.investment ?? entry.stake ?? entry.result?.investmentAmount, 0);
    const payout = toNumber(entry.payoutAmount ?? entry.payout ?? entry.result?.payoutAmount, 0);
    const roi = entry.roi !== undefined && entry.roi !== null ? toNumber(entry.roi, 0) : (investment > 0 ? (payout / investment) * 100 : 0);
    const judgements = entry.judgements || entry.validationReport?.judgements || {};
    const summary = entry.summary || entry.validationReport?.summary || {};
    const godRace = entry.godRaceJudgement || entry.predictionPayload?.godRace || entry.productionPayload?.godRace || summary.godRaceJudgement || null;
    return {
      id: entry.id || `${source}:${compactKey(race)}`,
      source,
      date: normalizeText(race.date || entry.date || entry.generatedAt, ""),
      course: normalizeCourse(race.course || race.racecourse || entry.course || entry.racecourse),
      distance: normalizeDistance(race.distance || entry.distance),
      surface: normalizeSurface(race.surface || entry.surface),
      going: normalizeText(race.going || race.trackCondition || entry.going || entry.trackCondition),
      raceNumber: toNumber(race.raceNumber || entry.raceNumber, 0),
      popularityZone: popularityZone(inferPopularity(entry)),
      style: inferBestStyle(entry),
      investment,
      payout,
      roi: round(roi, 1),
      hit: Boolean(summary.hit ?? entry.hit ?? judgements.trifectaHit ?? (payout > 0)),
      kamianaSuccess: Boolean(judgements.kamianaHit ?? entry.kamianaSuccess ?? false),
      dangerPopularSuccess: Boolean(judgements.dangerPopularFlew ?? entry.dangerPopularSuccess ?? false),
      godRaceSuccess: Boolean(judgements.godRaceSuccess ?? entry.godRaceSuccess ?? (godRace && roi >= 100)),
      isGodRace: Boolean(godRace && !godRace.skip),
      fixPoints: asArray(summary.nextFixPoints).concat(asArray(entry.osUpdateCandidates?.pending), asArray(entry.osUpdateCandidates?.apply), asArray(entry.validationReport?.summary?.nextFixPoints)),
    };
  };
  const loadSources = (storage = window.localStorage) => {
    const raceDatabase = window.HashimotoProductionRaceEngine?.loadRaceDatabase ? window.HashimotoProductionRaceEngine.loadRaceDatabase(storage) : asArray(readJson(storage, "raceDatabase", []));
    const fundCurveRecords = asArray(readJson(storage, "fundCurveRecords", []));
    const validationReports = window.HashimotoProductionResultValidationEngine?.loadValidationReports ? window.HashimotoProductionResultValidationEngine.loadValidationReports(storage) : asArray(readJson(storage, "productionResultValidationReports", []));
    return { raceDatabase, fundCurveRecords, productionResultValidationReports: validationReports };
  };
  const mergeRecords = (sources = {}) => {
    const map = new Map();
    const add = (record) => {
      const key = compactKey(record);
      const existing = map.get(key) || {};
      const merged = { ...existing, ...record };
      ["course", "distance", "surface", "going", "popularityZone", "style"].forEach((field) => {
        if ((record[field] === "未設定" || record[field] === "人気未設定" || record[field] === "") && existing[field]) merged[field] = existing[field];
      });
      map.set(key, { ...merged, source: existing.source ? `${existing.source}+${record.source}` : record.source });
    };
    asArray(sources.raceDatabase).map((item) => normalizeRecord(item, "raceDatabase")).forEach(add);
    asArray(sources.fundCurveRecords).map((item) => normalizeRecord(item, "fundCurveRecords")).forEach(add);
    asArray(sources.productionResultValidationReports).map((item) => normalizeRecord(item, "productionResultValidationReports")).forEach(add);
    return Array.from(map.values()).filter((record) => record.course || record.distance || record.investment || record.payout);
  };
  const createBucket = (label, dimension) => ({ label, dimension, races: 0, investment: 0, payout: 0, hits: 0, kamiana: 0, danger: 0, god: 0, godTargets: 0, fixPoints: [] });
  const addToBucket = (bucket, record) => {
    bucket.races += 1;
    bucket.investment += toNumber(record.investment, 0);
    bucket.payout += toNumber(record.payout, 0);
    if (record.hit) bucket.hits += 1;
    if (record.kamianaSuccess) bucket.kamiana += 1;
    if (record.dangerPopularSuccess) bucket.danger += 1;
    if (record.isGodRace) bucket.godTargets += 1;
    if (record.godRaceSuccess) bucket.god += 1;
    bucket.fixPoints.push(...asArray(record.fixPoints));
  };
  const finalizeBucket = (bucket) => {
    const roi = bucket.investment > 0 ? (bucket.payout / bucket.investment) * 100 : 0;
    const hitRate = bucket.races ? (bucket.hits / bucket.races) * 100 : 0;
    const kamianaSuccessRate = bucket.races ? (bucket.kamiana / bucket.races) * 100 : 0;
    const dangerPopularSuccessRate = bucket.races ? (bucket.danger / bucket.races) * 100 : 0;
    const godRaceSuccessRate = bucket.godTargets ? (bucket.god / bucket.godTargets) * 100 : 0;
    const weaknessScore = clamp(((100 - Math.min(160, roi) / 1.6) * 0.36) + ((100 - hitRate) * 0.22) + ((100 - kamianaSuccessRate) * 0.14) + ((100 - dangerPopularSuccessRate) * 0.14) + ((100 - godRaceSuccessRate) * 0.14));
    return {
      ...bucket,
      investment: round(bucket.investment, 0),
      payout: round(bucket.payout, 0),
      roi: round(roi, 1),
      hitRate: round(hitRate, 1),
      kamianaSuccessRate: round(kamianaSuccessRate, 1),
      dangerPopularSuccessRate: round(dangerPopularSuccessRate, 1),
      godRaceSuccessRate: round(godRaceSuccessRate, 1),
      weaknessScore,
      strengthScore: clamp(100 - weaknessScore + Math.max(0, roi - 100) * 0.12),
      improvement: buildImprovement({ ...bucket, roi, label: bucket.label }),
    };
  };
  const buildImprovement = (bucket = {}) => {
    const text = bucket.fixPoints.join(" / ");
    if (/差し|末脚|外差し|4角|後方/.test(text) || /東京|新潟/.test(bucket.label)) return "差し補正不足";
    if (/先行|逃げ|前残り/.test(text) || /中山|福島|小倉|ダート/.test(bucket.label)) return "先行補正有効";
    if (/馬場|道悪|重|不良|稍重/.test(text) || /重|不良|稍重/.test(bucket.label)) return "馬場バイアス補正を再学習";
    if (/危険人気|人気/.test(text) || /人気/.test(bucket.label)) return "危険人気馬しきい値調整";
    if (/神穴|穴|高配当/.test(text)) return "神穴条件を追加検証";
    return bucket.roi < 80 ? "買い目点数とEV下限を防御補正" : "現行補正を維持・展開条件を追加学習";
  };
  const groupBy = (records, dimension, getter) => Array.from(records.reduce((map, record) => {
    const labels = asArray(getter(record)).filter(Boolean);
    labels.forEach((label) => {
      const normalized = normalizeText(label);
      if (!map.has(normalized)) map.set(normalized, createBucket(normalized, dimension));
      addToBucket(map.get(normalized), record);
    });
    return map;
  }, new Map()).values()).map(finalizeBucket).filter((bucket) => bucket.races > 0);
  const rankWeak = (items) => [...items].sort((a, b) => b.weaknessScore - a.weaknessScore || a.roi - b.roi).slice(0, 10);
  const rankStrong = (items) => [...items].sort((a, b) => b.strengthScore - a.strengthScore || b.roi - a.roi).slice(0, 10);
  const buildWeaknessAnalysisReport = ({ storage = window.localStorage } = {}) => {
    const sources = loadSources(storage);
    const records = mergeRecords(sources);
    const dimensions = {
      courses: groupBy(records, "競馬場", (record) => [record.course]),
      distances: groupBy(records, "距離", (record) => [record.distance]),
      goings: groupBy(records, "馬場", (record) => [record.going]),
      popularityZones: groupBy(records, "人気ゾーン", (record) => [record.popularityZone]),
      styles: groupBy(records, "脚質", (record) => [record.style]),
      courseDistance: groupBy(records, "競馬場×芝ダ×距離", (record) => [`${record.course}${conditionSurface(record.surface)}${record.distance}`]),
    };
    const totalInvestment = records.reduce((sum, record) => sum + toNumber(record.investment, 0), 0);
    const totalPayout = records.reduce((sum, record) => sum + toNumber(record.payout, 0), 0);
    const report = {
      id: `weakness-analysis-${new Date().toISOString().replace(/[:.]/g, "-")}`,
      generatedAt: new Date().toISOString(),
      storageKey: STORAGE_KEY,
      sourceStorageKeys: SOURCE_KEYS,
      sourceCounts: {
        raceDatabase: asArray(sources.raceDatabase).length,
        fundCurveRecords: asArray(sources.fundCurveRecords).length,
        productionResultValidationReports: asArray(sources.productionResultValidationReports).length,
        mergedRaceCount: records.length,
      },
      summary: {
        totalInvestment: round(totalInvestment, 0),
        totalPayout: round(totalPayout, 0),
        roi: totalInvestment > 0 ? round((totalPayout / totalInvestment) * 100, 1) : 0,
        hitRate: records.length ? round((records.filter((record) => record.hit).length / records.length) * 100, 1) : 0,
      },
      rankings: {
        weakCourses: rankWeak(dimensions.courses),
        strongCourses: rankStrong(dimensions.courses),
        weakDistances: rankWeak(dimensions.distances),
        strongDistances: rankStrong(dimensions.distances),
        weakGoings: rankWeak(dimensions.goings),
        strongGoings: rankStrong(dimensions.goings),
        weakPopularityZones: rankWeak(dimensions.popularityZones),
        strongPopularityZones: rankStrong(dimensions.popularityZones),
        weakStyles: rankWeak(dimensions.styles),
        strongStyles: rankStrong(dimensions.styles),
        weakConditions: rankWeak(dimensions.courseDistance),
        strongConditions: rankStrong(dimensions.courseDistance),
      },
      improvementCandidates: rankWeak(dimensions.courseDistance).slice(0, 8).map((item) => ({ condition: item.label, score: item.weaknessScore, suggestion: item.improvement })),
    };
    return report;
  };
  const saveWeaknessAnalysisReport = (report, storage = window.localStorage) => {
    if (!storage?.setItem) return [report];
    const current = asArray(readJson(storage, STORAGE_KEY, []));
    const next = [report, ...current.filter((item) => item.id !== report.id)].slice(0, 50);
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };
  const exportWeaknessAnalysisJson = ({ storage = window.localStorage } = {}) => {
    const report = buildWeaknessAnalysisReport({ storage });
    saveWeaknessAnalysisReport(report, storage);
    return JSON.stringify(report, null, 2);
  };
  window.HashimotoWeaknessAnalysisEngine = {
    STORAGE_KEY,
    SOURCE_KEYS,
    loadSources,
    mergeRecords,
    buildWeaknessAnalysisReport,
    saveWeaknessAnalysisReport,
    exportWeaknessAnalysisJson,
  };
})();


(() => {
  const documentRef = window.document;
  const engine = window.HashimotoWeaknessAnalysisEngine;
  if (!documentRef?.querySelector || !engine || !documentRef.querySelector("#weakness-analysis-panel")) return;
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const formatPercent = (value) => `${Number(value || 0).toFixed(1).replace(/\.0$/, "")}%`;
  const formatScore = (value) => `${Number(value || 0).toFixed(1).replace(/\.0$/, "")}`;
  const fillList = (selector, items = [], mode = "weak") => {
    const target = documentRef.querySelector(selector);
    if (!target) return;
    const scoreKey = mode === "strong" ? "strengthScore" : "weaknessScore";
    const scoreLabel = mode === "strong" ? "得意" : "弱点";
    target.innerHTML = items.length ? items.map((item) => `<li><strong>${escapeHtml(item.label)} <b>${scoreLabel}スコア ${escapeHtml(formatScore(item[scoreKey]))}</b></strong><small>ROI ${escapeHtml(formatPercent(item.roi))} / 的中率 ${escapeHtml(formatPercent(item.hitRate))} / 神穴 ${escapeHtml(formatPercent(item.kamianaSuccessRate))} / 危険人気馬 ${escapeHtml(formatPercent(item.dangerPopularSuccessRate))} / 神レース ${escapeHtml(formatPercent(item.godRaceSuccessRate))} / ${escapeHtml(item.races)}R</small></li>`).join("") : '<li class="empty-state">分析データ蓄積待ち</li>';
  };
  const render = (persist = true) => {
    const report = engine.buildWeaknessAnalysisReport({ storage: window.localStorage });
    if (persist) engine.saveWeaknessAnalysisReport(report, window.localStorage);
    const status = documentRef.querySelector("#weakness-analysis-status");
    if (status) status.textContent = `分析済 ${report.sourceCounts.mergedRaceCount}R / ROI ${formatPercent(report.summary.roi)}`;
    const source = documentRef.querySelector("#weakness-analysis-source-count");
    if (source) source.textContent = `参照: raceDatabase ${report.sourceCounts.raceDatabase}件 / fundCurveRecords ${report.sourceCounts.fundCurveRecords}件 / productionResultValidationReports ${report.sourceCounts.productionResultValidationReports}件 / 保存先 ${engine.STORAGE_KEY}`;
    const topWeak = report.rankings.weakConditions[0];
    const topStrong = report.rankings.strongConditions[0];
    const weakMain = documentRef.querySelector("#weakness-analysis-top-weak");
    if (weakMain) weakMain.textContent = topWeak ? `${topWeak.label} 弱点スコア ${formatScore(topWeak.weaknessScore)}` : "弱点データ待ち";
    const strongMain = documentRef.querySelector("#weakness-analysis-top-strong");
    if (strongMain) strongMain.textContent = topStrong ? `${topStrong.label} 得意スコア ${formatScore(topStrong.strengthScore)}` : "得意データ待ち";
    fillList("#weakness-course-list", report.rankings.weakCourses, "weak");
    fillList("#strength-course-list", report.rankings.strongCourses, "strong");
    fillList("#weakness-distance-list", report.rankings.weakDistances, "weak");
    fillList("#strength-distance-list", report.rankings.strongDistances, "strong");
    fillList("#weakness-going-list", report.rankings.weakGoings, "weak");
    fillList("#strength-going-list", report.rankings.strongGoings, "strong");
    fillList("#weakness-popularity-list", report.rankings.weakPopularityZones, "weak");
    fillList("#strength-popularity-list", report.rankings.strongPopularityZones, "strong");
    fillList("#weakness-style-list", report.rankings.weakStyles, "weak");
    fillList("#strength-style-list", report.rankings.strongStyles, "strong");
    const improvement = documentRef.querySelector("#weakness-improvement-candidates");
    if (improvement) improvement.innerHTML = report.improvementCandidates.length ? report.improvementCandidates.map((item) => `<li><strong>${escapeHtml(item.condition)}</strong><span>→ ${escapeHtml(item.suggestion)}</span><small>弱点スコア ${escapeHtml(formatScore(item.score))}</small></li>`).join("") : '<li class="empty-state">改善候補の蓄積待ち</li>';
    return report;
  };
  documentRef.querySelector("#weakness-analysis-refresh")?.addEventListener("click", () => render(true));
  documentRef.querySelector("#weakness-analysis-export")?.addEventListener("click", () => {
    const json = engine.exportWeaknessAnalysisJson({ storage: window.localStorage });
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = `weaknessAnalysisReports-${new Date().toISOString().slice(0, 10)}.json`;
    documentRef.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    render(false);
  });
  render(true);
})();


(() => {
  const documentRef = window.document;
  const engine = window.HashimotoPerformanceDashboardEngine;
  if (!documentRef?.querySelector || !engine) return;

  const formatPercent = (value) => `${Number(value || 0).toFixed(1).replace(/\.0$/, "")}%`;
  const formatYen = (value) => `${Math.round(Number(value || 0)).toLocaleString("ja-JP")}円`;
  const setText = (selector, value) => {
    const target = documentRef.querySelector(selector);
    if (target) target.textContent = value;
  };
  const fillList = (selector, items, formatter, emptyText = "データ蓄積待ち") => {
    const target = documentRef.querySelector(selector);
    if (!target) return;
    target.innerHTML = items.length ? items.map((item) => `<li>${formatter(item)}</li>`).join("") : `<li class="empty-state">${emptyText}</li>`;
  };
  const fillTrend = (selector, items, key, formatter) => {
    const target = documentRef.querySelector(selector);
    if (!target) return;
    const max = Math.max(1, ...items.map((item) => Number(item[key] || 0)));
    target.innerHTML = items.length ? items.slice(-8).map((item) => {
      const height = Math.max(8, Math.round((Number(item[key] || 0) / max) * 100));
      return `<span class="performance-trend-bar" style="--bar-height:${height}%"><i>${formatter(item[key])}</i><b>${String(item.date).slice(5)}</b></span>`;
    }).join("") : '<p class="empty-state">時系列データ待ち</p>';
  };

  const renderPerformanceDashboard = () => {
    const report = engine.buildPerformanceDashboardReport({ storage: window.localStorage });
    setText("#performance-total-races", report.operation.totalRaceCount.toLocaleString("ja-JP"));
    setText("#performance-analyzed-races", report.operation.analyzedRaceCount.toLocaleString("ja-JP"));
    setText("#performance-verified-races", report.operation.verifiedRaceCount.toLocaleString("ja-JP"));
    setText("#performance-self-evolution-count", report.operation.selfEvolutionCount.toLocaleString("ja-JP"));

    setText("#performance-main-hit-rate", formatPercent(report.hitRates.mainHitRate));
    setText("#performance-trifecta-hit-rate", formatPercent(report.hitRates.trifectaHitRate));
    setText("#performance-win5-hit-rate", formatPercent(report.hitRates.win5HitRate));
    setText("#performance-kamiana-hit-rate", formatPercent(report.hitRates.kamianaHitRate));
    setText("#performance-danger-success-rate", formatPercent(report.hitRates.dangerPopularSuccessRate));

    setText("#performance-total-investment", formatYen(report.revenue.totalInvestment));
    setText("#performance-total-payout", formatYen(report.revenue.totalPayout));
    setText("#performance-total-profit", formatYen(report.revenue.totalProfit));
    setText("#performance-roi", formatPercent(report.revenue.roi));

    setText("#performance-god-race-rate", formatPercent(report.aiEvaluation.godRaceSuccessRate));
    setText("#performance-ev-rate", formatPercent(report.aiEvaluation.evSuccessRate));
    setText("#performance-capital-rate", formatPercent(report.aiEvaluation.capitalSuccessRate));
    setText("#performance-ai-score", String(report.aiEvaluation.aiOperationScore));
    setText("#performance-ai-score-inline", `${report.aiEvaluation.aiOperationScore} / 100`);
    setText("#performance-ai-score-note", `的中${formatPercent(report.aiEvaluation.scoreComponents.hitRate)} / ROI${formatPercent(report.aiEvaluation.scoreComponents.roi)} / 検証率${formatPercent(report.aiEvaluation.scoreComponents.verificationRate)}`);
    setText("#performance-source-count", `参照: fundCurveRecords ${report.sourceCounts.fundCurveRecords}件 / productionOperationLogs ${report.sourceCounts.productionOperationLogs}件 / selfEvolutionLogs ${report.sourceCounts.selfEvolutionLogs}件 / productionResultValidationReports ${report.sourceCounts.productionResultValidationReports}件`);

    fillTrend("#performance-roi-trend", report.trends, "roi", formatPercent);
    fillTrend("#performance-score-trend", report.trends, "aiOperationScore", (value) => `${Math.round(Number(value || 0))}`);
    fillTrend("#performance-evolution-trend", report.trends, "selfEvolutionCount", (value) => `${Math.round(Number(value || 0))}回`);

    fillList("#performance-weak-race-types", report.improvements.weakRaceTypes, (item) => `<strong>${item.label}</strong><span>${item.races}戦 / 弱点${item.misses}件 / 平均ROI ${formatPercent(item.averageRoi)}</span>`);
    fillList("#performance-weak-courses", report.improvements.weakCourses, (item) => `<strong>${item.label}</strong><span>${item.races}戦 / 弱点${item.misses}件 / 平均ROI ${formatPercent(item.averageRoi)}</span>`);
    fillList("#performance-weak-distances", report.improvements.weakDistances, (item) => `<strong>${item.label}</strong><span>${item.races}戦 / 弱点${item.misses}件 / 平均ROI ${formatPercent(item.averageRoi)}</span>`);
    fillList("#performance-os-candidates", report.improvements.osCandidates, (item) => `<strong>改善候補OS</strong><span>${item}</span>`);
    return report;
  };

  const downloadReport = () => {
    const json = engine.exportPerformanceDashboardJson({ storage: window.localStorage });
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = `performance-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    documentRef.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setText("#performance-dashboard-status", "performanceDashboardReportsへ保存しJSON出力しました");
    renderPerformanceDashboard();
  };

  documentRef.querySelector("#performance-dashboard-refresh")?.addEventListener("click", () => {
    renderPerformanceDashboard();
    setText("#performance-dashboard-status", "最新localStorageから再集計しました");
  });
  documentRef.querySelector("#performance-dashboard-export")?.addEventListener("click", downloadReport);
  renderPerformanceDashboard();
})();


(() => {
  const STORAGE_KEY = "operationDiagnosticReports";

  const asArray = (value) => Array.isArray(value) ? value : [];
  const safeClone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const summarizeTicket = (ticket = {}) => ticket.notation || [ticket.first, ticket.second, ticket.third]
    .filter(Boolean)
    .map((horse) => horse?.number ?? horse)
    .join("→") || "買い目なし";

  const normalizeRaceBasicInfo = (race = {}) => ({
    date: race.date || race["開催日"] || "",
    course: race.course || race["競馬場"] || "未設定",
    raceNumber: race.raceNumber ?? race["レース番号"] ?? "?",
    raceName: race.raceName || race["レース名"] || "未設定レース",
    distance: race.distance ?? race["距離"] ?? "",
    surface: race.surface || race["芝ダート"] || "",
    going: race.going || race["馬場状態"] || "",
    weather: race.weather || race["天候"] || "",
    fieldSize: race.fieldSize ?? race["頭数"] ?? "",
  });

  const normalizeHorseSummary = (horse = {}) => ({
    number: horse.number,
    name: horse.name,
    jockey: horse.jockey,
    popularity: horse.popularity,
    odds: horse.odds,
    aiIndex: horse.aiIndex,
    kamianaIndex: horse.kamianaIndex,
    dangerIndex: horse.dangerIndex,
  });

  const normalizeTicketSummary = (ticket = {}) => ({
    notation: summarizeTicket(ticket),
    type: ticket.type || ticket.mode || "候補",
    reason: ticket.reason || ticket.comment || "AI生成",
    ev: ticket.ev,
    stake: ticket.stake || ticket.recommendedAmount,
  });

  const normalizeInvestment = (item = {}) => ({
    notation: item.notation || [item.number, item.name].filter(Boolean).join(" ") || item.ticketType || "投資候補",
    recommendedAmount: toNumber(item.recommendedAmount, 0),
    ev: item.ev,
    decision: item.decision,
    decisionLabel: item.decisionLabel || item.decision || "判定なし",
    ticketType: item.ticketType,
  });

  const buildResultMatching = (validation) => {
    if (!validation) return { status: "未照合", labels: [], result: null };
    return {
      status: "照合済",
      result: safeClone(validation.result),
      labels: Object.values(validation.labels || {}),
      judgements: safeClone(validation.judgements || {}),
      totalInvestment: toNumber(validation.totalInvestment, 0),
      payout: toNumber(validation.payout, 0),
    };
  };

  const buildOperationDiagnosticReport = ({ predictionLog = {}, validation = null, source = "operation-panel", generatedAt = new Date().toISOString() } = {}) => {
    const race = normalizeRaceBasicInfo(predictionLog.race || validation?.race || {});
    const capitalSummary = predictionLog.capitalSummary || {};
    const osUpdateCandidates = validation?.osUpdateCandidates || predictionLog.osUpdateCandidates || { adopt: [], pending: [], delete: [] };
    return {
      id: `operation-diagnostic-${generatedAt.replace(/[:.]/g, "-")}`,
      generatedAt,
      storageKey: STORAGE_KEY,
      source,
      raceBasicInfo: race,
      aiIndexTop5: asArray(predictionLog.aiTop5).slice(0, 5).map(normalizeHorseSummary),
      kamianaTop5: asArray(predictionLog.kamianaTop5).slice(0, 5).map(normalizeHorseSummary),
      dangerPopularTop5: asArray(predictionLog.dangerTop5).slice(0, 5).map(normalizeHorseSummary),
      trifectaCandidates: asArray(predictionLog.trifectaCandidates).slice(0, 8).map(normalizeTicketSummary),
      win5Candidates: asArray(predictionLog.win5Candidates).slice(0, 8).map((horse) => ({ zone: horse.zone, ...normalizeHorseSummary(horse) })),
      futureSimulationResult: {
        winTop5: asArray(predictionLog.simulationWinTop5).slice(0, 5).map((horse) => ({ ...normalizeHorseSummary(horse), firstRate: horse.firstRate, placeRate: horse.placeRate })),
        simulationCount: predictionLog.simulationCount || predictionLog.simulation?.simulationCount || null,
      },
      evRanking: asArray(predictionLog.evTop).slice(0, 8).map((item) => ({
        number: item.number,
        name: item.name,
        ev: item.ev,
        currentOdds: item.currentOdds,
        fairOdds: item.fairOdds,
        recommendation: item.recommendation,
      })),
      fundAllocation: {
        summary: safeClone(capitalSummary),
        recommendedInvestments: asArray(predictionLog.recommendedInvestments).slice(0, 8).map(normalizeInvestment),
      },
      godRaceJudgement: safeClone(predictionLog.godRace || null),
      resultMatching: buildResultMatching(validation),
      roi: validation ? toNumber(validation.roi, 0) : null,
      selfEvolutionLog: safeClone(validation?.selfEvolutionLog || predictionLog.selfEvolutionLog || null),
      osUpdateCandidates: {
        adopt: asArray(osUpdateCandidates.adopt),
        pending: asArray(osUpdateCandidates.pending),
        delete: asArray(osUpdateCandidates.delete),
      },
      checks: {
        sampleLoaded: Boolean(predictionLog.race),
        aiCalculated: asArray(predictionLog.aiTop5).length >= 5,
        betsGenerated: asArray(predictionLog.trifectaCandidates).length > 0 && asArray(predictionLog.win5Candidates).length > 0,
        resultValidated: Boolean(validation),
        evolutionLogged: Boolean(validation?.selfEvolutionLog || predictionLog.selfEvolutionLog),
      },
    };
  };

  const loadReports = (storage = window.localStorage) => {
    if (!storage) return [];
    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const saveReport = (report, storage = window.localStorage) => {
    if (!storage) return [report];
    const reports = [report, ...loadReports(storage).filter((item) => item.id !== report.id)].slice(0, 50);
    storage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return reports;
  };

  const toExportJson = (report) => JSON.stringify(report, null, 2);
  const createExportFileName = (report) => {
    const race = report?.raceBasicInfo || {};
    const raceLabel = `${race.course || "race"}${race.raceNumber || ""}R`.replace(/[\\/:*?"<>|\s]/g, "_");
    const dateLabel = (race.date || report?.generatedAt || new Date().toISOString()).slice(0, 10);
    return `operation-diagnostic-report_${dateLabel}_${raceLabel}.json`;
  };

  window.HashimotoOperationDiagnosticReportEngine = {
    STORAGE_KEY,
    buildOperationDiagnosticReport,
    loadReports,
    saveReport,
    toExportJson,
    createExportFileName,
  };
})();

(() => {
  const STORAGE_KEY = "operationReadinessChecklist";
  const VERSION = 1;
  const CHECKLIST_ITEMS = [
    { id: "sampleRaceLoad", label: "サンプルレース読込", type: "auto", source: "sampleRaceTestLog" },
    { id: "raceCsvImport", label: "CSV取込", type: "manual", source: "CSV取込画面" },
    { id: "raceCsvValidation", label: "CSVバリデーション", type: "manual", source: "CSVバリデーション表示" },
    { id: "aiIndexAutoCalculation", label: "AI指数自動計算", type: "auto", source: "sampleRaceTestLog.aiTop5" },
    { id: "aiIndexVerification", label: "AI指数検証", type: "auto", source: "scoreVerificationAdjustments" },
    { id: "kamianaRanking", label: "神穴ランキング", type: "auto", source: "sampleRaceTestLog.kamianaTop5" },
    { id: "dangerPopularRanking", label: "危険人気馬ランキング", type: "auto", source: "sampleRaceTestLog.dangerTop5" },
    { id: "trifectaGeneration", label: "三連単生成", type: "auto", source: "sampleRaceTestLog.trifectaCandidates" },
    { id: "win5Generation", label: "WIN5生成", type: "auto", source: "sampleRaceTestLog.win5Candidates" },
    { id: "futureSimulator", label: "未来シミュレーター", type: "auto", source: "sampleRaceTestLog.simulationWinTop5" },
    { id: "evMonitoring", label: "EV監視", type: "auto", source: "sampleRaceTestLog.evTop" },
    { id: "capitalAllocation", label: "資金配分", type: "auto", source: "sampleRaceTestLog.recommendedInvestments" },
    { id: "fundCurveRoi", label: "資金曲線/ROI", type: "auto", source: "sampleRaceResultValidationLog / productionResultValidationReports / fundCurveRecords / roiRecords" },
    { id: "godRaceJudgement", label: "神レース判定", type: "auto", source: "sampleRaceTestLog.godRace" },
    { id: "dangerPopularExclusion", label: "危険人気馬除外", type: "manual", source: "画面確認" },
    { id: "resultInput", label: "結果入力", type: "auto", source: "sampleRaceResultValidationLog / productionResultValidationReports / raceResults" },
    { id: "resultVerification", label: "結果検証", type: "auto", source: "sampleRaceResultValidationLog.judgements / productionResultValidationReports.judgements" },
    { id: "selfEvolutionLog", label: "自己進化ログ", type: "auto", source: "selfEvolutionLogs" },
    { id: "osUpdateCandidates", label: "OSアップデート候補", type: "auto", source: "sampleRaceResultValidationLog.osUpdateCandidates / productionResultValidationReports.osUpdateCandidates" },
    { id: "diagnosticReport", label: "診断レポート生成", type: "auto", source: "operationDiagnosticReports" },
    { id: "jsonExport", label: "JSONエクスポート", type: "manual", source: "JSON出力ボタン確認" },
  ];

  const safeParse = (value, fallback = null) => {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const readStorageJson = (storage, key, fallback = null) => safeParse(storage?.getItem?.(key), fallback);
  const asArray = (value) => Array.isArray(value) ? value : [];
  const hasItems = (value) => asArray(value).length > 0;
  const hasObjectItems = (value) => value && typeof value === "object" && Object.keys(value).length > 0;
  const latestArrayItem = (value) => asArray(value)[0] || null;

  const loadState = (storage = window.localStorage) => {
    const state = readStorageJson(storage, STORAGE_KEY, {});
    return state && typeof state === "object" ? state : {};
  };

  const detectAutoStatus = (id, storage = window.localStorage) => {
    const sample = readStorageJson(storage, "sampleRaceTestLog", null);
    const validation = readStorageJson(storage, "sampleRaceResultValidationLog", null);
    const reports = readStorageJson(storage, "operationDiagnosticReports", []);
    const latestReport = latestArrayItem(reports);
    const productionValidations = readStorageJson(storage, "productionResultValidationReports", []);
    const latestProductionValidation = latestArrayItem(productionValidations);
    const fundCurveRecords = readStorageJson(storage, "fundCurveRecords", []);
    const raceResults = readStorageJson(storage, "raceResults", null);
    const roiRecords = readStorageJson(storage, "roiRecords", []);
    const scoreAdjustments = readStorageJson(storage, "hashimoto-keiba-ai:score-verification-adjustments:v1", {});
    const selfEvolutionV1 = readStorageJson(storage, "hashimoto-keiba-ai:self-evolution-logs:v1", null);
    const selfEvolutionLegacy = readStorageJson(storage, "selfEvolutionLogs", null);
    const godRace = readStorageJson(storage, "godRaceJudgementResults", null);
    const resultInputExists = Boolean(validation?.result || latestProductionValidation?.result || validation?.resultInput || hasItems(raceResults?.items) || hasItems(raceResults?.races));
    const osCandidates = validation?.osUpdateCandidates || latestProductionValidation?.osUpdateCandidates || latestReport?.osUpdateCandidates || sample?.osUpdateCandidates;
    const hasOsCandidates = ["adopt", "pending", "delete"].some((key) => hasItems(osCandidates?.[key]));

    const checks = {
      sampleRaceLoad: [Boolean(sample?.race), "サンプルレースログを確認"],
      aiIndexAutoCalculation: [hasItems(sample?.aiTop5), "AI指数TOP5を確認"],
      aiIndexVerification: [hasObjectItems(scoreAdjustments) || hasItems(latestReport?.aiIndexTop5) || hasItems(sample?.aiTop5), "AI指数検証データを確認"],
      kamianaRanking: [hasItems(sample?.kamianaTop5), "神穴TOP5を確認"],
      dangerPopularRanking: [hasItems(sample?.dangerTop5), "危険人気馬TOP5を確認"],
      trifectaGeneration: [hasItems(sample?.trifectaCandidates), "三連単候補を確認"],
      win5Generation: [hasItems(sample?.win5Candidates), "WIN5候補を確認"],
      futureSimulator: [hasItems(sample?.simulationWinTop5), "未来シミュレーション結果を確認"],
      evMonitoring: [hasItems(sample?.evTop), "EVランキングを確認"],
      capitalAllocation: [hasItems(sample?.recommendedInvestments), "推奨投資額を確認"],
      fundCurveRoi: [Number.isFinite(Number(validation?.roi)) || Number.isFinite(Number(latestProductionValidation?.roi)) || hasItems(fundCurveRecords) || hasItems(roiRecords) || Number.isFinite(Number(latestReport?.roi)), "ROIデータを確認"],
      godRaceJudgement: [Boolean(sample?.godRace?.label || godRace?.label || latestReport?.godRaceJudgement?.label), "神レース判定を確認"],
      resultInput: [resultInputExists, "結果入力データを確認"],
      resultVerification: [Boolean(validation?.judgements || latestProductionValidation?.judgements || latestReport?.resultMatching?.status === "照合済"), "結果照合ログを確認"],
      selfEvolutionLog: [Boolean(validation?.selfEvolutionLog || latestProductionValidation?.selfEvolutionLog || hasItems(selfEvolutionV1?.logs?.resultVerifications) || hasItems(selfEvolutionLegacy?.logs?.resultVerifications)), "自己進化ログを確認"],
      osUpdateCandidates: [hasOsCandidates, "OSアップデート候補を確認"],
      diagnosticReport: [hasItems(reports), "診断レポート保存を確認"],
    };
    const [checked = false, okReason = "データ確認済"] = checks[id] || [];
    return { checked: Boolean(checked), reason: checked ? okReason : "localStorageデータ未確認" };
  };

  const calculateCompletion = (items) => {
    const total = items.length;
    const checked = items.filter((item) => item.checked).length;
    const percentage = total ? Math.round((checked / total) * 100) : 0;
    const mode = percentage >= 90 ? "本番運用可能" : percentage >= 75 ? "実戦投入可能" : percentage >= 50 ? "テスト可能" : "準備不足";
    return { checked, total, percentage, mode };
  };

  const buildChecklistState = ({ storage = window.localStorage, manualChecks = null } = {}) => {
    const previous = loadState(storage);
    const nextManualChecks = manualChecks || previous.manualChecks || {};
    const autoStatuses = {};
    const items = CHECKLIST_ITEMS.map((item) => {
      if (item.type === "auto") {
        const auto = detectAutoStatus(item.id, storage);
        autoStatuses[item.id] = auto;
        return { ...item, checked: auto.checked, status: auto.checked ? "OK" : "未確認", reason: auto.reason };
      }
      const checked = Boolean(nextManualChecks[item.id]);
      return { ...item, checked, status: checked ? "OK" : "手動確認待ち", reason: checked ? "手動チェック済み" : "画面で確認後にチェックしてください" };
    });
    const completion = calculateCompletion(items);
    return { version: VERSION, storageKey: STORAGE_KEY, updatedAt: new Date().toISOString(), manualChecks: nextManualChecks, autoStatuses, items, completion };
  };

  const saveChecklistState = (state, storage = window.localStorage) => {
    storage?.setItem?.(STORAGE_KEY, JSON.stringify(state));
    return state;
  };

  const updateManualCheck = (id, checked, storage = window.localStorage) => {
    const previous = loadState(storage);
    const manualChecks = { ...(previous.manualChecks || {}), [id]: Boolean(checked) };
    return saveChecklistState(buildChecklistState({ storage, manualChecks }), storage);
  };

  window.HashimotoOperationReadinessChecklistEngine = {
    STORAGE_KEY,
    CHECKLIST_ITEMS,
    loadState,
    detectAutoStatus,
    calculateCompletion,
    buildChecklistState,
    saveChecklistState,
    updateManualCheck,
  };
})();


(() => {
  const STORAGE_KEY = "productionReadinessAuditReports";
  const VERSION = 1;
  const STATUSES = {
    implemented: "実装済み",
    partial: "部分実装",
    missing: "未実装",
    confirm: "要確認",
  };
  const STATUS_WEIGHTS = {
    [STATUSES.implemented]: 1,
    [STATUSES.partial]: 0.5,
    [STATUSES.confirm]: 0.25,
    [STATUSES.missing]: 0,
  };

  const AUDIT_ITEMS = [
    { id: "productionRaceInput", label: "本番レース入力", source: "productionRaceEntries / hashimoto-keiba-ai:production-race-entry:v1", evidence: (ctx) => ctx.hasItems(ctx.productionRaceEntries) || ctx.hasItems(ctx.productionRaceCompat) },
    { id: "horseEntryInput", label: "出走馬入力", source: "productionRaceEntries.horses / horseEntries", evidence: (ctx) => ctx.hasHorseEntries },
    { id: "aiBatchRun", label: "AI一括実行", source: "productionRunReports", evidence: (ctx) => ctx.hasItems(ctx.productionRunReports) || Boolean(ctx.sampleRaceLog?.race) },
    { id: "aiIndex", label: "AI指数", source: "productionRunReports.aiTop5 / sampleRaceTestLog.aiTop5", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.aiTop5) || ctx.hasItems(ctx.sampleRaceLog?.aiTop5) },
    { id: "kamianaIndex", label: "神穴指数", source: "productionRunReports.kamianaTop5 / sampleRaceTestLog.kamianaTop5", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.kamianaTop5) || ctx.hasItems(ctx.sampleRaceLog?.kamianaTop5) },
    { id: "dangerPopularIndex", label: "危険人気馬指数", source: "productionRunReports.dangerTop5 / sampleRaceTestLog.dangerTop5", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.dangerTop5) || ctx.hasItems(ctx.sampleRaceLog?.dangerTop5) },
    { id: "trifectaGeneration", label: "三連単生成", source: "productionRunReports.trifectaCandidates / betTickets", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.trifectaCandidates) || ctx.hasItems(ctx.sampleRaceLog?.trifectaCandidates) || ctx.hasItems(ctx.betTickets) },
    { id: "win5Generation", label: "WIN5生成", source: "productionRunReports.win5Candidates / win5Tickets", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.win5Candidates) || ctx.hasItems(ctx.sampleRaceLog?.win5Candidates) || ctx.hasItems(ctx.win5Tickets) },
    { id: "futureSimulator", label: "未来シミュレーター", source: "productionRunReports.simulationWinTop5 / sampleRaceTestLog.simulationWinTop5", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.simulationWinTop5) || ctx.hasItems(ctx.sampleRaceLog?.simulationWinTop5) },
    { id: "evMonitoring", label: "EV監視", source: "productionRunReports.evTop / sampleRaceTestLog.evTop", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.evTop) || ctx.hasItems(ctx.sampleRaceLog?.evTop) },
    { id: "capitalAllocation", label: "資金配分", source: "productionRunReports.recommendedInvestments", evidence: (ctx) => ctx.hasItems(ctx.latestRun?.recommendedInvestments) || ctx.hasItems(ctx.sampleRaceLog?.recommendedInvestments) },
    { id: "godRaceJudgement", label: "神レース判定", source: "productionRunReports.godRace / godRaceJudgementResults", evidence: (ctx) => Boolean(ctx.latestRun?.godRace?.label || ctx.sampleRaceLog?.godRace?.label || ctx.godRace?.label) },
    { id: "productionResultInput", label: "本番結果入力", source: "productionResultValidationReports.result", evidence: (ctx) => Boolean(ctx.latestValidation?.result || ctx.latestValidation?.resultInput || ctx.sampleValidation?.result || ctx.sampleValidation?.resultInput) },
    { id: "resultVerification", label: "結果検証", source: "productionResultValidationReports.judgements", evidence: (ctx) => Boolean(ctx.latestValidation?.judgements || ctx.sampleValidation?.judgements) },
    { id: "selfEvolutionLog", label: "自己進化ログ", source: "selfEvolutionLogs / hashimoto-keiba-ai:self-evolution-logs:v1", evidence: (ctx) => Boolean(ctx.latestValidation?.selfEvolutionLog || ctx.sampleValidation?.selfEvolutionLog || ctx.selfEvolutionCount > 0) },
    { id: "fundCurveRoi", label: "資金曲線/ROI", source: "fundCurveRecords / roiRecords / validation.roi", evidence: (ctx) => ctx.hasItems(ctx.fundCurveRecords) || ctx.hasItems(ctx.roiRecords) || Number.isFinite(Number(ctx.latestValidation?.roi)) || Number.isFinite(Number(ctx.sampleValidation?.roi)) },
    { id: "diagnosticReport", label: "診断レポート", source: "operationDiagnosticReports", evidence: (ctx) => ctx.hasItems(ctx.operationDiagnosticReports) },
    { id: "backup", label: "バックアップ", source: "preRestoreBackup / production backup export UI", evidence: (ctx) => Boolean(ctx.preRestoreBackup || ctx.hasItems(ctx.backupRestoreLogs)), confirmWhenNoEvidence: true },
    { id: "restore", label: "復元", source: "backupRestoreLogs", evidence: (ctx) => ctx.hasItems(ctx.backupRestoreLogs), confirmWhenNoEvidence: true },
    { id: "ipadOperation", label: "iPad運用", source: "Pages公開チェック / iPadクイックUI", evidence: (ctx) => Boolean(ctx.pagesPublicUrl || ctx.ipadAuditConfirmed), confirmWhenNoEvidence: true },
  ];

  const safeParseJson = (value, fallback = null) => {
    if (value === null || value === undefined || value === "") return fallback;
    try {
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  };
  const readStorageJson = (storage, key, fallback = null) => safeParseJson(storage?.getItem?.(key), fallback);
  const asArray = (value) => Array.isArray(value) ? value : [];
  const latestArrayItem = (value) => asArray(value)[0] || null;
  const hasItems = (value) => asArray(value).length > 0;
  const objectListCount = (value) => {
    if (Array.isArray(value)) return value.length;
    if (!value || typeof value !== "object") return 0;
    if (value.logs && typeof value.logs === "object") {
      return Object.values(value.logs).reduce((total, item) => total + (Array.isArray(item) ? item.length : 0), 0);
    }
    return ["items", "entries", "horses", "records", "reports", "results", "races"].reduce((total, key) => total + (Array.isArray(value[key]) ? value[key].length : 0), 0);
  };

  const buildContext = (storage = window.localStorage) => {
    const productionRaceEntries = readStorageJson(storage, "productionRaceEntries", []);
    const productionRaceCompat = readStorageJson(storage, "hashimoto-keiba-ai:production-race-entry:v1", []);
    const horseEntries = readStorageJson(storage, "horseEntries", null);
    const productionRunReports = readStorageJson(storage, "productionRunReports", []);
    const productionResultValidationReports = readStorageJson(storage, "productionResultValidationReports", []);
    const selfEvolutionLogs = readStorageJson(storage, "selfEvolutionLogs", null);
    const selfEvolutionV1 = readStorageJson(storage, "hashimoto-keiba-ai:self-evolution-logs:v1", null);
    const sampleRaceLog = readStorageJson(storage, "sampleRaceTestLog", null);
    const sampleValidation = readStorageJson(storage, "sampleRaceResultValidationLog", null);
    const latestRun = latestArrayItem(productionRunReports) || sampleRaceLog;
    const latestValidation = latestArrayItem(productionResultValidationReports);
    const hasHorseEntries = [productionRaceEntries, productionRaceCompat].some((entryList) => asArray(entryList).some((entry) => hasItems(entry?.horses))) || hasItems(horseEntries?.horses) || hasItems(horseEntries);
    return {
      storage,
      productionRaceEntries,
      productionRaceCompat,
      horseEntries,
      productionRunReports,
      productionResultValidationReports,
      latestRun,
      latestValidation,
      sampleRaceLog,
      sampleValidation,
      operationDiagnosticReports: readStorageJson(storage, "operationDiagnosticReports", []),
      fundCurveRecords: readStorageJson(storage, "fundCurveRecords", []),
      roiRecords: readStorageJson(storage, "roiRecords", []),
      betTickets: readStorageJson(storage, "betTickets", []),
      win5Tickets: readStorageJson(storage, "win5Tickets", []),
      godRace: readStorageJson(storage, "godRaceJudgementResults", null),
      preRestoreBackup: readStorageJson(storage, "preRestoreBackup", null),
      backupRestoreLogs: readStorageJson(storage, "backupRestoreLogs", []),
      pagesPublicUrl: storage?.getItem?.("hashimoto-keiba-ai:pages-public-url:v1"),
      ipadAuditConfirmed: storage?.getItem?.("hashimoto-keiba-ai:ipad-operation-confirmed:v1") === "true",
      selfEvolutionCount: objectListCount(selfEvolutionLogs) + objectListCount(selfEvolutionV1),
      hasHorseEntries,
      hasItems,
    };
  };

  const auditItem = (item, context) => {
    const implemented = Boolean(item.evidence(context));
    const status = implemented ? STATUSES.implemented : item.confirmWhenNoEvidence ? STATUSES.confirm : STATUSES.partial;
    return {
      id: item.id,
      label: item.label,
      status,
      source: item.source,
      score: STATUS_WEIGHTS[status],
      detail: implemented ? `${item.source} の運用データを確認しました。` : item.confirmWhenNoEvidence ? "画面・実機操作で最終確認してください。" : "機能枠はありますが、本番運用データ保存が未確認です。",
    };
  };

  const calculateCompletion = (items = []) => {
    const total = items.length;
    const score = items.reduce((sum, item) => sum + (STATUS_WEIGHTS[item.status] ?? 0), 0);
    const percentage = total ? Math.round((score / total) * 100) : 0;
    const operationStatus = percentage >= 95 ? "本番運用可能" : percentage >= 85 ? "実戦投入可能" : percentage >= 60 ? "テスト運用可能" : "開発中";
    return { total, score, percentage, operationStatus };
  };

  const buildAuditReport = ({ storage = window.localStorage } = {}) => {
    const context = buildContext(storage);
    const items = AUDIT_ITEMS.map((item) => auditItem(item, context));
    const completion = calculateCompletion(items);
    const improvementCandidates = items.filter((item) => item.status !== STATUSES.implemented);
    return {
      version: VERSION,
      id: `production-readiness-audit:${Date.now()}`,
      storageKey: STORAGE_KEY,
      generatedAt: new Date().toISOString(),
      items,
      completion,
      improvementCandidates,
      summaryText: buildReportText({ items, completion, improvementCandidates }),
    };
  };

  function buildReportText({ items, completion, improvementCandidates }) {
    const lines = [
      "橋本競馬AI 本番運用完成度監査レポート",
      `完成度: ${completion.percentage}%`,
      `本番運用ステータス: ${completion.operationStatus}`,
      "",
      "監査項目:",
      ...items.map((item) => `- ${item.label}: ${item.status}（${item.source}）`),
      "",
      "改善候補:",
      ...(improvementCandidates.length ? improvementCandidates.map((item) => `- ${item.label}: ${item.status} / ${item.detail}`) : ["- なし"]),
    ];
    return lines.join("\n");
  }

  const loadReports = (storage = window.localStorage) => {
    const reports = readStorageJson(storage, STORAGE_KEY, []);
    return Array.isArray(reports) ? reports : [];
  };

  const saveReport = (report, storage = window.localStorage) => {
    const reports = [report, ...loadReports(storage)].slice(0, 50);
    storage?.setItem?.(STORAGE_KEY, JSON.stringify(reports));
    return reports;
  };

  window.HashimotoProductionReadinessAuditEngine = {
    STORAGE_KEY,
    STATUSES,
    AUDIT_ITEMS,
    STATUS_WEIGHTS,
    buildContext,
    calculateCompletion,
    buildAuditReport,
    buildReportText,
    loadReports,
    saveReport,
  };
})();



(() => {
  const OPERATION_LOG_STORAGE_KEY = "productionOperationLogs";
  const MAX_OPERATION_LOGS = 500;
  const OPERATION_TYPES = [
    "本番レース入力",
    "AI一括実行",
    "買い目生成",
    "資金配分計算",
    "神レース判定",
    "結果入力",
    "結果検証",
    "自己進化ログ保存",
    "バックアップ実行",
    "復元実行",
    "モード切替",
  ];
  const OPERATION_STATUSES = ["完了", "警告", "失敗"];

  const safeParseOperationJson = (value, fallback = null) => {
    if (value === null || value === undefined || value === "") return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  };
  const normalizeOperationText = (value) => String(value ?? "").trim();
  const readOperationLogs = (storage = window.localStorage) => {
    const parsed = safeParseOperationJson(storage?.getItem?.(OPERATION_LOG_STORAGE_KEY), []);
    return Array.isArray(parsed) ? parsed : [];
  };
  const normalizeRaceNumberForLog = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : "";
  };
  const extractRaceContext = (context = {}) => {
    const race = context.race || context.payload?.race || context.report?.productionPayload?.race || context.validation?.payload?.race || {};
    return {
      racecourse: normalizeOperationText(context.racecourse ?? context.course ?? race.course ?? race.racecourse),
      raceNumber: normalizeRaceNumberForLog(context.raceNumber ?? race.raceNumber),
      raceName: normalizeOperationText(context.raceName ?? race.raceName),
    };
  };
  const createOperationLog = (input = {}) => {
    const raceContext = extractRaceContext(input);
    const operationType = OPERATION_TYPES.includes(input.operationType) ? input.operationType : normalizeOperationText(input.operationType || "未分類");
    const status = OPERATION_STATUSES.includes(input.status) ? input.status : normalizeOperationText(input.status || "完了");
    return {
      id: input.id || `operation:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      timestamp: input.timestamp || new Date().toISOString(),
      operationType,
      racecourse: raceContext.racecourse,
      raceNumber: raceContext.raceNumber,
      raceName: raceContext.raceName,
      summary: normalizeOperationText(input.summary),
      status,
      memo: normalizeOperationText(input.memo),
    };
  };
  const appendOperationLog = (input = {}, storage = window.localStorage) => {
    const log = createOperationLog(input);
    const logs = [log, ...readOperationLogs(storage)].slice(0, MAX_OPERATION_LOGS);
    storage?.setItem?.(OPERATION_LOG_STORAGE_KEY, JSON.stringify(logs));
    return { log, logs };
  };
  const filterOperationLogs = (logs = [], filters = {}) => {
    const date = normalizeOperationText(filters.date);
    const racecourse = normalizeOperationText(filters.racecourse);
    const operationType = normalizeOperationText(filters.operationType);
    const status = normalizeOperationText(filters.status);
    return (Array.isArray(logs) ? logs : []).filter((log) => {
      const logDate = normalizeOperationText(log.timestamp).slice(0, 10);
      return (!date || logDate === date)
        && (!racecourse || normalizeOperationText(log.racecourse).includes(racecourse))
        && (!operationType || log.operationType === operationType)
        && (!status || log.status === status);
    });
  };
  const createExportPayload = (logs = [], filters = {}) => ({
    storageKey: OPERATION_LOG_STORAGE_KEY,
    exportedAt: new Date().toISOString(),
    filters: { ...filters },
    count: Array.isArray(logs) ? logs.length : 0,
    logs: Array.isArray(logs) ? logs : [],
  });
  const exportLogsJson = (logs = [], filters = {}) => JSON.stringify(createExportPayload(logs, filters), null, 2);

  window.HashimotoProductionOperationLogEngine = {
    OPERATION_LOG_STORAGE_KEY,
    MAX_OPERATION_LOGS,
    OPERATION_TYPES,
    OPERATION_STATUSES,
    readOperationLogs,
    createOperationLog,
    appendOperationLog,
    filterOperationLogs,
    createExportPayload,
    exportLogsJson,
  };
})();

(() => {
  const PRODUCTION_BACKUP_TYPE = "hashimoto-keiba-ai-production-operation-backup";
  const PRE_RESTORE_BACKUP_KEY = "preRestoreBackup";
  const RESTORE_LOG_STORAGE_KEY = "backupRestoreLogs";
  const PRODUCTION_RACE_COMPAT_STORAGE_KEY = "hashimoto-keiba-ai:production-race-entry:v1";
  const SELF_EVOLUTION_COMPAT_STORAGE_KEY = "hashimoto-keiba-ai:self-evolution-logs:v1";

  const REQUIRED_BACKUP_TARGETS = [
    { key: "productionRaceEntries", label: "本番入力レース", alternateKeys: [PRODUCTION_RACE_COMPAT_STORAGE_KEY] },
    { key: "productionRunReports", label: "本番AI分析結果" },
    { key: "productionResultValidationReports", label: "本番結果検証" },
    { key: "selfEvolutionLogs", label: "自己進化ログ", alternateKeys: [SELF_EVOLUTION_COMPAT_STORAGE_KEY] },
    { key: "fundCurveRecords", label: "資金曲線" },
    { key: "operationDiagnosticReports", label: "実戦診断レポート" },
    { key: "operationReadinessChecklist", label: "実戦運用チェックリスト" },
    { key: "sampleRaceTestLog", label: "サンプルレース一括テストログ" },
    { key: "sampleRaceResultValidationLog", label: "サンプル結果検証ログ" },
  ];

  const safeParseJson = (value, fallback = null) => {
    if (value === null || value === undefined || value === "") return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  };

  const stringifyForStorage = (value) => JSON.stringify(value ?? null);

  const getRawStorageValue = (storage, target) => {
    const keys = [target.key, ...(target.alternateKeys || [])];
    const foundKey = keys.find((key) => storage?.getItem?.(key) !== null && storage?.getItem?.(key) !== undefined);
    return { storageKey: foundKey || target.key, raw: foundKey ? storage.getItem(foundKey) : null };
  };

  const countDataItems = (value) => {
    if (Array.isArray(value)) return value.length;
    if (!value || typeof value !== "object") return value === null || value === undefined ? 0 : 1;
    const listKeys = ["reports", "logs", "records", "results", "items", "entries", "races", "horses", "rules", "resultVerifications", "backtests", "improvementProposals"];
    const directList = listKeys.find((key) => Array.isArray(value[key]));
    if (directList) return value[directList].length;
    if (value.logs && typeof value.logs === "object") {
      return Object.values(value.logs).reduce((total, item) => total + (Array.isArray(item) ? item.length : 0), 0);
    }
    return Object.keys(value).length;
  };

  const createLocalStorageSnapshot = (storage, preferredKeys = REQUIRED_BACKUP_TARGETS.map((target) => target.key)) => {
    const keys = new Set(preferredKeys);
    if (Number.isFinite(Number(storage?.length)) && typeof storage?.key === "function") {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key) keys.add(key);
      }
    }
    const values = {};
    keys.forEach((key) => {
      const raw = storage?.getItem?.(key);
      if (raw !== null && raw !== undefined) {
        values[key] = { raw, value: safeParseJson(raw, raw) };
      }
    });
    return {
      storageVersion: 1,
      type: "hashimoto-keiba-ai-localStorage-snapshot",
      createdAt: new Date().toISOString(),
      keys: Object.keys(values),
      values,
    };
  };

  const createPreRestoreBackup = (storage = window.localStorage) => {
    const snapshot = createLocalStorageSnapshot(storage);
    storage?.setItem?.(PRE_RESTORE_BACKUP_KEY, JSON.stringify(snapshot));
    return snapshot;
  };

  const loadRestoreLogs = (storage = window.localStorage) => {
    const parsed = safeParseJson(storage?.getItem?.(RESTORE_LOG_STORAGE_KEY), []);
    return Array.isArray(parsed) ? parsed : [];
  };

  const appendRestoreLog = (log, storage = window.localStorage) => {
    const logs = [{ id: `restore:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`, loggedAt: new Date().toISOString(), ...log }, ...loadRestoreLogs(storage)].slice(0, 100);
    storage?.setItem?.(RESTORE_LOG_STORAGE_KEY, JSON.stringify(logs));
    return logs;
  };

  const createBackupPayload = (storage = window.localStorage) => {
    const data = REQUIRED_BACKUP_TARGETS.reduce((accumulator, target) => {
      const found = getRawStorageValue(storage, target);
      const value = safeParseJson(found.raw, null);
      accumulator[target.key] = {
        label: target.label,
        storageKey: target.key,
        sourceStorageKey: found.storageKey,
        alternateKeys: target.alternateKeys || [],
        required: true,
        missing: found.raw === null || found.raw === undefined,
        itemCount: countDataItems(value),
        value,
      };
      return accumulator;
    }, {});
    return {
      storageVersion: 1,
      type: PRODUCTION_BACKUP_TYPE,
      provider: "localStorage",
      createdAt: new Date().toISOString(),
      keys: REQUIRED_BACKUP_TARGETS.map((target) => target.key),
      data,
      summary: summarizeBackupData(data),
    };
  };

  const summarizeBackupData = (data = {}) => {
    const entries = Object.entries(data);
    return {
      keyCount: entries.length,
      totalItemCount: entries.reduce((total, [, entry]) => total + countDataItems(entry?.value), 0),
      itemCounts: Object.fromEntries(entries.map(([key, entry]) => [key, countDataItems(entry?.value)])),
      missingKeys: REQUIRED_BACKUP_TARGETS.filter((target) => !data[target.key] || data[target.key].missing).map((target) => target.key),
    };
  };

  const normalizeBackupPayload = (payload = {}) => {
    if (payload.type === PRODUCTION_BACKUP_TYPE && payload.data) {
      const data = { ...payload.data };
      Object.values(data).forEach((entry) => {
        if (entry && !Object.prototype.hasOwnProperty.call(entry, "itemCount")) entry.itemCount = countDataItems(entry.value);
      });
      return { ...payload, keys: payload.keys || Object.keys(data), data, summary: payload.summary || summarizeBackupData(data) };
    }
    const data = Object.fromEntries(Object.entries(payload || {}).map(([key, value]) => [key, { label: key, storageKey: key, required: REQUIRED_BACKUP_TARGETS.some((target) => target.key === key), missing: false, itemCount: countDataItems(value), value }]));
    return { storageVersion: 1, type: "legacy-production-operation-backup", createdAt: new Date().toISOString(), keys: Object.keys(data), data, summary: summarizeBackupData(data) };
  };

  const validateBackupPayload = (payload = {}) => {
    const normalized = normalizeBackupPayload(payload);
    const requiredKeys = REQUIRED_BACKUP_TARGETS.map((target) => target.key);
    const dataKeys = Object.keys(normalized.data || {});
    const missingRequiredKeys = requiredKeys.filter((key) => !Object.prototype.hasOwnProperty.call(normalized.data || {}, key));
    const emptyRequiredKeys = requiredKeys.filter((key) => normalized.data?.[key]?.missing);
    const itemCounts = Object.fromEntries(requiredKeys.map((key) => [key, countDataItems(normalized.data?.[key]?.value)]));
    const overwriteTargets = requiredKeys.filter((key) => Object.prototype.hasOwnProperty.call(normalized.data || {}, key));
    const warnings = [
      ...missingRequiredKeys.map((key) => `必要キー ${key} がバックアップJSONにありません。`),
      ...emptyRequiredKeys.map((key) => `${key} はバックアップ作成時点で未保存または空です。`),
      overwriteTargets.length ? "復元すると現在のlocalStorageデータを上書きします。" : "上書き対象がありません。",
    ];
    return {
      ok: missingRequiredKeys.length === 0,
      payload: normalized,
      backupCreatedAt: normalized.createdAt || "未記録",
      requiredKeys,
      dataKeys,
      missingRequiredKeys,
      emptyRequiredKeys,
      itemCounts,
      overwriteTargets,
      totalItemCount: Object.values(itemCounts).reduce((total, count) => total + count, 0),
      warnings,
    };
  };

  const restoreBackupPayload = (payload = {}, storage = window.localStorage, options = {}) => {
    const validation = validateBackupPayload(payload);
    if (options.requireComplete !== false && !validation.ok) {
      throw new Error(`バックアップJSONの必要キーが不足しています: ${validation.missingRequiredKeys.join(", ")}`);
    }
    const preRestoreBackup = createPreRestoreBackup(storage);
    const restoredKeys = [];
    validation.overwriteTargets.forEach((key) => {
      const entry = validation.payload.data[key];
      if (!entry || entry.missing || !Object.prototype.hasOwnProperty.call(entry, "value")) return;
      storage?.setItem?.(key, stringifyForStorage(entry.value));
      restoredKeys.push(key);
      const target = REQUIRED_BACKUP_TARGETS.find((item) => item.key === key);
      (target?.alternateKeys || []).forEach((alternateKey) => storage?.setItem?.(alternateKey, stringifyForStorage(entry.value)));
    });
    const logs = appendRestoreLog({
      action: "production-operation-restore",
      sourceCreatedAt: validation.backupCreatedAt,
      restoredKeys,
      missingRequiredKeys: validation.missingRequiredKeys,
      emptyRequiredKeys: validation.emptyRequiredKeys,
      preRestoreBackupKey: PRE_RESTORE_BACKUP_KEY,
      preRestoreBackupCreatedAt: preRestoreBackup.createdAt,
    }, storage);
    window.HashimotoProductionOperationLogEngine?.appendOperationLog?.({
      operationType: "復元実行",
      summary: `${restoredKeys.length}キーを本番運用バックアップから復元`,
      status: restoredKeys.length ? "完了" : "警告",
      memo: `sourceCreatedAt=${validation.backupCreatedAt || "未記録"}`,
    }, storage);
    return { validation, restoredKeys, preRestoreBackup, logs };
  };

  window.HashimotoProductionOperationBackupEngine = {
    PRODUCTION_BACKUP_TYPE,
    PRE_RESTORE_BACKUP_KEY,
    RESTORE_LOG_STORAGE_KEY,
    REQUIRED_BACKUP_TARGETS,
    countDataItems,
    createLocalStorageSnapshot,
    createPreRestoreBackup,
    loadRestoreLogs,
    appendRestoreLog,
    createBackupPayload,
    normalizeBackupPayload,
    validateBackupPayload,
    restoreBackupPayload,
  };
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

(() => {
  const MODE_STORAGE_KEY = "productionOperationMode";
  const SCORE_STORAGE_KEY = "productionOperationScores";
  const BACKUP_LATEST_KEY = "productionOperationBackupLatest";
  const DEFAULT_HORSES = [
    { number: 1, name: "プロダクションワン", popularity: 1, odds: 2.4, jockey: "ルメール", trainer: "木村", runningStyle: "先行", training: "A" },
    { number: 2, name: "カミアナスター", popularity: 8, odds: 24.5, jockey: "坂井", trainer: "矢作", runningStyle: "差し", training: "S" },
    { number: 3, name: "デンジャー人気", popularity: 2, odds: 3.8, jockey: "新人", trainer: "田中", runningStyle: "追込", training: "C" },
    { number: 4, name: "フロントランナー", popularity: 5, odds: 12.2, jockey: "横山武", trainer: "斎藤", runningStyle: "逃げ", training: "B" },
    { number: 5, name: "ミドルホース", popularity: 4, odds: 9.1, jockey: "戸崎", trainer: "国枝", runningStyle: "自在", training: "B" },
    { number: 6, name: "ロングショット", popularity: 10, odds: 41.0, jockey: "若手", trainer: "高橋", runningStyle: "追込", training: "A" },
  ];
  const FLOW_STEPS = ["input", "ai", "tickets", "investment", "result", "validation", "evolution", "backup"];
  const MODE_LABELS = { development: "開発モード", test: "テストモード", production: "本番運用モード" };
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 0) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, toNumber(value)));
  const safeParse = (raw, fallback = null) => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  };
  const readJson = (storage, key, fallback) => safeParse(storage?.getItem?.(key), fallback);
  const asArray = (value) => Array.isArray(value) ? value : [];
  const includesNumber = (items, number) => asArray(items).some((item) => String(item?.number ?? item?.horseNumber ?? item) === String(number));
  const flattenTickets = (tickets = {}) => [
    ...asArray(tickets.main),
    ...asArray(tickets.attack),
    ...asArray(tickets.jackpot),
  ];
  const flattenWin5 = (zones = {}) => Object.values(zones || {}).flatMap((items) => asArray(items));
  const ticketText = (ticket = {}) => ticket.notation || [ticket.first, ticket.second, ticket.third].map((horse) => horse?.number ?? horse).filter(Boolean).join("→");

  const calculateOperationScore = (input = {}) => {
    const completion = clamp(input.completion ?? input.readiness ?? 0);
    const roiScore = clamp(input.roi ?? 0);
    const godRaceRate = clamp(input.godRaceRate ?? input.godRaceJudgementRate ?? 0);
    const dangerPopularSuccessRate = clamp(input.dangerPopularSuccessRate ?? 0);
    const kamianaSuccessRate = clamp(input.kamianaSuccessRate ?? 0);
    const trifectaHitRate = clamp(input.trifectaHitRate ?? 0);
    const total = round((completion * 0.28) + (roiScore * 0.22) + (godRaceRate * 0.14) + (dangerPopularSuccessRate * 0.12) + (kamianaSuccessRate * 0.12) + (trifectaHitRate * 0.12));
    return {
      completion,
      roi: roiScore,
      godRaceRate,
      dangerPopularSuccessRate,
      kamianaSuccessRate,
      trifectaHitRate,
      score: clamp(total),
      judgement: judgeOperation(total),
      calculatedAt: new Date().toISOString(),
    };
  };

  const judgeOperation = (score) => {
    const value = clamp(score);
    if (value >= 90) return "完全運用";
    if (value >= 70) return "実戦運用";
    if (value >= 40) return "テスト運用";
    return "準備中";
  };

  const deriveScoresFromStorage = (storage = window.localStorage) => {
    const saved = readJson(storage, SCORE_STORAGE_KEY, null);
    const readiness = asArray(readJson(storage, "productionReadinessAuditReports", [])).at(0);
    const validationReports = asArray(readJson(storage, "productionResultValidationReports", []));
    const runReports = asArray(readJson(storage, "productionRunReports", []));
    const completion = toNumber(readiness?.completion?.percentage ?? readiness?.summary?.completionRate ?? saved?.completion, runReports.length ? 82 : 25);
    const recent = validationReports.slice(0, 20);
    const roiAverage = recent.length
      ? recent.reduce((sum, item) => sum + toNumber(item.roi ?? item.summary?.roi), 0) / recent.length
      : toNumber(saved?.roi, runReports.length ? 75 : 0);
    const rate = (field) => recent.length ? (recent.filter((item) => item[field] || item.judgements?.[field]).length / recent.length) * 100 : toNumber(saved?.[field], 0);
    return calculateOperationScore({
      completion,
      roi: Math.min(100, roiAverage),
      godRaceRate: recent.length ? rate("godRaceHit") : toNumber(saved?.godRaceRate, runReports.length ? 80 : 0),
      dangerPopularSuccessRate: rate("dangerPopularSuccess"),
      kamianaSuccessRate: rate("kamianaHit"),
      trifectaHitRate: rate("trifectaHit"),
    });
  };

  const saveMode = (mode, storage = window.localStorage) => {
    const normalized = MODE_LABELS[mode] ? mode : "development";
    storage?.setItem?.(MODE_STORAGE_KEY, normalized);
    return normalized;
  };

  const saveScores = (scores, storage = window.localStorage) => {
    storage?.setItem?.(SCORE_STORAGE_KEY, JSON.stringify(scores));
    return scores;
  };

  const buildValidationReport = ({ payload = {}, result = {} } = {}) => {
    const tickets = flattenTickets(payload.trifecta?.tickets);
    const win5Candidates = flattenWin5(payload.win5?.zones);
    const topAi = payload.aiIndexRanking?.[0];
    const topKamiana = payload.kamianaRanking?.[0];
    const topDanger = payload.dangerPopularRanking?.[0];
    const firstNumber = String(result.firstNumber || "");
    const top3 = [result.firstNumber, result.secondNumber, result.thirdNumber].map((value) => String(value || ""));
    const trifectaHit = tickets.some((ticket) => [ticket.first, ticket.second, ticket.third].map((horse) => String(horse?.number ?? horse)).join("-") === top3.join("-"));
    const investment = toNumber(result.investment, 0);
    const payout = toNumber(result.payout, 0);
    const roi = investment > 0 ? round((payout / investment) * 100, 1) : 0;
    return {
      id: `production-operation-validation-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      race: payload.race || {},
      result,
      investment,
      payout,
      roi,
      topAiHit: String(topAi?.number || "") === firstNumber,
      kamianaHit: includesNumber([topKamiana], result.firstNumber) || includesNumber([topKamiana], result.secondNumber) || includesNumber([topKamiana], result.thirdNumber),
      dangerPopularSuccess: topDanger ? !top3.includes(String(topDanger.number)) : false,
      trifectaHit,
      win5Hit: includesNumber(win5Candidates, result.firstNumber),
      godRaceHit: Boolean(payload.godRace?.skip === false && roi >= 100),
      summary: `ROI ${roi}% / 三連単${trifectaHit ? "的中" : "不的中"} / 神穴${topKamiana?.name || "未判定"}`,
    };
  };

  const buildSelfEvolutionLog = (report = {}) => ({
    id: `production-operation-evolution-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    source: "production-operation-mode",
    targetAi: report.trifectaHit ? "三連単AI・EV資金配分" : "AI指数・神穴・危険人気馬補正",
    improvement: report.trifectaHit ? "的中買い目の指数配列と資金配分を採用候補へ昇格" : "不的中パターンを保留し、展開・馬場・危険人気馬の閾値を再学習候補へ追加",
    status: report.trifectaHit || report.roi >= 100 ? "採用" : "保留",
    evidenceRace: `${report.race?.date || "未日付"} ${report.race?.course || "未競馬場"} ${report.race?.raceNumber || "?"}R ${report.race?.raceName || "本番運用レース"}`,
    reason: report.summary,
    nextReflectionMemo: `次回本番運用スコアへROI ${report.roi}%と判定結果を反映`,
  });

  const saveValidationAndEvolution = ({ payload, result, storage = window.localStorage }) => {
    const report = buildValidationReport({ payload, result });
    const reports = [report, ...asArray(readJson(storage, "productionResultValidationReports", []))].slice(0, 100);
    storage?.setItem?.("productionResultValidationReports", JSON.stringify(reports));
    const evolutionLog = buildSelfEvolutionLog(report);
    const legacyLogs = readJson(storage, "selfEvolutionLogs", { logs: { resultVerifications: [], backtests: [], improvementProposals: [] } }) || { logs: { resultVerifications: [], backtests: [], improvementProposals: [] } };
    const logs = legacyLogs.logs || legacyLogs;
    logs.resultVerifications = [evolutionLog, ...asArray(logs.resultVerifications)].slice(0, 100);
    storage?.setItem?.("selfEvolutionLogs", JSON.stringify({ ...legacyLogs, logs }));
    storage?.setItem?.("hashimoto-keiba-ai:self-evolution-logs:v1", JSON.stringify({ ...legacyLogs, logs }));
    const fundCurveRecords = [
      { id: report.id, date: report.generatedAt, investment: report.investment, payout: report.payout, roi: report.roi, race: report.race },
      ...asArray(readJson(storage, "fundCurveRecords", [])),
    ].slice(0, 200);
    storage?.setItem?.("fundCurveRecords", JSON.stringify(fundCurveRecords));
    const raceDatabaseRecord = window.HashimotoProductionRaceEngine?.updateRaceDatabaseResult?.({ payload, validationReport: report }, storage) || null;
    return { report, evolutionLog, fundCurveRecords, raceDatabaseRecord };
  };

  const createOperationBackup = (storage = window.localStorage) => {
    const backupEngine = window.HashimotoProductionOperationBackupEngine;
    const payload = backupEngine?.createBackupPayload ? backupEngine.createBackupPayload(storage) : {
      type: "production-operation-mode-backup",
      generatedAt: new Date().toISOString(),
      keys: ["productionOperationMode", "productionOperationScores", "productionRunReports", "productionResultValidationReports", "selfEvolutionLogs", "fundCurveRecords"],
      data: {},
    };
    payload.data.productionOperationMode = { label: "Phase5-1運用モード", storageKey: MODE_STORAGE_KEY, required: true, value: storage?.getItem?.(MODE_STORAGE_KEY), itemCount: storage?.getItem?.(MODE_STORAGE_KEY) ? 1 : 0 };
    payload.data.productionOperationScores = { label: "Phase5-1運用スコア", storageKey: SCORE_STORAGE_KEY, required: true, value: readJson(storage, SCORE_STORAGE_KEY, null), itemCount: storage?.getItem?.(SCORE_STORAGE_KEY) ? 1 : 0 };
    payload.keys = Array.from(new Set([...(payload.keys || []), MODE_STORAGE_KEY, SCORE_STORAGE_KEY]));
    storage?.setItem?.(BACKUP_LATEST_KEY, JSON.stringify(payload));
    return payload;
  };

  window.HashimotoProductionOperationModeEngine = {
    MODE_STORAGE_KEY,
    SCORE_STORAGE_KEY,
    BACKUP_LATEST_KEY,
    DEFAULT_HORSES,
    FLOW_STEPS,
    MODE_LABELS,
    calculateOperationScore,
    deriveScoresFromStorage,
    saveMode,
    saveScores,
    judgeOperation,
    buildValidationReport,
    buildSelfEvolutionLog,
    saveValidationAndEvolution,
    createOperationBackup,
  };

  const documentRef = window.document;
  if (!documentRef?.querySelector) return;

  const modeInputs = Array.from(documentRef.querySelectorAll('input[name="production-operation-mode"]'));
  const modeLabel = documentRef.querySelector("#production-operation-mode-label");
  const raceForm = documentRef.querySelector("#production-operation-race-form");
  const resultForm = documentRef.querySelector("#production-operation-result-form");
  const status = documentRef.querySelector("#production-operation-status");
  const scoreValue = documentRef.querySelector("#production-operation-score");
  const scoreNote = documentRef.querySelector("#production-operation-score-note");
  const judgementValue = documentRef.querySelector("#production-operation-judgement");
  const refreshScoreButton = documentRef.querySelector("#production-operation-score-refresh");
  const backupButton = documentRef.querySelector("#production-operation-backup");
  const logTableBody = documentRef.querySelector("#production-operation-log-body");
  const logFiltersForm = documentRef.querySelector("#production-operation-log-filters");
  const logExportButton = documentRef.querySelector("#production-operation-log-export");
  const logCount = documentRef.querySelector("#production-operation-log-count");
  const raceDatabaseForm = documentRef.querySelector("#race-database-search-form");
  const raceDatabaseBody = documentRef.querySelector("#race-database-body");
  const raceDatabaseCount = documentRef.querySelector("#race-database-count");
  const raceDatabaseReset = documentRef.querySelector("#race-database-reset");
  const raceDatabaseSummary = documentRef.querySelector("#race-database-summary");
  const raceDatabaseCourseRoi = documentRef.querySelector("#race-database-course-roi");
  const raceDatabaseDistanceRoi = documentRef.querySelector("#race-database-distance-roi");
  const raceDatabaseExport = documentRef.querySelector("#race-database-export");
  const raceDatabaseImportRunReports = documentRef.querySelector("#race-database-import-run-reports");
  const raceDatabaseStatus = documentRef.querySelector("#race-database-status");
  const logEngine = window.HashimotoProductionOperationLogEngine;
  const latestPayload = () => readJson(window.localStorage, "hashimoto-keiba-ai:production-race-entry:v1", null) || readJson(window.localStorage, "productionRaceEntries", [])[0] || null;
  let currentPayload = latestPayload();

  const setFlow = (activeSteps = []) => {
    const active = new Set(activeSteps);
    documentRef.querySelectorAll("#production-operation-flow li").forEach((item) => {
      item.classList.toggle("is-complete", active.has(item.dataset.step));
    });
  };

  const renderList = (selector, items, formatter) => {
    const target = documentRef.querySelector(selector);
    if (!target) return;
    target.innerHTML = items.length ? items.map((item, index) => `<li><strong>${index + 1}. ${formatter(item)}</strong></li>`).join("") : '<li class="empty-state">未実行</li>';
  };

  const renderScores = (scores) => {
    if (scoreValue) scoreValue.textContent = String(scores.score);
    if (judgementValue) judgementValue.textContent = scores.judgement;
    if (scoreNote) scoreNote.textContent = `完成度${scores.completion}% / ROI${scores.roi}% / 神レース${scores.godRaceRate}% / 危険人気馬${scores.dangerPopularSuccessRate}% / 神穴${scores.kamianaSuccessRate}% / 三連単${scores.trifectaHitRate}%`;
  };

  const refreshScores = () => {
    const scores = saveScores(deriveScoresFromStorage(window.localStorage), window.localStorage);
    renderScores(scores);
    return scores;
  };

  const escapeOperationLogHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  const formatOperationLogDate = (timestamp) => {
    if (!timestamp) return "未記録";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return String(timestamp);
    return date.toLocaleString("ja-JP", { hour12: false });
  };

  const getOperationLogFilters = () => {
    if (!logFiltersForm) return {};
    const values = Object.fromEntries(new FormData(logFiltersForm).entries());
    return {
      date: values.date || "",
      racecourse: values.racecourse || "",
      operationType: values.operationType || "",
      status: values.status || "",
    };
  };

  const renderOperationLogs = () => {
    if (!logEngine || !logTableBody) return [];
    const filters = getOperationLogFilters();
    const logs = logEngine.filterOperationLogs(logEngine.readOperationLogs(window.localStorage), filters);
    if (logCount) logCount.textContent = `${logs.length}件表示`;
    logTableBody.innerHTML = logs.length ? logs.map((log) => `
      <tr>
        <td data-label="日時">${escapeOperationLogHtml(formatOperationLogDate(log.timestamp))}</td>
        <td data-label="操作種別"><span class="badge badge--gold">${escapeOperationLogHtml(log.operationType)}</span></td>
        <td data-label="競馬場">${escapeOperationLogHtml(log.racecourse || "-")}</td>
        <td data-label="レース番号">${escapeOperationLogHtml(log.raceNumber ? `${log.raceNumber}R` : "-")}</td>
        <td data-label="概要">${escapeOperationLogHtml(log.summary || log.raceName || "-")}</td>
        <td data-label="状態"><span class="badge">${escapeOperationLogHtml(log.status || "完了")}</span></td>
      </tr>
    `).join("") : '<tr><td data-label="日時" colspan="6">条件に一致する本番運用オペレーションログはありません。</td></tr>';
    return logs;
  };


  const getRaceDatabaseFilters = () => {
    if (!raceDatabaseForm) return {};
    const values = Object.fromEntries(new FormData(raceDatabaseForm).entries());
    return {
      course: values.course || "",
      distance: values.distance || "",
      surface: values.surface || "",
      going: values.going || "",
      godRace: values.godRace || "",
      roiSign: values.roiSign || "",
      hitStatus: values.hitStatus || "",
      from: values.from || "",
      to: values.to || "",
    };
  };

  const summarizeTop3 = (items = [], scoreKey = "aiIndex") => asArray(items).slice(0, 3)
    .map((horse) => `${horse.number || "?"}.${horse.name || "未設定"}(${horse[scoreKey] ?? "-"})`)
    .join(" / ") || "-";

  const summarizeTrifectaCandidates = (tickets = []) => asArray(tickets).slice(0, 3)
    .map(ticketText)
    .filter(Boolean)
    .join(" / ") || "-";

  const summarizeWin5Candidates = (items = []) => asArray(items).slice(0, 3)
    .map((horse) => `${horse.number || "?"}.${horse.name || "未設定"}${horse.zone ? `(${horse.zone})` : ""}`)
    .join(" / ") || "-";

  const summarizeEvTop = (items = []) => asArray(items).slice(0, 3)
    .map((item) => `${item.number || "?"}.${item.name || item.label || "EV"}(${item.ev ?? item.expectedValue ?? "-"})`)
    .join(" / ") || "-";

  const renderRaceDatabaseSummary = (summary) => {
    if (raceDatabaseSummary) {
      const values = [
        `${summary.raceCount}件`,
        `${summary.hitCount}件`,
        `${summary.hitRate}%`,
        `${summary.totalInvestment.toLocaleString("ja-JP")}円`,
        `${summary.totalPayout.toLocaleString("ja-JP")}円`,
        `${summary.totalRoi}%`,
      ];
      raceDatabaseSummary.querySelectorAll("strong").forEach((node, index) => { node.textContent = values[index] || "-"; });
    }
    const renderGroup = (target, groups) => {
      if (!target) return;
      target.innerHTML = groups.length ? groups.slice(0, 6).map((group) => `<li><strong>${escapeOperationLogHtml(group.label)} ROI ${escapeOperationLogHtml(group.roi)}%</strong><small>${escapeOperationLogHtml(group.races)}件 / 投資${escapeOperationLogHtml(group.investment.toLocaleString("ja-JP"))}円 / 払戻${escapeOperationLogHtml(group.payout.toLocaleString("ja-JP"))}円</small></li>`).join("") : "<li>未集計</li>";
    };
    renderGroup(raceDatabaseCourseRoi, summary.roiByCourse || []);
    renderGroup(raceDatabaseDistanceRoi, summary.roiByDistance || []);
  };

  const renderRaceDatabase = () => {
    if (!raceDatabaseBody) return [];
    const engine = window.HashimotoProductionRaceEngine;
    const records = engine?.searchRaceDatabase ? engine.searchRaceDatabase(getRaceDatabaseFilters(), window.localStorage) : [];
    const summary = engine?.summarizeRaceDatabase ? engine.summarizeRaceDatabase(records) : { raceCount: records.length, hitCount: 0, hitRate: 0, totalInvestment: 0, totalPayout: 0, totalRoi: 0, roiByCourse: [], roiByDistance: [] };
    renderRaceDatabaseSummary(summary);
    if (raceDatabaseCount) raceDatabaseCount.textContent = `${records.length}件表示`;
    raceDatabaseBody.innerHTML = records.length ? records.map((record) => {
      const resultText = [record.result?.firstNumber, record.result?.secondNumber, record.result?.thirdNumber].filter(Boolean).join("-") || "未入力";
      const trifectaPayoutText = record.trifectaPayout === null || record.trifectaPayout === undefined ? "-" : toNumber(record.trifectaPayout, 0).toLocaleString("ja-JP");
      return `
      <tr>
        <td data-label="開催日">${escapeOperationLogHtml(record.date || record.race?.date || "-")}</td>
        <td data-label="競馬場">${escapeOperationLogHtml(record.course || record.race?.course || "-")}</td>
        <td data-label="R">${escapeOperationLogHtml(record.raceNumber || record.race?.raceNumber || "-")}R</td>
        <td data-label="レース名">${escapeOperationLogHtml(record.raceName || record.race?.raceName || "-")}</td>
        <td data-label="距離/芝ダ/馬場">${escapeOperationLogHtml(record.distance || record.race?.distance || "-")}m / ${escapeOperationLogHtml(record.surface || record.race?.surface || "-")} / ${escapeOperationLogHtml(record.going || record.race?.going || "-")}</td>
        <td data-label="頭数">${escapeOperationLogHtml(record.fieldSize || record.summary?.runnerCount || "-")}頭</td>
        <td data-label="AI指数TOP3">${escapeOperationLogHtml(summarizeTop3(record.aiIndexTop3, "aiIndex"))}</td>
        <td data-label="神穴TOP3">${escapeOperationLogHtml(summarizeTop3(record.kamianaTop3, "kamianaIndex"))}</td>
        <td data-label="危険人気馬TOP3">${escapeOperationLogHtml(summarizeTop3(record.dangerPopularTop3, "dangerIndex"))}</td>
        <td data-label="三連単/WIN5/EV"><strong>三連単</strong> ${escapeOperationLogHtml(summarizeTrifectaCandidates(record.trifectaCandidates))}<br><strong>WIN5</strong> ${escapeOperationLogHtml(summarizeWin5Candidates(record.win5Candidates))}<br><strong>EV</strong> ${escapeOperationLogHtml(summarizeEvTop(record.evTop))}</td>
        <td data-label="結果/配当">${escapeOperationLogHtml(resultText)}<br>三連単配当 ${escapeOperationLogHtml(trifectaPayoutText)}円</td>
        <td data-label="投資/払戻/ROI">投資 ${escapeOperationLogHtml(toNumber(record.investmentAmount, 0).toLocaleString("ja-JP"))}円<br>払戻 ${escapeOperationLogHtml(toNumber(record.payoutAmount, 0).toLocaleString("ja-JP"))}円<br>ROI ${escapeOperationLogHtml(record.roi ?? "-")}${record.roi === null || record.roi === undefined ? "" : "%"}<br>推奨 ${escapeOperationLogHtml(toNumber(record.recommendedInvestmentAmount, 0).toLocaleString("ja-JP"))}円</td>
        <td data-label="神レース/メモ"><span class="badge badge--gold">${escapeOperationLogHtml(record.godRaceJudgement?.label || "未判定")}</span><br>${escapeOperationLogHtml(record.verificationMemo || "メモなし")}</td>
      </tr>`;
    }).join("") : '<tr><td data-label="開催日" colspan="13">条件に一致する実戦レースデータはありません。</td></tr>';
    return records;
  };

  const downloadRaceDatabase = () => {
    const engine = window.HashimotoProductionRaceEngine;
    if (!engine?.exportRaceDatabaseJson) return;
    const filters = getRaceDatabaseFilters();
    const records = engine.searchRaceDatabase(filters, window.localStorage);
    const blob = new Blob([engine.exportRaceDatabaseJson(records, filters)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = `raceDatabase-${new Date().toISOString().slice(0, 10)}.json`;
    documentRef.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (raceDatabaseStatus) raceDatabaseStatus.textContent = `raceDatabase ${records.length}件をJSONエクスポートしました`;
  };

  const importProductionRunReportsToRaceDatabase = () => {
    const engine = window.HashimotoProductionRaceEngine;
    if (!engine?.saveProductionRunReportsToRaceDatabase) return;
    const reports = engine.loadProductionRunReports(window.localStorage);
    const saved = engine.saveProductionRunReportsToRaceDatabase(reports, window.localStorage);
    renderRaceDatabase();
    if (raceDatabaseStatus) raceDatabaseStatus.textContent = `productionRunReports ${saved.length}件をraceDatabaseへ保存しました`;
  };

  const addOperationLog = (input) => {
    if (!logEngine) return null;
    const result = logEngine.appendOperationLog(input, window.localStorage);
    renderOperationLogs();
    return result.log;
  };

  const downloadOperationLogs = () => {
    if (!logEngine) return;
    const filters = getOperationLogFilters();
    const logs = logEngine.filterOperationLogs(logEngine.readOperationLogs(window.localStorage), filters);
    const blob = new Blob([logEngine.exportLogsJson(logs, filters)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = `production-operation-logs-${new Date().toISOString().slice(0, 10)}.json`;
    documentRef.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (status) status.textContent = `オペレーションログ${logs.length}件をJSON出力`;
  };

  const renderPayload = (payload = currentPayload) => {
    if (!payload) {
      setFlow([]);
      return;
    }
    currentPayload = payload;
    renderList("#production-operation-ai-ranking", asArray(payload.aiIndexRanking).slice(0, 5), (horse) => `${horse.name} AI${horse.aiIndex}`);
    renderList("#production-operation-kamiana-ranking", asArray(payload.kamianaRanking).slice(0, 5), (horse) => `${horse.name} 神穴${horse.kamianaIndex}`);
    renderList("#production-operation-danger-ranking", asArray(payload.dangerPopularRanking).slice(0, 5), (horse) => `${horse.name} 危険${horse.dangerIndex}`);
    renderList("#production-operation-trifecta", flattenTickets(payload.trifecta?.tickets).slice(0, 6), (ticket) => `${ticketText(ticket)} ${ticket.type || "三連単"}`);
    renderList("#production-operation-win5", flattenWin5(payload.win5?.zones).slice(0, 6), (horse) => `${horse.name} ${horse.zone || "WIN5"}`);
    renderList("#production-operation-simulation", asArray(payload.raceSimulation?.rankings?.winRate).slice(0, 5), (horse) => `${horse.name} 勝率${horse.winRate}%`);
    renderList("#production-operation-ev", asArray(payload.ev?.evRanking).slice(0, 5), (item) => `${item.name} EV${item.ev}`);
    const capital = documentRef.querySelector("#production-operation-capital");
    if (capital) capital.textContent = `推奨投資 ${toNumber(payload.capital?.summary?.totalRecommended).toLocaleString()}円 / ${payload.capital?.summary?.totalTickets || 0}点`;
    const godRace = documentRef.querySelector("#production-operation-god-race");
    if (godRace) godRace.textContent = `${payload.godRace?.label || "未判定"} / ${payload.godRace?.score ?? 0}点`;
    setFlow(["input", "ai", "tickets", "investment"]);
    if (status) status.textContent = "AI実行・買い目生成完了";
  };

  if (raceForm?.elements?.horses) {
    raceForm.elements.date.value = new Date().toISOString().slice(0, 10);
    raceForm.elements.horses.value = JSON.stringify(DEFAULT_HORSES, null, 2);
  }

  const initialMode = saveMode(window.localStorage?.getItem?.(MODE_STORAGE_KEY) || "development", window.localStorage);
  modeInputs.forEach((input) => {
    input.checked = input.value === initialMode;
    input.addEventListener("change", () => {
      const mode = saveMode(input.value, window.localStorage);
      if (modeLabel) modeLabel.textContent = MODE_LABELS[mode];
      addOperationLog({
        operationType: "モード切替",
        summary: `${MODE_LABELS[mode]}へ切替`,
        status: "完了",
        memo: `productionOperationMode=${mode}`,
      });
      if (status) status.textContent = `${MODE_LABELS[mode]}へ切替保存済み`;
    });
  });
  if (modeLabel) modeLabel.textContent = MODE_LABELS[initialMode];

  raceForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(raceForm).entries());
    const horses = safeParse(values.horses, DEFAULT_HORSES);
    const race = { ...values, raceNumber: toNumber(values.raceNumber), distance: toNumber(values.distance), fieldSize: asArray(horses).length };
    const productionEngine = window.HashimotoProductionRaceEngine;
    if (!productionEngine?.buildAndSaveProductionRunReport) {
      if (status) status.textContent = "本番AIエンジン未読込";
      return;
    }
    const report = productionEngine.buildAndSaveProductionRunReport({ race, horses, simulationCount: 1000, persistEngines: true }, window.localStorage);
    currentPayload = report.productionPayload;
    const logRace = currentPayload?.race || race;
    addOperationLog({ operationType: "本番レース入力", race: logRace, summary: `${logRace.course || "競馬場未設定"}${logRace.raceNumber || ""}R ${logRace.raceName || ""}を保存`, status: "完了", memo: `出走馬${asArray(horses).length}頭` });
    addOperationLog({ operationType: "AI一括実行", race: logRace, summary: `AI指数・神穴・危険人気馬を一括計算`, status: "完了", memo: `AI指数TOP=${currentPayload.aiIndexRanking?.[0]?.name || "未算出"}` });
    addOperationLog({ operationType: "買い目生成", race: logRace, summary: `三連単${flattenTickets(currentPayload.trifecta?.tickets).length}点 / WIN5${flattenWin5(currentPayload.win5?.zones).length}候補`, status: "完了", memo: `本線=${ticketText(flattenTickets(currentPayload.trifecta?.tickets)[0] || {}) || "未生成"}` });
    addOperationLog({ operationType: "資金配分計算", race: logRace, summary: `推奨投資${toNumber(currentPayload.capital?.summary?.totalRecommended).toLocaleString()}円`, status: "完了", memo: `${currentPayload.capital?.summary?.totalTickets || 0}点に配分` });
    addOperationLog({ operationType: "神レース判定", race: logRace, summary: `${currentPayload.godRace?.label || "未判定"} / ${currentPayload.godRace?.score ?? 0}点`, status: "完了", memo: currentPayload.godRace?.reason || "本番AI一括実行から自動判定" });
    renderPayload(currentPayload);
    renderRaceDatabase();
    refreshScores();
  });

  resultForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentPayload) renderPayload(latestPayload());
    if (!currentPayload) {
      if (status) status.textContent = "先にAI実行してください";
      return;
    }
    const result = Object.fromEntries(new FormData(resultForm).entries());
    const { report, evolutionLog, fundCurveRecords } = saveValidationAndEvolution({ payload: currentPayload, result, storage: window.localStorage });
    const resultNumbers = [result.firstNumber, result.secondNumber, result.thirdNumber].filter(Boolean).join("-");
    addOperationLog({ operationType: "結果入力", payload: currentPayload, summary: `確定着順 ${resultNumbers || "未入力"} / 投資${toNumber(result.investment).toLocaleString()}円`, status: "完了", memo: `払戻${toNumber(result.payout).toLocaleString()}円` });
    addOperationLog({ operationType: "結果検証", payload: currentPayload, summary: report.summary, status: report.roi >= 100 ? "完了" : "警告", memo: `ROI ${report.roi}% / 三連単的中=${report.trifectaHit ? "YES" : "NO"}` });
    addOperationLog({ operationType: "自己進化ログ保存", payload: currentPayload, summary: evolutionLog.improvement, status: evolutionLog.status || "完了", memo: evolutionLog.nextAction || "次回予想へ反映" });
    const validation = documentRef.querySelector("#production-operation-validation");
    if (validation) validation.textContent = report.summary;
    renderList("#production-operation-evolution", [evolutionLog], (item) => `${item.status}: ${item.improvement}`);
    const fundCurve = documentRef.querySelector("#production-operation-fund-curve");
    if (fundCurve) fundCurve.textContent = `最新ROI ${report.roi}% / 資金曲線 ${fundCurveRecords.length}件保存`;
    setFlow(["input", "ai", "tickets", "investment", "result", "validation", "evolution"]);
    refreshScores();
    renderRaceDatabase();
    if (status) status.textContent = "結果検証・自己進化ログ保存済み";
  });

  refreshScoreButton?.addEventListener("click", refreshScores);
  backupButton?.addEventListener("click", () => {
    const payload = createOperationBackup(window.localStorage);
    addOperationLog({
      operationType: "バックアップ実行",
      payload: currentPayload,
      summary: `${payload.keys.length}キーを本番運用バックアップへ保存`,
      status: "完了",
      memo: `productionOperationBackupLatest / ${payload.generatedAt || payload.createdAt || "時刻未記録"}`,
    });
    const backupStatus = documentRef.querySelector("#production-operation-backup-status");
    if (backupStatus) backupStatus.textContent = `${payload.keys.length}キーを${payload.generatedAt || payload.createdAt || new Date().toISOString()}に保存`;
    setFlow(["input", "ai", "tickets", "investment", "result", "validation", "evolution", "backup"]);
    if (status) status.textContent = "本番運用バックアップ保存済み";
  });

  logFiltersForm?.addEventListener("input", renderOperationLogs);
  logFiltersForm?.addEventListener("reset", () => setTimeout(renderOperationLogs, 0));
  logExportButton?.addEventListener("click", downloadOperationLogs);
  raceDatabaseForm?.addEventListener("input", renderRaceDatabase);
  raceDatabaseForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderRaceDatabase();
  });
  raceDatabaseReset?.addEventListener("click", () => setTimeout(renderRaceDatabase, 0));
  raceDatabaseExport?.addEventListener("click", downloadRaceDatabase);
  raceDatabaseImportRunReports?.addEventListener("click", importProductionRunReportsToRaceDatabase);

  renderPayload(currentPayload);
  refreshScores();
  renderOperationLogs();
  renderRaceDatabase();
})();
