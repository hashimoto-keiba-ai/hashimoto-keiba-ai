const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-43-private-local-post-pr237-operation-safety-check-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-43-private-local-post-pr237-operation-safety-check-db.json");
const summary = readJson("phase21-43-private-local-post-pr237-operation-safety-check-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-43-private-local-post-pr237-operation-safety-check-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-43");
assert.strictEqual(db.phase, "Phase21-43");
assert.strictEqual(summary.status, "PHASE21_43_PRIVATE_LOCAL_POST_PR237_OPERATION_SAFETY_CHECK_READY");
assert.strictEqual(db.baseline, "PR #237 merged main / Phase21-42 reflected");
assert.strictEqual(db.pr237MergedConfirmationRequired, true);
assert.strictEqual(db.phase2142MainReflectionRequired, true);
assert.strictEqual(db.phase2141JapaneseTextContinuityConfirmed, true);
assert.strictEqual(db.privateLocalOperationConfirmed, true);
assert.strictEqual(db.japaneseTextDisplayContinuityConfirmed, true);
assert.strictEqual(db.safeLocalUseConfirmed, true);
assert.strictEqual(db.planOnly, true);
assert.strictEqual(db.protected, true);
assert.strictEqual(db.draftPrOnly, true);
assert.strictEqual(db.doNotMergeYet, true);
assert.strictEqual(db.privateRepository, true);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.publicDeliveryAllowed, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(db.autoExecutionAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticRemotePublishAllowed, false);
assert.strictEqual(db.blockedActionPolicy.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(db.blockedActionPolicy.suspiciousAutoRunScriptAllowed, false);
assert.strictEqual(db.blockedActionPolicy.unnecessaryPublicRouteAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);
assert.strictEqual(summary.unnecessaryPublicRouteAllowed, false);

const panel = builder.buildPrivateLocalPostPr237OperationSafetyCheckPanel({ db, summary }, () => new Date("2026-07-05T00:00:00.000Z"));
assert.strictEqual(panel.baseline, "PR #237 merged main / Phase21-42 reflected");
assert.strictEqual(panel.privateRepository, true);
assert.strictEqual(panel.localFirst, true);
assert.strictEqual(panel.githubPagesRequired, false);
assert.strictEqual(panel.publicDeliveryAllowed, false);
assert.strictEqual(panel.autoExecutionAllowed, false);
assert.strictEqual(panel.unnecessaryPublicRouteAllowed, false);
assert.strictEqual(panel.draftPrOnly, true);
assert.strictEqual(panel.doNotMergeYet, true);
assert.ok(panel.operationPolicy.includes("Private Local"));
assert.ok(panel.safeLocalUsePolicy.includes("no public Pages"));
assert.ok(panel.japaneseTextContinuityPolicy.includes("Japanese text"));
assert.ok(panel.prPolicy.includes("do not merge yet"));
assert.ok(panel.records.some((record) => String(record.label).includes("PR #237")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-42")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-41")));
assert.ok(panel.records.some((record) => String(record.label).includes("GitHub Pages")));
assert.ok(panel.records.some((record) => String(record.label).includes("public Pages route")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPrivateLocalPostPr237OperationSafetyCheckPanel"));
assert.ok(index.includes('id="phase21-43-private-local-post-pr237-operation-safety-check"'));
assert.ok(index.includes('<script src="phase21-43-private-local-post-pr237-operation-safety-check-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-43-private-local-post-pr237-operation-safety-check"'));
assert.ok(readme.includes("Phase21-43"));
assert.ok(readme.includes("PR #237"));
assert.ok(readme.includes("Phase21-42"));
assert.ok(readme.includes("Phase21-41"));
assert.ok(readme.includes("Private Local operation"));
assert.ok(readme.includes("Japanese text display continuity"));
assert.ok(readme.includes("GitHub Pages is not required"));
assert.ok(readme.includes("do not merge yet"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-43-private-local-post-pr237-operation-safety-check-list") {
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
builder.renderPrivateLocalPostPr237OperationSafetyCheckPanel(panel, fakeDoc);
assert.ok(rendered.length >= 20);
assert.ok(rendered.some((line) => line.includes("PR #237")));
assert.ok(rendered.some((line) => line.includes("No auto publish")));
assert.ok(rendered.some((line) => line.includes("public Pages route")));

console.log("Phase21-43 private local post PR237 operation safety check builder test passed");
