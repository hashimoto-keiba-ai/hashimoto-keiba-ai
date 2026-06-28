const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-10-final-display-confirmation-checklist-builder.js");
const linkIntegrityEngine = require("../console-page.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const db = readJson("phase20-10-final-display-confirmation-checklist-db.json");
const summaryDb = readJson("phase20-10-final-display-confirmation-checklist-summary-db.json");
const phase209Db = readJson("course-console-link-integrity-db.json");

assert.equal(engine.PHASE, "Phase20-10");
assert.equal(engine.ACTIVATION_PHASE, "Phase20-8");
assert.equal(engine.LINK_INTEGRITY_PHASE, "Phase20-9");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.CHECKLIST_STATUS, "final_display_confirmation_checklist_plan_only");
assert.equal(engine.SAFE_FALLBACK_HREF, "index.html");
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_update", "auto_repair", "auto_overwrite", "github_pages_setting_change", "repository_visibility_change"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "validate", "audit", "report", "manual_display_confirmation"]);
assert.deepEqual(engine.REQUIRED_POLICY_LABELS, ["PLAN_ONLY", "Protected", "External Send Disabled", "Auto Update Disabled", "No GitHub Pages setting changes", "Private repository premise"]);
assert.deepEqual(engine.CHECKLIST_SCOPES, ["pc_browser", "private_local", "ipad", "iphone", "github_pages", "win5_links", "hakodate_links", "sapporo_links", "fallback"]);

const checklist = engine.buildFinalDisplayConfirmationChecklist({
  textSources: {
    "index.html": index,
    "private-local.html": privateLocal
  }
}, () => new Date("2026-06-28T00:00:00.000Z"));

assert.equal(checklist.phase, "Phase20-10");
assert.equal(checklist.activation_phase, "Phase20-8");
assert.equal(checklist.link_integrity_phase, "Phase20-9");
assert.equal(checklist.checklist_status, engine.CHECKLIST_STATUS);
assert.equal(checklist.records.length, 9);
assert.equal(checklist.safe_fallback_href, "index.html");
assert.equal(checklist.protected_mode, true);
assert.equal(checklist.plan_only, true);
assert.equal(checklist.execution_allowed, false);
assert.equal(checklist.auto_execution_allowed, false);
assert.equal(checklist.external_connection_allowed, false);
assert.equal(checklist.auto_update_allowed, false);
assert.equal(checklist.github_pages_setting_change_allowed, false);
assert.equal(checklist.repository_visibility_change_allowed, false);

assert.deepEqual(checklist.phase20_10_summary, {
  total_check_items: 9,
  pc_browser_items: 1,
  private_local_items: 1,
  ipad_items: 1,
  iphone_items: 1,
  github_pages_items: 1,
  win5_link_items: 1,
  hakodate_link_items: 1,
  sapporo_link_items: 1,
  fallback_items: 1,
  manual_pending_count: 9,
  protected_mode: true,
  plan_only: true,
  execution_allowed: false,
  auto_execution_allowed: false,
  external_connection_allowed: false,
  auto_update_allowed: false,
  github_pages_setting_change_allowed: false,
  repository_visibility_change_allowed: false,
  unsafe_flags_count: 0,
  html_route_checks: {
    index_phase20_10_panel: true,
    private_local_phase20_10_card: true,
    phase20_8_course_console_routes_retained: true,
    phase20_9_link_integrity_db_present: true
  },
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

for (const record of checklist.records) {
  for (const field of ["id", "target_name", "scope", "local_route", "console_scope", "expected_result", "display_confirmation_status", "verification_method", "fallback_expected_href", "links_to_confirm", "protected_mode", "plan_only", "execution_allowed", "auto_execution_allowed", "external_connection_allowed", "auto_update_allowed", "github_pages_setting_change_allowed", "repository_visibility_change_allowed", "required_policy_labels", "blocked_actions", "allowed_actions"]) assert.ok(Object.hasOwn(record, field), `${field} required`);
  assert.equal(record.display_confirmation_status, "manual_pending");
  assert.equal(record.fallback_expected_href, "index.html");
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.equal(record.auto_update_allowed, false);
  assert.equal(record.github_pages_setting_change_allowed, false);
  assert.equal(record.repository_visibility_change_allowed, false);
  assert.deepEqual(record.required_policy_labels, engine.REQUIRED_POLICY_LABELS);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

assert.ok(checklist.records.some((record) => record.scope === "pc_browser" && record.local_route === "course-console.html?console=win5"));
assert.ok(checklist.records.some((record) => record.scope === "private_local" && record.local_route === "private-local.html"));
assert.ok(checklist.records.some((record) => record.scope === "ipad" && record.local_route === "course-console.html?console=hakodate"));
assert.ok(checklist.records.some((record) => record.scope === "iphone" && record.local_route === "course-console.html?console=sapporo"));
assert.ok(checklist.records.some((record) => record.scope === "github_pages"));
assert.ok(checklist.records.some((record) => record.scope === "win5_links" && record.links_to_confirm.length === 4));
assert.ok(checklist.records.some((record) => record.scope === "hakodate_links" && record.links_to_confirm.length === 4));
assert.ok(checklist.records.some((record) => record.scope === "sapporo_links" && record.links_to_confirm.length === 4));
assert.ok(checklist.records.some((record) => record.scope === "fallback" && record.local_route === "index.html"));

assert.equal(db.phase, "Phase20-10");
assert.equal(db.activationPhase, "Phase20-8");
assert.equal(db.linkIntegrityPhase, "Phase20-9");
assert.equal(db.executionPolicy, "PLAN_ONLY");
assert.equal(db.protectionPolicy, "Protected");
assert.equal(db.externalSend, false);
assert.equal(db.autoUpdate, false);
assert.equal(db.githubPagesSettingChange, false);
assert.equal(db.repositoryPolicy, "Private repository premise");
assert.equal(db.safeFallbackHref, "index.html");
assert.equal(db.checklistItems.length, 9);
assert.equal(db.linkTargets.length, 12);
assert.equal(summaryDb.phase20_10_summary.totalCheckItems, 9);
assert.equal(summaryDb.phase20_10_summary.manualPendingCount, 9);
assert.equal(summaryDb.phase20_10_summary.unsafeFlagsCount, 0);
assert.equal(summaryDb.phase20_10_summary.safeFallbackHref, "index.html");
assert.equal(summaryDb.phase20_10_summary.executionAllowed, false);
assert.equal(summaryDb.phase20_10_summary.autoExecutionAllowed, false);
assert.equal(summaryDb.phase20_10_summary.externalConnectionAllowed, false);
assert.equal(summaryDb.phase20_10_summary.autoUpdateAllowed, false);
assert.equal(summaryDb.phase20_10_summary.githubPagesSettingChangeAllowed, false);

assert.equal(phase209Db.phase, "Phase20-9");
assert.equal(phase209Db.safeFallbackHref, "index.html");
assert.deepEqual(db.linkTargets.map((link) => link.href), phase209Db.links.map((link) => link.href));
for (const link of db.linkTargets) {
  assert.equal(link.fallbackHref, "index.html");
  assert.equal(/^[a-z]+:\/\//i.test(link.href), false, `${link.href} must stay repository-local`);
  assert.ok(fs.existsSync(path.join(root, link.href)), `${link.href} should exist for Phase20-10 confirmation`);
}

const fallbackLinks = linkIntegrityEngine.applyLinkIntegrityFallback(
  linkIntegrityEngine.getConsoleDefinition("win5").links,
  { "WIN5/index.html": { status: "missing", reason: "phase20_10_missing_link_simulation" } }
);
const fallbackLink = fallbackLinks.find((link) => link.originalHref === "WIN5/index.html");
assert.equal(fallbackLink.href, "index.html");
assert.equal(fallbackLink.integrityStatus, "fallback");
assert.equal(fallbackLink.missingReason, "phase20_10_missing_link_simulation");
assert.equal(linkIntegrityEngine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(linkIntegrityEngine.PROTECTION_POLICY, "Protected");
assert.equal(linkIntegrityEngine.basePolicy.externalSend, "Disabled");
assert.equal(linkIntegrityEngine.basePolicy.autoUpdate, "Disabled");
assert.equal(linkIntegrityEngine.basePolicy.githubPagesPolicy, "No GitHub Pages setting changes");
assert.equal(linkIntegrityEngine.basePolicy.repositoryPolicy, "Private repository premise");

assert.ok(index.includes('id="phase20-10-final-display-confirmation-checklist-builder"'));
assert.ok(index.includes('<script src="phase20-10-final-display-confirmation-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-10-final-display-confirmation-checklist-builder"'));
for (const route of ["course-console.html?console=win5", "course-console.html?console=hakodate", "course-console.html?console=sapporo"]) {
  assert.ok(index.includes(route), `${route} route should remain in index.html`);
}

for (const text of [index, privateLocal]) {
  assert.ok(text.includes("PLAN_ONLY"));
}

const builderSource = readText("phase20-10-final-display-confirmation-checklist-builder.js");
for (const forbidden of ["XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "github_pages_setting_change_allowed: true", "external_connection_allowed: true", "auto_update_allowed: true"]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-10 builder`);
}

console.log("phase20-10 final display confirmation checklist builder tests passed");
