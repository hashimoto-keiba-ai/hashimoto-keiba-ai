const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-36-private-local-operation-hardening-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-36-private-local-operation-hardening-db.json");
const summary = readJson("phase21-36-private-local-operation-hardening-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-36-private-local-operation-hardening-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-36");
assert.strictEqual(db.phase, "Phase21-36");
assert.strictEqual(summary.status, "PHASE21_36_PRIVATE_LOCAL_OPERATION_HARDENING_READY");
assert.strictEqual(db.baseline, "Phase21-35 / PR #228 reflected main");
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.publicDeliveryAllowed, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(db.autoExecutionAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticRemotePublishAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticMergeAllowed, false);
assert.strictEqual(db.blockedActionPolicy.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(db.blockedActionPolicy.suspiciousAutoRunScriptAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildPrivateLocalOperationHardeningPanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.baseline, "Phase21-35 / PR #228 reflected main");
assert.strictEqual(panel.planOnly, true);
assert.strictEqual(panel.protected, true);
assert.strictEqual(panel.privateRepository, true);
assert.strictEqual(panel.localFirst, true);
assert.strictEqual(panel.githubPagesRequired, false);
assert.strictEqual(panel.publicDeliveryAllowed, false);
assert.strictEqual(panel.externalApiAllowed, false);
assert.strictEqual(panel.autoExecutionAllowed, false);
assert.strictEqual(panel.blockedActionPolicy.automaticMergeAllowed, false);
assert.strictEqual(panel.blockedActionPolicy.hiddenBackgroundUpdateAllowed, false);
assert.ok(panel.operationPolicy.includes("Private Local"));
assert.ok(panel.securitySoftwarePolicy.includes("Norton"));
assert.ok(panel.records.some((record) => String(record.label).includes("GitHub Pages")));
assert.ok(panel.records.some((record) => String(record.label).includes("iPad")));
assert.ok(panel.records.some((record) => String(record.label).includes("Draft")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPrivateLocalOperationHardeningPanel"));
assert.ok(index.includes('id="phase21-36-private-local-operation-hardening"'));
assert.ok(index.includes('<script src="phase21-36-private-local-operation-hardening-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-36-private-local-operation-hardening"'));
assert.ok(readme.includes("Phase21-36"));
assert.ok(readme.includes("Phase21-35 / PR #228"));
assert.ok(readme.includes("Private Local"));
assert.ok(readme.includes("GitHub Pages not required"));
assert.ok(readme.includes("No automatic remote publish"));
assert.ok(readme.includes("No automatic merge"));
assert.ok(readme.includes("No hidden background update"));
assert.ok(readme.includes("Norton"));

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
  assert.notStrictEqual(source.autoExecutionAllowed, true);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-36-private-local-operation-hardening-list") {
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
builder.renderPrivateLocalOperationHardeningPanel(panel, fakeDoc);
assert.ok(rendered.length >= 10);
assert.ok(rendered.some((line) => line.includes("PR #228")));
assert.ok(rendered.some((line) => line.includes("No automatic merge")));

console.log("Phase21-36 private local operation hardening builder test passed");
