"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase2615 = require("../phase26-15-manual-post-import-verification-decision-core.js");
const core = require("../phase26-16-manual-post-import-acceptance-record-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-17T01:02:03Z") };
const operation = { performedBy: "owner", reason: "manual acceptance recording", explicitConfirmation: true };
const target = {
  phase2615DecisionRecordExists: true,
  decisionRecordId: "decision-1",
  verificationRecordId: "verification-1",
  importBatchId: "batch-1",
  candidateId: "candidate-1",
  approvalRecordId: "approval-1",
  sourceDataId: "source-1",
  sourceDataName: "results.json",
  sourceDataHash: "hash-1",
  destinationType: "private_local_store",
  destinationName: "formal_results",
  deciderId: "decider-1",
  deciderName: "owner",
  decisionStartedAt: "2026-08-17T00:00:00Z",
  decisionCompletedAt: "2026-08-17T00:01:00Z",
  status: "ready_for_manual_post_import_acceptance_record",
  decisionType: "accept",
  decisionReason: "検証済み",
  riskLevel: "none",
  warningCount: 0,
  errorCount: 0,
  criticalCount: 0,
  reviewedIssueIds: [],
  acceptedWarningIssueIds: [],
  unresolvedIssueIds: [],
  affectedRecordCount: 2,
  businessImpact: "none",
  dataImpact: "none",
  followUpRequired: false,
  rollbackCandidateId: "",
  protectedMode: true,
  planOnly: true,
};
const input = {
  recorderId: "recorder-1",
  recorderName: "owner",
  confirmDecisionRecordId: target.decisionRecordId,
  confirmImportBatchId: target.importBatchId,
  acceptanceContentConfirmed: true,
  warningsConfirmed: true,
  unresolvedIssuesConfirmed: true,
  noAutomaticFormalRegistrationConfirmed: true,
  noAutomaticApplicationConfirmed: true,
  noAutomaticLearningUpdateConfirmed: true,
  noAutomaticRollbackConfirmed: true,
};
const acceptanceBase = {
  acceptanceReason: "手動確認済み",
  acceptanceSummary: "正式な受理記録",
  acceptanceScope: "source rows 1-2",
  acceptedRecordCount: 2,
  acceptedSourceRecordIds: ["s1", "s2"],
  acceptedDestinationRecordIds: ["d1", "d2"],
  excludedRecordCount: 0,
  excludedSourceRecordIds: [],
  excludedDestinationRecordIds: [],
  exclusionReasons: [],
  acceptanceStartBoundary: "row 1",
  acceptanceEndBoundary: "row 2",
  dataCategory: "race_result",
  affectedBusinessKeys: ["race-1-horse-1", "race-1-horse-2"],
  handoffRequired: true,
  handoffTarget: "manual acceptance approval",
  handoffPurpose: "次フェーズの人間承認",
  handoffConditions: ["証跡確認", "明示承認"],
  requiredManualApproval: true,
  requiredAdditionalReview: false,
  requiredDocuments: ["verification evidence"],
  requiredIssueFollowUp: [],
  prohibitedAutomaticActions: ["formal_registration", "application", "learning_update"],
  nextResponsiblePersonCandidate: "owner",
  nextActionSummary: "受理承認を手動検討",
  humanComment: "確認済み",
};
const withId = (value, suffix) => ({ ...value, decisionRecordId: `${value.decisionRecordId}-${suffix}`, verificationRecordId: `${value.verificationRecordId}-${suffix}`, importBatchId: `${value.importBatchId}-${suffix}`, candidateId: `${value.candidateId}-${suffix}` });
const start = (value, changed = {}) => core.startAcceptanceRecord(value, { ...input, confirmDecisionRecordId: value.decisionRecordId, confirmImportBatchId: value.importBatchId, ...changed }, operation, clock);

core.resetRegistry();
assert.strictEqual(core.PHASE2615_REFERENCE, phase2615);
assert(core.validateTarget(target).valid);
assert(!core.validateTarget({ ...target, status: "ready_for_manual_post_import_reconciliation_planning" }).valid);
assert(!core.validateTarget({ ...target, phase2615DecisionRecordExists: false }).valid);
assert(!core.validateTarget({ ...target, decisionRecordId: "" }).valid);
assert(!core.validateTarget({ ...target, verificationRecordId: "" }).valid);
assert(!core.validateTarget({ ...target, importBatchId: "" }).valid);
assert(!core.validateTarget({ ...target, decisionType: "defer" }).valid);
assert.equal(core.listEligibleTargets([target, { ...target, status: "failed" }]).length, 1);
assert(!start(target, { recorderName: "", recorderId: "" }).started);
assert(!start(target, { acceptanceContentConfirmed: false }).started);

core.resetRegistry();
const first = start(target);
assert(first.started);
assert(/^manual-post-import-acceptance-record-20260817010203-\d{5}$/.test(first.record.acceptanceRecordId));
assert(!start(target).started);
for (const [key, expected] of Object.entries(core.SAFETY)) assert.strictEqual(first.record[key], expected, key);
const accepted = core.finalizeAcceptance(first.record, target, { ...acceptanceBase, acceptanceType: "accepted" }, operation, clock);
assert(accepted.finalized);
assert.equal(accepted.record.acceptanceResult, "manual_post_import_acceptance_record_confirmed");
assert.equal(accepted.record.status, "ready_for_manual_post_import_acceptance_approval");
assert.equal(accepted.record.acceptedRecordCount, 2);
assert.equal(accepted.record.excludedRecordCount, 0);
assert.equal(accepted.record.acceptanceScope, "source rows 1-2");
assert.equal(accepted.record.handoffTarget, "manual acceptance approval");
assert.deepEqual(accepted.record.handoffConditions, ["証跡確認", "明示承認"]);
assert.strictEqual(accepted.record.requiredManualApproval, true);
assert(!core.validateAcceptance(first.record, target, { ...acceptanceBase, acceptanceType: "accepted_with_warnings" }, operation).valid);

core.resetRegistry();
const warningTarget = { ...withId(target, "warning"), decisionType: "accept_with_warnings", riskLevel: "low", warningCount: 1, acceptedWarningIssueIds: ["w1"], unresolvedIssueIds: ["w1"], reviewedIssueIds: ["w1"] };
const warningStart = start(warningTarget);
assert(!core.validateAcceptance(warningStart.record, warningTarget, { ...acceptanceBase, acceptanceType: "accepted" }, operation).valid);
assert(!core.validateAcceptance(warningStart.record, warningTarget, { ...acceptanceBase, acceptanceType: "accepted_with_warnings", acceptedWarningIssueIds: ["w1"] }, operation).valid);
const warningAccepted = core.finalizeAcceptance(warningStart.record, warningTarget, {
  ...acceptanceBase,
  acceptanceType: "accepted_with_warnings",
  acceptedWarningIssueIds: ["w1"],
  unresolvedIssueHandling: [{ issueId: "w1", currentStatus: "known", acceptanceImpact: "low", acceptedAsKnownIssue: true, followUpRequired: true, humanComment: "追跡する" }],
  warningAcceptanceReason: "影響が軽微",
  warningAcceptanceConditions: ["後続で追跡"],
  operationalCautions: ["適用前に再確認"],
  futureCorrectionRequired: true,
  additionalVerificationRequired: true,
  responsiblePersonCandidate: "owner",
  followUpDueDateCandidate: "2026-09-01",
}, operation, clock);
assert(warningAccepted.finalized);
assert.equal(warningAccepted.record.acceptanceResult, "manual_post_import_acceptance_record_confirmed_with_warnings");
assert.equal(warningAccepted.record.status, "ready_for_manual_post_import_acceptance_approval");
assert.deepEqual(warningAccepted.record.acceptedWarningIssueIds, ["w1"]);
assert.equal(warningAccepted.record.unresolvedIssueHandling[0].issueId, "w1");

core.resetRegistry();
const severeTarget = { ...withId(target, "severe"), criticalCount: 1 };
const severeStart = start(severeTarget);
assert(!core.validateAcceptance(severeStart.record, severeTarget, { ...acceptanceBase, acceptanceType: "accepted" }, operation).valid);
core.resetRegistry();
const errorTarget = { ...withId(target, "error"), errorCount: 1 };
assert(!core.validateAcceptance(start(errorTarget).record, errorTarget, { ...acceptanceBase, acceptanceType: "accepted" }, operation).valid);

core.resetRegistry();
const mismatchTarget = withId(target, "mismatch");
const mismatchStart = start(mismatchTarget);
assert(!core.validateAcceptance(mismatchStart.record, mismatchTarget, { ...acceptanceBase, acceptanceType: "accepted", acceptedRecordCount: 1 }, operation).valid);
const excluded = core.finalizeAcceptance(mismatchStart.record, mismatchTarget, { ...acceptanceBase, acceptanceType: "accepted", acceptedRecordCount: 1, acceptedSourceRecordIds: ["s1"], acceptedDestinationRecordIds: ["d1"], excludedRecordCount: 1, excludedSourceRecordIds: ["s2"], excludedDestinationRecordIds: ["d2"], exclusionReasons: ["human exclusion"] }, operation, clock);
assert(excluded.finalized);
assert.equal(excluded.record.excludedRecordCount, 1);
assert.deepEqual(excluded.record.exclusionReasons, ["human exclusion"]);

core.resetRegistry();
const recheckTarget = withId(target, "recheck");
const recheckStart = start(recheckTarget);
const recheck = core.finalizeAcceptance(recheckStart.record, recheckTarget, { acceptanceType: "recheck_required", acceptanceReason: "新規問題", acceptanceSummary: "再確認", recheckReason: "記録矛盾", detectedIssueIds: ["new1"], newlyDetectedIssues: [{ issueId: "new1" }], affectedRecordCount: 1, affectedRecordIds: ["d1"], recommendedReviewPhase: "Phase26-15", requiredHumanReviewer: "owner", recheckConditions: ["証跡再確認"] }, operation, clock);
assert(recheck.finalized && recheck.record.recheckRequired);
assert.equal(recheck.record.status, "manual_post_import_acceptance_recheck_required");
assert.equal(recheck.record.newlyDetectedIssues[0].issueId, "new1");

core.resetRegistry();
const deferTarget = withId(target, "defer");
const deferStart = start(deferTarget);
assert(!core.validateAcceptance(deferStart.record, deferTarget, { acceptanceType: "deferred", acceptanceReason: "hold", acceptanceSummary: "hold" }, operation).valid);
const deferred = core.finalizeAcceptance(deferStart.record, deferTarget, { acceptanceType: "deferred", acceptanceReason: "hold", acceptanceSummary: "hold", deferReason: "資料不足", missingInformation: ["担当者確認"] }, operation, clock);
assert(deferred.finalized);
assert.equal(deferred.record.deferReason, "資料不足");
assert.deepEqual(deferred.record.missingInformation, ["担当者確認"]);

core.resetRegistry();
const interruptTarget = withId(target, "interrupt");
const interrupted = core.interruptAcceptance(start(interruptTarget).record, { interruptionReason: "環境異常", currentInputSnapshot: { scope: "partial" }, unresolvedChecks: ["warning"] }, operation, clock);
assert(interrupted.interrupted);
assert.equal(interrupted.record.interruptionReason, "環境異常");
core.resetRegistry();
const cancelTarget = withId(target, "cancel");
const cancelled = core.cancelAcceptance(cancelTarget, { cancellationReason: "人間が取消", partialInput: { scope: "draft" } }, operation, clock);
assert(cancelled.cancelled);
assert.equal(cancelled.record.cancellationReason, "人間が取消");
assert(!core.validateTarget(cancelTarget).valid);
assert(!core.transition({ status: "manual_post_import_acceptance_record_confirmed", stateHistory: [] }, "manual_post_import_acceptance_record_deferred", operation, clock).transitioned);

const source = fs.readFileSync(path.join(root, "phase26-16-manual-post-import-acceptance-record-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /setInterval\s*\(/, /localStorage\s*\.\s*setItem/, /automaticFormalRegistrationPerformed:\s*true/, /automaticCorrectionPerformed:\s*true/, /automaticDeletionPerformed:\s*true/, /automaticReimportPerformed:\s*true/, /automaticRetryPerformed:\s*true/, /automaticRollbackPerformed:\s*true/, /automaticApplicationPerformed:\s*true/, /automaticLearningUpdatePerformed:\s*true/]) assert(!pattern.test(source), String(pattern));
for (const marker of ['id="phase26-16-manual-post-import-acceptance-record"', "Private Local only", "PLAN_ONLY", "protectedMode", "Phase26-15受理対象一覧", "判定記録詳細", "受理記録前再確認", "受理記録作成者入力", "手動受理記録を開始", "受理範囲入力", "除外範囲入力", "warning一覧", "acceptedWarning一覧", "unresolvedIssue一覧", "影響範囲表示", "riskLevel表示", "引継ぎ条件入力", "再確認必要内容", "保留内容", "受理記録を確定", "受理記録を中断", "受理記録を取り消す", "受理記録証跡一覧", "次状態表示"]) assert(html.includes(marker), marker);
assert(css.includes(".phase2616-panel"));
assert(readme.includes("Phase26-16 Manual Post-Import Acceptance Record Core"));
console.log("phase26ManualPostImportAcceptanceRecordCore.test.js: PASS");
