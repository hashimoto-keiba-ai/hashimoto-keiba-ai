# Private Operation Guide

橋本競馬AIは、自分専用のPrivateリポジトリとして運用します。GitHub Pagesは使わず、Public化もしません。

## 基本方針

- リポジトリはPrivateのままにする。
- GitHub Pagesは有効化しない。
- 共有リンクや公開URLを作らない。
- 会社PC、自宅PC、iPadでは、自分のGitHubログインまたは自分の同期フォルダ経由で閲覧する。
- 既存の競馬場データ、予想ログ、結果検証ログは公開前提にしない。

## Windowsでの起動

1. Privateリポジトリを会社PCまたは自宅PCへ取得します。
2. リポジトリ直下の `start-local.bat` をダブルクリックします。
3. `private-local.html` と `index.html` がブラウザで開きます。
4. `private-local.html` から、メインダッシュボード、AI各ページ、競馬場フォルダへ移動します。

`index.html` はローカルファイルとして直接開いても表示できます。ブラウザがJSON読込を制限した場合でも、画面内の初期データでダッシュボードは表示されます。

## iPadでの閲覧

1. iPadにGitHubアプリを入れます。
2. 自分のGitHubアカウントでログインします。
3. Privateリポジトリ `hashimoto-keiba-ai` を開きます。
4. `private-local.html`、`docs/private-operation-guide.md`、各競馬場フォルダを入口にして閲覧します。
5. HTML画面をSafariで確認する場合は、GitHub Pagesではなく、自分のPCまたは同期フォルダ上のローカルファイルとして開きます。

GitHubアプリでは、次のフォルダをよく使う入口として扱います。

- `東京競馬場/`
- `中山競馬場/`
- `阪神競馬場/`
- `京都競馬場/`
- `中京競馬場/`
- `福島競馬場/`
- `新潟競馬場/`
- `小倉競馬場/`
- `函館競馬場/`
- `札幌競馬場/`
- `WIN5/`
- `競馬場OS/`
- `AI研究所/`
- `結果検証/`

## Private起動ページ

`private-local.html` は、自分専用アプリの入口です。

- `index.html`: メインダッシュボード
- `live-operations.html`: 統合ライブ運用
- `command-center.html`: Hashimoto AI Command Center
- `real-racing-data-loader.html`: 開催日、競馬場、レース番号、出走馬、騎手、調教師、枠順、馬番、斤量の取込
- `race-result-auto-import.html`: 着順、上がり、4角位置、払戻、ラップの取込
- `result-learning-pipeline.html`: 結果からPhase8結果検証、OS更新、AI指数補正、自己学習へ接続

## 公開しないための確認

- GitHubのRepository visibilityがPrivateであることを確認します。
- GitHub Pagesの設定が無効であることを確認します。
- READMEや運用手順では、公開URLを使う案内を採用しません。
- 外部共有が必要な場合でも、Public化ではなくPrivateリポジトリへの個別アクセス権で管理します。

## 確認手順

1. `start-local.bat` を実行します。
2. `private-local.html` が開くことを確認します。
3. `index.html` が開くことを確認します。
4. Private起動ページから各AIページへ移動できることを確認します。
5. 競馬場フォルダリンクから目的のフォルダへ移動できることを確認します。
