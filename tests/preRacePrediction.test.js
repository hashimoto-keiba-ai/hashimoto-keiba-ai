const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const engine = require(path.join(root, "pre-race-prediction.js"));

const page = fs.readFileSync(path.join(root, "pre-race-prediction.html"), "utf8");
assert.ok(page.includes("CSVファイル選択"), "CSVファイル選択が表示される");
assert.ok(page.includes("CSV貼り付け"), "CSV貼り付けが表示される");
assert.ok(page.includes("手入力"), "手入力が表示される");
assert.ok(page.includes("AI指数表"), "AI指数表が表示される");
assert.ok(page.includes("AI指数CSV保存"), "AI指数CSV保存ボタンが表示される");
assert.ok(page.includes("Ver4.0 完全自動運転モード"), "完全自動運転ボタンが表示される");
assert.ok(page.includes("full-auto-output"), "完全自動運転モードの表示枠がある");

const csv = [
  "馬番,馬名,人気,オッズ,騎手,調教師,馬体重,馬体重増減,脚質,想定4角位置,前走着順,前走4角位置,上がり順位,距離実績,馬場実績,コース実績,血統,枠番",
  "1,危険トップ,1,2.1,新人,若手,470,-14,逃げ,1,8,1,8,普通,普通,苦手,短距離系,1",
  "7,神穴スター,8,24.5,横山武,矢作厩舎,492,+4,差し,5,9,6,1,得意,良,東京○,左回り末脚,4",
  "3,本命ホース,2,4.8,川田,中内田厩舎,486,+2,差し,6,1,4,2,得意,良,東京○,高速上がり,5",
  "12,相手ホース,5,11.4,戸崎,堀厩舎,500,+6,先行,3,3,2,4,得意,良,東京○,持続,6"
].join("\n");

const parsed = engine.parseHorseText(csv);
assert.strictEqual(parsed.length, 4, "CSV読込できる");
assert.strictEqual(parsed[1].name, "神穴スター", "貼り付けCSVを解析できる");
assert.strictEqual(parsed[1].previousFinish, 9, "前走着順を解析できる");
assert.strictEqual(parsed[1].gate, 4, "枠番を解析できる");

const prediction = engine.generatePreRacePrediction({
  date: "2026-06-14",
  course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ",
  raceNumber: "11R",
  raceName: "AI指数テスト",
  condition: "3歳以上",
  surface: "芝",
  distance: "1600m",
  going: "良",
  weather: "晴",
  wind: "弱",
  pace: "H",
  horseText: csv
});

assert.ok(prediction.horses.every((horse) => Number.isFinite(horse.zIndex)), "Z指数が出る");
assert.ok(prediction.horses.every((horse) => Number.isFinite(horse.zPrimeIndex)), "Z'指数が出る");
assert.ok(prediction.horses.some((horse) => horse.dangerPopularLabel === "危険"), "危険人気馬が出る");
assert.ok(prediction.horses.some((horse) => horse.godLongshotLabel === "神穴"), "神穴候補が出る");
assert.ok(prediction.horses.every((horse) => /^EV(高|中|低)$/.test(horse.evLabel)), "EVが出る");
assert.ok(prediction.fullAuto.markRows.some((row) => row.mark === "◎" && row.role === "本命"), "印が自動生成される");
assert.ok(prediction.horses.every((horse) => ["A", "B", "C", "D"].includes(horse.zone)), "人気ゾーンが出る");
assert.strictEqual(prediction.fullAuto.simulation.iterations, 1000, "1000回シミュレーションが出る");
assert.ok(Number.isFinite(prediction.fullAuto.simulation.hitRate), "的中率が出る");
assert.ok(Number.isFinite(prediction.fullAuto.simulation.longshotRate), "万馬券率が出る");
assert.ok(/^[ABC]：/.test(prediction.fullAuto.simulation.roughnessRank), "荒れ度が出る");
assert.ok(prediction.fullAuto.win5Candidates.length > 0, "WIN5候補が出る");
assert.ok(prediction.fullAuto.fundPlans.some((plan) => plan.type === "安全型"), "資金配分が出る");
assert.ok(prediction.fullAuto.html.includes("AI印表") || prediction.fullAuto.html.includes("WIN5"), "完全自動運転結果HTMLが出る");
assert.ok(prediction.aiIndexHtml.includes("<table") && prediction.aiIndexHtml.includes("Z'指数"), "AI指数表が表示される");
assert.ok(prediction.aiIndexCsv.includes("馬番") && prediction.aiIndexCsv.includes("神穴スター"), "AI指数CSVを保存できる形式で出力する");

[
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
].forEach((section) => {
  assert.ok(prediction.markdown.includes(section), `${section}に反映される`);
});
assert.ok(prediction.markdown.includes("| 馬番 | 馬名 | 騎手 | オッズ | 人気 | Z指数 | Z'指数 |"), "AI指数表をMarkdown内に保存する");
assert.ok(prediction.markdown.includes("Ver4.0 完全自動運転モード"), "Markdown保存時にVer4完全自動運転結果も含める");
assert.ok(prediction.markdown.includes("### AI印表"), "AI印表をMarkdownに保存する");
assert.ok(prediction.markdown.includes("### 三連単候補表"), "三連単候補表をMarkdownに保存する");
assert.ok(prediction.markdown.includes("### 1000回シミュレーション結果"), "1000回シミュレーションをMarkdownに保存する");
assert.ok(prediction.markdown.includes("### WIN5候補"), "WIN5候補をMarkdownに保存する");
assert.ok(prediction.markdown.includes("### 資金配分表"), "資金配分表をMarkdownに保存する");
assert.strictEqual(
  prediction.savePath,
  "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ/事前予想/2026-06-14_11R_AI指数テスト.md",
  "保存先は各競馬場/事前予想/になる"
);

const corrected = engine.generatePreRacePrediction({
  date: "2026-06-14",
  course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ",
  raceNumber: "11R",
  raceName: "AI指数テスト",
  condition: "3歳以上",
  surface: "芝",
  distance: "1600m",
  going: "良",
  weather: "晴",
  wind: "弱",
  pace: "H",
  horseText: csv,
  useSelfLearning: true,
  selfLearningDb: {
    "data/self-learning/": [{ horseName: "神穴スター", course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ", zPrimeCorrection: 6, jockeyTrainerCorrection: 3 }],
    "data/racecourse-os/": [{ course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ", zPrimeCorrection: 1 }],
    "data/distance-os/": [{ distance: "1600m", zPrimeCorrection: 1 }],
    "data/pace-os/": [{ pace: "H", zPrimeCorrection: 1 }],
    "data/corner-position-db/": [{ horseName: "神穴スター", zPrimeCorrection: 1 }],
    "data/jockey-trainer-db/": [{ jockey: "横山武", jockeyTrainerCorrection: 2 }]
  }
});

const normalLongshot = prediction.horses.find((horse) => horse.name === "神穴スター");
const correctedLongshot = corrected.horses.find((horse) => horse.name === "神穴スター");
assert.ok(correctedLongshot.zPrimeIndex > normalLongshot.zPrimeIndex, "自己学習DB反映ONで補正が入る");
assert.ok(corrected.markdown.includes("data/self-learning/"), "自己学習DB参照先をMarkdownに残す");

assert.strictEqual(engine.getTrifectaPointCount(10), 8, "10頭以下は8点");
assert.strictEqual(engine.getTrifectaPointCount(11), 12, "11-14頭は12点");
assert.strictEqual(engine.getTrifectaPointCount(15), 16, "15頭以上は16点");

const makeHorse = (index) => ({
  number: String(index + 1),
  name: `頭数テスト${index + 1}`,
  popularity: index + 1,
  odds: 2 + index,
  jockey: "騎手",
  trainer: "厩舎",
  weight: "480",
  weightDiff: "+0",
  runningStyle: index % 2 ? "差し" : "先行",
  cornerPosition: (index % 8) + 1,
  previousFinish: (index % 10) + 1,
  previousCorner: (index % 8) + 1,
  closingRank: (index % 5) + 1,
  distanceRecord: "普通",
  goingRecord: "良",
  courseRecord: "普通",
  pedigree: "テスト",
  gate: (index % 8) + 1
});
assert.strictEqual(
  engine.generatePreRacePrediction({ date: "2026-06-14", course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ", raceNumber: "1R", raceName: "10頭", horses: Array.from({ length: 10 }, (_, index) => makeHorse(index)) }).fullAuto.targetCount,
  8,
  "完全自動運転の三連単点数は10頭以下で8点"
);
assert.strictEqual(
  engine.generatePreRacePrediction({ date: "2026-06-14", course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ", raceNumber: "1R", raceName: "12頭", horses: Array.from({ length: 12 }, (_, index) => makeHorse(index)) }).fullAuto.targetCount,
  12,
  "完全自動運転の三連単点数は11-14頭で12点"
);
assert.strictEqual(
  engine.generatePreRacePrediction({ date: "2026-06-14", course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ", raceNumber: "1R", raceName: "16頭", horses: Array.from({ length: 16 }, (_, index) => makeHorse(index)) }).fullAuto.targetCount,
  16,
  "完全自動運転の三連単点数は15-18頭で16点"
);

const dataFilesBefore = fs.readdirSync(path.join(root, "data")).sort().join("\n");
engine.generatePreRacePrediction({ date: "2026-06-14", course: "譚ｱ莠ｬ遶ｶ鬥ｬ蝣ｴ", raceNumber: "1R", raceName: "削除確認", horseText: csv });
const dataFilesAfter = fs.readdirSync(path.join(root, "data")).sort().join("\n");
assert.strictEqual(dataFilesAfter, dataFilesBefore, "既存データが削除されない");

console.log("preRacePrediction.test.js passed");
