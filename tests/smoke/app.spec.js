const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const Logic = require(path.join(__dirname, '..', '..', 'js', 'logic.js'));
const RECIPES = require(path.join(__dirname, '..', '..', 'data', 'recipes.json'));
const FRIDGE = require(path.join(__dirname, '..', '..', 'data', 'sample-fridge.json'));

const URL = pathToFileURL(path.join(__dirname, '..', '..', 'index.html')).href;

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // 외부 CDN(글꼴·아이콘)의 일시적 네트워크 실패는 제외하고, 우리 파일 로딩 실패만 잡아요
  page.on('console', m => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
  page.on('requestfailed', r => { if (r.url().startsWith('file:')) errors.push('로딩 실패: ' + r.url()); });
  return errors;
}

async function open(page) {
  await page.goto(URL);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('naengbu:splash:v1', '1'); });
  await page.reload();
}

test('시작 화면: 처음 열 때 보이고 저절로 사라지며, 같은 탭에서 새로고침하면 안 보임', async ({ page }) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL);
  await expect(page.locator('#splash')).toBeVisible();
  await expect(page.locator('#splash .sp-title')).toHaveText('내 냉장고를 부탁해');
  await expect(page.locator('#splash .sp-item')).toHaveCount(6);
  await expect(page.locator('#splash')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('h1')).toHaveText('내 냉장고');
  await page.reload();
  await expect(page.locator('#splash')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('시작 화면: 누르면 바로 건너뜀', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#splash').click();
  await expect(page.locator('#splash')).toHaveCount(0, { timeout: 1500 });
});

async function noHorizontalScroll(page) {
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw).toBeLessThanOrEqual(cw);
}

for (const width of [375, 1280]) {
  test(`${width}px: 열림 · 콘솔 에러 없음 · 가로 스크롤 없음`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    await expect(page.locator('h1')).toBeVisible();
    await noHorizontalScroll(page);
    await page.click('[data-act="fill"]');
    await noHorizontalScroll(page);
    await page.click('[data-act="go"][data-mode="urgent"]');
    await expect(page.locator('article.card').first()).toBeVisible();
    await noHorizontalScroll(page);
    expect(errors).toEqual([]);
  });
}

test('요약 줄: 기한 지난 재료를 따로 보여 주고, 3일 안 개수에서는 뺌', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.evaluate(items => {
    const iso = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
    localStorage.setItem('naengbu:fridge:v1', JSON.stringify(items.map(x => ({ name: x.name, category: x.category, expiryDate: iso(x.daysLeft), fromReceipt: false }))));
  }, FRIDGE.testFridges.expiredCase);
  await page.reload();
  await expect(page.locator('.summary')).toHaveText(['기한 지남유통기한이 지난 재료가 1개 있어요 (두부)', '임박3일 안에 먹어야 할 재료가 1개 있어요']);
});

test('재료 타일: 신선도 바(당근 14일 중 9일 = 64%)와 기한 지난 타일 흐림', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.click('[data-act="fill"]');
  const carrot = page.locator('.tile[data-n="당근"]');
  await expect(carrot.locator('.fresh-label')).toHaveText('D-9');
  await expect(carrot.locator('.fresh-track i')).toHaveAttribute('style', 'width:64%');
  await expect(page.locator('.tile.expired')).toHaveCount(0);

  await page.locator('input[type="date"][data-exp="대파"]').count().then(async n => {
    if (!n) await page.click('[data-act="toggleAdd"]');
  });
  await page.locator('input[type="date"][data-exp="대파"]').fill(await page.evaluate(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 1); return d.toLocaleDateString('sv-SE');
  }));
  const leek = page.locator('.tile[data-n="대파"]');
  await expect(leek).toHaveClass(/expired/);
  await expect(leek.locator('.fresh-label')).toHaveText('기한 지남');
  await expect(leek.locator('.fresh-track i')).toHaveAttribute('style', 'width:0%');
  await expect(leek.locator('img')).toHaveCSS('opacity', '0.6');
});

test('새로 넣은 재료도 유통기한 순으로 (냉장고 칸 · 냉장고 속 재료 목록)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.click('[data-act="fill"]');
  await page.click('[data-act="toggleAdd"]');
  await page.click('[data-act="chip"][data-n="감자"]');   // D-7로 들어감

  const shelf = await page.locator('.shelf').first().locator('.tile .tile-name').allTextContents();
  expect(shelf.indexOf('감자')).toBe(shelf.indexOf('양배추') + 1);   // 양배추 D-6 다음, 당근 D-9 앞
  expect(shelf.indexOf('당근')).toBe(shelf.indexOf('감자') + 1);

  const rows = page.locator('.row');
  const days = await rows.evaluateAll(els => els.map(el => {
    const d = el.querySelector('input[type="date"]').value;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((new Date(d + 'T00:00:00') - today) / 864e5);
  }));
  expect(days).toEqual([...days].sort((a, b) => a - b));
  const names = await rows.locator('.rowtop b').allTextContents();
  expect(names[names.length - 1]).not.toBe('감자');
});

test('재추천 로딩 중에는 뒤로 가기도 막히고, 회차는 2회차', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.click('[data-act="fill"]');
  await page.click('[data-act="go"][data-mode="urgent"]');
  await expect(page.locator('article.card').first()).toBeVisible();
  await page.locator('[data-act="reject"]').first().click();
  await page.click('[data-act="tag"][data-k="no_spicy"]');
  await page.click('[data-act="submitFb"]');
  const back = page.locator('[data-act="reBack"]');
  await expect(back).toBeDisabled();
  await back.click({ force: true });
  await expect(page.locator('h1')).toHaveText('이번엔 이렇게 골라봤어요');
  await expect(page.locator('article.card').first()).toBeVisible();
  await expect(page.getByText('추천 2회차')).toBeVisible();
  await expect(back).toBeEnabled();
});

test('기한 지난 재료는 고를 수 없고, 고른 재료 개수에서도 빠짐', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.evaluate(items => {
    const iso = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
    localStorage.setItem('naengbu:fridge:v1', JSON.stringify(items.map(x => ({ name: x.name, category: x.category, expiryDate: iso(x.daysLeft) }))));
  }, FRIDGE.testFridges.expiredCase);
  await page.reload();
  const tofu = page.locator('.tile[data-n="두부"]');
  await expect(tofu).toHaveAttribute('aria-disabled', 'true');
  await tofu.click({ force: true });
  await expect(tofu).toHaveAttribute('aria-pressed', 'false');
  await expect(tofu.locator('.ck')).toHaveCount(0);
  await page.locator('.tile[data-n="대파"]').click();
  await page.locator('.tile[data-n="김치"]').click();
  const goPicked = page.locator('[data-act="go"][data-mode="picked"]');
  await expect(goPicked).toHaveText('고른 재료로 추천받기 (2)');

  // 고른 재료가 날짜 변경으로 기한이 지나면 선택에서 빠짐
  await page.click('[data-act="toggleAdd"]');
  await page.locator('input[type="date"][data-exp="김치"]').fill(await page.evaluate(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 1); return d.toLocaleDateString('sv-SE');
  }));
  await expect(goPicked).toHaveText('고른 재료로 추천받기 (1)');
  await expect(goPicked).toBeDisabled();
});

test('꿀조합은 예시 데이터임을 표기', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.click('[data-act="fill"]');
  await page.click('[data-act="go"][data-mode="urgent"]');
  const honey = page.locator('.box.honey').first();
  await expect(honey.locator('.box-head')).toHaveText('꿀조합 팁 · 예시');
  await expect(honey.locator('.honey-note')).toHaveText('팀이 직접 써 본 예시 팁이에요');
  await expect(page.getByText('다른 유저 꿀조합')).toHaveCount(0);
});

test('재료 직접 입력: 칩을 눌러 넣고 빼도 누른 칩이 화면에서 움직이지 않음', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.click('[data-act="toggleAdd"]');
  const chips = ['대파', '양파', '마늘', '당근', '감자', '김치', '애호박'];
  await page.locator(`[data-act="chip"][data-n="${chips[0]}"]`).scrollIntoViewIfNeeded();
  const topOf = n => page.locator(`[data-act="chip"][data-n="${n}"]`).evaluate(el => el.getBoundingClientRect().top);
  for (const n of [...chips, ...chips]) {   // 넣고 → 빼기
    const before = await topOf(n);
    await page.locator(`[data-act="chip"][data-n="${n}"]`).click();
    expect(Math.abs((await topOf(n)) - before)).toBeLessThanOrEqual(1);
  }
  await expect(page.locator(`[data-act="chip"][data-n="${chips[chips.length - 1]}"]`)).toBeFocused();   // 마지막으로 누른 칩

  // 목록의 × 로 빼도 목록 제목이 제자리 (아래 내용이 충분할 때 — 페이지 끝에서는 더 내릴 공간이 없어요)
  for (const n of [...chips, '버섯', '사과', '스팸', '참치캔', '계란']) await page.locator(`[data-act="chip"][data-n="${n}"]`).click();
  const title = page.locator('.list-title');
  await title.scrollIntoViewIfNeeded();
  for (let i = 0; i < 3; i++) {
    const before = await title.evaluate(el => el.getBoundingClientRect().top);
    await page.locator('[data-act="remove"]').first().click();
    expect(Math.abs((await title.evaluate(el => el.getBoundingClientRect().top)) - before)).toBeLessThanOrEqual(1);
  }
});

test('해 먹은 뒤 화면: 안내 칸만 크게, 리드·빈 결과 문구는 숨김', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.evaluate(() => {
    const iso = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
    localStorage.setItem('naengbu:fridge:v1', JSON.stringify([
      { name: '대파', category: '야채·과일', expiryDate: iso(1) }, { name: '김치', category: '야채·과일', expiryDate: iso(2) },
    ]));
  });
  await page.reload();
  await page.click('[data-act="go"][data-mode="urgent"]');
  await expect(page.locator('.lead')).toBeVisible();
  await page.locator('[data-act="pick"]').first().click();
  await page.locator('[data-act="cook"]').first().click();
  const notice = page.locator('.notice[role="status"]');
  await expect(notice).toContainText('만들었어요');
  await expect(notice.locator('.notice-ico')).toBeVisible();
  await expect(page.locator('.lead')).toHaveCount(0);
  await expect(page.getByText('아직 추천할 요리가 없어요', { exact: false })).toHaveCount(0);
  // 되돌리면 원래 화면으로
  await page.click('[data-act="undo"]');
  await expect(page.locator('.lead')).toBeVisible();
  await expect(page.locator('article.card').first()).toBeVisible();
});

test('화면 5: 이전 레시피로 돌아가기', async ({ page }) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.click('[data-act="fill"]');
  await page.click('[data-act="go"][data-mode="urgent"]');
  const cards = page.locator('article.card h3');
  await expect(cards.first()).toBeVisible();
  const first = await cards.allTextContents();

  // 2회차 → 이전 레시피로 돌아가면 처음 추천 목록 그대로
  await page.locator('[data-act="reject"]').first().click();
  await page.click('[data-act="tag"][data-k="no_spicy"]');
  await page.click('[data-act="submitFb"]');
  await expect(page.getByText('추천 2회차')).toBeVisible();
  await expect(page.locator('article.card').first()).toBeVisible();
  const round2 = await cards.allTextContents();
  await page.click('[data-act="prevRecipes"]');
  await expect(page.locator('h1')).toHaveText('오늘의 추천 레시피');
  await expect(cards).toHaveText(first);

  // 2회차 → 3회차 → 이전 레시피로 돌아가면 2회차 결과
  await page.locator('[data-act="reject"]').first().click();
  await page.click('[data-act="tag"][data-k="no_spicy"]');
  await page.click('[data-act="submitFb"]');
  await expect(page.getByText('추천 2회차')).toBeVisible();
  await expect(page.locator('article.card').first()).toBeVisible();
  await expect(cards).toHaveText(round2);
  await page.click('#dock [data-act="again"]');
  await page.click('[data-act="tag"][data-k="too_long"]');
  await page.click('[data-act="submitFb"]');
  await expect(page.getByText('추천 3회차')).toBeVisible();
  await page.click('[data-act="prevRecipes"]');
  await expect(page.getByText('추천 2회차')).toBeVisible();
  await expect(cards).toHaveText(round2);
  expect(errors).toEqual([]);
});

test('화면 5: 새 레시피가 없으면 이전에 추천한 레시피를 보여 줌', async ({ page }) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.evaluate(() => {
    const iso = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
    localStorage.setItem('naengbu:fridge:v1', JSON.stringify([
      { name: '대파', category: '야채·과일', expiryDate: iso(1), fromReceipt: false },
      { name: '김치', category: '야채·과일', expiryDate: iso(2), fromReceipt: false },
    ]));
  });
  await page.reload();
  await page.click('[data-act="go"][data-mode="urgent"]');
  const cards = page.locator('article.card h3');
  await expect(cards.first()).toBeVisible();
  const first = await cards.allTextContents();

  await page.locator('[data-act="reject"]').first().click();
  await page.click('[data-act="tag"][data-k="no_spicy"]');
  await page.click('[data-act="submitFb"]');
  await expect(page.getByText('조건에 맞는 새 레시피가 거의 다 나왔어요', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: '이전에 추천한 레시피' })).toBeVisible();
  await expect(cards).toHaveText(first);

  // 이전 레시피 카드에서도 해 먹었어요가 동작
  await page.locator('[data-act="cookRe"]').first().click();
  await expect(page.locator('.notice[role="status"]')).toContainText(first[0]);
  expect(errors).toEqual([]);
});

test('화면 1 → 2/3 → 4 → 5 흐름과 추천 순서', async ({ page }) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);

  // 화면 1: 샘플 채우기
  await page.click('[data-act="fill"]');
  await expect(page.locator('.tile').first()).toBeVisible();

  // 화면 2/3: 점수 합 정렬 결과가 logic.js와 같아야 함
  await page.click('[data-act="go"][data-mode="urgent"]');
  const cards = page.locator('article.card h3');
  await expect(cards.first()).toBeVisible();
  const expected = Logic.recommend({ recipes: RECIPES, fridge: FRIDGE.sampleFridge, mode: 'urgent' }).map(e => e.recipe.name);
  await expect(cards).toHaveText(expected);

  // 화면 4: 칩 없이 제출하면 오류, 칩 고르면 화면 5
  await page.locator('[data-act="reject"]').first().click();
  await expect(page.locator('h1')).toHaveText('어떤 점이 마음에 들지 않나요?');
  await page.click('[data-act="submitFb"]');
  await expect(page.locator('#fbErr')).toHaveText('마음에 들지 않는 점을 하나 이상 골라 주세요.');
  await page.click('[data-act="tag"][data-k="no_spicy"]');
  await page.click('[data-act="submitFb"]');

  // 화면 5: 2회차, 매운 요리 없음, 별로예요 한 레시피는 다시 안 나옴
  await expect(page.getByText('추천 2회차')).toBeVisible();
  await expect(page.locator('article.card').first()).toBeVisible();
  const names = await page.locator('article.card h3').allTextContents();
  expect(names.length).toBeGreaterThan(0);
  for (const n of names) {
    expect(RECIPES.find(r => r.name === n).isSpicy).toBe(false);
    expect(n).not.toBe(expected[0]);
  }
  await expect(page.getByText('추천을 불러오지 못했어요')).toHaveCount(0);

  // 다시 피드백 → 3회차, 제외 목록 누적
  await page.click('#dock [data-act="again"]');
  await page.click('[data-act="tag"][data-k="too_long"]');
  await page.click('[data-act="submitFb"]');
  await expect(page.getByText('추천 3회차')).toBeVisible();
  await expect(page.locator('article.card, .notice').first()).toBeVisible();
  const names3 = await page.locator('article.card h3').allTextContents();
  for (const n of names3) expect([expected[0], ...names]).not.toContain(n);

  expect(errors).toEqual([]);
});

/* ───────── 영수증 OCR (실제 OCR 대신 window.__naengbuOcrStub로 인식 결과를 흉내 내요) ───────── */
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function openReceiptTab(page, stubText) {
  await page.addInitScript(text => {
    window.__naengbuOcrStub = async (image, onProgress) => {
      onProgress(50);
      if (text === '__throw__') throw new Error('stub fail');
      return text;
    };
  }, stubText);
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page);
  await page.click('[data-act="toggleAdd"]');
  await page.click('[data-act="tab"][data-tab="receipt"]');
  await expect(page.locator('[data-act="scan"]')).toBeDisabled();
  await page.setInputFiles('#receiptFile', { name: 'receipt.png', mimeType: 'image/png', buffer: PNG_1PX });
  await expect(page.locator('[data-act="scan"]')).toBeEnabled();
}

test('영수증 OCR: 인식한 재료가 기본 보관 일수로 들어가고 "영수증에서 인식" 태그', async ({ page }) => {
  const errors = watchErrors(page);
  await openReceiptTab(page, '이마트\n풀무원 국산콩두부 300g 1 3,980\n깐대파 1봉 2,480\n무항생제 유정란 15구 6,990\n코카콜라 1.5L 3,200');
  await page.click('[data-act="scan"]');
  await expect(page.getByText('영수증에서 재료 3개를 찾았어요', { exact: false })).toBeVisible();
  await expect(page.locator('.row .tag', { hasText: '영수증에서 인식' })).toHaveCount(3);
  for (const n of ['대파', '두부', '계란']) await expect(page.locator(`.tile[data-n="${n}"]`)).toHaveCount(1);
  await expect(page.locator('.tile[data-n="대파"] .fresh-label')).toHaveText('D-7');   // 대파 기본 보관 7일
  await expect(page.locator('.tile[data-n="계란"] .fresh-label')).toHaveText('D-21');
  expect(errors).toEqual([]);
});

test('영수증 OCR: 재료를 못 찾으면 샘플 재료로 넣기(시연용) 대체 경로', async ({ page }) => {
  await openReceiptTab(page, '코카콜라 1.5L\n봉투 50원\n합계 3,250');
  await page.click('[data-act="scan"]');
  await expect(page.getByText('영수증에서 재료를 찾지 못했어요', { exact: false })).toBeVisible();
  await page.click('[data-act="receiptSample"]');
  await expect(page.getByText('샘플 재료 5개를 냉장고에 넣었어요', { exact: false })).toBeVisible();
  await expect(page.locator('.row .tag', { hasText: '영수증에서 인식' })).toHaveCount(5);
});

test('영수증 OCR: 인식 오류가 나도 앱이 멈추지 않고 대체 경로를 보여 줌', async ({ page }) => {
  await openReceiptTab(page, '__throw__');
  await page.click('[data-act="scan"]');
  await expect(page.getByText('영수증을 읽지 못했어요', { exact: false })).toBeVisible();
  await expect(page.locator('[data-act="receiptSample"]')).toBeVisible();
});

/* ───────── 영수증 인식 뒤 빠진 재료 직접 쓰기 ───────── */
test('영수증 인식 뒤 직접 쓰기: 칸이 보이고, 별칭으로 넣고, 이미 있음·없는 재료·여러 재료 안내', async ({ page }) => {
  const errors = watchErrors(page);
  await openReceiptTab(page, '풀무원 국산콩두부 300g 3,980\n깐대파 1봉 2,480');
  await expect(page.locator('#manualInput')).toHaveCount(0);   // 인식 전에는 없음
  await page.click('[data-act="scan"]');
  await expect(page.getByText('영수증에서 재료 2개를 찾았어요', { exact: false })).toBeVisible();
  const input = page.locator('#manualInput');
  await expect(input).toBeVisible();
  await expect(page.locator('#masterList option[value="계란"]')).toHaveCount(1);

  // "달걀" + Enter → 계란 (영수증 태그 없음), 칸 비우고 포커스 유지, 칸 위치 그대로
  await input.scrollIntoViewIfNeeded();
  const before = await input.evaluate(el => el.getBoundingClientRect().top);
  await input.fill('달걀');
  await input.press('Enter');
  await expect(page.locator('.manual-msg')).toHaveText('계란을(를) 냉장고에 넣었어요');
  await expect(page.locator('.tile[data-n="계란"]')).toHaveCount(1);
  await expect(page.locator('.row', { hasText: '계란' }).locator('.tag')).toHaveCount(0);
  await expect(page.locator('#manualInput')).toHaveValue('');
  await expect(page.locator('#manualInput')).toBeFocused();
  expect(Math.abs((await page.locator('#manualInput').evaluate(el => el.getBoundingClientRect().top)) - before)).toBeLessThanOrEqual(1);

  // 이미 있는 재료 (버튼으로)
  await page.locator('#manualInput').fill('두부');
  await page.click('[data-act="manualAdd"]');
  await expect(page.locator('.manual-msg')).toHaveText('두부은(는) 이미 냉장고에 있어요');
  await expect(page.locator('#manualInput')).toHaveValue('두부');

  // 마스터에 없는 재료
  await page.locator('#manualInput').fill('아보카도');
  await page.click('[data-act="manualAdd"]');
  await expect(page.locator('.manual-msg')).toHaveText('아직 지원하지 않는 재료예요. 목록의 재료 이름으로 넣어 주세요');

  // 여러 재료가 섞임
  await page.locator('#manualInput').fill('양파 당근');
  await page.click('[data-act="manualAdd"]');
  await expect(page.locator('.manual-msg')).toHaveText('재료가 여러 개로 보여요(양파, 당근). 하나씩 넣어 주세요');
  await expect(page.locator('.tile[data-n="양파"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('영수증 인식 실패해도 직접 쓰기 칸으로 넣을 수 있음', async ({ page }) => {
  await openReceiptTab(page, '__throw__');
  await page.click('[data-act="scan"]');
  await expect(page.locator('[data-act="receiptSample"]')).toBeVisible();
  await page.locator('#manualInput').fill('쪽파');
  await page.locator('#manualInput').press('Enter');
  await expect(page.locator('.tile[data-n="대파"]')).toHaveCount(1);
});
