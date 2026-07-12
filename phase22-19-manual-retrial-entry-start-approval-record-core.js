(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2219ManualRetrialEntryStartApprovalRecordCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const CREATION_CHECK_STORAGE_KEY = "hashimotoKeibaAi.phase22.manualRetrialCreationPrestartCheck.v1";
  const TRIAL_STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialObservationManagement.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.manualRetrialEntryStartApprovalRecord.v1";
  const ENTRY_STATUSES = ["draft", "registered", "awaiting_start_approval", "start_approved", "returned", "cancelled", "expired"];
  const ENTRY_DECISIONS = ["pending", "registered_for_manual_start_approval", "start_approved", "revision_required", "rejected", "cancelled"];
  const TERMINAL_STATUSES = ["start_approved", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    draft: ["registered", "cancelled"],
    registered: ["awaiting_start_approval", "returned", "cancelled"],
    awaiting_start_approval: ["start_approved", "returned", "cancelled", "expired"],
    returned: ["registered", "cancelled"],
    start_approved: [], cancelled: [], expired: []
  };

  function text(value, fallback = "") { return value === null || value === undefined ? fallback : String(value).trim(); }
  function number(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
  function safeParseJson(raw) { if (!raw) return null; try { return JSON.parse(raw); } catch (_) { return null; } }
  function getStorage(storage) { return storage || (root && root.localStorage) || null; }
  function splitList(value) { return Array.isArray(value) ? value.map(text).filter(Boolean) : text(value).split(/[\n,、，|｜]+/).map(text).filter(Boolean); }
  function stableSlug(value) { return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "manual-retrial"; }
  function generateEntryRecordId(check) { return `phase22-19-entry-${stableSlug(check.creationCheckId || check.candidateTrialId || check.sourceRetrialPlanId)}`; }
  function escapeHtml(value) { return text(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }

  function buildSafety() {
    return {
      planOnly: true, protectedMode: true, privateLocal: true, observationOnly: true, shadowMode: true,
      manualEntryOnly: true, manualStartApprovalOnly: true,
      automaticApply: false, automaticLearning: false, automaticUpdate: false, autoExecution: false,
      autoRollback: false, autoContinuation: false, autoTrialCreation: false, autoTrialStart: false,
      publicUrl: false, githubPages: false, externalApi: false, predictionMutation: false,
      bettingMutation: false, applicationStatusMutation: false, ruleActivation: false,
      trialObservationMutation: false, sourceCreationCheckMutation: false
    };
  }

  function normalizeCandidateTrial(input = {}) {
    return {
      candidateTrialId: text(input.candidateTrialId), candidateTrialName: text(input.candidateTrialName),
      sourceRetrialPlanId: text(input.sourceRetrialPlanId), sourceEvaluationId: text(input.sourceEvaluationId),
      sourceTrialId: text(input.sourceTrialId), sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId), targetImprovementRuleId: text(input.targetImprovementRuleId),
      targetRaceKeys: splitList(input.targetRaceKeys), targetCourses: splitList(input.targetCourses),
      targetRaceClasses: splitList(input.targetRaceClasses), targetDistances: splitList(input.targetDistances),
      targetSurfaceTypes: splitList(input.targetSurfaceTypes), observationStartDate: text(input.observationStartDate),
      observationEndDate: text(input.observationEndDate), maximumRaceCount: number(input.maximumRaceCount, 0),
      warningThreshold: number(input.warningThreshold, 0), safety: buildSafety()
    };
  }

  function normalizeCreationCheck(input = {}) {
    return {
      creationCheckId: text(input.creationCheckId), sourceRetrialPlanId: text(input.sourceRetrialPlanId),
      sourceEvaluationId: text(input.sourceEvaluationId), sourceTrialId: text(input.sourceTrialId),
      sourcePlanId: text(input.sourcePlanId), targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId), candidateTrialId: text(input.candidateTrialId),
      candidateTrialName: text(input.candidateTrialName), creationStatus: text(input.creationStatus || "draft"),
      creationDecision: text(input.creationDecision || "pending"), candidateTrial: normalizeCandidateTrial(input.candidateTrial || {}),
      safety: buildSafety()
    };
  }

  function eligibleCreationChecks(store) {
    return (store.creationChecks || []).map(normalizeCreationCheck)
      .filter((check) => check.creationStatus === "start_ready" && check.creationDecision === "ready_for_manual_trial_entry");
  }

  function buildPhase2215TrialSnapshot(checkInput, saved = {}) {
    const check = normalizeCreationCheck(checkInput); const candidate = check.candidateTrial;
    return {
      trialId: text(saved.trialId) || candidate.candidateTrialId || check.candidateTrialId,
      sourcePlanId: candidate.sourcePlanId || check.sourcePlanId,
      targetApprovalId: candidate.targetApprovalId || check.targetApprovalId,
      targetImprovementRuleId: candidate.targetImprovementRuleId || check.targetImprovementRuleId,
      trialName: text(saved.trialName) || candidate.candidateTrialName || check.candidateTrialName,
      purpose: text(saved.purpose) || "再試験を手動登録し、開始承認前の記録として保持する",
      scopeType: "race_keys", targetRaceKeys: candidate.targetRaceKeys, targetCourses: candidate.targetCourses,
      targetRaceClasses: candidate.targetRaceClasses, targetDistances: candidate.targetDistances,
      targetSurfaceTypes: candidate.targetSurfaceTypes, observationStartDate: candidate.observationStartDate,
      observationEndDate: candidate.observationEndDate, maximumRaceCount: candidate.maximumRaceCount,
      observedRaceCount: 0, trialStatus: "awaiting_start_approval", trialDecision: "pending",
      operator: text(saved.operator), observer: text(saved.observer), stopDecisionMaker: text(saved.stopDecisionMaker),
      startedAt: "", completedAt: "", cancelledAt: "", stopReason: "", completionComment: "",
      warningLimit: candidate.warningThreshold || 2, observations: [], stopRequests: [],
      createdAt: text(saved.createdAt), updatedAt: text(saved.updatedAt),
      sourcePlanStatus: "ready", sourcePlanDecision: "ready_for_manual_execution", sourceExecutionStatus: "not_started",
      sourceCreationCheckId: check.creationCheckId, sourceRetrialPlanId: check.sourceRetrialPlanId,
      manualRetrialEntry: true, safety: buildSafety()
    };
  }

  function normalizeEntryRecord(input = {}) {
    const check = normalizeCreationCheck(input.sourceCreationCheck || {});
    return {
      entryRecordId: text(input.entryRecordId), sourceCreationCheckId: text(input.sourceCreationCheckId || check.creationCheckId),
      sourceRetrialPlanId: text(input.sourceRetrialPlanId || check.sourceRetrialPlanId),
      sourceEvaluationId: text(input.sourceEvaluationId || check.sourceEvaluationId),
      sourceTrialId: text(input.sourceTrialId || check.sourceTrialId), sourcePlanId: text(input.sourcePlanId || check.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId || check.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId || check.targetImprovementRuleId),
      registeredTrialId: text(input.registeredTrialId || check.candidateTrialId),
      registeredTrialName: text(input.registeredTrialName || check.candidateTrialName),
      entryStatus: ENTRY_STATUSES.includes(input.entryStatus) ? input.entryStatus : "draft",
      entryDecision: ENTRY_DECISIONS.includes(input.entryDecision) ? input.entryDecision : "pending",
      registeredBy: text(input.registeredBy), registeredAt: text(input.registeredAt),
      registrationReason: text(input.registrationReason), registrationEvidence: text(input.registrationEvidence),
      startApprover: text(input.startApprover), startApprovedAt: text(input.startApprovedAt),
      startApprovalReason: text(input.startApprovalReason), returnedBy: text(input.returnedBy),
      returnedAt: text(input.returnedAt), returnReason: text(input.returnReason), notes: text(input.notes),
      sourceCreationCheck: check,
      phase2215TrialSnapshot: buildPhase2215TrialSnapshot(check, input.phase2215TrialSnapshot || {}),
      createdAt: text(input.createdAt), updatedAt: text(input.updatedAt), safety: buildSafety()
    };
  }

  function buildEntryRecordFromCreationCheck(checkInput, saved = {}) {
    const check = normalizeCreationCheck(checkInput);
    return normalizeEntryRecord({ ...saved, entryRecordId: text(saved.entryRecordId) || generateEntryRecordId(check),
      sourceCreationCheckId: check.creationCheckId, sourceRetrialPlanId: check.sourceRetrialPlanId,
      sourceEvaluationId: check.sourceEvaluationId, sourceTrialId: check.sourceTrialId, sourcePlanId: check.sourcePlanId,
      targetApprovalId: check.targetApprovalId, targetImprovementRuleId: check.targetImprovementRuleId,
      registeredTrialId: check.candidateTrialId, registeredTrialName: check.candidateTrialName,
      sourceCreationCheck: check, phase2215TrialSnapshot: buildPhase2215TrialSnapshot(check, saved.phase2215TrialSnapshot || {}) });
  }

  function normalizeCreationCheckStore(input = {}) { return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), creationChecks: Array.isArray(input.creationChecks) ? input.creationChecks.map(normalizeCreationCheck) : [] }; }
  function normalizeTrialStore(input = {}) { return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), trials: Array.isArray(input.trials) ? input.trials : [] }; }
  function normalizeEntryStore(input = {}, creationStore = normalizeCreationCheckStore()) {
    const savedBySource = new Map((input.entryRecords || []).map((record) => [text(record.sourceCreationCheckId), record]));
    return { schemaVersion: SCHEMA_VERSION, savedAt: text(input.savedAt), sourcePhase2218SavedAt: text(input.sourcePhase2218SavedAt || creationStore.savedAt),
      entryRecords: eligibleCreationChecks(creationStore).map((check) => buildEntryRecordFromCreationCheck(check, savedBySource.get(check.creationCheckId) || {})).sort((a, b) => a.entryRecordId.localeCompare(b.entryRecordId)),
      finalized: Boolean(input.finalized), finalizedAt: text(input.finalizedAt), confirmerName: text(input.confirmerName) };
  }

  function loadJsonStore(storage, key, normalizer, name) {
    const target = getStorage(storage); if (!target) return { [name]: normalizer(), parseError: false };
    const raw = target.getItem(key); const parsed = safeParseJson(raw);
    return { [name]: normalizer(parsed || {}), parseError: Boolean(raw && !parsed) };
  }
  function loadCreationCheckStore(storage) { return loadJsonStore(storage, CREATION_CHECK_STORAGE_KEY, normalizeCreationCheckStore, "creationCheckStore"); }
  function loadTrialStore(storage) { return loadJsonStore(storage, TRIAL_STORAGE_KEY, normalizeTrialStore, "trialStore"); }
  function loadEntryStore(storage, creationStore = normalizeCreationCheckStore()) {
    const target = getStorage(storage); if (!target) return { store: normalizeEntryStore({}, creationStore), parseError: false, rejected: false };
    const raw = target.getItem(STORAGE_KEY); const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeEntryStore({}, creationStore), parseError: true, rejected: true };
    if (parsed && parsed.entryRecords && !Array.isArray(parsed.entryRecords)) return { store: normalizeEntryStore({}, creationStore), parseError: false, rejected: true };
    return { store: normalizeEntryStore(parsed || {}, creationStore), parseError: false, rejected: false };
  }

  function isSafetyValid(safety = {}) { const expected = buildSafety(); return Object.keys(expected).every((key) => safety[key] === expected[key]); }
  function hasScope(trial) { return [trial.targetRaceKeys, trial.targetCourses, trial.targetRaceClasses, trial.targetDistances, trial.targetSurfaceTypes].some((list) => Array.isArray(list) && list.length); }
  function validateSource(recordInput, creationStore = normalizeCreationCheckStore()) {
    const record = normalizeEntryRecord(recordInput); const errors = [];
    const check = (creationStore.creationChecks || []).map(normalizeCreationCheck).find((item) => item.creationCheckId === record.sourceCreationCheckId);
    if (!check) errors.push("sourceCreationCheckId is missing in Phase22-18.");
    if (check && check.creationStatus !== "start_ready") errors.push("source creation check must be start_ready.");
    if (check && check.creationDecision !== "ready_for_manual_trial_entry") errors.push("source creation decision must be ready_for_manual_trial_entry.");
    ["sourceRetrialPlanId", "sourceEvaluationId", "sourceTrialId", "sourcePlanId", "targetApprovalId", "targetImprovementRuleId"].forEach((field) => { if (check && record[field] !== check[field]) errors.push(`${field} mismatch.`); });
    if (check && record.registeredTrialId !== check.candidateTrialId) errors.push("registeredTrialId mismatch.");
    return { ok: errors.length === 0, errors };
  }

  function validateEntryRecord(recordInput, creationStore = normalizeCreationCheckStore(), trialStore = normalizeTrialStore(), entryStore = { entryRecords: [] }) {
    const record = normalizeEntryRecord(recordInput); const errors = [];
    ["entryRecordId", "sourceCreationCheckId", "sourceRetrialPlanId", "sourceEvaluationId", "sourceTrialId", "sourcePlanId", "targetApprovalId", "targetImprovementRuleId", "registeredTrialId", "registeredTrialName"].forEach((field) => { if (!text(record[field])) errors.push(`${field} is required.`); });
    errors.push(...validateSource(record, creationStore).errors);
    const trial = record.phase2215TrialSnapshot;
    if (!hasScope(trial)) errors.push("trial target scope is required.");
    if (!Number.isInteger(trial.maximumRaceCount) || trial.maximumRaceCount <= 0) errors.push("maximumRaceCount must be a positive integer.");
    if (trial.observationStartDate && trial.observationEndDate && trial.observationEndDate < trial.observationStartDate) errors.push("observationEndDate must not be before observationStartDate.");
    if (trial.trialStatus !== "awaiting_start_approval") errors.push("Phase22-19 trial snapshot must remain awaiting_start_approval.");
    if (trial.startedAt) errors.push("Phase22-19 must not start the trial.");
    if ((trialStore.trials || []).some((item) => text(item.trialId) === record.registeredTrialId)) errors.push("registeredTrialId already exists in Phase22-15.");
    if ((entryStore.entryRecords || []).some((item) => item.entryRecordId !== record.entryRecordId && item.sourceCreationCheckId === record.sourceCreationCheckId)) errors.push("duplicate sourceCreationCheckId.");
    if ((entryStore.entryRecords || []).some((item) => item.entryRecordId !== record.entryRecordId && item.registeredTrialId === record.registeredTrialId)) errors.push("duplicate registeredTrialId.");
    if (!isSafetyValid(record.safety) || !isSafetyValid(trial.safety)) errors.push("safety flags are invalid.");
    if (["registered", "awaiting_start_approval", "start_approved"].includes(record.entryStatus) && (!record.registeredBy || !record.registeredAt || !record.registrationReason || !record.registrationEvidence)) errors.push("manual registration record is incomplete.");
    if ((record.entryStatus === "start_approved" || record.entryDecision === "start_approved") && (!record.startApprover || !record.startApprovedAt || !record.startApprovalReason)) errors.push("manual start approval record is incomplete.");
    return { ok: errors.length === 0, errors };
  }

  function transitionEntryStatus(record, toStatus) {
    if (!ENTRY_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", record };
    if (!(ALLOWED_TRANSITIONS[record.entryStatus] || []).includes(toStatus)) return { transitioned: false, reason: "invalid_transition", record };
    return { transitioned: true, record: normalizeEntryRecord({ ...record, entryStatus: toStatus }) };
  }
  function recordManualRegistration(record, operator, registeredAt, reason, evidence) {
    if (TERMINAL_STATUSES.includes(record.entryStatus)) return { recorded: false, reason: "terminal_locked", record };
    if (![operator, registeredAt, reason, evidence].every(text)) return { recorded: false, reason: "missing_required_fields", record };
    return { recorded: true, record: normalizeEntryRecord({ ...record, entryStatus: "registered", entryDecision: "registered_for_manual_start_approval", registeredBy: operator, registeredAt, registrationReason: reason, registrationEvidence: evidence, phase2215TrialSnapshot: { ...record.phase2215TrialSnapshot, createdAt: record.phase2215TrialSnapshot.createdAt || registeredAt, updatedAt: registeredAt } }) };
  }
  function submitForStartApproval(record) { return record.entryStatus === "registered" ? { submitted: true, record: normalizeEntryRecord({ ...record, entryStatus: "awaiting_start_approval" }) } : { submitted: false, reason: "invalid_status", record }; }
  function approveManualStart(record, approver, approvedAt, reason) {
    if (record.entryStatus !== "awaiting_start_approval") return { approved: false, reason: "invalid_status", record };
    if (![approver, approvedAt, reason].every(text)) return { approved: false, reason: "missing_required_fields", record };
    return { approved: true, record: normalizeEntryRecord({ ...record, entryStatus: "start_approved", entryDecision: "start_approved", startApprover: approver, startApprovedAt: approvedAt, startApprovalReason: reason }) };
  }
  function returnForRevision(record, maker, returnedAt, reason) {
    if (!["registered", "awaiting_start_approval"].includes(record.entryStatus)) return { returned: false, reason: "invalid_status", record };
    if (![maker, returnedAt, reason].every(text)) return { returned: false, reason: "missing_required_fields", record };
    return { returned: true, record: normalizeEntryRecord({ ...record, entryStatus: "returned", entryDecision: "revision_required", returnedBy: maker, returnedAt, returnReason: reason }) };
  }
  function saveEntryStore(storage, store, now = new Date()) {
    const target = getStorage(storage); if (!target) return { saved: false, reason: "storage_unavailable" };
    try { target.setItem(STORAGE_KEY, JSON.stringify({ ...store, savedAt: now.toISOString(), entryRecords: (store.entryRecords || []).map(normalizeEntryRecord) })); return { saved: true }; }
    catch (error) { return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" }; }
  }
  function generatePlainText(store) {
    const lines = ["Phase22-19 Manual Retrial Entry / Start Approval Record", `Storage: ${STORAGE_KEY}`, "manual registration and manual start approval record only / no auto start / no production mutation"];
    (store.entryRecords || []).forEach((r) => lines.push("", `${r.entryRecordId} / ${r.registeredTrialId}`, `source: ${r.sourceCreationCheckId}`, `status: ${r.entryStatus}`, `decision: ${r.entryDecision}`));
    return lines.join("\n");
  }

  function bindEntryPanel(options = {}) {
    const doc = options.document || (root && root.document); if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-manual-retrial-entry-start-approval-core");
    if (!rootNode || rootNode.dataset.phase2219Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2219Bound = "true"; const storage = getStorage(options.storage);
    let creationStore = loadCreationCheckStore(storage).creationCheckStore; let entryLoad = loadEntryStore(storage, creationStore);
    const summary = doc.querySelector("#phase22-retrial-entry-summary"); const list = doc.querySelector("#phase22-retrial-entry-list");
    const output = doc.querySelector("#phase22-retrial-entry-text-output"); const message = doc.querySelector("#phase22-retrial-entry-message");
    function render() {
      if (summary) summary.textContent = `ready checks ${eligibleCreationChecks(creationStore).length} / entry records ${entryLoad.store.entryRecords.length}`;
      if (list) { list.replaceChildren(); entryLoad.store.entryRecords.forEach((record) => { const row = doc.createElement("div"); row.className = "phase22-retrial-entry-row"; [record.entryRecordId, record.registeredTrialId, record.entryStatus, record.entryDecision, "manual only", "no auto start"].forEach((value) => { const span = doc.createElement("span"); span.textContent = value; row.appendChild(span); }); list.appendChild(row); }); }
    }
    const actions = {
      "#phase22-retrial-entry-reload": () => { creationStore = loadCreationCheckStore(storage).creationCheckStore; entryLoad = loadEntryStore(storage, creationStore); render(); },
      "#phase22-retrial-entry-save": () => { const result = saveEntryStore(storage, entryLoad.store); if (message) message.textContent = result.saved ? "Saved." : "Save failed."; },
      "#phase22-retrial-entry-text": () => { if (output) output.value = generatePlainText(entryLoad.store); }
    };
    Object.keys(actions).forEach((selector) => { const button = doc.querySelector(selector); if (button) button.addEventListener("click", actions[selector]); });
    render(); return { initialized: true, actions, state: { entryLoad } };
  }

  if (root && root.document) { const start = () => bindEntryPanel(); if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }

  return { SCHEMA_VERSION, CREATION_CHECK_STORAGE_KEY, TRIAL_STORAGE_KEY, STORAGE_KEY, ENTRY_STATUSES, ENTRY_DECISIONS,
    normalizeCreationCheck, normalizeEntryRecord, normalizeEntryStore, loadCreationCheckStore, loadTrialStore, loadEntryStore,
    eligibleCreationChecks, buildPhase2215TrialSnapshot, buildEntryRecordFromCreationCheck, generateEntryRecordId,
    validateSource, validateEntryRecord, transitionEntryStatus, recordManualRegistration, submitForStartApproval,
    approveManualStart, returnForRevision, saveEntryStore, buildSafety, isSafetyValid, escapeHtml, generatePlainText, bindEntryPanel };
});