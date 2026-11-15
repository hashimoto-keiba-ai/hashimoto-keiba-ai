"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const {mkdtempSync, readFileSync, rmSync, writeFileSync} = require("node:fs");
const {tmpdir} = require("node:os");
const {join, resolve} = require("node:path");
const {spawnSync} = require("node:child_process");
const {reproduce, evaluate, summarize} = require("../historical-backtest");
const trial = require("../prediction-trial-core");

const start = "2026-06-01T15:00:00+09:00";
const before = "2026-06-01T14:55:00+09:00";
const after = "2026-06-01T15:15:00+09:00";
const now = "2026-06-02T00:00:00Z";
const identity = {date: "2026-06-01", course: "東京競馬場", raceNumber: "10R"};
const source = {provider: "JRA", reference: "合成テスト用資料", checkedAt: after};
const wrap = record => Object.fromEntries(Object.entries(record).map(([key, value]) =>
  [key, {value, sourceId: "jra", availableAt: before, evidence: "合成テスト用時点証跡"}]));

function fixture() {
  return {
    race: wrap({...identity, raceName: "合成レース", surface: "芝", distance: 1600, going: "良", pace: "M"}),
    sources: {jra: source}, scheduledStartAt: start, fieldSize: 6,
    horses: Array.from({length: 6}, (_, i) => wrap({
      number: i + 1, name: "合成馬" + (i + 1), gate: i + 1, jockey: "騎手", trainer: "調教師",
      popularity: i + 1, odds: 2 + i * 3, runningStyle: "先行", cornerPosition: i + 1, previousFinish: i + 1
    }))
  };
}

function result(fixed, order = fixed.trifectaTickets[0]) {
  const full = [...order, ...fixed.entries.map(horse => horse.number).filter(number => !order.includes(number))];
  return {race: identity, source, status: "確定", trifectaPayout: 6000,
    horses: fixed.entries.map(({number, name}) => ({number, name, finish: full.indexOf(number) + 1, cornerPosition: 1}))};
}

test("既存予想と指数・三連単が一致し、確定結果と集計できる", () => {
  const input = fixture();
  const fixed = reproduce(input, now);
  const unwrap = row => Object.fromEntries(Object.entries(row).map(([key, item]) => [key, item.value]));
  const engine = require("../pre-race-prediction").generatePreRacePrediction({
    ...unwrap(input.race), horses: input.horses.map(unwrap), fieldSize: input.fieldSize, strictTrial: true
  });
  assert.deepEqual(fixed.horses.map(horse => [horse.zIndex, horse.zPrimeIndex]),
    engine.horses.map(horse => [horse.zIndex, horse.zPrimeIndex]));
  assert.deepEqual(fixed.trifectaTickets, engine.trifectaTickets.map(ticket => ticket.map(horse => horse.number)));
  assert.equal(fixed.modelVersion, trial.MODEL_VERSION);
  assert.deepEqual(fixed.safety, trial.SAFETY);
  assert.throws(() => trial.readSnapshot(JSON.stringify(fixed)));
  const evaluated = evaluate(fixed, result(fixed), now);
  assert.equal(evaluated.trifecta.hits, 1);
  assert.equal(evaluated.trifecta.returnRate, 6000 * 100 / evaluated.trifecta.stake);
  assert.equal(evaluated.positions.length, 6);
  const aggregate = summarize([evaluated]);
  assert.equal(aggregate.strict.trifectaRaceHitRate, 100);
  assert.deepEqual(aggregate.byGoingAndDistance["芝/良/1600"], aggregate.strict);
  assert.throws(() => summarize([evaluated, evaluated]), /複数/);
});

test("取得時点未確認・結果参照後の再試算を厳密集計から除外する", () => {
  const input = fixture();
  const original = reproduce(input, now);
  delete input.horses[0].odds.availableAt;
  const unchecked = reproduce(input, now);
  assert.equal(unchecked.provenance.find(item => item.field === "horses.0.odds").status, "取得時点未確認");
  const revised = reproduce({...fixture(), resultInformedReason: "結果を見て仮説を変更"}, now, original);
  assert.equal(revised.originalChecksum, original.checksum);
  const rows = [unchecked, revised].map(record => evaluate(record, result(record), now));
  assert.equal(summarize(rows).strict.races, 0);
  assert.equal(summarize(rows).excludedRaces, 2);
  assert.throws(() => reproduce({...fixture(), resultInformedReason: "理由"}, now), /当初/);
});

test("発走後データ、結果混入、固定改変、誤った結果を拒否する", () => {
  const input = fixture();
  input.horses[0].odds.availableAt = start;
  assert.throws(() => reproduce(input, now), /発走以降/);
  assert.throws(() => reproduce(fixture(), before), /過ぎた/);
  assert.throws(() => reproduce({...fixture(), result: {}}, now), /許可/);
  const nested = fixture();
  nested.horses[0].finish = nested.horses[0].previousFinish;
  assert.throws(() => reproduce(nested, now), /許可/);
  const fixed = reproduce(fixture(), now);
  assert.throws(() => evaluate({...fixed, strictEligible: false}, result(fixed), now), /変更/);
  const official = result(fixed);
  assert.throws(() => evaluate(fixed, {...official, race: {...identity, raceNumber: "11R"}}, now), /レース/);
  assert.throws(() => evaluate(fixed, {...official, status: "未確定"}, now), /確定/);
  assert.throws(() => evaluate(fixed, {...official, horses: official.horses.slice(1)}, now), /頭数/);
});

test("順序が異なる候補は不的中、払戻不明・同着は未計算、取消は返還", () => {
  const fixed = reproduce(fixture(), now);
  const winner = fixed.trifectaTickets[0];
  const loser = [...winner].reverse();
  assert.ok(!fixed.trifectaTickets.some(ticket => ticket.join() === loser.join()));
  assert.equal(evaluate(fixed, result(fixed, loser), now).trifecta.hits, 0);
  const official = result(fixed);
  delete official.trifectaPayout;
  const unchecked = evaluate(fixed, official, now);
  assert.equal(unchecked.trifecta.returnRate, null);
  assert.equal(summarize([unchecked]).strict.returnRate, null);
  official.horses.find(horse => horse.finish === 3).finish = 2;
  assert.equal(evaluate(fixed, official, now).trifecta.hits, null);
  const cancelled = result(fixed);
  const last = cancelled.horses.find(horse => horse.finish === 6);
  delete last.finish;
  last.status = "取消";
  assert.equal(evaluate(fixed, cancelled, now).trifecta.refunded,
    fixed.trifectaTickets.filter(ticket => ticket.includes(last.number)).length);
});

test("CLIで再現・固定、照合、集計でき、既存ファイルへの書き込みを拒否する", () => {
  const directory = mkdtempSync(join(tmpdir(), "historical-backtest-"));
  const cli = (...args) => spawnSync(process.execPath, [resolve(__dirname, "../historical-backtest.js"), ...args],
    {cwd: directory, encoding: "utf8"});
  const read = name => JSON.parse(readFileSync(join(directory, name), "utf8"));
  const run = (...args) => {
    const process = cli(...args);
    assert.equal(process.status, 0, process.stderr);
  };
  try {
    writeFileSync(join(directory, "input.json"), JSON.stringify(fixture()));
    run("reproduce", "input.json", "fixed.json");
    const fixed = read("fixed.json");
    writeFileSync(join(directory, "result.json"), JSON.stringify(result(fixed)));
    run("evaluate", "fixed.json", "result.json", "evaluation.json");
    run("summarize", "summary.json", "fixed.json", "result.json");
    assert.equal(read("evaluation.json").trifecta.hits, 1);
    assert.equal(read("summary.json").strict.races, 1);
    assert.notEqual(cli("reproduce", "input.json", "fixed.json").status, 0);
    assert.deepEqual(read("fixed.json"), fixed);
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
});
