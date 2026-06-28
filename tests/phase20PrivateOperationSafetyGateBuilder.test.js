const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-12-private-operation-safety-gate-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-12-private-operation-safety-gate-db.json");
const summaryDb = readJson("phase20-12-private-operation-safety-gate-summary-db.json");
const phase2010Summary = readJson("phase20-10-final-display-confirmation-checklist-summary-db.json");
const phase2011Summary = readJson("phase20-11-final-integration-safety-review-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");

assert.equal(engine.PHASE, "Phase20-12");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.GATE_STATUS, "private_operation_safety_gate_plan_only");
assert.equal(engine.GITHUB_PAGES_POLICY, "OFF or not required for private local operation");
assert.equal(engine.LOCAL_LAUNCHER_POLICY, "start-local.bat / private-local.html");
assert.equal(engine.SAFE_OPERATION_RULE, "Do not expose public URL unless explicitly approved");
assert.deepEqual(engine.BLOCKED_ACTIONS, [
  "public_url_exposure",
  "external_connection",
  "auto_publish",
  "auto_execution",
  "github_pages_setting_change",
  "repository_visibility_change",
  "public_release_without_manual_confirmation"
]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "local_launch"]);

const gate = engine.buildPrivateOperationSafetyGate({}, () => new Date("2026-06-29T00:00:00.000Z"));
assert.equal(gate.phase, "Phase20-12");
assert.equal(gate.gate_status, engine.GATE_STATUS);
assert.equal(gate.records.length, 9);
assert.equal(gate.protected_mode, true);
assert.equal(gate.plan_only, true);
assert.equal(gate.execution_allowed, false);
assert.equal(gate.auto_execution_allowed, false);
assert.equal(gate.external_connection, false);
assert.equal(gate.external_connection_allowed, false);
assert.equal(gate.auto_publish, false);
assert.equal(gate.auto_publish_allowed, false);
assert.equal(gate.github_pages_setting_change_allowed, false);
assert.equal(gate.repository_visibility_change_allowed, false);
assert.equal(gate.public_release_allowed, false);
assert.equal(gate.manual_confirmation_required_before_public_release, true);

assert.deepEqual(gate.phase20_12_summary, {
  total_check_items: 9,
  repository_visibility_awareness_required: true,
  github_pages_policy: engine.GITHUB_PAGES_POLICY,
  local_launcher_policy: engine.LOCAL_LAUNCHER_POLICY,
  device_policy_targets: 4,
  safe_operation_rule: engine.SAFE_OPERATION_RULE,
  protected_mode: true,
  plan_only: true,
  external_connection: false,
  external_connection_allowed: false,
  auto_publish: false,
  auto_publish_allowed: false,
  manual_confirmation_required_before_public_release: true,
  github_pages_setting_change_allowed: false,
  repository_visibility_change_allowed: false,
  public_release_allowed: false,
  unsafe_flags_count: 0,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of gate.records) {
  assert.equal(record.check_status, "manual_confirmation_required");
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection, false);
  assert.equal(record.external_connection_allowed, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_publish_allowed, false);
  assert.equal(record.github_pages_setting_change_allowed, false);
  assert.equal(record.repository_visibility_change_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.manual_confirmation_required_before_public_release, true);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

for (const required of [
  "P20-12-REPOSITORY-VISIBILITY",
  "P20-12-GITHUB-PAGES",
  "P20-12-LOCAL-LAUNCHER",
  "P20-12-COMPANY-PC",
  "P20-12-HOME-PC",
  "P20-12-IPAD",
  "P20-12-MOBILE-PHONE",
  "P20-12-SAFE-OPERATION",
  "P20-12-MANUAL-CONFIRMATION"
]) {
  assert.ok(gate.records.some((record) => record.id === required), `${required} is required`);
}

assert.equal(db.phase, "Phase20-12");
assert.equal(db.protectedMode, true);
assert.equal(db.externalConnection, false);
assert.equal(db.autoPublish, false);
assert.equal(db.manualConfirmationRequiredBeforePublicRelease, true);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.repositoryVisibilityChangeAllowed, false);
assert.equal(db.devicePolicies.length, 4);
assert.equal(db.records.length, 9);
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-12");
assert.equal(summaryDb.phase20_12_summary.totalCheckItems, 9);
assert.equal(summaryDb.phase20_12_summary.devicePolicyTargets, 4);
assert.equal(summaryDb.phase20_12_summary.externalConnection, false);
assert.equal(summaryDb.phase20_12_summary.autoPublish, false);
assert.equal(summaryDb.phase20_12_summary.manualConfirmationRequiredBeforePublicRelease, true);
assert.equal(summaryDb.phase20_12_summary.unsafeFlagsCount, 0);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);

assert.equal(phase2011Summary.phase20_11_summary.manualConfirmationRequiredBeforeMerge, true);
assert.equal(phase2011Summary.phase20_11_summary.mergeAllowed, false);
assert.equal(phase2011Summary.phase20_11_summary.externalConnectionAllowed, false);

assert.ok(index.includes('id="phase20-12-private-operation-safety-gate-builder"'));
assert.ok(index.includes('<script src="phase20-12-private-operation-safety-gate-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-12-private-operation-safety-gate-builder"'));
assert.ok(privateLocal.includes("Phase20-12 Private Operation Safety Gate"));
assert.ok(privateLocal.includes('href="index.html#phase20-11-final-integration-safety-review-builder"'));
assert.ok(index.includes('id="phase20-11-final-integration-safety-review-builder"'));
assert.equal(phase2010Summary.phase, "Phase20-10");
assert.equal(phase2010Summary.phase20_10_summary.githubPagesSettingChangeAllowed, false);

for (const route of ["course-console.html?console=win5", "course-console.html?console=hakodate", "course-console.html?console=sapporo"]) {
  assert.ok(index.includes(route), `index keeps route ${route}`);
}
for (const route of ["WIN5/index.html", "函館競馬場/index.html", "札幌競馬場/index.html"]) {
  assert.ok(privateLocal.includes(route), `private-local keeps route ${route}`);
}

const builderSource = readText("phase20-12-private-operation-safety-gate-builder.js");
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  "external_connection: true",
  "external_connection_allowed: true",
  "auto_publish: true",
  "auto_publish_allowed: true",
  "github_pages_setting_change_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-12 builder`);
}

console.log("phase20-12 private operation safety gate builder tests passed");
