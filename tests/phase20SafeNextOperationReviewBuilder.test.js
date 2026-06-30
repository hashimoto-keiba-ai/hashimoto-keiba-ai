const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-22-safe-next-operation-review-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-22-safe-next-operation-review-db.json");
const summaryDb = readJson("phase20-22-safe-next-operation-review-summary-db.json");
const phase2020Summary = readJson("phase20-20-final-safety-continuity-review-panel-summary-db.json");
const phase2021Summary = readJson("phase20-21-post-completion-safe-operation-lock-panel-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.equal(engine.PHASE, "Phase20-22");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "safe_next_operation_review_plan_only");
assert.equal(engine.LOCAL_LAUNCH_POLICY, "start-local.bat / private-local.html / index.html only");
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Resume safe work on a working branch and use PR review before merge");
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view", "branch_plan", "pr_plan"]);
assert.ok(engine.BLOCKED_ACTIONS.includes("direct_push_to_main"));
assert.ok(engine.BLOCKED_ACTIONS.includes("auto_merge"));
assert.equal(engine.REVIEW_SCOPE.length, 10);

const panel = engine.buildSafeNextOperationReview({}, () => new Date("2026-06-30T05:00:00.000Z"));
assert.equal(panel.phase, "Phase20-22");
assert.equal(panel.panel_status, "safe_next_operation_review_plan_only");
assert.equal(panel.records.length, 15);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.main_direct_push_prevention_check, true);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.working_branch_operation_recommended, true);
assert.equal(panel.pull_request_operation_recommended, true);
assert.equal(panel.merge_allowed_without_pr_review, false);
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
assert.equal(panel.phase20_12_through_phase20_21_locks_preserved, true);

assert.deepEqual(panel.phase20_22_summary, {
  total_safety_checks: 15,
  private_repository: true,
  repository_private_premise: true,
  local_only_operation: true,
  local_launch_policy: engine.LOCAL_LAUNCH_POLICY,
  protected_mode: true,
  plan_only: true,
  main_direct_push_prevention_check: true,
  direct_push_to_main_allowed: false,
  working_branch_operation_recommended: true,
  pull_request_operation_recommended: true,
  merge_allowed_without_pr_review: false,
  github_pages_launch: false,
  github_pages_launch_allowed: false,
  github_pages_public_url_launch_allowed: false,
  public_url_launch: false,
  public_url_launch_allowed: false,
  public_release_allowed: false,
  local_launch_only: true,
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
  public_release_ready: false,
  unsafe_flags: 0,
  unsafe_flags_count: 0,
  phase20_12_through_phase20_21_locks_preserved: true,
  next_step: engine.NEXT_RECOMMENDED_STEP,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

const expectedChecks = {
  private_repository: true,
  local_only_operation: true,
  protected_mode: true,
  plan_only: true,
  main_direct_push_prevention_check: true,
  direct_push_to_main_allowed: false,
  working_branch_operation_recommended: true,
  pull_request_operation_recommended: true,
  github_pages_launch: false,
  public_url_launch: false,
  public_release_allowed: false,
  external_connection: false,
  auto_execution: false,
  phase20_12_through_phase20_21_locks_preserved: true,
  next_step: engine.NEXT_RECOMMENDED_STEP
};
for (const [check, value] of Object.entries(expectedChecks)) {
  assert.ok(panel.records.some((record) => record.check_name === check && record.check_value === value), `${check} must be ${value}`);
}

for (const record of panel.records) {
  assert.equal(record.review_status, "safe_next_operation_review_confirmed");
  assert.equal(record.private_repository, true);
  assert.equal(record.local_only_operation, true);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.direct_push_to_main_allowed, false);
  assert.equal(record.working_branch_operation_recommended, true);
  assert.equal(record.pull_request_operation_recommended, true);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_execution, false);
  assert.equal(record.github_pages_launch_allowed, false);
  assert.equal(record.public_url_launch_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

assert.equal(db.phase, "Phase20-22");
assert.equal(db.panelStatus, "safe_next_operation_review_plan_only");
assert.equal(db.privateRepository, true);
assert.equal(db.localOnlyOperation, true);
assert.equal(db.protectedMode, true);
assert.equal(db.planOnly, true);
assert.equal(db.mainDirectPushPreventionCheck, true);
assert.equal(db.directPushToMainAllowed, false);
assert.equal(db.workingBranchOperationRecommended, true);
assert.equal(db.pullRequestOperationRecommended, true);
assert.equal(db.mergeAllowedWithoutPrReview, false);
assert.equal(db.githubPagesLaunch, false);
assert.equal(db.publicUrlLaunch, false);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.externalConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.unsafeFlags, 0);
assert.equal(db.phase20_12_through_phase20_21_locks_preserved, true);
assert.equal(db.safetyChecks.length, 15);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-22");
assert.equal(summaryDb.phase20_22_summary.totalSafetyChecks, 15);
assert.equal(summaryDb.phase20_22_summary.privateRepository, true);
assert.equal(summaryDb.phase20_22_summary.localOnlyOperation, true);
assert.equal(summaryDb.phase20_22_summary.protectedMode, true);
assert.equal(summaryDb.phase20_22_summary.planOnly, true);
assert.equal(summaryDb.phase20_22_summary.mainDirectPushPreventionCheck, true);
assert.equal(summaryDb.phase20_22_summary.directPushToMainAllowed, false);
assert.equal(summaryDb.phase20_22_summary.workingBranchOperationRecommended, true);
assert.equal(summaryDb.phase20_22_summary.pullRequestOperationRecommended, true);
assert.equal(summaryDb.phase20_22_summary.githubPagesLaunch, false);
assert.equal(summaryDb.phase20_22_summary.publicUrlLaunch, false);
assert.equal(summaryDb.phase20_22_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_22_summary.externalConnection, false);
assert.equal(summaryDb.phase20_22_summary.autoExecution, false);
assert.equal(summaryDb.phase20_22_summary.phase20_12_through_phase20_21_locks_preserved, true);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(phase2020Summary.phase20_20_summary.githubPagesLaunchAllowed, false);
assert.equal(phase2020Summary.phase20_20_summary.publicUrlLaunchAllowed, false);
assert.equal(phase2020Summary.phase20_20_summary.autoExecution, false);
assert.equal(phase2021Summary.phase20_21_summary.githubPagesLaunch, false);
assert.equal(phase2021Summary.phase20_21_summary.publicUrlLaunch, false);
assert.equal(phase2021Summary.phase20_21_summary.autoExecution, false);
assert.equal(phase2021Summary.phase20_21_summary.externalConnection, false);
assert.equal(phase2021Summary.phase20_21_summary.publicReleaseAllowed, false);

assert.ok(index.includes('id="phase20-22-safe-next-operation-review-builder"'));
assert.ok(index.includes('<script src="phase20-22-safe-next-operation-review-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-22-safe-next-operation-review-builder"'));
assert.ok(privateLocal.includes("Phase20-22 Safe Next Operation Review"));
assert.ok(readme.includes("Phase20-22 Safe Next Operation Review"));
assert.ok(readme.includes("phase20-22-safe-next-operation-review-builder.js"));

const builderSource = readText("phase20-22-safe-next-operation-review-builder.js");
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  "external_connection: true",
  "external_connection_allowed: true",
  "auto_execution: true",
  "auto_execution_allowed: true",
  "github_pages_launch_allowed: true",
  "github_pages_public_url_launch_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "public_release_ready: true",
  "direct_push_to_main_allowed: true",
  "merge_allowed_without_pr_review: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-22 builder`);
}

console.log("phase20-22 safe next operation review builder tests passed");
