const assert = require("assert");
const fs = require("fs");
const path = require("path");
const core = require("../phase23-1-external-racing-data-acquisition-safety-design-core.js");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const memoryStorage = (initial = {}) => { const data = { ...initial }; return { getItem: (key) => Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null, setItem: (key, value) => { data[key] = String(value); }, data }; };

assert.ok(core.PROVIDERS.length >= 6);
assert.strictEqual(new Set(core.PROVIDERS.map((p) => p.providerId)).size, core.PROVIDERS.length);
core.PROVIDERS.forEach((p) => assert.ok(core.EVALUATIONS.includes(core.normalizeProvider(p).evaluation)));
const van = core.normalizeProvider(core.PROVIDERS.find((p) => p.providerId === "jra_van_data_lab"));
assert.strictEqual(van.officiality, "confirmed"); assert.strictEqual(van.costStatus, "confirmed"); assert.ok(van.costNote.includes("2,090")); assert.strictEqual(van.termsStatus, "needs_manual_verification");
assert.strictEqual(core.canApprovePrototype(van).allowed, false); assert.strictEqual(core.normalizeResearchStatus(van, "approved_for_prototype"), "needs_manual_verification");
const prohibited = core.PROVIDERS.find((p) => p.providerId === "third_party_scraping"); assert.strictEqual(core.canApprovePrototype(prohibited).allowed, false); assert.strictEqual(core.normalizeResearchStatus(prohibited, "approved_for_prototype"), "prohibited");
assert.ok(core.targetDataItems().includes("entries")); assert.ok(core.targetDataItems().includes("payout"));
for (const name of ["meeting", "race", "runner", "oddsSnapshot", "result", "payout", "acquisitionRecord"]) { const model = core.createStandardModel(name); assert.ok(model); assert.deepStrictEqual(Object.keys(model), core.MODEL_FIELDS[name]); }
const unsafe = { apiKey: "x", password: "x", Cookie: "x", nested: { accessToken: "x", safe: "yes" }, status: "draft" }; const stripped = core.stripSensitive(unsafe); assert.ok(!("apiKey" in stripped)); assert.ok(!("password" in stripped)); assert.ok(!("Cookie" in stripped)); assert.ok(!("accessToken" in stripped.nested)); assert.strictEqual(stripped.nested.safe, "yes");
let store = core.normalizeStore({ ...unsafe, providers: core.PROVIDERS }); assert.ok(!("apiKey" in store)); let history = core.appendAudit([], { historyId: "h1", operator: "Human", reason: "review" }); history = core.appendAudit(history, { historyId: "h2", operator: "Human", reason: "confirm" }); assert.deepStrictEqual(history.map((h) => h.historyId), ["h1", "h2"]); store.history = history;
const storage = memoryStorage(); assert.ok(core.saveStore(store, storage, "2026-07-19T12:00:00+09:00").saved); assert.ok(storage.data[core.STORAGE_KEY]); assert.strictEqual(core.loadStore(storage).store.history.length, 2); assert.ok(core.loadStore(memoryStorage({ [core.STORAGE_KEY]: "{bad" })).parseError);
assert.strictEqual(core.STORAGE_KEY, "hashimotoKeibaAi.phase23.externalRacingDataAcquisitionSafetyDesign.v1"); assert.ok(core.auditText(store).includes("Needs manual verification")); assert.ok(core.auditText(store).includes("no external connection"));
const source = read("phase23-1-external-racing-data-acquisition-safety-design-core.js") + read("phase23-1-main-dashboard-integration.js");
for (const pattern of [/\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\s*\(/, /\bEventSource\s*\(/, /setInterval\s*\(/, /https?:\/\//]) assert.ok(!pattern.test(source), `forbidden code: ${pattern}`);
assert.ok(!/IPAT/i.test(source)); assert.ok(!/localStorage\.setItem\s*\([^,]*(phase22|raceInput|predictionEvaluation)/i.test(source));
const index = read("index.html"), local = read("private-local.html"), readme = read("README.md"), docs = read("docs/phase23-1-external-racing-data-acquisition-safety-design.md");
assert.ok(index.includes('id="phase23-external-racing-data-acquisition-safety-design"')); assert.ok(local.includes('href="index.html#phase23-external-racing-data-acquisition-safety-design"')); assert.ok(index.indexOf('id="phase22-manual-operation-start-execution-core"') < index.indexOf('id="phase23-external-racing-data-acquisition-safety-design"')); assert.ok(local.indexOf("Phase22 本体機能") < local.indexOf("Phase23 外部競馬データ取込"));
assert.ok(index.indexOf("phase22-25-main-dashboard-integration.js") < index.indexOf("phase23-1-external-racing-data-acquisition-safety-design-core.js")); assert.ok(index.indexOf("phase23-1-external-racing-data-acquisition-safety-design-core.js") < index.indexOf("phase23-1-main-dashboard-integration.js"));
for (const htmlFile of ["index.html", "private-local.html", "phase22-22-private-local.html"]) { const html = read(htmlFile); const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]); assert.strictEqual(new Set(ids).size, ids.length); for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) if (!/^(?:https?:)?\/\//.test(match[1])) assert.ok(fs.existsSync(path.join(root, match[1]))); }
assert.ok(!/<script[^>]+src="https?:/i.test(index)); assert.ok(readme.includes("Phase23-1")); for (const marker of ["JRA-VAN Data Lab.", "手動CSV", "標準データモデル", "認証", "Phase23-2", "PLAN_ONLY"]) assert.ok(docs.includes(marker));
const safe = core.safety(); ["privateLocal", "planOnly", "protectedMode", "noExternalConnection", "noAutomaticAcquisition", "noAutomaticPurchase", "noAutomaticBetting", "noCredentialStorage", "noPhase22Mutation"].forEach((key) => assert.strictEqual(safe[key], true));
console.log("Phase23-1 external racing data acquisition safety design tests passed");
