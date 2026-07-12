const assert = require("assert");
const engine = require("../phase22-19-manual-retrial-entry-start-approval-record-core.js");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    dump() { return { ...store }; }
  };
}

function readyCheck(overrides = {}) {
  return {
    creationCheckId: "check-1",
    sourceRetrialPlanId: "retrial-1",
    sourceEvaluationId: "eval-1",
    sourceTrialId: "trial-old",
    sourcePlanId: "plan-1",
    targetApprovalId: "approval-1",
    targetImprovementRuleId: "rule-1",
    candidateTrialId: "trial-retry-1",
    candidateTrialName: "Retry 1",
    creationStatus: "start_ready",
    creationDecision: "ready_for_manual_trial_entry",
    candidateTrial: {
      candidateTrialId: "trial-retry-1",
      candidateTrialName: "Retry 1",
      sourceRetrialPlanId: "retrial-1",
      sourceEvaluationId: "eval-1",
      sourceTrialId: "trial-old",
      sourcePlanId: "plan-1",
      targetApprovalId: "approval-1",
      targetImprovementRuleId: "rule-1",
      targetRaceKeys: ["race-1"],
      observationStartDate: "2026-07-20",
      observationEndDate: "2026-08-20",
      maximumRaceCount: 3,
      warningThreshold: 2
    },
    ...overrides
  };
}

const creationStore = {
  schemaVersion: 1,
  savedAt: "2026-07-12T10:00:00.000Z",
  creationChecks: [
    readyCheck(),
    readyCheck({ creationCheckId: "not-ready", candidateTrialId: "not-ready-trial", creationStatus: "approved" })
  ]
};

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.manualRetrialEntryStartApprovalRecord.v1");
assert.strictEqual(engine.eligibleCreationChecks(creationStore).length, 1);
assert.strictEqual(engine.escapeHtml("<x>&"), "&lt;x&gt;&amp;");

let record = engine.buildEntryRecordFromCreationCheck(readyCheck());
assert.strictEqual(record.registeredTrialId, "trial-retry-1");
assert.strictEqual(record.phase2215TrialSnapshot.trialStatus, "awaiting_start_approval");
assert.strictEqual(record.phase2215TrialSnapshot.startedAt, "", "Phase22-19 must not start the trial");
assert.ok(engine.validateEntryRecord(record, creationStore, { trials: [] }, { entryRecords: [record] }).ok);

const registration = engine.recordManualRegistration(record, "Owner", "2026-07-12T11:00:00", "manual entry", "screen record");
assert.strictEqual(registration.recorded, true);
record = registration.record;
assert.strictEqual(record.entryStatus, "registered");
assert.strictEqual(record.entryDecision, "registered_for_manual_start_approval");
assert.ok(engine.validateEntryRecord(record, creationStore, { trials: [] }, { entryRecords: [record] }).ok);

const submitted = engine.submitForStartApproval(record);
assert.strictEqual(submitted.submitted, true);
record = submitted.record;
assert.strictEqual(record.entryStatus, "awaiting_start_approval");
assert.strictEqual(engine.approveManualStart(record, "", "2026-07-12T12:00:00", "ok").approved, false);

const approved = engine.approveManualStart(record, "Owner", "2026-07-12T12:00:00", "human approved");
assert.strictEqual(approved.approved, true);
record = approved.record;
assert.strictEqual(record.entryStatus, "start_approved");
assert.strictEqual(record.entryDecision, "start_approved");
assert.strictEqual(record.phase2215TrialSnapshot.startedAt, "", "start approval must not auto-start the trial");
assert.ok(engine.validateEntryRecord(record, creationStore, { trials: [] }, { entryRecords: [record] }).ok);
assert.strictEqual(engine.transitionEntryStatus(record, "registered").transitioned, false, "terminal approval is locked");

assert.ok(!engine.validateEntryRecord(record, creationStore, { trials: [{ trialId: "trial-retry-1" }] }, { entryRecords: [record] }).ok, "duplicate Phase22-15 trial is rejected");
assert.ok(!engine.validateSource({ ...record, sourceRetrialPlanId: "other" }, creationStore).ok, "source mismatch is rejected");

const storage = memoryStorage({ [engine.CREATION_CHECK_STORAGE_KEY]: JSON.stringify(creationStore) });
const loaded = engine.loadEntryStore(storage, creationStore).store;
assert.strictEqual(loaded.entryRecords.length, 1);
const sourceBefore = storage.getItem(engine.CREATION_CHECK_STORAGE_KEY);
assert.strictEqual(engine.saveEntryStore(storage, { ...loaded, entryRecords: [record] }, new Date("2026-07-12T13:00:00.000Z")).saved, true);
assert.strictEqual(storage.getItem(engine.CREATION_CHECK_STORAGE_KEY), sourceBefore, "Phase22-18 source is not mutated");
assert.ok(engine.generatePlainText({ entryRecords: [record] }).includes("no auto start"));

console.log("phase22ManualRetrialEntryStartApprovalRecordCore tests passed");