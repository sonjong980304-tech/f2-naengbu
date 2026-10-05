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
