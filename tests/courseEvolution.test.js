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

const storage = localStorageMock;
storage.setItem('raceDatabase', JSON.stringify([
  { id: 'tokyo-race-1', date: '2026-05-31', course: '東京競馬場', investmentAmount: 1000, payoutAmount: 2200, hit: true, kamiana: [{}], dangerPopular: [{}], godRaceJudgement: { label: '神レースS' }, validationReport: { judgements: { kamianaHit: true, dangerPopularSuccess: true, trifectaHit: true, godRaceSuccess: true } } },
  { id: 'nakayama-race-1', date: '2026-04-12', course: '中山競馬場', investmentAmount: 1000, payoutAmount: 0, hit: false, kamiana: [{}], dangerPopular: [{}], validationReport: { judgements: { kamianaHit: false, dangerPopularSuccess: false, trifectaHit: false } } },
]));
storage.setItem('productionResultValidationReports', JSON.stringify([
  { id: 'tokyo-validation-1', race: { course: '東京競馬場' }, totalInvestment: 1000, payout: 1300, summary: { hit: true }, judgements: { kamianaHit: true, dangerPopularSuccess: true, trifectaHit: true, godRaceSuccess: true }, godRace: { label: '神レースA' } },
  { id: 'hanshin-validation-1', race: { course: '阪神競馬場' }, totalInvestment: 1000, payout: 0, summary: { hit: false }, judgements: { kamianaHit: false, dangerPopularSuccess: false, trifectaHit: false } },
]));
storage.setItem('selfEvolutionLogs', JSON.stringify({ logs: { resultVerifications: [{ id: 'tokyo-evo', race: { course: '東京競馬場' } }, { id: 'chukyo-evo', race: { course: '中京競馬場' } }] } }));

const engine = sandbox.window.HashimotoCourseEvolutionEngine;
assert.ok(engine, 'コース別自己進化エンジンが公開されている');
assert.equal(engine.COURSE_EVOLUTION_REPORTS_KEY, 'courseEvolutionReports');
assert.equal(engine.COURSE_SPECIFIC_SUGGESTIONS_KEY, 'courseSpecificSuggestions');

const payload = engine.buildCourseEvolutionReports({ storage, persist: true });
assert.equal(payload.reports.length, 8, '8競馬場のコース別AIを集計する');
const tokyo = payload.reports.find((item) => item.course === '東京');
const nakayama = payload.reports.find((item) => item.course === '中山');
const hanshin = payload.reports.find((item) => item.course === '阪神');
assert.equal(tokyo.label, '東京AI', '東京AIラベルを持つ');
assert.equal(tokyo.metrics.roi, 175, '東京AIのROIをraceDatabaseと検証レポートから集計する');
assert.equal(tokyo.metrics.hitRate, 100, '東京AIの的中率を集計する');
assert.equal(nakayama.metrics.roi, 0, '中山AIを分離集計する');
assert.ok(hanshin.weaknesses.includes('危険人気馬判定不足'), '阪神AIの危険人気馬弱点を分析する');
assert.ok(payload.suggestions.every((item) => ['course', 'targetRule', 'before', 'after', 'reason', 'evidenceCount', 'impactEstimate', 'status'].every((key) => Object.prototype.hasOwnProperty.call(item, key))), 'コース別改善提案の保存項目を満たす');

const savedReports = JSON.parse(storage.getItem('courseEvolutionReports'));
const savedSuggestions = JSON.parse(storage.getItem('courseSpecificSuggestions'));
assert.equal(savedReports.storageKey, 'courseEvolutionReports', 'courseEvolutionReportsへ保存する');
assert.ok(savedSuggestions.length >= 8, 'courseSpecificSuggestionsへ改善提案を保存する');

const suggestion = savedSuggestions.find((item) => item.course === '中山');
const applyResult = engine.applyCourseSpecificSuggestion(suggestion, { storage });
assert.ok(applyResult.logs.some((log) => log.targetWeight.startsWith('nakayamaWeights.')), 'コース別重み適用ログを保存する');
const settings = sandbox.window.HashimotoAiWeightEngine.getSettings(storage);
assert.equal(settings.nakayamaWeights[suggestion.targetRule], suggestion.after, 'aiWeightSettingsの中山AI重みへ適用する');

console.log('course evolution test passed');
