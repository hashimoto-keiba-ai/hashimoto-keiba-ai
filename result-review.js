(function (global) {
  const COURSES = [
    "京都競馬場",
    "阪神競馬場",
    "東京競馬場",
    "中山競馬場",
    "中京競馬場",
    "福島競馬場",
    "新潟競馬場",
    "小倉競馬場",
    "函館競馬場",
    "札幌競馬場",
    "WIN5"
  ];

  const TEMPLATE_SECTIONS = [
    "❷−1 結果",
    "❷−2 レース像",
    "❷−3 事前予想との対照",
    "❷−4 的中・不的中判定",
    "❷−5 敗因・勝因分析",
    "❷−6 OSアップデート",
    "❷−7 学習内容・保存ログ"
  ];

  const POPULARITY_ZONES = [
    { zone: "A", label: "1〜3人気", min: 1, max: 3 },
    { zone: "B", label: "4〜6人気", min: 4, max: 6 },
    { zone: "C", label: "7〜10人気", min: 7, max: 10 },
    { zone: "D", label: "11人気以下", min: 11, max: Infinity }
  ];

  const CIRCLED = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳"];

  function toNumber(value, fallback = 0) {
    const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function valueOf(value, fallback = "--") {
    const text = String(value ?? "").trim();
    return text || fallback;
  }

  function csvSplit(line) {
    const cells = [];
    let current = "";
    let quoted = false;
    for (const char of String(line || "")) {
      if (char === '"') {
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

  function getPopularityZone(popularity) {
    return POPULARITY_ZONES.find((zone) => popularity >= zone.min && popularity <= zone.max) || POPULARITY_ZONES[3];
  }

  function formatOdds(odds) {
    return odds ? `${odds.toFixed(odds % 1 ? 1 : 0)}倍` : "--倍";
  }

  function formatHorse(horse) {
    const number = CIRCLED[toNumber(horse.number, 0)] || `${horse.number || ""}`;
    const popularity = Number.isFinite(horse.popularity) && horse.popularity < 99 ? `${horse.popularity}人気` : "--人気";
    return `${number}${valueOf(horse.name, "未入力馬")}（${valueOf(horse.jockey)}・${formatOdds(toNumber(horse.odds, 0))}・${popularity}）`;
  }

  function mapResult(row) {
    const horse = {
      finish: toNumber(row.finish ?? row["着順"], 99),
      number: valueOf(row.number ?? row["馬番"] ?? row.no ?? row["番号"], "0"),
      name: valueOf(row.name ?? row["馬名"] ?? row.horse ?? row["勝ち馬"] ?? row["出走馬"], "未入力馬"),
      popularity: toNumber(row.popularity ?? row["人気"], 99),
      odds: toNumber(row.odds ?? row["オッズ"], 0),
      jockey: valueOf(row.jockey ?? row["騎手"]),
      trainer: valueOf(row.trainer ?? row["調教師"]),
      cornerPosition: toNumber(row.cornerPosition ?? row["4角位置"] ?? row["4角"] ?? row["四角"], 99),
      lap: valueOf(row.lap ?? row["ラップ"]),
      payout: valueOf(row.payout ?? row["払戻金"]),
      trifectaPayout: valueOf(row.trifectaPayout ?? row["三連単配当"])
    };
    const zone = getPopularityZone(horse.popularity);
    return { ...horse, zone: zone.zone, zoneLabel: zone.label };
  }

  function parseResultText(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return [];

    const first = csvSplit(lines[0]);
    const hasHeader = first.some((cell) => /着順|馬名|人気|オッズ|騎手|調教師|finish|name/i.test(cell));
    const headers = hasHeader
      ? first.map((cell) => cell.trim())
      : ["finish", "number", "name", "popularity", "odds", "jockey", "trainer", "cornerPosition", "lap", "payout", "trifectaPayout"];
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const cells = csvSplit(line);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = cells[index] ?? "";
      });
      return mapResult(row);
    });
  }

  function lineList(items, emptyText = "- 未入力") {
    return items.length ? items.map((item) => `- ${item}`).join("\n") : emptyText;
  }

  function extractPredictionItem(markdown, label) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(markdown || "").match(new RegExp(`${escaped}\\s*([^\\n]+)`));
    return match ? match[1].trim() : "未検出";
  }

  function buildResultFilePath(race, mode) {
    const date = valueOf(race.date, "未日付").replace(/[^\dA-Za-z_-]/g, "-");
    const raceNo = valueOf(race.raceNumber, mode === "win5" ? "WIN5" : "R").replace(/[\\/:*?"<>|]/g, "");
    const raceName = valueOf(race.raceName, mode === "win5" ? "WIN5結果検証" : "結果検証").replace(/[\\/:*?"<>|]/g, "");
    const folder = mode === "win5" ? "WIN5" : race.course;
    return `${folder}/結果検証/${date}_${raceNo}_${raceName}.md`;
  }

  function buildTrifectaStructure(top3) {
    return top3.map((horse) => horse.zone || "D").join("→") || "--";
  }

  function detectHit(predictionMarkdown, top3) {
    const text = String(predictionMarkdown || "");
    if (!text || !top3.length) return "要手動判定";
    const allTop3Mentioned = top3.every((horse) => text.includes(horse.name));
    const winnerMentioned = text.includes(top3[0].name);
    if (allTop3Mentioned && /三連単|フォーメーション/.test(text)) return "的中候補";
    if (winnerMentioned) return "一部的中";
    return "不的中";
  }

  function buildRace(input) {
    return {
      date: valueOf(input.date),
      course: COURSES.includes(input.course) ? input.course : valueOf(input.course, "京都競馬場"),
      raceNumber: valueOf(input.raceNumber),
      raceName: valueOf(input.raceName),
      condition: valueOf(input.condition),
      surface: valueOf(input.surface),
      distance: valueOf(input.distance),
      going: valueOf(input.going),
      weather: valueOf(input.weather),
      pace: valueOf(input.pace)
    };
  }

  function generateResultReview(input) {
    const mode = input.mode === "win5" || input.course === "WIN5" ? "win5" : "race";
    if (mode === "win5") return generateWin5Review(input);

    const race = buildRace(input);
    const results = (input.results || parseResultText(input.resultText)).sort((a, b) => a.finish - b.finish);
    const top3 = [
      input.firstHorse ? mapResult({ ...input.firstHorse, finish: 1 }) : results[0],
      input.secondHorse ? mapResult({ ...input.secondHorse, finish: 2 }) : results[1],
      input.thirdHorse ? mapResult({ ...input.thirdHorse, finish: 3 }) : results[2]
    ].filter(Boolean);
    const structure = buildTrifectaStructure(top3);
    const hit = detectHit(input.predictionMarkdown, top3);
    const savePath = buildResultFilePath(race, mode);
    const markdown = String(input.predictionMarkdown || "");

    const sections = [
      `## ${TEMPLATE_SECTIONS[0]}\n- 開催日: ${race.date}\n- 競馬場: ${race.course}\n- レース番号: ${race.raceNumber}\n- レース名: ${race.raceName}\n- 1着馬: ${top3[0] ? formatHorse(top3[0]) : "未入力"}\n- 2着馬: ${top3[1] ? formatHorse(top3[1]) : "未入力"}\n- 3着馬: ${top3[2] ? formatHorse(top3[2]) : "未入力"}\n- 払戻金: ${valueOf(input.payout || top3[0]?.payout)}\n- 三連単配当: ${valueOf(input.trifectaPayout || top3[0]?.trifectaPayout)}`,
      `## ${TEMPLATE_SECTIONS[1]}\n- 条件: ${race.condition}\n- コース: ${race.surface}${race.distance}\n- 馬場: ${race.going}\n- 天候: ${race.weather}\n- ペース: ${race.pace}\n- 着順と4角位置:\n${lineList(results.slice(0, 10).map((horse) => `${horse.finish}着 ${formatHorse(horse)} / 4角${horse.cornerPosition}番手 / ラップ ${horse.lap}`))}`,
      `## ${TEMPLATE_SECTIONS[2]}\n- 本命◎: ${extractPredictionItem(markdown, "◎")}\n- 対抗○: ${extractPredictionItem(markdown, "○")}\n- 単穴▲: ${extractPredictionItem(markdown, "▲")}\n- 穴☆: ${extractPredictionItem(markdown, "☆")}\n- 危険人気馬: ${extractPredictionItem(markdown, "危険人気馬")}\n- 神穴候補: ${extractPredictionItem(markdown, "神穴候補")}\n- 🤫観測馬: ${extractPredictionItem(markdown, "🤫観測馬")}\n- 三連単フォーメーション: ${extractPredictionItem(markdown, "三連単フォーメーション")}\n- 想定4角位置: ${extractPredictionItem(markdown, "想定4角位置")}\n- ペース想定: ${extractPredictionItem(markdown, "ペース想定")}`,
      `## ${TEMPLATE_SECTIONS[3]}\n- 判定: ${hit}\n- 人気ゾーン判定: A=1〜3人気 / B=4〜6人気 / C=7〜10人気 / D=11人気以下\n${lineList(top3.map((horse) => `${horse.finish}着 ${horse.zone}ゾーン ${formatHorse(horse)}`))}\n- 三連単構造: ${structure}`,
      `## ${TEMPLATE_SECTIONS[4]}\n- 勝因: ${top3[0] ? `${formatHorse(top3[0])} が4角${top3[0].cornerPosition}番手から展開に合致。` : "未入力"}\n- 敗因: 事前印、人気ゾーン、4角位置、ペース想定のズレを再確認。\n- 騎手・調教師: ${lineList(top3.map((horse) => `${formatHorse(horse)} / 調教師 ${horse.trainer}`))}`,
      `## ${TEMPLATE_SECTIONS[5]}\n- 競馬場別OS更新: ${race.course} の ${race.going} 馬場補正を更新。\n- 距離別OS更新: ${race.distance} の勝ち筋を ${structure} 構造で記録。\n- 芝/ダート別OS更新: ${race.surface} の脚質・4角位置傾向を反映。\n- ペース別OS更新: ${race.pace} の前後半バランスを補正。\n- 4角位置補正: 上位馬の4角位置 ${top3.map((horse) => `${horse.cornerPosition}番手`).join(" / ") || "--"} を次回へ反映。\n- 騎手・調教師補正: ${lineList(top3.map((horse) => `${horse.jockey} / ${horse.trainer}`))}\n- 次回予想への反映内容: 人気ゾーン ${structure}、馬場 ${race.going}、ペース ${race.pace} を重みへ追加。`,
      `## ${TEMPLATE_SECTIONS[6]}\n- 学習内容: ${structure} の三連単構造、${race.course} ${race.distance}、${race.pace} ペースを保存。\n- 保存先: ${savePath}\n- 保存ログ: ${race.date} ${race.course} ${race.raceNumber} ${race.raceName} / 判定 ${hit} / 三連単構造 ${structure}`
    ];

    return {
      mode,
      race,
      results,
      top3,
      trifectaStructure: structure,
      hitJudgment: hit,
      savePath,
      markdown: `# ${race.date} ${race.course} ${race.raceNumber} ${race.raceName} 結果検証\n\n${sections.join("\n\n")}\n`
    };
  }

  function parseWin5Text(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return [];
    const first = csvSplit(lines[0]);
    const hasHeader = first.some((cell) => /レース|勝ち馬|人気|オッズ|騎手|選定|荒れ度/i.test(cell));
    const headers = hasHeader ? first : ["race", "winner", "popularity", "odds", "jockey", "trainer", "selected", "roughness"];
    const dataLines = hasHeader ? lines.slice(1) : lines;
    return dataLines.map((line, index) => {
      const cells = csvSplit(line);
      const row = {};
      headers.forEach((header, cellIndex) => {
        row[header] = cells[cellIndex] ?? "";
      });
      const horse = mapResult({
        number: index + 1,
        name: row.winner ?? row["勝ち馬"] ?? row["馬名"],
        popularity: row.popularity ?? row["人気"],
        odds: row.odds ?? row["オッズ"],
        jockey: row.jockey ?? row["騎手"],
        trainer: row.trainer ?? row["調教師"]
      });
      return {
        race: valueOf(row.race ?? row["レース"], `${index + 1}レース目`),
        winner: horse,
        selected: valueOf(row.selected ?? row["事前選定馬"] ?? row["選定馬"]),
        roughness: valueOf(row.roughness ?? row["荒れ度"])
      };
    });
  }

  function generateWin5Review(input) {
    const race = { ...buildRace({ ...input, course: "WIN5" }), raceNumber: valueOf(input.raceNumber, "WIN5"), raceName: valueOf(input.raceName, "WIN5結果検証") };
    const races = input.win5Races || parseWin5Text(input.resultText);
    const structure = races.map((item) => item.winner.zone || "D").join("/") || "--";
    const hitCount = races.filter((item) => item.selected.includes(item.winner.name)).length;
    const hit = hitCount === 5 ? "的中" : "不的中";
    const savePath = buildResultFilePath(race, "win5");

    const sections = [
      `## WIN5専用結果検証\n- WIN5対象5レース: ${races.length}レース\n- 的中/不的中: ${hit}\n- A/B/C/D構造: ${structure}`,
      `## ${TEMPLATE_SECTIONS[0]}\n${lineList(races.map((item, index) => `${index + 1}. ${item.race} 勝ち馬 ${formatHorse(item.winner)} / 荒れ度 ${item.roughness}`))}`,
      `## ${TEMPLATE_SECTIONS[1]}\n- WIN5全体像: 勝ち馬の人気ゾーン ${structure} を基準に荒れ度を判定。\n- 各レースの勝ち馬:\n${lineList(races.map((item) => `${item.race}: ${formatHorse(item.winner)}`))}`,
      `## ${TEMPLATE_SECTIONS[2]}\n- 事前選定馬との対照:\n${lineList(races.map((item) => `${item.race}: 事前選定 ${item.selected} / 勝ち馬 ${formatHorse(item.winner)}`))}`,
      `## ${TEMPLATE_SECTIONS[3]}\n- 的中/不的中: ${hit}\n- 的中数: ${hitCount}/5\n- 人気ゾーン判定: A=1〜3人気 / B=4〜6人気 / C=7〜10人気 / D=11人気以下\n- A/B/C/D構造: ${structure}`,
      `## ${TEMPLATE_SECTIONS[4]}\n- 勝因: 事前選定馬と勝ち馬が重なったレースを次回の軸条件へ加点。\n- 敗因: 外れたレースは荒れ度、人気ゾーン、騎手・調教師の補正不足として再学習。`,
      `## ${TEMPLATE_SECTIONS[5]}\n- 競馬場別OS更新: WIN5対象5レースの競馬場別傾向を更新。\n- 距離別OS更新: 各対象距離の勝ち馬ゾーンを記録。\n- 芝/ダート別OS更新: 芝/ダートごとの荒れ度を補正。\n- ペース別OS更新: ペース不明分は結果検証ログから次回補完。\n- 4角位置補正: WIN5では勝ち馬の位置取り傾向を次回入力へ反映。\n- 騎手・調教師補正: ${lineList(races.map((item) => `${formatHorse(item.winner)} / 調教師 ${item.winner.trainer}`))}\n- 次回予想への反映内容: 次回WIN5学習として ${structure} 構造と荒れ度を保存。`,
      `## ${TEMPLATE_SECTIONS[6]}\n- 次回WIN5学習: 的中数 ${hitCount}/5、構造 ${structure}、荒れ度をWIN5選定ロジックへ反映。\n- 保存先: ${savePath}\n- 保存ログ: ${race.date} WIN5 / ${hit} / A/B/C/D構造 ${structure}`
    ];

    return {
      mode: "win5",
      race,
      win5Races: races,
      hitJudgment: hit,
      win5Structure: structure,
      savePath,
      markdown: `# ${race.date} WIN5 結果検証\n\n${sections.join("\n\n")}\n`
    };
  }

  const api = {
    COURSES,
    TEMPLATE_SECTIONS,
    POPULARITY_ZONES,
    parseResultText,
    parseWin5Text,
    formatHorse,
    getPopularityZone,
    buildResultFilePath,
    buildTrifectaStructure,
    generateResultReview,
    generateWin5Review
  };

  global.HashimotoResultReview = api;
  if (typeof module !== "undefined") {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
