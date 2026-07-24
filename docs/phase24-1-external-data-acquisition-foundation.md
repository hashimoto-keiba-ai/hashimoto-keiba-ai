# Phase24-1 外部データ取得基盤

## 目的

Phase24-1は、競馬のオッズ、出馬表、レース結果、払戻、開催情報などを将来取得するための計画・承認基盤です。取得元、対象、方式候補、形式、検証規則、provenance、承認、Phase23への引継ぎ計画をPrivate Localへ追記式で記録します。URLは参照文字列として保存するだけで、この段階では外部データを取得しません。

## 将来フロー

取得元登録 → 取得対象選択 → 手動取得要求作成 → 人間確認 → 将来の取得実行 → Private Local一時保存 → プレビュー → 検証 → 人間承認 → Phase23取込候補への手動引継ぎ

Phase24-1が扱うのは人間確認までの計画・承認と将来用の引継ぎ計画だけです。`approved_for_future_acquisition` も取得実行許可の記録であり、実行トリガーではありません。

## 管理モデル

- `externalSource`: ID、名称、種別、公式性、目的、参照URL、規約・robots・再配布・保存の確認状況
- `acquisitionTarget`: odds / race_card / race_result / payout / meeting_information / other、許可・禁止範囲、方式候補、頻度・鮮度・予定時刻
- `dataFormatDefinition`: 必須・任意項目、型、文字コード、時刻基準、ID規則、照合方針
- `validationRule`: 対象、項目、規則、重大度、説明
- `acquisitionRequest`: 取得元・対象・予定時刻・理由・provenance候補
- `approvalRecord`: 確認者、確認日時、対象、取得元、方式、理由、安全確認
- `handoffPlan`: Phase23取込候補へ将来手動で渡すための検証・証跡・完了条件

オッズ形式では取得時刻、種別、組合せ、値、人気、出典を、結果形式では着順、馬番、馬名、タイム、着差、払戻、出典を必須候補として検証します。レースID、開催日、競馬場、レース番号、馬番、馬名の照合方針も必須です。

## 状態と安全条件

状態は `draft`、`awaiting_manual_review`、`manual_review_in_progress`、`approved_for_future_acquisition`、`revision_required`、`rejected`、`cancelled`、`expired` です。terminal状態は上書きできません。同一取得元・対象・予定時刻の未終了要求は重複作成できません。

承認には、人間の確認者・日時・理由と、公式性、規約、robots、再配布、保存、Private Local、外部通信なしの確認が必要です。規約または利用条件が未確認、認証必須、Public公開前提の取得元は承認できません。

保存キーは `hashimotoKeibaAi.phase24.externalDataAcquisitionFoundation.v1` です。配列数、文字列長、ネスト、全体容量を制限し、保存前に正規化・検証し、保存後にread-backします。失敗時は従来値を維持します。既存記録は物理削除せず、変更をhistoryへ追記します。

## 禁止境界

`Private Local only`、`PLAN_ONLY`、`protectedMode`を維持します。HTTP通信、API呼出し、スクレイピング、ブラウザ自動操作、外部ファイル自動ダウンロード、外部SDK、定期・バックグラウンド取得、IPAT接続、自動購入・投票、自動インポート、自動学習更新、自動適用、自動修復、自動rollback、自動再インポート、Phase22への自動反映、GitHub Pages、Public公開、外部通知を行いません。

認証情報、Cookie、トークン、パスワード、秘密鍵、raw HTML、raw payload、raw records、raw file本体は保存しません。Phase23の正式インポート、監査、修復、rollbackも実行しません。

## 起動とテスト

`start-local.bat`を実行し、`private-local.html`のPhase24-1カードから専用セクションを開きます。操作はすべて人間のボタン操作が必要です。

```text
node tests/phase24ExternalDataAcquisitionFoundation.test.js
```

Phase22・Phase23の回帰テストも各 `tests/phase22*.test.js`、`tests/phase23*.test.js` をNodeで実行します。

## 次Phaseへの引継ぎ

次Phaseでは承認済み要求を入力としても自動開始せず、通信手段、取得実行時の追加承認、Private Local一時領域、プレビュー・検証、失敗時隔離、規約順守を別途設計・承認する必要があります。
