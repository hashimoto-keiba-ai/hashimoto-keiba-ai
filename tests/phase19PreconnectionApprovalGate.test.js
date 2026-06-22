const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-preconnection-approval-gate.js");

assert.equal(engine.PHASE, "Phase19-5");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "3633c4c");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.APPROVAL_STATUSES, ["approval_plan_ready", "approval_hold", "approval_blocked", "protected_only", "plan_only_approved"]);
assert.deepEqual(engine.SAFETY_CONTRACT_STATUSES, ["contract_ok", "contract_warning", "contract_blocked", "protected_only"]);
assert.deepEqual(engine.STOP_CONDITION_STATUSES, ["stop_clear", "stop_warning", "stop_blocked", "protected_stop"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const root = path.resolve(__dirname, "..");
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const sources = {
  blueprint: load("phase19-integration-blueprint-db.json"),
  safetyContract: load("phase19-safety-contract-db.json"),
  priorityDatabase: load("phase19-node-priority-db.json"),
  validationDatabase: load("phase19-validation-sequence-db.json"),
  simulationDatabase: load("phase19-preconnection-simulation-plan-db.json"),
  stopDatabase: load("phase19-preconnection-stop-condition-db.json"),
  resultDatabase: load("phase19-simulation-result-db.json"),
  evaluationSummary: load("phase19-simulation-evaluation-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};
const gate = engine.buildApprovalGate(sources, () => new Date("2026-06-22T00:00:00.000Z"));

assert.equal(gate.gate_status, "approval_gate_hold");
assert.equal(gate.connection_authority_issued, false);
assert.equal(gate.official_release_protected, true);
assert.equal(gate.approvals.length, 6);
assert.deepEqual(gate.approvals.map((item) => item.approval_status), ["approval_plan_ready", "protected_only", "approval_plan_ready", "approval_hold", "plan_only_approved", "plan_only_approved"]);
assert.deepEqual(gate.approval_summary, { total: 6, plan_ready: 2, hold: 1, blocked: 0, protected: 1, plan_only_approved: 2 });
for (const approval of gate.approvals) {
  for (const field of ["approval_id", "node_name", "category", "priority_id", "simulation_result_id", "approval_status", "approval_reason", "hold_reason", "blocked_reason", "required_next_validation", "safety_contract_status", "stop_condition_status", "recommended_next_action", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(approval, field), `${field} required`);
  assert.ok(engine.APPROVAL_STATUSES.includes(approval.approval_status));
  assert.ok(engine.SAFETY_CONTRACT_STATUSES.includes(approval.safety_contract_status));
  assert.ok(engine.STOP_CONDITION_STATUSES.includes(approval.stop_condition_status));
  assert.match(approval.recommended_next_action, /^Recommended:/);
  assert.deepEqual(approval.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(approval.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(approval.execution_allowed, false);
  assert.equal(approval.external_connection_allowed, false);
}
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(gate[field], false, `${field} must remain false`);
const protectedApproval = gate.approvals.find((item) => item.category === "race_course_os");
assert.equal(protectedApproval.safety_contract_status, "protected_only");
assert.equal(protectedApproval.stop_condition_status, "protected_stop");
assert.ok(gate.approvals.filter((item) => item.approval_status === "plan_only_approved").every((item) => item.external_connection_allowed === false));

const blocked = engine.buildApprovalGate({ ...sources, safetyContract: { ...sources.safetyContract, external_connection_allowed: true } });
assert.equal(blocked.gate_status, "approval_gate_blocked");
assert.equal(blocked.approval_summary.blocked, 5);
assert.equal(blocked.connection_authority_issued, false);
const missingSource = engine.buildApprovalGate({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSource.gate_status, "approval_gate_hold");
assert.equal(missingSource.approval_summary.hold, 5);

for (const source of engine.SOURCE_ASSETS) assert.ok(fs.existsSync(path.join(root, source)), `${source} source exists`);
const approvalDatabase = load("phase19-preconnection-approval-db.json");
const summaryDatabase = load("phase19-preconnection-approval-summary-db.json");
assert.equal(approvalDatabase.records.length, 6);
assert.deepEqual(approvalDatabase.records.map((item) => item.approval_status), gate.approvals.map((item) => item.approval_status));
assert.deepEqual(summaryDatabase.approval_summary, gate.approval_summary);
for (const database of [approvalDatabase, summaryDatabase]) {
  assert.equal(database.phase, "Phase19-5");
  assert.equal(database.connection_authority_issued, false);
  assert.equal(database.official_release_protected, true);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.ok(index.includes('id="phase19-preconnection-approval-gate"'));
assert.ok(index.includes('<script src="phase19-preconnection-approval-gate.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-preconnection-approval-gate"'));
assert.ok(readme.includes("Phase19-5 Global Network Pre-Connection Approval Gate"));

console.log("phase19 pre-connection approval gate tests passed");
