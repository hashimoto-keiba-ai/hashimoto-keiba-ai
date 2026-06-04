const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const createLocalStorageMock = () => {
  const store = new Map();
  return {
    get length() { return store.size; },
    key: (index) => Array.from(store.keys())[index] || null,
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
  localStorage: localStorageMock,
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

const engine = sandbox.window.HashimotoProductionOperationModeEngine;
assert.ok(engine, '本番運用モードエンジンが公開されている');
assert.equal(engine.MODE_STORAGE_KEY, 'productionOperationMode', '運用モード保存キーがproductionOperationModeである');
assert.equal(engine.SCORE_STORAGE_KEY, 'productionOperationScores', 'スコア保存キーがproductionOperationScoresである');

assert.equal(engine.saveMode('production', localStorageMock), 'production', '本番運用モードへ切り替えできる');
assert.equal(localStorageMock.getItem('productionOperationMode'), 'production', 'モード切替がlocalStorageへ保存される');
assert.equal(engine.saveMode('unknown', localStorageMock), 'development', '不正なモードは開発モードへ補正される');

const scores = engine.calculateOperationScore({
  completion: 100,
  roi: 100,
  godRaceRate: 90,
  dangerPopularSuccessRate: 90,
  kamianaSuccessRate: 90,
  trifectaHitRate: 80,
});
assert.equal(scores.score, 94, '6指標から本番運用スコアを加重平均で算出できる');
assert.equal(scores.judgement, '完全運用', '90点以上は完全運用判定になる');
engine.saveScores(scores, localStorageMock);
assert.equal(JSON.parse(localStorageMock.getItem('productionOperationScores')).score, 94, 'スコア計算結果がlocalStorageへ保存される');

localStorageMock.setItem('productionReadinessAuditReports', JSON.stringify([{ completion: { percentage: 92 } }]));
localStorageMock.setItem('productionResultValidationReports', JSON.stringify([
  { roi: 120, godRaceHit: true, dangerPopularSuccess: true, kamianaHit: true, trifectaHit: true },
  { roi: 80, godRaceHit: false, dangerPopularSuccess: true, kamianaHit: false, trifectaHit: false },
]));
const derived = engine.deriveScoresFromStorage(localStorageMock);
assert.equal(derived.completion, 92, '完成度監査から完成度を取得できる');
assert.equal(derived.roi, 100, '結果検証ログから平均ROIをスコア化できる');
assert.equal(derived.dangerPopularSuccessRate, 100, '危険人気馬成功率を結果検証ログから計算できる');
assert.equal(derived.kamianaSuccessRate, 50, '神穴成功率を結果検証ログから計算できる');
assert.equal(derived.trifectaHitRate, 50, '三連単的中率を結果検証ログから計算できる');

const payload = {
  race: { date: '2026-06-07', course: '東京競馬場', raceNumber: 11, raceName: 'Phase5本番S' },
  aiIndexRanking: [{ number: 1, name: '本命' }],
  kamianaRanking: [{ number: 2, name: '神穴' }],
  dangerPopularRanking: [{ number: 3, name: '危険人気' }],
  trifecta: { tickets: { main: [{ first: { number: 1 }, second: { number: 2 }, third: { number: 4 } }] } },
  win5: { zones: { a: [{ number: 1, name: '本命' }] } },
  godRace: { skip: false },
};
const validation = engine.buildValidationReport({ payload, result: { firstNumber: 1, secondNumber: 2, thirdNumber: 4, investment: 1000, payout: 2500 } });
assert.equal(validation.trifectaHit, true, '本番結果から三連単的中を検証できる');
assert.equal(validation.roi, 250, '本番結果からROIを算出できる');
assert.equal(validation.godRaceHit, true, '神レース判定とROIから神レース成功を検証できる');

const saved = engine.saveValidationAndEvolution({ payload, result: { firstNumber: 1, secondNumber: 2, thirdNumber: 4, investment: 1000, payout: 2500 }, storage: localStorageMock });
assert.equal(JSON.parse(localStorageMock.getItem('productionResultValidationReports'))[0].roi, 250, '結果検証がlocalStorageへ保存される');
assert.equal(JSON.parse(localStorageMock.getItem('selfEvolutionLogs')).logs.resultVerifications[0].id, saved.evolutionLog.id, '自己進化ログがlocalStorageへ保存される');
assert.equal(JSON.parse(localStorageMock.getItem('fundCurveRecords'))[0].roi, 250, '資金曲線がlocalStorageへ保存される');

const backup = engine.createOperationBackup(localStorageMock);
assert.ok(backup.keys.includes('productionOperationMode'), 'バックアップに本番運用モードキーが含まれる');
assert.ok(backup.keys.includes('productionOperationScores'), 'バックアップに本番運用スコアキーが含まれる');
assert.ok(localStorageMock.getItem('productionOperationBackupLatest'), '本番運用バックアップがlocalStorageへ保存される');

console.log('production operation mode test passed');
