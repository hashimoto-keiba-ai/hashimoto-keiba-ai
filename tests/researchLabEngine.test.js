const assert = require('assert');
const engine = require('../research-lab-page.js');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    readJson: (key) => JSON.parse(data.get(key))
  };
}

const storage = createStorage();
const base = engine.buildResearchBase({ storage });

assert.equal(engine.VERSION, '2.7', 'AI研究所のバージョンが2.7である');
assert.deepEqual(engine.SOURCE_KEYS, ['integrated-os.json', 'prediction-engine.json', 'learning-engine.json', 'profit-db.json', 'return-ai-db.json', 'win5-db.json', 'bankroll-db.json', 'history-db.json'], '指定DBと連携する');

assert.equal(engine.researchCourseOs(base).course, '東京', '競馬場OS研究');
assert.equal(engine.researchDistance(base).distance, '芝1600', '距離別研究');
assert.equal(engine.researchJockey(base).jockey, '研究騎手A', '騎手研究');
assert.equal(engine.researchTrainer(base).trainer, '研究調教師A', '調教師研究');
assert.equal(engine.researchLap(base).lapPattern, '前半34.5-後半35.1', 'ラップ研究');
assert.equal(engine.researchPopularZone(base).popularZone, 'C', '人気ゾーン研究');
assert.equal(engine.researchTrifecta(base).trifectaPattern, 'A→B→C', '三連単研究');
assert.equal(engine.researchDarkHorse(base).darkHorsePattern, 'Cゾーン差し込み', '神穴馬研究');
assert.equal(engine.researchWin5(base).win5Pattern, 'A固定+B本線+C狙い', 'WIN5研究');
assert.ok(engine.generateSelfEvolutionRule(base).includes('Cゾーン差し込み'), '自己進化ルール生成');

const record = engine.saveResearchMemo({ storage });
assert.equal(record.researchType, 'AI研究所', '研究メモ保存時に研究種別を保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.lab).version, '2.7', 'research-lab-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.course).records[0].bestDistance, '芝1600', 'course-research-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.jockey).records[0].jockey, '研究騎手A', 'jockey-research-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.trainer).records[0].trainer, '研究調教師A', 'trainer-research-dbへ保存する');
assert.equal(storage.readJson(engine.STORAGE_KEYS.lap).records[0].lapPattern, '前半34.5-後半35.1', 'lap-research-dbへ保存する');

const ranking = engine.generateResearchRanking({ storage });
assert.ok(ranking[0].includes('東京 芝1600'), '研究ランキング生成');

console.log('AI research lab test passed');
