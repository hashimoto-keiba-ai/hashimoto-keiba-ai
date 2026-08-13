(function (root, factory) {
  const dependency = typeof module === "object" && module.exports
    ? require("./phase27-8-phase27-post-creation-acceptance-core.js")
    : root.HashimotoPhase278PostCreationAcceptance;
  const api = factory(dependency);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase279StartPreparation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase278) {
  "use strict";
  if (!phase278) throw new Error("Phase27-8 definition is required");

  const STORAGE_KEY = "hashimoto.phase27.9.startPreparationRecords";
  const SCHEMA_VERSION = "27.9.1";
  const STATES = Object.freeze([
    "awaiting_manual_phase27_start_preparation", "manual_phase27_start_preparation_started",
    "manual_phase27_start_preparation_in_progress", "manual_phase27_start_preparation_paused",
    "manual_phase27_start_preparation_stopped", "manual_phase27_start_preparation_cancelled",
    "manual_phase27_start_preparation_failed", "manual_phase27_start_preparation_completed",
    "phase27_start_preparation_approved", "phase27_start_preparation_conditionally_approved",
    "phase27_start_preparation_rejected", "phase27_start_preparation_incomplete",
    "returned_for_phase27_post_creation_acceptance", "returned_for_phase27_post_creation_verification_decision",
    "returned_for_phase27_post_creation_verification", "correction_plan_required", "rollback_plan_required",
    "additional_evidence_required", "additional_review_required", "manual_investigation_required",
    "phase27_start_preparation_on_hold", "phase27_start_preparation_blocked",
    "ready_for_manual_phase27_start_execution_approval", "invalidated", "expired"
  ]);
  const RESULT_STATUS_MAP = Object.freeze({
    approve_phase27_start_preparation: "phase27_start_preparation_approved",
    conditionally_approve_phase27_start_preparation: "phase27_start_preparation_conditionally_approved",
    reject_phase27_start_preparation: "phase27_start_preparation_rejected",
    start_preparation_incomplete: "phase27_start_preparation_incomplete",
    return_for_phase27_post_creation_acceptance: "returned_for_phase27_post_creation_acceptance",
    return_for_phase27_post_creation_verification_decision: "returned_for_phase27_post_creation_verification_decision",
    return_for_phase27_post_creation_verification: "returned_for_phase27_post_creation_verification",
    correction_plan_required: "correction_plan_required", rollback_plan_required: "rollback_plan_required",
    additional_evidence_required: "additional_evidence_required", additional_review_required: "additional_review_required",
    manual_investigation_required: "manual_investigation_required", hold: "phase27_start_preparation_on_hold",
    blocked: "phase27_start_preparation_blocked"
  });
  const RESULTS = Object.freeze(Object.keys(RESULT_STATUS_MAP));
  const SAFETY = Object.freeze({
    protectedMode: true, planOnly: true, privateLocalOnly: true,
    automaticPhase27StartPreparationAllowed: false, automaticPhase27StartExecutionApprovalAllowed: false,
    automaticPhase27StartAllowed: false, automaticNextPhaseStartAllowed: false,
    automaticConditionReleaseAllowed: false, automaticCorrectionAllowed: false, automaticRollbackAllowed: false,
    automaticCommitAllowed: false, automaticPushAllowed: false, automaticPrCreationAllowed: false,
    automaticMergeAllowed: false, automaticDataMigrationAllowed: false, automaticApplicationAllowed: false,
    automaticLearningAllowed: false, externalTransmissionAllowed: false, publicReleaseAllowed: false,
    sourceDataMutated: false, registeredDataMutated: false, appliedToPrediction: false,
    appliedToLearning: false, sentExternally: false, phase27AutomaticallyStarted: false,
    phase27StartExecutionApprovalAutomaticallyStarted: false
  });
  const REFERENCE_IDS = Object.freeze([
    "phase27PostCreationAcceptanceId", "phase27PostCreationVerificationDecisionId",
    "phase27PostCreationVerificationId", "phase27CreationExecutionId", "phase27CreationApprovalId",
    "phase27CreationPreparationId", "phase27StartApprovalId", "phase27StartReviewId",
    "phase27PreparationId", "phase26CompletionReviewId", "phase26FinalClosureId",
    "registrationRecordId", "sourceRecordId", "raceId", "targetRecordKey"
  ]);
  const REQUIRED_EVIDENCE = Object.freeze([
    "phase27PostCreationAcceptanceSnapshot", "phase27PostCreationVerificationDecisionSnapshot",
    "phase27PostCreationVerificationSnapshot", "phase27CreationExecutionSnapshot"
  ]);
  const PREPARATION_EVIDENCE = Object.freeze([
    "startPreparationBeforeSnapshot", "startPreparationAfterSnapshot", "phase27PostCreationAcceptanceSnapshot",
    "phase27PostCreationVerificationDecisionSnapshot", "phase27PostCreationVerificationSnapshot",
    "phase27CreationExecutionSnapshot", "gitStateSnapshot", "testResultsSnapshot", "safetyBoundarySnapshot",
    "currentTargetSnapshot", "phase27StartPreparationInputSnapshot"
  ]);
  const ZERO_COUNTS = Object.freeze([
    "failedTestCount", "notExecutedRequiredTestCount", "criticalIssueCount", "blockingConditionCount",
    "pendingQuestionCount", "pendingCorrectionCount", "pendingRollbackCount", "pendingInvestigationCount",
    "pendingReviewCount", "duplicateCount", "missingCount", "orphanCount", "overwriteCount",
    "hashMismatchCount", "versionMismatchCount", "unapprovedDifferenceCount", "unresolvedIssueCount"
  ]);
  let sequence = 0;
  const freeze = Object.freeze;
  const array = value => Array.isArray(value) ? value : [];
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const present = value => value !== null && value !== undefined && (typeof value !== "string" || value.trim() !== "") && (!Array.isArray(value) || value.length > 0) && (typeof value !== "object" || Array.isArray(value) || Object.keys(value).length > 0);
  const timestamp = options => new Date(options && options.now ? options.now() : new Date()).toISOString();
  const validDate = value => typeof value === "string" && Number.isFinite(Date.parse(value));
  const human = operation => operation && present(operation.performedBy) && present(operation.reason) && operation.explicitConfirmation === true && (!operation.performedAt || validDate(operation.performedAt));
  const stable = value => value && typeof value === "object" && !Array.isArray(value)
    ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`
    : Array.isArray(value) ? `[${value.map(stable).join(",")}]` : JSON.stringify(value);
  function computeSnapshotHash(value) {
    let hash = 2166136261;
    for (const char of stable(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }
  function immutable(value) { return freeze(clone(value)); }
  function resetRegistry() { sequence = 0; }
  function safetyIntact(record) { return Object.keys(SAFETY).every(key => record && record[key] === SAFETY[key]); }
  function duplicateKey(record) { return REFERENCE_IDS.concat(["phase27PostCreationAcceptanceSnapshotHash", "phase27PostCreationAcceptanceVersion"]).map(key => `${key}:${record && record[key]}`).join("|"); }

  function validatePhase27PostCreationAcceptance(record, options) {
    const reasons = [];
    const now = Date.parse(timestamp(options));
    if (!record || record.phase27PostCreationAcceptanceStatus !== "ready_for_manual_phase27_start_preparation") reasons.push("ready normal Phase27-8 acceptance required");
    if (!record || record.phase27PostCreationAcceptanceResult !== "accept_phase27_post_creation") reasons.push("normal acceptance result required");
    if (!record || record.invalidatedAt || record.phase27PostCreationAcceptanceStatus === "invalidated") reasons.push("record invalidated");
    if (!record || !validDate(record.expiresAt) || Date.parse(record.expiresAt) <= now) reasons.push("unexpired record required");
    for (const key of REFERENCE_IDS) if (!record || !present(record[key])) reasons.push(`${key} required`);
    for (const key of REQUIRED_EVIDENCE) if (!record || !present(record[key])) reasons.push(`${key} required`);
    if (!record || !present(record.phase27PostCreationAcceptanceSnapshot)) reasons.push("acceptance snapshot required");
    if (!record || record.phase27PostCreationAcceptanceSnapshotHash !== computeSnapshotHash(record.phase27PostCreationAcceptanceSnapshot)) reasons.push("snapshot hash mismatch");
    if (!record || !present(record.phase27PostCreationAcceptanceVersion) || record.phase27PostCreationAcceptanceVersion !== record.snapshotVersion) reasons.push("snapshot version mismatch");
    if (!record || !array(record.auditTrail).length) reasons.push("audit trail required");
    for (const key of ZERO_COUNTS) if (!record || !Number.isInteger(record[key]) || record[key] !== 0) reasons.push(`${key} must be zero`);
    if (!record || record.phase27Started !== false) reasons.push("Phase27 must not be started");
    if (!safetyIntact(record)) reasons.push("safety boundary violation");
    return freeze({ valid: reasons.length === 0, reasons: freeze(reasons) });
  }
  function extractPhase27StartPreparationCandidates(records, existing, options) {
    const activeKeys = new Set(array(existing).filter(item => !item.invalidatedAt && item.phase27StartPreparationStatus !== "invalidated" && item.phase27StartPreparationStatus !== "expired").map(duplicateKey));
    return freeze(array(records).filter(record => validatePhase27PostCreationAcceptance(record, options).valid && !activeKeys.has(duplicateKey(record))).map(immutable));
  }
  function createPhase27StartPreparationRecord(source, input, operation, options, existing) {
    const reasons = [...validatePhase27PostCreationAcceptance(source, options).reasons];
    if (!human(operation)) reasons.push("explicit human operation required");
    if (!input || !validDate(input.expiresAt) || Date.parse(input.expiresAt) <= Date.parse(timestamp(options))) reasons.push("valid expiry required");
    for (const key of ["preparedBy", "responsiblePerson", "reviewedBy", "confirmedBy", "preparationDate", "scheduledStartDate", "scheduledStartTime", "device", "location", "preparationMethod", "preparationReason", "preparationScope", "startTarget", "excludedTargets", "startProcedure", "startConditions", "stopConditions", "interruptionConditions", "rollbackConditions", "recoveryConditions"]) if (!input || !present(input[key])) reasons.push(`${key} required`);
    if (array(existing).some(item => !item.invalidatedAt && item.phase27StartPreparationStatus !== "invalidated" && item.phase27StartPreparationStatus !== "expired" && duplicateKey(item) === duplicateKey(source))) reasons.push("duplicate active preparation record");
    if (reasons.length) return freeze({ created: false, reasons: freeze(reasons) });
    const at = timestamp(options);
    const record = { ...clone(input) };
    for (const key of REFERENCE_IDS) record[key] = source[key];
    record.phase27PostCreationAcceptanceSnapshotHash = source.phase27PostCreationAcceptanceSnapshotHash;
    record.phase27PostCreationAcceptanceVersion = source.phase27PostCreationAcceptanceVersion;
    Object.assign(record, {
      phase27StartPreparationId: `phase27-start-preparation-${++sequence}`,
      phase27StartPreparationStatus: STATES[0], phase27StartPreparationResult: "", phase27Started: false,
      auditTrail: [{ event: "start_preparation_record_created", from: "", to: STATES[0], performedBy: operation.performedBy, performedAt: at, reason: operation.reason }],
      recordVersion: 1, createdAt: at, updatedAt: at, ...SAFETY
    });
    return freeze({ created: true, record: immutable(record), reasons: freeze([]) });
  }
  const TRANSITIONS = Object.freeze({
    [STATES[0]]: [STATES[1]], [STATES[1]]: [STATES[2], STATES[4], STATES[5], STATES[6]],
    [STATES[2]]: [STATES[3], STATES[4], STATES[5], STATES[6], STATES[7]],
    [STATES[3]]: [STATES[2], STATES[4], STATES[5], STATES[6]], [STATES[7]]: STATES.slice(8, 22),
    [STATES[8]]: [STATES[22]]
  });
  function transition(record, to, event, operation, options, changes) {
    if (!human(operation) || !record || !array(TRANSITIONS[record.phase27StartPreparationStatus]).includes(to) || !safetyIntact(record)) return freeze({ transitioned: false, record });
    const next = { ...clone(record), ...clone(changes || {}), previousStatus: record.phase27StartPreparationStatus, phase27StartPreparationStatus: to, recordVersion: record.recordVersion + 1, updatedAt: timestamp(options) };
    next.auditTrail = array(record.auditTrail).concat({ event, from: record.phase27StartPreparationStatus, to, performedBy: operation.performedBy, performedAt: timestamp(options), reason: operation.reason });
    return freeze({ transitioned: true, record: immutable(next) });
  }
  const startPhase27StartPreparation = (r, o, p) => transition(r, STATES[1], "start_preparation_started", o, p, { preparationStartedAt: timestamp(p) });
  const progressPhase27StartPreparation = (r, o, p) => transition(r, STATES[2], "start_preparation_progressed", o, p);
  const pausePhase27StartPreparation = (r, o, p) => transition(r, STATES[3], "start_preparation_paused", o, p);
  const resumePhase27StartPreparation = (r, o, p) => transition(r, STATES[2], "start_preparation_resumed", o, p);
  const stopPhase27StartPreparation = (r, o, p) => transition(r, STATES[4], "start_preparation_stopped", o, p);
  const cancelPhase27StartPreparation = (r, o, p) => transition(r, STATES[5], "start_preparation_cancelled", o, p);
  const failPhase27StartPreparation = (r, o, p) => transition(r, STATES[6], "start_preparation_failed", o, p);
  function updatePhase27StartPreparation(record, changes, operation, options) {
    if (!human(operation) || !record || ![STATES[1], STATES[2], STATES[3]].includes(record.phase27StartPreparationStatus) || !safetyIntact(record)) return freeze({ updated: false, record });
    const forbidden = REFERENCE_IDS.concat(Object.keys(SAFETY), ["phase27StartPreparationId", "auditTrail", "recordVersion", "createdAt"]);
    if (!changes || Object.keys(changes).some(key => forbidden.includes(key))) return freeze({ updated: false, record });
    const next = { ...clone(record), ...clone(changes), recordVersion: record.recordVersion + 1, updatedAt: timestamp(options) };
    next.auditTrail = array(record.auditTrail).concat({ event: "start_preparation_information_updated", from: record.phase27StartPreparationStatus, to: record.phase27StartPreparationStatus, performedBy: operation.performedBy, performedAt: timestamp(options), reason: operation.reason });
    return freeze({ updated: true, record: immutable(next) });
  }
  function approvalChecks(record) {
    const reasons = [];
    for (const key of PREPARATION_EVIDENCE) if (!record || !present(record[key])) reasons.push(`${key} required`);
    for (const key of ZERO_COUNTS.concat(["htmlDuplicateIdCount", "dangerousApiCount"])) if (!record || !Number.isInteger(record[key]) || record[key] !== 0) reasons.push(`${key} must be zero`);
    for (const key of ["workingTreeClean", "mainOriginMainMatch", "gitDiffCheckPassed"]) if (!record || record[key] !== true) reasons.push(`${key} required`);
    for (const key of ["unexpectedCommit", "unexpectedFile"]) if (!record || record[key] !== false) reasons.push(`${key} must be false`);
    for (const key of ["rollbackPoint", "recoveryPoint", "startTarget", "startConditions", "stopConditions", "preparedBy", "responsiblePerson"]) if (!record || !present(record[key])) reasons.push(`${key} required`);
    if (!record || record.phase27Started !== false || !safetyIntact(record)) reasons.push("safety boundary violation");
    return reasons;
  }
  function decidePhase27StartPreparation(record, decision, operation, options) {
    if (!record || record.phase27StartPreparationStatus !== STATES[2]) return freeze({ completed: false, record, reasons: freeze(["preparation in progress required"]) });
    if (!decision || !RESULTS.includes(decision.result)) return freeze({ completed: false, record, reasons: freeze(["unknown result"]) });
    if (!human(operation)) return freeze({ completed: false, record, reasons: freeze(["explicit human operation required"]) });
    const reasons = [];
    if (decision.result === "approve_phase27_start_preparation") reasons.push(...approvalChecks({ ...record, ...decision }));
    if (decision.result === "conditionally_approve_phase27_start_preparation") for (const key of ["conditions", "conditionReason", "conditionOwner", "conditionReviewer", "conditionDeadline", "conditionVerificationMethod", "conditionReleaseCriteria", "conditionFailureAction", "releaseRequiredBeforeStartExecutionApproval", "correctionPlanRequired", "rollbackPlanRequired", "additionalEvidence", "notes"]) if (!present(decision[key]) && typeof decision[key] !== "boolean") reasons.push(`${key} required`);
    if (reasons.length) return freeze({ completed: false, record, reasons: freeze(reasons) });
    let result = transition(record, STATES[7], "start_preparation_completed", operation, options, { ...clone(decision), phase27StartPreparationResult: decision.result, preparationCompletedAt: timestamp(options) });
    result = transition(result.record, RESULT_STATUS_MAP[decision.result], "start_preparation_result_recorded", operation, options);
    return freeze({ completed: result.transitioned, record: result.record, reasons: freeze([]) });
  }
  const completePhase27StartPreparation = decidePhase27StartPreparation;
  function advanceToPhase27StartExecutionApproval(record, operation, options) {
    const result = transition(record, STATES[22], "ready_for_manual_phase27_start_execution_approval", operation, options, { phase27Started: false, phase27AutomaticallyStarted: false, phase27StartExecutionApprovalAutomaticallyStarted: false });
    return freeze({ advanced: result.transitioned, record: result.record });
  }
  function invalidatePhase27StartPreparation(record, operation, options) { const result = transition({ ...clone(record), phase27StartPreparationStatus: record.phase27StartPreparationStatus, ...(TRANSITIONS[record.phase27StartPreparationStatus] ? {} : {}) }, STATES[23], "start_preparation_invalidated", operation, options, { invalidatedAt: timestamp(options) }); if (!result.transitioned && human(operation) && record && ![STATES[23], STATES[24]].includes(record.phase27StartPreparationStatus)) { const next = { ...clone(record), phase27StartPreparationStatus: STATES[23], invalidatedAt: timestamp(options), recordVersion: record.recordVersion + 1, updatedAt: timestamp(options), auditTrail: array(record.auditTrail).concat({ event: "start_preparation_invalidated", from: record.phase27StartPreparationStatus, to: STATES[23], performedBy: operation.performedBy, performedAt: timestamp(options), reason: operation.reason }) }; return freeze({ transitioned: true, record: immutable(next) }); } return result; }
  function expirePhase27StartPreparation(record, options) { if (!record || !validDate(record.expiresAt) || Date.parse(record.expiresAt) > Date.parse(timestamp(options)) || [STATES[23], STATES[24]].includes(record.phase27StartPreparationStatus)) return freeze({ expired: false, record }); const next = { ...clone(record), previousStatus: record.phase27StartPreparationStatus, phase27StartPreparationStatus: STATES[24], expiredAt: timestamp(options), recordVersion: record.recordVersion + 1, updatedAt: timestamp(options), auditTrail: array(record.auditTrail).concat({ event: "start_preparation_expired", from: record.phase27StartPreparationStatus, to: STATES[24], performedBy: "system-clock", performedAt: timestamp(options), reason: "record expiry reached" }) }; return freeze({ expired: true, record: immutable(next) }); }
  function savePhase27StartPreparationRecords(storage, records) { try { storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, records: clone(array(records)) })); return freeze({ saved: true }); } catch (_) { return freeze({ saved: false }); } }
  function loadPhase27StartPreparationRecords(storage) { try { const data = JSON.parse(storage.getItem(STORAGE_KEY) || "{}"); const loaded = data.schemaVersion === SCHEMA_VERSION && Array.isArray(data.records); return freeze({ loaded, records: loaded ? freeze(data.records.map(immutable)) : freeze([]) }); } catch (_) { return freeze({ loaded: false, records: freeze([]) }); } }
  return freeze({ PHASE278_REFERENCE: phase278, STORAGE_KEY, SCHEMA_VERSION, STATES, RESULTS, RESULT_STATUS_MAP, SAFETY, REFERENCE_IDS, REQUIRED_EVIDENCE, PREPARATION_EVIDENCE, ZERO_COUNTS, computeSnapshotHash, resetRegistry, validatePhase27PostCreationAcceptance, extractPhase27StartPreparationCandidates, createPhase27StartPreparationRecord, startPhase27StartPreparation, progressPhase27StartPreparation, pausePhase27StartPreparation, resumePhase27StartPreparation, stopPhase27StartPreparation, cancelPhase27StartPreparation, failPhase27StartPreparation, updatePhase27StartPreparation, completePhase27StartPreparation, decidePhase27StartPreparation, advanceToPhase27StartExecutionApproval, invalidatePhase27StartPreparation, expirePhase27StartPreparation, savePhase27StartPreparationRecords, loadPhase27StartPreparationRecords });
});
