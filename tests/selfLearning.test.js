const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reviewEngine = require(path.join(root, "result-review.js"));
const learningEngine = require(path.join(root, "self-learning.js"));
const predictionEngine = require(path.join(root, "pre-race-prediction.js"));

const resultPage = fs.readFileSync(path.join(root, "result-review.html"), "utf8");
const predictionPage = fs.readFileSync(path.join(root, "pre-race-prediction.html"), "utf8");
assert.ok(resultPage.includes("AI自己学習"), "AI自己学習ボタンが表示される");
assert.ok(predictionPage.includes("自己学習DB反映"), "事前予想画面に自己学習DB反映チェックが表示される");

const review = reviewEngine.generateResultReview({
  date: "2026-06-14",
  course: "京都競馬場",
  raceNumber: "11R",
  raceName: "学習S",
  condition: "3歳以上",
  surface: "芝",
  distance: "1600m",
  going: "良",
  weather: "晴",
  pace: "M-H",
  predictionMarkdown: "◎ ⑦ダイヤモンドノット\n危険人気馬 ②危険馬\n神穴候補 ⑪アナホース",
  resultText: "着順,馬番,馬名,人気,オッズ,騎手,調教師,4角位置,ラップ,払戻金,三連単配当\n1,7,ダイヤモンドノット,2,4.8,横山武,橋本厩舎,3,11.8-11.4,12,300円,85,400円\n2,3,サンプルホース,5,13.2,川田,山田厩舎,6,11.8-11.4,,\n3,11,アナホース,8,28.4,坂井,佐藤厩舎,9,11.8-11.4,,"
});

const record = learningEngine.extractLearningRecord(review.markdown);
assert.strictEqual(record.date, "2026-06-14", "開催日を抽出できる");
assert.strictEqual(record.course, "京都競馬場", "競馬場を抽出できる");
assert.strictEqual(record.raceNumber, "11R", "レース番号を抽出できる");
assert.strictEqual(record.surface, "芝", "芝/ダートを抽出できる");
assert.strictEqual(record.distance, "1600m", "距離を抽出できる");
assert.strictEqual(record.going, "良", "馬場を抽出できる");
assert.strictEqual(record.pace, "M-H", "ペースを抽出できる");
assert.strictEqual(record.firstHorse.name, "ダイヤモンドノット", "1着馬を抽出できる");
assert.strictEqual(record.trifectaStructure, "A→B→C", "三連単構造を抽出できる");
assert.ok(record.cornerPositions.includes(3), "4角位置を抽出できる");
assert.ok(record.jockeyTrainerSignals.length > 0, "騎手・調教師を抽出できる");
assert.ok(record.osUpdate.includes("競馬場別OS更新"), "OSアップデート内容を抽出できる");
assert.ok(record.learningContent.includes("学習内容"), "学習内容を抽出できる");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hashimoto-self-learning-"));
const existingPath = path.join(tempRoot, "data", "racecourse-os", "kyoto-os.json");
fs.mkdirSync(path.dirname(existingPath), { recursive: true });
fs.writeFileSync(existingPath, JSON.stringify({ type: "racecourse-os", records: [{ id: "existing" }] }, null, 2), "utf8");

const pkg = learningEngine.persistSelfLearning(tempRoot, review.markdown);
assert.ok(fs.existsSync(path.join(tempRoot, "data", "self-learning", "2026-06-14_京都_11R_self-learning.json")), "self-learning JSONが生成される");
assert.ok(fs.existsSync(path.join(tempRoot, "data", "racecourse-os", "kyoto-os.json")), "racecourse-os JSONが更新される");
assert.ok(fs.existsSync(path.join(tempRoot, "data", "distance-os", "kyoto_t1600.json")), "distance-os JSONが更新される");
assert.ok(fs.existsSync(path.join(tempRoot, "学習ログ", "2026-06-14_京都_11R_AI自己学習ログ.md")), "学習ログMarkdownが保存される");

const updatedRacecourse = JSON.parse(fs.readFileSync(existingPath, "utf8"));
assert.strictEqual(updatedRacecourse.records[0].id, "existing", "既存データが削除されない");
assert.ok(updatedRacecourse.records.length >= 2, "既存JSONは追記される");

const win5Review = reviewEngine.generateResultReview({
  mode: "win5",
  date: "2026-06-14",
  course: "WIN5",
  resultText: "レース,勝ち馬,人気,オッズ,騎手,調教師,事前選定馬,荒れ度\n東京10R,ウィンホース1,1,2.2,ルメール,東京厩舎,ウィンホース1,低\n阪神10R,ウィンホース2,5,12.4,川田,阪神厩舎,別馬,中\n京都11R,ウィンホース3,8,26.8,武豊,京都厩舎,別馬,高\n中山11R,ウィンホース4,12,58.1,横山武,中山厩舎,別馬,高\n中京11R,ウィンホース5,3,6.0,坂井,中京厩舎,ウィンホース5,低"
});
learningEngine.persistSelfLearning(tempRoot, win5Review.markdown);
assert.ok(fs.existsSync(path.join(tempRoot, "data", "win5-learning", "2026-06-14_win5-learning.json")), "WIN5学習DBが生成される");

const prediction = predictionEngine.generatePreRacePrediction({
  date: "2026-06-15",
  course: "京都競馬場",
  raceNumber: "11R",
  raceName: "次回S",
  surface: "芝",
  distance: "1600m",
  going: "良",
  pace: "M-H",
  useSelfLearning: true,
  learningRecords: [pkg.record],
  horses: [
    { number: "7", name: "ダイヤモンドノット", popularity: 2, odds: 4.8, jockey: "横山武", trainer: "橋本厩舎", weight: "492", weightDiff: "+4", runningStyle: "先行", cornerPosition: 3 },
    { number: "3", name: "サンプルホース", popularity: 1, odds: 3.2, jockey: "川田", trainer: "山田厩舎", weight: "486", weightDiff: "-2", runningStyle: "差し", cornerPosition: 6 },
    { number: "11", name: "アナホース", popularity: 8, odds: 28.4, jockey: "坂井", trainer: "佐藤厩舎", weight: "470", weightDiff: "0", runningStyle: "追込", cornerPosition: 9 }
  ]
});
assert.ok(prediction.markdown.includes("自己学習DB反映: 1件参照"), "次回事前予想で自己学習DBを参照できる");

console.log("selfLearning.test.js passed");
