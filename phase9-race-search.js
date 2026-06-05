const phase91Stores = [
  { key: "phase8PredictionEntries", type: "Prediction entry" },
  { key: "phase8ResultVerificationEntries", type: "Result entry" },
  { key: "phase8OsUpdateRules", type: "OS update" },
  { key: "phase8AiIndexEntries", type: "AI index entry" }
];

function phase91ReadStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase91CourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "--";
}

function phase91Text(value) {
  return String(value ?? "").trim();
}

function phase91Normalize(entry, type) {
  return {
    ...entry,
    type,
    raceName: phase91Text(entry.raceName || entry.verificationRace || entry.ruleTitle),
    racecourse: phase91Text(entry.racecourse),
    horseName: phase91Text(entry.horseName),
    jockey: phase91Text(entry.jockey),
    trainer: phase91Text(entry.trainer),
    distance: phase91Text(entry.distance),
    surface: phase91Text(entry.surface),
    searchable: [
      type,
      entry.raceName,
      entry.verificationRace,
      entry.ruleTitle,
      entry.ruleContent,
      phase91CourseLabel(entry.racecourse),
      entry.racecourse,
      entry.horseNumber,
      entry.horseName,
      entry.jockey,
      entry.trainer,
      entry.stable,
      entry.predictionMark,
      entry.verificationComment,
      entry.osUpdateComment,
      entry.notes,
      entry.aiIndex,
      entry.attackAiIndex,
      entry.dangerPopularIndex,
      entry.godHoleIndex,
      entry.longshotIndex,
      entry.raceScore,
      entry.predictionRank
    ].map(phase91Text).join(" ").toLowerCase()
  };
}

function phase91AllRecords() {
  return phase91Stores.flatMap((store) => phase91ReadStore(store.key).map((entry) => phase91Normalize(entry, store.type)));
}

function phase91MatchesFilters(record) {
  const query = phase91Text(document.getElementById("phase91-search")?.value).toLowerCase();
  const racecourse = phase91Text(document.getElementById("phase91-filter-racecourse")?.value);
  const distance = phase91Text(document.getElementById("phase91-filter-distance")?.value);
  const surface = phase91Text(document.getElementById("phase91-filter-surface")?.value);

  return (!query || record.searchable.includes(query))
    && (!racecourse || record.racecourse === racecourse)
    && (!distance || record.distance === distance)
    && (!surface || record.surface === surface);
}

function phase91BuildFilters(records) {
  const racecourse = document.getElementById("phase91-filter-racecourse");
  const distance = document.getElementById("phase91-filter-distance");
  const surface = document.getElementById("phase91-filter-surface");
  if (!racecourse || !distance || !surface || racecourse.dataset.ready) return;

  racecourse.innerHTML = `<option value="">All racecourses</option>` + phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");

  const distances = [...new Set(records.map((record) => record.distance).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  distance.innerHTML = `<option value="">All distances</option>` + distances.map((item) => `<option value="${phase8Escape(item)}">${phase8Escape(item)}m</option>`).join("");

  const surfaces = [...new Set(records.map((record) => record.surface).filter(Boolean))].sort();
  surface.innerHTML = `<option value="">All surfaces</option>` + surfaces.map((item) => `<option value="${phase8Escape(item)}">${phase8Escape(item)}</option>`).join("");

  [racecourse, distance, surface].forEach((control) => control.addEventListener("change", phase91Render));
  racecourse.dataset.ready = "true";
}

function phase91Summary(record) {
  if (record.type === "Prediction entry") return `${record.predictionMark || "--"} / AI score ${record.aiScore || "--"}`;
  if (record.type === "Result entry") return `Finish ${record.finishPosition || "--"} / Popularity ${record.popularity || "--"}`;
  if (record.type === "OS update") return `${record.importance || "--"} / ${record.condition || "--"}`;
  return `AI ${record.aiIndex || "--"} / Rank ${record.predictionRank || "--"}`;
}

function phase91RenderRecord(record) {
  return `
    <article class="search-result">
      <span>${phase8Escape(record.type)} / ${phase8Escape(phase91CourseLabel(record.racecourse))}</span>
      <strong>${phase8Escape(record.raceName || "Race record")}</strong>
      <p>${phase8Escape(record.horseName ? `${record.horseName} ${phase91Summary(record)}` : phase91Summary(record))}</p>
      <dl>
        <div><dt>Racecourse</dt><dd>${phase8Escape(phase91CourseLabel(record.racecourse))}</dd></div>
        <div><dt>Distance</dt><dd>${phase8Escape(record.distance || "--")}</dd></div>
        <div><dt>Surface</dt><dd>${phase8Escape(record.surface || "--")}</dd></div>
        <div><dt>Jockey</dt><dd>${phase8Escape(record.jockey || "--")}</dd></div>
        <div><dt>Trainer</dt><dd>${phase8Escape(record.trainer || "--")}</dd></div>
      </dl>
    </article>
  `;
}

function phase91Render() {
  const records = phase91AllRecords();
  phase91BuildFilters(records);
  const matches = records.filter(phase91MatchesFilters).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const target = document.getElementById("phase91-results");
  if (!target) return;

  document.getElementById("phase91-count").textContent = `${matches.length.toLocaleString("ja-JP")} records`;
  if (!matches.length) {
    target.innerHTML = `<p class="empty-state">No matching records.</p>`;
    return;
  }
  target.innerHTML = matches.map(phase91RenderRecord).join("");
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("phase91-search")?.addEventListener("input", phase91Render);
    document.getElementById("phase91-clear")?.addEventListener("click", () => {
      ["phase91-search", "phase91-filter-racecourse", "phase91-filter-distance", "phase91-filter-surface"].forEach((id) => {
        const control = document.getElementById(id);
        if (control) control.value = "";
      });
      phase91Render();
    });
    phase91Render();
  });
}
