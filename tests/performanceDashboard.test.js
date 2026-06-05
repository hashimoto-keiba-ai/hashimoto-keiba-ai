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
  localStorage: localStorageMock,
  window: {},
  document: {
    querySelector: () => null,
    querySelectorAll: () => [],
  },
};
sandbox.window = {
  localStorage: localStorageMock,
  document: sandbox.document,
  addEventListener: () => undefined,
};
sandbox.window.window = sandbox.window;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('src/dashboard.js', 'utf8'), sandbox, { filename: 'src/dashboard.js' });

const engine = sandbox.window.HashimotoPerformanceDashboardEngine;
assert.ok(engine, '総合パフォーマンスダッシュボードエンジンが公開されている');
assert.equal(engine.REPORT_STORAGE_KEY, 'performanceDashboardReports', 'JSON出力保存キーがperformanceDashboardReportsである');

localStorageMock.setItem('productionOperationLogs', JSON.stringify([
  { timestamp: '2026-06-01T09:00:00.000Z', operationType: '本番レース入力', racecourse: '東京競馬場', raceNumber: 11 },
  { timestamp: '2026-06-01T09:05:00.000Z', operationType: 'AI一括実行', racecourse: '東京競馬場', raceNumber: 11 },
  { timestamp: '2026-06-02T09:05:00.000Z', operationType: 'AI一括実行', racecourse: '阪神競馬場', raceNumber: 10 },
]));
localStorageMock.setItem('productionResultValidationReports', JSON.stringify([
  {
    id: 'v1',
    generatedAt: '2026-06-01T16:00:00.000Z',
    race: { course: '東京競馬場', raceNumber: 11, distance: 1600, surface: '芝' },
    result: { date: '2026-06-01', course: '東京競馬場', raceNumber: 11 },
    totalInvestment: 10000,
    payout: 18000,
    roi: 180,
    judgements: { mainHit: true, trifectaHit: true, win5Hit: true, kamianaHit: false, dangerPopularFlew: true, godRaceSuccess: true, evSuccess: true, capitalSuccess: true },
    osUpdateCandidates: { pending: ['神穴条件の馬場補正を保留検証'] },
  },
  {
    id: 'v2',
    generatedAt: '2026-06-02T16:00:00.000Z',
    race: { course: '阪神競馬場', raceNumber: 10, distance: 2200, surface: '芝' },
    result: { date: '2026-06-02', course: '阪神競馬場', raceNumber: 10 },
    totalInvestment: 8000,
    payout: 0,
    roi: 0,
    judgements: { mainHit: false, trifectaHit: false, win5Hit: false, kamianaHit: false, dangerPopularFlew: false, godRaceSuccess: false, evSuccess: false, capitalSuccess: false },
    osUpdateCandidates: { delete: ['低EV買い目を削除候補化'] },
  },
]));
localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { id: 'f1', date: '2026-06-01', course: '東京競馬場', raceNumber: 11, stake: 10000, payout: 18000 },
  { id: 'f2', date: '2026-06-02', course: '阪神競馬場', raceNumber: 10, investment: 8000, payout: 0 },
]));
localStorageMock.setItem('selfEvolutionLogs', JSON.stringify({ logs: { resultVerifications: [
  { id: 'e1', date: '2026-06-01', afterRule: '的中フォーメーションを採用' },
  { id: 'e2', date: '2026-06-02', pendingRule: '阪神芝中距離を保留検証' },
] } }));

const report = engine.buildPerformanceDashboardReport({ storage: localStorageMock });
assert.equal(report.operation.totalRaceCount, 2, '総レース数は参照キーからユニーク集計される');
assert.equal(report.operation.analyzedRaceCount, 2, 'AI一括実行ログが分析済レース数として集計される');
assert.equal(report.operation.verifiedRaceCount, 2, '検証済レース数はproductionResultValidationReports件数である');
assert.equal(report.operation.selfEvolutionCount, 2, 'selfEvolutionLogsから自己進化回数を集計する');
assert.equal(report.hitRates.mainHitRate, 50, '本命的中率が計算される');
assert.equal(report.hitRates.trifectaHitRate, 50, '三連単的中率が計算される');
assert.equal(report.hitRates.dangerPopularSuccessRate, 50, '危険人気馬成功率がdangerPopularFlewから計算される');
assert.equal(report.revenue.totalInvestment, 18000, 'ROI集計の総投資額がfundCurveRecordsから計算される');
assert.equal(report.revenue.totalPayout, 18000, 'ROI集計の総払戻額がfundCurveRecordsから計算される');
assert.equal(report.revenue.roi, 100, 'ROIが総払戻額÷総投資額で計算される');
assert.ok(report.aiEvaluation.aiOperationScore > 0 && report.aiEvaluation.aiOperationScore <= 100, 'AI運用スコアが100点満点で計算される');
assert.equal(report.trends.length, 2, 'ROI・AI運用スコア・自己進化回数推移が日別で生成される');
assert.ok(report.improvements.weakCourses[0].label.includes('阪神'), '弱点競馬場が不的中/低ROIから抽出される');

const exported = JSON.parse(engine.exportPerformanceDashboardJson({ storage: localStorageMock }));
assert.equal(exported.storageKey, 'performanceDashboardReports', 'JSON出力の保存キーが入る');
const savedReports = JSON.parse(localStorageMock.getItem('performanceDashboardReports'));
assert.equal(savedReports.length, 1, 'JSON出力時にperformanceDashboardReportsへ保存される');
assert.equal(JSON.stringify(report.sourceStorageKeys), JSON.stringify(['fundCurveRecords', 'productionOperationLogs', 'selfEvolutionLogs', 'productionResultValidationReports']), '指定localStorageキーを参照する');

console.log('performance dashboard test passed');
