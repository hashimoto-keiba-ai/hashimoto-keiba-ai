(function (global) {
  "use strict";

  if (!global) return;

  const CONFIG_STORAGE_KEY = "hashimoto-keiba-ai:github-config:v1";
  const DEFAULT_CONFIG = {
    owner: "",
    repo: "",
    branch: "main",
    directory: "data",
    token: "",
  };

  const normalizeConfig = (config = {}) => ({
    ...DEFAULT_CONFIG,
    owner: String(config.owner || config.username || "").trim(),
    repo: String(config.repo || config.repository || "").trim(),
    branch: String(config.branch || DEFAULT_CONFIG.branch).trim() || DEFAULT_CONFIG.branch,
    directory: String(config.directory || DEFAULT_CONFIG.directory).trim().replace(/^\/+|\/+$/g, "") || DEFAULT_CONFIG.directory,
    token: String(config.token || "").trim(),
  });

  const getGithubConfig = () => {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      return normalizeConfig(raw ? JSON.parse(raw) : DEFAULT_CONFIG);
    } catch (error) {
      return normalizeConfig(DEFAULT_CONFIG);
    }
  };

  const setGithubConfig = (config) => {
    const normalized = normalizeConfig(config);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  };

  const clearGithubConfig = () => {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    return normalizeConfig(DEFAULT_CONFIG);
  };

  const hasRequiredConfig = (config) => Boolean(config.owner && config.repo && config.branch && config.directory && config.token);

  const encodeBase64 = (value) => btoa(unescape(encodeURIComponent(value)));
  const decodeBase64 = (value) => decodeURIComponent(escape(atob(String(value || "").replace(/\s/g, ""))));

  const normalizeGithubPath = (path, config = getGithubConfig()) => {
    const fileName = String(path || "").replace(/^\/+/, "");
    const directory = String(config.directory || DEFAULT_CONFIG.directory).replace(/^\/+|\/+$/g, "");
    if (!fileName) throw new Error("GitHub保存先pathが指定されていません。");
    if (fileName.startsWith(`${directory}/`)) return fileName;
    if (fileName.startsWith("data/") && directory === "data") return fileName;
    return `${directory}/${fileName.split("/").pop()}`;
  };

  const createGithubApiUrl = (path, config = getGithubConfig()) => {
    const normalizedPath = normalizeGithubPath(path, config).split("/").map(encodeURIComponent).join("/");
    return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${normalizedPath}`;
  };

  const createHeaders = (config = getGithubConfig()) => ({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
  });

  const assertFetchReady = (config = getGithubConfig()) => {
    if (typeof fetch !== "function") {
      throw new Error("この環境ではfetchが利用できないため、GitHub APIへ接続できません。");
    }
    if (!hasRequiredConfig(config)) {
      throw new Error("GitHub設定（ユーザー名、リポジトリ名、ブランチ名、保存先ディレクトリ、アクセストークン）を入力してください。");
    }
  };

  const parseGithubError = async (response) => {
    try {
      const body = await response.json();
      return body.message || `${response.status} ${response.statusText}`;
    } catch (error) {
      return `${response.status} ${response.statusText}`;
    }
  };

  const readGithubJson = async (path) => {
    const config = getGithubConfig();
    assertFetchReady(config);
    const response = await fetch(`${createGithubApiUrl(path, config)}?ref=${encodeURIComponent(config.branch)}`, {
      method: "GET",
      headers: createHeaders(config),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub JSON読み込みに失敗しました: ${await parseGithubError(response)}`);
    const body = await response.json();
    return JSON.parse(decodeBase64(body.content));
  };

  const createGithubCommit = async (path, content, message) => {
    const config = getGithubConfig();
    assertFetchReady(config);
    const url = createGithubApiUrl(path, config);
    let sha = "";

    const current = await fetch(`${url}?ref=${encodeURIComponent(config.branch)}`, {
      method: "GET",
      headers: createHeaders(config),
    });
    if (current.ok) {
      const currentBody = await current.json();
      sha = currentBody.sha || "";
    } else if (current.status !== 404) {
      throw new Error(`GitHub既存ファイル確認に失敗しました: ${await parseGithubError(current)}`);
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: { ...createHeaders(config), "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: encodeBase64(content),
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!response.ok) throw new Error(`GitHubコミット作成に失敗しました: ${await parseGithubError(response)}`);
    return response.json();
  };

  const writeGithubJson = async (path, data) => {
    const content = JSON.stringify(data, null, 2);
    const message = `Update ${normalizeGithubPath(path)}`;
    return createGithubCommit(path, content, message);
  };

  const testGithubConnection = async () => {
    const config = getGithubConfig();
    if (!hasRequiredConfig(config)) {
      return {
        ok: false,
        mode: "mock",
        message: "GitHub設定が未入力です。入力後にfetch接続テストを実行できます。",
        config: { ...config, token: config.token ? "***" : "" },
      };
    }
    if (typeof fetch !== "function") {
      return { ok: false, mode: "mock", message: "fetch未対応環境のためモック判定です。ブラウザではGitHub APIへ接続します。" };
    }

    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`, {
      method: "GET",
      headers: createHeaders(config),
    });
    if (!response.ok) {
      return { ok: false, mode: "fetch", message: `GitHub API接続失敗: ${await parseGithubError(response)}` };
    }
    const repository = await response.json();
    return { ok: true, mode: "fetch", message: `${repository.full_name} に接続できました。保存先: ${config.directory}/ / branch: ${config.branch}` };
  };

  const buildFileDescriptor = (definition, payload) => ({
    provider: "github",
    type: definition.type,
    fileName: definition.fileName,
    repositoryPath: normalizeGithubPath(definition.repositoryPath || definition.fileName),
    payload,
  });

  const githubAdapter = {
    provider: "github",
    getGithubConfig,
    setGithubConfig,
    clearGithubConfig,
    testGithubConnection,
    readGithubJson,
    writeGithubJson,
    createGithubCommit,

    save(definition, payload) {
      return writeGithubJson(definition.repositoryPath || definition.fileName, payload);
    },

    load(definition) {
      return readGithubJson(definition.repositoryPath || definition.fileName);
    },

    export(definition) {
      return readGithubJson(definition.repositoryPath || definition.fileName).then((value) => ({
        type: definition.type,
        provider: this.provider,
        repositoryPath: normalizeGithubPath(definition.repositoryPath || definition.fileName),
        exportedAt: new Date().toISOString(),
        value,
      }));
    },

    import(definition, payload) {
      return writeGithubJson(definition.repositoryPath || definition.fileName, payload);
    },

    remove(definition) {
      return createGithubCommit(definition.repositoryPath || definition.fileName, JSON.stringify(null, null, 2), `Clear ${normalizeGithubPath(definition.repositoryPath || definition.fileName)}`);
    },

    createFileDescriptor(definition, payload) {
      return buildFileDescriptor(definition, payload);
    },
  };

  global.HashimotoGithubAdapter = githubAdapter;
})(typeof window !== "undefined" ? window : globalThis);
