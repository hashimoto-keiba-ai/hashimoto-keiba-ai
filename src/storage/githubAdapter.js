(function (global) {
  "use strict";

  if (!global) return;

  const notConnected = (action, definition) => {
    throw new Error(
      `GitHub保存は未接続です。将来 GitHub Contents API へ接続して /data/${definition.fileName} の${action}を実装してください。`
    );
  };

  const githubAdapter = {
    provider: "github",

    // TODO: GitHub連携時は以下の情報を設定し、GitHub REST API
    //       PUT /repos/{owner}/{repo}/contents/{path} でJSONを保存します。
    //       - owner / repo / branch
    //       - fine-grained token または GitHub App token
    //       - path: definition.repositoryPath（例: /data/raceEntries.json）
    //       - sha: 既存ファイル更新時に必要なblob SHA
    save(definition) {
      return notConnected("保存", definition);
    },

    // TODO: GitHub Contents API の GET でJSONファイルを取得し、base64 decode後にJSON.parseします。
    load(definition) {
      return notConnected("読み込み", definition);
    },

    export(definition) {
      return notConnected("エクスポート", definition);
    },

    import(definition) {
      return notConnected("インポート", definition);
    },

    remove(definition) {
      return notConnected("削除", definition);
    },
  };

  global.HashimotoGithubAdapter = githubAdapter;
})(typeof window !== "undefined" ? window : globalThis);
