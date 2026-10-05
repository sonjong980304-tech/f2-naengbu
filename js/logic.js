/* 추천 로직 순수 함수. DOM·저장소에 접근하지 않아요. 브라우저: window.Logic / Node: require */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TAG_ORDER = ['lack_ingredient', 'no_spicy', 'too_long', 'too_hard', 'want_different', 'recently_ate'];
  const RELAX_STEPS = ['half', 'different', 'too_long', 'too_hard', 'lack_ingredient'];

  function toUTC(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  }

  function daysLeft(expiryISO, todayISO) {
    return Math.round((toUTC(expiryISO) - toUTC(todayISO)) / 864e5);
  }

  function badgeLevel(d) {
    if (d < 0) return 'expired';
    if (d <= 3) return 'red';
    if (d <= 7) return 'orange';
    return 'green';
  }

  function ingredientScore(d) {
    if (d <= 1) return 8;
    if (d <= 3) return 4;
    if (d <= 7) return 2;
    return 1;
  }

  function urgentNames(fridge) {
    const usable = fridge.filter(x => x.daysLeft >= 0);
    const urgent = usable.filter(x => x.daysLeft <= 3);
    const list = urgent.length ? urgent : usable.slice().sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3);
    return list.map(x => x.name);
  }

  function freshnessPercent(left, totalDays) {
    if (left <= 0) return 0;
    if (totalDays <= 0 || left >= totalDays) return 100;
    return Math.round((left / totalDays) * 100);
  }

  function fridgeSummary(fridge) {
    const names = list => list.slice().sort((a, b) => a.daysLeft - b.daysLeft).map(x => x.name);
    return {
      urgent: names(fridge.filter(x => x.daysLeft >= 0 && x.daysLeft <= 3)),
      expired: names(fridge.filter(x => x.daysLeft < 0)),
    };
  }

  function buildContext({ fridge, mode, selected = [] }) {
    const usable = fridge.filter(x => x.daysLeft >= 0);
    const inPool = mode === 'picked' ? usable.filter(x => selected.includes(x.name)) : usable;
    return {
      mode,
      fridge: new Map(fridge.map(x => [x.name, x.daysLeft])),
      pool: new Map(inPool.map(x => [x.name, x.daysLeft])),
      urgent: new Set(urgentNames(fridge)),
    };
  }

  function evaluate(recipe, ctx) {
    const mine = [], inFridge = [], missing = [];
    recipe.ingredients.forEach(n => {
      if (ctx.pool.has(n)) mine.push(n);
      else if (ctx.fridge.has(n) && ctx.fridge.get(n) >= 0) inFridge.push(n);
      else missing.push(n);
    });
    mine.sort((a, b) => ctx.pool.get(a) - ctx.pool.get(b));
    return {
      recipe,
      mine,
      inFridge,
      missing,
      score: mine.reduce((s, n) => s + ingredientScore(ctx.pool.get(n)), 0),
      ratio: mine.length / recipe.ingredients.length,
      hasUrgent: mine.some(n => ctx.urgent.has(n)),
    };
  }

  function isExposed(e, ctx, opt = {}) {
    if (e.mine.length < 2) return false;
    if (!opt.relaxHalf && e.ratio < 0.5) return false;
    if (ctx.mode === 'urgent' && !e.hasUrgent) return false;
    return true;
  }

  function compareEvaluated(a, b) {
    return b.score - a.score
      || b.ratio - a.ratio
      || a.recipe.cookTimeMin - b.recipe.cookTimeMin
      || a.recipe.id - b.recipe.id;
  }

  function recommend({ recipes, fridge, mode, selected = [], excludeIds = [], n = 3 }) {
    const ctx = buildContext({ fridge, mode, selected });
    return recipes
      .filter(r => !excludeIds.includes(r.id))
      .map(r => evaluate(r, ctx))
      .filter(e => isExposed(e, ctx))
      .sort(compareEvaluated)
      .slice(0, n);
  }

  function passTags(recipe, tags, seenDishTypes) {
    if (tags.includes('lack_ingredient') && recipe.ingredients.length > 3) return false;
    if (tags.includes('no_spicy') && recipe.isSpicy) return false;
    if (tags.includes('too_long') && recipe.cookTimeMin > 15) return false;
    if (tags.includes('too_hard') && recipe.difficulty !== 'easy') return false;
    if ((tags.includes('want_different') || tags.includes('recently_ate')) && seenDishTypes.includes(recipe.dishType)) return false;
    return true;
  }

  function pickDiverse(sorted, n) {
    const picked = [], types = new Set();
    sorted.forEach((e, i) => {
      if (picked.length < n && !types.has(e.recipe.dishType)) { picked.push(i); types.add(e.recipe.dishType); }
    });
    sorted.forEach((e, i) => {
      if (picked.length < n && !picked.includes(i)) picked.push(i);
    });
    return picked.sort((a, b) => a - b).map(i => sorted[i]);
  }

  function relaxTags(tags, step) {
    if (step === 'different') return tags.filter(t => t !== 'want_different' && t !== 'recently_ate');
    return tags.filter(t => t !== step);
  }

  function stepApplies(step, tags) {
    if (step === 'half') return true;
    if (step === 'different') return tags.includes('want_different') || tags.includes('recently_ate');
    return tags.includes(step);
  }

  function rerecommend({ recipes, fridge, mode, selected = [], tags = [], excludeIds = [], seenDishTypes = [], n = 3 }) {
    const ctx = buildContext({ fridge, mode, selected });
    const candidates = recipes.filter(r => !excludeIds.includes(r.id)).map(r => evaluate(r, ctx));
    const run = (activeTags, relaxHalf) => candidates
      .filter(e => passTags(e.recipe, activeTags, seenDishTypes) && isExposed(e, ctx, { relaxHalf }))
      .sort(compareEvaluated);

    let activeTags = tags.slice(), relaxHalf = false;
    const relaxedSteps = [];
    let found = run(activeTags, relaxHalf);
    for (const step of RELAX_STEPS) {
      if (found.length) break;
      if (!stepApplies(step, activeTags)) continue;
      if (step === 'half') relaxHalf = true;
      else activeTags = relaxTags(activeTags, step);
      relaxedSteps.push(step);
      found = run(activeTags, relaxHalf);
    }
    const items = pickDiverse(found, n);
    return { items, relaxed: items.length > 0 && relaxedSteps.length > 0, relaxedSteps, exhausted: items.length === 0 };
  }

  function nextSession(session, rejectedIds) {
    const rejected = session.rejected.slice();
    rejectedIds.forEach(id => { if (!rejected.includes(id)) rejected.push(id); });
    return { rejected, round: session.round + 1 };
  }

  function cookedRemoval(e, seasoningSet) {
    return e.mine.filter(n => !seasoningSet.has(n));
  }

  function fill(template, vars) {
    return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }

  function buildReason({ mineDays, cookTimeMin, tags = [] }, copy) {
    const urgent = mineDays.filter(([, d]) => d !== null && d >= 0 && d <= 3).sort((a, b) => a[1] - b[1]);
    let s = urgent.length
      ? fill(copy.reason.urgent, {
          list: urgent.map(([name, d]) => (d === 0 ? `${name}(${copy.badge.today})` : fill(copy.reason.urgentItem, { name, n: d }))).join(', '),
        })
      : fill(copy.reason.calm, { n: cookTimeMin });
    const parts = [];
    TAG_ORDER.filter(k => tags.includes(k)).forEach(k => {
      const p = fill(copy.reason.after[k], { n: cookTimeMin });
      if (!parts.includes(p)) parts.push(p);
    });
    if (parts.length) s += ' ' + parts.join(', ') + '.';
    return s;
  }

  function buildChanged(tags, copy) {
    const C = copy.changed, used = [];
    C.order.filter(k => tags.includes(k)).forEach(k => {
      if (!used.some(u => C.parts[u].and === C.parts[k].and)) used.push(k);
    });
    if (!used.length) return '';
    const text = used.map((k, i) => (i === used.length - 1 ? C.parts[k].final : C.parts[k].and)).join(' ');
    return fill(C.ending, { parts: text });
  }

  return {
    TAG_ORDER, RELAX_STEPS,
    daysLeft, badgeLevel, ingredientScore, urgentNames, fridgeSummary, freshnessPercent,
    buildContext, evaluate, isExposed, compareEvaluated, recommend,
    passTags, pickDiverse, rerecommend, nextSession, cookedRemoval,
    buildReason, buildChanged,
  };
});
