const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-19-local-only-safety-continuity-panel-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-19-local-only-safety-continuity-panel-db.json");
const summaryDb = readJson("phase20-19-local-only-safety-continuity-panel-summary-db.json");
const phase2012Summary = readJson("phase20-12-private-operation-safety-gate-summary-db.json");
const phase2013Summary = readJson("phase20-13-manual-device-confirmation-gate-summary-db.json");
const phase2014Summary = readJson("phase20-14-public-release-final-block-gate-summary-db.json");
const phase2015Summary = readJson("phase20-15-owner-manual-approval-lock-gate-summary-db.json");
const phase2016Summary = readJson("phase20-16-private-release-lock-audit-gate-summary-db.json");
const phase2017Summary = readJson("phase20-17-private-safety-status-dashboard-summary-db.json");
const phase2018Summary = readJson("phase20-18-local-launch-only-verification-gate-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.equal(engine.PHASE, "Phase20-19");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "local_only_safety_continuity_plan_only");
assert.equal(engine.LOCAL_LAUNCH_POLICY, "start-local.bat / private-local.html / index.html only");
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, [
  "public_url_exposure",
  "external_connection",
  "auto_publish",
  "auto_execution",
  "auto_launch",
  "github_pages_setting_change",
  "repository_visibility_change",
  "public_release_without_all_device_confirmations",
  "public_release_without_manual_owner_confirmation",
  "owner_release_unlock_without_manual_confirmation",
  "safety_lock_bypass",
  "private_policy_override",
  "dashboard_public_release_enable",
  "non_local_launch"
]);
assert.equal(engine.CONTINUITY_SCOPE.length, 11);

const panel = engine.buildLocalOnlySafetyContinuityPanel({}, () => new Date("2026-06-29T07:00:00.000Z"));
assert.equal(panel.phase, "Phase20-19");
assert.equal(panel.panel_status, "local_only_safety_continuity_plan_only");
assert.equal(panel.records.length, 10);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_launch_policy, engine.LOCAL_LAUNCH_POLICY);
assert.equal(panel.private_local_policy_unchanged, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.external_connection, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.github_pages_public_url_launch_allowed, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.public_release_ready, false);
assert.equal(panel.owner_approval_lock_active, true);
assert.equal(panel.final_public_release_block, true);
assert.equal(panel.all_device_confirmations_approved, false);

assert.deepEqual(panel.phase20_19_summary, {
  total_safety_checks: 10,
  repository_private_premise: true,
  local_launch_policy: engine.LOCAL_LAUNCH_POLICY,
  start_local_bat_route_allowed: true,
  private_local_html_route_allowed: true,
  index_html_route_allowed: true,
  github_pages_public_url_launch_allowed: false,
  public_url_launch_allowed: false,
  local_launch_only: true,
  phase20_12_to_18_locks_preserved: true,
  local_only_safe_to_continue: true,
  protected_mode: true,
  plan_only: true,
  private_local_policy_unchanged: true,
  external_connection: false,
  external_connection_allowed: false,
  auto_publish: false,
  auto_publish_allowed: false,
  auto_execution: false,
  auto_execution_allowed: false,
  auto_launch: false,
  auto_launch_allowed: false,
  github_pages_change_allowed: false,
  github_pages_setting_change_allowed: false,
  repository_visibility_change_allowed: false,
  public_release_blocked: true,
  public_release_allowed: false,
  manual_confirmation_required_before_public_release: true,
  manual_owner_confirmation_required: true,
  owner_approval_lock_active: true,
  final_public_release_block: true,
  all_device_confirmations_approved: false,
  public_release_ready: false,
  unsafe_flags_count: 0,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

const expectedChecks = {
  repository_private_premise: true,
  local_launch_policy_preserved: true,
  start_local_bat_route_allowed: true,
  private_local_html_route_allowed: true,
  index_html_route_allowed: true,
  github_pages_public_url_launch_allowed: false,
  auto_execution_allowed: false,
  unsafe_flags_count: 0,
  phase20_12_to_18_locks_preserved: true,
  local_only_safe_to_continue: true
};
for (const [check, value] of Object.entries(expectedChecks)) {
  assert.ok(panel.records.some((record) => record.check_name === check && record.check_value === value), `${check} must be ${value}`);
}

for (const record of panel.records) {
  assert.equal(record.continuity_status, "local_only_safety_confirmed");
  assert.equal(record.repository_private_premise, true);
  assert.equal(record.local_launch_policy, engine.LOCAL_LAUNCH_POLICY);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_execution, false);
  assert.equal(record.auto_launch, false);
  assert.equal(record.github_pages_public_url_launch_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

assert.equal(db.phase, "Phase20-19");
assert.equal(db.panelStatus, "local_only_safety_continuity_plan_only");
assert.equal(db.repositoryPrivatePremise, true);
assert.equal(db.localLaunchPolicy, engine.LOCAL_LAUNCH_POLICY);
assert.equal(db.externalConnection, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoLaunch, false);
assert.equal(db.githubPagesPublicUrlLaunchAllowed, false);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.protectedMode, true);
assert.equal(db.unsafeFlagsCount, 0);
assert.equal(db.continuityScope.length, 11);
assert.equal(db.safetyChecks.length, 10);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-19");
assert.equal(summaryDb.phase20_19_summary.totalSafetyChecks, 10);
assert.equal(summaryDb.phase20_19_summary.repositoryPrivatePremise, true);
assert.equal(summaryDb.phase20_19_summary.localLaunchPolicy, engine.LOCAL_LAUNCH_POLICY);
assert.equal(summaryDb.phase20_19_summary.githubPagesPublicUrlLaunchAllowed, false);
assert.equal(summaryDb.phase20_19_summary.publicUrlLaunchAllowed, false);
assert.equal(summaryDb.phase20_19_summary.autoExecution, false);
assert.equal(summaryDb.phase20_19_summary.autoLaunch, false);
assert.equal(summaryDb.phase20_19_summary.phase20_12_to_18_locks_preserved, true);
assert.equal(summaryDb.phase20_19_summary.localOnlySafeToContinue, true);
assert.equal(summaryDb.phase20_19_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_19_summary.unsafeFlagsCount, 0);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);

for (const summary of [phase2012Summary.phase20_12_summary, phase2013Summary.phase20_13_summary, phase2014Summary.phase20_14_summary, phase2015Summary.phase20_15_summary, phase2016Summary.phase20_16_summary, phase2017Summary.phase20_17_summary, phase2018Summary.phase20_18_summary]) {
  assert.equal(summary.externalConnection, false);
  assert.equal(summary.autoPublish, false);
  assert.equal(summary.publicReleaseAllowed, false);
}
assert.equal(phase2018Summary.phase20_18_summary.localLaunchOnly, true);
assert.equal(phase2018Summary.phase20_18_summary.autoLaunch, false);
assert.equal(phase2018Summary.phase20_18_summary.phase20_12_to_17_locks_preserved, true);

assert.ok(index.includes('id="phase20-19-local-only-safety-continuity-panel-builder"'));
assert.ok(index.includes('<script src="phase20-19-local-only-safety-continuity-panel-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-19-local-only-safety-continuity-panel-builder"'));
assert.ok(privateLocal.includes("Phase20-19 Local Only Safety Continuity Panel"));
for (const id of ["phase20-18-local-launch-only-verification-gate-builder", "phase20-17-private-safety-status-dashboard-builder", "phase20-16-private-release-lock-audit-gate-builder", "phase20-15-owner-manual-approval-lock-gate-builder", "phase20-14-public-release-final-block-gate-builder", "phase20-13-manual-device-confirmation-gate-builder", "phase20-12-private-operation-safety-gate-builder"]) {
  assert.ok(index.includes(`id="${id}"`), `${id} panel is visible`);
  assert.ok(privateLocal.includes(`href="index.html#${id}"`), `${id} private-local link is visible`);
}
assert.ok(readme.includes("Phase20-19 Local Only Safety Continuity Panel"));
assert.ok(readme.includes("phase20-19-local-only-safety-continuity-panel-builder.js"));

const builderSource = readText("phase20-19-local-only-safety-continuity-panel-builder.js");
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
  "auto_launch: true",
  "auto_launch_allowed: true",
  "github_pages_change_allowed: true",
  "github_pages_setting_change_allowed: true",
  "github_pages_public_url_launch_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "public_release_ready: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-19 builder`);
}

console.log("phase20-19 local only safety continuity panel builder tests passed");
