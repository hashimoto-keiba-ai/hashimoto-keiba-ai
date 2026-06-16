const assert = require('assert');
const engine = require('../bankroll-page.js');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage();
const bets = engine.DEFAULT_BETS;

assert.equal(engine.VERSION, '2.8', '回収率管理AIのバージョンが2.8である');
assert.deepEqual(engine.SOURCE_KEYS, ['integrated-os.json', 'prediction-engine.json', 'learning-engine.json', 'profit-db.json', 'return-ai-db.json', 'win5-db.json', 'history-db.json'], '指定DBと連携する');

assert.equal(engine.calculateTotalBetAmount(bets), 35000, '総投資額計算');
assert.equal(engine.calculateTotalPayout(bets), 102000, '総回収額計算');
assert.equal(engine.calculateTotalProfit(bets), 67000, '総利益計算');
assert.equal(engine.calculateCurrentBankroll({ initialBankroll: 100000, bets }), 167000, '現在残高計算');
assert.equal(engine.calculateReturnRate(bets), 291.4, '回収率計算');
assert.equal(engine.calculateMonthlyReturnRate(bets, '2026-06'), 312, '月別回収率計算');

const betTypeRates = engine.calculateBetTypeReturnRates(bets);
assert.equal(betTypeRates['三連単'].returnRate, 409.1, '券種別回収率');
const courseRates = engine.calculateCourseReturnRates(bets);
assert.equal(courseRates['東京'].returnRate, 458.8, '競馬場別回収率');
const distanceRates = engine.calculateDistanceReturnRates(bets);
assert.equal(distanceRates['芝1600'].returnRate, 458.8, '距離別回収率');

assert.equal(engine.extractHighestPayout(bets).payout, 66000, '最高配当抽出');
assert.equal(engine.judgeStrongestCourse(bets), '東京', '最強競馬場判定');
assert.equal(engine.judgeStrongestDistance(bets), '芝1600', '最強距離判定');
assert.equal(engine.judgeStrongestBetType(bets), '三連単', '最強券種判定');

const record = engine.saveBankrollHistory({ storage, initialBankroll: 100000 });
assert.equal(record.currentBankroll, 167000, '保存時に現在残高を返す');
assert.equal(storage.readJson(engine.STORAGE_KEYS.bankroll).version, '2.8', 'bankroll-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.betHistory).records.length, 4, 'bet-history-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.returnRate).records[0].monthlyReturnRate, 312, 'return-rate-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.profitHistory).records[0].bestRace, '東京 11R', 'profit-history-dbへ保存する');

console.log('bankroll management test passed');
