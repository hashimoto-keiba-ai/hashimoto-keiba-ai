# 橋本競馬AI学習ログシステム

## Official Release v1.3

橋本競馬AI Official Release は `Version 1.3` です。

- Release Score: `98`
- Release Status: `Official Release v1.3`
- トップページ: `index.html`
- 黒×金の公式デザインを維持
- 各競馬場 Console に R1〜R12 のレース管理ボタンを追加
- 各レースページに `事前予想`、`結果`、`検証`、`アップデート`、`保存` の5項目を追加

## Console Pages

トップページの競馬場選択ボタンは、以下の専用AI Consoleへリンクします。

- `tokyo-console.html`: 東京版AI Console
- `nakayama-console.html`: 中山版AI Console
- `hanshin-console.html`: 阪神版AI Console
- `chukyo-console.html`: 中京版AI Console
- `kyoto-console.html`: 京都版AI Console
- `niigata-console.html`: 新潟版AI Console
- `fukushima-console.html`: 福島版AI Console
- `kokura-console.html`: 小倉版AI Console
- `hakodate-console.html`: 函館版AI Console
- `sapporo-console.html`: 札幌版AI Console
- `win5-console.html`: WIN5 AI Console

競馬場別 Console は `R1` から `R12` を表示し、各ボタンから共通レース管理ページ `race-management.html` へ遷移します。

## Race Management

各レースページは黒×金デザインで、以下の5項目を表示します。

- 事前予想
- 結果
- 検証
- アップデート
- 保存

## Version Files

- `VERSION`: `1.3`
- `dashboard.js`: `OFFICIAL_RELEASE.version = "1.3"`
- `dashboard.js`: `OFFICIAL_RELEASE.releaseScore = 98`
- `dashboard.js`: `OFFICIAL_RELEASE.status = "Official Release v1.3"`

## 運用方針

競馬場ごとの学習データを年別に管理し、事前予想、結果検証、OSアップデート、保存ログを蓄積します。

- 事前予想: レース前の指数、買い目、展開メモを保存
- 結果: レース後の着順、配当、的中可否を保存
- 検証: 予想とのズレ、改善点を記録
- アップデート: 予想ロジック、評価基準、買い目ルール、指数補正の変更履歴を保存
- 保存: レース単位の管理データを保存するための入口
