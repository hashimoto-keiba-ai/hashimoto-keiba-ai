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

const logEngine = sandbox.window.HashimotoProductionOperationLogEngine;
assert.ok(logEngine, '本番運用オペレーションログエンジンが公開されている');
assert.equal(logEngine.OPERATION_LOG_STORAGE_KEY, 'productionOperationLogs', '保存キーがproductionOperationLogsである');
assert.ok(logEngine.OPERATION_TYPES.includes('AI一括実行'), 'AI一括実行が操作種別に含まれる');
assert.ok(logEngine.OPERATION_TYPES.includes('復元実行'), '復元実行が操作種別に含まれる');

logEngine.appendOperationLog({
  timestamp: '2026-06-04T10:00:00.000Z',
  operationType: '本番レース入力',
  race: { course: '東京競馬場', raceNumber: 11, raceName: '安田記念' },
  summary: '東京11R 安田記念を保存',
  status: '完了',
  memo: '18頭',
}, localStorageMock);
logEngine.appendOperationLog({
  timestamp: '2026-06-04T10:05:00.000Z',
  operationType: 'AI一括実行',
  racecourse: '東京競馬場',
  raceNumber: 11,
  raceName: '安田記念',
  summary: 'AI指数・買い目生成まで実行',
  status: '完了',
  memo: 'AI指数TOP=本命馬',
}, localStorageMock);
logEngine.appendOperationLog({
  timestamp: '2026-06-05T09:00:00.000Z',
  operationType: '結果検証',
  racecourse: '阪神競馬場',
  raceNumber: 10,
  raceName: '灘S',
  summary: 'ROI 80%',
  status: '警告',
  memo: '三連単不的中',
}, localStorageMock);

const savedLogs = JSON.parse(localStorageMock.getItem('productionOperationLogs'));
assert.equal(savedLogs.length, 3, 'ログがlocalStorageへ保存される');
assert.deepEqual(Object.keys(savedLogs[0]).filter((key) => ['timestamp', 'operationType', 'racecourse', 'raceNumber', 'raceName', 'summary', 'status', 'memo'].includes(key)).sort(), ['memo', 'operationType', 'raceName', 'raceNumber', 'racecourse', 'status', 'summary', 'timestamp'].sort(), '指定ログ項目が保存される');

const filteredByDate = logEngine.filterOperationLogs(savedLogs, { date: '2026-06-04' });
assert.equal(filteredByDate.length, 2, '日付で絞り込みできる');
const filteredByCourse = logEngine.filterOperationLogs(savedLogs, { racecourse: '阪神' });
assert.equal(filteredByCourse.length, 1, '競馬場で部分一致絞り込みできる');
const filteredByOperation = logEngine.filterOperationLogs(savedLogs, { operationType: 'AI一括実行' });
assert.equal(filteredByOperation[0].summary, 'AI指数・買い目生成まで実行', '操作種別で絞り込みできる');
const filteredByStatus = logEngine.filterOperationLogs(savedLogs, { status: '警告' });
assert.equal(filteredByStatus[0].racecourse, '阪神競馬場', '状態で絞り込みできる');

const exported = JSON.parse(logEngine.exportLogsJson(filteredByDate, { date: '2026-06-04' }));
assert.equal(exported.storageKey, 'productionOperationLogs', 'JSONエクスポートに保存キーが入る');
assert.equal(exported.count, 2, 'JSONエクスポートに件数が入る');
assert.equal(exported.filters.date, '2026-06-04', 'JSONエクスポートに絞り込み条件が入る');
assert.equal(exported.logs[0].operationType, 'AI一括実行', 'JSONエクスポートにログ一覧が入る');

const backupEngine = sandbox.window.HashimotoProductionOperationBackupEngine;
const payload = backupEngine.createBackupPayload(localStorageMock);
const restoreResult = backupEngine.restoreBackupPayload(payload, localStorageMock, { requireComplete: false });
assert.ok(Array.isArray(restoreResult.restoredKeys), '復元処理を実行できる');
assert.equal(JSON.parse(localStorageMock.getItem('productionOperationLogs'))[0].operationType, '復元実行', '復元実行がオペレーションログに自動保存される');

console.log('production operation log test passed');
