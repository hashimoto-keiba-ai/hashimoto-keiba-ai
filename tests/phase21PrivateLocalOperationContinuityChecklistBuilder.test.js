const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-2-private-local-operation-continuity-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-2-private-local-operation-continuity-checklist-db.json");
const summaryDb = readJson("phase21-2-private-local-operation-continuity-checklist-summary-db.json");
const phase20ClosureSummary = readJson("phase20-completion-final-closure-summary-db.json");
const phase211Summary = readJson("phase21-1-post-phase20-private-local-operation-start-gate-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-2");
assert.equal(engine.CHECKLIST_NAME, "Private Local Operation Continuity Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_2_private_local_operation_continuity_checklist_plan_only");
assert.equal(engine.CONTINUITY_STATUS, "CONTINUITY_CONFIRMED_PLAN_ONLY");
assert.equal(engine.PHASE20_COMPLETION_PREREQUISITE, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(engine.PHASE21_1_PREREQUISITE, "READY_FOR_PRIVATE_LOCAL_PLANNING");
assert.equal(engine.CONTINUITY_CHECKS.length, 16);

const panel = engine.buildPrivateLocalOperationContinuityChecklist({}, () => new Date("2026-06-30T14:00:00.000Z"));
assert.equal(panel.phase, "Phase21-2");
assert.equal(panel.records.length, 16);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.checklist_audit_display_only, true);
assert.equal(panel.phase20_completion_final_closure_preserved, true);
assert.equal(panel.phase21_1_start_gate_preserved, true);
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

const summary = panel.phase21_2_summary;
assert.equal(summary.total_continuity_checks, 16);
assert.equal(summary.confirmed_continuity_checks, 11);
assert.equal(summary.blocked_continuity_checks, 5);
assert.equal(summary.phase20_completion_final_closure_preserved, true);
assert.equal(summary.phase21_1_start_gate_preserved, true);
assert.equal(summary.private_repository, true);
assert.equal(summary.local_only_operation, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.protected_mode, true);
assert.equal(summary.checklist_audit_display_only, true);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.public_url_guidance_allowed, false);
assert.equal(summary.external_api_connection, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.auto_publish, false);
assert.equal(summary.auto_launch, false);
assert.equal(summary.billing_integration_allowed, false);
assert.equal(summary.direct_push_to_main_allowed, false);
assert.equal(summary.merge_allowed, false);
assert.equal(summary.next_recommended_step, engine.NEXT_RECOMMENDED_STEP);

assert.equal(db.phase, "Phase21-2");
assert.equal(db.continuityStatus, "CONTINUITY_CONFIRMED_PLAN_ONLY");
assert.equal(db.privateRepository, true);
assert.equal(db.localOnlyOperation, true);
assert.equal(db.phase20CompletionFinalClosurePreserved, true);
assert.equal(db.phase21_1_startGatePreserved, true);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.publicUrlGuidanceAllowed, false);
assert.equal(db.externalApiConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoLaunch, false);
assert.equal(db.billingIntegrationAllowed, false);
assert.equal(db.directPushToMainAllowed, false);
assert.equal(db.mergeAllowed, false);

assert.equal(summaryDb.phase21_2_summary.totalContinuityChecks, 16);
assert.equal(summaryDb.phase21_2_summary.confirmedContinuityChecks, 11);
assert.equal(summaryDb.phase21_2_summary.blockedContinuityChecks, 5);
assert.equal(summaryDb.phase21_2_summary.phase20CompletionFinalClosurePreserved, true);
assert.equal(summaryDb.phase21_2_summary.phase21_1_startGatePreserved, true);
assert.equal(summaryDb.phase21_2_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_2_summary.publicUrlGuidanceAllowed, false);
assert.equal(summaryDb.phase21_2_summary.externalApiConnection, false);
assert.equal(summaryDb.phase21_2_summary.autoExecution, false);
assert.equal(summaryDb.phase21_2_summary.mergeAllowed, false);

assert.equal(phase20ClosureSummary.phase20_completion_summary.phase20CompletionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(phase20ClosureSummary.phase20_completion_summary.publicUrlGuidanceAllowed, false);
assert.equal(phase211Summary.phase21_1_summary.phase20CompletionFinalClosurePreserved, true);
assert.equal(phase211Summary.phase21_1_summary.autoExecution, false);

assert.ok(index.includes('id="phase20-completion-final-closure-builder"'));
assert.ok(index.includes('id="phase21-1-post-phase20-private-local-operation-start-gate-builder"'));
assert.ok(index.includes('id="phase21-2-private-local-operation-continuity-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-2-private-local-operation-continuity-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-completion-final-closure-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase21-1-post-phase20-private-local-operation-start-gate-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase21-2-private-local-operation-continuity-checklist-builder"'));
assert.ok(readme.includes("Phase21-2 Private Local Operation Continuity Checklist"));
assert.ok(css.includes(".phase21-2-private-local-operation-continuity-checklist"));

const builderSource = readText("phase21-2-private-local-operation-continuity-checklist-builder.js");
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  "external_connection: true",
  "external_connection_allowed: true",
  "external_api_connection: true",
  "external_api_connection_allowed: true",
  "external_api_submission_allowed: true",
  "auto_execution: true",
  "auto_execution_allowed: true",
  "auto_publish: true",
  "auto_publish_allowed: true",
  "auto_launch: true",
  "auto_launch_allowed: true",
  "billing_integration_allowed: true",
  "github_pages_launch_allowed: true",
  "github_pages_setting_change_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "direct_push_to_main_allowed: true",
  "merge_allowed: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-2 builder`);
}

console.log("phase21-2 private local operation continuity checklist builder tests passed");
