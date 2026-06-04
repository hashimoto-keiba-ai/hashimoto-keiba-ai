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

const engine = sandbox.window.HashimotoRaceSelectionEngine;
assert.ok(engine, '勝負レース選定AIエンジンが公開されている');
assert.equal(engine.REPORT_STORAGE_KEY, 'raceSelectionReports', '選定レポート保存キーがraceSelectionReportsである');
assert.equal(engine.RANKING_STORAGE_KEY, 'dailyRaceRankings', '当日ランキング保存キーがdailyRaceRankingsである');

localStorageMock.setItem('raceDatabase', JSON.stringify([
  { race: { course: '中京競馬場', raceNumber: 11 }, investment: 10000, payout: 24000, godRace: { label: 'S 神勝負' }, godRaceSuccess: true },
  { race: { course: '東京競馬場', raceNumber: 10 }, investment: 10000, payout: 2000, godRace: { label: 'C 見送り' }, godRaceSuccess: false },
]));
localStorageMock.setItem('productionResultValidationReports', JSON.stringify([
  { race: { course: '中京競馬場', raceNumber: 9 }, totalInvestment: 6000, payout: 12000, judgements: { godRaceSuccess: true } },
]));
localStorageMock.setItem('selfLearningSuggestions', JSON.stringify([{ id: 's1', status: '採用' }, { id: 's2', status: '保留' }]));
localStorageMock.setItem('courseEvolutionReports', JSON.stringify([{ course: '中京競馬場', score: 82 }]));

const races = [
  {
    race: { date: '2026-06-04', course: '中京競馬場', raceNumber: 11, raceName: '左京S' },
    horses: [
      { number: 1, name: 'ゴールドブリッツ', popularity: 1, odds: 2.2, aiIndex: 96, kamianaIndex: 64, dangerIndex: 28 },
      { number: 6, name: 'レッドオービット', popularity: 7, odds: 18, aiIndex: 84, kamianaIndex: 92, dangerIndex: 35 },
      { number: 9, name: 'スターライン', popularity: 3, odds: 6, aiIndex: 82, kamianaIndex: 75, dangerIndex: 42 },
    ],
    ev: { evRanking: [{ name: 'ゴールドブリッツ', ev: 148 }, { name: 'レッドオービット', ev: 132 }] },
    capital: { summary: { totalRecommended: 18000, strongCount: 2, normalCount: 1, skipCount: 0 } },
  },
  {
    race: { date: '2026-06-04', course: '東京競馬場', raceNumber: 10, raceName: '多摩川S' },
    horses: [
      { number: 2, name: 'ブルーフォース', popularity: 1, odds: 1.8, aiIndex: 62, kamianaIndex: 30, dangerIndex: 92 },
      { number: 5, name: 'ノースライト', popularity: 4, odds: 8, aiIndex: 58, kamianaIndex: 42, dangerIndex: 81 },
    ],
    ev: { evRanking: [{ name: 'ブルーフォース', ev: 71 }] },
    capital: { summary: { totalRecommended: 0, strongCount: 0, normalCount: 0, skipCount: 4 } },
  },
];

const report = engine.buildRaceSelectionReport({ races, storage: localStorageMock, persist: true, date: '2026-06-04' });
assert.equal(report.ranking.length, 2, 'ランキング生成確認: 2レースのランキングを生成する');
assert.equal(report.ranking[0].course, '中京', 'ランキング生成確認: 高評価レースが1位になる');
assert.ok(report.ranking[0].score > report.ranking[1].score, 'スコア計算確認: 好条件レースの点数が高い');
assert.ok(report.ranking.every((item) => item.score >= 0 && item.score <= 100), 'スコア計算確認: 勝負レーススコアは0〜100点');
assert.ok(['神レース', '勝負レース'].includes(report.ranking[0].classification), 'レース分類確認: 1位は神レースまたは勝負レース');
assert.equal(report.ranking[0].recommendation, report.ranking[0].classification === '神レース' ? '資金集中' : '通常購入', '資金推奨確認: 分類に応じた推奨を返す');
assert.equal(report.ranking[1].classification, '見送りレース', 'レース分類確認: 低EV・高危険度は見送りになる');
assert.equal(report.ranking[1].recommendation, '見送り', '資金推奨確認: 見送りレースは見送り推奨');
assert.ok(report.ranking[0].components.aiConfidence > 0, '判定材料確認: AI指数信頼度を計算する');
assert.ok(report.ranking[0].components.kamianaPower > 0, '判定材料確認: 神穴指数を計算する');
assert.ok(report.ranking[0].components.dangerSafety > report.ranking[1].components.dangerSafety, '判定材料確認: 危険人気馬指数を安全度へ反映する');
assert.ok(report.ranking[0].components.courseRoi > report.ranking[1].components.courseRoi, '判定材料確認: コース別ROIを反映する');
assert.ok(report.ranking[0].components.capital > report.ranking[1].components.capital, '判定材料確認: 資金配分AIを反映する');
assert.ok(report.top10.battleRaces.length >= 1, '本日の勝負レースTOP10を生成する');
assert.ok(report.top10.skipRaces.length >= 1, '本日の見送りレースTOP10を生成する');
assert.ok(localStorageMock.getItem('raceSelectionReports'), 'localStorage保存確認: raceSelectionReportsへ保存する');
assert.ok(localStorageMock.getItem('dailyRaceRankings'), 'localStorage保存確認: dailyRaceRankingsへ保存する');

const exported = JSON.parse(engine.exportRaceSelectionJson({ storage: localStorageMock }));
assert.equal(exported.storageKeys.reports, 'raceSelectionReports', 'JSONエクスポート確認: レポート保存キーを含む');
assert.ok(Array.isArray(exported.ranking), 'JSONエクスポート確認: ランキングを含む');

console.log('raceSelection tests passed');
