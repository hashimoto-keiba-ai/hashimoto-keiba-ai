function phase92WidgetReadAiRecords() {
  try {
    return JSON.parse(localStorage.getItem("phase8AiIndexEntries") || "[]");
  } catch (_error) {
    return [];
  }
}

function phase92WidgetTop(records, key) {
  return [...records]
    .filter((entry) => entry[key] !== undefined && entry[key] !== "")
    .sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))
    .slice(0, 10);
}

function phase92WidgetCourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "--";
}

function phase92WidgetCard(entry, key, label, index) {
  return `
    <article class="dash-item">
      <span>#${index + 1} / ${phase8Escape(phase92WidgetCourseLabel(entry.racecourse))}</span>
      <strong>${phase8Escape(`${entry.horseNumber || ""} ${entry.horseName || ""}`.trim() || "Horse")}</strong>
      <p>${phase8Escape(label)} ${phase8Escape(entry[key] || "--")} / ${phase8Escape(entry.raceName || "Race")}</p>
    </article>
  `;
}

function phase92WidgetRenderList(id, records, key, label) {
  const target = document.getElementById(id);
  if (!target) return;
  const entries = phase92WidgetTop(records, key);
  target.innerHTML = entries.length
    ? entries.map((entry, index) => phase92WidgetCard(entry, key, label, index)).join("")
    : `<p class="empty-state">No ${phase8Escape(label)} records found.</p>`;
}

function phase92WidgetRender() {
  const records = phase92WidgetReadAiRecords();
  phase92WidgetRenderList("phase92-widget-god-hole", records, "godHoleIndex", "God Hole");
  phase92WidgetRenderList("phase92-widget-longshot", records, "longshotIndex", "Longshot");
  phase92WidgetRenderList("phase92-widget-danger", records, "dangerPopularIndex", "Danger Popular");
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", phase92WidgetRender);
}
