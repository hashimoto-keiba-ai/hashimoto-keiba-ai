# Phase22-25 手動運用開始・実施記録コア

Phase22-24で `manual_start_approved` となった記録だけを対象に、人間が外部で行った手動開始、開始失敗、一時停止、再開、停止、取消、期限切れの事実を追記式で記録します。本コアは外部処理を実行せず、自動開始・自動適用・自動停止・自動復旧・自動本番反映を行いません。

状態は `awaiting_manual_execution`、`execution_recording`、`manually_started`、`start_failed`、`paused`、`stopped`、`cancelled`、`expired` です。失敗後の再試行と一時停止後の再開も、人間の実施者・日時・理由・確認内容を記録した場合だけ許可します。`stopped`、`cancelled`、`expired` はterminalです。

保存先は `hashimotoKeibaAi.phase22.manualOperationStartExecutionRecord.v1` です。Phase22-24以前のlocalStorageを変更せず、Private Local / PLAN_ONLY / protectedMode、安全フラグ、追記式監査履歴を維持します。
