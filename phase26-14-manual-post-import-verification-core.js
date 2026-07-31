(function (root, factory) {
  const phase2613 = typeof module === "object" && module.exports
    ? require("./phase26-13-manual-formal-import-execution-core.js")
    : root.HashimotoPhase2613ManualFormalImportExecution;
  const api = factory(phase2613);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2614ManualPostImportVerification = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase2613) {
  "use strict";
  if (!phase2613) throw new Error("Phase26-13 definition is required");

  const STATES = Object.freeze([
    "ready_for_manual_post_import_verification",
    "manual_post_import_verification_started",
    "manual_post_import_verification_in_progress",
    "manual_post_import_verification_passed",
    "manual_post_import_verification_passed_with_warnings",
    "manual_post_import_verification_failed",
    "manual_post_import_verification_interrupted",
    "manual_post_import_verification_cancelled",
    "manual_post_import_reconciliation_required",
    "manual_post_import_rollback_review_required",
    "ready_for_manual_post_import_verification_decision",
  ]);
  const ALLOWED_TRANSITIONS = Object.freeze({
    ready_for_manual_post_import_verification: ["manual_post_import_verification_started", "manual_post_import_verification_cancelled"],
    manual_post_import_verification_started: ["manual_post_import_verification_in_progress", "manual_post_import_verification_interrupted", "manual_post_import_verification_cancelled"],
    manual_post_import_verification_in_progress: ["manual_post_import_verification_passed", "manual_post_import_verification_passed_with_warnings", "manual_post_import_verification_failed", "manual_post_import_verification_interrupted", "manual_post_import_verification_cancelled"],
    manual_post_import_verification_passed: ["ready_for_manual_post_import_verification_decision"],
    manual_post_import_verification_passed_with_warnings: ["ready_for_manual_post_import_verification_decision"],
    manual_post_import_verification_failed: ["manual_post_import_reconciliation_required", "manual_post_import_rollback_review_required"],
    manual_post_import_verification_interrupted: [],
    manual_post_import_verification_cancelled: [],
    manual_post_import_reconciliation_required: [],
    manual_post_import_rollback_review_required: [],
    ready_for_manual_post_import_verification_decision: [],
  });
  const SAFETY = Object.freeze({
    privateLocalOnly: true,
    planOnly: true,
    protectedMode: true,
    automaticCorrectionPerformed: false,
    automaticDeletionPerformed: false,
    automaticRetryPerformed: false,
    automaticReimportPerformed: false,
    automaticRollbackPerformed: false,
    automaticApplicationPerformed: false,
    automaticLearningUpdatePerformed: false,
    externalTransmissionPerformed: false,
    backgroundExecutionEnabled: false,
    publicPublishingEnabled: false,
    githubPagesEnabled: false,
  });
  const MAPPING_STATUSES = Object.freeze(["matched", "matched_with_warning", "source_only", "destination_only", "duplicate_mapping", "missing_mapping", "invalid_mapping", "verification_not_completed"]);
  const COMPARISON_RESULTS = Object.freeze(["exact_match", "normalized_match", "warning_difference", "critical_difference", "comparison_not_available"]);
  const ISSUE_TYPES = Object.freeze(["count_mismatch", "duplicate_detected", "missing_source_record", "missing_destination_record", "missing_mapping", "invalid_mapping", "field_difference", "critical_field_difference", "unexpected_skip", "unexpected_failure", "unknown_destination_record", "source_hash_mismatch", "destination_key_conflict", "rollback_candidate_present", "verification_data_insufficient"]);
  const registry = new Set();
  let sequence = 0;
  const clean = value => typeof value === "string" ? value.trim() : "";
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const nowIso = options => new Date(options && typeof options.now === "function" ? options.now() : new Date()).toISOString();
  const manual = operation => Boolean(operation && clean(operation.performedBy) && clean(operation.reason) && operation.explicitConfirmation === true);
  const integer = value => Number.isInteger(value) && value >= 0;
  const normalize = value => String(value == null ? "" : value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
  const freeze = value => Object.freeze(value);

  function resetRegistry() { registry.clear(); sequence = 0; }
  function verificationRecordId(options) {
    const stamp = nowIso(options).replace(/\D/g, "").slice(0, 14);
    sequence += 1;
    return `manual-post-import-verification-${stamp}-${String(sequence).padStart(5, "0")}`;
  }
  function transition(record, nextState, operation, options) {
    if (!manual(operation)) return freeze({ transitioned: false, reason: "人間の明示操作が必要です", record });
    if (!(ALLOWED_TRANSITIONS[record.status] || []).includes(nextState)) return freeze({ transitioned: false, reason: "定義されていない状態遷移です", record });
    const at = nowIso(options);
    return freeze({ transitioned: true, record: { ...clone(record), status: nextState, updatedAt: at, stateHistory: [...(record.stateHistory || []), { from: record.status, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }] } });
  }
  function validateTarget(target, existingRecords) {
    const value = target || {};
    const reasons = [];
    if (!value.phase2613ExecutionRecordExists) reasons.push("Phase26-13の正式インポート実行記録がありません");
    if (value.status !== "ready_for_manual_post_import_verification") reasons.push("状態がready_for_manual_post_import_verificationではありません");
    if (!clean(value.importBatchId)) reasons.push("importBatchIdがありません");
    if (!clean(value.candidateId)) reasons.push("candidateIdがありません");
    if (!clean(value.executorName) && !clean(value.executorId)) reasons.push("正式インポート実行者がありません");
    for (const key of ["importTargetCountBeforeExecution", "plannedImportCount", "attemptedImportCount", "successfullyImportedCount", "failedImportCount", "skippedImportCount", "importTargetCountAfterExecution"]) {
      if (!integer(value[key])) reasons.push(`${key}が記録されていません`);
    }
    if (!Array.isArray(value.recordMappings)) reasons.push("元データと取込結果の対応記録がありません");
    if (value.protectedMode !== true || value.planOnly !== true) reasons.push("protectedModeまたはPLAN_ONLYの安全条件に違反しています");
    const existing = Array.isArray(existingRecords) ? existingRecords : [];
    if (registry.has(value.importBatchId) || existing.some(record => record && record.importBatchId === value.importBatchId)) reasons.push("同一importBatchIdの検証記録が既にあります");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function listEligibleTargets(records, existingRecords) {
    return freeze((Array.isArray(records) ? records : []).map(record => ({ ...clone(record), verificationStartAllowed: validateTarget(record, existingRecords).valid, verificationStartBlockedReasons: validateTarget(record, existingRecords).reasons })).filter(record => record.status === "ready_for_manual_post_import_verification"));
  }
  function startVerification(target, input, operation, options) {
    const checked = validateTarget(target, input && input.existingVerificationRecords);
    const reasons = [...checked.reasons];
    if (!manual(operation)) reasons.push("人間の明示操作が必要です");
    if (!clean(input && input.verifierName) && !clean(input && input.verifierId)) reasons.push("検証者が入力されていません");
    if (clean(input && input.confirmImportBatchId) !== clean(target && target.importBatchId)) reasons.push("検証対象importBatchIdの再確認が一致しません");
    for (const key of ["verificationStartConfirmed", "noAutomaticCorrectionConfirmed", "noAutomaticRollbackConfirmed", "noAutomaticLearningUpdateConfirmed"]) {
      if (!input || input[key] !== true) reasons.push(`${key}の明示確認が必要です`);
    }
    if (reasons.length) return freeze({ started: false, reasons });
    const at = nowIso(options);
    const record = {
      verificationRecordId: verificationRecordId(options),
      importBatchId: target.importBatchId,
      candidateId: target.candidateId,
      approvalRecordId: clean(target.approvalRecordId),
      sourceDataId: clean(target.sourceDataId),
      sourceDataName: clean(target.sourceDataName),
      sourceDataHash: clean(target.sourceDataHash),
      destinationType: clean(target.destinationType),
      destinationName: clean(target.destinationName),
      verifierId: clean(input.verifierId),
      verifierName: clean(input.verifierName),
      verificationStartedAt: at,
      verificationCompletedAt: "",
      status: "manual_post_import_verification_in_progress",
      verificationResult: "pending",
      countVerification: null,
      duplicateVerification: null,
      missingVerification: null,
      mappingVerification: null,
      fieldComparisons: [],
      issues: [],
      warningCount: 0,
      errorCount: 0,
      criticalCount: 0,
      verifierComment: "",
      interruptionReason: "",
      cancellationReason: "",
      rollbackCandidateId: clean(target.rollbackCandidateId),
      rollbackCandidate: clone(target.rollbackCandidate || null),
      reconciliationRequired: false,
      rollbackReviewRequired: false,
      nextState: "manual_post_import_verification_in_progress",
      createdAt: at,
      updatedAt: at,
      stateHistory: [
        { from: "ready_for_manual_post_import_verification", to: "manual_post_import_verification_started", changedBy: operation.performedBy, changedAt: at, reason: operation.reason },
        { from: "manual_post_import_verification_started", to: "manual_post_import_verification_in_progress", changedBy: operation.performedBy, changedAt: at, reason: "手動検証開始" },
      ],
      ...clone(SAFETY),
    };
    registry.add(target.importBatchId);
    return freeze({ started: true, record });
  }
  function issue(type, severity, record, data, verifier, options) {
    return {
      issueId: `verification-issue-${String(record.issues.length + 1).padStart(4, "0")}`,
      issueType: type,
      severity,
      importBatchId: record.importBatchId,
      sourceRecordId: clean(data && data.sourceRecordId),
      destinationRecordId: clean(data && data.destinationRecordId),
      fieldName: clean(data && data.fieldName),
      expectedValue: data && data.expectedValue,
      actualValue: data && data.actualValue,
      description: clean(data && data.description) || type,
      detectedAt: nowIso(options),
      detectedBy: verifier,
      humanComment: clean(data && data.humanComment),
      resolutionRequired: severity === "error" || severity === "critical",
    };
  }
  function analyzeVerification(record, target, evidence, operation, options) {
    if (!manual(operation) || !record || record.status !== "manual_post_import_verification_in_progress") return freeze({ analyzed: false, reasons: ["検証中の記録と人間の明示操作が必要です"] });
    const data = evidence || {};
    const result = clone(record);
    const counts = {
      preImportCount: target.importTargetCountBeforeExecution,
      plannedImportCount: target.plannedImportCount,
      attemptedImportCount: target.attemptedImportCount,
      successfullyImportedCount: target.successfullyImportedCount,
      failedImportCount: target.failedImportCount,
      skippedImportCount: target.skippedImportCount,
      unprocessedCount: Math.max(0, target.plannedImportCount - target.attemptedImportCount),
      postImportCount: target.importTargetCountAfterExecution,
      sourceRecordCount: Array.isArray(data.sourceRecords) ? data.sourceRecords.length : 0,
      mappingRecordCount: Array.isArray(target.recordMappings) ? target.recordMappings.length : 0,
      destinationConfirmedCount: Array.isArray(data.destinationRecords) ? data.destinationRecords.length : 0,
      isConsistent: false,
      notes: clean(data.countNotes),
    };
    const attemptEquation = counts.attemptedImportCount === counts.successfullyImportedCount + counts.failedImportCount + counts.skippedImportCount;
    const destinationEquation = counts.postImportCount === counts.preImportCount + counts.successfullyImportedCount;
    counts.isConsistent = attemptEquation && (destinationEquation || data.destinationCountExceptionApproved === true && Boolean(counts.notes));
    result.countVerification = counts;
    if (!counts.isConsistent) result.issues.push(issue("count_mismatch", "critical", result, { description: "取込件数の整合性が成立しません" }, operation.performedBy, options));

    const duplicateItems = Array.isArray(data.duplicateItems) ? clone(data.duplicateItems) : [];
    result.duplicateVerification = { duplicateCount: duplicateItems.reduce((sum, item) => sum + (integer(item.detectedCount) ? item.detectedCount : 1), 0), duplicateItems, hasCriticalDuplicate: duplicateItems.some(item => item.severity === "critical" || item.critical === true) };
    duplicateItems.forEach(item => result.issues.push(issue("duplicate_detected", item.severity || "warning", result, item, operation.performedBy, options)));

    const missingItems = Array.isArray(data.missingItems) ? clone(data.missingItems) : [];
    result.missingVerification = { missingCount: missingItems.length, missingItems, hasCriticalMissing: missingItems.some(item => item.severity === "critical" || item.critical === true) };
    missingItems.forEach(item => result.issues.push(issue(item.issueType && ISSUE_TYPES.includes(item.issueType) ? item.issueType : "missing_mapping", item.severity || "error", result, item, operation.performedBy, options)));

    const mappings = Array.isArray(data.mappingResults) ? clone(data.mappingResults) : [];
    const mappingCount = status => mappings.filter(item => item.verificationStatus === status).length;
    result.mappingVerification = {
      matchedCount: mappingCount("matched"),
      warningCount: mappingCount("matched_with_warning"),
      sourceOnlyCount: mappingCount("source_only"),
      destinationOnlyCount: mappingCount("destination_only"),
      duplicateMappingCount: mappingCount("duplicate_mapping"),
      missingMappingCount: mappingCount("missing_mapping"),
      invalidMappingCount: mappingCount("invalid_mapping"),
      records: mappings,
    };
    if (mappings.length !== counts.mappingRecordCount || mappings.some(item => !MAPPING_STATUSES.includes(item.verificationStatus))) {
      result.issues.push(issue("missing_mapping", "critical", result, { description: "対応記録件数または対応状態が不正です", expectedValue: counts.mappingRecordCount, actualValue: mappings.length }, operation.performedBy, options));
    }
    mappings.filter(item => !["matched", "matched_with_warning"].includes(item.verificationStatus)).forEach(item => {
      const critical = ["duplicate_mapping", "missing_mapping", "invalid_mapping"].includes(item.verificationStatus);
      result.issues.push(issue(item.verificationStatus === "invalid_mapping" ? "invalid_mapping" : "missing_mapping", critical ? "error" : "warning", result, item, operation.performedBy, options));
    });

    result.fieldComparisons = (Array.isArray(data.fieldComparisons) ? data.fieldComparisons : []).map(comparison => {
      const expected = comparison.expectedValue;
      const actual = comparison.actualValue;
      let comparisonResult = comparison.comparisonResult;
      if (!COMPARISON_RESULTS.includes(comparisonResult)) comparisonResult = expected === actual ? "exact_match" : normalize(expected) === normalize(actual) ? "normalized_match" : comparison.critical ? "critical_difference" : "warning_difference";
      return { ...clone(comparison), comparisonResult };
    });
    result.fieldComparisons.filter(item => ["warning_difference", "critical_difference"].includes(item.comparisonResult)).forEach(item => result.issues.push(issue(item.comparisonResult === "critical_difference" ? "critical_field_difference" : "field_difference", item.comparisonResult === "critical_difference" ? "critical" : "warning", result, item, operation.performedBy, options)));
    (Array.isArray(data.additionalIssues) ? data.additionalIssues : []).forEach(item => result.issues.push(issue(ISSUE_TYPES.includes(item.issueType) ? item.issueType : "verification_data_insufficient", item.severity || "error", result, item, operation.performedBy, options)));
    if (result.rollbackCandidateId) result.issues.push(issue("rollback_candidate_present", "warning", result, { description: "Phase26-13のロールバック候補があります" }, operation.performedBy, options));
    result.warningCount = result.issues.filter(item => item.severity === "warning").length;
    result.errorCount = result.issues.filter(item => item.severity === "error").length;
    result.criticalCount = result.issues.filter(item => item.severity === "critical").length;
    result.updatedAt = nowIso(options);
    return freeze({ analyzed: true, record: result });
  }
  function finalizeVerification(record, input, operation, options) {
    const reasons = [];
    if (!manual(operation) || !record || record.status !== "manual_post_import_verification_in_progress") reasons.push("検証中の記録と人間の明示操作が必要です");
    if (!record || !record.countVerification || !record.duplicateVerification || !record.missingVerification || !record.mappingVerification) reasons.push("件数・重複・欠損・対応検証が完了していません");
    if (!clean(input && input.verifierComment) && input && input.requestedResult === "passed_with_warnings") reasons.push("警告付き正常には検証者コメントが必要です");
    if (reasons.length) return freeze({ finalized: false, reasons });
    const severe = !record.countVerification.isConsistent || record.duplicateVerification.hasCriticalDuplicate || record.missingVerification.hasCriticalMissing || record.errorCount > 0 || record.criticalCount > 0;
    const hasWarnings = record.warningCount > 0 || record.mappingVerification.warningCount > 0;
    let status;
    let nextState;
    if (severe) {
      status = "manual_post_import_verification_failed";
      nextState = input.failureNextState;
      if (!["manual_post_import_reconciliation_required", "manual_post_import_rollback_review_required"].includes(nextState)) return freeze({ finalized: false, reasons: ["不合格時の次状態を人間が選択してください"] });
    } else if (hasWarnings) {
      if (!clean(input.verifierComment)) return freeze({ finalized: false, reasons: ["警告内容への検証者コメントが必要です"] });
      status = "manual_post_import_verification_passed_with_warnings";
      nextState = "ready_for_manual_post_import_verification_decision";
    } else {
      status = "manual_post_import_verification_passed";
      nextState = "ready_for_manual_post_import_verification_decision";
    }
    const at = nowIso(options);
    const finalRecord = {
      ...clone(record),
      verificationCompletedAt: at,
      status: nextState,
      verificationResult: status,
      verifierComment: clean(input.verifierComment),
      reconciliationRequired: nextState === "manual_post_import_reconciliation_required",
      rollbackReviewRequired: nextState === "manual_post_import_rollback_review_required",
      nextState,
      updatedAt: at,
      stateHistory: [...record.stateHistory, { from: record.status, to: status, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }, { from: status, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: "人間による検証結果確定" }],
    };
    return freeze({ finalized: true, record: finalRecord });
  }
  function interruptVerification(record, reason, operation, options) {
    if (!manual(operation) || !clean(reason) || !record || !["manual_post_import_verification_started", "manual_post_import_verification_in_progress"].includes(record.status)) return freeze({ interrupted: false, reasons: ["検証中断には対象、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ interrupted: true, record: { ...clone(record), status: "manual_post_import_verification_interrupted", interruptionReason: clean(reason), nextState: "manual_post_import_verification_interrupted", verificationCompletedAt: at, updatedAt: at } });
  }
  function cancelVerification(targetOrRecord, reason, operation, options) {
    if (!manual(operation) || !clean(reason) || !targetOrRecord || !["ready_for_manual_post_import_verification", "manual_post_import_verification_started", "manual_post_import_verification_in_progress"].includes(targetOrRecord.status)) return freeze({ cancelled: false, reasons: ["検証取消には確定前の対象、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    if (clean(targetOrRecord.importBatchId)) registry.add(targetOrRecord.importBatchId);
    return freeze({ cancelled: true, record: { ...clone(targetOrRecord), verificationRecordId: targetOrRecord.verificationRecordId || verificationRecordId(options), status: "manual_post_import_verification_cancelled", cancellationReason: clean(reason), cancelledBy: operation.performedBy, cancelledAt: at, nextState: "manual_post_import_verification_cancelled", verificationCompletedAt: at, updatedAt: at, ...clone(SAFETY) } });
  }
  function render(doc) {
    if (!doc) return;
    const status = doc.getElementById("phase2614-current-status");
    if (status) status.textContent = "ready_for_manual_post_import_verification";
  }
  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
  }
  return { PHASE2613_REFERENCE: phase2613, STATES, ALLOWED_TRANSITIONS, SAFETY, MAPPING_STATUSES, COMPARISON_RESULTS, ISSUE_TYPES, verificationRecordId, validateTarget, listEligibleTargets, startVerification, analyzeVerification, finalizeVerification, interruptVerification, cancelVerification, transition, resetRegistry, render };
});
