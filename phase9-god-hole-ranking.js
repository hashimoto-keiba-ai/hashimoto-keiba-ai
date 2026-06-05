const phase92AiStoreKey = "phase8AiIndexEntries";
const phase92SortLabels = {
  godHoleIndex: "God Hole Index",
  longshotIndex: "Longshot Index",
  dangerPopularIndex: "Danger Popular Index"
};

function phase92ReadAiRecords() {
  try {
    return JSON.parse(localStorage.getItem(phase92AiStoreKey) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase92CourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "--";
}

function phase92Records() {
  const racecourse = document.getElementById("phase92-filter-racecourse")?.value || "";
  const distance = document.getElementById("phase92-filter-distance")?.value || "";
  const surface = document.getElementById("phase92-filter-surface")?.value || "";
  return phase92ReadAiRecords()
    .filter((entry) => !racecourse || entry.racecourse === racecourse)
    .filter((entry) => !distance || String(entry.distance || "") === distance)
    .filter((entry) => !surface || String(entry.surface || "") === surface);
}

function phase92Top(records, key, limit = 10) {
  return [...records]
    .filter((entry) => entry[key] !== undefined && entry[key] !== "")
    .sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))
    .slice(0, limit);
}

function phase92SetText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function phase92Card(entry, key, index) {
  return `
    <article class="rank-card">
      <span>#${index + 1} / ${phase8Escape(phase92CourseLabel(entry.racecourse))}</span>
      <strong>${phase8Escape(`${entry.horseNumber || ""} ${entry.horseName || ""}`.trim() || "Horse")}</strong>
      <p>${phase8Escape(entry.raceName || "Race")}</p>
      <dl>
        <div><dt>${phase8Escape(phase92SortLabels[key])}</dt><dd>${phase8Escape(entry[key] || "--")}</dd></div>
        <div><dt>AI Index</dt><dd>${phase8Escape(entry.aiIndex || "--")}</dd></div>
        <div><dt>Race Score</dt><dd>${phase8Escape(entry.raceScore || "--")}</dd></div>
        <div><dt>Rank</dt><dd>${phase8Escape(entry.predictionRank || "--")}</dd></div>
      </dl>
    </article>
  `;
}

function phase92RenderList(id, entries, key, emptyText) {
  const target = document.getElementById(id);
  if (!target) return;
  if (!entries.length) {
    target.innerHTML = `<p class="empty-state">${phase8Escape(emptyText)}</p>`;
    return;
  }
  target.innerHTML = entries.map((entry, index) => phase92Card(entry, key, index)).join("");
}

function phase92BuildFilters(records) {
  const racecourse = document.getElementById("phase92-filter-racecourse");
  const distance = document.getElementById("phase92-filter-distance");
  const surface = document.getElementById("phase92-filter-surface");
  if (!racecourse || !distance || !surface || racecourse.dataset.ready) return;

  racecourse.innerHTML = `<option value="">All racecourses</option>` + phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
  const distances = [...new Set(records.map((entry) => String(entry.distance || "")).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  distance.innerHTML = `<option value="">All distances</option>` + distances.map((item) => `<option value="${phase8Escape(item)}">${phase8Escape(item)}m</option>`).join("");
  const surfaces = [...new Set(records.map((entry) => String(entry.surface || "")).filter(Boolean))].sort();
  surface.innerHTML = `<option value="">All surfaces</option>` + surfaces.map((item) => `<option value="${phase8Escape(item)}">${phase8Escape(item)}</option>`).join("");
  [racecourse, distance, surface, document.getElementById("phase92-sort")].forEach((control) => control?.addEventListener("change", phase92Render));
  racecourse.dataset.ready = "true";
}

function phase92Render() {
  const allRecords = phase92ReadAiRecords();
  phase92BuildFilters(allRecords);
  const records = phase92Records();
  const sortKey = document.getElementById("phase92-sort")?.value || "godHoleIndex";
  phase92SetText("phase92-count", `${records.length.toLocaleString("ja-JP")} AI records`);
  phase92RenderList("phase92-primary-ranking", phase92Top(records, sortKey), sortKey, "No ranking records found.");
  phase92RenderList("phase92-god-hole-ranking", phase92Top(records, "godHoleIndex"), "godHoleIndex", "No God Hole records found.");
  phase92RenderList("phase92-longshot-ranking", phase92Top(records, "longshotIndex"), "longshotIndex", "No Longshot records found.");
  phase92RenderList("phase92-danger-ranking", phase92Top(records, "dangerPopularIndex"), "dangerPopularIndex", "No Danger Popular records found.");
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", phase92Render);
}
