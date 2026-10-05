const { test, expect } = require('@playwright/test');
const path = require('path');
const Sound = require(path.join(__dirname, '..', '..', 'js', 'sound.js'));

const memStore = (init = {}) => {
  const m = { ...init };
  return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m };
};
const brokenStore = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };

test.describe('소리 설정 (기본 켜짐, 저장 실패해도 동작)', () => {
  test('저장된 값이 없으면 켜짐', () => {
    expect(Sound.readEnabled(memStore())).toBe(true);
  });
  test('끈 기록("0")이 있으면 꺼짐, "1"이면 켜짐', () => {
    expect(Sound.readEnabled(memStore({ [Sound.KEY]: '0' }))).toBe(false);
    expect(Sound.readEnabled(memStore({ [Sound.KEY]: '1' }))).toBe(true);
  });
  test('저장소가 막혀 있거나 없으면 켜짐(예외 없음)', () => {
    expect(Sound.readEnabled(brokenStore)).toBe(true);
    expect(Sound.readEnabled(null)).toBe(true);
  });
  test('writeEnabled는 "1"/"0"으로 저장하고, 막혀 있으면 false를 돌려줌(예외 없음)', () => {
    const s = memStore();
    expect(Sound.writeEnabled(s, false)).toBe(true);
    expect(s.m[Sound.KEY]).toBe('0');
    Sound.writeEnabled(s, true);
    expect(s.m[Sound.KEY]).toBe('1');
    expect(Sound.writeEnabled(brokenStore, false)).toBe(false);
  });
});

test.describe('동작별 효과음 고르기', () => {
  test('일반 버튼은 톡(tick)', () => {
    ['go', 'tab', 'toggleAdd', 'fbBack', 'reBack', 'again', 'credits', 'scan', 'tag', 'like', 'toFridge', 'prevRecipes', 'submitFb']
      .forEach(a => expect(Sound.soundFor(a), a).toBe('tick'));
  });
  test('재료 넣기·고르기는 뽁(pop)', () => {
    ['fill', 'sel', 'manualPick', 'manualAdd', 'pick', 'receiptSample'].forEach(a => expect(Sound.soundFor(a), a).toBe('pop'));
  });
  test('직접 입력 칩: 넣으면 뽁, 빼면 툭', () => {
    expect(Sound.soundFor('chip', { had: false })).toBe('pop');
    expect(Sound.soundFor('chip', { had: true })).toBe('thud');
  });
  test('해 먹었어요·냉장고에 넣기는 띠링(chime)', () => {
    ['cook', 'cookRe', 'pendConfirm'].forEach(a => expect(Sound.soundFor(a), a).toBe('chime'));
  });
  test('별로예요·빼기·취소는 툭(thud)', () => {
    ['reject', 'remove', 'pendRemove', 'pendCancel', 'undo', 'manualClose'].forEach(a => expect(Sound.soundFor(a), a).toBe('thud'));
  });
  test('모르는 동작과 소리 토글 자체는 소리 없음', () => {
    expect(Sound.soundFor('nope')).toBe(null);
    expect(Sound.soundFor('sound')).toBe(null);
  });
});
