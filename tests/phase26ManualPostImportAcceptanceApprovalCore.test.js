"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase2616 = require("../phase26-16-manual-post-import-acceptance-record-core.js");
const core = require("../phase26-17-manual-post-import-acceptance-approval-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-18T01:02:03Z") };
const operation = { performedBy: "owner", reason: "manual acceptance approval", explicitConfirmation: true };
const target = {
  phase2616AcceptanceRecordExists: true,
  acceptanceRecordId: "acceptance-1",
  decisionRecordId: "decision-1",
  verificationRecordId: "verification-1",
  importBatchId: "batch-1",
  candidateId: "candidate-1",
  approvalRecordId: "approval-1",
  sourceDataId: "source-1",
  sourceDataName: "results.json",
  destinationType: "private_local_store",
  destinationName: "formal_results",
  recorderId: "recorder-1",
  recorderName: "owner",
  recordingStartedAt: "2026-08-18T00:00:00Z",
  recordingCompletedAt: "2026-08-18T00:01:00Z",
  status: "ready_for_manual_post_import_acceptance_approval",
  acceptanceType: "accepted",
  acceptanceReason: "手動確認済み",
  acceptanceScope: "rows 1-2",
  riskLevel: "none",
  acceptedRecordCount: 2,
  excludedRecordCount: 0,
  warningCount: 0,
  errorCount: 0,
  criticalCount: 0,
  acceptedWarningIssueIds: [],
  unresolvedIssueIds: [],
  handoffRequired: true,
  handoffTarget: "formal registration preparation",
  handoffConditions: ["人間承認", "証跡確認"],
  requiredManualApproval: true,
  followUpRequired: false,
  rollbackCandidateId: "",
  protectedMode: true,
  planOnly: true,
};
const input = {
  approverId: "approver-1",
  approverName: "owner",
  confirmAcceptanceRecordId: target.acceptanceRecordId,
  confirmImportBatchId: target.importBatchId,
  acceptanceRecordConfirmed: true,
  warningsConfirmed: true,
  unresolvedIssuesConfirmed: true,
  handoffConditionsConfirmed: true,
  noAutomaticFormalRegistrationConfirmed: true,
  noAutomaticApplicationConfirmed: true,
  noAutomaticLearningUpdateConfirmed: true,
  noAutomaticRollbackConfirmed: true,
};
const approvalBase = {
  approvalReason: "受理記録を最終確認",
  approvalSummary: "人間による承認",
  acceptedRisk: "none",
  reviewedIssueIds: [],
  acceptedWarningIssueIds: [],
  unresolvedIssueIds: [],
  affectedRecordCount: 2,
  affectedDestinationRecordIds: ["d1", "d2"],
  approvalScope: "rows 1-2",
  approvalExclusions: [],
  businessImpact: "none",
  dataImpact: "none",
  humanComment: "確認済み",
};
const withId = (value, suffix) => ({ ...value, acceptanceRecordId: `${value.acceptanceRecordId}-${suffix}`, decisionRecordId: `${value.decisionRecordId}-${suffix}`, verificationRecordId: `${value.verificationRecordId}-${suffix}`, importBatchId: `${value.importBatchId}-${suffix}`, candidateId: `${value.candidateId}-${suffix}` });
const start = (value, changed = {}) => core.startApproval(value, { ...input, confirmAcceptanceRecordId: value.acceptanceRecordId, confirmImportBatchId: value.importBatchId, ...changed }, operation, clock);

core.resetRegistry();
assert.strictEqual(core.PHASE2616_REFERENCE, phase2616);
assert(core.validateTarget(target).valid);
assert(!core.validateTarget({ ...target, status: "manual_post_import_acceptance_recheck_required" }).valid);
assert(!core.validateTarget({ ...target, phase2616AcceptanceRecordExists: false }).valid);
assert(!core.validateTarget({ ...target, acceptanceRecordId: "" }).valid);
assert(!core.validateTarget({ ...target, decisionRecordId: "" }).valid);
assert(!core.validateTarget({ ...target, verificationRecordId: "" }).valid);
assert(!core.validateTarget({ ...target, importBatchId: "" }).valid);
assert(!core.validateTarget({ ...target, acceptanceType: "deferred" }).valid);
assert.equal(core.listEligibleTargets([target, { ...target, status: "failed" }]).length, 1);
assert(!start(target, { approverName: "", approverId: "" }).started);
assert(!start(target, { acceptanceRecordConfirmed: false }).started);

core.resetRegistry();
const first = start(target);
assert(first.started);
assert(/^manual-post-import-acceptance-approval-20260818010203-\d{5}$/.test(first.record.acceptanceApprovalRecordId));
assert(!start(target).started);
for (const [key, expected] of Object.entries(core.SAFETY)) assert.strictEqual(first.record[key], expected, key);
const approved = core.finalizeApproval(first.record, target, { ...approvalBase, approvalType: "approve" }, operation, clock);
assert(approved.finalized);
assert.equal(approved.record.approvalResult, "manual_post_import_acceptance_approved");
assert.equal(approved.record.status, "ready_for_manual_post_import_formal_registration_preparation");
assert.equal(approved.record.riskLevel, "none");

core.resetRegistry();
const warningTarget = { ...withId(target, "warning"), acceptanceType: "accepted_with_warnings", riskLevel: "low", warningCount: 1, acceptedWarningIssueIds: ["w1"], unresolvedIssueIds: ["w1"], followUpRequired: true };
const warningStart = start(warningTarget);
assert(!core.validateApproval(warningStart.record, warningTarget, { ...approvalBase, approvalType: "approve" }, operation).valid);
assert(!core.validateApproval(warningStart.record, warningTarget, { ...approvalBase, approvalType: "conditional_approve", acceptedWarningIssueIds: ["w1"] }, operation).valid);
const conditional = core.finalizeApproval(warningStart.record, warningTarget, {
  ...approvalBase,
  approvalType: "conditional_approve",
  approvalConditions: ["follow-up完了まで正式登録禁止"],
  conditionReason: "軽微なwarning",
  acceptedRisk: "low",
  reviewedIssueIds: ["w1"],
  acceptedWarningIssueIds: ["w1"],
  unresolvedIssueIds: ["w1"],
  requiredFollowUp: true,
  followUpOwnerCandidate: "owner",
  followUpActionCandidate: "issue再確認",
  followUpDueDateCandidate: "2026-09-01",
  requiredAdditionalReview: true,
  requiredDocuments: ["follow-up evidence"],
  prohibitedActionsUntilFollowUp: ["formal_registration", "application"],
  approverComment: "条件を確認",
}, operation, clock);
assert(conditional.finalized);
assert.equal(conditional.record.approvalResult, "manual_post_import_acceptance_conditionally_approved");
assert.equal(conditional.record.status, "ready_for_manual_post_import_formal_registration_preparation");
assert.deepEqual(conditional.record.acceptedWarningIssueIds, ["w1"]);
assert.deepEqual(conditional.record.unresolvedIssueIds, ["w1"]);
assert.equal(conditional.record.acceptedRisk, "low");

core.resetRegistry();
const plainConditionalTarget = withId(target, "new-condition");
const plainConditionalStart = start(plainConditionalTarget);
assert(!core.validateApproval(plainConditionalStart.record, plainConditionalTarget, { ...approvalBase, approvalType: "conditional_approve", approvalConditions: ["x"], conditionReason: "new", acceptedRisk: "low", acceptedWarningIssueIds: ["new"], requiredFollowUp: true, followUpOwnerCandidate: "owner", followUpActionCandidate: "review", prohibitedActionsUntilFollowUp: ["registration"], approverComment: "x" }, operation).valid);

for (const [suffix, severity] of [["critical", "criticalCount"], ["error", "errorCount"]]) {
  core.resetRegistry();
  const severeTarget = { ...withId(target, suffix), [severity]: 1 };
  const severeStart = start(severeTarget);
  assert(!core.validateApproval(severeStart.record, severeTarget, { ...approvalBase, approvalType: "approve" }, operation).valid);
  assert(!core.validateApproval(severeStart.record, severeTarget, { ...approvalBase, approvalType: "conditional_approve", approvalConditions: ["x"], conditionReason: "x", acceptedRisk: "high", acceptedWarningIssueIds: ["x"], requiredFollowUp: true, followUpOwnerCandidate: "owner", followUpActionCandidate: "review", prohibitedActionsUntilFollowUp: ["registration"], approverComment: "x" }, operation).valid);
}

core.resetRegistry();
const returnTarget = withId(target, "return");
const returnStart = start(returnTarget);
assert(!core.validateApproval(returnStart.record, returnTarget, { ...approvalBase, approvalType: "return_for_revision", targetIssueIds: ["r1"] }, operation).valid);
const returned = core.finalizeApproval(returnStart.record, returnTarget, { ...approvalBase, approvalType: "return_for_revision", returnReason: "受理範囲不足", returnSummary: "修正必要", targetIssueIds: ["r1"], affectedRecordIds: ["d1"], insufficientFields: ["scope"], requiredCorrections: ["scope修正"], requiredAdditionalEvidence: ["mapping"], recommendedRevisionScope: "Phase26-16 record", responsiblePersonCandidate: "owner" }, operation, clock);
assert(returned.finalized);
assert.equal(returned.record.status, "ready_for_manual_post_import_acceptance_record_revision");
assert.deepEqual(returned.record.targetIssueIds, ["r1"]);

core.resetRegistry();
const recheckTarget = withId(target, "recheck");
const recheckStart = start(recheckTarget);
assert(!core.validateApproval(recheckStart.record, recheckTarget, { ...approvalBase, approvalType: "recheck_required", targetIssueIds: ["c1"] }, operation).valid);
const rechecked = core.finalizeApproval(recheckStart.record, recheckTarget, { ...approvalBase, approvalType: "recheck_required", recheckReason: "証跡矛盾", targetIssueIds: ["c1"], missingInformation: ["source evidence"], requiredReviewAreas: ["mapping"], recommendedReviewPhase: "Phase26-14", requiredHumanReviewer: "owner", recheckConditions: ["証跡再確認"] }, operation, clock);
assert(rechecked.finalized);
assert.equal(rechecked.record.status, "ready_for_manual_post_import_acceptance_recheck");

core.resetRegistry();
const deferTarget = withId(target, "defer");
const deferStart = start(deferTarget);
assert(!core.validateApproval(deferStart.record, deferTarget, { ...approvalBase, approvalType: "defer" }, operation).valid);
const deferred = core.finalizeApproval(deferStart.record, deferTarget, { ...approvalBase, approvalType: "defer", deferReason: "上位確認待ち", missingInformation: ["承認資料"] }, operation, clock);
assert(deferred.finalized);
assert.equal(deferred.record.deferReason, "上位確認待ち");

core.resetRegistry();
const interruptTarget = withId(target, "interrupt");
const interrupted = core.interruptApproval(start(interruptTarget).record, { interruptionReason: "環境異常", currentInputSnapshot: { type: "approve" }, unresolvedChecks: ["scope"] }, operation, clock);
assert(interrupted.interrupted);
assert.equal(interrupted.record.interruptionReason, "環境異常");
core.resetRegistry();
const cancelTarget = withId(target, "cancel");
const cancelled = core.cancelApproval(cancelTarget, { cancellationReason: "人間が取消", partialInput: { type: "defer" } }, operation, clock);
assert(cancelled.cancelled);
assert.equal(cancelled.record.cancellationReason, "人間が取消");
assert(!core.validateTarget(cancelTarget).valid);
assert(!core.transition({ status: "manual_post_import_acceptance_approved", stateHistory: [] }, "manual_post_import_acceptance_approval_deferred", operation, clock).transitioned);

const source = fs.readFileSync(path.join(root, "phase26-17-manual-post-import-acceptance-approval-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /setInterval\s*\(/, /localStorage\s*\.\s*setItem/, /automaticFormalRegistrationPerformed:\s*true/, /automaticOperationReflectionPerformed:\s*true/, /automaticCorrectionPerformed:\s*true/, /automaticDeletionPerformed:\s*true/, /automaticReimportPerformed:\s*true/, /automaticRetryPerformed:\s*true/, /automaticRollbackPerformed:\s*true/, /automaticApplicationPerformed:\s*true/, /automaticLearningUpdatePerformed:\s*true/]) assert(!pattern.test(source), String(pattern));
for (const marker of ['id="phase26-17-manual-post-import-acceptance-approval"', "Private Local only", "PLAN_ONLY", "protectedMode", "Phase26-16承認対象一覧", "受理記録詳細", "承認前最終確認", "承認者入力", "手動承認を開始", "受理範囲表示", "除外範囲表示", "warning一覧", "acceptedWarning一覧", "unresolvedIssue一覧", "riskLevel表示", "引継ぎ条件表示", "承認種別選択", "承認理由入力", "条件付き承認内容", "差戻し内容", "再確認要求内容", "保留内容", "承認を確定する", "承認作業を中断する", "承認作業を取り消す", "承認証跡一覧", "次状態表示"]) assert(html.includes(marker), marker);
assert(css.includes(".phase2617-panel"));
assert(readme.includes("Phase26-17 Manual Post-Import Acceptance Approval Core"));
console.log("phase26ManualPostImportAcceptanceApprovalCore.test.js: PASS");
