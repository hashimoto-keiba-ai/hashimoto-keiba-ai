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
  { label: "Predictions", folder: "Predictions", purpose: "Prediction entries, marks, AI scores, and pre-race notes" },
  { label: "Results", folder: "Results", purpose: "Race result follow-up, finish records, and review notes" },
  { label: "OS Updates", folder: "OS Updates", purpose: "Racecourse-specific model tuning and operation updates" },
  { label: "Saved Logs", folder: "Saved Logs", purpose: "Weekly, monthly, and meeting summary logs" },
  { label: "AI Index", folder: "AI Index", purpose: "Race-specific AI index records and ranking evidence" }
];

const phase8EntrySections = phase8DatabaseSections.filter((section) => ["Predictions", "Results", "OS Updates"].includes(section.label));

const phase8FolderTypes = [
  { label: "Dashboard", purpose: "Racecourse dashboard", path: (course) => course.dashboardPath },
  ...phase8DatabaseSections.map((section) => ({
    ...section,
    path: (course) => `${course.folder}/2026/${section.folder}/README.md`
  }))
];

const phase8StorageKey = "phase8PredictionEntries";
let phase8SelectedCourseId = "tokyo";
let phase8SelectedSection = "Predictions";

function phase8SetText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function phase8Escape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function phase8CoursePath(course, folderType = null) {
  return folderType?.path ? folderType.path(course) : course.dashboardPath;
}

function phase8ReadEntries() {
  try {
    return JSON.parse(localStorage.getItem(phase8StorageKey) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase8WriteEntries(entries) {
  localStorage.setItem(phase8StorageKey, JSON.stringify(entries));
}

function phase8EntryCourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId;
}

function phase8RenderEntrySections() {
  const target = document.getElementById("phase8-entry-section-buttons");
  if (!target) return;

  target.innerHTML = phase8EntrySections.map((section) => `
    <button class="entry-section-button${phase8SelectedSection === section.label ? " active" : ""}" type="button" data-entry-section="${phase8Escape(section.label)}" aria-pressed="${phase8SelectedSection === section.label ? "true" : "false"}">
      <strong>${phase8Escape(section.label)}</strong>
      <span>${phase8Escape(section.purpose)}</span>
    </button>
  `).join("");

  target.querySelectorAll("button[data-entry-section]").forEach((button) => {
    button.addEventListener("click", () => {
      phase8SelectedSection = button.dataset.entrySection;
      phase8RenderEntrySections();
      phase8RenderSavedEntries();
    });
  });
}

function phase8RenderSavedEntries() {
  const target = document.getElementById("phase8-saved-entries");
  if (!target) return;

  const entries = phase8ReadEntries()
    .filter((entry) => entry.racecourse === phase8SelectedCourseId && entry.section === phase8SelectedSection)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  phase8SetText("phase8-local-entry-count", `${entries.length.toLocaleString("ja-JP")} records`);

  if (!entries.length) {
    target.innerHTML = `<p class="empty-state">No saved ${phase8Escape(phase8SelectedSection)} entries for ${phase8Escape(phase8EntryCourseLabel(phase8SelectedCourseId))}.</p>`;
    return;
  }

  target.innerHTML = entries.map((entry) => `
    <article class="entry-card">
      <div>
        <span class="race-meta">${phase8Escape(entry.section)} / ${phase8Escape(phase8EntryCourseLabel(entry.racecourse))}</span>
        <strong>${phase8Escape(entry.raceName || "Race entry")}</strong>
      </div>
      <dl>
        <div><dt>Horse</dt><dd>${phase8Escape(entry.horseNumber)} ${phase8Escape(entry.horseName)}</dd></div>
        <div><dt>Distance</dt><dd>${phase8Escape(entry.distance)}m / ${phase8Escape(entry.surface)}</dd></div>
        <div><dt>Track</dt><dd>${phase8Escape(entry.trackCondition)}</dd></div>
        <div><dt>Popularity</dt><dd>${phase8Escape(entry.popularity)}</dd></div>
        <div><dt>Jockey</dt><dd>${phase8Escape(entry.jockey)}</dd></div>
        <div><dt>Trainer</dt><dd>${phase8Escape(entry.trainer)}</dd></div>
        <div><dt>Stable</dt><dd>${phase8Escape(entry.stable)}</dd></div>
        <div><dt>AI score</dt><dd>${phase8Escape(entry.aiScore)}</dd></div>
        <div><dt>Mark</dt><dd>${phase8Escape(entry.predictionMark)}</dd></div>
      </dl>
    </article>
  `).join("");
}

function phase8SyncEntryForm(selectedCourse) {
  const formCourse = document.getElementById("phase8-entry-racecourse");
  const formSection = document.getElementById("phase8-entry-section");

  if (formCourse && !formCourse.dataset.ready) {
    formCourse.innerHTML = phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
    formCourse.addEventListener("change", () => renderPhase8RacecourseManagement(formCourse.value));
    formCourse.dataset.ready = "true";
  }

  if (formSection && !formSection.dataset.ready) {
    formSection.innerHTML = phase8EntrySections.map((section) => `<option value="${phase8Escape(section.label)}">${phase8Escape(section.label)}</option>`).join("");
    formSection.addEventListener("change", () => {
      phase8SelectedSection = formSection.value;
      phase8RenderEntrySections();
      phase8RenderSavedEntries();
    });
    formSection.dataset.ready = "true";
  }

  if (formCourse) formCourse.value = selectedCourse.id;
  if (formSection) formSection.value = phase8SelectedSection;
}

function phase8BindEntryForm() {
  const form = document.getElementById("phase8-entry-form");
  if (!form || form.dataset.ready) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = {
      id: `phase8-${Date.now()}`,
      createdAt: new Date().toISOString(),
      section: String(formData.get("section") || phase8SelectedSection),
      raceName: String(formData.get("raceName") || "").trim(),
      racecourse: String(formData.get("racecourse") || phase8SelectedCourseId),
      distance: String(formData.get("distance") || "").trim(),
      surface: String(formData.get("surface") || "").trim(),
      trackCondition: String(formData.get("trackCondition") || "").trim(),
      horseNumber: String(formData.get("horseNumber") || "").trim(),
      horseName: String(formData.get("horseName") || "").trim(),
      popularity: String(formData.get("popularity") || "").trim(),
      jockey: String(formData.get("jockey") || "").trim(),
      trainer: String(formData.get("trainer") || "").trim(),
      stable: String(formData.get("stable") || "").trim(),
      aiScore: String(formData.get("aiScore") || "").trim(),
      predictionMark: String(formData.get("predictionMark") || "").trim()
    };

    const entries = phase8ReadEntries();
    entries.push(entry);
    phase8WriteEntries(entries);
    phase8SelectedSection = entry.section;
    renderPhase8RacecourseManagement(entry.racecourse);
    form.reset();
    phase8SyncEntryForm(phase8Racecourses.find((course) => course.id === entry.racecourse) || phase8Racecourses[0]);
    phase8SetText("phase8-entry-status", "Saved to localStorage");
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      const selectedCourse = phase8Racecourses.find((course) => course.id === phase8SelectedCourseId) || phase8Racecourses[0];
      phase8SyncEntryForm(selectedCourse);
      phase8SetText("phase8-entry-status", "Ready");
    }, 0);
  });

  form.dataset.ready = "true";
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
  phase8SelectedCourseId = selectedCourse.id;
  phase8SetText("phase8-course-count", `${phase8Racecourses.length.toLocaleString("ja-JP")}場`);
  phase8SetText("phase8-race-db-count", `${phase8EntrySections.length.toLocaleString("ja-JP")} entry sections`);
  phase8SetText("phase8-ai-analysis-count", "localStorage ready");
  phase8SetText("phase8-next-action", "Register race");
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
  phase8SyncEntryForm(selectedCourse);
  phase8RenderEntrySections();
  phase8RenderSavedEntries();

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
        <div class="chips"><span>Predictions</span><span>Results</span><span>OS Updates</span></div>
        <p>${phase8Escape(course.feature)}</p>
        <a href="${phase8Escape(`${course.folder}/2026/Predictions/README.md`)}">Prediction database</a>
      </article>
    `).join("");
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    phase8BindEntryForm();
    renderPhase8RacecourseManagement();
  });
}
