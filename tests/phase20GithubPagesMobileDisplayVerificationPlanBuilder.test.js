const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-2-github-pages-mobile-display-verification-plan-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20-2");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "8d0fa2f");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PLAN_STATUS, "github_pages_mobile_display_verification_plan_only");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-3 Mobile Verification Result Capture and Closure Plan");
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  checklistDb: readJson("phase20-1-post-closure-device-validation-checklist-db.json"),
  checklistSummary: readJson("phase20-1-post-closure-device-validation-checklist-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const plan = engine.buildGithubPagesMobileDisplayVerificationPlan(sources, () => new Date("2026-06-27T04:00:00.000Z"));
assert.equal(plan.verification_plan_status, "github_pages_mobile_display_verification_plan_only");
assert.equal(plan.source_checklist_status, "post_closure_device_validation_checklist_plan_only");
assert.equal(plan.source_checklist_ready, true);
assert.equal(plan.protected_mode, true);
assert.equal(plan.plan_only, true);
assert.equal(plan.plan_only_enforced, true);
assert.equal(plan.connection_authority_issued, false);
assert.equal(plan.records.length, 6);
assert.deepEqual(plan.records.map((record) => record.target_name), [
  "GitHub Pages display verification",
  "iPhone display verification",
  "iPad display verification",
  "PC browser display verification",
  "private-local display verification",
  "Release Planning Governance verification"
]);
assert.deepEqual(plan.records.map((record) => record.device_type), ["github_pages", "iphone", "ipad", "pc_browser", "private_local", "governance"]);
assert.deepEqual(plan.records.map((record) => record.verification_status), ["pending", "pending", "deferred", "confirmed_or_pending_plan", "confirmed_or_pending_plan", "plan_only_confirmed"]);
assert.deepEqual(plan.phase20_2_summary, {
  total_verification_targets: 6,
  github_pages_status: "pending",
  iphone_status: "pending",
  ipad_status: "deferred",
  pc_browser_status: "confirmed_or_pending_plan",
  private_local_status: "confirmed_or_pending_plan",
  governance_status: "plan_only_confirmed",
  pending_items_count: 2,
  deferred_items_count: 1,
  confirmed_or_pending_plan_count: 2,
  plan_only_confirmed_count: 1,
  blocked_items_count: 0,
  unsafe_flags_count: 0,
  checklist_ready: true,
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  summary_alignment_ok: true,
  ui_readme_checks: {
    index_phase20_2_panel: true,
    private_local_phase20_2_card: true,
    readme_phase20_2_section: true,
    phase19_16_link_retained: true,
    phase20_link_retained: true,
    phase20_1_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of plan.records) {
  for (const field of ["id", "target_name", "device_type", "verification_status", "verification_scope", "manual_check_required", "auto_execution_allowed", "external_connection_allowed", "protected_mode", "plan_only", "expected_result", "next_action", "source_checklist_id", "source_checklist_ready", "safety_constraints", "blocked_actions", "allowed_actions", "execution_allowed"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.ok(engine.VERIFICATION_STATUSES.includes(record.verification_status));
  assert.equal(record.verification_scope.length, 4);
  assert.equal(record.source_checklist_ready, true);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.ok(record.safety_constraints.includes("PLAN_ONLY"));
  assert.ok(record.safety_constraints.includes("no_real_github_pages_connection"));
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}
assert.equal(plan.records.find((record) => record.device_type === "github_pages").verification_status, "pending");
assert.equal(plan.records.find((record) => record.device_type === "iphone").verification_status, "pending");
assert.equal(plan.records.find((record) => record.device_type === "ipad").verification_status, "deferred");
assert.equal(plan.records.find((record) => record.device_type === "pc_browser").verification_status, "confirmed_or_pending_plan");
assert.equal(plan.records.find((record) => record.device_type === "private_local").verification_status, "confirmed_or_pending_plan");
assert.equal(plan.records.find((record) => record.device_type === "governance").verification_status, "plan_only_confirmed");
assert.equal(engine.countStatus(plan.records, "pending"), 2);
assert.equal(engine.countStatus(plan.records, "deferred"), 1);
assert.equal(engine.countStatus(plan.records, "confirmed_or_pending_plan"), 2);
assert.equal(engine.countStatus(plan.records, "plan_only_confirmed"), 1);
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(plan[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.checklistSummary.executionAllowed = Boolean("unsafe test fixture");
const unsafePlan = engine.buildGithubPagesMobileDisplayVerificationPlan(unsafeSources);
assert.equal(unsafePlan.phase20_2_summary.unsafe_flags_count, 1);
assert.equal(unsafePlan.phase20_2_summary.checklist_ready, false);
assert.equal(unsafePlan.phase20_2_summary.blocked_items_count, 0);

const notReadySources = JSON.parse(JSON.stringify(sources));
notReadySources.checklistSummary.phase20_1_summary.checklist_ready = false;
const notReadyPlan = engine.buildGithubPagesMobileDisplayVerificationPlan(notReadySources);
assert.equal(notReadyPlan.phase20_2_summary.checklist_ready, false);

const db = readJson("phase20-2-github-pages-mobile-display-verification-plan-db.json");
const summaryDb = readJson("phase20-2-github-pages-mobile-display-verification-plan-summary-db.json");
assert.equal(db.phase, "Phase20-2");
assert.equal(summaryDb.phase, "Phase20-2");
assert.deepEqual(db.records, plan.records);
assert.equal(summaryDb.records, undefined);
assert.equal(db.phase20_2_summary.total_verification_targets, db.records.length);
assert.deepEqual(db.phase20_2_summary, plan.phase20_2_summary);
assert.deepEqual(summaryDb.phase20_2_summary, plan.phase20_2_summary);
assert.equal(summaryDb.phase20_2_summary.total_verification_targets, 6);
assert.equal(summaryDb.phase20_2_summary.unsafe_flags_count, 0);
assert.equal(summaryDb.phase20_2_summary.blocked_items_count, 0);
assert.equal(summaryDb.phase20_2_summary.summary_alignment_ok, true);
for (const database of [db, summaryDb]) {
  assert.equal(database.protected_mode, true);
  assert.equal(database.plan_only, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase20-2-github-pages-mobile-display-verification-plan-builder"'));
assert.ok(index.includes('<script src="phase20-2-github-pages-mobile-display-verification-plan-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-2-github-pages-mobile-display-verification-plan-builder"'));
assert.ok(readme.includes("Phase20-2 GitHub Pages and Mobile Display Verification Plan"));
assert.ok(index.includes('id="phase19-final-validation-closure-report-builder"'));
assert.ok(index.includes('id="phase20-post-closure-device-validation-release-planning-builder"'));
assert.ok(index.includes('id="phase20-1-post-closure-device-validation-checklist-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-1-post-closure-device-validation-checklist-builder"'));

console.log("phase20-2 github pages mobile display verification plan builder tests passed");
