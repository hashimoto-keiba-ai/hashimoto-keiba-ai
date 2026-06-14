const RELEASE_VERSION = "1.6";
const RELEASE_STATUS = "Official Release v1.6";
const RELEASE_SCORE = 101;
const raceConsoles = { tokyo: "東京版", nakayama: "中山版", hanshin: "阪神版", chukyo: "中京版", kyoto: "京都版", niigata: "新潟版", fukushima: "福島版", kokura: "小倉版", hakodate: "函館版", sapporo: "札幌版" };
const win5Modules = ["的中率AI", "荒れ度AI", "万馬券確率AI", "資金配分AI", "買い目生成AI"];
function setConsoleText(id, value) { const element = document.getElementById(id); if (element) element.textContent = value; }
function renderTiles(targetId, items, className = "") { const target = document.getElementById(targetId); if (!target) return; target.innerHTML = items.map((item) => `<div class="console-tile ${className}">${item}</div>`).join(""); }
function renderRaceButtons(targetId, courseKey) { const target = document.getElementById(targetId); if (!target) return; target.innerHTML = Array.from({ length: 12 }, (_, index) => `<a class="console-tile race-number" href="race-management.html?course=${courseKey}&race=${index + 1}">R${index + 1}</a>`).join(""); }
function bootConsolePage() { const key = document.body.dataset.console || "tokyo"; const isWin5 = key === "win5"; const label = isWin5 ? "WIN5 AI" : raceConsoles[key] || "東京版"; const title = isWin5 ? "WIN5 AI Console" : `${label}AI Console`; document.title = `橋本競馬AI Version ${RELEASE_VERSION} / ${title}`; setConsoleText("official-banner-title", `橋本競馬AI ${RELEASE_STATUS}`); setConsoleText("console-title", title); setConsoleText("console-heading", title); setConsoleText("console-subtitle", `${title} / 全競馬場統合AI`); setConsoleText("console-version", `橋本競馬AI Version ${RELEASE_VERSION}`); setConsoleText("console-status", RELEASE_STATUS); setConsoleText("console-score", `Release Score ${RELEASE_SCORE}`); if (isWin5) renderTiles("win5-ai-modules", win5Modules); else renderRaceButtons("race-numbers", key); }
if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootConsolePage);
if (typeof module !== "undefined") module.exports = { RELEASE_SCORE, RELEASE_STATUS, RELEASE_VERSION, raceConsoles, win5Modules };
