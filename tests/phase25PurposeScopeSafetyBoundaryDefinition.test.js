"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const core = require("../phase25-1-purpose-scope-safety-boundary-definition.js");
const root = path.resolve(__dirname, "..");

const definition = core.definition();
assert.equal(core.evaluateSafetyGate(core.SAFETY_BOUNDARY).available, true);
assert.equal(definition.currentStage, "definition");
assert.equal(definition.executionImplemented, false);
assert.equal(definition.networkCommunicationImplemented, false);
assert.equal(core.SAFETY_BOUNDARY.externalAcquisitionExecutionAllowed, false);
assert(Object.isFrozen(core.SAFETY_BOUNDARY));
assert(core.IN_SCOPE.some(item => item.includes("オッズ")));
assert(core.IN_SCOPE.some(item => item.includes("一時保存")));
assert(core.OUT_OF_SCOPE.includes("馬券の自動購入"));
assert(core.OUT_OF_SCOPE.includes("投票操作"));
assert(core.ACQUISITION_STAGES.includes("limited_execution_candidate"));

for (const environment of [
  { publicAccessAllowed: true },
  { githubPagesAllowed: true },
  { automaticBettingAllowed: true },
  { automaticPurchaseAllowed: true },
  { humanApprovalRequired: false },
  { privateLocalOnly: false },
  { planOnly: false },
  { protectedMode: false },
  { externalAcquisitionExecutionAllowed: true },
  { auditLogRequired: false }
]) {
  const gate = core.evaluateSafetyGate(environment);
  assert.equal(gate.available, false, JSON.stringify(environment));
  assert.equal(gate.externalAcquisitionExecutionAllowed, false);
}

const source = fs.readFileSync(path.join(root, "phase25-1-purpose-scope-safety-boundary-definition.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateHtml = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const css = fs.readFileSync(path.join(root, "dashboard.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const token of ["fetch(", "XMLHttpRequest", "WebSocket(", "EventSource(", "sendBeacon(", "setInterval("]) {
  assert.equal(source.includes(token), false, `network or background primitive found: ${token}`);
}
assert(html.includes('id="phase25-1-purpose-scope-safety-boundary"'));
assert(html.includes("外部取得実行は未許可"));
assert(html.includes("人間の明示承認・開始操作が必要"));
assert(html.includes("自動購入・自動投票は対象外"));
assert(html.includes("phase25-1-purpose-scope-safety-boundary-definition.js"));
assert(privateHtml.includes("#phase25-1-purpose-scope-safety-boundary"));
assert(privateHtml.includes("外部取得実行は未許可"));
assert(privateHtml.includes("対象範囲"));
assert(privateHtml.includes("対象外範囲"));
assert(privateHtml.includes("現在の実行許可状態"));
assert(css.includes(".phase251-panel"));
assert(readme.includes("Phase25-1 Purpose, Scope, and Safety Boundary"));

const existingTests = fs.readdirSync(__dirname).filter(name => /^phase24.*\.test\.js$/.test(name));
assert(existingTests.length >= 10, "Phase24 regression tests must remain present");
console.log("phase25PurposeScopeSafetyBoundaryDefinition.test.js: PASS");
