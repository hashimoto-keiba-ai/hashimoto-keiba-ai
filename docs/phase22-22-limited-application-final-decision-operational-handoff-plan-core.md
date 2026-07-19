# Phase22-22 限定適用最終判定・運用引継ぎ計画コア

Phase22-21で人間が `finalized` とした再試験結果比較だけを読み取り、限定適用の最終判定と運用引継ぎ計画を人間が手動記録するためのコアです。

## 保存キー

- 読取専用: `hashimotoKeibaAi.phase22.retrialResultComparisonFinalEvaluation.v1`
- Phase22-22: `hashimotoKeibaAi.phase22.limitedApplicationFinalDecisionOperationalHandoffPlan.v1`

Phase22-21以前の保存データは更新・削除・移行しません。

## 判定候補

- `limited_application_approved`
- `limited_application_rejected`
- `additional_retrial_required`
- `on_hold`
- `operation_stop`

推奨判定と人間の最終判定は分離します。推奨判定は advisory only です。

## 状態

`draft -> awaiting_decision -> decision_recorded -> awaiting_handoff -> handoff_planned -> finalized`

`on_hold` からは `awaiting_decision` へ戻せます。`finalized`、`blocked`、`cancelled`、`expired` は終端状態です。

## 引継ぎ必須項目

- 主担当者
- 開始日時
- 対象範囲
- 監視項目
- 停止条件
- ロールバック手順

補助項目として副担当者、確認日時、連絡計画、備考を保持できます。

## 安全方針

- Private Local only
- PLAN_ONLY
- protectedMode
- 人間の最終判定のみ
- 自動購入なし
- 自動適用なし
- 自動学習更新なし
- 自動開始なし
- 自動本番リリースなし
- source/prediction/betting/rule/learning mutation なし
- GitHub Pagesなし
- Public URLなし
- 外部APIなし

## テスト

```powershell
node tests/phase22LimitedApplicationFinalDecisionOperationalHandoffPlanCore.test.js
node --check phase22-22-limited-application-final-decision-operational-handoff-plan-core.js
```
