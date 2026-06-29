const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-17-private-safety-status-dashboard-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-17-private-safety-status-dashboard-db.json");
const summaryDb = readJson("phase20-17-private-safety-status-dashboard-summary-db.json");
const phase2012Summary = readJson("phase20-12-private-operation-safety-gate-summary-db.json");
const phase2013Summary = readJson("phase20-13-manual-device-confirmation-gate-summary-db.json");
const phase2014Summary = readJson("phase20-14-public-release-final-block-gate-summary-db.json");
const phase2015Summary = readJson("phase20-15-owner-manual-approval-lock-gate-summary-db.json");
const phase2016Summary = readJson("phase20-16-private-release-lock-audit-gate-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");

assert.equal(engine.PHASE, "Phase20-17");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.DASHBOARD_STATUS, "private_safety_status_dashboard_plan_only");
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, [
  "public_url_exposure",
  "external_connection",
  "auto_publish",
  "auto_execution",
  "github_pages_setting_change",
  "repository_visibility_change",
  "public_release_without_all_device_confirmations",
  "public_release_without_manual_owner_confirmation",
  "owner_release_unlock_without_manual_confirmation",
  "safety_lock_bypass",
  "private_policy_override",
  "dashboard_public_release_enable"
]);
assert.equal(engine.DASHBOARD_SCOPE.length, 5);

const dashboard = engine.buildPrivateSafetyStatusDashboard({}, () => new Date("2026-06-29T05:00:00.000Z"));
assert.equal(dashboard.phase, "Phase20-17");
assert.equal(dashboard.dashboard_status, "private_safety_status_dashboard_plan_only");
assert.equal(dashboard.records.length, 15);
assert.equal(dashboard.protected_mode, true);
assert.equal(dashboard.plan_only, true);
assert.equal(dashboard.private_local_policy_unchanged, true);
assert.equal(dashboard.external_connection, false);
assert.equal(dashboard.auto_publish, false);
assert.equal(dashboard.auto_execution, false);
assert.equal(dashboard.github_pages_change_allowed, false);
assert.equal(dashboard.github_pages_setting_change_allowed, false);
assert.equal(dashboard.repository_visibility_change_allowed, false);
assert.equal(dashboard.public_release_allowed, false);
assert.equal(dashboard.manual_confirmation_required_before_public_release, true);
assert.equal(dashboard.manual_owner_confirmation_required, true);
assert.equal(dashboard.owner_approval_lock_active, true);
assert.equal(dashboard.final_public_release_block, true);
assert.equal(dashboard.all_device_confirmations_approved, false);
assert.equal(dashboard.public_release_ready, false);

assert.deepEqual(dashboard.phase20_17_summary, {
  total_display_checks: 15,
  phase20_12_status: "locked",
  phase20_13_status: "locked",
  phase20_14_status: "blocked",
  phase20_15_status: "owner_locked",
  phase20_16_status: "audit_pass",
  private_local_operation: true,
  public_release_blocked: true,
  external_connection_detected: false,
  auto_publish_detected: false,
  auto_execution_detected: false,
  github_pages_change_detected: false,
  repository_visibility_change_detected: false,
  owner_unlock_confirmed: false,
  device_confirmations_complete: false,
  dashboard_safe_to_continue_local_only: true,
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
  public_release_allowed: false,
  manual_confirmation_required_before_public_release: true,
  manual_owner_confirmation_required: true,
  owner_approval_lock_active: true,
  final_public_release_block: true,
  all_device_confirmations_approved: false,
  public_release_ready: false,
  unsafe_flags_count: 0,
  dashboard_rule: engine.DASHBOARD_RULE,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

const expectedChecks = {
  phase20_12_status: "locked",
  phase20_13_status: "locked",
  phase20_14_status: "blocked",
  phase20_15_status: "owner_locked",
  phase20_16_status: "audit_pass",
  private_local_operation: true,
  public_release_blocked: true,
  external_connection_detected: false,
  auto_publish_detected: false,
  auto_execution_detected: false,
  github_pages_change_detected: false,
  repository_visibility_change_detected: false,
  owner_unlock_confirmed: false,
  device_confirmations_complete: false,
  dashboard_safe_to_continue_local_only: true
};
for (const [check, value] of Object.entries(expectedChecks)) {
  assert.ok(dashboard.records.some((record) => record.check_name === check && record.check_value === value), `${check} must be ${value}`);
}

for (const record of dashboard.records) {
  assert.equal(record.display_status, "dashboard_safe");
  assert.equal(record.private_local_policy_unchanged, true);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_execution, false);
  assert.equal(record.github_pages_change_allowed, false);
  assert.equal(record.github_pages_setting_change_allowed, false);
  assert.equal(record.repository_visibility_change_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.owner_approval_lock_active, true);
  assert.equal(record.final_public_release_block, true);
  assert.equal(record.all_device_confirmations_approved, false);
  assert.equal(record.public_release_ready, false);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

assert.equal(db.phase, "Phase20-17");
assert.equal(db.dashboardStatus, "private_safety_status_dashboard_plan_only");
assert.equal(db.executionPolicy, "PLAN_ONLY");
assert.equal(db.protectionPolicy, "Protected");
assert.equal(db.dashboardScope.length, 5);
assert.equal(db.privateLocalPolicyUnchanged, true);
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
assert.equal(db.ownerApprovalLockActive, true);
assert.equal(db.finalPublicReleaseBlock, true);
assert.equal(db.allDeviceConfirmationsApproved, false);
assert.equal(db.publicReleaseReady, false);
assert.equal(db.protectedMode, true);
assert.equal(db.unsafeFlagsCount, 0);
assert.equal(db.displayChecks.length, 15);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-17");
assert.equal(summaryDb.phase20_17_summary.totalDisplayChecks, 15);
assert.equal(summaryDb.phase20_17_summary.phase20_12_status, "locked");
assert.equal(summaryDb.phase20_17_summary.phase20_13_status, "locked");
assert.equal(summaryDb.phase20_17_summary.phase20_14_status, "blocked");
assert.equal(summaryDb.phase20_17_summary.phase20_15_status, "owner_locked");
assert.equal(summaryDb.phase20_17_summary.phase20_16_status, "audit_pass");
assert.equal(summaryDb.phase20_17_summary.privateLocalOperation, true);
assert.equal(summaryDb.phase20_17_summary.publicReleaseBlocked, true);
assert.equal(summaryDb.phase20_17_summary.externalConnectionDetected, false);
assert.equal(summaryDb.phase20_17_summary.autoPublishDetected, false);
assert.equal(summaryDb.phase20_17_summary.autoExecutionDetected, false);
assert.equal(summaryDb.phase20_17_summary.githubPagesChangeDetected, false);
assert.equal(summaryDb.phase20_17_summary.repositoryVisibilityChangeDetected, false);
assert.equal(summaryDb.phase20_17_summary.ownerUnlockConfirmed, false);
assert.equal(summaryDb.phase20_17_summary.deviceConfirmationsComplete, false);
assert.equal(summaryDb.phase20_17_summary.dashboardSafeToContinueLocalOnly, true);
assert.equal(summaryDb.phase20_17_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_17_summary.publicReleaseReady, false);
assert.equal(summaryDb.phase20_17_summary.unsafeFlagsCount, 0);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(phase2012Summary.phase20_12_summary.publicReleaseAllowed, false);
assert.equal(phase2013Summary.phase20_13_summary.allDevicesManuallyApproved, false);
assert.equal(phase2014Summary.phase20_14_summary.finalPublicReleaseBlock, true);
assert.equal(phase2015Summary.phase20_15_summary.ownerApprovalLockActive, true);
assert.equal(phase2016Summary.phase20_16_summary.publicReleaseBlockIntegrity, true);
assert.equal(phase2016Summary.phase20_16_summary.externalOrAutoPublishDetected, false);
for (const summary of [phase2012Summary.phase20_12_summary, phase2013Summary.phase20_13_summary, phase2014Summary.phase20_14_summary, phase2015Summary.phase20_15_summary, phase2016Summary.phase20_16_summary]) {
  assert.equal(summary.externalConnection, false);
  assert.equal(summary.autoPublish, false);
  assert.equal(summary.publicReleaseAllowed, false);
}

for (const id of [
  "phase20-17-private-safety-status-dashboard-builder",
  "phase20-16-private-release-lock-audit-gate-builder",
  "phase20-15-owner-manual-approval-lock-gate-builder",
  "phase20-14-public-release-final-block-gate-builder",
  "phase20-13-manual-device-confirmation-gate-builder",
  "phase20-12-private-operation-safety-gate-builder"
]) {
  assert.ok(index.includes(`id="${id}"`), `${id} panel is visible`);
  assert.ok(privateLocal.includes(`href="index.html#${id}"`), `${id} private-local link is visible`);
}
assert.ok(index.includes('<script src="phase20-17-private-safety-status-dashboard-builder.js"></script>'));
assert.ok(privateLocal.includes("Phase20-17 Private Safety Status Dashboard"));

const builderSource = readText("phase20-17-private-safety-status-dashboard-builder.js");
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
  "external_connection_detected: true",
  "auto_publish_detected: true",
  "auto_execution_detected: true",
  "owner_unlock_confirmed: true",
  "device_confirmations_complete: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-17 builder`);
}

console.log("phase20-17 private safety status dashboard builder tests passed");
