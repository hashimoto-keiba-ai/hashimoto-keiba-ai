const assert = require('node:assert/strict');
const engine = require('../race-page.js');

const createStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    readJson: (key) => JSON.parse(store.get(key)),
  };
};

const storage = createStorage();
const flow = engine.buildAutomaticLearningFlow({
  date: '2026-06-14',
  course: '東京競馬場',
  race: '11R',
  prediction: '神穴馬を含む三連単',
  result: '的中',
  beforeScore: 92,
  afterScore: 112,
  hit: true,
  returnRate: 188.5,
  trifectaPattern: '1着軸→穴馬→人気馬',
  win5Pattern: 'A軸+Bゾーン',
});

assert.equal(engine.VERSION, '2.8', '自動学習AIのバージョンが2.8である');
assert.deepEqual(engine.FLOW_STEPS, [
  '結果入力',
  '事前予想と照合',
  '検証を生成',
  'アップデート内容を生成',
  'history-db.jsonへ保存',
  'course-db.jsonへ保存',
  'distance-db.jsonへ保存',
  'profit-db.jsonへ保存',
  'return-ai-db.jsonへ保存',
  'learning-engine.jsonへ保存',
], '指定された自動学習フローを保持する');
assert.deepEqual(engine.LEARNING_ITEMS, [
  '危険人気馬',
  '神穴馬',
  '人気ゾーン',
  '騎手傾向',
  '調教師傾向',
  'コース傾向',
  '距離傾向',
  '三連単構造',
  'WIN5構造',
], '自動生成する学習項目を保持する');

const requiredFields = ['date', 'course', 'race', 'prediction', 'result', 'review', 'update', 'learnedRule', 'beforeScore', 'afterScore', 'hit', 'returnRate', 'trifectaPattern', 'win5Pattern', 'aiMemo'];
requiredFields.forEach((field) => assert.ok(Object.hasOwn(flow.record, field), `${field}をlearning recordに保存する`));

engine.saveLearningResult({ storage, record: flow.record });
Object.values(engine.STORAGE_KEYS).forEach((key) => {
  const saved = storage.readJson(key);
  assert.equal(saved.version, '2.8', `${key}にv2.8として保存する`);
  assert.equal(saved.records.length, 1, `${key}へ学習結果を保存する`);
});

const status = engine.buildLearningStatus({ storage, today: '2026-06-14' });
assert.equal(status.totalLearningCount, 1, '総学習件数を集計する');
assert.equal(status.todayLearningCount, 1, '本日学習件数を集計する');
assert.equal(status.hitLearningCount, 1, '的中学習件数を集計する');
assert.equal(status.returnRateImprovement, 20, '回収率改善値をbefore/after差分から計算する');
assert.equal(status.dangerPopularCount, 1, '危険人気馬検出数を集計する');
assert.equal(status.kamiAnaCount, 1, '神穴馬検出数を集計する');
assert.equal(status.trifectaPatternCount, 1, '三連単パターン数を集計する');
assert.equal(status.win5PatternCount, 1, 'WIN5パターン数を集計する');

const update = engine.applyAiUpdate({ storage });
assert.equal(update.status, 'AIアップデート反映済み', 'AIアップデート反映ステータスを返す');
assert.ok(engine.EVOLUTION_HISTORY.includes('v2.7 全自動検証AI'), 'AI進化履歴にv2.7を含める');

console.log('automatic learning engine test passed');
