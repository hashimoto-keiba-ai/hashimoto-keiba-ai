const assert = require('node:assert/strict');
const superCore = require('../super-core-page.js');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const engine = superCore.buildSuperCoreEngine({ storage: createStorage() });

assert.equal(superCore.VERSION, '3.0');
assert.equal(superCore.CODE_NAME, 'Hashimoto Super Core Engine v3.0');
assert.equal(engine.releaseStatus, 'Hashimoto Racing AI Version 3.0 Development');
assert.equal(engine.stableBase, 'Official Release v2.8');
assert.equal(engine.protectedRelease, 'Hashimoto Racing AI Core Engine v2.8');
assert.equal(engine.protectedReleaseStatus, 'Official Release v2.8');
assert.equal(engine.phase, 'Phase16');
assert.deepEqual(engine.preservedEngines, ['researchLabEngine', 'selfEvolutionEngine', 'secretaryEngine', 'win5Engine', 'profitEngine']);
assert.deepEqual(engine.phase16Engines, ['Super Self Evolution Engine', 'Full Auto Learning Engine', 'Future Prediction Engine']);
assert.ok(engine.additionTargets.includes('超自己進化'));
assert.ok(engine.additionTargets.includes('完全自動学習'));
assert.ok(engine.additionTargets.includes('競馬場別統合AI'));
assert.ok(engine.additionTargets.includes('資金管理AI強化'));
assert.ok(engine.additionTargets.includes('研究所AI強化'));
assert.ok(engine.additionTargets.includes('AI秘書強化'));
assert.ok(engine.additionTargets.includes('未来予測エンジン'));
assert.equal(engine.modules.research.engine, 'researchLabEngine');
assert.equal(engine.modules.selfEvolution.engine, 'selfEvolutionEngine');
assert.equal(engine.modules.secretary.engine, 'secretaryEngine');
assert.equal(engine.modules.win5.engine, 'win5Engine');
assert.equal(engine.modules.profit.engine, 'profitEngine');
assert.equal(engine.modules.superSelfEvolution.engine, 'Super Self Evolution Engine');
assert.equal(engine.modules.superSelfEvolution.phase, 'Phase16-1');
assert.equal(engine.modules.fullAutoLearning.engine, 'Full Auto Learning Engine');
assert.equal(engine.modules.fullAutoLearning.phase, 'Phase16-2');
assert.equal(engine.modules.futurePrediction.engine, 'Future Prediction Engine');
assert.equal(engine.modules.futurePrediction.phase, 'Phase16-3');
assert.ok(engine.dashboardLabels.superSelfEvolution.includes('Super Self Evolution Engine'));
assert.ok(engine.dashboardLabels.fullAutoLearning.includes('Full Auto Learning Engine'));
assert.ok(engine.dashboardLabels.futurePrediction.includes('Future Prediction Engine'));
assert.ok(engine.policy.includes('Official Release v2.8'));

console.log('super core engine test passed');
