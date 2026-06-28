const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../console-page.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

function createDocument() {
  const elements = new Map();
  const ids = [
    "official-banner-title",
    "console-eyebrow",
    "console-heading",
    "console-version",
    "console-phase",
    "console-policy",
    "console-protection",
    "console-mode",
    "console-title",
    "console-status",
    "console-message",
    "console-execution-policy",
    "console-protected-policy",
    "console-external-send",
    "console-auto-update",
    "console-card-eyebrow",
    "console-card-title",
    "console-card-count",
    "console-policy-tags",
    "console-cards",
    "console-links"
  ];
  for (const id of ids) elements.set(id, { id, textContent: "", innerHTML: "" });
  return { title: "", getElementById: (id) => elements.get(id) || null, elements };
}

function render(search) {
  const documentRef = createDocument();
  const report = engine.renderConsolePage(documentRef, { search });
  return { documentRef, report };
}

assert.equal(engine.PHASE, "Phase20-9");
assert.equal(engine.ACTIVATION_PHASE, "Phase20-8");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.basePolicy.externalSend, "Disabled");
assert.equal(engine.basePolicy.autoUpdate, "Disabled");

const win5 = render("?console=win5");
assert.equal(win5.report.title, "WIN5 AI Console");
for (const label of ["WIN5候補生成", "荒れ度AI", "A固定判定AI", "点数圧縮", "結果検証", "学習ログ"]) {
  assert.ok(win5.documentRef.getElementById("console-cards").innerHTML.includes(label), `WIN5 card ${label} is rendered`);
}

const hakodate = render("?console=hakodate");
assert.equal(hakodate.report.title, "函館版AI Console");
for (const label of ["函館芝1200", "函館芝1800", "函館ダ1000", "函館ダ1700", "洋芝", "滞在競馬", "ローカル前残り/差し補正"]) {
  assert.ok(hakodate.documentRef.getElementById("console-cards").innerHTML.includes(label), `Hakodate card ${label} is rendered`);
}

const sapporo = render("?console=sapporo");
assert.equal(sapporo.report.title, "札幌版AI Console");
for (const label of ["札幌芝1500", "札幌芝1800", "札幌芝2000", "札幌ダ1700", "洋芝", "滞在競馬", "函館→札幌転戦補正"]) {
  assert.ok(sapporo.documentRef.getElementById("console-cards").innerHTML.includes(label), `Sapporo card ${label} is rendered`);
}

for (const result of [win5, hakodate, sapporo]) {
  assert.equal(result.documentRef.getElementById("console-execution-policy").textContent, "PLAN_ONLY");
  assert.equal(result.documentRef.getElementById("console-protected-policy").textContent, "Protected");
  assert.equal(result.documentRef.getElementById("console-external-send").textContent, "Disabled");
  assert.equal(result.documentRef.getElementById("console-auto-update").textContent, "Disabled");
  assert.ok(!result.documentRef.getElementById("console-heading").textContent.includes("東京版"), "Dedicated console title must not retain Tokyo title");
  assert.ok(!result.documentRef.getElementById("console-title").textContent.includes("東京版"), "Dedicated console section title must not retain Tokyo title");
}

const html = readText("course-console.html");
assert.ok(html.includes('<script src="console-page.js"></script>'));
assert.ok(html.includes("PLAN_ONLY"));
assert.ok(!html.includes("Coming Soon"));

const db = readJson("course-console-db.json");
assert.equal(db.phase, "Phase20-9");
assert.equal(db.activationPhase, "Phase20-8");
assert.equal(db.executionPolicy, "PLAN_ONLY");
assert.equal(db.protectionPolicy, "Protected");
assert.equal(db.externalSend, false);
assert.equal(db.autoUpdate, false);
assert.equal(db.githubPagesSettingChange, false);
assert.deepEqual(db.consoles.map((console) => console.key), ["win5", "hakodate", "sapporo"]);

const privateLocal = readText("private-local.html");
const index = readText("index.html");
for (const route of ["course-console.html?console=win5", "course-console.html?console=hakodate", "course-console.html?console=sapporo"]) {
  assert.ok(index.includes(route), `index keeps route ${route}`);
}
assert.ok(privateLocal.includes("WIN5/index.html"), "private-local keeps WIN5 route");
assert.ok(privateLocal.includes("函館競馬場/index.html"), "private-local keeps Hakodate route");
assert.ok(privateLocal.includes("札幌競馬場/index.html"), "private-local keeps Sapporo route");

console.log("phase20-8 course console activation regression tests passed");
