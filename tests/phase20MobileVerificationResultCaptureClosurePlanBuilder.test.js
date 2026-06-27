const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-3-mobile-verification-result-capture-closure-plan-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20-3");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "80d587e");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.CAPTURE_PLAN_STATUS, "mobile_verification_result_capture_closure_plan_only");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-4 Final Release Readiness Closure Summary");
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  verificationDb: readJson("phase20-2-github-pages-mobile-display-verification-plan-db.json"),
  verificationSummary: readJson("phase20-2-github-pages-mobile-display-verification-plan-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const plan = engine.buildMobileVerificationResultCaptureClosurePlan(sources, () => new Date("2026-06-27T05:00:00.000Z"));
assert.equal(plan.result_capture_plan_status, "mobile_verification_result_capture_closure_plan_only");
assert.equal(plan.source_verification_plan_status, "github_pages_mobile_display_verification_plan_only");
assert.equal(plan.source_checklist_ready, true);
assert.equal(plan.protected_mode, true);
assert.equal(plan.plan_only, true);
assert.equal(plan.connection_authority_issued, false);
assert.equal(plan.records.length, 6);
assert.deepEqual(plan.records.map((record) => record.target_name), [
  "GitHub Pages display result capture",
  "iPhone display result capture",
  "iPad display result capture",
  "PC browser display result capture",
  "private-local display result capture",
  "Release Planning Governance closure result"
]);
assert.deepEqual(plan.records.map((record) => record.device_type), ["github_pages", "iphone", "ipad", "pc_browser", "private_local", "governance"]);
assert.deepEqual(plan.records.map((record) => record.result_capture_status), ["pending_result_capture", "pending_result_capture", "deferred_result_capture", "pending_or_confirmed_result_capture", "pending_or_confirmed_result_capture", "plan_only_closure_confirmed"]);
assert.deepEqual(plan.phase20_3_summary, {
  total_result_targets: 6,
  captured_results_count: 1,
  pending_result_count: 4,
  deferred_result_count: 1,
  pending_or_confirmed_result_count: 2,
  plan_only_confirmed_count: 1,
  blocked_items_count: 0,
  unsafe_flags_count: 0,
  checklist_ready: true,
  closure_ready: false,
  final_release_ready: false,
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  summary_alignment_ok: true,
  ui_readme_checks: {
    index_phase20_3_panel: true,
    private_local_phase20_3_card: true,
    readme_phase20_3_section: true,
    phase19_16_link_retained: true,
    phase20_link_retained: true,
    phase20_1_link_retained: true,
    phase20_2_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of plan.records) {
  for (const field of ["id", "target_name", "device_type", "previous_status", "result_capture_status", "manual_check_required", "evidence_required", "evidence_status", "closure_decision", "closure_ready", "confirmed_result", "next_action", "protected_mode", "plan_only", "execution_allowed", "auto_execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.ok(engine.RESULT_STATUSES.includes(record.result_capture_status));
  assert.ok(engine.CLOSURE_DECISIONS.includes(record.closure_decision));
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.equal(record.closure_ready, false);
  assert.ok(record.safety_constraints.includes("no_auto_result_capture"));
  assert.ok(record.safety_constraints.includes("no_auto_confirmed_conversion"));
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}
assert.equal(plan.records.find((record) => record.device_type === "github_pages").result_capture_status, "pending_result_capture");
assert.equal(plan.records.find((record) => record.device_type === "iphone").result_capture_status, "pending_result_capture");
assert.equal(plan.records.find((record) => record.device_type === "ipad").result_capture_status, "deferred_result_capture");
assert.equal(plan.records.find((record) => record.device_type === "governance").result_capture_status, "plan_only_closure_confirmed");
assert.equal(plan.records.find((record) => record.device_type === "ipad").deferred_reason, "ipad_device_not_currently_available");
assert.equal(plan.phase20_3_summary.closure_ready, false);
assert.equal(plan.phase20_3_summary.final_release_ready, false);
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(plan[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.verificationSummary.executionAllowed = Boolean("unsafe test fixture");
const unsafePlan = engine.buildMobileVerificationResultCaptureClosurePlan(unsafeSources);
assert.equal(unsafePlan.phase20_3_summary.unsafe_flags_count, 1);
assert.equal(unsafePlan.phase20_3_summary.checklist_ready, false);
assert.equal(unsafePlan.phase20_3_summary.closure_ready, false);
assert.equal(unsafePlan.phase20_3_summary.final_release_ready, false);

const db = readJson("phase20-3-mobile-verification-result-capture-closure-plan-db.json");
const summaryDb = readJson("phase20-3-mobile-verification-result-capture-closure-plan-summary-db.json");
assert.equal(db.phase, "Phase20-3");
assert.equal(summaryDb.phase, "Phase20-3");
assert.deepEqual(db.records, plan.records);
assert.equal(summaryDb.records, undefined);
assert.equal(db.phase20_3_summary.total_result_targets, db.records.length);
assert.deepEqual(db.phase20_3_summary, plan.phase20_3_summary);
assert.deepEqual(summaryDb.phase20_3_summary, plan.phase20_3_summary);
assert.equal(summaryDb.phase20_3_summary.total_result_targets, 6);
assert.equal(summaryDb.phase20_3_summary.blocked_items_count, 0);
assert.equal(summaryDb.phase20_3_summary.unsafe_flags_count, 0);
assert.equal(summaryDb.phase20_3_summary.closure_ready, false);
assert.equal(summaryDb.phase20_3_summary.final_release_ready, false);
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
assert.ok(index.includes('id="phase20-3-mobile-verification-result-capture-closure-plan-builder"'));
assert.ok(index.includes('<script src="phase20-3-mobile-verification-result-capture-closure-plan-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-3-mobile-verification-result-capture-closure-plan-builder"'));
assert.ok(readme.includes("Phase20-3 Mobile Verification Result Capture and Closure Plan"));
assert.ok(index.includes('id="phase19-final-validation-closure-report-builder"'));
assert.ok(index.includes('id="phase20-post-closure-device-validation-release-planning-builder"'));
assert.ok(index.includes('id="phase20-1-post-closure-device-validation-checklist-builder"'));
assert.ok(index.includes('id="phase20-2-github-pages-mobile-display-verification-plan-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-2-github-pages-mobile-display-verification-plan-builder"'));

console.log("phase20-3 mobile verification result capture closure plan builder tests passed");
