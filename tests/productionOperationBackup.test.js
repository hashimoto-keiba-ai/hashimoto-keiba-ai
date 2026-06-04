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

const backupEngine = sandbox.window.HashimotoProductionOperationBackupEngine;
assert.ok(backupEngine, '本番運用バックアップエンジンが公開されている');
assert.equal(backupEngine.PRE_RESTORE_BACKUP_KEY, 'preRestoreBackup', '復元前バックアップキーがpreRestoreBackupである');
assert.equal(backupEngine.RESTORE_LOG_STORAGE_KEY, 'backupRestoreLogs', '復元ログキーがbackupRestoreLogsである');
assert.equal(backupEngine.REQUIRED_BACKUP_TARGETS.length, 9, '本番運用バックアップ対象が9キーである');

const seedData = {
  productionRaceEntries: [{ id: 'race-1', race: { course: '東京' } }],
  productionRunReports: [{ id: 'run-1' }, { id: 'run-2' }],
  productionResultValidationReports: [{ id: 'validation-1', roi: 180 }],
  selfEvolutionLogs: { logs: { resultVerifications: [{ id: 'evo-1' }], backtests: [], improvementProposals: [] } },
  fundCurveRecords: [{ id: 'fund-1', stake: 1000, payout: 2200 }],
  operationDiagnosticReports: [{ id: 'diagnostic-1' }],
  operationReadinessChecklist: { completion: { percentage: 100 } },
  sampleRaceTestLog: { race: { raceName: 'サンプル' }, aiTop5: [{ number: 1 }] },
  sampleRaceResultValidationLog: { roi: 220, selfEvolutionLog: { id: 'sample-evo-1' } },
};
Object.entries(seedData).forEach(([key, value]) => localStorageMock.setItem(key, JSON.stringify(value)));

const payload = backupEngine.createBackupPayload(localStorageMock);
assert.equal(payload.type, backupEngine.PRODUCTION_BACKUP_TYPE, 'エクスポートJSONが本番運用バックアップ形式になる');
assert.equal(payload.keys.length, 9, 'エクスポートJSONに必要キー一覧が入る');
assert.equal(payload.summary.totalItemCount, 12, 'エクスポートJSONの件数サマリーを生成できる');
assert.equal(payload.data.productionRunReports.itemCount, 2, 'productionRunReportsの件数を算出できる');
assert.equal(payload.data.fundCurveRecords.value[0].payout, 2200, 'fundCurveRecordsをエクスポートできる');

const validation = backupEngine.validateBackupPayload(payload);
assert.equal(validation.ok, true, '完全なバックアップJSONはインポート前チェックOKになる');
assert.equal(validation.missingRequiredKeys.length, 0, '必要キー不足がない');
assert.equal(validation.overwriteTargets.length, 9, '上書き対象9キーを表示できる');
assert.equal(validation.itemCounts.productionRunReports, 2, 'インポート前チェックで含まれる件数を表示できる');

const incompleteValidation = backupEngine.validateBackupPayload({ productionRunReports: [] });
assert.equal(incompleteValidation.ok, false, '必要キー不足があるJSONは警告状態になる');
assert.ok(incompleteValidation.missingRequiredKeys.includes('productionRaceEntries'), '不足キーを検出できる');
assert.ok(incompleteValidation.warnings.some((warning) => warning.includes('必要キー')), '不足時の警告文を生成できる');

localStorageMock.setItem('productionRunReports', JSON.stringify([{ id: 'current-run' }]));
const restoreResult = backupEngine.restoreBackupPayload(payload, localStorageMock);
assert.deepEqual(JSON.parse(localStorageMock.getItem('productionRunReports')).map((item) => item.id), ['run-1', 'run-2'], 'バックアップJSONからproductionRunReportsを復元できる');
assert.ok(localStorageMock.getItem('preRestoreBackup'), '復元前にpreRestoreBackupが保存される');
const preRestoreBackup = JSON.parse(localStorageMock.getItem('preRestoreBackup'));
assert.ok(preRestoreBackup.keys.includes('productionRunReports'), 'preRestoreBackupに現在データが含まれる');
assert.equal(JSON.parse(preRestoreBackup.values.productionRunReports.raw)[0].id, 'current-run', 'preRestoreBackupは復元前の値を保持する');
const restoreLogs = JSON.parse(localStorageMock.getItem('backupRestoreLogs'));
assert.equal(restoreLogs[0].action, 'production-operation-restore', 'backupRestoreLogsに復元ログが保存される');
assert.equal(restoreLogs[0].restoredKeys.length, 9, '復元ログに復元キー一覧が保存される');
assert.equal(restoreResult.restoredKeys.length, 9, '復元結果が復元キー一覧を返す');
assert.equal(JSON.parse(localStorageMock.getItem('hashimoto-keiba-ai:production-race-entry:v1'))[0].id, 'race-1', 'productionRaceEntries復元時に既存互換キーへも反映される');
assert.equal(JSON.parse(localStorageMock.getItem('hashimoto-keiba-ai:self-evolution-logs:v1')).logs.resultVerifications[0].id, 'evo-1', 'selfEvolutionLogs復元時に既存互換キーへも反映される');

console.log('production operation backup test passed');
