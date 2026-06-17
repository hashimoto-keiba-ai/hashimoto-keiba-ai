const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "result-learning-pipeline-phase145.js"), "utf8");
const context = {
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const pipeline = context.window.HashimotoPhase145ResultLearningPipeline;
assert.ok(pipeline, "Phase14-5 result learning pipeline should be exported");

assert.strictEqual(JSON.stringify(pipeline.pipelineSteps), JSON.stringify(["結果", "Phase8結果検証", "OS更新", "AI指数補正", "自己学習"]));

const record = pipeline.runPipeline({
  date: "2026-06-06",
  racecourse: "東京",
  raceNumber: 11,
  raceName: "東京11R",
  firstNumber: 1,
  secondNumber: 3,
  thirdNumber: 5,
  payoutAmount: 18420,
  last3fBest: 33.5,
  corner4Memo: "4角先行勢が粘る",
  lapSummary: "12.5-11.1-11.4"
});

assert.strictEqual(record.pipelineStatus, "Complete");
assert.strictEqual(record.phase8ResultVerification.status, "Verified");
assert.strictEqual(record.phase8ResultVerification.hit, true);
assert.strictEqual(record.osUpdate.status, "Apply");
assert.ok(record.osUpdate.rule.includes("OS"));
assert.strictEqual(record.aiIndexCorrection.status, "Apply");
assert.ok(record.aiIndexCorrection.aiIndexDelta > 0);
assert.strictEqual(record.selfLearning.status, "Learned");
assert.ok(record.selfLearning.learningScore > 70);

const osPayload = pipeline.buildOsUpdatePayload(record);
assert.strictEqual(osPayload.type, "osUpdates");
assert.strictEqual(osPayload.items[0].target, "東京OS");

const correctionPayload = pipeline.buildAiIndexCorrectionPayload(record);
assert.strictEqual(correctionPayload.type, "aiIndexCorrections");
assert.strictEqual(correctionPayload.items[0].aiIndexDelta, record.aiIndexCorrection.aiIndexDelta);

const learningPayload = pipeline.buildSelfLearningPayload(record);
assert.strictEqual(learningPayload.databaseName, "learningDatabase");
assert.strictEqual(learningPayload.records[0].hit, true);
assert.ok(learningPayload.records[0].learningNotes.includes("AI指数"));

const dashboard = pipeline.buildDashboard(pipeline.fallbackDatabase);
assert.strictEqual(dashboard.databaseName, "resultLearningPipelineDatabase");
assert.strictEqual(dashboard.phase, "Phase14-5");
assert.strictEqual(dashboard.widget.completeCount, 1);
assert.strictEqual(dashboard.widget.osUpdateStatus, "Apply");
assert.strictEqual(dashboard.widget.learningScore, 92);

console.log("Phase14-5 result learning pipeline test passed");
