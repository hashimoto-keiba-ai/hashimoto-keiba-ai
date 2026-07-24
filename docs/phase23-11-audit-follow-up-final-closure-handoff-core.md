# Phase23-11 監査フォローアップ最終閉鎖・引継ぎコア

Phase23-8の解決計画、Phase23-9の手動実施記録、Phase23-10の人間による検証判定を読取専用で照合し、対象follow-upの最終閉鎖または次工程への手動引継ぎ記録だけを追記保存する。

## 対象と判断

Phase23-10の判定済み状態だけを対象とし、未検証、検証中、保留中、terminal lock済み記録を拒否する。Phase23-8計画ID、Phase23-9実施記録ID、Phase23-10検証記録ID、audit/follow-up IDを照合する。

- `closure_approved`: Phase23-10が `verification_passed`、必須条件・証跡確認済み、fatal/error未解決0、unknown/criticalリスクなし、人間確認済みの場合のみ。
- `closure_approved_with_conditions`: `verification_passed_with_conditions` に対し、条件、担当者、期限、再確認方法、条件未達時の扱いを必須とする。
- rework、plan revision、manual investigation、rollback reviewへの引継ぎは、対応するPhase23-10判定と引継ぎ先・理由・担当者・期限・必要証跡・完了条件を必須とする。
- `closed` は閉鎖承認、または条件完了確認済みの条件付き閉鎖だけから許可する。

## 安全境界

- Private Local only / protectedMode / PLAN_ONLY。
- formalData、snapshot、pending、Phase23-6/7/8/9/10、Phase22は読取専用。
- 自動開始、自動閉鎖、自動引継ぎ、自動承認、自動修復、自動rollback、自動再インポート、自動適用、外部通知はない。
- rollback引継ぎは手動検討記録だけで、rollbackを実行しない。
- raw file、raw records、raw payload、認証情報、秘密情報を保存しない。証跡はメタデータだけを扱う。
- 物理削除、Public画面、GitHub Pages、IPAT、自動購入・投票への導線はない。

専用キーは `hashimotoKeibaAi.phase23.auditFollowUpFinalClosureHandoff.v1`。records 500、evidence 1,000、history 5,000、テキスト8,000文字、store 4 MiBを上限とする。保存前検証、保存後read-back、失敗時の既存値復元を行う。

`start-local.bat` で起動し、`private-local.html` のPhase23-11カードから開く。

```powershell
node tests/phase23AuditFollowUpFinalClosureHandoffCore.test.js
```
