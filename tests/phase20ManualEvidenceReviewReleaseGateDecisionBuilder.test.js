const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-6-manual-evidence-review-release-gate-decision-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase20-6");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "f6cb8fe");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.RELEASE_GATE_STATUS, "manual_evidence_review_release_gate_decision_plan_only");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.NEXT_RECOMMENDED_STEP, "Phase20-7 Final Manual Device Confirmation Checklist");
assert.deepEqual(engine.REVIEW_STATUSES, ["manual_review_pending_or_observed", "manual_review_pending", "deferred_review", "plan_only_gate_control_confirmed"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  resultCaptureDb: readJson("phase20-3-mobile-verification-result-capture-closure-plan-db.json"),
  resultCaptureSummary: readJson("phase20-3-mobile-verification-result-capture-closure-plan-summary-db.json"),
  releaseReadinessDb: readJson("phase20-4-final-release-readiness-closure-summary-db.json"),
  releaseReadinessSummary: readJson("phase20-4-final-release-readiness-closure-summary-summary-db.json"),
  evidenceCollectionDb: readJson("phase20-5-manual-mobile-verification-evidence-collection-db.json"),
  evidenceCollectionSummary: readJson("phase20-5-manual-mobile-verification-evidence-collection-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  }
};

const decision = engine.buildManualEvidenceReviewReleaseGateDecision(sources, () => new Date("2026-06-27T08:00:00.000Z"));
assert.equal(decision.release_gate_status, "manual_evidence_review_release_gate_decision_plan_only");
assert.equal(decision.source_closure_ready, false);
assert.equal(decision.source_final_release_ready, false);
assert.equal(decision.protected_mode, true);
assert.equal(decision.plan_only, true);
assert.equal(decision.connection_authority_issued, false);
assert.equal(decision.records.length, 6);
assert.deepEqual(decision.records.map((record) => record.review_status), ["manual_review_pending_or_observed", "manual_review_pending", "deferred_review", "manual_review_pending_or_observed", "manual_review_pending_or_observed", "plan_only_gate_control_confirmed"]);
assert.deepEqual(decision.phase20_6_summary, {
  total_review_targets: 6,
  manual_review_pending_or_observed_count: 3,
  manual_review_pending_count: 4,
  iphone_manual_review_pending_count: 1,
  deferred_review_count: 1,
  plan_only_gate_control_confirmed_count: 1,
  evidence_present_count: 0,
  release_gate_open: false,
  closure_ready: false,
  final_release_ready: false,
  blocked_items_count: 0,
  unsafe_flags_count: 0,
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  summary_alignment_ok: true,
  ui_readme_checks: {
    index_phase20_6_panel: true,
    private_local_phase20_6_card: true,
    readme_phase20_6_section: true,
    phase20_3_link_retained: true,
    phase20_4_link_retained: true,
    phase20_5_link_retained: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of decision.records) {
  for (const field of ["id", "source_evidence_id", "target_name", "device_type", "previous_evidence_collection_status", "review_status", "evidence_present", "release_gate_open", "closure_ready", "final_release_ready", "manual_review_required", "release_gate_decision", "review_reason", "evidence_fields_reviewed", "source_evidence_collection_id", "source_result_capture_plan_id", "source_release_readiness_summary_id", "protected_mode", "plan_only", "execution_allowed", "auto_execution_allowed", "external_connection_allowed", "safety_constraints", "next_action", "blocked_actions", "allowed_actions"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.ok(engine.REVIEW_STATUSES.includes(record.review_status));
  assert.equal(record.evidence_present, false);
  assert.equal(record.release_gate_open, false);
  assert.equal(record.closure_ready, false);
  assert.equal(record.final_release_ready, false);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.ok(record.safety_constraints.includes("no_release_gate_open_without_manual_evidence"));
  assert.ok(record.safety_constraints.includes("no_auto_device_validation"));
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}
assert.equal(decision.records.find((record) => record.device_type === "github_pages").review_status, "manual_review_pending_or_observed");
assert.equal(decision.records.find((record) => record.device_type === "pc_browser").review_status, "manual_review_pending_or_observed");
assert.equal(decision.records.find((record) => record.device_type === "private_local").review_status, "manual_review_pending_or_observed");
assert.equal(decision.records.find((record) => record.device_type === "iphone").review_status, "manual_review_pending");
assert.equal(decision.records.find((record) => record.device_type === "ipad").review_status, "deferred_review");
assert.equal(decision.records.find((record) => record.device_type === "governance").review_status, "plan_only_gate_control_confirmed");
assert.equal(engine.countStatus(decision.records, "manual_review_pending_or_observed"), 3);
assert.equal(engine.countStatus(decision.records, "manual_review_pending"), 1);
assert.equal(engine.countStatus(decision.records, "deferred_review"), 1);
assert.equal(engine.countStatus(decision.records, "plan_only_gate_control_confirmed"), 1);
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "execution_allowed", "external_connection_allowed"]) assert.equal(decision[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.evidenceCollectionSummary.executionAllowed = Boolean("unsafe test fixture");
const unsafeDecision = engine.buildManualEvidenceReviewReleaseGateDecision(unsafeSources);
assert.equal(unsafeDecision.phase20_6_summary.unsafe_flags_count, 1);
assert.equal(unsafeDecision.phase20_6_summary.release_gate_open, false);
assert.equal(unsafeDecision.phase20_6_summary.closure_ready, false);
assert.equal(unsafeDecision.phase20_6_summary.final_release_ready, false);

const db = readJson("phase20-6-manual-evidence-review-release-gate-decision-db.json");
const summaryDb = readJson("phase20-6-manual-evidence-review-release-gate-decision-summary-db.json");
assert.equal(db.phase, "Phase20-6");
assert.equal(summaryDb.phase, "Phase20-6");
assert.deepEqual(db.records, decision.records);
assert.equal(summaryDb.records, undefined);
assert.equal(db.phase20_6_summary.total_review_targets, db.records.length);
assert.deepEqual(db.phase20_6_summary, decision.phase20_6_summary);
assert.deepEqual(summaryDb.phase20_6_summary, decision.phase20_6_summary);
assert.equal(summaryDb.phase20_6_summary.evidence_present_count, 0);
assert.equal(summaryDb.phase20_6_summary.release_gate_open, false);
assert.equal(summaryDb.phase20_6_summary.closure_ready, false);
assert.equal(summaryDb.phase20_6_summary.final_release_ready, false);
assert.equal(summaryDb.phase20_6_summary.unsafe_flags_count, 0);
assert.equal(summaryDb.phase20_6_summary.blocked_items_count, 0);
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
assert.ok(index.includes('id="phase20-6-manual-evidence-review-release-gate-decision-builder"'));
assert.ok(index.includes('<script src="phase20-6-manual-evidence-review-release-gate-decision-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-6-manual-evidence-review-release-gate-decision-builder"'));
assert.ok(readme.includes("Phase20-6 Manual Evidence Review and Release Gate Decision"));
assert.ok(index.includes('id="phase20-5-manual-mobile-verification-evidence-collection-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase20-5-manual-mobile-verification-evidence-collection-builder"'));

console.log("phase20-6 manual evidence review release gate decision builder tests passed");
