const assert = require('assert');
const engine = require('../self-evolution-page.js');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage();
const hit = engine.DEFAULT_CASES[0];
const miss = engine.DEFAULT_CASES[1];

assert.equal(engine.VERSION, '2.6', '自己進化エンジンのバージョンが2.6である');
assert.deepEqual(engine.SOURCE_KEYS, ['integrated-os.json', 'prediction-engine.json', 'learning-engine.json', 'research-lab-db.json', 'course-research-db.json', 'jockey-research-db.json', 'trainer-research-db.json', 'lap-research-db.json', 'profit-db.json', 'return-ai-db.json', 'win5-db.json', 'bankroll-db.json', 'history-db.json'], '指定DBと連携する');

assert.equal(engine.learnHitPrediction(hit).successPattern, '東京芝1600成功', '当たり予想自動学習');
assert.equal(engine.verifyMissPrediction(miss).failurePattern, '京都芝1200失敗', '外れ予想自動検証');
assert.ok(engine.analyzeFailureReason(miss).includes('過信'), '失敗原因分析');
assert.ok(engine.analyzeSuccessReason(hit).includes('成功要因'), '成功要因分析');
assert.ok(engine.updateCourseOs(hit).includes('東京OS'), '競馬場OS自動更新');
assert.ok(engine.updateDistanceOs(hit).includes('芝1600OS'), '距離別OS自動更新');
assert.ok(engine.updateJockeyCorrection(hit).includes('騎手補正'), '騎手補正自動更新');
assert.ok(engine.updatePopularZoneCorrection(hit).includes('人気ゾーン補正'), '人気ゾーン補正自動更新');
assert.ok(engine.updateTrifectaPattern(hit).includes('三連単'), '三連単パターン自動更新');
assert.ok(engine.updateWin5Structure(miss).includes('WIN5構造'), 'WIN5構造自動更新');
assert.equal(engine.selfUpdateAiScore(engine.DEFAULT_CASES), 12, 'AIスコア自己更新');

const record = engine.saveSelfEvolutionRule({ storage });
assert.equal(record.updateTarget, '三連単パターン', '自己進化ルール保存時に更新対象を保持する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.evolution).version, '2.6', 'self-evolution-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.rules).records[0].category, '三連単パターン', 'evolution-rule-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.successes).records[0].successPattern, '東京芝1600成功', 'success-pattern-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.failures).records[0].failurePattern, '京都芝1200失敗', 'failure-pattern-dbへ保存する');

const status = engine.buildEvolutionStatus({ storage, today: '2026-06-15' });
assert.equal(status.todayLearningCount, 1, '本日の学習数を集計する');
assert.equal(status.updatedRuleCount, 8, '更新ルール数を集計する');

console.log('self evolution engine test passed');
