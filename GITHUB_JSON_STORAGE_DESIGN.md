# 橋本競馬AI Phase2-3 GitHub JSON保存 本実装設計

## 目的

localStorage中心の保存から、GitHub上の `data/*.json` へ保存できる本番運用へ移行するため、保存対象JSON、保存方式、GitHub API、保存前安全処理、設定項目、実装順を整理します。

Phase2-3では、既存のブラウザ運用、localStorage保存、JSONエクスポート/復元、GitHub Pages公開構成を壊さず、localStorageを端末内の一時保存、`data/*.json` を標準保存先、GitHub API保存を複数端末運用の永続保存として段階的に接続します。

## 1. 保存対象JSON

GitHub保存の対象は、リポジトリ直下の `data/` ディレクトリ配下に配置するJSONファイルを標準とします。各ファイルはデータ種別を分け、差分更新や復元時に不要な上書きを避けます。

| ファイル | 保存内容 | 主な連動先 |
| --- | --- | --- |
| `data/raceEntries.json` | レース日、競馬場、R番号、距離、馬場、出馬表メタ情報 | CSV取込、AI指数、結果検証 |
| `data/horseEntries.json` | 出走馬、馬番、騎手、調教師、人気、オッズ、脚質、補足メモ | AI指数、神穴、危険人気馬、三連単生成 |
| `data/predictions.json` | AI指数、神穴指数、危険人気馬指数、予想印、予想根拠 | AI指数ランキング、神穴ランキング、危険人気馬ランキング |
| `data/results.json` | 着順、払戻、的中/不的中、検証メモ | 結果検証、ROI、自己進化AI |
| `data/osUpdates.json` | 競馬場OS、馬場バイアス、距離/脚質/枠順補正の更新案 | 競馬場別AI、馬場バイアスAI、自己進化AI |
| `data/win5Tickets.json` | WIN5対象レース、A/B/C/Dゾーン、組み合わせ、点数 | WIN5自動生成、WIN5結果検証 |
| `data/roiRecords.json` | 購入金額、払戻金額、回収率、券種別/競馬場別/月別集計 | 回収率ダッシュボード、結果検証 |
| `data/betTickets.json` | 三連単などの買い目、券種、点数、金額、期待値メモ | 買い目生成、結果検証、ROI |
| `data/selfEvolutionLogs.json` | 改善提案、採用/保留/却下、反映予定、学習ログ | 自己進化AI、競馬場OS更新案 |
| `data/backupData.json` | 手動/自動バックアップの最新スナップショット、復元用メタ情報 | バックアップ/復元、ロールバック |

### 共通メタ情報

各JSONには、将来の差分更新・競合検出・復元確認に備えて、可能な範囲で以下のメタ情報を持たせます。

```json
{
  "schemaVersion": "phase2-3.1",
  "updatedAt": "2026-06-02T00:00:00.000Z",
  "updatedBy": "hashimoto-keiba-ai",
  "source": "localStorage|jsonExport|githubApi|csvImport|manualInput",
  "records": []
}
```

## 2. 保存方式

### localStorage保存

- 既存機能を壊さないため、Phase2-3でもlocalStorage保存を維持します。
- localStorageは「端末内の即時保存・一時保存」と位置付けます。
- GitHub保存に失敗した場合でも、入力内容が失われないようにlocalStorageへ先に保存します。
- 起動時は設定された保存方式に応じて、localStorageまたはGitHub JSONを読み込みます。

### JSONエクスポート

- 既存localStorageデータを、保存対象JSONの形式に変換してエクスポートします。
- GitHub APIを使えない環境でも、手動で `data/*.json` を更新できる逃げ道として残します。
- エクスポート時は、対象ファイル名、作成日時、件数、スキーマバージョンを表示します。

### GitHub API保存

- GitHub Contents APIを使い、`data/*.json` を読み書きします。
- 保存時は対象ファイルの最新SHAを取得し、上書き対象が最新であることを確認します。
- 保存成功時はGitHub上にコミットを作成し、コミットURLまたは保存時刻をUIに表示します。
- GitHub Tokenはブラウザ保存のリスクがあるため、初期実装ではユーザー自身のリポジトリ運用を前提にし、必要最小限の権限で扱います。

### GitHub API読込

- 起動時、手動同期時、復元時にGitHub上の `data/*.json` を取得します。
- 取得データはJSONとしてパースし、スキーマバージョン、必須キー、配列形式を検証します。
- 読込後すぐに画面データへ反映せず、必要に応じてプレビューまたは確認ダイアログを挟みます。

### 差分更新

- ファイル単位の全量保存を基本としつつ、アプリ内ではレコード単位の差分を計算します。
- `id`、`raceId`、`updatedAt` などをキーに、追加・更新・削除候補を判定します。
- GitHub書込直前に再読込して、リモートの最新SHAとローカル編集元SHAを比較します。
- 競合がある場合は自動上書きせず、ローカル優先、リモート優先、手動マージの選択肢を表示します。

### バックアップ保存

- 重要操作前にlocalStorageとGitHub JSONの両方でバックアップを作成できる設計にします。
- `data/backupData.json` には最新バックアップのスナップショットと、復元対象ファイル、作成日時、理由を保存します。
- 将来的には `data/backups/YYYY-MM-DD-operation.json` のような履歴型バックアップへ拡張できるようにします。

## 3. GitHub API設計

### `readGithubJson(path)`

指定した `data/*.json` をGitHubから読み込み、JSONデータとSHAを返します。

```js
async function readGithubJson(path) {
  // GET /repos/{owner}/{repo}/contents/{path}?ref={branch}
  // return { path, data, sha, updatedAt }
}
```

- `path` は `data/raceEntries.json` などのリポジトリ相対パスです。
- GitHubレスポンスのBase64 contentをデコードし、JSONとしてパースします。
- ファイルが存在しない場合は、空データを作るか、初期化確認を表示します。
- 読込失敗時はlocalStorageの既存データで継続できるようにします。

### `writeGithubJson(path, data)`

指定したJSONデータを保存前検証・バックアップ後にGitHubへ書き込みます。

```js
async function writeGithubJson(path, data) {
  // validate data
  // backupBeforeGithubWrite(path)
  // read latest sha
  // createGithubCommit(path, content, message)
}
```

- 保存前にスキーマ、件数、必須項目、JSONシリアライズ可否を確認します。
- 保存直前のGitHub SHAを取得し、競合の可能性を減らします。
- 成功時はlocalStorage側にも最新保存時刻とGitHub SHAを記録します。
- 失敗時はバックアップとlocalStorageを使って復旧できる状態を維持します。

### `createGithubCommit(path, content, message)`

GitHub Contents APIのPUTリクエストでコミットを作成します。

```js
async function createGithubCommit(path, content, message) {
  // PUT /repos/{owner}/{repo}/contents/{path}
  // body: { message, content: base64Content, branch, sha }
}
```

- `content` は整形済みJSON文字列をBase64化した値です。
- `message` は `Update data/predictions.json from Hashimoto Keiba AI` のように対象が分かる形式にします。
- 既存ファイル更新時はSHAを必須にし、新規作成時のみSHAなしで送信します。
- レスポンスからcommit SHA、HTML URL、更新日時を保存結果として返します。

### `testGithubConnection()`

GitHub設定が正しく、対象リポジトリとブランチへアクセスできるか確認します。

```js
async function testGithubConnection() {
  // validate settings
  // GET repository
  // GET branch
  // optional: read data/README.md or data/backupData.json
}
```

- GitHubユーザー名、リポジトリ名、ブランチ、保存先ディレクトリ、アクセストークンの入力有無を確認します。
- リポジトリ取得、ブランチ取得、保存先ディレクトリ読込を順に確認します。
- 書込テストは、ユーザーが明示的に許可した場合のみテストファイルまたはバックアップ対象へ実行します。

### `backupBeforeGithubWrite()`

GitHubへ上書きする前に、現在のlocalStorageとリモートJSONの退避を行います。

```js
async function backupBeforeGithubWrite(path) {
  // save localStorage snapshot
  // read remote current json
  // save backup metadata to localStorage and/or data/backupData.json
}
```

- localStorage全体または対象データを自動バックアップします。
- 可能であれば、上書き前のGitHub JSONを `data/backupData.json` に保存します。
- バックアップには対象パス、作成日時、操作種別、元SHA、件数を含めます。
- バックアップ失敗時は、GitHub本書込を止めることを原則にします。

## 4. 保存前安全処理

### localStorage自動バックアップ

- GitHub読込、GitHub書込、JSON復元、保存方式切替の前にlocalStorageを自動バックアップします。
- バックアップ名には日時、操作種別、対象ファイル、件数を入れます。
- 最新バックアップだけでなく、直近数件を保持できるようにします。

### GitHub書込前バックアップ

- GitHubへPUTする前に、リモートの現行JSONを読み込み、元SHAと内容をバックアップします。
- リモート読込に失敗した場合は、通信エラー、認証エラー、ファイル未作成を区別して表示します。
- 既存ファイルの内容が不正JSONの場合は、上書き前にユーザー確認を必須にします。

### 復元前確認

- JSON復元やGitHub読込反映の前に、現在の画面データ/localStorageを退避します。
- 復元対象、復元元、件数、更新日時、上書きされるデータ種別を表示します。
- 復元後に画面反映する前に、最低限のバリデーションを行います。

### 上書き確認

- GitHub上のSHAがローカル編集開始時と異なる場合は、上書き確認を必須にします。
- 件数が大きく減る保存、空配列での保存、必須キー欠落の保存は警告します。
- 複数ファイル保存では、全ファイル一括上書きではなく、対象ファイルごとに状態を表示します。

### 失敗時ロールバック方針

- GitHub保存失敗時は、localStorageの最新入力内容を保持し、GitHubへの再保存を促します。
- GitHub保存途中で一部ファイルのみ成功した場合は、成功/失敗ファイルを一覧表示します。
- 復元失敗時は、復元前バックアップからlocalStorageへ戻す導線を出します。
- ロールバックは原則として自動実行せず、対象データと戻し先を確認してから実行します。

## 5. 設定項目

GitHub保存を有効化するため、以下の設定項目を画面で管理します。

| 設定項目 | 例 | 説明 |
| --- | --- | --- |
| GitHubユーザー名 | `hashimoto-user` | GitHubリポジトリの所有者名です。Organizationの場合はOrg名を指定します。 |
| リポジトリ名 | `hashimoto-keiba-ai` | 保存対象のリポジトリ名です。 |
| ブランチ | `main` | `data/*.json` を保存するブランチです。GitHub Pages公開ブランチと一致させる運用を基本にします。 |
| 保存先ディレクトリ | `data` | JSONファイルを置くディレクトリです。初期値は `data` とします。 |
| アクセストークン | `github_pat_...` | Contents APIの読込/書込に使うトークンです。必要最小限の権限で作成します。 |
| 保存方式 | `localStorage` / `GitHub` | 起動時読込と保存ボタンの既定動作を切り替えます。 |

### 設定保存の注意点

- アクセストークンをlocalStorageへ保存する場合は、ブラウザ内に残るリスクをUIで明示します。
- トークン未保存運用も可能にし、必要時だけ入力して保存できるようにします。
- GitHub保存方式を選んでも、localStorageへの安全バックアップは継続します。
- 設定変更時は接続テストを促し、未接続状態でのGitHub保存を防ぎます。

## 6. Phase2-3 実装順

| Step | 実装内容 | 完了目安 |
| --- | --- | --- |
| Step1 | GitHub設定画面の完成 | ユーザー名、リポジトリ名、ブランチ、保存先ディレクトリ、アクセストークン、保存方式を入力・保存できる |
| Step2 | 接続テスト | `testGithubConnection()` でリポジトリ、ブランチ、保存先ディレクトリの読込確認ができる |
| Step3 | `readGithubJson` 実装 | `data/*.json` をGitHubから読み込み、JSONデータ、SHA、更新情報を取得できる |
| Step4 | `writeGithubJson` 実装 | 保存前検証、SHA取得、Contents API PUT、保存結果表示ができる |
| Step5 | 保存前バックアップ | localStorage自動バックアップとGitHub書込前バックアップを実行できる |
| Step6 | `dataService` 連動 | 既存のlocalStorage保存導線を壊さず、保存方式に応じてGitHub読込/保存へ接続できる |
| Step7 | UIから保存方式切替 | localStorage/GitHubを画面から切り替え、手動同期、読込、保存、復元確認を実行できる |

## 既存機能を壊さないための注意点

- Phase2-3の初期実装では、localStorage保存を廃止せず、GitHub保存の失敗時にも既存運用を継続できるようにします。
- GitHub API保存は、まず単一ファイルの読込/保存から実装し、複数ファイル同期は後続で拡張します。
- 空データや不正JSONで既存データを上書きしないよう、保存前に件数と必須キーを確認します。
- GitHub Tokenは画面表示でマスクし、エラーログやコミットメッセージに含めないようにします。
- `data/*.json` の構造変更時は、`schemaVersion` を更新し、旧データからの移行処理を用意します。
