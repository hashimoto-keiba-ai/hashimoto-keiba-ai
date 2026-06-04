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

const engine = sandbox.window.HashimotoWeaknessAnalysisEngine;
assert.ok(engine, 'AI弱点分析エンジンが公開されている');
assert.equal(engine.STORAGE_KEY, 'weaknessAnalysisReports', '保存キーがweaknessAnalysisReportsである');
assert.equal(JSON.stringify(engine.SOURCE_KEYS), JSON.stringify(['raceDatabase', 'fundCurveRecords', 'productionResultValidationReports']), '指定3キーを分析対象にする');

localStorageMock.setItem('raceDatabase', JSON.stringify([
  {
    id: 'tokyo-weak',
    date: '2026-06-01',
    course: '東京競馬場',
    raceNumber: 11,
    distance: 1600,
    surface: '芝',
    going: '良',
    investmentAmount: 10000,
    payoutAmount: 0,
    roi: 0,
    hit: false,
    aiIndexTop3: [{ number: 7, name: '差し馬', popularity: 3 }],
    predictionPayload: { horses: [{ number: 7, name: '差し馬', style: '差し' }], godRace: { label: '神レースA', skip: false } },
    validationReport: { summary: { nextFixPoints: ['4角で差し届かず'] }, judgements: { kamianaHit: false, dangerPopularFlew: false, godRaceSuccess: false } },
  },
  {
    id: 'nakayama-strong',
    date: '2026-06-02',
    course: '中山競馬場',
    raceNumber: 10,
    distance: 1800,
    surface: 'ダート',
    going: '稍重',
    investmentAmount: 9000,
    payoutAmount: 27000,
    roi: 300,
    hit: true,
    aiIndexTop3: [{ number: 2, name: '先行馬', popularity: 1 }],
    predictionPayload: { horses: [{ number: 2, name: '先行馬', style: '先行' }], godRace: { label: '神レースS', skip: false } },
    validationReport: { judgements: { kamianaHit: true, dangerPopularFlew: true, godRaceSuccess: true } },
  },
]));
localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { id: 'fund-tokyo', date: '2026-06-01', course: '東京競馬場', raceNumber: 11, distance: 1600, surface: '芝', investment: 10000, payout: 0 },
  { id: 'fund-nakayama', date: '2026-06-02', course: '中山競馬場', raceNumber: 10, distance: 1800, surface: 'ダート', investment: 9000, payout: 27000 },
]));
localStorageMock.setItem('productionResultValidationReports', JSON.stringify([
  {
    id: 'validation-tokyo',
    race: { date: '2026-06-01', course: '東京競馬場', raceNumber: 11, distance: 1600, surface: '芝', going: '良' },
    result: { firstNumber: 1, firstPopularity: 8 },
    totalInvestment: 10000,
    payout: 0,
    roi: 0,
    judgements: { trifectaHit: false, kamianaHit: false, dangerPopularFlew: false, godRaceSuccess: false },
    summary: { hit: false, nextFixPoints: ['東京芝1600の差し補正不足'] },
  },
  {
    id: 'validation-nakayama',
    race: { date: '2026-06-02', course: '中山競馬場', raceNumber: 10, distance: 1800, surface: 'ダート', going: '稍重' },
    result: { firstNumber: 2, firstPopularity: 1 },
    totalInvestment: 9000,
    payout: 27000,
    roi: 300,
    judgements: { trifectaHit: true, kamianaHit: true, dangerPopularFlew: true, godRaceSuccess: true },
    summary: { hit: true, nextFixPoints: ['先行補正有効'] },
  },
]));

const report = engine.buildWeaknessAnalysisReport({ storage: localStorageMock });
assert.equal(report.sourceCounts.raceDatabase, 2, 'raceDatabaseを読み込む');
assert.equal(report.sourceCounts.fundCurveRecords, 2, 'fundCurveRecordsを読み込む');
assert.equal(report.sourceCounts.productionResultValidationReports, 2, 'productionResultValidationReportsを読み込む');
assert.equal(report.sourceCounts.mergedRaceCount, 2, '同一レースをマージして分析する');
assert.equal(report.rankings.weakCourses[0].label, '東京', '苦手競馬場TOPに東京を抽出する');
assert.equal(report.rankings.strongCourses[0].label, '中山', '得意競馬場TOPに中山を抽出する');
assert.equal(report.rankings.weakDistances[0].label, '1600', '苦手距離TOPに1600mを抽出する');
assert.equal(report.rankings.strongDistances[0].label, '1800', '得意距離TOPに1800mを抽出する');
assert.ok(report.rankings.weakGoings.some((item) => item.label === '良'), '苦手馬場を算出する');
assert.ok(report.rankings.strongPopularityZones.some((item) => item.label === '1番人気'), '得意人気ゾーンを算出する');
assert.ok(report.rankings.weakStyles.some((item) => item.label === '差し'), '苦手脚質を算出する');
assert.ok(report.rankings.strongStyles.some((item) => item.label === '先行'), '得意脚質を算出する');
assert.ok(report.rankings.weakConditions[0].weaknessScore >= 0 && report.rankings.weakConditions[0].weaknessScore <= 100, '弱点スコアは0〜100点である');
assert.ok(report.rankings.strongConditions[0].strengthScore >= 0 && report.rankings.strongConditions[0].strengthScore <= 100, '得意スコアは0〜100点である');
assert.equal(report.improvementCandidates[0].condition, '東京芝1600', '自動改善候補の条件名を出す');
assert.equal(report.improvementCandidates[0].suggestion, '差し補正不足', '自動改善候補を提示する');

engine.saveWeaknessAnalysisReport(report, localStorageMock);
const savedReports = JSON.parse(localStorageMock.getItem('weaknessAnalysisReports'));
assert.equal(savedReports[0].id, report.id, '分析結果をweaknessAnalysisReportsへ保存する');
const exported = JSON.parse(engine.exportWeaknessAnalysisJson({ storage: localStorageMock }));
assert.equal(exported.storageKey, 'weaknessAnalysisReports', 'JSONエクスポートに保存キーを含める');
assert.equal(JSON.parse(localStorageMock.getItem('weaknessAnalysisReports')).length, 2, 'JSONエクスポート時にも保存される');

console.log('weakness analysis test passed');
