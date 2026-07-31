(function (root, factory) {
  const phase268 = typeof module === "object" && module.exports
    ? require("./phase26-8-manual-result-data-selection-pre-read-approval-core.js")
    : root.HashimotoPhase268ManualResultDataSelectionPreReadApproval;
  const api = factory(phase268);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase269ManualResultDataReadTemporaryHolding = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase268) {
  "use strict";
  if (!phase268) throw new Error("Phase26-8 definition is required");

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
  const cleanText = value => typeof value === "string" ? value.trim() : "";
  const bool = value => value === true;
  const unique = values => [...new Set(Array.isArray(values) ? values : [])];
  const nowIso = options => new Date(options && typeof options.now === "function" ? options.now() : new Date()).toISOString();
  const elapsed = (start, end) => Math.max(0, Date.parse(end) - Date.parse(start));

  const PHASE268_REFERENCE = phase268;
  const DEFAULT_MAXIMUM_READ_SIZE = 10 * 1024 * 1024;
  const READ_METHOD = "File.text";
  const STATES = deepFreeze([
    "awaiting_manual_result_data_read", "validating_approved_file_metadata",
    "ready_for_manual_read_execution", "manual_read_in_progress",
    "manual_read_succeeded", "manual_read_failed", "manual_read_interrupted",
    "manual_read_cancelled", "temporary_data_held", "temporary_data_discarded",
    "ready_for_manual_result_data_parse_preview"
  ]);
  const TEMPORARY_DATA_STATUSES = deepFreeze(["none", "holding", "held", "discarded", "invalidated"]);
  const CHECK_STATUSES = deepFreeze(["unchecked", "passed", "failed", "not_applicable", "needs_review"]);
  const ALWAYS_FALSE_FLAGS = deepFreeze({
    resultDataParsed: false, resultDataStored: false, resultDataImported: false,
    resultDataApplied: false, resultDataLearned: false, resultPreviewCreated: false,
    resultPreviewReady: false, intakeReady: false, autoExecutionEnabled: false,
    automaticReadEnabled: false, automaticImportEnabled: false, externalConnectionEnabled: false,
    fileContentParsed: false, fileContentStored: false, fileUploaded: false,
    fileExternallyTransmitted: false, permanentStorageCompleted: false,
    formalImportCompleted: false, applicationCompleted: false, learningCompleted: false
  });
  const CHECK_DEFINITIONS = deepFreeze([
    ["phase268_ready", "対象がPhase26-8 ready_for_manual_result_data_read", "target"],
    ["selection_exists", "Phase26-8選択記録が存在", "target"],
    ["approval_exists", "Phase26-8承認記録が存在", "target"],
    ["approval_valid", "承認判断が有効", "target"],
    ["conditions_confirmed", "条件付き承認条件を確認済み", "target"],
    ["reader_recorded", "読込実行者が記録済み", "execution"],
    ["read_datetime_recorded", "読込実行日時が記録済み", "execution"],
    ["terminal_recorded", "使用端末が記録済み", "execution"],
    ["file_manually_selected", "対象ファイルを人間が選択", "metadata"],
    ["file_name_match", "ファイル名が承認対象と一致", "metadata"],
    ["file_size_match", "ファイルサイズが承認対象と一致", "metadata"],
    ["last_modified_match", "最終更新日時が承認対象と一致", "metadata"],
    ["mime_compared", "MIME type比較が完了", "metadata"],
    ["extension_compared", "拡張子比較が完了", "metadata"],
    ["non_zero_file", "ファイルサイズが0ではない", "size"],
    ["within_maximum_size", "最大読込サイズ以内", "size"],
    ["manual_start", "読込開始が人間の明示操作", "execution"],
    ["read_method_recorded", "読込方式が記録済み", "execution"],
    ["read_started_at", "読込開始日時が記録済み", "execution"],
    ["read_completed_at", "読込終了日時が記録済み", "execution"],
    ["read_duration", "読込時間が記録済み", "execution"],
    ["read_outcome", "読込成功または失敗が記録済み", "execution"],
    ["byte_length", "読込バイト長が記録済み", "result"],
    ["character_length", "読込文字数が記録済み", "result"],
    ["non_empty_result", "読込結果が空ではない", "result"],
    ["temporary_id", "一時保持データIDが存在", "temporary"],
    ["temporary_held", "一時保持状態がheld", "temporary"],
    ["source_unchanged", "元ファイルを変更していない", "safety"],
    ["source_not_saved", "元ファイルを保存していない", "safety"],
    ["no_external_send", "ファイル内容を外部送信していない", "safety"],
    ["no_local_storage", "ファイル内容をlocalStorageへ保存していない", "safety"],
    ["no_indexed_db", "ファイル内容をIndexedDBへ保存していない", "safety"],
    ["no_file_system_save", "ファイル内容をファイルシステムへ保存していない", "safety"],
    ["no_csv_parse", "CSV解析を行っていない", "safety"],
    ["no_json_parse", "JSON解析を行っていない", "safety"],
    ["no_excel_parse", "Excel解析を行っていない", "safety"],
    ["no_pdf_parse", "PDF解析を行っていない", "safety"],
    ["no_row_split", "行分割を行っていない", "safety"],
    ["no_column_split", "列分割を行っていない", "safety"],
    ["no_header_detection", "ヘッダー判定を行っていない", "safety"],
    ["no_delimiter_detection", "区切り文字判定を行っていない", "safety"],
    ["no_encoding_detection", "文字コード自動判定を行っていない", "safety"],
    ["no_formal_storage", "正式保存を行っていない", "safety"],
    ["no_formal_import", "正式インポートを行っていない", "safety"],
    ["no_application", "データ適用を行っていない", "safety"],
    ["no_learning", "学習更新を行っていない", "safety"],
    ["no_auto_retry", "自動再試行を行っていない", "safety"],
    ["no_auto_transition", "自動状態遷移を行っていない", "safety"],
    ["human_result_review", "読込結果を人間が確認済み", "handoff"],
    ["handoff_decision", "次工程引渡し判断が記録済み", "handoff"],
    ["no_unresolved_failure", "未解決の失敗がない", "exceptions"],
    ["no_unresolved_interruption", "未解決の中断がない", "exceptions"],
    ["no_unresolved_cancellation", "未解決の取消がない", "exceptions"],
    ["temporary_not_discarded", "一時保持データが破棄されていない", "temporary"]
  ].map(([checkId, label, category]) => ({ checkId, label, category, required: true })));
  const ALLOWED_TRANSITIONS = deepFreeze({
    awaiting_manual_result_data_read: ["validating_approved_file_metadata", "manual_read_cancelled"],
    validating_approved_file_metadata: ["ready_for_manual_read_execution", "manual_read_cancelled"],
    ready_for_manual_read_execution: ["manual_read_in_progress", "manual_read_cancelled"],
    manual_read_in_progress: ["manual_read_succeeded", "manual_read_failed", "manual_read_interrupted", "manual_read_cancelled"],
    manual_read_succeeded: ["temporary_data_held", "temporary_data_discarded", "manual_read_cancelled"],
    manual_read_failed: ["ready_for_manual_read_execution", "manual_read_cancelled"],
    manual_read_interrupted: ["ready_for_manual_read_execution", "manual_read_cancelled"],
    manual_read_cancelled: [],
    temporary_data_held: ["ready_for_manual_result_data_parse_preview", "temporary_data_discarded"],
    temporary_data_discarded: [],
    ready_for_manual_result_data_parse_preview: []
  });
  const PHASE268_SNAPSHOT_FIELDS = deepFreeze([
    "selectionRecordId", "phase267PreviewRequestId", "status", "fileName", "extension",
    "mimeType", "fileSize", "lastModifiedAt", "expectedEncoding", "selectedBy",
    "resultDataRead", "resultDataParsed", "resultDataStored", "resultDataImported",
    "resultDataApplied", "resultDataLearned", "resultPreviewCreated", "resultPreviewReady",
    "intakeReady", "fileContentAccessed", "fileContentParsed", "fileContentStored",
    "fileUploaded", "fileExternallyTransmitted"
  ]);
  const temporaryMemory = new Map();
  const activeReads = new Set();
  const requestedReadActions = new Map();

  function makePhase268Snapshot(target) {
    const source = target || {}, snapshot = {};
    PHASE268_SNAPSHOT_FIELDS.forEach(key => {
      if (typeof source[key] === "boolean" || typeof source[key] === "number") snapshot[key] = source[key];
      else snapshot[key] = cleanText(source[key]);
    });
    const approval = source.approval || {};
    snapshot.approval = {
      approvalRecordId: cleanText(approval.approvalRecordId), approvedBy: cleanText(approval.approvedBy),
      decision: cleanText(approval.decision), conditions: cleanText(approval.conditions),
      approvedFileName: cleanText(approval.approvedFileName),
      approvedFileSize: Number.isFinite(approval.approvedFileSize) ? approval.approvedFileSize : null,
      approvedLastModifiedAt: cleanText(approval.approvedLastModifiedAt),
      recheckRequired: bool(approval.recheckRequired)
    };
    const reader = source.plannedReader || {};
    snapshot.plannedReader = { name: cleanText(reader.name), role: cleanText(reader.role) };
    snapshot.checklist = phase268.CHECK_DEFINITIONS.map(definition => {
      const item = (source.checklist || []).find(entry => entry && entry.checkId === definition.checkId) || {};
      return { checkId: definition.checkId, required: definition.required, status: cleanText(item.status) };
    });
    snapshot.unresolvedIssues = unique(source.unresolvedIssues).filter(cleanText);
    snapshot.exceptionResolution = clone(source.exceptionResolution || {});
    return deepFreeze(snapshot);
  }
  function fileMetadata(file) {
    if (!file || typeof file !== "object") return deepFreeze({});
    const name = cleanText(file.name), dot = name.lastIndexOf(".");
    return deepFreeze({
      fileName: name, fileSize: Number.isFinite(file.size) ? file.size : null,
      mimeType: cleanText(file.type),
      lastModifiedAt: Number.isFinite(file.lastModified) ? new Date(file.lastModified).toISOString() : "",
      extension: dot >= 0 ? name.slice(dot + 1).toLowerCase() : ""
    });
  }
  function createChecklist(items) {
    const supplied = new Map((Array.isArray(items) ? items : []).map(item => [item && item.checkId, item]));
    return CHECK_DEFINITIONS.map(definition => {
      const item = supplied.get(definition.checkId) || {};
      return { ...definition, status: CHECK_STATUSES.includes(item.status) ? item.status : "unchecked", checkedBy: cleanText(item.checkedBy), checkedAt: cleanText(item.checkedAt), note: cleanText(item.note) };
    });
  }
  function manualOperation(operation, explicit) {
    return Boolean(operation && cleanText(operation.performedBy) && cleanText(operation.reason) && (!explicit || operation.explicitConfirmation === true));
  }
  function addAudit(record, action, operation, details, options) {
    return [...(record.auditHistory || []), {
      auditId: `phase26-9-audit-${(record.auditHistory || []).length + 1}`, action,
      actor: cleanText(operation && operation.performedBy), occurredAt: nowIso(options),
      reason: cleanText(operation && operation.reason), details: clone(details || {})
    }];
  }
  function normalizeRecord(input, options) {
    const source = input || {}, snapshot = source.phase268Snapshot || {}, metadata = source.selectedFileMetadata || {};
    const comparison = source.metadataComparison || {}, read = source.readResult || {};
    const temporary = source.temporaryData || {}, handoff = source.handoffReview || {};
    return {
      readExecutionRecordId: cleanText(source.readExecutionRecordId),
      phase268SelectionRecordId: cleanText(source.phase268SelectionRecordId || snapshot.selectionRecordId),
      targetSelectionRecordId: cleanText(source.targetSelectionRecordId || snapshot.selectionRecordId),
      targetApprovalRecordId: cleanText(source.targetApprovalRecordId || (snapshot.approval || {}).approvalRecordId),
      phase268Snapshot: makePhase268Snapshot(snapshot),
      status: STATES.includes(source.status) ? source.status : "awaiting_manual_result_data_read",
      executedBy: cleanText(source.executedBy), executionDate: cleanText(source.executionDate),
      readStartTime: cleanText(source.readStartTime), readEndTime: cleanText(source.readEndTime),
      terminal: cleanText(source.terminal), screen: cleanText(source.screen),
      executionReason: cleanText(source.executionReason), procedureConfirmation: cleanText(source.procedureConfirmation),
      approvalConditionsConfirmation: cleanText(source.approvalConditionsConfirmation),
      preReadFinalConfirmedBy: cleanText(source.preReadFinalConfirmedBy),
      preReadFinalConfirmedAt: cleanText(source.preReadFinalConfirmedAt),
      preReadFinalConfirmationReason: cleanText(source.preReadFinalConfirmationReason), note: cleanText(source.note),
      selectedFileMetadata: {
        fileName: cleanText(metadata.fileName), fileSize: Number.isFinite(metadata.fileSize) ? metadata.fileSize : null,
        mimeType: cleanText(metadata.mimeType), lastModifiedAt: cleanText(metadata.lastModifiedAt),
        extension: cleanText(metadata.extension).toLowerCase()
      },
      metadataComparison: {
        fileNameMatch: bool(comparison.fileNameMatch), fileSizeMatch: bool(comparison.fileSizeMatch),
        lastModifiedMatch: bool(comparison.lastModifiedMatch), mimeTypeMatch: bool(comparison.mimeTypeMatch),
        extensionMatch: bool(comparison.extensionMatch), mismatchFields: unique(comparison.mismatchFields).filter(cleanText),
        mismatchReason: cleanText(comparison.mismatchReason),
        humanReviewResult: cleanText(comparison.humanReviewResult),
        reviewedBy: cleanText(comparison.reviewedBy), reviewedAt: cleanText(comparison.reviewedAt)
      },
      declaredMaximumReadSize: Number.isFinite(source.declaredMaximumReadSize) && source.declaredMaximumReadSize > 0 ? source.declaredMaximumReadSize : DEFAULT_MAXIMUM_READ_SIZE,
      sizeLimit: {
        selectedFileSize: Number.isFinite(metadata.fileSize) ? metadata.fileSize : null,
        result: cleanText(source.sizeLimit && source.sizeLimit.result),
        overrideAllowed: false, overrideApprovedBy: "", overrideApprovedAt: "", overrideReason: ""
      },
      readMethod: READ_METHOD,
      readControl: {
        readInProgress: bool(source.readControl && source.readControl.readInProgress),
        readStartedAt: cleanText(source.readControl && source.readControl.readStartedAt),
        cancelRequested: bool(source.readControl && source.readControl.cancelRequested),
        interruptRequested: bool(source.readControl && source.readControl.interruptRequested),
        readCompleted: bool(source.readControl && source.readControl.readCompleted),
        readFailed: bool(source.readControl && source.readControl.readFailed),
        temporaryDataCreated: bool(source.readControl && source.readControl.temporaryDataCreated)
      },
      readResult: {
        readStartedAt: cleanText(read.readStartedAt), readCompletedAt: cleanText(read.readCompletedAt),
        readDurationMs: Number.isFinite(read.readDurationMs) ? read.readDurationMs : null,
        sourceFileName: cleanText(read.sourceFileName), sourceFileSize: Number.isFinite(read.sourceFileSize) ? read.sourceFileSize : null,
        sourceMimeType: cleanText(read.sourceMimeType), sourceLastModified: cleanText(read.sourceLastModified),
        readByteLength: Number.isInteger(read.readByteLength) ? read.readByteLength : null,
        readCharacterLength: Number.isInteger(read.readCharacterLength) ? read.readCharacterLength : null,
        resultEncodingAssumption: cleanText(read.resultEncodingAssumption || snapshot.expectedEncoding),
        readSuccess: bool(read.readSuccess), readErrorCode: cleanText(read.readErrorCode),
        readErrorMessage: cleanText(read.readErrorMessage)
      },
      temporaryData: {
        temporaryDataId: cleanText(temporary.temporaryDataId),
        phase268SelectionRecordId: cleanText(temporary.phase268SelectionRecordId),
        readExecutionRecordId: cleanText(temporary.readExecutionRecordId),
        sourceFileName: cleanText(temporary.sourceFileName),
        sourceFileSize: Number.isFinite(temporary.sourceFileSize) ? temporary.sourceFileSize : null,
        sourceMimeType: cleanText(temporary.sourceMimeType), sourceLastModified: cleanText(temporary.sourceLastModified),
        readMethod: cleanText(temporary.readMethod), readSucceededAt: cleanText(temporary.readSucceededAt),
        readByteLength: Number.isInteger(temporary.readByteLength) ? temporary.readByteLength : null,
        readCharacterLength: Number.isInteger(temporary.readCharacterLength) ? temporary.readCharacterLength : null,
        temporaryDataStatus: TEMPORARY_DATA_STATUSES.includes(temporary.temporaryDataStatus) ? temporary.temporaryDataStatus : "none",
        createdBy: cleanText(temporary.createdBy), createdAt: cleanText(temporary.createdAt),
        discardedBy: cleanText(temporary.discardedBy), discardedAt: cleanText(temporary.discardedAt),
        discardReason: cleanText(temporary.discardReason)
      },
      failureRecord: clone(source.failureRecord || {}),
      interruptionRecord: clone(source.interruptionRecord || {}),
      cancellationRecord: clone(source.cancellationRecord || {}),
      successRecord: clone(source.successRecord || {}),
      checklist: createChecklist(source.checklist),
      handoffReview: {
        decision: cleanText(handoff.decision), humanResult: cleanText(handoff.humanResult),
        confirmedBy: cleanText(handoff.confirmedBy), confirmedAt: cleanText(handoff.confirmedAt),
        confirmationReason: cleanText(handoff.confirmationReason)
      },
      unresolvedIssues: unique(source.unresolvedIssues).filter(cleanText),
      createdBy: cleanText(source.createdBy), createdAt: cleanText(source.createdAt) || nowIso(options),
      updatedBy: cleanText(source.updatedBy), updatedAt: cleanText(source.updatedAt) || cleanText(source.createdAt) || nowIso(options),
      stateHistory: Array.isArray(source.stateHistory) ? clone(source.stateHistory) : [],
      auditHistory: Array.isArray(source.auditHistory) ? clone(source.auditHistory) : [],
      resultDataRead: bool(source.resultDataRead), fileContentAccessed: bool(source.fileContentAccessed),
      temporaryDataHeld: temporary.temporaryDataStatus === "held", ...clone(ALWAYS_FALSE_FLAGS)
    };
  }

  function validatePhase268Target(target) {
    const value = target || {}, approval = value.approval || {}, reasons = [];
    if (value.status !== "ready_for_manual_result_data_read") reasons.push("phase268_status_not_ready");
    if (!cleanText(value.selectionRecordId)) reasons.push("phase268_selection_missing");
    if (!cleanText(approval.approvalRecordId)) reasons.push("phase268_approval_missing");
    if (!["approved", "approved_with_conditions"].includes(approval.decision)) reasons.push("phase268_approval_invalid");
    if (approval.decision === "approved_with_conditions" && !cleanText(approval.conditions)) reasons.push("phase268_approval_conditions_missing");
    if (!cleanText(approval.approvedFileName) || !Number.isFinite(approval.approvedFileSize) || !cleanText(approval.approvedLastModifiedAt)) reasons.push("phase268_approved_metadata_missing");
    if (!cleanText(value.plannedReader && value.plannedReader.name)) reasons.push("phase268_reader_missing");
    if ((value.unresolvedIssues || []).length) reasons.push("phase268_unresolved_issues");
    if (Object.values(value.exceptionResolution || {}).some(result => result !== true)) reasons.push("phase268_exception_unresolved");
    if (phase268.CHECK_DEFINITIONS.filter(item => item.required).some(def => !["passed", "not_applicable"].includes(((value.checklist || []).find(item => item && item.checkId === def.checkId) || {}).status))) reasons.push("phase268_checklist_incomplete");
    for (const key of ["resultDataRead", "resultDataParsed", "resultDataStored", "resultDataImported", "resultDataApplied", "resultDataLearned", "resultPreviewCreated", "resultPreviewReady", "intakeReady", "fileContentAccessed", "fileContentParsed", "fileContentStored", "fileUploaded", "fileExternallyTransmitted"]) if (value[key] !== false) reasons.push(`phase268_${key}_must_be_false`);
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }
  function compareApprovedMetadata(target, metadata, review) {
    const approval = (target && target.approval) || {}, selected = target || {}, actual = metadata || {};
    const result = {
      fileNameMatch: actual.fileName === approval.approvedFileName,
      fileSizeMatch: actual.fileSize === approval.approvedFileSize,
      lastModifiedMatch: actual.lastModifiedAt === approval.approvedLastModifiedAt,
      mimeTypeMatch: actual.mimeType === selected.mimeType,
      extensionMatch: actual.extension === selected.extension
    };
    result.mismatchFields = Object.entries(result).filter(([, matched]) => matched === false).map(([key]) => key);
    result.mismatchReason = cleanText(review && review.mismatchReason);
    result.humanReviewResult = cleanText(review && review.humanReviewResult);
    result.reviewedBy = cleanText(review && review.reviewedBy);
    result.reviewedAt = cleanText(review && review.reviewedAt);
    return deepFreeze(result);
  }
  function validateMetadataForRead(record, target) {
    const value = normalizeRecord(record), comparison = value.metadataComparison, metadata = value.selectedFileMetadata, reasons = [];
    if (!metadata.fileName || metadata.fileSize === null || !metadata.lastModifiedAt) reasons.push("file_not_selected");
    if (!comparison.fileNameMatch) reasons.push("file_name_mismatch");
    if (!comparison.fileSizeMatch) reasons.push("file_size_mismatch");
    if (!comparison.lastModifiedMatch) reasons.push("last_modified_mismatch");
    if ((!comparison.mimeTypeMatch || !comparison.extensionMatch) && (!comparison.mismatchReason || comparison.humanReviewResult !== "accepted" || !comparison.reviewedBy || !comparison.reviewedAt)) reasons.push("type_difference_not_human_accepted");
    if (metadata.fileSize === 0) reasons.push("zero_byte_file");
    if (metadata.fileSize > value.declaredMaximumReadSize) reasons.push("maximum_read_size_exceeded");
    if (!validatePhase268Target(target || value.phase268Snapshot).valid) reasons.push("phase268_target_invalid");
    return deepFreeze({ valid: reasons.length === 0, reasons });
  }
  function executionReasons(record) {
    const value = normalizeRecord(record), reasons = [];
    for (const key of ["readExecutionRecordId", "phase268SelectionRecordId", "targetSelectionRecordId", "targetApprovalRecordId", "executedBy", "executionDate", "readStartTime", "terminal", "screen", "executionReason", "procedureConfirmation", "approvalConditionsConfirmation", "preReadFinalConfirmedBy", "preReadFinalConfirmedAt", "preReadFinalConfirmationReason"]) if (!cleanText(value[key])) reasons.push(`${key}_required`);
    return reasons;
  }
  function createReadExecution(target, input, operation, options) {
    if (!manualOperation(operation, true)) return deepFreeze({ created: false, reason: "manual_operation_required" });
    const checked = validatePhase268Target(target);
    if (!checked.valid) return deepFreeze({ created: false, reason: "phase268_target_invalid", reasons: checked.reasons });
    const record = normalizeRecord({ ...(input || {}), phase268SelectionRecordId: target.selectionRecordId, targetSelectionRecordId: target.selectionRecordId, targetApprovalRecordId: target.approval.approvalRecordId, phase268Snapshot: makePhase268Snapshot(target), createdBy: operation.performedBy, createdAt: nowIso(options) }, options);
    const reasons = executionReasons(record);
    if (reasons.length) return deepFreeze({ created: false, reason: "read_execution_incomplete", reasons, record });
    return deepFreeze({ created: true, record: normalizeRecord({ ...record, auditHistory: addAudit(record, "read_execution_created", operation, {}, options) }, options) });
  }
  function updateRecord(record, changes, operation, options) {
    const current = normalizeRecord(record, options);
    if (["manual_read_cancelled", "temporary_data_discarded", "ready_for_manual_result_data_parse_preview"].includes(current.status)) return deepFreeze({ updated: false, reason: "terminal_record_immutable", record: current });
    if (!manualOperation(operation, false)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    const protectedFields = ["readExecutionRecordId", "phase268SelectionRecordId", "phase268Snapshot", "status", "createdBy", "createdAt", "stateHistory", "auditHistory", "temporaryData", "readResult", "resultDataRead", "fileContentAccessed", "temporaryDataHeld", ...Object.keys(ALWAYS_FALSE_FLAGS)];
    const permitted = Object.fromEntries(Object.entries(changes || {}).filter(([key]) => !protectedFields.includes(key)));
    return deepFreeze({ updated: true, record: normalizeRecord({ ...current, ...permitted, status: current.status, updatedBy: operation.performedBy, updatedAt: nowIso(options), auditHistory: addAudit(current, "record_updated", operation, { fields: Object.keys(permitted) }, options) }, options) });
  }
  function updateChecklist(record, checkId, update, operation, options) {
    const current = normalizeRecord(record, options);
    if (!manualOperation(operation, false)) return deepFreeze({ updated: false, reason: "manual_operation_required", record: current });
    if (!CHECK_DEFINITIONS.some(item => item.checkId === checkId) || !CHECK_STATUSES.includes(update && update.status)) return deepFreeze({ updated: false, reason: "invalid_check_update", record: current });
    const checklist = current.checklist.map(item => item.checkId === checkId ? { ...item, status: update.status, checkedBy: operation.performedBy, checkedAt: nowIso(options), note: cleanText(update.note) } : item);
    return updateRecord(current, { checklist }, operation, options);
  }
  function appendState(record, state, operation, options, extra) {
    const current = normalizeRecord(record, options), at = nowIso(options);
    return normalizeRecord({
      ...current, ...(extra || {}), status: state, updatedBy: operation.performedBy, updatedAt: at,
      stateHistory: [...current.stateHistory, { changedBy: operation.performedBy, changedAt: at, from: current.status, to: state, reason: operation.reason }],
      auditHistory: addAudit(current, "state_changed", operation, { from: current.status, to: state }, options)
    }, options);
  }
  function transition(record, nextState, operation, target, options) {
    const current = normalizeRecord(record, options);
    if (!manualOperation(operation, true)) return deepFreeze({ transitioned: false, reason: "manual_operation_required", record: current });
    if (!(ALLOWED_TRANSITIONS[current.status] || []).includes(nextState)) return deepFreeze({ transitioned: false, reason: "transition_not_allowed", record: current });
    if (nextState === "ready_for_manual_read_execution" && !validateMetadataForRead(current, target).valid) return deepFreeze({ transitioned: false, reason: "metadata_not_approved", reasons: validateMetadataForRead(current, target).reasons, record: current });
    if (nextState === "ready_for_manual_result_data_parse_preview") {
      const evaluation = evaluateHandoff(current, target);
      if (!evaluation.passed) return deepFreeze({ transitioned: false, reason: "handoff_conditions_not_met", reasons: evaluation.reasons, record: current });
    }
    if (nextState === "manual_read_in_progress") return deepFreeze({ transitioned: false, reason: "use_execute_manual_read", record: current });
    return deepFreeze({ transitioned: true, record: appendState(current, nextState, operation, options) });
  }

  async function executeManualRead(record, file, operation, target, options) {
    const current = normalizeRecord(record, options);
    if (!manualOperation(operation, true)) return deepFreeze({ started: false, reason: "manual_operation_required", record: current });
    if (current.status !== "ready_for_manual_read_execution") return deepFreeze({ started: false, reason: "read_state_not_ready", record: current });
    if (activeReads.has(current.readExecutionRecordId) || current.readControl.readInProgress) return deepFreeze({ started: false, reason: "read_already_in_progress", record: current });
    if (!file || typeof file.text !== "function") return deepFreeze({ started: false, reason: "single_file_required", record: current });
    const actual = fileMetadata(file), comparison = compareApprovedMetadata(target || current.phase268Snapshot, actual, current.metadataComparison);
    const prepared = normalizeRecord({ ...current, selectedFileMetadata: actual, metadataComparison: comparison }, options);
    const validation = validateMetadataForRead(prepared, target);
    if (!validation.valid) return deepFreeze({ started: false, reason: "metadata_not_approved", reasons: validation.reasons, record: prepared });
    activeReads.add(current.readExecutionRecordId);
    const startedAt = nowIso(options);
    const inProgress = appendState(prepared, "manual_read_in_progress", operation, options, { readControl: { readInProgress: true, readStartedAt: startedAt, cancelRequested: false, interruptRequested: false, readCompleted: false, readFailed: false, temporaryDataCreated: false } });
    try {
      const rawText = await file.text();
      const completedAt = nowIso(options);
      const requestedAction = requestedReadActions.get(current.readExecutionRecordId);
      if (requestedAction) {
        const interruptedState = requestedAction.type === "cancel" ? "manual_read_cancelled" : "manual_read_interrupted";
        const field = requestedAction.type === "cancel" ? "cancellationRecord" : "interruptionRecord";
        const stopped = appendState(inProgress, interruptedState, requestedAction.operation, options, {
          [field]: {
            declared: true, reason: requestedAction.operation.reason,
            declaredBy: requestedAction.operation.performedBy, declaredAt: requestedAction.requestedAt,
            retryAllowed: requestedAction.type !== "cancel", retryCondition: "new explicit human operation required",
            unresolved: false
          },
          readEndTime: completedAt, temporaryData: { temporaryDataStatus: "none" },
          readControl: {
            readInProgress: false, readStartedAt: startedAt,
            cancelRequested: requestedAction.type === "cancel",
            interruptRequested: requestedAction.type === "interrupt",
            readCompleted: true, readFailed: false, temporaryDataCreated: false
          }
        });
        return deepFreeze({ started: true, succeeded: false, reason: `${requestedAction.type}_requested`, record: stopped });
      }
      if (typeof rawText !== "string" || rawText.length === 0) throw Object.assign(new Error("Empty read result"), { code: "EMPTY_READ_RESULT" });
      const byteLength = typeof TextEncoder === "function" ? new TextEncoder().encode(rawText).byteLength : rawText.length;
      if (byteLength === 0) throw Object.assign(new Error("Empty read result"), { code: "EMPTY_READ_RESULT" });
      const temporaryDataId = `phase26-9-temp-${current.readExecutionRecordId}-${Date.parse(completedAt)}`;
      temporaryMemory.set(temporaryDataId, rawText);
      const temporaryData = {
        temporaryDataId, phase268SelectionRecordId: current.phase268SelectionRecordId,
        readExecutionRecordId: current.readExecutionRecordId, sourceFileName: actual.fileName,
        sourceFileSize: actual.fileSize, sourceMimeType: actual.mimeType,
        sourceLastModified: actual.lastModifiedAt, readMethod: READ_METHOD,
        readSucceededAt: completedAt, readByteLength: byteLength,
        readCharacterLength: rawText.length, temporaryDataStatus: "holding",
        createdBy: operation.performedBy, createdAt: completedAt,
        discardedBy: "", discardedAt: "", discardReason: ""
      };
      const readResult = {
        readStartedAt: startedAt, readCompletedAt: completedAt, readDurationMs: elapsed(startedAt, completedAt),
        sourceFileName: actual.fileName, sourceFileSize: actual.fileSize, sourceMimeType: actual.mimeType,
        sourceLastModified: actual.lastModifiedAt, readByteLength: byteLength,
        readCharacterLength: rawText.length, resultEncodingAssumption: current.phase268Snapshot.expectedEncoding,
        readSuccess: true, readErrorCode: "", readErrorMessage: ""
      };
      const succeeded = appendState(inProgress, "manual_read_succeeded", operation, options, {
        readEndTime: completedAt, readResult, temporaryData,
        readControl: { readInProgress: false, readStartedAt: startedAt, cancelRequested: false, interruptRequested: false, readCompleted: true, readFailed: false, temporaryDataCreated: true },
        resultDataRead: true, fileContentAccessed: true
      });
      return deepFreeze({ started: true, succeeded: true, record: succeeded });
    } catch (error) {
      const failedAt = nowIso(options), code = cleanText(error && error.code) || "READ_FAILED";
      const failureRecord = {
        errorCode: code, errorName: cleanText(error && error.name) || "Error",
        errorMessage: cleanText(error && error.message) || "File read failed",
        failedAt, failureStage: "file_text_read", selectedFileMetadata: clone(actual),
        temporaryDataCreated: false, temporaryDataDiscarded: true, retryAllowed: true,
        retryReason: "human must explicitly retry", reviewedBy: "", reviewedAt: ""
      };
      const failed = appendState(inProgress, "manual_read_failed", operation, options, {
        readEndTime: failedAt, failureRecord, temporaryData: { temporaryDataStatus: "none" },
        readResult: { readStartedAt: startedAt, readCompletedAt: failedAt, readDurationMs: elapsed(startedAt, failedAt), sourceFileName: actual.fileName, sourceFileSize: actual.fileSize, sourceMimeType: actual.mimeType, sourceLastModified: actual.lastModifiedAt, readByteLength: null, readCharacterLength: null, resultEncodingAssumption: current.phase268Snapshot.expectedEncoding, readSuccess: false, readErrorCode: code, readErrorMessage: failureRecord.errorMessage },
        readControl: { readInProgress: false, readStartedAt: startedAt, cancelRequested: false, interruptRequested: false, readCompleted: true, readFailed: true, temporaryDataCreated: false }
      });
      return deepFreeze({ started: true, succeeded: false, reason: code, record: failed });
    } finally {
      activeReads.delete(current.readExecutionRecordId);
      requestedReadActions.delete(current.readExecutionRecordId);
    }
  }
  function requestReadInterruption(readExecutionRecordId, operation, options) {
    const id = cleanText(readExecutionRecordId);
    if (!id || !activeReads.has(id) || !manualOperation(operation, true)) return deepFreeze({ requested: false, reason: "active_manual_read_required" });
    requestedReadActions.set(id, { type: "interrupt", operation: clone(operation), requestedAt: nowIso(options) });
    return deepFreeze({ requested: true, readExecutionRecordId: id });
  }
  function requestReadCancellation(readExecutionRecordId, operation, options) {
    const id = cleanText(readExecutionRecordId);
    if (!id || !activeReads.has(id) || !manualOperation(operation, true)) return deepFreeze({ requested: false, reason: "active_manual_read_required" });
    requestedReadActions.set(id, { type: "cancel", operation: clone(operation), requestedAt: nowIso(options) });
    return deepFreeze({ requested: true, readExecutionRecordId: id });
  }
  function holdTemporaryData(record, successInput, operation, options) {
    const current = normalizeRecord(record, options), temp = current.temporaryData;
    if (!manualOperation(operation, true)) return deepFreeze({ held: false, reason: "manual_operation_required", record: current });
    if (current.status !== "manual_read_succeeded" || temp.temporaryDataStatus !== "holding" || !temporaryMemory.has(temp.temporaryDataId)) return deepFreeze({ held: false, reason: "temporary_data_not_available", record: current });
    const review = successInput || {};
    if (cleanText(review.humanResult) !== "accepted" || cleanText(review.handoffDecision) !== "approved" || !cleanText(review.confirmedBy) || !cleanText(review.confirmedAt) || !cleanText(review.confirmationReason)) return deepFreeze({ held: false, reason: "human_success_review_required", record: current });
    const heldTemp = { ...temp, temporaryDataStatus: "held" };
    const successRecord = {
      successRecordId: cleanText(review.successRecordId), readExecutionRecordId: current.readExecutionRecordId,
      temporaryDataId: temp.temporaryDataId, succeededAt: temp.readSucceededAt,
      sourceFileName: temp.sourceFileName, sourceFileSize: temp.sourceFileSize,
      readByteLength: temp.readByteLength, readCharacterLength: temp.readCharacterLength,
      readMethod: READ_METHOD, temporaryDataStatus: "held", handoffDecision: review.handoffDecision,
      humanResult: review.humanResult, confirmedBy: review.confirmedBy,
      confirmedAt: review.confirmedAt, confirmationReason: review.confirmationReason
    };
    const recordHeld = appendState(current, "temporary_data_held", operation, options, {
      temporaryData: heldTemp, successRecord,
      handoffReview: { decision: review.handoffDecision, humanResult: review.humanResult, confirmedBy: review.confirmedBy, confirmedAt: review.confirmedAt, confirmationReason: review.confirmationReason },
      resultDataRead: true, fileContentAccessed: true
    });
    return deepFreeze({ held: true, record: recordHeld });
  }
  function discardTemporaryData(record, discard, operation, options) {
    const current = normalizeRecord(record, options), temp = current.temporaryData;
    if (!manualOperation(operation, true) || !cleanText(discard && discard.reason)) return deepFreeze({ discarded: false, reason: "manual_discard_required", record: current });
    if (!["manual_read_succeeded", "temporary_data_held"].includes(current.status) || !temp.temporaryDataId) return deepFreeze({ discarded: false, reason: "temporary_data_not_discardable", record: current });
    temporaryMemory.delete(temp.temporaryDataId);
    const discardedAt = nowIso(options);
    const discarded = appendState(current, "temporary_data_discarded", operation, options, {
      temporaryData: { ...temp, temporaryDataStatus: "discarded", discardedBy: operation.performedBy, discardedAt, discardReason: discard.reason },
      temporaryDataHeld: false, resultDataRead: true, fileContentAccessed: true,
      auditHistory: addAudit(current, "temporary_data_discarded", operation, { temporaryDataId: temp.temporaryDataId, before: temp.temporaryDataStatus, after: "discarded", rereadRequired: true }, options)
    });
    return deepFreeze({ discarded: true, record: discarded });
  }
  function getTemporaryData(record) {
    const value = normalizeRecord(record), id = value.temporaryData.temporaryDataId;
    if (!id || !["holding", "held"].includes(value.temporaryData.temporaryDataStatus) || !temporaryMemory.has(id)) return undefined;
    return temporaryMemory.get(id);
  }
  function checklistReasons(record) {
    return normalizeRecord(record).checklist.filter(item => item.required && !["passed", "not_applicable"].includes(item.status)).map(item => `check_${item.checkId}_${item.status}`);
  }
  function evaluateHandoff(record, target) {
    const value = normalizeRecord(record), result = value.readResult, temp = value.temporaryData, handoff = value.handoffReview;
    const reasons = [...validatePhase268Target(target || value.phase268Snapshot).reasons, ...executionReasons(value), ...validateMetadataForRead(value, target).reasons, ...checklistReasons(value)];
    if (!result.readSuccess || !result.readStartedAt || !result.readCompletedAt || result.readDurationMs === null) reasons.push("read_not_successfully_completed");
    if (!result.readByteLength || !result.readCharacterLength) reasons.push("empty_read_result");
    if (!temp.temporaryDataId || temp.temporaryDataStatus !== "held" || !temporaryMemory.has(temp.temporaryDataId)) reasons.push("temporary_data_not_held");
    if (handoff.decision !== "approved" || handoff.humanResult !== "accepted" || !handoff.confirmedBy || !handoff.confirmedAt || !handoff.confirmationReason) reasons.push("handoff_not_human_approved");
    if (value.unresolvedIssues.length || value.failureRecord.unresolved || value.interruptionRecord.unresolved || value.cancellationRecord.unresolved) reasons.push("unresolved_read_issue");
    return deepFreeze({ passed: unique(reasons).length === 0, reasons: unique(reasons) });
  }
  function render(documentRef) {
    if (!documentRef) return;
    const list = documentRef.getElementById("phase269-checklist");
    if (list && !list.children.length) CHECK_DEFINITIONS.forEach(definition => {
      const item = documentRef.createElement("div");
      item.className = "phase269-check-item";
      item.textContent = `[unchecked] ${definition.label}`;
      list.appendChild(item);
    });
    const fileInput = documentRef.getElementById("phase269-file-input");
    const startButton = documentRef.getElementById("phase269-read-start");
    if (fileInput && startButton) fileInput.addEventListener("change", event => {
      const files = event.target.files;
      const targetEligible = startButton.dataset.targetEligible === "true";
      const metadataApproved = startButton.dataset.metadataApproved === "true";
      startButton.disabled = !(files && files.length === 1 && targetEligible && metadataApproved);
    });
  }
  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
  }
  return {
    PHASE268_REFERENCE, DEFAULT_MAXIMUM_READ_SIZE, READ_METHOD, STATES,
    TEMPORARY_DATA_STATUSES, CHECK_STATUSES, ALWAYS_FALSE_FLAGS, CHECK_DEFINITIONS,
    ALLOWED_TRANSITIONS, PHASE268_SNAPSHOT_FIELDS, makePhase268Snapshot, fileMetadata,
    createChecklist, validatePhase268Target, compareApprovedMetadata, validateMetadataForRead,
    normalizeRecord, createReadExecution, updateRecord, updateChecklist, transition,
    executeManualRead, requestReadInterruption, requestReadCancellation,
    holdTemporaryData, discardTemporaryData, getTemporaryData,
    evaluateHandoff, render
  };
});
