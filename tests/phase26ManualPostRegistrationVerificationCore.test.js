"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const core = require("../phase26-21-manual-post-registration-verification-core.js");
const op = reason => ({ performedBy: "human-verifier", reason, explicitConfirmation: true });
const target = (overrides = {}) => ({ phase2620ExecutionRecordExists: true, executionStatus: "ready_for_manual_post_registration_verification", executionRecordId: "exec-record-20", approvalRecordId: "approval-19", preparationRecordId: "preparation-18", acceptanceApprovalRecordId: "approval-17", acceptanceRecordId: "acceptance-16", importRecordId: "import-13", phase2619ApprovalReferenceValid: true, phase2618PreparationReferenceValid: true, phase2617AcceptanceApprovalReferenceValid: true, phase2616AcceptanceReferenceValid: true, phase2613ImportReferenceValid: true, abnormalitySummary: [], partialFailureReason: "", stateTransitionHistory: [{ to: "manual_formal_registration_execution_completed" }, { to: "ready_for_manual_post_registration_verification" }], inputSnapshot: { scope: "approved" }, resultSnapshot: { completed: true }, itemResults: [{ itemId: "registration-1" }], countSummary: { attemptedRegistrationCount: 1, successfulRegistrationCount: 1, failedRegistrationCount: 0, skippedRegistrationCount: 0, duplicateDetectedCount: 0 }, protectedMode: true, planOnly: true, ...overrides });
const input = (overrides = {}) => ({ verifierId: "verifier-1", verifierName: "Human Verifier", verificationRequestedAt: "2026-08-01T01:00:00.000Z", verificationReason: "登録結果の手動確認", phase26_20ExecutionRecordId: "exec-record-20", phase26_19ApprovalRecordId: "approval-19", phase26_18PreparationRecordId: "preparation-18", acceptanceApprovalRecordId: "approval-17", acceptanceRecordId: "acceptance-16", importRecordId: "import-13", expectedRegisteredCount: 1, verificationScope: "approved registration scope", verificationConfirmation: true, protectedModeAcknowledgement: true, planOnlyAcknowledgement: true, manualVerificationAcknowledgement: true, evidenceReferences: ["evidence-start"], ...overrides });
const item = (overrides = {}) => ({ verificationItemId: "verify-item-1", sourceItemId: "source-1", targetRegistrationId: "target-1", createdRecordReference: "record-ref-1", registrationRecordFound: true, sourceReferenceMatched: true, targetReferenceMatched: true, contentMatched: true, countMatched: true, snapshotMatched: true, evidenceVerified: true, duplicateDetected: false, missingDetected: false, unexpectedDetected: false, inconsistencyDetected: false, observationDetected: false, verificationStatus: "verified", verificationReason: "全項目一致", beforeSnapshotReference: "before-1", afterSnapshotReference: "after-1", evidenceReferences: ["evidence-1"], ...overrides });
const counts = overrides => ({ expectedRegisteredCount: 1, attemptedRegistrationCount: 1, successfulRegistrationCount: 1, actualRegisteredCount: 1, createdRecordCount: 1, failedRegistrationCount: 0, skippedRegistrationCount: 0, duplicateRejectedCount: 0, missingRegistrationCount: 0, unexpectedRegistrationCount: 0, verificationTargetCount: 1, verifiedItemCount: 1, unverifiedItemCount: 0, ...overrides });
const createStarted = () => { core.resetRegistry(); const made = core.createManualPostRegistrationVerification(target(), input(), op("作成")); assert(made.created); const started = core.startManualPostRegistrationVerification(made.record, op("開始")); assert(started.started); return started.record; };

core.resetRegistry();
assert(core.validatePostRegistrationVerificationEligibility(target()).valid);
for (const state of ["manual_formal_registration_execution_partially_failed", "manual_formal_registration_execution_failed", "manual_formal_registration_execution_interrupted", "manual_formal_registration_execution_cancelled", "manual_formal_registration_execution_abnormality_detected"]) assert(!core.validatePostRegistrationVerificationEligibility(target({ executionStatus: state })).valid);
assert(!core.validatePostRegistrationVerificationEligibility(target({ phase2620ExecutionRecordExists: false })).valid);
assert(!core.validatePostRegistrationVerificationEligibility(target({ phase2619ApprovalReferenceValid: false })).valid);
assert(!core.validatePostRegistrationVerificationEligibility(target({ abnormalitySummary: ["issue"] })).valid);
assert(!core.createManualPostRegistrationVerification(target(), input({ verifierName: "" }), op("作成")).created);
assert(!core.createManualPostRegistrationVerification(target(), input({ verificationConfirmation: false }), op("作成")).created);
assert(!core.createManualPostRegistrationVerification(target(), input({ automaticVerificationRequested: true }), op("作成")).created);

let record = createStarted();
assert(!core.startManualPostRegistrationVerification(record, op("二重開始")).started);
let normal = core.recordPostRegistrationVerificationItemResult(record, item(), op("個別検証"));
assert(normal.recorded);
const progress = core.recordPostRegistrationVerificationProgress(normal.record, { verifiedItemCount: 1, unverifiedItemCount: 0 }, op("進捗記録")); assert(progress.recorded);
assert(core.verifyRegistrationReferences(normal.record).valid);
assert(core.verifyRegistrationEvidence(normal.record).valid);
assert(core.verifyRegistrationCounts(normal.record, counts()).consistent);
let completed = core.completeManualPostRegistrationVerification(normal.record, { counts: counts(), observations: [], evidenceReferences: ["final-evidence"] }, op("完了"));
assert(completed.completed && completed.eligibleForDecision);
assert.strictEqual(completed.record.verificationStatus, "manual_post_registration_verification_completed");
let decision = core.transitionToPostRegistrationVerificationDecision(completed.record, op("判定へ"));
assert(decision.transitioned && !decision.humanDecisionRequired);
assert(!core.startManualPostRegistrationVerification(completed.record, op("再開始")).started);

record = createStarted();
let observed = core.recordPostRegistrationVerificationItemResult(record, item({ verificationStatus: "verified_with_observation", observationDetected: true, verificationReason: "軽微な表記差" }), op("観察付き検証")).record;
completed = core.completeManualPostRegistrationVerification(observed, { counts: counts(), observations: [{ observationType: "minor_difference", observationSeverity: "warning", observationSummary: "軽微な表記差", affectedItemIds: ["verify-item-1"], recommendedHumanAction: "人間が判定" }], evidenceReferences: ["final-evidence"] }, op("観察付き完了"));
assert.strictEqual(completed.record.verificationStatus, "manual_post_registration_verification_completed_with_observations");
decision = core.transitionToPostRegistrationVerificationDecision(completed.record, op("判定へ")); assert(decision.transitioned && decision.humanDecisionRequired);
assert.strictEqual(completed.record.observations[0].resolved, false);

for (const variant of [
  { verificationStatus: "missing", missingDetected: true, registrationRecordFound: false },
  { verificationStatus: "duplicate_detected", duplicateDetected: true },
  { verificationStatus: "content_mismatch", contentMatched: false, correctionCandidate: true },
  { verificationStatus: "reference_mismatch", sourceReferenceMatched: false },
  { verificationStatus: "snapshot_mismatch", snapshotMatched: false, rollbackCandidate: true },
  { verificationStatus: "evidence_missing", evidenceVerified: false, evidenceReferences: [] },
]) { record = createStarted(); const bad = core.recordPostRegistrationVerificationItemResult(record, item(variant), op("異常個別結果")).record; completed = core.completeManualPostRegistrationVerification(bad, { counts: counts(), observations: [], evidenceReferences: ["final"] }, op("異常完了")); assert(["manual_post_registration_verification_failed", "manual_post_registration_verification_abnormality_detected"].includes(completed.record.verificationStatus)); assert(!core.transitionToPostRegistrationVerificationDecision(completed.record, op("禁止遷移")).transitioned); }

record = createStarted(); normal = core.recordPostRegistrationVerificationItemResult(record, item(), op("個別")).record;
completed = core.completeManualPostRegistrationVerification(normal, { counts: counts({ actualRegisteredCount: 0, createdRecordCount: 0 }), observations: [], evidenceReferences: ["final"] }, op("件数不一致"));
assert.strictEqual(completed.record.verificationStatus, "manual_post_registration_verification_abnormality_detected");
assert(!core.verifyRegistrationCounts(normal, counts({ actualRegisteredCount: -1 })).valid);
assert.strictEqual(core.buildCorrectionCandidates({ ...normal, itemVerificationResults: [item({ verificationStatus: "content_mismatch", correctionCandidate: true })] })[0].correctionExecuted, false);
assert.strictEqual(core.buildRollbackCandidates({ ...normal, itemVerificationResults: [item({ rollbackCandidate: true })] })[0].rollbackExecuted, false);

record = createStarted(); assert(core.interruptManualPostRegistrationVerification(record, "手動中断", op("中断")).recorded);
record = createStarted(); assert(core.cancelManualPostRegistrationVerification(record, "手動取消", op("取消")).recorded);
record = createStarted(); assert(core.detectPostRegistrationVerificationAbnormality(record, ["証跡不整合"], op("異常検出")).detected);
assert(!core.transition(record, "ready_for_manual_post_registration_verification_decision", op("飛越")).transitioned);

const safety = core.getManualPostRegistrationVerificationSafetyStatus();
assert(safety.privateLocalOnly && safety.planOnly && safety.protectedMode && safety.humanVerificationRequired);
for (const key of ["automaticVerificationStartPerformed", "automaticVerificationCompletionPerformed", "automaticDecisionPerformed", "automaticAcceptancePerformed", "automaticCorrectionPerformed", "automaticDeletionPerformed", "automaticReregistrationPerformed", "automaticReexecutionPerformed", "automaticRollbackPerformed", "automaticApprovalPerformed", "automaticApplicationPerformed", "automaticLearningUpdatePerformed", "automaticPurchasePerformed", "externalTransmissionPerformed", "publicPublishingEnabled", "githubPagesEnabled"]) assert.strictEqual(safety[key], false, key);
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8"), css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8"), readme = fs.readFileSync(path.join(root, "README.md"), "utf8"), source = fs.readFileSync(path.join(root, "phase26-21-manual-post-registration-verification-core.js"), "utf8");
for (const marker of ["phase26-21-manual-post-registration-verification", "登録後検証状態", "検証対象件数", "検証済み件数", "未検証件数", "登録予定件数", "実登録件数", "作成レコード件数", "件数整合性", "欠落件数", "重複件数", "内容不一致件数", "参照不一致件数", "証跡不足件数", "観察事項件数", "修正候補件数", "ロールバック候補件数", "人間確認必須", "自動検証禁止", "自動修正禁止", "自動ロールバック禁止", "protectedMode", "PLAN_ONLY", "次段階は手動の登録後検証判定"]) assert(html.includes(marker), marker);
assert(css.includes(".phase2621-panel")); assert(readme.includes("Phase26-21 Manual Post-Registration Verification Core"));
for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /automaticVerificationStartPerformed:\s*true/, /automaticCorrectionPerformed:\s*true/, /automaticRollbackPerformed:\s*true/]) assert(!pattern.test(source), String(pattern));
console.log("phase26ManualPostRegistrationVerificationCore.test.js: PASS");
