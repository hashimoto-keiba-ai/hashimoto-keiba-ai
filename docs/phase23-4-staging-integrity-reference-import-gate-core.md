# Phase23-4 ステージング整合性・参照関係・正式インポート候補ゲートコア

## 目的と境界

Phase23-3の`staged`記録を読取専用で候補群として検証し、人間が正式インポート候補として扱う判断を監査記録する。正式インポート、Phase22反映、外部通信、自動取得・承認・購入・投票、IPAT接続は行わない。Phase23-5以降が正式インポートを設計する場合も、本記録だけで実行を許可しない。

## 対象モデルと整合性

対象はmeeting、race、runner、oddsSnapshot、result、payout、acquisitionRecord。共通ID、version、sourceValidationId、summary件数、空配列、重複履歴IDを検査する。モデル固有必須項目・数値範囲・例外着順を検査し、meeting→race、race→runner/odds/result/payout、result→runner、acquisitionRecord→validation/hash/stagingの参照切れ、分岐、循環を検出する。

race開始、odds取得、結果確定、払戻確定、取得日時の順序とtimezoneを検査する。race頭数とrunner件数、runner/result集合、odds・払戻組合せとrunner集合も照合する。結果は`no_conflict`、`possible_conflict`、`exact_duplicate`、`conflicting_duplicate`、`reference_conflict`、`chronology_conflict`、`count_conflict`、`schema_conflict`で要約する。

## 状態と人間ゲート

主経路は`awaiting_integrity_check → integrity_check_in_progress → integrity_checked → awaiting_manual_gate_approval → gate_approval_in_progress → import_candidate_ready`。検査失敗は`integrity_check_failed`から再検証可能。`import_candidate_ready`、`rejected`、`cancelled`、`expired`はterminalで復帰不可。

fatal/errorは候補化不可。warningのみの場合は明示確認が必要。候補化にはintegrity_checked、承認者、理由、未来でない承認日時、安全フラグ、Phase22非反映確認、正式インポート未実行確認が必要で、自動候補化しない。

## 保存・非保存・安全

専用keyは`hashimotoKeibaAi.phase23.stagingIntegrityReferenceImportGate.v1`、参照元keyは`hashimotoKeibaAi.phase23.approvedPreviewStagingStorage.v1`。gate/source ID、version、hash、要約、issue、承認、append-only履歴を保存する。raw本文・raw records・raw payload・API key・password・cookie・credential・secret・token・利用キー・契約番号・account・loginIdおよびprototype汚染キーは除外する。

既存記録を物理削除せず、同一gateRecordIdと同一stagingIdの二重候補化を拒否する。保存後read-backを検査し、失敗時は既存値を復元する。`formalImportExecuted=false`、`formalImportExecutedAt=null`、`phase22Applied=false`、`Private Local only`、`PLAN_ONLY`、`protectedMode`を強制する。

## テスト

`node tests/phase23StagingIntegrityReferenceImportGateCore.test.js`で対象化、各モデル、参照・時系列・集合・重複、gate条件、terminal lock、安全な保存、UI/script順、IDとローカル参照、安全制約を確認する。
