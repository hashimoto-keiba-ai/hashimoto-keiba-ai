const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase21-12-private-local-post-pr205-operation-continuity-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-12-private-local-post-pr205-operation-continuity-checklist-db.json");
const summaryDb = readJson("phase21-12-private-local-post-pr205-operation-continuity-checklist-summary-db.json");
const phase20ClosureSummary = readJson("phase20-completion-final-closure-summary-db.json");
const phase2111Summary = readJson("phase21-11-private-local-post-pr204-operation-stability-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

assert.equal(engine.PHASE, "Phase21-12");
assert.equal(engine.CHECKLIST_NAME, "Private Local Post PR205 Operation Continuity Checklist");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "phase21_12_private_local_post_pr205_operation_continuity_checklist_plan_only");
assert.equal(engine.POST_PR205_OPERATION_CONTINUITY_STATUS, "POST_PR205_PRIVATE_LOCAL_OPERATION_CONTINUITY_READY");
assert.equal(engine.PHASE21_11_PREREQUISITE, "POST_PR204_PRIVATE_LOCAL_OPERATION_STABILITY_READY");
assert.equal(engine.PHASE21_10_DRAFT_PR, "PR #204 Draft");
assert.equal(engine.PHASE21_11_DRAFT_PR, "PR #205 Draft");
assert.equal(engine.CHECKS.length, 34);

const panel = engine.buildPrivateLocalPostPr205OperationContinuityChecklist({}, () => new Date("2026-07-02T00:00:00.000Z"));
assert.equal(panel.phase, "Phase21-12");
assert.equal(panel.records.length, 34);
assert.equal(panel.private_repository, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.local_first_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.post_pr205_operation_continuity_checklist_only, true);
assert.equal(panel.phase21_11_post_pr204_operation_stability_checklist_preserved, true);
assert.equal(panel.phase21_12_push_explicitly_requested, true);
assert.equal(panel.phase21_12_pr_creation_allowed_without_instruction, false);
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

const summary = panel.phase21_12_summary;
assert.equal(summary.total_checks, 34);
assert.equal(summary.confirmed_checks, 18);
assert.equal(summary.manual_review_required_checks, 11);
assert.equal(summary.blocked_checks, 5);
assert.equal(summary.phase21_9_draft_pr_review_required, true);
assert.equal(summary.phase21_10_draft_pr_review_required, true);
assert.equal(summary.phase21_11_draft_pr_review_required, true);
assert.equal(summary.phase21_11_pr205_created, true);
assert.equal(summary.phase21_12_push_explicitly_requested, true);
assert.equal(summary.phase21_12_pr_creation_allowed_without_instruction, false);
assert.equal(summary.draft_pr_chain_order_confirmed, true);
assert.equal(summary.pr205_base_compare_chain_required, true);
assert.equal(summary.draft_pr_chain_audit_required, true);
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

assert.equal(db.phase, "Phase21-12");
assert.equal(db.postPr205OperationContinuityStatus, "POST_PR205_PRIVATE_LOCAL_OPERATION_CONTINUITY_READY");
assert.equal(db.phase21_10_draftPr, "PR #204 Draft");
assert.equal(db.phase21_11_draftPr, "PR #205 Draft");
assert.equal(db.phase21_11_pr205Created, true);
assert.equal(db.phase21_12_pushExplicitlyRequested, true);
assert.equal(db.phase21_12_prCreationAllowedWithoutInstruction, false);
assert.equal(db.checkCount, 34);
assert.equal(db.confirmedCheckCount, 18);
assert.equal(db.manualReviewRequiredCheckCount, 11);
assert.equal(db.blockedCheckCount, 5);

assert.equal(summaryDb.phase21_12_summary.totalChecks, 34);
assert.equal(summaryDb.phase21_12_summary.phase21_11_postPr204OperationStabilityChecklistPreserved, true);
assert.equal(summaryDb.phase21_12_summary.phase21_11_pr205Created, true);
assert.equal(summaryDb.phase21_12_summary.phase21_12_prCreationAllowedWithoutInstruction, false);
assert.equal(summaryDb.phase21_12_summary.autoReadyForReviewAllowed, false);
assert.equal(summaryDb.phase21_12_summary.readyForReviewAllowed, false);
assert.equal(summaryDb.phase21_12_summary.githubPagesSettingChangeAllowed, false);
assert.equal(summaryDb.phase21_12_summary.publicUrlGuidanceAllowed, false);
assert.equal(summaryDb.phase21_12_summary.autoExecution, false);
assert.equal(summaryDb.phase21_12_summary.mergeAllowed, false);

assert.equal(phase20ClosureSummary.phase20_completion_summary.phase20CompletionStatus, "COMPLETE_LOCAL_ONLY_PROTECTED");
assert.equal(phase2111Summary.phase21_11_summary.phase21_10_pr204Created, true);
assert.equal(phase2111Summary.phase21_11_summary.autoReadyForReviewAllowed, false);

assert.ok(index.includes('id="phase21-12-private-local-post-pr205-operation-continuity-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-12-private-local-post-pr205-operation-continuity-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-12-private-local-post-pr205-operation-continuity-checklist-builder"'));
assert.ok(readme.includes("Phase21-12 Private Local Post PR205 Operation Continuity Checklist"));
assert.ok(css.includes(".phase21-12-private-local-post-pr205-operation-continuity-checklist"));

const builderSource = readText("phase21-12-private-local-post-pr205-operation-continuity-checklist-builder.js");
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
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase21-12 builder`);
}

console.log("phase21-12 private local post PR205 operation continuity checklist builder tests passed");
