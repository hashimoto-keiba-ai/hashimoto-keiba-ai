const raceConsoles = {
  tokyo: "東京版",
  nakayama: "中山版",
  hanshin: "阪神版",
  chukyo: "中京版",
  kyoto: "京都版",
  niigata: "新潟版",
  fukushima: "福島版",
  kokura: "小倉版",
  hakodate: "函館版",
  sapporo: "札幌版"
};

const raceActions = ["事前予想", "結果", "検証", "アップデート"];
const win5Modules = ["的中率AI", "荒れ度AI", "万馬券確率AI", "資金配分AI", "買い目生成AI"];

function setConsoleText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderTiles(targetId, items, className = "") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = items.map((item) => `<div class="console-tile ${className}">${item}</div>`).join("");
}

function bootConsolePage() {
  const key = document.body.dataset.console || "tokyo";
  const isWin5 = key === "win5";
  const label = isWin5 ? "WIN5 AI" : raceConsoles[key] || "東京版";
  const title = isWin5 ? "WIN5 AI Console" : `${label}AI Console`;

  document.title = `橋本競馬AI Version 1.2 / ${title}`;
  setConsoleText("official-banner-title", "橋本競馬AI Official Release v1.2");
  setConsoleText("console-title", title);
  setConsoleText("console-heading", title);
  setConsoleText("console-subtitle", `${title} / Coming Soon`);
  setConsoleText("console-version", "橋本競馬AI Version 1.2");
  setConsoleText("console-status", "Official Release v1.2");
  setConsoleText("console-score", "Release Score 97");

  if (isWin5) {
    renderTiles("win5-ai-modules", win5Modules);
  } else {
    renderTiles("race-numbers", Array.from({ length: 12 }, (_, index) => `R${index + 1}`), "race-number");
    renderTiles("race-actions", raceActions);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bootConsolePage);
}
