# Phase23-12 インポート・監査フロー最終統合確認

Phase23-2の手動プレビューからPhase23-11の最終閉鎖・引継ぎまで、既存コア、保存キー、主要ID、親子参照、状態、重複防止、永続化、安全境界、Private Local導線、文書、テストを読み取り専用で最終確認し、人間の確認結果だけを保存する。

## 対象フロー

Phase23-2 preview → 23-3 staging → 23-4 gate → 23-5 preparation → 23-6 manual formal import → 23-7 audit → 23-8 resolution plan → 23-9 manual execution → 23-10 verification → 23-11 closure/handoff。

20項目の統合チェックリストは `manual_confirmed`、`warning`、`failed`、`not_applicable` を人間が記録する。自動検出はscript/anchor等の参考表示だけで、状態変更や最終判断を自動実行しない。合格には全必須項目の人間確認、fatal/error未解決0、安全境界確認が必要。警告付き合格、再作業、blocked、failedにはそれぞれ必須の理由・影響・担当・次の手動判断を要求する。

## 安全境界

- Private Local only / protectedMode / PLAN_ONLY。
- Phase23-2〜23-11、formalData、snapshot、pending、Phase22は読取専用。
- 自動取得、購入、投票、IPAT接続、自動承認、自動閉鎖、自動修復、自動rollback、自動再インポート、自動適用、外部通知はない。
- raw file、raw records、raw payload、認証情報、秘密情報を保存しない。
- 物理削除、Public画面、GitHub Pages、外部送信導線はない。

専用キーは `hashimotoKeibaAi.phase23.importAuditFlowFinalIntegrationCheck.v1`。records 100、checks 200、evidence 1,000、history 5,000、テキスト8,000文字、store 4 MiBを上限とする。保存前検証、保存後read-back、失敗時の既存値復元を行う。

`start-local.bat` で起動し、`private-local.html` のPhase23-12カードから開く。

```powershell
node tests/phase23ImportAuditFlowFinalIntegrationCheck.test.js
```
