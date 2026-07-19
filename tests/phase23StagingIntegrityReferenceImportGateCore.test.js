const assert = require("assert"), fs = require("fs"), path = require("path");
const core = require("../phase23-4-staging-integrity-reference-import-gate-core.js");
const root = path.join(__dirname, ".."), read = (file) => fs.readFileSync(path.join(root, file), "utf8");
function memoryStorage(initial = {}, behavior = {}) { const data = { ...initial }; return { data, getItem(key) { if (behavior.badRead && key === core.STORAGE_KEY && Object.prototype.hasOwnProperty.call(data, key)) return "corrupt"; return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; }, setItem(key, value) { if (behavior.failWrite) throw new Error("quota"); data[key] = String(value); }, removeItem(key) { delete data[key]; } }; }
function staging(dataType, normalizedRecords, overrides = {}) { return { stagingId: `s-${dataType}`, version: 1, sourceValidationId: `v-${dataType}`, sourceFileHash: `hash-${dataType}`, dataType, providerId: "manual_csv", stagingStatus: "staged", totalRecords: normalizedRecords.length, normalizedRecords, history: [{ historyId: `h-${dataType}` }], ...overrides }; }
function validGroup() {
  return [
    staging("meeting", [{ meetingId: "m1", raceDate: "2026-07-19", venueCode: "TOK" }]),
    staging("race", [{ raceId: "r1", meetingId: "m1", raceNumber: 1, distance: 1600, surface: "turf", numberOfRunners: 2, startTime: "2026-07-19T12:00:00+09:00" }]),
    staging("runner", [{ runnerId: "rr1", raceId: "r1", horseNumber: 1, horseName: "A" }, { runnerId: "rr2", raceId: "r1", horseNumber: 2, horseName: "B" }]),
    staging("oddsSnapshot", [{ raceId: "r1", betType: "win", combination: "1", odds: 2.3, popularity: 1, capturedAt: "2026-07-19T11:30:00+09:00" }]),
    staging("result", [{ raceId: "r1", horseNumber: 1, finishPosition: 1, confirmedAt: "2026-07-19T12:10:00+09:00" }, { raceId: "r1", horseNumber: 2, finishPosition: 2, confirmedAt: "2026-07-19T12:10:00+09:00" }]),
    staging("payout", [{ raceId: "r1", betType: "win", combination: "1", payoutAmount: 230, confirmedAt: "2026-07-19T12:15:00+09:00" }]),
    staging("acquisitionRecord", [{ acquisitionId: "a1", providerId: "manual_csv", acquiredAt: "2026-07-19T10:00:00+09:00", dataType: "meeting", fileHash: "hash-meeting", sourceValidationId: "v-meeting", stagingId: "s-meeting" }])
  ];
}
const approval = (overrides = {}) => ({ warningConfirmed: true, approvedBy: "Gate Approver", reason: "全検証結果を人間確認", approvedAt: "2026-07-19T13:00:00+09:00", protectedMode: true, PLAN_ONLY: true, privateLocalOnly: true, phase22NotAppliedConfirmed: true, formalImportNotExecutedConfirmed: true, ...overrides });

assert.strictEqual(core.SOURCE_STORAGE_KEY, "hashimotoKeibaAi.phase23.approvedPreviewStagingStorage.v1");
assert.strictEqual(core.STORAGE_KEY, "hashimotoKeibaAi.phase23.stagingIntegrityReferenceImportGate.v1");
const eligible = core.eligibleSources({ records: [...validGroup(), staging("meeting", [{ meetingId: "x", raceDate: "2026-07-19", venueCode: "TOK" }], { stagingId: "cancelled", stagingStatus: "cancelled" }), staging("meeting", [{ meetingId: "y", raceDate: "2026-07-19", venueCode: "TOK" }], { stagingId: "expired", stagingStatus: "expired" }), staging("meeting", [{ meetingId: "z", raceDate: "2026-07-19", venueCode: "TOK" }], { stagingId: "rolled", stagingStatus: "rolled_back" })] });
assert.strictEqual(eligible.length, 7); assert.ok(eligible.every((item) => item.stagingStatus === "staged"));
assert.ok(core.loadSourceStore(memoryStorage({ [core.SOURCE_STORAGE_KEY]: "{bad" })).parseError);
let checked = core.validateGroup(validGroup()); assert.strictEqual(checked.summary.fatal, 0); assert.strictEqual(checked.summary.error, 0); assert.ok(checked.stagings.every((item) => item.integrityStatus === "integrity_checked"));
for (const type of core.TYPES) assert.ok(checked.stagings.some((item) => item.dataType === type));
assert.ok(checked.issues.some((item) => item.code === "MEETING_REFERENCE_OK")); assert.ok(checked.issues.some((item) => item.code === "RACE_REFERENCE_OK")); assert.ok(checked.issues.some((item) => item.code === "RUNNER_REFERENCE_OK")); assert.ok(checked.issues.some((item) => item.code === "VALIDATION_REFERENCE_OK"));

function hasIssue(mutator, code) { const group = validGroup(); mutator(group); return core.validateGroup(group).issues.some((item) => item.code === code); }
assert.ok(hasIssue((g) => { g[1].normalizedRecords[0].meetingId = "missing"; }, "MEETING_REFERENCE_MISSING"));
assert.ok(hasIssue((g) => { g[2].normalizedRecords[0].raceId = "missing"; }, "RACE_REFERENCE_MISSING"));
assert.ok(hasIssue((g) => { g[4].normalizedRecords[0].horseNumber = 9; }, "RUNNER_REFERENCE_MISSING"));
assert.ok(hasIssue((g) => { g[3].normalizedRecords[0].combination = "9"; }, "ODDS_RUNNER_MISSING"));
assert.ok(hasIssue((g) => { g[5].normalizedRecords[0].combination = "9"; }, "PAYOUT_RUNNER_MISSING"));
assert.ok(hasIssue((g) => { g[6].normalizedRecords[0].sourceValidationId = "missing"; }, "VALIDATION_REFERENCE_MISSING"));
assert.ok(hasIssue((g) => { g[4].normalizedRecords[0].confirmedAt = "2026-07-19T11:00:00+09:00"; }, "RESULT_BEFORE_RACE"));
assert.ok(hasIssue((g) => { g[5].normalizedRecords[0].confirmedAt = "2026-07-19T12:05:00+09:00"; }, "PAYOUT_BEFORE_RESULT"));
assert.ok(hasIssue((g) => { g[3].normalizedRecords[0].capturedAt = "2026-07-19T12:01:00+09:00"; }, "ODDS_AFTER_START"));
assert.ok(hasIssue((g) => { g[3].normalizedRecords[0].capturedAt = "2026-07-19T11:30:00"; }, "TIMEZONE_MISSING"));
assert.ok(hasIssue((g) => { g[1].normalizedRecords[0].numberOfRunners = 3; }, "RUNNER_COUNT_CONFLICT"));
assert.ok(hasIssue((g) => { g[4].normalizedRecords.pop(); g[4].totalRecords = 1; }, "RUNNER_RESULT_SET_CONFLICT"));
assert.ok(hasIssue((g) => { g[0].normalizedRecords.push({ ...g[0].normalizedRecords[0] }); g[0].totalRecords = 2; }, "MEETING_DUPLICATE"));
assert.ok(hasIssue((g) => { g.push(staging("meeting", [{ meetingId: "m1", raceDate: "2026-07-20", venueCode: "TOK" }], { stagingId: "s-meeting-2", sourceValidationId: "v-meeting-2", sourceFileHash: "hash-meeting-2" })); }, "CONFLICTING_DUPLICATE"));
assert.ok(core.validateGroup(validGroup(), [{ stagingId: "s-meeting", importCandidateReady: true }]).issues.some((item) => item.code === "EXISTING_CANDIDATE_DUPLICATE"));

const meeting = checked.stagings.find((item) => item.dataType === "meeting");
assert.ok(core.gateProblems({ ...meeting, integrityStatus: "integrity_check_failed" }, approval()).includes("integrity_checked_required"));
assert.ok(core.gateProblems({ ...meeting, validation: { ...meeting.validation, counts: { ...meeting.validation.counts, fatal: 1 } } }, approval()).includes("fatal_present"));
assert.ok(core.gateProblems({ ...meeting, validation: { ...meeting.validation, counts: { ...meeting.validation.counts, error: 1 } } }, approval()).includes("error_present"));
assert.ok(core.gateProblems({ ...meeting, validation: { ...meeting.validation, counts: { ...meeting.validation.counts, warning: 1 } } }, approval({ warningConfirmed: false })).includes("warning_confirmation_required"));
assert.ok(core.gateProblems(meeting, approval({ approvedBy: "" })).includes("approver_required")); assert.ok(core.gateProblems(meeting, approval({ reason: "" })).includes("approval_reason_required")); assert.ok(core.gateProblems(meeting, approval({ approvedAt: "2099-01-01T00:00:00+09:00" })).includes("approval_datetime_future"));
let built = core.buildGateRecord(meeting, approval(), [], new Date("2026-07-19T04:00:00Z")); assert.ok(built.created); assert.strictEqual(built.record.importCandidateReady, true); assert.strictEqual(built.record.formalImportExecuted, false); assert.strictEqual(built.record.phase22Applied, false); assert.ok(built.record.history.length);
assert.strictEqual(core.buildGateRecord(meeting, approval(), [built.record]).reason, "duplicate_candidate");
assert.ok(core.buildTerminalRecord(meeting, "rejected", { operator: "Human", reason: "reject" }).created); assert.ok(core.buildTerminalRecord(meeting, "cancelled", { operator: "Human", reason: "cancel" }).created); assert.ok(core.buildTerminalRecord(meeting, "expired", { operator: "Human", reason: "expire" }).created);
let state = "awaiting_integrity_check"; for (const next of ["integrity_check_in_progress", "integrity_checked", "awaiting_manual_gate_approval", "gate_approval_in_progress", "import_candidate_ready"]) { const moved = core.transition(state, next, { humanApproved: true, fatalCount: 0, errorCount: 0 }); assert.ok(moved.transitioned, `${state}->${next}`); state = moved.status; }
assert.strictEqual(core.transition("integrity_check_in_progress", "integrity_check_failed").transitioned, true); assert.strictEqual(core.transition("integrity_check_failed", "integrity_check_in_progress").transitioned, true); assert.strictEqual(core.transition("cancelled", "integrity_check_in_progress").reason, "terminal_locked"); assert.strictEqual(core.transition("gate_approval_in_progress", "import_candidate_ready", { humanApproved: false }).reason, "gate_not_satisfied");
let history = core.appendHistory([], { historyId: "h1", stagingId: "s1", action: "checked" }); assert.ok(history.appended); assert.strictEqual(core.appendHistory(history.history, { historyId: "h1" }).reason, "duplicate_history");
const dangerous = core.stripDangerous({ apiKey: "x", password: "x", cookie: "x", accessToken: "x", rawPayload: "x", nested: { constructor: "x", safe: 1 } }); assert.strictEqual(dangerous.nested.safe, 1); for (const key of ["apiKey", "password", "cookie", "accessToken", "rawPayload"]) assert.ok(!Object.prototype.hasOwnProperty.call(dangerous, key)); assert.ok(!Object.prototype.hasOwnProperty.call(dangerous.nested, "constructor"));

const sourceStorageValue = JSON.stringify({ records: validGroup() }), previousKeys = { phase22: "keep22", phase231: "keep231", phase232: "keep232", phase233: sourceStorageValue };
let storage = memoryStorage({ phase22: previousKeys.phase22, phase231: previousKeys.phase231, phase232: previousKeys.phase232, [core.SOURCE_STORAGE_KEY]: previousKeys.phase233 }); let saved = core.addGateRecord(core.defaultStore(), built.record, storage, new Date("2026-07-19T05:00:00Z")); assert.ok(saved.saved); assert.strictEqual(core.loadStore(storage).store.records.length, 1); assert.strictEqual(storage.data.phase22, previousKeys.phase22); assert.strictEqual(storage.data.phase231, previousKeys.phase231); assert.strictEqual(storage.data.phase232, previousKeys.phase232); assert.strictEqual(storage.data[core.SOURCE_STORAGE_KEY], previousKeys.phase233); assert.strictEqual(core.addGateRecord(saved.store, built.record, storage).reason, "duplicate_gate_record_id");
const old = JSON.stringify({ schemaVersion: 1, records: [{ gateRecordId: "old", stagingId: "old" }] }), failing = memoryStorage({ [core.STORAGE_KEY]: old }, { failWrite: true }); assert.ok(!core.saveStore({ records: [built.record] }, failing).saved); assert.strictEqual(failing.data[core.STORAGE_KEY], old);
const hardened = core.normalizeStore({ records: [{ ...built.record, formalImportExecuted: true, formalImportExecutedAt: "x", phase22Applied: true }] }); assert.strictEqual(hardened.records[0].formalImportExecuted, false); assert.strictEqual(hardened.records[0].formalImportExecutedAt, null); assert.strictEqual(hardened.records[0].phase22Applied, false); assert.ok(core.auditText(built.record).includes("formalImportExecuted=false"));

const code = read("phase23-4-staging-integrity-reference-import-gate-core.js") + read("phase23-4-main-dashboard-integration.js"); for (const pattern of [/\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\s*\(/, /\bEventSource\s*\(/, /setInterval\s*\(/]) assert.ok(!pattern.test(code)); assert.ok(!/IPAT/i.test(code)); assert.ok(!/formalImportExecuted\s*:\s*true/.test(code)); assert.ok(!/localStorage\.setItem\s*\([^,]*(?:phase22|approvedPreviewStagingStorage|manualCsvJsonImportPreviewValidation)/i.test(code));
const index = read("index.html"), local = read("private-local.html"), docs = read("docs/phase23-4-staging-integrity-reference-import-gate-core.md"), readme = read("README.md"); assert.ok(index.includes('id="phase23-staging-integrity-reference-import-gate"')); assert.ok(local.includes('href="index.html#phase23-staging-integrity-reference-import-gate"')); assert.ok(index.indexOf('id="phase23-approved-preview-staging-storage"') < index.indexOf('id="phase23-staging-integrity-reference-import-gate"')); assert.ok(local.indexOf("Phase23-3 承認済み") < local.indexOf("Phase23-4 ステージング")); assert.ok(index.indexOf("phase23-3-main-dashboard-integration.js") < index.indexOf("phase23-4-staging-integrity-reference-import-gate-core.js")); assert.ok(index.indexOf("phase23-4-staging-integrity-reference-import-gate-core.js") < index.indexOf("phase23-4-main-dashboard-integration.js"));
for (const file of ["index.html", "private-local.html", "phase22-22-private-local.html"]) { const html = read(file), ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]); assert.strictEqual(ids.length, new Set(ids).size, `${file} duplicate IDs`); for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) if (!/^(?:https?:)?\/\//.test(match[1])) assert.ok(fs.existsSync(path.join(root, match[1])), match[1]); }
for (const marker of ["Phase23-4", "staged", "terminal", "formalImportExecuted=false", "Phase23-5", "PLAN_ONLY"]) assert.ok(docs.includes(marker), marker); assert.ok(readme.includes("Phase23-4"));
console.log("Phase23-4 staging integrity reference import gate core tests passed");
