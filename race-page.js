(() => {
  const VERSION = "2.6";
  const STORAGE_KEYS = {
    history: "history-db.json",
    course: "course-db.json",
    distance: "distance-db.json",
    profit: "profit-db.json",
    returnAi: "return-ai-db.json",
    learning: "learning-engine.json"
  };
  const FLOW_STEPS = [
    "結果入力",
    "事前予想と照合",
    "検証を生成",
    "アップデート内容を生成",
    "history-db.jsonへ保存",
    "course-db.jsonへ保存",
    "distance-db.jsonへ保存",
    "profit-db.jsonへ保存",
    "return-ai-db.jsonへ保存",
    "learning-engine.jsonへ保存"
  ];
  const LEARNING_ITEMS = [
    "危険人気馬",
    "神穴馬",
    "人気ゾーン",
    "騎手傾向",
    "調教師傾向",
    "コース傾向",
    "距離傾向",
    "三連単構造",
    "WIN5構造"
  ];
  const EVOLUTION_HISTORY = [
    "v1.0 基本版",
    "v1.1 Console化",
    "v1.2 競馬場メニュー",
    "v1.2.1 レイアウト整理",
    "v1.3 R1～R12管理",
    "v1.4 JSON保存",
    "v1.5 自己進化DB",
    "v1.6 全競馬場統合AI",
    "v1.7 回収率AI",
    "v1.8 自動学習AI",
    "v1.9 予想生成AI",
    "v2.0 橋本競馬AI統合OS",
    "v2.1 AI秘書システム",
    "v2.2 万馬券探索AI",
    "v2.3 WIN5完全自動化AI",
    "v2.4 回収率管理AI",
    "v2.5 AI研究所",
    "v2.6 自己進化エンジン"
  ];
  const DEFAULT_RESULT = Object.freeze({
    date: "2026-06-14",
    course: "東京競馬場",
    race: "11R",
    prediction: "AI指数上位＋神穴馬を三連単フォーメーションで評価",
    result: "自動学習用サンプル結果",
    beforeScore: 91,
    afterScore: 111,
    hit: true,
    returnRate: 148.6,
    trifectaPattern: "1着軸→相手2頭→穴3頭",
    win5Pattern: "A軸固定＋Bゾーン2点"
  });

  const readJson = (storage, key, fallback = []) => {
    try {
      const raw = storage?.getItem?.(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : Array.isArray(parsed.records) ? parsed.records : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const writeRecords = (storage, key, records) => {
    storage?.setItem?.(key, JSON.stringify({ version: VERSION, storageKey: key, records }, null, 2));
    return records;
  };
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const todayString = () => new Date().toISOString().slice(0, 10);

  const buildGeneratedLearningItems = (record) => ({
    dangerPopular: record.hit ? 1 : 2,
    kamiAna: record.returnRate >= 120 ? 1 : 0,
    popularityZone: record.returnRate >= 100 ? "Bゾーン強化" : "Aゾーン過信抑制",
    jockeyTrend: `${record.course}の継続騎乗を評価`,
    trainerTrend: "厩舎仕上げと当日気配を次回補正",
    courseTrend: `${record.course}の馬場バイアスを保存`,
    distanceTrend: `${record.race}の距離適性を再評価`,
    trifectaStructure: record.trifectaPattern,
    win5Structure: record.win5Pattern
  });

  const buildLearningRecord = (input = {}) => {
    const base = { ...DEFAULT_RESULT, ...input };
    const beforeScore = toNumber(base.beforeScore, 0);
    const afterScore = toNumber(base.afterScore, beforeScore);
    const hit = Boolean(base.hit);
    const returnRate = toNumber(base.returnRate, 0);
    const record = {
      date: base.date || todayString(),
      course: base.course || "未設定競馬場",
      race: base.race || "未設定R",
      prediction: base.prediction || "事前予想未設定",
      result: base.result || "結果未入力",
      review: hit ? `的中。回収率${returnRate}%の要因を自動検証。` : `不的中。予想と結果の差分を自動検証。`,
      update: afterScore >= beforeScore ? "勝ちパターンを強化し、低回収条件を抑制。" : "過信条件を弱化し、見送り条件を追加。",
      learnedRule: `${base.course || "競馬場"} ${base.race || "レース"}: ${hit ? "的中構造を強化" : "不的中構造を抑制"}`,
      beforeScore,
      afterScore,
      hit,
      returnRate,
      trifectaPattern: base.trifectaPattern || "三連単構造未設定",
      win5Pattern: base.win5Pattern || "WIN5構造未設定",
      aiMemo: base.aiMemo || LEARNING_ITEMS.map((item) => `${item}を自動学習`).join(" / ")
    };
    return { ...record, generatedItems: buildGeneratedLearningItems(record), savedAt: new Date().toISOString() };
  };

  const buildAutomaticLearningFlow = (input = {}) => ({
    version: VERSION,
    theme: "自動学習AI",
    steps: FLOW_STEPS,
    learningItems: LEARNING_ITEMS,
    record: buildLearningRecord(input)
  });

  const saveLearningResult = ({ storage = window.localStorage, record = buildLearningRecord() } = {}) => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      const records = readJson(storage, key, []);
      writeRecords(storage, key, [record, ...records].slice(0, 300));
    });
    return record;
  };

  const applyAiUpdate = ({ storage = window.localStorage } = {}) => {
    const records = readJson(storage, STORAGE_KEYS.learning, []);
    const latest = records[0] || buildLearningRecord();
    const update = {
      version: VERSION,
      appliedAt: new Date().toISOString(),
      status: "AIアップデート反映済み",
      learnedRule: latest.learnedRule,
      afterScore: latest.afterScore
    };
    storage?.setItem?.("ai-learning-update-status", JSON.stringify(update));
    return update;
  };

  const buildLearningStatus = ({ storage = window.localStorage, today = todayString() } = {}) => {
    const records = readJson(storage, STORAGE_KEYS.learning, []);
    const hitRecords = records.filter((record) => record.hit);
    return {
      totalLearningCount: records.length,
      todayLearningCount: records.filter((record) => record.date === today).length,
      hitLearningCount: hitRecords.length,
      returnRateImprovement: records.reduce((sum, record) => sum + (toNumber(record.afterScore) - toNumber(record.beforeScore)), 0),
      dangerPopularCount: records.reduce((sum, record) => sum + toNumber(record.generatedItems?.dangerPopular, record.aiMemo?.includes("危険人気馬") ? 1 : 0), 0),
      kamiAnaCount: records.reduce((sum, record) => sum + toNumber(record.generatedItems?.kamiAna, record.aiMemo?.includes("神穴馬") ? 1 : 0), 0),
      trifectaPatternCount: new Set(records.map((record) => record.trifectaPattern).filter(Boolean)).size,
      win5PatternCount: new Set(records.map((record) => record.win5Pattern).filter(Boolean)).size
    };
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };
  const fillList = (id, items, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  };

  const renderLearningStatus = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const status = buildLearningStatus({ storage });
    setText("learning-total-count", status.totalLearningCount, documentRef);
    setText("learning-today-count", status.todayLearningCount, documentRef);
    setText("learning-hit-count", status.hitLearningCount, documentRef);
    setText("learning-return-improvement", status.returnRateImprovement, documentRef);
    setText("learning-danger-count", status.dangerPopularCount, documentRef);
    setText("learning-kamiana-count", status.kamiAnaCount, documentRef);
    setText("learning-trifecta-count", status.trifectaPatternCount, documentRef);
    setText("learning-win5-count", status.win5PatternCount, documentRef);
    fillList("automatic-learning-flow", FLOW_STEPS, documentRef);
    fillList("automatic-learning-items", LEARNING_ITEMS, documentRef);
    fillList("ai-evolution-history", EVOLUTION_HISTORY, documentRef);
    return status;
  };

  const bindRaceLearningButtons = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    let currentFlow = buildAutomaticLearningFlow();
    const statusText = (value) => setText("learning-action-status", value, documentRef);
    documentRef.getElementById("run-auto-learning")?.addEventListener("click", () => {
      currentFlow = buildAutomaticLearningFlow();
      statusText("自動学習フローを生成しました");
      renderLearningStatus({ storage, documentRef });
    });
    documentRef.getElementById("save-learning-result")?.addEventListener("click", () => {
      saveLearningResult({ storage, record: currentFlow.record });
      statusText("学習結果を各DBへ保存しました");
      renderLearningStatus({ storage, documentRef });
    });
    documentRef.getElementById("apply-ai-update")?.addEventListener("click", () => {
      const update = applyAiUpdate({ storage });
      statusText(`${update.status}: ${update.learnedRule}`);
      renderLearningStatus({ storage, documentRef });
    });
    renderLearningStatus({ storage, documentRef });
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => bindRaceLearningButtons());
  }

  const api = {
    VERSION,
    STORAGE_KEYS,
    FLOW_STEPS,
    LEARNING_ITEMS,
    EVOLUTION_HISTORY,
    buildLearningRecord,
    buildAutomaticLearningFlow,
    saveLearningResult,
    applyAiUpdate,
    buildLearningStatus,
    renderLearningStatus,
    bindRaceLearningButtons
  };
  if (typeof window !== "undefined") window.HashimotoAutomaticLearningEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})();
