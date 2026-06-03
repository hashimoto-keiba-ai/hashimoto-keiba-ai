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

const checklistEngine = sandbox.window.HashimotoOperationReadinessChecklistEngine;
assert.ok(checklistEngine, '実戦運用チェックリストエンジンが公開されている');
assert.equal(checklistEngine.STORAGE_KEY, 'operationReadinessChecklist', 'チェックリスト保存キーが指定どおり');
assert.equal(checklistEngine.CHECKLIST_ITEMS.length, 21, '実戦運用チェックリストは21項目');
assert.equal(checklistEngine.calculateCompletion([{ checked: true }, { checked: false }]).percentage, 50, '完成度％がチェック済み項目数から計算される');
assert.equal(checklistEngine.calculateCompletion(Array.from({ length: 10 }, (_, index) => ({ checked: index < 9 }))).mode, '本番運用可能', '90%以上で本番運用可能判定になる');

let state = checklistEngine.buildChecklistState({ storage: localStorageMock });
assert.equal(state.completion.percentage, 0, '初期状態は完成度0%');
checklistEngine.saveChecklistState(state, localStorageMock);
assert.equal(JSON.parse(localStorageMock.getItem('operationReadinessChecklist')).completion.percentage, 0, '初期チェック状態をlocalStorage保存できる');

const sampleLog = {
  race: { raceName: '実戦チェックテスト' },
  aiTop5: [{ number: 1 }],
  kamianaTop5: [{ number: 2 }],
  dangerTop5: [{ number: 3 }],
  trifectaCandidates: [{ notation: '1→2→3' }],
  win5Candidates: [{ number: 1, zone: 'A' }],
  simulationWinTop5: [{ number: 1 }],
  evTop: [{ number: 1, ev: 120 }],
  recommendedInvestments: [{ notation: '1→2→3', recommendedAmount: 1000 }],
  godRace: { label: '神レース', score: 91 },
};
localStorageMock.setItem('sampleRaceTestLog', JSON.stringify(sampleLog));
localStorageMock.setItem('sampleRaceResultValidationLog', JSON.stringify({
  result: { first: { number: 1 } },
  judgements: { trifectaHit: true },
  roi: 240,
  selfEvolutionLog: { id: 'evo-1' },
  osUpdateCandidates: { adopt: ['神穴補正採用'], pending: [], delete: [] },
}));
localStorageMock.setItem('operationDiagnosticReports', JSON.stringify([{ id: 'report-1', roi: 240 }]));
state = checklistEngine.updateManualCheck('raceCsvImport', true, localStorageMock);
state = checklistEngine.updateManualCheck('raceCsvValidation', true, localStorageMock);
state = checklistEngine.updateManualCheck('dangerPopularExclusion', true, localStorageMock);
state = checklistEngine.updateManualCheck('jsonExport', true, localStorageMock);
const saved = JSON.parse(localStorageMock.getItem('operationReadinessChecklist'));
assert.equal(saved.manualChecks.jsonExport, true, '手動チェック状態をoperationReadinessChecklistへ保存できる');
assert.equal(saved.completion.percentage, 100, '自動・手動チェック済み項目から完成度100%を計算できる');
assert.equal(saved.completion.mode, '本番運用可能', '全項目OKで本番運用可能になる');
console.log('operation readiness checklist test passed');
