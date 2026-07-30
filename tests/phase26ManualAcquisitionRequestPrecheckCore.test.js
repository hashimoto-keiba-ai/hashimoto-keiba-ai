"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const phase261 = require("../phase26-1-external-data-acquisition-boundary.js");
const core = require("../phase26-2-manual-acquisition-request-precheck-core.js");
const root = path.resolve(__dirname, "..");
const operation = { performedBy: "owner", reason: "manual review", explicitConfirmation: true };
const validInput = {
  createdBy: "owner",
  acquisitionMethod: "manual_entry",
  sourceTrustLevel: "official_source",
  sourceName: "Official source",
  sourceDescription: "reference only",
  sourceUrlReference: "https://example.invalid/reference-only",
  meetingDate: "2026-08-03",
  racecourse: "Tokyo",
  raceNumber: 11,
  raceName: "Sample race",
  scheduledPostTime: "15:40",
  targetDataTypes: ["出馬表", "馬名", "単勝オッズ"],
  dataTimepoint: "pre_race",
  expectedRecordCount: 18,
  purpose: "prediction_input_support",
  operatorNote: "manual precheck",
  consentConfirmed: true,
  termsCheckConfirmed: true,
  accessRestrictionCheckConfirmed: true,
  credentialsRequired: false
};

assert.strictEqual(core.PHASE261_DEFINITION.safetyBoundary, phase261.definition().safetyBoundary);
assert.strictEqual(core.PHASE261_DEFINITION.targetData, phase261.definition().targetData);
const draft = core.createDraftRequest(validInput, { now: () => new Date("2026-08-03T01:00:00Z") });
for (const [key, value] of Object.entries({
  executionPolicy: "PLAN_ONLY",
  protectedMode: true,
  privateLocalOnly: true,
  externalCommunicationEnabled: false,
  automaticAcquisitionEnabled: false,
  scheduledAcquisitionEnabled: false,
  unattendedAcquisitionEnabled: false,
  automaticPurchaseEnabled: false,
  automaticApplicationEnabled: false,
  automaticLearningUpdateEnabled: false,
  previewRequired: true,
  manualApprovalRequired: true,
  credentialsStoredInSourceCode: false
})) assert.strictEqual(draft[key], value, key);

assert(core.evaluatePrecheck({ ...draft, sourceTrustLevel: "unknown_source" }, operation).blockingReasons.includes("unknown_source_blocked"));
assert(core.evaluatePrecheck({ ...draft, sourceName: "" }, operation).blockingReasons.includes("source_name_missing"));
assert(core.evaluatePrecheck({ ...draft, targetDataTypes: [] }, operation).blockingReasons.includes("target_data_types_missing"));
assert(core.evaluatePrecheck({ ...draft, targetDataTypes: ["対象外データ"] }, operation).blockingReasons.includes("target_data_type_out_of_scope"));
assert(core.evaluatePrecheck({ ...draft, dataTimepoint: "unknown" }, operation).blockingReasons.includes("data_timepoint_unknown"));
assert(core.evaluatePrecheck({ ...draft, consentConfirmed: false }, operation).blockingReasons.includes("consent_not_confirmed"));
assert(core.evaluatePrecheck({ ...draft, termsCheckConfirmed: false }, operation).blockingReasons.includes("terms_check_not_confirmed"));
assert(core.evaluatePrecheck({ ...draft, accessRestrictionCheckConfirmed: false }, operation).blockingReasons.includes("access_restriction_check_not_confirmed"));
assert.equal(core.evaluatePrecheck({ ...draft, credentialsRequired: true }, operation).validationResult, "blocked_by_credentials_requirement");
assert.equal(core.evaluatePrecheck({ ...draft, purpose: "automatic_purchase" }, operation).validationResult, "blocked_by_prohibited_purpose");

const ready = core.evaluatePrecheck(draft, operation);
assert.equal(ready.ready, true);
assert.equal(ready.validationResult, "ready_for_manual_request");
assert.equal(ready.request.requestStatus, "ready_for_manual_request");
assert.deepEqual(ready.blockingReasons, []);
const tampered = core.createDraftRequest({ ...validInput, externalCommunicationEnabled: true, credentialsStoredInSourceCode: true });
assert.equal(tampered.externalCommunicationEnabled, false);
assert.equal(tampered.credentialsStoredInSourceCode, false);
assert.equal(core.transitionRequest(ready.request, "acquisition_started", operation).transitioned, false);
assert.equal(core.transitionRequest({ ...ready.request, requestStatus: "precheck_blocked" }, "ready_for_manual_request", operation).reason, "blocked_request_cannot_be_forced_ready");
assert.equal(core.transitionRequest(draft, "awaiting_source_selection", {}).reason, "manual_operation_required");
assert.equal(core.getRequestSummary(ready.request).notice, "準備完了は取得実行を意味しません");

const source = fs.readFileSync(path.join(root, "phase26-2-manual-acquisition-request-precheck-core.js"), "utf8");
const privateHtml = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const token of ["fetch(", "XMLHttpRequest", "WebSocket(", "EventSource(", "sendBeacon(", "setInterval(", "Worker("]) {
  assert.equal(source.includes(token), false, token);
}
for (const marker of [
  'id="phase26-2-manual-acquisition-request-precheck"',
  'id="phase262-request-form"',
  "取得元選択欄", "取得対象レース欄", "対象データ選択欄", "データ時点区分",
  "予定件数", "利用目的", "同意確認", "利用規約確認", "アクセス制限確認",
  "事前確認結果", "blockingReasons", "要求サマリー", "準備完了は取得実行を意味しません"
]) assert(privateHtml.includes(marker), marker);
assert(privateHtml.includes("phase26-2-manual-acquisition-request-precheck-core.js"));
assert(css.includes(".phase262-panel"));
assert(readme.includes("Phase26-2 Manual Acquisition Request, Source Selection, and Precheck Core"));
console.log("phase26ManualAcquisitionRequestPrecheckCore.test.js: PASS");
