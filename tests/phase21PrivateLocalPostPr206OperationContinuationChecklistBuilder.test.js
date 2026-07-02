const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-13-private-local-post-pr206-operation-continuation-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-13-private-local-post-pr206-operation-continuation-checklist-db.json");
const summaryDb = readJson("phase21-13-private-local-post-pr206-operation-continuation-checklist-summary-db.json");
const phase2110Summary = readJson("phase21-10-private-local-post-pr203-operation-checklist-summary-db.json");
const phase2111Summary = readJson("phase21-11-private-local-post-pr204-operation-stability-checklist-summary-db.json");
const phase2112Summary = readJson("phase21-12-private-local-post-pr205-operation-continuity-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-13");
assert.equal(engine.CHECKLIST_NAME, "Private Local Post PR206 Operation Continuation Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_13_private_local_post_pr206_operation_continuation_checklist_plan_only");
assert.equal(engine.POST_PR206_OPERATION_CONTINUATION_STATUS, "POST_PR206_PRIVATE_LOCAL_OPERATION_CONTINUATION_READY");
assert.equal(engine.PHASE21_11_MERGED_PR, "PR #205 Merged");
assert.equal(engine.PHASE21_12_MERGED_PR, "PR #206 Merged");
assert.equal(engine.CHECKS.length, 31);

const panel = engine.buildPrivateLocalPostPr206OperationContinuationChecklist({}, () => new Date("2026-07-03T00:00:00.000Z"));
assert.equal(panel.phase, "Phase21-13");
assert.equal(panel.records.length, 31);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_first_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.post_pr206_operation_continuation_checklist_only, true);
assert.equal(panel.phase21_12_post_pr205_operation_continuity_checklist_preserved, true);
assert.equal(panel.pr206_merged_to_main, true);
assert.equal(panel.main_latest_after_pr206_merge, true);
assert.equal(panel.local_main_origin_main_origin_head_match, true);
assert.equal(panel.working_tree_clean_confirmed, true);
assert.equal(panel.validation_results_save_before_draft_pr_required, true);
assert.equal(panel.phase21_13_push_explicitly_requested, false);
assert.equal(panel.phase21_13_push_allowed_without_instruction, false);
assert.equal(panel.phase21_13_pr_creation_allowed_without_instruction, false);
assert.equal(panel.github_pages_launch_allowed, false);
assert.equal(panel.public_url_guidance_allowed, false);
assert.equal(panel.external_api_connection, false);
assert.equal(panel.external_api_submission_allowed, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_ready_for_review_allowed, false);
assert.equal(panel.ready_for_review_allowed, false);
assert.equal(panel.auto_pr_creation_allowed, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.merge_allowed, false);
assert.equal(panel.unsafe_flags, 0);

const summary = panel.phase21_13_summary;
assert.equal(summary.total_checks, 31);
assert.equal(summary.confirmed_checks, 20);
assert.equal(summary.manual_review_required_checks, 6);
assert.equal(summary.blocked_checks, 5);
assert.equal(summary.phase21_10_post_pr203_operation_checklist_preserved, true);
assert.equal(summary.phase21_11_post_pr204_operation_stability_checklist_preserved, true);
assert.equal(summary.phase21_12_post_pr205_operation_continuity_checklist_preserved, true);
assert.equal(summary.phase21_12_pr206_merged, true);
assert.equal(summary.pr206_main_merge_confirmed, true);
assert.equal(summary.local_main_origin_main_origin_head_match, true);
assert.equal(summary.working_tree_clean_confirmed, true);
assert.equal(summary.validation_results_save_before_draft_pr_required, true);
assert.equal(summary.ready_for_review_human_confirmation_required, true);
assert.equal(summary.merge_human_confirmation_required, true);
assert.equal(summary.phase21_13_push_explicitly_requested, false);
assert.equal(summary.phase21_13_push_allowed_without_instruction, false);
assert.equal(summary.phase21_13_pr_creation_allowed_without_instruction, false);
assert.equal(summary.local_first_operation, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.protected_mode, true);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.public_url_guidance_allowed, false);
assert.equal(summary.external_api_connection, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.auto_ready_for_review_allowed, false);
assert.equal(summary.ready_for_review_allowed, false);
assert.equal(summary.auto_pr_creation_allowed, false);
assert.equal(summary.merge_allowed, false);

assert.equal(db.phase, "Phase21-13");
assert.equal(db.postPr206OperationContinuationStatus, "POST_PR206_PRIVATE_LOCAL_OPERATION_CONTINUATION_READY");
assert.equal(db.pr206MergedToMain, true);
assert.equal(db.mainLatestAfterPr206Merge, true);
assert.equal(db.localMainOriginMainOriginHeadMatch, true);
assert.equal(db.workingTreeCleanConfirmed, true);
assert.equal(db.validationResultsSaveBeforeDraftPrRequired, true);
assert.equal(db.phase21_13_pushExplicitlyRequested, false);
assert.equal(db.phase21_13_prCreationAllowedWithoutInstruction, false);
assert.equal(db.checkCount, 31);
assert.equal(db.confirmedCheckCount, 20);
assert.equal(db.manualReviewRequiredCheckCount, 6);
assert.equal(db.blockedCheckCount, 5);

assert.equal(summaryDb.phase21_13_summary.totalChecks, 31);
assert.equal(summaryDb.phase21_13_summary.phase21_12_postPr205OperationContinuityChecklistPreserved, true);
assert.equal(summaryDb.phase21_13_summary.pr206MergedToMain, true);
assert.equal(summaryDb.phase21_13_summary.localMainOriginMainOriginHeadMatch, true);
assert.equal(summaryDb.phase21_13_summary.workingTreeCleanConfirmed, true);
assert.equal(summaryDb.phase21_13_summary.validationResultsSaveBeforeDraftPrRequired, true);
assert.equal(summaryDb.phase21_13_summary.phase21_13_pushExplicitlyRequested, false);
assert.equal(summaryDb.phase21_13_summary.phase21_13_prCreationAllowedWithoutInstruction, false);
assert.equal(summaryDb.phase21_13_summary.autoReadyForReviewAllowed, false);
assert.equal(summaryDb.phase21_13_summary.readyForReviewAllowed, false);
assert.equal(summaryDb.phase21_13_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_13_summary.publicUrlGuidanceAllowed, false);
assert.equal(summaryDb.phase21_13_summary.autoExecution, false);
assert.equal(summaryDb.phase21_13_summary.mergeAllowed, false);

assert.equal(phase2110Summary.phase21_10_summary.autoReadyForReviewAllowed, false);
assert.equal(phase2111Summary.phase21_11_summary.autoReadyForReviewAllowed, false);
assert.equal(phase2112Summary.phase21_12_summary.phase21_11_pr205Created, true);
assert.equal(phase2112Summary.phase21_12_summary.autoReadyForReviewAllowed, false);

assert.ok(index.includes('id="phase21-13-private-local-post-pr206-operation-continuation-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-13-private-local-post-pr206-operation-continuation-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-13-private-local-post-pr206-operation-continuation-checklist-builder"'));
assert.ok(readme.includes("Phase21-13 Private Local Post PR206 Operation Continuation Checklist"));
assert.ok(css.includes(".phase21-13-private-local-post-pr206-operation-continuation-checklist"));

const builderSource = readText("phase21-13-private-local-post-pr206-operation-continuation-checklist-builder.js");
const unsafeTrue = (name) => `${name}: ${"true"}`;
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  unsafeTrue("external_connection"),
  unsafeTrue("external_api_connection"),
  unsafeTrue("external_api_connection_allowed"),
  unsafeTrue("external_api_submission_allowed"),
  unsafeTrue("auto_execution"),
  unsafeTrue("auto_execution_allowed"),
  unsafeTrue("auto_publish"),
  unsafeTrue("auto_launch"),
  unsafeTrue("auto_ready_for_review_allowed"),
  unsafeTrue("ready_for_review_allowed"),
  unsafeTrue("auto_push_allowed"),
  unsafeTrue("auto_pr_creation_allowed"),
  unsafeTrue("github_pages_launch_allowed"),
  unsafeTrue("github_pages_setting_change_allowed"),
  unsafeTrue("public_url_guidance_allowed"),
  unsafeTrue("direct_push_to_main_allowed"),
  unsafeTrue("merge_allowed")
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-13 builder`);
}

console.log("phase21-13 private local post PR206 operation continuation checklist builder tests passed");
