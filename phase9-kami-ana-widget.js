function phase94WidgetRead(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase94WidgetCourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "--";
}

function phase94WidgetZone(popularity) {
  const value = Number(popularity || 0);
  if (value >= 4 && value <= 9) return "C-zone";
  if (value >= 10 && value <= 18) return "D-zone";
  return "Outside";
}

function phase94WidgetRecords() {
  const manual = phase94WidgetRead("kamiAnaDatabase").map((entry) => ({
    ...entry,
    source: "Kami-Ana database",
    popularityZone: phase94WidgetZone(entry.popularity)
  }));

  const ai = phase94WidgetRead("phase8AiIndexEntries")
    .filter((entry) => Number(entry.predictionRank || 0) >= 4 && Number(entry.predictionRank || 0) <= 18)
    .map((entry) => ({
      source: "AI index database",
      horseName: entry.horseName,
      racecourse: entry.racecourse,
      raceName: entry.raceName,
      popularity: entry.predictionRank,
      odds: "",
      godHoleIndex: entry.godHoleIndex,
      longshotIndex: entry.longshotIndex,
      explosiveScore: entry.raceScore,
      reason: entry.notes || "Connected from AI index database",
      popularityZone: phase94WidgetZone(entry.predictionRank)
    }));

  return [...manual, ...ai];
}

function phase94WidgetTop(records, key, limit = 5) {
  return [...records]
    .filter((entry) => entry[key] !== undefined && entry[key] !== "")
    .sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))
    .slice(0, limit);
}

function phase94WidgetCard(entry, key, label, index) {
  return `<article class="dash-item"><span>#${index + 1} / ${phase8Escape(entry.source)} / ${phase8Escape(entry.popularityZone)}</span><strong>${phase8Escape(entry.horseName || "Horse")}</strong><p>${phase8Escape(label)} ${phase8Escape(entry[key] || "--")} / ${phase8Escape(phase94WidgetCourseLabel(entry.racecourse))}</p></article>`;
}

function phase94WidgetRenderList(id, entries, key, label) {
  const target = document.getElementById(id);
  if (!target) return;
  target.innerHTML = entries.length
    ? entries.map((entry, index) => phase94WidgetCard(entry, key, label, index)).join("")
    : `<p class="empty-state">No ${phase8Escape(label)} records found.</p>`;
}

function phase94WidgetRender() {
  const records = phase94WidgetRecords();
  phase94WidgetRenderList("phase94-widget-kami-top5", phase94WidgetTop(records, "explosiveScore"), "explosiveScore", "Kami-Ana");
  phase94WidgetRenderList("phase94-widget-longshot-top5", phase94WidgetTop(records, "longshotIndex"), "longshotIndex", "Longshot");
  phase94WidgetRenderList("phase94-widget-c-zone-top5", phase94WidgetTop(records.filter((entry) => entry.popularityZone === "C-zone"), "explosiveScore"), "explosiveScore", "C-zone");
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", phase94WidgetRender);
}
