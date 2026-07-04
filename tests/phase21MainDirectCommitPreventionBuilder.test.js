const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-26-main-direct-commit-prevention-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-26-main-direct-commit-prevention-db.json");
const summary = readJson("phase21-26-main-direct-commit-prevention-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-26-main-direct-commit-prevention-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-26");
assert.strictEqual(db.phase, "Phase21-26");
assert.strictEqual(summary.status, "PHASE21_26_MAIN_DIRECT_COMMIT_PREVENTION_READY");
assert.strictEqual(db.blockedScriptPolicy.batAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedScriptPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.exeAllowed, false);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildMainDirectCommitPreventionPanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.workingTreeCleanRequired, true);
assert.strictEqual(panel.blockedScriptPolicy.exeAllowed, false);
assert.ok(panel.branchPolicy.includes("codex/phaseXX-*"));
assert.ok(panel.mainPushPolicy.includes("prohibited"));
assert.ok(panel.records.some((record) => record.command === "git switch -c codex/phaseXX-description"));
assert.ok(panel.records.some((record) => record.command === "git pull origin main"));
assert.ok(panel.records.some((record) => record.status === "MainBlocked"));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(index.includes('id="phase21-26-main-direct-commit-prevention"'));
assert.ok(index.includes('<script src="phase21-26-main-direct-commit-prevention-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-26-main-direct-commit-prevention"'));
assert.ok(readme.includes("Phase21-26"));
assert.ok(readme.includes("main に直接 commit しない"));
assert.ok(readme.includes("main を直接 push しない"));
assert.ok(readme.includes("git switch -c"));
assert.ok(readme.includes("git pull origin main"));
assert.ok(readme.includes("Private repository / local first"));
assert.ok(readme.includes("GitHub Pages 不要"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}

for (const source of [db, summary, panel]) {
  assert.notStrictEqual(source.githubPagesRequired, true);
  assert.notStrictEqual(source.externalApiAllowed, true);
  assert.notStrictEqual(source.publicDeliveryAllowed, true);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-26-main-direct-commit-prevention-list") {
      return {
        textContent: "old",
        appendChild(row) { rendered.push(row.textContent); }
      };
    }
    return { textContent: "" };
  },
  createElement() {
    return { className: "", textContent: "" };
  }
};
builder.renderMainDirectCommitPreventionPanel(panel, fakeDoc);
assert.ok(rendered.length >= 10);
assert.ok(rendered.some((line) => line.includes("git switch main")));
assert.ok(rendered.some((line) => line.includes("Do not push main directly")));

console.log("Phase21-26 main direct commit prevention builder test passed");
