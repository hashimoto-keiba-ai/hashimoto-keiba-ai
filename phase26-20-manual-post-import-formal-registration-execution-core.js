(function (root, factory) {
  const phase2619 = typeof module === "object" && module.exports
    ? require("./phase26-19-manual-post-import-formal-registration-execution-approval-core.js")
    : root.HashimotoPhase2619ManualPostImportFormalRegistrationExecutionApproval;
  const api = factory(phase2619);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2620ManualPostImportFormalRegistrationExecution = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase2619) {
  "use strict";
  if (!phase2619) throw new Error("Phase26-19 definition is required");

  const STATES = Object.freeze([
    "ready_for_manual_post_import_formal_registration_execution",
    "manual_formal_registration_execution_started",
    "manual_formal_registration_execution_in_progress",
    "manual_formal_registration_execution_completed",
    "manual_formal_registration_execution_partially_failed",
    "manual_formal_registration_execution_failed",
    "manual_formal_registration_execution_interrupted",
    "manual_formal_registration_execution_cancelled",
    "manual_formal_registration_execution_abnormality_detected",
    "ready_for_manual_post_registration_verification",
  ]);
  const ITEM_STATES = Object.freeze(["pending", "registered", "failed", "skipped", "duplicate_rejected", "interrupted", "cancelled", "abnormality_detected", "rollback_candidate"]);
  const ALLOWED_TRANSITIONS = Object.freeze({
    ready_for_manual_post_import_formal_registration_execution: ["manual_formal_registration_execution_started", "manual_formal_registration_execution_cancelled", "manual_formal_registration_execution_abnormality_detected"],
    manual_formal_registration_execution_started: ["manual_formal_registration_execution_in_progress", "manual_formal_registration_execution_interrupted", "manual_formal_registration_execution_cancelled", "manual_formal_registration_execution_abnormality_detected"],
    manual_formal_registration_execution_in_progress: ["manual_formal_registration_execution_completed", "manual_formal_registration_execution_partially_failed", "manual_formal_registration_execution_failed", "manual_formal_registration_execution_interrupted", "manual_formal_registration_execution_cancelled", "manual_formal_registration_execution_abnormality_detected"],
    manual_formal_registration_execution_completed: ["ready_for_manual_post_registration_verification"],
    manual_formal_registration_execution_partially_failed: [],
    manual_formal_registration_execution_failed: [],
    manual_formal_registration_execution_interrupted: [],
    manual_formal_registration_execution_cancelled: [],
    manual_formal_registration_execution_abnormality_detected: [],
    ready_for_manual_post_registration_verification: [],
  });
  const SAFETY = Object.freeze({
    privateLocalOnly: true, planOnly: true, protectedMode: true,
    automaticPurchasePerformed: false, automaticFormalRegistrationStartPerformed: false,
    automaticReexecutionPerformed: false, automaticRollbackPerformed: false,
    automaticCorrectionPerformed: false, automaticApprovalPerformed: false,
    automaticApplicationPerformed: false, automaticLearningUpdatePerformed: false,
    externalAutomaticExecutionPerformed: false, externalTransmissionPerformed: false,
    publicPublishingEnabled: false, githubPagesEnabled: false,
  });
  const registry = { approvalIds: new Set(), executionIds: new Set(), sourceRecordIds: new Set(), targetIds: new Set() };
  let sequence = 0;
  const clean = value => typeof value === "string" ? value.trim() : "";
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const nowIso = options => new Date(options && typeof options.now === "function" ? options.now() : new Date()).toISOString();
  const manual = operation => Boolean(operation && clean(operation.performedBy) && clean(operation.reason) && operation.explicitConfirmation === true);
  const integer = value => Number.isInteger(value) && value >= 0;
  const freeze = value => Object.freeze(value);

  function resetRegistry() { Object.values(registry).forEach(set => set.clear()); sequence = 0; }
  function executionId(options) { sequence += 1; return `manual-formal-registration-execution-${nowIso(options).replace(/\D/g, "").slice(0, 14)}-${String(sequence).padStart(5, "0")}`; }
  function validateFormalRegistrationExecutionEligibility(target, existingRecords) {
    const value = target || {};
    const reasons = [];
    if (!value.phase2619ApprovalRecordExists) reasons.push("Phase26-19の正式登録実行承認記録がありません");
    if (value.status !== "ready_for_manual_post_import_formal_registration_execution") reasons.push("状態がready_for_manual_post_import_formal_registration_executionではありません");
    if (value.executionApproved !== true || value.approvalDecision !== "approved") reasons.push("正式登録実行が承認済みではありません");
    for (const key of ["formalRegistrationExecutionApprovalRecordId", "formalRegistrationPreparationRecordId", "acceptanceApprovalRecordId", "acceptanceRecordId", "importRecordId", "sourceRecordId"]) if (!clean(value[key])) reasons.push(`${key}がありません`);
    if (!clean(value.approverName) && !clean(value.approverId)) reasons.push("承認者がありません");
    if (!clean(value.approvalCompletedAt) || !clean(value.executionApprovalReason)) reasons.push("承認日時または承認理由がありません");
    if (!value.phase2618PreparationValid || !value.phase2616AcceptanceReferenceValid || !value.phase2617AcceptanceApprovalReferenceValid || !value.phase2613ImportReferenceValid) reasons.push("Phase26-13以降の参照整合性がありません");
    if (value.protectedMode !== true || value.planOnly !== true) reasons.push("protectedModeまたはPLAN_ONLYに違反しています");
    const existing = Array.isArray(existingRecords) ? existingRecords : [];
    if (registry.approvalIds.has(value.formalRegistrationExecutionApprovalRecordId) || existing.some(record => record && record.approvalRecordId === value.formalRegistrationExecutionApprovalRecordId)) reasons.push("同一Phase26-19承認記録は実行済みまたは進行中です");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function createManualPostImportFormalRegistrationExecution(target, input, operation, options) {
    const checked = validateFormalRegistrationExecutionEligibility(target, input && input.existingExecutionRecords);
    const reasons = [...checked.reasons];
    if (!manual(operation)) reasons.push("人間の明示操作が必要です");
    for (const key of ["operatorId", "operatorName", "executionReason", "sourceRecordId", "phase26_19ApprovalRecordId", "phase26_18PreparationRecordId", "acceptanceApprovalRecordId", "acceptanceRecordId", "importRecordId"]) if (!clean(input && input[key])) reasons.push(`${key}が必要です`);
    if (!integer(input && input.expectedRegistrationCount) || input.expectedRegistrationCount === 0) reasons.push("expectedRegistrationCountは1以上必要です");
    for (const key of ["executionConfirmation", "protectedModeAcknowledgement", "planOnlyAcknowledgement", "manualExecutionAcknowledgement"]) if (!input || input[key] !== true) reasons.push(`${key}の明示確認が必要です`);
    if (input && (input.automaticExecutionRequested === true || input.automaticRollbackRequested === true)) reasons.push("自動処理要求は禁止されています");
    if (target && clean(input && input.phase26_19ApprovalRecordId) !== clean(target.formalRegistrationExecutionApprovalRecordId)) reasons.push("Phase26-19承認記録IDが一致しません");
    if (target && clean(input && input.phase26_18PreparationRecordId) !== clean(target.formalRegistrationPreparationRecordId)) reasons.push("Phase26-18準備記録IDが一致しません");
    if (reasons.length) return freeze({ created: false, reasons });
    const at = nowIso(options), id = executionId(options);
    return freeze({ created: true, record: {
      executionId: id, executionRecordId: `record-${id}`, operatorId: input.operatorId, operatorName: input.operatorName,
      executionRequestedAt: clean(input.executionRequestedAt) || at, executionStartedAt: "", executionCompletedAt: "", executionInterruptedAt: "", executionCancelledAt: "",
      executionStatus: "ready_for_manual_post_import_formal_registration_execution", sourceRecordId: input.sourceRecordId,
      approvalRecordId: input.phase26_19ApprovalRecordId, preparationRecordId: input.phase26_18PreparationRecordId,
      acceptanceApprovalRecordId: input.acceptanceApprovalRecordId, acceptanceRecordId: input.acceptanceRecordId, importRecordId: input.importRecordId,
      executionReason: input.executionReason, inputSnapshot: clone(input), resultSnapshot: null,
      stateTransitionHistory: [], validationResults: [{ name: "eligibility", passed: true }],
      countSummary: { expectedRegistrationCount: input.expectedRegistrationCount, attemptedRegistrationCount: 0, successfulRegistrationCount: 0, failedRegistrationCount: 0, skippedRegistrationCount: 0, duplicateDetectedCount: 0, interruptedRegistrationCount: 0, cancelledRegistrationCount: 0, rollbackCandidateCount: 0, totalProcessedCount: 0, countDifference: input.expectedRegistrationCount, countConsistencyStatus: "pending" },
      itemResults: [], abnormalitySummary: [], rollbackCandidates: [], evidenceReferences: clone(input.evidenceReferences || []),
      partialFailureReason: "", humanReviewRequired: true, rollbackPlanningRequired: false, automaticRollbackProhibited: true,
      nextState: "manual_formal_registration_execution_started", createdAt: at, updatedAt: at, ...clone(SAFETY),
    } });
  }
  function addHistory(record, to, operation, at) { return [...(record.stateTransitionHistory || []), { from: record.executionStatus, to, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }]; }
  function startManualFormalRegistrationExecution(record, operation, options) {
    if (!manual(operation) || !record || record.executionStatus !== "ready_for_manual_post_import_formal_registration_execution") return freeze({ started: false, reasons: ["実行可能状態と人間の明示操作が必要です"] });
    if (registry.approvalIds.has(record.approvalRecordId) || registry.executionIds.has(record.executionId) || registry.sourceRecordIds.has(record.sourceRecordId)) return freeze({ started: false, reasons: ["二重実行または同一sourceRecordIdの実行を拒否しました"] });
    const at = nowIso(options);
    registry.approvalIds.add(record.approvalRecordId); registry.executionIds.add(record.executionId); registry.sourceRecordIds.add(record.sourceRecordId);
    const started = { ...clone(record), executionStartedAt: at, executionStatus: "manual_formal_registration_execution_in_progress", nextState: "manual_formal_registration_execution_in_progress", updatedAt: at, stateTransitionHistory: [...addHistory(record, "manual_formal_registration_execution_started", operation, at), { from: "manual_formal_registration_execution_started", to: "manual_formal_registration_execution_in_progress", changedBy: operation.performedBy, changedAt: at, reason: "人間による正式登録実行開始" }] };
    return freeze({ started: true, record: started });
  }
  function recordFormalRegistrationItemResult(record, item, operation, options) {
    const reasons = [];
    if (!manual(operation) || !record || record.executionStatus !== "manual_formal_registration_execution_in_progress") reasons.push("進行中記録と人間の明示操作が必要です");
    for (const key of ["itemId", "sourceItemId", "targetRegistrationId", "registrationStatus"]) if (!clean(item && item[key])) reasons.push(`${key}が必要です`);
    if (item && !ITEM_STATES.includes(item.registrationStatus)) reasons.push("個別登録状態が不正です");
    if (record && record.itemResults.some(result => result.itemId === item.itemId || result.sourceItemId === item.sourceItemId || result.targetRegistrationId === item.targetRegistrationId)) reasons.push("同一対象の重複結果です");
    if (item && registry.targetIds.has(item.targetRegistrationId) && item.registrationStatus === "registered") reasons.push("同一対象データの重複正式登録です");
    if (reasons.length) return freeze({ recorded: false, reasons });
    const at = nowIso(options), duplicate = item.duplicateDetected === true || item.registrationStatus === "duplicate_rejected";
    const normalized = { itemId: item.itemId, sourceItemId: item.sourceItemId, targetRegistrationId: item.targetRegistrationId, registrationStatus: item.registrationStatus, registrationAttemptedAt: clean(item.registrationAttemptedAt) || at, registrationCompletedAt: clean(item.registrationCompletedAt) || at, success: item.registrationStatus === "registered" && item.success === true, failureCode: clean(item.failureCode), failureReason: clean(item.failureReason), skippedReason: clean(item.skippedReason), duplicateDetected: duplicate, duplicateReferenceId: clean(item.duplicateReferenceId), interruptionReason: clean(item.interruptionReason), cancellationReason: clean(item.cancellationReason), createdRecordReference: clean(item.createdRecordReference), beforeSnapshotReference: clean(item.beforeSnapshotReference), afterSnapshotReference: clean(item.afterSnapshotReference), rollbackCandidate: item.rollbackCandidate === true, rollbackCandidateReason: clean(item.rollbackCandidateReason), evidenceReferences: clone(item.evidenceReferences || []) };
    if (normalized.success) registry.targetIds.add(normalized.targetRegistrationId);
    return freeze({ recorded: true, record: { ...clone(record), itemResults: [...record.itemResults, normalized], updatedAt: at } });
  }
  function summarizeCounts(record) {
    const items = record.itemResults || [], expected = record.countSummary.expectedRegistrationCount;
    const count = status => items.filter(item => item.registrationStatus === status).length;
    const attempted = items.length, successful = items.filter(item => item.success).length, failed = count("failed") + count("abnormality_detected"), skipped = count("skipped") + count("duplicate_rejected"), duplicates = items.filter(item => item.duplicateDetected).length, interrupted = count("interrupted"), cancelled = count("cancelled"), rollback = items.filter(item => item.rollbackCandidate || item.success && (failed > 0 || interrupted > 0)).length;
    const processed = successful + failed + skipped + interrupted + cancelled, difference = expected - processed;
    return { expectedRegistrationCount: expected, attemptedRegistrationCount: attempted, successfulRegistrationCount: successful, failedRegistrationCount: failed, skippedRegistrationCount: skipped, duplicateDetectedCount: duplicates, interruptedRegistrationCount: interrupted, cancelledRegistrationCount: cancelled, rollbackCandidateCount: rollback, totalProcessedCount: processed, countDifference: difference, countConsistencyStatus: attempted === processed && difference === 0 ? "consistent" : "inconsistent" };
  }
  function buildRollbackCandidates(record, options) {
    const at = nowIso(options);
    return freeze((record.itemResults || []).filter(item => item.rollbackCandidate || item.success && record.itemResults.some(result => !result.success)).map((item, index) => ({ rollbackCandidateId: `rollback-${record.executionId}-${String(index + 1).padStart(4, "0")}`, targetRegistrationId: item.targetRegistrationId, rollbackCandidateReason: item.rollbackCandidateReason || "部分失敗または異常の人間レビュー", detectedAt: at, detectedBy: record.operatorName, beforeSnapshotReference: item.beforeSnapshotReference, afterSnapshotReference: item.afterSnapshotReference, impactSummary: "正式登録済み項目への影響を人間が確認", dependencySummary: "自動処理なし", recommendedHumanAction: "別フェーズでロールバック可否をレビュー", rollbackApprovalRequired: true, rollbackExecuted: false })));
  }
  function determineFormalRegistrationExecutionStatus(record) {
    const counts = summarizeCounts(record), items = record.itemResults || [];
    if (counts.countConsistencyStatus === "inconsistent") return "manual_formal_registration_execution_abnormality_detected";
    if (counts.interruptedRegistrationCount > 0) return "manual_formal_registration_execution_interrupted";
    if (counts.cancelledRegistrationCount > 0) return "manual_formal_registration_execution_cancelled";
    if (counts.successfulRegistrationCount > 0 && (counts.failedRegistrationCount > 0 || counts.skippedRegistrationCount > 0)) return "manual_formal_registration_execution_partially_failed";
    if (counts.failedRegistrationCount > 0 || counts.successfulRegistrationCount === 0) return "manual_formal_registration_execution_failed";
    if (items.every(item => item.success && clean(item.createdRecordReference) && item.evidenceReferences.length > 0)) return "manual_formal_registration_execution_completed";
    return "manual_formal_registration_execution_abnormality_detected";
  }
  function completeManualFormalRegistrationExecution(record, operation, options) {
    if (!manual(operation) || !record || record.executionStatus !== "manual_formal_registration_execution_in_progress") return freeze({ completed: false, reasons: ["進行中記録と人間の明示操作が必要です"] });
    const at = nowIso(options), counts = summarizeCounts(record), status = determineFormalRegistrationExecutionStatus(record), rollbacks = buildRollbackCandidates(record, options), success = status === "manual_formal_registration_execution_completed";
    const finalStatus = success ? "ready_for_manual_post_registration_verification" : status;
    const history = [...addHistory(record, status, operation, at), ...(success ? [{ from: status, to: finalStatus, changedBy: operation.performedBy, changedAt: at, reason: "正常完了後の人間による登録後検証待ち" }] : [])];
    const completed = { ...clone(record), executionCompletedAt: at, executionStatus: finalStatus, countSummary: { ...counts, rollbackCandidateCount: rollbacks.length }, rollbackCandidates: clone(rollbacks), resultSnapshot: { countSummary: counts, itemResults: clone(record.itemResults) }, partialFailureReason: status === "manual_formal_registration_execution_partially_failed" ? "一部成功・一部失敗またはスキップ" : "", rollbackPlanningRequired: rollbacks.length > 0, nextState: finalStatus, updatedAt: at, stateTransitionHistory: history };
    return freeze({ completed: true, success, partial: status === "manual_formal_registration_execution_partially_failed", record: completed });
  }
  function interruptManualFormalRegistrationExecution(record, reason, operation, options) { return terminal(record, "manual_formal_registration_execution_interrupted", "executionInterruptedAt", reason, operation, options); }
  function cancelManualFormalRegistrationExecution(record, reason, operation, options) { return terminal(record, "manual_formal_registration_execution_cancelled", "executionCancelledAt", reason, operation, options); }
  function detectFormalRegistrationExecutionAbnormality(record, reasons, operation, options) {
    if (!manual(operation) || !record || !Array.isArray(reasons) || reasons.length === 0) return freeze({ detected: false, reasons: ["異常理由と人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ detected: true, record: { ...clone(record), executionStatus: "manual_formal_registration_execution_abnormality_detected", abnormalitySummary: [...record.abnormalitySummary, ...clone(reasons)], executionCompletedAt: at, nextState: "manual_formal_registration_execution_abnormality_detected", updatedAt: at, stateTransitionHistory: addHistory(record, "manual_formal_registration_execution_abnormality_detected", operation, at) } });
  }
  function terminal(record, status, timeKey, reason, operation, options) {
    if (!manual(operation) || !record || !["ready_for_manual_post_import_formal_registration_execution", "manual_formal_registration_execution_started", "manual_formal_registration_execution_in_progress"].includes(record.executionStatus) || !clean(reason)) return freeze({ recorded: false, reasons: ["対象、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ recorded: true, record: { ...clone(record), executionStatus: status, [timeKey]: at, nextState: status, updatedAt: at, stateTransitionHistory: addHistory(record, status, operation, at) } });
  }
  function transition(record, nextState, operation, options) {
    if (!manual(operation)) return freeze({ transitioned: false, reason: "人間の明示操作が必要です", record });
    if (!(ALLOWED_TRANSITIONS[record.executionStatus] || []).includes(nextState)) return freeze({ transitioned: false, reason: "定義されていない状態遷移です", record });
    const at = nowIso(options);
    return freeze({ transitioned: true, record: { ...clone(record), executionStatus: nextState, nextState, updatedAt: at, stateTransitionHistory: addHistory(record, nextState, operation, at) } });
  }
  function transitionToPostRegistrationVerification(record, operation, options) {
    if (!record || record.executionStatus !== "manual_formal_registration_execution_completed") return freeze({ transitioned: false, reason: "正常完了記録だけが登録後検証へ進めます", record });
    return transition(record, "ready_for_manual_post_registration_verification", operation, options);
  }
  function getManualFormalRegistrationExecutionSafetyStatus() { return freeze(clone(SAFETY)); }
  function render(doc) { if (doc) { const node = doc.getElementById("phase2620-current-status"); if (node) node.textContent = "ready_for_manual_post_import_formal_registration_execution"; } }
  if (typeof document !== "undefined") { const start = () => render(document); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }
  return { PHASE2619_REFERENCE: phase2619, STATES, ITEM_STATES, ALLOWED_TRANSITIONS, SAFETY, executionId, validateFormalRegistrationExecutionEligibility, createManualPostImportFormalRegistrationExecution, startManualFormalRegistrationExecution, recordFormalRegistrationItemResult, summarizeCounts, buildRollbackCandidates, determineFormalRegistrationExecutionStatus, completeManualFormalRegistrationExecution, interruptManualFormalRegistrationExecution, cancelManualFormalRegistrationExecution, detectFormalRegistrationExecutionAbnormality, transitionToPostRegistrationVerification, getManualFormalRegistrationExecutionSafetyStatus, transition, resetRegistry, render };
});
