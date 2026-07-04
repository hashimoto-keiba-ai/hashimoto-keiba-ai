const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-28-workspace-folder-selection-safety-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-28-workspace-folder-selection-safety-db.json");
const summary = readJson("phase21-28-workspace-folder-selection-safety-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-28-workspace-folder-selection-safety-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-28");
assert.strictEqual(db.phase, "Phase21-28");
assert.strictEqual(summary.status, "PHASE21_28_WORKSPACE_FOLDER_SELECTION_SAFETY_READY");
assert.strictEqual(db.blockedScriptPolicy.batAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedScriptPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.exeAllowed, false);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildWorkspaceFolderSelectionSafetyPanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.workingTreeCleanRequired, true);
assert.strictEqual(panel.blockedScriptPolicy.exeAllowed, false);
assert.ok(panel.workspacePolicy.includes("pwd"));
assert.ok(panel.refspecPolicy.includes("src refspec"));
assert.ok(panel.records.some((record) => record.command === "git log --oneline -3"));
assert.ok(panel.records.some((record) => record.command === "git branch"));
assert.ok(panel.records.some((record) => record.command === "git status"));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(index.includes('id="phase21-28-workspace-folder-selection-safety"'));
assert.ok(index.includes('<script src="phase21-28-workspace-folder-selection-safety-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-28-workspace-folder-selection-safety"'));
assert.ok(readme.includes("Phase21-28"));
assert.ok(readme.includes("src refspec"));
assert.ok(readme.includes("git log --oneline -3"));
assert.ok(readme.includes("git branch"));
assert.ok(readme.includes("git status"));
assert.ok(readme.includes("main を直接 push しない"));
assert.ok(readme.includes("main に直接 commit しない"));
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
    if (selector === "#phase21-28-workspace-folder-selection-safety-list") {
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
builder.renderWorkspaceFolderSelectionSafetyPanel(panel, fakeDoc);
assert.ok(rendered.length >= 10);
assert.ok(rendered.some((line) => line.includes("git log --oneline -3")));
assert.ok(rendered.some((line) => line.includes("src refspec")));

console.log("Phase21-28 workspace folder selection safety builder test passed");
