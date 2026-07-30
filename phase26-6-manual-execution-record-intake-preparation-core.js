(function (root, factory) {
  const load = (path, name) => typeof module === "object" && module.exports ? require(path) : root[name];
  const api = factory(
    load("./phase26-1-external-data-acquisition-boundary.js", "HashimotoPhase261ExternalDataAcquisitionBoundary"),
    load("./phase26-2-manual-acquisition-request-precheck-core.js", "HashimotoPhase262ManualAcquisitionRequestPrecheck"),
    load("./phase26-3-manual-acquisition-approval-prestart-record-core.js", "HashimotoPhase263ManualAcquisitionApprovalPrestartRecord"),
    load("./phase26-4-manual-acquisition-start-request-final-check-core.js", "HashimotoPhase264ManualAcquisitionStartRequestFinalCheck"),
    load("./phase26-5-manual-acquisition-execution-request-approval-core.js", "HashimotoPhase265ManualAcquisitionExecutionRequestApproval")
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase266ManualExecutionRecordIntakePreparation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase261, phase262, phase263, phase264, phase265) {
  "use strict";
  if (!phase261 || !phase262 || !phase263 || !phase264 || !phase265) throw new Error("Phase26-1 through Phase26-5 definitions are required");

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
  const PHASE262_REFERENCE = phase262, PHASE263_REFERENCE = phase263;
  const PHASE264_REFERENCE = phase264, PHASE265_REFERENCE = phase265;
  const EXECUTION_RECORD_STATES = deepFreeze([
    "awaiting_manual_execution_record", "execution_record_blocked", "execution_record_draft",
    "execution_recorded", "intake_preparation_in_progress", "intake_preparation_blocked",
    "ready_for_manual_result_preview", "rejected", "cancelled", "expired"
  ]);
  const INTAKE_PREPARATION_CHECKS = deepFreeze([
    "executionRequestIdentityConfirmed", "executionRequestSnapshotConfirmed",
    "startRequestSnapshotConfirmed", "approvalSnapshotConfirmed", "requestSnapshotConfirmed",
    "recordedByConfirmed", "recordedAtConfirmed", "actualOperatorConfirmed",
    "actualExecutionDateConfirmed", "actualExecutionTimeConfirmed", "executionMethodConfirmed",
    "sourceConfirmed", "sourceTrustConfirmed", "targetConfirmed", "dataTimepointConfirmed",
    "expectedRecordCountConfirmed", "observedRecordCountConfirmed", "countDifferenceReviewed",
    "executionOutcomeConfirmed", "abnormalityReviewed", "interruptionReviewed",
    "stopConditionReviewed", "cancellationConditionReviewed", "noCredentialsRecordedConfirmed",
    "noCredentialsStoredConfirmed", "externalCommunicationClaimReviewed",
    "externalRequestClaimReviewed", "externalResponseClaimReviewed",
    "resultDataReceiptStatusConfirmed", "resultDataNotStoredConfirmed",
    "resultDataNotImportedConfirmed", "resultDataNotAppliedConfirmed",
    "resultDataNotLearnedConfirmed", "previewRequirementConfirmed",
    "manualApprovalRequirementConfirmed", "operatorResponsibilityConfirmed",
    "finalHumanIntakeConfirmation"
  ]);
  const EXECUTION_OUTCOMES = deepFreeze([
    "not_recorded", "completed_as_claimed", "completed_with_warnings", "interrupted",
    "stopped", "cancelled", "failed", "abnormality_detected", "unknown"
  ]);
  const INTAKE_RESULTS = deepFreeze([
    "incomplete", "blocked_by_invalid_execution_request_status",
    "blocked_by_execution_request_validation", "blocked_by_existing_preflight_reasons",
    "blocked_by_missing_recorder", "blocked_by_reserved_identity", "blocked_by_invalid_record_time",
    "blocked_by_missing_actual_operator", "blocked_by_invalid_execution_date",
    "blocked_by_invalid_execution_time", "blocked_by_missing_execution_method",
    "blocked_by_missing_source", "blocked_by_unknown_source", "blocked_by_missing_target",
    "blocked_by_unknown_timepoint", "blocked_by_invalid_observed_count",
    "blocked_by_unreviewed_count_difference", "blocked_by_unknown_outcome",
    "blocked_by_credentials_use", "blocked_by_credentials_recorded",
    "blocked_by_result_data_stored", "blocked_by_result_data_imported",
    "blocked_by_result_data_applied", "blocked_by_result_data_learned",
    "blocked_by_incomplete_intake_checklist", "blocked_by_safety_flag_mismatch",
    "blocked_by_expiration", "execution_recorded", "ready_for_manual_result_preview"
  ]);
  const SAFE_FLAGS = deepFreeze({
    executionPolicy: "PLAN_ONLY", protectedMode: true, privateLocalOnly: true,
    externalCommunicationEnabled: false, automaticAcquisitionEnabled: false,
    scheduledAcquisitionEnabled: false, unattendedAcquisitionEnabled: false,
    automaticPurchaseEnabled: false, automaticApplicationEnabled: false,
    automaticLearningUpdateEnabled: false, previewRequired: true, manualApprovalRequired: true,
    credentialsStoredInSourceCode: false, credentialsRecorded: false,
    acquisitionStarted: false, acquisitionExecuted: false, acquisitionCompleted: false,
    startAuthorized: false, executionAuthorized: false, externalRequestDispatched: false,
    externalResponseReceived: false, resultDataStored: false, resultDataImported: false,
    resultDataApplied: false, resultDataLearned: false, resultPreviewReady: false, intakeReady: false
  });
  const EXECUTION_REQUEST_SNAPSHOT_FIELDS = deepFreeze([
    "executionRequestRecordId", "startRequestRecordId", "approvalRecordId", "requestId",
    "executionRequestStatus", "executionRequestedBy", "executionRequestedAt",
    "executionRequestReason", "executionOperatorRole", "executionApprover",
    "executionApprovedAt", "executionApprovalReason", "executionApproverRole",
    "executionPreflightValidationResult", "expectedRecordCount",
    "allowedExecutionWindowStart", "allowedExecutionWindowEnd", "expirationAt", "recordVersion"
  ]);
  const RESERVED_RECORDERS = deepFreeze(["system", "auto", "bot", "scheduler", "background", "service"]);
  const PROHIBITED_TRUE_INPUTS = deepFreeze([
    "credentialsRecorded", "resultDataStored", "resultDataImported", "resultDataApplied", "resultDataLearned"
  ]);
  const TERMINAL_STATES = deepFreeze(["ready_for_manual_result_preview", "rejected", "cancelled", "expired"]);

  function makeChecklist(value) {
    const source = value || {};
    return Object.fromEntries(INTAKE_PREPARATION_CHECKS.map(key => [key, source[key] === true]));
  }
  function makeExecutionRequestSnapshot(request) {
    const source = request || {}, snapshot = {};
    EXECUTION_REQUEST_SNAPSHOT_FIELDS.forEach(key => {
      if (typeof source[key] === "boolean" || typeof source[key] === "number") snapshot[key] = source[key];
      else snapshot[key] = text(source[key]);
    });
    return deepFreeze(snapshot);
  }
  const makeStartRequestSnapshot = request => phase265.makeStartRequestSnapshot(request && request.startRequestSnapshot);
  const makeApprovalSnapshot = request => phase264.makeApprovalSnapshot(request && request.approvalSnapshot);
  const makeRequestSnapshot = request => phase263.makeRequestSnapshot(request && request.requestSnapshot);
  const inputViolationReasons = input => PROHIBITED_TRUE_INPUTS.filter(key => input && input[key] === true).map(key => `input_${key}_prohibited`);

  function normalizeRecord(input, options) {
    const source = input || {}, createdAt = text(source.createdAt) || nowDate(options).toISOString();
    const expected = Number.isInteger(source.expectedRecordCount) && source.expectedRecordCount >= 0 ? source.expectedRecordCount : 0;
    const observed = Number.isInteger(source.observedRecordCount) && source.observedRecordCount >= 0 ? source.observedRecordCount : -1;
    return {
      executionRecordId: text(source.executionRecordId) || `phase26-6-${createdAt.replace(/\D/g, "").slice(0, 17)}`,
      executionRequestRecordId: text(source.executionRequestRecordId || (source.executionRequestSnapshot && source.executionRequestSnapshot.executionRequestRecordId)),
      startRequestRecordId: text(source.startRequestRecordId || (source.startRequestSnapshot && source.startRequestSnapshot.startRequestRecordId)),
      approvalRecordId: text(source.approvalRecordId || (source.approvalSnapshot && source.approvalSnapshot.approvalRecordId)),
      requestId: text(source.requestId || (source.requestSnapshot && source.requestSnapshot.requestId)),
      executionRequestSnapshot: makeExecutionRequestSnapshot(source.executionRequestSnapshot),
      startRequestSnapshot: phase265.makeStartRequestSnapshot(source.startRequestSnapshot),
      approvalSnapshot: phase264.makeApprovalSnapshot(source.approvalSnapshot),
      requestSnapshot: phase263.makeRequestSnapshot(source.requestSnapshot),
      executionRecordStatus: EXECUTION_RECORD_STATES.includes(source.executionRecordStatus) ? source.executionRecordStatus : "awaiting_manual_execution_record",
      recordedBy: text(source.recordedBy), recordedAt: text(source.recordedAt),
      actualOperator: text(source.actualOperator), actualExecutionDate: text(source.actualExecutionDate),
      actualExecutionStartTime: text(source.actualExecutionStartTime), actualExecutionEndTime: text(source.actualExecutionEndTime),
      executionMethodObserved: text(source.executionMethodObserved), sourceObserved: text(source.sourceObserved),
      sourceTrustObserved: text(source.sourceTrustObserved), targetObserved: text(source.targetObserved),
      dataTimepointObserved: text(source.dataTimepointObserved), expectedRecordCount: expected,
      observedRecordCount: observed, countDifference: observed >= 0 ? observed - expected : null,
      countDifferenceReason: text(source.countDifferenceReason),
      executionOutcome: EXECUTION_OUTCOMES.includes(source.executionOutcome) ? source.executionOutcome : "not_recorded",
      executionNote: text(source.executionNote), abnormalityDetected: source.abnormalityDetected === true,
      abnormalityDetails: text(source.abnormalityDetails), interruptionOccurred: source.interruptionOccurred === true,
      interruptionDetails: text(source.interruptionDetails), stopConditionTriggered: source.stopConditionTriggered === true,
      stopConditionDetails: text(source.stopConditionDetails), cancellationConditionTriggered: source.cancellationConditionTriggered === true,
      cancellationConditionDetails: text(source.cancellationConditionDetails), credentialsUsed: source.credentialsUsed === true,
      externalCommunicationClaimed: source.externalCommunicationClaimed === true,
      externalRequestClaimed: source.externalRequestClaimed === true,
      externalResponseClaimed: source.externalResponseClaimed === true,
      resultDataReceived: source.resultDataReceived === true,
      intakePreparationChecklist: makeChecklist(source.intakePreparationChecklist),
      intakePreparationValidationResult: INTAKE_RESULTS.includes(source.intakePreparationValidationResult) ? source.intakePreparationValidationResult : "incomplete",
      intakePreparationBlockingReasons: unique(source.intakePreparationBlockingReasons).filter(item => typeof item === "string"),
      expirationAt: text(source.expirationAt), createdAt, updatedAt: text(source.updatedAt) || createdAt,
      recordVersion: Number.isInteger(source.recordVersion) && source.recordVersion > 0 ? source.recordVersion : 1,
      ...clone(SAFE_FLAGS)
    };
  }

  function createExecutionRecordDraft(executionRequest, input, options) {
    const values = input || {}, violations = inputViolationReasons(values);
    return deepFreeze(normalizeRecord({
      ...values, executionRequestRecordId: executionRequest && executionRequest.executionRequestRecordId,
      startRequestRecordId: executionRequest && executionRequest.startRequestRecordId,
      approvalRecordId: executionRequest && executionRequest.approvalRecordId,
      requestId: executionRequest && executionRequest.requestId,
      executionRequestSnapshot: makeExecutionRequestSnapshot(executionRequest),
      startRequestSnapshot: makeStartRequestSnapshot(executionRequest),
      approvalSnapshot: makeApprovalSnapshot(executionRequest), requestSnapshot: makeRequestSnapshot(executionRequest),
      executionRecordStatus: "execution_record_draft",
      expectedRecordCount: executionRequest && executionRequest.expectedRecordCount,
      expirationAt: executionRequest && executionRequest.expirationAt,
      intakePreparationBlockingReasons: violations
    }, options));
  }

  function validateExecutionRequestRecord(request, options) {
    const value = request || {}, reasons = [], now = nowDate(options);
    if (value.executionRequestStatus !== "ready_for_manual_execution_record") reasons.push("execution_request_status_not_ready");
    if (value.executionPreflightValidationResult !== "ready_for_manual_execution_record") reasons.push("execution_request_validation_not_ready");
    if (!Array.isArray(value.executionPreflightBlockingReasons) || value.executionPreflightBlockingReasons.length) reasons.push("preflight_reasons_exist");
    if (!text(value.executionRequestRecordId) || !text(value.startRequestRecordId) || !text(value.approvalRecordId) || !text(value.requestId)) reasons.push("execution_request_identity_missing");
    if (!text(value.executionRequestedBy) || !text(value.executionApprover) || !text(value.executionRequestedAt) || !text(value.executionApprovedAt)) reasons.push("execution_request_information_missing");
    if (!value.startRequestSnapshot || !value.approvalSnapshot || !value.requestSnapshot) reasons.push("execution_request_snapshots_missing");
    if (!phase265.validateExecutionPreflightChecklist(value).valid) reasons.push("execution_preflight_checklist_incomplete");
    if (value.requestSnapshot && value.requestSnapshot.sourceTrustLevel === "unknown_source") reasons.push("unknown_source_blocked");
    if (value.requestSnapshot && value.requestSnapshot.credentialsRequired === true) reasons.push("credentials_requirement_not_supported");
    if (text(value.expirationAt)) {
      const expiration = new Date(value.expirationAt);
      if (Number.isNaN(expiration.getTime()) || expiration <= now) reasons.push("execution_request_expired");
    }
    if (Object.keys(phase265.SAFE_FLAGS).some(key => value[key] !== phase265.SAFE_FLAGS[key])) reasons.push("execution_request_safety_flag_mismatch");
    return deepFreeze({ valid: unique(reasons).length === 0, reasons: unique(reasons) });
  }

  function validateExecutionRecorder(record, options) {
    const value = normalizeRecord(record, options), reasons = [], at = new Date(value.recordedAt);
    if (!value.recordedBy) reasons.push("recorder_missing");
    else if (RESERVED_RECORDERS.includes(value.recordedBy.toLowerCase())) reasons.push("reserved_recorder_prohibited");
    if (!value.recordedAt || Number.isNaN(at.getTime()) || at > nowDate(options)) reasons.push("record_time_invalid");
    if (!value.actualOperator) reasons.push("actual_operator_missing");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateObservedExecution(record, options) {
    const value = normalizeRecord(record, options), reasons = [];
    const date = new Date(`${value.actualExecutionDate}T00:00:00`);
    const start = new Date(`${value.actualExecutionDate}T${value.actualExecutionStartTime}`);
    const end = new Date(`${value.actualExecutionDate}T${value.actualExecutionEndTime}`);
    const today = nowDate(options); today.setHours(23, 59, 59, 999);
    if (!value.actualExecutionDate || Number.isNaN(date.getTime()) || date > today) reasons.push("execution_date_invalid");
    if (!value.actualExecutionStartTime || !value.actualExecutionEndTime || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) reasons.push("execution_time_invalid");
    if (!value.executionMethodObserved) reasons.push("execution_method_missing");
    if (!value.sourceObserved) reasons.push("source_observed_missing");
    if (!value.sourceTrustObserved) reasons.push("source_trust_missing");
    else if (value.sourceTrustObserved === "unknown_source" || !PHASE261_DEFINITION.sourceTrustLevels.includes(value.sourceTrustObserved)) reasons.push("source_trust_unknown");
    if (!value.targetObserved) reasons.push("target_observed_missing");
    if (!value.dataTimepointObserved || value.dataTimepointObserved === "unknown" || !PHASE261_DEFINITION.dataTimepoints.includes(value.dataTimepointObserved)) reasons.push("data_timepoint_unknown");
    if (!Number.isInteger(value.observedRecordCount) || value.observedRecordCount < 0) reasons.push("observed_count_invalid");
    if (value.countDifference !== 0 && !value.countDifferenceReason) reasons.push("count_difference_unreviewed");
    if (["not_recorded", "unknown"].includes(value.executionOutcome)) reasons.push("execution_outcome_unknown");
    if (value.credentialsUsed) reasons.push("credentials_use_claimed");
    if (value.abnormalityDetected && !value.abnormalityDetails) reasons.push("abnormality_details_missing");
    if (value.interruptionOccurred && !value.interruptionDetails) reasons.push("interruption_details_missing");
    if (value.stopConditionTriggered && !value.stopConditionDetails) reasons.push("stop_condition_details_missing");
    if (value.cancellationConditionTriggered && !value.cancellationConditionDetails) reasons.push("cancellation_condition_details_missing");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  const calculateCountDifference = (expected, observed) => Number.isInteger(expected) && Number.isInteger(observed) ? observed - expected : null;
  function validateIntakePreparationChecklist(record) {
    const value = normalizeRecord(record), missing = INTAKE_PREPARATION_CHECKS.filter(key => value.intakePreparationChecklist[key] !== true);
    return deepFreeze({ valid: missing.length === 0, missing, reasons: missing.map(key => `checklist_${key}_required`) });
  }

  function resultFor(reasons) {
    if (reasons.includes("execution_request_status_not_ready")) return "blocked_by_invalid_execution_request_status";
    if (reasons.some(item => ["execution_request_validation_not_ready", "execution_request_identity_missing", "execution_request_information_missing", "execution_request_snapshots_missing", "execution_preflight_checklist_incomplete", "unknown_source_blocked", "credentials_requirement_not_supported"].includes(item))) return "blocked_by_execution_request_validation";
    if (reasons.includes("preflight_reasons_exist")) return "blocked_by_existing_preflight_reasons";
    if (reasons.includes("recorder_missing")) return "blocked_by_missing_recorder";
    if (reasons.includes("reserved_recorder_prohibited")) return "blocked_by_reserved_identity";
    if (reasons.includes("record_time_invalid")) return "blocked_by_invalid_record_time";
    if (reasons.includes("actual_operator_missing")) return "blocked_by_missing_actual_operator";
    if (reasons.includes("execution_date_invalid")) return "blocked_by_invalid_execution_date";
    if (reasons.includes("execution_time_invalid")) return "blocked_by_invalid_execution_time";
    if (reasons.includes("execution_method_missing")) return "blocked_by_missing_execution_method";
    if (reasons.includes("source_observed_missing") || reasons.includes("source_trust_missing")) return "blocked_by_missing_source";
    if (reasons.includes("source_trust_unknown")) return "blocked_by_unknown_source";
    if (reasons.includes("target_observed_missing")) return "blocked_by_missing_target";
    if (reasons.includes("data_timepoint_unknown")) return "blocked_by_unknown_timepoint";
    if (reasons.includes("observed_count_invalid")) return "blocked_by_invalid_observed_count";
    if (reasons.includes("count_difference_unreviewed")) return "blocked_by_unreviewed_count_difference";
    if (reasons.includes("execution_outcome_unknown")) return "blocked_by_unknown_outcome";
    if (reasons.includes("credentials_use_claimed")) return "blocked_by_credentials_use";
    if (reasons.includes("input_credentialsRecorded_prohibited")) return "blocked_by_credentials_recorded";
    if (reasons.includes("input_resultDataStored_prohibited")) return "blocked_by_result_data_stored";
    if (reasons.includes("input_resultDataImported_prohibited")) return "blocked_by_result_data_imported";
    if (reasons.includes("input_resultDataApplied_prohibited")) return "blocked_by_result_data_applied";
    if (reasons.includes("input_resultDataLearned_prohibited")) return "blocked_by_result_data_learned";
    if (reasons.includes("execution_request_safety_flag_mismatch")) return "blocked_by_safety_flag_mismatch";
    if (reasons.includes("execution_request_expired") || reasons.includes("record_expired")) return "blocked_by_expiration";
    if (reasons.some(item => item.startsWith("checklist_"))) return "blocked_by_incomplete_intake_checklist";
    return reasons.length ? "incomplete" : "execution_recorded";
  }

  function evaluateIntakePreparation(executionRequest, record, operation, options) {
    const value = normalizeRecord(record, options), target = validateExecutionRequestRecord(executionRequest, options);
    const recorder = validateExecutionRecorder(value, options), observed = validateObservedExecution(value, options);
    const reasons = [...target.reasons, ...recorder.reasons, ...observed.reasons, ...value.intakePreparationBlockingReasons];
    if (value.executionRecordStatus === "expired") reasons.push("record_expired");
    if (!["execution_record_draft", "execution_record_blocked"].includes(value.executionRecordStatus)) reasons.push("execution_record_not_draft");
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) reasons.push("manual_execution_record_confirmation_required");
    const intakePreparationBlockingReasons = unique(reasons), intakePreparationValidationResult = resultFor(intakePreparationBlockingReasons);
    return deepFreeze({
      recorded: intakePreparationValidationResult === "execution_recorded",
      record: normalizeRecord({
        ...value, executionRequestRecordId: executionRequest && executionRequest.executionRequestRecordId,
        startRequestRecordId: executionRequest && executionRequest.startRequestRecordId,
        approvalRecordId: executionRequest && executionRequest.approvalRecordId,
        requestId: executionRequest && executionRequest.requestId,
        executionRequestSnapshot: makeExecutionRequestSnapshot(executionRequest),
        startRequestSnapshot: makeStartRequestSnapshot(executionRequest),
        approvalSnapshot: makeApprovalSnapshot(executionRequest), requestSnapshot: makeRequestSnapshot(executionRequest),
        executionRecordStatus: intakePreparationValidationResult === "execution_recorded" ? "execution_recorded" : "execution_record_blocked",
        intakePreparationValidationResult, intakePreparationBlockingReasons,
        updatedAt: nowDate(options).toISOString(), recordVersion: value.recordVersion + 1
      }, options), intakePreparationValidationResult, intakePreparationBlockingReasons
    });
  }

  const recordManualExecutionOutcome = (executionRequest, record, operation, options) => evaluateIntakePreparation(executionRequest, record, operation, options);
  function beginIntakePreparation(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.executionRecordStatus !== "execution_recorded") return deepFreeze({ transitioned: false, reason: "recorded_execution_outcome_required", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ transitioned: true, record: normalizeRecord({ ...current, executionRecordStatus: "intake_preparation_in_progress", updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1 }, options) });
  }
  function completeIntakePreparation(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.executionRecordStatus !== "intake_preparation_in_progress") return deepFreeze({ completed: false, reason: "intake_preparation_not_in_progress", record: current });
    const checklist = validateIntakePreparationChecklist(current), reasons = [...checklist.reasons];
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) reasons.push("final_human_intake_confirmation_required");
    const ready = reasons.length === 0;
    return deepFreeze({ completed: ready, record: normalizeRecord({
      ...current, executionRecordStatus: ready ? "ready_for_manual_result_preview" : "intake_preparation_blocked",
      intakePreparationValidationResult: ready ? "ready_for_manual_result_preview" : resultFor(reasons),
      intakePreparationBlockingReasons: unique(reasons), updatedAt: nowDate(options).toISOString(),
      recordVersion: current.recordVersion + 1
    }, options) });
  }

  function updateExecutionRecordDraft(record, changes, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["execution_record_draft", "execution_record_blocked", "intake_preparation_blocked"].includes(current.executionRecordStatus)) return deepFreeze({ updated: false, reason: "confirmed_record_is_immutable", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    const violations = inputViolationReasons(changes);
    return deepFreeze({ updated: true, record: normalizeRecord({
      ...current, ...(changes || {}), executionRecordId: current.executionRecordId,
      executionRequestSnapshot: current.executionRequestSnapshot, startRequestSnapshot: current.startRequestSnapshot,
      approvalSnapshot: current.approvalSnapshot, requestSnapshot: current.requestSnapshot,
      executionRecordStatus: "execution_record_draft", intakePreparationValidationResult: "incomplete",
      intakePreparationBlockingReasons: violations, updatedAt: nowDate(options).toISOString(),
      recordVersion: current.recordVersion + 1
    }, options) });
  }

  function closeRecord(record, state, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["rejected", "cancelled", "expired"].includes(state) || TERMINAL_STATES.includes(current.executionRecordStatus)) return deepFreeze({ transitioned: false, reason: "transition_not_allowed", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    return deepFreeze({ transitioned: true, record: normalizeRecord({ ...current, executionRecordStatus: state, updatedAt: nowDate(options).toISOString(), recordVersion: current.recordVersion + 1 }, options) });
  }
  const rejectExecutionRecord = (record, operation, options) => closeRecord(record, "rejected", operation, options);
  const cancelExecutionRecord = (record, operation, options) => closeRecord(record, "cancelled", operation, options);
  const expireExecutionRecord = (record, operation, options) => closeRecord(record, "expired", operation, options);

  function getExecutionRecordSummary(record) {
    const value = normalizeRecord(record);
    return deepFreeze({
      executionRecordId: value.executionRecordId, executionRequestRecordId: value.executionRequestRecordId,
      status: value.executionRecordStatus, recordedBy: value.recordedBy, actualOperator: value.actualOperator,
      observedCount: value.observedRecordCount, countDifference: value.countDifference,
      outcome: value.executionOutcome, abnormalityDetected: value.abnormalityDetected,
      humanReportedAfterTheFact: true, systemExecutedAcquisition: false,
      resultDataStored: false, resultDataImported: false, resultDataApplied: false, resultDataLearned: false,
      notice: "ready_for_manual_result_previewは結果データ読込・保存・正式取込を意味しません"
    });
  }
  function getIntakePreparationSummary(record) {
    const value = normalizeRecord(record), check = validateIntakePreparationChecklist(value);
    return deepFreeze({ status: value.executionRecordStatus, completedChecks: INTAKE_PREPARATION_CHECKS.length - check.missing.length, requiredChecks: INTAKE_PREPARATION_CHECKS.length, missingChecks: [...check.missing], resultPreviewReady: false, intakeReady: false });
  }

  function render(documentRef) {
    if (!documentRef) return;
    const form = documentRef.getElementById("phase266-execution-record-form");
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form), summary = documentRef.getElementById("phase266-execution-summary");
      const record = normalizeRecord({
        recordedBy: text(data.get("recordedBy")), recordedAt: text(data.get("recordedAt")),
        actualOperator: text(data.get("actualOperator")), actualExecutionDate: text(data.get("actualExecutionDate")),
        actualExecutionStartTime: text(data.get("actualExecutionStartTime")), actualExecutionEndTime: text(data.get("actualExecutionEndTime")),
        executionMethodObserved: text(data.get("executionMethodObserved")), sourceObserved: text(data.get("sourceObserved")),
        sourceTrustObserved: text(data.get("sourceTrustObserved")), targetObserved: text(data.get("targetObserved")),
        dataTimepointObserved: text(data.get("dataTimepointObserved")), observedRecordCount: Number(data.get("observedRecordCount")),
        executionOutcome: text(data.get("executionOutcome")),
        intakePreparationChecklist: makeChecklist(Object.fromEntries(INTAKE_PREPARATION_CHECKS.map(key => [key, data.get(key) === "on"])))
      });
      if (summary) summary.textContent = JSON.stringify(getExecutionRecordSummary(record), null, 2);
    });
  }
  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
  }

  return {
    PHASE261_DEFINITION, PHASE262_REFERENCE, PHASE263_REFERENCE, PHASE264_REFERENCE,
    PHASE265_REFERENCE, EXECUTION_RECORD_STATES, INTAKE_PREPARATION_CHECKS,
    EXECUTION_OUTCOMES, INTAKE_RESULTS, SAFE_FLAGS, EXECUTION_REQUEST_SNAPSHOT_FIELDS,
    makeExecutionRequestSnapshot, makeStartRequestSnapshot, makeApprovalSnapshot,
    makeRequestSnapshot, createExecutionRecordDraft, validateExecutionRequestRecord,
    validateExecutionRecorder, validateObservedExecution, calculateCountDifference,
    validateIntakePreparationChecklist, evaluateIntakePreparation, updateExecutionRecordDraft,
    recordManualExecutionOutcome, beginIntakePreparation, completeIntakePreparation,
    rejectExecutionRecord, cancelExecutionRecord, expireExecutionRecord,
    getExecutionRecordSummary, getIntakePreparationSummary, render
  };
});
