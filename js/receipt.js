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

  return { normalizeLine, matchIngredients };
});
