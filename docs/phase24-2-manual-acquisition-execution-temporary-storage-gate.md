# Phase24-2 手動取得実行準備・一時保存ゲート

## 目的

Phase24-1で `approved_for_future_acquisition` になった要求について、人間が実取得を始める前の最終準備と、将来Phase24-3が受け入れるメタデータ条件を記録する。Phase24-1のsource、target、request、approval、handoffPlanは読取専用で、五つのIDが同じ参照チェーンに属する場合だけ準備記録を作成できる。

## フローと状態

`awaiting_execution_preparation` → `execution_preparation_in_progress` → `awaiting_manual_preparation_review` → `preparation_approved` → `awaiting_manual_acquisition`。人間は保留・再開・差戻し・却下・取消・期限切れを理由付きで追記できる。差戻しは修正対象、理由、担当者、期限、却下は理由、確認者、確認日時が必須。却下・取消・期限切れ・手動取得待ち後は上書きしない。

同じPhase24-1 requestに対する未終了記録の重複は拒否する。物理削除APIは持たず、状態変更、確認項目、判断は記録内およびストア全体のhistoryへ追記する。

## 準備内容と受入条件

- 取得予定者、確認者、予定日時、方式、範囲、件数、想定容量、encoding、時刻基準
- `private_local_logical_area` の一時保存キー、保存単位、最大件数、最大総容量、1件最大サイズ
- 方式別の手動手順、禁止操作、確認項目
- fileName、mimeType、encoding、size、checksum、取得予定時刻、生成時刻、source IDの候補メタデータ
- 必須／任意項目、型、ID規則、重複規則、時刻形式
- odds、race_card、race_result、payout、meeting_information別の必須項目
- 将来検証の件数、checksum、race ID、馬番、馬名、取得時刻、出典
- 保存拒否、隔離、再確認、破棄候補という人間判断用の異常時方針

`preparation_approved` には全必須確認、人間レビュー、安全条件、保存上限、検証条件、利用条件、robots、保存可否、公式性、認証情報不要の明示が必要である。規約未確認、保存不可、再配布前提、Public公開前提、認証情報保存必須は拒否する。

## 安全境界

Private Local only、PLAN_ONLY、protectedMode、metadata onlyである。raw HTML、raw payload、raw file本体、認証情報、Cookie、トークン、パスワード、秘密鍵、個人情報は保存しない。外部クラウドとPublic領域は禁止する。

HTTP通信、API呼出し、スクレイピング、DOM／ブラウザ自動操作、自動ダウンロード、定期実行、外部SDK、IPAT、購入・投票、自動学習更新、自動適用、自動修復、自動rollback、自動再インポート、GitHub Pages、Public公開は実装しない。承認や `awaiting_manual_acquisition` は外部取得を開始しない。

localStorageは配列件数、文字列長、ネスト、総4 MiBで制限し、保存前検証、保存後read-backを行う。失敗時は直前値を復元する。キーは `hashimotoKeibaAi.phase24.manualAcquisitionExecutionTemporaryStorageGate.v1`。

## 起動・テスト・Phase24-3引継ぎ

`start-local.bat` で起動し、`private-local.html` のPhase24-2カードから開く。専用テストは次で実行する。

```text
node tests/phase24ManualAcquisitionExecutionTemporaryStorageGate.test.js
```

Phase24-3は `awaiting_manual_acquisition` の記録、Phase24-1参照ID、executionPlan、historyを読取専用で確認し、人間が別途取得した結果を新しい保存領域へ登録する。Phase24-2自身は取得結果もraw本体も保持しない。
