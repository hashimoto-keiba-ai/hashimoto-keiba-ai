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
vm.runInContext(fs.readFileSync('src/raceSimulator.js', 'utf8'), sandbox, { filename: 'src/raceSimulator.js' });

const scoreEngine = sandbox.window.HashimotoKeibaAiScoreEngine;
const betEngine = sandbox.window.HashimotoBetEngine;
const evEngine = sandbox.window.HashimotoEVEngine;
const capitalEngine = sandbox.window.HashimotoCapitalEngine;
const godRaceEngine = sandbox.window.HashimotoGodRaceEngine;
const raceSimulator = sandbox.window.HashimotoRaceSimulator;
const sampleValidationEngine = sandbox.window.HashimotoSampleRaceValidationEngine;
const operationReportEngine = sandbox.window.HashimotoOperationDiagnosticReportEngine;
assert.ok(scoreEngine, 'AI指数エンジンが公開されている');
assert.ok(betEngine, '買い目生成エンジンが公開されている');
assert.ok(evEngine, 'EVエンジンが公開されている');
assert.ok(capitalEngine, '資金配分エンジンが公開されている');
assert.ok(godRaceEngine, '神レース判定エンジンが公開されている');
assert.ok(raceSimulator, '未来シミュレーターが公開されている');
assert.ok(sampleValidationEngine, 'サンプル結果検証エンジンが公開されている');
assert.ok(operationReportEngine, '実戦診断レポートエンジンが公開されている');

const sample = JSON.parse(fs.readFileSync('data/sampleRace.json', 'utf8'));
assert.equal(sample['出走馬'].length, 12, 'sampleRace.jsonは12頭立て');
for (const key of ['開催日', '競馬場', 'レース番号', 'レース名', '距離', '芝ダート', '馬場状態']) {
  assert.ok(sample[key] !== undefined, `sampleRace.jsonに${key}がある`);
}
for (const horse of sample['出走馬']) {
  for (const key of ['馬番', '馬名', '騎手', '調教師', '人気', 'オッズ', '脚質', '想定4角位置', '調教評価']) {
    assert.ok(horse[key] !== undefined, `出走馬に${key}がある`);
  }
}

const race = {
  date: sample['開催日'],
  course: sample['競馬場'],
  raceNumber: sample['レース番号'],
  raceName: sample['レース名'],
  distance: sample['距離'],
  surface: sample['芝ダート'],
  going: sample['馬場状態'],
  fieldSize: sample['頭数'],
};
const horses = sample['出走馬'].map((horse) => ({
  number: horse['馬番'],
  name: horse['馬名'],
  jockey: horse['騎手'],
  trainer: horse['調教師'],
  popularity: horse['人気'],
  odds: horse['オッズ'],
  runningStyle: horse['脚質'],
  cornerPosition: horse['想定4角位置'],
  training: horse['調教評価'],
  course: race.course,
  distance: race.distance,
  surface: race.surface,
  going: race.going,
  fieldSize: race.fieldSize,
}));

const scored = scoreEngine.calculateAllHorseScores(horses, race);
assert.equal(scored.length, 12, 'サンプル全頭がAIスコア計算対象になる');
assert.ok(scored.every((horse) => Number.isFinite(horse.aiIndex) && Number.isFinite(horse.kamianaIndex) && Number.isFinite(horse.dangerIndex)), 'AI指数・神穴指数・危険人気馬指数が全頭に入る');
assert.ok([...scored].sort((a, b) => b.aiIndex - a.aiIndex)[0].aiIndex >= [...scored].sort((a, b) => b.aiIndex - a.aiIndex).at(-1).aiIndex, 'AI指数ランキングを生成できる');
assert.ok([...scored].sort((a, b) => b.kamianaIndex - a.kamianaIndex).some((horse) => horse.popularity >= 6 || horse.odds >= 15), '神穴ランキングへ人気薄が連動する');
assert.ok([...scored].sort((a, b) => b.dangerIndex - a.dangerIndex).length === 12, '危険人気馬ランキングを生成できる');

const trifectaPayload = betEngine.buildTrifectaPayload(scored, { race, fieldSize: race.fieldSize });
assert.ok(trifectaPayload.summary.total > 0, '三連単候補が生成される');
const win5Payload = betEngine.buildWin5ClassificationPayload(scored, { race });
assert.ok(Object.values(win5Payload.zones).flat().length > 0, 'WIN5候補が生成される');
const simulationPayload = raceSimulator.runMonteCarloSimulation(scored, { simulationCount: 1000, raceContext: race, seed: 20260607 });
assert.equal(simulationPayload.simulationCount, 1000, '未来シミュレーターを1000回実行できる');
assert.ok(simulationPayload.rankings.winRate.length >= 5, 'シミュレーション勝率TOP5を取得できる');
const evPayload = evEngine.buildEVDashboardPayload(scored, { trifectaPayload, win5Payload });
assert.ok(evPayload.evRanking.length >= 5, 'EV上位を取得できる');
assert.ok(evPayload.trifectaEV.length > 0, '三連単EVが計算される');
assert.ok(Number.isFinite(evPayload.win5EV.ev), 'WIN5 EVが計算される');
const preliminaryGodRace = godRaceEngine.buildGodRacePayload({ horses: scored, evPayload, simulationPayload, race });
const capitalPayload = capitalEngine.buildCapitalAllocationPayload({
  trifectaEV: evPayload.trifectaEV,
  win5EV: evPayload.win5EV,
  raceEV: evPayload.evRanking,
  race,
  dailyBudget: 50000,
  raceLimit: 10000,
  win5Limit: 5000,
  riskCoefficient: 0.25,
  godRaceIndex: preliminaryGodRace.score,
  persist: true,
});
assert.ok(Number.isFinite(capitalPayload.summary.totalRecommended), '資金配分計算が実行される');
const godRacePayload = godRaceEngine.buildGodRacePayload({ horses: scored, evPayload, capitalPayload, simulationPayload, race, persist: true });
assert.ok(godRacePayload.label && Number.isFinite(godRacePayload.score), '神レース判定が実行される');

const testLog = {
  generatedAt: new Date().toISOString(),
  race,
  aiTop5: [...scored].sort((a, b) => b.aiIndex - a.aiIndex).slice(0, 5),
  kamianaTop5: [...scored].sort((a, b) => b.kamianaIndex - a.kamianaIndex).slice(0, 5),
  dangerTop5: [...scored].sort((a, b) => b.dangerIndex - a.dangerIndex).slice(0, 5),
  trifectaCandidates: Object.values(trifectaPayload.tickets).flat().slice(0, 5),
  win5Candidates: Object.values(win5Payload.zones).flat().slice(0, 5),
  simulationWinTop5: simulationPayload.rankings.winRate.slice(0, 5),
  evTop: evPayload.evRanking.slice(0, 5),
  recommendedInvestments: Object.values(capitalPayload.ticketGroups).flat().slice(0, 5),
  godRace: godRacePayload,
};
localStorageMock.setItem('sampleRaceTestLog', JSON.stringify(testLog));
const restored = JSON.parse(localStorageMock.getItem('sampleRaceTestLog'));
assert.equal(restored.aiTop5.length, 5, 'localStorage sampleRaceTestLogにAI指数TOP5が保存される');
assert.ok(restored.godRace.label, 'localStorage sampleRaceTestLogに神レース判定が保存される');

const hitTicket = restored.trifectaCandidates[0];
const validation = sampleValidationEngine.validateSampleRaceResult({
  predictionLog: restored,
  resultInput: {
    firstNumber: hitTicket.first.number,
    secondNumber: hitTicket.second.number,
    thirdNumber: hitTicket.third.number,
    trifectaPayout: 125430,
    actualPace: '平均',
    trackBias: '内先行有利',
    memo: 'サンプル結果入力テスト',
  },
});
assert.equal(validation.judgements.trifectaHit, true, '結果入力後に三連単候補と照合される');
assert.ok(Number.isFinite(validation.roi) && validation.roi > 0, 'ROIが計算される');
assert.ok(validation.selfEvolutionLog.date && validation.selfEvolutionLog.racecourse && validation.selfEvolutionLog.afterRule, '自己進化ログ必須項目が生成される');
assert.ok(validation.osUpdateCandidates.adopt.length > 0, 'OSアップデート採用候補が生成される');
sampleValidationEngine.saveValidationLog(validation, localStorageMock);
sampleValidationEngine.appendSelfEvolutionLog(validation, localStorageMock);
const validationLog = JSON.parse(localStorageMock.getItem('sampleRaceResultValidationLog'));
const evolutionPayload = JSON.parse(localStorageMock.getItem(sampleValidationEngine.SELF_EVOLUTION_STORAGE_KEY));
assert.equal(validationLog.roi, validation.roi, 'localStorage sampleRaceResultValidationLogへROI付きで保存される');
assert.equal(evolutionPayload.logs.resultVerifications[0].source, 'sample-race-result-validation', 'selfEvolutionLogsへ保存される');

const operationReport = operationReportEngine.buildOperationDiagnosticReport({ predictionLog: restored, validation, source: 'test' });
assert.equal(operationReport.storageKey, 'operationDiagnosticReports', '診断レポートの保存キーがoperationDiagnosticReportsになる');
assert.equal(operationReport.aiIndexTop5.length, 5, '診断レポートにAI指数TOP5が入る');
assert.equal(operationReport.kamianaTop5.length, 5, '診断レポートに神穴TOP5が入る');
assert.equal(operationReport.dangerPopularTop5.length, 5, '診断レポートに危険人気馬TOP5が入る');
assert.ok(operationReport.trifectaCandidates.length > 0, '診断レポートに三連単候補が入る');
assert.ok(operationReport.win5Candidates.length > 0, '診断レポートにWIN5候補が入る');
assert.ok(operationReport.futureSimulationResult.winTop5.length >= 5, '診断レポートに未来シミュレーション結果が入る');
assert.ok(operationReport.evRanking.length >= 5, '診断レポートにEVランキングが入る');
assert.ok(operationReport.fundAllocation.recommendedInvestments.length > 0, '診断レポートに資金配分が入る');
assert.ok(operationReport.godRaceJudgement.label, '診断レポートに神レース判定が入る');
assert.equal(operationReport.resultMatching.status, '照合済', '診断レポートに結果照合が入る');
assert.equal(operationReport.roi, validation.roi, '診断レポートにROIが入る');
assert.ok(operationReport.selfEvolutionLog.id, '診断レポートに自己進化ログが入る');
assert.ok(operationReport.osUpdateCandidates.adopt.length > 0, '診断レポートにOSアップデート候補が入る');
operationReportEngine.saveReport(operationReport, localStorageMock);
const operationReports = JSON.parse(localStorageMock.getItem('operationDiagnosticReports'));
assert.equal(operationReports[0].id, operationReport.id, 'localStorage operationDiagnosticReportsへ診断レポートが保存される');
const exportedJson = operationReportEngine.toExportJson(operationReport);
assert.equal(JSON.stringify(JSON.parse(exportedJson).raceBasicInfo), JSON.stringify(operationReport.raceBasicInfo), '診断レポートJSONエクスポートが有効なJSONになる');
assert.ok(operationReportEngine.createExportFileName(operationReport).endsWith('.json'), '診断レポートJSONエクスポートのファイル名がjsonになる');
console.log('sample race operation test passed');
