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

const engine = sandbox.window.HashimotoCompleteIntegrationDashboardEngine;
assert.ok(engine, '完全統合ダッシュボードエンジンが公開されている');
assert.equal(engine.REPORT_STORAGE_KEY, 'completeIntegrationDashboardReports', '統合レポート保存キーが正しい');
assert.equal(JSON.stringify(engine.SOURCE_KEYS), JSON.stringify([
  'productionRaceEntries',
  'productionRunReports',
  'raceDatabase',
  'raceSelectionReports',
  'fundManagementReports',
  'roiOptimizationReports',
  'weaknessAnalysisReports',
  'selfLearningSuggestions',
  'courseEvolutionReports',
  'fundCurveRecords',
  'productionOperationLogs',
]), '指定localStorageキーをすべて参照する');

localStorageMock.setItem('productionOperationMode', JSON.stringify('production'));
localStorageMock.setItem('productionRaceEntries', JSON.stringify([{ date: '2026-06-04', course: '東京競馬場', raceNumber: 11 }]));
localStorageMock.setItem('raceSelectionReports', JSON.stringify([{ ranking: [
  { raceLabel: '東京11R 安田記念', score: 92, recommendation: '資金集中', investmentProposal: '資金集中' },
  { raceLabel: '阪神10R', score: 76, recommendation: '通常購入', investmentProposal: '通常購入' },
  { raceLabel: '京都8R', score: 41, recommendation: '見送り', investmentProposal: '見送り' },
] }]));
localStorageMock.setItem('productionRunReports', JSON.stringify([
  {
    summary: { status: '完了', aiIndex: 'AI指数', trifecta: '三連単', win5: 'WIN5', simulation: '未来シミュレーター', ev: 'EV', godRace: '神レース' },
    aiRanking: [{ horseName: '指数王', score: 91 }],
    kamianaRanking: [{ horseName: '穴金星', score: 88, race: { course: '東京競馬場', raceNumber: 11 } }],
    dangerPopularRanking: [{ horseName: '過剰人気', score: 82, race: { course: '阪神競馬場', raceNumber: 10 } }],
    trifecta: [{ notation: '1→2→3' }],
    win5: [{ notation: '1-2-3-4-5' }],
    evRanking: [{ raceLabel: '東京11R 安田記念', ev: 186, notation: '1→5→8' }],
  },
]));
localStorageMock.setItem('raceDatabase', JSON.stringify([{ course: '東京競馬場', raceNumber: 11, result: { first: 1 }, payout: 18000, investment: 10000 }]));
localStorageMock.setItem('fundManagementReports', JSON.stringify([{ recommendation: { recommendedStake: 24000 }, raceProposals: [
  { raceLabel: '東京11R 安田記念', suggestedStake: 18000 },
  { raceLabel: '阪神10R', suggestedStake: 6000 },
] }]));
localStorageMock.setItem('roiOptimizationReports', JSON.stringify([{ metrics: { total: { roi: 138.5 } } }]));
localStorageMock.setItem('weaknessAnalysisReports', JSON.stringify([{ status: '要確認', target: '阪神芝' }]));
localStorageMock.setItem('selfLearningSuggestions', JSON.stringify([{ status: '採用', targetRule: 'evCorrection' }]));
localStorageMock.setItem('courseEvolutionReports', JSON.stringify([{ course: '東京', status: '採用' }]));
localStorageMock.setItem('fundCurveRecords', JSON.stringify([{ stake: 10000, payout: 18000 }]));
localStorageMock.setItem('productionOperationLogs', JSON.stringify([
  { operationType: '本番レース入力', status: '完了' },
  { operationType: 'AI一括実行', status: '完了' },
  { operationType: '買い目生成', status: '完了' },
  { operationType: '資金配分計算', status: '完了' },
  { operationType: '結果検証', status: '完了' },
  { operationType: '自己学習ログ保存', status: '完了' },
  { operationType: 'バックアップ実行', status: '完了' },
]));

const report = engine.buildCompleteIntegrationDashboardReport({ storage: localStorageMock });
assert.equal(report.summary.battleRaceCount, 2, '勝負レース数を計算する');
assert.equal(report.summary.godRaceCount, 1, '神レース数を計算する');
assert.equal(report.summary.skipRaceCount, 1, '見送りレース数を計算する');
assert.equal(report.summary.recommendedTotalInvestment, 24000, '推奨総投資額を計算する');
assert.equal(report.summary.expectedRoi, 138.5, '想定ROIをROI最適化レポートから計算する');
assert.ok(report.summary.aiOperationScore > 70 && report.summary.aiOperationScore <= 100, '統合スコア計算確認: 稼働状態とROIから100点以内で算出する');
assert.equal(report.summary.productionStatus, 'production', '本番運用ステータスを参照する');
assert.equal(report.operationSteps.every((step) => step.complete), true, '本番運用ステータスバーを計算する');
assert.equal(report.importantCards.bestBattleRace.label, '東京11R 安田記念', '最有力勝負レースを抽出する');
assert.equal(report.importantCards.maxEvRace.value, 186, '最大EVレースを抽出する');
assert.equal(report.importantCards.maxInvestmentRace.label, '東京11R 安田記念', '最大投資推奨レースを抽出する');

const statusByKey = Object.fromEntries(report.moduleStatuses.map((item) => [item.key, item.statusLabel]));
assert.equal(statusByKey.aiIndex, '稼働中', 'AI指数の稼働状態を計算する');
assert.equal(statusByKey.kamiana, '稼働中', '神穴の稼働状態を計算する');
assert.equal(statusByKey.fundManagement, '稼働中', '資金管理の稼働状態を計算する');
assert.equal(statusByKey.roiOptimization, '稼働中', 'ROI最適化の稼働状態を計算する');
assert.equal(statusByKey.backup, '稼働中', 'バックアップの稼働状態を計算する');

engine.saveReport(report, localStorageMock);
const saved = JSON.parse(localStorageMock.getItem('completeIntegrationDashboardReports'));
assert.equal(saved.length, 1, '統合レポートをlocalStorageへ保存する');

console.log('complete integration dashboard test passed');
