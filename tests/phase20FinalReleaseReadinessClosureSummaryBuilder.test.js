const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-4-final-release-readiness-closure-summary-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20-4");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "ec08f9f");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.CLOSURE_SUMMARY_STATUS, "final_release_readiness_closure_summary_plan_only");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-5 Manual Mobile Verification Evidence Collection");
assert.deepEqual(engine.RELEASE_READINESS_STATUSES, ["pending_release_evidence", "deferred_release_evidence", "plan_only_governance_confirmed"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  resultCaptureDb: readJson("phase20-3-mobile-verification-result-capture-closure-plan-db.json"),
  resultCaptureSummary: readJson("phase20-3-mobile-verification-result-capture-closure-plan-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const summary = engine.buildFinalReleaseReadinessClosureSummary(sources, () => new Date("2026-06-27T06:00:00.000Z"));
assert.equal(summary.closure_summary_status, "final_release_readiness_closure_summary_plan_only");
assert.equal(summary.source_result_capture_plan_status, "mobile_verification_result_capture_closure_plan_only");
assert.equal(summary.source_closure_ready, false);
assert.equal(summary.source_final_release_ready, false);
assert.equal(summary.protected_mode, true);
assert.equal(summary.plan_only, true);
assert.equal(summary.connection_authority_issued, false);
assert.equal(summary.records.length, 6);
assert.deepEqual(summary.records.map((record) => record.release_readiness_status), ["pending_release_evidence", "pending_release_evidence", "deferred_release_evidence", "pending_release_evidence", "pending_release_evidence", "plan_only_governance_confirmed"]);
assert.deepEqual(summary.phase20_4_summary, {
  total_release_targets: 6,
  pending_release_items_count: 4,
  deferred_release_items_count: 1,
  plan_only_confirmed_count: 1,
  blocked_items_count: 0,
  unsafe_flags_count: 0,
  closure_ready: false,
  final_release_ready: false,
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  pending_or_deferred_items_remaining: 5,
  summary_alignment_ok: true,
  ui_readme_checks: {
    index_phase20_4_panel: true,
    private_local_phase20_4_card: true,
    readme_phase20_4_section: true,
    phase20_3_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of summary.records) {
  for (const field of ["id", "source_result_id", "target_name", "device_type", "previous_result_capture_status", "release_readiness_status", "evidence_status", "closure_decision", "release_ready", "closure_ready", "readiness_reason", "source_result_capture_plan_id", "protected_mode", "plan_only", "execution_allowed", "auto_execution_allowed", "external_connection_allowed", "safety_constraints", "next_action", "blocked_actions", "allowed_actions"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.ok(engine.RELEASE_READINESS_STATUSES.includes(record.release_readiness_status));
  assert.equal(record.release_ready, false);
  assert.equal(record.closure_ready, false);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.ok(record.safety_constraints.includes("no_release_execution"));
  assert.ok(record.safety_constraints.includes("no_auto_confirmation"));
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}
assert.equal(engine.countStatus(summary.records, "pending_release_evidence"), 4);
assert.equal(engine.countStatus(summary.records, "deferred_release_evidence"), 1);
assert.equal(engine.countStatus(summary.records, "plan_only_governance_confirmed"), 1);
assert.equal(summary.phase20_4_summary.closure_ready, false);
assert.equal(summary.phase20_4_summary.final_release_ready, false);
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(summary[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.resultCaptureSummary.executionAllowed = Boolean("unsafe test fixture");
const unsafeSummary = engine.buildFinalReleaseReadinessClosureSummary(unsafeSources);
assert.equal(unsafeSummary.phase20_4_summary.unsafe_flags_count, 1);
assert.equal(unsafeSummary.phase20_4_summary.closure_ready, false);
assert.equal(unsafeSummary.phase20_4_summary.final_release_ready, false);

const db = readJson("phase20-4-final-release-readiness-closure-summary-db.json");
const summaryDb = readJson("phase20-4-final-release-readiness-closure-summary-summary-db.json");
assert.equal(db.phase, "Phase20-4");
assert.equal(summaryDb.phase, "Phase20-4");
assert.deepEqual(db.records, summary.records);
assert.equal(summaryDb.records, undefined);
assert.equal(db.phase20_4_summary.total_release_targets, db.records.length);
assert.deepEqual(db.phase20_4_summary, summary.phase20_4_summary);
assert.deepEqual(summaryDb.phase20_4_summary, summary.phase20_4_summary);
assert.equal(summaryDb.phase20_4_summary.total_release_targets, 6);
assert.equal(summaryDb.phase20_4_summary.pending_release_items_count, 4);
assert.equal(summaryDb.phase20_4_summary.deferred_release_items_count, 1);
assert.equal(summaryDb.phase20_4_summary.closure_ready, false);
assert.equal(summaryDb.phase20_4_summary.final_release_ready, false);
assert.equal(summaryDb.phase20_4_summary.unsafe_flags_count, 0);
assert.equal(summaryDb.phase20_4_summary.blocked_items_count, 0);
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
assert.ok(index.includes('id="phase20-4-final-release-readiness-closure-summary-builder"'));
assert.ok(index.includes('<script src="phase20-4-final-release-readiness-closure-summary-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-4-final-release-readiness-closure-summary-builder"'));
assert.ok(readme.includes("Phase20-4 Final Release Readiness Closure Summary"));
assert.ok(index.includes('id="phase20-3-mobile-verification-result-capture-closure-plan-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-3-mobile-verification-result-capture-closure-plan-builder"'));

console.log("phase20-4 final release readiness closure summary builder tests passed");
