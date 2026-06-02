(() => {
  const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value || 0) * 10) / 10));
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const normalizeText = (value) => String(value || "").trim();
  const scorePresenceKeys = {
    aiIndex: ["aiIndex", "AI指数"],
    kamianaIndex: ["kamianaIndex", "神穴指数"],
    dangerIndex: ["dangerIndex", "危険人気馬指数"],
  };

  const hasScoreInput = (horse, field) => scorePresenceKeys[field].some((key) => {
    const value = horse?.[key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  const trainingBonus = (training) => ({ S: 12, A: 8, B: 4, C: -4, D: -9 }[normalizeText(training).toUpperCase()] ?? 0);
  const popularityBonus = (popularity) => {
    const rank = toNumber(popularity, 18);
    if (rank <= 1) return 14;
    if (rank <= 3) return 10;
    if (rank <= 5) return 6;
    if (rank <= 8) return 2;
    if (rank <= 12) return -1;
    return -4;
  };
  const oddsBonus = (odds) => {
    const value = toNumber(odds, 99);
    if (value <= 2.5) return 7;
    if (value <= 5) return 9;
    if (value <= 10) return 7;
    if (value <= 20) return 4;
    if (value <= 40) return 0;
    return -4;
  };
  const styleBonus = (style) => ({ 逃げ: 8, 先行: 7, 自在: 6, 差し: 5, 追込: 2 }[normalizeText(style)] ?? 3);
  const cornerBonus = (cornerPosition, fieldSize = 18) => {
    const position = toNumber(cornerPosition, fieldSize);
    const size = Math.max(1, toNumber(fieldSize, 18));
    const ratio = position / size;
    if (ratio <= 0.2) return 10;
    if (ratio <= 0.4) return 7;
    if (ratio <= 0.65) return 3;
    if (ratio <= 0.82) return -2;
    return -7;
  };
  const trackStyleBonus = (style, going) => {
    const runningStyle = normalizeText(style);
    const condition = normalizeText(going || "良");
    if (["重", "不良"].includes(condition)) return ["逃げ", "先行", "自在"].includes(runningStyle) ? 7 : -5;
    if (condition === "稍重") return ["先行", "自在", "差し"].includes(runningStyle) ? 4 : 0;
    return ["差し", "自在", "先行"].includes(runningStyle) ? 4 : runningStyle === "追込" ? 1 : 2;
  };
  const distanceBonus = (horse) => {
    const distance = toNumber(horse.distance ?? horse.raceDistance, 0);
    const style = normalizeText(horse.runningStyle);
    if (!distance) return -3;
    if (distance <= 1400) return ["逃げ", "先行"].includes(style) ? 6 : style === "追込" ? -3 : 3;
    if (distance <= 1800) return ["先行", "自在", "差し"].includes(style) ? 5 : 1;
    if (distance <= 2400) return ["自在", "差し", "先行"].includes(style) ? 4 : -1;
    return ["差し", "追込", "自在"].includes(style) ? 5 : -3;
  };
  const unfavorableStylePenalty = (horse) => {
    const fieldSize = toNumber(horse.fieldSize, 18);
    const style = normalizeText(horse.runningStyle);
    const corner = toNumber(horse.cornerPosition, fieldSize);
    let penalty = 0;
    if (["逃げ", "先行"].includes(style) && corner > Math.ceil(fieldSize * 0.45)) penalty += 10;
    if (["差し", "追込"].includes(style) && corner > Math.ceil(fieldSize * 0.75)) penalty += 8;
    if (style === "追込" && ["重", "不良"].includes(normalizeText(horse.going))) penalty += 6;
    return penalty;
  };

  const calculateRiskScore = (horse = {}) => {
    const popularity = toNumber(horse.popularity, 18);
    const odds = toNumber(horse.odds, 99);
    const fieldSize = toNumber(horse.fieldSize, 18);
    let score = 10;
    if (popularity <= 3 && odds <= 3) score += 28;
    else if (popularity <= 3 && odds <= 5) score += 22;
    else if (popularity <= 5 && odds <= 8) score += 14;
    score += unfavorableStylePenalty({ ...horse, fieldSize });
    if (cornerBonus(horse.cornerPosition, fieldSize) < 0) score += Math.abs(cornerBonus(horse.cornerPosition, fieldSize)) + 5;
    const training = normalizeText(horse.training).toUpperCase();
    if (training === "C") score += 12;
    if (training === "D" || !training) score += 18;
    if (trackStyleBonus(horse.runningStyle, horse.going) < 0) score += 12;
    if (!toNumber(horse.distance ?? horse.raceDistance, 0)) score += 10;
    return clampScore(score);
  };

  const calculateAiScore = (horse = {}) => {
    const riskPenalty = calculateRiskScore(horse) >= 80 ? 14 : calculateRiskScore(horse) >= 65 ? 8 : calculateRiskScore(horse) >= 50 ? 4 : 0;
    const total = 38
      + popularityBonus(horse.popularity)
      + oddsBonus(horse.odds)
      + styleBonus(horse.runningStyle)
      + cornerBonus(horse.cornerPosition, horse.fieldSize)
      + trainingBonus(horse.training)
      + trackStyleBonus(horse.runningStyle, horse.going)
      + distanceBonus(horse)
      - riskPenalty;
    return clampScore(total);
  };

  const calculateDarkHorseScore = (horse = {}) => {
    const popularity = toNumber(horse.popularity, 18);
    const odds = toNumber(horse.odds, 99);
    let score = 22;
    if (popularity >= 6 && popularity <= 9) score += 18;
    else if (popularity >= 10) score += 22;
    else if (popularity >= 4) score += 10;
    if (odds >= 8 && odds <= 20) score += 18;
    else if (odds > 20 && odds <= 50) score += 15;
    else if (odds > 50) score += 7;
    score += Math.max(0, styleBonus(horse.runningStyle) - 2);
    score += Math.max(0, cornerBonus(horse.cornerPosition, horse.fieldSize));
    score += Math.max(0, trainingBonus(horse.training));
    score += odds >= 12 ? 8 : odds >= 6 ? 4 : -5;
    score += calculateRiskScore(horse) < 50 ? 10 : calculateRiskScore(horse) >= 70 ? -14 : 0;
    return clampScore(score);
  };

  const calculateAllHorseScores = (horses = [], raceContext = {}) => horses.map((horse) => {
    const scoringBase = { ...raceContext, ...horse, fieldSize: raceContext.fieldSize || horse.fieldSize || horses.length || 18 };
    const aiManual = hasScoreInput(horse, "aiIndex");
    const kamianaManual = hasScoreInput(horse, "kamianaIndex");
    const dangerManual = hasScoreInput(horse, "dangerIndex");
    return {
      ...horse,
      aiIndex: aiManual ? clampScore(horse.aiIndex ?? horse["AI指数"]) : calculateAiScore(scoringBase),
      kamianaIndex: kamianaManual ? clampScore(horse.kamianaIndex ?? horse["神穴指数"]) : calculateDarkHorseScore(scoringBase),
      dangerIndex: dangerManual ? clampScore(horse.dangerIndex ?? horse["危険人気馬指数"]) : calculateRiskScore(scoringBase),
      scoreSource: {
        aiIndex: aiManual ? "manual" : "auto",
        kamianaIndex: kamianaManual ? "manual" : "auto",
        dangerIndex: dangerManual ? "manual" : "auto",
      },
    };
  });

  window.HashimotoKeibaAiScoreEngine = {
    calculateAiScore,
    calculateDarkHorseScore,
    calculateRiskScore,
    calculateAllHorseScores,
  };
  window.calculateAiScore = calculateAiScore;
  window.calculateDarkHorseScore = calculateDarkHorseScore;
  window.calculateRiskScore = calculateRiskScore;
  window.calculateAllHorseScores = calculateAllHorseScores;
})();

(() => {
  const STORAGE_KEY = "hashimoto-keiba-ai:self-evolution-logs:v1";
  const DATA_URL = "./data/selfEvolutionLogs.json";

  const form = document.querySelector("#self-evolution-form");
  const resetButton = document.querySelector("#reset-self-evolution-form");
  const list = document.querySelector("#self-evolution-required-log-list");
  const countLabel = document.querySelector("#self-evolution-required-count");
  const statusBadge = document.querySelector("#self-evolution-status");

  if (!form || !list) return;

  let currentItems = [];

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = (value) => value || new Date().toISOString().slice(0, 10);

  const createPayload = (items = [], provider = "localStorage") => ({
    storageVersion: 1,
    type: "selfEvolutionLogs",
    provider,
    description: "橋本競馬AIの自己進化ループログ。採用/保留/却下の判断と根拠レース、次回反映メモを管理します。",
    updatedAt: new Date().toISOString(),
    items,
    logs: {
      resultVerifications: [],
      backtests: [],
      improvementProposals: [],
    },
  });

  const normalizeItem = (item = {}, index = 0) => ({
    id: item.id || `self-evolution-${Date.now()}-${index}`,
    date: formatDate(item.date || item.createdAt?.slice(0, 10)),
    course: item.course || item.race?.course || item.filters?.course || "未設定",
    distance: item.distance || item.race?.distance || item.filters?.distance || "未設定",
    targetAi: item.targetAi || item.targetAI || item.ai || item.title || "AI指数エンジン",
    improvement: item.improvement || item.body || item.lesson || item.summary || "改善内容未設定",
    status: ["採用", "保留", "却下"].includes(item.status) ? item.status : "保留",
    evidenceRace: item.evidenceRace || item.raceName || item.race?.name || item.source || "根拠レース未設定",
    nextReflectionMemo: item.nextReflectionMemo || item.nextMemo || item.memo || item.action || "次回反映メモ未設定",
  });

  const extractItems = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload.items)) return payload.items.map(normalizeItem);

    const logs = payload.logs || {};
    const resultItems = (logs.resultVerifications || []).map((item) => normalizeItem({
      ...item,
      targetAi: "結果検証AI",
      improvement: item.lesson || item.summary,
      evidenceRace: item.raceName || item.race?.name,
      nextReflectionMemo: item.nextAction || item.memo,
      status: "保留",
    }));
    const backtestItems = (logs.backtests || []).map((item) => normalizeItem({
      ...item,
      targetAi: "AI精度テスト",
      improvement: item.improvements?.join(" / ") || item.summary,
      evidenceRace: `${item.filters?.course || "全競馬場"} バックテスト`,
      nextReflectionMemo: item.weaknesses?.join(" / ") || item.memo,
      status: "保留",
    }));
    const proposalItems = (logs.improvementProposals || []).map((item) => normalizeItem({
      ...item,
      targetAi: item.title,
      improvement: item.body,
      evidenceRace: item.source || "バックテスト改善提案",
      nextReflectionMemo: item.nextAction || item.body,
      status: "採用",
    }));

    return [...resultItems, ...backtestItems, ...proposalItems];
  };

  const readLocalPayload = () => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  };

  const writeLocalPayload = (items) => {
    const previousPayload = readLocalPayload();
    const payload = {
      ...createPayload(items, "localStorage"),
      logs: previousPayload?.logs || createPayload().logs,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  };

  const readJsonPayload = async () => {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`selfEvolutionLogs.json ${response.status}`);
    return response.json();
  };

  const renderLogs = (items, sourceLabel) => {
    currentItems = items;
    const statusCounts = items.reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, { 採用: 0, 保留: 0, 却下: 0 });

    if (countLabel) {
      countLabel.textContent = `${sourceLabel} / ${items.length}件（採用${statusCounts.採用 || 0}・保留${statusCounts.保留 || 0}・却下${statusCounts.却下 || 0}）`;
    }
    if (statusBadge) {
      statusBadge.textContent = `${items.length} SELF EVOLUTION LOGS`;
    }

    list.innerHTML = items.length ? items.map((item) => `
      <article class="self-evolution-required-card self-evolution-required-card--${escapeHtml(item.status)}">
        <div class="self-evolution-required-card__meta">
          <span>${escapeHtml(item.date)}</span>
          <span>${escapeHtml(item.course)} / ${escapeHtml(item.distance)}</span>
          <strong>${escapeHtml(item.status)}</strong>
        </div>
        <h3>${escapeHtml(item.targetAi)}</h3>
        <dl>
          <div><dt>改善対象AI</dt><dd>${escapeHtml(item.targetAi)}</dd></div>
          <div><dt>改善内容</dt><dd>${escapeHtml(item.improvement)}</dd></div>
          <div><dt>採用/保留/却下</dt><dd>${escapeHtml(item.status)}</dd></div>
          <div><dt>根拠レース</dt><dd>${escapeHtml(item.evidenceRace)}</dd></div>
          <div><dt>次回反映メモ</dt><dd>${escapeHtml(item.nextReflectionMemo)}</dd></div>
        </dl>
      </article>
    `).join("") : '<p class="self-evolution-empty">自己進化ログがまだありません。フォームから改善内容を追加してください。</p>';
  };

  const loadAndRender = async () => {
    const localPayload = readLocalPayload();
    if (localPayload) {
      renderLogs(extractItems(localPayload), "localStorage");
      return;
    }

    const jsonPayload = await readJsonPayload();
    const items = extractItems(jsonPayload);
    renderLogs(items, "data/selfEvolutionLogs.json");
  };

  const resetForm = () => {
    form.reset();
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    form.elements.status.value = "採用";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const existingItems = extractItems(readLocalPayload());
    const baseItems = existingItems.length ? existingItems : currentItems;
    const newItem = normalizeItem({
      ...values,
      id: `self-evolution-${values.date}-${values.course}-${Date.now()}`,
    });
    const payload = writeLocalPayload([newItem, ...baseItems].slice(0, 100));
    renderLogs(extractItems(payload), "localStorageへ追加保存済み");
    resetForm();
  });

  resetButton?.addEventListener("click", resetForm);
  resetForm();
  loadAndRender().catch((error) => {
    renderLogs([], `読込エラー: ${error.message}`);
  });
})();

(() => {
  const form = document.querySelector("#pages-check-form");
  const urlInput = document.querySelector("#pages-public-url");
  const helpText = document.querySelector("#pages-check-help");
  const overall = document.querySelector("#pages-check-overall");
  const items = Array.from(document.querySelectorAll("[data-pages-check]"));

  if (!form || !urlInput || !items.length) return;

  const STORAGE_KEY = "hashimoto-keiba-ai:pages-public-url:v1";
  try {
    const savedUrl = window.localStorage.getItem(STORAGE_KEY);
    if (savedUrl) urlInput.value = savedUrl;
  } catch (_) {
    // localStorage availability is checked explicitly in the panel.
  }

  const setStatus = (key, status, detail = "") => {
    const item = items.find((entry) => entry.dataset.pagesCheck === key);
    if (!item) return;
    const badge = item.querySelector(".pages-check-status");
    const small = item.querySelector("small");
    const label = status === "ok" ? "OK" : status === "warning" ? "注意" : "未確認";
    badge.textContent = label;
    badge.className = `pages-check-status pages-check-status--${status}`;
    if (detail && small) small.textContent = detail;
  };

  const toBaseUrl = () => {
    const raw = urlInput.value.trim() || window.location.href;
    const parsed = new URL(raw, window.location.href);
    if (!parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/[^/]*$/, "/");
    }
    parsed.search = "";
    parsed.hash = "";
    return parsed;
  };

  const assetUrl = (baseUrl, path) => new URL(path, baseUrl).toString();

  const fetchText = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`.trim());
    return response.text();
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`.trim());
    return response.json();
  };

  const checkLocalStorage = () => {
    const key = "hashimoto-keiba-ai:pages-check:test";
    window.localStorage.setItem(key, "ok");
    const isAvailable = window.localStorage.getItem(key) === "ok";
    window.localStorage.removeItem(key);
    if (!isAvailable) throw new Error("読み書き結果を確認できませんでした");
  };

  const updateOverall = () => {
    const statuses = items.map((item) => item.querySelector(".pages-check-status")?.textContent || "未確認");
    const okCount = statuses.filter((status) => status === "OK").length;
    const warningCount = statuses.filter((status) => status === "注意").length;
    overall.textContent = warningCount ? `注意 ${warningCount}件 / OK ${okCount}件` : `OK ${okCount}/${statuses.length}`;
    overall.classList.toggle("status-pill--live", okCount === statuses.length);
    overall.classList.toggle("status-pill--danger", warningCount > 0);
  };

  const runCheck = async () => {
    items.forEach((item) => setStatus(item.dataset.pagesCheck, "unchecked"));
    overall.textContent = "確認中";
    overall.classList.remove("status-pill--live", "status-pill--danger");

    const baseUrl = toBaseUrl();
    const base = baseUrl.toString();
    if (urlInput.value.trim()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, urlInput.value.trim());
      } catch (_) {
        // Do not stop the public asset checks when URL persistence is blocked.
      }
    }
    helpText.textContent = `チェック基準URL: ${base}`;

    let indexText = "";
    let cssText = "";

    try {
      indexText = await fetchText(assetUrl(baseUrl, "index.html"));
      setStatus("index", indexText.includes("橋本競馬AI") ? "ok" : "warning", indexText.includes("橋本競馬AI") ? "index.htmlを取得しました" : "HTMLは取得できましたがタイトル確認が必要です");
    } catch (error) {
      setStatus("index", "warning", `index.html取得エラー: ${error.message}`);
    }

    try {
      cssText = await fetchText(assetUrl(baseUrl, "src/dashboard.css"));
      setStatus("css", cssText.includes("--gold") && cssText.includes("--bg") ? "ok" : "warning", cssText.includes("--gold") ? "黒×金デザインCSSを取得しました" : "CSSは取得できましたが黒×金設定の確認が必要です");
    } catch (error) {
      setStatus("css", "warning", `CSS取得エラー: ${error.message}`);
    }

    try {
      const jsText = await fetchText(assetUrl(baseUrl, "src/dashboard.js"));
      setStatus("javascript", jsText.includes("pages-check-form") || jsText.includes("self-evolution" ) ? "ok" : "warning", "JavaScriptファイルを取得しました");
    } catch (error) {
      setStatus("javascript", "warning", `JavaScript取得エラー: ${error.message}`);
    }

    try {
      const manifest = await fetchJson(assetUrl(baseUrl, "manifest.json"));
      setStatus("manifest", manifest.name || manifest.short_name ? "ok" : "warning", manifest.name || manifest.short_name ? "manifest.jsonをJSONとして取得しました" : "manifest.jsonのname設定を確認してください");
    } catch (error) {
      setStatus("manifest", "warning", `manifest取得エラー: ${error.message}`);
    }

    try {
      const data = await fetchJson(assetUrl(baseUrl, "data/selfEvolutionLogs.json"));
      setStatus("data-json", data && typeof data === "object" ? "ok" : "warning", "data/selfEvolutionLogs.jsonをJSONとして取得しました");
    } catch (error) {
      setStatus("data-json", "warning", `data JSON取得エラー: ${error.message}`);
    }

    try {
      checkLocalStorage();
      setStatus("localstorage", "ok", "localStorageへテスト書き込みできました");
    } catch (error) {
      setStatus("localstorage", "warning", `localStorage利用不可: ${error.message}`);
    }

    const hasViewport = indexText.includes('name="viewport"') || indexText.includes("name='viewport'");
    const hasIpadCss = cssText.includes("max-width: 1180px") && cssText.includes("device-command-ui");
    setStatus("ipad", hasViewport && hasIpadCss ? "ok" : "warning", hasViewport && hasIpadCss ? "iPad用クイックUIとviewport設定を確認しました" : "iPad幅の表示は実機Safariでも確認してください");

    const hasSmartphoneCss = cssText.includes("max-width: 760px") || cssText.includes("max-width: 560px");
    setStatus("smartphone", hasViewport && hasSmartphoneCss ? "ok" : "warning", hasViewport && hasSmartphoneCss ? "スマホ用media queryとviewport設定を確認しました" : "スマホ表示は実機でも確認してください");

    updateOverall();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runCheck();
  });

  if (document.readyState === "complete") {
    runCheck();
  } else {
    window.addEventListener("load", runCheck, { once: true });
  }
})();
