const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const createLocalStorageMock = () => {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
};

const localStorageMock = createLocalStorageMock();
const sandbox = {
  console,
  URL,
  Blob,
  setTimeout,
  clearTimeout,
  localStorage: localStorageMock,
  window: {},
  document: {
    readyState: 'loading',
    querySelector: () => null,
    querySelectorAll: () => [],
  },
};
sandbox.window = {
  localStorage: localStorageMock,
  addEventListener: () => undefined,
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('src/dashboard.js', 'utf8'), sandbox, { filename: 'src/dashboard.js' });

const engine = sandbox.window.HashimotoProductionRaceEngine;
assert.ok(engine, 'Race Databaseエンジンが公開されている');
assert.equal(engine.RACE_DATABASE_STORAGE_KEY, 'raceDatabase', '保存キーはraceDatabaseである');

const payload = {
  id: 'production:2026-06-07:東京競馬場:11',
  generatedAt: '2026-06-07T06:00:00.000Z',
  race: { date: '2026-06-07', course: '東京競馬場', raceNumber: 11, raceName: 'Phase5-5実戦S', distance: 1600, surface: '芝', going: '良', fieldSize: 5 },
  horses: [{ number: 1, name: '本命', aiIndex: 91 }],
  aiIndexRanking: [
    { number: 1, name: '本命', aiIndex: 91, popularity: 1, odds: 2.1 },
    { number: 2, name: '対抗', aiIndex: 88, popularity: 2, odds: 4.2 },
    { number: 3, name: '単穴', aiIndex: 84, popularity: 4, odds: 8.8 },
    { number: 4, name: '押え', aiIndex: 70, popularity: 7, odds: 18.0 },
  ],
  kamianaRanking: [
    { number: 5, name: '神穴A', kamianaIndex: 94, popularity: 9, odds: 35.0 },
    { number: 4, name: '神穴B', kamianaIndex: 89, popularity: 7, odds: 18.0 },
    { number: 3, name: '単穴', kamianaIndex: 80, popularity: 4, odds: 8.8 },
  ],
  dangerPopularRanking: [
    { number: 2, name: '危険A', dangerIndex: 86, popularity: 2, odds: 4.2 },
    { number: 1, name: '本命', dangerIndex: 74, popularity: 1, odds: 2.1 },
    { number: 3, name: '単穴', dangerIndex: 65, popularity: 4, odds: 8.8 },
  ],
  trifecta: { tickets: { main: [{ first: { number: 1 }, second: { number: 5 }, third: { number: 3 }, notation: '1→5→3' }] } },
  godRace: { label: '神レースS', score: 91, skip: false },
  summary: { runnerCount: 5 },
};

const record = engine.buildRaceDatabaseRecord({ payload });
assert.equal(record.date, '2026-06-07', '開催日を保存する');
assert.equal(record.course, '東京競馬場', '競馬場を保存する');
assert.equal(record.raceNumber, 11, 'レース番号を保存する');
assert.equal(record.raceName, 'Phase5-5実戦S', 'レース名を保存する');
assert.equal(record.aiIndexTop3.length, 3, 'AI指数TOP3を保存する');
assert.equal(record.kamianaTop3[0].name, '神穴A', '神穴TOP3を保存する');
assert.equal(record.dangerPopularTop3[0].name, '危険A', '危険人気馬TOP3を保存する');
assert.equal(record.trifectaCandidates[0].notation, '1→5→3', '三連単候補を保存する');
assert.equal(record.godRaceJudgement.label, '神レースS', '神レース判定を保存する');
assert.equal(record.roi, null, '結果検証前のROIはnullで保存する');

engine.saveRaceDatabaseRecord(record, localStorageMock);
assert.equal(JSON.parse(localStorageMock.getItem('raceDatabase'))[0].id, record.id, 'raceDatabaseへ永続保存できる');

const validationReport = { result: { firstNumber: 1, secondNumber: 5, thirdNumber: 3 }, roi: 240, summary: 'ROI 240%' };
const updated = engine.updateRaceDatabaseResult({ payload, validationReport }, localStorageMock);
assert.equal(updated.result.firstNumber, 1, '結果をraceDatabaseへ更新できる');
assert.equal(updated.roi, 240, 'ROIをraceDatabaseへ更新できる');

assert.equal(engine.searchRaceDatabase({ course: '東京', distance: 1600, going: '良', from: '2026-06-01', to: '2026-06-30' }, localStorageMock).length, 1, '競馬場・距離・馬場・期間で検索できる');
assert.equal(engine.searchRaceDatabase({ course: '京都' }, localStorageMock).length, 0, '条件不一致の競馬場は除外する');
assert.equal(engine.searchRaceDatabase({ from: '2026-07-01' }, localStorageMock).length, 0, '期間外のレースは除外する');

console.log('race database test passed');
