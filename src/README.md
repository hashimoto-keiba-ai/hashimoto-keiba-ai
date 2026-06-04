# src

## 用途

AI予想ロジック、データ処理、検証用スクリプト、分析プログラムを配置するフォルダです。

橋本競馬AIの中核となる処理を管理するために使用します。

## Phase6-4 ROI最適化AI

`dashboard.js` に `HashimotoRoiOptimizationEngine` を追加し、`raceDatabase`、`fundCurveRecords`、`productionResultValidationReports`、`selfLearningSuggestions`、`courseEvolutionReports` を参照してROI最適化レポートを生成します。

- 保存キー: `roiOptimizationReports`
- 設定キー: `roiOptimizationSettings`
- JSON出力: `exportRoiOptimizationJson()`
- 資金配分連動: `HashimotoCapitalEngine.calculateStake()` が `getCapitalCorrectionForRace()` のROIスコア補正を反映します。
