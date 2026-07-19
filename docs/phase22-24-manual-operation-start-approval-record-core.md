# Phase22-24 限定適用・手動開始承認記録コア

Phase22-23で `ready_for_manual_start` となり、全必須確認項目が確認済みの記録だけを対象に、人間による手動開始承認の事実と条件を記録します。承認記録のみで、実際の限定適用・開始・本番反映は行いません。

状態は `awaiting_manual_start_approval -> approval_reviewing` の後、人間が `manual_start_approved`、`approval_rejected`、`on_hold`、`blocked` のいずれかを記録します。取消と期限切れも含め、結果状態はterminalで再開できません。

承認には、承認者、承認日時、承認理由、手動開始予定日時、開始・監視・停止判断・ロールバック・連絡の各担当者、承認有効期限、承認条件、開始禁止条件が必要です。不足時は項目一覧付きで拒否します。推奨結果と人間の最終承認は分離され、自動承認・自動開始はありません。

Phase22-24専用キーは `hashimotoKeibaAi.phase22.manualOperationStartApprovalRecord.v1` です。Private Local / PLAN_ONLY / protectedModeを維持し、Phase22-23以前のlocalStorage、外部API、Public URL、GitHub Pagesを変更・追加しません。
