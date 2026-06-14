# 橋本競馬AI学習ログシステム

## Official Release v1.5

橋本競馬AI Official Release は `Version 1.5` です。

- Theme: `自己進化データベース`
- Release Score: `100`
- Release Status: `Official Release v1.5`
- トップページ: `index.html`
- 黒×金の公式デザインを維持
- `race-data.json` のレース保存データを `history-db.json` へ蓄積
- AI成績管理カードとAI進化履歴を追加

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

## History Database

`history-db.json` は橋本競馬AIの学習履歴DBです。

対応カテゴリ: 東京 / 中山 / 阪神 / 中京 / 京都 / 新潟 / 福島 / 小倉 / 函館 / 札幌 / WIN5

蓄積項目:

- `course`
- `race`
- `date`
- `prediction`
- `result`
- `review`
- `update`
- `hitRate`
- `returnRate`
- `trifectaReturnRate`
- `win5Result`
- `aiUpdateLog`

## Race Management

各レース管理画面では、`race-data.jsonへ保存` と `history-dbへ蓄積` を実行できます。

`race-data.json` はレース単位の作業保存、`history-db.json` は自己進化DBとしての履歴蓄積に使います。

## AI Performance Cards

トップページに以下のAI成績管理カードを表示します。

- 的中率
- 回収率
- 年間収支
- 三連単回収率
- WIN5成績
- 学習件数

## AI Evolution History

- v1.0 公式版
- v1.1 競馬場選択
- v1.2 Console化
- v1.2.1 レイアウト修正
- v1.3 R1〜R12管理
- v1.4 JSON保存
- v1.5 自己進化DB

## Version Files

- `VERSION`: `1.5`
- `dashboard.js`: `OFFICIAL_RELEASE.version = "1.5"`
- `dashboard.js`: `OFFICIAL_RELEASE.releaseScore = 100`
- `dashboard.js`: `OFFICIAL_RELEASE.status = "Official Release v1.5"`
