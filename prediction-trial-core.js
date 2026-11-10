(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined") module.exports = api;
  else root.HashimotoPredictionTrial = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const SAFETY = Object.freeze({protectedMode:true, planOnly:true, privateLocalOnly:true});
  const MODEL_VERSION = "Z-Ver4.0-P0.1";
  const COURSES = Object.freeze(["京都","阪神","東京","中山","中京","福島","新潟","小倉","函館","札幌"].map(name => name + "競馬場"));
  const OLD_COURSES = ["莠ｬ驛ｽ遶ｶ鬥ｬ蝣ｴ","髦ｪ逾樒ｫｶ鬥ｬ蝣ｴ","譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ","荳ｭ螻ｱ遶ｶ鬥ｬ蝣ｴ","荳ｭ莠ｬ遶ｶ鬥ｬ蝣ｴ","遖丞ｳｶ遶ｶ鬥ｬ蝣ｴ","譁ｰ貎溽ｫｶ鬥ｬ蝣ｴ","蟆丞臥ｫｶ鬥ｬ蝣ｴ","蜃ｽ鬢ｨ遶ｶ鬥ｬ蝣ｴ","譛ｭ蟷檎ｫｶ鬥ｬ蝣ｴ"];
  const text = value => String(value ?? "").trim();
  const key = value => text(value).normalize("NFKC").replace(/[ _-]/g,"").toLowerCase();
  const courseName = value => {
    const name = text(value);
    return COURSES[OLD_COURSES.indexOf(name)] || COURSES.find(c => c === name || c === name + "競馬場") || name;
  };
  const raceNo = value => {
    const match = text(value).normalize("NFKC").match(/^(0?[1-9]|1[0-2])R?$/i);
    return match ? Number(match[1]) + "R" : "";
  };
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    new Date(value).toJSON()?.slice(0,10) === value;
  function raceIdentity(input, required = true) {
    const date = text(input.date ?? input.raceDate);
    const course = courseName(input.course ?? input.racecourse);
    const rawNo = input.raceNumber;
    const raceNumber = raceNo(rawNo);
    if ((required || date) && !validDate(date)) throw Error("開催日が不正です");
    if ((required || course) && !COURSES.includes(course)) throw Error("競馬場が不正です");
    if ((required || text(rawNo)) && !raceNumber) throw Error("レース番号は1～12Rです");
    return {date, course, raceNumber};
  }
  const sameRace = (a,b) => ["date","course","raceNumber"].every(k => a[k] === b[k]);

  const aliases = {
    number:["no","horse_number","馬番","番号"], name:["horse","horse_name","馬名","出走馬"],
    popularity:["人気"], odds:["オッズ","単勝オッズ"], jockey:["騎手"], trainer:["調教師"],
    weight:["馬体重","body_weight"], weightDiff:["馬体重増減","増減","body_weight_diff"],
    runningStyle:["脚質"], cornerPosition:["expected_corner4","corner4_position","想定4角位置","4角位置","4角","四角"],
    previousFinish:["前走着順"], previousCorner:["前走4角位置"], closingRank:["上がり順位"],
    distanceRecord:["距離実績","距離適性"], goingRecord:["馬場実績","馬場適性"], courseRecord:["コース実績"],
    pedigree:["bloodline","血統"], gate:["枠番","枠順"], finish:["finish_position","着順"],
    lap:["ラップ"], payout:["払戻金"], trifectaPayout:["payout_trifecta","三連単配当"],
    date:["race_date","開催日"], course:["racecourse","競馬場"], raceNumber:["R番号","レース番号"],
    raceName:["レース名"], surface:["芝ダート","芝/ダート"], distance:["距離"], going:["馬場","馬場状態"],
    weather:["天候"], fieldSize:["頭数","出走頭数"], status:["entry_status","finish_status","出走状態","状態","取消区分"],
    scratched:["取消"], excluded:["除外"],
    last3f:["last_3f","上がり3F"], trainingGrade:["調教評価"], aiScore:["AI総合スコア","AI指数"],
    darkHorseScore:[], riskScore:[], timeIndex:["タイム指数"], trackBias:["トラックバイアス"],
    individualLaps:["個別ラップ"], pace:["ペース"], memo:["メモ"], startTime:["発走時刻"]
  };
  const headerKeys = new Map(Object.entries(aliases).flatMap(([name, values]) => [name,...values].map(value => [key(value),name])));
  const entryColumns = ["number","name","popularity","odds","jockey","trainer","weight","weightDiff","runningStyle","cornerPosition","previousFinish","previousCorner","closingRank","distanceRecord","goingRecord","courseRecord","pedigree","gate"];
  const resultColumns = ["finish","number","name","popularity","odds","jockey","trainer","cornerPosition","lap","payout","trifectaPayout"];

  function csvRecords(source) {
    if (String(source ?? "").length > 256000) throw Error("CSVは256,000文字以内にしてください");
    const csv = String(source ?? "").replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n");
    const rows = [];
    let row = [], cell = "", quoted = false, closed = false, line = 1, start = 1;
    function emitCell() {
      row.push(cell);
      cell = "";
      closed = false;
    }
    function emitRow() {
      emitCell();
      if (row.some(text)) rows.push({cells:row, line:start});
      row = [];
      start = line + 1;
    }
    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      if (quoted) {
        if (char === '"' && csv[i+1] === '"') { cell += '"'; i++; }
        else if (char === '"') { quoted = false; closed = true; }
        else cell += char;
      } else if (char === ",") emitCell();
      else if (char === "\n") emitRow();
      else if (char === '"' && !cell && !closed) quoted = true;
      else if (char === '"' || closed) throw Error(`${line}行: CSV引用符が不正です`);
      else cell += char;
      if (char === "\n") line++;
    }
    if (quoted) throw Error(`${start}行: CSV引用符が閉じていません`);
    emitRow();
    return rows;
  }

  function parseCsv(source, kind) {
    const records = csvRecords(source);
    if (!records.length) return [];
    const fallback = kind === "result" ? resultColumns : entryColumns;
    const first = records[0].cells;
    const header = !/^\d+$/.test(text(first[0]).normalize("NFKC"));
    const fields = header ? first.map(value => headerKeys.get(key(value))) : fallback;
    if (header && (first.some(value => !text(value)) || new Set(first.map(key)).size !== first.length || !fallback.slice(0,kind === "result" ? 3 : 2).every(field => fields.includes(field)) ||
        new Set(fields.filter(Boolean)).size !== fields.filter(Boolean).length)) {
      throw Error(`${records[0].line}行: CSVヘッダーに必須列の不足または重複があります（${fallback.slice(0,kind === "result" ? 3 : 2).join(", ")}）`);
    }
    return records.slice(header ? 1 : 0).map(({cells,line}) => {
      if (header ? cells.length !== fields.length : cells.length > fields.length) {
        throw Error(`${line}行: CSVの列数が一致しません。カンマを含む値は引用符で囲んでください`);
      }
      return {...Object.fromEntries(fields.flatMap((field,i) => field ? [[field,cells[i]]] : [])), line};
    });
  }

  function numeric(value, field, line, min, max, integer = true, required = false) {
    const raw = text(value).normalize("NFKC");
    if (!raw && !required) return null;
    const n = Number(raw);
    if (!/^[+-]?\d+(?:\.\d+)?$/.test(raw) || !Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
      throw Error(`${line}行: ${field}が未入力または不正です`);
    }
    return n;
  }

  function normalizeRows(rows, identity = {}, options = {}) {
    if (!Array.isArray(rows) || rows.length > 18) throw Error("入力は1レース18頭以内です");
    const seen = new Set();
    return rows.map((row, i) => {
      const line = row.line || i + 1;
      const number = String(numeric(row.number, "馬番", line, 1, 18, true, true));
      const name = text(row.name);
      if (!name || ["--","未入力馬"].includes(name)) throw Error(`${line}行: 馬名が必要です`);
      if (seen.has(number)) throw Error(`${line}行: 重複馬番 ${number}`);
      seen.add(number);
      let actual;
      try { actual = raceIdentity(row,false); } catch (error) { throw Error(line + "行: " + error.message); }
      for (const field of ["date","course","raceNumber"]) {
        if (actual[field] && identity[field] && actual[field] !== identity[field]) {
          throw Error(`${line}行: ${field}が画面のレース情報と一致しません`);
        }
      }
      const statusText = text(row.status) || (options.result && /^(取消|出走取消|除外|競走除外|中止|競走中止|失格)$/.test(text(row.finish)) ? text(row.finish) : "");
      const declaredStatus = ({
        "":"active", "出走":"active", "active":"active", "取消":"withdrawn", "出走取消":"withdrawn",
        "除外":"excluded", "競走除外":"excluded", "withdrawn":"withdrawn", "excluded":"excluded", "中止":"dnf", "競走中止":"dnf", "失格":"dnf", "dnf":"dnf"
      })[statusText];
      const flags = [["scratched","withdrawn"],["excluded","excluded"]].filter(([field]) => {
        const value = key(row[field]);
        if (["","0","false","no","無","なし"].includes(value)) return false;
        if (["1","true","yes","有","取消","除外"].includes(value)) return true;
        throw Error(line + "行: " + field + "が不正です");
      });
      if (flags.length > 1 || (flags.length && statusText && declaredStatus !== flags[0][1])) {
        throw Error(line + "行: 取消・除外情報が矛盾しています");
      }
      const status = flags.length ? flags[0][1] : declaredStatus;
      if (!["active","withdrawn","excluded",...(options.result ? ["dnf"] : [])].includes(status)) throw Error(`${line}行: 出走状態が不正です`);
      if (status !== "active" && options.result && text(row.finish) && text(row.finish) !== statusText) {
        throw Error(`${line}行: 取消・除外・中止・失格に着順は指定できません`);
      }
      if (!options.result && text(row.fieldSize) && numeric(row.fieldSize,"頭数",line,1,18) !== (options.fieldSize || rows.length)) {
        throw Error(`${line}行: 頭数と入力行数が一致しません`);
      }
      if (text(row.distance)) numeric(text(row.distance).replace(/m$/i,""),"距離",line,1,10000);
      const popularity = numeric(row.popularity,"人気",line,1,18);
      const odds = numeric(row.odds,"オッズ",line,1,Number.MAX_SAFE_INTEGER,false);
      const result = {
        ...row, ...actual, line, number, name, status, popularity, odds,
        cornerPosition:numeric(row.cornerPosition,"4角位置",line,1,18)
      };
      if (options.result) {
        result.finish = status === "active" ? numeric(row.finish,"着順",line,1,18,true,true) : null;
      } else {
        for (const [field,label,max] of [["previousFinish","前走着順",18],["previousCorner","前走4角位置",18],["closingRank","上がり順位",18],["gate","枠番",8]]) {
          result[field] = numeric(row[field],label,line,1,max);
        }
        result.weight = numeric(row.weight,"馬体重",line,1,999);
        result.weightDiff = numeric(row.weightDiff,"馬体重増減",line,-999,999);
      }
      return result;
    });
  }

  function validateContext(rows, race, context) {
    const identity = raceIdentity(race, Boolean(context.strictTrial));
    const declared = numeric(context.fieldSize, "登録頭数", "画面", 1, 18, true, Boolean(context.strictTrial));
    if (declared !== null && declared !== rows.length) throw Error("画面: 登録頭数と入力行数が一致しません（取消・除外を含む）");
    if (context.strictTrial && (!text(race.raceName) || !/^(芝|ダート)$/.test(text(race.surface)) ||
        !/^\d+(?:m)?$/i.test(text(race.distance)) || !numeric(text(race.distance).replace(/m$/i,""),"距離","画面",1,10000))) {
      throw Error("画面: レース名、芝・ダート、距離が必要です");
    }
    return {identity, rows:normalizeRows(rows,identity,{fieldSize:declared})};
  }

  const freeze = value => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      for (const item of Object.values(value)) freeze(item);
      Object.freeze(value);
    }
    return value;
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[char]);
  function instant(value) {
    const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.exec(text(value));
    if (!match || !validDate(match[1]) || !Number.isFinite(Date.parse(value))) throw Error("日時はタイムゾーン付きの有効なISO 8601で入力してください");
    return new Date(value).toISOString();
  }

  function sourceMetadata(input, race, importMethod) {
    const sourceName = text(input.sourceName);
    const sourceType = text(input.sourceType);
    const dataType = text(input.dataType || "出馬表・オッズ");
    if (!sourceName || !["公式","会員情報","補足情報"].includes(sourceType) ||
        !["手入力","CSV","貼り付け"].includes(importMethod)) throw Error("情報源・区分・入力方式を確認してください");
    return {sourceName,sourceType,acquiredAt:instant(input.acquiredAt),raceDate:race.date,
      racecourse:race.course,raceNumber:race.raceNumber,dataType,importMethod,sourceNote:text(input.sourceNote)};
  }

  function validateTickets(tickets, active) {
    if (!Array.isArray(tickets)) throw Error("三連単候補が不正です");
    const seen = new Set();
    for (const ticket of tickets) {
      if (!Array.isArray(ticket) || ticket.length !== 3 || new Set(ticket).size !== 3 ||
          !ticket.every(n => typeof n === "string" && active.has(n)) || seen.has(ticket.join("-"))) {
        throw Error("三連単候補に無効または重複する馬番・買い目があります");
      }
      seen.add(ticket.join("-"));
    }
  }

  // Detect accidental edits to the exported record. This is a checksum, not a signature.
  function checksum(record) {
    const {checksum: ignored, ...body} = record;
    let hash = 2166136261;
    for (const char of JSON.stringify(body)) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
    return (hash >>> 0).toString(16).padStart(8,"0");
  }

  function validateSnapshot(record) {
    if (record?.schemaVersion !== 1 || record.modelVersion !== MODEL_VERSION || record.confirmedBeforeResult !== true ||
        !Object.keys(SAFETY).every(flag => record.safety?.[flag] === true) ||
        typeof record.id !== "string" || !text(record.race?.raceName) ||
        !Array.isArray(record.entries) || !Array.isArray(record.ranking)) throw Error("確定予想JSONの形式が不正です");
    if (record.checksum !== checksum(record)) throw Error("確定予想JSONの内容が変更されています");
    const identity = raceIdentity(record.race);
    const fixed = instant(record.confirmedAt), start = instant(record.scheduledStartAt);
    if (record.id !== [identity.date,identity.course,identity.raceNumber,fixed].join("/") ||
        new Date(Date.parse(start) + 9 * 3600000).toISOString().slice(0,10) !== identity.date ||
        instant(record.source?.acquiredAt) > fixed || fixed >= start) throw Error("確定予想の識別情報または時刻が不正です");
    if (!Array.isArray(record.supplementalSources)) throw Error("補足情報源の形式が不正です");
    for (const item of [record.source,...record.supplementalSources]) {
      const source = sourceMetadata(item,identity,item.importMethod);
      if (["raceDate","racecourse","raceNumber"].some(field => source[field] !== item[field]) ||
          source.acquiredAt > fixed) throw Error("情報源のレースまたは確認時刻が一致しません");
    }
    const entries = normalizeRows(record.entries,identity);
    if (entries.length !== record.fieldSize) throw Error("確定予想の登録頭数が一致しません");
    const active = new Map(entries.filter(h => h.status === "active").map(h => [h.number,h.name]));
    if (active.size < 3 || record.ranking.length !== active.size) throw Error("確定予想の順位件数が一致しません");
    const seen = new Set();
    for (const [index,h] of record.ranking.entries()) {
      if (h.rank !== index+1 || seen.has(h.number) || active.get(h.number) !== h.name ||
          !text(h.mark) || ![h.zIndex,h.zPrimeIndex,h.totalScore].every(n => Number.isFinite(n) && n >= 0 && n <= 100)) {
        throw Error("確定予想の順位・指数が不正です");
      }
      seen.add(h.number);
    }
    validateTickets(record.trifectaTickets,active);
    if (record.trifectaTickets.length > (active.size <= 10 ? 8 : active.size <= 14 ? 12 : 16)) throw Error("三連単候補が目標上限を超えています");
    return record;
  }

  function createSnapshot(prediction, details, now) {
    if (details.explicitConfirmation !== true || prediction.trialValidated !== true) throw Error("入力検証済みの予想と発走前の明示確認が必要です");
    const confirmedAt = instant(now);
    const race = prediction.race;
    const identity = raceIdentity(race);
    const record = {
      schemaVersion:1, modelVersion:MODEL_VERSION, confirmedBeforeResult:true, safety:SAFETY,
      id:[identity.date,identity.course,identity.raceNumber,confirmedAt].join("/"),
      race, confirmedAt, scheduledStartAt:instant(details.scheduledStartAt),
      source:sourceMetadata(details,identity,details.importMethod), fieldSize:prediction.entries.length,
      supplementalSources:(details.supplementalSources || []).map(item => sourceMetadata(item,identity,item.importMethod)),
      entries:prediction.entries.map(h => Object.fromEntries(["line",...Object.keys(aliases)]
        .filter(field => Object.hasOwn(h,field)).map(field => [field,h[field]]))),
      ranking:prediction.horses.map(({number,name,zIndex,zPrimeIndex,totalScore,mark},i) => ({rank:i+1,number,name,zIndex,zPrimeIndex,totalScore,mark})),
      trifectaTickets:prediction.trifectaTickets.map(ticket => ticket.map(h => h.number))
    };
    record.checksum = checksum(record);
    return readSnapshot(JSON.stringify(record));
  }

  function readSnapshot(json) {
    if (typeof json !== "string" || json.length > 512000) throw Error("確定予想JSONは512,000文字以内にしてください");
    return freeze(validateSnapshot(JSON.parse(json)));
  }

  function matchTrifecta(snapshot, race, rows, resultStatus) {
    if (!snapshot) return "判定不能・要確認";
    validateSnapshot(snapshot);
    if (!sameRace(raceIdentity(snapshot.race),raceIdentity(race))) throw Error("結果と確定予想のレース識別情報が一致しません");
    if (resultStatus && !["確定","未確定"].includes(resultStatus)) return "対象外・要確認";
    if (!snapshot.trifectaTickets.length || !rows.length || resultStatus !== "確定") return "判定不能・要確認";
    const entries = new Map(snapshot.entries.map(h => [h.number,h]));
    for (const horse of rows) {
      const entry = entries.get(horse.number);
      if (!entry || entry.name !== horse.name) throw Error(`結果の馬番・馬名が確定予想と一致しません: ${horse.number} ${horse.name}`);
      if ((entry.status === "withdrawn" || entry.status === "excluded") && horse.status === "active") return "対象外・要確認";
      if (["withdrawn","excluded"].includes(horse.status) && snapshot.trifectaTickets.some(ticket => ticket.includes(horse.number))) return "対象外・要確認";
    }
    const top = [1,2,3].map(rank => rows.filter(h => h.status === "active" && h.finish === rank));
    if (top.some(group => group.length !== 1)) return "判定不能・要確認";
    const ordered = top.map(group => group[0].number);
    return snapshot.trifectaTickets.some(ticket => ticket.every((n,i) => n === ordered[i])) ? "的中" : "不的中";
  }

  function requirePrivateLocal(location) {
    const loopback = ["localhost","127.0.0.1","[::1]"].includes(location.hostname);
    if (location.protocol !== "file:" && !(loopback && ["http:","https:"].includes(location.protocol))) {
      throw Error("試験予想はPrivate Local環境で開いてください");
    }
  }

  return Object.freeze({SAFETY, requirePrivateLocal, COURSES, MODEL_VERSION, courseName, raceIdentity, parseCsv, normalizeRows,
    validateContext, escapeHtml, createSnapshot, readSnapshot, matchTrifecta});
});
