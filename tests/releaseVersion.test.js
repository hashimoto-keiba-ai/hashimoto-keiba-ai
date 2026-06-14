const assert = require("assert");
const { HashimotoOfficialReleaseEngine, OFFICIAL_RELEASE, STORAGE_KEYS, aiEvolutionHistory, aiPerformanceCards } = require("../dashboard.js");

function createStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return { getItem: (key) => store.has(key) ? store.get(key) : null, setItem: (key, value) => store.set(key, value), readRaw: (key) => store.get(key), readJson: (key) => JSON.parse(store.get(key)) };
}

const storage = createStorage({
  [STORAGE_KEYS.releaseAuditReports]: [{ version: "v7.4", completion: 96, releaseScore: 100, judgment: "正式版" }],
  [STORAGE_KEYS.finalHealthCheckReports]: [{ healthScore: 94, criticalErrors: 0, localStorageIntegrity: true }]
});

const engine = new HashimotoOfficialReleaseEngine({ storage, now: () => new Date("2026-06-15T09:00:00.000Z") });
const release = engine.generateRelease();

assert.strictEqual(OFFICIAL_RELEASE.version, "1.5");
assert.strictEqual(OFFICIAL_RELEASE.releaseScore, 100);
assert.strictEqual(OFFICIAL_RELEASE.status, "Official Release v1.5");
assert.strictEqual(release.version, "1.5");
assert.strictEqual(release.releaseDate, "2026-06-15");
assert.strictEqual(release.releaseScore, 100);
assert.strictEqual(release.releaseStatus, "Official Release v1.5");
assert.strictEqual(release.theme, "自己進化データベース");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseVersion), "1.5");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseStatus), "Official Release v1.5");
assert.strictEqual(storage.readJson(STORAGE_KEYS.officialReleaseReports)[0].version, "1.5");
assert.ok(release.releaseNotes.some((note) => note.includes("history-db.json")));
assert.ok(aiEvolutionHistory.includes("v1.5 自己進化DB"));
assert.deepStrictEqual(aiPerformanceCards.map((card) => card.label), ["的中率", "回収率", "年間収支", "三連単回収率", "WIN5成績", "学習件数"]);

console.log("releaseVersion tests passed");
