(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2220RetrialStartExecutionStatusManagementCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const SOURCE_STORAGE_KEY = "hashimotoKeibaAi.phase22.manualRetrialEntryStartApprovalRecord.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.retrialStartExecutionStatusManagement.v1";
  const STATUSES = ["awaiting_manual_start", "started", "observing", "paused", "stopped", "completed", "abnormality_detected", "cancelled", "expired"];
  const TERMINAL_STATUSES = ["stopped", "completed", "abnormality_detected", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    awaiting_manual_start: ["started", "cancelled", "expired"],
    started: ["observing", "paused", "stopped", "completed", "abnormality_detected"],
    observing: ["paused", "stopped", "completed", "abnormality_detected"],
    paused: ["observing", "stopped", "completed", "abnormality_detected"],
    stopped: [], completed: [], abnormality_detected: [], cancelled: [], expired: []
  };

  function text(value, fallback = "") { return value === null || value === undefined ? fallback : String(value).trim(); }
  function number(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
  function safeParseJson(raw) { if (!raw) return null; try { return JSON.parse(raw); } catch (_) { return null; } }
  function getStorage(storage) { return storage || (root && root.localStorage) || null; }
  function buildSafety() {
    return { planOnly: true, protectedMode: true, privateLocal: true, manualStartOnly: true, manualStatusOnly: true,
      automaticPurchase: false, automaticApply: false, automaticLearning: false, automaticUpdate: false,
      autoStart: false, autoStop: false, autoComplete: false, productionPredictionMutation: false,
      bettingMutation: false, ruleApplicationMutation: false, learningMutation: false, sourceMutation: false,
      publicUrl: false, githubPages: false, externalApi: false };
  }
  function isSafetyValid(safety = {}) { const expected = buildSafety(); return Object.keys(expected).every((key) => safety[key] === expected[key]); }
  function normalizeHistory(input = {}) {
    return { historyId: text(input.historyId), fromStatus: text(input.fromStatus), toStatus: text(input.toStatus),
      operator: text(input.operator), changedAt: text(input.changedAt), reason: text(input.reason), notes: text(input.notes) };
  }
  function normalizeSourceRecord(input = {}) {
    return { entryRecordId: text(input.entryRecordId), registeredTrialId: text(input.registeredTrialId),
      registeredTrialName: text(input.registeredTrialName), sourceCreationCheckId: text(input.sourceCreationCheckId),
      sourceRetrialPlanId: text(input.sourceRetrialPlanId), entryStatus: text(input.entryStatus),
      entryDecision: text(input.entryDecision), startApprover: text(input.startApprover),
      startApprovedAt: text(input.startApprovedAt), startApprovalReason: text(input.startApprovalReason) };
  }
  function eligibleSourceRecords(sourceStore = {}) {
    return (Array.isArray(sourceStore.entryRecords) ? sourceStore.entryRecords : []).map(normalizeSourceRecord)
      .filter((record) => record.entryStatus === "start_approved" && record.entryDecision === "start_approved" && record.startApprover && record.startApprovedAt && record.startApprovalReason);
  }
  function normalizeExecutionRecord(input = {}) {
    return { executionRecordId: text(input.executionRecordId), sourceEntryRecordId: text(input.sourceEntryRecordId),
      registeredTrialId: text(input.registeredTrialId), registeredTrialName: text(input.registeredTrialName),
      sourceCreationCheckId: text(input.sourceCreationCheckId), sourceRetrialPlanId: text(input.sourceRetrialPlanId),
      status: STATUSES.includes(input.status) ? input.status : "awaiting_manual_start",
      startedBy: text(input.startedBy), startedAt: text(input.startedAt), startReason: text(input.startReason),
      history: Array.isArray(input.history) ? input.history.map(normalizeHistory) : [],
      sourceApprovalSnapshot: normalizeSourceRecord(input.sourceApprovalSnapshot || {}),
      createdAt: text(input.createdAt), updatedAt: text(input.updatedAt), safety: buildSafety() };
  }
  function buildExecutionRecord(sourceInput, saved = {}) {
    const source = normalizeSourceRecord(sourceInput);
    return normalizeExecutionRecord({ ...saved, executionRecordId: text(saved.executionRecordId) || `phase22-20-execution-${source.entryRecordId}`,
      sourceEntryRecordId: source.entryRecordId, registeredTrialId: source.registeredTrialId,
      registeredTrialName: source.registeredTrialName, sourceCreationCheckId: source.sourceCreationCheckId,
      sourceRetrialPlanId: source.sourceRetrialPlanId, sourceApprovalSnapshot: source });
  }
  function normalizeSourceStore(input = {}) { return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), entryRecords: Array.isArray(input.entryRecords) ? input.entryRecords : [] }; }
  function normalizeStore(input = {}, sourceStore = normalizeSourceStore()) {
    const savedBySource = new Map((Array.isArray(input.executionRecords) ? input.executionRecords : []).map((record) => [text(record.sourceEntryRecordId), record]));
    return { schemaVersion: SCHEMA_VERSION, savedAt: text(input.savedAt), sourcePhase2219SavedAt: text(sourceStore.savedAt),
      executionRecords: eligibleSourceRecords(sourceStore).map((source) => buildExecutionRecord(source, savedBySource.get(source.entryRecordId) || {})).sort((a, b) => a.executionRecordId.localeCompare(b.executionRecordId)) };
  }
  function loadSourceStore(storage) { const target = getStorage(storage); const raw = target && target.getItem(SOURCE_STORAGE_KEY); const parsed = safeParseJson(raw); return { sourceStore: normalizeSourceStore(parsed || {}), parseError: Boolean(raw && !parsed) }; }
  function loadStore(storage, sourceStore = normalizeSourceStore()) {
    const target = getStorage(storage); const raw = target && target.getItem(STORAGE_KEY); const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeStore({}, sourceStore), parseError: true, rejected: true };
    if (parsed && !Array.isArray(parsed.executionRecords)) return { store: normalizeStore({}, sourceStore), parseError: false, rejected: true };
    return { store: normalizeStore(parsed || {}, sourceStore), parseError: false, rejected: false };
  }
  function validateRecord(recordInput, sourceStore = normalizeSourceStore()) {
    const record = normalizeExecutionRecord(recordInput); const errors = [];
    ["executionRecordId", "sourceEntryRecordId", "registeredTrialId", "registeredTrialName"].forEach((field) => { if (!record[field]) errors.push(`${field} is required.`); });
    const source = eligibleSourceRecords(sourceStore).find((item) => item.entryRecordId === record.sourceEntryRecordId);
    if (!source) errors.push("source must be a Phase22-19 start-approved record.");
    if (source && (source.registeredTrialId !== record.registeredTrialId || source.sourceCreationCheckId !== record.sourceCreationCheckId)) errors.push("source snapshot mismatch.");
    if (!isSafetyValid(recordInput.safety || {})) errors.push("safety flags are invalid.");
    if (record.status !== "awaiting_manual_start" && (!record.startedBy || !record.startedAt || !record.startReason)) errors.push("manual start record is incomplete.");
    record.history.forEach((event, index) => {
      if (![event.operator, event.changedAt, event.reason].every(Boolean)) errors.push(`history ${index} is incomplete.`);
      if (!(ALLOWED_TRANSITIONS[event.fromStatus] || []).includes(event.toStatus)) errors.push(`history ${index} has invalid transition.`);
      if (index > 0 && record.history[index - 1].toStatus !== event.fromStatus) errors.push(`history ${index} is not contiguous.`);
    });
    if (record.history.length && record.history[record.history.length - 1].toStatus !== record.status) errors.push("history does not match current status.");
    return { ok: errors.length === 0, errors };
  }
  function transitionStatus(recordInput, toStatus, operator, changedAt, reason, notes = "") {
    const record = normalizeExecutionRecord(recordInput);
    if (!STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", record };
    if (TERMINAL_STATUSES.includes(record.status)) return { transitioned: false, reason: "terminal_locked", record };
    if (!(ALLOWED_TRANSITIONS[record.status] || []).includes(toStatus)) return { transitioned: false, reason: "invalid_transition", record };
    if (![operator, changedAt, reason].every((value) => text(value))) return { transitioned: false, reason: "missing_required_fields", record };
    const event = normalizeHistory({ historyId: `${record.executionRecordId}-${record.history.length + 1}`, fromStatus: record.status, toStatus,
      operator, changedAt, reason, notes });
    const start = record.status === "awaiting_manual_start" && toStatus === "started" ? { startedBy: text(operator), startedAt: text(changedAt), startReason: text(reason) } : {};
    return { transitioned: true, event, record: normalizeExecutionRecord({ ...record, ...start, status: toStatus, history: [...record.history, event], updatedAt: text(changedAt), createdAt: record.createdAt || text(changedAt) }) };
  }
  function saveStore(storage, store, now = new Date()) {
    const target = getStorage(storage); if (!target) return { saved: false, reason: "storage_unavailable" };
    try { target.setItem(STORAGE_KEY, JSON.stringify({ ...store, schemaVersion: SCHEMA_VERSION, savedAt: now.toISOString(), executionRecords: (store.executionRecords || []).map(normalizeExecutionRecord) })); return { saved: true }; }
    catch (error) { return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" }; }
  }
  function generatePlainText(store) {
    const lines = ["Phase22-20 Retrial Start / Execution Status Management", `Storage: ${STORAGE_KEY}`, "Private Local / PLAN_ONLY / protectedMode / manual operations only / no production mutation"];
    (store.executionRecords || []).forEach((record) => { lines.push("", `${record.executionRecordId} / ${record.registeredTrialId}`, `status: ${record.status}`, `started: ${record.startedBy || "-"} / ${record.startedAt || "-"} / ${record.startReason || "-"}`); record.history.forEach((event) => lines.push(`- ${event.changedAt} ${event.fromStatus} -> ${event.toStatus} / ${event.operator} / ${event.reason}${event.notes ? ` / ${event.notes}` : ""}`)); });
    return lines.join("\n");
  }
  function bindPanel(options = {}) {
    const doc = options.document || (root && root.document); if (!doc) return { initialized: false, reason: "document_unavailable" };
    const panel = doc.querySelector("#phase22-retrial-execution-status-core"); if (!panel || panel.dataset.phase2220Bound === "true") return { initialized: false, reason: panel ? "already_bound" : "root_missing" };
    panel.dataset.phase2220Bound = "true"; const storage = getStorage(options.storage); let sourceStore = loadSourceStore(storage).sourceStore; let loaded = loadStore(storage, sourceStore);
    const find = (selector) => doc.querySelector(selector); const message = find("#phase22-retrial-execution-message");
    function render() { const summary = find("#phase22-retrial-execution-summary"); const list = find("#phase22-retrial-execution-list"); const select = find("#phase22-retrial-execution-record"); if (summary) summary.textContent = `approved sources ${eligibleSourceRecords(sourceStore).length} / execution records ${loaded.store.executionRecords.length}`; if (list) { list.replaceChildren(); loaded.store.executionRecords.forEach((record) => { const row = doc.createElement("div"); row.className = "phase22-retrial-execution-row"; [record.registeredTrialId, record.status, record.startedBy || "not started", record.startedAt || "-", `${record.history.length} events`].forEach((value) => { const span = doc.createElement("span"); span.textContent = value; row.appendChild(span); }); list.appendChild(row); }); } if (select) { const selected = select.value; select.replaceChildren(); loaded.store.executionRecords.forEach((record) => { const option = doc.createElement("option"); option.value = record.executionRecordId; option.textContent = `${record.registeredTrialId} / ${record.status}`; select.appendChild(option); }); if (selected) select.value = selected; } }
    function operate(toStatus) { const select = find("#phase22-retrial-execution-record"); const record = loaded.store.executionRecords.find((item) => item.executionRecordId === (select && select.value)); const result = record && transitionStatus(record, toStatus, find("#phase22-retrial-execution-operator")?.value, find("#phase22-retrial-execution-at")?.value, find("#phase22-retrial-execution-reason")?.value, find("#phase22-retrial-execution-notes")?.value); if (!result || !result.transitioned) { if (message) message.textContent = `Rejected: ${result ? result.reason : "record_missing"}`; return; } loaded.store.executionRecords = loaded.store.executionRecords.map((item) => item.executionRecordId === record.executionRecordId ? result.record : item); if (message) message.textContent = `Recorded: ${record.status} -> ${toStatus}`; render(); }
    const actions = { "#phase22-retrial-execution-reload": () => { sourceStore = loadSourceStore(storage).sourceStore; loaded = loadStore(storage, sourceStore); render(); }, "#phase22-retrial-execution-save": () => { const result = saveStore(storage, loaded.store); if (message) message.textContent = result.saved ? "Saved." : `Save failed: ${result.reason}`; }, "#phase22-retrial-execution-text": () => { const output = find("#phase22-retrial-execution-text-output"); if (output) output.value = generatePlainText(loaded.store); } };
    ["started", "observing", "paused", "stopped", "completed", "abnormality_detected", "cancelled", "expired"].forEach((status) => { actions[`#phase22-retrial-execution-${status.replace(/_/g, "-")}`] = () => operate(status); });
    Object.keys(actions).forEach((selector) => { const button = find(selector); if (button) button.addEventListener("click", actions[selector]); }); render(); return { initialized: true, actions, state: { loaded } };
  }
  if (root && root.document) { const start = () => bindPanel(); if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }
  return { SCHEMA_VERSION, SOURCE_STORAGE_KEY, STORAGE_KEY, STATUSES, TERMINAL_STATUSES, ALLOWED_TRANSITIONS, buildSafety, isSafetyValid,
    normalizeSourceRecord, normalizeExecutionRecord, normalizeSourceStore, normalizeStore, eligibleSourceRecords, buildExecutionRecord,
    loadSourceStore, loadStore, validateRecord, transitionStatus, saveStore, generatePlainText, bindPanel };
});
