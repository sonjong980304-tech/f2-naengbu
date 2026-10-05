/* 효과음: 음원 파일 없이 Web Audio로 짧게 만들어요. 기본 켜짐, 끄면 그 기기에 기억. 브라우저: window.Sound / Node: require */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Sound = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KEY = 'naengbu:sound:v1';

  // 저장된 값이 '0'일 때만 꺼짐. 저장소가 없거나 막혀 있으면 기본(켜짐)
  function readEnabled(store) {
    try { return !store || store.getItem(KEY) !== '0'; } catch (e) { return true; }
  }
  function writeEnabled(store, on) {
    try { store.setItem(KEY, on ? '1' : '0'); return true; } catch (e) { return false; }
  }

  const BY_ACTION = {
    tick: ['go', 'tab', 'toggleAdd', 'fbBack', 'reBack', 'again', 'credits', 'scan', 'tag', 'like', 'toFridge', 'prevRecipes', 'submitFb'],
    pop: ['fill', 'sel', 'manualPick', 'manualAdd', 'pick', 'receiptSample'],
    chime: ['cook', 'cookRe', 'pendConfirm'],
    thud: ['reject', 'remove', 'pendRemove', 'pendCancel', 'undo', 'manualClose'],
  };
  const MAP = {};
  Object.keys(BY_ACTION).forEach(s => BY_ACTION[s].forEach(a => { MAP[a] = s; }));

  // 클릭한 동작(data-act) → 소리 이름. chip은 이미 있던 재료면 빼기(툭), 없던 재료면 넣기(뽁)
  function soundFor(action, ctx) {
    if (action === 'chip') return ctx && ctx.had ? 'thud' : 'pop';
    return MAP[action] || null;
  }

  /* ───── 브라우저 전용 ───── */
  // 음 하나: [시작(초), 주파수 시작, 주파수 끝, 길이, 음량, 파형]
  const NOTES = {
    tick: [[0, 1400, 1000, 0.06, 0.30, 'triangle']],
    pop: [[0, 420, 950, 0.10, 0.45, 'sine']],
    chime: [[0, 880, 880, 0.25, 0.30, 'triangle'], [0.09, 1320, 1320, 0.34, 0.26, 'triangle']],
    thud: [[0, 320, 160, 0.14, 0.50, 'sine']],
  };
  let ctx = null, on = true, store = null;

  function getCtx() {
    if (ctx) return ctx;
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  }
  function init(s) { store = s; on = readEnabled(s); }
  function isOn() { return on; }
  function setOn(v) { on = !!v; writeEnabled(store, on); }
  // 브라우저는 사용자가 누른 뒤에야 소리를 허락해요. 첫 터치에 깨워 둬요
  function unlock() {
    const c = on && getCtx();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} }
  }
  function play(name) {
    if (!on || !NOTES[name]) return;
    const c = getCtx(); if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      const t0 = c.currentTime + 0.005;
      NOTES[name].forEach(([at, f0, f1, len, vol, type]) => {
        const o = c.createOscillator(), g = c.createGain(), s = t0 + at;
        o.type = type;
        o.frequency.setValueAtTime(f0, s);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, s + len);
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(vol, s + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, s + len);
        o.connect(g); g.connect(c.destination);
        o.start(s); o.stop(s + len + 0.02);
      });
    } catch (e) {}
  }

  return { KEY, readEnabled, writeEnabled, soundFor, init, isOn, setOn, unlock, play };
});
