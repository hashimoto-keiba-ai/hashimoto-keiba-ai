const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const engine = require(path.join(root, "result-review.js"));

const page = fs.readFileSync(path.join(root, "result-review.html"), "utf8");
assert.ok(page.includes("AI結果検証生成"), "結果検証画面が開く");
assert.ok(page.includes("Markdown保存"), "Markdown保存できる");
["1着馬", "2着馬", "3着馬", "事前予想Markdown", "結果CSVまたは手入力"].forEach((label) => {
  assert.ok(page.includes(label), `${label} 入力がある`);
});

const review = engine.generateResultReview({
  date: "2026-06-14",
  course: "京都競馬場",
  raceNumber: "11R",
  raceName: "検証S",
  condition: "3歳以上",
  surface: "芝",
  distance: "1600m",
  going: "良",
  weather: "晴",
  pace: "M-H",
  payout: "12,300円",
  trifectaPayout: "85,400円",
  predictionMarkdown: "◎ ⑦ダイヤモンドノット\n○ ③サンプルホース\n▲ ⑪アナホース\n☆ ⑭穴候補\n危険人気馬 ②危険馬\n神穴候補 ⑪アナホース\n🤫観測馬 ⑧観測馬\n三連単フォーメーション A→B→C\n想定4角位置 ⑦3番手\nペース想定 M-H",
  resultText: "着順,馬番,馬名,人気,オッズ,騎手,調教師,4角位置,ラップ,払戻金,三連単配当\n1,7,ダイヤモンドノット,2,4.8,横山武,橋本厩舎,3,11.8-11.4-11.9,12,300円,85,400円\n2,3,サンプルホース,5,13.2,川田,山田厩舎,6,11.8-11.4-11.9,,\n3,11,アナホース,8,28.4,坂井,佐藤厩舎,9,11.8-11.4-11.9,,"
});

engine.TEMPLATE_SECTIONS.forEach((section) => {
  assert.ok(review.markdown.includes(section), `${section} が出力される`);
});

assert.ok(
  review.markdown.includes("⑦ダイヤモンドノット（横山武・4.8倍・2人気）"),
  "馬番・馬名には騎手・オッズ・人気が併記される"
);
assert.ok(review.markdown.includes("人気ゾーン判定"), "人気ゾーンが出る");
assert.ok(review.markdown.includes("A=1〜3人気 / B=4〜6人気 / C=7〜10人気 / D=11人気以下"), "人気ゾーン定義が出る");
assert.ok(review.markdown.includes("三連単構造: A→B→C"), "三連単構造が出る");
assert.ok(review.markdown.includes("競馬場別OS更新"), "OSアップデートが出る");
assert.ok(review.markdown.includes("距離別OS更新"), "距離別OS更新が出る");
assert.ok(review.markdown.includes("芝/ダート別OS更新"), "芝/ダート別OS更新が出る");
assert.ok(review.markdown.includes("ペース別OS更新"), "ペース別OS更新が出る");
assert.ok(review.markdown.includes("4角位置補正"), "4角位置補正が出る");
assert.ok(review.markdown.includes("騎手・調教師補正"), "騎手・調教師補正が出る");
assert.strictEqual(review.savePath, "京都競馬場/結果検証/2026-06-14_11R_検証S.md", "保存先が正しい");

const win5 = engine.generateResultReview({
  mode: "win5",
  date: "2026-06-14",
  course: "WIN5",
  resultText: "レース,勝ち馬,人気,オッズ,騎手,調教師,事前選定馬,荒れ度\n東京10R,ウィンホース1,1,2.2,ルメール,東京厩舎,ウィンホース1,低\n阪神10R,ウィンホース2,5,12.4,川田,阪神厩舎,別馬,中\n京都11R,ウィンホース3,8,26.8,武豊,京都厩舎,ウィンホース3,高\n中山11R,ウィンホース4,12,58.1,横山武,中山厩舎,別馬,高\n中京11R,ウィンホース5,3,6.0,坂井,中京厩舎,ウィンホース5,低"
});

assert.ok(win5.markdown.includes("WIN5専用結果検証"), "WIN5専用検証が出る");
assert.ok(win5.markdown.includes("WIN5対象5レース"), "WIN5対象5レースが出る");
assert.ok(win5.markdown.includes("各レースの勝ち馬"), "各レースの勝ち馬が出る");
assert.ok(win5.markdown.includes("事前選定馬との対照"), "事前選定馬との対照が出る");
assert.ok(win5.markdown.includes("荒れ度"), "荒れ度判定が出る");
assert.ok(win5.markdown.includes("A/B/C/D構造"), "A/B/C/D構造が出る");
assert.ok(win5.markdown.includes("次回WIN5学習"), "次回WIN5学習が出る");
assert.strictEqual(win5.savePath, "WIN5/結果検証/2026-06-14_WIN5_WIN5結果検証.md", "WIN5保存先が正しい");

console.log("resultReview.test.js passed");
