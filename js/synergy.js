(() => {
  const { SPECIES, CLASSES, SIGNATURE_COMBOS, SUBRACES, SUBCLASSES } = window.FORGE_DATA;

  const GRADE_LABELS = {
    S: "S-Tier · Signature Synergy",
    A: "A-Tier · Strong Alignment",
    B: "B-Tier · Balanced / Flexible",
    C: "C-Tier · Unorthodox / High Friction"
  };

  const SCORE_WEIGHTS = {
    SHARED_STAT: 2,
    SHARED_TAG: 2,
    FEAT_OR_MAD_SOLVER: 3,
    LUCKY_REROLL: 2,
    DWARF_CASTER_ARMOR: 2,
    MOUNTAIN_ARCANE_ARMOR: 3,
    SMALL_HEAVY_PENALTY: -1
  };

  function scoreAlignment(sp, sr, cl, sharedStats, sharedTags, allSpTags) {
    let score =
      sharedStats.length * SCORE_WEIGHTS.SHARED_STAT +
      sharedTags.length * SCORE_WEIGHTS.SHARED_TAG;
    if (allSpTags.includes("feat-engine") || allSpTags.includes("mad-solver")) {
      score += SCORE_WEIGHTS.FEAT_OR_MAD_SOLVER;
    }
    if (allSpTags.includes("lucky-reroll")) {
      score += SCORE_WEIGHTS.LUCKY_REROLL;
    }
    if (sp.id === "dwarf" && ["cleric", "wizard", "sorcerer", "bard"].includes(cl.id)) {
      score += SCORE_WEIGHTS.DWARF_CASTER_ARMOR;
    }
    if (sr && sr.id === "mountain" && ["wizard", "sorcerer"].includes(cl.id)) {
      score += SCORE_WEIGHTS.MOUNTAIN_ARCANE_ARMOR;
    }
    if (sp.size === "Small" && ["barbarian", "paladin", "fighter"].includes(cl.id) && cl.primaryStats.includes("STR")) {
      score += SCORE_WEIGHTS.SMALL_HEAVY_PENALTY;
    }
    return score;
  }

  function resolveGrade(score, sig) {
    if (sig) return sig.grade;
    if (score >= 7) return "S";
    if (score >= 4) return "A";
    if (score <= 1) return "C";
    return "B";
  }

  function collectNiches(sp, sr, cl, sc, sig) {
    const niches = [];
    if (sr) niches.push({ name: `Sub-Race · ${sr.name}`, detail: `${sr.focus} — ${sr.bonus}` });
    if (sc) niches.push({ name: `Sub-Class · ${sc.name}`, detail: `${sc.focus} — ${sc.bonus}` });
    if (sig && sig.niches) sig.niches.forEach((n) => niches.push(n));
    if (sp.id === "elf" && ["warlock", "wizard", "cleric", "druid"].includes(cl.id)) {
      niches.push({ name: "Trance Rest-Cast Window", detail: "4-hour rest leaves 4 spare hours for crafting, scouting, or dawn rest-casting." });
    }
    if (sp.id === "dwarf" && ["wizard", "sorcerer", "cleric", "bard"].includes(cl.id)) {
      niches.push({ name: "No-Penalty Armor Chassis", detail: "Speed immunity ignores 15-STR heavy armor rules, preserving casting stats." });
    }
    if (sp.id === "halfling" && cl.id !== "wizard") {
      niches.push({ name: "1-in-400 Crit-Fail Shield", detail: `Lucky rescues critical ${cl.name} checks, saves, and attacks from natural 1s.` });
    }
    return niches;
  }

  // Sub-race overrides win over base species skills and vision per PHB lineage rules.
  function effectiveSkills(sp, sr) {
    return sr?.skillsOverride ?? [...sp.skills, ...(sr?.extraSkills || [])];
  }

  function effectiveVision(sp, sr) {
    return sr?.visionOverride || sp.vision;
  }

  function collectFrictions(sp, sr, cl, sc, sharedStats) {
    const frictions = [];
    if (effectiveVision(sp, sr) === "Normal" && ["ranger", "rogue", "warlock"].includes(cl.id) && (!sc || sc.id !== "twilight")) {
      frictions.push("No innate Darkvision: pair with Twilight Cleric, Goggles of Night, or Devil's Sight.");
    }
    if (sp.size === "Small" && ["barbarian", "paladin"].includes(cl.id)) {
      frictions.push("Small chassis has Heavy-weapon disadvantage: favor sword-and-board, finesse, or mount lances.");
    }
    if (sharedStats.length === 0) {
      frictions.push(`Classic ASI mismatch unless using Tasha's flexible +2/+1; lean on ${sr ? sr.name : sp.name} traits.`);
    }
    if (frictions.length === 0) {
      frictions.push("Minimal mechanical friction: ability scores, defenses, and action economy reinforce one another.");
    }
    return frictions;
  }

  function computeCombo(sp, sr, cl, sc) {
    const sig = SIGNATURE_COMBOS[`${sp.id}+${cl.id}`];
    const sharedStats = cl.primaryStats.filter((s) => sp.asi.includes(s));
    const allSpTags = [...new Set([...sp.tags, ...(sr ? sr.tags : [])])];
    const allClTags = [...new Set([...cl.tags, ...(sc ? sc.tags : [])])];
    const sharedTags = allSpTags.filter((t) => allClTags.includes(t));

    const score = scoreAlignment(sp, sr, cl, sharedStats, sharedTags, allSpTags);
    const grade = resolveGrade(score, sig);
    const gradeLabel = GRADE_LABELS[grade];
    const niches = collectNiches(sp, sr, cl, sc, sig);
    const frictions = collectFrictions(sp, sr, cl, sc, sharedStats);

    const speciesSkills = effectiveSkills(sp, sr);
    const guaranteedSkills = speciesSkills.filter((s) => !s.startsWith("Any") && !s.startsWith("Stonecunning"));
    const overlaps = guaranteedSkills.filter((s) => cl.skillPool.includes(s));
    const recommendedSkills = cl.skillPool.filter((s) => !overlaps.includes(s)).slice(0, cl.skillCount);

    const spName = sr ? sr.name : sp.name;
    const clName = sc ? sc.name : cl.name;
    const epithet = sig ? sig.epithet : `${spName} ${clName}`;
    const loop = sig
      ? sig.loop
      : `${spName} -> powers ${clName} via ${sharedTags.slice(0, 2).join(" + ") || cl.primaryStats.join("/")}.`;

    return { score, grade, gradeLabel, sharedStats, sharedTags, niches, frictions, speciesSkills, guaranteedSkills, overlaps, recommendedSkills, epithet, loop, sig };
  }

  function getBetterSuggestions(curSp, curSr, curCl, curSc, limit = 3) {
    const classUpgrades = [];
    SPECIES.forEach((sp) => {
      (SUBRACES[sp.id] || [null]).forEach((sr) => {
        (SUBCLASSES[curCl.id] || [null]).forEach((sc) => {
          if (sp.id === curSp.id && sr?.id === curSr?.id && sc?.id === curSc?.id) return;
          classUpgrades.push({ sp, sr, cl: curCl, sc, c: computeCombo(sp, sr, curCl, sc) });
        });
      });
    });
    classUpgrades.sort((a, b) => b.c.score - a.c.score);

    const speciesUpgrades = [];
    CLASSES.forEach((cl) => {
      (SUBCLASSES[cl.id] || [null]).forEach((sc) => {
        if (cl.id === curCl.id && sc?.id === curSc?.id) return;
        speciesUpgrades.push({ sp: curSp, sr: curSr, cl, sc, c: computeCombo(curSp, curSr, cl, sc) });
      });
    });
    speciesUpgrades.sort((a, b) => b.c.score - a.c.score);

    return { forClass: classUpgrades.slice(0, limit), forSpecies: speciesUpgrades.slice(0, limit) };
  }

  function buildRoleplayMatrix(sp, sr, cl, sc, combo) {
    const spName = sr ? sr.name : sp.name;
    const clName = sc ? sc.name : cl.name;
    const comboTrait = combo.sig
      ? combo.sig.rpHook
      : `Fuses ${spName} heritage with ${clName} methods: ${cl.rp.traits[0].toLowerCase()}`;
    return {
      traits: [
        `[Combo++ Synthesis] ${comboTrait}`,
        `[${sp.name}] ${sp.rp.traits[0]}`,
        `[${sp.name}] ${sp.rp.traits[1]}`,
        `[${cl.name}] ${cl.rp.traits[0]}`,
        `[${cl.name}] ${cl.rp.traits[1]}`
      ],
      ideals: [
        { tag: "Combo++ Synthesis", text: `${sp.rp.ideals[0].tag} meets ${cl.rp.ideals[0].tag}: unites ${spName} roots with ${clName} calling.` },
        ...sp.rp.ideals.map((i) => ({ tag: `${sp.name} · ${i.tag}`, text: i.text })),
        ...cl.rp.ideals.map((i) => ({ tag: `${cl.name} · ${i.tag}`, text: i.text }))
      ],
      bonds: [
        `[Combo++ Cross-Bond] ${sp.rp.bonds[0]} — pursued through ${clName} discipline.`,
        `[${sp.name}] ${sp.rp.bonds[0]}`,
        `[${sp.name}] ${sp.rp.bonds[1]}`,
        `[${cl.name}] ${cl.rp.bonds[0]}`
      ],
      flaws: [
        `[Combo++ Fracture] ${sp.rp.flaws[0]} Amplified by ${clName} tunnel vision.`,
        `[${sp.name}] ${sp.rp.flaws[0]}`,
        `[${sp.name}] ${sp.rp.flaws[1]}`,
        `[${cl.name}] ${cl.rp.flaws[0]}`
      ]
    };
  }

  window.FORGE_SYNERGY = { SCORE_WEIGHTS, GRADE_LABELS, effectiveSkills, effectiveVision, computeCombo, getBetterSuggestions, buildRoleplayMatrix };
})();
