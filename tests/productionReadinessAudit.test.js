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

const auditEngine = sandbox.window.HashimotoProductionReadinessAuditEngine;
assert.ok(auditEngine, '本番運用完成度監査エンジンが公開されている');
assert.equal(auditEngine.STORAGE_KEY, 'productionReadinessAuditReports', '監査レポート保存キーが指定どおり');
assert.equal(auditEngine.AUDIT_ITEMS.length, 20, '監査項目は20項目');
assert.equal(auditEngine.calculateCompletion([{ status: '実装済み' }, { status: '部分実装' }, { status: '未実装' }, { status: '要確認' }]).percentage, 44, '完成度％が実装状況の重みから計算される');
assert.equal(auditEngine.calculateCompletion(Array.from({ length: 20 }, () => ({ status: '実装済み' }))).operationStatus, '本番運用可能', '全項目実装済みで本番運用可能になる');

let report = auditEngine.buildAuditReport({ storage: localStorageMock });
assert.equal(report.items.length, 20, '監査レポートに20項目が含まれる');
assert.ok(report.improvementCandidates.length > 0, '初期状態では改善候補が生成される');
assert.match(report.summaryText, /橋本競馬AI 本番運用完成度監査レポート/, '監査レポート本文が生成される');

auditEngine.saveReport(report, localStorageMock);
assert.equal(JSON.parse(localStorageMock.getItem('productionReadinessAuditReports'))[0].id, report.id, '監査レポートをlocalStorageへ保存できる');

const productionRunReport = {
  race: { raceName: '本番監査テスト' },
  aiTop5: [{ number: 1 }],
  kamianaTop5: [{ number: 2 }],
  dangerTop5: [{ number: 3 }],
  trifectaCandidates: [{ notation: '1→2→3' }],
  win5Candidates: [{ number: 1, zone: 'A' }],
  simulationWinTop5: [{ number: 1 }],
  evTop: [{ number: 1, ev: 132 }],
  recommendedInvestments: [{ notation: '1→2→3', recommendedAmount: 1000 }],
  godRace: { label: '神レース', score: 94 },
};
localStorageMock.setItem('productionRaceEntries', JSON.stringify([{ id: 'race-1', horses: [{ number: 1, name: '監査ホース' }] }]));
localStorageMock.setItem('productionRunReports', JSON.stringify([productionRunReport]));
localStorageMock.setItem('productionResultValidationReports', JSON.stringify([{ result: { first: { number: 1 } }, judgements: { trifectaHit: true }, roi: 210, selfEvolutionLog: { id: 'evo-1' } }]));
localStorageMock.setItem('selfEvolutionLogs', JSON.stringify({ logs: { resultVerifications: [{ id: 'evo-1' }], backtests: [], improvementProposals: [] } }));
localStorageMock.setItem('fundCurveRecords', JSON.stringify([{ stake: 1000, payout: 2100 }]));
localStorageMock.setItem('operationDiagnosticReports', JSON.stringify([{ id: 'diagnostic-1' }]));
localStorageMock.setItem('preRestoreBackup', JSON.stringify({ id: 'backup-1' }));
localStorageMock.setItem('backupRestoreLogs', JSON.stringify([{ id: 'restore-1' }]));
localStorageMock.setItem('hashimoto-keiba-ai:pages-public-url:v1', 'https://example.com/hashimoto-keiba-ai/');

report = auditEngine.buildAuditReport({ storage: localStorageMock });
assert.equal(report.completion.percentage, 100, '本番データが揃うと完成度100%になる');
assert.equal(report.completion.operationStatus, '本番運用可能', '完成度100%で本番運用可能になる');
assert.equal(report.improvementCandidates.length, 0, '全項目実装済みの場合は改善候補なしになる');
assert.equal(report.items.find((item) => item.id === 'restore').status, '実装済み', '復元ログから復元項目を実装済み判定できる');
console.log('production readiness audit test passed');
