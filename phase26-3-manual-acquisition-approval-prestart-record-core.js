(function (root, factory) {
  const phase261 = typeof module === "object" && module.exports
    ? require("./phase26-1-external-data-acquisition-boundary.js")
    : root.HashimotoPhase261ExternalDataAcquisitionBoundary;
  const phase262 = typeof module === "object" && module.exports
    ? require("./phase26-2-manual-acquisition-request-precheck-core.js")
    : root.HashimotoPhase262ManualAcquisitionRequestPrecheck;
  const api = factory(phase261, phase262);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase263ManualAcquisitionApprovalPrestartRecord = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase261, phase262) {
  "use strict";

  if (!phase261 || !phase262) throw new Error("Phase26-1 and Phase26-2 definitions are required");

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
  const APPROVAL_STATES = deepFreeze([
    "awaiting_manual_approval",
    "approval_blocked",
    "approved_for_prestart_record",
    "prestart_record_in_progress",
    "prestart_record_blocked",
    "ready_for_manual_start_request",
    "rejected",
    "cancelled",
    "expired"
  ]);
  const PRESTART_CHECKS = deepFreeze([
    "requestIdentityConfirmed",
    "requestSnapshotConfirmed",
    "sourceConfirmed",
    "sourceTrustConfirmed",
    "targetRaceConfirmed",
    "targetDataConfirmed",
    "dataTimepointConfirmed",
    "expectedRecordCountConfirmed",
    "purposeConfirmed",
    "consentConfirmed",
    "termsConfirmed",
    "accessRestrictionConfirmed",
    "noCredentialsStoredConfirmed",
    "noExternalCommunicationYetConfirmed",
    "noAutomaticAcquisitionConfirmed",
    "noScheduledAcquisitionConfirmed",
    "noUnattendedAcquisitionConfirmed",
    "noAutomaticPurchaseConfirmed",
    "noAutomaticApplicationConfirmed",
    "noAutomaticLearningUpdateConfirmed",
    "previewRequirementConfirmed",
    "manualApprovalRequirementConfirmed",
    "operatorResponsibilityConfirmed",
    "cancellationConditionsConfirmed",
    "finalHumanConfirmation"
  ]);
  const APPROVAL_RESULTS = deepFreeze([
    "incomplete",
    "blocked_by_invalid_request_status",
    "blocked_by_request_validation",
    "blocked_by_existing_reasons",
    "blocked_by_unknown_source",
    "blocked_by_missing_approver",
    "blocked_by_invalid_approval_time",
    "blocked_by_missing_reason",
    "blocked_by_missing_reviewer_role",
    "blocked_by_incomplete_prestart_checklist",
    "blocked_by_credentials_requirement",
    "blocked_by_safety_flag_mismatch",
    "blocked_by_expiration",
    "approved_for_prestart_record",
    "ready_for_manual_start_request"
  ]);
  const SAFE_FLAGS = deepFreeze({
    executionPolicy: "PLAN_ONLY",
    protectedMode: true,
    privateLocalOnly: true,
    externalCommunicationEnabled: false,
    automaticAcquisitionEnabled: false,
    scheduledAcquisitionEnabled: false,
    unattendedAcquisitionEnabled: false,
    automaticPurchaseEnabled: false,
    automaticApplicationEnabled: false,
    automaticLearningUpdateEnabled: false,
    previewRequired: true,
    manualApprovalRequired: true,
    credentialsStoredInSourceCode: false,
    acquisitionStarted: false,
    acquisitionExecuted: false,
    acquisitionCompleted: false
  });
  const SNAPSHOT_FIELDS = deepFreeze([
    "requestId", "createdAt", "createdBy", "requestStatus", "acquisitionMethod", "sourceTrustLevel", "sourceName",
    "sourceDescription", "sourceUrlReference", "meetingDate", "racecourse", "raceNumber", "raceName",
    "scheduledPostTime", "targetDataTypes", "dataTimepoint", "expectedRecordCount", "purpose",
    "operatorNote", "consentConfirmed", "termsCheckConfirmed", "accessRestrictionCheckConfirmed",
    "credentialsRequired", "validationResult", "blockingReasons"
  ]);
  const REQUEST_REQUIRED_SAFE_FLAGS = deepFreeze({ ...phase262.SAFE_FLAGS });
  const RESERVED_APPROVERS = deepFreeze(["system", "auto", "bot", "automation"]);
  const TERMINAL_STATES = deepFreeze(["rejected", "cancelled", "expired", "ready_for_manual_start_request"]);

  function makeChecklist(value) {
    const source = value || {};
    return Object.fromEntries(PRESTART_CHECKS.map(key => [key, source[key] === true]));
  }

  function makeRequestSnapshot(request) {
    const source = request || {};
    const snapshot = {};
    SNAPSHOT_FIELDS.forEach(key => {
      if (key === "targetDataTypes" || key === "blockingReasons") {
        snapshot[key] = unique(source[key]).filter(item => typeof item === "string");
      }
      else if (typeof source[key] === "boolean" || typeof source[key] === "number") snapshot[key] = source[key];
      else snapshot[key] = text(source[key]);
    });
    return deepFreeze(snapshot);
  }

  function normalizeRecord(input, options) {
    const source = input || {};
    const createdAt = text(source.createdAt) || nowDate(options).toISOString();
    return {
      approvalRecordId: text(source.approvalRecordId) || `phase26-3-${createdAt.replace(/\D/g, "").slice(0, 17)}`,
      requestId: text(source.requestId || (source.requestSnapshot && source.requestSnapshot.requestId)),
      requestSnapshot: makeRequestSnapshot(source.requestSnapshot),
      approvalStatus: APPROVAL_STATES.includes(source.approvalStatus) ? source.approvalStatus : "awaiting_manual_approval",
      approvedBy: text(source.approvedBy),
      approvedAt: text(source.approvedAt),
      approvalReason: text(source.approvalReason),
      approvalNote: text(source.approvalNote),
      reviewerRole: text(source.reviewerRole),
      selfApproval: source.selfApproval === true,
      preStartChecklist: makeChecklist(source.preStartChecklist),
      preStartValidationResult: APPROVAL_RESULTS.includes(source.preStartValidationResult)
        ? source.preStartValidationResult
        : "incomplete",
      preStartBlockingReasons: unique(source.preStartBlockingReasons).filter(item => typeof item === "string"),
      cancellationConditions: text(source.cancellationConditions),
      expirationAt: text(source.expirationAt),
      createdAt,
      updatedAt: text(source.updatedAt) || createdAt,
      recordVersion: Number.isInteger(source.recordVersion) && source.recordVersion > 0 ? source.recordVersion : 1,
      ...clone(SAFE_FLAGS)
    };
  }

  function createApprovalDraft(request, input, options) {
    const values = input || {};
    return deepFreeze(normalizeRecord({
      ...values,
      requestId: request && request.requestId,
      requestSnapshot: makeRequestSnapshot(request),
      approvalStatus: "awaiting_manual_approval",
      selfApproval: Boolean(request && text(request.createdBy) && text(request.createdBy) === text(values.approvedBy))
    }, options));
  }

  function validateApprovalTarget(request) {
    const value = request || {};
    const reasons = [];
    if (value.requestStatus !== "ready_for_manual_request") reasons.push("request_status_not_ready");
    if (value.validationResult !== "ready_for_manual_request") reasons.push("request_validation_not_ready");
    if (!Array.isArray(value.blockingReasons) || value.blockingReasons.length > 0) reasons.push("request_has_blocking_reasons");
    if (!text(value.requestId) || !text(value.createdBy)) reasons.push("request_identity_missing");
    if (value.sourceTrustLevel === "unknown_source") reasons.push("unknown_source_blocked");
    if (!PHASE261_DEFINITION.sourceTrustLevels.includes(value.sourceTrustLevel)) reasons.push("source_trust_invalid");
    if (!text(value.sourceName)) reasons.push("source_name_missing");
    const sourceValidation = phase262.validateSourceSelection(value);
    const targetValidation = phase262.validateTargetSelection(value);
    reasons.push(...sourceValidation.reasons, ...targetValidation.reasons);
    if (!phase262.ALLOWED_PURPOSES.includes(value.purpose)) reasons.push("purpose_not_allowed");
    if (value.consentConfirmed !== true) reasons.push("consent_not_confirmed");
    if (value.termsCheckConfirmed !== true) reasons.push("terms_not_confirmed");
    if (value.accessRestrictionCheckConfirmed !== true) reasons.push("access_restriction_not_confirmed");
    if (value.credentialsRequired === true) reasons.push("credentials_requirement_not_supported");
    if (Object.keys(REQUEST_REQUIRED_SAFE_FLAGS).some(key => value[key] !== REQUEST_REQUIRED_SAFE_FLAGS[key])) {
      reasons.push("request_safety_flag_mismatch");
    }
    return deepFreeze({ valid: unique(reasons).length === 0, reasons: unique(reasons) });
  }

  function validateApprover(record, options) {
    const value = normalizeRecord(record, options);
    const reasons = [];
    if (!value.approvedBy) reasons.push("approver_missing");
    else if (RESERVED_APPROVERS.includes(value.approvedBy.toLowerCase())) reasons.push("automatic_approver_prohibited");
    const approvedAt = new Date(value.approvedAt);
    const now = nowDate(options);
    if (!value.approvedAt || Number.isNaN(approvedAt.getTime()) || approvedAt.getTime() > now.getTime()) {
      reasons.push("approval_time_invalid");
    }
    if (!value.approvalReason) reasons.push("approval_reason_missing");
    if (!value.reviewerRole) reasons.push("reviewer_role_missing");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validatePreStartChecklist(record) {
    const value = normalizeRecord(record);
    const missing = PRESTART_CHECKS.filter(key => value.preStartChecklist[key] !== true);
    return deepFreeze({ valid: missing.length === 0, missing, reasons: missing.map(key => `checklist_${key}_required`) });
  }

  function isExpired(record, options) {
    if (!text(record && record.expirationAt)) return false;
    const expiration = new Date(record.expirationAt);
    return Number.isNaN(expiration.getTime()) || expiration.getTime() <= nowDate(options).getTime();
  }

  function approvalResultFor(reasons) {
    if (reasons.includes("request_status_not_ready")) return "blocked_by_invalid_request_status";
    if (reasons.includes("request_validation_not_ready") || reasons.includes("request_identity_missing")) return "blocked_by_request_validation";
    if (reasons.includes("request_has_blocking_reasons")) return "blocked_by_existing_reasons";
    if (reasons.includes("unknown_source_blocked")) return "blocked_by_unknown_source";
    if (reasons.includes("approver_missing") || reasons.includes("automatic_approver_prohibited")) return "blocked_by_missing_approver";
    if (reasons.includes("approval_time_invalid")) return "blocked_by_invalid_approval_time";
    if (reasons.includes("approval_reason_missing")) return "blocked_by_missing_reason";
    if (reasons.includes("reviewer_role_missing")) return "blocked_by_missing_reviewer_role";
    if (reasons.includes("credentials_requirement_not_supported")) return "blocked_by_credentials_requirement";
    if (reasons.includes("request_safety_flag_mismatch")) return "blocked_by_safety_flag_mismatch";
    if (reasons.includes("approval_expired")) return "blocked_by_expiration";
    if (reasons.some(item => item.startsWith("checklist_"))) return "blocked_by_incomplete_prestart_checklist";
    return reasons.length ? "blocked_by_request_validation" : "approved_for_prestart_record";
  }

  function evaluateApproval(request, record, operation, options) {
    const value = normalizeRecord(record, options);
    const target = validateApprovalTarget(request);
    const approver = validateApprover(value, options);
    const reasons = [...target.reasons, ...approver.reasons];
    if (value.approvalStatus === "expired" || isExpired(value, options)) reasons.push("approval_expired");
    if (!["awaiting_manual_approval", "approval_blocked"].includes(value.approvalStatus)) {
      reasons.push("approval_record_not_awaiting");
    }
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) {
      reasons.push("manual_approval_confirmation_required");
    }
    const preStartBlockingReasons = unique(reasons);
    const preStartValidationResult = approvalResultFor(preStartBlockingReasons);
    return deepFreeze({
      approved: preStartValidationResult === "approved_for_prestart_record",
      record: normalizeRecord({
        ...value,
        requestId: request && request.requestId,
        requestSnapshot: makeRequestSnapshot(request),
        approvalStatus: preStartValidationResult === "approved_for_prestart_record"
          ? "approved_for_prestart_record"
          : "approval_blocked",
        selfApproval: Boolean(request && text(request.createdBy) === value.approvedBy),
        preStartValidationResult,
        preStartBlockingReasons,
        updatedAt: nowDate(options).toISOString(),
        recordVersion: value.recordVersion + 1
      }, options),
      preStartValidationResult,
      preStartBlockingReasons
    });
  }

  function updateApprovalDraft(record, changes, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["awaiting_manual_approval", "approval_blocked", "prestart_record_blocked"].includes(current.approvalStatus)) {
      return deepFreeze({ updated: false, reason: "approved_record_is_immutable", record: current });
    }
    if (!operation || !text(operation.performedBy) || !text(operation.reason)) {
      return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    }
    return deepFreeze({
      updated: true,
      record: normalizeRecord({
        ...current,
        ...(changes || {}),
        approvalRecordId: current.approvalRecordId,
        requestId: current.requestId,
        requestSnapshot: current.requestSnapshot,
        approvalStatus: "awaiting_manual_approval",
        preStartValidationResult: "incomplete",
        preStartBlockingReasons: [],
        updatedAt: nowDate(options).toISOString(),
        recordVersion: current.recordVersion + 1
      }, options)
    });
  }

  function approveForPrestartRecord(request, record, operation, options) {
    return evaluateApproval(request, record, operation, options);
  }

  function beginPrestartRecord(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.approvalStatus !== "approved_for_prestart_record") {
      return deepFreeze({ transitioned: false, reason: "approval_required", record: current });
    }
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) {
      return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    }
    return deepFreeze({
      transitioned: true,
      record: normalizeRecord({
        ...current,
        approvalStatus: "prestart_record_in_progress",
        updatedAt: nowDate(options).toISOString(),
        recordVersion: current.recordVersion + 1
      }, options)
    });
  }

  function completePrestartRecord(record, operation, options) {
    const current = normalizeRecord(record, options);
    if (current.approvalStatus !== "prestart_record_in_progress") {
      return deepFreeze({ completed: false, reason: "prestart_record_not_in_progress", record: current });
    }
    if (isExpired(current, options)) {
      return deepFreeze({
        completed: false,
        reason: "approval_expired",
        record: normalizeRecord({ ...current, approvalStatus: "expired", preStartValidationResult: "blocked_by_expiration" }, options)
      });
    }
    const checklist = validatePreStartChecklist(current);
    const manualConfirmed = operation && text(operation.performedBy) && text(operation.reason) && operation.explicitConfirmation === true;
    const reasons = [...checklist.reasons];
    if (!manualConfirmed) reasons.push("final_human_confirmation_required");
    const ready = reasons.length === 0;
    return deepFreeze({
      completed: ready,
      reason: ready ? "" : "prestart_checklist_incomplete",
      record: normalizeRecord({
        ...current,
        approvalStatus: ready ? "ready_for_manual_start_request" : "prestart_record_blocked",
        preStartValidationResult: ready ? "ready_for_manual_start_request" : "blocked_by_incomplete_prestart_checklist",
        preStartBlockingReasons: unique(reasons),
        updatedAt: nowDate(options).toISOString(),
        recordVersion: current.recordVersion + 1
      }, options)
    });
  }

  function closeRecord(record, state, operation, options) {
    const current = normalizeRecord(record, options);
    if (!["rejected", "cancelled", "expired"].includes(state) || TERMINAL_STATES.includes(current.approvalStatus)) {
      return deepFreeze({ transitioned: false, reason: "transition_not_allowed", record: current });
    }
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) {
      return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    }
    return deepFreeze({
      transitioned: true,
      record: normalizeRecord({
        ...current,
        approvalStatus: state,
        updatedAt: nowDate(options).toISOString(),
        recordVersion: current.recordVersion + 1
      }, options)
    });
  }

  function rejectApproval(record, operation, options) {
    return closeRecord(record, "rejected", operation, options);
  }
  function cancelApproval(record, operation, options) {
    return closeRecord(record, "cancelled", operation, options);
  }
  function expireApproval(record, operation, options) {
    return closeRecord(record, "expired", operation, options);
  }

  function getApprovalSummary(record) {
    const value = normalizeRecord(record);
    return deepFreeze({
      approvalRecordId: value.approvalRecordId,
      requestId: value.requestId,
      approvalStatus: value.approvalStatus,
      approvedBy: value.approvedBy,
      approvedAt: value.approvedAt,
      reviewerRole: value.reviewerRole,
      selfApproval: value.selfApproval,
      preStartValidationResult: value.preStartValidationResult,
      preStartBlockingReasons: [...value.preStartBlockingReasons],
      acquisitionStarted: false,
      acquisitionExecuted: false,
      acquisitionCompleted: false,
      notice: "ready_for_manual_start_requestは取得開始を意味しません"
    });
  }

  function getPrestartSummary(record) {
    const value = normalizeRecord(record);
    const checklist = validatePreStartChecklist(value);
    return deepFreeze({
      approvalRecordId: value.approvalRecordId,
      status: value.approvalStatus,
      completedChecks: PRESTART_CHECKS.length - checklist.missing.length,
      requiredChecks: PRESTART_CHECKS.length,
      missingChecks: [...checklist.missing],
      cancellationConditions: value.cancellationConditions,
      expirationAt: value.expirationAt,
      readyForManualStartRequest: value.approvalStatus === "ready_for_manual_start_request",
      acquisitionStarted: false
    });
  }

  function render(documentRef) {
    if (!documentRef) return;
    const form = documentRef.getElementById("phase263-approval-form");
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const result = documentRef.getElementById("phase263-approval-result");
      const reasons = documentRef.getElementById("phase263-blocking-reasons");
      const summary = documentRef.getElementById("phase263-approval-summary");
      const snapshot = documentRef.getElementById("phase263-request-snapshot");
      const checklist = makeChecklist(Object.fromEntries(
        PRESTART_CHECKS.map(key => [key, data.get(key) === "on"])
      ));
      const request = phase262.createDraftRequest({
        requestId: text(data.get("requestId")),
        createdBy: text(data.get("createdBy")),
        acquisitionMethod: "manual_entry",
        sourceTrustLevel: text(data.get("sourceTrustLevel")),
        sourceName: text(data.get("sourceName")),
        meetingDate: text(data.get("meetingDate")),
        racecourse: text(data.get("racecourse")),
        raceNumber: Number(data.get("raceNumber")),
        targetDataTypes: ["開催情報"],
        dataTimepoint: "pre_race",
        expectedRecordCount: 1,
        purpose: "audit_reference",
        consentConfirmed: true,
        termsCheckConfirmed: true,
        accessRestrictionCheckConfirmed: true
      });
      const readyRequest = {
        ...request,
        requestStatus: "ready_for_manual_request",
        validationResult: "ready_for_manual_request",
        blockingReasons: []
      };
      const draft = createApprovalDraft(readyRequest, {
        approvedBy: text(data.get("approvedBy")),
        approvedAt: text(data.get("approvedAt")),
        approvalReason: text(data.get("approvalReason")),
        approvalNote: text(data.get("approvalNote")),
        reviewerRole: text(data.get("reviewerRole")),
        cancellationConditions: text(data.get("cancellationConditions")),
        expirationAt: text(data.get("expirationAt")),
        preStartChecklist: checklist
      });
      const evaluated = evaluateApproval(readyRequest, draft, {
        performedBy: text(data.get("approvedBy")),
        reason: text(data.get("approvalReason")),
        explicitConfirmation: true
      });
      if (result) result.textContent = evaluated.preStartValidationResult;
      if (reasons) reasons.textContent = evaluated.preStartBlockingReasons.length
        ? evaluated.preStartBlockingReasons.join(" / ")
        : "なし";
      if (summary) summary.textContent = JSON.stringify(getApprovalSummary(evaluated.record), null, 2);
      if (snapshot) snapshot.textContent = JSON.stringify(evaluated.record.requestSnapshot, null, 2);
    });
  }

  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    PHASE261_DEFINITION,
    PHASE262_REFERENCE,
    APPROVAL_STATES,
    PRESTART_CHECKS,
    APPROVAL_RESULTS,
    SAFE_FLAGS,
    SNAPSHOT_FIELDS,
    makeRequestSnapshot,
    createApprovalDraft,
    validateApprovalTarget,
    validateApprover,
    validatePreStartChecklist,
    evaluateApproval,
    updateApprovalDraft,
    approveForPrestartRecord,
    beginPrestartRecord,
    completePrestartRecord,
    rejectApproval,
    cancelApproval,
    expireApproval,
    getApprovalSummary,
    getPrestartSummary,
    render
  };
});
