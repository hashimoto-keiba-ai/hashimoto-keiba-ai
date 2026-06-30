const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-3-private-local-device-sync-operation-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-3-private-local-device-sync-operation-checklist-db.json");
const summaryDb = readJson("phase21-3-private-local-device-sync-operation-checklist-summary-db.json");
const phase20ClosureSummary = readJson("phase20-completion-final-closure-summary-db.json");
const phase211Summary = readJson("phase21-1-post-phase20-private-local-operation-start-gate-summary-db.json");
const phase212Summary = readJson("phase21-2-private-local-operation-continuity-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-3");
assert.equal(engine.CHECKLIST_NAME, "Private Local Device Sync Operation Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_3_private_local_device_sync_operation_checklist_plan_only");
assert.equal(engine.DEVICE_SYNC_STATUS, "DEVICE_SYNC_OPERATION_REVIEW_READY");
assert.equal(engine.PHASE20_COMPLETION_PREREQUISITE, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(engine.PHASE21_1_PREREQUISITE, "READY_FOR_PRIVATE_LOCAL_PLANNING");
assert.equal(engine.PHASE21_2_PREREQUISITE, "CONTINUITY_CONFIRMED_PLAN_ONLY");
assert.equal(engine.DEVICE_CHECKS.length, 17);

const panel = engine.buildPrivateLocalDeviceSyncOperationChecklist({}, () => new Date("2026-07-01T00:00:00.000Z"));
assert.equal(panel.phase, "Phase21-3");
assert.equal(panel.records.length, 17);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_first_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.checklist_audit_display_only, true);
assert.equal(panel.device_sync_review_only, true);
assert.equal(panel.phase20_completion_final_closure_preserved, true);
assert.equal(panel.phase21_1_start_gate_preserved, true);
assert.equal(panel.phase21_2_continuity_checklist_preserved, true);
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

const summary = panel.phase21_3_summary;
assert.equal(summary.total_device_checks, 17);
assert.equal(summary.confirmed_device_checks, 9);
assert.equal(summary.manual_review_required_checks, 3);
assert.equal(summary.blocked_device_checks, 5);
assert.equal(summary.ipad_operation_confirmation_required, true);
assert.equal(summary.home_pc_operation_confirmation_required, true);
assert.equal(summary.company_pc_operation_confirmation_required, true);
assert.equal(summary.phase20_completion_final_closure_preserved, true);
assert.equal(summary.phase21_1_start_gate_preserved, true);
assert.equal(summary.phase21_2_continuity_checklist_preserved, true);
assert.equal(summary.local_first_operation, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.protected_mode, true);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.public_url_guidance_allowed, false);
assert.equal(summary.external_api_connection, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.merge_allowed, false);

assert.equal(db.phase, "Phase21-3");
assert.equal(db.deviceSyncStatus, "DEVICE_SYNC_OPERATION_REVIEW_READY");
assert.equal(db.ipadOperationConfirmationRequired, true);
assert.equal(db.homePcOperationConfirmationRequired, true);
assert.equal(db.companyPcOperationConfirmationRequired, true);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.publicUrlGuidanceAllowed, false);
assert.equal(db.externalApiConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.mergeAllowed, false);

assert.equal(summaryDb.phase21_3_summary.totalDeviceChecks, 17);
assert.equal(summaryDb.phase21_3_summary.manualReviewRequiredChecks, 3);
assert.equal(summaryDb.phase21_3_summary.phase21_2_continuityChecklistPreserved, true);
assert.equal(summaryDb.phase21_3_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_3_summary.externalApiConnection, false);
assert.equal(summaryDb.phase21_3_summary.autoExecution, false);

assert.equal(phase20ClosureSummary.phase20_completion_summary.phase20CompletionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(phase211Summary.phase21_1_summary.phase20CompletionFinalClosurePreserved, true);
assert.equal(phase212Summary.phase21_2_summary.phase21_1_startGatePreserved, true);
assert.equal(phase212Summary.phase21_2_summary.autoExecution, false);

assert.ok(index.includes('id="phase21-3-private-local-device-sync-operation-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-3-private-local-device-sync-operation-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-3-private-local-device-sync-operation-checklist-builder"'));
assert.ok(readme.includes("Phase21-3 Private Local Device Sync Operation Checklist"));
assert.ok(css.includes(".phase21-3-private-local-device-sync-operation-checklist"));

const builderSource = readText("phase21-3-private-local-device-sync-operation-checklist-builder.js");
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  "external_connection: true",
  "external_api_connection: true",
  "external_api_connection_allowed: true",
  "external_api_submission_allowed: true",
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
  "direct_push_to_main_allowed: true",
  "merge_allowed: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-3 builder`);
}

console.log("phase21-3 private local device sync operation checklist builder tests passed");
