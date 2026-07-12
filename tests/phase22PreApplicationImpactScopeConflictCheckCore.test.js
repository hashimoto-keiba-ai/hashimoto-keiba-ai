const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-13-pre-application-impact-scope-conflict-check-core.js");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    }
  };
}

function samplePhase2212Store() {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T12:00:00.000Z",
    sourceRaceKey: "2026-07-12東京11R",
    finalized: true,
    finalizedAt: "2026-07-12T12:05:00.000Z",
    approvals: [
      {
        approvalId: "approval-approved",
        name: "回収率改善承認",
        description: "approved / not_applied",
        targetReviewId: "review-eligible",
        targetValidationPlanId: "plan-roi",
        targetImprovementRuleId: "rule-roi",
        approvalStatus: "approved",
        applicationStatus: "not_applied",
        finalApprover: "Owner",
        approvedAt: "2026-07-12T12:02:00.000Z",
        approvalConditions: "手動確認後のみ",
        effectiveStartDate: "2026-07-12",
        effectiveEndDate: "2026-08-12",
        plannedScope: "東京 芝 1600",
        targetRaceConditions: "東京 芝 1600 3勝クラス",
        targetLogic: "AI評価点 印 展開",
        targetDataScope: "近5走 東京芝",
        prohibitedConditions: "短距離除外",
        priority: "10",
        existingRules: [
          {
            ruleId: "rule-roi",
            name: "同一ルール",
            targetRaceConditions: "東京 芝 1600 3勝クラス",
            targetLogic: "AI評価点 印 展開",
            targetDataScope: "近5走 東京芝",
            effectiveStartDate: "2026-07-01",
            effectiveEndDate: "2026-07-31",
            priority: "10",
            exclusionConditions: "短距離除外"
          }
        ]
      },
      {
        approvalId: "approval-draft",
        targetReviewId: "review-draft",
        targetValidationPlanId: "plan-draft",
        targetImprovementRuleId: "rule-draft",
        approvalStatus: "awaiting_approval",
        applicationStatus: "not_applied"
      },
      {
        approvalId: "approval-planned",
        targetReviewId: "review-planned",
        targetValidationPlanId: "plan-planned",
        targetImprovementRuleId: "rule-planned",
        approvalStatus: "approved",
        applicationStatus: "planned"
      }
    ]
  };
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

assert.strictEqual(engine.APPROVAL_STORAGE_KEY, "hashimotoKeibaAi.phase22.eligibleRuleManualApprovalManagement.v1");
assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.preApplicationImpactScopeConflictCheck.v1");

const storage = memoryStorage({ [engine.APPROVAL_STORAGE_KEY]: JSON.stringify(samplePhase2212Store()) });
const approvalLoad = engine.loadApprovalStore(storage);
assert.strictEqual(approvalLoad.parseError, false, "Phase22-12読込");
assert.strictEqual(engine.approvedNotAppliedApprovals(approvalLoad.approvalStore).length, 1, "approved / not_appliedだけ抽出");

const store = engine.normalizeImpactStore({}, approvalLoad.approvalStore);
assert.strictEqual(store.impacts.length, 1, "影響確認案件生成");
assert.deepStrictEqual(
  engine.normalizeImpactStore({}, approvalLoad.approvalStore).impacts.map((impact) => impact.impactId),
  store.impacts.map((impact) => impact.impactId),
  "同一入力で同一ID"
);

const impact = store.impacts[0];
assert.strictEqual(impact.targetApprovalId, "approval-approved");
assert.ok(impact.comparisons.some((item) => item.conflictType === "duplicate_rule"), "duplicate_rule検出");
assert.ok(impact.comparisons.some((item) => item.conflictType === "condition_overlap"), "条件重複検出");
assert.ok(impact.comparisons.some((item) => item.conflictType === "logic_overlap"), "ロジック重複検出");
assert.ok(impact.comparisons.some((item) => item.conflictType === "priority_conflict"), "優先順位競合検出");
assert.ok(impact.comparisons.some((item) => item.conflictType === "exclusion_conflict"), "排他条件競合検出");
assert.ok(impact.comparisons.some((item) => item.conflictType === "data_scope_conflict"), "データ範囲競合検出");
assert.ok(impact.comparisons.some((item) => item.conflictType === "validity_period_conflict"), "有効期間競合検出");
assert.strictEqual(impact.safety.automaticApply, false, "自動適用なし");
assert.strictEqual(impact.safety.automaticPriorityChange, false, "優先順位自動変更なし");

const unknownComparisons = engine.compareExistingRules({ targetImprovementRuleId: "new", targetRaceConditions: "東京" }, []);
assert.strictEqual(unknownComparisons[0].conflictType, "unknown", "既存ルール不明時unknown");
assert.strictEqual(engine.inferSafetyWarning(unknownComparisons), "review_required", "既存ルール不明時review_required");

const criticalImpact = { ...impact, decisionResult: "no_conflict" };
assert.ok(!engine.validateImpact(criticalImpact).ok, "critical競合でno_conflict拒否");
assert.ok(!engine.validateImpact({ ...impact, checkStatus: "cleared", decisionResult: "no_conflict", checker: "Owner", checkedAt: "2026-07-12T13:00:00.000Z", checkComment: "確認" }).ok, "high / critical未解決でcleared拒否");
assert.ok(!engine.validateImpact({ ...impact, decisionResult: "resolvable" }).ok, "resolvable必須項目拒否");
assert.ok(engine.validateImpact({ ...impact, decisionResult: "resolvable", mitigationPlan: "優先順位を手動確認", resolutionOwner: "Owner", resolutionDueDate: "2026-07-20" }).ok, "resolvable必須項目あり");
assert.ok(!engine.validateImpact({ ...impact, decisionResult: "blocked" }).ok, "blocked理由必須");
assert.ok(engine.validateImpact({ ...impact, decisionResult: "blocked", checkStatus: "blocked", blockReason: "critical競合" }).ok, "blocked理由あり");
assert.ok(!engine.validateImpact({ ...impact, checkStatus: "cleared", decisionResult: "resolvable", mitigationPlan: "回避", resolutionOwner: "Owner", resolutionDueDate: "2026-07-20" }).ok, "cleared確認記録必須");

const clearedImpact = {
  ...impact,
  comparisons: impact.comparisons.map((item) => ({ ...item, resolved: true })),
  safetyWarning: "no_warning",
  checkStatus: "cleared",
  decisionResult: "no_conflict",
  checker: "Owner",
  checkedAt: "2026-07-12T13:00:00.000Z",
  checkComment: "人が確認済み"
};
assert.ok(engine.validateImpact(clearedImpact).ok, "cleared条件満たす");
assert.strictEqual(clearedImpact.safety.automaticApply, false, "clearedでも自動適用なし");

assert.strictEqual(engine.canTransition("draft", "checking"), true, "正しい状態遷移");
assert.strictEqual(engine.canTransition("draft", "cleared"), false, "不正な状態遷移拒否");
assert.strictEqual(engine.canTransition("cleared", "checking"), false, "終端後の遷移拒否");
assert.strictEqual(engine.applyImpactEdit(clearedImpact, { checkComment: "変更" }).updated, false, "終端状態後の直接変更拒否");
assert.notStrictEqual(engine.createRecheckCase(clearedImpact, "2026-07-13T00:00:00.000Z").impactId, clearedImpact.impactId, "再確認は新規案件");

const payloadBefore = storage.getItem(engine.APPROVAL_STORAGE_KEY);
const finalizedStore = { ...store, impacts: [clearedImpact] };
const finalizeResult = engine.finalizeImpactStore(finalizedStore, "Owner", new Date("2026-07-12T14:00:00.000Z"));
assert.strictEqual(finalizeResult.finalized, true, "確定成功");
const saveResult = engine.saveImpactStore(storage, finalizeResult.store, new Date("2026-07-12T14:01:00.000Z"));
assert.strictEqual(saveResult.saved, true, "localStorage保存");
assert.strictEqual(storage.getItem(engine.APPROVAL_STORAGE_KEY), payloadBefore, "既存Phase22-12データを書き換えない");
const restored = engine.loadSavedImpactStore(storage, approvalLoad.approvalStore);
assert.strictEqual(restored.store.impacts.length, 1, "復元");
assert.ok(engine.generatePlainText(restored.store).includes("未適用・自動反映なし"), "テキスト安全表示");
assert.strictEqual(engine.deleteSavedImpactStore(storage, () => false).deleted, false, "初期化は確認必須");
assert.strictEqual(engine.deleteSavedImpactStore(storage, () => true).deleted, true, "Phase22-13のみ初期化");
assert.strictEqual(storage.getItem(engine.APPROVAL_STORAGE_KEY), payloadBefore, "初期化でもPhase22-12非破壊");

const malformedStorage = memoryStorage({ [engine.STORAGE_KEY]: "{broken" });
assert.strictEqual(engine.loadSavedImpactStore(malformedStorage, approvalLoad.approvalStore).rejected, true, "破損保存データ拒否");
const invalidStoreStorage = memoryStorage({ [engine.STORAGE_KEY]: JSON.stringify({ impacts: "bad" }) });
assert.strictEqual(engine.loadSavedImpactStore(invalidStoreStorage, approvalLoad.approvalStore).rejected, true, "不正保存データ拒否");

const warnings = engine.buildWarnings({ approvalStore: approvalLoad.approvalStore, store: finalizedStore });
assert.ok(warnings.some((warning) => warning.message.includes("未適用")), "no_conflict / clearedでも未適用警告");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-impact-conflict-check-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-12-eligible-rule-manual-approval-management-core.js") < index.indexOf("phase22-13-pre-application-impact-scope-conflict-check-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-impact-conflict-check-core"'), "private-local導線");
assert.ok(css.includes(".phase22-impact-conflict-core"), "Phase22-13 CSS");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.preApplicationImpactScopeConflictCheck.v1"), "README保存キー");
assert.ok(readme.includes("`cleared` does not apply anything automatically"), "README安全仕様");

function makeNode() {
  return {
    dataset: {},
    children: [],
    value: "",
    textContent: "",
    disabled: false,
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    addEventListener() {},
    set className(value) {
      this._className = value;
    },
    get className() {
      return this._className || "";
    }
  };
}

const nodes = new Map();
[
  "#phase22-impact-conflict-check-core",
  "#phase22-impact-message",
  "#phase22-impact-finalized-status",
  "#phase22-impact-summary",
  "#phase22-impact-warning-list",
  "#phase22-impact-list",
  "#phase22-impact-confirmer",
  "#phase22-impact-text-output",
  "#phase22-impact-reload",
  "#phase22-impact-save",
  "#phase22-impact-restore",
  "#phase22-impact-reset",
  "#phase22-impact-finalize",
  "#phase22-impact-unlock",
  "#phase22-impact-text"
].forEach((id) => nodes.set(id, makeNode()));

const fakeDocument = {
  querySelector(selector) {
    return nodes.get(selector) || null;
  },
  createElement(tag) {
    const node = makeNode();
    node.tagName = tag.toUpperCase();
    if (tag === "option") node.selected = false;
    return node;
  }
};
const panel = engine.bindImpactConflictPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "file://相当初期化");
assert.ok(panel.nodes.summary.textContent.includes("影響確認"), "初期表示");
panel.actions["#phase22-impact-reload"]();
panel.actions["#phase22-impact-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-13"), "出力欄");

const sandbox = {
  window: {
    document: { readyState: "loading", addEventListener() {} }
  },
  document: { readyState: "loading", addEventListener() {} },
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText("phase22-13-pre-application-impact-scope-conflict-check-core.js"), sandbox, { filename: "phase22-13-pre-application-impact-scope-conflict-check-core.js" });
assert.ok(sandbox.window.HashimotoPhase2213ImpactScopeConflictCheckCore, "browser global export");

console.log("Phase22-13 pre-application impact scope conflict check core test passed");
