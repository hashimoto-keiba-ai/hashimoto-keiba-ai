function phase93WidgetRead(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase93WidgetCourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "--";
}

function phase93WidgetRecords() {
  const manual = phase93WidgetRead("phase9DangerPopularHorses").map((entry) => ({ ...entry, source: "Danger database" }));
  const ai = phase93WidgetRead("phase8AiIndexEntries")
    .filter((entry) => entry.dangerPopularIndex !== undefined && entry.dangerPopularIndex !== "")
    .map((entry) => ({
      source: "AI index database",
      horseName: entry.horseName,
      racecourse: entry.racecourse,
      distance: entry.distance,
      surface: entry.surface,
      dangerScore: entry.dangerPopularIndex,
      reason: entry.notes || `Danger Popular Index ${entry.dangerPopularIndex}`,
      date: entry.createdAt ? String(entry.createdAt).slice(0, 10) : "",
      raceName: entry.raceName
    }));
  return [...manual, ...ai].sort((a, b) => Number(b.dangerScore || 0) - Number(a.dangerScore || 0)).slice(0, 20);
}

function phase93WidgetCard(entry, index) {
  return `
    <article class="dash-item">
      <span>#${index + 1} / ${phase8Escape(entry.source)} / ${phase8Escape(phase93WidgetCourseLabel(entry.racecourse))}</span>
      <strong>${phase8Escape(entry.horseName || "Horse")}</strong>
      <p>Danger ${phase8Escape(entry.dangerScore || "--")} / ${phase8Escape(entry.reason || entry.raceName || "No reason")}</p>
    </article>
  `;
}

function phase93WidgetRender() {
  const target = document.getElementById("phase93-widget-danger-top20");
  if (!target) return;
  const records = phase93WidgetRecords();
  target.innerHTML = records.length ? records.map(phase93WidgetCard).join("") : `<p class="empty-state">No danger horse records found.</p>`;
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", phase93WidgetRender);
}
