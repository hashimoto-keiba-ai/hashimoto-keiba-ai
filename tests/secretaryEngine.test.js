const assert = require('node:assert/strict');
const engine = require('../secretary-page.js');

const createStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    readJson: (key) => JSON.parse(store.get(key)),
  };
};

const storage = createStorage();
storage.setItem('integrated-os.json', JSON.stringify({ records: [{
  date: '2026-06-15',
  course: '東京競馬場',
  race: '11R',
  axisHorse: '統合本命',
  dangerHorse: '危険一番人気',
  darkHorse: '神穴候補',
  win5Pattern: '固定A',
  jockeyRank: ['回収率騎手A'],
  trainerRank: ['好調調教師B'],
  memo: '統合OSメモ'
}] }));

assert.equal(engine.VERSION, '2.8', 'AI秘書のバージョンが2.8である');
assert.ok(engine.SOURCE_KEYS.includes('auto-review-db.json'), '自動レビューDBと連携する');
assert.ok(engine.SOURCE_KEYS.includes('auto-update-db.json'), '自動アップデートDBと連携する');
assert.equal(engine.buildAutoReviewDigest({ storage }).reviewText, '自動レビュー待機', 'AI秘書が自動レビュー要約を生成する');
const secretaryEngine = engine.buildSecretaryEngine({ storage });
assert.equal(secretaryEngine.engine, 'secretaryEngine', 'AI秘書エンジンを強化する');
assert.ok(secretaryEngine.dailyReport.includes('東京競馬場11R'), '日報を生成する');
assert.ok(secretaryEngine.weeklyReport.includes('回収率騎手A'), '週報を生成する');
assert.deepEqual(engine.QUESTIONS, ['東京11Rは？', '危険な1人気は？', '今日の神穴は？', 'WIN5候補は？', '回収率の高い騎手は？'], 'AI会話カードの質問例を保持する');

const memo = engine.buildSecretaryMemo({ storage });
const requiredFields = ['date', 'course', 'race', 'favoriteHorse', 'dangerHorse', 'darkHorse', 'win5Horse', 'jockeyRank', 'trainerRank', 'memo'];
requiredFields.forEach((field) => assert.ok(Object.hasOwn(memo, field), `${field}をAI秘書メモに保存する`));
assert.equal(memo.favoriteHorse, '統合本命', '統合OSから本命馬を取得する');
assert.equal(memo.dangerHorse, '危険一番人気', '統合OSから危険人気馬を取得する');
assert.equal(memo.darkHorse, '神穴候補', '統合OSから神穴馬を取得する');

engine.saveSecretaryMemo({ storage, memo });
const saved = storage.readJson(engine.STORAGE_KEY);
assert.equal(saved.version, '2.8', 'ai-secretary-db.jsonへv2.8として保存する');
assert.equal(saved.records.length, 1, '秘書メモを保存する');
assert.deepEqual(saved.linkedSources, engine.SOURCE_KEYS, '保存DBに連携元を記録する');

const status = engine.buildSecretaryStatus({ storage });
assert.equal(status.recommendedRace, '東京競馬場 11R', '本日の推奨レースを表示する');
assert.equal(status.favoriteHorse, '統合本命', '本日の本命馬を表示する');
assert.equal(status.win5Horse, '固定A', 'WIN5候補を表示する');
assert.ok(engine.answerQuestion('危険な1人気は？', status).includes('危険一番人気'), '危険人気馬の質問に回答する');
assert.ok(engine.answerQuestion('回収率の高い騎手は？', status).includes('回収率騎手A'), '騎手質問に回答する');

console.log('AI secretary test passed');
