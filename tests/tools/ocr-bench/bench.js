// 개발용 OCR 측정 도구(테스트 스위트 아님): 가짜 영수증 30장(깨끗·흐림·기울어짐 등 18장 + 사진 같은 그림자·조명 12장)을 실제 Tesseract로 읽어 재료를 몇 개 맞히는지 세요.
// 실행: cd tests && node tools/ocr-bench/bench.js [설정이름...]   (인터넷 필요, 설정 하나에 1~2분)
const { chromium } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const L = (text, price) => ({ text, price });
const SETS = [
  { id: 'A', lines: [L('풀무원 국산콩두부 300g', '3,980'), L('깐대파 1단', '2,480'), L('무항생제 달걀 10구', '5,980'), L('코카콜라 1.5L', '3,200')], expected: ['대파', '계란', '두부'] },
  { id: 'B', lines: [L('CJ 스팸클래식 200g', '4,580'), L('양파 1.5kg 망', '3,990'), L('백오이 3입', '2,990'), L('농심 새우깡 90g', '1,500')], expected: ['양파', '오이', '스팸'] },
  { id: 'C', lines: [L('한돈 앞다리 불고기용 600g', '9,800'), L('맥반석 구운란 10입', '5,480'), L('달걀말이김밥 1줄', '3,500'), L('국산 콩나물 300g', '1,280')], expected: ['콩나물', '계란', '돼지고기'] },
  { id: 'D', lines: [L('샘표 진간장 1.8L', '8,900'), L('청정원 순창고추장 500g', '6,480'), L('빙그레 바나나우유 240ml', '1,700'), L('서울우유 흰우유 1L', '2,980')], expected: ['우유', '고추장', '간장'] },
  { id: 'E', lines: [L('동원참치 라이트스탠다드 150g', '2,980'), L('애호박 1개', '1,990'), L('느타리버섯 200g', '2,480'), L('오리온 포카칩 감자칩', '1,800')], expected: ['애호박', '버섯', '참치캔'] },
  { id: 'F', lines: [L('미국산 우삼겹 300g', '7,900'), L('시금치 1단', '2,980'), L('매일 생크림 500ml', '6,500'), L('버터 소금빵 2입', '4,200')], expected: ['시금치', '쇠고기', '생크림'] },
];
const DISTORTS = ['clean', 'small', 'blur', 'faded', 'rotate', 'lowres', 'noise'];
// 세트마다 상태 3가지를 돌아가며 입혀 18장
const CASES = SETS.flatMap((s, i) => [0, 1, 2].map(k => ({ ...s, id: `${s.id}-${DISTORTS[(i * 3 + k) % DISTORTS.length]}`, distort: DISTORTS[(i * 3 + k) % DISTORTS.length] })));
// 실제 휴대폰 사진처럼: 그림자(shadow), 회색 종이 + 흐림 + 가장자리 어두움(photo) — 세트마다 하나씩 12장
const PHOTO_CASES = SETS.flatMap(s => ['shadow', 'photo'].map(d => ({ ...s, id: `${s.id}-${d}`, distort: d })));
if (!process.env.ONLY_PHOTO) CASES.push(...PHOTO_CASES); else CASES.splice(0, CASES.length, ...PHOTO_CASES);

const CONFIGS = {
  before:      { },                                                   // 지금 앱과 같은 설정
  matchOnly:   { match: { fuzzy: true, globalExclude: true } },        // ② 매칭만 개선
  prepOnly:    { preprocess: true },                                    // ① 사진 보정만
  prepPsm6:    { preprocess: true, params: { tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' } },
  after:       { preprocess: true, params: { tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' }, match: { fuzzy: true, globalExclude: true } },
};

function score(rows) {
  let tp = 0, fn = 0, fp = 0, ms = 0;
  rows.forEach(r => {
    const E = new Set(r.expected), F = new Set(r.found);
    E.forEach(x => (F.has(x) ? tp++ : fn++));
    F.forEach(x => { if (!E.has(x)) fp++; });
    ms += r.ms;
  });
  return { tp, fn, fp, recall: tp / (tp + fn), precision: tp + fp ? tp / (tp + fp) : 1, avgMs: Math.round(ms / rows.length) };
}

(async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : ['before'];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('pageerror', e.message));
  await page.goto(pathToFileURL(path.join(__dirname, 'bench.html')).href);
  await page.waitForFunction(() => window.benchReady && window.Tesseract);
  const summary = [];
  for (const name of names) {
    const rows = await page.evaluate(([cfg, cases]) => window.runBench(cfg, cases), [CONFIGS[name], CASES]);
    const s = score(rows);
    summary.push({ name, ...s });
    console.log(`\n== ${name}: 맞힘 ${s.tp}/${s.tp + s.fn} (재현율 ${(s.recall * 100).toFixed(0)}%), 잘못 잡음 ${s.fp}, 장당 ${s.avgMs}ms`);
    rows.forEach(r => {
      const miss = r.expected.filter(x => !r.found.includes(x)), extra = r.found.filter(x => !r.expected.includes(x));
      if (miss.length || extra.length) console.log(`  ${r.id.padEnd(10)} 놓침[${miss.join(',')}] 잘못[${extra.join(',')}]  | ${r.text.replace(/\s+/g, ' ').slice(0, 110)}`);
    });
  }
  console.log('\n요약'); console.table(summary.map(s => ({ 설정: s.name, 맞힘: `${s.tp}/${s.tp + s.fn}`, 재현율: `${(s.recall * 100).toFixed(0)}%`, 잘못잡음: s.fp, 정밀도: `${(s.precision * 100).toFixed(0)}%`, '장당ms': s.avgMs })));
  await browser.close();
})();
