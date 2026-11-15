# 過去レース検証 P0

Node.js のローカル CLI で、手入力した出馬情報から予想を再現・固定し、その後に JRA 公式の確定結果と照合する。出力の `mode` は `historical-backtest`。予想再現日時と固定日時には実行時刻を記録する。

## 初期サンプル

依頼指定の2026年11月8日（日）の5レース。実開催、発走時刻、レース名等は入力時に JRA 公式で照合する。

| 競馬場 | レース番号 | レース名 |
| --- | --- | --- |
| 東京 | 10R | 錦秋ステークス |
| 東京 | 11R | アルゼンチン共和国杯 |
| 京都 | 10R | 清水ステークス |
| 京都 | 11R | みやこステークス |
| 福島 | 11R | みちのくステークス |

この5レースは機能確認用。精度評価には別途、事前に選定した十分な件数と発走前の資料が必要。

## 1. 入力と固定

1レースにつき1つの入力 JSON を用意する。次は構造例。馬は登録頭数分の行を用意し、取消・除外も含める。

```json
{
  "scheduledStartAt": "2026-06-01T15:00:00+09:00",
  "fieldSize": 3,
  "sources": {
    "jra": {
      "provider": "JRA",
      "reference": "手元の公式出馬表の参照先",
      "checkedAt": "2026-06-02T10:00:00+09:00"
    }
  },
  "race": {
    "date": {"value": "2026-06-01", "sourceId": "jra"},
    "course": {"value": "東京競馬場", "sourceId": "jra"},
    "raceNumber": {"value": "10R", "sourceId": "jra"},
    "raceName": {"value": "合成レース", "sourceId": "jra"},
    "surface": {"value": "芝", "sourceId": "jra"},
    "distance": {"value": 1600, "sourceId": "jra"},
    "going": {"value": "良", "sourceId": "jra"}
  },
  "horses": [
    {
      "number": {"value": 1, "sourceId": "jra"},
      "name": {"value": "合成馬", "sourceId": "jra"},
      "gate": {"value": 1, "sourceId": "jra"},
      "jockey": {"value": "騎手名", "sourceId": "jra"},
      "trainer": {"value": "調教師名", "sourceId": "jra"},
      "odds": {
        "value": 3.1,
        "sourceId": "jra",
        "availableAt": "2026-06-01T14:55:00+09:00",
        "evidence": "14:55時点の保存資料の参照先"
      }
    }
  ]
}
```

- 各値を `value` と `sourceId` で入力する。発走前の利用可能時点が裏付けられる項目に `availableAt` と `evidence` を付ける。資料を後日確認した日時は `sources.*.checkedAt` に記録する。日時は秒・タイムゾーン付き ISO 8601。
- 人気は `popularity`、脚質は `runningStyle`、想定4角位置は `cornerPosition`、前走着順は `previousFinish`、前走4角位置は `previousCorner`、上がり順位は `closingRank`、距離・馬場・コース実績は `distanceRecord`・`goingRecord`・`courseRecord`。対象レースの確定着順・確定タイム・実際の4角位置や結果に基づく評価を転記しない。
- 補助情報は `sources.netkeiba` に `provider: "netkeibaマスター"`、`reference`、`checkedAt` を記録し、該当値の `sourceId` を `netkeiba` とする。開催・レース基本情報と馬番・馬名・枠番・騎手・調教師は JRA に照合する。
- 発走以降に利用可能になった項目は入力エラー。時点を確認できない項目を入れると「取得時点未確認」と表示され、その試算は厳密集計から除外される。値そのものがない任意項目は省略し、固定 JSON の `inputWarnings` でエンジンの不足項目を確認する。資料の時点と内容は入力者が確認する。
- 結果を参照して仮説や設定を変える場合は、発走前入力を使い、入力 JSON に `resultInformedReason` を記載して当初の固定 JSON を指定する。再試算は厳密集計から除外される。

```powershell
node historical-backtest.js reproduce race-input.json race-fixed.json
node historical-backtest.js reproduce revised-input.json revised-fixed.json race-fixed.json
```

固定 JSON にモデル版、出典、入力値と時点の証跡、指数、印、想定位置、三連単候補を記録する。SHA-256 は保存後の意図しない編集を検出するためのもので、入力者の申告や資料の真正性は人間が確認する。

## 2. JRA公式結果の照合と集計

固定ファイルができてから JRA の確定結果を別 JSON に転記する。全登録馬を記録し、取消・除外・中止・失格の行には `status` を指定して `finish` を省略する。4角通過順位と三連単の100円あたり払戻金は確認できた場合に入力する。

```json
{
  "race": {"date": "2026-06-01", "course": "東京競馬場", "raceNumber": "10R"},
  "source": {"provider": "JRA", "reference": "公式確定結果の参照先", "checkedAt": "2026-06-02T11:00:00+09:00"},
  "status": "確定",
  "horses": [
    {"number": 1, "name": "合成馬", "finish": 1, "cornerPosition": 2}
  ],
  "trifectaPayout": 6000
}
```

```powershell
node historical-backtest.js evaluate race-fixed.json race-result.json race-evaluation.json
node historical-backtest.js summarize summary.json race-fixed.json race-result.json race2-fixed.json race2-result.json
```

- 指数ごとに降順で並べ、同指数は馬番昇順。◎は既存エンジンの印、穴馬は既存の「神穴」上位3頭。出走取消・除外は◎・穴馬の率の分母から外す。
- 三連単は既存の通常候補を1点100円で仮想購入し、1～3着の馬番が順番まで一致すれば的中。取消・除外馬を含む候補は返還扱い。上位着順が同着等で一意に決まらない場合は三連単を判定保留とする。的中率はレース単位と候補単位を出力する。
- 回収率は仮想払戻総額 ÷ 返還を除いた仮想購入額。払戻金未確認または判定保留の購入対象がある場合、該当する回収率は JSON の `null`。
- 4角位置の差は実際の位置から想定位置を引いた値。集計は両方の位置がある馬の平均絶対誤差を示す。厳密集計は芝・ダート、馬場状態、距離の組合せ別にも出力する。

すべての出力先に新規ファイル名を指定する。入力・結果・出力はローカルに保管する。実データの入力、時点証跡の確認、JRA 公式結果の照合は手作業。P0の実装テストには合成データを使用した。

```powershell
node --test tests/historicalBacktest.test.js tests/predictionTrial.test.js tests/preRacePrediction.test.js tests/predictionEngine.test.js
```
