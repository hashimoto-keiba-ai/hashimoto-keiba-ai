const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const createLocalStorageMock = () => {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
};

const localStorageMock = createLocalStorageMock();
const sandbox = {
  console,
  URL,
  Blob,
  setTimeout,
  clearTimeout,
  window: {},
  document: {
    readyState: 'loading',
    querySelector: () => null,
    querySelectorAll: () => [],
  },
};
sandbox.window = {
  localStorage: localStorageMock,
  addEventListener: () => undefined,
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('src/dashboard.js', 'utf8'), sandbox, { filename: 'src/dashboard.js' });

const scoreEngine = sandbox.window.HashimotoKeibaAiScoreEngine;
const verificationEngine = sandbox.window.HashimotoScoreVerificationEngine;
const betEngine = sandbox.window.HashimotoBetEngine;
assert.ok(scoreEngine, 'AI指数エンジンが公開されている');
assert.ok(verificationEngine, 'Phase2-2検証エンジンが公開されている');

const raceContext = { course: '東京競馬場', distance: 1600, surface: '芝', going: '良', fieldSize: 6 };
const baseHorses = scoreEngine.calculateAllHorseScores([
  { number: 1, name: '指数上位', popularity: 1, odds: 2.2, runningStyle: '先行', cornerPosition: 2, training: 'A' },
  { number: 2, name: '補正対象', popularity: 7, odds: 18, runningStyle: '差し', cornerPosition: 5, training: 'B' },
  { number: 3, name: '相手候補', popularity: 4, odds: 8, runningStyle: '自在', cornerPosition: 3, training: 'B' },
  { number: 4, name: '危険人気', popularity: 2, odds: 3.4, runningStyle: '追込', cornerPosition: 6, training: 'C' },
], raceContext);

assert.ok(baseHorses[0].scoreBreakdown.aiIndex.components.popularityCorrection !== undefined, 'AI指数内訳に人気補正がある');
assert.ok(baseHorses[0].scoreBreakdown.kamianaIndex.components.jackpotPatternFit !== undefined, '神穴指数内訳に万馬券パターン一致がある');
assert.ok(baseHorses[0].scoreBreakdown.dangerIndex.components.trainingConcern !== undefined, '危険人気馬指数内訳に調教不安がある');

const beforeAiLeader = [...baseHorses].sort((a, b) => b.aiIndex - a.aiIndex)[0];
assert.notEqual(beforeAiLeader.number, 2, '補正前は2番がAI指数首位ではない');

const savedAdjustments = verificationEngine.saveAdjustments({
  2: { aiIndex: 40, kamianaIndex: 15, dangerIndex: -20, memo: '直前気配良化で手動補正' },
}, localStorageMock);
assert.equal(savedAdjustments['2'].memo, '直前気配良化で手動補正', '手動補正メモが保存される');
assert.deepEqual(verificationEngine.loadAdjustments(localStorageMock), savedAdjustments, 'localStorageから手動補正値を復元できる');

const adjustedHorses = verificationEngine.applyManualAdjustments(baseHorses, savedAdjustments);
const afterAiLeader = [...adjustedHorses].sort((a, b) => b.aiIndex - a.aiIndex)[0];
assert.equal(afterAiLeader.number, 2, '再計算後にAI指数ランキングへ手動補正が反映される');
assert.equal(afterAiLeader.scoreSource.aiIndex, 'adjusted', '補正済みスコアソースが付与される');
assert.equal(afterAiLeader.correctionMemo, '直前気配良化で手動補正', '補正メモが馬データへ反映される');

const trifecta = betEngine.buildTrifectaPayload(adjustedHorses, { fieldSize: 6 });
assert.ok(trifecta.candidates.firstCandidates.some((horse) => horse.number === 2), '三連単候補へ補正後ランキングが反映される');
const win5 = betEngine.buildWin5ClassificationPayload(adjustedHorses, raceContext);
assert.ok(Object.values(win5.zones).flat().some((horse) => horse.number === 2), 'WIN5候補へ補正後ランキングが反映される');
