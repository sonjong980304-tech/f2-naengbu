/* 영수증 사진 보정(OCR 전에): 크기 맞추기 + 흑백 + 그림자 지우기 + 대비 늘리기. 사진은 기기 밖으로 보내지 않아요. 브라우저: window.ReceiptOCR / Node: require */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReceiptOCR = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MIN_W = 1300, MAX_W = 2000, MAX_UP = 2.5;

  // 작은 글씨는 키워야 잘 읽고, 휴대폰 원본(4000px)은 줄여야 빨라요
  function targetSize(w, h) {
    let s = 1;
    if (w < MIN_W) s = Math.min(MAX_UP, MIN_W / w);
    else if (w > MAX_W) s = MAX_W / w;
    return { w: Math.round(w * s), h: Math.round(h * s) };
  }

  // RGBA 픽셀을 그 자리에서 흑백으로 바꾸고, 가장 어두운 2%~밝은 2%를 0~255로 펼쳐요 (바랜 감열지·그림자 대비)
  function enhancePixels(data) {
    const n = data.length / 4, hist = new Uint32Array(256), gray = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) {
      const g = Math.round(0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]);
      gray[i] = g; hist[g]++;
    }
    let cum = 0, lo = 0, hi = 255;
    for (let v = 0; v < 256; v++) { cum += hist[v]; if (cum > n * 0.02) { lo = v; break; } }
    cum = 0;
    for (let v = 0; v < 256; v++) { cum += hist[v]; if (cum >= n * 0.98) { hi = v; break; } }
    const span = hi - lo;
    for (let i = 0; i < n; i++) {
      const g = span < 8 ? gray[i] : Math.round(Math.min(255, Math.max(0, (gray[i] - lo) * 255 / span)));
      data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = g;
    }
    return data;
  }

  // 흑백 배열을 반지름 r 상자 평균으로 흐려요 (적분 영상, 크기와 상관없이 빠름)
  function boxBlur(src, w, h, r) {
    const I = new Float64Array((w + 1) * (h + 1));
    for (let y = 0; y < h; y++) {
      let row = 0;
      for (let x = 0; x < w; x++) { row += src[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row; }
    }
    const out = new Float64Array(w * h);
    for (let y = 0; y < h; y++) {
      const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
      for (let x = 0; x < w; x++) {
        const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
        const sum = I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0];
        out[y * w + x] = sum / ((y1 - y0) * (x1 - x0));
      }
    }
    return out;
  }

  // 그림자·고르지 않은 조명 지우기: 종이 밝기(바탕)를 추정해서 나눠요. 글자(바탕보다 어두운 점)는 바탕 추정에서 빼요
  function flattenLighting(gray, w, h, r) {
    const b1 = boxBlur(gray, w, h, r);
    const paper = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) paper[i] = Math.max(gray[i], b1[i]);
    const bg = boxBlur(paper, w, h, r);
    const out = new Uint8ClampedArray(w * h);
    for (let i = 0; i < w * h; i++) out[i] = Math.round(Math.min(255, (gray[i] / Math.max(1, bg[i])) * 255));
    return out;
  }

  // 브라우저 전용: 사진(data URL) → 보정한 PNG data URL
  function preprocess(dataUrl) {
    return new Promise((ok, no) => {
      const img = new Image();
      img.onload = () => {
        const { w, h } = targetSize(img.naturalWidth, img.naturalHeight);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.imageSmoothingQuality = 'high';
        g.drawImage(img, 0, 0, w, h);
        const im = g.getImageData(0, 0, w, h), d = im.data, n = w * h, gray = new Uint8ClampedArray(n);
        for (let i = 0; i < n; i++) gray[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
        const flat = flattenLighting(gray, w, h, Math.max(8, Math.round(w / 25)));
        for (let i = 0; i < n; i++) d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = flat[i];
        enhancePixels(d);
        g.putImageData(im, 0, 0);
        ok(c.toDataURL('image/png'));
      };
      img.onerror = () => no(new Error('image'));
      img.src = dataUrl;
    });
  }

  return { targetSize, enhancePixels, flattenLighting, preprocess };
});
