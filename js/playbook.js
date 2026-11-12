// Strike and Defense Playbook engine: PHB level scaling, exact d20 odds, DPR optimizer and PDF sheet export.
// Exposes window.FORGE_PLAYBOOK; pure functions with zero DOM access so node unit tests can load it.
(() => {
  const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const ABILITY_NAMES = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };
  const ASI_BASE = [4, 8, 12, 16, 19];
  const ASI_EXTRA = { fighter: [6, 14], rogue: [10] };
  const FULL_CASTERS = ["bard", "cleric", "druid", "sorcerer", "wizard"];
  const HALF_CASTERS = ["paladin", "ranger"];
  const EXTRA_ATTACK_5 = ["barbarian", "fighter", "monk", "paladin", "ranger"];

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const clampLevel = (level) => clamp(Math.floor(Number(level) || 1), 1, 20);
  const modOf = (score) => Math.floor((Number(score) - 10) / 2);
  const signed = (n) => (n >= 0 ? `+${n}` : String(n));
  const round1 = (n) => Math.round(n * 10) / 10;
  const pct = (p) => round1(p * 100);
  const ordinal = (n) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);
  const idOf = (x) => (x && typeof x === "object" ? x.id : x) || null;

  function proficiencyBonus(level) {
    return Math.ceil(clampLevel(level) / 4) + 1;
  }

  function asiCountForClass(classId, level) {
    const lv = clampLevel(level);
    const marks = ASI_BASE.concat(ASI_EXTRA[classId] || []);
    return marks.filter((m) => m <= lv).length;
  }

  // Spends 2 points per earned ASI one point at a time down the priority order, capping each stat at 20.
  // Barbarian Lv 20 Primal Champion then adds 4 to STR and CON up to 24.
  function applyLevelAsis(baseScores, order, classId, level) {
    const lv = clampLevel(level);
    const scores = {};
    ABILITIES.forEach((ab) => {
      const raw = baseScores ? Number(baseScores[ab]) : NaN;
      scores[ab] = Number.isFinite(raw) ? raw : 10;
    });
    const priority = (Array.isArray(order) && order.length ? order : ABILITIES).filter((ab) => ABILITIES.includes(ab));
    ABILITIES.forEach((ab) => { if (!priority.includes(ab)) priority.push(ab); });
    const asiApplied = asiCountForClass(classId, lv);
    let points = asiApplied * 2;
    let asiPointsSpent = 0;
    for (const ab of priority) {
      while (points > 0 && scores[ab] < 20) {
        scores[ab] += 1;
        points -= 1;
        asiPointsSpent += 1;
      }
    }
    if (classId === "barbarian" && lv >= 20) {
      scores.STR = Math.min(24, scores.STR + 4);
      scores.CON = Math.min(24, scores.CON + 4);
    }
    return { scores, asiApplied, asiPointsSpent };
  }

  function spellProfile(classId, subclassId, lv) {
    if (FULL_CASTERS.includes(classId)) {
      const max = Math.min(9, Math.ceil(lv / 2));
      return { max, summary: `Full caster · ${ordinal(max)}-level slots max` };
    }
    if (HALF_CASTERS.includes(classId)) {
      const max = lv >= 2 ? Math.min(5, Math.ceil(lv / 4)) : 0;
      return { max, summary: max ? `Half caster · ${ordinal(max)}-level slots max` : "Half caster · spells unlock at Lv 2" };
    }
    if (classId === "warlock") {
      const max = Math.min(5, Math.ceil(lv / 2));
      const slots = lv >= 17 ? 4 : lv >= 11 ? 3 : lv >= 2 ? 2 : 1;
      const arcanum = lv >= 17 ? 9 : lv >= 15 ? 8 : lv >= 13 ? 7 : lv >= 11 ? 6 : 0;
      return {
        max,
        slots,
        summary: `Pact Magic · ${slots} x ${ordinal(max)}-level slots${arcanum ? ` · Mystic Arcanum to ${ordinal(arcanum)}` : ""}`
      };
    }
    if ((classId === "fighter" && subclassId === "eldritch") || (classId === "rogue" && subclassId === "arcane-trickster")) {
      const max = lv >= 19 ? 4 : lv >= 13 ? 3 : lv >= 7 ? 2 : lv >= 3 ? 1 : 0;
      return { max, summary: max ? `Third caster · ${ordinal(max)}-level slots max` : "Third caster · spells unlock at Lv 3" };
    }
    return { max: 0, summary: "No spellcasting" };
  }

  function resourceFor(classId, subclassId, lv, p, spell) {
    switch (classId) {
      case "barbarian":
        return { label: `Rage ${p.rageCount}/long rest · +${p.rageDmg} dmg`, max: p.rageCount === "Unlimited" ? 99 : p.rageCount };
      case "bard":
        return { label: `Bardic Inspiration ${p.bardicDie} · CHA mod uses`, max: 5 };
      case "cleric": {
        const cd = lv >= 18 ? 3 : lv >= 6 ? 2 : lv >= 2 ? 1 : 0;
        return { label: `Channel Divinity ${cd}/rest`, max: cd };
      }
      case "druid":
        return { label: lv >= 2 ? "Wild Shape 2/short rest" : "Wild Shape unlocks at Lv 2", max: lv >= 2 ? 2 : 0 };
      case "fighter": {
        if (subclassId === "battlemaster" && lv >= 3) {
          const dice = lv >= 15 ? 6 : lv >= 7 ? 5 : 4;
          return { label: `Superiority Dice ${dice} x ${p.superiorityDie}`, max: dice };
        }
        const surges = lv >= 17 ? 2 : lv >= 2 ? 1 : 0;
        return { label: `Action Surge ${surges} · Second Wind 1`, max: surges + 1 };
      }
      case "monk":
        return { label: `Ki Points ${p.kiPoints}`, max: p.kiPoints };
      case "paladin":
        return { label: `Lay on Hands ${p.layOnHands} HP pool`, max: p.layOnHands };
      case "ranger":
        return { label: spell.max ? `Spell Slots to ${ordinal(spell.max)} level` : "Favored Enemy tracking", max: spell.max };
      case "rogue":
        return { label: `Sneak Attack ${p.sneakDice}d6 once per turn`, max: 0 };
      case "sorcerer":
        return { label: `Sorcery Points ${lv >= 2 ? lv : 0}`, max: lv >= 2 ? lv : 0 };
      case "warlock":
        return { label: `Pact Slots ${spell.slots} x ${ordinal(spell.max)} level`, max: spell.slots };
      case "wizard":
        return { label: `Arcane Recovery ${Math.ceil(lv / 2)} slot levels`, max: Math.ceil(lv / 2) };
      default:
        return { label: "Class resource", max: 0 };
    }
  }

  function progression(classId, subclassId, speciesId, subraceId, level) {
    const lv = clampLevel(level);
    let attacks = 1;
    if (lv >= 5 && EXTRA_ATTACK_5.includes(classId)) attacks = 2;
    if (lv >= 6 && classId === "bard" && (subclassId === "valor" || subclassId === "swords")) attacks = 2;
    if (lv >= 6 && classId === "wizard" && subclassId === "bladesinging") attacks = 2;
    if (classId === "fighter" && lv >= 20) attacks = 4;
    else if (classId === "fighter" && lv >= 11) attacks = 3;

    const monkMove = [[18, 30], [14, 25], [10, 20], [6, 15], [2, 10]].find(([at]) => lv >= at);
    const spell = spellProfile(classId, subclassId, lv);
    const p = {
      level: lv,
      pb: proficiencyBonus(lv),
      asiCount: asiCountForClass(classId, lv),
      attacks,
      cantripDice: lv >= 17 ? 4 : lv >= 11 ? 3 : lv >= 5 ? 2 : 1,
      sneakDice: classId === "rogue" ? Math.ceil(lv / 2) : 0,
      rageCount: lv >= 20 ? "Unlimited" : lv >= 17 ? 6 : lv >= 12 ? 5 : lv >= 6 ? 4 : lv >= 3 ? 3 : 2,
      rageDmg: lv >= 16 ? 4 : lv >= 9 ? 3 : 2,
      brutalCritDice: classId === "barbarian" ? (lv >= 17 ? 3 : lv >= 13 ? 2 : lv >= 9 ? 1 : 0) : 0,
      martialDie: lv >= 17 ? "1d10" : lv >= 11 ? "1d8" : lv >= 5 ? "1d6" : "1d4",
      kiPoints: classId === "monk" && lv >= 2 ? lv : 0,
      unarmoredMove: classId === "monk" && monkMove ? monkMove[1] : 0,
      bardicDie: lv >= 15 ? "1d12" : lv >= 10 ? "1d10" : lv >= 5 ? "1d8" : "1d6",
      layOnHands: classId === "paladin" ? lv * 5 : 0,
      auraOfProtection: classId === "paladin" && lv >= 6 ? (lv >= 18 ? 30 : 10) : 0,
      improvedSmite: classId === "paladin" && lv >= 11 ? "1d8" : null,
      superiorityDie: classId === "fighter" && subclassId === "battlemaster" && lv >= 3 ? (lv >= 18 ? "1d12" : lv >= 10 ? "1d10" : "1d8") : null,
      breathDice: lv >= 16 ? "5d6" : lv >= 11 ? "4d6" : lv >= 6 ? "3d6" : "2d6",
      spellMaxLevel: spell.max,
      spellSummary: spell.summary,
      speciesId: speciesId || null,
      subraceId: subraceId || null
    };
    const res = resourceFor(classId, subclassId, lv, p, spell);
    p.resourceLabel = res.label;
    p.resourceMax = res.max;
    return p;
  }

  function parseDice(str) {
    const m = String(str || "").match(/(\d+)\s*d\s*(\d+)/i);
    if (!m) return { count: 0, sides: 0, avg: 0 };
    const count = Number(m[1]);
    const sides = Number(m[2]);
    return { count, sides, avg: (count * (sides + 1)) / 2 };
  }

  const diceAvg = (count, sides) => (count > 0 && sides > 0 ? (count * (sides + 1)) / 2 : 0);

  // Exact odds for one attack roll: per-face distribution of the kept d20 with Lucky and advantage folded in.
  function d20Odds(atkBonus, targetAc, opts) {
    const o = opts || {};
    const lucky = !!o.lucky;
    const critMin = clamp(Number(o.critMin) || 20, 2, 20);
    const dice = o.disadvantage && !o.advantage ? -2 : o.advantage ? (o.elvenAccuracy ? 3 : 2) : 1;
    const single = [];
    for (let k = 1; k <= 20; k++) single[k] = lucky ? (k === 1 ? 1 / 400 : 1 / 20 + 1 / 400) : 1 / 20;
    const cdf = [0];
    for (let k = 1; k <= 20; k++) cdf[k] = cdf[k - 1] + single[k];
    const kept = [];
    for (let k = 1; k <= 20; k++) {
      if (dice > 0) {
        kept[k] = Math.pow(cdf[k], dice) - Math.pow(cdf[k - 1], dice);
      } else {
        kept[k] = Math.pow(1 - cdf[k - 1], 2) - Math.pow(1 - cdf[k], 2);
      }
    }
    let pHit = 0;
    let pCrit = 0;
    for (let k = 1; k <= 20; k++) {
      if (k === 1) continue;
      if (k >= critMin) {
        pCrit += kept[k];
        pHit += kept[k];
      } else if (k === 20 || k + atkBonus >= targetAc) {
        pHit += kept[k];
      }
    }
    return { pHit, pCrit };
  }

  // Probability a creature fails a save against a DC; nat rolls carry no special meaning on saves.
  function saveFailOdds(dc, saveMod) {
    return clamp((dc - 1 - saveMod) / 20, 0, 1);
  }

  function classAttackStat(cl, mods) {
    const pref = cl && cl.attackPref;
    if (pref === "STR" || pref === "DEX") return pref;
    if (pref === "FINESSE") return mods.DEX >= mods.STR ? "DEX" : "STR";
    if (pref === "STR_OR_CAST") return mods.STR >= mods.DEX ? "STR" : "DEX";
    return cl && Array.isArray(cl.primaryStats) && cl.primaryStats.includes("DEX") ? "DEX" : "STR";
  }

  function weaponStat(w, cl, mods) {
    if (!w) return classAttackStat(cl, mods);
    if (w.stat === "FINESSE" || /finesse/i.test(w.notes || "")) return mods.DEX >= mods.STR ? "DEX" : "STR";
    return ABILITIES.includes(w.stat) ? w.stat : classAttackStat(cl, mods);
  }

  const isCantrip = (w) => /^cantrip\b/i.test((w && w.notes) || "");
  const isRanged = (w) => /ammunition|ranged|bow|crossbow|cantrip/i.test(`${(w && w.name) || ""} ${(w && w.notes) || ""}`);
  const isTwoHanded = (w) => /two-handed|heavy/i.test((w && w.notes) || "");
  const isLight = (w) => /\blight\b/i.test((w && w.notes) || "");
  const isThrownOrRanged = (w) => isRanged(w) || /thrown/i.test((w && w.notes) || "");

  function normalizeProfile(profile) {
    const pr = profile || {};
    const cl = pr.cl || { id: pr.classId || "fighter", primaryStats: ["STR"], saves: [], signatureWeapons: [] };
    const sc = pr.sc || null;
    const sp = pr.sp || { id: pr.speciesId || "human" };
    const sr = pr.sr || null;
    const level = clampLevel(pr.level || (pr.prog && pr.prog.level) || 1);
    const scores = {};
    ABILITIES.forEach((ab) => { scores[ab] = pr.scores && Number.isFinite(Number(pr.scores[ab])) ? Number(pr.scores[ab]) : 10; });
    const mods = {};
    ABILITIES.forEach((ab) => {
      mods[ab] = pr.mods && Number.isFinite(Number(pr.mods[ab])) ? Number(pr.mods[ab]) : modOf(scores[ab]);
    });
    const pb = Number(pr.pb) || proficiencyBonus(level);
    const prog = pr.prog && pr.prog.level === level ? pr.prog : progression(cl.id, idOf(sc), idOf(sp), idOf(sr), level);
    return { pr, cl, sc, sp, sr, level, scores, mods, pb, prog, scId: idOf(sc), spId: idOf(sp) };
  }

  function baseArmorClass(cl, mods) {
    const r = String((cl && (cl.acRule || cl.armor)) || "");
    if (/chain mail/i.test(r)) return { ac: 16, note: "Chain Mail 16" };
    if (/scale/i.test(r)) return { ac: 14 + Math.min(2, mods.DEX), note: "Scale Mail 14 + DEX max 2" };
    if (/leather/i.test(r)) return { ac: 11 + mods.DEX, note: "Leather 11 + DEX" };
    if (/unarmored/i.test(r) && /CON/.test(r)) return { ac: 10 + mods.DEX + mods.CON, note: "Unarmored 10 + DEX + CON" };
    if (/unarmored/i.test(r) && /WIS/.test(r)) return { ac: 10 + mods.DEX + mods.WIS, note: "Unarmored 10 + DEX + WIS" };
    return { ac: 10 + mods.DEX, note: "Unarmored 10 + DEX" };
  }

  // Expected damage for a strike line built from per-attack legs plus once-per-turn riders.
  function scoreLine(line) {
    let dpr = 0;
    let missAll = 1;
    let noCrit = 1;
    let hitSum = 0;
    let critSum = 0;
    let n = 0;
    let avgOnHit = 0;
    let critBonusDmg = 0;
    line.legs.forEach((leg) => {
      for (let i = 0; i < leg.count; i++) {
        if (leg.save) {
          const pFail = leg.pFail;
          dpr += pFail * leg.avgOnHit + (leg.halfOnSave ? (1 - pFail) * leg.avgOnHit * 0.5 : 0);
          missAll *= 1 - pFail;
          hitSum += pFail;
        } else {
          dpr += leg.pHit * leg.avgOnHit + leg.pCrit * leg.critBonus;
          missAll *= 1 - leg.pHit;
          noCrit *= 1 - leg.pCrit;
          hitSum += leg.pHit;
          critSum += leg.pCrit;
          critBonusDmg = Math.max(critBonusDmg, leg.critBonus);
        }
        avgOnHit = Math.max(avgOnHit, leg.avgOnHit);
        n += 1;
      }
    });
    (line.oncePerTurn || []).forEach((rider) => {
      const pLand = 1 - missAll;
      const pAnyCrit = 1 - noCrit;
      dpr += pLand * rider.avg + (rider.crits ? pAnyCrit * rider.avg : 0);
    });
    return {
      dpr: round1(dpr),
      hitPct: n ? pct(hitSum / n) : 0,
      critPct: n ? pct(critSum / n) : 0,
      landPct: pct(1 - missAll),
      avgOnHit: round1(avgOnHit),
      critBonusDmg: round1(critBonusDmg),
      attackCount: n
    };
  }

  function evaluatePlaybook(profile, opts = {}) {
    const ctx = normalizeProfile(profile);
    const { cl, sp, level: lv, mods, pb, prog, scId, spId } = ctx;
    const clId = cl.id;
    const o = Object.assign({
      targetAc: 13 + Math.floor(lv / 3),
      enemyAtk: 3 + Math.floor(lv / 2),
      advantage: false,
      classRider: true,
      offhandOrBonus: true,
      novaBurst: false,
      useShield: false,
      coverBonus: 0,
      dodgeAction: false,
      reactionDef: true
    }, opts || {});
    if (o.targetAc === null || o.targetAc === undefined) o.targetAc = 13 + Math.floor(lv / 3);
    if (o.enemyAtk === null || o.enemyAtk === undefined) o.enemyAtk = 3 + Math.floor(lv / 2);
    o.targetAc = Number(o.targetAc);
    o.enemyAtk = Number(o.enemyAtk);
    o.coverBonus = Number(o.coverBonus) || 0;

    const weapons = Array.isArray(cl.signatureWeapons) ? cl.signatureWeapons : [];
    const martialWeapons = weapons.filter((w) => !isCantrip(w));
    const cantrip = weapons.find(isCantrip) || null;
    const castStat = cl.spellAbility || (ctx.sc && ctx.sc.spellAbility) || null;
    const castMod = castStat ? mods[castStat] : 0;
    const spellAtk = pb + castMod;
    const spellDc = 8 + pb + castMod;
    const enemySave = Math.max(0, Math.floor((o.enemyAtk - 2) / 2));

    const lucky = spId === "halfling";
    const elfish = spId === "elf" || spId === "half-elf";
    const critMin = clId === "fighter" && scId === "champion" ? (lv >= 15 ? 18 : lv >= 3 ? 19 : 20) : 20;
    const savage = spId === "half-orc";
    const raging = clId === "barbarian" && o.classRider;
    const reckless = raging && lv >= 2;
    const notesGlobal = [];

    function attackLeg(w, count, extra) {
      const ex = extra || {};
      const st = ex.stat || weaponStat(w, cl, mods);
      const spell = !!ex.spell;
      const atk = spell ? spellAtk : pb + mods[st] + (ex.atkBonus || 0);
      const melee = !spell && !isRanged(w);
      const adv = o.advantage || (reckless && melee && st === "STR");
      const elven = adv && elfish && st !== "STR" && st !== "CON";
      const odds = d20Odds(atk, o.targetAc, { advantage: adv, elvenAccuracy: elven, lucky, critMin });
      const dice = ex.dice || parseDice(w && w.dice);
      const dmgMod = ex.noMod ? Math.min(0, mods[st]) : ex.dmgMod !== undefined ? ex.dmgMod : mods[st];
      const flat = (raging && melee && st === "STR" ? prog.rageDmg : 0) + (ex.flat || 0);
      const riderDice = ex.riderDice || [];
      const riderAvg = riderDice.reduce((s, r) => s + diceAvg(r.count, r.sides), 0);
      const baseAvg = diceAvg(dice.count, dice.sides);
      let critBonus = baseAvg + riderAvg;
      if (melee && clId === "barbarian" && prog.brutalCritDice) critBonus += diceAvg(prog.brutalCritDice, dice.sides);
      if (melee && savage) critBonus += diceAvg(1, dice.sides);
      return {
        count,
        pHit: odds.pHit,
        pCrit: odds.pCrit,
        avgOnHit: baseAvg + dmgMod + flat + riderAvg,
        critBonus,
        atk,
        adv,
        elven,
        dice,
        dmgBonus: dmgMod + flat,
        riderDice,
        label: ex.label || (w && w.name) || "Strike"
      };
    }

    function saveLeg(label, dice, flat, halfOnSave, count) {
      return {
        save: true,
        count: count || 1,
        pFail: saveFailOdds(spellDc, enemySave),
        avgOnHit: diceAvg(dice.count, dice.sides) + (flat || 0),
        halfOnSave,
        dice,
        dmgBonus: flat || 0,
        riderDice: [],
        label
      };
    }

    function rollsFor(legs, oncePerTurn) {
      const rolls = [];
      legs.forEach((leg) => {
        for (let i = 0; i < leg.count; i++) {
          const tag = leg.count > 1 ? `${leg.label} ${i + 1}` : leg.label;
          if (leg.save) {
            rolls.push({ label: `${tag} · DC ${spellDc} save`, count: leg.dice.count, sides: leg.dice.sides, bonus: leg.dmgBonus });
            continue;
          }
          rolls.push({ label: `${tag} To-Hit${leg.adv ? " · Advantage" : ""}`, count: leg.elven ? 3 : leg.adv ? 2 : 1, sides: 20, bonus: leg.atk, keep: leg.adv ? "highest" : undefined });
          rolls.push({ label: `${tag} Damage`, count: leg.dice.count, sides: leg.dice.sides, bonus: leg.dmgBonus });
          leg.riderDice.forEach((r) => rolls.push({ label: `${tag} ${r.label}`, count: r.count, sides: r.sides, bonus: 0 }));
        }
      });
      (oncePerTurn || []).forEach((r) => rolls.push({ label: `${r.label} · once per turn`, count: r.count, sides: r.sides, bonus: 0 }));
      return rolls.map((r) => {
        if (r.keep === undefined) delete r.keep;
        return r;
      });
    }

    function formulaFor(legs, oncePerTurn) {
      const parts = legs.map((leg) => {
        const dmg = `${leg.dice.count}d${leg.dice.sides}${leg.dmgBonus ? ` ${signed(leg.dmgBonus)}` : ""}`;
        const riders = leg.riderDice.map((r) => ` + ${r.count}d${r.sides}`).join("");
        const head = leg.save ? `DC ${spellDc}` : `1d20 ${signed(leg.atk)}`;
        return `${leg.count > 1 ? `${leg.count}x ` : ""}${head} -> ${dmg}${riders}`;
      });
      (oncePerTurn || []).forEach((r) => parts.push(`+ ${r.count}d${r.sides} ${r.label}`));
      return parts.join(" · ");
    }

    function riderDiceFor() {
      if (!o.classRider) return [];
      if (clId === "ranger" && lv >= 2) return [{ label: "Hunter's Mark", count: 1, sides: 6 }];
      if (clId === "warlock") return [{ label: "Hex", count: 1, sides: 6 }];
      if (clId === "paladin" && prog.improvedSmite) return [{ label: "Improved Smite", count: 1, sides: 8 }];
      return [];
    }

    function oncePerTurnFor() {
      const list = [];
      if (!o.classRider) return list;
      if (clId === "rogue") list.push({ label: "Sneak Attack", count: prog.sneakDice, sides: 6, avg: diceAvg(prog.sneakDice, 6), crits: true });
      if (clId === "barbarian" && scId === "zealot" && lv >= 3) {
        const c = 1;
        const s = 6;
        const flat = Math.floor(lv / 2);
        list.push({ label: `Divine Fury +${flat}`, count: c, sides: s, avg: diceAvg(c, s) + flat, crits: false });
      }
      if (clId === "paladin" && lv >= 2 && !o.novaBurst) list.push({ label: "Divine Smite", count: 2, sides: 8, avg: diceAvg(2, 8), crits: true });
      if (clId === "fighter" && scId === "battlemaster" && prog.superiorityDie) {
        const d = parseDice(prog.superiorityDie);
        list.push({ label: "Precision or Trip Maneuver", count: d.count, sides: d.sides, avg: d.avg, crits: true });
      }
      return list;
    }

    const lines = [];
    const surge = clId === "fighter" && lv >= 2 && o.novaBurst ? 2 : 1;
    const riders = riderDiceFor();
    const novaSmite = clId === "paladin" && lv >= 2 && o.novaBurst ? Math.min(5, 1 + Math.max(1, prog.spellMaxLevel)) : 0;
    const smiteRider = novaSmite ? [{ label: `Smite ${ordinal(Math.max(1, prog.spellMaxLevel))} slot`, count: novaSmite, sides: 8 }] : [];
    const primary = martialWeapons[0] || null;
    const casterFirst = !!cantrip && ["sorcerer", "wizard", "warlock", "cleric", "druid"].includes(clId) && !(clId === "wizard" && scId === "bladesinging" && lv >= 6);

    function pushLine(id, name, sequence, legs, once, extraNotes) {
      const score = scoreLine({ legs, oncePerTurn: once });
      lines.push(Object.assign({
        id,
        name,
        sequence,
        formula: formulaFor(legs, once),
        rolls: rollsFor(legs, once),
        notes: extraNotes || [],
        optimal: false
      }, score));
    }

    function cantripLegs(label) {
      if (!cantrip) return [];
      const d = parseDice(cantrip.dice);
      if (clId === "warlock") {
        const flat = lv >= 2 && o.classRider ? castMod : 0;
        return [attackLeg(cantrip, prog.cantripDice, { spell: true, dice: d, dmgMod: flat, riderDice: riders, label: `${label} beam` })];
      }
      if (/save/i.test(cantrip.notes || "")) {
        const flat = clId === "cleric" && lv >= 8 && ["light", "twilight"].includes(scId) ? castMod : 0;
        return [saveLeg(label, { count: d.count * prog.cantripDice, sides: d.sides }, flat, false, 1)];
      }
      const flat = clId === "wizard" && scId === "evocation" && lv >= 10 ? castMod : 0;
      return [attackLeg(cantrip, 1, { spell: true, dice: { count: d.count * prog.cantripDice, sides: d.sides }, dmgMod: flat, label })];
    }

    // Line A: primary sustained output.
    if (casterFirst) {
      pushLine("primary", `Cantrip Sustain · ${cantrip.name}`, `Action: ${cantrip.name}${clId === "warlock" && o.classRider ? " with Hex and Agonizing Blast" : ""}`, cantripLegs(cantrip.name), [], [`Scales at Lv 5/11/17 · now ${prog.cantripDice}x dice`]);
    } else if (primary) {
      let dice = parseDice(primary.dice);
      if (clId === "monk") {
        const md = parseDice(prog.martialDie);
        if (md.avg > dice.avg) dice = md;
      }
      const legs = [attackLeg(primary, prog.attacks * surge, { dice, riderDice: riders.concat(smiteRider) })];
      const seq = `Attack action: ${prog.attacks}x ${primary.name}${surge > 1 ? " · Action Surge doubles" : ""}${reckless ? " · Reckless Attack" : ""}${raging ? " · Rage" : ""}`;
      pushLine("primary", `Primary Martial · ${primary.name}`, seq, legs, oncePerTurnFor(), []);
    }

    // Line B: tactical bonus action sequence.
    if (o.offhandOrBonus) {
      if (clId === "monk" && primary) {
        const md = parseDice(prog.martialDie);
        const pd = parseDice(primary.dice);
        const flurry = lv >= 2 && prog.kiPoints > 0 ? 2 : 1;
        const legs = [
          attackLeg(primary, prog.attacks, { dice: md.avg > pd.avg ? md : pd }),
          attackLeg({ name: "Unarmed Strike", dice: prog.martialDie, notes: "" }, flurry, { stat: "DEX", dice: md, label: flurry > 1 ? "Flurry of Blows" : "Martial Arts Bonus Strike" })
        ];
        pushLine("tactical", flurry > 1 ? "Flurry Sequence" : "Martial Arts Bonus Strike", `Attack action then bonus action ${flurry > 1 ? "Flurry of Blows for 1 ki" : "unarmed strike"}`, legs, oncePerTurnFor(), []);
      } else if (clId === "cleric" && lv >= 3 && cantrip) {
        const sw = { name: "Spiritual Weapon", dice: `${1 + Math.max(0, Math.floor((prog.spellMaxLevel - 2) / 2))}d8`, notes: "" };
        const legs = cantripLegs(cantrip.name).concat([attackLeg(sw, 1, { spell: true, dmgMod: castMod, label: "Spiritual Weapon" })]);
        pushLine("tactical", "Spiritual Weapon + Cantrip", `Bonus action Spiritual Weapon strike then ${cantrip.name}`, legs, [], ["Spends a 2nd-level slot on turn 1"]);
      } else if (clId === "druid") {
        const shill = { name: "Shillelagh Quarterstaff", dice: "1d8", notes: "" };
        pushLine("tactical", "Shillelagh Strike", "Bonus action Shillelagh then melee with WIS", [attackLeg(shill, 1, { stat: "WIS" })], [], ["Melee range · keeps concentration free"]);
      } else if (clId === "sorcerer" && cantrip && lv >= 3) {
        pushLine("tactical", `Quickened ${cantrip.name}`, `Action ${cantrip.name} + Quickened ${cantrip.name} for 2 sorcery points`, cantripLegs(cantrip.name).concat(cantripLegs(`Quickened ${cantrip.name}`)), [], ["Costs 2 sorcery points per turn"]);
      } else if (clId === "wizard" && scId === "bladesinging" && lv >= 6 && cantrip && primary) {
        const legs = [attackLeg(primary, 1, {})].concat(cantripLegs(cantrip.name));
        pushLine("tactical", "Bladesong Weave", `Extra Attack swaps one swing for ${cantrip.name}`, legs, [], []);
      } else if (casterFirst && primary) {
        pushLine("tactical", `Melee Fallback · ${primary.name}`, `Attack action: ${primary.name}`, [attackLeg(primary, prog.attacks, {})], [], ["Use when foes close to melee"]);
      } else if (primary) {
        const offhand = martialWeapons.find((w, i) => i > 0 && isLight(w) && !isRanged(w)) || (isLight(primary) ? primary : null);
        if (offhand && !isTwoHanded(primary)) {
          const legs = [
            attackLeg(primary, prog.attacks * surge, { riderDice: riders.concat(smiteRider) }),
            attackLeg(offhand, 1, { noMod: true, riderDice: riders, label: `Off-Hand ${offhand.name}` })
          ];
          pushLine("tactical", `Two-Weapon · ${primary.name} + ${offhand.name}`, `Attack action then bonus action off-hand ${offhand.name}`, legs, oncePerTurnFor(), ["Off-hand adds no ability mod to damage"]);
        } else if (offhand) {
          const legs = [
            attackLeg(offhand, prog.attacks * surge, { riderDice: riders.concat(smiteRider) }),
            attackLeg(offhand, 1, { noMod: true, riderDice: riders, label: `Off-Hand ${offhand.name}` })
          ];
          pushLine("tactical", `Dual ${offhand.name}`, `Swap to paired ${offhand.name} for a bonus off-hand strike`, legs, oncePerTurnFor(), ["Off-hand adds no ability mod to damage"]);
        } else {
          const alt = martialWeapons.find((w) => w !== primary && !isThrownOrRanged(w)) || primary;
          const label = alt === primary ? `Tactical Rider · ${primary.name}` : `${isTwoHanded(alt) ? "Two-Handed" : "Swap"} · ${alt.name}`;
          pushLine("tactical", label, `Attack action: ${prog.attacks}x ${alt.name} with class rider focus`, [attackLeg(alt, prog.attacks * surge, { riderDice: riders.concat(smiteRider) })], oncePerTurnFor(), []);
        }
      }
    }

    // Line C: burst, ranged or control alternative.
    const spellMax = prog.spellMaxLevel;
    if (["sorcerer", "wizard"].includes(clId) && spellMax >= 3) {
      pushLine("burst", `Fireball · ${ordinal(spellMax)} slot`, "Action: Fireball on a clustered group · DEX save half", [saveLeg("Fireball", { count: 8 + (spellMax - 3), sides: 6 }, clId === "wizard" && scId === "evocation" && lv >= 10 ? castMod : 0, true, 1)], [], ["Per target · multiply by foes caught"]);
    } else if (["sorcerer", "wizard"].includes(clId) && spellMax >= 1) {
      pushLine("burst", `Chromatic Orb · ${ordinal(spellMax)} slot`, "Action: Chromatic Orb ranged spell attack", [attackLeg({ name: "Chromatic Orb", dice: `${3 + spellMax - 1}d8`, notes: "ranged" }, 1, { spell: true, dmgMod: 0 })], [], []);
    } else if (clId === "cleric" && spellMax >= 3) {
      pushLine("burst", `Spirit Guardians · ${ordinal(spellMax)} slot`, "Pre-cast Spirit Guardians then fight in the aura · WIS save half", [saveLeg("Spirit Guardians", { count: 3 + (spellMax - 3), sides: 8 }, 0, true, 1)], [], ["Per foe per turn · concentration"]);
    } else if (clId === "cleric" && spellMax >= 1) {
      pushLine("burst", `Guiding Bolt · ${ordinal(spellMax)} slot`, "Action: Guiding Bolt grants ally advantage on hit", [attackLeg({ name: "Guiding Bolt", dice: `${4 + spellMax - 1}d6`, notes: "ranged" }, 1, { spell: true, dmgMod: 0 })], [], []);
    } else if (clId === "druid" && spellMax >= 2) {
      pushLine("burst", `Moonbeam · ${ordinal(spellMax)} slot`, "Concentration Moonbeam column · CON save half", [saveLeg("Moonbeam", { count: 2 + (spellMax - 2), sides: 10 }, 0, true, 1)], [], ["Move the beam 60 ft each turn"]);
    } else if (clId === "druid" || clId === "bard") {
      const dice = clId === "bard" ? { count: spellMax >= 2 ? 3 + (spellMax - 2) : 3, sides: spellMax >= 2 ? 8 : 6 } : { count: 2 + Math.max(0, spellMax - 1), sides: 8 };
      const name = clId === "bard" ? (spellMax >= 2 ? "Shatter" : "Dissonant Whispers") : "Thunderwave";
      pushLine("burst", `${name} · ${ordinal(Math.max(1, spellMax))} slot`, `Action: ${name} · save half`, [saveLeg(name, dice, 0, true, 1)], [], ["Control and burst on a group"]);
    } else if (clId === "warlock" && primary) {
      pushLine("burst", `Pact Weapon Fallback · ${primary.name}`, `Attack action: ${primary.name}`, [attackLeg(primary, scId === "hexblade" && lv >= 5 ? 2 : 1, { stat: scId === "hexblade" ? "CHA" : undefined, riderDice: riders })], [], scId === "hexblade" ? ["Hex Warrior attacks with CHA"] : []);
    } else {
      const ranged = martialWeapons.find((w) => w !== primary && isRanged(w))
        || martialWeapons.find((w) => w !== primary && isThrownOrRanged(w))
        || martialWeapons.find((w) => w !== primary) || null;
      if (ranged) {
        const legs = [attackLeg(ranged, prog.attacks * surge, { riderDice: riders.concat(smiteRider) })];
        const far = isThrownOrRanged(ranged);
        pushLine("burst", `${far ? "Ranged" : "Melee"} Alternative · ${ranged.name}`, `Attack action: ${prog.attacks}x ${ranged.name}${far ? " from range" : " up close"}`, legs, oncePerTurnFor(), [far ? "Keeps distance when melee is unsafe" : "Closes in when ranged lines are blocked"]);
      } else if (cantrip) {
        pushLine("burst", `Cantrip · ${cantrip.name}`, `Action: ${cantrip.name}`, cantripLegs(cantrip.name), [], []);
      }
    }

    if (!lines.length) {
      pushLine("primary", "Unarmed Strike", "Attack action: unarmed strike", [attackLeg({ name: "Unarmed Strike", dice: "1d1", notes: "" }, prog.attacks, { stat: "STR" })], [], []);
    }

    lines.sort((a, b) => b.dpr - a.dpr);
    lines[0].optimal = true;

    if (lucky) notesGlobal.push("Halfling Lucky rerolls natural 1s");
    if (critMin < 20) notesGlobal.push(`Improved Critical on ${critMin}-20`);
    if (elfish && o.advantage) notesGlobal.push("Elven Accuracy 3d20 on non-STR advantage attacks");
    if (reckless) notesGlobal.push("Reckless Attack grants advantage but foes gain advantage too");

    const defenses = evaluateDefenses(ctx, o, { primary, reckless, raging });
    return { level: lv, pb, opts: o, strikes: lines, optimal: lines[0], defenses, notes: notesGlobal };
  }

  function enemyHitChance(atk, ac, adv, dis) {
    return d20Odds(atk, ac, { advantage: adv && !dis, disadvantage: dis && !adv }).pHit;
  }

  const SAVE_PATCHES = {
    STR: "Bless, Enlarge, or Resilient STR · stay near the Paladin aura",
    DEX: "Take cover, add Shield Master or Resilient DEX · spread out vs AoE",
    CON: "Resilient CON or War Caster to hold concentration · Heroism buffer",
    INT: "Resilient INT or Gnome Cunning ally · avoid mind-flayer line of sight",
    WIS: "Resilient WIS or Bless · stand inside an Aura of Protection",
    CHA: "Resilient CHA, Bless, or Protection from Evil and Good"
  };

  function evaluateDefenses(ctx, o, extra) {
    const { cl, level: lv, mods, pb, prog, scId, spId } = ctx;
    const clId = cl.id;
    const base = baseArmorClass(cl, mods);
    const acNotes = [base.note];
    let tuned = base.ac;
    const shieldProf = /shield/i.test(String(cl.armor || "")) && clId !== "monk";
    if (o.useShield) {
      if (shieldProf) {
        tuned += 2;
        acNotes.push(extra.primary && isTwoHanded(extra.primary) ? "Shield +2 · swap to a one-handed weapon" : "Shield +2");
      } else {
        acNotes.push("Shield not proficient for this class · no bonus");
      }
    }
    if (o.coverBonus) {
      tuned += o.coverBonus;
      acNotes.push(`Cover +${o.coverBonus}`);
    }
    const shieldSpell = o.reactionDef && (clId === "wizard" || clId === "sorcerer" || (clId === "fighter" && scId === "eldritch" && lv >= 3) || (clId === "warlock" && scId === "hexblade"));
    let hitAc = tuned;
    if (shieldSpell) {
      hitAc += 5;
      acNotes.push("Shield spell reaction +5 until your next turn");
    }

    const enemyAttacks = lv >= 11 ? 3 : lv >= 5 ? 2 : 1;
    const enemyDmg = 4 + Math.round(lv * 1.5);
    const foeAdv = !!extra.reckless;
    let foeDis = !!o.dodgeAction;
    if (o.reactionDef && clId === "cleric" && scId === "light") {
      foeDis = true;
      acNotes.push("Warding Flare imposes disadvantage on one attack");
    }
    const baseHit = enemyHitChance(o.enemyAtk, base.ac, false, false);
    const tunedHit = enemyHitChance(o.enemyAtk, hitAc, foeAdv, foeDis);
    if (o.dodgeAction) acNotes.push("Dodge action: attackers roll with disadvantage");
    if (foeAdv) acNotes.push("Reckless Attack hands foes advantage");

    const reductions = [];
    if (extra.raging) reductions.push({ r: 0.5, note: "Rage halves bludgeoning, piercing and slashing" });
    if (o.reactionDef) {
      if (clId === "rogue" && lv >= 5) reductions.push({ r: 0.5 / enemyAttacks, note: "Uncanny Dodge halves one hit per round" });
      if (clId === "monk" && lv >= 3) reductions.push({ r: Math.min(1, (5.5 + mods.DEX + lv) / enemyDmg) * 0.5 / enemyAttacks, note: "Deflect Missiles vs ranged hits" });
      if (spId === "goliath") reductions.push({ r: Math.min(1, (6.5 + mods.CON) / enemyDmg) / (enemyAttacks * 3), note: "Stone's Endurance 1d12 + CON once per short rest" });
    }
    if (spId === "half-orc") acNotes.push("Relentless Endurance: drop to 1 HP instead of 0 once per long rest");
    const keep = reductions.reduce((k, x) => k * (1 - x.r), 1);
    const dmgReduction = 1 - keep;
    reductions.forEach((x) => acNotes.push(x.note));

    const intakeBase = baseHit;
    const intakeTuned = tunedHit * keep;
    const ehpMultiplier = intakeTuned > 0 ? Math.round((intakeBase / intakeTuned) * 100) / 100 : 99;

    const aura = clId === "paladin" && lv >= 6 ? Math.max(1, mods.CHA) : 0;
    const diamondSoul = clId === "monk" && lv >= 14;
    const saveMods = {};
    ABILITIES.forEach((ab) => {
      const prof = diamondSoul || (Array.isArray(cl.saves) && cl.saves.includes(ab));
      saveMods[ab] = mods[ab] + (prof ? pb : 0) + aura;
    });
    if (aura) acNotes.push(`Aura of Protection +${aura} to all saves`);
    const tiePriority = ["WIS", "CON", "DEX", "STR", "CHA", "INT"];
    const weakest = tiePriority.reduce((best, ab) => (saveMods[ab] < saveMods[best] ? ab : best), tiePriority[0]);
    const foeDc = 8 + o.enemyAtk;
    const failPct = pct(saveFailOdds(foeDc, saveMods[weakest]));

    const stance = {
      barbarian: "Enter Rage as a bonus action before closing; plant between foes and the back line.",
      monk: "Patient Defense dodge when surrounded; spend ki on Step of the Wind to reposition.",
      paladin: "Hold the line inside your aura so allies inherit your save bonus.",
      rogue: "Open from hiding; Cunning Action Disengage after the strike.",
      wizard: "Pre-cast Mage Armor and keep Shield prepared for the reaction.",
      sorcerer: "Pre-cast Mage Armor; hold sorcery points for Shield or Quickened escapes.",
      fighter: "Lead with heavy armor and shield; Second Wind early when bloodied."
    }[clId] || "Pre-buff before initiative and keep a concentration spell safe.";
    const steps = [
      { phase: "Pre-Combat Stance", title: `AC ${base.ac} -> ${tuned}${shieldSpell ? ` · ${hitAc} vs Shield` : ""}`, detail: stance },
      {
        phase: "Positioning",
        title: o.coverBonus ? `Holding ${o.coverBonus === 5 ? "three-quarters" : "half"} cover` : "Seek cover",
        detail: `Use terrain for +2 or +5 AC; keep ${weakest} saves in mind and stay out of clustered AoE.`
      },
      {
        phase: "Reaction Trigger",
        title: o.reactionDef ? "Reaction armed" : "Reaction held for offense",
        detail: reductions.length || shieldSpell || foeDis
          ? acNotes.slice(1).join(" · ")
          : "Save the reaction for an Opportunity Attack when a foe breaks away."
      }
    ];

    return {
      baseAc: base.ac,
      tunedAc: tuned,
      reactionAc: hitAc,
      acNotes,
      enemyHitBasePct: pct(baseHit),
      enemyHitTunedPct: pct(tunedHit),
      dmgReductionPct: pct(dmgReduction),
      ehpMultiplier,
      saveMods,
      weakestSave: {
        stat: weakest,
        mod: saveMods[weakest],
        warning: `${ABILITY_NAMES[weakest]} save ${signed(saveMods[weakest])} fails ${failPct}% vs DC ${foeDc}`,
        patch: SAVE_PATCHES[weakest]
      },
      steps
    };
  }

  // PDF text sanitizer: map typographic glyphs to ASCII, drop anything outside Latin-1, escape PDF string delimiters.
  function ascii(str) {
    return String(str === null || str === undefined ? "" : str)
      .replace(/[\u2014\u2013\u2212]/g, "-")
      .replace(/[\u00b7\u2022]/g, "*")
      .replace(/\u2192/g, "->")
      .replace(/\u00d7/g, "x")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, "\"")
      .replace(/\u2026/g, "...")
      .replace(/[\u2605\u2606]/g, "*")
      .replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff]/gu, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function wrapText(text, maxChars) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const out = [];
    let line = "";
    words.forEach((w) => {
      if (!line) line = w;
      else if ((line + " " + w).length <= maxChars) line += " " + w;
      else {
        out.push(line);
        line = w;
      }
      while (line.length > maxChars) {
        out.push(line.slice(0, maxChars));
        line = line.slice(maxChars);
      }
    });
    if (line) out.push(line);
    return out;
  }

  // Combat spell gate: class casting, third-caster subclasses, and racial innate spells by level.
  const COMBAT_CASTER_CLASSES = ["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"];
  const nameOf = (x, fallback) => (x && typeof x === "object" && x.name ? x.name : x ? String(x) : fallback || "");

  function canCastCombatSpells(sp, sr, cl, sc, level) {
    const lv = clampLevel(level);
    const spId = idOf(sp);
    const srId = idOf(sr);
    const clId = idOf(cl);
    const scId = idOf(sc);
    const sources = [];
    if (COMBAT_CASTER_CLASSES.includes(clId)) sources.push(`${nameOf(cl, clId)} spellcasting`);
    else if (HALF_CASTERS.includes(clId) && lv >= 2) sources.push(`${nameOf(cl, clId)} spellcasting`);
    else if (lv >= 3 && ((clId === "fighter" && scId === "eldritch") || (clId === "rogue" && scId === "arcane-trickster") || (clId === "monk" && scId === "four-elements"))) {
      sources.push(`${nameOf(sc, scId)} spellcasting`);
    }
    if (spId === "tiefling" && srId !== "winged") sources.push(lv >= 5 ? "Infernal Legacy: Thaumaturgy, Hellish Rebuke, Darkness" : lv >= 3 ? "Infernal Legacy: Thaumaturgy, Hellish Rebuke" : "Infernal Legacy: Thaumaturgy");
    else if (spId === "elf" && ["high", "drow", "astral"].includes(srId)) sources.push(`${nameOf(sr, srId)} innate cantrip & spells`);
    else if (spId === "half-elf" && ["high-heritage", "drow-heritage"].includes(srId)) sources.push(`${nameOf(sr, srId)} innate cantrip & spells`);
    else if (spId === "gnome" && (srId === "forest" || (srId === "deep" && lv >= 3))) sources.push(`${nameOf(sr, srId)} innate spells`);
    else if (spId === "dwarf" && srId === "duergar" && lv >= 3) sources.push("Duergar Magic: Enlarge/Reduce, Invisibility");
    else if (spId === "halfling" && srId === "lotusden") sources.push("Lotusden Children of the Woods spells");
    else if (spId === "half-orc" && srId === "mark-finding" && lv >= 3) sources.push("Mark of Finding innate spells");
    return { canCast: sources.length > 0, sources, blockedByRage: clId === "barbarian" };
  }

  const appendNote = (text, note) => `${text || ""}${text ? " " : ""}${note}`;

  // Standard combat actions contextualized to the build; spell actions are dropped for non-casters.
  function contextualCombatActions(profile, baseActions) {
    const ctx = normalizeProfile(profile);
    const { cl, sc, sp, sr, level: lv, mods, pb, prog } = ctx;
    const clId = cl.id;
    const G = typeof window !== "undefined" ? window : globalThis;
    const fallback = G.FORGE_DATA && Array.isArray(G.FORGE_DATA.COMBAT_ACTIONS) ? G.FORGE_DATA.COMBAT_ACTIONS : [];
    const base = Array.isArray(baseActions) ? baseActions : fallback;
    const cast = canCastCombatSpells(sp, sr, cl, sc, lv);
    const castStat = cl.spellAbility || (sc && sc.spellAbility) || null;
    return base
      .filter((a) => a && (a.name !== "Cast a Spell" || cast.canCast))
      .map((a) => {
        const item = Object.assign({}, a);
        if (a.name === "Attack") {
          item.roll = `${prog.attacks}x · ${a.roll || ""}`.trim();
          item.detail = appendNote(a.detail, `${prog.attacks}x attack${prog.attacks > 1 ? "s" : ""} per Attack action.`);
          if (sp && sp.size === "Small") item.detail = appendNote(item.detail, "Small size: Disadvantage with Heavy weapons.");
        } else if (a.name === "Cast a Spell") {
          if (castStat) item.roll = `Spell attack 1d20 ${signed(pb + mods[castStat])} · Save DC ${8 + pb + mods[castStat]}`;
          item.detail = appendNote(a.detail, `Sources: ${cast.sources.join("; ")}.`);
          if (clId === "barbarian") item.detail = appendNote(item.detail, "Cannot cast or concentrate while Raging.");
        } else if (["Dash", "Disengage", "Hide"].includes(a.name)) {
          if (clId === "rogue" && lv >= 2) item.detail = appendNote(a.detail, "Cunning Action lets you take this as a Bonus Action.");
          if (clId === "monk" && lv >= 2 && a.name !== "Hide") item.detail = appendNote(a.detail, "Step of the Wind lets you take this as a Bonus Action for 1 Ki.");
        } else if (a.name === "Dodge") {
          if (clId === "monk" && lv >= 2) item.detail = appendNote(a.detail, "Patient Defense lets you Dodge as a Bonus Action for 1 Ki.");
        } else if (a.name === "Grapple" || a.name === "Shove") {
          if (clId === "barbarian") item.detail = appendNote(a.detail, "Rage grants Advantage on your Physical Power Athletics contest.");
        }
        return item;
      });
  }

  // Possible strike and defense combinations for the exact build; lists options without ranking a single best move.
  function buildCombinationsPlaybook(profile) {
    const ctx = normalizeProfile(profile);
    const { cl, sc, sp, sr, level: lv, mods, pb, prog, scId, spId } = ctx;
    const clId = cl.id;
    const srId = idOf(sr);
    const A = prog.attacks;
    const weapons = Array.isArray(cl.signatureWeapons) ? cl.signatureWeapons : [];
    const primary = weapons.find((w) => !isCantrip(w)) || null;
    const cantrip = weapons.find(isCantrip) || null;
    const atkStat = weaponStat(primary, cl, mods);
    const toHit = pb + mods[atkStat];
    const dm = mods[atkStat];
    const wd0 = parseDice(primary && primary.dice);
    const wd = wd0.count ? wd0 : { count: 1, sides: 8 };
    const wName = (primary && primary.name) || "Weapon";
    const wDice = `${wd.count}d${wd.sides}`;
    const castStat = cl.spellAbility || (sc && sc.spellAbility) || null;
    const castMod = castStat ? mods[castStat] : 0;
    const spellAtk = pb + castMod;
    const spellDc = 8 + pb + castMod;
    const kiDc = 8 + pb + mods.WIS;
    const cd = parseDice(cantrip && cantrip.dice);
    const cantripName = (cantrip && cantrip.name) || "Cantrip";
    const cantripDice = `${prog.cantripDice * (cd.count || 1)}d${cd.sides || 10}`;
    const small = !!(sp && sp.size === "Small");

    const R = (label, count, sides, bonus, keep) => {
      const r = { label, count, sides, bonus: bonus || 0 };
      if (keep) r.keep = keep;
      return r;
    };
    const hitRoll = (adv, bonus, label) => R(`${label || wName} To-Hit${adv ? " · Advantage" : ""}`, adv ? 2 : 1, 20, bonus === undefined ? toHit : bonus, adv ? "highest" : undefined);
    const dmgRoll = (extra, label) => R(`${label || wName} Damage`, wd.count, wd.sides, dm + (extra || 0));
    const strike = (name, unlock, economy, cost, formula, howToUse, rolls) => ({ name, unlock, economy, trigger: economy, cost, formula, howToUse, rolls: rolls || [] });
    const defense = (name, unlock, trigger, cost, formula, howToUse, rolls) => ({ name, unlock, trigger, economy: trigger, cost, formula, howToUse, rolls: rolls || [] });
    const chain = `${A}x [1d20 ${signed(toHit)} -> ${wDice} ${signed(dm)}]`;
    const S = [];
    const D = [];
    const N = [];

    const standardChain = () => strike(
      "Standard Attack Chain", "Lv 1", "Action", "Free", chain,
      `Take the Attack action with your ${wName} for ${A} strike${A > 1 ? "s" : ""}; you may split strikes across targets and move between them.`,
      [hitRoll(false), dmgRoll()]
    );
    const cantripStrike = (extraFlat, extraNote) => {
      const save = /save/i.test((cantrip && cantrip.notes) || "");
      const head = save ? `DC ${spellDc} save` : `1d20 ${signed(spellAtk)}`;
      const flat = extraFlat || 0;
      return strike(
        `${cantripName} Cantrip Volley`, "Lv 1", "Action", "At-will", `${head} -> ${cantripDice}${flat ? ` ${signed(flat)}` : ""}`,
        `${save ? "Targets roll the save instead of you rolling to hit, so it shines against high-AC foes." : "Ranged spell attack that never spends a slot."} Dice scale at Lv 5, 11, and 17.${extraNote ? ` ${extraNote}` : ""}`,
        save ? [R(`${cantripName} Damage`, prog.cantripDice * (cd.count || 1), cd.sides || 10, flat)] : [hitRoll(false, spellAtk, cantripName), R(`${cantripName} Damage`, prog.cantripDice * (cd.count || 1), cd.sides || 10, flat)]
      );
    };

    if (clId === "fighter") {
      S.push(standardChain());
      if (lv >= 2) {
        S.push(strike(
          "Action Surge Double-Attack Combo", "Lv 2+", "Action + Action Surge", `${lv >= 17 ? 2 : 1}/Short Rest`, `${A * 2}x weapon strikes this turn`,
          `Use Action Surge to take a second full Attack action on the same turn for ${A * 2}x total strikes, or Dash + Full Attack to close distance and still swing.`,
          [hitRoll(false), dmgRoll()]
        ));
      }
      if (lv >= 3 && scId === "battlemaster") {
        const sd = parseDice(prog.superiorityDie || "1d8");
        S.push(strike(
          "Maneuver Strike: Trip or Precision Attack", "Lv 3+", "On hit or after the roll", "1 Superiority Die", `+${prog.superiorityDie || "1d8"} · Trip: STR save DC ${8 + pb + Math.max(mods.STR, mods.DEX)} or Prone`,
          `Spend ${prog.superiorityDie || "1d8"} on Trip Attack to knock a foe Prone so your remaining melee strikes roll with Advantage, or on Precision Attack to rescue a near-miss after seeing the d20.`,
          [R("Superiority Die", sd.count, sd.sides, 0)]
        ));
      } else if (lv >= 3 && scId === "champion") {
        const range = lv >= 15 ? "18–20" : "19–20";
        S.push(strike(
          "Improved Critical Crit-Fishing", "Lv 3+", "Every attack roll", "Free", `Crit on ${range} · crit damage ${wd.count * 2}d${wd.sides} ${signed(dm)}`,
          `Every extra strike from Extra Attack or Action Surge is another roll at a ${range} crit range; stack Advantage sources like Prone foes to fish harder.`,
          [hitRoll(false), R(`${wName} Crit Damage`, wd.count * 2, wd.sides, dm)]
        ));
      } else if (lv >= 3 && scId === "echo") {
        S.push(strike(
          "Manifest Echo + Unleash Incarnation", "Lv 3+", "Bonus Action echo, then Attack action", `${Math.max(1, mods.CON)}/Long Rest`, `${A + 1}x strikes, one from the echo's space`,
          "Manifest your echo as a Bonus Action, then when you take the Attack action add one extra melee attack from the echo's position to hit foes out of your reach.",
          [hitRoll(false), dmgRoll()]
        ));
      } else if (lv >= 3 && scId === "eldritch") {
        S.push(strike(
          lv >= 7 ? "War Magic: Cantrip + Bonus Weapon Strike" : "Eldritch Cantrip Opener + Weapon Chain", lv >= 7 ? "Lv 7+" : "Lv 3+", lv >= 7 ? "Action cantrip + Bonus Action attack" : "Action", "At-will",
          `Spell 1d20 ${signed(pb + mods.INT)} cantrip + 1d20 ${signed(toHit)} -> ${wDice} ${signed(dm)}`,
          lv >= 7 ? "Cast a cantrip like Booming Blade with your Action and follow with one weapon attack as a Bonus Action." : "Open with a ranged cantrip while closing distance, then switch to the weapon chain once in reach.",
          [hitRoll(false, pb + mods.INT, "Cantrip"), hitRoll(false), dmgRoll()]
        ));
      }
    } else if (clId === "barbarian") {
      S.push(strike(
        "Rage + Attack Chain", "Lv 1", "Bonus Action Rage, then Attack", "1 Rage", `${A}x [1d20 ${signed(toHit)} -> ${wDice} ${signed(dm + prog.rageDmg)}]`,
        `Enter Rage as a Bonus Action, then Attack; +${prog.rageDmg} damage applies to every STR melee hit and you resist bludgeoning, piercing, and slashing.`,
        [hitRoll(false), dmgRoll(prog.rageDmg)]
      ));
      if (lv >= 2) {
        const extra = [];
        if (prog.brutalCritDice) extra.push(`Brutal Critical +${prog.brutalCritDice}d${wd.sides}`);
        if (spId === "half-orc") extra.push(`Savage Attacks +1d${wd.sides}`);
        S.push(strike(
          "Reckless Attack Advantage Engine", "Lv 2+", "First attack of your turn", "Foes get Advantage on you until your next turn", `2d20kh1 ${signed(toHit)} on STR melee${extra.length ? ` · crit adds ${extra.join(" + ")}` : ""}`,
          `Advantage roughly doubles your crit chance${extra.length ? `, feeding ${extra.join(" and ")}` : ""}; use it when you can afford to be hit back.`,
          [hitRoll(true), dmgRoll(prog.rageDmg), R(`${wName} Crit Damage`, wd.count * 2 + prog.brutalCritDice + (spId === "half-orc" ? 1 : 0), wd.sides, dm + prog.rageDmg)]
        ));
      }
      if (lv >= 3 && scId === "totem") {
        S.push(strike("Totem Spirit Frontline Rage", "Lv 3+", "While Raging", "1 Rage", "Wolf: allies gain Advantage on melee vs foes within 5 ft of you · Bear: resist all damage but psychic", "Pick Wolf to turn your position into an Advantage zone for the whole party, or Bear to soak hits while allies strike.", []));
      } else if (lv >= 3 && scId === "berserker") {
        S.push(strike("Frenzy Bonus-Action Swing", "Lv 3+", "Bonus Action each turn while Raging", "1 level of Exhaustion when Rage ends", `${A + 1}x STR melee strikes per turn`, "Frenzy adds a melee weapon attack as a Bonus Action every turn of the Rage; save it for the fights that matter.", [hitRoll(false), dmgRoll(prog.rageDmg)]));
      } else if (lv >= 3 && scId === "zealot") {
        const flat = Math.floor(lv / 2);
        S.push(strike("Divine Fury First-Hit Rider", "Lv 3+", "First hit each turn while Raging", "Free", `+1d6 ${signed(flat)} radiant or necrotic once per turn`, "Your first weapon hit each turn while Raging adds Divine Fury; Reckless Attack makes landing that first hit near-certain.", [R("Divine Fury", 1, 6, flat)]));
      } else if (lv >= 3 && scId === "ancestral") {
        S.push(strike("Ancestral Protectors Boss Mark", "Lv 3+", "First creature you hit each turn while Raging", "Free", "Marked foe has Disadvantage on attacks vs anyone but you · others resist its damage", "Hit the biggest threat first each turn so it must swing at you or suffer Disadvantage.", []));
      }
      S.push(strike(
        "Rage-Boosted Grapple + Shove Prone Combo", "Lv 1", A > 1 ? "Two attacks of one Attack action" : "Attack action across two turns", "Free", `Athletics 2d20kh1 ${signed(mods.STR + pb)} vs Athletics or Acrobatics`,
        "Advantage on Athletics: Shove prone + Grapple = foe has 0 speed so it cannot stand up, and every melee attack against it has Advantage.",
        [R("Athletics · Advantage", 2, 20, mods.STR + pb, "highest")]
      ));
    } else if (clId === "paladin") {
      if (lv >= 2) {
        const smite = 2;
        S.push(strike(
          "Weapon Chain + Post-Hit Divine Smite", "Lv 2+", "On a melee hit", "1 Spell Slot per Smite", `${chain} + ${smite}d8 radiant per 1st slot, +1d8 per slot above 1st, max 5d8, +1d8 vs undead or fiends${prog.improvedSmite ? " · Improved Smite +1d8 every hit" : ""}`,
          "Declare Smite after seeing a hit; save higher slots for Nat 20 crits where all Smite dice double.",
          [hitRoll(false), dmgRoll(), R("Divine Smite 1st", smite, 8, 0), R("Crit Smite 1st", smite * 2, 8, 0)]
        ));
      } else {
        S.push(standardChain());
      }
      if (lv >= 3) {
        const cdMap = {
          vengeance: ["Vow of Enmity Advantage Lock", "Advantage on every attack vs one creature for 1 minute", "Bonus Action Vow, then hunt that target; Advantage doubles your crit odds for Smite dumps."],
          devotion: ["Sacred Weapon Accuracy", `+${Math.max(1, mods.CHA)} to hit for 1 minute`, "Action to empower your weapon before the fight, then every strike lands more reliably."],
          conquest: ["Conquering Presence Fear Lock + Guided Strike", `WIS save DC ${spellDc} or Frightened · Guided Strike +10 to one attack`, "Frighten clustered foes, or add +10 to a crucial attack roll after seeing the d20."],
          ancients: ["Nature's Wrath Restrain", `STR or DEX save DC ${spellDc} or Restrained`, "Restrained foes grant Advantage to the whole party; follow with Smites."]
        };
        const pick = cdMap[scId];
        if (pick) S.push(strike(pick[0], "Lv 3+", "Channel Divinity", "1 Channel Divinity", pick[1], pick[2], []));
      }
      if (lv >= 2) {
        S.push(strike("Bless or Wrathful Smite + Melee", "Lv 2+", "Bonus Action spell, then Attack", "1 Spell Slot · Concentration", "Bless: +1d4 to attacks and saves for 3 creatures · Wrathful Smite: +1d6 psychic and WIS save or Frightened", "Open with Bless for the party or a smite spell for control; it occupies your Concentration and your Bonus Action.", [R("Bless", 1, 4, 0)]));
      }
    } else if (clId === "rogue") {
      const sn = prog.sneakDice;
      S.push(strike(
        "Ally-Adjacent Sneak Attack", "Lv 1", "Action", "Once per turn", `1d20 ${signed(toHit)} -> ${wDice} ${signed(dm)} + ${sn}d6`,
        "Needs a finesse or ranged weapon and either Advantage or an ally within 5 ft of the target with no Disadvantage.",
        [hitRoll(false), dmgRoll(), R("Sneak Attack", sn, 6, 0)]
      ));
      if (lv >= 2) {
        S.push(strike(
          "Cunning Action Hide -> Advantage Sneak Attack", "Lv 2+", "Bonus Action Hide, then Attack", "Free", `Stealth 1d20 ${signed(mods.DEX + pb)} vs passive Perception -> 2d20kh1 ${signed(toHit)}`,
          "Hide behind cover or obscurement as a Bonus Action; an unseen attacker rolls with Advantage, unlocking Sneak Attack with no ally nearby.",
          [R("Stealth", 1, 20, mods.DEX + pb), hitRoll(true), R("Sneak Attack", sn, 6, 0)]
        ));
      }
      S.push(strike(
        "Two-Weapon Double-Chance Sneak", "Lv 1", "Attack + Bonus Action off-hand", "Uses your Bonus Action", `Off-hand 1d4 ${signed(Math.min(0, mods.DEX))} -> ${sn}d6 if main attack missed`,
        `The off-hand light dagger gives a second chance to land ${sn}d6 if the main attack misses; it competes with Cunning Action for your Bonus Action.`,
        [hitRoll(false), R("Off-hand Dagger Damage", 1, 4, Math.min(0, mods.DEX)), R("Sneak Attack", sn, 6, 0)]
      ));
      if (lv >= 3) {
        const rMap = {
          assassin: ["Assassinate Surprise Crit", "Advantage vs creatures that have not acted · hits vs surprised foes are crits", `Win Initiative and strike first: a surprised hit doubles weapon and ${sn}d6 Sneak dice.`, [hitRoll(true), R("Crit Sneak Attack", sn * 2, 6, 0)]],
          swashbuckler: ["Rakish Audacity Duel + Fancy Footwork", "Sneak Attack when you and target are alone within 5 ft · no Opportunity Attacks from foes you attacked", "Duel isolated foes for Sneak Attack, then walk away freely without Disengage.", [hitRoll(false), R("Sneak Attack", sn, 6, 0)]],
          "arcane-trickster": ["Familiar Help -> Advantage Sneak", lv >= 13 ? "Versatile Trickster: Mage Hand grants Advantage" : "Find Familiar takes the Help action", "Have your familiar or Mage Hand set up Advantage so every turn opens with a Sneak Attack.", [hitRoll(true), R("Sneak Attack", sn, 6, 0)]],
          thief: ["Fast Hands Object Combo", "Bonus Action Use an Object: caltrops, ball bearings, oil, or healer's kit", "Spend the Bonus Action on battlefield objects while the Action keeps Sneak Attacking.", []]
        };
        const pick = rMap[scId];
        if (pick) S.push(strike(pick[0], "Lv 3+", "Subclass feature", "Free", pick[1], pick[2], pick[3]));
      }
    } else if (clId === "monk") {
      const md = parseDice(prog.martialDie);
      S.push(strike(
        "Attack + Martial Arts Free Bonus Unarmed", "Lv 1", "Attack, then Bonus Action", "Free", `${A}x weapon + 1x unarmed ${prog.martialDie} ${signed(mods.DEX)}`,
        `Any turn you take the Attack action you may make one unarmed strike as a Bonus Action using your ${prog.martialDie} Martial Arts die.`,
        [hitRoll(false), R("Unarmed Damage", md.count, md.sides, mods.DEX)]
      ));
      if (lv >= 2) {
        S.push(strike("Flurry of Blows Chain", "Lv 2+", "Attack, then Bonus Action", "1 Ki", `${A + 2}x strikes · 2 bonus unarmed ${prog.martialDie} ${signed(mods.DEX)}`, "Spend 1 Ki after the Attack action to make two unarmed strikes instead of one.", [hitRoll(false), R("Unarmed Damage", md.count, md.sides, mods.DEX)]));
      }
      if (lv >= 5) {
        S.push(strike("Stunning Strike Setup", "Lv 5+", "On a melee hit", "1 Ki per attempt", `CON save DC ${kiDc} or Stunned until end of your next turn`, "A stunned target grants Advantage to the whole party and auto-fails STR and DEX saves; try on early hits so Flurry follows up.", []));
      }
      if (lv >= 3) {
        const mMap = {
          "open-hand": ["Open Hand Technique Flurry", `Each Flurry hit: DEX save DC ${kiDc} or Prone, STR save or pushed 15 ft, or no reactions`, "Knock foes Prone for party Advantage, push them off ledges, or strip reactions so you can leave freely."],
          shadow: ["Shadow Arts Darkness + Shadow Step", lv >= 6 ? "60 ft Bonus Action teleport between shadows, then Advantage on next melee attack" : "2 Ki Darkness, Pass without Trace, or Silence", "Blanket a zone in Darkness, then step shadow to shadow for Advantage strikes."],
          mercy: ["Hand of Harm Necrotic Rider", `+${prog.martialDie} ${signed(mods.WIS)} necrotic once per turn`, "Spend 1 Ki when an unarmed strike hits to add Hand of Harm; Flurry gives more chances to land it."],
          "four-elements": ["Elemental Discipline Spell Strike", `Ki-fuelled disciplines like Fangs of the Fire Snake or Water Whip · DC ${kiDc}`, "Mix elemental reach or control disciplines into your melee chain."]
        };
        const pick = mMap[scId];
        if (pick) S.push(strike(pick[0], "Lv 3+", "Subclass feature", scId === "mercy" ? "1 Ki" : "Ki", pick[1], pick[2], []));
      }
    } else if (clId === "ranger") {
      S.push(standardChain());
      if (lv >= 2) {
        S.push(strike("Hunter's Mark + Attack Chain", "Lv 2+", "Bonus Action cast, then Attack", "1st-level slot · Concentration", `${chain} + 1d6 per hit`, "Mark your quarry once and every weapon hit adds 1d6; move the mark with a Bonus Action when the target drops.", [hitRoll(false), dmgRoll(), R("Hunter's Mark", 1, 6, 0)]));
      }
      if (lv >= 3) {
        const rgMap = {
          hunter: ["Colossus Slayer Rider", "+1d8 once per turn vs a target below its HP max", [R("Colossus Slayer", 1, 8, 0)]],
          gloom: ["Dread Ambusher Opening Volley", "First turn: +10 ft speed and one extra attack that adds +1d8", [R("Dread Ambusher", 1, 8, 0)]],
          fey: ["Dreadful Strikes Psychic Rider", `+1d${lv >= 11 ? 6 : 4} psychic once per turn per target`, [R("Dreadful Strikes", 1, lv >= 11 ? 6 : 4, 0)]],
          swarmkeeper: ["Gathered Swarm Push", "Once per turn: +1d6 piercing, push 15 ft, or move yourself 5 ft", [R("Gathered Swarm", 1, 6, 0)]],
          "beast-master": ["Beast Companion Pincer", "Command your companion to attack the same target for flanking pressure", []]
        };
        const pick = rgMap[scId];
        if (pick) S.push(strike(pick[0], "Lv 3+", "On a weapon hit", "Free", pick[1], "Layers on top of Hunter's Mark and Extra Attack.", pick[2]));
      }
      S.push(strike("Two-Weapon Hunter's Mark Tap", "Lv 2+", "Attack + Bonus Action off-hand", "Uses your Bonus Action", `Off-hand shortsword 1d6 ${signed(Math.min(0, mods.DEX))} + 1d6 Hunter's Mark`, "An off-hand hit triggers another Hunter's Mark die; not available on the turn you cast or move the mark.", [R("Off-hand Damage", 1, 6, Math.min(0, mods.DEX)), R("Hunter's Mark", 1, 6, 0)]));
    } else if (["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"].includes(clId)) {
      if (clId === "warlock") {
        const ag = lv >= 2 ? castMod : 0;
        S.push(strike(
          `Hex + ${prog.cantripDice}-Beam Eldritch Blast`, "Lv 1", "Bonus Action Hex, then Action", "1 Pact Slot · Concentration", `${prog.cantripDice}x [1d20 ${signed(spellAtk)} -> 1d10${ag ? ` ${signed(ag)}` : ""} + 1d6 Hex]`,
          `Each beam rolls separately and each hit adds Hex${lv >= 2 ? " and Agonizing Blast" : ""}; Hex moves to a new target when the first drops.`,
          [hitRoll(false, spellAtk, "Eldritch Blast"), R("Beam Damage", 1, 10, ag), R("Hex", 1, 6, 0)]
        ));
        if (lv >= 3) S.push(strike("Darkness + Devil's Sight", "Lv 3+", "Action cast", "1 Pact Slot · Concentration", "You attack with Advantage and foes inside attack you with Disadvantage", "Cast Darkness on yourself and fight from inside it; it blinds allies too, so coordinate.", [hitRoll(true, spellAtk, "Eldritch Blast")]));
        if (lv >= 2) S.push(strike("Repelling Blast Hazard Push", "Lv 2+", "Each beam hit", "Invocation", "Push 10 ft per beam hit", "Shove foes into Spike Growth, off ledges, or out of reach of allies.", []));
        if (scId === "hexblade") S.push(strike("Hexblade's Curse + Hex Warrior", "Lv 1", "Bonus Action curse", "1/Short Rest", `+${pb} damage vs cursed target · crit on 19–20 · weapon uses CHA`, "Curse the boss, then crit-fish with CHA weapon strikes or blasts.", [R("Curse Bonus", 0, 0, pb)]));
        if (scId === "genie") S.push(strike("Genie's Wrath Rider", "Lv 1", "Once per turn on hit", "Free", `+${pb} elemental damage`, "Add Genie's Wrath to your first hit each turn, usually the first Eldritch Blast beam.", []));
        if (scId === "archfey") S.push(strike("Fey Presence Charm Burst", "Lv 1", "Action", "1/Short Rest", `10 ft cube · WIS save DC ${spellDc} or Charmed or Frightened`, "Frighten clustered melee foes so they cannot close on you.", []));
      } else {
        let flat = 0;
        let note = "";
        if (clId === "cleric" && lv >= 8 && ["light", "twilight"].includes(scId)) {
          flat = castMod;
          note = "Potent Spellcasting adds your casting modifier.";
        }
        if (cantrip) S.push(cantripStrike(flat, note));
      }
      if (clId === "bard") {
        S.push(strike("Bonus Bardic Inspiration + Control Spell", "Lv 1", "Bonus Action inspire, Action cast", "1 Inspiration + slot · Concentration", `Ally +${prog.bardicDie} · Faerie Fire, Hold Person, or Hypnotic Pattern DC ${spellDc}`, "Inspire a striker with your Bonus Action, then lock foes down with your Action.", [R("Bardic Inspiration", 1, parseDice(prog.bardicDie).sides, 0)]));
        const bMap = {
          valor: ["Combat Inspiration Damage Boost", lv >= 6 ? "Extra Attack + ally adds Inspiration to damage" : "Ally adds Inspiration die to a damage roll"],
          swords: ["Blade Flourish Rider", `+${prog.bardicDie} damage with Slashing, Mobile, or Defensive Flourish`],
          lore: ["Magical Secrets Pick-Up", lv >= 6 ? "Steal any class spell like Spirit Guardians or Counterspell" : "Extra skills and Cutting Words support"],
          eloquence: ["Unsettling Words -> Save Spell", `Subtract ${prog.bardicDie} from target's next save, then cast a save spell DC ${spellDc}`]
        };
        const pick = lv >= 3 ? bMap[scId] : null;
        if (pick) S.push(strike(pick[0], "Lv 3+", "Subclass feature", "1 Inspiration", pick[1], "Spend Inspiration dice offensively instead of only on allies.", []));
      }
      if (clId === "cleric") {
        if (lv >= 5) S.push(strike("Spirit Guardians + Spiritual Weapon", "Lv 5+", "Action, then Bonus Action", "3rd + 2nd slot · Concentration on Guardians only", `3d8 WIS save DC ${spellDc} aura + 1d8 ${signed(castMod)} force`, "Cast Spirit Guardians, then Spiritual Weapon next turn; after that use cantrips or Dodge while both keep working.", [R("Spirit Guardians", 3, 8, 0), R("Spiritual Weapon", 1, 8, castMod)]));
        else if (lv >= 3) S.push(strike("Spiritual Weapon + Cantrip", "Lv 3+", "Bonus Action weapon, Action cantrip", "2nd slot · no Concentration", `1d8 ${signed(castMod)} force + ${cantripName}`, "Spiritual Weapon frees your Concentration for Bless while still adding a bonus-action strike each turn.", [hitRoll(false, spellAtk, "Spiritual Weapon"), R("Spiritual Weapon", 1, 8, castMod)]));
        else S.push(strike("Guiding Bolt Advantage Setup", "Lv 1", "Action", "1st slot", `1d20 ${signed(spellAtk)} -> 4d6 radiant · next attack vs target has Advantage`, "Hit with Guiding Bolt so your party's next strike, or a Rogue's Sneak Attack, rolls with Advantage.", [hitRoll(false, spellAtk, "Guiding Bolt"), R("Guiding Bolt", 4, 6, 0)]));
        const cMap = {
          light: lv >= 2 ? ["Radiance of the Dawn", "Channel Divinity", `30 ft · CON save DC ${spellDc} · 2d10 ${signed(lv)} radiant, half on save`, [R("Radiance of the Dawn", 2, 10, lv)]] : null,
          tempest: lv >= 2 ? ["Destructive Wrath Max Thunder", "Channel Divinity", "Maximize lightning or thunder damage from Thunderwave, Shatter, or Call Lightning", []] : null,
          life: lv >= 8 ? ["Divine Strike Radiant Rider", "Once per turn on weapon hit", `+${lv >= 14 ? 2 : 1}d8 radiant`, [R("Divine Strike", lv >= 14 ? 2 : 1, 8, 0)]] : null,
          twilight: lv >= 8 ? ["Divine Strike Radiant Rider", "Once per turn on weapon hit", `+${lv >= 14 ? 2 : 1}d8 radiant`, [R("Divine Strike", lv >= 14 ? 2 : 1, 8, 0)]] : null
        };
        const pick = cMap[scId];
        if (pick) S.push(strike(pick[0], lv >= 8 ? "Lv 8+" : "Lv 2+", pick[1], pick[1] === "Channel Divinity" ? "1 Channel Divinity" : "Free", pick[2], "Domain feature that stacks with your cantrip or spell line.", pick[3]));
      }
      if (clId === "druid") {
        if (lv >= 2) S.push(strike("Concentration Terrain Spell + Wild Shape", "Lv 2+", "Action cast, later Wild Shape", "Slot + 1 Wild Shape", "Entangle, Spike Growth, or Call Lightning keeps running while you fight in beast form", "Concentration survives Wild Shape, so lock the field first and then brawl or scout as a beast.", []));
        S.push(strike("Shillelagh Melee", "Lv 1", "Bonus Action cast, then Attack", "At-will", `1d20 ${signed(spellAtk)} -> 1d8 ${signed(castMod)} bludgeoning`, "Turn your staff into a WIS-powered weapon when foes close in.", [hitRoll(false, spellAtk, "Shillelagh"), R("Shillelagh Damage", 1, 8, castMod)]));
        const dMap = {
          moon: lv >= 2 ? ["Combat Wild Shape", `Bonus Action shape into a CR ${lv >= 6 ? Math.floor(lv / 3) : 1} beast; beast HP shields your own`] : null,
          stars: lv >= 2 ? ["Starry Form Archer", `Bonus Action luminous arrow 1d20 ${signed(spellAtk)} -> ${lv >= 10 ? 2 : 1}d8 ${signed(castMod)} radiant`] : null,
          shepherd: lv >= 2 ? ["Spirit Totem Hawk Advantage", "Reaction grants an ally Advantage on an attack in the aura"] : null,
          land: lv >= 3 ? ["Circle Spell Expanded Arsenal", "Always-prepared circle spells like Call Lightning or Spike Growth"] : null
        };
        const pick = dMap[scId];
        if (pick) S.push(strike(pick[0], "Lv 2+", "Subclass feature", "Wild Shape use or free", pick[1], "Circle feature that layers onto your concentration spell.", []));
      }
      if (clId === "sorcerer") {
        if (lv >= 3) S.push(strike("Quickened Spell + Cantrip", "Lv 3+", "Bonus Action leveled spell + Action cantrip", "2 Sorcery Points", `Leveled spell + ${cantripName} ${cantripDice}`, "With a Bonus Action spell the only other spell that turn must be a cantrip; Quicken a control spell, then cantrip.", [hitRoll(false, spellAtk, cantripName)]));
        if (lv >= 3) S.push(strike("Twinned Buff or Debuff", "Lv 3+", "Action", "Sorcery Points equal to spell level", "Haste, Hold Person, or Polymorph on two targets", "Double a single-target spell for one slot.", []));
        const sMap = {
          draconic: lv >= 6 ? ["Elemental Affinity Damage", `+${castMod} to one damage roll of your ancestry type`] : null,
          "wild-magic": ["Tides of Chaos Advantage", "Gain Advantage on one attack, check, or save 1/Long Rest"],
          aberrant: ["Psionic Spells Mind Sliver Setup", `Mind Sliver INT save DC ${spellDc} -> target subtracts 1d4 from its next save`]
        };
        const pick = sMap[scId];
        if (pick) S.push(strike(pick[0], scId === "draconic" ? "Lv 6+" : "Lv 1", "Subclass feature", "Free", pick[1], "Origin feature that sharpens your blast or control line.", []));
      }
      if (clId === "wizard") {
        S.push(strike("Control Zone + Cantrip", "Lv 1", "Action cast, then cantrips", "Slot · Concentration", lv >= 3 ? `Web or Hypnotic Pattern DC ${spellDc}` : `Sleep or Grease DC ${spellDc}`, "Lock down part of the battlefield on round 1, then keep pressure with cantrips while Concentration holds.", []));
        if (lv >= 5) S.push(strike("Fireball AoE", "Lv 5+", "Action", "3rd slot", `20 ft sphere · DEX save DC ${spellDc} · 8d6 fire, half on save`, "Hit clustered foes; positioning beats single-target damage.", [R("Fireball", 8, 6, scId === "evocation" && lv >= 10 ? castMod : 0)]));
        const zMap = {
          evocation: lv >= 2 ? ["Sculpt Spells Safe AoE", "Allies auto-succeed and take no damage from your evocation spells"] : null,
          divination: lv >= 2 ? ["Portent Forced Fail", "Replace a foe's save with a low Portent d20 before your big spell"] : null,
          bladesinging: lv >= 6 ? ["Bladesong Extra Attack + Cantrip", "Replace one Extra Attack with a cantrip like Booming Blade"] : null
        };
        const pick = zMap[scId];
        if (pick) S.push(strike(pick[0], scId === "bladesinging" ? "Lv 6+" : "Lv 2+", "Subclass feature", "Free", pick[1], "Tradition feature that makes your control spells hit harder or safer.", []));
      }
    } else {
      S.push(standardChain());
    }

    // Species and sub-race strike options.
    const spStrike = (() => {
      const breathDc = 8 + mods.CON + pb;
      if (spId === "half-orc") return strike("Half-Orc Savage Attacks", "Lv 1", "On a melee crit", "Free", `Crit adds +1d${wd.sides}`, "One extra weapon die on every melee critical hit; stacks with Advantage sources.", [R("Savage Attacks", 1, wd.sides, 0)]);
      if (spId === "dragonborn") {
        const swap = ["chromatic", "metallic", "gem"].includes(srId);
        return strike(`Dragonborn ${prog.breathDice} Breath Swap`, "Lv 1", swap ? "Replaces one attack" : "Action", `${pb}/Long Rest`, `${prog.breathDice} · DEX or CON save DC ${breathDc}, half on save`, swap ? "Swap one attack of your Attack action for the breath to hit a whole line or cone." : "Spend your Action on the breath when foes cluster.", [R("Breath Weapon", parseDice(prog.breathDice).count, 6, 0)]);
      }
      if (spId === "goliath") {
        const gMap = { fire: ["Goliath Fire's Burn Rider", "+1d10 fire on a hit"], frost: ["Goliath Frost's Chill Rider", "+1d6 cold and -10 ft speed on a hit"], "hill-giant": ["Goliath Hill's Tumble Rider", "Large or smaller target falls Prone on a hit"], cloud: ["Goliath Cloud's Jaunt", "Bonus Action teleport 30 ft before striking"], storm: ["Goliath Storm's Thunder", "Reaction 1d8 thunder to a creature that damages you"] };
        const pick = gMap[srId];
        if (pick) return strike(pick[0], "Lv 1", srId === "storm" ? "Reaction" : "On hit", `${pb}/Long Rest`, pick[1], "Giant Ancestry rider that layers onto any weapon hit.", []);
        return null;
      }
      if (spId === "halfling") return strike(srId === "lightfoot" ? "Halfling Naturally Stealthy Hide Loop" : "Halfling Lucky Strike Insurance", "Lv 1", srId === "lightfoot" ? "Hide behind a larger ally" : "Any natural 1", "Free", srId === "lightfoot" ? "Hide behind a Medium ally -> Advantage on your next attack" : "Reroll natural 1s on attacks", srId === "lightfoot" ? "You can hide behind any creature a size larger than you for Advantage strikes." : "Lucky removes most automatic misses from your attack chain.", []);
      if (spId === "elf" && srId === "drow" && lv >= 3) return strike("Drow Faerie Fire Setup", "Lv 3+", "Action", "1/Long Rest · Concentration", "Outlined foes grant Advantage to everyone", "Light up invisible or evasive foes so the whole party strikes with Advantage.", []);
      if (spId === "half-elf" && srId === "drow-heritage" && lv >= 3) return strike("Drow Heritage Faerie Fire Setup", "Lv 3+", "Action", "1/Long Rest · Concentration", "Outlined foes grant Advantage to everyone", "Grant your party Advantage against a cluster of foes.", []);
      if (spId === "elf" && srId === "eladrin") return strike("Eladrin Fey Step Strike", "Lv 1", "Bonus Action teleport", `${pb}/Long Rest`, "Teleport 30 ft, then Attack", "Close distance or escape a grapple without provoking.", []);
      if (spId === "tiefling" && srId !== "winged" && lv >= 3) return strike("Tiefling Hellish Rebuke Punish", "Lv 3+", "Reaction when damaged", "1/Long Rest", `2d10 fire · DEX save, half on save`, "Retaliate on the enemy turn without spending your Action.", [R("Hellish Rebuke", 2, 10, 0)]);
      if (spId === "aasimar" && lv >= 3) {
        const aMap = { protector: "Radiant Soul: fly 30 ft and +PB radiant once per turn", scourge: "Radiant Consumption: PB radiant to nearby foes each turn", fallen: "Necrotic Shroud: CHA save or Frightened and +PB necrotic once per turn" };
        return strike("Aasimar Celestial Revelation Burst", "Lv 3+", "Bonus Action transform", "1/Long Rest", aMap[srId] || `+${pb} radiant or necrotic once per turn for 1 minute`, "Transform at the start of a hard fight to add damage to every turn.", [R("Celestial Revelation", 0, 0, pb)]);
      }
      if (spId === "dwarf" && srId === "duergar" && lv >= 3) return strike("Duergar Enlarge Strike", "Lv 3+", "Action cast", "1/Long Rest", "Advantage on STR checks and saves · +1d4 weapon damage", "Enlarge before Grapples and heavy strikes.", [R("Enlarge", 1, 4, 0)]);
      if (spId === "tabaxi") return strike("Tabaxi Feline Agility Pounce", "Lv 1", "Movement", "Recharges after a turn with 0 movement", "Double speed this turn, then Attack", "Burst across the field to reach the backline before attacking.", []);
      if (spId === "human" && srId === "variant") return strike("Variant Human Feat Strike", "Lv 1", "Feat", "Free", "Great Weapon Master or Sharpshooter: -5 to hit for +10 damage", "Trade accuracy for damage when you have Advantage or the foe has low AC.", []);
      if (spId === "gnome" && srId === "forest") return strike("Forest Gnome Minor Illusion Cover", "Lv 1", "Action", "At-will", "Conjure an illusory crate to hide behind", "Create instant cover to Hide next round and strike with Advantage.", []);
      return null;
    })();
    if (spStrike) S.push(spStrike);

    const fillers = [
      strike("Help + Flank Advantage Setup", "Lv 1", "Action", "Free", "Ally gets Advantage on its next attack vs the target", "Spend your Action on Help so a heavy hitter rolls with Advantage when your own strike is weaker.", []),
      strike("Ready Action Trigger Strike", "Lv 1", "Action, then Reaction", "Uses your Reaction", "Attack or cantrip fires on a trigger you name", "Ready a strike for when a foe rounds the corner or steps into reach.", [hitRoll(false)]),
      strike("Grapple + Shove Prone Lock", "Lv 1", A > 1 ? "Two attacks of one Attack action" : "Attack action across two turns", "Free", `Athletics 1d20 ${signed(mods.STR)} contest`, "Grappled and Prone foes cannot stand, giving every melee attacker Advantage.", [R("Athletics", 1, 20, mods.STR)])
    ];
    for (let i = 0; S.length < 4 && i < fillers.length; i++) {
      if (!S.some((s) => s.name === fillers[i].name || (fillers[i].name.startsWith("Grapple") && /Grapple/.test(s.name)))) S.push(fillers[i]);
    }

    // Defense, survival and reaction options.
    const has = (list, ids) => ids.includes(list);
    if (clId === "fighter") {
      D.push(defense("Second Wind Self-Heal", "Lv 1", "Bonus Action", "1/Short Rest", `1d10 ${signed(lv)} HP`, "Heal mid-fight without losing your Attack action.", [R("Second Wind", 1, 10, lv)]));
      if (lv >= 9) D.push(defense("Indomitable Save Reroll", "Lv 9+", "After a failed save", `${lv >= 17 ? 3 : lv >= 13 ? 2 : 1}/Long Rest`, "Reroll a failed saving throw", "Save it for charm, paralysis, or banishment effects.", []));
      if (scId === "battlemaster" && lv >= 3) D.push(defense("Parry Maneuver", "Lv 3+", "Reaction when hit in melee", "1 Superiority Die", `Reduce damage by ${prog.superiorityDie} ${signed(mods.DEX)}`, "Blunt a big hit when you cannot avoid it.", [R("Parry", 1, parseDice(prog.superiorityDie || "1d8").sides, mods.DEX)]));
      if (scId === "eldritch" && lv >= 3) D.push(defense("Shield Spell", "Lv 3+", "Reaction when hit", "1st slot", "+5 AC until your next turn", "Turns a hit into a miss and protects you from Magic Missile.", []));
    } else if (clId === "barbarian") {
      D.push(defense("Rage Resistance + Unarmored Defense", "Lv 1", "While Raging", "1 Rage", `Halve bludgeoning, piercing, slashing · AC 10 ${signed(mods.DEX)} ${signed(mods.CON)}`, scId === "totem" && lv >= 3 ? "Bear Totem extends Rage resistance to every damage type except psychic." : "Rage halves weapon damage, offsetting Reckless Attack.", []));
      if (lv >= 2) D.push(defense("Danger Sense", "Lv 2+", "DEX saves vs effects you can see", "Free", "Advantage on DEX saves", "Dodge traps, breath weapons, and Fireballs while not blinded or deafened.", [R("DEX Save · Advantage", 2, 20, mods.DEX, "highest")]));
      if (lv >= 11) D.push(defense("Relentless Rage", "Lv 11+", "Dropped to 0 HP while Raging", "DC rises by 5 each use", "CON save DC 10 to drop to 1 HP instead", "Keep swinging when you should be down.", [R("CON Save", 1, 20, mods.CON + pb)]));
      if (scId === "ancestral" && lv >= 6) D.push(defense("Spirit Shield", "Lv 6+", "Reaction when an ally within 30 ft takes damage", "Free", `Reduce damage by ${lv >= 14 ? 4 : lv >= 10 ? 3 : 2}d6`, "Protect a squishy ally from a big hit.", [R("Spirit Shield", lv >= 14 ? 4 : lv >= 10 ? 3 : 2, 6, 0)]));
      if (scId === "berserker" && lv >= 6) D.push(defense("Mindless Rage", "Lv 6+", "While Raging", "Free", "Immune to Charmed and Frightened", "Rage to break out of fear and charm control.", []));
    } else if (clId === "paladin") {
      D.push(defense("Lay on Hands", "Lv 1", "Action", `${prog.layOnHands} HP pool per Long Rest`, `Restore up to ${prog.layOnHands} HP or cure disease or poison for 5 HP`, "Pick up a downed ally or top yourself off in one action.", []));
      if (lv >= 6) D.push(defense("Aura of Protection", "Lv 6+", "Always on", "Free", `+${Math.max(1, mods.CHA)} to saves for you and allies within ${prog.auraOfProtection} ft`, "Keep the party clustered inside your aura against save-or-suck spells.", []));
      if (lv >= 2) D.push(defense("Shield of Faith", "Lv 2+", "Bonus Action", "1st slot · Concentration", "+2 AC for 10 minutes", "Raise AC before a long melee fight when you do not need Bless.", []));
      if (lv >= 7 && scId === "ancients") D.push(defense("Aura of Warding", "Lv 7+", "Always on", "Free", "Resistance to spell damage for you and nearby allies", "Shrug off caster burst.", []));
    } else if (clId === "rogue") {
      if (lv >= 2) D.push(defense("Cunning Disengage Retreat", "Lv 2+", "Bonus Action", "Free", "Disengage, then move away", "Strike, then leave melee without Opportunity Attacks.", []));
      if (lv >= 5) D.push(defense("Uncanny Dodge", "Lv 5+", "Reaction when hit by a seen attacker", "Uses your Reaction", "Halve the attack's damage", "Halve the hardest hit each round; it competes with Opportunity Attacks.", []));
      if (lv >= 7) D.push(defense("Evasion", "Lv 7+", "DEX save vs area effect", "Free", "No damage on success, half on failure", "Fireball and breath weapons barely scratch you.", [R("DEX Save", 1, 20, mods.DEX + pb)]));
      if (scId === "swashbuckler" && lv >= 3) D.push(defense("Fancy Footwork", "Lv 3+", "After a melee attack", "Free", "Target cannot make Opportunity Attacks vs you this turn", "Save your Bonus Action for Dash or Hide instead of Disengage.", []));
    } else if (clId === "monk") {
      if (lv >= 2) D.push(defense("Patient Defense", "Lv 2+", "Bonus Action", "1 Ki", "Dodge: attacks vs you have Disadvantage", "Turn tank for a round while still attacking with your Action.", []));
      if (lv >= 3) D.push(defense("Deflect Missiles", "Lv 3+", "Reaction when hit by a ranged weapon", "Free, 1 Ki to throw back", `Reduce damage by 1d10 ${signed(mods.DEX)} ${signed(lv)}`, "Catch arrows and bolts, and throw them back for 1 Ki if reduced to 0.", [R("Deflect Missiles", 1, 10, mods.DEX + lv)]));
      if (lv >= 7) D.push(defense("Evasion", "Lv 7+", "DEX save vs area effect", "Free", "No damage on success, half on failure", "Dart through breath weapons and Fireballs.", []));
      if (lv >= 14) D.push(defense("Diamond Soul", "Lv 14+", "Any save", "1 Ki to reroll", "Proficient in all saving throws", "Spend Ki to reroll a failed save.", []));
    } else if (clId === "ranger") {
      D.push(defense("Absorb Elements or Cure Wounds", "Lv 2+", "Reaction or Action", "1st slot", "Absorb Elements halves elemental damage and adds 1d6 to your next melee hit", "Blunt a breath weapon or patch yourself up.", []));
      if (scId === "hunter" && lv >= 7) D.push(defense("Defensive Tactics", "Lv 7+", "Passive", "Free", "Escape the Horde, Multiattack Defense, or Steel Will", "Pick the defense that matches your usual enemy.", []));
    } else if (["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"].includes(clId)) {
      if (has(clId, ["sorcerer", "wizard"])) D.push(defense("Shield + Absorb Elements Reactions", "Lv 1", "Reaction when hit or taking elemental damage", "1st slot", "Shield: +5 AC until your next turn · Absorb Elements: resistance to the triggering element", "Keep a 1st-level slot open each round for a reaction save.", []));
      if (has(clId, ["sorcerer", "wizard", "warlock"]) && lv >= 3) D.push(defense("Misty Step Escape", "Lv 3+", "Bonus Action", "2nd slot", "Teleport 30 ft", "Leave a grapple or melee without provoking.", []));
      if (has(clId, ["sorcerer", "wizard", "warlock"]) && lv >= 5) D.push(defense("Counterspell", "Lv 5+", "Reaction to a spell within 60 ft", "3rd slot", `Auto-stops 3rd level or lower · higher needs ability check 1d20 ${signed(castMod)} vs DC 10 + level`, "Stop the enemy caster's big spell.", []));
      if (clId === "warlock") D.push(defense("Armor of Agathys", "Lv 1", "Action", "1 Pact Slot", `${5 * Math.max(1, prog.spellMaxLevel)} temp HP · same cold damage to melee attackers`, "Scales with your Pact slot level and punishes melee foes.", []));
      if (has(clId, ["bard", "cleric", "druid"])) D.push(defense("Healing Word Pick-Up", "Lv 1", "Bonus Action", "1st slot", `1d4 ${signed(castMod)} HP at 60 ft`, "Bring a downed ally back without losing your Action.", [R("Healing Word", 1, 4, castMod)]));
      if (clId === "bard" && scId === "lore" && lv >= 3) D.push(defense("Cutting Words", "Lv 3+", "Reaction to a seen attack, check, or damage roll", "1 Inspiration", `Subtract ${prog.bardicDie} from the roll`, "Turn an enemy hit into a miss after seeing the roll.", []));
      if (clId === "bard" && scId === "swords" && lv >= 3) D.push(defense("Defensive Flourish", "Lv 3+", "On a weapon hit", "1 Inspiration", `Add ${prog.bardicDie} to AC until your next turn`, "Swing and gain AC in one motion.", []));
      if (clId === "cleric") {
        const cDef = {
          life: lv >= 2 ? ["Preserve Life", "Channel Divinity", `Split ${5 * lv} HP among allies below half HP`] : null,
          twilight: lv >= 2 ? ["Twilight Sanctuary", "Channel Divinity", `Allies in the aura gain 1d6 ${signed(lv)} temp HP each turn or end Charmed or Frightened`] : null,
          light: ["Warding Flare", "Reaction when attacked", `Impose Disadvantage on the attack · ${Math.max(1, mods.WIS)}/Long Rest`],
          tempest: ["Wrath of the Storm", "Reaction when hit in melee", `2d8 lightning or thunder · DEX save DC ${spellDc} · ${Math.max(1, mods.WIS)}/Long Rest`]
        };
        const pick = cDef[scId];
        if (pick) D.push(defense(pick[0], pick[1] === "Channel Divinity" ? "Lv 2+" : "Lv 1", pick[1], pick[1] === "Channel Divinity" ? "1 Channel Divinity" : "Free", pick[2], "Domain defense that keeps the line standing.", []));
        D.push(defense("Shield of Faith or Sanctuary", "Lv 1", "Bonus Action", "1st slot", "+2 AC with Concentration, or attackers must pass a WIS save", "Protect the frontliner or a downed ally.", []));
      }
      if (clId === "druid") {
        if (scId === "moon" && lv >= 2) D.push(defense("Wild Shape HP Buffer", "Lv 2+", "Bonus Action", "1 Wild Shape", "Beast HP absorbs damage before yours", "Excess damage carries over only after the beast form drops.", []));
        if (scId === "shepherd" && lv >= 2) D.push(defense("Spirit Totem Bear", "Lv 2+", "Bonus Action", "1 Wild Shape", `${5 + lv} temp HP to allies in the aura`, "Pre-buffer the party before the enemy alpha strike.", []));
        D.push(defense("Absorb Elements", "Lv 1", "Reaction to elemental damage", "1st slot", "Resistance to the triggering damage type", "Halve a dragon breath or Fireball.", []));
      }
      if (clId === "sorcerer" && scId === "draconic") D.push(defense("Draconic Resilience", "Lv 1", "Passive", "Free", `AC 13 ${signed(mods.DEX)} · +${lv} max HP`, "Natural armor that frees you from Mage Armor.", []));
      if (clId === "sorcerer" && scId === "clockwork") D.push(defense("Restore Balance", "Lv 1", "Reaction", `${pb}/Long Rest`, "Cancel Advantage or Disadvantage on a roll within 60 ft", "Strip enemy Advantage off an attack aimed at an ally.", []));
      if (clId === "warlock" && scId === "fiend") D.push(defense("Dark One's Blessing", "Lv 1", "When you drop a hostile to 0 HP", "Free", `${Math.max(1, castMod + lv)} temp HP`, "Finish weakened foes to keep your temp HP topped up.", []));
      if (clId === "wizard" && scId === "bladesinging" && lv >= 2) D.push(defense("Bladesong", "Lv 2+", "Bonus Action", `${pb}/Long Rest`, `+${Math.max(1, mods.INT)} AC and to Concentration saves`, "Raise AC and Concentration before diving into melee.", []));
      if (clId === "wizard" && scId === "divination" && lv >= 2) D.push(defense("Portent Defense", "Lv 2+", "Before an enemy attack roll", "Free", "Replace the attack roll with a high or low Portent d20", "Force a miss on a crucial enemy attack.", []));
    }

    const spDef = (() => {
      const list = [];
      if (spId === "dwarf") list.push(defense("Dwarven Resilience", "Lv 1", "Passive", "Free", "Resistance to poison · Advantage on saves vs poison", srId === "duergar" ? "Duergar also gain Advantage vs Charmed, illusions, and Paralyzed." : "Shrug off poison blades and venomous beasts.", []));
      if (spId === "half-orc") list.push(defense("Half-Orc Relentless Endurance", "Lv 1", "Dropped to 0 HP but not killed", "1/Long Rest", "Drop to 1 HP instead", "One free save from going down.", []));
      if (spId === "goliath" && srId === "stone") list.push(defense("Goliath Stone's Endurance", "Lv 1", "Reaction when damaged", `${pb}/Long Rest`, `Reduce damage by 1d12 ${signed(mods.CON)}`, "Blunt a big hit on demand.", [R("Stone's Endurance", 1, 12, mods.CON)]));
      if (spId === "gnome") list.push(defense("Gnome Cunning Magic Save Advantage", "Lv 1", "INT, WIS, CHA saves", "Free", "Advantage on INT, WIS, and CHA saves", "Mind control spells struggle to land.", []));
      if (spId === "elf" || spId === "half-elf") list.push(defense("Fey Ancestry", "Lv 1", "Charm effects", "Free", "Advantage vs Charmed · magic cannot put you to sleep", "Ignore Sleep and resist charm attempts.", []));
      if (spId === "halfling") list.push(defense("Halfling Lucky + Brave", "Lv 1", "Natural 1 or fear effect", "Free", "Reroll natural 1s · Advantage vs Frightened", srId === "stout" ? "Stout halflings also resist poison." : "Fear rarely locks you down.", []));
      if (spId === "tiefling") list.push(defense("Tiefling Fire Resistance", "Lv 1", "Fire damage", "Free", "Resistance to fire", srId !== "winged" && lv >= 3 ? "Pair with Hellish Rebuke to punish fire casters." : "Halve fire damage.", []));
      if (spId === "aasimar") list.push(defense("Aasimar Healing Hands + Radiant/Necrotic Resistance", "Lv 1", "Action", "1/Long Rest", `Heal ${pb}d4 HP · resistance to radiant and necrotic`, "Emergency heal on yourself or an ally.", [R("Healing Hands", pb, 4, 0)]));
      if (spId === "dragonborn") list.push(defense("Dragonborn Damage Resistance", "Lv 1", "Ancestry damage type", "Free", "Resistance to your draconic ancestry element", "Stand in the matching breath or spell.", []));
      if (spId === "goliath" && srId === "storm") list.push(defense("Goliath Storm's Thunder", "Lv 1", "Reaction when damaged", `${pb}/Long Rest`, "1d8 thunder to the attacker", "Punish anyone who hits you.", [R("Storm's Thunder", 1, 8, 0)]));
      return list;
    })();
    spDef.forEach((d) => D.push(d));
    const dFill = [
      defense("Dodge + Cover Turtle", "Lv 1", "Action", "Free", "Attacks vs you have Disadvantage · half cover +2 AC, three-quarters +5 AC", "When outmatched, Dodge behind cover to buy time for healers.", []),
      defense("Disengage Retreat", "Lv 1", "Action", "Free", "Move away without Opportunity Attacks", "Pull back from melee to protect your HP.", []),
      defense("Second-Line Help Guard", "Lv 1", "Action", "Free", "Help an ally or stand adjacent to block access to them", "Body-block for a downed or fragile ally.", []),
      defense("Short Rest Hit Dice Recovery", "Lv 1", "1-hour Short Rest", `Spend up to ${lv} Hit Dice`, `Each die heals its roll ${signed(mods.CON)} HP`, "Recover between fights instead of burning spell slots or potions.", []),
      defense("Death Save Safety Net", "Lv 1", "Start of turn at 0 HP", "Free", "1d20: 10+ success, nat 20 regains 1 HP, nat 1 counts two failures", "Stay out of area effects while down; any healing or a DC 10 Medicine check stabilizes you.", [R("Death Save", 1, 20, 0)])
    ];
    for (let i = 0; D.length < 4 && i < dFill.length; i++) D.push(dFill[i]);

    // Build-specific rule interactions.
    if (clId === "barbarian") {
      N.push("You cannot cast or concentrate on spells while Raging; Rage ends early if you did not attack a hostile or take damage since your last turn.");
      if (lv >= 2) N.push("Reckless Attack applies to STR melee attacks only and gives every enemy Advantage against you until your next turn.");
    }
    if (clId === "fighter") N.push("Action Surge grants one extra Action, not an extra Bonus Action; you still get only one Bonus Action per turn.");
    if (clId === "paladin") N.push("Divine Smite is declared after a melee weapon hit and its dice double on a critical hit; smite spells use your Bonus Action and Concentration.");
    if (clId === "rogue") N.push("Sneak Attack is once per turn, not per round: an Opportunity Attack on another creature's turn can trigger it again.");
    if (clId === "monk") N.push("Martial Arts and Flurry of Blows bonus strikes require that you took the Attack action this turn.");
    if (clId === "ranger" && lv >= 2) N.push("Hunter's Mark and other ranger spells share one Concentration slot; taking damage forces a CON save.");
    if (COMBAT_CASTER_CLASSES.includes(clId) || castStat) N.push("If you cast a spell with your Bonus Action, the only other spell you can cast that turn is a cantrip with a 1-action casting time.");
    if (clId === "warlock") N.push("Pact Magic slots recharge on a Short Rest and are always cast at your highest pact level.");
    if (small) N.push("Small size: Disadvantage with Heavy weapons.");
    if (spId === "halfling") N.push("Halfling Lucky rerolls natural 1s on attacks, checks, and saves; you must use the new roll.");
    N.push("A natural 20 on an attack doubles every damage die, including riders like Sneak Attack, Smite, or Hex, but never flat modifiers.");
    N.push("Advantage and Disadvantage never stack: any number of each cancels to a single straight d20.");
    N.push("Concentration: one spell at a time; damage forces a CON save at DC 10 or half the damage, whichever is higher.");
    const ruleNotes = N.slice(0, 5);

    const buildName = [nameOf(sr), nameOf(sp, spId), nameOf(sc), nameOf(cl, clId)].filter(Boolean).join(" ");
    const summary = `How your Species + Sub-Race + Class + Sub-Class features combine at Level ${lv}: ${buildName} · ${A} attack${A > 1 ? "s" : ""} per Attack action · PB ${signed(pb)} · ${prog.resourceLabel}${prog.spellMaxLevel ? ` · ${prog.spellSummary}` : ""}.`;
    return { level: lv, summary, strikeCombos: S.slice(0, 6), defenseCombos: D.slice(0, 6), ruleNotes, turnPlan: buildTurnPlan(profile) };
  }

  // Turn-by-turn action-economy maximizer: opening setup, sustained loop, burst turn and off-turn reaction plan.
  function buildTurnPlan(profile) {
    const ctx = normalizeProfile(profile);
    const { cl, sr, level: lv, prog, scId, spId } = ctx;
    const clId = idOf(cl) || "fighter";
    const srId = idOf(sr);
    const A = Math.max(1, Number(prog && prog.attacks) || 1);
    const atk = A > 1 ? `Attack action ×${A}` : "Attack action";
    const slot = Number(prog && prog.spellMaxLevel) || 0;
    const beams = Math.max(1, Number(prog && prog.cantripDice) || 1);
    const sub = (id, minLv) => scId === id && lv >= minLv;
    const T = {
      open: "Action: Attack action → Bonus Action: none spare, so Dash or Disengage only if needed",
      openRide: "Move first into reach or cover, then act; never end the turn exposed to multiple foes.",
      loop: `Action: ${atk} every round → Bonus Action: any free off-hand or class bonus action`,
      loopRide: "Focus the same target to drop it fast; reposition with leftover movement.",
      burst: `Action: ${atk} → spend your best once-per-rest resource on the turn the boss is in reach`,
      burstRide: "Stack every once-per-turn rider on the first confirmed hit.",
      hold: "Opportunity Attack if a foe flees your reach",
      react: "Opportunity Attack on any foe leaving your reach.",
      reactMove: "End turns behind half cover for +2 AC and DEX saves; split movement before and after attacking."
    };
    switch (clId) {
      case "barbarian":
        T.open = `Bonus Action: Rage FIRST → Action: ${lv >= 2 ? "Reckless Attack, " : ""}${atk}`;
        T.openRide = `+${Number(prog.rageDmg) || 2} Rage damage on every STR hit; resistance to bludgeoning, piercing and slashing while raging.`;
        T.loop = `Action: ${lv >= 2 ? "Reckless " : ""}${atk} → Bonus Action: ${sub("berserker", 3) ? "Frenzy extra weapon attack" : "keep Rage up by attacking each round"}`;
        T.loopRide = "Rage ends if you neither attack nor take damage on your turn, so always swing.";
        T.burst = `Action: Reckless ${atk}${sub("zealot", 3) ? " + Divine Fury on the first hit" : ""}${lv >= 9 ? " · Brutal Critical dice on crits" : ""}`;
        T.burstRide = "Advantage from Reckless doubles your crit chance; crits double Rage-boosted dice only.";
        T.hold = "Opportunity Attack with Rage damage";
        T.react = sub("ancestral", 6) ? "Spirit Shield reduces damage to an ally within 30 ft; otherwise Opportunity Attack with Rage damage." : "Opportunity Attack with Rage damage on any foe leaving your reach.";
        T.reactMove = sub("ancestral", 3) ? "Ancestral Protectors: your first hit target has Disadvantage against anyone but you, so stay in its face." : "Stand between enemies and squishy allies; Reckless gives foes Advantage, so lean on your resistance.";
        break;
      case "fighter":
        T.open = `Action: ${atk}${lv >= 2 ? " → Action Surge: second " + atk : ""} → Bonus Action: ${sub("echo", 3) ? "Manifest Echo" : "Second Wind only if bloodied"}`;
        T.openRide = sub("battlemaster", 3) ? `Superiority ${prog.superiorityDie || "1d8"}: Precision on a near miss, Trip or Menacing on a hit.` : sub("champion", 3) ? "Improved Critical: crit on 19-20, so every extra attack is a crit lottery ticket." : sub("eldritch", 7) ? "War Magic: cast a cantrip and make one weapon attack as a bonus action." : "Pick the fighting style rider that matches your weapon and stack it on every swing.";
        T.loop = `Action: ${atk} → Bonus Action: ${sub("echo", 3) ? "swap places with Echo or attack from it" : sub("eldritch", 7) ? "War Magic weapon attack" : "off-hand attack if dual-wielding, else Second Wind"}`;
        T.burst = lv >= 2 ? `Action Surge for ${A * 2} attacks this turn${lv >= 17 ? " · second Action Surge available" : ""}` : `Action: ${atk} with your best weapon and Second Wind to stay up`;
        T.burstRide = sub("battlemaster", 3) ? "Burn superiority dice on every hit during the Surge turn." : "Save Action Surge for the turn the boss is in reach and unhurt allies are not.";
        T.hold = sub("battlemaster", 3) ? "Riposte maneuver" : sub("eldritch", 3) ? "Shield spell" : "Opportunity Attack";
        T.react = sub("battlemaster", 3) ? "Riposte when a foe misses you; otherwise Opportunity Attack." : sub("eldritch", 3) ? "Shield +5 AC against a hit; otherwise Opportunity Attack." : "Opportunity Attack on any foe leaving your reach.";
        break;
      case "paladin":
        T.open = `${sub("vengeance", 3) ? "Bonus Action: Vow of Enmity on the boss → " : sub("devotion", 3) ? "Channel Divinity: Sacred Weapon → " : ""}Action: ${atk}`;
        T.openRide = lv >= 2 ? "Divine Smite on a hit; save slots for crits since smite dice double." : "Close the gap with full movement; Lay on Hands is your emergency button.";
        T.loop = `Action: ${atk} → Bonus Action: ${lv >= 2 ? "smite or a bonus action spell, one leveled spell per turn" : "none, keep it for Lay on Hands logistics"}`;
        T.loopRide = lv >= 11 ? "Improved Divine Smite adds 1d8 radiant to every hit for free." : "Smite only confirmed hits; prefer undead and fiends for the bonus die.";
        T.burst = lv >= 2 ? `Action: ${atk} → Smite every hit, highest slot on a crit` : `Action: ${atk} and Lay on Hands an ally if needed`;
        T.burstRide = sub("vengeance", 3) ? "Vow of Enmity Advantage boosts crit odds for big smites." : sub("conquest", 3) ? "Conquering Presence frightens, then press the advantage." : "Channel Divinity on the boss turn.";
        T.hold = "Opportunity Attack + smite";
        T.react = "Opportunity Attack with Divine Smite on the hit.";
        T.reactMove = lv >= 6 ? "Aura of Protection: keep allies within 10 ft for your CHA bonus on all saves." : "Stand next to the most fragile ally to soak hits.";
        break;
      case "rogue":
        T.open = lv >= 2 ? `Bonus Action: Cunning Action Hide → Action: Attack with Advantage → Sneak Attack ${prog.sneakDice}d6` : `Action: Attack next to an ally for Sneak Attack ${prog.sneakDice}d6`;
        T.openRide = sub("assassin", 3) ? "Assassinate: Advantage against foes who have not acted, and hits on surprised foes are crits." : sub("swashbuckler", 3) ? "Rakish Audacity: Sneak Attack in a one-on-one duel; Fancy Footwork lets you walk away free." : sub("arcane-trickster", 3) ? "Mage Hand as a bonus action to distract for Advantage." : "Sneak Attack once per turn, so land it on the first hit.";
        T.loop = `Action: Attack for Sneak Attack → Bonus Action: ${lv >= 2 ? "Disengage or Hide to reset Advantage" : "off-hand attack for a second Sneak chance"}`;
        T.burst = "Sneak Attack on a crit doubles every Sneak die; hunt Advantage with Hide or a flanking ally.";
        T.burstRide = sub("thief", 3) ? "Fast Hands: use an item as a bonus action." : "If the main hand misses, use an off-hand attack to try again.";
        T.hold = "Opportunity Attack for a second Sneak Attack";
        T.react = lv >= 5 ? "Uncanny Dodge halves one hit; otherwise Opportunity Attack for a second Sneak Attack this round." : "Opportunity Attack for a second Sneak Attack: Sneak is once per turn, not once per round.";
        T.reactMove = "Stay at range or behind an ally; Cunning Action lets you leave melee for free.";
        break;
      case "monk":
        T.open = `Action: ${atk} → Bonus Action: ${lv >= 2 ? "Flurry of Blows for 2 strikes" : "Martial Arts unarmed strike"}`;
        T.openRide = lv >= 5 ? "Stunning Strike on the first hit; a stunned foe gives Advantage to the whole party." : "Use your speed to reach the backline caster.";
        T.loop = `Action: ${atk} → Bonus Action: ${lv >= 2 ? "Flurry if focus remains, else Step of the Wind" : "Martial Arts strike"}`;
        T.loopRide = sub("open-hand", 3) ? "Open Hand Technique: knock prone or push on each Flurry hit." : sub("shadow", 6) ? "Shadow Step between dim light for Advantage." : sub("mercy", 3) ? "Hand of Harm on a Flurry hit." : "Spread focus over the fight and keep 1 for Stunning Strike.";
        T.burst = lv >= 5 ? "Flurry + Stunning Strike on every hit until the boss is stunned" : "Flurry of Blows on the boss and keep 1 focus for Patient Defense";
        T.burstRide = lv >= 2 ? `${Number(prog.kiPoints) || lv} focus points per rest; dump them on the stunned target.` : "No focus yet; lean on Martial Arts bonus strikes.";
        T.hold = lv >= 3 ? "Deflect Missiles or Attacks" : "Opportunity Attack";
        T.react = lv >= 3 ? "Deflect Missiles to cut damage, then redirect it back." : "Opportunity Attack with Martial Arts.";
        T.reactMove = "Unarmored Movement: hit and walk out of reach, using Step of the Wind if pinned.";
        break;
      case "ranger":
        T.open = `${lv >= 2 ? "Bonus Action: Hunter's Mark FIRST → " : ""}Action: ${atk}${sub("gloom", 3) ? " + Dread Ambusher extra attack" : ""}`;
        T.openRide = sub("gloom", 3) ? "Dread Ambusher: +10 speed and an extra 1d8 attack on turn one." : sub("hunter", 3) ? "Colossus Slayer adds 1d8 to a wounded target once per turn." : sub("fey", 3) ? "Dreadful Strikes add psychic damage." : "Stay at bow range; Hunter's Mark adds 1d6 per hit.";
        T.loop = `Action: ${atk} → Bonus Action: ${sub("beast-master", 3) ? "Command your beast" : "move Hunter's Mark when the target drops"}`;
        T.burst = `Action: ${atk} with Hunter's Mark on the boss${slot >= 3 ? " · Conjure Barrage or Lightning Arrow for packs" : ""}`;
        T.burstRide = "Hunter's Mark is concentration; avoid melee to keep it.";
        T.hold = slot >= 1 ? "Absorb Elements" : "Opportunity Attack";
        T.react = lv >= 15 ? "Uncanny Dodge style defense halves a hit; else Absorb Elements." : slot >= 1 ? "Absorb Elements against elemental hits, else Opportunity Attack." : "Opportunity Attack.";
        T.reactMove = "Keep 30 ft of distance and use full cover between volleys.";
        break;
      case "warlock":
        T.open = `Bonus Action: ${sub("hexblade", 1) ? "Hexblade's Curse or Hex" : "Hex"} FIRST → Action: Eldritch Blast ×${beams} beam${beams > 1 ? "s" : ""}`;
        T.openRide = lv >= 2 ? "Agonizing Blast adds CHA to each beam; Repelling Blast pushes 10 ft." : "Each beam rolls to hit separately; Hex adds 1d6 per hit.";
        T.loop = `Action: Eldritch Blast ×${beams} → Bonus Action: move Hex when the target drops`;
        T.loopRide = sub("genie", 3) ? "Genie's Vessel adds damage once per turn." : sub("fiend", 3) ? "Dark One's Blessing grants temp HP on kills." : "Kite at 120 ft; beams can split between targets.";
        T.burst = `Action: Eldritch Blast ×${beams} at the boss with Hex${slot >= 3 ? " or a Pact slot spell for a nova" : ""}`;
        T.burstRide = sub("hexblade", 1) ? "Hexblade's Curse: crit on 19-20 and +PB damage." : "Pact slots recharge on a Short Rest, so spend freely.";
        T.hold = lv >= 5 ? "Counterspell" : "Hellish Rebuke if known";
        T.react = lv >= 5 ? "Counterspell enemy casters; else Hellish Rebuke." : "Hellish Rebuke if known; otherwise save the reaction.";
        T.reactMove = "Stay at long range behind cover; never be adjacent to a melee foe.";
        break;
      case "cleric":
        if (lv >= 5) {
          T.open = "Action: Spirit Guardians FIRST → Bonus Action: skip any leveled spell, per the bonus-action spell rule";
          T.openRide = "Walk into the enemy line so Spirit Guardians damages every foe that starts its turn nearby.";
          T.loop = "Bonus Action: Spiritual Weapon → Action: cantrip only, per the bonus-action spell rule";
        } else if (lv >= 3) {
          T.open = "Bonus Action: Spiritual Weapon FIRST → Action: cantrip such as Sacred Flame";
          T.openRide = "A bonus-action leveled spell limits the Action to a cantrip.";
          T.loop = "Bonus Action: Spiritual Weapon attack → Action: cantrip or Dodge";
        } else {
          T.open = "Action: Guiding Bolt or Sacred Flame → Bonus Action: Healing Word only if an ally is down";
          T.openRide = "Guiding Bolt gives Advantage to the next attacker.";
          T.loop = "Action: cantrip → Bonus Action: Healing Word to pick up downed allies";
        }
        T.loopRide = sub("twilight", 2) ? "Twilight Sanctuary feeds temp HP every round." : sub("tempest", 2) ? "Destructive Wrath maximizes thunder or lightning." : "Protect concentration; position near the frontline.";
        T.burst = lv >= 2 ? "Channel Divinity on the boss turn, then your strongest slot" : "Guiding Bolt to set up an ally crit";
        T.burstRide = "Concentration covers one spell; never stack Spirit Guardians with Bless.";
        T.hold = sub("light", 1) ? "Warding Flare" : sub("tempest", 1) ? "Wrath of the Storm" : "Opportunity Attack";
        T.react = sub("light", 1) ? "Warding Flare imposes Disadvantage on an attack." : sub("tempest", 1) ? "Wrath of the Storm punishes a melee hit." : "Opportunity Attack or hold for movement.";
        T.reactMove = lv >= 5 ? "Spirit Guardians moves with you; stand in the enemy cluster." : "Stay within 60 ft of allies for Healing Word.";
        break;
      case "druid":
        if (sub("moon", 2)) {
          T.open = "Bonus Action: Wild Shape FIRST → Action: beast multiattack";
          T.openRide = "Wild Shape HP is a buffer; drop back to druid form when it runs out.";
          T.loop = "Action: beast attacks → Bonus Action: re-shape if knocked out of form";
        } else {
          T.open = `${sub("stars", 2) ? "Bonus Action: Starry Form → " : sub("shepherd", 2) ? "Bonus Action: Spirit Totem → " : ""}Action: ${slot >= 2 ? "Moonbeam or Spike Growth" : "Produce Flame or Thorn Whip"}`;
          T.openRide = "Place area spells where foes must walk through them.";
          T.loop = `Action: cantrip → Bonus Action: ${slot >= 2 ? "move Moonbeam or Starry Form attack" : "Healing Word if needed"}`;
        }
        T.loopRide = "Protect concentration; a lost area spell ruins the loop.";
        T.burst = slot >= 3 ? "Call Lightning or Conjure Animals on the boss turn" : "Entangle or Thunderwave to pin the boss";
        T.burstRide = "Control first, damage second.";
        T.hold = "Absorb Elements";
        T.react = "Absorb Elements if prepared; otherwise hold movement.";
        T.reactMove = "Stay at range behind your area spells.";
        break;
      case "sorcerer":
        T.open = lv >= 3 ? "Bonus Action: Quickened leveled spell → Action: cantrip only, per the bonus-action spell rule" : "Action: Fire Bolt or Chromatic Orb → Bonus Action: none";
        T.openRide = sub("draconic", 6) ? "Elemental Affinity adds CHA to damage of your element." : sub("wild-magic", 1) ? "Tides of Chaos for Advantage when it matters." : "Sorcery points fuel metamagic; use them on high-value turns.";
        T.loop = `Action: ${beams > 1 ? `cantrip at ${beams}d tier` : "cantrip"} → Bonus Action: convert points to slots as needed`;
        T.burst = lv >= 3 ? "Quickened + Twinned spells for a double nova" : "Highest slot on the boss";
        T.burstRide = "Twinned Spell hits two targets with a single-target spell.";
        T.hold = "Shield or Absorb Elements";
        T.react = lv >= 5 ? "Counterspell or Shield depending on threat." : "Shield +5 AC or Absorb Elements.";
        T.reactMove = "Stay at max range behind the frontline.";
        break;
      case "wizard":
        T.open = sub("bladesinging", 2) ? `Bonus Action: Bladesong FIRST → Action: ${atk}` : "Action: area control spell → Bonus Action: Misty Step if threatened";
        T.openRide = sub("bladesinging", 2) ? "Bladesong adds INT to AC, speed and concentration saves." : sub("evocation", 2) ? "Sculpt Spells to fireball the enemy without hitting allies." : "Lock down the biggest threat first.";
        T.loop = sub("bladesinging", 6) ? "Action: Attack + cantrip in place of an attack → Bonus Action: none" : "Action: cantrip → Bonus Action: Misty Step if threatened";
        T.burst = slot >= 3 ? "Fireball or Hypnotic Pattern on the boss group" : "Chromatic Orb or Magic Missile at the boss";
        T.burstRide = sub("divination", 2) ? "Portent: replace a roll with a foreseen die." : "Bonus action spells limit your Action to a cantrip.";
        T.hold = "Shield";
        T.react = lv >= 5 ? "Shield, Absorb Elements or Counterspell." : "Shield +5 AC or Absorb Elements.";
        T.reactMove = "Stay at range; Shield first, retreat second.";
        break;
      case "bard":
        T.open = `Bonus Action: Bardic Inspiration ${prog.bardicDie || "1d6"} on the striker → Action: ${sub("valor", 6) || sub("swords", 6) ? atk : "Vicious Mockery or Faerie Fire"}`;
        T.openRide = sub("swords", 3) ? "Blade Flourish adds a die and a mobility rider." : "Faerie Fire grants Advantage to everyone.";
        T.loop = "Action: cantrip or attack → Bonus Action: Healing Word or Inspiration";
        T.burst = slot >= 3 ? "Hypnotic Pattern on the boss group" : "Faerie Fire for party Advantage";
        T.burstRide = "Concentration on control beats direct damage.";
        T.hold = sub("lore", 3) ? "Cutting Words" : "Counterspell if known";
        T.react = sub("lore", 3) ? "Cutting Words subtracts from enemy attack or damage." : lv >= 5 ? "Counterspell if known." : "Hold for an ally's emergency.";
        T.reactMove = "Stay within 60 ft of allies for Inspiration.";
        break;
      default:
        break;
    }
    // Species hooks layered on top of class plans.
    const burstSp = [];
    const reactSp = [];
    if (spId === "dragonborn") burstSp.push(`Breath Weapon ${prog.breathDice || "2d6"} replaces one attack`);
    if (spId === "aasimar" && lv >= 3) burstSp.push("Celestial Revelation bonus action for extra damage");
    if (spId === "half-orc") { burstSp.push("Savage Attacks adds a die on crits"); reactSp.push("Relentless Endurance drops you to 1 HP instead of 0"); }
    if (spId === "tiefling" && srId !== "winged" && lv >= 3) reactSp.push("Hellish Rebuke 2d10 fire when damaged");
    if (spId === "goliath") reactSp.push(srId === "storm" ? "Storm's Thunder deals thunder when damaged" : "Stone's Endurance reduces a hit");
    if (spId === "halfling") reactSp.push("Halfling Lucky rerolls natural 1s");
    if (spId === "tabaxi") burstSp.push("Feline Agility doubles speed for a charge");
    if (spId === "dwarf" && srId === "duergar" && lv >= 3) burstSp.push("Duergar Enlarge adds damage");
    const burst = burstSp.length ? `${T.burst} · ${burstSp.join(" · ")}` : T.burst;
    const reaction = reactSp.length ? `${T.react} ${reactSp.join("; ")}.` : T.react;
    return [
      { phase: "Turn 1 · Opening Setup", order: T.open, ridersAndMove: T.openRide, reaction: T.hold },
      { phase: "Turn 2+ · Sustained Max Loop", order: T.loop, ridersAndMove: T.loopRide, reaction: T.hold },
      { phase: "Burst · Boss / Nova Turn", order: burst, ridersAndMove: T.burstRide, reaction: T.hold },
      { phase: "Off-Turn · Reaction & Move", order: "No Action spent: hold the Reaction for the trigger below", ridersAndMove: T.reactMove, reaction }
    ];
  }


  // ---------------------------------------------------------------------------
  // 3-page 2024-style character sheet PDF engine.
  // ---------------------------------------------------------------------------

  // Helvetica and Helvetica-Bold advance widths for ASCII 32..126 in 1/1000 em.
  const HELV_W = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
  const HELVB_W = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];
  const PAGE_COUNT = 3;
  const BAD_TOKEN = /^\s*(undefined|null|nan)\s*$/i;

  // Converts any value into printable 7-bit text; null, undefined, NaN and their string forms become empty.
  function plain(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "number" && !Number.isFinite(v)) return "";
    if (typeof v === "object") return "";
    const s = String(v);
    if (BAD_TOKEN.test(s)) return "";
    return s
      .replace(/[\u2014\u2013\u2212]/g, "-")
      .replace(/[\u00b7\u2022\u25cf\u25cb]/g, "*")
      .replace(/\u2192/g, "->")
      .replace(/\u00d7/g, "x")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, "\"")
      .replace(/\u2026/g, "...")
      .replace(/\u00bd/g, "1/2")
      .replace(/[\u2605\u2606]/g, "*")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/[^\x20-\x7e]/g, "")
      .replace(/\b(undefined|null|NaN)\b/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
  const sgnOrBlank = (v) => (num(v) === null ? "" : signed(num(v)));
  const numOrBlank = (v) => (num(v) === null ? "" : String(num(v)));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

  function textWidth(str, size, bold) {
    const table = bold ? HELVB_W : HELV_W;
    let w = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      w += code >= 32 && code <= 126 ? table[code - 32] : 556;
    }
    return (w * size) / 1000;
  }

  // Truncates text with a trailing ellipsis so its rendered width never exceeds maxWidth.
  function fitText(str, size, bold, maxWidth) {
    const s = plain(str);
    if (!s || !(maxWidth > 0) || textWidth(s, size, bold) <= maxWidth) return s;
    let lo = 0;
    let hi = s.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (textWidth(s.slice(0, mid).trimEnd() + "...", size, bold) <= maxWidth) lo = mid;
      else hi = mid - 1;
    }
    return lo > 0 ? s.slice(0, lo).trimEnd() + "..." : "";
  }

  // Greedy word wrap measured with real font widths.
  function wrapWidth(str, size, bold, maxWidth) {
    const words = plain(str).split(" ").filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach((w) => {
      const cand = line ? `${line} ${w}` : w;
      if (textWidth(cand, size, bold) <= maxWidth) line = cand;
      else {
        if (line) lines.push(line);
        line = textWidth(w, size, bold) <= maxWidth ? w : fitText(w, size, bold, maxWidth);
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function makeCanvas() {
    const ops = [];
    const f = (n) => String(Math.round(n * 100) / 100);
    const K = 0.5523;
    const c = {
      ops,
      gray(g) { ops.push(`${f(g)} g ${f(g)} G`); },
      text(x, y, str, size, bold) {
        const s = plain(str);
        if (!s) return;
        ops.push(`BT /${bold ? "F2" : "F1"} ${f(size || 8)} Tf ${f(x)} ${f(y)} Td (${esc(s)}) Tj ET`);
      },
      clippedText(x, y, str, size, bold, maxWidth) {
        c.text(x, y, fitText(str, size || 8, bold, maxWidth), size, bold);
      },
      rightText(xRight, y, str, size, bold, maxWidth) {
        const s = fitText(str, size || 8, bold, maxWidth || 999);
        c.text(xRight - textWidth(s, size || 8, bold), y, s, size, bold);
      },
      centerText(cx, y, str, size, bold, maxWidth) {
        const s = fitText(str, size || 8, bold, maxWidth || 999);
        c.text(cx - textWidth(s, size || 8, bold) / 2, y, s, size, bold);
      },
      rect(x, y, w, h, opts) {
        const o = opts || {};
        const lw = o.lw || 0.7;
        if (o.fill !== undefined) ops.push(`${f(o.fill)} g ${f(x)} ${f(y)} ${f(w)} ${f(h)} re f 0 g`);
        if (o.stroke !== false) ops.push(`${f(lw)} w ${f(x)} ${f(y)} ${f(w)} ${f(h)} re S`);
      },
      roundBox(x, y, w, h, r, opts) {
        const o = opts || {};
        const k = r * K;
        const path = [
          `${f(x + r)} ${f(y)} m`,
          `${f(x + w - r)} ${f(y)} l`,
          `${f(x + w - r + k)} ${f(y)} ${f(x + w)} ${f(y + r - k)} ${f(x + w)} ${f(y + r)} c`,
          `${f(x + w)} ${f(y + h - r)} l`,
          `${f(x + w)} ${f(y + h - r + k)} ${f(x + w - r + k)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} c`,
          `${f(x + r)} ${f(y + h)} l`,
          `${f(x + r - k)} ${f(y + h)} ${f(x)} ${f(y + h - r + k)} ${f(x)} ${f(y + h - r)} c`,
          `${f(x)} ${f(y + r)} l`,
          `${f(x)} ${f(y + r - k)} ${f(x + r - k)} ${f(y)} ${f(x + r)} ${f(y)} c`,
          "h"
        ].join(" ");
        if (o.fill !== undefined) ops.push(`${f(o.fill)} g ${path} f 0 g`);
        ops.push(`${f(o.lw || 0.8)} w ${path} S`);
      },
      shieldBox(x, y, w, h) {
        const cx = x + w / 2;
        const path = [
          `${f(x)} ${f(y + h)} m`,
          `${f(cx)} ${f(y + h - 6)} ${f(cx)} ${f(y + h - 6)} ${f(x + w)} ${f(y + h)} c`,
          `${f(x + w)} ${f(y + h * 0.45)} l`,
          `${f(x + w)} ${f(y + h * 0.2)} ${f(cx + w * 0.2)} ${f(y + 6)} ${f(cx)} ${f(y)} c`,
          `${f(cx - w * 0.2)} ${f(y + 6)} ${f(x)} ${f(y + h * 0.2)} ${f(x)} ${f(y + h * 0.45)} c`,
          "h"
        ].join(" ");
        ops.push(`0.94 g ${path} f 0 g 1.4 w ${path} S`);
      },
      circle(cx, cy, r, filled) {
        const k = r * K;
        const path = [
          `${f(cx + r)} ${f(cy)} m`,
          `${f(cx + r)} ${f(cy + k)} ${f(cx + k)} ${f(cy + r)} ${f(cx)} ${f(cy + r)} c`,
          `${f(cx - k)} ${f(cy + r)} ${f(cx - r)} ${f(cy + k)} ${f(cx - r)} ${f(cy)} c`,
          `${f(cx - r)} ${f(cy - k)} ${f(cx - k)} ${f(cy - r)} ${f(cx)} ${f(cy - r)} c`,
          `${f(cx + k)} ${f(cy - r)} ${f(cx + r)} ${f(cy - k)} ${f(cx + r)} ${f(cy)} c`,
          "h"
        ].join(" ");
        ops.push(`0.6 w ${path} ${filled ? "B" : "S"}`);
      },
      diamond(cx, cy, r, filled) {
        const path = `${f(cx)} ${f(cy + r)} m ${f(cx + r)} ${f(cy)} l ${f(cx)} ${f(cy - r)} l ${f(cx - r)} ${f(cy)} l h`;
        ops.push(`0.8 w ${path} ${filled ? "B" : "S"}`);
      },
      line(x1, y1, x2, y2, lw) {
        ops.push(`${f(lw || 0.4)} w ${f(x1)} ${f(y1)} m ${f(x2)} ${f(y2)} l S`);
      },
      // Paints a named image XObject scaled into the w by h box anchored at x, y.
      image(name, x, y, w, h) {
        ops.push(`q ${f(w)} 0 0 ${f(h)} ${f(x)} ${f(y)} cm /${name} Do Q`);
      },
      // Wraps text inside width w starting at baseline y; never draws below maxY and ellipsizes the last line.
      wrappedBlock(x, y, w, maxY, str, size, bold) {
        const sz = size || 7;
        const lh = sz + 1.8;
        const lines = wrapWidth(str, sz, bold, w);
        let cy = y;
        for (let i = 0; i < lines.length; i++) {
          if (cy < maxY) break;
          const last = cy - lh < maxY && i < lines.length - 1;
          c.text(x, cy, last ? fitText(`${lines[i]} ...`, sz, bold, w) : lines[i], sz, bold);
          cy -= lh;
        }
        return cy;
      }
    };
    return c;
  }

  // Labeled field cell: tiny caption at top, value clipped inside; blank values leave a ruled writing line.
  function fieldCell(c, x, y, w, h, label, value, opts) {
    const o = opts || {};
    c.rect(x, y, w, h, { lw: 0.7 });
    c.clippedText(x + 3, y + h - 6.5, label, 5.2, true, w - 6);
    const v = plain(value);
    const vs = o.size || 9;
    if (v) {
      if (o.center) c.centerText(x + w / 2, y + 4, v, vs, o.bold !== false, w - 6);
      else c.clippedText(x + 3, y + 4, v, vs, o.bold !== false, w - 6);
    } else c.line(x + 4, y + 4, x + w - 4, y + 4, 0.3);
  }

  function boxTitle(c, x, y, w, title) {
    c.rect(x, y - 12, w, 12, { fill: 0.15, stroke: false });
    c.gray(1);
    c.clippedText(x + 4, y - 9, title, 7, true, w - 8);
    c.gray(0);
    return y - 12;
  }

  function pageFrame(c, p, pageNo, subtitle) {
    c.clippedText(28, 776, "2024 CHARACTER SHEET", 10, true, 200);
    c.rightText(584, 776, subtitle, 7, false, 340);
    c.line(28, 772, 584, 772, 1.2);
    c.line(28, 30, 584, 30, 0.4);
    const who = [plain(p.name), plain(p.level) ? `Lv ${plain(p.level)}` : "", plain(p.className)].filter(Boolean).join(" * ");
    c.clippedText(28, 20, `Page ${pageNo} of ${PAGE_COUNT}`, 6.5, true, 80);
    c.centerText(306, 20, who, 6.5, false, 300);
    c.rightText(584, 20, "D&D Character Forge", 6.5, false, 120);
  }

  const ABILITY_ORDER = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const ABILITY_FULL = { STR: "STRENGTH", DEX: "DEXTERITY", CON: "CONSTITUTION", INT: "INTELLIGENCE", WIS: "WISDOM", CHA: "CHARISMA" };
  const FALLBACK_SKILLS = [["Athletics", "STR"], ["Acrobatics", "DEX"], ["Sleight of Hand", "DEX"], ["Stealth", "DEX"], ["Arcana", "INT"], ["History", "INT"], ["Investigation", "INT"], ["Nature", "INT"], ["Religion", "INT"], ["Animal Handling", "WIS"], ["Insight", "WIS"], ["Medicine", "WIS"], ["Perception", "WIS"], ["Survival", "WIS"], ["Deception", "CHA"], ["Intimidation", "CHA"], ["Performance", "CHA"], ["Persuasion", "CHA"]];

  function skillRows(p) {
    const given = arr(p.skills).filter((s) => s && typeof s === "object" && plain(s.name));
    if (given.length) return given.map((s) => ({ name: plain(s.name), stat: plain(s.stat).toUpperCase(), proficient: Boolean(s.proficient || s.prof), expertise: Boolean(s.expertise), bonus: num(s.bonus !== undefined ? s.bonus : s.mod) }));
    return FALLBACK_SKILLS.map(([name, stat]) => ({ name, stat, proficient: false, expertise: false, bonus: null }));
  }

  function saveRow(p, stat) {
    const s = arr(p.saves).find((x) => x && plain(x.stat).toUpperCase() === stat);
    if (!s) return { proficient: false, bonus: null };
    return { proficient: Boolean(s.proficient || s.prof), bonus: num(s.bonus !== undefined ? s.bonus : s.mod) };
  }

  function checkRow(c, x, y, w, proficient, bonus, label, bold) {
    c.circle(x + 4, y + 2.4, 2.6, proficient);
    const b = sgnOrBlank(bonus);
    if (b) c.rightText(x + 28, y, b, 7, true, 18);
    else c.line(x + 12, y, x + 28, y, 0.3);
    c.clippedText(x + 32, y, label, 7, Boolean(bold), w - 34);
  }

  // A portrait is usable only when it carries JPEG bytes and positive pixel dimensions.
  function hasPortrait(p) {
    const pt = p && p.portrait;
    return Boolean(pt && typeof pt.jpegBin === "string" && pt.jpegBin.length > 0 && num(pt.width) > 0 && num(pt.height) > 0);
  }

  // Framed portrait slot: draws /Im1 aspect-fit and centered inside the frame, or a blank sketch frame.
  function portraitFrame(c, p, x, y, w, h, inset) {
    c.rect(x, y, w, h, { lw: 0.8 });
    const pad = inset || 1.5;
    const iw = w - pad * 2;
    const ih = h - pad * 2;
    if (!hasPortrait(p)) {
      c.rect(x + pad, y + pad, iw, ih, { fill: 0.96, stroke: false });
      return false;
    }
    const ar = num(p.portrait.width) / num(p.portrait.height);
    let dw = iw;
    let dh = iw / ar;
    if (dh > ih) { dh = ih; dw = ih * ar; }
    c.image("Im1", x + pad + (iw - dw) / 2, y + pad + (ih - dh) / 2, dw, dh);
    return true;
  }

  function drawSheetPage1(c, p) {
    pageFrame(c, p, 1, "Core Sheet * Abilities, Combat & Features");
    const v = obj(p.vitals);
    const scores = obj(p.scores);
    const mods = obj(p.mods);
    const srTxt = plain(p.subrace), spTxt = plain(p.species);
    const species = srTxt && spTxt && srTxt.toLowerCase().includes(spTxt.toLowerCase()) ? srTxt : [srTxt, spTxt].filter(Boolean).join(" ").trim();

    // Identity grid.
    portraitFrame(c, p, 28, 714, 42, 54, 1.5);
    fieldCell(c, 74, 743, 162, 25, "CHARACTER NAME", p.name, { size: 11 });
    fieldCell(c, 240, 743, 112, 25, "BACKGROUND", p.background);
    fieldCell(c, 356, 743, 106, 25, "CLASS", p.className);
    fieldCell(c, 466, 743, 50, 25, "LEVEL", numOrBlank(p.level), { center: true, size: 11 });
    fieldCell(c, 520, 743, 64, 25, "XP", p.xp, { center: true });
    fieldCell(c, 74, 714, 162, 25, "SPECIES", species);
    fieldCell(c, 240, 714, 112, 25, "SUBCLASS", p.subclass);
    fieldCell(c, 356, 714, 106, 25, "ALIGNMENT", p.alignment);
    fieldCell(c, 466, 714, 50, 25, "SIZE", p.size, { center: true });
    c.rect(520, 714, 64, 25, { lw: 0.7 });
    c.centerText(552, 732.5, "HEROIC INSPIRATION", 4.8, true, 60);
    c.diamond(552, 722, 5.5, Boolean(p.heroicInspiration));

    // Left column: proficiency bonus, grouped ability cards, passives, training.
    const LX = 28;
    const LW = 210;
    c.roundBox(LX, 682, LW, 26, 6, { lw: 0.9 });
    c.clippedText(LX + 8, 691, "PROFICIENCY BONUS", 7, true, 120);
    const pbTxt = sgnOrBlank(p.pb);
    if (pbTxt) c.rightText(LX + LW - 10, 689, pbTxt, 13, true, 40);
    else c.line(LX + LW - 44, 689, LX + LW - 10, 689, 0.4);

    const skills = skillRows(p);
    let top = 678;
    ABILITY_ORDER.forEach((stat) => {
      const own = skills.filter((s) => s.stat === stat);
      const h = 24 + 4 + 11 + own.length * 10 + 3;
      c.rect(LX, top - h, LW, h, { lw: 0.9 });
      c.rect(LX, top - 24, LW, 24, { fill: 0.92, stroke: false });
      c.clippedText(LX + 6, top - 15, ABILITY_FULL[stat], 8.5, true, 110);
      c.text(LX + 125, top - 7, "MOD", 4.6, true);
      c.text(LX + 168, top - 7, "SCORE", 4.6, true);
      c.roundBox(LX + 118, top - 22, 34, 13, 5, { fill: 1, lw: 0.8 });
      const m = sgnOrBlank(mods[stat]);
      if (m) c.centerText(LX + 135, top - 19, m, 9.5, true, 30);
      c.rect(LX + 160, top - 22, 40, 13, { fill: 1, lw: 0.7 });
      const sc = numOrBlank(scores[stat]);
      if (sc) c.centerText(LX + 180, top - 19, sc, 8.5, true, 36);
      c.line(LX, top - 24, LX + LW, top - 24, 0.9);
      c.line(LX, top - 26, LX + LW, top - 26, 0.4);
      let y = top - 36;
      const sv = saveRow(p, stat);
      checkRow(c, LX + 6, y, LW - 10, sv.proficient, sv.bonus, "Saving Throw", true);
      y -= 11;
      own.forEach((s) => {
        checkRow(c, LX + 6, y, LW - 10, s.proficient, s.bonus, s.expertise ? `${s.name} * Expertise` : s.name, false);
        y -= 10;
      });
      top -= h + 4;
    });

    const passTop = top;
    c.rect(LX, passTop - 34, LW, 34, { lw: 0.8 });
    const passives = [["Passive Perception", v.passivePerception], ["Passive Insight", v.passiveInsight], ["Passive Investigation", v.passiveInvestigation]];
    passives.forEach(([label, val], i) => {
      const y = passTop - 10 - i * 10;
      const t = numOrBlank(val);
      if (t) c.rightText(LX + 26, y, t, 7.5, true, 20);
      else c.line(LX + 8, y, LX + 26, y, 0.3);
      c.clippedText(LX + 32, y, label, 7, false, LW - 36);
    });

    const tr = obj(p.training);
    const trTop = passTop - 38;
    const trBottom = 118;
    c.rect(LX, trBottom, LW, trTop - trBottom, { lw: 0.8 });
    boxTitle(c, LX, trTop, LW, "EQUIPMENT TRAINING & PROFICIENCIES");
    const ty = trTop - 22;
    [["Light", tr.light], ["Medium", tr.medium], ["Heavy", tr.heavy], ["Shields", tr.shields]].forEach(([label, on], i) => {
      const x = LX + 6 + i * 51;
      c.circle(x + 3, ty + 2.4, 2.6, Boolean(on));
      c.clippedText(x + 9, ty, label, 6.8, false, 40);
    });
    c.clippedText(LX + 6, ty - 12, "WEAPONS", 5.2, true, 60);
    let wy = c.wrappedBlock(LX + 6, ty - 20, LW - 12, trBottom + 24, tr.weapons, 6.6);
    if (!plain(tr.weapons)) { c.line(LX + 6, ty - 21, LX + LW - 6, ty - 21, 0.3); wy = ty - 28; }
    c.clippedText(LX + 6, wy - 2, "TOOLS", 5.2, true, 60);
    if (plain(tr.tools)) c.wrappedBlock(LX + 6, wy - 10, LW - 12, trBottom + 4, tr.tools, 6.6);
    else c.line(LX + 6, wy - 11, LX + LW - 6, wy - 11, 0.3);

    // Combat dashboard.
    const RX = 248;
    c.shieldBox(252, 616, 56, 90);
    c.centerText(280, 690, "ARMOR", 5.4, true, 50);
    c.centerText(280, 683, "CLASS", 5.4, true, 50);
    const ac = numOrBlank(v.ac);
    if (ac) c.centerText(280, 659, ac, 20, true, 50);
    else c.line(266, 659, 294, 659, 0.4);
    const sh = numOrBlank(v.shieldAc);
    if (sh) c.centerText(280, 640, `Shield ${sh}`, 5.6, false, 44);

    fieldCell(c, 314, 680, 52, 28, "INITIATIVE", sgnOrBlank(v.initiative), { center: true, size: 11 });
    fieldCell(c, 370, 680, 62, 28, "SPEED", v.speed, { center: true });
    fieldCell(c, 436, 680, 50, 28, "SIZE", p.size, { center: true });
    fieldCell(c, 490, 680, 94, 28, "VISION", v.vision, { size: 7.5 });

    c.rect(314, 612, 140, 64, { lw: 0.9 });
    c.centerText(384, 668, "HIT POINTS", 6.5, true, 130);
    [["MAX", v.hpMax], ["CURRENT", v.hpCur], ["TEMP", v.hpTemp]].forEach(([label, val], i) => {
      const x = 318 + i * 45;
      c.rect(x, 616, 42, 46, { lw: 0.6 });
      c.centerText(x + 21, 655, label, 5, true, 40);
      const t = numOrBlank(val);
      if (t) c.centerText(x + 21, 630, t, 13, true, 38);
      else c.line(x + 6, 628, x + 36, 628, 0.3);
    });
    c.rect(458, 612, 56, 64, { lw: 0.9 });
    c.centerText(486, 668, "HIT DICE", 6.5, true, 52);
    const hd = plain(v.hitDice);
    if (hd) c.centerText(486, 636, hd, 10, true, 50);
    else c.line(466, 634, 506, 634, 0.3);
    c.rect(518, 612, 66, 64, { lw: 0.9 });
    c.centerText(551, 668, "DEATH SAVES", 6.2, true, 62);
    const pass = Math.max(0, Math.min(3, num(v.deathPass) || 0));
    const fail = Math.max(0, Math.min(3, num(v.deathFail) || 0));
    c.clippedText(522, 650, "SUCCESS", 5, true, 60);
    c.clippedText(522, 628, "FAILURE", 5, true, 60);
    for (let i = 0; i < 3; i++) {
      c.circle(531 + i * 13, 641, 3.6, i < pass);
      c.circle(531 + i * 13, 619, 3.6, i < fail);
    }

    // Weapons and damage cantrips.
    const WT = 604;
    const WB = 450;
    c.rect(RX, WB, 336, WT - WB, { lw: 0.9 });
    boxTitle(c, RX, WT, 336, "WEAPONS & DAMAGE CANTRIPS");
    const cols = [[RX + 4, 98, "NAME"], [RX + 106, 46, "ATK / DC"], [RX + 156, 86, "DAMAGE & TYPE"], [RX + 246, 86, "NOTES"]];
    cols.forEach(([x, w, h]) => c.clippedText(x, WT - 21, h, 5.6, true, w));
    c.line(RX, WT - 24, RX + 336, WT - 24, 0.6);
    const atks = arr(p.attacks).filter((a) => a && typeof a === "object" && plain(a.name));
    const rowsN = Math.floor((WT - 26 - WB) / 12);
    for (let i = 0; i < rowsN; i++) {
      const y = WT - 34 - i * 12;
      c.line(RX + 2, y - 3, RX + 334, y - 3, 0.25);
      const a = atks[i];
      if (!a) continue;
      c.clippedText(cols[0][0], y, a.name, 7, true, cols[0][1]);
      c.clippedText(cols[1][0], y, a.toHitOrDc !== undefined ? a.toHitOrDc : a.toHit, 7, false, cols[1][1]);
      c.clippedText(cols[2][0], y, a.damage, 7, false, cols[2][1]);
      c.clippedText(cols[3][0], y, a.notes, 6.4, false, cols[3][1]);
    }

    // Features, traits and feats.
    const sections = [
      ["CLASS & SUBCLASS FEATURES", arr(p.classFeatures), 442, 252],
      ["SPECIES TRAITS", arr(p.speciesTraits), 248, 146],
      ["BACKGROUND FEATURE & FEATS", (plain(p.backgroundFeature) && !arr(p.featsAndBg).some((x) => /background/i.test(plain(x && x.name))) ? [{ name: "Background Feature", detail: p.backgroundFeature }] : []).concat(arr(p.featsAndBg)), 142, 42]
    ];
    sections.forEach(([title, items, sTop, sBottom]) => {
      c.rect(RX, sBottom, 336, sTop - sBottom, { lw: 0.9 });
      let y = boxTitle(c, RX, sTop, 336, title) - 9;
      const list = items.filter((it) => it && (plain(typeof it === "object" ? it.name : it)));
      if (!list.length) {
        for (let ly = y - 4; ly > sBottom + 6; ly -= 12) c.line(RX + 6, ly, RX + 330, ly, 0.25);
        return;
      }
      let shown = 0;
      for (const it of list) {
        if (y < sBottom + 12) break;
        const name = typeof it === "object" ? it.name : it;
        const detail = typeof it === "object" ? it.detail || it.desc || "" : "";
        const nameW = Math.min(120, textWidth(fitText(name, 7, true, 120), 7, true));
        c.clippedText(RX + 6, y, name, 7, true, 120);
        if (plain(detail)) {
          const first = wrapWidth(detail, 6.6, false, 324 - nameW - 10);
          c.clippedText(RX + 6 + nameW + 6, y, first[0] ? `- ${first[0]}` : "", 6.6, false, 324 - nameW - 6);
          const rest = plain(detail).slice((first[0] || "").length).trim();
          y -= 8.6;
          if (rest) y = c.wrappedBlock(RX + 14, y, 314, Math.max(sBottom + 6, y - 8.6 * 2), rest, 6.6);
        } else y -= 8.6;
        y -= 2;
        shown++;
      }
      if (shown < list.length) c.rightText(RX + 332, sBottom + 3, `+${list.length - shown} more in app`, 5.5, false, 100);
    });
  }

  function ruledBox(c, x, y, w, h, title, text, size) {
    c.rect(x, y, w, h, { lw: 0.8 });
    const t = boxTitle(c, x, y + h, w, title);
    if (plain(text)) c.wrappedBlock(x + 5, t - 9, w - 10, y + 4, text, size || 7);
    else for (let ly = t - 12; ly > y + 4; ly -= 12) c.line(x + 5, ly, x + w - 5, ly, 0.25);
  }

  function drawSheetPage2(c, p) {
    pageFrame(c, p, 2, "Spellcasting, Personal Details & Inventory");
    const sp = obj(p.spellcasting);
    const canCast = p.canCast === true || (p.canCast === undefined && Boolean(plain(sp.ability)));
    c.rect(28, 650, 556, 112, { lw: 0.9 });
    boxTitle(c, 28, 762, 556, "SPELLCASTING");
    if (!canCast) {
      c.rect(40, 680, 532, 50, { fill: 0.94, stroke: false });
      c.centerText(306, 708, "MARTIAL BUILD - NO SPELLCASTING", 12, true, 520);
      c.centerText(306, 692, "This build has no spellcasting at this level; lean on attacks, class resources and the Tactical Playbook on page 3.", 7, false, 520);
    } else {
      fieldCell(c, 36, 708, 120, 34, "SPELLCASTING ABILITY", sp.ability, { center: true, size: 11 });
      fieldCell(c, 162, 708, 90, 34, "SPELL SAVE DC", numOrBlank(sp.saveDc), { center: true, size: 13 });
      fieldCell(c, 258, 708, 90, 34, "SPELL ATTACK BONUS", sgnOrBlank(sp.attackBonus), { center: true, size: 13 });
      c.rect(354, 708, 222, 34, { lw: 0.7 });
      c.clippedText(357, 735.5, "SUMMARY", 5.2, true, 100);
      c.wrappedBlock(357, 726, 214, 710, sp.summary, 6.4);
      const slots = arr(sp.slots);
      c.clippedText(36, 696, "SPELL SLOTS", 5.6, true, 80);
      for (let lv = 1; lv <= 9; lv++) {
        const x = 36 + (lv - 1) * 60;
        const entry = slots.find((s) => s && num(s.level) === lv);
        const count = entry ? Math.max(0, Math.min(4, num(entry.count) || 0)) : 0;
        c.rect(x, 656, 56, 34, { lw: 0.6 });
        c.centerText(x + 28, 682, `LEVEL ${lv}`, 5.6, true, 52);
        if (count) {
          for (let i = 0; i < count; i++) c.circle(x + 28 - (count - 1) * 5.5 + i * 11, 666, 3.6, false);
        } else c.line(x + 14, 665, x + 42, 665, 0.3);
      }
    }

    const ap = obj(p.appearance);
    c.rect(28, 412, 162, 230, { lw: 0.9 });
    const portraitTop = boxTitle(c, 28, 642, 162, "CHARACTER PORTRAIT");
    portraitFrame(c, p, 32, 416, 154, portraitTop - 420, 1);

    c.rect(198, 576, 386, 66, { lw: 0.9 });
    boxTitle(c, 198, 642, 386, "APPEARANCE");
    [["AGE", ap.age], ["HEIGHT", ap.height], ["WEIGHT", ap.weight], ["EYES", ap.eyes], ["SKIN", ap.skin], ["HAIR", ap.hair]].forEach(([label, val], i) => {
      fieldCell(c, 204 + i * 63, 584, 59.5, 40, label, val, { size: 8.5 });
    });

    const rp = obj(p.rp && typeof p.rp === "object" ? p.rp : p.roleplay);
    ruledBox(c, 198, 494, 189, 74, "PERSONALITY TRAITS", rp.trait);
    ruledBox(c, 395, 494, 189, 74, "IDEALS", rp.ideal);
    ruledBox(c, 198, 412, 189, 74, "BONDS", rp.bond);
    ruledBox(c, 395, 412, 189, 74, "FLAWS", rp.flaw);
    ruledBox(c, 28, 300, 556, 104, "BACKSTORY & NOTES", rp.backstory || rp.notes);

    const eq = arr(p.equipment).map(plain).filter(Boolean);
    c.rect(28, 42, 370, 250, { lw: 0.9 });
    let ey = boxTitle(c, 28, 292, 370, "EQUIPMENT") - 10;
    if (!eq.length) for (let ly = ey; ly > 48; ly -= 12) c.line(34, ly, 392, ly, 0.25);
    else {
      const perCol = Math.floor((ey - 46) / 10);
      eq.slice(0, perCol * 2).forEach((item, i) => {
        const col = i < perCol ? 0 : 1;
        const row = i % perCol;
        c.clippedText(34 + col * 182, ey - row * 10, `* ${item}`, 7, false, 176);
      });
      if (eq.length > perCol * 2) c.rightText(394, 45, `+${eq.length - perCol * 2} more`, 5.5, false, 60);
    }

    const coins = obj(p.coins);
    c.rect(406, 186, 178, 106, { lw: 0.9 });
    boxTitle(c, 406, 292, 178, "COINS");
    ["cp", "sp", "ep", "gp", "pp"].forEach((k, i) => {
      const y = 260 - i * 15;
      c.roundBox(412, y - 3, 30, 12, 5, { lw: 0.7 });
      c.centerText(427, y, k.toUpperCase(), 6.5, true, 28);
      c.rect(448, y - 3, 130, 12, { lw: 0.5 });
      const val = plain(coins[k]);
      if (val) c.clippedText(452, y, val, 7.5, true, 122);
    });

    const att = arr(p.attunement).map(plain);
    c.rect(406, 42, 178, 136, { lw: 0.9 });
    boxTitle(c, 406, 178, 178, "MAGIC ITEM ATTUNEMENT");
    for (let i = 0; i < 3; i++) {
      const y = 140 - i * 32;
      c.diamond(418, y + 3, 4.5, Boolean(att[i]));
      c.line(428, y, 578, y, 0.35);
      if (att[i]) c.clippedText(430, y + 2.5, att[i], 7.5, true, 146);
    }
  }

  function tableBox(c, top, bottom, title, headers, widths, rows) {
    const X = 28;
    const W = 556;
    c.rect(X, bottom, W, top - bottom, { lw: 0.9 });
    let y = boxTitle(c, X, top, W, title);
    const xs = [];
    let acc = X + 4;
    widths.forEach((w) => { xs.push(acc); acc += w + 6; });
    headers.forEach((h, i) => c.clippedText(xs[i], y - 9, h, 5.8, true, widths[i]));
    y -= 12;
    c.line(X, y, X + W, y, 0.6);
    const sz = 6.6;
    const lh = sz + 1.8;
    let drawn = 0;
    for (const row of rows) {
      const cells = row.map((cell, i) => wrapWidth(cell, sz, i === 0, widths[i]));
      const lines = Math.max(1, ...cells.map((l) => l.length));
      const h = lines * lh + 4;
      if (y - h < bottom + 2) break;
      cells.forEach((l, i) => l.forEach((ln, j) => c.text(xs[i], y - 8 - j * lh, ln, sz, i === 0)));
      y -= h;
      c.line(X + 2, y, X + W - 2, y, 0.25);
      drawn++;
    }
    if (!rows.length) for (let ly = y - 12; ly > bottom + 4; ly -= 12) c.line(X + 4, ly, X + W - 4, ly, 0.25);
    if (drawn < rows.length) c.rightText(X + W - 4, bottom + 3, `+${rows.length - drawn} more in app`, 5.5, false, 100);
  }

  function resolvePlaybook(p) {
    const pb = obj(p.playbook);
    if (Array.isArray(pb.strikeCombos) || Array.isArray(pb.defenseCombos) || Array.isArray(pb.turnPlan)) return pb;
    const alt = obj(p.combinations || p.combos);
    if (Array.isArray(alt.strikeCombos) || Array.isArray(alt.defenseCombos) || Array.isArray(alt.turnPlan)) return alt;
    if (p.profile && typeof p.profile === "object") {
      try { return buildCombinationsPlaybook(p.profile); } catch (e) { return {}; }
    }
    return {};
  }

  function drawSheetPage3(c, p) {
    pageFrame(c, p, 3, "Character Forge Exclusive * Tactical Playbook & Action Reference");
    const syn = obj(p.synergy);
    const book = resolvePlaybook(p);
    c.rect(28, 712, 556, 54, { fill: 0.12, stroke: false });
    c.gray(1);
    c.clippedText(36, 750, "TACTICAL PLAYBOOK & SYNERGY COMBINATIONS", 12, true, 360);
    const grade = plain(syn.grade);
    c.rightText(576, 750, grade ? `Synergy Grade ${grade}` : "Synergy Grade", 9, true, 170);
    c.clippedText(36, 735, plain(syn.epithet), 8, true, 532);
    c.clippedText(36, 721, plain(syn.loop) ? `Core Loop: ${plain(syn.loop)}` : "Core Loop:", 7, false, 532);
    c.gray(0);

    const strikes = arr(book.strikeCombos).filter((s) => s && plain(s.name)).map((s) => [s.name, [plain(s.economy), plain(s.cost)].filter(Boolean).join(" * "), s.formula, s.howToUse]);
    let plan = arr(book.turnPlan).filter((r) => r && plain(r.phase));
    if (!plan.length && p.profile && typeof p.profile === "object") {
      try { plan = buildTurnPlan(p.profile); } catch (e) { plan = []; }
    }
    const turnRows = plan.map((r) => [r.phase, r.order, r.ridersAndMove, r.reaction]);
    tableBox(c, 706, 568, "TURN-BY-TURN ACTION-ECONOMY MAXIMIZER", ["PHASE", "ACTION + BONUS ORDER", "RIDERS & POSITIONING", "OFF-TURN REACTION"], [88, 198, 132, 110], turnRows);
    tableBox(c, 562, 386, "STRIKE & OFFENSE COMBINATIONS", ["COMBINATION", "ECONOMY / COST", "FORMULA", "HOW & WHEN TO COMBINE"], [104, 92, 130, 200], strikes);
    const defs = arr(book.defenseCombos).filter((s) => s && plain(s.name)).map((s) => [s.name, [plain(s.trigger), plain(s.cost)].filter(Boolean).join(" * "), s.formula, s.howToUse]);
    tableBox(c, 380, 210, "DEFENSE, MITIGATION & REACTION COMBINATIONS", ["COMBINATION", "TRIGGER / COST", "MECHANICS", "HOW & WHEN TO COMBINE"], [104, 92, 130, 200], defs);

    c.rect(28, 42, 272, 162, { lw: 0.9 });
    let y = boxTitle(c, 28, 204, 272, "KEY ACTION-ECONOMY & RULE INTERACTIONS") - 10;
    const notes = arr(book.ruleNotes).map(plain).filter(Boolean);
    if (!notes.length) for (let ly = y; ly > 48; ly -= 12) c.line(34, ly, 294, ly, 0.25);
    notes.forEach((n) => {
      if (y < 52) return;
      c.circle(37, y + 2.2, 1.6, true);
      y = c.wrappedBlock(43, y, 252, 46, n, 6.6) - 3;
    });

    c.rect(308, 42, 276, 162, { lw: 0.9 });
    let ay = boxTitle(c, 308, 204, 276, "UNLOCKED ACTIONS QUICK REFERENCE") - 10;
    const acts = arr(p.actions).filter((a) => a && plain(a.name));
    if (!acts.length) for (let ly = ay; ly > 48; ly -= 12) c.line(314, ly, 578, ly, 0.25);
    let shown = 0;
    for (const a of acts) {
      if (ay < 54) break;
      const head = [plain(a.economy), plain(a.badge)].filter(Boolean).join(" * ");
      const nameW = Math.min(150, textWidth(fitText(a.name, 7, true, 150), 7, true));
      c.clippedText(314, ay, a.name, 7, true, 150);
      if (head) c.rightText(578, ay, head, 5.8, false, 264 - nameW - 8);
      const sub = [plain(a.roll), plain(a.unlock), plain(a.detail)].filter(Boolean).join(" - ");
      if (sub) c.clippedText(320, ay - 8, sub, 6, false, 258);
      ay -= sub ? 19 : 11;
      shown++;
    }
    if (shown < acts.length) c.rightText(580, 45, `+${acts.length - shown} more in app`, 5.5, false, 100);
  }

  // Builds a byte-accurate PDF 1.4 document; every char is a Latin1 byte so string length equals byte length.
  // A portrait with jpegBin becomes a shared DCTDecode image XObject wired as /Im1 on every page.
  function assemblePdf(pageStreams, title, portrait) {
    const n = pageStreams.length;
    const withImg = hasPortrait({ portrait });
    const imgId = 5 + n * 2;
    const xobj = withImg ? ` /XObject << /Im1 ${imgId} 0 R >>` : "";
    const objects = [];
    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    const kids = pageStreams.map((_, i) => `${5 + i * 2} 0 R`).join(" ");
    objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    pageStreams.forEach((s, i) => {
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${xobj} >> /Contents ${6 + i * 2} 0 R >>`);
      objects.push(`<< /Length ${s.length} >>\nstream\n${s}\nendstream`);
    });
    if (withImg) {
      const bin = portrait.jpegBin;
      objects.push(`<< /Type /XObject /Subtype /Image /Width ${Math.round(num(portrait.width))} /Height ${Math.round(num(portrait.height))} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bin.length} >>\nstream\n${bin}\nendstream`);
    }
    objects.push(`<< /Title (${esc(plain(title))}) /Producer (D&D Character Forge) >>`);
    let out = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
    const offsets = [];
    objects.forEach((body, i) => {
      offsets.push(out.length);
      out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((off) => { out += `${String(off).padStart(10, "0")} 00000 n \n`; });
    out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return bytes;
  }

  function generateCharacterPdfBytes(payload) {
    const p = payload && typeof payload === "object" ? payload : {};
    const pages = [drawSheetPage1, drawSheetPage2, drawSheetPage3].map((draw) => {
      const c = makeCanvas();
      draw(c, p);
      return c.ops.join("\n");
    });
    const title = [plain(p.name), plain(p.level) ? `Lv ${plain(p.level)}` : "", plain(p.className), "Character Sheet"].filter(Boolean).join(" ");
    return assemblePdf(pages, title, hasPortrait(p) ? p.portrait : null);
  }

  const api = {
    proficiencyBonus,
    asiCountForClass,
    progression,
    applyLevelAsis,
    evaluatePlaybook,
    canCastCombatSpells,
    contextualCombatActions,
    buildCombinationsPlaybook,
    buildTurnPlan,
    generateCharacterPdfBytes,
    _internal: { d20Odds, saveFailOdds, parseDice, ascii, wrapText, baseArmorClass, scoreLine, plain, fitText, textWidth, wrapWidth, hasPortrait, assemblePdf, makeCanvas }
  };
  const root = typeof window !== "undefined" ? window : globalThis;
  root.FORGE_PLAYBOOK = api;
})();
