const phase93DangerStoreKey = "phase9DangerPopularHorses";
const phase93AiStoreKey = "phase8AiIndexEntries";

function phase93ReadStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase93WriteDanger(entries) {
  localStorage.setItem(phase93DangerStoreKey, JSON.stringify(entries));
}

function phase93CourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "--";
}

function phase93ManualRecords() {
  return phase93ReadStore(phase93DangerStoreKey).map((entry) => ({ ...entry, source: "Danger database" }));
}

function phase93AiRecords() {
  return phase93ReadStore(phase93AiStoreKey)
    .filter((entry) => entry.dangerPopularIndex !== undefined && entry.dangerPopularIndex !== "")
    .map((entry) => ({
      id: entry.id,
      source: "AI index database",
      horseName: entry.horseName,
      racecourse: entry.racecourse,
      distance: entry.distance,
      surface: entry.surface,
      dangerScore: entry.dangerPopularIndex,
      reason: entry.notes || `AI Danger Popular Index ${entry.dangerPopularIndex}`,
      date: entry.createdAt ? String(entry.createdAt).slice(0, 10) : "",
      raceName: entry.raceName,
      createdAt: entry.createdAt
    }));
}

function phase93AllRecords() {
  return [...phase93ManualRecords(), ...phase93AiRecords()];
}

function phase93Filter(records) {
  const racecourse = document.getElementById("phase93-filter-racecourse")?.value || "";
  const distance = document.getElementById("phase93-filter-distance")?.value || "";
  const surface = document.getElementById("phase93-filter-surface")?.value || "";
  const date = document.getElementById("phase93-filter-date")?.value || "";
  return records
    .filter((entry) => !racecourse || entry.racecourse === racecourse)
    .filter((entry) => !distance || String(entry.distance || "") === distance)
    .filter((entry) => !surface || String(entry.surface || "") === surface)
    .filter((entry) => !date || entry.date === date);
}

function phase93Top(records, limit = 20) {
  return [...records].sort((a, b) => Number(b.dangerScore || 0) - Number(a.dangerScore || 0)).slice(0, limit);
}

function phase93BuildFilters(records) {
  const racecourse = document.getElementById("phase93-filter-racecourse");
  const distance = document.getElementById("phase93-filter-distance");
  const surface = document.getElementById("phase93-filter-surface");
  if (!racecourse || !distance || !surface || racecourse.dataset.ready) return;
  racecourse.innerHTML = `<option value="">All racecourses</option>` + phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
  const distances = [...new Set(records.map((entry) => String(entry.distance || "")).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  distance.innerHTML = `<option value="">All distances</option>` + distances.map((item) => `<option value="${phase8Escape(item)}">${phase8Escape(item)}m</option>`).join("");
  const surfaces = [...new Set(records.map((entry) => String(entry.surface || "")).filter(Boolean))].sort();
  surface.innerHTML = `<option value="">All surfaces</option>` + surfaces.map((item) => `<option value="${phase8Escape(item)}">${phase8Escape(item)}</option>`).join("");
  [racecourse, distance, surface, document.getElementById("phase93-filter-date")].forEach((control) => control?.addEventListener("change", phase93Render));
  racecourse.dataset.ready = "true";
}

function phase93Card(entry, index) {
  return `
    <article class="danger-card">
      <span>#${index + 1} / ${phase8Escape(entry.source)} / ${phase8Escape(phase93CourseLabel(entry.racecourse))}</span>
      <strong>${phase8Escape(entry.horseName || "Horse")}</strong>
      <p>${phase8Escape(entry.reason || "No reason recorded")}</p>
      <dl>
        <div><dt>Danger score</dt><dd>${phase8Escape(entry.dangerScore || "--")}</dd></div>
        <div><dt>Race</dt><dd>${phase8Escape(entry.raceName || "--")}</dd></div>
        <div><dt>Distance</dt><dd>${phase8Escape(entry.distance || "--")}</dd></div>
        <div><dt>Surface</dt><dd>${phase8Escape(entry.surface || "--")}</dd></div>
        <div><dt>Date</dt><dd>${phase8Escape(entry.date || "--")}</dd></div>
      </dl>
    </article>
  `;
}

function phase93Render() {
  const allRecords = phase93AllRecords();
  phase93BuildFilters(allRecords);
  const records = phase93Top(phase93Filter(allRecords));
  const target = document.getElementById("phase93-ranking");
  if (!target) return;
  document.getElementById("phase93-count").textContent = `${records.length.toLocaleString("ja-JP")} danger horses`;
  target.innerHTML = records.length ? records.map(phase93Card).join("") : `<p class="empty-state">No danger horse records found.</p>`;
}

function phase93BindForm() {
  const form = document.getElementById("phase93-form");
  if (!form || form.dataset.ready) return;
  const course = document.getElementById("phase93-racecourse");
  if (course) course.innerHTML = phase8Racecourses.map((item) => `<option value="${phase8Escape(item.id)}">${phase8Escape(item.label)} / ${phase8Escape(item.name)}</option>`).join("");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = {
      id: `phase93-${Date.now()}`,
      createdAt: new Date().toISOString(),
      horseName: String(formData.get("horseName") || "").trim(),
      racecourse: String(formData.get("racecourse") || ""),
      distance: String(formData.get("distance") || "").trim(),
      surface: String(formData.get("surface") || "").trim(),
      dangerScore: String(formData.get("dangerScore") || "").trim(),
      reason: String(formData.get("reason") || "").trim(),
      date: String(formData.get("date") || "").trim()
    };
    const entries = phase93ReadStore(phase93DangerStoreKey);
    entries.push(entry);
    phase93WriteDanger(entries);
    form.reset();
    phase93Render();
    const status = document.getElementById("phase93-status");
    if (status) status.textContent = "Saved to localStorage";
  });
  form.dataset.ready = "true";
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    phase93BindForm();
    phase93Render();
  });
}
