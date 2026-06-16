const assert = require('node:assert/strict');
const engine = require('../profit-page.js');

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
  distance: '芝1600',
  condition: '良',
  popularZone: 'C',
  dangerHorse: '危険1人気',
  darkHorse: '神穴馬',
  longshotHorse: '大穴馬',
  lowPopularRunner: '低人気激走馬',
  axisHorse: '軸馬',
  trifectaPattern: 'A→B→C',
  returnRate: 360,
  profitScore: 112,
  memo: '統合OSから万馬券探索'
}] }));

assert.equal(engine.VERSION, '2.8', '万馬券探索AIのバージョンが2.8である');
assert.deepEqual(engine.SOURCE_KEYS, ['integrated-os.json', 'prediction-engine.json', 'learning-engine.json', 'ai-secretary-db.json', 'history-db.json', 'return-ai-db.json'], '指定DBと連携する');
const candidate = engine.buildProfitCandidate({ storage });
assert.equal(engine.judgeDangerFavorite(candidate), '危険1人気', '危険1人気取得');
assert.equal(engine.judgeDarkHorse(candidate), '神穴馬', '神穴馬取得');
assert.equal(engine.judgeLongshot(candidate), '大穴馬', '大穴馬取得');
assert.equal(engine.judgeLowPopularRunner(candidate), '低人気激走馬', '低人気激走馬取得');

const zone = engine.analyzePopularZone(candidate);
assert.equal(zone.Czone, 'C', '人気ゾーン分析');
assert.equal(zone.averageReturn, 360, '人気ゾーン平均回収率を返す');
const trifecta = engine.analyzeTrifectaPattern(candidate);
assert.equal(trifecta.pattern, 'A→B→C', '三連単パターン分析');
assert.equal(engine.calculateExpectedReturn(candidate), 324, '期待回収率計算');

engine.saveLearningHistory({ storage, candidate });
assert.equal(storage.readJson(engine.STORAGE_KEYS.profit).version, '2.8', 'profit-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.darkhorse).records[0].horse, '神穴馬', 'darkhorse-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.popularZone).records[0].Czone, 'C', 'popular-zone-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.trifectaPattern).records[0].pattern, 'A→B→C', 'trifecta-pattern-dbへ保存する');
const ranking = engine.buildReturnRanking({ storage });
assert.ok(ranking[0].includes('360%'), 'ランキング生成');
const profitAnalysis = engine.analyzeProfitEngine({ storage });
assert.equal(profitAnalysis.engine, 'profitEngine', 'Profit Engineを構築する');
assert.equal(profitAnalysis.averageReturnRate, 360, '回収率を自動分析する');
assert.equal(profitAnalysis.roi, 324, 'ROIを自動分析する');
assert.ok(profitAnalysis.bankrollTrend.length > 0, '資金推移を自動分析する');
const status = engine.buildProfitStatus({ storage });
assert.equal(status.candidate, '東京競馬場 11R', '万馬券候補を表示する');

console.log('profit explorer test passed');
