const phase8Racecourses = [
  { id: "tokyo", name: "東京競馬場", ai: "東京AI", folder: "東京競馬場", feature: "長い直線・瞬発力・左回り補正" },
  { id: "nakayama", name: "中山競馬場", ai: "中山AI", folder: "中山競馬場", feature: "急坂・小回り・先行力補正" },
  { id: "hanshin", name: "阪神競馬場", ai: "阪神AI", folder: "阪神競馬場", feature: "内回り/外回り・坂適性補正" },
  { id: "kyoto", name: "京都競馬場", ai: "京都AI", folder: "京都競馬場", feature: "平坦適性・下り坂・持続力補正" },
  { id: "chukyo", name: "中京競馬場", ai: "中京AI", folder: "中京競馬場", feature: "左回り・直線坂・差し脚補正" },
  { id: "fukushima", name: "福島競馬場", ai: "福島AI", folder: "福島競馬場", feature: "小回り・機動力・ローカル馬場補正" },
  { id: "niigata", name: "新潟競馬場", ai: "新潟AI", folder: "新潟競馬場", feature: "長直線・外回り・千直補正" },
  { id: "kokura", name: "小倉競馬場", ai: "小倉AI", folder: "小倉競馬場", feature: "小回り・平坦・開催後半馬場補正" },
  { id: "hakodate", name: "函館競馬場", ai: "函館AI", folder: "函館競馬場", feature: "洋芝・小回り・滞在競馬補正" },
  { id: "sapporo", name: "札幌競馬場", ai: "札幌AI", folder: "札幌競馬場", feature: "洋芝・平坦・持久力補正" }
];

const phase8FolderTypes = [
  { label: "事前予想", folder: "事前予想", purpose: "レース前の指数・印・買い目" },
  { label: "結果検証", folder: "結果検証", purpose: "着順・配当・的中/不的中" },
  { label: "OSアップデート", folder: "OSアップデート", purpose: "補正ルール・改善履歴" },
  { label: "保存ログ", folder: "保存ログ", purpose: "週次/月次/開催総括" },
  { label: "レースDB", folder: "レースDB", purpose: "レース固有データベース" },
  { label: "AI分析", folder: "AI分析", purpose: "競馬場別AI分析" }
];

function phase8SetText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function phase8Escape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function phase8CoursePath(course, folderType = null) {
  const base = `${course.folder}/2026`;
  return folderType ? `${base}/${folderType.folder}/README.md` : `${course.folder}/README.md`;
}

function renderPhase8RacecourseManagement(selectedId = "tokyo") {
  const selectedCourse = phase8Racecourses.find((course) => course.id === selectedId) || phase8Racecourses[0];
  phase8SetText("phase8-course-count", `${phase8Racecourses.length.toLocaleString("ja-JP")}場`);
  phase8SetText("phase8-race-db-count", `${phase8Racecourses.length.toLocaleString("ja-JP")}件`);
  phase8SetText("phase8-ai-analysis-count", `${phase8Racecourses.length.toLocaleString("ja-JP")}件`);
  phase8SetText("phase8-next-action", "レース別DB投入");
  phase8SetText("phase8-selected-course", selectedCourse.name);
  phase8SetText("phase8-selected-ai", `${selectedCourse.ai} / ${selectedCourse.feature}`);

  const selector = document.getElementById("phase8-racecourse-selector");
  if (selector && !selector.dataset.ready) {
    selector.innerHTML = phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.name)}</option>`).join("");
    selector.addEventListener("change", () => renderPhase8RacecourseManagement(selector.value));
    selector.dataset.ready = "true";
  }
  if (selector) selector.value = selectedCourse.id;

  const linkTarget = document.getElementById("phase8-selected-links");
  if (linkTarget) {
    linkTarget.innerHTML = phase8FolderTypes.map((item) => `
      <a class="folder-link" href="${phase8Escape(phase8CoursePath(selectedCourse, item))}">
        <strong>${phase8Escape(item.label)}</strong>
        <span>${phase8Escape(item.purpose)}</span>
      </a>
    `).join("");
  }

  const cardTarget = document.getElementById("phase8-course-cards");
  if (cardTarget) {
    cardTarget.innerHTML = phase8Racecourses.map((course) => `
      <article class="course-card${selectedCourse.id === course.id ? " active" : ""}">
        <span class="race-meta">${phase8Escape(course.ai)}</span>
        <strong>${phase8Escape(course.name)}</strong>
        <div class="chips"><span>レースDB</span><span>AI分析</span><span>2026運用</span></div>
        <p>${phase8Escape(course.feature)}</p>
        <a href="${phase8Escape(phase8CoursePath(course))}">フォルダを開く</a>
      </article>
    `).join("");
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => renderPhase8RacecourseManagement());
}
