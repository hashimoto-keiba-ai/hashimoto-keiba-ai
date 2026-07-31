(function (root, factory) {
  const phase2616 = typeof module === "object" && module.exports
    ? require("./phase26-16-manual-post-import-acceptance-record-core.js")
    : root.HashimotoPhase2616ManualPostImportAcceptanceRecord;
  const api = factory(phase2616);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2617ManualPostImportAcceptanceApproval = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase2616) {
  "use strict";
  if (!phase2616) throw new Error("Phase26-16 definition is required");

  const STATES = Object.freeze([
    "ready_for_manual_post_import_acceptance_approval",
    "manual_post_import_acceptance_approval_started",
    "manual_post_import_acceptance_approval_in_progress",
    "manual_post_import_acceptance_approved",
    "manual_post_import_acceptance_conditionally_approved",
    "manual_post_import_acceptance_returned",
    "manual_post_import_acceptance_recheck_required",
    "manual_post_import_acceptance_approval_deferred",
    "manual_post_import_acceptance_approval_interrupted",
    "manual_post_import_acceptance_approval_cancelled",
    "ready_for_manual_post_import_formal_registration_preparation",
    "ready_for_manual_post_import_acceptance_record_revision",
    "ready_for_manual_post_import_acceptance_recheck",
  ]);
  const APPROVAL_TYPES = Object.freeze(["approve", "conditional_approve", "return_for_revision", "recheck_required", "defer", "interrupted", "cancelled"]);
  const ALLOWED_TRANSITIONS = Object.freeze({
    ready_for_manual_post_import_acceptance_approval: ["manual_post_import_acceptance_approval_started", "manual_post_import_acceptance_approval_cancelled"],
    manual_post_import_acceptance_approval_started: ["manual_post_import_acceptance_approval_in_progress", "manual_post_import_acceptance_approval_interrupted", "manual_post_import_acceptance_approval_cancelled"],
    manual_post_import_acceptance_approval_in_progress: ["manual_post_import_acceptance_approved", "manual_post_import_acceptance_conditionally_approved", "manual_post_import_acceptance_returned", "manual_post_import_acceptance_recheck_required", "manual_post_import_acceptance_approval_deferred", "manual_post_import_acceptance_approval_interrupted", "manual_post_import_acceptance_approval_cancelled"],
    manual_post_import_acceptance_approved: ["ready_for_manual_post_import_formal_registration_preparation"],
    manual_post_import_acceptance_conditionally_approved: ["ready_for_manual_post_import_formal_registration_preparation"],
    manual_post_import_acceptance_returned: ["ready_for_manual_post_import_acceptance_record_revision"],
    manual_post_import_acceptance_recheck_required: ["ready_for_manual_post_import_acceptance_recheck"],
    manual_post_import_acceptance_approval_deferred: [],
    manual_post_import_acceptance_approval_interrupted: [],
    manual_post_import_acceptance_approval_cancelled: [],
    ready_for_manual_post_import_formal_registration_preparation: [],
    ready_for_manual_post_import_acceptance_record_revision: [],
    ready_for_manual_post_import_acceptance_recheck: [],
  });
  const TYPE_STATE = Object.freeze({
    approve: ["manual_post_import_acceptance_approved", "ready_for_manual_post_import_formal_registration_preparation"],
    conditional_approve: ["manual_post_import_acceptance_conditionally_approved", "ready_for_manual_post_import_formal_registration_preparation"],
    return_for_revision: ["manual_post_import_acceptance_returned", "ready_for_manual_post_import_acceptance_record_revision"],
    recheck_required: ["manual_post_import_acceptance_recheck_required", "ready_for_manual_post_import_acceptance_recheck"],
    defer: ["manual_post_import_acceptance_approval_deferred", "manual_post_import_acceptance_approval_deferred"],
  });
  const SAFETY = Object.freeze({
    privateLocalOnly: true,
    planOnly: true,
    protectedMode: true,
    automaticFormalRegistrationPerformed: false,
    automaticOperationReflectionPerformed: false,
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
  function acceptanceApprovalRecordId(options) {
    sequence += 1;
    return `manual-post-import-acceptance-approval-${nowIso(options).replace(/\D/g, "").slice(0, 14)}-${String(sequence).padStart(5, "0")}`;
  }
  function validateTarget(target, existingRecords) {
    const value = target || {};
    const reasons = [];
    if (!value.phase2616AcceptanceRecordExists) reasons.push("Phase26-16の受理記録がありません");
    if (value.status !== "ready_for_manual_post_import_acceptance_approval") reasons.push("状態がready_for_manual_post_import_acceptance_approvalではありません");
    for (const key of ["acceptanceRecordId", "decisionRecordId", "verificationRecordId", "importBatchId", "candidateId"]) if (!clean(value[key])) reasons.push(`${key}がありません`);
    if (!["accepted", "accepted_with_warnings"].includes(value.acceptanceType)) reasons.push("受理記録種別がacceptedまたはaccepted_with_warningsではありません");
    if (!clean(value.recorderName) && !clean(value.recorderId)) reasons.push("受理記録作成者がありません");
    if (!clean(value.recordingStartedAt) || !clean(value.recordingCompletedAt)) reasons.push("受理記録開始日時または確定日時がありません");
    if (!clean(value.acceptanceReason) || !clean(value.acceptanceScope) || !clean(value.riskLevel)) reasons.push("受理理由、受理範囲またはriskLevelがありません");
    for (const key of ["acceptedRecordCount", "excludedRecordCount", "warningCount", "errorCount", "criticalCount"]) if (!integer(value[key])) reasons.push(`${key}が記録されていません`);
    for (const key of ["acceptedWarningIssueIds", "unresolvedIssueIds", "handoffConditions"]) if (!Array.isArray(value[key])) reasons.push(`${key}が記録されていません`);
    if (value.protectedMode !== true || value.planOnly !== true) reasons.push("protectedModeまたはPLAN_ONLYの安全条件に違反しています");
    const existing = Array.isArray(existingRecords) ? existingRecords : [];
    if (registry.has(value.acceptanceRecordId) || existing.some(record => record && record.acceptanceRecordId === value.acceptanceRecordId)) reasons.push("同一acceptanceRecordIdの承認記録が既にあります");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function listEligibleTargets(records, existingRecords) {
    return freeze((Array.isArray(records) ? records : []).filter(record => record && record.status === "ready_for_manual_post_import_acceptance_approval").map(record => {
      const result = validateTarget(record, existingRecords);
      return { ...clone(record), approvalStartAllowed: result.valid, approvalStartBlockedReasons: result.reasons };
    }));
  }
  function startApproval(target, input, operation, options) {
    const checked = validateTarget(target, input && input.existingApprovalRecords);
    const reasons = [...checked.reasons];
    if (!manual(operation)) reasons.push("人間の明示操作が必要です");
    if (!clean(input && input.approverName) && !clean(input && input.approverId)) reasons.push("承認者が入力されていません");
    if (clean(input && input.confirmAcceptanceRecordId) !== clean(target && target.acceptanceRecordId)) reasons.push("acceptanceRecordIdの再確認が一致しません");
    if (clean(input && input.confirmImportBatchId) !== clean(target && target.importBatchId)) reasons.push("importBatchIdの再確認が一致しません");
    for (const key of ["acceptanceRecordConfirmed", "warningsConfirmed", "unresolvedIssuesConfirmed", "handoffConditionsConfirmed", "noAutomaticFormalRegistrationConfirmed", "noAutomaticApplicationConfirmed", "noAutomaticLearningUpdateConfirmed", "noAutomaticRollbackConfirmed"]) if (!input || input[key] !== true) reasons.push(`${key}の明示確認が必要です`);
    if (reasons.length) return freeze({ started: false, reasons });
    const at = nowIso(options);
    registry.add(target.acceptanceRecordId);
    return freeze({ started: true, record: {
      acceptanceApprovalRecordId: acceptanceApprovalRecordId(options),
      acceptanceRecordId: target.acceptanceRecordId,
      decisionRecordId: target.decisionRecordId,
      verificationRecordId: target.verificationRecordId,
      importBatchId: target.importBatchId,
      candidateId: target.candidateId,
      approvalRecordId: clean(target.approvalRecordId),
      sourceDataId: clean(target.sourceDataId),
      sourceDataName: clean(target.sourceDataName),
      sourceDataHash: clean(target.sourceDataHash),
      destinationType: clean(target.destinationType),
      destinationName: clean(target.destinationName),
      approverId: clean(input.approverId),
      approverName: clean(input.approverName),
      approvalStartedAt: at,
      approvalCompletedAt: "",
      status: "manual_post_import_acceptance_approval_in_progress",
      approvalType: "",
      approvalResult: "pending",
      approvalReason: "",
      approvalSummary: "",
      approvalConditions: [],
      acceptedRisk: "",
      riskLevel: target.riskLevel,
      reviewedIssueIds: [],
      acceptedWarningIssueIds: clone(target.acceptedWarningIssueIds),
      unresolvedIssueIds: clone(target.unresolvedIssueIds),
      affectedRecordCount: target.acceptedRecordCount + target.excludedRecordCount,
      acceptedRecordCount: target.acceptedRecordCount,
      excludedRecordCount: target.excludedRecordCount,
      warningCount: target.warningCount,
      errorCount: target.errorCount,
      criticalCount: target.criticalCount,
      requiredFollowUp: false,
      requiredAdditionalReview: false,
      requiredDocuments: [],
      returnReason: "",
      recheckReason: "",
      deferReason: "",
      interruptionReason: "",
      cancellationReason: "",
      rollbackCandidateId: clean(target.rollbackCandidateId),
      nextState: "manual_post_import_acceptance_approval_in_progress",
      createdAt: at,
      updatedAt: at,
      stateHistory: [
        { from: "ready_for_manual_post_import_acceptance_approval", to: "manual_post_import_acceptance_approval_started", changedBy: operation.performedBy, changedAt: at, reason: operation.reason },
        { from: "manual_post_import_acceptance_approval_started", to: "manual_post_import_acceptance_approval_in_progress", changedBy: operation.performedBy, changedAt: at, reason: "手動承認開始" },
      ],
      ...clone(SAFETY),
    } });
  }
  function validateApproval(record, acceptance, input, operation) {
    const reasons = [];
    const type = clean(input && input.approvalType);
    if (!manual(operation) || !record || record.status !== "manual_post_import_acceptance_approval_in_progress") reasons.push("承認中の記録と人間の明示操作が必要です");
    if (!APPROVAL_TYPES.slice(0, 5).includes(type)) reasons.push("承認種別が不正です");
    if (!clean(input && input.approvalReason) || !clean(input && input.approvalSummary)) reasons.push("承認理由と概要が必要です");
    if (acceptance.acceptanceType === "accepted_with_warnings" && type === "approve") reasons.push("警告付き受理記録を無条件承認できません");
    if (acceptance.acceptanceType === "accepted" && type === "conditional_approve" && (!Array.isArray(input.newlyDetectedIssues) || input.newlyDetectedIssues.length === 0 || !clean(input.conditionReason))) reasons.push("acceptedの条件付き承認には新規issueと理由が必要です");
    const severe = acceptance.criticalCount > 0 || acceptance.errorCount > 0;
    if (["approve", "conditional_approve"].includes(type) && severe) reasons.push("criticalまたはerrorがあるため承認できません");
    if (type === "approve") {
      if (acceptance.acceptedRecordCount + acceptance.excludedRecordCount !== record.affectedRecordCount || !Array.isArray(acceptance.handoffConditions) || acceptance.handoffConditions.length === 0 || acceptance.requiredManualApproval !== true) reasons.push("受理範囲、件数、引継ぎ条件または人間承認が不十分です");
      if (acceptance.unresolvedIssueIds.length > 0 && (!Array.isArray(input.unresolvedIssueAssessments) || input.unresolvedIssueAssessments.length === 0)) reasons.push("未解決issueが承認に影響しない根拠が必要です");
    }
    if (type === "conditional_approve" && (!Array.isArray(input.approvalConditions) || input.approvalConditions.length === 0 || !clean(input.conditionReason) || !clean(input.acceptedRisk) || !Array.isArray(input.acceptedWarningIssueIds) || input.acceptedWarningIssueIds.length === 0 || input.requiredFollowUp !== true || !clean(input.followUpOwnerCandidate) || !clean(input.followUpActionCandidate) || !Array.isArray(input.prohibitedActionsUntilFollowUp) || input.prohibitedActionsUntilFollowUp.length === 0 || !clean(input.approverComment))) reasons.push("条件、risk、warning、follow-up、禁止処理、コメントが必要です");
    if (type === "return_for_revision" && (!clean(input.returnReason) || !Array.isArray(input.targetIssueIds) || input.targetIssueIds.length === 0)) reasons.push("差戻し理由と対象issueが必要です");
    if (type === "recheck_required" && (!clean(input.recheckReason) || !Array.isArray(input.targetIssueIds) || input.targetIssueIds.length === 0)) reasons.push("再確認理由と対象issueが必要です");
    if (type === "defer" && (!clean(input.deferReason) || !Array.isArray(input.missingInformation) || input.missingInformation.length === 0)) reasons.push("保留理由と不足情報が必要です");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function finalizeApproval(record, acceptance, input, operation, options) {
    const checked = validateApproval(record, acceptance, input, operation);
    if (!checked.valid) return freeze({ finalized: false, reasons: checked.reasons });
    const type = input.approvalType;
    const [approvalState, nextState] = TYPE_STATE[type];
    const at = nowIso(options);
    return freeze({ finalized: true, record: {
      ...clone(record),
      approvalCompletedAt: at,
      status: nextState,
      approvalType: type,
      approvalResult: approvalState,
      approvalReason: clean(input.approvalReason),
      approvalSummary: clean(input.approvalSummary),
      approvalConditions: clone(input.approvalConditions || []),
      conditionReason: clean(input.conditionReason),
      acceptedRisk: clean(input.acceptedRisk),
      reviewedIssueIds: clone(input.reviewedIssueIds || []),
      acceptedWarningIssueIds: clone(input.acceptedWarningIssueIds || []),
      unresolvedIssueIds: clone(input.unresolvedIssueIds || acceptance.unresolvedIssueIds),
      unresolvedIssueAssessments: clone(input.unresolvedIssueAssessments || []),
      affectedRecordCount: integer(input.affectedRecordCount) ? input.affectedRecordCount : record.affectedRecordCount,
      affectedDestinationRecordIds: clone(input.affectedDestinationRecordIds || []),
      approvalScope: clean(input.approvalScope),
      approvalExclusions: clone(input.approvalExclusions || []),
      businessImpact: clean(input.businessImpact),
      dataImpact: clean(input.dataImpact),
      requiredFollowUp: input.requiredFollowUp === true,
      followUpOwnerCandidate: clean(input.followUpOwnerCandidate),
      followUpActionCandidate: clean(input.followUpActionCandidate),
      followUpDueDateCandidate: clean(input.followUpDueDateCandidate),
      requiredAdditionalReview: input.requiredAdditionalReview === true,
      requiredDocuments: clone(input.requiredDocuments || []),
      prohibitedActionsUntilFollowUp: clone(input.prohibitedActionsUntilFollowUp || []),
      approverComment: clean(input.approverComment),
      humanComment: clean(input.humanComment),
      newlyDetectedIssues: clone(input.newlyDetectedIssues || []),
      returnReason: clean(input.returnReason),
      returnSummary: clean(input.returnSummary),
      targetIssueIds: clone(input.targetIssueIds || []),
      affectedRecordIds: clone(input.affectedRecordIds || []),
      insufficientFields: clone(input.insufficientFields || []),
      contradictoryFields: clone(input.contradictoryFields || []),
      requiredCorrections: clone(input.requiredCorrections || []),
      requiredAdditionalEvidence: clone(input.requiredAdditionalEvidence || []),
      recommendedRevisionScope: clean(input.recommendedRevisionScope),
      responsiblePersonCandidate: clean(input.responsiblePersonCandidate),
      automaticRevisionProhibited: true,
      automaticReturnExecutionProhibited: true,
      recheckReason: clean(input.recheckReason),
      missingInformation: clone(input.missingInformation || []),
      contradictoryRecords: clone(input.contradictoryRecords || []),
      requiredReviewAreas: clone(input.requiredReviewAreas || []),
      recommendedReviewPhase: clean(input.recommendedReviewPhase),
      requiredHumanReviewer: clean(input.requiredHumanReviewer),
      recheckConditions: clone(input.recheckConditions || []),
      automaticReturnProhibited: true,
      automaticCorrectionProhibited: true,
      deferReason: clean(input.deferReason),
      nextState,
      updatedAt: at,
      stateHistory: [...record.stateHistory, { from: record.status, to: approvalState, changedBy: operation.performedBy, changedAt: at, reason: input.approvalReason }, ...(approvalState === nextState ? [] : [{ from: approvalState, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: "人間による承認確定" }])],
    } });
  }
  function interruptApproval(record, input, operation, options) {
    if (!manual(operation) || !record || !["manual_post_import_acceptance_approval_started", "manual_post_import_acceptance_approval_in_progress"].includes(record.status) || !clean(input && input.interruptionReason)) return freeze({ interrupted: false, reasons: ["中断には承認中記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ interrupted: true, record: { ...clone(record), status: "manual_post_import_acceptance_approval_interrupted", approvalType: "interrupted", approvalResult: "manual_post_import_acceptance_approval_interrupted", interruptedBy: operation.performedBy, interruptedAt: at, interruptionReason: clean(input.interruptionReason), currentInputSnapshot: clone(input.currentInputSnapshot || {}), unresolvedChecks: clone(input.unresolvedChecks || []), safetyViolationDetected: input.safetyViolationDetected === true, resumeAllowed: false, manualReviewRequired: true, approvalCompletedAt: at, nextState: "manual_post_import_acceptance_approval_interrupted", updatedAt: at } });
  }
  function cancelApproval(targetOrRecord, input, operation, options) {
    if (!manual(operation) || !targetOrRecord || !["ready_for_manual_post_import_acceptance_approval", "manual_post_import_acceptance_approval_started", "manual_post_import_acceptance_approval_in_progress"].includes(targetOrRecord.status) || !clean(input && input.cancellationReason)) return freeze({ cancelled: false, reasons: ["取消には確定前記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    if (clean(targetOrRecord.acceptanceRecordId)) registry.add(targetOrRecord.acceptanceRecordId);
    return freeze({ cancelled: true, record: { ...clone(targetOrRecord), acceptanceApprovalRecordId: targetOrRecord.acceptanceApprovalRecordId || acceptanceApprovalRecordId(options), status: "manual_post_import_acceptance_approval_cancelled", approvalType: "cancelled", approvalResult: "manual_post_import_acceptance_approval_cancelled", cancelledBy: operation.performedBy, cancelledAt: at, cancellationReason: clean(input.cancellationReason), partialInput: clone(input.partialInput || {}), automaticRestartProhibited: true, approvalCompletedAt: at, nextState: "manual_post_import_acceptance_approval_cancelled", updatedAt: at, ...clone(SAFETY) } });
  }
  function transition(record, nextState, operation, options) {
    if (!manual(operation)) return freeze({ transitioned: false, reason: "人間の明示操作が必要です", record });
    if (!(ALLOWED_TRANSITIONS[record.status] || []).includes(nextState)) return freeze({ transitioned: false, reason: "定義されていない状態遷移です", record });
    const at = nowIso(options);
    return freeze({ transitioned: true, record: { ...clone(record), status: nextState, updatedAt: at, stateHistory: [...(record.stateHistory || []), { from: record.status, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }] } });
  }
  function render(doc) { if (doc) { const node = doc.getElementById("phase2617-current-status"); if (node) node.textContent = "ready_for_manual_post_import_acceptance_approval"; } }
  if (typeof document !== "undefined") { const start = () => render(document); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }
  return { PHASE2616_REFERENCE: phase2616, STATES, APPROVAL_TYPES, ALLOWED_TRANSITIONS, TYPE_STATE, SAFETY, acceptanceApprovalRecordId, validateTarget, listEligibleTargets, startApproval, validateApproval, finalizeApproval, interruptApproval, cancelApproval, transition, resetRegistry, render };
});
