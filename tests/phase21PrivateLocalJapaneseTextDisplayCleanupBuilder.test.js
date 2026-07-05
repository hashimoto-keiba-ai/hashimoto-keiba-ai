const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-41-private-local-japanese-text-display-cleanup-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-41-private-local-japanese-text-display-cleanup-db.json");
const summary = readJson("phase21-41-private-local-japanese-text-display-cleanup-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-41-private-local-japanese-text-display-cleanup-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-41");
assert.strictEqual(db.phase, "Phase21-41");
assert.strictEqual(summary.status, "PHASE21_41_PRIVATE_LOCAL_JAPANESE_TEXT_DISPLAY_CLEANUP_READY");
assert.strictEqual(db.baseline, "PR #235 merged main / Phase21-40 reflected");
assert.strictEqual(db.pr235MergedConfirmationRequired, true);
assert.strictEqual(db.phase2140MainReflectionRequired, true);
assert.strictEqual(db.homePcAppReflectionConfirmed, true);
assert.strictEqual(db.japaneseTextDisplayIssueObserved, true);
assert.strictEqual(db.mojibakeCleanupRequired, true);
assert.strictEqual(db.noFunctionalBehaviorChange, true);
assert.strictEqual(db.featureBranchRequired, true);
assert.strictEqual(db.draftPrRequired, true);
assert.strictEqual(db.mergeAfterUserConfirmationOnly, true);
assert.strictEqual(db.branchDeletionOnlyAfterMergeConfirmation, true);
assert.strictEqual(db.mainSyncRequiredAfterMerge, true);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.publicDeliveryAllowed, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(db.autoExecutionAllowed, false);
assert.strictEqual(db.automaticUpdateAllowed, false);
assert.strictEqual(db.blockedActionPolicy.mainDirectCommitAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticRemotePublishAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticMergeAllowed, false);
assert.strictEqual(db.blockedActionPolicy.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(db.blockedActionPolicy.suspiciousAutoRunScriptAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);
assert.strictEqual(summary.pending, 2);

const panel = builder.buildPrivateLocalJapaneseTextDisplayCleanupPanel({ db, summary }, () => new Date("2026-07-05T00:00:00.000Z"));
assert.strictEqual(panel.baseline, "PR #235 merged main / Phase21-40 reflected");
assert.strictEqual(panel.planOnly, true);
assert.strictEqual(panel.protected, true);
assert.strictEqual(panel.privateRepository, true);
assert.strictEqual(panel.localFirst, true);
assert.strictEqual(panel.pr235MergedConfirmationRequired, true);
assert.strictEqual(panel.phase2140MainReflectionRequired, true);
assert.strictEqual(panel.homePcAppReflectionConfirmed, true);
assert.strictEqual(panel.japaneseTextDisplayIssueObserved, true);
assert.strictEqual(panel.mojibakeCleanupRequired, true);
assert.strictEqual(panel.noFunctionalBehaviorChange, true);
assert.strictEqual(panel.githubPagesRequired, false);
assert.strictEqual(panel.publicDeliveryAllowed, false);
assert.strictEqual(panel.externalApiAllowed, false);
assert.strictEqual(panel.autoExecutionAllowed, false);
assert.strictEqual(panel.automaticUpdateAllowed, false);
assert.strictEqual(panel.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(panel.suspiciousAutoRunScriptAllowed, false);
assert.ok(panel.cleanupPolicy.includes("visible"));
assert.ok(panel.textScopePolicy.includes("ids"));
assert.ok(panel.pendingPolicy.includes("pending"));
assert.ok(panel.cleanedTextChanges.length >= 3);
assert.ok(panel.pendingTextCleanup.length >= 2);
assert.ok(panel.records.some((record) => String(record.label).includes("PR #235")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-40")));
assert.ok(panel.records.some((record) => String(record.label).includes("private-local.html")));
assert.ok(panel.records.some((record) => String(record.label).includes("README")));
assert.ok(panel.records.some((record) => String(record.label).includes("Pending") || record.status === "Pending"));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPrivateLocalJapaneseTextDisplayCleanupPanel"));
assert.ok(index.includes('id="phase21-41-private-local-japanese-text-display-cleanup"'));
assert.ok(index.includes('<script src="phase21-41-private-local-japanese-text-display-cleanup-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-41-private-local-japanese-text-display-cleanup"'));
assert.ok(privateLocal.includes("<span class=\"pill\">ワンタップ</span>"));
assert.ok(privateLocal.includes("ワンタップメニュー自動生成"));
assert.ok(privateLocal.includes("<p class=\"eyebrow\">ワンタップメニュー</p>"));
assert.ok(privateLocal.includes('href="index.html#phase21-40-post-pr234-private-local-operation-safety-check"'));
assert.ok(index.includes('href="index.html#phase21-41-private-local-japanese-text-display-cleanup"') === false);
assert.ok(readme.includes("Phase21-41"));
assert.ok(readme.includes("PR #235"));
assert.ok(readme.includes("Phase21-40"));
assert.ok(readme.includes("ワンタップメニュー自動生成"));
assert.ok(readme.includes("Pending text cleanup"));
assert.ok(readme.includes("No functional behavior change"));
assert.ok(readme.includes("GitHub Pages not required"));
assert.ok(readme.includes("No auto publish"));
assert.ok(readme.includes("No hidden update"));
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
  assert.notStrictEqual(source.automaticUpdateAllowed, true);
  assert.notStrictEqual(source.hiddenBackgroundUpdateAllowed, true);
  assert.notStrictEqual(source.suspiciousAutoRunScriptAllowed, true);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-41-private-local-japanese-text-display-cleanup-list") {
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
builder.renderPrivateLocalJapaneseTextDisplayCleanupPanel(panel, fakeDoc);
assert.ok(rendered.length >= 20);
assert.ok(rendered.some((line) => line.includes("PR #235")));
assert.ok(rendered.some((line) => line.includes("No functional behavior change")));
assert.ok(rendered.some((line) => line.includes("pending")));

console.log("Phase21-41 private local Japanese text display cleanup builder test passed");
