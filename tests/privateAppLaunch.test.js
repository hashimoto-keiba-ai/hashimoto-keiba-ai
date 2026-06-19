const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const icon = read('icon.svg');
const manifest = JSON.parse(read('manifest.json'));
const privateLocal = read('private-local.html');
const readme = read('README.md');
const guide = read(path.join('docs', 'private-app-launch-guide.md'));
const startLocal = read('start-local.bat');

assert.ok(icon.includes('橋本競馬AI 統一アプリアイコン'), 'Unified app icon has the expected title');
assert.ok(icon.includes('HKAI'), 'Unified app icon includes HKAI');
assert.ok(icon.includes('橋本競馬AI'), 'Unified app icon includes the app name');
assert.ok(icon.includes('fill="#090704"'), 'Unified app icon uses a black background');
assert.ok(icon.includes('#ffd76f') || icon.includes('#f5d274'), 'Unified app icon uses gold coloring');

assert.equal(manifest.start_url, './private-local.html', 'Manifest starts from private-local.html');
assert.equal(manifest.short_name, 'HKAI', 'Manifest uses the unified HKAI short name');
assert.equal(manifest.icons[0].src, './icon.svg', 'Manifest references the unified icon');

assert.ok(privateLocal.includes('<link rel="icon" href="icon.svg"'), 'Private launcher references the unified favicon');
assert.ok(privateLocal.includes('<link rel="apple-touch-icon" href="icon.svg"'), 'Private launcher references the touch icon');
assert.ok(privateLocal.includes('<img src="icon.svg"'), 'Private launcher displays the app icon');

[
  '事前予想',
  'AI指数',
  '三連単生成',
  'WIN5',
  '結果検証',
  '自己学習',
  '学習ログ',
  '設定'
].forEach((label) => {
  assert.ok(privateLocal.includes(`<strong>${label}</strong>`), `Private launcher has ${label} menu`);
});

[
  ['京都', '京都競馬場/index.html'],
  ['阪神', '阪神競馬場/index.html'],
  ['東京', '東京競馬場/index.html'],
  ['中山', '中山競馬場/index.html'],
  ['中京', '中京競馬場/index.html'],
  ['福島', '福島競馬場/index.html'],
  ['新潟', '新潟競馬場/index.html'],
  ['小倉', '小倉競馬場/index.html'],
  ['函館', '函館競馬場/index.html'],
  ['札幌', '札幌競馬場/index.html'],
  ['WIN5', 'WIN5/index.html'],
  ['結果検証', '結果検証/index.html'],
  ['学習ログ', '学習ログ/index.html']
].forEach(([label, href]) => {
  assert.ok(privateLocal.includes(`href="${href}"`), `Home screen links to ${label}`);
});

assert.ok(privateLocal.includes('<h1>🏇 橋本競馬AI</h1>'), 'Private launcher shows the Hashimoto Keiba AI home title');
assert.ok(privateLocal.includes('ホーム画面メニュー'), 'Private launcher has a home screen menu section');

assert.ok(startLocal.includes('private-local.html'), 'start-local.bat opens the private launcher');
assert.ok(readme.includes('Windowsショートカット'), 'README includes Windows shortcut steps');
assert.ok(readme.includes('icon.svg'), 'README mentions the unified icon');
assert.ok(readme.includes('GitHub Pagesは使用しません'), 'README keeps GitHub Pages disabled');

assert.ok(guide.includes('PC起動方法'), 'Launch guide includes PC startup');
assert.ok(guide.includes('iPad起動方法'), 'Launch guide includes iPad startup');
assert.ok(guide.includes('iPhone起動方法'), 'Launch guide includes iPhone startup');
assert.ok(guide.includes('GitHub同期方法'), 'Launch guide includes GitHub sync');
assert.ok(guide.includes('公開URLやGitHub PagesのURLは使いません'), 'Launch guide avoids public URLs');

console.log('privateAppLaunch.test.js passed');
