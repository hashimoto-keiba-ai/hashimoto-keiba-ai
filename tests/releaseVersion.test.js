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
      releaseScore: 96,
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

assert.strictEqual(OFFICIAL_RELEASE.version, "1.1");
assert.strictEqual(release.version, "1.1");
assert.strictEqual(release.releaseDate, "2026-06-14");
assert.strictEqual(release.completionScore, 96);
assert.strictEqual(release.healthScore, 94);
assert.strictEqual(release.releaseScore, 96);
assert.strictEqual(release.releaseStatus, "Official Release v1.1");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseVersion), "1.1");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseStatus), "Official Release v1.1");
assert.strictEqual(storage.readJson(STORAGE_KEYS.officialReleaseReports)[0].version, "1.1");
assert.ok(release.releaseNotes.some((note) => note.includes("Version 1.1")));

console.log("releaseVersion tests passed");
