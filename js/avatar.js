/* Animus Codex Portrait loader - progressive double-buffered WebP portraits for Center Stage */
(function () {
  'use strict';

  const safeId = (v) => String(v == null ? '' : v).replace(/[^a-z0-9_-]/gi, '');
  const idOf = (x, fallback) => {
    if (typeof x === 'string') return safeId(x) || fallback;
    if (x && typeof x === 'object' && x.id) return safeId(x.id) || fallback;
    return fallback;
  };
  const escAttr = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const ALL_SPECIES = ['human', 'elf', 'dwarf', 'halfling', 'dragonborn', 'gnome', 'tiefling', 'half-orc', 'half-elf', 'goliath', 'aasimar', 'tabaxi'];
  const ALL_CLASSES = ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'];
  const DEFAULT_SPECIES_CLASS = {
    'half-orc': 'barbarian', halfling: 'rogue', tiefling: 'warlock', dwarf: 'cleric',
    dragonborn: 'paladin', tabaxi: 'monk', 'half-elf': 'bard', elf: 'ranger',
    gnome: 'wizard', goliath: 'barbarian', aasimar: 'paladin', human: 'fighter'
  };
  const lqUrl = (c, s) => `images/portraits/${c}/${s}.lq.webp`;
  const hiUrl = (c, s) => `images/portraits/${c}/${s}.webp`;
  const isLq = (src) => /\.lq\.webp$/.test(src || '');

  /* Two-tier preload queue: lossy thumbnails always drain before hi-res portraits. */
  const loadedHiRes = new Set();
  const loadedLq = new Set();
  const queuedSet = new Set();
  const lqQueue = [];
  const hiQueue = [];
  const MAX_CONCURRENCY = 8;
  let inflight = 0;

  function pumpPreload() {
    while (inflight < MAX_CONCURRENCY && (lqQueue.length || hiQueue.length)) {
      const src = lqQueue.length ? lqQueue.shift() : hiQueue.shift();
      const seen = isLq(src) ? loadedLq : loadedHiRes;
      if (seen.has(src)) continue;
      inflight += 1;
      const im = new Image();
      im.decoding = 'async';
      const done = (ok) => {
        inflight -= 1;
        if (ok) seen.add(src);
        pumpPreload();
      };
      im.onload = () => done(true);
      im.onerror = () => done(false);
      im.src = src;
    }
  }

  function enqueuePreload(src, highPriority) {
    if (!src || loadedHiRes.has(src) || loadedLq.has(src) || queuedSet.has(src)) return;
    queuedSet.add(src);
    const q = isLq(src) ? lqQueue : hiQueue;
    if (highPriority) q.unshift(src);
    else q.push(src);
    pumpPreload();
  }

  let idleScheduled = false;
  /* Active row and column neighbors first, all 144 lossy thumbnails queued at once, hi-res deferred to idle. */
  function preloadNeighbors(spId, clId) {
    if (typeof Image === 'undefined') return;
    const lq = [];
    const hi = [];
    ALL_SPECIES.forEach((s) => { lq.push(lqUrl(clId, s)); hi.push(hiUrl(clId, s)); });
    ALL_CLASSES.forEach((c) => { lq.push(lqUrl(c, spId)); hi.push(hiUrl(c, spId)); });
    lq.reverse().forEach((src) => enqueuePreload(src, true));
    hi.reverse().forEach((src) => enqueuePreload(src, true));
    if (idleScheduled) return;
    idleScheduled = true;
    ALL_CLASSES.forEach((c) => ALL_SPECIES.forEach((s) => enqueuePreload(lqUrl(c, s), false)));
    const scheduleIdle = typeof requestIdleCallback === 'function' ? requestIdleCallback : (fn) => setTimeout(fn, 180);
    scheduleIdle(() => {
      ALL_CLASSES.forEach((c) => ALL_SPECIES.forEach((s) => enqueuePreload(hiUrl(c, s), false)));
    });
  }

  function portraitIds(sp, cl) {
    const spId = idOf(sp, 'human');
    const clId = idOf(cl, 'fighter');
    const fbClass = DEFAULT_SPECIES_CLASS[spId] || 'fighter';
    return { spId, clId, key: `${spId}__${clId}`, lq: lqUrl(clId, spId), src: hiUrl(clId, spId), fallbackSrc: hiUrl(fbClass, spId) };
  }

  function activateLayer(frame, winner, loser) {
    winner.classList.add('is-ready', 'is-front');
    winner.classList.remove('is-back');
    if (loser && loser !== winner) {
      clearTimeout(loser._fadeTimer);
      if (loser.classList.contains('is-ready')) {
        loser.classList.remove('is-front');
        loser.classList.add('is-back');
        loser._fadeTimer = setTimeout(() => {
          if (!loser.classList.contains('is-front')) loser.classList.remove('is-ready', 'is-back');
        }, 155);
      } else {
        loser.classList.remove('is-front', 'is-back');
      }
    }
    if (frame) frame.classList.remove('is-loading-lq');
  }

  function isStale(frame, img) {
    const imgSeq = Number(img.getAttribute('data-seq') || '0');
    return Boolean(frame._swapSeq) && imgSeq !== frame._swapSeq;
  }

  function onPortraitLoad(img) {
    if (!img) return;
    const curSrc = img.getAttribute('src');
    if (curSrc && !isLq(curSrc)) loadedHiRes.add(curSrc);
    const frame = img.closest ? img.closest('.codex-frame') : null;
    if (!frame) {
      img.classList.add('is-ready', 'is-front');
      return;
    }
    if (isStale(frame, img)) return;
    const allowed = [frame.getAttribute('data-target-src'), img.getAttribute('data-fallback-src'), img.getAttribute('data-lq-src')];
    if (allowed[0] && !allowed.includes(curSrc)) return;
    const layers = frame.querySelectorAll('.codex-img');
    activateLayer(frame, img, layers[0] === img ? layers[1] : layers[0]);
  }

  /* Error ladder: class portrait, then species default class portrait, then the lossy preview. */
  function onPortraitError(img) {
    if (!img) return;
    const fb = img.getAttribute('data-fallback-src');
    if (fb && img.getAttribute('data-fallback-tried') !== '1') {
      img.setAttribute('data-fallback-tried', '1');
      img.src = fb;
      return;
    }
    const lq = img.getAttribute('data-lq-src');
    if (lq && img.getAttribute('data-lq-tried') !== '1') {
      img.setAttribute('data-lq-tried', '1');
      img.src = lq;
      return;
    }
    img.setAttribute('data-failed', '1');
    const frame = img.closest ? img.closest('.codex-frame') : null;
    if (frame && !isStale(frame, img)) frame.classList.remove('is-loading-lq');
  }

  const HANDLERS = 'onload="window.FORGE_AVATAR&&window.FORGE_AVATAR.onPortraitLoad(this)" onerror="window.FORGE_AVATAR&&window.FORGE_AVATAR.onPortraitError(this)"';
  const CORNERS = ['tl', 'tr', 'bl', 'br'].map((c) => `<span class="codex-corner ${c}" aria-hidden="true"></span>`).join('');
  const altOf = (sp, cl, ids) => `${(sp && sp.name) || ids.spId} ${(cl && cl.name) || ids.clId}`;

  function renderPortraitHtml(sp, sr, cl, sc, opts) {
    const ids = portraitIds(sp, cl);
    const ready = loadedHiRes.has(ids.src) ? ' is-ready is-front' : ' is-front';
    if (!opts || !opts.preview) preloadNeighbors(ids.spId, ids.clId);
    return `<div class="codex-frame" data-portrait-sp="${ids.spId}" data-portrait-cl="${ids.clId}" data-target-src="${ids.src}">` +
      `<img class="codex-lq" src="${escAttr(ids.lq)}" alt="" aria-hidden="true" decoding="async" />` +
      `<img class="codex-img${ready}" data-slot="a" data-seq="0" src="${ids.src}" data-fallback-src="${ids.fallbackSrc}" data-lq-src="${ids.lq}" alt="${escAttr(altOf(sp, cl, ids))}" decoding="async" ${HANDLERS} />` +
      `<img class="codex-img" data-slot="b" data-fallback-src="${ids.fallbackSrc}" data-lq-src="${ids.lq}" alt="" decoding="async" ${HANDLERS} />` +
      CORNERS + '</div>';
  }

  /* Double-buffered crossfade: decodes incoming portrait off-top before fading over current layer. */
  function updatePortraitFrame(frame, sp, sr, cl, sc, opts) {
    if (!frame) return false;
    const layers = frame.querySelectorAll('.codex-img');
    if (layers.length < 2) return false;
    const ids = portraitIds(sp, cl);
    const alt = altOf(sp, cl, ids);
    const lqImg = frame.querySelector('.codex-lq');
    frame.setAttribute('data-portrait-sp', ids.spId);
    frame.setAttribute('data-portrait-cl', ids.clId);
    frame.setAttribute('data-target-src', ids.src);
    if (lqImg && lqImg.getAttribute('src') !== ids.lq) lqImg.setAttribute('src', ids.lq);
    if (!opts || !opts.preview) preloadNeighbors(ids.spId, ids.clId);
    else enqueuePreload(ids.lq, true);

    const seq = (frame._swapSeq || 0) + 1;
    frame._swapSeq = seq;
    const curFront = frame.querySelector('.codex-img.is-front') || layers[0];
    const nextImg = layers[0] === curFront ? layers[1] : layers[0];
    clearTimeout(nextImg._fadeTimer);
    nextImg.classList.remove('is-ready', 'is-front', 'is-back');

    if (curFront.getAttribute('src') === ids.src && curFront.classList.contains('is-ready')) {
      curFront.setAttribute('data-seq', String(seq));
      curFront.alt = alt;
      frame.classList.remove('is-loading-lq');
      return true;
    }

    ['data-fallback-tried', 'data-lq-tried', 'data-failed'].forEach((a) => nextImg.removeAttribute(a));
    nextImg.setAttribute('data-fallback-src', ids.fallbackSrc);
    nextImg.setAttribute('data-lq-src', ids.lq);
    nextImg.setAttribute('data-seq', String(seq));
    nextImg.alt = alt;
    const nextHasSrc = nextImg.getAttribute('src') === ids.src && nextImg.complete && nextImg.naturalWidth > 0;
    const hiCached = loadedHiRes.has(ids.src) || nextHasSrc;
    if (!hiCached) {
      /* HD still downloading: fade the old character out and reveal the new lossy preview at once. */
      if (lqImg) lqImg.setAttribute('src', ids.lq);
      frame.classList.add('is-loading-lq');
      clearTimeout(curFront._fadeTimer);
      curFront.classList.remove('is-ready', 'is-front', 'is-back');
    }

    const commitSwap = (viaFrame) => {
      if (frame._swapSeq !== seq) return;
      loadedHiRes.add(ids.src);
      if (!viaFrame) {
        activateLayer(frame, nextImg, curFront);
        return;
      }
      requestAnimationFrame(() => {
        if (frame._swapSeq === seq) activateLayer(frame, nextImg, curFront);
      });
    };
    if (nextHasSrc) {
      commitSwap(true);
    } else {
      nextImg.setAttribute('src', ids.src);
      if (typeof nextImg.decode === 'function') nextImg.decode().then(() => commitSwap(false), () => {});
    }
    return true;
  }

  const api = { renderPortraitHtml, updatePortraitFrame, onPortraitLoad, onPortraitError, preloadNeighbors, portraitIds, loadedHiRes, loadedLq };
  const root = typeof window !== 'undefined' ? window : globalThis;
  root.FORGE_AVATAR = api;
})();
