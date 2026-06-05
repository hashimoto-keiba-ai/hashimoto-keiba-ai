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
  { label: "Results", folder: "Results", purpose: "Race result verification, finish records, and review notes" },
  { label: "OS Updates", folder: "OS Updates", purpose: "Racecourse-specific model tuning and operation updates" },
  { label: "Saved Logs", folder: "Saved Logs", purpose: "Weekly, monthly, and meeting summary logs" },
  { label: "AI Index", folder: "AI Index", purpose: "Race-specific AI index records and ranking evidence" }
];

const phase8EntrySections = phase8DatabaseSections.filter((section) => ["Predictions", "Results", "OS Updates"].includes(section.label));
const phase8ResultsSection = phase8DatabaseSections.find((section) => section.label === "Results");
const phase8OsUpdatesSection = phase8DatabaseSections.find((section) => section.label === "OS Updates");
const phase8ImportanceLevels = ["Critical", "High", "Medium", "Low"];

const phase8FolderTypes = [
  { label: "Dashboard", purpose: "Racecourse dashboard", path: (course) => course.dashboardPath },
  ...phase8DatabaseSections.map((section) => ({
    ...section,
    path: (course) => `${course.folder}/2026/${section.folder}/README.md`
  }))
];

const phase8StorageKey = "phase8PredictionEntries";
const phase8ResultStorageKey = "phase8ResultVerificationEntries";
const phase8OsUpdateStorageKey = "phase8OsUpdateRules";
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
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function phase8CoursePath(course, folderType = null) {
  return folderType?.path ? folderType.path(course) : course.dashboardPath;
}

function phase8ReadStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase8WriteStore(key, entries) {
  localStorage.setItem(key, JSON.stringify(entries));
}

function phase8ReadEntries() { return phase8ReadStore(phase8StorageKey); }
function phase8WriteEntries(entries) { phase8WriteStore(phase8StorageKey, entries); }
function phase8ReadResults() { return phase8ReadStore(phase8ResultStorageKey); }
function phase8WriteResults(entries) { phase8WriteStore(phase8ResultStorageKey, entries); }
function phase8ReadOsUpdates() { return phase8ReadStore(phase8OsUpdateStorageKey); }
function phase8WriteOsUpdates(entries) { phase8WriteStore(phase8OsUpdateStorageKey, entries); }

function phase8EntryCourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId;
}

function phase8SelectedCourse() {
  return phase8Racecourses.find((course) => course.id === phase8SelectedCourseId) || phase8Racecourses[0];
}

function phase8PopulateCourseSelect(select, selectedCourse) {
  if (!select) return;
  if (!select.dataset.ready) {
    select.innerHTML = phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
    select.addEventListener("change", () => renderPhase8RacecourseManagement(select.value));
    select.dataset.ready = "true";
  }
  select.value = selectedCourse.id;
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
      <div><span class="race-meta">${phase8Escape(entry.section)} / ${phase8Escape(phase8EntryCourseLabel(entry.racecourse))}</span><strong>${phase8Escape(entry.raceName || "Race entry")}</strong></div>
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

function phase8RenderResultEntries() {
  const target = document.getElementById("phase8-result-entries");
  if (!target) return;

  const entries = phase8ReadResults()
    .filter((entry) => entry.racecourse === phase8SelectedCourseId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  phase8SetText("phase8-result-entry-count", `${entries.length.toLocaleString("ja-JP")} results`);
  const resultLink = document.getElementById("phase8-result-database-link");
  if (resultLink) resultLink.setAttribute("href", phase8CoursePath(phase8SelectedCourse(), phase8ResultsSection));

  if (!entries.length) {
    target.innerHTML = `<p class="empty-state">No result verification entries for ${phase8Escape(phase8EntryCourseLabel(phase8SelectedCourseId))}.</p>`;
    return;
  }

  target.innerHTML = entries.map((entry) => `
    <article class="entry-card result-card">
      <div><span class="race-meta">Results / ${phase8Escape(phase8EntryCourseLabel(entry.racecourse))}</span><strong>${phase8Escape(entry.raceName || "Result entry")}</strong></div>
      <dl>
        <div><dt>Horse</dt><dd>${phase8Escape(entry.horseNumber)} ${phase8Escape(entry.horseName)}</dd></div>
        <div><dt>Finish</dt><dd>${phase8Escape(entry.finishPosition)}</dd></div>
        <div><dt>Popularity</dt><dd>${phase8Escape(entry.popularity)}</dd></div>
        <div><dt>4th corner</dt><dd>${phase8Escape(entry.cornerPosition)}</dd></div>
        <div><dt>Last 3F</dt><dd>${phase8Escape(entry.last3fTime)}</dd></div>
        <div><dt>Jockey</dt><dd>${phase8Escape(entry.jockey)}</dd></div>
        <div><dt>Trainer</dt><dd>${phase8Escape(entry.trainer)}</dd></div>
      </dl>
      <p><strong>Verification</strong><br>${phase8Escape(entry.verificationComment)}</p>
      <p><strong>OS Update</strong><br>${phase8Escape(entry.osUpdateComment)}</p>
    </article>
  `).join("");
}

function phase8RenderOsUpdates() {
  const target = document.getElementById("phase8-os-update-entries");
  if (!target) return;

  const search = String(document.getElementById("phase8-os-search")?.value || "").trim().toLowerCase();
  const importance = String(document.getElementById("phase8-os-filter")?.value || "All");
  const entries = phase8ReadOsUpdates()
    .filter((entry) => entry.racecourse === phase8SelectedCourseId)
    .filter((entry) => importance === "All" || entry.importance === importance)
    .filter((entry) => {
      if (!search) return true;
      return [entry.distance, entry.surface, entry.condition, entry.ruleTitle, entry.ruleContent, entry.verificationRace, entry.adoptionDate, entry.importance]
        .join(" ").toLowerCase().includes(search);
    })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  phase8SetText("phase8-os-update-count", `${entries.length.toLocaleString("ja-JP")} rules`);
  const osLink = document.getElementById("phase8-os-database-link");
  if (osLink) osLink.setAttribute("href", phase8CoursePath(phase8SelectedCourse(), phase8OsUpdatesSection));

  if (!entries.length) {
    target.innerHTML = `<p class="empty-state">No OS update rules for ${phase8Escape(phase8EntryCourseLabel(phase8SelectedCourseId))}.</p>`;
    return;
  }

  target.innerHTML = entries.map((entry) => `
    <article class="entry-card os-card importance-${phase8Escape(entry.importance).toLowerCase()}">
      <div><span class="race-meta">${phase8Escape(entry.importance)} / ${phase8Escape(phase8EntryCourseLabel(entry.racecourse))}</span><strong>${phase8Escape(entry.ruleTitle || "OS rule")}</strong></div>
      <dl>
        <div><dt>Distance</dt><dd>${phase8Escape(entry.distance)}m</dd></div>
        <div><dt>Surface</dt><dd>${phase8Escape(entry.surface)}</dd></div>
        <div><dt>Condition</dt><dd>${phase8Escape(entry.condition)}</dd></div>
        <div><dt>Verification Race</dt><dd>${phase8Escape(entry.verificationRace)}</dd></div>
        <div><dt>Adoption Date</dt><dd>${phase8Escape(entry.adoptionDate)}</dd></div>
        <div><dt>Importance</dt><dd>${phase8Escape(entry.importance)}</dd></div>
      </dl>
      <p><strong>OS Rule Content</strong><br>${phase8Escape(entry.ruleContent)}</p>
    </article>
  `).join("");
}

function phase8SyncEntryForm(selectedCourse) {
  phase8PopulateCourseSelect(document.getElementById("phase8-entry-racecourse"), selectedCourse);
  const formSection = document.getElementById("phase8-entry-section");
  if (formSection && !formSection.dataset.ready) {
    formSection.innerHTML = phase8EntrySections.map((section) => `<option value="${phase8Escape(section.label)}">${phase8Escape(section.label)}</option>`).join("");
    formSection.addEventListener("change", () => {
      phase8SelectedSection = formSection.value;
      phase8RenderEntrySections();
      phase8RenderSavedEntries();
    });
    formSection.dataset.ready = "true";
  }
  if (formSection) formSection.value = phase8SelectedSection;
}

function phase8SyncResultForm(selectedCourse) {
  phase8PopulateCourseSelect(document.getElementById("phase8-result-racecourse"), selectedCourse);
}

function phase8SyncOsForm(selectedCourse) {
  phase8PopulateCourseSelect(document.getElementById("phase8-os-racecourse"), selectedCourse);
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
    phase8SyncEntryForm(phase8SelectedCourse());
    phase8SetText("phase8-entry-status", "Saved to localStorage");
  });
  form.addEventListener("reset", () => window.setTimeout(() => phase8SyncEntryForm(phase8SelectedCourse()), 0));
  form.dataset.ready = "true";
}

function phase8BindResultForm() {
  const form = document.getElementById("phase8-result-form");
  if (!form || form.dataset.ready) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = {
      id: `phase8-result-${Date.now()}`,
      createdAt: new Date().toISOString(),
      section: "Results",
      raceName: String(formData.get("raceName") || "").trim(),
      racecourse: String(formData.get("racecourse") || phase8SelectedCourseId),
      horseNumber: String(formData.get("horseNumber") || "").trim(),
      horseName: String(formData.get("horseName") || "").trim(),
      finishPosition: String(formData.get("finishPosition") || "").trim(),
      popularity: String(formData.get("popularity") || "").trim(),
      cornerPosition: String(formData.get("cornerPosition") || "").trim(),
      last3fTime: String(formData.get("last3fTime") || "").trim(),
      jockey: String(formData.get("jockey") || "").trim(),
      trainer: String(formData.get("trainer") || "").trim(),
      verificationComment: String(formData.get("verificationComment") || "").trim(),
      osUpdateComment: String(formData.get("osUpdateComment") || "").trim()
    };
    const entries = phase8ReadResults();
    entries.push(entry);
    phase8WriteResults(entries);
    phase8SelectedSection = "Results";
    renderPhase8RacecourseManagement(entry.racecourse);
    form.reset();
    phase8SyncResultForm(phase8SelectedCourse());
    phase8SetText("phase8-result-status", "Saved to localStorage");
  });
  form.addEventListener("reset", () => window.setTimeout(() => phase8SyncResultForm(phase8SelectedCourse()), 0));
  form.dataset.ready = "true";
}

function phase8BindOsUpdateForm() {
  const form = document.getElementById("phase8-os-form");
  if (!form || form.dataset.ready) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = {
      id: `phase8-os-${Date.now()}`,
      createdAt: new Date().toISOString(),
      section: "OS Updates",
      racecourse: String(formData.get("racecourse") || phase8SelectedCourseId),
      distance: String(formData.get("distance") || "").trim(),
      surface: String(formData.get("surface") || "").trim(),
      condition: String(formData.get("condition") || "").trim(),
      ruleTitle: String(formData.get("ruleTitle") || "").trim(),
      ruleContent: String(formData.get("ruleContent") || "").trim(),
      verificationRace: String(formData.get("verificationRace") || "").trim(),
      adoptionDate: String(formData.get("adoptionDate") || "").trim(),
      importance: String(formData.get("importance") || "Medium")
    };
    const entries = phase8ReadOsUpdates();
    entries.push(entry);
    phase8WriteOsUpdates(entries);
    phase8SelectedSection = "OS Updates";
    renderPhase8RacecourseManagement(entry.racecourse);
    form.reset();
    phase8SyncOsForm(phase8SelectedCourse());
    phase8SetText("phase8-os-status", "Saved to localStorage");
  });
  form.addEventListener("reset", () => window.setTimeout(() => {
    phase8SyncOsForm(phase8SelectedCourse());
    phase8SetText("phase8-os-status", "Ready");
  }, 0));
  form.dataset.ready = "true";
}

function phase8BindOsSearch() {
  const search = document.getElementById("phase8-os-search");
  const filter = document.getElementById("phase8-os-filter");
  if (search && !search.dataset.ready) {
    search.addEventListener("input", phase8RenderOsUpdates);
    search.dataset.ready = "true";
  }
  if (filter && !filter.dataset.ready) {
    filter.innerHTML = ["All", ...phase8ImportanceLevels].map((level) => `<option value="${level}">${level}</option>`).join("");
    filter.addEventListener("change", phase8RenderOsUpdates);
    filter.dataset.ready = "true";
  }
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
  phase8SetText("phase8-ai-analysis-count", "OS manager ready");
  phase8SetText("phase8-next-action", "Tune OS rule");
  phase8SetText("phase8-selected-course", selectedCourse.name);
  phase8SetText("phase8-selected-ai", `${selectedCourse.ai} / ${selectedCourse.feature}`);
  phase8SetText("phase8-result-course-label", selectedCourse.name);
  phase8SetText("phase8-os-course-label", selectedCourse.name);

  const selector = document.getElementById("phase8-racecourse-selector");
  phase8PopulateCourseSelect(selector, selectedCourse);

  renderPhase8RacecourseButtons(selectedCourse);
  phase8SyncEntryForm(selectedCourse);
  phase8SyncResultForm(selectedCourse);
  phase8SyncOsForm(selectedCourse);
  phase8BindOsSearch();
  phase8RenderEntrySections();
  phase8RenderSavedEntries();
  phase8RenderResultEntries();
  phase8RenderOsUpdates();

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
        <a href="${phase8Escape(`${course.folder}/2026/OS Updates/README.md`)}">OS Updates database</a>
      </article>
    `).join("");
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    phase8BindEntryForm();
    phase8BindResultForm();
    phase8BindOsUpdateForm();
    renderPhase8RacecourseManagement();
  });
}
