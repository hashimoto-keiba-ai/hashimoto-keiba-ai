const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-10-improvement-rule-validation-plan-pre-application-evaluation-core.js");
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

function sampleRuleManagement(finalized = true) {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T12:00:00.000Z",
    sourceRaceKey: "2026-07-12|東京|11R",
    finalized,
    finalizedAt: finalized ? "2026-07-12T12:05:00.000Z" : "",
    rules: [
      {
        ruleId: "phase22-9-rule-ai-hit",
        name: "AI高評価継続確認",
        description: "AI上位が好走した条件を検証",
        sourceCandidateId: "ai-hit",
        targetConditions: "AI評価点90以上",
        targetRaceConditions: "芝1600",
        targetLogic: "aiScore",
        applicationScope: "Private Local manual validation",
        effectiveStartDate: "2026-07-13",
        effectiveEndDate: "2026-08-13",
        managementStatus: "approved",
        validationStatus: "readyForManualValidation"
      },
      {
        ruleId: "phase22-9-rule-danger",
        name: "危険人気馬確認",
        description: "危険人気馬判定を検証",
        sourceCandidateId: "danger-check",
        targetConditions: "人気上位で危険判定",
        targetRaceConditions: "同条件レース",
        targetLogic: "dangerousPopular",
        applicationScope: "Private Local manual validation",
        effectiveStartDate: "2026-07-14",
        effectiveEndDate: "2026-08-14",
        managementStatus: "draft",
        validationStatus: "notStarted"
      },
      {
        ruleId: "phase22-9-rule-rejected",
        name: "除外ルール",
        description: "対象外",
        sourceCandidateId: "rejected",
        targetConditions: "なし",
        targetRaceConditions: "なし",
        targetLogic: "none",
        applicationScope: "none",
        managementStatus: "rejected"
      }
    ]
  };
}

function saveRuleManagement(storage, data = sampleRuleManagement()) {
  storage.setItem(engine.RULE_MANAGEMENT_STORAGE_KEY, JSON.stringify(data));
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.improvementRuleValidationPlan.v1");
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.RULE_MANAGEMENT_STORAGE_KEY));
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.STORAGE_KEY));
assert.deepStrictEqual(engine.VALIDATION_STATUSES, ["draft", "ready", "running", "paused", "completed", "cancelled", "expired"]);
assert.deepStrictEqual(engine.JUDGEMENT_RESULTS, ["pending", "passed", "failed", "inconclusive", "rejected"]);

const storage = createStorage();
saveRuleManagement(storage);
const loaded = engine.loadRuleManagement(storage);
assert.strictEqual(loaded.ruleManagement.finalized, true, "Phase22-9データとの連携");
assert.strictEqual(engine.eligibleRules(loaded.ruleManagement).length, 2, "対象改善ルール抽出");
const plans = engine.generatePlansFromRules(loaded.ruleManagement);
assert.strictEqual(plans.length, 2, "正常な検証計画生成");
assert.deepStrictEqual(plans.map((plan) => plan.planId), engine.generatePlansFromRules(loaded.ruleManagement).map((plan) => plan.planId), "同一入力で決定的なIDと順序");
assert.ok(plans[0].comparison.baseline, "baseline / candidate比較構造");
assert.ok(plans[0].comparison.candidate, "candidate比較構造");
assert.ok(plans[0].metrics.length > 0, "評価指標");
assert.ok(plans[0].passCriteria, "合格基準");
assert.ok(plans[0].failCriteria, "失格基準");
assert.strictEqual(plans[0].safety.automaticApply, false, "passedでも自動適用されないこと");
assert.strictEqual(plans[0].safety.automaticLearning, false, "自動学習なし");
assert.strictEqual(plans[0].safety.automaticUpdate, false, "自動更新なし");
assert.strictEqual(engine.validatePlan(plans[0]).ok, true, "検証計画正常");
assert.strictEqual(engine.validatePlan({ ...plans[0], name: "" }).ok, false, "必須入力不足の拒否");
assert.strictEqual(engine.validatePlan({ ...plans[0], validationStartDate: "2026-08-01", plannedEndDate: "2026-07-01" }).ok, false, "不正な日付範囲の拒否");
assert.strictEqual(engine.validatePlan({ ...plans[0], validationStatus: "running", judgementResult: "passed" }).ok, false, "合格基準と判定結果の整合性");
assert.strictEqual(engine.validatePlan({ ...plans[0], validationStatus: "completed", judgementResult: "passed", judgementReason: "基準達成" }).ok, true, "passed判定理由");

assert.strictEqual(engine.canTransition("draft", "ready"), true, "状態遷移 draft -> ready");
assert.strictEqual(engine.canTransition("ready", "completed"), false, "不正な状態遷移の拒否");
assert.strictEqual(engine.transitionPlan({ ...plans[0], validationStatus: "draft" }, "ready").transitioned, true, "状態遷移成功");
assert.strictEqual(engine.transitionPlan({ ...plans[0], validationStatus: "completed" }, "running").transitioned, false, "completed後の直接変更拒否");

const store = engine.normalizePlanStore({}, loaded.ruleManagement);
assert.strictEqual(store.plans.length, 2, "計画ストア正規化");
const warnings = engine.buildWarnings({ ruleManagement: loaded.ruleManagement, store });
assert.strictEqual(warnings.filter((warning) => warning.severity === "error").length, 0, "警告集約");
assert.strictEqual(engine.canFinalize({ ruleManagement: loaded.ruleManagement, store, warnings }).ok, true, "確定条件成功");
const finalized = engine.finalizePlanStore(store, { ruleManagement: loaded.ruleManagement, store, warnings }, "Owner", () => true);
assert.strictEqual(finalized.finalized, true, "確定成功");
const failedRules = engine.normalizeRuleManagement(sampleRuleManagement(false));
const failedStore = engine.normalizePlanStore({}, failedRules);
const failedWarnings = engine.buildWarnings({ ruleManagement: failedRules, store: failedStore });
assert.strictEqual(engine.canFinalize({ ruleManagement: failedRules, store: failedStore, warnings: failedWarnings }).ok, false, "確定条件失敗");
assert.strictEqual(engine.unfinalizePlanStore(finalized.store, () => true).unlocked, true, "確定解除");

const payload = engine.buildPayload({ ruleManagement: loaded.ruleManagement, store: finalized.store, warnings });
assert.strictEqual(engine.savePlanStore(payload, storage).saved, true, "localStorage保存");
assert.strictEqual(engine.loadSavedPlanStore(storage, loaded.ruleManagement).store.plans.length, 2, "復元");
assert.strictEqual(engine.deleteSavedPlanStore(storage, () => false).deleted, false, "Phase22-10のみ初期化は確認必須");
assert.strictEqual(engine.deleteSavedPlanStore(storage, () => true).deleted, true, "Phase22-10のみ初期化");
assert.ok(storage.getItem(engine.RULE_MANAGEMENT_STORAGE_KEY), "Phase22-9は削除しない");

const broken = createStorage();
broken.setItem(engine.RULE_MANAGEMENT_STORAGE_KEY, "{broken");
assert.strictEqual(engine.loadRuleManagement(broken).parseError, true, "破損JSON");
assert.doesNotThrow(() => engine.generatePlansFromRules(engine.normalizeRuleManagement()), "データ未登録状態");
const changedStore = engine.normalizePlanStore({ ruleSnapshot: { savedAt: "old", finalized: false, ruleIds: ["old"] } }, loaded.ruleManagement);
assert.ok(engine.detectPhase229Changes(loaded.ruleManagement, changedStore).length > 0, "Phase22-9更新検知");
const text = engine.generatePlainText({ ruleManagement: loaded.ruleManagement, store, warnings });
assert.ok(text.includes("Phase22-10 改善ルール検証計画"), "テキスト生成");
assert.ok(text.includes("passedでも自動適用しません"), "passedでも自動適用されないこと");

const quotaStorage = createStorage();
quotaStorage.setItem = () => {
  const error = new Error("quota");
  error.name = "QuotaExceededError";
  throw error;
};
assert.strictEqual(engine.savePlanStore(payload, quotaStorage).quotaExceeded, true, "localStorage例外処理");

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
  ["phase22-validation-plan-core", "phase22-validation-message", "phase22-validation-finalized-status", "phase22-validation-summary", "phase22-validation-warning-list", "phase22-validation-list", "phase22-validation-text-output", "phase22-validation-confirmer"].forEach((id) => nodes.set(`#${id}`, makeNode()));
  ["reload", "save", "restore", "reset", "finalize", "unlock", "text"].forEach((id) => nodes.set(`#phase22-validation-${id}`, makeNode()));
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
saveRuleManagement(panelStorage);
const panel = createPanelDocument();
const binding = engine.bindValidationPlanPanel({ document: panel.document, storage: panelStorage, confirmReset: () => true, confirmFinalize: () => true, confirmUnlock: () => true });
assert.strictEqual(typeof binding.save, "function", "file://相当DOMで初期化");
assert.ok(panel.nodes.get("#phase22-validation-list").children.length > 0, "検証計画一覧描画");
binding.outputText();
assert.ok(panel.nodes.get("#phase22-validation-text-output").value.includes("Phase22-10"), "出力欄");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-validation-plan-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-9-approved-learning-candidate-improvement-rule-management-core.js") < index.indexOf("phase22-10-improvement-rule-validation-plan-pre-application-evaluation-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-validation-plan-core"'), "private-local導線");
assert.ok(css.includes(".phase22-validation-plan-core"), "Phase22-10 CSS");
assert.ok(readme.includes(engine.STORAGE_KEY), "README save key");
assert.ok(readme.includes("passed` does not automatically apply the rule"), "README安全条件");

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
  vm.runInContext(readText("phase22-10-improvement-rule-validation-plan-pre-application-evaluation-core.js"), sandbox, { filename: "phase22-10-improvement-rule-validation-plan-pre-application-evaluation-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-10 validation plan core test passed");
