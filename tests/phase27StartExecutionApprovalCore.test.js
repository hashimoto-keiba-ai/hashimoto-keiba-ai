"use strict";
const assert = require("assert");
const core = require("../phase27-10-phase27-start-execution-approval-core.js");
const NOW = "2027-01-01T00:00:00.000Z";
const options = { now: () => new Date(NOW) };
const human = { performedBy: "human-operator", reason: "manual confirmation", explicitConfirmation: true, performedAt: NOW };
const snapshot = { status: "accepted", id: "acceptance-1" };
function source(overrides = {}) {
  const record = {
    phase27StartPreparationStatus: "ready_for_manual_phase27_start_execution_approval",
    phase27StartPreparationResult: "approve_phase27_start_preparation", expiresAt: "2027-12-31T00:00:00.000Z",
    phase27StartPreparationSnapshot: snapshot,
    phase27StartPreparationSnapshotHash: core.computeSnapshotHash(snapshot),
    phase27StartPreparationVersion: "27.8.1", snapshotVersion: "27.8.1",
    auditTrail: [{ event: "accepted" }], phase27Started: false, ...core.SAFETY
  };
  core.REFERENCE_IDS.forEach(key => { record[key] = `${key}-1`; });
  core.REQUIRED_EVIDENCE.forEach(key => { if (!record[key]) record[key] = { id: key }; });
  core.ZERO_COUNTS.forEach(key => { record[key] = 0; });
  return { ...record, ...overrides };
}
function input(overrides = {}) {
  return {
    expiresAt: "2027-11-30T00:00:00.000Z", approvedBy: "approver", responsiblePerson: "owner",
    reviewedBy: "reviewer", confirmedBy: "confirmer", executionOperator: "operator", approvalDate: "2027-01-01",
    scheduledStartDate: "2027-02-01", scheduledStartTime: "09:00", device: "private-terminal",
    location: "private-local", approvalMethod: "manual", approvalReason: "controlled start",
    approvalScope: "Phase27", startTarget: "Phase27 core", excludedTargets: "production",
    startProcedure: "manual checklist", startConditions: "all gates green", stopConditions: "any failure",
    interruptionConditions: "operator request", rollbackConditions: "start failure", recoveryConditions: "verified recovery",
    rollbackPoint: "commit-before-start", recoveryPoint: "snapshot-before-start",
    gitStateSnapshot: { clean: true }, testResultsSnapshot: { passed: true }, safetyBoundarySnapshot: { protectedMode: true }, ...overrides
  };
}
function create() {
  const result = core.createPhase27StartExecutionApprovalRecord(source(), input(), human, options, []);
  assert.strictEqual(result.created, true, result.reasons.join(", "));
  return result.record;
}
function inProgress() {
  let record = create();
  record = core.startPhase27StartExecutionApproval(record, human, options).record;
  return core.progressPhase27StartExecutionApproval(record, human, options).record;
}
function approval(overrides = {}) {
  const value = { result: "approve_phase27_start_execution", workingTreeClean: true, mainOriginMainMatch: true,
    gitDiffCheckPassed: true, unexpectedCommit: false, unexpectedFile: false, htmlDuplicateIdCount: 0, dangerousApiCount: 0 };
  core.PREPARATION_EVIDENCE.forEach(key => { value[key] = { captured: true }; });
  core.ZERO_COUNTS.forEach(key => { value[key] = 0; });
  return { ...value, ...overrides };
}
function conditionDecision() { return { result: "conditionally_approve_phase27_start_execution", conditions: "manual condition", conditionReason: "risk", conditionOwner: "owner", conditionReviewer: "reviewer", conditionDeadline: "2027-02-01T00:00:00.000Z", conditionVerificationMethod: "checklist", conditionReleaseCriteria: "verified", conditionFailureAction: "hold", releaseRequiredBeforeStartExecution: true, correctionPlanRequired: false, rollbackPlanRequired: false, additionalEvidence: { note: "evidence" }, notes: "manual only" }; }

assert(core.PHASE279_REFERENCE, "1 dependency");
assert.strictEqual(core.extractPhase27StartExecutionApprovalCandidates([source()], [], options).length, 1, "2 normal candidate");
for (const [label, patch] of [
  ["3 non-normal", { phase27StartPreparationResult: "reject_phase27_post_creation" }],
  ["4 conditional", { phase27StartPreparationResult: "conditionally_approve_phase27_start_preparation" }],
  ...["rejected", "incomplete", "returned", "on_hold", "stopped", "cancelled", "failed"].map(status => [`5 ${status}`, { phase27StartPreparationStatus: status }]),
  ["6 invalid", { invalidatedAt: NOW }], ["7 expired", { expiresAt: "2026-01-01T00:00:00.000Z" }],
  ["8 reference", { phase27CreationApprovalId: "" }], ["9 snapshot", { phase27StartPreparationSnapshot: null }],
  ["10 hash", { phase27StartPreparationSnapshotHash: "wrong" }], ["11 version", { snapshotVersion: "wrong" }],
  ["12 audit", { auditTrail: [] }], ["13 evidence", { phase27CreationExecutionSnapshot: null }],
  ["14 failed", { failedTestCount: 1 }], ["15 not executed", { notExecutedRequiredTestCount: 1 }],
  ["16 question", { pendingQuestionCount: 1 }], ["17 correction", { pendingCorrectionCount: 1 }],
  ["18 rollback", { pendingRollbackCount: 1 }], ["19 investigation", { pendingInvestigationCount: 1 }],
  ["20 review", { pendingReviewCount: 1 }], ["21 blocking", { blockingConditionCount: 1 }],
  ["22 critical", { criticalIssueCount: 1 }], ["23 duplicate", { duplicateCount: 1 }],
  ["24 missing", { missingCount: 1 }], ["25 orphan", { orphanCount: 1 }], ["26 overwrite", { overwriteCount: 1 }],
  ["27 protected", { protectedMode: false }], ["28 plan", { planOnly: false }], ["29 private", { privateLocalOnly: false }],
  ["30 automatic", { automaticPhase27StartAllowed: true }], ["31 started", { phase27Started: true }]
]) assert.strictEqual(core.validatePhase27StartPreparation(source(patch), options).valid, false, label);
assert.strictEqual(core.createPhase27StartExecutionApprovalRecord(source(), input(), {}, options, []).created, false, "32 human missing");
assert.strictEqual(core.createPhase27StartExecutionApprovalRecord(source(), input(), { ...human, explicitConfirmation: false }, options, []).created, false, "33 confirmation");
const initial = create();
assert.strictEqual(initial.phase27StartExecutionApprovalStatus, "awaiting_manual_phase27_start_execution_approval", "34-35 create/initial");
Object.entries(core.SAFETY).forEach(([key, value]) => assert.strictEqual(initial[key], value, `36 ${key}`));
let record = core.startPhase27StartExecutionApproval(initial, human, options).record;
record = core.progressPhase27StartExecutionApproval(record, human, options).record;
assert.strictEqual(record.phase27StartExecutionApprovalStatus, "manual_phase27_start_execution_approval_in_progress", "37 normal transitions");
assert.strictEqual(core.startPhase27StartExecutionApproval(record, human, options).transitioned, false, "38 invalid transition");
let paused = core.pausePhase27StartExecutionApproval(record, human, options); assert(paused.transitioned, "39 pause");
let resumed = core.resumePhase27StartExecutionApproval(paused.record, human, options); assert(resumed.transitioned, "40 resume");
assert(core.stopPhase27StartExecutionApproval(resumed.record, human, options).transitioned, "41 stop");
assert(core.cancelPhase27StartExecutionApproval(resumed.record, human, options).transitioned, "42 cancel");
assert(core.failPhase27StartExecutionApproval(resumed.record, human, options).transitioned, "43 fail");
assert(core.updatePhase27StartExecutionApproval(resumed.record, { approvalReason: "updated" }, human, options).updated, "44 update");
assert.strictEqual(core.decidePhase27StartExecutionApproval(initial, approval(), human, options).completed, false, "45 completed first");
assert.strictEqual(core.decidePhase27StartExecutionApproval(record, { result: "unknown" }, human, options).completed, false, "46 unknown");
let approved = core.decidePhase27StartExecutionApproval(record, approval(), human, options); assert(approved.completed, "47 approve");
assert.strictEqual(core.decidePhase27StartExecutionApproval(record, { result: "conditionally_approve_phase27_start_execution" }, human, options).completed, false, "48 conditional fields");
let conditional = core.decidePhase27StartExecutionApproval(record, conditionDecision(), human, options); assert(conditional.completed, "48 conditional valid");
assert.strictEqual(core.advanceToPhase27StartExecution(conditional.record, human, options).advanced, false, "49 conditional cannot advance");
for (const [number, result] of [[50,"reject_phase27_start_execution"],[51,"start_execution_approval_incomplete"],[52,"return_for_phase27_start_preparation"],[52,"return_for_phase27_post_creation_acceptance"],[53,"correction_plan_required"],[54,"rollback_plan_required"],[55,"additional_evidence_required"],[56,"additional_review_required"],[57,"manual_investigation_required"],[58,"hold"],[59,"blocked"]]) {
  const decision = core.decidePhase27StartExecutionApproval(inProgress(), { result }, human, options);
  assert.strictEqual(decision.record.phase27StartExecutionApprovalStatus, core.RESULT_STATUS_MAP[result], `${number} ${result}`);
}
for (const [number, patch] of [[60,{workingTreeClean:false}],[61,{mainOriginMainMatch:false}],[62,{rollbackPoint:""}],[63,{recoveryPoint:""}],[64,{startTarget:""}],[65,{startConditions:""}],[66,{stopConditions:""}],[67,{unexpectedCommit:true}],[68,{unexpectedFile:true}],[69,{automaticPhase27StartAllowed:true}]]) {
  const changedRecordKeys = ["rollbackPoint","recoveryPoint","startTarget","startConditions","stopConditions","automaticPhase27StartAllowed"];
  let target = record, decisionPatch = patch;
  if (Object.keys(patch).some(key => changedRecordKeys.includes(key))) { target = { ...record, ...patch }; decisionPatch = {}; }
  assert.strictEqual(core.decidePhase27StartExecutionApproval(target, approval(decisionPatch), human, options).completed, false, `${number} approval gate`);
}
const advanced = core.advanceToPhase27StartExecution(approved.record, human, options);
assert(advanced.advanced && advanced.record.phase27StartExecutionApprovalStatus === "ready_for_manual_phase27_start_execution", "70 advance");
assert.strictEqual(core.advanceToPhase27StartExecution(record, human, options).advanced, false, "71 not approved");
assert.strictEqual(advanced.record.phase27Started, false, "72 no start");
assert.strictEqual(advanced.record.phase27StartExecutionApprovalAutomaticallyStarted, false, "73 no auto approval");
assert.strictEqual(advanced.record.automaticCorrectionAllowed, false, "74 no correction");
assert.strictEqual(advanced.record.automaticRollbackAllowed, false, "75 no rollback");
assert(!/child_process|execSync|spawnSync/.test(require("fs").readFileSync(require.resolve("../phase27-10-phase27-start-execution-approval-core.js"), "utf8")), "76 no Git process");
assert(!/writeFile|unlink|mkdir|rmdir/.test(require("fs").readFileSync(require.resolve("../phase27-10-phase27-start-execution-approval-core.js"), "utf8")), "77 no file changes");
const original = source(), originalText = JSON.stringify(original); create(); assert.strictEqual(JSON.stringify(original), originalText, "78 source unchanged");
assert.strictEqual(initial.sourceDataMutated, false, "79 earlier records unchanged");
assert.strictEqual(initial.registeredDataMutated, false, "80 registered unchanged");
assert.strictEqual(initial.appliedToPrediction || initial.appliedToLearning, false, "81 no application");
assert.strictEqual(initial.sentExternally, false, "82 no external"); assert.strictEqual(initial.publicReleaseAllowed, false, "83 no public");
assert.strictEqual(core.createPhase27StartExecutionApprovalRecord(source(), input(), human, options, [initial]).created, false, "84 duplicate");
assert(advanced.record.auditTrail.length > initial.auditTrail.length, "85 audit append"); assert(advanced.record.recordVersion > initial.recordVersion, "86 version");
const memory = { value: null, setItem(_k,v){this.value=v;}, getItem(){return this.value;} }; assert(core.savePhase27StartExecutionApprovalRecords(memory,[advanced.record]).saved, "87 save");
const loaded = core.loadPhase27StartExecutionApprovalRecords(memory); assert(loaded.loaded && loaded.records.length === 1, "87 load");
memory.value = "{"; assert.strictEqual(core.loadPhase27StartExecutionApprovalRecords(memory).loaded, false, "88 corrupt");
const external = loaded.records[0]; try { external.phase27Started = true; } catch (_) {} assert.strictEqual(advanced.record.phase27Started, false, "89 immutable output");
const expiring = { ...initial, expiresAt: "2026-01-01T00:00:00.000Z" }; assert(core.expirePhase27StartExecutionApproval(expiring, options).expired, "90 expire safely");
const invalid = core.invalidatePhase27StartExecutionApproval(approved.record, human, options); assert(invalid.transitioned, "91 invalidate"); assert.strictEqual(core.advanceToPhase27StartExecution(invalid.record, human, options).advanced, false, "91 no advance");
core.resetRegistry(); assert.strictEqual(core.createPhase27StartExecutionApprovalRecord(source(), input(), human, options, []).record.phase27StartExecutionApprovalId, "phase27-start-execution-approval-1", "92 reset");
console.log("phase27StartExecutionApprovalCore.test.js: PASS (92 requirements)");
