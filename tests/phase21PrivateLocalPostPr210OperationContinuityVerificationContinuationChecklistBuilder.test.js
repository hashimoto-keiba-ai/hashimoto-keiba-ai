const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist-db.json");
const summaryDb = readJson("phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist-summary-db.json");
const phase2114Summary = readJson("phase21-14-private-local-post-pr207-operation-stability-continuation-checklist-summary-db.json");
const phase2115Summary = readJson("phase21-15-private-local-post-pr208-operation-continuity-stabilization-checklist-summary-db.json");
const phase2116Summary = readJson("phase21-16-private-local-post-pr209-operation-continuity-verification-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-17");
assert.equal(engine.CHECKLIST_NAME, "Private Local Post PR210 Operation Continuity Verification Continuation Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_17_private_local_post_pr210_operation_continuity_verification_continuation_checklist_plan_only");
assert.equal(engine.POST_PR210_OPERATION_CONTINUITY_VERIFICATION_CONTINUATION_STATUS, "POST_PR210_PRIVATE_LOCAL_OPERATION_CONTINUITY_VERIFICATION_CONTINUATION_READY");
assert.equal(engine.PHASE21_15_MERGED_PR, "PR #209 Merged");
assert.equal(engine.PHASE21_16_MERGED_PR, "PR #210 Merged");
assert.equal(engine.CHECKS.length, 33);

const panel = engine.buildPrivateLocalPostPr210OperationContinuityVerificationContinuationChecklist({}, () => new Date("2026-07-03T00:00:00.000Z"));
assert.equal(panel.phase, "Phase21-17");
assert.equal(panel.records.length, 33);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_first_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.post_pr210_operation_continuity_verification_continuation_checklist_only, true);
assert.equal(panel.phase21_16_post_pr209_operation_continuity_verification_checklist_preserved, true);
assert.equal(panel.pr210_merged_to_main, true);
assert.equal(panel.main_latest_after_pr210_merge, true);
assert.equal(panel.local_main_origin_main_origin_head_match, true);
assert.equal(panel.working_tree_clean_confirmed, true);
assert.equal(panel.validation_results_save_before_draft_pr_required, true);
assert.equal(panel.private_local_continuity_prioritized, true);
assert.equal(panel.public_delivery_change_allowed, false);
assert.equal(panel.phase21_17_push_explicitly_requested, false);
assert.equal(panel.phase21_17_push_allowed_without_instruction, false);
assert.equal(panel.phase21_17_pr_creation_allowed_without_instruction, false);
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

const summary = panel.phase21_17_summary;
assert.equal(summary.total_checks, 33);
assert.equal(summary.confirmed_checks, 22);
assert.equal(summary.manual_review_required_checks, 6);
assert.equal(summary.blocked_checks, 5);
assert.equal(summary.phase21_13_post_pr206_operation_continuation_checklist_preserved, true);
assert.equal(summary.phase21_14_post_pr207_operation_stability_continuation_checklist_preserved, true);
assert.equal(summary.phase21_15_post_pr208_operation_continuity_stabilization_checklist_preserved, true);
assert.equal(summary.phase21_16_post_pr209_operation_continuity_verification_checklist_preserved, true);
assert.equal(summary.phase21_16_pr210_merged, true);
assert.equal(summary.pr210_main_merge_confirmed, true);
assert.equal(summary.local_main_origin_main_origin_head_match, true);
assert.equal(summary.working_tree_clean_confirmed, true);
assert.equal(summary.validation_results_save_before_draft_pr_required, true);
assert.equal(summary.ready_for_review_human_confirmation_required, true);
assert.equal(summary.merge_human_confirmation_required, true);
assert.equal(summary.private_local_continuity_prioritized, true);
assert.equal(summary.public_delivery_change_allowed, false);
assert.equal(summary.phase21_17_push_explicitly_requested, false);
assert.equal(summary.phase21_17_push_allowed_without_instruction, false);
assert.equal(summary.phase21_17_pr_creation_allowed_without_instruction, false);
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

assert.equal(db.phase, "Phase21-17");
assert.equal(db.postPr210OperationContinuityVerificationContinuationStatus, "POST_PR210_PRIVATE_LOCAL_OPERATION_CONTINUITY_VERIFICATION_CONTINUATION_READY");
assert.equal(db.phase21_16_mergedPr, "PR #210 Merged");
assert.equal(db.pr210MergedToMain, true);
assert.equal(db.mainLatestAfterPr210Merge, true);
assert.equal(db.localMainOriginMainOriginHeadMatch, true);
assert.equal(db.workingTreeCleanConfirmed, true);
assert.equal(db.phase21_16_postPr209OperationContinuityVerificationChecklistPreserved, true);
assert.equal(db.privateLocalContinuityPrioritized, true);
assert.equal(db.publicDeliveryChangeAllowed, false);
assert.equal(db.validationResultsSaveBeforeDraftPrRequired, true);
assert.equal(db.phase21_17_pushExplicitlyRequested, false);
assert.equal(db.phase21_17_prCreationAllowedWithoutInstruction, false);
assert.equal(db.checkCount, 33);
assert.equal(db.confirmedCheckCount, 22);
assert.equal(db.manualReviewRequiredCheckCount, 6);
assert.equal(db.blockedCheckCount, 5);

assert.equal(summaryDb.phase21_17_summary.totalChecks, 33);
assert.equal(summaryDb.phase21_17_summary.phase21_16_mergedPr, "PR #210 Merged");
assert.equal(summaryDb.phase21_17_summary.phase21_16_postPr209OperationContinuityVerificationChecklistPreserved, true);
assert.equal(summaryDb.phase21_17_summary.pr210MergedToMain, true);
assert.equal(summaryDb.phase21_17_summary.localMainOriginMainOriginHeadMatch, true);
assert.equal(summaryDb.phase21_17_summary.workingTreeCleanConfirmed, true);
assert.equal(summaryDb.phase21_17_summary.privateLocalContinuityPrioritized, true);
assert.equal(summaryDb.phase21_17_summary.publicDeliveryChangeAllowed, false);
assert.equal(summaryDb.phase21_17_summary.validationResultsSaveBeforeDraftPrRequired, true);
assert.equal(summaryDb.phase21_17_summary.phase21_17_pushExplicitlyRequested, false);
assert.equal(summaryDb.phase21_17_summary.phase21_17_prCreationAllowedWithoutInstruction, false);
assert.equal(summaryDb.phase21_17_summary.autoReadyForReviewAllowed, false);
assert.equal(summaryDb.phase21_17_summary.readyForReviewAllowed, false);
assert.equal(summaryDb.phase21_17_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_17_summary.publicUrlGuidanceAllowed, false);
assert.equal(summaryDb.phase21_17_summary.autoExecution, false);
assert.equal(summaryDb.phase21_17_summary.mergeAllowed, false);

assert.equal(phase2114Summary.phase21_14_summary.phase21_13_mergedPr, "PR #207 Merged");
assert.equal(phase2114Summary.phase21_14_summary.autoReadyForReviewAllowed, false);
assert.equal(phase2115Summary.phase21_15_summary.phase21_14_mergedPr, "PR #208 Merged");
assert.equal(phase2115Summary.phase21_15_summary.autoReadyForReviewAllowed, false);
assert.equal(phase2116Summary.phase21_16_summary.phase21_15_mergedPr, "PR #209 Merged");
assert.equal(phase2116Summary.phase21_16_summary.autoReadyForReviewAllowed, false);

assert.ok(index.includes('id="phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist-builder"'));
assert.ok(readme.includes("Phase21-17 Private Local Post PR210 Operation Continuity Verification Continuation Checklist"));
assert.ok(css.includes(".phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist"));

const builderSource = readText("phase21-17-private-local-post-pr210-operation-continuity-verification-continuation-checklist-builder.js");
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
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-17 builder`);
}

console.log("phase21-17 private local post PR210 operation continuity verification continuation checklist builder tests passed");