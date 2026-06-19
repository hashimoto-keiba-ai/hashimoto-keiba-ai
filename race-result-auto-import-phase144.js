(function () {
  const racecourses = ["東京", "中山", "阪神", "京都", "中京", "福島", "新潟", "小倉", "函館", "札幌"];
  const requiredFields = ["開催日", "競馬場", "レース番号"];
  const resultFields = ["着順", "上がり", "4角位置", "払戻", "ラップ"];
  const payoutTypes = ["単勝", "複勝", "馬連", "馬単", "三連複", "三連単", "WIN5"];
  const targetDatabases = ["raceResults", "results", "ROI Database", "Self Learning"];
  const fallbackDatabase = {
    databaseName: "raceResultAutoImportDatabase",
    phase: "Phase14-4",
    records: [
      {
        importDate: "2026-06-06",
        開催日: "2026-06-06",
        競馬場: "東京",
        レース番号: 11,
        raceKey: "2026-06-06-東京-11R",
        importStatus: "Ready",
        recordCount: 6,
        targetDatabases,
        着順: [
          { 着順: 1, 馬番: 1, 馬名: "AI Commander", 上がり: 33.8, "4角位置": 2 },
          { 着順: 2, 馬番: 3, 馬名: "Kami Flash", 上がり: 33.5, "4角位置": 6 },
          { 着順: 3, 馬番: 5, 馬名: "Danger Crown", 上がり: 34.1, "4角位置": 1 },
          { 着順: 4, 馬番: 2, 馬名: "Index Star", 上がり: 34.0, "4角位置": 4 },
          { 着順: 5, 馬番: 6, 馬名: "Longshot Gate", 上がり: 33.9, "4角位置": 8 },
          { 着順: 6, 馬番: 4, 馬名: "Future Gate", 上がり: 34.7, "4角位置": 3 }
        ],
        払戻: { 単勝: 420, 複勝: 170, 馬連: 1280, 馬単: 2480, 三連複: 4860, 三連単: 18420, WIN5: 38600 },
        ラップ: ["12.5", "11.1", "11.4", "11.8", "11.9", "11.6", "11.2", "12.0"],
        notes: "着順、上がり、4角位置、払戻、ラップを結果検証へ自動取込するPhase14-4 seed record."
      }
    ]
  };

  const sampleResults = [
    [1, "AI Commander", 33.8, 2],
    [3, "Kami Flash", 33.5, 6],
    [5, "Danger Crown", 34.1, 1],
    [2, "Index Star", 34.0, 4],
    [6, "Longshot Gate", 33.9, 8],
    [4, "Future Gate", 34.7, 3],
    [7, "Course Bias", 35.0, 5],
    [8, "Final Index", 35.2, 7]
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

  function generateFinishOrder(input) {
    const raceNumber = normalizeRaceNumber(input.レース番号 || input.raceNumber);
    const offset = Math.max(0, (raceNumber || 1) - 1) % sampleResults.length;
    return sampleResults.map((row, index) => {
      const result = sampleResults[(index + offset) % sampleResults.length];
      return {
        着順: index + 1,
        馬番: result[0],
        馬名: result[1],
        上がり: result[2],
        "4角位置": result[3]
      };
    });
  }

  function generatePayouts(input) {
    const raceNumber = normalizeRaceNumber(input.レース番号 || input.raceNumber) || 1;
    const multiplier = Math.max(1, raceNumber);
    return {
      単勝: 180 + multiplier * 20,
      複勝: 120 + multiplier * 5,
      馬連: 780 + multiplier * 40,
      馬単: 1480 + multiplier * 80,
      三連複: 3200 + multiplier * 160,
      三連単: 10800 + multiplier * 520,
      WIN5: 22000 + multiplier * 1400
    };
  }

  function generateLaps(input) {
    const raceNumber = normalizeRaceNumber(input.レース番号 || input.raceNumber) || 1;
    return [12.4, 11.2, 11.5, 11.8, 11.9, 11.6, 11.3, 12.0].map((lap, index) => (lap + ((raceNumber + index) % 3) * 0.1).toFixed(1));
  }

  function validateResults(finishOrder, payouts, laps) {
    const errors = [];
    finishOrder.forEach((record) => {
      if (!Number.isFinite(Number(record.着順)) || Number(record.着順) < 1) errors.push("着順が不正です");
      if (!Number.isFinite(Number(record.馬番)) || Number(record.馬番) < 1) errors.push("馬番が不正です");
      if (!Number.isFinite(Number(record.上がり)) || Number(record.上がり) <= 0) errors.push("上がりが不正です");
      if (!Number.isFinite(Number(record["4角位置"])) || Number(record["4角位置"]) < 1) errors.push("4角位置が不正です");
    });
    payoutTypes.forEach((type) => {
      if (!Number.isFinite(Number(payouts[type])) || Number(payouts[type]) < 0) errors.push(`${type}払戻が不正です`);
    });
    if (!laps.length || laps.some((lap) => !Number.isFinite(Number(lap)) || Number(lap) <= 0)) errors.push("ラップが不正です");
    return errors;
  }

  function autoImportRaceResults(input) {
    const request = input || {};
    const requestErrors = validateRequest(request);
    const normalizedRequest = {
      開催日: request.開催日 || request.date,
      競馬場: request.競馬場 || request.racecourse,
      レース番号: normalizeRaceNumber(request.レース番号 || request.raceNumber)
    };
    const finishOrder = requestErrors.length ? [] : generateFinishOrder(normalizedRequest);
    const payouts = requestErrors.length ? {} : generatePayouts(normalizedRequest);
    const laps = requestErrors.length ? [] : generateLaps(normalizedRequest);
    const resultErrors = validateResults(finishOrder, payouts, laps);
    const errorCount = requestErrors.length + resultErrors.length;
    return {
      importDate: new Date().toISOString().slice(0, 10),
      ...normalizedRequest,
      raceKey: createRaceKey(normalizedRequest),
      importStatus: errorCount ? "Import Blocked" : "Imported",
      recordCount: finishOrder.length,
      targetDatabases,
      着順: finishOrder,
      払戻: payouts,
      ラップ: laps,
      errorCount,
      errors: [...requestErrors, ...resultErrors],
      notes: errorCount ? "結果データを確認してください。" : "着順、上がり、4角位置、払戻、ラップを自動取込しました。"
    };
  }

  function buildRaceResultsPayload(importRecord) {
    return {
      storageVersion: 1,
      type: "raceResults",
      provider: "race-result-auto-import",
      updatedAt: new Date().toISOString(),
      races: [
        {
          date: importRecord.開催日,
          racecourse: importRecord.競馬場,
          raceNumber: importRecord.レース番号,
          raceKey: importRecord.raceKey,
          finishOrder: importRecord.着順,
          payouts: importRecord.払戻,
          laps: importRecord.ラップ
        }
      ],
      items: (importRecord.着順 || []).map((record) => ({
        date: importRecord.開催日,
        racecourse: importRecord.競馬場,
        raceNumber: importRecord.レース番号,
        finishPosition: record.着順,
        horseNumber: record.馬番,
        horseName: record.馬名,
        last3f: record.上がり,
        corner4Position: record["4角位置"],
        payoutTrifecta: importRecord.払戻?.三連単 || 0,
        lapSummary: (importRecord.ラップ || []).join("-")
      }))
    };
  }

  function buildResultsPayload(importRecord) {
    const first = (importRecord.着順 || [])[0] || {};
    const second = (importRecord.着順 || [])[1] || {};
    const third = (importRecord.着順 || [])[2] || {};
    return {
      storageVersion: 1,
      type: "results",
      provider: "race-result-auto-import",
      updatedAt: new Date().toISOString(),
      items: [
        {
          date: importRecord.開催日,
          racecourse: importRecord.競馬場,
          raceNumber: importRecord.レース番号,
          firstNumber: first.馬番,
          secondNumber: second.馬番,
          thirdNumber: third.馬番,
          payoutAmount: importRecord.払戻?.三連単 || 0,
          lapSummary: (importRecord.ラップ || []).join("-")
        }
      ]
    };
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = source.records || [];
    const latest = records[0] || null;
    return {
      databaseName: source.databaseName || "raceResultAutoImportDatabase",
      phase: source.phase || "Phase14-4",
      requiredFields,
      resultFields,
      payoutTypes,
      targetDatabases,
      records,
      widget: {
        latestRace: latest ? latest.raceKey : "--",
        recordCount: latest ? latest.recordCount : 0,
        importStatus: latest ? latest.importStatus : "--",
        payoutTotal: latest ? Object.values(latest.払戻 || {}).reduce((total, value) => total + (Number(value) || 0), 0) : 0,
        lapCount: latest ? (latest.ラップ || []).length : 0
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

  function renderFinishOrder(records) {
    const table = document.getElementById("phase144-result-table");
    if (!table) return;
    table.innerHTML = records.map((record) => `<tr><td>${record.着順}</td><td>${record.馬番}</td><td>${record.馬名}</td><td>${record.上がり}</td><td>${record["4角位置"]}</td></tr>`).join("");
  }

  function renderDashboard(report) {
    const latest = report.records[0];
    setText("phase144-widget-race", report.widget.latestRace);
    setText("phase144-widget-count", `${report.widget.recordCount}`);
    setText("phase144-widget-status", report.widget.importStatus);
    setText("phase144-widget-payout", `${report.widget.payoutTotal}`);
    setText("phase144-widget-laps", `${report.widget.lapCount}`);
    renderCards("phase144-result-fields", report.resultFields, (field) => `<article><span>${field}</span><strong>取込</strong><em>結果検証フィールド</em></article>`);
    renderCards("phase144-payout-types", report.payoutTypes, (type) => `<article><span>${type}</span><strong>${latest?.払戻?.[type] || 0}</strong><em>払戻</em></article>`);
    renderCards("phase144-laps", latest?.ラップ || [], (lap, index) => `<article><span>${index + 1}F</span><strong>${lap}</strong><em>lap</em></article>`);
    renderFinishOrder(latest ? latest.着順 : []);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") return fallbackDatabase;
    try {
      const response = await fetch("data/raceResultAutoImportDatabase.json", { cache: "no-store" });
      if (!response.ok) throw new Error("raceResultAutoImportDatabase fetch failed");
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderDashboard(report);
    window.HashimotoPhase144RaceResultAutoImportReport = report;
  }

  window.HashimotoPhase144RaceResultAutoImport = {
    autoImportRaceResults,
    buildDashboard,
    buildRaceResultsPayload,
    buildResultsPayload,
    fallbackDatabase,
    generateFinishOrder,
    generateLaps,
    generatePayouts,
    payoutTypes,
    requiredFields,
    resultFields,
    targetDatabases,
    validateRequest,
    validateResults
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
