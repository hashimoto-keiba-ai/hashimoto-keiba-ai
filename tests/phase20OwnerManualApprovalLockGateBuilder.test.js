const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-15-owner-manual-approval-lock-gate-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-15-owner-manual-approval-lock-gate-db.json");
const summaryDb = readJson("phase20-15-owner-manual-approval-lock-gate-summary-db.json");
const phase2012Summary = readJson("phase20-12-private-operation-safety-gate-summary-db.json");
const phase2013Summary = readJson("phase20-13-manual-device-confirmation-gate-summary-db.json");
const phase2014Summary = readJson("phase20-14-public-release-final-block-gate-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");

assert.equal(engine.PHASE, "Phase20-15");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.GATE_STATUS, "owner_manual_approval_lock_plan_only");
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "local_launch", "manual_confirm_future_phase"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, [
  "public_url_exposure",
  "external_connection",
  "auto_publish",
  "auto_execution",
  "github_pages_setting_change",
  "repository_visibility_change",
  "public_release_without_all_device_confirmations",
  "public_release_without_manual_owner_confirmation",
  "owner_release_unlock_without_manual_confirmation"
]);

const gate = engine.buildOwnerManualApprovalLockGate({}, () => new Date("2026-06-29T03:00:00.000Z"));
assert.equal(gate.phase, "Phase20-15");
assert.equal(gate.gate_status, "owner_manual_approval_lock_plan_only");
assert.equal(gate.records.length, 7);
assert.equal(gate.protected_mode, true);
assert.equal(gate.plan_only, true);
assert.equal(gate.execution_allowed, false);
assert.equal(gate.auto_execution, false);
assert.equal(gate.auto_execution_allowed, false);
assert.equal(gate.external_connection, false);
assert.equal(gate.external_connection_allowed, false);
assert.equal(gate.auto_publish, false);
assert.equal(gate.auto_publish_allowed, false);
assert.equal(gate.github_pages_change_allowed, false);
assert.equal(gate.github_pages_setting_change_allowed, false);
assert.equal(gate.repository_visibility_change_allowed, false);
assert.equal(gate.public_release_blocked, true);
assert.equal(gate.public_release_allowed, false);
assert.equal(gate.manual_confirmation_required_before_public_release, true);
assert.equal(gate.manual_owner_confirmation_required, true);
assert.equal(gate.owner_manual_approval_required, true);
assert.equal(gate.owner_manual_approval_confirmed, false);
assert.equal(gate.owner_release_unlock_allowed, false);
assert.equal(gate.public_release_ready, false);
assert.equal(gate.final_public_release_block, true);
assert.equal(gate.all_device_confirmations_approved, false);
assert.equal(gate.owner_approval_lock_active, true);

assert.deepEqual(gate.phase20_15_summary, {
  total_owner_lock_conditions: 7,
  owner_manual_approval_required: true,
  owner_manual_approval_confirmed: false,
  owner_release_unlock_allowed: false,
  public_release_ready: false,
  final_public_release_block: true,
  all_device_confirmations_approved: false,
  owner_approval_lock_active: true,
  protected_mode: true,
  plan_only: true,
  private_local_policy_unchanged: true,
  external_connection: false,
  external_connection_allowed: false,
  auto_publish: false,
  auto_publish_allowed: false,
  auto_execution: false,
  auto_execution_allowed: false,
  github_pages_change_allowed: false,
  github_pages_setting_change_allowed: false,
  repository_visibility_change_allowed: false,
  public_release_blocked: true,
  public_release_allowed: false,
  manual_confirmation_required_before_public_release: true,
  manual_owner_confirmation_required: true,
  unsafe_flags_count: 0,
  owner_lock_rule: engine.OWNER_LOCK_RULE,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of gate.records) {
  assert.equal(record.condition_status, "locked_plan_only");
  assert.equal(record.private_local_policy_unchanged, true);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.auto_execution, false);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.github_pages_change_allowed, false);
  assert.equal(record.github_pages_setting_change_allowed, false);
  assert.equal(record.repository_visibility_change_allowed, false);
  assert.equal(record.public_release_blocked, true);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.manual_confirmation_required_before_public_release, true);
  assert.equal(record.manual_owner_confirmation_required, true);
  assert.equal(record.owner_manual_approval_required, true);
  assert.equal(record.owner_manual_approval_confirmed, false);
  assert.equal(record.owner_release_unlock_allowed, false);
  assert.equal(record.public_release_ready, false);
  assert.equal(record.final_public_release_block, true);
  assert.equal(record.all_device_confirmations_approved, false);
  assert.equal(record.owner_approval_lock_active, true);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

const expectedConditions = {
  owner_manual_approval_required: true,
  owner_manual_approval_confirmed: false,
  owner_release_unlock_allowed: false,
  public_release_ready: false,
  final_public_release_block: true,
  all_device_confirmations_approved: false,
  owner_approval_lock_active: true
};
for (const [condition, value] of Object.entries(expectedConditions)) {
  assert.ok(gate.records.some((record) => record.condition_name === condition && record.condition_value === value), `${condition} must be ${value}`);
}

assert.equal(db.phase, "Phase20-15");
assert.equal(db.gateStatus, "owner_manual_approval_lock_plan_only");
assert.equal(db.executionPolicy, "PLAN_ONLY");
assert.equal(db.protectionPolicy, "Protected");
assert.equal(db.ownerApprovalRequired, true);
assert.equal(db.ownerApprovalStatus, false);
assert.equal(db.publicReleaseBlocked, true);
assert.equal(db.externalConnection, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoExecution, false);
assert.equal(db.githubPagesChangeAllowed, false);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.repositoryVisibilityChangeAllowed, false);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.manualConfirmationRequiredBeforePublicRelease, true);
assert.equal(db.manualOwnerConfirmationRequired, true);
assert.equal(db.ownerManualApprovalRequired, true);
assert.equal(db.ownerManualApprovalConfirmed, false);
assert.equal(db.ownerReleaseUnlockAllowed, false);
assert.equal(db.publicReleaseReady, false);
assert.equal(db.finalPublicReleaseBlock, true);
assert.equal(db.allDeviceConfirmationsApproved, false);
assert.equal(db.ownerApprovalLockActive, true);
assert.equal(db.unsafeFlagsCount, 0);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-15");
assert.equal(summaryDb.phase20_15_summary.totalOwnerLockConditions, 7);
assert.equal(summaryDb.phase20_15_summary.ownerApprovalRequired, true);
assert.equal(summaryDb.phase20_15_summary.ownerApprovalStatus, false);
assert.equal(summaryDb.phase20_15_summary.ownerManualApprovalRequired, true);
assert.equal(summaryDb.phase20_15_summary.ownerManualApprovalConfirmed, false);
assert.equal(summaryDb.phase20_15_summary.ownerReleaseUnlockAllowed, false);
assert.equal(summaryDb.phase20_15_summary.publicReleaseReady, false);
assert.equal(summaryDb.phase20_15_summary.finalPublicReleaseBlock, true);
assert.equal(summaryDb.phase20_15_summary.allDeviceConfirmationsApproved, false);
assert.equal(summaryDb.phase20_15_summary.ownerApprovalLockActive, true);
assert.equal(summaryDb.phase20_15_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_15_summary.unsafeFlagsCount, 0);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(phase2012Summary.phase20_12_summary.externalConnection, false);
assert.equal(phase2012Summary.phase20_12_summary.autoPublish, false);
assert.equal(phase2012Summary.phase20_12_summary.publicReleaseAllowed, false);
assert.equal(phase2013Summary.phase20_13_summary.externalConnection, false);
assert.equal(phase2013Summary.phase20_13_summary.autoPublish, false);
assert.equal(phase2013Summary.phase20_13_summary.publicReleaseAllowed, false);
assert.equal(phase2013Summary.phase20_13_summary.allDevicesManuallyApproved, false);
assert.equal(phase2014Summary.phase20_14_summary.externalConnection, false);
assert.equal(phase2014Summary.phase20_14_summary.autoPublish, false);
assert.equal(phase2014Summary.phase20_14_summary.publicReleaseAllowed, false);
assert.equal(phase2014Summary.phase20_14_summary.publicReleaseReady, false);
assert.equal(phase2014Summary.phase20_14_summary.finalPublicReleaseBlock, true);
assert.equal(phase2014Summary.phase20_14_summary.allDeviceConfirmationsApproved, false);

for (const id of [
  "phase20-15-owner-manual-approval-lock-gate-builder",
  "phase20-14-public-release-final-block-gate-builder",
  "phase20-13-manual-device-confirmation-gate-builder",
  "phase20-12-private-operation-safety-gate-builder"
]) {
  assert.ok(index.includes(`id="${id}"`), `${id} panel is visible`);
  assert.ok(privateLocal.includes(`href="index.html#${id}"`), `${id} private-local link is visible`);
}
assert.ok(index.includes('<script src="phase20-15-owner-manual-approval-lock-gate-builder.js"></script>'));
assert.ok(privateLocal.includes("Phase20-15 Owner Manual Approval Lock Gate"));

const builderSource = readText("phase20-15-owner-manual-approval-lock-gate-builder.js");
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
  "auto_execution: true",
  "auto_execution_allowed: true",
  "github_pages_change_allowed: true",
  "github_pages_setting_change_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "public_release_ready: true",
  "owner_release_unlock_allowed: true",
  "owner_manual_approval_confirmed: true",
  "all_device_confirmations_approved: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-15 builder`);
}

console.log("phase20-15 owner manual approval lock gate builder tests passed");
