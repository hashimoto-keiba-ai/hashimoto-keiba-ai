"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase2614 = require("../phase26-14-manual-post-import-verification-core.js");
const core = require("../phase26-15-manual-post-import-verification-decision-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-16T01:02:03Z") };
const operation = { performedBy: "owner", reason: "manual verification decision", explicitConfirmation: true };
const target = {
  phase2614VerificationRecordExists: true,
  verificationRecordId: "verification-1",
  importBatchId: "batch-1",
  candidateId: "candidate-1",
  approvalRecordId: "approval-1",
  sourceDataId: "source-1",
  sourceDataName: "result.json",
  sourceDataHash: "hash-1",
  destinationType: "private_local_store",
  destinationName: "formal_results",
  verifierId: "verifier-1",
  verifierName: "owner",
  verificationStartedAt: "2026-08-16T00:00:00Z",
  verificationCompletedAt: "2026-08-16T00:01:00Z",
  status: "ready_for_manual_post_import_verification_decision",
  verificationResult: "manual_post_import_verification_passed",
  countVerification: { preImportCount: 10, plannedImportCount: 2, successfullyImportedCount: 2, failedImportCount: 0, skippedImportCount: 0, postImportCount: 12, isConsistent: true },
  duplicateVerification: { duplicateCount: 0, duplicateItems: [], hasCriticalDuplicate: false },
  missingVerification: { missingCount: 0, missingItems: [], hasCriticalMissing: false },
  mappingVerification: { matchedCount: 2, warningCount: 0, sourceOnlyCount: 0, destinationOnlyCount: 0, duplicateMappingCount: 0, missingMappingCount: 0, invalidMappingCount: 0 },
  warningCount: 0,
  errorCount: 0,
  criticalCount: 0,
  issues: [],
  rollbackCandidateId: "",
  reconciliationRequired: false,
  rollbackReviewRequired: false,
  protectedMode: true,
  planOnly: true,
};
const input = {
  deciderId: "decider-1",
  deciderName: "owner",
  confirmVerificationRecordId: target.verificationRecordId,
  confirmImportBatchId: target.importBatchId,
  decisionStartConfirmed: true,
  noAutomaticCorrectionConfirmed: true,
  noAutomaticReimportConfirmed: true,
  noAutomaticRollbackConfirmed: true,
  noAutomaticApplicationConfirmed: true,
  noAutomaticLearningUpdateConfirmed: true,
};
const decisionBase = {
  decisionReason: "検証証跡を確認した",
  decisionSummary: "手動判定",
  riskLevel: "none",
  reviewedIssueIds: [],
  acceptedWarningIssueIds: [],
  unresolvedIssueIds: [],
  affectedRecordCount: 0,
  affectedDestinationRecordIds: [],
  businessImpact: "none",
  dataImpact: "none",
  followUpRequired: false,
  humanComment: "確認済み",
};
const withId = (value, suffix) => ({ ...value, verificationRecordId: `${value.verificationRecordId}-${suffix}`, importBatchId: `${value.importBatchId}-${suffix}`, candidateId: `${value.candidateId}-${suffix}` });
const start = (value, changed = {}) => core.startDecision(value, { ...input, confirmVerificationRecordId: value.verificationRecordId, confirmImportBatchId: value.importBatchId, ...changed }, operation, clock);

core.resetRegistry();
assert.strictEqual(core.PHASE2614_REFERENCE, phase2614);
assert(core.validateTarget(target).valid);
assert(!core.validateTarget({ ...target, status: "manual_post_import_verification_failed" }).valid);
assert(!core.validateTarget({ ...target, phase2614VerificationRecordExists: false }).valid);
assert(!core.validateTarget({ ...target, verificationRecordId: "" }).valid);
assert(!core.validateTarget({ ...target, importBatchId: "" }).valid);
assert.equal(core.listEligibleTargets([target, { ...target, status: "failed" }]).length, 1);
assert(!start(target, { deciderName: "", deciderId: "" }).started);
assert(!start(target, { decisionStartConfirmed: false }).started);

core.resetRegistry();
const first = start(target);
assert(first.started);
assert(/^manual-post-import-verification-decision-20260816010203-\d{5}$/.test(first.record.decisionRecordId));
assert(!start(target).started);
for (const [key, expected] of Object.entries(core.SAFETY)) assert.strictEqual(first.record[key], expected, key);
const accepted = core.finalizeDecision(first.record, target, { ...decisionBase, decisionType: "accept" }, operation, clock);
assert(accepted.finalized);
assert.equal(accepted.record.decisionResult, "manual_post_import_verified_result_accepted");
assert.equal(accepted.record.status, "ready_for_manual_post_import_acceptance_record");
assert.equal(accepted.record.riskLevel, "none");
assert(!core.validateDecision(first.record, target, { ...decisionBase, decisionType: "accept_with_warnings" }, operation).valid);

core.resetRegistry();
const warningTarget = { ...withId(target, "warning"), verificationResult: "manual_post_import_verification_passed_with_warnings", warningCount: 1, issues: [{ issueId: "w1", severity: "warning" }] };
const warningStart = start(warningTarget);
assert(!core.validateDecision(warningStart.record, warningTarget, { ...decisionBase, decisionType: "accept" }, operation).valid);
assert(!core.validateDecision(warningStart.record, warningTarget, { ...decisionBase, decisionType: "accept_with_warnings", acceptedWarningIssueIds: ["w1"] }, operation).valid);
const warningAccepted = core.finalizeDecision(warningStart.record, warningTarget, { ...decisionBase, decisionType: "accept_with_warnings", riskLevel: "low", acceptedWarningIssueIds: ["w1"], reviewedIssueIds: ["w1"], warningAcceptanceReason: "影響が軽微" }, operation, clock);
assert(warningAccepted.finalized);
assert.equal(warningAccepted.record.status, "ready_for_manual_post_import_acceptance_record");
assert.deepEqual(warningAccepted.record.acceptedWarningIssueIds, ["w1"]);

core.resetRegistry();
const criticalTarget = { ...withId(target, "critical"), verificationResult: "manual_post_import_verification_failed", criticalCount: 1, issues: [{ issueId: "c1", severity: "critical" }], rollbackCandidateId: "rollback-1" };
const criticalStart = start(criticalTarget);
assert(!core.validateDecision(criticalStart.record, criticalTarget, { ...decisionBase, decisionType: "accept" }, operation).valid);
assert(!core.validateDecision(criticalStart.record, criticalTarget, { ...decisionBase, decisionType: "accept_with_warnings", warningAcceptanceReason: "x", acceptedWarningIssueIds: ["c1"] }, operation).valid);
assert(!core.validateDecision(criticalStart.record, criticalTarget, { ...decisionBase, decisionType: "reconciliation_required", reviewedIssueIds: ["c1"] }, operation).valid);
const reconciliation = core.finalizeDecision(criticalStart.record, criticalTarget, { ...decisionBase, decisionType: "reconciliation_required", riskLevel: "high", reviewedIssueIds: ["c1"], unresolvedIssueIds: ["c1"], reconciliationReason: "重大不整合", affectedRecordCount: 1, affectedDestinationRecordIds: ["d1"] }, operation, clock);
assert(reconciliation.finalized);
assert(reconciliation.record.reconciliationRequired);
assert.equal(reconciliation.record.status, "ready_for_manual_post_import_reconciliation_planning");
assert.equal(reconciliation.record.affectedRecordCount, 1);
assert.deepEqual(reconciliation.record.unresolvedIssueIds, ["c1"]);

core.resetRegistry();
const rollbackTarget = withId(criticalTarget, "rollback");
const rollbackStart = start(rollbackTarget);
assert(!core.validateDecision(rollbackStart.record, { ...rollbackTarget, rollbackCandidateId: "" }, { ...decisionBase, decisionType: "rollback_review_required", reviewedIssueIds: ["c1"], rollbackReviewReason: "取消検討" }, operation).valid);
const rollback = core.finalizeDecision(rollbackStart.record, rollbackTarget, { ...decisionBase, decisionType: "rollback_review_required", riskLevel: "critical", reviewedIssueIds: ["c1"], rollbackReviewReason: "取消検討" }, operation, clock);
assert(rollback.finalized);
assert(rollback.record.rollbackReviewRequired);
assert.equal(rollback.record.rollbackCandidateId, "rollback-1");
assert.equal(rollback.record.status, "ready_for_manual_post_import_rollback_review");

core.resetRegistry();
const deferTarget = withId(target, "defer");
const deferStart = start(deferTarget);
assert(!core.validateDecision(deferStart.record, deferTarget, { ...decisionBase, decisionType: "defer" }, operation).valid);
const deferred = core.finalizeDecision(deferStart.record, deferTarget, { ...decisionBase, decisionType: "defer", riskLevel: "medium", deferReason: "追加確認待ち", missingInformation: ["取込先担当者確認"] }, operation, clock);
assert(deferred.finalized);
assert.equal(deferred.record.status, "manual_post_import_verification_decision_deferred");
assert.deepEqual(deferred.record.missingInformation, ["取込先担当者確認"]);

core.resetRegistry();
const interruptTarget = withId(target, "interrupt");
const interrupted = core.interruptDecision(start(interruptTarget).record, { interruptionReason: "環境異常", partialSelection: { decisionType: "defer" }, unreviewedIssueIds: ["x"] }, operation, clock);
assert(interrupted.interrupted);
assert.equal(interrupted.record.interruptionReason, "環境異常");
assert.strictEqual(interrupted.record.restartAllowed, false);
core.resetRegistry();
const cancelTarget = withId(target, "cancel");
const cancelled = core.cancelDecision(cancelTarget, { cancellationReason: "人間が取消", partialInput: { note: "途中" } }, operation, clock);
assert(cancelled.cancelled);
assert.equal(cancelled.record.cancellationReason, "人間が取消");
assert(!core.validateTarget(cancelTarget).valid);
assert(!core.transition({ status: "manual_post_import_verified_result_accepted", stateHistory: [] }, "manual_post_import_verification_decision_deferred", operation, clock).transitioned);

const source = fs.readFileSync(path.join(root, "phase26-15-manual-post-import-verification-decision-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /setInterval\s*\(/, /localStorage\s*\.\s*setItem/, /automaticCorrectionPerformed:\s*true/, /automaticDeletionPerformed:\s*true/, /automaticReimportPerformed:\s*true/, /automaticRetryPerformed:\s*true/, /automaticRollbackPerformed:\s*true/, /automaticApplicationPerformed:\s*true/, /automaticLearningUpdatePerformed:\s*true/]) assert(!pattern.test(source), String(pattern));
for (const marker of ['id="phase26-15-manual-post-import-verification-decision"', "Private Local only", "PLAN_ONLY", "protectedMode", "Phase26-14判定対象一覧", "検証記録詳細", "判定前再確認", "判定者入力", "手動判定を開始", "検証結果概要", "warning一覧", "error一覧", "critical一覧", "重複・欠損・対応不明一覧", "rollbackCandidate表示", "判定種別選択", "判定理由入力", "riskLevel選択", "警告付き受理内容", "手動調整必要内容", "ロールバックレビュー必要内容", "判定保留内容", "判定を確定", "判定を中断", "判定を取り消す", "判定証跡一覧", "次状態表示"]) assert(html.includes(marker), marker);
assert(css.includes(".phase2615-panel"));
assert(readme.includes("Phase26-15 Manual Post-Import Verification Decision Core"));
console.log("phase26ManualPostImportVerificationDecisionCore.test.js: PASS");
