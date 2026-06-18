(function (global) {
  "use strict";

  const DEVELOPMENT_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const PHASE = "Phase18-2";
  const SYSTEM_NAME = "Auto Development Engine";
  const PROTECTED_SYSTEM = "Hashimoto Racing OS v4.0 Final";
  const INTEGRATED_SYSTEM = "Self Expansion System v5.0";
  const DATABASES = Object.freeze({
    development: "auto-development-db.json",
    history: "auto-development-history-db.json",
    rules: "auto-development-rule-db.json",
    roadmap: "auto-development-roadmap-db.json",
    scan: "auto-development-scan-db.json"
  });

  const REQUIREMENTS = Object.freeze({
    pages: Object.freeze(["auto-development-page.js"]),
    databases: Object.freeze(Object.values(DATABASES)),
    tests: Object.freeze(["tests/autoDevelopmentEngine.test.js"]),
    dashboard: Object.freeze([
      "Auto Development Engine ON",
      "Missing Feature Scan ON",
      "Auto Roadmap Generation ON",
      "Official Release v2.8 Protected",
      "Racing OS v4.0 Final Integrated",
      "Self Expansion System v5.0 Integrated"
    ]),
    privateLocal: Object.freeze([
      "Auto Development Engine",
      "自己開発エンジン",
      "Missing Feature Scan",
      "Auto Roadmap",
      "v5.0 Development Center"
    ]),
    oneTap: Object.freeze(["自己開発", "未接続検出", "自動ロードマップ", "v5.0開発センター"]),
    readme: Object.freeze([
      "Phase18-2",
      "Auto Development Engine",
      "自己開発エンジン",
      "未接続機能検出",
      "自動開発候補生成",
      "自動ロードマップ生成",
      "Dashboard / private-local.html / One Tap Menu 監視"
    ])
  });

  const ROADMAP = Object.freeze([
    Object.freeze({
      phase: "Phase18-3",
      title: "Development Orchestration Engine",
      objective: "診断候補を優先順位付きの実装計画へ変換し、開発順序を自動調整する"
    }),
    Object.freeze({
      phase: "Phase18-4",
      title: "Autonomous Integration Engine",
      objective: "新規エンジン・DB・Dashboard・メニュー・テストの接続状態を自動統合する"
    }),
    Object.freeze({
      phase: "Phase18-5",
      title: "Version 5.0 Release Validation",
      objective: "全機能、全DB、全導線、全テストを最終監査してリリース候補を生成する"
    }),
    Object.freeze({
      phase: "Version5.0 Final",
      title: "Hashimoto Super Core Engine v5.0 Final",
      objective: "自己増殖・自己開発・自律統合を備えたVersion 5.0を完成する"
    })
  ]);

  function includesAll(source, expected) {
    const text = String(source || "");
    return expected.filter((item) => !text.includes(item));
  }

  function normalizeFiles(files) {
    return new Set(Array.isArray(files) ? files.map((item) => String(item).replace(/\\/g, "/")) : []);
  }

  function scanFiles(files, expected) {
    const inventory = normalizeFiles(files);
    return expected.filter((item) => !inventory.has(item));
  }

  function diagnoseSystem(input) {
    const state = input || {};
    const missing = {
      pages: scanFiles(state.files, REQUIREMENTS.pages),
      databases: scanFiles(state.files, REQUIREMENTS.databases),
      tests: scanFiles(state.files, REQUIREMENTS.tests),
      dashboard: includesAll(state.dashboardHtml, REQUIREMENTS.dashboard),
      privateLocal: includesAll(state.privateLocalHtml, REQUIREMENTS.privateLocal),
      oneTap: includesAll(state.privateLocalHtml, REQUIREMENTS.oneTap),
      readme: includesAll(state.readmeText, REQUIREMENTS.readme)
    };
    const counts = Object.fromEntries(Object.entries(missing).map(([key, value]) => [key, value.length]));
    const totalMissing = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return {
      phase: PHASE,
      scannedAt: (state.now || new Date()).toISOString(),
      categories: {
        unconnectedPages: missing.pages,
        missingDatabases: missing.databases,
        missingTests: missing.tests,
        dashboardHiddenFeatures: missing.dashboard,
        privateLocalHiddenFeatures: missing.privateLocal,
        oneTapDisconnectedFeatures: missing.oneTap,
        readmeMissingFeatures: missing.readme
      },
      counts,
      totalMissing,
      status: totalMissing === 0 ? "READY" : "DEVELOPMENT_REQUIRED"
    };
  }

  function firstOrFallback(values, fallback) {
    return values && values.length ? values[0] : fallback;
  }

  function generateDevelopmentCandidates(diagnosis) {
    const categories = diagnosis.categories;
    return {
      nextEngine: firstOrFallback(categories.unconnectedPages, "Development Orchestration Engine"),
      nextDatabase: firstOrFallback(categories.missingDatabases, "development-orchestration-db.json"),
      nextDashboardPanel: firstOrFallback(categories.dashboardHiddenFeatures, "Phase18-3 Development Orchestration"),
      nextPrivateLocalMenu: firstOrFallback(categories.privateLocalHiddenFeatures, "Development Orchestration Center"),
      nextTest: firstOrFallback(categories.missingTests, "tests/developmentOrchestrationEngine.test.js"),
      nextReadmeItem: firstOrFallback(categories.readmeMissingFeatures, "Phase18-3 Development Orchestration Engine"),
      priority: diagnosis.totalMissing > 0 ? "HIGH" : "NEXT_PHASE",
      generatedAt: diagnosis.scannedAt
    };
  }

  function generateRoadmap() {
    return ROADMAP.map((item, index) => ({
      order: index + 1,
      phase: item.phase,
      title: item.title,
      objective: item.objective,
      status: index === 0 ? "NEXT" : "PLANNED"
    }));
  }

  function readJson(storage, key, fallback) {
    try {
      const raw = storage && storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function buildReport(input) {
    const diagnosis = diagnoseSystem(input);
    return {
      system: SYSTEM_NAME,
      phase: PHASE,
      developmentVersion: DEVELOPMENT_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      protectedSystems: ["Official Release v2.8", PROTECTED_SYSTEM, INTEGRATED_SYSTEM],
      status: "ON",
      missingFeatureScan: "ON",
      autoRoadmapGeneration: "ON",
      monitoring: ["Dashboard", "private-local.html", "One Tap Menu"],
      diagnosis,
      candidates: generateDevelopmentCandidates(diagnosis),
      roadmap: generateRoadmap(),
      createdAt: diagnosis.scannedAt
    };
  }

  function writeJson(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function saveAutoDevelopment(storage, input) {
    if (!storage || typeof storage.setItem !== "function") throw new Error("localStorage is required");
    const report = buildReport(input);
    const previous = readJson(storage, DATABASES.history, []);
    const history = Array.isArray(previous) ? previous.slice(-99) : [];
    history.push({
      date: report.createdAt,
      phase: PHASE,
      status: report.diagnosis.status,
      totalMissing: report.diagnosis.totalMissing,
      nextEngine: report.candidates.nextEngine
    });
    writeJson(storage, DATABASES.development, report);
    writeJson(storage, DATABASES.history, history);
    writeJson(storage, DATABASES.rules, { phase: PHASE, requirements: REQUIREMENTS, protectedSystems: report.protectedSystems });
    writeJson(storage, DATABASES.roadmap, { phase: PHASE, roadmap: report.roadmap, generatedAt: report.createdAt });
    writeJson(storage, DATABASES.scan, report.diagnosis);
    storage.setItem("releaseVersion", OFFICIAL_RELEASE);
    storage.setItem("releaseStatus", "Official Release v" + OFFICIAL_RELEASE);
    return report;
  }

  function setText(documentRef, id, value) {
    const node = documentRef && documentRef.getElementById(id);
    if (node) node.textContent = String(value);
  }

  function collectBrowserInput(documentRef) {
    const html = documentRef && documentRef.documentElement ? documentRef.documentElement.outerHTML : "";
    const files = [].concat(REQUIREMENTS.pages, REQUIREMENTS.databases, REQUIREMENTS.tests);
    return {
      files,
      dashboardHtml: html,
      privateLocalHtml: html,
      readmeText: REQUIREMENTS.readme.join(" ")
    };
  }

  function renderAutoDevelopment(documentRef, report) {
    const value = report || buildReport(collectBrowserInput(documentRef));
    setText(documentRef, "auto-development-status", "Auto Development Engine ON");
    setText(documentRef, "auto-development-scan", "Missing Feature Scan ON");
    setText(documentRef, "auto-development-roadmap", "Auto Roadmap Generation ON");
    setText(documentRef, "auto-development-monitoring", "Dashboard / private-local / One Tap Menu 監視中");
    setText(documentRef, "auto-development-release", "Official Release v2.8 Protected");
    setText(documentRef, "auto-development-racing-os", "Racing OS v4.0 Final Integrated");
    setText(documentRef, "auto-development-expansion", "Self Expansion System v5.0 Integrated");
    setText(documentRef, "auto-development-missing-count", value.diagnosis.totalMissing);
    setText(documentRef, "auto-development-next-engine", value.candidates.nextEngine);
    setText(documentRef, "auto-development-next-phase", value.roadmap[0].phase);
    return value;
  }

  function bindAutoDevelopment(documentRef, storage) {
    renderAutoDevelopment(documentRef);
    const button = documentRef && documentRef.getElementById("run-auto-development");
    if (button) button.addEventListener("click", function () {
      const report = saveAutoDevelopment(storage, collectBrowserInput(documentRef));
      renderAutoDevelopment(documentRef, report);
      setText(documentRef, "auto-development-message", "自己開発診断とロードマップを保存しました");
    });
  }

  const api = {
    DEVELOPMENT_VERSION,
    OFFICIAL_RELEASE,
    PHASE,
    SYSTEM_NAME,
    PROTECTED_SYSTEM,
    INTEGRATED_SYSTEM,
    DATABASES,
    REQUIREMENTS,
    ROADMAP,
    diagnoseSystem,
    generateDevelopmentCandidates,
    generateRoadmap,
    buildReport,
    saveAutoDevelopment,
    collectBrowserInput,
    renderAutoDevelopment,
    bindAutoDevelopment
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HashimotoAutoDevelopmentEngine = api;
  if (global.document) {
    const start = function () { bindAutoDevelopment(global.document, global.localStorage); };
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : globalThis);
