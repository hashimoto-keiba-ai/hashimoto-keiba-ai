(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase228LearningCandidateReviewSummaryCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RACE_INPUT_STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const PREDICTION_EVALUATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.predictionEvaluation.v1";
  const FINAL_SUMMARY_STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPredictionSummary.v1";
  const TICKET_STORAGE_KEY = "hashimotoKeibaAi.phase22.bettingTicketGeneration.v1";
  const BUDGET_OPTIMIZATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.budgetAllocationOptimization.v1";
  const FINAL_PURCHASE_PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPurchasePlanConfirmation.v1";
  const ACTUAL_RESULT_STORAGE_KEY = "hashimotoKeibaAi.phase22.actualResultReconciliation.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.learningCandidateReviewSummary.v1";
  const PROTECTED_STORAGE_KEYS = [
    RACE_INPUT_STORAGE_KEY,
    PREDICTION_EVALUATION_STORAGE_KEY,
    FINAL_SUMMARY_STORAGE_KEY,
    TICKET_STORAGE_KEY,
    BUDGET_OPTIMIZATION_STORAGE_KEY,
    FINAL_PURCHASE_PLAN_STORAGE_KEY,
    ACTUAL_RESULT_STORAGE_KEY,
    STORAGE_KEY
  ];
  const CATEGORY_IDS = [
    ["raceSelection", "レース選定"],
    ["raceFlow", "展開予測"],
    ["pace", "ペース予測"],
    ["track", "馬場判断"],
    ["postPosition", "枠順判断"],
    ["jockey", "騎手評価"],
    ["training", "調教評価"],
    ["aiScore", "AI評価点"],
    ["finalMark", "最終印"],
    ["keyHorse", "軸馬選定"],
    ["opponentHorse", "相手馬選定"],
    ["dangerousPopular", "危険人気馬判定"],
    ["longshot", "穴馬判定"],
    ["divineLongshot", "神穴候補判定"],
    ["ticketStructure", "買い目構成"],
    ["ticketType", "券種選択"],
    ["ticketCount", "点数管理"],
    ["budgetAllocation", "予算配分"],
    ["lastMinute", "購入直前判断"],
    ["skipDecision", "見送り判断"],
    ["resultReconciliation", "結果入力・照合"]
  ];
  const REVIEW_RATINGS = ["veryGood", "good", "normal", "needsImprovement", "failed"];
  const RATING_LABELS = { veryGood: "非常に良い", good: "良い", normal: "普通", needsImprovement: "改善必要", failed: "失敗" };
  const IMPORTANCE_LEVELS = ["high", "middle", "low"];
  const IMPORTANCE_LABELS = { high: "高", middle: "中", low: "低" };
  const APPROVAL_STATUSES = ["unconfirmed", "candidate", "hold", "rejected", "needsRevision"];
  const APPROVAL_LABELS = { unconfirmed: "未確認", candidate: "採用候補", hold: "保留", rejected: "不採用", needsRevision: "修正必要" };
  const OUTCOMES = { success: "成功", failure: "失敗", neutral: "中立" };
  const FINAL_MEMO_KEYS = ["overall", "raceFlow", "track", "marks", "dangerous", "longshot", "tickets", "budget", "nextPolicy", "handoff"];
  const FINAL_MEMO_LABELS = {
    overall: "総合振り返り",
    raceFlow: "展開予測の検証",
    track: "馬場判断の検証",
    marks: "印の検証",
    dangerous: "危険人気馬の検証",
    longshot: "穴馬・神穴候補の検証",
    tickets: "買い目の検証",
    budget: "予算配分の検証",
    nextPolicy: "次回改善方針",
    handoff: "学習引継ぎメモ"
  };

  function text(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    return String(value).trim();
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function yen(value, fallback = 0) {
    return Math.max(0, Math.floor(number(value, fallback)));
  }

  function formatYen(value) {
    return `${yen(value).toLocaleString("ja-JP")}円`;
  }

  function safePercent(value) {
    const parsed = number(value, 0);
    return Number.isFinite(parsed) && parsed >= 0 ? `${parsed.toFixed(1)}%` : "算出不可";
  }

  function safeParseJson(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function getStorage(storage) {
    if (storage) return storage;
    if (root && root.localStorage) return root.localStorage;
    return null;
  }

  function readStorageJson(storage, key) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { data: null, parseError: false };
    const raw = targetStorage.getItem(key);
    const data = safeParseJson(raw);
    return { data, parseError: Boolean(raw && !data) };
  }

  function normalizeRace(input = {}) {
    const race = input.race || input.raceInfo || input;
    const raceDate = text(race.raceDate || race.date);
    const racecourse = text(race.racecourse || race.courseName || race.track);
    const raceNumber = text(race.raceNumber || race.number);
    return {
      raceDate,
      racecourse,
      raceNumber,
      raceName: text(race.raceName || race.name),
      distance: text(race.distance),
      course: text(race.course || race.surface),
      trackCondition: text(race.trackCondition || race.going),
      horseCount: text(race.horseCount || race.fieldSize || race.entryCount),
      raceId: text(race.raceId || input.sourceRaceKey || [raceDate, racecourse, raceNumber].filter(Boolean).join("|"))
    };
  }

  function normalizeTicket(input = {}, index = 0) {
    const horses = Array.isArray(input.horses) ? input.horses : [];
    const horseNumbers = Array.isArray(input.horseNumbers) ? input.horseNumbers.map(text).filter(Boolean) : text(input.combination).split(/[-,\s]+/).filter(Boolean);
    return {
      id: text(input.id) || `${text(input.type, "ticket")}-${index + 1}`,
      type: text(input.type),
      typeLabel: text(input.typeLabel || input.type),
      combination: text(input.combination) || horseNumbers.join("-"),
      horseNumbers,
      horseNames: Array.isArray(input.horseNames) ? input.horseNames.map(text).filter(Boolean) : horses.map((horse) => text(horse.horseName)).filter(Boolean),
      marks: Array.isArray(input.marks) ? input.marks.map(text).filter(Boolean) : horses.map((horse) => text(horse.mark) || "無印").filter(Boolean),
      aiScores: Array.isArray(input.aiScores) ? input.aiScores.map((score) => number(score, NaN)).filter(Number.isFinite) : horses.map((horse) => number(horse.aiScore, NaN)).filter(Number.isFinite),
      priorityScore: number(input.priorityScore, 0),
      plannedStake: yen(input.plannedStake ?? input.recommendedStake ?? input.stake, 0),
      actualStake: yen(input.actualStake, 0),
      payoutTotal: yen(input.payoutTotal, 0),
      refundTotal: yen(input.refundTotal, 0),
      totalReceived: yen(input.totalReceived, 0),
      profit: number(input.profit, 0),
      roi: number(input.roi, 0),
      judgement: text(input.judgement || input.hitStatus || "unknown"),
      difference: number(input.difference, 0),
      differenceType: text(input.differenceType),
      dangerousPopular: Boolean(input.dangerousPopular),
      longshot: Boolean(input.longshot),
      divineLongshot: Boolean(input.divineLongshot),
      manualChanged: Boolean(input.manualAdded || input.changeReason || input.differenceType === "金額変更"),
      warnings: Array.isArray(input.warnings) ? input.warnings.map(text).filter(Boolean) : []
    };
  }

  function normalizeActualResult(input = {}) {
    const summary = input.finalSummary || {};
    const reconciliation = Array.isArray(input.reconciliation) ? input.reconciliation.map(normalizeTicket) : [];
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      phase226SavedAt: text(input.phase226SavedAt),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      raceResult: input.raceResult || {},
      payouts: Array.isArray(input.payouts) ? input.payouts : [],
      refunds: Array.isArray(input.refunds) ? input.refunds : [],
      reconciliation,
      finalSummary: {
        plannedPoints: number(summary.plannedPoints, 0),
        actualPoints: number(summary.actualPoints, reconciliation.filter((item) => item.actualStake > 0).length),
        plannedAmount: yen(summary.plannedAmount, reconciliation.reduce((sum, item) => sum + item.plannedStake, 0)),
        actualAmount: yen(summary.actualAmount, reconciliation.reduce((sum, item) => sum + item.actualStake, 0)),
        hitPoints: number(summary.hitPoints, reconciliation.filter((item) => item.judgement === "hit").length),
        missPoints: number(summary.missPoints, reconciliation.filter((item) => item.judgement === "miss").length),
        unknownPoints: number(summary.unknownPoints, reconciliation.filter((item) => item.judgement === "unknown" || item.judgement === "needsReview").length),
        payoutTotal: yen(summary.payoutTotal, reconciliation.reduce((sum, item) => sum + item.payoutTotal, 0)),
        refundTotal: yen(summary.refundTotal, reconciliation.reduce((sum, item) => sum + item.refundTotal, 0)),
        totalReceived: yen(summary.totalReceived, reconciliation.reduce((sum, item) => sum + item.totalReceived, 0)),
        profit: number(summary.profit, 0),
        roi: number(summary.roi, 0),
        hitRate: number(summary.hitRate, 0),
        plannedActualDifference: number(summary.plannedActualDifference, 0),
        byType: summary.byType || {},
        dangerous: summary.dangerous || {},
        longshot: summary.longshot || {}
      },
      memos: input.memos || {},
      phase226Snapshot: input.phase226Snapshot || null
    };
  }

  function loadActualResult(storage) {
    const loaded = readStorageJson(storage, ACTUAL_RESULT_STORAGE_KEY);
    return { actual: normalizeActualResult(loaded.data || {}), parseError: loaded.parseError };
  }

  function loadAllSources(storage) {
    const race = readStorageJson(storage, RACE_INPUT_STORAGE_KEY);
    const evals = readStorageJson(storage, PREDICTION_EVALUATION_STORAGE_KEY);
    const finalSummary = readStorageJson(storage, FINAL_SUMMARY_STORAGE_KEY);
    const tickets = readStorageJson(storage, TICKET_STORAGE_KEY);
    const budget = readStorageJson(storage, BUDGET_OPTIMIZATION_STORAGE_KEY);
    const purchase = readStorageJson(storage, FINAL_PURCHASE_PLAN_STORAGE_KEY);
    const actual = loadActualResult(storage);
    return {
      race: normalizeRace(race.data || {}),
      predictionEvaluation: evals.data || {},
      finalPredictionSummary: finalSummary.data || {},
      bettingTickets: tickets.data || {},
      budgetOptimization: budget.data || {},
      finalPurchasePlan: purchase.data || {},
      actualResult: actual.actual,
      parseErrors: {
        race: race.parseError,
        predictionEvaluation: evals.parseError,
        finalPredictionSummary: finalSummary.parseError,
        bettingTickets: tickets.parseError,
        budgetOptimization: budget.parseError,
        finalPurchasePlan: purchase.parseError,
        actualResult: actual.parseError
      }
    };
  }

  function finishPositionMap(actual) {
    const result = actual.raceResult || {};
    const entries = [["first", 1], ["second", 2], ["third", 3], ["fourth", 4], ["fifth", 5]];
    const map = new Map();
    entries.forEach(([key, rank]) => {
      const value = text(result[key]);
      if (value) map.set(value, rank);
    });
    return map;
  }

  function buildReviewSummary(sources) {
    const actual = sources.actualResult;
    const summary = actual.finalSummary;
    const hits = actual.reconciliation.filter((item) => item.judgement === "hit");
    const misses = actual.reconciliation.filter((item) => item.judgement === "miss");
    return {
      race: sources.race,
      finalPrediction: sources.finalPredictionSummary,
      finalMarks: extractFinalMarks(actual),
      aiTop: extractAiTop(actual),
      actualTop: [actual.raceResult.first, actual.raceResult.second, actual.raceResult.third].map(text).filter(Boolean),
      purchasePlan: actual.phase226Snapshot || {},
      actualPurchases: actual.reconciliation,
      hitTickets: hits,
      missedTickets: misses,
      payoutTotal: summary.payoutTotal,
      refundTotal: summary.refundTotal,
      profit: summary.profit,
      roi: summary.roi,
      hitRate: summary.hitRate,
      planActualDifference: summary.plannedActualDifference,
      warnings: collectSourceWarnings(actual)
    };
  }

  function extractFinalMarks(actual) {
    const rows = [];
    actual.reconciliation.forEach((ticket) => {
      ticket.horseNumbers.forEach((numberValue, index) => {
        const mark = ticket.marks[index] || ticket.marks[0] || "無印";
        if (!rows.some((row) => row.horseNumber === numberValue && row.mark === mark)) {
          rows.push({ horseNumber: numberValue, horseName: ticket.horseNames[index] || "", mark });
        }
      });
    });
    return rows;
  }

  function extractAiTop(actual) {
    const rows = [];
    actual.reconciliation.forEach((ticket) => {
      ticket.horseNumbers.forEach((numberValue, index) => {
        const score = ticket.aiScores[index] ?? ticket.aiScores[0];
        if (Number.isFinite(score) && !rows.some((row) => row.horseNumber === numberValue)) {
          rows.push({ horseNumber: numberValue, horseName: ticket.horseNames[index] || "", aiScore: score });
        }
      });
    });
    return rows.sort((a, b) => b.aiScore - a.aiScore);
  }

  function collectSourceWarnings(actual) {
    const warnings = [];
    if (!actual.finalized) warnings.push("Phase22-7実績未確定");
    if (actual.finalSummary.unknownPoints > 0) warnings.push("判定不能買い目あり");
    if (actual.finalSummary.roi < 100 && actual.finalSummary.actualAmount > 0) warnings.push("回収率100%未満");
    if (actual.finalSummary.plannedActualDifference !== 0) warnings.push("予定と実購入に差異あり");
    return warnings;
  }

  function buildComparisonMetrics(sources) {
    const actual = sources.actualResult;
    const finishMap = finishPositionMap(actual);
    const aiTop = extractAiTop(actual);
    const aiRankDiff = aiTop.map((horse, index) => ({
      horseNumber: horse.horseNumber,
      horseName: horse.horseName,
      aiRank: index + 1,
      finishRank: finishMap.get(horse.horseNumber) || null,
      rankDiff: finishMap.has(horse.horseNumber) ? finishMap.get(horse.horseNumber) - (index + 1) : null
    }));
    return {
      aiRankDiff,
      markStats: aggregateByHorseAttribute(actual, "marks"),
      categoryStats: {
        dangerousPopular: summarizeTickets(actual.reconciliation.filter((item) => item.dangerousPopular)),
        longshot: summarizeTickets(actual.reconciliation.filter((item) => item.longshot)),
        divineLongshot: summarizeTickets(actual.reconciliation.filter((item) => item.divineLongshot))
      },
      dangerousSuccessRate: successRate(actual.reconciliation.filter((item) => item.dangerousPopular), "miss"),
      longshotSuccessRate: successRate(actual.reconciliation.filter((item) => item.longshot), "hit"),
      divineLongshotSuccessRate: successRate(actual.reconciliation.filter((item) => item.divineLongshot), "hit"),
      typeRoi: buildTypeRoi(actual),
      priorityBandRoi: buildBandRoi(actual.reconciliation, (item) => item.priorityScore >= 80 ? "80以上" : item.priorityScore >= 60 ? "60-79" : "60未満"),
      stakeBandRoi: buildBandRoi(actual.reconciliation, (item) => item.actualStake >= 1000 ? "1000円以上" : item.actualStake >= 500 ? "500-999円" : "500円未満"),
      plannedActualImpact: actual.finalSummary.plannedActualDifference,
      budgetUsageRate: actual.finalSummary.plannedAmount ? actual.finalSummary.actualAmount / actual.finalSummary.plannedAmount * 100 : 0,
      highPriorityAllocationRate: allocationRate(actual.reconciliation.filter((item) => item.priorityScore >= 80), actual.reconciliation),
      hitAllocationRate: allocationRate(actual.reconciliation.filter((item) => item.judgement === "hit"), actual.reconciliation)
    };
  }

  function aggregateByHorseAttribute(actual, key) {
    const rows = {};
    actual.reconciliation.forEach((ticket) => {
      const values = key === "marks" ? ticket.marks : [];
      values.forEach((value) => {
        if (!rows[value]) rows[value] = { label: value, count: 0, hits: 0, amount: 0, received: 0, averageFinish: 0, finishRanks: [] };
        rows[value].count += 1;
        if (ticket.judgement === "hit") rows[value].hits += 1;
        rows[value].amount += ticket.actualStake;
        rows[value].received += ticket.totalReceived;
      });
    });
    return Object.values(rows).map((row) => ({ ...row, roi: row.amount ? row.received / row.amount * 100 : 0, hitContribution: row.hits }));
  }

  function summarizeTickets(rows) {
    const amount = rows.reduce((sum, item) => sum + item.actualStake, 0);
    const received = rows.reduce((sum, item) => sum + item.totalReceived, 0);
    return { count: rows.length, hits: rows.filter((item) => item.judgement === "hit").length, amount, received, roi: amount ? received / amount * 100 : 0 };
  }

  function successRate(rows, successJudgement) {
    if (!rows.length) return 0;
    return rows.filter((item) => item.judgement === successJudgement).length / rows.length * 100;
  }

  function buildTypeRoi(actual) {
    const byType = {};
    actual.reconciliation.forEach((item) => {
      const key = item.typeLabel || item.type || "未設定";
      if (!byType[key]) byType[key] = { label: key, amount: 0, received: 0, hits: 0, count: 0 };
      byType[key].amount += item.actualStake;
      byType[key].received += item.totalReceived;
      byType[key].hits += item.judgement === "hit" ? 1 : 0;
      byType[key].count += 1;
    });
    return Object.values(byType).map((row) => ({ ...row, roi: row.amount ? row.received / row.amount * 100 : 0 }));
  }

  function buildBandRoi(rows, selector) {
    const bands = {};
    rows.forEach((item) => {
      const key = selector(item);
      if (!bands[key]) bands[key] = { label: key, amount: 0, received: 0, hits: 0, count: 0 };
      bands[key].amount += item.actualStake;
      bands[key].received += item.totalReceived;
      bands[key].hits += item.judgement === "hit" ? 1 : 0;
      bands[key].count += 1;
    });
    return Object.values(bands).map((row) => ({ ...row, roi: row.amount ? row.received / row.amount * 100 : 0 }));
  }

  function allocationRate(rows, allRows) {
    const total = allRows.reduce((sum, item) => sum + item.actualStake, 0);
    const part = rows.reduce((sum, item) => sum + item.actualStake, 0);
    return total ? part / total * 100 : 0;
  }

  function generateLearningCandidates(sources, metrics) {
    const actual = sources.actualResult;
    const candidates = [];
    const add = (candidate) => {
      const id = candidate.id || `${candidate.category}:${candidate.title}`;
      if (!candidates.some((row) => row.id === id)) candidates.push(normalizeCandidate({ id, ...candidate }));
    };
    if (actual.finalSummary.hitPoints > 0) add({
      category: "買い目構成",
      title: "的中に寄与した買い目候補",
      body: `的中 ${actual.finalSummary.hitPoints}点 / 払戻 ${formatYen(actual.finalSummary.payoutTotal)}`,
      evidence: "Phase22-7照合結果の的中買い目",
      targetTicketType: actual.reconciliation.filter((item) => item.judgement === "hit").map((item) => item.typeLabel).join(", "),
      outcome: "success",
      importance: "high",
      confidence: "medium",
      nextAction: "的中買い目の印・評価点・券種構成を次回確認する"
    });
    if (actual.finalSummary.missPoints > 0) add({
      category: "買い目構成",
      title: "不的中の主要要因候補",
      body: `不的中 ${actual.finalSummary.missPoints}点。候補として買い目不足・券種選択・相手抜けを確認。`,
      evidence: "Phase22-7照合結果の不的中買い目",
      outcome: "failure",
      importance: "high",
      confidence: "low",
      nextAction: "相手抜けと券種選択の妥当性を手動確認する"
    });
    metrics.aiRankDiff.forEach((row) => {
      if (row.finishRank && row.aiRank <= 3 && row.finishRank <= 3) add({
        category: "AI評価点",
        title: "高評価馬の好走候補",
        body: `AI順位${row.aiRank}位の${row.horseNumber}番が${row.finishRank}着。`,
        evidence: "AI評価順位と実着順の差",
        targetHorse: `${row.horseNumber} ${row.horseName}`.trim(),
        outcome: "success",
        importance: "middle",
        confidence: "medium",
        nextAction: "高評価要素を継続候補として確認する"
      });
      if (row.finishRank && row.aiRank <= 3 && row.finishRank > 3) add({
        category: "AI評価点",
        title: "高評価馬の凡走候補",
        body: `AI順位${row.aiRank}位の${row.horseNumber}番が${row.finishRank}着。`,
        evidence: "AI評価順位と実着順の差",
        targetHorse: `${row.horseNumber} ${row.horseName}`.trim(),
        outcome: "failure",
        importance: "middle",
        confidence: "medium",
        nextAction: "過大評価要因を確認する"
      });
    });
    if (metrics.dangerousSuccessRate > 0) add({
      category: "危険人気馬判定",
      title: "危険人気馬判定の成功・失敗候補",
      body: `危険人気馬判定成功率 ${safePercent(metrics.dangerousSuccessRate)}。`,
      evidence: "危険人気馬を含む買い目の成績",
      outcome: metrics.dangerousSuccessRate >= 50 ? "success" : "failure",
      importance: "middle",
      confidence: "low",
      nextAction: "危険人気馬の扱いを公式結果と照合する"
    });
    if (metrics.longshotSuccessRate > 0 || actual.reconciliation.some((item) => item.longshot)) add({
      category: "穴馬判定",
      title: "穴馬・神穴候補判定の検証候補",
      body: `穴馬成功率 ${safePercent(metrics.longshotSuccessRate)} / 神穴成功率 ${safePercent(metrics.divineLongshotSuccessRate)}。`,
      evidence: "穴馬・神穴候補を含む買い目の成績",
      outcome: metrics.longshotSuccessRate > 0 ? "success" : "failure",
      importance: "middle",
      confidence: "low",
      nextAction: "好走・凡走した穴馬の根拠を見直す"
    });
    if (actual.finalSummary.plannedActualDifference !== 0) add({
      category: "購入直前判断",
      title: "Phase22-6計画と実購入差異の影響候補",
      body: `予定と実績の差額 ${formatYen(actual.finalSummary.plannedActualDifference)}。`,
      evidence: "Phase22-7の予定実績差異",
      outcome: "neutral",
      importance: "middle",
      confidence: "medium",
      nextAction: "差異理由が回収率に与えた影響を確認する"
    });
    if (actual.finalSummary.roi < 100 && actual.finalSummary.actualAmount > 0) add({
      category: "予算配分",
      title: "回収率悪化要因候補",
      body: `回収率 ${safePercent(actual.finalSummary.roi)}。`,
      evidence: "Phase22-7収支集計",
      outcome: "failure",
      importance: "high",
      confidence: "medium",
      nextAction: "配分比率、点数、券種の見直し候補にする"
    });
    if (actual.finalSummary.roi >= 100 && actual.finalSummary.actualAmount > 0) add({
      category: "予算配分",
      title: "回収率向上要因候補",
      body: `回収率 ${safePercent(actual.finalSummary.roi)}。`,
      evidence: "Phase22-7収支集計",
      outcome: "success",
      importance: "high",
      confidence: "medium",
      nextAction: "成功した配分と券種を継続候補にする"
    });
    return candidates;
  }

  function normalizeCandidate(input = {}) {
    return {
      id: text(input.id),
      category: text(input.category, "未設定"),
      title: text(input.title, "未設定"),
      body: text(input.body),
      evidence: text(input.evidence),
      targetHorse: text(input.targetHorse),
      targetTicketType: text(input.targetTicketType),
      targetEvaluation: text(input.targetEvaluation),
      outcome: ["success", "failure", "neutral"].includes(input.outcome) ? input.outcome : "neutral",
      importance: IMPORTANCE_LEVELS.includes(input.importance) ? input.importance : "middle",
      confidence: text(input.confidence || "medium"),
      scope: text(input.scope || "次回以降の手動確認候補"),
      nextAction: text(input.nextAction),
      approvalStatus: APPROVAL_STATUSES.includes(input.approvalStatus) ? input.approvalStatus : "unconfirmed",
      comment: text(input.comment)
    };
  }

  function mergeCandidates(autoCandidates, savedCandidates = []) {
    const saved = new Map(savedCandidates.map((candidate) => [candidate.id, normalizeCandidate(candidate)]));
    return autoCandidates.map((candidate) => ({ ...candidate, ...(saved.get(candidate.id) || {}) }))
      .concat(savedCandidates.map(normalizeCandidate).filter((candidate) => !autoCandidates.some((auto) => auto.id === candidate.id)));
  }

  function normalizeCategoryReviews(input = {}) {
    const reviews = {};
    CATEGORY_IDS.forEach(([id, label]) => {
      const current = input[id] || {};
      reviews[id] = {
        id,
        label,
        rating: REVIEW_RATINGS.includes(current.rating) ? current.rating : "normal",
        importance: IMPORTANCE_LEVELS.includes(current.importance) ? current.importance : "middle",
        good: text(current.good),
        improvement: text(current.improvement),
        evidence: text(current.evidence),
        nextAction: text(current.nextAction),
        learningCandidate: Boolean(current.learningCandidate)
      };
    });
    return reviews;
  }

  function normalizeOverallReview(input = {}) {
    return {
      overallRating: text(input.overallRating),
      predictionAccuracy: text(input.predictionAccuracy),
      ticketRating: text(input.ticketRating),
      budgetRating: text(input.budgetRating),
      executionRating: text(input.executionRating),
      reconciliationQuality: text(input.reconciliationQuality),
      biggestSuccess: text(input.biggestSuccess),
      biggestFailure: text(input.biggestFailure),
      topImprovement: text(input.topImprovement),
      rulesToKeep: text(input.rulesToKeep),
      rulesToReview: text(input.rulesToReview),
      newHypothesis: text(input.newHypothesis)
    };
  }

  function normalizeActions(input = []) {
    return (Array.isArray(input) ? input : []).map((action, index) => ({
      id: text(action.id) || `action-${index + 1}`,
      body: text(action.body),
      category: text(action.category),
      priority: IMPORTANCE_LEVELS.includes(action.priority) ? action.priority : "middle",
      dueMemo: text(action.dueMemo),
      nextCheck: text(action.nextCheck),
      done: Boolean(action.done),
      note: text(action.note)
    }));
  }

  function normalizeFinalMemos(input = {}) {
    const memos = {};
    FINAL_MEMO_KEYS.forEach((key) => {
      memos[key] = text(input[key]);
    });
    return memos;
  }

  function normalizePlan(input = {}, autoCandidates = []) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      phase227SavedAt: text(input.phase227SavedAt),
      categoryReviews: normalizeCategoryReviews(input.categoryReviews),
      candidates: mergeCandidates(autoCandidates, input.candidates || []),
      metrics: input.metrics || {},
      overallReview: normalizeOverallReview(input.overallReview || {}),
      actions: normalizeActions(input.actions || []),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      finalMemos: normalizeFinalMemos(input.finalMemos || {}),
      phase227Snapshot: input.phase227Snapshot || null
    };
  }

  function loadSavedReview(storage, autoCandidates = []) {
    const loaded = readStorageJson(storage, STORAGE_KEY);
    return { plan: normalizePlan(loaded.data || {}, autoCandidates), parseError: loaded.parseError };
  }

  function snapshotPhase227(actual) {
    return {
      savedAt: actual.savedAt,
      sourceRaceKey: actual.sourceRaceKey,
      finalized: actual.finalized,
      finalizedAt: actual.finalizedAt,
      finalSummary: actual.finalSummary,
      reconciliation: actual.reconciliation.map((ticket) => ({
        id: ticket.id,
        type: ticket.type,
        combination: ticket.combination,
        actualStake: ticket.actualStake,
        totalReceived: ticket.totalReceived,
        judgement: ticket.judgement
      }))
    };
  }

  function detectPhase227Changes(current, savedPlan) {
    const snapshot = savedPlan && savedPlan.phase227Snapshot;
    if (!snapshot) return [];
    const changes = [];
    if (snapshot.savedAt && snapshot.savedAt !== current.savedAt) changes.push("Phase22-7の保存時刻が変わっています。");
    if (Boolean(snapshot.finalized) !== Boolean(current.finalized)) changes.push("Phase22-7の確定状態が変わっています。");
    if (snapshot.sourceRaceKey && current.sourceRaceKey && snapshot.sourceRaceKey !== current.sourceRaceKey) changes.push("raceIdが変わっています。");
    const oldSummary = snapshot.finalSummary || {};
    ["profit", "roi", "hitRate"].forEach((key) => {
      if (number(oldSummary[key], 0) !== number(current.finalSummary[key], 0)) changes.push(`${key}が変わっています。`);
    });
    return changes;
  }

  function buildWarnings({ sources, plan, metrics, parseErrors = [] }) {
    const actual = sources.actualResult;
    const warnings = [];
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ severity: "error", message }));
    if (sources.race.raceId && actual.sourceRaceKey && sources.race.raceId !== actual.sourceRaceKey) warnings.push({ severity: "error", message: "raceId不一致です。" });
    if (!actual.finalized) warnings.push({ severity: "error", message: "Phase22-7実績未確定です。" });
    if (!Number.isFinite(number(actual.finalSummary.roi, NaN)) || !Number.isFinite(number(actual.finalSummary.profit, NaN))) warnings.push({ severity: "error", message: "数値計算異常です。" });
    if (!actual.savedAt && !actual.reconciliation.length) warnings.push({ severity: "error", message: "必須データ破損または未登録です。" });
    detectPhase227Changes(actual, plan).forEach((message) => warnings.push({ severity: "warning", message: `Phase22-7更新検知: ${message}` }));
    if (actual.finalSummary.unknownPoints > 0) warnings.push({ severity: "warning", message: "判定不能買い目あり。" });
    if (plan.candidates.some((candidate) => candidate.approvalStatus === "unconfirmed")) warnings.push({ severity: "warning", message: "学習候補未確認があります。" });
    if (!plan.overallReview.overallRating) warnings.push({ severity: "warning", message: "振り返り未入力です。" });
    if (!plan.overallReview.biggestSuccess || !plan.overallReview.biggestFailure) warnings.push({ severity: "warning", message: "成功・失敗要因未入力です。" });
    if (!plan.actions.length) warnings.push({ severity: "warning", message: "改善アクション未設定です。" });
    if (actual.finalSummary.actualPoints > 0 && actual.finalSummary.hitPoints === 0 && actual.finalSummary.unknownPoints === 0) warnings.push({ severity: "notice", message: "全買い目不的中です。" });
    if (actual.finalSummary.actualAmount > 0 && actual.finalSummary.roi < 100) warnings.push({ severity: "notice", message: "回収率100%未満です。" });
    if (actual.finalSummary.actualAmount > 0 && actual.finalSummary.roi >= 100) warnings.push({ severity: "notice", message: "回収率100%以上です。" });
    if (metrics.dangerousSuccessRate === 0 && sources.actualResult.reconciliation.some((item) => item.dangerousPopular)) warnings.push({ severity: "notice", message: "危険人気馬判定失敗候補があります。" });
    if (metrics.longshotSuccessRate === 0 && sources.actualResult.reconciliation.some((item) => item.longshot || item.divineLongshot)) warnings.push({ severity: "notice", message: "穴馬・神穴候補の見逃し候補があります。" });
    if (actual.finalSummary.plannedActualDifference !== 0) warnings.push({ severity: "notice", message: "予定と実購入に差異あり。" });
    if (actual.reconciliation.some((item) => item.manualChanged)) warnings.push({ severity: "notice", message: "手動修正あり。" });
    return warnings;
  }

  function canFinalize({ sources, plan, warnings }) {
    const errors = warnings.filter((warning) => warning.severity === "error");
    return {
      ok: sources.actualResult.finalized
        && Boolean(plan.overallReview.overallRating)
        && Boolean(plan.overallReview.biggestSuccess)
        && Boolean(plan.overallReview.biggestFailure)
        && Boolean(plan.overallReview.topImprovement)
        && plan.candidates.every((candidate) => candidate.approvalStatus !== "unconfirmed")
        && errors.length === 0,
      reasons: [
        sources.actualResult.finalized ? "" : "Phase22-7実績が未確定です。",
        plan.overallReview.overallRating ? "" : "振り返り総合評価が未入力です。",
        plan.overallReview.biggestSuccess ? "" : "最大成功要因が未入力です。",
        plan.overallReview.biggestFailure ? "" : "最大失敗要因が未入力です。",
        plan.overallReview.topImprovement ? "" : "次回最優先改善点が未入力です。",
        plan.candidates.every((candidate) => candidate.approvalStatus !== "unconfirmed") ? "" : "学習候補の未確認項目があります。",
        errors.length === 0 ? "" : "エラー警告があります。"
      ].filter(Boolean)
    };
  }

  function buildPayload({ sources, plan, summary, metrics, warnings }) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      sourceRaceKey: sources.actualResult.sourceRaceKey,
      phase227SavedAt: sources.actualResult.savedAt,
      reviewSummary: summary,
      categoryReviews: normalizeCategoryReviews(plan.categoryReviews),
      candidates: plan.candidates.map(normalizeCandidate),
      metrics,
      overallReview: normalizeOverallReview(plan.overallReview),
      actions: normalizeActions(plan.actions),
      finalized: Boolean(plan.finalized),
      finalizedAt: text(plan.finalizedAt),
      confirmerName: text(plan.confirmerName),
      finalMemos: normalizeFinalMemos(plan.finalMemos),
      warnings,
      phase227Snapshot: snapshotPhase227(sources.actualResult)
    };
  }

  function saveReview(payload, storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"] };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return { saved: true, data: payload };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return { saved: false, quotaExceeded, storageError: true, errors: [quotaExceeded ? "localStorageの容量が不足しているため学習候補を保存できませんでした。" : "localStorageへの保存に失敗しました。"] };
    }
  }

  function deleteSavedReview(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function finalizeReview(plan, state, confirmerName, confirmFinalize = () => false) {
    const result = canFinalize(state);
    if (!result.ok) return { finalized: false, reasons: result.reasons, plan };
    if (!confirmFinalize()) return { finalized: false, reasons: ["confirmation_required"], plan };
    return { finalized: true, plan: { ...plan, finalized: true, finalizedAt: new Date().toISOString(), confirmerName: text(confirmerName) || "未設定" } };
  }

  function unfinalizeReview(plan, confirmUnlock = () => false) {
    if (!confirmUnlock()) return { unlocked: false, reason: "confirmation_required", plan };
    return { unlocked: true, plan: { ...plan, finalized: false, finalizedAt: "" } };
  }

  function setCandidateApproval(candidates, id, approvalStatus, comment = "") {
    return candidates.map((candidate) => candidate.id === id ? { ...candidate, approvalStatus: APPROVAL_STATUSES.includes(approvalStatus) ? approvalStatus : candidate.approvalStatus, comment: text(comment, candidate.comment) } : candidate);
  }

  function generatePlainText({ sources, summary, metrics, plan, warnings }) {
    const lines = [];
    lines.push("Phase22-8 学習候補・振り返り集約");
    lines.push(`レース: ${text(summary.race.raceDate, "未設定")} ${text(summary.race.racecourse, "未設定")} ${text(summary.race.raceNumber, "未設定")} ${text(summary.race.raceName, "未設定")}`);
    lines.push(`収支: ${formatYen(summary.profit)} / 回収率 ${safePercent(summary.roi)} / 的中率 ${safePercent(summary.hitRate)}`);
    lines.push(`Phase22-7確定: ${sources.actualResult.finalized ? "確定済み" : "未確定"} ${sources.actualResult.finalizedAt || ""}`);
    lines.push("");
    lines.push("カテゴリ別評価:");
    Object.values(plan.categoryReviews).forEach((review) => lines.push(`- ${review.label}: ${RATING_LABELS[review.rating]} / ${IMPORTANCE_LABELS[review.importance]} / 改善 ${review.improvement || "未設定"}`));
    lines.push("");
    lines.push("学習候補:");
    plan.candidates.forEach((candidate) => lines.push(`- [${APPROVAL_LABELS[candidate.approvalStatus]}] ${candidate.category}: ${candidate.title} (${OUTCOMES[candidate.outcome]}) ${candidate.nextAction}`));
    lines.push("");
    lines.push(`最大成功要因: ${plan.overallReview.biggestSuccess || "未設定"}`);
    lines.push(`最大失敗要因: ${plan.overallReview.biggestFailure || "未設定"}`);
    lines.push(`次回最優先改善点: ${plan.overallReview.topImprovement || "未設定"}`);
    lines.push(`AI順位差件数: ${metrics.aiRankDiff.length}`);
    lines.push("警告:");
    if (warnings.length) warnings.forEach((warning) => lines.push(`- [${warning.severity}] ${warning.message}`));
    else lines.push("- なし");
    Object.entries(FINAL_MEMO_LABELS).forEach(([key, label]) => lines.push(`${label}: ${plan.finalMemos[key] || "未設定"}`));
    lines.push(`確定状態: ${plan.finalized ? `確定済み ${plan.finalizedAt} / ${plan.confirmerName || "未設定"}` : "未確定"}`);
    lines.push("自動学習・自動モデル更新・外部送信は行いません。利用者の承認が必要な候補データです。");
    return lines.join("\n");
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function appendKV(doc, parent, label, value) {
    const item = makeEl(doc, "div", "phase22-learning-kv");
    item.appendChild(makeEl(doc, "span", "", label));
    item.appendChild(makeEl(doc, "strong", "", text(value, "未設定") || "未設定"));
    parent.appendChild(item);
  }

  function bindLearningReviewPanel(options = {}) {
    const doc = options.document || (root && root.document);
    const storage = getStorage(options.storage);
    if (!doc || !storage) return null;
    const rootNode = doc.querySelector("#phase22-learning-candidate-review-summary-core");
    if (!rootNode || rootNode.dataset.phase22LearningBound === "true") return null;
    rootNode.dataset.phase22LearningBound = "true";
    const state = { sources: loadAllSources(storage), savedLoad: null, plan: null, message: "Phase22-7実績結果を保存・確定してから再読込してください。", messageKind: "info" };
    const initialMetrics = buildComparisonMetrics(state.sources);
    const initialCandidates = generateLearningCandidates(state.sources, initialMetrics);
    state.savedLoad = loadSavedReview(storage, initialCandidates);
    state.plan = state.savedLoad.plan;

    const query = (selector) => doc.querySelector(selector);
    const setMessage = (message, kind = "info") => {
      state.message = message;
      state.messageKind = kind;
      const node = query("#phase22-learning-message");
      if (node) {
        node.textContent = message;
        node.dataset.kind = kind;
      }
    };
    const runtime = () => {
      const summary = buildReviewSummary(state.sources);
      const metrics = buildComparisonMetrics(state.sources);
      const warnings = buildWarnings({ sources: state.sources, plan: state.plan, metrics, parseErrors: Object.entries(state.sources.parseErrors).filter(([, value]) => value).map(([key]) => `破損データ読み込み: ${key}`) });
      return { summary, metrics, warnings };
    };

    function readInputs() {
      const confirmer = query("#phase22-learning-confirmer");
      if (confirmer) state.plan.confirmerName = text(confirmer.value);
      Object.keys(state.plan.overallReview).forEach((key) => {
        const node = query(`[data-phase22-learning-overall="${key}"]`);
        if (node) state.plan.overallReview[key] = text(node.value);
      });
      CATEGORY_IDS.forEach(([id]) => {
        const review = state.plan.categoryReviews[id];
        ["rating", "importance", "good", "improvement", "evidence", "nextAction"].forEach((field) => {
          const node = query(`[data-phase22-learning-category="${id}:${field}"]`);
          if (node) review[field] = text(node.value);
        });
        const learning = query(`[data-phase22-learning-category="${id}:learningCandidate"]`);
        if (learning) review.learningCandidate = Boolean(learning.checked);
      });
      doc.querySelectorAll("[data-phase22-learning-candidate-status]").forEach((node) => {
        const candidate = state.plan.candidates.find((item) => item.id === node.dataset.phase22LearningCandidateStatus);
        if (candidate) candidate.approvalStatus = node.value;
      });
      doc.querySelectorAll("[data-phase22-learning-candidate-comment]").forEach((node) => {
        const candidate = state.plan.candidates.find((item) => item.id === node.dataset.phase22LearningCandidateComment);
        if (candidate) candidate.comment = text(node.value);
      });
      FINAL_MEMO_KEYS.forEach((key) => {
        const node = query(`[data-phase22-learning-memo="${key}"]`);
        if (node) state.plan.finalMemos[key] = text(node.value);
      });
    }

    function renderSummary(run) {
      const node = query("#phase22-learning-summary");
      if (!node) return;
      node.textContent = "";
      const s = run.summary;
      [["レース概要", `${s.race.raceDate || "未設定"} ${s.race.racecourse || ""} ${s.race.raceNumber || ""}`], ["実際の上位着順", s.actualTop.join(" / ") || "データなし"], ["購入計画", `${(s.purchasePlan.tickets || []).length || 0}点`], ["実購入内容", `${s.actualPurchases.length}点`], ["的中買い目", `${s.hitTickets.length}点`], ["不的中買い目", `${s.missedTickets.length}点`], ["払戻総額", formatYen(s.payoutTotal)], ["返還総額", formatYen(s.refundTotal)], ["収支", formatYen(s.profit)], ["回収率", safePercent(s.roi)], ["的中率", safePercent(s.hitRate)], ["計画と実績の差異", formatYen(s.planActualDifference)], ["警告・要確認", s.warnings.join(" / ") || "なし"]].forEach(([label, value]) => appendKV(doc, node, label, value));
    }

    function renderMetrics(run) {
      const node = query("#phase22-learning-metrics");
      if (!node) return;
      node.textContent = "";
      [["AI評価順位と着順差", `${run.metrics.aiRankDiff.length}件`], ["危険人気馬判定成功率", safePercent(run.metrics.dangerousSuccessRate)], ["穴馬判定成功率", safePercent(run.metrics.longshotSuccessRate)], ["神穴候補判定成功率", safePercent(run.metrics.divineLongshotSuccessRate)], ["予定購入と実購入の差額影響", formatYen(run.metrics.plannedActualImpact)], ["予算使用率", safePercent(run.metrics.budgetUsageRate)], ["高評価買い目への配分比率", safePercent(run.metrics.highPriorityAllocationRate)], ["的中買い目への配分比率", safePercent(run.metrics.hitAllocationRate)]].forEach(([label, value]) => appendKV(doc, node, label, value));
    }

    function renderWarnings(run) {
      const node = query("#phase22-learning-warning-list");
      if (!node) return;
      node.textContent = "";
      if (!run.warnings.length) node.appendChild(makeEl(doc, "div", "phase22-learning-warning notice", "警告はありません。"));
      run.warnings.forEach((warning) => node.appendChild(makeEl(doc, "div", `phase22-learning-warning ${warning.severity}`, `${warning.severity}: ${warning.message}`)));
    }

    function renderCategories() {
      const node = query("#phase22-learning-category-list");
      if (!node) return;
      node.textContent = "";
      CATEGORY_IDS.forEach(([id, label]) => {
        const review = state.plan.categoryReviews[id];
        const details = makeEl(doc, "details", "phase22-learning-category");
        const summary = makeEl(doc, "summary", "", label);
        details.appendChild(summary);
        const grid = makeEl(doc, "div", "phase22-learning-category-grid");
        const rating = makeEl(doc, "select");
        rating.dataset.phase22LearningCategory = `${id}:rating`;
        REVIEW_RATINGS.forEach((value) => {
          const option = makeEl(doc, "option", "", RATING_LABELS[value]);
          option.value = value;
          option.selected = review.rating === value;
          rating.appendChild(option);
        });
        grid.appendChild(labelWrap(doc, "評価", rating));
        const importance = makeEl(doc, "select");
        importance.dataset.phase22LearningCategory = `${id}:importance`;
        IMPORTANCE_LEVELS.forEach((value) => {
          const option = makeEl(doc, "option", "", IMPORTANCE_LABELS[value]);
          option.value = value;
          option.selected = review.importance === value;
          importance.appendChild(option);
        });
        grid.appendChild(labelWrap(doc, "重要度", importance));
        ["good", "improvement", "evidence", "nextAction"].forEach((field) => {
          const area = makeEl(doc, "textarea");
          area.dataset.phase22LearningCategory = `${id}:${field}`;
          area.value = review[field];
          grid.appendChild(labelWrap(doc, field === "good" ? "良かった点" : field === "improvement" ? "改善点" : field === "evidence" ? "根拠" : "次回対応", area));
        });
        const checkbox = makeEl(doc, "input");
        checkbox.type = "checkbox";
        checkbox.checked = review.learningCandidate;
        checkbox.dataset.phase22LearningCategory = `${id}:learningCandidate`;
        grid.appendChild(labelWrap(doc, "学習候補", checkbox));
        details.appendChild(grid);
        node.appendChild(details);
      });
    }

    function labelWrap(doc, label, control) {
      const wrapper = makeEl(doc, "label");
      wrapper.appendChild(makeEl(doc, "span", "", label));
      wrapper.appendChild(control);
      return wrapper;
    }

    function renderCandidates() {
      const node = query("#phase22-learning-candidate-list");
      if (!node) return;
      node.textContent = "";
      const table = makeEl(doc, "div", "phase22-learning-table");
      const header = makeEl(doc, "div", "phase22-learning-row head");
      ["ID", "カテゴリ", "タイトル", "内容", "根拠", "対象", "結果", "重要度", "信頼度", "適用範囲", "次回改善案", "承認", "コメント"].forEach((label) => header.appendChild(makeEl(doc, "span", "", label)));
      table.appendChild(header);
      state.plan.candidates.forEach((candidate) => {
        const row = makeEl(doc, "div", "phase22-learning-row");
        [candidate.id, candidate.category, candidate.title, candidate.body, candidate.evidence, candidate.targetHorse || candidate.targetTicketType || candidate.targetEvaluation || "未設定", OUTCOMES[candidate.outcome], IMPORTANCE_LABELS[candidate.importance], candidate.confidence, candidate.scope, candidate.nextAction].forEach((value) => row.appendChild(makeEl(doc, "span", "", value)));
        const select = makeEl(doc, "select");
        select.dataset.phase22LearningCandidateStatus = candidate.id;
        APPROVAL_STATUSES.forEach((status) => {
          const option = makeEl(doc, "option", "", APPROVAL_LABELS[status]);
          option.value = status;
          option.selected = candidate.approvalStatus === status;
          select.appendChild(option);
        });
        row.appendChild(select);
        const comment = makeEl(doc, "input");
        comment.dataset.phase22LearningCandidateComment = candidate.id;
        comment.value = candidate.comment;
        row.appendChild(comment);
        table.appendChild(row);
      });
      node.appendChild(table);
    }

    function renderOverall() {
      const confirmer = query("#phase22-learning-confirmer");
      if (confirmer) confirmer.value = state.plan.confirmerName;
      Object.entries(state.plan.overallReview).forEach(([key, value]) => {
        const node = query(`[data-phase22-learning-overall="${key}"]`);
        if (node) node.value = value;
      });
      FINAL_MEMO_KEYS.forEach((key) => {
        const node = query(`[data-phase22-learning-memo="${key}"]`);
        if (node) node.value = state.plan.finalMemos[key];
      });
      const status = query("#phase22-learning-finalized-status");
      if (status) status.textContent = state.plan.finalized ? `学習候補確定済み: ${state.plan.finalizedAt} / ${state.plan.confirmerName || "未設定"}` : "未確定";
    }

    function render() {
      const run = runtime();
      renderSummary(run);
      renderMetrics(run);
      renderWarnings(run);
      renderCategories();
      renderCandidates();
      renderOverall();
      setMessage(state.message, state.messageKind);
    }

    function reload() {
      readInputs();
      if (options.confirmReload && !options.confirmReload()) return;
      state.sources = loadAllSources(storage);
      const metrics = buildComparisonMetrics(state.sources);
      state.plan = normalizePlan(state.plan, generateLearningCandidates(state.sources, metrics));
      setMessage("Phase22-7データを再読込し、既存の振り返り入力を保持してマージしました。", "success");
      render();
    }

    function save() {
      readInputs();
      const run = runtime();
      const payload = buildPayload({ sources: state.sources, plan: state.plan, summary: run.summary, metrics: run.metrics, warnings: run.warnings });
      const result = saveReview(payload, storage);
      if (result.saved) {
        state.plan = normalizePlan(result.data, state.plan.candidates);
        state.savedLoad = { plan: state.plan, parseError: false };
        setMessage("学習候補・振り返りを保存しました。", "success");
      } else setMessage((result.errors || ["保存に失敗しました。"])[0], "error");
      render();
    }

    function restore() {
      const run = runtime();
      state.savedLoad = loadSavedReview(storage, generateLearningCandidates(state.sources, run.metrics));
      state.plan = state.savedLoad.plan;
      setMessage(state.savedLoad.parseError ? "Phase22-8保存データが破損しているため初期状態で復元しました。" : "Phase22-8保存データを復元しました。", state.savedLoad.parseError ? "warning" : "success");
      render();
    }

    function reset() {
      const result = deleteSavedReview(storage, options.confirmReset || (() => true));
      if (result.deleted) {
        const run = runtime();
        state.plan = normalizePlan({}, generateLearningCandidates(state.sources, run.metrics));
        setMessage("Phase22-8のみ初期化しました。", "success");
      } else setMessage("初期化を取り消しました。", "info");
      render();
    }

    function finalize() {
      readInputs();
      const run = runtime();
      const result = finalizeReview(state.plan, { sources: state.sources, plan: state.plan, warnings: run.warnings }, state.plan.confirmerName, options.confirmFinalize || (() => true));
      state.plan = result.plan;
      setMessage(result.finalized ? "学習候補を確定しました。自動学習・自動モデル更新・外部送信は行いません。" : `学習候補を確定できません: ${result.reasons.join(" / ")}`, result.finalized ? "success" : "error");
      render();
    }

    function unlock() {
      const result = unfinalizeReview(state.plan, options.confirmUnlock || (() => true));
      state.plan = result.plan;
      setMessage(result.unlocked ? "学習候補確定を解除しました。" : "確定解除を取り消しました。", result.unlocked ? "success" : "info");
      render();
    }

    function outputText(copy = false) {
      readInputs();
      const run = runtime();
      const value = generatePlainText({ sources: state.sources, summary: run.summary, metrics: run.metrics, plan: state.plan, warnings: run.warnings });
      const output = query("#phase22-learning-text-output");
      if (output) output.value = value;
      if (copy && root && root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
        root.navigator.clipboard.writeText(value).then(() => setMessage("テキストをクリップボードへコピーしました。", "success")).catch(() => setMessage("コピーに失敗しました。テキスト欄から手動コピーしてください。", "warning"));
      } else if (copy) setMessage("クリップボードを利用できません。テキスト欄から手動コピーしてください。", "warning");
      else setMessage("プレーンテキストを生成しました。", "success");
    }

    [
      ["#phase22-learning-reload", "click", reload],
      ["#phase22-learning-save", "click", save],
      ["#phase22-learning-restore", "click", restore],
      ["#phase22-learning-reset", "click", reset],
      ["#phase22-learning-finalize", "click", finalize],
      ["#phase22-learning-unlock", "click", unlock],
      ["#phase22-learning-print", "click", () => { if (root && root.print) root.print(); }],
      ["#phase22-learning-text", "click", () => outputText(false)],
      ["#phase22-learning-copy", "click", () => outputText(true)]
    ].forEach(([selector, event, handler]) => {
      const node = query(selector);
      if (node) node.addEventListener(event, handler);
    });
    render();
    return { reload, save, restore, reset, finalize, unlock, outputText, render, state };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindLearningReviewPanel({
      confirmReload: () => window.confirm("Phase22-7データを再読込します。既存の振り返り入力は可能な範囲で保持します。よろしいですか？"),
      confirmReset: () => window.confirm("Phase22-8の保存データだけを削除します。Phase22-1〜22-7は削除しません。よろしいですか？"),
      confirmFinalize: () => window.confirm("学習候補を確定します。自動学習・自動モデル更新・外部送信は行いません。よろしいですか？"),
      confirmUnlock: () => window.confirm("学習候補確定を解除します。よろしいですか？")
    });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    RACE_INPUT_STORAGE_KEY,
    PREDICTION_EVALUATION_STORAGE_KEY,
    FINAL_SUMMARY_STORAGE_KEY,
    TICKET_STORAGE_KEY,
    BUDGET_OPTIMIZATION_STORAGE_KEY,
    FINAL_PURCHASE_PLAN_STORAGE_KEY,
    ACTUAL_RESULT_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    CATEGORY_IDS,
    APPROVAL_STATUSES,
    FINAL_MEMO_KEYS,
    normalizeRace,
    normalizeTicket,
    normalizeActualResult,
    loadActualResult,
    loadAllSources,
    buildReviewSummary,
    buildComparisonMetrics,
    generateLearningCandidates,
    normalizeCandidate,
    mergeCandidates,
    normalizeCategoryReviews,
    normalizeOverallReview,
    normalizeActions,
    normalizeFinalMemos,
    normalizePlan,
    loadSavedReview,
    detectPhase227Changes,
    buildWarnings,
    canFinalize,
    buildPayload,
    saveReview,
    deleteSavedReview,
    finalizeReview,
    unfinalizeReview,
    setCandidateApproval,
    generatePlainText,
    bindLearningReviewPanel
  };
});
