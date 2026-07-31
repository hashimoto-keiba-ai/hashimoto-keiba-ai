"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase268 = require("../phase26-8-manual-result-data-selection-pre-read-approval-core.js");
const core = require("../phase26-9-manual-result-data-read-temporary-holding-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-10T02:00:00Z") };
const operation = { performedBy: "owner", reason: "manual operation", explicitConfirmation: true };
const target = {
  selectionRecordId: "selection-1", phase267PreviewRequestId: "preview-1",
  status: "ready_for_manual_result_data_read", fileName: "result.csv",
  extension: "csv", mimeType: "text/csv", fileSize: 12,
  lastModifiedAt: "2026-08-10T01:00:00.000Z", expectedEncoding: "utf-8",
  selectedBy: "owner", plannedReader: { name: "owner", role: "local user" },
  approval: {
    approvalRecordId: "approval-1", approvedBy: "owner", decision: "approved",
    conditions: "", approvedFileName: "result.csv", approvedFileSize: 12,
    approvedLastModifiedAt: "2026-08-10T01:00:00.000Z", recheckRequired: false
  },
  checklist: phase268.CHECK_DEFINITIONS.map(item => ({ ...item, status: "passed" })),
  unresolvedIssues: [],
  exceptionResolution: { abnormalityResolved: true, interruptionResolved: true, stopResolved: true, cancellationResolved: true },
  ...phase268.SAFE_FLAGS
};
const metadata = {
  fileName: "result.csv", fileSize: 12, mimeType: "text/csv",
  lastModifiedAt: "2026-08-10T01:00:00.000Z", extension: "csv"
};
const comparison = {
  fileNameMatch: true, fileSizeMatch: true, lastModifiedMatch: true,
  mimeTypeMatch: true, extensionMatch: true, mismatchFields: [],
  mismatchReason: "", humanReviewResult: "", reviewedBy: "", reviewedAt: ""
};
const checklist = core.CHECK_DEFINITIONS.map(item => ({
  ...item, status: "passed", checkedBy: "owner",
  checkedAt: "2026-08-10T01:30:00Z", note: "confirmed"
}));
const input = {
  readExecutionRecordId: "read-1", executedBy: "owner", executionDate: "2026-08-10",
  readStartTime: "11:00", readEndTime: "", terminal: "private PC", screen: "Private Local",
  executionReason: "manual approved read", procedureConfirmation: "confirmed",
  approvalConditionsConfirmation: "confirmed", preReadFinalConfirmedBy: "owner",
  preReadFinalConfirmedAt: "2026-08-10T01:45:00Z",
  preReadFinalConfirmationReason: "approved metadata confirmed",
  selectedFileMetadata: metadata, metadataComparison: comparison,
  declaredMaximumReadSize: 1024, sizeLimit: { result: "within_limit" },
  checklist, unresolvedIssues: []
};
const file = {
  name: "result.csv", size: 12, type: "text/csv",
  lastModified: Date.parse("2026-08-10T01:00:00Z"),
  text: async () => "a,b\n1,2\n3,4"
};
async function run() {
  assert.strictEqual(core.PHASE268_REFERENCE, phase268);
  assert.strictEqual(core.READ_METHOD, "File.text");
  assert.strictEqual(core.DEFAULT_MAXIMUM_READ_SIZE, 10485760);
  assert(core.CHECK_DEFINITIONS.length >= 45);
  assert(core.validatePhase268Target(target).valid);
  for (const status of ["pre_read_approval_recorded", "temporary_data_held", "manual_read_cancelled"]) {
    assert(!core.validatePhase268Target({ ...target, status }).valid, status);
  }
  assert(!core.validatePhase268Target({ ...target, approval: {} }).valid);
  assert(!core.validatePhase268Target({ ...target, approval: { ...target.approval, decision: "rejected" } }).valid);
  assert(!core.validatePhase268Target({ ...target, approval: { ...target.approval, decision: "approved_with_conditions", conditions: "" } }).valid);
  for (const key of ["resultDataRead", "fileContentAccessed", "fileContentParsed", "fileContentStored", "fileUploaded", "fileExternallyTransmitted"]) {
    assert(!core.validatePhase268Target({ ...target, [key]: true }).valid, key);
  }
  assert(!core.createReadExecution(target, { ...input, executedBy: "" }, operation, clock).created);
  assert(!core.createReadExecution(target, input, { ...operation, explicitConfirmation: false }, clock).created);
  const created = core.createReadExecution(target, input, operation, clock);
  assert(created.created);
  let validating = core.transition(created.record, "validating_approved_file_metadata", operation, target, clock);
  assert(validating.transitioned);
  let ready = core.transition(validating.record, "ready_for_manual_read_execution", operation, target, clock);
  assert(ready.transitioned);
  assert(!(await core.executeManualRead(ready.record, file, { ...operation, explicitConfirmation: false }, target, clock)).started);
  assert(!(await core.executeManualRead(ready.record, null, operation, target, clock)).started);
  for (const [name, changedFile, reason] of [
    ["name", { ...file, name: "other.csv" }, "file_name_mismatch"],
    ["size", { ...file, size: 13 }, "file_size_mismatch"],
    ["modified", { ...file, lastModified: Date.parse("2026-08-10T01:01:00Z") }, "last_modified_mismatch"],
    ["zero", { ...file, size: 0 }, "file_size_mismatch"],
    ["large", { ...file, size: 2048 }, "file_size_mismatch"]
  ]) {
    const result = await core.executeManualRead(ready.record, changedFile, operation, target, clock);
    assert(!result.started, name);
    assert(result.reasons.includes(reason), name);
  }
  const typeChanged = { ...file, type: "application/octet-stream" };
  assert(!(await core.executeManualRead(ready.record, typeChanged, operation, target, clock)).started);
  const acceptedDifference = core.updateRecord(ready.record, {
    metadataComparison: { ...comparison, mimeTypeMatch: false, mismatchFields: ["mimeTypeMatch"], mismatchReason: "browser generic MIME", humanReviewResult: "accepted", reviewedBy: "owner", reviewedAt: "2026-08-10T01:50:00Z" }
  }, operation, clock).record;
  const typeAcceptedResult = await core.executeManualRead(acceptedDifference, typeChanged, operation, target, clock);
  assert(typeAcceptedResult.succeeded);
  core.discardTemporaryData(typeAcceptedResult.record, { reason: "test cleanup" }, operation, clock);

  let resolveRead;
  const pendingFile = { ...file, text: () => new Promise(resolve => { resolveRead = resolve; }) };
  const pending = core.executeManualRead(ready.record, pendingFile, operation, target, clock);
  await Promise.resolve();
  const duplicate = await core.executeManualRead(ready.record, pendingFile, operation, target, clock);
  assert(!duplicate.started);
  assert.equal(duplicate.reason, "read_already_in_progress");
  resolveRead("a,b\n1,2\n3,4");
  const pendingDone = await pending;
  assert(pendingDone.succeeded);
  core.discardTemporaryData(pendingDone.record, { reason: "test cleanup" }, operation, clock);

  let resolveInterrupted;
  const interruptFile = { ...file, text: () => new Promise(resolve => { resolveInterrupted = resolve; }) };
  const interruptPending = core.executeManualRead(ready.record, interruptFile, operation, target, clock);
  await Promise.resolve();
  assert(core.requestReadInterruption("read-1", { ...operation, reason: "human interruption" }, clock).requested);
  resolveInterrupted("a,b\n1,2\n3,4");
  const interrupted = await interruptPending;
  assert.equal(interrupted.record.status, "manual_read_interrupted");
  assert.strictEqual(core.getTemporaryData(interrupted.record), undefined);

  let resolveCancelled;
  const cancelFile = { ...file, text: () => new Promise(resolve => { resolveCancelled = resolve; }) };
  const cancelPending = core.executeManualRead(ready.record, cancelFile, operation, target, clock);
  await Promise.resolve();
  assert(core.requestReadCancellation("read-1", { ...operation, reason: "human cancellation" }, clock).requested);
  resolveCancelled("a,b\n1,2\n3,4");
  const cancelledDuringRead = await cancelPending;
  assert.equal(cancelledDuringRead.record.status, "manual_read_cancelled");
  assert.strictEqual(core.getTemporaryData(cancelledDuringRead.record), undefined);

  const succeeded = await core.executeManualRead(ready.record, file, operation, target, clock);
  assert(succeeded.started && succeeded.succeeded);
  assert.equal(succeeded.record.status, "manual_read_succeeded");
  assert(succeeded.record.resultDataRead);
  assert(succeeded.record.fileContentAccessed);
  assert(!succeeded.record.temporaryDataHeld);
  assert(!Object.prototype.hasOwnProperty.call(succeeded.record.temporaryData, "rawText"));
  assert(!Object.prototype.hasOwnProperty.call(succeeded.record, "rawText"));
  assert.equal(core.getTemporaryData(succeeded.record), "a,b\n1,2\n3,4");
  for (const [key, value] of Object.entries(core.ALWAYS_FALSE_FLAGS)) assert.strictEqual(succeeded.record[key], value, key);
  const successReview = {
    successRecordId: "success-1", humanResult: "accepted", handoffDecision: "approved",
    confirmedBy: "owner", confirmedAt: "2026-08-10T02:10:00Z",
    confirmationReason: "non-empty read confirmed"
  };
  const held = core.holdTemporaryData(succeeded.record, successReview, operation, clock);
  assert(held.held);
  assert.equal(held.record.status, "temporary_data_held");
  assert(held.record.temporaryDataHeld);
  const parseReady = core.transition(held.record, "ready_for_manual_result_data_parse_preview", operation, target, clock);
  assert(parseReady.transitioned);

  for (const status of ["failed", "unchecked", "needs_review"]) {
    const badChecklist = checklist.map((item, index) => index === 0 ? { ...item, status } : item);
    const badRecord = core.normalizeRecord({ ...held.record, checklist: badChecklist });
    assert(!core.transition(badRecord, "ready_for_manual_result_data_parse_preview", operation, target, clock).transitioned, status);
  }
  const notHeld = core.normalizeRecord({ ...held.record, temporaryData: { ...held.record.temporaryData, temporaryDataStatus: "holding" } });
  assert(!core.transition(notHeld, "ready_for_manual_result_data_parse_preview", operation, target, clock).transitioned);
  const noHandoff = core.normalizeRecord({ ...held.record, handoffReview: {} });
  assert(!core.transition(noHandoff, "ready_for_manual_result_data_parse_preview", operation, target, clock).transitioned);
  const discarded = core.discardTemporaryData(held.record, { reason: "human discard" }, operation, clock);
  assert(discarded.discarded);
  assert.equal(discarded.record.status, "temporary_data_discarded");
  assert(!discarded.record.temporaryDataHeld);
  assert.strictEqual(core.getTemporaryData(discarded.record), undefined);
  assert(!core.transition(discarded.record, "ready_for_manual_result_data_parse_preview", operation, target, clock).transitioned);

  const empty = await core.executeManualRead(ready.record, { ...file, text: async () => "" }, operation, target, clock);
  assert(!empty.succeeded);
  assert.equal(empty.record.status, "manual_read_failed");
  assert.strictEqual(core.getTemporaryData(empty.record), undefined);
  const failed = await core.executeManualRead(ready.record, { ...file, text: async () => { throw new Error("denied"); } }, operation, target, clock);
  assert(!failed.succeeded);
  assert.equal(failed.record.status, "manual_read_failed");
  assert.strictEqual(core.getTemporaryData(failed.record), undefined);
  const cancelled = core.transition(ready.record, "manual_read_cancelled", operation, target, clock);
  assert(cancelled.transitioned);
  assert(!core.transition(cancelled.record, "validating_approved_file_metadata", operation, target, clock).transitioned);
  assert(!core.transition(created.record, "ready_for_manual_result_data_parse_preview", operation, target, clock).transitioned);
  const tampered = core.updateRecord(created.record, { resultDataParsed: true, fileUploaded: true, resultDataRead: true }, operation, clock).record;
  assert(!tampered.resultDataParsed && !tampered.fileUploaded && !tampered.resultDataRead);

  const source = fs.readFileSync(path.join(root, "phase26-9-manual-result-data-read-temporary-holding-core.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  for (const pattern of [/\bJSON\.parse\s*\(/, /\blocalStorage\s*\.\s*setItem/, /\bsessionStorage\s*\.\s*setItem/, /\bindexedDB\s*\.\s*open/, /\bcaches\s*\.\s*open/, /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket\s*\(/, /createObjectURL/, /readAsArrayBuffer/, /\.arrayBuffer\s*\(/, /\.stream\s*\(/, /\.split\s*\(/]) assert(!pattern.test(source), pattern);
  for (const name of ["parseCsv", "parseJson", "parseExcel", "parsePdf", "splitRows", "splitColumns", "detectHeader", "detectDelimiter", "detectEncoding", "savePermanent", "importData", "applyData", "updateLearning", "autoRetry", "autoTransition"]) assert.strictEqual(core[name], undefined, name);
  for (const marker of ['id="phase26-9-manual-result-data-read-temporary-holding"', 'id="phase269-file-input"', 'id="phase269-read-start"', 'id="phase269-discard"', "対象となるPhase26-8記録", "現在状態", "Phase26-8承認情報", "承認対象ファイルメタデータ", "実際に選択されたファイルメタデータ", "承認メタデータとの比較結果", "読込実行者", "読込実行日時", "使用端末", "読込前最終確認欄", "読込中状態", "読込成功・失敗・中断・取消結果", "読込方式", "読込時間・長さ", "一時保持データID", "一時保持状態", "読込後チェックリスト", "次工程引渡し確認欄", "状態遷移履歴", "監査履歴", "安全フラグ一覧", "禁止処理一覧", "Private Local only", "PLAN_ONLY", "protectedMode", "正式保存なし", "正式取込なし", "適用・学習なし"]) assert(html.includes(marker), marker);
  assert(!html.includes(">解析</button>"));
  assert(!html.includes(">インポート</button>"));
  assert(css.includes(".phase269-panel"));
  assert(readme.includes("Phase26-9 Manual Result Data Read and Temporary Holding Core"));
  console.log("phase26ManualResultDataReadTemporaryHoldingCore.test.js: PASS");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
