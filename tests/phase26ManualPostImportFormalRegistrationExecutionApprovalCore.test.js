"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase2618 = require("../phase26-18-manual-post-import-formal-registration-preparation-core.js");
const core = require("../phase26-19-manual-post-import-formal-registration-execution-approval-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-20T01:02:03Z") };
const operation = { performedBy: "owner", reason: "manual execution approval", explicitConfirmation: true };
const checks = { backupPlanConfirmed: true, duplicatePreventionConfirmed: true, rollbackCandidateConfirmed: true, destinationConfirmed: true, registrationCountConfirmed: true, executorAuthorityConfirmed: true, manualExecutionConfirmationRequired: true, finalPreExecutionReviewRequired: true };
const target = {
  phase2618PreparationRecordExists: true,
  formalRegistrationPreparationRecordId: "preparation-1",
  acceptanceApprovalRecordId: "acceptance-approval-1",
  acceptanceRecordId: "acceptance-1",
  decisionRecordId: "decision-1",
  verificationRecordId: "verification-1",
  importBatchId: "batch-1",
  candidateId: "candidate-1",
  approvalRecordId: "approval-1",
  sourceDataId: "source-1",
  sourceDataName: "results.json",
  recorderId: "recorder-1",
  recorderName: "owner",
  preparationStartedAt: "2026-08-20T00:00:00Z",
  preparationCompletedAt: "2026-08-20T00:01:00Z",
  status: "ready_for_manual_post_import_formal_registration_execution_approval",
  preparationType: "prepared",
  registrationScope: "rows 1-2",
  plannedRegistrationRecordCount: 2,
  excludedRegistrationRecordCount: 0,
  registrationDestinationType: "private_local_store",
  registrationDestinationName: "formal_results",
  registrationDestinationIdentifier: "formal-results-v1",
  registrationMethod: "manual append",
  registrationMode: "manual_confirmed_execution_required",
  duplicateHandlingPolicy: "block_and_review",
  conflictHandlingPolicy: "block_and_review",
  existingRecordHandlingPolicy: "no_overwrite",
  executorCandidateId: "executor-1",
  executorCandidateName: "owner",
  executorRole: "private-local-operator",
  authorityConfirmed: true,
  separationOfDutiesConfirmed: true,
  requiredDocumentIds: ["doc1"],
  missingDocumentIds: [],
  preExecutionChecks: checks,
  warningCount: 0,
  errorCount: 0,
  criticalCount: 0,
  acceptedWarningIssueIds: [],
  unresolvedIssueIds: [],
  registrationConditions: [],
  requiredFollowUp: false,
  requiredAdditionalReview: false,
  prohibitedActions: [],
  executionBlockers: [],
  riskLevel: "none",
  rollbackCandidateId: "rollback-1",
  protectedMode: true,
  planOnly: true,
};
const input = {
  approverId: "approver-1",
  approverName: "owner",
  confirmPreparationRecordId: target.formalRegistrationPreparationRecordId,
  confirmImportBatchId: target.importBatchId,
  preparationConfirmed: true,
  registrationScopeConfirmed: true,
  registrationCountConfirmed: true,
  destinationConfirmed: true,
  executorAuthorityConfirmed: true,
  documentsConfirmed: true,
  preExecutionChecksConfirmed: true,
  warningsConfirmed: true,
  unresolvedIssuesConfirmed: true,
  noFormalRegistrationYetConfirmed: true,
  noAutomaticApplicationConfirmed: true,
  noAutomaticLearningUpdateConfirmed: true,
  noAutomaticRollbackConfirmed: true,
};
const approvalBase = {
  executionApprovalReason: "準備証跡を最終確認",
  executionApprovalSummary: "人間による実行承認",
  acceptedRisk: "none",
  reviewedIssueIds: [],
  acceptedWarningIssueIds: [],
  unresolvedIssueIds: [],
  businessImpact: "none",
  dataImpact: "none",
  humanComment: "確認済み",
};
const withId = (value, suffix) => ({ ...value, formalRegistrationPreparationRecordId: `${value.formalRegistrationPreparationRecordId}-${suffix}`, acceptanceApprovalRecordId: `${value.acceptanceApprovalRecordId}-${suffix}`, importBatchId: `${value.importBatchId}-${suffix}`, candidateId: `${value.candidateId}-${suffix}` });
const start = (value, changed = {}) => core.startApproval(value, { ...input, confirmPreparationRecordId: value.formalRegistrationPreparationRecordId, confirmImportBatchId: value.importBatchId, ...changed }, operation, clock);

core.resetRegistry();
assert.strictEqual(core.PHASE2618_REFERENCE, phase2618);
assert(core.validateTarget(target).valid);
assert(!core.validateTarget({ ...target, status: "manual_post_import_formal_registration_preparation_recheck_required" }).valid);
assert(!core.validateTarget({ ...target, phase2618PreparationRecordExists: false }).valid);
for (const key of ["formalRegistrationPreparationRecordId", "acceptanceApprovalRecordId", "acceptanceRecordId", "decisionRecordId", "verificationRecordId", "importBatchId"]) assert(!core.validateTarget({ ...target, [key]: "" }).valid, key);
assert(!core.validateTarget({ ...target, preparationType: "deferred" }).valid);
assert.equal(core.listEligibleTargets([target, { ...target, status: "failed" }]).length, 1);
assert(!start(target, { approverName: "", approverId: "" }).started);
assert(!start(target, { preparationConfirmed: false }).started);

core.resetRegistry();
const first = start(target);
assert(first.started);
assert(/^manual-post-import-formal-registration-execution-approval-20260820010203-\d{5}$/.test(first.record.formalRegistrationExecutionApprovalRecordId));
assert(!start(target).started);
for (const [key, expected] of Object.entries(core.SAFETY)) assert.strictEqual(first.record[key], expected, key);
const approved = core.finalizeApproval(first.record, target, { ...approvalBase, approvalType: "approve_execution" }, operation, clock);
assert(approved.finalized);
assert.equal(approved.record.approvalResult, "manual_post_import_formal_registration_execution_approved");
assert.equal(approved.record.status, "ready_for_manual_post_import_formal_registration_execution");
assert.equal(approved.record.registrationScope, "rows 1-2");
assert.equal(approved.record.registrationDestination, "private_local_store:formal_results");
assert.equal(approved.record.executorCandidate.name, "owner");
assert.equal(approved.record.authorityConfirmationResult, "confirmed");
assert.deepEqual(approved.record.requiredDocumentIds, ["doc1"]);

core.resetRegistry();
const conditionalTarget = { ...withId(target, "conditional"), preparationType: "prepared_with_conditions", registrationConditions: ["follow-up"], riskLevel: "low", warningCount: 1, acceptedWarningIssueIds: ["w1"], unresolvedIssueIds: ["w1"], requiredFollowUp: true, requiredAdditionalReview: true, prohibitedActions: ["formal_registration"], executionBlockers: ["condition-1"] };
const conditionalStart = start(conditionalTarget);
assert(!core.validateApproval(conditionalStart.record, conditionalTarget, { ...approvalBase, approvalType: "approve_execution" }, operation).valid);
assert(!core.validateApproval(conditionalStart.record, conditionalTarget, { ...approvalBase, approvalType: "conditional_approve_execution" }, operation).valid);
const conditional = core.finalizeApproval(conditionalStart.record, conditionalTarget, {
  ...approvalBase,
  approvalType: "conditional_approve_execution",
  executionApprovalConditions: ["condition-1完了"],
  conditionReason: "条件付き準備を引継ぎ",
  inheritedPreparationConditions: ["follow-up"],
  incompleteConditionIds: ["condition-1"],
  conditionCompletionStatus: "incomplete",
  acceptedRisk: "low",
  reviewedIssueIds: ["w1"],
  acceptedWarningIssueIds: ["w1"],
  unresolvedIssueIds: ["w1"],
  unresolvedIssueHandling: [{ issueId: "w1", conditionBeforeExecution: "follow-up完了" }],
  requiredFollowUp: true,
  followUpOwnerCandidate: "owner",
  followUpActionCandidate: "issue確認",
  followUpDueDateCandidate: "2026-09-01",
  requiredAdditionalReview: true,
  requiredDocuments: ["doc1", "follow-up evidence"],
  prohibitedActionsUntilConditionCompletion: ["formal_registration"],
  executionBlockers: ["condition-1"],
  approverComment: "条件を確認",
}, operation, clock);
assert(conditional.finalized);
assert.equal(conditional.record.approvalResult, "manual_post_import_formal_registration_execution_conditionally_approved");
assert.equal(conditional.record.status, "ready_for_manual_post_import_formal_registration_execution");
assert.deepEqual(conditional.record.acceptedWarningIssueIds, ["w1"]);
assert.deepEqual(conditional.record.unresolvedIssueIds, ["w1"]);

for (const [name, changed] of [
  ["count", { plannedRegistrationRecordCount: 1 }],
  ["mode", { registrationMode: "automatic" }],
  ["authority", { authorityConfirmed: false }],
  ["duties", { separationOfDutiesConfirmed: false }],
  ["docs", { missingDocumentIds: ["doc2"] }],
  ["checks", { preExecutionChecks: { ...checks, backupPlanConfirmed: false } }],
  ["duplicate", { duplicateHandlingPolicy: "" }],
]) {
  core.resetRegistry();
  const originalValue = withId(target, name);
  const value = { ...originalValue, ...changed };
  assert(!core.validateApproval(start(originalValue).record, value, { ...approvalBase, approvalType: "approve_execution" }, operation).valid, name);
}
for (const [suffix, severity] of [["critical", "criticalCount"], ["error", "errorCount"]]) {
  core.resetRegistry();
  const value = { ...withId(target, suffix), [severity]: 1 };
  const record = start(value).record;
  assert(!core.validateApproval(record, value, { ...approvalBase, approvalType: "approve_execution" }, operation).valid);
  assert(!core.validateApproval(record, { ...value, preparationType: "prepared_with_conditions" }, { ...approvalBase, approvalType: "conditional_approve_execution", executionApprovalConditions: ["x"], conditionReason: "x", inheritedPreparationConditions: [], incompleteConditionIds: [], conditionCompletionStatus: "incomplete", acceptedRisk: "high", requiredFollowUp: true, followUpOwnerCandidate: "owner", followUpActionCandidate: "review", prohibitedActionsUntilConditionCompletion: ["registration"], executionBlockers: [], approverComment: "x" }, operation).valid);
}

core.resetRegistry();
const returnTarget = withId(target, "return");
const returnStart = start(returnTarget);
assert(!core.validateApproval(returnStart.record, returnTarget, { ...approvalBase, approvalType: "return_for_preparation_revision", targetIssueIds: ["r1"] }, operation).valid);
const returned = core.finalizeApproval(returnStart.record, returnTarget, { ...approvalBase, approvalType: "return_for_preparation_revision", returnReason: "書類不足", returnSummary: "準備修正", targetIssueIds: ["r1"], documentIssues: ["doc2"], requiredCorrections: ["書類追加"], requiredAdditionalEvidence: ["doc2"], recommendedRevisionScope: "Phase26-18", responsiblePersonCandidate: "owner" }, operation, clock);
assert(returned.finalized);
assert.equal(returned.record.status, "ready_for_manual_post_import_formal_registration_preparation_revision");
assert.deepEqual(returned.record.targetIssueIds, ["r1"]);

core.resetRegistry();
const recheckTarget = withId(target, "recheck");
const recheckStart = start(recheckTarget);
assert(!core.validateApproval(recheckStart.record, recheckTarget, { ...approvalBase, approvalType: "recheck_required", targetIssueIds: ["c1"] }, operation).valid);
const rechecked = core.finalizeApproval(recheckStart.record, recheckTarget, { ...approvalBase, approvalType: "recheck_required", recheckReason: "証跡矛盾", targetIssueIds: ["c1"], missingInformation: ["source"], requiredReviewAreas: ["scope"], recommendedReviewPhase: "Phase26-18", requiredHumanReviewer: "owner", recheckConditions: ["再確認"] }, operation, clock);
assert(rechecked.finalized);
assert.equal(rechecked.record.status, "ready_for_manual_post_import_formal_registration_preparation_recheck");

core.resetRegistry();
const deferTarget = withId(target, "defer");
const deferStart = start(deferTarget);
assert(!core.validateApproval(deferStart.record, deferTarget, { ...approvalBase, approvalType: "defer" }, operation).valid);
const deferred = core.finalizeApproval(deferStart.record, deferTarget, { ...approvalBase, approvalType: "defer", deferReason: "実行日時待ち", missingInformation: ["execution window"] }, operation, clock);
assert(deferred.finalized);
assert.equal(deferred.record.deferReason, "実行日時待ち");

core.resetRegistry();
const interruptTarget = withId(target, "interrupt");
const interrupted = core.interruptApproval(start(interruptTarget).record, { interruptionReason: "環境異常", currentInputSnapshot: { type: "approve" }, unresolvedChecks: ["docs"] }, operation, clock);
assert(interrupted.interrupted);
assert.equal(interrupted.record.interruptionReason, "環境異常");
core.resetRegistry();
const cancelTarget = withId(target, "cancel");
const cancelled = core.cancelApproval(cancelTarget, { cancellationReason: "人間が取消", partialInput: { type: "defer" } }, operation, clock);
assert(cancelled.cancelled);
assert.equal(cancelled.record.cancellationReason, "人間が取消");
assert(!core.validateTarget(cancelTarget).valid);
assert(!core.transition({ status: "manual_post_import_formal_registration_execution_approved", stateHistory: [] }, "manual_post_import_formal_registration_execution_approval_deferred", operation, clock).transitioned);

const source = fs.readFileSync(path.join(root, "phase26-19-manual-post-import-formal-registration-execution-approval-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /setInterval\s*\(/, /localStorage\s*\.\s*setItem/, /automaticFormalRegistrationPerformed:\s*true/, /automaticFormalRegistrationStartPerformed:\s*true/, /automaticOperationReflectionPerformed:\s*true/, /automaticCorrectionPerformed:\s*true/, /automaticDeletionPerformed:\s*true/, /automaticReimportPerformed:\s*true/, /automaticRetryPerformed:\s*true/, /automaticRollbackPerformed:\s*true/, /automaticApplicationPerformed:\s*true/, /automaticLearningUpdatePerformed:\s*true/, /automaticSchedulingPerformed:\s*true/, /automaticNotificationPerformed:\s*true/]) assert(!pattern.test(source), String(pattern));
for (const marker of ['id="phase26-19-manual-post-import-formal-registration-execution-approval"', "Private Local only", "PLAN_ONLY", "protectedMode", "Phase26-18承認対象一覧", "正式登録準備記録詳細", "承認開始前最終確認", "承認者入力", "手動実行承認を開始", "登録対象範囲表示", "登録除外範囲表示", "登録予定件数表示", "登録先情報", "登録方式", "重複・競合・既存レコード方針", "実行者候補", "権限確認", "職務分離確認", "warning一覧", "unresolvedIssue一覧", "条件付き準備条件", "必要書類一覧", "実行前確認事項", "バックアップ・ロールバック確認", "実行日時候補", "実行環境", "実行依存条件", "実行阻害要因", "承認種別選択", "承認理由入力", "条件付き実行承認内容", "差戻し内容", "再確認要求内容", "保留内容", "承認を確定する", "承認作業を中断する", "承認作業を取り消す", "承認証跡一覧", "次状態表示"]) assert(html.includes(marker), marker);
assert(css.includes(".phase2619-panel"));
assert(readme.includes("Phase26-19 Manual Post-Import Formal Registration Execution Approval Core"));
console.log("phase26ManualPostImportFormalRegistrationExecutionApprovalCore.test.js: PASS");
