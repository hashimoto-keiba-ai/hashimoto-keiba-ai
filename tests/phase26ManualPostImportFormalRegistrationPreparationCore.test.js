"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase2617 = require("../phase26-17-manual-post-import-acceptance-approval-core.js");
const core = require("../phase26-18-manual-post-import-formal-registration-preparation-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-19T01:02:03Z") };
const operation = { performedBy: "owner", reason: "manual registration preparation", explicitConfirmation: true };
const target = {
  phase2617ApprovalRecordExists: true,
  acceptanceApprovalRecordId: "acceptance-approval-1",
  acceptanceRecordId: "acceptance-1",
  decisionRecordId: "decision-1",
  verificationRecordId: "verification-1",
  importBatchId: "batch-1",
  candidateId: "candidate-1",
  approvalRecordId: "approval-1",
  sourceDataId: "source-1",
  sourceDataName: "results.json",
  approverId: "approver-1",
  approverName: "owner",
  approvalStartedAt: "2026-08-19T00:00:00Z",
  approvalCompletedAt: "2026-08-19T00:01:00Z",
  status: "ready_for_manual_post_import_formal_registration_preparation",
  approvalType: "approve",
  approvalReason: "承認済み",
  approvalConditions: [],
  riskLevel: "none",
  acceptanceScope: "rows 1-2",
  acceptedRecordCount: 2,
  excludedRecordCount: 0,
  warningCount: 0,
  errorCount: 0,
  criticalCount: 0,
  acceptedWarningIssueIds: [],
  unresolvedIssueIds: [],
  handoffConditions: ["人間による次工程承認"],
  requiredFollowUp: false,
  requiredAdditionalReview: false,
  requiredDocuments: ["approval evidence"],
  prohibitedActionsUntilFollowUp: [],
  rollbackCandidateId: "",
  protectedMode: true,
  planOnly: true,
};
const input = {
  recorderId: "recorder-1",
  recorderName: "owner",
  confirmAcceptanceApprovalRecordId: target.acceptanceApprovalRecordId,
  confirmImportBatchId: target.importBatchId,
  approvalConfirmed: true,
  registrationScopeConfirmed: true,
  warningsConfirmed: true,
  unresolvedIssuesConfirmed: true,
  approvalConditionsConfirmed: true,
  noFormalRegistrationYetConfirmed: true,
  noAutomaticApplicationConfirmed: true,
  noAutomaticLearningUpdateConfirmed: true,
  noAutomaticRollbackConfirmed: true,
};
const checks = {
  sourceDataIntegrityConfirmed: true, destinationConfirmed: true, registrationCountConfirmed: true,
  exclusionRangeConfirmed: true, acceptedWarningsConfirmed: true, unresolvedIssuesConfirmed: true,
  approvalConditionsConfirmed: true, requiredDocumentsConfirmed: true, backupPlanConfirmed: true,
  rollbackCandidateConfirmed: true, duplicatePreventionConfirmed: true, executionWindowConfirmed: true,
  executorAuthorityConfirmed: true, manualExecutionConfirmationRequired: true, finalPreExecutionReviewRequired: true,
};
const preparationBase = {
  formalRegistrationScope: "rows 1-2",
  plannedRegistrationRecordCount: 2,
  registrationSourceRecordIds: ["s1", "s2"],
  registrationDestinationRecordIds: ["d1", "d2"],
  excludedRegistrationRecordCount: 0,
  excludedRegistrationSourceRecordIds: [],
  excludedRegistrationDestinationRecordIds: [],
  registrationExclusionReasons: [],
  registrationStartBoundary: "row 1",
  registrationEndBoundary: "row 2",
  affectedBusinessKeys: ["race1-horse1", "race1-horse2"],
  registrationTargetName: "formal race results",
  dataCategory: "race_result",
  registrationDestinationType: "private_local_store",
  registrationDestinationName: "formal_results",
  registrationDestinationIdentifier: "formal-results-v1",
  registrationMethod: "append_with_manual_validation",
  registrationMode: "manual_confirmed_execution_required",
  duplicateHandlingPolicy: "block_and_review",
  conflictHandlingPolicy: "block_and_review",
  existingRecordHandlingPolicy: "no_overwrite",
  registrationOrder: ["s1", "s2"],
  validationRequiredBeforeExecution: true,
  backupRequiredBeforeExecution: true,
  rollbackCandidateRequired: true,
  registrationNotes: "preparation only",
  executorCandidateId: "executor-1",
  executorCandidateName: "owner",
  executorRole: "private-local-operator",
  authorityConfirmed: true,
  authorityConfirmationMethod: "manual identity check",
  authorityConfirmedBy: "owner",
  authorityConfirmedAt: "2026-08-19T01:00:00Z",
  executionResponsibility: "manual execution only",
  secondaryReviewerCandidate: "reviewer",
  separationOfDutiesConfirmed: true,
  humanExecutionRequired: true,
  preExecutionChecks: checks,
  requiredDocumentIds: ["doc1"],
  requiredDocumentNames: ["approval evidence"],
  documentAvailabilityStatus: "available",
  missingDocumentIds: [],
  documentReviewedBy: "owner",
  documentReviewedAt: "2026-08-19T01:00:00Z",
  approvalEvidenceIds: ["approval-evidence-1"],
  verificationEvidenceIds: ["verification-evidence-1"],
  importExecutionEvidenceIds: ["import-evidence-1"],
  auditTrailComplete: true,
  evidenceNotes: "manual review completed",
  plannedExecutionDateCandidate: "2026-08-20",
  plannedExecutionTimeCandidate: "10:00",
  executionWindowCandidate: "10:00-10:30",
  estimatedDuration: "30m",
  executionEnvironment: "Private Local",
  requiredPersonnel: ["owner"],
  requiredReviewers: ["reviewer"],
  executionDependencies: ["manual approval"],
  executionBlockers: [],
};
const withId = (value, suffix) => ({ ...value, acceptanceApprovalRecordId: `${value.acceptanceApprovalRecordId}-${suffix}`, acceptanceRecordId: `${value.acceptanceRecordId}-${suffix}`, importBatchId: `${value.importBatchId}-${suffix}`, candidateId: `${value.candidateId}-${suffix}` });
const start = (value, changed = {}) => core.startPreparation(value, { ...input, confirmAcceptanceApprovalRecordId: value.acceptanceApprovalRecordId, confirmImportBatchId: value.importBatchId, ...changed }, operation, clock);

core.resetRegistry();
assert.strictEqual(core.PHASE2617_REFERENCE, phase2617);
assert(core.validateTarget(target).valid);
assert(!core.validateTarget({ ...target, status: "ready_for_manual_post_import_acceptance_recheck" }).valid);
assert(!core.validateTarget({ ...target, phase2617ApprovalRecordExists: false }).valid);
for (const key of ["acceptanceApprovalRecordId", "acceptanceRecordId", "decisionRecordId", "verificationRecordId", "importBatchId"]) assert(!core.validateTarget({ ...target, [key]: "" }).valid, key);
assert(!core.validateTarget({ ...target, approvalType: "defer" }).valid);
assert.equal(core.listEligibleTargets([target, { ...target, status: "failed" }]).length, 1);
assert(!start(target, { recorderName: "", recorderId: "" }).started);
assert(!start(target, { approvalConfirmed: false }).started);

core.resetRegistry();
const first = start(target);
assert(first.started);
assert(/^manual-post-import-formal-registration-preparation-20260819010203-\d{5}$/.test(first.record.formalRegistrationPreparationRecordId));
assert(!start(target).started);
for (const [key, expected] of Object.entries(core.SAFETY)) assert.strictEqual(first.record[key], expected, key);
const prepared = core.finalizePreparation(first.record, target, { ...preparationBase, preparationType: "prepared" }, operation, clock);
assert(prepared.finalized);
assert.equal(prepared.record.preparationResult, "manual_post_import_formal_registration_preparation_completed");
assert.equal(prepared.record.status, "ready_for_manual_post_import_formal_registration_execution_approval");
assert.equal(prepared.record.plannedRegistrationRecordCount, 2);
assert.equal(prepared.record.registrationScope, "rows 1-2");
assert.equal(prepared.record.registrationMode, "manual_confirmed_execution_required");
assert.equal(prepared.record.executorCandidateName, "owner");
assert(prepared.record.authorityConfirmed);
assert.deepEqual(prepared.record.requiredDocumentIds, ["doc1"]);
assert.deepEqual(prepared.record.preExecutionChecks, checks);

core.resetRegistry();
const conditionalTarget = { ...withId(target, "conditional"), approvalType: "conditional_approve", approvalConditions: ["follow-up"], riskLevel: "low", warningCount: 1, acceptedWarningIssueIds: ["w1"], unresolvedIssueIds: ["w1"], requiredFollowUp: true, requiredAdditionalReview: true, prohibitedActionsUntilFollowUp: ["formal_registration"] };
const conditionalStart = start(conditionalTarget);
assert(!core.validatePreparation(conditionalStart.record, conditionalTarget, { ...preparationBase, preparationType: "prepared" }, operation).valid);
assert(!core.validatePreparation(conditionalStart.record, conditionalTarget, { ...preparationBase, preparationType: "prepared_with_conditions" }, operation).valid);
const conditional = core.finalizePreparation(conditionalStart.record, conditionalTarget, {
  ...preparationBase,
  preparationType: "prepared_with_conditions",
  registrationConditions: ["follow-up完了"],
  conditionReason: "条件付き承認を引継ぎ",
  inheritedApprovalConditions: ["follow-up"],
  incompleteConditionIds: ["condition-1"],
  conditionCompletionStatus: "incomplete",
  unresolvedIssueHandling: [{ issueId: "w1", registrationImpact: "low", conditionBeforeExecution: "follow-up完了" }],
  requiredFollowUp: true,
  followUpOwnerCandidate: "owner",
  followUpActionCandidate: "issue確認",
  followUpDueDateCandidate: "2026-09-01",
  requiredAdditionalReview: true,
  requiredDocuments: ["follow-up evidence"],
  prohibitedActionsUntilConditionCompletion: ["formal_registration"],
  humanComment: "条件を確認",
  preExecutionChecks: { ...checks, approvalConditionsConfirmed: false },
}, operation, clock);
assert(conditional.finalized);
assert.equal(conditional.record.preparationResult, "manual_post_import_formal_registration_preparation_completed_with_conditions");
assert.equal(conditional.record.status, "ready_for_manual_post_import_formal_registration_execution_approval");
assert.deepEqual(conditional.record.acceptedWarningIssueIds, ["w1"]);
assert.deepEqual(conditional.record.unresolvedIssueIds, ["w1"]);
assert.equal(conditional.record.unresolvedIssueHandling[0].issueId, "w1");

for (const [name, changed] of [
  ["count", { plannedRegistrationRecordCount: 1 }],
  ["mode", { registrationMode: "automatic" }],
  ["authority", { authorityConfirmed: false }],
  ["docs", { documentAvailabilityStatus: "missing", missingDocumentIds: ["doc1"] }],
  ["checks", { preExecutionChecks: { ...checks, destinationConfirmed: false } }],
]) {
  core.resetRegistry();
  const value = withId(target, name);
  assert(!core.validatePreparation(start(value).record, value, { ...preparationBase, preparationType: "prepared", ...changed }, operation).valid, name);
}
for (const [suffix, severity] of [["critical", "criticalCount"], ["error", "errorCount"]]) {
  core.resetRegistry();
  const value = { ...withId(target, suffix), [severity]: 1 };
  const record = start(value).record;
  assert(!core.validatePreparation(record, value, { ...preparationBase, preparationType: "prepared" }, operation).valid);
  assert(!core.validatePreparation(record, { ...value, approvalType: "conditional_approve" }, { ...preparationBase, preparationType: "prepared_with_conditions", registrationConditions: ["x"], conditionReason: "x", inheritedApprovalConditions: [], incompleteConditionIds: [], conditionCompletionStatus: "incomplete", requiredFollowUp: true, followUpOwnerCandidate: "owner", followUpActionCandidate: "review", prohibitedActionsUntilConditionCompletion: ["registration"], humanComment: "x" }, operation).valid);
}

core.resetRegistry();
const recheckTarget = withId(target, "recheck");
const recheckStart = start(recheckTarget);
assert(!core.validatePreparation(recheckStart.record, recheckTarget, { preparationType: "recheck_required" }, operation).valid);
const rechecked = core.finalizePreparation(recheckStart.record, recheckTarget, { preparationType: "recheck_required", recheckReason: "登録先不明", targetIssueIds: ["r1"], destinationUncertainty: true, requiredReviewAreas: ["destination"], recommendedReviewPhase: "Phase26-17", requiredHumanReviewer: "owner" }, operation, clock);
assert(rechecked.finalized);
assert.equal(rechecked.record.status, "ready_for_manual_post_import_acceptance_approval_recheck");

core.resetRegistry();
const deferTarget = withId(target, "defer");
const deferStart = start(deferTarget);
assert(!core.validatePreparation(deferStart.record, deferTarget, { preparationType: "deferred" }, operation).valid);
const deferred = core.finalizePreparation(deferStart.record, deferTarget, { preparationType: "deferred", deferReason: "書類待ち", missingInformation: ["doc2"] }, operation, clock);
assert(deferred.finalized);
assert.equal(deferred.record.deferReason, "書類待ち");

core.resetRegistry();
const interruptTarget = withId(target, "interrupt");
const interrupted = core.interruptPreparation(start(interruptTarget).record, { interruptionReason: "環境異常", currentInputSnapshot: { scope: "draft" }, unresolvedChecks: ["authority"] }, operation, clock);
assert(interrupted.interrupted);
assert.equal(interrupted.record.interruptionReason, "環境異常");
core.resetRegistry();
const cancelTarget = withId(target, "cancel");
const cancelled = core.cancelPreparation(cancelTarget, { cancellationReason: "人間が取消", partialInput: { scope: "draft" } }, operation, clock);
assert(cancelled.cancelled);
assert.equal(cancelled.record.cancellationReason, "人間が取消");
assert(!core.validateTarget(cancelTarget).valid);
assert(!core.transition({ status: "manual_post_import_formal_registration_preparation_completed", stateHistory: [] }, "manual_post_import_formal_registration_preparation_deferred", operation, clock).transitioned);

const source = fs.readFileSync(path.join(root, "phase26-18-manual-post-import-formal-registration-preparation-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /setInterval\s*\(/, /localStorage\s*\.\s*setItem/, /automaticFormalRegistrationPerformed:\s*true/, /automaticOperationReflectionPerformed:\s*true/, /automaticCorrectionPerformed:\s*true/, /automaticDeletionPerformed:\s*true/, /automaticReimportPerformed:\s*true/, /automaticRetryPerformed:\s*true/, /automaticRollbackPerformed:\s*true/, /automaticApplicationPerformed:\s*true/, /automaticLearningUpdatePerformed:\s*true/, /automaticSchedulingEnabled:\s*true/]) assert(!pattern.test(source), String(pattern));
for (const marker of ['id="phase26-18-manual-post-import-formal-registration-preparation"', "Private Local only", "PLAN_ONLY", "protectedMode", "Phase26-17準備対象一覧", "承認記録詳細", "準備開始前最終確認", "準備記録作成者入力", "手動準備を開始", "登録対象範囲", "登録除外範囲", "登録予定件数", "登録先情報", "登録方式", "実行者候補", "権限確認", "warning一覧", "unresolvedIssue一覧", "承認条件一覧", "必要書類一覧", "実行前確認事項", "実行予定候補", "条件付き準備内容", "再確認必要内容", "保留内容", "準備を確定する", "準備作業を中断する", "準備作業を取り消す", "準備証跡一覧", "次状態表示"]) assert(html.includes(marker), marker);
assert(css.includes(".phase2618-panel"));
assert(readme.includes("Phase26-18 Manual Post-Import Formal Registration Preparation Core"));
console.log("phase26ManualPostImportFormalRegistrationPreparationCore.test.js: PASS");
