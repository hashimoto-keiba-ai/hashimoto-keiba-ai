# Phase23-2 手動CSV／JSON取込プレビュー・検証コア

## 目的と安全境界

人間が選択したローカルファイルをブラウザ内で解析し、Phase23標準モデルへ正規化・検証・プレビューする。プレビュー専用であり、Phase22への反映、確定取込、自動修正、外部送信は行わない。`Private Local only` / `PLAN_ONLY` / `protectedMode`。

## 対応形式と制限

| 項目 | 上限 |
| --- | ---: |
| ファイル | 1ファイル、`.csv` / `.json`のみ |
| サイズ | 5 MiB |
| レコード | 10,000 |
| CSV行 | 10,001（ヘッダー含む） |
| 列 | 100 |
| セル | 10,000文字 |
| JSON深度 | 20 |
| 通常プレビュー | 100件 |
| issue表示・保存 | 200件 |

CSVはUTF-8／BOM、CRLF／LF、カンマ、ダブルクォート、引用内改行、`""`エスケープ、空欄、列順不同に対応する。重複・空ヘッダー、未閉鎖引用符、列・行上限はfatal。Shift_JISはブラウザの`TextDecoder`が対応するときだけ選択でき、失敗時はUTF-8変換を案内する。

JSONは単一object、object配列、`records`配列、`meeting`等のモデル別配列、packageの`recordType`／`dataType`を扱う。`__proto__`、`prototype`、`constructor`は再帰的に除去する。壊れたJSON、深度・件数超過はfatal。

## 種別・標準ヘッダー・マッピング

`meeting`, `race`, `runner`, `oddsSnapshot`, `result`, `payout`, `acquisitionRecord`を認識する。明示typeを優先し、フィールド署名から推定理由・confidenceを出す。判定不能はerrorで、人間の選択が必要。

標準ヘッダーはPhase23-1モデルに準拠する。日本語列は、開催日→`raceDate`、競馬場→`venueName`、場コード→`venueCode`、レース番号、レース名、馬番、枠番、馬名、騎手、調教師、斤量、馬体重、増減、単勝オッズ、人気、着順、払戻を対応付ける。推定mappingは画面のselectで変更できる。未知列は捨てず`extraFields`に保持しwarningとする。

## 正規化

前後空白、BOM、改行を正規化し、空文字は`null`、文字列`"null"`は文字列のまま保持する。全角数字・符号・小数点を半角化する。`1600m`、`55.0kg`、`1,230円`、`+12kg`を数値化する。boolean表現、ISO日付・日時を検査し、timezoneなし日時は勝手に補完せずwarningとする。元値は`originalValues`、変換後は`normalized`としてメモリ内previewに表示する。

## 必須・整合性検証

モデル別必須項目は仕様どおりOR条件を含めて定義する。race number 1–12、frame 1–8、horse number 1–99、距離800–5000m、馬体重250–700kg、斤量40–80kg、odds>0、popularity>0を検査する。競馬上の幅があり得る距離・重量はwarning、明確な不正値はerror。

runner、oddsSnapshot、result、payout等のモデル別キーで同一ファイル重複を検出する。取消・除外・競走中止と通常着順の矛盾をerrorにする。同じ着順は同着表記がなければwarningとする。受信日時が要求日時より前、または日時が366日を超えて未来の場合はerror。監査履歴のhash一致は過去に検証した同一ファイルの重複候補として検出できる。将来のPhaseではrace横断の頭数、返還・不成立、結果確定時刻など複数モデル間検証を拡張する。

## エラー分類

`info`, `warning`, `error`, `fatal`。issueはcode、level、行、列、元値、メッセージ、修正案、recordId候補を持つ。fatalがある場合は`preview_ready`を拒否する。warningやerrorを自動修正しない。

## 状態遷移

`idle → file_selected → reading → parsing → normalizing → validating → preview_ready | validation_failed`。処理中は`cancelled`へ移行できる。`cancelled`から自動再開せず、新しい人間のファイル選択だけを許可する。`expired`はterminal。同時二重解析と不正遷移を拒否する。

## ハッシュ・保存・監査

Web Crypto SHA-256をローカルで試行し、非対応時は空hashで安全に継続する。キーは`hashimotoKeibaAi.phase23.manualCsvJsonImportPreviewValidation.v1`。設定、mapping、ファイル名・size・MIME・更新日時・format・hash、summary、最大200件のissue、未知列、人間確認、追記履歴だけを保存する。本文、raw records、preview recordsは保存しない。

認証情報保護として、`apiKey`, password, cookie, credential, secret, token, accessToken, refreshToken, 利用キー、契約番号とprototype汚染keyを再帰的に除去する。履歴は一意historyIdで重複を拒否し、状態、操作者、日時、file metadata/hash、type、件数、安全flagを記録する。

## 既知制約・Phase23-3

Phase23-2は単一モデル中心のpreviewであり、巨大ファイル、完全なShift_JIS互換、全券種固有ルール、複数モデル間参照、過去hash照合の永続index、確定importには対応しない。Phase23-3では承認済みpreviewからの非破壊staging、cross-model validation、重複候補照合、取消・rollback計画を設計する。外部通信、scraping、IPAT、自動取得・購入・投票・学習、Phase22/Phase23-1 mutation、GitHub Pages、Public公開は引き続き禁止する。
