const assert = require('assert');
const engine = require('../auto-review-page.js');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage();
const base = engine.DEFAULT_REVIEW;

assert.equal(engine.VERSION, '2.8', '全自動検証AIのバージョンが2.8である');
assert.deepEqual(engine.SOURCE_KEYS, ['integrated-os.json', 'prediction-engine.json', 'learning-engine.json', 'self-evolution-db.json', 'evolution-rule-db.json', 'failure-pattern-db.json', 'success-pattern-db.json', 'research-lab-db.json', 'profit-db.json', 'return-ai-db.json', 'win5-db.json', 'bankroll-db.json', 'history-db.json'], '指定DBと連携する');

assert.equal(engine.compareResult(base).hit, true, '結果自動照合');
assert.equal(engine.compareAxisHorse(base), true, '本命馬照合');
assert.equal(engine.compareMarkedHorses(base), true, '印馬照合');
assert.equal(engine.compareTrifectaPattern(base), true, '三連単パターン照合');
assert.equal(engine.compareWin5(base), true, 'WIN5照合');
assert.equal(engine.judgeHit(base), true, '的中判定');
assert.equal(engine.judgeMiss({ ...base, resultHorse: '別馬' }), true, '不的中判定');
assert.ok(engine.analyzeFailure({ ...base, resultHorse: '別馬' }).includes('修正'), '失敗原因自動分析');
assert.ok(engine.analyzeSuccess(base).includes('一致'), '成功要因自動分析');
assert.ok(engine.generateReviewText(base).includes('検証'), '検証文自動生成');
assert.ok(engine.generateUpdateText(base).includes('更新'), 'アップデート文自動生成');
assert.ok(engine.generateLearningRule(base).includes('検証結果'), '学習ルール自動生成');

const record = engine.saveReviewHistory({ storage });
assert.equal(record.hit, true, '検証履歴保存で的中を保持する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.review).version, '2.8', 'auto-review-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.compare).records[0].axisHorse, '本命サンプル', 'result-compare-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.update).records[0].selfEvolutionLinked, true, 'auto-update-dbへ保存する');
assert.equal(engine.linkSelfEvolution(record).linked, true, '自己進化エンジン連携');
const status = engine.buildReviewStatus({ storage, today: '2026-06-15' });
assert.equal(status.todayReviewCount, 1, '本日の検証数を集計する');
assert.equal(status.generatedRuleCount, 1, '生成ルール数を集計する');

console.log('automatic review engine test passed');
