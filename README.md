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

## OSアップデート保存ルール

- 保存場所: `競馬場名/2026/OSアップデート/`
- 予想ロジック、評価基準、買い目ルール、指数補正、除外条件などの変更履歴を保存する。
- 変更理由、変更内容、期待する効果、次回確認ポイントを必ず記録する。
- ファイル名は `YYYYMMDD_競馬場名_OSアップデート_内容.md` を基本形にする。

例: `20260607_東京競馬場_OSアップデート_差し馬評価補正.md`

## 総括保存ルール

- 保存場所: `競馬場名/2026/保存ログ/`
- 週次、月次、開催終了後などの総括を保存する。
- 収支、的中傾向、競馬場ごとの得意条件、苦手条件、次回改善テーマをまとめる。
- ファイル名は `YYYYMMDD_競馬場名_総括.md` または `YYYYMM_競馬場名_月次総括.md` を基本形にする。

例: `202606_東京競馬場_月次総括.md`

## 運用方針

- 競馬場ごとに学習内容を分け、馬場傾向やコース特性が混ざらないように管理する。
- 年が変わったら各競馬場の中に新しい年フォルダを作成し、同じ4分類で運用する。
- 予想、検証、改善、総括の流れを1セットとして残し、橋本競馬AIの学習データベースとして継続的に育てる。
## Phase7-5 正式リリース版 v2.6

橋本競馬AIは `Version 2.6` を正式リリース版として扱います。

トップ画面では、画面上部に `橋本競馬AI Official Release v2.6` の本番版バナーを表示し、リリース情報パネルで以下を確認できます。

- Version
- Release Date
- Completion Score
- Health Score
- Release Status

正式版の状態は `localStorage` に保存されます。

- `releaseVersion`: `2.6`
- `releaseStatus`: `Official Release v2.6`
- `officialReleaseReports`: リリース情報とRelease Notesの履歴

「正式版JSON」ボタンから、Version、Release Date、Completion Score、Health Score、Release Status、Release Notesを含むJSONを出力できます。

Release Notesは、最終監査 `releaseAuditReports` とヘルスチェック `finalHealthCheckReports` をもとに自動生成されます。

## Phase7-4 最終監査（リリース監査）

`index.html` の「最終監査（リリース監査）」パネルで、橋本競馬AIの正式リリース可否を確認できます。

監査対象:

- AI指数
- 神穴AI
- 危険人気馬AI
- 三連単生成
- WIN5生成
- 未来シミュレーター
- EV監視
- 神レース検出
- 勝負レース選定
- 資金配分
- 資金管理
- 実戦レースDB
- AI弱点分析
- 自己学習
- 重み自動調整
- コース別自己進化
- ROI最適化
- 完全統合ダッシュボード
- バックアップ/復元
- Version Manager

表示内容:

- 監査結果: 正常 / 要確認 / 警告 / エラー
- 完成度: 0〜100%
- リリーススコア: 0〜100
- 判定: 開発版 / アルファ版 / ベータ版 / RC版 / 正式版
- 問題一覧: 重大 / 中 / 軽微
- 修正優先順位: 問題の重大度に応じて自動生成

使い方:

1. `index.html` をブラウザで開きます。
2. 「監査実行」を押すと全システムの監査結果を再生成します。
3. 結果は `localStorage` の `releaseAuditReports` に保存されます。
4. 「JSON出力」を押すと、現在の監査結果をJSONファイルとしてダウンロードできます。

監査は `releaseManagerReports`、`finalHealthCheckReports`、`productionReadinessAuditReports`、`productionOperationScores`、`performanceDashboardReports` を参照し、保存済みデータがない場合でも初期監査値から判定できます。

## Official Release v1.8 自動学習AI

Version 1.8では、結果入力後に事前予想と照合し、検証・アップデート内容・各DB保存までをまとめる自動学習AIを追加しました。

自動学習フロー:

1. 結果入力
2. 事前予想と照合
3. 検証を生成
4. アップデート内容を生成
5. `history-db.json`へ保存
6. `course-db.json`へ保存
7. `distance-db.json`へ保存
8. `profit-db.json`へ保存
9. `return-ai-db.json`へ保存
10. `learning-engine.json`へ保存

自動生成する学習項目:

- 危険人気馬
- 神穴馬
- 人気ゾーン
- 騎手傾向
- 調教師傾向
- コース傾向
- 距離傾向
- 三連単構造
- WIN5構造

AI進化履歴:

- v1.0 基本版
- v1.1 Console化
- v1.2 競馬場メニュー
- v1.2.1 レイアウト整理
- v1.3 R1～R12管理
- v1.4 JSON保存
- v1.5 自己進化DB
- v1.6 全競馬場統合AI
- v1.7 回収率AI
- v1.8 自動学習AI

## Official Release v1.9 予想生成AI

Version 1.9では、学習済みDB、騎手AI、調教師AI、人気ゾーンAI、危険人気馬AI、神穴馬AI、三連単構造AI、WIN5構造AIを統合して、最終予想を生成する予想生成AIを追加しました。

予想生成フロー:

1. `history-db`
2. `learning-engine`
3. `course-db`
4. `distance-db`
5. `profit-db`
6. `return-ai-db`
7. 騎手AI
8. 調教師AI
9. 人気ゾーンAI
10. 危険人気馬AI
11. 神穴馬AI
12. 三連単構造AI
13. WIN5構造AI
14. `prediction-engine`
15. 最終予想生成

自動生成する印:

- ◎
- ○
- ▲
- △
- ☆
- 🤫観測馬

人気ゾーンAI:

- A＝1〜3人気
- B＝4〜6人気
- C＝7〜10人気
- D＝11人気以下

三連単構造学習:

- A→A→B
- A→B→C
- B→C→A
- B→C→C
- C→D→B

WIN5構造学習:

- 固定A
- 本線B
- 狙いC
- 爆穴D

AI進化履歴には `v1.9 予想生成AI` を追加しました。

## Official Release v2.0 橋本競馬AI統合OS

Version 2.0では、東京・中山・阪神・京都・中京・新潟・福島・小倉・函館・札幌・WIN5を共通OSで管理する「橋本競馬AI統合OS」を追加しました。

統合管理画面:

- 競馬場切替
- 距離別分析
- コース別分析
- 人気ゾーン分析
- 騎手分析
- 調教師分析
- 三連単分析
- WIN5分析

統合AIエンジン:

1. `history-db`
2. `learning-engine`
3. `prediction-engine`
4. `course-db`
5. `distance-db`
6. `profit-db`
7. `return-ai-db`
8. `integrated-os`
9. 最終予想

統合ステータスカード:

- 総学習数
- 総予想数
- 回収率
- AI信頼度
- 危険人気馬数
- 神穴馬数
- 三連単パターン数
- WIN5パターン数

AIランキング:

- 競馬場別回収率ランキング
- 騎手ランキング
- 調教師ランキング

自己進化履歴には `v2.0 橋本競馬AI統合OS` を追加しました。

## Official Release v2.1 AI秘書システム

Version 2.1では、`integrated-os.json`、`prediction-engine.json`、`learning-engine.json`、`return-ai-db.json`、`history-db.json` と連携し、本日の推奨レース・本命馬・危険人気馬・神穴馬・WIN5候補・注目騎手・注目調教師を要約するAI秘書システムを追加しました。

AI秘書機能:

- AI秘書生成
- 今日の推奨レース
- 今日の本命馬
- 危険人気馬判定
- 神穴馬判定
- WIN5候補生成
- 騎手ランキング
- 調教師ランキング
- 秘書メモ保存

AI会話カード質問例:

- 東京11Rは？
- 危険な1人気は？
- 今日の神穴は？
- WIN5候補は？
- 回収率の高い騎手は？

AI進化履歴には `v2.1 AI秘書システム` を追加しました。

## Official Release v2.2 万馬券探索AI

Version 2.2では、`integrated-os.json`、`prediction-engine.json`、`learning-engine.json`、`ai-secretary-db.json`、`history-db.json`、`return-ai-db.json` と連携し、危険1人気・神穴馬・大穴馬・低人気激走馬・人気ゾーン・三連単パターン・期待回収率から万馬券候補を探索するAIを追加しました。

万馬券探索AI機能:

- 危険1人気判定
- 神穴馬判定
- 大穴馬判定
- 低人気激走馬判定
- 人気ゾーン分析
- 三連単パターン分析
- 期待回収率計算
- 万馬券候補生成
- 回収率ランキング生成
- 学習履歴保存

AI進化履歴には `v2.2 万馬券探索AI` を追加しました。


## Official Release v2.3 WIN5完全自動化AI

Version 2.3では、`integrated-os.json`、`prediction-engine.json`、`learning-engine.json`、`profit-db.json`、`return-ai-db.json`、`history-db.json` と連携し、WIN5候補を安全型・バランス型・高配当型へ自動展開する完全自動化AIを追加しました。Release Scoreは108、Release Statusは`Official Release v2.3`です。

WIN5完全自動化AI機能:

- WIN5候補生成
- A固定判定AI
- B本線AI
- C狙いAI
- D爆穴AI
- 1人気消しAI
- 荒れ順AI
- 的中率AI
- 期待配当AI
- 3000万ラインAI
- 100万ラインAI
- 点数自動計算
- 安全型WIN5生成
- バランス型WIN5生成
- 高配当型WIN5生成
- 買い目自動生成
- WIN5履歴保存

追加DB:

- `win5-db.json`
- `win5-pattern-db.json`
- `win5-history-db.json`

AI進化履歴には `v2.3 WIN5完全自動化AI` を追加しました。


## Official Release v2.4 回収率管理AI

Version 2.4では、`integrated-os.json`、`prediction-engine.json`、`learning-engine.json`、`profit-db.json`、`return-ai-db.json`、`win5-db.json`、`history-db.json` と連携し、資金残高・投資額・払戻・利益・券種別/競馬場別/距離別回収率を統合管理するAIを追加しました。Release Scoreは109、Release Statusは`Official Release v2.4`です。

回収率管理AI機能:

- 現在残高計算
- 総投資額計算
- 総回収額計算
- 総利益計算
- 回収率計算
- 日別回収率
- 週別回収率
- 月別回収率
- 年別回収率
- 券種別回収率
- 競馬場別回収率
- 距離別回収率
- 最高配当抽出
- 最強競馬場判定
- 最強距離判定
- 最強券種判定
- ベストレース抽出
- ワーストレース抽出
- 資金履歴保存

追加DB:

- `bankroll-db.json`
- `bet-history-db.json`
- `return-rate-db.json`
- `profit-history-db.json`

AI進化履歴には `v2.4 回収率管理AI` を追加しました。


## Official Release v2.5 AI研究所

Version 2.5では、`integrated-os.json`、`prediction-engine.json`、`learning-engine.json`、`profit-db.json`、`return-ai-db.json`、`win5-db.json`、`bankroll-db.json`、`history-db.json` と連携し、競馬場OS・距離・騎手・調教師・ラップ・人気ゾーン・三連単・神穴馬・WIN5の研究結果から自己進化ルールを生成するAI研究所を追加しました。Release Scoreは110、Release Statusは`Official Release v2.5`です。

AI研究所機能:

- 競馬場OS研究
- 距離別研究
- 騎手研究
- 調教師研究
- ラップ研究
- 人気ゾーン研究
- 三連単パターン研究
- 神穴馬研究
- WIN5研究
- 自己進化ルール生成
- 研究メモ保存
- 研究ランキング生成

追加DB:

- `research-lab-db.json`
- `course-research-db.json`
- `jockey-research-db.json`
- `trainer-research-db.json`
- `lap-research-db.json`

AI進化履歴には `v2.5 AI研究所` を追加しました。


## Official Release v2.6 自己進化エンジン

Version 2.6では、`integrated-os.json`、`prediction-engine.json`、`learning-engine.json`、`research-lab-db.json`、`course-research-db.json`、`jockey-research-db.json`、`trainer-research-db.json`、`lap-research-db.json`、`profit-db.json`、`return-ai-db.json`、`win5-db.json`、`bankroll-db.json`、`history-db.json` と連携し、当たり予想の学習と外れ予想の検証から自己進化ルールを更新する自己進化エンジンを追加しました。Release Scoreは111、Release Statusは`Official Release v2.6`です。

自己進化エンジン機能:

- 当たり予想自動学習
- 外れ予想自動検証
- 失敗原因分析
- 成功要因分析
- 競馬場OS自動更新
- 距離別OS自動更新
- 騎手補正自動更新
- 調教師補正自動更新
- 人気ゾーン補正自動更新
- 三連単パターン自動更新
- WIN5構造自動更新
- 回収率ルール自動更新
- 危険人気馬ルール自動更新
- 神穴馬ルール自動更新
- AIスコア自己更新
- 自己進化ルール保存

追加DB:

- `self-evolution-db.json`
- `evolution-rule-db.json`
- `failure-pattern-db.json`
- `success-pattern-db.json`

AI進化履歴には `v2.6 自己進化エンジン` を追加しました。
- `VERSION`: `1.6`
- `dashboard.js`: `OFFICIAL_RELEASE.version = "1.6"`
- `dashboard.js`: `OFFICIAL_RELEASE.releaseScore = 101`
- `dashboard.js`: `OFFICIAL_RELEASE.status = "Official Release v1.6"`

## Phase17-4 Global Intelligence Network

Hashimoto Racing OS v4.0に、世界知能ネットワークを追加しました。Official Release v2.8は永久保存版として固定し、既存機能を残したまま、全エンジン・全研究所・全DB・全競馬場AI・全回収率AIの知能を共有します。

共有フロー:

1. 知識共有
2. 学習共有
3. 研究共有
4. 成功パターン共有
5. 失敗パターン共有
6. 未来予測共有
7. 自己進化共有

Dashboardの「Global Intelligence Network」で接続状態、共有知識数、成功/失敗パターン数、未来予測数、進化ルール数を確認できます。「世界知能ネットワーク同期」を押すと、次のDBへ統合結果と履歴を保存します。

- `global-network-db.json`
- `global-learning-db.json`
- `global-pattern-db.json`
- `global-future-db.json`
- `global-evolution-db.json`
- `global-history-db.json`

ネットワーク処理は `global-network-page.js` が担当します。保存済みソースがない場合はSTANDBY、1件以上接続できる場合はONLINEとして表示します。

## Phase17-5 Hashimoto Racing OS v4.0 Final

Phase16のSuper Core Engine、Super Self Evolution Engine、Full Auto Learning Engine、Future Prediction Engine、God AI Engine、Universal Racing Intelligence Engineと、Phase17のRacing OS v4.0、Autonomous Research Institute、Self Optimization Center、Global Intelligence Networkを最終統合しました。Official Release v2.8は永久保存版として保護されます。

最終システム機能:

- 全エンジン監視
- 全研究所監視
- 全DB監視
- Version管理
- Health Score管理
- 完全自律制御
- 最終履歴保存
- Production Ready判定

Dashboardの「Hashimoto Racing OS v4.0 Final」で、システム状態、リリース判定、Health Score、必須機能接続率、DB正常率、保護バージョンを確認できます。「完全自律制御を実行」を押すと、監視結果を次のDBへ保存します。

- `final-system-db.json`
- `final-status-db.json`
- `final-history-db.json`
- `final-release-db.json`

Production Readyには、Health Score 90以上、必須機能接続率80%以上、監視DB正常率80%以上、重大エラー0件、Official Release v2.8保護の全条件が必要です。

## Private運用

このリポジトリは、自分専用のPrivate運用を前提にします。GitHub Pagesで公開せず、リポジトリもPublic化しません。

- Windows: `start-local.bat` をダブルクリックして、Private起動ページを開きます。
- メイン画面: `index.html` はローカルファイルとして直接開いても表示できます。
- Private起動ページ: `private-local.html` から各AIページ、競馬場フォルダ、運用ガイドへ移動できます。
- 詳細手順: `docs/private-operation-guide.md` を確認します。
- 統一アイコン: `icon.svg` をPC、iPad、iPhoneの橋本競馬AIアイコンとして使います。
- 起動ガイド: `docs/private-app-launch-guide.md` にPC、iPad、iPhoneの起動方法をまとめています。

GitHub Pagesは使用しません。公開URLを作る運用は非推奨です。

## Windowsショートカット

1. `start-local.bat` を右クリックします。
2. `送る` → `デスクトップ（ショートカットを作成）` を選びます。
3. デスクトップのショートカット名を `橋本競馬AI` に変更します。
4. アイコンを付ける場合は、ショートカットを右クリックして `プロパティ` → `アイコンの変更` を開き、リポジトリ直下の `icon.svg` を目印に橋本競馬AI用アイコンとして管理します。

Windowsで専用アイコン形式が必要な場合は、`icon.svg` を任意のアイコン変換ツールで `.ico` に変換し、同じ画面から指定します。GitHub Pagesや公開URLは不要です。

## iPad閲覧

iPadでは、GitHubアプリでPrivateリポジトリへログインしてから、このリポジトリを開きます。`private-local.html`、`docs/private-operation-guide.md`、各競馬場フォルダへのリンクを入口にすると、東京・中山・阪神・京都・中京・福島・新潟・小倉・函館・札幌、WIN5、結果検証へ移動しやすくなります。

HTML画面をiPadのSafariで見る場合は、GitHub Pagesではなく、Privateリポジトリ内のファイル確認、または自分のPC/同期フォルダ上のローカルファイルとして開きます。

iPhoneも同じ方針です。GitHubアプリでPrivateリポジトリを開き、必要に応じてSafariでローカル/Private内の入口ページを開いてホーム画面に追加します。公開URLは使いません。

## ダッシュボード

トップ画面は `index.html` です。ブラウザで開くと、橋本競馬AIの学習状況を実データ形式の管理画面として確認できます。

表示項目:

- 本日の重点レース: 競馬場、レース、距離、馬場、展開、軸候補、AI優位差、信頼度
- 馬場・展開メモ: 競馬場別の補正メモ、バイアス、次回反映ポイント
- AI指数ランキング: 順位、印、馬名、レース、指数、想定人気、単勝、期待値、状態
- 神穴ランキング: 順位、馬名、レース、神穴指数、人気、買い目
- 危険人気馬ランキング: 順位、馬名、レース、危険度、人気、危険理由
- 最新保存ログ: 事前予想、結果検証、OSアップデート、保存ログの保存先
- WIN5コーナー: 想定投資、回収目標、信頼度、各レースの候補馬とゾーン分類

画面用のサンプルデータは `dashboard.js` にあります。実運用時は、各競馬場フォルダへ保存した予想、検証、OSアップデート、総括ログをもとに、このデータを更新してください。

## フォルダ構造

```text
AI研究所/
中山競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
東京競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
京都競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
阪神競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
中京競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
新潟競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
福島競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
小倉競馬場/
  2026/
    事前予想/
    結果検証/
    OSアップデート/
    保存ログ/
```

## 事前予想保存ルール

- 保存場所: `競馬場名/2026/事前予想/`
- レース前に作成した予想、指数、買い目、展開メモを保存する。
- 後から結果に合わせて内容を書き換えず、修正が必要な場合は追記として残す。
- ファイル名は `YYYYMMDD_競馬場名_R番号_事前予想.md` を基本形にする。

例: `20260607_東京競馬場_11R_事前予想.md`

## 結果検証保存ルール

- 保存場所: `競馬場名/2026/結果検証/`
- レース後に、着順、配当、的中可否、予想とのズレ、改善点を記録する。
- 事前予想ファイルと同じ日付、競馬場、レース番号を使い、照合しやすくする。
- ファイル名は `YYYYMMDD_競馬場名_R番号_結果検証.md` を基本形にする。

例: `20260607_東京競馬場_11R_結果検証.md`

## OSアップデート保存ルール

- 保存場所: `競馬場名/2026/OSアップデート/`
- 予想ロジック、評価基準、買い目ルール、指数補正、除外条件などの変更履歴を保存する。
- 変更理由、変更内容、期待する効果、次回確認ポイントを必ず記録する。
- ファイル名は `YYYYMMDD_競馬場名_OSアップデート_内容.md` を基本形にする。

例: `20260607_東京競馬場_OSアップデート_差し馬評価補正.md`

## 総括保存ルール

- 保存場所: `競馬場名/2026/保存ログ/`
- 週次、月次、開催終了後などの総括を保存する。
- 収支、的中傾向、競馬場ごとの得意条件、苦手条件、次回改善テーマをまとめる。
- ファイル名は `YYYYMMDD_競馬場名_総括.md` または `YYYYMM_競馬場名_月次総括.md` を基本形にする。

例: `202606_東京競馬場_月次総括.md`

## 運用方針

- 競馬場ごとに学習内容を分け、馬場傾向やコース特性が混ざらないように管理する。
- 年が変わったら各競馬場の中に新しい年フォルダを作成し、同じ4分類で運用する。
- 予想、検証、改善、総括の流れを1セットとして残し、橋本競馬AIの学習データベースとして継続的に育てる。

## Phase18-1 Self Expansion System

Version 5.0 開発開始。Hashimoto Racing OS v4.0 Finalを土台に、AI本体・Dashboard・private-local.html・One Tap Menuが継続的に進化する自己増殖基盤を追加しました。

- Version監視: 現在Version、Release Score、Phase状態、追加エンジン一覧、保護対象Version
- private-local.html 自動進化: Version 5.0システムメニューを生成
- One Tap Menu 自動生成: 自己進化、自己増殖、自動研究、全競馬場統合AI、Global Intelligence、Version管理、Racing OS、v5.0開発
- Dashboard 自動更新: Hashimoto Super Core Engine v5.0とSelf Expansion Systemの状態を表示
- 保護: Official Release v2.8を永久保存し、Hashimoto Racing OS v4.0 Final / Phase16 / Phase17を維持
- 保存DB: self-expansion-db.json、self-expansion-history-db.json、self-expansion-rule-db.json、self-expansion-menu-db.json、self-expansion-version-db.json

## Phase18-2 Auto Development Engine

Hashimoto Super Core Engine v5.0へ自己開発エンジンを追加しました。Official Release v2.8、Hashimoto Racing OS v4.0 Final、Phase16、Phase17、Phase18-1 Self Expansion Systemを保護したまま、開発構成の不足を自動診断します。

- 未接続機能検出: ページ、DB、テスト、Dashboard、private-local.html、One Tap Menu、READMEを監視
- 自動開発候補生成: 次に作るエンジン、DB、Dashboardパネル、Private Localメニュー、テスト、README項目を生成
- 自動ロードマップ生成: Phase18-3、Phase18-4、Phase18-5、Version5.0 Finalまでを生成
- Dashboard / private-local.html / One Tap Menu 監視
- 保存DB: auto-development-db.json、auto-development-history-db.json、auto-development-rule-db.json、auto-development-roadmap-db.json、auto-development-scan-db.json
