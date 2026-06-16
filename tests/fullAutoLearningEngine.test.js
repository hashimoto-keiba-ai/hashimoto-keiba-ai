const assert = require('node:assert/strict');
const fullAutoLearning = require('../full-auto-learning-page.js');

function createStorage(seed = {}) {
  const data = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage({
  'prediction-engine.json': [{ date: '2026-06-16', course: '東京', race: '11R', distance: '芝1600', condition: '良', prediction: 'Cゾーン神穴', axisHorse: 'AI本命A', confidence: 94 }],
  'learning-engine.json': [{ date: '2026-06-16', course: '東京', race: '11R', distance: '芝1600', result: '的中', hit: true, returnRate: 360 }],
  'auto-review-db.json': [{ result: '的中', hit: true, review: 'Cゾーン成功' }],
  'auto-update-db.json': [{ update: '東京芝1600を強化' }],
  'course-db.json': [{ course: '東京', memo: '直線長い' }],
  'distance-db.json': [{ distance: '芝1600', memo: 'マイル強化' }],
  'return-ai-db.json': [{ returnRate: 360 }]
});

const engine = fullAutoLearning.buildFullAutoLearningEngine({ storage });

assert.equal(fullAutoLearning.VERSION, '3.0');
assert.equal(fullAutoLearning.ENGINE_NAME, 'Full Auto Learning Engine');
assert.equal(engine.phase, 'Phase16-2');
assert.equal(engine.stableBase, 'Official Release v2.8');
assert.deepEqual(engine.preservedEngines, ['researchLabEngine', 'selfEvolutionEngine', 'secretaryEngine', 'win5Engine', 'profitEngine', 'Super Self Evolution Engine']);
assert.deepEqual(engine.pipeline, ['レースデータ取得', '事前予想保存', '結果照合', '検証', '学習ルール生成', 'OSアップデート', '履歴DB保存']);
assert.ok(engine.linkedDbs.includes('learning-engine.json'));
assert.ok(engine.linkedDbs.includes('prediction-engine.json'));
assert.ok(engine.linkedDbs.includes('auto-review-db.json'));
assert.ok(engine.linkedDbs.includes('auto-update-db.json'));
assert.ok(engine.linkedDbs.includes('history-db.json'));
assert.ok(engine.linkedDbs.includes('course-db.json'));
assert.ok(engine.linkedDbs.includes('distance-db.json'));
assert.ok(engine.linkedDbs.includes('return-ai-db.json'));
assert.equal(engine.raceData.step, 'レースデータ取得');
assert.equal(engine.preRacePrediction.step, '事前予想保存');
assert.equal(engine.comparison.step, '結果照合');
assert.equal(engine.verification.step, '検証');
assert.equal(engine.learningRule.step, '学習ルール生成');
assert.equal(engine.osUpdate.step, 'OSアップデート');
assert.equal(engine.history.step, '履歴DB保存');
assert.ok(engine.learningRule.learnedRule.includes('回収率360%'));
assert.ok(engine.statusLabel.includes('レースデータ取得→事前予想保存→結果照合→検証→学習ルール生成→OSアップデート→履歴DB保存'));

const saved = fullAutoLearning.saveFullAutoLearningHistory({ storage });
assert.equal(saved.engine, 'Full Auto Learning Engine');
assert.equal(storage.readJson('learning-engine.json').records[0].phase, 'Phase16-2');
assert.equal(storage.readJson('history-db.json').records[0].engine, 'Full Auto Learning Engine');
assert.equal(storage.readJson('auto-update-db.json').records[0].step, 'OSアップデート');

console.log('full auto learning engine test passed');
