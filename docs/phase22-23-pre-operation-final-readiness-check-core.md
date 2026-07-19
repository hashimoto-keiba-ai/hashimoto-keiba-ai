# Phase22-23 限定適用開始前・最終運用準備確認コア

Phase22-22で `finalized`、`limited_application_approved`、必須引継ぎ計画記録済みとなった記録だけを読み取り、開始前準備を人間が確認するPrivate Local専用コアです。

状態遷移は `awaiting_readiness_check -> checking` を起点とし、確認中から `ready_for_manual_start`、`on_hold`、`blocked`、`cancelled`、`expired` のいずれかを人間が記録します。結果状態はterminalで再開できません。

必須確認項目は、主担当、副担当、運用開始予定、限定対象範囲、監視項目、停止条件、ロールバック手順、連絡体制、必要資料、バックアップ、ローカル環境、protectedMode、PLAN_ONLYです。全項目確認済みの場合だけ手動で `ready_for_manual_start` にできます。自動ready、自動開始、自動適用、自動本番反映はありません。

保存先は `hashimotoKeibaAi.phase22.preOperationFinalReadinessCheck.v1` です。Phase22-22以前のlocalStorageを変更せず、外部API、Public URL、GitHub Pagesを使用しません。
