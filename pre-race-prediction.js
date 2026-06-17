(function (global) {
  const COURSES = [
    "莠ｬ驛ｽ遶ｶ鬥ｬ蝣ｴ",
    "髦ｪ逾樒ｫｶ鬥ｬ蝣ｴ",
    "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ",
    "荳ｭ螻ｱ遶ｶ鬥ｬ蝣ｴ",
    "荳ｭ莠ｬ遶ｶ鬥ｬ蝣ｴ",
    "遖丞ｳｶ遶ｶ鬥ｬ蝣ｴ",
    "譁ｰ貎溽ｫｶ鬥ｬ蝣ｴ",
    "蟆丞臥ｫｶ鬥ｬ蝣ｴ",
    "蜃ｽ鬢ｨ遶ｶ鬥ｬ蝣ｴ",
    "譛ｭ蟷檎ｫｶ鬥ｬ蝣ｴ"
  ];

  const TEMPLATE_SECTIONS = [
    "①-1 レース基本情報",
    "①-2 馬場・風・当日傾向",
    "①-3 展開予測",
    "①-4 想定4角位置",
    "①-5 AIスコア",
    "①-6 人気ゾーン判定",
    "①-7 印",
    "①-8 危険人気馬",
    "①-9 神穴候補",
    "①-10 🤫観測馬",
    "①-11 買い目構造",
    "①-12 三連単フォーメーション",
    "①-13 押さえ候補",
    "①-14 消し馬",
    "①-15 ペース別分類",
    "①-16 期待値EV",
    "①-17 検証ポイント",
    "①-18 最終結論・保存ログ"
  ];

  const POPULARITY_ZONES = [
    { zone: "A", label: "1-3人気", min: 1, max: 3 },
    { zone: "B", label: "4-6人気", min: 4, max: 6 },
    { zone: "C", label: "7-10人気", min: 7, max: 10 },
    { zone: "D", label: "11人気以下", min: 11, max: Infinity }
  ];

  const SELF_LEARNING_PATHS = [
    "data/self-learning/",
    "data/racecourse-os/",
    "data/distance-os/",
    "data/pace-os/",
    "data/corner-position-db/",
    "data/jockey-trainer-db/"
  ];

  const CIRCLED = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱"];

  function toNumber(value, fallback = 0) {
    const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function valueOf(value, fallback = "--") {
    const text = String(value ?? "").trim();
    return text || fallback;
  }

  function round(value, digit = 1) {
    const scale = 10 ** digit;
    return Math.round(value * scale) / scale;
  }

  function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value));
  }

  function csvSplit(line) {
    const cells = [];
    let current = "";
    let quoted = false;
    const source = String(line || "").replace(/^\uFEFF/, "");
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];
      if (char === '"' && quoted && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  }

  function normalizeHeader(header) {
    return String(header || "").replace(/^\uFEFF/, "").trim().toLowerCase();
  }

  function pick(row, keys, fallback = "") {
    for (const key of keys) {
      const normalized = normalizeHeader(key);
      if (row[key] !== undefined && String(row[key]).trim() !== "") return row[key];
      if (row[normalized] !== undefined && String(row[normalized]).trim() !== "") return row[normalized];
    }
    return fallback;
  }

  function mapHorse(row) {
    return {
      number: valueOf(pick(row, ["number", "no", "馬番", "鬥ｬ逡ｪ", "譫逡ｪ", "逡ｪ蜿ｷ"]), "0"),
      name: valueOf(pick(row, ["name", "horse", "horseName", "馬名", "鬥ｬ蜷・", "蜃ｺ襍ｰ鬥ｬ"]), "未入力馬"),
      popularity: toNumber(pick(row, ["popularity", "人気", "莠ｺ豌・"]), 99),
      odds: toNumber(pick(row, ["odds", "オッズ", "繧ｪ繝・ぜ"]), 0),
      jockey: valueOf(pick(row, ["jockey", "騎手", "鬨取焔"])),
      trainer: valueOf(pick(row, ["trainer", "調教師", "隱ｿ謨吝ｸｫ"])),
      weight: valueOf(pick(row, ["weight", "馬体重", "鬥ｬ菴馴㍾"])),
      weightDiff: valueOf(pick(row, ["weightDiff", "馬体重増減", "増減", "鬥ｬ菴馴㍾蠅玲ｸ・", "蠅玲ｸ・"])),
      runningStyle: valueOf(pick(row, ["runningStyle", "脚質", "閼夊ｳｪ"])),
      cornerPosition: toNumber(pick(row, ["cornerPosition", "想定4角位置", "4角位置", "諠ｳ螳・隗剃ｽ咲ｽｮ", "4隗・", "蝗幄ｧ・"]), 99),
      previousFinish: toNumber(pick(row, ["previousFinish", "前走着順"]), 99),
      previousCorner: toNumber(pick(row, ["previousCorner", "前走4角位置"]), 99),
      closingRank: toNumber(pick(row, ["closingRank", "上がり順位"]), 99),
      distanceRecord: valueOf(pick(row, ["distanceRecord", "距離実績"])),
      goingRecord: valueOf(pick(row, ["goingRecord", "馬場実績"])),
      courseRecord: valueOf(pick(row, ["courseRecord", "コース実績"])),
      pedigree: valueOf(pick(row, ["pedigree", "bloodline", "血統"])),
      gate: toNumber(pick(row, ["gate", "枠番"]), 0)
    };
  }

  function parseHorseText(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return [];

    const firstCells = csvSplit(lines[0]);
    const hasHeader = firstCells.some((cell) => /馬番|馬名|人気|オッズ|騎手|調教師|horse|name|鬥ｬ蜷|鬨取焔|隱ｿ謨吝ｸｫ/i.test(cell));
    const headers = hasHeader
      ? firstCells.map(normalizeHeader)
      : ["number", "name", "popularity", "odds", "jockey", "trainer", "weight", "weightDiff", "runningStyle", "cornerPosition", "previousFinish", "previousCorner", "closingRank", "distanceRecord", "goingRecord", "courseRecord", "pedigree", "gate"];
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const cells = csvSplit(line);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = cells[index] ?? "";
      });
      return mapHorse(row);
    });
  }

  function getPopularityZone(popularity) {
    return POPULARITY_ZONES.find((zone) => popularity >= zone.min && popularity <= zone.max) || POPULARITY_ZONES[3];
  }

  function hasPositiveRecord(value) {
    return /◎|○|得意|良|好|有|勝|連|複|[2-9]-[1-9]-[1-9]/.test(String(value || ""));
  }

  function hasNegativeRecord(value) {
    return /×|苦手|不安|なし|無|未|0-0-0|凡走/.test(String(value || ""));
  }

  function isFrontStyle(style) {
    return /逃|先|前|蜈|騾/.test(String(style || ""));
  }

  function isCloserStyle(style) {
    return /差|追|末|蟾|霑/.test(String(style || ""));
  }

  function courseType(course) {
    const text = String(course || "");
    if (/東京|譚ｱ莠ｬ/.test(text)) return "tokyo";
    if (/中山|荳ｭ螻ｱ/.test(text)) return "nakayama";
    if (/京都|莠ｬ驛ｽ/.test(text)) return "kyoto";
    if (/阪神|髦ｪ逾/.test(text)) return "hanshin";
    if (/中京|荳ｭ莠ｬ/.test(text)) return "chukyo";
    if (/小倉|蟆丞/.test(text)) return "kokura";
    return "other";
  }

  function surfaceText(race) {
    return `${race.surface || ""}${race.distance || ""}`;
  }

  function scoreFin(horse) {
    const finish = horse.previousFinish;
    const closing = horse.closingRank;
    const finishScore = finish <= 1 ? 96 : finish <= 3 ? 86 : finish <= 5 ? 74 : finish <= 9 ? 58 : 44;
    const closingScore = closing <= 1 ? 96 : closing <= 3 ? 86 : closing <= 5 ? 72 : closing <= 9 ? 58 : 46;
    const hiddenGood = finish > 5 && closing <= 3 ? 10 : 0;
    return clamp(finishScore * 0.62 + closingScore * 0.38 + hiddenGood);
  }

  function scorePosition(horse, race) {
    const corner = horse.cornerPosition;
    const pace = String(race.pace || "");
    let ideal = pace.includes("H") ? 6 : pace.includes("S") ? 3 : 4.5;
    if (courseType(race.course) === "nakayama") ideal = 3.5;
    if (courseType(race.course) === "chukyo") ideal = 5;
    if (courseType(race.course) === "kokura" && /1200|1000/.test(surfaceText(race))) ideal = 2.5;
    return clamp(100 - Math.abs(corner - ideal) * 10);
  }

  function scoreHold(horse) {
    let score = 52;
    ["distanceRecord", "goingRecord", "courseRecord"].forEach((field) => {
      if (hasPositiveRecord(horse[field])) score += 13;
      if (hasNegativeRecord(horse[field])) score -= 13;
    });
    if (horse.previousCorner < horse.previousFinish && horse.previousFinish > 5) score += 8;
    return clamp(score);
  }

  function scorePopularity(horse) {
    const popScore = horse.popularity < 99 ? 100 - (horse.popularity - 1) * 5.4 : 35;
    const oddsScore = horse.odds ? clamp(110 - Math.abs(horse.odds - 7) * 4, 18, 100) : 45;
    return clamp(popScore * 0.64 + oddsScore * 0.36);
  }

  function scoreGate(horse, race) {
    const gate = horse.gate || Math.ceil(toNumber(horse.number, 9) / 2);
    const type = courseType(race.course);
    let ideal = 4;
    if (type === "tokyo") ideal = 5;
    if (type === "nakayama" || type === "kokura") ideal = 3;
    if (type === "hanshin" && /ダ|繝|1800/.test(surfaceText(race))) ideal = 3.5;
    return clamp(100 - Math.abs(gate - ideal) * 8);
  }

  function getCourseAdjustment(horse, race) {
    const type = courseType(race.course);
    const text = surfaceText(race);
    let bonus = 0;
    if (type === "tokyo") {
      if (horse.closingRank <= 3) bonus += 5;
      if (isCloserStyle(horse.runningStyle)) bonus += 3;
      if (hasPositiveRecord(horse.courseRecord)) bonus += 3;
      if (/左|東京|譚ｱ莠ｬ/.test(`${horse.courseRecord} ${horse.pedigree}`)) bonus += 2;
    }
    if (type === "nakayama") {
      if (horse.cornerPosition >= 2 && horse.cornerPosition <= 5) bonus += 5;
      if (/坂|持続|パワー/.test(`${horse.courseRecord} ${horse.pedigree}`)) bonus += 4;
      if (isFrontStyle(horse.runningStyle)) bonus += 2;
    }
    if (type === "kyoto") {
      bonus += scorePosition(horse, race) >= 78 ? 4 : 0;
      bonus += horse.jockey !== "--" ? 2 : 0;
      bonus += scoreFin(horse) >= 78 ? 3 : 0;
    }
    if (type === "hanshin") {
      if (/ダ|繝/.test(text) && /1800/.test(text) && isFrontStyle(horse.runningStyle)) bonus += 6;
      if (/芝|闃/.test(text) && /1600/.test(text) && isCloserStyle(horse.runningStyle) && horse.closingRank <= 3) bonus += 6;
    }
    if (type === "chukyo") {
      if (horse.cornerPosition >= 3 && horse.cornerPosition <= 7) bonus += 5;
      if (/持続|タフ/.test(`${horse.courseRecord} ${horse.pedigree}`)) bonus += 3;
      if (/ダ|繝/.test(text) && /1400/.test(text) && isCloserStyle(horse.runningStyle)) bonus += 4;
    }
    if (type === "kokura") {
      if (/1200|1000/.test(text) && isFrontStyle(horse.runningStyle)) bonus += 7;
    }
    return bonus;
  }

  function getJockeyTrainerCorrection(horse, learningCorrection) {
    let correction = 0;
    if (horse.jockey !== "--") correction += 2;
    if (horse.trainer !== "--") correction += 2;
    if (/ルメ|川田|武|戸崎|坂井|横山|岩田|福永/.test(horse.jockey)) correction += 4;
    if (/厩舎|矢作|堀|国枝|友道|中内田|杉山/.test(horse.trainer)) correction += 3;
    correction += learningCorrection.jockeyTrainer;
    return round(clamp(correction, -12, 16));
  }

  function flattenLearningRecords(input) {
    const records = [];
    if (Array.isArray(input.learningRecords)) records.push(...input.learningRecords);
    if (input.selfLearningDb && typeof input.selfLearningDb === "object") {
      Object.values(input.selfLearningDb).forEach((value) => {
        if (Array.isArray(value)) records.push(...value);
        else if (value && typeof value === "object") records.push(value);
      });
    }
    return records;
  }

  function getSelfLearningCorrection(horse, race, records) {
    const matched = records.filter((record) => {
      const sameHorse = !record.horseName || record.horseName === horse.name;
      const sameCourse = !record.course || record.course === race.course || String(race.course).includes(record.course);
      const sameDistance = !record.distance || !race.distance || String(record.distance) === String(race.distance);
      const samePace = !record.pace || !race.pace || record.pace === race.pace;
      const sameJockey = !record.jockey || record.jockey === horse.jockey;
      return sameHorse && sameCourse && sameDistance && samePace && sameJockey;
    });
    return matched.reduce(
      (sum, record) => ({
        zPrime: sum.zPrime + toNumber(record.zPrimeCorrection ?? record.aiScoreCorrection ?? record.scoreCorrection, 0),
        jockeyTrainer: sum.jockeyTrainer + toNumber(record.jockeyTrainerCorrection, 0),
        count: sum.count + 1
      }),
      { zPrime: 0, jockeyTrainer: 0, count: 0 }
    );
  }

  function evaluateDanger(horse, race) {
    const reasons = [];
    if (horse.popularity >= 1 && horse.popularity <= 3 && horse.developmentMatch < 56) reasons.push("1-3人気で展開不一致");
    if (isFrontStyle(horse.runningStyle) && String(race.pace || "").includes("H") && horse.cornerPosition <= 2) reasons.push("Hペースで逃げ先行が競られる");
    if (toNumber(horse.weightDiff, 0) <= -10) reasons.push("馬体重大幅減");
    if (horse.cornerPosition >= 9 || horse.cornerPosition <= 0) reasons.push("4角位置が不利");
    if (hasNegativeRecord(horse.courseRecord)) reasons.push("コース適性不足");
    if (horse.jockeyTrainerCorrection < 2) reasons.push("騎手調教師補正が低い");
    return {
      score: clamp(reasons.length * 22 + (horse.popularity <= 3 ? 12 : 0)),
      label: reasons.length ? "危険" : "低",
      reasons
    };
  }

  function evaluateGodLongshot(horse) {
    const reasons = [];
    if (horse.popularity >= 7 && horse.popularity <= 12) reasons.push("7-12人気");
    if (horse.developmentMatch >= 68) reasons.push("展開一致");
    if (horse.cornerEvaluation >= 70) reasons.push("4角位置有利");
    if (horse.jockeyTrainerCorrection >= 4) reasons.push("騎手調教師補正あり");
    if (hasPositiveRecord(horse.goingRecord)) reasons.push("馬場適性あり");
    if (horse.previousFinish > 5 && (horse.closingRank <= 3 || horse.previousCorner <= 4)) reasons.push("前走内容が着順以上");
    const active = reasons.length >= 4 && horse.popularity >= 7 && horse.popularity <= 12;
    return {
      score: clamp(reasons.length * 18 + (active ? 10 : 0)),
      label: active ? "神穴" : "通常",
      reasons
    };
  }

  function evaluateEv(horse) {
    const fairOdds = 100 / Math.max(horse.totalScore, 1);
    const value = horse.odds ? round((horse.odds / fairOdds) * (horse.totalScore / 100), 2) : 0;
    const label = value >= 1.35 ? "EV高" : value >= 1.05 ? "EV中" : "EV低";
    return { value, label };
  }

  function markFor(index, horse) {
    if (index === 0) return "◎";
    if (index === 1) return "○";
    if (index === 2) return "▲";
    if (horse.godLongshotLabel === "神穴") return "穴";
    if (index <= 5) return "△";
    return "消";
  }

  function calculateAiIndex(horse, race, learningCorrection) {
    const fin = scoreFin(horse);
    const pos = scorePosition(horse, race);
    const hold = scoreHold(horse);
    const pop = scorePopularity(horse);
    const gate = scoreGate(horse, race);
    const zIndex = round(fin * 0.32 + pos * 0.28 + hold * 0.2 + pop * 0.12 + gate * 0.08);
    const zPrimeIndex = round(clamp(zIndex + getCourseAdjustment(horse, race) + learningCorrection.zPrime));
    const developmentMatch = round(clamp(pos * 0.72 + (String(race.pace || "").includes("H") && isCloserStyle(horse.runningStyle) ? 18 : 0) + (String(race.pace || "").includes("S") && isFrontStyle(horse.runningStyle) ? 18 : 0)));
    const cornerEvaluation = pos;
    const jockeyTrainerCorrection = getJockeyTrainerCorrection(horse, learningCorrection);
    const totalScore = round(clamp(zPrimeIndex * 0.58 + developmentMatch * 0.16 + cornerEvaluation * 0.11 + jockeyTrainerCorrection * 1.4 + hold * 0.08));
    return { fin, pos, hold, pop, gate, zIndex, zPrimeIndex, developmentMatch, cornerEvaluation, jockeyTrainerCorrection, totalScore };
  }

  function enrichHorses(horses, race, input = {}) {
    const learningRecords = input.useSelfLearning ? flattenLearningRecords(input) : [];
    return horses
      .map((horse) => {
        const zone = getPopularityZone(horse.popularity);
        const learningCorrection = getSelfLearningCorrection(horse, race, learningRecords);
        const ai = calculateAiIndex(horse, race, learningCorrection);
        const base = {
          ...horse,
          ...ai,
          learningCorrection,
          zone: zone.zone,
          zoneLabel: zone.label,
          aiScore: ai.totalScore
        };
        const danger = evaluateDanger(base, race);
        const godLongshot = evaluateGodLongshot(base);
        const ev = evaluateEv(base);
        return {
          ...base,
          dangerScore: danger.score,
          dangerPopularLabel: danger.label,
          dangerReasons: danger.reasons,
          godLongshotScore: godLongshot.score,
          godLongshotLabel: godLongshot.label,
          godLongshotReasons: godLongshot.reasons,
          evValue: ev.value,
          evLabel: ev.label
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore || a.popularity - b.popularity)
      .map((horse, index) => ({ ...horse, mark: markFor(index, horse) }));
  }

  function formatHorse(horse) {
    const number = CIRCLED[toNumber(horse.number, 0)] || `${horse.number}`;
    const odds = horse.odds ? `${horse.odds.toFixed(horse.odds % 1 ? 1 : 0)}倍` : "--倍";
    const popularity = Number.isFinite(horse.popularity) && horse.popularity < 99 ? `${horse.popularity}人気` : "--人気";
    return `${number}${horse.name}（${horse.jockey}・${odds}・${popularity}）`;
  }

  function getTrifectaPointCount(fieldSize) {
    if (fieldSize <= 10) return 8;
    if (fieldSize <= 14) return 12;
    return 16;
  }

  function buildTrifectaTickets(sortedHorses, targetCount) {
    const first = sortedHorses.slice(0, Math.min(2, sortedHorses.length));
    const second = sortedHorses.slice(0, Math.min(5, sortedHorses.length));
    const third = sortedHorses.slice(0, Math.min(8, sortedHorses.length));
    const tickets = [];
    first.forEach((a) => {
      second.forEach((b) => {
        third.forEach((c) => {
          if (a.number !== b.number && a.number !== c.number && b.number !== c.number && tickets.length < targetCount) {
            tickets.push([a, b, c]);
          }
        });
      });
    });
    return tickets;
  }

  function buildPredictionFilePath(race) {
    const date = valueOf(race.date, "no-date").replace(/[^\dA-Za-z_-]/g, "-");
    const raceNo = valueOf(race.raceNumber, "R").replace(/[\\/:*?"<>|]/g, "");
    const raceName = valueOf(race.raceName, "事前予想").replace(/[\\/:*?"<>|]/g, "");
    return `${race.course}/事前予想/${date}_${raceNo}_${raceName}.md`;
  }

  function lineList(items, emptyText = "- 該当なし") {
    return items.length ? items.map((item) => `- ${item}`).join("\n") : emptyText;
  }

  function matchSelfLearningRecords(race, records) {
    if (!Array.isArray(records)) return [];
    return records.filter((record) => {
      const sameCourse = !record.course || record.course === race.course || String(race.course).includes(record.course);
      const sameDistance = !record.distance || !race.distance || String(record.distance) === String(race.distance);
      const sameSurface = !record.surface || !race.surface || String(record.surface).includes(race.surface) || String(race.surface).includes(record.surface);
      const sameGoing = !record.going || !race.going || record.going === race.going;
      const samePace = !record.pace || !race.pace || record.pace === race.pace;
      return sameCourse && sameDistance && sameSurface && sameGoing && samePace;
    });
  }

  function buildAiIndexMarkdownTable(horses) {
    const rows = [
      "| 馬番 | 馬名 | 騎手 | オッズ | 人気 | Z指数 | Z'指数 | 危険人気 | 神穴 | EV | 総合評価 | 印 |",
      "|---:|---|---|---:|---:|---:|---:|---|---|---|---:|---|"
    ];
    horses.forEach((horse) => {
      rows.push(`| ${horse.number} | ${horse.name} | ${horse.jockey} | ${horse.odds || "--"} | ${horse.popularity || "--"} | ${horse.zIndex} | ${horse.zPrimeIndex} | ${horse.dangerPopularLabel} | ${horse.godLongshotLabel} | ${horse.evLabel} ${horse.evValue} | ${horse.totalScore} | ${horse.mark} |`);
    });
    return rows.join("\n");
  }

  function buildAiIndexCsv(horses) {
    const headers = ["馬番", "馬名", "騎手", "オッズ", "人気", "Z指数", "Z'指数", "危険人気", "神穴", "EV", "総合評価", "印"];
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = horses.map((horse) => [
      horse.number,
      horse.name,
      horse.jockey,
      horse.odds,
      horse.popularity,
      horse.zIndex,
      horse.zPrimeIndex,
      horse.dangerPopularLabel,
      horse.godLongshotLabel,
      `${horse.evLabel} ${horse.evValue}`,
      horse.totalScore,
      horse.mark
    ].map(escape).join(","));
    return [headers.map(escape).join(","), ...rows].join("\n");
  }

  function buildAiIndexHtmlTable(horses) {
    const cells = (values, tag = "td") => values.map((value) => `<${tag}>${String(value ?? "")}</${tag}>`).join("");
    const head = cells(["馬番", "馬名", "騎手", "オッズ", "人気", "Z指数", "Z'指数", "危険人気", "神穴", "EV", "総合評価", "印"], "th");
    const body = horses.map((horse) => `<tr>${cells([horse.number, horse.name, horse.jockey, horse.odds || "--", horse.popularity || "--", horse.zIndex, horse.zPrimeIndex, horse.dangerPopularLabel, horse.godLongshotLabel, `${horse.evLabel} ${horse.evValue}`, horse.totalScore, horse.mark])}</tr>`).join("");
    return `<div class="table-wrap"><table class="ai-index-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function getAutoMarkRows(horses) {
    const god = horses.find((horse) => horse.godLongshotLabel === "神穴") || horses.find((horse) => horse.popularity >= 7);
    const observation = horses.find((horse) => horse.evLabel === "EV高" && horse !== god) || horses.find((horse) => horse.dangerPopularLabel === "危険");
    return [
      { mark: "◎", role: "本命", horse: horses[0], reason: "Z'指数・総合スコア最上位" },
      { mark: "○", role: "対抗", horse: horses[1], reason: "総合力と展開一致度が安定" },
      { mark: "▲", role: "単穴", horse: horses[2], reason: "上位逆転候補" },
      { mark: "△", role: "連下", horse: horses[3], reason: "相手候補" },
      { mark: "☆", role: "神穴", horse: god, reason: "神穴指数・EV期待値を加味" },
      { mark: "🤫", role: "観測馬", horse: observation, reason: "直前気配とオッズ観測対象" }
    ].filter((row) => row.horse);
  }

  function getZoneHorses(horses, zone) {
    return horses.filter((horse) => horse.zone === zone);
  }

  function pickFromZone(horses, zone, fallbackIndex = 0) {
    return getZoneHorses(horses, zone)[0] || horses[fallbackIndex] || horses[0];
  }

  function buildVer4TrifectaCandidates(horses, targetCount) {
    const structures = ["A→B→C", "B→C→A", "B→C→C", "A→C→B", "C→A→B", "A→B→D", "B→A→C", "C→B→A"];
    const tickets = [];
    let cursor = 0;
    while (tickets.length < targetCount && cursor < targetCount * 3) {
      const structure = structures[cursor % structures.length];
      const zones = structure.split("→");
      const horseTicket = zones.map((zone, index) => pickFromZone(horses, zone, index));
      if (new Set(horseTicket.map((horse) => horse.number)).size === 3) {
        tickets.push({
          structure,
          type: tickets.length < Math.ceil(targetCount * 0.5) ? "三連単フォーメーション" : tickets.length < Math.ceil(targetCount * 0.75) ? "押さえ" : "高配当狙い",
          horses: horseTicket
        });
      }
      cursor += 1;
    }
    return tickets;
  }

  function deterministicNoise(seed) {
    const raw = Math.sin(seed * 999.17) * 10000;
    return raw - Math.floor(raw);
  }

  function runFutureSimulation(horses, race, iterations = 1000) {
    const counts = new Map(horses.map((horse) => [horse.number, { win: 0, place2: 0, place3: 0 }]));
    let hitCount = 0;
    let longshotHitCount = 0;
    let upsetPointTotal = 0;
    for (let run = 0; run < iterations; run += 1) {
      const ranked = horses
        .map((horse, index) => {
          const paceShift = String(race.pace || "").includes("H") && isCloserStyle(horse.runningStyle) ? 5 : String(race.pace || "").includes("S") && isFrontStyle(horse.runningStyle) ? 5 : 0;
          const volatility = deterministicNoise((run + 1) * (index + 3)) * (horse.evLabel === "EV高" ? 18 : 12);
          const dangerPenalty = horse.dangerPopularLabel === "危険" ? 6 : 0;
          return { horse, simScore: horse.totalScore + paceShift + volatility - dangerPenalty };
        })
        .sort((a, b) => b.simScore - a.simScore)
        .map((row) => row.horse);
      ranked.slice(0, 3).forEach((horse, index) => {
        const count = counts.get(horse.number);
        if (index === 0) count.win += 1;
        if (index <= 1) count.place2 += 1;
        count.place3 += 1;
      });
      if (ranked[0] === horses[0] || ranked.slice(0, 3).some((horse) => horse.mark === "◎")) hitCount += 1;
      if (ranked.slice(0, 3).some((horse) => horse.popularity >= 7)) longshotHitCount += 1;
      upsetPointTotal += ranked.slice(0, 3).reduce((sum, horse) => sum + Math.max(0, horse.popularity - 3), 0);
    }
    const rows = horses.map((horse) => {
      const count = counts.get(horse.number);
      return {
        horse,
        winRate: round((count.win / iterations) * 100, 1),
        quinellaRate: round((count.place2 / iterations) * 100, 1),
        showRate: round((count.place3 / iterations) * 100, 1)
      };
    });
    const longshotRate = round((longshotHitCount / iterations) * 100, 1);
    const hitRate = round((hitCount / iterations) * 100, 1);
    const upsetScore = round(upsetPointTotal / iterations, 1);
    const roughnessRank = upsetScore >= 12 || longshotRate >= 58 ? "C：大荒れ" : upsetScore >= 7 || longshotRate >= 36 ? "B：中波乱" : "A：堅い";
    return {
      iterations,
      rows,
      hitRate,
      longshotRate,
      upsetScore,
      roughnessRank
    };
  }

  function buildWin5Candidates(horses, race) {
    return horses.slice(0, 8).map((horse) => {
      const category = horse.zone === "A" && horse.totalScore >= 72 ? "A固定" : horse.zone === "B" ? "B本線" : horse.zone === "C" || horse.godLongshotLabel === "神穴" ? "C狙い" : "D警戒";
      return { race: `${race.course} ${race.raceNumber}`, horse, category };
    });
  }

  function buildFundPlans(trifectaCandidates, horses, budget = 10000) {
    const averageOdds = horses.length ? horses.reduce((sum, horse) => sum + (horse.odds || 0), 0) / horses.length : 0;
    const safeTickets = trifectaCandidates.slice(0, Math.min(6, trifectaCandidates.length));
    const standardTickets = trifectaCandidates.slice(0, Math.min(12, trifectaCandidates.length));
    const payoutTickets = trifectaCandidates.filter((ticket) => ticket.type === "高配当狙い").concat(trifectaCandidates).slice(0, Math.min(16, trifectaCandidates.length));
    const plans = [
      { type: "安全型", tickets: safeTickets, ratio: 0.4, risk: "低" },
      { type: "標準型", tickets: standardTickets, ratio: 0.35, risk: "中" },
      { type: "高配当型", tickets: payoutTickets, ratio: 0.25, risk: "高" }
    ];
    return plans.map((plan) => {
      const amount = Math.round((budget * plan.ratio) / Math.max(plan.tickets.length, 1) / 100) * 100;
      const totalAmount = amount * plan.tickets.length;
      return {
        ...plan,
        points: plan.tickets.length,
        amount,
        totalAmount,
        expectedReturn: Math.round(totalAmount * Math.max(1.2, averageOdds / (plan.risk === "高" ? 1.8 : plan.risk === "中" ? 2.4 : 3.2))),
        ticketText: plan.tickets.map((ticket) => ticket.horses.map((horse) => horse.number).join("→")).join(" / ")
      };
    });
  }

  function buildTable(headers, rows, className) {
    const cell = (value, tag = "td") => `<${tag}>${String(value ?? "")}</${tag}>`;
    const head = headers.map((header) => cell(header, "th")).join("");
    const body = rows.map((row) => `<tr>${row.map((value) => cell(value)).join("")}</tr>`).join("");
    return `<div class="table-wrap"><table class="${className}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function buildFullAutoHtml(auto) {
    return [
      "<h3>AI印表</h3>",
      buildTable(["印", "役割", "馬番", "馬名", "理由"], auto.markRows.map((row) => [row.mark, row.role, row.horse.number, row.horse.name, row.reason]), "ver4-auto-table"),
      "<h3>三連単候補表</h3>",
      buildTable(["種別", "構造", "買い目"], auto.trifectaCandidates.map((ticket) => [ticket.type, ticket.structure, ticket.horses.map((horse) => `${horse.number}.${horse.name}`).join(" → ")]), "ver4-auto-table"),
      "<h3>1000回シミュレーション結果</h3>",
      buildTable(["馬番", "馬名", "勝率", "連対率", "複勝率"], auto.simulation.rows.map((row) => [row.horse.number, row.horse.name, `${row.winRate}%`, `${row.quinellaRate}%`, `${row.showRate}%`]), "ver4-auto-table"),
      "<h3>WIN5候補</h3>",
      buildTable(["WIN5分類", "対象", "馬番", "馬名"], auto.win5Candidates.map((row) => [row.category, row.race, row.horse.number, row.horse.name]), "ver4-auto-table"),
      "<h3>資金配分表</h3>",
      buildTable(["型", "買い目", "点数", "推奨金額", "想定回収", "リスク"], auto.fundPlans.map((plan) => [plan.type, plan.ticketText || "該当なし", plan.points, `${plan.amount}円/点`, `${plan.expectedReturn}円`, plan.risk]), "ver4-auto-table")
    ].join("");
  }

  function buildFullAutoMarkdown(auto) {
    const markLines = auto.markRows.map((row) => `- ${row.mark} ${row.role}: ${formatHorse(row.horse)} / ${row.reason}`).join("\n");
    const trifectaLines = auto.trifectaCandidates.map((ticket, index) => `- ${index + 1}. ${ticket.type} ${ticket.structure}: ${ticket.horses.map(formatHorse).join(" → ")}`).join("\n");
    const simulationLines = auto.simulation.rows.map((row) => `- ${formatHorse(row.horse)}: 勝率${row.winRate}% / 連対率${row.quinellaRate}% / 複勝率${row.showRate}%`).join("\n");
    const win5Lines = auto.win5Candidates.map((row) => `- ${row.category}: ${row.race} ${formatHorse(row.horse)}`).join("\n");
    const fundLines = auto.fundPlans.map((plan) => `- ${plan.type}: ${plan.points}点 / ${plan.amount}円/点 / 想定回収${plan.expectedReturn}円 / リスク${plan.risk} / ${plan.ticketText || "該当なし"}`).join("\n");
    return [
      "## Ver4.0 完全自動運転モード",
      `- 的中率: ${auto.simulation.hitRate}%`,
      `- 万馬券率: ${auto.simulation.longshotRate}%`,
      `- 荒れ度: ${auto.simulation.roughnessRank}`,
      "",
      "### AI印表",
      markLines || "- 該当なし",
      "",
      "### 三連単候補表",
      trifectaLines || "- 該当なし",
      "",
      "### 1000回シミュレーション結果",
      simulationLines || "- 該当なし",
      "",
      "### WIN5候補",
      win5Lines || "- 該当なし",
      "",
      "### 資金配分表",
      fundLines || "- 該当なし"
    ].join("\n");
  }

  function generateFullAutoOperation(race, horses) {
    const targetCount = getTrifectaPointCount(horses.length);
    const markRows = getAutoMarkRows(horses);
    const trifectaCandidates = buildVer4TrifectaCandidates(horses, targetCount);
    const simulation = runFutureSimulation(horses, race, 1000);
    const win5Candidates = buildWin5Candidates(horses, race);
    const fundPlans = buildFundPlans(trifectaCandidates, horses);
    const auto = {
      version: "Ver4.0",
      targetCount,
      markRows,
      trifectaCandidates,
      simulation,
      win5Candidates,
      fundPlans
    };
    return {
      ...auto,
      markdown: buildFullAutoMarkdown(auto),
      html: buildFullAutoHtml(auto)
    };
  }

  function generatePreRacePrediction(input) {
    const race = {
      date: valueOf(input.date),
      course: COURSES.includes(input.course) ? input.course : valueOf(input.course, COURSES[0]),
      raceNumber: valueOf(input.raceNumber),
      raceName: valueOf(input.raceName),
      condition: valueOf(input.condition),
      surface: valueOf(input.surface),
      distance: valueOf(input.distance),
      going: valueOf(input.going),
      weather: valueOf(input.weather),
      wind: valueOf(input.wind),
      pace: valueOf(input.pace)
    };
    const rawHorses = input.horses || parseHorseText(input.horseText);
    const learningRecords = flattenLearningRecords(input);
    const horses = enrichHorses(rawHorses, race, { ...input, learningRecords });
    const learningMatches = input.useSelfLearning ? matchSelfLearningRecords(race, learningRecords) : [];
    const top = horses[0];
    const second = horses[1];
    const third = horses[2];
    const risky = horses.filter((horse) => horse.dangerPopularLabel === "危険").sort((a, b) => b.dangerScore - a.dangerScore)[0];
    const longshots = horses.filter((horse) => horse.godLongshotLabel === "神穴").slice(0, 3);
    const observation = horses.filter((horse) => horse.evLabel !== "EV低" || horse.godLongshotLabel === "神穴").slice(0, 4);
    const targetCount = getTrifectaPointCount(horses.length);
    const tickets = buildTrifectaTickets(horses, targetCount);
    const savePath = buildPredictionFilePath(race);
    const aiIndexTableMarkdown = buildAiIndexMarkdownTable(horses);
    const aiIndexCsv = buildAiIndexCsv(horses);
    const fullAuto = generateFullAutoOperation(race, horses);
    const autoMark = (mark) => fullAuto.markRows.find((row) => row.mark === mark);
    const autoTrifectaLines = fullAuto.trifectaCandidates.map((ticket, index) => `${index + 1}. ${ticket.type} ${ticket.structure}: ${ticket.horses.map(formatHorse).join(" → ")}`);
    const autoReserveLines = fullAuto.trifectaCandidates.filter((ticket) => ticket.type === "押さえ").map((ticket) => `${ticket.structure}: ${ticket.horses.map(formatHorse).join(" → ")}`);
    const autoHighPayoutLines = fullAuto.trifectaCandidates.filter((ticket) => ticket.type === "高配当狙い").map((ticket) => `${ticket.structure}: ${ticket.horses.map(formatHorse).join(" → ")}`);

    const sections = [
      `## ${TEMPLATE_SECTIONS[0]}\n- 開催日: ${race.date}\n- 競馬場: ${race.course}\n- レース番号: ${race.raceNumber}\n- レース名: ${race.raceName}\n- 条件: ${race.condition}\n- コース: ${race.surface}${race.distance}`,
      `## ${TEMPLATE_SECTIONS[1]}\n- 馬場: ${race.going}\n- 天候: ${race.weather}\n- 風: ${race.wind}\n- 自己学習DB反映: ${input.useSelfLearning ? `${learningMatches.length}件参照` : "OFF"}\n- 参照DB: ${input.useSelfLearning ? SELF_LEARNING_PATHS.join(", ") : "未参照"}`,
      `## ${TEMPLATE_SECTIONS[2]}\n- 想定ペース: ${race.pace}\n- 展開軸: ${top ? formatHorse(top) : "未入力"} / 展開一致度 ${top ? top.developmentMatch : "--"}`,
      `## ${TEMPLATE_SECTIONS[3]}\n${lineList([...horses].sort((a, b) => a.cornerPosition - b.cornerPosition).map((horse) => `${horse.cornerPosition}番手想定 ${formatHorse(horse)} / 4角評価 ${horse.cornerEvaluation}`))}`,
      `## ${TEMPLATE_SECTIONS[4]}\n${aiIndexTableMarkdown}\n\n- Ver4.0荒れ度: ${fullAuto.simulation.roughnessRank}\n- 1000回シミュレーション的中率: ${fullAuto.simulation.hitRate}%`,
      `## ${TEMPLATE_SECTIONS[5]}\n${lineList(horses.map((horse) => `${horse.zone} ${horse.zoneLabel}: ${formatHorse(horse)} / 総合 ${horse.totalScore}`))}`,
      `## ${TEMPLATE_SECTIONS[6]}\n${lineList(fullAuto.markRows.map((row) => `${row.mark} ${row.role}: ${formatHorse(row.horse)} / ${row.reason}`))}`,
      `## ${TEMPLATE_SECTIONS[7]}\n${risky ? `- ${formatHorse(risky)}: ${risky.dangerReasons.join(" / ")}` : "- 該当なし"}`,
      `## ${TEMPLATE_SECTIONS[8]}\n${lineList(longshots.map((horse) => `${formatHorse(horse)}: ${horse.godLongshotReasons.join(" / ")}`))}`,
      `## ${TEMPLATE_SECTIONS[9]}\n${lineList(fullAuto.markRows.filter((row) => row.mark === "🤫").map((row) => `${formatHorse(row.horse)}: ${row.reason}`)).replace("- 該当なし", lineList(observation.map((horse) => `${formatHorse(horse)}: ${horse.evLabel} / 神穴 ${horse.godLongshotLabel} / 危険 ${horse.dangerPopularLabel}`)))}`,
      `## ${TEMPLATE_SECTIONS[10]}\n- 三連単構造: A→B→C / B→C→A / B→C→C\n- 本線: ${autoMark("◎") ? formatHorse(autoMark("◎").horse) : "未入力"} → ${fullAuto.markRows.filter((row) => ["○", "▲", "△", "☆"].includes(row.mark)).map((row) => formatHorse(row.horse)).join(" / ")}\n- 高配当狙い: ${autoHighPayoutLines.join(" / ") || "該当なし"}\n- 危険人気は相手下げ: ${risky ? formatHorse(risky) : "該当なし"}`,
      `## ${TEMPLATE_SECTIONS[11]}\n- 出走頭数: ${horses.length}頭\n- 自動点数: ${targetCount}点\n${lineList(autoTrifectaLines, "- 3頭以上の出走馬を入力してください")}`,
      `## ${TEMPLATE_SECTIONS[12]}\n${lineList(autoReserveLines.concat(horses.slice(5, 9).map((horse) => `${formatHorse(horse)}: 総合 ${horse.totalScore} / EV ${horse.evLabel}`)))}`,
      `## ${TEMPLATE_SECTIONS[13]}\n${lineList(horses.filter((horse) => horse.totalScore < 55 || horse.dangerScore >= 55).map((horse) => `${formatHorse(horse)}: 総合不足または危険人気条件`))}`,
      `## ${TEMPLATE_SECTIONS[14]}\n- S: ${lineList(horses.filter((horse) => isFrontStyle(horse.runningStyle)).slice(0, 3).map(formatHorse), "該当なし")}\n- M: ${lineList(horses.slice(0, 3).map(formatHorse), "該当なし")}\n- H: ${lineList(horses.filter((horse) => isCloserStyle(horse.runningStyle)).slice(0, 3).map(formatHorse), "該当なし")}`,
      `## ${TEMPLATE_SECTIONS[15]}\n${lineList(horses.map((horse) => `${formatHorse(horse)}: ${horse.evLabel} / EV ${horse.evValue} / オッズ ${horse.odds}`))}\n\n${lineList(fullAuto.fundPlans.map((plan) => `${plan.type}: ${plan.points}点 / ${plan.amount}円/点 / 想定回収${plan.expectedReturn}円 / リスク${plan.risk}`))}`,
      `## ${TEMPLATE_SECTIONS[16]}\n- Z指数とZ'指数の差分が競馬場補正として妥当か確認\n- 危険人気: ${risky ? formatHorse(risky) : "該当なし"}\n- 神穴: ${longshots.map(formatHorse).join(" / ") || "該当なし"}`,
      `## ${TEMPLATE_SECTIONS[17]}\n- 最終結論: ${autoMark("◎") ? formatHorse(autoMark("◎").horse) : top ? formatHorse(top) : "未入力"}中心 / ${targetCount}点\n- 荒れ度: ${fullAuto.simulation.roughnessRank}\n- WIN5候補: ${fullAuto.win5Candidates.slice(0, 4).map((row) => `${row.category} ${formatHorse(row.horse)}`).join(" / ")}\n- Markdown保存先: ${savePath}\n- CSV保存先: ${savePath.replace(/\.md$/, "_ai-index.csv")}\n- 保存ログ: ${race.date} ${race.course} ${race.raceNumber} ${race.raceName} / ${horses.length}頭`
    ];
    sections.push(fullAuto.markdown);

    return {
      race,
      horses,
      sections: TEMPLATE_SECTIONS,
      trifectaPointCount: targetCount,
      trifectaTickets: tickets,
      savePath,
      aiIndexTableMarkdown,
      aiIndexCsv,
      aiIndexHtml: buildAiIndexHtmlTable(horses),
      fullAuto,
      markdown: `# ${race.date} ${race.course} ${race.raceNumber} ${race.raceName} 事前予想\n\n${sections.join("\n\n")}\n`
    };
  }

  const api = {
    COURSES,
    TEMPLATE_SECTIONS,
    POPULARITY_ZONES,
    SELF_LEARNING_PATHS,
    parseHorseText,
    formatHorse,
    getPopularityZone,
    getTrifectaPointCount,
    buildPredictionFilePath,
    matchSelfLearningRecords,
    buildAiIndexMarkdownTable,
    buildAiIndexCsv,
    buildAiIndexHtmlTable,
    calculateAiIndex,
    enrichHorses,
    generateFullAutoOperation,
    generatePreRacePrediction
  };

  global.HashimotoPreRacePrediction = api;
  if (typeof module !== "undefined") {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
