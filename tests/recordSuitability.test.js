const assert = require("node:assert/strict");
const engine = require("../pre-race-prediction.js");
const race = {course:"東京競馬場",surface:"芝",distance:"1600m",pace:"M"};
const base = {previousFinish:3,closingRank:3,cornerPosition:4,popularity:3,odds:5,gate:4,distanceRecord:"",goingRecord:"",courseRecord:""};
const learning = {zPrime:0,jockeyTrainer:0};
const score = goingRecord => engine.calculateAiIndex({...base,goingRecord},race,learning);
const baseline = score("");
assert.equal(baseline.hold,52,"適性実績が空欄なら基礎点52");
for (const value of ["良","良馬場0戦","未取得"]) {
  assert.equal(score(value).hold,baseline.hold,`${value}だけでは適性加点しない`);
}
for (const value of ["得意","東京○","良馬場で好走","良馬場で3勝"]) {
  assert.equal(score(value).hold,65,`${value}は適性加点する`);
}
for (const value of ["苦手","0-0-0-3"]) {
  assert.equal(score(value).hold,39,`${value}は適性減点する`);
}
console.log("recordSuitability.test.js passed");
