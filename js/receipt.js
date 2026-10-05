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

  // 줄 단위로 보고, 별칭이 있어도 제외어가 같은 줄에 있으면 그 재료로 치지 않아요
  function matchIngredients(text, items, masterOrder) {
    const lines = String(text || '').split(/\r?\n/).map(normalizeLine).filter(Boolean);
    const found = new Set();
    Object.keys(items).forEach(name => {
      const { aliases, exclude = [] } = items[name];
      const al = aliases.map(normalizeLine), ex = exclude.map(normalizeLine);
      if (lines.some(l => al.some(a => l.includes(a)) && !ex.some(e => l.includes(e)))) found.add(name);
    });
    const order = masterOrder || Object.keys(items);
    return order.filter(n => found.has(n));
  }

  // 사용자가 직접 쓴 한 줄 → 재료 하나. 둘 이상으로 해석되면 고르지 않고 ambiguous로 돌려줘요
  function resolveTyped(text, items, masterOrder) {
    const key = normalizeLine(text);
    if (!key) return { status: 'empty', name: null, candidates: [] };
    if (items[key]) return { status: 'ok', name: key, candidates: [key] };
    const found = matchIngredients(key, items, masterOrder);
    if (found.length === 1) return { status: 'ok', name: found[0], candidates: found };
    if (found.length > 1) return { status: 'ambiguous', name: null, candidates: found };
    return { status: 'none', name: null, candidates: [] };
  }

  return { normalizeLine, matchIngredients, resolveTyped };
});
