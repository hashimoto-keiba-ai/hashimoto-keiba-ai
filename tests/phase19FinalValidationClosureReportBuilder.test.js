const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-final-validation-closure-report-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-16");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "c7df497");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.IPAD_VALIDATION_STATUS, "deferred");
assert.deepEqual(engine.CLOSURE_STATUSES, ["closure_ready", "closure_deferred", "closure_hold", "closure_blocked", "protected_only"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);
for (const asset of ["phase19-final-validation-queue-db.json", "phase19-final-validation-queue-summary-db.json", "phase19-final-validation-audit-review-db.json", "phase19-final-validation-audit-review-summary-db.json", "index.html", "private-local.html", "README.md"]) assert.ok(engine.SOURCE_ASSETS.includes(asset));

const sources = {
  queueDatabase: readJson("phase19-final-validation-queue-db.json"),
  queueSummary: readJson("phase19-final-validation-queue-summary-db.json"),
  auditReviewDatabase: readJson("phase19-final-validation-audit-review-db.json"),
  auditReviewSummary: readJson("phase19-final-validation-audit-review-summary-db.json"),
  textSources: {
    "index.html": readText("index.html"),
    "private-local.html": readText("private-local.html"),
    "README.md": readText("README.md")
  },
  availableSources: engine.SOURCE_ASSETS
};

const report = engine.buildFinalValidationClosureReport(sources, () => new Date("2026-06-27T00:00:00.000Z"));
assert.equal(report.closure_report_status, "final_validation_closed");
assert.equal(report.source_queue_builder_status, "final_validation_queue_plan_only");
assert.equal(report.source_audit_review_status, "final_validation_audit_review_plan_only");
assert.equal(report.official_release_protected, true);
assert.equal(report.plan_only_enforced, true);
assert.equal(report.connection_authority_issued, false);
assert.equal(report.records.length, 6);
assert.deepEqual(report.records.map((item) => item.closure_status), ["closure_ready", "protected_only", "closure_ready", "closure_ready", "closure_deferred", "closure_deferred"]);
assert.deepEqual(report.final_validation_closure_summary, {
  total: 6,
  closure_statuses: {
    closure_ready: 3,
    closure_deferred: 2,
    closure_hold: 0,
    closure_blocked: 0,
    protected_only: 1
  },
  final_validation_closed: true,
  queue_ready_count: 3,
  audit_passed_count: 3,
  unresolved_issue_count: 0,
  unsafe_flags_count: 0,
  protected_item_count: 1,
  plan_only_item_count: 2,
  summary_alignment_ok: true,
  source_coverage_ok: true,
  ui_readme_checks: {
    index_phase19_16_link: true,
    private_local_phase19_16_link: true,
    readme_phase19_16_section: true,
    phase19_14_link_retained: true,
    phase19_15_link_retained: true
  },
  closure_ready: true,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP,
  ipad_validation_status: "deferred",
  external_connection_blocked: true,
  auto_execution_blocked: true
});
for (const row of report.records) {
  for (const field of ["closure_id", "queue_id", "audit_review_id", "reassessment_id", "audit_log_id", "node_name", "category", "priority_id", "closure_status", "queue_status", "audit_review_status", "validation_priority", "risk_level", "closure_findings", "deferred_items", "safety_constraints", "recommended_next_step", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.CLOSURE_STATUSES.includes(row.closure_status));
  assert.ok(row.closure_findings.includes("queue_and_audit_summaries_aligned"));
  assert.ok(row.closure_findings.includes("unsafe_flags_absent"));
  assert.ok(row.safety_constraints.includes("closure_report_only"));
  assert.ok(row.safety_constraints.includes("ipad_validation_deferred"));
  assert.match(row.recommended_next_step, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
const protectedNode = report.records.find((item) => item.category === "race_course_os");
assert.equal(protectedNode.closure_status, "protected_only");
assert.ok(protectedNode.deferred_items.includes("protected_only_item_retained_read_only"));
const planOnlyNodes = report.records.filter((item) => item.closure_status === "closure_deferred");
assert.equal(planOnlyNodes.length, 2);
for (const item of planOnlyNodes) assert.ok(item.deferred_items.includes("plan_only_item_retained_for_future_review"));
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(report[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.auditReviewSummary.connection_authority_issued = Boolean("unsafe test fixture");
const unsafeReport = engine.buildFinalValidationClosureReport(unsafeSources);
assert.equal(unsafeReport.closure_report_status, "final_validation_closure_blocked");
assert.equal(unsafeReport.final_validation_closure_summary.closure_ready, false);
assert.ok(unsafeReport.final_validation_closure_summary.unsafe_flags_count > 0);
assert.ok(unsafeReport.final_validation_closure_summary.unresolved_issue_count > 0);
assert.equal(unsafeReport.final_validation_closure_summary.ipad_validation_status, "deferred");

const missingSourceReport = engine.buildFinalValidationClosureReport({ ...sources, availableSources: engine.SOURCE_ASSETS.filter((asset) => asset !== "README.md") });
assert.equal(missingSourceReport.final_validation_closure_summary.source_coverage_ok, false);
assert.equal(missingSourceReport.final_validation_closure_summary.closure_ready, false);
assert.ok(missingSourceReport.missing_source_assets.includes("README.md"));

const misalignedSources = JSON.parse(JSON.stringify(sources));
misalignedSources.auditReviewSummary.final_validation_audit_review_summary.total = 99;
const misalignedReport = engine.buildFinalValidationClosureReport(misalignedSources);
assert.equal(misalignedReport.final_validation_closure_summary.summary_alignment_ok, false);
assert.equal(misalignedReport.final_validation_closure_summary.closure_ready, false);

const closureDb = readJson("phase19-final-validation-closure-report-db.json");
const summaryDb = readJson("phase19-final-validation-closure-report-summary-db.json");
assert.equal(closureDb.phase, "Phase19-16");
assert.equal(summaryDb.phase, "Phase19-16");
assert.deepEqual(closureDb.records, report.records);
assert.equal(summaryDb.records, undefined);
assert.deepEqual(closureDb.final_validation_closure_summary, report.final_validation_closure_summary);
assert.deepEqual(summaryDb.final_validation_closure_summary, report.final_validation_closure_summary);
assert.equal(summaryDb.final_validation_closure_summary.final_validation_closed, true);
assert.equal(summaryDb.final_validation_closure_summary.closure_ready, true);
assert.equal(summaryDb.final_validation_closure_summary.ipad_validation_status, "deferred");
for (const database of [closureDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-final-validation-closure-report-builder"'));
assert.ok(index.includes('<script src="phase19-final-validation-closure-report-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-final-validation-closure-report-builder"'));
assert.ok(readme.includes("Phase19-16 Global Network Final Validation Closure Report"));
assert.ok(index.includes('id="phase19-final-validation-audit-review-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase19-final-validation-audit-review-builder"'));
assert.ok(index.includes('id="phase19-final-validation-queue-builder"'));
assert.ok(privateLocal.includes('href="index.html#phase19-final-validation-queue-builder"'));

console.log("phase19 final validation closure report builder tests passed");
