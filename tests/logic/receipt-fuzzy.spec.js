const { test, expect } = require('@playwright/test');
const path = require('path');
const Receipt = require(path.join(__dirname, '..', '..', 'js', 'receipt.js'));
const INFO = require(path.join(__dirname, '..', '..', 'data', 'ingredient-info.json'));
const FRIDGE = require(path.join(__dirname, '..', '..', 'data', 'sample-fridge.json'));

const MASTER = Object.values(FRIDGE.master).flat();
const OPTS = { fuzzy: true, globalExclude: INFO.globalExclude };
const m = (text, opts = OPTS) => Receipt.matchIngredients(text, INFO.items, MASTER, opts);

test.describe('OCR 오타 허용 (같은 자리 한 글자의 모음·받침·된소리 차이, 자모 6개 이상 별칭만)', () => {
  test('달걀을 달갈로 읽어도 계란', () => {
    expect(m('무항생제 달갈 10구 5,980')).toEqual(['계란']);
    expect(m('무항생제 달갈 10구 5,980', {})).toEqual([]);   // 오타 허용을 끄면 예전처럼 못 찾음
  });
  test('제외어도 오타를 허용: 새우깡을 새우강으로 읽어도 새우가 아님', () => {
    expect(m('농심 새우강 90g 1,500')).toEqual([]);
  });
  test('짧은 별칭은 오타를 허용하지 않음 (두유 ≠ 두부)', () => {
    expect(m('매일 두유 1L')).toEqual([]);
  });
  test('OCR이 헷갈리지 않는 차이는 허용하지 않음 (측정에서 나온 오탐)', () => {
    expect(m('시금치 1단 2,980')).toEqual(['시금치']);          // 금치≠김치, 시금≠소금
    expect(m('미국산 우삼겹 300g 7,900')).toEqual(['쇠고기']);   // 국산우≠국산무 (첫소리가 다름)
  });
  test('모음 차이 허용 (훈제란 → 훈재란)', () => {
    expect(m('훈재란 10구')).toEqual(['계란']);
  });
  test('기존 정확한 매칭은 그대로', () => {
    expect(m('풀무원 국산콩두부 300g\n깐대파 1단')).toEqual(['대파', '두부']);
  });
});

test.describe('완제품 제외어(globalExclude)', () => {
  test('김밥·빵·칩 같은 완제품 줄은 재료로 보지 않음', () => {
    expect(INFO.globalExclude).toEqual(expect.arrayContaining(['김밥', '빵', '칩']));
    expect(m('달걀말이김밥 1줄 3,500')).toEqual([]);
    expect(m('버터 소금빵 2입 4,200')).toEqual([]);
    expect(m('오리온 포카칩 감자칩')).toEqual([]);
  });
  test('완제품 단어가 없는 줄은 그대로', () => {
    expect(m('앵커 버터 454g')).toEqual(['버터']);
  });
});

test.describe('별칭 보강', () => {
  test('구운란·맥반석란은 계란', () => {
    expect(m('맥반석 구운란 10입')).toEqual(['계란']);
  });
  test('불고기용 돼지고기는 쇠고기가 아님', () => {
    expect(m('한돈 앞다리 불고기용 600g')).toEqual(['돼지고기']);
    expect(m('한우 불고기 300g')).toEqual(['쇠고기']);
  });
});
