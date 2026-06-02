(function (global) {
  "use strict";

  if (!global) return;

  const storageTypes = {
    raceEntries: {
      type: "raceEntries",
      storageKey: "hashimoto-keiba-ai:real-race-entry:v1",
      fileName: "raceEntries.json",
      repositoryPath: "/data/raceEntries.json",
      description: "レース登録データ",
    },
    horseEntries: {
      type: "horseEntries",
      storageKey: "hashimoto-keiba-ai:horse-entries:v1",
      fileName: "horseEntries.json",
      repositoryPath: "/data/horseEntries.json",
      description: "出走馬データ",
    },
    predictions: {
      type: "predictions",
      storageKey: "hashimoto-keiba-ai:prediction-logs:v1",
      fileName: "predictions.json",
      repositoryPath: "/data/predictions.json",
      description: "事前予想ログ",
    },
    results: {
      type: "results",
      storageKey: "hashimoto-keiba-ai:result-verification-logs:v1",
      fileName: "results.json",
      repositoryPath: "/data/results.json",
      description: "結果検証ログ",
    },
    osUpdates: {
      type: "osUpdates",
      storageKey: "hashimoto-keiba-ai:os-update-rules:v1",
      fileName: "osUpdates.json",
      repositoryPath: "/data/osUpdates.json",
      description: "OSアップデートログ",
    },
    win5Tickets: {
      type: "win5Tickets",
      storageKey: "hashimoto-keiba-ai:win5-ticket:v1",
      fileName: "win5Tickets.json",
      repositoryPath: "/data/win5Tickets.json",
      description: "WIN5買い目",
    },
    roiRecords: {
      type: "roiRecords",
      storageKey: "hashimoto-keiba-ai:investment-results:v1",
      fileName: "roiRecords.json",
      repositoryPath: "/data/roiRecords.json",
      description: "回収率データ",
    },
    betTickets: {
      type: "betTickets",
      storageKey: "hashimoto-keiba-ai:trifecta-tickets:v1",
      fileName: "betTickets.json",
      repositoryPath: "/data/betTickets.json",
      description: "自動買い目データ",
    },
    backupData: {
      type: "backupData",
      storageKey: "hashimoto-keiba-ai:backup-data:v1",
      fileName: "backupData.json",
      repositoryPath: "/data/backupData.json",
      description: "バックアップデータ",
    },
  };

  // 保存アダプターはここで一元管理します。現在はlocalStorageを既定にし、
  // 将来GitHub保存を有効化する時も呼び出し側はtypeを変えずにadapterだけ差し替えます。
  const adapters = {
    localStorage: global.HashimotoLocalStorageAdapter,
    github: global.HashimotoGithubAdapter,
  };

  let activeAdapterName = "localStorage";

  const getDefinition = (type) => {
    const definition = storageTypes[type];
    if (!definition) {
      throw new Error(`未定義の保存タイプです: ${type}`);
    }
    return definition;
  };

  const getAdapter = (adapterName = activeAdapterName) => {
    const adapter = adapters[adapterName];
    if (!adapter) {
      throw new Error(`未定義の保存アダプターです: ${adapterName}`);
    }
    return adapter;
  };

  const dataStorageService = {
    storageTypes,

    getActiveAdapterName() {
      return activeAdapterName;
    },

    getAdapterNames() {
      return Object.keys(adapters);
    },

    setActiveAdapter(adapterName) {
      getAdapter(adapterName);
      activeAdapterName = adapterName;
    },

    getDefinition,

    getRepositoryFileMap() {
      return Object.values(storageTypes).reduce((accumulator, definition) => {
        accumulator[definition.type] = definition.repositoryPath;
        return accumulator;
      }, {});
    },

    saveData(type, data, adapterName) {
      const definition = getDefinition(type);
      return getAdapter(adapterName).save(definition, data);
    },

    loadData(type, adapterName) {
      const definition = getDefinition(type);
      return getAdapter(adapterName).load(definition);
    },

    exportData(type, adapterName) {
      const definition = getDefinition(type);
      return getAdapter(adapterName).export(definition);
    },

    importData(type, data, adapterName) {
      const definition = getDefinition(type);
      const value = data && Object.prototype.hasOwnProperty.call(data, "value") ? data.value : data;
      return getAdapter(adapterName).import(definition, value);
    },

    removeData(type, adapterName) {
      const definition = getDefinition(type);
      return getAdapter(adapterName).remove(definition);
    },
  };

  global.HashimotoDataStorage = dataStorageService;
})(typeof window !== "undefined" ? window : globalThis);
