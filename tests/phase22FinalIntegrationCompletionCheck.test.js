const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const cores = [
  "phase22-1-race-input-core-foundation.js",
  "phase22-2-prediction-evaluation-core.js",
  "phase22-3-final-prediction-summary-core.js",
  "phase22-4-betting-ticket-generation-core.js",
  "phase22-5-budget-allocation-betting-optimization-core.js",
  "phase22-6-final-purchase-plan-confirmation-core.js",
  "phase22-7-actual-result-input-reconciliation-core.js",
  "phase22-8-learning-candidate-review-summary-core.js",
  "phase22-9-approved-learning-candidate-improvement-rule-management-core.js",
  "phase22-10-improvement-rule-validation-plan-pre-application-evaluation-core.js",
  "phase22-11-validation-result-review-application-eligibility-decision-core.js",
  "phase22-12-eligible-rule-manual-approval-management-core.js",
  "phase22-13-pre-application-impact-scope-conflict-check-core.js",
  "phase22-14-manual-application-plan-rollback-plan-core.js",
  "phase22-15-limited-trial-observation-management-core.js",
  "phase22-16-limited-trial-result-evaluation-continuation-decision-core.js",
  "phase22-17-continuation-trial-conditions-retrial-plan-core.js",
  "phase22-18-manual-retrial-creation-prestart-check-core.js",
  "phase22-19-manual-retrial-entry-start-approval-record-core.js",
  "phase22-20-retrial-start-execution-status-management-core.js",
  "phase22-21-retrial-result-comparison-final-evaluation-core.js",
  "phase22-22-limited-application-final-decision-operational-handoff-plan-core.js",
  "phase22-23-pre-operation-final-readiness-check-core.js",
  "phase22-24-manual-operation-start-approval-record-core.js",
  "phase22-25-manual-operation-start-execution-record-core.js"
];

cores.forEach((file) => assert.ok(fs.existsSync(path.join(root, file)), `${file} exists`));

const storageKeys = cores.map((file) => {
  const match = read(file).match(/const STORAGE_KEY = "([^"]+)"/);
  assert.ok(match, `${file} declares its storage key`);
  return match[1];
});
assert.strictEqual(new Set(storageKeys).size, storageKeys.length, "Phase22 core write keys are unique");

const sourceChain = [
  [20, 19, "SOURCE_STORAGE_KEY"],
  [21, 20, "RETRIAL_EXECUTION_STORAGE_KEY"],
  [22, 21, "SOURCE_STORAGE_KEY"],
  [23, 22, "SOURCE_STORAGE_KEY"],
  [24, 23, "SOURCE_STORAGE_KEY"],
  [25, 24, "SOURCE_STORAGE_KEY"]
];
for (const [phase, sourcePhase, constantName] of sourceChain) {
  const text = read(cores[phase - 1]);
  const match = text.match(new RegExp(`const ${constantName} = "([^"]+)"`));
  assert.ok(match, `Phase22-${phase} declares ${constantName}`);
  assert.strictEqual(match[1], storageKeys[sourcePhase - 1], `Phase22-${phase} reads Phase22-${sourcePhase}`);
}

for (const htmlFile of ["index.html", "private-local.html", "phase22-22-private-local.html"]) {
  const html = read(htmlFile);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.strictEqual(new Set(ids).size, ids.length, `${htmlFile} has no duplicate IDs`);
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
  assert.strictEqual(new Set(scripts).size, scripts.length, `${htmlFile} has no duplicate scripts`);
  scripts.filter((source) => !/^(?:https?:)?\/\//.test(source)).forEach((source) => {
    assert.ok(fs.existsSync(path.join(root, source.split(/[?#]/)[0])), `${htmlFile} script exists: ${source}`);
  });
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(match[1]), `${htmlFile} anchor exists: #${match[1]}`);
  }
  for (const match of html.matchAll(/href="([^"#]+)(?:#([^"]+))?"/g)) {
    const [, targetFile, fragment] = match;
    if (/^(?:https?:|mailto:|javascript:|data:)/.test(targetFile)) continue;
    const targetPath = path.join(root, targetFile.split(/[?#]/)[0]);
    assert.ok(fs.existsSync(targetPath), `${htmlFile} link exists: ${targetFile}`);
    if (fragment && fragment.startsWith("phase22-") && path.extname(targetPath).toLowerCase() === ".html") {
      const targetIds = [...fs.readFileSync(targetPath, "utf8").matchAll(/\bid="([^"]+)"/g)].map((item) => item[1]);
      assert.ok(targetIds.includes(fragment), `${htmlFile} Phase22 linked anchor exists: ${targetFile}#${fragment}`);
    }
  }
}

const index = read("index.html");
const privateLocal = read("private-local.html");
assert.ok(index.indexOf("phase22-24-manual-operation-start-approval-record-core.js") < index.indexOf("phase22-25-manual-operation-start-execution-record-core.js"));
assert.ok(index.indexOf('id="phase22-manual-operation-start-approval-core"') < index.indexOf('id="phase22-manual-operation-start-execution-core"'));
assert.ok(privateLocal.indexOf('href="index.html#phase22-manual-operation-start-approval-core"') < privateLocal.indexOf('href="index.html#phase22-manual-operation-start-execution-core"'));

for (const file of cores.concat(["phase22-22a-main-dashboard-integration.js", "phase22-25-main-dashboard-integration.js"])) {
  const text = read(file);
  assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*(?:\(|\b)/.test(text), `${file} has no external communication API`);
}

const readme = read("README.md");
["Private Local", "PLAN_ONLY", "protectedMode", "Phase22 Completion"].forEach((marker) => {
  assert.ok(readme.includes(marker), `README contains ${marker}`);
});

console.log("Phase22 final integration completion checks passed");
