# Phase23-8 監査フォローアップ・解決計画コア

## 目的と境界

Phase23-7で検出・記録されたfollow-upについて、人間が解決のための調査・確認計画、証跡要約、対応結果、最終検証を追記式に記録する。Phase23-6/7、formalData、snapshot、pending、Phase22は読取専用で、修復、再インポート、rollback、外部通知は実行しない。

Private Local only / protectedMode / PLAN_ONLYであり、自動取得・購入・投票・IPAT接続・計画作成・承認・解決・本番反映を行わない。

## 対象

対象監査状態は `audit_verified_with_warnings`、`audit_error_detected`、`audit_fatal_detected`、`rollback_review_required`、`manual_investigation_required`、`audit_revision_required`。対象followUpTypeは再検証、手動調査、rollback検討、provenance・参照・件数・checksum・時系列・pending確認の9種。cleanおよびterminal監査は対象外。closed監査に未完了follow-upが残る場合は警告表示だけで自動計画を作らない。

## 計画、優先度、証跡

解決区分は再確認、証跡収集、各種手動調査、rollback assessment、理由付きno action、手動判断エスカレーションに限定する。fatalはurgent、errorおよびrollback reviewはhigh以上を基準とし、critical/unknownは人間の追加確認なしに承認できない。アクション順序は一意、依存は存在し循環しないこと。正式データ変更、import/rollback実行、削除、snapshot/pending更新、Phase22起動は拒否する。

25個の標準確認項目は担当者、時刻、注記、証跡参照を持つ。証跡はID、種別、要約、checksum、ローカル参照等のメタデータだけを保存し、raw file、raw records、raw payload、認証情報は保存しない。

## 状態遷移と人間承認

基本遷移は `awaiting_resolution_planning` → `planning_in_progress` → `plan_completed` → `awaiting_manual_plan_review` → `manual_plan_review_in_progress` → `plan_approved` → `resolution_in_progress` → `awaiting_resolution_verification` → `resolution_verification_in_progress` → `resolution_verified` → `closed`。計画修正、計画失敗、対応blocked、検証未了から所定の状態へ戻せる。`closed`、`rejected`、`cancelled`、`expired` はterminal lockされる。

計画承認には対象整合、区分・優先度・リスク、owner/reviewer/targetDate、1件以上の許可アクション、確認表、証跡要件、完了条件、将来でない人間レビュー、全安全確認が必要。解決済み検証には必須アクション・確認表・証跡・完了条件、fatal/error未解決0、warning確認、critical/unknown以外の残存リスク、必要な再検証/rollback検討結果、人間レビューと安全確認が必要。

no actionはinfo/warning、またはfatal/errorを証跡付きfalse positiveとして人間確認した場合だけ許可する。rollback reviewはassessmentとPhase23-6での手動確認が必要という記録のみ。manual escalationもローカル記録だけでメールや外部サービスへ送信しない。

## 保存・容量・非破壊性

専用キーは `hashimotoKeibaAi.phase23.auditFollowUpResolutionPlanning.v1`。actions/checklist/evidence各1000、history 5000、audit text 1 MiB、store 4 MiBを上限とし、超過時は保存前に拒否する。保存はread-backを確認し、失敗時は既存値を維持する。物理削除は行わず、同一followUpの未終了計画重複とterminal後の上書きを拒否する。

## UIとテスト

`private-local.html` のPhase23-8カード、または `index.html#phase23-audit-follow-up-resolution-planning` を使う。Phase23-7再読込はボタン操作だけで、自動計画は開始しない。

```powershell
node tests/phase23AuditFollowUpResolutionPlanningCore.test.js
```

Phase23-9以降はこの計画記録を参照できるが、自動修復・自動rollback・Phase22反映の許可にはならない。
