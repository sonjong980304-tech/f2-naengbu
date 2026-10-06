const { test, expect } = require('@playwright/test');
const path = require('path');
const Receipt = require(path.join(__dirname, '..', '..', 'js', 'receipt.js'));
const INFO = require(path.join(__dirname, '..', '..', 'data', 'ingredient-info.json'));
const FRIDGE = require(path.join(__dirname, '..', '..', 'data', 'sample-fridge.json'));

const MASTER = Object.values(FRIDGE.master).flat();

test.describe('ingredient-info.json', () => {
  test('마스터 재료가 모두 있고, 표기가 같고, 순서도 마스터와 같음', () => {
    const names = Object.keys(INFO.items);
    expect(names).toEqual(MASTER);
  });
  test('모든 재료에 별칭 1개 이상과 양의 정수 보관 일수가 있음', () => {
    for (const [name, v] of Object.entries(INFO.items)) {
      expect(v.aliases.length, name).toBeGreaterThan(0);
      expect(Number.isInteger(v.defaultShelfDays) && v.defaultShelfDays > 0, name).toBe(true);
      for (const a of v.aliases) expect(a.replace(/\s/g, '').length, `${name}:${a}`).toBeGreaterThanOrEqual(2);
    }
  });
});

test.describe('normalizeLine', () => {
  test('공백·특수문자·숫자 사이 기호를 지우고 한글·영문·숫자만 남김', () => {
    expect(Receipt.normalizeLine(' 풀무원 국산콩 두부(300g) * 1  3,980 ')).toBe('풀무원국산콩두부300g13980');
    expect(Receipt.normalizeLine('두 부')).toBe('두부');
  });
});

test.describe('matchIngredients', () => {
  test('실제 영수증처럼 브랜드·용량·가격이 섞인 텍스트에서 재료를 찾고 마스터 순서로 반환', () => {
    const text = [
      '이마트 성수점',
      '2026-10-05 18:42',
      '상품명            수량    금액',
      '풀무원 국산콩두부 300g   1   3,980',
      '깐대파 1봉              1   2,480',
      '무항생제 유정란 15구     1   6,990',
      'CJ 스팸 클래식 200g      2   9,960',
      '양파(망) 1.5kg          1   4,980',
      '코카콜라 1.5L           1   3,200',
      '합계                         31,590',
    ].join('\n');
    expect(Receipt.matchIngredients(text, INFO.items, MASTER)).toEqual(['대파', '양파', '계란', '두부', '스팸']);
  });

  test('OCR이 글자 사이를 띄어 읽어도 찾음', () => {
    expect(Receipt.matchIngredients('콩 나 물 300g 1,200\n달 걀 10구', INFO.items, MASTER)).toEqual(['콩나물', '계란']);
  });

  test('같은 재료가 여러 줄에 나와도 한 번만', () => {
    expect(Receipt.matchIngredients('두부 300g\n순두부 350g\n두부 2입', INFO.items, MASTER)).toEqual(['두부']);
  });

  test('다진마늘과 통·깐마늘은 서로 다른 재료로 찾음', () => {
    expect(Receipt.matchIngredients('국산 다진마늘 200g', INFO.items, MASTER)).toEqual(['다진마늘']);
    expect(Receipt.matchIngredients('간마늘 1kg', INFO.items, MASTER)).toEqual(['다진마늘']);
    expect(Receipt.matchIngredients('깐마늘 300g', INFO.items, MASTER)).toEqual(['마늘']);
    expect(Receipt.matchIngredients('깐마늘 300g\n다진마늘 200g', INFO.items, MASTER)).toEqual(['마늘', '다진마늘']);
  });

  test('새 재료(면·김·전분·카레가루)를 찾고, 라면 상품명 속 김치·오징어·새우는 재료로 치지 않음', () => {
    const text = '농심 신라면 5입\n오뚜기 김치라면 4입\n오징어짬뽕 5입\n청정원 우동사리 3입\n옛날 소면 900g\n자른당면 500g\n광천 조미김 16봉\n감자전분 400g\n바몬드카레 순한맛';
    expect(Receipt.matchIngredients(text, INFO.items, MASTER)).toEqual(['김', '소면', '우동면', '라면', '당면', '전분', '카레가루']);
    expect(Receipt.matchIngredients('컵라면 육개장', INFO.items, MASTER)).toEqual([]);
  });

  test('다른 상품 이름 속 재료는 제외 목록으로 거름', () => {
    const text = '사과식초 500ml\n토마토케첩 300g\n김치만두 1kg\n새우깡 90g\n감자칩 60g\n된장찌개 양념';
    expect(Receipt.matchIngredients(text, INFO.items, MASTER)).toEqual(['만두', '케첩', '식초']);
  });

  test('재료가 없으면 빈 목록', () => {
    expect(Receipt.matchIngredients('코카콜라 1.5L\n봉투 50원\n합계 3,250', INFO.items, MASTER)).toEqual([]);
    expect(Receipt.matchIngredients('', INFO.items, MASTER)).toEqual([]);
  });
});
