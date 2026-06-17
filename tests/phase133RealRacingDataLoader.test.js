const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const scriptPath = path.join(__dirname, "..", "real-racing-data-loader-phase133.js");
const script = fs.readFileSync(scriptPath, "utf8");
const context = {
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const loader = context.window.HashimotoPhase133RealRacingDataLoader;

assert(loader, "Phase13-3 loader should be exposed");

const normalized = loader.normalizeRecord({
  "Horse Number": "7",
  "Horse Name": "Danger Crown",
  "AI Score": "77",
  Popularity: "4"
});

assert.strictEqual(normalized.horseNumber, 7);
assert.strictEqual(normalized.horseName, "Danger Crown");
assert.strictEqual(normalized.aiScore, 77);
assert.strictEqual(normalized.popularity, 4);

const validationErrors = loader.validateLoadedRecord({
  racecourse: "",
  raceName: "",
  horseNumber: "",
  horseName: "",
  aiScore: 120,
  popularity: 0
});

assert(validationErrors.includes("Missing racecourse"));
assert(validationErrors.includes("Missing race name"));
assert(validationErrors.includes("Missing horse number"));
assert(validationErrors.includes("Missing horse name"));
assert(validationErrors.includes("Invalid AI score"));
assert(validationErrors.includes("Invalid popularity"));

assert.strictEqual(loader.chooseTargetDatabase("Prediction"), "Prediction Database");
assert.strictEqual(loader.chooseTargetDatabase("WIN5"), "WIN5 Database");

const validBatch = loader.loadBatch({
  source: "Tokyo folder migration",
  dataType: "Prediction",
  racecourse: "Tokyo",
  raceName: "Tokyo 11R",
  records: [
    {
      Racecourse: "Tokyo",
      "Race Name": "Tokyo 11R",
      "Horse Number": "2",
      "Horse Name": "Index Star",
      "AI Score": "88",
      Popularity: "2"
    }
  ]
});

assert.strictEqual(validBatch.loadStatus, "Loaded");
assert.strictEqual(validBatch.targetDatabase, "Prediction Database");
assert.strictEqual(validBatch.normalizedRecords, 1);
assert.strictEqual(validBatch.validationErrors, 0);

const invalidBatch = loader.loadBatch({
  source: "Broken file",
  dataType: "ROI",
  racecourse: "Kyoto",
  raceName: "Kyoto 10R",
  records: [
    {
      Racecourse: "Kyoto",
      "Race Name": "Kyoto 10R",
      "Horse Name": "Missing Number",
      "AI Score": "-5"
    }
  ]
});

assert.strictEqual(invalidBatch.loadStatus, "Validation Error");
assert(invalidBatch.validationErrors > 0);

const dashboard = loader.buildDashboard(loader.fallbackDatabase);

assert.strictEqual(dashboard.databaseName, "realRacingDataLoaderDatabase");
assert.strictEqual(dashboard.supportedDataTypes.length, 7);
assert.strictEqual(dashboard.report.totalRecords, 3);
assert.strictEqual(dashboard.widget.loadedRecords, 3);
assert.strictEqual(dashboard.widget.validationErrors, 0);
assert(dashboard.widget.targetDatabaseCount >= 2);

console.log("Phase13-3 Real Racing Data Loader tests passed");
