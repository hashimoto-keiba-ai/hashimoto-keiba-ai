const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-35-post-pr228-main-sync-phase2134-verification-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-35-post-pr228-main-sync-phase2134-verification-db.json");
const summary = readJson("phase21-35-post-pr228-main-sync-phase2134-verification-summary-db.json");
const builderSource = readText("phase21-35-post-pr228-main-sync-phase2134-verification-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-35");
assert.strictEqual(db.phase, "Phase21-35");
assert.strictEqual(summary.status, "PHASE21_35_POST_PR228_MAIN_SYNC_PHASE2134_VERIFICATION_READY");
assert.strictEqual(db.priorPrNumber, 228);
assert.strictEqual(summary.priorPrNumber, 228);
assert.strictEqual(db.priorPhase, "Phase21-34");
assert.strictEqual(db.expectedPriorMergeCommit, "8375d57d61c8f5579418be78e24e69abe059ee1b");
assert.strictEqual(db.blockedActionPolicy.mainDirectPushAllowed, false);
assert.strictEqual(db.blockedActionPolicy.mainDirectCommitAllowed, false);
assert.strictEqual(db.blockedActionPolicy.forcePushAllowed, false);
assert.strictEqual(db.blockedActionPolicy.launcherFileChangeAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildPostPr228MainSyncPhase2134VerificationPanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.priorPrNumber, 228);
assert.strictEqual(panel.priorPhase, "Phase21-34");
assert.strictEqual(panel.expectedPriorMergeCommit, "8375d57d61c8f5579418be78e24e69abe059ee1b");
assert.strictEqual(panel.mainSyncRequired, true);
assert.strictEqual(panel.cleanWorkingTreeRequired, true);
assert.strictEqual(panel.phase2134PresenceRequired, true);
assert.strictEqual(panel.draftPrRequired, true);
assert.strictEqual(panel.blockedActionPolicy.mainDirectPushAllowed, false);
assert.strictEqual(panel.blockedActionPolicy.launcherFileChangeAllowed, false);
assert.ok(panel.mainSyncPolicy.includes("PR #228"));
assert.ok(panel.phasePresencePolicy.includes("Phase21-34"));
assert.ok(panel.draftPrPolicy.includes("Draft"));
assert.ok(panel.records.some((record) => record.command === "pwd"));
assert.ok(panel.records.some((record) => record.command === "git switch main"));
assert.ok(panel.records.some((record) => record.command === "git pull origin main"));
assert.ok(panel.records.some((record) => record.command === "git status"));
assert.ok(panel.records.some((record) => record.command === "git log --oneline -3"));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-34")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPostPr228MainSyncPhase2134VerificationPanel"));

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
    if (selector === "#phase21-35-post-pr228-main-sync-phase2134-verification-list") {
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
builder.renderPostPr228MainSyncPhase2134VerificationPanel(panel, fakeDoc);
assert.ok(rendered.length >= 10);
assert.ok(rendered.some((line) => line.includes("PR #228")));
assert.ok(rendered.some((line) => line.includes("git pull origin main")));
assert.ok(rendered.some((line) => line.includes("Phase21-34")));

console.log("Phase21-35 post PR228 main sync Phase21-34 verification builder test passed");
