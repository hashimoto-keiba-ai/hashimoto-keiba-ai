# 橋本競馬AI 学習ログシステム

## Official Release v1.6

橋本競馬AI Official Release は `Version 1.6` です。

- Theme: `全競馬場統合AI`
- Release Score: `101`
- Release Status: `Official Release v1.6`
- トップページ: `index.html`
- 黒×金の公式デザインを維持
- `history-db.json` の学習履歴を、競馬場別の `course-db.json` と距離別の `distance-db.json` へ分類

## Integrated Databases

`course-db.json` は東京、中山、阪神、中京、京都、新潟、福島、小倉、函館、札幌、WIN5 の競馬場別学習DBです。

`distance-db.json` は芝1200、芝1400、芝1600、芝1800、芝2000、芝2400、ダ1200、ダ1400、ダ1700、ダ1800、ダ1900 の距離別学習DBです。

`history-dbへ蓄積` は `prediction`、`result`、`review`、`update` を含むレースデータを、競馬場別と距離別に自動分類します。

## AI Performance Cards

- 総的中率
- 総回収率
- 年間収支
- 三連単回収率
- WIN5成績
- 総学習件数

## Ranking Intelligence

- 好調騎手ランキング
- 好調調教師ランキング
- 人気ゾーンランキング
- コース適性ランキング

## AI Evolution History

- v1.0 公式版
- v1.1 競馬場選択
- v1.2 Console化
- v1.2.1 レイアウト修正
- v1.3 R1〜R12管理
- v1.4 JSON保存
- v1.5 自己進化DB
- v1.6 全競馬場統合AI

## Version Files

- `VERSION`: `1.6`
- `dashboard.js`: `OFFICIAL_RELEASE.version = "1.6"`
- `dashboard.js`: `OFFICIAL_RELEASE.releaseScore = 101`
- `dashboard.js`: `OFFICIAL_RELEASE.status = "Official Release v1.6"`
