const assert = require('node:assert/strict');
const futurePrediction = require('../future-prediction-page.js');

function createStorage(seed = {}) {
  const data = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage({
  'course-research-db.json': [{ course: '東京', bestDistance: '芝1600', returnRate: 328 }],
  'distance-db.json': [{ distance: '芝1600', returnRate: 188 }],
  'jockey-research-db.json': [{ jockey: '研究騎手A', strongPattern: '東京芝1600差し', returnRate: 180 }],
  'trifecta-pattern-db.json': [{ pattern: 'A→B→C', returnRate: 252, memo: 'Aゾーン過信注意' }],
  'darkhorse-db.json': [{ horse: '神穴候補A', confidence: 96 }],
  'win5-db.json': [{ hitRate: 41, expectedPayout: 3000000 }],
  'profit-db.json': [{ course: '東京', returnRate: 360 }],
  'return-ai-db.json': [{ returnRate: 340 }]
});

const engine = futurePrediction.buildFuturePredictionEngine({ storage });

assert.equal(futurePrediction.VERSION, '3.0');
assert.equal(futurePrediction.ENGINE_NAME, 'Future Prediction Engine');
assert.equal(engine.phase, 'Phase16-3');
assert.equal(engine.stableBase, 'Official Release v2.8');
assert.deepEqual(engine.preservedEngines, ['researchLabEngine', 'selfEvolutionEngine', 'secretaryEngine', 'win5Engine', 'profitEngine', 'Super Self Evolution Engine', 'Full Auto Learning Engine']);
assert.ok(engine.forecastTargets.includes('競馬場傾向予測'));
assert.ok(engine.forecastTargets.includes('距離傾向予測'));
assert.ok(engine.forecastTargets.includes('好調騎手予測'));
assert.ok(engine.forecastTargets.includes('人気飛び予測'));
assert.ok(engine.forecastTargets.includes('回収率予測'));
assert.ok(engine.forecastTargets.includes('WIN5成功率予測'));
assert.ok(engine.forecastTargets.includes('三連単成功率予測'));
assert.ok(engine.forecastTargets.includes('神穴候補予測'));
assert.equal(engine.record.courseTrend.course, '東京');
assert.equal(engine.record.distanceTrend.distance, '芝1600');
assert.equal(engine.record.hotJockey.jockey, '研究騎手A');
assert.equal(engine.record.favoriteFailure.warning, 'Aゾーン過信注意');
assert.equal(engine.record.win5SuccessRate, 41);
assert.equal(engine.record.darkHorseCandidate, '神穴候補A');
assert.ok(engine.statusLabel.includes('Future Prediction Engine'));

const saved = futurePrediction.saveFuturePrediction({ storage });
assert.equal(saved.engine, 'Future Prediction Engine');
assert.equal(storage.readJson('future-prediction-db.json').records[0].phase, 'Phase16-3');
assert.equal(storage.readJson('future-pattern-db.json').records[0].pattern, 'A→B→C');
assert.equal(storage.readJson('future-win5-db.json').records[0].expectedPayout, 3000000);
assert.equal(storage.readJson('future-profit-db.json').records[0].course, '東京');

console.log('future prediction engine test passed');
