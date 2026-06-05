const phase8Racecourses = [
  { id: "tokyo", label: "Tokyo", name: "東京競馬場", ai: "東京AI", folder: "東京競馬場", feature: "長い直線・瞬発力・左回り補正" },
  { id: "nakayama", label: "Nakayama", name: "中山競馬場", ai: "中山AI", folder: "中山競馬場", feature: "急坂・小回り・先行力補正" },
  { id: "hanshin", label: "Hanshin", name: "阪神競馬場", ai: "阪神AI", folder: "阪神競馬場", feature: "内回り/外回り・坂適性補正" },
  { id: "kyoto", label: "Kyoto", name: "京都競馬場", ai: "京都AI", folder: "京都競馬場", feature: "平坦適性・下り坂・持続力補正" },
  { id: "chukyo", label: "Chukyo", name: "中京競馬場", ai: "中京AI", folder: "中京競馬場", feature: "左回り・直線坂・差し脚補正" },
  { id: "fukushima", label: "Fukushima", name: "福島競馬場", ai: "福島AI", folder: "福島競馬場", feature: "小回り・機動力・ローカル馬場補正" },
  { id: "niigata", label: "Niigata", name: "新潟競馬場", ai: "新潟AI", folder: "新潟競馬場", feature: "長直線・外回り・千直補正" },
  { id: "kokura", label: "Kokura", name: "小倉競馬場", ai: "小倉AI", folder: "小倉競馬場", feature: "小回り・平坦・開催後半馬場補正" },
  { id: "hakodate", label: "Hakodate", name: "函館競馬場", ai: "函館AI", folder: "函館競馬場", feature: "洋芝・小回り・滞在競馬補正" },
  { id: "sapporo", label: "Sapporo", name: "札幌競馬場", ai: "札幌AI", folder: "札幌競馬場", feature: "洋芝・平坦・持久力補正" }
].map((course) => ({ ...course, dashboardPath: `${course.folder}/README.md` }));

const phase8DatabaseSections = [
  { label: "Predictions", folder: "Predictions", purpose: "Race predictions, marks, tickets, and pre-race AI notes" },
  { label: "Results", folder: "Results", purpose: "Race results, payouts, hit/miss review, and ROI" },
  { label: "OS Updates", folder: "OS Updates", purpose: "Racecourse-specific rule changes and tuning history" },
  { label: "Saved Logs", folder: "Saved Logs", purpose: "Weekly, monthly, and meeting summary logs" },
  { label: "AI Index", folder: "AI Index", purpose: "Race-specific AI index records and ranking evidence" }
];

const phase8FolderTypes = [
  { label: "Dashboard", purpose: "Racecourse dashboard", path: (course) => course.dashboardPath },
  ...phase8DatabaseSections.map((section) => ({
    ...section,
    path: (course) => `${course.folder}/2026/${section.folder}/README.md`
  }))
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
  return folderType?.path ? folderType.path(course) : course.dashboardPath;
}

function renderPhase8RacecourseButtons(selectedCourse) {
  const target = document.getElementById("phase8-racecourse-buttons");
  if (!target) return;

  target.innerHTML = phase8Racecourses.map((course) => `
    <button class="racecourse-button${selectedCourse.id === course.id ? " active" : ""}" type="button" data-course-id="${phase8Escape(course.id)}" aria-pressed="${selectedCourse.id === course.id ? "true" : "false"}">
      <strong>${phase8Escape(course.label)}</strong>
      <span>${phase8Escape(course.name)}</span>
    </button>
  `).join("");

  target.querySelectorAll("button[data-course-id]").forEach((button) => {
    button.addEventListener("click", () => renderPhase8RacecourseManagement(button.dataset.courseId));
  });
}

function renderPhase8RacecourseManagement(selectedId = "tokyo") {
  const selectedCourse = phase8Racecourses.find((course) => course.id === selectedId) || phase8Racecourses[0];
  phase8SetText("phase8-course-count", `${phase8Racecourses.length.toLocaleString("ja-JP")}場`);
  phase8SetText("phase8-race-db-count", `${phase8DatabaseSections.length.toLocaleString("ja-JP")} sections`);
  phase8SetText("phase8-ai-analysis-count", "AI Index ready");
  phase8SetText("phase8-next-action", "Race DB input");
  phase8SetText("phase8-selected-course", selectedCourse.name);
  phase8SetText("phase8-selected-ai", `${selectedCourse.ai} / ${selectedCourse.feature}`);

  const selector = document.getElementById("phase8-racecourse-selector");
  if (selector && !selector.dataset.ready) {
    selector.innerHTML = phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
    selector.addEventListener("change", () => renderPhase8RacecourseManagement(selector.value));
    selector.dataset.ready = "true";
  }
  if (selector) selector.value = selectedCourse.id;

  renderPhase8RacecourseButtons(selectedCourse);

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
        <div class="chips"><span>Predictions</span><span>Results</span><span>AI Index</span></div>
        <p>${phase8Escape(course.feature)}</p>
        <a href="${phase8Escape(`${course.folder}/2026/AI Index/README.md`)}">AI Index</a>
      </article>
    `).join("");
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => renderPhase8RacecourseManagement());
}
