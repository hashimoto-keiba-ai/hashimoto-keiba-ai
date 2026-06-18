(function (global) {
  const COURSE_SLUGS = {
    京都競馬場: "kyoto",
    阪神競馬場: "hanshin",
    東京競馬場: "tokyo",
    中山競馬場: "nakayama",
    中京競馬場: "chukyo",
    福島競馬場: "fukushima",
    新潟競馬場: "niigata",
    小倉競馬場: "kokura",
    函館競馬場: "hakodate",
    札幌競馬場: "sapporo",
    WIN5: "win5"
  };

  function valueOf(value, fallback = "--") {
    const text = String(value ?? "").trim();
    return text || fallback;
  }

  function sanitizeFilePart(value) {
    return valueOf(value, "unknown")
      .replace(/競馬場/g, "")
      .replace(/[\\/:*?"<>|\s]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function slugCourse(course) {
    return COURSE_SLUGS[course] || sanitizeFilePart(course).toLowerCase();
  }

  function normalizeSurface(surface) {
    if (String(surface).includes("ダ")) return "d";
    if (String(surface).includes("芝")) return "t";
    return "u";
  }

  function extractLine(markdown, label) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(markdown || "").match(new RegExp(`-\\s*${escaped}:\\s*([^\\n]+)`));
    return match ? match[1].trim() : "";
  }

  function extractSection(markdown, title) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(markdown || "").match(new RegExp(`##\\s*${escaped}\\n([\\s\\S]*?)(?=\\n##\\s|$)`));
    return match ? match[1].trim() : "";
  }

  function extractHorseNames(block) {
    return [...String(block || "").matchAll(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]([^（\n:]+)（([^・）]+)・([^・）]+)・([^）]+)）/g)].map((match) => ({
      name: match[1].trim(),
      jockey: match[2].trim(),
      odds: match[3].trim(),
      popularity: match[4].trim()
    }));
  }

  function extractCornerPositions(markdown) {
    return [...String(markdown || "").matchAll(/4角(\d+)番手/g)].map((match) => Number(match[1]));
  }

  function extractJockeyTrainerPairs(markdown) {
    const section = extractSection(markdown, "❷−6 OSアップデート");
    const line = extractLine(section, "騎手・調教師補正");
    return String(line || section)
      .split(/\n|\/|、/)
      .map((part) => part.replace(/^-\s*/, "").trim())
      .filter((part) => part && !part.includes("騎手・調教師補正"));
  }

  function extractLearningRecord(markdown) {
    const text = String(markdown || "");
    const isWin5 = text.includes("WIN5専用結果検証") || /^# .+ WIN5 結果検証/m.test(text);
    const resultSection = extractSection(text, "❷−1 結果");
    const raceImageSection = extractSection(text, "❷−2 レース像");
    const compareSection = extractSection(text, "❷−3 事前予想との対照");
    const judgmentSection = extractSection(text, "❷−4 的中・不的中判定");
    const osSection = extractSection(text, "❷−6 OSアップデート");
    const learningSection = extractSection(text, "❷−7 学習内容・保存ログ");
    const course = isWin5 ? "WIN5" : valueOf(extractLine(resultSection, "競馬場"), "未検出");
    const surfaceDistance = extractLine(raceImageSection, "コース");
    const surface = surfaceDistance.includes("ダ") ? "ダート" : surfaceDistance.includes("芝") ? "芝" : "";
    const distance = valueOf((surfaceDistance.match(/(\d+m)/) || [])[1], "");
    const topHorses = extractHorseNames(resultSection).slice(0, 3);

    return {
      id: `${valueOf(extractLine(resultSection, "開催日"), "未日付")}_${course}_${valueOf(extractLine(resultSection, "レース番号"), isWin5 ? "WIN5" : "R")}`,
      mode: isWin5 ? "win5" : "race",
      date: valueOf(extractLine(resultSection, "開催日"), valueOf((text.match(/^#\s*([\d-]+)/) || [])[1], "未日付")),
      course,
      raceNumber: valueOf(extractLine(resultSection, "レース番号"), isWin5 ? "WIN5" : "--"),
      surface: valueOf(surface),
      distance,
      going: valueOf(extractLine(raceImageSection, "馬場")),
      pace: valueOf(extractLine(raceImageSection, "ペース")),
      firstHorse: topHorses[0] || null,
      secondHorse: topHorses[1] || null,
      thirdHorse: topHorses[2] || null,
      popularityZones: valueOf(extractLine(judgmentSection, "人気ゾーン判定")),
      trifectaStructure: valueOf(extractLine(judgmentSection, "三連単構造") || extractLine(judgmentSection, "A/B/C/D構造")),
      cornerPositions: extractCornerPositions(text),
      jockeyTrainerSignals: extractJockeyTrainerPairs(text),
      dangerousFavorite: valueOf(extractLine(compareSection, "危険人気馬")),
      godHoleCandidate: valueOf(extractLine(compareSection, "神穴候補")),
      predictionGap: valueOf(extractLine(osSection, "次回予想への反映内容") || extractLine(extractSection(text, "❷−5 敗因・勝因分析"), "敗因")),
      osUpdate: osSection,
      learningContent: learningSection,
      rawMarkdown: text
    };
  }

  function buildSelfLearningFileName(record) {
    return `${sanitizeFilePart(record.date)}_${sanitizeFilePart(record.course)}_${sanitizeFilePart(record.raceNumber)}_self-learning.json`;
  }

  function buildLearningLogFileName(record) {
    return `${sanitizeFilePart(record.date)}_${sanitizeFilePart(record.course)}_${sanitizeFilePart(record.raceNumber)}_AI自己学習ログ.md`;
  }

  function buildDistanceKey(record) {
    return `${slugCourse(record.course)}_${normalizeSurface(record.surface)}${String(record.distance || "unknown").replace(/[^\d]/g, "") || "unknown"}`;
  }

  function createDbPayload(type, record, existing = null) {
    const base = existing && typeof existing === "object" ? existing : {};
    const records = Array.isArray(base.records) ? [...base.records] : [];
    records.push(record);
    const structures = records.reduce((map, item) => {
      const key = item.trifectaStructure || item.win5Structure || "--";
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});
    return {
      type,
      updatedAt: new Date().toISOString(),
      summary: {
        recordCount: records.length,
        latestDate: record.date,
        latestCourse: record.course,
        latestRaceNumber: record.raceNumber,
        structureCounts: structures
      },
      records
    };
  }

  function buildLearningLog(record, files) {
    return `# ${record.date} ${record.course} ${record.raceNumber} AI自己学習ログ

- 学習完了: OK
- 競馬場: ${record.course}
- レース番号: ${record.raceNumber}
- 芝/ダート: ${record.surface}
- 距離: ${record.distance}
- 馬場: ${record.going}
- ペース: ${record.pace}
- 三連単構造: ${record.trifectaStructure}
- 危険人気馬: ${record.dangerousFavorite}
- 神穴候補: ${record.godHoleCandidate}
- 次回事前予想への反映内容: ${record.predictionGap}

## 反映先一覧
${files.map((file) => `- ${file.path}`).join("\n")}

## 更新されたOS
- racecourse-os
- distance-os
- surface-os
- pace-os
- corner-position-db
- jockey-trainer-db
${record.mode === "win5" ? "- win5-learning" : ""}
`;
  }

  function buildArtifactPlan(record) {
    const courseSlug = slugCourse(record.course);
    const distanceKey = buildDistanceKey(record);
    const surfaceKey = `${courseSlug}_${normalizeSurface(record.surface)}`;
    const paceKey = `${courseSlug}_${sanitizeFilePart(record.pace).toLowerCase()}`;
    const selfLearningPath = `data/self-learning/${buildSelfLearningFileName(record)}`;
    const files = [
      { path: selfLearningPath, type: "self-learning-record", mode: "single" },
      { path: `data/racecourse-os/${courseSlug}-os.json`, type: "racecourse-os" },
      { path: `data/distance-os/${distanceKey}.json`, type: "distance-os" },
      { path: `data/surface-os/${surfaceKey}.json`, type: "surface-os" },
      { path: `data/pace-os/${paceKey}.json`, type: "pace-os" },
      { path: `data/corner-position-db/${courseSlug}-corner-position.json`, type: "corner-position-db" },
      { path: `data/jockey-trainer-db/${courseSlug}-jockey-trainer.json`, type: "jockey-trainer-db" }
    ];
    if (record.mode === "win5") {
      files.push({ path: `data/win5-learning/${sanitizeFilePart(record.date)}_win5-learning.json`, type: "win5-learning" });
    }
    files.push({ path: `学習ログ/${buildLearningLogFileName(record)}`, type: "learning-log", mode: "markdown" });
    return files;
  }

  function createSelfLearningPackage(markdown) {
    const record = extractLearningRecord(markdown);
    const plan = buildArtifactPlan(record);
    const files = plan.map((item) => {
      if (item.mode === "single") return { ...item, content: JSON.stringify(record, null, 2) };
      if (item.mode === "markdown") return { ...item, content: buildLearningLog(record, plan) };
      return { ...item, content: JSON.stringify(createDbPayload(item.type, record), null, 2) };
    });
    return {
      status: "学習完了",
      record,
      files,
      updatedOs: files.filter((file) => file.type !== "self-learning-record" && file.type !== "learning-log").map((file) => file.type),
      nextPredictionReflection: record.predictionGap,
      errors: []
    };
  }

  function readJsonIfExists(fs, path, fallback) {
    if (!fs.existsSync(path)) return fallback;
    try {
      return JSON.parse(fs.readFileSync(path, "utf8"));
    } catch (_error) {
      return fallback;
    }
  }

  function persistSelfLearning(rootDir, markdown, deps) {
    const fs = deps?.fs || require("fs");
    const path = deps?.path || require("path");
    const pkg = createSelfLearningPackage(markdown);
    pkg.files.forEach((file) => {
      const absolute = path.join(rootDir, file.path);
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      if (file.type === "self-learning-record" || file.type === "learning-log") {
        fs.writeFileSync(absolute, file.content, "utf8");
        return;
      }
      const existing = readJsonIfExists(fs, absolute, null);
      const updated = createDbPayload(file.type, pkg.record, existing);
      fs.writeFileSync(absolute, JSON.stringify(updated, null, 2), "utf8");
    });
    return pkg;
  }

  const api = {
    COURSE_SLUGS,
    extractLearningRecord,
    createSelfLearningPackage,
    persistSelfLearning,
    buildSelfLearningFileName,
    buildLearningLogFileName,
    buildDistanceKey
  };

  global.HashimotoSelfLearning = api;
  if (typeof module !== "undefined") {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
