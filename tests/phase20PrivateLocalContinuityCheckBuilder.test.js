const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-23-private-local-continuity-check-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-23-private-local-continuity-check-db.json");
const summaryDb = readJson("phase20-23-private-local-continuity-check-summary-db.json");
const phase2022Summary = readJson("phase20-22-safe-next-operation-review-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.equal(engine.PHASE, "Phase20-23");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "private_local_continuity_check_plan_only");
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Continue private local only operation on a working branch with PR review required");
assert.ok(engine.BLOCKED_ACTIONS.includes("direct_push_to_main"));
assert.ok(engine.BLOCKED_ACTIONS.includes("pull_request_bypass"));

const panel = engine.buildPrivateLocalContinuityCheck({}, () => new Date("2026-06-30T06:00:00.000Z"));
assert.equal(panel.phase, "Phase20-23");
assert.equal(panel.records.length, 16);
assert.equal(panel.private_repository, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.public_url_launch, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.external_connection, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.working_branch_recommended, true);
assert.equal(panel.pr_review_required, true);
assert.equal(panel.unsafe_flags, 0);
assert.equal(panel.phase20_12_through_phase20_22_locks_preserved, true);

assert.equal(panel.phase20_23_summary.total_safety_checks, 16);
assert.equal(panel.phase20_23_summary.private_repository, true);
assert.equal(panel.phase20_23_summary.local_only_operation, true);
assert.equal(panel.phase20_23_summary.protected_mode, true);
assert.equal(panel.phase20_23_summary.plan_only, true);
assert.equal(panel.phase20_23_summary.github_pages_launch, false);
assert.equal(panel.phase20_23_summary.public_url_launch, false);
assert.equal(panel.phase20_23_summary.public_release_allowed, false);
assert.equal(panel.phase20_23_summary.external_connection, false);
assert.equal(panel.phase20_23_summary.auto_execution, false);
assert.equal(panel.phase20_23_summary.auto_publish, false);
assert.equal(panel.phase20_23_summary.auto_launch, false);
assert.equal(panel.phase20_23_summary.direct_push_to_main_allowed, false);
assert.equal(panel.phase20_23_summary.working_branch_recommended, true);
assert.equal(panel.phase20_23_summary.pr_review_required, true);
assert.equal(panel.phase20_23_summary.unsafe_flags, 0);
assert.equal(panel.phase20_23_summary.phase20_12_through_phase20_22_locks_preserved, true);

const expectedChecks = {
  private_repository: true,
  local_only_operation: true,
  protected_mode: true,
  plan_only: true,
  github_pages_launch: false,
  public_url_launch: false,
  public_release_allowed: false,
  external_connection: false,
  auto_execution: false,
  auto_publish: false,
  auto_launch: false,
  direct_push_to_main_allowed: false,
  working_branch_recommended: true,
  pr_review_required: true,
  unsafe_flags: 0,
  phase20_12_through_phase20_22_locks_preserved: true
};
for (const [check, value] of Object.entries(expectedChecks)) {
  assert.ok(panel.records.some((record) => record.check_name === check && record.check_value === value), `${check} must be ${value}`);
}

for (const record of panel.records) {
  assert.equal(record.review_status, "private_local_continuity_confirmed");
  assert.equal(record.private_repository, true);
  assert.equal(record.local_only_operation, true);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.github_pages_launch_allowed, false);
  assert.equal(record.public_url_launch_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_execution, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_launch, false);
  assert.equal(record.direct_push_to_main_allowed, false);
  assert.equal(record.working_branch_recommended, true);
  assert.equal(record.pr_review_required, true);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

assert.equal(db.phase, "Phase20-23");
assert.equal(db.privateRepository, true);
assert.equal(db.localOnlyOperation, true);
assert.equal(db.protectedMode, true);
assert.equal(db.planOnly, true);
assert.equal(db.githubPagesLaunch, false);
assert.equal(db.publicUrlLaunch, false);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.externalConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoLaunch, false);
assert.equal(db.directPushToMainAllowed, false);
assert.equal(db.workingBranchRecommended, true);
assert.equal(db.prReviewRequired, true);
assert.equal(db.unsafeFlags, 0);
assert.equal(db.phase20_12_through_phase20_22_locks_preserved, true);
assert.equal(db.safetyChecks.length, 16);

assert.equal(summaryDb.phase, "Phase20-23");
assert.equal(summaryDb.phase20_23_summary.totalSafetyChecks, 16);
assert.equal(summaryDb.phase20_23_summary.privateRepository, true);
assert.equal(summaryDb.phase20_23_summary.localOnlyOperation, true);
assert.equal(summaryDb.phase20_23_summary.protectedMode, true);
assert.equal(summaryDb.phase20_23_summary.planOnly, true);
assert.equal(summaryDb.phase20_23_summary.githubPagesLaunch, false);
assert.equal(summaryDb.phase20_23_summary.publicUrlLaunch, false);
assert.equal(summaryDb.phase20_23_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_23_summary.externalConnection, false);
assert.equal(summaryDb.phase20_23_summary.autoExecution, false);
assert.equal(summaryDb.phase20_23_summary.autoPublish, false);
assert.equal(summaryDb.phase20_23_summary.autoLaunch, false);
assert.equal(summaryDb.phase20_23_summary.directPushToMainAllowed, false);
assert.equal(summaryDb.phase20_23_summary.workingBranchRecommended, true);
assert.equal(summaryDb.phase20_23_summary.prReviewRequired, true);
assert.equal(summaryDb.phase20_23_summary.unsafeFlags, 0);
assert.equal(summaryDb.phase20_23_summary.phase20_12_through_phase20_22_locks_preserved, true);

assert.equal(phase2022Summary.phase20_22_summary.githubPagesLaunch, false);
assert.equal(phase2022Summary.phase20_22_summary.publicUrlLaunch, false);
assert.equal(phase2022Summary.phase20_22_summary.publicReleaseAllowed, false);
assert.equal(phase2022Summary.phase20_22_summary.externalConnection, false);
assert.equal(phase2022Summary.phase20_22_summary.autoExecution, false);
assert.equal(phase2022Summary.phase20_22_summary.directPushToMainAllowed, false);
assert.equal(phase2022Summary.phase20_22_summary.workingBranchOperationRecommended, true);
assert.equal(phase2022Summary.phase20_22_summary.pullRequestOperationRecommended, true);

assert.ok(index.includes('id="phase20-23-private-local-continuity-check-builder"'));
assert.ok(index.includes('<script src="phase20-23-private-local-continuity-check-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-23-private-local-continuity-check-builder"'));
assert.ok(privateLocal.includes("Phase20-23 Private Local Continuity Check"));
assert.ok(readme.includes("Phase20-23 Private Local Continuity Check"));
assert.ok(readme.includes("phase20-23-private-local-continuity-check-builder.js"));

const builderSource = readText("phase20-23-private-local-continuity-check-builder.js");
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
  "auto_publish: true",
  "auto_publish_allowed: true",
  "auto_launch: true",
  "auto_launch_allowed: true",
  "github_pages_launch_allowed: true",
  "github_pages_public_url_launch_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "public_release_ready: true",
  "direct_push_to_main_allowed: true",
  "merge_allowed_without_pr_review: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-23 builder`);
}

console.log("phase20-23 private local continuity check builder tests passed");
