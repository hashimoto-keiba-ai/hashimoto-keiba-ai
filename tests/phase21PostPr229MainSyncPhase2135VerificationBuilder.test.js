const assert = require("assert");
const fs = require("fs");
const path = require("path");
const builder = require("../phase21-36-post-pr229-main-sync-phase2135-verification-builder.js");

const root = path.resolve(__dirname, "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const db = readJson("phase21-36-post-pr229-main-sync-phase2135-verification-db.json");
const summary = readJson("phase21-36-post-pr229-main-sync-phase2135-verification-summary-db.json");

assert.strictEqual(builder.PHASE, "Phase21-36");
assert.strictEqual(db.phase, "Phase21-36");
assert.strictEqual(summary.status, "PHASE21_36_POST_PR229_MAIN_SYNC_PHASE2135_VERIFICATION_READY");
assert.strictEqual(db.priorPrNumber, 229);
assert.strictEqual(db.priorPhase, "Phase21-35");
assert.strictEqual(db.expectedPriorMergeCommit, "c4fdd4318043ae91b9d74a239da1a5ec023a6b73");
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);
assert.strictEqual(db.blockedActionPolicy.mainDirectPushAllowed, false);
assert.strictEqual(db.blockedActionPolicy.mainDirectCommitAllowed, false);
assert.strictEqual(db.blockedActionPolicy.forcePushAllowed, false);
assert.strictEqual(db.blockedActionPolicy.launcherFileChangeAllowed, false);

const panel = builder.buildPostPr229MainSyncPhase2135VerificationPanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.priorPrNumber, 229);
assert.strictEqual(panel.priorPhase, "Phase21-35");
assert.strictEqual(panel.mainSyncRequired, true);
assert.strictEqual(panel.cleanWorkingTreeRequired, true);
assert.strictEqual(panel.phase2135PresenceRequired, true);
assert.strictEqual(panel.draftPrRequired, true);
assert.ok(panel.mainSyncPolicy.includes("PR #229"));
assert.ok(panel.phasePresencePolicy.includes("Phase21-35"));
assert.ok(panel.records.some((record) => record.command === "pwd"));
assert.ok(panel.records.some((record) => record.command === "git switch main"));
assert.ok(panel.records.some((record) => record.command === "git pull origin main"));
assert.ok(panel.records.some((record) => record.command === "git status"));
assert.ok(panel.records.some((record) => record.command === "git log --oneline -3"));

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-36-post-pr229-main-sync-phase2135-verification-list") {
      return {
        textContent: "old",
        appendChild(row) { rendered.push(row.textContent); }
      };
    }
    return null;
  },
  createElement() {
    return { textContent: "" };
  }
};
builder.renderPostPr229MainSyncPhase2135VerificationPanel(panel, fakeDoc);
assert.ok(rendered.length >= 8);
assert.ok(rendered.some((line) => line.includes("PR #229")));
assert.ok(rendered.some((line) => line.includes("Phase21-35")));

console.log("Phase21-36 post PR229 main sync Phase21-35 verification builder test passed");
