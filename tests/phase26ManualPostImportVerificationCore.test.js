"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase2613 = require("../phase26-13-manual-formal-import-execution-core.js");
const core = require("../phase26-14-manual-post-import-verification-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-15T01:02:03Z") };
const operation = { performedBy: "local-owner", reason: "manual post-import verification", explicitConfirmation: true };
const target = {
  phase2613ExecutionRecordExists: true,
  importBatchId: "manual-formal-import-batch-1",
  candidateId: "candidate-1",
  approvalRecordId: "approval-1",
  sourceDataId: "source-1",
  sourceDataName: "result.json",
  sourceDataHash: "sha256-source",
  destinationType: "private_local_store",
  destinationName: "formal_results",
  executorId: "executor-1",
  executorName: "owner",
  executionStartedAt: "2026-08-15T00:00:00Z",
  executionCompletedAt: "2026-08-15T00:01:00Z",
  status: "ready_for_manual_post_import_verification",
  importTargetCountBeforeExecution: 10,
  plannedImportCount: 2,
  attemptedImportCount: 2,
  successfullyImportedCount: 2,
  failedImportCount: 0,
  skippedImportCount: 0,
  importTargetCountAfterExecution: 12,
  rollbackCandidateId: "",
  recordMappings: [
    { sourceRecordId: "s1", sourceDataId: "source-1", sourceRowNumber: 1, sourceHash: "h1", candidateId: "candidate-1", importBatchId: "manual-formal-import-batch-1", destinationRecordId: "d1", destinationType: "private_local_store", importResult: "imported", importedAt: "2026-08-15", failureReason: "", skippedReason: "", rollbackEligibility: true, verificationStatus: "pending" },
    { sourceRecordId: "s2", sourceDataId: "source-1", sourceRowNumber: 2, sourceHash: "h2", candidateId: "candidate-1", importBatchId: "manual-formal-import-batch-1", destinationRecordId: "d2", destinationType: "private_local_store", importResult: "imported", importedAt: "2026-08-15", failureReason: "", skippedReason: "", rollbackEligibility: true, verificationStatus: "pending" },
  ],
  protectedMode: true,
  planOnly: true,
};
const input = {
  verifierId: "verifier-1",
  verifierName: "local-owner",
  confirmImportBatchId: target.importBatchId,
  verificationStartConfirmed: true,
  noAutomaticCorrectionConfirmed: true,
  noAutomaticRollbackConfirmed: true,
  noAutomaticLearningUpdateConfirmed: true,
};
const normalEvidence = {
  sourceRecords: [{ id: "s1" }, { id: "s2" }],
  destinationRecords: [{ id: "d1" }, { id: "d2" }],
  duplicateItems: [],
  missingItems: [],
  mappingResults: [{ verificationStatus: "matched", sourceRecordId: "s1", destinationRecordId: "d1" }, { verificationStatus: "matched", sourceRecordId: "s2", destinationRecordId: "d2" }],
  fieldComparisons: [{ fieldName: "horseName", expectedValue: "Horse A", actualValue: "Horse A" }],
};
function freshTarget(suffix) {
  return { ...target, importBatchId: `${target.importBatchId}-${suffix}`, candidateId: `${target.candidateId}-${suffix}`, recordMappings: target.recordMappings.map(item => ({ ...item, importBatchId: `${target.importBatchId}-${suffix}`, candidateId: `${target.candidateId}-${suffix}` })) };
}
function start(value = target, changed = {}) {
  return core.startVerification(value, { ...input, confirmImportBatchId: value.importBatchId, ...changed }, operation, clock);
}
function analyze(started, value, evidence = normalEvidence) {
  return core.analyzeVerification(started.record, value, evidence, operation, clock);
}

core.resetRegistry();
assert.strictEqual(core.PHASE2613_REFERENCE, phase2613);
assert(core.validateTarget(target).valid);
assert(!core.validateTarget({ ...target, status: "manual_formal_import_execution_failed" }).valid);
assert(!core.validateTarget({ ...target, phase2613ExecutionRecordExists: false }).valid);
assert(!core.validateTarget({ ...target, importBatchId: "" }).valid);
assert(!core.validateTarget({ ...target, protectedMode: false }).valid);
assert.equal(core.listEligibleTargets([target, { ...target, status: "failed" }]).length, 1);
assert(!start(target, { verifierName: "", verifierId: "" }).started);
assert(!start(target, { verificationStartConfirmed: false }).started);

core.resetRegistry();
const first = start();
assert(first.started);
assert(/^manual-post-import-verification-20260815010203-\d{5}$/.test(first.record.verificationRecordId));
assert.equal(first.record.status, "manual_post_import_verification_in_progress");
assert(!start().started);
for (const [key, expected] of Object.entries(core.SAFETY)) assert.strictEqual(first.record[key], expected, key);

const normal = analyze(first, target);
assert(normal.analyzed);
assert(normal.record.countVerification.isConsistent);
assert.equal(normal.record.countVerification.preImportCount, 10);
assert.equal(normal.record.countVerification.plannedImportCount, 2);
assert.equal(normal.record.countVerification.attemptedImportCount, 2);
assert.equal(normal.record.countVerification.postImportCount, 12);
assert.equal(normal.record.mappingVerification.matchedCount, 2);
assert.equal(normal.record.fieldComparisons[0].comparisonResult, "exact_match");
const passed = core.finalizeVerification(normal.record, { verifierComment: "verified" }, operation, clock);
assert(passed.finalized);
assert.equal(passed.record.verificationResult, "manual_post_import_verification_passed");
assert.equal(passed.record.status, "ready_for_manual_post_import_verification_decision");

core.resetRegistry();
const warningTarget = freshTarget("warning");
const warningStart = start(warningTarget);
const warning = analyze(warningStart, warningTarget, { ...normalEvidence, mappingResults: [{ verificationStatus: "matched_with_warning" }, { verificationStatus: "matched" }], fieldComparisons: [{ fieldName: "horseName", expectedValue: "Ａ", actualValue: "A" }] });
assert.equal(warning.record.fieldComparisons[0].comparisonResult, "normalized_match");
const warningFinal = core.finalizeVerification(warning.record, { verifierComment: "表記正規化を確認" }, operation, clock);
assert(warningFinal.finalized);
assert.equal(warningFinal.record.verificationResult, "manual_post_import_verification_passed_with_warnings");

core.resetRegistry();
const badCountTarget = { ...freshTarget("bad-count"), attemptedImportCount: 3 };
const badCount = analyze(start(badCountTarget), badCountTarget);
assert(!badCount.record.countVerification.isConsistent);
assert(badCount.record.issues.some(item => item.issueType === "count_mismatch"));
const failedReconciliation = core.finalizeVerification(badCount.record, { verifierComment: "reconcile", failureNextState: "manual_post_import_reconciliation_required" }, operation, clock);
assert(failedReconciliation.finalized);
assert.equal(failedReconciliation.record.verificationResult, "manual_post_import_verification_failed");
assert(failedReconciliation.record.reconciliationRequired);

core.resetRegistry();
const issueTarget = freshTarget("issues");
const issueEvidence = {
  ...normalEvidence,
  duplicateItems: [{ duplicateType: "recordKey", duplicateKey: "rk1", detectedCount: 2, existingBatchId: "old", currentBatchId: issueTarget.importBatchId, severity: "critical", description: "重大な重複" }],
  missingItems: [{ issueType: "missing_destination_record", sourceRecordId: "s2", severity: "critical", description: "取込先欠損" }],
  mappingResults: [{ verificationStatus: "missing_mapping", sourceRecordId: "s1" }, { verificationStatus: "duplicate_mapping", sourceRecordId: "s2" }, { verificationStatus: "source_only" }, { verificationStatus: "destination_only" }],
  fieldComparisons: [{ fieldName: "odds", expectedValue: 2.1, actualValue: 9.9, critical: true }],
};
const issues = analyze(start(issueTarget), issueTarget, issueEvidence);
assert(issues.record.duplicateVerification.hasCriticalDuplicate);
assert(issues.record.missingVerification.hasCriticalMissing);
assert.equal(issues.record.mappingVerification.missingMappingCount, 1);
assert.equal(issues.record.mappingVerification.duplicateMappingCount, 1);
assert.equal(issues.record.mappingVerification.sourceOnlyCount, 1);
assert.equal(issues.record.mappingVerification.destinationOnlyCount, 1);
assert(issues.record.fieldComparisons.some(item => item.comparisonResult === "critical_difference"));
const failedRollback = core.finalizeVerification(issues.record, { verifierComment: "rollback review", failureNextState: "manual_post_import_rollback_review_required" }, operation, clock);
assert(failedRollback.finalized && failedRollback.record.rollbackReviewRequired);

core.resetRegistry();
const rollbackTarget = { ...freshTarget("rollback"), rollbackCandidateId: "rollback-1", rollbackCandidate: { rollbackStatus: "rollback_review_required", automaticExecutionProhibited: true, targetRecordCount: 1 } };
const rollback = analyze(start(rollbackTarget), rollbackTarget);
assert.equal(rollback.record.rollbackCandidateId, "rollback-1");
assert(rollback.record.issues.some(item => item.issueType === "rollback_candidate_present"));

core.resetRegistry();
const interruptTarget = freshTarget("interrupt");
const interrupted = core.interruptVerification(start(interruptTarget).record, "検証データ不足", operation, clock);
assert(interrupted.interrupted);
assert.equal(interrupted.record.interruptionReason, "検証データ不足");
core.resetRegistry();
const cancelTarget = freshTarget("cancel");
const cancelled = core.cancelVerification(cancelTarget, "人間が取消", operation, clock);
assert(cancelled.cancelled);
assert.equal(cancelled.record.cancellationReason, "人間が取消");
assert(!core.validateTarget(cancelTarget).valid);
assert(!core.transition({ status: "manual_post_import_verification_passed", stateHistory: [] }, "manual_post_import_verification_failed", operation, clock).transitioned);

const source = fs.readFileSync(path.join(root, "phase26-14-manual-post-import-verification-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /setInterval\s*\(/, /automaticCorrectionPerformed:\s*true/, /automaticDeletionPerformed:\s*true/, /automaticReimportPerformed:\s*true/, /automaticRetryPerformed:\s*true/, /automaticRollbackPerformed:\s*true/, /automaticApplicationPerformed:\s*true/, /automaticLearningUpdatePerformed:\s*true/]) assert(!pattern.test(source), String(pattern));
for (const marker of ['id="phase26-14-manual-post-import-verification"', "Private Local only", "PLAN_ONLY", "protectedMode", "Phase26-13検証対象一覧", "取込バッチ詳細", "検証前再確認", "検証者入力", "手動検証を開始", "件数整合性確認", "重複確認", "欠損確認", "元データと取込結果の対応一覧", "主要フィールド比較", "警告・不整合一覧", "ロールバック候補表示", "検証結果入力", "検証者コメント", "検証結果を確定", "検証を中断", "検証を取り消す", "検証証跡一覧", "次状態表示"]) assert(html.includes(marker), marker);
assert(css.includes(".phase2614-panel"));
assert(readme.includes("Phase26-14 Manual Post-Import Verification Core"));
console.log("phase26ManualPostImportVerificationCore.test.js: PASS");
