const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-21-post-completion-safe-operation-lock-panel-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-21-post-completion-safe-operation-lock-panel-db.json");
const summaryDb = readJson("phase20-21-post-completion-safe-operation-lock-panel-summary-db.json");
const phase2012Summary = readJson("phase20-12-private-operation-safety-gate-summary-db.json");
const phase2013Summary = readJson("phase20-13-manual-device-confirmation-gate-summary-db.json");
const phase2014Summary = readJson("phase20-14-public-release-final-block-gate-summary-db.json");
const phase2015Summary = readJson("phase20-15-owner-manual-approval-lock-gate-summary-db.json");
const phase2016Summary = readJson("phase20-16-private-release-lock-audit-gate-summary-db.json");
const phase2017Summary = readJson("phase20-17-private-safety-status-dashboard-summary-db.json");
const phase2018Summary = readJson("phase20-18-local-launch-only-verification-gate-summary-db.json");
const phase2019Summary = readJson("phase20-19-local-only-safety-continuity-panel-summary-db.json");
const phase2020Summary = readJson("phase20-20-final-safety-continuity-review-panel-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.equal(engine.PHASE, "Phase20-21");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "post_completion_safe_operation_lock_plan_only");
assert.equal(engine.LOCAL_LAUNCH_POLICY, "start-local.bat / private-local.html / index.html only");
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Continue only with private local safe operation");
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view"]);
assert.equal(engine.REVIEW_SCOPE.length, 14);

const panel = engine.buildPostCompletionSafeOperationLockPanel({}, () => new Date("2026-06-30T04:00:00.000Z"));
assert.equal(panel.phase, "Phase20-21");
assert.equal(panel.panel_status, "post_completion_safe_operation_lock_plan_only");
assert.equal(panel.records.length, 15);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_launch_policy, engine.LOCAL_LAUNCH_POLICY);
assert.equal(panel.start_local_bat, true);
assert.equal(panel.private_local_html, true);
assert.equal(panel.index_html, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.external_connection, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.github_pages_launch_allowed, false);
assert.equal(panel.public_url_launch, false);
assert.equal(panel.public_url_launch_allowed, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.public_release_ready, false);
assert.equal(panel.unsafe_flags, 0);
assert.equal(panel.unsafe_flags_count, 0);
assert.equal(panel.phase20_12_through_phase20_20_locks_preserved, true);

assert.deepEqual(panel.phase20_21_summary, {
  total_safety_checks: 15,
  private_repository: true,
  repository_private_premise: true,
  local_only_operation: true,
  local_launch_policy: engine.LOCAL_LAUNCH_POLICY,
  start_local_bat: true,
  private_local_html: true,
  index_html: true,
  github_pages_launch: false,
  github_pages_launch_allowed: false,
  github_pages_public_url_launch_allowed: false,
  public_url_launch: false,
  public_url_launch_allowed: false,
  public_release_allowed: false,
  local_launch_only: true,
  protected_mode: true,
  plan_only: true,
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
  manual_confirmation_required_before_public_release: true,
  manual_owner_confirmation_required: true,
  owner_approval_lock_active: true,
  final_public_release_block: true,
  all_device_confirmations_approved: false,
  public_release_ready: false,
  unsafe_flags: 0,
  unsafe_flags_count: 0,
  phase20_12_through_phase20_20_locks_preserved: true,
  next_step: engine.NEXT_RECOMMENDED_STEP,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

const expectedChecks = {
  private_repository: true,
  local_only_operation: true,
  start_local_bat: true,
  private_local_html: true,
  index_html: true,
  github_pages_launch: false,
  public_url_launch: false,
  public_release_allowed: false,
  auto_execution: false,
  external_connection: false,
  protected_mode: true,
  plan_only: true,
  unsafe_flags: 0,
  phase20_12_through_phase20_20_locks_preserved: true,
  next_step: engine.NEXT_RECOMMENDED_STEP
};
for (const [check, value] of Object.entries(expectedChecks)) {
  assert.ok(panel.records.some((record) => record.check_name === check && record.check_value === value), `${check} must be ${value}`);
}

for (const record of panel.records) {
  assert.equal(record.review_status, "post_completion_safe_operation_locked");
  assert.equal(record.private_repository, true);
  assert.equal(record.local_only_operation, true);
  assert.equal(record.local_launch_policy, engine.LOCAL_LAUNCH_POLICY);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_execution, false);
  assert.equal(record.auto_launch, false);
  assert.equal(record.github_pages_launch, false);
  assert.equal(record.github_pages_launch_allowed, false);
  assert.equal(record.public_url_launch, false);
  assert.equal(record.public_url_launch_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.unsafe_flags, 0);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

assert.equal(db.phase, "Phase20-21");
assert.equal(db.panelStatus, "post_completion_safe_operation_lock_plan_only");
assert.equal(db.privateRepository, true);
assert.equal(db.localOnlyOperation, true);
assert.equal(db.startLocalBat, true);
assert.equal(db.privateLocalHtml, true);
assert.equal(db.indexHtml, true);
assert.equal(db.externalConnection, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoLaunch, false);
assert.equal(db.githubPagesLaunch, false);
assert.equal(db.githubPagesLaunchAllowed, false);
assert.equal(db.publicUrlLaunch, false);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.protectedMode, true);
assert.equal(db.planOnly, true);
assert.equal(db.unsafeFlags, 0);
assert.equal(db.phase20_12_through_phase20_20_locks_preserved, true);
assert.equal(db.reviewScope.length, 14);
assert.equal(db.safetyChecks.length, 15);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-21");
assert.equal(summaryDb.phase20_21_summary.totalSafetyChecks, 15);
assert.equal(summaryDb.phase20_21_summary.privateRepository, true);
assert.equal(summaryDb.phase20_21_summary.localOnlyOperation, true);
assert.equal(summaryDb.phase20_21_summary.githubPagesLaunch, false);
assert.equal(summaryDb.phase20_21_summary.publicUrlLaunch, false);
assert.equal(summaryDb.phase20_21_summary.autoExecution, false);
assert.equal(summaryDb.phase20_21_summary.externalConnection, false);
assert.equal(summaryDb.phase20_21_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_21_summary.unsafeFlags, 0);
assert.equal(summaryDb.phase20_21_summary.phase20_12_through_phase20_20_locks_preserved, true);
assert.equal(summaryDb.phase20_21_summary.nextStep, engine.NEXT_RECOMMENDED_STEP);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);

for (const summary of [phase2012Summary.phase20_12_summary, phase2013Summary.phase20_13_summary, phase2014Summary.phase20_14_summary, phase2015Summary.phase20_15_summary, phase2016Summary.phase20_16_summary, phase2017Summary.phase20_17_summary, phase2018Summary.phase20_18_summary, phase2019Summary.phase20_19_summary, phase2020Summary.phase20_20_summary]) {
  assert.equal(summary.externalConnection, false);
  assert.equal(summary.autoPublish, false);
  assert.equal(summary.publicReleaseAllowed, false);
}
assert.equal(phase2018Summary.phase20_18_summary.localLaunchOnly, true);
assert.equal(phase2019Summary.phase20_19_summary.publicUrlLaunchAllowed, false);
assert.equal(phase2019Summary.phase20_19_summary.autoExecution, false);
assert.equal(phase2020Summary.phase20_20_summary.githubPagesLaunchAllowed, false);
assert.equal(phase2020Summary.phase20_20_summary.publicUrlLaunchAllowed, false);
assert.equal(phase2020Summary.phase20_20_summary.autoExecution, false);
assert.equal(phase2020Summary.phase20_20_summary.phase20_12_to_19_locks_preserved, true);

assert.ok(index.includes('id="phase20-21-post-completion-safe-operation-lock-panel-builder"'));
assert.ok(index.includes('<script src="phase20-21-post-completion-safe-operation-lock-panel-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-21-post-completion-safe-operation-lock-panel-builder"'));
assert.ok(privateLocal.includes("Phase20-21 Post Completion Safe Operation Lock Panel"));
assert.ok(readme.includes("Phase20-21 Post Completion Safe Operation Lock Panel"));
assert.ok(readme.includes("phase20-21-post-completion-safe-operation-lock-panel-builder.js"));

const builderSource = readText("phase20-21-post-completion-safe-operation-lock-panel-builder.js");
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
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-21 builder`);
}

console.log("phase20-21 post completion safe operation lock panel builder tests passed");
