const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-13-manual-device-confirmation-gate-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-13-manual-device-confirmation-gate-db.json");
const summaryDb = readJson("phase20-13-manual-device-confirmation-gate-summary-db.json");
const phase2012Summary = readJson("phase20-12-private-operation-safety-gate-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");

assert.equal(engine.PHASE, "Phase20-13");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.GATE_STATUS, "manual_device_confirmation_gate_plan_only");
assert.equal(engine.FUTURE_RELEASE_RULE, "Public release allowed only after all device confirmations are manually approved in a future protected phase");
assert.deepEqual(engine.DEVICE_CONFIRMATION_TARGETS.map((target) => target.device_type), ["company_pc", "home_pc", "ipad", "mobile_phone"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, [
  "public_release",
  "public_url_exposure",
  "external_connection",
  "auto_publish",
  "auto_execution",
  "github_pages_setting_change",
  "repository_visibility_change",
  "release_without_all_manual_device_confirmations"
]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "manual_confirm_future_phase"]);

const gate = engine.buildManualDeviceConfirmationGate({}, () => new Date("2026-06-29T01:00:00.000Z"));
assert.equal(gate.phase, "Phase20-13");
assert.equal(gate.gate_status, engine.GATE_STATUS);
assert.equal(gate.records.length, 4);
assert.equal(gate.protected_mode, true);
assert.equal(gate.plan_only, true);
assert.equal(gate.execution_allowed, false);
assert.equal(gate.auto_execution_allowed, false);
assert.equal(gate.external_connection, false);
assert.equal(gate.external_connection_allowed, false);
assert.equal(gate.auto_publish, false);
assert.equal(gate.auto_publish_allowed, false);
assert.equal(gate.github_pages_change_allowed, false);
assert.equal(gate.github_pages_setting_change_allowed, false);
assert.equal(gate.repository_visibility_change_allowed, false);
assert.equal(gate.public_release_allowed, false);
assert.equal(gate.manual_confirmation_required_before_public_release, true);
assert.equal(gate.future_protected_phase_required, true);

assert.deepEqual(gate.phase20_13_summary, {
  total_device_targets: 4,
  manual_confirmation_required_count: 4,
  manually_approved_count: 0,
  all_devices_manually_approved: false,
  protected_mode: true,
  plan_only: true,
  private_local_policy_unchanged: true,
  external_connection: false,
  external_connection_allowed: false,
  auto_publish: false,
  auto_publish_allowed: false,
  github_pages_change_allowed: false,
  github_pages_setting_change_allowed: false,
  repository_visibility_change_allowed: false,
  public_release_allowed: false,
  manual_confirmation_required_before_public_release: true,
  future_protected_phase_required: true,
  unsafe_flags_count: 0,
  release_rule: engine.FUTURE_RELEASE_RULE,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of gate.records) {
  assert.equal(record.confirmation_status, "manual_confirmation_required");
  assert.equal(record.manually_approved, false);
  assert.equal(record.public_release_ready, false);
  assert.equal(record.private_local_policy_unchanged, true);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection, false);
  assert.equal(record.external_connection_allowed, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_publish_allowed, false);
  assert.equal(record.github_pages_change_allowed, false);
  assert.equal(record.github_pages_setting_change_allowed, false);
  assert.equal(record.repository_visibility_change_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.manual_confirmation_required_before_public_release, true);
  assert.equal(record.future_protected_phase_required, true);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

for (const required of ["company_pc", "home_pc", "ipad", "mobile_phone"]) {
  assert.ok(gate.records.some((record) => record.device_type === required), `${required} device target is required`);
}

assert.equal(db.phase, "Phase20-13");
assert.equal(db.privateLocalPolicyUnchanged, true);
assert.equal(db.protectedMode, true);
assert.equal(db.externalConnection, false);
assert.equal(db.autoPublish, false);
assert.equal(db.githubPagesChangeAllowed, false);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.repositoryVisibilityChangeAllowed, false);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.manualConfirmationRequiredBeforePublicRelease, true);
assert.equal(db.futureProtectedPhaseRequired, true);
assert.equal(db.deviceConfirmationTargets.length, 4);
assert.deepEqual(db.deviceConfirmationTargets.map((target) => target.deviceType), ["company_pc", "home_pc", "ipad", "mobile_phone"]);
assert.ok(db.deviceConfirmationTargets.every((target) => target.manuallyApproved === false));
assert.ok(db.deviceConfirmationTargets.every((target) => target.publicReleaseReady === false));
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-13");
assert.equal(summaryDb.phase20_13_summary.totalDeviceTargets, 4);
assert.equal(summaryDb.phase20_13_summary.manualConfirmationRequiredCount, 4);
assert.equal(summaryDb.phase20_13_summary.manuallyApprovedCount, 0);
assert.equal(summaryDb.phase20_13_summary.allDevicesManuallyApproved, false);
assert.equal(summaryDb.phase20_13_summary.externalConnection, false);
assert.equal(summaryDb.phase20_13_summary.autoPublish, false);
assert.equal(summaryDb.phase20_13_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase20_13_summary.repositoryVisibilityChangeAllowed, false);
assert.equal(summaryDb.phase20_13_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_13_summary.unsafeFlagsCount, 0);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);

assert.equal(phase2012Summary.phase20_12_summary.externalConnection, false);
assert.equal(phase2012Summary.phase20_12_summary.autoPublish, false);
assert.equal(phase2012Summary.phase20_12_summary.githubPagesSettingChangeAllowed, false);
assert.equal(phase2012Summary.phase20_12_summary.repositoryVisibilityChangeAllowed, false);
assert.equal(phase2012Summary.phase20_12_summary.publicReleaseAllowed, false);

assert.ok(index.includes('id="phase20-13-manual-device-confirmation-gate-builder"'));
assert.ok(index.includes('<script src="phase20-13-manual-device-confirmation-gate-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-13-manual-device-confirmation-gate-builder"'));
assert.ok(privateLocal.includes("Phase20-13 Manual Device Confirmation Gate"));
assert.ok(index.includes('id="phase20-12-private-operation-safety-gate-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-12-private-operation-safety-gate-builder"'));
assert.ok(privateLocal.includes("Phase20-12 Private Operation Safety Gate"));

const builderSource = readText("phase20-13-manual-device-confirmation-gate-builder.js");
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
  "github_pages_change_allowed: true",
  "github_pages_setting_change_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-13 builder`);
}

console.log("phase20-13 manual device confirmation gate builder tests passed");
