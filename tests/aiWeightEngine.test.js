const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const createLocalStorageMock = () => {
  const store = new Map();
  return {
    get length() { return store.size; },
    key: (index) => Array.from(store.keys())[index] || null,
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
  localStorage: localStorageMock,
  window: {},
  document: {
    querySelector: () => null,
    querySelectorAll: () => [],
  },
};
sandbox.window = {
  localStorage: localStorageMock,
  document: sandbox.document,
  addEventListener: () => undefined,
};
sandbox.window.window = sandbox.window;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('src/dashboard.js', 'utf8'), sandbox, { filename: 'src/dashboard.js' });

const engine = sandbox.window.HashimotoAiWeightEngine;
assert.ok(engine, 'AI重み自動調整エンジンが公開されている');
assert.equal(engine.STORAGE_KEY, 'aiWeightSettings', '保存キーはaiWeightSettingsである');
assert.equal(engine.LOG_STORAGE_KEY, 'aiWeightAdjustmentLogs', 'ログ保存キーはaiWeightAdjustmentLogsである');

const initial = JSON.parse(localStorageMock.getItem('aiWeightSettings'));
assert.equal(initial.abilityIndex, 1.0, '能力指数の初期重みを保存する');
assert.equal(initial.jockeyCorrection, 0.8, '騎手補正の初期重みを保存する');
assert.equal(initial.darkHorseCorrection, 1.1, '神穴補正の初期重みを保存する');
assert.equal(initial.dangerPopularCorrection, 1.2, '危険人気馬補正の初期重みを保存する');
assert.equal(Object.keys(initial).length, 14, '14種類の重みを保存する');

localStorageMock.setItem('selfLearningSuggestions', JSON.stringify([
  { id: 's-dark', status: '採用', targetArea: '神穴条件', suggestedRule: '神穴成功率が低いため神穴補正を強化', reason: '神穴成功率が低い' },
  { id: 's-risk', status: '採用', targetArea: '危険人気馬条件', suggestedRule: '危険人気馬成功率が低いため条件を追加', reason: '危険人気馬成功率が低い' },
  { id: 's-pace', status: '採用', targetArea: '脚質補正', suggestedRule: '展開不一致が多いため展開一致を引き上げ', reason: '展開不一致が多い' },
  { id: 's-training', status: '採用', targetArea: '調教補正', suggestedRule: '調教評価が過剰なため弱化', reason: '調教評価が過剰' },
  { id: 's-pending', status: '保留', targetArea: 'EV判定条件', suggestedRule: 'EV補正を強化', reason: '未採用' },
]));
const autoLogs = engine.applyAdoptedSuggestions({ storage: localStorageMock });
assert.equal(autoLogs.length, 4, '採用済み改善提案から4件自動調整する');
const adjusted = engine.getSettings(localStorageMock);
assert.equal(adjusted.darkHorseCorrection, 1.2, '神穴補正重みを+0.1する');
assert.equal(adjusted.dangerPopularCorrection, 1.3, '危険人気馬補正重みを+0.1する');
assert.equal(adjusted.paceMatch, 1.1, '展開一致重みを+0.1する');
assert.equal(adjusted.trainingCorrection, 0.6, '調教補正重みを-0.1する');
assert.equal(engine.applyAdoptedSuggestions({ storage: localStorageMock }).length, 0, '同じ採用提案は二重反映しない');

engine.setSettings({ abilityIndex: 9, bankrollCorrection: -2 }, { storage: localStorageMock, reason: '範囲テスト' });
const clamped = engine.getSettings(localStorageMock);
assert.equal(clamped.abilityIndex, 2.0, '上限2.0に制限する');
assert.equal(clamped.bankrollCorrection, 0.3, '下限0.3に制限する');

const logs = JSON.parse(localStorageMock.getItem('aiWeightAdjustmentLogs'));
assert.ok(logs.length >= 6, '重み変更ログを保存する');
['date', 'targetWeight', 'before', 'after', 'reason', 'sourceSuggestion', 'mode'].forEach((key) => {
  assert.ok(Object.prototype.hasOwnProperty.call(logs[0], key), `${key}をログ項目に含める`);
});
assert.ok(logs.some((log) => log.mode === 'auto'), '自動調整ログを保存する');
assert.ok(logs.some((log) => log.mode === 'manual'), '手動調整ログを保存する');

engine.setSettings({ darkHorseCorrection: 0.3 }, { storage: localStorageMock, reason: 'スコア連動テスト' });
const scoreBefore = sandbox.window.calculateDarkHorseScore({ popularity: 9, odds: 18, runningStyle: '差し', cornerPosition: 5, fieldSize: 16, training: 'A', going: '良', distance: 1600, surface: '芝', course: '東京' });
engine.setSettings({ darkHorseCorrection: 2.0 }, { storage: localStorageMock, reason: 'スコア連動テスト' });
const scoreAfter = sandbox.window.calculateDarkHorseScore({ popularity: 9, odds: 18, runningStyle: '差し', cornerPosition: 5, fieldSize: 16, training: 'A', going: '良', distance: 1600, surface: '芝', course: '東京' });
assert.ok(scoreAfter > scoreBefore, 'calculateDarkHorseScoreがaiWeightSettingsを参照する');

console.log('ai weight engine test passed');
