const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

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

const engine = sandbox.window.HashimotoFundManagementEngine;
assert.ok(engine, 'AI資金管理エンジンが公開されている');
assert.equal(engine.REPORT_STORAGE_KEY, 'fundManagementReports', 'レポート保存キーがfundManagementReportsである');
assert.equal(engine.SETTINGS_STORAGE_KEY, 'fundManagementSettings', '設定保存キーがfundManagementSettingsである');

localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { investment: 10000, payout: 0 },
  { investment: 10000, payout: 0 },
  { investment: 10000, payout: 0 },
]));
localStorageMock.setItem('dailyRaceRankings', JSON.stringify({
  ranking: [
    { raceLabel: '中京11R', score: 93, recommendation: '資金集中' },
    { raceLabel: '東京10R', score: 78, recommendation: '通常購入' },
    { raceLabel: '阪神9R', score: 58, recommendation: '少額購入' },
    { raceLabel: '京都8R', score: 35, recommendation: '見送り' },
  ],
}));
localStorageMock.setItem('roiOptimizationReports', JSON.stringify([{ summary: { totalRoi: 125 }, metrics: { trifectaRoi: 132, win5Roi: 70 } }]));

const report = engine.buildFundManagementReport({ currentBankroll: 200000, mode: 'standard', storage: localStorageMock, persist: true });
assert.equal(report.summary.totalInvestment, 30000, '資金計算確認: 総投資額を集計する');
assert.equal(report.summary.totalPayout, 0, '資金計算確認: 総払戻額を集計する');
assert.equal(report.summary.totalProfit, -30000, '資金計算確認: 総利益を集計する');
assert.equal(report.summary.roi, 0, '資金計算確認: ROIを計算する');
assert.equal(report.summary.losingStreak, 3, '連敗保護確認: 3連敗を検出する');
assert.ok(report.recommendation.streakAdjustment.includes('50%'), '連敗保護確認: 3連敗で投資額50%にする');
assert.ok(report.recommendation.recommendedStake > 0, '投資額自動計算確認: 3連敗では停止せず減額する');
assert.ok(report.recommendation.recommendedStake <= report.recommendation.maxStake, '投資額自動計算確認: 推奨上限額以内に収める');
assert.equal(report.ticketAllocation.length, 6, '券種別配分確認: 6券種を出力する');
assert.deepEqual(report.ticketAllocation.map((item) => item.ticketType), ['三連単', 'WIN5', '単勝', '複勝', '馬連', 'ワイド'], '券種別配分確認: 指定券種を表示する');
assert.ok(['低リスク', '中リスク', '高リスク', '危険'].includes(report.recommendation.riskLevel), 'リスク判定確認: 4段階のいずれかを返す');
assert.deepEqual(report.raceProposals.map((item) => item.investmentProposal), ['資金集中', '通常購入', '少額購入', '見送り'], 'レース別投資提案確認: 勝負レース選定AIの推奨を資金提案へ変換する');
assert.ok(localStorageMock.getItem('fundManagementReports'), 'localStorage保存確認: fundManagementReportsへ保存する');
assert.ok(localStorageMock.getItem('fundManagementSettings'), 'localStorage保存確認: fundManagementSettingsへ保存する');

localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { investment: 10000, payout: 0 },
  { investment: 10000, payout: 0 },
  { investment: 10000, payout: 0 },
  { investment: 10000, payout: 0 },
  { investment: 10000, payout: 0 },
]));
const stopped = engine.buildFundManagementReport({ currentBankroll: 200000, mode: 'aggressive', storage: localStorageMock });
assert.equal(stopped.summary.losingStreak, 5, '連敗保護確認: 5連敗を検出する');
assert.equal(stopped.recommendation.recommendedStake, 0, '連敗保護確認: 5連敗で投資停止にする');
assert.equal(stopped.recommendation.recommendedTicketType, '見送り', '連敗保護確認: 投資停止時は見送りを推奨する');

localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { investment: 10000, payout: 18000 },
  { investment: 10000, payout: 19000 },
  { investment: 10000, payout: 22000 },
]));
const accelerated3 = engine.buildFundManagementReport({ currentBankroll: 200000, mode: 'standard', storage: localStorageMock });
assert.equal(accelerated3.summary.winningStreak, 3, '連勝加速確認: 3連勝を検出する');
assert.ok(accelerated3.recommendation.streakAdjustment.includes('120%'), '連勝加速確認: 3連勝で投資額120%にする');

localStorageMock.setItem('fundCurveRecords', JSON.stringify([
  { investment: 10000, payout: 18000 },
  { investment: 10000, payout: 19000 },
  { investment: 10000, payout: 22000 },
  { investment: 10000, payout: 20000 },
  { investment: 10000, payout: 25000 },
]));
const accelerated5 = engine.buildFundManagementReport({ currentBankroll: 200000, mode: 'standard', storage: localStorageMock });
assert.equal(accelerated5.summary.winningStreak, 5, '連勝加速確認: 5連勝を検出する');
assert.ok(accelerated5.recommendation.streakAdjustment.includes('150%'), '連勝加速確認: 5連勝で投資額150%にする');

const exported = JSON.parse(engine.exportFundManagementJson({ currentBankroll: 200000, mode: 'ultra', storage: localStorageMock }));
assert.equal(exported.storageKeys.reports, 'fundManagementReports', 'JSONエクスポート確認: レポート保存キーを含む');
assert.equal(exported.storageKeys.settings, 'fundManagementSettings', 'JSONエクスポート確認: 設定保存キーを含む');
assert.equal(exported.mode, 'ultra', 'JSONエクスポート確認: 資金モードを含む');

console.log('fundManagement tests passed');
