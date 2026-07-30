(function (root, factory) {
  const phase267 = typeof module === "object" && module.exports
    ? require("./phase26-7-manual-result-preview-pre-intake-validation-core.js")
    : root.HashimotoPhase267ManualResultPreviewPreIntakeValidation;
  const api = factory(phase267);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase268ManualResultDataSelectionPreReadApproval = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase267) {
  "use strict";
  if (!phase267) throw new Error("Phase26-7 definition is required");

  const deepFreeze = value => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
    }
    return value;
  };
  const clone = value => {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    return value;
  };
  const text = value => typeof value === "string" ? value.trim() : "";
  const bool = value => value === true;
  const unique = values => [...new Set(Array.isArray(values) ? values : [])];
  const nowIso = options => new Date(options && typeof options.now === "function" ? options.now() : new Date()).toISOString();

  const PHASE267_REFERENCE = phase267;
  const STATES = deepFreeze([
    "awaiting_manual_result_data_selection", "result_data_candidate_recorded",
    "validating_file_metadata", "awaiting_manual_pre_read_review",
    "pre_read_review_on_hold", "pre_read_review_rejected",
    "pre_read_approval_recorded", "ready_for_manual_result_data_read",
    "selection_cancelled"
  ]);
  const CHECK_STATUSES = deepFreeze(["unchecked", "passed", "failed", "not_applicable", "needs_review"]);
  const APPROVAL_DECISIONS = deepFreeze(["approved", "approved_with_conditions", "on_hold", "rejected", "cancelled"]);
  const COUNT_JUDGMENTS = deepFreeze(["exact_match", "within_declared_tolerance", "needs_review", "mismatch", "not_comparable"]);
  const HUMAN_RESULTS = deepFreeze(["accepted", "rejected", "needs_review"]);
  const SAFE_FLAGS = deepFreeze({
    resultDataRead: false, resultDataParsed: false, resultDataStored: false,
    resultDataImported: false, resultDataApplied: false, resultDataLearned: false,
    resultPreviewCreated: false, resultPreviewReady: false, intakeReady: false,
    autoExecutionEnabled: false, automaticReadEnabled: false, automaticImportEnabled: false,
    externalConnectionEnabled: false, fileContentAccessed: false, fileContentParsed: false,
    fileContentStored: false, fileUploaded: false, fileExternallyTransmitted: false
  });
  const CHECK_DEFINITIONS = deepFreeze([
    ["phase267_ready", "対象がPhase26-7 ready_for_manual_result_preview_creation", "target"],
    ["phase267_final_confirmed", "Phase26-7の最終確認が完了", "target"],
    ["phase267_no_unresolved", "Phase26-7の未解決事項がない", "target"],
    ["selection_id", "選択記録IDが存在", "selection"],
    ["selector", "選択者が記録済み", "selection"],
    ["selection_datetime", "選択日時が記録済み", "selection"],
    ["selection_reason", "選択理由が記録済み", "selection"],
    ["file_name", "ファイル名が記録済み", "metadata"],
    ["extension", "拡張子が記録済み", "metadata"],
    ["mime_type", "MIME typeが記録済み", "metadata"],
    ["file_size", "ファイルサイズが記録済み", "metadata"],
    ["last_modified", "最終更新日時が記録済み", "metadata"],
    ["non_zero", "ファイルサイズが0ではない", "metadata"],
    ["format_compared", "想定形式との比較が完了", "format"],
    ["extension_allowed", "拡張子許可確認が完了", "format"],
    ["mime_checked", "MIME type確認が完了", "format"],
    ["extension_mime_checked", "拡張子とMIME typeの矛盾を確認", "format"],
    ["file_name_checked", "ファイル名確認が完了", "filename"],
    ["naming_rule_checked", "命名規則確認が完了", "filename"],
    ["temporary_name_checked", "一時ファイル可能性を確認", "filename"],
    ["backup_name_checked", "バックアップファイル可能性を確認", "filename"],
    ["modified_checked", "更新日時確認が完了", "timepoint"],
    ["future_time_checked", "将来日時可能性を確認", "timepoint"],
    ["stale_time_checked", "古いファイル可能性を確認", "timepoint"],
    ["source_checked", "取得元確認が完了", "provenance"],
    ["creator_checked", "作成元確認が完了", "provenance"],
    ["original_copy_recorded", "原本・複製区分を記録", "provenance"],
    ["edited_recorded", "編集有無を記録", "provenance"],
    ["processing_recorded", "中間加工有無を記録", "provenance"],
    ["target_checked", "対象整合性確認が完了", "target"],
    ["target_period_checked", "対象期間確認が完了", "target"],
    ["count_checked", "件数見込み確認が完了", "count"],
    ["count_reason", "件数差の理由が記録済み", "count"],
    ["duplicate_checked", "重複候補確認が完了", "duplicate"],
    ["reader_recorded", "読込実行予定者が記録済み", "operator"],
    ["read_datetime", "読込予定日時が記録済み", "operator"],
    ["terminal_recorded", "使用端末が記録済み", "operator"],
    ["operation_steps", "操作手順確認が完了", "operator"],
    ["interruption_steps", "中断手順確認が完了", "operator"],
    ["cancellation_steps", "取消手順確認が完了", "operator"],
    ["emergency_stop_steps", "異常時停止手順確認が完了", "operator"],
    ["no_content_read", "ファイル内容を読み込んでいない", "safety"],
    ["no_content_parsed", "ファイル内容を解析していない", "safety"],
    ["no_content_stored", "ファイル内容を保存していない", "safety"],
    ["no_upload", "ファイルをアップロードしていない", "safety"],
    ["no_external_send", "外部送信していない", "safety"],
    ["no_import", "データをインポートしていない", "safety"],
    ["no_apply", "データを適用していない", "safety"],
    ["no_learning", "学習更新していない", "safety"],
    ["no_automation", "自動処理を実行していない", "safety"],
    ["approver_recorded", "承認者が記録済み", "approval"],
    ["approval_datetime", "承認日時が記録済み", "approval"],
    ["approval_reason", "承認理由が記録済み", "approval"],
    ["approved_metadata_fixed", "承認対象メタデータが固定記録済み", "approval"]
  ].map(([checkId, label, category]) => ({ checkId, label, category, required: true })));
  const ALLOWED_TRANSITIONS = deepFreeze({
    awaiting_manual_result_data_selection: ["result_data_candidate_recorded", "selection_cancelled"],
    result_data_candidate_recorded: ["validating_file_metadata", "selection_cancelled"],
    validating_file_metadata: ["awaiting_manual_pre_read_review", "selection_cancelled"],
    awaiting_manual_pre_read_review: ["pre_read_review_on_hold", "pre_read_review_rejected", "pre_read_approval_recorded", "selection_cancelled"],
    pre_read_review_on_hold: ["validating_file_metadata", "selection_cancelled"],
    pre_read_review_rejected: ["result_data_candidate_recorded", "selection_cancelled"],
    pre_read_approval_recorded: ["ready_for_manual_result_data_read", "selection_cancelled"],
    ready_for_manual_result_data_read: [],
    selection_cancelled: []
  });
  const PHASE267_SNAPSHOT_FIELDS = deepFreeze([
    "previewRequestId", "phase266ExecutionRecordId", "status", "expectedResultFormat",
    "expectedFileType", "expectedEncoding", "expectedDelimiter", "expectedHeaderPresent",
    "expectedRecordUnit", "expectedTargetPeriod", "expectedReferenceTimepoint",
    "expectedSource", "expectedMethod", "expectedSourceTrust", "expectedTarget",
    "expectedCount", "finalConfirmedBy", "finalConfirmedAt", "finalDecisionReason",
    "resultDataRead", "resultDataParsed", "resultDataStored", "resultDataImported",
    "resultDataApplied", "resultDataLearned", "resultPreviewCreated", "resultPreviewReady", "intakeReady"
  ]);

  function makePhase267Snapshot(target) {
    const source = target || {}, snapshot = {};
    PHASE267_SNAPSHOT_FIELDS.forEach(key => {
      if (typeof source[key] === "boolean" || typeof source[key] === "number") snapshot[key] = source[key];
      else snapshot[key] = text(source[key]);
    });
    snapshot.checklist = phase267.CHECK_DEFINITIONS.map(definition => {
      const item = (source.checklist || []).find(entry => entry && entry.checkId === definition.checkId) || {};
      return { checkId: definition.checkId, required: definition.required, status: text(item.status) };
    });
    const p266 = source.phase266Snapshot || {};
    snapshot.phase266Counts = {
      expectedRecordCount: Number.isInteger(p266.expectedRecordCount) ? p266.expectedRecordCount : null,
      observedRecordCount: Number.isInteger(p266.observedRecordCount) ? p266.observedRecordCount : null
    };
    snapshot.unresolvedIssues = unique(source.unresolvedIssues).filter(text);
    return deepFreeze(snapshot);
  }

  function metadataFromFile(file) {
    if (!file || typeof file !== "object") return deepFreeze({});
    const name = text(file.name);
    const dot = name.lastIndexOf(".");
    return deepFreeze({
      fileName: name, fileDisplayName: name,
      extension: dot > -1 ? name.slice(dot + 1).toLowerCase() : "",
      mimeType: text(file.type),
      fileSize: Number.isFinite(file.size) && file.size >= 0 ? file.size : null,
      lastModifiedAt: Number.isFinite(file.lastModified) ? new Date(file.lastModified).toISOString() : ""
    });
  }

  function createChecklist(items) {
    const supplied = new Map((Array.isArray(items) ? items : []).map(item => [item && item.checkId, item]));
    return CHECK_DEFINITIONS.map(definition => {
      const item = supplied.get(definition.checkId) || {};
      return { ...definition, status: CHECK_STATUSES.includes(item.status) ? item.status : "unchecked", checkedBy: text(item.checkedBy), checkedAt: text(item.checkedAt), note: text(item.note) };
    });
  }
  function manualOperation(operation, explicit) {
    return Boolean(operation && text(operation.performedBy) && text(operation.reason) && (!explicit || operation.explicitConfirmation === true));
  }
  function addAudit(record, action, operation, details, options) {
    return [...(record.auditHistory || []), {
      auditId: `phase26-8-audit-${(record.auditHistory || []).length + 1}`, action,
      actor: text(operation && operation.performedBy), occurredAt: nowIso(options),
      reason: text(operation && operation.reason), details: clone(details || {})
    }];
  }
  function normalizeReview(source) {
    const value = source || {};
    return {
      completed: bool(value.completed), humanResult: HUMAN_RESULTS.includes(value.humanResult) ? value.humanResult : "needs_review",
      confirmedBy: text(value.confirmedBy), confirmedAt: text(value.confirmedAt), decisionReason: text(value.decisionReason),
      difference: text(value.difference), differenceReason: text(value.differenceReason)
    };
  }
  function normalizeRecord(input, options) {
    const source = input || {}, snapshot = source.phase267Snapshot || {};
    const approval = source.approval || {};
    const fileSize = Number.isFinite(source.fileSize) && source.fileSize >= 0 ? source.fileSize : null;
    const metadataExists = Boolean(text(source.fileName) && text(source.extension) && fileSize !== null && text(source.lastModifiedAt));
    return {
      selectionRecordId: text(source.selectionRecordId), phase267PreviewRequestId: text(source.phase267PreviewRequestId || snapshot.previewRequestId),
      phase267Snapshot: makePhase267Snapshot(snapshot), status: STATES.includes(source.status) ? source.status : "awaiting_manual_result_data_selection",
      selectedBy: text(source.selectedBy), selectionDate: text(source.selectionDate), selectionTime: text(source.selectionTime),
      selectionReason: text(source.selectionReason), fileDisplayName: text(source.fileDisplayName), fileName: text(source.fileName),
      extension: text(source.extension).toLowerCase(), mimeType: text(source.mimeType), fileSize, lastModifiedAt: text(source.lastModifiedAt),
      expectedDataFormat: text(source.expectedDataFormat), expectedEncoding: text(source.expectedEncoding),
      expectedDelimiter: text(source.expectedDelimiter), expectedHeaderPresent: typeof source.expectedHeaderPresent === "boolean" ? source.expectedHeaderPresent : null,
      expectedRecordUnit: text(source.expectedRecordUnit), expectedTarget: text(source.expectedTarget),
      expectedTargetPeriod: text(source.expectedTargetPeriod), expectedReferenceTimepoint: text(source.expectedReferenceTimepoint),
      expectedSource: text(source.expectedSource), expectedMethod: text(source.expectedMethod), expectedSourceTrust: text(source.expectedSourceTrust),
      declaredCount: Number.isInteger(source.declaredCount) && source.declaredCount >= 0 ? source.declaredCount : null,
      storageLocationDescription: text(source.storageLocationDescription), originalOrCopy: text(source.originalOrCopy),
      editStatus: text(source.editStatus), creatorDescription: text(source.creatorDescription), note: text(source.note),
      formatReview: { ...normalizeReview(source.formatReview), extensionAllowed: bool(source.formatReview && source.formatReview.extensionAllowed), mimeConsistent: bool(source.formatReview && source.formatReview.mimeConsistent), extensionMimeMismatch: bool(source.formatReview && source.formatReview.extensionMimeMismatch) },
      sizeReview: { ...normalizeReview(source.sizeReview), minimum: Number.isFinite(source.sizeReview && source.sizeReview.minimum) ? source.sizeReview.minimum : null, maximum: Number.isFinite(source.sizeReview && source.sizeReview.maximum) ? source.sizeReview.maximum : null, toleranceCondition: text(source.sizeReview && source.sizeReview.toleranceCondition), sizeJudgment: text(source.sizeReview && source.sizeReview.sizeJudgment), zeroByte: fileSize === 0, unusuallySmallPossible: bool(source.sizeReview && source.sizeReview.unusuallySmallPossible), unusuallyLargePossible: bool(source.sizeReview && source.sizeReview.unusuallyLargePossible) },
      fileNameReview: { ...normalizeReview(source.fileNameReview), expectedNamingRule: text(source.fileNameReview && source.fileNameReview.expectedNamingRule), namingRuleMatch: text(source.fileNameReview && source.fileNameReview.namingRuleMatch), targetIdentifierPresent: bool(source.fileNameReview && source.fileNameReview.targetIdentifierPresent), dateOrTimepointPresent: bool(source.fileNameReview && source.fileNameReview.dateOrTimepointPresent), versionPresent: bool(source.fileNameReview && source.fileNameReview.versionPresent), temporaryPossible: bool(source.fileNameReview && source.fileNameReview.temporaryPossible), backupPossible: bool(source.fileNameReview && source.fileNameReview.backupPossible), duplicateNamePossible: bool(source.fileNameReview && source.fileNameReview.duplicateNamePossible), suspiciousCharacters: bool(source.fileNameReview && source.fileNameReview.suspiciousCharacters) },
      modifiedTimeReview: { ...normalizeReview(source.modifiedTimeReview), consistency: text(source.modifiedTimeReview && source.modifiedTimeReview.consistency), stalePossible: bool(source.modifiedTimeReview && source.modifiedTimeReview.stalePossible), futurePossible: bool(source.modifiedTimeReview && source.modifiedTimeReview.futurePossible), midUpdatePossible: bool(source.modifiedTimeReview && source.modifiedTimeReview.midUpdatePossible), timezoneConfirmed: bool(source.modifiedTimeReview && source.modifiedTimeReview.timezoneConfirmed) },
      provenanceReview: { ...normalizeReview(source.provenanceReview), acquisitionRoute: text(source.provenanceReview && source.provenanceReview.acquisitionRoute), intermediateProcessing: bool(source.provenanceReview && source.provenanceReview.intermediateProcessing), intermediateProcessor: text(source.provenanceReview && source.provenanceReview.intermediateProcessor), intermediateProcessedAt: text(source.provenanceReview && source.provenanceReview.intermediateProcessedAt), alterationPossible: bool(source.provenanceReview && source.provenanceReview.alterationPossible) },
      targetReview: { ...normalizeReview(source.targetReview), targetScope: text(source.targetReview && source.targetReview.targetScope), targetPeriod: text(source.targetReview && source.targetReview.targetPeriod), identificationCondition: text(source.targetReview && source.targetReview.identificationCondition), exclusions: text(source.targetReview && source.targetReview.exclusions), contaminationPossible: bool(source.targetReview && source.targetReview.contaminationPossible), missingPossible: bool(source.targetReview && source.targetReview.missingPossible), duplicatePossible: bool(source.targetReview && source.targetReview.duplicatePossible) },
      countReview: { ...normalizeReview(source.countReview), judgment: COUNT_JUDGMENTS.includes(source.countReview && source.countReview.judgment) ? source.countReview.judgment : "not_comparable", difference: Number.isFinite(source.countReview && source.countReview.difference) ? source.countReview.difference : null, toleranceCondition: text(source.countReview && source.countReview.toleranceCondition), mismatchReason: text(source.countReview && source.countReview.mismatchReason), notComparableReason: text(source.countReview && source.countReview.notComparableReason) },
      duplicateReview: { detected: bool(source.duplicateReview && source.duplicateReview.detected), comparedRecordId: text(source.duplicateReview && source.duplicateReview.comparedRecordId), matchedFields: unique(source.duplicateReview && source.duplicateReview.matchedFields).filter(text), differentFields: unique(source.duplicateReview && source.duplicateReview.differentFields).filter(text), humanContinue: source.duplicateReview && typeof source.duplicateReview.humanContinue === "boolean" ? source.duplicateReview.humanContinue : null, continuationReason: text(source.duplicateReview && source.duplicateReview.continuationReason), confirmedBy: text(source.duplicateReview && source.duplicateReview.confirmedBy), confirmedAt: text(source.duplicateReview && source.duplicateReview.confirmedAt) },
      plannedReader: { name: text(source.plannedReader && source.plannedReader.name), role: text(source.plannedReader && source.plannedReader.role), plannedDate: text(source.plannedReader && source.plannedReader.plannedDate), plannedTime: text(source.plannedReader && source.plannedReader.plannedTime), terminal: text(source.plannedReader && source.plannedReader.terminal), screen: text(source.plannedReader && source.plannedReader.screen), operationStepsConfirmed: bool(source.plannedReader && source.plannedReader.operationStepsConfirmed), interruptionStepsConfirmed: bool(source.plannedReader && source.plannedReader.interruptionStepsConfirmed), cancellationStepsConfirmed: bool(source.plannedReader && source.plannedReader.cancellationStepsConfirmed), emergencyStopStepsConfirmed: bool(source.plannedReader && source.plannedReader.emergencyStopStepsConfirmed), note: text(source.plannedReader && source.plannedReader.note) },
      approval: { approvalRecordId: text(approval.approvalRecordId), approvedBy: text(approval.approvedBy), approvalDate: text(approval.approvalDate), approvalTime: text(approval.approvalTime), decision: APPROVAL_DECISIONS.includes(approval.decision) ? approval.decision : "", reason: text(approval.reason), conditions: text(approval.conditions), expiresAt: text(approval.expiresAt), approvedFileName: text(approval.approvedFileName), approvedFileSize: Number.isFinite(approval.approvedFileSize) ? approval.approvedFileSize : null, approvedLastModifiedAt: text(approval.approvedLastModifiedAt), approvedPhase267RecordId: text(approval.approvedPhase267RecordId), approvedSelectionRecordId: text(approval.approvedSelectionRecordId), recheckRequired: bool(approval.recheckRequired), selectorApproverSamePerson: typeof approval.selectorApproverSamePerson === "boolean" ? approval.selectorApproverSamePerson : null, note: text(approval.note) },
      checklist: createChecklist(source.checklist), unresolvedIssues: unique(source.unresolvedIssues).filter(text),
      exceptionResolution: { abnormalityResolved: bool(source.exceptionResolution && source.exceptionResolution.abnormalityResolved), interruptionResolved: bool(source.exceptionResolution && source.exceptionResolution.interruptionResolved), stopResolved: bool(source.exceptionResolution && source.exceptionResolution.stopResolved), cancellationResolved: bool(source.exceptionResolution && source.exceptionResolution.cancellationResolved) },
      createdBy: text(source.createdBy), createdAt: text(source.createdAt) || nowIso(options), updatedBy: text(source.updatedBy), updatedAt: text(source.updatedAt) || text(source.createdAt) || nowIso(options),
      stateHistory: Array.isArray(source.stateHistory) ? clone(source.stateHistory) : [], auditHistory: Array.isArray(source.auditHistory) ? clone(source.auditHistory) : [],
      resultDataCandidateSelected: metadataExists, fileMetadataRecorded: metadataExists, ...clone(SAFE_FLAGS)
    };
  }

  function validatePhase267Target(target) {
    const value = target || {}, reasons = [];
    if (value.status !== "ready_for_manual_result_preview_creation") reasons.push("phase267_status_not_ready");
    if (!text(value.previewRequestId)) reasons.push("phase267_preview_request_missing");
    if (!text(value.finalConfirmedBy) || !text(value.finalDecisionReason)) reasons.push("phase267_final_confirmation_missing");
    if ((value.unresolvedIssues || []).length) reasons.push("phase267_unresolved_issues");
    const required = phase267.CHECK_DEFINITIONS.filter(item => item.required);
    if (required.some(def => !["passed", "not_applicable"].includes(((value.checklist || []).find(item => item && item.checkId === def.checkId) || {}).status))) reasons.push("phase267_checklist_incomplete");
    for (const key of ["resultDataRead", "resultDataParsed", "resultDataStored", "resultDataImported", "resultDataApplied", "resultDataLearned", "resultPreviewCreated", "resultPreviewReady", "intakeReady"]) {
      if (value[key] !== false) reasons.push(`phase267_${key}_must_be_false`);
    }
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }

  function candidateReasons(record) {
    const value = normalizeRecord(record), reasons = [];
    for (const key of ["selectionRecordId", "phase267PreviewRequestId", "selectedBy", "selectionDate", "selectionTime", "selectionReason", "fileDisplayName", "fileName", "extension", "mimeType", "lastModifiedAt", "expectedDataFormat", "expectedEncoding", "expectedDelimiter", "expectedRecordUnit", "expectedTarget", "expectedTargetPeriod", "expectedReferenceTimepoint", "expectedSource", "expectedMethod", "expectedSourceTrust", "storageLocationDescription", "originalOrCopy", "editStatus", "creatorDescription"]) if (!text(value[key])) reasons.push(`${key}_required`);
    if (value.fileSize === null) reasons.push("fileSize_required");
    if (value.fileSize === 0) reasons.push("zero_byte_file");
    if (value.expectedHeaderPresent === null) reasons.push("expectedHeaderPresent_required");
    if (value.declaredCount === null) reasons.push("declaredCount_required");
    return reasons;
  }
  function reviewReasons(record) {
    const value = normalizeRecord(record), reasons = [];
    for (const [name, review] of [["format", value.formatReview], ["size", value.sizeReview], ["file_name", value.fileNameReview], ["modified_time", value.modifiedTimeReview], ["provenance", value.provenanceReview], ["target", value.targetReview], ["count", value.countReview]]) {
      if (!review.completed || review.humanResult !== "accepted" || !review.confirmedBy || !review.confirmedAt || !review.decisionReason) reasons.push(`${name}_review_incomplete`);
    }
    if (!value.formatReview.extensionAllowed || !value.formatReview.mimeConsistent || value.formatReview.extensionMimeMismatch) reasons.push("format_metadata_not_accepted");
    if (value.sizeReview.minimum === null || value.sizeReview.maximum === null || !value.sizeReview.toleranceCondition || value.sizeReview.zeroByte) reasons.push("size_review_not_accepted");
    if (value.modifiedTimeReview.futurePossible || value.modifiedTimeReview.midUpdatePossible || !value.modifiedTimeReview.timezoneConfirmed) reasons.push("modified_time_risk_unresolved");
    if ((value.editStatus !== "unedited" || value.provenanceReview.alterationPossible) && value.provenanceReview.humanResult !== "accepted") reasons.push("provenance_risk_unresolved");
    if (value.targetReview.contaminationPossible || value.targetReview.missingPossible || value.targetReview.duplicatePossible) reasons.push("target_risk_unresolved");
    if (["needs_review", "mismatch", "not_comparable"].includes(value.countReview.judgment)) reasons.push("count_not_accepted");
    if (value.countReview.judgment === "within_declared_tolerance" && !value.countReview.toleranceCondition) reasons.push("count_tolerance_missing");
    const duplicate = value.duplicateReview;
    if (!duplicate.confirmedBy || !duplicate.confirmedAt || duplicate.humanContinue === null) reasons.push("duplicate_review_incomplete");
    if (duplicate.detected && (!duplicate.comparedRecordId || !duplicate.matchedFields.length || duplicate.humanContinue !== true || !duplicate.continuationReason)) reasons.push("duplicate_candidate_unresolved");
    const reader = value.plannedReader;
    if (!reader.name || !reader.role || !reader.plannedDate || !reader.plannedTime || !reader.terminal || !reader.screen) reasons.push("planned_reader_incomplete");
    if (!reader.operationStepsConfirmed || !reader.interruptionStepsConfirmed || !reader.cancellationStepsConfirmed || !reader.emergencyStopStepsConfirmed) reasons.push("planned_reader_procedures_incomplete");
    return reasons;
  }
  function approvalReasons(record) {
    const value = normalizeRecord(record), approval = value.approval, reasons = [];
    if (!approval.approvalRecordId || !approval.approvedBy || !approval.approvalDate || !approval.approvalTime || !approval.reason) reasons.push("approval_record_incomplete");
    if (!["approved", "approved_with_conditions"].includes(approval.decision)) reasons.push("approval_not_granted");
    if (approval.decision === "approved_with_conditions" && !approval.conditions) reasons.push("approval_conditions_missing");
    if (approval.selectorApproverSamePerson === null) reasons.push("selector_approver_relationship_missing");
    if (approval.approvedFileName !== value.fileName || approval.approvedFileSize !== value.fileSize || approval.approvedLastModifiedAt !== value.lastModifiedAt || approval.approvedPhase267RecordId !== value.phase267PreviewRequestId || approval.approvedSelectionRecordId !== value.selectionRecordId) reasons.push("approved_metadata_changed");
    if (approval.recheckRequired) reasons.push("approval_recheck_required");
    return reasons;
  }
  function checklistReasons(record) {
    return normalizeRecord(record).checklist.filter(item => item.required && !["passed", "not_applicable"].includes(item.status)).map(item => `check_${item.checkId}_${item.status}`);
  }
  function evaluate(record, target) {
    const value = normalizeRecord(record), reasons = [
      ...validatePhase267Target(target || value.phase267Snapshot).reasons,
      ...candidateReasons(value), ...reviewReasons(value), ...approvalReasons(value), ...checklistReasons(value)
    ];
    if (value.unresolvedIssues.length) reasons.push("unresolved_issues_exist");
    for (const [key, resolved] of Object.entries(value.exceptionResolution)) if (!resolved) reasons.push(`${key}_unresolved`);
    return deepFreeze({ passed: unique(reasons).length === 0, reasons: unique(reasons) });
  }

  function createSelectionCandidate(target, input, operation, options) {
    if (!manualOperation(operation, true)) return deepFreeze({ created: false, reason: "manual_operation_required" });
    const targetCheck = validatePhase267Target(target);
    if (!targetCheck.valid) return deepFreeze({ created: false, reason: "phase267_target_invalid", reasons: targetCheck.reasons });
    const record = normalizeRecord({ ...(input || {}), phase267PreviewRequestId: target.previewRequestId, phase267Snapshot: makePhase267Snapshot(target), status: "result_data_candidate_recorded", createdBy: operation.performedBy, createdAt: nowIso(options) }, options);
    const reasons = candidateReasons(record);
    if (reasons.length) return deepFreeze({ created: false, reason: "selection_candidate_incomplete", reasons, record });
    const stateHistory = [{ changedBy: operation.performedBy, changedAt: nowIso(options), from: "awaiting_manual_result_data_selection", to: "result_data_candidate_recorded", reason: operation.reason }];
    return deepFreeze({ created: true, record: normalizeRecord({ ...record, stateHistory, auditHistory: addAudit(record, "selection_candidate_created", operation, { fileMetadataOnly: true }, options) }, options) });
  }
  function updateRecord(record, changes, operation, options) {
    const current = normalizeRecord(record, options);
    if (["selection_cancelled", "ready_for_manual_result_data_read"].includes(current.status)) return deepFreeze({ updated: false, reason: "terminal_record_immutable", record: current });
    if (!manualOperation(operation, false)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    const protectedFields = ["selectionRecordId", "phase267PreviewRequestId", "phase267Snapshot", "status", "createdBy", "createdAt", "stateHistory", "auditHistory"];
    const permitted = Object.fromEntries(Object.entries(changes || {}).filter(([key]) => !protectedFields.includes(key) && !(key in SAFE_FLAGS) && !["resultDataCandidateSelected", "fileMetadataRecorded"].includes(key)));
    let approval = permitted.approval === undefined ? current.approval : permitted.approval;
    const metadataChanged = ["fileName", "fileSize", "lastModifiedAt"].some(key => Object.prototype.hasOwnProperty.call(permitted, key) && permitted[key] !== current[key]);
    if (metadataChanged && current.approval.approvalRecordId) approval = { ...current.approval, ...approval, recheckRequired: true };
    const next = normalizeRecord({ ...current, ...permitted, approval, status: current.status, updatedBy: operation.performedBy, updatedAt: nowIso(options), auditHistory: addAudit(current, metadataChanged ? "metadata_changed_approval_invalidated" : "record_updated", operation, { fields: Object.keys(permitted) }, options) }, options);
    return deepFreeze({ updated: true, approvalInvalidated: metadataChanged && Boolean(current.approval.approvalRecordId), record: next });
  }
  function updateChecklist(record, checkId, update, operation, options) {
    const current = normalizeRecord(record, options);
    if (!manualOperation(operation, false)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    if (!CHECK_DEFINITIONS.some(item => item.checkId === checkId) || !CHECK_STATUSES.includes(update && update.status)) return deepFreeze({ updated: false, reason: "invalid_check_update", record: current });
    const checklist = current.checklist.map(item => item.checkId === checkId ? { ...item, status: update.status, checkedBy: operation.performedBy, checkedAt: nowIso(options), note: text(update.note) } : item);
    return updateRecord(current, { checklist }, operation, options);
  }
  function findDuplicateCandidate(record, existingRecords) {
    const current = normalizeRecord(record);
    const match = (Array.isArray(existingRecords) ? existingRecords : []).map(normalizeRecord).find(item => item.phase267PreviewRequestId === current.phase267PreviewRequestId && item.selectionRecordId !== current.selectionRecordId && item.fileName === current.fileName && item.fileSize === current.fileSize && item.lastModifiedAt === current.lastModifiedAt);
    return deepFreeze({ detected: Boolean(match), comparedRecordId: match ? match.selectionRecordId : "", matchedFields: match ? ["fileName", "fileSize", "lastModifiedAt"] : [] });
  }
  function transition(record, nextState, operation, target, options) {
    const current = normalizeRecord(record, options);
    if (!manualOperation(operation, true)) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    if (!(ALLOWED_TRANSITIONS[current.status] || []).includes(nextState)) return deepFreeze({ transitioned: false, reason: "transition_not_allowed", record: current });
    if (nextState === "pre_read_approval_recorded" && approvalReasons(current).some(reason => ["approval_record_incomplete", "approval_not_granted", "approval_conditions_missing", "selector_approver_relationship_missing"].includes(reason))) return deepFreeze({ transitioned: false, reason: "approval_not_complete", reasons: approvalReasons(current), record: current });
    const evaluation = evaluate(current, target);
    if (nextState === "ready_for_manual_result_data_read" && !evaluation.passed) return deepFreeze({ transitioned: false, reason: "ready_conditions_not_met", reasons: evaluation.reasons, record: current });
    const stateHistory = [...current.stateHistory, { changedBy: operation.performedBy, changedAt: nowIso(options), from: current.status, to: nextState, reason: operation.reason }];
    const action = nextState === "selection_cancelled" ? "selection_cancelled" : "state_changed";
    return deepFreeze({ transitioned: true, record: normalizeRecord({ ...current, status: nextState, stateHistory, updatedBy: operation.performedBy, updatedAt: nowIso(options), auditHistory: addAudit(current, action, operation, { from: current.status, to: nextState }, options) }, options) });
  }
  function render(documentRef) {
    if (!documentRef) return;
    const list = documentRef.getElementById("phase268-checklist");
    if (list && !list.children.length) CHECK_DEFINITIONS.forEach(definition => {
      const item = documentRef.createElement("div");
      item.className = "phase268-check-item";
      item.textContent = `[unchecked] ${definition.label}`;
      list.appendChild(item);
    });
    const input = documentRef.getElementById("phase268-file-input");
    if (input) input.addEventListener("change", event => {
      const file = event.target.files && event.target.files[0];
      const metadata = metadataFromFile(file);
      for (const [key, value] of Object.entries(metadata)) {
        const output = documentRef.querySelector(`[data-phase268-file-metadata="${key}"]`);
        if (output) output.textContent = String(value);
      }
    });
  }
  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
  }
  return {
    PHASE267_REFERENCE, STATES, CHECK_STATUSES, APPROVAL_DECISIONS, COUNT_JUDGMENTS,
    HUMAN_RESULTS, SAFE_FLAGS, CHECK_DEFINITIONS, ALLOWED_TRANSITIONS, PHASE267_SNAPSHOT_FIELDS,
    makePhase267Snapshot, metadataFromFile, createChecklist, validatePhase267Target,
    normalizeRecord, evaluate, createSelectionCandidate, updateRecord, updateChecklist,
    findDuplicateCandidate, transition, render
  };
});
