(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase227ActualResultReconciliationCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RACE_INPUT_STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const FINAL_PURCHASE_PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPurchasePlanConfirmation.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.actualResultReconciliation.v1";
  const PROTECTED_STORAGE_KEYS = [RACE_INPUT_STORAGE_KEY, FINAL_PURCHASE_PLAN_STORAGE_KEY, STORAGE_KEY];
  const TICKET_TYPES = ["win", "place", "bracketQuinella", "quinella", "wide", "exacta", "trio", "trifecta"];
  const TICKET_LABELS = { win: "単勝", place: "複勝", bracketQuinella: "枠連", quinella: "馬連", wide: "ワイド", exacta: "馬単", trio: "三連複", trifecta: "三連単" };
  const RESULT_STATUSES = ["notEntered", "editing", "reconciled", "confirmed", "needsCorrection"];
  const PURCHASE_CONFIRMATION_STATUSES = ["unconfirmed", "confirmed", "needsReview", "corrected"];
  const CHECKLIST_ITEMS = [
    ["raceInfo", "レース情報を確認した"],
    ["officialResult", "着順を公式結果と照合した"],
    ["incident", "同着・降着・失格を確認した"],
    ["scratch", "出走取消・競走除外を確認した"],
    ["payout", "払戻金を確認した"],
    ["refund", "返還の有無を確認した"],
    ["actualPurchase", "実購入内容を確認した"],
    ["hitJudgement", "的中判定を確認した"],
    ["payoutTotal", "払戻総額を確認した"],
    ["profit", "収支を確認した"],
    ["roi", "回収率を確認した"],
    ["unknownTickets", "判定不能買い目を確認した"],
    ["userFinalCheck", "最終結果は利用者本人が確認した"]
  ];
  const MEMO_KEYS = ["impression", "hitFactor", "purchaseReflection", "budgetReflection", "dangerousReview", "longshotReview", "nextImprovement", "learningCandidate"];
  const MEMO_LABELS = {
    impression: "レース結果所感",
    hitFactor: "的中・不的中要因",
    purchaseReflection: "買い方の反省",
    budgetReflection: "予算配分の反省",
    dangerousReview: "危険人気馬評価",
    longshotReview: "穴馬評価",
    nextImprovement: "次回改善点",
    learningCandidate: "学習候補メモ"
  };
  const JUDGEMENT_LABELS = { hit: "的中", miss: "不的中", refund: "返還", unknown: "判定不能", needsReview: "要確認" };

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
      startTime: text(race.startTime || race.postTime),
      trackCondition: text(race.trackCondition || race.going),
      horseCount: text(race.horseCount || race.fieldSize || race.entryCount),
      raceId: text(race.raceId || input.sourceRaceKey || [raceDate, racecourse, raceNumber].filter(Boolean).join("|")),
      horses: Array.isArray(input.horses) ? input.horses.map((horse) => ({ horseNumber: text(horse.horseNumber), horseName: text(horse.horseName) })) : []
    };
  }

  function loadRaceInput(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { race: normalizeRace(), parseError: false };
    const raw = targetStorage.getItem(RACE_INPUT_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { race: normalizeRace(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function ticketKey(ticket) {
    return text(ticket.id) || `${text(ticket.type)}:${normalizeCombination(ticket.horseNumbers || ticket.combination, false)}`;
  }

  function normalizeHorseNumbers(value) {
    if (Array.isArray(value)) return value.map(text).filter(Boolean);
    return text(value).split(/[-,\s]+/).map(text).filter(Boolean);
  }

  function normalizeCombination(value, unordered = true) {
    const horses = normalizeHorseNumbers(value);
    const normalized = unordered ? [...horses].sort((a, b) => number(a, 0) - number(b, 0) || a.localeCompare(b)) : horses;
    return normalized.join("-");
  }

  function normalizeTicket(input = {}, index = 0) {
    const type = TICKET_TYPES.includes(input.type) ? input.type : "win";
    const horses = Array.isArray(input.horses) ? input.horses : [];
    const horseNumbers = Array.isArray(input.horseNumbers) ? input.horseNumbers.map(text).filter(Boolean) : normalizeHorseNumbers(input.combination || horses.map((horse) => horse.horseNumber));
    return {
      id: text(input.id) || `${type}-${index + 1}`,
      sourceIndex: number(input.sourceIndex ?? input.originalIndex, index),
      type,
      typeLabel: text(input.typeLabel) || TICKET_LABELS[type],
      combination: text(input.combination) || horseNumbers.join("-"),
      horseNumbers,
      horseNames: Array.isArray(input.horseNames) ? input.horseNames.map(text).filter(Boolean) : horses.map((horse) => text(horse.horseName)).filter(Boolean),
      marks: Array.isArray(input.marks) ? input.marks.map(text).filter(Boolean) : horses.map((horse) => text(horse.mark) || "無印").filter(Boolean),
      aiScores: Array.isArray(input.aiScores) ? input.aiScores.map(text).filter(Boolean) : horses.map((horse) => text(horse.aiScore)).filter(Boolean),
      plannedStake: yen(input.plannedStake ?? input.recommendedStake ?? input.stake, 0),
      finalConfirmationState: text(input.finalConfirmationState || input.confirmationState || "unconfirmed"),
      priorityScore: number(input.priorityScore, 0),
      dangerousPopular: Boolean(input.dangerousPopular) || horses.some((horse) => Boolean(horse.dangerousPopular)),
      longshot: Boolean(input.longshot) || horses.some((horse) => Boolean(horse.longshot)),
      divineLongshot: Boolean(input.divineLongshot) || horses.some((horse) => Boolean(horse.divineLongshot) || (Boolean(horse.longshot) && (text(horse.mark) === "☆" || number(horse.aiScore, 0) >= 80))),
      warnings: Array.isArray(input.warnings) ? input.warnings.map(text).filter(Boolean) : []
    };
  }

  function normalizeFinalPurchasePlan(input = {}) {
    const snapshotResults = input.phase225Snapshot && Array.isArray(input.phase225Snapshot.results) ? input.phase225Snapshot.results : [];
    const confirmationStates = input.confirmationStates || {};
    const tickets = snapshotResults.map((ticket, index) => {
      const normalized = normalizeTicket(ticket, index);
      return { ...normalized, finalConfirmationState: text(confirmationStates[ticketKey(normalized)] || confirmationStates[normalized.id] || normalized.finalConfirmationState || "unconfirmed") };
    }).filter((ticket) => ticket.plannedStake > 0);
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      confirmedAt: text(input.confirmedAt),
      confirmerName: text(input.confirmerName),
      tickets,
      raw: input
    };
  }

  function loadFinalPurchasePlan(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { plan: normalizeFinalPurchasePlan(), parseError: false };
    const raw = targetStorage.getItem(FINAL_PURCHASE_PLAN_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { plan: normalizeFinalPurchasePlan(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function normalizeRaceResult(input = {}) {
    return {
      first: text(input.first),
      second: text(input.second),
      third: text(input.third),
      fourth: text(input.fourth),
      fifth: text(input.fifth),
      deadHeat: Boolean(input.deadHeat),
      deadHeatInfo: text(input.deadHeatInfo),
      raceExclusions: text(input.raceExclusions),
      scratches: text(input.scratches),
      disqualifications: text(input.disqualifications),
      demotions: text(input.demotions),
      raceCanceled: Boolean(input.raceCanceled),
      invalidRace: Boolean(input.invalidRace),
      official: Boolean(input.official),
      resultStatus: RESULT_STATUSES.includes(input.resultStatus) ? input.resultStatus : "notEntered",
      confirmedAt: text(input.confirmedAt),
      memo: text(input.memo),
      placeTargetCount: Math.min(5, Math.max(1, Math.floor(number(input.placeTargetCount, 3)))),
      wideTargetCount: Math.min(5, Math.max(2, Math.floor(number(input.wideTargetCount, 3)))),
      noPurchaseRace: Boolean(input.noPurchaseRace)
    };
  }

  function validateRaceResult(result) {
    const placements = [result.first, result.second, result.third, result.fourth, result.fifth].filter(Boolean);
    const duplicate = placements.find((value, index) => placements.indexOf(value) !== index);
    const errors = [];
    if (!result.invalidRace && !result.raceCanceled && (!result.first || !result.second || !result.third)) errors.push("必須着順未入力です。");
    if (duplicate && !result.deadHeat) errors.push("着順重複があります。同着の場合は同着情報を有効にしてください。");
    return errors;
  }

  function normalizePayout(input = {}) {
    const type = TICKET_TYPES.includes(input.type) ? input.type : "win";
    return {
      id: text(input.id) || `${type}-${normalizeCombination(input.combination || "", type !== "exacta" && type !== "trifecta")}`,
      type,
      typeLabel: text(input.typeLabel) || TICKET_LABELS[type],
      combination: text(input.combination),
      amountPer100: yen(input.amountPer100 ?? input.payout, 0),
      unit: Math.max(100, yen(input.unit, 100) || 100),
      popularity: text(input.popularity),
      note: text(input.note)
    };
  }

  function normalizeRefund(input = {}) {
    return {
      id: text(input.id) || `refund-${text(input.type)}-${normalizeCombination(input.combination || "")}`,
      type: TICKET_TYPES.includes(input.type) ? input.type : "win",
      combination: text(input.combination),
      amount: yen(input.amount, 0),
      reason: text(input.reason)
    };
  }

  function normalizeActualPurchase(input = {}, sourceTicket = {}, index = 0) {
    const base = normalizeTicket({ ...sourceTicket, ...input }, index);
    return {
      ...base,
      id: text(input.id) || base.id,
      actualStake: yen(input.actualStake ?? input.plannedStake ?? base.plannedStake, base.plannedStake),
      purchased: input.purchased !== false && yen(input.actualStake ?? base.plannedStake, base.plannedStake) > 0,
      purchaseTime: text(input.purchaseTime),
      purchaseMethodMemo: text(input.purchaseMethodMemo),
      changeReason: text(input.changeReason),
      manualAdded: Boolean(input.manualAdded),
      manuallyDeleted: Boolean(input.manuallyDeleted),
      payoutReceived: yen(input.payoutReceived, 0),
      refundReceived: yen(input.refundReceived, 0),
      hitStatus: text(input.hitStatus || "unknown"),
      itemConfirmationState: PURCHASE_CONFIRMATION_STATUSES.includes(input.itemConfirmationState) ? input.itemConfirmationState : "unconfirmed"
    };
  }

  function createPurchasesFromPlan(plan, savedPurchases = []) {
    const savedByKey = new Map((savedPurchases || []).map((purchase) => [ticketKey(purchase), purchase]));
    const purchases = plan.tickets.map((ticket, index) => normalizeActualPurchase(savedByKey.get(ticketKey(ticket)) || {}, ticket, index));
    (savedPurchases || []).filter((purchase) => purchase.manualAdded).forEach((purchase, index) => {
      if (!purchases.some((row) => ticketKey(row) === ticketKey(purchase))) purchases.push(normalizeActualPurchase(purchase, {}, purchases.length + index));
    });
    return purchases;
  }

  function resultTop(result, count) {
    return [result.first, result.second, result.third, result.fourth, result.fifth].filter(Boolean).slice(0, count);
  }

  function judgeTicket(ticket, result) {
    if (result.invalidRace || result.raceCanceled) return { status: "needsReview", reason: "不成立・中止・返還を確認してください。" };
    const horses = ticket.horseNumbers;
    if (!horses.length) return { status: "unknown", reason: "馬番が未設定です。" };
    const top2 = resultTop(result, 2);
    const top3 = resultTop(result, 3);
    if (["win", "place", "wide"].includes(ticket.type) && !result.first) return { status: "unknown", reason: "着順不足です。" };
    if (["quinella", "exacta"].includes(ticket.type) && top2.length < 2) return { status: "unknown", reason: "1着・2着が未入力です。" };
    if (["trio", "trifecta"].includes(ticket.type) && top3.length < 3) return { status: "unknown", reason: "1着〜3着が未入力です。" };
    if (ticket.type === "win") return { status: horses.includes(result.first) ? "hit" : "miss", reason: "単勝は1着馬を含むかで判定" };
    if (ticket.type === "place") {
      const targets = resultTop(result, result.placeTargetCount);
      return { status: horses.some((horse) => targets.includes(horse)) ? "hit" : "miss", reason: `複勝は${result.placeTargetCount}着以内で判定` };
    }
    if (ticket.type === "quinella") return { status: normalizeCombination(horses) === normalizeCombination(top2) ? "hit" : "miss", reason: "馬連は1着・2着の順不同" };
    if (ticket.type === "wide") {
      const targets = resultTop(result, result.wideTargetCount);
      return { status: horses.every((horse) => targets.includes(horse)) ? "hit" : "miss", reason: `ワイドは${result.wideTargetCount}着以内の2頭` };
    }
    if (ticket.type === "exacta") return { status: normalizeCombination(horses, false) === normalizeCombination(top2, false) ? "hit" : "miss", reason: "馬単は1着・2着の順序一致" };
    if (ticket.type === "trio") return { status: normalizeCombination(horses) === normalizeCombination(top3) ? "hit" : "miss", reason: "三連複は1着〜3着の順不同" };
    if (ticket.type === "trifecta") return { status: normalizeCombination(horses, false) === normalizeCombination(top3, false) ? "hit" : "miss", reason: "三連単は1着〜3着の順序一致" };
    if (ticket.type === "bracketQuinella") return { status: "unknown", reason: "枠番号情報不足のため判定不能" };
    return { status: "unknown", reason: "判定不能" };
  }

  function payoutKey(type, combination) {
    const ordered = type === "exacta" || type === "trifecta" ? false : true;
    return `${type}:${normalizeCombination(combination, ordered)}`;
  }

  function findPayout(ticket, payouts) {
    const key = payoutKey(ticket.type, ticket.horseNumbers);
    return (payouts || []).find((payout) => payoutKey(payout.type, payout.combination) === key && payout.amountPer100 > 0) || null;
  }

  function reconcilePurchases(purchases, result, payouts = [], refunds = []) {
    return (purchases || []).map((purchase, index) => {
      const normalized = normalizeActualPurchase(purchase, purchase, index);
      const judgement = normalized.purchased ? judgeTicket(normalized, result) : { status: "miss", reason: "未購入" };
      const payout = judgement.status === "hit" ? findPayout(normalized, payouts) : null;
      const payoutAmount = payout ? Math.floor(normalized.actualStake / 100) * payout.amountPer100 : 0;
      const matchingRefunds = (refunds || []).filter((refund) => refund.type === normalized.type && normalizeCombination(refund.combination, normalized.type !== "exacta" && normalized.type !== "trifecta") === normalizeCombination(normalized.horseNumbers, normalized.type !== "exacta" && normalized.type !== "trifecta"));
      const refundAmount = matchingRefunds.reduce((sum, refund) => sum + yen(refund.amount), normalized.refundReceived);
      const totalReceived = payoutAmount + refundAmount + yen(normalized.payoutReceived, 0);
      const profit = totalReceived - (normalized.purchased ? normalized.actualStake : 0);
      const difference = normalized.actualStake - normalized.plannedStake;
      return {
        ...normalized,
        sequence: index + 1,
        judgement: refundAmount > 0 && judgement.status !== "hit" ? "refund" : judgement.status,
        judgementReason: judgement.reason,
        payoutPer100: payout ? payout.amountPer100 : 0,
        payoutTotal: payoutAmount + yen(normalized.payoutReceived, 0),
        refundTotal: refundAmount,
        totalReceived,
        profit,
        roi: normalized.actualStake > 0 ? totalReceived / normalized.actualStake * 100 : 0,
        difference,
        differenceType: classifyDifference(normalized, difference),
        warnings: buildPurchaseWarnings(normalized, judgement, payout, refundAmount)
      };
    });
  }

  function classifyDifference(purchase, difference) {
    if (purchase.manualAdded) return "追加購入";
    if (purchase.manuallyDeleted) return "除外";
    if (!purchase.purchased && purchase.plannedStake > 0) return "未購入";
    if (difference !== 0) return "金額変更";
    if (!purchase.horseNumbers.length) return "判定不能";
    return "予定どおり";
  }

  function buildPurchaseWarnings(purchase, judgement, payout, refundAmount) {
    const warnings = [];
    if (purchase.actualStake < 0) warnings.push("負数金額");
    if (judgement.status === "unknown") warnings.push("買い目判定不能");
    if (judgement.status === "needsReview") warnings.push("要確認");
    if (judgement.status === "hit" && !payout && purchase.payoutReceived <= 0) warnings.push("払戻入力なし");
    if (refundAmount > 0) warnings.push("返還あり");
    if (purchase.dangerousPopular) warnings.push("危険人気馬を含む");
    if (purchase.longshot || purchase.divineLongshot) warnings.push("穴馬・神穴候補を含む");
    if (purchase.manualAdded || purchase.changeReason) warnings.push("手動修正あり");
    return warnings;
  }

  function buildSummary(reconciled) {
    const purchased = reconciled.filter((item) => item.purchased && !item.manuallyDeleted);
    const plannedAmount = reconciled.reduce((sum, item) => sum + item.plannedStake, 0);
    const actualAmount = purchased.reduce((sum, item) => sum + item.actualStake, 0);
    const payoutTotal = purchased.reduce((sum, item) => sum + item.payoutTotal, 0);
    const refundTotal = purchased.reduce((sum, item) => sum + item.refundTotal, 0);
    const totalReceived = payoutTotal + refundTotal;
    const decidable = purchased.filter((item) => item.judgement === "hit" || item.judgement === "miss");
    const byType = {};
    TICKET_TYPES.forEach((type) => {
      const rows = purchased.filter((item) => item.type === type);
      const typePurchase = rows.reduce((sum, item) => sum + item.actualStake, 0);
      const typeReceived = rows.reduce((sum, item) => sum + item.payoutTotal + item.refundTotal, 0);
      byType[type] = {
        type,
        typeLabel: TICKET_LABELS[type],
        purchaseAmount: typePurchase,
        payoutAmount: rows.reduce((sum, item) => sum + item.payoutTotal, 0),
        refundAmount: rows.reduce((sum, item) => sum + item.refundTotal, 0),
        profit: typeReceived - typePurchase,
        roi: typePurchase > 0 ? typeReceived / typePurchase * 100 : 0
      };
    });
    return {
      plannedPoints: reconciled.filter((item) => item.plannedStake > 0).length,
      actualPoints: purchased.length,
      plannedAmount,
      actualAmount,
      hitPoints: purchased.filter((item) => item.judgement === "hit").length,
      missPoints: purchased.filter((item) => item.judgement === "miss").length,
      refundPoints: purchased.filter((item) => item.judgement === "refund").length,
      unknownPoints: purchased.filter((item) => item.judgement === "unknown" || item.judgement === "needsReview").length,
      payoutTotal,
      refundTotal,
      totalReceived,
      profit: totalReceived - actualAmount,
      roi: actualAmount > 0 ? totalReceived / actualAmount * 100 : 0,
      hitRate: decidable.length ? purchased.filter((item) => item.judgement === "hit").length / decidable.length * 100 : 0,
      plannedActualDifference: actualAmount - plannedAmount,
      dangerous: summarizeSubset(purchased.filter((item) => item.dangerousPopular)),
      longshot: summarizeSubset(purchased.filter((item) => item.longshot || item.divineLongshot)),
      byType
    };
  }

  function summarizeSubset(rows) {
    const purchaseAmount = rows.reduce((sum, item) => sum + item.actualStake, 0);
    const received = rows.reduce((sum, item) => sum + item.payoutTotal + item.refundTotal, 0);
    return { count: rows.length, purchaseAmount, received, profit: received - purchaseAmount, roi: purchaseAmount > 0 ? received / purchaseAmount * 100 : 0 };
  }

  function normalizeChecklist(input = {}) {
    const checklist = {};
    CHECKLIST_ITEMS.forEach(([id]) => {
      checklist[id] = Boolean(input[id]);
    });
    return checklist;
  }

  function checklistStatus(checklist) {
    const unchecked = CHECKLIST_ITEMS.filter(([id]) => !checklist[id]).length;
    return { unchecked, complete: unchecked === 0 };
  }

  function normalizeMemos(input = {}) {
    const memos = {};
    MEMO_KEYS.forEach((key) => {
      memos[key] = text(input[key]);
    });
    return memos;
  }

  function normalizePlan(input = {}, finalPlan = normalizeFinalPurchasePlan()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || finalPlan.sourceRaceKey),
      phase226SavedAt: text(input.phase226SavedAt || finalPlan.savedAt),
      raceResult: normalizeRaceResult(input.raceResult || {}),
      payouts: Array.isArray(input.payouts) ? input.payouts.map(normalizePayout) : defaultPayoutRows(),
      refunds: Array.isArray(input.refunds) ? input.refunds.map(normalizeRefund) : [],
      purchases: createPurchasesFromPlan(finalPlan, input.purchases || []),
      checklist: normalizeChecklist(input.checklist),
      resultStatus: RESULT_STATUSES.includes(input.resultStatus) ? input.resultStatus : "notEntered",
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      memos: normalizeMemos(input.memos),
      finalSummary: input.finalSummary || {},
      phase226Snapshot: input.phase226Snapshot || null
    };
  }

  function defaultPayoutRows() {
    return TICKET_TYPES.map((type) => normalizePayout({ type, id: `payout-${type}` }));
  }

  function loadSavedActualResult(storage, finalPlan) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { plan: normalizePlan({}, finalPlan), parseError: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { plan: normalizePlan(parsed || {}, finalPlan), parseError: Boolean(raw && !parsed) };
  }

  function detectPhase226Changes(currentPlan, savedPlan) {
    const snapshot = savedPlan && savedPlan.phase226Snapshot;
    if (!snapshot) return [];
    const changes = [];
    if (snapshot.savedAt && snapshot.savedAt !== currentPlan.savedAt) changes.push("Phase22-6の保存時刻が変わっています。");
    if (Boolean(snapshot.finalized) !== Boolean(currentPlan.finalized)) changes.push("Phase22-6の確定状態が変わっています。");
    const currentMap = new Map(currentPlan.tickets.map((ticket) => [ticketKey(ticket), ticket]));
    const savedMap = new Map((snapshot.tickets || []).map((ticket) => [ticketKey(ticket), normalizeTicket(ticket)]));
    currentMap.forEach((ticket, key) => {
      const before = savedMap.get(key);
      if (!before) changes.push(`買い目が追加されています: ${ticket.typeLabel} ${ticket.combination}`);
      else if (before.plannedStake !== ticket.plannedStake) changes.push(`予定金額が変更されています: ${ticket.typeLabel} ${ticket.combination}`);
    });
    savedMap.forEach((ticket, key) => {
      if (!currentMap.has(key)) changes.push(`買い目が削除されています: ${ticket.typeLabel} ${ticket.combination}`);
    });
    return changes;
  }

  function snapshotPhase226(plan) {
    return {
      savedAt: plan.savedAt,
      sourceRaceKey: plan.sourceRaceKey,
      finalized: plan.finalized,
      confirmedAt: plan.confirmedAt,
      confirmerName: plan.confirmerName,
      tickets: plan.tickets.map((ticket) => ({
        id: ticket.id,
        type: ticket.type,
        typeLabel: ticket.typeLabel,
        combination: ticket.combination,
        horseNumbers: ticket.horseNumbers,
        plannedStake: ticket.plannedStake,
        finalConfirmationState: ticket.finalConfirmationState
      }))
    };
  }

  function buildWarnings({ race, finalPlan, plan, reconciled, summary, parseErrors = [] }) {
    const warnings = [];
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ severity: "error", message }));
    validateRaceResult(plan.raceResult).forEach((message) => warnings.push({ severity: "error", message }));
    if (plan.sourceRaceKey && race.raceId && plan.sourceRaceKey !== race.raceId) warnings.push({ severity: "error", message: "raceId不一致です。" });
    if (reconciled.some((item) => item.actualStake < 0 || !Number.isFinite(item.actualStake))) warnings.push({ severity: "error", message: "数値異常または負数金額があります。" });
    if (reconciled.some((item) => item.judgement === "hit" && item.payoutTotal <= 0)) warnings.push({ severity: "error", message: "払戻額計算不能の的中買い目があります。" });
    if (!finalPlan.finalized) warnings.push({ severity: "warning", message: "Phase22-6が未確定です。" });
    detectPhase226Changes(finalPlan, plan).forEach((message) => warnings.push({ severity: "warning", message: `Phase22-6更新検知: ${message}` }));
    if (reconciled.some((item) => item.judgement === "unknown" || item.judgement === "needsReview")) warnings.push({ severity: "warning", message: "買い目判定不能または要確認があります。" });
    if (plan.raceResult.deadHeat && !plan.raceResult.deadHeatInfo) warnings.push({ severity: "warning", message: "同着情報未確認です。" });
    if (!plan.checklist.refund) warnings.push({ severity: "warning", message: "返還情報未確認です。" });
    if (Math.abs(summary.plannedActualDifference) >= 1000) warnings.push({ severity: "warning", message: "予定と実購入の大きな差額があります。" });
    if (!plan.payouts.some((payout) => payout.amountPer100 > 0)) warnings.push({ severity: "warning", message: "払戻入力なしです。" });
    if (!checklistStatus(plan.checklist).complete) warnings.push({ severity: "warning", message: `チェックリスト未完了です。未確認 ${checklistStatus(plan.checklist).unchecked}件` });
    if (reconciled.some((item) => item.dangerousPopular)) warnings.push({ severity: "notice", message: "危険人気馬を含む買い目があります。" });
    if (reconciled.some((item) => item.longshot || item.divineLongshot)) warnings.push({ severity: "notice", message: "穴馬・神穴候補を含む買い目があります。" });
    if (summary.actualAmount === 0) warnings.push({ severity: "notice", message: "実購入0円です。" });
    if (summary.actualPoints > 0 && summary.hitPoints === 0 && summary.unknownPoints === 0) warnings.push({ severity: "notice", message: "全買い目不的中です。" });
    if (summary.actualAmount > 0 && summary.roi < 100) warnings.push({ severity: "notice", message: "回収率100%未満です。" });
    if (reconciled.some((item) => item.manualAdded || item.changeReason)) warnings.push({ severity: "notice", message: "手動修正あり。" });
    return warnings;
  }

  function canFinalize({ plan, reconciled, warnings }) {
    const errors = warnings.filter((warning) => warning.severity === "error");
    const needsReview = reconciled.filter((item) => item.judgement === "unknown" || item.judgement === "needsReview" || item.itemConfirmationState === "needsReview").length;
    const hasPurchase = reconciled.some((item) => item.purchased && item.actualStake > 0);
    return {
      ok: plan.raceResult.official
        && (hasPurchase || plan.raceResult.noPurchaseRace)
        && plan.checklist.payout
        && plan.checklist.refund
        && needsReview === 0
        && checklistStatus(plan.checklist).complete
        && errors.length === 0,
      reasons: [
        plan.raceResult.official ? "" : "レース結果が確定済みではありません。",
        hasPurchase || plan.raceResult.noPurchaseRace ? "" : "実購入内容が1件以上必要です。",
        plan.checklist.payout && plan.checklist.refund ? "" : "払戻・返還情報の確認が必要です。",
        needsReview === 0 ? "" : "判定不能または要確認項目があります。",
        checklistStatus(plan.checklist).complete ? "" : "チェックリストが未完了です。",
        errors.length === 0 ? "" : "エラー警告があります。"
      ].filter(Boolean)
    };
  }

  function buildPayload({ plan, finalPlan, reconciled, summary }) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      sourceRaceKey: text(finalPlan.sourceRaceKey),
      phase226SavedAt: text(finalPlan.savedAt),
      raceResult: normalizeRaceResult(plan.raceResult),
      payouts: plan.payouts.map(normalizePayout),
      refunds: plan.refunds.map(normalizeRefund),
      purchases: plan.purchases.map((purchase) => normalizeActualPurchase(purchase, purchase)),
      reconciliation: reconciled,
      finalSummary: summary,
      checklist: normalizeChecklist(plan.checklist),
      resultStatus: plan.resultStatus,
      finalized: Boolean(plan.finalized),
      finalizedAt: text(plan.finalizedAt),
      confirmerName: text(plan.confirmerName),
      memos: normalizeMemos(plan.memos),
      phase226Snapshot: snapshotPhase226(finalPlan)
    };
  }

  function saveActualResult(payload, storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"] };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return { saved: true, data: payload };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return { saved: false, quotaExceeded, storageError: true, errors: [quotaExceeded ? "localStorageの容量が不足しているため実績結果を保存できませんでした。" : "localStorageへの保存に失敗しました。"] };
    }
  }

  function deleteSavedActualResult(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function finalizeActualResult(plan, state, confirmerName, confirmFinalize = () => false) {
    const result = canFinalize(state);
    if (!result.ok) return { finalized: false, reasons: result.reasons, plan };
    if (!confirmFinalize()) return { finalized: false, reasons: ["confirmation_required"], plan };
    return { finalized: true, plan: { ...plan, finalized: true, resultStatus: "confirmed", finalizedAt: new Date().toISOString(), confirmerName: text(confirmerName) || "未設定" } };
  }

  function unfinalizeActualResult(plan, confirmUnlock = () => false) {
    if (!confirmUnlock()) return { unlocked: false, reason: "confirmation_required", plan };
    return { unlocked: true, plan: { ...plan, finalized: false, resultStatus: "editing", finalizedAt: "" } };
  }

  function generatePlainText({ race, plan, reconciled, summary, warnings }) {
    const lines = [];
    lines.push("Phase22-7 実績結果入力・照合");
    lines.push(`レース: ${text(race.raceDate, "未設定")} ${text(race.racecourse, "未設定")} ${text(race.raceNumber, "未設定")} ${text(race.raceName, "未設定")}`);
    lines.push(`着順: 1着 ${text(plan.raceResult.first, "未設定")} / 2着 ${text(plan.raceResult.second, "未設定")} / 3着 ${text(plan.raceResult.third, "未設定")}`);
    lines.push(`購入 ${formatYen(summary.actualAmount)} / 払戻 ${formatYen(summary.payoutTotal)} / 返還 ${formatYen(summary.refundTotal)} / 収支 ${formatYen(summary.profit)} / 回収率 ${safePercent(summary.roi)}`);
    lines.push("");
    lines.push("実購入・照合:");
    reconciled.forEach((item) => lines.push(`- ${item.typeLabel} ${item.combination} ${formatYen(item.actualStake)} ${JUDGEMENT_LABELS[item.judgement] || item.judgement} 受取 ${formatYen(item.totalReceived)} 収支 ${formatYen(item.profit)}`));
    lines.push("");
    lines.push("払戻:");
    plan.payouts.filter((payout) => payout.amountPer100 > 0).forEach((payout) => lines.push(`- ${payout.typeLabel} ${payout.combination} ${formatYen(payout.amountPer100)} / ${payout.unit}円あたり`));
    lines.push("");
    lines.push("警告:");
    if (warnings.length) warnings.forEach((warning) => lines.push(`- [${warning.severity}] ${warning.message}`));
    else lines.push("- なし");
    Object.entries(MEMO_LABELS).forEach(([key, label]) => lines.push(`${label}: ${text(plan.memos[key], "未設定")}`));
    lines.push(`確定状態: ${plan.finalized ? `確定済み ${plan.finalizedAt} / ${plan.confirmerName || "未設定"}` : "未確定"}`);
    lines.push("結果は手動入力です。公式結果と必ず照合してください。外部送信・自動学習反映は行いません。");
    return lines.join("\n");
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function appendKV(doc, parent, label, value) {
    const item = makeEl(doc, "div", "phase22-actual-kv");
    item.appendChild(makeEl(doc, "span", "", label));
    item.appendChild(makeEl(doc, "strong", "", text(value, "未設定") || "未設定"));
    parent.appendChild(item);
  }

  function bindActualResultPanel(options = {}) {
    const doc = options.document || (root && root.document);
    const storage = getStorage(options.storage);
    if (!doc || !storage) return null;
    const rootNode = doc.querySelector("#phase22-actual-result-reconciliation-core");
    if (!rootNode || rootNode.dataset.phase22ActualResultBound === "true") return null;
    rootNode.dataset.phase22ActualResultBound = "true";

    const state = {
      raceLoad: loadRaceInput(storage),
      finalLoad: loadFinalPurchasePlan(storage),
      savedLoad: null,
      plan: null,
      message: "Phase22-6最終購入計画を保存・確定してから再読込してください。",
      messageKind: "info"
    };
    state.savedLoad = loadSavedActualResult(storage, state.finalLoad.plan);
    state.plan = state.savedLoad.plan;

    const query = (selector) => doc.querySelector(selector);
    const setMessage = (message, kind = "info") => {
      state.message = message;
      state.messageKind = kind;
      const node = query("#phase22-actual-message");
      if (node) {
        node.textContent = message;
        node.dataset.kind = kind;
      }
    };
    const runtime = () => {
      const reconciled = reconcilePurchases(state.plan.purchases, state.plan.raceResult, state.plan.payouts, state.plan.refunds);
      const summary = buildSummary(reconciled);
      const warnings = buildWarnings({
        race: state.raceLoad.race,
        finalPlan: state.finalLoad.plan,
        plan: state.plan,
        reconciled,
        summary,
        parseErrors: [
          state.raceLoad.parseError ? "破損データ読み込み: Phase22-1レース情報" : "",
          state.finalLoad.parseError ? "破損データ読み込み: Phase22-6最終購入計画" : "",
          state.savedLoad && state.savedLoad.parseError ? "破損データ読み込み: Phase22-7保存データ" : ""
        ]
      });
      return { reconciled, summary, warnings };
    };

    function readInputs() {
      ["first", "second", "third", "fourth", "fifth", "deadHeatInfo", "raceExclusions", "scratches", "disqualifications", "demotions", "confirmedAt", "memo"].forEach((key) => {
        const node = query(`[data-phase22-actual-result="${key}"]`);
        if (node) state.plan.raceResult[key] = text(node.value);
      });
      ["deadHeat", "raceCanceled", "invalidRace", "official", "noPurchaseRace"].forEach((key) => {
        const node = query(`[data-phase22-actual-result="${key}"]`);
        if (node) state.plan.raceResult[key] = Boolean(node.checked);
      });
      ["placeTargetCount", "wideTargetCount"].forEach((key) => {
        const node = query(`[data-phase22-actual-result="${key}"]`);
        if (node) state.plan.raceResult[key] = number(node.value, state.plan.raceResult[key]);
      });
      const resultStatus = query("#phase22-actual-result-status");
      if (resultStatus) state.plan.resultStatus = resultStatus.value;
      const confirmer = query("#phase22-actual-confirmer");
      if (confirmer) state.plan.confirmerName = text(confirmer.value);
      doc.querySelectorAll("[data-phase22-actual-check]").forEach((node) => {
        state.plan.checklist[node.dataset.phase22ActualCheck] = Boolean(node.checked);
      });
      doc.querySelectorAll("[data-phase22-actual-memo]").forEach((node) => {
        state.plan.memos[node.dataset.phase22ActualMemo] = text(node.value);
      });
      state.plan.payouts = Array.from(doc.querySelectorAll("[data-phase22-actual-payout-row]")).map((row, index) => normalizePayout({
        id: row.dataset.phase22ActualPayoutRow || `payout-${index}`,
        type: row.querySelector("[data-field='type']") ? row.querySelector("[data-field='type']").value : "win",
        combination: row.querySelector("[data-field='combination']") ? row.querySelector("[data-field='combination']").value : "",
        amountPer100: row.querySelector("[data-field='amountPer100']") ? row.querySelector("[data-field='amountPer100']").value : 0,
        unit: row.querySelector("[data-field='unit']") ? row.querySelector("[data-field='unit']").value : 100,
        popularity: row.querySelector("[data-field='popularity']") ? row.querySelector("[data-field='popularity']").value : "",
        note: row.querySelector("[data-field='note']") ? row.querySelector("[data-field='note']").value : ""
      }));
      doc.querySelectorAll("[data-phase22-actual-purchase-status]").forEach((node) => {
        const purchase = state.plan.purchases.find((item) => item.id === node.dataset.phase22ActualPurchaseStatus);
        if (purchase) purchase.itemConfirmationState = node.value;
      });
    }

    function renderRace() {
      const node = query("#phase22-actual-race-summary");
      if (!node) return;
      node.textContent = "";
      const race = state.raceLoad.race;
      [["開催日", race.raceDate], ["競馬場", race.racecourse], ["レース番号", race.raceNumber], ["レース名", race.raceName], ["距離", race.distance], ["コース", race.course], ["発走時刻", race.startTime], ["馬場状態", race.trackCondition], ["raceId", race.raceId]].forEach(([label, value]) => appendKV(doc, node, label, value));
    }

    function renderResultInputs() {
      Object.entries(state.plan.raceResult).forEach(([key, value]) => {
        const node = query(`[data-phase22-actual-result="${key}"]`);
        if (!node) return;
        if (node.type === "checkbox") node.checked = Boolean(value);
        else node.value = text(value);
      });
      const status = query("#phase22-actual-result-status");
      if (status) status.value = state.plan.resultStatus;
      const confirmer = query("#phase22-actual-confirmer");
      if (confirmer) confirmer.value = state.plan.confirmerName;
    }

    function renderSummary(run) {
      const node = query("#phase22-actual-summary");
      if (!node) return;
      node.textContent = "";
      const summary = run.summary;
      [["予定購入点数", `${summary.plannedPoints}点`], ["実購入点数", `${summary.actualPoints}点`], ["予定購入総額", formatYen(summary.plannedAmount)], ["実購入総額", formatYen(summary.actualAmount)], ["的中点数", `${summary.hitPoints}点`], ["不的中点数", `${summary.missPoints}点`], ["返還点数", `${summary.refundPoints}点`], ["判定不能点数", `${summary.unknownPoints}点`], ["払戻総額", formatYen(summary.payoutTotal)], ["返還総額", formatYen(summary.refundTotal)], ["総受取額", formatYen(summary.totalReceived)], ["収支", formatYen(summary.profit)], ["回収率", safePercent(summary.roi)], ["的中率", safePercent(summary.hitRate)], ["予定と実績の差額", formatYen(summary.plannedActualDifference)]].forEach(([label, value]) => appendKV(doc, node, label, value));
    }

    function renderWarnings(run) {
      const node = query("#phase22-actual-warning-list");
      if (!node) return;
      node.textContent = "";
      if (!run.warnings.length) node.appendChild(makeEl(doc, "div", "phase22-actual-warning notice", "警告はありません。"));
      run.warnings.forEach((warning) => node.appendChild(makeEl(doc, "div", `phase22-actual-warning ${warning.severity}`, `${warning.severity}: ${warning.message}`)));
    }

    function renderChecklist() {
      const node = query("#phase22-actual-checklist");
      if (!node) return;
      node.textContent = "";
      CHECKLIST_ITEMS.forEach(([id, label]) => {
        const wrapper = makeEl(doc, "label", "phase22-actual-check-item");
        const input = makeEl(doc, "input");
        input.type = "checkbox";
        input.checked = Boolean(state.plan.checklist[id]);
        input.dataset.phase22ActualCheck = id;
        input.addEventListener("change", () => {
          state.plan.checklist[id] = Boolean(input.checked);
          render();
        });
        wrapper.appendChild(input);
        wrapper.appendChild(makeEl(doc, "span", "", label));
        node.appendChild(wrapper);
      });
      const status = query("#phase22-actual-checklist-status");
      if (status) {
        const current = checklistStatus(state.plan.checklist);
        status.textContent = current.complete ? "結果確認完了" : `未確認 ${current.unchecked}件`;
      }
    }

    function renderPayouts() {
      const node = query("#phase22-actual-payout-list");
      if (!node) return;
      node.textContent = "";
      state.plan.payouts.forEach((payout, index) => {
        const row = makeEl(doc, "div", "phase22-actual-payout-row");
        row.dataset.phase22ActualPayoutRow = payout.id || `payout-${index}`;
        const type = makeEl(doc, "select");
        type.dataset.field = "type";
        TICKET_TYPES.forEach((ticketType) => {
          const option = makeEl(doc, "option", "", TICKET_LABELS[ticketType]);
          option.value = ticketType;
          option.selected = payout.type === ticketType;
          type.appendChild(option);
        });
        row.appendChild(type);
        [["combination", payout.combination, "的中組み合わせ"], ["amountPer100", payout.amountPer100, "払戻金額"], ["unit", payout.unit, "単位"], ["popularity", payout.popularity, "人気"], ["note", payout.note, "備考"]].forEach(([field, value, placeholder]) => {
          const input = makeEl(doc, "input");
          input.dataset.field = field;
          input.value = text(value);
          input.placeholder = placeholder;
          if (field === "amountPer100" || field === "unit") input.type = "number";
          row.appendChild(input);
        });
        node.appendChild(row);
      });
    }

    function renderPurchases(run) {
      const node = query("#phase22-actual-reconciliation-list");
      if (!node) return;
      node.textContent = "";
      const table = makeEl(doc, "div", "phase22-actual-table");
      const header = makeEl(doc, "div", "phase22-actual-row head");
      ["券種", "組み合わせ", "予定", "実購入", "差額", "状態", "判定", "払戻", "返還", "収支", "回収率", "差異", "警告", "確認"].forEach((label) => header.appendChild(makeEl(doc, "span", "", label)));
      table.appendChild(header);
      run.reconciled.forEach((item) => {
        const row = makeEl(doc, "div", "phase22-actual-row");
        [item.typeLabel, item.combination, formatYen(item.plannedStake), formatYen(item.actualStake), formatYen(item.difference), item.purchased ? "購入済み" : "未購入", JUDGEMENT_LABELS[item.judgement] || item.judgement, formatYen(item.payoutTotal), formatYen(item.refundTotal), formatYen(item.profit), safePercent(item.roi), item.differenceType, item.warnings.join(" / ") || "なし"].forEach((value) => row.appendChild(makeEl(doc, "span", "", value)));
        const select = makeEl(doc, "select");
        select.dataset.phase22ActualPurchaseStatus = item.id;
        PURCHASE_CONFIRMATION_STATUSES.forEach((status) => {
          const option = makeEl(doc, "option", "", status === "unconfirmed" ? "未確認" : status === "confirmed" ? "確認済み" : status === "needsReview" ? "要確認" : "修正済み");
          option.value = status;
          option.selected = item.itemConfirmationState === status;
          select.appendChild(option);
        });
        select.addEventListener("change", () => {
          const purchase = state.plan.purchases.find((rowItem) => rowItem.id === item.id);
          if (purchase) purchase.itemConfirmationState = select.value;
          render();
        });
        row.appendChild(select);
        table.appendChild(row);
      });
      node.appendChild(table);
    }

    function renderMemos() {
      MEMO_KEYS.forEach((key) => {
        const node = query(`[data-phase22-actual-memo="${key}"]`);
        if (node) node.value = state.plan.memos[key];
      });
    }

    function renderFinalStatus() {
      const node = query("#phase22-actual-finalized-status");
      if (node) node.textContent = state.plan.finalized ? `実績確定済み: ${state.plan.finalizedAt} / ${state.plan.confirmerName || "未設定"}` : "未確定";
    }

    function render() {
      const run = runtime();
      renderRace();
      renderResultInputs();
      renderSummary(run);
      renderWarnings(run);
      renderChecklist();
      renderPayouts();
      renderPurchases(run);
      renderMemos();
      renderFinalStatus();
      setMessage(state.message, state.messageKind);
    }

    function reload() {
      readInputs();
      if (options.confirmReload && !options.confirmReload()) return;
      state.raceLoad = loadRaceInput(storage);
      state.finalLoad = loadFinalPurchasePlan(storage);
      state.plan = normalizePlan(state.plan, state.finalLoad.plan);
      setMessage("Phase22-6データを再読込し、既存の実購入入力を保持してマージしました。", "success");
      render();
    }

    function save() {
      readInputs();
      const run = runtime();
      const payload = buildPayload({ plan: state.plan, finalPlan: state.finalLoad.plan, reconciled: run.reconciled, summary: run.summary });
      const result = saveActualResult(payload, storage);
      if (result.saved) {
        state.plan = normalizePlan(result.data, state.finalLoad.plan);
        state.savedLoad = { plan: state.plan, parseError: false };
        setMessage("実績結果を保存しました。", "success");
      } else setMessage((result.errors || ["保存に失敗しました。"])[0], "error");
      render();
    }

    function restore() {
      state.savedLoad = loadSavedActualResult(storage, state.finalLoad.plan);
      state.plan = state.savedLoad.plan;
      setMessage(state.savedLoad.parseError ? "Phase22-7保存データが破損しているため初期状態で復元しました。" : "Phase22-7保存データを復元しました。", state.savedLoad.parseError ? "warning" : "success");
      render();
    }

    function reset() {
      const result = deleteSavedActualResult(storage, options.confirmReset || (() => true));
      if (result.deleted) {
        state.plan = normalizePlan({}, state.finalLoad.plan);
        setMessage("Phase22-7のみ初期化しました。", "success");
      } else setMessage("初期化を取り消しました。", "info");
      render();
    }

    function finalize() {
      readInputs();
      const run = runtime();
      const result = finalizeActualResult(state.plan, { plan: state.plan, reconciled: run.reconciled, warnings: run.warnings }, state.plan.confirmerName, options.confirmFinalize || (() => true));
      state.plan = result.plan;
      setMessage(result.finalized ? "実績結果を確定しました。外部送信や自動学習反映は行いません。" : `実績確定できません: ${result.reasons.join(" / ")}`, result.finalized ? "success" : "error");
      render();
    }

    function unlock() {
      const result = unfinalizeActualResult(state.plan, options.confirmUnlock || (() => true));
      state.plan = result.plan;
      setMessage(result.unlocked ? "実績確定を解除しました。" : "確定解除を取り消しました。", result.unlocked ? "success" : "info");
      render();
    }

    function outputText(copy = false) {
      readInputs();
      const run = runtime();
      const value = generatePlainText({ race: state.raceLoad.race, plan: state.plan, reconciled: run.reconciled, summary: run.summary, warnings: run.warnings });
      const output = query("#phase22-actual-text-output");
      if (output) output.value = value;
      if (copy && root && root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
        root.navigator.clipboard.writeText(value).then(() => setMessage("テキストをクリップボードへコピーしました。", "success")).catch(() => setMessage("コピーに失敗しました。テキスト欄から手動コピーしてください。", "warning"));
      } else if (copy) setMessage("クリップボードを利用できません。テキスト欄から手動コピーしてください。", "warning");
      else setMessage("プレーンテキストを生成しました。", "success");
    }

    [
      ["#phase22-actual-reload", "click", reload],
      ["#phase22-actual-save", "click", save],
      ["#phase22-actual-restore", "click", restore],
      ["#phase22-actual-reset", "click", reset],
      ["#phase22-actual-finalize", "click", finalize],
      ["#phase22-actual-unlock", "click", unlock],
      ["#phase22-actual-print", "click", () => { if (root && root.print) root.print(); }],
      ["#phase22-actual-text", "click", () => outputText(false)],
      ["#phase22-actual-copy", "click", () => outputText(true)]
    ].forEach(([selector, event, handler]) => {
      const node = query(selector);
      if (node) node.addEventListener(event, handler);
    });
    MEMO_KEYS.forEach((key) => {
      const node = query(`[data-phase22-actual-memo="${key}"]`);
      if (node) node.addEventListener("input", () => { state.plan.memos[key] = text(node.value); });
    });
    render();
    return { reload, save, restore, reset, finalize, unlock, outputText, render, state };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindActualResultPanel({
      confirmReload: () => window.confirm("Phase22-6データを再読込します。既存の実績入力は可能な範囲で保持します。よろしいですか？"),
      confirmReset: () => window.confirm("Phase22-7の保存データだけを削除します。Phase22-1〜22-6は削除しません。よろしいですか？"),
      confirmFinalize: () => window.confirm("実績結果を確定します。外部送信や自動学習反映は行いません。よろしいですか？"),
      confirmUnlock: () => window.confirm("実績確定を解除します。よろしいですか？")
    });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    RACE_INPUT_STORAGE_KEY,
    FINAL_PURCHASE_PLAN_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    TICKET_TYPES,
    TICKET_LABELS,
    CHECKLIST_ITEMS,
    MEMO_KEYS,
    normalizeRace,
    loadRaceInput,
    normalizeTicket,
    normalizeFinalPurchasePlan,
    loadFinalPurchasePlan,
    normalizeRaceResult,
    validateRaceResult,
    normalizePayout,
    normalizeRefund,
    normalizeActualPurchase,
    createPurchasesFromPlan,
    judgeTicket,
    reconcilePurchases,
    buildSummary,
    normalizeChecklist,
    checklistStatus,
    normalizeMemos,
    normalizePlan,
    loadSavedActualResult,
    detectPhase226Changes,
    buildWarnings,
    canFinalize,
    buildPayload,
    saveActualResult,
    deleteSavedActualResult,
    finalizeActualResult,
    unfinalizeActualResult,
    generatePlainText,
    bindActualResultPanel
  };
});
