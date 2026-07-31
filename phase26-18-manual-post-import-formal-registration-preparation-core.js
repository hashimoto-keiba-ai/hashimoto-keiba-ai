(function (root, factory) {
  const phase2617 = typeof module === "object" && module.exports
    ? require("./phase26-17-manual-post-import-acceptance-approval-core.js")
    : root.HashimotoPhase2617ManualPostImportAcceptanceApproval;
  const api = factory(phase2617);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2618ManualPostImportFormalRegistrationPreparation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase2617) {
  "use strict";
  if (!phase2617) throw new Error("Phase26-17 definition is required");

  const STATES = Object.freeze([
    "ready_for_manual_post_import_formal_registration_preparation",
    "manual_post_import_formal_registration_preparation_started",
    "manual_post_import_formal_registration_preparation_in_progress",
    "manual_post_import_formal_registration_preparation_completed",
    "manual_post_import_formal_registration_preparation_completed_with_conditions",
    "manual_post_import_formal_registration_preparation_recheck_required",
    "manual_post_import_formal_registration_preparation_deferred",
    "manual_post_import_formal_registration_preparation_interrupted",
    "manual_post_import_formal_registration_preparation_cancelled",
    "ready_for_manual_post_import_formal_registration_execution_approval",
    "ready_for_manual_post_import_acceptance_approval_recheck",
  ]);
  const PREPARATION_TYPES = Object.freeze(["prepared", "prepared_with_conditions", "recheck_required", "deferred", "interrupted", "cancelled"]);
  const MANUAL_REGISTRATION_MODES = Object.freeze(["manual_only", "manual_confirmed_execution_required"]);
  const ALLOWED_TRANSITIONS = Object.freeze({
    ready_for_manual_post_import_formal_registration_preparation: ["manual_post_import_formal_registration_preparation_started", "manual_post_import_formal_registration_preparation_cancelled"],
    manual_post_import_formal_registration_preparation_started: ["manual_post_import_formal_registration_preparation_in_progress", "manual_post_import_formal_registration_preparation_interrupted", "manual_post_import_formal_registration_preparation_cancelled"],
    manual_post_import_formal_registration_preparation_in_progress: ["manual_post_import_formal_registration_preparation_completed", "manual_post_import_formal_registration_preparation_completed_with_conditions", "manual_post_import_formal_registration_preparation_recheck_required", "manual_post_import_formal_registration_preparation_deferred", "manual_post_import_formal_registration_preparation_interrupted", "manual_post_import_formal_registration_preparation_cancelled"],
    manual_post_import_formal_registration_preparation_completed: ["ready_for_manual_post_import_formal_registration_execution_approval"],
    manual_post_import_formal_registration_preparation_completed_with_conditions: ["ready_for_manual_post_import_formal_registration_execution_approval"],
    manual_post_import_formal_registration_preparation_recheck_required: ["ready_for_manual_post_import_acceptance_approval_recheck"],
    manual_post_import_formal_registration_preparation_deferred: [],
    manual_post_import_formal_registration_preparation_interrupted: [],
    manual_post_import_formal_registration_preparation_cancelled: [],
    ready_for_manual_post_import_formal_registration_execution_approval: [],
    ready_for_manual_post_import_acceptance_approval_recheck: [],
  });
  const TYPE_STATE = Object.freeze({
    prepared: ["manual_post_import_formal_registration_preparation_completed", "ready_for_manual_post_import_formal_registration_execution_approval"],
    prepared_with_conditions: ["manual_post_import_formal_registration_preparation_completed_with_conditions", "ready_for_manual_post_import_formal_registration_execution_approval"],
    recheck_required: ["manual_post_import_formal_registration_preparation_recheck_required", "ready_for_manual_post_import_acceptance_approval_recheck"],
    deferred: ["manual_post_import_formal_registration_preparation_deferred", "manual_post_import_formal_registration_preparation_deferred"],
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
    automaticSchedulingEnabled: false,
    automaticNotificationEnabled: false,
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
  function formalRegistrationPreparationRecordId(options) {
    sequence += 1;
    return `manual-post-import-formal-registration-preparation-${nowIso(options).replace(/\D/g, "").slice(0, 14)}-${String(sequence).padStart(5, "0")}`;
  }
  function validateTarget(target, existingRecords) {
    const value = target || {};
    const reasons = [];
    if (!value.phase2617ApprovalRecordExists) reasons.push("Phase26-17の承認記録がありません");
    if (value.status !== "ready_for_manual_post_import_formal_registration_preparation") reasons.push("状態がready_for_manual_post_import_formal_registration_preparationではありません");
    for (const key of ["acceptanceApprovalRecordId", "acceptanceRecordId", "decisionRecordId", "verificationRecordId", "importBatchId", "candidateId"]) if (!clean(value[key])) reasons.push(`${key}がありません`);
    if (!["approve", "conditional_approve"].includes(value.approvalType)) reasons.push("承認種別がapproveまたはconditional_approveではありません");
    if (!clean(value.approverName) && !clean(value.approverId)) reasons.push("承認者が記録されていません");
    if (!clean(value.approvalStartedAt) || !clean(value.approvalCompletedAt) || !clean(value.approvalReason)) reasons.push("承認日時または承認理由がありません");
    for (const key of ["acceptedRecordCount", "excludedRecordCount", "warningCount", "errorCount", "criticalCount"]) if (!integer(value[key])) reasons.push(`${key}が記録されていません`);
    for (const key of ["acceptedWarningIssueIds", "unresolvedIssueIds"]) if (!Array.isArray(value[key])) reasons.push(`${key}が記録されていません`);
    if (!clean(value.riskLevel) || !clean(value.acceptanceScope) || !Array.isArray(value.handoffConditions)) reasons.push("riskLevel、受理範囲または引継ぎ条件がありません");
    if (value.protectedMode !== true || value.planOnly !== true) reasons.push("protectedModeまたはPLAN_ONLYの安全条件に違反しています");
    const existing = Array.isArray(existingRecords) ? existingRecords : [];
    if (registry.has(value.acceptanceApprovalRecordId) || existing.some(record => record && record.acceptanceApprovalRecordId === value.acceptanceApprovalRecordId)) reasons.push("同一acceptanceApprovalRecordIdの準備記録が既にあります");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function listEligibleTargets(records, existingRecords) {
    return freeze((Array.isArray(records) ? records : []).filter(record => record && record.status === "ready_for_manual_post_import_formal_registration_preparation").map(record => {
      const result = validateTarget(record, existingRecords);
      return { ...clone(record), preparationStartAllowed: result.valid, preparationStartBlockedReasons: result.reasons };
    }));
  }
  function startPreparation(target, input, operation, options) {
    const checked = validateTarget(target, input && input.existingPreparationRecords);
    const reasons = [...checked.reasons];
    if (!manual(operation)) reasons.push("人間の明示操作が必要です");
    if (!clean(input && input.recorderName) && !clean(input && input.recorderId)) reasons.push("準備記録作成者が入力されていません");
    if (clean(input && input.confirmAcceptanceApprovalRecordId) !== clean(target && target.acceptanceApprovalRecordId)) reasons.push("acceptanceApprovalRecordIdの再確認が一致しません");
    if (clean(input && input.confirmImportBatchId) !== clean(target && target.importBatchId)) reasons.push("importBatchIdの再確認が一致しません");
    for (const key of ["approvalConfirmed", "registrationScopeConfirmed", "warningsConfirmed", "unresolvedIssuesConfirmed", "approvalConditionsConfirmed", "noFormalRegistrationYetConfirmed", "noAutomaticApplicationConfirmed", "noAutomaticLearningUpdateConfirmed", "noAutomaticRollbackConfirmed"]) if (!input || input[key] !== true) reasons.push(`${key}の明示確認が必要です`);
    if (reasons.length) return freeze({ started: false, reasons });
    const at = nowIso(options);
    registry.add(target.acceptanceApprovalRecordId);
    return freeze({ started: true, record: {
      formalRegistrationPreparationRecordId: formalRegistrationPreparationRecordId(options),
      acceptanceApprovalRecordId: target.acceptanceApprovalRecordId,
      acceptanceRecordId: target.acceptanceRecordId,
      decisionRecordId: target.decisionRecordId,
      verificationRecordId: target.verificationRecordId,
      importBatchId: target.importBatchId,
      candidateId: target.candidateId,
      approvalRecordId: clean(target.approvalRecordId),
      sourceDataId: clean(target.sourceDataId),
      sourceDataName: clean(target.sourceDataName),
      sourceDataHash: clean(target.sourceDataHash),
      recorderId: clean(input.recorderId),
      recorderName: clean(input.recorderName),
      preparationStartedAt: at,
      preparationCompletedAt: "",
      status: "manual_post_import_formal_registration_preparation_in_progress",
      preparationType: "",
      preparationResult: "pending",
      registrationScope: "",
      plannedRegistrationRecordCount: 0,
      registrationSourceRecordIds: [],
      registrationDestinationRecordIds: [],
      excludedRegistrationRecordCount: 0,
      excludedRegistrationSourceRecordIds: [],
      excludedRegistrationDestinationRecordIds: [],
      registrationExclusionReasons: [],
      acceptedWarningIssueIds: clone(target.acceptedWarningIssueIds),
      unresolvedIssueIds: clone(target.unresolvedIssueIds),
      registrationConditions: [],
      requiredFollowUp: target.requiredFollowUp === true,
      requiredAdditionalReview: target.requiredAdditionalReview === true,
      prohibitedActions: clone(target.prohibitedActionsUntilFollowUp || []),
      warningCount: target.warningCount,
      errorCount: target.errorCount,
      criticalCount: target.criticalCount,
      rollbackCandidateId: clean(target.rollbackCandidateId),
      recheckReason: "",
      deferReason: "",
      interruptionReason: "",
      cancellationReason: "",
      nextState: "manual_post_import_formal_registration_preparation_in_progress",
      createdAt: at,
      updatedAt: at,
      stateHistory: [
        { from: "ready_for_manual_post_import_formal_registration_preparation", to: "manual_post_import_formal_registration_preparation_started", changedBy: operation.performedBy, changedAt: at, reason: operation.reason },
        { from: "manual_post_import_formal_registration_preparation_started", to: "manual_post_import_formal_registration_preparation_in_progress", changedBy: operation.performedBy, changedAt: at, reason: "手動準備開始" },
      ],
      ...clone(SAFETY),
    } });
  }
  function validatePreparation(record, approval, input, operation) {
    const reasons = [];
    const type = clean(input && input.preparationType);
    if (!manual(operation) || !record || record.status !== "manual_post_import_formal_registration_preparation_in_progress") reasons.push("準備中の記録と人間の明示操作が必要です");
    if (!PREPARATION_TYPES.slice(0, 4).includes(type)) reasons.push("準備結果種別が不正です");
    if (approval.approvalType === "approve" && type === "prepared_with_conditions") reasons.push("approveをprepared_with_conditionsへ変更できません");
    if (approval.approvalType === "conditional_approve" && type === "prepared") reasons.push("conditional_approveをpreparedへ変更できません");
    if (["prepared", "prepared_with_conditions"].includes(type)) {
      if (approval.criticalCount > 0 || approval.errorCount > 0) reasons.push("criticalまたはerrorがあるため準備完了できません");
      if (!clean(input.formalRegistrationScope) || !integer(input.plannedRegistrationRecordCount) || !integer(input.excludedRegistrationRecordCount)) reasons.push("登録範囲または件数が不正です");
      const total = input.plannedRegistrationRecordCount + input.excludedRegistrationRecordCount;
      if (total !== approval.acceptedRecordCount + approval.excludedRecordCount && !clean(input.registrationCountDifferenceReason)) reasons.push("受理件数との差異理由が必要です");
      for (const key of ["registrationDestinationType", "registrationDestinationName", "registrationDestinationIdentifier", "registrationMethod", "executorCandidateName", "executorRole"]) if (!clean(input[key])) reasons.push(`${key}が必要です`);
      if (!MANUAL_REGISTRATION_MODES.includes(input.registrationMode)) reasons.push("registrationModeは手動限定値が必要です");
      if (input.authorityConfirmed !== true || !clean(input.authorityConfirmationMethod) || !clean(input.authorityConfirmedBy) || !clean(input.authorityConfirmedAt) || input.humanExecutionRequired !== true) reasons.push("実行者候補の権限確認と人間実行条件が必要です");
      if (!Array.isArray(input.requiredDocumentIds) || !Array.isArray(input.requiredDocumentNames) || input.requiredDocumentIds.length === 0 || input.documentAvailabilityStatus !== "available" || Array.isArray(input.missingDocumentIds) && input.missingDocumentIds.length > 0 || input.auditTrailComplete !== true) reasons.push("必要書類または監査証跡が不足しています");
      const checks = input.preExecutionChecks || {};
      const requiredChecks = ["sourceDataIntegrityConfirmed", "destinationConfirmed", "registrationCountConfirmed", "exclusionRangeConfirmed", "acceptedWarningsConfirmed", "unresolvedIssuesConfirmed", "approvalConditionsConfirmed", "requiredDocumentsConfirmed", "backupPlanConfirmed", "rollbackCandidateConfirmed", "duplicatePreventionConfirmed", "executionWindowConfirmed", "executorAuthorityConfirmed", "manualExecutionConfirmationRequired", "finalPreExecutionReviewRequired"];
      const incompleteChecks = requiredChecks.filter(key => checks[key] !== true);
      if (type === "prepared" && incompleteChecks.length) reasons.push("実行前確認事項が未完了です");
      if (approval.unresolvedIssueIds.length > 0 && (!Array.isArray(input.unresolvedIssueHandling) || input.unresolvedIssueHandling.length === 0)) reasons.push("unresolvedIssueの扱いが必要です");
    }
    if (type === "prepared_with_conditions" && (!Array.isArray(input.registrationConditions) || input.registrationConditions.length === 0 || !clean(input.conditionReason) || !Array.isArray(input.inheritedApprovalConditions) || !Array.isArray(input.incompleteConditionIds) || !clean(input.conditionCompletionStatus) || input.requiredFollowUp !== true || !clean(input.followUpOwnerCandidate) || !clean(input.followUpActionCandidate) || !Array.isArray(input.prohibitedActionsUntilConditionCompletion) || input.prohibitedActionsUntilConditionCompletion.length === 0 || !clean(input.humanComment))) reasons.push("条件、follow-up、禁止事項、条件状態、コメントが必要です");
    if (type === "recheck_required" && (!clean(input.recheckReason) || !Array.isArray(input.targetIssueIds) || input.targetIssueIds.length === 0)) reasons.push("再確認理由と対象issueが必要です");
    if (type === "deferred" && (!clean(input.deferReason) || !Array.isArray(input.missingInformation) || input.missingInformation.length === 0)) reasons.push("保留理由と不足情報が必要です");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function finalizePreparation(record, approval, input, operation, options) {
    const checked = validatePreparation(record, approval, input, operation);
    if (!checked.valid) return freeze({ finalized: false, reasons: checked.reasons });
    const type = input.preparationType;
    const [preparationState, nextState] = TYPE_STATE[type];
    const at = nowIso(options);
    return freeze({ finalized: true, record: {
      ...clone(record),
      preparationCompletedAt: at,
      status: nextState,
      preparationType: type,
      preparationResult: preparationState,
      registrationScope: clean(input.formalRegistrationScope),
      plannedRegistrationRecordCount: integer(input.plannedRegistrationRecordCount) ? input.plannedRegistrationRecordCount : 0,
      registrationSourceRecordIds: clone(input.registrationSourceRecordIds || []),
      registrationDestinationRecordIds: clone(input.registrationDestinationRecordIds || []),
      excludedRegistrationRecordCount: integer(input.excludedRegistrationRecordCount) ? input.excludedRegistrationRecordCount : 0,
      excludedRegistrationSourceRecordIds: clone(input.excludedRegistrationSourceRecordIds || []),
      excludedRegistrationDestinationRecordIds: clone(input.excludedRegistrationDestinationRecordIds || []),
      registrationExclusionReasons: clone(input.registrationExclusionReasons || []),
      registrationStartBoundary: clean(input.registrationStartBoundary),
      registrationEndBoundary: clean(input.registrationEndBoundary),
      affectedBusinessKeys: clone(input.affectedBusinessKeys || []),
      registrationTargetName: clean(input.registrationTargetName),
      dataCategory: clean(input.dataCategory),
      registrationCountDifferenceReason: clean(input.registrationCountDifferenceReason),
      registrationDestinationType: clean(input.registrationDestinationType),
      registrationDestinationName: clean(input.registrationDestinationName),
      registrationDestinationIdentifier: clean(input.registrationDestinationIdentifier),
      registrationMethod: clean(input.registrationMethod),
      registrationMode: input.registrationMode,
      duplicateHandlingPolicy: clean(input.duplicateHandlingPolicy),
      conflictHandlingPolicy: clean(input.conflictHandlingPolicy),
      existingRecordHandlingPolicy: clean(input.existingRecordHandlingPolicy),
      registrationOrder: clone(input.registrationOrder || []),
      validationRequiredBeforeExecution: input.validationRequiredBeforeExecution === true,
      backupRequiredBeforeExecution: input.backupRequiredBeforeExecution === true,
      rollbackCandidateRequired: input.rollbackCandidateRequired === true,
      registrationNotes: clean(input.registrationNotes),
      executorCandidateId: clean(input.executorCandidateId),
      executorCandidateName: clean(input.executorCandidateName),
      executorRole: clean(input.executorRole),
      authorityConfirmed: input.authorityConfirmed === true,
      authorityConfirmationMethod: clean(input.authorityConfirmationMethod),
      authorityConfirmedBy: clean(input.authorityConfirmedBy),
      authorityConfirmedAt: clean(input.authorityConfirmedAt),
      executionResponsibility: clean(input.executionResponsibility),
      secondaryReviewerCandidate: clean(input.secondaryReviewerCandidate),
      separationOfDutiesConfirmed: input.separationOfDutiesConfirmed === true,
      humanExecutionRequired: true,
      preExecutionChecks: clone(input.preExecutionChecks || {}),
      registrationConditions: clone(input.registrationConditions || []),
      conditionReason: clean(input.conditionReason),
      inheritedApprovalConditions: clone(input.inheritedApprovalConditions || []),
      incompleteConditionIds: clone(input.incompleteConditionIds || []),
      conditionCompletionStatus: clean(input.conditionCompletionStatus),
      unresolvedIssueHandling: clone(input.unresolvedIssueHandling || []),
      requiredFollowUp: input.requiredFollowUp === true,
      followUpOwnerCandidate: clean(input.followUpOwnerCandidate),
      followUpActionCandidate: clean(input.followUpActionCandidate),
      followUpDueDateCandidate: clean(input.followUpDueDateCandidate),
      requiredAdditionalReview: input.requiredAdditionalReview === true,
      requiredDocuments: clone(input.requiredDocuments || []),
      prohibitedActionsUntilConditionCompletion: clone(input.prohibitedActionsUntilConditionCompletion || []),
      humanComment: clean(input.humanComment),
      requiredDocumentIds: clone(input.requiredDocumentIds || []),
      requiredDocumentNames: clone(input.requiredDocumentNames || []),
      documentAvailabilityStatus: clean(input.documentAvailabilityStatus),
      missingDocumentIds: clone(input.missingDocumentIds || []),
      documentReviewedBy: clean(input.documentReviewedBy),
      documentReviewedAt: clean(input.documentReviewedAt),
      approvalEvidenceIds: clone(input.approvalEvidenceIds || []),
      verificationEvidenceIds: clone(input.verificationEvidenceIds || []),
      importExecutionEvidenceIds: clone(input.importExecutionEvidenceIds || []),
      auditTrailComplete: input.auditTrailComplete === true,
      evidenceNotes: clean(input.evidenceNotes),
      plannedExecutionDateCandidate: clean(input.plannedExecutionDateCandidate),
      plannedExecutionTimeCandidate: clean(input.plannedExecutionTimeCandidate),
      executionWindowCandidate: clean(input.executionWindowCandidate),
      estimatedDuration: clean(input.estimatedDuration),
      executionEnvironment: clean(input.executionEnvironment),
      requiredPersonnel: clone(input.requiredPersonnel || []),
      requiredReviewers: clone(input.requiredReviewers || []),
      executionDependencies: clone(input.executionDependencies || []),
      executionBlockers: clone(input.executionBlockers || []),
      recheckReason: clean(input.recheckReason),
      targetIssueIds: clone(input.targetIssueIds || []),
      missingInformation: clone(input.missingInformation || []),
      contradictoryRecords: clone(input.contradictoryRecords || []),
      registrationScopeMismatch: input.registrationScopeMismatch === true,
      registrationCountMismatch: input.registrationCountMismatch === true,
      destinationUncertainty: input.destinationUncertainty === true,
      authorityUncertainty: input.authorityUncertainty === true,
      requiredReviewAreas: clone(input.requiredReviewAreas || []),
      recommendedReviewPhase: clean(input.recommendedReviewPhase),
      requiredHumanReviewer: clean(input.requiredHumanReviewer),
      automaticReturnProhibited: true,
      automaticCorrectionProhibited: true,
      deferReason: clean(input.deferReason),
      nextState,
      updatedAt: at,
      stateHistory: [...record.stateHistory, { from: record.status, to: preparationState, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }, ...(preparationState === nextState ? [] : [{ from: preparationState, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: "人間による準備確定" }])],
    } });
  }
  function interruptPreparation(record, input, operation, options) {
    if (!manual(operation) || !record || !["manual_post_import_formal_registration_preparation_started", "manual_post_import_formal_registration_preparation_in_progress"].includes(record.status) || !clean(input && input.interruptionReason)) return freeze({ interrupted: false, reasons: ["中断には準備中記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ interrupted: true, record: { ...clone(record), status: "manual_post_import_formal_registration_preparation_interrupted", preparationType: "interrupted", preparationResult: "manual_post_import_formal_registration_preparation_interrupted", interruptedBy: operation.performedBy, interruptedAt: at, interruptionReason: clean(input.interruptionReason), currentInputSnapshot: clone(input.currentInputSnapshot || {}), unresolvedChecks: clone(input.unresolvedChecks || []), safetyViolationDetected: input.safetyViolationDetected === true, resumeAllowed: false, manualReviewRequired: true, preparationCompletedAt: at, nextState: "manual_post_import_formal_registration_preparation_interrupted", updatedAt: at } });
  }
  function cancelPreparation(targetOrRecord, input, operation, options) {
    if (!manual(operation) || !targetOrRecord || !["ready_for_manual_post_import_formal_registration_preparation", "manual_post_import_formal_registration_preparation_started", "manual_post_import_formal_registration_preparation_in_progress"].includes(targetOrRecord.status) || !clean(input && input.cancellationReason)) return freeze({ cancelled: false, reasons: ["取消には確定前記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    if (clean(targetOrRecord.acceptanceApprovalRecordId)) registry.add(targetOrRecord.acceptanceApprovalRecordId);
    return freeze({ cancelled: true, record: { ...clone(targetOrRecord), formalRegistrationPreparationRecordId: targetOrRecord.formalRegistrationPreparationRecordId || formalRegistrationPreparationRecordId(options), status: "manual_post_import_formal_registration_preparation_cancelled", preparationType: "cancelled", preparationResult: "manual_post_import_formal_registration_preparation_cancelled", cancelledBy: operation.performedBy, cancelledAt: at, cancellationReason: clean(input.cancellationReason), partialInput: clone(input.partialInput || {}), automaticRestartProhibited: true, preparationCompletedAt: at, nextState: "manual_post_import_formal_registration_preparation_cancelled", updatedAt: at, ...clone(SAFETY) } });
  }
  function transition(record, nextState, operation, options) {
    if (!manual(operation)) return freeze({ transitioned: false, reason: "人間の明示操作が必要です", record });
    if (!(ALLOWED_TRANSITIONS[record.status] || []).includes(nextState)) return freeze({ transitioned: false, reason: "定義されていない状態遷移です", record });
    const at = nowIso(options);
    return freeze({ transitioned: true, record: { ...clone(record), status: nextState, updatedAt: at, stateHistory: [...(record.stateHistory || []), { from: record.status, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }] } });
  }
  function render(doc) { if (doc) { const node = doc.getElementById("phase2618-current-status"); if (node) node.textContent = "ready_for_manual_post_import_formal_registration_preparation"; } }
  if (typeof document !== "undefined") { const start = () => render(document); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }
  return { PHASE2617_REFERENCE: phase2617, STATES, PREPARATION_TYPES, MANUAL_REGISTRATION_MODES, ALLOWED_TRANSITIONS, TYPE_STATE, SAFETY, formalRegistrationPreparationRecordId, validateTarget, listEligibleTargets, startPreparation, validatePreparation, finalizePreparation, interruptPreparation, cancelPreparation, transition, resetRegistry, render };
});
