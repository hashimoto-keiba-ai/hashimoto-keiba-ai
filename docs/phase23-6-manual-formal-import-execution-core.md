# Phase23-6 手動正式インポート実行コア

## 目的・対象・境界

Phase23-5の`ready_for_formal_import_execution`かつ未実行記録だけを読取専用で参照し、Phase23-3の`staged`本文をstagingId/version/sourceValidationId/fileHash/dataType/件数で厳密照合する。人間の明示クリック時だけPrivate Local正式データを変更する。Phase23-1〜5とPhase22は変更せず、イベントや読込による自動実行もない。

## 保存領域・natural key・mode

- 正式データ: `hashimotoKeibaAi.phase23.formalData.v1`
- 実行管理: `hashimotoKeibaAi.phase23.manualFormalImportExecution.v1`
- snapshot: `hashimotoKeibaAi.phase23.preImportSnapshot.v1`
- pending: `hashimotoKeibaAi.phase23.formalData.pending.v1`

natural keyはmeetingId、raceId、runnerIdまたはraceId+horseNumber、oddsのraceId+betType+combination+capturedAt、resultのraceId+horseNumber、payoutのraceId+betType+combination、acquisitionId。insert_only、update_existing、upsert_review_required、skip_duplicate、manual_resolution_requiredを検証し、未解決・曖昧・競合・依存切れ・unsupported・review unavailableは拒否する。

## 依存順序・計画・snapshot

処理順はmeeting、race、runner、oddsSnapshot、result、payout、acquisitionRecord。既存正式データ参照と同一計画内参照を区別し、依存未解決・分岐・循環・順序違反を拒否する。計画はoperation、action、naturalKey、source/target参照、before/after version、期待件数、source/formal fingerprint、checksumを保持する。変更前に影響natural keyだけのsnapshotを保存し、read-back/checksum/容量を確認する。

## 人間承認・原子的保存

実行には準備・staging・依存・計画・snapshot・rollback・verification・impact・checklist確認、実行者・理由・未来でない日時、安全確認と、完全一致する`FORMAL IMPORT EXECUTE`が必要。二重クリック、同一準備の再実行、同一group並列実行、stale plan、terminal再実行を拒否する。

同期処理は入力再検証→lock→snapshot/plan再検証→メモリ複製→全operation適用→整合性/JSON/容量確認→pending保存/read-back/checksum→正式キー切替/read-back→実行記録保存→lock解除。途中失敗時は旧正式値を維持しpendingをinvalidated記録にし、部分反映・自動再試行・自動rollbackを残さない。

## 更新・検証・rollback

insertはversion 1、updateは一意対象・before version・immutable fieldを確認してversionを増加しprovenanceを追記する。skip/unchangedは正式本文を変更しない。物理削除、natural key/ID変更、version減少、provenance上書き、強制競合上書きは禁止。

保存後に件数、natural key、version、参照、source/staging/gate/preparation/execution ID、provenance、checksum、read-backを確認する。rollbackはsnapshot、checksum、execution ID、後続変更なし、人間情報と`FORMAL IMPORT ROLLBACK`完全一致が必要。insertは`active=false`、updateはsnapshot内容を新versionで復元する。rollback前snapshot、自動rollback、物理削除は行わない。

## 状態・容量・安全

計画生成→snapshot→手動承認→execution→verification→verifiedを管理し、失敗時はrollback_candidateへ移行可能。verified/rolled_back/rejected/cancelled/expiredはterminal。1回・1モデル5,000 records、10,000 operations、snapshot 4 MiB、formal store 8 MiB、execution store 4 MiBを上限とする。

認証情報、prototype汚染キー、raw payload、function/symbol/JSON非対応値を保存しない。外部通信、timer、background、自動取得・承認・実行・再試行・rollback、自動購入・投票、IPAT、Phase22イベント、GitHub Pages、Public公開はない。Phase23-7は実行後運用を扱う場合も、この境界と監査記録を維持する。
