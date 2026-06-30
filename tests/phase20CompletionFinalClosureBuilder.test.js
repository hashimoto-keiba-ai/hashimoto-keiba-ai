const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-completion-final-closure-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-completion-final-closure-db.json");
const summaryDb = readJson("phase20-completion-final-closure-summary-db.json");
const phase2027Summary = readJson("phase20-27-final-handoff-checklist-summary-db.json");
const phase2010Summary = readJson("phase20-10-final-display-confirmation-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase20");
assert.equal(engine.CLOSURE_NAME, "Phase20 Completion Final Closure");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase20_completion_final_closure_complete_plan_only");
assert.equal(engine.COMPLETION_STATUS, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(engine.PHASE_COMPLETION_ITEMS.length, 27);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Keep Phase20 closed for private local operation and use draft PR review before any later phase");

const panel = engine.buildPhase20CompletionFinalClosure({}, () => new Date("2026-06-30T12:00:00.000Z"));
assert.equal(panel.phase, "Phase20");
assert.equal(panel.records.length, 27);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.github_pages_setting_change_allowed, false);
assert.equal(panel.public_url_guidance_allowed, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.external_connection, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.billing_integration_allowed, false);
assert.equal(panel.external_api_submission_allowed, false);
assert.equal(panel.repository_visibility_change_allowed, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.merge_allowed, false);
assert.equal(panel.draft_pr_required, true);
assert.equal(panel.unsafe_flags, 0);

const summary = panel.phase20_completion_summary;
assert.equal(summary.total_phase20_items, 27);
assert.equal(summary.completed_phase20_items, 27);
assert.equal(summary.protected_items, 27);
assert.equal(summary.plan_only_items, 27);
assert.equal(summary.route_preserved_items, 25);
assert.equal(summary.summary_record_items, 1);
assert.equal(summary.recorded_without_new_route_items, 1);
assert.equal(summary.phase20_1_through_phase20_27_completion_summarized, true);
assert.equal(summary.existing_phase20_routes_preserved, true);
assert.equal(summary.index_html_route_added, true);
assert.equal(summary.private_local_html_route_added, true);
assert.equal(summary.readme_updated, true);
assert.equal(summary.json_syntax_check_required, true);
assert.equal(summary.javascript_syntax_check_required, true);
assert.equal(summary.new_test_added, true);
assert.equal(summary.related_phase20_tests_required, true);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.public_url_guidance_allowed, false);
assert.equal(summary.external_connection, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.next_recommended_step, engine.NEXT_RECOMMENDED_STEP);

assert.equal(db.phase, "Phase20");
assert.equal(db.completionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(db.phase20ItemCount, 27);
assert.equal(db.completedPhase20ItemCount, 27);
assert.equal(db.privateRepository, true);
assert.equal(db.localOnlyOperation, true);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.publicUrlGuidanceAllowed, false);
assert.equal(db.externalConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.mergeAllowed, false);

assert.equal(summaryDb.phase20_completion_summary.totalPhase20Items, 27);
assert.equal(summaryDb.phase20_completion_summary.completedPhase20Items, 27);
assert.equal(summaryDb.phase20_completion_summary.routePreservedItems, 25);
assert.equal(summaryDb.phase20_completion_summary.summaryRecordItems, 1);
assert.equal(summaryDb.phase20_completion_summary.recordedWithoutNewRouteItems, 1);
assert.equal(summaryDb.phase20_completion_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase20_completion_summary.publicUrlGuidanceAllowed, false);

assert.equal(phase2027Summary.phase20_27_summary.draftPrRequired, true);
assert.equal(phase2027Summary.phase20_27_summary.mergeAllowed, false);
assert.equal(phase2027Summary.phase20_27_summary.publicReleaseAllowed, false);
assert.equal(phase2027Summary.phase20_27_summary.autoExecution, false);
assert.equal(phase2010Summary.phase, "Phase20-10");

assert.ok(index.includes('id="phase20-completion-final-closure-builder"'));
assert.ok(index.includes('<script src="phase20-completion-final-closure-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-completion-final-closure-builder"'));
assert.ok(privateLocal.includes("Phase20 Completion Final Closure"));
assert.ok(readme.includes("Phase20 Completion Final Closure"));
assert.ok(readme.includes("phase20-completion-final-closure-builder.js"));
assert.ok(css.includes(".phase20-completion-final-closure"));

const builderSource = readText("phase20-completion-final-closure-builder.js");
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
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20 completion closure builder`);
}

console.log("phase20 completion final closure builder tests passed");
