const phase8AiIndexStorageKey = "phase8AiIndexEntries";
const phase8AiIndexFields = ["aiIndex", "attackAiIndex", "dangerPopularIndex", "godHoleIndex", "longshotIndex", "raceScore"];

function phase8AiReadStore() {
  try {
    return JSON.parse(localStorage.getItem(phase8AiIndexStorageKey) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase8AiWriteStore(entries) {
  localStorage.setItem(phase8AiIndexStorageKey, JSON.stringify(entries));
}

function phase8AiSelectedCourseId() {
  const selector = document.getElementById("phase8-racecourse-selector");
  return selector?.value || "tokyo";
}

function phase8AiSelectedCourse() {
  return phase8Racecourses.find((course) => course.id === phase8AiSelectedCourseId()) || phase8Racecourses[0];
}

function phase8AiCourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId;
}

function phase8AiPopulateCourseSelect() {
  const selectedCourse = phase8AiSelectedCourse();
  const select = document.getElementById("phase8-ai-racecourse");
  if (!select) return;

  if (!select.dataset.ready) {
    select.innerHTML = phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
    select.addEventListener("change", () => {
      if (typeof renderPhase8RacecourseManagement === "function") renderPhase8RacecourseManagement(select.value);
      phase8AiRender();
    });
    select.dataset.ready = "true";
  }

  select.value = selectedCourse.id;
  phase8SetText("phase8-ai-course-label", selectedCourse.name);
  const link = document.getElementById("phase8-ai-database-link");
  if (link) link.setAttribute("href", `${selectedCourse.folder}/2026/AI Index/README.md`);
}

function phase8AiFilteredEntries() {
  const search = String(document.getElementById("phase8-ai-search")?.value || "").trim().toLowerCase();
  const rankFilter = String(document.getElementById("phase8-ai-filter")?.value || "All");
  const sortKey = String(document.getElementById("phase8-ai-sort")?.value || "createdAt");

  const entries = phase8AiReadStore()
    .filter((entry) => entry.racecourse === phase8AiSelectedCourseId())
    .filter((entry) => rankFilter === "All" || entry.predictionRank === rankFilter)
    .filter((entry) => {
      if (!search) return true;
      return [entry.raceName, entry.horseNumber, entry.horseName, entry.predictionRank, entry.notes, ...phase8AiIndexFields.map((field) => entry[field])]
        .join(" ").toLowerCase().includes(search);
    });

  return entries.sort((a, b) => {
    if (sortKey === "createdAt") return String(b.createdAt).localeCompare(String(a.createdAt));
    return Number(b[sortKey] || 0) - Number(a[sortKey] || 0);
  });
}

function phase8AiRender() {
  phase8AiPopulateCourseSelect();
  const target = document.getElementById("phase8-ai-index-entries");
  if (!target) return;

  const entries = phase8AiFilteredEntries();
  phase8SetText("phase8-ai-index-count", `${entries.length.toLocaleString("ja-JP")} entries`);

  if (!entries.length) {
    target.innerHTML = `<p class="empty-state">No AI Index entries for ${phase8Escape(phase8AiCourseLabel(phase8AiSelectedCourseId()))}.</p>`;
    return;
  }

  target.innerHTML = entries.map((entry) => `
    <article class="entry-card ai-index-card">
      <div><span class="race-meta">Rank ${phase8Escape(entry.predictionRank)} / ${phase8Escape(phase8AiCourseLabel(entry.racecourse))}</span><strong>${phase8Escape(entry.raceName || "AI Index entry")}</strong></div>
      <dl>
        <div><dt>Horse</dt><dd>${phase8Escape(entry.horseNumber)} ${phase8Escape(entry.horseName)}</dd></div>
        <div><dt>AI Index</dt><dd>${phase8Escape(entry.aiIndex)}</dd></div>
        <div><dt>Attack AI</dt><dd>${phase8Escape(entry.attackAiIndex)}</dd></div>
        <div><dt>Danger Popular</dt><dd>${phase8Escape(entry.dangerPopularIndex)}</dd></div>
        <div><dt>God Hole</dt><dd>${phase8Escape(entry.godHoleIndex)}</dd></div>
        <div><dt>Longshot</dt><dd>${phase8Escape(entry.longshotIndex)}</dd></div>
        <div><dt>Race Score</dt><dd>${phase8Escape(entry.raceScore)}</dd></div>
        <div><dt>Prediction Rank</dt><dd>${phase8Escape(entry.predictionRank)}</dd></div>
      </dl>
      <p><strong>Notes</strong><br>${phase8Escape(entry.notes)}</p>
    </article>
  `).join("");
}

function phase8AiBindForm() {
  const form = document.getElementById("phase8-ai-form");
  if (!form || form.dataset.ready) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = {
      id: `phase8-ai-${Date.now()}`,
      createdAt: new Date().toISOString(),
      racecourse: String(formData.get("racecourse") || phase8AiSelectedCourseId()),
      raceName: String(formData.get("raceName") || "").trim(),
      horseNumber: String(formData.get("horseNumber") || "").trim(),
      horseName: String(formData.get("horseName") || "").trim(),
      aiIndex: String(formData.get("aiIndex") || "").trim(),
      attackAiIndex: String(formData.get("attackAiIndex") || "").trim(),
      dangerPopularIndex: String(formData.get("dangerPopularIndex") || "").trim(),
      godHoleIndex: String(formData.get("godHoleIndex") || "").trim(),
      longshotIndex: String(formData.get("longshotIndex") || "").trim(),
      raceScore: String(formData.get("raceScore") || "").trim(),
      predictionRank: String(formData.get("predictionRank") || "").trim(),
      notes: String(formData.get("notes") || "").trim()
    };

    const entries = phase8AiReadStore();
    entries.push(entry);
    phase8AiWriteStore(entries);
    if (typeof renderPhase8RacecourseManagement === "function") renderPhase8RacecourseManagement(entry.racecourse);
    form.reset();
    phase8AiRender();
    phase8SetText("phase8-ai-index-status", "Saved to localStorage");
  });

  form.addEventListener("reset", () => window.setTimeout(() => {
    phase8AiPopulateCourseSelect();
    phase8SetText("phase8-ai-index-status", "Ready");
  }, 0));

  form.dataset.ready = "true";
}

function phase8AiBindTools() {
  ["phase8-ai-search", "phase8-ai-sort", "phase8-ai-filter", "phase8-racecourse-selector"].forEach((id) => {
    const control = document.getElementById(id);
    if (control && !control.dataset.aiReady) {
      control.addEventListener(id === "phase8-ai-search" ? "input" : "change", phase8AiRender);
      control.dataset.aiReady = "true";
    }
  });

  const filter = document.getElementById("phase8-ai-filter");
  if (filter && !filter.options.length) {
    filter.innerHTML = ["All", "1", "2", "3", "4", "5"].map((rank) => `<option value="${rank}">${rank === "All" ? "All ranks" : `Rank ${rank}`}</option>`).join("");
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    phase8AiBindForm();
    phase8AiBindTools();
    window.setTimeout(phase8AiRender, 0);
  });
}
