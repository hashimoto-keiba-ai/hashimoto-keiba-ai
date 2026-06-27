const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-post-closure-device-validation-release-planning-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "2c25ac5");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-1 Post-Closure Device Validation Checklist");
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);
for (const asset of ["phase19-final-validation-closure-report-db.json", "phase19-final-validation-closure-report-summary-db.json", "index.html", "private-local.html", "README.md"]) assert.ok(engine.SOURCE_ASSETS.includes(asset));

const sources = {
  closureReport: readJson("phase19-final-validation-closure-report-db.json"),
  closureSummary: readJson("phase19-final-validation-closure-report-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const plan = engine.buildPostClosureDeviceValidationReleasePlanning(sources, () => new Date("2026-06-27T02:00:00.000Z"));
assert.equal(plan.phase20_status, "post_closure_device_validation_release_planning_plan_only");
assert.equal(plan.source_closure_report_status, "final_validation_closed");
assert.equal(plan.source_final_validation_closed, true);
assert.equal(plan.source_closure_ready, true);
assert.equal(plan.source_ipad_validation_status, "deferred");
assert.equal(plan.official_release_protected, true);
assert.equal(plan.protected_mode, true);
assert.equal(plan.plan_only, true);
assert.equal(plan.plan_only_enforced, true);
assert.equal(plan.connection_authority_issued, false);
assert.equal(plan.records.length, 6);
assert.deepEqual(plan.records.map((record) => record.node_name), [
  "PC Local Validation Node",
  "iPad Deferred Validation Node",
  "iPhone Pending Validation Node",
  "GitHub Pages Validation Node",
  "private-local One Tap Menu Validation Node",
  "Release Planning Governance Node"
]);
assert.deepEqual(plan.records.map((record) => record.validation_status), ["confirmed_or_ready", "deferred", "pending", "pending", "confirmed_or_ready", "plan_only"]);
assert.deepEqual(plan.phase20_summary, {
  total: 6,
  device_validation_ready: true,
  pc_validation_status: "confirmed_or_ready",
  ipad_validation_status: "deferred",
  iphone_validation_status: "pending",
  github_pages_validation_status: "pending",
  private_local_validation_status: "confirmed_or_ready",
  release_planning_status: "plan_only",
  unsafe_flags_count: 0,
  external_connection_allowed: false,
  auto_execution_allowed: false,
  execution_allowed: false,
  protected_mode: true,
  plan_only: true,
  ipad_deferred_blocks_release_planning: false,
  closure_ready_source_ok: true,
  ui_readme_checks: {
    index_phase20_panel: true,
    private_local_phase20_card: true,
    readme_phase20_section: true,
    phase19_16_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of plan.records) {
  for (const field of ["device_plan_id", "node_name", "device_target", "validation_status", "plan_status", "validation_scope", "release_scope", "source_closure_report_id", "source_closure_ready", "device_validation_ready", "release_planning_status", "deferred_reason", "blocked_reason", "validation_policy", "safety_constraints", "recommended_next_step", "blocked_actions", "allowed_actions", "execution_allowed", "auto_execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.ok(engine.DEVICE_STATUSES.includes(record.validation_status));
  assert.ok(engine.PLAN_STATUSES.includes(record.plan_status));
  assert.equal(record.source_closure_ready, true);
  assert.equal(record.release_planning_status, "plan_only");
  assert.ok(record.safety_constraints.includes("PLAN_ONLY"));
  assert.ok(record.safety_constraints.includes("Official Release v2.8 protected"));
  assert.ok(record.recommended_next_step.startsWith("Recommended:"));
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
}
const ipadRecord = plan.records.find((record) => record.device_target === "ipad");
assert.equal(ipadRecord.validation_status, "deferred");
assert.equal(ipadRecord.device_validation_ready, true);
assert.equal(ipadRecord.validation_policy, "deferred_device_validation_does_not_block_release_planning");
assert.equal(plan.phase20_summary.device_validation_ready, true);
assert.equal(plan.phase20_summary.ipad_deferred_blocks_release_planning, false);

for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(plan[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.closureSummary.executionAllowed = Boolean("unsafe test fixture");
const unsafePlan = engine.buildPostClosureDeviceValidationReleasePlanning(unsafeSources);
assert.equal(unsafePlan.phase20_status, "post_closure_device_validation_release_planning_hold");
assert.equal(unsafePlan.phase20_summary.device_validation_ready, false);
assert.ok(unsafePlan.phase20_summary.unsafe_flags_count > 0);
assert.equal(unsafePlan.phase20_summary.ipad_validation_status, "deferred");
assert.equal(unsafePlan.phase20_summary.ipad_deferred_blocks_release_planning, false);

const closureNotReadySources = JSON.parse(JSON.stringify(sources));
closureNotReadySources.closureSummary.final_validation_closure_summary.closure_ready = false;
const closureNotReadyPlan = engine.buildPostClosureDeviceValidationReleasePlanning(closureNotReadySources);
assert.equal(closureNotReadyPlan.phase20_summary.closure_ready_source_ok, false);
assert.equal(closureNotReadyPlan.phase20_summary.device_validation_ready, false);

const planDb = readJson("phase20-post-closure-device-validation-release-planning-db.json");
const summaryDb = readJson("phase20-post-closure-device-validation-release-planning-summary-db.json");
assert.equal(planDb.phase, "Phase20");
assert.equal(summaryDb.phase, "Phase20");
assert.deepEqual(planDb.records, plan.records);
assert.equal(summaryDb.records, undefined);
assert.deepEqual(planDb.phase20_summary, plan.phase20_summary);
assert.deepEqual(summaryDb.phase20_summary, plan.phase20_summary);
assert.equal(summaryDb.phase20_summary.unsafe_flags_count, 0);
assert.equal(summaryDb.phase20_summary.device_validation_ready, true);
assert.equal(summaryDb.phase20_summary.ipad_validation_status, "deferred");
assert.equal(summaryDb.phase20_summary.next_recommended_step, "Phase20-1 Post-Closure Device Validation Checklist");
for (const database of [planDb, summaryDb]) {
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
assert.ok(index.includes('id="phase20-post-closure-device-validation-release-planning-builder"'));
assert.ok(index.includes('<script src="phase20-post-closure-device-validation-release-planning-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-post-closure-device-validation-release-planning-builder"'));
assert.ok(readme.includes("Phase20 Global Network Post-Closure Device Validation and Release Planning"));
assert.ok(index.includes('id="phase19-final-validation-closure-report-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase19-final-validation-closure-report-builder"'));

console.log("phase20 post-closure device validation release planning builder tests passed");
