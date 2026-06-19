$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$privateLocal = Get-Content -LiteralPath (Join-Path $root 'private-local.html') -Encoding UTF8 -Raw

function Assert-LocalLinksExist {
  param([string]$Href)

  $filePath = Join-Path $root $Href
  $basePath = Split-Path $filePath -Parent
  $html = Get-Content -LiteralPath $filePath -Encoding UTF8 -Raw
  $links = [regex]::Matches($html, 'href="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }

  foreach ($link in $links) {
    if ($link -in @('../icon.svg', '../dashboard.css')) {
      continue
    }
    if ($link -match '^(#|https?:|mailto:)') {
      continue
    }
    $target = [System.IO.Path]::GetFullPath((Join-Path $basePath $link))
    if (-not (Test-Path -LiteralPath $target)) {
      throw "$Href link target does not exist: $link"
    }
  }
}

$raceDashboards = @(
  @('京都競馬場', '京都競馬AI Dashboard'),
  @('阪神競馬場', '阪神競馬AI Dashboard'),
  @('東京競馬場', '東京競馬AI Dashboard'),
  @('中山競馬場', '中山競馬AI Dashboard'),
  @('中京競馬場', '中京競馬AI Dashboard'),
  @('福島競馬場', '福島競馬AI Dashboard'),
  @('新潟競馬場', '新潟競馬AI Dashboard'),
  @('小倉競馬場', '小倉競馬AI Dashboard'),
  @('函館競馬場', '函館競馬AI Dashboard'),
  @('札幌競馬場', '札幌競馬AI Dashboard')
)

foreach ($dashboard in $raceDashboards) {
  $folder = $dashboard[0]
  $title = $dashboard[1]
  $href = "$folder/index.html"
  if ($privateLocal -notlike "*href=`"$href`"*") {
    throw "Private home does not link to $href"
  }

  $html = Get-Content -LiteralPath (Join-Path $root $href) -Encoding UTF8 -Raw
  foreach ($text in @($title, 'Private Local', 'GitHub Pages', 'OFF', '① 事前予想', '② 結果検証', '③ OSアップデート', '④ 保存ログ', '⑤ 2026年データ', '⑥ ホームへ戻る')) {
    if ($html -notlike "*$text*") {
      throw "$href is missing $text"
    }
  }
  Assert-LocalLinksExist $href
}

$specialDashboards = @(
  @('WIN5/index.html', 'WIN5 AI Dashboard', @('① WIN5事前予想', '② WIN5結果検証', '③ WIN5保存ログ', '④ WIN5学習ログ', '⑤ ホームへ戻る')),
  @('結果検証/index.html', '結果検証 Dashboard', @('① 全競馬場結果検証', '② 京都結果検証', '③ 阪神結果検証', '④ 東京結果検証', '⑤ WIN5結果検証', '⑥ ホームへ戻る')),
  @('学習ログ/index.html', '学習ログ Dashboard', @('① 事前予想', '② 結果検証', '③ OSアップデート', '④ 保存ログ', '⑤ 2026年データ', '⑥ ホームへ戻る'))
)

foreach ($dashboard in $specialDashboards) {
  $href = $dashboard[0]
  $title = $dashboard[1]
  $labels = $dashboard[2]
  if ($privateLocal -notlike "*href=`"$href`"*") {
    throw "Private home does not link to $href"
  }

  $html = Get-Content -LiteralPath (Join-Path $root $href) -Encoding UTF8 -Raw
  foreach ($text in @($title, 'Private Local', 'GitHub Pages', 'OFF') + $labels) {
    if ($html -notlike "*$text*") {
      throw "$href is missing $text"
    }
  }
  Assert-LocalLinksExist $href
}

Write-Output 'localDashboards.test.ps1 passed'


