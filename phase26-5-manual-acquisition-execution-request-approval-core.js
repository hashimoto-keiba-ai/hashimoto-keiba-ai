(function (root, factory) {
  const load = (path, name) => typeof module === "object" && module.exports ? require(path) : root[name];
  const api = factory(
    load("./phase26-1-external-data-acquisition-boundary.js", "HashimotoPhase261ExternalDataAcquisitionBoundary"),
    load("./phase26-2-manual-acquisition-request-precheck-core.js", "HashimotoPhase262ManualAcquisitionRequestPrecheck"),
    load("./phase26-3-manual-acquisition-approval-prestart-record-core.js", "HashimotoPhase263ManualAcquisitionApprovalPrestartRecord"),
    load("./phase26-4-manual-acquisition-start-request-final-check-core.js", "HashimotoPhase264ManualAcquisitionStartRequestFinalCheck")
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase265ManualAcquisitionExecutionRequestApproval = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase261, phase262, phase263, phase264) {
  "use strict";
  if (!phase261 || !phase262 || !phase263 || !phase264) throw new Error("Phase26-1 through Phase26-4 definitions are required");

  const deepFreeze = value => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
    }
    return value;
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const text = value => typeof value === "string" ? value.trim() : "";
  const unique = values => [...new Set(Array.isArray(values) ? values : [])];
  const nowDate = options => new Date(options && typeof options.now === "function" ? options.now() : new Date());

  const PHASE261_DEFINITION = phase261.definition();
  const PHASE262_REFERENCE = phase262;
  const PHASE263_REFERENCE = phase263;
  const PHASE264_REFERENCE = phase264;
  const EXECUTION_REQUEST_STATES = deepFreeze([
    "awaiting_manual_execution_request", "execution_request_blocked", "execution_request_recorded",
    "awaiting_manual_execution_approval", "execution_approval_blocked", "execution_approval_recorded",
    "execution_preflight_in_progress", "execution_preflight_blocked",
    "ready_for_manual_execution_record", "rejected", "cancelled", "expired"
  ]);
  const EXECUTION_PREFLIGHT_CHECKS = deepFreeze([
    "startRequestIdentityConfirmed", "startRequestSnapshotConfirmed", "approvalSnapshotConfirmed",
    "requestSnapshotConfirmed", "requesterConfirmed", "requestTimeConfirmed", "requestReasonConfirmed",
    "operatorRoleConfirmed", "executionApproverConfirmed", "executionApprovalTimeConfirmed",
    "executionApprovalReasonConfirmed", "executionApproverRoleConfirmed", "sourceConfirmed",
    "sourceTrustConfirmed", "targetRaceConfirmed", "targetDataConfirmed", "dataTimepointConfirmed",
    "expectedRecordCountConfirmed", "purposeConfirmed", "consentConfirmed", "termsConfirmed",
    "accessRestrictionConfirmed", "noCredentialsRequiredConfirmed", "noCredentialsStoredConfirmed",
    "noExternalCommunicationYetConfirmed", "noExternalRequestDispatchedConfirmed",
    "noExternalResponseReceivedConfirmed", "noAutomaticAcquisitionConfirmed",
    "noScheduledAcquisitionConfirmed", "noUnattendedAcquisitionConfirmed",
    "noAutomaticPurchaseConfirmed", "noAutomaticApplicationConfirmed",
    "noAutomaticLearningUpdateConfirmed", "previewRequirementConfirmed",
    "manualApprovalRequirementConfirmed", "acquisitionNotStartedConfirmed",
    "acquisitionNotExecutedConfirmed", "acquisitionNotCompletedConfirmed",
    "startNotAuthorizedConfirmed", "executionNotAuthorizedConfirmed", "executionWindowConfirmed",
    "stopConditionsConfirmed", "cancellationConditionsConfirmed", "operatorResponsibilityConfirmed",
    "finalHumanExecutionConfirmation"
  ]);
  const PREFLIGHT_RESULTS = deepFreeze([
    "incomplete", "blocked_by_invalid_start_request_status", "blocked_by_start_request_validation",
    "blocked_by_existing_final_reasons", "blocked_by_missing_execution_requester",
    "blocked_by_invalid_execution_request_time", "blocked_by_missing_execution_reason",
    "blocked_by_missing_operator_role", "blocked_by_reserved_identity",
    "blocked_by_missing_execution_approver", "blocked_by_invalid_execution_approval_time",
    "blocked_by_missing_execution_approval_reason", "blocked_by_missing_execution_approver_role",
    "blocked_by_incomplete_execution_preflight", "blocked_by_invalid_execution_window",
    "blocked_by_credentials_requirement", "blocked_by_safety_flag_mismatch",
    "blocked_by_already_started", "blocked_by_already_executed", "blocked_by_already_completed",
    "blocked_by_existing_authorization", "blocked_by_expiration", "execution_request_recorded",
    "execution_approval_recorded", "ready_for_manual_execution_record"
  ]);
  const SAFE_FLAGS = deepFreeze({
    executionPolicy: "PLAN_ONLY", protectedMode: true, privateLocalOnly: true,
    externalCommunicationEnabled: false, automaticAcquisitionEnabled: false,
    scheduledAcquisitionEnabled: false, unattendedAcquisitionEnabled: false,
    automaticPurchaseEnabled: false, automaticApplicationEnabled: false,
    automaticLearningUpdateEnabled: false, previewRequired: true, manualApprovalRequired: true,
    credentialsStoredInSourceCode: false, acquisitionStarted: false, acquisitionExecuted: false,
    acquisitionCompleted: false, startAuthorized: false, executionAuthorized: false,
    externalRequestDispatched: false, externalResponseReceived: false
  });
  const START_SNAPSHOT_FIELDS = deepFreeze([
    "startRequestRecordId", "approvalRecordId", "requestId", "startRequestStatus",
    "requestedBy", "requestedAt", "startReason", "operatorRole", "finalValidationResult",
    "allowedExecutionWindowStart", "allowedExecutionWindowEnd", "expirationAt", "recordVersion"
  ]);
  const RESERVED_IDENTITIES = deepFreeze(["system", "auto", "bot", "scheduler", "background", "service"]);
  const TERMINAL_STATES = deepFreeze(["ready_for_manual_execution_record", "rejected", "cancelled", "expired"]);

  function makeChecklist(value) {
    const source = value || {};
    return Object.fromEntries(EXECUTION_PREFLIGHT_CHECKS.map(key => [key, source[key] === true]));
  }
  function makeStartRequestSnapshot(startRequest) {
    const source = startRequest || {}, snapshot = {};
    START_SNAPSHOT_FIELDS.forEach(key => {
      if (typeof source[key] === "boolean" || typeof source[key] === "number") snapshot[key] = source[key];
      else snapshot[key] = text(source[key]);
    });
    return deepFreeze(snapshot);
  }
  const makeApprovalSnapshot = startRequest => phase264.makeApprovalSnapshot(startRequest && startRequest.approvalSnapshot);
  const makeRequestSnapshot = startRequest => phase263.makeRequestSnapshot(startRequest && startRequest.requestSnapshot);

  function normalizeRecord(input, options) {
    const source = input || {}, createdAt = text(source.createdAt) || nowDate(options).toISOString();
    return {
      executionRequestRecordId: text(source.executionRequestRecordId) || `phase26-5-${createdAt.replace(/\D/g, "").slice(0, 17)}`,
      startRequestRecordId: text(source.startRequestRecordId || (source.startRequestSnapshot && source.startRequestSnapshot.startRequestRecordId)),
      approvalRecordId: text(source.approvalRecordId || (source.approvalSnapshot && source.approvalSnapshot.approvalRecordId)),
      requestId: text(source.requestId || (source.requestSnapshot && source.requestSnapshot.requestId)),
      startRequestSnapshot: makeStartRequestSnapshot(source.startRequestSnapshot),
      approvalSnapshot: phase264.makeApprovalSnapshot(source.approvalSnapshot),
      requestSnapshot: phase263.makeRequestSnapshot(source.requestSnapshot),
      executionRequestStatus: EXECUTION_REQUEST_STATES.includes(source.executionRequestStatus) ? source.executionRequestStatus : "awaiting_manual_execution_request",
      executionRequestedBy: text(source.executionRequestedBy), executionRequestedAt: text(source.executionRequestedAt),
      executionRequestReason: text(source.executionRequestReason), executionOperatorRole: text(source.executionOperatorRole),
      executionOperatorNote: text(source.executionOperatorNote), executionApprover: text(source.executionApprover),
      executionApprovedAt: text(source.executionApprovedAt), executionApprovalReason: text(source.executionApprovalReason),
      executionApproverRole: text(source.executionApproverRole), selfExecutionApproval: source.selfExecutionApproval === true,
      executionPreflightChecklist: makeChecklist(source.executionPreflightChecklist),
      executionPreflightValidationResult: PREFLIGHT_RESULTS.includes(source.executionPreflightValidationResult) ? source.executionPreflightValidationResult : "incomplete",
      executionPreflightBlockingReasons: unique(source.executionPreflightBlockingReasons).filter(item => typeof item === "string"),
      executionTargetSummary: text(source.executionTargetSummary),
      expectedRecordCount: Number.isInteger(source.expectedRecordCount) && source.expectedRecordCount > 0 ? source.expectedRecordCount : 0,
      allowedExecutionWindowStart: text(source.allowedExecutionWindowStart),
      allowedExecutionWindowEnd: text(source.allowedExecutionWindowEnd),
      stopConditions: text(source.stopConditions), cancellationConditions: text(source.cancellationConditions),
      expirationAt: text(source.expirationAt), createdAt, updatedAt: text(source.updatedAt) || createdAt,
      recordVersion: Number.isInteger(source.recordVersion) && source.recordVersion > 0 ? source.recordVersion : 1,
      ...clone(SAFE_FLAGS)
    };
  }

  function createExecutionRequestDraft(startRequest, input, options) {
    const values = input || {};
    return deepFreeze(normalizeRecord({
      ...values, startRequestRecordId: startRequest && startRequest.startRequestRecordId,
      approvalRecordId: startRequest && startRequest.approvalRecordId, requestId: startRequest && startRequest.requestId,
      startRequestSnapshot: makeStartRequestSnapshot(startRequest),
      approvalSnapshot: makeApprovalSnapshot(startRequest), requestSnapshot: makeRequestSnapshot(startRequest),
      executionRequestStatus: "awaiting_manual_execution_request",
      expectedRecordCount: startRequest && startRequest.requestSnapshot && startRequest.requestSnapshot.expectedRecordCount,
      allowedExecutionWindowStart: startRequest && startRequest.allowedExecutionWindowStart,
      allowedExecutionWindowEnd: startRequest && startRequest.allowedExecutionWindowEnd,
      stopConditions: startRequest && startRequest.stopConditions,
      cancellationConditions: startRequest && startRequest.cancellationConditions,
      expirationAt: startRequest && startRequest.expirationAt
    }, options));
  }

  function validateStartRequestRecord(startRequest, options) {
    const value = startRequest || {}, request = value.requestSnapshot || {}, reasons = [];
    if (value.startRequestStatus !== "ready_for_manual_execution_request") reasons.push("start_request_status_not_ready");
    if (value.finalValidationResult !== "ready_for_manual_execution_request") reasons.push("start_request_validation_not_ready");
    if (!Array.isArray(value.finalBlockingReasons) || value.finalBlockingReasons.length) reasons.push("final_reasons_exist");
    if (!text(value.startRequestRecordId) || !text(value.approvalRecordId) || !text(value.requestId)) reasons.push("start_request_identity_missing");
    if (!text(value.requestedBy) || !text(value.requestedAt) || !text(value.startReason) || !text(value.operatorRole)) reasons.push("start_request_information_missing");
    if (!value.approvalSnapshot || !text(value.approvalSnapshot.approvalRecordId) || !request || !text(request.requestId)) reasons.push("snapshots_missing");
    if (!phase264.validateFinalExecutionChecklist(value).valid) reasons.push("final_checklist_incomplete");
    if (request.sourceTrustLevel === "unknown_source") reasons.push("unknown_source_blocked");
    if (request.credentialsRequired === true) reasons.push("credentials_requirement_not_supported");
    const start = new Date(value.allowedExecutionWindowStart), end = new Date(value.allowedExecutionWindowEnd), now = nowDate(options);
    if (!text(value.allowedExecutionWindowStart) || !text(value.allowedExecutionWindowEnd) || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) reasons.push("execution_window_invalid");
    else if (now < start || now > end) reasons.push("outside_execution_window");
    if (text(value.expirationAt)) {
      const expiration = new Date(value.expirationAt);
      if (Number.isNaN(expiration.getTime()) || expiration <= now) reasons.push("start_request_expired");
    }
    if (Object.keys(phase264.SAFE_FLAGS).some(key => value[key] !== phase264.SAFE_FLAGS[key])) reasons.push("start_request_safety_flag_mismatch");
    if (value.acquisitionStarted === true) reasons.push("acquisition_already_started");
    if (value.acquisitionExecuted === true) reasons.push("acquisition_already_executed");
    if (value.acquisitionCompleted === true) reasons.push("acquisition_already_completed");
    if (value.startAuthorized === true || value.executionAuthorized === true) reasons.push("authorization_already_exists");
    return deepFreeze({ valid: unique(reasons).length === 0, reasons: unique(reasons) });
  }

  function validateExecutionRequester(record, options) {
    const value = normalizeRecord(record, options), reasons = [], at = new Date(value.executionRequestedAt);
    if (!value.executionRequestedBy) reasons.push("execution_requester_missing");
    else if (RESERVED_IDENTITIES.includes(value.executionRequestedBy.toLowerCase())) reasons.push("reserved_identity_prohibited");
    if (!value.executionRequestedAt || Number.isNaN(at.getTime()) || at > nowDate(options)) reasons.push("execution_request_time_invalid");
    if (!value.executionRequestReason) reasons.push("execution_request_reason_missing");
    if (!value.executionOperatorRole) reasons.push("execution_operator_role_missing");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateExecutionApprover(record, options) {
    const value = normalizeRecord(record, options), reasons = [];
    const approved = new Date(value.executionApprovedAt), requested = new Date(value.executionRequestedAt), now = nowDate(options);
    if (!value.executionApprover) reasons.push("execution_approver_missing");
    else if (RESERVED_IDENTITIES.includes(value.executionApprover.toLowerCase())) reasons.push("reserved_identity_prohibited");
    if (!value.executionApprovedAt || Number.isNaN(approved.getTime()) || approved > now || (!Number.isNaN(requested.getTime()) && approved <= requested)) reasons.push("execution_approval_time_invalid");
    if (!value.executionApprovalReason) reasons.push("execution_approval_reason_missing");
    if (!value.executionApproverRole) reasons.push("execution_approver_role_missing");
    const start = new Date(value.allowedExecutionWindowStart), end = new Date(value.allowedExecutionWindowEnd);
    if (!Number.isNaN(approved.getTime()) && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && (approved < start || approved > end)) reasons.push("execution_approval_outside_window");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateExecutionWindow(record, options) {
    const value = normalizeRecord(record, options), reasons = [], now = nowDate(options);
    const start = new Date(value.allowedExecutionWindowStart), end = new Date(value.allowedExecutionWindowEnd);
    if (!value.allowedExecutionWindowStart || !value.allowedExecutionWindowEnd || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) reasons.push("execution_window_invalid");
    else if (now < start || now > end) reasons.push("outside_execution_window");
    if (value.expirationAt) {
      const expiration = new Date(value.expirationAt);
      if (Number.isNaN(expiration.getTime()) || now >= expiration || (!Number.isNaN(end.getTime()) && end > expiration)) reasons.push("execution_window_expired");
    }
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateExecutionPreflightChecklist(record) {
    const value = normalizeRecord(record), missing = EXECUTION_PREFLIGHT_CHECKS.filter(key => value.executionPreflightChecklist[key] !== true);
    return deepFreeze({ valid: missing.length === 0, missing, reasons: missing.map(key => `checklist_${key}_required`) });
  }

  function resultFor(reasons) {
    if (reasons.includes("start_request_status_not_ready")) return "blocked_by_invalid_start_request_status";
    if (reasons.some(item => ["start_request_validation_not_ready", "start_request_identity_missing", "start_request_information_missing", "snapshots_missing", "final_checklist_incomplete", "unknown_source_blocked"].includes(item))) return "blocked_by_start_request_validation";
    if (reasons.includes("final_reasons_exist")) return "blocked_by_existing_final_reasons";
    if (reasons.includes("execution_requester_missing")) return "blocked_by_missing_execution_requester";
    if (reasons.includes("execution_request_time_invalid")) return "blocked_by_invalid_execution_request_time";
    if (reasons.includes("execution_request_reason_missing")) return "blocked_by_missing_execution_reason";
    if (reasons.includes("execution_operator_role_missing")) return "blocked_by_missing_operator_role";
    if (reasons.includes("reserved_identity_prohibited")) return "blocked_by_reserved_identity";
    if (reasons.includes("execution_approver_missing")) return "blocked_by_missing_execution_approver";
    if (reasons.includes("execution_approval_time_invalid")) return "blocked_by_invalid_execution_approval_time";
    if (reasons.includes("execution_approval_reason_missing")) return "blocked_by_missing_execution_approval_reason";
    if (reasons.includes("execution_approver_role_missing")) return "blocked_by_missing_execution_approver_role";
    if (reasons.some(item => ["execution_window_invalid", "outside_execution_window", "execution_approval_outside_window"].includes(item))) return "blocked_by_invalid_execution_window";
    if (reasons.includes("credentials_requirement_not_supported")) return "blocked_by_credentials_requirement";
    if (reasons.includes("start_request_safety_flag_mismatch")) return "blocked_by_safety_flag_mismatch";
    if (reasons.includes("acquisition_already_started")) return "blocked_by_already_started";
    if (reasons.includes("acquisition_already_executed")) return "blocked_by_already_executed";
    if (reasons.includes("acquisition_already_completed")) return "blocked_by_already_completed";
    if (reasons.includes("authorization_already_exists")) return "blocked_by_existing_authorization";
    if (reasons.some(item => ["start_request_expired", "execution_window_expired", "record_expired"].includes(item))) return "blocked_by_expiration";
    if (reasons.some(item => item.startsWith("checklist_"))) return "blocked_by_incomplete_execution_preflight";
    return reasons.length ? "incomplete" : "execution_request_recorded";
  }

  function evaluateExecutionPreflight(startRequest, record, operation, options) {
    const value = normalizeRecord(record, options), target = validateStartRequestRecord(startRequest, options);
    const requester = validateExecutionRequester(value, options), window = validateExecutionWindow(value, options);
    const reasons = [...target.reasons, ...requester.reasons, ...window.reasons];
    if (value.executionRequestStatus === "expired") reasons.push("record_expired");
    if (!["awaiting_manual_execution_request", "execution_request_blocked"].includes(value.executionRequestStatus)) reasons.push("execution_request_not_awaiting");
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) reasons.push("manual_execution_request_confirmation_required");
    const executionPreflightBlockingReasons = unique(reasons), executionPreflightValidationResult = resultFor(executionPreflightBlockingReasons);
    return deepFreeze({
      recorded: executionPreflightValidationResult === "execution_request_recorded",
      record: normalizeRecord({
        ...value, startRequestRecordId: startRequest && startRequest.startRequestRecordId,
        approvalRecordId: startRequest && startRequest.approvalRecordId, requestId: startRequest && startRequest.requestId,
        startRequestSnapshot: makeStartRequestSnapshot(startRequest), approvalSnapshot: makeApprovalSnapshot(startRequest),
        requestSnapshot: makeRequestSnapshot(startRequest),
        executionRequestStatus: executionPreflightValidationResult === "execution_request_recorded" ? "execution_request_recorded" : "execution_request_blocked",
        executionPreflightValidationResult, executionPreflightBlockingReasons,
        updatedAt: nowDate(options).toISOString(), recordVersion: value.recordVersion + 1
      }, options),
      executionPreflightValidationResult, executionPreflightBlockingReasons
    });
  }

  const recordManualExecutionRequest = (startRequest, record, operation, options) => evaluateExecutionPreflight(startRequest, record, operation, options);

  function recordManualExecutionApproval(record, approval, operation, options) {
    const current = normalizeRecord({ ...record, ...(approval || {}) }, options);
    if (!["execution_request_recorded", "awaiting_manual_execution_approval", "execution_approval_blocked"].includes(record && record.executionRequestStatus)) return deepFreeze({ approved: false, reason: "recorded_execution_request_required", record: normalizeRecord(record, options) });
    const check = validateExecutionApprover(current, options), window = validateExecutionWindow(current, options);
    const reasons = unique([...check.reasons, ...window.reasons]);
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) reasons.push("manual_execution_approval_confirmation_required");
    const valid = reasons.length === 0;
    return deepFreeze({ approved: valid, record: normalizeRecord({
      ...current, executionRequestStatus: valid ? "execution_approval_recorded" : "execution_approval_blocked",
      selfExecutionApproval: current.executionRequestedBy === current.executionApprover,
      executionPreflightValidationResult: valid ? "execution_approval_recorded" : resultFor(reasons),
      executionPreflightBlockingReasons: unique(reasons), updatedAt: nowDate(options).toISOString(),
      recordVersion: current.recordVersion + 1
    }, options), executionPreflightBlockingReasons: unique(reasons) });
  }

  function beginExecutionPreflight(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.executionRequestStatus !== "execution_approval_recorded") return deepFreeze({ transitioned: false, reason: "execution_approval_required", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ transitioned: true, record: normalizeRecord({ ...current, executionRequestStatus: "execution_preflight_in_progress", updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1 }, options) });
  }

  function completeExecutionPreflight(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.executionRequestStatus !== "execution_preflight_in_progress") return deepFreeze({ completed: false, reason: "execution_preflight_not_in_progress", record: current });
    const checklist = validateExecutionPreflightChecklist(current), window = validateExecutionWindow(current, options);
    const reasons = [...checklist.reasons, ...window.reasons];
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) reasons.push("final_human_execution_confirmation_required");
    const ready = reasons.length === 0;
    return deepFreeze({ completed: ready, record: normalizeRecord({
      ...current, executionRequestStatus: ready ? "ready_for_manual_execution_record" : "execution_preflight_blocked",
      executionPreflightValidationResult: ready ? "ready_for_manual_execution_record" : resultFor(reasons),
      executionPreflightBlockingReasons: unique(reasons), updatedAt: nowDate(options).toISOString(),
      recordVersion: current.recordVersion + 1
    }, options) });
  }

  function updateExecutionRequestDraft(record, changes, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["awaiting_manual_execution_request", "execution_request_blocked", "execution_approval_blocked", "execution_preflight_blocked"].includes(current.executionRequestStatus)) return deepFreeze({ updated: false, reason: "completed_record_is_immutable", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ updated: true, record: normalizeRecord({ ...current, ...(changes || {}), executionRequestRecordId: current.executionRequestRecordId, startRequestSnapshot: current.startRequestSnapshot, approvalSnapshot: current.approvalSnapshot, requestSnapshot: current.requestSnapshot, executionRequestStatus: "awaiting_manual_execution_request", executionPreflightValidationResult: "incomplete", executionPreflightBlockingReasons: [], updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1 }, options) });
  }

  function closeRecord(record, state, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["rejected", "cancelled", "expired"].includes(state) || TERMINAL_STATES.includes(current.executionRequestStatus)) return deepFreeze({ transitioned: false, reason: "transition_not_allowed", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ transitioned: true, record: normalizeRecord({ ...current, executionRequestStatus: state, updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1 }, options) });
  }
  const rejectExecutionRequest = (record, operation, options) => closeRecord(record, "rejected", operation, options);
  const cancelExecutionRequest = (record, operation, options) => closeRecord(record, "cancelled", operation, options);
  const expireExecutionRequest = (record, operation, options) => closeRecord(record, "expired", operation, options);

  function getExecutionRequestSummary(record) {
    const value = normalizeRecord(record);
    return deepFreeze({
      executionRequestRecordId: value.executionRequestRecordId, startRequestRecordId: value.startRequestRecordId,
      status: value.executionRequestStatus, executionRequestedBy: value.executionRequestedBy,
      executionApprover: value.executionApprover, selfExecutionApproval: value.selfExecutionApproval,
      result: value.executionPreflightValidationResult, reasons: [...value.executionPreflightBlockingReasons],
      startAuthorized: false, executionAuthorized: false, externalRequestDispatched: false,
      externalResponseReceived: false, notice: "ready_for_manual_execution_recordは取得開始・実行許可を意味しません"
    });
  }
  function getExecutionPreflightSummary(record) {
    const value = normalizeRecord(record), check = validateExecutionPreflightChecklist(value);
    return deepFreeze({ status: value.executionRequestStatus, completedChecks: EXECUTION_PREFLIGHT_CHECKS.length - check.missing.length, requiredChecks: EXECUTION_PREFLIGHT_CHECKS.length, missingChecks: [...check.missing], window: `${value.allowedExecutionWindowStart} / ${value.allowedExecutionWindowEnd}`, startAuthorized: false, executionAuthorized: false });
  }

  function render(documentRef) {
    if (!documentRef) return;
    const form = documentRef.getElementById("phase265-execution-request-form");
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form), summary = documentRef.getElementById("phase265-execution-summary");
      const result = documentRef.getElementById("phase265-preflight-result"), reasons = documentRef.getElementById("phase265-preflight-reasons");
      const record = normalizeRecord({
        executionRequestedBy: text(data.get("executionRequestedBy")), executionRequestedAt: text(data.get("executionRequestedAt")),
        executionRequestReason: text(data.get("executionRequestReason")), executionOperatorRole: text(data.get("executionOperatorRole")),
        executionApprover: text(data.get("executionApprover")), executionApprovedAt: text(data.get("executionApprovedAt")),
        executionApprovalReason: text(data.get("executionApprovalReason")), executionApproverRole: text(data.get("executionApproverRole")),
        executionPreflightChecklist: makeChecklist(Object.fromEntries(EXECUTION_PREFLIGHT_CHECKS.map(key => [key, data.get(key) === "on"])))
      });
      if (result) result.textContent = record.executionPreflightValidationResult;
      if (reasons) reasons.textContent = "Phase26-4 ready記録との連携後に人間が検証します";
      if (summary) summary.textContent = JSON.stringify(getExecutionRequestSummary(record), null, 2);
    });
  }
  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
  }

  return {
    PHASE261_DEFINITION, PHASE262_REFERENCE, PHASE263_REFERENCE, PHASE264_REFERENCE,
    EXECUTION_REQUEST_STATES, EXECUTION_PREFLIGHT_CHECKS, PREFLIGHT_RESULTS, SAFE_FLAGS,
    START_SNAPSHOT_FIELDS, makeStartRequestSnapshot, makeApprovalSnapshot, makeRequestSnapshot,
    createExecutionRequestDraft, validateStartRequestRecord, validateExecutionRequester,
    validateExecutionApprover, validateExecutionWindow, validateExecutionPreflightChecklist,
    evaluateExecutionPreflight, updateExecutionRequestDraft, recordManualExecutionRequest,
    recordManualExecutionApproval, beginExecutionPreflight, completeExecutionPreflight,
    rejectExecutionRequest, cancelExecutionRequest, expireExecutionRequest,
    getExecutionRequestSummary, getExecutionPreflightSummary, render
  };
});
