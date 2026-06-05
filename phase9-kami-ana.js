const phase94KamiAnaStoreKey = "kamiAnaDatabase";
const phase94AiStoreKey = "phase8AiIndexEntries";

function phase94ReadStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase94WriteKamiAna(entries) {
  localStorage.setItem(phase94KamiAnaStoreKey, JSON.stringify(entries));
}

function phase94CourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "--";
}

function phase94Zone(popularity) {
  const value = Number(popularity || 0);
  if (value >= 4 && value <= 9) return "C-zone";
  if (value >= 10 && value <= 18) return "D-zone";
  return "Outside";
}

function phase94ManualRecords() {
  return phase94ReadStore(phase94KamiAnaStoreKey).map((entry) => ({ ...entry, source: "Kami-Ana database", popularityZone: phase94Zone(entry.popularity) }));
}

function phase94AiRecords() {
  return phase94ReadStore(phase94AiStoreKey)
    .filter((entry) => Number(entry.predictionRank || 0) >= 4 && Number(entry.predictionRank || 0) <= 18)
    .map((entry) => ({
      id: entry.id,
      source: "AI index database",
      horseName: entry.horseName,
      racecourse: entry.racecourse,
      raceName: entry.raceName,
      distance: entry.distance,
      surface: entry.surface,
      trackCondition: entry.trackCondition || "",
      popularity: entry.predictionRank,
      odds: "",
      jockey: entry.jockey || "",
      trainer: entry.trainer || "",
      stable: entry.stable || "",
      runningStyle: "",
      expectedCornerPosition: "",
      godHoleIndex: entry.godHoleIndex,
      longshotIndex: entry.longshotIndex,
      explosiveScore: entry.raceScore,
      reason: entry.notes || "Connected from AI index database",
      recommendedUse: "AI index review",
      date: entry.createdAt ? String(entry.createdAt).slice(0, 10) : "",
      createdAt: entry.createdAt,
      popularityZone: phase94Zone(entry.predictionRank)
    }));
}

function phase94AllRecords() {
  return [...phase94ManualRecords(), ...phase94AiRecords()];
}

function phase94FilteredRecords() {
  const racecourse = document.getElementById("phase94-filter-racecourse")?.value || "";
  const distance = document.getElementById("phase94-filter-distance")?.value || "";
  const surface = document.getElementById("phase94-filter-surface")?.value || "";
  const track = document.getElementById("phase94-filter-track")?.value || "";
  const zone = document.getElementById("phase94-filter-zone")?.value || "";
  const date = document.getElementById("phase94-filter-date")?.value || "";
  return phase94AllRecords()
    .filter((entry) => !racecourse || entry.racecourse === racecourse)
    .filter((entry) => !distance || String(entry.distance || "") === distance)
    .filter((entry) => !surface || String(entry.surface || "") === surface)
    .filter((entry) => !track || String(entry.trackCondition || "") === track)
    .filter((entry) => !zone || entry.popularityZone === zone)
    .filter((entry) => !date || entry.date === date);
}

function phase94Top(records, key, limit = 20) {
  return [...records]
    .filter((entry) => entry[key] !== undefined && entry[key] !== "")
    .sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))
    .slice(0, limit);
}

function phase94SortedTop(records) {
  const key = document.getElementById("phase94-sort")?.value || "explosiveScore";
  return phase94Top(records, key, 20);
}

function phase94BuildFilters(records) {
  const racecourse = document.getElementById("phase94-filter-racecourse");
  const distance = document.getElementById("phase94-filter-distance");
  const surface = document.getElementById("phase94-filter-surface");
  const track = document.getElementById("phase94-filter-track");
  if (!racecourse || !distance || !surface || !track || racecourse.dataset.ready) return;
  racecourse.innerHTML = `<option value="">All racecourses</option>` + phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
  const fill = (target, label, values, suffix = "") => {
    target.innerHTML = `<option value="">All ${label}</option>` + [...new Set(values.filter(Boolean))].sort((a, b) => Number(a) - Number(b)).map((item) => `<option value="${phase8Escape(item)}">${phase8Escape(item)}${suffix}</option>`).join("");
  };
  fill(distance, "distances", records.map((entry) => String(entry.distance || "")), "m");
  fill(surface, "surfaces", records.map((entry) => String(entry.surface || "")));
  fill(track, "track conditions", records.map((entry) => String(entry.trackCondition || "")));
  [racecourse, distance, surface, track, document.getElementById("phase94-filter-zone"), document.getElementById("phase94-filter-date"), document.getElementById("phase94-sort")].forEach((control) => control?.addEventListener("change", phase94Render));
  racecourse.dataset.ready = "true";
}

function phase94Card(entry, key, index) {
  return `
    <article class="kami-card">
      <span>#${index + 1} / ${phase8Escape(entry.source)} / ${phase8Escape(entry.popularityZone)}</span>
      <strong>${phase8Escape(entry.horseName || "Horse")}</strong>
      <p>${phase8Escape(entry.raceName || "Race")} / ${phase8Escape(phase94CourseLabel(entry.racecourse))}</p>
      <dl>
        <div><dt>${phase8Escape(key)}</dt><dd>${phase8Escape(entry[key] || "--")}</dd></div>
        <div><dt>Popularity</dt><dd>${phase8Escape(entry.popularity || "--")}</dd></div>
        <div><dt>Odds</dt><dd>${phase8Escape(entry.odds || "--")}</dd></div>
        <div><dt>God Hole</dt><dd>${phase8Escape(entry.godHoleIndex || "--")}</dd></div>
        <div><dt>Longshot</dt><dd>${phase8Escape(entry.longshotIndex || "--")}</dd></div>
        <div><dt>Explosive</dt><dd>${phase8Escape(entry.explosiveScore || "--")}</dd></div>
      </dl>
      <p>${phase8Escape(entry.reason || "No reason recorded")}</p>
    </article>
  `;
}

function phase94RenderList(id, records, key, emptyText) {
  const target = document.getElementById(id);
  if (!target) return;
  target.innerHTML = records.length ? records.map((entry, index) => phase94Card(entry, key, index)).join("") : `<p class="empty-state">${phase8Escape(emptyText)}</p>`;
}

function phase94Render() {
  const allRecords = phase94AllRecords();
  phase94BuildFilters(allRecords);
  const records = phase94FilteredRecords();
  document.getElementById("phase94-count").textContent = `${records.length.toLocaleString("ja-JP")} Kami-Ana records`;
  phase94RenderList("phase94-kami-ranking", phase94SortedTop(records), document.getElementById("phase94-sort")?.value || "explosiveScore", "No Kami-Ana records found.");
  phase94RenderList("phase94-longshot-ranking", phase94Top(records, "longshotIndex"), "longshotIndex", "No Longshot records found.");
  phase94RenderList("phase94-c-zone-ranking", phase94Top(records.filter((entry) => entry.popularityZone === "C-zone"), "explosiveScore"), "explosiveScore", "No C-zone candidates found.");
  phase94RenderList("phase94-d-zone-ranking", phase94Top(records.filter((entry) => entry.popularityZone === "D-zone"), "explosiveScore"), "explosiveScore", "No D-zone candidates found.");
}

function phase94BindForm() {
  const form = document.getElementById("phase94-form");
  if (!form || form.dataset.ready) return;
  const course = document.getElementById("phase94-racecourse");
  if (course) course.innerHTML = phase8Racecourses.map((item) => `<option value="${phase8Escape(item.id)}">${phase8Escape(item.label)} / ${phase8Escape(item.name)}</option>`).join("");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = {
      id: `phase94-${Date.now()}`,
      createdAt: new Date().toISOString(),
      horseName: String(formData.get("horseName") || "").trim(),
      racecourse: String(formData.get("racecourse") || ""),
      raceName: String(formData.get("raceName") || "").trim(),
      distance: String(formData.get("distance") || "").trim(),
      surface: String(formData.get("surface") || "").trim(),
      trackCondition: String(formData.get("trackCondition") || "").trim(),
      popularity: String(formData.get("popularity") || "").trim(),
      odds: String(formData.get("odds") || "").trim(),
      jockey: String(formData.get("jockey") || "").trim(),
      trainer: String(formData.get("trainer") || "").trim(),
      stable: String(formData.get("stable") || "").trim(),
      runningStyle: String(formData.get("runningStyle") || "").trim(),
      expectedCornerPosition: String(formData.get("expectedCornerPosition") || "").trim(),
      godHoleIndex: String(formData.get("godHoleIndex") || "").trim(),
      longshotIndex: String(formData.get("longshotIndex") || "").trim(),
      explosiveScore: String(formData.get("explosiveScore") || "").trim(),
      reason: String(formData.get("reason") || "").trim(),
      recommendedUse: String(formData.get("recommendedUse") || "").trim(),
      date: String(formData.get("date") || "").trim()
    };
    const entries = phase94ReadStore(phase94KamiAnaStoreKey);
    entries.push(entry);
    phase94WriteKamiAna(entries);
    form.reset();
    phase94Render();
    document.getElementById("phase94-status").textContent = "Saved to localStorage";
  });
  form.dataset.ready = "true";
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    phase94BindForm();
    phase94Render();
  });
}
