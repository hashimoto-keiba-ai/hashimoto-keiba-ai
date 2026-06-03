const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const localStorageMock = (() => {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
})();

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
vm.runInContext(fs.readFileSync('src/raceSimulator.js', 'utf8'), sandbox, { filename: 'src/raceSimulator.js' });

const scoreEngine = sandbox.window.HashimotoKeibaAiScoreEngine;
const betEngine = sandbox.window.HashimotoBetEngine;
const evEngine = sandbox.window.HashimotoEVEngine;
const raceSimulator = sandbox.window.HashimotoRaceSimulator;
const capitalEngine = sandbox.window.HashimotoCapitalEngine;
assert.ok(scoreEngine, 'AI指数エンジンが公開されている');
assert.ok(betEngine, '買い目生成エンジンが公開されている');
assert.ok(evEngine, 'AIオッズEV監視エンジンが公開されている');
assert.ok(raceSimulator, 'AIレース未来シミュレーターが公開されている');
assert.ok(capitalEngine, 'AI資金配分エンジンが公開されている');

const horses = scoreEngine.calculateAllHorseScores([
  { number: 1, name: '危険トップ', popularity: 1, odds: 2.0, runningStyle: '逃げ', training: 'C', aiIndex: 99, kamianaIndex: 45, dangerIndex: 92, aiWinRate: 18, aiQuinellaRate: 34, aiPlaceRate: 48 },
  { number: 2, name: '指数二位', popularity: 2, odds: 4.0, runningStyle: '先行', training: 'A', aiIndex: 95, kamianaIndex: 55, dangerIndex: 20, aiWinRate: 32, aiQuinellaRate: 53, aiPlaceRate: 68 },
  { number: 3, name: '指数三位', popularity: 3, odds: 6.0, runningStyle: '好位', training: 'B', aiIndex: 90, kamianaIndex: 50, dangerIndex: 30, aiWinRate: 23, aiQuinellaRate: 42, aiPlaceRate: 60 },
  { number: 4, name: '指数四位', popularity: 4, odds: 8.0, runningStyle: '自在', training: 'B', aiIndex: 85, kamianaIndex: 52, dangerIndex: 40, aiWinRate: 16, aiQuinellaRate: 31, aiPlaceRate: 50 },
  { number: 5, name: '神穴一位', popularity: 9, odds: 28.0, runningStyle: '差し', training: 'A', aiIndex: 70, kamianaIndex: 97, dangerIndex: 25, aiWinRate: 9, aiQuinellaRate: 21, aiPlaceRate: 38 },
  { number: 6, name: '神穴二位', popularity: 12, odds: 45.0, runningStyle: '追込', training: 'B', aiIndex: 68, kamianaIndex: 94, dangerIndex: 35, aiWinRate: 6, aiQuinellaRate: 15, aiPlaceRate: 32 },
], { course: '東京', distance: 1600, surface: '芝', going: '良', fieldSize: 12 });


const singleEV = evEngine.calculateEV({ name: '妙味馬', odds: 8, aiWinRate: 18, aiQuinellaRate: 33, aiPlaceRate: 48, popularity: 6 });
assert.ok(singleEV.overlay, 'AI勝率と現在オッズからオーバーレイを判定できる');
assert.equal(singleEV.recommendation, singleEV.ev >= 120 ? '強オーバーレイ' : 'オーバーレイ', 'EV判定ラベルが返る');

const trifecta = betEngine.buildTrifectaPayload(horses, { fieldSize: 12 });
assert.equal(trifecta.targetPoints, 12, '11〜14頭は12点制御になる');
assert.ok(trifecta.summary.total > 0, 'AI指数計算後に三連単買い目候補が生成される');
assert.ok(!trifecta.candidates.firstCandidates.some((horse) => horse.number === 1), '危険人気馬は1着候補から外れる');
assert.ok(trifecta.candidates.thirdCandidates.some((horse) => horse.number === 5), '神穴指数上位は3着候補へ入る');
assert.ok(trifecta.candidates.thirdCandidates.some((horse) => horse.number === 6), '神穴指数2位も3着候補へ入る');
assert.ok([...trifecta.tickets.main, ...trifecta.tickets.attack, ...trifecta.tickets.jackpot].every((ticket) => ticket.evidence.length === 3), '各買い目に指数根拠が付与される');

const evDashboard = evEngine.buildEVDashboardPayload(horses, { trifectaPayload: trifecta, win5Payload: betEngine.buildWin5ClassificationPayload(horses) });
assert.ok(evDashboard.evRanking[0].ev >= evDashboard.evRanking.at(-1).ev, 'EVランキングが降順になる');
assert.ok(evDashboard.kamianaEVRanking.some((horse) => horse.number === 5 || horse.number === 6), '神穴EVランキングに神穴候補が入る');
assert.ok(evDashboard.dangerWarnings.some((horse) => horse.number === 1), '危険人気馬EV警告に過剰人気馬が入る');
assert.ok(evDashboard.trifectaEV.length > 0 && Number.isFinite(evDashboard.trifectaEV[0].ev), '三連単EVが算出される');
assert.ok(Number.isFinite(evDashboard.win5EV.ev), 'WIN5EVが算出される');

const kellyStake = capitalEngine.calculateKellyStake({ hitProbability: 25, odds: 6, bankroll: 50000, riskCoefficient: 0.25 });
assert.ok(kellyStake.rawKellyPercent > 0, 'calculateKellyStake は的中確率とオッズからケリー比率を返す');
assert.ok(kellyStake.recommendedAmount > 0, 'calculateKellyStake は推奨投資額を返す');

const capitalPayload = capitalEngine.buildCapitalAllocationPayload({
  trifectaEV: evDashboard.trifectaEV,
  win5EV: evDashboard.win5EV,
  raceEV: evDashboard.evRanking,
  dailyBudget: 50000,
  raceLimit: 10000,
  win5Limit: 5000,
  riskCoefficient: 0.25,
  battleRaceCount: 3,
  godRaceIndex: 92,
  trifectaROI: 18,
  win5ROI: 5,
  persist: true,
});
assert.ok(capitalPayload.trifecta.length > 0, '三連単EVから資金配分候補が生成される');
assert.ok(capitalPayload.win5.length > 0, 'WIN5EVから別管理の資金配分候補が生成される');
assert.ok(capitalPayload.win.length > 0 && capitalPayload.place.length > 0 && capitalPayload.quinella.length > 0 && capitalPayload.wide.length > 0, '単勝・複勝・馬連・ワイドも券種別に管理される');
assert.ok(capitalPayload.trifecta.every((item) => Number.isFinite(item.rawKellyFraction) && Number.isFinite(item.recommendedAmount)), 'ケリー基準と推奨投資額が算出される');
assert.ok(capitalPayload.trifecta.some((item) => ['strong', 'normal', 'light', 'skip'].includes(item.decision)), '資金配分判定が返る');
assert.ok(capitalPayload.godRaceCandidates.every((item) => item.ev >= 110 && item.dangerIndex < 60), '神レース候補はEV上位かつ低危険度で抽出される');
assert.ok(localStorageMock.getItem('fundManagementSettings'), '資金配分設定がlocalStorageに保存される');
assert.ok(localStorageMock.getItem('fundAllocationResults'), '資金配分結果がlocalStorageに保存される');

const capitalCurve = capitalEngine.buildCapitalCurveMonitorPayload({
  results: [
    { date: '2026-05-01', course: '東京', raceNumber: 11, ticketType: '三連単', stake: 3600, payout: 0, hit: false },
    { date: '2026-05-02', course: '京都', raceNumber: 10, ticketType: '馬連', stake: 2000, payout: 8200, hit: true },
    { date: '2026-05-03', course: '阪神', raceNumber: 11, ticketType: 'WIN5', stake: 4800, payout: 0, hit: false },
    { date: '2026-05-04', course: '東京', raceNumber: 12, ticketType: '三連単', stake: 2400, payout: 18400, hit: true },
  ],
  allocationPayload: capitalPayload,
  warningRoi: 85,
  targetRoi: 110,
});
assert.equal(capitalCurve.curve.length, 4, '投資ログから資金曲線ポイントが生成される');
assert.ok(capitalCurve.total.roi > 0 && Number.isFinite(capitalCurve.total.maxDrawdownRate), '累計ROIと最大ドローダウンが算出される');
assert.ok(['grow', 'neutral', 'protect', 'stop'].includes(capitalCurve.monitor.status), '資金曲線モニターが運用ステータスを返す');
assert.ok(capitalCurve.bestTicketType && capitalCurve.recommendations.length >= 3, '券種別ROIとAI推奨コメントが返る');

const win5 = betEngine.buildWin5ClassificationPayload(horses);
assert.ok(!Object.values(win5.zones).flat().some((horse) => horse.number === 1), '危険人気馬はWIN5候補から外れる');
assert.ok(win5.zones.c.some((horse) => horse.number === 5) || win5.zones.d.some((horse) => horse.number === 5), '神穴はWIN5 C/Dゾーンへ入る');

const singleRace = raceSimulator.simulateRace(horses, { raceContext: { course: '東京競馬場', distance: 1600, surface: '芝', fieldSize: 12 }, seed: 7 });
assert.equal(singleRace.length, horses.length, 'simulateRaceは全出走馬の着順を返す');
assert.deepEqual(singleRace.slice(0, 3).map((horse) => horse.finishPosition), [1, 2, 3], '上位3頭に着順が付与される');

const simulation100 = raceSimulator.runMonteCarloSimulation(horses, { simulationCount: 100, raceContext: { course: '東京競馬場', distance: 1600, surface: '芝', fieldSize: 12 }, seed: 42 });
const simulation300 = raceSimulator.runMonteCarloSimulation(horses, { simulationCount: 300, raceContext: { course: '東京競馬場', distance: 1600, surface: '芝', fieldSize: 12 }, seed: 42 });
const simulation1000 = raceSimulator.runMonteCarloSimulation(horses, { simulationCount: 1000, raceContext: { course: '東京競馬場', distance: 1600, surface: '芝', fieldSize: 12 }, seed: 42 });
assert.equal(simulation100.simulationCount, 100, '100回シミュレーションへ切替できる');
assert.equal(simulation300.simulationCount, 300, '300回シミュレーションへ切替できる');
assert.equal(simulation1000.simulationCount, 1000, '1000回シミュレーションへ切替できる');
assert.ok(simulation1000.rankings.winRate[0].firstRate >= simulation1000.rankings.winRate.at(-1).firstRate, '勝率ランキングが降順になる');
assert.ok(simulation1000.rankings.placeRate.every((horse) => Number.isFinite(horse.placeRate) && Number.isFinite(horse.quinellaRate)), '複勝率・連対率が算出される');
assert.ok(simulation1000.trifectaRates.length > 0 && Number.isFinite(simulation1000.trifectaRates[0].rate), '三連単出現率が算出される');
assert.ok(simulation1000.rankings.win5Candidate.every((horse) => Number.isFinite(horse.win5CandidateRate)), 'WIN5候補率が算出される');
console.log('betEngine and raceSimulator tests passed');
