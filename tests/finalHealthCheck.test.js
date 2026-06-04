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

const engine = sandbox.window.HashimotoFinalHealthCheckEngine;
assert.ok(engine, '最終統合ヘルスチェックエンジンが公開されている');
assert.equal(engine.REPORT_STORAGE_KEY, 'finalHealthCheckReports', '保存キーが正しい');
assert.equal(JSON.stringify(engine.LOCAL_STORAGE_KEYS), JSON.stringify([
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
  'productionOperationMode',
  'productionOperationScores',
  'backupRestoreLogs',
]), '指定localStorageキーをすべて確認する');

localStorageMock.setItem('productionRaceEntries', JSON.stringify([{ course: '東京競馬場', raceNumber: 11 }]));
localStorageMock.setItem('productionRunReports', JSON.stringify([{
  summary: {
    aiIndex: 'AI指数',
    validation: 'AI指数検証',
    kamiana: '神穴',
    dangerPopular: '危険人気馬',
    trifecta: '三連単',
    win5: 'WIN5',
    simulation: '未来シミュレーター',
    ev: 'EV',
    godRace: '神レース',
    allocation: '資金配分',
  },
  aiRanking: [{ horseName: '指数王', score: 91 }],
  kamianaRanking: [{ horseName: '穴金星', score: 88 }],
  dangerPopularRanking: [{ horseName: '過剰人気', score: 82 }],
  trifecta: [{ notation: '1→2→3' }],
  win5: [{ notation: '1-2-3-4-5' }],
  evRanking: [{ raceLabel: '東京11R', ev: 176 }],
}]));
localStorageMock.setItem('raceDatabase', JSON.stringify([{ course: '東京競馬場', raceNumber: 11, result: { first: 1 }, aiIndex: 91, kamiana: 88, trifecta: '三連単' }]));
localStorageMock.setItem('raceSelectionReports', JSON.stringify([{ ranking: [{ raceLabel: '東京11R', score: 92, recommendation: '勝負 資金集中 神レース', ev: 176 }] }]));
localStorageMock.setItem('fundManagementReports', JSON.stringify([{ summary: { fundManagement: true }, recommendation: { recommendedStake: 24000, riskLevel: '標準' }, raceProposals: [{ raceLabel: '東京11R', suggestedStake: 24000 }] }]));
localStorageMock.setItem('roiOptimizationReports', JSON.stringify([{ metrics: { total: { roi: 138.5 } }, roiOptimization: 'ROI最適化' }]));
localStorageMock.setItem('weaknessAnalysisReports', JSON.stringify([{ weakness: '阪神芝', improvement: '改善ルール' }]));
localStorageMock.setItem('selfLearningSuggestions', JSON.stringify([{ selfLearning: true, suggestion: '改善', status: '採用', targetRule: '重み補正' }]));
localStorageMock.setItem('courseEvolutionReports', JSON.stringify([{ course: '東京', evolution: 'course evolution', status: '採用' }]));
localStorageMock.setItem('fundCurveRecords', JSON.stringify([{ stake: 10000, payout: 18000, roi: 180 }]));
localStorageMock.setItem('productionOperationLogs', JSON.stringify([
  { operationType: '本番レース入力', status: '完了' },
  { operationType: 'AI一括実行', status: '完了' },
  { operationType: '買い目生成', status: '完了' },
  { operationType: '資金配分計算', status: '完了' },
  { operationType: '結果検証', status: '完了' },
  { operationType: '自己学習ログ保存', status: '完了' },
  { operationType: 'バックアップ実行', status: '完了' },
]));
localStorageMock.setItem('productionOperationMode', JSON.stringify('production'));
localStorageMock.setItem('productionOperationScores', JSON.stringify([{ score: 96, mode: 'production' }]));
localStorageMock.setItem('backupRestoreLogs', JSON.stringify([{ operationType: 'バックアップ', status: '完了', backup: true }]));

const report = engine.buildFinalHealthCheckReport({ storage: localStorageMock });
assert.equal(report.items.length, engine.HEALTH_ITEM_DEFINITIONS.length, '全ヘルス項目を判定する');
assert.equal(report.storageChecks.length, engine.LOCAL_STORAGE_KEYS.length, 'localStorageキー確認を生成する');
assert.ok(report.score >= 95 && report.score <= 100, 'ヘルススコア計算確認: 正常データで高スコアになる');
assert.equal(report.storageChecks.every((check) => check.status !== 'error'), true, 'localStorageキー確認: すべて読込可能');
assert.equal(report.items.every((item) => item.status === 'normal'), true, '全AI機能が正常判定になる');

localStorageMock.setItem('backupRestoreLogs', '{ invalid json');
const errorReport = engine.buildFinalHealthCheckReport({ storage: localStorageMock });
const backupStorage = errorReport.storageChecks.find((check) => check.key === 'backupRestoreLogs');
const backupItem = errorReport.items.find((item) => item.key === 'backupRestore');
assert.equal(backupStorage.status, 'error', '不正JSONはlocalStorageキー確認でエラーになる');
assert.equal(backupItem.status, 'error', 'localStorageエラーは関連AI機能にも伝播する');
assert.ok(errorReport.issues.some((item) => item.status === 'error'), '問題一覧にエラーが入る');
assert.ok(errorReport.repairGuides.some((guide) => guide.target === 'バックアップ/復元'), '修復ガイドに確認場所と必要操作が入る');

engine.saveReport(report, localStorageMock);
const saved = JSON.parse(localStorageMock.getItem('finalHealthCheckReports'));
assert.equal(saved.length, 1, 'finalHealthCheckReports保存確認: レポートをlocalStorageへ保存する');
assert.equal(saved[0].storageKey, 'finalHealthCheckReports', '保存されたレポートに保存キーを含める');

console.log('final health check test passed');
