const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = {
  console,
  URL,
  Blob,
  module: { exports: {} },
  fetch: null,
  window: {},
  document: {
    readyState: 'loading',
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => undefined,
  },
};
sandbox.window = {
  localStorage: { getItem: () => null, setItem: () => undefined, removeItem: () => undefined, clear: () => undefined },
  addEventListener: () => undefined,
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('win5-phase95.js', 'utf8'), sandbox, { filename: 'win5-phase95.js' });

const engine = sandbox.window.HashimotoPhase95Win5Engine;
assert.ok(engine.buildDashboard, 'Phase9-5 WIN5 engine is exposed');

const report = engine.buildDashboard();

assert.equal(report.records.length, 1, 'win5Database records are converted');
assert.equal(report.records[0].combinationCount, 8, 'selection combinations are calculated');
assert.ok(report.engine.hitProbability > 0, 'hit probability is calculated');
assert.ok(report.engine.expectedReturn > 0, 'expected return is calculated');
assert.ok(report.engine.riskScore > 0, 'risk score is calculated');
assert.equal(report.recommendedWin5.length, 1, 'recommended WIN5 is generated');
assert.equal(report.safeWin5.length, 1, 'safe WIN5 lane is generated');
assert.equal(report.balancedWin5.length, 1, 'balanced WIN5 lane is generated');
assert.equal(report.highReturnWin5.length, 1, 'high return WIN5 lane is generated');

console.log('phase9-5 WIN5 engine test passed');
