(function(root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.HashimotoResultReviewDatabase = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function(root) {
  "use strict";

  const KEY = "hashimoto-keiba-ai:result-review-database:v1";

  function raceKey(race) {
    if (!race || !race.date || !race.course || !race.raceNumber) {
      throw new Error("\u958b\u50ac\u65e5\u30fb\u7af6\u99ac\u5834\u30fb\u30ec\u30fc\u30b9\u756a\u53f7\u304c\u5fc5\u8981\u3067\u3059");
    }
    const number = Number(String(race.raceNumber).replace(/R$/i, ""));
    if (!Number.isInteger(number) || number < 1 || number > 12) {
      throw new Error("\u30ec\u30fc\u30b9\u756a\u53f7\u304c\u4e0d\u6b63\u3067\u3059");
    }
    return [race.date, race.course, number].join("|");
  }

  function load(storage = root.localStorage) {
    if (!storage) throw new Error("LocalStorage\u304c\u5229\u7528\u3067\u304d\u307e\u305b\u3093");
    const raw = storage.getItem(KEY);
    if (!raw) return [];
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) {
      throw new Error("\u7d50\u679cDB\u306e\u5f62\u5f0f\u304c\u4e0d\u6b63\u3067\u3059");
    }
    return records;
  }

  function save(review, snapshot, storage = root.localStorage) {
    if (!storage || !review || review.mode !== "race") {
      throw new Error("\u901a\u5e38\u30ec\u30fc\u30b9\u306e\u691c\u8a3c\u30c7\u30fc\u30bf\u304c\u5fc5\u8981\u3067\u3059");
    }

    const id = raceKey(review.race);
    const records = load(storage);
    const previous = records.find(item => item.id === id);
    const trial = root.HashimotoPredictionTrial;

    if ((previous?.snapshot || snapshot) && !trial?.readSnapshot) {
      throw new Error("\u78ba\u5b9a\u4e88\u60f3\u306e\u691c\u8a3c\u6a5f\u80fd\u304c\u3042\u308a\u307e\u305b\u3093");
    }

    if (previous?.snapshot) {
      trial.readSnapshot(JSON.stringify(previous.snapshot));
      if (raceKey(previous.snapshot.race) !== id) {
        throw new Error("\u4fdd\u5b58\u6e08\u307f\u78ba\u5b9a\u4e88\u60f3\u306e\u30ec\u30fc\u30b9\u304c\u4e00\u81f4\u3057\u307e\u305b\u3093");
      }
    }

    if (snapshot) {
      trial.readSnapshot(JSON.stringify(snapshot));
      if (raceKey(snapshot.race) !== id) {
        throw new Error("\u78ba\u5b9a\u4e88\u60f3\u3068\u7d50\u679c\u306e\u30ec\u30fc\u30b9\u304c\u4e00\u81f4\u3057\u307e\u305b\u3093");
      }
    }

    if (previous?.snapshot && snapshot &&
        JSON.stringify(previous.snapshot) !== JSON.stringify(snapshot)) {
      throw new Error("\u78ba\u5b9a\u4e88\u60f3\u306e\u539f\u672c\u306f\u5909\u66f4\u3067\u304d\u307e\u305b\u3093");
    }

    const record = {
      schemaVersion: 1,
      id,
      race: review.race,
      predictionStatus: previous?.snapshot || snapshot
        ? "\u78ba\u5b9a\u4e88\u60f3\u3042\u308a"
        : "\u7d50\u679c\u306e\u307f",
      snapshot: previous?.snapshot || snapshot || null,
      results: review.results,
      hitJudgment: review.hitJudgment,
      markdown: review.markdown,
      savedAt: new Date().toISOString()
    };

    storage.setItem(KEY, JSON.stringify([
      record,
      ...records.filter(item => item.id !== id)
    ]));

    return record;
  }

  return { KEY, raceKey, load, save };
});
