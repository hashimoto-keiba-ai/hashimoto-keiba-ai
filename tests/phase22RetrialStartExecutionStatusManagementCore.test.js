const assert = require("assert");
const fs = require("fs");
const path = require("path");
const engine = require("../phase22-20-retrial-start-execution-status-management-core.js");

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; }, setItem(key, value) { data[key] = String(value); }, dump() { return { ...data }; } };
}
function read(file) { return fs.readFileSync(path.join(__dirname, "..", file), "utf8"); }
function approved(overrides = {}) { return { entryRecordId: "entry-1", registeredTrialId: "retry-1", registeredTrialName: "Retry 1", sourceCreationCheckId: "check-1", sourceRetrialPlanId: "plan-1", entryStatus: "start_approved", entryDecision: "start_approved", startApprover: "Approver", startApprovedAt: "2026-07-19T09:00:00", startApprovalReason: "safe to start", ...overrides }; }

const sourceStore = { schemaVersion: 1, savedAt: "2026-07-19T09:00:00.000Z", entryRecords: [approved(), approved({ entryRecordId: "pending", registeredTrialId: "retry-2", entryStatus: "awaiting_start_approval", entryDecision: "pending" }), approved({ entryRecordId: "incomplete", registeredTrialId: "retry-3", startApprover: "" })] };
assert.strictEqual(engine.SOURCE_STORAGE_KEY, "hashimotoKeibaAi.phase22.manualRetrialEntryStartApprovalRecord.v1");
assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.retrialStartExecutionStatusManagement.v1");
assert.deepStrictEqual(engine.STATUSES, ["awaiting_manual_start", "started", "observing", "paused", "stopped", "completed", "abnormality_detected", "cancelled", "expired"]);
assert.strictEqual(engine.eligibleSourceRecords(sourceStore).length, 1, "only complete Phase22-19 start approvals are eligible");

let record = engine.buildExecutionRecord(approved());
assert.strictEqual(record.status, "awaiting_manual_start");
assert.strictEqual(record.startedAt, "");
assert.ok(engine.validateRecord(record, sourceStore).ok);
assert.strictEqual(engine.transitionStatus(record, "observing", "Owner", "2026-07-19T10:00:00", "observe").reason, "invalid_transition");
assert.strictEqual(engine.transitionStatus(record, "started", "", "2026-07-19T10:00:00", "start").reason, "missing_required_fields");

let result = engine.transitionStatus(record, "started", "Owner", "2026-07-19T10:00:00", "manual start", "checked");
assert.ok(result.transitioned); record = result.record;
assert.strictEqual(record.startedBy, "Owner"); assert.strictEqual(record.startedAt, "2026-07-19T10:00:00"); assert.strictEqual(record.startReason, "manual start");
result = engine.transitionStatus(record, "observing", "Owner", "2026-07-19T10:05:00", "begin observation"); assert.ok(result.transitioned); record = result.record;
result = engine.transitionStatus(record, "paused", "Owner", "2026-07-19T10:10:00", "manual pause", "weather"); assert.ok(result.transitioned); record = result.record;
assert.strictEqual(engine.transitionStatus(record, "started", "Owner", "2026-07-19T10:11:00", "bad resume").reason, "invalid_transition");
result = engine.transitionStatus(record, "observing", "Owner", "2026-07-19T10:15:00", "manual resume"); assert.ok(result.transitioned); record = result.record;
result = engine.transitionStatus(record, "completed", "Owner", "2026-07-19T11:00:00", "manual completion"); assert.ok(result.transitioned); record = result.record;
assert.strictEqual(engine.transitionStatus(record, "observing", "Owner", "2026-07-19T11:01:00", "resume").reason, "terminal_locked");
assert.strictEqual(record.history.length, 5); assert.ok(engine.validateRecord(record, sourceStore).ok);
assert.ok(!engine.validateRecord({ ...record, safety: { ...record.safety, autoStart: true } }, sourceStore).ok, "unsafe flags rejected");

for (const terminal of engine.TERMINAL_STATUSES) {
  let candidate = engine.buildExecutionRecord(approved());
  if (!["cancelled", "expired"].includes(terminal)) candidate = engine.transitionStatus(candidate, "started", "Owner", "2026-07-19T10:00:00", "start").record;
  const terminalResult = engine.transitionStatus(candidate, terminal, "Owner", "2026-07-19T11:00:00", terminal);
  assert.ok(terminalResult.transitioned, `${terminal} transition`);
  assert.strictEqual(engine.transitionStatus(terminalResult.record, "observing", "Owner", "2026-07-19T12:00:00", "resume").reason, "terminal_locked");
}

const storage = memoryStorage({ [engine.SOURCE_STORAGE_KEY]: JSON.stringify(sourceStore) });
const sourceBefore = storage.getItem(engine.SOURCE_STORAGE_KEY);
const loaded = engine.loadStore(storage, sourceStore).store; assert.strictEqual(loaded.executionRecords.length, 1);
loaded.executionRecords[0] = record;
assert.ok(engine.saveStore(storage, loaded, new Date("2026-07-19T12:00:00.000Z")).saved);
assert.strictEqual(storage.getItem(engine.SOURCE_STORAGE_KEY), sourceBefore, "Phase22-19 remains unchanged");
assert.ok(engine.loadStore(memoryStorage({ [engine.STORAGE_KEY]: "{bad" }), sourceStore).rejected);
assert.ok(engine.generatePlainText(loaded).includes("observing -> completed"));

const index = read("index.html"), local = read("private-local.html"), css = read("dashboard.css"), readme = read("README.md");
assert.ok(index.includes('id="phase22-retrial-execution-status-core"')); assert.ok(index.indexOf("phase22-19-manual-retrial-entry-start-approval-record-core.js") < index.indexOf("phase22-20-retrial-start-execution-status-management-core.js"));
assert.ok(local.includes('href="index.html#phase22-retrial-execution-status-core"')); assert.ok(local.includes("phase22-20-retrial-start-execution-status-management-core.js"));
assert.ok(css.includes(".phase22-retrial-execution-core")); assert.ok(readme.includes(engine.STORAGE_KEY)); assert.ok(readme.includes("terminal"));
const safety = engine.buildSafety(); ["planOnly", "protectedMode", "privateLocal", "manualStartOnly", "manualStatusOnly"].forEach((key) => assert.strictEqual(safety[key], true)); ["automaticPurchase", "automaticApply", "automaticLearning", "automaticUpdate", "autoStart", "autoStop", "autoComplete", "productionPredictionMutation", "bettingMutation", "ruleApplicationMutation", "learningMutation", "sourceMutation", "publicUrl", "githubPages", "externalApi"].forEach((key) => assert.strictEqual(safety[key], false));
console.log("phase22RetrialStartExecutionStatusManagementCore tests passed");
