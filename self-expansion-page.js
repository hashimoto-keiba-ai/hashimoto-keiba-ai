(function (global) {
  "use strict";

  const DEVELOPMENT_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const PHASE = "Phase18-1";
  const SYSTEM_NAME = "Self Expansion System";
  const PROTECTED_SYSTEM = "Hashimoto Racing OS v4.0 Final";
  const DATABASES = Object.freeze({
    expansion: "self-expansion-db.json",
    history: "self-expansion-history-db.json",
    rules: "self-expansion-rule-db.json",
    menu: "self-expansion-menu-db.json",
    version: "self-expansion-version-db.json"
  });
  const ENGINE_MENU = Object.freeze([
    ["Hashimoto Super Core Engine v5.0", "index.html#self-expansion-panel"],
    ["Self Expansion System", "index.html#self-expansion-panel"],
    ["Auto Development Engine", "index.html#auto-development-panel"],
    ["AI Evolution Engine", "index.html#ai-evolution-panel"],
    ["Hashimoto Racing OS v4.0 Final", "index.html#final-system-panel"],
    ["Autonomous Research Institute", "index.html#autonomous-research-panel"],
    ["Global Intelligence Network", "index.html#global-network-panel"],
    ["Racing OS v4.0", "index.html#racing-os-panel"],
    ["Version Manager", "index.html#release-manager-panel"],
    ["God AI Engine", "index.html#god-ai-panel"],
    ["Universal Racing Intelligence Engine", "index.html#universal-racing-panel"]
  ].map(([label, href]) => Object.freeze({ label, href })));
  const ONE_TAP_MENU = Object.freeze([
    ["自己進化", "index.html#self-evolution-panel"],
    ["自己増殖", "index.html#self-expansion-panel"],
    ["自動研究", "index.html#autonomous-research-panel"],
    ["全競馬場統合AI", "index.html#racing-os-panel"],
    ["Global Intelligence", "index.html#global-network-panel"],
    ["Version管理", "index.html#release-manager-panel"],
    ["Racing OS", "index.html#final-system-panel"],
    ["v5.0開発", "index.html#self-expansion-panel"],
    ["自己開発", "index.html#auto-development-panel"],
    ["未接続検出", "index.html#auto-development-panel"],
    ["自動ロードマップ", "index.html#auto-development-panel"],
    ["v5.0開発センター", "index.html#auto-development-panel"],
    ["進化案生成", "index.html#ai-evolution-panel"],
    ["優先順位", "index.html#ai-evolution-panel"],
    ["成功失敗学習", "index.html#ai-evolution-panel"],
    ["v5.0進化センター", "index.html#ai-evolution-panel"]
  ].map(([label, href]) => Object.freeze({ label, href })));
  const RULES = Object.freeze([
    "Official Release v2.8を永久保存版として保護する",
    "Hashimoto Racing OS v4.0 Finalを保持する",
    "Phase16 / Phase17の既存機能を削除しない",
    "追加機能は既存DashboardとPrivate Local Operationへ統合する"
  ]);

  function readJson(storage, key, fallback) {
    try {
      const value = storage && storage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function latest(value) {
    if (Array.isArray(value)) return value[value.length - 1] || {};
    return value && typeof value === "object" ? value : {};
  }

  function score(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.round(number)) : fallback;
  }

  function buildVersionStatus(storage, now) {
    const audit = latest(readJson(storage, "releaseAuditReports", []));
    const finalSystem = latest(readJson(storage, "final-system-db.json", []));
    return {
      phase: PHASE,
      phaseStatus: "Version 5.0 Development",
      currentVersion: DEVELOPMENT_VERSION,
      releaseScore: score(audit.releaseScore ?? finalSystem.releaseScore ?? finalSystem.healthScore, 100),
      officialRelease: OFFICIAL_RELEASE,
      officialReleaseStatus: "Protected",
      protectedVersions: ["Official Release v" + OFFICIAL_RELEASE, PROTECTED_SYSTEM],
      addedEngines: ENGINE_MENU.map((item) => item.label),
      selfExpansion: "ON",
      racingOsIntegration: "Integrated",
      privateLocalOperation: "ON",
      updatedAt: (now || new Date()).toISOString()
    };
  }

  function generateOneTapMenu() {
    return ONE_TAP_MENU.map((item) => ({ label: item.label, href: item.href }));
  }

  function buildExpansionReport(storage, now) {
    const version = buildVersionStatus(storage, now);
    return {
      system: SYSTEM_NAME,
      phase: PHASE,
      developmentVersion: DEVELOPMENT_VERSION,
      status: "ACTIVE",
      version,
      engines: ENGINE_MENU.map((item) => ({ label: item.label, href: item.href })),
      oneTapMenu: generateOneTapMenu(),
      rules: Array.from(RULES),
      createdAt: version.updatedAt
    };
  }

  function writeJson(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function saveSelfExpansion(storage, now) {
    if (!storage || typeof storage.setItem !== "function") throw new Error("localStorage is required");
    const report = buildExpansionReport(storage, now);
    const storedHistory = readJson(storage, DATABASES.history, []);
    const history = Array.isArray(storedHistory) ? storedHistory.slice(-99) : [];
    history.push({
      date: report.createdAt,
      phase: PHASE,
      version: DEVELOPMENT_VERSION,
      releaseScore: report.version.releaseScore,
      status: report.status
    });
    writeJson(storage, DATABASES.expansion, report);
    writeJson(storage, DATABASES.history, history);
    writeJson(storage, DATABASES.rules, { phase: PHASE, rules: report.rules, protectedVersions: report.version.protectedVersions });
    writeJson(storage, DATABASES.menu, { engines: report.engines, oneTapMenu: report.oneTapMenu, generatedAt: report.createdAt });
    writeJson(storage, DATABASES.version, report.version);
    storage.setItem("releaseVersion", OFFICIAL_RELEASE);
    storage.setItem("releaseStatus", "Official Release v" + OFFICIAL_RELEASE);
    return report;
  }

  function menuMarkup(item) {
    return '<a class="local-card self-expansion-generated" href="' + item.href + '"><strong>' + item.label + '</strong><span>自動生成メニュー</span></a>';
  }

  function renderPrivateLocalMenus(documentRef) {
    if (!documentRef) return;
    const engines = documentRef.getElementById("self-expansion-system-menu");
    const oneTap = documentRef.getElementById("self-expansion-one-tap-menu");
    if (engines) engines.innerHTML = ENGINE_MENU.map(menuMarkup).join("");
    if (oneTap) oneTap.innerHTML = ONE_TAP_MENU.map(menuMarkup).join("");
  }

  function setText(documentRef, id, value) {
    const element = documentRef && documentRef.getElementById(id);
    if (element) element.textContent = String(value);
  }

  function renderSelfExpansion(documentRef, storage, now) {
    const report = buildExpansionReport(storage, now);
    setText(documentRef, "self-expansion-development", "Hashimoto Super Core Engine v5.0");
    setText(documentRef, "self-expansion-status", "Self Expansion System ON");
    setText(documentRef, "self-expansion-racing-os", PROTECTED_SYSTEM + " 統合済み");
    setText(documentRef, "self-expansion-release", "Official Release v2.8 Protected");
    setText(documentRef, "self-expansion-private", "Private Local Operation ON");
    setText(documentRef, "self-expansion-version", "v" + report.version.currentVersion);
    setText(documentRef, "self-expansion-score", report.version.releaseScore + "%");
    setText(documentRef, "self-expansion-phase", report.version.phaseStatus);
    setText(documentRef, "self-expansion-engine-count", report.version.addedEngines.length);
    renderPrivateLocalMenus(documentRef);
    return report;
  }

  function bindSelfExpansion(documentRef, storage) {
    renderSelfExpansion(documentRef, storage);
    const button = documentRef && documentRef.getElementById("run-self-expansion");
    if (button) button.addEventListener("click", function () {
      saveSelfExpansion(storage);
      renderSelfExpansion(documentRef, storage);
      setText(documentRef, "self-expansion-message", "Version 5.0 開発状態を保存しました");
    });
  }

  const api = {
    DEVELOPMENT_VERSION, OFFICIAL_RELEASE, PHASE, SYSTEM_NAME, PROTECTED_SYSTEM,
    DATABASES, ENGINE_MENU, ONE_TAP_MENU, RULES,
    buildVersionStatus, generateOneTapMenu, buildExpansionReport, saveSelfExpansion,
    renderPrivateLocalMenus, renderSelfExpansion, bindSelfExpansion
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HashimotoSelfExpansionEngine = api;
  if (global.document) {
    const start = function () { bindSelfExpansion(global.document, global.localStorage); };
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : globalThis);
