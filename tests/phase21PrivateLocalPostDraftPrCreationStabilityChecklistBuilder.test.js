const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-7-private-local-post-draft-pr-creation-stability-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-7-private-local-post-draft-pr-creation-stability-checklist-db.json");
const summaryDb = readJson("phase21-7-private-local-post-draft-pr-creation-stability-checklist-summary-db.json");
const phase20ClosureSummary = readJson("phase20-completion-final-closure-summary-db.json");
const phase215Summary = readJson("phase21-5-private-local-post-pr-review-stability-checklist-summary-db.json");
const phase216Summary = readJson("phase21-6-private-local-draft-pr-chain-readiness-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-7");
assert.equal(engine.CHECKLIST_NAME, "Private Local Post Draft PR Creation Stability Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_7_private_local_post_draft_pr_creation_stability_checklist_plan_only");
assert.equal(engine.POST_DRAFT_PR_CREATION_STATUS, "POST_DRAFT_PR_CREATION_STABILITY_READY");
assert.equal(engine.PHASE20_COMPLETION_PREREQUISITE, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(engine.PHASE21_5_PREREQUISITE, "POST_PR_REVIEW_STABILITY_READY");
assert.equal(engine.PHASE21_6_PREREQUISITE, "DRAFT_PR_CHAIN_REVIEW_READY");
assert.equal(engine.PHASE21_4_DRAFT_PR, "PR #198 Draft");
assert.equal(engine.PHASE21_5_DRAFT_PR, "PR #199 Draft");
assert.equal(engine.PHASE21_6_DRAFT_PR, "PR #200 Draft");
assert.equal(engine.CHECKS.length, 27);

const panel = engine.buildPrivateLocalPostDraftPrCreationStabilityChecklist({}, () => new Date("2026-07-02T00:00:00.000Z"));
assert.equal(panel.phase, "Phase21-7");
assert.equal(panel.records.length, 27);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_first_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.checklist_audit_display_only, true);
assert.equal(panel.post_draft_pr_creation_stability_only, true);
assert.equal(panel.phase20_completion_final_closure_preserved, true);
assert.equal(panel.phase21_5_post_pr_review_stability_checklist_preserved, true);
assert.equal(panel.phase21_6_draft_pr_chain_readiness_checklist_preserved, true);
assert.equal(panel.phase21_4_merge_allowed, false);
assert.equal(panel.phase21_5_merge_allowed, false);
assert.equal(panel.phase21_6_merge_allowed, false);
assert.equal(panel.phase21_7_push_allowed_without_instruction, false);
assert.equal(panel.phase21_7_pr_creation_allowed_without_instruction, false);
assert.equal(panel.company_pc_main_clean_confirmed, true);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.github_pages_setting_change_allowed, false);
assert.equal(panel.public_url_guidance_allowed, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.external_connection, false);
assert.equal(panel.external_api_connection, false);
assert.equal(panel.external_api_submission_allowed, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.auto_ready_for_review_allowed, false);
assert.equal(panel.auto_push_allowed, false);
assert.equal(panel.auto_pr_creation_allowed, false);
assert.equal(panel.billing_integration_allowed, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.merge_allowed, false);
assert.equal(panel.draft_pr_required, true);
assert.equal(panel.unsafe_flags, 0);

const summary = panel.phase21_7_summary;
assert.equal(summary.total_checks, 27);
assert.equal(summary.confirmed_checks, 16);
assert.equal(summary.manual_review_required_checks, 6);
assert.equal(summary.blocked_checks, 5);
assert.equal(summary.phase21_4_draft_pr_review_required, true);
assert.equal(summary.phase21_5_draft_pr_review_required, true);
assert.equal(summary.phase21_6_draft_pr_review_required, true);
assert.equal(summary.phase21_6_pr200_created, true);
assert.equal(summary.phase21_4_merge_allowed, false);
assert.equal(summary.phase21_5_merge_allowed, false);
assert.equal(summary.phase21_6_merge_allowed, false);
assert.equal(summary.phase21_7_push_allowed_without_instruction, false);
assert.equal(summary.phase21_7_pr_creation_allowed_without_instruction, false);
assert.equal(summary.company_pc_main_clean_confirmed, true);
assert.equal(summary.draft_pr_chain_order_confirmed, true);
assert.equal(summary.base_compare_chain_required, true);
assert.equal(summary.home_pc_post_pr200_confirmation_required, true);
assert.equal(summary.company_pc_post_pr200_confirmation_required, true);
assert.equal(summary.ipad_post_pr200_confirmation_required, true);
assert.equal(summary.private_local_launch_check_required, true);
assert.equal(summary.index_display_check_required, true);
assert.equal(summary.dashboard_route_check_required, true);
assert.equal(summary.post_pull_update_check_required, true);
assert.equal(summary.recovery_hold_required, true);
assert.equal(summary.merge_before_check_required, true);
assert.equal(summary.conflict_marker_check_required, true);
assert.equal(summary.unsafe_flag_check_required, true);
assert.equal(summary.local_first_operation, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.protected_mode, true);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.public_url_guidance_allowed, false);
assert.equal(summary.external_api_connection, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.auto_ready_for_review_allowed, false);
assert.equal(summary.auto_push_allowed, false);
assert.equal(summary.auto_pr_creation_allowed, false);
assert.equal(summary.merge_allowed, false);

assert.equal(db.phase, "Phase21-7");
assert.equal(db.postDraftPrCreationStatus, "POST_DRAFT_PR_CREATION_STABILITY_READY");
assert.equal(db.phase21_4_draftPr, "PR #198 Draft");
assert.equal(db.phase21_5_draftPr, "PR #199 Draft");
assert.equal(db.phase21_6_draftPr, "PR #200 Draft");
assert.equal(db.phase21_6_pr200Created, true);
assert.equal(db.phase21_7_pushAllowedWithoutInstruction, false);
assert.equal(db.phase21_7_prCreationAllowedWithoutInstruction, false);
assert.equal(db.companyPcMainCleanConfirmed, true);
assert.equal(db.draftPrChainOrderConfirmed, true);
assert.equal(db.baseCompareChainRequired, true);
assert.equal(db.homePcPostPr200ConfirmationRequired, true);
assert.equal(db.companyPcPostPr200ConfirmationRequired, true);
assert.equal(db.ipadPostPr200ConfirmationRequired, true);
assert.equal(db.privateLocalLaunchCheckRequired, true);
assert.equal(db.indexDisplayCheckRequired, true);
assert.equal(db.dashboardRouteCheckRequired, true);
assert.equal(db.postPullUpdateCheckRequired, true);
assert.equal(db.recoveryHoldRequired, true);
assert.equal(db.mergeBeforeCheckRequired, true);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.publicUrlGuidanceAllowed, false);
assert.equal(db.externalApiConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoReadyForReviewAllowed, false);
assert.equal(db.autoPushAllowed, false);
assert.equal(db.autoPrCreationAllowed, false);
assert.equal(db.mergeAllowed, false);

assert.equal(summaryDb.phase21_7_summary.totalChecks, 27);
assert.equal(summaryDb.phase21_7_summary.confirmedChecks, 16);
assert.equal(summaryDb.phase21_7_summary.manualReviewRequiredChecks, 6);
assert.equal(summaryDb.phase21_7_summary.blockedChecks, 5);
assert.equal(summaryDb.phase21_7_summary.phase21_6_draftPrChainReadinessChecklistPreserved, true);
assert.equal(summaryDb.phase21_7_summary.phase21_6_pr200Created, true);
assert.equal(summaryDb.phase21_7_summary.phase21_7_pushAllowedWithoutInstruction, false);
assert.equal(summaryDb.phase21_7_summary.phase21_7_prCreationAllowedWithoutInstruction, false);
assert.equal(summaryDb.phase21_7_summary.companyPcMainCleanConfirmed, true);
assert.equal(summaryDb.phase21_7_summary.autoReadyForReviewAllowed, false);
assert.equal(summaryDb.phase21_7_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_7_summary.externalApiConnection, false);
assert.equal(summaryDb.phase21_7_summary.autoExecution, false);

assert.equal(phase20ClosureSummary.phase20_completion_summary.phase20CompletionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(phase215Summary.phase21_5_summary.phase21_4_displayRecoveryChecklistPreserved, true);
assert.equal(phase215Summary.phase21_5_summary.autoReadyForReviewAllowed, false);
assert.equal(phase216Summary.phase21_6_summary.phase21_5_postPrReviewStabilityChecklistPreserved, true);
assert.equal(phase216Summary.phase21_6_summary.phase21_5_draftPrReviewRequired, true);
assert.equal(phase216Summary.phase21_6_summary.autoReadyForReviewAllowed, false);

assert.ok(index.includes('id="phase21-7-private-local-post-draft-pr-creation-stability-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-7-private-local-post-draft-pr-creation-stability-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-7-private-local-post-draft-pr-creation-stability-checklist-builder"'));
assert.ok(readme.includes("Phase21-7 Private Local Post Draft PR Creation Stability Checklist"));
assert.ok(css.includes(".phase21-7-private-local-post-draft-pr-creation-stability-checklist"));

const builderSource = readText("phase21-7-private-local-post-draft-pr-creation-stability-checklist-builder.js");
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
  unsafeTrue("auto_publish_allowed"),
  unsafeTrue("auto_launch"),
  unsafeTrue("auto_launch_allowed"),
  unsafeTrue("auto_ready_for_review_allowed"),
  unsafeTrue("auto_push_allowed"),
  unsafeTrue("auto_pr_creation_allowed"),
  unsafeTrue("github_pages_launch_allowed"),
  unsafeTrue("github_pages_setting_change_allowed"),
  unsafeTrue("repository_visibility_change_allowed"),
  unsafeTrue("public_release_allowed"),
  unsafeTrue("direct_push_to_main_allowed"),
  unsafeTrue("merge_allowed")
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-7 builder`);
}

console.log("phase21-7 private local post draft PR creation stability checklist builder tests passed");
