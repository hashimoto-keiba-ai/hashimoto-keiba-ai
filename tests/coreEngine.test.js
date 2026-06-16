const assert = require('node:assert/strict');
const core = require('../core-engine-page.js');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage();
const engine = core.buildCoreEngine({ storage });

assert.equal(core.VERSION, '2.8');
assert.equal(core.CORE_ENGINE_NAME, 'Hashimoto Racing AI Core Engine v2.8');
assert.equal(engine.releaseStatus, 'Official Release v2.8');
assert.equal(engine.stableBase, 'Official Release v2.8');
assert.equal(engine.modules.research.engine, 'researchLabEngine');
assert.equal(engine.modules.selfEvolution.engine, 'selfEvolutionEngine');
assert.equal(engine.modules.secretary.engine, 'secretaryEngine');
assert.equal(engine.modules.win5.engine, 'win5Engine');
assert.equal(engine.modules.profit.engine, 'profitEngine');
assert.ok(engine.dashboardLabels.research.includes('researchLabEngine'));
assert.ok(engine.dashboardLabels.selfEvolution.includes('検証'));
assert.ok(engine.dashboardLabels.win5.includes('%'));
assert.ok(engine.dashboardLabels.profit.includes('ROI'));
assert.equal(engine.completionState, '永久保存版');

console.log('core engine test passed');
