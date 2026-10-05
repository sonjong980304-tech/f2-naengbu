const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { DATA_DIR, globalName } = require(path.join(__dirname, '..', 'tools', 'sync-data.js'));

const jsonFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort();

test('data/ 안의 JSON마다 짝이 되는 .js가 있음', () => {
  expect(jsonFiles.length).toBeGreaterThan(0);
  const missing = jsonFiles.map(f => f.replace(/\.json$/, '.js')).filter(f => !fs.existsSync(path.join(DATA_DIR, f)));
  expect(missing, 'cd tests && node tools/sync-data.js 로 만들어 주세요').toEqual([]);
});

for (const f of jsonFiles) {
  const base = f.replace(/\.json$/, '');
  test(`data/${base}.js 내용이 data/${f}와 같음 (앱이 실제로 쓰는 데이터)`, () => {
    const json = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(DATA_DIR, base + '.js'), 'utf8'), sandbox);
    const fromJs = sandbox.window[globalName(base)];
    expect(fromJs, `window.${globalName(base)}가 없어요`).toBeDefined();
    expect(JSON.parse(JSON.stringify(fromJs)), `data/${f}와 data/${base}.js가 달라요. cd tests && node tools/sync-data.js 를 실행해 주세요`).toEqual(json);
  });
}
