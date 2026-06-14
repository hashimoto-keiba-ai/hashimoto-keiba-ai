const RACE_RELEASE_VERSION = "1.3";
const RACE_RELEASE_STATUS = "Official Release v1.3";
const RACE_RELEASE_SCORE = 98;

const raceCourseLabels = {
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

const raceManagementItems = ["事前予想", "結果", "検証", "アップデート", "保存"];

function setRaceText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderManagementItems() {
  const target = document.getElementById("race-management-items");
  if (!target) return;
  target.innerHTML = raceManagementItems
    .map((item) => `<button type="button" class="console-tile race-management-item">${item}</button>`)
    .join("");
}

function bootRaceManagementPage() {
  const params = new URLSearchParams(window.location.search);
  const courseKey = params.get("course") || "tokyo";
  const raceNumber = Number(params.get("race") || 1);
  const safeRaceNumber = Math.min(12, Math.max(1, Number.isFinite(raceNumber) ? raceNumber : 1));
  const courseLabel = raceCourseLabels[courseKey] || raceCourseLabels.tokyo;
  const title = `${courseLabel}AI Console R${safeRaceNumber}`;

  document.title = `橋本競馬AI Version ${RACE_RELEASE_VERSION} / ${title}`;
  setRaceText("official-banner-title", `橋本競馬AI ${RACE_RELEASE_STATUS}`);
  setRaceText("race-heading", title);
  setRaceText("race-title", title);
  setRaceText("race-subtitle", `${title} / Race Management`);
  setRaceText("race-version", `橋本競馬AI Version ${RACE_RELEASE_VERSION}`);
  setRaceText("race-status", RACE_RELEASE_STATUS);
  setRaceText("race-score", `Release Score ${RACE_RELEASE_SCORE}`);
  setRaceText("back-console-link", `${courseLabel}AI Consoleへ戻る`);

  const backLink = document.getElementById("back-console-link");
  if (backLink) backLink.href = `${courseKey}-console.html`;

  renderManagementItems();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bootRaceManagementPage);
}
