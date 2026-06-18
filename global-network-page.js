(() => {
  "use strict";

  const OS_VERSION = "4.0";
  const OFFICIAL_RELEASE = "2.8";
  const PHASE = "Phase17-4";
  const NETWORK_NAME = "Global Intelligence Network";
  const DATABASE_KEYS = Object.freeze({
    network: "global-network-db.json",
    learning: "global-learning-db.json",
    pattern: "global-pattern-db.json",
    future: "global-future-db.json",
    evolution: "global-evolution-db.json",
    history: "global-history-db.json"
  });
  const SOURCE_KEYS = Object.freeze([
    "integrated-os.json", "prediction-engine.json", "learning-engine.json",
    "research-lab-db.json", "course-research-db.json", "jockey-research-db.json",
    "trainer-research-db.json", "lap-research-db.json", "self-evolution-db.json",
    "evolution-rule-db.json", "success-pattern-db.json", "failure-pattern-db.json",
    "profit-db.json", "return-ai-db.json", "return-rate-db.json", "bankroll-db.json",
    "win5-db.json", "win5-pattern-db.json", "auto-review-db.json", "history-db.json"
  ]);
  const SHARE_FLOW = Object.freeze([
    "知識共有", "学習共有", "研究共有", "成功パターン共有", "失敗パターン共有",
    "未来予測共有", "自己進化共有"
  ]);

  const readPayload = (storage, key) => {
    try {
      const raw = storage?.getItem?.(key);
      if (!raw) return [];
      const value = JSON.parse(raw);
      if (Array.isArray(value)) return value;
      if (Array.isArray(value.records)) return value.records;
      if (Array.isArray(value.items)) return value.items;
      return value && typeof value === "object" ? [value] : [];
    } catch (_) {
      return [];
    }
  };

  const writeRecords = (storage, key, records) => {
    storage?.setItem?.(key, JSON.stringify({
      databaseName: key.replace(/\.json$/, ""),
      osVersion: OS_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      phase: PHASE,
      storageKey: key,
      records
    }, null, 2));
    return records;
  };

  const unique = (items) => [...new Set(items.filter(Boolean).map((item) => String(item)))];
  const pickValues = (records, fields) => unique(records.flatMap((record) => fields.map((field) => record?.[field])));
  const nowIso = (now) => (typeof now === "function" ? now() : new Date()).toISOString();

  const collectNetworkSources = ({ storage = globalThis.localStorage } = {}) => SOURCE_KEYS.map((key) => {
    const records = readPayload(storage, key);
    return { key, recordCount: records.length, connected: records.length > 0, records };
  });

  const buildNetworkReport = ({ storage = globalThis.localStorage, now = () => new Date() } = {}) => {
    const sources = collectNetworkSources({ storage });
    const allRecords = sources.flatMap((source) => source.records);
    const successPatterns = pickValues(allRecords.filter((r) => r.hit === true || r.success === true), ["pattern", "learnedRule", "trifectaPattern", "win5Pattern"]);
    const failurePatterns = pickValues(allRecords.filter((r) => r.hit === false || r.success === false || r.failureReason), ["failureReason", "pattern", "learnedRule", "reviewText"]);
    const knowledge = pickValues(allRecords, ["knowledge", "memo", "notes", "reviewText", "updateText"]);
    const learning = pickValues(allRecords, ["learning", "learnedRule", "rule", "update"]);
    const research = pickValues(allRecords, ["research", "theme", "finding", "analysis"]);
    const futures = pickValues(allRecords, ["prediction", "future", "forecast", "recommendedRace"]);
    const evolutions = pickValues(allRecords, ["evolutionRule", "learnedRule", "updateText", "update"]);
    const connectedCount = sources.filter((source) => source.connected).length;
    return {
      id: `gin-${Date.parse(nowIso(now))}`,
      phase: PHASE,
      name: NETWORK_NAME,
      osVersion: OS_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      generatedAt: nowIso(now),
      status: connectedCount ? "ONLINE" : "STANDBY",
      connectedEngineCount: connectedCount,
      totalSourceCount: sources.length,
      totalRecordCount: allRecords.length,
      sharedKnowledgeCount: knowledge.length,
      sharedLearningCount: learning.length,
      sharedResearchCount: research.length,
      successPatternCount: successPatterns.length,
      failurePatternCount: failurePatterns.length,
      futurePredictionCount: futures.length,
      evolutionRuleCount: evolutions.length,
      shareFlow: [...SHARE_FLOW],
      sources: sources.map(({ key, recordCount, connected }) => ({ key, recordCount, connected })),
      knowledge, learning, research, successPatterns, failurePatterns, futures, evolutions
    };
  };

  const saveGlobalNetwork = ({ storage = globalThis.localStorage, report = buildNetworkReport({ storage }) } = {}) => {
    const prepend = (key, record) => writeRecords(storage, key, [record, ...readPayload(storage, key)].slice(0, 500));
    prepend(DATABASE_KEYS.network, report);
    prepend(DATABASE_KEYS.learning, { generatedAt: report.generatedAt, knowledge: report.knowledge, learning: report.learning, research: report.research });
    prepend(DATABASE_KEYS.pattern, { generatedAt: report.generatedAt, successPatterns: report.successPatterns, failurePatterns: report.failurePatterns });
    prepend(DATABASE_KEYS.future, { generatedAt: report.generatedAt, predictions: report.futures, sourceCount: report.totalSourceCount });
    prepend(DATABASE_KEYS.evolution, { generatedAt: report.generatedAt, rules: report.evolutions, shareFlow: report.shareFlow });
    prepend(DATABASE_KEYS.history, {
      generatedAt: report.generatedAt, status: report.status, connectedEngineCount: report.connectedEngineCount,
      totalRecordCount: report.totalRecordCount, sharedKnowledgeCount: report.sharedKnowledgeCount,
      successPatternCount: report.successPatternCount, failurePatternCount: report.failurePatternCount,
      futurePredictionCount: report.futurePredictionCount, evolutionRuleCount: report.evolutionRuleCount
    });
    return report;
  };

  const setText = (documentRef, id, value) => {
    const element = documentRef?.getElementById?.(id);
    if (element) element.textContent = value;
  };
  const renderGlobalNetwork = ({ storage = globalThis.localStorage, documentRef = globalThis.document } = {}) => {
    const report = buildNetworkReport({ storage });
    setText(documentRef, "global-network-status", report.status);
    setText(documentRef, "global-network-engines", `${report.connectedEngineCount}/${report.totalSourceCount}`);
    setText(documentRef, "global-network-knowledge", report.sharedKnowledgeCount);
    setText(documentRef, "global-network-patterns", report.successPatternCount + report.failurePatternCount);
    setText(documentRef, "global-network-futures", report.futurePredictionCount);
    setText(documentRef, "global-network-evolution", report.evolutionRuleCount);
    setText(documentRef, "global-network-updated", new Date(report.generatedAt).toLocaleString("ja-JP"));
    return report;
  };
  const bindGlobalNetwork = ({ storage = globalThis.localStorage, documentRef = globalThis.document } = {}) => {
    if (!documentRef?.getElementById) return;
    documentRef.getElementById("run-global-network")?.addEventListener("click", () => {
      const report = saveGlobalNetwork({ storage, report: buildNetworkReport({ storage }) });
      setText(documentRef, "global-network-message", `統合共有を保存しました（${report.totalRecordCount}件）`);
      renderGlobalNetwork({ storage, documentRef });
    });
    renderGlobalNetwork({ storage, documentRef });
  };

  const api = { OS_VERSION, OFFICIAL_RELEASE, PHASE, NETWORK_NAME, DATABASE_KEYS, SOURCE_KEYS, SHARE_FLOW, readPayload, collectNetworkSources, buildNetworkReport, saveGlobalNetwork, renderGlobalNetwork, bindGlobalNetwork };
  if (typeof window !== "undefined") window.HashimotoGlobalNetworkEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindGlobalNetwork());
})();
