(function (root, factory) {
  const phase2614 = typeof module === "object" && module.exports
    ? require("./phase26-14-manual-post-import-verification-core.js")
    : root.HashimotoPhase2614ManualPostImportVerification;
  const api = factory(phase2614);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2615ManualPostImportVerificationDecision = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase2614) {
  "use strict";
  if (!phase2614) throw new Error("Phase26-14 definition is required");

  const STATES = Object.freeze([
    "ready_for_manual_post_import_verification_decision",
    "manual_post_import_verification_decision_started",
    "manual_post_import_verification_decision_in_progress",
    "manual_post_import_verified_result_accepted",
    "manual_post_import_verified_result_accepted_with_warnings",
    "manual_post_import_reconciliation_required",
    "manual_post_import_rollback_review_required",
    "manual_post_import_verification_decision_deferred",
    "manual_post_import_verification_decision_interrupted",
    "manual_post_import_verification_decision_cancelled",
    "ready_for_manual_post_import_acceptance_record",
    "ready_for_manual_post_import_reconciliation_planning",
    "ready_for_manual_post_import_rollback_review",
  ]);
  const DECISION_TYPES = Object.freeze(["accept", "accept_with_warnings", "reconciliation_required", "rollback_review_required", "defer", "interrupted", "cancelled"]);
  const RISK_LEVELS = Object.freeze(["none", "low", "medium", "high", "critical"]);
  const ALLOWED_TRANSITIONS = Object.freeze({
    ready_for_manual_post_import_verification_decision: ["manual_post_import_verification_decision_started", "manual_post_import_verification_decision_cancelled"],
    manual_post_import_verification_decision_started: ["manual_post_import_verification_decision_in_progress", "manual_post_import_verification_decision_interrupted", "manual_post_import_verification_decision_cancelled"],
    manual_post_import_verification_decision_in_progress: ["manual_post_import_verified_result_accepted", "manual_post_import_verified_result_accepted_with_warnings", "manual_post_import_reconciliation_required", "manual_post_import_rollback_review_required", "manual_post_import_verification_decision_deferred", "manual_post_import_verification_decision_interrupted", "manual_post_import_verification_decision_cancelled"],
    manual_post_import_verified_result_accepted: ["ready_for_manual_post_import_acceptance_record"],
    manual_post_import_verified_result_accepted_with_warnings: ["ready_for_manual_post_import_acceptance_record"],
    manual_post_import_reconciliation_required: ["ready_for_manual_post_import_reconciliation_planning"],
    manual_post_import_rollback_review_required: ["ready_for_manual_post_import_rollback_review"],
    manual_post_import_verification_decision_deferred: [],
    manual_post_import_verification_decision_interrupted: [],
    manual_post_import_verification_decision_cancelled: [],
    ready_for_manual_post_import_acceptance_record: [],
    ready_for_manual_post_import_reconciliation_planning: [],
    ready_for_manual_post_import_rollback_review: [],
  });
  const TYPE_STATE = Object.freeze({
    accept: ["manual_post_import_verified_result_accepted", "ready_for_manual_post_import_acceptance_record"],
    accept_with_warnings: ["manual_post_import_verified_result_accepted_with_warnings", "ready_for_manual_post_import_acceptance_record"],
    reconciliation_required: ["manual_post_import_reconciliation_required", "ready_for_manual_post_import_reconciliation_planning"],
    rollback_review_required: ["manual_post_import_rollback_review_required", "ready_for_manual_post_import_rollback_review"],
    defer: ["manual_post_import_verification_decision_deferred", "manual_post_import_verification_decision_deferred"],
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
  const registry = new Set();
  let sequence = 0;
  const clean = value => typeof value === "string" ? value.trim() : "";
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const integer = value => Number.isInteger(value) && value >= 0;
  const nowIso = options => new Date(options && typeof options.now === "function" ? options.now() : new Date()).toISOString();
  const manual = operation => Boolean(operation && clean(operation.performedBy) && clean(operation.reason) && operation.explicitConfirmation === true);
  const freeze = value => Object.freeze(value);

  function resetRegistry() { registry.clear(); sequence = 0; }
  function decisionRecordId(options) {
    sequence += 1;
    return `manual-post-import-verification-decision-${nowIso(options).replace(/\D/g, "").slice(0, 14)}-${String(sequence).padStart(5, "0")}`;
  }
  function unknownMappingCount(record) {
    const mapping = record && record.mappingVerification || {};
    return ["sourceOnlyCount", "destinationOnlyCount", "duplicateMappingCount", "missingMappingCount", "invalidMappingCount"].reduce((sum, key) => sum + (integer(mapping[key]) ? mapping[key] : 0), 0);
  }
  function validateTarget(target, existingRecords) {
    const value = target || {};
    const reasons = [];
    if (!value.phase2614VerificationRecordExists) reasons.push("Phase26-14の検証記録がありません");
    if (value.status !== "ready_for_manual_post_import_verification_decision") reasons.push("状態がready_for_manual_post_import_verification_decisionではありません");
    for (const key of ["verificationRecordId", "importBatchId", "candidateId"]) if (!clean(value[key])) reasons.push(`${key}がありません`);
    if (!clean(value.verifierName) && !clean(value.verifierId)) reasons.push("検証者が記録されていません");
    if (!clean(value.verificationStartedAt) || !clean(value.verificationCompletedAt)) reasons.push("検証開始日時または終了日時がありません");
    if (!clean(value.verificationResult)) reasons.push("検証結果がありません");
    for (const key of ["countVerification", "duplicateVerification", "missingVerification", "mappingVerification"]) if (!value[key] || typeof value[key] !== "object") reasons.push(`${key}がありません`);
    for (const key of ["warningCount", "errorCount", "criticalCount"]) if (!integer(value[key])) reasons.push(`${key}が記録されていません`);
    if (!Array.isArray(value.issues)) reasons.push("issue一覧がありません");
    if (value.protectedMode !== true || value.planOnly !== true) reasons.push("protectedModeまたはPLAN_ONLYの安全条件に違反しています");
    const existing = Array.isArray(existingRecords) ? existingRecords : [];
    if (registry.has(value.verificationRecordId) || existing.some(record => record && record.verificationRecordId === value.verificationRecordId)) reasons.push("同一verificationRecordIdの判定記録が既にあります");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function listEligibleTargets(records, existingRecords) {
    return freeze((Array.isArray(records) ? records : []).filter(record => record && record.status === "ready_for_manual_post_import_verification_decision").map(record => {
      const result = validateTarget(record, existingRecords);
      return { ...clone(record), decisionStartAllowed: result.valid, decisionStartBlockedReasons: result.reasons };
    }));
  }
  function startDecision(target, input, operation, options) {
    const checked = validateTarget(target, input && input.existingDecisionRecords);
    const reasons = [...checked.reasons];
    if (!manual(operation)) reasons.push("人間の明示操作が必要です");
    if (!clean(input && input.deciderName) && !clean(input && input.deciderId)) reasons.push("判定者が入力されていません");
    if (clean(input && input.confirmVerificationRecordId) !== clean(target && target.verificationRecordId)) reasons.push("verificationRecordIdの再確認が一致しません");
    if (clean(input && input.confirmImportBatchId) !== clean(target && target.importBatchId)) reasons.push("importBatchIdの再確認が一致しません");
    for (const key of ["decisionStartConfirmed", "noAutomaticCorrectionConfirmed", "noAutomaticReimportConfirmed", "noAutomaticRollbackConfirmed", "noAutomaticApplicationConfirmed", "noAutomaticLearningUpdateConfirmed"]) if (!input || input[key] !== true) reasons.push(`${key}の明示確認が必要です`);
    if (reasons.length) return freeze({ started: false, reasons });
    const at = nowIso(options);
    registry.add(target.verificationRecordId);
    return freeze({ started: true, record: {
      decisionRecordId: decisionRecordId(options),
      verificationRecordId: target.verificationRecordId,
      importBatchId: target.importBatchId,
      candidateId: target.candidateId,
      approvalRecordId: clean(target.approvalRecordId),
      sourceDataId: clean(target.sourceDataId),
      sourceDataName: clean(target.sourceDataName),
      sourceDataHash: clean(target.sourceDataHash),
      destinationType: clean(target.destinationType),
      destinationName: clean(target.destinationName),
      deciderId: clean(input.deciderId),
      deciderName: clean(input.deciderName),
      decisionStartedAt: at,
      decisionCompletedAt: "",
      status: "manual_post_import_verification_decision_in_progress",
      decisionType: "",
      decisionResult: "pending",
      decisionReason: "",
      decisionSummary: "",
      riskLevel: "",
      reviewedIssueIds: [],
      acceptedWarningIssueIds: [],
      unresolvedIssueIds: [],
      affectedRecordCount: 0,
      affectedDestinationRecordIds: [],
      warningAcceptanceReason: "",
      reconciliationReason: "",
      rollbackReviewReason: "",
      deferReason: "",
      missingInformation: [],
      interruptionReason: "",
      cancellationReason: "",
      businessImpact: "",
      dataImpact: "",
      followUpRequired: false,
      rollbackCandidateId: clean(target.rollbackCandidateId),
      reconciliationRequired: false,
      rollbackReviewRequired: false,
      warningCount: target.warningCount,
      errorCount: target.errorCount,
      criticalCount: target.criticalCount,
      duplicateCount: target.duplicateVerification.duplicateCount,
      missingCount: target.missingVerification.missingCount,
      unknownMappingCount: unknownMappingCount(target),
      nextState: "manual_post_import_verification_decision_in_progress",
      createdAt: at,
      updatedAt: at,
      stateHistory: [
        { from: "ready_for_manual_post_import_verification_decision", to: "manual_post_import_verification_decision_started", changedBy: operation.performedBy, changedAt: at, reason: operation.reason },
        { from: "manual_post_import_verification_decision_started", to: "manual_post_import_verification_decision_in_progress", changedBy: operation.performedBy, changedAt: at, reason: "手動判定開始" },
      ],
      ...clone(SAFETY),
    } });
  }
  function validateDecision(record, verification, input, operation) {
    const reasons = [];
    const type = clean(input && input.decisionType);
    if (!manual(operation) || !record || record.status !== "manual_post_import_verification_decision_in_progress") reasons.push("判定中の記録と人間の明示操作が必要です");
    if (!DECISION_TYPES.slice(0, 5).includes(type)) reasons.push("判定種別が不正です");
    if (!clean(input && input.decisionReason) || !clean(input && input.decisionSummary)) reasons.push("判定理由と概要が必要です");
    if (!RISK_LEVELS.includes(input && input.riskLevel)) reasons.push("riskLevelが不正です");
    const result = verification && verification.verificationResult;
    const severe = verification && (verification.criticalCount > 0 || verification.errorCount > 0 || verification.duplicateVerification && verification.duplicateVerification.hasCriticalDuplicate || verification.missingVerification && verification.missingVerification.hasCriticalMissing);
    if (type === "accept" && (result !== "manual_post_import_verification_passed" || severe || verification.warningCount > 0)) reasons.push("検証結果または問題件数により正常受理できません");
    if (type === "accept_with_warnings") {
      if (result !== "manual_post_import_verification_passed_with_warnings" || severe) reasons.push("検証結果または重大問題により警告付き受理できません");
      if (!clean(input.warningAcceptanceReason) || !Array.isArray(input.acceptedWarningIssueIds) || input.acceptedWarningIssueIds.length === 0 || !clean(input.humanComment)) reasons.push("警告付き受理のissue、理由、コメントが必要です");
    }
    if (type === "reconciliation_required" && (!clean(input.reconciliationReason) || !Array.isArray(input.reviewedIssueIds) || input.reviewedIssueIds.length === 0)) reasons.push("手動調整理由と対象issueが必要です");
    if (type === "rollback_review_required" && (!clean(input.rollbackReviewReason) || !clean(verification && verification.rollbackCandidateId) || !Array.isArray(input.reviewedIssueIds) || input.reviewedIssueIds.length === 0)) reasons.push("ロールバックレビュー理由、候補ID、対象issueが必要です");
    if (type === "defer" && (!clean(input.deferReason) || !Array.isArray(input.missingInformation) || input.missingInformation.length === 0)) reasons.push("保留理由と不足情報が必要です");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function finalizeDecision(record, verification, input, operation, options) {
    const checked = validateDecision(record, verification, input, operation);
    if (!checked.valid) return freeze({ finalized: false, reasons: checked.reasons });
    const type = input.decisionType;
    const [decisionState, nextState] = TYPE_STATE[type];
    const at = nowIso(options);
    return freeze({ finalized: true, record: {
      ...clone(record),
      decisionCompletedAt: at,
      status: nextState,
      decisionType: type,
      decisionResult: decisionState,
      decisionReason: clean(input.decisionReason),
      decisionSummary: clean(input.decisionSummary),
      riskLevel: input.riskLevel,
      reviewedIssueIds: clone(input.reviewedIssueIds || []),
      acceptedWarningIssueIds: clone(input.acceptedWarningIssueIds || []),
      unresolvedIssueIds: clone(input.unresolvedIssueIds || []),
      affectedRecordCount: integer(input.affectedRecordCount) ? input.affectedRecordCount : 0,
      affectedDestinationRecordIds: clone(input.affectedDestinationRecordIds || []),
      warningAcceptanceReason: clean(input.warningAcceptanceReason),
      reconciliationReason: clean(input.reconciliationReason),
      rollbackReviewReason: clean(input.rollbackReviewReason),
      deferReason: clean(input.deferReason),
      missingInformation: clone(input.missingInformation || []),
      businessImpact: clean(input.businessImpact),
      dataImpact: clean(input.dataImpact),
      followUpRequired: input.followUpRequired === true,
      humanComment: clean(input.humanComment),
      reconciliationRequired: type === "reconciliation_required",
      rollbackReviewRequired: type === "rollback_review_required",
      nextState,
      updatedAt: at,
      stateHistory: [...record.stateHistory, { from: record.status, to: decisionState, changedBy: operation.performedBy, changedAt: at, reason: input.decisionReason }, ...(decisionState === nextState ? [] : [{ from: decisionState, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: "人間による判定確定" }])],
    } });
  }
  function interruptDecision(record, input, operation, options) {
    if (!manual(operation) || !record || !["manual_post_import_verification_decision_started", "manual_post_import_verification_decision_in_progress"].includes(record.status) || !clean(input && input.interruptionReason)) return freeze({ interrupted: false, reasons: ["中断には判定中記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ interrupted: true, record: { ...clone(record), status: "manual_post_import_verification_decision_interrupted", decisionType: "interrupted", decisionResult: "manual_post_import_verification_decision_interrupted", interruptionReason: clean(input.interruptionReason), partialSelection: clone(input.partialSelection || {}), unreviewedIssueIds: clone(input.unreviewedIssueIds || []), safetyViolation: input.safetyViolation === true, restartAllowed: false, humanReconfirmationRequired: true, decisionCompletedAt: at, nextState: "manual_post_import_verification_decision_interrupted", updatedAt: at } });
  }
  function cancelDecision(targetOrRecord, input, operation, options) {
    if (!manual(operation) || !targetOrRecord || !["ready_for_manual_post_import_verification_decision", "manual_post_import_verification_decision_started", "manual_post_import_verification_decision_in_progress"].includes(targetOrRecord.status) || !clean(input && input.cancellationReason)) return freeze({ cancelled: false, reasons: ["取消には確定前記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    if (clean(targetOrRecord.verificationRecordId)) registry.add(targetOrRecord.verificationRecordId);
    return freeze({ cancelled: true, record: { ...clone(targetOrRecord), decisionRecordId: targetOrRecord.decisionRecordId || decisionRecordId(options), status: "manual_post_import_verification_decision_cancelled", decisionType: "cancelled", decisionResult: "manual_post_import_verification_decision_cancelled", cancelledBy: operation.performedBy, cancelledAt: at, cancellationReason: clean(input.cancellationReason), partialInput: clone(input.partialInput || {}), automaticRestartProhibited: true, decisionCompletedAt: at, nextState: "manual_post_import_verification_decision_cancelled", updatedAt: at, ...clone(SAFETY) } });
  }
  function transition(record, nextState, operation, options) {
    if (!manual(operation)) return freeze({ transitioned: false, reason: "人間の明示操作が必要です", record });
    if (!(ALLOWED_TRANSITIONS[record.status] || []).includes(nextState)) return freeze({ transitioned: false, reason: "定義されていない状態遷移です", record });
    const at = nowIso(options);
    return freeze({ transitioned: true, record: { ...clone(record), status: nextState, updatedAt: at, stateHistory: [...(record.stateHistory || []), { from: record.status, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }] } });
  }
  function render(doc) { if (doc) { const node = doc.getElementById("phase2615-current-status"); if (node) node.textContent = "ready_for_manual_post_import_verification_decision"; } }
  if (typeof document !== "undefined") { const start = () => render(document); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }
  return { PHASE2614_REFERENCE: phase2614, STATES, DECISION_TYPES, RISK_LEVELS, ALLOWED_TRANSITIONS, TYPE_STATE, SAFETY, decisionRecordId, unknownMappingCount, validateTarget, listEligibleTargets, startDecision, validateDecision, finalizeDecision, interruptDecision, cancelDecision, transition, resetRegistry, render };
});
