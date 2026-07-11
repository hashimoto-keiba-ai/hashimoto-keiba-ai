(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase226FinalPurchasePlanConfirmationCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RACE_INPUT_STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const PREDICTION_EVALUATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.predictionEvaluation.v1";
  const FINAL_SUMMARY_STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPredictionSummary.v1";
  const TICKET_STORAGE_KEY = "hashimotoKeibaAi.phase22.bettingTicketGeneration.v1";
  const BUDGET_OPTIMIZATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.budgetAllocationOptimization.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPurchasePlanConfirmation.v1";
  const PROTECTED_STORAGE_KEYS = [
    RACE_INPUT_STORAGE_KEY,
    PREDICTION_EVALUATION_STORAGE_KEY,
    FINAL_SUMMARY_STORAGE_KEY,
    TICKET_STORAGE_KEY,
    BUDGET_OPTIMIZATION_STORAGE_KEY,
    STORAGE_KEY
  ];
  const TICKET_TYPES = ["win", "place", "quinella", "wide", "exacta", "trio", "trifecta"];
  const TICKET_LABELS = { win: "単勝", place: "複勝", quinella: "馬連", wide: "ワイド", exacta: "馬単", trio: "三連複", trifecta: "三連単" };
  const CONFIRMATION_STATUSES = ["unconfirmed", "confirmed", "hold", "excludePlanned"];
  const CONFIRMATION_LABELS = { unconfirmed: "未確認", confirmed: "確認済み", hold: "保留", excludePlanned: "除外予定" };
  const MEMO_KEYS = ["policy", "typeMemo", "caution", "purchaseOrder", "skipCondition", "lastMinute"];
  const MEMO_LABELS = {
    policy: "最終購入方針",
    typeMemo: "券種別メモ",
    caution: "注意事項",
    purchaseOrder: "購入順序メモ",
    skipCondition: "見送り条件",
    lastMinute: "レース直前確認メモ"
  };
  const CHECKLIST_ITEMS = [
    ["raceInfo", "レース情報を確認した"],
    ["scratches", "出走取消・除外馬を確認した"],
    ["horseIdentity", "馬番と馬名を確認した"],
    ["ticketType", "券種を確認した"],
    ["combination", "組み合わせを確認した"],
    ["amount", "金額を確認した"],
    ["budget", "総予算を確認した"],
    ["dangerousWarning", "危険人気馬の警告を確認した"],
    ["longshot", "穴馬・神穴候補を確認した"],
    ["startTime", "発走時刻を確認した"],
    ["deadline", "購入締切に余裕があることを確認した"],
    ["notAutoVoting", "自動投票ではないことを理解した"],
    ["userDecision", "最終判断は利用者本人が行うことを確認した"]
  ];

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
    if (!Number.isFinite(parsed) || parsed < 0) return "0.0%";
    return `${parsed.toFixed(1)}%`;
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

  function ticketKey(ticket) {
    return text(ticket.id) || `${text(ticket.type)}:${text(ticket.combination)}:${(ticket.horseNumbers || []).map(text).join("-")}`;
  }

  function hasDanger(ticket) {
    return Boolean(ticket.dangerousPopular)
      || (Array.isArray(ticket.warnings) && ticket.warnings.some((warning) => text(warning).includes("危険人気馬")))
      || (Array.isArray(ticket.horses) && ticket.horses.some((horse) => Boolean(horse.dangerousPopular)));
  }

  function hasLongshot(ticket) {
    return Boolean(ticket.longshot) || (Array.isArray(ticket.horses) && ticket.horses.some((horse) => Boolean(horse.longshot)));
  }

  function hasDivineLongshot(ticket) {
    return Boolean(ticket.divineLongshot)
      || (Array.isArray(ticket.horses) && ticket.horses.some((horse) => Boolean(horse.divineLongshot) || (Boolean(horse.longshot) && (text(horse.mark) === "☆" || number(horse.aiScore, 0) >= 80))));
  }

  function normalizeRace(input = {}) {
    const race = input.race || input.raceInfo || input;
    const racecourse = text(race.racecourse || race.courseName || race.track);
    const raceNumber = text(race.raceNumber || race.number);
    const raceDate = text(race.raceDate || race.date);
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
      raceId: text(race.raceId || input.sourceRaceKey || [raceDate, racecourse, raceNumber].filter(Boolean).join("|"))
    };
  }

  function loadRaceInput(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { race: normalizeRace(), parseError: false };
    const parsed = safeParseJson(targetStorage.getItem(RACE_INPUT_STORAGE_KEY));
    return { race: normalizeRace(parsed || {}), parseError: Boolean(targetStorage.getItem(RACE_INPUT_STORAGE_KEY) && !parsed) };
  }

  function normalizeTicket(input = {}, index = 0) {
    const type = TICKET_TYPES.includes(input.type) ? input.type : "win";
    const horses = Array.isArray(input.horses) ? input.horses : [];
    const horseNumbers = Array.isArray(input.horseNumbers) ? input.horseNumbers.map(text) : horses.map((horse) => text(horse.horseNumber));
    const recommendedStake = yen(input.recommendedStake ?? input.stake ?? input.amount, 0);
    return {
      id: text(input.id) || `${type}-${index + 1}`,
      originalIndex: number(input.originalIndex, index),
      rank: number(input.rank, index + 1),
      type,
      typeLabel: text(input.typeLabel) || TICKET_LABELS[type],
      combination: text(input.combination) || horseNumbers.join("-"),
      horseNumbers,
      horseNames: horses.map((horse) => text(horse.horseName)).filter(Boolean),
      marks: horses.map((horse) => text(horse.mark) || "無印").filter(Boolean),
      aiScores: horses.map((horse) => text(horse.aiScore)).filter(Boolean),
      horses: horses.map((horse) => ({
        horseNumber: text(horse.horseNumber),
        horseName: text(horse.horseName),
        mark: text(horse.mark) || "無印",
        aiScore: text(horse.aiScore),
        dangerousPopular: Boolean(horse.dangerousPopular),
        longshot: Boolean(horse.longshot),
        divineLongshot: Boolean(horse.divineLongshot)
      })),
      warnings: Array.isArray(input.warnings) ? input.warnings.map(text).filter(Boolean) : [],
      constraintWarnings: Array.isArray(input.constraintWarnings) ? input.constraintWarnings.map(text).filter(Boolean) : [],
      priorityScore: Math.max(0, number(input.priorityScore, 0)),
      recommendedStake,
      allocationReason: text(input.allocationReason || input.reason),
      adopted: input.adopted !== false && recommendedStake > 0,
      dangerousPopular: hasDanger(input),
      longshot: hasLongshot(input),
      divineLongshot: hasDivineLongshot(input)
    };
  }

  function normalizePhase225Payload(input = {}) {
    const results = Array.isArray(input.results) ? input.results.map(normalizeTicket) : [];
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      phase224SavedAt: text(input.phase224SavedAt),
      settings: input.settings || {},
      summary: input.summary || {},
      results
    };
  }

  function loadPhase225Optimization(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { payload: normalizePhase225Payload(), parseError: false };
    const raw = targetStorage.getItem(BUDGET_OPTIMIZATION_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { payload: normalizePhase225Payload(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function normalizeChecklist(input = {}) {
    const checklist = {};
    CHECKLIST_ITEMS.forEach(([id]) => {
      checklist[id] = Boolean(input[id]);
    });
    return checklist;
  }

  function normalizeMemos(input = {}) {
    const memos = {};
    MEMO_KEYS.forEach((key) => {
      memos[key] = text(input[key]);
    });
    return memos;
  }

  function normalizeConfirmationStates(input = {}) {
    const states = {};
    Object.entries(input || {}).forEach(([key, value]) => {
      states[text(key)] = CONFIRMATION_STATUSES.includes(value) ? value : "unconfirmed";
    });
    return states;
  }

  function mergeConfirmationStates(tickets, saved = {}) {
    const states = normalizeConfirmationStates(saved);
    tickets.forEach((ticket) => {
      const key = ticketKey(ticket);
      if (!states[key]) states[key] = "unconfirmed";
    });
    return states;
  }

  function normalizePlan(input = {}, sourceTickets = []) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      phase225SavedAt: text(input.phase225SavedAt),
      confirmationStates: mergeConfirmationStates(sourceTickets, input.confirmationStates),
      checklist: normalizeChecklist(input.checklist),
      memos: normalizeMemos(input.memos),
      sortMode: text(input.sortMode) || "priority",
      excludePlannedFromTotals: input.excludePlannedFromTotals !== false,
      finalized: Boolean(input.finalized),
      confirmedAt: text(input.confirmedAt),
      confirmerName: text(input.confirmerName),
      finalSummary: input.finalSummary || {},
      phase225Snapshot: input.phase225Snapshot || null
    };
  }

  function loadSavedFinalPlan(storage, sourceTickets = []) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { plan: normalizePlan({}, sourceTickets), parseError: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { plan: normalizePlan(parsed || {}, sourceTickets), parseError: Boolean(raw && !parsed) };
  }

  function activeTickets(tickets, states, excludePlannedFromTotals = true) {
    return tickets.filter((ticket) => {
      if (!ticket.adopted || ticket.recommendedStake <= 0) return false;
      return !(excludePlannedFromTotals && states[ticketKey(ticket)] === "excludePlanned");
    });
  }

  function groupByType(tickets) {
    const groups = {};
    TICKET_TYPES.forEach((type) => {
      groups[type] = [];
    });
    tickets.forEach((ticket) => {
      groups[ticket.type] = groups[ticket.type] || [];
      groups[ticket.type].push(ticket);
    });
    return groups;
  }

  function buildAggregates(tickets, states = {}, budget = 0, excludePlannedFromTotals = true) {
    const active = activeTickets(tickets, states, excludePlannedFromTotals);
    const totalAmount = active.reduce((sum, ticket) => sum + yen(ticket.recommendedStake), 0);
    const safeBudget = yen(budget);
    const byType = {};
    TICKET_TYPES.forEach((type) => {
      const rows = active.filter((ticket) => ticket.type === type);
      const amount = rows.reduce((sum, ticket) => sum + yen(ticket.recommendedStake), 0);
      byType[type] = { type, typeLabel: TICKET_LABELS[type], count: rows.length, amount, ratio: totalAmount ? amount / totalAmount * 100 : 0 };
    });
    const scores = active.map((ticket) => number(ticket.priorityScore, 0)).filter(Number.isFinite);
    return {
      totalPoints: active.length,
      totalAmount,
      budget: safeBudget,
      unusedBudget: Math.max(0, safeBudget - totalAmount),
      usageRatio: safeBudget ? totalAmount / safeBudget * 100 : 0,
      byType,
      dangerousCount: active.filter(hasDanger).length,
      dangerousAmount: active.filter(hasDanger).reduce((sum, ticket) => sum + yen(ticket.recommendedStake), 0),
      longshotCount: active.filter(hasLongshot).length,
      longshotAmount: active.filter(hasLongshot).reduce((sum, ticket) => sum + yen(ticket.recommendedStake), 0),
      divineLongshotCount: active.filter(hasDivineLongshot).length,
      divineLongshotAmount: active.filter(hasDivineLongshot).reduce((sum, ticket) => sum + yen(ticket.recommendedStake), 0),
      maxPriority: scores.length ? Math.max(...scores) : 0,
      minPriority: scores.length ? Math.min(...scores) : 0,
      averagePriority: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      overBudget: safeBudget > 0 && totalAmount > safeBudget
    };
  }

  function checklistStatus(checklist) {
    const unchecked = CHECKLIST_ITEMS.filter(([id]) => !checklist[id]).length;
    return { unchecked, complete: unchecked === 0 };
  }

  function detectPhase225Changes(current, savedPlan) {
    const snapshot = savedPlan && savedPlan.phase225Snapshot;
    if (!snapshot) return [];
    const changes = [];
    if (text(snapshot.savedAt) && text(snapshot.savedAt) !== text(current.savedAt)) changes.push("Phase22-5の保存時刻が変わっています。");
    const currentMap = new Map((current.results || []).map((ticket) => [ticketKey(ticket), ticket]));
    const savedMap = new Map((snapshot.results || []).map((ticket) => [ticketKey(ticket), normalizeTicket(ticket)]));
    currentMap.forEach((ticket, key) => {
      const before = savedMap.get(key);
      if (!before) changes.push(`買い目が追加されています: ${ticket.typeLabel} ${ticket.combination}`);
      else if (yen(before.recommendedStake) !== yen(ticket.recommendedStake)) changes.push(`金額が変更されています: ${ticket.typeLabel} ${ticket.combination}`);
    });
    savedMap.forEach((ticket, key) => {
      if (!currentMap.has(key)) changes.push(`買い目が削除されています: ${ticket.typeLabel} ${ticket.combination}`);
    });
    return changes;
  }

  function buildWarnings({ race, tickets, aggregates, checklist, phase225, savedPlan, parseErrors = [] }) {
    const warnings = [];
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ severity: "error", message }));
    if (!tickets.length) warnings.push({ severity: "error", message: "買い目0件です。Phase22-5で最適化結果を保存してください。" });
    if (aggregates.totalAmount <= 0) warnings.push({ severity: "error", message: "金額0円のため最終確定できません。" });
    if (aggregates.overBudget) warnings.push({ severity: "error", message: "総購入予定額が総予算を超えています。" });
    if (tickets.some((ticket) => yen(ticket.recommendedStake) % 100 !== 0)) warnings.push({ severity: "error", message: "100円単位でない金額があります。" });
    if (!text(race.raceId)) warnings.push({ severity: "warning", message: "レース情報未設定です。" });
    if (!text(race.startTime)) warnings.push({ severity: "notice", message: "発走時刻未設定です。" });
    if (tickets.some(hasDanger)) warnings.push({ severity: "warning", message: "危険人気馬を含む買い目があります。" });
    if (tickets.some((ticket) => (ticket.constraintWarnings || []).length > 0)) warnings.push({ severity: "warning", message: "制約警告を含む買い目があります。" });
    if (tickets.some((ticket) => savedPlan.confirmationStates[ticketKey(ticket)] === "unconfirmed")) warnings.push({ severity: "warning", message: "未確認買い目があります。" });
    const checklistResult = checklistStatus(checklist);
    if (!checklistResult.complete) warnings.push({ severity: "warning", message: `チェックリスト未完了です。未確認 ${checklistResult.unchecked}件` });
    detectPhase225Changes(phase225, savedPlan).forEach((message) => warnings.push({ severity: "notice", message: `Phase22-5データ更新検知: ${message}` }));
    if (savedPlan.sourceRaceKey && phase225.sourceRaceKey && savedPlan.sourceRaceKey !== phase225.sourceRaceKey) warnings.push({ severity: "warning", message: "raceIdが変わっています。別レースの可能性があります。" });
    return warnings;
  }

  function canFinalize({ tickets, aggregates, checklist, warnings }) {
    const errorWarnings = (warnings || []).filter((warning) => warning.severity === "error");
    const amountUnitOk = tickets.every((ticket) => yen(ticket.recommendedStake) % 100 === 0);
    return {
      ok: tickets.length > 0 && aggregates.totalAmount > 0 && !aggregates.overBudget && amountUnitOk && checklistStatus(checklist).complete && errorWarnings.length === 0,
      reasons: [
        tickets.length ? "" : "採用買い目がありません。",
        aggregates.totalAmount > 0 ? "" : "総購入予定額が0円です。",
        !aggregates.overBudget ? "" : "予算超過があります。",
        amountUnitOk ? "" : "100円単位でない金額があります。",
        checklistStatus(checklist).complete ? "" : "必須チェックリストが未完了です。",
        errorWarnings.length === 0 ? "" : "エラー警告があります。"
      ].filter(Boolean)
    };
  }

  function snapshotPhase225(payload) {
    return {
      savedAt: text(payload.savedAt),
      sourceRaceKey: text(payload.sourceRaceKey),
      results: (payload.results || []).map((ticket) => ({
        id: ticket.id,
        type: ticket.type,
        typeLabel: ticket.typeLabel,
        combination: ticket.combination,
        horseNumbers: ticket.horseNumbers,
        recommendedStake: ticket.recommendedStake,
        adopted: ticket.adopted
      }))
    };
  }

  function buildPayload({ plan, phase225, aggregates }) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      sourceRaceKey: text(phase225.sourceRaceKey),
      phase225SavedAt: text(phase225.savedAt),
      confirmationStates: normalizeConfirmationStates(plan.confirmationStates),
      checklist: normalizeChecklist(plan.checklist),
      memos: normalizeMemos(plan.memos),
      sortMode: text(plan.sortMode) || "priority",
      excludePlannedFromTotals: plan.excludePlannedFromTotals !== false,
      finalized: Boolean(plan.finalized),
      confirmedAt: text(plan.confirmedAt),
      confirmerName: text(plan.confirmerName),
      finalSummary: aggregates,
      phase225Snapshot: snapshotPhase225(phase225)
    };
  }

  function saveFinalPlan(input, storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"] };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(input));
      return { saved: true, data: input };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return { saved: false, quotaExceeded, storageError: true, errors: [quotaExceeded ? "localStorageの容量が不足しているため最終購入計画を保存できませんでした。" : "localStorageへの保存に失敗しました。"] };
    }
  }

  function deleteSavedFinalPlan(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function finalizePlan(plan, state, confirmerName, confirmFinalize = () => false) {
    const result = canFinalize(state);
    if (!result.ok) return { finalized: false, reasons: result.reasons, plan };
    if (!confirmFinalize()) return { finalized: false, reasons: ["confirmation_required"], plan };
    return { finalized: true, plan: { ...plan, finalized: true, confirmedAt: new Date().toISOString(), confirmerName: text(confirmerName) || "未設定" } };
  }

  function unfinalizePlan(plan, confirmUnlock = () => false) {
    if (!confirmUnlock()) return { unlocked: false, reason: "confirmation_required", plan };
    return { unlocked: true, plan: { ...plan, finalized: false, confirmedAt: "" } };
  }

  function sortTickets(tickets, mode = "priority") {
    const rows = [...(tickets || [])];
    if (mode === "amount") return rows.sort((a, b) => yen(b.recommendedStake) - yen(a.recommendedStake) || a.rank - b.rank);
    if (mode === "type") return rows.sort((a, b) => TICKET_TYPES.indexOf(a.type) - TICKET_TYPES.indexOf(b.type) || a.rank - b.rank);
    if (mode === "original") return rows.sort((a, b) => a.originalIndex - b.originalIndex);
    return rows.sort((a, b) => number(b.priorityScore) - number(a.priorityScore) || a.rank - b.rank);
  }

  function generatePlainText({ race, tickets, aggregates, warnings, checklist, memos, plan }) {
    const lines = [];
    lines.push("Phase22-6 最終購入計画");
    lines.push(`レース: ${text(race.raceDate, "未設定")} ${text(race.racecourse, "未設定")} ${text(race.raceNumber, "未設定")} ${text(race.raceName, "未設定")}`);
    lines.push(`距離/コース: ${text(race.distance, "未設定")} / ${text(race.course, "未設定")} / 発走 ${text(race.startTime, "未設定")}`);
    lines.push(`合計: ${aggregates.totalPoints}点 / ${formatYen(aggregates.totalAmount)} / 予算 ${formatYen(aggregates.budget)}`);
    lines.push("");
    groupTicketsForText(sortTickets(tickets, plan.sortMode)).forEach((line) => lines.push(line));
    lines.push("");
    lines.push("警告:");
    if (warnings.length) warnings.forEach((warning) => lines.push(`- [${warning.severity}] ${warning.message}`));
    else lines.push("- なし");
    lines.push("");
    lines.push(`チェックリスト: ${checklistStatus(checklist).complete ? "完了" : `未完了 ${checklistStatus(checklist).unchecked}件`}`);
    Object.entries(MEMO_LABELS).forEach(([key, label]) => {
      lines.push(`${label}: ${text(memos[key], "未設定")}`);
    });
    lines.push(`確定状態: ${plan.finalized ? `確定済み ${plan.confirmedAt} / ${plan.confirmerName || "未設定"}` : "未確定"}`);
    lines.push("自動購入・自動投票・外部送信は行いません。");
    return lines.join("\n");
  }

  function groupTicketsForText(tickets) {
    const lines = [];
    const groups = groupByType(tickets);
    TICKET_TYPES.forEach((type) => {
      const rows = groups[type] || [];
      if (!rows.length) return;
      lines.push(`[${TICKET_LABELS[type]}]`);
      rows.forEach((ticket, index) => {
        lines.push(`${index + 1}. ${ticket.combination} ${ticket.horseNames.join("/")} ${formatYen(ticket.recommendedStake)} 優先度 ${number(ticket.priorityScore).toFixed(1)}`);
      });
    });
    return lines;
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function appendKV(doc, parent, label, value) {
    const item = makeEl(doc, "div", "phase22-final-purchase-kv");
    item.appendChild(makeEl(doc, "span", "", label));
    item.appendChild(makeEl(doc, "strong", "", text(value, "未設定") || "未設定"));
    parent.appendChild(item);
  }

  function bindFinalPurchasePlanPanel(options = {}) {
    const doc = options.document || (root && root.document);
    const storage = getStorage(options.storage);
    if (!doc || !storage) return null;
    const rootNode = doc.querySelector("#phase22-final-purchase-plan-confirmation-core");
    if (!rootNode || rootNode.dataset.phase22FinalPurchaseBound === "true") return null;
    rootNode.dataset.phase22FinalPurchaseBound = "true";

    const state = {
      raceLoad: loadRaceInput(storage),
      phase225Load: loadPhase225Optimization(storage),
      savedLoad: null,
      plan: null,
      message: "Phase22-5最適化結果を保存してから再読込してください。",
      messageKind: "info"
    };
    state.savedLoad = loadSavedFinalPlan(storage, state.phase225Load.payload.results);
    state.plan = state.savedLoad.plan;

    const query = (selector) => doc.querySelector(selector);
    const setMessage = (message, kind = "info") => {
      state.message = message;
      state.messageKind = kind;
      const node = query("#phase22-final-purchase-message");
      if (node) {
        node.textContent = message;
        node.dataset.kind = kind;
      }
    };
    const getRuntime = () => {
      const activePhase225 = state.phase225Load.payload;
      const tickets = (activePhase225.results || []).filter((ticket) => ticket.adopted && ticket.recommendedStake > 0);
      const budget = yen(activePhase225.summary && activePhase225.summary.budget, yen(activePhase225.settings && activePhase225.settings.constraints && activePhase225.settings.constraints.budget, 0));
      const aggregates = buildAggregates(tickets, state.plan.confirmationStates, budget, state.plan.excludePlannedFromTotals);
      const warnings = buildWarnings({
        race: state.raceLoad.race,
        tickets,
        aggregates,
        checklist: state.plan.checklist,
        phase225: activePhase225,
        savedPlan: state.plan,
        parseErrors: [
          state.raceLoad.parseError ? "破損データ読み込み: Phase22-1レース情報" : "",
          state.phase225Load.parseError ? "破損データ読み込み: Phase22-5最適化結果" : "",
          state.savedLoad && state.savedLoad.parseError ? "破損データ読み込み: Phase22-6保存データ" : ""
        ]
      });
      return { tickets, budget, aggregates, warnings, phase225: activePhase225 };
    };

    function readInputs() {
      const sort = query("#phase22-final-purchase-sort");
      if (sort) state.plan.sortMode = sort.value;
      const exclude = query("#phase22-final-purchase-exclude-planned");
      if (exclude) state.plan.excludePlannedFromTotals = Boolean(exclude.checked);
      const confirmer = query("#phase22-final-purchase-confirmer");
      if (confirmer) state.plan.confirmerName = text(confirmer.value);
      doc.querySelectorAll("[data-phase22-final-purchase-check]").forEach((node) => {
        state.plan.checklist[node.dataset.phase22FinalPurchaseCheck] = Boolean(node.checked);
      });
      doc.querySelectorAll("[data-phase22-final-purchase-memo]").forEach((node) => {
        state.plan.memos[node.dataset.phase22FinalPurchaseMemo] = text(node.value);
      });
      doc.querySelectorAll("[data-phase22-final-purchase-status]").forEach((node) => {
        state.plan.confirmationStates[node.dataset.phase22FinalPurchaseStatus] = node.value;
      });
    }

    function renderRace() {
      const node = query("#phase22-final-purchase-race-summary");
      if (!node) return;
      node.textContent = "";
      const race = state.raceLoad.race;
      [
        ["開催日", race.raceDate],
        ["競馬場", race.racecourse],
        ["レース番号", race.raceNumber],
        ["レース名", race.raceName],
        ["距離", race.distance],
        ["コース", race.course],
        ["発走時刻", race.startTime],
        ["馬場状態", race.trackCondition],
        ["頭数", race.horseCount],
        ["raceId", race.raceId]
      ].forEach(([label, value]) => appendKV(doc, node, label, value));
    }

    function renderSummary(runtime) {
      const node = query("#phase22-final-purchase-summary");
      if (!node) return;
      const a = runtime.aggregates;
      node.textContent = "";
      [
        ["総購入点数", `${a.totalPoints}点`],
        ["総購入予定額", formatYen(a.totalAmount)],
        ["総予算", formatYen(a.budget)],
        ["未使用予算", formatYen(a.unusedBudget)],
        ["予算使用率", safePercent(a.usageRatio)],
        ["危険人気馬", `${a.dangerousCount}点 / ${formatYen(a.dangerousAmount)}`],
        ["穴馬", `${a.longshotCount}点 / ${formatYen(a.longshotAmount)}`],
        ["神穴候補", `${a.divineLongshotCount}点 / ${formatYen(a.divineLongshotAmount)}`],
        ["優先度", `最高 ${a.maxPriority.toFixed(1)} / 最低 ${a.minPriority.toFixed(1)} / 平均 ${a.averagePriority.toFixed(1)}`]
      ].forEach(([label, value]) => appendKV(doc, node, label, value));
      TICKET_TYPES.forEach((type) => {
        const row = a.byType[type];
        appendKV(doc, node, row.typeLabel, `${row.count}点 / ${formatYen(row.amount)} / ${safePercent(row.ratio)}`);
      });
    }

    function renderWarnings(runtime) {
      const node = query("#phase22-final-purchase-warning-list");
      if (!node) return;
      node.textContent = "";
      if (!runtime.warnings.length) {
        node.appendChild(makeEl(doc, "div", "phase22-final-purchase-warning notice", "警告はありません。"));
        return;
      }
      runtime.warnings.forEach((warning) => {
        node.appendChild(makeEl(doc, "div", `phase22-final-purchase-warning ${warning.severity}`, `${warning.severity}: ${warning.message}`));
      });
    }

    function renderChecklist() {
      const node = query("#phase22-final-purchase-checklist");
      if (!node) return;
      node.textContent = "";
      CHECKLIST_ITEMS.forEach(([id, label]) => {
        const wrapper = makeEl(doc, "label", "phase22-final-purchase-check-item");
        const input = makeEl(doc, "input");
        input.type = "checkbox";
        input.checked = Boolean(state.plan.checklist[id]);
        input.dataset.phase22FinalPurchaseCheck = id;
        input.addEventListener("change", () => {
          state.plan.checklist[id] = Boolean(input.checked);
          render();
        });
        wrapper.appendChild(input);
        wrapper.appendChild(makeEl(doc, "span", "", label));
        node.appendChild(wrapper);
      });
      const status = query("#phase22-final-purchase-checklist-status");
      if (status) {
        const current = checklistStatus(state.plan.checklist);
        status.textContent = current.complete ? "最終確認完了" : `未確認 ${current.unchecked}件`;
        status.dataset.kind = current.complete ? "success" : "warning";
      }
    }

    function renderMemos() {
      MEMO_KEYS.forEach((key) => {
        const node = query(`[data-phase22-final-purchase-memo="${key}"]`);
        if (node && node.value !== state.plan.memos[key]) node.value = state.plan.memos[key];
      });
    }

    function renderTickets(runtime) {
      const node = query("#phase22-final-purchase-list");
      if (!node) return;
      node.textContent = "";
      const rows = sortTickets(runtime.tickets, state.plan.sortMode);
      const groups = groupByType(rows);
      TICKET_TYPES.forEach((type) => {
        const tickets = groups[type] || [];
        const details = makeEl(doc, "details", "phase22-final-purchase-type");
        details.open = true;
        const summary = makeEl(doc, "summary", "", `${TICKET_LABELS[type]} ${tickets.length}点`);
        details.appendChild(summary);
        const wrap = makeEl(doc, "div", "phase22-final-purchase-table-wrap");
        const table = makeEl(doc, "div", "phase22-final-purchase-table");
        const header = makeEl(doc, "div", "phase22-final-purchase-row head");
        ["No", "券種", "組み合わせ", "馬番", "馬名", "印", "AI", "優先度", "金額", "理由", "警告", "確認"].forEach((label) => header.appendChild(makeEl(doc, "span", "", label)));
        table.appendChild(header);
        if (!tickets.length) table.appendChild(makeEl(doc, "div", "phase22-final-purchase-empty", "該当なし"));
        tickets.forEach((ticket, index) => {
          const row = makeEl(doc, "div", "phase22-final-purchase-row");
          row.appendChild(makeEl(doc, "span", "", String(index + 1)));
          row.appendChild(makeEl(doc, "span", "", ticket.typeLabel));
          row.appendChild(makeEl(doc, "span", "", ticket.combination));
          row.appendChild(makeEl(doc, "span", "", ticket.horseNumbers.join("-") || "未設定"));
          row.appendChild(makeEl(doc, "span", "", ticket.horseNames.join(" / ") || "未設定"));
          row.appendChild(makeEl(doc, "span", "", ticket.marks.join(" / ") || "未設定"));
          row.appendChild(makeEl(doc, "span", "", ticket.aiScores.join(" / ") || "未設定"));
          row.appendChild(makeEl(doc, "span", "", number(ticket.priorityScore).toFixed(1)));
          row.appendChild(makeEl(doc, "span", "", formatYen(ticket.recommendedStake)));
          row.appendChild(makeEl(doc, "span", "", ticket.allocationReason || "未設定"));
          row.appendChild(makeEl(doc, "span", "", [...ticket.warnings, ...ticket.constraintWarnings].join(" / ") || "なし"));
          const select = makeEl(doc, "select");
          select.dataset.phase22FinalPurchaseStatus = ticketKey(ticket);
          CONFIRMATION_STATUSES.forEach((status) => {
            const option = makeEl(doc, "option", "", CONFIRMATION_LABELS[status]);
            option.value = status;
            option.selected = (state.plan.confirmationStates[ticketKey(ticket)] || "unconfirmed") === status;
            select.appendChild(option);
          });
          select.addEventListener("change", () => {
            state.plan.confirmationStates[ticketKey(ticket)] = select.value;
            render();
          });
          row.appendChild(select);
          table.appendChild(row);
        });
        wrap.appendChild(table);
        details.appendChild(wrap);
        node.appendChild(details);
      });
    }

    function renderControls() {
      const sort = query("#phase22-final-purchase-sort");
      if (sort) sort.value = state.plan.sortMode;
      const exclude = query("#phase22-final-purchase-exclude-planned");
      if (exclude) exclude.checked = state.plan.excludePlannedFromTotals !== false;
      const confirmer = query("#phase22-final-purchase-confirmer");
      if (confirmer && confirmer.value !== state.plan.confirmerName) confirmer.value = state.plan.confirmerName;
      const final = query("#phase22-final-purchase-finalized-status");
      if (final) final.textContent = state.plan.finalized ? `確定済み: ${state.plan.confirmedAt} / ${state.plan.confirmerName || "未設定"}` : "未確定";
    }

    function render() {
      const runtime = getRuntime();
      renderRace();
      renderSummary(runtime);
      renderWarnings(runtime);
      renderChecklist();
      renderMemos();
      renderTickets(runtime);
      renderControls();
      setMessage(state.message, state.messageKind);
    }

    function reload() {
      readInputs();
      const hasManual = Object.values(state.plan.confirmationStates).some((value) => value !== "unconfirmed") || Object.values(state.plan.memos).some(Boolean) || Object.values(state.plan.checklist).some(Boolean);
      if (hasManual && options.confirmReload && !options.confirmReload()) return;
      state.raceLoad = loadRaceInput(storage);
      state.phase225Load = loadPhase225Optimization(storage);
      state.plan = normalizePlan({ ...state.plan, confirmationStates: state.plan.confirmationStates }, state.phase225Load.payload.results);
      setMessage("Phase22-5データを再読込しました。", "success");
      render();
    }

    function save() {
      readInputs();
      const runtime = getRuntime();
      const payload = buildPayload({ plan: state.plan, phase225: runtime.phase225, aggregates: runtime.aggregates });
      const result = saveFinalPlan(payload, storage);
      if (result.saved) {
        state.plan = normalizePlan(result.data, runtime.tickets);
        state.savedLoad = { plan: state.plan, parseError: false };
        setMessage("最終購入計画を保存しました。", "success");
      } else setMessage((result.errors || ["保存に失敗しました。"])[0], "error");
      render();
    }

    function restore() {
      state.savedLoad = loadSavedFinalPlan(storage, state.phase225Load.payload.results);
      state.plan = state.savedLoad.plan;
      setMessage(state.savedLoad.parseError ? "Phase22-6保存データが破損しているため初期状態で復元しました。" : "Phase22-6保存データを復元しました。", state.savedLoad.parseError ? "warning" : "success");
      render();
    }

    function reset() {
      const result = deleteSavedFinalPlan(storage, options.confirmReset || (() => true));
      if (result.deleted) {
        state.plan = normalizePlan({}, state.phase225Load.payload.results);
        setMessage("Phase22-6のみ初期化しました。", "success");
      } else setMessage("初期化を取り消しました。", "info");
      render();
    }

    function finalize() {
      readInputs();
      const runtime = getRuntime();
      const result = finalizePlan(state.plan, { tickets: runtime.tickets, aggregates: runtime.aggregates, checklist: state.plan.checklist, warnings: runtime.warnings }, state.plan.confirmerName, options.confirmFinalize || (() => true));
      state.plan = result.plan;
      setMessage(result.finalized ? "最終購入計画を確定しました。自動購入・自動投票は行いません。" : `最終確定できません: ${result.reasons.join(" / ")}`, result.finalized ? "success" : "error");
      render();
    }

    function unlock() {
      const result = unfinalizePlan(state.plan, options.confirmUnlock || (() => true));
      state.plan = result.plan;
      setMessage(result.unlocked ? "最終確定を解除しました。" : "確定解除を取り消しました。", result.unlocked ? "success" : "info");
      render();
    }

    function outputText(copy = false) {
      readInputs();
      const runtime = getRuntime();
      const textValue = generatePlainText({ race: state.raceLoad.race, tickets: runtime.tickets, aggregates: runtime.aggregates, warnings: runtime.warnings, checklist: state.plan.checklist, memos: state.plan.memos, plan: state.plan });
      const output = query("#phase22-final-purchase-text-output");
      if (output) output.value = textValue;
      if (copy && root && root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
        root.navigator.clipboard.writeText(textValue).then(() => setMessage("テキストをクリップボードへコピーしました。", "success")).catch(() => setMessage("コピーに失敗しました。テキスト欄から手動コピーしてください。", "warning"));
      } else if (copy) setMessage("クリップボードを利用できません。テキスト欄から手動コピーしてください。", "warning");
      else setMessage("プレーンテキストを生成しました。", "success");
    }

    [
      ["#phase22-final-purchase-reload", "click", reload],
      ["#phase22-final-purchase-save", "click", save],
      ["#phase22-final-purchase-restore", "click", restore],
      ["#phase22-final-purchase-reset", "click", reset],
      ["#phase22-final-purchase-finalize", "click", finalize],
      ["#phase22-final-purchase-unlock", "click", unlock],
      ["#phase22-final-purchase-print", "click", () => { if (root && root.print) root.print(); }],
      ["#phase22-final-purchase-text", "click", () => outputText(false)],
      ["#phase22-final-purchase-copy", "click", () => outputText(true)],
      ["#phase22-final-purchase-sort", "change", () => { readInputs(); render(); }],
      ["#phase22-final-purchase-exclude-planned", "change", () => { readInputs(); render(); }]
    ].forEach(([selector, event, handler]) => {
      const node = query(selector);
      if (node) node.addEventListener(event, handler);
    });
    MEMO_KEYS.forEach((key) => {
      const node = query(`[data-phase22-final-purchase-memo="${key}"]`);
      if (node) node.addEventListener("input", () => { state.plan.memos[key] = text(node.value); });
    });
    render();
    return { reload, save, restore, reset, finalize, unlock, render, outputText, state };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindFinalPurchasePlanPanel({
      confirmReload: () => window.confirm("手動確認状態やメモを保持したままPhase22-5データを再読込しますか？"),
      confirmReset: () => window.confirm("Phase22-6の保存データだけを削除します。Phase22-1〜22-5は削除しません。よろしいですか？"),
      confirmFinalize: () => window.confirm("最終購入計画を確定します。自動購入・自動投票・外部送信は行いません。よろしいですか？"),
      confirmUnlock: () => window.confirm("最終確定を解除します。よろしいですか？")
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
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    TICKET_TYPES,
    TICKET_LABELS,
    CONFIRMATION_STATUSES,
    CHECKLIST_ITEMS,
    MEMO_KEYS,
    normalizeRace,
    loadRaceInput,
    normalizeTicket,
    normalizePhase225Payload,
    loadPhase225Optimization,
    normalizeChecklist,
    normalizeMemos,
    normalizeConfirmationStates,
    normalizePlan,
    loadSavedFinalPlan,
    buildAggregates,
    checklistStatus,
    detectPhase225Changes,
    buildWarnings,
    canFinalize,
    buildPayload,
    saveFinalPlan,
    deleteSavedFinalPlan,
    finalizePlan,
    unfinalizePlan,
    sortTickets,
    generatePlainText,
    bindFinalPurchasePlanPanel
  };
});
