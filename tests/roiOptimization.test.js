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

const engine = sandbox.window.HashimotoRoiOptimizationEngine;
const capitalEngine = sandbox.window.HashimotoCapitalEngine;
assert.ok(engine, 'ROI最適化AIエンジンが公開されている');
assert.equal(engine.REPORT_STORAGE_KEY, 'roiOptimizationReports', '保存キーがroiOptimizationReportsである');
assert.equal(engine.SETTINGS_STORAGE_KEY, 'roiOptimizationSettings', '設定キーがroiOptimizationSettingsである');

localStorageMock.setItem('raceDatabase', JSON.stringify([
  { id: 'r1', race: { course: '中京競馬場', surface: 'ダ', distance: 1400 }, investment: 10000, payout: 25000, trifectaHit: true, kamianaHit: true, dangerPopularSuccess: true, godRaceSuccess: true, ticketType: 'trifecta' },
  { id: 'r2', race: { course: '東京競馬場', surface: '芝', distance: 1600 }, investment: 10000, payout: 2000, win5Hit: false, ticketType: 'win5' },
]));
localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { id: 'f1', course: '中京競馬場', surface: 'ダ', distance: 1400, stake: 5000, payout: 10000, ticketType: 'trifecta' },
  { id: 'f2', course: '東京競馬場', surface: '芝', distance: 1600, stake: 5000, payout: 0, ticketType: 'win5' },
]));
localStorageMock.setItem('productionResultValidationReports', JSON.stringify([
  { id: 'v1', race: { course: '中京競馬場', surface: 'ダ', distance: 1400 }, totalInvestment: 3000, payout: 9000, judgements: { trifectaHit: true, win5Hit: false, kamianaHit: true, dangerPopularFlew: true, godRaceSuccess: true } },
  { id: 'v2', race: { course: '東京競馬場', surface: '芝', distance: 1600 }, totalInvestment: 3000, payout: 0, judgements: { trifectaHit: false, win5Hit: false, kamianaHit: false, dangerPopularFlew: false, godRaceSuccess: false } },
]));
localStorageMock.setItem('selfLearningSuggestions', JSON.stringify([{ id: 's1', status: '採用' }]));
localStorageMock.setItem('courseEvolutionReports', JSON.stringify([{ id: 'c1' }]));

const report = engine.buildRoiOptimizationReport({ storage: localStorageMock });
assert.equal(report.sourceStorageKeys.join(','), 'raceDatabase,fundCurveRecords,productionResultValidationReports,selfLearningSuggestions,courseEvolutionReports', '指定localStorageキーを参照する');
assert.equal(report.metrics.total.investment, 36000, 'ROI集計確認: 総投資を合算する');
assert.equal(report.metrics.total.payout, 46000, 'ROI集計確認: 総払戻を合算する');
assert.equal(report.metrics.total.roi, 127.8, 'ROI集計確認: 総ROIを計算する');
assert.equal(report.metrics.trifecta.roi, 244.4, '三連単ROIを抽出計算する');
assert.equal(report.metrics.win5.roi, 13.3, 'WIN5 ROIを抽出計算する');
assert.ok(report.metrics.kamiana.roi >= 250, '神穴ROIを集計する');
assert.ok(report.metrics.dangerPopular.roi >= 250, '危険人気馬除外成功ROIを集計する');
assert.ok(report.metrics.godRace.roi >= 250, '神レースROIを集計する');

const chukyo = report.conditions.find((item) => item.condition === '中京ダ1400');
const tokyo = report.conditions.find((item) => item.condition === '東京芝1600');
assert.ok(chukyo.roiScore > tokyo.roiScore, 'ROIスコア計算確認: 高ROI条件が高スコアになる');
assert.equal(engine.judgeInvestmentIntensity(chukyo.roiScore), '強勝負', '投資強度判定: 高スコアは強勝負');
assert.equal(engine.judgeInvestmentIntensity(tokyo.roiScore), '見送り', '投資強度判定: 低スコアは見送り');
assert.ok(report.suggestions.some((item) => item.includes('ROIが高い条件')), 'ROIが高い条件を強化提案する');
assert.ok(report.suggestions.some((item) => item.includes('WIN5 ROIが低い条件を抑制')), 'WIN5 ROI抑制提案を生成する');

const correction = engine.getCapitalCorrectionForRace({ course: '中京競馬場', surface: 'ダ', distance: 1400 }, localStorageMock);
assert.equal(correction.investmentIntensity, '強勝負', '資金配分連動確認: 高ROI条件は強勝負補正になる');
assert.ok(correction.multiplier > 1, '資金配分連動確認: 推奨投資額に増額補正を返す');
const allocation = capitalEngine.buildCapitalAllocationPayload({
  race: { course: '東京競馬場', surface: '芝', distance: 1600 },
  bankroll: 50000,
  godRaceIndex: 90,
  trifectaROI: 100,
  trifectaEV: [{ notation: '1→2→3', estimatedOdds: 20, probability: 20, ev: 400, aiWinRate: 25, dangerIndex: 10 }],
});
assert.equal(allocation.trifecta[0].roiOptimizationIntensity, '見送り', '資金配分連動確認: 低ROI条件は買い目へ見送り強度を付与する');
assert.equal(allocation.trifecta[0].recommendedAmount, 0, '資金配分連動確認: 見送り補正で推奨投資額を0にする');

const exported = JSON.parse(engine.exportRoiOptimizationJson({ storage: localStorageMock }));
assert.equal(exported.storageKey, 'roiOptimizationReports', 'JSONエクスポートに保存キーが入る');
assert.ok(JSON.parse(localStorageMock.getItem('roiOptimizationReports')).length >= 1, 'localStorage保存確認: レポートが保存される');
assert.ok(JSON.parse(localStorageMock.getItem('roiOptimizationSettings')).strengthenRoi, 'localStorage保存確認: 設定が保存される');

console.log('roi optimization test passed');
