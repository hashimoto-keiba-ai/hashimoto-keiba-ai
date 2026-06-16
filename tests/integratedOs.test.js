const assert = require('node:assert/strict');
const engine = require('../integrated-os-page.js');

const createStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    readJson: (key) => JSON.parse(store.get(key)),
  };
};

const storage = createStorage();
const flow = engine.buildIntegratedFlow({
  course: '東京',
  distance: '芝1600',
  condition: '良',
  prediction: '統合OS予想',
  result: '的中',
  learning: '統合学習',
  returnRate: 210,
  confidence: 96,
  aiScore: 112,
  jockey: '統合騎手A',
  trainer: '統合調教師B',
});

assert.equal(engine.VERSION, '2.8', '統合OSのバージョンが2.8である');
assert.deepEqual(engine.COURSES, ['東京', '中山', '阪神', '京都', '中京', '新潟', '福島', '小倉', '函館', '札幌', 'WIN5'], '全競馬場とWIN5を共通OSで管理する');
assert.deepEqual(engine.MANAGEMENT_ITEMS, ['競馬場切替', '距離別分析', 'コース別分析', '人気ゾーン分析', '騎手分析', '調教師分析', '三連単分析', 'WIN5分析'], '統合管理画面項目を保持する');
assert.deepEqual(engine.FLOW_STEPS, ['history-db', 'learning-engine', 'prediction-engine', 'course-db', 'distance-db', 'profit-db', 'return-ai-db', 'integrated-os', '最終予想'], '統合AIエンジンフローを保持する');
assert.ok(engine.EVOLUTION_HISTORY.includes('v2.7 全自動検証AI'), '自己進化履歴にv2.7を含める');

const requiredFields = ['date', 'course', 'distance', 'condition', 'prediction', 'result', 'review', 'update', 'learning', 'profit', 'returnRate', 'dangerHorse', 'darkHorse', 'axisHorse', 'trifectaPattern', 'win5Pattern', 'confidence', 'aiScore', 'memo'];
requiredFields.forEach((field) => assert.ok(Object.hasOwn(flow.record, field), `${field}をintegrated-os recordに保存する`));

engine.saveIntegratedRecord({ storage, record: flow.record });
const saved = storage.readJson(engine.STORAGE_KEY);
assert.equal(saved.version, '2.8', 'integrated-os.jsonへv2.8として保存する');
assert.equal(saved.records.length, 1, 'integrated-os.jsonへ統合OS結果を保存する');

storage.setItem('learning-engine.json', JSON.stringify({ records: [{ returnRate: 150, afterScore: 112, dangerHorse: '危険', darkHorse: '穴', trifectaPattern: 'A→B→C', win5Pattern: '固定A' }] }));
storage.setItem('prediction-engine.json', JSON.stringify({ records: [{ returnRate: 180, confidence: 94, dangerHorse: '危険', darkHorse: '穴', trifectaPattern: 'B→C→A', win5Pattern: '狙いC' }] }));
const status = engine.buildIntegratedStatus({ storage });
assert.equal(status.totalLearning, 1, '総学習数を集計する');
assert.equal(status.totalPredictions, 1, '総予想数を集計する');
assert.ok(status.returnRate > 0, '回収率を集計する');
assert.ok(status.aiConfidence > 0, 'AI信頼度を集計する');
assert.equal(status.dangerHorseCount, 3, '危険人気馬数を集計する');
assert.equal(status.darkHorseCount, 3, '神穴馬数を集計する');
assert.equal(status.trifectaPatternCount, 2, '三連単パターン数を集計する');
assert.equal(status.win5PatternCount, 2, 'WIN5パターン数を集計する');

const rankings = engine.buildRankings({ storage });
assert.ok(rankings.courseRanking[0].includes('東京'), '競馬場別回収率ランキングを生成する');
assert.equal(rankings.jockeyRanking[0], '統合騎手A 1件', '騎手ランキングを生成する');
assert.equal(rankings.trainerRanking[0], '統合調教師B 1件', '調教師ランキングを生成する');

console.log('integrated OS test passed');
