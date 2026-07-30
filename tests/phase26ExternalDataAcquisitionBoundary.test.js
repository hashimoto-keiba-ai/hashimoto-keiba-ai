"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const core = require("../phase26-1-external-data-acquisition-boundary.js");
const root = path.resolve(__dirname, "..");

const definition = core.definition();
const boundary = definition.safetyBoundary;

assert.equal(boundary.executionPolicy, "PLAN_ONLY");
assert.equal(boundary.planOnly, true);
assert.equal(boundary.protectedMode, true);
assert.equal(boundary.externalCommunicationEnabled, false);
assert.equal(boundary.automaticAcquisitionEnabled, false);
assert.equal(boundary.scheduledAcquisitionEnabled, false);
assert.equal(boundary.automaticPurchaseEnabled, false);
assert.equal(boundary.automaticApplicationEnabled, false);
assert.equal(boundary.automaticLearningUpdateEnabled, false);
assert.equal(boundary.manualApprovalRequired, true);
assert.equal(boundary.previewRequired, true);
assert.equal(definition.stateTransitionsImplemented, false);
assert.equal(definition.acquisitionImplemented, false);
assert.equal(definition.networkCommunicationImplemented, false);
assert.equal(core.isEligibleForFormalReflection("unknown_source"), false);
assert.equal(core.evaluateReviewEligibility({
  sourceTrustLevel: "unknown_source",
  manualConsent: true,
  formatValid: true,
  timepoint: "pre_race",
  previewCompleted: true
}).formalReflectionEligible, false);
assert.equal(core.evaluateReviewEligibility({
  sourceTrustLevel: "official_source",
  manualConsent: true,
  formatValid: true,
  timepoint: "pre_race",
  previewCompleted: true
}).result, "allowed_for_manual_review");

for (const field of [
  "開催情報", "競馬場", "レース番号", "発走時刻", "レース名", "コース種別", "距離",
  "馬場状態", "天候", "出馬表", "枠番", "馬番", "馬名", "性齢", "斤量", "騎手",
  "調教師", "単勝オッズ", "人気順位", "馬体重", "馬体重増減", "レース結果", "着順",
  "タイム", "着差", "上がり", "通過順位", "払戻情報"
]) assert(core.TARGET_DATA.includes(field), field);

for (const state of [
  "not_configured", "disabled", "awaiting_manual_selection", "awaiting_manual_start",
  "acquisition_requested", "preview_only", "validation_required", "approved_for_staging",
  "rejected", "failed", "cancelled", "expired"
]) assert(core.DATA_STATES.includes(state), state);

const source = fs.readFileSync(path.join(root, "phase26-1-external-data-acquisition-boundary.js"), "utf8");
const privateHtml = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

for (const token of [
  "fetch(", "XMLHttpRequest", "WebSocket(", "EventSource(", "sendBeacon(",
  "setInterval(", "requestAnimationFrame(", "Worker("
]) assert.equal(source.includes(token), false, `prohibited primitive found: ${token}`);

for (const marker of [
  'id="phase26-1-external-data-acquisition-boundary"',
  "Phase26-1 / DESIGN REVIEW ONLY",
  "これは設計確認専用であり、取得は実行されません",
  "PLAN_ONLY / protectedMode / Private Local only",
  "対象データ一覧", "取得方式候補", "安全境界", "状態定義（表示のみ）",
  "取得元の信頼区分", "データ時点区分", "判定結果の例",
  "unknown_sourceは正式反映候補にできません"
]) assert(privateHtml.includes(marker), marker);

assert(privateHtml.includes("phase26-1-external-data-acquisition-boundary.js"));
assert(css.includes(".phase261-panel"));
assert(readme.includes("Phase26-1 External Data Acquisition Purpose, Scope, and Safety Boundary"));
console.log("phase26ExternalDataAcquisitionBoundary.test.js: PASS");
