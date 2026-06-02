(function (global) {
  "use strict";

  if (!global) return;

  const notConnected = (action, definition) => {
    throw new Error(
      `GitHub保存は未接続です。将来 GitHub Contents API へ接続して /data/${definition.fileName} の${action}を実装してください。`
    );
  };

  const buildFileDescriptor = (definition, payload) => ({
    provider: "github",
    type: definition.type,
    fileName: definition.fileName,
    repositoryPath: definition.repositoryPath,
    // GitHub Contents APIへ接続する時は、このpayloadをbase64 encodeしてPUTします。
    payload,
  });

  const githubAdapter = {
    provider: "github",

    // TODO: GitHub連携時は以下の情報を設定し、GitHub REST API
    //       PUT /repos/{owner}/{repo}/contents/{path} でJSONを保存します。
    //       - owner / repo / branch
    //       - fine-grained token または GitHub App token
    //       - path: definition.repositoryPath（例: /data/raceEntries.json）
    //       - sha: 既存ファイル更新時に必要なblob SHA
    save(definition, payload) {
      buildFileDescriptor(definition, payload);
      return notConnected("保存", definition);
    },

    // TODO: GitHub Contents API の GET でJSONファイルを取得し、base64 decode後にJSON.parseします。
    load(definition) {
      return notConnected("読み込み", definition);
    },

    export(definition) {
      buildFileDescriptor(definition, null);
      return notConnected("エクスポート", definition);
    },

    import(definition, payload) {
      buildFileDescriptor(definition, payload);
      return notConnected("インポート", definition);
    },

    remove(definition) {
      buildFileDescriptor(definition, null);
      return notConnected("削除", definition);
    },

    // テストや将来実装時に、typeごとの保存先とpayloadを確認するための雛形です。
    // 実API接続時はここでowner/repo/branch/token/shaを追加してください。
    createFileDescriptor(definition, payload) {
      return buildFileDescriptor(definition, payload);
    },
  };

  global.HashimotoGithubAdapter = githubAdapter;
})(typeof window !== "undefined" ? window : globalThis);
