const phase87StorageKeys = {
  predictions: "phase8PredictionEntries",
  results: "phase8ResultVerificationEntries",
  osUpdates: "phase8OsUpdateRules",
  aiRecords: "phase8AiIndexEntries"
};

function phase87ReadStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function phase87CourseLabel(courseId) {
  const course = phase8Racecourses.find((item) => item.id === courseId);
  return course ? `${course.label} / ${course.name}` : courseId || "All racecourses";
}

function phase87SelectedCourseId() {
  return document.getElementById("phase87-racecourse-selector")?.value || "all";
}

function phase87SelectedCourseFilter(entries) {
  const selected = phase87SelectedCourseId();
  return selected === "all" ? entries : entries.filter((entry) => entry.racecourse === selected);
}

function phase87SortNewest(entries) {
  return [...entries].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function phase87TopNumber(entries, key, limit = 5) {
  return [...entries]
    .filter((entry) => entry[key] !== undefined && entry[key] !== "")
    .sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))
    .slice(0, limit);
}

function phase87SetText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function phase87RenderList(id, entries, renderer, emptyText) {
  const target = document.getElementById(id);
  if (!target) return;
  if (!entries.length) {
    target.innerHTML = `<p class="empty-state">${phase8Escape(emptyText)}</p>`;
    return;
  }
  target.innerHTML = entries.map(renderer).join("");
}

function phase87MiniCard(title, body, meta = "") {
  return `
    <article class="dash-item">
      <span>${phase8Escape(meta)}</span>
      <strong>${phase8Escape(title || "--")}</strong>
      <p>${phase8Escape(body || "--")}</p>
    </article>
  `;
}

function phase87Render() {
  const predictions = phase87SelectedCourseFilter(phase87ReadStore(phase87StorageKeys.predictions));
  const results = phase87SelectedCourseFilter(phase87ReadStore(phase87StorageKeys.results));
  const osUpdates = phase87SelectedCourseFilter(phase87ReadStore(phase87StorageKeys.osUpdates));
  const aiRecords = phase87SelectedCourseFilter(phase87ReadStore(phase87StorageKeys.aiRecords));

  phase87SetText("phase87-total-predictions", predictions.length.toLocaleString("ja-JP"));
  phase87SetText("phase87-total-results", results.length.toLocaleString("ja-JP"));
  phase87SetText("phase87-total-os-updates", osUpdates.length.toLocaleString("ja-JP"));
  phase87SetText("phase87-total-ai-records", aiRecords.length.toLocaleString("ja-JP"));
  phase87SetText("phase87-last-refresh", new Date().toLocaleString("ja-JP"));

  phase87RenderList("phase87-ai-ranking", phase87TopNumber(aiRecords, "aiIndex"), (entry) =>
    phase87MiniCard(`${entry.horseNumber || ""} ${entry.horseName || ""}`, `AI Index ${entry.aiIndex || "--"} / Race Score ${entry.raceScore || "--"}`, `${phase87CourseLabel(entry.racecourse)} / ${entry.raceName || "Race"}`),
    "No AI Index records found."
  );

  phase87RenderList("phase87-god-hole-ranking", phase87TopNumber(aiRecords, "godHoleIndex"), (entry) =>
    phase87MiniCard(`${entry.horseNumber || ""} ${entry.horseName || ""}`, `God Hole ${entry.godHoleIndex || "--"} / Rank ${entry.predictionRank || "--"}`, `${phase87CourseLabel(entry.racecourse)} / ${entry.raceName || "Race"}`),
    "No God Hole records found."
  );

  phase87RenderList("phase87-danger-popular", phase87TopNumber(aiRecords, "dangerPopularIndex"), (entry) =>
    phase87MiniCard(`${entry.horseNumber || ""} ${entry.horseName || ""}`, `Danger Popular ${entry.dangerPopularIndex || "--"} / Longshot ${entry.longshotIndex || "--"}`, `${phase87CourseLabel(entry.racecourse)} / ${entry.raceName || "Race"}`),
    "No danger popular horses found."
  );

  phase87RenderList("phase87-predictions", phase87SortNewest(predictions).slice(0, 5), (entry) =>
    phase87MiniCard(`${entry.horseNumber || ""} ${entry.horseName || ""}`, `${entry.predictionMark || "--"} / AI score ${entry.aiScore || "--"}`, `${phase87CourseLabel(entry.racecourse)} / ${entry.raceName || "Race"}`),
    "No prediction entries found."
  );

  phase87RenderList("phase87-results", phase87SortNewest(results).slice(0, 5), (entry) =>
    phase87MiniCard(`${entry.horseNumber || ""} ${entry.horseName || ""}`, `Finish ${entry.finishPosition || "--"} / Popularity ${entry.popularity || "--"}`, `${phase87CourseLabel(entry.racecourse)} / ${entry.raceName || "Race"}`),
    "No result entries found."
  );

  phase87RenderList("phase87-os-updates", phase87SortNewest(osUpdates).slice(0, 5), (entry) =>
    phase87MiniCard(entry.ruleTitle || "OS rule", `${entry.importance || "--"} / ${entry.distance || "--"}m ${entry.surface || ""}`, `${phase87CourseLabel(entry.racecourse)} / ${entry.verificationRace || "Verification pending"}`),
    "No OS update entries found."
  );
}

function phase87InitSelector() {
  const selector = document.getElementById("phase87-racecourse-selector");
  if (!selector) return;
  selector.innerHTML = `<option value="all">All racecourses</option>` + phase8Racecourses.map((course) => `<option value="${phase8Escape(course.id)}">${phase8Escape(course.label)} / ${phase8Escape(course.name)}</option>`).join("");
  selector.addEventListener("change", phase87Render);
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    phase87InitSelector();
    document.getElementById("phase87-refresh")?.addEventListener("click", phase87Render);
    phase87Render();
  });
}
