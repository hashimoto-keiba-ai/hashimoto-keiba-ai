(function () {
  const PHASE = "Phase20-8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const RELEASE_STATUS = "Official Release v2.8 Protected";

  const basePolicy = {
    phase: PHASE,
    mode: "Phase20-8 Activation / PLAN_ONLY",
    executionPolicy: EXECUTION_POLICY,
    protectionPolicy: PROTECTION_POLICY,
    externalSend: "Disabled",
    autoUpdate: "Disabled",
    repositoryPolicy: "Private repository premise",
    githubPagesPolicy: "No GitHub Pages setting changes"
  };

  const consoleDatabase = {
    win5: {
      key: "win5",
      label: "WIN5",
      title: "WIN5 AI Console",
      subtitle: "WIN5 dedicated AI Console / Phase20-8 Activation",
      message: "WIN5候補生成、荒れ度AI、A固定判定AI、点数圧縮、結果検証、学習ログを PLAN_ONLY で確認します。",
      cards: [
        { title: "WIN5候補生成", detail: "対象5レースのA/B/C候補を生成するための入口です。" },
        { title: "荒れ度AI", detail: "各対象レースの荒れ度を読み、点数配分の強弱を確認します。" },
        { title: "A固定判定AI", detail: "固定候補にできるA馬の信頼度を保護モードで判定します。" },
        { title: "点数圧縮", detail: "買い目点数を圧縮するための候補整理ビューです。" },
        { title: "結果検証", detail: "WIN5結果検証ログへの導線を表示します。" },
        { title: "学習ログ", detail: "次回WIN5学習に反映するログ導線を表示します。" }
      ],
      links: [
        { title: "WIN5 Dashboard", detail: "WIN5 AIを起動", href: "win5.html" },
        { title: "WIN5 Folder", detail: "WIN5専用フォルダ", href: "WIN5/index.html" },
        { title: "結果検証", detail: "WIN5結果検証ログ", href: "WIN5/結果検証/README.md" },
        { title: "学習ログ", detail: "全体学習ログ", href: "学習ログ/index.html" }
      ]
    },
    hakodate: {
      key: "hakodate",
      label: "函館",
      title: "函館版AI Console",
      subtitle: "Hakodate dedicated AI Console / Phase20-8 Activation",
      message: "函館専用カードを PLAN_ONLY / Protected で表示します。外部送信と自動更新は行いません。",
      cards: [
        { title: "函館芝1200", detail: "短距離・洋芝・内前残りを重点確認します。" },
        { title: "函館芝1800", detail: "小回り芝1800の位置取りと持続力を確認します。" },
        { title: "函館ダ1000", detail: "スタート性能と先行力の補正を確認します。" },
        { title: "函館ダ1700", detail: "滞在適性とコーナー機動力を確認します。" },
        { title: "洋芝", detail: "洋芝適性、時計の掛かり方、馬場バイアスを確認します。" },
        { title: "滞在競馬", detail: "輸送負荷の少なさと函館滞在効果を確認します。" },
        { title: "ローカル前残り/差し補正", detail: "前残り傾向と差し届き条件を保護モードで整理します。" }
      ],
      links: [
        { title: "函館 Dashboard", detail: "函館競馬場トップ", href: "函館競馬場/index.html" },
        { title: "事前予想", detail: "函館2026事前予想", href: "函館競馬場/2026/事前予想/README.md" },
        { title: "結果検証", detail: "函館2026結果検証", href: "函館競馬場/2026/結果検証/README.md" },
        { title: "OS Updates", detail: "函館OS更新ログ", href: "函館競馬場/2026/OS Updates/README.md" }
      ]
    },
    sapporo: {
      key: "sapporo",
      label: "札幌",
      title: "札幌版AI Console",
      subtitle: "Sapporo dedicated AI Console / Phase20-8 Activation",
      message: "札幌専用カードを PLAN_ONLY / Protected で表示します。外部送信と自動更新は行いません。",
      cards: [
        { title: "札幌芝1500", detail: "独特の芝1500条件で枠・位置取り・持続力を確認します。" },
        { title: "札幌芝1800", detail: "洋芝中距離の先行力と上がり持続を確認します。" },
        { title: "札幌芝2000", detail: "コーナー4回と洋芝適性、スタミナ補正を確認します。" },
        { title: "札幌ダ1700", detail: "ローカルダ1700の先行力とまくり適性を確認します。" },
        { title: "洋芝", detail: "札幌洋芝でのパワー型・持続型適性を確認します。" },
        { title: "滞在競馬", detail: "滞在効果、輸送軽減、調整過程を確認します。" },
        { title: "函館→札幌転戦補正", detail: "函館実績から札幌へ転戦する馬の適性差を整理します。" }
      ],
      links: [
        { title: "札幌 Dashboard", detail: "札幌競馬場トップ", href: "札幌競馬場/index.html" },
        { title: "事前予想", detail: "札幌2026事前予想", href: "札幌競馬場/2026/事前予想/README.md" },
        { title: "結果検証", detail: "札幌2026結果検証", href: "札幌競馬場/2026/結果検証/README.md" },
        { title: "OS Updates", detail: "札幌OS更新ログ", href: "札幌競馬場/2026/OS Updates/README.md" }
      ]
    },
    tokyo: {
      key: "tokyo",
      label: "東京",
      title: "東京版AI Console",
      subtitle: "Tokyo AI Console",
      message: "東京版AI Consoleです。",
      cards: [
        { title: "東京コース", detail: "既存の東京版導線を維持します。" }
      ],
      links: [
        { title: "東京 Dashboard", detail: "東京競馬場トップ", href: "東京競馬場/index.html" }
      ]
    }
  };

  const aliases = {
    nakayama: { label: "中山", folder: "中山競馬場" },
    hanshin: { label: "阪神", folder: "阪神競馬場" },
    chukyo: { label: "中京", folder: "中京競馬場" },
    kyoto: { label: "京都", folder: "京都競馬場" },
    niigata: { label: "新潟", folder: "新潟競馬場" },
    fukushima: { label: "福島", folder: "福島競馬場" },
    kokura: { label: "小倉", folder: "小倉競馬場" }
  };

  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const getConsoleDefinition = (key = "tokyo") => {
    if (consoleDatabase[key]) return consoleDatabase[key];
    const alias = aliases[key];
    if (!alias) return consoleDatabase.tokyo;
    return {
      key,
      label: alias.label,
      title: `${alias.label}版AI Console`,
      subtitle: `${alias.label} AI Console`,
      message: `${alias.label}版AI Consoleです。既存導線を維持します。`,
      cards: [{ title: `${alias.label}コース`, detail: "既存の競馬場別AI Console導線を維持します。" }],
      links: [{ title: `${alias.label} Dashboard`, detail: `${alias.label}競馬場トップ`, href: `${alias.folder}/index.html` }]
    };
  };

  const setText = (documentRef, id, value) => {
    const element = documentRef.getElementById(id);
    if (element) element.textContent = value;
  };

  const renderCards = (documentRef, targetId, cards = []) => {
    const target = documentRef.getElementById(targetId);
    if (!target) return;
    target.innerHTML = cards.map((card) => (
      `<article class="console-activation-card"><strong>${escapeHtml(card.title)}</strong><span>${escapeHtml(card.detail)}</span></article>`
    )).join("");
  };

  const renderLinks = (documentRef, targetId, links = []) => {
    const target = documentRef.getElementById(targetId);
    if (!target) return;
    target.innerHTML = links.map((link) => (
      `<a class="console-link-card" href="${escapeHtml(link.href)}"><strong>${escapeHtml(link.title)}</strong><span>${escapeHtml(link.detail)}</span></a>`
    )).join("");
  };

  const renderPolicyTags = (documentRef) => {
    const target = documentRef.getElementById("console-policy-tags");
    if (!target) return;
    const tags = [
      basePolicy.mode,
      basePolicy.executionPolicy,
      basePolicy.protectionPolicy,
      basePolicy.repositoryPolicy,
      basePolicy.githubPagesPolicy,
      "External send disabled",
      "Auto update disabled"
    ];
    target.innerHTML = tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("");
  };

  const renderConsolePage = (documentRef = document, locationRef = window.location) => {
    if (!documentRef?.getElementById) return null;
    const params = new URLSearchParams(locationRef.search || "");
    const key = params.get("console") || "tokyo";
    const definition = getConsoleDefinition(key);

    documentRef.title = `Hashimoto Keiba AI / ${definition.title}`;
    setText(documentRef, "official-banner-title", `Hashimoto Keiba AI / ${PHASE} Console Activation`);
    setText(documentRef, "console-eyebrow", `${PHASE} / ${definition.label} / ${EXECUTION_POLICY}`);
    setText(documentRef, "console-heading", definition.title);
    setText(documentRef, "console-version", RELEASE_STATUS);
    setText(documentRef, "console-phase", `${PHASE} Activation`);
    setText(documentRef, "console-policy", EXECUTION_POLICY);
    setText(documentRef, "console-protection", PROTECTION_POLICY);
    setText(documentRef, "console-mode", basePolicy.mode);
    setText(documentRef, "console-title", definition.title);
    setText(documentRef, "console-status", PROTECTION_POLICY);
    setText(documentRef, "console-message", definition.message);
    setText(documentRef, "console-execution-policy", EXECUTION_POLICY);
    setText(documentRef, "console-protected-policy", PROTECTION_POLICY);
    setText(documentRef, "console-external-send", basePolicy.externalSend);
    setText(documentRef, "console-auto-update", basePolicy.autoUpdate);
    setText(documentRef, "console-card-eyebrow", definition.subtitle);
    setText(documentRef, "console-card-title", `${definition.label} Console Cards`);
    setText(documentRef, "console-card-count", `${definition.cards.length} cards`);
    renderPolicyTags(documentRef);
    renderCards(documentRef, "console-cards", definition.cards);
    renderLinks(documentRef, "console-links", definition.links);

    return { ...basePolicy, ...definition };
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => renderConsolePage());
  }

  if (typeof module !== "undefined") {
    module.exports = {
      PHASE,
      EXECUTION_POLICY,
      PROTECTION_POLICY,
      RELEASE_STATUS,
      basePolicy,
      consoleDatabase,
      getConsoleDefinition,
      renderConsolePage
    };
  }
})();
