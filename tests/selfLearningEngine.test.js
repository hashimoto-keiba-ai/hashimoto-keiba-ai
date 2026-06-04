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

const weaknessReport = {
  id: 'weakness-report-1',
  sourceCounts: { mergedRaceCount: 3 },
  summary: { roi: 61.5 },
  rankings: {
    weakCourses: [{ label: '東京', races: 2, roi: 0, hitRate: 0, weaknessScore: 91 }],
    strongCourses: [{ label: '中山', races: 1, roi: 220, hitRate: 100, weaknessScore: 10 }],
    weakDistances: [{ label: '1600', races: 2, roi: 0, hitRate: 0, weaknessScore: 88 }],
    weakStyles: [{ label: '差し', races: 2, roi: 0, hitRate: 0, weaknessScore: 86 }],
    weakPopularityZones: [{ label: '2〜3番人気', races: 2, roi: 0, hitRate: 0, weaknessScore: 82 }],
    weakConditions: [{ label: '東京芝1600', races: 2, roi: 0, hitRate: 0, weaknessScore: 93 }],
  },
};

localStorageMock.setItem('raceDatabase', JSON.stringify([
  { id: 'r1', date: '2026-06-01', course: '東京', raceNumber: 11, investmentAmount: 10000, payoutAmount: 0 },
  { id: 'r2', date: '2026-06-02', course: '中山', raceNumber: 10, investmentAmount: 8000, payoutAmount: 17600 },
]));
localStorageMock.setItem('weaknessAnalysisReports', JSON.stringify([weaknessReport]));
localStorageMock.setItem('productionResultValidationReports', JSON.stringify([
  { id: 'v1', summary: { nextFixPoints: ['低EV買い目を削除候補化', '東京芝1600の差し補正不足'] }, osUpdateCandidates: { pending: ['危険人気馬条件を追加'] } },
]));
localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { id: 'f1', stake: 10000, payout: 0 },
  { id: 'f2', investment: 8000, payout: 17600 },
]));
localStorageMock.setItem('selfEvolutionLogs', JSON.stringify({ logs: { resultVerifications: [{ id: 'e1' }], adoptedRules: [] } }));

const engine = sandbox.window.HashimotoSelfLearningEngine;
assert.ok(engine, '自己学習エンジンが公開されている');
assert.equal(engine.STORAGE_KEY, 'selfLearningSuggestions', '保存キーはselfLearningSuggestionsである');
assert.equal(JSON.stringify(engine.SOURCE_KEYS), JSON.stringify(['raceDatabase', 'weaknessAnalysisReports', 'productionResultValidationReports', 'fundCurveRecords', 'selfEvolutionLogs']), '指定5キーを参照する');

const suggestions = engine.buildSuggestions({ storage: localStorageMock, persist: true });
assert.ok(suggestions.length >= 7, '弱点分析から複数の改善提案を生成する');
assert.ok(suggestions.some((item) => item.targetArea === '競馬場別補正' && item.suggestedRule.includes('強化')), '競馬場別補正の強化を提案する');
assert.ok(suggestions.some((item) => item.targetArea === '競馬場別補正' && item.suggestedRule.includes('弱化')), '競馬場別補正の弱化を提案する');
assert.ok(suggestions.some((item) => item.targetArea === '距離別補正'), '距離別補正を提案する');
assert.ok(suggestions.some((item) => item.targetArea === '脚質補正'), '脚質補正を提案する');
assert.ok(suggestions.some((item) => item.targetArea === '危険人気馬条件'), '危険人気馬条件を提案する');
assert.ok(suggestions.some((item) => item.targetArea === '神穴条件'), '神穴条件を提案する');
assert.ok(suggestions.some((item) => item.targetArea === 'EV判定条件'), 'EV判定条件を提案する');
assert.ok(suggestions.some((item) => item.targetArea === '資金配分リスク係数'), '資金配分リスク係数を提案する');

const saved = JSON.parse(localStorageMock.getItem('selfLearningSuggestions'));
assert.equal(saved.length, suggestions.length, 'selfLearningSuggestionsへ保存する');
['date', 'targetArea', 'targetCondition', 'currentRule', 'suggestedRule', 'reason', 'evidenceCount', 'impactEstimate', 'status', 'memo'].forEach((key) => {
  assert.ok(Object.prototype.hasOwnProperty.call(saved[0], key), `${key}を改善提案フォーマットに含める`);
});

const target = saved[0];
engine.updateSuggestionStatus({ id: target.id, status: '採用', memo: '次走から反映', storage: localStorageMock });
assert.equal(JSON.parse(localStorageMock.getItem('selfLearningSuggestions'))[0].status, '採用', '採用へ更新できる');
engine.updateSuggestionStatus({ id: target.id, status: '却下', memo: '根拠不足', storage: localStorageMock });
assert.equal(JSON.parse(localStorageMock.getItem('selfLearningSuggestions'))[0].status, '却下', '却下へ更新できる');
engine.updateSuggestionStatus({ id: target.id, status: '保留', memo: '追加検証', storage: localStorageMock });
assert.equal(JSON.parse(localStorageMock.getItem('selfLearningSuggestions'))[0].status, '保留', '保留へ更新できる');
engine.updateSuggestionStatus({ id: target.id, status: '採用', memo: '自己進化ログ反映', storage: localStorageMock });
const additions = engine.reflectAdoptedSuggestionsToSelfEvolutionLogs({ storage: localStorageMock });
assert.equal(additions.length, 1, '採用済み改善をselfEvolutionLogsへ反映する');
assert.equal(JSON.parse(localStorageMock.getItem('selfEvolutionLogs')).logs.adoptedRules[0].sourceSuggestionId, target.id, 'selfEvolutionLogsに提案IDを保持する');

const summary = engine.summarizeSuggestions({ storage: localStorageMock });
assert.equal(summary.learningRaceCount, 3, '学習対象レース数を弱点分析レポートから集計する');
assert.equal(summary.adoptedCount, 1, '採用済み改善数を集計する');

console.log('self learning engine test passed');
