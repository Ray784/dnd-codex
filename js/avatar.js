/* Animus Codex Portrait generator - mid-thigh tarot card SVG for Center Stage */
(function () {
  'use strict';

  const CX = 130;
  const CUT = 308;
  const AURA = 'var(--aura, #d6a74a)';
  const VE = 'vector-effect="non-scaling-stroke"';
  const MIRROR = 'matrix(-1 0 0 1 260 0)';
  let uidSeq = 0;

  const n = (v) => Math.round(v * 10) / 10;
  const mir = (s) => `<g transform="${MIRROR}">${s}</g>`;
  const both = (s) => s + mir(s);
  const bothL = (s) => s + `<g transform="scale(-1 1)">${s}</g>`;
  const auraFill = (op) => `style="fill:${AURA}" fill-opacity="${op == null ? 1 : op}"`;
  const auraStroke = (op, w) => `fill="none" style="stroke:${AURA}" stroke-opacity="${op == null ? 1 : op}" stroke-width="${w || 1}" ${VE}`;
  const safeId = (v) => String(v == null ? '' : v).replace(/[^a-z0-9_-]/gi, '');
  const idOf = (x, fallback) => {
    if (typeof x === 'string') return safeId(x) || fallback;
    if (x && typeof x === 'object' && x.id) return safeId(x.id) || fallback;
    return fallback;
  };

  /* Layer 2 - parametric body rigs */
  const RIG_SPECS = {
    'half-orc': { neckY: 110, shoulderHalf: 66, waistHalf: 42, hipHalf: 48, build: 'massive' },
    goliath: { neckY: 108, shoulderHalf: 66, waistHalf: 42, hipHalf: 48, build: 'massive' },
    dragonborn: { neckY: 112, shoulderHalf: 66, waistHalf: 42, hipHalf: 48, build: 'massive' },
    dwarf: { neckY: 138, shoulderHalf: 64, waistHalf: 49, hipHalf: 51, build: 'stout' },
    halfling: { neckY: 154, shoulderHalf: 42, waistHalf: 30, hipHalf: 34, build: 'compact' },
    gnome: { neckY: 154, shoulderHalf: 42, waistHalf: 30, hipHalf: 34, build: 'compact' },
    elf: { neckY: 114, shoulderHalf: 49, waistHalf: 32, hipHalf: 38, build: 'lean' },
    tabaxi: { neckY: 114, shoulderHalf: 49, waistHalf: 32, hipHalf: 38, build: 'lean' },
    human: { neckY: 122, shoulderHalf: 56, waistHalf: 37, hipHalf: 43, build: 'heroic' },
    'half-elf': { neckY: 122, shoulderHalf: 56, waistHalf: 37, hipHalf: 43, build: 'heroic' },
    tiefling: { neckY: 122, shoulderHalf: 56, waistHalf: 37, hipHalf: 43, build: 'heroic' },
    aasimar: { neckY: 122, shoulderHalf: 56, waistHalf: 37, hipHalf: 43, build: 'heroic' }
  };

  function buildRig(spec) {
    const { neckY, shoulderHalf: sh, waistHalf: wh, hipHalf: hh, build } = spec;
    const shY = neckY + 16;
    const span = CUT - shY;
    const waistY = shY + span * 0.44;
    const hipY = shY + span * 0.7;
    const armW = 9 + sh * 0.07;
    const handY = Math.min(hipY + 10, 292);
    const handOff = hh + 14 + (sh - 42) * 0.15;
    const elbowY = (shY + handY) / 2;
    return Object.freeze({
      cx: CX, neckY, shoulderHalf: sh, waistHalf: wh, hipHalf: hh, build,
      shY: n(shY), waistY: n(waistY), hipY: n(hipY), elbowY: n(elbowY), armW: n(armW),
      headTop: neckY - 54, headCY: neckY - 28,
      leftShoulder: [CX - sh, n(shY)],
      rightShoulder: [CX + sh, n(shY)],
      leftHand: [n(CX - handOff), n(handY)],
      rightHand: [n(CX + handOff), n(handY)],
      backTop: [n(CX + sh * 0.45), n(shY - 18)]
    });
  }

  const BODY_RIGS = {};
  Object.keys(RIG_SPECS).forEach((k) => { BODY_RIGS[k] = buildRig(RIG_SPECS[k]); });
  Object.freeze(BODY_RIGS);

  function torsoD(r, e, opt) {
    const o = opt || {};
    const nh = o.neckHalf == null ? 10 : o.neckHalf;
    const flare = o.flare || 0;
    const top = r.neckY + (o.topOff == null ? 4 : o.topOff);
    const sh = r.shoulderHalf + e;
    const wh = r.waistHalf + e;
    const hh = r.hipHalf + e;
    const { shY, waistY, hipY } = r;
    const side = (s) => {
      const X = (d) => n(CX + s * d);
      return { X };
    };
    const L = side(-1).X;
    const R = side(1).X;
    return `M${L(nh)} ${n(top)} C${L(nh + 8)} ${n(shY - 6)} ${L(sh - 10)} ${n(shY - 6)} ${L(sh)} ${n(shY + 8)} ` +
      `L${L(sh - 6)} ${n(shY + 34)} Q${L(wh + 3)} ${n((shY + 34 + waistY) / 2)} ${L(wh)} ${n(waistY)} ` +
      `Q${L(hh)} ${n((waistY + hipY) / 2 - 6)} ${L(hh)} ${n(hipY)} L${L(hh + 4 + flare)} ${CUT + 6} ` +
      `L${R(hh + 4 + flare)} ${CUT + 6} L${R(hh)} ${n(hipY)} Q${R(hh)} ${n((waistY + hipY) / 2 - 6)} ${R(wh)} ${n(waistY)} ` +
      `Q${R(wh + 3)} ${n((shY + 34 + waistY) / 2)} ${R(sh - 6)} ${n(shY + 34)} L${R(sh)} ${n(shY + 8)} ` +
      `C${R(sh - 10)} ${n(shY - 6)} ${R(nh + 8)} ${n(shY - 6)} ${R(nh)} ${n(top)} Z`;
  }

  function armD(r) {
    const sh = r.shoulderHalf;
    const w = r.armW;
    const [hx, hy] = r.leftHand;
    return `M${n(CX - sh + 8)} ${n(r.shY - 3)} C${n(CX - sh - w * 0.7)} ${n(r.shY)} ${n(CX - sh - w * 0.8)} ${n(r.shY + 18)} ${n(CX - sh - w * 0.55)} ${n(r.shY + 34)} ` +
      `L${n(CX - sh - 3)} ${n(r.elbowY)} L${n(hx - w * 0.5)} ${n(hy - 8)} L${n(hx + w * 0.5)} ${n(hy - 6)} ` +
      `L${n(CX - sh + w)} ${n(r.elbowY)} L${n(CX - sh + w + 3)} ${n(r.shY + 28)} Z`;
  }

  function handsSvg(r, skin) {
    const [hx, hy] = r.leftHand;
    const fist = `<path d="M${n(hx - 6)} ${n(hy - 7)} L${n(hx + 6)} ${n(hy - 6)} L${n(hx + 7)} ${n(hy + 4)} L${n(hx + 1)} ${n(hy + 8)} L${n(hx - 6)} ${n(hy + 4)} Z" fill="${skin}"/>` +
      `<path d="M${n(hx - 6)} ${n(hy + 4)} L${n(hx + 1)} ${n(hy + 8)}" stroke="#000" stroke-opacity="0.4" stroke-width="1" ${VE}/>`;
    return both(fist);
  }

  /* Shared garment helpers */
  function garment(r, fill, e, opt, uid) {
    const d = torsoD(r, e, opt);
    return `<path d="${d}" fill="${fill}"/><path d="${d}" fill="url(#shade-${uid})"/>` +
      `<path d="${d}" ${auraStroke(0.35, 0.9)}/>`;
  }

  function pauldron(r, fill, trim, lames, lift) {
    const sh = r.shoulderHalf;
    const y = r.shY;
    const up = lift || 0;
    let s = '';
    for (let i = lames - 1; i >= 0; i -= 1) {
      const dy = i * 7;
      s += `<path d="M${n(CX - sh + 18)} ${n(y - 8 - up + dy)} C${n(CX - sh - 4)} ${n(y - 12 - up + dy)} ${n(CX - sh - 16)} ${n(y + 2 + dy)} ${n(CX - sh - 14)} ${n(y + 18 + dy)} ` +
        `L${n(CX - sh + 6)} ${n(y + 12 + dy)} Z" fill="${fill}" stroke="${trim}" stroke-width="1" ${VE}/>`;
    }
    s += `<path d="M${n(CX - sh - 12)} ${n(y + 4 - up)} C${n(CX - sh - 6)} ${n(y - 6 - up)} ${n(CX - sh + 6)} ${n(y - 9 - up)} ${n(CX - sh + 16)} ${n(y - 8 - up)}" ${auraStroke(0.6, 1)}/>`;
    return both(s);
  }

  function beltSvg(r, y, color, buckle) {
    const wh = r.waistHalf + 2;
    return `<path d="M${n(CX - wh)} ${n(y - 4)} L${n(CX + wh)} ${n(y - 4)} L${n(CX + wh + 1)} ${n(y + 4)} L${n(CX - wh - 1)} ${n(y + 4)} Z" fill="${color}"/>` +
      `<rect x="${n(CX - 5)}" y="${n(y - 5)}" width="10" height="10" fill="none" stroke="${buckle}" stroke-width="1.6" ${VE}/>`;
  }

  function strapSvg(r, color, w, fromRight) {
    const sh = r.shoulderHalf;
    const s = fromRight ? 1 : -1;
    const x1 = CX + s * (sh - 12);
    const x2 = CX - s * (r.waistHalf - 2);
    const y1 = r.shY - 2;
    const y2 = r.waistY - 4;
    return `<path d="M${n(x1 - w / 2)} ${n(y1)} L${n(x1 + w / 2)} ${n(y1 + 2)} L${n(x2 + w / 2)} ${n(y2 + 2)} L${n(x2 - w / 2)} ${n(y2)} Z" fill="${color}" stroke="#000" stroke-opacity="0.35" stroke-width="0.8" ${VE}/>`;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* Head-local hoods, all coordinates relative to the neck socket */
  const HOOD_OPENING = 'M-20 -26 C-20 -38 -12 -44 -4 -42 L0 -33 L4 -42 C12 -44 20 -38 20 -26 C20 -14 14 -4 6 2 L-6 2 C-14 -4 -20 -14 -20 -26 Z';
  function hoodSvg(kind, fill, fill2, uid) {
    let outer;
    let opening = HOOD_OPENING;
    if (kind === 'assassin') {
      outer = 'M0 -68 L7 -59 C22 -57 31 -44 31 -26 C31 -10 27 2 21 12 L34 24 L-34 24 L-21 12 C-27 2 -31 -10 -31 -26 C-31 -44 -22 -57 -7 -59 Z';
    } else if (kind === 'cowl') {
      outer = 'M0 -64 C20 -64 32 -48 32 -28 C32 -10 28 4 22 12 L36 26 L-36 26 L-22 12 C-28 4 -32 -10 -32 -28 C-32 -48 -20 -64 0 -64 Z';
      opening = 'M-20 -26 C-20 -40 -11 -45 0 -45 C11 -45 20 -40 20 -26 C20 -14 14 -4 6 2 L-6 2 C-14 -4 -20 -14 -20 -26 Z';
    } else {
      outer = 'M0 -74 L8 -60 L18 -62 L22 -52 L32 -46 L30 -34 L36 -22 L28 -12 L32 2 L24 10 L38 26 L-38 26 L-24 10 L-32 2 L-28 -12 L-36 -22 L-30 -34 L-32 -46 L-22 -52 L-18 -62 L-8 -60 Z';
      opening = 'M-20 -26 C-20 -38 -12 -44 -5 -43 L0 -36 L5 -43 C12 -44 20 -38 20 -26 C20 -14 14 -4 6 2 L-6 2 C-14 -4 -20 -14 -20 -26 Z';
    }
    return `<path d="${outer} ${opening}" fill="${fill}" fill-rule="evenodd"/>` +
      `<path d="${outer} ${opening}" fill="url(#shade-${uid})" fill-rule="evenodd"/>` +
      `<path d="${opening}" fill="url(#hoodShadow-${uid})"/>` +
      `<path d="M-31 -26 C-31 -10 -27 2 -21 12" fill="none" stroke="${fill2}" stroke-width="2" ${VE}/>` +
      `<path d="${outer}" ${auraStroke(0.55, 1)}/>` +
      `<path d="M8 -58 C22 -54 30 -42 30 -26" ${auraStroke(0.8, 1.2)}/>`;
  }

  /* Layer 3 - class outfits */
  const CLASS_OUTFITS = {
    rogue: {
      name: 'Assassin Hood & Cape', sleeve: '#232733', hooded: true,
      torso: (r, ctx) => {
        const sh = r.shoulderHalf;
        return garment(r, '#2a2e38', 1, { flare: 6 }, ctx.uid) +
          `<path d="M${CX - 11} ${r.neckY + 4} L${CX} ${n(r.shY + 32)} L${CX + 11} ${r.neckY + 4} Z" fill="#c9c3b4"/>` +
          `<path d="M${CX} ${n(r.waistY + 6)} L${CX - 2} ${CUT + 4}" stroke="#0d0f14" stroke-width="2" ${VE}/>` +
          strapSvg(r, '#4a3424', 6, true) +
          `<rect x="${n(CX + 2)}" y="${n(lerp(r.shY, r.waistY, 0.45))}" width="5" height="11" fill="#9aa3ad" transform="rotate(-35 ${CX + 4} ${n(lerp(r.shY, r.waistY, 0.45))})"/>` +
          `<path d="M${n(CX - r.waistHalf - 1)} ${n(r.waistY - 6)} L${n(CX + r.waistHalf + 1)} ${n(r.waistY - 6)} L${n(CX + r.waistHalf + 2)} ${n(r.waistY + 6)} L${n(CX - r.waistHalf - 2)} ${n(r.waistY + 6)} Z" fill="#8a1f24"/>` +
          `<path d="M${n(CX - 8)} ${n(r.waistY + 6)} L${n(CX - 14)} ${n(r.waistY + 40)} L${n(CX - 4)} ${n(r.waistY + 36)} Z" fill="#6d171b"/>` +
          `<path d="M${CX - 10} ${n(r.shY - 6)} L${n(CX - sh - 14)} ${n(r.shY + 2)} L${n(CX - sh - 20)} ${n(r.hipY + 18)} L${n(CX - sh + 6)} ${n(r.hipY + 4)} L${n(CX - r.waistHalf + 4)} ${n(r.waistY - 14)} Z" fill="#1b1e26"/>` +
          `<path d="M${n(CX - sh - 14)} ${n(r.shY + 2)} L${n(CX - sh - 20)} ${n(r.hipY + 18)}" ${auraStroke(0.5, 1)}/>` +
          `<path d="M${n(CX - sh - 20)} ${n(r.hipY + 18)} L${n(CX - sh + 6)} ${n(r.hipY + 4)}" stroke="#8a1f24" stroke-width="2" ${VE}/>`;
      },
      head: (r, ctx) => hoodSvg('assassin', '#2a2e38', '#8a1f24', ctx.uid)
    },
    ranger: {
      name: 'Woodland Cowl & Cloak', sleeve: '#2b3526', hooded: true,
      back: (r) => {
        const sh = r.shoulderHalf;
        return `<path d="M${CX - 20} ${n(r.shY - 8)} L${n(CX - sh - 22)} ${n(r.shY + 10)} L${n(CX - sh - 30)} ${CUT + 6} L${n(CX + sh + 30)} ${CUT + 6} L${n(CX + sh + 22)} ${n(r.shY + 10)} L${CX + 20} ${n(r.shY - 8)} Z" fill="#1f281c"/>` +
          `<path d="M${n(CX - sh - 22)} ${n(r.shY + 10)} L${n(CX - sh - 30)} ${CUT + 6}" ${auraStroke(0.35, 1)}/>`;
      },
      torso: (r, ctx) => {
        const sh = r.shoulderHalf;
        let fur = `M${n(CX - sh - 6)} ${n(r.shY + 10)}`;
        for (let i = 0; i <= 8; i += 1) {
          const x = CX - sh - 6 + ((sh + 6) * 2 * i) / 8;
          fur += ` L${n(x)} ${n(r.shY + (i % 2 ? 18 : 10))}`;
        }
        fur += ` L${n(CX + sh + 6)} ${n(r.shY - 4)} L${n(CX - sh - 6)} ${n(r.shY - 4)} Z`;
        const [lx, ly] = r.leftHand;
        const [rx, ry] = r.rightHand;
        return garment(r, '#3a2c20', 0, {}, ctx.uid) +
          `<path d="M${CX - 9} ${r.neckY + 4} L${CX} ${n(r.shY + 26)} L${CX + 9} ${r.neckY + 4} Z" fill="#2f3a2a"/>` +
          beltSvg(r, r.waistY, '#5a3d24', '#b08d4a') +
          strapSvg(r, '#5b3f26', 6, true) +
          `<path d="${fur}" fill="#8c7a63"/>` +
          `<circle cx="${CX}" cy="${n(r.shY + 2)}" r="5" fill="#b08d4a" stroke="#3a2c20" stroke-width="1" ${VE}/>` +
          `<rect x="${n(lx - 7)}" y="${n(ly - 30)}" width="14" height="18" rx="2" fill="#5b3f26"/>` +
          `<rect x="${n(rx - 7)}" y="${n(ry - 30)}" width="14" height="18" rx="2" fill="#5b3f26"/>`;
      },
      head: (r, ctx) => hoodSvg('cowl', '#2f3a2a', '#1f281c', ctx.uid)
    },
    barbarian: {
      name: 'War-Harness & Fur Pelt', sleeve: null, bare: true, hooded: false,
      back: (r) => {
        const sh = r.shoulderHalf;
        return `<path d="M${n(CX - sh - 10)} ${n(r.shY - 4)} L${n(CX - sh - 18)} ${n(r.hipY)} L${n(CX - sh - 8)} ${n(r.hipY - 10)} L${n(CX - sh - 12)} ${n(r.hipY + 14)} L${n(CX + sh + 12)} ${n(r.hipY + 14)} L${n(CX + sh + 8)} ${n(r.hipY - 10)} L${n(CX + sh + 18)} ${n(r.hipY)} L${n(CX + sh + 10)} ${n(r.shY - 4)} Z" fill="#4e4134"/>`;
      },
      torso: (r, ctx) => {
        const sh = r.shoulderHalf;
        const wh = r.waistHalf;
        const pecY = r.shY + 22;
        let fur = `M${n(CX - sh - 10)} ${n(r.shY + 12)}`;
        for (let i = 0; i <= 10; i += 1) {
          const x = CX - sh - 10 + ((sh + 10) * 2 * i) / 10;
          fur += ` L${n(x)} ${n(r.shY + (i % 2 ? 16 : 6) - (i > 2 && i < 8 ? 10 : 0))}`;
        }
        fur += ` L${n(CX + sh)} ${n(r.shY - 10)} L${n(CX - sh)} ${n(r.shY - 10)} Z`;
        const kilt = `M${n(CX - wh - 3)} ${n(r.waistY)} L${n(CX + wh + 3)} ${n(r.waistY)} L${n(CX + r.hipHalf + 8)} ${CUT + 6} L${n(CX - r.hipHalf - 8)} ${CUT + 6} Z`;
        let tassets = '';
        for (let i = -2; i <= 2; i += 1) {
          tassets += `<path d="M${n(CX + i * (wh / 2.4))} ${n(r.waistY + 6)} L${n(CX + i * (r.hipHalf / 2.2))} ${CUT + 4}" stroke="#2a1d14" stroke-width="1.2" ${VE}/>`;
        }
        return `<path d="M${n(CX - 22)} ${n(pecY - 4)} C${n(CX - 12)} ${n(pecY + 12)} ${n(CX - 4)} ${n(pecY + 12)} ${CX} ${n(pecY + 6)} C${n(CX + 4)} ${n(pecY + 12)} ${n(CX + 12)} ${n(pecY + 12)} ${n(CX + 22)} ${n(pecY - 4)}" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="1.4" ${VE}/>` +
          `<path d="M${CX} ${n(pecY + 10)} L${CX} ${n(r.waistY - 4)} M${n(CX - 9)} ${n(pecY + 24)} L${n(CX + 9)} ${n(pecY + 24)} M${n(CX - 8)} ${n(pecY + 36)} L${n(CX + 8)} ${n(pecY + 36)}" stroke="#000" stroke-opacity="0.3" stroke-width="1" ${VE}/>` +
          `<path d="M${n(CX + 6)} ${n(pecY - 2)} L${n(CX + 22)} ${n(pecY + 16)} M${n(CX + 10)} ${n(pecY - 4)} L${n(CX + 24)} ${n(pecY + 10)} M${n(CX - 18)} ${n(pecY + 20)} L${n(CX - 6)} ${n(pecY + 32)}" stroke="#e8d6c4" stroke-opacity="0.55" stroke-width="1" ${VE}/>` +
          `<path d="${kilt}" fill="#4a3426"/><path d="${kilt}" fill="url(#shade-${ctx.uid})"/>${tassets}` +
          beltSvg(r, r.waistY, '#2e2018', '#8d8f99') +
          strapSvg(r, '#3b2a1e', 8, false) +
          `<circle cx="${n(CX - 4)}" cy="${n(lerp(r.shY, r.waistY, 0.5))}" r="4" fill="#7d7f85"/>` +
          `<path d="${fur}" fill="#6b5a48"/><path d="${fur}" ${auraStroke(0.35, 0.8)}/>` +
          `<path d="M${n(CX + sh - 16)} ${n(r.shY - 8)} C${n(CX + sh + 6)} ${n(r.shY - 14)} ${n(CX + sh + 16)} ${n(r.shY + 2)} ${n(CX + sh + 14)} ${n(r.shY + 18)} L${n(CX + sh - 6)} ${n(r.shY + 12)} Z" fill="#5d6068" stroke="#2a2c31" stroke-width="1" ${VE}/>` +
          `<path d="M${n(CX + sh - 6)} ${n(r.shY - 10)} L${n(CX + sh - 2)} ${n(r.shY - 26)} L${n(CX + sh + 2)} ${n(r.shY - 9)} M${n(CX + sh + 6)} ${n(r.shY - 7)} L${n(CX + sh + 16)} ${n(r.shY - 20)} L${n(CX + sh + 12)} ${n(r.shY - 2)} M${n(CX + sh + 13)} ${n(r.shY + 4)} L${n(CX + sh + 26)} ${n(r.shY - 4)} L${n(CX + sh + 15)} ${n(r.shY + 11)}" fill="#a8acb4" stroke="#2a2c31" stroke-width="0.8" ${VE}/>`;
      }
    },
    fighter: {
      name: 'Steel Pauldrons & Surcoat', sleeve: '#4f555e', hooded: false,
      torso: (r, ctx) => {
        const wh = r.waistHalf;
        const plate = `M${CX - 14} ${n(r.shY - 2)} L${CX + 14} ${n(r.shY - 2)} L${n(CX + r.shoulderHalf - 10)} ${n(r.shY + 10)} L${n(CX + wh + 2)} ${n(r.waistY - 4)} L${CX} ${n(r.waistY + 4)} L${n(CX - wh - 2)} ${n(r.waistY - 4)} L${n(CX - r.shoulderHalf + 10)} ${n(r.shY + 10)} Z`;
        const coat = `M${n(CX - wh - 2)} ${n(r.waistY)} L${n(CX + wh + 2)} ${n(r.waistY)} L${n(CX + r.hipHalf + 6)} ${CUT + 6} L${n(CX - r.hipHalf - 6)} ${CUT + 6} Z`;
        return garment(r, '#4f555e', 0, {}, ctx.uid) +
          `<path d="${coat}" fill="#5a1e1e"/><path d="${coat}" fill="url(#shade-${ctx.uid})"/>` +
          `<path d="M${CX} ${n(r.waistY + 6)} L${CX} ${CUT + 4}" stroke="#b08d4a" stroke-width="2" ${VE}/>` +
          `<path d="${plate}" fill="#7a838f"/><path d="${plate}" fill="url(#shade-${ctx.uid})"/>` +
          `<path d="M${CX} ${n(r.shY)} L${CX} ${n(r.waistY + 2)}" stroke="#cfd5dc" stroke-opacity="0.7" stroke-width="1" ${VE}/>` +
          `<path d="${plate}" ${auraStroke(0.5, 1)}/>` +
          beltSvg(r, r.waistY + 2, '#2e2018', '#b08d4a') +
          `<path d="M${CX - 16} ${n(r.neckY + 2)} C${CX - 16} ${n(r.shY + 2)} ${CX + 16} ${n(r.shY + 2)} ${CX + 16} ${n(r.neckY + 2)} L${CX + 12} ${n(r.neckY - 4)} L${CX - 12} ${n(r.neckY - 4)} Z" fill="#8a929d" stroke="#3a3f46" stroke-width="1" ${VE}/>` +
          `<path d="M${CX - 15} ${n(r.neckY + 6)} C${CX - 8} ${n(r.neckY + 11)} ${CX + 8} ${n(r.neckY + 11)} ${CX + 15} ${n(r.neckY + 6)}" stroke="#3a3f46" stroke-width="1" fill="none" ${VE}/>` +
          pauldron(r, '#7a838f', '#3a3f46', 3, 0);
      }
    },
    paladin: {
      name: 'Cathedral Plate & Oath Tabard', sleeve: '#6d7480', hooded: false,
      preHead: (r) => {
        const sh = r.shoulderHalf;
        const wing = `<path d="M${n(CX - sh + 6)} ${n(r.shY - 6)} C${n(CX - sh - 6)} ${n(r.shY - 24)} ${n(CX - sh - 14)} ${n(r.shY - 36)} ${n(CX - sh - 10)} ${n(r.shY - 46)} L${n(CX - sh - 2)} ${n(r.shY - 30)} L${n(CX - sh + 2)} ${n(r.shY - 40)} L${n(CX - sh + 8)} ${n(r.shY - 22)} L${n(CX - sh + 14)} ${n(r.shY - 30)} L${n(CX - sh + 16)} ${n(r.shY - 8)} Z" fill="#c9a24a" stroke="#5e4a1e" stroke-width="0.8" ${VE}/>`;
        return both(wing);
      },
      torso: (r, ctx) => {
        const wh = r.waistHalf;
        const tab = `M${CX - 14} ${n(r.shY + 8)} L${CX + 14} ${n(r.shY + 8)} L${CX + 16} ${CUT + 6} L${CX - 16} ${CUT + 6} Z`;
        return garment(r, '#8a919c', 0, {}, ctx.uid) +
          `<path d="M${n(CX - wh)} ${n(r.waistY - 20)} Q${CX} ${n(r.waistY - 8)} ${n(CX + wh)} ${n(r.waistY - 20)} M${n(CX - wh)} ${n(r.waistY - 8)} Q${CX} ${n(r.waistY + 4)} ${n(CX + wh)} ${n(r.waistY - 8)}" stroke="#4b515a" stroke-width="1" fill="none" ${VE}/>` +
          `<path d="${tab}" fill="#2c3a5c"/><path d="${tab}" fill="none" stroke="#c9a24a" stroke-width="1.4" ${VE}/>` +
          `<circle cx="${CX}" cy="${n(r.shY + 36)}" r="9" fill="#c9a24a"/>` +
          `<path d="M${CX} ${n(r.shY + 22)} L${CX} ${n(r.shY + 50)} M${CX - 14} ${n(r.shY + 36)} L${CX + 14} ${n(r.shY + 36)}" stroke="#c9a24a" stroke-width="1.4" ${VE}/>` +
          `<circle cx="${CX}" cy="${n(r.shY + 36)}" r="4" ${auraFill(0.9)}/>` +
          beltSvg(r, r.waistY, '#3a2b1c', '#c9a24a') +
          `<path d="M${CX - 15} ${n(r.neckY + 2)} C${CX - 15} ${n(r.shY + 2)} ${CX + 15} ${n(r.shY + 2)} ${CX + 15} ${n(r.neckY + 2)} L${CX + 11} ${n(r.neckY - 4)} L${CX - 11} ${n(r.neckY - 4)} Z" fill="#9aa1ab" stroke="#c9a24a" stroke-width="1" ${VE}/>` +
          pauldron(r, '#9aa1ab', '#c9a24a', 3, 6);
      }
    },
    cleric: {
      name: 'Liturgical Mantle & Scale', sleeve: '#4e3d2c', hooded: false,
      torso: (r, ctx) => {
        const sh = r.shoulderHalf;
        let scales = '';
        for (let row = 0; row < 5; row += 1) {
          const y = r.shY + 18 + row * 8;
          for (let i = -3; i <= 3; i += 1) {
            const x = CX + i * 8 + (row % 2 ? 4 : 0);
            scales += `<path d="M${n(x - 4)} ${n(y)} Q${n(x)} ${n(y + 7)} ${n(x + 4)} ${n(y)}" fill="none" stroke="#3d434c" stroke-width="0.8" ${VE}/>`;
          }
        }
        const mantle = `M${CX - 12} ${n(r.neckY + 2)} L${n(CX - sh - 8)} ${n(r.shY + 6)} L${n(CX - sh - 4)} ${n(r.shY + 26)} Q${CX} ${n(r.shY + 44)} ${n(CX + sh + 4)} ${n(r.shY + 26)} L${n(CX + sh + 8)} ${n(r.shY + 6)} L${CX + 12} ${n(r.neckY + 2)} Z`;
        return garment(r, '#6d7480', 0, { flare: 4 }, ctx.uid) +
          `<g clip-path="url(#torso-${ctx.uid})">${scales}</g>` +
          `<path d="M${n(CX - r.waistHalf - 1)} ${n(r.waistY)} L${n(CX + r.waistHalf + 1)} ${n(r.waistY)} L${n(CX + r.hipHalf + 8)} ${CUT + 6} L${n(CX - r.hipHalf - 8)} ${CUT + 6} Z" fill="#d9cfb6"/>` +
          `<path d="${mantle}" fill="#e6dcc4"/><path d="${mantle}" fill="url(#shade-${ctx.uid})"/><path d="${mantle}" ${auraStroke(0.45, 1)}/>` +
          `<path d="M${CX - 14} ${n(r.shY + 4)} L${CX - 12} ${CUT + 6} L${CX - 4} ${CUT + 6} L${CX - 6} ${n(r.shY + 4)} Z M${CX + 6} ${n(r.shY + 4)} L${CX + 4} ${CUT + 6} L${CX + 12} ${CUT + 6} L${CX + 14} ${n(r.shY + 4)} Z" fill="#7a2230"/>` +
          `<path d="M${CX - 9} ${n(r.waistY + 18)} L${CX - 9} ${n(r.waistY + 30)} M${CX - 13} ${n(r.waistY + 23)} L${CX - 5} ${n(r.waistY + 23)} M${CX + 9} ${n(r.waistY + 18)} L${CX + 9} ${n(r.waistY + 30)} M${CX + 5} ${n(r.waistY + 23)} L${CX + 13} ${n(r.waistY + 23)}" stroke="#c9a24a" stroke-width="1.4" ${VE}/>` +
          beltSvg(r, r.waistY, '#3a2b1c', '#c9a24a') +
          `<path d="M${CX - 13} ${n(r.neckY + 1)} C${CX - 8} ${n(r.neckY + 9)} ${CX + 8} ${n(r.neckY + 9)} ${CX + 13} ${n(r.neckY + 1)}" ${auraStroke(0.95, 2.2)} filter="url(#glow-${ctx.uid})"/>`;
      }
    },
    wizard: {
      name: 'Archmage Collar & Rune Robes', sleeve: '#1f2843', hooded: false,
      preHead: (r) => {
        return `<path d="M${CX - 12} ${n(r.neckY + 4)} L${CX - 30} ${n(r.neckY - 34)} L${CX - 22} ${n(r.neckY - 30)} L${CX - 16} ${n(r.neckY - 6)} Z M${CX + 12} ${n(r.neckY + 4)} L${CX + 30} ${n(r.neckY - 34)} L${CX + 22} ${n(r.neckY - 30)} L${CX + 16} ${n(r.neckY - 6)} Z" fill="#2b3760" stroke="${'#c9a24a'}" stroke-width="1" ${VE}/>` +
          `<path d="M${CX - 30} ${n(r.neckY - 34)} L${CX - 22} ${n(r.neckY - 30)} M${CX + 30} ${n(r.neckY - 34)} L${CX + 22} ${n(r.neckY - 30)}" ${auraStroke(0.9, 1.2)}/>`;
      },
      torso: (r, ctx) => {
        const inner = `M${CX - 10} ${n(r.neckY + 4)} L${CX + 10} ${n(r.neckY + 4)} L${CX + 16} ${CUT + 6} L${CX - 16} ${CUT + 6} Z`;
        let runes = '';
        for (let y = r.shY + 10; y < CUT; y += 14) {
          runes += `<path d="M${CX - 19} ${n(y)} L${CX - 16} ${n(y + 5)} L${CX - 19} ${n(y + 10)} M${CX + 19} ${n(y)} L${CX + 16} ${n(y + 5)} L${CX + 19} ${n(y + 10)}" ${auraStroke(0.85, 1)}/>`;
        }
        return garment(r, '#25304f', 1, { flare: 10 }, ctx.uid) +
          `<path d="${inner}" fill="#151b2e"/>` +
          `<path d="M${CX - 15} ${n(r.neckY + 4)} L${CX - 21} ${CUT + 6} M${CX + 15} ${n(r.neckY + 4)} L${CX + 21} ${CUT + 6}" stroke="#c9a24a" stroke-width="1.6" ${VE}/>` +
          runes +
          `<path d="M${n(CX - r.waistHalf)} ${n(r.waistY)} L${n(CX + r.waistHalf)} ${n(r.waistY)}" stroke="#7a2230" stroke-width="5" ${VE}/>` +
          `<path d="M${CX - 10} ${n(r.neckY + 4)} L${n(CX - r.shoulderHalf + 6)} ${n(r.shY + 10)} M${CX + 10} ${n(r.neckY + 4)} L${n(CX + r.shoulderHalf - 6)} ${n(r.shY + 10)}" stroke="#3b4a7a" stroke-width="2" ${VE}/>`;
      }
    },
    sorcerer: {
      name: 'Tempest Coat & Mana Veins', sleeve: '#2f1825', hooded: false,
      torso: (r, ctx) => {
        const shirt = `M${CX - 12} ${n(r.neckY + 4)} L${CX + 12} ${n(r.neckY + 4)} L${CX + 6} ${n(r.waistY + 10)} L${CX - 6} ${n(r.waistY + 10)} Z`;
        const lapL = `M${CX - 12} ${n(r.neckY + 2)} L${CX - 26} ${n(r.neckY - 6)} L${CX - 24} ${n(r.shY + 14)} L${CX - 7} ${n(r.waistY + 8)} Z`;
        return garment(r, '#3b1f2f', 1, { flare: 8 }, ctx.uid) +
          `<path d="${shirt}" fill="#120a10"/>` +
          `<path d="M${CX - 4} ${n(r.shY + 4)} L${CX + 3} ${n(r.shY + 16)} L${CX - 3} ${n(r.shY + 26)} L${CX + 4} ${n(r.shY + 40)} M${n(CX - r.waistHalf + 6)} ${n(r.waistY + 14)} L${n(CX - r.waistHalf + 12)} ${n(r.waistY + 30)} L${n(CX - r.waistHalf + 8)} ${n(r.waistY + 44)} M${n(CX + r.waistHalf - 6)} ${n(r.shY + 30)} L${n(CX + r.waistHalf - 12)} ${n(r.shY + 44)} L${n(CX + r.waistHalf - 8)} ${n(r.waistY)}" ${auraStroke(0.95, 1.3)} filter="url(#glow-${ctx.uid})"/>` +
          `<path d="${lapL}" fill="#4f2a3e"/>` + mir(`<path d="${lapL}" fill="#4f2a3e"/>`) +
          `<path d="M${CX - 26} ${n(r.neckY - 6)} L${CX - 24} ${n(r.shY + 14)} M${CX + 26} ${n(r.neckY - 6)} L${CX + 24} ${n(r.shY + 14)}" ${auraStroke(0.7, 1)}/>` +
          `<path d="M${CX} ${n(r.waistY + 10)} L${CX - 3} ${CUT + 4}" stroke="#120a10" stroke-width="2" ${VE}/>` +
          beltSvg(r, r.waistY + 4, '#1d1016', '#8d8f99');
      }
    },
    warlock: {
      name: 'Occult Cowl & Pact Chains', sleeve: '#1a1520', hooded: true,
      torso: (r, ctx) => {
        const sh = r.shoulderHalf;
        let mantle = `M${CX - 12} ${n(r.neckY)} L${n(CX - sh - 10)} ${n(r.shY + 4)}`;
        for (let i = 0; i <= 10; i += 1) {
          const x = CX - sh - 10 + ((sh + 10) * 2 * i) / 10;
          mantle += ` L${n(x)} ${n(r.shY + (i % 2 ? 24 : 40) + (i === 5 ? 10 : 0))}`;
        }
        mantle += ` L${n(CX + sh + 10)} ${n(r.shY + 4)} L${CX + 12} ${n(r.neckY)} Z`;
        let chain = '';
        for (let i = 0; i <= 8; i += 1) {
          const t = i / 8;
          const x = lerp(CX - sh + 8, CX + sh - 8, t);
          const y = r.shY + 34 + Math.sin(t * Math.PI) * 14;
          chain += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="3" ry="2" fill="none" stroke="#8d8f99" stroke-width="1" ${VE}/>`;
        }
        return garment(r, '#1d1824', 1, { flare: 8 }, ctx.uid) +
          `<path d="M${CX} ${n(r.shY + 10)} L${CX - 2} ${CUT + 4}" stroke="#5c2a6b" stroke-width="2" ${VE}/>` +
          `<path d="${mantle}" fill="#120f17"/><path d="${mantle}" ${auraStroke(0.4, 0.8)}/>` +
          chain +
          `<path d="M${CX} ${n(r.shY + 40)} L${CX + 7} ${n(r.shY + 48)} L${CX} ${n(r.shY + 56)} L${CX - 7} ${n(r.shY + 48)} Z" fill="#5c2a6b" stroke="#8d8f99" stroke-width="1" ${VE}/>` +
          `<circle cx="${CX}" cy="${n(r.shY + 48)}" r="2.4" ${auraFill(1)} filter="url(#glow-${ctx.uid})"/>` +
          beltSvg(r, r.waistY, '#0d0b10', '#5c2a6b');
      },
      head: (r, ctx) => hoodSvg('occult', '#1d1824', '#5c2a6b', ctx.uid)
    },
    bard: {
      name: 'Duelist Cape & Doublet', sleeve: '#4a1c2c', hooded: false,
      preHead: (r) => `<path d="M${CX - 11} ${n(r.neckY + 4)} L${CX - 18} ${n(r.neckY - 12)} L${CX + 18} ${n(r.neckY - 12)} L${CX + 11} ${n(r.neckY + 4)} Z" fill="#5a2134" stroke="#c9a24a" stroke-width="1" ${VE}/>`,
      torso: (r, ctx) => {
        const sh = r.shoulderHalf;
        let stitch = '';
        for (let y = r.shY + 12; y < r.waistY; y += 10) {
          stitch += `<path d="M${CX - 12} ${n(y)} L${CX} ${n(y + 5)} L${CX + 12} ${n(y)}" fill="none" stroke="#c9a24a" stroke-opacity="0.7" stroke-width="0.9" ${VE}/>`;
        }
        const cape = `M${CX + 8} ${n(r.shY - 6)} L${n(CX + sh + 16)} ${n(r.shY + 2)} L${n(CX + sh + 24)} ${n(r.hipY + 22)} L${n(CX + sh - 6)} ${n(r.hipY + 10)} L${n(CX + r.waistHalf - 2)} ${n(r.waistY - 12)} Z`;
        return garment(r, '#5a2134', 0, { flare: 4 }, ctx.uid) +
          stitch +
          `<path d="M${n(CX - r.waistHalf - 1)} ${n(r.waistY)} L${n(CX + r.waistHalf + 1)} ${n(r.waistY)} L${n(CX + r.hipHalf + 6)} ${CUT + 6} L${n(CX - r.hipHalf - 6)} ${CUT + 6} Z" fill="#2a2030"/>` +
          beltSvg(r, r.waistY, '#1d1016', '#c9a24a') +
          `<path d="${cape}" fill="#2b1a3a"/><path d="${cape}" fill="url(#shade-${ctx.uid})"/><path d="${cape}" ${auraStroke(0.5, 1)}/>` +
          `<circle cx="${CX + 10}" cy="${n(r.shY + 2)}" r="5" fill="#c9a24a"/><circle cx="${CX + 10}" cy="${n(r.shY + 2)}" r="2.2" ${auraFill(1)}/>`;
      }
    },
    monk: {
      name: 'Martial Gi & Prayer Beads', sleeve: null, bare: true, hooded: false,
      torso: (r, ctx) => {
        const gi = torsoD(r, -4, { neckHalf: 8 });
        const [lx, ly] = r.leftHand;
        const [rx, ry] = r.rightHand;
        let beads = '';
        for (let i = 0; i <= 12; i += 1) {
          const a = Math.PI * (0.1 + 0.8 * (i / 12));
          beads += `<circle cx="${n(CX - Math.cos(a) * 24)}" cy="${n(r.neckY + 2 + Math.sin(a) * 18)}" r="2" fill="#6b3a1e" stroke="#000" stroke-opacity="0.4" stroke-width="0.5" ${VE}/>`;
        }
        const wraps = (x, y) => `<path d="M${n(x - 6)} ${n(y - 28)} L${n(x + 6)} ${n(y - 26)} M${n(x - 6)} ${n(y - 22)} L${n(x + 6)} ${n(y - 20)} M${n(x - 6)} ${n(y - 16)} L${n(x + 6)} ${n(y - 14)}" stroke="#d8cdb5" stroke-width="3" ${VE}/>`;
        return `<path d="${gi}" fill="#a8572a"/><path d="${gi}" fill="url(#shade-${ctx.uid})"/><path d="${gi}" ${auraStroke(0.35, 0.8)}/>` +
          `<path d="M${CX - 16} ${n(r.neckY + 4)} L${CX + 8} ${n(r.waistY)} M${CX + 16} ${n(r.neckY + 4)} L${CX - 4} ${n(r.waistY - 12)}" stroke="#d8cdb5" stroke-width="4" ${VE}/>` +
          `<path d="M${n(CX - r.waistHalf + 2)} ${n(r.waistY - 4)} L${n(CX + r.waistHalf - 2)} ${n(r.waistY - 4)} L${n(CX + r.waistHalf - 2)} ${n(r.waistY + 5)} L${n(CX - r.waistHalf + 2)} ${n(r.waistY + 5)} Z" fill="#1c1a20"/>` +
          `<path d="M${CX + 8} ${n(r.waistY + 4)} L${CX + 4} ${n(r.waistY + 30)} M${CX + 12} ${n(r.waistY + 4)} L${CX + 16} ${n(r.waistY + 26)}" stroke="#1c1a20" stroke-width="3" ${VE}/>` +
          wraps(lx, ly) + wraps(rx, ry) + beads;
      }
    },
    druid: {
      name: 'Bark Mantle & Antler Crown', sleeve: '#3d3326', hooded: false,
      preHead: (r) => {
        const sh = r.shoulderHalf;
        const ant = `<path d="M${n(CX - sh + 8)} ${n(r.shY - 4)} L${n(CX - sh - 2)} ${n(r.shY - 30)} L${n(CX - sh - 12)} ${n(r.shY - 38)} M${n(CX - sh - 2)} ${n(r.shY - 30)} L${n(CX - sh + 2)} ${n(r.shY - 48)} M${n(CX - sh + 2)} ${n(r.shY - 20)} L${n(CX - sh + 12)} ${n(r.shY - 32)}" fill="none" stroke="#d6c7a8" stroke-width="3" stroke-linecap="round" ${VE}/>`;
        return both(ant);
      },
      torso: (r, ctx) => {
        const sh = r.shoulderHalf;
        let mantle = `M${CX - 12} ${n(r.neckY)} L${n(CX - sh - 8)} ${n(r.shY + 2)}`;
        for (let i = 0; i <= 12; i += 1) {
          const x = CX - sh - 8 + ((sh + 8) * 2 * i) / 12;
          mantle += ` L${n(x)} ${n(r.shY + 22 + (i % 3) * 5)}`;
        }
        mantle += ` L${n(CX + sh + 8)} ${n(r.shY + 2)} L${CX + 12} ${n(r.neckY)} Z`;
        let leaves = '';
        for (let i = -3; i <= 3; i += 1) {
          const x = CX + i * 6;
          const y = r.neckY + 4 + Math.abs(i) * -1.4;
          leaves += `<path d="M${n(x)} ${n(y)} Q${n(x - 4)} ${n(y - 6)} ${n(x)} ${n(y - 12)} Q${n(x + 4)} ${n(y - 6)} ${n(x)} ${n(y)} Z" fill="#4e7a3a" stroke="#2c4a20" stroke-width="0.6" ${VE}/>`;
        }
        return garment(r, '#5b4a36', 1, { flare: 6 }, ctx.uid) +
          `<path d="M${CX} ${n(r.shY + 8)} L${CX - 3} ${CUT + 4} M${CX - 18} ${n(r.waistY + 10)} L${CX - 24} ${CUT + 4} M${CX + 18} ${n(r.waistY + 10)} L${CX + 22} ${CUT + 4}" stroke="#3d3326" stroke-width="1.4" ${VE}/>` +
          beltSvg(r, r.waistY, '#2c4a20', '#d6c7a8') +
          `<path d="${mantle}" fill="#3d3326"/><path d="${mantle}" ${auraStroke(0.4, 0.8)}/>` +
          leaves;
      }
    }
  };

  /* Layer 4 - constant base face, racial attachments */
  const SKIN = {
    human: { _: '#b98a6c' },
    elf: { _: '#d2b090', drow: '#3e3a4f', 'shadar-kai': '#8e95a3', sea: '#7fa3a8', astral: '#c8c2dd', eladrin: '#d9b8b0' },
    dwarf: { _: '#b07e5f', duergar: '#7c7f86' },
    halfling: { _: '#c49572' },
    dragonborn: { _: '#6c4d3a', chromatic: '#7a2e2e', metallic: '#9a7b3c', gem: '#4a6f8f', draconblood: '#5b2338', ravenite: '#2f2f36' },
    gnome: { _: '#c89a7b', deep: '#8a8f96' },
    tiefling: { _: '#8f3b3b', levistus: '#4f6b88', zariel: '#a5512f', glasya: '#7a3d5f', dispater: '#6d5a66', mephistopheles: '#5c3b6b', winged: '#7c2f3d' },
    'half-orc': { _: '#6f8a62', 'mark-finding': '#7b8a6a' },
    'half-elf': { _: '#c7a083', 'drow-heritage': '#5d566e', 'aquatic-heritage': '#8aa9a3' },
    goliath: { _: '#8d9198', fire: '#9a6a5a', frost: '#aab6c2', storm: '#6e7a8c', cloud: '#b8bccb', 'hill-giant': '#9a8a76' },
    aasimar: { _: '#e0c3a0', fallen: '#8d8291', scourge: '#f0d6b0' },
    tabaxi: { _: '#b08850', snow: '#d9d7d2' }
  };
  const skinFor = (spId, srId) => {
    const t = SKIN[spId] || SKIN.human;
    return t[srId] || t._;
  };

  const HEAD_D = 'M0 -54 C15 -54 23 -43 23 -29 C23 -19 20 -11 14 -5 L5 1 L-5 1 L-14 -5 C-20 -11 -23 -19 -23 -29 C-23 -43 -15 -54 0 -54 Z';
  const HAIR_D = 'M-23 -28 C-26 -50 -10 -60 2 -59 C17 -59 27 -48 23 -28 L20 -36 C15 -44 7 -46 0 -45 C-8 -45 -16 -42 -20 -34 Z';
  const LOCK_D = 'M2 -58 C14 -58 22 -50 22 -40 C16 -48 8 -50 -6 -46 Z';

  function faceSvg(skin, uid) {
    const eye = '<path d="M-13 -27.6 L-4.6 -28.6 L-5.6 -25.8 L-12.4 -26.2 Z"/>';
    return `<path d="M-8 -6 L-9 10 L9 10 L8 -6 Z" fill="${skin}"/><path d="M-8 -6 L-9 10 L0 10 L0 -2 Z" fill="#000" fill-opacity="0.3"/>` +
      `<path d="${HEAD_D}" fill="${skin}"/>` +
      `<path d="M0 -54 C-15 -54 -23 -43 -23 -29 C-23 -19 -20 -11 -14 -5 L-5 1 L0 1 L-2 -12 L0 -27 Z" fill="#000" fill-opacity="0.28"/>` +
      '<path d="M-21 -38 C-12 -42 12 -42 21 -38 L18 -32 C10 -34 4 -33 0 -31 C-4 -33 -10 -34 -18 -32 Z" fill="#000" fill-opacity="0.22"/>' +
      bothL('<path d="M-15.5 -30 L-3.5 -31 L-3.6 -24 L-14 -24.6 Z" fill="#000" fill-opacity="0.4"/>') +
      `<g ${auraFill(1)} filter="url(#glow-${uid})">${bothL(eye)}</g>` +
      `<path d="M1 -30 L3.4 -16 L-1 -14" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="0.9" ${VE}/>` +
      `<path d="M-1 -14 L-4 -15" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="0.9" ${VE}/>` +
      `<path d="M-5 -8 L5 -8.4" fill="none" stroke="#000" stroke-opacity="0.5" stroke-width="1" ${VE}/>` +
      `<path d="M15 -25 C19 -20 20 -14 14 -5 L5 1" ${auraStroke(0.75, 1.2)}/>` +
      `<path d="M9 -22 L16 -18" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="1" ${VE}/>` +
      `<path d="${HEAD_D}" fill="none" stroke="#000" stroke-opacity="0.5" stroke-width="0.8" ${VE}/>`;
  }

  const ROUND_EAR = bothL('<path d="M-22 -33 C-27 -32 -27 -23 -21 -21 Z"/>');
  const roundEars = (skin) => `<g fill="${skin}">${ROUND_EAR}</g>`;
  const pointEars = (skin, len, lift) => `<g fill="${skin}" stroke="#000" stroke-opacity="0.35" stroke-width="0.6">${bothL(`<path d="M-21 -32 L${-21 - len} ${-32 - lift} L-21 -22 Z" ${VE}/>`)}</g>` +
    `<path d="M21 -32 L${21 + len} ${-32 - lift}" ${auraStroke(0.7, 1)}/>`;
  const hair = (color, lock) => `<path d="${HAIR_D}" fill="${color}"/>` + (lock ? `<path d="${LOCK_D}" fill="${color}"/>` : '') +
    `<path d="M2 -58 C14 -58 24 -50 23 -30" ${auraStroke(0.6, 1)}/>`;

  function featherWing(dark) {
    let s = '';
    const base = dark ? '#2a2230' : '#efe6cf';
    const edge = dark ? '#120e16' : '#bfae86';
    for (let i = 0; i < 6; i += 1) {
      const tipX = 30 + i * 9;
      const tipY = -60 + i * 22;
      const d = dark
        ? `M110 4 L${tipX} ${tipY} L${tipX + 14} ${tipY + 8} L${tipX + 6} ${tipY + 16} Z`
        : `M110 4 Q${tipX + 10} ${tipY - 8} ${tipX} ${tipY} Q${tipX + 18} ${tipY + 10} ${tipX + 22} ${tipY + 16} Z`;
      s += `<path d="${d}" fill="${base}" stroke="${edge}" stroke-width="0.8" ${VE}/>`;
    }
    return s;
  }

  function wingsSvg(r, kind) {
    const dy = r.shY + 6;
    let inner;
    if (kind === 'feather' || kind === 'fallen') {
      inner = featherWing(kind === 'fallen') + `<path d="M110 4 Q60 -60 30 -60" ${auraStroke(kind === 'fallen' ? 0.4 : 0.8, 1.2)}/>`;
    } else if (kind === 'bat') {
      inner = '<path d="M112 4 L36 -54 L44 -26 L30 -14 L44 0 L32 18 L50 22 L64 42 L84 26 L104 30 Z" fill="#5a2a38" stroke="#14080c" stroke-width="1" vector-effect="non-scaling-stroke"/>' +
        `<path d="M112 4 L36 -54 M90 -6 L44 -26 M86 6 L44 0 M88 16 L50 22" ${auraStroke(0.75, 0.9)}/>`;
    } else {
      inner = '<path d="M112 4 L40 -64 L58 -28 L28 -22 L62 -4 L38 18 L80 14 L96 32 Z" fill="#7fb5d8" fill-opacity="0.45" stroke="#bfe3f7" stroke-width="1" vector-effect="non-scaling-stroke"/>' +
        `<path d="M112 4 L40 -64 M112 4 L28 -22 M112 4 L38 18" ${auraStroke(0.8, 0.9)}/>`;
    }
    const scaleX = Math.min(1, (r.shoulderHalf + 50) / 110);
    const left = `<g transform="translate(${n(CX - 110 * scaleX)} ${n(dy)}) scale(${n(scaleX * 100) / 100} 1)">${inner}</g>`;
    return both(left);
  }

  function tailSvg(r, kind, color) {
    const x0 = CX + r.hipHalf * 0.4;
    const y0 = r.hipY;
    const rx = Math.min(236, CX + r.hipHalf + 50);
    if (kind === 'devil') {
      return `<path d="M${n(x0)} ${n(y0)} C${n(rx)} ${n(y0 + 30)} ${n(rx + 4)} ${n(y0 - 30)} ${n(rx - 14)} ${n(y0 - 70)}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" ${VE}/>` +
        `<path d="M${n(rx - 14)} ${n(y0 - 70)} L${n(rx - 24)} ${n(y0 - 72)} L${n(rx - 12)} ${n(y0 - 90)} L${n(rx - 4)} ${n(y0 - 66)} Z" fill="${color}"/>` +
        `<path d="M${n(rx - 12)} ${n(y0 - 90)} L${n(rx - 4)} ${n(y0 - 66)}" ${auraStroke(0.7, 1)}/>`;
    }
    if (kind === 'dragon') {
      return `<path d="M${n(x0 - 6)} ${n(y0 - 6)} C${n(rx + 6)} ${n(y0 + 10)} ${n(rx)} ${n(y0 + 40)} ${n(rx - 6)} ${CUT + 4} L${n(rx - 22)} ${CUT + 4} C${n(rx - 18)} ${n(y0 + 30)} ${n(rx - 30)} ${n(y0 + 14)} ${n(x0)} ${n(y0 + 10)} Z" fill="${color}" stroke="#000" stroke-opacity="0.4" stroke-width="1" ${VE}/>` +
        `<path d="M${n(rx - 4)} ${n(y0 + 12)} L${n(rx + 4)} ${n(y0 + 8)} L${n(rx + 2)} ${n(y0 + 18)} M${n(rx - 2)} ${n(y0 + 32)} L${n(rx + 6)} ${n(y0 + 30)} L${n(rx + 2)} ${n(y0 + 40)}" fill="${color}" stroke="#000" stroke-opacity="0.4" stroke-width="0.8" ${VE}/>`;
    }
    return `<path d="M${n(x0)} ${n(y0 + 4)} C${n(rx + 4)} ${n(y0 + 24)} ${n(rx + 8)} ${n(y0 - 40)} ${n(rx - 10)} ${n(y0 - 60)} C${n(rx - 18)} ${n(y0 - 68)} ${n(rx - 4)} ${n(y0 - 74)} ${n(rx + 2)} ${n(y0 - 64)}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" ${VE}/>` +
      `<path d="M${n(x0 + 10)} ${n(y0 + 8)} C${n(rx + 4)} ${n(y0 + 20)} ${n(rx + 8)} ${n(y0 - 40)} ${n(rx - 6)} ${n(y0 - 58)}" ${auraStroke(0.5, 1)}/>`;
  }

  const RACE_TRAITS = {
    human: {
      name: 'Heroic Locks', ears: 'round',
      head: (ctx) => ctx.hooded ? '' : hair('#2a1d16', true)
    },
    halfling: {
      name: 'Curly Heroic Locks', ears: 'round',
      head: (ctx) => ctx.hooded ? '' : hair('#4a2e1c', false) + bothL('<circle cx="-17" cy="-46" r="4" fill="#4a2e1c"/>')
    },
    elf: {
      name: 'Long Swept Ears',
      head: (ctx) => {
        if (ctx.hooded) return '';
        let s = hair(ctx.srId === 'drow' ? '#d8dbe6' : '#c9b48a', true);
        if (ctx.srId === 'drow') s += '<path d="M0 -60 L4 -70 L8 -58 Z" fill="#d8dbe6"/>';
        if (ctx.srId === 'high') s += `<path d="M-21 -40 Q0 -46 21 -40" fill="none" stroke="#c9a24a" stroke-width="1.6" ${VE}/><path d="M0 -46 L3 -41 L0 -37 L-3 -41 Z" ${auraFill(1)}/>`;
        if (ctx.srId === 'wood') s += `<path d="M-21 -40 Q0 -46 21 -40" fill="none" stroke="#3e6a2c" stroke-width="2" ${VE}/>` + bothL('<path d="M-12 -44 Q-16 -50 -10 -52 Q-8 -47 -12 -44 Z" fill="#4e7a3a"/>');
        return s;
      },
      over: (ctx) => pointEars(ctx.skin, 18, 18)
    },
    'half-elf': {
      name: 'Tapered Ears',
      head: (ctx) => ctx.hooded ? '' : hair(ctx.srId === 'drow-heritage' ? '#d8dbe6' : '#3a2618', true) + `<path d="M-4 -46 C-18 -44 -24 -34 -22 -20 C-18 -30 -12 -38 -4 -40 Z" fill="${ctx.srId === 'drow-heritage' ? '#d8dbe6' : '#3a2618'}"/>`,
      over: (ctx) => pointEars(ctx.skin, 10, 9)
    },
    gnome: {
      name: 'Tinker Ears',
      head: (ctx) => ctx.hooded ? '' : hair('#b5662e', false),
      over: (ctx) => {
        let s = pointEars(ctx.skin, 14, 8);
        if (ctx.srId === 'forest' && !ctx.hooded) {
          s += `<path d="M-24 -40 C-20 -62 10 -70 26 -56 L18 -46 C8 -52 -6 -52 -24 -40 Z" fill="#3e6a2c" stroke="#203a16" stroke-width="0.8" ${VE}/>` +
            '<path d="M14 -60 L22 -70 L20 -58 Z" fill="#8a1f24"/>';
        } else {
          s += `<path d="M-22 -42 L22 -42" stroke="#3a2b1c" stroke-width="3" ${VE}/>` +
            bothL(`<circle cx="-9" cy="-43" r="6" fill="#6f4e1e" stroke="#c9a24a" stroke-width="1.4" ${VE}/><circle cx="-9" cy="-43" r="3.6" ${auraFill(0.55)}/>`);
        }
        return s;
      }
    },
    dwarf: {
      name: 'Braided Clan Beard', ears: 'round',
      head: (ctx) => ctx.hooded ? '' : hair('#5a3220', false),
      over: (ctx) => {
        const c = ctx.srId === 'duergar' ? '#8d8f99' : '#6b3a22';
        return `<path d="M-19 -20 C-21 0 -15 30 -9 44 L-5 54 L0 47 L5 54 L9 44 C15 30 21 0 19 -20 C14 -12 8 -9 3 -10 L-3 -10 C-8 -9 -14 -12 -19 -20 Z" fill="${c}"/>` +
          `<path d="M-5 -10 C-2 -7 2 -7 5 -10 L4 -6 L-4 -6 Z" fill="#000" fill-opacity="0.4"/>` +
          `<path d="M-9 0 L-6 20 M0 -2 L0 22 M9 0 L6 20" stroke="#000" stroke-opacity="0.35" stroke-width="1" ${VE}/>` +
          `<path d="M19 -20 C21 0 15 30 9 44" ${auraStroke(0.6, 1)}/>` +
          bothL(`<rect x="-10" y="32" width="7" height="5" rx="1" fill="#c9a24a" stroke="#5e4a1e" stroke-width="0.6" ${VE}/>`) +
          `<rect x="-3" y="38" width="6" height="5" rx="1" fill="#c9a24a"/>`;
      }
    },
    'half-orc': {
      name: 'Ridged Brow & Tusks', ears: 'round',
      head: (ctx) => (ctx.hooded ? '' : '<path d="M-23 -30 C-24 -48 -8 -56 0 -55 C10 -55 22 -48 23 -30 L18 -42 L-18 -42 Z" fill="#141210"/>') +
        `<path d="M-21 -35 L-3 -36 L0 -33 L3 -36 L21 -35 L19 -30 L3 -31 L0 -29 L-3 -31 L-19 -30 Z" fill="${ctx.skin}" stroke="#000" stroke-opacity="0.5" stroke-width="0.8" ${VE}/>` +
        `<path d="M-21 -30 L21 -30" stroke="#000" stroke-opacity="0.35" stroke-width="2" ${VE}/>` +
        bothL(`<path d="M-7 -8 L-8.5 -17 L-4.5 -9 Z" fill="#ece3cf" stroke="#5a5040" stroke-width="0.5" ${VE}/>`)
    },
    tiefling: {
      name: 'Sweeping Horns', ears: 'round',
      head: (ctx) => ctx.hooded ? '' : hair('#1a1218', true),
      over: () => {
        const horn = `<path d="M-12 -48 C-22 -58 -28 -70 -24 -84 C-34 -74 -36 -58 -22 -42 Z" fill="#2a1a1e" stroke="#0e0809" stroke-width="0.8" ${VE}/>` +
          `<path d="M-15 -52 L-21 -50 M-19 -60 L-26 -59 M-22 -68 L-29 -68" stroke="#5a3a3e" stroke-width="1" ${VE}/>`;
        return bothL(horn) + `<path d="M12 -48 C22 -58 28 -70 24 -84" ${auraStroke(0.75, 1)}/>`;
      },
      back: (r, ctx) => ctx.srId === 'winged' ? wingsSvg(r, 'bat') : tailSvg(r, 'devil', ctx.skin)
    },
    dragonborn: {
      name: 'Draconic Crest & Snout',
      head: (ctx) => `<path d="M-3 -30 L3 -30 L8 -11 L0 -4 L-8 -11 Z" fill="${ctx.skin}" stroke="#000" stroke-opacity="0.5" stroke-width="0.8" ${VE}/>` +
        '<path d="M-3 -30 L0 -4 L-8 -11 Z" fill="#000" fill-opacity="0.25"/>' +
        `<path d="M8 -11 L0 -4" ${auraStroke(0.6, 1)}/>` +
        bothL(`<path d="M-14 -5 L-20 -14 L-22 -6 Z M-10 -2 L-16 -2 L-14 4 Z" fill="${ctx.skin}" stroke="#000" stroke-opacity="0.45" stroke-width="0.6" ${VE}/>`) +
        bothL(`<path d="M-8 -20 L-12 -18 M-6 -16 L-10 -13" stroke="#000" stroke-opacity="0.35" stroke-width="0.8" ${VE}/>`),
      over: (ctx) => bothL(`<path d="M-10 -52 L-26 -78 L-20 -54 L-34 -66 L-23 -40 Z" fill="${ctx.skin}" stroke="#000" stroke-opacity="0.55" stroke-width="0.8" ${VE}/>`) +
        `<path d="M0 -56 L4 -66 L6 -54 Z" fill="${ctx.skin}"/><path d="M10 -52 L26 -78" ${auraStroke(0.75, 1)}/>`,
      back: (r, ctx) => {
        if (ctx.srId === 'gem') return wingsSvg(r, 'crystal');
        if (ctx.srId === 'draconblood') return tailSvg(r, 'dragon', ctx.skin);
        return '';
      }
    },
    tabaxi: {
      name: 'Tufted Feline Ears',
      head: (ctx) => `<path d="M-3 -18 L3 -18 L0 -15 Z" fill="#2a1a12"/>` +
        bothL(`<path d="M-21 -18 L-31 -14 L-22 -12 L-30 -8 L-18 -7 Z" fill="${ctx.skin}" stroke="#000" stroke-opacity="0.3" stroke-width="0.5" ${VE}/>`) +
        bothL('<path d="M-12 -46 L-16 -38 M-8 -48 L-9 -40" stroke="#3a2614" stroke-width="1.4" vector-effect="non-scaling-stroke"/>'),
      over: (ctx) => bothL(`<path d="M-20 -40 L-22 -70 L-6 -52 Z" fill="${ctx.skin}" stroke="#000" stroke-opacity="0.4" stroke-width="0.8" ${VE}/><path d="M-18 -46 L-20 -62 L-11 -52 Z" fill="#3a2614" fill-opacity="0.6"/><path d="M-22 -70 L-23 -78 M-22 -70 L-19 -77" stroke="${ctx.skin}" stroke-width="1.2" ${VE}/>`) +
        `<path d="M20 -40 L22 -70 L6 -52" ${auraStroke(0.7, 1)}/>`,
      back: (r, ctx) => tailSvg(r, 'feline', ctx.skin)
    },
    aasimar: {
      name: 'Sacred Halo', ears: 'round',
      behind: () => `<circle cx="0" cy="-34" r="34" ${auraStroke(0.9, 2)}/><circle cx="0" cy="-34" r="28" ${auraStroke(0.5, 0.8)}/>` +
        `<path d="M0 -68 L29.4 -17 L-29.4 -17 Z M0 0 L29.4 -51 L-29.4 -51 Z" ${auraStroke(0.35, 0.7)}/>`,
      head: (ctx) => ctx.hooded ? '' : hair(ctx.srId === 'fallen' ? '#1c1a22' : '#e8d9a8', true),
      back: (r, ctx) => wingsSvg(r, ctx.srId === 'fallen' ? 'fallen' : 'feather')
    },
    goliath: {
      name: 'Lithoderm War-Markings', ears: 'round',
      head: (ctx) => `<path d="M-18 -44 L-8 -38 L-2 -46 L6 -38 L16 -44 M-17 -22 L-11 -16 L-15 -9 M17 -22 L11 -16 L15 -9 M-6 6 L0 2 L6 6" fill="none" stroke="#2b3550" stroke-width="1.6" ${VE}/>` +
        `<path d="M17 -22 L11 -16 L15 -9" ${auraStroke(0.55, 0.8)}/>` +
        (ctx.hooded ? '' : '<path d="M-22 -36 C-22 -52 -10 -56 0 -56 C10 -56 22 -52 22 -36 C16 -46 -16 -46 -22 -36 Z" fill="#3a3a40"/>')
    }
  };

  /* Layer 5 - class props, unscaled and pinned to sockets */
  const blade = (len, w, fill) => `<path d="M${-w} 0 L${w} 0 L${w * 0.7} ${-len + 8} L0 ${-len} L${-w * 0.7} ${-len + 8} Z" fill="${fill || '#cfd5dc'}" stroke="#3a3f46" stroke-width="0.8" ${VE}/>` +
    `<path d="M0 -2 L0 ${-len + 4}" stroke="#fff" stroke-opacity="0.6" stroke-width="0.7" ${VE}/>`;
  const at = (x, y, rot, inner) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${rot || 0})">${inner}</g>`;
  const glowOrb = (x, y, rad, uid) => `<circle cx="${n(x)}" cy="${n(y)}" r="${rad}" ${auraFill(0.85)} filter="url(#glow-${uid})"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(rad * 0.45)}" fill="#fff" fill-opacity="0.8"/>`;

  const CLASS_PROPS = {
    barbarian: {
      name: 'Greataxe',
      front: (r) => {
        const [x, y] = r.rightHand;
        const head = `<path d="M0 -136 C18 -150 30 -136 30 -116 C30 -104 22 -96 10 -100 L2 -112 Z" fill="#9aa1ab" stroke="#2a2c31" stroke-width="1" ${VE}/>`;
        return at(x, y, 8,
          `<rect x="-2.5" y="-150" width="5" height="176" fill="#4a3426" stroke="#1d140e" stroke-width="0.8" ${VE}/>` +
          head + `<g transform="scale(-1 1)">${head}</g>` +
          `<path d="M30 -116 C30 -136 18 -150 0 -136" ${auraStroke(0.8, 1.2)}/>` +
          `<path d="M-3 -10 L3 -10 M-3 -4 L3 -4" stroke="#8a1f24" stroke-width="2" ${VE}/>`);
      }
    },
    fighter: {
      name: 'Longsword & Heraldic Shield',
      front: (r) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        const shield = `<path d="M-24 -30 L24 -30 L24 0 C24 18 10 28 0 34 C-10 28 -24 18 -24 0 Z" fill="#5a1e1e" stroke="#9aa1ab" stroke-width="2.4" ${VE}/>` +
          `<path d="M0 -30 L0 34 M-24 -6 L24 -6" stroke="#b08d4a" stroke-width="3" ${VE}/>` +
          `<path d="M-24 -30 L24 -30 L24 0 C24 18 10 28 0 34" ${auraStroke(0.7, 1)}/>`;
        return at(x, y, 10, `${blade(108, 3.4)}<rect x="-11" y="-2" width="22" height="4" fill="#b08d4a"/><rect x="-2" y="2" width="4" height="12" fill="#3a2b1c"/><circle cx="0" cy="16" r="3" fill="#b08d4a"/>`) +
          at(lx + 6, ly - 22, -6, shield);
      }
    },
    paladin: {
      name: 'Radiant Greatsword & Oath Kite Shield',
      front: (r, ctx) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        const kite = `<path d="M0 -40 L24 -26 L20 10 L0 42 L-20 10 L-24 -26 Z" fill="#e8e1cf" stroke="#c9a24a" stroke-width="2.4" ${VE}/>` +
          `<circle cx="0" cy="-6" r="9" fill="#c9a24a"/>` +
          `<path d="M0 -22 L0 10 M-16 -6 L16 -6 M-11 -17 L11 5 M11 -17 L-11 5" stroke="#c9a24a" stroke-width="1.2" ${VE}/>` +
          `<circle cx="0" cy="-6" r="4" ${auraFill(1)} filter="url(#glow-${ctx.uid})"/>`;
        return at(x, y, 6, `<g filter="url(#glow-${ctx.uid})">${blade(130, 4.2, '#e9eef3')}</g>${blade(130, 4.2, '#e9eef3')}<path d="M0 -6 L0 -120" ${auraStroke(0.8, 1.4)}/><path d="M-14 -3 L14 -3 L10 3 L-10 3 Z" fill="#c9a24a"/><rect x="-2.2" y="3" width="4.4" height="18" fill="#3a2b1c"/>`) +
          at(lx + 6, ly - 24, -4, kite);
      }
    },
    rogue: {
      name: 'Dual Reverse-Grip Daggers',
      front: (r) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        const dagger = `<rect x="-2" y="-2" width="4" height="10" fill="#2a1d14"/><path d="M-6 -2 L6 -2" stroke="#9aa1ab" stroke-width="2" ${VE}/>` +
          `<g transform="rotate(180)">${blade(34, 2.6)}</g><path d="M0 4 L0 30" ${auraStroke(0.9, 1)}/>`;
        return at(x, y - 2, -160, dagger) + at(lx, ly - 2, 160, dagger) +
          at(CX + r.waistHalf * 0.4, r.waistY - 26, -35, blade(18, 1.8));
      }
    },
    ranger: {
      name: 'Recurve Longbow & Quiver',
      back: (r) => {
        const [bx, by] = r.backTop;
        let arrows = '';
        for (let i = 0; i < 4; i += 1) {
          arrows += `<path d="M${-6 + i * 4} -40 L${-6 + i * 4} -6" stroke="#6b4a2b" stroke-width="1" ${VE}/><path d="M${-8 + i * 4} -48 L${-6 + i * 4} -40 L${-4 + i * 4} -48 Z" fill="#a33b2a"/>`;
        }
        return at(bx, by + 4, 24, `${arrows}<rect x="-9" y="-10" width="18" height="60" rx="3" fill="#5b3f26" stroke="#2a1d14" stroke-width="1" ${VE}/><path d="M-9 -4 L9 -4" stroke="#b08d4a" stroke-width="2" ${VE}/>`);
      },
      front: (r) => {
        const [lx, ly] = r.leftHand;
        return at(lx - 2, ly - 30, 0,
          `<path d="M4 -96 C-6 -90 -2 -70 -14 -40 C-20 -20 -20 20 -14 40 C-2 70 -6 90 4 96" fill="none" stroke="#4a3426" stroke-width="4" stroke-linecap="round" ${VE}/>` +
          `<path d="M4 -96 L4 96" stroke="#d8cdb5" stroke-width="0.8" ${VE}/>` +
          `<path d="M-14 -40 C-20 -20 -20 20 -14 40" ${auraStroke(0.7, 1)}/>` +
          '<rect x="-20" y="22" width="9" height="16" rx="2" fill="#2a1d14"/>');
      }
    },
    wizard: {
      name: 'Ornate Staff & Floating Grimoire',
      front: (r, ctx) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        const staff = `<rect x="-2.4" y="-150" width="4.8" height="178" fill="#3a2b1c" stroke="#1d140e" stroke-width="0.8" ${VE}/>` +
          `<path d="M0 -148 C-12 -156 -12 -172 0 -178 C12 -172 12 -156 0 -148 Z" fill="none" stroke="#c9a24a" stroke-width="2" ${VE}/>` +
          glowOrb(0, -162, 5, ctx.uid);
        const book = `<path d="M0 0 L-22 -6 L-22 16 L0 22 Z" fill="#e6dcc4" stroke="#3b2a1e" stroke-width="1" ${VE}/><path d="M0 0 L22 -6 L22 16 L0 22 Z" fill="#d9cfb6" stroke="#3b2a1e" stroke-width="1" ${VE}/>` +
          `<path d="M-16 2 L-6 4 M-16 7 L-6 9 M-16 12 L-8 13" stroke="#3b2a1e" stroke-opacity="0.6" stroke-width="0.8" ${VE}/>` +
          `<path d="M11 -1 L16 8 L6 8 Z" ${auraStroke(1, 1.2)} filter="url(#glow-${ctx.uid})"/>`;
        return at(x, y, 4, staff) + at(Math.max(42, lx + 4), ly - 56, -8, book) +
          `<path d="M${n(Math.max(42, lx + 4))} ${n(ly - 30)} L${n(lx)} ${n(ly - 10)}" ${auraStroke(0.4, 0.8)} stroke-dasharray="2 3"/>`;
      }
    },
    sorcerer: {
      name: 'Twin Elemental Orbs',
      front: (r, ctx) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        const orb = (ox, oy) => glowOrb(ox, oy, 9, ctx.uid) +
          `<path d="M${n(ox - 14)} ${n(oy)} C${n(ox - 10)} ${n(oy - 16)} ${n(ox + 12)} ${n(oy - 14)} ${n(ox + 14)} ${n(oy)} M${n(ox + 12)} ${n(oy + 6)} C${n(ox + 4)} ${n(oy + 16)} ${n(ox - 10)} ${n(oy + 14)} ${n(ox - 13)} ${n(oy + 4)}" ${auraStroke(0.85, 1.2)}/>`;
        return orb(x, y - 26) + orb(lx, ly - 26);
      }
    },
    warlock: {
      name: 'Eldritch Eye Sigil & Pact Blade',
      front: (r, ctx) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        const sx = lx;
        const sy = ly - 34;
        return `<g filter="url(#glow-${ctx.uid})"><circle cx="${n(sx)}" cy="${n(sy)}" r="14" ${auraStroke(0.9, 1.4)}/>` +
          `<path d="M${n(sx - 11)} ${n(sy)} Q${n(sx)} ${n(sy - 9)} ${n(sx + 11)} ${n(sy)} Q${n(sx)} ${n(sy + 9)} ${n(sx - 11)} ${n(sy)} Z" ${auraStroke(1, 1.2)}/></g>` +
          `<circle cx="${n(sx)}" cy="${n(sy)}" r="3" ${auraFill(1)}/>` +
          `<path d="M${n(sx)} ${n(sy - 20)} L${n(sx)} ${n(sy - 16)} M${n(sx)} ${n(sy + 16)} L${n(sx)} ${n(sy + 20)} M${n(sx - 20)} ${n(sy)} L${n(sx - 16)} ${n(sy)} M${n(sx + 16)} ${n(sy)} L${n(sx + 20)} ${n(sy)}" ${auraStroke(0.8, 1)}/>` +
          at(x, y, 14, `<path d="M-6 -20 C-10 -50 4 -60 -2 -96 C10 -70 12 -40 6 -20 Z" fill="#5c2a6b" fill-opacity="0.55" filter="url(#glow-${ctx.uid})"/>${blade(86, 3, '#3a3048')}<path d="M0 -6 L0 -80" ${auraStroke(0.9, 1)}/><path d="M-10 -2 L-4 2 L4 2 L10 -2" fill="none" stroke="#8d8f99" stroke-width="2" ${VE}/><rect x="-2" y="2" width="4" height="12" fill="#1d1824"/>`);
      }
    },
    cleric: {
      name: 'Flanged Mace & Sunburst Sigil',
      front: (r, ctx) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        let rays = '';
        for (let i = 0; i < 12; i += 1) {
          const a = (i * Math.PI) / 6;
          const r1 = i % 2 ? 11 : 13;
          rays += `M${n(Math.cos(a) * 7)} ${n(Math.sin(a) * 7)} L${n(Math.cos(a) * r1 * 1.4)} ${n(Math.sin(a) * r1 * 1.4)} `;
        }
        return at(x, y, 12, `<rect x="-2.4" y="-60" width="4.8" height="76" fill="#4a3426" stroke="#1d140e" stroke-width="0.8" ${VE}/>` +
            `<path d="M0 -82 L10 -74 L10 -60 L0 -54 L-10 -60 L-10 -74 Z" fill="#9aa1ab" stroke="#2a2c31" stroke-width="1" ${VE}/>` +
            `<path d="M0 -82 L0 -54 M-10 -67 L10 -67" stroke="#2a2c31" stroke-width="0.8" ${VE}/><path d="M10 -74 L10 -60" ${auraStroke(0.8, 1)}/>`) +
          at(lx, ly - 36, 0, `<g filter="url(#glow-${ctx.uid})"><path d="${rays}" ${auraStroke(1, 1.4)}/><circle r="6" ${auraFill(0.95)}/></g><circle r="2.4" fill="#fff"/>`);
      }
    },
    bard: {
      name: 'Swept-Hilt Rapier & Lute',
      back: (r) => {
        const [bx, by] = r.backTop;
        return at(bx - 6, by + 30, -28,
          `<ellipse cx="0" cy="34" rx="18" ry="22" fill="#8a5a2b" stroke="#3b2a1e" stroke-width="1" ${VE}/><circle cx="0" cy="30" r="5" fill="#1d140e"/>` +
          `<rect x="-3" y="-44" width="6" height="58" fill="#5b3f26" stroke="#2a1d14" stroke-width="0.8" ${VE}/>` +
          `<path d="M-4 -44 L-8 -56 L8 -56 L4 -44 Z" fill="#3b2a1e"/>` +
          `<path d="M-1 -44 L-1 40 M1 -44 L1 40" stroke="#d8cdb5" stroke-width="0.4" ${VE}/>`);
      },
      front: (r) => {
        const [x, y] = r.rightHand;
        return at(x, y, 18, `<path d="M-0.9 0 L0.9 0 L0.6 -110 L0 -114 L-0.6 -110 Z" fill="#cfd5dc" stroke="#3a3f46" stroke-width="0.6" ${VE}/>` +
          `<path d="M0 -4 L0 -108" ${auraStroke(0.7, 0.8)}/>` +
          `<path d="M-10 -2 C-12 10 10 14 10 2 M-8 -2 L8 -2" fill="none" stroke="#c9a24a" stroke-width="1.6" ${VE}/>` +
          '<rect x="-1.8" y="0" width="3.6" height="12" fill="#2a1d14"/><circle cx="0" cy="14" r="2.6" fill="#c9a24a"/>');
      }
    },
    monk: {
      name: 'Bo Quarterstaff & Ki Rings',
      front: (r, ctx) => {
        const [x, y] = r.rightHand;
        const [lx, ly] = r.leftHand;
        const x1 = Math.max(26, lx - 14);
        const y1 = ly + 12;
        const x2 = Math.min(236, x + 18);
        const y2 = r.shY - 50;
        return `<path d="M${n(x1)} ${n(y1)} L${n(x2)} ${n(y2)}" stroke="#6b4a2b" stroke-width="5" stroke-linecap="round" ${VE}/>` +
          `<path d="M${n(x1)} ${n(y1)} L${n(lerp(x1, x2, 0.08))} ${n(lerp(y1, y2, 0.08))} M${n(x2)} ${n(y2)} L${n(lerp(x2, x1, 0.08))} ${n(lerp(y2, y1, 0.08))}" stroke="#c9a24a" stroke-width="6" ${VE}/>` +
          `<g filter="url(#glow-${ctx.uid})"><circle cx="${n(lx)}" cy="${n(ly - 4)}" r="11" ${auraStroke(0.9, 1.2)}/><circle cx="${n(x)}" cy="${n(y - 4)}" r="11" ${auraStroke(0.9, 1.2)}/></g>` +
          `<circle cx="${n(lx)}" cy="${n(ly - 4)}" r="15" ${auraStroke(0.4, 0.8)} stroke-dasharray="3 3"/><circle cx="${n(x)}" cy="${n(y - 4)}" r="15" ${auraStroke(0.4, 0.8)} stroke-dasharray="3 3"/>`;
      }
    },
    druid: {
      name: 'Living Vine Staff',
      front: (r, ctx) => {
        const [x, y] = r.rightHand;
        return at(x, y, 4,
          `<path d="M0 26 C-4 -20 4 -60 -2 -110 C-4 -130 -14 -140 -8 -156 M-2 -110 C6 -128 14 -136 10 -152 M-2 -120 C-12 -132 -6 -146 2 -150" fill="none" stroke="#4a3426" stroke-width="4" stroke-linecap="round" ${VE}/>` +
          `<path d="M-2 -40 C-10 -50 -12 -60 -4 -70 M1 -80 C10 -86 10 -96 2 -104" fill="none" stroke="#3e6a2c" stroke-width="1.6" ${VE}/>` +
          '<path d="M-10 -60 Q-18 -64 -14 -70 Q-8 -66 -10 -60 Z M8 -92 Q16 -96 14 -102 Q6 -100 8 -92 Z" fill="#4e7a3a"/>' +
          `<circle cx="0" cy="-138" r="6" fill="#2fbf71" filter="url(#glow-${ctx.uid})"/><circle cx="0" cy="-138" r="2.6" fill="#d9ffe8"/>` +
          `<circle cx="0" cy="-138" r="9" ${auraStroke(0.6, 0.8)}/>`);
      }
    }
  };

  /* Layer 1 - Animus codex frame and stature scale */
  const FRAME_D = 'M30 8 L230 8 L246 24 L246 296 L230 312 L30 312 L14 296 L14 24 Z';
  const INNER_D = 'M33 14 L227 14 L240 27 L240 293 L227 306 L33 306 L20 293 L20 27 Z';
  const STATURE = [["7'", 50], ["6'", 80], ["5'", 110], ["4'", 140]];

  function frameBack(r, uid) {
    let ticks = '';
    for (let y = 40; y <= 170; y += 10) {
      ticks += `<path d="M22 ${y} L${y % 30 === 20 ? 30 : 26} ${y} M238 ${y} L${y % 30 === 20 ? 230 : 234} ${y}" stroke="#6b7280" stroke-opacity="0.55" stroke-width="0.8" ${VE}/>`;
    }
    STATURE.forEach(([label, y]) => {
      ticks += `<path d="M22 ${y} L32 ${y} M238 ${y} L228 ${y}" ${auraStroke(0.6, 1)}/>` +
        `<text x="34" y="${y + 2.5}" font-size="7" font-family="Cinzel, Georgia, serif" fill="#8b93a1">${label}</text>` +
        `<text x="226" y="${y + 2.5}" font-size="7" font-family="Cinzel, Georgia, serif" fill="#8b93a1" text-anchor="end">${label}</text>`;
    });
    ticks += `<path d="M20 ${r.headTop} L36 ${r.headTop} M240 ${r.headTop} L224 ${r.headTop}" ${auraStroke(1, 1.6)}/>` +
      `<path d="M36 ${r.headTop - 3} L40 ${r.headTop} L36 ${r.headTop + 3} Z M224 ${r.headTop - 3} L220 ${r.headTop} L224 ${r.headTop + 3} Z" ${auraFill(1)}/>`;
    let lattice = '';
    for (let i = -6; i <= 6; i += 1) {
      const x = CX + i * 26;
      lattice += `M${x} 14 L${x + 150} 306 M${x} 14 L${x - 150} 306 `;
    }
    let astro = '';
    for (let i = 0; i < 24; i += 1) {
      const a = (i * Math.PI) / 12;
      const r1 = i % 2 ? 86 : 82;
      astro += `M${n(CX + Math.cos(a) * r1)} ${n(140 + Math.sin(a) * r1)} L${n(CX + Math.cos(a) * 92)} ${n(140 + Math.sin(a) * 92)} `;
    }
    return `<path d="${FRAME_D}" fill="url(#frameMetal-${uid})"/>` +
      `<path d="${INNER_D}" fill="#07090d"/>` +
      `<g clip-path="url(#inner-${uid})">` +
      `<path d="${lattice}" fill="none" stroke="#3a4150" stroke-opacity="0.35" stroke-width="0.6" ${VE}/>` +
      `<ellipse cx="${CX}" cy="${n(r.shY + 20)}" rx="110" ry="130" fill="url(#auraGlow-${uid})"/>` +
      `<circle cx="${CX}" cy="140" r="92" ${auraStroke(0.28, 1)}/><circle cx="${CX}" cy="140" r="70" ${auraStroke(0.18, 0.8)} stroke-dasharray="4 3"/>` +
      `<circle cx="${CX}" cy="140" r="48" ${auraStroke(0.14, 0.6)}/>` +
      `<path d="${astro}" ${auraStroke(0.3, 0.7)}/>` +
      `<path d="M${CX} 44 L${CX + 96} 140 L${CX} 236 L${CX - 96} 140 Z" ${auraStroke(0.16, 0.7)}/>` +
      `<path d="M${CX - 92} 140 L${CX + 92} 140 M${CX} 48 L${CX} 232" ${auraStroke(0.1, 0.6)}/>` +
      `</g>${ticks}`;
  }

  function frameFront(uid) {
    const corner = `<path d="M30 8 L14 24 M24 12 L18 18" stroke="#c9a24a" stroke-width="1.2" ${VE}/><path d="M20 30 L30 20 L40 20" ${auraStroke(0.7, 1)}/>`;
    return `<path d="${INNER_D}" fill="url(#vignette-${uid})" pointer-events="none"/>` +
      `<path d="${FRAME_D} ${INNER_D}" fill="url(#frameMetal-${uid})" fill-rule="evenodd"/>` +
      `<path d="${FRAME_D}" fill="none" stroke="#000" stroke-width="1.2" ${VE}/>` +
      `<path d="${INNER_D}" ${auraStroke(0.75, 1.2)}/>` +
      corner + mir(corner) +
      `<g transform="matrix(1 0 0 -1 0 320)">${corner + mir(corner)}</g>` +
      `<path d="M${CX - 9} 8 L${CX} 2 L${CX + 9} 8 L${CX} 14 Z" fill="#1a1d24" stroke="#c9a24a" stroke-width="1" ${VE}/>` +
      `<path d="M${CX - 4} 8 L${CX} 5 L${CX + 4} 8 L${CX} 11 Z" ${auraFill(1)}/>` +
      `<path d="M${CX - 9} 312 L${CX} 306 L${CX + 9} 312 L${CX} 318 Z" fill="#1a1d24" stroke="#c9a24a" stroke-width="1" ${VE}/>`;
  }

  function defsSvg(r, uid) {
    return '<defs>' +
      `<linearGradient id="frameMetal-${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3f4a"/><stop offset="0.5" stop-color="#14171d"/><stop offset="1" stop-color="#2b2f38"/></linearGradient>` +
      `<radialGradient id="auraGlow-${uid}" cx="50%" cy="40%" r="50%"><stop offset="0" style="stop-color:${AURA}" stop-opacity="0.42"/><stop offset="0.55" style="stop-color:${AURA}" stop-opacity="0.12"/><stop offset="1" style="stop-color:${AURA}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="vignette-${uid}" cx="50%" cy="45%" r="65%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient>` +
      `<linearGradient id="shade-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.55" stop-color="#000" stop-opacity="0.05"/><stop offset="0.85" stop-color="#000" stop-opacity="0"/><stop offset="1" style="stop-color:${AURA}" stop-opacity="0.22"/></linearGradient>` +
      `<linearGradient id="hoodShadow-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.92"/><stop offset="0.38" stop-color="#000" stop-opacity="0.6"/><stop offset="0.6" stop-color="#000" stop-opacity="0"/></linearGradient>` +
      `<filter id="glow-${uid}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
      `<clipPath id="inner-${uid}"><path d="${INNER_D}"/></clipPath>` +
      `<clipPath id="torso-${uid}"><path d="${torsoD(r, 0, {})}"/></clipPath>` +
      '</defs>';
  }

  function renderPortraitSvg(sp, sr, cl, sc, opts) {
    const o = opts || {};
    const spId = RIG_SPECS[idOf(sp, 'human')] ? idOf(sp, 'human') : 'human';
    const clId = CLASS_OUTFITS[idOf(cl, 'fighter')] ? idOf(cl, 'fighter') : 'fighter';
    const srId = idOf(sr, '');
    const scId = idOf(sc, '');
    uidSeq += 1;
    const uid = safeId(o.uid) || `av${uidSeq}`;
    const r = BODY_RIGS[spId];
    const outfit = CLASS_OUTFITS[clId];
    const props = CLASS_PROPS[clId];
    const race = RACE_TRAITS[spId];
    const skin = skinFor(spId, srId);
    const ctx = { uid, skin, srId, scId, spId, clId, hooded: !!outfit.hooded, rig: r };
    const call = (fn) => (typeof fn === 'function' ? fn(r, ctx) || '' : '');
    const raceCall = (fn, withRig) => (typeof fn === 'function' ? (withRig ? fn(r, ctx) : fn(ctx)) || '' : '');
    const sleeve = outfit.bare ? skin : outfit.sleeve;
    const head = (inner) => `<g transform="translate(${CX} ${r.neckY})">${inner}</g>`;

    const body = `<path d="${torsoD(r, 0, {})}" fill="${skin}"/>` +
      `<path d="${torsoD(r, 0, {})}" fill="url(#shade-${uid})"/>`;
    const arms = both(`<path d="${armD(r)}" fill="${sleeve}"/><path d="${armD(r)}" fill="url(#shade-${uid})"/>`) +
      `<path d="${armD(r)}" transform="${MIRROR}" ${auraStroke(0.45, 0.8)}/>`;

    const layers = [
      defsSvg(r, uid),
      frameBack(r, uid),
      `<g clip-path="url(#inner-${uid})" class="codex-figure">`,
      `<g class="codex-lineage">${raceCall(race.back, true)}</g>`,
      `<g class="codex-outfit-back">${call(outfit.back)}</g>`,
      `<g class="codex-prop-back">${call(props.back)}</g>`,
      `<g class="codex-body">${body}${arms}${handsSvg(r, skin)}</g>`,
      `<g class="codex-outfit" data-outfit="${clId}">${call(outfit.torso)}</g>`,
      `<g class="codex-collar">${call(outfit.preHead)}</g>`,
      head(`<g class="codex-halo">${raceCall(race.behind)}</g>`),
      head(`<g class="codex-face">${race.ears === 'round' ? roundEars(skin) : ''}${faceSvg(skin, uid)}${raceCall(race.head)}</g>`),
      head(`<g class="codex-hood">${call(outfit.head)}</g>`),
      head(`<g class="codex-race-over">${raceCall(race.over)}</g>`),
      `<g class="codex-prop" data-prop="${clId}">${call(props.front)}</g>`,
      '</g>',
      frameFront(uid)
    ];
    return `<svg class="stage-silhouette codex-portrait" viewBox="0 0 260 320" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" data-avatar-sp="${spId}" data-avatar-cl="${clId}"${srId ? ` data-avatar-sr="${srId}"` : ''}>${layers.join('')}</svg>`;
  }

  function escAttr(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const ALL_SPECIES = ["human", "elf", "dwarf", "halfling", "dragonborn", "gnome", "tiefling", "half-orc", "half-elf", "goliath", "aasimar", "tabaxi"];
  const ALL_CLASSES = ["barbarian", "bard", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"];
  const loadedHiRes = new Set();
  const queuedSet = new Set();
  const preloadQueue = [];
  let inflight = 0;
  const MAX_CONCURRENCY = 2;

  function pumpPreload() {
    while (inflight < MAX_CONCURRENCY && preloadQueue.length > 0) {
      const src = preloadQueue.shift();
      if (loadedHiRes.has(src)) continue;
      inflight += 1;
      const im = new Image();
      im.decoding = "async";
      const done = (ok) => {
        inflight -= 1;
        if (ok) loadedHiRes.add(src);
        pumpPreload();
      };
      im.onload = () => {
        if (typeof im.decode === "function") im.decode().then(() => done(true), () => done(true));
        else done(true);
      };
      im.onerror = () => done(false);
      im.src = src;
    }
  }

  function enqueuePreload(src, highPriority) {
    if (!src || loadedHiRes.has(src) || queuedSet.has(src)) return;
    queuedSet.add(src);
    if (highPriority) preloadQueue.unshift(src);
    else preloadQueue.push(src);
    pumpPreload();
  }

  const DEFAULT_SPECIES_CLASS = {
    "half-orc": "barbarian",
    halfling: "rogue",
    tiefling: "warlock",
    dwarf: "cleric",
    dragonborn: "paladin",
    tabaxi: "monk",
    "half-elf": "bard",
    elf: "ranger",
    gnome: "wizard",
    goliath: "barbarian",
    aasimar: "paladin",
    human: "fighter"
  };

  /* Preloads direct 1-hover neighbors first, then queues remaining combos gently. */
  function preloadNeighbors(spId, clId) {
    if (typeof Image === "undefined") return;
    const neighbors = [];
    ALL_SPECIES.forEach((s) => neighbors.push(`images/portraits/${clId}/${s}.webp`));
    ALL_CLASSES.forEach((c) => neighbors.push(`images/portraits/${c}/${spId}.webp`));
    neighbors.reverse().forEach((src) => enqueuePreload(src, true));
    const scheduleIdle = typeof requestIdleCallback === "function" ? requestIdleCallback : (fn) => setTimeout(fn, 180);
    scheduleIdle(() => {
      ALL_CLASSES.forEach((c) => {
        ALL_SPECIES.forEach((s) => enqueuePreload(`images/portraits/${c}/${s}.webp`, false));
      });
    });
  }

  function portraitIds(sp, cl) {
    const spId = safeId(idOf(sp, "human")) || "human";
    const clId = safeId(idOf(cl, "fighter")) || "fighter";
    const key = `${spId}__${clId}`;
    const lqMap = typeof window !== "undefined" && window.FORGE_PORTRAITS_LQ ? window.FORGE_PORTRAITS_LQ : null;
    const lq = (lqMap && lqMap[key]) || `images/portraits/${clId}/${spId}.lq.webp`;
    const fbClass = DEFAULT_SPECIES_CLASS[spId] || "fighter";
    return { spId, clId, key, lq, src: `images/portraits/${clId}/${spId}.webp`, fallbackSrc: `images/portraits/${fbClass}/${spId}.webp` };
  }

  function activateLayer(frame, winner, loser) {
    winner.classList.add("is-ready", "is-front");
    winner.classList.remove("is-back");
    if (loser && loser !== winner) {
      loser.classList.remove("is-front");
      loser.classList.add("is-back");
      clearTimeout(loser._fadeTimer);
      loser._fadeTimer = setTimeout(() => {
        if (!loser.classList.contains("is-front")) loser.classList.remove("is-ready", "is-back");
      }, 270);
    }
    if (frame) frame.classList.remove("is-loading-lq");
  }

  function onPortraitLoad(img) {
    if (!img) return;
    const curSrc = img.getAttribute("src");
    if (curSrc) loadedHiRes.add(curSrc);
    const frame = img.closest ? img.closest(".codex-frame") : null;
    if (!frame) {
      img.classList.add("is-ready", "is-front");
      return;
    }
    const imgSeq = Number(img.getAttribute("data-seq") || "0");
    if (frame._swapSeq && imgSeq !== frame._swapSeq) return;
    const targetSrc = frame.getAttribute("data-target-src");
    if (targetSrc && curSrc !== targetSrc && curSrc !== img.getAttribute("data-fallback-src")) return;
    const layers = frame.querySelectorAll(".codex-img");
    const other = layers[0] === img ? layers[1] : layers[0];
    activateLayer(frame, img, other);
  }

  /* Image error ladder: class portrait, then species default class portrait, then the SVG codex fallback. */
  function onPortraitError(img) {
    if (!img) return;
    const frame = img.closest ? img.closest(".codex-frame") : null;
    const fb = img.getAttribute("data-fallback-src");
    if (fb && img.getAttribute("data-fallback-tried") !== "1") {
      img.setAttribute("data-fallback-tried", "1");
      img.src = fb;
      return;
    }
    img.setAttribute("data-failed", "1");
    if (frame) {
      const imgSeq = Number(img.getAttribute("data-seq") || "0");
      if (frame._swapSeq && imgSeq !== frame._swapSeq) return;
      frame.classList.add("is-fallback");
      frame.classList.remove("is-loading-lq");
      const box = frame.querySelector(".codex-fallback");
      if (box) box.hidden = false;
    }
  }

  function renderPortraitHtml(sp, sr, cl, sc, opts) {
    const ids = portraitIds(sp, cl);
    const alt = `${(sp && sp.name) || ids.spId} ${(cl && cl.name) || ids.clId}`;
    const svg = renderPortraitSvg(sp, sr, cl, sc, opts);
    const ready = loadedHiRes.has(ids.src) ? " is-ready is-front" : " is-front";
    if (!opts || !opts.preview) preloadNeighbors(ids.spId, ids.clId);
    return `<div class="codex-frame" data-portrait-sp="${ids.spId}" data-portrait-cl="${ids.clId}" data-target-src="${ids.src}">` +
      `<img class="codex-lq" src="${escAttr(ids.lq)}" alt="" aria-hidden="true" />` +
      `<img class="codex-img${ready}" data-slot="a" data-seq="0" src="${ids.src}" data-fallback-src="${ids.fallbackSrc}" alt="${escAttr(alt)}" decoding="async" onload="window.FORGE_AVATAR&&window.FORGE_AVATAR.onPortraitLoad(this)" onerror="window.FORGE_AVATAR&&window.FORGE_AVATAR.onPortraitError(this)" />` +
      `<img class="codex-img" data-slot="b" data-fallback-src="${ids.fallbackSrc}" alt="" decoding="async" onload="window.FORGE_AVATAR&&window.FORGE_AVATAR.onPortraitLoad(this)" onerror="window.FORGE_AVATAR&&window.FORGE_AVATAR.onPortraitError(this)" />` +
      '<span class="codex-corner tl" aria-hidden="true"></span><span class="codex-corner tr" aria-hidden="true"></span>' +
      '<span class="codex-corner bl" aria-hidden="true"></span><span class="codex-corner br" aria-hidden="true"></span>' +
      `<div class="codex-fallback" hidden>${svg}</div>` +
      "</div>";
  }

  /* Double-buffered crossfade: decodes incoming portrait off-top before fading over current layer. */
  function updatePortraitFrame(frame, sp, sr, cl, sc, opts) {
    if (!frame) return false;
    const layers = frame.querySelectorAll(".codex-img");
    if (layers.length < 2) return false;
    const lqImg = frame.querySelector(".codex-lq");
    const ids = portraitIds(sp, cl);
    const alt = `${(sp && sp.name) || ids.spId} ${(cl && cl.name) || ids.clId}`;
    const box = frame.querySelector(".codex-fallback");
    if (box) {
      box.innerHTML = renderPortraitSvg(sp, sr, cl, sc, opts);
      box.hidden = true;
    }
    frame.classList.remove("is-fallback");
    frame.setAttribute("data-portrait-sp", ids.spId);
    frame.setAttribute("data-portrait-cl", ids.clId);
    frame.setAttribute("data-target-src", ids.src);
    if (lqImg && lqImg.getAttribute("src") !== ids.lq) lqImg.setAttribute("src", ids.lq);

    const seq = (frame._swapSeq || 0) + 1;
    frame._swapSeq = seq;

    const curFront = frame.querySelector(".codex-img.is-front") || layers[0];
    const nextImg = layers[0] === curFront ? layers[1] : layers[0];
    if (curFront.getAttribute("src") === ids.src && curFront.classList.contains("is-ready")) {
      curFront.setAttribute("data-seq", String(seq));
      curFront.alt = alt;
      clearTimeout(nextImg._fadeTimer);
      nextImg.classList.remove("is-ready", "is-front", "is-back");
      frame.classList.remove("is-loading-lq");
      if (!opts || !opts.preview) preloadNeighbors(ids.spId, ids.clId);
      return true;
    }

    clearTimeout(nextImg._fadeTimer);
    nextImg.classList.remove("is-ready", "is-front", "is-back");
    nextImg.removeAttribute("data-fallback-tried");
    nextImg.removeAttribute("data-failed");
    nextImg.setAttribute("data-fallback-src", ids.fallbackSrc);
    nextImg.setAttribute("data-seq", String(seq));
    nextImg.alt = alt;

    if (!loadedHiRes.has(ids.src)) frame.classList.add("is-loading-lq");

    const commitSwap = () => {
      if (frame._swapSeq !== seq) return;
      loadedHiRes.add(ids.src);
      requestAnimationFrame(() => {
        if (frame._swapSeq !== seq) return;
        activateLayer(frame, nextImg, curFront);
      });
    };

    if (nextImg.getAttribute("src") === ids.src && nextImg.complete && nextImg.naturalWidth > 0) {
      commitSwap();
    } else {
      nextImg.setAttribute("src", ids.src);
      if (typeof nextImg.decode === "function") {
        nextImg.decode().then(commitSwap, () => {});
      }
    }

    if (!opts || !opts.preview) preloadNeighbors(ids.spId, ids.clId);
    return true;
  }

  const api = { renderPortraitSvg, renderPortraitHtml, updatePortraitFrame, onPortraitLoad, onPortraitError, preloadNeighbors, portraitIds, loadedHiRes, BODY_RIGS, RACE_TRAITS, CLASS_OUTFITS, CLASS_PROPS };
  const root = typeof window !== "undefined" ? window : globalThis;
  root.FORGE_AVATAR = api;
})();
