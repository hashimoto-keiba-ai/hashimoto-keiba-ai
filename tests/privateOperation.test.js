const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const launcher = read('private-local.html');
const startLocal = read('start-local.bat');
const readme = read('README.md');
const guide = read(path.join('docs', 'private-operation-guide.md'));
const index = read('index.html');

assert.ok(startLocal.includes('private-local.html'), 'start-local.bat opens the Private local launcher');
assert.ok(startLocal.includes('GitHub Pages is not required'), 'start-local.bat avoids public Pages operation');

assert.ok(launcher.includes('🏇 橋本競馬AI'), 'Private launcher has the Hashimoto Keiba AI home title');
assert.ok(launcher.includes('GitHub Pages') && launcher.includes('OFF'), 'Private launcher marks GitHub Pages as OFF');
assert.ok(launcher.includes('index.html'), 'Private launcher links to index.html');
assert.ok(launcher.includes('docs/private-operation-guide.md'), 'Private launcher links to the private operation guide');

[
  '東京競馬場/index.html',
  '中山競馬場/index.html',
  '阪神競馬場/index.html',
  '京都競馬場/index.html',
  '中京競馬場/index.html',
  '福島競馬場/index.html',
  '新潟競馬場/index.html',
  '小倉競馬場/index.html',
  '函館競馬場/index.html',
  '札幌競馬場/index.html',
  'WIN5/index.html',
  '競馬場OS/',
  'AI研究所/',
  '結果検証/index.html'
].forEach((folder) => {
  assert.ok(launcher.includes(`href="${folder}"`), `Private launcher links to ${folder}`);
});

assert.ok(readme.includes('Private運用'), 'README includes Private operation instructions');
assert.ok(readme.includes('start-local.bat'), 'README includes Windows local start instructions');
assert.ok(readme.includes('iPad'), 'README includes iPad viewing instructions');
assert.ok(readme.includes('GitHub Pagesは使用しません'), 'README deprecates GitHub Pages operation');

assert.ok(guide.includes('リポジトリはPrivateのまま'), 'Guide keeps the repository Private');
assert.ok(guide.includes('GitHub Pagesは有効化しない'), 'Guide disables GitHub Pages');
assert.ok(guide.includes('iPad'), 'Guide covers iPad viewing');
assert.ok(guide.includes('会社PC') && guide.includes('自宅PC'), 'Guide covers multiple private devices');

assert.ok(index.includes('private-local.html'), 'Main dashboard links back to the Private launcher');

console.log('privateOperation.test.js passed');
