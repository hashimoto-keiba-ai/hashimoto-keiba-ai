(function (root, factory) {
  const phase2615 = typeof module === "object" && module.exports
    ? require("./phase26-15-manual-post-import-verification-decision-core.js")
    : root.HashimotoPhase2615ManualPostImportVerificationDecision;
  const api = factory(phase2615);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2616ManualPostImportAcceptanceRecord = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase2615) {
  "use strict";
  if (!phase2615) throw new Error("Phase26-15 definition is required");

  const STATES = Object.freeze([
    "ready_for_manual_post_import_acceptance_record",
    "manual_post_import_acceptance_record_started",
    "manual_post_import_acceptance_record_in_progress",
    "manual_post_import_acceptance_record_confirmed",
    "manual_post_import_acceptance_record_confirmed_with_warnings",
    "manual_post_import_acceptance_record_deferred",
    "manual_post_import_acceptance_record_interrupted",
    "manual_post_import_acceptance_record_cancelled",
    "manual_post_import_acceptance_recheck_required",
    "ready_for_manual_post_import_acceptance_approval",
  ]);
  const ACCEPTANCE_TYPES = Object.freeze(["accepted", "accepted_with_warnings", "recheck_required", "deferred", "interrupted", "cancelled"]);
  const ALLOWED_TRANSITIONS = Object.freeze({
    ready_for_manual_post_import_acceptance_record: ["manual_post_import_acceptance_record_started", "manual_post_import_acceptance_record_cancelled"],
    manual_post_import_acceptance_record_started: ["manual_post_import_acceptance_record_in_progress", "manual_post_import_acceptance_record_interrupted", "manual_post_import_acceptance_record_cancelled"],
    manual_post_import_acceptance_record_in_progress: ["manual_post_import_acceptance_record_confirmed", "manual_post_import_acceptance_record_confirmed_with_warnings", "manual_post_import_acceptance_recheck_required", "manual_post_import_acceptance_record_deferred", "manual_post_import_acceptance_record_interrupted", "manual_post_import_acceptance_record_cancelled"],
    manual_post_import_acceptance_record_confirmed: ["ready_for_manual_post_import_acceptance_approval"],
    manual_post_import_acceptance_record_confirmed_with_warnings: ["ready_for_manual_post_import_acceptance_approval"],
    manual_post_import_acceptance_record_deferred: [],
    manual_post_import_acceptance_record_interrupted: [],
    manual_post_import_acceptance_record_cancelled: [],
    manual_post_import_acceptance_recheck_required: [],
    ready_for_manual_post_import_acceptance_approval: [],
  });
  const TYPE_STATE = Object.freeze({
    accepted: ["manual_post_import_acceptance_record_confirmed", "ready_for_manual_post_import_acceptance_approval"],
    accepted_with_warnings: ["manual_post_import_acceptance_record_confirmed_with_warnings", "ready_for_manual_post_import_acceptance_approval"],
    recheck_required: ["manual_post_import_acceptance_recheck_required", "manual_post_import_acceptance_recheck_required"],
    deferred: ["manual_post_import_acceptance_record_deferred", "manual_post_import_acceptance_record_deferred"],
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
  function acceptanceRecordId(options) {
    sequence += 1;
    return `manual-post-import-acceptance-record-${nowIso(options).replace(/\D/g, "").slice(0, 14)}-${String(sequence).padStart(5, "0")}`;
  }
  function validateTarget(target, existingRecords) {
    const value = target || {};
    const reasons = [];
    if (!value.phase2615DecisionRecordExists) reasons.push("Phase26-15の判定記録がありません");
    if (value.status !== "ready_for_manual_post_import_acceptance_record") reasons.push("状態がready_for_manual_post_import_acceptance_recordではありません");
    for (const key of ["decisionRecordId", "verificationRecordId", "importBatchId", "candidateId"]) if (!clean(value[key])) reasons.push(`${key}がありません`);
    if (!["accept", "accept_with_warnings"].includes(value.decisionType)) reasons.push("Phase26-15判定がacceptまたはaccept_with_warningsではありません");
    if (!clean(value.deciderName) && !clean(value.deciderId)) reasons.push("判定者が記録されていません");
    if (!clean(value.decisionStartedAt) || !clean(value.decisionCompletedAt)) reasons.push("判定開始日時または終了日時がありません");
    if (!clean(value.decisionReason) || !clean(value.riskLevel)) reasons.push("判定理由またはriskLevelがありません");
    for (const key of ["warningCount", "errorCount", "criticalCount", "affectedRecordCount"]) if (!integer(value[key])) reasons.push(`${key}が記録されていません`);
    for (const key of ["reviewedIssueIds", "acceptedWarningIssueIds", "unresolvedIssueIds"]) if (!Array.isArray(value[key])) reasons.push(`${key}が記録されていません`);
    if (value.protectedMode !== true || value.planOnly !== true) reasons.push("protectedModeまたはPLAN_ONLYの安全条件に違反しています");
    const existing = Array.isArray(existingRecords) ? existingRecords : [];
    if (registry.has(value.decisionRecordId) || existing.some(record => record && record.decisionRecordId === value.decisionRecordId)) reasons.push("同一decisionRecordIdの受理記録が既にあります");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function listEligibleTargets(records, existingRecords) {
    return freeze((Array.isArray(records) ? records : []).filter(record => record && record.status === "ready_for_manual_post_import_acceptance_record").map(record => {
      const result = validateTarget(record, existingRecords);
      return { ...clone(record), acceptanceStartAllowed: result.valid, acceptanceStartBlockedReasons: result.reasons };
    }));
  }
  function startAcceptanceRecord(target, input, operation, options) {
    const checked = validateTarget(target, input && input.existingAcceptanceRecords);
    const reasons = [...checked.reasons];
    if (!manual(operation)) reasons.push("人間の明示操作が必要です");
    if (!clean(input && input.recorderName) && !clean(input && input.recorderId)) reasons.push("受理記録作成者が入力されていません");
    if (clean(input && input.confirmDecisionRecordId) !== clean(target && target.decisionRecordId)) reasons.push("decisionRecordIdの再確認が一致しません");
    if (clean(input && input.confirmImportBatchId) !== clean(target && target.importBatchId)) reasons.push("importBatchIdの再確認が一致しません");
    for (const key of ["acceptanceContentConfirmed", "warningsConfirmed", "unresolvedIssuesConfirmed", "noAutomaticFormalRegistrationConfirmed", "noAutomaticApplicationConfirmed", "noAutomaticLearningUpdateConfirmed", "noAutomaticRollbackConfirmed"]) if (!input || input[key] !== true) reasons.push(`${key}の明示確認が必要です`);
    if (reasons.length) return freeze({ started: false, reasons });
    const at = nowIso(options);
    registry.add(target.decisionRecordId);
    return freeze({ started: true, record: {
      acceptanceRecordId: acceptanceRecordId(options),
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
      recorderId: clean(input.recorderId),
      recorderName: clean(input.recorderName),
      recordingStartedAt: at,
      recordingCompletedAt: "",
      status: "manual_post_import_acceptance_record_in_progress",
      acceptanceType: "",
      acceptanceResult: "pending",
      acceptanceReason: "",
      acceptanceSummary: "",
      riskLevel: target.riskLevel,
      acceptanceScope: "",
      acceptedRecordCount: 0,
      acceptedSourceRecordIds: [],
      acceptedDestinationRecordIds: [],
      excludedRecordCount: 0,
      excludedSourceRecordIds: [],
      excludedDestinationRecordIds: [],
      exclusionReasons: [],
      acceptedWarningIssueIds: clone(target.acceptedWarningIssueIds),
      unresolvedIssueIds: clone(target.unresolvedIssueIds),
      unresolvedIssueHandling: [],
      warningAcceptanceReason: "",
      warningAcceptanceConditions: [],
      operationalCautions: [],
      businessImpact: clean(target.businessImpact),
      dataImpact: clean(target.dataImpact),
      handoffRequired: false,
      handoffTarget: "",
      handoffConditions: [],
      requiredManualApproval: true,
      followUpRequired: target.followUpRequired === true,
      recheckRequired: false,
      recheckReason: "",
      deferReason: "",
      interruptionReason: "",
      cancellationReason: "",
      rollbackCandidateId: clean(target.rollbackCandidateId),
      warningCount: target.warningCount,
      errorCount: target.errorCount,
      criticalCount: target.criticalCount,
      affectedRecordCount: target.affectedRecordCount,
      nextState: "manual_post_import_acceptance_record_in_progress",
      createdAt: at,
      updatedAt: at,
      stateHistory: [
        { from: "ready_for_manual_post_import_acceptance_record", to: "manual_post_import_acceptance_record_started", changedBy: operation.performedBy, changedAt: at, reason: operation.reason },
        { from: "manual_post_import_acceptance_record_started", to: "manual_post_import_acceptance_record_in_progress", changedBy: operation.performedBy, changedAt: at, reason: "手動受理記録開始" },
      ],
      ...clone(SAFETY),
    } });
  }
  function validateAcceptance(record, decision, input, operation) {
    const reasons = [];
    const type = clean(input && input.acceptanceType);
    if (!manual(operation) || !record || record.status !== "manual_post_import_acceptance_record_in_progress") reasons.push("作成中の受理記録と人間の明示操作が必要です");
    if (!ACCEPTANCE_TYPES.slice(0, 4).includes(type)) reasons.push("受理記録種別が不正です");
    if (!clean(input && input.acceptanceReason) || !clean(input && input.acceptanceSummary)) reasons.push("受理理由と概要が必要です");
    if (decision.decisionType === "accept" && type === "accepted_with_warnings") reasons.push("accept判定をaccepted_with_warningsへ変更できません");
    if (decision.decisionType === "accept_with_warnings" && type === "accepted") reasons.push("accept_with_warnings判定をacceptedへ変更できません");
    const severe = decision.criticalCount > 0 || decision.errorCount > 0;
    if (["accepted", "accepted_with_warnings"].includes(type) && severe) reasons.push("criticalまたはerrorがあるため受理確定できません");
    if (["accepted", "accepted_with_warnings"].includes(type)) {
      for (const key of ["acceptanceScope", "handoffTarget"]) if (!clean(input && input[key])) reasons.push(`${key}が必要です`);
      if (!Array.isArray(input.handoffConditions) || input.handoffConditions.length === 0 || input.requiredManualApproval !== true) reasons.push("引継ぎ条件と人間承認が必要です");
      if (!integer(input.acceptedRecordCount) || !integer(input.excludedRecordCount)) reasons.push("受理件数または除外件数が不正です");
      const total = input.acceptedRecordCount + input.excludedRecordCount;
      if (total !== decision.affectedRecordCount && !clean(input.countDifferenceReason)) reasons.push("affectedRecordCountとの差異理由が必要です");
      if (input.excludedRecordCount > 0 && (!Array.isArray(input.exclusionReasons) || input.exclusionReasons.length === 0)) reasons.push("除外理由が必要です");
    }
    if (type === "accepted" && decision.unresolvedIssueIds.length > 0 && (!Array.isArray(input.unresolvedIssueHandling) || input.unresolvedIssueHandling.length === 0)) reasons.push("未解決issueの扱いが必要です");
    if (type === "accepted_with_warnings") {
      if (!Array.isArray(input.acceptedWarningIssueIds) || input.acceptedWarningIssueIds.length === 0 || !clean(input.warningAcceptanceReason) || !Array.isArray(input.warningAcceptanceConditions) || input.warningAcceptanceConditions.length === 0 || !Array.isArray(input.operationalCautions) || input.operationalCautions.length === 0 || !clean(input.humanComment)) reasons.push("警告issue、受理理由・条件、注意事項、コメントが必要です");
      if (decision.unresolvedIssueIds.length > 0 && (!Array.isArray(input.unresolvedIssueHandling) || input.unresolvedIssueHandling.length === 0)) reasons.push("未解決issueを既知問題として扱う記録が必要です");
    }
    if (type === "recheck_required" && (!clean(input.recheckReason) || !Array.isArray(input.detectedIssueIds) || input.detectedIssueIds.length === 0 || !Array.isArray(input.newlyDetectedIssues))) reasons.push("再確認理由、issue、新規issueが必要です");
    if (type === "deferred" && (!clean(input.deferReason) || !Array.isArray(input.missingInformation) || input.missingInformation.length === 0)) reasons.push("保留理由と不足情報が必要です");
    return freeze({ valid: reasons.length === 0, reasons });
  }
  function finalizeAcceptance(record, decision, input, operation, options) {
    const checked = validateAcceptance(record, decision, input, operation);
    if (!checked.valid) return freeze({ finalized: false, reasons: checked.reasons });
    const type = input.acceptanceType;
    const [confirmedState, nextState] = TYPE_STATE[type];
    const at = nowIso(options);
    return freeze({ finalized: true, record: {
      ...clone(record),
      recordingCompletedAt: at,
      status: nextState,
      acceptanceType: type,
      acceptanceResult: confirmedState,
      acceptanceReason: clean(input.acceptanceReason),
      acceptanceSummary: clean(input.acceptanceSummary),
      acceptanceScope: clean(input.acceptanceScope),
      acceptedRecordCount: integer(input.acceptedRecordCount) ? input.acceptedRecordCount : 0,
      acceptedSourceRecordIds: clone(input.acceptedSourceRecordIds || []),
      acceptedDestinationRecordIds: clone(input.acceptedDestinationRecordIds || []),
      excludedRecordCount: integer(input.excludedRecordCount) ? input.excludedRecordCount : 0,
      excludedSourceRecordIds: clone(input.excludedSourceRecordIds || []),
      excludedDestinationRecordIds: clone(input.excludedDestinationRecordIds || []),
      exclusionReasons: clone(input.exclusionReasons || []),
      acceptanceStartBoundary: clean(input.acceptanceStartBoundary),
      acceptanceEndBoundary: clean(input.acceptanceEndBoundary),
      dataCategory: clean(input.dataCategory),
      affectedBusinessKeys: clone(input.affectedBusinessKeys || []),
      countDifferenceReason: clean(input.countDifferenceReason),
      acceptedWarningIssueIds: clone(input.acceptedWarningIssueIds || []),
      unresolvedIssueHandling: clone(input.unresolvedIssueHandling || []),
      warningAcceptanceReason: clean(input.warningAcceptanceReason),
      warningAcceptanceConditions: clone(input.warningAcceptanceConditions || []),
      operationalCautions: clone(input.operationalCautions || []),
      futureCorrectionRequired: input.futureCorrectionRequired === true,
      additionalVerificationRequired: input.additionalVerificationRequired === true,
      responsiblePersonCandidate: clean(input.responsiblePersonCandidate),
      followUpDueDateCandidate: clean(input.followUpDueDateCandidate),
      humanComment: clean(input.humanComment),
      handoffRequired: input.handoffRequired === true,
      handoffTarget: clean(input.handoffTarget),
      handoffPurpose: clean(input.handoffPurpose),
      handoffConditions: clone(input.handoffConditions || []),
      requiredManualApproval: input.requiredManualApproval === true,
      requiredAdditionalReview: input.requiredAdditionalReview === true,
      requiredDocuments: clone(input.requiredDocuments || []),
      requiredIssueFollowUp: clone(input.requiredIssueFollowUp || []),
      prohibitedAutomaticActions: clone(input.prohibitedAutomaticActions || []),
      nextResponsiblePersonCandidate: clean(input.nextResponsiblePersonCandidate),
      nextActionSummary: clean(input.nextActionSummary),
      recheckRequired: type === "recheck_required",
      recheckReason: clean(input.recheckReason),
      detectedIssueIds: clone(input.detectedIssueIds || []),
      newlyDetectedIssues: clone(input.newlyDetectedIssues || []),
      missingInformation: clone(input.missingInformation || []),
      contradictoryRecords: clone(input.contradictoryRecords || []),
      recommendedReviewPhase: clean(input.recommendedReviewPhase),
      requiredHumanReviewer: clean(input.requiredHumanReviewer),
      recheckConditions: clone(input.recheckConditions || []),
      automaticReturnProhibited: true,
      automaticCorrectionProhibited: true,
      deferReason: clean(input.deferReason),
      nextState,
      updatedAt: at,
      stateHistory: [...record.stateHistory, { from: record.status, to: confirmedState, changedBy: operation.performedBy, changedAt: at, reason: input.acceptanceReason }, ...(confirmedState === nextState ? [] : [{ from: confirmedState, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: "人間による受理記録確定" }])],
    } });
  }
  function interruptAcceptance(record, input, operation, options) {
    if (!manual(operation) || !record || !["manual_post_import_acceptance_record_started", "manual_post_import_acceptance_record_in_progress"].includes(record.status) || !clean(input && input.interruptionReason)) return freeze({ interrupted: false, reasons: ["中断には作成中記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    return freeze({ interrupted: true, record: { ...clone(record), status: "manual_post_import_acceptance_record_interrupted", acceptanceType: "interrupted", acceptanceResult: "manual_post_import_acceptance_record_interrupted", interruptedBy: operation.performedBy, interruptedAt: at, interruptionReason: clean(input.interruptionReason), currentInputSnapshot: clone(input.currentInputSnapshot || {}), unresolvedChecks: clone(input.unresolvedChecks || []), safetyViolationDetected: input.safetyViolationDetected === true, resumeAllowed: false, manualReviewRequired: true, recordingCompletedAt: at, nextState: "manual_post_import_acceptance_record_interrupted", updatedAt: at } });
  }
  function cancelAcceptance(targetOrRecord, input, operation, options) {
    if (!manual(operation) || !targetOrRecord || !["ready_for_manual_post_import_acceptance_record", "manual_post_import_acceptance_record_started", "manual_post_import_acceptance_record_in_progress"].includes(targetOrRecord.status) || !clean(input && input.cancellationReason)) return freeze({ cancelled: false, reasons: ["取消には確定前記録、理由、人間の明示操作が必要です"] });
    const at = nowIso(options);
    if (clean(targetOrRecord.decisionRecordId)) registry.add(targetOrRecord.decisionRecordId);
    return freeze({ cancelled: true, record: { ...clone(targetOrRecord), acceptanceRecordId: targetOrRecord.acceptanceRecordId || acceptanceRecordId(options), status: "manual_post_import_acceptance_record_cancelled", acceptanceType: "cancelled", acceptanceResult: "manual_post_import_acceptance_record_cancelled", cancelledBy: operation.performedBy, cancelledAt: at, cancellationReason: clean(input.cancellationReason), partialInput: clone(input.partialInput || {}), automaticRestartProhibited: true, recordingCompletedAt: at, nextState: "manual_post_import_acceptance_record_cancelled", updatedAt: at, ...clone(SAFETY) } });
  }
  function transition(record, nextState, operation, options) {
    if (!manual(operation)) return freeze({ transitioned: false, reason: "人間の明示操作が必要です", record });
    if (!(ALLOWED_TRANSITIONS[record.status] || []).includes(nextState)) return freeze({ transitioned: false, reason: "定義されていない状態遷移です", record });
    const at = nowIso(options);
    return freeze({ transitioned: true, record: { ...clone(record), status: nextState, updatedAt: at, stateHistory: [...(record.stateHistory || []), { from: record.status, to: nextState, changedBy: operation.performedBy, changedAt: at, reason: operation.reason }] } });
  }
  function render(doc) { if (doc) { const node = doc.getElementById("phase2616-current-status"); if (node) node.textContent = "ready_for_manual_post_import_acceptance_record"; } }
  if (typeof document !== "undefined") { const start = () => render(document); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start(); }
  return { PHASE2615_REFERENCE: phase2615, STATES, ACCEPTANCE_TYPES, ALLOWED_TRANSITIONS, TYPE_STATE, SAFETY, acceptanceRecordId, validateTarget, listEligibleTargets, startAcceptanceRecord, validateAcceptance, finalizeAcceptance, interruptAcceptance, cancelAcceptance, transition, resetRegistry, render };
});
