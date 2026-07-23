# Phase23-9 監査フォローアップ・手動解決実施記録コア

Phase23-8で人間が承認した `plan_approved` または `resolution_in_progress` の解決計画だけを対象に、人間が別途行った作業の開始、保留、再開、完了、失敗、blocked、結果、証跡要約、残存問題を追記式で記録する。

## 境界と安全条件

- Private Local only / protectedMode / PLAN_ONLY。
- formalData、snapshot、pending、Phase23-6/7/8、Phase22は読取専用。
- 自動開始、自動完了、自動承認、自動修復、自動rollback、自動再インポート、自動適用、外部通知を行わない。
- rollbackは「手動検討が必要」、再インポートは「別途人間承認が必要」という記録だけを保存する。
- raw file、raw records、raw payload、認証情報、秘密情報は保存しない。証跡はID、種別、要約、checksum、ローカル参照等のメタデータだけを保存する。
- Public画面、GitHub Pages、IPAT、自動購入・投票への導線はない。

計画のaction ID、順序、依存関係は不変スナップショットとして保持する。計画外action、依存未完了の完了記録、fatal/error未解決の `execution_completed` を拒否する。一部完了は理由と残作業、failed/blockedは理由・影響・次の手動判断が必須である。terminal状態は上書きできず、物理削除APIを持たない。

専用キーは `hashimotoKeibaAi.phase23.auditFollowUpManualResolutionExecution.v1`。records 500、actions 1,000、evidence 1,000、history 5,000、各テキスト8,000文字、store 4 MiBを上限とする。保存前検証、保存後read-backを行い、失敗時は既存値を復元する。

`start-local.bat` で起動し、`private-local.html` のPhase23-9カードから開く。

```powershell
node tests/phase23AuditFollowUpManualResolutionExecutionRecordCore.test.js
```
