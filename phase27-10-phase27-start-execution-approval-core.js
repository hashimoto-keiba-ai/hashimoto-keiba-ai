(function (root, factory) {
  const dependency = typeof module === "object" && module.exports
    ? require("./phase27-9-phase27-start-preparation-core.js")
    : root.HashimotoPhase279StartPreparation;
  const api = factory(dependency);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2710StartExecutionApproval = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase279) {
  "use strict";
  if (!phase279) throw new Error("Phase27-9 definition is required");

  const STORAGE_KEY = "hashimoto.phase27.10.startExecutionApprovalRecords";
  const SCHEMA_VERSION = "27.10.1";
  const STATES = Object.freeze([
    "awaiting_manual_phase27_start_execution_approval", "manual_phase27_start_execution_approval_started",
    "manual_phase27_start_execution_approval_in_progress", "manual_phase27_start_execution_approval_paused",
    "manual_phase27_start_execution_approval_stopped", "manual_phase27_start_execution_approval_cancelled",
    "manual_phase27_start_execution_approval_failed", "manual_phase27_start_execution_approval_completed",
    "phase27_start_execution_approved", "phase27_start_execution_conditionally_approved",
    "phase27_start_execution_rejected", "phase27_start_execution_approval_incomplete",
    "returned_for_phase27_start_preparation", "returned_for_phase27_post_creation_acceptance",
    "correction_plan_required", "rollback_plan_required",
    "additional_evidence_required", "additional_review_required", "manual_investigation_required",
    "phase27_start_execution_approval_on_hold", "phase27_start_execution_approval_blocked",
    "ready_for_manual_phase27_start_execution", "invalidated", "expired"
  ]);
  const RESULT_STATUS_MAP = Object.freeze({
    approve_phase27_start_execution: "phase27_start_execution_approved",
    conditionally_approve_phase27_start_execution: "phase27_start_execution_conditionally_approved",
    reject_phase27_start_execution: "phase27_start_execution_rejected",
    start_execution_approval_incomplete: "phase27_start_execution_approval_incomplete",
    return_for_phase27_start_preparation: "returned_for_phase27_start_preparation",
    return_for_phase27_post_creation_acceptance: "returned_for_phase27_post_creation_acceptance",
    correction_plan_required: "correction_plan_required", rollback_plan_required: "rollback_plan_required",
    additional_evidence_required: "additional_evidence_required", additional_review_required: "additional_review_required",
    manual_investigation_required: "manual_investigation_required", hold: "phase27_start_execution_approval_on_hold",
    blocked: "phase27_start_execution_approval_blocked"
  });
  const RESULTS = Object.freeze(Object.keys(RESULT_STATUS_MAP));
  const SAFETY = Object.freeze({
    protectedMode: true, planOnly: true, privateLocalOnly: true,
    automaticPhase27StartExecutionApprovalAllowed: false, automaticPhase27StartExecutionAllowed: false,
    automaticPhase27StartAllowed: false, automaticNextPhaseStartAllowed: false,
    automaticConditionReleaseAllowed: false, automaticCorrectionAllowed: false, automaticRollbackAllowed: false,
    automaticCommitAllowed: false, automaticPushAllowed: false, automaticPrCreationAllowed: false,
    automaticMergeAllowed: false, automaticDataMigrationAllowed: false, automaticApplicationAllowed: false,
    automaticLearningAllowed: false, externalTransmissionAllowed: false, publicReleaseAllowed: false,
    sourceDataMutated: false, registeredDataMutated: false, appliedToPrediction: false,
    appliedToLearning: false, sentExternally: false, phase27AutomaticallyStarted: false,
    phase27StartExecutionAutomaticallyStarted: false, phase27StartExecutionApprovalAutomaticallyStarted: false
  });
  const REFERENCE_IDS = Object.freeze([
    "phase27StartPreparationId", "phase27PostCreationAcceptanceId", "phase27PostCreationVerificationDecisionId",
    "phase27PostCreationVerificationId", "phase27CreationExecutionId", "phase27CreationApprovalId",
    "phase27CreationPreparationId", "phase27StartApprovalId", "phase27StartReviewId",
    "phase27PreparationId", "phase26CompletionReviewId", "phase26FinalClosureId",
    "registrationRecordId", "sourceRecordId", "raceId", "targetRecordKey"
  ]);
  const REQUIRED_EVIDENCE = Object.freeze([
    "phase27StartPreparationSnapshot", "phase27PostCreationAcceptanceSnapshot", "phase27PostCreationVerificationDecisionSnapshot",
    "phase27PostCreationVerificationSnapshot", "phase27CreationExecutionSnapshot", "phase27CreationApprovalSnapshot",
    "phase27CreationPreparationSnapshot", "phase27StartApprovalSnapshot", "phase27StartReviewSnapshot",
    "phase27PreparationSnapshot", "phase26CompletionReviewSnapshot", "phase26FinalClosureSnapshot"
  ]);
  const PREPARATION_EVIDENCE = Object.freeze([
    "startExecutionApprovalBeforeSnapshot", "startExecutionApprovalAfterSnapshot", "phase27StartPreparationSnapshot",
    "phase27PostCreationVerificationDecisionSnapshot", "phase27PostCreationVerificationSnapshot",
    "phase27CreationExecutionSnapshot", "gitStateSnapshot", "testResultsSnapshot", "safetyBoundarySnapshot",
    "currentTargetSnapshot", "phase27StartExecutionApprovalInputSnapshot"
  ]);
  const APPROVAL_EVIDENCE = PREPARATION_EVIDENCE;
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
  function duplicateKey(record) { return REFERENCE_IDS.concat(["phase27StartPreparationSnapshotHash", "phase27StartPreparationVersion"]).map(key => `${key}:${record && record[key]}`).join("|"); }

  function validatePhase27StartPreparation(record, options) {
    const reasons = [];
    const now = Date.parse(timestamp(options));
    if (!record || record.phase27StartPreparationStatus !== "ready_for_manual_phase27_start_execution_approval") reasons.push("ready normal Phase27-8 acceptance required");
    if (!record || record.phase27StartPreparationResult !== "approve_phase27_start_preparation") reasons.push("normal preparation approval required");
    if (!record || record.invalidatedAt || record.phase27StartPreparationStatus === "invalidated") reasons.push("record invalidated");
    if (!record || !validDate(record.expiresAt) || Date.parse(record.expiresAt) <= now) reasons.push("unexpired record required");
    for (const key of REFERENCE_IDS) if (!record || !present(record[key])) reasons.push(`${key} required`);
    for (const key of REQUIRED_EVIDENCE) if (!record || !present(record[key])) reasons.push(`${key} required`);
    if (!record || !present(record.phase27StartPreparationSnapshot)) reasons.push("acceptance snapshot required");
    if (!record || record.phase27StartPreparationSnapshotHash !== computeSnapshotHash(record.phase27StartPreparationSnapshot)) reasons.push("snapshot hash mismatch");
    if (!record || !present(record.phase27StartPreparationVersion) || record.phase27StartPreparationVersion !== record.snapshotVersion) reasons.push("snapshot version mismatch");
    if (!record || !array(record.auditTrail).length) reasons.push("audit trail required");
    for (const key of ZERO_COUNTS) if (!record || !Number.isInteger(record[key]) || record[key] !== 0) reasons.push(`${key} must be zero`);
    if (!record || record.phase27Started !== false) reasons.push("Phase27 must not be started");
    if (!safetyIntact(record)) reasons.push("safety boundary violation");
    return freeze({ valid: reasons.length === 0, reasons: freeze(reasons) });
  }
  function extractPhase27StartExecutionApprovalCandidates(records, existing, options) {
    const activeKeys = new Set(array(existing).filter(item => !item.invalidatedAt && item.phase27StartExecutionApprovalStatus !== "invalidated" && item.phase27StartExecutionApprovalStatus !== "expired").map(duplicateKey));
    return freeze(array(records).filter(record => validatePhase27StartPreparation(record, options).valid && !activeKeys.has(duplicateKey(record))).map(immutable));
  }
  function createPhase27StartExecutionApprovalRecord(source, input, operation, options, existing) {
    const reasons = [...validatePhase27StartPreparation(source, options).reasons];
    if (!human(operation)) reasons.push("explicit human operation required");
    if (!input || !validDate(input.expiresAt) || Date.parse(input.expiresAt) <= Date.parse(timestamp(options))) reasons.push("valid expiry required");
    for (const key of ["approvedBy", "responsiblePerson", "reviewedBy", "confirmedBy", "executionOperator", "approvalDate", "scheduledStartDate", "scheduledStartTime", "approvalReason", "approvalScope", "startTarget", "excludedTargets", "startConditions", "stopConditions", "interruptionConditions", "rollbackConditions", "recoveryConditions", "rollbackPoint", "recoveryPoint", "gitStateSnapshot", "testResultsSnapshot", "safetyBoundarySnapshot"]) if (!input || !present(input[key])) reasons.push(`${key} required`);
    if (array(existing).some(item => !item.invalidatedAt && item.phase27StartExecutionApprovalStatus !== "invalidated" && item.phase27StartExecutionApprovalStatus !== "expired" && duplicateKey(item) === duplicateKey(source))) reasons.push("duplicate active approval record");
    if (reasons.length) return freeze({ created: false, reasons: freeze(reasons) });
    const at = timestamp(options);
    const record = { ...clone(input) };
    for (const key of REFERENCE_IDS) record[key] = source[key];
    for (const key of REQUIRED_EVIDENCE) record[key] = clone(source[key]);
    record.phase27StartPreparationSnapshotHash = source.phase27StartPreparationSnapshotHash;
    record.phase27StartPreparationVersion = source.phase27StartPreparationVersion;
    record.phase27StartExecutionApprovalBeforeSnapshot = clone(source);
    record.phase27StartExecutionApprovalInputSnapshot = clone(input);
    Object.assign(record, {
      phase27StartExecutionApprovalId: `phase27-start-execution-approval-${++sequence}`,
      phase27StartExecutionApprovalStatus: STATES[0], phase27StartExecutionApprovalResult: "", phase27Started: false,
      auditTrail: [{ event: "start_execution_approval_record_created", from: "", to: STATES[0], performedBy: operation.performedBy, performedAt: at, reason: operation.reason }],
      recordVersion: 1, createdAt: at, updatedAt: at, ...SAFETY
    });
    return freeze({ created: true, record: immutable(record), reasons: freeze([]) });
  }
  const TRANSITIONS = Object.freeze({
    [STATES[0]]: [STATES[1]], [STATES[1]]: [STATES[2], STATES[4], STATES[5], STATES[6]],
    [STATES[2]]: [STATES[3], STATES[4], STATES[5], STATES[6], STATES[7]],
    [STATES[3]]: [STATES[2], STATES[4], STATES[5], STATES[6]], [STATES[7]]: STATES.slice(8, 21),
    [STATES[8]]: [STATES[21]]
  });
  function transition(record, to, event, operation, options, changes) {
    if (!human(operation) || !record || !array(TRANSITIONS[record.phase27StartExecutionApprovalStatus]).includes(to) || !safetyIntact(record)) return freeze({ transitioned: false, record });
    const next = { ...clone(record), ...clone(changes || {}), previousStatus: record.phase27StartExecutionApprovalStatus, phase27StartExecutionApprovalStatus: to, recordVersion: record.recordVersion + 1, updatedAt: timestamp(options) };
    next.auditTrail = array(record.auditTrail).concat({ event, from: record.phase27StartExecutionApprovalStatus, to, performedBy: operation.performedBy, performedAt: timestamp(options), reason: operation.reason });
    return freeze({ transitioned: true, record: immutable(next) });
  }
  const startPhase27StartExecutionApproval = (r, o, p) => transition(r, STATES[1], "start_execution_approval_started", o, p, { approvalStartedAt: timestamp(p) });
  const progressPhase27StartExecutionApproval = (r, o, p) => transition(r, STATES[2], "start_execution_approval_progressed", o, p);
  const pausePhase27StartExecutionApproval = (r, o, p) => transition(r, STATES[3], "start_execution_approval_paused", o, p);
  const resumePhase27StartExecutionApproval = (r, o, p) => transition(r, STATES[2], "start_execution_approval_resumed", o, p);
  const stopPhase27StartExecutionApproval = (r, o, p) => transition(r, STATES[4], "start_execution_approval_stopped", o, p);
  const cancelPhase27StartExecutionApproval = (r, o, p) => transition(r, STATES[5], "start_execution_approval_cancelled", o, p);
  const failPhase27StartExecutionApproval = (r, o, p) => transition(r, STATES[6], "start_execution_approval_failed", o, p);
  function updatePhase27StartExecutionApproval(record, changes, operation, options) {
    if (!human(operation) || !record || ![STATES[1], STATES[2], STATES[3]].includes(record.phase27StartExecutionApprovalStatus) || !safetyIntact(record)) return freeze({ updated: false, record });
    const forbidden = REFERENCE_IDS.concat(Object.keys(SAFETY), ["phase27StartExecutionApprovalId", "auditTrail", "recordVersion", "createdAt"]);
    if (!changes || Object.keys(changes).some(key => forbidden.includes(key))) return freeze({ updated: false, record });
    const next = { ...clone(record), ...clone(changes), recordVersion: record.recordVersion + 1, updatedAt: timestamp(options) };
    next.auditTrail = array(record.auditTrail).concat({ event: "start_execution_approval_information_updated", from: record.phase27StartExecutionApprovalStatus, to: record.phase27StartExecutionApprovalStatus, performedBy: operation.performedBy, performedAt: timestamp(options), reason: operation.reason });
    return freeze({ updated: true, record: immutable(next) });
  }
  function approvalChecks(record) {
    const reasons = [];
    for (const key of PREPARATION_EVIDENCE) if (!record || !present(record[key])) reasons.push(`${key} required`);
    for (const key of ZERO_COUNTS.concat(["htmlDuplicateIdCount", "dangerousApiCount"])) if (!record || !Number.isInteger(record[key]) || record[key] !== 0) reasons.push(`${key} must be zero`);
    for (const key of ["workingTreeClean", "mainOriginMainMatch", "gitDiffCheckPassed"]) if (!record || record[key] !== true) reasons.push(`${key} required`);
    for (const key of ["unexpectedCommit", "unexpectedFile"]) if (!record || record[key] !== false) reasons.push(`${key} must be false`);
    for (const key of ["rollbackPoint", "recoveryPoint", "startTarget", "startConditions", "stopConditions", "interruptionConditions", "rollbackConditions", "recoveryConditions", "approvedBy", "responsiblePerson", "executionOperator"]) if (!record || !present(record[key])) reasons.push(`${key} required`);
    if (!record || record.phase27Started !== false || !safetyIntact(record)) reasons.push("safety boundary violation");
    return reasons;
  }
  function decidePhase27StartExecutionApproval(record, decision, operation, options) {
    if (!record || record.phase27StartExecutionApprovalStatus !== STATES[2]) return freeze({ completed: false, record, reasons: freeze(["approval in progress required"]) });
    if (!decision || !RESULTS.includes(decision.result)) return freeze({ completed: false, record, reasons: freeze(["unknown result"]) });
    if (!human(operation)) return freeze({ completed: false, record, reasons: freeze(["explicit human operation required"]) });
    const reasons = [];
    if (decision.result === "approve_phase27_start_execution") reasons.push(...approvalChecks({ ...record, ...decision }));
    if (decision.result === "conditionally_approve_phase27_start_execution") for (const key of ["conditions", "conditionReason", "conditionOwner", "conditionReviewer", "conditionDeadline", "conditionVerificationMethod", "conditionReleaseCriteria", "conditionFailureAction", "releaseRequiredBeforeStartExecution", "correctionPlanRequired", "rollbackPlanRequired", "additionalEvidence", "notes"]) if (!present(decision[key]) && typeof decision[key] !== "boolean") reasons.push(`${key} required`);
    if (reasons.length) return freeze({ completed: false, record, reasons: freeze(reasons) });
    let result = transition(record, STATES[7], "start_execution_approval_completed", operation, options, { ...clone(decision), phase27StartExecutionApprovalResult: decision.result, approvalCompletedAt: timestamp(options) });
    result = transition(result.record, RESULT_STATUS_MAP[decision.result], "start_execution_approval_result_recorded", operation, options);
    return freeze({ completed: result.transitioned, record: result.record, reasons: freeze([]) });
  }
  const completePhase27StartExecutionApproval = decidePhase27StartExecutionApproval;
  function advanceToPhase27StartExecution(record, operation, options) {
    const result = transition(record, STATES[21], "ready_for_manual_phase27_start_execution", operation, options, { phase27Started: false, phase27AutomaticallyStarted: false, phase27StartExecutionAutomaticallyStarted: false, phase27StartExecutionApprovalAutomaticallyStarted: false });
    return freeze({ advanced: result.transitioned, record: result.record });
  }
  function invalidatePhase27StartExecutionApproval(record, operation, options) { if (!human(operation) || !record || [STATES[22], STATES[23]].includes(record.phase27StartExecutionApprovalStatus)) return freeze({ transitioned: false, record }); const next = { ...clone(record), previousStatus: record.phase27StartExecutionApprovalStatus, phase27StartExecutionApprovalStatus: STATES[22], invalidatedAt: timestamp(options), recordVersion: record.recordVersion + 1, updatedAt: timestamp(options), auditTrail: array(record.auditTrail).concat({ event: "start_execution_approval_invalidated", from: record.phase27StartExecutionApprovalStatus, to: STATES[22], performedBy: operation.performedBy, performedAt: timestamp(options), reason: operation.reason }) }; return freeze({ transitioned: true, record: immutable(next) }); }
  function expirePhase27StartExecutionApproval(record, options) { if (!record || !validDate(record.expiresAt) || Date.parse(record.expiresAt) > Date.parse(timestamp(options)) || [STATES[22], STATES[23]].includes(record.phase27StartExecutionApprovalStatus)) return freeze({ expired: false, record }); const next = { ...clone(record), previousStatus: record.phase27StartExecutionApprovalStatus, phase27StartExecutionApprovalStatus: STATES[23], expiredAt: timestamp(options), recordVersion: record.recordVersion + 1, updatedAt: timestamp(options), auditTrail: array(record.auditTrail).concat({ event: "start_execution_approval_expired", from: record.phase27StartExecutionApprovalStatus, to: STATES[23], performedBy: "system-clock", performedAt: timestamp(options), reason: "record expiry reached" }) }; return freeze({ expired: true, record: immutable(next) }); }
  function savePhase27StartExecutionApprovalRecords(storage, records) { try { storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, records: clone(array(records)) })); return freeze({ saved: true }); } catch (_) { return freeze({ saved: false }); } }
  function loadPhase27StartExecutionApprovalRecords(storage) { try { const data = JSON.parse(storage.getItem(STORAGE_KEY) || "{}"); const loaded = data.schemaVersion === SCHEMA_VERSION && Array.isArray(data.records); return freeze({ loaded, records: loaded ? freeze(data.records.map(immutable)) : freeze([]) }); } catch (_) { return freeze({ loaded: false, records: freeze([]) }); } }
  return freeze({ PHASE279_REFERENCE: phase279, STORAGE_KEY, SCHEMA_VERSION, STATES, RESULTS, RESULT_STATUS_MAP, SAFETY, REFERENCE_IDS, REQUIRED_EVIDENCE, APPROVAL_EVIDENCE, PREPARATION_EVIDENCE, ZERO_COUNTS, computeSnapshotHash, resetRegistry, validatePhase27StartPreparation, extractPhase27StartExecutionApprovalCandidates, createPhase27StartExecutionApprovalRecord, startPhase27StartExecutionApproval, progressPhase27StartExecutionApproval, pausePhase27StartExecutionApproval, resumePhase27StartExecutionApproval, stopPhase27StartExecutionApproval, cancelPhase27StartExecutionApproval, failPhase27StartExecutionApproval, updatePhase27StartExecutionApproval, completePhase27StartExecutionApproval, decidePhase27StartExecutionApproval, advanceToPhase27StartExecution, invalidatePhase27StartExecutionApproval, expirePhase27StartExecutionApproval, savePhase27StartExecutionApprovalRecords, loadPhase27StartExecutionApprovalRecords });
});
