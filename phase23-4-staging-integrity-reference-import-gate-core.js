(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase234StagingIntegrityReferenceImportGateCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const SOURCE_STORAGE_KEY = "hashimotoKeibaAi.phase23.approvedPreviewStagingStorage.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase23.stagingIntegrityReferenceImportGate.v1";
  const TYPES = ["meeting", "race", "runner", "oddsSnapshot", "result", "payout", "acquisitionRecord"];
  const LEVELS = ["info", "warning", "error", "fatal"];
  const TERMINAL = ["import_candidate_ready", "rejected", "cancelled", "expired"];
  const STATUSES = [
    "awaiting_integrity_check", "integrity_check_in_progress", "integrity_check_failed",
    "integrity_checked", "awaiting_manual_gate_approval", "gate_approval_in_progress",
    "import_candidate_ready", "rejected", "cancelled", "expired"
  ];
  const TRANSITIONS = {
    awaiting_integrity_check: ["integrity_check_in_progress", "cancelled", "expired"],
    integrity_check_in_progress: ["integrity_checked", "integrity_check_failed", "cancelled", "expired"],
    integrity_check_failed: ["integrity_check_in_progress", "rejected", "cancelled", "expired"],
    integrity_checked: ["awaiting_manual_gate_approval", "rejected", "cancelled", "expired"],
    awaiting_manual_gate_approval: ["gate_approval_in_progress", "rejected", "cancelled", "expired"],
    gate_approval_in_progress: ["import_candidate_ready", "rejected", "cancelled", "expired"],
    import_candidate_ready: [], rejected: [], cancelled: [], expired: []
  };
  const POISON = new Set(["__proto__", "prototype", "constructor"]);
  const SENSITIVE = /(api.?key|password|cookie|credentials?|secret|token|access.?token|refresh.?token|authorization|client.?secret|利用キー|契約番号|account|login.?id)/i;
  const text = (value) => value == null ? "" : String(value).trim();

  function stripDangerous(value, depth = 0) {
    if (depth > 30) throw new Error("depth_limit");
    if (Array.isArray(value)) return value.map((item) => stripDangerous(item, depth + 1));
    if (!value || typeof value !== "object") return value;
    const clean = Object.create(null);
    Object.entries(value).forEach(([key, item]) => {
      if (!POISON.has(key) && !SENSITIVE.test(key) && !["rawFile", "rawPayload", "rawRecords", "fileContent"].includes(key)) {
        clean[key] = stripDangerous(item, depth + 1);
      }
    });
    return clean;
  }

  function safeParse(raw) { try { return JSON.parse(raw); } catch (_) { return null; } }
  function storageOf(storage) { return storage || (typeof localStorage !== "undefined" ? localStorage : null); }
  function stable(value) {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${key}:${stable(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  }
  function validDate(value) { return Boolean(text(value)) && !Number.isNaN(new Date(value).getTime()); }
  function timezoneMissing(value) { return Boolean(text(value)) && !/([zZ]|[+-]\d{2}:?\d{2})$/.test(text(value)); }
  function positive(value) { return Number.isFinite(Number(value)) && Number(value) > 0; }
  function nonnegative(value) { return Number.isFinite(Number(value)) && Number(value) >= 0; }
  function push(map, key, value) { if (key) { const list = map.get(key) || []; list.push(value); map.set(key, list); } }
  function numbers(value) { return (text(value).match(/\d+/g) || []).map(Number); }

  function normalizeStaging(input = {}) {
    const clean = stripDangerous(input);
    return {
      stagingId: text(clean.stagingId), stagingVersion: Number(clean.version) || 0,
      sourceValidationId: text(clean.sourceValidationId), fileHash: text(clean.sourceFileHash || clean.fileHash),
      fileHashUnavailableReason: text(clean.sourceHashUnavailableReason), dataType: text(clean.dataType),
      providerId: text(clean.providerId), stagingStatus: text(clean.stagingStatus),
      totalRecords: Number(clean.totalRecords) || 0,
      normalizedRecords: Array.isArray(clean.normalizedRecords) ? clean.normalizedRecords.map(stripDangerous) : [],
      history: Array.isArray(clean.history) ? clean.history.map(stripDangerous) : [], sourceRecord: clean
    };
  }
  function loadSourceStore(storage) {
    const target = storageOf(storage), raw = target && target.getItem(SOURCE_STORAGE_KEY), parsed = raw ? safeParse(raw) : {};
    return { sourceStore: parsed && typeof parsed === "object" ? parsed : { records: [] }, parseError: Boolean(raw && !parsed) };
  }
  function eligibleSources(store) {
    return (Array.isArray(store && store.records) ? store.records : []).map(normalizeStaging).filter((item) => item.stagingStatus === "staged");
  }
  function indexes(stagings) {
    const result = { meeting: new Map(), race: new Map(), runner: new Map(), staging: new Map(), validation: new Map(), hash: new Map() };
    stagings.forEach((staging) => {
      push(result.staging, staging.stagingId, staging); push(result.validation, staging.sourceValidationId, staging);
      if (staging.fileHash) push(result.hash, staging.fileHash, staging);
      staging.normalizedRecords.forEach((record) => {
        if (staging.dataType === "meeting") push(result.meeting, text(record.meetingId), { staging, record });
        if (staging.dataType === "race") push(result.race, text(record.raceId), { staging, record });
        if (staging.dataType === "runner") push(result.runner, `${text(record.raceId)}|${Number(record.horseNumber)}`, { staging, record });
      });
    });
    return result;
  }
  function makeIssue(code, level, staging, row, field, value, message) {
    return { code, level, stagingId: text(staging.stagingId), dataType: text(staging.dataType), row, field, value: value == null ? null : String(value).slice(0, 300), message };
  }
  function addReference(map, key, add, staging, row, field, prefix) {
    const found = map.get(key) || [];
    if (!key || !found.length) add(`${prefix}_MISSING`, "error", row, field, key, "参照先がありません");
    else if (found.length > 1) add(`${prefix}_BRANCH`, "fatal", row, field, key, "参照先が複数候補に分岐しています");
    else add(`${prefix}_OK`, "info", row, field, key, "候補群内の参照を確認しました");
  }
  function addDuplicate(local, key, record, add, row, code) {
    if (!key) return;
    if (local.has(key)) {
      const exact = stable(local.get(key)) === stable(record);
      add(exact ? code : "CONFLICTING_DUPLICATE", exact ? "error" : "fatal", row, "key", key, exact ? "完全重複です" : "同一キーの内容が矛盾しています");
    } else local.set(key, record);
  }
  function addDateCheck(value, field, add, row, required) {
    if (!text(value)) { if (required) add("DATETIME_REQUIRED", "error", row, field, "", "日時が必要です"); return; }
    if (!validDate(value)) { add("DATETIME_INVALID", "error", row, field, value, "日時が不正です"); return; }
    if (timezoneMissing(value)) add("TIMEZONE_MISSING", "warning", row, field, value, "timezoneがありません");
    if (new Date(value).getTime() > Date.now() + 7 * 86400000) add("DATETIME_FUTURE", "error", row, field, value, "許容範囲を超える未来日時です");
  }
  function conflictStatus(issues) {
    if (issues.some((item) => item.code === "CONFLICTING_DUPLICATE")) return "conflicting_duplicate";
    if (issues.some((item) => item.code.includes("REFERENCE") && ["error", "fatal"].includes(item.level))) return "reference_conflict";
    if (issues.some((item) => /TIME|DATETIME|BEFORE|AFTER/.test(item.code) && ["error", "fatal"].includes(item.level))) return "chronology_conflict";
    if (issues.some((item) => /COUNT|SET|COMBINATION/.test(item.code) && ["error", "fatal"].includes(item.level))) return "count_conflict";
    if (issues.some((item) => /REQUIRED|INVALID|MISMATCH/.test(item.code) && ["error", "fatal"].includes(item.level))) return "schema_conflict";
    if (issues.some((item) => item.code.includes("DUPLICATE"))) return "exact_duplicate";
    return issues.some((item) => item.level === "warning") ? "possible_conflict" : "no_conflict";
  }
  function summaryFor(issues, regex) {
    const selected = issues.filter((item) => regex.test(item.code));
    return { status: selected.some((item) => ["error", "fatal"].includes(item.level)) ? "conflict" : selected.length ? "checked" : "not_applicable", count: selected.length };
  }

  function validateGroup(inputs, existingGateRecords = []) {
    const stagings = (inputs || []).map(normalizeStaging), idx = indexes(stagings), issues = [];
    const stagingIds = new Set(), versions = new Set(), historyIds = new Set();
    stagings.forEach((staging) => {
      const own = [], add = (code, level, row, field, value, message) => { const item = makeIssue(code, level, staging, row, field, value, message); own.push(item); issues.push(item); };
      if (staging.stagingStatus !== "staged") add("SOURCE_NOT_STAGED", "fatal", 0, "stagingStatus", staging.stagingStatus, "staged以外は対象外です");
      if (!staging.stagingId) add("STAGING_ID_REQUIRED", "fatal", 0, "stagingId", "", "stagingIdが必要です");
      else if (stagingIds.has(staging.stagingId)) add("STAGING_ID_DUPLICATE", "fatal", 0, "stagingId", staging.stagingId, "stagingIdが重複しています");
      stagingIds.add(staging.stagingId);
      const versionKey = `${staging.stagingId}|${staging.stagingVersion}`;
      if (!Number.isInteger(staging.stagingVersion) || staging.stagingVersion < 1) add("VERSION_INVALID", "fatal", 0, "version", staging.stagingVersion, "versionは正の整数が必要です");
      else if (versions.has(versionKey)) add("VERSION_DUPLICATE", "fatal", 0, "version", staging.stagingVersion, "同一versionが重複しています");
      versions.add(versionKey);
      if (!staging.sourceValidationId) add("SOURCE_VALIDATION_REQUIRED", "fatal", 0, "sourceValidationId", "", "sourceValidationIdが必要です");
      if (!TYPES.includes(staging.dataType)) add("DATA_TYPE_INVALID", "fatal", 0, "dataType", staging.dataType, "dataTypeが対象外です");
      if (!staging.normalizedRecords.length) add("RECORDS_EMPTY", "fatal", 0, "normalizedRecords", "", "空配列は対象外です");
      if (staging.totalRecords !== staging.normalizedRecords.length) add("SUMMARY_COUNT_MISMATCH", "error", 0, "totalRecords", staging.totalRecords, "summary件数とrecords件数が一致しません");
      staging.history.forEach((entry) => { const id = text(entry.historyId); if (id && historyIds.has(id)) add("HISTORY_ID_DUPLICATE", "error", 0, "historyId", id, "履歴IDが重複しています"); if (id) historyIds.add(id); });
      if (existingGateRecords.some((record) => record.stagingId === staging.stagingId && record.importCandidateReady)) add("EXISTING_CANDIDATE_DUPLICATE", "fatal", 0, "stagingId", staging.stagingId, "既に候補化済みです");

      const local = new Map();
      staging.normalizedRecords.forEach((record, index) => {
        const row = index + 1, key = (...fields) => fields.map((field) => text(record[field])).join("|");
        if (record.dataType && text(record.dataType) !== staging.dataType && staging.dataType !== "acquisitionRecord") add("RECORD_DATA_TYPE_MISMATCH", "error", row, "dataType", record.dataType, "recordとstagingのdataTypeが一致しません");
        if (staging.dataType === "meeting") {
          if (!text(record.meetingId)) add("MEETING_ID_REQUIRED", "error", row, "meetingId", "", "meetingIdが必要です");
          if (!validDate(record.raceDate || record.meetingDate)) add("MEETING_DATE_INVALID", "error", row, "raceDate", record.raceDate, "開催日が不正です");
          if (!text(record.venueCode)) add("VENUE_CODE_REQUIRED", "error", row, "venueCode", "", "競馬場コードが必要です");
          addDuplicate(local, key("meetingId"), record, add, row, "MEETING_DUPLICATE");
        } else if (staging.dataType === "race") {
          if (!text(record.raceId)) add("RACE_ID_REQUIRED", "error", row, "raceId", "", "raceIdが必要です");
          if (!text(record.meetingId)) add("MEETING_REF_REQUIRED", "error", row, "meetingId", "", "meetingIdが必要です");
          if (!positive(record.raceNumber) || !Number.isInteger(Number(record.raceNumber))) add("RACE_NUMBER_INVALID", "error", row, "raceNumber", record.raceNumber, "raceNumberが不正です");
          if (!positive(record.distance)) add("DISTANCE_INVALID", "error", row, "distance", record.distance, "distanceが不正です");
          addReference(idx.meeting, text(record.meetingId), add, staging, row, "meetingId", "MEETING_REFERENCE");
          addDuplicate(local, key("meetingId", "raceNumber"), record, add, row, "RACE_SLOT_DUPLICATE");
          if (record.startTime) addDateCheck(record.startTime, "startTime", add, row, false);
        } else if (staging.dataType === "runner") {
          if (!text(record.raceId)) add("RACE_REF_REQUIRED", "error", row, "raceId", "", "raceIdが必要です");
          if (!positive(record.horseNumber) || !Number.isInteger(Number(record.horseNumber))) add("HORSE_NUMBER_INVALID", "error", row, "horseNumber", record.horseNumber, "馬番が不正です");
          if (!text(record.runnerId) && !text(record.horseName)) add("RUNNER_IDENTITY_REQUIRED", "error", row, "horseName", "", "runnerIdまたはhorseNameが必要です");
          addReference(idx.race, text(record.raceId), add, staging, row, "raceId", "RACE_REFERENCE");
          addDuplicate(local, key("raceId", "horseNumber"), record, add, row, "RUNNER_DUPLICATE");
        } else if (staging.dataType === "oddsSnapshot") {
          if (!text(record.raceId)) add("RACE_REF_REQUIRED", "error", row, "raceId", "", "raceIdが必要です");
          if (!text(record.betType || record.oddsType)) add("BET_TYPE_REQUIRED", "error", row, "betType", "", "odds種別が必要です");
          if (!positive(record.odds)) add("ODDS_INVALID", "error", row, "odds", record.odds, "oddsは正数が必要です");
          if (record.popularity != null && (!positive(record.popularity) || !Number.isInteger(Number(record.popularity)))) add("POPULARITY_INVALID", "error", row, "popularity", record.popularity, "人気は正の整数が必要です");
          addDateCheck(record.capturedAt, "capturedAt", add, row, true); addReference(idx.race, text(record.raceId), add, staging, row, "raceId", "RACE_REFERENCE");
          addDuplicate(local, key("raceId", "betType", "combination", "capturedAt"), record, add, row, "ODDS_DUPLICATE");
          numbers(record.combination).forEach((number) => { if (!idx.runner.has(`${text(record.raceId)}|${number}`)) add("ODDS_RUNNER_MISSING", "error", row, "combination", record.combination, "odds組合せのrunner参照切れです"); });
        } else if (staging.dataType === "result") {
          if (!text(record.raceId)) add("RACE_REF_REQUIRED", "error", row, "raceId", "", "raceIdが必要です");
          if (!positive(record.horseNumber) || !Number.isInteger(Number(record.horseNumber))) add("HORSE_NUMBER_INVALID", "error", row, "horseNumber", record.horseNumber, "馬番が不正です");
          const exceptional = /取消|除外|中止|失格/.test(text(record.finishStatus));
          if (!exceptional && (!positive(record.finishPosition) || !Number.isInteger(Number(record.finishPosition)))) add("FINISH_INVALID", "error", row, "finishPosition", record.finishPosition, "着順または例外状態が必要です");
          if (exceptional && positive(record.finishPosition)) add("FINISH_STATUS_CONFLICT", "error", row, "finishPosition", record.finishPosition, "例外状態と通常着順が矛盾しています");
          addReference(idx.race, text(record.raceId), add, staging, row, "raceId", "RACE_REFERENCE"); addReference(idx.runner, `${text(record.raceId)}|${Number(record.horseNumber)}`, add, staging, row, "horseNumber", "RUNNER_REFERENCE");
          addDuplicate(local, key("raceId", "horseNumber"), record, add, row, "RESULT_DUPLICATE"); if (record.confirmedAt) addDateCheck(record.confirmedAt, "confirmedAt", add, row, false);
        } else if (staging.dataType === "payout") {
          if (!text(record.raceId)) add("RACE_REF_REQUIRED", "error", row, "raceId", "", "raceIdが必要です");
          if (!text(record.betType)) add("BET_TYPE_REQUIRED", "error", row, "betType", "", "betTypeが必要です");
          if (!text(record.combination)) add("COMBINATION_REQUIRED", "error", row, "combination", "", "combinationが必要です");
          if (!nonnegative(record.payoutAmount != null ? record.payoutAmount : record.payout)) add("PAYOUT_INVALID", "error", row, "payoutAmount", record.payoutAmount, "払戻額は0以上が必要です");
          addReference(idx.race, text(record.raceId), add, staging, row, "raceId", "RACE_REFERENCE"); addDuplicate(local, key("raceId", "betType", "combination"), record, add, row, "PAYOUT_DUPLICATE");
          numbers(record.combination).forEach((number) => { if (!idx.runner.has(`${text(record.raceId)}|${number}`)) add("PAYOUT_RUNNER_MISSING", "error", row, "combination", record.combination, "払戻組合せのrunner参照切れです"); });
          if (record.confirmedAt) addDateCheck(record.confirmedAt, "confirmedAt", add, row, false);
        } else if (staging.dataType === "acquisitionRecord") {
          if (!text(record.acquisitionId)) add("ACQUISITION_ID_REQUIRED", "error", row, "acquisitionId", "", "acquisitionIdが必要です");
          if (!text(record.providerId || record.sourceType)) add("PROVIDER_REQUIRED", "error", row, "providerId", "", "providerIdまたはsourceTypeが必要です");
          if (!text(record.dataType)) add("ACQUISITION_TYPE_REQUIRED", "error", row, "dataType", "", "対象dataTypeが必要です");
          if (!text(record.fileHash || record.hashUnavailableReason)) add("ACQUISITION_HASH_REQUIRED", "error", row, "fileHash", "", "fileHashまたは未生成理由が必要です");
          if (!text(record.sourceValidationId)) add("ACQUISITION_VALIDATION_REQUIRED", "error", row, "sourceValidationId", "", "sourceValidationIdが必要です");
          addDateCheck(record.acquiredAt || record.receivedAt, "acquiredAt", add, row, true);
          if (record.sourceValidationId) addReference(idx.validation, text(record.sourceValidationId), add, staging, row, "sourceValidationId", "VALIDATION_REFERENCE");
          if (record.fileHash) addReference(idx.hash, text(record.fileHash), add, staging, row, "fileHash", "HASH_REFERENCE");
          if (record.stagingId) addReference(idx.staging, text(record.stagingId), add, staging, row, "stagingId", "STAGING_REFERENCE");
          addDuplicate(local, key("acquisitionId"), record, add, row, "ACQUISITION_DUPLICATE");
        }
      });
      staging.validation = { issues: own, counts: { info: 0, warning: 0, error: 0, fatal: 0 } };
      own.forEach((item) => staging.validation.counts[item.level]++);
    });

    addCrossChecks(stagings, idx, issues);
    const cycleIds = detectCycles(stagings, idx);
    cycleIds.forEach((id) => { const staging = stagings.find((item) => item.stagingId === id); if (staging) issues.push(makeIssue("REFERENCE_CYCLE", "fatal", staging, 0, "reference", id, "循環参照があります")); });
    stagings.forEach((staging) => {
      issues.filter((item) => item.stagingId === staging.stagingId && !staging.validation.issues.includes(item)).forEach((item) => { staging.validation.issues.push(item); staging.validation.counts[item.level]++; });
      const own = staging.validation.issues;
      staging.validation.conflict = conflictStatus(own);
      staging.validation.referenceSummary = summaryFor(own, /REFERENCE|RUNNER_MISSING/);
      staging.validation.chronologySummary = summaryFor(own, /TIME|DATETIME|BEFORE|AFTER/);
      staging.validation.countSummary = summaryFor(own, /COUNT|SET|COMBINATION|SUMMARY/);
      staging.integrityStatus = staging.validation.counts.fatal || staging.validation.counts.error ? "integrity_check_failed" : "integrity_checked";
    });
    return { stagings, issues, summary: LEVELS.reduce((out, level) => { out[level] = issues.filter((item) => item.level === level).length; return out; }, { total: stagings.length }), indexes: idx };
  }

  function addCrossChecks(stagings, idx, issues) {
    function add(staging, code, level, field, value, message) { issues.push(makeIssue(code, level, staging, 0, field, value, message)); }
    [idx.meeting, idx.race].forEach((map) => map.forEach((entries, id) => {
      if (entries.length > 1) {
        const exact = entries.every((entry) => stable(entry.record) === stable(entries[0].record));
        entries.forEach((entry) => add(entry.staging, exact ? "EXACT_DUPLICATE" : "CONFLICTING_DUPLICATE", exact ? "error" : "fatal", "id", id, exact ? "候補群を跨ぐ完全重複です" : "候補群を跨ぐ内容矛盾です"));
      }
    }));
    const runnerSets = new Map(), resultSets = new Map(), raceTimes = new Map(), resultTimes = new Map(), dataTimes = [];
    stagings.forEach((staging) => staging.normalizedRecords.forEach((record) => {
      if (staging.dataType === "race" && validDate(record.startTime)) raceTimes.set(text(record.raceId), new Date(record.startTime));
      if (staging.dataType === "runner") push(runnerSets, text(record.raceId), Number(record.horseNumber));
      if (staging.dataType === "result") { push(resultSets, text(record.raceId), Number(record.horseNumber)); if (validDate(record.confirmedAt)) resultTimes.set(text(record.raceId), new Date(record.confirmedAt)); }
      const value = record.capturedAt || record.confirmedAt || record.startTime || record.raceDate || record.meetingDate;
      if (validDate(value)) dataTimes.push(new Date(value));
    }));
    idx.race.forEach((entries, raceId) => {
      const record = entries[0].record, expected = Number(record.numberOfRunners || record.runnerCount);
      if (expected && expected !== (runnerSets.get(raceId) || []).length) add(entries[0].staging, "RUNNER_COUNT_CONFLICT", "error", "numberOfRunners", expected, "raceの頭数とrunner件数が一致しません");
      const runners = new Set(runnerSets.get(raceId) || []), results = new Set(resultSets.get(raceId) || []);
      if (results.size && ([...runners].some((number) => !results.has(number)) || [...results].some((number) => !runners.has(number)))) add(entries[0].staging, "RUNNER_RESULT_SET_CONFLICT", "error", "horseNumber", raceId, "runner集合とresult集合が一致しません");
    });
    stagings.forEach((staging) => staging.normalizedRecords.forEach((record) => {
      const start = raceTimes.get(text(record.raceId));
      if (staging.dataType === "result" && start && validDate(record.confirmedAt) && new Date(record.confirmedAt) < start) add(staging, "RESULT_BEFORE_RACE", "fatal", "confirmedAt", record.confirmedAt, "結果確定がrace開始前です");
      if (staging.dataType === "payout" && resultTimes.has(text(record.raceId)) && validDate(record.confirmedAt) && new Date(record.confirmedAt) < resultTimes.get(text(record.raceId))) add(staging, "PAYOUT_BEFORE_RESULT", "error", "confirmedAt", record.confirmedAt, "払戻確定が結果確定前です");
      if (staging.dataType === "oddsSnapshot" && start && validDate(record.capturedAt) && new Date(record.capturedAt) > start) add(staging, "ODDS_AFTER_START", "warning", "capturedAt", record.capturedAt, "race開始後のoddsです。許容判断が必要です");
      if (staging.dataType === "acquisitionRecord" && validDate(record.acquiredAt || record.receivedAt) && dataTimes.length) {
        const acquired = new Date(record.acquiredAt || record.receivedAt), oldest = Math.min(...dataTimes.map((date) => date.getTime()));
        if (acquired.getTime() < oldest - 365 * 86400000) add(staging, "ACQUISITION_EXTREMELY_OLD", "warning", "acquiredAt", acquired.toISOString(), "元データ日時より極端に古い取得日時です");
      }
    }));
  }

  function detectCycles(stagings, idx) {
    const graph = new Map(stagings.map((item) => [item.stagingId, new Set()]));
    stagings.forEach((staging) => staging.normalizedRecords.forEach((record) => {
      let targets = [];
      if (staging.dataType === "race") targets = (idx.meeting.get(text(record.meetingId)) || []).map((item) => item.staging.stagingId);
      if (["runner", "oddsSnapshot", "result", "payout"].includes(staging.dataType)) targets = (idx.race.get(text(record.raceId)) || []).map((item) => item.staging.stagingId);
      if (staging.dataType === "acquisitionRecord" && record.stagingId) targets = (idx.staging.get(text(record.stagingId)) || []).map((item) => item.stagingId);
      targets.forEach((target) => { if (target !== staging.stagingId) graph.get(staging.stagingId).add(target); });
    }));
    const visiting = new Set(), visited = new Set(), cycles = new Set();
    function visit(id, path) { if (visiting.has(id)) { path.slice(path.indexOf(id)).forEach((item) => cycles.add(item)); return; } if (visited.has(id)) return; visiting.add(id); (graph.get(id) || []).forEach((next) => visit(next, [...path, next])); visiting.delete(id); visited.add(id); }
    graph.forEach((_, id) => visit(id, [id])); return [...cycles];
  }

  function transition(status, next, options = {}) {
    if (!STATUSES.includes(status) || !STATUSES.includes(next)) return { transitioned: false, reason: "unknown_status", status };
    if (options.processing) return { transitioned: false, reason: "processing_locked", status };
    if (!(TRANSITIONS[status] || []).includes(next)) return { transitioned: false, reason: TERMINAL.includes(status) ? "terminal_locked" : "invalid_transition", status };
    if (next === "import_candidate_ready" && (!options.humanApproved || options.fatalCount || options.errorCount)) return { transitioned: false, reason: "gate_not_satisfied", status };
    return { transitioned: true, status: next };
  }
  function gateProblems(staging = {}, approval = {}) {
    const validation = staging.validation || { counts: { fatal: 1, error: 1, warning: 0 } }, problems = [];
    if (staging.integrityStatus !== "integrity_checked") problems.push("integrity_checked_required");
    if (validation.counts.fatal) problems.push("fatal_present"); if (validation.counts.error) problems.push("error_present");
    if (validation.counts.warning && !approval.warningConfirmed) problems.push("warning_confirmation_required");
    if (!text(approval.approvedBy)) problems.push("approver_required"); if (!text(approval.reason)) problems.push("approval_reason_required");
    const approvedAt = new Date(approval.approvedAt); if (!text(approval.approvedAt) || Number.isNaN(approvedAt.getTime())) problems.push("approval_datetime_required"); else if (approvedAt.getTime() > Date.now() + 60000) problems.push("approval_datetime_future");
    if (!approval.protectedMode) problems.push("protected_mode_required"); if (!approval.PLAN_ONLY) problems.push("plan_only_required"); if (!approval.privateLocalOnly) problems.push("private_local_required");
    if (!approval.phase22NotAppliedConfirmed) problems.push("phase22_non_application_required"); if (!approval.formalImportNotExecutedConfirmed) problems.push("formal_import_not_executed_required");
    return problems;
  }
  function appendHistory(history, event = {}) {
    const list = Array.isArray(history) ? history : [], historyId = text(event.historyId) || `p234h-${Date.now()}-${list.length + 1}`;
    if (list.some((item) => item.historyId === historyId)) return { appended: false, reason: "duplicate_history", history: list.slice() };
    const entry = { historyId, gateRecordId: text(event.gateRecordId), stagingId: text(event.stagingId), action: text(event.action), previousStatus: text(event.previousStatus), nextStatus: text(event.nextStatus), operator: text(event.operator), reason: text(event.reason), operatedAt: text(event.operatedAt) || new Date().toISOString(), protectedMode: true, PLAN_ONLY: true, privateLocalOnly: true, phase22Applied: false, formalImportExecuted: false };
    return { appended: true, entry, history: [...list, entry] };
  }
  function buildGateRecord(stagingInput, approval = {}, existing = [], now = new Date()) {
    const staging = normalizeStaging(stagingInput), problems = gateProblems(stagingInput, approval);
    if (problems.length) return { created: false, reason: "gate_conditions_failed", problems };
    if (existing.some((record) => record.stagingId === staging.stagingId && record.importCandidateReady)) return { created: false, reason: "duplicate_candidate" };
    const createdAt = (now instanceof Date ? now : new Date(now)).toISOString(), gateRecordId = text(approval.gateRecordId) || `p234-${staging.stagingId}-v${staging.stagingVersion}`;
    if (existing.some((record) => record.gateRecordId === gateRecordId)) return { created: false, reason: "duplicate_gate_record_id" };
    const validation = stagingInput.validation;
    const record = { gateRecordId, stagingId: staging.stagingId, stagingVersion: staging.stagingVersion, sourceValidationId: staging.sourceValidationId, fileHash: staging.fileHash, dataType: staging.dataType, providerId: staging.providerId, integrityStatus: "integrity_checked", gateStatus: "import_candidate_ready", validationSummary: { ...validation.counts }, referenceSummary: validation.referenceSummary, chronologySummary: validation.chronologySummary, countSummary: validation.countSummary, conflictSummary: { status: validation.conflict }, issues: validation.issues.map(stripDangerous), warningConfirmed: Boolean(approval.warningConfirmed), gateApprovedBy: text(approval.approvedBy), gateApprovalReason: text(approval.reason), gateApprovedAt: text(approval.approvedAt), importCandidateReady: true, formalImportExecuted: false, formalImportExecutedAt: null, createdAt, updatedAt: createdAt, protectedMode: true, PLAN_ONLY: true, privateLocalOnly: true, phase22Applied: false, history: [] };
    record.history = appendHistory([], { gateRecordId, stagingId: staging.stagingId, action: "import_candidate_ready", previousStatus: "gate_approval_in_progress", nextStatus: "import_candidate_ready", operator: record.gateApprovedBy, reason: record.gateApprovalReason, operatedAt: createdAt }).history;
    return { created: true, record };
  }
  function buildTerminalRecord(stagingInput, status, input = {}, now = new Date()) {
    if (!["rejected", "cancelled", "expired"].includes(status)) return { created: false, reason: "invalid_terminal_status" };
    if (!text(input.operator) || !text(input.reason)) return { created: false, reason: "operator_and_reason_required" };
    const staging = normalizeStaging(stagingInput), createdAt = (now instanceof Date ? now : new Date(now)).toISOString(), gateRecordId = text(input.gateRecordId) || `p234-${staging.stagingId}-v${staging.stagingVersion}-${status}`;
    const record = { gateRecordId, stagingId: staging.stagingId, stagingVersion: staging.stagingVersion, sourceValidationId: staging.sourceValidationId, fileHash: staging.fileHash, dataType: staging.dataType, providerId: staging.providerId, integrityStatus: stagingInput.integrityStatus || "awaiting_integrity_check", gateStatus: status, validationSummary: stagingInput.validation ? { ...stagingInput.validation.counts } : { info: 0, warning: 0, error: 0, fatal: 0 }, issues: stagingInput.validation ? stagingInput.validation.issues.map(stripDangerous) : [], importCandidateReady: false, formalImportExecuted: false, formalImportExecutedAt: null, createdAt, updatedAt: createdAt, protectedMode: true, PLAN_ONLY: true, privateLocalOnly: true, phase22Applied: false, history: [] };
    record.history = appendHistory([], { gateRecordId, stagingId: staging.stagingId, action: status, previousStatus: text(input.previousStatus), nextStatus: status, operator: input.operator, reason: input.reason, operatedAt: createdAt }).history;
    return { created: true, record };
  }
  function defaultStore() { return { schemaVersion: SCHEMA_VERSION, records: [], savedAt: "" }; }
  function normalizeStore(input = {}) {
    const clean = stripDangerous(input), records = Array.isArray(clean.records) ? clean.records.map((record) => ({ ...record, formalImportExecuted: false, formalImportExecutedAt: null, phase22Applied: false, protectedMode: true, PLAN_ONLY: true, privateLocalOnly: true })) : [];
    return { ...defaultStore(), ...clean, schemaVersion: SCHEMA_VERSION, records: records.filter((record, index) => record.gateRecordId && records.findIndex((item) => item.gateRecordId === record.gateRecordId) === index) };
  }
  function loadStore(storage) { const target = storageOf(storage), raw = target && target.getItem(STORAGE_KEY), parsed = raw ? safeParse(raw) : {}; return { store: normalizeStore(parsed || {}), parseError: Boolean(raw && !parsed) }; }
  function saveStore(input, storage, now = new Date()) {
    const target = storageOf(storage); if (!target) return { saved: false, reason: "storage_unavailable" };
    const before = target.getItem(STORAGE_KEY), store = normalizeStore(input); store.savedAt = (now instanceof Date ? now : new Date(now)).toISOString();
    try { const serialized = JSON.stringify(store); target.setItem(STORAGE_KEY, serialized); const readBack = target.getItem(STORAGE_KEY); if (readBack !== serialized || JSON.parse(readBack).schemaVersion !== SCHEMA_VERSION) throw new Error("readback_failed"); return { saved: true, store }; }
    catch (error) { try { if (before === null) target.removeItem(STORAGE_KEY); else target.setItem(STORAGE_KEY, before); } catch (_) {} return { saved: false, reason: error.message === "readback_failed" ? "readback_failed" : "storage_error" }; }
  }
  function addGateRecord(storeInput, record, storage, now) {
    const store = normalizeStore(storeInput); if (store.records.some((item) => item.gateRecordId === record.gateRecordId)) return { saved: false, reason: "duplicate_gate_record_id", store };
    if (record.importCandidateReady && store.records.some((item) => item.stagingId === record.stagingId && item.importCandidateReady)) return { saved: false, reason: "duplicate_candidate", store };
    return saveStore({ ...store, records: [...store.records, record] }, storage, now);
  }
  function auditText(record = {}) {
    return ["Phase23-4 ステージング整合性・正式インポート候補ゲート", `gateRecordId: ${record.gateRecordId || "-"}`, `stagingId: ${record.stagingId || "-"} / version: ${record.stagingVersion || 0}`, `sourceValidationId: ${record.sourceValidationId || "-"} / fileHash: ${record.fileHash || "-"}`, `dataType: ${record.dataType || "-"} / providerId: ${record.providerId || "-"}`, `integrity=${record.integrityStatus || "-"} / gate=${record.gateStatus || "-"} / conflict=${record.conflictSummary && record.conflictSummary.status || "-"}`, `issues: fatal=${record.validationSummary && record.validationSummary.fatal || 0} error=${record.validationSummary && record.validationSummary.error || 0} warning=${record.validationSummary && record.validationSummary.warning || 0}`, `approval: ${record.gateApprovedBy || "-"} / ${record.gateApprovedAt || "-"} / ${record.gateApprovalReason || "-"}`, "formalImportExecuted=false / phase22Applied=false", "Private Local only / PLAN_ONLY / protectedMode / 外部通信なし"].join("\n");
  }
  return { SCHEMA_VERSION, SOURCE_STORAGE_KEY, STORAGE_KEY, TYPES, LEVELS, STATUSES, TRANSITIONS, TERMINAL, stripDangerous, safeParse, normalizeStaging, loadSourceStore, eligibleSources, indexes, validateGroup, conflictStatus, detectCycles, transition, gateProblems, appendHistory, buildGateRecord, buildTerminalRecord, defaultStore, normalizeStore, loadStore, saveStore, addGateRecord, auditText };
});
