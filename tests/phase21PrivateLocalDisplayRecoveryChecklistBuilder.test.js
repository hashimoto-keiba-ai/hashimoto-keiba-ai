const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-4-private-local-display-recovery-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-4-private-local-display-recovery-checklist-db.json");
const summaryDb = readJson("phase21-4-private-local-display-recovery-checklist-summary-db.json");
const phase20ClosureSummary = readJson("phase20-completion-final-closure-summary-db.json");
const phase211Summary = readJson("phase21-1-post-phase20-private-local-operation-start-gate-summary-db.json");
const phase212Summary = readJson("phase21-2-private-local-operation-continuity-checklist-summary-db.json");
const phase213Summary = readJson("phase21-3-private-local-device-sync-operation-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-4");
assert.equal(engine.CHECKLIST_NAME, "Private Local Display Recovery Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_4_private_local_display_recovery_checklist_plan_only");
assert.equal(engine.DISPLAY_RECOVERY_STATUS, "DISPLAY_RECOVERY_REVIEW_READY");
assert.equal(engine.PHASE20_COMPLETION_PREREQUISITE, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(engine.PHASE21_1_PREREQUISITE, "READY_FOR_PRIVATE_LOCAL_PLANNING");
assert.equal(engine.PHASE21_2_PREREQUISITE, "CONTINUITY_CONFIRMED_PLAN_ONLY");
assert.equal(engine.PHASE21_3_PREREQUISITE, "DEVICE_SYNC_OPERATION_REVIEW_READY");
assert.equal(engine.CHECKS.length, 20);

const panel = engine.buildPrivateLocalDisplayRecoveryChecklist({}, () => new Date("2026-07-01T00:00:00.000Z"));
assert.equal(panel.phase, "Phase21-4");
assert.equal(panel.records.length, 20);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_first_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.checklist_audit_display_only, true);
assert.equal(panel.display_recovery_review_only, true);
assert.equal(panel.phase20_completion_final_closure_preserved, true);
assert.equal(panel.phase21_1_start_gate_preserved, true);
assert.equal(panel.phase21_2_continuity_checklist_preserved, true);
assert.equal(panel.phase21_3_device_sync_checklist_preserved, true);
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
assert.equal(panel.billing_integration_allowed, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.merge_allowed, false);
assert.equal(panel.draft_pr_required, true);
assert.equal(panel.unsafe_flags, 0);

const summary = panel.phase21_4_summary;
assert.equal(summary.total_checks, 20);
assert.equal(summary.confirmed_checks, 11);
assert.equal(summary.manual_review_required_checks, 5);
assert.equal(summary.blocked_checks, 4);
assert.equal(summary.home_pc_confirmation_required, true);
assert.equal(summary.company_pc_confirmation_required, true);
assert.equal(summary.ipad_confirmation_required, true);
assert.equal(summary.private_local_launch_check_required, true);
assert.equal(summary.index_display_check_required, true);
assert.equal(summary.dashboard_route_check_required, true);
assert.equal(summary.github_pull_after_update_check_required, true);
assert.equal(summary.recovery_checklist_required, true);
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
assert.equal(summary.merge_allowed, false);

assert.equal(db.phase, "Phase21-4");
assert.equal(db.displayRecoveryStatus, "DISPLAY_RECOVERY_REVIEW_READY");
assert.equal(db.homePcConfirmationRequired, true);
assert.equal(db.companyPcConfirmationRequired, true);
assert.equal(db.ipadConfirmationRequired, true);
assert.equal(db.privateLocalLaunchCheckRequired, true);
assert.equal(db.indexDisplayCheckRequired, true);
assert.equal(db.dashboardRouteCheckRequired, true);
assert.equal(db.githubPullAfterUpdateCheckRequired, true);
assert.equal(db.recoveryChecklistRequired, true);
assert.equal(db.mergeBeforeCheckRequired, true);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.publicUrlGuidanceAllowed, false);
assert.equal(db.externalApiConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.mergeAllowed, false);

assert.equal(summaryDb.phase21_4_summary.totalChecks, 20);
assert.equal(summaryDb.phase21_4_summary.manualReviewRequiredChecks, 5);
assert.equal(summaryDb.phase21_4_summary.phase21_3_deviceSyncChecklistPreserved, true);
assert.equal(summaryDb.phase21_4_summary.privateLocalLaunchCheckRequired, true);
assert.equal(summaryDb.phase21_4_summary.indexDisplayCheckRequired, true);
assert.equal(summaryDb.phase21_4_summary.githubPullAfterUpdateCheckRequired, true);
assert.equal(summaryDb.phase21_4_summary.recoveryChecklistRequired, true);
assert.equal(summaryDb.phase21_4_summary.mergeBeforeCheckRequired, true);
assert.equal(summaryDb.phase21_4_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_4_summary.externalApiConnection, false);
assert.equal(summaryDb.phase21_4_summary.autoExecution, false);

assert.equal(phase20ClosureSummary.phase20_completion_summary.phase20CompletionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(phase211Summary.phase21_1_summary.phase20CompletionFinalClosurePreserved, true);
assert.equal(phase212Summary.phase21_2_summary.phase21_1_startGatePreserved, true);
assert.equal(phase213Summary.phase21_3_summary.phase21_2_continuityChecklistPreserved, true);
assert.equal(phase213Summary.phase21_3_summary.autoExecution, false);

assert.ok(index.includes('id="phase21-4-private-local-display-recovery-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-4-private-local-display-recovery-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-4-private-local-display-recovery-checklist-builder"'));
assert.ok(readme.includes("Phase21-4 Private Local Display Recovery Checklist"));
assert.ok(css.includes(".phase21-4-private-local-display-recovery-checklist"));

const builderSource = readText("phase21-4-private-local-display-recovery-checklist-builder.js");
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
  unsafeTrue("github_pages_launch_allowed"),
  unsafeTrue("github_pages_setting_change_allowed"),
  unsafeTrue("repository_visibility_change_allowed"),
  unsafeTrue("public_release_allowed"),
  unsafeTrue("direct_push_to_main_allowed"),
  unsafeTrue("merge_allowed")
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-4 builder`);
}

console.log("phase21-4 private local display recovery checklist builder tests passed");
