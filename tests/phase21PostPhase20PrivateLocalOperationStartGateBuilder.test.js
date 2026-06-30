const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-1-post-phase20-private-local-operation-start-gate-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-1-post-phase20-private-local-operation-start-gate-db.json");
const summaryDb = readJson("phase21-1-post-phase20-private-local-operation-start-gate-summary-db.json");
const phase20ClosureSummary = readJson("phase20-completion-final-closure-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-1");
assert.equal(engine.GATE_NAME, "Post Phase20 Private Local Operation Start Gate");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_1_private_local_operation_start_gate_plan_only");
assert.equal(engine.START_GATE_STATUS, "READY_FOR_PRIVATE_LOCAL_PLANNING");
assert.equal(engine.PHASE20_COMPLETION_PREREQUISITE, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(engine.START_CHECKS.length, 10);

const panel = engine.buildPostPhase20PrivateLocalOperationStartGate({}, () => new Date("2026-06-30T13:00:00.000Z"));
assert.equal(panel.phase, "Phase21-1");
assert.equal(panel.records.length, 10);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.phase20_completion_prerequisite, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(panel.phase20_completion_final_closure_preserved, true);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.github_pages_setting_change_allowed, false);
assert.equal(panel.public_url_guidance_allowed, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.external_connection, false);
assert.equal(panel.external_api_submission_allowed, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.billing_integration_allowed, false);
assert.equal(panel.repository_visibility_change_allowed, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.merge_allowed, false);
assert.equal(panel.draft_pr_required, true);
assert.equal(panel.unsafe_flags, 0);

const summary = panel.phase21_1_summary;
assert.equal(summary.total_start_checks, 10);
assert.equal(summary.confirmed_start_checks, 10);
assert.equal(summary.phase20_completion_final_closure_preserved, true);
assert.equal(summary.phase20_completion_display_preserved, true);
assert.equal(summary.phase20_completion_route_preserved, true);
assert.equal(summary.phase21_1_route_added, true);
assert.equal(summary.private_repository, true);
assert.equal(summary.local_only_operation, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.protected_mode, true);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.public_url_guidance_allowed, false);
assert.equal(summary.external_api_submission_allowed, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.merge_allowed, false);
assert.equal(summary.next_recommended_step, engine.NEXT_RECOMMENDED_STEP);

assert.equal(db.phase, "Phase21-1");
assert.equal(db.startGateStatus, "READY_FOR_PRIVATE_LOCAL_PLANNING");
assert.equal(db.phase20CompletionFinalClosurePreserved, true);
assert.equal(db.privateRepository, true);
assert.equal(db.localOnlyOperation, true);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.publicUrlGuidanceAllowed, false);
assert.equal(db.externalConnection, false);
assert.equal(db.externalApiSubmissionAllowed, false);
assert.equal(db.autoExecution, false);
assert.equal(db.mergeAllowed, false);

assert.equal(summaryDb.phase21_1_summary.totalStartChecks, 10);
assert.equal(summaryDb.phase21_1_summary.confirmedStartChecks, 10);
assert.equal(summaryDb.phase21_1_summary.phase20CompletionFinalClosurePreserved, true);
assert.equal(summaryDb.phase21_1_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_1_summary.publicUrlGuidanceAllowed, false);
assert.equal(summaryDb.phase21_1_summary.externalApiSubmissionAllowed, false);
assert.equal(summaryDb.phase21_1_summary.autoExecution, false);

assert.equal(phase20ClosureSummary.phase20_completion_summary.phase20CompletionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(phase20ClosureSummary.phase20_completion_summary.publicUrlGuidanceAllowed, false);
assert.equal(phase20ClosureSummary.phase20_completion_summary.autoExecution, false);

assert.ok(index.includes('id="phase20-completion-final-closure-builder"'));
assert.ok(index.includes('id="phase21-1-post-phase20-private-local-operation-start-gate-builder"'));
assert.ok(index.includes('<script src="phase21-1-post-phase20-private-local-operation-start-gate-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-completion-final-closure-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase21-1-post-phase20-private-local-operation-start-gate-builder"'));
assert.ok(readme.includes("Phase20 Completion Final Closure"));
assert.ok(readme.includes("Phase21-1 Post Phase20 Private Local Operation Start Gate"));
assert.ok(css.includes(".phase21-1-post-phase20-private-local-operation-start-gate"));

const builderSource = readText("phase21-1-post-phase20-private-local-operation-start-gate-builder.js");
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  "external_connection: true",
  "external_connection_allowed: true",
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
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-1 builder`);
}

console.log("phase21-1 post Phase20 private local operation start gate builder tests passed");
