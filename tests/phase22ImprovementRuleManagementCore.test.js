const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-9-approved-learning-candidate-improvement-rule-management-core.js");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");

function createStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key(index) { return Array.from(data.keys())[index] || null; },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); }
  };
}

function sampleReview(finalized = true) {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T11:00:00.000Z",
    sourceRaceKey: "2026-07-12|東京|11R",
    finalized,
    finalizedAt: finalized ? "2026-07-12T11:05:00.000Z" : "",
    candidates: [
      { id: "ai-hit", category: "AI評価点", title: "高評価馬の好走候補", body: "AI上位が好走", evidence: "1番が1着", targetHorse: "1 ホースA", outcome: "success", importance: "high", confidence: "medium", scope: "芝1600", nextAction: "高評価条件を手動確認", approvalStatus: "candidate" },
      { id: "budget-fail", category: "予算配分", title: "回収率悪化要因候補", body: "配分過多", evidence: "ワイド不的中", targetTicketType: "ワイド", outcome: "failure", importance: "middle", confidence: "low", nextAction: "配分を手動確認", approvalStatus: "hold" },
      { id: "danger-check", category: "危険人気馬判定", title: "危険人気馬判定の成功候補", body: "危険人気馬が凡走", evidence: "2番が着外", targetEvaluation: "dangerousPopular", outcome: "success", importance: "middle", confidence: "medium", nextAction: "判定根拠を継続確認", approvalStatus: "candidate" }
    ]
  };
}

function saveReview(storage, review = sampleReview()) {
  storage.setItem(engine.LEARNING_REVIEW_STORAGE_KEY, JSON.stringify(review));
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.improvementRuleManagement.v1");
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.LEARNING_REVIEW_STORAGE_KEY));
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.STORAGE_KEY));
assert.deepStrictEqual(engine.MANAGEMENT_STATUSES, ["draft", "approved", "validating", "suspended", "rejected", "expired"]);

const storage = createStorage();
saveReview(storage);
const loaded = engine.loadLearningReview(storage);
assert.strictEqual(loaded.review.finalized, true, "Phase22-8読込");
assert.strictEqual(engine.approvedCandidates(loaded.review).length, 2, "承認済み候補抽出");

const rules = engine.generateRulesFromApprovedCandidates(loaded.review);
assert.strictEqual(rules.length, 2, "改善ルール生成");
assert.deepStrictEqual(rules.map((rule) => rule.ruleId), engine.generateRulesFromApprovedCandidates(loaded.review).map((rule) => rule.ruleId), "JSON入出力の決定性");
assert.ok(rules[0].ruleId.startsWith("phase22-9-rule-"), "改善ルールID");
assert.ok(rules[0].sourceCandidateId, "承認元候補ID");
assert.ok(rules[0].targetConditions, "対象条件");
assert.ok(rules[0].targetRaceConditions, "対象レース条件");
assert.ok(rules[0].targetLogic, "対象ロジック");
assert.ok(rules[0].applicationScope, "適用範囲");
assert.strictEqual(rules[0].managementStatus, "draft", "管理状態");
assert.strictEqual(rules[0].validationStatus, "notStarted", "検証状態");
assert.strictEqual(rules[0].safety.automaticLearning, false, "自動学習なし");
assert.strictEqual(rules[0].safety.automaticApply, false, "自動適用なし");
assert.strictEqual(rules[0].safety.automaticUpdate, false, "自動更新なし");
assert.strictEqual(engine.validateRule(rules[0]).ok, true, "有効ルール");
assert.strictEqual(engine.validateRule({ ...rules[0], name: "" }).ok, false, "不足入力拒否");
assert.strictEqual(engine.validateRule({ ...rules[0], managementStatus: "auto" }).ok, false, "不正管理状態拒否");
assert.strictEqual(engine.validateRule({ ...rules[0], effectiveStartDate: "2026-08-01", effectiveEndDate: "2026-07-01" }).ok, false, "不正期限拒否");

const plan = engine.normalizePlan({}, loaded.review);
assert.strictEqual(plan.rules.length, 2, "管理計画正規化");
const warnings = engine.buildWarnings({ review: loaded.review, plan });
assert.strictEqual(warnings.filter((warning) => warning.severity === "error").length, 0, "警告集約");
assert.strictEqual(engine.canFinalize({ review: loaded.review, plan, warnings }).ok, true, "確定条件成功");
const finalized = engine.finalizeRulePlan(plan, { review: loaded.review, plan, warnings }, "Owner", () => true);
assert.strictEqual(finalized.finalized, true, "確定成功");
const failedReview = engine.normalizeLearningReview(sampleReview(false));
const failedWarnings = engine.buildWarnings({ review: failedReview, plan: engine.normalizePlan({}, failedReview) });
assert.strictEqual(engine.canFinalize({ review: failedReview, plan: engine.normalizePlan({}, failedReview), warnings: failedWarnings }).ok, false, "確定条件失敗");
assert.strictEqual(engine.unfinalizeRulePlan(finalized.plan, () => true).unlocked, true, "確定解除");

const payload = engine.buildPayload({ review: loaded.review, plan: finalized.plan, warnings });
const saved = engine.saveRulePlan(payload, storage);
assert.strictEqual(saved.saved, true, "保存");
assert.strictEqual(engine.loadSavedRulePlan(storage, loaded.review).plan.rules.length, 2, "復元");
assert.strictEqual(engine.deleteSavedRulePlan(storage, () => false).deleted, false, "Phase22-9のみ初期化は確認必須");
assert.strictEqual(engine.deleteSavedRulePlan(storage, () => true).deleted, true, "Phase22-9のみ初期化");
assert.ok(storage.getItem(engine.LEARNING_REVIEW_STORAGE_KEY), "Phase22-8は削除しない");

const broken = createStorage();
broken.setItem(engine.LEARNING_REVIEW_STORAGE_KEY, "{broken");
assert.strictEqual(engine.loadLearningReview(broken).parseError, true, "破損JSON");
assert.doesNotThrow(() => engine.generateRulesFromApprovedCandidates(engine.normalizeLearningReview()), "データ未登録状態");
const changedPlan = engine.normalizePlan({ reviewSnapshot: { savedAt: "old", finalized: false, approvedCandidateIds: ["old"] } }, loaded.review);
assert.ok(engine.detectPhase228Changes(loaded.review, changedPlan).length > 0, "Phase22-8更新検知");

const text = engine.generatePlainText({ review: loaded.review, plan, warnings });
assert.ok(text.includes("Phase22-9 承認済み学習候補"), "テキスト生成");
assert.ok(text.includes("自動学習・自動適用・自動更新"), "安全明記");

const quotaStorage = createStorage();
quotaStorage.setItem = () => {
  const error = new Error("quota");
  error.name = "QuotaExceededError";
  throw error;
};
assert.strictEqual(engine.saveRulePlan(payload, quotaStorage).quotaExceeded, true, "localStorage例外処理");

function createPanelDocument() {
  const nodes = new Map();
  function makeNode() {
    return {
      textContent: "",
      value: "",
      checked: false,
      type: "text",
      dataset: {},
      children: [],
      appendChild(child) { this.children.push(child); return child; },
      addEventListener() {},
      querySelector() { return null; }
    };
  }
  ["phase22-improvement-rule-management-core", "phase22-rule-message", "phase22-rule-finalized-status", "phase22-rule-summary", "phase22-rule-warning-list", "phase22-rule-list", "phase22-rule-text-output", "phase22-rule-confirmer"].forEach((id) => nodes.set(`#${id}`, makeNode()));
  ["reload", "save", "restore", "reset", "finalize", "unlock", "text"].forEach((id) => nodes.set(`#phase22-rule-${id}`, makeNode()));
  return {
    document: {
      readyState: "complete",
      querySelector(selector) { return nodes.get(selector) || null; },
      querySelectorAll() { return []; },
      createElement() { return makeNode(); },
      addEventListener() {}
    },
    nodes
  };
}

const panelStorage = createStorage();
saveReview(panelStorage);
const panel = createPanelDocument();
const binding = engine.bindRuleManagementPanel({ document: panel.document, storage: panelStorage, confirmReset: () => true, confirmFinalize: () => true, confirmUnlock: () => true });
assert.strictEqual(typeof binding.save, "function", "file://相当DOMで初期化");
assert.ok(panel.nodes.get("#phase22-rule-list").children.length > 0, "改善ルール一覧描画");
binding.outputText();
assert.ok(panel.nodes.get("#phase22-rule-text-output").value.includes("Phase22-9"), "出力欄");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-improvement-rule-management-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-8-learning-candidate-review-summary-core.js") < index.indexOf("phase22-9-approved-learning-candidate-improvement-rule-management-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-improvement-rule-management-core"'), "private-local導線");
assert.ok(css.includes(".phase22-improvement-rule-management-core"), "Phase22-9 CSS");
assert.ok(readme.includes(engine.STORAGE_KEY), "README save key");
assert.ok(readme.includes("Automatic learning, automatic application, and automatic updates are not implemented"), "README安全条件");

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
for (const file of changedFiles) assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
const changedText = changedFiles.filter((file) => !/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(file)).map((file) => readText(file)).join("\n");
assert.strictEqual(/githubPages\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/publicUrl\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/externalApi\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/autoExecution\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/automaticLearning\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/automaticApply\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/automaticUpdate\s*:\s*true/i.test(changedText), false);

const sandboxPanel = createPanelDocument();
const sandbox = { window: { document: sandboxPanel.document, localStorage: createStorage(), confirm: () => true }, document: sandboxPanel.document, console };
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
assert.doesNotThrow(() => {
  vm.runInContext(readText("phase22-9-approved-learning-candidate-improvement-rule-management-core.js"), sandbox, { filename: "phase22-9-approved-learning-candidate-improvement-rule-management-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-9 improvement rule management core test passed");
