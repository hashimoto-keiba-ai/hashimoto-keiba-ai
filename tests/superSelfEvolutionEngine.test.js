const assert = require('node:assert/strict');
const superSelfEvolution = require('../super-self-evolution-page.js');

function createStorage(seed = {}) {
  const data = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage({
  'success-pattern-db.json': [{ date: '2026-06-16', course: '東京', race: '11R', distance: '芝1600', successPattern: 'Cゾーン差し込み', returnRate: 360 }],
  'failure-pattern-db.json': [{ date: '2026-06-16', course: '東京', race: '11R', failedPrediction: 'A固定過信', cause: '1人気過信' }],
  'jockey-research-db.json': [{ jockey: '研究騎手A', course: '東京', distance: '芝1600', strongPattern: '東京芝1600差し', returnRate: 180 }],
  'trainer-research-db.json': [{ trainer: '研究調教師A', course: '東京', distance: '芝1600', strongPattern: '休み明け上昇', returnRate: 166 }],
  'distance-db.json': [{ distance: '芝1600', finding: 'Cゾーン期待', returnRate: 142 }],
  'course-research-db.json': [{ course: '東京', bestDistance: '芝1600', returnRate: 328 }]
});

const engine = superSelfEvolution.buildSuperSelfEvolutionEngine({ storage });

assert.equal(superSelfEvolution.VERSION, '3.0');
assert.equal(superSelfEvolution.ENGINE_NAME, 'Super Self Evolution Engine');
assert.equal(engine.phase, 'Phase16-1');
assert.equal(engine.stableBase, 'Official Release v2.8');
assert.deepEqual(engine.pipeline, ['検証', '分析', '学習', '改善案生成', 'ルール更新', '履歴保存']);
assert.deepEqual(engine.preservedEngines, ['researchLabEngine', 'selfEvolutionEngine', 'secretaryEngine', 'win5Engine', 'profitEngine']);
assert.ok(engine.linkedResearchDbs.includes('success-pattern-db.json'));
assert.ok(engine.linkedResearchDbs.includes('failure-pattern-db.json'));
assert.ok(engine.linkedResearchDbs.includes('jockey-research-db.json'));
assert.ok(engine.linkedResearchDbs.includes('trainer-research-db.json'));
assert.ok(engine.linkedResearchDbs.includes('distance-db.json'));
assert.ok(engine.linkedResearchDbs.includes('course-research-db.json'));
assert.equal(engine.verification.step, '検証');
assert.equal(engine.analysis.step, '分析');
assert.equal(engine.learning.step, '学習');
assert.equal(engine.improvement.step, '改善案生成');
assert.equal(engine.rule.step, 'ルール更新');
assert.equal(engine.history.pipeline.at(-1), '履歴保存');
assert.ok(engine.rule.newRule.includes('研究所AI'));
assert.ok(engine.statusLabel.includes('検証→分析→学習→改善案生成→ルール更新→履歴保存'));

const saved = superSelfEvolution.saveSuperSelfEvolutionHistory({ storage });
assert.equal(saved.engine, 'Super Self Evolution Engine');
assert.equal(storage.readJson('evolution-rule-db.json').records[0].category, 'Super Self Evolution Engine');
assert.equal(storage.readJson('history-db.json').records[0].phase, 'Phase16-1');

console.log('super self evolution engine test passed');
