(function () {
  const pipelineSteps = ["結果", "Phase8結果検証", "OS更新", "AI指数補正", "自己学習"];
  const sourceConnections = {
    resultDatabase: "data/raceResultAutoImportDatabase.json",
    phase8ResultVerification: "productionResultValidationReports",
    osUpdateDatabase: "data/osUpdates.json",
    aiIndexDatabase: "aiRanking",
    learningDatabase: "data/learningDatabase.json"
  };
  const fallbackDatabase = {
    databaseName: "resultLearningPipelineDatabase",
    phase: "Phase14-5",
    records: [
      {
        date: "2026-06-06",
        racecourse: "東京",
        raceNumber: 11,
        raceName: "東京11R Future Simulation Stakes",
        result: {
          firstNumber: 1,
          secondNumber: 3,
          thirdNumber: 5,
          payoutAmount: 18420,
          last3fBest: 33.5,
          corner4Memo: "4角2番手と外差しが両方残った",
          lapSummary: "12.5-11.1-11.4-11.8-11.9-11.6-11.2-12.0"
        },
        phase8ResultVerification: {
          status: "Verified",
          hit: true,
          roi: 153.5,
          verificationNotes: "三連単本線が的中。4角前残りと上がり性能の両方を評価。"
        },
        osUpdate: {
          status: "Apply",
          target: "東京OS",
          rule: "高速ラップで4角1-3番手かつ上がり上位を強化"
        },
        aiIndexCorrection: {
          status: "Apply",
          aiIndexDelta: 3,
          targetFactor: "positionAndLast3f"
        },
        selfLearning: {
          status: "Learned",
          learningScore: 92,
          nextAction: "東京芝の先行持続と末脚補正を次回指数へ反映"
        }
      }
    ]
  };

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizeResult(input) {
    const source = input || {};
    return {
      date: source.date || source.開催日,
      racecourse: source.racecourse || source.競馬場,
      raceNumber: toNumber(source.raceNumber || source.レース番号),
      raceName: source.raceName || source.race || `${source.racecourse || source.競馬場 || "--"}${source.raceNumber || source.レース番号 || ""}R`,
      result: {
        firstNumber: toNumber(source.firstNumber || source.first || source.result?.firstNumber),
        secondNumber: toNumber(source.secondNumber || source.second || source.result?.secondNumber),
        thirdNumber: toNumber(source.thirdNumber || source.third || source.result?.thirdNumber),
        payoutAmount: toNumber(source.payoutAmount || source.payout || source.result?.payoutAmount),
        last3fBest: toNumber(source.last3fBest || source.result?.last3fBest),
        corner4Memo: source.corner4Memo || source.result?.corner4Memo || "",
        lapSummary: source.lapSummary || source.result?.lapSummary || ""
      }
    };
  }

  function runPhase8ResultVerification(record) {
    const payout = toNumber(record.result.payoutAmount);
    const investment = toNumber(record.investmentAmount, 12000);
    const roi = investment > 0 ? Number(((payout / investment) * 100).toFixed(1)) : 0;
    const hit = payout > 0 && record.result.firstNumber > 0;
    return {
      status: hit ? "Verified" : "Needs Review",
      hit,
      roi,
      verificationNotes: hit ? "結果照合済み。払戻と着順をPhase8結果検証へ反映。" : "払戻または着順が不足。Phase8結果検証で確認。"
    };
  }

  function createOsUpdate(record, verification) {
    const cornerText = String(record.result.corner4Memo || "");
    const lapText = String(record.result.lapSummary || "");
    const fastLap = lapText.split("-").map(Number).some((lap) => Number.isFinite(lap) && lap <= 11.2);
    const rule = fastLap || /4角|先行|差し/.test(cornerText)
      ? `${record.racecourse}OS: ラップと4角位置を展開補正へ反映`
      : `${record.racecourse}OS: 結果傾向を保留検証`;
    return {
      status: verification.hit ? "Apply" : "Pending",
      target: `${record.racecourse}OS`,
      rule,
      source: "Phase8結果検証"
    };
  }

  function createAiIndexCorrection(record, verification, osUpdate) {
    const roi = toNumber(verification.roi);
    const last3f = toNumber(record.result.last3fBest);
    const delta = Math.max(-3, Math.min(5, Math.round((roi - 100) / 35 + (last3f > 0 && last3f <= 34 ? 1 : 0))));
    return {
      status: osUpdate.status === "Apply" ? "Apply" : "Pending",
      aiIndexDelta: delta,
      targetFactor: last3f > 0 && last3f <= 34 ? "last3fAndOsBias" : "resultVerification",
      reason: `ROI ${roi}% / 上がり ${last3f || "--"}`
    };
  }

  function createSelfLearning(record, verification, osUpdate, correction) {
    const learningScore = Math.max(0, Math.min(100, 62 + (verification.hit ? 18 : -10) + toNumber(correction.aiIndexDelta) * 4));
    return {
      status: "Learned",
      learningScore,
      nextAction: `${osUpdate.target} / AI指数${correction.aiIndexDelta >= 0 ? "+" : ""}${correction.aiIndexDelta}を次回予想へ反映`,
      source: "AI指数補正"
    };
  }

  function runPipeline(input) {
    const normalized = normalizeResult(input);
    const phase8ResultVerification = runPhase8ResultVerification(normalized);
    const osUpdate = createOsUpdate(normalized, phase8ResultVerification);
    const aiIndexCorrection = createAiIndexCorrection(normalized, phase8ResultVerification, osUpdate);
    const selfLearning = createSelfLearning(normalized, phase8ResultVerification, osUpdate, aiIndexCorrection);
    return {
      ...normalized,
      pipelineSteps,
      phase8ResultVerification,
      osUpdate,
      aiIndexCorrection,
      selfLearning,
      pipelineStatus: selfLearning.status === "Learned" ? "Complete" : "Needs Review"
    };
  }

  function buildOsUpdatePayload(pipelineRecord) {
    return {
      storageVersion: 1,
      type: "osUpdates",
      provider: "result-learning-pipeline",
      items: [
        {
          date: pipelineRecord.date,
          racecourse: pipelineRecord.racecourse,
          raceNumber: pipelineRecord.raceNumber,
          target: pipelineRecord.osUpdate.target,
          rule: pipelineRecord.osUpdate.rule,
          status: pipelineRecord.osUpdate.status,
          source: "Phase14-5"
        }
      ]
    };
  }

  function buildAiIndexCorrectionPayload(pipelineRecord) {
    return {
      type: "aiIndexCorrections",
      provider: "result-learning-pipeline",
      items: [
        {
          date: pipelineRecord.date,
          racecourse: pipelineRecord.racecourse,
          raceNumber: pipelineRecord.raceNumber,
          aiIndexDelta: pipelineRecord.aiIndexCorrection.aiIndexDelta,
          targetFactor: pipelineRecord.aiIndexCorrection.targetFactor,
          reason: pipelineRecord.aiIndexCorrection.reason
        }
      ]
    };
  }

  function buildSelfLearningPayload(pipelineRecord) {
    return {
      databaseName: "learningDatabase",
      provider: "result-learning-pipeline",
      records: [
        {
          date: pipelineRecord.date,
          racecourse: pipelineRecord.racecourse,
          race: pipelineRecord.raceName,
          prediction: "Phase8 result verification",
          actualResult: `${pipelineRecord.result.firstNumber}-${pipelineRecord.result.secondNumber}-${pipelineRecord.result.thirdNumber}`,
          hit: pipelineRecord.phase8ResultVerification.hit,
          miss: !pipelineRecord.phase8ResultVerification.hit,
          errorType: pipelineRecord.phase8ResultVerification.hit ? "None" : "Result Verification",
          roiImpact: pipelineRecord.result.payoutAmount,
          learningNotes: pipelineRecord.selfLearning.nextAction
        }
      ]
    };
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = (source.records || []).map((record) => ({
      ...record,
      pipelineSteps,
      pipelineStatus: record.selfLearning?.status === "Learned" ? "Complete" : "Needs Review"
    }));
    const completeCount = records.filter((record) => record.pipelineStatus === "Complete").length;
    return {
      databaseName: source.databaseName || "resultLearningPipelineDatabase",
      phase: source.phase || "Phase14-5",
      sourceConnections,
      pipelineSteps,
      records,
      widget: {
        latestRace: records[0] ? `${records[0].racecourse}${records[0].raceNumber}R` : "--",
        completeCount,
        osUpdateStatus: records[0]?.osUpdate?.status || "--",
        aiIndexDelta: records[0]?.aiIndexCorrection?.aiIndexDelta || 0,
        learningScore: records[0]?.selfLearning?.learningScore || 0
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

  function renderTable(records) {
    const table = document.getElementById("phase145-pipeline-table");
    if (!table) return;
    table.innerHTML = records.map((record) => `<tr><td>${record.date}</td><td>${record.racecourse}</td><td>${record.raceNumber}R</td><td>${record.phase8ResultVerification.status}</td><td>${record.osUpdate.status}</td><td>${record.aiIndexCorrection.aiIndexDelta}</td><td>${record.selfLearning.learningScore}</td><td>${record.pipelineStatus}</td></tr>`).join("");
  }

  function renderDashboard(report) {
    setText("phase145-widget-race", report.widget.latestRace);
    setText("phase145-widget-complete", `${report.widget.completeCount}`);
    setText("phase145-widget-os", report.widget.osUpdateStatus);
    setText("phase145-widget-ai", `${report.widget.aiIndexDelta}`);
    setText("phase145-widget-learning", `${report.widget.learningScore}`);
    renderCards("phase145-steps", report.pipelineSteps, (step, index) => `<article><span>Step ${index + 1}</span><strong>${step}</strong><em>pipeline</em></article>`);
    renderCards("phase145-latest-flow", report.records.slice(0, 1), (record) => `<article><span>${record.raceName}</span><strong>${record.pipelineStatus}</strong><em>${record.phase8ResultVerification.status} -> ${record.osUpdate.status} -> AI ${record.aiIndexCorrection.aiIndexDelta} -> ${record.selfLearning.status}</em></article>`);
    renderTable(report.records);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") return fallbackDatabase;
    try {
      const response = await fetch("data/resultLearningPipelineDatabase.json", { cache: "no-store" });
      if (!response.ok) throw new Error("resultLearningPipelineDatabase fetch failed");
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderDashboard(report);
    window.HashimotoPhase145ResultLearningPipelineReport = report;
  }

  window.HashimotoPhase145ResultLearningPipeline = {
    buildAiIndexCorrectionPayload,
    buildDashboard,
    buildOsUpdatePayload,
    buildSelfLearningPayload,
    createAiIndexCorrection,
    createOsUpdate,
    createSelfLearning,
    fallbackDatabase,
    pipelineSteps,
    runPhase8ResultVerification,
    runPipeline,
    sourceConnections
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
