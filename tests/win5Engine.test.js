const assert = require('assert');
const engine = require('../win5-page.js');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage();

assert.equal(engine.VERSION, '2.7');
assert.deepEqual(engine.SOURCE_KEYS, [
  'integrated-os.json',
  'prediction-engine.json',
  'learning-engine.json',
  'profit-db.json',
  'return-ai-db.json',
  'history-db.json'
]);

const races = engine.DEFAULT_RACES;
assert.equal(engine.judgeAFix(races[0]), true, 'A固定判定');
assert.equal(engine.judgeBMain(races[1]), true, 'B本線判定');
assert.equal(engine.judgeCTarget(races[2]), true, 'C狙い判定');
assert.equal(engine.judgeDBomb(races[3]), true, 'D爆穴判定');
assert.equal(engine.judgeFavoriteCut({ popularity: 1, score: 70 }), true, '1人気消し判定');

const upsetOrder = engine.generateUpsetOrder(races);
assert.equal(upsetOrder[0], 'race4:D', '荒れ順生成');

assert.equal(engine.calculateHitRate(races), 90, '的中率計算');
assert.equal(Math.round(engine.calculateExpectedPayout(races)), 660228, '期待配当計算');
assert.equal(engine.calculateTicketCount({ safe: 1, balance: 2, high: 4 }), 40, '点数自動計算');

const tickets = engine.generateTickets(races);
assert.equal(tickets.length, 5, '買い目生成');
assert.deepEqual(tickets, ['A固定候補', 'B本線候補', 'C狙い候補', 'D爆穴候補', 'A固定候補2']);

const candidate = engine.buildWin5Candidate({ races, budget: 12000 });
assert.equal(candidate.safeType, 'A固定候補 / A固定候補2', 'WIN5候補生成');
assert.equal(candidate.balanceType, 'B本線候補 / C狙い候補', 'バランス型WIN5生成');
assert.equal(candidate.highPayoutType, 'D爆穴候補', '高配当型WIN5生成');
assert.equal(candidate.thirtyMillionLine, '監視', '3000万ラインAI');
assert.equal(candidate.oneMillionLine, '監視', '100万ラインAI');

engine.saveWin5History({ storage, candidate });
assert.equal(storage.readJson(engine.STORAGE_KEYS.win5).version, '2.7', 'win5-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.pattern).records[0].pattern, 'A固定+B本線+C狙い+D爆穴', 'win5-pattern-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.history).records[0].selectedHorses.length, 5, 'win5-history-dbへ保存する');

const status = engine.buildWin5Status({ storage });
assert.equal(status.ticketCount, 40, '履歴保存後のステータス取得');

console.log('automated WIN5 test passed');
