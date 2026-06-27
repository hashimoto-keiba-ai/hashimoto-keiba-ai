const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-5-manual-mobile-verification-evidence-collection-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20-5");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "e7a23ee");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EVIDENCE_COLLECTION_STATUS, "manual_mobile_verification_evidence_collection_plan_only");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-6 Manual Evidence Review and Release Gate Decision");
assert.deepEqual(engine.EVIDENCE_STATUSES, ["manual_evidence_pending", "deferred_evidence", "plan_only_governance_evidence"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  releaseReadinessDb: readJson("phase20-4-final-release-readiness-closure-summary-db.json"),
  releaseReadinessSummary: readJson("phase20-4-final-release-readiness-closure-summary-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const collection = engine.buildManualMobileVerificationEvidenceCollection(sources, () => new Date("2026-06-27T07:00:00.000Z"));
assert.equal(collection.evidence_collection_status, "manual_mobile_verification_evidence_collection_plan_only");
assert.equal(collection.source_closure_ready, false);
assert.equal(collection.source_final_release_ready, false);
assert.equal(collection.protected_mode, true);
assert.equal(collection.plan_only, true);
assert.equal(collection.connection_authority_issued, false);
assert.equal(collection.records.length, 6);
assert.deepEqual(collection.records.map((record) => record.evidence_collection_status), ["manual_evidence_pending", "manual_evidence_pending", "deferred_evidence", "manual_evidence_pending", "manual_evidence_pending", "plan_only_governance_evidence"]);
assert.deepEqual(collection.phase20_5_summary, {
  total_evidence_targets: 6,
  manual_evidence_pending_count: 4,
  deferred_evidence_count: 1,
  plan_only_governance_evidence_count: 1,
  evidence_present_count: 0,
  pending_or_deferred_items_remaining: 5,
  blocked_items_count: 0,
  unsafe_flags_count: 0,
  closure_ready: false,
  final_release_ready: false,
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  summary_alignment_ok: true,
  ui_readme_checks: {
    index_phase20_5_panel: true,
    private_local_phase20_5_card: true,
    readme_phase20_5_section: true,
    phase20_4_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of collection.records) {
  for (const field of ["id", "source_release_readiness_id", "target_name", "device_type", "previous_release_readiness_status", "evidence_collection_status", "manual_check_required", "evidence_required", "evidence_template", "evidence_present", "closure_ready", "final_release_ready", "deferred_reason", "pending_reason", "collection_policy", "source_release_readiness_summary_id", "protected_mode", "plan_only", "execution_allowed", "auto_execution_allowed", "external_connection_allowed", "safety_constraints", "next_action", "blocked_actions", "allowed_actions"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  for (const field of ["checked_at", "checked_device", "screen_url_or_local_path", "display_check_result", "screenshot_attached", "operation_notes", "reviewer_notes"]) assert.ok(Object.hasOwn(record.evidence_template, field), `${field} evidence template required`);
  assert.ok(engine.EVIDENCE_STATUSES.includes(record.evidence_collection_status));
  assert.equal(record.evidence_present, false);
  assert.equal(record.closure_ready, false);
  assert.equal(record.final_release_ready, false);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.equal(record.evidence_template.screenshot_attached, false);
  assert.ok(record.safety_constraints.includes("no_auto_evidence_capture"));
  assert.ok(record.safety_constraints.includes("no_auto_confirmed_conversion"));
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}
assert.equal(collection.records.find((record) => record.device_type === "ipad").evidence_collection_status, "deferred_evidence");
assert.equal(collection.records.find((record) => record.device_type === "ipad").deferred_reason, "device_unavailable_ipad_evidence_deferred");
assert.equal(engine.countStatus(collection.records, "manual_evidence_pending"), 4);
assert.equal(engine.countStatus(collection.records, "deferred_evidence"), 1);
assert.equal(engine.countStatus(collection.records, "plan_only_governance_evidence"), 1);
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(collection[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.releaseReadinessSummary.executionAllowed = Boolean("unsafe test fixture");
const unsafeCollection = engine.buildManualMobileVerificationEvidenceCollection(unsafeSources);
assert.equal(unsafeCollection.phase20_5_summary.unsafe_flags_count, 1);
assert.equal(unsafeCollection.phase20_5_summary.closure_ready, false);
assert.equal(unsafeCollection.phase20_5_summary.final_release_ready, false);

const db = readJson("phase20-5-manual-mobile-verification-evidence-collection-db.json");
const summaryDb = readJson("phase20-5-manual-mobile-verification-evidence-collection-summary-db.json");
assert.equal(db.phase, "Phase20-5");
assert.equal(summaryDb.phase, "Phase20-5");
assert.deepEqual(db.records, collection.records);
assert.equal(summaryDb.records, undefined);
assert.equal(db.phase20_5_summary.total_evidence_targets, db.records.length);
assert.deepEqual(db.phase20_5_summary, collection.phase20_5_summary);
assert.deepEqual(summaryDb.phase20_5_summary, collection.phase20_5_summary);
assert.equal(summaryDb.phase20_5_summary.evidence_present_count, 0);
assert.equal(summaryDb.phase20_5_summary.closure_ready, false);
assert.equal(summaryDb.phase20_5_summary.final_release_ready, false);
assert.equal(summaryDb.phase20_5_summary.unsafe_flags_count, 0);
assert.equal(summaryDb.phase20_5_summary.blocked_items_count, 0);
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
assert.ok(index.includes('id="phase20-5-manual-mobile-verification-evidence-collection-builder"'));
assert.ok(index.includes('<script src="phase20-5-manual-mobile-verification-evidence-collection-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-5-manual-mobile-verification-evidence-collection-builder"'));
assert.ok(readme.includes("Phase20-5 Manual Mobile Verification Evidence Collection"));
assert.ok(index.includes('id="phase20-4-final-release-readiness-closure-summary-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-4-final-release-readiness-closure-summary-builder"'));

console.log("phase20-5 manual mobile verification evidence collection builder tests passed");
