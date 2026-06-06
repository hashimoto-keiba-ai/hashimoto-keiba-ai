(function () {
  const racecourses = ["東京", "中山", "阪神", "京都", "中京", "福島", "新潟", "小倉", "函館", "札幌"];
  const requiredFields = ["開催日", "競馬場", "レース番号"];
  const entryFields = ["出走馬", "騎手", "調教師", "枠順", "馬番", "斤量"];
  const targetDatabase = "raceEntries";
  const fallbackDatabase = {
    databaseName: "raceEntryAutoImportDatabase",
    phase: "Phase14-2",
    records: [
      {
        importDate: "2026-06-06",
        開催日: "2026-06-06",
        競馬場: "東京",
        レース番号: 11,
        raceKey: "2026-06-06-東京-11R",
        importStatus: "Ready",
        recordCount: 6,
        targetDatabase,
        出走馬: [
          { 枠順: 1, 馬番: 1, 出走馬: "AI Commander", 騎手: "ルメール", 調教師: "木村哲也", 斤量: 57.0 },
          { 枠順: 2, 馬番: 2, 出走馬: "Index Star", 騎手: "川田将雅", 調教師: "中内田充正", 斤量: 57.0 },
          { 枠順: 3, 馬番: 3, 出走馬: "Kami Flash", 騎手: "坂井瑠星", 調教師: "矢作芳人", 斤量: 55.0 },
          { 枠順: 4, 馬番: 4, 出走馬: "Future Gate", 騎手: "戸崎圭太", 調教師: "国枝栄", 斤量: 57.0 },
          { 枠順: 5, 馬番: 5, 出走馬: "Danger Crown", 騎手: "横山武史", 調教師: "鹿戸雄一", 斤量: 57.0 },
          { 枠順: 6, 馬番: 6, 出走馬: "Longshot Gate", 騎手: "松山弘平", 調教師: "池添学", 斤量: 55.0 }
        ],
        notes: "開催日、競馬場、レース番号から出馬表を自動取込するPhase14-2 seed record."
      }
    ]
  };

  const sampleRoster = [
    ["AI Commander", "ルメール", "木村哲也", 57.0],
    ["Index Star", "川田将雅", "中内田充正", 57.0],
    ["Kami Flash", "坂井瑠星", "矢作芳人", 55.0],
    ["Future Gate", "戸崎圭太", "国枝栄", 57.0],
    ["Danger Crown", "横山武史", "鹿戸雄一", 57.0],
    ["Longshot Gate", "松山弘平", "池添学", 55.0],
    ["Course Bias", "武豊", "友道康夫", 57.0],
    ["Final Index", "松山弘平", "池添学", 56.0]
  ];

  function normalizeRaceNumber(value) {
    const text = String(value || "").replace(/R/gi, "").trim();
    const number = Number(text);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function createRaceKey(input) {
    const raceNumber = normalizeRaceNumber(input.レース番号 || input.raceNumber);
    return `${input.開催日 || input.date}-${input.競馬場 || input.racecourse}-${raceNumber || "--"}R`;
  }

  function validateRequest(input) {
    const request = input || {};
    const errors = [];
    if (!request.開催日 && !request.date) errors.push("開催日が未入力です");
    if (!request.競馬場 && !request.racecourse) errors.push("競馬場が未入力です");
    if (!normalizeRaceNumber(request.レース番号 || request.raceNumber)) errors.push("レース番号が不正です");
    if ((request.競馬場 || request.racecourse) && !racecourses.includes(request.競馬場 || request.racecourse)) errors.push("対応外の競馬場です");
    return errors;
  }

  function generateEntries(input) {
    const raceNumber = normalizeRaceNumber(input.レース番号 || input.raceNumber);
    const offset = Math.max(0, (raceNumber || 1) - 1) % sampleRoster.length;
    return sampleRoster.map((row, index) => {
      const roster = sampleRoster[(index + offset) % sampleRoster.length];
      return {
        枠順: Math.floor(index / 2) + 1,
        馬番: index + 1,
        出走馬: roster[0],
        騎手: roster[1],
        調教師: roster[2],
        斤量: roster[3]
      };
    });
  }

  function validateEntries(entries) {
    return entries.map((entry, index) => {
      const errors = [];
      entryFields.forEach((field) => {
        if (entry[field] === undefined || entry[field] === "") errors.push(`${field}が未入力です`);
      });
      if (Number(entry.枠順) < 1 || Number(entry.枠順) > 8) errors.push("枠順が不正です");
      if (Number(entry.馬番) < 1) errors.push("馬番が不正です");
      if (!Number.isFinite(Number(entry.斤量)) || Number(entry.斤量) <= 0) errors.push("斤量が不正です");
      return { index, entry, errors };
    });
  }

  function autoImportRaceEntries(input) {
    const request = input || {};
    const requestErrors = validateRequest(request);
    const normalizedRequest = {
      開催日: request.開催日 || request.date,
      競馬場: request.競馬場 || request.racecourse,
      レース番号: normalizeRaceNumber(request.レース番号 || request.raceNumber)
    };
    const entries = requestErrors.length ? [] : generateEntries(normalizedRequest);
    const validation = validateEntries(entries);
    const entryErrors = validation.reduce((total, item) => total + item.errors.length, 0);
    const errorCount = requestErrors.length + entryErrors;
    return {
      importDate: new Date().toISOString().slice(0, 10),
      ...normalizedRequest,
      raceKey: createRaceKey(normalizedRequest),
      importStatus: errorCount ? "Import Blocked" : "Imported",
      recordCount: entries.length,
      targetDatabase,
      出走馬: entries,
      validation,
      errorCount,
      errors: requestErrors,
      notes: errorCount ? "入力内容と出馬表フィールドを確認してください。" : "出走馬、騎手、調教師、枠順、馬番、斤量を自動取込しました。"
    };
  }

  function buildRaceEntriesPayload(importRecord) {
    return {
      storageVersion: 1,
      type: "raceEntries",
      provider: "race-entry-auto-import",
      updatedAt: new Date().toISOString(),
      items: (importRecord.出走馬 || []).map((entry) => ({
        date: importRecord.開催日,
        racecourse: importRecord.競馬場,
        raceNumber: importRecord.レース番号,
        frameNumber: entry.枠順,
        horseNumber: entry.馬番,
        horseName: entry.出走馬,
        jockey: entry.騎手,
        trainer: entry.調教師,
        carriedWeight: entry.斤量
      }))
    };
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = source.records || [];
    const latest = records[0] || null;
    return {
      databaseName: source.databaseName || "raceEntryAutoImportDatabase",
      phase: source.phase || "Phase14-2",
      racecourses,
      requiredFields,
      entryFields,
      targetDatabase,
      records,
      widget: {
        latestRace: latest ? latest.raceKey : "--",
        recordCount: latest ? latest.recordCount : 0,
        importStatus: latest ? latest.importStatus : "--",
        targetDatabase
      }
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderCards(id, items, renderer) {
    const element = document.getElementById(id);
    if (!element) return;
    element.innerHTML = items.map(renderer).join("");
  }

  function renderEntries(entries) {
    const table = document.getElementById("phase142-entry-table");
    if (!table) return;
    table.innerHTML = entries.map((entry) => `<tr><td>${entry.枠順}</td><td>${entry.馬番}</td><td>${entry.出走馬}</td><td>${entry.騎手}</td><td>${entry.調教師}</td><td>${entry.斤量}</td></tr>`).join("");
  }

  function renderDashboard(report) {
    const latest = report.records[0];
    setText("phase142-widget-race", report.widget.latestRace);
    setText("phase142-widget-count", `${report.widget.recordCount}`);
    setText("phase142-widget-status", report.widget.importStatus);
    setText("phase142-widget-target", report.widget.targetDatabase);
    renderCards("phase142-required-fields", report.requiredFields, (field) => `<article><span>${field}</span><strong>入力</strong><em>自動取込キー</em></article>`);
    renderCards("phase142-entry-fields", report.entryFields, (field) => `<article><span>${field}</span><strong>取込</strong><em>出馬表フィールド</em></article>`);
    renderEntries(latest ? latest.出走馬 : []);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") return fallbackDatabase;
    try {
      const response = await fetch("data/raceEntryAutoImportDatabase.json", { cache: "no-store" });
      if (!response.ok) throw new Error("raceEntryAutoImportDatabase fetch failed");
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  function readFormRequest() {
    return {
      開催日: document.getElementById("phase142-date")?.value,
      競馬場: document.getElementById("phase142-racecourse")?.value,
      レース番号: document.getElementById("phase142-race-number")?.value
    };
  }

  function attachForm() {
    const button = document.getElementById("phase142-auto-import");
    if (!button) return;
    button.addEventListener("click", () => {
      const record = autoImportRaceEntries(readFormRequest());
      setText("phase142-widget-race", record.raceKey);
      setText("phase142-widget-count", `${record.recordCount}`);
      setText("phase142-widget-status", record.importStatus);
      setText("phase142-widget-target", record.targetDatabase);
      renderEntries(record.出走馬);
      window.HashimotoPhase142LatestRaceEntriesPayload = buildRaceEntriesPayload(record);
    });
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderDashboard(report);
    attachForm();
    window.HashimotoPhase142RaceEntryAutoImportReport = report;
  }

  window.HashimotoPhase142RaceEntryAutoImport = {
    autoImportRaceEntries,
    buildDashboard,
    buildRaceEntriesPayload,
    fallbackDatabase,
    generateEntries,
    racecourses,
    requiredFields,
    entryFields,
    validateEntries,
    validateRequest
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
