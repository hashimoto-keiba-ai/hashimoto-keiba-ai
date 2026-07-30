(function (root, factory) {
  const phase261 = typeof module === "object" && module.exports
    ? require("./phase26-1-external-data-acquisition-boundary.js")
    : root.HashimotoPhase261ExternalDataAcquisitionBoundary;
  const api = factory(phase261);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase262ManualAcquisitionRequestPrecheck = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase261) {
  "use strict";

  if (!phase261) throw new Error("Phase26-1 definition is required");

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

  const PHASE261_DEFINITION = phase261.definition();
  const REQUEST_STATES = deepFreeze([
    "draft",
    "awaiting_source_selection",
    "awaiting_target_selection",
    "awaiting_precheck",
    "precheck_blocked",
    "ready_for_manual_request",
    "manually_requested",
    "cancelled",
    "expired"
  ]);
  const TERMINAL_STATES = deepFreeze(["cancelled", "expired"]);
  const ALLOWED_PURPOSES = deepFreeze([
    "prediction_input_support",
    "manual_input_reduction",
    "input_error_reduction",
    "data_standardization",
    "pre_race_review",
    "result_verification",
    "audit_reference"
  ]);
  const PROHIBITED_PURPOSES = deepFreeze([
    "automatic_purchase",
    "automatic_decision",
    "automatic_learning_update",
    "unattended_operation"
  ]);
  const PRECHECK_RESULTS = deepFreeze([
    "incomplete",
    "blocked_by_missing_source",
    "blocked_by_unknown_source",
    "blocked_by_missing_target",
    "blocked_by_invalid_target_data",
    "blocked_by_unknown_timepoint",
    "blocked_by_missing_consent",
    "blocked_by_terms_unconfirmed",
    "blocked_by_access_restriction_unconfirmed",
    "blocked_by_credentials_requirement",
    "blocked_by_prohibited_purpose",
    "blocked_by_safety_policy",
    "ready_for_manual_request"
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
    credentialsStoredInSourceCode: false
  });
  const ALLOWED_TRANSITIONS = deepFreeze({
    draft: ["awaiting_source_selection", "cancelled", "expired"],
    awaiting_source_selection: ["awaiting_target_selection", "cancelled", "expired"],
    awaiting_target_selection: ["awaiting_precheck", "cancelled", "expired"],
    awaiting_precheck: ["precheck_blocked", "ready_for_manual_request", "cancelled", "expired"],
    precheck_blocked: ["awaiting_source_selection", "awaiting_target_selection", "awaiting_precheck", "cancelled", "expired"],
    ready_for_manual_request: ["manually_requested", "cancelled", "expired"],
    manually_requested: ["cancelled", "expired"],
    cancelled: [],
    expired: []
  });
  const FINAL_RESULT_DATA = deepFreeze([
    "レース結果", "着順", "タイム", "着差", "上がり", "通過順位", "払戻情報"
  ]);
  const PRE_RACE_TIMEPOINTS = deepFreeze(["preliminary", "pre_race", "near_post_time"]);
  const FINAL_TIMEPOINTS = deepFreeze(["final", "corrected"]);

  function nowIso(options) {
    const now = options && typeof options.now === "function" ? options.now() : new Date();
    return new Date(now).toISOString();
  }

  function fixedSafetyFlags() {
    return clone(SAFE_FLAGS);
  }

  function normalizeRequest(input, options) {
    const source = input || {};
    const createdAt = text(source.createdAt) || nowIso(options);
    return {
      requestId: text(source.requestId) || `phase26-2-${createdAt.replace(/\D/g, "").slice(0, 17)}`,
      createdAt,
      createdBy: text(source.createdBy),
      requestStatus: REQUEST_STATES.includes(source.requestStatus) ? source.requestStatus : "draft",
      acquisitionMethod: text(source.acquisitionMethod),
      sourceTrustLevel: text(source.sourceTrustLevel),
      sourceName: text(source.sourceName),
      sourceDescription: text(source.sourceDescription),
      sourceUrlReference: text(source.sourceUrlReference),
      meetingDate: text(source.meetingDate),
      racecourse: text(source.racecourse),
      raceNumber: Number(source.raceNumber) || 0,
      raceName: text(source.raceName),
      scheduledPostTime: text(source.scheduledPostTime),
      targetDataTypes: unique(source.targetDataTypes).filter(item => typeof item === "string"),
      dataTimepoint: text(source.dataTimepoint),
      expectedRecordCount: Number(source.expectedRecordCount) || 0,
      purpose: text(source.purpose),
      operatorNote: text(source.operatorNote),
      consentConfirmed: source.consentConfirmed === true,
      termsCheckConfirmed: source.termsCheckConfirmed === true,
      accessRestrictionCheckConfirmed: source.accessRestrictionCheckConfirmed === true,
      credentialsRequired: source.credentialsRequired === true,
      ...fixedSafetyFlags(),
      validationResult: PRECHECK_RESULTS.includes(source.validationResult) ? source.validationResult : "incomplete",
      blockingReasons: unique(source.blockingReasons).filter(item => typeof item === "string")
    };
  }

  function createDraftRequest(input, options) {
    return deepFreeze(normalizeRequest({ ...(input || {}), requestStatus: "draft" }, options));
  }

  function validateSourceSelection(request) {
    const value = normalizeRequest(request);
    const reasons = [];
    const trustLevels = PHASE261_DEFINITION.sourceTrustLevels;
    const method = PHASE261_DEFINITION.acquisitionMethods.find(item => item.id === value.acquisitionMethod);
    if (!value.sourceTrustLevel) reasons.push("source_trust_level_missing");
    else if (!trustLevels.includes(value.sourceTrustLevel)) reasons.push("source_trust_level_invalid");
    else if (value.sourceTrustLevel === "unknown_source") reasons.push("unknown_source_blocked");
    if (!value.sourceName) reasons.push("source_name_missing");
    if (!method) reasons.push("acquisition_method_missing_or_invalid");
    else if (method.category === "prohibited") reasons.push("acquisition_method_prohibited");
    if (value.credentialsRequired) reasons.push("credentials_requirement_not_supported");
    if (value.credentialsStoredInSourceCode !== false) reasons.push("credentials_source_storage_prohibited");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateTargetSelection(request) {
    const value = normalizeRequest(request);
    const reasons = [];
    if (!value.meetingDate) reasons.push("meeting_date_missing");
    if (!value.racecourse) reasons.push("racecourse_missing");
    if (!Number.isInteger(value.raceNumber) || value.raceNumber < 1) reasons.push("race_number_invalid");
    if (!Number.isInteger(value.expectedRecordCount) || value.expectedRecordCount < 1) reasons.push("expected_record_count_invalid");
    if (value.targetDataTypes.length < 1) reasons.push("target_data_types_missing");
    if (value.targetDataTypes.some(item => !PHASE261_DEFINITION.targetData.includes(item))) reasons.push("target_data_type_out_of_scope");
    if (!value.dataTimepoint || value.dataTimepoint === "unknown") reasons.push("data_timepoint_unknown");
    else if (!PHASE261_DEFINITION.dataTimepoints.includes(value.dataTimepoint)) reasons.push("data_timepoint_invalid");
    const containsFinal = value.targetDataTypes.some(item => FINAL_RESULT_DATA.includes(item));
    const containsPreRace = value.targetDataTypes.some(item => !FINAL_RESULT_DATA.includes(item));
    if (PRE_RACE_TIMEPOINTS.includes(value.dataTimepoint) && containsFinal) reasons.push("final_data_at_prediction_timepoint");
    if (FINAL_TIMEPOINTS.includes(value.dataTimepoint) && containsFinal && containsPreRace) reasons.push("prediction_and_final_data_mixed");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function resultForReasons(reasons) {
    if (reasons.includes("unknown_source_blocked")) return "blocked_by_unknown_source";
    if (reasons.some(item => ["source_trust_level_missing", "source_trust_level_invalid", "source_name_missing"].includes(item))) return "blocked_by_missing_source";
    if (reasons.some(item => ["meeting_date_missing", "racecourse_missing", "race_number_invalid", "expected_record_count_invalid"].includes(item))) return "blocked_by_missing_target";
    if (reasons.some(item => ["target_data_types_missing", "target_data_type_out_of_scope", "final_data_at_prediction_timepoint", "prediction_and_final_data_mixed"].includes(item))) return "blocked_by_invalid_target_data";
    if (reasons.some(item => ["data_timepoint_unknown", "data_timepoint_invalid"].includes(item))) return "blocked_by_unknown_timepoint";
    if (reasons.includes("consent_not_confirmed")) return "blocked_by_missing_consent";
    if (reasons.includes("terms_check_not_confirmed")) return "blocked_by_terms_unconfirmed";
    if (reasons.includes("access_restriction_check_not_confirmed")) return "blocked_by_access_restriction_unconfirmed";
    if (reasons.includes("credentials_requirement_not_supported")) return "blocked_by_credentials_requirement";
    if (reasons.includes("purpose_prohibited")) return "blocked_by_prohibited_purpose";
    if (reasons.some(item => ["acquisition_method_prohibited", "safety_boundary_invalid"].includes(item))) return "blocked_by_safety_policy";
    return reasons.length ? "incomplete" : "ready_for_manual_request";
  }

  function evaluatePrecheck(request, operation) {
    const value = normalizeRequest(request);
    const source = validateSourceSelection(value);
    const target = validateTargetSelection(value);
    const reasons = [...source.reasons, ...target.reasons];
    if (!value.consentConfirmed) reasons.push("consent_not_confirmed");
    if (!value.termsCheckConfirmed) reasons.push("terms_check_not_confirmed");
    if (!value.accessRestrictionCheckConfirmed) reasons.push("access_restriction_check_not_confirmed");
    if (!ALLOWED_PURPOSES.includes(value.purpose)) {
      reasons.push(PROHIBITED_PURPOSES.includes(value.purpose) ? "purpose_prohibited" : "purpose_missing_or_invalid");
    }
    if (Object.keys(SAFE_FLAGS).some(key => value[key] !== SAFE_FLAGS[key])) reasons.push("safety_boundary_invalid");
    if (!operation || !text(operation.performedBy) || operation.explicitConfirmation !== true) {
      reasons.push("manual_precheck_confirmation_required");
    }
    const blockingReasons = unique(reasons);
    const validationResult = resultForReasons(blockingReasons);
    return deepFreeze({
      request: normalizeRequest({
        ...value,
        requestStatus: validationResult === "ready_for_manual_request" ? "ready_for_manual_request" : "precheck_blocked",
        validationResult,
        blockingReasons
      }),
      validationResult,
      blockingReasons,
      ready: validationResult === "ready_for_manual_request"
    });
  }

  function updateDraftRequest(request, changes, operation) {
    const current = normalizeRequest(request);
    if (TERMINAL_STATES.includes(current.requestStatus) || current.requestStatus === "manually_requested") {
      return deepFreeze({ updated: false, reason: "request_not_editable", request: current });
    }
    if (!operation || !text(operation.performedBy) || !text(operation.reason)) {
      return deepFreeze({ updated: false, reason: "manual_operation_required", request: current });
    }
    const next = normalizeRequest({
      ...current,
      ...(changes || {}),
      requestId: current.requestId,
      createdAt: current.createdAt,
      createdBy: current.createdBy,
      requestStatus: current.requestStatus,
      validationResult: "incomplete",
      blockingReasons: []
    });
    return deepFreeze({ updated: true, request: next });
  }

  function transitionRequest(request, nextStatus, operation) {
    const current = normalizeRequest(request);
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) {
      return deepFreeze({ transitioned: false, reason: "manual_operation_required", request: current });
    }
    if (current.requestStatus === "precheck_blocked" && nextStatus === "ready_for_manual_request") {
      return deepFreeze({ transitioned: false, reason: "blocked_request_cannot_be_forced_ready", request: current });
    }
    if (!REQUEST_STATES.includes(nextStatus) || !(ALLOWED_TRANSITIONS[current.requestStatus] || []).includes(nextStatus)) {
      return deepFreeze({ transitioned: false, reason: "transition_not_allowed", request: current });
    }
    if (nextStatus === "ready_for_manual_request") {
      const checked = evaluatePrecheck(current, operation);
      return deepFreeze({
        transitioned: checked.ready,
        reason: checked.ready ? "" : "precheck_failed",
        request: checked.request
      });
    }
    return deepFreeze({ transitioned: true, request: normalizeRequest({ ...current, requestStatus: nextStatus }) });
  }

  function cancelRequest(request, operation) {
    return transitionRequest(request, "cancelled", operation);
  }

  function expireRequest(request, operation) {
    return transitionRequest(request, "expired", operation);
  }

  function getRequestSummary(request) {
    const value = normalizeRequest(request);
    return deepFreeze({
      requestId: value.requestId,
      status: value.requestStatus,
      source: value.sourceName || "未選択",
      sourceTrustLevel: value.sourceTrustLevel || "未選択",
      targetRace: [value.meetingDate, value.racecourse, value.raceNumber ? `${value.raceNumber}R` : ""].filter(Boolean).join(" / ") || "未選択",
      targetDataTypes: [...value.targetDataTypes],
      dataTimepoint: value.dataTimepoint || "未選択",
      expectedRecordCount: value.expectedRecordCount,
      purpose: value.purpose || "未選択",
      validationResult: value.validationResult,
      blockingReasons: [...value.blockingReasons],
      notice: "準備完了は取得実行を意味しません"
    });
  }

  function render(documentRef) {
    if (!documentRef) return;
    const form = documentRef.getElementById("phase262-request-form");
    if (!form) return;
    const resultNode = documentRef.getElementById("phase262-precheck-result");
    const reasonsNode = documentRef.getElementById("phase262-blocking-reasons");
    const summaryNode = documentRef.getElementById("phase262-request-summary");
    const targetDataInputs = [...form.querySelectorAll("[name='targetDataTypes']")];
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const draft = createDraftRequest({
        createdBy: text(data.get("createdBy")),
        acquisitionMethod: text(data.get("acquisitionMethod")),
        sourceTrustLevel: text(data.get("sourceTrustLevel")),
        sourceName: text(data.get("sourceName")),
        sourceDescription: text(data.get("sourceDescription")),
        sourceUrlReference: text(data.get("sourceUrlReference")),
        meetingDate: text(data.get("meetingDate")),
        racecourse: text(data.get("racecourse")),
        raceNumber: Number(data.get("raceNumber")),
        raceName: text(data.get("raceName")),
        scheduledPostTime: text(data.get("scheduledPostTime")),
        targetDataTypes: targetDataInputs.filter(input => input.checked).map(input => input.value),
        dataTimepoint: text(data.get("dataTimepoint")),
        expectedRecordCount: Number(data.get("expectedRecordCount")),
        purpose: text(data.get("purpose")),
        operatorNote: text(data.get("operatorNote")),
        consentConfirmed: data.get("consentConfirmed") === "on",
        termsCheckConfirmed: data.get("termsCheckConfirmed") === "on",
        accessRestrictionCheckConfirmed: data.get("accessRestrictionCheckConfirmed") === "on",
        credentialsRequired: data.get("credentialsRequired") === "on"
      });
      const checked = evaluatePrecheck(draft, {
        performedBy: draft.createdBy,
        explicitConfirmation: true
      });
      const summary = getRequestSummary(checked.request);
      if (resultNode) resultNode.textContent = checked.validationResult;
      if (reasonsNode) reasonsNode.textContent = checked.blockingReasons.length ? checked.blockingReasons.join(" / ") : "なし";
      if (summaryNode) summaryNode.textContent = JSON.stringify(summary, null, 2);
    });
  }

  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    PHASE261_DEFINITION,
    REQUEST_STATES,
    ALLOWED_PURPOSES,
    PROHIBITED_PURPOSES,
    PRECHECK_RESULTS,
    SAFE_FLAGS,
    ALLOWED_TRANSITIONS,
    createDraftRequest,
    validateSourceSelection,
    validateTargetSelection,
    evaluatePrecheck,
    updateDraftRequest,
    transitionRequest,
    cancelRequest,
    expireRequest,
    getRequestSummary,
    render
  };
});
