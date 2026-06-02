(function (global) {
  "use strict";

  if (!global) return;

  const localStorageAdapter = {
    provider: "localStorage",

    save(definition, payload) {
      localStorage.setItem(definition.storageKey, JSON.stringify(payload));
      return payload;
    },

    load(definition) {
      const raw = localStorage.getItem(definition.storageKey);
      return raw ? JSON.parse(raw) : null;
    },

    export(definition) {
      const value = this.load(definition);
      return {
        type: definition.type,
        provider: this.provider,
        repositoryPath: definition.repositoryPath,
        storageKey: definition.storageKey,
        exportedAt: new Date().toISOString(),
        value,
      };
    },

    import(definition, payload) {
      this.save(definition, payload);
      return payload;
    },

    remove(definition) {
      localStorage.removeItem(definition.storageKey);
    },
  };

  global.HashimotoLocalStorageAdapter = localStorageAdapter;
})(typeof window !== "undefined" ? window : globalThis);
