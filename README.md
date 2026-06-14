# 橋本競馬AI学習ログシステム

## Official Release v1.4

橋本競馬AI Official Release は `Version 1.4` です。

- Release Score: `99`
- Release Status: `Official Release v1.4`
- トップページ: `index.html`
- 黒×金の公式デザインを維持
- 各競馬場 Console の R1〜R12 からレース管理ページへ遷移
- 各レース管理ページで `prediction`、`result`、`review`、`update` の4項目を保存
- 保存ファイル名: `race-data.json`

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

## Race Data JSON

`race-management.html` は東京版、中山版、阪神版、中京版、京都版、新潟版、福島版、小倉版、函館版、札幌版に対応します。

各レースページは以下の4項目を JSON に保存します。

- `prediction`: 事前予想
- `result`: 結果
- `review`: 検証
- `update`: アップデート

保存時はブラウザ内にも保持し、`race-data.json` として出力します。

## Version Files

- `VERSION`: `1.4`
- `dashboard.js`: `OFFICIAL_RELEASE.version = "1.4"`
- `dashboard.js`: `OFFICIAL_RELEASE.releaseScore = 99`
- `dashboard.js`: `OFFICIAL_RELEASE.status = "Official Release v1.4"`

## 運用方針

競馬場ごとの学習データを年別に管理し、事前予想、結果検証、OSアップデート、保存ログを蓄積します。

- 事前予想: レース前の指数、買い目、展開メモを保存
- 結果: レース後の着順、配当、的中可否を保存
- 検証: 予想とのズレ、改善点を記録
- アップデート: 予想ロジック、評価基準、買い目ルール、指数補正の変更履歴を保存
