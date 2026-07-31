(function (root, factory) {
  const phase2618 = typeof module === "object" && module.exports
    ? require("./phase26-18-manual-post-import-formal-registration-preparation-core.js")
    : root.HashimotoPhase2618ManualPostImportFormalRegistrationPreparation;
  const api = factory(phase2618);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2619ManualPostImportFormalRegistrationExecutionApproval = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase2618) {
  "use strict";
  if (!phase2618) throw new Error("Phase26-18 definition is required");

  const STATES = Object.freeze([
    "ready_for_manual_post_import_formal_registration_execution_approval",
    "manual_post_import_formal_registration_execution_approval_started",
    "manual_post_import_formal_registration_execution_approval_in_progress",
    "manual_post_import_formal_registration_execution_approved",
    "manual_post_import_formal_registration_execution_conditionally_approved",
    "manual_post_import_formal_registration_execution_returned",
    "manual_post_import_formal_registration_execution_recheck_required",
    "manual_post_import_formal_registration_execution_approval_deferred",
    "manual_post_import_formal_registration_execution_approval_interrupted",
    "manual_post_import_formal_registration_execution_approval_cancelled",
    "ready_for_manual_post_import_formal_registration_execution",
    "ready_for_manual_post_import_formal_registration_preparation_revision",
    "ready_for_manual_post_import_formal_registration_preparation_recheck",
  ]);
  const APPROVAL_TYPES = Object.freeze(["approve_execution", "conditional_approve_execution", "return_for_preparation_revision", "recheck_required", "defer", "interrupted", "cancelled"]);
  const MANUAL_REGISTRATION_MODES = Object.freeze(["manual_only", "manual_confirmed_execution_required"]);
  const ALLOWED_TRANSITIONS = Object.freeze({
    ready_for_manual_post_import_formal_registration_execution_approval: ["manual_post_import_formal_registration_execution_approval_started", "manual_post_import_formal_registration_execution_approval_cancelled"],
    manual_post_import_formal_registration_execution_approval_started: ["manual_post_import_formal_registration_execution_approval_in_progress", "manual_post_import_formal_registration_execution_approval_interrupted", "manual_post_import_formal_registration_execution_approval_cancelled"],
    manual_post_import_formal_registration_execution_approval_in_progress: ["manual_post_import_formal_registration_execution_approved", "manual_post_import_formal_registration_execution_conditionally_approved", "manual_post_import_formal_registration_execution_returned", "manual_post_import_formal_registration_execution_recheck_required", "manual_post_import_formal_registration_execution_approval_deferred", "manual_post_import_formal_registration_execution_approval_interrupted", "manual_post_import_formal_registration_execution_approval_cancelled"],
    manual_post_import_formal_registration_execution_approved: ["ready_for_manual_post_import_formal_registration_execution"],
    manual_post_import_formal_registration_execution_conditionally_approved: ["ready_for_manual_post_import_formal_registration_execution"],
    manual_post_import_formal_registration_execution_returned: ["ready_for_manual_post_import_formal_registration_preparation_revision"],
    manual_post_import_formal_registration_execution_recheck_required: ["ready_for_manual_post_import_formal_registration_preparation_recheck"],
    manual_post_import_formal_registration_execution_approval_deferred: [],
    manual_post_import_formal_registration_execution_approval_interrupted: [],
    manual_post_import_formal_registration_execution_approval_cancelled: [],
    ready_for_manual_post_import_formal_registration_execution: [],
    ready_for_manual_post_import_formal_registration_preparation_revision: [],
    ready_for_manual_post_import_formal_registration_preparation_recheck: [],
  });
  const TYPE_STATE = Object.freeze({
    approve_execution: ["manual_post_import_formal_registration_execution_approved", "ready_for_manual_post_import_formal_registration_execution"],
    conditional_approve_execution: ["manual_post_import_formal_registration_execution_conditionally_approved", "ready_for_manual_post_import_formal_registration_execution"],
    return_for_preparation_revision: ["manual_post_import_formal_registration_execution_returned", "ready_for_manual_post_import_formal_registration_preparation_revision"],
    recheck_required: ["manual_post_import_formal_registration_execution_recheck_required", "ready_for_manual_post_import_formal_registration_preparation_recheck"],
    defer: ["manual_post_import_formal_registration_execution_approval_deferred", "manual_post_import_formal_registration_execution_approval_deferred"],
  });
  const SAFETY = Object.freeze({
    privateLocalOnly: true,
    planOnly: true,
    protectedMode: true,
    automaticFormalRegistrationPerformed: false,
    automaticFormalRegistrationStartPerformed: false,
    automaticOperationReflectionPerformed: false,
    automaticCorrectionPerformed: false,
    automaticDeletionPerformed: false,
    automaticRetryPerformed: false,
    automaticReimportPerformed: false,
    automaticRollbackPerformed: false,
    automaticApplicationPerformed: false,
    automaticLearningUpdatePerformed: false,
    automaticSchedulingPerformed: false,
    automaticNotificationPerformed: false,
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
  function formalRegistrationExecutionApprovalRecordId(options) {
    sequence += 1;
    return `manual-post-import-formal-registration-execution-approval-${nowIso(options).replace(/\D/g, "").slice(0, 14)}-${String(sequence).padStart(5, "0")}`;
  }
  function validateTarget(target, existingRecords) {
    const value = target || {};
    const reasons = [];
    if (!value.phase2618PreparationRecordExists) reasons.push("Phase26-18の正式登録準備記録がありません");
    if (value.status !== "ready_for_manual_post_import_formal_registration_execution_approval") reasons.push("状態がready_for_manual_post_import_formal_registration_execution_approvalではありません");
    for (const key of ["formalRegistrationPreparationRecordId", "acceptanceApprovalRecordId", "acceptanceRecordId", "decisionRecordId", "verificationRecordId", "importBatchId", "candidateId"]) if (!clean(value[key])) reasons.push(`${key}がありません`);
    if (!["prepared", "prepared_with_conditions"].includes(value.preparationType)) reasons.push("準備結果種別がpreparedまたはprepared_with_conditionsではありません");
    if (!clean(value.recorderName) && !clean(value.recorderId)) reasons.push("準備記録作成者がありません");
    if (!clean(value.preparationStartedAt) || !clean(value.preparationCompletedAt)) reasons.push("準備開始日時または確定日時がありません");
    if (!clean(value.registrationScope) || !integer(value.plannedRegistrationRecordCount) || !integer(value.excludedRegistrationRecordCount)) reasons.push("登録範囲または件数がありません");
    if (!clean(value.registrationDestinationType) || !clean(value.registrationDestinationName) || !MANUAL_REGISTRATION_MODES.includes(value.registrationMode)) reasons.push("登録先または手動限定registrationModeがありません");
    if (!clean(value.executorCandidateName) || value.authorityConfirmed !== true) reasons.push("実行者候補または権限確認がありません");
    if (!Array.isArray(value.requiredDocumentIds) || !Array.isArray(value.missingDocumentIds) || !value.preExecutionChecks) reasons.push("必要書類または実行前確認事項がありません");
    for (const key of ["warningCount", "errorCount", "criticalCount"]) if (!integer(value[key])) reasons.push(`${key}が記録されていません`);
    for (const key of ["acceptedWarningIssueIds", "unresolvedIssueIds"]) if (!Array.isArray(value[key])) reasons.push(`${key}が記録されていません`);
    if (value.protectedMode !== true || value.planOnly !== true) reasons.push("protectedModeまたはPLAN_ONLYの安全条件に違反しています");
    const existing = Array.isArray(existingRecords) ? existingRecords : [];
    if (registry.has(value.formalRegistrationPreparationRecordId) || existing.some(record => record && record.formalRegistrationPreparationRecordId === value.formalRegistrationPreparationRecordId)) reasons.push("同一formalRegistrationPreparationRecordIdの承認記録が既にあります");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function listEligibleTargets(records, existingRecords) {
    return freeze((Array.isArray(records) ? records : []).filter(record => record && record.status === "ready_for_manual_post_import_formal_registration_execution_approval").map(record => {
      const result = validateTarget(record, existingRecords);
      return { ...clone(record), approvalStartAllowed: result.valid, approvalStartBlockedReasons: result.reasons };
    }));
  }
  function startApproval(target, input, operation, options) {
    const checked = validateTarget(target, input && input.existingApprovalRecords);
    const reasons = [...checked.reasons];
    if (!manual(operation)) reasons.push("人間の明示操作が必要です");
    if (!clean(input && input.approverName) && !clean(input && input.approverId)) reasons.push("承認者が入力されていません");
    if (clean(input && input.confirmPreparationRecordId) !== clean(target && target.formalRegistrationPreparationRecordId)) reasons.push("formalRegistrationPreparationRecordIdの再確認が一致しません");
    if (clean(input && input.confirmImportBatchId) !== clean(target && target.importBatchId)) reasons.push("importBatchIdの再確認が一致しません");
    for (const key of ["preparationConfirmed", "registrationScopeConfirmed", "registrationCountConfirmed", "destinationConfirmed", "executorAuthorityConfirmed", "documentsConfirmed", "preExecutionChecksConfirmed", "warningsConfirmed", "unresolvedIssuesConfirmed", "noFormalRegistrationYetConfirmed", "noAutomaticApplicationConfirmed", "noAutomaticLearningUpdateConfirmed", "noAutomaticRollbackConfirmed"]) if (!input || input[key] !== true) reasons.push(`${key}の明示確認が必要です`);
    if (reasons.length) return freeze({ started: false, reasons });
    const at = nowIso(options);
    registry.add(target.formalRegistrationPreparationRecordId);
    return freeze({ started: true, record: {
      formalRegistrationExecutionApprovalRecordId: formalRegistrationExecutionApprovalRecordId(options),
      formalRegistrationPreparationRecordId: target.formalRegistrationPreparationRecordId,
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
      approverId: clean(input.approverId),
      approverName: clean(input.approverName),
      approvalStartedAt: at,
      approvalCompletedAt: "",
      status: "manual_post_import_formal_registration_execution_approval_in_progress",
      approvalType: "",
      approvalResult: "pending",
      executionApprovalReason: "",
      executionApprovalSummary: "",
      executionApprovalConditions: [],
      acceptedRisk: "",
      riskLevel: clean(target.riskLevel),
      reviewedIssueIds: [],
      acceptedWarningIssueIds: clone(target.acceptedWarningIssueIds),
      unresolvedIssueIds: clone(target.unresolvedIssueIds),
      affectedRecordCount: target.plannedRegistrationRecordCount + target.excludedRegistrationRecordCount,
      plannedRegistrationRecordCount: target.plannedRegistrationRecordCount,
      excludedRegistrationRecordCount: target.excludedRegistrationRecordCount,
      registrationDestinationType: target.registrationDestinationType,
      registrationDestinationName: target.registrationDestinationName,
      registrationDestinationIdentifier: clean(target.registrationDestinationIdentifier),
      registrationMethod: clean(target.registrationMethod),
      registrationMode: target.registrationMode,
      duplicateHandlingPolicy: clean(target.duplicateHandlingPolicy),
      conflictHandlingPolicy: clean(target.conflictHandlingPolicy),
      existingRecordHandlingPolicy: clean(target.existingRecordHandlingPolicy),
      executorCandidateId: clean(target.executorCandidateId),
      executorCandidateName: clean(target.executorCandidateName),
      executorRole: clean(target.executorRole),
      authorityConfirmed: target.authorityConfirmed === true,
      separationOfDutiesConfirmed: target.separationOfDutiesConfirmed === true,
      requiredDocumentIds: clone(target.requiredDocumentIds),
      missingDocumentIds: clone(target.missingDocumentIds),
      preExecutionChecks: clone(target.preExecutionChecks),
      requiredFollowUp: target.requiredFollowUp === true,
      requiredAdditionalReview: target.requiredAdditionalReview === true,
      warningCount: target.warningCount,
      errorCount: target.errorCount,
      criticalCount: target.criticalCount,
      rollbackCandidateId: clean(target.rollbackCandidateId),
      returnReason: "",
      recheckReason: "",
      deferReason: "",
      interruptionReason: "",
      cancellationReason: "",
      nextState: "manual_post_import_formal_registration_execution_approval_in_progress",
      createdAt: at,
      updatedAt: at,
      stateHistory: [
        { from: "ready_for_manual_post_import_formal_registration_execution_approval", to: "manual_post_import_formal_registration_execution_approval_started", changedBy: operation.performedBy, changedAt: at, reason: operation.reason },
        { from: "manual_post_import_formal_registration_execution_approval_started", to: "manual_post_import_formal_registration_execution_approval_in_progress", changedBy: operation.performedBy, changedAt: at, reason: "手動実行承認開始" },
      ],
      ...clone(SAFETY),
    } });
  }
  function validateApproval(record, preparation, input, operation) {
    const reasons = [];
    const type = clean(input && input.approvalType);
    if (!manual(operation) || !record || record.status !== "manual_post_import_formal_registration_execution_approval_in_progress") reasons.push("承認中の記録と人間の明示操作が必要です");
    if (!APPROVAL_TYPES.slice(0, 5).includes(type)) reasons.push("承認種別が不正です");
    if (!clean(input && input.executionApprovalReason) || !clean(input && input.executionApprovalSummary)) reasons.push("実行承認理由と概要が必要です");
    if (preparation.preparationType === "prepared_with_conditions" && type === "approve_execution") reasons.push("条件付き準備を無条件実行承認できません");
    if (preparation.preparationType === "prepared" && type === "conditional_approve_execution" && (!Array.isArray(input.newlyDetectedIssues) || input.newlyDetectedIssues.length === 0 || !clean(input.conditionReason))) reasons.push("preparedの条件付き実行承認には新規issueと理由が必要です");
    const severe = preparation.criticalCount > 0 || preparation.errorCount > 0;
    if (["approve_execution", "conditional_approve_execution"].includes(type) && severe) reasons.push("criticalまたはerrorがあるため実行承認できません");
    if (["approve_execution", "conditional_approve_execution"].includes(type)) {
      if (!clean(preparation.registrationScope) || record.plannedRegistrationRecordCount !== preparation.plannedRegistrationRecordCount || record.excludedRegistrationRecordCount !== preparation.excludedRegistrationRecordCount) reasons.push("登録範囲または件数が準備記録と一致しません");
      if (!clean(preparation.registrationDestinationType) || !clean(preparation.registrationDestinationName) || !MANUAL_REGISTRATION_MODES.includes(preparation.registrationMode)) reasons.push("登録先または手動限定modeが不正です");
      if (!clean(preparation.executorCandidateName) || preparation.authorityConfirmed !== true || preparation.separationOfDutiesConfirmed !== true) reasons.push("実行者候補、権限または職務分離が未確認です");
      if (!Array.isArray(preparation.requiredDocumentIds) || preparation.requiredDocumentIds.length === 0 || !Array.isArray(preparation.missingDocumentIds)) reasons.push("必要書類確認が不正です");
      if (type === "approve_execution" && preparation.missingDocumentIds.length > 0) reasons.push("必要書類が不足しています");
      const checks = preparation.preExecutionChecks || {};
      for (const key of ["backupPlanConfirmed", "duplicatePreventionConfirmed", "rollbackCandidateConfirmed", "destinationConfirmed", "registrationCountConfirmed", "executorAuthorityConfirmed", "manualExecutionConfirmationRequired", "finalPreExecutionReviewRequired"]) if (checks[key] !== true) reasons.push(`${key}が未確認です`);
      if (!clean(preparation.duplicateHandlingPolicy)) reasons.push("重複防止方針がありません");
      if (Array.isArray(preparation.executionBlockers) && preparation.executionBlockers.length > 0 && type === "approve_execution") reasons.push("実行阻害要因があります");
      if (preparation.unresolvedIssueIds.length > 0 && (!Array.isArray(input.unresolvedIssueHandling) || input.unresolvedIssueHandling.length === 0)) reasons.push("unresolvedIssueの扱いが必要です");
    }
    if (type === "conditional_approve_execution" && (!Array.isArray(input.executionApprovalConditions) || input.executionApprovalConditions.length === 0 || !clean(input.conditionReason) || !Array.isArray(input.inheritedPreparationConditions) || !Array.isArray(input.incompleteConditionIds) || !clean(input.conditionCompletionStatus) || !clean(input.acceptedRisk) || input.requiredFollowUp !== true || !clean(input.followUpOwnerCandidate) || !clean(input.followUpActionCandidate) || !Array.isArray(input.prohibitedActionsUntilConditionCompletion) || input.prohibitedActionsUntilConditionCompletion.length === 0 || !Array.isArray(input.executionBlockers) || !clean(input.approverComment))) reasons.push("条件、risk、follow-up、禁止事項、blocker、コメントが必要です");
    if (type === "return_for_preparation_revision" && (!clean(input.returnReason) || !Array.isArray(input.targetIssueIds) || input.targetIssueIds.length === 0)) reasons.push("差戻し理由と対象issueが必要です");
    if (type === "recheck_required" && (!clean(input.recheckReason) || !Array.isArray(input.targetIssueIds) || input.targetIssueIds.length === 0)) reasons.push("再確認理由と対象issueが必要です");
    if (type === "defer" && (!clean(input.deferReason) || !Array.isArray(input.missingInformation) || input.missingInformation.length === 0)) reasons.push("保留理由と不足情報が必要です");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function finalizeApproval(record, preparation, input, operation, options) {
    const checked = validateApproval(record, preparation, input, operation);
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
      executionApprovalReason: clean(input.executionApprovalReason),
      executionApprovalSummary: clean(input.executionApprovalSummary),
      executionApprovalConditions: clone(input.executionApprovalConditions || []),
      conditionReason: clean(input.conditionReason),
      inheritedPreparationConditions: clone(input.inheritedPreparationConditions || []),
      incompleteConditionIds: clone(input.incompleteConditionIds || []),
      conditionCompletionStatus: clean(input.conditionCompletionStatus),
      acceptedRisk: clean(input.acceptedRisk),
      reviewedIssueIds: clone(input.reviewedIssueIds || []),
      acceptedWarningIssueIds: clone(input.acceptedWarningIssueIds || preparation.acceptedWarningIssueIds),
      unresolvedIssueIds: clone(input.unresolvedIssueIds || preparation.unresolvedIssueIds),
      unresolvedIssueHandling: clone(input.unresolvedIssueHandling || []),
      businessImpact: clean(input.businessImpact),
      dataImpact: clean(input.dataImpact),
      registrationScope: clean(preparation.registrationScope),
      registrationExclusions: clone(input.registrationExclusions || preparation.excludedRegistrationSourceRecordIds || []),
      registrationDestination: `${preparation.registrationDestinationType}:${preparation.registrationDestinationName}`,
      executorCandidate: { id: clean(preparation.executorCandidateId), name: clean(preparation.executorCandidateName), role: clean(preparation.executorRole) },
      authorityConfirmationResult: preparation.authorityConfirmed === true ? "confirmed" : "not_confirmed",
      requiredFollowUp: input.requiredFollowUp === true,
      followUpOwnerCandidate: clean(input.followUpOwnerCandidate),
      followUpActionCandidate: clean(input.followUpActionCandidate),
      followUpDueDateCandidate: clean(input.followUpDueDateCandidate),
      requiredAdditionalReview: input.requiredAdditionalReview === true,
      requiredDocuments: clone(input.requiredDocuments || preparation.requiredDocumentIds),
      prohibitedActionsUntilConditionCompletion: clone(input.prohibitedActionsUntilConditionCompletion || []),
      executionBlockers: clone(input.executionBlockers || preparation.executionBlockers || []),
      approverComment: clean(input.approverComment),
      humanComment: clean(input.humanComment),
      newlyDetectedIssues: clone(input.newlyDetectedIssues || []),
      returnReason: clean(input.returnReason),
      returnSummary: clean(input.returnSummary),
      targetIssueIds: clone(input.targetIssueIds || []),
      affectedRecordIds: clone(input.affectedRecordIds || []),
      insufficientFields: clone(input.insufficientFields || []),
      contradictoryFields: clone(input.contradictoryFields || []),
      registrationScopeIssues: clone(input.registrationScopeIssues || []),
      registrationCountIssues: clone(input.registrationCountIssues || []),
      destinationIssues: clone(input.destinationIssues || []),
      authorityIssues: clone(input.authorityIssues || []),
      documentIssues: clone(input.documentIssues || []),
      preExecutionCheckIssues: clone(input.preExecutionCheckIssues || []),
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
      stateHistory: [...record.stateHistory, { from: record.status, to: approvalState, changedBy: operation.performedBy, changedAt: at, reason: input.executionApprovalReason }, ...(approvalState === nextState ? [] : [{ from: approvalState, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: "人間による実行承認確定" }])],
    } });
  }
  function interruptApproval(record, input, operation, options) {
    if (!manual(operation) || !record || !["manual_post_import_formal_registration_execution_approval_started", "manual_post_import_formal_registration_execution_approval_in_progress"].includes(record.status) || !clean(input && input.interruptionReason)) return freeze({ interrupted: false, reasons: ["中断には承認中記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ interrupted: true, record: { ...clone(record), status: "manual_post_import_formal_registration_execution_approval_interrupted", approvalType: "interrupted", approvalResult: "manual_post_import_formal_registration_execution_approval_interrupted", interruptedBy: operation.performedBy, interruptedAt: at, interruptionReason: clean(input.interruptionReason), currentInputSnapshot: clone(input.currentInputSnapshot || {}), unresolvedChecks: clone(input.unresolvedChecks || []), safetyViolationDetected: input.safetyViolationDetected === true, resumeAllowed: false, manualReviewRequired: true, approvalCompletedAt: at, nextState: "manual_post_import_formal_registration_execution_approval_interrupted", updatedAt: at } });
  }
  function cancelApproval(targetOrRecord, input, operation, options) {
    if (!manual(operation) || !targetOrRecord || !["ready_for_manual_post_import_formal_registration_execution_approval", "manual_post_import_formal_registration_execution_approval_started", "manual_post_import_formal_registration_execution_approval_in_progress"].includes(targetOrRecord.status) || !clean(input && input.cancellationReason)) return freeze({ cancelled: false, reasons: ["取消には確定前記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    if (clean(targetOrRecord.formalRegistrationPreparationRecordId)) registry.add(targetOrRecord.formalRegistrationPreparationRecordId);
    return freeze({ cancelled: true, record: { ...clone(targetOrRecord), formalRegistrationExecutionApprovalRecordId: targetOrRecord.formalRegistrationExecutionApprovalRecordId || formalRegistrationExecutionApprovalRecordId(options), status: "manual_post_import_formal_registration_execution_approval_cancelled", approvalType: "cancelled", approvalResult: "manual_post_import_formal_registration_execution_approval_cancelled", cancelledBy: operation.performedBy, cancelledAt: at, cancellationReason: clean(input.cancellationReason), partialInput: clone(input.partialInput || {}), automaticRestartProhibited: true, approvalCompletedAt: at, nextState: "manual_post_import_formal_registration_execution_approval_cancelled", updatedAt: at, ...clone(SAFETY) } });
  }
  function transition(record, nextState, operation, options) {
    if (!manual(operation)) return freeze({ transitioned: false, reason: "人間の明示操作が必要です", record });
    if (!(ALLOWED_TRANSITIONS[record.status] || []).includes(nextState)) return freeze({ transitioned: false, reason: "定義されていない状態遷移です", record });
    const at = nowIso(options);
    return freeze({ transitioned: true, record: { ...clone(record), status: nextState, updatedAt: at, stateHistory: [...(record.stateHistory || []), { from: record.status, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }] } });
  }
  function render(doc) { if (doc) { const node = doc.getElementById("phase2619-current-status"); if (node) node.textContent = "ready_for_manual_post_import_formal_registration_execution_approval"; } }
  if (typeof document !== "undefined") { const start = () => render(document); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }
  return { PHASE2618_REFERENCE: phase2618, STATES, APPROVAL_TYPES, MANUAL_REGISTRATION_MODES, ALLOWED_TRANSITIONS, TYPE_STATE, SAFETY, formalRegistrationExecutionApprovalRecordId, validateTarget, listEligibleTargets, startApproval, validateApproval, finalizeApproval, interruptApproval, cancelApproval, transition, resetRegistry, render };
});
