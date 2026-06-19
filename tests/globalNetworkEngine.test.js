const assert = require("node:assert/strict");
const engine = require("../global-network-page.js");

const store = new Map();
const storage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value))
};
storage.setItem("learning-engine.json", JSON.stringify({ records: [{ learning: "東京芝は差しを補正", learnedRule: "上がり上位を加点", hit: true, pattern: "A→B→C" }] }));
storage.setItem("research-lab-db.json", JSON.stringify({ records: [{ research: "東京1600m研究", finding: "外差し有効" }] }));
storage.setItem("prediction-engine.json", JSON.stringify({ records: [{ prediction: "東京11R本命候補", hit: false, failureReason: "ペース誤差", updateText: "展開補正を更新" }] }));

const report = engine.buildNetworkReport({ storage, now: () => new Date("2026-06-18T03:00:00.000Z") });
assert.equal(engine.OS_VERSION, "4.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.PHASE, "Phase17-4");
assert.equal(engine.SHARE_FLOW.length, 7);
assert.equal(report.status, "ONLINE");
assert.equal(report.connectedEngineCount, 3);
assert.equal(report.totalRecordCount, 3);
assert.ok(report.successPatterns.includes("A→B→C"));
assert.ok(report.failurePatterns.includes("ペース誤差"));
assert.ok(report.futures.includes("東京11R本命候補"));
assert.ok(report.evolutions.includes("展開補正を更新"));

engine.saveGlobalNetwork({ storage, report });
Object.values(engine.DATABASE_KEYS).forEach((key) => {
  const saved = JSON.parse(storage.getItem(key));
  assert.equal(saved.osVersion, "4.0");
  assert.equal(saved.officialRelease, "2.8");
  assert.equal(saved.records.length, 1);
});
const history = JSON.parse(storage.getItem(engine.DATABASE_KEYS.history));
assert.equal(history.records[0].totalRecordCount, 3);

console.log("global network engine tests passed");
