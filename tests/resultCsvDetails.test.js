"use strict";

const assert = require("node:assert/strict");
const trial = require("../prediction-trial-core.js");

const race = {
  date: "2026-06-14",
  course: "東京競馬場",
  raceNumber: "11R"
};

const csv = [
  "着順,馬番,馬名,1角位置,2角位置,3角位置,4角位置,上がり3F",
  "1,7,模擬馬A,5,4,3,2,34.2",
  "2,3,模擬馬B,2,2,2,1,34.8"
].join("\n");

const rows = trial.normalizeRows(
  trial.parseCsv(csv, "result"),
  trial.raceIdentity(race),
  { result: true }
);

assert.equal(rows[0].corner1, 5);
assert.equal(rows[0].corner2, 4);
assert.equal(rows[0].corner3, 3);
assert.equal(rows[0].cornerPosition, 2);
assert.equal(rows[0].last3f, 34.2);

console.log("result CSV details test passed");
for (const [field,value] of [["1角位置","19"],["2角位置","2.5"],["3角位置","abc"],["上がり3F","不明"],["上がり3F","0"]]) { const badCsv = csv.replace("1,7,模擬馬A,5,4,3,2,34.2", "1,7,模擬馬A,5,4,3,2,34.2".split(",").map((cell,i) => i === csv.split("\n")[0].split(",").indexOf(field) ? value : cell).join(",")); assert.throws(() => trial.normalizeRows(trial.parseCsv(badCsv,"result"),trial.raceIdentity(race),{result:true}), /不正|未入力/, field); } console.log("result CSV invalid values test passed");
const review = require("../result-review.js"); const reviewed = review.generateResultReview({ ...race, raceName:"模擬レース", resultText:csv, resultStatus:"確定" }); assert.equal(reviewed.results[0].corner1,5); assert.equal(reviewed.results[0].corner2,4); assert.equal(reviewed.results[0].corner3,3); assert.equal(reviewed.results[0].cornerPosition,2); assert.equal(reviewed.results[0].last3f,34.2); console.log("result review details test passed");
assert.match(reviewed.markdown,/1角5番手/); assert.match(reviewed.markdown,/2角4番手/); assert.match(reviewed.markdown,/3角3番手/); assert.match(reviewed.markdown,/4角2番手/); assert.match(reviewed.markdown,/上がり3F 34\.2/); console.log("result review markdown details test passed");
