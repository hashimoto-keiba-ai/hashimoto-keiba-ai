const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const privateLocal = read('private-local.html');
const dashboardAssetHrefs = new Set(['../icon.svg', '../dashboard.css']);

const assertLocalLinksExist = (href) => {
  const html = read(href);
  const base = path.dirname(path.join(root, href));
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  links
    .filter((link) => !dashboardAssetHrefs.has(link))
    .filter((link) => !link.startsWith('#') && !link.startsWith('http') && !link.startsWith('mailto:'))
    .forEach((link) => {
      const localPath = link.split('?')[0].split('#')[0];
      assert.ok(fs.existsSync(path.resolve(base, localPath)), `${href} link exists: ${link}`);
    });
};

const raceDashboards = [
  ['京都競馬場', '京都競馬AI Dashboard'],
  ['阪神競馬場', '阪神競馬AI Dashboard'],
  ['東京競馬場', '東京競馬AI Dashboard'],
  ['中山競馬場', '中山競馬AI Dashboard'],
  ['中京競馬場', '中京競馬AI Dashboard'],
  ['福島競馬場', '福島競馬AI Dashboard'],
  ['新潟競馬場', '新潟競馬AI Dashboard'],
  ['小倉競馬場', '小倉競馬AI Dashboard'],
  ['函館競馬場', '函館競馬AI Dashboard'],
  ['札幌競馬場', '札幌競馬AI Dashboard']
];

raceDashboards.forEach(([folder, title]) => {
  const href = `${folder}/index.html`;
  assert.ok(privateLocal.includes(`href="${href}"`), `Private home links to ${href}`);

  const html = read(href);
  assert.ok(html.includes(title), `${title} has title`);
  assert.ok(html.includes('Private Local'), `${title} is Private Local`);
  assert.ok(html.includes('GitHub Pages') && html.includes('OFF'), `${title} keeps GitHub Pages OFF`);
  assert.ok(
    html.includes(`../pre-race-prediction.html?course=${folder}`),
    `${title} connects pre-race prediction button`
  );
  assert.ok(
    html.includes(`../result-review.html?course=${folder}`),
    `${title} connects result review button`
  );

  [
    '① 事前予想',
    '② 結果検証',
    '③ OSアップデート',
    '④ 保存ログ',
    '⑤ 2026年データ',
    '⑥ ホームへ戻る'
  ].forEach((label) => {
    assert.ok(html.includes(label), `${title} has ${label}`);
  });

  assertLocalLinksExist(href);
});

[
  ['WIN5/index.html', 'WIN5 AI Dashboard', ['① WIN5事前予想', '② WIN5結果検証', '③ WIN5保存ログ', '④ WIN5学習ログ', '⑤ ホームへ戻る']],
  ['結果検証/index.html', '結果検証 Dashboard', ['① 全競馬場結果検証', '② 京都結果検証', '③ 阪神結果検証', '④ 東京結果検証', '⑤ WIN5結果検証', '⑥ ホームへ戻る']],
  ['学習ログ/index.html', '学習ログ Dashboard', ['① 事前予想', '② 結果検証', '③ OSアップデート', '④ 保存ログ', '⑤ 2026年データ', '⑥ ホームへ戻る']]
].forEach(([href, title, labels]) => {
  assert.ok(privateLocal.includes(`href="${href}"`), `Private home links to ${href}`);
  const html = read(href);
  assert.ok(html.includes(title), `${title} has title`);
  assert.ok(html.includes('Private Local'), `${title} is Private Local`);
  assert.ok(html.includes('GitHub Pages') && html.includes('OFF'), `${title} keeps GitHub Pages OFF`);
  labels.forEach((label) => {
    assert.ok(html.includes(label), `${title} has ${label}`);
  });
  if (href === 'WIN5/index.html') {
    assert.ok(
      html.includes('../result-review.html?course=WIN5&mode=win5'),
      'WIN5 Dashboard connects WIN5 result review button'
    );
  }

  assertLocalLinksExist(href);
});

console.log('localDashboards.test.js passed');
