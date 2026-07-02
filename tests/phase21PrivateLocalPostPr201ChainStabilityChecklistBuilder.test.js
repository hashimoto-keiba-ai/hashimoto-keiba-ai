const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-8-private-local-post-pr201-chain-stability-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-8-private-local-post-pr201-chain-stability-checklist-db.json");
const summaryDb = readJson("phase21-8-private-local-post-pr201-chain-stability-checklist-summary-db.json");
const phase20ClosureSummary = readJson("phase20-completion-final-closure-summary-db.json");
const phase216Summary = readJson("phase21-6-private-local-draft-pr-chain-readiness-checklist-summary-db.json");
const phase217Summary = readJson("phase21-7-private-local-post-draft-pr-creation-stability-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-8");
assert.equal(engine.CHECKLIST_NAME, "Private Local Post PR201 Chain Stability Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_8_private_local_post_pr201_chain_stability_checklist_plan_only");
assert.equal(engine.POST_PR201_CHAIN_STATUS, "POST_PR201_CHAIN_STABILITY_READY");
assert.equal(engine.PHASE20_COMPLETION_PREREQUISITE, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(engine.PHASE21_6_PREREQUISITE, "DRAFT_PR_CHAIN_REVIEW_READY");
assert.equal(engine.PHASE21_7_PREREQUISITE, "POST_DRAFT_PR_CREATION_STABILITY_READY");
assert.equal(engine.PHASE21_4_DRAFT_PR, "PR #198 Draft");
assert.equal(engine.PHASE21_5_DRAFT_PR, "PR #199 Draft");
assert.equal(engine.PHASE21_6_DRAFT_PR, "PR #200 Draft");
assert.equal(engine.PHASE21_7_DRAFT_PR, "PR #201 Draft");
assert.equal(engine.CHECKS.length, 29);

const panel = engine.buildPrivateLocalPostPr201ChainStabilityChecklist({}, () => new Date("2026-07-02T00:00:00.000Z"));
assert.equal(panel.phase, "Phase21-8");
assert.equal(panel.records.length, 29);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_first_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.checklist_audit_display_only, true);
assert.equal(panel.post_pr201_chain_stability_only, true);
assert.equal(panel.phase20_completion_final_closure_preserved, true);
assert.equal(panel.phase21_6_draft_pr_chain_readiness_checklist_preserved, true);
assert.equal(panel.phase21_7_post_draft_pr_creation_stability_checklist_preserved, true);
assert.equal(panel.phase21_4_merge_allowed, false);
assert.equal(panel.phase21_5_merge_allowed, false);
assert.equal(panel.phase21_6_merge_allowed, false);
assert.equal(panel.phase21_7_merge_allowed, false);
assert.equal(panel.phase21_8_push_allowed_without_instruction, false);
assert.equal(panel.phase21_8_pr_creation_allowed_without_instruction, false);
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

const summary = panel.phase21_8_summary;
assert.equal(summary.total_checks, 29);
assert.equal(summary.confirmed_checks, 17);
assert.equal(summary.manual_review_required_checks, 7);
assert.equal(summary.blocked_checks, 5);
assert.equal(summary.phase21_4_draft_pr_review_required, true);
assert.equal(summary.phase21_5_draft_pr_review_required, true);
assert.equal(summary.phase21_6_draft_pr_review_required, true);
assert.equal(summary.phase21_7_draft_pr_review_required, true);
assert.equal(summary.phase21_7_pr201_created, true);
assert.equal(summary.phase21_8_push_allowed_without_instruction, false);
assert.equal(summary.phase21_8_pr_creation_allowed_without_instruction, false);
assert.equal(summary.company_pc_main_clean_confirmed, true);
assert.equal(summary.draft_pr_chain_order_confirmed, true);
assert.equal(summary.pr201_base_compare_chain_required, true);
assert.equal(summary.draft_pr_chain_audit_required, true);
assert.equal(summary.home_pc_post_pr201_confirmation_required, true);
assert.equal(summary.company_pc_post_pr201_confirmation_required, true);
assert.equal(summary.ipad_post_pr201_confirmation_required, true);
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

assert.equal(db.phase, "Phase21-8");
assert.equal(db.postPr201ChainStatus, "POST_PR201_CHAIN_STABILITY_READY");
assert.equal(db.phase21_7_draftPr, "PR #201 Draft");
assert.equal(db.phase21_7_pr201Created, true);
assert.equal(db.phase21_8_pushAllowedWithoutInstruction, false);
assert.equal(db.phase21_8_prCreationAllowedWithoutInstruction, false);
assert.equal(db.companyPcMainCleanConfirmed, true);
assert.equal(db.draftPrChainOrderConfirmed, true);
assert.equal(db.pr201BaseCompareChainRequired, true);
assert.equal(db.draftPrChainAuditRequired, true);
assert.equal(db.homePcPostPr201ConfirmationRequired, true);
assert.equal(db.companyPcPostPr201ConfirmationRequired, true);
assert.equal(db.ipadPostPr201ConfirmationRequired, true);
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

assert.equal(summaryDb.phase21_8_summary.totalChecks, 29);
assert.equal(summaryDb.phase21_8_summary.confirmedChecks, 17);
assert.equal(summaryDb.phase21_8_summary.manualReviewRequiredChecks, 7);
assert.equal(summaryDb.phase21_8_summary.blockedChecks, 5);
assert.equal(summaryDb.phase21_8_summary.phase21_7_postDraftPrCreationStabilityChecklistPreserved, true);
assert.equal(summaryDb.phase21_8_summary.phase21_7_pr201Created, true);
assert.equal(summaryDb.phase21_8_summary.phase21_8_pushAllowedWithoutInstruction, false);
assert.equal(summaryDb.phase21_8_summary.phase21_8_prCreationAllowedWithoutInstruction, false);
assert.equal(summaryDb.phase21_8_summary.companyPcMainCleanConfirmed, true);
assert.equal(summaryDb.phase21_8_summary.draftPrChainAuditRequired, true);
assert.equal(summaryDb.phase21_8_summary.autoReadyForReviewAllowed, false);
assert.equal(summaryDb.phase21_8_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_8_summary.externalApiConnection, false);
assert.equal(summaryDb.phase21_8_summary.autoExecution, false);

assert.equal(phase20ClosureSummary.phase20_completion_summary.phase20CompletionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(phase216Summary.phase21_6_summary.phase21_5_postPrReviewStabilityChecklistPreserved, true);
assert.equal(phase216Summary.phase21_6_summary.autoReadyForReviewAllowed, false);
assert.equal(phase217Summary.phase21_7_summary.phase21_6_draftPrChainReadinessChecklistPreserved, true);
assert.equal(phase217Summary.phase21_7_summary.phase21_6_pr200Created, true);
assert.equal(phase217Summary.phase21_7_summary.autoReadyForReviewAllowed, false);

assert.ok(index.includes('id="phase21-8-private-local-post-pr201-chain-stability-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-8-private-local-post-pr201-chain-stability-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-8-private-local-post-pr201-chain-stability-checklist-builder"'));
assert.ok(readme.includes("Phase21-8 Private Local Post PR201 Chain Stability Checklist"));
assert.ok(css.includes(".phase21-8-private-local-post-pr201-chain-stability-checklist"));

const builderSource = readText("phase21-8-private-local-post-pr201-chain-stability-checklist-builder.js");
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
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-8 builder`);
}

console.log("phase21-8 private local post PR201 chain stability checklist builder tests passed");
