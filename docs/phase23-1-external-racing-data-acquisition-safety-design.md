# Phase23-1 外部競馬データ取得方式・安全設計

## 1. 目的とPhase22からの移行

Phase22で人間中心の予想・検証・限定運用記録が完了したため、Phase23では週末運用に必要な出馬表、オッズ、結果を安全に取り込む準備を行う。Phase23-1は方式調査・比較・標準化・安全ゲート設計だけを行い、外部接続や実取込は行わない。

## 2. 取得対象

開催、レース、出走馬、枠番・馬番、馬名、性齢、騎手、調教師、斤量、馬体重・増減、各種オッズ・人気、発走時刻、馬場、天候、着順、時計、着差、通過順位、上がり、払戻、取消・除外・中止、確定状態を対象とする。

## 3. 候補方式と比較

| 方式 | 確認済み | 未確認 | 評価・推奨 |
| --- | --- | --- | --- |
| JRA-VAN Data Lab. / JV-Link | Windows向け、公式データ、JV-LinkはActiveX COM、リアルタイム・過去データ、利用キー・契約、月額2,090円税込、2台同時利用（2026-07-19公式公開情報） | 商用・再配布、会社PC、Node/Python COM、詳細データ種別・更新時刻・キャッシュ条件 | `conditionally_suitable` / 条件付き第一候補 |
| JRA公式ホームページ | 人間が出馬表・オッズ・結果を閲覧する予備経路 | 開発者向け公式API、自動アクセス・二次利用許諾 | 自動取得は`unsuitable`、手動閲覧のみ |
| JRA-VAN NEXT／CSV・ソフト出力 | 手動中間経路候補 | CSV出力可否、項目、費用、頻度、条件 | `needs_verification` |
| 手動CSV／JSON | ローカルプレビュー・人間承認・非破壊取込を設計可能 | 元ファイルの利用許諾 | `suitable` / 推奨フォールバック |
| 第三者サイトHTML | 公開画面は自動取得許可を意味しない | 正式APIまたは明示許可 | `prohibited` / 原則不採用 |

公式参照: JRA-VAN Data Lab.製品情報、システム概要、開発FAQ、SDKページ、開発者コミュニティ。費用・仕様・規約は変更され得るため、prototype承認日に再確認する。

第三者HTMLは仕様変更に弱く、規約・負荷・再配布リスクがある。robots.txt・規約の無視、非公開API解析、認証・CAPTCHA・アクセス制限回避は禁止する。

## 4. 推奨アーキテクチャ

`Provider Adapter → Raw Data → Normalizer → Validator → Preview → Human Approval → Import → Audit History → Phase22 Data Bridge`

- Adapterは`jra_van_data_lab`、`manual_csv`、`manual_json`、将来の`future_official_api`を分離する。
- Raw Dataメタデータはprovider、source reference、取得・受信日時、形式、SHA-256等のpayload hash、mode、契約・規約確認、操作者、備考を持つ。認証情報と実payloadはPhase23-1では保存しない。
- Validatorは日付、競馬場、R、時刻、馬番、馬名、騎手、頭数、race ID、確定状態、重複、欠損、未来日時、異常値、取消・除外、結果確定前後を検査する。
- PreviewとHuman Approvalを必須化し、承認前にPhase22へ反映しない。Bridgeは将来、Phase23確定データから候補提示・手動コピーする。Phase22キーを直接更新しない。

## 5. 標準データモデル

`meeting`、`race`、`runner`、`oddsSnapshot`、`result`、`payout`、`acquisitionRecord`をコアの`MODEL_FIELDS`で定義する。日時はISO 8601でJST（`+09:00`）を明示し、IDはproviderに依存しない安定文字列、欠損は`null`、金額は整数円、距離は整数m、重量はkg、オッズは10進数、時計は元文字列と将来のミリ秒正規化を両立する。空文字と0を混同しない。

手動CSV/JSONではテンプレート、文字コード（UTF-8/Shift_JISの明示）、ファイル選択、プレビュー、マッピング、エラー行、重複、元ファイル名、hash、取込者・日時、追記履歴、取消・ロールバック参照をPhase23-2以降で実装する。

## 6. 状態管理

方式評価: `draft`, `researching`, `needs_manual_verification`, `evaluated`, `recommended`, `rejected`, `approved_for_prototype`, `prohibited`。

将来の取得記録: `not_started`, `acquiring`, `acquired`, `validating`, `validation_failed`, `awaiting_manual_approval`, `approved`, `rejected`, `imported`, `import_failed`, `cancelled`, `expired`。Phase23-1はネットワーク取得状態を発生させない。規約または契約が未確認のproviderは`approved_for_prototype`にできず、`prohibited`は採用できない。

## 7. 認証・規約・費用確認

API key、JRA-VAN利用キー、password、cookie、token、secret、契約番号をlocalStorage、監査文、ソースコードへ保存しない。OS資格情報ストア等の方式は将来の承認済みprototypeで別途設計する。導入前に公式規約、契約主体、会社PC許可、2台運用、商用利用、再配布、サポート対象言語、料金と解約条件を人間が公式窓口・文書で再確認し、確認日と根拠を監査履歴へ記録する。

## 8. 保存・監査

Phase23-1専用キーは`hashimotoKeibaAi.phase23.externalRacingDataAcquisitionSafetyDesign.v1`。候補、評価、確認事項、採用判定、安全設定、追記式監査履歴のみを保存する。壊れたJSONは安全な初期値へ戻し、Phase22以前のkeyを読み書き・削除しない。

## 9. Phase23-2と非対応事項

Phase23-2では、人間が契約・規約・技術条件を確認したproviderだけを対象に、まず手動CSV/JSONのテンプレート、プレビュー、validator、hash、重複検出、承認、非破壊importを検討する。JV-Link prototypeはWindows/COMの技術検証と導入承認後に別ゲートで扱う。

Phase23-1は外部接続、スクレイピング、実ファイル取込、定期取得、自動再試行、バックグラウンド監視、IPAT、自動購入・投票、外部書込み、自動学習、Phase22反映、GitHub Pages、Public公開に対応しない。`Private Local only` / `PLAN_ONLY` / `protectedMode`を維持する。
