/* 영수증 텍스트 → 재료 매칭 순수 함수. DOM·저장소·네트워크에 접근하지 않아요. 브라우저: window.Receipt / Node: require */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Receipt = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function normalizeLine(line) {
    return String(line || '').normalize('NFC').replace(/[^가-힣A-Za-z0-9]/g, '');
  }

  // OCR 오타 허용: OCR이 실제로 헷갈리는 차이만 받아 줘요 (달걀↔달갈 모음, 두부↔두북 받침, 새우깡↔새우강 된소리)
  // 같은 자리 글자끼리 비교하고, 단어 전체에서 한 군데만 달라야 해요. 첫소리가 다른 자음이면(국산무↔국산우) 다른 글자로 봐요
  const TENSE = { 0: 1, 1: 0, 3: 4, 4: 3, 7: 8, 8: 7, 9: 10, 10: 9, 12: 13, 13: 12 };   // ㄱㄲ ㄷㄸ ㅂㅃ ㅅㅆ ㅈㅉ
  function syl(ch) {
    const c = ch.charCodeAt(0) - 0xAC00;
    return c < 0 || c > 11171 ? null : [Math.floor(c / 588), Math.floor((c % 588) / 28), c % 28];
  }
  function sylDiff(a, b) {
    if (a === b) return 0;
    const x = syl(a), y = syl(b);
    if (!x || !y) return 9;
    if (x[0] !== y[0] && TENSE[x[0]] !== y[0]) return 9;
    return (x[0] !== y[0]) + (x[1] !== y[1]) + (x[2] !== y[2]);
  }
  function jamoCount(word) {
    return [...word].reduce((n, ch) => { const s = syl(ch); return n + (s ? (s[2] ? 3 : 2) : 1); }, 0);
  }
  const FUZZY_MIN_JAMO = 6;   // 김치·소금(자모 5개)처럼 짧은 별칭은 오타를 허용하면 엉뚱한 상품이 잡혀서 빼요

  function lineHas(line, word, fuzzy) {
    if (line.includes(word)) return true;
    if (!fuzzy || jamoCount(word) < FUZZY_MIN_JAMO) return false;
    const w = [...word], l = [...line];
    for (let i = 0; i + w.length <= l.length; i++) {
      let d = 0;
      for (let k = 0; k < w.length && d <= 1; k++) d += sylDiff(w[k], l[i + k]);
      if (d === 1) return true;
    }
    return false;
  }

  // 줄 단위로 보고, 별칭이 있어도 제외어(재료별·완제품 공통)가 같은 줄에 있으면 그 재료로 치지 않아요
  // opts.fuzzy: OCR 오타 허용(위 규칙), opts.globalExclude: 김밥·빵 같은 완제품 단어 목록
  function matchIngredients(text, items, masterOrder, opts = {}) {
    const fuzzy = !!opts.fuzzy;
    const globalEx = (opts.globalExclude || []).map(normalizeLine).filter(Boolean);
    const lines = String(text || '').split(/\r?\n/).map(normalizeLine).filter(Boolean)
      .filter(l => !globalEx.some(g => l.includes(g)));
    const found = new Set();
    Object.keys(items).forEach(name => {
      const { aliases, exclude = [] } = items[name];
      const al = aliases.map(normalizeLine), ex = exclude.map(normalizeLine);
      if (lines.some(l => al.some(a => lineHas(l, a, fuzzy)) && !ex.some(e => lineHas(l, e, fuzzy)))) found.add(name);
    });
    const order = masterOrder || Object.keys(items);
    return order.filter(n => found.has(n));
  }

  // 사용자가 직접 쓴 한 줄 → 재료 하나. 둘 이상으로 해석되면 고르지 않고 ambiguous로 돌려줘요
  function resolveTyped(text, items, masterOrder) {
    const key = normalizeLine(text);
    if (!key) return { status: 'empty', name: null, candidates: [] };
    if (Object.prototype.hasOwnProperty.call(items, key)) return { status: 'ok', name: key, candidates: [key] };
    const found = matchIngredients(key, items, masterOrder);
    if (found.length === 1) return { status: 'ok', name: found[0], candidates: found };
    if (found.length > 1) return { status: 'ambiguous', name: null, candidates: found };
    return { status: 'none', name: null, candidates: [] };
  }

  return { normalizeLine, matchIngredients, resolveTyped };
});
