const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

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
  localStorage: { getItem: () => null, setItem: () => undefined, removeItem: () => undefined, clear: () => undefined },
  addEventListener: () => undefined,
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('src/dashboard.js', 'utf8'), sandbox, { filename: 'src/dashboard.js' });

const scoreEngine = sandbox.window.HashimotoKeibaAiScoreEngine;
const betEngine = sandbox.window.HashimotoBetEngine;
assert.ok(scoreEngine.detectDangerPopularHorses, '危険人気馬検出APIが公開されている');

const raceContext = { course: '福島競馬場', distance: 1200, surface: '芝', going: '重', fieldSize: 8 };
const horses = scoreEngine.calculateAllHorseScores([
  { number: 1, name: '過剰人気逃げ', jockey: '新人', popularity: 1, odds: 2.1, runningStyle: '逃げ', cornerPosition: 7, training: 'C', aiWinRate: 22 },
  { number: 2, name: '二人気安定', jockey: 'ルメール', popularity: 2, odds: 3.8, runningStyle: '先行', cornerPosition: 2, training: 'A', aiWinRate: 28 },
  { number: 3, name: '三人気不安', jockey: '乗替', popularity: 3, odds: 5.2, runningStyle: '追込', cornerPosition: 8, training: 'B', aiWinRate: 12 },
  { number: 4, name: '神穴差し', jockey: '川田', popularity: 7, odds: 22, runningStyle: '差し', cornerPosition: 5, training: 'A', kamianaIndex: 92 },
  { number: 5, name: '相手先行', jockey: '松山', popularity: 5, odds: 11, runningStyle: '先行', cornerPosition: 3, training: 'B' },
], raceContext);

const detected = scoreEngine.detectDangerPopularHorses(horses, raceContext);
assert.ok(detected.length >= 2, '1〜3人気から危険人気馬候補を検出する');
assert.equal(detected[0].number, 1, '過剰人気・展開不一致・騎手補正が重い馬が危険度上位になる');
assert.ok(detected[0].dangerPopularAssessment.dangerScore >= 75, '危険度スコアが算出される');
assert.ok(detected[0].dangerPopularAssessment.reasons.some((reason) => reason.label === '過剰人気'), '過剰人気理由を表示できる');
assert.ok(detected[0].dangerPopularAssessment.reasons.some((reason) => reason.label === '騎手補正'), '騎手補正理由を表示できる');
assert.ok(horses.find((horse) => horse.number === 1).dangerIndex >= detected[0].dangerPopularAssessment.dangerScore, '危険度スコアが危険人気馬指数へ反映される');

const trifecta = betEngine.buildTrifectaPayload(horses, { fieldSize: 8 });
assert.ok(trifecta.candidates.dangerHeadExcluded.some((horse) => horse.number === 1), '三連単生成AIの頭候補除外に危険人気馬が連動する');
assert.ok(!trifecta.candidates.firstCandidates.some((horse) => horse.number === 1), '危険人気馬は三連単1着候補から外れる');

const win5 = betEngine.buildWin5ClassificationPayload(horses, raceContext);
assert.ok(win5.dangerExcluded.some((horse) => horse.number === 1), 'WIN5除外候補に危険人気馬が連動する');
assert.ok(!Object.values(win5.zones).flat().some((horse) => horse.number === 1), '危険人気馬はWIN5候補ゾーンから外れる');
