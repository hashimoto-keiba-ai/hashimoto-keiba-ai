(() => {
  const SIMULATION_PRESETS = [100, 300, 1000];
  const DEFAULT_SIMULATION_COUNT = 1000;

  const toNumber = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const roundRate = (count, total) => Math.round((total ? (count / total) * 100 : 0) * 10) / 10;
  const normalizeText = (value) => String(value || "").trim();
  const normalizeCourse = (value) => normalizeText(value).replace(/競馬場/g, "");

  const COURSE_CORRECTION = {
    中山: { front: 1.08, closer: 0.96, inside: 1.05, outside: 0.97 },
    東京: { front: 0.98, closer: 1.08, inside: 1.01, outside: 1.03 },
    京都: { front: 1.03, closer: 1.03, inside: 1.03, outside: 1.0 },
    阪神: { front: 1.01, closer: 1.05, inside: 1.01, outside: 1.01 },
    中京: { front: 1.0, closer: 1.05, inside: 1.0, outside: 1.02 },
    新潟: { front: 0.97, closer: 1.08, inside: 0.99, outside: 1.04 },
    福島: { front: 1.08, closer: 0.97, inside: 1.05, outside: 0.96 },
    小倉: { front: 1.07, closer: 0.98, inside: 1.04, outside: 0.98 },
  };

  const styleGroups = {
    front: ["逃げ", "先行", "好位"],
    closer: ["差し", "追込", "中団"],
  };

  const distanceBand = (distance, surface = "") => {
    const value = toNumber(distance, 0);
    if (!value) return "middle";
    if (value <= 1400) return surface === "ダート" ? "dirtSprint" : "sprint";
    if (value <= 1800) return "mile";
    if (value <= 2200) return "middle";
    return "long";
  };

  const distanceCorrection = (horse = {}, raceContext = {}) => {
    const band = distanceBand(raceContext.distance ?? horse.distance ?? horse.raceDistance, raceContext.surface ?? horse.surface);
    const style = normalizeText(horse.runningStyle ?? horse.style ?? horse["脚質"]);
    const corner = toNumber(horse.cornerPosition ?? horse["4角位置"] ?? horse["想定4角位置"], horse.number || 9);
    const fieldSize = Math.max(1, toNumber(raceContext.fieldSize ?? horse.fieldSize, 18));
    const isForward = styleGroups.front.includes(style) || corner / fieldSize <= 0.35;
    const isCloser = styleGroups.closer.includes(style) || corner / fieldSize >= 0.65;
    if (band === "sprint" || band === "dirtSprint") return isForward ? 1.08 : isCloser ? 0.96 : 1.02;
    if (band === "long") return isCloser ? 1.06 : isForward ? 0.98 : 1.02;
    if (band === "mile") return isForward ? 1.03 : isCloser ? 1.04 : 1.02;
    return isCloser ? 1.04 : 1.0;
  };

  const courseCorrection = (horse = {}, raceContext = {}) => {
    const course = COURSE_CORRECTION[normalizeCourse(raceContext.course ?? horse.course ?? horse.raceCourse)] || null;
    if (!course) return 1;
    const style = normalizeText(horse.runningStyle ?? horse.style ?? horse["脚質"]);
    const number = toNumber(horse.number ?? horse["馬番"], 9);
    const fieldSize = Math.max(1, toNumber(raceContext.fieldSize ?? horse.fieldSize, 18));
    let correction = 1;
    if (styleGroups.front.includes(style)) correction *= course.front;
    if (styleGroups.closer.includes(style)) correction *= course.closer;
    if (number / fieldSize <= 0.33) correction *= course.inside;
    if (number / fieldSize >= 0.78) correction *= course.outside;
    return correction;
  };

  const oddsCorrection = (horse = {}) => {
    const odds = toNumber(horse.odds ?? horse["オッズ"], 99);
    if (odds <= 2.5) return 1.1;
    if (odds <= 5) return 1.07;
    if (odds <= 10) return 1.03;
    if (odds <= 30) return 0.98;
    return 0.92;
  };

  const popularityCorrection = (horse = {}) => {
    const popularity = toNumber(horse.popularity ?? horse["人気"], 18);
    if (popularity <= 1) return 1.08;
    if (popularity <= 3) return 1.05;
    if (popularity <= 6) return 1.01;
    if (popularity <= 10) return 0.97;
    return 0.93;
  };

  const styleVolatility = (horse = {}) => {
    const style = normalizeText(horse.runningStyle ?? horse.style ?? horse["脚質"]);
    if (style === "逃げ") return 11;
    if (style === "追込") return 13;
    if (style === "差し") return 10;
    if (style === "先行") return 7;
    return 8;
  };

  const createSeededRandom = (seed = Date.now()) => {
    let state = Math.abs(Math.floor(seed)) || 1;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  };

  const normalizeHorse = (horse = {}, index = 0) => ({
    ...horse,
    id: String(horse.id ?? horse.number ?? horse["馬番"] ?? index + 1),
    number: toNumber(horse.number ?? horse["馬番"], index + 1),
    name: normalizeText(horse.name ?? horse["馬名"]) || `出走馬${index + 1}`,
    aiIndex: toNumber(horse.aiIndex ?? horse["AI指数"], 50),
    kamianaIndex: toNumber(horse.kamianaIndex ?? horse["神穴指数"], 35),
    dangerIndex: toNumber(horse.dangerIndex ?? horse["危険人気馬指数"], 20),
    popularity: toNumber(horse.popularity ?? horse["人気"], index + 1),
    odds: toNumber(horse.odds ?? horse["オッズ"], 99),
    runningStyle: normalizeText(horse.runningStyle ?? horse.style ?? horse["脚質"]) || "未設定",
    cornerPosition: toNumber(horse.cornerPosition ?? horse["4角位置"] ?? horse["想定4角位置"], index + 1),
  });

  const calculateSimulationPower = (horse, raceContext = {}) => {
    const ai = toNumber(horse.aiIndex, 50);
    const kamiana = toNumber(horse.kamianaIndex, 35);
    const danger = toNumber(horse.dangerIndex, 20);
    const corner = toNumber(horse.cornerPosition, horse.number);
    const fieldSize = Math.max(1, toNumber(raceContext.fieldSize ?? horse.fieldSize, 18));
    const cornerBonus = clamp((fieldSize + 1 - corner) / fieldSize, 0, 1) * 7;
    const rawPower = (ai * 0.62) + (kamiana * 0.18) - (danger * 0.2) + cornerBonus + 28;
    return clamp(rawPower, 3, 115) * courseCorrection(horse, raceContext) * distanceCorrection(horse, raceContext) * oddsCorrection(horse) * popularityCorrection(horse);
  };

  const simulateRace = (horses = [], options = {}) => {
    const runners = horses.map(normalizeHorse);
    const random = typeof options.random === "function" ? options.random : Math.random;
    const scored = runners.map((horse) => {
      const power = calculateSimulationPower(horse, options.raceContext || options);
      const noise = (random() - 0.5) * styleVolatility(horse) + (random() - 0.5) * 8;
      const dangerSlip = random() * toNumber(horse.dangerIndex, 0) * 0.08;
      const kamianaUpside = random() * toNumber(horse.kamianaIndex, 0) * (toNumber(horse.popularity, 18) >= 6 ? 0.09 : 0.035);
      return { ...horse, simulationPower: Math.round(power * 10) / 10, raceScore: power + noise + kamianaUpside - dangerSlip };
    });
    return scored.sort((a, b) => b.raceScore - a.raceScore).map((horse, index) => ({ ...horse, finishPosition: index + 1 }));
  };

  const incrementHorseStats = (stats, horse, position) => {
    const row = stats.get(horse.id);
    if (!row) return;
    if (position === 1) row.firstCount += 1;
    if (position === 2) row.secondCount += 1;
    if (position === 3) row.thirdCount += 1;
    if (position <= 2) row.quinellaCount += 1;
    if (position <= 3) row.showCount += 1;
  };

  const buildRanking = (horseStats, simulationCount, field) => horseStats
    .map((item) => ({
      ...item,
      firstRate: roundRate(item.firstCount, simulationCount),
      secondRate: roundRate(item.secondCount, simulationCount),
      thirdRate: roundRate(item.thirdCount, simulationCount),
      placeRate: roundRate(item.showCount, simulationCount),
      quinellaRate: roundRate(item.quinellaCount, simulationCount),
      win5CandidateRate: roundRate(item.win5CandidateCount, simulationCount),
    }))
    .sort((a, b) => toNumber(b[field]) - toNumber(a[field]) || toNumber(a.popularity, 99) - toNumber(b.popularity, 99));

  const runMonteCarloSimulation = (horses = [], options = {}) => {
    const simulationCount = SIMULATION_PRESETS.includes(Number(options.simulationCount)) ? Number(options.simulationCount) : DEFAULT_SIMULATION_COUNT;
    const runners = horses.map(normalizeHorse);
    const random = options.seed === undefined ? Math.random : createSeededRandom(options.seed);
    const stats = new Map(runners.map((horse) => [horse.id, {
      ...horse,
      firstCount: 0,
      secondCount: 0,
      thirdCount: 0,
      showCount: 0,
      quinellaCount: 0,
      win5CandidateCount: 0,
    }]));
    const trifectaMap = new Map();

    for (let index = 0; index < simulationCount; index += 1) {
      const result = simulateRace(runners, { ...options, random });
      result.slice(0, 3).forEach((horse, positionIndex) => incrementHorseStats(stats, horse, positionIndex + 1));
      result.slice(0, Math.min(2, result.length)).forEach((horse) => {
        const row = stats.get(horse.id);
        if (row && toNumber(horse.dangerIndex) < 80) row.win5CandidateCount += 1;
      });
      const top3 = result.slice(0, 3);
      if (top3.length === 3) {
        const key = top3.map((horse) => horse.number).join("-");
        const existing = trifectaMap.get(key) || { key, notation: top3.map((horse) => `${horse.number} ${horse.name}`).join(" → "), count: 0, horses: top3.map(({ number, name }) => ({ number, name })) };
        existing.count += 1;
        trifectaMap.set(key, existing);
      }
    }

    const horseStats = Array.from(stats.values());
    const rankings = {
      winRate: buildRanking(horseStats, simulationCount, "firstRate"),
      placeRate: buildRanking(horseStats, simulationCount, "placeRate"),
      darkHorseExpectation: buildRanking(horseStats, simulationCount, "darkHorseExpectation"),
      dangerPopular: buildRanking(horseStats, simulationCount, "dangerIndex"),
      win5Candidate: buildRanking(horseStats, simulationCount, "win5CandidateRate"),
    };
    rankings.darkHorseExpectation = rankings.placeRate
      .map((horse) => ({ ...horse, darkHorseExpectation: Math.round((horse.placeRate * 0.55 + toNumber(horse.kamianaIndex) * 0.28 + Math.max(0, toNumber(horse.odds) - 8) * 0.45 - Math.max(0, 6 - toNumber(horse.popularity)) * 2) * 10) / 10 }))
      .sort((a, b) => b.darkHorseExpectation - a.darkHorseExpectation);

    const trifectaRates = Array.from(trifectaMap.values())
      .map((item) => ({ ...item, rate: roundRate(item.count, simulationCount) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    return {
      storageVersion: 1,
      generatedAt: new Date().toISOString(),
      simulationCount,
      race: options.raceContext || {},
      horseStats: rankings.winRate,
      trifectaRates,
      rankings,
      presets: SIMULATION_PRESETS,
      summary: {
        runnerCount: runners.length,
        totalTrifectaPatterns: trifectaMap.size,
        topWin: rankings.winRate[0] || null,
        topPlace: rankings.placeRate[0] || null,
        topDarkHorse: rankings.darkHorseExpectation[0] || null,
        topDangerPopular: rankings.dangerPopular.find((horse) => toNumber(horse.popularity, 99) <= 5) || rankings.dangerPopular[0] || null,
      },
    };
  };

  window.HashimotoRaceSimulator = {
    SIMULATION_PRESETS,
    DEFAULT_SIMULATION_COUNT,
    simulateRace,
    runMonteCarloSimulation,
    calculateSimulationPower,
  };
})();
