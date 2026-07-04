const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-32-post-pr225-sync-gate-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-32-post-pr225-sync-gate-db.json");
const summary = readJson("phase21-32-post-pr225-sync-gate-summary-db.json");
const builderSource = readText("phase21-32-post-pr225-sync-gate-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-32");
assert.strictEqual(db.phase, "Phase21-32");
assert.strictEqual(summary.status, "PHASE21_32_POST_PR225_SYNC_GATE_READY");
assert.strictEqual(db.priorPrNumber, 225);
assert.strictEqual(summary.priorPrNumber, 225);
assert.strictEqual(db.priorPhase, "Phase21-31");
assert.strictEqual(db.expectedPriorMergeCommit, "4322b4fc024f2338e9091b18fcdd117b29c2c1b9");
assert.strictEqual(db.blockedActionPolicy.mainDirectPushAllowed, false);
assert.strictEqual(db.blockedActionPolicy.mainDirectCommitAllowed, false);
assert.strictEqual(db.blockedActionPolicy.forcePushAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildPostPr225SyncGatePanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.priorPrNumber, 225);
assert.strictEqual(panel.priorPhase, "Phase21-31");
assert.strictEqual(panel.expectedPriorMergeCommit, "4322b4fc024f2338e9091b18fcdd117b29c2c1b9");
assert.strictEqual(panel.mainSyncRequired, true);
assert.strictEqual(panel.cleanWorkingTreeRequired, true);
assert.strictEqual(panel.phase2131PresenceRequired, true);
assert.strictEqual(panel.draftPrRequired, true);
assert.strictEqual(panel.blockedActionPolicy.mainDirectPushAllowed, false);
assert.strictEqual(panel.blockedActionPolicy.forcePushAllowed, false);
assert.ok(panel.syncGatePolicy.includes("PR #225"));
assert.ok(panel.phasePresencePolicy.includes("Phase21-31"));
assert.ok(panel.draftPrPolicy.includes("Draft"));
assert.ok(panel.records.some((record) => record.command === "pwd"));
assert.ok(panel.records.some((record) => record.command === "git switch main"));
assert.ok(panel.records.some((record) => record.command === "git pull origin main"));
assert.ok(panel.records.some((record) => record.command === "git status"));
assert.ok(panel.records.some((record) => record.command === "git log --oneline -3"));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-31")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPostPr225SyncGatePanel"));

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
    if (selector === "#phase21-32-post-pr225-sync-gate-list") {
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
builder.renderPostPr225SyncGatePanel(panel, fakeDoc);
assert.ok(rendered.length >= 10);
assert.ok(rendered.some((line) => line.includes("PR #225")));
assert.ok(rendered.some((line) => line.includes("git pull origin main")));
assert.ok(rendered.some((line) => line.includes("Phase21-31")));

console.log("Phase21-32 post PR225 sync gate builder test passed");
