# data

## 用途

レース結果、出走表、オッズ、馬場情報、加工前後のデータを保管するフォルダです。

橋本競馬AIの分析に使う基礎データ置き場として使用します。


## GitHub JSON保存連携の想定

現在のダッシュボードはブラウザの `localStorage` に保存しますが、将来GitHub上のJSONファイルへ保存できるように、以下のプレースホルダーを配置しています。

| 保存タイプ | 想定ファイル | 用途 |
| --- | --- | --- |
| `raceEntries` | `raceEntries.json` | レース登録データ |
| `horseEntries` | `horseEntries.json` | 出走馬データ |
| `predictions` | `predictions.json` | 事前予想ログ |
| `results` | `results.json` | 結果検証ログ |
| `osUpdates` | `osUpdates.json` | OSアップデートログ |
| `win5Tickets` | `win5Tickets.json` | WIN5買い目 |
| `roiRecords` | `roiRecords.json` | 回収率・資金管理データ |
| `betTickets` | `betTickets.json` | 三連単など自動買い目 |
| `backupData` | `backupData.json` | バックアップpayload |
| `selfEvolutionLogs` | `selfEvolutionLogs.json` | AI自己進化ループ（結果検証・バックテスト・改善提案） |

GitHub API接続はまだ行わず、`src/storage/githubAdapter.js` に雛形だけを用意しています。
