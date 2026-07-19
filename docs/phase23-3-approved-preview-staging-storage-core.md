# Phase23-3 承認済みプレビュー・ステージング保存コア

## 目的・Phase23-2との関係

Phase23-2の`preview_ready`かつ人間確認済みpreviewを、ブラウザメモリ上の読み取り専用イベントで参照し、別の人間承認後だけPhase23専用ステージングへ追加保存する。Phase23-2のlocalStorageキー・検証結果は変更しない。Phase22への反映・自動確定は行わない。

## 承認条件と例外承認

sourceValidationId、確定dataType、file hashまたは未生成理由、1件以上のsummary・normalizedRecords、件数一致、`preview_ready`、fatal=0、Phase23-2とPhase23-3双方の人間確認、承認者・理由・未来でない承認日時、protectedMode、PLAN_ONLY、privateLocalOnly、Phase22非反映確認が必須。warningは理由付き通常承認が可能。errorは原則拒否し、例外checkと例外理由を明示した場合だけ候補化する。自動例外承認はない。

## ステージング構造・保存範囲

stagingId、source phase/validation/file metadata、hash/format/encoding、dataType/providerId、件数summary、sanitized normalizedRecords、validationSummary、unknownFields、mappingSummary、approval/exception情報、staged情報、status、version、安全flag、duplicate判定、取消・失効・failure・rollback、追記historyを持つ。`phase22Applied=false`、`phase22AppliedAt=null`を常に正規化し、trueへ変更する関数はない。

rawファイル本文、raw records、raw payloadは保存しない。apiKey、password、cookie、credential(s)、secret、token、access/refresh token、authorization、clientSecret、利用キー、契約番号、account、loginIdとprototype汚染キーを大文字小文字を無視して再帰除去する。

## 容量・原子的保存

1 preview最大5,000 records、Phase23-3 storeのJSON UTF-8見積上限2 MiB。保存前にserialize可能性と容量を検査し、保存後は文字列一致とschemaVersionをread-back検証する。失敗時は以前の値を復元し、既存レコードを削除・evictせず、部分保存を作らない。

## 重複・非破壊version管理

- `exact_duplicate`: file hash、dataType、records summary、またはstagingIdが一致。二重保存拒否。
- `possible_duplicate`: 同じfile nameまたは主要ID候補。人間確認対象。
- `conflicting_duplicate`: raceId、horseNumber、combination、capturedAt等の主要IDが同じで内容summaryが異なる。保存拒否。
- `not_duplicate`: 一致なし。

summary hashは正規化レコードをkey順に安定化したローカル要約で、暗号学的署名ではない。更新は新stagingIdまたはversionで追加し、元レコードを維持する。物理削除機能はない。

## 状態・取消・失効・ロールバック

`awaiting_manual_approval → approval_in_progress → approved → staging_ready → staged`。`staging_ready → staging_failed → staging_ready`、手動cancel/expire、`staged → rollback_planned → rolled_back`を定義する。未承認からstaged、terminal復活、staged内容直接上書き、二重stagingを拒否する。

取消・失効・failure・rollbackにはreason、operator、operatedAt、previous/next、notesを必須としhistoryへ追記する。rollbackはPhase23ステージング状態の無効化記録で、normalizedRecordsを保持し、Phase22に影響しない。

## localStorage・監査

専用キーは`hashimotoKeibaAi.phase23.approvedPreviewStagingStorage.v1`。Phase23-2キー`hashimotoKeibaAi.phase23.manualCsvJsonImportPreviewValidation.v1`は定数として参照関係だけを示し、読取りイベント以外で変更しない。Phase23-1・Phase22キーにも書き込まない。

履歴はhistoryId重複を拒否し、stagingId、action、状態、operator/time、approval/exception、source hash、type、件数、duplicate、安全flag、phase22Applied=falseを追記する。監査textは承認・重複・version・取消・失効・rollback・Phase22未反映を表示し、自動送信・downloadしない。

## 既知制約・Phase23-4

localStorageのブラウザ容量・端末依存、要約hashの非暗号性、同一タブのPhase23-2メモリpreviewが必要という制約がある。Phase23-4では複数モデル間staging整合性、参照関係、正式import候補の最終ゲートを設計するが、Phase22反映は別の明示承認Phaseまで禁止する。外部通信、scraping、IPAT、自動取得・承認・購入・投票・学習、物理削除、GitHub Pages、Public公開はない。`Private Local only` / `PLAN_ONLY` / `protectedMode`。
