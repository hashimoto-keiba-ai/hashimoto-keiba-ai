"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase267 = require("../phase26-7-manual-result-preview-pre-intake-validation-core.js");
const core = require("../phase26-8-manual-result-data-selection-pre-read-approval-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-09T02:00:00Z") };
const operation = { performedBy: "owner", reason: "manual confirmation", explicitConfirmation: true };
const target = {
  previewRequestId: "preview-1", phase266ExecutionRecordId: "execution-1",
  status: "ready_for_manual_result_preview_creation",
  expectedResultFormat: "csv_declared", expectedFileType: "csv", expectedEncoding: "utf-8",
  expectedDelimiter: "comma", expectedHeaderPresent: true, expectedRecordUnit: "one result per row",
  expectedTargetPeriod: "2026-08-09", expectedReferenceTimepoint: "final",
  expectedSource: "Official", expectedMethod: "manual_entry",
  expectedSourceTrust: "official_source", expectedTarget: "Tokyo 11R", expectedCount: 18,
  finalConfirmedBy: "owner", finalConfirmedAt: "2026-08-09T01:00:00Z",
  finalDecisionReason: "all metadata confirmed", unresolvedIssues: [],
  checklist: phase267.CHECK_DEFINITIONS.map(item => ({ ...item, status: "passed" })),
  phase266Snapshot: { expectedRecordCount: 18, observedRecordCount: 18 },
  ...phase267.SAFE_FLAGS
};
const acceptedReview = {
  completed: true, humanResult: "accepted", confirmedBy: "owner",
  confirmedAt: "2026-08-09T01:30:00Z", decisionReason: "manually accepted",
  difference: "none", differenceReason: "none"
};
const checklist = core.CHECK_DEFINITIONS.map(item => ({
  ...item, status: "passed", checkedBy: "owner",
  checkedAt: "2026-08-09T01:45:00Z", note: "confirmed"
}));
const input = {
  selectionRecordId: "selection-1", selectedBy: "owner", selectionDate: "2026-08-09",
  selectionTime: "11:00", selectionReason: "manual pre-read review",
  fileDisplayName: "tokyo-11r-20260809.csv", fileName: "tokyo-11r-20260809.csv",
  extension: "csv", mimeType: "text/csv", fileSize: 2048,
  lastModifiedAt: "2026-08-09T01:00:00.000Z", expectedDataFormat: "csv_declared",
  expectedEncoding: "utf-8", expectedDelimiter: "comma", expectedHeaderPresent: true,
  expectedRecordUnit: "one result per row", expectedTarget: "Tokyo 11R",
  expectedTargetPeriod: "2026-08-09", expectedReferenceTimepoint: "final",
  expectedSource: "Official", expectedMethod: "manual_entry",
  expectedSourceTrust: "official_source", declaredCount: 18,
  storageLocationDescription: "private local folder", originalOrCopy: "original",
  editStatus: "unedited", creatorDescription: "official export", note: "metadata only",
  formatReview: { ...acceptedReview, extensionAllowed: true, mimeConsistent: true, extensionMimeMismatch: false },
  sizeReview: { ...acceptedReview, minimum: 1, maximum: 1000000, toleranceCondition: "human-declared range", sizeJudgment: "within_range", unusuallySmallPossible: false, unusuallyLargePossible: false },
  fileNameReview: { ...acceptedReview, expectedNamingRule: "target-date.ext", namingRuleMatch: "matched", targetIdentifierPresent: true, dateOrTimepointPresent: true, versionPresent: false, temporaryPossible: false, backupPossible: false, duplicateNamePossible: false, suspiciousCharacters: false },
  modifiedTimeReview: { ...acceptedReview, consistency: "matched", stalePossible: false, futurePossible: false, midUpdatePossible: false, timezoneConfirmed: true },
  provenanceReview: { ...acceptedReview, acquisitionRoute: "manual official export", intermediateProcessing: false, intermediateProcessor: "", intermediateProcessedAt: "", alterationPossible: false },
  targetReview: { ...acceptedReview, targetScope: "Tokyo 11R", targetPeriod: "2026-08-09", identificationCondition: "file name declaration", exclusions: "none", contaminationPossible: false, missingPossible: false, duplicatePossible: false },
  countReview: { ...acceptedReview, judgment: "exact_match", difference: 0, toleranceCondition: "", mismatchReason: "", notComparableReason: "" },
  duplicateReview: { detected: false, comparedRecordId: "", matchedFields: [], differentFields: [], humanContinue: true, continuationReason: "no duplicate candidate", confirmedBy: "owner", confirmedAt: "2026-08-09T01:35:00Z" },
  plannedReader: { name: "owner", role: "local user", plannedDate: "2026-08-09", plannedTime: "11:30", terminal: "private PC", screen: "Private Local", operationStepsConfirmed: true, interruptionStepsConfirmed: true, cancellationStepsConfirmed: true, emergencyStopStepsConfirmed: true, note: "manual only" },
  approval: { approvalRecordId: "approval-1", approvedBy: "owner", approvalDate: "2026-08-09", approvalTime: "11:20", decision: "approved", reason: "all metadata confirmed", conditions: "", expiresAt: "2026-08-10T00:00:00Z", approvedFileName: "tokyo-11r-20260809.csv", approvedFileSize: 2048, approvedLastModifiedAt: "2026-08-09T01:00:00.000Z", approvedPhase267RecordId: "preview-1", approvedSelectionRecordId: "selection-1", recheckRequired: false, selectorApproverSamePerson: true, note: "same person explicitly recorded" },
  checklist, unresolvedIssues: [],
  exceptionResolution: { abnormalityResolved: true, interruptionResolved: true, stopResolved: true, cancellationResolved: true }
};

assert.strictEqual(core.PHASE267_REFERENCE, phase267);
assert(core.CHECK_DEFINITIONS.length >= 45);
assert(core.validatePhase267Target(target).valid);
for (const status of ["validating_pre_intake_conditions", "pre_intake_validation_passed", "selection_cancelled"]) {
  assert(!core.validatePhase267Target({ ...target, status }).valid, status);
}
for (const key of ["finalConfirmedBy", "finalDecisionReason"]) assert(!core.validatePhase267Target({ ...target, [key]: "" }).valid, key);
for (const key of Object.keys(phase267.SAFE_FLAGS)) {
  if (["resultDataRead", "resultDataParsed", "resultDataStored", "resultDataImported", "resultDataApplied", "resultDataLearned", "resultPreviewCreated", "resultPreviewReady", "intakeReady"].includes(key)) {
    assert(!core.validatePhase267Target({ ...target, [key]: true }).valid, key);
  }
}
for (const key of ["selectionRecordId", "fileName", "extension", "lastModifiedAt"]) {
  assert(!core.createSelectionCandidate(target, { ...input, [key]: "" }, operation, clock).created, key);
}
assert(!core.createSelectionCandidate(target, { ...input, fileSize: 0 }, operation, clock).created);
assert(!core.createSelectionCandidate(target, input, { ...operation, explicitConfirmation: false }, clock).created);
const metadata = core.metadataFromFile({ name: "result.CSV", size: 10, type: "text/csv", lastModified: Date.parse("2026-08-09T01:00:00Z"), secret: "content" });
assert.deepStrictEqual(Object.keys(metadata), ["fileName", "fileDisplayName", "extension", "mimeType", "fileSize", "lastModifiedAt"]);
assert.equal(metadata.extension, "csv");

const created = core.createSelectionCandidate(target, input, operation, clock);
assert(created.created);
assert.equal(created.record.status, "result_data_candidate_recorded");
assert(created.record.resultDataCandidateSelected);
assert(created.record.fileMetadataRecorded);
for (const [key, value] of Object.entries(core.SAFE_FLAGS)) assert.strictEqual(created.record[key], value, key);
const validating = core.transition(created.record, "validating_file_metadata", operation, target, clock);
assert(validating.transitioned);
const reviewing = core.transition(validating.record, "awaiting_manual_pre_read_review", operation, target, clock);
assert(reviewing.transitioned);
const approved = core.transition(reviewing.record, "pre_read_approval_recorded", operation, target, clock);
assert(approved.transitioned);
const ready = core.transition(approved.record, "ready_for_manual_result_data_read", operation, target, clock);
assert(ready.transitioned);

function readyRejected(changes) {
  const updated = core.updateRecord(approved.record, changes, operation, clock).record;
  return core.transition(updated, "ready_for_manual_result_data_read", operation, target, clock);
}
for (const [name, changes] of [
  ["format", { formatReview: { ...input.formatReview, completed: false } }],
  ["size", { sizeReview: { ...input.sizeReview, completed: false } }],
  ["filename", { fileNameReview: { ...input.fileNameReview, completed: false } }],
  ["modified", { modifiedTimeReview: { ...input.modifiedTimeReview, completed: false } }],
  ["source", { provenanceReview: { ...input.provenanceReview, completed: false } }],
  ["target", { targetReview: { ...input.targetReview, completed: false } }],
  ["count", { countReview: { ...input.countReview, completed: false } }],
  ["duplicate", { duplicateReview: { ...input.duplicateReview, confirmedBy: "" } }],
  ["reader", { plannedReader: { ...input.plannedReader, name: "" } }],
  ["approver", { approval: { ...input.approval, approvedBy: "" } }],
  ["approval_date", { approval: { ...input.approval, approvalDate: "" } }],
  ["approval_reason", { approval: { ...input.approval, reason: "" } }],
  ["rejected", { approval: { ...input.approval, decision: "rejected" } }],
  ["on_hold", { approval: { ...input.approval, decision: "on_hold" } }],
  ["conditional", { approval: { ...input.approval, decision: "approved_with_conditions", conditions: "" } }],
  ["approved_metadata", { approval: { ...input.approval, approvedFileSize: 2049 } }]
]) assert(!readyRejected(changes).transitioned, name);
for (const status of ["failed", "unchecked", "needs_review"]) {
  const badChecklist = checklist.map((item, index) => index === 0 ? { ...item, status } : item);
  assert(!readyRejected({ checklist: badChecklist }).transitioned, status);
}
const invalidated = core.updateRecord(approved.record, { fileName: "changed.csv" }, operation, clock);
assert(invalidated.approvalInvalidated);
assert(invalidated.record.approval.recheckRequired);
assert(!core.transition(invalidated.record, "ready_for_manual_result_data_read", operation, target, clock).transitioned);
const cancelled = core.transition(reviewing.record, "selection_cancelled", operation, target, clock);
assert(cancelled.transitioned);
assert(!core.transition(cancelled.record, "validating_file_metadata", operation, target, clock).transitioned);
assert(!core.transition(created.record, "ready_for_manual_result_data_read", operation, target, clock).transitioned);
const tampered = core.updateRecord(created.record, { resultDataRead: true, fileUploaded: true, resultDataCandidateSelected: false }, operation, clock).record;
assert.strictEqual(tampered.resultDataRead, false);
assert.strictEqual(tampered.fileUploaded, false);
assert.strictEqual(tampered.resultDataCandidateSelected, true);
assert(core.findDuplicateCandidate(created.record, [{ ...created.record, selectionRecordId: "selection-2" }]).detected);

const source = fs.readFileSync(path.join(root, "phase26-8-manual-result-data-selection-pre-read-approval-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const pattern of [/\bFileReader\b/, /\.text\s*\(/, /\.arrayBuffer\s*\(/, /\.stream\s*\(/, /createObjectURL/, /readAsText/, /readAsArrayBuffer/, /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /EventSource\s*\(/]) assert(!pattern.test(source), pattern);
for (const name of ["readFileContent", "parseCsv", "parseJson", "parseExcel", "parsePdf", "countRows", "calculateHash", "uploadFile", "importData", "applyData", "updateLearning", "autoApprove", "autoTransition"]) assert.strictEqual(core[name], undefined, name);
for (const marker of ['id="phase26-8-manual-result-data-selection-pre-read-approval"', 'id="phase268-file-input"', 'type = "file"', "対象となるPhase26-7記録", "現在状態", "想定形式との比較結果", "サイズ確認結果", "ファイル名確認結果", "更新日時確認結果", "取得元・作成元確認結果", "対象整合性確認結果", "件数見込み比較結果", "重複候補確認結果", "読込実行予定者", "読込予定日時", "読込前チェックリスト", "読込前承認記録", "未解決事項", "状態遷移履歴", "安全フラグ一覧", "禁止処理一覧", "Private Local only", "PLAN_ONLY", "protectedMode", "ファイル内容未読込", "ファイル内容未解析", "保存・取込・適用・学習なし"]) assert(html.includes(marker), marker);
assert(!html.includes(">読込</button>"));
assert(html.includes("phase26-8-manual-result-data-selection-pre-read-approval-core.js"));
assert(css.includes(".phase268-panel"));
assert(readme.includes("Phase26-8 Manual Result Data Selection and Pre-Read Approval Core"));
console.log("phase26ManualResultDataSelectionPreReadApprovalCore.test.js: PASS");
