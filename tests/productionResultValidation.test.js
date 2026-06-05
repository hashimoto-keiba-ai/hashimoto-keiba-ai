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
const validationEngine = sandbox.window.HashimotoProductionResultValidationEngine;
assert.ok(validationEngine, '本番結果検証エンジンが公開されている');
assert.equal(validationEngine.STORAGE_KEY, 'productionResultValidationReports', '本番結果検証保存キーがproductionResultValidationReportsである');
assert.equal(validationEngine.PRODUCTION_RUN_REPORT_STORAGE_KEY, 'productionRunReports', 'productionRunReportsと照合する');
assert.equal(validationEngine.FUND_CURVE_STORAGE_KEY, 'fundCurveRecords', '資金曲線保存キーがfundCurveRecordsである');

const race = {
  date: '2026-06-07',
  course: '東京競馬場',
  raceNumber: 11,
  raceName: '本番検証S',
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

const payload = productionEngine.buildAiAnalysisPayload({ race, horses, simulationCount: 300, persistEngines: false });
const inputCheck = productionEngine.validateProductionInput({ race, horses });
const runReport = productionEngine.buildProductionRunReport({ payload, validation: inputCheck });
productionEngine.saveProductionRunReport(runReport, localStorageMock);

const firstTicket = runReport.productionPayload.trifecta.tickets.main[0];
const resultInput = {
  date: race.date,
  course: race.course,
  raceNumber: race.raceNumber,
  firstNumber: firstTicket.first.number,
  secondNumber: firstTicket.second.number,
  thirdNumber: firstTicket.third.number,
  trifectaPayout: 125430,
  actualPace: '平均',
  cornerMemo: '4角先行勢が粘る',
  trackBias: '内先行有利',
  payoutAmount: 125430,
  investmentAmount: 12000,
  memo: '本番検証テスト',
};

const matched = validationEngine.findMatchingProductionRunReport(resultInput, localStorageMock);
assert.equal(matched.id, runReport.id, '開催日・競馬場・レース番号でproductionRunReportsと照合できる');

const validation = validationEngine.validateAndPersistProductionResult({ resultInput }, localStorageMock);
assert.equal(validation.matchedRunReportId, runReport.id, '検証レポートに照合元productionRunReports IDが入る');
assert.equal(validation.judgements.trifectaHit, true, '三連単的中/不的中を照合できる');
assert.equal(validation.judgements.win5Hit, true, 'WIN5候補的中/不的中を照合できる');
assert.ok(['1', 1, '4着以下', 2, 3].includes(validation.judgements.aiTopRank), 'AI指数1位の着順が記録される');
assert.ok(validation.labels.kamianaHit.includes('神穴候補'), '神穴候補の馬券内判定ラベルが生成される');
assert.ok(validation.labels.dangerPopularFlew.includes('危険人気馬'), '危険人気馬が飛んだかのラベルが生成される');
assert.ok(validation.labels.godRaceSuccess.includes('神レース判定'), '神レース判定結果が生成される');
assert.ok(validation.labels.evSuccess.includes('EV判定'), 'EV判定結果が生成される');
assert.ok(validation.labels.capitalSuccess.includes('資金配分'), '資金配分判定結果が生成される');
assert.equal(validation.summary.hitLabel, '的中', '検証結果サマリーに的中が入る');
assert.ok(validation.roi > 100, 'ROIが投資額・払戻額から計算される');
assert.ok(validation.summary.goodJudgements.length > 0, '良かった判定が生成される');
assert.ok(validation.summary.nextFixPoints.length > 0, '次回修正ポイントが生成される');
assert.ok(validation.osUpdateCandidates.adopt.length > 0, 'OSアップデート採用候補が生成される');

const validationReports = JSON.parse(localStorageMock.getItem('productionResultValidationReports'));
assert.equal(validationReports[0].id, validation.id, '結果入力検証レポートがproductionResultValidationReportsへ保存される');
const selfEvolutionPrimary = JSON.parse(localStorageMock.getItem(validationEngine.SELF_EVOLUTION_STORAGE_KEY));
const selfEvolutionLegacy = JSON.parse(localStorageMock.getItem('selfEvolutionLogs'));
assert.equal(selfEvolutionPrimary.logs.resultVerifications[0].source, 'production-result-validation', '自己進化ログへ本番検証が保存される');
assert.equal(selfEvolutionLegacy.logs.resultVerifications[0].id, validation.selfEvolutionLog.id, 'selfEvolutionLogsキーにも本番検証が保存される');
const fundCurveRecords = JSON.parse(localStorageMock.getItem('fundCurveRecords'));
assert.equal(fundCurveRecords[0].stake, 12000, 'fundCurveRecordsへ投資額が保存される');
assert.equal(fundCurveRecords[0].payout, 125430, 'fundCurveRecordsへ払戻額が保存される');
console.log('production result validation test passed');
