# 橋本競馬AI 学習ログシステム

## Official Release v1.7

橋本競馬AI Official Release は `Version 1.7` です。

- Theme: `回収率AI`
- Release Score: `102`
- Release Status: `Official Release v1.7`
- 黒×金の公式デザインを維持
- `profit-db.json` と `return-ai-db.json` を追加
- `history-db.json`、`course-db.json`、`distance-db.json`、`profit-db.json`、`return-ai-db.json` を連携

## Return Rate Databases

`profit-db.json` は年間収支DBです。保存項目は `date`、`course`、`race`、`betAmount`、`payout`、`profit`、`hit`、`odds`、`trifecta`、`win5` です。

`return-ai-db.json` は回収率AIの学習DBです。保存項目は `hitRate`、`returnRate`、`trifectaReturnRate`、`win5ReturnRate`、`favoriteZoneRate`、`jockeyRate`、`trainerRate` です。

## AI Performance Cards

- 総的中率
- 総回収率
- 年間収支
- 三連単回収率
- WIN5回収率
- 学習件数

## Favorite Zone AI

- A＝1～3人気
- B＝4～6人気
- C＝7～10人気
- D＝11人気以上

各ゾーンで的中率、回収率、件数を表示します。

## Jockey AI

- 好調騎手ランキング
- 回収率ランキング
- 連対率ランキング
- 複勝率ランキング

## Trainer AI

- 勝率
- 連対率
- 複勝率
- 回収率

## AI Evolution History

- v1.0 基本版
- v1.1 Console化
- v1.2 競馬場メニュー
- v1.2.1 レイアウト整理
- v1.3 R1～R12管理
- v1.4 JSON保存
- v1.5 自己進化DB
- v1.6 全競馬場統合AI
- v1.7 回収率AI

## Version Files

- `VERSION`: `1.7`
- `dashboard.js`: `OFFICIAL_RELEASE.version = "1.7"`
- `dashboard.js`: `OFFICIAL_RELEASE.releaseScore = 102`
- `dashboard.js`: `OFFICIAL_RELEASE.status = "Official Release v1.7"`
