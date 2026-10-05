// 개발용 동기화 스크립트(빌드 도구 아님): data/*.json 원본을 브라우저용 data/*.js(window 전역 변수)로 그대로 옮겨요.
// 실행: cd tests && node tools/sync-data.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const GLOBAL_NAMES = {
  'copy': 'COPY',
  'recipes': 'RECIPES',
  'sample-fridge': 'FRIDGE_DATA',
  'icon-map': 'ICON_MAP',
};

function globalName(base) {
  return GLOBAL_NAMES[base] || base.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
}

function render(base, data) {
  return `/* data/${base}.json에서 자동 생성. 직접 고치지 말고 JSON을 고친 뒤 cd tests && node tools/sync-data.js */\n`
    + `window.${globalName(base)} = ${JSON.stringify(data, null, 2)};\n`;
}

function sync() {
  const written = [];
  fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort().forEach(f => {
    const base = f.slice(0, -5);
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    fs.writeFileSync(path.join(DATA_DIR, base + '.js'), render(base, data));
    written.push(`data/${base}.js → window.${globalName(base)}`);
  });
  return written;
}

if (require.main === module) {
  sync().forEach(line => console.log(line));
}

module.exports = { DATA_DIR, globalName, sync };
