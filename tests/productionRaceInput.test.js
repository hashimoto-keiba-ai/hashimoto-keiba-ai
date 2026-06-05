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
vm.runInContext(fs.readFileSync('src/storage/localStorageAdapter.js', 'utf8'), sandbox, { filename: 'src/storage/localStorageAdapter.js' });
vm.runInContext(fs.readFileSync('src/storage/dataStorageService.js', 'utf8'), sandbox, { filename: 'src/storage/dataStorageService.js' });
vm.runInContext(fs.readFileSync('src/dashboard.js', 'utf8'), sandbox, { filename: 'src/dashboard.js' });
vm.runInContext(fs.readFileSync('src/raceSimulator.js', 'utf8'), sandbox, { filename: 'src/raceSimulator.js' });

const productionEngine = sandbox.window.HashimotoProductionRaceEngine;
const dataStorage = sandbox.window.HashimotoDataStorage;
assert.ok(productionEngine, '本番レース入力エンジンが公開されている');
assert.equal(productionEngine.PRODUCTION_RUN_REPORT_STORAGE_KEY, 'productionRunReports', '本番一括実行レポート保存キーがproductionRunReportsである');
assert.equal(dataStorage.getDefinition('raceDatabase').storageKey, 'raceDatabase', 'raceDatabase保存定義がある');

const race = {
  date: '2026-06-07',
  course: '東京競馬場',
  raceNumber: 11,
  raceName: '本番テストS',
  distance: 1600,
  surface: '芝',
  going: '良',
  fieldSize: 6,
};
const horses = [
  { number: 1, name: 'プロダクションワン', popularity: 1, odds: 2.4, jockey: 'ルメール', trainer: '木村', runningStyle: '先行', training: 'A' },
  { number: 2, name: 'カミアナスター', popularity: 8, odds: 24.5, jockey: '坂井', trainer: '矢作', runningStyle: '差し', training: 'S' },
  { number: 3, name: 'デンジャー人気', popularity: 2, odds: 3.8, jockey: '新人', trainer: '田中', runningStyle: '追込', training: 'C' },
  { number: 4, name: 'フロントランナー', popularity: 5, odds: 12.2, jockey: '横山武', trainer: '斎藤', runningStyle: '逃げ', training: 'B' },
  { number: 5, name: 'ミドルホース', popularity: 4, odds: 9.1, jockey: '戸崎', trainer: '国枝', runningStyle: '自在', training: 'B' },
  { number: 6, name: 'ロングショット', popularity: 10, odds: 41.0, jockey: '若手', trainer: '高橋', runningStyle: '追込', training: 'A' },
];

const payload = productionEngine.buildAiAnalysisPayload({ race, horses, simulationCount: 1000, persistEngines: false });
assert.equal(payload.mode, 'production-race-input', '本番入力モードのpayloadになる');
assert.equal(payload.race.raceName, race.raceName, '本番レース名が保持される');
assert.equal(payload.horses.length, 6, '本番出走馬が全頭分析される');
assert.ok(payload.horses.every((horse) => horse.trainer), '調教師が保存対象になる');
assert.ok(payload.horses.every((horse) => Number.isFinite(horse.aiIndex) && Number.isFinite(horse.kamianaIndex) && Number.isFinite(horse.dangerIndex)), 'AI指数・神穴・危険人気馬が自動実行される');
assert.ok(payload.trifecta.summary.total > 0, '三連単が生成される');
assert.ok(Object.values(payload.win5.zones).flat().length > 0, 'WIN5候補が生成される');
assert.ok(payload.ev.evRanking.length > 0 && Number.isFinite(payload.ev.win5EV.ev), 'EVが計算される');
assert.ok(Number.isFinite(payload.capital.summary.totalRecommended), '資金配分が計算される');
assert.ok(payload.godRace.label && Number.isFinite(payload.godRace.score), '神レース判定が計算される');

const inputCheck = productionEngine.validateProductionInput({ race, horses });
assert.equal(inputCheck.ok, true, '本番AI一括実行の入力チェックが通る');
const runReport = productionEngine.buildProductionRunReport({ payload, validation: inputCheck });
assert.equal(runReport.storageKey, 'productionRunReports', '本番一括実行レポートの保存先がproductionRunReportsになる');
assert.equal(runReport.executionSteps.length, 14, '本番一括実行の14工程が記録される');
assert.ok(runReport.summary.aiIndexTop.name, '実行結果サマリーにAI指数1位が入る');
assert.ok(runReport.summary.kamianaTop.name, '実行結果サマリーに神穴1位が入る');
assert.ok(runReport.summary.dangerPopularTop.name, '実行結果サマリーに危険人気馬1位が入る');
assert.ok(runReport.summary.mainTrifectaText.includes('→'), '実行結果サマリーに本線三連単が入る');
assert.ok(runReport.summary.attackTrifectaText === '該当なし' || runReport.summary.attackTrifectaText.includes('→'), '実行結果サマリーに攻撃型三連単が入る');
assert.ok(runReport.summary.win5Candidates.length > 0, '実行結果サマリーにWIN5候補が入る');
assert.ok(runReport.summary.evTop.length > 0, '実行結果サマリーにEV上位が入る');
assert.ok(Number.isFinite(runReport.summary.recommendedInvestmentAmount), '実行結果サマリーに推奨投資額が入る');
assert.ok(runReport.summary.godRaceJudgement.label, '実行結果サマリーに神レース判定が入る');
assert.ok(['本番運用可能', '要確認'].includes(runReport.summary.operationMode), '本番運用可能/要確認の判定が入る');
productionEngine.saveProductionRunReport(runReport, localStorageMock);
const restoredRunReports = JSON.parse(localStorageMock.getItem('productionRunReports'));
assert.equal(restoredRunReports[0].id, runReport.id, 'localStorage productionRunReportsへ本番一括実行レポートが保存される');

productionEngine.saveProductionRace(payload, localStorageMock);
const restoredProduction = JSON.parse(localStorageMock.getItem(productionEngine.PRODUCTION_RACE_STORAGE_KEY));
const restoredDatabase = JSON.parse(localStorageMock.getItem('raceDatabase'));
assert.equal(restoredProduction.id, payload.id, '本番レース最新payloadがlocalStorageへ保存される');
assert.equal(restoredDatabase[0].id, payload.id, 'raceDatabaseへ本番分析ログが追記される');

const storedViaAdapter = dataStorage.saveData('raceDatabase', restoredDatabase, 'localStorage');
assert.equal(storedViaAdapter[0].summary.runnerCount, 6, 'DataStorage経由でもraceDatabaseを保存できる');
console.log('production race input test passed');
