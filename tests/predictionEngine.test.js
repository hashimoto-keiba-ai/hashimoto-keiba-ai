const assert = require('node:assert/strict');
const engine = require('../prediction-page.js');

const createStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    readJson: (key) => JSON.parse(store.get(key)),
  };
};

const storage = createStorage();
const flow = engine.buildPredictionFlow({
  date: '2026-06-14',
  course: '東京競馬場',
  race: '11R',
  distance: '芝1600',
  condition: '良',
  popularity: 8,
  jockeyScore: 90,
  trainerScore: 88,
  courseScore: 92,
  distanceScore: 86,
  profitScore: 95,
  returnScore: 112,
  hit: true,
  returnRate: 180,
  jockey: '好調騎手A',
  trainer: '好調調教師B',
});

assert.equal(engine.VERSION, '2.7', '予想生成AIのバージョンが2.7である');
assert.deepEqual(engine.SOURCE_KEYS, [
  'history-db.json',
  'learning-engine.json',
  'course-db.json',
  'distance-db.json',
  'profit-db.json',
  'return-ai-db.json',
  '騎手AI',
  '調教師AI',
  '人気ゾーンAI',
  '危険人気馬AI',
  '神穴馬AI',
  '三連単構造AI',
  'WIN5構造AI',
  'prediction-engine',
  '最終予想生成',
], '指定された予想生成フローを保持する');
assert.deepEqual(engine.MARKS, ['◎', '○', '▲', '△', '☆', '🤫観測馬'], '自動生成する印を保持する');
assert.deepEqual(engine.POPULAR_ZONES, { A: '1〜3人気', B: '4〜6人気', C: '7〜10人気', D: '11人気以下' }, '人気ゾーンAI定義を保持する');
assert.deepEqual(engine.TRIFECTA_STRUCTURES, ['A→A→B', 'A→B→C', 'B→C→A', 'B→C→C', 'C→D→B'], '三連単構造学習を保持する');
assert.deepEqual(engine.WIN5_STRUCTURES, ['固定A', '本線B', '狙いC', '爆穴D'], 'WIN5構造学習を保持する');
assert.equal(flow.record.popularZone, 'C', '人気からCゾーンを判定する');

const requiredFields = ['date', 'course', 'race', 'distance', 'condition', 'popularZone', 'jockeyScore', 'trainerScore', 'courseScore', 'distanceScore', 'profitScore', 'returnScore', 'dangerHorse', 'darkHorse', 'axisHorse', 'trifectaPattern', 'win5Pattern', 'predictionRank', 'confidence', 'memo'];
requiredFields.forEach((field) => assert.ok(Object.hasOwn(flow.record, field), `${field}をprediction recordに保存する`));

engine.savePrediction({ storage, record: flow.record });
const saved = storage.readJson(engine.STORAGE_KEY);
assert.equal(saved.version, '2.7', 'prediction-engine.jsonへv2.7として保存する');
assert.equal(saved.records.length, 1, 'prediction-engine.jsonへ予想を保存する');

const status = engine.buildPredictionStatus({ storage });
assert.equal(status.totalPredictions, 1, '総予想件数を集計する');
assert.equal(status.axisHitRate, 100, '本命的中率を集計する');
assert.equal(status.dangerDetectionRate, 100, '危険人気馬検出率を集計する');
assert.equal(status.darkHorseDetectionRate, 100, '神穴馬検出率を集計する');
assert.equal(status.trifectaSuccessRate, 100, '三連単成功率を集計する');
assert.equal(status.win5SuccessRate, 100, 'WIN5成功率を集計する');
assert.equal(status.averageReturnRate, 180, '平均回収率を集計する');
assert.ok(status.aiConfidence > 90, 'AI信頼度をスコアから集計する');

const cards = engine.buildPredictionHistoryCards({ storage });
assert.equal(cards.latest.length, 1, '最新予想カードを生成する');
assert.equal(cards.hits.length, 1, '的中予想カードを生成する');
assert.equal(cards.returnRanking.length, 1, '回収率ランキングカードを生成する');
assert.equal(cards.jockeyRanking[0], '好調騎手A 1件', '好調騎手ランキングを生成する');
assert.equal(cards.trainerRanking[0], '好調調教師B 1件', '好調調教師ランキングを生成する');

console.log('prediction engine test passed');
