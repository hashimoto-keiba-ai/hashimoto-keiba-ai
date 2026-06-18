const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const globalNetwork = require('../global-network-page.js');
const finalSystem = require('../final-system-page.js');

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

const engine = sandbox.window.HashimotoReleaseManagerEngine;
assert.equal(globalNetwork.OFFICIAL_RELEASE, '2.8', 'Global Networkは永久保存版v2.8を保護する');
assert.equal(globalNetwork.OS_VERSION, '4.0', 'Hashimoto Racing OS v4.0へ統合する');
assert.equal(finalSystem.OFFICIAL_RELEASE, '2.8', 'Final Systemも永久保存版v2.8を保護する');
assert.ok(engine, 'Version Managerエンジンが公開されている');
assert.equal(engine.VERSION, 'v7.3', '現在バージョンがv7.3である');
assert.equal(engine.REPORT_STORAGE_KEY, 'releaseManagerReports', 'レポート保存キーが正しい');
assert.equal(engine.HISTORY_STORAGE_KEY, 'releaseHistory', '履歴保存キーが正しい');
assert.equal(JSON.stringify(engine.SOURCE_KEYS), JSON.stringify([
  'finalHealthCheckReports',
  'productionReadinessAuditReports',
  'productionOperationScores',
  'performanceDashboardReports',
]), '指定された判定材料を参照する');
assert.equal(engine.RELEASE_STAGES.map((stage) => stage.label).join(','), '開発版,アルファ版,ベータ版,RC版,本番版', '5段階のリリース段階を持つ');

assert.equal(engine.calculateCompletionScore({ healthScore: 96, auditCompletion: 94, operationScore: 93, performanceScore: 95 }), 94.7, '完成度計算確認: 4材料を加重平均する');
assert.equal(engine.judgeRelease({ completionScore: 94.7, healthScore: 96, criticalErrors: 0, localStorageIntegrityOk: true }).status, 'Production Ready', '本番版条件を満たすと本番判定になる');
assert.equal(engine.judgeRelease({ completionScore: 94.7, healthScore: 96, criticalErrors: 0, localStorageIntegrityOk: false }).status, 'RC Candidate', 'localStorage整合性NGならRC判定に留める');

localStorageMock.setItem('finalHealthCheckReports', JSON.stringify([{
  score: 96,
  counts: { normal: 37, review: 0, idle: 0, error: 0 },
  storageChecks: [
    { key: 'productionRaceEntries', status: 'normal' },
    { key: 'productionRunReports', status: 'normal' },
  ],
  issues: [],
}]));
localStorageMock.setItem('productionReadinessAuditReports', JSON.stringify([{ completion: { percentage: 94, operationStatus: '本番運用可能' } }]));
localStorageMock.setItem('productionOperationScores', JSON.stringify({ score: 93, judgement: '完全運用' }));
localStorageMock.setItem('performanceDashboardReports', JSON.stringify([{ aiEvaluation: { aiOperationScore: 95 } }]));

const report = engine.buildReleaseManagerReport({ storage: localStorageMock });
assert.equal(report.version, 'v7.3', 'レポートに現在バージョンが入る');
assert.equal(report.completionScore, 94.7, '完成度スコアを算出する');
assert.equal(report.healthScore, 96, 'ヘルススコアを反映する');
assert.equal(report.releaseStageLabel, '本番版', 'リリース判定確認: 条件を満たすと本番版になる');
assert.equal(report.status, 'Production Ready', 'Status表示用の本番判定を返す');
assert.equal(report.conditions.every((condition) => condition.passed), true, '本番版条件がすべてOKになる');
assert.equal(report.localStorageIntegrityOk, true, 'localStorage整合性OKを判定する');

engine.saveReport(report, localStorageMock);
const savedReports = JSON.parse(localStorageMock.getItem('releaseManagerReports'));
assert.equal(savedReports.length, 1, 'releaseManagerReportsへ保存する');
assert.equal(savedReports[0].status, 'Production Ready', '保存レポートにリリース判定を含める');

engine.saveHistory(report, localStorageMock);
const history = JSON.parse(localStorageMock.getItem('releaseHistory'));
assert.equal(history.length, 1, '履歴保存確認: releaseHistoryへ保存する');
assert.deepEqual(Object.keys(history[0]), ['version', 'date', 'completionScore', 'healthScore', 'status', 'notes'], '履歴に必要項目を保存する');
assert.equal(history[0].completionScore, 94.7, '履歴に完成度を保存する');

localStorageMock.setItem('finalHealthCheckReports', JSON.stringify([{
  score: 92,
  counts: { error: 1 },
  storageChecks: [{ key: 'backupRestoreLogs', status: 'error' }],
  issues: [{ status: 'error', label: 'バックアップ/復元' }],
}]));
const blocked = engine.buildReleaseManagerReport({ storage: localStorageMock });
assert.equal(blocked.status, 'Beta', '重大エラーがある場合は本番/RC判定にしない');
assert.equal(blocked.conditions.find((condition) => condition.key === 'criticalErrors').passed, false, '重大エラー0件条件がNGになる');
assert.equal(blocked.conditions.find((condition) => condition.key === 'localStorage').passed, false, 'localStorage整合性条件がNGになる');

console.log('release manager test passed');
