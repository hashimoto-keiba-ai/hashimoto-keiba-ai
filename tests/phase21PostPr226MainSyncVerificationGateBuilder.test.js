const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-33-post-pr226-main-sync-verification-gate-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-33-post-pr226-main-sync-verification-gate-db.json");
const summary = readJson("phase21-33-post-pr226-main-sync-verification-gate-summary-db.json");
const builderSource = readText("phase21-33-post-pr226-main-sync-verification-gate-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-33");
assert.strictEqual(db.phase, "Phase21-33");
assert.strictEqual(summary.status, "PHASE21_33_POST_PR226_MAIN_SYNC_VERIFICATION_GATE_READY");
assert.strictEqual(db.priorPrNumber, 226);
assert.strictEqual(summary.priorPrNumber, 226);
assert.strictEqual(db.priorPhase, "Phase21-32");
assert.strictEqual(db.expectedPriorMergeCommit, "059b2d21b6629eb0a81a1e66ed99d7082e701c54");
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

const panel = builder.buildPostPr226MainSyncVerificationGatePanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.priorPrNumber, 226);
assert.strictEqual(panel.priorPhase, "Phase21-32");
assert.strictEqual(panel.expectedPriorMergeCommit, "059b2d21b6629eb0a81a1e66ed99d7082e701c54");
assert.strictEqual(panel.mainSyncRequired, true);
assert.strictEqual(panel.cleanWorkingTreeRequired, true);
assert.strictEqual(panel.phase2132PresenceRequired, true);
assert.strictEqual(panel.draftPrRequired, true);
assert.strictEqual(panel.blockedActionPolicy.mainDirectPushAllowed, false);
assert.strictEqual(panel.blockedActionPolicy.launcherFileChangeAllowed, false);
assert.ok(panel.mainSyncPolicy.includes("PR #226"));
assert.ok(panel.phasePresencePolicy.includes("Phase21-32"));
assert.ok(panel.draftPrPolicy.includes("Draft"));
assert.ok(panel.records.some((record) => record.command === "pwd"));
assert.ok(panel.records.some((record) => record.command === "git switch main"));
assert.ok(panel.records.some((record) => record.command === "git pull origin main"));
assert.ok(panel.records.some((record) => record.command === "git status"));
assert.ok(panel.records.some((record) => record.command === "git log --oneline -3"));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-32")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPostPr226MainSyncVerificationGatePanel"));

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
    if (selector === "#phase21-33-post-pr226-main-sync-verification-gate-list") {
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
builder.renderPostPr226MainSyncVerificationGatePanel(panel, fakeDoc);
assert.ok(rendered.length >= 10);
assert.ok(rendered.some((line) => line.includes("PR #226")));
assert.ok(rendered.some((line) => line.includes("git pull origin main")));
assert.ok(rendered.some((line) => line.includes("Phase21-32")));

console.log("Phase21-33 post PR226 main sync verification gate builder test passed");
