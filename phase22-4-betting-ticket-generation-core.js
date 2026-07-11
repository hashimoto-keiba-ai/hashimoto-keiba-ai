(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase224BettingTicketGenerationCore = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RACE_INPUT_STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const PREDICTION_EVALUATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.predictionEvaluation.v1";
  const FINAL_SUMMARY_STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPredictionSummary.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.bettingTicketGeneration.v1";
  const PROTECTED_CLEANUP_KEYS = [RACE_INPUT_STORAGE_KEY, PREDICTION_EVALUATION_STORAGE_KEY, FINAL_SUMMARY_STORAGE_KEY, STORAGE_KEY];
  const TICKET_TYPES = ["win", "place", "quinella", "wide", "exacta", "trio", "trifecta"];
  const TICKET_LABELS = { win: "単勝", place: "複勝", quinella: "馬連", wide: "ワイド", exacta: "馬単", trio: "三連複", trifecta: "三連単" };
  const UNORDERED_TYPES = new Set(["quinella", "wide", "trio"]);
  const REQUIRED_COUNTS = { win: 1, place: 1, quinella: 2, wide: 2, exacta: 2, trio: 3, trifecta: 3 };
  const MARK_ORDER = { "◎": 1, "○": 2, "▲": 3, "△": 4, "☆": 5, "注": 6, "消": 7, "無印": 8 };

  const phase223 = (() => {
    if (root && root.HashimotoPhase223FinalPredictionSummaryCore) return root.HashimotoPhase223FinalPredictionSummaryCore;
    if (typeof module === "object" && module.exports) return require("./phase22-3-final-prediction-summary-core.js");
    return null;
  })();
  const cleanupApi = (() => {
    if (root && root.HashimotoPhase22LocalStorageCleanup) return root.HashimotoPhase22LocalStorageCleanup;
    if (typeof module === "object" && module.exports) return require("./phase22-local-storage-cleanup.js");
    return null;
  })();

  function getStorage(storage) {
    return storage || (root && root.localStorage) || null;
  }

  function text(value) {
    return String(value ?? "").trim();
  }

  function numberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function safeParseJson(raw) {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function yen(value, fallback = 100) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return fallback;
    return Math.min(1000000, Math.max(100, Math.round(number / 100) * 100));
  }

  function intValue(value, fallback, min = 1, max = 999) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function defaultSettings() {
    return {
      budget: 3000,
      baseStake: 100,
      maxTickets: 60,
      includeDangerousPopular: false,
      prioritizeLongshots: true,
      includeDivineLongshots: true,
      allowBox: true,
      applyTrifectaLimit: true,
      enabledTypes: TICKET_TYPES.reduce((map, type) => ({ ...map, [type]: true }), {})
    };
  }

  function normalizeSettings(input = {}) {
    const base = defaultSettings();
    const enabledTypes = { ...base.enabledTypes, ...(input.enabledTypes || {}) };
    TICKET_TYPES.forEach((type) => {
      enabledTypes[type] = enabledTypes[type] !== false;
    });
    return {
      budget: yen(input.budget, base.budget),
      baseStake: yen(input.baseStake, base.baseStake),
      maxTickets: intValue(input.maxTickets, base.maxTickets, 1, 999),
      includeDangerousPopular: Boolean(input.includeDangerousPopular),
      prioritizeLongshots: input.prioritizeLongshots !== false,
      includeDivineLongshots: input.includeDivineLongshots !== false,
      allowBox: input.allowBox !== false,
      applyTrifectaLimit: input.applyTrifectaLimit !== false,
      enabledTypes
    };
  }

  function loadAggregate(storage) {
    if (!phase223) {
      return { raceSummary: {}, sourceRaceKey: "", evaluations: [], ranking: [], markSummary: [], candidateSummary: { keyCandidates: [], opponentCandidates: [], holdCandidates: [] }, riskSummary: { dangerousPopular: [], longshots: [], divineLongshots: [] } };
    }
    return phase223.buildAggregate(phase223.loadRaceInput(storage), phase223.loadPredictionEvaluation(storage));
  }

  function horseNumberValue(horse) {
    return numberOrNull(horse && horse.horseNumber) ?? Number.POSITIVE_INFINITY;
  }

  function byRank(a, b) {
    const aScore = numberOrNull(a.aiScore);
    const bScore = numberOrNull(b.aiScore);
    if (aScore !== null && bScore !== null && bScore !== aScore) return bScore - aScore;
    if (aScore !== null && bScore === null) return -1;
    if (aScore === null && bScore !== null) return 1;
    const markDiff = (MARK_ORDER[a.mark] || 99) - (MARK_ORDER[b.mark] || 99);
    if (markDiff !== 0) return markDiff;
    return horseNumberValue(a) - horseNumberValue(b);
  }

  function uniqueHorses(horses = []) {
    const seen = new Set();
    return horses.filter((horse) => {
      const key = text(horse && horse.horseNumber);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getSourceGroups(aggregate, settings) {
    const evaluations = uniqueHorses(aggregate.evaluations || []).sort(byRank);
    const dangerousNumbers = new Set((aggregate.riskSummary?.dangerousPopular || []).map((horse) => text(horse.horseNumber)));
    const allowed = settings.includeDangerousPopular ? evaluations : evaluations.filter((horse) => !dangerousNumbers.has(text(horse.horseNumber)));
    const byMark = (mark) => allowed.filter((horse) => horse.mark === mark);
    const anchors = uniqueHorses([
      ...byMark("◎"),
      ...(aggregate.candidateSummary?.keyCandidates || []),
      allowed[0]
    ]).sort(byRank);
    const mainOpponents = uniqueHorses([
      ...byMark("○"),
      ...byMark("▲"),
      ...(aggregate.candidateSummary?.opponentCandidates || [])
    ]).sort(byRank);
    const holds = uniqueHorses([
      ...byMark("△"),
      ...byMark("☆"),
      ...byMark("注"),
      ...(aggregate.candidateSummary?.holdCandidates || [])
    ]).sort(byRank);
    const longshots = settings.prioritizeLongshots ? uniqueHorses(aggregate.riskSummary?.longshots || []).sort(byRank) : [];
    const divineLongshots = settings.includeDivineLongshots ? uniqueHorses(aggregate.riskSummary?.divineLongshots || []).sort(byRank) : [];
    return { evaluations, allowed, dangerousNumbers, anchors, mainOpponents, holds, longshots, divineLongshots };
  }

  function normalizeCombination(type, horses) {
    const unique = uniqueHorses(horses);
    if (unique.length !== REQUIRED_COUNTS[type]) return null;
    const ordered = UNORDERED_TYPES.has(type) ? [...unique].sort((a, b) => horseNumberValue(a) - horseNumberValue(b)) : unique;
    return ordered;
  }

  function ticketKey(type, horses) {
    const numbers = horses.map((horse) => text(horse.horseNumber));
    return `${type}:${numbers.join("-")}`;
  }

  function buildTicket(type, horses, reason, settings, manual = false, selected = true) {
    const normalized = normalizeCombination(type, horses);
    if (!normalized) return null;
    const warnings = [];
    if (normalized.some((horse) => horse.dangerousPopular)) warnings.push("危険人気馬を含みます");
    if (normalized.some((horse) => horse.longshot)) warnings.push("穴馬を含みます");
    if (normalized.some((horse) => horse.mark === "消")) warnings.push("消し印を含みます");
    return {
      id: "",
      type,
      typeLabel: TICKET_LABELS[type],
      combination: normalized.map((horse) => text(horse.horseNumber)).join("-"),
      horseNumbers: normalized.map((horse) => text(horse.horseNumber)),
      horses: normalized.map((horse) => ({
        horseNumber: text(horse.horseNumber),
        horseName: text(horse.horseName),
        mark: text(horse.mark) || "無印",
        aiScore: text(horse.aiScore),
        dangerousPopular: Boolean(horse.dangerousPopular),
        longshot: Boolean(horse.longshot)
      })),
      reason,
      stake: settings.baseStake,
      selected: Boolean(selected),
      manual: Boolean(manual),
      warnings
    };
  }

  function addTicket(list, seen, ticket) {
    if (!ticket) return;
    const key = ticketKey(ticket.type, ticket.horses);
    if (seen.has(key)) {
      const existing = list.find((item) => ticketKey(item.type, item.horses) === key);
      if (existing && ticket.reason && !existing.reason.includes(ticket.reason)) existing.reason = `${existing.reason} / ${ticket.reason}`;
      return;
    }
    seen.add(key);
    ticket.id = `${ticket.type}-${list.length + 1}-${ticket.combination}`;
    list.push(ticket);
  }

  function pairwise(left, right, callback) {
    left.forEach((a) => {
      right.forEach((b) => callback(a, b));
    });
  }

  function combinations(items, size) {
    const result = [];
    const walk = (start, combo) => {
      if (combo.length === size) {
        result.push(combo);
        return;
      }
      for (let index = start; index < items.length; index += 1) walk(index + 1, [...combo, items[index]]);
    };
    walk(0, []);
    return result;
  }

  function trifectaRecommendedLimit(fieldSize) {
    const size = Number(fieldSize) || 0;
    if (size <= 10) return 8;
    if (size <= 14) return 12;
    return 16;
  }

  function generateTickets(aggregate, inputSettings = {}) {
    const settings = normalizeSettings(inputSettings);
    const groups = getSourceGroups(aggregate || {}, settings);
    const list = [];
    const seen = new Set();
    const use = (type) => settings.enabledTypes[type] !== false;
    const anchors = groups.anchors.slice(0, 3);
    const main = groups.mainOpponents.slice(0, 5);
    const holds = groups.holds.slice(0, 5);
    const longshots = groups.longshots.slice(0, 4);
    const divine = groups.divineLongshots.slice(0, 3);
    const opponents = uniqueHorses([...main, ...holds, ...longshots, ...divine]).sort(byRank);
    const boxPool = uniqueHorses([...anchors, ...main, ...holds, ...longshots]).sort(byRank).slice(0, 5);

    if (use("win")) uniqueHorses([...anchors.slice(0, 1), ...longshots.slice(0, 1)]).forEach((horse) => addTicket(list, seen, buildTicket("win", [horse], horse.longshot ? "穴馬候補の単勝" : "主軸候補の単勝", settings)));
    if (use("place")) uniqueHorses([...anchors, ...longshots, ...divine]).slice(0, 5).forEach((horse) => addTicket(list, seen, buildTicket("place", [horse], horse.longshot ? "穴馬・神穴候補の複勝" : "軸候補の複勝", settings)));

    if (use("quinella")) {
      pairwise(anchors, opponents, (a, b) => addTicket(list, seen, buildTicket("quinella", [a, b], "軸－相手の馬連", settings)));
      if (settings.allowBox) combinations(boxPool.slice(0, 4), 2).forEach((combo) => addTicket(list, seen, buildTicket("quinella", combo, "馬連BOX", settings)));
    }
    if (use("wide")) {
      pairwise(anchors, uniqueHorses([...opponents, ...longshots]), (a, b) => addTicket(list, seen, buildTicket("wide", [a, b], b.longshot ? "穴馬を含むワイド" : "軸－相手のワイド", settings)));
      if (settings.allowBox) combinations(boxPool, 2).forEach((combo) => addTicket(list, seen, buildTicket("wide", combo, "ワイドBOX", settings)));
    }
    if (use("exacta")) {
      pairwise(anchors, opponents, (a, b) => {
        addTicket(list, seen, buildTicket("exacta", [a, b], "馬単1着固定", settings));
        addTicket(list, seen, buildTicket("exacta", [b, a], "馬単2着固定・表裏", settings));
      });
      if (settings.allowBox) {
        combinations(boxPool.slice(0, 4), 2).forEach(([a, b]) => {
          addTicket(list, seen, buildTicket("exacta", [a, b], "馬単BOX", settings));
          addTicket(list, seen, buildTicket("exacta", [b, a], "馬単BOX", settings));
        });
      }
    }
    if (use("trio")) {
      anchors.slice(0, 2).forEach((anchor) => combinations(opponents, 2).forEach((pair) => addTicket(list, seen, buildTicket("trio", [anchor, ...pair], "三連複1頭軸流し", settings))));
      if (anchors.length >= 2) opponents.forEach((horse) => addTicket(list, seen, buildTicket("trio", [anchors[0], anchors[1], horse], "三連複2頭軸流し", settings)));
      pairwise(anchors.slice(0, 2), main.slice(0, 3), (a, b) => holds.slice(0, 3).forEach((c) => addTicket(list, seen, buildTicket("trio", [a, b, c], "三連複フォーメーション", settings))));
      if (settings.allowBox) combinations(boxPool, 3).forEach((combo) => addTicket(list, seen, buildTicket("trio", combo, "三連複BOX", settings)));
    }
    if (use("trifecta")) {
      anchors.slice(0, 2).forEach((first) => main.slice(0, 4).forEach((second) => opponents.slice(0, 5).forEach((third) => addTicket(list, seen, buildTicket("trifecta", [first, second, third], "三連単1着固定流し", settings)))));
      if (anchors[0] && main[0]) opponents.forEach((third) => addTicket(list, seen, buildTicket("trifecta", [anchors[0], main[0], third], "三連単1着2着固定流し", settings)));
      if (main[0]) pairwise(anchors, opponents, (first, third) => addTicket(list, seen, buildTicket("trifecta", [first, main[0], third], "三連単2着固定流し", settings)));
      if (holds[0]) pairwise(anchors, main, (first, second) => addTicket(list, seen, buildTicket("trifecta", [first, second, holds[0]], "三連単3着固定流し", settings)));
      pairwise(anchors.slice(0, 2), main.slice(0, 3), (first, second) => holds.slice(0, 3).forEach((third) => addTicket(list, seen, buildTicket("trifecta", [first, second, third], "三連単フォーメーション", settings))));
      if (settings.allowBox) combinations(boxPool.slice(0, 4), 3).forEach((combo) => {
        [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].forEach((order) => addTicket(list, seen, buildTicket("trifecta", [combo[order[0]], combo[order[1]], combo[order[2]]], "三連単BOX", settings)));
      });
    }

    const limited = list.slice(0, settings.maxTickets).map((ticket) => ({ ...ticket }));
    const trifectaCount = limited.filter((ticket) => ticket.type === "trifecta").length;
    const trifectaLimit = trifectaRecommendedLimit(aggregate?.raceSummary?.fieldSize);
    if (settings.applyTrifectaLimit && trifectaCount > trifectaLimit) {
      limited.filter((ticket) => ticket.type === "trifecta").forEach((ticket) => ticket.warnings.push(`三連単推奨上限${trifectaLimit}点を超過中`));
    }
    return limited;
  }

  function normalizeTicket(input = {}, settings = defaultSettings()) {
    const type = TICKET_TYPES.includes(input.type) ? input.type : "win";
    const horses = Array.isArray(input.horses) ? input.horses : [];
    const normalized = normalizeCombination(type, horses);
    if (!normalized) return null;
    return {
      id: text(input.id) || `${type}-${normalized.map((horse) => horse.horseNumber).join("-")}`,
      type,
      typeLabel: TICKET_LABELS[type],
      combination: normalized.map((horse) => text(horse.horseNumber)).join("-"),
      horseNumbers: normalized.map((horse) => text(horse.horseNumber)),
      horses: normalized.map((horse) => ({
        horseNumber: text(horse.horseNumber),
        horseName: text(horse.horseName),
        mark: text(horse.mark) || "無印",
        aiScore: text(horse.aiScore),
        dangerousPopular: Boolean(horse.dangerousPopular),
        longshot: Boolean(horse.longshot)
      })),
      reason: text(input.reason),
      stake: yen(input.stake, settings.baseStake),
      selected: input.selected !== false,
      manual: Boolean(input.manual),
      warnings: Array.isArray(input.warnings) ? input.warnings.map(text).filter(Boolean) : []
    };
  }

  function normalizeTickets(tickets = [], settings = defaultSettings()) {
    const seen = new Set();
    const result = [];
    tickets.forEach((ticket) => {
      const normalized = normalizeTicket(ticket, settings);
      if (!normalized) return;
      const key = ticketKey(normalized.type, normalized.horses);
      if (seen.has(key)) return;
      seen.add(key);
      result.push(normalized);
    });
    return result;
  }

  function calculateTotals(tickets = [], settings = defaultSettings()) {
    const normalizedSettings = normalizeSettings(settings);
    const selected = tickets.filter((ticket) => ticket.selected !== false);
    const byType = {};
    TICKET_TYPES.forEach((type) => {
      const rows = selected.filter((ticket) => ticket.type === type);
      byType[type] = {
        type,
        typeLabel: TICKET_LABELS[type],
        points: rows.length,
        subtotal: rows.reduce((sum, ticket) => sum + yen(ticket.stake, normalizedSettings.baseStake), 0)
      };
    });
    const totalPoints = selected.length;
    const totalAmount = Object.values(byType).reduce((sum, item) => sum + item.subtotal, 0);
    return {
      totalPoints,
      totalAmount,
      budget: normalizedSettings.budget,
      overBudget: totalAmount > normalizedSettings.budget,
      byType
    };
  }

  function addManualTicket(tickets, type, horses, settings = defaultSettings()) {
    const ticket = buildTicket(type, horses, "手動追加", normalizeSettings(settings), true, true);
    if (!ticket) return { added: false, reason: "invalid_combination", tickets };
    const normalized = normalizeTickets([...tickets, ticket], settings);
    if (normalized.length === tickets.length) return { added: false, reason: "duplicate", tickets };
    return { added: true, ticket, tickets: normalized };
  }

  function normalizeSavedPayload(input = {}) {
    const settings = normalizeSettings(input.settings || input);
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: input.savedAt || new Date().toISOString(),
      sourceRaceKey: text(input.sourceRaceKey),
      settings,
      tickets: normalizeTickets(input.tickets || [], settings)
    };
  }

  function loadSavedTickets(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return null;
    const parsed = safeParseJson(targetStorage.getItem(STORAGE_KEY));
    return parsed ? normalizeSavedPayload(parsed) : null;
  }

  function saveTickets(payload, storage) {
    const targetStorage = getStorage(storage);
    const data = normalizeSavedPayload(payload);
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"], data };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { saved: true, data };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return { saved: false, quotaExceeded, storageError: true, errors: [quotaExceeded ? "localStorageの容量が不足しているため買い目を保存できませんでした。古い保存データを整理してから再度保存してください。" : "localStorageへの保存に失敗しました。"], data };
    }
  }

  function deleteSavedTickets(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function summarizePhase21Cleanup(storage) {
    return cleanupApi.summarizePhase21Cleanup(getStorage(storage), PROTECTED_CLEANUP_KEYS);
  }

  function cleanupPhase21LocalData(storage, confirmCleanup = () => false) {
    return cleanupApi.cleanupPhase21LocalData(getStorage(storage), confirmCleanup, PROTECTED_CLEANUP_KEYS);
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function setMessage(doc, message, kind = "info") {
    const node = doc.querySelector("#phase22-ticket-message");
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  }

  function readSettingsFromDocument(doc) {
    const base = defaultSettings();
    const read = (key) => {
      const node = doc.querySelector(`[data-phase22-ticket-setting="${key}"]`);
      if (!node) return undefined;
      return node.type === "checkbox" ? node.checked : node.value;
    };
    const enabledTypes = {};
    TICKET_TYPES.forEach((type) => {
      const value = read(`enabled-${type}`);
      enabledTypes[type] = value === undefined ? true : Boolean(value);
    });
    return normalizeSettings({
      ...base,
      budget: read("budget"),
      baseStake: read("baseStake"),
      maxTickets: read("maxTickets"),
      includeDangerousPopular: read("includeDangerousPopular"),
      prioritizeLongshots: read("prioritizeLongshots"),
      includeDivineLongshots: read("includeDivineLongshots"),
      allowBox: read("allowBox"),
      applyTrifectaLimit: read("applyTrifectaLimit"),
      enabledTypes
    });
  }

  function restoreSettingsToDocument(doc, settings) {
    const data = normalizeSettings(settings);
    const write = (key, value) => {
      const node = doc.querySelector(`[data-phase22-ticket-setting="${key}"]`);
      if (!node) return;
      if (node.type === "checkbox") node.checked = Boolean(value);
      else node.value = String(value);
    };
    write("budget", data.budget);
    write("baseStake", data.baseStake);
    write("maxTickets", data.maxTickets);
    write("includeDangerousPopular", data.includeDangerousPopular);
    write("prioritizeLongshots", data.prioritizeLongshots);
    write("includeDivineLongshots", data.includeDivineLongshots);
    write("allowBox", data.allowBox);
    write("applyTrifectaLimit", data.applyTrifectaLimit);
    TICKET_TYPES.forEach((type) => write(`enabled-${type}`, data.enabledTypes[type]));
  }

  function renderTotals(doc, totals) {
    const node = doc.querySelector("#phase22-ticket-total-summary");
    if (!node) return;
    node.textContent = `選択 ${totals.totalPoints}点 / 合計 ${totals.totalAmount.toLocaleString("ja-JP")}円 / 予算 ${totals.budget.toLocaleString("ja-JP")}円${totals.overBudget ? " / 予算超過" : ""}`;
    node.dataset.kind = totals.overBudget ? "error" : "success";
  }

  function renderTickets(doc, tickets, settings) {
    const container = doc.querySelector("#phase22-ticket-list");
    if (!container) return;
    container.textContent = "";
    const totals = calculateTotals(tickets, settings);
    TICKET_TYPES.forEach((type) => {
      const rows = tickets.filter((ticket) => ticket.type === type);
      const details = makeEl(doc, "details", "phase22-ticket-type", "");
      details.open = rows.length > 0;
      const summary = makeEl(doc, "summary", "", `${TICKET_LABELS[type]} ${rows.filter((row) => row.selected !== false).length}点 / ${totals.byType[type].subtotal.toLocaleString("ja-JP")}円`);
      details.appendChild(summary);
      const tableWrap = makeEl(doc, "div", "phase22-ticket-table-wrap", "");
      rows.forEach((ticket, index) => {
        const row = makeEl(doc, "article", "phase22-ticket-row", "");
        row.dataset.ticketId = ticket.id;
        const selected = doc.createElement("input");
        selected.type = "checkbox";
        selected.checked = ticket.selected !== false;
        selected.dataset.phase22TicketAction = "selected";
        selected.dataset.ticketId = ticket.id;
        row.appendChild(selected);
        [
          ticket.typeLabel,
          ticket.combination,
          ticket.horses.map((horse) => `${horse.horseNumber} ${horse.horseName || "馬名未設定"} ${horse.mark || "無印"} ${horse.aiScore || "未評価"}`).join(" / "),
          ticket.reason,
          ticket.warnings.length ? ticket.warnings.join(" / ") : "なし"
        ].forEach((value) => row.appendChild(makeEl(doc, "span", "", value)));
        const stake = doc.createElement("input");
        stake.type = "number";
        stake.min = "100";
        stake.step = "100";
        stake.value = String(ticket.stake);
        stake.dataset.phase22TicketAction = "stake";
        stake.dataset.ticketId = ticket.id;
        row.appendChild(stake);
        row.appendChild(makeEl(doc, "strong", "", `${yen(ticket.stake).toLocaleString("ja-JP")}円`));
        const remove = doc.createElement("button");
        remove.type = "button";
        remove.textContent = "削除";
        remove.dataset.phase22TicketAction = "remove";
        remove.dataset.ticketId = ticket.id;
        row.appendChild(remove);
        const up = doc.createElement("button");
        up.type = "button";
        up.textContent = "↑";
        up.dataset.phase22TicketAction = "up";
        up.dataset.ticketId = ticket.id;
        up.dataset.ticketIndex = String(index);
        row.appendChild(up);
        const down = doc.createElement("button");
        down.type = "button";
        down.textContent = "↓";
        down.dataset.phase22TicketAction = "down";
        down.dataset.ticketId = ticket.id;
        down.dataset.ticketIndex = String(index);
        row.appendChild(down);
        tableWrap.appendChild(row);
      });
      if (!rows.length) tableWrap.appendChild(makeEl(doc, "p", "phase22-empty-note", "未生成"));
      details.appendChild(tableWrap);
      container.appendChild(details);
    });
    renderTotals(doc, totals);
  }

  function updateCleanupSummary(doc, storage) {
    const node = doc.querySelector("#phase22-ticket-phase21-cleanup-summary");
    if (!node) return null;
    const summary = summarizePhase21Cleanup(storage);
    node.textContent = `削除対象候補: ${summary.count}件 / 概算 ${summary.displaySize}`;
    return summary;
  }

  function bindBettingTicketPanel(options = {}) {
    const doc = options.document || (root && root.document) || null;
    const storage = getStorage(options.storage);
    if (!doc || typeof doc.querySelector !== "function") return null;
    const panel = doc.querySelector("#phase22-betting-ticket-generation-core");
    if (!panel || panel.dataset.phase22TicketBound === "true") return null;
    panel.dataset.phase22TicketBound = "true";
    let aggregate = loadAggregate(storage);
    let settings = normalizeSettings(options.settings || {});
    let tickets = [];

    const render = () => renderTickets(doc, tickets, settings);
    const refreshAggregate = () => {
      aggregate = loadAggregate(storage);
      updateCleanupSummary(doc, storage);
      setMessage(doc, aggregate.evaluations && aggregate.evaluations.length ? "Phase22-3相当の最終予想情報を読み込みました。" : "Phase22-1〜22-3の保存データが未登録です。", aggregate.evaluations && aggregate.evaluations.length ? "success" : "error");
      return aggregate;
    };
    const regenerate = () => {
      if (tickets.length) {
        const confirmRegenerate = options.confirmRegenerate || (() => (root && typeof root.confirm === "function" ? root.confirm("再生成すると現在の買い目編集内容を置き換えます。実行しますか？") : false));
        if (!confirmRegenerate()) {
          setMessage(doc, "再生成には確認が必要です。", "error");
          return null;
        }
      }
      settings = readSettingsFromDocument(doc);
      aggregate = loadAggregate(storage);
      tickets = generateTickets(aggregate, settings);
      render();
      const totals = calculateTotals(tickets, settings);
      setMessage(doc, totals.overBudget ? "買い目を生成しましたが、予算を超過しています。" : "買い目候補を生成しました。自動投票ではありません。", totals.overBudget ? "error" : "success");
      return tickets;
    };
    const save = () => {
      settings = readSettingsFromDocument(doc);
      const result = saveTickets({ sourceRaceKey: aggregate.sourceRaceKey, settings, tickets }, storage);
      setMessage(doc, result.saved ? "買い目候補を保存しました。" : result.errors.join(" / "), result.saved ? "success" : "error");
      return result;
    };
    const restore = () => {
      const saved = loadSavedTickets(storage);
      if (!saved) {
        setMessage(doc, "保存済みのPhase22-4買い目はありません。", "info");
        return null;
      }
      settings = saved.settings;
      tickets = saved.tickets;
      restoreSettingsToDocument(doc, settings);
      render();
      setMessage(doc, "保存済みの買い目候補を復元しました。", "success");
      return saved;
    };
    const reset = () => {
      const confirmReset = options.confirmReset || (() => (root && typeof root.confirm === "function" ? root.confirm("Phase22-4の買い目保存データだけを初期化しますか？Phase22-1〜22-3は削除しません。") : false));
      const result = deleteSavedTickets(storage, confirmReset);
      if (result.deleted) {
        tickets = [];
        render();
      }
      setMessage(doc, result.deleted ? "Phase22-4の保存データだけを初期化しました。" : "初期化には確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };
    const cleanupPhase21 = () => {
      const confirmCleanup = options.confirmCleanup || ((summary) => (root && typeof root.confirm === "function" ? root.confirm(`古いPhase21ローカル保存データ ${summary.count}件を整理します。Phase22-1〜22-4は削除しません。実行しますか？`) : false));
      const result = cleanupPhase21LocalData(storage, confirmCleanup);
      updateCleanupSummary(doc, storage);
      setMessage(doc, result.deleted ? `古いPhase21ローカル保存データを${result.removedCount}件整理しました。` : "Phase21ローカル保存データ整理は確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };
    const applyBulkStake = () => {
      const typeNode = doc.querySelector("#phase22-ticket-bulk-type");
      const amountNode = doc.querySelector("#phase22-ticket-bulk-stake");
      const type = typeNode ? typeNode.value : "";
      const amount = yen(amountNode ? amountNode.value : settings.baseStake, settings.baseStake);
      tickets = tickets.map((ticket) => (type === "all" || ticket.type === type ? { ...ticket, stake: amount } : ticket));
      render();
      setMessage(doc, "券種別の金額を反映しました。", "success");
    };
    const manualAdd = () => {
      const typeNode = doc.querySelector("#phase22-manual-ticket-type");
      const horseNode = doc.querySelector("#phase22-manual-ticket-horses");
      const type = typeNode ? typeNode.value : "win";
      const numbers = text(horseNode ? horseNode.value : "").split(/[,\s-]+/).filter(Boolean);
      const horses = numbers.map((number) => (aggregate.evaluations || []).find((horse) => text(horse.horseNumber) === text(number)) || { horseNumber: number, horseName: "", mark: "無印", aiScore: "" });
      const result = addManualTicket(tickets, type, horses, settings);
      tickets = result.tickets;
      render();
      setMessage(doc, result.added ? "手動買い目を追加しました。" : (result.reason === "duplicate" ? "同一買い目は追加できません。" : "券種に必要な頭数を満たしていません。"), result.added ? "success" : "error");
      return result;
    };
    const handleListAction = (event) => {
      const target = event.target;
      if (!target || !target.dataset || !target.dataset.phase22TicketAction) return;
      const id = target.dataset.ticketId;
      const index = tickets.findIndex((ticket) => ticket.id === id);
      if (index < 0) return;
      const action = target.dataset.phase22TicketAction;
      if (action === "selected") tickets[index] = { ...tickets[index], selected: Boolean(target.checked) };
      if (action === "stake") tickets[index] = { ...tickets[index], stake: yen(target.value, settings.baseStake) };
      if (action === "remove") tickets = tickets.filter((ticket) => ticket.id !== id);
      if (action === "up" && index > 0) [tickets[index - 1], tickets[index]] = [tickets[index], tickets[index - 1]];
      if (action === "down" && index < tickets.length - 1) [tickets[index + 1], tickets[index]] = [tickets[index], tickets[index + 1]];
      render();
    };

    [
      ["#phase22-refresh-ticket-source", "click", refreshAggregate],
      ["#phase22-generate-tickets", "click", regenerate],
      ["#phase22-save-tickets", "click", save],
      ["#phase22-restore-tickets", "click", restore],
      ["#phase22-reset-tickets", "click", reset],
      ["#phase22-cleanup-phase21-storage-for-tickets", "click", cleanupPhase21],
      ["#phase22-apply-bulk-stake", "click", applyBulkStake],
      ["#phase22-add-manual-ticket", "click", manualAdd],
      ["#phase22-ticket-list", "change", handleListAction],
      ["#phase22-ticket-list", "click", handleListAction]
    ].forEach(([selector, event, handler]) => {
      const node = doc.querySelector(selector);
      if (node) node.addEventListener(event, handler);
    });
    restoreSettingsToDocument(doc, settings);
    refreshAggregate();
    render();
    return { refreshAggregate, regenerate, save, restore, reset, cleanupPhase21, manualAdd, applyBulkStake };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindBettingTicketPanel();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    RACE_INPUT_STORAGE_KEY,
    PREDICTION_EVALUATION_STORAGE_KEY,
    FINAL_SUMMARY_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_CLEANUP_KEYS,
    TICKET_TYPES,
    TICKET_LABELS,
    REQUIRED_COUNTS,
    defaultSettings,
    normalizeSettings,
    loadAggregate,
    getSourceGroups,
    normalizeCombination,
    ticketKey,
    buildTicket,
    generateTickets,
    normalizeTicket,
    normalizeTickets,
    calculateTotals,
    addManualTicket,
    trifectaRecommendedLimit,
    normalizeSavedPayload,
    loadSavedTickets,
    saveTickets,
    deleteSavedTickets,
    summarizePhase21Cleanup,
    cleanupPhase21LocalData,
    bindBettingTicketPanel
  };
});
