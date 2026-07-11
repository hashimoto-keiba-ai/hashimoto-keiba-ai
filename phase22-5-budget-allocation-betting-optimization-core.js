(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase225BudgetAllocationCore = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RACE_INPUT_STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const PREDICTION_EVALUATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.predictionEvaluation.v1";
  const FINAL_SUMMARY_STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPredictionSummary.v1";
  const TICKET_STORAGE_KEY = "hashimotoKeibaAi.phase22.bettingTicketGeneration.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.budgetAllocationOptimization.v1";
  const PHASE22_4_BACKUP_STORAGE_KEY = "hashimotoKeibaAi.phase22.bettingTicketGeneration.backupBeforeOptimization.v1";
  const PROTECTED_CLEANUP_KEYS = [RACE_INPUT_STORAGE_KEY, PREDICTION_EVALUATION_STORAGE_KEY, FINAL_SUMMARY_STORAGE_KEY, TICKET_STORAGE_KEY, STORAGE_KEY, PHASE22_4_BACKUP_STORAGE_KEY];
  const TICKET_TYPES = ["win", "place", "quinella", "wide", "exacta", "trio", "trifecta"];
  const TICKET_LABELS = { win: "単勝", place: "複勝", quinella: "馬連", wide: "ワイド", exacta: "馬単", trio: "三連複", trifecta: "三連単" };
  const MODES = ["equal", "proportional", "topHeavy", "typeBudget", "fixedPlusProportional", "manual"];
  const MARK_SCORES = { "◎": 100, "○": 85, "▲": 70, "△": 55, "☆": 45, "注": 35, "消": 10, "無印": 20 };

  const cleanupApi = (() => {
    if (root && root.HashimotoPhase22LocalStorageCleanup) return root.HashimotoPhase22LocalStorageCleanup;
    if (typeof module === "object" && module.exports) return require("./phase22-local-storage-cleanup.js");
    return null;
  })();
  const phase224 = (() => {
    if (root && root.HashimotoPhase224BettingTicketGenerationCore) return root.HashimotoPhase224BettingTicketGenerationCore;
    if (typeof module === "object" && module.exports) return require("./phase22-4-betting-ticket-generation-core.js");
    return null;
  })();

  function getStorage(storage) {
    return storage || (root && root.localStorage) || null;
  }

  function text(value) {
    return String(value ?? "").trim();
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, number(value, min)));
  }

  function yen(value, fallback = 0) {
    const parsed = number(value, fallback);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(1000000, Math.max(0, Math.floor(parsed / 100) * 100));
  }

  function safeParseJson(raw) {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function ticketKey(ticket) {
    return `${ticket.type}:${(ticket.horseNumbers || ticket.horses?.map((horse) => horse.horseNumber) || []).map(text).join("-")}`;
  }

  function defaultWeights() {
    return { aiScore: 35, mark: 20, category: 15, ticketType: 10, longshot: 10, dangerousPenalty: 10 };
  }

  function defaultMarkScores() {
    return { ...MARK_SCORES };
  }

  function defaultCategoryScores() {
    return { keyCandidate: 100, opponentCandidate: 75, holdCandidate: 55, longshot: 65, divineLongshot: 70, dangerousPenalty: 25, categoryCap: 100 };
  }

  function defaultTypePriorities() {
    return TICKET_TYPES.reduce((map, type) => ({ ...map, [type]: 70 }), {});
  }

  function defaultTypeBudgetShares() {
    return { win: 10, place: 10, quinella: 15, wide: 15, exacta: 15, trio: 20, trifecta: 15 };
  }

  function defaultConstraints() {
    return {
      budget: 3000,
      minStake: 100,
      maxStakePerTicket: 1000,
      maxTicketCount: 30,
      minPriorityScore: 0,
      dangerousMaxStake: 300,
      longshotMinStake: 100,
      divineLongshotMinStake: 100,
      trifectaMaxBudgetRatio: 40,
      redistributeUnusedTypeBudget: true,
      topCount: 5,
      topShare: 70,
      restShare: 30,
      fixedStake: 100,
      typeMaxRatios: TICKET_TYPES.reduce((map, type) => ({ ...map, [type]: 100 }), {})
    };
  }

  function defaultSettings() {
    return {
      mode: "proportional",
      targetTypes: TICKET_TYPES.reduce((map, type) => ({ ...map, [type]: true }), {}),
      includeManualTickets: true,
      weights: defaultWeights(),
      markScores: defaultMarkScores(),
      categoryScores: defaultCategoryScores(),
      typePriorities: defaultTypePriorities(),
      typeBudgetShares: defaultTypeBudgetShares(),
      constraints: defaultConstraints()
    };
  }

  function normalizeWeights(input = {}) {
    const source = { ...defaultWeights(), ...input };
    const clean = {};
    Object.keys(defaultWeights()).forEach((key) => {
      clean[key] = clamp(source[key], 0, 1000);
    });
    const sum = Object.values(clean).reduce((total, value) => total + value, 0) || 1;
    return Object.fromEntries(Object.entries(clean).map(([key, value]) => [key, value / sum]));
  }

  function normalizeRawWeights(input = {}) {
    const source = { ...defaultWeights(), ...input };
    return Object.fromEntries(Object.keys(defaultWeights()).map((key) => [key, clamp(source[key], 0, 1000)]));
  }

  function normalizeScoreMap(defaultMap, input = {}, min = 0, max = 200) {
    const source = { ...defaultMap, ...input };
    return Object.fromEntries(Object.keys(defaultMap).map((key) => [key, clamp(source[key], min, max)]));
  }

  function normalizeConstraints(input = {}) {
    const base = defaultConstraints();
    const typeMaxRatios = { ...base.typeMaxRatios, ...(input.typeMaxRatios || {}) };
    TICKET_TYPES.forEach((type) => {
      typeMaxRatios[type] = clamp(typeMaxRatios[type], 0, 100);
    });
    return {
      budget: yen(input.budget, base.budget) || base.budget,
      minStake: yen(input.minStake, base.minStake) || base.minStake,
      maxStakePerTicket: yen(input.maxStakePerTicket, base.maxStakePerTicket) || base.maxStakePerTicket,
      maxTicketCount: Math.floor(clamp(input.maxTicketCount, 1, 999)),
      minPriorityScore: clamp(input.minPriorityScore, 0, 100),
      dangerousMaxStake: yen(input.dangerousMaxStake, base.dangerousMaxStake),
      longshotMinStake: yen(input.longshotMinStake, base.longshotMinStake),
      divineLongshotMinStake: yen(input.divineLongshotMinStake, base.divineLongshotMinStake),
      trifectaMaxBudgetRatio: clamp(input.trifectaMaxBudgetRatio, 0, 100),
      redistributeUnusedTypeBudget: input.redistributeUnusedTypeBudget !== false,
      topCount: Math.floor(clamp(input.topCount, 1, 999)),
      topShare: clamp(input.topShare, 0, 100),
      restShare: clamp(input.restShare, 0, 100),
      fixedStake: yen(input.fixedStake, base.fixedStake) || base.fixedStake,
      typeMaxRatios
    };
  }

  function normalizeSettings(input = {}) {
    const base = defaultSettings();
    const targetTypes = { ...base.targetTypes, ...(input.targetTypes || {}) };
    TICKET_TYPES.forEach((type) => {
      targetTypes[type] = targetTypes[type] !== false;
    });
    return {
      mode: MODES.includes(input.mode) ? input.mode : base.mode,
      targetTypes,
      includeManualTickets: input.includeManualTickets !== false,
      weights: normalizeRawWeights(input.weights),
      markScores: normalizeScoreMap(defaultMarkScores(), input.markScores),
      categoryScores: normalizeScoreMap(defaultCategoryScores(), input.categoryScores),
      typePriorities: normalizeScoreMap(defaultTypePriorities(), input.typePriorities),
      typeBudgetShares: normalizeScoreMap(defaultTypeBudgetShares(), input.typeBudgetShares, 0, 1000),
      constraints: normalizeConstraints(input.constraints || input)
    };
  }

  function normalizeTicket(ticket = {}, index = 0) {
    const type = TICKET_TYPES.includes(ticket.type) ? ticket.type : "win";
    const horses = Array.isArray(ticket.horses) ? ticket.horses : [];
    return {
      id: text(ticket.id) || `${type}-${index + 1}`,
      originalIndex: index,
      type,
      typeLabel: TICKET_LABELS[type],
      combination: text(ticket.combination) || (ticket.horseNumbers || horses.map((horse) => horse.horseNumber)).map(text).join("-"),
      horseNumbers: Array.isArray(ticket.horseNumbers) ? ticket.horseNumbers.map(text) : horses.map((horse) => text(horse.horseNumber)),
      horses: horses.map((horse) => ({
        horseNumber: text(horse.horseNumber),
        horseName: text(horse.horseName),
        mark: text(horse.mark) || "無印",
        aiScore: text(horse.aiScore),
        dangerousPopular: Boolean(horse.dangerousPopular),
        longshot: Boolean(horse.longshot)
      })),
      reason: text(ticket.reason),
      warnings: Array.isArray(ticket.warnings) ? ticket.warnings.map(text).filter(Boolean) : [],
      stake: yen(ticket.stake, 100) || 100,
      selected: ticket.selected !== false,
      manual: Boolean(ticket.manual)
    };
  }

  function loadPhase224Payload(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return null;
    const parsed = safeParseJson(targetStorage.getItem(TICKET_STORAGE_KEY));
    if (!parsed) return null;
    const settings = parsed.settings || {};
    return {
      schemaVersion: Number(parsed.schemaVersion) || 1,
      savedAt: parsed.savedAt || "",
      sourceRaceKey: text(parsed.sourceRaceKey),
      settings,
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets.map(normalizeTicket) : []
    };
  }

  function markStats(ticket, settings) {
    const scores = ticket.horses.map((horse) => settings.markScores[horse.mark] ?? settings.markScores["無印"] ?? 20);
    if (!scores.length) return { average: 20, max: 20, min: 20 };
    return {
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      max: Math.max(...scores),
      min: Math.min(...scores)
    };
  }

  function aiScore(ticket) {
    const scores = ticket.horses.map((horse) => number(horse.aiScore, NaN)).filter(Number.isFinite);
    return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  function categoryScore(ticket, settings) {
    const scores = ticket.horses.map((horse) => {
      let score = 0;
      if (horse.mark === "◎") score += settings.categoryScores.keyCandidate;
      else if (horse.mark === "○" || horse.mark === "▲") score += settings.categoryScores.opponentCandidate;
      else if (["△", "☆", "注"].includes(horse.mark)) score += settings.categoryScores.holdCandidate;
      if (horse.longshot) score += settings.categoryScores.longshot;
      if (horse.longshot && (horse.mark === "☆" || number(horse.aiScore, 0) >= 80)) score += settings.categoryScores.divineLongshot;
      return Math.min(settings.categoryScores.categoryCap, score);
    });
    return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  function longshotScore(ticket, settings) {
    if (!ticket.horses.length) return 0;
    const hasLongshot = ticket.horses.some((horse) => horse.longshot);
    const hasDivine = ticket.horses.some((horse) => horse.longshot && (horse.mark === "☆" || number(horse.aiScore, 0) >= 80));
    if (hasDivine) return settings.categoryScores.divineLongshot;
    return hasLongshot ? settings.categoryScores.longshot : 0;
  }

  function hasDanger(ticket) {
    return ticket.horses.some((horse) => horse.dangerousPopular) || ticket.warnings.some((warning) => warning.includes("危険人気馬"));
  }

  function scoreTicket(ticket, inputSettings = defaultSettings(), manualAdjustment = 0) {
    const settings = normalizeSettings(inputSettings);
    const weights = normalizeWeights(settings.weights);
    const marks = markStats(ticket, settings);
    const dangerPenalty = hasDanger(ticket) ? settings.categoryScores.dangerousPenalty : 0;
    const components = {
      aiScore: aiScore(ticket),
      markAverage: marks.average,
      markMax: marks.max,
      markMin: marks.min,
      category: categoryScore(ticket, settings),
      ticketType: settings.typePriorities[ticket.type] || 0,
      longshot: longshotScore(ticket, settings),
      dangerousPenalty: dangerPenalty,
      manualAdjustment: clamp(manualAdjustment, -100, 100)
    };
    const score = clamp(
      components.aiScore * weights.aiScore
      + components.markAverage * weights.mark
      + components.category * weights.category
      + components.ticketType * weights.ticketType
      + components.longshot * weights.longshot
      - components.dangerousPenalty * weights.dangerousPenalty
      + components.manualAdjustment,
      0,
      100
    );
    return { score, components };
  }

  function eligibleTickets(tickets, settings, manualAdjustments = {}) {
    const normalizedSettings = normalizeSettings(settings);
    return tickets
      .map((ticket, index) => {
        const normalized = normalizeTicket(ticket, index);
        const manualAdjustment = number(manualAdjustments[normalized.id] ?? ticket.manualAdjustment, 0);
        const scored = scoreTicket(normalized, normalizedSettings, manualAdjustment);
        return { ...normalized, priorityScore: scored.score, scoreComponents: scored.components, manualAdjustment };
      })
      .filter((ticket) => ticket.selected !== false)
      .filter((ticket) => normalizedSettings.targetTypes[ticket.type] !== false)
      .filter((ticket) => normalizedSettings.includeManualTickets || !ticket.manual)
      .filter((ticket) => ticket.priorityScore >= normalizedSettings.constraints.minPriorityScore)
      .sort((a, b) => b.priorityScore - a.priorityScore || a.originalIndex - b.originalIndex)
      .slice(0, normalizedSettings.constraints.maxTicketCount);
  }

  function roundDown100(value) {
    return Math.max(0, Math.floor(number(value, 0) / 100) * 100);
  }

  function capStake(ticket, amount, settings) {
    let capped = Math.min(roundDown100(amount), settings.constraints.maxStakePerTicket);
    if (hasDanger(ticket) && settings.constraints.dangerousMaxStake > 0) capped = Math.min(capped, settings.constraints.dangerousMaxStake);
    return Math.max(0, capped);
  }

  function distributeRemainder(results, budget, settings) {
    let used = results.reduce((sum, item) => sum + item.recommendedStake, 0);
    let remainder = budget - used;
    const ordered = [...results].sort((a, b) => b.priorityScore - a.priorityScore);
    while (remainder >= 100) {
      const target = ordered.find((item) => item.adopted && capStake(item, item.recommendedStake + 100, settings) > item.recommendedStake);
      if (!target) break;
      target.recommendedStake += 100;
      remainder -= 100;
    }
    return results;
  }

  function enforceConstraints(results, settings) {
    const warnings = [];
    const byTypeLimit = {};
    TICKET_TYPES.forEach((type) => {
      byTypeLimit[type] = roundDown100(settings.constraints.budget * (settings.constraints.typeMaxRatios[type] || 100) / 100);
    });
    const trifectaLimit = roundDown100(settings.constraints.budget * settings.constraints.trifectaMaxBudgetRatio / 100);
    TICKET_TYPES.forEach((type) => {
      let used = 0;
      results.filter((item) => item.type === type && item.adopted).sort((a, b) => b.priorityScore - a.priorityScore).forEach((item) => {
        const limit = type === "trifecta" ? Math.min(byTypeLimit[type], trifectaLimit) : byTypeLimit[type];
        if (used + item.recommendedStake > limit) {
          item.constraintWarnings.push(`${item.typeLabel}の券種別上限を超えるため減額`);
          item.recommendedStake = Math.max(0, limit - used);
        }
        item.recommendedStake = roundDown100(item.recommendedStake);
        used += item.recommendedStake;
      });
      if (type === "trifecta" && used >= trifectaLimit && trifectaLimit < settings.constraints.budget) warnings.push("三連単の最大予算比率により配分を制限しました。");
    });
    results.forEach((item) => {
      if (item.recommendedStake > 0 && item.recommendedStake < settings.constraints.minStake) {
        item.constraintWarnings.push("最低購入額未満のため除外");
        item.recommendedStake = 0;
      }
      if (item.horses.some((horse) => horse.longshot) && item.recommendedStake > 0 && item.recommendedStake < settings.constraints.longshotMinStake) {
        item.recommendedStake = Math.min(settings.constraints.longshotMinStake, settings.constraints.maxStakePerTicket);
        item.constraintWarnings.push("穴馬最低配分額を適用");
      }
      if (item.horses.some((horse) => horse.longshot && (horse.mark === "☆" || number(horse.aiScore, 0) >= 80)) && item.recommendedStake > 0 && item.recommendedStake < settings.constraints.divineLongshotMinStake) {
        item.recommendedStake = Math.min(settings.constraints.divineLongshotMinStake, settings.constraints.maxStakePerTicket);
        item.constraintWarnings.push("神穴候補最低配分額を適用");
      }
      item.adopted = item.recommendedStake > 0;
      item.diff = item.recommendedStake - item.originalStake;
    });
    let total = results.reduce((sum, item) => sum + item.recommendedStake, 0);
    if (total > settings.constraints.budget) {
      warnings.push("制約競合により予算超過したため低優先度から減額しました。");
      [...results].sort((a, b) => a.priorityScore - b.priorityScore).forEach((item) => {
        while (total > settings.constraints.budget && item.recommendedStake > 0) {
          item.recommendedStake -= 100;
          total -= 100;
          item.constraintWarnings.push("総予算超過防止のため減額");
        }
        item.adopted = item.recommendedStake > 0;
        item.diff = item.recommendedStake - item.originalStake;
      });
    }
    return { results, warnings };
  }

  function makeBaseResults(tickets, settings, manualAdjustments = {}) {
    return eligibleTickets(tickets, settings, manualAdjustments).map((ticket, index) => ({
      ...ticket,
      rank: index + 1,
      originalStake: yen(ticket.stake, 100) || 100,
      recommendedStake: 0,
      diff: 0,
      adopted: true,
      allocationReason: "",
      constraintWarnings: []
    }));
  }

  function allocateEqual(results, settings) {
    const amount = roundDown100(settings.constraints.budget / Math.max(1, results.length));
    results.forEach((item) => {
      item.recommendedStake = capStake(item, amount, settings);
      item.allocationReason = "均等配分";
    });
    return distributeRemainder(results, settings.constraints.budget, settings);
  }

  function allocateProportional(results, settings, poolBudget = settings.constraints.budget, base = 0) {
    const scoreSum = results.reduce((sum, item) => sum + Math.max(1, item.priorityScore), 0) || 1;
    results.forEach((item) => {
      item.recommendedStake = capStake(item, base + poolBudget * Math.max(1, item.priorityScore) / scoreSum, settings);
      item.allocationReason = base ? "固定額＋残額比例配分" : "優先度比例配分";
    });
    return distributeRemainder(results, settings.constraints.budget, settings);
  }

  function allocateTopHeavy(results, settings) {
    const topCount = Math.min(settings.constraints.topCount, results.length);
    const topBudget = roundDown100(settings.constraints.budget * settings.constraints.topShare / 100);
    const restBudget = settings.constraints.budget - topBudget;
    allocateProportional(results.slice(0, topCount), settings, topBudget, 0);
    allocateProportional(results.slice(topCount), settings, restBudget, 0);
    results.forEach((item, index) => {
      item.allocationReason = index < topCount ? "上位集中配分" : "上位集中配分の残額配分";
    });
    return distributeRemainder(results, settings.constraints.budget, settings);
  }

  function allocateTypeBudget(results, settings) {
    const shareSum = Object.values(settings.typeBudgetShares).reduce((sum, value) => sum + Math.max(0, value), 0) || 1;
    TICKET_TYPES.forEach((type) => {
      const rows = results.filter((item) => item.type === type);
      if (!rows.length) return;
      const typeBudget = roundDown100(settings.constraints.budget * Math.max(0, settings.typeBudgetShares[type]) / shareSum);
      allocateProportional(rows, settings, typeBudget, 0);
      rows.forEach((item) => {
        item.allocationReason = "券種別予算配分";
      });
    });
    if (settings.constraints.redistributeUnusedTypeBudget) distributeRemainder(results, settings.constraints.budget, settings);
    return results;
  }

  function allocateFixedPlus(results, settings) {
    const fixed = Math.min(settings.constraints.fixedStake, settings.constraints.maxStakePerTicket);
    results.forEach((item) => {
      item.recommendedStake = capStake(item, fixed, settings);
    });
    const used = results.reduce((sum, item) => sum + item.recommendedStake, 0);
    const remaining = Math.max(0, settings.constraints.budget - used);
    return allocateProportional(results, settings, remaining, fixed);
  }

  function optimizeTickets(tickets, inputSettings = defaultSettings(), manualAdjustments = {}, manualStakes = {}) {
    const settings = normalizeSettings(inputSettings);
    let results = makeBaseResults(tickets, settings, manualAdjustments);
    const warnings = [];
    if (!results.length) return { results: [], summary: buildSummary([], settings, ["配分対象の買い目がありません。"]), settings, warnings: ["配分対象の買い目がありません。"] };
    if (settings.mode === "equal") results = allocateEqual(results, settings);
    else if (settings.mode === "topHeavy") results = allocateTopHeavy(results, settings);
    else if (settings.mode === "typeBudget") results = allocateTypeBudget(results, settings);
    else if (settings.mode === "fixedPlusProportional") results = allocateFixedPlus(results, settings);
    else if (settings.mode === "manual") {
      results.forEach((item) => {
        item.recommendedStake = capStake(item, manualStakes[item.id] ?? item.originalStake, settings);
        item.allocationReason = "手動調整モード";
      });
    } else results = allocateProportional(results, settings);
    Object.entries(manualStakes || {}).forEach(([id, stake]) => {
      const item = results.find((row) => row.id === id);
      if (item) {
        item.recommendedStake = capStake(item, stake, settings);
        item.manualChanged = true;
        item.allocationReason = `${item.allocationReason} / 手動金額変更`;
      }
    });
    const constrained = enforceConstraints(results, settings);
    warnings.push(...constrained.warnings);
    return { results: constrained.results.map((item, index) => ({ ...item, rank: index + 1 })), summary: buildSummary(constrained.results, settings, warnings), settings, warnings };
  }

  function buildSummary(results, settings, warnings = []) {
    const adopted = results.filter((item) => item.adopted && item.recommendedStake > 0);
    const allocated = adopted.reduce((sum, item) => sum + item.recommendedStake, 0);
    const scores = results.map((item) => item.priorityScore).filter(Number.isFinite);
    const byType = {};
    TICKET_TYPES.forEach((type) => {
      const amount = adopted.filter((item) => item.type === type).reduce((sum, item) => sum + item.recommendedStake, 0);
      byType[type] = { type, typeLabel: TICKET_LABELS[type], amount, ratio: settings.constraints.budget ? amount / settings.constraints.budget * 100 : 0 };
    });
    return {
      targetPoints: results.length,
      adoptedPoints: adopted.length,
      excludedPoints: results.length - adopted.length,
      budget: settings.constraints.budget,
      allocatedAmount: allocated,
      unusedBudget: Math.max(0, settings.constraints.budget - allocated),
      overBudget: allocated > settings.constraints.budget,
      byType,
      averagePriority: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      maxPriority: scores.length ? Math.max(...scores) : 0,
      minPriority: scores.length ? Math.min(...scores) : 0,
      dangerousAmount: adopted.filter(hasDanger).reduce((sum, item) => sum + item.recommendedStake, 0),
      longshotAmount: adopted.filter((item) => item.horses.some((horse) => horse.longshot)).reduce((sum, item) => sum + item.recommendedStake, 0),
      warnings
    };
  }

  function applyManualStake(results, id, stake) {
    return results.map((item) => item.id === id ? { ...item, recommendedStake: yen(stake, item.recommendedStake), manualChanged: true, diff: yen(stake, item.recommendedStake) - item.originalStake } : item);
  }

  function toggleAdoption(results, id, adopted) {
    return results.map((item) => item.id === id ? { ...item, adopted: Boolean(adopted), recommendedStake: adopted ? Math.max(100, item.recommendedStake || item.originalStake) : 0, manualChanged: true } : item);
  }

  function resetManualAdjustments(results) {
    return results.map((item) => ({ ...item, manualChanged: false, manualAdjustment: 0 }));
  }

  function normalizePayload(input = {}) {
    const settings = normalizeSettings(input.settings || {});
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: input.savedAt || new Date().toISOString(),
      sourceRaceKey: text(input.sourceRaceKey),
      phase224SavedAt: text(input.phase224SavedAt),
      settings,
      results: Array.isArray(input.results) ? input.results.map((item, index) => ({ ...normalizeTicket(item, index), priorityScore: clamp(item.priorityScore, 0, 100), recommendedStake: yen(item.recommendedStake, 0), adopted: item.adopted !== false, manualAdjustment: number(item.manualAdjustment, 0), manualChanged: Boolean(item.manualChanged), allocationReason: text(item.allocationReason), constraintWarnings: Array.isArray(item.constraintWarnings) ? item.constraintWarnings.map(text).filter(Boolean) : [] })) : [],
      summary: input.summary || buildSummary([], settings)
    };
  }

  function loadSavedOptimization(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return null;
    const parsed = safeParseJson(targetStorage.getItem(STORAGE_KEY));
    return parsed ? normalizePayload(parsed) : null;
  }

  function saveOptimization(payload, storage) {
    const targetStorage = getStorage(storage);
    const data = normalizePayload(payload);
    if (data.summary && data.summary.overBudget) return { saved: false, overBudget: true, errors: ["総配分額が予算を超えているため保存しません。"], data };
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"], data };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { saved: true, data };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return { saved: false, quotaExceeded, storageError: true, errors: [quotaExceeded ? "localStorageの容量が不足しているため最適化結果を保存できませんでした。" : "localStorageへの保存に失敗しました。"], data };
    }
  }

  function deleteSavedOptimization(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function applyToPhase224(results, storage, confirmApply = () => false) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { applied: false, reason: "storage_unavailable" };
    const raw = targetStorage.getItem(TICKET_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (!parsed || !Array.isArray(parsed.tickets)) return { applied: false, reason: "phase22_4_missing" };
    if (!confirmApply()) return { applied: false, reason: "confirmation_required" };
    const byKey = new Map(results.map((result) => [ticketKey(result), result]));
    const updated = {
      ...parsed,
      savedAt: new Date().toISOString(),
      tickets: parsed.tickets.map((ticket, index) => {
        const normalized = normalizeTicket(ticket, index);
        const result = byKey.get(ticketKey(normalized));
        if (!result) return ticket;
        return { ...ticket, stake: result.recommendedStake, selected: Boolean(result.adopted) };
      })
    };
    try {
      targetStorage.setItem(PHASE22_4_BACKUP_STORAGE_KEY, raw || JSON.stringify(parsed));
      targetStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(updated));
      return { applied: true, backupKey: PHASE22_4_BACKUP_STORAGE_KEY, updated };
    } catch (error) {
      return { applied: false, reason: "storage_error", error };
    }
  }

  function summarizePhase21Cleanup(storage) {
    return cleanupApi.summarizePhase21Cleanup(getStorage(storage), PROTECTED_CLEANUP_KEYS);
  }

  function cleanupPhase21LocalData(storage, confirmCleanup = () => false) {
    return cleanupApi.cleanupPhase21LocalData(getStorage(storage), confirmCleanup, PROTECTED_CLEANUP_KEYS);
  }

  function sortResults(results, mode = "priority") {
    const rows = [...(results || [])];
    if (mode === "amount") return rows.sort((a, b) => b.recommendedStake - a.recommendedStake || a.rank - b.rank);
    if (mode === "type") return rows.sort((a, b) => TICKET_TYPES.indexOf(a.type) - TICKET_TYPES.indexOf(b.type) || a.rank - b.rank);
    if (mode === "original") return rows.sort((a, b) => a.originalIndex - b.originalIndex);
    return rows.sort((a, b) => b.priorityScore - a.priorityScore || a.rank - b.rank);
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function setMessage(doc, message, kind = "info") {
    const node = doc.querySelector("#phase22-budget-message");
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  }

  function renderSummary(doc, summary) {
    const node = doc.querySelector("#phase22-budget-summary");
    if (!node) return;
    node.textContent = `対象 ${summary.targetPoints}点 / 採用 ${summary.adoptedPoints}点 / 配分 ${summary.allocatedAmount.toLocaleString("ja-JP")}円 / 未使用 ${summary.unusedBudget.toLocaleString("ja-JP")}円${summary.overBudget ? " / 予算超過" : ""}`;
    node.dataset.kind = summary.overBudget ? "error" : "success";
  }

  function renderResults(doc, results, summary, sortMode = "priority") {
    const container = doc.querySelector("#phase22-budget-result-list");
    if (!container) return;
    container.textContent = "";
    sortResults(results, sortMode).forEach((item, index) => {
      const row = makeEl(doc, "article", `phase22-budget-row${item.manualChanged ? " manual" : ""}`, "");
      [
        String(index + 1),
        item.priorityScore.toFixed(1),
        item.typeLabel,
        item.combination,
        item.horses.map((horse) => `${horse.horseNumber} ${horse.horseName || "馬名未設定"} ${horse.mark || "無印"} ${horse.aiScore || "未評価"}`).join(" / "),
        item.horses.some((horse) => horse.longshot) ? "穴馬含む" : "通常",
        hasDanger(item) ? "危険人気馬あり" : "なし",
        `${item.originalStake.toLocaleString("ja-JP")}円`,
        `${item.recommendedStake.toLocaleString("ja-JP")}円`,
        `${item.diff.toLocaleString("ja-JP")}円`,
        item.allocationReason || "--",
        item.constraintWarnings.length ? item.constraintWarnings.join(" / ") : "なし",
        item.adopted ? "採用" : "除外"
      ].forEach((value) => row.appendChild(makeEl(doc, "span", "", value)));
      container.appendChild(row);
    });
    renderSummary(doc, summary);
  }

  function readBasicSettings(doc) {
    const read = (key) => {
      const node = doc.querySelector(`[data-phase22-budget-setting="${key}"]`);
      if (!node) return undefined;
      return node.type === "checkbox" ? node.checked : node.value;
    };
    const targetTypes = {};
    TICKET_TYPES.forEach((type) => targetTypes[type] = read(`target-${type}`) !== false);
    return normalizeSettings({
      mode: read("mode"),
      targetTypes,
      includeManualTickets: read("includeManualTickets"),
      weights: {
        aiScore: read("weightAi"),
        mark: read("weightMark"),
        category: read("weightCategory"),
        ticketType: read("weightType"),
        longshot: read("weightLongshot"),
        dangerousPenalty: read("weightDanger")
      },
      constraints: {
        budget: read("budget"),
        minStake: read("minStake"),
        maxStakePerTicket: read("maxStake"),
        maxTicketCount: read("maxTicketCount"),
        minPriorityScore: read("minPriorityScore"),
        dangerousMaxStake: read("dangerousMaxStake"),
        longshotMinStake: read("longshotMinStake"),
        divineLongshotMinStake: read("divineLongshotMinStake"),
        trifectaMaxBudgetRatio: read("trifectaMaxBudgetRatio"),
        topCount: read("topCount"),
        topShare: read("topShare"),
        fixedStake: read("fixedStake")
      }
    });
  }

  function bindBudgetAllocationPanel(options = {}) {
    const doc = options.document || (root && root.document) || null;
    const storage = getStorage(options.storage);
    if (!doc || typeof doc.querySelector !== "function") return null;
    const panel = doc.querySelector("#phase22-budget-allocation-optimization-core");
    if (!panel || panel.dataset.phase22BudgetBound === "true") return null;
    panel.dataset.phase22BudgetBound = "true";
    let phase224Payload = loadPhase224Payload(storage);
    let settings = normalizeSettings(options.settings || phase224Payload?.settings || {});
    let optimization = optimizeTickets(phase224Payload?.tickets || [], settings);

    const render = () => renderResults(doc, optimization.results, optimization.summary, doc.querySelector("#phase22-budget-sort")?.value || "priority");
    const reload = () => {
      phase224Payload = loadPhase224Payload(storage);
      optimization = optimizeTickets(phase224Payload?.tickets || [], settings);
      render();
      setMessage(doc, phase224Payload?.tickets?.length ? "Phase22-4買い目を読み込みました。" : "Phase22-4の保存済み買い目がありません。", phase224Payload?.tickets?.length ? "success" : "error");
      return phase224Payload;
    };
    const recalc = () => {
      if (optimization.results.some((item) => item.manualChanged)) {
        const confirmRecalc = options.confirmRecalc || (() => (root && typeof root.confirm === "function" ? root.confirm("手動編集があります。再計算してよいですか？") : false));
        if (!confirmRecalc()) {
          setMessage(doc, "再計算には確認が必要です。", "error");
          return null;
        }
      }
      settings = readBasicSettings(doc);
      optimization = optimizeTickets(phase224Payload?.tickets || [], settings);
      render();
      setMessage(doc, optimization.summary.overBudget ? "再計算しましたが予算超過があります。" : "優先度と予算配分を再計算しました。", optimization.summary.overBudget ? "error" : "success");
      return optimization;
    };
    const save = () => {
      const result = saveOptimization({ sourceRaceKey: phase224Payload?.sourceRaceKey || "", phase224SavedAt: phase224Payload?.savedAt || "", settings, results: optimization.results, summary: optimization.summary }, storage);
      setMessage(doc, result.saved ? "最適化結果を保存しました。" : result.errors.join(" / "), result.saved ? "success" : "error");
      return result;
    };
    const restore = () => {
      const saved = loadSavedOptimization(storage);
      if (!saved) {
        setMessage(doc, "保存済みのPhase22-5最適化結果はありません。", "info");
        return null;
      }
      settings = saved.settings;
      optimization = { results: saved.results, summary: saved.summary, settings, warnings: saved.summary.warnings || [] };
      render();
      setMessage(doc, "保存済みの最適化結果を復元しました。", "success");
      return saved;
    };
    const reset = () => {
      const confirmReset = options.confirmReset || (() => (root && typeof root.confirm === "function" ? root.confirm("Phase22-5の保存データだけを初期化しますか？Phase22-1〜22-4は削除しません。") : false));
      const result = deleteSavedOptimization(storage, confirmReset);
      setMessage(doc, result.deleted ? "Phase22-5の保存データだけを初期化しました。" : "初期化には確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };
    const apply = () => {
      const confirmApply = options.confirmApply || (() => (root && typeof root.confirm === "function" ? root.confirm("最適化結果の金額と採用状態だけをPhase22-4へ反映します。バックアップを作成して実行しますか？") : false));
      const result = applyToPhase224(optimization.results, storage, confirmApply);
      setMessage(doc, result.applied ? "Phase22-4へ金額と採用状態を反映しました。自動購入ではありません。" : "Phase22-4への反映は実行されませんでした。", result.applied ? "success" : "error");
      return result;
    };
    const resetAuto = () => {
      optimization.results = resetManualAdjustments(optimization.results);
      optimization = optimizeTickets(phase224Payload?.tickets || [], settings);
      render();
      setMessage(doc, "手動調整を解除し、自動配分に戻しました。", "success");
      return optimization;
    };
    [
      ["#phase22-budget-reload-source", "click", reload],
      ["#phase22-budget-recalculate-score", "click", recalc],
      ["#phase22-budget-allocate", "click", recalc],
      ["#phase22-budget-reset-auto", "click", resetAuto],
      ["#phase22-budget-save", "click", save],
      ["#phase22-budget-restore", "click", restore],
      ["#phase22-budget-reset", "click", reset],
      ["#phase22-budget-apply-to-phase224", "click", apply],
      ["#phase22-budget-sort", "change", render]
    ].forEach(([selector, event, handler]) => {
      const node = doc.querySelector(selector);
      if (node) node.addEventListener(event, handler);
    });
    render();
    return { reload, recalc, save, restore, reset, apply, resetAuto, render };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindBudgetAllocationPanel();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    RACE_INPUT_STORAGE_KEY,
    PREDICTION_EVALUATION_STORAGE_KEY,
    FINAL_SUMMARY_STORAGE_KEY,
    TICKET_STORAGE_KEY,
    STORAGE_KEY,
    PHASE22_4_BACKUP_STORAGE_KEY,
    PROTECTED_CLEANUP_KEYS,
    TICKET_TYPES,
    TICKET_LABELS,
    MODES,
    defaultSettings,
    normalizeWeights,
    normalizeSettings,
    normalizeTicket,
    loadPhase224Payload,
    markStats,
    aiScore,
    categoryScore,
    longshotScore,
    scoreTicket,
    eligibleTickets,
    optimizeTickets,
    calculateSummary: buildSummary,
    applyManualStake,
    toggleAdoption,
    resetManualAdjustments,
    normalizePayload,
    loadSavedOptimization,
    saveOptimization,
    deleteSavedOptimization,
    applyToPhase224,
    summarizePhase21Cleanup,
    cleanupPhase21LocalData,
    sortResults,
    bindBudgetAllocationPanel
  };
});
