"use strict";

const {createHash} = require("node:crypto");
const {readFileSync, writeFileSync} = require("node:fs");
const trial = require("./prediction-trial-core");
const {generatePreRacePrediction} = require("./pre-race-prediction");

const MODE = "historical-backtest";
const RACE_FIELDS = ["date", "course", "raceNumber", "raceName", "surface", "distance",
  "going", "condition", "weather", "wind", "pace"];
const HORSE_FIELDS = ["number", "name", "gate", "jockey", "trainer", "popularity", "odds",
  "weight", "weightDiff", "runningStyle", "cornerPosition", "previousFinish",
  "previousCorner", "closingRank", "distanceRecord", "goingRecord", "courseRecord", "pedigree", "status"];
const BASIC_RACE_FIELDS = RACE_FIELDS.slice(0, 6);
const BASIC_HORSE_FIELDS = HORSE_FIELDS.slice(0, 5);
const RESULT_FIELDS = ["number", "name", "finish", "status", "cornerPosition"];

function requireThat(condition, message) {
  if (!condition) throw new Error(message);
}

function fields(record, allowed) {
  requireThat(record && typeof record === "object" && !Array.isArray(record), "JSONオブジェクトが必要です");
  for (const key of Object.keys(record)) {
    requireThat(allowed.includes(key), "許可されていない入力項目: " + key);
  }
  return record;
}

const nonempty = value => typeof value === "string" && value.trim().length > 0;

function instant(value) {
  requireThat(typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value)), "日時には秒とタイムゾーンが必要です");
  const date = value.slice(0, 10);
  requireThat(new Date(date).toISOString().slice(0, 10) === date, "日時の日付が不正です");
  return new Date(value).toISOString();
}

function source(item, reproducedAt) {
  fields(item, ["provider", "reference", "checkedAt"]);
  requireThat(nonempty(item.provider) && nonempty(item.reference), "情報源と参照先が必要です");
  const checkedAt = instant(item.checkedAt);
  requireThat(checkedAt <= reproducedAt, "情報源の確認日時が処理日時より後です");
  return {...item, checkedAt};
}

function readValues(record, allowed, basic, path, context) {
  fields(record, allowed);
  return Object.fromEntries(Object.entries(record).map(([key, item]) => {
    fields(item, ["value", "sourceId", "availableAt", "evidence"]);
    requireThat(nonempty(item.value) || Number.isFinite(item.value), path + "." + key + " の値が不正です");
    const origin = context.sources.get(item.sourceId);
    requireThat(origin, path + "." + key + " の情報源が未登録です");
    if (basic.includes(key)) requireThat(item.sourceId === "jra", path + "." + key + " はJRA照合が必要です");
    const availableAt = item.availableAt == null ? null : instant(item.availableAt);
    requireThat(!availableAt || availableAt <= origin.checkedAt, "利用可能日時が確認日時より後です");
    requireThat(!availableAt || availableAt < context.start, "発走以降の情報は予想入力に使用できません");
    const confirmed = availableAt !== null && nonempty(item.evidence);
    context.provenance.push({
      field: path + "." + key, sourceId: item.sourceId, availableAt,
      value: item.value, evidence: nonempty(item.evidence) ? item.evidence : null, status: confirmed ? "発走前確認済み" : "取得時点未確認"
    });
    return [key, item.value];
  }));
}

const digest = record => createHash("sha256").update(JSON.stringify(record)).digest("hex");

function reproduce(input, now = new Date().toISOString(), original) {
  fields(input, ["race", "horses", "fieldSize", "scheduledStartAt", "sources", "resultInformedReason"]);
  const reproducedAt = instant(now);
  const start = instant(input.scheduledStartAt);
  requireThat(start < reproducedAt, "発走時刻を過ぎたレースが対象です");
  const sources = new Map(Object.entries(fields(input.sources, ["jra", "netkeiba"]))
    .map(([id, item]) => [id, source(item, reproducedAt)]));
  requireThat(sources.get("jra")?.provider === "JRA" &&
    (!sources.has("netkeiba") || sources.get("netkeiba").provider === "netkeibaマスター"), "情報源の区分が不正です");
  const provenance = [];
  const context = {start, sources, provenance};
  const race = readValues(input.race, RACE_FIELDS, BASIC_RACE_FIELDS, "race", context);
  const identity = trial.raceIdentity(race);
  requireThat(new Date(Date.parse(start) + 9 * 3600000).toISOString().slice(0, 10) === identity.date,
    "発走日時と開催日が一致しません");
  requireThat(nonempty(race.raceName) && nonempty(race.going), "レース名と馬場状態が必要です");
  requireThat(Number.isInteger(input.fieldSize) && Array.isArray(input.horses) &&
    input.horses.length === input.fieldSize && input.fieldSize <= 18, "登録頭数と入力行数が一致しません");
  const horses = input.horses.map((row, index) => {
    const horse = readValues(row, HORSE_FIELDS, BASIC_HORSE_FIELDS, "horses." + index, context);
    requireThat(BASIC_HORSE_FIELDS.every(key => Object.hasOwn(horse, key)), "馬番・馬名・枠番・騎手・調教師が必要です");
    requireThat(nonempty(horse.name) && nonempty(horse.jockey) && nonempty(horse.trainer), "馬名・騎手・調教師は文字列で入力してください");
    return horse;
  });
  const revised = Object.hasOwn(input, "resultInformedReason");
  if (revised) {
    requireThat(nonempty(input.resultInformedReason) && original, "結果を参考にした再試算には理由と当初の固定JSONが必要です");
    const prior = readFixed(original);
    requireThat(prior.originalChecksum === null && prior.reproducedAt <= reproducedAt &&
      Object.keys(identity).every(key => prior.race[key] === identity[key]), "当初の固定JSONが対象レースと一致しません");
  } else {
    requireThat(!original, "再試算には resultInformedReason が必要です");
  }
  const prediction = generatePreRacePrediction({...race, ...identity, horses, fieldSize: input.fieldSize, strictTrial: true});
  const record = {
    schemaVersion: 1, mode: MODE, safety: trial.SAFETY, modelVersion: trial.MODEL_VERSION,
    reproducedAt, fixedAt: reproducedAt, scheduledStartAt: start, race: prediction.race,
    sources: Object.fromEntries(sources), provenance, inputWarnings: prediction.inputWarnings,
    originalChecksum: original?.checksum ?? null, resultInformedReason: input.resultInformedReason ?? null,
    strictEligible: !revised && provenance.every(item => item.status === "発走前確認済み"),
    entries: prediction.entries.map(({number, name, status}) => ({number, name, status})),
    horses: prediction.horses.map(({number, name, zIndex, zPrimeIndex, cornerPosition, developmentMatch,
      dangerPopularLabel, godLongshotLabel}) => ({
      number, name, zIndex, zPrimeIndex, cornerPosition, developmentMatch, dangerPopularLabel, godLongshotLabel
    })),
    marks: prediction.fullAuto.markRows.map(({mark, horse}) => ({mark, number: horse.number})),
    favorite: prediction.fullAuto.markRows.find(row => row.mark === "◎").horse.number,
    longshots: prediction.horses.filter(horse => horse.godLongshotLabel === "神穴").slice(0, 3).map(horse => horse.number),
    trifectaTickets: prediction.trifectaTickets.map(ticket => ticket.map(horse => horse.number))
  };
  return {...record, checksum: digest(record)};
}

function readFixed(record) {
  const {checksum, ...body} = record ?? {};
  requireThat(body.schemaVersion === 1 && body.mode === MODE &&
    Object.keys(trial.SAFETY).every(flag => body.safety?.[flag] === true) &&
    typeof checksum === "string" && checksum === digest(body), "バックテスト固定JSONが不正、または変更されています");
  return record;
}

const rate = (hits, total) => total ? hits * 100 / total : null;
const indexOrder = (horses, field) => [...horses].sort((a, b) => b[field] - a[field] || Number(a.number) - Number(b.number));

function evaluate(fixed, result, now = new Date().toISOString()) {
  readFixed(fixed);
  const evaluatedAt = instant(now);
  requireThat(evaluatedAt >= fixed.fixedAt, "固定日時より後に結果を照合してください");
  fields(result, ["race", "source", "status", "horses", "trifectaPayout"]);
  requireThat(result.status === "確定" && result.source?.provider === "JRA", "JRA公式の確定結果が必要です");
  const officialSource = source(result.source, evaluatedAt);
  requireThat(officialSource.checkedAt >= fixed.scheduledStartAt, "結果の確認日時が発走前です");
  const identity = trial.raceIdentity(fields(result.race, ["date", "course", "raceNumber"]));
  requireThat(Object.keys(identity).every(key => fixed.race[key] === identity[key]), "結果のレースが一致しません");
  requireThat(Array.isArray(result.horses) && result.horses.length === fixed.entries.length, "結果の登録頭数が一致しません");
  const rows = trial.normalizeRows(result.horses.map(row => fields(row, RESULT_FIELDS)), identity, {result: true});
  const entries = new Map(fixed.entries.map(horse => [horse.number, horse]));
  const actual = new Map(rows.map(horse => [horse.number, horse]));
  for (const horse of rows) {
    const entry = entries.get(horse.number);
    requireThat(entry?.name === horse.name && (entry.status === "active" || ["withdrawn", "excluded"].includes(horse.status)),
      "結果と固定時の馬番・馬名・出走状態が一致しません");
  }
  const ranked = rows.filter(horse => horse.finish !== null).sort((a, b) => a.finish - b.finish);
  let previousRank = 0;
  ranked.forEach((horse, index) => {
    requireThat(horse.finish === previousRank || horse.finish === index + 1, "結果の着順に欠落があります");
    previousRank = horse.finish;
  });
  const top = [1, 2, 3].map(rank => ranked.filter(horse => horse.finish === rank));
  const ordered = top.every(group => group.length === 1) ? top.map(group => group[0].number) : null;
  const refunded = number => ["withdrawn", "excluded"].includes(actual.get(number).status);
  const tickets = fixed.trifectaTickets.filter(ticket => !ticket.some(refunded));
  const hits = ordered ? tickets.filter(ticket => ticket.every((number, index) => number === ordered[index])).length : null;
  const payout = result.trifectaPayout ?? null;
  requireThat(payout === null || Number.isSafeInteger(payout) && payout > 0, "三連単払戻金は100円あたりの正の整数で入力してください");
  const stake = tickets.length * 100;
  const gross = hits === null || payout === null ? null : payout * hits;
  const inTop3 = number => {
    const finish = actual.get(number).finish;
    return finish !== null && finish <= 3;
  };
  const indexes = Object.fromEntries(["zIndex", "zPrimeIndex"].map(field => {
    const order = indexOrder(fixed.horses, field);
    return [field, {firstNumber: order[0].number, firstFinish: actual.get(order[0].number).finish,
      top3InTop3: order.slice(0, 3).filter(horse => inTop3(horse.number)).length}];
  }));
  const longshots = fixed.longshots.filter(number => !refunded(number));
  const positions = fixed.horses.flatMap(horse => {
    const position = actual.get(horse.number).cornerPosition;
    if (refunded(horse.number) || horse.cornerPosition == null || position == null) return [];
    return [{number: horse.number, predicted: horse.cornerPosition, actual: position, difference: position - horse.cornerPosition}];
  });
  return {
    mode: MODE, safety: trial.SAFETY, fixedChecksum: fixed.checksum, race: fixed.race,
    modelVersion: fixed.modelVersion, strictEligible: fixed.strictEligible, evaluatedAt, source: officialSource,
    indexes, favoriteInTop3: refunded(fixed.favorite) ? null : inTop3(fixed.favorite),
    longshots: {count: longshots.length, inTop3: longshots.filter(inTop3).length},
    positions, trifecta: {ordered, tickets: tickets.length, refunded: fixed.trifectaTickets.length - tickets.length,
      hits, hitRate: hits === null ? null : rate(hits, tickets.length), stake, payout, gross, returnRate: gross === null ? null : rate(gross, stake)}
  };
}

function metrics(rows) {
  const sum = (items, select) => items.reduce((total, item) => total + select(item), 0);
  const favorites = rows.filter(row => row.favoriteInTop3 !== null);
  const trifectas = rows.filter(row => row.trifecta.hits !== null && row.trifecta.tickets > 0);
  const stakes = rows.filter(row => row.trifecta.stake > 0);
  const positions = rows.flatMap(row => row.positions);
  const hits = sum(trifectas, row => row.trifecta.hits);
  return {
    races: rows.length,
    indexes: Object.fromEntries(["zIndex", "zPrimeIndex"].map(field => [field, {
      top3InTop3: sum(rows, row => row.indexes[field].top3InTop3)
    }])),
    favoriteStarts: favorites.length,
    favoriteTop3Rate: rate(favorites.filter(row => row.favoriteInTop3).length, favorites.length),
    longshotStarts: sum(rows, row => row.longshots.count),
    longshotTop3Rate: rate(sum(rows, row => row.longshots.inTop3), sum(rows, row => row.longshots.count)),
    trifectaHits: hits, trifectaEvaluatedRaces: trifectas.length,
    trifectaRaceHitRate: rate(trifectas.filter(row => row.trifecta.hits > 0).length, trifectas.length),
    trifectaEvaluatedTickets: sum(trifectas, row => row.trifecta.tickets),
    trifectaTicketHitRate: rate(hits, sum(trifectas, row => row.trifecta.tickets)),
    stake: sum(stakes, row => row.trifecta.stake),
    returnRate: stakes.some(row => row.trifecta.gross === null) ? null :
      rate(sum(stakes, row => row.trifecta.gross), sum(stakes, row => row.trifecta.stake)),
    positionCount: positions.length,
    meanAbsolutePositionError: positions.length ? sum(positions, row => Math.abs(row.difference)) / positions.length : null
  };
}

function summarize(evaluations) {
  const strict = evaluations.filter(row => row.strictEligible);
  const groups = new Map();
  const seen = new Set();
  for (const row of strict) {
    const id = [row.race.date, row.race.course, row.race.raceNumber].join("/");
    requireThat(!seen.has(id), "厳密集計に同じレースが複数あります: " + id);
    seen.add(id);
    const key = [row.race.surface, row.race.going, String(row.race.distance).replace(/m$/i, "")].join("/");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return {mode: MODE, safety: trial.SAFETY, strict: metrics(strict),
    byGoingAndDistance: Object.fromEntries([...groups].map(([key, rows]) => [key, metrics(rows)])),
    excludedRaces: evaluations.length - strict.length, evaluations};
}

function run([command, ...args]) {
  const read = path => JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
  const save = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + "\n", {encoding: "utf8", flag: "wx"});
  if (command === "reproduce" && [2, 3].includes(args.length)) {
    save(args[1], reproduce(read(args[0]), undefined, args[2] ? read(args[2]) : undefined));
  } else if (command === "evaluate" && args.length === 3) {
    const fixed = readFixed(read(args[0]));
    save(args[2], evaluate(fixed, read(args[1])));
  } else if (command === "summarize" && args.length >= 3 && args.length % 2 === 1) {
    const [output, ...pairs] = args;
    const evaluations = [];
    for (let i = 0; i < pairs.length; i += 2) {
      const fixed = readFixed(read(pairs[i]));
      evaluations.push(evaluate(fixed, read(pairs[i + 1])));
    }
    save(output, summarize(evaluations));
  } else {
    throw new Error("操作と引数を確認してください (reproduce / evaluate / summarize)");
  }
}

if (require.main === module) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {reproduce, evaluate, summarize};
