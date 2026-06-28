const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-11-final-integration-safety-review-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-11-final-integration-safety-review-db.json");
const summaryDb = readJson("phase20-11-final-integration-safety-review-summary-db.json");
const phase2010Summary = readJson("phase20-10-final-display-confirmation-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");

assert.equal(engine.PHASE, "Phase20-11");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.REVIEW_STATUS, "final_integration_safety_review_plan_only");
assert.equal(engine.SAFE_FALLBACK_HREF, "index.html");
assert.deepEqual(engine.BLOCKED_ACTIONS, ["merge", "external_connection", "auto_execution", "auto_update", "github_pages_setting_change", "repository_visibility_change"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report"]);
assert.deepEqual(engine.RECOMMENDED_MERGE_ORDER, ["PR #174 Phase20-8", "PR #175 Phase20-9", "PR #176 Phase20-10", "Phase20-11 review PR after manual confirmation"]);

const review = engine.buildFinalIntegrationSafetyReview({}, () => new Date("2026-06-28T00:00:00.000Z"));
assert.equal(review.phase, "Phase20-11");
assert.equal(review.review_status, engine.REVIEW_STATUS);
assert.equal(review.pr_dependencies.length, 3);
assert.equal(review.records.length, 7);
assert.equal(review.protected_mode, true);
assert.equal(review.plan_only, true);
assert.equal(review.execution_allowed, false);
assert.equal(review.auto_execution_allowed, false);
assert.equal(review.external_connection_allowed, false);
assert.equal(review.auto_update_allowed, false);
assert.equal(review.github_pages_setting_change_allowed, false);
assert.equal(review.repository_visibility_change_allowed, false);
assert.equal(review.merge_allowed, false);

const pr175 = review.pr_dependencies.find((dependency) => dependency.pr_number === 175);
const pr176 = review.pr_dependencies.find((dependency) => dependency.pr_number === 176);
assert.equal(pr175.draft_required, true);
assert.equal(pr175.merge_before_manual_confirmation_allowed, false);
assert.equal(pr176.draft_required, true);
assert.equal(pr176.base_branch, "codex/phase20-9-course-console-link-integrity");
assert.ok(pr176.depends_on.some((dependency) => dependency.includes("PR #175")));
assert.equal(pr176.merge_before_manual_confirmation_allowed, false);

assert.equal(review.phase20_11_summary.total_review_targets, 7);
assert.equal(review.phase20_11_summary.draft_prs_tracked, 3);
assert.equal(review.phase20_11_summary.pr_175_draft_required, true);
assert.equal(review.phase20_11_summary.pr_176_draft_required, true);
assert.equal(review.phase20_11_summary.pr_176_base_branch, "codex/phase20-9-course-console-link-integrity");
assert.equal(review.phase20_11_summary.manual_confirmation_required_before_merge, true);
assert.equal(review.phase20_11_summary.merge_allowed, false);
assert.equal(review.phase20_11_summary.unsafe_flags_count, 0);
assert.deepEqual(review.phase20_11_summary.recommended_merge_order, engine.RECOMMENDED_MERGE_ORDER);

for (const record of review.records) {
  assert.equal(record.review_status, "manual_review_pending");
  assert.equal(record.manual_confirmation_required, true);
  assert.equal(record.merge_before_confirmation_allowed, false);
  assert.equal(record.fallback_expected_href, "index.html");
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.merge_allowed, false);
  assert.equal(record.execution_allowed, false);
  assert.equal(record.auto_execution_allowed, false);
  assert.equal(record.external_connection_allowed, false);
  assert.equal(record.auto_update_allowed, false);
  assert.equal(record.github_pages_setting_change_allowed, false);
  assert.equal(record.repository_visibility_change_allowed, false);
}

assert.ok(review.records.some((record) => record.id === "P20-11-COURSE-CONSOLE" && record.route.includes("course-console.html?console=win5")));
assert.ok(review.records.some((record) => record.id === "P20-11-WIN5" && record.route === "course-console.html?console=win5"));
assert.ok(review.records.some((record) => record.id === "P20-11-HAKODATE" && record.route === "course-console.html?console=hakodate"));
assert.ok(review.records.some((record) => record.id === "P20-11-SAPPORO" && record.route === "course-console.html?console=sapporo"));
assert.ok(review.records.some((record) => record.id === "P20-11-FALLBACK" && record.route === "index.html"));
assert.ok(review.records.some((record) => record.id === "P20-11-PRIVATE-LOCAL" && record.route === "private-local.html"));
assert.ok(review.records.some((record) => record.id === "P20-11-INDEX" && record.route === "index.html"));

assert.equal(db.phase, "Phase20-11");
assert.equal(db.mergeAllowed, false);
assert.equal(db.manualConfirmationRequiredBeforeMerge, true);
assert.equal(db.prDependencies.length, 3);
assert.equal(db.prDependencies.find((dependency) => dependency.prNumber === 176).baseBranch, "codex/phase20-9-course-console-link-integrity");
assert.equal(db.reviewTargets.length, 7);
assert.equal(summaryDb.phase20_11_summary.totalReviewTargets, 7);
assert.equal(summaryDb.phase20_11_summary.pr175DraftRequired, true);
assert.equal(summaryDb.phase20_11_summary.pr176DraftRequired, true);
assert.equal(summaryDb.phase20_11_summary.mergeAllowed, false);
assert.equal(summaryDb.phase20_11_summary.unsafeFlagsCount, 0);
assert.deepEqual(summaryDb.phase20_11_summary.recommendedMergeOrder, engine.RECOMMENDED_MERGE_ORDER);
assert.equal(phase2010Summary.phase20_10_summary.manualPendingCount, 9);
assert.equal(phase2010Summary.phase20_10_summary.githubPagesSettingChangeAllowed, false);
assert.ok(index.includes('id="phase20-11-final-integration-safety-review-builder"'));
assert.ok(index.includes('<script src="phase20-11-final-integration-safety-review-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-11-final-integration-safety-review-builder"'));
assert.ok(privateLocal.includes("Phase20-11 Final Integration Safety Review"));

const builderSource = readText("phase20-11-final-integration-safety-review-builder.js");
for (const forbidden of ["XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "github_pages_setting_change_allowed: true", "external_connection_allowed: true", "auto_update_allowed: true", "merge_allowed: true"]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-11 builder`);
}

console.log("phase20-11 final integration safety review builder tests passed");
