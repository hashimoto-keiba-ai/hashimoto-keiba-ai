(function (root, factory) {
  const phase266 = typeof module === "object" && module.exports
    ? require("./phase26-6-manual-execution-record-intake-preparation-core.js")
    : root.HashimotoPhase266ManualExecutionRecordIntakePreparation;
  const api = factory(phase266);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase267ManualResultPreviewPreIntakeValidation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase266) {
  "use strict";
  if (!phase266) throw new Error("Phase26-6 definition is required");

  const deepFreeze = value => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
    }
    return value;
  };
  const clone = value => {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    }
    return value;
  };
  const text = value => typeof value === "string" ? value.trim() : "";
  const unique = values => [...new Set(Array.isArray(values) ? values : [])];
  const nowDate = options => new Date(options && typeof options.now === "function" ? options.now() : new Date());

  const PHASE266_REFERENCE = phase266;
  const STATES = deepFreeze([
    "awaiting_manual_result_preview_request", "result_preview_request_recorded",
    "validating_pre_intake_conditions", "pre_intake_validation_passed",
    "pre_intake_validation_failed", "pre_intake_validation_on_hold",
    "pre_intake_validation_cancelled", "ready_for_manual_result_preview_creation"
  ]);
  const CHECK_STATUSES = deepFreeze(["unchecked", "passed", "failed", "not_applicable", "needs_review"]);
  const SAFE_FLAGS = deepFreeze({
    resultDataSelected: false, resultDataRead: false, resultDataParsed: false,
    resultDataStored: false, resultDataImported: false, resultDataApplied: false,
    resultDataLearned: false, resultPreviewCreated: false, resultPreviewReady: false,
    intakeReady: false, autoExecutionEnabled: false, externalConnectionEnabled: false
  });
  const ALLOWED_FORMATS = deepFreeze(["csv_declared", "json_declared", "text_delimited_declared"]);
  const ALLOWED_FILE_TYPES = deepFreeze(["csv", "json", "txt"]);
  const ALLOWED_ENCODINGS = deepFreeze(["utf-8", "utf-8-bom", "shift_jis"]);
  const ALLOWED_DELIMITERS = deepFreeze(["comma", "tab", "semicolon", "not_applicable"]);
  const COUNT_JUDGMENTS = deepFreeze(["exact_match", "within_human_tolerance", "needs_review", "mismatch", "not_comparable"]);
  const MATCH_RESULTS = deepFreeze(["matched", "different", "needs_review", "not_comparable"]);
  const HUMAN_RESULTS = deepFreeze(["accepted", "rejected", "needs_review"]);
  const TRUST_ORDER = deepFreeze({
    unknown_source: 0, user_pasted_text: 1, manually_entered: 2,
    user_supplied_file: 3, licensed_provider: 4, official_source: 5
  });
  const CHECK_DEFINITIONS = deepFreeze([
    ["phase266_ready", "対象記録がPhase26-6 ready", "target"],
    ["execution_record_exists", "実行事後記録が存在", "target"],
    ["operator_recorded", "操作者が記録済み", "target"],
    ["execution_date_recorded", "実行日が記録済み", "target"],
    ["execution_times_recorded", "開始・終了時刻が記録済み", "target"],
    ["observed_method_recorded", "観測取得方式が記録済み", "target"],
    ["observed_source_recorded", "観測取得元が記録済み", "target"],
    ["observed_trust_recorded", "観測信頼区分が記録済み", "target"],
    ["observed_target_recorded", "観測対象が記録済み", "target"],
    ["observed_timepoint_recorded", "観測時点が記録済み", "target"],
    ["requester_recorded", "プレビュー要求者が記録済み", "request"],
    ["request_datetime_recorded", "要求日時が記録済み", "request"],
    ["request_reason_recorded", "要求理由が記録済み", "request"],
    ["format_recorded", "想定形式が記録済み", "format"],
    ["file_type_recorded", "想定ファイル種別が記録済み", "format"],
    ["encoding_recorded", "想定文字コードが記録済み", "format"],
    ["delimiter_recorded", "想定区切り文字が記録済み", "format"],
    ["header_recorded", "ヘッダー有無が記録済み", "format"],
    ["record_unit_recorded", "レコード単位が記録済み", "format"],
    ["required_columns_defined", "必須列の想定が定義済み", "format"],
    ["unique_identifier_defined", "一意識別子の想定が定義済み", "format"],
    ["datetime_column_defined", "日付・時点列の想定が定義済み", "format"],
    ["target_identifier_defined", "対象識別列の想定が定義済み", "format"],
    ["expected_count_recorded", "想定件数が記録済み", "count"],
    ["planned_count_compared", "予定件数との比較が完了", "count"],
    ["observed_count_compared", "観測件数との比較が完了", "count"],
    ["count_difference_reviewed", "件数差の確認が完了", "count"],
    ["source_compared", "取得元比較が完了", "comparison"],
    ["method_compared", "取得方式比較が完了", "comparison"],
    ["trust_compared", "信頼区分比較が完了", "comparison"],
    ["target_compared", "対象比較が完了", "comparison"],
    ["timepoint_compared", "時点比較が完了", "comparison"],
    ["all_differences_recorded", "相違点がすべて記録済み", "comparison"],
    ["all_difference_reasons_recorded", "相違理由がすべて記録済み", "comparison"],
    ["no_pending_reviews", "要確認事項が未処理で残っていない", "exceptions"],
    ["abnormality_reviewed", "異常申告を確認済み", "exceptions"],
    ["interruption_reviewed", "中断申告を確認済み", "exceptions"],
    ["stop_reviewed", "停止申告を確認済み", "exceptions"],
    ["cancellation_reviewed", "取消申告を確認済み", "exceptions"],
    ["no_result_data_read", "実データを読み込んでいない", "safety"],
    ["no_file_saved", "ファイルを保存していない", "safety"],
    ["no_data_imported", "データをインポートしていない", "safety"],
    ["no_data_applied", "データを適用していない", "safety"],
    ["no_learning_update", "学習更新を行っていない", "safety"],
    ["no_automatic_processing", "自動処理を実行していない", "safety"],
    ["final_human_confirmation", "人間による最終確認が記録済み", "final"]
  ].map(([checkId, label, category]) => ({ checkId, label, category, required: true })));
  const ALLOWED_TRANSITIONS = deepFreeze({
    awaiting_manual_result_preview_request: ["result_preview_request_recorded", "pre_intake_validation_cancelled"],
    result_preview_request_recorded: ["validating_pre_intake_conditions", "pre_intake_validation_cancelled"],
    validating_pre_intake_conditions: ["pre_intake_validation_passed", "pre_intake_validation_failed", "pre_intake_validation_on_hold", "pre_intake_validation_cancelled"],
    pre_intake_validation_failed: ["validating_pre_intake_conditions", "pre_intake_validation_cancelled"],
    pre_intake_validation_on_hold: ["validating_pre_intake_conditions", "pre_intake_validation_cancelled"],
    pre_intake_validation_passed: ["ready_for_manual_result_preview_creation", "pre_intake_validation_cancelled"],
    pre_intake_validation_cancelled: [],
    ready_for_manual_result_preview_creation: []
  });
  const PHASE266_SNAPSHOT_FIELDS = deepFreeze([
    "executionRecordId", "executionRequestRecordId", "requestId", "executionRecordStatus",
    "actualOperator", "actualExecutionDate", "actualExecutionStartTime", "actualExecutionEndTime",
    "executionMethodObserved", "sourceObserved", "sourceTrustObserved", "targetObserved",
    "dataTimepointObserved", "expectedRecordCount", "observedRecordCount", "countDifference",
    "executionOutcome", "abnormalityDetected", "interruptionOccurred", "stopConditionTriggered",
    "cancellationConditionTriggered", "resultDataStored", "resultDataImported", "resultDataApplied",
    "resultDataLearned", "resultPreviewReady", "intakeReady"
  ]);

  function makePhase266Snapshot(target) {
    const source = target || {}, snapshot = {};
    PHASE266_SNAPSHOT_FIELDS.forEach(key => {
      if (typeof source[key] === "boolean" || typeof source[key] === "number") snapshot[key] = source[key];
      else snapshot[key] = text(source[key]);
    });
    snapshot.intakePreparationChecklist = Object.fromEntries(
      phase266.INTAKE_PREPARATION_CHECKS.map(checkId => [
        checkId, Boolean(source.intakePreparationChecklist && source.intakePreparationChecklist[checkId])
      ])
    );
    return deepFreeze(snapshot);
  }

  function createChecklist(items) {
    const supplied = new Map((Array.isArray(items) ? items : []).map(item => [item && item.checkId, item]));
    return CHECK_DEFINITIONS.map(definition => {
      const item = supplied.get(definition.checkId) || {};
      return {
        ...definition,
        status: CHECK_STATUSES.includes(item.status) ? item.status : "unchecked",
        checkedBy: text(item.checkedBy), checkedAt: text(item.checkedAt), note: text(item.note)
      };
    });
  }

  function addAudit(record, action, operation, details, options) {
    return [...(record.auditHistory || []), {
      auditId: `phase26-7-audit-${(record.auditHistory || []).length + 1}`,
      action, actor: text(operation && operation.performedBy),
      occurredAt: nowDate(options).toISOString(), reason: text(operation && operation.reason),
      details: clone(details || {})
    }];
  }

  function normalizeComparison(value, observed, expected) {
    const source = value || {};
    return {
      observed: text(observed), expected: text(expected),
      matchResult: MATCH_RESULTS.includes(source.matchResult) ? source.matchResult : "needs_review",
      difference: text(source.difference), differenceReason: text(source.differenceReason),
      humanResult: HUMAN_RESULTS.includes(source.humanResult) ? source.humanResult : "needs_review",
      confirmedBy: text(source.confirmedBy), confirmedAt: text(source.confirmedAt),
      decisionReason: text(source.decisionReason)
    };
  }

  function normalizeRecord(input, options) {
    const source = input || {}, createdAt = text(source.createdAt) || nowDate(options).toISOString();
    const target = source.phase266Snapshot || {};
    const expectedTrust = text(source.expectedSourceTrust);
    const observedTrust = text(target.sourceTrustObserved);
    return {
      previewRequestId: text(source.previewRequestId),
      phase266ExecutionRecordId: text(source.phase266ExecutionRecordId || target.executionRecordId),
      phase266Snapshot: makePhase266Snapshot(target),
      status: STATES.includes(source.status) ? source.status : "awaiting_manual_result_preview_request",
      requestedBy: text(source.requestedBy), requestDate: text(source.requestDate),
      requestTime: text(source.requestTime), requestReason: text(source.requestReason),
      expectedResultFormat: text(source.expectedResultFormat),
      expectedFileType: text(source.expectedFileType), expectedEncoding: text(source.expectedEncoding),
      expectedDelimiter: text(source.expectedDelimiter),
      expectedHeaderPresent: typeof source.expectedHeaderPresent === "boolean" ? source.expectedHeaderPresent : null,
      expectedRecordUnit: text(source.expectedRecordUnit),
      expectedTargetPeriod: text(source.expectedTargetPeriod),
      expectedReferenceTimepoint: text(source.expectedReferenceTimepoint),
      expectedSource: text(source.expectedSource), expectedMethod: text(source.expectedMethod),
      expectedSourceTrust: expectedTrust, expectedTarget: text(source.expectedTarget),
      expectedCount: Number.isInteger(source.expectedCount) && source.expectedCount >= 0 ? source.expectedCount : -1,
      note: text(source.note), expectedRequiredColumns: unique(source.expectedRequiredColumns).filter(text),
      expectedUniqueIdentifier: text(source.expectedUniqueIdentifier),
      expectedDateTimeColumn: text(source.expectedDateTimeColumn),
      expectedTargetIdentifierColumn: text(source.expectedTargetIdentifierColumn),
      countComparison: {
        phase266ExpectedCount: Number.isInteger(target.expectedRecordCount) ? target.expectedRecordCount : null,
        phase266ObservedCount: Number.isInteger(target.observedRecordCount) ? target.observedRecordCount : null,
        phase266CountDifference: typeof target.countDifference === "number" ? target.countDifference : null,
        previewExpectedCount: Number.isInteger(source.expectedCount) ? source.expectedCount : null,
        judgment: COUNT_JUDGMENTS.includes(source.countComparison && source.countComparison.judgment) ? source.countComparison.judgment : "not_comparable",
        toleranceCondition: text(source.countComparison && source.countComparison.toleranceCondition),
        judgmentReason: text(source.countComparison && source.countComparison.judgmentReason),
        confirmedBy: text(source.countComparison && source.countComparison.confirmedBy),
        confirmedAt: text(source.countComparison && source.countComparison.confirmedAt)
      },
      sourceComparison: normalizeComparison(source.sourceComparison, target.sourceObserved, source.expectedSource),
      methodComparison: normalizeComparison(source.methodComparison, target.executionMethodObserved, source.expectedMethod),
      trustComparison: {
        ...normalizeComparison(source.trustComparison, observedTrust, expectedTrust),
        trustDowngraded: (TRUST_ORDER[expectedTrust] ?? -1) < (TRUST_ORDER[observedTrust] ?? -1),
        additionalReviewRequired: source.trustComparison && source.trustComparison.additionalReviewRequired === true,
        intakeAccepted: source.trustComparison && source.trustComparison.intakeAccepted === true
      },
      targetComparison: {
        ...normalizeComparison(source.targetComparison, target.targetObserved, source.expectedTarget),
        targetScope: text(source.targetComparison && source.targetComparison.targetScope),
        identificationCondition: text(source.targetComparison && source.targetComparison.identificationCondition),
        exclusions: text(source.targetComparison && source.targetComparison.exclusions),
        duplicatePossible: source.targetComparison && source.targetComparison.duplicatePossible === true,
        missingPossible: source.targetComparison && source.targetComparison.missingPossible === true,
        contaminationPossible: source.targetComparison && source.targetComparison.contaminationPossible === true
      },
      timepointComparison: {
        ...normalizeComparison(source.timepointComparison, target.dataTimepointObserved, source.expectedReferenceTimepoint),
        targetPeriod: text(source.expectedTargetPeriod),
        timeDifference: text(source.timepointComparison && source.timepointComparison.timeDifference),
        pastDataPossible: source.timepointComparison && source.timepointComparison.pastDataPossible === true,
        futureDataPossible: source.timepointComparison && source.timepointComparison.futureDataPossible === true,
        midUpdatePossible: source.timepointComparison && source.timepointComparison.midUpdatePossible === true
      },
      checklist: createChecklist(source.checklist),
      unresolvedIssues: unique(source.unresolvedIssues).filter(text),
      exceptionResolution: {
        abnormalityResolved: source.exceptionResolution && source.exceptionResolution.abnormalityResolved === true,
        interruptionResolved: source.exceptionResolution && source.exceptionResolution.interruptionResolved === true,
        stopResolved: source.exceptionResolution && source.exceptionResolution.stopResolved === true,
        cancellationResolved: source.exceptionResolution && source.exceptionResolution.cancellationResolved === true
      },
      finalConfirmedBy: text(source.finalConfirmedBy), finalConfirmedAt: text(source.finalConfirmedAt),
      finalDecisionReason: text(source.finalDecisionReason),
      createdBy: text(source.createdBy), createdAt, updatedBy: text(source.updatedBy),
      updatedAt: text(source.updatedAt) || createdAt,
      stateHistory: Array.isArray(source.stateHistory) ? clone(source.stateHistory) : [],
      auditHistory: Array.isArray(source.auditHistory) ? clone(source.auditHistory) : [],
      ...clone(SAFE_FLAGS)
    };
  }

  function validatePhase266Target(target) {
    const value = target || {}, reasons = [];
    if (value.executionRecordStatus !== "ready_for_manual_result_preview") reasons.push("phase266_status_not_ready");
    if (!text(value.executionRecordId)) reasons.push("phase266_record_missing");
    if (!text(value.actualOperator)) reasons.push("phase266_operator_missing");
    if (!text(value.actualExecutionDate) || !text(value.actualExecutionStartTime) || !text(value.actualExecutionEndTime)) reasons.push("phase266_execution_time_missing");
    if (!text(value.executionMethodObserved) || !text(value.sourceObserved) || !text(value.sourceTrustObserved)) reasons.push("phase266_source_metadata_missing");
    if (!text(value.targetObserved) || !text(value.dataTimepointObserved)) reasons.push("phase266_target_metadata_missing");
    if (!phase266.validateIntakePreparationChecklist(value).valid) reasons.push("phase266_intake_checklist_incomplete");
    for (const key of ["resultDataStored", "resultDataImported", "resultDataApplied", "resultDataLearned", "resultPreviewReady", "intakeReady"]) {
      if (value[key] !== false) reasons.push(`phase266_${key}_must_be_false`);
    }
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function validateRequest(record) {
    const value = normalizeRecord(record), reasons = [];
    for (const key of ["previewRequestId", "phase266ExecutionRecordId", "requestedBy", "requestDate", "requestTime", "requestReason", "expectedResultFormat", "expectedFileType", "expectedEncoding", "expectedDelimiter", "expectedRecordUnit", "expectedTargetPeriod", "expectedReferenceTimepoint", "expectedSource", "expectedMethod", "expectedSourceTrust", "expectedTarget"]) {
      if (!text(value[key])) reasons.push(`${key}_required`);
    }
    if (value.expectedHeaderPresent === null) reasons.push("expectedHeaderPresent_required");
    if (value.expectedCount < 0) reasons.push("expectedCount_invalid");
    if (!ALLOWED_FORMATS.includes(value.expectedResultFormat)) reasons.push("format_not_allowed");
    if (!ALLOWED_FILE_TYPES.includes(value.expectedFileType)) reasons.push("file_type_not_allowed");
    if (!ALLOWED_ENCODINGS.includes(value.expectedEncoding)) reasons.push("encoding_not_allowed");
    if (!ALLOWED_DELIMITERS.includes(value.expectedDelimiter)) reasons.push("delimiter_not_allowed");
    if (!value.expectedRequiredColumns.length) reasons.push("required_columns_missing");
    if (!value.expectedUniqueIdentifier) reasons.push("unique_identifier_missing");
    if (!value.expectedDateTimeColumn) reasons.push("datetime_column_missing");
    if (!value.expectedTargetIdentifierColumn) reasons.push("target_identifier_missing");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function comparisonReasons(record) {
    const value = normalizeRecord(record), reasons = [];
    const count = value.countComparison;
    if (!COUNT_JUDGMENTS.includes(count.judgment) || !count.confirmedBy || !count.confirmedAt || !count.judgmentReason) reasons.push("count_comparison_incomplete");
    if (count.judgment === "within_human_tolerance" && !count.toleranceCondition) reasons.push("count_tolerance_not_documented");
    if (["needs_review", "mismatch", "not_comparable"].includes(count.judgment)) reasons.push("count_comparison_not_accepted");
    for (const [name, comparison] of [["source", value.sourceComparison], ["method", value.methodComparison], ["trust", value.trustComparison], ["target", value.targetComparison], ["timepoint", value.timepointComparison]]) {
      if (!comparison.confirmedBy || !comparison.confirmedAt || !comparison.decisionReason || comparison.humanResult !== "accepted") reasons.push(`${name}_comparison_not_accepted`);
      if (comparison.matchResult === "different" && (!comparison.difference || !comparison.differenceReason)) reasons.push(`${name}_difference_not_documented`);
    }
    if (value.trustComparison.trustDowngraded && (!value.trustComparison.additionalReviewRequired || !value.trustComparison.intakeAccepted)) reasons.push("trust_downgrade_not_accepted");
    if (!value.targetComparison.targetScope || !value.targetComparison.identificationCondition) reasons.push("target_scope_ambiguous");
    if (value.targetComparison.duplicatePossible || value.targetComparison.missingPossible || value.targetComparison.contaminationPossible) reasons.push("target_risk_unresolved");
    if (value.timepointComparison.pastDataPossible || value.timepointComparison.futureDataPossible || value.timepointComparison.midUpdatePossible) reasons.push("timepoint_risk_unresolved");
    return reasons;
  }

  function checklistReasons(record) {
    return normalizeRecord(record).checklist
      .filter(item => item.required && !["passed", "not_applicable"].includes(item.status))
      .map(item => `check_${item.checkId}_${item.status}`);
  }

  function evaluate(record, target) {
    const value = normalizeRecord(record), reasons = [
      ...validatePhase266Target(target || value.phase266Snapshot).reasons,
      ...validateRequest(value).reasons, ...comparisonReasons(value), ...checklistReasons(value)
    ];
    if (value.unresolvedIssues.length) reasons.push("unresolved_issues_exist");
    const targetRecord = target || value.phase266Snapshot;
    if (targetRecord.abnormalityDetected && !value.exceptionResolution.abnormalityResolved) reasons.push("abnormality_unresolved");
    if (targetRecord.interruptionOccurred && !value.exceptionResolution.interruptionResolved) reasons.push("interruption_unresolved");
    if (targetRecord.stopConditionTriggered && !value.exceptionResolution.stopResolved) reasons.push("stop_unresolved");
    if (targetRecord.cancellationConditionTriggered && !value.exceptionResolution.cancellationResolved) reasons.push("cancellation_unresolved");
    if (!value.finalConfirmedBy || !value.finalConfirmedAt || !value.finalDecisionReason) reasons.push("final_human_decision_missing");
    return deepFreeze({ passed: unique(reasons).length === 0, reasons: unique(reasons) });
  }

  function createPreviewRequest(target, input, operation, options) {
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) {
      return deepFreeze({ created: false, reason: "manual_operation_required" });
    }
    const targetCheck = validatePhase266Target(target);
    if (!targetCheck.valid) return deepFreeze({ created: false, reason: "phase266_target_invalid", reasons: targetCheck.reasons });
    const record = normalizeRecord({
      ...(input || {}), phase266ExecutionRecordId: target.executionRecordId,
      phase266Snapshot: makePhase266Snapshot(target), status: "result_preview_request_recorded",
      createdBy: operation.performedBy, createdAt: nowDate(options).toISOString()
    }, options);
    const requestCheck = validateRequest(record);
    if (!requestCheck.valid) return deepFreeze({ created: false, reason: "preview_request_incomplete", reasons: requestCheck.reasons, record });
    const stateHistory = [{
      changedBy: operation.performedBy, changedAt: nowDate(options).toISOString(),
      from: "awaiting_manual_result_preview_request", to: "result_preview_request_recorded",
      reason: operation.reason
    }];
    return deepFreeze({ created: true, record: normalizeRecord({
      ...record, stateHistory, auditHistory: addAudit(record, "preview_request_created", operation, {}, options)
    }, options) });
  }

  function updateRecord(record, changes, operation, options) {
    const current = normalizeRecord(record, options);
    if (["pre_intake_validation_cancelled", "ready_for_manual_result_preview_creation"].includes(current.status)) return deepFreeze({ updated: false, reason: "terminal_record_immutable", record: current });
    if (!operation || !text(operation.performedBy) || !text(operation.reason)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    const next = normalizeRecord({
      ...current, ...(changes || {}), previewRequestId: current.previewRequestId,
      phase266ExecutionRecordId: current.phase266ExecutionRecordId,
      phase266Snapshot: current.phase266Snapshot, status: current.status,
      createdBy: current.createdBy, createdAt: current.createdAt,
      updatedBy: operation.performedBy, updatedAt: nowDate(options).toISOString(),
      auditHistory: addAudit(current, "record_updated", operation, { fields: Object.keys(changes || {}) }, options)
    }, options);
    return deepFreeze({ updated: true, record: next });
  }

  function updateChecklist(record, checkId, update, operation, options) {
    const current = normalizeRecord(record, options);
    if (!operation || !text(operation.performedBy) || !text(operation.reason)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    if (!CHECK_DEFINITIONS.some(item => item.checkId === checkId) || !CHECK_STATUSES.includes(update && update.status)) return deepFreeze({ updated: false, reason: "invalid_check_update", record: current });
    const checklist = current.checklist.map(item => item.checkId === checkId ? {
      ...item, status: update.status, checkedBy: operation.performedBy,
      checkedAt: nowDate(options).toISOString(), note: text(update.note)
    } : item);
    return updateRecord(current, { checklist }, operation, options);
  }

  function transition(record, nextState, operation, target, options) {
    const current = normalizeRecord(record, options);
    if (!operation || !text(operation.performedBy) || !text(operation.reason) || operation.explicitConfirmation !== true) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    if (!(ALLOWED_TRANSITIONS[current.status] || []).includes(nextState)) return deepFreeze({ transitioned: false, reason: "transition_not_allowed", record: current });
    const evaluation = evaluate(current, target);
    if (nextState === "pre_intake_validation_passed" && !evaluation.passed) return deepFreeze({ transitioned: false, reason: "validation_not_passed", reasons: evaluation.reasons, record: current });
    if (nextState === "ready_for_manual_result_preview_creation" && (!evaluation.passed || current.status !== "pre_intake_validation_passed")) return deepFreeze({ transitioned: false, reason: "ready_conditions_not_met", reasons: evaluation.reasons, record: current });
    const history = [...current.stateHistory, {
      changedBy: operation.performedBy, changedAt: nowDate(options).toISOString(),
      from: current.status, to: nextState, reason: operation.reason
    }];
    const next = normalizeRecord({
      ...current, status: nextState, stateHistory: history,
      updatedBy: operation.performedBy, updatedAt: nowDate(options).toISOString(),
      auditHistory: addAudit(current, "state_changed", operation, { from: current.status, to: nextState }, options)
    }, options);
    return deepFreeze({ transitioned: true, record: next });
  }

  function getSummary(record) {
    const value = normalizeRecord(record), evaluation = evaluate(value);
    return deepFreeze({
      previewRequestId: value.previewRequestId, phase266ExecutionRecordId: value.phase266ExecutionRecordId,
      status: value.status, validationPassed: evaluation.passed, unresolvedReasons: evaluation.reasons,
      auditCount: value.auditHistory.length, stateChangeCount: value.stateHistory.length,
      ...clone(SAFE_FLAGS),
      notice: "Phase26-7では実データを読み込まず、結果プレビューもまだ作成しません"
    });
  }

  function render(documentRef) {
    if (!documentRef) return;
    const list = documentRef.getElementById("phase267-checklist");
    if (list && !list.children.length) CHECK_DEFINITIONS.forEach(definition => {
      const item = documentRef.createElement("div");
      item.className = "phase267-check-item";
      item.textContent = `[unchecked] ${definition.label}`;
      list.appendChild(item);
    });
  }
  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
  }

  return {
    PHASE266_REFERENCE, STATES, CHECK_STATUSES, SAFE_FLAGS, ALLOWED_FORMATS,
    ALLOWED_FILE_TYPES, ALLOWED_ENCODINGS, ALLOWED_DELIMITERS, COUNT_JUDGMENTS,
    MATCH_RESULTS, HUMAN_RESULTS, CHECK_DEFINITIONS, ALLOWED_TRANSITIONS,
    PHASE266_SNAPSHOT_FIELDS, makePhase266Snapshot,
    createChecklist, validatePhase266Target, validateRequest, evaluate,
    createPreviewRequest, updateRecord, updateChecklist, transition, getSummary, render
  };
});
