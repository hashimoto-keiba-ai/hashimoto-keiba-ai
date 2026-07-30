(function (root, factory) {
  const p261 = typeof module === "object" && module.exports ? require("./phase26-1-external-data-acquisition-boundary.js") : root.HashimotoPhase261ExternalDataAcquisitionBoundary;
  const p262 = typeof module === "object" && module.exports ? require("./phase26-2-manual-acquisition-request-precheck-core.js") : root.HashimotoPhase262ManualAcquisitionRequestPrecheck;
  const p263 = typeof module === "object" && module.exports ? require("./phase26-3-manual-acquisition-approval-prestart-record-core.js") : root.HashimotoPhase263ManualAcquisitionApprovalPrestartRecord;
  const api = factory(p261, p262, p263);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase264ManualAcquisitionStartRequestFinalCheck = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase261, phase262, phase263) {
  "use strict";
  if (!phase261 || !phase262 || !phase263) throw new Error("Phase26-1, Phase26-2, and Phase26-3 definitions are required");

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
  const START_REQUEST_STATES = deepFreeze([
    "awaiting_manual_start_request",
    "start_request_blocked",
    "start_request_recorded",
    "final_check_in_progress",
    "final_check_blocked",
    "ready_for_manual_execution_request",
    "rejected",
    "cancelled",
    "expired"
  ]);
  const FINAL_EXECUTION_CHECKS = deepFreeze([
    "approvalRecordIdentityConfirmed", "approvalSnapshotConfirmed", "requestSnapshotConfirmed",
    "approverConfirmed", "approvalTimeConfirmed", "approvalReasonConfirmed", "reviewerRoleConfirmed",
    "sourceConfirmed", "sourceTrustConfirmed", "targetRaceConfirmed", "targetDataConfirmed",
    "dataTimepointConfirmed", "expectedRecordCountConfirmed", "purposeConfirmed", "consentConfirmed",
    "termsConfirmed", "accessRestrictionConfirmed", "noCredentialsRequiredConfirmed",
    "noCredentialsStoredConfirmed", "noExternalCommunicationYetConfirmed",
    "noAutomaticAcquisitionConfirmed", "noScheduledAcquisitionConfirmed",
    "noUnattendedAcquisitionConfirmed", "noAutomaticPurchaseConfirmed",
    "noAutomaticApplicationConfirmed", "noAutomaticLearningUpdateConfirmed",
    "previewRequirementConfirmed", "manualApprovalRequirementConfirmed",
    "acquisitionNotStartedConfirmed", "acquisitionNotExecutedConfirmed",
    "acquisitionNotCompletedConfirmed", "executionWindowConfirmed", "stopConditionsConfirmed",
    "cancellationConditionsConfirmed", "operatorResponsibilityConfirmed", "finalHumanConfirmation"
  ]);
  const FINAL_RESULTS = deepFreeze([
    "incomplete", "blocked_by_invalid_approval_status", "blocked_by_approval_validation",
    "blocked_by_existing_prestart_reasons", "blocked_by_missing_requester",
    "blocked_by_invalid_request_time", "blocked_by_missing_start_reason",
    "blocked_by_missing_operator_role", "blocked_by_reserved_requester",
    "blocked_by_incomplete_final_checklist", "blocked_by_invalid_execution_window",
    "blocked_by_credentials_requirement", "blocked_by_safety_flag_mismatch",
    "blocked_by_already_started", "blocked_by_already_executed",
    "blocked_by_already_completed", "blocked_by_expiration",
    "start_request_recorded", "ready_for_manual_execution_request"
  ]);
  const SAFE_FLAGS = deepFreeze({
    executionPolicy: "PLAN_ONLY", protectedMode: true, privateLocalOnly: true,
    externalCommunicationEnabled: false, automaticAcquisitionEnabled: false,
    scheduledAcquisitionEnabled: false, unattendedAcquisitionEnabled: false,
    automaticPurchaseEnabled: false, automaticApplicationEnabled: false,
    automaticLearningUpdateEnabled: false, previewRequired: true, manualApprovalRequired: true,
    credentialsStoredInSourceCode: false, acquisitionStarted: false, acquisitionExecuted: false,
    acquisitionCompleted: false, startAuthorized: false, executionAuthorized: false
  });
  const APPROVAL_SNAPSHOT_FIELDS = deepFreeze([
    "approvalRecordId", "requestId", "approvalStatus", "approvedBy", "approvedAt",
    "approvalReason", "reviewerRole", "selfApproval", "preStartValidationResult",
    "expirationAt", "recordVersion"
  ]);
  const RESERVED_REQUESTERS = deepFreeze(["system", "auto", "bot", "scheduler", "background"]);
  const TERMINAL_STATES = deepFreeze(["ready_for_manual_execution_request", "rejected", "cancelled", "expired"]);

  function makeChecklist(value) {
    const source = value || {};
    return Object.fromEntries(FINAL_EXECUTION_CHECKS.map(key => [key, source[key] === true]));
  }

  function makeApprovalSnapshot(approval) {
    const source = approval || {};
    const snapshot = {};
    APPROVAL_SNAPSHOT_FIELDS.forEach(key => {
      if (typeof source[key] === "boolean" || typeof source[key] === "number") snapshot[key] = source[key];
      else snapshot[key] = text(source[key]);
    });
    return deepFreeze(snapshot);
  }

  function makeRequestSnapshot(approval) {
    return phase263.makeRequestSnapshot(approval && approval.requestSnapshot);
  }

  function normalizeRecord(input, options) {
    const source = input || {};
    const createdAt = text(source.createdAt) || nowDate(options).toISOString();
    return {
      startRequestRecordId: text(source.startRequestRecordId) || `phase26-4-${createdAt.replace(/\D/g, "").slice(0, 17)}`,
      approvalRecordId: text(source.approvalRecordId || (source.approvalSnapshot && source.approvalSnapshot.approvalRecordId)),
      requestId: text(source.requestId || (source.requestSnapshot && source.requestSnapshot.requestId)),
      approvalSnapshot: makeApprovalSnapshot(source.approvalSnapshot),
      requestSnapshot: phase263.makeRequestSnapshot(source.requestSnapshot),
      startRequestStatus: START_REQUEST_STATES.includes(source.startRequestStatus) ? source.startRequestStatus : "awaiting_manual_start_request",
      requestedBy: text(source.requestedBy), requestedAt: text(source.requestedAt),
      startReason: text(source.startReason), operatorRole: text(source.operatorRole),
      operatorNote: text(source.operatorNote), selfRequest: source.selfRequest === true,
      finalExecutionChecklist: makeChecklist(source.finalExecutionChecklist),
      finalValidationResult: FINAL_RESULTS.includes(source.finalValidationResult) ? source.finalValidationResult : "incomplete",
      finalBlockingReasons: unique(source.finalBlockingReasons).filter(item => typeof item === "string"),
      stopConditions: text(source.stopConditions), cancellationConditions: text(source.cancellationConditions),
      allowedExecutionWindowStart: text(source.allowedExecutionWindowStart),
      allowedExecutionWindowEnd: text(source.allowedExecutionWindowEnd),
      expirationAt: text(source.expirationAt), createdAt, updatedAt: text(source.updatedAt) || createdAt,
      recordVersion: Number.isInteger(source.recordVersion) && source.recordVersion > 0 ? source.recordVersion : 1,
      ...clone(SAFE_FLAGS)
    };
  }

  function createStartRequestDraft(approval, input, options) {
    const values = input || {};
    return deepFreeze(normalizeRecord({
      ...values,
      approvalRecordId: approval && approval.approvalRecordId,
      requestId: approval && approval.requestId,
      approvalSnapshot: makeApprovalSnapshot(approval),
      requestSnapshot: makeRequestSnapshot(approval),
      startRequestStatus: "awaiting_manual_start_request",
      selfRequest: Boolean(approval && text(approval.approvedBy) === text(values.requestedBy))
    }, options));
  }

  function validateApprovalRecord(approval, options) {
    const value = approval || {};
    const request = value.requestSnapshot || {};
    const reasons = [];
    if (value.approvalStatus !== "ready_for_manual_start_request") reasons.push("approval_status_not_ready");
    if (value.preStartValidationResult !== "ready_for_manual_start_request") reasons.push("approval_validation_not_ready");
    if (!Array.isArray(value.preStartBlockingReasons) || value.preStartBlockingReasons.length) reasons.push("prestart_reasons_exist");
    if (!text(value.approvalRecordId) || !text(value.requestId)) reasons.push("approval_identity_missing");
    if (!text(value.approvedBy) || !text(value.approvalReason) || !text(value.reviewerRole)) reasons.push("approval_information_missing");
    const approvedAt = new Date(value.approvedAt);
    if (!text(value.approvedAt) || Number.isNaN(approvedAt.getTime())) reasons.push("approval_time_invalid");
    if (!request || typeof request !== "object" || !text(request.requestId)) reasons.push("request_snapshot_missing");
    if (request.requestStatus !== "ready_for_manual_request" || request.validationResult !== "ready_for_manual_request") reasons.push("request_snapshot_not_ready");
    if (!Array.isArray(request.blockingReasons) || request.blockingReasons.length) reasons.push("request_snapshot_reasons_exist");
    if (!PHASE261_DEFINITION.sourceTrustLevels.includes(request.sourceTrustLevel) || request.sourceTrustLevel === "unknown_source") reasons.push("request_source_invalid");
    if (!text(request.sourceName) || request.dataTimepoint === "unknown" || !PHASE261_DEFINITION.dataTimepoints.includes(request.dataTimepoint)) reasons.push("request_target_invalid");
    if (!Number.isInteger(request.expectedRecordCount) || request.expectedRecordCount < 1) reasons.push("request_count_invalid");
    if (!phase262.ALLOWED_PURPOSES.includes(request.purpose)) reasons.push("request_purpose_invalid");
    if (request.credentialsRequired === true) reasons.push("credentials_requirement_not_supported");
    const checklist = phase263.validatePreStartChecklist(value);
    if (!checklist.valid) reasons.push("phase263_checklist_incomplete");
    if (text(value.expirationAt)) {
      const expiration = new Date(value.expirationAt);
      if (Number.isNaN(expiration.getTime()) || expiration.getTime() <= nowDate(options).getTime()) reasons.push("approval_expired");
    }
    if (Object.keys(phase263.SAFE_FLAGS).some(key => value[key] !== phase263.SAFE_FLAGS[key])) reasons.push("approval_safety_flag_mismatch");
    if (value.acquisitionStarted === true) reasons.push("acquisition_already_started");
    if (value.acquisitionExecuted === true) reasons.push("acquisition_already_executed");
    if (value.acquisitionCompleted === true) reasons.push("acquisition_already_completed");
    return deepFreeze({ valid: unique(reasons).length === 0, reasons: unique(reasons) });
  }

  function validateStartRequester(record, options) {
    const value = normalizeRecord(record, options);
    const reasons = [];
    if (!value.requestedBy) reasons.push("requester_missing");
    else if (RESERVED_REQUESTERS.includes(value.requestedBy.toLowerCase())) reasons.push("reserved_requester_prohibited");
    const requestedAt = new Date(value.requestedAt);
    if (!value.requestedAt || Number.isNaN(requestedAt.getTime()) || requestedAt.getTime() > nowDate(options).getTime()) reasons.push("request_time_invalid");
    if (!value.startReason) reasons.push("start_reason_missing");
    if (!value.operatorRole) reasons.push("operator_role_missing");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateExecutionWindow(record, options) {
    const value = normalizeRecord(record, options);
    const reasons = [];
    const start = new Date(value.allowedExecutionWindowStart);
    const end = new Date(value.allowedExecutionWindowEnd);
    const requested = new Date(value.requestedAt);
    const now = nowDate(options);
    if (!value.allowedExecutionWindowStart || !value.allowedExecutionWindowEnd || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      reasons.push("execution_window_missing_or_invalid");
    } else {
      if (start.getTime() >= end.getTime()) reasons.push("execution_window_order_invalid");
      if (end.getTime() <= now.getTime()) reasons.push("execution_window_past_only");
      if (!Number.isNaN(requested.getTime()) && (requested.getTime() < start.getTime() - 86400000 || requested.getTime() > end.getTime())) reasons.push("request_time_outside_execution_window");
      if (value.expirationAt) {
        const expiration = new Date(value.expirationAt);
        if (Number.isNaN(expiration.getTime()) || end.getTime() > expiration.getTime()) reasons.push("execution_window_exceeds_expiration");
      }
    }
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateFinalExecutionChecklist(record) {
    const value = normalizeRecord(record);
    const missing = FINAL_EXECUTION_CHECKS.filter(key => value.finalExecutionChecklist[key] !== true);
    return deepFreeze({ valid: missing.length === 0, missing, reasons: missing.map(key => `checklist_${key}_required`) });
  }

  function resultFor(reasons) {
    if (reasons.includes("approval_status_not_ready")) return "blocked_by_invalid_approval_status";
    if (reasons.some(item => ["approval_validation_not_ready", "approval_identity_missing", "approval_information_missing", "approval_time_invalid", "request_snapshot_missing", "request_snapshot_not_ready", "request_snapshot_reasons_exist", "request_source_invalid", "request_target_invalid", "request_count_invalid", "request_purpose_invalid", "phase263_checklist_incomplete"].includes(item))) return "blocked_by_approval_validation";
    if (reasons.includes("prestart_reasons_exist")) return "blocked_by_existing_prestart_reasons";
    if (reasons.includes("requester_missing")) return "blocked_by_missing_requester";
    if (reasons.includes("reserved_requester_prohibited")) return "blocked_by_reserved_requester";
    if (reasons.includes("request_time_invalid")) return "blocked_by_invalid_request_time";
    if (reasons.includes("start_reason_missing")) return "blocked_by_missing_start_reason";
    if (reasons.includes("operator_role_missing")) return "blocked_by_missing_operator_role";
    if (reasons.some(item => item.startsWith("execution_window_") || item === "request_time_outside_execution_window")) return "blocked_by_invalid_execution_window";
    if (reasons.includes("credentials_requirement_not_supported")) return "blocked_by_credentials_requirement";
    if (reasons.includes("approval_safety_flag_mismatch")) return "blocked_by_safety_flag_mismatch";
    if (reasons.includes("acquisition_already_started")) return "blocked_by_already_started";
    if (reasons.includes("acquisition_already_executed")) return "blocked_by_already_executed";
    if (reasons.includes("acquisition_already_completed")) return "blocked_by_already_completed";
    if (reasons.includes("approval_expired") || reasons.includes("record_expired")) return "blocked_by_expiration";
    if (reasons.some(item => item.startsWith("checklist_"))) return "blocked_by_incomplete_final_checklist";
    return reasons.length ? "incomplete" : "start_request_recorded";
  }

  function evaluateFinalPreexecutionCheck(approval, record, operation, options) {
    const value = normalizeRecord(record, options);
    const approvalCheck = validateApprovalRecord(approval, options);
    const requesterCheck = validateStartRequester(value, options);
    const windowCheck = validateExecutionWindow(value, options);
    const reasons = [...approvalCheck.reasons, ...requesterCheck.reasons, ...windowCheck.reasons];
    if (!value.stopConditions) reasons.push("stop_conditions_missing");
    if (!value.cancellationConditions) reasons.push("cancellation_conditions_missing");
    if (value.startRequestStatus === "expired") reasons.push("record_expired");
    if (!["awaiting_manual_start_request", "start_request_blocked"].includes(value.startRequestStatus)) reasons.push("start_request_not_awaiting");
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) reasons.push("manual_start_request_confirmation_required");
    const finalBlockingReasons = unique(reasons);
    const finalValidationResult = resultFor(finalBlockingReasons);
    return deepFreeze({
      recorded: finalValidationResult === "start_request_recorded",
      record: normalizeRecord({
        ...value, approvalRecordId: approval && approval.approvalRecordId,
        requestId: approval && approval.requestId, approvalSnapshot: makeApprovalSnapshot(approval),
        requestSnapshot: makeRequestSnapshot(approval),
        startRequestStatus: finalValidationResult === "start_request_recorded" ? "start_request_recorded" : "start_request_blocked",
        selfRequest: Boolean(approval && text(approval.approvedBy) === value.requestedBy),
        finalValidationResult, finalBlockingReasons, updatedAt: nowDate(options).toISOString(),
        recordVersion: value.recordVersion + 1
      }, options),
      finalValidationResult, finalBlockingReasons
    });
  }

  function updateStartRequestDraft(record, changes, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["awaiting_manual_start_request", "start_request_blocked", "final_check_blocked"].includes(current.startRequestStatus)) return deepFreeze({ updated: false, reason: "completed_record_is_immutable", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ updated: true, record: normalizeRecord({
      ...current, ...(changes || {}), startRequestRecordId: current.startRequestRecordId,
      approvalRecordId: current.approvalRecordId, requestId: current.requestId,
      approvalSnapshot: current.approvalSnapshot, requestSnapshot: current.requestSnapshot,
      startRequestStatus: "awaiting_manual_start_request", finalValidationResult: "incomplete",
      finalBlockingReasons: [], updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1
    }, options) });
  }

  function recordManualStartRequest(approval, record, operation, options) {
    return evaluateFinalPreexecutionCheck(approval, record, operation, options);
  }

  function beginFinalCheck(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.startRequestStatus !== "start_request_recorded") return deepFreeze({ transitioned: false, reason: "recorded_start_request_required", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ transitioned: true, record: normalizeRecord({ ...current, startRequestStatus: "final_check_in_progress", updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1 }, options) });
  }

  function completeFinalCheck(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.startRequestStatus !== "final_check_in_progress") return deepFreeze({ completed: false, reason: "final_check_not_in_progress", record: current });
    const checks = validateFinalExecutionChecklist(current);
    const reasons = [...checks.reasons];
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) reasons.push("final_human_confirmation_required");
    const ready = reasons.length === 0;
    return deepFreeze({ completed: ready, record: normalizeRecord({
      ...current, startRequestStatus: ready ? "ready_for_manual_execution_request" : "final_check_blocked",
      finalValidationResult: ready ? "ready_for_manual_execution_request" : "blocked_by_incomplete_final_checklist",
      finalBlockingReasons: unique(reasons), updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1
    }, options) });
  }

  function closeRecord(record, state, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["rejected", "cancelled", "expired"].includes(state) || TERMINAL_STATES.includes(current.startRequestStatus)) return deepFreeze({ transitioned: false, reason: "transition_not_allowed", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ transitioned: true, record: normalizeRecord({ ...current, startRequestStatus: state, updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1 }, options) });
  }
  const rejectStartRequest = (record, operation, options) => closeRecord(record, "rejected", operation, options);
  const cancelStartRequest = (record, operation, options) => closeRecord(record, "cancelled", operation, options);
  const expireStartRequest = (record, operation, options) => closeRecord(record, "expired", operation, options);

  function getStartRequestSummary(record) {
    const value = normalizeRecord(record);
    return deepFreeze({
      startRequestRecordId: value.startRequestRecordId, approvalRecordId: value.approvalRecordId,
      requestId: value.requestId, status: value.startRequestStatus, requestedBy: value.requestedBy,
      requestedAt: value.requestedAt, selfRequest: value.selfRequest,
      finalValidationResult: value.finalValidationResult, finalBlockingReasons: [...value.finalBlockingReasons],
      startAuthorized: false, executionAuthorized: false, acquisitionStarted: false,
      notice: "ready_for_manual_execution_requestは取得開始・実行許可を意味しません"
    });
  }

  function getFinalCheckSummary(record) {
    const value = normalizeRecord(record);
    const check = validateFinalExecutionChecklist(value);
    return deepFreeze({
      status: value.startRequestStatus, completedChecks: FINAL_EXECUTION_CHECKS.length - check.missing.length,
      requiredChecks: FINAL_EXECUTION_CHECKS.length, missingChecks: [...check.missing],
      executionWindow: `${value.allowedExecutionWindowStart} / ${value.allowedExecutionWindowEnd}`,
      stopConditions: value.stopConditions, cancellationConditions: value.cancellationConditions,
      readyForManualExecutionRequest: value.startRequestStatus === "ready_for_manual_execution_request",
      startAuthorized: false, executionAuthorized: false
    });
  }

  function render(documentRef) {
    if (!documentRef) return;
    const form = documentRef.getElementById("phase264-start-request-form");
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const summary = documentRef.getElementById("phase264-start-request-summary");
      const result = documentRef.getElementById("phase264-final-result");
      const reasons = documentRef.getElementById("phase264-final-reasons");
      const checks = makeChecklist(Object.fromEntries(FINAL_EXECUTION_CHECKS.map(key => [key, data.get(key) === "on"])));
      const record = normalizeRecord({
        requestedBy: text(data.get("requestedBy")), requestedAt: text(data.get("requestedAt")),
        startReason: text(data.get("startReason")), operatorRole: text(data.get("operatorRole")),
        operatorNote: text(data.get("operatorNote")), finalExecutionChecklist: checks,
        stopConditions: text(data.get("stopConditions")), cancellationConditions: text(data.get("cancellationConditions")),
        allowedExecutionWindowStart: text(data.get("allowedExecutionWindowStart")),
        allowedExecutionWindowEnd: text(data.get("allowedExecutionWindowEnd")), expirationAt: text(data.get("expirationAt"))
      });
      if (result) result.textContent = record.finalValidationResult;
      if (reasons) reasons.textContent = "Phase26-3 ready記録との連携後に人間が検証します";
      if (summary) summary.textContent = JSON.stringify(getStartRequestSummary(record), null, 2);
    });
  }

  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    PHASE261_DEFINITION, PHASE262_REFERENCE, PHASE263_REFERENCE, START_REQUEST_STATES,
    FINAL_EXECUTION_CHECKS, FINAL_RESULTS, SAFE_FLAGS, APPROVAL_SNAPSHOT_FIELDS,
    makeApprovalSnapshot, makeRequestSnapshot, createStartRequestDraft, validateApprovalRecord,
    validateStartRequester, validateExecutionWindow, validateFinalExecutionChecklist,
    evaluateFinalPreexecutionCheck, updateStartRequestDraft, recordManualStartRequest,
    beginFinalCheck, completeFinalCheck, rejectStartRequest, cancelStartRequest,
    expireStartRequest, getStartRequestSummary, getFinalCheckSummary, render
  };
});
