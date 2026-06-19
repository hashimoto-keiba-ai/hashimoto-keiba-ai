const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../self-diagnosis-page.js");

const root = path.resolve(__dirname, "..");
const files = Object.fromEntries(engine.MONITORED_FILES.map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")]));
const report = engine.diagnose({ files, links: [{ source: "private-local.html", href: "index.html#self-diagnosis-engine" }], generatedAt: "2026-06-19T00:00:00.000Z" });

assert.equal(engine.PHASE, "Phase18-4");
assert.equal(engine.ENGINE_VERSION, "5.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.OS_VERSION, "4.0 Final");
assert.ok(engine.MONITORED_FILES.includes("self-repair-page.js"));
assert.ok(engine.MONITORED_FILES.includes("tests/selfRepairEngine.test.js"));
for (const score of Object.values(report.scores)) assert.equal(score, 100);
assert.equal(report.anomalies.length, 0);
assert.equal(report.status, "HEALTHY");
assert.equal(Object.values(report.repairProposals).every((proposal) => proposal.priority === "NONE"), true);

const brokenFiles = { ...files };
delete brokenFiles["self-diagnosis-health-db.json"];
brokenFiles["README.md"] = "Phase18-4";
brokenFiles["broken.js"] = "const = ;";
brokenFiles["broken.json"] = "{";
brokenFiles["conflicted.txt"] = "<<<<<<< HEAD\nold\n=======\nnew\n>>>>>>> branch";
brokenFiles["orphan.html"] = "<!doctype html><title>orphan</title>";
const broken = engine.diagnose({ files: brokenFiles, links: [{ source: "private-local.html", href: "missing-page.html" }] });
for (const type of ["missing-database", "readme-missing", "javascript-syntax", "json-invalid", "conflict-marker", "broken-link", "unconnected-page"]) assert.ok(broken.anomalies.some((item) => item.type === type), `${type}を検出する`);
assert.equal(broken.repairProposals.nextDatabase.target, "self-diagnosis-health-db.json");
assert.equal(broken.repairProposals.nextPage.target, "missing-page.html");
assert.ok(broken.scores.systemHealthScore < 100);

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistReport(report, storage);
assert.equal(JSON.parse(storage.getItem("selfDiagnosisLatest")).status, "HEALTHY");
assert.equal(JSON.parse(storage.getItem("selfDiagnosisHistory")).length, 1);
for (const db of engine.DATABASE_FILES) {
  const parsed = JSON.parse(fs.readFileSync(path.join(root, db), "utf8"));
  const expectedPhase = db.startsWith("governance-") ? "Phase18-9" : db.startsWith("repair-governance-") ? "Phase18-8" : db.startsWith("repair-audit-") || db.startsWith("repair-rollback-") ? "Phase18-7" : db.startsWith("repair-approval-") ? "Phase18-6" : db.startsWith("self-repair-") ? "Phase18-5" : "Phase18-4";
  assert.equal(parsed.phase, expectedPhase);
}

console.log("self diagnosis engine tests passed");
