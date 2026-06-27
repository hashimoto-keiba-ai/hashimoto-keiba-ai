const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-1-post-closure-device-validation-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20-1");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "676a8fe");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.CHECKLIST_STATUS, "post_closure_device_validation_checklist_plan_only");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-2 GitHub Pages and Mobile Display Verification Plan");
assert.deepEqual(engine.CHECKLIST_ITEM_STATUSES, ["confirmed_or_ready", "deferred", "pending", "plan_only", "blocked"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  phase20Plan: readJson("phase20-post-closure-device-validation-release-planning-db.json"),
  phase20Summary: readJson("phase20-post-closure-device-validation-release-planning-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const checklist = engine.buildPostClosureDeviceValidationChecklist(sources, () => new Date("2026-06-27T03:00:00.000Z"));
assert.equal(checklist.checklist_status, "post_closure_device_validation_checklist_plan_only");
assert.equal(checklist.source_phase20_status, "post_closure_device_validation_release_planning_plan_only");
assert.equal(checklist.source_device_validation_ready, true);
assert.equal(checklist.source_ipad_validation_status, "deferred");
assert.equal(checklist.protected_mode, true);
assert.equal(checklist.plan_only, true);
assert.equal(checklist.plan_only_enforced, true);
assert.equal(checklist.connection_authority_issued, false);
assert.equal(checklist.records.length, 6);
assert.deepEqual(checklist.records.map((record) => record.checklist_name), [
  "PC Local Display Checklist",
  "iPad Deferred Checklist",
  "iPhone Pending Checklist",
  "GitHub Pages Pending Checklist",
  "private-local One Tap Menu Checklist",
  "Release Planning Governance Checklist"
]);
assert.deepEqual(checklist.records.map((record) => record.status), ["confirmed_or_ready", "deferred", "pending", "pending", "confirmed_or_ready", "plan_only"]);
assert.deepEqual(checklist.phase20_1_summary, {
  total_checklist_items: 6,
  confirmed_items_count: 2,
  deferred_items_count: 1,
  pending_items_count: 2,
  plan_only_items_count: 1,
  blocked_items_count: 0,
  unsafe_flags_count: 0,
  checklist_ready: true,
  checklist_status: "post_closure_device_validation_checklist_plan_only",
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  ipad_validation_status: "deferred",
  iphone_validation_status: "pending",
  github_pages_validation_status: "pending",
  ipad_deferred_blocks_checklist_ready: false,
  summary_alignment_ok: true,
  ui_readme_checks: {
    index_phase20_1_panel: true,
    private_local_phase20_1_card: true,
    readme_phase20_1_section: true,
    phase20_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of checklist.records) {
  for (const field of ["checklist_id", "checklist_name", "device_target", "status", "check_items", "source_phase20_planning_id", "source_device_validation_ready", "blocked_reasons", "deferred_reasons", "pending_reasons", "checklist_policy", "safety_constraints", "recommended_next_step", "blocked_actions", "allowed_actions", "execution_allowed", "auto_execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.ok(engine.CHECKLIST_ITEM_STATUSES.includes(record.status));
  assert.equal(record.check_items.length, 4);
  assert.equal(record.source_device_validation_ready, true);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.ok(record.safety_constraints.includes("PLAN_ONLY"));
  assert.ok(record.safety_constraints.includes("Official Release v2.8 protected"));
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
}
const ipadRecord = checklist.records.find((record) => record.device_target === "ipad");
assert.equal(ipadRecord.status, "deferred");
assert.equal(ipadRecord.checklist_policy, "deferred_does_not_block_checklist_ready");
assert.ok(ipadRecord.deferred_reasons.includes("device_not_available_kept_as_follow_up"));
assert.equal(checklist.phase20_1_summary.checklist_ready, true);
assert.equal(checklist.phase20_1_summary.ipad_deferred_blocks_checklist_ready, false);
assert.equal(engine.countStatus(checklist.records, "confirmed_or_ready"), checklist.phase20_1_summary.confirmed_items_count);
assert.equal(engine.countStatus(checklist.records, "deferred"), checklist.phase20_1_summary.deferred_items_count);
assert.equal(engine.countStatus(checklist.records, "pending"), checklist.phase20_1_summary.pending_items_count);
assert.equal(engine.countStatus(checklist.records, "plan_only"), checklist.phase20_1_summary.plan_only_items_count);
assert.equal(engine.countStatus(checklist.records, "blocked"), checklist.phase20_1_summary.blocked_items_count);
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(checklist[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.phase20Summary.executionAllowed = Boolean("unsafe test fixture");
const unsafeChecklist = engine.buildPostClosureDeviceValidationChecklist(unsafeSources);
assert.equal(unsafeChecklist.phase20_1_summary.unsafe_flags_count, 1);
assert.equal(unsafeChecklist.phase20_1_summary.checklist_ready, false);
assert.equal(unsafeChecklist.phase20_1_summary.ipad_validation_status, "deferred");
assert.equal(unsafeChecklist.phase20_1_summary.ipad_deferred_blocks_checklist_ready, false);

const notReadySources = JSON.parse(JSON.stringify(sources));
notReadySources.phase20Summary.phase20_summary.device_validation_ready = false;
const notReadyChecklist = engine.buildPostClosureDeviceValidationChecklist(notReadySources);
assert.equal(notReadyChecklist.phase20_1_summary.checklist_ready, false);

const db = readJson("phase20-1-post-closure-device-validation-checklist-db.json");
const summaryDb = readJson("phase20-1-post-closure-device-validation-checklist-summary-db.json");
assert.equal(db.phase, "Phase20-1");
assert.equal(summaryDb.phase, "Phase20-1");
assert.deepEqual(db.records, checklist.records);
assert.equal(summaryDb.records, undefined);
assert.equal(db.phase20_1_summary.total_checklist_items, db.records.length);
assert.deepEqual(db.phase20_1_summary, checklist.phase20_1_summary);
assert.deepEqual(summaryDb.phase20_1_summary, checklist.phase20_1_summary);
assert.equal(summaryDb.phase20_1_summary.blocked_items_count, 0);
assert.equal(summaryDb.phase20_1_summary.unsafe_flags_count, 0);
assert.equal(summaryDb.phase20_1_summary.checklist_ready, true);
assert.equal(summaryDb.phase20_1_summary.summary_alignment_ok, true);
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
assert.ok(index.includes('id="phase20-1-post-closure-device-validation-checklist-builder"'));
assert.ok(index.includes('<script src="phase20-1-post-closure-device-validation-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-1-post-closure-device-validation-checklist-builder"'));
assert.ok(readme.includes("Phase20-1 Post-Closure Device Validation Checklist"));
assert.ok(index.includes('id="phase20-post-closure-device-validation-release-planning-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-post-closure-device-validation-release-planning-builder"'));

console.log("phase20-1 post-closure device validation checklist builder tests passed");
