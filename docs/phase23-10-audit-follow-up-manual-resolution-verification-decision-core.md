# Phase23-10 監査フォローアップ・手動解決検証判定コア

Phase23-8の承認済み計画とPhase23-9の手動解決実施記録を読取専用で照合し、人間が証跡、action結果、未解決事項、残存リスク、安全条件を確認した検証判定だけを追記保存する。

## 対象と判定

対象はPhase23-9の `awaiting_manual_verification`、`execution_completed`、`execution_partially_completed`、`execution_failed`、`execution_blocked`。未開始、実施中、保留中、terminal lock済み記録は拒否する。Phase23-8計画ID、Phase23-9実施記録ID、audit/follow-up ID、action ID・順序・依存関係を照合する。

判定は合格、条件付き合格、再対応、計画差戻し、手動調査、rollback検討、失敗、却下。合格には必須action完了、必須確認、fatal/error未解決0、安全確認が必要。critical/unknownリスクは追加の人間確認が必要。条件付き合格は条件・期限・担当者・再確認方法、再対応は対象action・理由・内容・担当者・期限、その他の判定も各必須理由と次の手動対応を要求する。`closed` は合格または条件完了確認済みの条件付き合格だけに許可する。

## 安全境界

- Private Local only / protectedMode / PLAN_ONLY。
- formalData、snapshot、pending、Phase23-6/7/8/9、Phase22は読取専用。
- 自動開始、自動判定、自動承認、自動修復、自動rollback、自動再インポート、自動適用、外部通知はない。
- rollback判定は手動検討記録だけで、rollbackを実行しない。
- raw file、raw records、raw payload、認証情報、秘密情報を保存しない。証跡はメタデータだけを扱う。
- 物理削除、Public画面、GitHub Pages、IPAT、自動購入・投票への導線はない。

専用キーは `hashimotoKeibaAi.phase23.auditFollowUpManualResolutionVerificationDecision.v1`。records 500、checks/evidence各1,000、history 5,000、テキスト8,000文字、store 4 MiBを上限とする。保存前検証、保存後read-back、失敗時の既存値復元を行う。

`start-local.bat` で起動し、`private-local.html` のPhase23-10カードから開く。

```powershell
node tests/phase23AuditFollowUpManualResolutionVerificationDecisionCore.test.js
```
