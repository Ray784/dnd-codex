(() => {
  const { SPECIES, CLASSES, SUBRACES, SUBCLASSES, APPENDIX_DATA, CUBE_FACE_ANGLES, LOADOUT, SHORT_LOADOUT } = window.FORGE_DATA;
  const { computeCombo, getBetterSuggestions, buildRoleplayMatrix } = window.FORGE_SYNERGY;

  // Safe fallbacks keep the sheet usable when newer data.js tables are not loaded yet.
  const FALLBACK_SKILLS = [
    ["Acrobatics", "DEX"], ["Animal Handling", "WIS"], ["Arcana", "INT"], ["Athletics", "STR"], ["Deception", "CHA"], ["History", "INT"],
    ["Insight", "WIS"], ["Intimidation", "CHA"], ["Investigation", "INT"], ["Medicine", "WIS"], ["Nature", "INT"], ["Perception", "WIS"],
    ["Performance", "CHA"], ["Persuasion", "CHA"], ["Religion", "INT"], ["Sleight of Hand", "DEX"], ["Stealth", "DEX"], ["Survival", "WIS"]
  ].map(([name, stat]) => ({ name, stat }));
  const FALLBACK_BACKGROUNDS = [
    ["acolyte", "Acolyte", ["Insight", "Religion"], "Shelter of the Faithful"],
    ["charlatan", "Charlatan", ["Deception", "Sleight of Hand"], "False Identity"],
    ["criminal", "Criminal", ["Deception", "Stealth"], "Criminal Contact"],
    ["entertainer", "Entertainer", ["Acrobatics", "Performance"], "By Popular Demand"],
    ["folk-hero", "Folk Hero", ["Animal Handling", "Survival"], "Rustic Hospitality"],
    ["guild-artisan", "Guild Artisan", ["Insight", "Persuasion"], "Guild Membership"],
    ["hermit", "Hermit", ["Medicine", "Religion"], "Discovery"],
    ["noble", "Noble", ["History", "Persuasion"], "Position of Privilege"],
    ["outlander", "Outlander", ["Athletics", "Survival"], "Wanderer"],
    ["sage", "Sage", ["Arcana", "History"], "Researcher"],
    ["sailor", "Sailor", ["Athletics", "Perception"], "Ship's Passage"],
    ["soldier", "Soldier", ["Athletics", "Intimidation"], "Military Rank"],
    ["urchin", "Urchin", ["Sleight of Hand", "Stealth"], "City Secrets"]
  ].map(([id, name, skills, feature]) => ({ id, name, source: "PHB", skills, tools: "", feature, desc: "" }));
  const FALLBACK_CLASS_BG = {
    barbarian: "outlander", bard: "entertainer", cleric: "acolyte", druid: "hermit", fighter: "soldier", monk: "hermit",
    paladin: "noble", ranger: "outlander", rogue: "charlatan", sorcerer: "hermit", warlock: "charlatan", wizard: "sage"
  };
  const FALLBACK_ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];
  const FALLBACK_NAMES = ["Aria", "Bram", "Corin", "Dara", "Eldon", "Fen", "Gwyn", "Hale"];
  const FALLBACK_DICE_META = { 4: "Tetrahedron · Fixed 1–4", 6: "Cube · Fixed 1–6", 8: "Octahedron · Fixed 1–8", 10: "Trapezohedron · Fixed 1–10", 12: "Dodecahedron · Fixed 1–12", 20: "Icosahedron · Fixed 1–20" };
  const FD = window.FORGE_DATA;
  const listOr = (v, fb) => (Array.isArray(v) && v.length ? v : fb);
  const SKILLS_ALL = listOr(FD.SKILLS_ALL, FALLBACK_SKILLS);
  const BACKGROUNDS = listOr(FD.BACKGROUNDS, FALLBACK_BACKGROUNDS);
  const CLASS_DEFAULT_BG = FD.CLASS_DEFAULT_BG || FALLBACK_CLASS_BG;
  const ALIGNMENTS = listOr(FD.ALIGNMENTS, FALLBACK_ALIGNMENTS);
  const NAME_BANK = FD.NAME_BANK || {};
  const DICE_META = Object.assign({}, FALLBACK_DICE_META, FD.DICE_META || {});
  const DICE_LIST = [4, 6, 8, 10, 12, 20];
  const STORE_KEY = "forge_char_v3";
  const LEGACY_STORE_KEY = "forge_char_v2";
  const playbookApi = () => window.FORGE_PLAYBOOK || null;
  const emptyDiceMap = (v) => DICE_LIST.reduce((m, s) => { m[s] = v; return m; }, {});
  const defaultSession = () => ({ hpCur: null, hpTemp: 0, hdUsed: 0, deathPass: 0, deathFail: 0, resourcesUsed: 0 });
  const defaultPlaybookOpts = () => ({ targetAc: null, enemyAtk: null, advantage: false, classRider: true, offhandOrBonus: true, novaBurst: false, useShield: false, coverBonus: 0, dodgeAction: false, reactionDef: true });
  const ABILITY_KEYS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const blankScoreMap = (v) => ABILITY_KEYS.reduce((m, ab) => { m[ab] = v; return m; }, {});
  const blankRollMap = () => ABILITY_KEYS.reduce((m, ab) => { m[ab] = []; return m; }, {});
  const defaultPointBuy = () => blankScoreMap(8);

  // Scores one 4d6 set by dropping the lowest die; returns null until all four dice exist.
  function scoreRollSet(dice) {
    if (!Array.isArray(dice) || dice.length !== 4) return null;
    let droppedIdx = 0;
    dice.forEach((d, i) => { if (d < dice[droppedIdx]) droppedIdx = i; });
    const total = dice.reduce((a, d) => a + d, 0) - dice[droppedIdx];
    return { total, droppedIdx };
  }

  // Rebuilds legacy rolled saves into per-ability dice sets keyed by the stored assignment.
  function migrateLegacyRolls(breakdown, assigned) {
    const rolls = blankRollMap();
    if (!Array.isArray(breakdown) || !assigned) return rolls;
    const used = new Set();
    ABILITY_KEYS.forEach((ab) => {
      const want = assigned[ab];
      if (!Number.isInteger(want)) return;
      const idx = breakdown.findIndex((b, i) => !used.has(i) && b && Array.isArray(b.dice) && b.dice.length === 4 && b.total === want);
      if (idx >= 0) { used.add(idx); rolls[ab] = breakdown[idx].dice.slice(); }
    });
    return rolls;
  }
  const defaultCoins = () => ({ cp: "", sp: "", ep: "", gp: "", pp: "" });
  const defaultAppearance = () => ({ age: "", height: "", weight: "", eyes: "", skin: "", hair: "" });
  const defaultRpCustom = () => ({ trait: "", ideal: "", bond: "", flaw: "", notes: "" });

  const state = {
    speciesId: "half-orc",
    subraceId: SUBRACES["half-orc"][0].id,
    classId: "barbarian",
    subclassId: SUBCLASSES["barbarian"][0].id,
    activeTab: "synergy",
    previewKey: null,
    rp: {
      trait: { idx: 0, locked: false },
      ideal: { idx: 0, locked: false },
      bond: { idx: 0, locked: false },
      flaw: { idx: 0, locked: false }
    },
    dice: {
      values: emptyDiceMap(null),
      landed: emptyDiceMap(false),
      poses: {
        4: { rx: 0.42, ry: 0.36, rz: 0.1 },
        6: { rx: 0, ry: 0, tx: -14, ty: 18 },
        8: { rx: 0.35, ry: 0.55, rz: 0.08 },
        10: { rx: 0.32, ry: 0.45, rz: 0.05 },
        12: { rx: 0.38, ry: 0.5, rz: 0.06 },
        20: { rx: 0.40, ry: 0.52, rz: 0.12 }
      },
      rollingDie: null,
      history: []
    },
    level: 1,
    // Zero blind defaults: every sheet field starts empty until the user chooses it.
    charName: "",
    bgId: "",
    alignment: "",
    xp: "",
    heroicInspiration: false,
    statMode: "",
    statPool: null,
    rolledBreakdown: null,
    assignedScores: blankScoreMap(null),
    abilityRolls: blankRollMap(),
    activeRollSlot: null,
    swapFrom: null,
    pointBuyScores: defaultPointBuy(),
    flexAsiPicks: [],
    pickedClassSkills: [],
    pickedSpeciesSkills: [],
    equipChoice: "",
    customGear: "",
    coins: defaultCoins(),
    attunement: ["", "", ""],
    appearance: defaultAppearance(),
    rpCustom: defaultRpCustom(),
    session: defaultSession(),
    playbookOpts: defaultPlaybookOpts(),
    critToggle: false,
    rollLog: [],
    builderOpen: false,
    builderStep: 1,
    gateOpen: null
  };

  // Persisted sheet fields; combo selection stays session-only so the forge always opens on its showcase build.
  const PERSIST_KEYS = ["level", "charName", "bgId", "alignment", "xp", "heroicInspiration", "statMode", "statPool", "rolledBreakdown", "assignedScores", "abilityRolls", "pointBuyScores", "flexAsiPicks", "pickedClassSkills", "pickedSpeciesSkills", "equipChoice", "customGear", "coins", "attunement", "appearance", "rpCustom", "session", "playbookOpts"];

  function isScoreMap(m, lo, hi) {
    return Boolean(m) && typeof m === "object" && ABILITY_KEYS.every((ab) => Number.isInteger(m[ab]) && m[ab] >= lo && m[ab] <= hi);
  }
  const strList = (v, cap) => (Array.isArray(v) ? v.filter((s) => typeof s === "string").slice(0, cap) : []);
  const strMap = (v, tmpl, cap) => {
    const out = tmpl;
    if (v && typeof v === "object") Object.keys(out).forEach((k) => { if (typeof v[k] === "string") out[k] = v[k].slice(0, cap); });
    return out;
  };

  // Validates each stored field independently so one corrupt value never wipes the rest.
  function sanitizeStored(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    if (Number.isFinite(raw.level)) out.level = Math.max(1, Math.min(20, Math.round(raw.level)));
    if (typeof raw.charName === "string") out.charName = raw.charName.slice(0, 60);
    if (typeof raw.bgId === "string") out.bgId = raw.bgId;
    if (raw.alignment === "" || FALLBACK_ALIGNMENTS.includes(raw.alignment)) out.alignment = raw.alignment;
    if (typeof raw.xp === "string") out.xp = raw.xp.replace(/[^0-9]/g, "").slice(0, 7);
    if (typeof raw.heroicInspiration === "boolean") out.heroicInspiration = raw.heroicInspiration;
    if (["", "standard", "rolled", "pointbuy"].includes(raw.statMode)) out.statMode = raw.statMode;
    if (Array.isArray(raw.statPool) && raw.statPool.length === 6 && raw.statPool.every((n) => Number.isInteger(n) && n >= 3 && n <= 18)) out.statPool = raw.statPool;
    if (Array.isArray(raw.rolledBreakdown) && raw.rolledBreakdown.length === 6) out.rolledBreakdown = raw.rolledBreakdown;
    if (raw.assignedScores && typeof raw.assignedScores === "object") {
      out.assignedScores = blankScoreMap(null);
      ABILITY_KEYS.forEach((ab) => { const n = raw.assignedScores[ab]; if (Number.isInteger(n) && n >= 3 && n <= 18) out.assignedScores[ab] = n; });
    }
    if (raw.abilityRolls && typeof raw.abilityRolls === "object") {
      out.abilityRolls = blankRollMap();
      ABILITY_KEYS.forEach((ab) => {
        const v = raw.abilityRolls[ab];
        if (Array.isArray(v)) out.abilityRolls[ab] = v.filter((d) => Number.isInteger(d) && d >= 1 && d <= 6).slice(0, 4);
      });
    } else if (out.statMode === "rolled") {
      out.abilityRolls = migrateLegacyRolls(out.rolledBreakdown, out.assignedScores);
    }
    if (isScoreMap(raw.pointBuyScores, 8, 15)) out.pointBuyScores = raw.pointBuyScores;
    if (Array.isArray(raw.flexAsiPicks)) out.flexAsiPicks = raw.flexAsiPicks.filter((s) => ABILITY_KEYS.includes(s)).slice(0, 2);
    out.pickedClassSkills = strList(raw.pickedClassSkills, 8);
    out.pickedSpeciesSkills = strList(raw.pickedSpeciesSkills, 4);
    if (typeof raw.equipChoice === "string") out.equipChoice = raw.equipChoice.replace(/[^0-9,]/g, "").slice(0, 40);
    if (typeof raw.customGear === "string") out.customGear = raw.customGear.slice(0, 600);
    out.coins = strMap(raw.coins, defaultCoins(), 9);
    if (Array.isArray(raw.attunement)) out.attunement = [0, 1, 2].map((i) => (typeof raw.attunement[i] === "string" ? raw.attunement[i].slice(0, 60) : ""));
    out.appearance = strMap(raw.appearance, defaultAppearance(), 40);
    out.rpCustom = strMap(raw.rpCustom, defaultRpCustom(), 1200);
    if (raw.session && typeof raw.session === "object") out.session = Object.assign(defaultSession(), raw.session);
    if (raw.playbookOpts && typeof raw.playbookOpts === "object") out.playbookOpts = Object.assign(defaultPlaybookOpts(), raw.playbookOpts);
    return out;
  }

  function loadSheet() {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) { Object.assign(state, sanitizeStored(JSON.parse(raw))); return; }
      // Legacy v2 stored blind defaults; migrate only the fields the user typed or tracked.
      const legacy = window.localStorage.getItem(LEGACY_STORE_KEY);
      if (legacy) {
        const old = sanitizeStored(JSON.parse(legacy));
        ["level", "charName", "session"].forEach((k) => { if (old[k] !== undefined) state[k] = old[k]; });
      }
    } catch (err) {
      // Storage blocked or corrupt; keep defaults.
    }
  }

  function saveSheet() {
    try {
      const out = {};
      PERSIST_KEYS.forEach((k) => { out[k] = state[k]; });
      window.localStorage.setItem(STORE_KEY, JSON.stringify(out));
    } catch (err) {
      // Storage blocked; sheet stays in memory only.
    }
  }

  // Derives assigned scores and the rolled pool from the per-ability dice sets.
  function syncRolledScores() {
    const totals = [];
    ABILITY_KEYS.forEach((ab) => {
      const res = scoreRollSet(state.abilityRolls[ab]);
      state.assignedScores[ab] = res ? res.total : null;
      if (res) totals.push(res.total);
    });
    state.statPool = totals.length === 6 ? totals : null;
  }

  function nextOpenSlot(from) {
    const start = from ? ABILITY_KEYS.indexOf(from) + 1 : 0;
    const order = ABILITY_KEYS.slice(start).concat(ABILITY_KEYS.slice(0, start));
    return order.find((ab) => state.abilityRolls[ab].length < 4) || null;
  }

  loadSheet();
  if (state.statMode === "rolled") syncRolledScores();

  const el = {
    speciesCount: document.getElementById("species-count"),
    classCount: document.getElementById("class-count"),
    speciesGrid: document.getElementById("species-grid"),
    subraceStrip: document.getElementById("subrace-strip"),
    classGrid: document.getElementById("class-grid"),
    subclassStrip: document.getElementById("subclass-strip"),
    comboHero: document.getElementById("combo-hero"),
    tabSynergy: document.getElementById("tab-synergy"),
    tabSkills: document.getElementById("tab-skills"),
    tabRoleplay: document.getElementById("tab-roleplay"),
    tabDice: document.getElementById("tab-dice"),
    tabAppendix: document.getElementById("tab-appendix"),
    tabActions: document.getElementById("tab-actions"),
    upgrades: document.getElementById("upgrades-panel"),
    identity: document.getElementById("identity-grid"),
    btnRandomize: document.getElementById("btn-randomize"),
    btnCopy: document.getElementById("btn-copy-summary"),
    toast: document.getElementById("toast"),
    tabs: Array.from(document.querySelectorAll(".tabs .tab")),
    tabBar: document.querySelector(".tabs"),
    workspace: document.getElementById("workspace"),
    stage: document.getElementById("character-stage"),
    tabSheet: document.getElementById("tab-sheet"),
    tabPlaybook: document.getElementById("tab-playbook"),
    rollTray: document.getElementById("roll-tray"),
    printView: document.getElementById("print-sheet-view"),
    levelSlider: document.getElementById("level-slider"),
    levelVal: document.getElementById("level-val"),
    lvlDec: document.getElementById("lvl-dec"),
    lvlInc: document.getElementById("lvl-inc"),
    pbVal: document.getElementById("pb-val"),
    btnExportPdf: document.getElementById("btn-export-pdf"),
    btnPrint: document.getElementById("btn-print-sheet"),
    btnOpenBuilder: document.getElementById("btn-open-builder"),
    btnCloseBuilder: document.getElementById("btn-close-builder"),
    builderView: document.getElementById("sheet-builder-view"),
    builderTitle: document.getElementById("builder-title"),
    builderProgress: document.getElementById("builder-progress"),
    builderGate: document.getElementById("builder-gate"),
    builderPreview: document.getElementById("builder-preview")
  };

  const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
  const FALLBACK_ORDER = ["CON", "DEX", "WIS", "STR", "CHA", "INT"];
  const ABILITY_CAP = 20;
  const RATING_CAP = 100;
  const HIT_DIE = { d6: 6, d8: 8, d10: 10, d12: 12 };
  const LEAN_TAGS = {
    "str-lean": "STR", "str-primary": "STR", "melee-lean": "STR",
    "dex-lean": "DEX", "con-tank": "CON",
    "int-lean": "INT", "int-primary": "INT",
    "wis-lean": "WIS", "wis-primary": "WIS",
    "cha-lean": "CHA", "cha-primary": "CHA"
  };
  const OFFENSE_TAGS = ["melee-crit", "nova-burst", "smite-crit", "aoe-breath", "crit-die", "fire-synergy", "darkvision-ambush", "control", "control-caster", "aoe-aura", "triple-advantage"];
  const DEFENSE_TAGS = ["damage-mitigation", "con-tank", "cheat-death", "poison-resist", "elemental-resist", "fire-resist", "necro-resist", "magic-saves", "mental-saves", "heavy-armor-caster", "aura-saves", "emergency-heal"];
  const RATINGS = [
    { key: "combat", label: "Combat", tip: "Combat Rating · 5-Star Scale — Offense & turn impact from primary attack/spell stats, Hit Die, and burst/crit/control traits" },
    { key: "synergy", label: "Synergy", tip: "Synergy Rating · 5-Star Scale — How tightly your Species & Sub-Race traits, skills, and ability bonuses amplify your Class & Sub-Class" },
    { key: "durability", label: "Durability", tip: "Durability Rating · 5-Star Scale — Frontline staying power from Hit Die, Toughness & Stamina, resistances, armor & saving-throw defenses" }
  ];

  // UI-only plain-English stat names; scoring keeps the raw ABILITIES keys.
  const STAT_META = {
    STR: { label: "Physical Power", dnd: "STR (Strength) — Melee attacks, Athletics, carrying & shoving" },
    DEX: { label: "Agility & Reflex", dnd: "DEX (Dexterity) — Stealth, ranged/finesse attacks, Initiative & dodge AC" },
    CON: { label: "Toughness & Stamina", dnd: "CON (Constitution) — Max Hit Points & keeping spell Concentration" },
    INT: { label: "Logic & Knowledge", dnd: "INT (Intelligence) — Investigation, Arcana & Wizard spellcasting" },
    WIS: { label: "Awareness & Instinct", dnd: "WIS (Wisdom) — Perception, Insight & Cleric/Druid/Ranger magic" },
    CHA: { label: "Charm & Presence", dnd: "CHA (Charisma) — Persuasion, Deception & Bard/Paladin/Sorcerer/Warlock magic" }
  };
  const STAT_TOKEN_RE = /\b(STR|DEX|CON|INT|WIS|CHA)\b/g;

  // Shared helpers hoisted above every caller so no TDZ ReferenceError can occur.
  const modOf = (score) => Math.floor((score - 10) / 2);
  const signed = (n) => (n >= 0 ? `+${n}` : `${n}`);
  const SKILL_NAMES = SKILLS_ALL.map((s) => s.name);
  const arr = (v) => (Array.isArray(v) ? v : []);

  // Parses 2d6 style dice text into count and sides.
  function parseDice(text) {
    const m = String(text || "").match(/(\d+)\s*d\s*(\d+)/i);
    return m ? { count: Number(m[1]), sides: Number(m[2]) } : null;
  }

  const FALLBACK_DICE_TERMS = [
    ["Nat 20", "Rolling a natural 20 on a d20 attack roll is a critical hit: it always hits and you roll all damage dice twice. On ability checks and saves it is just a 20 unless your table uses a house rule."],
    ["Nat 1", "Rolling a natural 1 on a d20 attack roll always misses, regardless of bonuses. On checks and saves it is simply the lowest roll."],
    ["Advantage & Disadvantage", "Roll 2d20 and keep the higher with advantage or the lower with disadvantage. Multiple sources never stack, and one of each cancels out."],
    ["DC", "Difficulty Class: the number a d20 roll plus modifiers must meet or beat to succeed on a check or saving throw."],
    ["Attack Roll", "1d20 + ability modifier + proficiency bonus versus the target's Armor Class. Meet or beat AC to hit."],
    ["Saving Throw", "1d20 + ability modifier, plus proficiency if proficient, rolled to resist a spell, trap or effect against a DC."],
    ["Critical Hit Damage", "On a crit, double the number of damage dice, including Sneak Attack, Smite and other extra dice, then add modifiers once."],
    ["Concentration", "Some spells last only while you concentrate. Taking damage forces a CON save at DC 10 or half the damage, whichever is higher; failing ends the spell."],
    ["Opportunity Attack", "When a hostile creature you can see leaves your reach, you may use your reaction to make one melee attack against it. Disengage prevents this."],
    ["Bonus Action", "A short extra action granted only by a specific feature or spell. You get at most one per turn."],
    ["Reaction", "An instant response to a trigger, usable once per round and refreshed at the start of your turn."],
    ["Temporary Hit Points", "A buffer lost before real HP. They do not stack; keep the higher pool. Healing cannot restore them."],
    ["Death Saving Throw", "At 0 HP roll a d20 each turn: 10 or more is a success, 9 or less a failure. Three successes stabilize, three failures kill. A Nat 20 restores 1 HP; a Nat 1 counts as two failures."],
    ["Short & Long Rest", "A short rest of 1 hour lets you spend Hit Dice to heal and refreshes some features. A long rest of 8 hours restores all HP, half your Hit Dice and most resources."]
  ];

  // PHB Chapter 5 p. 143 coin metadata shared by Builder fields, Sheet cells and the Appendix fallback.
  const COIN_KEYS = ["cp", "sp", "ep", "gp", "pp"];
  const COIN_RATE_LINE = "1 PP = 10 GP = 20 EP = 100 SP = 1,000 CP";
  const COIN_PHB_META = {
    cp: { label: "CP", name: "CP · Copper Piece", tip: "CP · Copper Piece — 100 CP = 1 GP, 10 CP = 1 SP. Everyday coin of laborers and beggars; 1 CP buys a candle, a torch, or a piece of chalk. 50 coins = 1 lb. PHB p. 143" },
    sp: { label: "SP", name: "SP · Silver Piece", tip: "SP · Silver Piece — 10 SP = 1 GP, 1 SP = 10 CP. Most common coin among commoners; 1 SP is a laborer's full day of work, a flask of lamp oil, or a night in a poor inn. 50 coins = 1 lb. PHB p. 143" },
    ep: { label: "EP", name: "EP · Electrum Piece", tip: "EP · Electrum Piece — 2 EP = 1 GP, 1 EP = 5 SP = 50 CP. Gold-silver alloy from fallen empires found in treasure hoards; may arouse suspicion in mundane shops. 50 coins = 1 lb. PHB p. 143" },
    gp: { label: "GP", name: "GP · Gold Piece", tip: "GP · Gold Piece — 1 GP = 10 SP = 2 EP = 100 CP. Standard measure of wealth; a skilled artisan's daily wage, or 50 ft of good rope, a belt pouch, or a goat. 50 coins = 1 lb. PHB p. 143" },
    pp: { label: "PP", name: "PP · Platinum Piece", tip: "PP · Platinum Piece — 1 PP = 10 GP = 100 SP = 1,000 CP. Rare high-value coin of ancient kingdoms; draws awe or suspicion in humble settlements. 50 coins = 1 lb. PHB p. 143" }
  };

  // Returns an underlined tooltip term for a coin key, falling back to the raw uppercase key.
  function coinTermHtml(c) {
    const meta = COIN_PHB_META[c];
    if (!meta) return esc(String(c || "").toUpperCase());
    return `<span class="stat-term" data-dnd-tip="${esc(meta.tip)}" title="${esc(meta.tip)}">${meta.label}</span>`;
  }

  // Appendix coinage rows from APPENDIX_DATA, or COIN_PHB_META when data is missing.
  function coinageRows(data) {
    const rows = arr(data && data.coinage);
    return rows.length ? rows : COIN_KEYS.map((c) => [COIN_PHB_META[c].name, COIN_PHB_META[c].tip.split(" — ")[1] || COIN_PHB_META[c].tip]);
  }

  function specText(spec) {
    return `${spec.count || 1}d${spec.sides}${spec.bonus ? ` ${signed(spec.bonus)}` : ""}`;
  }

  function rollBtnHtml(spec, text, cls) {
    const title = Array.isArray(spec) ? spec.map(specText).join(" then ") : specText(spec);
    return `<button class="roll-btn${cls ? ` ${cls}` : ""}" type="button" data-roll-spec="${esc(JSON.stringify(spec))}" title="Roll ${esc(title)}">${esc(text)}</button>`;
  }

  function statLabel(ab) {
    return STAT_META[ab] ? STAT_META[ab].label : ab;
  }

  function statTip(ab) {
    return STAT_META[ab] ? STAT_META[ab].dnd : "";
  }

  // Plain-English stat label carrying the D&D abbreviation as a hover tooltip.
  function statTerm(ab) {
    if (!STAT_META[ab]) return esc(ab);
    const label = esc(STAT_META[ab].label);
    const tip = esc(statTip(ab));
    return `<span class="stat-term" data-stat="${ab}" data-dnd-tip="${tip}" title="${tip}" aria-label="${label} — ${tip}">${label}</span>`;
  }

  // Rating label that shows its scoring definition through the shared D&D tooltip.
  function ratingTerm(r) {
    const label = esc(r.label);
    const tip = esc(r.tip || r.label);
    return `<span class="stat-term" data-rating="${esc(r.key)}" data-dnd-tip="${tip}" title="${tip}" aria-label="${label} — ${tip}">${label}</span>`;
  }

  function statTerms(list, sep) {
    return list.map(statTerm).join(esc(sep));
  }

  function plainStats(text) {
    return String(text).replace(STAT_TOKEN_RE, (m) => statLabel(m));
  }

  // Escapes free text, then swaps raw stat abbreviations for tooltip-bearing labels.
  function annotateStats(text) {
    return esc(text).replace(STAT_TOKEN_RE, (m) => statTerm(m));
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const ASI_MILESTONES = [4, 8, 12, 16, 19];
  const ASI_EXTRA = { fighter: [6, 14], rogue: [10] };
  const PRIMAL_CAP = 24;
  const MARTIAL_X2 = ["barbarian", "fighter", "monk", "paladin", "ranger"];
  const POINT_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
  const POINT_BUDGET = 27;

  function pbFor(lvl) {
    const api = playbookApi();
    try {
      if (api && typeof api.proficiencyBonus === "function") {
        const v = api.proficiencyBonus(lvl);
        if (Number.isFinite(v)) return v;
      }
    } catch (err) {
      // Fall through to the PHB formula.
    }
    return Math.ceil(clamp(lvl, 1, 20) / 4) + 1;
  }

  function asiCountLocal(classId, lvl) {
    return [...ASI_MILESTONES, ...(ASI_EXTRA[classId] || [])].filter((m) => lvl >= m).length;
  }

  // Inline twin of the playbook ASI rule: +2 per milestone along priority order, Primal Champion at barbarian Lv 20.
  function applyLevelAsisLocal(base, order, classId, lvl) {
    const scores = { ...base };
    const count = asiCountLocal(classId, lvl);
    let points = count * 2;
    let spent = 0;
    for (const ab of order) {
      while (points > 0 && scores[ab] < ABILITY_CAP) { scores[ab] += 1; points -= 1; spent += 1; }
      if (points <= 0) break;
    }
    if (classId === "barbarian" && lvl >= 20) {
      scores.STR = Math.min(PRIMAL_CAP, scores.STR + 4);
      scores.CON = Math.min(PRIMAL_CAP, scores.CON + 4);
    }
    return { scores, asiApplied: count, asiPointsSpent: spent };
  }

  function applyLevelAsis(base, order, classId, lvl) {
    const api = playbookApi();
    try {
      if (api && typeof api.applyLevelAsis === "function") {
        const r = api.applyLevelAsis(base, order, classId, lvl);
        if (r && r.scores && ABILITIES.every((ab) => Number.isFinite(r.scores[ab]))) return r;
      }
    } catch (err) {
      // Fall back to the inline rule.
    }
    return applyLevelAsisLocal(base, order, classId, lvl);
  }

  const dieAt = (lvl, steps) => steps.find(([min]) => lvl >= min)[1];

  function fallbackProg(classId, subclassId, lvl) {
    const pb = pbFor(lvl);
    let attacks = 1;
    if (MARTIAL_X2.includes(classId) && lvl >= 5) attacks = 2;
    if (classId === "bard" && ["valor", "swords"].includes(subclassId) && lvl >= 6) attacks = 2;
    if (classId === "wizard" && subclassId === "bladesinging" && lvl >= 6) attacks = 2;
    if (classId === "fighter") attacks = lvl >= 20 ? 4 : lvl >= 11 ? 3 : attacks;
    const rageCount = lvl >= 20 ? "Unlimited" : lvl >= 17 ? 6 : lvl >= 12 ? 5 : lvl >= 6 ? 4 : lvl >= 3 ? 3 : 2;
    const prog = {
      level: lvl,
      pb,
      asiCount: asiCountLocal(classId, lvl),
      attacks,
      cantripDice: lvl >= 17 ? 4 : lvl >= 11 ? 3 : lvl >= 5 ? 2 : 1,
      sneakDice: classId === "rogue" ? Math.ceil(lvl / 2) : 0,
      rageCount,
      rageDmg: lvl >= 16 ? 4 : lvl >= 9 ? 3 : 2,
      brutalCritDice: classId === "barbarian" ? (lvl >= 17 ? 3 : lvl >= 13 ? 2 : lvl >= 9 ? 1 : 0) : 0,
      martialDie: dieAt(lvl, [[17, "1d10"], [11, "1d8"], [5, "1d6"], [1, "1d4"]]),
      kiPoints: classId === "monk" && lvl >= 2 ? lvl : 0,
      unarmoredMove: classId === "monk" && lvl >= 2 ? 10 + 5 * Math.floor((lvl + 2) / 4) - 5 : 0,
      bardicDie: dieAt(lvl, [[15, "1d12"], [10, "1d10"], [5, "1d8"], [1, "1d6"]]),
      layOnHands: classId === "paladin" ? lvl * 5 : 0,
      auraOfProtection: classId === "paladin" && lvl >= 6,
      improvedSmite: classId === "paladin" && lvl >= 11,
      superiorityDie: classId === "fighter" && subclassId === "battlemaster" ? (lvl >= 18 ? "1d12" : lvl >= 10 ? "1d10" : "1d8") : null,
      breathDice: dieAt(lvl, [[16, "5d6"], [11, "4d6"], [6, "3d6"], [1, "2d6"]]),
      spellMaxLevel: 0,
      spellSummary: "",
      resourceLabel: ""
    };
    const full = ["bard", "cleric", "druid", "sorcerer", "wizard"];
    const half = ["paladin", "ranger"];
    if (full.includes(classId)) prog.spellMaxLevel = Math.min(9, Math.ceil(lvl / 2));
    else if (half.includes(classId)) prog.spellMaxLevel = lvl >= 2 ? dieAt(lvl, [[17, 5], [13, 4], [9, 3], [5, 2], [1, 1]]) : 0;
    else if (classId === "warlock") prog.spellMaxLevel = Math.min(5, Math.ceil(lvl / 2));
    prog.spellSummary = prog.spellMaxLevel ? `Spells up to level ${prog.spellMaxLevel}` : "No spell slots";
    const labels = {
      barbarian: `Rages ${rageCount} · +${prog.rageDmg} dmg`,
      bard: `Bardic Inspiration ${prog.bardicDie}`,
      cleric: "Channel Divinity",
      druid: "Wild Shape",
      fighter: lvl >= 2 ? "Action Surge · Second Wind" : "Second Wind",
      monk: `Ki ${prog.kiPoints} · Martial ${prog.martialDie}`,
      paladin: `Lay on Hands ${prog.layOnHands} HP`,
      ranger: "Hunter's Mark",
      rogue: `Sneak Attack ${prog.sneakDice}d6`,
      sorcerer: lvl >= 2 ? `Sorcery Points ${lvl}` : "Sorcery Points",
      warlock: "Pact Slots",
      wizard: "Arcane Recovery"
    };
    prog.resourceLabel = labels[classId] || "Class Resource";
    return prog;
  }

  function progFor(classId, subclassId, speciesId, subraceId, lvl) {
    const api = playbookApi();
    const fb = fallbackProg(classId, subclassId, lvl);
    try {
      if (api && typeof api.progression === "function") {
        const p = api.progression(classId, subclassId, speciesId, subraceId, lvl);
        if (p && typeof p === "object") return Object.assign(fb, p, { resourceLabel: p.resourceLabel || fb.resourceLabel });
      }
    } catch (err) {
      // Fallback progression stays in place.
    }
    return fb;
  }

  // Uses tracked uses per long rest for each class resource.
  function resourceMax(cl, prog, mods) {
    const lvl = prog.level;
    switch (cl.id) {
      case "barbarian": return prog.rageCount === "Unlimited" ? 99 : Number(prog.rageCount) || 2;
      case "bard": return Math.max(1, mods.CHA);
      case "cleric": return lvl >= 18 ? 3 : lvl >= 6 ? 2 : lvl >= 2 ? 1 : 0;
      case "druid": return lvl >= 2 ? 2 : 0;
      case "fighter": return 1 + (lvl >= 2 ? 1 : 0) + (lvl >= 17 ? 1 : 0);
      case "monk": return prog.kiPoints || 0;
      case "paladin": return Math.floor((prog.layOnHands || lvl * 5) / 5);
      case "ranger": return Math.max(1, mods.WIS);
      case "rogue": return 1;
      case "sorcerer": return lvl >= 2 ? lvl : 0;
      case "warlock": return lvl >= 11 ? 3 : lvl >= 2 ? 2 : 1;
      case "wizard": return 1;
      default: return 1;
    }
  }

  function isActiveBuild(sp, cl) {
    return Boolean(sp && cl && sp.id && cl.id && sp.id === state.speciesId && cl.id === state.classId);
  }

  // Sheet context flag: when true the active build reads only explicit user inputs, never a blind default.
  let SHEET_CTX = false;

  // Explicit user base scores; unassigned abilities stay null.
  function userBaseScores() {
    if (state.statMode === "pointbuy" && isScoreMap(state.pointBuyScores, 8, 15)) return { ...state.pointBuyScores };
    const out = blankScoreMap(null);
    if (state.statMode === "standard" || state.statMode === "rolled") {
      ABILITIES.forEach((ab) => { const n = state.assignedScores ? state.assignedScores[ab] : null; out[ab] = Number.isInteger(n) ? n : null; });
    }
    return out;
  }

  function scoresComplete() {
    if (!state.statMode) return false;
    const u = userBaseScores();
    return ABILITIES.every((ab) => Number.isInteger(u[ab]));
  }

  // Pre-racial base: sheet mode uses the user scores with a neutral 10 placeholder; forge mode falls back to the standard array.
  function baseScores(sp, cl, order) {
    const out = {};
    const active = isActiveBuild(sp, cl);
    if (active && SHEET_CTX) {
      const u = userBaseScores();
      ABILITIES.forEach((ab) => { out[ab] = Number.isInteger(u[ab]) ? u[ab] : 10; });
      return out;
    }
    let pool = STANDARD_ARRAY;
    if (scoresComplete()) {
      const u = userBaseScores();
      if (active) return u;
      pool = ABILITIES.map((ab) => u[ab]).sort((x, y) => y - x);
    }
    order.forEach((ab, i) => { out[ab] = pool[i]; });
    return out;
  }

  // Flexible racial increase rule for Variant Human and Half-Elf style sub-races.
  function flexRule(sp, sr) {
    if (!sp || !sp.baseAsi || !sr) return null;
    if (sr.subAsi === "top2") return { count: 2, exclude: [], label: "+1 to two different abilities" };
    if (sr.subAsi === "plus2other") {
      const taken = Object.keys(Object.keys(sp.baseAsi).length ? sp.baseAsi : { CHA: 2 });
      return { count: 2, exclude: taken, label: `+1 to two abilities other than ${taken.join(", ")}` };
    }
    return null;
  }

  function validFlexPicks(sp, sr) {
    const rule = flexRule(sp, sr);
    if (!rule) return [];
    return [...new Set(arr(state.flexAsiPicks))].filter((ab) => ABILITIES.includes(ab) && !rule.exclude.includes(ab)).slice(0, rule.count);
  }

  // Ability priority: sub-class loadout stats first, then class primaries, saves and a fallback order.
  function abilityOrder(cl, sc) {
    const prio = (LOADOUT && LOADOUT[cl.id] && LOADOUT[cl.id].sub && sc && LOADOUT[cl.id].sub[sc.id] && LOADOUT[cl.id].sub[sc.id].stats) || cl.primaryStats;
    return [...new Set([...prio, ...cl.saves, ...FALLBACK_ORDER])];
  }

  // PHB racial increases: exact base map plus the sub-race rule when baseAsi exists, else legacy asi list with lean tags.
  function applySpeciesAsi(scores, order, sp, sr, sc, picks) {
    if (sp.baseAsi) {
      Object.entries(sp.baseAsi).forEach(([ab, v]) => { scores[ab] += v; });
      const sub = sr ? sr.subAsi : null;
      if (sub === "all1") {
        ABILITIES.forEach((ab) => { scores[ab] += 1; });
      } else if (sub === "top2" || sub === "plus2other") {
        const rule = flexRule(sp, sr);
        const chosen = Array.isArray(picks) ? picks : order.filter((ab) => !rule.exclude.includes(ab)).slice(0, rule.count);
        chosen.forEach((ab) => { scores[ab] += 1; });
      } else if (sub && typeof sub === "object") {
        Object.entries(sub).forEach(([ab, v]) => { if (ab in scores) scores[ab] += v; });
      }
      return "phb";
    }
    const asi = sp.asi || [];
    if (asi.length >= ABILITIES.length) {
      ABILITIES.forEach((ab) => { scores[ab] += 1; });
    } else {
      asi.forEach((ab, i) => { scores[ab] += i === 0 ? 2 : 1; });
    }
    [...(sr ? sr.tags || [] : []), ...(sc ? sc.tags || [] : [])].forEach((t) => {
      if (LEAN_TAGS[t]) scores[LEAN_TAGS[t]] += 1;
    });
    return "legacy";
  }

  // Deterministic RPG profile at the live level: base mode scores, species ASI, level ASIs, then derived PHB numbers.
  function computeProfile(sp, sr, cl, sc, overrideLevel) {
    const combo = computeCombo(sp, sr, cl, sc);
    const lvl = clamp(Math.round(Number(overrideLevel || state.level || 1)) || 1, 1, 20);
    const pb = pbFor(lvl);
    const order = abilityOrder(cl, sc);
    const base = baseScores(sp, cl, order);
    const scores = { ...base };
    const active = isActiveBuild(sp, cl);
    const sheetMode = Boolean(active && SHEET_CTX);
    const rule = flexRule(sp, sr);
    const flex = active && rule ? validFlexPicks(sp, sr) : [];
    const picks = rule && (sheetMode || flex.length === rule.count) && active ? flex : null;
    const asiMode = applySpeciesAsi(scores, order, sp, sr, sc, picks);
    const userBase = sheetMode ? userBaseScores() : null;
    const known = {};
    ABILITIES.forEach((ab) => { known[ab] = sheetMode ? Number.isInteger(userBase[ab]) : true; });
    ABILITIES.forEach((ab) => { scores[ab] = Math.min(ABILITY_CAP, scores[ab]); });
    const racial = {};
    ABILITIES.forEach((ab) => { racial[ab] = scores[ab] - base[ab]; });
    const lv = applyLevelAsis(scores, order, cl.id, lvl);
    const asi = {};
    ABILITIES.forEach((ab) => { asi[ab] = lv.scores[ab] - scores[ab]; scores[ab] = lv.scores[ab]; });

    const mods = {};
    ABILITIES.forEach((ab) => { mods[ab] = modOf(scores[ab]); });
    const speed = (sr && sr.speedOverride) || sp.speed;
    const vision = (sr && sr.visionOverride) || sp.vision;
    const hd = HIT_DIE[cl.hitDie] || 8;
    const hpBonus = ((sr && sr.hpPerLevel) || 0) + ((sc && sc.hpPerLevel) || 0);
    const hpLv1 = hd + mods.CON + hpBonus;
    const hpAvgGain = hd / 2 + 1 + mods.CON + hpBonus;
    const hpMax = Math.max(lvl, lvl === 1 ? hpLv1 : hd + (lvl - 1) * (hd / 2 + 1) + lvl * (mods.CON + hpBonus));
    const prog = progFor(cl.id, sc ? sc.id : null, sp.id || null, sr ? sr.id : null, lvl);
    const aura = cl.id === "paladin" && lvl >= 6 ? Math.max(1, mods.CHA) : 0;
    const saves = {};
    ABILITIES.forEach((ab) => {
      const prof = (cl.saves || []).includes(ab);
      saves[ab] = { mod: mods[ab] + (prof ? pb : 0) + aura, prof, aura };
    });
    const acInfo = acValue(cl.acRule || cl.armor, mods);
    const atkStat = attackStat(cl, mods);

    const tags = new Set([...sp.tags, ...(sr ? sr.tags : []), ...cl.tags, ...(sc ? sc.tags : [])]);
    const off = OFFENSE_TAGS.filter((t) => tags.has(t)).length;
    const def = DEFENSE_TAGS.filter((t) => tags.has(t)).length;
    const primAvg = cl.primaryStats.reduce((s, ab) => s + scores[ab], 0) / cl.primaryStats.length;

    if (sheetMode && state.session) {
      const cur = state.session.hpCur;
      if (cur === null || !Number.isFinite(cur) || cur > hpMax) state.session.hpCur = hpMax;
      state.session.hdUsed = clamp(state.session.hdUsed || 0, 0, lvl);
    }

    return {
      sp, sr, cl, sc, combo, scores, order, asiMode, mods, pb, speed, vision, hd, hpLv1, hpAvgGain,
      level: lvl, hpMax, hpBonus, prog, saves, aura, ac: acInfo.ac, acInfo, atkStat,
      breakdown: { base, racial, asi }, asiApplied: lv.asiApplied || 0, known, sheetMode, flexPicks: flex,
      combat: clamp(Math.round((primAvg - 10) * 5.5 + hd * 2.5 + off * 6), 0, RATING_CAP),
      synergy: clamp(Math.round(18 + combo.score * 8 + (combo.sig ? 12 : 0)), 0, RATING_CAP),
      durability: clamp(Math.round(hd * 4 + (scores.CON - 10) * 4 + def * 6 - (sp.size === "Small" ? 4 : 0)), 0, RATING_CAP)
    };
  }

  // Compact card badge: Normal sight, standard darkvision range, or superior darkvision.
  function visionBadge(vision) {
    const v = String(vision || "Normal");
    if (/^normal/i.test(v)) return "No DV";
    const n = (v.match(/(\d+)/) || [])[1] || "60";
    return /superior/i.test(v) ? `SDV ${n}` : `DV ${n}`;
  }

  // Lv 1 armor class from the PHB starting kit rule text.
  function acValue(rule, mods) {
    const r = String(rule || "");
    if (/chain mail/i.test(r)) return { ac: 16, shield: 18, formula: "Chain Mail 16, +2 Shield = 18" };
    if (/scale/i.test(r)) return { ac: 14 + Math.min(2, mods.DEX), formula: "Scale Mail 14 + DEX max 2" };
    if (/leather/i.test(r)) return { ac: 11 + mods.DEX, formula: "Leather 11 + DEX" };
    if (/unarmored/i.test(r) && /CON/.test(r)) return { ac: 10 + mods.DEX + mods.CON, formula: "Unarmored 10 + DEX + CON" };
    if (/unarmored/i.test(r) && /WIS/.test(r)) return { ac: 10 + mods.DEX + mods.WIS, formula: "Unarmored 10 + DEX + WIS" };
    return { ac: 10 + mods.DEX, formula: /mage armor/i.test(r) ? "Unarmored 10 + DEX, Mage Armor 13 + DEX" : "Unarmored 10 + DEX" };
  }

  // Attack stat per PHB weapon rules: finesse takes the better of STR or DEX.
  function attackStat(cl, mods) {
    const pref = cl.attackPref;
    if (pref === "STR" || pref === "DEX") return pref;
    if (pref === "FINESSE") return mods.DEX >= mods.STR ? "DEX" : "STR";
    if (pref === "STR_OR_CAST") return mods.STR >= mods.DEX ? "STR" : "DEX";
    return cl.primaryStats.includes("DEX") ? "DEX" : "STR";
  }

  function dcStat(cl, sc) {
    return cl.dcAbility || cl.spellAbility || (sc && sc.spellAbility) || cl.primaryStats[0];
  }

  const CLASS_RIDERS = {
    barbarian: "Rage +2 dmg on STR melee",
    rogue: "Sneak Attack +1d6 once per turn",
    paladin: "Divine Smite +2d8 radiant from Lv 2",
    monk: "Martial Arts d4 unarmed, bonus strike",
    ranger: "Hunter's Mark +1d6 per hit",
    warlock: "Hex +1d6 necrotic per hit"
  };


  const withRoll = (row, spec) => { if (spec) row.roll = spec; return row; };

  // Live dice rows for HP, attacks, DCs, AC and saves at the current level.
  function buildDiceRows(profile) {
    const { cl, sc, mods, pb, hd, hpLv1, hpAvgGain } = profile;
    const lvl = profile.level || 1;
    const hpMax = profile.hpMax || hpLv1;
    const cantripDice = (profile.prog && profile.prog.cantripDice) || 1;
    const atk = attackStat(cl, mods);
    const rows = [];
    rows.push(withRoll(["Hit Die", cl.hitDie, `1${cl.hitDie} per level`, "Roll or take average on level up"], { label: "Hit Die", count: 1, sides: hd, bonus: mods.CON }));
    const hpFormula = lvl === 1
      ? `${hd} + CON ${signed(mods.CON)}${hpLv1 - hd - mods.CON ? ` + ${hpLv1 - hd - mods.CON} trait` : ""}`
      : `${hd} + ${lvl - 1} × ${hd / 2 + 1} + ${lvl} × CON ${signed(mods.CON)}${profile.hpBonus ? ` + ${lvl * profile.hpBonus} trait` : ""}`;
    rows.push([`Lv ${lvl} Max HP`, String(hpMax), hpFormula, lvl === 1 ? "Max Hit Die at 1st level" : "Average Hit Die per level after 1st"]);
    rows.push(["HP per Level", `${hpAvgGain} avg`, `1${cl.hitDie} + CON ${signed(mods.CON)} or ${hd / 2 + 1} + CON`, "Lv 2 and higher"]);
    rows.push(withRoll(["Primary Weapon To-Hit", signed(pb + mods[atk]), `1d20 + ${atk} ${signed(mods[atk])} + PB ${signed(pb)}`, `Attack stat ${atk}`], { label: "To-Hit", count: 1, sides: 20, bonus: pb + mods[atk], crit: true }));
    const weapons = Array.isArray(cl.signatureWeapons) ? cl.signatureWeapons : [];
    const rider = CLASS_RIDERS[cl.id] || "";
    weapons.forEach((w) => {
      const isCantrip = /^cantrip\b/i.test(w.notes || "");
      const st = w.stat === "FINESSE" ? (mods.DEX >= mods.STR ? "DEX" : "STR") : (w.stat in mods ? w.stat : atk);
      const d = parseDice(w.dice);
      if (isCantrip) {
        const scaled = d ? `${d.count * cantripDice}d${d.sides}` : w.dice;
        rows.push(withRoll([`Cantrip · ${w.name}`, scaled, `${scaled} ${w.type || ""} · scales Lv 5/11/17`.trim(), w.notes || ""], d ? { label: w.name, count: d.count * cantripDice, sides: d.sides, bonus: 0 } : null));
      } else {
        rows.push(withRoll([`Damage · ${w.name}`, `${w.dice} ${signed(mods[st])}`, `${w.dice} + ${st} ${signed(mods[st])} ${w.type || ""}`.trim(), [w.notes, rider].filter(Boolean).join(" · ")], d ? { label: w.name, count: d.count, sides: d.sides, bonus: mods[st] } : null));
      }
    });
    if (!weapons.length) rows.push(["Signature Weapon Damage", `weapon die ${signed(mods[atk])}`, `weapon die + ${atk}`, rider || "See class equipment"]);
    const dc = dcStat(cl, sc);
    rows.push(["Save DC", String(8 + pb + mods[dc]), `8 + PB ${signed(pb)} + ${dc} ${signed(mods[dc])}`, "Spell or class feature DC"]);
    rows.push(withRoll(["Spell Attack", signed(pb + mods[dc]), `1d20 + PB ${signed(pb)} + ${dc} ${signed(mods[dc])}`, cl.spellAbility || (sc && sc.spellAbility) ? "Spell attack roll" : "Feature check bonus"], { label: "Spell Attack", count: 1, sides: 20, bonus: pb + mods[dc], crit: true }));
    const ac = acValue(cl.acRule || cl.armor, mods);
    rows.push(["Armor Class", ac.shield ? `${ac.ac} / ${ac.shield}` : String(ac.ac), ac.formula, cl.acRule || cl.armor || ""]);
    rows.push(withRoll(["Initiative", signed(mods.DEX), `1d20 + DEX ${signed(mods.DEX)}`, "Roll at combat start"], { label: "Initiative", count: 1, sides: 20, bonus: mods.DEX }));
    cl.saves.forEach((ab) => {
      const sv = profile.saves && profile.saves[ab] ? profile.saves[ab].mod : pb + mods[ab];
      const aura = profile.aura ? ` + Aura ${signed(profile.aura)}` : "";
      rows.push(withRoll([`Saving Throw · ${ab}`, signed(sv), `1d20 + ${ab} ${signed(mods[ab])} + PB ${signed(pb)}${aura}`, "Proficient save"], { label: `${ab} Save`, count: 1, sides: 20, bonus: sv }));
    });
    return rows;
  }

  // Racial, class and sub-class actions tagged by tier for the actions table.
  function buildActionRows(sp, cl, sc) {
    const rows = [];
    if (sp && sp.raceAction) rows.push({ ...sp.raceAction, badge: "Species" });
    (cl && Array.isArray(cl.classActions) ? cl.classActions : []).forEach((a) => {
      rows.push({ ...a, badge: a.tier === "Advanced" ? "Advanced" : "Core" });
    });
    (sc && Array.isArray(sc.subActions) ? sc.subActions : []).forEach((a) => rows.push({ ...a, badge: "Sub-Class" }));
    return rows;
  }

  function combatActions() {
    const list = window.FORGE_DATA && window.FORGE_DATA.COMBAT_ACTIONS;
    return Array.isArray(list) ? list : [];
  }

  function forgeTable(head, bodyRows, empty) {
    const body = bodyRows.length
      ? bodyRows.join("")
      : `<tr><td colspan="${head.length}" class="table-empty">${esc(empty)}</td></tr>`;
    return `<div class="table-wrap"><table class="forge-table"><thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  const INNATE_CASTER_SPECIES = ["tiefling", "elf", "gnome", "half-elf"];

  // Local mirror of the P1 spell gate, used when playbook.js lacks it.
  function localCanCastSpells(profile) {
    const { sp, cl, sc } = profile || {};
    const sources = [];
    if (cl && cl.spellAbility) sources.push(cl.name);
    if (sc && sc.spellAbility) sources.push(sc.name);
    if (sp && INNATE_CASTER_SPECIES.includes(sp.id)) sources.push(sp.name);
    return { canCast: sources.length > 0, sources, blockedByRage: !!(cl && cl.id === "barbarian") };
  }

  // Filters universal combat actions down to what this build can legally take.
  function contextualActions(profile, base) {
    const list = arr(base);
    const pb = playbookApi();
    if (pb && typeof pb.contextualCombatActions === "function") {
      try {
        const out = pb.contextualCombatActions(profile, list);
        if (Array.isArray(out)) return out;
      } catch (err) {
        console.error(err);
      }
    }
    if (localCanCastSpells(profile).canCast) return list;
    return list.filter((a) => !/^cast a spell$/i.test(String((a && a.name) || "").trim()));
  }

  function renderActionsTab(profile) {
    if (!el.tabActions) return;
    const { sp, cl, sc } = profile;
    const diceRows = buildDiceRows(profile).map((r) => `<tr><th scope="row">${annotateStats(r[0])}</th><td class="num">${esc(r[1])}</td><td class="mono">${annotateStats(r[2])}</td><td>${annotateStats(r[3])}</td><td class="roll-cell">${r.roll ? rollBtnHtml(r.roll, "🎲") : ""}</td></tr>`);
    const actRows = buildActionRows(sp, cl, sc).map((a) => `<tr><th scope="row">${esc(a.name || "")}</th><td><span class="tier-badge tier-${a.badge.toLowerCase().replace(/[^a-z]/g, "")}">${esc(a.badge)}</span> ${esc(a.unlock || "")}</td><td>${esc(a.economy || "")}</td><td class="mono">${annotateStats(a.roll || "")}</td><td>${annotateStats(a.detail || "")}</td></tr>`);
    const ca = contextualActions(profile, combatActions());
    const caRows = ca.map((a) => `<tr><th scope="row">${esc(a.name || "")}</th><td>${esc(a.category || "")}</td><td>${esc(a.economy || "")}</td><td class="mono">${annotateStats(a.roll || "")}</td><td>${annotateStats(a.detail || "")}</td></tr>`);
    el.tabActions.innerHTML = `
      <article class="card">
        <div class="card-head"><h3>Hit Points, Attack, Damage &amp; Save Dice</h3><span class="badge">Live Lv ${profile.level || 1} · PB +${profile.pb}</span></div>
        ${forgeTable(["Parameter", `Live Lv ${profile.level || 1} Value`, "Dice Roll / PHB Formula", "Notes", "Roll"], diceRows, "No class data")}
      </article>
      <article class="card">
        <div class="card-head"><h3>Class, Sub-Class &amp; Lineage Actions</h3><span class="badge">${actRows.length} Actions</span></div>
        ${forgeTable(["Action", "Tier & Unlock", "Economy", "Dice", "Effect"], actRows, "Action catalog loading")}
      </article>
      <article class="card">
        <div class="card-head"><h3>Standard Combat Actions · PHB Ch. 9</h3><span class="badge">${caRows.length} Actions Available to ${esc(profile.sr ? profile.sr.name : sp.name)} ${esc(cl.name)}</span></div>
        ${forgeTable(["Action", "Category", "Economy", "Dice", "Effect"], caRows, "Combat rules loading")}
      </article>`;
  }

  // Codex cards defining the four selections with source and lore.
  function buildIdentity(sp, sr, cl, sc) {
    const card = (kind, icon, name, source, lore) => `
      <article class="codex-card" data-codex="${kind.toLowerCase().replace(/[^a-z]/g, "")}">
        <div class="codex-head"><span class="codex-kind">${esc(kind)}</span><span class="codex-source">${esc(source || "Handbook")}</span></div>
        <h3 class="codex-name">${icon ? `${icon} ` : ""}${esc(name)}</h3>
        <p class="codex-lore">${annotateStats(lore || "")}</p>
      </article>`;
    const cards = [card("Species", sp.icon, sp.name, sp.source, sp.lore || (sp.traits && sp.traits[0] ? sp.traits[0].detail : sp.asiNote))];
    if (sr) cards.push(card("Sub-Race", "", sr.name, sr.source, sr.lore || `${sr.focus} — ${sr.bonus}`));
    cards.push(card("Class", cl.icon, cl.name, cl.source, cl.lore || cl.armor));
    if (sc) {
      const src = [sc.source, cl.subclassLevel ? `Lv ${cl.subclassLevel}` : ""].filter(Boolean).join(" · ");
      cards.push(card("Sub-Class", "", sc.name, src, sc.lore || `${sc.focus} — ${sc.bonus}`));
    }
    return cards.join("");
  }

  // Better-combination cards, rendered in their own panel below the selectors.
  function renderUpgrades(sp, sr, cl, sc) {
    if (!el.upgrades) return;
    const s = getBetterSuggestions(sp, sr, cl, sc);
    const items = [...s.forClass.slice(0, 2), ...s.forSpecies.slice(0, 2)].slice(0, 4);
    el.upgrades.innerHTML = `
      <div class="upgrades-head">
        <h2>Better Combinations &amp; Upgrades</h2>
        <span class="badge">Hover to Preview · Click to Apply</span>
      </div>
      <p class="rp-note">Top sub-race &amp; sub-class pairings for <strong>${esc(cl.name)}</strong>, plus top classes for <strong>${esc(sr ? sr.name : sp.name)}</strong>.</p>
      <div class="suggestion-grid">
        ${items.map((item) => `
          <button class="suggest-card" type="button" data-apply-sp="${item.sp.id}" data-apply-sr="${item.sr?.id || ""}" data-apply-cl="${item.cl.id}" data-apply-sc="${item.sc?.id || ""}">
            <span class="suggest-title">${esc(item.sr ? item.sr.name : item.sp.name)} · ${esc(item.sc ? item.sc.name : item.cl.name)} ${esc(item.cl.name)}</span>
            <span class="suggest-meta">${esc(item.c.grade)}-Tier · ${item.c.sharedTags.length ? esc(item.c.sharedTags.slice(0, 2).join(", ")) : item.c.sharedStats.length ? statTerms(item.c.sharedStats, " / ") : "Utility"}</span>
            <span class="suggest-why">${annotateStats(item.c.loop)}</span>
          </button>`).join("")}
      </div>`;
  }

  function buildFromApplyCard(card) {
    const sp = SPECIES.find((x) => x.id === card.dataset.applySp);
    const cl = CLASSES.find((x) => x.id === card.dataset.applyCl);
    if (!sp || !cl) return null;
    const sr = (SUBRACES[sp.id] || []).find((x) => x.id === card.dataset.applySr) || SUBRACES[sp.id]?.[0];
    const sc = (SUBCLASSES[cl.id] || []).find((x) => x.id === card.dataset.applySc) || SUBCLASSES[cl.id]?.[0];
    return { sp, sr, cl, sc };
  }

  function profileValue(profile, key) {
    return ABILITIES.includes(key) ? profile.scores[key] : profile[key];
  }

  function buildLabel(sp, sr, cl, sc) {
    return `${sr ? sr.name : sp.name} ${sc ? sc.name : cl.name} ${cl.name}`;
  }

  // Plain-English loadout for a class and sub-class, falling back to class defaults.
  function getLoadout(cl, sc) {
    const base = (LOADOUT && LOADOUT[cl.id]) || {};
    const sub = (sc && base.sub && base.sub[sc.id]) || {};
    const stats = sub.stats || cl.primaryStats.slice(0, 2);
    const abilityDesc = base.ability || "Powers your main attacks and class features";
    return {
      stats,
      ability: `${stats.map(statLabel).join(" & ")} — ${plainStats(abilityDesc)}`,
      abilityHtml: `${statTerms(stats, " & ")} — ${annotateStats(abilityDesc)}`,
      action: sub.action || base.action || "Attack or cast your best spell",
      gear: sub.gear || base.gear || cl.armor
    };
  }

  // Short 2-3 word loadout summary for Center Stage; detailed text stays in tabs below.
  function shortStatTerm(ab) {
    if (!STAT_META[ab]) return esc(ab);
    const tip = esc(statTip(ab));
    return `<span class="stat-term" data-stat="${ab}" data-dnd-tip="${tip}" title="${tip}" aria-label="${esc(STAT_META[ab].label)} — ${tip}">${esc(ab)}</span>`;
  }

  function getShortLoadout(cl, sc) {
    const base = (SHORT_LOADOUT && SHORT_LOADOUT[cl.id]) || {};
    const sub = (sc && base.sub && base.sub[sc.id]) || {};
    const fullBase = (LOADOUT && LOADOUT[cl.id]) || {};
    const fullSub = (sc && fullBase.sub && fullBase.sub[sc.id]) || {};
    const stats = sub.stats || fullSub.stats || cl.primaryStats.slice(0, 2);
    return {
      ability: stats.join(" · "),
      abilityHtml: stats.map(shortStatTerm).join(" · "),
      action: sub.action || base.action || "Attack / Cast",
      gear: sub.gear || base.gear || "Standard Gear"
    };
  }

  function scoreToStars(val100) {
    return Math.round((clamp(val100, 0, RATING_CAP) / 20) * 10) / 10;
  }

  function starItemHtml(r) {
    return `
      <div class="star-item" data-star-rating="${r.key}" data-star-val="0">
        <div class="star-top">
          <span class="star-label">${ratingTerm(r)}</span>
          <span class="star-num" data-star-num></span>
        </div>
        <div class="star-bottom">
          <span class="star-meter" aria-hidden="true"><span class="star-meter-bg">★★★★★</span><span class="star-meter-fill" data-star-fill>★★★★★</span></span>
          <span class="star-delta" data-star-delta></span>
        </div>
      </div>`;
  }

  function currentBuild() {
    const sp = SPECIES.find((s) => s.id === state.speciesId);
    const cl = CLASSES.find((c) => c.id === state.classId);
    return { sp, sr: getActiveSubrace(sp), cl, sc: getActiveSubclass(cl) };
  }

  function currentProfile() {
    const b = currentBuild();
    return computeProfile(b.sp, b.sr, b.cl, b.sc);
  }

  // Profile that reflects only explicit user sheet inputs for the active build.
  function sheetProfile() {
    const prev = SHEET_CTX;
    SHEET_CTX = true;
    try {
      return currentProfile();
    } finally {
      SHEET_CTX = prev;
    }
  }

  const SILHOUETTE_SVG = `
    <svg class="stage-silhouette" viewBox="0 0 200 240" aria-hidden="true">
      <defs>
        <radialGradient id="auraGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="var(--aura)" stop-opacity="0.55" />
          <stop offset="100%" stop-color="var(--aura)" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="cloakGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a3142" />
          <stop offset="100%" stop-color="#0d1017" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="112" r="104" fill="url(#auraGrad)" />
      <ellipse cx="100" cy="232" rx="70" ry="7" fill="var(--aura)" opacity="0.28" />
      <path d="M100 16 C70 16 55 42 55 72 C55 93 63 106 73 114 L58 131 C38 140 27 162 24 200 L22 234 L178 234 L176 200 C173 162 162 140 142 131 L127 114 C137 106 145 93 145 72 C145 42 130 16 100 16 Z" fill="url(#cloakGrad)" stroke="var(--aura)" stroke-opacity="0.55" stroke-width="1.5" />
      <path d="M100 34 C82 34 72 52 72 76 C72 96 84 110 100 110 C116 110 128 96 128 76 C128 52 118 34 100 34 Z" fill="#06070a" />
      <ellipse cx="89" cy="80" rx="5" ry="2.4" fill="var(--aura)" />
      <ellipse cx="111" cy="80" rx="5" ry="2.4" fill="var(--aura)" />
      <path d="M100 118 L100 234" stroke="var(--aura)" stroke-opacity="0.22" stroke-width="1" />
    </svg>`;

  function barRowHtml(key, label) {
    return `
      <div class="bar-row" data-bar="${key}">
        <span class="bar-label">${label}</span>
        <div class="bar-track"><div class="bar-fill"></div><div class="bar-gain"></div><div class="bar-loss"></div></div>
        <span class="bar-value"><span class="bar-num"></span><span class="bar-delta"></span></span>
      </div>`;
  }

  function initStage() {
    el.stage.innerHTML = `
      <div class="stage-card" data-stage-card>
        <div class="stage-head">
          <span class="stage-kicker" data-stage-kicker></span>
          <span class="stage-grade" data-stage-grade></span>
        </div>
        <div class="stage-stars" data-stage-stars aria-label="Build Ratings out of 5 stars">
          ${RATINGS.map(starItemHtml).join("")}
        </div>
        <div class="stage-figure">
          <div class="stage-portrait-host" data-stage-portrait>${SILHOUETTE_SVG}</div>
        </div>
        <div class="stage-status-row">
          <p class="stage-epithet" data-stage-epithet></p>
          <div class="stage-preview" data-stage-preview></div>
        </div>
        <div class="bar-section">
          <div class="bar-section-title">Attributes</div>
          ${ABILITIES.map((ab) => barRowHtml(ab, statTerm(ab))).join("")}
        </div>
        <div class="bar-section loadout-section" data-loadout>
          <div class="bar-section-title">Quick Loadout</div>
          <div class="loadout-row" data-loadout-row="ability"><span class="loadout-label">Ability</span><span class="loadout-text" data-loadout-text></span></div>
          <div class="loadout-row" data-loadout-row="action"><span class="loadout-label">Action</span><span class="loadout-text" data-loadout-text></span></div>
          <div class="loadout-row" data-loadout-row="gear"><span class="loadout-label">Gear</span><span class="loadout-text" data-loadout-text></span></div>
        </div>
      </div>`;
    el.stageParts = {
      card: el.stage.querySelector("[data-stage-card]"),
      portrait: el.stage.querySelector("[data-stage-portrait]"),
      kicker: el.stage.querySelector("[data-stage-kicker]"),
      grade: el.stage.querySelector("[data-stage-grade]"),
      epithet: el.stage.querySelector("[data-stage-epithet]"),
      preview: el.stage.querySelector("[data-stage-preview]"),
      stars: Array.from(el.stage.querySelectorAll("[data-star-rating]")),
      bars: Array.from(el.stage.querySelectorAll("[data-bar]")),
      loadoutRows: Array.from(el.stage.querySelectorAll("[data-loadout-row]"))
    };
  }

  function loadoutRowHtml(loadout, key) {
    return key === "ability" ? loadout.abilityHtml : esc(loadout[key]);
  }

  function formatDelta(d) {
    if (d > 0) return `▲+${d}`;
    if (d < 0) return `▼${d}`;
    return "";
  }

  // Paints the AI portrait frame, swapping img src in place, with SVG as the last resort.
  function renderStagePortrait(host, shown, isPreview) {
    const av = window.FORGE_AVATAR;
    if (!host || !av) return;
    const opts = { grade: shown.combo.grade, preview: isPreview };
    if (typeof av.renderPortraitHtml === "function") {
      const frame = host.querySelector(".codex-frame");
      if (frame && typeof av.updatePortraitFrame === "function" && av.updatePortraitFrame(frame, shown.sp, shown.sr, shown.cl, shown.sc, opts)) return;
      host.innerHTML = av.renderPortraitHtml(shown.sp, shown.sr, shown.cl, shown.sc, opts);
      return;
    }
    host.innerHTML = av.renderPortraitSvg(shown.sp, shown.sr, shown.cl, shown.sc, opts);
  }

  function updateStage(cur, prev) {
    const parts = el.stageParts;
    const shown = prev || cur;
    const curName = `${cur.sp.icon} ${cur.sr ? cur.sr.name : cur.sp.name} × ${cur.cl.icon} ${cur.sc ? cur.sc.name : cur.cl.name}`;
    parts.card.dataset.grade = shown.combo.grade.toLowerCase();
    parts.card.classList.toggle("is-previewing", Boolean(prev));
    if (parts.portrait && window.FORGE_AVATAR) {
      const pKey = `${shown.sp.id}|${shown.sr ? shown.sr.id : ""}|${shown.cl.id}|${shown.sc ? shown.sc.id : ""}|${shown.combo.grade}`;
      if (parts.portrait.dataset.pKey !== pKey) {
        parts.portrait.dataset.pKey = pKey;
        renderStagePortrait(parts.portrait, shown, Boolean(prev));
      }
    }
    parts.kicker.textContent = prev ? `Current · ${curName}` : curName;
    parts.grade.className = `stage-grade grade-${shown.combo.grade.toLowerCase()}`;
    parts.grade.textContent = prev && prev.combo.grade !== cur.combo.grade
      ? `${cur.combo.grade} → ${prev.combo.grade}-Tier`
      : `${shown.combo.grade}-Tier`;
    parts.epithet.textContent = shown.combo.epithet;

    let ups = 0;
    let downs = 0;
    parts.stars.forEach((item) => {
      const key = item.dataset.starRating;
      const c = profileValue(cur, key);
      const p = prev ? profileValue(prev, key) : c;
      const d = p - c;
      const fill = item.querySelector("[data-star-fill]");
      const numEl = item.querySelector("[data-star-num]");
      const termEl = item.querySelector(".stat-term");
      const deltaEl = item.querySelector("[data-star-delta]");
      const meta = RATINGS.find((r) => r.key === key);
      const starVal = scoreToStars(p).toFixed(1);
      item.dataset.starVal = starVal;
      if (fill) fill.style.width = `${clamp(p, 0, RATING_CAP)}%`;
      if (numEl) numEl.textContent = `${starVal}`;
      if (termEl && meta) {
        const dynTip = `${meta.label}: ${starVal} / 5 ★ — ${meta.tip.split(" — ")[1] || meta.tip}`;
        termEl.setAttribute("data-dnd-tip", dynTip);
        if (termEl.dataset.dndTitle === undefined) termEl.setAttribute("title", dynTip);
      }
      item.setAttribute("aria-label", `${key} ${starVal} out of 5 stars`);
      if (!prev) {
        item.classList.remove("is-up", "is-down");
        if (deltaEl) deltaEl.textContent = "";
        return;
      }
      item.classList.toggle("is-up", d > 0);
      item.classList.toggle("is-down", d < 0);
      if (deltaEl) deltaEl.textContent = d > 0 ? "▲" : d < 0 ? "▼" : "";
      if (d > 0) ups += 1;
      if (d < 0) downs += 1;
    });

    parts.bars.forEach((row) => {
      const key = row.dataset.bar;
      const max = ABILITIES.includes(key) ? ABILITY_CAP : RATING_CAP;
      const c = profileValue(cur, key);
      const p = prev ? profileValue(prev, key) : c;
      const d = p - c;
      const pct = (v) => `${(clamp(v, 0, max) / max) * 100}%`;
      const fill = row.querySelector(".bar-fill");
      const gain = row.querySelector(".bar-gain");
      const loss = row.querySelector(".bar-loss");
      const deltaEl = row.querySelector(".bar-delta");
      if (!prev) {
        // Committed state: pure gold fill, no stale preview colors.
        fill.style.width = pct(c);
        gain.style.left = pct(c);
        gain.style.width = "0%";
        loss.style.left = pct(c);
        loss.style.width = "0%";
        row.querySelector(".bar-num").textContent = String(c);
        deltaEl.textContent = "";
        deltaEl.className = "bar-delta";
        row.classList.remove("is-up", "is-down");
        return;
      }
      fill.style.width = pct(Math.min(c, p));
      gain.style.left = pct(c);
      gain.style.width = d > 0 ? pct(d) : "0%";
      loss.style.left = pct(p);
      loss.style.width = d < 0 ? pct(-d) : "0%";
      row.querySelector(".bar-num").textContent = String(p);
      deltaEl.textContent = formatDelta(d);
      deltaEl.className = `bar-delta${d > 0 ? " up" : d < 0 ? " down" : ""}`;
      row.classList.toggle("is-up", d > 0);
      row.classList.toggle("is-down", d < 0);
      if (d > 0) ups += 1;
      if (d < 0) downs += 1;
    });

    const curLoadout = getShortLoadout(cur.cl, cur.sc);
    const shownLoadout = getShortLoadout(shown.cl, shown.sc);
    parts.loadoutRows.forEach((row) => {
      const key = row.dataset.loadoutRow;
      row.querySelector("[data-loadout-text]").innerHTML = loadoutRowHtml(shownLoadout, key);
      row.classList.toggle("is-changed", Boolean(prev) && shownLoadout[key] !== curLoadout[key]);
    });

    parts.epithet.hidden = Boolean(prev);
    if (prev) {
      parts.preview.hidden = false;
      parts.preview.innerHTML = `
        <span class="preview-tag">Preview</span>
        <span class="delta-up-text">▲ ${ups}</span>
        <span class="delta-down-text">▼ ${downs}</span>
        <span class="preview-hint">Click to commit</span>`;
    } else {
      parts.preview.hidden = true;
      parts.preview.innerHTML = "";
    }
  }

  function setPreview(build) {
    const keyOf = (b) => `${b.sp.id}|${b.sr?.id}|${b.cl.id}|${b.sc?.id}`;
    // Hovering the already-selected option is not a preview.
    const key = build && keyOf(build) !== keyOf(currentBuild()) ? keyOf(build) : null;
    if (key === state.previewKey) return;
    state.previewKey = key;
    const cur = currentProfile();
    updateStage(cur, key ? computeProfile(build.sp, build.sr, build.cl, build.sc) : null);
  }

  // Resolves the build a hovered card would produce, holding the opposite side at its current selection.
  function buildFromTarget(target) {
    const cur = currentBuild();
    const spCard = target.closest("[data-species]");
    if (spCard) {
      const sp = SPECIES.find((s) => s.id === spCard.dataset.species);
      const sr = sp.id === cur.sp.id ? cur.sr : SUBRACES[sp.id]?.[0];
      return { ...cur, sp, sr };
    }
    const srBtn = target.closest("[data-subrace]");
    if (srBtn) {
      const sr = (SUBRACES[cur.sp.id] || []).find((s) => s.id === srBtn.dataset.subrace);
      return { ...cur, sr };
    }
    const clCard = target.closest("[data-class]");
    if (clCard) {
      const cl = CLASSES.find((c) => c.id === clCard.dataset.class);
      const sc = cl.id === cur.cl.id ? cur.sc : SUBCLASSES[cl.id]?.[0];
      return { ...cur, cl, sc };
    }
    const scBtn = target.closest("[data-subclass]");
    if (scBtn) {
      const sc = (SUBCLASSES[cur.cl.id] || []).find((s) => s.id === scBtn.dataset.subclass);
      return { ...cur, sc };
    }
    return null;
  }

  function applyRoleUi() {
    ["species", "class"].forEach((side) => {
      const hint = document.querySelector(`[data-role-hint="${side}"]`);
      if (hint) hint.textContent = "Hover to preview · click to commit";
    });
  }

  function synergyChip(baseSynergy, profile) {
    const d = profile.synergy - baseSynergy;
    if (d === 0) return `<span class="card-delta">SYN ±0</span>`;
    return `<span class="card-delta ${d > 0 ? "up" : "down"}">SYN ${d > 0 ? "▲" : "▼"}${Math.abs(d)}</span>`;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  let toastTimer = null;
  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2400);
  }

  function rollUniform(sides) {
    const limit = Math.floor(0x100000000 / sides) * sides;
    const buf = new Uint32Array(1);
    let rand = 0;
    do {
      crypto.getRandomValues(buf);
      rand = buf[0];
    } while (rand >= limit);
    return (rand % sides) + 1;
  }

  function getActiveSubrace(sp) {
    const list = SUBRACES[sp.id] || [];
    return list.find((s) => s.id === state.subraceId) || list[0];
  }

  function getActiveSubclass(cl) {
    const list = SUBCLASSES[cl.id] || [];
    return list.find((s) => s.id === state.subclassId) || list[0];
  }

  function renderSelectors() {
    el.speciesCount.textContent = `${SPECIES.length} Species`;
    el.classCount.textContent = `${CLASSES.length} Classes`;
    const curSp = SPECIES.find((s) => s.id === state.speciesId);
    const curSr = getActiveSubrace(curSp);
    const curCl = CLASSES.find((c) => c.id === state.classId);
    const curSc = getActiveSubclass(curCl);
    const baseSyn = computeProfile(curSp, curSr, curCl, curSc).synergy;

    el.speciesGrid.innerHTML = SPECIES.map((sp) => {
      const sr = SUBRACES[sp.id]?.[0];
      const pSr = sp.id === curSp.id ? curSr : sr;
      const c = computeCombo(sp, pSr, curCl, curSc);
      const chip = synergyChip(baseSyn, computeProfile(sp, pSr, curCl, curSc));
      return `
        <button class="select-card" type="button" role="option" aria-selected="${sp.id === state.speciesId}" data-species="${sp.id}">
          <div class="card-top">
            <span class="card-title-row"><span class="card-icon">${sp.icon}</span><span class="card-name">${esc(sp.name)}</span></span>
            <span class="tier-dot tier-${c.grade.toLowerCase()}" title="${esc(c.gradeLabel)}"></span>
          </div>
          <span class="card-meta">${(pSr && pSr.speedOverride) || sp.speed}ft · ${esc(visionBadge((pSr && pSr.visionOverride) || sp.vision))}</span>
          <span class="card-tag">${annotateStats(sp.asiNote)}</span>
          ${chip}
        </button>`;
    }).join("");

    const srList = SUBRACES[curSp.id] || [];
    el.subraceStrip.innerHTML = srList.map((sr) => {
      const c = computeCombo(curSp, sr, curCl, curSc);
      const chip = synergyChip(baseSyn, computeProfile(curSp, sr, curCl, curSc));
      return `
      <button class="sub-pill" type="button" role="option" aria-selected="${sr.id === curSr?.id}" data-subrace="${sr.id}" title="${esc(plainStats(sr.focus))} · ${esc(c.gradeLabel)}">
        <span class="tier-dot tier-${c.grade.toLowerCase()}"></span>
        <span>${esc(sr.name)}</span>${chip}
      </button>`;
    }).join("");

    el.classGrid.innerHTML = CLASSES.map((cl) => {
      const sc = SUBCLASSES[cl.id]?.[0];
      const pSc = cl.id === curCl.id ? curSc : sc;
      const c = computeCombo(curSp, curSr, cl, pSc);
      const chip = synergyChip(baseSyn, computeProfile(curSp, curSr, cl, pSc));
      return `
        <button class="select-card" type="button" role="option" aria-selected="${cl.id === state.classId}" data-class="${cl.id}">
          <div class="card-top">
            <span class="card-title-row"><span class="card-icon">${cl.icon}</span><span class="card-name">${esc(cl.name)}</span></span>
            <span class="tier-dot tier-${c.grade.toLowerCase()}" title="${esc(c.gradeLabel)}"></span>
          </div>
          <span class="card-meta">${cl.hitDie} · ${statTerms(cl.primaryStats, " / ")}</span>
          <span class="card-tag">${cl.skillCount} Class Skills</span>
          ${chip}
        </button>`;
    }).join("");

    const scList = SUBCLASSES[curCl.id] || [];
    el.subclassStrip.innerHTML = scList.map((sc) => {
      const c = computeCombo(curSp, curSr, curCl, sc);
      const chip = synergyChip(baseSyn, computeProfile(curSp, curSr, curCl, sc));
      return `
      <button class="sub-pill" type="button" role="option" aria-selected="${sc.id === curSc?.id}" data-subclass="${sc.id}" title="${esc(plainStats(sc.focus))} · ${esc(c.gradeLabel)}">
        <span class="tier-dot tier-${c.grade.toLowerCase()}"></span>
        <span>${esc(sc.name)}</span>${chip}
      </button>`;
    }).join("");
  }

  function renderDetails() {
    const sp = SPECIES.find((s) => s.id === state.speciesId);
    const sr = getActiveSubrace(sp);
    const cl = CLASSES.find((c) => c.id === state.classId);
    const sc = getActiveSubclass(cl);
    const combo = computeCombo(sp, sr, cl, sc);
    const profile = computeProfile(sp, sr, cl, sc);
    const matrix = buildRoleplayMatrix(sp, sr, cl, sc, combo);
    const loadout = getLoadout(cl, sc);

    ["trait", "ideal", "bond", "flaw"].forEach((k) => {
      const len = matrix[k + "s"].length;
      if (state.rp[k].idx >= len) state.rp[k].idx = 0;
    });

    // Each section is isolated so one failure never aborts tab rendering.
    try {
      el.comboHero.innerHTML = `
        <div class="hero-head">
          <div>
            <div class="hero-kicker">${sp.icon} ${esc(sr ? sr.name : sp.name)} × ${cl.icon} ${esc(sc ? sc.name : cl.name)} ${esc(cl.name)}</div>
            <h2 class="hero-title">${esc(combo.epithet)}</h2>
            <p class="hero-epithet">${annotateStats(combo.loop)}</p>
          </div>
          <span class="synergy-pill grade-${combo.grade.toLowerCase()}">${esc(combo.gradeLabel)}</span>
        </div>
        <div class="stat-strip">
          <span class="stat-chip">Hit Die <strong>${cl.hitDie}</strong></span>
          <span class="stat-chip">Speed <strong>${profile.speed} ft</strong></span>
          <span class="stat-chip">Vision <strong>${esc(profile.vision)}</strong></span>
          <span class="stat-chip">Lv 1 HP <strong>${profile.hpLv1}</strong></span>
          <span class="stat-chip">Primary <strong>${statTerms(cl.primaryStats, " / ")}</strong></span>
          <span class="stat-chip">Saves <strong>${statTerms(cl.saves, " / ")}</strong></span>
        </div>`;
    } catch (err) {
      console.error(err);
    }

    try {
      if (el.identity) el.identity.innerHTML = buildIdentity(sp, sr, cl, sc);
    } catch (err) {
      console.error(err);
    }

    try {
      renderUpgrades(sp, sr, cl, sc);
    } catch (err) {
      console.error(err);
    }

    try {
      renderActionsTab(profile);
    } catch (err) {
      console.error(err);
    }

    try {
      el.tabSynergy.innerHTML = `
        <div class="panel-grid">
          <article class="card">
            <div class="card-head">
              <h3>${sp.icon} ${esc(sr ? sr.name : sp.name)}</h3>
              <span class="badge">${esc(sp.size)} · ${profile.speed} ft</span>
            </div>
            <ul class="list-clean">
              <li><strong>Lineage &amp; Vision</strong>${annotateStats(sp.asiNote)} · ${esc(profile.vision)}</li>
              ${sr ? `<li><strong>Sub-Race (${esc(sr.name)})</strong>${annotateStats(sr.focus)} — ${annotateStats(sr.bonus)}</li>` : ""}
              ${sp.traits.slice(0, 2).map((t) => `<li><strong>${esc(t.name)}</strong>${annotateStats(t.detail)}</li>`).join("")}
            </ul>
          </article>
          <article class="card">
            <div class="card-head">
              <h3>${cl.icon} ${esc(sc ? sc.name : cl.name)} ${esc(cl.name)}</h3>
              <span class="badge">${cl.hitDie} · ${statTerms(cl.primaryStats, " / ")}</span>
            </div>
            <ul class="list-clean">
              <li><strong>Saves &amp; Skills</strong>Saves: ${statTerms(cl.saves, " / ")} · ${cl.skillCount} class skills</li>
              <li><strong>Core Loop</strong>${annotateStats(combo.loop)}</li>
              <li><strong>Key Ability</strong>${loadout.abilityHtml}</li>
              <li><strong>On Your Turn</strong>${annotateStats(loadout.action)}</li>
              <li><strong>Weapons / Gear</strong>${annotateStats(loadout.gear)}</li>
              ${sc ? `<li><strong>Sub-Class (${esc(sc.name)})</strong>${annotateStats(sc.focus)} — ${annotateStats(sc.bonus)}</li>` : ""}
            </ul>
          </article>
          <article class="card">
            <div class="card-head"><h3>Niche Mechanics &amp; Sub-Hooks</h3><span class="badge">${combo.niches.length} Hooks</span></div>
            <ul class="list-clean">${combo.niches.map((n) => `<li><strong>${esc(n.name)}</strong>${annotateStats(n.detail)}</li>`).join("")}</ul>
          </article>
          <article class="card">
            <div class="card-head"><h3>Base Traits &amp; Tradeoffs</h3><span class="badge">${combo.sharedStats.length} ASI Match</span></div>
            <ul class="list-clean">
              ${sp.traits.map((t) => `<li><strong>${esc(sp.name)}: ${esc(t.name)}</strong>${annotateStats(t.detail)}</li>`).join("")}
              ${combo.frictions.map((f) => `<li><strong>Table Note</strong>${annotateStats(f)}</li>`).join("")}
            </ul>
          </article>
        </div>`;
    } catch (err) {
      console.error(err);
    }

    try {
      const speciesSkills = combo.speciesSkills || sp.skills || [];
      const ss = skillSheet(sheetProfile());
      const classPills = ss.pool.map((name) => {
        const row = ss.rows.find((r) => r.name === name);
        const on = ss.picks.includes(name);
        const lockedSrc = row && row.src && row.src !== "Class" ? row.src : "";
        return `<button type="button" class="check-chip${on ? " on" : ""}${lockedSrc ? " is-disabled" : ""}" data-forge-class-skill="${esc(name)}" aria-pressed="${on}"${lockedSrc ? " disabled" : ""}>${esc(name)}${lockedSrc ? ` <small>${esc(lockedSrc)}</small>` : ""}</button>`;
      }).join("");
      el.tabSkills.innerHTML = `
        <div class="panel-grid">
          <article class="card full" data-proficiencies>
            <div class="card-head"><h3>PHB Proficiencies</h3><span class="badge">${esc(cl.name)} · ${esc(sr ? sr.name : sp.name)}</span></div>
            <ul class="list-clean prof-list">
              <li><strong>Armor</strong>${annotateStats(cl.armor || "None")}</li>
              <li><strong>Weapons</strong>${annotateStats(cl.weapons || "See class equipment")}</li>
              <li><strong>Tools</strong>${annotateStats(cl.tools || "None")}</li>
              <li><strong>Saving Throws</strong>${statTerms(cl.saves, " / ")}</li>
              <li><strong>Species Skills</strong>${speciesSkills.length ? esc(speciesSkills.join(", ")) : "None fixed"}</li>
            </ul>
          </article>
          <article class="card">
            <div class="card-head"><h3>Guaranteed &amp; Recommended Skills</h3><span class="badge">${cl.skillCount} Class Picks</span></div>
            <div class="pill-row">
              ${speciesSkills.length ? speciesSkills.map((s) => `<span class="pill synergy">Species: ${esc(s)}</span>`).join("") : `<span class="pill">No fixed species skill</span>`}
              ${combo.recommendedSkills.map((s) => `<span class="pill">Pick: ${esc(s)}</span>`).join("")}
            </div>
          </article>
          <article class="card">
            <div class="card-head"><h3>Overlap &amp; Redundancy Check</h3><span class="badge">${combo.overlaps.length ? "Overlap" : "Zero Waste"}</span></div>
            <div class="pill-row">${combo.overlaps.length ? combo.overlaps.map((o) => `<span class="pill overlap">Duplicate: ${esc(o)}</span>`).join("") : `<span class="pill synergy">Clean skill budget</span>`}</div>
          </article>
          <article class="card full">
            <div class="card-head"><h3>Class Skill Pool · choose ${ss.cap} · ${ss.picks.length} / ${ss.cap}</h3><span class="badge">${esc(cl.armor)}</span></div>
            <div class="check-grid">${classPills}</div>
          </article>
        </div>`;
    } catch (err) {
      console.error(err);
    }

    try {
      const selIdeal = matrix.ideals[state.rp.ideal.idx];
      const selFlaw = matrix.flaws[state.rp.flaw.idx];
      const selBond = matrix.bonds[state.rp.bond.idx];
      const selTrait = matrix.traits[state.rp.trait.idx];

      el.tabRoleplay.innerHTML = `
        <div class="rp-toolbar">
          <p class="rp-note"><strong>RP++ Matrix:</strong> Lock favorite facets, reroll the rest, or choose directly below.</p>
          <button id="btn-reroll-rp" class="btn btn-secondary" type="button">🎲 Reroll Unlocked RP++</button>
        </div>
        <div class="rp-grid">
          ${renderRpBox("trait", "Personality Trait", matrix.traits.map((t) => ({ tag: "Trait", text: t })), state.rp.trait)}
          ${renderRpBox("ideal", "Ideal", matrix.ideals, state.rp.ideal)}
          ${renderRpBox("bond", "Bond", matrix.bonds.map((b) => ({ tag: "Bond", text: b })), state.rp.bond)}
          ${renderRpBox("flaw", "Flaw", matrix.flaws.map((f) => ({ tag: "Flaw", text: f })), state.rp.flaw)}
        </div>
        <article class="card">
          <div class="card-head"><h3>Active Table Tension Hook</h3><span class="badge">Ideal ↔ Flaw Conflict</span></div>
          <div class="rp-tension">When your ideal (<em>${esc(selIdeal.text)}</em>) calls for action, your flaw (<em>${esc(selFlaw)}</em>) collides with it — anchored by <em>${esc(selBond)}</em> and colored by <em>${esc(selTrait)}</em>.</div>
        </article>`;
    } catch (err) {
      console.error(err);
    }

    try {
      renderDiceTab();
    } catch (err) {
      console.error(err);
    }

    try {
      renderAppendixTab();
    } catch (err) {
      console.error(err);
    }
  }

  function cubeTransform(p) {
    return `rotateX(${p.tx.toFixed(1)}deg) rotateY(${p.ty.toFixed(1)}deg) rotateX(${p.rx.toFixed(1)}deg) rotateY(${p.ry.toFixed(1)}deg)`;
  }

  function renderDie3D(sides, rawVal) {
    if (sides === 6) {
      const hit = state.dice.landed[6] ? Number(rawVal) : -1;
      const p = state.dice.poses[6];
      const cls = (n) => (hit === n ? " landed" : "");
      return `
        <div class="die-stage">
          <div class="die-3d" data-cube-3d="6" style="transform:${cubeTransform(p)};">
            <div class="cube-face cube-front${cls(1)}" data-face-num="1">1</div>
            <div class="cube-face cube-back${cls(6)}" data-face-num="6">6</div>
            <div class="cube-face cube-right${cls(2)}" data-face-num="2">2</div>
            <div class="cube-face cube-left${cls(5)}" data-face-num="5">5</div>
            <div class="cube-face cube-top${cls(3)}" data-face-num="3">3</div>
            <div class="cube-face cube-bottom${cls(4)}" data-face-num="4">4</div>
          </div>
        </div>`;
    }
    return `
      <div class="die-stage">
        <canvas width="124" height="124" data-die-canvas="${sides}" style="width:88px;height:88px;"></canvas>
      </div>`;
  }

  function paintCanvasDice() {
    [4, 8, 10, 12, 20].forEach((sides) => {
      const canvas = document.querySelector(`[data-die-canvas="${sides}"]`);
      if (!canvas) return;
      const pose = state.dice.poses[sides];
      const has3d = Boolean(window.DICE_3D && window.DICE_3D.MESHES && window.DICE_3D.MESHES[sides]);
      if (!has3d) {
        draw2DDie(canvas, sides, state.dice.values[sides], Boolean(state.dice.landed[sides]), pose.rz);
        return;
      }
      const shownVal = state.dice.landed[sides] ? state.dice.values[sides] : null;
      window.DICE_3D.drawPoly(
        canvas,
        sides,
        pose.rx,
        pose.ry,
        pose.rz,
        shownVal,
        Boolean(state.dice.landed[sides])
      );
    });
  }

  function diceDockHud() {
    const ab = state.builderOpen && state.statMode === "rolled" ? state.activeRollSlot : null;
    if (ab) {
      const set = state.abilityRolls[ab];
      const spinningD6 = state.dice.rollingDie === 6;
      const pips = [0, 1, 2, 3].map((i) => {
        const isSpinSlot = spinningD6 && i === set.length;
        return `<span class="roll-pip${set[i] ? " is-filled" : ""}${isSpinSlot ? " is-rolling" : ""}">${set[i] || (isSpinSlot ? "⟳" : "·")}</span>`;
      }).join("");
      return `<div class="dock-hud is-armed" data-dock-target="${ab}">
          <span class="dock-title">🎯 Rolling for <strong>${ab}</strong> · ${set.length}/4 dice</span>
          <span class="roll-pips">${pips}</span>
          <span class="dock-cta">${spinningD6 ? "Rolling d6…" : "— Click d6!"}</span>
        </div>`;
    }
    const recent = state.dice.history.slice(0, 6);
    return `<div class="dock-hud">
        <span class="dock-title">🎲 Free Roll Mode</span>
        <span class="pill-row dock-history">${recent.length
          ? recent.map((h) => `<span class="pill ${h.val === h.sides ? "synergy" : h.val === 1 ? "warn" : ""}">d${h.sides} → <strong>${h.val}</strong></span>`).join("")
          : `<span class="rp-note">Click any die to roll.</span>`}</span>
        <button id="btn-clear-dice" class="rp-btn" type="button">Clear</button>
      </div>`;
  }

  function renderDiceTab() {
    if (!el.tabDice) return;
    const armed = Boolean(state.builderOpen && state.statMode === "rolled" && state.activeRollSlot);
    el.tabDice.innerHTML = `
      <div class="dock-bar">
        ${diceDockHud()}
        <div class="dock-dice">
          ${DICE_LIST.map((sides) => {
            const v = state.dice.values[sides];
            const cls = `die-card${state.dice.rollingDie === sides ? " rolling" : ""}${armed && sides === 6 ? " is-target-die" : ""}`;
            return `
            <button class="${cls}" type="button" data-roll-die="${sides}" title="${esc(DICE_META[sides] || "")}" aria-label="Roll d${sides}">
              ${renderDie3D(sides, v)}
              <span class="die-label">d${sides}${v && state.dice.landed[sides] ? ` · ${v}` : ""}</span>
            </button>`;
          }).join("")}
        </div>
      </div>`;
    paintCanvasDice();
  }

  function renderAppendixTab() {
    if (!el.tabAppendix) return;
    const data = APPENDIX_DATA || {};
    const abilityStats = arr(data.abilityStats);
    const mechanicsTerms = arr(data.mechanicsTerms);
    const diceTerms = arr(data.diceAndCombatTerms).length ? arr(data.diceAndCombatTerms) : FALLBACK_DICE_TERMS;
    el.tabAppendix.innerHTML = `
      <div class="panel-grid">
        <article class="card">
          <div class="card-head"><h3>Six Core Ability Scores</h3><span class="badge">Stats</span></div>
          <ul class="list-clean">${abilityStats.map(([k, v]) => `<li><strong>${k}</strong>${v}</li>`).join("")}</ul>
        </article>
        <article class="card">
          <div class="card-head"><h3>D&amp;D 5e Abbreviations &amp; Terms</h3><span class="badge">Glossary</span></div>
          <ul class="list-clean">${mechanicsTerms.map(([k, v]) => `<li><strong>${k}</strong>${v}</li>`).join("")}</ul>
        </article>
        <article class="card full" data-dice-terms>
          <div class="card-head"><h3>Dice, Rolls &amp; Table Terms</h3><span class="badge">${diceTerms.length} Terms</span></div>
          <ul class="list-clean">${diceTerms.map(([k, v]) => `<li><strong>${esc(k)}</strong>${annotateStats(v || "")}</li>`).join("")}</ul>
        </article>
        <article class="card full" data-coinage-terms>
          <div class="card-head"><h3>Coinage &amp; Wealth · PHB p. 143</h3><span class="badge">${COIN_RATE_LINE}</span></div>
          <ul class="list-clean">${coinageRows(data).map(([k, v]) => `<li><strong>${esc(k)}</strong>${esc(v || "")}</li>`).join("")}</ul>
        </article>
      </div>`;
  }


  function renderRpBox(key, title, items, slot) {
    const active = items[slot.idx];
    return `
      <section class="rp-box">
        <div class="rp-box-head">
          <h3>${title}</h3>
          <div class="rp-actions">
            <button class="rp-btn" type="button" data-rp-lock="${key}" aria-pressed="${slot.locked}">${slot.locked ? "Locked" : "Lock"}</button>
            <button class="rp-btn" type="button" data-rp-roll="${key}">Reroll</button>
          </div>
        </div>
        <div class="rp-selected"><span class="rp-tag">${esc(active.tag)}</span><div>${esc(active.text)}</div></div>
        <div class="rp-options">
          ${items.map((item, i) => `<button class="rp-choice ${i === slot.idx ? "active" : ""}" type="button" data-rp-pick="${key}" data-idx="${i}">${esc(item.text)}</button>`).join("")}
        </div>
      </section>`;
  }

  // Roll engine shared by the sheet, actions table, playbook and rests.

  function weaponLines(p) {
    const { cl, mods, pb } = p;
    const dc = dcStat(cl, p.sc);
    const cd = (p.prog && p.prog.cantripDice) || 1;
    return arr(cl.signatureWeapons).map((w) => {
      const isCantrip = /^cantrip\b/i.test(w.notes || "");
      const d = parseDice(w.dice) || { count: 1, sides: 6 };
      const st = isCantrip ? dc : w.stat === "FINESSE" ? (mods.DEX >= mods.STR ? "DEX" : "STR") : (w.stat in mods ? w.stat : p.atkStat);
      return {
        name: w.name, isCantrip, stat: st, toHit: pb + mods[st], count: isCantrip ? d.count * cd : d.count, sides: d.sides,
        bonus: isCantrip ? 0 : mods[st], type: w.type || "", notes: w.notes || ""
      };
    });
  }

  function critSpecFor(p, w) {
    if (!w) return null;
    const extra = w.isCantrip ? 0 : ((p.prog && p.prog.brutalCritDice) || 0) + (p.sp && p.sp.id === "half-orc" ? 1 : 0);
    return { label: `${w.name} Crit`, count: w.count * 2 + extra, sides: w.sides, bonus: w.bonus };
  }

  function defaultCritSpec() {
    const p = currentProfile();
    const lines = weaponLines(p);
    return critSpecFor(p, lines.find((w) => !w.isCantrip) || lines[0]);
  }

  function buildRollEntry(spec) {
    if (!spec || typeof spec !== "object") return null;
    const sides = clamp(Math.round(Number(spec.sides)) || 20, 2, 100);
    const baseCount = clamp(Math.round(Number(spec.count)) || 1, 1, 60);
    const doubled = spec.dmg && state.critToggle;
    const count = doubled ? baseCount * 2 : baseCount;
    const bonus = Math.round(Number(spec.bonus)) || 0;
    const dice = [];
    for (let i = 0; i < count; i += 1) dice.push(rollUniform(sides));
    const nat = sides === 20 && count === 1 ? dice[0] : null;
    return {
      label: `${String(spec.label || `d${sides}`).slice(0, 48)}${doubled ? " · Crit 2x" : ""}`,
      sides, count, bonus, dice,
      total: dice.reduce((s, v) => s + v, 0) + bonus,
      nat20: nat === 20,
      nat1: nat === 1,
      critSpec: nat === 20 && spec.crit ? (spec.critDmg || defaultCritSpec()) : null
    };
  }

  function rollSpec(spec) {
    const entry = buildRollEntry(spec);
    if (!entry) return null;
    state.rollLog = [entry, ...state.rollLog].slice(0, 8);
    renderRollTray();
    return entry;
  }

  let trayRollAnim = null;

  function renderRollTray() {
    if (!el.rollTray) return;
    if (!state.rollLog.length && !trayRollAnim) {
      el.rollTray.innerHTML = "";
      el.rollTray.classList.remove("show");
      return;
    }
    el.rollTray.classList.add("show");
    const pendingHtml = trayRollAnim ? `
      <div class="roll-entry is-rolling latest" data-tray-rolling>
        <div class="tray-spin-row">
          <canvas width="96" height="96" class="tray-die-canvas" data-tray-canvas></canvas>
          <div class="tray-spin-meta">
            <span class="roll-label">${esc(trayRollAnim.label)}</span>
            <span class="roll-break">Rolling ${trayRollAnim.formula}…</span>
          </div>
        </div>
      </div>` : "";
    el.rollTray.innerHTML = `
      <div class="roll-tray-head"><strong>🎲 Roll Log</strong><button type="button" class="rp-btn" data-roll-clear>Clear</button></div>
      ${pendingHtml}
      ${state.rollLog.map((r, i) => `
        <div class="roll-entry${r.nat20 ? " nat20" : r.nat1 ? " nat1" : ""}${!trayRollAnim && i === 0 ? " latest" : ""}">
          <div class="roll-entry-top"><span class="roll-label">${esc(r.label)}</span><span class="roll-total">${r.total}</span></div>
          <span class="roll-break">${r.count}d${r.sides} [${r.dice.join(", ")}]${r.bonus ? ` ${signed(r.bonus)}` : ""}${r.nat20 ? " · NAT 20!" : r.nat1 ? " · Nat 1" : ""}</span>
          ${r.critSpec ? rollBtnHtml(r.critSpec, "💥 Roll Crit Damage!", "crit-btn") : ""}
        </div>`).join("")}`;
  }

  function animateRollSpecs(specs) {
    const list = (Array.isArray(specs) ? specs : [specs]).map(buildRollEntry).filter(Boolean);
    if (!list.length) return;
    if (trayRollAnim && typeof trayRollAnim.commit === "function") trayRollAnim.commit();

    const primary = list[0];
    const polySides = [4, 8, 10, 12, 20].includes(primary.sides) ? primary.sides : (primary.sides === 6 ? 8 : 20);
    const cycles = 2 + Math.floor(Math.random() * 2);
    const dur = Math.round(620 + cycles * 220 + Math.random() * 90);
    const TAU = Math.PI * 2;
    const meshOk = Boolean(window.DICE_3D && window.DICE_3D.MESHES && window.DICE_3D.MESHES[polySides]);
    const landVal = clamp(primary.dice[0], 1, polySides);
    const land = (meshOk && window.DICE_3D.getLandingPose(polySides, landVal)) || { rx: 0.4, ry: 0.5, rz: 0.1 };
    const startPose = { rx: Math.random() * TAU, ry: Math.random() * TAU, rz: Math.random() * TAU };
    const endRx = exactSpinTarget(startPose.rx, land.rx, TAU, cycles);
    const endRy = exactSpinTarget(startPose.ry, land.ry, TAU, cycles + (Math.random() < 0.5 ? 0 : 1));
    const endRz = exactSpinTarget(startPose.rz, land.rz, TAU, Math.max(1, cycles - 1));
    const t0 = performance.now();
    let done = false;

    const commit = () => {
      if (done) return;
      done = true;
      trayRollAnim = null;
      for (let i = list.length - 1; i >= 0; i -= 1) {
        state.rollLog = [list[i], ...state.rollLog].slice(0, 8);
      }
      renderRollTray();
    };

    trayRollAnim = {
      label: list.map((e) => e.label).join(" + "),
      formula: list.map((e) => `${e.count}d${e.sides}${e.bonus ? ` ${signed(e.bonus)}` : ""}`).join(", "),
      commit
    };
    renderRollTray();

    function stepTray(now) {
      if (done) return;
      const p = Math.min(1, (now - t0) / dur);
      const ease = naturalDieEase(p);
      const canvas = el.rollTray && el.rollTray.querySelector("[data-tray-canvas]");
      if (canvas) {
        const rx = startPose.rx + (endRx - startPose.rx) * ease;
        const ry = startPose.ry + (endRy - startPose.ry) * ease;
        const rz = startPose.rz + (endRz - startPose.rz) * ease;
        if (meshOk && primary.sides !== 6) {
          window.DICE_3D.drawPoly(canvas, polySides, rx, ry, rz, null, false);
        } else {
          const shownFace = 1 + (Math.floor(ease * cycles * primary.sides) % primary.sides);
          draw2DDie(canvas, primary.sides, shownFace, false, rz);
        }
      }
      if (p < 1) requestAnimationFrame(stepTray);
      else commit();
    }
    requestAnimationFrame(stepTray);
  }

  document.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const btn = t.closest("[data-roll-spec]");
    if (btn) {
      try {
        const spec = JSON.parse(btn.dataset.rollSpec);
        animateRollSpecs(spec);
      } catch (err) {
        showToast("Roll spec unreadable");
      }
      return;
    }
    if (t.closest("[data-roll-clear]")) {
      if (trayRollAnim) { trayRollAnim = null; }
      state.rollLog = [];
      renderRollTray();
    }
  });

  // Character sheet builder helpers. Every field is explicit user input; nothing is prefilled.
  function activeBackground() {
    if (!state.bgId) return null;
    return BACKGROUNDS.find((b) => b.id === state.bgId) || null;
  }

  function classPool(cl) {
    const pool = arr(cl.skillPool).filter((s) => SKILL_NAMES.includes(s));
    return pool.length ? pool : SKILL_NAMES.slice();
  }

  function speciesFreeCap(sp, sr) {
    if (sp && sp.id === "half-elf") return 2;
    if (sp && sp.id === "human" && sr && sr.id === "variant") return 1;
    return 0;
  }

  function skillSheet(p) {
    const { sp, sr, cl, mods, pb } = p;
    const known = p.known || {};
    const eff = window.FORGE_SYNERGY && typeof window.FORGE_SYNERGY.effectiveSkills === "function"
      ? window.FORGE_SYNERGY.effectiveSkills(sp, sr) : arr(sp.skills);
    const spSkills = arr(eff).filter((s) => SKILL_NAMES.includes(s));
    const bg = activeBackground();
    const bgSkills = bg ? arr(bg.skills).filter((s) => SKILL_NAMES.includes(s) && !spSkills.includes(s)) : [];
    const freeCap = speciesFreeCap(sp, sr);
    const free = [...new Set(arr(state.pickedSpeciesSkills))].filter((s) => SKILL_NAMES.includes(s) && !spSkills.includes(s) && !bgSkills.includes(s)).slice(0, freeCap);
    const pool = classPool(cl);
    const cap = Number(cl.skillCount) || 2;
    const picks = [...new Set(arr(state.pickedClassSkills))].filter((s) => pool.includes(s) && !spSkills.includes(s) && !bgSkills.includes(s) && !free.includes(s)).slice(0, cap);
    const rows = SKILLS_ALL.map((s) => {
      const src = spSkills.includes(s.name) ? "Species" : free.includes(s.name) ? "Species Pick" : bgSkills.includes(s.name) ? "Background" : picks.includes(s.name) ? "Class" : "";
      const statKnown = known[s.stat] !== false;
      const bonus = statKnown ? mods[s.stat] + (src ? pb : 0) : null;
      const locked = spSkills.includes(s.name) || bgSkills.includes(s.name);
      return {
        name: s.name, stat: s.stat, src, prof: Boolean(src), bonus,
        pickable: !locked && !free.includes(s.name) && pool.includes(s.name),
        freePickable: !locked && !picks.includes(s.name)
      };
    });
    return { rows, picks, cap, bg, pool, free, freeCap, spSkills, bgSkills };
  }

  // Starting equipment choice groups; a single-option group is fixed gear.
  const FALLBACK_EQUIPMENT = {
    barbarian: [["Greataxe", "Any Martial Melee Weapon"], ["Two Handaxes", "Any Simple Weapon"], ["Explorer's Pack + 4 Javelins"]],
    bard: [["Rapier", "Longsword", "Any Simple Weapon"], ["Diplomat's Pack", "Entertainer's Pack"], ["Lute", "Any Musical Instrument"], ["Leather Armor + Dagger"]],
    cleric: [["Mace", "Warhammer"], ["Scale Mail", "Leather Armor", "Chain Mail"], ["Light Crossbow + 20 Bolts", "Any Simple Weapon"], ["Priest's Pack", "Explorer's Pack"], ["Shield + Holy Symbol"]],
    druid: [["Wooden Shield", "Any Simple Weapon"], ["Scimitar", "Any Simple Melee Weapon"], ["Leather Armor, Explorer's Pack, Druidic Focus"]],
    fighter: [["Chain Mail", "Leather Armor + Longbow + 20 Arrows"], ["Martial Weapon + Shield", "Two Martial Weapons"], ["Light Crossbow + 20 Bolts", "Two Handaxes"], ["Dungeoneer's Pack", "Explorer's Pack"]],
    monk: [["Shortsword", "Any Simple Weapon"], ["Dungeoneer's Pack", "Explorer's Pack"], ["10 Darts"]],
    paladin: [["Martial Weapon + Shield", "Two Martial Weapons"], ["Five Javelins", "Any Simple Melee Weapon"], ["Priest's Pack", "Explorer's Pack"], ["Chain Mail + Holy Symbol"]],
    ranger: [["Scale Mail", "Leather Armor"], ["Two Shortswords", "Two Simple Melee Weapons"], ["Dungeoneer's Pack", "Explorer's Pack"], ["Longbow + 20 Arrows"]],
    rogue: [["Rapier", "Shortsword"], ["Shortbow + 20 Arrows", "Shortsword"], ["Burglar's Pack", "Dungeoneer's Pack", "Explorer's Pack"], ["Leather Armor, Two Daggers, Thieves' Tools"]],
    sorcerer: [["Light Crossbow + 20 Bolts", "Any Simple Weapon"], ["Component Pouch", "Arcane Focus"], ["Dungeoneer's Pack", "Explorer's Pack"], ["Two Daggers"]],
    warlock: [["Light Crossbow + 20 Bolts", "Any Simple Weapon"], ["Component Pouch", "Arcane Focus"], ["Scholar's Pack", "Dungeoneer's Pack"], ["Leather Armor, Any Simple Weapon, Two Daggers"]],
    wizard: [["Quarterstaff", "Dagger"], ["Component Pouch", "Arcane Focus"], ["Scholar's Pack", "Explorer's Pack"], ["Spellbook"]]
  };

  function equipGroups(cl) {
    const table = FD.STARTING_EQUIPMENT_CHOICES && typeof FD.STARTING_EQUIPMENT_CHOICES === "object" ? FD.STARTING_EQUIPMENT_CHOICES : null;
    const raw = (table && arr(table[cl.id]).length ? table[cl.id] : FALLBACK_EQUIPMENT[cl.id]) || [];
    let choiceN = 0;
    return arr(raw).map((g) => {
      const options = (Array.isArray(g) ? g : arr(g && g.options)).map((o) => (typeof o === "string" ? o : String((o && (o.label || o.name)) || ""))).filter(Boolean);
      const fixed = options.length === 1;
      if (!fixed) choiceN += 1;
      const label = g && !Array.isArray(g) && g.label ? String(g.label) : fixed ? "Fixed Gear" : `Choice ${choiceN}`;
      return { label, options, fixed };
    }).filter((g) => g.options.length);
  }

  function equipState(cl) {
    const groups = equipGroups(cl);
    const parts = String(state.equipChoice || "").split(",");
    const picks = groups.map((g, i) => {
      if (g.fixed) return 0;
      const n = parts[i] === "" || parts[i] === undefined ? NaN : Number(parts[i]);
      return Number.isInteger(n) && n >= 0 && n < g.options.length ? n : null;
    });
    const done = groups.every((g, i) => picks[i] !== null);
    const items = groups.map((g, i) => (picks[i] === null ? "" : g.options[picks[i]])).filter(Boolean);
    String(state.customGear || "").split(/\n|;/).map((s) => s.trim()).filter(Boolean).forEach((s) => items.push(s));
    return { groups, picks, done, items };
  }

  function setEquipPick(cl, idx, val) {
    const groups = equipGroups(cl);
    const parts = String(state.equipChoice || "").split(",");
    const out = groups.map((g, i) => (parts[i] === undefined ? "" : parts[i]));
    if (idx >= 0 && idx < out.length) out[idx] = val === "" || val === null ? "" : String(val);
    state.equipChoice = out.join(",");
  }

  const FULL_SLOTS = [[2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]];

  function spellSlots(cl, lvl) {
    const L = clamp(Number(lvl) || 1, 1, 20);
    const id = cl && cl.id;
    if (["bard", "cleric", "druid", "sorcerer", "wizard"].includes(id)) return FULL_SLOTS[L - 1].map((count, i) => ({ level: i + 1, count }));
    if (["paladin", "ranger"].includes(id)) return L >= 2 ? FULL_SLOTS[Math.ceil(L / 2) - 1].map((count, i) => ({ level: i + 1, count })) : [];
    if (id === "warlock") return [{ level: Math.min(5, Math.ceil(L / 2)), count: L >= 17 ? 4 : L >= 11 ? 3 : L >= 2 ? 2 : 1 }];
    return [];
  }

  const RP_KEYS = ["trait", "ideal", "bond", "flaw"];
  const RP_LABELS = { trait: "Personality Trait", ideal: "Ideal", bond: "Bond", flaw: "Flaw" };
  const BUILDER_STEPS = [
    { n: 1, title: "Identity, Background & Appearance" },
    { n: 2, title: "Ability Scores" },
    { n: 3, title: "Skills & Starting Equipment" },
    { n: 4, title: "Personality, Ideal, Bond & Flaw" },
    { n: 5, title: "Review & Export" }
  ];

  function builderStatus(p) {
    const prof = p || sheetProfile();
    const ss = skillSheet(prof);
    const rule = flexRule(prof.sp, prof.sr);
    const flexOk = !rule || validFlexPicks(prof.sp, prof.sr).length === rule.count;
    const eq = equipState(prof.cl);
    const items = [
      { key: "name", step: 1, label: "Character Name", done: String(state.charName || "").trim().length > 0 },
      { key: "background", step: 1, label: "Background", done: Boolean(ss.bg) },
      { key: "abilities", step: 2, label: "Ability Scores", done: scoresComplete() && flexOk },
      { key: "skills", step: 3, label: ss.picks.length < ss.cap ? `Class Skills ${ss.picks.length} / ${ss.cap}` : `Species Skills ${ss.free.length} / ${ss.freeCap}`, done: ss.picks.length >= ss.cap && ss.free.length >= ss.freeCap },
      { key: "equipment", step: 3, label: "Starting Equipment", done: eq.done }
    ];
    const rpDone = RP_KEYS.every((k) => String(state.rpCustom[k] || "").trim().length > 0);
    const stepDone = (n) => items.filter((it) => it.step === n).every((it) => it.done);
    const steps = BUILDER_STEPS.map((s) => ({ ...s, done: s.n === 4 ? rpDone : s.n === 5 ? false : stepDone(s.n) }));
    steps[4].done = steps.slice(0, 4).every((s) => s.done);
    const missing = items.filter((it) => !it.done);
    return { items, missing, steps, doneCount: steps.filter((s) => s.done).length, complete: missing.length === 0, rpDone };
  }

  function pointBuySpent(m) {
    return ABILITIES.reduce((s, ab) => s + (POINT_COST[m[ab]] || 0), 0);
  }

  function roll4d6() {
    const dice = [rollUniform(6), rollUniform(6), rollUniform(6), rollUniform(6)];
    return Object.assign({ dice }, scoreRollSet(dice));
  }

  // Auto-Roll All 6 fills every ability slot in order with a fresh 4d6 drop lowest set.
  function rerollAll() {
    const br = ABILITIES.map(() => roll4d6());
    state.statMode = "rolled";
    state.rolledBreakdown = br;
    state.abilityRolls = blankRollMap();
    ABILITIES.forEach((ab, i) => { state.abilityRolls[ab] = br[i].dice.slice(); });
    state.activeRollSlot = null;
    state.swapFrom = null;
    syncRolledScores();
  }

  function swapRolled(a, b) {
    if (!state.assignedScores || a === b) return;
    if (state.statMode === "rolled") {
      const r = state.abilityRolls;
      [r[a], r[b]] = [r[b], r[a]];
      syncRolledScores();
      return;
    }
    const s = state.assignedScores;
    [s[a], s[b]] = [s[b], s[a]];
  }

  // Arms one ability so the next physical d6 clicks in the dock feed its 4d6 set.
  function armRollSlot(ab) {
    if (!ABILITY_KEYS.includes(ab)) return;
    state.swapFrom = null;
    state.activeRollSlot = state.abilityRolls[ab].length < 4 ? ab : null;
  }

  function clearRollSlot(ab) {
    if (!ABILITY_KEYS.includes(ab)) return;
    state.abilityRolls[ab] = [];
    state.swapFrom = null;
    state.activeRollSlot = ab;
    syncRolledScores();
  }

  // Two-click swap: first click marks a completed slot, second click exchanges the dice sets.
  function pickSwapSlot(ab) {
    if (!ABILITY_KEYS.includes(ab)) return;
    if (!state.swapFrom) { state.swapFrom = ab; return; }
    const from = state.swapFrom;
    state.swapFrom = null;
    if (from !== ab) swapRolled(from, ab);
  }

  // Routes a landed d6 into the armed slot; returns true when the builder consumed it.
  function feedRollSlot(val) {
    const ab = state.activeRollSlot;
    if (!state.builderOpen || state.statMode !== "rolled" || !ab) return false;
    const set = state.abilityRolls[ab];
    if (set.length >= 4) { state.activeRollSlot = nextOpenSlot(ab); return false; }
    set.push(val);
    if (set.length === 4) {
      syncRolledScores();
      state.activeRollSlot = nextOpenSlot(ab);
    }
    return true;
  }

  function activePool() {
    if (state.statMode === "standard") return STANDARD_ARRAY.slice();
    if (state.statMode === "rolled" && Array.isArray(state.statPool)) return state.statPool.slice();
    return [];
  }

  // Values still free for an ability given the multiset pool and the other assignments.
  function availableFor(ab) {
    const pool = activePool();
    ABILITIES.forEach((other) => {
      if (other === ab) return;
      const v = state.assignedScores[other];
      const i = pool.indexOf(v);
      if (Number.isInteger(v) && i >= 0) pool.splice(i, 1);
    });
    return pool;
  }

  function autoAssign() {
    const b = currentBuild();
    const order = abilityOrder(b.cl, b.sc);
    if (state.statMode === "rolled") {
      const sets = ABILITY_KEYS.map((ab) => state.abilityRolls[ab]).filter((s) => scoreRollSet(s));
      if (sets.length !== 6) return false;
      sets.sort((x, y) => scoreRollSet(y).total - scoreRollSet(x).total);
      const next = blankRollMap();
      const full = [...new Set([...order, ...ABILITY_KEYS])];
      full.slice(0, 6).forEach((ab, i) => { next[ab] = sets[i].slice(); });
      state.abilityRolls = next;
      state.swapFrom = null;
      syncRolledScores();
      return true;
    }
    const pool = activePool().sort((x, y) => y - x);
    if (pool.length !== 6) return false;
    state.assignedScores = blankScoreMap(null);
    order.slice(0, 6).forEach((ab, i) => { state.assignedScores[ab] = pool[i]; });
    return true;
  }

  const fmtKnown = (ok, v) => (ok && Number.isFinite(v) ? signed(v) : "—");
  const scoreTxt = (ok, v) => (ok && Number.isFinite(v) ? String(v) : "—");

  function stepCard(st, n, body) {
    const s = st.steps[n - 1];
    return `
      <article class="card builder-step${s.done ? " is-done" : ""}" data-step="${n}" id="builder-step-${n}">
        <div class="card-head"><h3><span class="step-num">${s.done ? "✓" : n}</span> ${esc(s.title)}</h3><span class="badge step-state">${s.done ? "Complete" : "In Progress"}</span></div>
        ${body}
      </article>`;
  }

  const fieldHtml = (label, path, val, attrs) => `<label class="field"><span>${label}</span><input type="text" data-bind="${path}" value="${esc(val || "")}" ${attrs || ""} /></label>`;

  function stepIdentityHtml(p, ss) {
    const bg = ss.bg;
    return `
      <div class="field-row">
        ${fieldHtml("Character Name", "charName", state.charName, `id="sheet-name" maxlength="60" placeholder="Enter a name" autocomplete="off"`)}
        <button type="button" class="btn btn-secondary" data-sheet-name-roll>🎲 Suggest Name</button>
      </div>
      <div class="field-row">
        <label class="field"><span>Background</span><select id="sheet-bg" data-bg-select><option value=""${bg ? "" : " selected"}>— Choose Background —</option>${BACKGROUNDS.map((b) => `<option value="${esc(b.id)}"${bg && b.id === bg.id ? " selected" : ""}>${esc(b.name)}</option>`).join("")}</select></label>
        <label class="field"><span>Alignment</span><select id="sheet-align" data-align-select><option value=""${state.alignment ? "" : " selected"}>— Choose Alignment —</option>${ALIGNMENTS.map((a) => `<option value="${esc(a)}"${a === state.alignment ? " selected" : ""}>${esc(a)}</option>`).join("")}</select></label>
      </div>
      ${bg ? `<p class="rp-note bg-note"><strong>${esc(bg.name)}:</strong> ${esc(arr(bg.skills).join(" & "))}${bg.feature ? ` · Feature: ${esc(bg.feature)}` : ""}${bg.tools ? ` · Tools: ${esc(bg.tools)}` : ""}</p>` : `<p class="rp-note">Pick a background to unlock its two skill proficiencies and feature.</p>`}
      <div class="appearance-grid">
        ${["age", "height", "weight", "eyes", "skin", "hair"].map((k) => fieldHtml(k.charAt(0).toUpperCase() + k.slice(1), `appearance.${k}`, state.appearance[k], `maxlength="40"`)).join("")}
      </div>`;
  }

  function stepAbilitiesHtml(p) {
    const mode = state.statMode;
    const modeBtn = (id, text) => `<button type="button" class="mode-btn${mode === id ? " active" : ""}" data-stat-mode="${id}" aria-pressed="${mode === id}">${text}</button>`;
    const pbLeft = POINT_BUDGET - pointBuySpent(state.pointBuyScores);
    const pool = activePool();
    const used = ABILITIES.map((ab) => state.assignedScores[ab]).filter(Number.isInteger);
    const chips = (() => {
      const left = used.slice();
      return pool.map((v) => {
        const i = left.indexOf(v);
        const taken = i >= 0;
        if (taken) left.splice(i, 1);
        return `<span class="pool-chip${taken ? " is-used" : ""}">${v}</span>`;
      }).join("");
    })();
    const rule = flexRule(p.sp, p.sr);
    const flex = validFlexPicks(p.sp, p.sr);
    let body = "";
    if (!mode) {
      body = `<p class="rp-note">Choose how to generate your six ability scores. Nothing is assigned until you place each value.</p>`;
    } else if (mode === "pointbuy") {
      body = `
        <p class="badge pb-left" data-mode-badge>${pbLeft} / ${POINT_BUDGET} pts left</p>
        <div class="assign-grid">${ABILITIES.map((ab) => `
          <div class="assign-row" data-ability-tile="${ab}">
            <span class="assign-label">${statTerm(ab)} <small>${ab}</small></span>
            <div class="pb-ctl"><button type="button" class="mini-btn" data-pb-adj="${ab}" data-delta="-1" aria-label="Lower ${ab}"${state.pointBuyScores[ab] <= 8 ? " disabled" : ""}>−</button><strong>${state.pointBuyScores[ab]}</strong><button type="button" class="mini-btn" data-pb-adj="${ab}" data-delta="1" aria-label="Raise ${ab}"${state.pointBuyScores[ab] >= 15 || (POINT_COST[state.pointBuyScores[ab] + 1] - POINT_COST[state.pointBuyScores[ab]]) > pbLeft ? " disabled" : ""}>+</button></div>
            <span class="assign-final">→ <strong data-final="${ab}">${p.scores[ab]}</strong> ${signed(p.mods[ab])}</span>
          </div>`).join("")}</div>`;
    } else if (mode === "rolled") {
      const armed = state.activeRollSlot;
      const doneCount = ABILITIES.filter((ab) => state.abilityRolls[ab].length === 4).length;
      body = `
        <p class="rp-note roll-guide">${armed ? `Click the glowing <strong>d6</strong> in the dice dock below four times to roll <strong>${statTerm(armed)}</strong>. The lowest die drops automatically.` : doneCount === 6 ? "All six sets rolled. Use ⇄ on two rows to swap them, or Auto-Assign by class priority." : "Click any row to arm it, then roll the d6 in the dice dock below."}</p>
        <div class="roll-slots">${ABILITIES.map((ab) => {
          const set = state.abilityRolls[ab];
          const res = scoreRollSet(set);
          const known = Boolean(res);
          const cls = `roll-slot${armed === ab ? " is-armed" : ""}${known ? " is-complete" : ""}${state.swapFrom === ab ? " is-swap-src" : ""}`;
          const spinningHere = armed === ab && state.dice.rollingDie === 6;
          const pips = [0, 1, 2, 3].map((i) => {
            const d = set[i];
            const isSpin = spinningHere && i === set.length;
            const pc = `roll-pip${d ? " is-filled" : ""}${isSpin ? " is-rolling" : ""}${known && i === res.droppedIdx ? " is-dropped" : ""}`;
            return `<span class="${pc}">${d || (isSpin ? "⟳" : "·")}</span>`;
          }).join("");
          return `
          <div class="${cls}" data-roll-slot="${ab}" data-ability-tile="${ab}" role="button" tabindex="0" aria-label="Roll ${ab}">
            <span class="assign-label">${statTerm(ab)} <small>${ab}</small></span>
            <span class="roll-pips">${pips}</span>
            <span class="roll-base" data-base="${ab}">${known ? res.total : `${set.length}/4`}</span>
            <span class="assign-final">→ <strong data-final="${ab}">${known ? p.scores[ab] : "—"}</strong> ${known ? signed(p.mods[ab]) : ""}</span>
            <span class="roll-actions">
              <button type="button" class="mini-btn" data-clear-slot="${ab}" aria-label="Clear ${ab} roll" title="Clear and re-roll">↺</button>
              <button type="button" class="mini-btn${state.swapFrom === ab ? " active" : ""}" data-swap-slot="${ab}" aria-label="Swap ${ab}" title="Swap with another row"${known ? "" : " disabled"}>⇄</button>
            </span>
          </div>`;
        }).join("")}</div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" data-reroll-all>⚡ Auto-Roll All 6</button>
          <button type="button" class="btn btn-secondary" data-auto-assign${doneCount === 6 ? "" : " disabled"}>Auto-Assign by Class Priority</button>
          <button type="button" class="btn btn-secondary" data-clear-assign>Clear</button>
        </div>`;
    } else {
      body = `
        <div class="pool-row"><span class="vital-label">Value Pool</span>${chips}</div>
        <div class="assign-grid">${ABILITIES.map((ab) => {
          const cur = state.assignedScores[ab];
          const opts = [...new Set(availableFor(ab))].sort((x, y) => y - x);
          const known = Number.isInteger(cur);
          return `
          <div class="assign-row" data-ability-tile="${ab}">
            <span class="assign-label">${statTerm(ab)} <small>${ab}</small></span>
            <select data-assign="${ab}" aria-label="Assign ${ab}"><option value=""${known ? "" : " selected"}>—</option>${opts.map((v) => `<option value="${v}"${v === cur ? " selected" : ""}>${v}</option>`).join("")}</select>
            <span class="assign-final">→ <strong data-final="${ab}">${known ? p.scores[ab] : "—"}</strong> ${known ? signed(p.mods[ab]) : ""}</span>
          </div>`;
        }).join("")}</div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" data-auto-assign>Auto-Assign by Class Priority</button>
          <button type="button" class="btn btn-secondary" data-clear-assign>Clear</button>
        </div>`;
    }
    const flexHtml = rule ? `
      <div class="flex-asi">
        <span class="vital-label">${esc(p.sr ? p.sr.name : p.sp.name)} · ${esc(rule.label)} · ${flex.length} / ${rule.count}</span>
        <div class="check-grid">${ABILITIES.map((ab) => {
          const on = flex.includes(ab);
          const dis = rule.exclude.includes(ab) || (!on && flex.length >= rule.count);
          return `<label class="check-chip${on ? " on" : ""}${dis ? " is-disabled" : ""}"><input type="checkbox" data-flex="${ab}"${on ? " checked" : ""}${dis ? " disabled" : ""} />${ab}</label>`;
        }).join("")}</div>
      </div>` : "";
    return `
      <div class="btn-row">${modeBtn("standard", "Standard Array")}${modeBtn("rolled", "🎲 Roll 4d6 Drop Lowest")}${modeBtn("pointbuy", "27-Point Buy")}</div>
      ${body}
      ${flexHtml}`;
  }

  function stepSkillsEquipHtml(p, ss) {
    const eq = equipState(p.cl);
    const classChecks = ss.pool.map((name) => {
      const row = ss.rows.find((r) => r.name === name);
      const on = ss.picks.includes(name);
      const lockedSrc = row && row.src && row.src !== "Class" ? row.src : "";
      const dis = Boolean(lockedSrc);
      return `<label class="check-chip${on ? " on" : ""}${dis ? " is-disabled" : ""}"><input type="checkbox" data-class-skill="${esc(name)}"${on ? " checked" : ""}${dis ? " disabled" : ""} />${esc(name)}${lockedSrc ? ` <small>${esc(lockedSrc)}</small>` : ""}</label>`;
    }).join("");
    const freeChecks = ss.freeCap ? `
      <span class="vital-label">${esc(p.sr ? p.sr.name : p.sp.name)} Skill Versatility · ${ss.free.length} / ${ss.freeCap}</span>
      <div class="check-grid">${ss.rows.filter((r) => r.freePickable || ss.free.includes(r.name)).map((r) => {
        const on = ss.free.includes(r.name);
        return `<label class="check-chip${on ? " on" : ""}"><input type="checkbox" data-species-skill="${esc(r.name)}"${on ? " checked" : ""} />${esc(r.name)}</label>`;
      }).join("")}</div>` : "";
    const groups = eq.groups.map((g, i) => (g.fixed
      ? `<div class="equip-row fixed"><span class="vital-label">${esc(g.label)}</span><span>${esc(g.options[0])}</span></div>`
      : `<label class="field equip-row"><span>${esc(g.label)}</span><select data-equip-group="${i}"><option value=""${eq.picks[i] === null ? " selected" : ""}>— Choose —</option>${g.options.map((o, j) => `<option value="${j}"${eq.picks[i] === j ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`)).join("");
    return `
      <span class="vital-label">${esc(p.cl.name)} Skills · choose ${ss.cap} · ${ss.picks.length} / ${ss.cap}</span>
      <div class="check-grid">${classChecks}</div>
      ${freeChecks}
      <h4 class="builder-sub">Starting Equipment</h4>
      <div class="equip-grid">${groups}</div>
      <label class="field"><span>Additional Gear · one per line</span><textarea data-bind="customGear" rows="2" maxlength="600">${esc(state.customGear)}</textarea></label>
      <h4 class="builder-sub">Coinage <small class="coin-rate-sub">${COIN_RATE_LINE} · 50 coins = 1 lb</small></h4>
      <p class="rp-note coin-phb-note">PHB p. 143: 1 CP buys a candle, 1 SP is a laborer's daily wage, 1 GP is a skilled artisan's daily wage.<br />Electrum and platinum come from fallen empires and may draw suspicion in humble shops.</p>
      <div class="coin-grid">${COIN_KEYS.map((c) => fieldHtml(coinTermHtml(c), `coins.${c}`, state.coins[c], `inputmode="numeric" maxlength="9" placeholder="0"`)).join("")}</div>`;
  }

  function rpSuggestions(p) {
    const combo = computeCombo(p.sp, p.sr, p.cl, p.sc);
    const m = buildRoleplayMatrix(p.sp, p.sr, p.cl, p.sc, combo);
    const txt = (v) => (typeof v === "string" ? v : v && v.text ? (v.tag ? `${v.tag}: ${v.text}` : v.text) : "");
    return { trait: arr(m.traits).map(txt), ideal: arr(m.ideals).map(txt), bond: arr(m.bonds).map(txt), flaw: arr(m.flaws).map(txt) };
  }

  function stepRoleplayHtml(p) {
    const sug = rpSuggestions(p);
    return `
      ${RP_KEYS.map((k) => `
        <div class="rp-field">
          <label class="field"><span>${RP_LABELS[k]}</span><textarea data-bind="rpCustom.${k}" rows="2" maxlength="1200" placeholder="Write your own or pick a suggestion">${esc(state.rpCustom[k])}</textarea></label>
          <select data-rp-suggest="${k}" aria-label="${RP_LABELS[k]} suggestions"><option value="">Suggestions for this combo…</option>${sug[k].map((t, i) => `<option value="${i}">${esc(t.length > 90 ? `${t.slice(0, 88)}…` : t)}</option>`).join("")}</select>
        </div>`).join("")}
      <label class="field"><span>Backstory &amp; Notes</span><textarea data-bind="rpCustom.notes" rows="3" maxlength="1200">${esc(state.rpCustom.notes)}</textarea></label>`;
  }

  function stepReviewHtml(st) {
    return `
      ${st.missing.length
        ? `<p class="rp-note warn-note">Still missing: ${st.missing.map((m) => `<button type="button" class="missing-chip" data-jump-step="${m.step}">${esc(m.label)}</button>`).join(" ")}</p>`
        : `<p class="rp-note">All required fields are filled. Your 2024 sheet is ready to export.</p>`}
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-export="pdf">📄 Export PDF</button>
        <button type="button" class="btn btn-secondary" data-export="print">🖨 Print Sheet</button>
        <button type="button" class="rp-btn" data-sheet-reset>Reset Sheet</button>
      </div>`;
  }

  function renderBuilderSteps(p, st) {
    if (!el.tabSheet) return;
    const ss = skillSheet(p);
    el.tabSheet.innerHTML = [
      stepCard(st, 1, stepIdentityHtml(p, ss)),
      stepCard(st, 2, stepAbilitiesHtml(p)),
      stepCard(st, 3, stepSkillsEquipHtml(p, ss)),
      stepCard(st, 4, stepRoleplayHtml(p)),
      stepCard(st, 5, stepReviewHtml(st))
    ].join("");
  }

  // Read-only creation sheet preview: grouped abilities, saves, skills, static vitals, and weapons.
  function renderSheetPreview(p) {
    if (!el.builderPreview) return;
    const ss = skillSheet(p);
    const k = p.known || {};
    const allKnown = ABILITIES.every((ab) => k[ab] !== false);
    const eq = equipState(p.cl);
    const hasShield = eq.items.some((t) => /shield/i.test(t));
    const resMax = resourceMax(p.cl, p.prog, p.mods);
    const conOk = k.CON !== false;
    const passive = (name) => { const r = ss.rows.find((x) => x.name === name); return r && r.bonus !== null ? 10 + r.bonus : null; };
    const lines = weaponLines(p);
    const bg = ss.bg;
    const abilityCard = (ab) => {
      const ok = k[ab] !== false;
      const sv = p.saves[ab];
      const skills = ss.rows.filter((r) => r.stat === ab);
      return `
        <div class="ab24" data-ability-card="${ab}">
          <div class="ab24-head"><span class="ab24-name">${statLabel(ab)}</span><span class="ab24-mod">${fmtKnown(ok, p.mods[ab])}</span><span class="ab24-score">${scoreTxt(ok, p.scores[ab])}</span></div>
          <ul class="ab24-list">
            <li class="ab24-save" data-save-row="${ab}"><span class="prof-dot${sv.prof ? " on" : ""}" aria-hidden="true"></span><span>Saving Throw</span><strong>${fmtKnown(ok, sv.mod)}</strong></li>
            ${skills.map((r) => `<li data-skill-row="${esc(r.name)}"><span class="prof-dot${r.prof ? " on" : ""}" aria-hidden="true"></span><span>${esc(r.name)}${r.src ? ` <small class="src-tag">${esc(r.src)}</small>` : ""}</span><strong>${fmtKnown(r.bonus !== null, r.bonus)}</strong></li>`).join("")}
          </ul>
        </div>`;
    };
    el.builderPreview.innerHTML = `
      <article class="card sheet24">
        <div class="sheet24-hero-row">
        <figure class="sheet24-portrait">
          <img src="${esc(portraitSrc(p.sp.id, p.cl.id))}" alt="${esc(`${p.sr ? p.sr.name : p.sp.name} ${p.cl.name} portrait`)}" width="108" height="144" loading="lazy" decoding="async" />
        </figure>
        <div class="sheet24-hero-meta">
        <div class="sheet24-identity">
          <div class="id-cell id-name"><span class="vital-label">Character Name</span><strong>${esc(state.charName) || "&nbsp;"}</strong></div>
          <div class="id-cell"><span class="vital-label">Class &amp; Level</span><strong>${esc(p.cl.name)} ${p.level}${p.sc ? ` · ${esc(p.sc.name)}` : ""}</strong></div>
          <div class="id-cell"><span class="vital-label">Species</span><strong>${esc(p.sr ? `${p.sr.name}` : p.sp.name)}</strong></div>
          <div class="id-cell"><span class="vital-label">Background</span><strong>${bg ? esc(bg.name) : "&nbsp;"}</strong></div>
          <div class="id-cell"><span class="vital-label">Alignment</span><strong>${esc(state.alignment) || "&nbsp;"}</strong></div>
        </div>
        <div class="sheet24-vitals">
          <div class="v24 v24-ac"><span class="vital-label">Armor Class</span><strong>${allKnown ? p.ac : "—"}</strong>${hasShield && allKnown ? `<small>Shield ${p.ac + 2}</small>` : ""}</div>
          <div class="v24"><span class="vital-label">Initiative</span><strong>${fmtKnown(k.DEX !== false, p.mods.DEX)}</strong></div>
          <div class="v24"><span class="vital-label">Speed</span><strong>${esc(String(p.speed || ""))} ft</strong></div>
          <div class="v24"><span class="vital-label">Size</span><strong>${esc(p.sp.size || "")}</strong></div>
          <div class="v24"><span class="vital-label">Proficiency</span><strong>${signed(p.pb)}</strong></div>
          <div class="v24"><span class="vital-label">Passive Perception</span><strong>${passive("Perception") === null ? "—" : passive("Perception")}</strong></div>
        </div>
        </div>
        </div>
        <div class="vital-grid sheet24-creation-vitals">
          <div class="id-cell"><span class="vital-label">Max Hit Points</span><strong data-hp-max>${conOk ? p.hpMax : "—"}</strong></div>
          <div class="id-cell"><span class="vital-label">Hit Dice</span><strong data-hd-total>${p.level}d${p.hd}</strong></div>
          <div class="id-cell"><span class="vital-label">Class Feature Pool</span><strong>${esc(p.prog.resourceLabel)}</strong></div>
        </div>
        <div class="sheet24-abilities">${ABILITIES.map(abilityCard).join("")}</div>
        <div class="sheet24-weapons">
          <div class="card-head"><h4>Weapons &amp; Damage Cantrips</h4></div>
          <div class="table-wrap"><table class="forge-table"><thead><tr><th scope="col">Name</th><th scope="col">Atk Bonus / DC</th><th scope="col">Damage &amp; Type</th><th scope="col">Notes</th></tr></thead><tbody>
            ${lines.length ? lines.map((w) => {
              const ok = k[w.stat] !== false;
              return `<tr><th scope="row">${esc(w.name)}</th><td class="num">${fmtKnown(ok, w.toHit)}</td><td class="mono">${w.count}d${w.sides}${ok && w.bonus ? ` ${signed(w.bonus)}` : ""} ${esc(w.type)}</td><td>${esc(w.notes)}</td></tr>`;
            }).join("") : `<tr><td colspan="4" class="rp-note">No signature weapons listed.</td></tr>`}
          </tbody></table></div>
        </div>
      </article>
      ${sheetDetailsHtml(p, ss, eq)}`;
  }

  // Read-only companion sheet card: spellcasting, features, gear, coins, appearance and roleplay.
  function sheetDetailsHtml(p, ss, eq) {
    const { sp, sr, cl, sc, mods } = p;
    const k = p.known || {};
    const bg = ss.bg;
    const dash = (v) => (String(v || "").trim() ? esc(String(v).trim()) : "—");
    const castInfo = (() => {
      const api = playbookApi();
      if (api && typeof api.canCastCombatSpells === "function") {
        try { const r = api.canCastCombatSpells(sp, sr, cl, sc, p.level); if (r && typeof r === "object") return r; } catch (err) { console.error(err); }
      }
      return localCanCastSpells(p);
    })();
    const canCast = Boolean(castInfo.canCast);
    const ruleNotes = (() => {
      try { return arr(combinationsPlaybookSafe(p).ruleNotes).filter(Boolean); } catch (err) { console.error(err); return []; }
    })();
    const dcAb = dcStat(cl, sc);
    const spellAb = cl.spellAbility || (sc && sc.spellAbility) || dcAb;
    const dcOk = k[dcAb] !== false && Number.isFinite(mods[dcAb]);
    const slots = canCast ? spellSlots(cl, p.level).filter((s) => s.count > 0) : [];
    const spellHtml = canCast ? `
        <div class="sheet24-spell" data-sheet-spell>
          <div class="card-head"><h4>Spellcasting</h4><span class="badge">${esc(arr(castInfo.sources).join(", ") || cl.name)}</span></div>
          <div class="sheet24-spell-stats">
            <div class="id-cell"><span class="vital-label">Ability</span><strong>${esc(statLabel(spellAb))}</strong></div>
            <div class="id-cell"><span class="vital-label">Save DC</span><strong>${dcOk ? 8 + p.pb + mods[dcAb] : "—"}</strong></div>
            <div class="id-cell"><span class="vital-label">Spell Attack</span><strong>${dcOk ? signed(p.pb + mods[dcAb]) : "—"}</strong></div>
          </div>
          <div class="pill-row sheet24-slots">${slots.length ? slots.map((s) => `<span class="pill">Lv ${s.level} · ${s.count} slot${s.count > 1 ? "s" : ""}</span>`).join("") : `<span class="pill">Cantrips and innate spells</span>`}</div>
        </div>` : `
        <div class="sheet24-martial" data-sheet-martial><strong>Martial Prowess</strong><span>${esc(cl.name)} relies on weapons and class features, not spell slots.</span></div>`;
    const featOk = (u) => lvlOf(u) <= p.level;
    const feats = arr(cl.classActions).filter((a) => featOk(a.unlock)).concat(arr(sc && sc.subActions).filter((a) => featOk(a.unlock)))
      .map((a) => ({ tag: "Class", name: String(a.name || ""), detail: [a.economy, a.roll].filter(Boolean).join(" · ") }));
    const traits = arr(sp.traits).map((t) => (typeof t === "string" ? { tag: "Species", name: t, detail: "" } : { tag: "Species", name: String(t.name || ""), detail: "" }))
      .concat(sr && sr.bonus ? [{ tag: "Species", name: sr.name, detail: String(sr.bonus) }] : []);
    const bgFeat = bg && bg.feature ? [{ tag: "Background", name: String(bg.feature), detail: bg.name }] : [];
    const featList = feats.concat(traits, bgFeat).filter((f) => f.name);
    const tr = trainingFrom(cl);
    const armorPills = [["Light", tr.light], ["Medium", tr.medium], ["Heavy", tr.heavy], ["Shields", tr.shields]]
      .map(([n, on]) => `<span class="pill${on ? " synergy" : " is-off"}">${n}</span>`).join("");
    const coinKeys = ["cp", "sp", "ep", "gp", "pp"];
    const ap = state.appearance || {};
    const rp = state.rpCustom || {};
    const rpCell = (key) => {
      const v = String(rp[key] || "").trim();
      return `<div class="id-cell sheet24-rp-cell" data-sheet-rp="${key}"><span class="vital-label">${esc(RP_LABELS[key])}</span>${v ? `<p>${esc(v)}</p>` : `<p class="rp-note">Select or write in Step 4</p>`}</div>`;
    };
    const notes = String(rp.notes || "").trim();
    return `
      <article class="card sheet24 sheet24-details" data-sheet-details>
        <div class="sheet24-mid-grid">
          <section class="sheet24-mid-col">
            ${spellHtml}
            <div class="sheet24-feats">
              <div class="card-head"><h4>Features &amp; Traits</h4><span class="badge">${featList.length}</span></div>
              <ul class="sheet24-feat-list">${featList.length ? featList.map((f) => `<li><span class="feat-tag">${esc(f.tag)}</span><strong>${esc(f.name)}</strong>${f.detail ? `<small>${esc(f.detail)}</small>` : ""}</li>`).join("") : `<li class="rp-note">No features unlocked yet.</li>`}</ul>
            </div>
          </section>
          <section class="sheet24-mid-col">
            <div class="sheet24-train">
              <div class="card-head"><h4>Proficiencies &amp; Training</h4></div>
              <div class="pill-row">${armorPills}</div>
              <p class="sheet24-train-line"><span class="vital-label">Weapons</span>${dash(tr.weapons)}</p>
              <p class="sheet24-train-line"><span class="vital-label">Tools</span>${dash(tr.tools)}</p>
            </div>
            <div class="sheet24-gear" data-sheet-gear>
              <div class="card-head"><h4>Equipment</h4><span class="badge">${eq.items.length}</span></div>
              ${eq.items.length ? `<ul class="sheet24-gear-list">${eq.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : `<p class="rp-note">Choose starting equipment in Step 3.</p>`}
            </div>
            <div class="sheet24-coins" data-sheet-coins>${coinKeys.map((c) => `<div class="id-cell coin-cell" data-coin="${c}"><span class="vital-label">${coinTermHtml(c)}</span><strong>${dash(state.coins && state.coins[c])}</strong></div>`).join("")}</div>
          </section>
        </div>
        <div class="sheet24-rules" data-sheet-rules>
          <div class="card-head"><h4>⚠ Important Action-Economy &amp; Rule Interactions</h4><span class="badge">${ruleNotes.length}</span></div>
          ${ruleNotes.length ? `<ul class="sheet24-rules-list">${ruleNotes.map((n) => `<li>${annotateStats(n)}</li>`).join("")}</ul>` : `<p class="rp-note">Pick a class to see rule interactions.</p>`}
        </div>
        <div class="sheet24-appearance">
          <div class="card-head"><h4>Physical Appearance</h4></div>
          <div class="sheet24-appearance-row">${["age", "height", "weight", "eyes", "skin", "hair"].map((key) => `<div class="id-cell" data-sheet-appearance="${key}"><span class="vital-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span><strong>${dash(ap[key])}</strong></div>`).join("")}</div>
        </div>
        <div class="sheet24-rp">
          <div class="card-head"><h4>Personality, Ideals, Bonds &amp; Flaws</h4></div>
          <div class="sheet24-rp-grid">${RP_KEYS.map(rpCell).join("")}</div>
          <div class="id-cell sheet24-backstory" data-sheet-backstory><span class="vital-label">Backstory &amp; Notes</span>${notes ? `<p>${esc(notes)}</p>` : `<p class="rp-note">Write a backstory in Step 4.</p>`}</div>
        </div>
      </article>`;
  }

  function renderBuilderChrome(p, st) {
    const status = st || builderStatus(p);
    if (el.builderTitle) el.builderTitle.textContent = String(state.charName || "").trim() || "New Character";
    if (el.builderProgress) el.builderProgress.textContent = `${status.doneCount} / 5 Steps`;
    if (el.tabSheet) {
      status.steps.forEach((s) => {
        const card = el.tabSheet.querySelector(`[data-step="${s.n}"]`);
        if (!card) return;
        card.classList.toggle("is-done", s.done);
        const num = card.querySelector(".step-num");
        if (num) num.textContent = s.done ? "✓" : String(s.n);
        const badge = card.querySelector(".step-state");
        if (badge) badge.textContent = s.done ? "Complete" : "In Progress";
      });
    }
    if (!el.builderGate) return;
    if (state.gateOpen && status.missing.length) {
      el.builderGate.hidden = false;
      el.builderGate.innerHTML = `
        <strong>⚠ Your sheet is incomplete.</strong>
        <span>Missing:</span> ${status.missing.map((m) => `<button type="button" class="missing-chip" data-jump-step="${m.step}">${esc(m.label)}</button>`).join(" ")}
        <div class="btn-row">
          <button type="button" class="btn btn-primary" data-jump-step="${status.missing[0].step}">Jump to first missing step</button>
          <button type="button" class="btn btn-secondary" data-export-anyway="${esc(state.gateOpen)}">Export With Blank Fields Anyway</button>
          <button type="button" class="rp-btn" data-gate-close>Dismiss</button>
        </div>`;
    } else {
      el.builderGate.hidden = true;
      el.builderGate.innerHTML = "";
      if (!status.missing.length) state.gateOpen = null;
    }
  }

  function renderSheetTab() {
    if (!el.tabSheet) return;
    const y = window.scrollY;
    const p = sheetProfile();
    const st = builderStatus(p);
    renderBuilderSteps(p, st);
    renderSheetPreview(p);
    renderBuilderChrome(p, st);
    if (el.tabDice) renderDiceTab();
    if (state.builderOpen && Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
  }

  // Live refresh for text input: updates preview and progress without rebuilding the focused inputs.
  function refreshBuilderLive() {
    const p = sheetProfile();
    renderSheetPreview(p);
    renderBuilderChrome(p);
  }

  function syncTopbarMode(isBuilder) {
    document.querySelectorAll(".topbar-forge-only").forEach((n) => { n.hidden = Boolean(isBuilder); });
    document.querySelectorAll(".topbar-builder-only").forEach((n) => { n.hidden = !isBuilder; });
  }

  function openBuilder() {
    state.builderOpen = true;
    syncTopbarMode(true);
    if (el.workspace) el.workspace.hidden = true;
    if (el.builderView) el.builderView.hidden = false;
    document.body.classList.add("builder-open");
    pruneStaleSkillPicks();
    renderSheetTab();
    try { const b = currentBuild(); prewarmPortrait(b.sp, b.cl); } catch (err) { console.error(err); }
    try { renderDiceTab(); } catch (err) { console.error(err); }
    window.scrollTo(0, 0);
  }

  function closeBuilder() {
    state.builderOpen = false;
    state.gateOpen = null;
    syncTopbarMode(false);
    if (el.builderView) el.builderView.hidden = true;
    if (el.workspace) el.workspace.hidden = false;
    document.body.classList.remove("builder-open");
    renderAll();
    window.scrollTo(0, 0);
  }

  function jumpToStep(n) {
    state.builderStep = clamp(Number(n) || 1, 1, 5);
    const card = document.getElementById(`builder-step-${state.builderStep}`);
    if (card && typeof card.scrollIntoView === "function") card.scrollIntoView({ behavior: "smooth", block: "start" });
    if (card) { card.classList.add("flash"); setTimeout(() => card.classList.remove("flash"), 1200); }
  }

  // Export gate: incomplete sheets get a banner listing every missing item before any blank export.
  function requestExport(kind, force) {
    const st = builderStatus();
    if (!st.complete && !force) {
      state.gateOpen = kind;
      if (!state.builderOpen) openBuilder();
      renderBuilderChrome(null, st);
      showToast(`Sheet incomplete · ${st.missing.length} item${st.missing.length > 1 ? "s" : ""} missing`);
      jumpToStep(st.missing[0].step);
      return false;
    }
    state.gateOpen = null;
    renderBuilderChrome(null);
    if (kind === "print") printSheet();
    else downloadPdf();
    return true;
  }

  // Print uses the exact Export PDF bytes inside a hidden iframe; HTML print view is the last-resort fallback.
  async function printSheet() {
    let bytes = null;
    try {
      bytes = await exportPdfBytesAsync();
    } catch (err) {
      console.error(err);
    }
    if (!bytes || !bytes.length || typeof Blob === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
      buildPrintSheet();
      try { window.print(); } catch (err) { showToast("Print unavailable"); }
      return false;
    }
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    let frame = document.getElementById("pdf-print-frame");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "pdf-print-frame";
      frame.title = "Character sheet print preview";
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      document.body.appendChild(frame);
    }
    const prevUrl = frame.dataset.pdfUrl;
    frame.dataset.pdfBytes = String(bytes.length);
    frame.dataset.pdfUrl = url;
    frame.onload = () => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (err) {
        console.error(err);
        if (!window.open(url, "_blank")) showToast("Print unavailable");
      }
    };
    frame.src = url;
    if (prevUrl) setTimeout(() => URL.revokeObjectURL(prevUrl), 1000);
    showToast("Opening 2024 PDF character sheet for print");
    return true;
  }

  function setBound(path, value) {
    const parts = String(path).split(".");
    if (parts.length === 1) {
      if (!PERSIST_KEYS.includes(parts[0])) return false;
      state[parts[0]] = parts[0] === "xp" ? String(value).replace(/[^0-9]/g, "").slice(0, 7) : value;
      return true;
    }
    const [root, key] = parts;
    if (!["appearance", "coins", "rpCustom", "attunement"].includes(root) || !state[root]) return false;
    const v = root === "coins" ? String(value).replace(/[^0-9]/g, "").slice(0, 9) : value;
    if (root === "attunement") state.attunement[Number(key)] = v;
    else state[root][key] = v;
    return true;
  }

  function sheetMutate(full) {
    saveSheet();
    if (full) renderAll();
    else renderSheetTab();
  }

  function applyHp(kind, amount) {
    const p = sheetProfile();
    const s = state.session;
    const n = Math.max(0, Math.round(Number(amount)) || 0);
    if (kind === "damage") {
      const soak = Math.min(s.hpTemp, n);
      s.hpTemp -= soak;
      s.hpCur = Math.max(0, s.hpCur - (n - soak));
    } else if (kind === "heal") {
      s.hpCur = Math.min(p.hpMax, s.hpCur + n);
    } else if (kind === "temp") {
      s.hpTemp = Math.max(s.hpTemp, n);
    }
  }

  const SHORT_REST_CLASSES = ["fighter", "warlock", "monk", "druid", "cleric"];

  function shortRest() {
    const p = sheetProfile();
    const s = state.session;
    if (s.hdUsed >= p.level) { showToast("No Hit Dice left · take a Long Rest"); return null; }
    s.hdUsed += 1;
    const r = rollSpec({ label: "Short Rest · Hit Die", count: 1, sides: p.hd, bonus: p.mods.CON });
    s.hpCur = Math.min(p.hpMax, s.hpCur + Math.max(0, r.total));
    if (SHORT_REST_CLASSES.includes(p.cl.id)) s.resourcesUsed = 0;
    return r;
  }

  function longRest() {
    const p = sheetProfile();
    const s = state.session;
    s.hpCur = p.hpMax;
    s.hpTemp = 0;
    s.hdUsed = Math.max(0, s.hdUsed - Math.max(1, Math.floor(p.level / 2)));
    s.deathPass = 0;
    s.deathFail = 0;
    s.resourcesUsed = 0;
  }

  function resetSheet() {
    Object.assign(state, {
      charName: "", bgId: "", alignment: "", xp: "", heroicInspiration: false, statMode: "", statPool: null, rolledBreakdown: null,
      assignedScores: blankScoreMap(null), abilityRolls: blankRollMap(), activeRollSlot: null, swapFrom: null, pointBuyScores: defaultPointBuy(), flexAsiPicks: [], pickedClassSkills: [], pickedSpeciesSkills: [],
      equipChoice: "", customGear: "", coins: defaultCoins(), attunement: ["", "", ""], appearance: defaultAppearance(), rpCustom: defaultRpCustom(),
      session: defaultSession(), playbookOpts: defaultPlaybookOpts(), critToggle: false, gateOpen: null
    });
  }

  // Playbook: S1 evaluator when present, local exact-probability evaluator otherwise.
  function playbookProfile(p) {
    return {
      level: p.level, scores: p.scores, mods: p.mods, pb: p.pb, sp: p.sp, sr: p.sr, cl: p.cl, sc: p.sc,
      speciesId: p.sp.id, subraceId: p.sr ? p.sr.id : null, classId: p.cl.id, subclassId: p.sc ? p.sc.id : null,
      ac: p.ac, hpMax: p.hpMax, prog: p.prog, saves: p.saves, attackStat: p.atkStat, weapons: weaponLines(p)
    };
  }

  function resolvedOpts(p) {
    const o = Object.assign(defaultPlaybookOpts(), state.playbookOpts);
    if (!Number.isFinite(o.targetAc)) o.targetAc = 13 + Math.floor(p.level / 3);
    if (!Number.isFinite(o.enemyAtk)) o.enemyAtk = 3 + Math.floor(p.level / 2);
    o.targetAc = clamp(o.targetAc, 10, 24);
    o.enemyAtk = clamp(o.enemyAtk, 3, 14);
    return o;
  }

  function hitOdds(atk, ac, critMin, adv, rolls, lucky) {
    let hit = clamp((21 - (ac - atk)) / 20, 0.05, 0.95);
    let crit = (21 - critMin) / 20;
    hit = Math.max(hit, crit);
    if (lucky) { hit += 0.05 * hit; crit += 0.05 * crit; }
    if (adv) { hit = 1 - Math.pow(1 - hit, rolls); crit = 1 - Math.pow(1 - crit, rolls); }
    return { hit: Math.min(1, hit), crit: Math.min(1, crit) };
  }

  const avgDie = (sides) => (sides + 1) / 2;

  function localPlaybook(p, o) {
    const { cl, sc, sp, mods, prog } = p;
    const lvl = p.level;
    const lines = weaponLines(p);
    const melee = lines.find((w) => !w.isCantrip) || { name: "Unarmed Strike", toHit: p.pb + mods.STR, count: 1, sides: 4, bonus: mods.STR, stat: "STR" };
    const cantrip = lines.find((w) => w.isCantrip);
    const champion = sc && sc.id === "champion";
    const critMin = champion ? (lvl >= 15 ? 18 : lvl >= 3 ? 19 : 20) : 20;
    const lucky = sp.id === "halfling";
    const elvenRolls = (st) => (o.advantage && ["elf", "half-elf"].includes(sp.id) && !["STR", "CON"].includes(st) ? 3 : 2);
    const savage = sp.id === "half-orc" ? 1 : 0;
    const surge = o.novaBurst && cl.id === "fighter" && lvl >= 2 ? 2 : 1;

    function line(name, w, attacks, extras) {
      const odds = hitOdds(w.toHit, o.targetAc, w.isCantrip ? 20 : critMin, o.advantage, elvenRolls(w.stat), lucky);
      const perHitRider = extras.perHit || 0;
      const onHit = w.count * avgDie(w.sides) + w.bonus + perHitRider;
      const critBonus = w.count * avgDie(w.sides) + (w.isCantrip ? 0 : (prog.brutalCritDice + savage) * avgDie(w.sides)) + (extras.perHitDiceAvg || 0);
      const pAny = 1 - Math.pow(1 - odds.hit, attacks);
      const dpr = attacks * (odds.hit * onHit + odds.crit * critBonus) + pAny * (extras.oncePerTurn || 0) + (extras.flat || 0);
      const rolls = [];
      for (let i = 0; i < attacks; i += 1) {
        rolls.push({ label: `${w.name} To-Hit ${i + 1}`, count: 1, sides: 20, bonus: w.toHit, crit: true, critDmg: critSpecFor(p, w) });
        rolls.push({ label: `${w.name} Damage ${i + 1}`, count: w.count, sides: w.sides, bonus: w.bonus + perHitRider, dmg: true });
      }
      (extras.rolls || []).forEach((r) => rolls.push(r));
      return {
        name, sequence: extras.sequence || `${attacks}× ${w.name}`, formula: `${attacks}× [${w.count}d${w.sides}${signed(w.bonus + perHitRider)}] vs AC ${o.targetAc}${extras.formula ? ` + ${extras.formula}` : ""}`,
        hitPct: odds.hit * 100, critPct: odds.crit * 100, dpr, rolls, optimal: false
      };
    }

    const riders = { perHit: 0, oncePerTurn: 0, perHitDiceAvg: 0, rolls: [], formula: "" };
    if (o.classRider) {
      if (cl.id === "barbarian") { riders.perHit = prog.rageDmg; riders.formula = `Rage +${prog.rageDmg}`; }
      if (cl.id === "rogue") { riders.oncePerTurn = prog.sneakDice * 3.5; riders.formula = `Sneak ${prog.sneakDice}d6`; riders.rolls.push({ label: "Sneak Attack", count: prog.sneakDice, sides: 6, bonus: 0, dmg: true }); }
      if (cl.id === "paladin" && lvl >= 2) { riders.oncePerTurn = 9; riders.perHitDiceAvg = 9; riders.formula = "Smite 2d8"; riders.rolls.push({ label: "Divine Smite", count: 2, sides: 8, bonus: 0, dmg: true }); }
      if (cl.id === "paladin" && prog.improvedSmite) { riders.perHit += 4.5; }
      if (cl.id === "ranger" || cl.id === "warlock") { riders.perHit += 3.5; riders.formula = cl.id === "ranger" ? "Hunter's Mark 1d6" : "Hex 1d6"; }
      if (sc && sc.id === "zealot") { riders.oncePerTurn += 4.5 + Math.floor(lvl / 2); riders.formula += " Divine Fury"; }
    }
    const strikes = [];
    const atkCount = prog.attacks * surge;
    strikes.push(line("Primary Martial Line", melee, atkCount, { ...riders, sequence: `${atkCount}× ${melee.name}${riders.formula ? ` + ${riders.formula}` : ""}` }));
    if (o.offhandOrBonus) {
      if (cl.id === "monk") {
        const md = parseDice(prog.martialDie) || { count: 1, sides: 4 };
        const fist = { name: "Flurry Strike", toHit: p.pb + mods.DEX, count: md.count, sides: md.sides, bonus: mods.DEX, stat: "DEX" };
        const extra = lvl >= 2 ? 2 : 1;
        const base = line("Flurry Sequence", melee, atkCount, riders);
        const fl = line("Flurry Sequence", fist, extra, {});
        strikes.push({ ...base, sequence: `${atkCount}× ${melee.name} + ${extra}× Flurry`, formula: `${base.formula} + ${extra}× [${prog.martialDie}${signed(mods.DEX)}]`, dpr: base.dpr + fl.dpr, rolls: [...base.rolls, ...fl.rolls] });
      } else {
        const off = { name: "Off-Hand Strike", toHit: melee.toHit, count: 1, sides: 6, bonus: 0, stat: melee.stat };
        const base = line("Tactical Off-Hand Line", melee, atkCount, riders);
        const oh = line("Off-Hand", off, 1, cl.id === "barbarian" && o.classRider ? { perHit: prog.rageDmg } : {});
        strikes.push({ ...base, sequence: `${atkCount}× ${melee.name} + Off-Hand 1d6`, formula: `${base.formula} + Bonus 1d6`, dpr: base.dpr + oh.dpr, rolls: [...base.rolls, ...oh.rolls] });
      }
    }
    if (cantrip) {
      const beams = cl.id === "warlock" && /eldritch/i.test(cantrip.name) ? prog.cantripDice : 1;
      const beam = { ...cantrip, count: beams > 1 ? cantrip.count / beams : cantrip.count, bonus: cl.id === "warlock" && lvl >= 2 && beams ? mods.CHA : 0 };
      strikes.push(line("Cantrip Sustain Line", beam, beams, { perHit: cl.id === "warlock" && o.classRider ? 3.5 : 0, sequence: `${beams}× ${cantrip.name}` }));
    } else {
      const bow = { name: "Ranged Volley", toHit: p.pb + mods.DEX, count: 1, sides: 8, bonus: mods.DEX, stat: "DEX" };
      strikes.push(line("Ranged Alternative", bow, prog.attacks * surge, {}));
    }
    strikes.forEach((s) => { s.dpr = Math.round(s.dpr * 10) / 10; });
    const best = strikes.reduce((b, s) => (s.dpr > b.dpr ? s : b), strikes[0]);
    best.optimal = true;

    const shieldOk = /shield/i.test(`${cl.armor || ""} ${cl.acRule || ""}`);
    const reactionShield = o.reactionDef && (["wizard", "sorcerer"].includes(cl.id) || (sc && ["eldritch", "hexblade"].includes(sc.id)));
    const notes = [];
    let tuned = p.ac;
    if (o.useShield && shieldOk && !(p.acInfo && p.acInfo.shield)) { tuned += 2; notes.push("Shield +2"); }
    if (o.useShield && p.acInfo && p.acInfo.shield) { tuned = p.acInfo.shield; notes.push("Shield equipped"); }
    if (o.coverBonus) { tuned += o.coverBonus; notes.push(`Cover +${o.coverBonus}`); }
    if (reactionShield) { tuned += 5; notes.push("Shield spell +5 reaction"); }
    const enemyHit = (ac, dis) => { const h = clamp((21 - (ac - o.enemyAtk)) / 20, 0.05, 0.95); return dis ? h * h : h; };
    const baseHit = enemyHit(p.ac, false);
    const tunedHit = enemyHit(tuned, o.dodgeAction);
    let dr = 0;
    if (cl.id === "barbarian" && o.classRider) { dr = 0.5; notes.push("Rage halves physical"); }
    else if (cl.id === "rogue" && lvl >= 5 && o.reactionDef) { dr = 0.25; notes.push("Uncanny Dodge"); }
    else if (cl.id === "monk" && o.reactionDef) { dr = 0.1; notes.push("Deflect Missiles"); }
    if (o.dodgeAction) notes.push("Dodge: enemy disadvantage");
    const weakestAb = ABILITIES.reduce((w, ab) => (p.saves[ab].mod < p.saves[w].mod ? ab : w), "STR");
    const patch = { STR: "Stay out of grapple reach; carry a ranged backup", DEX: "Spread out vs. area blasts; stand behind cover", CON: "Bank temp HP and keep Concentration spells short", INT: "Avoid mind-flayer lines of sight; ask for Bless", WIS: "Ask the party for Bless or Aura; stand near the Paladin", CHA: "Keep Protection from Evil handy vs. banishment" };
    return {
      strikes,
      defenses: {
        baseAc: p.ac, tunedAc: tuned, acNotes: notes, enemyHitBasePct: baseHit * 100, enemyHitTunedPct: tunedHit * 100,
        dmgReductionPct: dr * 100, ehpMultiplier: tunedHit > 0 ? (baseHit / tunedHit) / (1 - dr) : 1,
        weakestSave: { stat: weakestAb, mod: p.saves[weakestAb].mod, warning: `${statLabel(weakestAb)} save ${signed(p.saves[weakestAb].mod)} is your weak point`, patch: patch[weakestAb] },
        steps: [
          { phase: "Pre-Combat Stance", title: o.useShield ? "Shield up" : "Ready stance", detail: `${notes.length ? notes.join(", ") : "Keep base AC"} before initiative` },
          { phase: "Positioning", title: o.coverBonus ? "Hold cover" : "Find cover", detail: o.coverBonus ? `Cover adds +${o.coverBonus} AC` : "Half cover adds +2 AC, three-quarters +5" },
          { phase: "Reaction Trigger", title: reactionShield ? "Cast Shield" : "Save the reaction", detail: reactionShield ? "Trigger Shield when a hit lands within 5 of your AC" : dr ? "Mitigation already active; spend reaction on opportunity attacks" : "Use reaction for an opportunity attack or a defensive feature" }
        ]
      },
      source: "local"
    };
  }

  const pctOf = (v) => { const n = Number(v) || 0; return n <= 1 ? n * 100 : n; };

  // Reads either playbook shape defensively and returns the local layout.
  function normalizePlaybook(r, fallback) {
    if (!r || typeof r !== "object") return fallback;
    const raw = arr(r.strikes || r.lines || r.rotations || r.candidates);
    if (!raw.length) return fallback;
    const strikes = raw.map((s) => ({
      name: s.name || s.label || s.title || "Strike",
      sequence: s.sequence || s.seq || s.desc || "",
      formula: s.formula || s.math || "",
      hitPct: pctOf(s.hitPct != null ? s.hitPct : s.pHit != null ? s.pHit : s.hitChance),
      critPct: pctOf(s.critPct != null ? s.critPct : s.pCrit != null ? s.pCrit : s.critChance),
      dpr: Math.round((Number(s.dpr != null ? s.dpr : s.expectedDpr) || 0) * 10) / 10,
      rolls: arr(s.rolls).filter((x) => x && Number(x.sides)),
      optimal: Boolean(s.optimal)
    }));
    if (!strikes.some((s) => s.optimal)) strikes.reduce((b, s) => (s.dpr > b.dpr ? s : b), strikes[0]).optimal = true;
    const d = r.defenses && typeof r.defenses === "object" ? r.defenses : {};
    const fd = fallback.defenses;
    const defenses = {
      baseAc: Number.isFinite(d.baseAc) ? d.baseAc : fd.baseAc,
      tunedAc: Number.isFinite(d.tunedAc) ? d.tunedAc : fd.tunedAc,
      acNotes: Array.isArray(d.acNotes) ? d.acNotes : fd.acNotes,
      enemyHitBasePct: d.enemyHitBasePct != null ? pctOf(d.enemyHitBasePct) : fd.enemyHitBasePct,
      enemyHitTunedPct: d.enemyHitTunedPct != null ? pctOf(d.enemyHitTunedPct) : fd.enemyHitTunedPct,
      dmgReductionPct: d.dmgReductionPct != null ? pctOf(d.dmgReductionPct) : fd.dmgReductionPct,
      ehpMultiplier: Number.isFinite(d.ehpMultiplier) ? d.ehpMultiplier : fd.ehpMultiplier,
      weakestSave: d.weakestSave && d.weakestSave.stat ? Object.assign({}, fd.weakestSave, d.weakestSave) : fd.weakestSave,
      steps: arr(d.steps).length ? d.steps : fd.steps
    };
    return { strikes, defenses, source: "playbook" };
  }

  function evaluatePlaybookSafe(p) {
    const o = resolvedOpts(p);
    const local = localPlaybook(p, o);
    const api = playbookApi();
    if (api && typeof api.evaluatePlaybook === "function") {
      try {
        return { pb: normalizePlaybook(api.evaluatePlaybook(playbookProfile(p), o), local), opts: o };
      } catch (err) {
        // Local evaluator covers a failing playbook module.
      }
    }
    return { pb: local, opts: o };
  }

  // Combinations playbook: concrete strike, defense and rule interactions for the build at its level.
  const lvlOf = (u) => { const m = /(\d+)/.exec(String(u || "")); return m ? Number(m[1]) : 1; };

  function dieSpec(str, label, bonus, extra) {
    const d = parseDice(String(str || "")) || { count: 1, sides: 6 };
    return { label, count: d.count, sides: d.sides, bonus: Math.round(Number(bonus)) || 0, ...(extra || {}) };
  }

  function localCombinations(p) {
    const { cl, sc, sp, sr, mods, pb } = p;
    const prog = p.prog || {};
    const lvl = p.level;
    const lines = weaponLines(p);
    const melee = lines.find((w) => !w.isCantrip) || { name: "Unarmed Strike", toHit: pb + mods.STR, count: 1, sides: 4, bonus: mods.STR, stat: "STR", isCantrip: false };
    const cantrip = lines.find((w) => w.isCantrip);
    const dcAb = dcStat(cl, sc);
    const dc = 8 + pb + mods[dcAb];
    const spellAtk = pb + mods[dcAb];
    const atks = Number(prog.attacks) || 1;
    const sid = sc ? sc.id : "";
    const srid = sr ? sr.id : "";
    const hit = (w, extra) => ({ label: `${w.name} To-Hit`, count: 1, sides: 20, bonus: w.toHit, crit: true, critDmg: critSpecFor(p, w), ...(extra || {}) });
    const dmg = (w, add, label) => ({ label: label || `${w.name} Damage`, count: w.count, sides: w.sides, bonus: w.bonus + (add || 0), dmg: true });
    const strikes = [];
    const defenses = [];
    const notes = [];
    const S = (minLvl, o) => { if (lvl >= minLvl) strikes.push({ unlock: `Lv ${minLvl}`, rolls: [], ...o }); };
    const D = (minLvl, o) => { if (lvl >= minLvl) defenses.push({ unlock: `Lv ${minLvl}`, rolls: [], ...o }); };
    const N = (minLvl, t) => { if (lvl >= minLvl) notes.push(t); };

    S(1, {
      name: atks > 1 ? `${atks}x ${melee.name} Attack Chain` : `${melee.name} Attack`, economy: "Action", cost: "None",
      formula: `1d20 ${signed(melee.toHit)} to hit · ${melee.count}d${melee.sides} ${signed(melee.bonus)} ${melee.type || ""}`.trim(),
      howToUse: `Take the Attack action for ${atks} strike${atks > 1 ? "s" : ""}; you may split movement between strikes and switch targets after each one.`,
      rolls: [hit(melee), dmg(melee)]
    });

    switch (cl.id) {
      case "barbarian":
        S(1, { name: "Rage + Attack Chain", economy: "Bonus Action, then Action", cost: `1 Rage of ${prog.rageCount}`, formula: `${melee.count}d${melee.sides} ${signed(melee.bonus)} +${prog.rageDmg} Rage per STR hit`, howToUse: "Enter Rage as a Bonus Action before swinging so every STR melee hit this turn adds the Rage bonus; keep attacking or taking damage each turn to sustain it.", rolls: [hit(melee), dmg(melee, prog.rageDmg, `${melee.name} Raging Damage`)] });
        S(2, { name: "Reckless Attack Advantage Engine", economy: "First attack of your turn", cost: "Enemies gain Advantage on you", formula: `2d20kh1 ${signed(melee.toHit)}${prog.brutalCritDice ? ` · Brutal Critical +${prog.brutalCritDice} die` : ""}${sp.id === "half-orc" ? " · Savage Attacks +1 die" : ""}`, howToUse: "Declare Reckless on your first STR melee attack; Advantage nearly doubles your crit chance, which feeds Brutal Critical and Half-Orc Savage Attacks extra dice.", rolls: [{ label: `${melee.name} Reckless`, count: 2, sides: 20, bonus: melee.toHit, keep: "highest" }, dmg(melee, prog.rageDmg)] });
        S(1, { name: "Rage Grapple + Shove Prone Lock", economy: `Replace attacks${atks > 1 ? " within one Attack action" : ""}`, cost: "Attack slots", formula: `Athletics with Advantage while Raging · 1d20 ${signed(mods.STR + pb)}`, howToUse: "Grapple to drop the foe to 0 speed, then Shove it Prone; it cannot stand while grappled, so every melee attack against it has Advantage.", rolls: [{ label: "Athletics Contest", count: 2, sides: 20, bonus: mods.STR + pb, keep: "highest" }] });
        if (sid === "berserker") S(3, { name: "Frenzy Bonus Swing", economy: "Bonus Action each turn", cost: "Exhaustion after Rage in older rules", formula: `Extra ${melee.name} attack +${prog.rageDmg}`, howToUse: "While raging in Frenzy, add one melee weapon attack as a Bonus Action every turn.", rolls: [hit(melee), dmg(melee, prog.rageDmg)] });
        if (sid === "zealot") S(3, { name: "Divine Fury First Hit", economy: "First hit each turn", cost: "Rage active", formula: `1d6 + ${Math.floor(lvl / 2)} radiant or necrotic`, howToUse: "Your first weapon hit each turn while raging adds Divine Fury damage on top of Rage damage.", rolls: [{ label: "Divine Fury", count: 1, sides: 6, bonus: Math.floor(lvl / 2), dmg: true }] });
        if (sid === "totem") S(3, { name: "Wolf Totem Pack Engine", economy: "Passive while raging", cost: "Rage active", formula: "Allies gain Advantage on melee attacks vs enemies within 5 ft of you", howToUse: "Stand next to the priority target so your Rogue and martial allies all attack with Advantage." });
        if (sid === "ancestral") S(3, { name: "Ancestral Protectors Mark", economy: "First hit each turn", cost: "Rage active", formula: "Marked foe has Disadvantage vs anyone else; others take half damage from it", howToUse: "Hit the boss first each turn so it must attack you or lose half its damage." });
        D(1, { name: "Rage Resistance Wall", trigger: "While raging", cost: "Rage active", formula: "Resistance to bludgeoning, piercing and slashing", howToUse: `Rage before the enemy's turn to halve weapon damage; your ${p.hpMax} HP effectively doubles against physical hits.` });
        D(2, { name: "Danger Sense", trigger: "DEX saves vs effects you can see", cost: "Not blinded, deafened or incapacitated", formula: `2d20kh1 ${signed(p.saves.DEX.mod)}`, howToUse: "Advantage on DEX saves against traps, breath weapons and fireballs.", rolls: [{ label: "DEX Save", count: 2, sides: 20, bonus: p.saves.DEX.mod, keep: "highest" }] });
        D(11, { name: "Relentless Rage", trigger: "Drop to 0 HP while raging", cost: "DC 10, rising by 5 each use", formula: `1d20 ${signed(p.saves.CON.mod)} CON save -> 1 HP`, howToUse: "Stay up instead of falling; DC resets on a short or long rest.", rolls: [{ label: "Relentless Rage", count: 1, sides: 20, bonus: p.saves.CON.mod }] });
        N(1, "Rage ends early if you neither attack a hostile creature nor take damage since your last turn.");
        N(1, "You cannot cast or concentrate on spells while Raging.");
        N(1, "Rage damage applies only to STR-based melee weapon attacks, not thrown DEX or ranged attacks.");
        break;
      case "fighter":
        S(2, { name: "Action Surge Double-Attack Combo", economy: "One extra Action", cost: lvl >= 17 ? "2 per Short Rest" : "1 per Short Rest", formula: `${atks * 2}x ${melee.name} strikes this turn`, howToUse: "Use Action Surge to take a second full Attack action on the same turn, or Dash and then Attack to close distance.", rolls: [hit(melee), dmg(melee), hit(melee), dmg(melee)] });
        if (sid === "battlemaster") S(3, { name: "Superiority Maneuver Strike", economy: "On hit", cost: "1 Superiority Die", formula: `${prog.superiorityDie || "1d8"} added damage · DC ${8 + pb + Math.max(mods.STR, mods.DEX)}`, howToUse: "Trip Attack knocks the target Prone for Advantage on your remaining attacks; Precision Attack adds the die to a near-miss.", rolls: [dieSpec(prog.superiorityDie || "1d8", "Superiority Die", 0, { dmg: true })] });
        if (sid === "champion") S(3, { name: "Improved Critical Crit Fishing", economy: "Every attack", cost: "None", formula: `Crit on ${lvl >= 15 ? "18-20" : "19-20"}`, howToUse: "More attacks and Advantage sources multiply your expanded crit range; pair with Action Surge for burst turns.", rolls: [critSpecFor(p, melee)].filter(Boolean) });
        if (sid === "echo") S(3, { name: "Echo Knight Unleash Incarnation", economy: "Within Attack action", cost: `${Math.max(1, mods.CON)} per Long Rest`, formula: `Extra ${melee.name} attack from your echo`, howToUse: "Attack from the echo's position to strike enemies out of your reach." });
        if (sid === "eldritch") S(7, { name: "War Magic Cantrip + Swing", economy: "Action, then Bonus Action attack", cost: "None", formula: `Spell attack ${signed(spellAtk)} · weapon ${signed(melee.toHit)}`, howToUse: "Cast a cantrip such as Booming Blade, then make one weapon attack as a Bonus Action." });
        D(1, { name: "Second Wind", trigger: "Bonus Action", cost: "1 per Short Rest", formula: `1d10 + ${lvl} HP`, howToUse: "Heal mid-fight without spending your Action.", rolls: [{ label: "Second Wind", count: 1, sides: 10, bonus: lvl }] });
        D(9, { name: "Indomitable", trigger: "Failed saving throw", cost: lvl >= 17 ? "3 per Long Rest" : lvl >= 13 ? "2 per Long Rest" : "1 per Long Rest", formula: "Reroll the save, adding your Fighter level in 2024 rules", howToUse: "Save it for Hold Person, Banishment and other fight-ending effects." });
        N(1, "Action Surge cannot be used more than once on the same turn.");
        N(5, "Extra Attack strikes all happen inside one Attack action; a Bonus Action attack still needs a separate feature.");
        break;
      case "rogue":
        S(1, { name: "Ally-Adjacent Sneak Attack", economy: "Once per turn", cost: "Finesse or ranged weapon", formula: `${melee.count}d${melee.sides} ${signed(melee.bonus)} + ${prog.sneakDice}d6`, howToUse: "Attack a foe adjacent to an ally or with Advantage to add Sneak Attack dice once per turn.", rolls: [hit(melee), dmg(melee), { label: "Sneak Attack", count: prog.sneakDice || 1, sides: 6, bonus: 0, dmg: true }] });
        S(2, { name: "Cunning Action Hide -> Advantage Sneak Attack", economy: "Bonus Action Hide, then Action", cost: "Cover or obscurement", formula: `Stealth 1d20 ${signed(mods.DEX + pb)} then 2d20kh1 ${signed(melee.toHit)}`, howToUse: "Hide as a Bonus Action, then attack from hiding for Advantage and guaranteed Sneak Attack eligibility.", rolls: [{ label: "Stealth", count: 1, sides: 20, bonus: mods.DEX + pb }, { label: "Hidden Attack", count: 2, sides: 20, bonus: melee.toHit, keep: "highest" }] });
        S(1, { name: "Two-Weapon Double-Chance Sneak", economy: "Bonus Action off-hand attack", cost: "Two light weapons", formula: `Second chance to land ${prog.sneakDice}d6`, howToUse: "If your main attack misses, the off-hand light weapon gives another roll to deliver Sneak Attack this turn." });
        if (sid === "assassin") S(3, { name: "Assassinate Opener", economy: "First round", cost: "Act before the target", formula: "Advantage; hits on surprised foes are critical", howToUse: "Win initiative from hiding so every hit on a surprised creature doubles Sneak Attack dice." });
        if (sid === "swashbuckler") S(3, { name: "Rakish Audacity Duel", economy: "Passive", cost: "None", formula: "Sneak Attack with no ally adjacent if only one foe is within 5 ft", howToUse: "Fight solo duels and use Fancy Footwork to retreat without Opportunity Attacks." });
        if (sid === "arcane-trickster") S(3, { name: "Mage Hand + Cantrip Trick", economy: "Bonus Action Mage Hand", cost: "None", formula: `Spell attack ${signed(spellAtk)}`, howToUse: "Use the invisible Mage Hand to distract and set up Advantage from Versatile Trickster at Lv 13." });
        D(5, { name: "Uncanny Dodge", trigger: "Reaction when hit by a seen attacker", cost: "Reaction", formula: "Halve the attack's damage", howToUse: "Spend your Reaction on the biggest hit each round." });
        D(7, { name: "Evasion", trigger: "DEX save for half damage", cost: "None", formula: `1d20 ${signed(p.saves.DEX.mod)} · success 0, fail half`, howToUse: "Area spells barely touch you; stand where casters aim.", rolls: [{ label: "DEX Save", count: 1, sides: 20, bonus: p.saves.DEX.mod }] });
        D(2, { name: "Cunning Disengage", trigger: "Bonus Action", cost: "None", formula: "No Opportunity Attacks this turn", howToUse: "Strike, then Disengage and walk away from melee threats." });
        N(1, "Sneak Attack applies once per turn, not once per round; a reaction attack on another turn can trigger it again.");
        N(1, "Sneak Attack needs a finesse or ranged weapon, and Disadvantage on the roll cancels it.");
        break;
      case "paladin":
        S(2, { name: "Weapon Chain + Post-Hit Divine Smite", economy: "On hit", cost: "1 spell slot", formula: "+2d8 radiant, +1d8 per slot above 1st, +1d8 vs undead or fiends", howToUse: "Declare Smite after you see a hit; save higher slots for Nat 20 crits, where all Smite dice double.", rolls: [hit(melee), dmg(melee), { label: "Divine Smite", count: 2, sides: 8, bonus: 0, dmg: true }] });
        if (sid === "vengeance") S(3, { name: "Vow of Enmity Advantage", economy: "Bonus Action", cost: "Channel Divinity", formula: "Advantage on attacks vs one creature for 1 minute", howToUse: "Vow the boss, then fish for crits to double Smite dice." });
        if (sid === "devotion") S(3, { name: "Sacred Weapon", economy: "Action", cost: "Channel Divinity", formula: `+${Math.max(1, mods.CHA)} to hit for 1 minute`, howToUse: "Activate before a long fight to stabilize accuracy." });
        if (sid === "conquest") S(3, { name: "Guided Strike + Conquering Presence", economy: "On attack or Action", cost: "Channel Divinity", formula: "+10 to one attack, or frighten foes within 30 ft", howToUse: "Turn a miss into a hit for a big Smite, or lock enemies frightened." });
        if (lvl >= 11) S(11, { name: "Improved Divine Smite", economy: "Every melee hit", cost: "None", formula: "+1d8 radiant on every melee weapon hit", howToUse: "Free extra damage on each hit; stacks with slot Smites.", rolls: [{ label: "Improved Smite", count: 1, sides: 8, bonus: 0, dmg: true }] });
        D(1, { name: "Lay on Hands", trigger: "Action", cost: `Pool ${prog.layOnHands} HP`, formula: "Restore any amount from the pool or cure a disease or poison for 5", howToUse: "Pick up downed allies with 1 HP and save the rest of the pool." });
        D(6, { name: "Aura of Protection", trigger: "Passive", cost: "Conscious", formula: `+${Math.max(1, mods.CHA)} to all saves for you and allies within ${lvl >= 18 ? 30 : 10} ft`, howToUse: "Keep the party clustered against save-or-suck spells." });
        N(2, "Divine Smite works only on melee weapon hits and is declared after the hit is confirmed.");
        N(2, "Concentration smite spells and Bless compete for concentration; pick one per fight.");
        break;
      case "monk":
        S(1, { name: "Attack + Martial Arts Bonus Strike", economy: "Action, then Bonus Action", cost: "None", formula: `Unarmed ${prog.martialDie} ${signed(Math.max(mods.DEX, mods.STR))}`, howToUse: "After an Attack action with a monk weapon or unarmed strike, add a free unarmed strike as a Bonus Action.", rolls: [dieSpec(prog.martialDie, "Martial Arts", Math.max(mods.DEX, mods.STR), { dmg: true })] });
        S(2, { name: "Flurry of Blows Chain", economy: "Bonus Action", cost: "1 Ki", formula: `2 unarmed strikes of ${prog.martialDie}`, howToUse: "Replace the free bonus strike with two strikes for one Ki.", rolls: [dieSpec(prog.martialDie, "Flurry 1", Math.max(mods.DEX, mods.STR), { dmg: true }), dieSpec(prog.martialDie, "Flurry 2", Math.max(mods.DEX, mods.STR), { dmg: true })] });
        S(5, { name: "Stunning Strike Setup", economy: "On a melee hit", cost: "1 Ki", formula: `CON save DC ${8 + pb + mods.WIS}`, howToUse: "A stunned target gives Advantage to the whole party and auto-fails STR and DEX saves." });
        if (sid === "open-hand") S(3, { name: "Open Hand Technique", economy: "On Flurry hit", cost: "Included in Flurry", formula: "Prone, push 15 ft, or no reactions", howToUse: "Knock Prone so allies attack with Advantage." });
        if (sid === "shadow") S(3, { name: "Shadow Step Ambush", economy: "Bonus Action", cost: "Dim light", formula: "Teleport 60 ft, Advantage on next melee attack", howToUse: "Step between shadows to flank casters." });
        D(2, { name: "Patient Defense", trigger: "Bonus Action", cost: "1 Ki", formula: "Dodge as a Bonus Action", howToUse: "Attack, then Dodge so attacks against you have Disadvantage." });
        D(3, { name: "Deflect Missiles", trigger: "Reaction to a ranged weapon hit", cost: "Reaction", formula: `Reduce by 1d10 ${signed(mods.DEX)} + ${lvl}`, howToUse: "Catch arrows and spend 1 Ki to throw one back.", rolls: [{ label: "Deflect Missiles", count: 1, sides: 10, bonus: mods.DEX + lvl }] });
        D(7, { name: "Evasion", trigger: "DEX save for half damage", cost: "None", formula: "Success 0, fail half", howToUse: "Area spells barely touch you." });
        N(2, "Ki fully returns on a short rest, so spend it freely in each fight.");
        N(1, "Martial Arts requires no armor and no shield.");
        break;
      case "ranger":
        S(1, { name: "Hunter's Mark + Attack Chain", economy: "Bonus Action cast, then Action", cost: "1st-level slot, concentration", formula: `${melee.count}d${melee.sides} ${signed(melee.bonus)} + 1d6 per hit`, howToUse: "Mark the target, then add 1d6 on every weapon hit; move the mark as a Bonus Action when it drops.", rolls: [hit(melee), dmg(melee), { label: "Hunter's Mark", count: 1, sides: 6, bonus: 0, dmg: true }] });
        if (sid === "gloom") S(3, { name: "Dread Ambusher Opener", economy: "First turn", cost: "None", formula: "Extra attack +1d8 and +WIS initiative", howToUse: "Win initiative and drop a priority target in round one." });
        D(1, { name: "Cover + Ranged Kiting", trigger: "Positioning", cost: "Movement", formula: "+2 or +5 AC behind cover", howToUse: "Keep half cover between you and enemies while shooting." });
        N(1, "Hunter's Mark is concentration; taking damage forces a CON save to keep it.");
        break;
      case "warlock":
        S(1, { name: `Hex + ${prog.cantripDice}-Beam Eldritch Blast`, economy: "Bonus Action Hex, then Action", cost: "Pact slot, concentration", formula: `${prog.cantripDice}x 1d10 force + 1d6 necrotic per beam${lvl >= 2 ? ` + ${mods.CHA} with Agonizing Blast` : ""}`, howToUse: "Hex the target, then each Eldritch Blast beam adds Hex damage.", rolls: [{ label: "Eldritch Blast To-Hit", count: 1, sides: 20, bonus: spellAtk, crit: true }, { label: "Eldritch Blast Beam", count: 1, sides: 10, bonus: lvl >= 2 ? mods.CHA : 0, dmg: true }, { label: "Hex", count: 1, sides: 6, bonus: 0, dmg: true }] });
        if (sid === "fiend") D(1, { name: "Dark One's Blessing", trigger: "Reduce a hostile to 0 HP", cost: "None", formula: `Gain ${Math.max(1, mods.CHA + lvl)} temp HP`, howToUse: "Finish weak foes to stack a temp HP buffer." });
        D(1, { name: "Pact Slot Short Rest Cycle", trigger: "Short Rest", cost: "1 hour", formula: "All pact slots return", howToUse: "Ask for a short rest after each fight." });
        N(1, "Pact slots always cast at their highest level and recover on a short rest.");
        break;
      case "cleric":
        S(3, { name: "Spiritual Weapon + Cantrip", economy: "Bonus Action weapon, Action cantrip", cost: "2nd-level slot, no concentration", formula: `1d8 ${signed(mods.WIS)} force each turn`, howToUse: "Spiritual Weapon attacks every turn as a Bonus Action and does not need concentration.", rolls: [{ label: "Spiritual Weapon", count: 1, sides: 20, bonus: spellAtk, crit: true }, { label: "Spiritual Weapon Damage", count: 1, sides: 8, bonus: mods.WIS, dmg: true }] });
        S(5, { name: "Spirit Guardians + Spiritual Weapon", economy: "Action, then Bonus Action", cost: "3rd and 2nd slots", formula: `3d8 radiant WIS save DC ${dc} per enemy`, howToUse: "Walk into enemies with Guardians running and keep the weapon swinging.", rolls: [{ label: "Spirit Guardians", count: 3, sides: 8, bonus: 0, dmg: true }] });
        D(1, { name: "Healing Word Pickup", trigger: "Bonus Action at range", cost: "1st-level slot", formula: `1d4 ${signed(mods.WIS)} HP`, howToUse: "Revive a downed ally from 60 ft without losing your Action.", rolls: [{ label: "Healing Word", count: 1, sides: 4, bonus: mods.WIS }] });
        N(1, "Casting a Bonus Action spell limits your Action spell that turn to a cantrip.");
        break;
      case "druid":
        S(2, { name: "Concentration Terrain Spell + Wild Shape", economy: "Action, then Bonus Action", cost: "Slot plus Wild Shape use", formula: `Save DC ${dc}`, howToUse: "Drop Entangle or Spike Growth, then Wild Shape to keep concentration with a fresh HP pool." });
        D(2, { name: "Wild Shape HP Buffer", trigger: sid === "moon" ? "Bonus Action" : "Action", cost: "1 Wild Shape use", formula: "Beast HP absorbs damage first", howToUse: "Excess damage carries over, so revert before the beast form drops." });
        N(2, "You can keep concentrating on a spell while Wild Shaped but cannot cast new spells until Lv 18.");
        break;
      case "bard":
        S(1, { name: "Bardic Inspiration + Control Spell", economy: "Bonus Action, then Action", cost: "1 Inspiration and a slot", formula: `${prog.bardicDie} to an ally · Save DC ${dc}`, howToUse: "Inspire the striker, then lock the enemy with a control spell.", rolls: [dieSpec(prog.bardicDie, "Bardic Inspiration", 0)] });
        D(3, { name: "Cutting Words", trigger: sid === "lore" ? "Reaction" : "Reaction with Lore", cost: "1 Inspiration", formula: `Subtract ${prog.bardicDie} from an enemy roll`, howToUse: "Turn an enemy hit into a miss after seeing the roll." });
        N(1, "A creature can hold only one Bardic Inspiration die at a time.");
        break;
      default:
        break;
    }

    if (["wizard", "sorcerer"].includes(cl.id) || (cl.id === "fighter" && sid === "eldritch") || (cl.id === "warlock" && sid === "hexblade")) {
      D(1, { name: "Shield Reaction", trigger: "Reaction when hit", cost: "1st-level slot", formula: `+5 AC until your next turn: ${p.ac} -> ${p.ac + 5}`, howToUse: "Cast after seeing the attack roll to turn hits into misses." });
    }
    if (["wizard", "sorcerer"].includes(cl.id)) {
      S(1, { name: cantrip ? `${cantrip.name} Cantrip Engine` : "Damage Cantrip Engine", economy: "Action", cost: "None", formula: cantrip ? `1d20 ${signed(cantrip.toHit)} · ${cantrip.count}d${cantrip.sides}` : `Spell attack ${signed(spellAtk)}`, howToUse: "Spend slots on control and use cantrips for steady damage.", rolls: cantrip ? [hit(cantrip), dmg(cantrip)] : [] });
      D(3, { name: "Misty Step Escape", trigger: "Bonus Action", cost: "2nd-level slot", formula: "Teleport 30 ft", howToUse: "Escape grapples and melee threats, then cast a cantrip." });
      if (cl.id === "sorcerer") S(3, { name: "Quickened Spell + Cantrip", economy: "Bonus Action spell, then Action cantrip", cost: "2 Sorcery Points", formula: "Two casts in one turn", howToUse: "Quicken a leveled spell and follow with a cantrip." });
      N(1, "Concentration ends when you cast another concentration spell or fail a CON save after damage.");
    }

    if (sp.id === "half-orc") {
      D(1, { name: "Relentless Endurance", trigger: "Drop to 0 HP but not killed", cost: "1 per Long Rest", formula: "Drop to 1 HP instead", howToUse: "Stay in the fight one more round." });
      S(1, { name: "Savage Attacks Crit Rider", economy: "On melee crit", cost: "None", formula: "+1 weapon damage die on crit", howToUse: "Advantage sources raise crit odds and this extra die." });
    }
    if (sp.id === "dwarf") D(1, { name: "Dwarven Resilience", trigger: "Poison", cost: "None", formula: "Advantage on saves vs poison and resistance to poison damage", howToUse: "Front-line poisonous monsters." });
    if (sp.id === "halfling") D(1, { name: "Lucky + Brave", trigger: "Natural 1 on d20", cost: "None", formula: "Reroll natural 1s; Advantage vs frightened", howToUse: "Every d20 test is safer; take risky attacks." });
    if (sp.id === "tiefling" && srid !== "winged") D(3, { name: "Hellish Rebuke", trigger: "Reaction when damaged", cost: "1 per Long Rest", formula: `2d10 fire DEX save DC ${8 + pb + mods.CHA}`, howToUse: "Punish the attacker that hit you.", rolls: [{ label: "Hellish Rebuke", count: 2, sides: 10, bonus: 0, dmg: true }] });
    if (sp.id === "tiefling") D(1, { name: "Hellish Resistance", trigger: "Fire damage", cost: "None", formula: "Resistance to fire", howToUse: "Shrug off fire breath and Fireball." });
    if (sp.id === "dragonborn") S(1, { name: `Breath Weapon ${prog.breathDice}`, economy: "Replaces one attack in 2024 rules", cost: "PB uses per Long Rest", formula: `${prog.breathDice} save DC ${8 + pb + mods.CON}`, howToUse: "Swap a weapon attack for the breath cone when enemies cluster.", rolls: [dieSpec(prog.breathDice, "Breath Weapon", 0, { dmg: true })] });
    if (sp.id === "gnome") D(1, { name: "Gnome Cunning", trigger: "INT, WIS or CHA saves vs magic", cost: "None", formula: "Advantage", howToUse: "Resist charms and mind control." });
    if (["elf", "half-elf"].includes(sp.id)) D(1, { name: "Fey Ancestry", trigger: "Charm effects", cost: "None", formula: "Advantage vs charmed; magic cannot put you to sleep", howToUse: "Stand against enchanters." });
    if (sp.id === "goliath") D(1, { name: "Stone's Endurance", trigger: "Reaction when damaged", cost: "PB per Long Rest", formula: `Reduce by 1d12 ${signed(mods.CON)}`, howToUse: "Blunt a big hit.", rolls: [{ label: "Stone's Endurance", count: 1, sides: 12, bonus: mods.CON }] });
    if (sp.id === "aasimar") D(1, { name: "Healing Hands", trigger: "Action", cost: "1 per Long Rest", formula: `Heal ${pb}d4`, howToUse: "Emergency heal; resistance to radiant and necrotic too.", rolls: [{ label: "Healing Hands", count: pb, sides: 4, bonus: 0 }] });

    D(1, { name: "Dodge Action", trigger: "Action", cost: "Your Action", formula: "Attacks against you have Disadvantage; Advantage on DEX saves", howToUse: "Use when surrounded or waiting for help." });
    if (sp.size === "Small") N(1, "Small size: Disadvantage on attacks with Heavy weapons.");
    N(1, "You get one Action, one Bonus Action, one Reaction and your movement each turn; a Bonus Action exists only if a feature grants it.");
    N(1, "A natural 20 on an attack always hits and doubles all damage dice; a natural 1 always misses.");
    return { level: lvl, summary: "", strikeCombos: strikes.slice(0, 7), defenseCombos: defenses.slice(0, 7), ruleNotes: [...new Set(notes)].slice(0, 6), turnPlan: localTurnPlan(p), source: "local" };
  }

  // Offline fallback for the turn maximizer when the playbook engine is unavailable.
  function localTurnPlan(p) {
    const clId = (p && p.cl && p.cl.id) || "fighter";
    const lvl = Math.max(1, Math.min(20, Number(p && p.level) || 1));
    const caster = ["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"].includes(clId);
    const setup = { barbarian: "Bonus Action: Rage first → Action: Attack", ranger: "Bonus Action: Hunter's Mark first → Action: Attack", warlock: "Bonus Action: Hex first → Action: Eldritch Blast", rogue: "Bonus Action: Hide → Action: Attack with Advantage for Sneak Attack", cleric: lvl >= 5 ? "Action: Spirit Guardians → Bonus Action: no leveled spell" : "Bonus Action: Spiritual Weapon → Action: cantrip" };
    return [
      { phase: "Turn 1 · Opening Setup", order: setup[clId] || (caster ? "Action: control or damage spell → Bonus Action: class feature" : "Action: Attack → Bonus Action: class feature"), ridersAndMove: "Move into position first, then act.", reaction: "Opportunity Attack" },
      { phase: "Turn 2+ · Sustained Max Loop", order: caster ? "Action: cantrip → Bonus Action: maintain your concentration effect" : "Action: Attack → Bonus Action: off-hand or class bonus action", ridersAndMove: "Focus one target at a time.", reaction: "Opportunity Attack" },
      { phase: "Burst · Boss / Nova Turn", order: clId === "fighter" && lvl >= 2 ? "Action Surge: two full Attack actions" : "Spend your best per-rest resource on the boss", ridersAndMove: "Stack every once-per-turn rider on the first hit.", reaction: "Opportunity Attack" },
      { phase: "Off-Turn · Reaction & Move", order: "No Action spent: hold the Reaction", ridersAndMove: "End turns behind cover.", reaction: caster ? "Shield, Absorb Elements or Counterspell if known." : "Opportunity Attack on any foe leaving your reach." }
    ];
  }

  function normalizeCombos(r, fb) {
    if (!r || typeof r !== "object") return fb;
    const txt = (v) => (v === null || v === undefined ? "" : String(v));
    const rollsOf = (rs) => arr(rs).filter((x) => x && typeof x === "object" && Number(x.sides) > 0);
    const strikes = arr(r.strikeCombos).filter((c) => c && c.name).map((c) => ({ name: txt(c.name), unlock: txt(c.unlock), economy: txt(c.economy), cost: txt(c.cost), formula: txt(c.formula), howToUse: txt(c.howToUse), rolls: rollsOf(c.rolls) }));
    const defs = arr(r.defenseCombos).filter((c) => c && c.name).map((c) => ({ name: txt(c.name), unlock: txt(c.unlock), trigger: txt(c.trigger || c.economy), cost: txt(c.cost), formula: txt(c.formula), howToUse: txt(c.howToUse), rolls: rollsOf(c.rolls) }));
    if (!strikes.length || !defs.length) return fb;
    const rn = arr(r.ruleNotes).map(txt).filter(Boolean);
    const tp = arr(r.turnPlan).filter((t) => t && t.phase && t.order).map((t) => ({ phase: txt(t.phase), order: txt(t.order), ridersAndMove: txt(t.ridersAndMove), reaction: txt(t.reaction) }));
    return { level: r.level || fb.level, summary: txt(r.summary), strikeCombos: strikes, defenseCombos: defs, ruleNotes: rn.length ? rn : fb.ruleNotes, turnPlan: tp.length >= 4 ? tp : fb.turnPlan, source: "playbook" };
  }

  function combinationsPlaybookSafe(p) {
    const local = localCombinations(p);
    const api = playbookApi();
    if (api && typeof api.buildCombinationsPlaybook === "function") {
      try {
        return normalizeCombos(api.buildCombinationsPlaybook(playbookProfile(p)), local);
      } catch (err) {
        console.error(err);
      }
    }
    return local;
  }

  function renderPlaybookTab(p) {
    if (!el.tabPlaybook) return;
    const prof = p || currentProfile();
    const book = combinationsPlaybookSafe(prof);
    const buildName = `${prof.sr ? prof.sr.name : prof.sp.name} ${prof.sc ? `${prof.sc.name} ` : ""}${prof.cl.name}`;
    const rollCell = (c) => (c.rolls.length ? rollBtnHtml(c.rolls, "🎲 Roll", "mini") : "");
    const strikeRows = book.strikeCombos.map((c) => `<tr data-strike-row><th scope="row">${esc(c.name)}</th><td>${esc(c.unlock)}${c.economy ? ` · ${esc(c.economy)}` : ""}</td><td>${esc(c.cost)}</td><td class="mono">${annotateStats(c.formula)}</td><td>${annotateStats(c.howToUse)}</td><td class="roll-cell">${rollCell(c)}</td></tr>`);
    const defRows = book.defenseCombos.map((c) => `<tr data-defense-row><th scope="row">${esc(c.name)}</th><td>${esc(c.unlock)}${c.trigger ? ` · ${esc(c.trigger)}` : ""}</td><td>${esc(c.cost)}</td><td class="mono">${annotateStats(c.formula)}</td><td>${annotateStats(c.howToUse)}</td><td class="roll-cell">${rollCell(c)}</td></tr>`);
    const turnPlan = arr(book.turnPlan);
    const turnRows = turnPlan.map((t) => `<tr data-turn-row><th scope="row">${esc(t.phase)}</th><td>${annotateStats(t.order)}</td><td>${annotateStats(t.ridersAndMove)}</td><td>${annotateStats(t.reaction)}</td></tr>`);
    el.tabPlaybook.innerHTML = `
      <p class="combo-note">How your <strong>${esc(prof.sp.name)}${prof.sr ? ` · ${esc(prof.sr.name)}` : ""}</strong> species and <strong>${esc(prof.cl.name)}${prof.sc ? ` · ${esc(prof.sc.name)}` : ""}</strong> class features combine at <strong>Level ${prof.level}</strong>. Pick the combination that fits the moment; nothing here is a single forced move.</p>
      <article class="card" data-combo-card="turn-max">
        <div class="card-head"><h3>⚡ How to Maximize Every Turn</h3><span class="badge">${turnPlan.length} Phases · Lv ${prof.level}</span></div>
        ${forgeTable(["Turn / Phase", "Action + Bonus Action Order", "Free Riders & Positioning", "Off-Turn Reaction"], turnRows, "No turn plan at this level")}
      </article>
      <article class="card" data-combo-card="strike">
        <div class="card-head"><h3>⚔ Strike &amp; Offense Combinations</h3><span class="badge">${book.strikeCombos.length} Combos · ${esc(buildName)}</span></div>
        ${forgeTable(["Combination", "Unlock & Economy", "Cost", "Dice / Formula", "How It Works", "Roll"], strikeRows, "No strike combinations at this level")}
      </article>
      <article class="card" data-combo-card="defense">
        <div class="card-head"><h3>🛡 Defense, Survival &amp; Reaction Combinations</h3><span class="badge">${book.defenseCombos.length} Combos</span></div>
        ${forgeTable(["Combination", "Trigger & Economy", "Cost", "Mechanics", "How It Works", "Roll"], defRows, "No defensive combinations at this level")}
      </article>
      <article class="card" data-combo-card="rules">
        <div class="card-head"><h3>⚠ Important Action-Economy &amp; Rule Interactions</h3><span class="badge">${book.ruleNotes.length} Rules</span></div>
        <ul class="list-clean">${book.ruleNotes.map((n) => `<li>${annotateStats(n)}</li>`).join("")}</ul>
      </article>`;
  }

  // PDF export: canonical 2024 payload, validated S1 generator, inline three-page fallback.
  function pdfAscii(s) {
    return String(s == null ? "" : s)
      .replace(/[—–]/g, "-").replace(/[·•]/g, "*").replace(/→/g, "->").replace(/×/g, "x").replace(/[●]/g, "*").replace(/[○]/g, "o").replace(/[’‘]/g, "'").replace(/[“”]/g, "\"")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  const BAD_TEXT_RE = /^(undefined|null|NaN|Unnamed Hero)$/i;

  // Recursive scrub: strings lose undefined, null and NaN tokens; non-finite numbers become null.
  function scrubPayload(v) {
    if (v === undefined) return "";
    if (v === null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
      const s = v.replace(/\b(undefined|NaN)\b/g, "").replace(/\bnull\b/g, "").replace(/Unnamed Hero/gi, "").replace(/\s{2,}/g, " ").trim();
      return BAD_TEXT_RE.test(s) ? "" : s;
    }
    if (Array.isArray(v)) return v.map(scrubPayload);
    if (typeof v === "object") {
      const out = {};
      Object.keys(v).forEach((k) => { out[k] = scrubPayload(v[k]); });
      return out;
    }
    return v;
  }

  function trainingFrom(cl) {
    const a = String(cl.armor || "");
    return {
      light: /light|all armor/i.test(a), medium: /medium|all armor/i.test(a), heavy: /heavy|all armor/i.test(a), shields: /shield/i.test(a),
      weapons: String(cl.weapons || ""), tools: String(cl.tools || "")
    };
  }

  // Grayscale print portraits keyed by class and species; values resolve to { width, height, jpegBin, dataUrl } or null.
  const PORTRAIT_W = 270;
  const PORTRAIT_H = 360;
  const portraitGrayCache = new Map();
  const portraitGrayPending = new Map();
  const portraitId = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const portraitKey = (spId, clId) => `${portraitId(clId)}/${portraitId(spId)}`;
  const portraitSrc = (spId, clId) => `images/portraits/${portraitId(clId)}/${portraitId(spId)}.webp`;

  // Lifted print-friendly gray: luminance with gamma 0.85 squeezed into 8..250 so dark art never floods toner.
  function printGray(r, g, b) {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return clamp(Math.round(Math.pow(lum / 255, 0.85) * 242 + 8), 0, 255);
  }

  // 3:4 cover crop of a source image; extra height is trimmed with a 12 percent bias toward the top edge.
  function portraitCrop(iw, ih) {
    const target = PORTRAIT_W / PORTRAIT_H;
    if (iw / ih > target) {
      const sw = ih * target;
      return { sx: (iw - sw) / 2, sy: 0, sw, sh: ih };
    }
    const sh = iw / target;
    return { sx: 0, sy: (ih - sh) * 0.12, sw: iw, sh };
  }

  function grayPortraitFromImage(img) {
    const canvas = document.createElement("canvas");
    canvas.width = PORTRAIT_W;
    canvas.height = PORTRAIT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return null;
    const cr = portraitCrop(iw, ih);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, PORTRAIT_W, PORTRAIT_H);
    ctx.drawImage(img, cr.sx, cr.sy, cr.sw, cr.sh, 0, 0, PORTRAIT_W, PORTRAIT_H);
    const data = ctx.getImageData(0, 0, PORTRAIT_W, PORTRAIT_H);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const g = printGray(px[i], px[i + 1], px[i + 2]);
      px[i] = g; px[i + 1] = g; px[i + 2] = g; px[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    const comma = dataUrl.indexOf(",");
    if (!/^data:image\/jpeg;base64,/.test(dataUrl) || comma < 0) return null;
    return { width: PORTRAIT_W, height: PORTRAIT_H, jpegBin: atob(dataUrl.slice(comma + 1)), dataUrl };
  }

  // Decodes and caches a grayscale JPEG portrait; failures resolve to null so exports never block on art.
  function prepareGrayscalePortrait(spId, clId) {
    const key = portraitKey(spId, clId);
    if (portraitGrayCache.has(key)) return Promise.resolve(portraitGrayCache.get(key));
    if (portraitGrayPending.has(key)) return portraitGrayPending.get(key);
    if (typeof Image === "undefined" || typeof document === "undefined" || !portraitId(spId) || !portraitId(clId)) return Promise.resolve(null);
    const job = new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        let out = null;
        try { out = grayPortraitFromImage(img); } catch (err) { console.error(err); }
        resolve(out);
      };
      img.onerror = () => resolve(null);
      img.src = portraitSrc(spId, clId);
    }).then((out) => {
      portraitGrayPending.delete(key);
      if (out) portraitGrayCache.set(key, out);
      return out;
    });
    portraitGrayPending.set(key, job);
    return job;
  }

  function cachedPortrait(sp, cl) {
    return portraitGrayCache.get(portraitKey(sp && sp.id, cl && cl.id)) || null;
  }

  function prewarmPortrait(sp, cl) {
    if (!sp || !cl) return;
    prepareGrayscalePortrait(sp.id, cl.id).catch(() => null);
  }

  function buildPdfPayload() {
    const p = sheetProfile();
    const { sp, sr, cl, sc, mods } = p;
    const k = p.known || {};
    const ok = (ab) => k[ab] !== false;
    const allKnown = ABILITIES.every(ok);
    const ss = skillSheet(p);
    const bg = ss.bg;
    const eq = equipState(cl);
    const hasShield = eq.items.some((t) => /shield/i.test(t));
    const sess = state.session;
    const passive = (name) => { const r = ss.rows.find((x) => x.name === name); return r && r.bonus !== null ? 10 + r.bonus : null; };
    const combo = computeCombo(sp, sr, cl, sc);
    const book = combinationsPlaybookSafe(p);
    const castInfo = (() => {
      const api = playbookApi();
      if (api && typeof api.canCastCombatSpells === "function") {
        try { const r = api.canCastCombatSpells(sp, sr, cl, sc, p.level); if (r && typeof r === "object") return r; } catch (err) { console.error(err); }
      }
      return localCanCastSpells(p);
    })();
    const dcAb = dcStat(cl, sc);
    const spellAb = cl.spellAbility || (sc && sc.spellAbility) || "";
    const canCast = Boolean(castInfo.canCast);
    const featOk = (u) => lvlOf(u) <= p.level;
    const rows = buildActionRows(sp, cl, sc);
    const contextual = contextualActions(p, combatActions());
    const out = {
      name: String(state.charName || "").trim(),
      level: p.level, className: cl.name, subclass: sc ? sc.name : "", species: sp.name, subrace: sr ? sr.name : "", size: sp.size || "",
      background: bg ? bg.name : "", backgroundFeature: bg ? bg.feature || "" : "", alignment: state.alignment || "", xp: String(state.xp || ""),
      heroicInspiration: Boolean(state.heroicInspiration), pb: p.pb,
      scores: {}, mods: {},
      saves: ABILITIES.map((ab) => ({ stat: ab, name: statLabel(ab), proficient: Boolean(p.saves[ab].prof), bonus: ok(ab) ? p.saves[ab].mod : null })),
      skills: ss.rows.map((r) => ({ name: r.name, stat: r.stat, proficient: r.prof, bonus: r.bonus, source: r.src || "" })),
      vitals: {
        ac: allKnown ? p.ac : null, shieldAc: allKnown && hasShield ? p.ac + 2 : null, initiative: ok("DEX") ? mods.DEX : null,
        speed: String(p.speed || ""), vision: String(p.vision || ""),
        hpMax: ok("CON") ? p.hpMax : null, hpCur: ok("CON") ? sess.hpCur : null, hpTemp: sess.hpTemp || 0,
        hitDice: `${p.level - (sess.hdUsed || 0)}/${p.level} d${p.hd}`,
        passivePerception: passive("Perception"), passiveInvestigation: passive("Investigation"), passiveInsight: passive("Insight"),
        deathPass: sess.deathPass || 0, deathFail: sess.deathFail || 0
      },
      training: trainingFrom(cl),
      attacks: weaponLines(p).map((w) => {
        const known = ok(w.stat);
        return { name: w.name, toHitOrDc: known ? signed(w.toHit) : "", damage: `${w.count}d${w.sides}${known && w.bonus ? ` ${signed(w.bonus)}` : ""} ${w.type}`.trim(), notes: w.notes };
      }),
      classFeatures: arr(cl.classActions).filter((a) => featOk(a.unlock)).concat(arr(sc && sc.subActions).filter((a) => featOk(a.unlock))).map((a) => ({ name: String(a.name || ""), detail: [a.economy, a.roll, a.detail].filter(Boolean).join(" · ") })),
      speciesTraits: arr(sp.traits).map((t) => (typeof t === "string" ? { name: t, detail: "" } : { name: String(t.name || ""), detail: String(t.detail || "") })).concat(sr && sr.bonus ? [{ name: sr.name, detail: String(sr.bonus) }] : []),
      featsAndBg: bg ? [{ name: `Background: ${bg.name}`, detail: [bg.feature, bg.desc].filter(Boolean).join(" · ") }] : [],
      canCast,
      spellcasting: {
        ability: canCast ? (spellAb || dcAb) : "",
        saveDc: canCast && ok(dcAb) ? 8 + p.pb + mods[dcAb] : null,
        attackBonus: canCast && ok(dcAb) ? p.pb + mods[dcAb] : null,
        summary: canCast ? `${(p.prog && p.prog.spellSummary) || ""}${arr(castInfo.sources).length ? ` · Sources: ${castInfo.sources.join(", ")}` : ""}` : "",
        slots: canCast ? spellSlots(cl, p.level) : []
      },
      appearance: { ...state.appearance },
      rp: { trait: state.rpCustom.trait || "", ideal: state.rpCustom.ideal || "", bond: state.rpCustom.bond || "", flaw: state.rpCustom.flaw || "", backstory: state.rpCustom.notes || state.rpCustom.backstory || "" },
      equipment: eq.items.slice(),
      coins: { ...state.coins },
      attunement: [0, 1, 2].map((i) => String(arr(state.attunement)[i] || "")),
      synergy: { grade: combo.gradeLabel || combo.grade || "", epithet: combo.epithet || "", loop: combo.loop || "" },
      playbook: {
        strikeCombos: book.strikeCombos.map((c) => ({ name: c.name, economy: [c.unlock, c.economy].filter(Boolean).join(" · "), cost: c.cost, formula: c.formula, howToUse: c.howToUse })),
        defenseCombos: book.defenseCombos.map((c) => ({ name: c.name, trigger: [c.unlock, c.trigger].filter(Boolean).join(" · "), cost: c.cost, formula: c.formula, howToUse: c.howToUse })),
        ruleNotes: book.ruleNotes.slice(),
        turnPlan: arr(book.turnPlan).map((t) => ({ phase: String(t.phase || ""), order: String(t.order || ""), ridersAndMove: String(t.ridersAndMove || ""), reaction: String(t.reaction || "") }))
      },
      actions: rows.filter((a) => featOk(a.unlock)).map((a) => ({ name: String(a.name || ""), badge: a.badge, unlock: String(a.unlock || ""), economy: String(a.economy || ""), roll: String(a.roll || ""), detail: String(a.detail || "") }))
        .concat(contextual.map((a) => ({ name: String(a.name || ""), badge: "Standard", unlock: "", economy: String(a.economy || ""), roll: String(a.roll || ""), detail: String(a.detail || "") })))
    };
    ABILITIES.forEach((ab) => { out.scores[ab] = ok(ab) ? p.scores[ab] : null; out.mods[ab] = ok(ab) ? mods[ab] : null; });
    Object.keys(out.coins).forEach((c) => { out.coins[c] = String(out.coins[c] || ""); });
    const clean = scrubPayload(out);
    // Attached after scrubbing so binary JPEG bytes never pass through the token scrubber.
    const pt = cachedPortrait(sp, cl);
    if (pt) clean.portrait = { width: pt.width, height: pt.height, jpegBin: pt.jpegBin };
    return clean;
  }

  function wrapText(text, width) {
    const out = [];
    let cur = "";
    String(text).split(/\s+/).forEach((w) => {
      if ((cur + " " + w).trim().length > width) { if (cur) out.push(cur); cur = w; } else cur = (cur + " " + w).trim();
    });
    if (cur) out.push(cur);
    return out.length ? out : [""];
  }

  const numTxt = (v) => (v === null || v === undefined || v === "" ? "" : String(v));
  const sgnTxt = (v) => (typeof v === "number" && Number.isFinite(v) ? signed(v) : "");

  // Minimal PDF canvas: labeled boxes and wrapped text on US Letter pages.
  function pdfCanvas() {
    const ops = [];
    const txt = (x, y, s, size, bold) => { const t = pdfAscii(s); if (t) ops.push(`BT /${bold ? "F2" : "F1"} ${size || 9} Tf ${x} ${y} Td (${t}) Tj ET`); };
    const rect = (x, y, w, h) => ops.push(`${x} ${y} ${w} ${h} re S`);
    const box = (x, y, w, h, label, value, size) => { rect(x, y, w, h); txt(x + 3, y + h - 8, label, 6, true); txt(x + 4, y + 5, value, size || 11, true); };
    const para = (x, y, s, width, size, minY) => { let yy = y; wrapText(pdfAscii(s).replace(/\\([()\\])/g, "$1"), width).forEach((ln) => { if (yy < (minY || 30)) return; txt(x, yy, ln, size || 8); yy -= (size || 8) + 2; }); return yy; };
    return { ops, txt, rect, box, para };
  }

  function pdfPages(P) {
    const pages = [];
    const c1 = pdfCanvas();
    c1.txt(36, 760, "D&D 2024 Character Sheet", 15, true);
    c1.txt(380, 760, `${P.synergy.grade}`, 9, true);
    const idW = hasPdfPortrait(P) ? 80 : 90;
    if (hasPdfPortrait(P)) {
      c1.rect(520, 712, 56, 56);
      c1.ops.push(`q 40.5 0 0 54 527.75 713 cm /Im1 Do Q`);
    }
    [["Character Name", P.name], ["Class & Level", `${P.className} ${P.level}`], ["Subclass", P.subclass], ["Species", P.subrace ? `${P.species} ${P.subrace}` : P.species], ["Background", P.background], ["Alignment", P.alignment]]
      .forEach(([l, v], i) => c1.box(36 + i * idW, 714, idW - 4, 34, l, v, 8));
    [["Armor Class", numTxt(P.vitals.ac) + (P.vitals.shieldAc ? ` / ${P.vitals.shieldAc}` : "")], ["Initiative", sgnTxt(P.vitals.initiative)], ["Speed", P.vitals.speed], ["Size", P.size], ["Proficiency", sgnTxt(P.pb)], ["Passive Perc.", numTxt(P.vitals.passivePerception)], ["XP", P.xp], ["Heroic Insp.", P.heroicInspiration ? "Yes" : ""]]
      .forEach(([l, v], i) => c1.box(36 + i * 67.5, 670, 63, 36, l, v, 11));
    c1.box(36, 626, 180, 36, "Hit Point Maximum", numTxt(P.vitals.hpMax), 12);
    c1.box(220, 626, 120, 36, "Current HP", numTxt(P.vitals.hpCur), 12);
    c1.box(344, 626, 80, 36, "Temp HP", P.vitals.hpTemp ? String(P.vitals.hpTemp) : "", 12);
    c1.box(428, 626, 70, 36, "Hit Dice", P.vitals.hitDice, 9);
    c1.box(502, 626, 74, 36, "Death Saves", `P ${"*".repeat(P.vitals.deathPass)} F ${"*".repeat(P.vitals.deathFail)}`, 8);
    let col = 0;
    let y0 = 612;
    const colW = 180;
    ABILITIES.forEach((ab, i) => {
      const x = 36 + (i % 3) * (colW + 6);
      if (i === 3) { col = 1; }
      const yTop = col === 0 ? y0 : y0 - 170;
      const sv = P.saves.find((s) => s.stat === ab);
      const sk = P.skills.filter((s) => s.stat === ab);
      const h = 160;
      c1.rect(x, yTop - h, colW, h);
      c1.txt(x + 4, yTop - 12, `${statLabel(ab)} ${ab}`, 9, true);
      c1.txt(x + 120, yTop - 12, `${numTxt(P.scores[ab])}  ${sgnTxt(P.mods[ab])}`, 10, true);
      let yy = yTop - 28;
      [{ name: "Saving Throw", proficient: sv.proficient, bonus: sv.bonus }, ...sk].forEach((s) => {
        c1.txt(x + 6, yy, `${s.proficient ? "[X]" : "[ ]"} ${s.name}`, 8);
        c1.txt(x + 150, yy, sgnTxt(s.bonus), 8, true);
        yy -= 11;
      });
    });
    let ya = 262;
    c1.txt(36, ya, "Weapons & Damage Cantrips", 10, true);
    ya -= 13;
    P.attacks.slice(0, 6).forEach((a) => { c1.txt(40, ya, a.name, 8, true); c1.txt(190, ya, a.toHitOrDc, 8); c1.txt(240, ya, a.damage, 8); c1.txt(360, ya, a.notes, 7); ya -= 11; });
    ya -= 4;
    c1.txt(36, ya, "Class Features", 10, true);
    ya -= 12;
    P.classFeatures.slice(0, 8).forEach((f) => { ya = c1.para(40, ya, `${f.name}: ${f.detail}`, 120, 7, 120); });
    c1.txt(36, 112, "Species Traits", 10, true);
    let yt = 100;
    P.speciesTraits.slice(0, 5).forEach((f) => { yt = c1.para(40, yt, `${f.name}: ${f.detail}`, 60, 7, 30); });
    c1.txt(320, 112, "Training & Proficiencies", 10, true);
    const tr = P.training;
    let yr = c1.para(324, 100, `Armor: ${["light", "medium", "heavy"].filter((x) => tr[x]).join(", ") || "None"}${tr.shields ? ", shields" : ""}`, 56, 7, 30);
    yr = c1.para(324, yr, `Weapons: ${tr.weapons}`, 56, 7, 30);
    yr = c1.para(324, yr, `Tools: ${tr.tools}`, 56, 7, 30);
    P.featsAndBg.forEach((f) => { yr = c1.para(324, yr, `${f.name}: ${f.detail}`, 56, 7, 30); });
    pages.push(c1.ops.join("\n"));

    const c2 = pdfCanvas();
    c2.txt(36, 760, `Spellcasting, Personality & Inventory * ${P.name}`, 13, true);
    if (P.canCast) {
      c2.box(36, 716, 130, 34, "Spellcasting Ability", P.spellcasting.ability, 11);
      c2.box(170, 716, 130, 34, "Spell Save DC", numTxt(P.spellcasting.saveDc), 11);
      c2.box(304, 716, 130, 34, "Spell Attack Bonus", sgnTxt(P.spellcasting.attackBonus), 11);
      c2.box(438, 716, 138, 34, "Slots", P.spellcasting.slots.map((s) => `L${s.level}x${s.count}`).join(" "), 8);
      c2.para(36, 704, P.spellcasting.summary, 120, 8);
    } else {
      c2.txt(36, 730, "No combat spellcasting for this build.", 9);
    }
    c2.txt(36, 680, "Appearance", 10, true);
    let yp = 668;
    Object.keys(P.appearance || {}).forEach((key) => { c2.txt(40, yp, `${key.charAt(0).toUpperCase()}${key.slice(1)}: ${P.appearance[key] || ""}`, 8); yp -= 11; });
    c2.txt(300, 680, "Personality", 10, true);
    let yq = 668;
    [["Trait", P.rp.trait], ["Ideal", P.rp.ideal], ["Bond", P.rp.bond], ["Flaw", P.rp.flaw]].forEach(([l, v]) => { yq = c2.para(304, yq, `${l}: ${v}`, 60, 8, 420); yq -= 2; });
    let yb = Math.min(yp, yq) - 10;
    c2.txt(36, yb, "Backstory", 10, true);
    yb = c2.para(40, yb - 12, P.rp.backstory, 120, 8, 300);
    let ye = Math.min(yb, 400) - 10;
    c2.txt(36, ye, "Equipment", 10, true);
    ye -= 12;
    P.equipment.slice(0, 16).forEach((it) => { c2.txt(40, ye, `* ${it}`, 8); ye -= 10; });
    c2.txt(320, 400 - 10, "Coins", 10, true);
    ["cp", "sp", "ep", "gp", "pp"].forEach((cn, i) => c2.box(320 + i * 50, 352, 46, 28, cn.toUpperCase(), P.coins[cn] || "", 10));
    c2.txt(320, 334, "Magic Item Attunement", 10, true);
    P.attunement.forEach((a, i) => c2.box(320, 300 - i * 30, 256, 26, `Slot ${i + 1}`, a, 9));
    c2.txt(36, 150, "Build Synergy", 10, true);
    c2.para(40, 138, `${P.synergy.grade} * ${P.synergy.epithet} * ${P.synergy.loop}`, 120, 8);
    pages.push(c2.ops.join("\n"));

    const c3 = pdfCanvas();
    c3.txt(36, 760, `Character Playbook: Strike & Defense Combinations * ${P.name} * Lv ${P.level}`, 12, true);
    let y3 = 740;
    const turnPlan = arr(P.playbook && P.playbook.turnPlan);
    if (turnPlan.length) {
      c3.txt(36, y3, "TURN-BY-TURN ACTION-ECONOMY MAXIMIZER", 10, true);
      y3 -= 13;
      turnPlan.forEach((t) => { y3 = c3.para(40, y3, `${t.phase}: ${t.order} | ${t.ridersAndMove} | Reaction: ${t.reaction}`, 118, 8, 40); y3 -= 2; });
      y3 -= 6;
    }
    c3.txt(36, y3, "STRIKE & OFFENSE COMBINATIONS", 10, true);
    y3 -= 13;
    P.playbook.strikeCombos.forEach((cb) => { y3 = c3.para(40, y3, `${cb.name} [${cb.economy}; ${cb.cost}] - ${cb.formula} : ${cb.howToUse}`, 118, 8, 40); y3 -= 2; });
    y3 -= 6;
    c3.txt(36, y3, "DEFENSE, SURVIVAL & REACTION COMBINATIONS", 10, true);
    y3 -= 13;
    P.playbook.defenseCombos.forEach((cb) => { y3 = c3.para(40, y3, `${cb.name} [${cb.trigger}; ${cb.cost}] - ${cb.formula} : ${cb.howToUse}`, 118, 8, 40); y3 -= 2; });
    y3 -= 6;
    c3.txt(36, y3, "IMPORTANT RULES & ACTION-ECONOMY NOTES", 10, true);
    y3 -= 13;
    P.playbook.ruleNotes.forEach((n) => { y3 = c3.para(40, y3, `* ${n}`, 118, 8, 40); });
    y3 -= 6;
    if (y3 > 120) {
      c3.txt(36, y3, "Unlocked Actions", 10, true);
      y3 -= 12;
      P.actions.slice(0, 20).forEach((a) => { if (y3 < 40) return; y3 = c3.para(40, y3, `${a.name} [${a.badge}] ${a.economy} ${a.roll}`, 118, 7, 40); });
    }
    pages.push(c3.ops.join("\n"));
    return pages;
  }

  const hasPdfPortrait = (P) => Boolean(P && P.portrait && typeof P.portrait.jpegBin === "string" && P.portrait.jpegBin.length && P.portrait.width > 0 && P.portrait.height > 0);

  // Latin1 byte packing: every char code maps to one byte so binary JPEG streams stay intact.
  function latin1Bytes(s) {
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i += 1) bytes[i] = s.charCodeAt(i) & 0xff;
    return bytes;
  }

  function localPdfBytes(payload) {
    const pages = pdfPages(payload);
    const withImg = hasPdfPortrait(payload);
    const imgId = 5 + pages.length * 2;
    const xobj = withImg ? ` /XObject << /Im1 ${imgId} 0 R >>` : "";
    const objs = [];
    objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ");
    objs[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;
    objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
    pages.forEach((content, i) => {
      const body = `0.5 w\n${content}`;
      objs[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${xobj} >> /Contents ${6 + i * 2} 0 R >>`;
      objs[6 + i * 2] = `<< /Length ${body.length} >>\nstream\n${body}\nendstream`;
    });
    if (withImg) {
      const pt = payload.portrait;
      objs[imgId] = `<< /Type /XObject /Subtype /Image /Width ${pt.width} /Height ${pt.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pt.jpegBin.length} >>\nstream\n${pt.jpegBin}\nendstream`;
    }
    let out = "%PDF-1.4\n";
    const offsets = [];
    for (let i = 1; i < objs.length; i += 1) {
      offsets[i] = out.length;
      out += `${i} 0 obj\n${objs[i]}\nendobj\n`;
    }
    const xref = out.length;
    out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objs.length; i += 1) out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return latin1Bytes(out);
  }

  function latin1(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + 8192)));
    return s;
  }

  // S1 bytes are accepted only when they carry the combinations section and no placeholder tokens.
  // Image XObject streams are binary JPEG, so they are stripped before the placeholder token scan.
  function validPdfBytes(bytes) {
    if (!bytes || typeof bytes.length !== "number" || bytes.length < 16) return false;
    const s = latin1(bytes);
    const text = s.replace(/\/Subtype \/Image[^]*?endstream/g, "");
    return s.startsWith("%PDF-") && /strike\s*&\s*offense combinations/i.test(text) && !/undefined|NaN|Unnamed Hero/.test(text);
  }

  function exportPdfBytes() {
    const payload = buildPdfPayload();
    const api = playbookApi();
    if (api && typeof api.generateCharacterPdfBytes === "function") {
      try {
        const bytes = api.generateCharacterPdfBytes(payload);
        if (validPdfBytes(bytes)) return bytes;
      } catch (err) {
        console.error(err);
      }
    }
    return localPdfBytes(payload);
  }

  // Unified export path: waits for the grayscale portrait so Print and Export PDF ship identical bytes.
  async function exportPdfBytesAsync() {
    const b = currentBuild();
    try {
      if (b.sp && b.cl) await prepareGrayscalePortrait(b.sp.id, b.cl.id);
    } catch (err) {
      console.error(err);
    }
    return exportPdfBytes();
  }

  function slugify(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character";
  }

  async function downloadPdf() {
    try {
      const bytes = await exportPdfBytesAsync();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(state.charName)}-lv${state.level}-2024-sheet.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast("Exported 2024 PDF character sheet");
    } catch (err) {
      console.error(err);
      showToast("PDF export failed");
    }
  }

  function buildPrintSheet() {
    if (!el.printView) return "";
    const P = buildPdfPayload();
    const li = (items) => `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    const cell = (l, v) => `<div class="pcell"><span>${esc(l)}</span><strong>${esc(v === null || v === undefined ? "" : String(v))}</strong></div>`;
    const abil = ABILITIES.map((ab) => {
      const sv = P.saves.find((s) => s.stat === ab);
      const sk = P.skills.filter((s) => s.stat === ab);
      return `<div class="pab"><h3>${esc(statLabel(ab))} <small>${numTxt(P.scores[ab])} ${sgnTxt(P.mods[ab])}</small></h3><ul>${[{ name: "Saving Throw", proficient: sv.proficient, bonus: sv.bonus }, ...sk].map((s) => `<li>${s.proficient ? "●" : "○"} ${esc(s.name)} <b>${sgnTxt(s.bonus)}</b></li>`).join("")}</ul></div>`;
    }).join("");
    const b = currentBuild();
    const gp = cachedPortrait(b.sp, b.cl);
    const portraitHtml = b.sp && b.cl
      ? `<figure class="print-portrait"><img src="${esc(gp ? gp.dataUrl : portraitSrc(b.sp.id, b.cl.id))}" alt="${esc(`${P.species} ${P.className} portrait`)}" class="${gp ? "is-baked" : "is-filtered"}" /></figure>`
      : "";
    el.printView.innerHTML = `
      <section class="print-page">
        <h1>D&amp;D 2024 Character Sheet</h1>
        ${portraitHtml}
        <div class="pgrid">${cell("Character Name", P.name)}${cell("Class & Level", `${P.className} ${P.level}`)}${cell("Subclass", P.subclass)}${cell("Species", P.subrace ? `${P.species} · ${P.subrace}` : P.species)}${cell("Background", P.background)}${cell("Alignment", P.alignment)}</div>
        <div class="pgrid">${cell("Armor Class", P.vitals.ac)}${cell("Initiative", sgnTxt(P.vitals.initiative))}${cell("Speed", P.vitals.speed)}${cell("Proficiency", sgnTxt(P.pb))}${cell("HP Max", P.vitals.hpMax)}${cell("Hit Dice", P.vitals.hitDice)}${cell("Passive Perception", P.vitals.passivePerception)}</div>
        <div class="pabil">${abil}</div>
        <h2>Weapons &amp; Damage Cantrips</h2>${li(P.attacks.map((a) => `${a.name} · ${a.toHitOrDc} · ${a.damage} · ${a.notes}`))}
        <h2>Class Features</h2>${li(P.classFeatures.map((f) => `${f.name}: ${f.detail}`))}
        <h2>Species Traits</h2>${li(P.speciesTraits.map((f) => `${f.name}: ${f.detail}`))}
      </section>
      <section class="print-page">
        <h1>Spellcasting, Personality &amp; Inventory</h1>
        ${P.canCast ? `<div class="pgrid">${cell("Ability", P.spellcasting.ability)}${cell("Save DC", P.spellcasting.saveDc)}${cell("Attack", sgnTxt(P.spellcasting.attackBonus))}${cell("Slots", P.spellcasting.slots.map((s) => `L${s.level}×${s.count}`).join(" "))}</div>` : "<p>No combat spellcasting for this build.</p>"}
        <h2>Personality</h2>${li([`Trait: ${P.rp.trait}`, `Ideal: ${P.rp.ideal}`, `Bond: ${P.rp.bond}`, `Flaw: ${P.rp.flaw}`])}
        <h2>Backstory</h2><p>${esc(P.rp.backstory)}</p>
        <h2>Equipment</h2>${li(P.equipment)}
        <div class="pgrid">${["cp", "sp", "ep", "gp", "pp"].map((c) => cell(c.toUpperCase(), P.coins[c])).join("")}</div>
        <h2>Attunement</h2>${li(P.attunement)}
      </section>
      <section class="print-page">
        <h1>Character Playbook: Strike &amp; Defense Combinations</h1>
        <h2>Strike &amp; Offense Combinations</h2>${li(P.playbook.strikeCombos.map((c) => `${c.name} [${c.economy}; ${c.cost}] — ${c.formula}: ${c.howToUse}`))}
        <h2>Defense &amp; Reaction Combinations</h2>${li(P.playbook.defenseCombos.map((c) => `${c.name} [${c.trigger}; ${c.cost}] — ${c.formula}: ${c.howToUse}`))}
        <h2>Rule Interactions</h2>${li(P.playbook.ruleNotes)}
      </section>`;
    return el.printView.innerHTML;
  }

  function syncLevelUi(p) {
    if (el.levelSlider) el.levelSlider.value = String(state.level);
    if (el.levelVal) el.levelVal.textContent = String(state.level);
    if (el.pbVal) el.pbVal.textContent = `PB +${p ? p.pb : pbFor(state.level)}`;
    if (el.levelSlider) el.levelSlider.style.setProperty("--lvl-pct", levelPct(state.level));
    const dec = document.getElementById("lvl-dec");
    const inc = document.getElementById("lvl-inc");
    if (dec) dec.disabled = state.level <= 1;
    if (inc) inc.disabled = state.level >= 20;
  }

  function levelPct(lvl) {
    return `${((clamp(Number(lvl) || 1, 1, 20) - 1) / 19) * 100}%`;
  }

  // 2D fallback face for dice without a 3D mesh.
  function draw2DDie(canvas, sides, value, landed, spin) {
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const n = sides === 4 ? 3 : sides === 12 ? 5 : sides === 8 ? 4 : sides === 10 ? 5 : 6;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(spin || 0);
    ctx.beginPath();
    for (let i = 0; i < n; i += 1) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const r = w * 0.42;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = landed ? "#3a2f12" : "#1b2130";
    ctx.strokeStyle = landed ? "#f5c451" : "#8a93a8";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = landed ? "#ffe39a" : "#e6e9f0";
    ctx.font = `bold ${sides === 4 ? 30 : 26}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(value || sides), w / 2, h / 2 + (sides === 4 ? 8 : 0));
  }

  function renderAll() {
    const guard = (fn) => { try { fn(); } catch (err) { console.error(err); } };
    state.previewKey = null;
    guard(applyRoleUi);
    guard(renderSelectors);
    const p = currentProfile();
    guard(() => updateStage(p, null));
    guard(() => syncLevelUi(p));
    renderDetails();
    if (state.builderOpen) guard(() => renderSheetTab(p));
    guard(() => renderPlaybookTab(p));
    guard(renderRollTray);
    guard(() => { const b = currentBuild(); prewarmPortrait(b.sp, b.cl); });
  }

  function exactSpinTarget(cur, target, period, cycles) {
    const base = cur + cycles * period;
    const k = Math.ceil((base - target) / period);
    return target + k * period;
  }

  // Smooth table-friction deceleration so Cycle 1 spins fast, Cycle 2 slows, and Cycle 3 settles onto the face.
  function naturalDieEase(p) {
    return 1 - Math.pow(1 - p, 2.55);
  }

  const rollTokens = emptyDiceMap(0);
  const queuedDieRolls = emptyDiceMap(0);

  function triggerDieRoll(sides) {
    if (state.dice.rollingDie === sides) {
      const ab = sides === 6 && state.builderOpen && state.statMode === "rolled" ? state.activeRollSlot : null;
      const cap = ab ? Math.max(0, 3 - state.abilityRolls[ab].length) : 1;
      if (queuedDieRolls[sides] < cap) queuedDieRolls[sides] += 1;
      return;
    }
    const tok = (rollTokens[sides] += 1);
    const cycles = 2 + Math.floor(Math.random() * 2);
    const dur = Math.round(620 + cycles * 220 + Math.random() * 90);
    const finalVal = rollUniform(sides);
    const t0 = performance.now();

    state.dice.rollingDie = sides;
    state.dice.landed[sides] = false;
    let settled = false;

    const settle = (snapPose) => {
      if (settled) return;
      settled = true;
      if (snapPose) state.dice.poses[sides] = snapPose;
      state.dice.values[sides] = finalVal;
      state.dice.landed[sides] = true;
      if (state.dice.rollingDie === sides) state.dice.rollingDie = null;
      state.dice.history = [{ sides, val: finalVal }, ...state.dice.history].slice(0, 12);
      if (sides === 6 && feedRollSlot(finalVal)) {
        saveSheet();
        renderSheetTab();
      }
      renderDiceTab();
      if (queuedDieRolls[sides] > 0) {
        queuedDieRolls[sides] -= 1;
        requestAnimationFrame(() => triggerDieRoll(sides));
      }
    };

    if (sides === 6) {
      const start = { ...state.dice.poses[6] };
      const [baseRx, baseRy] = CUBE_FACE_ANGLES[finalVal];
      const endRx = exactSpinTarget(start.rx, baseRx, 360, cycles);
      const endRy = exactSpinTarget(start.ry, baseRy, 360, cycles + (Math.random() < 0.5 ? 0 : 1));
      const endTx = -14;
      const endTy = 18;
      const snapPose = { rx: baseRx, ry: baseRy, tx: endTx, ty: endTy };

      if (state.builderOpen && state.statMode === "rolled" && state.activeRollSlot) renderSheetTab();
      renderDiceTab();

      function stepCube(now) {
        if (rollTokens[6] !== tok || settled) return;
        const p = Math.min(1, (now - t0) / dur);
        const ease = naturalDieEase(p);
        state.dice.poses[6] = {
          rx: start.rx + (endRx - start.rx) * ease,
          ry: start.ry + (endRy - start.ry) * ease,
          tx: start.tx + (endTx - start.tx) * ease,
          ty: start.ty + (endTy - start.ty) * ease
        };
        const cubeEl = document.querySelector('[data-cube-3d="6"]');
        if (cubeEl) cubeEl.style.transform = cubeTransform(state.dice.poses[6]);
        if (p < 1) {
          requestAnimationFrame(stepCube);
        } else {
          settle(snapPose);
        }
      }
      requestAnimationFrame(stepCube);
      return;
    }

    const TAU = Math.PI * 2;
    const startPose = { ...state.dice.poses[sides] };
    const meshOk = Boolean(window.DICE_3D && window.DICE_3D.MESHES && window.DICE_3D.MESHES[sides]);
    const land = (meshOk && window.DICE_3D.getLandingPose(sides, finalVal)) || { rx: 0, ry: 0, rz: Math.random() * TAU };
    const endRx = exactSpinTarget(startPose.rx, land.rx, TAU, cycles);
    const endRy = exactSpinTarget(startPose.ry, land.ry, TAU, cycles + (Math.random() < 0.5 ? 0 : 1));
    const endRz = exactSpinTarget(startPose.rz, land.rz, TAU, Math.max(1, cycles - 1));
    const snapPose = { rx: land.rx, ry: land.ry, rz: land.rz };
    renderDiceTab();

    function step(now) {
      if (rollTokens[sides] !== tok || settled) return;
      const p = Math.min(1, (now - t0) / dur);
      const ease = naturalDieEase(p);
      state.dice.poses[sides] = {
        rx: startPose.rx + (endRx - startPose.rx) * ease,
        ry: startPose.ry + (endRy - startPose.ry) * ease,
        rz: startPose.rz + (endRz - startPose.rz) * ease
      };
      if (p < 1) {
        paintCanvasDice();
        requestAnimationFrame(step);
      } else {
        settle(snapPose);
      }
    }
    requestAnimationFrame(step);
  }

  el.speciesGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-species]");
    if (!card) return;
    state.speciesId = card.dataset.species;
    state.subraceId = SUBRACES[state.speciesId]?.[0]?.id || null;
    pruneStaleSkillPicks();
    renderAll();
  });


  el.subraceStrip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-subrace]");
    if (!btn) return;
    state.subraceId = btn.dataset.subrace;
    pruneStaleSkillPicks();
    renderAll();
  });

  el.classGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-class]");
    if (!card) return;
    state.classId = card.dataset.class;
    state.subclassId = SUBCLASSES[state.classId]?.[0]?.id || null;
    pruneStaleSkillPicks();
    renderAll();
  });

  el.subclassStrip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-subclass]");
    if (!btn) return;
    state.subclassId = btn.dataset.subclass;
    renderAll();
  });

  function applyCard(card) {
    state.speciesId = card.dataset.applySp;
    state.subraceId = card.dataset.applySr || SUBRACES[state.speciesId]?.[0]?.id;
    state.classId = card.dataset.applyCl;
    state.subclassId = card.dataset.applySc || SUBCLASSES[state.classId]?.[0]?.id;
    pruneStaleSkillPicks();
    renderAll();
    showToast("Applied suggested combination");
  }

  if (el.upgrades) {
    el.upgrades.addEventListener("click", (e) => {
      const card = e.target.closest("[data-apply-sp]");
      if (card) applyCard(card);
    });
    let upHoverTimer = null;
    const scheduleUpPreview = (build, delayMs) => {
      clearTimeout(upHoverTimer);
      if (delayMs <= 0) { setPreview(build); return; }
      upHoverTimer = setTimeout(() => setPreview(build), delayMs);
    };
    const onUpEnter = (e) => {
      const card = e.target.closest("[data-apply-sp]");
      if (!card) return;
      scheduleUpPreview(buildFromApplyCard(card), 38);
    };
    el.upgrades.addEventListener("click", () => { clearTimeout(upHoverTimer); });
    el.upgrades.addEventListener("mouseover", onUpEnter);
    el.upgrades.addEventListener("focusin", onUpEnter);
    el.upgrades.addEventListener("mouseleave", () => scheduleUpPreview(null, 55));
    el.upgrades.addEventListener("focusout", (e) => {
      if (!el.upgrades.contains(e.relatedTarget)) scheduleUpPreview(null, 0);
    });
  }

  function activateTab(name) {
    if (!name) return;
    state.activeTab = name;
    el.tabs.forEach((t) => {
      const active = t.dataset.tab === name;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("#workspace .tab-content").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${name}`);
    });
  }

  if (el.tabBar) {
    el.tabBar.addEventListener("click", (e) => {
      const tab = e.target instanceof Element ? e.target.closest(".tab[data-tab]") : null;
      if (tab) activateTab(tab.dataset.tab);
    });
  }

  el.tabRoleplay.addEventListener("click", (e) => {
    const sp = SPECIES.find((s) => s.id === state.speciesId);
    const cl = CLASSES.find((c) => c.id === state.classId);
    const matrix = buildRoleplayMatrix(sp, getActiveSubrace(sp), cl, getActiveSubclass(cl), computeCombo(sp, getActiveSubrace(sp), cl, getActiveSubclass(cl)));
    const lens = { trait: matrix.traits.length, ideal: matrix.ideals.length, bond: matrix.bonds.length, flaw: matrix.flaws.length };

    const lockBtn = e.target.closest("[data-rp-lock]");
    if (lockBtn) { state.rp[lockBtn.dataset.rpLock].locked = !state.rp[lockBtn.dataset.rpLock].locked; renderDetails(); return; }
    const rollBtn = e.target.closest("[data-rp-roll]");
    if (rollBtn) { const k = rollBtn.dataset.rpRoll; state.rp[k].idx = (state.rp[k].idx + 1 + Math.floor(Math.random() * Math.max(1, lens[k] - 1))) % lens[k]; renderDetails(); return; }
    const pickBtn = e.target.closest("[data-rp-pick]");
    if (pickBtn) { state.rp[pickBtn.dataset.rpPick].idx = Number(pickBtn.dataset.idx); renderDetails(); return; }
    if (e.target.closest("#btn-reroll-rp")) {
      Object.keys(lens).forEach((k) => { if (!state.rp[k].locked) state.rp[k].idx = Math.floor(Math.random() * lens[k]); });
      renderDetails();
    }
  });

  el.tabDice.addEventListener("click", (e) => {
    const dieBtn = e.target.closest("[data-roll-die]");
    if (dieBtn) { triggerDieRoll(Number(dieBtn.dataset.rollDie)); return; }
    if (e.target.closest("#btn-clear-dice")) {
      state.dice.history = [];
      state.dice.values = emptyDiceMap(null);
      state.dice.landed = emptyDiceMap(false);
      renderDiceTab();
    }
  });

  el.tabDice.addEventListener("wheel", (e) => {
    const dieBtn = e.target.closest("[data-roll-die]");
    if (!dieBtn) return;
    e.preventDefault();
    const sides = Number(dieBtn.dataset.rollDie);
    if (state.dice.rollingDie === sides) return;
    const dx = e.deltaX;
    const dy = e.deltaY;
    if (sides === 6) {
      const p = state.dice.poses[6];
      p.tx -= dy * 0.42;
      p.ty += (Math.abs(dx) > 2 ? dx : dy * 0.65) * 0.52;
      const cubeEl = dieBtn.querySelector('[data-cube-3d="6"]');
      if (cubeEl) cubeEl.style.transform = cubeTransform(p);
      return;
    }
    const pose = state.dice.poses[sides];
    pose.rx += dy * 0.008;
    pose.ry += (Math.abs(dx) > 2 ? dx : dy * 0.65) * 0.011;
    paintCanvasDice();
  }, { passive: false });

  if (el.levelSlider) {
    el.levelSlider.addEventListener("input", () => {
      state.level = clamp(Number(el.levelSlider.value) || 1, 1, 20);
      saveSheet();
      renderAll();
    });
  }

  // Sync raw skill picks to the validated sheet so no orphaned or overlapped entries remain.
  function pruneStaleSkillPicks() {
    const b = currentBuild();
    if (!b.sp || !b.cl) return;
    try {
      const ss = skillSheet(sheetProfile());
      state.pickedSpeciesSkills = ss.free;
      state.pickedClassSkills = ss.picks;
    } catch (err) {
      console.error(err);
    }
  }

  // Toggle a skill; at cap the oldest pick is replaced instead of ignoring the click.
  function toggleSkillFifo(list, item, cap) {
    const cur = arr(list);
    if (cur.includes(item)) return cur.filter((n) => n !== item);
    const max = Number(cap) || 0;
    if (max <= 0) return [];
    if (cur.length >= max) return [...cur.slice(cur.length - max + 1), item];
    return [...cur, item];
  }

  // Shared class skill toggle for Builder Step 3 and the forge skills tab.
  function pickClassSkill(name) {
    const ss = skillSheet(sheetProfile());
    if (ss.pool.includes(name) && !ss.spSkills.includes(name) && !ss.bgSkills.includes(name) && !ss.free.includes(name)) {
      state.pickedClassSkills = toggleSkillFifo(ss.picks, name, ss.cap);
      return true;
    }
    state.pickedClassSkills = ss.picks;
    return false;
  }

  function toggleIn(list, item, cap) {
    const cur = arr(list);
    if (cur.includes(item)) return cur.filter((n) => n !== item);
    return Number.isFinite(cap) && cur.length >= cap ? cur : [...cur, item];
  }

  function onBuilderClick(e) {
    const t = e.target instanceof Element ? e.target : null;
    if (!t || t.closest("[data-roll-spec]")) return;
    const hit = (sel) => t.closest(sel);
    let b;
    if (hit("[data-sheet-name-roll]")) {
      const sp = SPECIES.find((s) => s.id === state.speciesId);
      const bank = arr(sp && NAME_BANK[sp.id]).length ? arr(NAME_BANK[sp.id]) : FALLBACK_NAMES;
      state.charName = bank[Math.floor(Math.random() * bank.length)];
      sheetMutate(false);
    } else if (hit("[data-sheet-reset]")) {
      resetSheet();
      sheetMutate(true);
    } else if ((b = hit("[data-stat-mode]"))) {
      state.statMode = b.dataset.statMode;
      state.swapFrom = null;
      if (state.statMode === "rolled") {
        syncRolledScores();
        state.activeRollSlot = nextOpenSlot();
      } else {
        state.assignedScores = blankScoreMap(null);
        state.activeRollSlot = null;
      }
      sheetMutate(true);
    } else if ((b = hit("[data-clear-slot]"))) {
      clearRollSlot(b.dataset.clearSlot);
      sheetMutate(false);
    } else if ((b = hit("[data-swap-slot]"))) {
      pickSwapSlot(b.dataset.swapSlot);
      sheetMutate(false);
    } else if ((b = hit("[data-roll-slot]"))) {
      armRollSlot(b.dataset.rollSlot);
      sheetMutate(false);
    } else if (hit("[data-reroll-all]")) {
      rerollAll();
      sheetMutate(true);
    } else if ((b = hit("[data-pb-adj]"))) {
      const ab = b.dataset.pbAdj;
      const next = { ...state.pointBuyScores, [ab]: state.pointBuyScores[ab] + Number(b.dataset.delta) };
      if (next[ab] >= 8 && next[ab] <= 15 && pointBuySpent(next) <= POINT_BUDGET) {
        state.pointBuyScores = next;
        sheetMutate(true);
      }
    } else if (hit("[data-auto-assign]")) {
      if (autoAssign()) sheetMutate(true);
    } else if (hit("[data-clear-assign]")) {
      state.assignedScores = blankScoreMap(null);
      if (state.statMode === "rolled") {
        state.abilityRolls = blankRollMap();
        state.swapFrom = null;
        syncRolledScores();
        state.activeRollSlot = nextOpenSlot();
      }
      sheetMutate(true);
    } else if ((b = hit("[data-jump-step]"))) {
      jumpToStep(b.dataset.jumpStep);
    } else if ((b = hit("[data-export-anyway]"))) {
      requestExport(b.dataset.exportAnyway || state.gateOpen || "pdf", true);
    } else if ((b = hit("[data-export]"))) {
      requestExport(b.dataset.export);
    } else if (hit("[data-gate-close]")) {
      state.gateOpen = null;
      renderBuilderChrome(null);
    } else if ((b = hit("[data-hp-step]"))) {
      const d = Number(b.dataset.hpStep);
      applyHp(d < 0 ? "damage" : "heal", Math.abs(d));
      sheetMutate(false);
    } else if ((b = hit("[data-hp-apply]"))) {
      const inp = el.builderView.querySelector("#hp-amount");
      applyHp(b.dataset.hpApply, inp ? inp.value : 0);
      sheetMutate(false);
    } else if ((b = hit("[data-death]"))) {
      const key = b.dataset.death === "pass" ? "deathPass" : "deathFail";
      const i = Number(b.dataset.idx);
      state.session[key] = state.session[key] >= i ? i - 1 : i;
      sheetMutate(false);
    } else if ((b = hit("[data-res]"))) {
      state.session.resourcesUsed = Math.max(0, (state.session.resourcesUsed || 0) + (b.dataset.res === "use" ? 1 : -1));
      sheetMutate(false);
    } else if ((b = hit("[data-rest]"))) {
      if (b.dataset.rest === "short") shortRest();
      else { longRest(); showToast("Long Rest · HP, Hit Dice, and resources restored"); }
      sheetMutate(false);
    } else if (hit("[data-crit-toggle]")) {
      state.critToggle = !state.critToggle;
      sheetMutate(false);
    }
  }

  function onBuilderChange(e) {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const d = t.dataset;
    if (d.assign) {
      const v = Number(t.value);
      state.assignedScores = { ...state.assignedScores, [d.assign]: t.value !== "" && Number.isInteger(v) ? v : null };
      sheetMutate(true);
    } else if (d.flex) {
      const p = sheetProfile();
      const rule = flexRule(p.sp, p.sr);
      state.flexAsiPicks = toggleIn(validFlexPicks(p.sp, p.sr), d.flex, rule ? rule.count : 0);
      sheetMutate(true);
    } else if (d.classSkill) {
      pickClassSkill(d.classSkill);
      sheetMutate(false);
    } else if (d.speciesSkill) {
      const ss = skillSheet(sheetProfile());
      const s = d.speciesSkill;
      if (SKILL_NAMES.includes(s) && !ss.spSkills.includes(s) && !ss.bgSkills.includes(s)) {
        state.pickedSpeciesSkills = toggleSkillFifo(ss.free, s, ss.freeCap);
      } else {
        state.pickedSpeciesSkills = ss.free;
      }
      // Drop class picks now shadowed by a species pick.
      state.pickedClassSkills = skillSheet(sheetProfile()).picks;
      sheetMutate(false);
    } else if (d.equipGroup !== undefined) {
      setEquipPick(sheetProfile().cl, Number(d.equipGroup), t.value);
      sheetMutate(false);
    } else if (t.id === "sheet-bg" || d.bgSelect !== undefined) {
      state.bgId = t.value;
      pruneStaleSkillPicks();
      sheetMutate(true);
    } else if (t.id === "sheet-align" || d.alignSelect !== undefined) {
      state.alignment = t.value;
      sheetMutate(false);
    } else if (d.rpSuggest) {
      const list = rpSuggestions(sheetProfile())[d.rpSuggest] || [];
      const pick = list[Number(t.value)];
      if (t.value !== "" && pick) {
        state.rpCustom[d.rpSuggest] = pick;
        sheetMutate(false);
      }
    } else if (d.bindCheck) {
      if (setBound(d.bindCheck, Boolean(t.checked))) sheetMutate(false);
    }
  }

  function onBuilderInput(e) {
    const t = e.target instanceof Element ? e.target : null;
    if (!t || !t.dataset.bind) return;
    if (setBound(t.dataset.bind, String(t.value))) {
      saveSheet();
      refreshBuilderLive();
    }
  }

  if (el.tabSkills) {
    el.tabSkills.addEventListener("click", (e) => {
      const btn = e.target instanceof Element ? e.target.closest("[data-forge-class-skill]") : null;
      if (!btn || btn.disabled) return;
      pickClassSkill(btn.dataset.forgeClassSkill);
      saveSheet();
      renderAll();
    });
  }

  if (el.builderView) {
    el.builderView.addEventListener("click", onBuilderClick);
    el.builderView.addEventListener("change", onBuilderChange);
    el.builderView.addEventListener("input", onBuilderInput);
  }

  if (el.btnExportPdf) el.btnExportPdf.addEventListener("click", () => requestExport("pdf"));
  if (el.btnPrint) el.btnPrint.addEventListener("click", () => requestExport("print"));
  if (el.btnOpenBuilder) el.btnOpenBuilder.addEventListener("click", () => openBuilder());
  if (el.btnCloseBuilder) el.btnCloseBuilder.addEventListener("click", () => closeBuilder());

  function stepLevel(delta) {
    const next = clamp(state.level + delta, 1, 20);
    if (next === state.level) return;
    state.level = next;
    saveSheet();
    renderAll();
  }
  if (el.lvlDec) el.lvlDec.addEventListener("click", () => stepLevel(-1));
  if (el.lvlInc) el.lvlInc.addEventListener("click", () => stepLevel(1));

  el.btnRandomize.addEventListener("click", () => {
    state.speciesId = SPECIES[Math.floor(Math.random() * SPECIES.length)].id;
    const srs = SUBRACES[state.speciesId] || [];
    state.subraceId = srs[Math.floor(Math.random() * srs.length)]?.id || null;
    state.classId = CLASSES[Math.floor(Math.random() * CLASSES.length)].id;
    const scs = SUBCLASSES[state.classId] || [];
    state.subclassId = scs[Math.floor(Math.random() * scs.length)]?.id || null;
    pruneStaleSkillPicks();
    renderAll();
    showToast(`Forged ${getActiveSubrace(SPECIES.find((s) => s.id === state.speciesId))?.name || ""} ${getActiveSubclass(CLASSES.find((c) => c.id === state.classId))?.name || ""}`);
  });

  function summaryText() {
    const d = buildPdfPayload();
    const v = d.vitals;
    const n = (x) => (Number.isFinite(x) ? signed(x) : "—");
    const lines = [
      `# ${d.name || "Name not set"} · Level ${d.level} ${d.subclass ? `${d.subclass} ` : ""}${d.className}`,
      `${d.subrace || d.species} · ${d.background || "No background"} · ${d.alignment || "No alignment"}`,
      `AC ${v.ac ?? "—"} · HP ${v.hpMax ?? "—"} · Init ${n(v.initiative)} · Speed ${v.speed} · PB +${d.pb}`,
      `Abilities: ${ABILITIES.map((ab) => `${ab} ${d.scores[ab] ?? "—"} ${n(d.mods[ab])}`).join(" | ")}`,
      `Saves: ${d.saves.map((x) => `${x.proficient ? "●" : "○"} ${x.stat} ${n(x.bonus)}`).join(" | ")}`,
      `Skills: ${d.skills.filter((x) => x.proficient).map((x) => `${x.name} ${n(x.bonus)}`).join(", ") || "None chosen"}`
    ];
    return lines.join("\n");
  }

  el.btnCopy.addEventListener("click", async () => {
    let text = "";
    try { text = summaryText(); } catch (err) { console.error(err); text = "Character sheet"; }
    try { await navigator.clipboard.writeText(text); showToast("Build sheet copied"); }
    catch { showToast("Clipboard blocked"); }
  });

  let hoverTimer = null;
  function scheduleHoverPreview(build, delayMs) {
    clearTimeout(hoverTimer);
    if (delayMs <= 0) {
      setPreview(build);
      return;
    }
    hoverTimer = setTimeout(() => setPreview(build), delayMs);
  }

  [el.speciesGrid, el.subraceStrip, el.classGrid, el.subclassStrip].forEach((container) => {
    let pointerDown = false;
    const onEnter = (e) => {
      if (e.type === "focusin" && pointerDown) return;
      const build = buildFromTarget(e.target);
      if (!build) return;
      scheduleHoverPreview(build, e.type === "focusin" ? 0 : 38);
    };
    container.addEventListener("mousedown", () => {
      pointerDown = true;
      clearTimeout(hoverTimer);
    });
    container.addEventListener("click", (e) => {
      pointerDown = false;
      clearTimeout(hoverTimer);
      const card = e.target instanceof Element ? e.target.closest("button, [tabindex]") : null;
      if (card && typeof card.blur === "function") card.blur();
      setPreview(null);
    });
    container.addEventListener("mouseover", onEnter);
    container.addEventListener("focusin", onEnter);
    container.addEventListener("mouseleave", () => scheduleHoverPreview(null, 55));
    container.addEventListener("focusout", (e) => {
      if (!container.contains(e.relatedTarget)) scheduleHoverPreview(null, 0);
    });
  });

  // Single floating tooltip so labels inside clipped cards still show their D&D meaning.
  // The native title is parked while hovering to avoid a duplicate browser tooltip.
  function initDndTooltip() {
    const tip = document.createElement("div");
    tip.className = "dnd-tooltip";
    tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);
    let active = null;

    function hide() {
      if (active && active.dataset.dndTitle !== undefined) {
        active.setAttribute("title", active.dataset.dndTitle);
        delete active.dataset.dndTitle;
      }
      active = null;
      tip.classList.remove("show");
    }

    function show(target) {
      if (target === active) return;
      hide();
      active = target;
      if (target.hasAttribute("title")) {
        target.dataset.dndTitle = target.getAttribute("title");
        target.removeAttribute("title");
      }
      tip.textContent = target.dataset.dndTip;
      tip.classList.add("show");
      const r = target.getBoundingClientRect();
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      const gap = 8;
      const left = clamp(r.left + r.width / 2 - tw / 2, gap, Math.max(gap, window.innerWidth - tw - gap));
      const top = r.top - th - gap >= gap ? r.top - th - gap : r.bottom + gap;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    }

    function onOver(e) {
      const target = e.target instanceof Element ? e.target.closest("[data-dnd-tip]") : null;
      if (target) show(target);
      else if (active) hide();
    }

    document.addEventListener("mouseover", onOver);
    document.addEventListener("focusin", onOver);
    document.addEventListener("scroll", hide, true);
    window.addEventListener("blur", hide);
    return { show, hide, el: tip, get active() { return active; } };
  }

  initStage();
  renderAll();
  const dndTooltip = initDndTooltip();

  // Read-only hook for headless verification of stat labeling helpers.
  window.FORGE_UI = {
    STAT_META, RATINGS, statLabel, statTip, statTerm, ratingTerm, statTerms, plainStats, annotateStats, getLoadout, loadoutRowHtml, dndTooltip,
    computeProfile, abilityOrder, visionBadge, acValue, attackStat, dcStat, buildDiceRows, buildActionRows, buildIdentity, combatActions,
    renderAll, setPreview, currentProfile, state,
    buildPdfPayload, exportPdfBytes, buildPrintSheet, rollSpec, renderSheetTab, renderPlaybookTab, saveSheet, evaluatePlaybookSafe,
    skillSheet, rerollAll, swapRolled, shortRest, longRest, applyHp, pointBuySpent, pbFor, progFor,
    contextualActions, localCombinations, combinationsPlaybookSafe, levelPct, sheetProfile, builderStatus, openBuilder, closeBuilder,
    requestExport, validPdfBytes, scrubPayload, activateTab, summaryText, autoAssign, equipState, rpSuggestions,
    scoreRollSet, syncRolledScores, nextOpenSlot, armRollSlot, clearRollSlot, pickSwapSlot, feedRollSlot, migrateLegacyRolls, sanitizeStored, triggerDieRoll, renderDiceTab,
    prepareGrayscalePortrait, exportPdfBytesAsync, downloadPdf, printSheet, localPdfBytes, printGray, portraitCrop, portraitGrayCache
  };
})();
