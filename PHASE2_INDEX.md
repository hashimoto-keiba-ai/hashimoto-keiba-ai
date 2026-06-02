# 橋本競馬AI Phase2 総合索引・運用ナビ

## 目的

Phase2で作成した設計書・運用書を一覧化し、実装・運用・週末実戦のどの場面でどのドキュメントを見ればよいか分かる入口として管理します。

Phase2は、v1.0完成版のブラウザ運用、iPad対応、CSV取込、localStorage保存、GitHub Pages公開、AI指数・神穴・危険人気馬・三連単・WIN5・ROI・自己進化ログの基本導線を壊さずに、実データ連携と自動化を段階的に強化するフェーズです。

## 1. Phase2全体像

Phase2では、以下の5つを柱として拡張します。

| 柱 | 内容 | 主な確認先 |
| --- | --- | --- |
| 実データ連携 | 出馬表、オッズ、レース条件、結果情報をCSVまたは将来APIで取り込み、手入力依存を減らす | [`DATA_IMPORT_DESIGN.md`](DATA_IMPORT_DESIGN.md) |
| AI指数自動計算 | 取り込んだ実データからAI指数、神穴指数、危険人気馬指数を自動算出し、買い目生成へ接続する | [`AI_SCORE_ENGINE_DESIGN.md`](AI_SCORE_ENGINE_DESIGN.md) |
| GitHub JSON保存 | localStorage中心の保存から、`data/*.json` とGitHub API保存へ段階移行する | [`GITHUB_JSON_STORAGE_DESIGN.md`](GITHUB_JSON_STORAGE_DESIGN.md) |
| 自己進化AI | 結果検証、バックテスト、OSアップデートをもとにAI補正と競馬場OSを継続改善する | [`SELF_EVOLUTION_AI_DESIGN.md`](SELF_EVOLUTION_AI_DESIGN.md) |
| iPad実戦運用 | iPadだけで週末の出馬表確認、CSV取込、指数確認、買い目生成、結果検証、改善ログ保存まで行う | [`IPAD_OPERATION_MANUAL.md`](IPAD_OPERATION_MANUAL.md) |

## 2. 設計書リンク一覧

Phase2関連ドキュメントは以下を入口に確認します。

| ドキュメント | 役割 | 見るタイミング |
| --- | --- | --- |
| [`PHASE2_ROADMAP.md`](PHASE2_ROADMAP.md) | Phase2全体の目的、段階、優先順位、完了条件を管理するロードマップ | Phase2全体の方向性を確認するとき |
| [`DATA_IMPORT_DESIGN.md`](DATA_IMPORT_DESIGN.md) | 出馬表CSV、オッズCSV、結果CSV、将来のnetkeiba/JRA取込に関する設計 | CSV取込強化や実データ連携を実装するとき |
| [`AI_SCORE_ENGINE_DESIGN.md`](AI_SCORE_ENGINE_DESIGN.md) | AI指数、神穴指数、危険人気馬指数の計算ロジックと連動先を定義 | 指数自動計算や買い目生成精度を改善するとき |
| [`GITHUB_JSON_STORAGE_DESIGN.md`](GITHUB_JSON_STORAGE_DESIGN.md) | `data/*.json` 保存、GitHub API保存、差分更新、バックアップ方針を定義 | 保存方式をlocalStorageからJSON/GitHubへ広げるとき |
| [`SELF_EVOLUTION_AI_DESIGN.md`](SELF_EVOLUTION_AI_DESIGN.md) | 結果検証、バックテスト、改善ログ、競馬場OS更新案の仕組みを定義 | 予想結果を学習・改善へ反映するとき |
| [`IPAD_OPERATION_MANUAL.md`](IPAD_OPERATION_MANUAL.md) | iPadで週末実戦運用を完結するための手順書 | 開催前日から開催終了後まで実戦で使うとき |

## 3. 実装優先順位

Phase2実装は、既存機能を壊さないためにA→B→Cの順で進めます。

### A：最優先

まずは、予想精度と検証蓄積に直結する入口を固めます。

- **CSV取込強化**
  - 出馬表、オッズ、結果CSVの標準項目を整理する
  - 取込前プレビュー、項目マッピング、エラー検出、取込ログを整える
- **AI指数自動計算**
  - 取り込んだ出馬表・オッズからAI指数、神穴指数、危険人気馬指数を自動計算する
  - 競馬場OS、距離適性、騎手/調教師補正を段階的に反映する
- **結果CSV取込**
  - 着順、払戻、的中/不的中、ROIを検証ログへ取り込む
  - 自己進化AIで使える検証データとして保存する

### B：次点

Aで入力・計算・検証の流れを固めた後、保存と改善サイクルを強化します。

- **GitHub JSON保存**
  - `data/*.json` を標準保存先として扱う
  - GitHub API保存、差分更新、バックアップ/復元を段階実装する
- **自己進化AI連動**
  - 結果検証から改善候補を抽出する
  - AI指数、神穴、危険人気馬、競馬場OSへの更新案をログ化する
- **iPad導線改善**
  - iPadでCSV取込、指数確認、買い目生成、結果入力、バックアップを迷わず実行できる導線にする
  - ホーム画面運用、1カラム表示、タッチ操作を前提に改善する

### C：将来

安定運用後に、外部データ取得や完全自動化を検討します。

- **netkeiba自動取得**
  - まずは手動CSV変換で運用し、安定後に自動取得可否を検討する
- **JRA API連携**
  - 公式データや利用可能APIの仕様を確認し、項目定義と保存先を整理する
- **完全自動予想**
  - 出馬表取得、オッズ更新、指数計算、買い目生成、結果検証、自己進化ログ保存までを自動化する

## 4. 週末運用ナビ

週末実戦では、時間帯ごとに見るドキュメントと操作を分けます。

### 開催前日

- 出馬表CSVを準備する
- 競馬場OS、距離別OS、馬場傾向、注目レースを確認する
- 必要に応じて手動CSV変換を行う
- 主な確認先
  - [`DATA_IMPORT_DESIGN.md`](DATA_IMPORT_DESIGN.md)
  - [`IPAD_OPERATION_MANUAL.md`](IPAD_OPERATION_MANUAL.md)
  - [`PHASE2_ROADMAP.md`](PHASE2_ROADMAP.md)

### 当日午前

- 出馬表CSVを取り込む
- オッズ、人気、馬場状態、当日傾向を入力または更新する
- AI指数、神穴指数、危険人気馬指数を確認する
- 主な確認先
  - [`DATA_IMPORT_DESIGN.md`](DATA_IMPORT_DESIGN.md)
  - [`AI_SCORE_ENGINE_DESIGN.md`](AI_SCORE_ENGINE_DESIGN.md)
  - [`IPAD_OPERATION_MANUAL.md`](IPAD_OPERATION_MANUAL.md)

### レース直前

- 直前オッズと人気変動を反映する
- 危険人気馬と神穴候補を再確認する
- 三連単、WIN5、押さえ買い目を生成し、点数を調整する
- 予想前バックアップを残す
- 主な確認先
  - [`AI_SCORE_ENGINE_DESIGN.md`](AI_SCORE_ENGINE_DESIGN.md)
  - [`GITHUB_JSON_STORAGE_DESIGN.md`](GITHUB_JSON_STORAGE_DESIGN.md)
  - [`IPAD_OPERATION_MANUAL.md`](IPAD_OPERATION_MANUAL.md)

### レース後

- 着順、払戻、的中/不的中、購入点数、ROIを入力またはCSV取込する
- 予想根拠とのズレを確認する
- 改善提案、反省点、次回反映メモを自己進化ログへ残す
- 主な確認先
  - [`DATA_IMPORT_DESIGN.md`](DATA_IMPORT_DESIGN.md)
  - [`SELF_EVOLUTION_AI_DESIGN.md`](SELF_EVOLUTION_AI_DESIGN.md)
  - [`IPAD_OPERATION_MANUAL.md`](IPAD_OPERATION_MANUAL.md)

### 開催終了後

- 週末総括を作成する
- 競馬場OS、距離別OS、危険人気馬条件、神穴条件の更新候補を整理する
- 採用/保留/却下を分け、次週の実装・運用タスクへ反映する
- JSONバックアップやGitHub保存の状態を確認する
- 主な確認先
  - [`SELF_EVOLUTION_AI_DESIGN.md`](SELF_EVOLUTION_AI_DESIGN.md)
  - [`GITHUB_JSON_STORAGE_DESIGN.md`](GITHUB_JSON_STORAGE_DESIGN.md)
  - [`PHASE2_ROADMAP.md`](PHASE2_ROADMAP.md)

## 5. v1.0からPhase2への移行手順

v1.0完成版を安全な基盤として維持しながら、以下の順にPhase2へ移行します。

1. **v1.0を使って手動運用**
   - 既存のブラウザ画面、iPad表示、CSV取込、localStorage保存、バックアップ/復元をそのまま使う
   - 手動入力と既存CSV取込で週末運用の流れを崩さない
2. **CSV取込を増やす**
   - 出馬表、オッズ、結果CSVの取込対象を増やす
   - 項目マッピング、取込ログ、エラー検出を強化する
3. **AI指数計算を自動化**
   - 取り込んだ実データからAI指数、神穴指数、危険人気馬指数を自動計算する
   - 手動補正を残しつつ、根拠付きの自動指数へ移行する
4. **結果検証を蓄積**
   - 着順、払戻、ROI、予想根拠との差分を保存する
   - 的中パターン、不的中パターン、危険人気馬の凡走/好走、神穴の激走/不発を蓄積する
5. **自己進化ログを反映**
   - 結果検証から改善候補を抽出する
   - AI指数の重み、競馬場OS、距離別OS、危険人気馬条件、神穴条件へ更新案として反映する

## 使い分け早見表

| やりたいこと | 最初に見るドキュメント |
| --- | --- |
| Phase2の全体計画を確認したい | [`PHASE2_ROADMAP.md`](PHASE2_ROADMAP.md) |
| CSV取込や結果CSVを整えたい | [`DATA_IMPORT_DESIGN.md`](DATA_IMPORT_DESIGN.md) |
| AI指数や神穴指数の計算を実装したい | [`AI_SCORE_ENGINE_DESIGN.md`](AI_SCORE_ENGINE_DESIGN.md) |
| 保存先をJSON/GitHubへ移したい | [`GITHUB_JSON_STORAGE_DESIGN.md`](GITHUB_JSON_STORAGE_DESIGN.md) |
| 結果検証をAI改善へつなげたい | [`SELF_EVOLUTION_AI_DESIGN.md`](SELF_EVOLUTION_AI_DESIGN.md) |
| 週末にiPadだけで運用したい | [`IPAD_OPERATION_MANUAL.md`](IPAD_OPERATION_MANUAL.md) |
