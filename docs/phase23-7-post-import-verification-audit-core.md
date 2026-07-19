# Phase23-7 正式インポート後検証・監査コア

## 目的・対象・境界

Phase23-6のverified、verification_failed、rollback_candidate、rolled_backを対象に、execution、formalData、snapshot、pendingを読取専用で人間が再検証する。正式データ、provenance、snapshot、pending、Phase23-1〜6、Phase22を変更せず、修復・再import・rollbackを実行しない。Phase23-8がfollow-upを扱う場合も自動処理を許可しない。

## 再検証

formal storeのschema/modelStores/records、ID・naturalKey重複、version、active、日時、source/staging/gate/preparation/execution情報と7モデル固有項目を確認する。meeting/race/runner/odds/result/payout/acquisitionの参照、active分岐、孤立、組合せ集合を検証する。

executionのexpected/actual/operation resultsと正式recordを照合し、snapshot ID/group/count/schema/checksum/作成時刻、rollback snapshot、formal checksum、operation checksum、audit source checksumを再計算する。正規化checksumはproperty順序に依存せず、Date文字列を補正せず、undefinedを明示し、危険キーを除外する。

execution承認・snapshot・開始・完了・verification・importedAt・createdAt/updatedAtの時系列とtimezoneを確認する。provenanceは配列・追記順・event重複・action/operator/timestamp/execution参照・version連続性を監査する。pendingはclear/finalized/invalidated/stale/conflicting/unverifiableに分類し変更しない。

## 結果・状態・人間監査

issueはinfo/warning/error/fatal。結果はverified_clean、verified_with_warnings、verification_error、verification_fatal、rollback_review_required、manual_investigation_required、unverifiable。検証→人間review→clean/warningsまたは異常候補へ進み、clean/warningsだけが人間確認後closed可能。terminalから復帰せず、同一executionの二重完了とclosed後上書きを拒否する。

closedにはchecksum、operation count、参照、件数、provenance、pending、Phase23/Phase22非変更、安全条件と監査者・理由・未来でない日時が必要。warningは全件確認情報を必須とし、error/fatalはclean/warningsとしてclosedできない。

## follow-up・保存・安全

re_verification、manual_investigation、rollback/provenance/reference/count/checksum/chronology/pending reviewを追記記録できるが自動実行しない。plain text監査出力はsource/execution/result/checksum/reference/count/chronology/provenance/snapshot/pending/issues/review/follow-up/safetyを含みraw recordsを含めない。

専用keyは`hashimotoKeibaAi.phase23.postImportVerificationAudit.v1`。issue 5,000、follow-up 1,000、history 5,000、audit text 1 MiB、store 4 MiBを上限とし、超過時に既存値を削除しない。保存後read-backを確認し、失敗時は既存値を維持する。外部通信、timer、自動検証・再試行・修復・rollback、手動rollbackボタン、正式データ変更、物理削除、Phase22反映、購入・投票・IPAT、GitHub Pages、Public公開はない。
