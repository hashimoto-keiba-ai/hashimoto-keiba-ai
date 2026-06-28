const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-7-final-manual-device-confirmation-checklist-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20-7");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.CHECKLIST_STATUS, "final_manual_device_confirmation_checklist_plan_only");
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-8 Manual Confirmation Result Review and Final Closure Decision");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.AUTO_VERIFICATION_ALLOWED, false);
assert.equal(engine.AUTO_FIX_ALLOWED, false);
assert.equal(engine.AUTO_RELEASE_ALLOWED, false);
assert.equal(engine.ROLLBACK_ALLOWED, false);
assert.deepEqual(engine.CONFIRMATION_STATUSES, ["manual_review_pending", "deferred_review", "release_gate_locked"]);

const sources = {
  releaseGateDb: readJson("phase20-6-manual-evidence-review-release-gate-decision-db.json"),
  releaseGateSummary: readJson("phase20-6-manual-evidence-review-release-gate-decision-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const checklist = engine.buildFinalManualDeviceConfirmationChecklist(sources, () => new Date("2026-06-27T09:00:00.000Z"));
assert.equal(checklist.phase, "Phase20-7");
assert.equal(checklist.title, "Final Manual Device Confirmation Checklist");
assert.equal(checklist.protected_mode, true);
assert.equal(checklist.plan_only, true);
assert.equal(checklist.connection_authority_issued, false);
assert.equal(checklist.records.length, 6);
assert.deepEqual(checklist.records.map((record) => record.target_name), ["iPhone", "iPad", "PC browser", "GitHub Pages", "private-local", "Governance / Release Gate"]);
assert.deepEqual(checklist.records.map((record) => record.confirmation_status), ["manual_review_pending", "deferred_review", "manual_review_pending", "manual_review_pending", "manual_review_pending", "release_gate_locked"]);

assert.deepEqual(checklist.phase20_7_summary, {
  phase: "Phase20-7",
  title: "Final Manual Device Confirmation Checklist",
  total_confirmation_targets: 6,
  manual_confirmation_required_count: 6,
  evidence_required_count: 6,
  evidence_present_count: 0,
  confirmed_count: 0,
  pending_count: 4,
  deferred_count: 1,
  locked_count: 1,
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  auto_verification_allowed: false,
  auto_fix_allowed: false,
  auto_release_allowed: false,
  rollback_allowed: false,
  release_gate_open: false,
  closure_ready: false,
  final_release_ready: false,
  unsafe_flags_count: 0,
  blocked_items_count: 0,
  summary_alignment_ok: true,
  ui_readme_checks: {
    index_phase20_7_panel: true,
    private_local_phase20_7_card: true,
    readme_phase20_7_section: true,
    phase20_6_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of checklist.records) {
  for (const field of ["target_id", "target_name", "confirmation_type", "manual_confirmation_required", "evidence_required", "evidence_present", "confirmation_status", "confirmation_result", "reviewer_action_required", "release_gate_dependency", "protected_mode", "plan_only", "execution_allowed", "auto_execution_allowed", "external_connection_allowed", "auto_verification_allowed", "auto_fix_allowed", "auto_release_allowed", "rollback_allowed", "notes"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.equal(record.manual_confirmation_required, true);
  assert.equal(record.evidence_required, true);
  assert.equal(record.evidence_present, false);
  assert.equal(record.confirmation_result, "not_confirmed");
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.equal(record.auto_verification_allowed, false);
  assert.equal(record.auto_fix_allowed, false);
  assert.equal(record.auto_release_allowed, false);
  assert.equal(record.rollback_allowed, false);
}

assert.equal(checklist.records.find((record) => record.target_name === "iPhone").confirmation_status, "manual_review_pending");
assert.equal(checklist.records.find((record) => record.target_name === "iPad").confirmation_status, "deferred_review");
assert.equal(checklist.records.find((record) => record.target_name === "PC browser").confirmation_status, "manual_review_pending");
assert.equal(checklist.records.find((record) => record.target_name === "GitHub Pages").confirmation_status, "manual_review_pending");
assert.equal(checklist.records.find((record) => record.target_name === "private-local").confirmation_status, "manual_review_pending");
assert.equal(checklist.records.find((record) => record.target_name === "Governance / Release Gate").confirmation_status, "release_gate_locked");

for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed", "auto_verification_allowed", "auto_fix_allowed", "auto_release_allowed", "rollback_allowed"]) assert.equal(checklist[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.releaseGateSummary.auto_release_allowed = Boolean("unsafe test fixture");
const unsafeChecklist = engine.buildFinalManualDeviceConfirmationChecklist(unsafeSources);
assert.equal(unsafeChecklist.phase20_7_summary.unsafe_flags_count, 1);
assert.equal(unsafeChecklist.phase20_7_summary.release_gate_open, false);
assert.equal(unsafeChecklist.phase20_7_summary.closure_ready, false);
assert.equal(unsafeChecklist.phase20_7_summary.final_release_ready, false);

const db = readJson("phase20-7-final-manual-device-confirmation-checklist-db.json");
const summaryDb = readJson("phase20-7-final-manual-device-confirmation-checklist-summary-db.json");
assert.equal(db.phase, "Phase20-7");
assert.equal(summaryDb.phase, "Phase20-7");
assert.deepEqual(db.records, checklist.records);
assert.equal(summaryDb.records, undefined);
assert.equal(db.phase20_7_summary.total_confirmation_targets, db.records.length);
assert.deepEqual(db.phase20_7_summary, checklist.phase20_7_summary);
assert.deepEqual(summaryDb.phase20_7_summary, checklist.phase20_7_summary);
assert.equal(summaryDb.phase20_7_summary.total_confirmation_targets, 6);
assert.equal(summaryDb.phase20_7_summary.manual_confirmation_required_count, 6);
assert.equal(summaryDb.phase20_7_summary.evidence_required_count, 6);
assert.equal(summaryDb.phase20_7_summary.evidence_present_count, 0);
assert.equal(summaryDb.phase20_7_summary.confirmed_count, 0);
assert.equal(summaryDb.phase20_7_summary.pending_count, 4);
assert.equal(summaryDb.phase20_7_summary.deferred_count, 1);
assert.equal(summaryDb.phase20_7_summary.locked_count, 1);
assert.equal(summaryDb.phase20_7_summary.release_gate_open, false);
assert.equal(summaryDb.phase20_7_summary.closure_ready, false);
assert.equal(summaryDb.phase20_7_summary.final_release_ready, false);
for (const database of [db, summaryDb]) {
  assert.equal(database.protected_mode, true);
  assert.equal(database.plan_only, true);
  assert.equal(database.connection_authority_issued, false);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed", "auto_verification_allowed", "auto_fix_allowed", "auto_release_allowed", "rollback_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase20-7-final-manual-device-confirmation-checklist-builder"'));
assert.ok(index.includes('<script src="phase20-7-final-manual-device-confirmation-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-7-final-manual-device-confirmation-checklist-builder"'));
assert.ok(readme.includes("Phase20-7 Final Manual Device Confirmation Checklist"));
assert.ok(index.includes('id="phase20-6-manual-evidence-review-release-gate-decision-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-6-manual-evidence-review-release-gate-decision-builder"'));

console.log("phase20-7 final manual device confirmation checklist builder tests passed");
