const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const index = read("index.html");
const privateLocal = read("private-local.html");
const css = read("dashboard.css");
const integration = read("phase22-22a-main-dashboard-integration.js");

const phase2221Card = 'href="index.html#phase22-retrial-result-comparison-core"';
const phase2222Card = 'href="phase22-22-private-local.html"';
assert.ok(privateLocal.includes(phase2222Card), "Phase22-22 launch card exists");
assert.ok(privateLocal.indexOf(phase2221Card) < privateLocal.indexOf(phase2222Card), "Phase22-22 card follows Phase22-21 card");
assert.ok(privateLocal.includes("限定適用最終判定・運用引継ぎ計画"));
assert.ok(privateLocal.includes("Phase22-21のfinalized評価から限定適用判定と運用引継ぎ計画を手動管理"));
assert.ok(!privateLocal.includes("phase22-22-limited-application-final-decision-operational-handoff-plan-core.js"), "private-local uses link only");

assert.ok(index.includes('id="phase22-limited-application-final-decision-handoff-main-core"'), "main panel exists");
["record", "operator", "at", "reason", "notes", "decision", "owner", "backup", "start", "review", "scope", "monitoring", "stop", "rollback", "communication", "reload", "save", "audit", "output"].forEach((suffix) => assert.ok(index.includes(`id="p2222-main-${suffix}"`), `${suffix} control exists`));
const phase21Script = "phase22-21-retrial-result-comparison-final-evaluation-core.js";
const phase22Script = "phase22-22-limited-application-final-decision-operational-handoff-plan-core.js";
assert.ok(index.indexOf(phase21Script) < index.indexOf(phase22Script), "Phase22-22 core loads after Phase22-21");
assert.ok(index.indexOf(phase22Script) < index.indexOf("phase22-22a-main-dashboard-integration.js"), "integration loads after core");
assert.ok(css.includes(".phase2222-main-panel")); assert.ok(css.includes("@media (max-width: 600px)"));
assert.ok(integration.includes("HashimotoPhase2222LimitedApplicationFinalDecisionOperationalHandoffPlanCore"));
assert.ok(integration.includes("core.setDecision")); assert.ok(integration.includes("core.setHandoff")); assert.ok(integration.includes("core.transition")); assert.ok(integration.includes("core.saveStore")); assert.ok(integration.includes("core.loadSource")); assert.ok(integration.includes("core.buildAuditText"));

for (const htmlFile of ["index.html", "private-local.html", "phase22-22-private-local.html"]) {
  const html = read(htmlFile);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, position) => ids.indexOf(id) !== position);
  assert.deepStrictEqual([...new Set(duplicates)], [], `${htmlFile} has no duplicate IDs`);
  for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    const source = match[1];
    if (!/^(?:https?:)?\/\//.test(source)) assert.ok(fs.existsSync(path.join(root, source)), `${htmlFile} missing script ${source}`);
  }
}

assert.ok(index.includes("no auto apply")); assert.ok(index.includes("no production release"));
console.log("Phase22-22A Private Local / main dashboard integration tests passed");
