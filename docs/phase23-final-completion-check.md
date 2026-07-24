# Phase23 最終完了チェック

Phase23-12の合格済み統合確認結果を読取専用で参照し、Phase23-2〜23-12の実装、専用テスト、docs、README、Private Local導線、参照チェーン、安全境界、回帰結果、残存課題、Phase24引継ぎを人間が最終確認して追記保存する。

完了候補は `integration_passed` または警告受容済み `integration_passed_with_warnings` のみ。rework、blocked、failedは拒否する。16項目のチェックリストにはPhase23-2のterminal/read-back、Phase23-4/5の失敗時一時値清掃、Phase22＋Phase23回帰、Phase24引継ぎを含む。

`completion_passed` は全必須項目合格、fatal/error未解決0、安全境界確認済みが必要。警告付き合格、再作業、blocked、failedはそれぞれ指定された詳細を必須とする。`completed` は合格または警告受容済みの警告付き合格だけから許可する。

Private Local only / protectedMode / PLAN_ONLY。Phase23-2〜23-12、formalData、snapshot、pending、Phase22は読取専用。自動取得・購入・投票・IPAT・承認・完了・修復・rollback・再インポート・適用・外部通知、Public/Pages導線はない。

保存キーは `hashimotoKeibaAi.phase23.finalCompletionCheck.v1`。records 100、checks 200、evidence/test results 1,000、history 5,000、テキスト8,000文字、store 4 MiB。保存前検証、read-back、失敗時既存値復元を行う。

`start-local.bat` で起動し、`private-local.html` のPhase23最終完了チェックカードから開く。

```powershell
node tests/phase23FinalCompletionCheck.test.js
```

Phase24では本記録を読取専用で参照し、新しい自動処理を暗黙に開始しない。次Phaseの範囲と承認は別途人間が決定する。
