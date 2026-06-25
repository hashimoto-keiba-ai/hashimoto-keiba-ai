const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-final-validation-audit-review-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-15");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "7ec8221");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.AUDIT_REVIEW_STATUSES, ["audit_review_passed", "audit_review_plan_only", "audit_review_hold", "audit_review_blocked", "protected_only"]);
assert.deepEqual(engine.QUEUE_STATUSES, ["queue_ready", "queue_plan_only", "queue_hold", "queue_blocked", "protected_only"]);
assert.deepEqual(engine.VALIDATION_PRIORITIES, ["P0", "P1", "P2", "P3", "protected", "blocked"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);
for (const asset of ["phase19-final-validation-queue-builder.js", "phase19-final-validation-queue-db.json", "phase19-final-validation-queue-summary-db.json"]) assert.ok(engine.SOURCE_ASSETS.includes(asset));

const sources = {
  queueDatabase: readJson("phase19-final-validation-queue-db.json"),
  queueSummary: readJson("phase19-final-validation-queue-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const review = engine.buildFinalValidationAuditReview(sources, () => new Date("2026-06-25T01:00:00.000Z"));
assert.equal(review.audit_review_status, "final_validation_audit_review_plan_only");
assert.equal(review.source_queue_builder_status, "final_validation_queue_plan_only");
assert.equal(review.source_queue_summary_status, "final_validation_queue_plan_only");
assert.equal(review.official_release_protected, true);
assert.equal(review.plan_only_enforced, true);
assert.equal(review.connection_authority_issued, false);
assert.equal(review.records.length, 6);
assert.deepEqual(review.records.map((item) => item.audit_review_status), ["audit_review_passed", "protected_only", "audit_review_passed", "audit_review_passed", "audit_review_plan_only", "audit_review_plan_only"]);
assert.deepEqual(review.final_validation_audit_review_summary, {
  total: 6,
  audit_review_statuses: {
    audit_review_passed: 3,
    audit_review_plan_only: 2,
    audit_review_hold: 0,
    audit_review_blocked: 0,
    protected_only: 1
  },
  duplicate_queue_id_count: 0,
  missing_required_field_count: 0,
  invalid_priority_count: 0,
  invalid_status_count: 0,
  summary_alignment_ok: true,
  unsafe_flags_count: 0,
  missing_source_count: 0,
  external_connection_blocked: true,
  auto_execution_blocked: true
});
for (const row of review.records) {
  for (const field of ["audit_review_id", "queue_id", "reassessment_id", "audit_log_id", "node_name", "category", "priority_id", "audit_review_status", "queue_status", "validation_priority", "risk_level", "integrity_checks", "consistency_findings", "duplicate_findings", "missing_field_findings", "priority_findings", "validation_status_findings", "safety_constraints", "recommended_next_audit", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.AUDIT_REVIEW_STATUSES.includes(row.audit_review_status));
  assert.ok(row.integrity_checks.includes("required_fields_checked"));
  assert.ok(row.consistency_findings.includes("queue_summary_aligned"));
  assert.ok(row.duplicate_findings.includes("no_duplicate_queue_id"));
  assert.deepEqual(row.missing_field_findings, []);
  assert.ok(row.priority_findings.includes("validation_priority_consistent"));
  assert.ok(row.safety_constraints.includes("audit_review_only"));
  assert.match(row.recommended_next_audit, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
const protectedNode = review.records.find((item) => item.category === "race_course_os");
assert.equal(protectedNode.audit_review_status, "protected_only");
assert.ok(protectedNode.validation_status_findings.includes("protected_only_priority_confirmed"));
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(review[field], false, `${field} must remain false`);

const duplicateSources = JSON.parse(JSON.stringify(sources));
duplicateSources.queueDatabase.records[1].queue_id = duplicateSources.queueDatabase.records[0].queue_id;
const duplicateReview = engine.buildFinalValidationAuditReview(duplicateSources);
assert.equal(duplicateReview.audit_review_status, "final_validation_audit_review_blocked");
assert.equal(duplicateReview.final_validation_audit_review_summary.duplicate_queue_id_count, 1);
assert.equal(duplicateReview.records.filter((item) => item.audit_review_status === "audit_review_blocked").length, 1);

const missingFieldSources = JSON.parse(JSON.stringify(sources));
delete missingFieldSources.queueDatabase.records[0].required_validation_items;
const missingFieldReview = engine.buildFinalValidationAuditReview(missingFieldSources);
assert.equal(missingFieldReview.records[0].audit_review_status, "audit_review_blocked");
assert.equal(missingFieldReview.final_validation_audit_review_summary.missing_required_field_count, 1);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.queueSummary.connection_authority_issued = Boolean("unsafe test fixture");
const unsafeReview = engine.buildFinalValidationAuditReview(unsafeSources);
assert.equal(unsafeReview.audit_review_status, "final_validation_audit_review_blocked");
assert.ok(unsafeReview.final_validation_audit_review_summary.unsafe_flags_count > 0);

const reviewDb = readJson("phase19-final-validation-audit-review-db.json");
const summaryDb = readJson("phase19-final-validation-audit-review-summary-db.json");
assert.equal(reviewDb.phase, "Phase19-15");
assert.deepEqual(reviewDb.records, review.records);
assert.deepEqual(summaryDb.final_validation_audit_review_summary, review.final_validation_audit_review_summary);
assert.equal(summaryDb.audit_review_status, "final_validation_audit_review_plan_only");
for (const database of [reviewDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-final-validation-audit-review-builder"'));
assert.ok(index.includes('<script src="phase19-final-validation-audit-review-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-final-validation-audit-review-builder"'));
assert.ok(readme.includes("Phase19-15 Global Network Final Validation Audit Review"));
assert.ok(readme.includes("Phase19-14 Global Network Final Validation Queue Builder"));
assert.equal(summaryDb.next_validation_step, "Phase19-16 Global Network Final Validation Closure Report");

console.log("phase19 final validation audit review builder tests passed");
