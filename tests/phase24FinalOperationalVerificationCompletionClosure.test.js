"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const normalize = (text) => text.replace(/\r\n/g, "\n").trimEnd();

const local = read("private-local.html");
const readme = read("README.md");
const closure = `${local}\n${readme}`;

for (let phase = 1; phase <= 10; phase += 1) {
  assert.ok(local.includes(`Phase24-${phase}`), `Phase24-${phase} display reference must remain`);
}
for (const text of ["Phase24 completed", "main latest: 3380ca0", "PR #299〜#308 merged", "Private Local only", "PLAN_ONLY", "protectedMode", "次工程はPhase25"]) {
  assert.ok(closure.includes(text), `missing completion record: ${text}`);
}

const changed = git("diff", "--name-only", "3380ca0", "--").split(/\r?\n/).filter(Boolean);
const allowed = new Set(["README.md", "private-local.html", "tests/phase24FinalOperationalVerificationCompletionClosure.test.js"]);
assert.ok(changed.length > 0, "closure changes must exist");
for (const file of changed) {
  assert.ok(allowed.has(file), `unexpected changed file: ${file}`);
  assert.ok(!/^phase2[234].*\.js$/i.test(file), `existing phase JS changed: ${file}`);
  assert.ok(!/^\.github\//.test(file), `GitHub Pages/Public config changed: ${file}`);
}

const phase24Js = git("ls-tree", "-r", "--name-only", "3380ca0").split(/\r?\n/).filter((file) => /^phase24.*\.js$/i.test(file));
assert.ok(phase24Js.length >= 10, "expected Phase24 JS files at baseline");
for (const file of phase24Js) {
  assert.strictEqual(normalize(read(file)), normalize(git("show", `3380ca0:${file}`)), `Phase24 JS must remain unchanged: ${file}`);
}

const storageKeyPattern = /hashimotoKeibaAi\.phase24\.[A-Za-z0-9.]+/g;
const baselineKeys = new Set();
const currentKeys = new Set();
for (const file of phase24Js) {
  for (const key of git("show", `3380ca0:${file}`).match(storageKeyPattern) || []) baselineKeys.add(key);
  for (const key of read(file).match(storageKeyPattern) || []) currentKeys.add(key);
}
assert.deepStrictEqual([...currentKeys].sort(), [...baselineKeys].sort(), "Phase24 storage keys must remain unchanged");

const productionDiff = git("diff", "--unified=0", "3380ca0", "--", "private-local.html");
for (const pattern of [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\s*\(/, /\bsendBeacon\s*\(/, /\bsetInterval\s*\(/, /\blocalStorage\s*\.\s*setItem\s*\(/]) {
  assert.ok(!pattern.test(productionDiff), `forbidden processing added: ${pattern}`);
}
assert.ok(!changed.some((file) => /^phase22/i.test(file)), "Phase22 must not change");
assert.ok(!changed.some((file) => /^phase23/i.test(file)), "Phase23 must not change");
assert.ok(!changed.some((file) => /(^|\/)(pages|public)(\/|$)/i.test(file)), "Pages/Public files must not be added");

console.log("phase24FinalOperationalVerificationCompletionClosure.test.js: PASS");
