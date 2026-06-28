const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../console-page.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));
const existsInRepo = (href) => fs.existsSync(path.join(root, href.replace(/\//g, path.sep)));

function createDocument() {
  const elements = new Map();
  const ids = ["official-banner-title", "console-eyebrow", "console-heading", "console-version", "console-phase", "console-policy", "console-protection", "console-mode", "console-title", "console-status", "console-message", "console-execution-policy", "console-protected-policy", "console-external-send", "console-auto-update", "console-card-eyebrow", "console-card-title", "console-card-count", "console-policy-tags", "console-cards", "console-links"];
  for (const id of ids) elements.set(id, { id, textContent: "", innerHTML: "" });
  return { title: "", getElementById: (id) => elements.get(id) || null };
}

assert.equal(engine.PHASE, "Phase20-9");
assert.equal(engine.ACTIVATION_PHASE, "Phase20-8");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.SAFE_FALLBACK_HREF, "index.html");
assert.equal(engine.basePolicy.externalSend, "Disabled");
assert.equal(engine.basePolicy.autoUpdate, "Disabled");
assert.equal(engine.basePolicy.githubPagesPolicy, "No GitHub Pages setting changes");
assert.equal(engine.basePolicy.repositoryPolicy, "Private repository premise");

const integrityDb = readJson("course-console-link-integrity-db.json");
assert.equal(integrityDb.phase, "Phase20-9");
assert.equal(integrityDb.activationPhase, "Phase20-8");
assert.equal(integrityDb.executionPolicy, "PLAN_ONLY");
assert.equal(integrityDb.protectionPolicy, "Protected");
assert.equal(integrityDb.externalSend, false);
assert.equal(integrityDb.autoUpdate, false);
assert.equal(integrityDb.githubPagesSettingChange, false);
assert.equal(integrityDb.safeFallbackHref, "index.html");

const consoleLinks = engine.collectConsoleLinks(["win5", "hakodate", "sapporo"]);
assert.equal(consoleLinks.length, 12);
assert.deepEqual(consoleLinks.map((link) => `${link.consoleKey}:${link.href}`), integrityDb.links.map((link) => `${link.consoleKey}:${link.href}`));

for (const link of consoleLinks) {
  assert.equal(link.required, true, `${link.href} is required`);
  assert.equal(link.fallbackHref, "index.html", `${link.href} has local fallback`);
  assert.ok(!/^https?:\/\//.test(link.href), `${link.href} must stay local`);
  assert.ok(existsInRepo(link.href), `${link.href} exists in repository`);
}

for (const consoleKey of ["win5", "hakodate", "sapporo"]) {
  const documentRef = createDocument();
  const report = engine.renderConsolePage(documentRef, { search: `?console=${consoleKey}` });
  assert.equal(report.phase, "Phase20-9");
  assert.equal(documentRef.getElementById("console-mode").textContent, "Phase20-9 Link Integrity / PLAN_ONLY");
  assert.equal(documentRef.getElementById("console-execution-policy").textContent, "PLAN_ONLY");
  assert.equal(documentRef.getElementById("console-protected-policy").textContent, "Protected");
  assert.equal(documentRef.getElementById("console-external-send").textContent, "Disabled");
  assert.equal(documentRef.getElementById("console-auto-update").textContent, "Disabled");
  assert.ok(documentRef.getElementById("console-policy-tags").innerHTML.includes("No GitHub Pages setting changes"));
  assert.ok(report.links.every((link) => link.integrityStatus === "verified"));
}

const missingHref = "WIN5/結果検証/README.md";
const fallbackLinks = engine.applyLinkIntegrityFallback(engine.getConsoleDefinition("win5").links, { [missingHref]: { status: "missing", reason: "phase20_9_missing_link_fixture" } });
const fallback = fallbackLinks.find((link) => link.originalHref === missingHref);
assert.equal(fallback.href, "index.html");
assert.equal(fallback.integrityStatus, "fallback");
assert.equal(fallback.missingReason, "phase20_9_missing_link_fixture");
assert.ok(fallback.detail.includes("PLAN_ONLY fallback"));

const fallbackDocument = createDocument();
const fallbackReport = engine.renderConsolePage(fallbackDocument, { search: "?console=win5" }, { linkStatusMap: { [missingHref]: { status: "missing" } } });
assert.equal(fallbackReport.links.find((link) => link.originalHref === missingHref).href, "index.html");
assert.ok(fallbackDocument.getElementById("console-links").innerHTML.includes('data-integrity-status="fallback"'));
assert.ok(fallbackDocument.getElementById("console-links").innerHTML.includes('href="index.html"'));

const html = readText("course-console.html");
assert.ok(html.includes("PLAN_ONLY"));
assert.ok(html.includes("Protected"));
assert.ok(!html.includes("fetch("));
assert.ok(!html.includes("XMLHttpRequest"));

console.log("phase20-9 course console link integrity tests passed");
