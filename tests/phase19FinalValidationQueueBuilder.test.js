const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-final-validation-queue-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-14");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "45f108c");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.QUEUE_STATUSES, ["queue_ready", "queue_plan_only", "queue_hold", "queue_blocked", "protected_only"]);
assert.deepEqual(engine.VALIDATION_PRIORITIES, ["P0", "P1", "P2", "P3", "protected", "blocked"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);
for (const asset of ["phase19-preconnection-risk-reassessment.js", "phase19-preconnection-risk-reassessment-db.json", "phase19-preconnection-risk-reassessment-summary-db.json", "phase19-connection-readiness-matrix-db.json", "phase19-validation-scenario-db.json", "phase19-validation-readiness-checklist-db.json", "phase19-validation-dry-run-db.json", "phase19-dry-run-result-audit-log-db.json"]) assert.ok(engine.SOURCE_ASSETS.includes(asset));

const sources = {
  reassessmentDatabase: readJson("phase19-preconnection-risk-reassessment-db.json"),
  reassessmentSummary: readJson("phase19-preconnection-risk-reassessment-summary-db.json"),
  matrixDatabase: readJson("phase19-connection-readiness-matrix-db.json"),
  scenarioDatabase: readJson("phase19-validation-scenario-db.json"),
  checklistDatabase: readJson("phase19-validation-readiness-checklist-db.json"),
  dryRunDatabase: readJson("phase19-validation-dry-run-db.json"),
  auditDatabase: readJson("phase19-dry-run-result-audit-log-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const queue = engine.buildFinalValidationQueue(sources, () => new Date("2026-06-25T00:00:00.000Z"));
assert.equal(queue.queue_builder_status, "final_validation_queue_plan_only");
assert.equal(queue.source_reassessment_status, "risk_reassessment_plan_only");
assert.equal(queue.source_matrix_status, "readiness_matrix_plan_only");
assert.equal(queue.source_audit_logger_status, "audit_logger_plan_only");
assert.equal(queue.official_release_protected, true);
assert.equal(queue.plan_only_enforced, true);
assert.equal(queue.connection_authority_issued, false);
assert.equal(queue.records.length, 6);
assert.deepEqual(queue.records.map((item) => item.queue_status), ["queue_ready", "protected_only", "queue_ready", "queue_ready", "queue_plan_only", "queue_plan_only"]);
assert.deepEqual(queue.records.map((item) => item.validation_priority), ["P0", "protected", "P0", "P0", "P2", "P2"]);
assert.deepEqual(queue.final_validation_queue_summary, {
  total: 6,
  queue_statuses: { queue_ready: 3, queue_plan_only: 2, queue_hold: 0, queue_blocked: 0, protected_only: 1 },
  validation_priorities: { P0: 3, P1: 0, P2: 2, P3: 0, protected: 1, blocked: 0 },
  risk_levels: { none: 3, low: 2, medium: 0, high: 0, protected: 1, blocked: 0 },
  unsafe_flags_count: 0,
  missing_source_count: 0,
  external_connection_blocked: true,
  auto_execution_blocked: true
});
for (const row of queue.records) {
  for (const field of ["queue_id", "reassessment_id", "audit_log_id", "node_name", "category", "priority_id", "queue_status", "validation_priority", "risk_level", "required_validation_items", "hold_reasons", "blocked_reasons", "safety_constraints", "recommended_next_audit", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.QUEUE_STATUSES.includes(row.queue_status));
  assert.ok(engine.VALIDATION_PRIORITIES.includes(row.validation_priority));
  assert.ok(Array.isArray(row.required_validation_items));
  assert.ok(Array.isArray(row.hold_reasons));
  assert.ok(Array.isArray(row.blocked_reasons));
  assert.ok(Array.isArray(row.safety_constraints));
  assert.ok(row.safety_constraints.includes("PLAN_ONLY"));
  assert.ok(row.safety_constraints.includes("execution_allowed=false"));
  assert.ok(row.safety_constraints.includes("external_connection_allowed=false"));
  assert.match(row.recommended_next_audit, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
const protectedNode = queue.records.find((item) => item.category === "race_course_os");
assert.equal(protectedNode.queue_status, "protected_only");
assert.equal(protectedNode.validation_priority, "protected");
assert.ok(protectedNode.blocked_reasons.includes("protected_release_blocks_connection_validation"));
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(queue[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.reassessmentSummary.connection_authority_issued = Boolean("unsafe test fixture");
const unsafeQueue = engine.buildFinalValidationQueue(unsafeSources);
assert.equal(unsafeQueue.queue_builder_status, "final_validation_queue_blocked");
assert.ok(unsafeQueue.final_validation_queue_summary.unsafe_flags_count > 0);
assert.equal(unsafeQueue.records.filter((item) => item.queue_status === "queue_blocked").length, 5);

const missingSourceQueue = engine.buildFinalValidationQueue({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSourceQueue.queue_builder_status, "final_validation_queue_blocked");
assert.equal(missingSourceQueue.final_validation_queue_summary.missing_source_count, 1);

const queueDb = readJson("phase19-final-validation-queue-db.json");
const summaryDb = readJson("phase19-final-validation-queue-summary-db.json");
assert.equal(queueDb.phase, "Phase19-14");
assert.deepEqual(queueDb.records, queue.records);
assert.deepEqual(summaryDb.final_validation_queue_summary, queue.final_validation_queue_summary);
assert.equal(summaryDb.queue_builder_status, "final_validation_queue_plan_only");
for (const database of [queueDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-final-validation-queue-builder"'));
assert.ok(index.includes('<script src="phase19-final-validation-queue-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-final-validation-queue-builder"'));
assert.ok(readme.includes("Phase19-14 Global Network Final Validation Queue Builder"));
assert.ok(readme.includes("Phase19-13 Global Network Pre-Connection Risk Reassessment"));
assert.equal(summaryDb.next_validation_step, "Phase19-15 Global Network Final Validation Audit Review");

console.log("phase19 final validation queue builder tests passed");
