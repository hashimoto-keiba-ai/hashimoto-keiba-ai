const assert = require("assert");
const {
  HashimotoOfficialReleaseEngine,
  OFFICIAL_RELEASE,
  STORAGE_KEYS
} = require("../dashboard.js");

function createStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    readRaw(key) {
      return store.get(key);
    },
    readJson(key) {
      return JSON.parse(store.get(key));
    }
  };
}

const storage = createStorage({
  [STORAGE_KEYS.releaseAuditReports]: [
    {
      version: "v7.4",
      completion: 96,
      releaseScore: 111,
      judgment: "正式版"
    }
  ],
  [STORAGE_KEYS.finalHealthCheckReports]: [
    {
      healthScore: 94,
      criticalErrors: 0,
      localStorageIntegrity: true
    }
  ]
});

const engine = new HashimotoOfficialReleaseEngine({
  storage,
  now: () => new Date("2026-06-05T09:00:00.000Z")
});
const release = engine.generateRelease();

assert.strictEqual(OFFICIAL_RELEASE.version, "2.6");
assert.strictEqual(release.version, "2.6");
assert.strictEqual(release.releaseDate, "2026-06-14");
assert.strictEqual(release.completionScore, 96);
assert.strictEqual(release.healthScore, 94);
assert.strictEqual(release.releaseScore, 111);
assert.strictEqual(release.releaseStatus, "Official Release v2.6");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseVersion), "2.6");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseStatus), "Official Release v2.6");
assert.strictEqual(storage.readJson(STORAGE_KEYS.officialReleaseReports)[0].version, "2.6");
assert.ok(release.releaseNotes.some((note) => note.includes("Version 2.6")));

const { HashimotoOfficialReleaseEngine, OFFICIAL_RELEASE, STORAGE_KEYS, aiEvolutionHistory, aiPerformanceCards, rankingPanels } = require("../dashboard.js");
function createStorage(seed = {}) { const store = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)])); return { getItem: (key) => store.has(key) ? store.get(key) : null, setItem: (key, value) => store.set(key, value), readRaw: (key) => store.get(key), readJson: (key) => JSON.parse(store.get(key)) }; }
const storage = createStorage({ [STORAGE_KEYS.releaseAuditReports]: [{ version: "v7.4", completion: 96, releaseScore: 101, judgment: "正式版" }], [STORAGE_KEYS.finalHealthCheckReports]: [{ healthScore: 94, criticalErrors: 0, localStorageIntegrity: true }] });
const release = new HashimotoOfficialReleaseEngine({ storage, now: () => new Date("2026-06-15T09:00:00.000Z") }).generateRelease();
assert.strictEqual(OFFICIAL_RELEASE.version, "1.6");
assert.strictEqual(OFFICIAL_RELEASE.releaseScore, 101);
assert.strictEqual(OFFICIAL_RELEASE.status, "Official Release v1.6");
assert.strictEqual(OFFICIAL_RELEASE.theme, "全競馬場統合AI");
assert.strictEqual(release.version, "1.6");
assert.strictEqual(release.releaseScore, 101);
assert.strictEqual(release.releaseStatus, "Official Release v1.6");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseVersion), "1.6");
assert.ok(release.releaseNotes.some((note) => note.includes("course-db.json")));
assert.ok(release.releaseNotes.some((note) => note.includes("distance-db.json")));
assert.ok(aiEvolutionHistory.includes("v1.6 全競馬場統合AI"));
assert.deepStrictEqual(aiPerformanceCards.map((card) => card.label), ["総的中率", "総回収率", "年間収支", "三連単回収率", "WIN5成績", "総学習件数"]);
assert.deepStrictEqual(rankingPanels.map((panel) => panel.title), ["好調騎手ランキング", "好調調教師ランキング", "人気ゾーンランキング", "コース適性ランキング"]);
console.log("releaseVersion tests passed");
