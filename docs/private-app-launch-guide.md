# Private App Launch Guide

橋本競馬AIを、PC、iPad、iPhoneで自分専用アプリのように起動するための手順です。GitHub Pagesは使わず、リポジトリはPrivateのまま運用します。

## PC起動方法

1. PrivateリポジトリをPCに取得します。
2. リポジトリ直下の `start-local.bat` をダブルクリックします。
3. `private-local.html` が入口ページとして開きます。
4. メニューから、事前予想、AI指数、三連単生成、WIN5、結果検証、自己学習、学習ログ、設定へ移動します。

## Windowsショートカット作成

1. `start-local.bat` を右クリックします。
2. `送る` → `デスクトップ（ショートカットを作成）` を選びます。
3. ショートカット名を `橋本競馬AI` に変更します。
4. アイコンは `icon.svg` を統一アプリアイコンとして使います。

Windowsのショートカットで `.ico` が必要な場合は、`icon.svg` を `.ico` に変換してから、ショートカットの `プロパティ` → `アイコンの変更` で指定します。

## iPad起動方法

1. iPadにGitHubアプリを入れます。
2. 自分のGitHubアカウントでログインします。
3. Privateリポジトリ `hashimoto-keiba-ai` を開きます。
4. `private-local.html` または `docs/private-app-launch-guide.md` を入口にします。
5. SafariでローカルまたはPrivate内の入口ページを開ける場合は、共有ボタンから `ホーム画面に追加` を選びます。

公開URLやGitHub PagesのURLは使いません。

## iPhone起動方法

1. iPhoneにGitHubアプリを入れます。
2. 自分のGitHubアカウントでログインします。
3. Privateリポジトリを開きます。
4. `private-local.html` から必要な画面やフォルダへ移動します。
5. Safariで入口ページを開ける環境では、共有ボタンから `ホーム画面に追加` を選びます。

iPhoneでも、Public化やGitHub Pagesの再有効化は不要です。

## GitHub同期方法

- 会社PCと自宅PCでは、同じPrivateリポジトリを取得して更新します。
- 変更を保存したらGitHubへ反映し、別端末で取得します。
- iPad/iPhoneでは、GitHubアプリでPrivateリポジトリを開いて最新内容を確認します。
- 他人に見せる場合でもPublic化せず、必要な相手だけにPrivateリポジトリ権限を付けます。

## トラブル時の確認方法

- `start-local.bat` がリポジトリ直下にあるか確認します。
- `private-local.html` が開けるか確認します。
- `icon.svg` がリポジトリ直下にあるか確認します。
- `manifest.json` の `start_url` が `./private-local.html` になっているか確認します。
- GitHub Pagesが有効になっていないことを確認します。
- iPad/iPhoneで開けない場合は、GitHubアプリでPrivateリポジトリにログイン済みか確認します。
