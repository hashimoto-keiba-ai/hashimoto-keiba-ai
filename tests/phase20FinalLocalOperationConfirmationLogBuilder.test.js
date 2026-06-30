const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-26-final-local-operation-confirmation-log-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-26-final-local-operation-confirmation-log-db.json");
const summaryDb = readJson("phase20-26-final-local-operation-confirmation-log-summary-db.json");
const phase2025Summary = readJson("phase20-25-final-private-release-freeze-check-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.equal(engine.PHASE, "Phase20-26");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "final_local_operation_confirmation_log_plan_only");
assert.equal(engine.OPERATION_STATUS, "CONFIRMED");
assert.deepEqual(engine.OPERATION_STATUSES, ["CONFIRMED", "HOLD", "BLOCKED"]);
assert.equal(engine.PHASE20_25_FREEZE_STATUS_REQUIRED, "PASS");
assert.equal(engine.CONFIRMATION_LOG_ITEMS.length, 10);

const panel = engine.buildFinalLocalOperationConfirmationLog({}, () => new Date("2026-06-30T09:00:00.000Z"));
assert.equal(panel.phase, "Phase20-26");
assert.equal(panel.records.length, 16);
assert.equal(panel.operation_status, "CONFIRMED");
assert.equal(panel.phase20_25_freeze_status_required, "PASS");
assert.equal(panel.phase20_25_freeze_status_observed, "PASS");
assert.equal(panel.phase20_25_freeze_pass_prerequisite, true);
assert.equal(panel.main_branch_pull_completed, true);
assert.equal(panel.working_tree_clean_confirmed, true);
assert.equal(panel.private_local_html_launch_confirmed, true);
assert.equal(panel.index_html_phase20_25_panel_display_confirmed, true);
assert.equal(panel.freeze_status_pass_display_confirmed, true);
assert.equal(panel.private_only_plan_only_display_confirmed, true);
assert.equal(panel.public_pages_external_auto_action_out_of_scope_confirmed, true);
assert.equal(panel.manual_owner_review_required_confirmed, true);
assert.equal(panel.rollback_revert_policy_maintained, true);
assert.equal(panel.safe_state_confirmed_before_next_phase, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.unsafe_guard, true);
assert.equal(panel.public_publish_out_of_scope, true);
assert.equal(panel.github_pages_publish_out_of_scope, true);
assert.equal(panel.external_sharing_out_of_scope, true);
assert.equal(panel.billing_integration_out_of_scope, true);
assert.equal(panel.real_ticket_auto_purchase_out_of_scope, true);
assert.equal(panel.external_api_submission_out_of_scope, true);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.public_url_launch, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.external_connection, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.merge_without_pr_review_allowed, false);
assert.equal(panel.repository_visibility_change_allowed, false);
assert.equal(panel.github_pages_setting_change_allowed, false);
assert.equal(panel.unsafe_flags, 0);
assert.equal(panel.phase20_12_through_phase20_25_locks_preserved, true);

const summary = panel.phase20_26_summary;
assert.equal(summary.total_confirmation_checks, 16);
assert.equal(summary.operation_status, "CONFIRMED");
assert.deepEqual(summary.operation_statuses, ["CONFIRMED", "HOLD", "BLOCKED"]);
assert.equal(summary.phase20_25_freeze_status_required, "PASS");
assert.equal(summary.phase20_25_freeze_status_observed, "PASS");
assert.equal(summary.phase20_25_freeze_pass_prerequisite, true);
assert.equal(summary.main_branch_pull_completed, true);
assert.equal(summary.working_tree_clean_confirmed, true);
assert.equal(summary.private_local_html_launch_confirmed, true);
assert.equal(summary.index_html_phase20_25_panel_display_confirmed, true);
assert.equal(summary.freeze_status_pass_display_confirmed, true);
assert.equal(summary.private_only_plan_only_display_confirmed, true);
assert.equal(summary.public_pages_external_auto_action_out_of_scope_confirmed, true);
assert.equal(summary.manual_owner_review_required_confirmed, true);
assert.equal(summary.rollback_revert_policy_maintained, true);
assert.equal(summary.safe_state_confirmed_before_next_phase, true);
assert.equal(summary.protected_mode, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.unsafe_guard, true);
assert.equal(summary.public_publish_out_of_scope, true);
assert.equal(summary.github_pages_publish_out_of_scope, true);
assert.equal(summary.external_sharing_out_of_scope, true);
assert.equal(summary.billing_integration_out_of_scope, true);
assert.equal(summary.real_ticket_auto_purchase_out_of_scope, true);
assert.equal(summary.external_api_submission_out_of_scope, true);
assert.equal(summary.github_pages_launch, false);
assert.equal(summary.public_url_launch, false);
assert.equal(summary.public_release_allowed, false);
assert.equal(summary.external_connection, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.auto_publish, false);
assert.equal(summary.auto_launch, false);
assert.equal(summary.direct_push_to_main_allowed, false);
assert.equal(summary.merge_without_pr_review_allowed, false);
assert.equal(summary.repository_visibility_change_allowed, false);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.unsafe_flags, 0);
assert.equal(summary.phase20_12_through_phase20_25_locks_preserved, true);

assert.equal(db.phase, "Phase20-26");
assert.equal(db.operationStatus, "CONFIRMED");
assert.deepEqual(db.operationStatuses, ["CONFIRMED", "HOLD", "BLOCKED"]);
assert.equal(db.phase20_25_freezeStatusRequired, "PASS");
assert.equal(db.phase20_25_freezeStatusObserved, "PASS");
assert.equal(db.phase20_25_freezePassPrerequisite, true);
assert.equal(db.mainBranchPullCompleted, true);
assert.equal(db.workingTreeCleanConfirmed, true);
assert.equal(db.privateLocalHtmlLaunchConfirmed, true);
assert.equal(db.indexHtmlPhase20_25PanelDisplayConfirmed, true);
assert.equal(db.freezeStatusPassDisplayConfirmed, true);
assert.equal(db.privateOnlyPlanOnlyDisplayConfirmed, true);
assert.equal(db.publicPagesExternalAutoActionOutOfScopeConfirmed, true);
assert.equal(db.manualOwnerReviewRequiredConfirmed, true);
assert.equal(db.rollbackRevertPolicyMaintained, true);
assert.equal(db.safeStateConfirmedBeforeNextPhase, true);
assert.equal(db.protectedMode, true);
assert.equal(db.planOnly, true);
assert.equal(db.unsafeGuard, true);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.githubPagesLaunch, false);
assert.equal(db.publicUrlLaunch, false);
assert.equal(db.externalConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoLaunch, false);
assert.equal(db.directPushToMainAllowed, false);
assert.equal(db.mergeWithoutPrReviewAllowed, false);
assert.equal(db.repositoryVisibilityChangeAllowed, false);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.unsafeFlags, 0);
assert.equal(db.phase20_12_through_phase20_25_locks_preserved, true);
assert.equal(db.confirmationLogItems.length, 10);

assert.equal(summaryDb.phase, "Phase20-26");
assert.equal(summaryDb.phase20_26_summary.totalConfirmationChecks, 16);
assert.equal(summaryDb.phase20_26_summary.operationStatus, "CONFIRMED");
assert.deepEqual(summaryDb.phase20_26_summary.operationStatuses, ["CONFIRMED", "HOLD", "BLOCKED"]);
assert.equal(summaryDb.phase20_26_summary.phase20_25_freezeStatusRequired, "PASS");
assert.equal(summaryDb.phase20_26_summary.phase20_25_freezeStatusObserved, "PASS");
assert.equal(summaryDb.phase20_26_summary.phase20_25_freezePassPrerequisite, true);
assert.deepEqual(summaryDb.outOfScopeOperations, engine.OUT_OF_SCOPE_OPERATIONS);

assert.equal(phase2025Summary.phase20_25_summary.freezeStatus, "PASS");
assert.equal(phase2025Summary.phase20_25_summary.publicPublishOutOfScope, true);
assert.equal(phase2025Summary.phase20_25_summary.githubPagesPublishOutOfScope, true);
assert.equal(phase2025Summary.phase20_25_summary.externalSharingOutOfScope, true);
assert.equal(phase2025Summary.phase20_25_summary.billingIntegrationOutOfScope, true);
assert.equal(phase2025Summary.phase20_25_summary.realTicketAutoPurchaseOutOfScope, true);
assert.equal(phase2025Summary.phase20_25_summary.externalApiSubmissionOutOfScope, true);

assert.ok(index.includes('id="phase20-26-final-local-operation-confirmation-log-builder"'));
assert.ok(index.includes('<script src="phase20-26-final-local-operation-confirmation-log-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-26-final-local-operation-confirmation-log-builder"'));
assert.ok(privateLocal.includes("Phase20-26 Final Local Operation Confirmation Log"));
assert.ok(readme.includes("Phase20-26 Final Local Operation Confirmation Log"));
assert.ok(readme.includes("phase20-26-final-local-operation-confirmation-log-builder.js"));

const builderSource = readText("phase20-26-final-local-operation-confirmation-log-builder.js");
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
  "github_pages_setting_change_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "public_release_ready: true",
  "direct_push_to_main_allowed: true",
  "merge_without_pr_review_allowed: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-26 builder`);
}

console.log("phase20-26 final local operation confirmation log builder tests passed");
