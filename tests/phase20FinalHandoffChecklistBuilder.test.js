const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-27-final-handoff-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-27-final-handoff-checklist-db.json");
const summaryDb = readJson("phase20-27-final-handoff-checklist-summary-db.json");
const phase2026Summary = readJson("phase20-26-final-local-operation-confirmation-log-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase20-27");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "final_handoff_checklist_plan_only");
assert.equal(engine.HANDOFF_STATUS, "PENDING_CONFIRMATION");
assert.equal(engine.DEVICE_STATUS_PENDING, "Pending");
assert.equal(engine.CHECKLIST_ITEMS.length, 16);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Complete iPad, home PC, and company PC manual confirmation before Phase20 completion");

const panel = engine.buildFinalHandoffChecklist({}, () => new Date("2026-06-30T10:00:00.000Z"));
assert.equal(panel.phase, "Phase20-27");
assert.equal(panel.records.length, 16);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.handoff_status, "PENDING_CONFIRMATION");
assert.equal(panel.draft_pr_required, true);
assert.equal(panel.merge_allowed, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.github_pages_setting_change_allowed, false);
assert.equal(panel.public_url_guidance_allowed, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.external_connection, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.repository_visibility_change_allowed, false);
assert.equal(panel.unsafe_flags, 0);
assert.equal(panel.ipad_confirmation_status, "Pending");
assert.equal(panel.home_pc_confirmation_status, "Pending");
assert.equal(panel.company_pc_confirmation_status, "Pending");
assert.equal(panel.pending_items_are_pending, true);
assert.equal(panel.phase20_1_through_phase20_26_routes_confirmed, true);
assert.equal(panel.phase20_12_through_phase20_26_locks_preserved, true);

const summary = panel.phase20_27_summary;
assert.equal(summary.total_checklist_items, 16);
assert.equal(summary.confirmed_items, 13);
assert.equal(summary.pending_items, 3);
assert.equal(summary.private_release_freeze_state_confirmed, true);
assert.equal(summary.local_launch_confirmed, true);
assert.equal(summary.index_html_display_confirmed, true);
assert.equal(summary.private_local_html_display_confirmed, true);
assert.equal(summary.phase20_1_through_phase20_26_routes_confirmed, true);
assert.equal(summary.json_syntax_confirmation_required, true);
assert.equal(summary.builder_js_syntax_confirmation_required, true);
assert.equal(summary.test_syntax_confirmation_required, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.protected_mode, true);
assert.equal(summary.github_pages_independence_confirmed, true);
assert.equal(summary.no_external_public_exposure_confirmed, true);
assert.equal(summary.ipad_confirmation_status, "Pending");
assert.equal(summary.home_pc_confirmation_status, "Pending");
assert.equal(summary.company_pc_confirmation_status, "Pending");
assert.equal(summary.next_recommended_step, engine.NEXT_RECOMMENDED_STEP);

assert.equal(db.phase, "Phase20-27");
assert.equal(db.privateRepository, true);
assert.equal(db.handoffStatus, "PENDING_CONFIRMATION");
assert.equal(db.draftPrRequired, true);
assert.equal(db.mergeAllowed, false);
assert.equal(db.directPushToMainAllowed, false);
assert.equal(db.githubPagesLaunch, false);
assert.equal(db.externalConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoLaunch, false);
assert.equal(db.ipadConfirmationStatus, "Pending");
assert.equal(db.homePcConfirmationStatus, "Pending");
assert.equal(db.companyPcConfirmationStatus, "Pending");
assert.equal(db.phase20_12_through_phase20_26_locks_preserved, true);

assert.equal(summaryDb.phase, "Phase20-27");
assert.equal(summaryDb.phase20_27_summary.totalChecklistItems, 16);
assert.equal(summaryDb.phase20_27_summary.confirmedItems, 13);
assert.equal(summaryDb.phase20_27_summary.pendingItems, 3);
assert.equal(summaryDb.phase20_27_summary.nextRecommendedStep, engine.NEXT_RECOMMENDED_STEP);

assert.equal(phase2026Summary.phase20_26_summary.operationStatus, "CONFIRMED");
assert.equal(phase2026Summary.phase20_26_summary.phase20_25_freezePassPrerequisite, true);
assert.equal(phase2026Summary.phase20_26_summary.publicReleaseAllowed, false);
assert.equal(phase2026Summary.phase20_26_summary.autoExecution, false);

assert.ok(index.includes('id="phase20-27-final-handoff-checklist-builder"'));
assert.ok(index.includes('<script src="phase20-27-final-handoff-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-27-final-handoff-checklist-builder"'));
assert.ok(privateLocal.includes("Phase20-27 Final Handoff Checklist"));
assert.ok(readme.includes("Phase20-27 Final Handoff Checklist"));
assert.ok(readme.includes("phase20-27-final-handoff-checklist-builder.js"));
assert.ok(css.includes(".phase20-27-final-handoff-checklist"));
assert.ok(css.includes(".pending-note"));

const builderSource = readText("phase20-27-final-handoff-checklist-builder.js");
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
  "direct_push_to_main_allowed: true",
  "merge_allowed: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-27 builder`);
}

console.log("phase20-27 final handoff checklist builder tests passed");
