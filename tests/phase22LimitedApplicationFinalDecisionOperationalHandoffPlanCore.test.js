const assert = require("assert");
const core = require("../phase22-22-limited-application-final-decision-operational-handoff-plan-core.js");

function sourceStore(result = "improved", status = "finalized") {
  return {
    savedAt: "2026-07-19T10:00:00+09:00",
    comparisons: [{
      comparisonId: "phase22-21-comparison-exec-1",
      evaluationStatus: status,
      finalResult: result,
      finalEvaluator: "橋本",
      finalEvaluatedAt: "2026-07-19T09:30:00+09:00",
      finalEvaluationReason: "再試験比較を確認",
      sourceInitialEvaluationId: "eval-1",
      sourceExecutionRecordId: "exec-1",
      registeredTrialId: "trial-1"
    }]
  };
}

{
  const store = core.normalizeStore({}, sourceStore());
  assert.strictEqual(store.records.length, 1);
  assert.strictEqual(store.records[0].recommendedDecision, "limited_application_approved");
  assert.strictEqual(store.records[0].status, "draft");
  assert.ok(core.isSafetyValid(store.records[0].safety));
}

{
  assert.strictEqual(core.eligibleSources(sourceStore("improved", "reviewed")).length, 0);
  assert.strictEqual(core.defaultRecommendation("equivalent").decision, "additional_retrial_required");
  assert.strictEqual(core.defaultRecommendation("worsened").decision, "operation_stop");
  assert.strictEqual(core.defaultRecommendation("insufficient_data").decision, "on_hold");
}

{
  let record = core.normalizeStore({}, sourceStore()).records[0];
  let result = core.transition(record, "awaiting_decision", "橋本", "2026-07-19T10:05:00+09:00", "判定開始");
  assert.strictEqual(result.transitioned, true);
  record = result.record;
  result = core.transition(record, "decision_recorded", "橋本", "2026-07-19T10:06:00+09:00", "判定確定");
  assert.strictEqual(result.transitioned, false);
  assert.strictEqual(result.reason, "decision_required");

  const decided = core.setDecision(record, "limited_application_approved", "橋本", "2026-07-19T10:07:00+09:00", "限定適用可");
  assert.strictEqual(decided.updated, true);
  record = decided.record;
  result = core.transition(record, "decision_recorded", "橋本", "2026-07-19T10:08:00+09:00", "人間判定記録済み");
  assert.strictEqual(result.transitioned, true);
  record = result.record;

  result = core.transition(record, "awaiting_handoff", "橋本", "2026-07-19T10:09:00+09:00", "引継ぎ準備");
  assert.strictEqual(result.transitioned, true);
  record = result.record;

  const incomplete = core.setHandoff(record, { owner: "橋本" }, "橋本", "2026-07-19T10:10:00+09:00", "引継ぎ記録");
  assert.strictEqual(incomplete.updated, false);
  assert.strictEqual(incomplete.reason, "incomplete_handoff");

  const handoff = core.setHandoff(record, {
    owner: "橋本",
    backupOwner: "西戸",
    startAt: "2026-07-20T09:00:00+09:00",
    reviewAt: "2026-07-27T09:00:00+09:00",
    scope: "限定対象のみ",
    monitoringItems: "異常件数・有効観測数",
    stopConditions: "異常検知時に手動停止",
    rollbackProcedure: "手動で限定適用前状態へ戻す",
    communicationPlan: "関係者へ手動共有"
  }, "橋本", "2026-07-19T10:11:00+09:00", "引継ぎ計画作成");
  assert.strictEqual(handoff.updated, true);
  record = handoff.record;

  result = core.transition(record, "handoff_planned", "橋本", "2026-07-19T10:12:00+09:00", "引継ぎ計画確認");
  assert.strictEqual(result.transitioned, true);
  record = result.record;
  result = core.transition(record, "finalized", "橋本", "2026-07-19T10:13:00+09:00", "最終確定");
  assert.strictEqual(result.transitioned, true);
  assert.strictEqual(core.setDecision(result.record, "operation_stop", "橋本", "2026-07-19T10:14:00+09:00", "変更").reason, "terminal_locked");
  assert.ok(core.buildAuditText(result.record).includes("PLAN_ONLY=true"));
}

{
  const memory = new Map();
  const storage = { getItem: (key) => memory.has(key) ? memory.get(key) : null, setItem: (key, value) => memory.set(key, value) };
  const store = core.normalizeStore({}, sourceStore());
  const saved = core.saveStore(store, storage, "2026-07-19T10:20:00+09:00");
  assert.strictEqual(saved.saved, true);
  assert.ok(memory.has(core.STORAGE_KEY));
  assert.strictEqual(memory.has(core.SOURCE_STORAGE_KEY), false);
}

console.log("Phase22-22 limited application final decision operational handoff plan core tests passed");
