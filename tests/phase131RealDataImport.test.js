const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "real-data-import-phase131.js"), "utf8");
const context = {
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const importer = context.window.HashimotoPhase131RealDataImport;
assert.ok(importer, "Phase13-1 real data importer should be exported");

const csv = "racecourse,raceName,horseNumber,horseName,aiScore,popularity\nTokyo,Tokyo 11R,1,AI Commander,91,1";
const csvPreview = importer.previewImport({
  text: csv,
  format: "CSV",
  dataType: "Prediction Logs",
  racecourse: "Tokyo",
  sourceName: "sample.csv"
});
assert.strictEqual(csvPreview.recordCount, 1);
assert.strictEqual(csvPreview.errorCount, 0);
assert.strictEqual(csvPreview.validation[0].mapping, "Prediction Database");

const jsonRecords = importer.parseImport(JSON.stringify([{ racecourse: "Kyoto", raceName: "Kyoto 12R", horseNumber: 3, horseName: "Kami Flash", aiScore: 84, popularity: 6 }]), "JSON");
assert.strictEqual(jsonRecords.length, 1);
assert.strictEqual(jsonRecords[0].racecourse, "Kyoto");

const markdownRecords = importer.parseImport("racecourse: Hanshin | raceName: Hanshin 9R | horseNumber: 7 | horseName: Danger Crown | aiScore: 77 | popularity: 2", "Markdown text");
assert.strictEqual(markdownRecords.length, 1);
assert.strictEqual(markdownRecords[0].horseName, "Danger Crown");

const invalidPreview = importer.previewImport({
  text: "racecourse,raceName,horseNumber,horseName,aiScore,popularity\n,Tokyo 11R,,AI Commander,120,0",
  format: "CSV",
  dataType: "Prediction Logs",
  racecourse: "Tokyo",
  sourceName: "invalid.csv"
});
assert.ok(invalidPreview.errorCount >= 3, "validation should catch missing and invalid fields");
assert.ok(invalidPreview.validation[0].errors.includes("Missing racecourse"));
assert.ok(invalidPreview.validation[0].errors.includes("Missing horse number"));
assert.ok(invalidPreview.validation[0].errors.includes("Invalid AI score"));
assert.ok(invalidPreview.validation[0].errors.includes("Invalid popularity"));

const report = importer.createImportReport(csvPreview);
assert.strictEqual(report.successCount, 1);
assert.ok(report.targetDatabases.includes("Prediction Database"));

const dashboard = importer.buildDashboard(importer.fallbackDatabase);
assert.strictEqual(dashboard.databaseName, "realDataImportDatabase");
assert.strictEqual(dashboard.importTargets.length, 14);
assert.strictEqual(JSON.stringify(dashboard.supportedFormats), JSON.stringify(["CSV", "JSON", "Markdown text"]));
assert.ok(dashboard.widget.importSuccessCount >= 1);
assert.strictEqual(dashboard.widget.importErrorCount, 0);

console.log("Phase13-1 real data import test passed");
