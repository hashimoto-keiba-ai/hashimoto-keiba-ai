"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase261 = require("../phase26-1-external-data-acquisition-boundary.js");
const phase262 = require("../phase26-2-manual-acquisition-request-precheck-core.js");
const core = require("../phase26-3-manual-acquisition-approval-prestart-record-core.js");
const root = path.resolve(__dirname, "..");
const clock = { now: () => new Date("2026-08-04T03:00:00Z") };
const operation = { performedBy: "owner", reason: "manual confirmation", explicitConfirmation: true };
const base = phase262.createDraftRequest({
  requestId: "request-1", createdBy: "owner", acquisitionMethod: "manual_entry",
  sourceTrustLevel: "official_source", sourceName: "Official", sourceDescription: "reference",
  sourceUrlReference: "https://example.invalid/reference", meetingDate: "2026-08-04",
  racecourse: "Tokyo", raceNumber: 11, raceName: "Sample", scheduledPostTime: "15:40",
  targetDataTypes: ["出馬表", "馬名"], dataTimepoint: "pre_race", expectedRecordCount: 18,
  purpose: "prediction_input_support", operatorNote: "review", consentConfirmed: true,
  termsCheckConfirmed: true, accessRestrictionCheckConfirmed: true, credentialsRequired: false
}, clock);
const readyRequest = { ...base, requestStatus: "ready_for_manual_request", validationResult: "ready_for_manual_request", blockingReasons: [] };
const allChecks = Object.fromEntries(core.PRESTART_CHECKS.map(key => [key, true]));
const approvalInput = {
  approvedBy: "owner", approvedAt: "2026-08-04T02:00:00Z", approvalReason: "checked",
  approvalNote: "self approval recorded", reviewerRole: "Owner", preStartChecklist: allChecks,
  cancellationConditions: "cancel on any mismatch", expirationAt: "2026-08-05T03:00:00Z"
};

assert.strictEqual(core.PHASE261_DEFINITION.safetyBoundary, phase261.definition().safetyBoundary);
assert.strictEqual(core.PHASE262_REFERENCE, phase262);
assert(core.validateApprovalTarget(readyRequest).valid);
for (const status of ["draft", "precheck_blocked", "cancelled", "expired", "manually_requested"]) {
  assert(!core.validateApprovalTarget({ ...readyRequest, requestStatus: status }).valid, status);
}
assert(!core.validateApprovalTarget({ ...readyRequest, blockingReasons: ["remaining"] }).valid);
assert(!core.validateApprovalTarget({ ...readyRequest, sourceTrustLevel: "unknown_source" }).valid);
assert(!core.validateApprovalTarget({ ...readyRequest, externalCommunicationEnabled: true }).valid);

function evaluated(input = {}, request = readyRequest, options = clock) {
  const draft = core.createApprovalDraft(request, { ...approvalInput, ...input }, options);
  return core.evaluateApproval(request, draft, operation, options);
}
assert.equal(evaluated({ approvedBy: "" }).preStartValidationResult, "blocked_by_missing_approver");
for (const approvedBy of ["system", "auto", "bot"]) assert.equal(evaluated({ approvedBy }).preStartValidationResult, "blocked_by_missing_approver");
assert.equal(evaluated({ approvedAt: "2026-08-05T03:00:00Z" }).preStartValidationResult, "blocked_by_invalid_approval_time");
assert.equal(evaluated({ approvalReason: "" }).preStartValidationResult, "blocked_by_missing_reason");
assert.equal(evaluated({ reviewerRole: "" }).preStartValidationResult, "blocked_by_missing_reviewer_role");
assert.equal(evaluated({ expirationAt: "2026-08-04T01:00:00Z" }).preStartValidationResult, "blocked_by_expiration");
assert.equal(evaluated({}, { ...readyRequest, credentialsRequired: true }).preStartValidationResult, "blocked_by_credentials_requirement");

const approved = evaluated();
assert(approved.approved);
assert.equal(approved.record.approvalStatus, "approved_for_prestart_record");
assert.equal(approved.record.selfApproval, true);
assert.equal(core.evaluateApproval(readyRequest, approved.record, operation, clock).approved, false);
assert.equal(core.evaluateApproval(readyRequest, { ...approved.record, approvalStatus: "expired", expirationAt: "" }, operation, clock).preStartValidationResult, "blocked_by_expiration");
const begun = core.beginPrestartRecord(approved.record, operation, clock);
assert(begun.transitioned);
const incomplete = core.completePrestartRecord({ ...begun.record, preStartChecklist: { ...allChecks, finalHumanConfirmation: false } }, operation, clock);
assert.equal(incomplete.completed, false);
assert.equal(incomplete.record.approvalStatus, "prestart_record_blocked");
const complete = core.completePrestartRecord(begun.record, operation, clock);
assert(complete.completed);
assert.equal(complete.record.approvalStatus, "ready_for_manual_start_request");
assert.equal(core.beginPrestartRecord(complete.record, operation, clock).transitioned, false);

for (const [key, expected] of Object.entries({
  executionPolicy: "PLAN_ONLY", protectedMode: true, privateLocalOnly: true,
  externalCommunicationEnabled: false, automaticAcquisitionEnabled: false,
  scheduledAcquisitionEnabled: false, unattendedAcquisitionEnabled: false,
  automaticPurchaseEnabled: false, automaticApplicationEnabled: false,
  automaticLearningUpdateEnabled: false, previewRequired: true, manualApprovalRequired: true,
  credentialsStoredInSourceCode: false, acquisitionStarted: false,
  acquisitionExecuted: false, acquisitionCompleted: false
})) assert.strictEqual(complete.record[key], expected, key);

const pollutedRequest = {
  ...readyRequest, apiKey: "secret", Cookie: "secret", password: "secret",
  authenticationToken: "secret", session: "secret", acquiredData: [{ secret: true }], formalData: [{ secret: true }]
};
const snapshot = core.makeRequestSnapshot(pollutedRequest);
for (const key of ["apiKey", "Cookie", "password", "authenticationToken", "session", "acquiredData", "formalData"]) {
  assert(!Object.prototype.hasOwnProperty.call(snapshot, key), key);
}
assert.deepEqual(Object.keys(snapshot), core.SNAPSHOT_FIELDS);
assert.equal(core.getApprovalSummary(complete.record).notice, "ready_for_manual_start_requestは取得開始を意味しません");

const source = fs.readFileSync(path.join(root, "phase26-3-manual-acquisition-approval-prestart-record-core.js"), "utf8");
const privateHtml = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const token of ["fetch(", "XMLHttpRequest", "WebSocket(", "EventSource(", "sendBeacon(", "setInterval(", "Worker("]) assert.equal(source.includes(token), false, token);
for (const prohibitedName of ["startAcquisition", "executeAcquisition", "runAcquisition", "downloadData", "fetchData", "callApi", "scrapeData", "scheduleAcquisition", "completeAcquisition"]) assert.equal(typeof core[prohibitedName], "undefined");
for (const marker of [
  'id="phase26-3-manual-acquisition-approval-prestart-record"', 'id="phase263-approval-form"',
  "承認者", "承認日時", "承認理由", "承認者役割", "自己承認", "取得要求サマリー",
  "requestSnapshot", "取得開始前チェックリスト", "取消条件", "有効期限", "承認判定結果",
  "preStartBlockingReasons", "承認・開始前記録サマリー",
  "ready_for_manual_start_requestは取得開始を意味しません"
]) assert(privateHtml.includes(marker), marker);
assert(privateHtml.includes("phase26-3-manual-acquisition-approval-prestart-record-core.js"));
assert(css.includes(".phase263-panel"));
assert(readme.includes("Phase26-3 Manual Acquisition Request Approval and Prestart Record Core"));
console.log("phase26ManualAcquisitionApprovalPrestartRecordCore.test.js: PASS");
