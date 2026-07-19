# Phase23-5 正式インポート準備・人間確認コア

## 目的・対象・境界

Phase23-4の`import_candidate_ready`かつ`formalImportExecuted=false`の記録だけを読取専用で参照し、Phase23-3 stagingをgateRecordId/stagingId/versionから一意に再参照する。meeting、race、runner、oddsSnapshot、result、payout、acquisitionRecordの正式インポート前準備を記録するが、正式インポート、正式データ変更、Phase22反映、外部通信は行わない。Phase23-6が実行機能を検討する場合も、本記録だけで実行を許可しない。

## 差分・影響・依存関係

正式データの読取専用viewと比較し、`new_record`、`exact_match`、`update_candidate`、`conflicting_match`、`missing_dependency`、`ambiguous_match`、`unsupported_change`、`review_unavailable`に分類する。予定modeはinsert_only、update_existing、upsert_review_required、skip_duplicate、manual_resolution_requiredだが物理処理はない。

件数、参照、上下位モデル、Phase22表示・集計、履歴、ID/version/sourceValidationId/fileHash衝突をnone/low/medium/high/critical/unknownで評価する。critical/unknownは準備完了不可、highは人間確認必須。順序はmeeting→race→runner→oddsSnapshot→result→payout→acquisitionRecord。依存切れ・分岐・循環・順序違反を拒否する。

## 準備グループ・rollback・検証計画

複数準備をversion付きgroupにまとめ、同一gateRecordIdの活動中group重複を拒否する。rollback planは範囲、対象ID、件数、backup/snapshot要否と確認、復元順、検証、担当者、理由、日時、備考を保持するが、自動backup/snapshot/rollbackや物理削除はない。検証計画はinsert/update/skip/conflict件数、参照・件数、hash/sourceValidationId/stagingId、Phase22非破壊、localStorage、history、rollback可否を計画として保存し、このPhaseでは実行しない。

## 状態・人間確認

`awaiting_preparation → preparation_in_progress → preparation_completed → awaiting_manual_review → manual_review_in_progress → ready_for_formal_import_execution`。failedから再準備、reviewからrevision_requiredを経た再準備を許可する。ready/rejected/cancelled/expiredはterminal。

readyにはPhase23-4 ready、preparation_completed、fatal/error/conflict/critical/unknown 0、high確認、依存・差分・件数・rollback・検証計画確認、全operator checklist、承認者・理由・未来でない日時、Private Local/PLAN_ONLY/protectedMode、Phase22非反映、正式インポート未実行、外部通信なし、自動処理なし確認が必要。

## 保存・非保存・非破壊

専用keyは`hashimotoKeibaAi.phase23.formalImportPreparationReview.v1`。参照snapshot、差分summary、件数、impact/dependency、rollback、verification、checklist、issues、review、append-only history、安全フラグを保存する。raw本文・raw records/payload・正式データ本文・認証情報を保存せず、大小文字を問わず再帰除去しprototype汚染キーも除く。

Phase23-1〜4、Phase22、正式データを変更しない。保存後read-backを検証し失敗時は既存値を維持する。重複ID・同一gate二重ready・ready後直接上書きを拒否し、既存記録を物理削除しない。`formalImportExecuted=false`、`formalImportExecutedAt=null`、`phase22Applied=false`を強制する。
