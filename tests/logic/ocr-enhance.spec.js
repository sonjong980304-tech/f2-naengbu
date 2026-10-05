const { test, expect } = require('@playwright/test');
const path = require('path');
const OCR = require(path.join(__dirname, '..', '..', 'js', 'ocr.js'));

const px = (...grays) => Uint8ClampedArray.from(grays.flatMap(g => [g, g, g, 255]));
const grayOf = d => [...d].filter((_, i) => i % 4 === 0);

test.describe('enhancePixels (영수증 사진 보정: 흑백 + 대비 늘리기)', () => {
  test('바랜 영수증(글자 160, 바탕 240)을 진한 글자(0)·흰 바탕(255)으로 펼침', () => {
    const d = px(240, 240, 240, 160, 240, 160, 240, 240, 240, 240);
    OCR.enhancePixels(d);
    const g = grayOf(d);
    expect(Math.min(...g)).toBe(0);
    expect(Math.max(...g)).toBe(255);
    expect(g[3]).toBe(0);      // 글자
    expect(g[0]).toBe(255);    // 바탕
  });
  test('컬러는 밝기로 흑백 변환, 알파는 그대로', () => {
    const d = Uint8ClampedArray.from([255, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
    OCR.enhancePixels(d);
    expect(d[0]).toBe(d[1]); expect(d[1]).toBe(d[2]);
    expect(d[3]).toBe(255);
  });
  test('전부 같은 색이면 깨지지 않고 그대로 둠', () => {
    const d = px(200, 200, 200);
    OCR.enhancePixels(d);
    expect(grayOf(d)).toEqual([200, 200, 200]);
  });
});

test.describe('targetSize (OCR에 맞는 크기)', () => {
  test('작은 사진은 키우고(최대 2.5배), 큰 사진은 줄여요', () => {
    expect(OCR.targetSize(520, 800)).toEqual({ w: 1300, h: 2000 });
    expect(OCR.targetSize(1600, 2400)).toEqual({ w: 1600, h: 2400 });
    expect(OCR.targetSize(4000, 6000)).toEqual({ w: 2000, h: 3000 });
  });
});

test.describe('flattenLighting (그림자·조명 평탄화)', () => {
  test('왼쪽은 어둡고 오른쪽은 밝은 바탕에서, 글자만 진하게 남고 바탕은 고르게 밝아짐', () => {
    const w = 60, h = 20, gray = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) gray[y * w + x] = 90 + x * 2;   // 그림자 그라데이션 90~208
    for (const x of [10, 30, 50]) for (let y = 8; y < 12; y++) gray[y * w + x] = Math.round((90 + x * 2) * 0.4);   // 글자 점
    const out = OCR.flattenLighting(gray, w, h, 6);
    const bgLeft = out[2 * w + 3], bgRight = out[2 * w + 56];
    expect(Math.abs(bgLeft - bgRight)).toBeLessThanOrEqual(20);   // 바탕 밝기 차이가 거의 없어짐 (원래 106)
    expect(out[10 * w + 10]).toBeLessThan(140);                    // 그림자 쪽 글자도 진함
    expect(out[10 * w + 50]).toBeLessThan(140);
    expect(bgLeft).toBeGreaterThan(200);
  });
});
