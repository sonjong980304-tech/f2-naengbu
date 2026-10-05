const { test, expect } = require('@playwright/test');
const path = require('path');
const Logic = require(path.join(__dirname, '..', '..', 'js', 'logic.js'));
const RECIPES = require(path.join(__dirname, '..', '..', 'data', 'recipes.json'));
const FRIDGE = require(path.join(__dirname, '..', '..', 'data', 'sample-fridge.json'));
const COPY = require(path.join(__dirname, '..', '..', 'data', 'copy.json'));

const TODAY = '2026-10-05';
const SEASONING = new Set(FRIDGE.master['양념류']);

function R(id, ingredients, extra = {}) {
  return { id, name: 'R' + id, cookTimeMin: 10, difficulty: 'easy', isSpicy: false, dishType: '볶음', ingredients, steps: ['a', 'b', 'c'], ...extra };
}

test.describe('daysLeft', () => {
  test('같은 날은 0, 다음 날은 1, 지난 날은 음수', () => {
    expect(Logic.daysLeft('2026-10-05', TODAY)).toBe(0);
    expect(Logic.daysLeft('2026-10-06', TODAY)).toBe(1);
    expect(Logic.daysLeft('2026-10-03', TODAY)).toBe(-2);
  });
  test('월말·연말을 넘겨도 날짜 단위로 계산', () => {
    expect(Logic.daysLeft('2026-11-01', '2026-10-31')).toBe(1);
    expect(Logic.daysLeft('2027-01-01', '2026-12-31')).toBe(1);
  });
});

test.describe('badgeLevel', () => {
  test('0~3 red, 4~7 orange, 8 이상 green, 음수 expired', () => {
    expect([-1, 0, 3, 4, 7, 8, 30].map(Logic.badgeLevel))
      .toEqual(['expired', 'red', 'red', 'orange', 'orange', 'green', 'green']);
  });
});

test.describe('ingredientScore (기획안 2-2)', () => {
  test('1일 이하 8, 2~3일 4, 4~7일 2, 8일 이상 1', () => {
    expect([0, 1, 2, 3, 4, 7, 8, 40].map(Logic.ingredientScore)).toEqual([8, 8, 4, 4, 2, 2, 1, 1]);
  });
});

test.describe('urgentNames', () => {
  test('3일 이하 재료만, 기한 지난 재료는 제외', () => {
    const fridge = [{ name: '대파', daysLeft: 2 }, { name: '두부', daysLeft: 3 }, { name: '김치', daysLeft: 20 }, { name: '계란', daysLeft: -1 }];
    expect(Logic.urgentNames(fridge).sort()).toEqual(['대파', '두부']);
  });
  test('3일 이하가 없으면 가장 빨리 오는 3개', () => {
    const fridge = [{ name: 'a', daysLeft: 9 }, { name: 'b', daysLeft: 5 }, { name: 'c', daysLeft: 20 }, { name: 'd', daysLeft: 6 }];
    expect(Logic.urgentNames(fridge)).toEqual(['b', 'd', 'a']);
  });
});

test.describe('freshnessPercent (신선도 바)', () => {
  test('전체 기간 중 남은 비율: 14일 중 9일 남으면 64%', () => {
    expect(Logic.freshnessPercent(9, 14)).toBe(64);
    expect(Logic.freshnessPercent(7, 7)).toBe(100);
  });
  test('기한이 지나면 0%, 오늘까지면 0%', () => {
    expect(Logic.freshnessPercent(-1, 7)).toBe(0);
    expect(Logic.freshnessPercent(0, 7)).toBe(0);
  });
  test('유통기한을 늘려 남은 일수가 전체보다 길면 100%, 전체 기간이 0 이하여도 안전', () => {
    expect(Logic.freshnessPercent(10, 7)).toBe(100);
    expect(Logic.freshnessPercent(3, 0)).toBe(100);
    expect(Logic.freshnessPercent(0, 0)).toBe(0);
  });
});

test.describe('fridgeSummary (요약 줄)', () => {
  test('3일 안(0~3일)과 기한 지남을 나눠서, 남은 일수가 적은 순으로', () => {
    const fridge = [
      { name: '김치', daysLeft: 20 }, { name: '대파', daysLeft: 0 }, { name: '두부', daysLeft: -1 },
      { name: '계란', daysLeft: -3 }, { name: '콩나물', daysLeft: 2 }, { name: '애호박', daysLeft: 4 },
    ];
    expect(Logic.fridgeSummary(fridge)).toEqual({ urgent: ['대파', '콩나물'], expired: ['계란', '두부'] });
  });
  test('해당 재료가 없으면 빈 목록', () => {
    expect(Logic.fridgeSummary([{ name: '김치', daysLeft: 20 }])).toEqual({ urgent: [], expired: [] });
  });
});

test.describe('evaluate · isExposed', () => {
  const fridge = [{ name: '대파', daysLeft: 2 }, { name: '두부', daysLeft: 3 }, { name: '김치', daysLeft: 20 }, { name: '계란', daysLeft: -1 }];

  test('내 재료 / 냉장고에 있음 / 없음으로 나누고, 기한 지난 재료는 없음', () => {
    const ctx = Logic.buildContext({ fridge, mode: 'picked', selected: ['대파'] });
    const e = Logic.evaluate(R(1, ['대파', '김치', '계란', '참기름']), ctx);
    expect(e.mine).toEqual(['대파']);
    expect(e.inFridge).toEqual(['김치']);
    expect(e.missing).toEqual(['계란', '참기름']);
  });

  test('점수 합과 보유 비율', () => {
    const ctx = Logic.buildContext({ fridge, mode: 'urgent' });
    const e = Logic.evaluate(R(1, ['두부', '김치', '대파', '참기름']), ctx);
    expect(e.score).toBe(9);
    expect(e.ratio).toBe(0.75);
    expect(e.mine).toEqual(['대파', '두부', '김치']);
  });

  test('절반 이상 + 2개 이상 보유해야 노출', () => {
    const ctx = Logic.buildContext({ fridge, mode: 'picked', selected: ['대파', '두부', '김치'] });
    expect(Logic.isExposed(Logic.evaluate(R(1, ['대파', '두부', 'x', 'y']), ctx), ctx)).toBe(true);
    expect(Logic.isExposed(Logic.evaluate(R(2, ['대파', 'x', 'y']), ctx), ctx)).toBe(false);
    expect(Logic.isExposed(Logic.evaluate(R(3, ['대파', '두부', 'x', 'y', 'z']), ctx), ctx)).toBe(false);
  });

  test('임박 모드는 임박 재료가 1개 이상 들어가야 노출', () => {
    const f = [{ name: 'a', daysLeft: 1 }, { name: 'b', daysLeft: 20 }, { name: 'c', daysLeft: 30 }];
    const ctx = Logic.buildContext({ fridge: f, mode: 'urgent' });
    expect(Logic.isExposed(Logic.evaluate(R(1, ['b', 'c']), ctx), ctx)).toBe(false);
    expect(Logic.isExposed(Logic.evaluate(R(2, ['a', 'b']), ctx), ctx)).toBe(true);
  });

  test('relaxHalf면 절반 조건 없이 2개 이상만 보유하면 노출', () => {
    const ctx = Logic.buildContext({ fridge, mode: 'picked', selected: ['대파', '두부'] });
    const e = Logic.evaluate(R(1, ['대파', '두부', 'x', 'y', 'z']), ctx);
    expect(Logic.isExposed(e, ctx, { relaxHalf: true })).toBe(true);
  });
});

test.describe('정렬 (점수 합 → 보유 비율 → 조리시간 → id)', () => {
  test('기획안 예시: 대파 D-2, 두부 D-3, 김치 D-20이면 두부김치가 맨 위', () => {
    const fridge = [{ name: '대파', daysLeft: 2 }, { name: '두부', daysLeft: 3 }, { name: '김치', daysLeft: 20 }];
    const list = Logic.recommend({ recipes: RECIPES, fridge, mode: 'urgent' });
    expect(list[0].recipe.name).toBe('두부김치');
    expect(list[0].score).toBe(9);
  });

  test('점수가 같으면 보유 비율, 그다음 조리시간, 그다음 id', () => {
    const fridge = [{ name: 'a', daysLeft: 1 }, { name: 'b', daysLeft: 1 }];
    const recipes = [
      R(1, ['a', 'b', 'x', 'y'], { cookTimeMin: 5 }),
      R(2, ['a', 'b', 'x'], { cookTimeMin: 30 }),
      R(3, ['a', 'b'], { cookTimeMin: 20 }),
      R(4, ['a', 'b'], { cookTimeMin: 10 }),
      R(5, ['a', 'b'], { cookTimeMin: 10 }),
    ];
    const ids = Logic.recommend({ recipes, fridge, mode: 'urgent', n: 5 }).map(e => e.recipe.id);
    expect(ids).toEqual([4, 5, 3, 2, 1]);
  });

  test('제외 id는 나오지 않고, 최대 n장', () => {
    const fridge = [{ name: 'a', daysLeft: 1 }, { name: 'b', daysLeft: 1 }];
    const recipes = [1, 2, 3, 4, 5].map(i => R(i, ['a', 'b']));
    const ids = Logic.recommend({ recipes, fridge, mode: 'urgent', excludeIds: [1, 2] }).map(e => e.recipe.id);
    expect(ids).toEqual([3, 4, 5]);
  });
});

test.describe('passTags (기획안 4-2)', () => {
  const base = R(1, ['a', 'b', 'c', 'd'], { isSpicy: true, cookTimeMin: 20, difficulty: 'normal', dishType: '찌개·국' });
  test('태그별 조건', () => {
    expect(Logic.passTags(base, ['lack_ingredient'], [])).toBe(false);
    expect(Logic.passTags({ ...base, ingredients: ['a', 'b', 'c'] }, ['lack_ingredient'], [])).toBe(true);
    expect(Logic.passTags(base, ['no_spicy'], [])).toBe(false);
    expect(Logic.passTags(base, ['too_long'], [])).toBe(false);
    expect(Logic.passTags({ ...base, cookTimeMin: 15 }, ['too_long'], [])).toBe(true);
    expect(Logic.passTags(base, ['too_hard'], [])).toBe(false);
    expect(Logic.passTags(base, ['want_different'], ['찌개·국'])).toBe(false);
    expect(Logic.passTags(base, ['recently_ate'], ['볶음'])).toBe(true);
    expect(Logic.passTags(base, [], ['찌개·국'])).toBe(true);
  });
});

test.describe('pickDiverse', () => {
  test('요리 종류가 겹치지 않게 고르되 순서는 유지', () => {
    const list = [
      { recipe: R(1, [], { dishType: '볶음' }) },
      { recipe: R(2, [], { dishType: '볶음' }) },
      { recipe: R(3, [], { dishType: '덮밥' }) },
      { recipe: R(4, [], { dishType: '찌개·국' }) },
    ];
    expect(Logic.pickDiverse(list, 3).map(e => e.recipe.id)).toEqual([1, 3, 4]);
  });
  test('다른 종류가 모자라면 겹치는 것으로 채움', () => {
    const list = [1, 2, 3].map(i => ({ recipe: R(i, [], { dishType: '볶음' }) }));
    expect(Logic.pickDiverse(list, 3).map(e => e.recipe.id)).toEqual([1, 2, 3]);
  });
});

test.describe('rerecommend (비평 기반 + 조건 완화)', () => {
  const fridge = [{ name: 'a', daysLeft: 1 }, { name: 'b', daysLeft: 2 }, { name: 'c', daysLeft: 10 }];

  test('조건을 만족하는 후보가 있으면 완화 없이 반환', () => {
    const recipes = [R(1, ['a', 'b'], { isSpicy: true }), R(2, ['a', 'c'], { isSpicy: false })];
    const res = Logic.rerecommend({ recipes, fridge, mode: 'urgent', tags: ['no_spicy'], excludeIds: [], seenDishTypes: [] });
    expect(res.items.map(e => e.recipe.id)).toEqual([2]);
    expect(res.relaxed).toBe(false);
    expect(res.exhausted).toBe(false);
  });

  test('3장 안에서 요리 종류 겹침을 피함', () => {
    const recipes = [
      R(1, ['a', 'b'], { dishType: '볶음' }), R(2, ['a', 'b'], { dishType: '볶음' }),
      R(3, ['a', 'c'], { dishType: '덮밥' }), R(4, ['b', 'c'], { dishType: '찌개·국' }),
    ];
    const res = Logic.rerecommend({ recipes, fridge, mode: 'urgent', tags: [], excludeIds: [], seenDishTypes: [] });
    expect(res.items.map(e => e.recipe.dishType)).toEqual(['볶음', '덮밥', '찌개·국']);
  });

  test('① 절반 조건부터 풀기', () => {
    const recipes = [R(1, ['a', 'b', 'x', 'y', 'z'])];
    const res = Logic.rerecommend({ recipes, fridge, mode: 'urgent', tags: [], excludeIds: [], seenDishTypes: [] });
    expect(res.items.map(e => e.recipe.id)).toEqual([1]);
    expect(res.relaxed).toBe(true);
    expect(res.relaxedSteps).toEqual(['half']);
  });

  test('② 종류 → ③ 시간 → ④ 난이도 → ⑤ 재료 수 순서로 풀기', () => {
    const recipes = [R(1, ['a', 'b', 'c', 'x'], { dishType: '볶음', cookTimeMin: 30, difficulty: 'normal' })];
    const tags = ['lack_ingredient', 'too_hard', 'too_long', 'want_different'];
    const res = Logic.rerecommend({ recipes, fridge, mode: 'urgent', tags, excludeIds: [], seenDishTypes: ['볶음'] });
    expect(res.items.map(e => e.recipe.id)).toEqual([1]);
    expect(res.relaxedSteps).toEqual(['half', 'different', 'too_long', 'too_hard', 'lack_ingredient']);
  });

  test('필요한 만큼만 풀기: 시간만 풀면 되면 난이도는 유지', () => {
    const recipes = [R(1, ['a', 'b'], { cookTimeMin: 30, difficulty: 'easy' }), R(2, ['a', 'b'], { cookTimeMin: 30, difficulty: 'hard' })];
    const res = Logic.rerecommend({ recipes, fridge, mode: 'urgent', tags: ['too_long', 'too_hard'], excludeIds: [], seenDishTypes: [] });
    expect(res.items.map(e => e.recipe.id)).toEqual([1]);
    expect(res.relaxedSteps).toEqual(['half', 'too_long']);
  });

  test('no_spicy는 풀지 않음 → 후보 소진', () => {
    const recipes = [R(1, ['a', 'b'], { isSpicy: true })];
    const res = Logic.rerecommend({ recipes, fridge, mode: 'urgent', tags: ['no_spicy'], excludeIds: [], seenDishTypes: [] });
    expect(res.items).toEqual([]);
    expect(res.exhausted).toBe(true);
  });

  test('제외 목록은 완화해도 다시 나오지 않음', () => {
    const recipes = [R(1, ['a', 'b']), R(2, ['a', 'b'])];
    const res = Logic.rerecommend({ recipes, fridge, mode: 'urgent', tags: [], excludeIds: [1, 2], seenDishTypes: [] });
    expect(res.items).toEqual([]);
    expect(res.exhausted).toBe(true);
  });
});

test.describe('nextSession', () => {
  test('제외 목록 누적(중복 없음), 회차 +1', () => {
    expect(Logic.nextSession({ rejected: [1], round: 1 }, [1, 4])).toEqual({ rejected: [1, 4], round: 2 });
  });
});

test.describe('cookedRemoval (기획안 2-4)', () => {
  test('내 재료 중 양념류는 남기고 나머지만 뺌', () => {
    const fridge = [{ name: '두부', daysLeft: 3 }, { name: '참기름', daysLeft: 100 }, { name: '김치', daysLeft: 20 }];
    const ctx = Logic.buildContext({ fridge, mode: 'urgent' });
    const e = Logic.evaluate(R(1, ['두부', '참기름', '김치', '대파']), ctx);
    expect(Logic.cookedRemoval(e, SEASONING).sort()).toEqual(['김치', '두부']);
  });
  test('고른 재료 모드는 고른 재료만 뺌', () => {
    const fridge = [{ name: '두부', daysLeft: 3 }, { name: '김치', daysLeft: 20 }];
    const ctx = Logic.buildContext({ fridge, mode: 'picked', selected: ['두부'] });
    const e = Logic.evaluate(R(1, ['두부', '김치']), ctx);
    expect(Logic.cookedRemoval(e, SEASONING)).toEqual(['두부']);
  });
});

test.describe('buildReason · buildChanged (copy.json 템플릿)', () => {
  test('임박 재료가 있으면 남은 일수 순으로 나열', () => {
    const s = Logic.buildReason({ mineDays: [['김치', 20], ['대파', 3], ['두부', 1]], cookTimeMin: 12, tags: [] }, COPY);
    expect(s).toBe('임박한 두부(D-1), 대파(D-3)부터 먼저 쓸 수 있어요.');
  });
  test('오늘까지인 재료는 D-day로 표기', () => {
    const s = Logic.buildReason({ mineDays: [['두부', 0]], cookTimeMin: 12, tags: [] }, COPY);
    expect(s).toBe('임박한 두부(D-day)부터 먼저 쓸 수 있어요.');
  });
  test('임박 재료가 없으면 조리시간 문장 + 재추천 반영 조건', () => {
    const s = Logic.buildReason({ mineDays: [['김치', 20]], cookTimeMin: 15, tags: ['too_long', 'no_spicy'] }, COPY);
    expect(s).toBe('냉장고 재료만으로 15분이면 만들 수 있어요. 맵지 않아요, 15분이면 끝나요.');
  });
  test('달라진 점: order 순서, 마지막만 final, 같은 문구는 한 번', () => {
    expect(Logic.buildChanged(['too_long', 'no_spicy'], COPY)).toBe('맵지 않고 15분 안에 끝나는 요리로 바꿨어요');
    expect(Logic.buildChanged(['want_different', 'recently_ate'], COPY)).toBe('방금 본 요리와 종류가 다른 요리로 바꿨어요');
    expect(Logic.buildChanged([], COPY)).toBe('');
  });
});
