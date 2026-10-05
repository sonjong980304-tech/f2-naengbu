const { test, expect } = require('@playwright/test');
const path = require('path');
const Receipt = require(path.join(__dirname, '..', '..', 'js', 'receipt.js'));
const INFO = require(path.join(__dirname, '..', '..', 'data', 'ingredient-info.json'));
const FRIDGE = require(path.join(__dirname, '..', '..', 'data', 'sample-fridge.json'));

const MASTER = Object.values(FRIDGE.master).flat();
const resolve = s => Receipt.resolveTyped(s, INFO.items, MASTER);

test.describe('resolveTyped (영수증 인식 후 직접 쓰기)', () => {
  test('마스터 이름 그대로, 앞뒤 공백은 무시', () => {
    expect(resolve('계란')).toEqual({ status: 'ok', name: '계란', candidates: ['계란'] });
    expect(resolve('  참치캔 ')).toEqual({ status: 'ok', name: '참치캔', candidates: ['참치캔'] });
  });
  test('별칭과 상품명도 해석', () => {
    expect(resolve('달걀').name).toBe('계란');
    expect(resolve('쪽파').name).toBe('대파');
    expect(resolve('풀무원 국산콩두부 300g').name).toBe('두부');
  });
  test('제외어가 들어간 다른 상품은 지원하지 않는 재료', () => {
    expect(resolve('사과식초').name).not.toBe('사과');
    expect(resolve('감자칩')).toEqual({ status: 'none', name: null, candidates: [] });
  });
  test('마스터에 없는 재료는 none', () => {
    expect(resolve('아보카도')).toEqual({ status: 'none', name: null, candidates: [] });
  });
  test('재료가 둘 이상 섞이면 하나로 특정하지 않음', () => {
    const r = resolve('대파 양파');
    expect(r.status).toBe('ambiguous');
    expect(r.name).toBe(null);
    expect(r.candidates).toEqual(['대파', '양파']);
  });
  test('빈 입력은 empty', () => {
    expect(resolve('   ').status).toBe('empty');
    expect(resolve('').status).toBe('empty');
  });
  test('자바스크립트 내장 이름(constructor 등)은 재료로 보지 않음', () => {
    for (const s of ['constructor', 'toString', 'hasOwnProperty', '__proto__']) expect(resolve(s).status).toBe('none');
  });
});
