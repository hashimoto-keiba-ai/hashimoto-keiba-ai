"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const trial = require("../prediction-trial-core.js");
const prediction = require("../pre-race-prediction.js");
const review = require("../result-review.js");

const race = {date:"2026-06-14",course:"東京競馬場",raceNumber:"11R",raceName:"模擬レース",surface:"芝",distance:"1600m",pace:"H"};
const now = "2026-06-14T06:30:00Z";
const source = {sourceName:"JRA公式（模擬）",sourceType:"公式",acquiredAt:"2026-06-14T15:00+09:00",
  scheduledStartAt:"2026-06-14T15:45+09:00",importMethod:"CSV",explicitConfirmation:true};
const standard = [
  "horse_name,race_number,horse_number,running_style,expected_corner4,popularity,odds,source_note,date,racecourse,entry_status,ai_score",
  '"模擬,馬""A""",11,7,差し,5,2,4.8,"任意情報",2026-06-14,東京,出走,99',
  "模擬馬B,11,3,先行,3,1,3.1,,2026-06-14,東京,出走,",
  "模擬馬C,11,11,追込,7,3,7.5,,2026-06-14,東京,出走,",
  "模擬馬D,11,5,,,,,,2026-06-14,東京,取消,",
  "模擬馬E,11,8,,,,,,2026-06-14,東京,除外,"
].join("\r\n");
const run = (horseText, options = {}) => prediction.generatePreRacePrediction({
  ...race, strictTrial:true, fieldSize:5, horseText, ...options
});
const generated = run("\uFEFF" + standard);
assert.deepEqual(generated.entries.map(horse => horse.number), ["7","3","11","5","8"]);
assert.equal(generated.entries[0].name, '模擬,馬"A"');
assert.equal(generated.entries[0].runningStyle, "差し");
assert.equal(generated.entries[0].cornerPosition, 5);
assert.equal(generated.entries[0].previousFinish, null);
assert.equal(generated.entries[0].aiScore, "99");
assert.equal(generated.horses.length, 3);
assert(generated.inputWarnings.some(warning => warning.includes("前走着順")));
assert(generated.inputWarnings.some(warning => warning.includes("取消")));
assert(generated.inputWarnings.some(warning => warning.includes("除外")));
assert(!generated.trifectaTickets.flat().some(h => ["5","8"].includes(h.number)));
assert.equal(generated.horses.find(h => h.number === "7").fin, 50);

for (const header of ["馬番,馬名,脚質,想定4角位置","number,name,runningStyle,cornerPosition"]) {
  const parsed = prediction.parseHorseText(header+"\n7,模擬馬,差し,5");
  assert.deepEqual([parsed[0].number,parsed[0].name,parsed[0].runningStyle,parsed[0].cornerPosition],["7","模擬馬","差し",5]);
}
assert.equal(prediction.parseHorseText('馬番,馬名,馬場実績\n7,模擬馬,"良\n稍重"')[0].goingRecord,"良\n稍重");
assert.equal(prediction.parseHorseText("7,模擬馬")[0].odds,null);
assert.throws(() => run(standard.replace(",11,3,",",11,07,")), /重複馬番/);
assert.throws(() => run(standard.replace("模擬馬B,"," ,")), /3行: 馬名/);
assert.throws(() => run(standard.replace(",11,3,",",11,,")), /3行: 馬番/);
assert.throws(() => run(standard.replace(",11,3,",",11,19,")), /3行: 馬番/);
assert.throws(() => run(standard.replace(",3,7.5",",19,7.5")), /人気/);
assert.throws(() => run(standard.replace(",3,7.5",",3,-1")), /オッズ/);
assert.throws(() => run(standard.replace(",3,7.5",",3,7.5abc")), /オッズ/);
assert.throws(() => run(standard.replace(",差し,5,",",差し,5.2,")), /4角位置/);
assert.throws(() => run(standard.replace(",11,3,",",10,3,")), /3行: raceNumber/);
assert.throws(() => run(standard.replace(",東京,取消,",",京都,取消,")), /course/);
assert.throws(() => run(standard.replace("2026-06-14,東京,取消","2026-06-13,東京,取消")), /date/);
assert.throws(() => run(standard,{fieldSize:4}), /頭数/);
assert.throws(() => run(standard,{course:""}), /競馬場/);
assert.throws(() => run(standard.replace("horse_number","bad_header")), /ヘッダー/);
assert.throws(() => run(standard.replace("source_note","馬番")), /ヘッダー/);
assert.throws(() => run(standard.replace("任意情報",'"broken')), /引用符/);
assert.throws(() => run(standard.replace("模擬馬B,","模擬馬B,余分,")), /列数/);
assert.throws(() => run(standard.replace("東京,出走,99","東京,取消,99")), /3頭/);
assert.equal(prediction.parseHorseText("馬番,馬名,scratched\n7,模擬馬,true")[0].status,"withdrawn");
assert.deepEqual(run(standard.replace(",出走,99",",出走,1")).horses.map(h=>h.zIndex),generated.horses.map(h=>h.zIndex));
assert.deepEqual(run(standard,{useSelfLearning:true,learningRecords:[{zPrimeCorrection:50}]}).horses,generated.horses);
console.log("P0 CSV validation, missing values, source isolation: PASS (simulated)");

const legacy = [
  "馬番,馬名,人気,オッズ,騎手,調教師,馬体重,馬体重増減,脚質,想定4角位置,前走着順,前走4角位置,上がり順位,距離実績,馬場実績,コース実績,血統,枠番",
  "1,危険トップ,1,2.1,新人,若手,470,-14,逃げ,1,8,1,8,普通,普通,苦手,短距離系,1",
  "7,神穴スター,8,24.5,横山武,矢作厩舎,492,+4,差し,5,9,6,1,得意,良,東京○,左回り末脚,4",
  "3,本命ホース,2,4.8,川田,中内田厩舎,486,+2,差し,6,1,4,2,得意,良,東京○,高速上がり,5",
  "12,相手ホース,5,11.4,戸崎,堀厩舎,500,+6,先行,3,3,2,4,得意,良,東京○,持続,6"
].join("\n");
const baseline = prediction.generatePreRacePrediction({...race,horseText:legacy});
assert.deepEqual(baseline.horses.map(h => [h.number,h.zIndex,h.zPrimeIndex,h.totalScore,h.mark]),
  [["3",95.3,100,100,"◎"],["7",85.2,98.2,100,"○"],["12",81,86,88.3,"▲"],["1",59,59,54.8,"△"]]);
for (const [count,max] of [[3,8],[10,8],[11,12],[14,12],[15,16],[18,16]]) {
  const horses = Array.from({length:count},(_,i) => ({number:i+1,name:"模擬馬"+i,popularity:i+1,odds:2+i}));
  const p = prediction.generatePreRacePrediction({...race,horses});
  assert.equal(p.trifectaPointCount,max);
  for (const tickets of [p.trifectaTickets,p.fullAuto.trifectaCandidates.map(ticket=>ticket.horses)]) {
    assert(tickets.length <= max);
    assert.equal(new Set(tickets.map(ticket => ticket.map(h=>h.number).join("-"))).size,tickets.length);
    assert(tickets.every(ticket => new Set(ticket.map(h=>h.number)).size === 3));
  }
  if (count === 3) assert(p.trifectaTickets.length < max && p.markdown.includes("不足"));
}
const htmlProbe = run(standard.replace("模擬馬B","<b>模擬馬B</b>"));
assert(!htmlProbe.aiIndexHtml.includes("<b>模擬馬B</b>"));
assert(!htmlProbe.fullAuto.html.includes("<b>模擬馬B</b>"));
assert(htmlProbe.aiIndexHtml.includes("&lt;b&gt;"));
assert(htmlProbe.fullAuto.markdown.includes("模擬本命上位率"));
console.log("P0 Z baseline, ticket order/limits, HTML escaping: PASS (simulated)");

const snapshot = trial.createSnapshot(generated, {...source, supplementalSources:[
  {sourceName:"netkeibaマスター（模擬）",sourceType:"会員情報",dataType:"AI総合スコア",acquiredAt:source.acquiredAt,importMethod:"貼り付け"}
]}, now);
assert.equal(snapshot.supplementalSources[0].dataType,"AI総合スコア");
assert.deepEqual(snapshot.safety,{protectedMode:true,planOnly:true,privateLocalOnly:true});
assert.throws(() => trial.createSnapshot(generated,{...source,explicitConfirmation:false},now),/明示確認/);
assert.throws(() => trial.createSnapshot(generated,source,"2026-06-14T06:45:00Z"),/時刻/);
assert.throws(() => trial.createSnapshot(generated,{...source,acquiredAt:"2026-06-14T06:35:00Z"},now),/時刻/);
assert.throws(() => trial.createSnapshot(generated,{...source,scheduledStartAt:"2026-06-15T15:45+09:00"},now),/時刻/);
assert.throws(() => trial.createSnapshot(baseline,source,now),/入力検証済み/);
const serialized = JSON.stringify(snapshot);
const loaded = trial.readSnapshot(serialized);
assert.deepEqual(loaded,snapshot);
assert.throws(() => trial.readSnapshot(serialized.replace("模擬レース","後日変更")),/変更/);
assert.throws(() => { loaded.trifectaTickets[0][0] = "18"; },TypeError);

const fixtures = Array.from({length:8},(_,i) => ({number:i+1,name:"模擬馬"+(i+1),popularity:i+1,odds:i+2}));
const orderedPrediction = prediction.generatePreRacePrediction({...race,strictTrial:true,fieldSize:8,horses:fixtures});
const exact = trial.createSnapshot(orderedPrediction,source,now);
const winner = exact.trifectaTickets[0];
const reverse = [winner[0],winner[2],winner[1]];
// Pick a permutation absent from the actual candidate set, retaining the same three horses.
const permutation = [reverse,[winner[1],winner[0],winner[2]],[winner[2],winner[1],winner[0]]]
  .find(order => !exact.trifectaTickets.some(ticket => ticket.join("-") === order.join("-")));
assert(permutation);
const rows = order => order.map((number,i) => ({finish:i+1,number,name:"模擬馬"+number}));
const evaluate = (order, patch={}) => review.generateResultReview({...race,snapshot:exact,resultStatus:"確定",results:rows(order),...patch}).hitJudgment;
assert.equal(evaluate(winner),"的中");
const eleven = prediction.generatePreRacePrediction({...race,strictTrial:true,fieldSize:11,
  horses:Array.from({length:11},(_,i) => ({number:i+1,name:"模擬馬"+(i+1)}))});
const literalTicket = trial.createSnapshot({...eleven,trifectaTickets:[["7","3","11"].map(number => ({number}))]},source,now);
for (const [order,expected] of [
  [["7","3","11"],"的中"],[["7","11","3"],"不的中"],[["3","7","11"],"不的中"]
]) assert.equal(evaluate(order,{snapshot:literalTicket}),expected);
assert.equal(evaluate(permutation),"不的中");
assert.equal(evaluate([]),"判定不能・要確認");
assert.equal(evaluate(winner,{snapshot:null,predictionMarkdown:"模擬馬1 模擬馬2 模擬馬3 三連単"}),"判定不能・要確認");
assert.equal(evaluate(winner,{resultStatus:"未確定"}),"判定不能・要確認");
assert.equal(evaluate([],{resultStatus:"不成立"}),"対象外・要確認");
assert.throws(() => evaluate(winner,{raceNumber:"10R"}),/識別情報/);
assert.throws(() => evaluate(winner,{results:rows(winner).map(h=>({...h,name:"別の馬"}))}),/馬番・馬名/);
assert.equal(evaluate(winner,{results:rows(winner).map((h,i)=>i ? h : {...h,finish:"取消"})}),"対象外・要確認");
assert.equal(evaluate(winner,{results:rows(winner).map((h,i)=>i ? h : {...h,finish:2})}),"判定不能・要確認");
const parsedResult = review.parseResultText("horse_name,horse_number,finish_position,corner4_position\n模擬馬A,7,1,4");
assert.deepEqual([parsedResult[0].number,parsedResult[0].finish,parsedResult[0].cornerPosition],["7",1,4]);
const resultInput = rows(winner).reverse();
const prior = JSON.stringify(resultInput);
evaluate(winner,{results:resultInput});
assert.equal(JSON.stringify(resultInput),prior);
assert.equal(JSON.stringify(loaded),serialized);
console.log("P0 structured result match, pending cases, snapshot immutability: PASS (simulated)");

function page(htmlPath, scripts, location) {
  const root = path.join(__dirname,"..");
  const reject = () => { throw Error("禁止された副作用"); };
  const elements = new Map(), blobs = new Map(), downloads = [];
  function get(id) {
    if (!elements.has(id)) elements.set(id,{
      value:"", files:[], events:{}, appendChild(option){if(option.selected || !this.value) this.value=option.value;},
      addEventListener(name,callback){this.events[name]=callback;}
    });
    return elements.get(id);
  }
  const context = {
    Date:class extends Date { constructor(...args){super(...(args.length ? args : [now]));} },
    location, URLSearchParams, Blob,
    URL:{createObjectURL(blob){const id="blob:"+blobs.size;blobs.set(id,blob);return id;},revokeObjectURL(id){blobs.delete(id);}},
    FormData:class { constructor(form){this.form=form;} entries(){return Object.entries(this.form.fields);} },
    localStorage:{getItem:reject,setItem:reject,removeItem:reject}, fetch:reject,
    XMLHttpRequest:reject, WebSocket:reject, navigator:{sendBeacon:reject},
    document:{getElementById:get,querySelector:get,createElement(tag){
      return tag === "a" ? {click(){downloads.push({name:this.download,blob:blobs.get(this.href)});}} : {};
    }}
  };
  context.window=context;
  vm.createContext(context);
  for (const script of scripts) vm.runInContext(fs.readFileSync(path.join(root,script),"utf8"),context);
  const html = fs.readFileSync(path.join(root,htmlPath),"utf8");
  assert(html.includes("connect-src 'none'; form-action 'none'"));
  for (const inline of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) vm.runInContext(inline[1],context);
  return {get,downloads};
}

async function testUi() {
  const location = {protocol:"file:",hostname:"",search:"?course="+encodeURIComponent(race.course)};
  const ui = page("pre-race-prediction.html",["prediction-trial-core.js","pre-race-prediction.js"],location);
  const fileInput = ui.get("entry-csv-file");
  fileInput.files = [{text:async()=>standard}];
  await fileInput.events.change({currentTarget:fileInput});
  const form = ui.get("pre-race-form");
  form.fields={...race,fieldSize:"5",horseText:ui.get("[name='horseText']").value,entryMode:"file",
    sourceName:source.sourceName,sourceType:source.sourceType,acquiredAt:"2026-06-14T15:00",scheduledStartAt:"2026-06-14T15:45"};
  const submit = {preventDefault(){}};
  form.events.submit(submit);
  assert(ui.get("prediction-output").textContent.includes("データ不足"));
  assert.equal(ui.downloads.length,0);
  ui.get("download-snapshot").events.click();
  assert.equal(ui.downloads.length,0);
  ui.get("confirm-before-race").checked=true;
  ui.get("download-snapshot").events.click();
  assert.equal(ui.downloads.length,1);
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"hashimoto-trial-test-"));
  const filename=path.join(dir,"confirmed.json");
  try {
    fs.writeFileSync(filename,await ui.downloads[0].blob.text(),{flag:"wx"});
    const saved=trial.readSnapshot(fs.readFileSync(filename,"utf8"));
    const output=page("result-review.html",["prediction-trial-core.js","result-review.js"],location);
    const snapshotFile=output.get("confirmed-prediction-file");
    snapshotFile.files=[{text:async()=>fs.readFileSync(filename,"utf8")}];
    await snapshotFile.events.change();
    const reviewForm=output.get("result-review-form");
    reviewForm.fields={...race,mode:"race",resultStatus:"確定",resultText:"着順,馬番,馬名\n"+
      saved.trifectaTickets[0].map((number,i) => [i+1,number,JSON.stringify(saved.entries.find(h=>h.number===number).name).replace(/\\"/g,'""')].join(",")).join("\n")};
    reviewForm.events.submit(submit);
    assert.equal(output.get("review-status").textContent,"的中");
    assert.equal(output.downloads.length,0);
    assert(!output.get("run-self-learning").events.click);
    assert.equal(trial.readSnapshot(fs.readFileSync(filename,"utf8")).checksum,saved.checksum);
    form.events.input();
    ui.get("download-snapshot").events.click();
    assert.equal(ui.downloads.length,1);
    location.protocol="https:";
    location.hostname="example.invalid";
    form.events.submit(submit);
    assert.match(ui.get("trial-status").textContent,/Private Local/);
  } finally {
    if (fs.existsSync(filename)) fs.unlinkSync(filename);
    fs.rmdirSync(dir);
  }
  console.log("P0 UI handlers, explicit file save/reload, safety boundary: PASS (mock DOM, real temporary file)");
}
testUi().catch(error=>{console.error(error);process.exitCode=1;});
