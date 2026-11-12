window.FORGE_DATA = {
  SPECIES: [
    {
      id: "human",
      name: "Human",
      icon: "🛡️",
      speed: 30,
      size: "Medium",
      asi: ["STR", "DEX", "CON", "INT", "WIS", "CHA"],
      asiNote: "All +1, or Variant +1/+1 + Bonus Feat",
      vision: "Normal",
      skills: [],
      traits: [
        { name: "Bonus Feat Option", detail: "Level 1 feat unlocks build-defining engines immediately." },
        { name: "Versatile Skill", detail: "Covers key class blind spots without multiclass tax." }
      ],
      tags: ["feat-engine", "flexible", "no-darkvision"],
      rp: {
        traits: [
          "Treats a single short human lifetime as an urgent deadline to leave a mark.",
          "Collects customs from longer-lived folk out of quiet envy and curiosity."
        ],
        ideals: [
          { tag: "Ambition", text: "Legacy. A name remembered outlives empires built by immortals." },
          { tag: "Pragmatism", text: "Adaptability. Tradition is armor until it slows your stride." }
        ],
        bonds: [
          "Carries a worn ledger naming everyone who financed their first expedition.",
          "Swore to retire an old family debt before their hair turns gray."
        ],
        flaws: [
          "Rushes high-stakes choices because patience feels like a luxury for elves.",
          "Underestimates ancient blood feuds, treating centuries-old grudges as petty."
        ]
      },
      source: "PHB p.29",
      lore: "Humans are the youngest and most widespread of the common races, short-lived folk of every build and culture who spread across the world through sheer ambition. Their brief lifespans drive them to innovate, conquer, and adventure so their names outlast them.",
      baseAsi: {}
    },
    {
      id: "elf",
      name: "Elf",
      icon: "🌙",
      speed: 30,
      size: "Medium",
      asi: ["DEX", "INT", "WIS"],
      asiNote: "DEX +2, Sub-Race +1",
      vision: "Darkvision 60 ft",
      skills: ["Perception"],
      traits: [
        { name: "Fey Ancestry", detail: "Advantage vs charm and immunity to magical sleep." },
        { name: "Trance", detail: "4-hour long rest grants extra watch, crafting, or spell prep time." },
        { name: "Keen Senses", detail: "Guaranteed Perception proficiency frees up class picks." }
      ],
      tags: ["perception", "trance-craft", "fey-ancestry", "dex-lean"],
      rp: {
        traits: [
          "Speaks of decades-old skirmishes as if they happened before breakfast.",
          "Remembers slights politely, waiting years for the exact social opening."
        ],
        ideals: [
          { tag: "Grace", text: "Precision. Wasted motion is an insult to both craft and blade." },
          { tag: "Preservation", text: "Continuity. Guard beauty before short-lived wars erase it." }
        ],
        bonds: [
          "Guards a star-chart marking a grove only visible once every nineteen winters.",
          "Owes a mentorship century to an elder archivist who vanished."
        ],
        flaws: [
          "Struggles to take mortal emergencies seriously until collateral damage turns lethal.",
          "Can sound condescending even when genuinely offering tactical advice."
        ]
      },
      source: "PHB p.21",
      lore: "Elves are slender, graceful fey-touched people who live up to 750 years in forest realms and starlit cities steeped in magic, art, and song. They adventure out of wanderlust, keen curiosity, or the need to defend an ancient homeland across centuries of calm perspective.",
      baseAsi: { DEX: 2 }
    },
    {
      id: "dwarf",
      name: "Dwarf",
      icon: "⛏️",
      speed: 25,
      size: "Medium",
      asi: ["CON", "STR", "WIS"],
      asiNote: "CON +2, Sub-Race +1/+2",
      vision: "Darkvision 60 ft",
      skills: [],
      traits: [
        { name: "Dwarven Resilience", detail: "Advantage vs poison and resistance to poison damage." },
        { name: "Armor Stride", detail: "Heavy armor never slows base 25 ft speed, enabling STR dumps for casters." },
        { name: "Toughness / Gear", detail: "Hill adds +1 HP/level; Mountain gives Medium Armor + warhammer." }
      ],
      tags: ["con-tank", "poison-resist", "heavy-armor-caster"],
      rp: {
        traits: [
          "Evaluates bridges, vaults, and allies alike by looking for load-bearing cracks.",
          "Measures loyalty in kept appointments and repairs made without being asked."
        ],
        ideals: [
          { tag: "Honor", text: "Craftsmanship. Whatever bears your seal must survive the worst day." },
          { tag: "Steadfastness", text: "Endurance. Hold the stone until the line behind you reforms." }
        ],
        bonds: [
          "Still carries a cracked clan hammer waiting to be reforged in reclaimed halls.",
          "Keeps a carved stone tally of favors owed to surface companions."
        ],
        flaws: [
          "Refuses to abandon bad terrain or sunk-cost plans once pride is staked.",
          "Dismisses elegant improvisation as shoddy workmanship."
        ]
      },
      source: "PHB p.18",
      lore: "Dwarves are stout, bold, and hardy folk about 4 to 5 feet tall, carved from mountain stone and bound to clan, forge, and ancestral honor. They adventure for treasure, glory, or to settle long-held grudges, wielding axe and hammer with legendary resilience.",
      baseAsi: { CON: 2 }
    },
    {
      id: "halfling",
      name: "Halfling",
      icon: "🍀",
      speed: 25,
      size: "Small",
      asi: ["DEX", "CHA", "CON"],
      asiNote: "DEX +2, Sub-Race +1",
      vision: "Normal",
      skills: [],
      traits: [
        { name: "Lucky", detail: "Reroll natural 1s on attacks, checks, and saves; virtually kills crit-fails." },
        { name: "Brave", detail: "Advantage vs frightened; pairs cleanly with frontline or concentration roles." },
        { name: "Nimble / Naturally Stealthy", detail: "Move through larger foes and hide behind Medium allies." }
      ],
      tags: ["lucky-reroll", "small-mount", "stealth-cover", "no-darkvision"],
      rp: {
        traits: [
          "Defuses tavern brawls and dragon lairs alike with dry hospitality.",
          "Notices everyone's boots, coin pouches, and exits within three seconds."
        ],
        ideals: [
          { tag: "Kinship", text: "Hearth. Adventures only matter if someone comes home to tell them." },
          { tag: "Audacity", text: "Fortune. Big folk never watch their ankles until it is too late." }
        ],
        bonds: [
          "Sends half of every bounty back to fund a quiet river-ferry family inn.",
          "Protects a reckless taller friend who would have died twice without intervention."
        ],
        flaws: [
          "Mistakes sheer luck for sound tactical planning under lethal odds.",
          "Cannot resist pocket-sized curiosities left briefly unguarded."
        ]
      },
      source: "PHB p.26",
      lore: "Halflings are small, cheerful folk barely 3 feet tall who cherish hearth, home, good food, and close-knit communities over power or renown. They take to the road out of curiosity or loyalty, relying on uncanny luck and quiet courage when danger strikes.",
      baseAsi: { DEX: 2 },
      raceAction: {
        name: "Lucky",
        unlock: "Lv 1 · Always On",
        economy: "Passive",
        roll: "Reroll d20 nat 1",
        detail: "When you roll a natural 1 on an attack roll, ability check, or saving throw, reroll the die and use the new roll."
      }
    },
    {
      id: "dragonborn",
      name: "Dragonborn",
      icon: "🐉",
      speed: 30,
      size: "Medium",
      asi: ["STR", "CHA"],
      asiNote: "STR +2, CHA +1",
      vision: "Normal",
      skills: [],
      traits: [
        { name: "Breath Weapon", detail: "Short-rest AoE clears swarms and pairs with Dragon Fear feat." },
        { name: "Damage Resistance", detail: "Permanent elemental resistance tuned against campaign threats." },
        { name: "Draconic Presence", detail: "Natural STR/CHA split aligns with gish and frontliner faces." }
      ],
      tags: ["aoe-breath", "elemental-resist", "fear-feat", "no-darkvision"],
      rp: {
        traits: [
          "Maintains formal posture even while bleeding, treating panic as a clan disgrace.",
          "Speaks plainly and hates sly half-truths that waste breath."
        ],
        ideals: [
          { tag: "Dignity", text: "Self-Mastery. Power without discipline makes you a mere beast." },
          { tag: "Clan", text: "Service. Your deeds write the reputation of every scale-kin." }
        ],
        bonds: [
          "Seeks proof that an ancestral oath-breaker acted to save innocents.",
          "Bears an elemental scar tied to the storm that shattered their clutch."
        ],
        flaws: [
          "Treats tactical retreat as personal cowardice even when outnumbered.",
          "Holds rigid expectations of honor that strangers break effortlessly."
        ]
      },
      source: "PHB p.32",
      lore: "Dragonborn are tall, scaled humanoids born of draconic blood who carry the elemental breath and resistance of one ancestral dragon type. They live in proud clans where personal mastery and clan honor matter above all, and they adventure to prove worth and glory.",
      baseAsi: { STR: 2, CHA: 1 },
      raceAction: {
        name: "Breath Weapon",
        unlock: "Lv 1 · 1/Short Rest",
        economy: "Action",
        roll: "2d6 -> 5d6 AoE, DC 8+CON+PB",
        detail: "Exhale a 15 ft cone or 5x30 ft line of your ancestry's element; DEX or CON save for half. Damage rises to 3d6 at Lv 6, 4d6 at Lv 11, and 5d6 at Lv 16."
      }
    },
    {
      id: "gnome",
      name: "Gnome",
      icon: "⚙️",
      speed: 25,
      size: "Small",
      asi: ["INT", "CON", "DEX"],
      asiNote: "INT +2, Sub-Race +1",
      vision: "Darkvision 60 ft",
      skills: [],
      traits: [
        { name: "Gnome Cunning", detail: "Advantage on ALL INT, WIS, and CHA saves against magic." },
        { name: "Fade Away / Illusion Knack", detail: "Deep defensive utility against spellcasters and control." }
      ],
      tags: ["mental-saves", "small-chassis", "int-lean"],
      rp: {
        traits: [
          "Scribbles margins, diagrams, and weird footnotes on every map and wanted poster.",
          "Gets visibly excited when an enemy trap proves mechanically clever."
        ],
        ideals: [
          { tag: "Inquiry", text: "Wonder. Every locked door hides a question worth taking apart." },
          { tag: "Ingenuity", text: "Cleverness. Why match a giant's muscle when leverage wins cheap?" }
        ],
        bonds: [
          "Carries an unfinished clockwork prototype whose missing part is in enemy hands.",
          "Vowed to publish the field notes of a mentor silenced by a guild."
        ],
        flaws: [
          "Pokes cursed runes out of curiosity before checking for ward triggers.",
          "Over-explains edge-case mechanics while the party is trying to sneak."
        ]
      },
      source: "PHB p.35",
      lore: "Gnomes are small, energetic, and endlessly curious folk who live for centuries in hidden burrows, filling each day with invention, illusion, and laughter. They adventure to learn, tinker, and explore, protected by a mind uncommonly resistant to magic.",
      baseAsi: { INT: 2 },
      raceAction: {
        name: "Gnome Cunning",
        unlock: "Lv 1 · Always On",
        economy: "Passive",
        roll: "2d20kh1 INT/WIS/CHA magic saves",
        detail: "Advantage on all Intelligence, Wisdom, and Charisma saving throws against magic."
      }
    },
    {
      id: "tiefling",
      name: "Tiefling",
      icon: "🔥",
      speed: 30,
      size: "Medium",
      asi: ["CHA", "INT"],
      asiNote: "CHA +2, INT +1",
      vision: "Darkvision 60 ft",
      skills: [],
      traits: [
        { name: "Hellish Resistance", detail: "Always-on resistance to the most common elemental damage type: Fire." },
        { name: "Infernal Legacy", detail: "Free Thaumaturgy, Hellish Rebuke, and Darkness without spellbook tax." }
      ],
      tags: ["fire-resist", "innate-darkness", "cha-lean"],
      rp: {
        traits: [
          "Uses sharp wit and tailored presentation to force respect before prejudice speaks.",
          "Reads fine print twice because someone always hides a hook in clause four."
        ],
        ideals: [
          { tag: "Autonomy", text: "Self-Determination. Bloodline is scenery, never destiny." },
          { tag: "Candor", text: "Truth. Honest devils beat polite hypocrites every day of the week." }
        ],
        bonds: [
          "Keeps a silver coin signed by the first stranger who sheltered them without fear.",
          "Hunts a mortal cult using their lineage's name to extort frontier towns."
        ],
        flaws: [
          "Assumes every town guard is waiting for an excuse to pin blame on them.",
          "Answers minor disrespect with disproportionate theatrical intimidation."
        ]
      },
      source: "PHB p.42",
      lore: "Tieflings are humans whose bloodline was bound to Asmodeus and the Nine Hells, marked by horns, tails, solid-colored eyes, and an innate spark of infernal magic. Met with suspicion everywhere, they become fiercely self-reliant and adventure to forge a destiny beyond their heritage.",
      baseAsi: { CHA: 2 },
      raceAction: {
        name: "Infernal Legacy",
        unlock: "Lv 3 · 1/Long Rest",
        economy: "Reaction",
        roll: "Hellish Rebuke 3d10, DC 8+CHA+PB",
        detail: "Thaumaturgy at Lv 1; at Lv 3 cast Hellish Rebuke as a 2nd-level spell when damaged, DEX save for half fire damage; Darkness at Lv 5."
      }
    },
    {
      id: "half-orc",
      name: "Half-Orc",
      icon: "🪓",
      speed: 30,
      size: "Medium",
      asi: ["STR", "CON"],
      asiNote: "STR +2, CON +1",
      vision: "Darkvision 60 ft",
      skills: ["Intimidation"],
      traits: [
        { name: "Relentless Endurance", detail: "Drop to 1 HP instead of 0 once per long rest; saves actions and heals." },
        { name: "Savage Attacks", detail: "Extra weapon damage die on melee crits; scales brutally with advantage." },
        { name: "Menacing", detail: "Free Intimidation proficiency backs frontline presence." }
      ],
      tags: ["crit-die", "cheat-death", "intimidation", "melee-lean"],
      rp: {
        traits: [
          "Stays eerily calm right before violence starts, conserving breath for the swing.",
          "Checks bruised teammates first before mentioning their own broken ribs."
        ],
        ideals: [
          { tag: "Grit", text: "Resolve. You only lose when your feet stop moving forward." },
          { tag: "Protector", text: "Strength. Carry the weight so softer hands stay unbroken." }
        ],
        bonds: [
          "Wears a braided cord from a warband mentor who taught mercy alongside fury.",
          "Swore no orphan in their current circle will ever sleep cold outside town gates."
        ],
        flaws: [
          "Solves deadlocked negotiations by daring someone to throw the first punch.",
          "Hides vulnerability behind stoic silence until burnout hits all at once."
        ]
      },
      source: "PHB p.40",
      lore: "Half-orcs combine human ambition with orcish strength, standing tall and gray-skinned with jutting canines and a fearsome presence. Often raised on harsh frontiers, they adventure to prove themselves through endurance, fury, and loyalty.",
      baseAsi: { STR: 2, CON: 1 },
      raceAction: {
        name: "Relentless Endurance + Savage Attacks",
        unlock: "Lv 1 · Endurance 1/Long Rest",
        economy: "Passive",
        roll: "Drop to 1 HP not 0 · +1 weapon die on melee crit",
        detail: "When reduced to 0 HP but not killed outright, drop to 1 HP instead once per long rest; on a melee weapon critical hit, roll one extra weapon damage die."
      }
    },
    {
      id: "half-elf",
      name: "Half-Elf",
      icon: "🎭",
      speed: 30,
      size: "Medium",
      asi: ["CHA", "DEX", "CON"],
      asiNote: "CHA +2, any two +1",
      vision: "Darkvision 60 ft",
      skills: ["Any 2 Skills"],
      traits: [
        { name: "Skill Versatility", detail: "Two free skills let any class double as party face or scout." },
        { name: "Elven Accuracy Gateway", detail: "Qualifies for triple-advantage crit fishing alongside Elves." },
        { name: "Fey Ancestry", detail: "Charm advantage plus sleep immunity for backline stability." }
      ],
      tags: ["skill-monkey", "triple-advantage", "mad-solver", "fey-ancestry"],
      rp: {
        traits: [
          "Matches accent and posture seamlessly to whichever crowd holds the room.",
          "Reads awkward silences as levers rather than discomfort."
        ],
        ideals: [
          { tag: "Bridge", text: "Belonging. Build spaces where outsiders do not need permission." },
          { tag: "Fluency", text: "Diplomacy. Every faction wants something; find the shared price." }
        ],
        bonds: [
          "Carries letters between two estranged parents who refuse to speak directly.",
          "Owes a sanctuary debt to a mixed border town caught between kingdoms."
        ],
        flaws: [
          "Shapes opinions to win approval until allies question where they truly stand.",
          "Drifts away whenever roots threaten to turn into obligations."
        ]
      },
      source: "PHB p.38",
      lore: "Half-elves walk between human and elven worlds, blending human drive with elven grace, keen senses, and fey resistance to charm. Never fully at home in either society, they become natural diplomats, wanderers, and versatile adventurers.",
      baseAsi: { CHA: 2 }
    },
    {
      id: "goliath",
      name: "Goliath",
      icon: "⛰️",
      speed: 30,
      size: "Medium",
      asi: ["STR", "CON"],
      asiNote: "STR +2, CON +1",
      vision: "Normal",
      skills: ["Athletics"],
      traits: [
        { name: "Stone's Endurance", detail: "Reaction 1d12+CON mitigation protects HP pools and concentration saves." },
        { name: "Powerful Build", detail: "Double carry/push/drag capacity enables grapple and terrain shoving play." },
        { name: "Natural Athlete", detail: "Free Athletics makes shove-prone loops trivial to enable." }
      ],
      tags: ["damage-mitigation", "athletics-grapple", "no-darkvision"],
      rp: {
        traits: [
          "Scores every challenge as fair or rigged, respecting worthy rivals immediately.",
          "Keeps exact tallies of personal bests and worst mistakes."
        ],
        ideals: [
          { tag: "Merit", text: "Competence. Titles weigh nothing if your knees buckle on the climb." },
          { tag: "Fairness", text: "Balance. Carry your share of the pack and never kick down." }
        ],
        bonds: [
          "Left a mountain hold after refusing to abandon an injured scout to winter.",
          "Trains daily to surpass a fallen sibling's record in honest combat."
        ],
        flaws: [
          "Accepts reckless dares simply because backing down feels worse than dying.",
          "Measures subtle political intrigue with blunt yardsticks."
        ]
      },
      source: "VGtM p.108 / MotM",
      lore: "Goliaths are towering, gray-skinned mountain nomads over 7 feet tall whose bodies bear dark, lucky lithoderm markings. They live in a fierce meritocracy of constant self-competition and adventure to test their strength against ever greater challenges.",
      baseAsi: { STR: 2, CON: 1 },
      raceAction: {
        name: "Stone's Endurance",
        unlock: "Lv 1 · 1/Short Rest",
        economy: "Reaction",
        roll: "1d12 + CON dmg reduction",
        detail: "When you take damage, roll 1d12 and add your CON modifier, then reduce the damage by that total."
      }
    },
    {
      id: "aasimar",
      name: "Aasimar",
      icon: "✨",
      speed: 30,
      size: "Medium",
      asi: ["CHA", "WIS", "CON"],
      asiNote: "CHA +2, Sub-Race +1",
      vision: "Darkvision 60 ft",
      skills: [],
      traits: [
        { name: "Celestial Resistance", detail: "Rare twin resistance to both Radiant and Necrotic damage." },
        { name: "Healing Hands", detail: "Emergency non-spell heal rescues downed allies or preserves slots." },
        { name: "Celestial Revelation", detail: "Flight, radiant aura, or fear burst scales damage by proficiency bonus." }
      ],
      tags: ["flight-burst", "necro-resist", "emergency-heal"],
      rp: {
        traits: [
          "Listens to prophetic dreams like unwanted background noise during briefing.",
          "Carries quiet gravity that makes tavern bullies hesitate before speaking."
        ],
        ideals: [
          { tag: "Mercy", text: "Redemption. Light exists to mend what darkness broke, not gloat." },
          { tag: "Conviction", text: "Vigilance. Evil thrives where comfortable heroes look away." }
        ],
        bonds: [
          "Guided by cryptic celestial counsel whose long game may conflict with local mercy.",
          "Feels personally responsible for a fallen mentor who failed a similar calling."
        ],
        flaws: [
          "Takes cosmic guilt onto their own shoulders for tragedies beyond anyone's control.",
          "Grows rigid and unforgiving when allies joke about desperate sacrifices."
        ]
      },
      source: "VGtM p.104 / MotM",
      lore: "Aasimar are mortals touched by celestial power, bearing luminous eyes and an angelic guide who visits them in dreams. They are called to defend the innocent and battle evil, wielding radiant light that can heal allies or scorch foes.",
      baseAsi: { CHA: 2 },
      raceAction: {
        name: "Healing Hands + Celestial Revelation",
        unlock: "Lv 1 / Lv 3 · 1/Long Rest each",
        economy: "Action",
        roll: "Heal HP = level · Lv 3 transform: +level radiant or necrotic dmg 1/turn",
        detail: "Touch a creature to restore hit points equal to your level; from Lv 3 transform for 1 minute to gain wings, a searing aura, or a fearful shroud per sub-race."
      }
    },
    {
      id: "tabaxi",
      name: "Tabaxi",
      icon: "🐆",
      speed: 30,
      size: "Medium",
      asi: ["DEX", "CHA"],
      asiNote: "DEX +2, CHA +1",
      vision: "Darkvision 60 ft",
      skills: ["Perception", "Stealth"],
      traits: [
        { name: "Feline Agility", detail: "Double speed burst resets cleanly on any 0-movement turn; huge kiting ceiling." },
        { name: "Cat's Talent", detail: "Both Stealth and Perception free; unmatched scout baseline." },
        { name: "Climbing Speed", detail: "20 ft climb bypasses vertical terrain without Athletics tax." }
      ],
      tags: ["hyper-mobility", "double-scout-skills", "climb-speed"],
      rp: {
        traits: [
          "Drums claws impatiently through slow council meetings, eyes tracking shiny latches.",
          "Frames danger like a riddle to solve once and forget forever."
        ],
        ideals: [
          { tag: "Curiosity", text: "Discovery. Every locked vault owes you at least one good story." },
          { tag: "Freedom", text: "Motion. Chains rust fastest on someone who never sits still." }
        ],
        bonds: [
          "Collects forgotten regional folklore to return lost history to scattered tribes.",
          "Chases rumors of an artifact stolen from a traveling caravan mentor."
        ],
        flaws: [
          "Drops tactical formation the instant an unexplained mystery glints down a side corridor.",
          "Loses interest in hard-won treasure as soon as its secret is uncovered."
        ]
      },
      source: "VGtM p.113 / MotM",
      lore: "Tabaxi are lithe, cat-like humanoids from distant jungle lands, with fur-patterned coats, claws, and an insatiable curiosity. They roam the world collecting stories, artifacts, and secrets, with interests that shift as quickly as their bursts of speed.",
      baseAsi: { DEX: 2, CHA: 1 },
      raceAction: {
        name: "Feline Agility",
        unlock: "Lv 1 · recharges after a 0 ft turn",
        economy: "Movement",
        roll: "2x speed burst",
        detail: "Double your speed until the end of the turn; recharges after you spend a full turn moving 0 feet."
      }
    }
  ],
  CLASSES: [
    {
      id: "barbarian",
      name: "Barbarian",
      icon: "🔥",
      hitDie: "d12",
      primaryStats: ["STR", "CON"],
      saves: ["STR", "CON"],
      skillCount: 2,
      skillPool: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
      armor: "Light, Medium, Shields",
      mechanics: [
        { name: "Rage + Reckless Attack", detail: "On-demand advantage multiplies crit rate and punishes crit-fishing passives." },
        { name: "Brutal Critical", detail: "Stacks extra weapon dice on crits at Level 9+." }
      ],
      tags: ["melee-crit", "str-primary", "athletics-grapple", "damage-mitigation"],
      rp: {
        traits: [
          "Treats battle scars like honest receipts from impossible odds.",
          "Goes unsettlingly quiet the second someone threatens a party healer."
        ],
        ideals: [
          { tag: "Ferocity", text: "Momentum. Hit the crisis hard enough that hesitation never forms." }
        ],
        bonds: ["Carries a trophy from a beast whose pack still stalks the borderlands."],
        flaws: ["Finds nuanced surrender almost physically painful to witness."]
      },
      source: "PHB p.46",
      lore: "A Barbarian is a fierce warrior of primal fury who channels a storm of rage into raw battlefield might. They are the toughest frontliners in the game, shrugging off blows and hitting back harder.",
      weapons: "Simple weapons, martial weapons",
      tools: "None",
      subclassTitle: "Primal Path",
      subclassLevel: 3,
      spellAbility: null,
      dcAbility: "STR",
      attackPref: "STR",
      acRule: "Unarmored: 10 + DEX + CON",
      acCalc: { base: 10, add: ["DEX", "CON"], dexCap: null, shield: 0 },
      signatureWeapons: [
        { name: "Greataxe", dice: "1d12", type: "slashing", stat: "STR", notes: "Heavy, two-handed" },
        { name: "Handaxe", dice: "1d6", type: "slashing", stat: "STR", notes: "Light, thrown 20/60" },
        { name: "Javelin", dice: "1d6", type: "piercing", stat: "STR", notes: "Thrown 30/120" }
      ],
      classActions: [
        {
          name: "Rage",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Bonus Action",
          roll: "+2 melee dmg -> +4 at Lv 16 · resist B/P/S",
          detail: "Lasts 1 minute; advantage on STR checks and saves; 2 uses per long rest rising to 6 by Lv 17."
        },
        {
          name: "Unarmored Defense",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Passive",
          roll: "AC = 10 + DEX + CON",
          detail: "Applies while wearing no armor; a shield still adds +2."
        },
        {
          name: "Reckless Attack",
          tier: "Core",
          unlock: "Lv 2",
          economy: "On Attack",
          roll: "2d20kh1 on STR melee attacks",
          detail: "Gain advantage on STR melee attacks this turn, but attacks against you have advantage until your next turn."
        },
        {
          name: "Extra Attack",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Action",
          roll: "2 attacks per Attack action",
          detail: "Attack twice whenever you take the Attack action on your turn."
        },
        {
          name: "Brutal Critical",
          tier: "Advanced",
          unlock: "Lv 9",
          economy: "On Hit",
          roll: "+1 weapon die on crit -> +3 at Lv 17",
          detail: "Roll one extra weapon damage die on a melee crit, such as +1d12 with a greataxe; 2 dice at Lv 13 and 3 at Lv 17."
        },
        {
          name: "Relentless Rage",
          tier: "Advanced",
          unlock: "Lv 11",
          economy: "Passive",
          roll: "DC 10 CON save, +5 per reuse",
          detail: "While raging, drop to 1 HP instead of 0 on a successful save; the DC resets on a rest."
        }
      ]
    },
    {
      id: "bard",
      name: "Bard",
      icon: "🎵",
      hitDie: "d8",
      primaryStats: ["CHA", "DEX"],
      saves: ["DEX", "CHA"],
      skillCount: 3,
      skillPool: ["Any 3 Skills"],
      armor: "Light",
      mechanics: [
        {
          name: "Jack of All Trades + Expertise",
          detail: "Stacks half-proficiency on initiative/counterspell and doubles social or scout checks."
        },
        { name: "Magical Secrets", detail: "Steals best-in-class spells across lists to patch party gaps." }
      ],
      tags: ["skill-monkey", "cha-primary", "face", "control-caster"],
      rp: {
        traits: [
          "Collects embarrassing rumors about magistrates as casually as tavern songs.",
          "Narrates near-death escapes immediately so history remembers them favorably."
        ],
        ideals: [
          { tag: "Expression", text: "Story. Fear dies fastest when mocked to music." }
        ],
        bonds: ["Searches for the missing third verse of a ballad tied to a fallen monarch."],
        flaws: ["Takes stupid social risks just to see how the room reacts."]
      },
      source: "PHB p.51",
      lore: "A Bard is an inspiring magician whose words and music weave arcane power drawn from the creation song of the multiverse. They are flexible support casters and skill experts who buff allies, hinder foes, and lead every social scene.",
      weapons: "Simple weapons, hand crossbows, longswords, rapiers, shortswords",
      tools: "Three musical instruments",
      subclassTitle: "Bard College",
      subclassLevel: 3,
      spellAbility: "CHA",
      dcAbility: "CHA",
      attackPref: "FINESSE",
      acRule: "Leather: 11 + DEX",
      acCalc: { base: 11, add: ["DEX"], dexCap: null, shield: 0 },
      signatureWeapons: [
        { name: "Rapier", dice: "1d8", type: "piercing", stat: "DEX", notes: "Finesse" },
        { name: "Dagger", dice: "1d4", type: "piercing", stat: "DEX", notes: "Finesse, light, thrown 20/60" },
        {
          name: "Vicious Mockery",
          dice: "1d4",
          type: "psychic",
          stat: "CHA",
          notes: "Cantrip · WIS save · target has disadvantage on next attack"
        }
      ],
      classActions: [
        {
          name: "Spellcasting",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "Save DC 8 + PB + CHA · Attack d20 + PB + CHA",
          detail: "Cast known bard spells using an instrument as a focus; full caster slot progression."
        },
        {
          name: "Bardic Inspiration",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Bonus Action",
          roll: "1d6 -> 1d8 Lv 5 -> 1d10 Lv 10 -> 1d12 Lv 15",
          detail: "An ally within 60 ft adds the die to one attack, check, or save in the next 10 minutes; CHA mod uses per long rest."
        },
        {
          name: "Vicious Mockery",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "1d4 psychic -> 4d4 · WIS save",
          detail: "On a failed save the target takes psychic damage and has disadvantage on its next attack roll."
        },
        {
          name: "Song of Rest",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Passive",
          roll: "+1d6 HP on short rest -> 1d12 at Lv 17",
          detail: "Allies who spend Hit Dice during your short rest regain extra hit points."
        },
        {
          name: "Font of Inspiration",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Passive",
          roll: "Bardic Inspiration recharges on short rest",
          detail: "All expended Bardic Inspiration uses return after a short or long rest."
        },
        {
          name: "Magical Secrets",
          tier: "Advanced",
          unlock: "Lv 10",
          economy: "Passive",
          roll: "+2 spells from any class list",
          detail: "Learn two spells from any class; again at Lv 14 and Lv 18."
        }
      ]
    },
    {
      id: "cleric",
      name: "Cleric",
      icon: "☀️",
      hitDie: "d8",
      primaryStats: ["WIS", "CON"],
      saves: ["WIS", "CHA"],
      skillCount: 2,
      skillPool: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
      armor: "Light, Medium, Shields · Heavy via Domain",
      mechanics: [
        { name: "Spirit Guardians Frontline", detail: "Maintains high-value concentration while dodging or holding heavy armor." },
        { name: "Channel Divinity", detail: "Short-rest bursts turn undead or spike domain spells." }
      ],
      tags: ["heavy-armor-caster", "wis-primary", "concentration", "support"],
      rp: {
        traits: [
          "Checks wounds and rations with dry bedside practicality before offering sermons.",
          "Treats minor miracles as daily maintenance rather than spectacle."
        ],
        ideals: [
          { tag: "Stewardship", text: "Devotion. Faith is measured by who survives winter, not loud prayers." }
        ],
        bonds: ["Answers to a frontier shrine sustained solely by letters and relics sent home."],
        flaws: ["Judges allies' moral shortcuts harshly while carrying quiet doubts of their own."]
      },
      source: "PHB p.56",
      lore: "A Cleric is a priestly champion who wields divine magic granted by a god, channeling that power to heal, protect, and smite. Armored and versatile, they anchor the party as healer, buffer, and frontline caster.",
      weapons: "Simple weapons",
      tools: "None",
      subclassTitle: "Divine Domain",
      subclassLevel: 1,
      spellAbility: "WIS",
      dcAbility: "WIS",
      attackPref: "STR_OR_CAST",
      acRule: "Scale Mail: 14 + DEX (max 2)",
      acCalc: { base: 14, add: ["DEX"], dexCap: 2, shield: 2 },
      signatureWeapons: [
        { name: "Mace", dice: "1d6", type: "bludgeoning", stat: "STR", notes: "Simple melee" },
        { name: "Light Crossbow", dice: "1d8", type: "piercing", stat: "DEX", notes: "Ammunition 80/320, loading, two-handed" },
        { name: "Sacred Flame", dice: "1d8", type: "radiant", stat: "WIS", notes: "Cantrip · DEX save · ignores cover" }
      ],
      classActions: [
        {
          name: "Spellcasting",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "Save DC 8 + PB + WIS · Attack d20 + PB + WIS",
          detail: "Prepare WIS mod + cleric level spells daily from the full cleric list using a holy symbol."
        },
        {
          name: "Turn Undead",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Action",
          roll: "WIS save vs your spell DC",
          detail: "Channel Divinity: each undead within 30 ft that fails must flee for 1 minute or until damaged."
        },
        {
          name: "Channel Divinity: Domain",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Action",
          roll: "1/Short Rest -> 2 at Lv 6 -> 3 at Lv 18",
          detail: "Fuel your domain's signature Channel Divinity option."
        },
        {
          name: "Spirit Guardians",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Action",
          roll: "3d8 radiant · WIS save half · 15 ft aura",
          detail: "3rd-level concentration spell; enemies entering or starting a turn in the aura take damage and move at half speed."
        },
        {
          name: "Destroy Undead",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "On Turn Undead",
          roll: "CR 1/2 -> CR 4 at Lv 17",
          detail: "Undead of the listed CR or lower that fail the Turn Undead save are instantly destroyed."
        },
        {
          name: "Divine Intervention",
          tier: "Advanced",
          unlock: "Lv 10",
          economy: "Action",
          roll: "d100 <= cleric level",
          detail: "Call on your deity for aid; auto-succeeds at Lv 20; 7-day cooldown on success."
        }
      ]
    },
    {
      id: "druid",
      name: "Druid",
      icon: "🌿",
      hitDie: "d8",
      primaryStats: ["WIS", "CON"],
      saves: ["INT", "WIS"],
      skillCount: 2,
      skillPool: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
      armor: "Light, Medium, Shields · Nonmetal",
      mechanics: [
        {
          name: "Wild Shape Trait Inheritance",
          detail: "Retains racial darkvision, Lucky, resistance, and mental saves inside beast forms."
        },
        { name: "Area Control", detail: "Pass without Trace + Spike Growth turn party positioning into combat superiority." }
      ],
      tags: ["wildshape-carry", "wis-primary", "perception", "concentration"],
      rp: {
        traits: [
          "Tracks wind shifts and root rot indoors out of deeply ingrained habit.",
          "Finds stone cities claustrophobic and suspiciously sterile."
        ],
        ideals: [
          { tag: "Cycle", text: "Balance. Rot feeds spring; hoarding power poisons the soil." }
        ],
        bonds: ["Watched a sacred watershed poisoned and tracks the alchemical guild responsible."],
        flaws: ["Values beasts and ancient trees noticeably above reckless merchants."]
      },
      source: "PHB p.64",
      lore: "A Druid is a priest of the Old Faith who draws primal magic from nature itself, shapeshifting into beasts and commanding the elements. They are versatile controllers and healers who guard the balance between civilization and the wild.",
      weapons: "Clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears",
      tools: "Herbalism kit",
      subclassTitle: "Druid Circle",
      subclassLevel: 2,
      spellAbility: "WIS",
      dcAbility: "WIS",
      attackPref: "STR_OR_CAST",
      acRule: "Leather: 11 + DEX",
      acCalc: { base: 11, add: ["DEX"], dexCap: null, shield: 2 },
      signatureWeapons: [
        { name: "Scimitar", dice: "1d6", type: "slashing", stat: "DEX", notes: "Finesse, light" },
        { name: "Quarterstaff", dice: "1d6", type: "bludgeoning", stat: "STR", notes: "Versatile 1d8 · Shillelagh 1d8 + WIS" },
        { name: "Produce Flame", dice: "1d8", type: "fire", stat: "WIS", notes: "Cantrip · ranged spell attack 30 ft" }
      ],
      classActions: [
        {
          name: "Druidic + Spellcasting",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "Save DC 8 + PB + WIS · Attack d20 + PB + WIS",
          detail: "Prepare WIS mod + druid level spells daily; speak the secret Druidic language."
        },
        {
          name: "Shillelagh",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Bonus Action",
          roll: "1d8 + WIS club or staff",
          detail: "Cantrip: your club or quarterstaff uses WIS for attack and damage for 1 minute."
        },
        {
          name: "Wild Shape",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Action",
          roll: "2/Short Rest · beast CR 1/4 -> 1 at Lv 8",
          detail: "Transform into a beast you have seen for hours equal to half your druid level; gain its HP as a buffer."
        },
        {
          name: "Pass without Trace",
          tier: "Advanced",
          unlock: "Lv 3",
          economy: "Action",
          roll: "+10 Stealth to party",
          detail: "2nd-level concentration spell lasting 1 hour; allies within 30 ft cannot be tracked by nonmagical means."
        },
        {
          name: "Conjure Animals",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Action",
          roll: "Up to 8 CR 1/4 beasts",
          detail: "3rd-level concentration spell summoning fey spirits in beast form that act on your initiative."
        },
        {
          name: "Beast Spells",
          tier: "Advanced",
          unlock: "Lv 18",
          economy: "Passive",
          roll: "Cast spells while Wild Shaped",
          detail: "Perform somatic and verbal components of druid spells in beast form."
        }
      ]
    },
    {
      id: "fighter",
      name: "Fighter",
      icon: "⚔️",
      hitDie: "d10",
      primaryStats: ["STR", "DEX"],
      saves: ["STR", "CON"],
      skillCount: 2,
      skillPool: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
      armor: "All Armor, Shields",
      mechanics: [
        {
          name: "Action Surge + Extra ASIs",
          detail: "Seven ASIs let feat-hungry species builds max stats and stack GWM/PAM/Sharpshooter."
        },
        { name: "Indomitable", detail: "Pairs cleanly with racial magic/poison/fear save boosts." }
      ],
      tags: ["feat-engine", "nova-burst", "frontline", "triple-advantage"],
      rp: {
        traits: [
          "Counts exits, sightlines, and choke points automatically upon entering an inn.",
          "Respects discipline in enemies more than boastful competence in nobles."
        ],
        ideals: [
          { tag: "Readiness", text: "Craft. Drills keep you alive long after luck runs dry." }
        ],
        bonds: ["Keeps the unit crest of a disbanded company framed inside their pack."],
        flaws: ["Treats every social puzzle like a perimeter breach waiting to happen."]
      },
      source: "PHB p.70",
      lore: "A Fighter is a master of martial combat, skilled with every weapon and armor and trained to win through technique and stamina. They are the most consistent damage dealers and defenders, with more attacks and action surges than any class.",
      weapons: "Simple weapons, martial weapons",
      tools: "None",
      subclassTitle: "Martial Archetype",
      subclassLevel: 3,
      spellAbility: null,
      dcAbility: "STR",
      attackPref: "STR",
      acRule: "Chain Mail: AC 16 (+2 Shield = 18)",
      acCalc: { base: 16, add: [], dexCap: 0, shield: 2 },
      signatureWeapons: [
        { name: "Longsword", dice: "1d8", type: "slashing", stat: "STR", notes: "Versatile 1d10" },
        { name: "Greatsword", dice: "2d6", type: "slashing", stat: "STR", notes: "Heavy, two-handed" },
        { name: "Longbow", dice: "1d8", type: "piercing", stat: "DEX", notes: "Ammunition 150/600, heavy, two-handed" }
      ],
      classActions: [
        {
          name: "Fighting Style",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Passive",
          roll: "Defense +1 AC · Dueling +2 dmg · Archery +2 hit · GWF reroll 1-2",
          detail: "Choose one combat specialty that permanently shapes your attacks or defense."
        },
        {
          name: "Second Wind",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Bonus Action",
          roll: "1d10 + fighter level HP",
          detail: "Regain hit points once per short or long rest."
        },
        {
          name: "Action Surge",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Free",
          roll: "+1 Action · 1/Short Rest -> 2 at Lv 17",
          detail: "Take one additional action on your turn on top of your normal action."
        },
        {
          name: "Extra Attack",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Action",
          roll: "2x -> 3x at Lv 11 -> 4x at Lv 20",
          detail: "Attack multiple times whenever you take the Attack action."
        },
        {
          name: "Indomitable",
          tier: "Advanced",
          unlock: "Lv 9",
          economy: "On Failed Save",
          roll: "Reroll a failed save · 1 -> 3 uses at Lv 17",
          detail: "Reroll a saving throw you fail and use the new roll; uses refresh on a long rest."
        }
      ]
    },
    {
      id: "monk",
      name: "Monk",
      icon: "🌬️",
      hitDie: "d8",
      primaryStats: ["DEX", "WIS"],
      saves: ["STR", "DEX"],
      skillCount: 2,
      skillPool: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
      armor: "None · Unarmored Defense",
      mechanics: [
        { name: "Unarmored Movement", detail: "Stacks multiplicatively with species speed bursts and climb speeds." },
        { name: "Stunning Strike Flurry", detail: "4 attacks/turn fishing crits or burning legendary resistances." }
      ],
      tags: ["hyper-mobility", "dex-wis-mad", "mad-solver", "skirmisher"],
      rp: {
        traits: [
          "Breaths steadily through insults, saving energy for decisive movement.",
          "Finds heavy armor absurdly noisy and needlessly theatrical."
        ],
        ideals: [
          { tag: "Clarity", text: "Discipline. Empty hands never panic when weapons break." }
        ],
        bonds: ["Left an isolated monastery carrying one sealed scroll they were told never to read."],
        flaws: ["Goes hungry or unequipped out of stubborn ascetic pride."]
      },
      source: "PHB p.76",
      lore: "A Monk is a disciplined martial artist who harnesses ki, the mystic energy flowing through living bodies, to strike with blinding speed. They are mobile skirmishers who flurry, dodge, and stun enemies without armor or heavy weapons.",
      weapons: "Simple weapons, shortswords",
      tools: "One artisan's tool or musical instrument",
      subclassTitle: "Monastic Tradition",
      subclassLevel: 3,
      spellAbility: null,
      dcAbility: "WIS",
      attackPref: "DEX",
      acRule: "Unarmored: 10 + DEX + WIS",
      acCalc: { base: 10, add: ["DEX", "WIS"], dexCap: null, shield: 0 },
      signatureWeapons: [
        { name: "Shortsword", dice: "1d6", type: "piercing", stat: "DEX", notes: "Finesse, light · monk weapon" },
        { name: "Unarmed Strike", dice: "1d4", type: "bludgeoning", stat: "DEX", notes: "Martial Arts die · scales to 1d10" },
        { name: "Dart", dice: "1d4", type: "piercing", stat: "DEX", notes: "Finesse, thrown 20/60" }
      ],
      classActions: [
        {
          name: "Martial Arts",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Bonus Action",
          roll: "1d4 -> 1d6 Lv 5 -> 1d8 Lv 11 -> 1d10 Lv 17",
          detail: "Use DEX for unarmed and monk weapons; make one bonus unarmed strike after the Attack action."
        },
        {
          name: "Unarmored Defense",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Passive",
          roll: "AC = 10 + DEX + WIS",
          detail: "Applies with no armor and no shield."
        },
        {
          name: "Flurry of Blows",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "1 ki -> 2 unarmed strikes",
          detail: "Spend 1 ki after the Attack action to make two unarmed strikes."
        },
        {
          name: "Patient Defense / Step of the Wind",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "1 ki -> Dodge, or Dash/Disengage + 2x jump",
          detail: "Spend ki to defend or reposition as a bonus action."
        },
        {
          name: "Deflect Missiles",
          tier: "Advanced",
          unlock: "Lv 3",
          economy: "Reaction",
          roll: "Reduce by 1d10 + DEX + monk level",
          detail: "If damage drops to 0, spend 1 ki to throw the missile back as a monk weapon attack."
        },
        {
          name: "Stunning Strike",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "On Hit",
          roll: "1 ki -> CON save vs 8 + PB + WIS",
          detail: "On a failed save the target is Stunned until the end of your next turn."
        }
      ]
    },
    {
      id: "paladin",
      name: "Paladin",
      icon: "🛡️",
      hitDie: "d10",
      primaryStats: ["STR", "CHA"],
      saves: ["WIS", "CHA"],
      skillCount: 2,
      skillPool: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
      armor: "All Armor, Shields",
      mechanics: [
        {
          name: "Aura of Protection + Smite",
          detail: "CHA aura stacks with Gnome Cunning, Fey Ancestry, or Brave; crits dump double smite dice."
        },
        { name: "Conquest Fear Lock", detail: "Locks down frightened enemies at speed 0; loves Dragon Fear or Undead bursts." }
      ],
      tags: ["aura-saves", "smite-crit", "mad-heavy", "fear-feat"],
      rp: {
        traits: [
          "Binds promises with plain clarity so allies know the exact line they will not cross.",
          "Wears polish and dents alike as badges of an unbroken oath."
        ],
        ideals: [
          { tag: "Oath", text: "Accountability. If you swear to stand, you do not step aside." }
        ],
        bonds: ["Carries an oath-blade pledged until a specific tyranny falls."],
        flaws: ["Mistakes compromise for betrayal even when pragmatism saves lives."]
      },
      source: "PHB p.82",
      lore: "A Paladin is a holy warrior bound by a sacred oath, drawing divine magic from conviction rather than a god. They are armored frontliners who heal with a touch, protect allies with auras, and unleash devastating smites.",
      weapons: "Simple weapons, martial weapons",
      tools: "None",
      subclassTitle: "Sacred Oath",
      subclassLevel: 3,
      spellAbility: "CHA",
      dcAbility: "CHA",
      attackPref: "STR",
      acRule: "Chain Mail: AC 16 (+2 Shield = 18)",
      acCalc: { base: 16, add: [], dexCap: 0, shield: 2 },
      signatureWeapons: [
        { name: "Longsword", dice: "1d8", type: "slashing", stat: "STR", notes: "Versatile 1d10" },
        { name: "Greatsword", dice: "2d6", type: "slashing", stat: "STR", notes: "Heavy, two-handed" },
        { name: "Javelin", dice: "1d6", type: "piercing", stat: "STR", notes: "Thrown 30/120" }
      ],
      classActions: [
        {
          name: "Divine Sense",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "1 + CHA uses per long rest",
          detail: "Sense celestials, fiends, and undead within 60 ft until the end of your next turn."
        },
        {
          name: "Lay on Hands",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "Pool = paladin level x 5 HP",
          detail: "Restore HP from the pool by touch, or spend 5 to cure a disease or poison."
        },
        {
          name: "Divine Smite",
          tier: "Core",
          unlock: "Lv 2",
          economy: "On Hit",
          roll: "2d8 radiant +1d8 per slot above 1st · max 5d8 · +1d8 vs undead/fiend",
          detail: "Expend a spell slot after a melee weapon hit to add radiant damage."
        },
        {
          name: "Extra Attack",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Action",
          roll: "2 attacks per Attack action",
          detail: "Attack twice whenever you take the Attack action."
        },
        {
          name: "Aura of Protection",
          tier: "Advanced",
          unlock: "Lv 6",
          economy: "Passive",
          roll: "+CHA mod to all saves within 10 ft",
          detail: "You and friendly creatures in the aura add your CHA modifier to saving throws; 30 ft at Lv 18."
        },
        {
          name: "Improved Divine Smite",
          tier: "Advanced",
          unlock: "Lv 11",
          economy: "On Hit",
          roll: "+1d8 radiant every melee hit",
          detail: "All melee weapon hits deal an extra 1d8 radiant damage."
        }
      ]
    },
    {
      id: "ranger",
      name: "Ranger",
      icon: "🏹",
      hitDie: "d10",
      primaryStats: ["DEX", "WIS"],
      saves: ["STR", "DEX"],
      skillCount: 3,
      skillPool: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
      armor: "Light, Medium, Shields",
      mechanics: [
        {
          name: "Gloom Stalker + Darkvision",
          detail: "Umbral Sight grants invisibility to darkvision; races with darkvision double down or cover pitch-dark ambushes."
        },
        { name: "Pass without Trace + Archery", detail: "Stacks stealth and Elven Accuracy/Sharpshooter burst." }
      ],
      tags: ["scout", "darkvision-ambush", "triple-advantage", "perception"],
      rp: {
        traits: [
          "Reads mud, smoke, and silence faster than most scholars read books.",
          "Sleeps lightly with one boot laced and rations pre-portioned."
        ],
        ideals: [
          { tag: "Vigilance", text: "Foresight. Spot the ambush three miles before it springs." }
        ],
        bonds: ["Tracks a migrating threat along frontier settlements nobody in the capital believes exists."],
        flaws: ["Trusts perimeter instincts over companions' assurances in crowded courts."]
      },
      source: "PHB p.89",
      lore: "A Ranger is a warrior of the wilderness who blends martial skill with nature magic to hunt the monsters that threaten civilization. They are expert trackers and ranged strikers who excel at scouting and focused-target damage.",
      weapons: "Simple weapons, martial weapons",
      tools: "None",
      subclassTitle: "Ranger Archetype",
      subclassLevel: 3,
      spellAbility: "WIS",
      dcAbility: "WIS",
      attackPref: "DEX",
      acRule: "Scale Mail: 14 + DEX (max 2)",
      acCalc: { base: 14, add: ["DEX"], dexCap: 2, shield: 0 },
      signatureWeapons: [
        { name: "Longbow", dice: "1d8", type: "piercing", stat: "DEX", notes: "Ammunition 150/600, heavy, two-handed" },
        { name: "Shortsword", dice: "1d6", type: "piercing", stat: "DEX", notes: "Finesse, light · two-weapon fighting" }
      ],
      classActions: [
        {
          name: "Favored Enemy + Natural Explorer",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Passive",
          roll: "2d20kh1 WIS Survival to track · INT recall",
          detail: "Advantage to track and recall lore on favored foes; double PB on checks in favored terrain."
        },
        {
          name: "Fighting Style",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Passive",
          roll: "Archery +2 hit · Dueling +2 dmg · Two-Weapon +mod",
          detail: "Choose a combat specialty for bow or blade."
        },
        {
          name: "Spellcasting",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Action",
          roll: "Save DC 8 + PB + WIS · Attack d20 + PB + WIS",
          detail: "Half caster with known ranger spells."
        },
        {
          name: "Hunter's Mark",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "+1d6 on each weapon hit",
          detail: "1st-level concentration spell; also gives advantage to track the marked target; move it when the target drops."
        },
        {
          name: "Extra Attack",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Action",
          roll: "2 attacks per Attack action",
          detail: "Attack twice whenever you take the Attack action."
        },
        {
          name: "Vanish",
          tier: "Advanced",
          unlock: "Lv 14",
          economy: "Bonus Action",
          roll: "Hide as a bonus action",
          detail: "You also cannot be tracked by nonmagical means unless you choose to leave a trail."
        }
      ]
    },
    {
      id: "rogue",
      name: "Rogue",
      icon: "🗡️",
      hitDie: "d8",
      primaryStats: ["DEX", "INT"],
      saves: ["DEX", "INT"],
      skillCount: 4,
      skillPool: [
        "Acrobatics",
        "Athletics",
        "Deception",
        "Insight",
        "Intimidation",
        "Investigation",
        "Perception",
        "Performance",
        "Persuasion",
        "Sleight of Hand",
        "Stealth"
      ],
      armor: "Light",
      mechanics: [
        {
          name: "Sneak Attack Crit Amplification",
          detail: "Single-hit Sneak dice explode with Elven Accuracy, advantage, or Halfling Lucky consistency."
        },
        { name: "Hide / Steady Aim Loops", detail: "Halfling Naturally Stealthy and Tabaxi speed make repositioning effortless." }
      ],
      tags: ["stealth-cover", "skill-monkey", "triple-advantage", "lucky-reroll"],
      rp: {
        traits: [
          "Knows three exit windows before ordering ale.",
          "Treats locks and secrets as personal challenges rather than property boundaries."
        ],
        ideals: [
          { tag: "Leverage", text: "Precision. One clean cut beats ten loud charges." }
        ],
        bonds: ["Owes a life debt to a fence who burned evidence of their worst heist."],
        flaws: ["Assumes every generous patron has a knife hidden behind the contract."]
      },
      source: "PHB p.94",
      lore: "A Rogue is a scoundrel who relies on skill, stealth, and the vulnerabilities of foes to get the upper hand. They are unmatched skill experts and precision strikers whose single Sneak Attack hits harder than most volleys.",
      weapons: "Simple weapons, hand crossbows, longswords, rapiers, shortswords",
      tools: "Thieves' tools",
      subclassTitle: "Roguish Archetype",
      subclassLevel: 3,
      spellAbility: null,
      dcAbility: "DEX",
      attackPref: "DEX",
      acRule: "Leather: 11 + DEX",
      acCalc: { base: 11, add: ["DEX"], dexCap: null, shield: 0 },
      signatureWeapons: [
        { name: "Rapier", dice: "1d8", type: "piercing", stat: "DEX", notes: "Finesse · Sneak Attack eligible" },
        { name: "Shortbow", dice: "1d6", type: "piercing", stat: "DEX", notes: "Ammunition 80/320, two-handed" },
        { name: "Dagger", dice: "1d4", type: "piercing", stat: "DEX", notes: "Finesse, light, thrown 20/60" }
      ],
      classActions: [
        {
          name: "Sneak Attack",
          tier: "Core",
          unlock: "Lv 1",
          economy: "On Hit",
          roll: "1d6 -> 10d6 at Lv 19 · +1d6 per odd level",
          detail: "Once per turn with a finesse or ranged weapon when you have advantage or an ally is within 5 ft of the target."
        },
        {
          name: "Expertise",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Passive",
          roll: "2x PB on 2 skills -> 4 at Lv 6",
          detail: "Double your proficiency bonus on chosen skills or thieves' tools."
        },
        {
          name: "Cunning Action",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "Dash, Disengage, or Hide",
          detail: "Take one of these actions as a bonus action every turn."
        },
        {
          name: "Uncanny Dodge",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Reaction",
          roll: "Halve one attack's damage",
          detail: "When an attacker you can see hits you, halve the damage."
        },
        {
          name: "Evasion",
          tier: "Advanced",
          unlock: "Lv 7",
          economy: "Passive",
          roll: "DEX save: success 0 dmg, fail half",
          detail: "Applies to area effects like Fireball and breath weapons."
        },
        {
          name: "Reliable Talent",
          tier: "Advanced",
          unlock: "Lv 11",
          economy: "Passive",
          roll: "Min 10 on proficient checks",
          detail: "Treat any d20 roll of 9 or lower as a 10 on checks using a proficient skill."
        }
      ]
    },
    {
      id: "sorcerer",
      name: "Sorcerer",
      icon: "⚡",
      hitDie: "d6",
      primaryStats: ["CHA", "CON"],
      saves: ["CON", "CHA"],
      skillCount: 2,
      skillPool: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
      armor: "None",
      mechanics: [
        {
          name: "Metamagic + Racial Spells",
          detail: "Subtle/Twinned/Quickened amplify innate bloodline casts; Dwarf/Half-Elf solve AC fragility."
        },
        { name: "Built-in CON Save", detail: "Pairs smoothly with Fire/Poison/Radiant resistances to guard concentration." }
      ],
      tags: ["cha-primary", "concentration", "fire-synergy", "innate-spells"],
      rp: {
        traits: [
          "Sparks static or heat unconsciously whenever tempers flare in conversation.",
          "Finds wizardly spellbooks charmingly timid compared to raw instinct."
        ],
        ideals: [
          { tag: "Intensity", text: "Command. Master the storm inside before it burns your own circle." }
        ],
        bonds: ["Bears magic awakened by a planar accident they have never fully explained."],
        flaws: ["Overreaches with raw output when subtle restraint would have worked better."]
      },
      source: "PHB p.99",
      lore: "A Sorcerer is a spellcaster whose magic is innate, born of an exotic bloodline, otherworldly influence, or cosmic accident. They know few spells but bend them with Metamagic, making them flexible blasters and controllers.",
      weapons: "Daggers, darts, slings, quarterstaffs, light crossbows",
      tools: "None",
      subclassTitle: "Sorcerous Origin",
      subclassLevel: 1,
      spellAbility: "CHA",
      dcAbility: "CHA",
      attackPref: "STR_OR_CAST",
      acRule: "Unarmored: 10 + DEX (Mage Armor: 13 + DEX)",
      acCalc: { base: 10, add: ["DEX"], dexCap: null, shield: 0, mageArmor: 13 },
      signatureWeapons: [
        { name: "Fire Bolt", dice: "1d10", type: "fire", stat: "CHA", notes: "Cantrip · ranged spell attack 120 ft" },
        { name: "Light Crossbow", dice: "1d8", type: "piercing", stat: "DEX", notes: "Ammunition 80/320, loading, two-handed" },
        { name: "Dagger", dice: "1d4", type: "piercing", stat: "DEX", notes: "Finesse, light, thrown 20/60" }
      ],
      classActions: [
        {
          name: "Spellcasting",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "Save DC 8 + PB + CHA · Attack d20 + PB + CHA",
          detail: "Full caster with a small list of known sorcerer spells."
        },
        {
          name: "Fire Bolt",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "1d10 fire -> 4d10 at Lv 17",
          detail: "Ranged spell attack cantrip that ignites unattended flammable objects."
        },
        {
          name: "Font of Magic",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "Sorcery points = sorcerer level",
          detail: "Convert sorcery points into spell slots or burn slots for points."
        },
        {
          name: "Quickened Spell",
          tier: "Advanced",
          unlock: "Lv 3",
          economy: "Bonus Action",
          roll: "2 sorcery points",
          detail: "Metamagic: cast a 1-action spell as a bonus action."
        },
        {
          name: "Twinned Spell",
          tier: "Advanced",
          unlock: "Lv 3",
          economy: "On Cast",
          roll: "Sorcery points = spell level, min 1",
          detail: "Metamagic: a single-target spell hits a second creature."
        },
        {
          name: "Subtle + Empowered Spell",
          tier: "Advanced",
          unlock: "Lv 3",
          economy: "On Cast",
          roll: "1 point each · reroll up to CHA mod damage dice",
          detail: "Metamagic: cast with no verbal or somatic components, or reroll weak damage dice."
        }
      ]
    },
    {
      id: "warlock",
      name: "Warlock",
      icon: "👁️",
      hitDie: "d8",
      primaryStats: ["CHA", "CON"],
      saves: ["WIS", "CHA"],
      skillCount: 2,
      skillPool: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
      armor: "Light",
      mechanics: [
        {
          name: "Devil's Sight + Darkness",
          detail: "Free racial Darkness from Tiefling grants an extra pact slot per day for one-way advantage."
        },
        { name: "Short Rest Engine", detail: "Pairs well with Elf Trance watches and party short-rest breath/ki loops." }
      ],
      tags: ["innate-darkness", "cha-primary", "trance-craft", "short-rest"],
      rp: {
        traits: ["Negotiates every bargain down to edge cases and loopholes.", "Answers ominous visions with tired sarcasm rather than awe."],
        ideals: [
          { tag: "Leverage", text: "Pact. Borrow abyssal fire if needed, just never sign away your spine." }
        ],
        bonds: ["Collects obscure relics to buy down the final clause of an inherited pact."],
        flaws: ["Keeps patron demands secret until the fallout lands on the whole party."]
      },
      source: "PHB p.105",
      lore: "A Warlock is a seeker of forbidden knowledge who gains magic through a pact with a powerful otherworldly patron. They wield few but always-maxed spell slots that refresh on a short rest, backed by the best damage cantrip in the game.",
      weapons: "Simple weapons",
      tools: "None",
      subclassTitle: "Otherworldly Patron",
      subclassLevel: 1,
      spellAbility: "CHA",
      dcAbility: "CHA",
      attackPref: "STR_OR_CAST",
      acRule: "Leather: 11 + DEX",
      acCalc: { base: 11, add: ["DEX"], dexCap: null, shield: 0 },
      signatureWeapons: [
        { name: "Eldritch Blast", dice: "1d10", type: "force", stat: "CHA", notes: "Cantrip · 120 ft · 1 -> 4 beams" },
        { name: "Light Crossbow", dice: "1d8", type: "piercing", stat: "DEX", notes: "Ammunition 80/320, loading, two-handed" },
        { name: "Dagger", dice: "1d4", type: "piercing", stat: "DEX", notes: "Finesse, light, thrown 20/60" }
      ],
      classActions: [
        {
          name: "Pact Magic",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "Save DC 8 + PB + CHA · Attack d20 + PB + CHA",
          detail: "1 -> 4 slots always cast at your highest slot level; all slots refresh on a short rest."
        },
        {
          name: "Eldritch Blast",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "1d10 force per beam · 2 at Lv 5 · 3 at Lv 11 · 4 at Lv 17",
          detail: "Each beam makes its own ranged spell attack and can target different creatures."
        },
        {
          name: "Hex",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Bonus Action",
          roll: "+1d6 necrotic per hit",
          detail: "1st-level concentration spell; target also has disadvantage on checks with one chosen ability."
        },
        {
          name: "Eldritch Invocations",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Passive",
          roll: "Agonizing Blast: +CHA per beam",
          detail: "Choose permanent upgrades such as Agonizing Blast, Devil's Sight, or Repelling Blast."
        },
        {
          name: "Pact Boon",
          tier: "Advanced",
          unlock: "Lv 3",
          economy: "Passive",
          roll: "Blade, Chain, or Tome",
          detail: "Gain a pact weapon, an improved familiar, or a Book of Shadows with extra cantrips."
        },
        {
          name: "Mystic Arcanum",
          tier: "Advanced",
          unlock: "Lv 11",
          economy: "Action",
          roll: "6th-level spell 1/Long Rest -> up to 9th at Lv 17",
          detail: "Cast one high-level spell per tier once per long rest without a slot."
        }
      ]
    },
    {
      id: "wizard",
      name: "Wizard",
      icon: "📖",
      hitDie: "d6",
      primaryStats: ["INT", "CON"],
      saves: ["INT", "WIS"],
      skillCount: 2,
      skillPool: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
      armor: "None",
      mechanics: [
        { name: "Armor & Save Patching", detail: "Gith/Mountain Dwarf medium armor or Gnome Cunning mental saves harden the d6 chassis." },
        { name: "Portent + Lucky", detail: "Divination Wizard + Halfling Lucky bends probability across entire encounters." }
      ],
      tags: ["int-primary", "mental-saves", "heavy-armor-caster", "lucky-reroll"],
      rp: {
        traits: ["Indexes danger by spell school and component cost mid-combat.", "Guards ink, parchment, and dry boots above food or sleep."],
        ideals: [
          { tag: "Method", text: "Knowledge. Ignorance kills far more adventurers than dragons do." }
        ],
        bonds: ["Reconstructs a scorched grimoire recovered from a collapsed academy."],
        flaws: ["Delays urgent action to verify an obscure marginal rule first."]
      },
      source: "PHB p.112",
      lore: "A Wizard is a scholarly magic-user who masters the arcane through study, recording spells in a spellbook. They own the largest spell list in the game, making them the ultimate battlefield controllers and problem solvers.",
      weapons: "Daggers, darts, slings, quarterstaffs, light crossbows",
      tools: "None",
      subclassTitle: "Arcane Tradition",
      subclassLevel: 2,
      spellAbility: "INT",
      dcAbility: "INT",
      attackPref: "STR_OR_CAST",
      acRule: "Unarmored: 10 + DEX (Mage Armor: 13 + DEX)",
      acCalc: { base: 10, add: ["DEX"], dexCap: null, shield: 0, mageArmor: 13 },
      signatureWeapons: [
        { name: "Fire Bolt", dice: "1d10", type: "fire", stat: "INT", notes: "Cantrip · ranged spell attack 120 ft" },
        { name: "Quarterstaff", dice: "1d6", type: "bludgeoning", stat: "STR", notes: "Versatile 1d8" },
        { name: "Dagger", dice: "1d4", type: "piercing", stat: "DEX", notes: "Finesse, light, thrown 20/60" }
      ],
      classActions: [
        {
          name: "Spellcasting",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action",
          roll: "Save DC 8 + PB + INT · Attack d20 + PB + INT",
          detail: "Prepare INT mod + wizard level spells daily from your spellbook."
        },
        {
          name: "Arcane Recovery",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Short Rest",
          roll: "Recover slots totaling half wizard level, rounded up",
          detail: "Once per day after a short rest; no slot of 6th level or higher."
        },
        {
          name: "Ritual Casting",
          tier: "Core",
          unlock: "Lv 1",
          economy: "Action +10 min",
          roll: "Cast rituals with no slot",
          detail: "Cast any ritual spell in your spellbook without preparing it."
        },
        {
          name: "Arcane Tradition",
          tier: "Core",
          unlock: "Lv 2",
          economy: "Passive",
          roll: "School savant: half gold and time to copy",
          detail: "Choose a school of magic that grants features at Lv 2, 6, 10, and 14."
        },
        {
          name: "Fireball",
          tier: "Advanced",
          unlock: "Lv 5",
          economy: "Action",
          roll: "8d6 fire · DEX save half · 20 ft radius",
          detail: "3rd-level evocation; +1d6 per slot level above 3rd."
        },
        {
          name: "Spell Mastery",
          tier: "Advanced",
          unlock: "Lv 18",
          economy: "Action",
          roll: "1st + 2nd-level spell at will",
          detail: "Cast one chosen 1st-level and one 2nd-level spell at their lowest level without a slot."
        }
      ]
    }
  ],
  SIGNATURE_COMBOS: {
    "half-orc+barbarian": {
      grade: "S",
      epithet: "Undying Crit Juggernaut",
      loop: "Reckless Attack -> Crits add Brutal Critical + Savage Attacks -> Relentless Endurance refuses 0 HP.",
      niches: [
        {
          name: "Triple-Stack Crit Dice",
          detail: "Savage Attacks stacks directly atop Barbarian Brutal Critical on greataxe d12 swings."
        },
        { name: "Double Death-Defiance", detail: "Relentless Endurance triggers alongside Relentless Rage to soak lethal boss bursts." }
      ],
      rpHook: "Turns visceral orcish survival instinct into disciplined rage, using scars to shield frailer allies rather than chasing bloodshed."
    },
    "halfling+wizard": {
      grade: "S",
      epithet: "Probability Architect",
      loop: "Divination Portent + Halfling Lucky + Bountiful Luck strips natural 1s off the entire table.",
      niches: [
        {
          name: "Zero Crit-Fail Engine",
          detail: "Lucky rescues crucial concentration, Counterspell, and initiative rolls when slots are tight."
        },
        { name: "Hide-to-Cast Cover", detail: "Naturally Stealthy ducks behind frontline martials after dropping control spells." }
      ],
      rpHook: "Treats cosmic divination like cozy kitchen-table bookkeeping, refusing to let fate bully anyone they care about."
    },
    "tiefling+warlock": {
      grade: "S",
      epithet: "Shadow-Pact Sovereign",
      loop: "Free racial Darkness + Devil's Sight Eldritch Invocation -> one-way advantage without spending a Pact slot.",
      niches: [
        {
          name: "Zero-Tax Darkness Combo",
          detail: "Infernal Legacy supplies Darkness free once/day, saving scarce 2-slot Warlock casts."
        },
        { name: "Fire + Hellish Rebuke", detail: "Always-on Fire resistance pairs with Armor of Agathys/Rebuke punishment builds." }
      ],
      rpHook: "Uses infernal bloodline aesthetics as armor while quietly out-lawyering an even nastier patron."
    },
    "dwarf+cleric": {
      grade: "S",
      epithet: "Anvil-Born Bastion",
      loop: "Full Heavy Armor with dumped STR + CON +2 -> unbreakable Spirit Guardians frontliner.",
      niches: [
        {
          name: "Free 15-STR Bypass",
          detail: "Dwarven speed immunity ignores heavy armor movement penalties, redirecting points into WIS and CON."
        },
        {
          name: "Poison + Tank Synergy",
          detail: "Poison resistance + Hill Dwarf +1 HP/lvl makes Spirit Guardians nearly impossible to break."
        }
      ],
      rpHook: "Treats liturgy like structural engineering: faith holds because the mortar was mixed properly."
    },
    "dragonborn+paladin": {
      grade: "S",
      epithet: "Conquest Wyrm-Knight",
      loop: "Channel Divinity / Dragon Fear feat -> Aura of Conquest pins frightened foes at 0 speed.",
      niches: [
        {
          name: "Breath-to-Fear Control",
          detail: "Dragon Fear swaps breath damage for a 30-ft save-or-frighten aura feeding Conquest lock."
        },
        { name: "Exact MAD Alignment", detail: "STR +2 / CHA +1 cleanly solves Paladin's steepest stat spread." }
      ],
      rpHook: "Balances rigid draconic honor against an oath whose mercy sometimes demands bending pride."
    },
    "tabaxi+monk": {
      grade: "S",
      epithet: "Mach-4 Skirmisher",
      loop: "Feline Agility doubles Monk Unarmored Movement -> kidnap/stun backline mages and exit cleanly.",
      niches: [
        {
          name: "200+ ft Turn Burst",
          detail: "Feline Agility + Step of the Wind + Climb Speed turns vertical dungeons into flat highways."
        },
        { name: "Built-in Scout Package", detail: "Free Stealth + Perception covers Monk's cramped 2-skill budget." }
      ],
      rpHook: "Fuses obsessive feline curiosity with monastic stillness—patient only until something dangerous moves."
    },
    "half-elf+bard": {
      grade: "S",
      epithet: "Supreme Skill & Face Polymath",
      loop: "Skill Versatility + Expertise + Jack of All Trades -> fluent proficiency in nearly half the skill list.",
      niches: [
        { name: "6-7 Skills at Level 1", detail: "2 racial + 3 class + 2 background unlocks unprecedented party coverage." },
        { name: "Stat Spread Perfection", detail: "CHA +2 plus two +1s balances DEX and CON cleanly on a single-class frame." }
      ],
      rpHook: "Uses social chameleoning to disarm prejudice while privately wondering which persona is real."
    },
    "elf+ranger": {
      grade: "S",
      epithet: "Umbral Elven Sniper",
      loop: "Gloom Stalker Darkvision invisibility + Elven Accuracy -> triple advantage Sharpshooter volleys.",
      niches: [
        {
          name: "Triple-Advantage Crit Engine",
          detail: "Darkness-born invisibility triggers Elven Accuracy on every opening-round arrow."
        },
        { name: "4-Hour Trance Watch", detail: "Watches half the night while recharging spells and foraging undetected." }
      ],
      rpHook: "Walks silent borders for decades, learning to speak softly so short-lived allies are not startled."
    },
    "gnome+wizard": {
      grade: "S",
      epithet: "Iron-Mind Arcanist",
      loop: "Gnome Cunning advantage on INT/WIS/CHA magic saves + INT +2 -> wins caster duels cleanly.",
      niches: [
        {
          name: "Anti-Control Fortress",
          detail: "Advantage on mental saves protects concentration against Hold Person, Dominate, and Fear."
        },
        { name: "Small Cover Leverage", detail: "Minor Illusion creates instant full cover sized specifically for a Small wizard." }
      ],
      rpHook: "Treats existential arcane horrors as fascinating puzzles worth annotating mid-battle."
    },
    "goliath+barbarian": {
      grade: "S",
      epithet: "Avalanche Grappler",
      loop: "Rage resistance + Stone's Endurance + Athletics/Powerful Build -> drags bosses into hazards effortlessly.",
      niches: [
        {
          name: "Post-Resistance Mitigation",
          detail: "Stone's Endurance trims halved physical damage to practically zero, preserving Rage longevity."
        },
        { name: "Auto-Grapple Core", detail: "Free Athletics + Rage advantage + double carry lets you haul two enemies at once." }
      ],
      rpHook: "Keeps strict score of every blow absorbed so teammates never realize how close the wall came to breaking."
    },
    "halfling+rogue": {
      grade: "S",
      epithet: "Unseen Shadow-Slipper",
      loop: "Hide behind Medium ally via Naturally Stealthy -> Guaranteed Sneak Attack + Lucky protects rolls.",
      niches: [
        {
          name: "Ally-Shielded Stealth",
          detail: "Lightfoot Halflings hide right behind their Paladin/Fighter in open rooms with zero terrain."
        },
        { name: "Mathematically Reliable", detail: "Lucky + Reliable Talent renders Stealth/Thieves' Tools natural 1s extinct." }
      ],
      rpHook: "Plays harmless comic relief at court while already knowing which pocket holds the vault key."
    },
    "aasimar+paladin": {
      grade: "S",
      epithet: "Radiant Vanguard",
      loop: "Celestial Revelation + Divine Smite + Aura of Protection -> explosive boss-deletion with twin resistances.",
      niches: [
        { name: "Flight Patch for Melee", detail: "Radiant Soul wings solve Paladin's classic weakness against flying dragons." },
        { name: "Triple Healing Pool", detail: "Lay on Hands + Healing Hands + spell slots keep downed allies standing indefinitely." }
      ],
      rpHook: "Carries terrifying celestial expectations onto muddy battlefields, torn between wrath and mercy."
    }
  }
};

window.FORGE_DATA.SUBRACES = {
  human: [
    {
      id: "variant",
      name: "Variant Human",
      focus: "Bonus Feat + 1 Skill",
      bonus: "Lvl 1 Polearm/Sharpshooter/War Caster unlock",
      tags: ["feat-engine", "flexible"],
      source: "PHB p.31",
      subAsi: "top2",
      extraSkills: ["Any 1 Skill"],
      lore: "Humans whose focused upbringing gives +1 to two abilities, one bonus skill, and a feat at Level 1."
    },
    {
      id: "standard",
      name: "Standard Human",
      focus: "+1 All Six Stats",
      bonus: "Smooths heavy MAD splits & odd point-buy",
      tags: ["mad-solver"],
      source: "PHB p.31",
      subAsi: "all1",
      lore: "Balanced generalists who gain +1 to all six ability scores and an extra language."
    }
  ],
  elf: [
    {
      id: "high",
      name: "High Elf",
      focus: "+1 INT · Wizard Cantrip",
      bonus: "Free Booming Blade / Mage Hand + longbow",
      tags: ["int-lean", "cantrip"],
      source: "PHB p.23",
      subAsi: { INT: 1 },
      lore: "Scholarly elven aristocrats steeped in arcane study, trained in sword and bow and gifted a wizard cantrip."
    },
    {
      id: "wood",
      name: "Wood Elf",
      focus: "+1 WIS · 35 ft · Mask of Wild",
      bonus: "Skirmisher speed + stealth in light natural cover",
      tags: ["hyper-mobility", "stealth-cover"],
      source: "PHB p.24",
      subAsi: { WIS: 1 },
      speedOverride: 35,
      lore: "Reclusive forest elves with keen intuition, 35 ft Fleet of Foot speed, and the knack to vanish into natural cover."
    },
    {
      id: "drow",
      name: "Drow",
      focus: "+1 CHA · 120 ft DV · Darkness",
      bonus: "Innate Faerie Fire + Darkness spells",
      tags: ["innate-darkness", "cha-lean"],
      source: "PHB p.24",
      subAsi: { CHA: 1 },
      visionOverride: "Superior Darkvision 120 ft",
      lore: "Dark elves of the Underdark with 120 ft superior darkvision, innate drow magic, and sunlight sensitivity."
    },
    {
      id: "eladrin",
      name: "Eladrin",
      focus: "Fey Step Seasonal Teleport",
      bonus: "30 ft bonus-action teleport + Charm/Fear/Fire rider",
      tags: ["hyper-mobility", "fear-feat"],
      source: "MToF p.61 / MotM",
      subAsi: { CHA: 1 },
      lore: "Feywild elves whose moods shift with the seasons, granting a Fey Step teleport with a seasonal rider."
    },
    {
      id: "shadar-kai",
      name: "Shadar-kai",
      focus: "Blessing of the Raven Queen",
      bonus: "30 ft teleport + resistance to all damage for 1 round",
      tags: ["damage-mitigation", "hyper-mobility"],
      source: "MToF p.62 / MotM",
      subAsi: { CON: 1 },
      lore: "Shadowfell elves sworn to the Raven Queen, able to teleport and briefly resist all damage."
    },
    {
      id: "sea",
      name: "Sea Elf",
      focus: "+1 CON · 30 ft Swim · Cold Resist",
      bonus: "Amphibious mobility + cold resistance",
      tags: ["con-tank", "elemental-resist"],
      source: "MToF p.62 / MotM",
      subAsi: { CON: 1 },
      lore: "Ocean-dwelling elves who breathe water, swim 30 ft, and shrug off cold."
    },
    {
      id: "astral",
      name: "Astral Elf",
      focus: "Starlight Step + Astral Trance",
      bonus: "Sacred Flame/Light + PB bonus-action teleports + daily skill swap",
      tags: ["hyper-mobility", "skill-monkey"],
      source: "AAG p.11",
      subAsi: { WIS: 1 },
      lore: "Elves of the timeless Astral Sea who channel starlight magic and teleport in radiant steps."
    }
  ],
  dwarf: [
    {
      id: "hill",
      name: "Hill Dwarf",
      focus: "+1 WIS · +1 HP / Level",
      bonus: "Effective +2 CON tankiness for d6/d8 classes",
      tags: ["con-tank", "wis-lean"],
      source: "PHB p.20",
      subAsi: { WIS: 1 },
      hpPerLevel: 1,
      lore: "Gold dwarves of keen senses and deep intuition whose Dwarven Toughness adds +1 HP every level."
    },
    {
      id: "mountain",
      name: "Mountain Dwarf",
      focus: "+2 STR · Medium Armor",
      bonus: "Gives Wizard/Sorcerer instant AC 17 without multiclass",
      tags: ["heavy-armor-caster", "str-lean"],
      source: "PHB p.20",
      subAsi: { STR: 2 },
      lore: "Strong, hardy shield dwarves of rugged peaks, trained in light and medium armor."
    },
    {
      id: "duergar",
      name: "Duergar",
      focus: "Enlarge/Reduce + Invisibility",
      bonus: "Psionic resistance + concentration-free self Enlarge/Invisibility",
      tags: ["stealth-cover", "athletics-grapple"],
      source: "SCAG p.104 / MToF p.81",
      subAsi: { STR: 1 },
      visionOverride: "Superior Darkvision 120 ft",
      lore: "Gray dwarves of the Underdark, hardened by mind flayer enslavement and wielding innate Enlarge and Invisibility."
    }
  ],
  halfling: [
    {
      id: "lightfoot",
      name: "Lightfoot",
      focus: "+1 CHA · Naturally Stealthy",
      bonus: "Hide behind Medium allies every turn",
      tags: ["stealth-cover", "cha-lean"],
      source: "PHB p.28",
      subAsi: { CHA: 1 },
      lore: "Affable, wandering halflings able to hide behind any creature larger than themselves."
    },
    {
      id: "stout",
      name: "Stout",
      focus: "+1 CON · Poison Resistance",
      bonus: "Frontline durability + Lucky safety net",
      tags: ["con-tank", "poison-resist"],
      source: "PHB p.28",
      subAsi: { CON: 1 },
      lore: "Hardy halflings rumored to have dwarven blood, with advantage and resistance against poison."
    },
    {
      id: "ghostwise",
      name: "Ghostwise",
      focus: "+1 WIS · Silent Speech",
      bonus: "30 ft telepathy — cast/communicate silently while Wild Shaped or hidden",
      tags: ["wis-lean", "stealth-cover"],
      source: "SCAG p.110",
      subAsi: { WIS: 1 },
      lore: "Reclusive wildwood halflings who speak telepathically to anyone within 30 ft."
    },
    {
      id: "lotusden",
      name: "Lotusden",
      focus: "+1 WIS · Entangle + Spike Growth",
      bonus: "Innate zone control spells + difficult terrain immunity",
      tags: ["control", "wis-lean"],
      source: "EGtW p.164",
      subAsi: { WIS: 1 },
      lore: "Jungle halflings of Exandria bound to the forest, casting innate Entangle and Spike Growth."
    }
  ],
  dragonborn: [
    {
      id: "phb-ancestry",
      name: "Draconic Ancestry",
      source: "PHB p.34",
      focus: "10 Dragon Types · 2d6 Breath + Resist",
      bonus: "15 ft cone or 5x30 ft line elemental breath, DC 8+CON+PB, plus matching resistance",
      tags: ["aoe-breath", "elemental-resist"],
      subAsi: {},
      lore: "Classical PHB dragonborn bound to one of ten chromatic or metallic dragon lineages, channeling elemental breath and matching damage resistance."
    },
    {
      id: "chromatic",
      name: "Chromatic",
      focus: "Elemental Immunity Burst",
      bonus: "1-min damage immunity + attack-replacing breath",
      tags: ["elemental-resist", "aoe-breath"],
      source: "FToD p.10",
      subAsi: {},
      lore: "Heirs of black, blue, green, red, or white dragons who briefly become immune to their element."
    },
    {
      id: "metallic",
      name: "Metallic",
      focus: "Incapacitating / Repulsion Breath",
      bonus: "Non-lethal AoE knockback or stun breath control",
      tags: ["control", "aoe-breath"],
      source: "FToD p.11",
      subAsi: {},
      lore: "Heirs of brass, bronze, copper, gold, or silver dragons who gain a second enervating or repulsing breath."
    },
    {
      id: "gem",
      name: "Gem",
      focus: "Telepathy + Spectral Flight",
      bonus: "Bonus-action flight + Force/Psychic resistance",
      tags: ["flight-burst", "fear-feat"],
      source: "FToD p.12",
      subAsi: {},
      lore: "Heirs of gem dragons with psionic telepathy and spectral wings for short flights."
    },
    {
      id: "draconblood",
      name: "Draconblood",
      focus: "Darkvision + Forceful Presence",
      bonus: "60 ft Darkvision + reaction Intimidation/Persuasion advantage",
      tags: ["cha-lean", "skill-monkey"],
      source: "EGtW p.168",
      subAsi: {},
      visionOverride: "Darkvision 60 ft",
      lore: "Tailed, aristocratic dragonborn of Exandria with darkvision and a commanding Forceful Presence."
    },
    {
      id: "ravenite",
      name: "Ravenite",
      focus: "Darkvision + Vengeful Assault",
      bonus: "Reaction counterattack when damaged in melee",
      tags: ["melee-lean", "crit-die"],
      source: "EGtW p.168",
      subAsi: {},
      visionOverride: "Darkvision 60 ft",
      lore: "Tailless dragonborn forged in servitude who strike back the moment they are hurt."
    }
  ],
  gnome: [
    {
      id: "rock",
      name: "Rock Gnome",
      focus: "+1 CON · Tinker / History",
      bonus: "Extra concentration buffer + tool expertise",
      tags: ["con-tank", "int-lean"],
      source: "PHB p.37",
      subAsi: { CON: 1 },
      lore: "Inventive tinkerers with expert knowledge of magic items and clockwork devices."
    },
    {
      id: "forest",
      name: "Forest Gnome",
      focus: "+1 DEX · Minor Illusion",
      bonus: "Free Minor Illusion cover for Small ambushers",
      tags: ["stealth-cover", "dex-lean"],
      source: "PHB p.37",
      subAsi: { DEX: 1 },
      lore: "Shy woodland gnomes who know Minor Illusion and speak with small beasts."
    },
    {
      id: "deep",
      name: "Deep Gnome",
      focus: "120 ft DV · Svirfneblin Camouflage",
      bonus: "Disguise Self + Nondetection + Stealth advantage",
      tags: ["stealth-cover", "magic-saves"],
      source: "EEPC p.7 / MToF p.113",
      subAsi: { DEX: 1 },
      visionOverride: "Superior Darkvision 120 ft",
      lore: "Serious Underdark svirfneblin with 120 ft superior darkvision and stone camouflage."
    }
  ],
  tiefling: [
    {
      id: "asmodeus",
      name: "Asmodeus",
      focus: "+1 INT · Darkness + Hellish Rebuke",
      bonus: "Classic caster / Devil's Sight chassis",
      tags: ["innate-darkness", "cha-lean"],
      source: "PHB p.43 / MToF p.21",
      subAsi: { INT: 1 },
      lore: "The classic PHB tiefling bound to Asmodeus, casting Thaumaturgy, Hellish Rebuke, and Darkness."
    },
    {
      id: "levistus",
      name: "Levistus",
      focus: "+1 CON · Ray of Frost + Armor of Agathys",
      bonus: "Melee survival temp HP without burning spell slots",
      tags: ["con-tank", "melee-lean"],
      source: "MToF p.22",
      subAsi: { CON: 1 },
      lore: "Tieflings tied to frozen Stygia who conjure Ray of Frost and Armor of Agathys."
    },
    {
      id: "zariel",
      name: "Zariel",
      focus: "+1 STR · Searing + Branding Smite",
      bonus: "Extra smites per day for Paladin/Valor melee",
      tags: ["smite-crit", "str-lean"],
      source: "MToF p.23",
      subAsi: { STR: 1 },
      lore: "Martial heirs of Avernus who ignite their blows with Searing and Branding Smite."
    },
    {
      id: "glasya",
      name: "Glasya",
      focus: "+1 DEX · Disguise Self + Invisibility",
      bonus: "Rogue/Bard infiltration spell kit",
      tags: ["stealth-cover", "dex-lean"],
      source: "MToF p.22",
      subAsi: { DEX: 1 },
      lore: "Heirs of the queen of thieves blessed with illusion and Invisibility for infiltration."
    },
    {
      id: "dispater",
      name: "Dispater",
      focus: "+1 DEX · Disguise Self + Detect Thoughts",
      bonus: "Social intrigue & interrogation master",
      tags: ["skill-monkey", "dex-lean"],
      source: "MToF p.21",
      subAsi: { DEX: 1 },
      lore: "Descendants of the Iron City's spymaster who read minds and wear disguises."
    },
    {
      id: "mephistopheles",
      name: "Mephistopheles",
      focus: "+1 INT · Burning Hands + Flame Blade",
      bonus: "Arcane blaster bloodline",
      tags: ["int-lean", "aoe-breath"],
      source: "MToF p.23",
      subAsi: { INT: 1 },
      lore: "Arcane heirs of Cania who command Mage Hand, Burning Hands, and Flame Blade."
    },
    {
      id: "winged",
      name: "Winged Tiefling",
      focus: "30 ft Permanent Bat Wings",
      bonus: "At-will concentration-free flight in light/medium armor",
      tags: ["flight-burst", "hyper-mobility"],
      source: "SCAG p.118",
      subAsi: { INT: 1 },
      lore: "Tieflings who trade innate spells for leathery bat wings and a 30 ft flying speed."
    }
  ],
  "half-orc": [
    {
      id: "base",
      name: "Standard Half-Orc",
      focus: "Relentless + Savage Attacks",
      bonus: "Pure melee crit & death-defiance baseline",
      tags: ["crit-die", "cheat-death"],
      source: "PHB p.40",
      subAsi: {},
      lore: "The standard PHB half-orc: menacing, relentless, and brutal on critical hits."
    },
    {
      id: "mark-finding",
      name: "Mark of Finding",
      focus: "+WIS/CON · Hunter's Mark",
      bonus: "Trades Savage Attacks for Perception + tracking utility",
      tags: ["perception", "scout"],
      source: "ERftLW p.48",
      subAsi: {},
      lore: "Dragonmarked trackers of House Tharashk who hunt with innate Hunter's Mark."
    }
  ],
  "half-elf": [
    {
      id: "versatile",
      name: "Skill Versatile",
      focus: "2 Free Skills",
      bonus: "Unmatched face + scout coverage",
      tags: ["skill-monkey", "mad-solver"],
      source: "PHB p.39",
      subAsi: "plus2other",
      lore: "The PHB half-elf: +1 to two abilities of choice and proficiency in any two skills."
    },
    {
      id: "high-heritage",
      name: "High / Moon Elf Descent",
      focus: "Wizard Cantrip",
      bonus: "Free Booming Blade or Minor Illusion on CHA/MAD chassis",
      tags: ["cantrip", "mad-solver"],
      source: "SCAG p.116",
      subAsi: "plus2other",
      skillsOverride: [],
      lore: "Half-elves of high or moon elf blood who trade Skill Versatility for a wizard cantrip or elf weapon training."
    },
    {
      id: "wood-heritage",
      name: "Wood Elf Descent",
      focus: "35 ft Fleet of Foot / Mask of Wild",
      bonus: "Extra movement or natural-cover stealth",
      tags: ["hyper-mobility", "stealth-cover"],
      source: "SCAG p.116",
      subAsi: "plus2other",
      skillsOverride: [],
      speedOverride: 35,
      lore: "Half-elves of wood elf blood who trade Skill Versatility for 35 ft speed or Mask of the Wild."
    },
    {
      id: "drow-heritage",
      name: "Drow Descent",
      focus: "Faerie Fire + Darkness",
      bonus: "Swaps 2 skills for innate Darkness crit engine",
      tags: ["innate-darkness", "triple-advantage"],
      source: "SCAG p.116",
      subAsi: "plus2other",
      skillsOverride: [],
      lore: "Half-elves of drow blood who trade Skill Versatility for innate drow magic."
    },
    {
      id: "aquatic-heritage",
      name: "Aquatic Descent",
      focus: "30 ft Swim Speed",
      bonus: "Naval & underwater skirmisher mobility",
      tags: ["hyper-mobility", "mad-solver"],
      source: "SCAG p.116",
      subAsi: "plus2other",
      skillsOverride: [],
      lore: "Half-elves of sea elf blood who trade Skill Versatility for a 30 ft swim speed."
    }
  ],
  goliath: [
    {
      id: "stone",
      name: "Stone Giant",
      focus: "Stone's Endurance Reaction",
      bonus: "1d12+CON damage mitigation + double carry grapple",
      tags: ["damage-mitigation", "athletics-grapple"],
      source: "PHB 2024 Giant Ancestry",
      subAsi: {},
      lore: "Goliaths of stone giant blood who blunt lethal blows with dense, rock-like bodies."
    },
    {
      id: "cloud",
      name: "Cloud Giant",
      focus: "Cloud's Jaunt Teleport",
      bonus: "PB/day 30 ft bonus-action teleport for melee gap-closing",
      tags: ["hyper-mobility", "melee-lean"],
      source: "PHB 2024 Giant Ancestry",
      subAsi: {},
      lore: "Goliaths of cloud giant blood who teleport 30 ft as a bonus action."
    },
    {
      id: "frost",
      name: "Frost Giant",
      focus: "Frost's Chill Slow + Cold Hit",
      bonus: "1d6 cold + -10 ft target speed on hit",
      tags: ["control", "melee-lean"],
      source: "PHB 2024 Giant Ancestry",
      subAsi: {},
      lore: "Goliaths of frost giant blood whose hits add 1d6 cold and slow foes."
    },
    {
      id: "fire",
      name: "Fire Giant",
      focus: "Fire's Burn Burst",
      bonus: "1d10 bonus fire damage on weapon/spell attack hit",
      tags: ["smite-crit", "melee-lean"],
      source: "PHB 2024 Giant Ancestry",
      subAsi: {},
      lore: "Goliaths of fire giant blood whose strikes add 1d10 fire damage."
    },
    {
      id: "hill-giant",
      name: "Hill Giant",
      focus: "Hill's Tumble Prone",
      bonus: "No-save Prone knockdown on Large or smaller hit",
      tags: ["control", "athletics-grapple"],
      source: "PHB 2024 Giant Ancestry",
      subAsi: {},
      lore: "Goliaths of hill giant blood who knock Large or smaller foes prone on a hit."
    },
    {
      id: "storm",
      name: "Storm Giant",
      focus: "Storm's Thunder Retaliation",
      bonus: "1d8 thunder reaction damage against attackers within 60 ft",
      tags: ["aoe-aura", "damage-mitigation"],
      source: "PHB 2024 Giant Ancestry",
      subAsi: {},
      lore: "Goliaths of storm giant blood who answer blows with 1d8 thunder damage."
    }
  ],
  aasimar: [
    {
      id: "protector",
      name: "Protector",
      focus: "Radiant Soul Flight",
      bonus: "30 ft fly speed solves ranged/dragon kiting",
      tags: ["flight-burst"],
      source: "VGtM p.105",
      subAsi: { WIS: 1 },
      lore: "Guardians of the weak who unfurl radiant wings to fly and smite with light."
    },
    {
      id: "scourge",
      name: "Scourge",
      focus: "Radiant Consumption Aura",
      bonus: "Self-damage aura keeps Barbarian Rage active safely",
      tags: ["melee-lean", "aoe-aura"],
      source: "VGtM p.105",
      subAsi: { CON: 1 },
      lore: "Zealous crusaders who burst into a searing radiant aura that burns foe and self alike."
    },
    {
      id: "fallen",
      name: "Fallen",
      focus: "Necrotic Shroud Fear",
      bonus: "10-ft AoE Frightened fuels Conquest Paladin lockdown",
      tags: ["fear-feat", "aura-saves"],
      source: "VGtM p.105",
      subAsi: { STR: 1 },
      lore: "Aasimar touched by darkness who exude a necrotic shroud that frightens nearby enemies."
    }
  ],
  tabaxi: [
    {
      id: "swift",
      name: "Jungle Stalker",
      focus: "Feline Agility + 20 ft Climb",
      bonus: "Zero-resource double speed burst + Stealth/Perception",
      tags: ["hyper-mobility", "climb-speed"],
      source: "VGtM p.113 flavor",
      subAsi: {},
      lore: "Rainforest ambushers who climb, stalk, and burst into sudden speed."
    },
    {
      id: "snow",
      name: "Snow Leopard",
      focus: "Arctic Camouflage + Climb",
      bonus: "Highland/tundra ambush predator mobility",
      tags: ["stealth-cover", "hyper-mobility"],
      source: "VGtM p.113 flavor",
      subAsi: {},
      lore: "Highland tabaxi who stalk icy cliffs in pale, camouflaging fur."
    }
  ]
};

window.FORGE_DATA.SUBCLASSES = {
  barbarian: [
    {
      id: "totem",
      name: "Totem Warrior",
      focus: "Bear Resistance All-Except-Psychic",
      bonus: "Doubles effective HP; loves Stone's Endurance or Kalashtar/Gnome mind patch",
      tags: ["damage-mitigation", "con-tank"],
      source: "PHB p.50",
      lore: "Barbarians who bond with a spirit animal guide; the Bear totem makes them resist nearly every damage type while raging.",
      subActions: [
        {
          name: "Bear Totem Spirit",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Passive",
          roll: "Resist all damage except psychic while raging",
          detail: "Pairs with Rage to halve almost every hit you take."
        }
      ]
    },
    {
      id: "zealot",
      name: "Path of the Zealot",
      focus: "Radiant Fury + Undying Rage",
      bonus: "Stacks with Relentless Endurance to refuse death completely",
      tags: ["cheat-death", "melee-crit"],
      source: "XGtE p.11",
      lore: "Barbarians fueled by a god of war whose divine fury adds radiant or necrotic damage and refuses to let them die.",
      subActions: [
        {
          name: "Divine Fury",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "1d6 + half barbarian level radiant or necrotic",
          detail: "First hit each turn while raging."
        },
        {
          name: "Rage Beyond Death",
          tier: "Sub-Class",
          unlock: "Lv 14",
          economy: "Passive",
          roll: "Stay up at 0 HP while raging",
          detail: "You only die if still at 0 HP when the rage ends."
        }
      ]
    },
    {
      id: "ancestral",
      name: "Ancestral Guardian",
      focus: "Taunt + Reaction Shield",
      bonus: "Punishes bosses attacking allies while kiting with mobile races",
      tags: ["hyper-mobility", "frontline"],
      source: "XGtE p.9",
      lore: "Barbarians who call on ancestral spirits to shield allies and punish the foes they strike.",
      subActions: [
        {
          name: "Ancestral Protectors",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "Target has disadvantage vs others · allies resist its damage",
          detail: "First creature you hit each turn while raging."
        }
      ]
    },
    {
      id: "berserker",
      name: "Path of the Berserker",
      focus: "Frenzy Bonus Attack",
      bonus: "Extra melee swing every raging turn at the cost of exhaustion",
      tags: ["melee-crit", "frontline"],
      source: "PHB p.49",
      lore: "Barbarians who give themselves over to untamed bloodlust, trading exhaustion for relentless extra attacks.",
      subActions: [
        {
          name: "Frenzy",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Bonus Action",
          roll: "1 extra melee attack each turn while raging",
          detail: "Gain one level of exhaustion when the rage ends."
        },
        {
          name: "Retaliation",
          tier: "Sub-Class",
          unlock: "Lv 14",
          economy: "Reaction",
          roll: "Melee attack when damaged within 5 ft",
          detail: "Strike back at any adjacent creature that damages you."
        }
      ]
    }
  ],
  bard: [
    {
      id: "eloquence",
      name: "College of Eloquence",
      focus: "Minimum 10 Persuasion / Deception",
      bonus: "With Half-Elf Skill Versatility, social rolls physically cannot fail",
      tags: ["skill-monkey", "face"],
      source: "TCoE p.29",
      lore: "Bards who master the art of oratory, never rolling below 10 on Persuasion or Deception.",
      subActions: [
        {
          name: "Unsettling Words",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Bonus Action",
          roll: "Spend Inspiration · subtract die from target's next save",
          detail: "Set up your own spells to land."
        }
      ]
    },
    {
      id: "lore",
      name: "College of Lore",
      focus: "+3 Extra Skills + Cutting Words",
      bonus: "Turn 1 skill master plus Halfling Lucky makes Counterspell automatic",
      tags: ["lucky-reroll", "control-caster"],
      source: "PHB p.54",
      lore: "Bards who collect knowledge from every source, gaining extra skills and the ability to undercut foes with Cutting Words.",
      subActions: [
        {
          name: "Cutting Words",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Reaction",
          roll: "Subtract Inspiration die from enemy attack, check, or damage",
          detail: "Use after the roll but before the result is known."
        }
      ]
    },
    {
      id: "swords",
      name: "College of Swords",
      focus: "Extra Attack + Blade Flourish AC",
      bonus: "Pairs with Elven Accuracy / Hex-style CHA burst",
      tags: ["triple-advantage", "melee-lean"],
      source: "XGtE p.15",
      lore: "Bards who are daring blade performers, weaving flourishes into their weapon attacks.",
      subActions: [
        {
          name: "Blade Flourish",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "Inspiration die to damage + AC, push, or splash",
          detail: "Choose Defensive, Slashing, or Mobile Flourish once per turn."
        }
      ]
    },
    {
      id: "valor",
      name: "College of Valor",
      focus: "Combat Inspiration + Extra Attack",
      bonus: "Medium armor, shields, and martial weapons turn the bard into a frontline skald",
      tags: ["melee-lean", "support"],
      source: "PHB p.55",
      lore: "Skalds who inspire heroics on the battlefield, adding medium armor, shields, and martial weapons to their craft.",
      subActions: [
        {
          name: "Combat Inspiration",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Reaction",
          roll: "Ally adds Inspiration die to damage or AC",
          detail: "Your Inspiration can also boost weapon damage or block a hit."
        },
        {
          name: "Extra Attack",
          tier: "Sub-Class",
          unlock: "Lv 6",
          economy: "Action",
          roll: "2 attacks per Attack action",
          detail: "Attack twice when you take the Attack action."
        }
      ]
    }
  ],
  cleric: [
    {
      id: "twilight",
      name: "Twilight Domain",
      focus: "300 ft Darkvision + Temp HP Aura",
      bonus: "Fixes Human/Dragonborn/Halfling lack of darkvision for the whole party",
      tags: ["no-darkvision-fix", "support"],
      source: "TCoE p.34",
      lore: "Clerics who guard the boundary between light and darkness, granting darkvision and temporary hit points to allies.",
      subActions: [
        {
          name: "Twilight Sanctuary",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Action",
          roll: "1d6 + cleric level temp HP each turn in 30 ft sphere",
          detail: "Channel Divinity aura that also ends charm or fear."
        }
      ]
    },
    {
      id: "light",
      name: "Light Domain",
      focus: "Warding Flare + Fireball",
      bonus: "Tiefling Flames / Fire resistance stacks cleanly with blaster frontlining",
      tags: ["fire-synergy", "fire-resist"],
      source: "PHB p.60",
      lore: "Clerics of gods of sun and fire who wield radiant light to blind attackers and burn foes.",
      subActions: [
        {
          name: "Warding Flare",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "Reaction",
          roll: "Attacker has disadvantage",
          detail: "WIS mod uses per long rest; blinds attackers within 30 ft with divine light."
        },
        {
          name: "Radiance of the Dawn",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Action",
          roll: "2d10 + cleric level radiant · CON save half",
          detail: "Channel Divinity burst that also dispels magical darkness within 30 ft."
        }
      ]
    },
    {
      id: "tempest",
      name: "Tempest Domain",
      focus: "Max-Roll Lightning/Thunder",
      bonus: "Blue/Bronze Dragonborn breath + Heavy Armor Dwarven dump-STR caster",
      tags: ["heavy-armor-caster", "aoe-breath"],
      source: "PHB p.62",
      lore: "Clerics of storm gods who wear heavy armor and unleash thunder and lightning.",
      subActions: [
        {
          name: "Destructive Wrath",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "On Damage",
          roll: "Max lightning or thunder damage",
          detail: "Channel Divinity: deal maximum damage instead of rolling."
        }
      ]
    },
    {
      id: "life",
      name: "Life Domain",
      focus: "Disciple of Life + Heavy Armor",
      bonus: "Strongest healing in the PHB with heavy armor durability",
      tags: ["support", "heavy-armor-caster"],
      source: "PHB p.60",
      lore: "Clerics devoted to positive energy and vitality who wear heavy armor and are the best healers in the game.",
      subActions: [
        {
          name: "Disciple of Life",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "Passive",
          roll: "+2 + spell level to healing spells",
          detail: "Every healing spell of 1st level or higher restores extra HP."
        },
        {
          name: "Preserve Life",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Action",
          roll: "Heal 5 x cleric level split among allies",
          detail: "Channel Divinity; each target can be healed up to half its max HP."
        }
      ]
    }
  ],
  druid: [
    {
      id: "moon",
      name: "Circle of the Moon",
      focus: "Combat Wild Shape",
      bonus: "Retains Lucky, Gnome Cunning, Breath Weapon, and Telepathy inside bear form",
      tags: ["lucky-reroll", "mental-saves", "wildshape-carry"],
      source: "PHB p.69",
      lore: "Druids who guard the wild in beast form, transforming into far more powerful creatures than other druids.",
      subActions: [
        {
          name: "Combat Wild Shape",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "Wild Shape into CR 1 beasts · heal 1d8 per slot level",
          detail: "Shift as a bonus action and burn spell slots to heal while transformed."
        }
      ]
    },
    {
      id: "stars",
      name: "Circle of Stars",
      focus: "Dragon Form Min-10 Concentration",
      bonus: "Locks concentration on Spirit/Summon spells alongside CON/Poison perks",
      tags: ["concentration", "wis-primary"],
      source: "TCoE p.38",
      lore: "Druids who draw power from starlight and constellations, taking on luminous starry forms.",
      subActions: [
        {
          name: "Starry Form: Archer",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "1d8 + WIS radiant ranged spell attack",
          detail: "Use Wild Shape to take a starry form; Dragon form treats concentration rolls of 9 or lower as 10."
        }
      ]
    },
    {
      id: "shepherd",
      name: "Circle of the Shepherd",
      focus: "Summon Swarm Aura",
      bonus: "Halfling/Aasimar backline safety while beasts hold the choke point",
      tags: ["stealth-cover", "support"],
      source: "XGtE p.23",
      lore: "Druids who commune with nature spirits and empower the beasts and fey they summon.",
      subActions: [
        {
          name: "Spirit Totem",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "Bear: 5 + druid level temp HP to allies",
          detail: "Summon a 30 ft spirit aura: Bear, Hawk, or Unicorn."
        }
      ]
    },
    {
      id: "land",
      name: "Circle of the Land",
      focus: "Natural Recovery + Circle Spells",
      bonus: "Extra always-prepared terrain spells and short-rest slot recovery",
      tags: ["control-caster", "concentration"],
      source: "PHB p.68",
      lore: "Druids tied to a specific terrain who gain extra circle spells and recover magic during short rests.",
      subActions: [
        {
          name: "Natural Recovery",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Short Rest",
          roll: "Recover slots totaling half druid level, rounded up",
          detail: "Once per long rest; plus bonus circle spells tied to your land."
        }
      ]
    }
  ],
  fighter: [
    {
      id: "battlemaster",
      name: "Battle Master",
      focus: "Precision Attack + Riposte",
      bonus: "Offsets -5/+10 Great Weapon/Sharpshooter feats from Variant Human",
      tags: ["feat-engine", "nova-burst"],
      source: "PHB p.73",
      lore: "Fighters who treat war as an academic art, using superiority dice to fuel tactical maneuvers.",
      subActions: [
        {
          name: "Combat Superiority",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "4 superiority d8s · Trip, Disarm, Riposte · DC 8 + PB + STR or DEX",
          detail: "Add the die to damage and impose a maneuver effect; dice refresh on a short rest."
        }
      ]
    },
    {
      id: "echo",
      name: "Echo Knight",
      focus: "Teleport Swap + Unleash Incarnation",
      bonus: "Doubles reach/grapple control for Goliath/Bugbear builds",
      tags: ["athletics-grapple", "hyper-mobility"],
      source: "EGtW p.183",
      lore: "Fighters who summon a magical echo of themselves from an alternate timeline to fight beside them.",
      subActions: [
        {
          name: "Manifest Echo",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Bonus Action",
          roll: "AC 14 + PB echo · attack from its space",
          detail: "Swap places with your echo for 15 ft of movement."
        }
      ]
    },
    {
      id: "eldritch",
      name: "Eldritch Knight",
      focus: "Shield/Absorb Elements + Heavy Armor",
      bonus: "High Elf Booming Blade / Gnome Cunning unstoppable tank",
      tags: ["int-lean", "mental-saves"],
      source: "PHB p.74",
      lore: "Fighters who combine martial mastery with abjuration and evocation spells learned through study.",
      spellAbility: "INT",
      subActions: [
        {
          name: "Shield",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Reaction",
          roll: "+5 AC until your next turn",
          detail: "1st-level abjuration from the INT-based Eldritch Knight list."
        },
        {
          name: "War Magic",
          tier: "Sub-Class",
          unlock: "Lv 7",
          economy: "Bonus Action",
          roll: "Weapon attack after a cantrip",
          detail: "Blend cantrips and weapon attacks in one turn."
        }
      ]
    },
    {
      id: "champion",
      name: "Champion",
      focus: "Crit on 19-20",
      bonus: "Simple, reliable crit-fishing that stacks with Half-Orc Savage Attacks",
      tags: ["melee-crit", "crit-die"],
      source: "PHB p.72",
      lore: "Fighters who hone raw physical power to deadly perfection, scoring critical hits far more often.",
      subActions: [
        {
          name: "Improved Critical",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Passive",
          roll: "Crit on 19-20 -> 18-20 at Lv 15",
          detail: "Weapon attacks score a critical hit on a wider range."
        }
      ]
    }
  ],
  monk: [
    {
      id: "mercy",
      name: "Way of Mercy",
      focus: "Hand of Harm Poison + Heal",
      bonus: "Turns ki directly into no-save Poisoned + burst on Tabaxi/Wood Elf skirmishers",
      tags: ["hyper-mobility", "support"],
      source: "TCoE p.49",
      lore: "Monks who manipulate life force to heal allies or inflict lethal harm.",
      subActions: [
        {
          name: "Hand of Harm",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "1 ki -> martial arts die + WIS necrotic",
          detail: "Once per turn; Hand of Healing restores the same amount instead."
        }
      ]
    },
    {
      id: "shadow",
      name: "Way of Shadow",
      focus: "Pass without Trace + Shadow Step",
      bonus: "60 ft Darkness/Dim-light teleport pairs with Drow/Wood Elf stealth",
      tags: ["stealth-cover", "innate-darkness"],
      source: "PHB p.79",
      lore: "Monks trained as ninja and assassins who weave shadow magic and step between dark places.",
      subActions: [
        {
          name: "Shadow Step",
          tier: "Sub-Class",
          unlock: "Lv 6",
          economy: "Bonus Action",
          roll: "Teleport 60 ft dim to dim · advantage on next melee",
          detail: "Shadow Arts at Lv 3 cast Darkness, Pass without Trace, or Silence for 2 ki."
        }
      ]
    },
    {
      id: "open-hand",
      name: "Way of the Open Hand",
      focus: "Prone/Push Flurry Control",
      bonus: "Synergizes with Goliath/athletic lockdown or Halfling Nimble kite",
      tags: ["frontline", "control"],
      source: "PHB p.79",
      lore: "Monks who are masters of unarmed combat, using Flurry of Blows to topple and push enemies.",
      subActions: [
        {
          name: "Open Hand Technique",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "Flurry hit: DEX save or prone, STR save or pushed 15 ft, or no reactions",
          detail: "Applies to each Flurry of Blows hit."
        }
      ]
    },
    {
      id: "four-elements",
      name: "Way of the Four Elements",
      focus: "Ki-Fueled Elemental Spells",
      bonus: "Spend ki to cast elemental disciplines like Fangs of the Fire Snake",
      tags: ["control", "hyper-mobility"],
      source: "PHB p.80",
      lore: "Monks who channel ki into elemental disciplines, bending fire, water, air, and earth as spells.",
      subActions: [
        {
          name: "Elemental Disciplines",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Action",
          roll: "Spend ki to cast elemental spells · DC 8 + PB + WIS",
          detail: "Fangs of the Fire Snake, Water Whip, and more at higher levels."
        }
      ]
    }
  ],
  paladin: [
    {
      id: "conquest",
      name: "Oath of Conquest",
      focus: "0-Speed Frightened Aura",
      bonus: "Dragonborn Dragon Fear or Fallen Aasimar locks entire rooms down",
      tags: ["fear-feat", "aura-saves"],
      source: "XGtE p.37",
      lore: "Paladins who seek glory through domination, terrifying foes and locking them in place.",
      subActions: [
        {
          name: "Conquering Presence",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Action",
          roll: "WIS save or Frightened 1 min within 30 ft",
          detail: "Channel Divinity; Aura of Conquest at Lv 7 drops frightened foes to 0 speed."
        }
      ]
    },
    {
      id: "vengeance",
      name: "Oath of Vengeance",
      focus: "Vow of Enmity Advantage",
      bonus: "Feeds Half-Orc Savage Attacks & Half-Elf Elven Accuracy smite crits",
      tags: ["triple-advantage", "smite-crit"],
      source: "PHB p.87",
      lore: "Paladins sworn to punish grievous wrongdoers at any cost.",
      subActions: [
        {
          name: "Vow of Enmity",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Bonus Action",
          roll: "2d20kh1 vs one target for 1 min",
          detail: "Channel Divinity advantage on all attacks against a creature within 10 ft."
        }
      ]
    },
    {
      id: "devotion",
      name: "Oath of Devotion",
      focus: "Sacred Weapon + Charm Immunity",
      bonus: "Offsets Great Weapon Master penalty while stacking Aura saves",
      tags: ["feat-engine", "aura-saves"],
      source: "PHB p.85",
      lore: "Paladins bound to the classic knightly ideals of honesty, courage, and compassion.",
      subActions: [
        {
          name: "Sacred Weapon",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Action",
          roll: "+CHA mod to attack rolls for 1 min",
          detail: "Channel Divinity makes your weapon magical and shed bright light."
        }
      ]
    },
    {
      id: "ancients",
      name: "Oath of the Ancients",
      focus: "Nature's Wrath + Spell Resistance Aura",
      bonus: "Aura of Warding grants resistance to spell damage for the whole party",
      tags: ["aura-saves", "mental-saves"],
      source: "PHB p.86",
      lore: "Green Knights sworn to preserve light, life, and beauty against darkness.",
      subActions: [
        {
          name: "Nature's Wrath",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Action",
          roll: "STR or DEX save or Restrained",
          detail: "Channel Divinity spectral vines grip a creature within 10 ft."
        },
        {
          name: "Aura of Warding",
          tier: "Sub-Class",
          unlock: "Lv 7",
          economy: "Passive",
          roll: "Resist spell damage within 10 ft",
          detail: "You and allies in your aura resist damage from spells."
        }
      ]
    }
  ],
  ranger: [
    {
      id: "gloom",
      name: "Gloom Stalker",
      focus: "Invisible to Darkvision + Turn-1 Ambush",
      bonus: "Pairs cleanly with Elf/Half-Elf Elven Accuracy & Turn-1 nova",
      tags: ["triple-advantage", "darkvision-ambush"],
      source: "XGtE p.41",
      lore: "Rangers who hunt in the darkest places, invisible to darkvision and deadly in the first round.",
      subActions: [
        {
          name: "Dread Ambusher",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Turn 1",
          roll: "+1 attack · +1d8 dmg · +WIS initiative",
          detail: "Extra attack on your first turn of combat; Umbral Sight hides you from darkvision."
        }
      ]
    },
    {
      id: "fey",
      name: "Fey Wanderer",
      focus: "Add WIS to Charisma Checks",
      bonus: "Solves Ranger social blind spot; stacks with Fey Ancestry / Half-Elf",
      tags: ["skill-monkey", "fey-ancestry"],
      source: "TCoE p.57",
      lore: "Rangers touched by the Feywild who add psychic damage and fey charm to their strikes.",
      subActions: [
        {
          name: "Dreadful Strikes",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "+1d4 psychic -> 1d6 at Lv 11",
          detail: "Once per turn per target; add WIS to CHA checks via Otherworldly Glamour."
        }
      ]
    },
    {
      id: "swarmkeeper",
      name: "Swarmkeeper",
      focus: "15 ft Forced Push / Hover",
      bonus: "Peels threats cleanly for Small/kiting Halfling or Wood Elf builds",
      tags: ["hyper-mobility", "control"],
      source: "TCoE p.59",
      lore: "Rangers bonded with a swarm of nature spirits that harry and displace foes.",
      subActions: [
        {
          name: "Gathered Swarm",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "+1d6 piercing, or push 15 ft, or move yourself 5 ft",
          detail: "Once per turn after hitting a creature."
        }
      ]
    },
    {
      id: "hunter",
      name: "Hunter",
      focus: "Colossus Slayer + Volley",
      bonus: "Extra 1d8 on wounded targets and multi-target attacks",
      tags: ["nova-burst", "frontline"],
      source: "PHB p.93",
      lore: "Rangers who specialize in hunting the greatest threats, from hordes to colossal monsters.",
      subActions: [
        {
          name: "Colossus Slayer",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "+1d8 vs targets below max HP",
          detail: "Once per turn; alternatively Giant Killer or Horde Breaker."
        },
        {
          name: "Multiattack: Volley",
          tier: "Sub-Class",
          unlock: "Lv 11",
          economy: "Action",
          roll: "Ranged attack vs every creature in a 10 ft radius",
          detail: "Alternatively Whirlwind Attack for melee."
        }
      ]
    },
    {
      id: "beast-master",
      name: "Beast Master",
      focus: "Animal Companion + PB Scaling",
      bonus: "A loyal beast flanks foes and adds a second body on the field",
      tags: ["support", "stealth-cover"],
      source: "PHB p.93",
      lore: "Rangers who fight alongside a loyal animal companion trained for war.",
      subActions: [
        {
          name: "Ranger's Companion",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Action",
          roll: "Command a CR 1/4 beast to attack · adds PB",
          detail: "Beast gains your proficiency bonus to AC, attacks, damage, saves, and skills."
        }
      ]
    }
  ],
  rogue: [
    {
      id: "arcane-trickster",
      name: "Arcane Trickster",
      focus: "Booming Blade + Find Familiar Advantage",
      bonus: "High Elf/Forest Gnome INT + free cantrip unlocks solo Sneak Attack",
      tags: ["int-lean", "cantrip"],
      source: "PHB p.97",
      lore: "Rogues who enhance stealth and agility with enchantment and illusion magic.",
      spellAbility: "INT",
      subActions: [
        {
          name: "Mage Hand Legerdemain",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Bonus Action",
          roll: "Invisible hand for sleight of hand",
          detail: "Control Mage Hand with Cunning Action; Magical Ambush at Lv 9 imposes save disadvantage."
        }
      ]
    },
    {
      id: "swashbuckler",
      name: "Swashbuckler",
      focus: "Solo Melee Sneak + CHA Initiative",
      bonus: "Tabaxi/Half-Elf/Lightfoot Halfling dart in, crit, disengage free",
      tags: ["cha-lean", "hyper-mobility"],
      source: "XGtE p.47 / SCAG p.135",
      lore: "Rogues who are dashing duelists, sneak attacking in one-on-one fights and adding CHA to initiative.",
      subActions: [
        {
          name: "Fancy Footwork + Rakish Audacity",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Passive",
          roll: "Sneak Attack with no ally adjacent · +CHA initiative",
          detail: "The creature you attack cannot make opportunity attacks against you this turn."
        }
      ]
    },
    {
      id: "assassin",
      name: "Assassin",
      focus: "Auto-Crit Surprised Targets",
      bonus: "Pairs cleanly with Gloom/Shadow racial Stealth & Pass without Trace",
      tags: ["stealth-cover", "crit-die"],
      source: "PHB p.97",
      lore: "Rogues trained in disguise, poison, and the art of the perfect first strike.",
      subActions: [
        {
          name: "Assassinate",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "On Hit",
          roll: "Auto-crit vs surprised · advantage vs creatures yet to act",
          detail: "Doubles all damage dice including Sneak Attack on surprised targets."
        }
      ]
    },
    {
      id: "thief",
      name: "Thief",
      focus: "Fast Hands + Second-Story Work",
      bonus: "Bonus-action item use and full-speed climbing",
      tags: ["hyper-mobility", "skill-monkey"],
      source: "PHB p.97",
      lore: "Classic burglars and treasure hunters who use items and climb faster than anyone.",
      subActions: [
        {
          name: "Fast Hands",
          tier: "Sub-Class",
          unlock: "Lv 3",
          economy: "Bonus Action",
          roll: "Use an Object or Sleight of Hand via Cunning Action",
          detail: "Second-Story Work also lets you climb at full speed."
        }
      ]
    }
  ],
  sorcerer: [
    {
      id: "clockwork",
      name: "Clockwork Soul",
      focus: "10 Extra Spells + Bastion Shield",
      bonus: "Covers Sorcerer tiny spell list; Mountain Dwarf makes it an AC-18 fortress",
      tags: ["heavy-armor-caster", "control-caster"],
      source: "TCoE p.68",
      lore: "Sorcerers infused with the cosmic order of Mechanus, gaining extra spells and protective wards.",
      subActions: [
        {
          name: "Restore Balance",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "Reaction",
          roll: "Cancel advantage or disadvantage within 60 ft",
          detail: "PB uses per long rest; Bastion of Law at Lv 6 grants a d8 damage ward."
        }
      ]
    },
    {
      id: "aberrant",
      name: "Aberrant Mind",
      focus: "Psionic Subtle Casts + Telepathy",
      bonus: "Gnome/Half-Elf social intrigue without verbal/somatic giveaway",
      tags: ["cha-primary", "skill-monkey"],
      source: "TCoE p.66",
      lore: "Sorcerers touched by far realm psionics who cast silently and speak telepathically.",
      subActions: [
        {
          name: "Psionic Sorcery",
          tier: "Sub-Class",
          unlock: "Lv 6",
          economy: "On Cast",
          roll: "Cast psionic spells with sorcery points and no components",
          detail: "Telepathic Speech at Lv 1 links minds within miles."
        }
      ]
    },
    {
      id: "draconic",
      name: "Draconic Bloodline",
      focus: "Free AC 13+DEX + Element Bonus",
      bonus: "Tiefling Fire affinity + free resistance creates durable blaster chassis",
      tags: ["fire-synergy", "fire-resist"],
      source: "PHB p.102",
      lore: "Sorcerers whose magic flows from dragon ancestry, granting scaly natural armor and elemental power.",
      hpPerLevel: 1,
      subActions: [
        {
          name: "Draconic Resilience",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "Passive",
          roll: "AC 13 + DEX · +1 HP per level",
          detail: "Natural armor while unarmored."
        },
        {
          name: "Elemental Affinity",
          tier: "Sub-Class",
          unlock: "Lv 6",
          economy: "On Damage",
          roll: "+CHA to spell dmg of your element",
          detail: "Spend 1 sorcery point to gain resistance to that element for 1 hour."
        }
      ]
    },
    {
      id: "wild-magic",
      name: "Wild Magic",
      focus: "Tides of Chaos + Surges",
      bonus: "Free advantage that recharges through chaotic Wild Magic Surges",
      tags: ["lucky-reroll", "nova-burst"],
      source: "PHB p.103",
      lore: "Sorcerers whose chaotic power erupts in unpredictable surges.",
      subActions: [
        {
          name: "Tides of Chaos",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "Free",
          roll: "2d20kh1 on one roll",
          detail: "Recharges on a long rest or when the DM triggers a d100 Wild Magic Surge."
        }
      ]
    }
  ],
  warlock: [
    {
      id: "hexblade",
      name: "The Hexblade",
      focus: "CHA Weapons + Medium Armor + Shield",
      bonus: "Solves Paladin/Gish MADness; unlocks Elven Accuracy with CHA attacks",
      tags: ["triple-advantage", "smite-crit"],
      source: "XGtE p.55",
      lore: "Warlocks pledged to a sentient weapon from the Shadowfell, fighting with CHA-powered blades.",
      subActions: [
        {
          name: "Hexblade's Curse",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "Bonus Action",
          roll: "+PB dmg · crit on 19-20 · heal on kill",
          detail: "Curse one creature within 30 ft for 1 minute; Hex Warrior lets you attack with CHA."
        }
      ]
    },
    {
      id: "fiend",
      name: "The Fiend",
      focus: "Temp HP on Kill + Fireball",
      bonus: "Tiefling Fire resistance + Hellish Rebuke turns frontline brawls favorable",
      tags: ["fire-resist", "innate-darkness"],
      source: "PHB p.109",
      lore: "Warlocks bound to a lord of the Lower Planes who reward slaughter with temporary hit points.",
      subActions: [
        {
          name: "Dark One's Blessing",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "On Kill",
          roll: "Temp HP = CHA mod + warlock level",
          detail: "Triggers whenever you reduce a hostile creature to 0 HP."
        }
      ]
    },
    {
      id: "genie",
      name: "The Genie",
      focus: "Free Flight + Proficiency Damage + Vessel",
      bonus: "Bottled Respite pairs with Elf 4-hour Trance for mobile safe rests",
      tags: ["trance-craft", "flight-burst"],
      source: "TCoE p.73",
      lore: "Warlocks bound to a noble genie who grant a magic vessel, bonus damage, and elemental gifts.",
      subActions: [
        {
          name: "Genie's Wrath",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "On Hit",
          roll: "+PB damage of your genie type",
          detail: "Once per turn on an attack hit; Bottled Respite lets you rest inside your vessel."
        }
      ]
    },
    {
      id: "archfey",
      name: "The Archfey",
      focus: "Fey Presence + Misty Escape",
      bonus: "Charm and fear control with invisible escapes",
      tags: ["control-caster", "fey-ancestry"],
      source: "PHB p.108",
      lore: "Warlocks pledged to a fey lord or lady who weave charm, fear, and misty escapes.",
      subActions: [
        {
          name: "Fey Presence",
          tier: "Sub-Class",
          unlock: "Lv 1",
          economy: "Action",
          roll: "WIS save or Charmed or Frightened in 10 ft cube",
          detail: "Once per short rest; Misty Escape at Lv 6 turns you invisible when damaged."
        }
      ]
    }
  ],
  wizard: [
    {
      id: "divination",
      name: "School of Divination",
      focus: "2-3 Forced Portent Rolls",
      bonus: "Halfling Lucky + Bountiful Luck strips natural 1s while Portent locks boss saves",
      tags: ["lucky-reroll", "control-caster"],
      source: "PHB p.116",
      lore: "Wizards who part the veils of time to foresee and replace key rolls.",
      subActions: [
        {
          name: "Portent",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Free",
          roll: "Roll 2d20 at dawn · replace any roll you see",
          detail: "Swap a foreseen roll into any attack, save, or check; 3 dice at Lv 14."
        }
      ]
    },
    {
      id: "bladesinging",
      name: "Bladesinging",
      focus: "AC +INT & Concentration Bonus",
      bonus: "High Elf / Tabaxi mobility + DEX/INT synergy creates untouchable melee caster",
      tags: ["hyper-mobility", "int-lean"],
      source: "TCoE p.76 / SCAG p.141",
      lore: "Elven-style wizards who blend swordplay and spellcasting in a graceful battle dance.",
      subActions: [
        {
          name: "Bladesong",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "Bonus Action",
          roll: "+INT to AC and concentration · +10 ft speed",
          detail: "PB uses per long rest; Extra Attack at Lv 6 can swap one attack for a cantrip."
        }
      ]
    },
    {
      id: "evocation",
      name: "School of Evocation",
      focus: "Sculpt Spells Safe Fireballs",
      bonus: "Mountain Dwarf AC or Gnome Cunning lets you wade forward and drop sculpted blasts",
      tags: ["heavy-armor-caster", "mental-saves"],
      source: "PHB p.117",
      lore: "Wizards who specialize in raw elemental destruction while sparing their allies.",
      subActions: [
        {
          name: "Sculpt Spells",
          tier: "Sub-Class",
          unlock: "Lv 2",
          economy: "On Cast",
          roll: "1 + spell level allies auto-save, take 0",
          detail: "Empowered Evocation at Lv 10 adds INT to evocation damage."
        }
      ]
    }
  ]
};

window.FORGE_DATA.APPENDIX_DATA = {
  abilityStats: [
    ["STR · Strength", "Melee weapon attacks/damage, Athletics, carrying capacity, and heavy armor requirements."],
    ["DEX · Dexterity", "Ranged & finesse attacks, Armor Class in light/medium armor, Initiative, Stealth, and Acrobatics."],
    ["CON · Constitution", "Hit Points per level, Concentration saves to keep spells active, and stamina/poison resilience."],
    ["INT · Intelligence", "Wizard & Artificer spellcasting, Arcana, History, Investigation, Nature, and Religion."],
    ["WIS · Wisdom", "Cleric, Druid & Ranger spellcasting, Perception, Insight, Survival, Medicine, and Will-style saves."],
    ["CHA · Charisma", "Bard, Paladin, Sorcerer & Warlock spellcasting, Persuasion, Deception, and Intimidation."]
  ],
  mechanicsTerms: [
    ["ASI · Ability Score Increase", "Racial or level-up stat bonuses applied to your six core ability scores."],
    ["AC · Armor Class", "Target number an attacker must meet or beat to hit you in combat."],
    ["HP · Hit Points", "Total health pool, scaled each level by your class Hit Die + CON modifier."],
    ["DV · Darkvision", "Ability to see in dim light as bright light and darkness as dim light, usually 60 ft or 120 ft."],
    ["DC · Difficulty Class", "Target number for an ability check or saving throw to succeed."],
    ["PB · Proficiency Bonus", "Level-scaled bonus (+2 to +6) added to proficient skills, saves, attacks, and some racial traits."],
    ["AoE · Area of Effect", "Spells or breath weapons that hit multiple targets in a cone, line, sphere, or aura."],
    ["MAD / SAD", "Multi-Ability Dependent (needs 3+ high stats, e.g. Paladin/Monk) vs Single-Ability Dependent (1 main stat)."],
    ["Saves · Saving Throws", "Your two class-proficient defensive rolls against spells, traps, and conditions."],
    ["d6 / d8 / d10 / d20", "Polyhedral dice by face count; d20 drives attacks, checks, and saves, while d6–d10 drive HP & damage."],
    ["Spell Save DC · Spell Attack", "Save DC is 8 + PB + spellcasting modifier; Spell Attack is 1d20 + PB + spellcasting modifier against the target's AC."],
    ["Hit Dice · HD", "One die per character level, sized by class; spend them during a Short Rest to heal die + Toughness & Stamina modifier each."],
    ["Conditions", "Status effects such as Prone, Grappled, Restrained, Stunned, Frightened, and Charmed that change what a creature can do and how it is attacked."]
  ],
  diceAndCombatTerms: [
    ["Nat 20 · Natural 20 / Critical Hit", "Unmodified 20 on a d20. On an attack roll, automatically hits any AC and doubles all attack damage dice; on a Death Save, immediately restores 1 HP. Raw PHB ability checks and regular saving throws do not auto-succeed on a 20."],
    ["Nat 1 · Natural 1 / Critical Miss", "Unmodified 1 on a d20. On an attack roll, automatically misses regardless of bonuses; on a Death Save, inflicts 2 failures. Halfling Lucky rerolls natural 1s."],
    ["Advantage & Disadvantage", "Roll 2d20 and keep the higher for Advantage or lower for Disadvantage. Multiple sources do not stack, and any Advantage + Disadvantage cancel out to a straight 1d20."],
    ["Action · Bonus Action · Reaction", "Each 6-second round grants Movement + 1 Action + at most 1 Bonus Action when a feature grants one + 1 Reaction per round that resets at the start of your turn."],
    ["Initiative", "Dexterity check 1d20 + Agility & Reflex modifier rolled at the start of battle to set turn order."],
    ["Opportunity Attack", "Reaction melee strike triggered when a visible foe leaves your reach without taking the Disengage action or teleporting."],
    ["Concentration", "Active focus required by ongoing buff or control spells, max one at a time; taking damage forces a Toughness & Stamina save with DC equal to 10 or half the damage taken, whichever is higher."],
    ["Cantrip vs Spell Slot", "Cantrips are Level 0 spells cast at-will without slots whose damage dice scale at character levels 5, 11, and 17; leveled spells 1st through 9th spend Spell Slots."],
    ["Short Rest vs Long Rest", "Short Rest is 1+ hour to spend Hit Dice for healing and recharge short-rest features like Action Surge, Ki, Wild Shape, or Pact Magic; Long Rest is 8 hours or 4-hour Elf Trance to restore full HP and spell slots."],
    ["Temporary Hit Points", "Buffer HP absorbed before real HP; Temp HP from multiple sources never stacks—keep whichever value is higher."],
    ["Resistance · Vulnerability · Immunity", "Resistance halves damage of that type rounded down; Vulnerability doubles it; Immunity reduces it to 0."],
    ["Death Saving Throws", "Rolled at the start of your turn at 0 HP on a flat 1d20 with DC 10; 3 successes stabilize you, 3 failures mean death."],
    ["Finesse · Heavy · Versatile · Light", "Weapon traits: Finesse uses Physical Power or Agility & Reflex; Heavy gives Small races Disadvantage; Versatile uses a bigger die two-handed; Light enables a Bonus Action off-hand attack without adding positive ability modifier to damage."],
    ["Action Surge · Nova · Action Economy", "Combining extra actions, bonus actions, reactions, and on-hit riders like Divine Smite or Maneuvers in a single burst turn."]
  ],
  // PHB Chapter 5 p. 143 Coinage: exchange rates, purchasing power, lore, and coin weight.
  coinage: [
    ["CP · Copper Piece", "100 CP = 1 GP · 10 CP = 1 SP. Everyday coin among laborers and beggars; 1 CP buys a candle, a torch, or a piece of chalk."],
    ["SP · Silver Piece", "10 SP = 1 GP · 1 SP = 10 CP. Most prevalent coin among commoners; 1 SP pays a laborer for a full day of work, a flask of lamp oil, or a night in a poor inn."],
    ["EP · Electrum Piece", "2 EP = 1 GP · 1 EP = 5 SP = 50 CP. Unusual gold-silver alloy coin from fallen empires and lost kingdoms found in treasure hoards; sometimes arouses skepticism in mundane shops."],
    ["GP · Gold Piece", "1 GP = 10 SP = 2 EP = 100 CP. Standard measure of wealth across D&D; 1 GP is a skilled artisan daily wage and buys 50 ft of good rope, a belt pouch, or a goat. Large merchant deals use gold bars or letters of credit."],
    ["PP · Platinum Piece", "1 PP = 10 GP = 100 SP = 1,000 CP. Rare high-value coin minted by fallen empires and ancient kingdoms; draws awe or suspicion in humble settlements."],
    ["Coin Weight & Starting Wealth", "Standard coins weigh one-third of an ounce, so 50 coins of any metal weigh 1 lb. Characters taking coin instead of starting equipment roll class wealth: 5d4 x 10 gp for Bard/Cleric/Fighter/Paladin/Ranger, 4d4 x 10 gp for Rogue/Warlock/Wizard, 3d4 x 10 gp for Sorcerer, 2d4 x 10 gp for Barbarian/Druid, or 5d4 gp for Monk."]
  ]
};

window.FORGE_DATA.DICE_META = { 4: "Tetrahedron · Fixed 1–4", 6: "Cube · Fixed 1–6", 8: "Octahedron · Fixed 1–8", 10: "Trapezohedron · Fixed 1–10", 12: "Dodecahedron · Fixed 1–12", 20: "Icosahedron · Fixed 1–20" };

window.FORGE_DATA.CUBE_FACE_ANGLES = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };

// Quick Loadout: plain-English key ability, main turn action and typical gear per class.
// Sub-class entries add a turn tip and may replace the key stats or the gear line.
window.FORGE_DATA.LOADOUT = {
  barbarian: {
    ability: "Powers your melee hits, your big HP pool, and how long Rage keeps you standing",
    action: "Rage as a bonus action, then swing hard with Reckless Attack for advantage",
    gear: "Greataxe or greatsword, handaxes or javelins to throw, no heavy armor needed",
    sub: {
      totem: { action: "Rage with Bear spirit so almost every hit against you is halved" },
      zealot: { action: "Rage and swing; your first hit each turn adds bonus radiant damage" },
      ancestral: { action: "Rage, hit the biggest threat, and spirits make it weak against your friends" },
      berserker: { action: "Rage, then Frenzy for an extra bonus-action swing every turn" }
    }
  },
  bard: {
    ability: "Fuels your spells, spell saves, and Bardic Inspiration dice for allies",
    action: "Cast a control or support spell, or hand an ally Bardic Inspiration",
    gear: "Rapier, light crossbow, leather armor, and an instrument as your spell focus",
    sub: {
      eloquence: { action: "Talk first, then cast; your inspiration dice are never wasted" },
      lore: { action: "Use Cutting Words to make an enemy miss or fail a check" },
      swords: {
        stats: ["DEX", "CHA"],
        action: "Attack twice with a finesse blade and add a Blade Flourish",
        gear: "Rapier or scimitar, medium armor, instrument focus"
      },
      valor: {
        stats: ["CHA", "DEX"],
        action: "Swing a martial weapon and hand allies Inspiration they can add to damage or AC",
        gear: "Longsword or rapier, shield, scale mail, lute"
      }
    }
  },
  cleric: {
    ability: "WIS drives healing and spell power; CON keeps concentration spells up",
    action: "Cast Spirit Guardians or a healing spell, then attack or cast a cantrip",
    gear: "Mace or warhammer, shield, medium or heavy armor, and a holy symbol",
    sub: {
      twilight: { action: "Turn on Twilight Sanctuary so allies gain temp HP every turn" },
      light: { action: "Blast with Fireball or sacred flame and use Warding Flare to make attackers miss" },
      tempest: {
        action: "Call down Thunderwave or Call Lightning and max the damage with Channel Divinity",
        gear: "Warhammer, shield, heavy armor, and a holy symbol"
      },
      life: {
        action: "Heal with Cure Wounds or Healing Word for extra HP, or Preserve Life to save the party",
        gear: "Mace, shield, chain mail, holy symbol"
      }
    }
  },
  druid: {
    ability: "WIS powers nature spells and healing; CON keeps concentration and HP up",
    action: "Cast a battlefield spell like Entangle, or shift into a beast form",
    gear: "Quarterstaff or scimitar, wooden shield, leather or hide armor, druidic focus",
    sub: {
      moon: { action: "Wild Shape into a tough beast and soak up hits on the front line" },
      stars: { action: "Take Starry Form, then heal or zap with a free bonus-action bolt" },
      shepherd: { action: "Summon animal friends and boost them with your Spirit Totem" },
      land: { action: "Cast control spells from your circle list and recover slots on a short rest" }
    }
  },
  fighter: {
    ability: "Drives your weapon hits, AC, and staying power on the front line",
    action: "Make multiple weapon attacks, and Action Surge for a second full turn",
    gear: "Longsword and shield or a greatsword, plate armor, longbow for range",
    sub: {
      battlemaster: { action: "Attack and spend a superiority die to trip, disarm, or push" },
      echo: { action: "Summon your echo and attack from its spot to reach far targets" },
      eldritch: {
        stats: ["STR", "INT"],
        action: "Attack with your bonded weapon and cast Shield when hit",
        gear: "Longsword and shield, plate armor, bonded weapon as focus"
      },
      champion: { action: "Attack as often as possible; crits land on a 19 or 20" }
    }
  },
  monk: {
    ability: "Powers your unarmored AC, punches, and ki save DCs",
    action: "Attack, then spend ki on Flurry of Blows or Stunning Strike",
    gear: "Unarmed strikes, quarterstaff or shortsword, darts, no armor",
    sub: {
      mercy: { action: "Flurry with Hand of Harm to poison foes, or heal an ally instead" },
      shadow: { action: "Shadow Step between dark spots and strike with advantage" },
      "open-hand": { action: "Flurry of Blows and knock enemies prone or push them away" },
      "four-elements": { action: "Spend ki to cast Fangs of the Fire Snake or Water Whip between flurries" }
    }
  },
  paladin: {
    ability: "Powers your hits, smites, and an aura that boosts nearby allies' saves",
    action: "Attack twice and spend a spell slot to Divine Smite on a hit",
    gear: "Longsword and shield or a greatsword, heavy armor, holy symbol",
    sub: {
      conquest: { action: "Frighten enemies so your aura locks them in place" },
      vengeance: { action: "Use Vow of Enmity on the boss for advantage on every attack" },
      devotion: { action: "Use Sacred Weapon to add CHA to hits and make your weapon glow" },
      ancients: { action: "Root foes with Nature's Wrath and keep allies inside your warding aura" }
    }
  },
  ranger: {
    ability: "Drives your weapon attacks, stealth, and nature spells",
    action: "Attack twice with a bow, or mark a target with Hunter's Mark",
    gear: "Longbow, two shortswords for melee, studded leather or medium armor",
    sub: {
      gloom: { action: "Strike first from the dark with an extra attack on turn one" },
      fey: { action: "Add psychic damage on hits and charm or frighten nearby foes" },
      swarmkeeper: { action: "Hit, then use your swarm to push the foe 15 ft away" },
      hunter: { action: "Mark a target, then hit wounded foes for Colossus Slayer damage" },
      "beast-master": { action: "Command your beast companion to attack while you fire your bow" }
    }
  },
  rogue: {
    ability: "DEX drives attacks, stealth, and AC; the second stat backs your style",
    action: "Attack once with Sneak Attack, then Hide or Dash as a bonus action",
    gear: "Rapier or shortsword, shortbow or hand crossbow, leather armor, thieves' tools",
    sub: {
      "arcane-trickster": {
        stats: ["DEX", "INT"],
        action: "Use Booming Blade or a Mage Hand distraction to land Sneak Attack",
        gear: "Rapier, hand crossbow, leather armor, arcane focus"
      },
      swashbuckler: { stats: ["DEX", "CHA"], action: "Dart in, Sneak Attack one foe, and walk away without opportunity attacks" },
      assassin: {
        action: "Strike first from hiding; hits on surprised foes are automatic crits",
        gear: "Shortsword, shortbow, leather armor, poisoner's kit"
      },
      thief: { action: "Use Fast Hands to drop caltrops or drink a potion, then Sneak Attack" }
    }
  },
  sorcerer: {
    ability: "CHA fuels spell hits, save DCs, and Metamagic; CON keeps concentration up",
    action: "Cast a damage or control spell, tweaked with Metamagic like Quickened or Twinned",
    gear: "Arcane focus such as a crystal or wand, light crossbow, no armor",
    sub: {
      clockwork: { action: "Cast big control spells and use Bastion of Law to shield an ally" },
      aberrant: { action: "Cast psionic spells silently and talk to allies by telepathy" },
      draconic: { action: "Blast with your dragon element and add CHA to the damage" },
      "wild-magic": { action: "Use Tides of Chaos for advantage on a key spell attack" }
    }
  },
  warlock: {
    ability: "CHA powers Eldritch Blast, curses, and pact magic; CON keeps you alive",
    action: "Cast Hex, then fire Eldritch Blast every turn",
    gear: "Arcane focus or pact weapon, light crossbow, leather armor",
    sub: {
      hexblade: {
        stats: ["CHA", "CON"],
        action: "Curse a target, then hit it with a CHA-powered weapon",
        gear: "Longsword or pact blade, shield, medium armor"
      },
      fiend: { action: "Blast foes and gain temp HP every time one drops" },
      genie: { action: "Eldritch Blast with bonus damage from your genie patron" },
      archfey: { action: "Use Fey Presence to charm or frighten a crowd, then Eldritch Blast" }
    }
  },
  wizard: {
    ability: "INT drives spell power and save DCs; CON keeps concentration up",
    action: "Cast a control or blast spell like Web, Fireball, or Hypnotic Pattern",
    gear: "Spellbook, staff or wand as focus, dagger, no armor",
    sub: {
      divination: { action: "Use Portent to swap in a foreseen roll on a key save or attack" },
      bladesinging: {
        stats: ["INT", "DEX"],
        action: "Start Bladesong, then attack and cast a cantrip in melee",
        gear: "Rapier, light armor, spellbook and wand"
      },
      evocation: { action: "Drop a sculpted Fireball that skips your allies" }
    }
  }
};

// Concise 2-3 word Quick Loadout labels for the Center Stage summary card.
window.FORGE_DATA.SHORT_LOADOUT = {
  barbarian: {
    action: "Rage + Reckless",
    gear: "Greataxe, Unarmored",
    sub: {
      totem: { action: "Bear Spirit Rage" },
      zealot: { action: "Radiant Fury Strikes" },
      ancestral: { action: "Spirit Taunt Rage" },
      berserker: { action: "Frenzy Bonus Swing" }
    }
  },
  bard: {
    action: "Inspire + Control",
    gear: "Rapier, Lute, Leather",
    sub: {
      eloquence: { action: "Silver Tongue Casts" },
      lore: { action: "Cutting Words Ward" },
      swords: { stats: ["DEX", "CHA"], action: "Blade Flourish Strikes", gear: "Scimitar, Scale Mail" },
      valor: { stats: ["CHA", "DEX"], action: "Combat Inspiration", gear: "Longsword, Shield" }
    }
  },
  cleric: {
    action: "Spirit Guardians",
    gear: "Mace, Shield, Mail",
    sub: {
      twilight: { action: "Twilight Temp HP" },
      light: { action: "Fireball + Flare" },
      tempest: { action: "Max Thunder Blast", gear: "Warhammer, Heavy Plate" },
      life: { action: "Boosted Party Heals", gear: "Mace, Chain Mail" }
    }
  },
  druid: {
    action: "Control + Wildshape",
    gear: "Staff, Hide, Shield",
    sub: {
      moon: { action: "Combat Wild Shape" },
      stars: { action: "Starry Bolt Form" },
      shepherd: { action: "Totem Beast Summons" },
      land: { action: "Circle Control Casts" }
    }
  },
  fighter: {
    action: "Multi-Attack + Surge",
    gear: "Greatsword, Heavy Plate",
    sub: {
      battlemaster: { action: "Maneuver Strikes" },
      echo: { action: "Echo Swap Strikes" },
      eldritch: { stats: ["STR", "INT"], action: "Blade + Shield", gear: "Bonded Blade, Plate" },
      champion: { action: "19-20 Crit Swings" }
    }
  },
  monk: {
    action: "Flurry + Stun",
    gear: "Fists, Quarterstaff",
    sub: {
      mercy: { action: "Harm & Heal" },
      shadow: { action: "Shadow Step Strike" },
      "open-hand": { action: "Knockdown Flurry" },
      "four-elements": { action: "Elemental Ki Strikes" }
    }
  },
  paladin: {
    action: "Attack + Smite",
    gear: "Longsword, Shield, Plate",
    sub: {
      conquest: { action: "Fear Lock Aura" },
      vengeance: { action: "Vow Boss Strikes" },
      devotion: { action: "Sacred Weapon Smite" },
      ancients: { action: "Spell-Ward Aura" }
    }
  },
  ranger: {
    action: "Mark + Volley",
    gear: "Longbow, Twin Blades",
    sub: {
      gloom: { action: "Dread Ambush Burst" },
      fey: { action: "Misty Psychic Shot" },
      swarmkeeper: { action: "Swarm Push Shot" },
      hunter: { action: "Colossus Slayer Shot" },
      "beast-master": { action: "Beast + Bow" }
    }
  },
  rogue: {
    action: "Sneak + Cunning",
    gear: "Rapier, Shortbow",
    sub: {
      "arcane-trickster": { stats: ["DEX", "INT"], action: "Booming Sneak Blade", gear: "Rapier, Arcane Focus" },
      swashbuckler: { stats: ["DEX", "CHA"], action: "Fancy Footwork Duel" },
      assassin: { action: "Surprise Auto-Crit", gear: "Shortsword, Poison Kit" },
      thief: { action: "Fast Hands Sneak" }
    }
  },
  sorcerer: {
    action: "Metamagic Blasts",
    gear: "Crystal Focus, Robes",
    sub: {
      clockwork: { action: "Bastion Ward Casts" },
      aberrant: { action: "Psionic Mind Lance" },
      draconic: { action: "Dragon Element Blast" },
      "wild-magic": { action: "Tides Chaos Casts" }
    }
  },
  warlock: {
    action: "Hex + Blast",
    gear: "Rod Focus, Leather",
    sub: {
      hexblade: { stats: ["CHA", "CON"], action: "Hexblade Curse Slash", gear: "Pact Blade, Shield" },
      fiend: { action: "Hellfire Temp HP" },
      genie: { action: "Genie Wrath Blast" },
      archfey: { action: "Fey Charm Blast" }
    }
  },
  wizard: {
    action: "Control + Rituals",
    gear: "Spellbook, Staff",
    sub: {
      divination: { action: "Portent Roll Swap" },
      bladesinging: { stats: ["INT", "DEX"], action: "Bladesong Slash", gear: "Rapier, Light Armor" },
      evocation: { action: "Sculpted Fireball" }
    }
  }
};

// Combat Actions: universal PHB actions any character can take on a turn.
window.FORGE_DATA.COMBAT_ACTIONS = [
  {
    name: "Attack",
    category: "Standard Action",
    economy: "Action",
    roll: "d20 + ability mod + PB vs AC · damage die + ability mod",
    detail: "Make one melee or ranged weapon attack, or more with Extra Attack; STR for melee, DEX for ranged or finesse."
  },
  {
    name: "Cast a Spell",
    category: "Standard Action",
    economy: "Action",
    roll: "Spell attack d20 + spell mod + PB · Save DC 8 + spell mod + PB",
    detail: "Cast a spell with a casting time of 1 action, expending a slot unless it is a cantrip."
  },
  {
    name: "Dash",
    category: "Standard Action",
    economy: "Action",
    roll: "+speed to movement this turn",
    detail: "Gain extra movement equal to your current speed after modifiers."
  },
  {
    name: "Disengage",
    category: "Standard Action",
    economy: "Action",
    roll: "No opportunity attacks this turn",
    detail: "Your movement does not provoke opportunity attacks for the rest of the turn."
  },
  {
    name: "Dodge",
    category: "Standard Action",
    economy: "Action",
    roll: "Attacks vs you at disadvantage · DEX saves at advantage",
    detail: "Lasts until your next turn; lost if you are incapacitated or your speed drops to 0."
  },
  {
    name: "Help",
    category: "Standard Action",
    economy: "Action",
    roll: "Ally gains 2d20kh1 on next check or attack",
    detail: "Aid a task, or distract a foe within 5 ft so an ally has advantage on its next attack against it."
  },
  {
    name: "Hide",
    category: "Standard Action",
    economy: "Action",
    roll: "DEX Stealth vs passive WIS Perception",
    detail: "On success you are unseen; attacks against unseen targets have advantage and attacking reveals you."
  },
  {
    name: "Ready",
    category: "Standard Action",
    economy: "Action + Reaction",
    roll: "Set a trigger and response",
    detail: "Act on a perceivable trigger with your reaction; a readied spell needs concentration until released."
  },
  {
    name: "Search",
    category: "Standard Action",
    economy: "Action",
    roll: "WIS Perception or INT Investigation check",
    detail: "Devote your attention to finding a hidden creature or object."
  },
  {
    name: "Use an Object",
    category: "Standard Action",
    economy: "Action",
    roll: "Interact with a second object",
    detail: "Use gear needing an action such as a healer's kit or caltrops; the first object interaction each turn is free."
  },
  {
    name: "Grapple",
    category: "Tactical Attack",
    economy: "Replaces 1 attack",
    roll: "STR Athletics vs STR Athletics or DEX Acrobatics",
    detail: "Target up to one size larger is Grappled with speed 0; drag it at half speed."
  },
  {
    name: "Shove",
    category: "Tactical Attack",
    economy: "Replaces 1 attack",
    roll: "STR Athletics vs STR Athletics or DEX Acrobatics",
    detail: "Knock the target prone or push it 5 ft away; target up to one size larger."
  },
  {
    name: "Two-Weapon Fighting",
    category: "Bonus / Reaction",
    economy: "Bonus Action",
    roll: "Off-hand light weapon die · no ability mod to damage",
    detail: "After attacking with a light melee weapon, attack with a different light melee weapon in the other hand."
  },
  {
    name: "Opportunity Attack",
    category: "Bonus / Reaction",
    economy: "Reaction",
    roll: "1 melee attack as a foe leaves your reach",
    detail: "Avoided by Disengage, teleportation, or forced movement."
  },
  {
    name: "Critical Hit",
    category: "Damage & Survival",
    economy: "On Nat 20",
    roll: "Roll all damage dice twice · add mods once",
    detail: "A natural 20 always hits; doubles weapon, Sneak Attack, Smite, and other bonus dice."
  },
  {
    name: "Death Saving Throw",
    category: "Damage & Survival",
    economy: "Start of turn at 0 HP",
    roll: "d20: 10+ success · 9- failure · nat 1 = 2 failures · nat 20 = 1 HP",
    detail: "Three successes stabilize, three failures kill; damage at 0 HP adds a failure, two on a crit."
  }
];

// Sheet builder data: all 18 PHB skills sorted alphabetically with their governing ability.
window.FORGE_DATA.SKILLS_ALL = [
  { name: "Acrobatics", stat: "DEX" },
  { name: "Animal Handling", stat: "WIS" },
  { name: "Arcana", stat: "INT" },
  { name: "Athletics", stat: "STR" },
  { name: "Deception", stat: "CHA" },
  { name: "History", stat: "INT" },
  { name: "Insight", stat: "WIS" },
  { name: "Intimidation", stat: "CHA" },
  { name: "Investigation", stat: "INT" },
  { name: "Medicine", stat: "WIS" },
  { name: "Nature", stat: "INT" },
  { name: "Perception", stat: "WIS" },
  { name: "Performance", stat: "CHA" },
  { name: "Persuasion", stat: "CHA" },
  { name: "Religion", stat: "INT" },
  { name: "Sleight of Hand", stat: "DEX" },
  { name: "Stealth", stat: "DEX" },
  { name: "Survival", stat: "WIS" }
];

// PHB chapter 4 backgrounds: two skill proficiencies, tool kit line, signature feature and a short pitch.
window.FORGE_DATA.BACKGROUNDS = [
  {
    id: "acolyte", name: "Acolyte", source: "PHB p.127",
    skills: ["Insight", "Religion"], tools: "None · two extra languages",
    feature: "Shelter of the Faithful",
    desc: "Raised in temple service; you and your companions receive free healing and care at shrines of your faith."
  },
  {
    id: "charlatan", name: "Charlatan", source: "PHB p.128",
    skills: ["Deception", "Sleight of Hand"], tools: "Disguise kit, forgery kit",
    feature: "False Identity",
    desc: "A practiced con artist with a second, fully documented persona and a knack for forged papers."
  },
  {
    id: "criminal", name: "Criminal", source: "PHB p.129",
    skills: ["Deception", "Stealth"], tools: "One gaming set, thieves' tools",
    feature: "Criminal Contact",
    desc: "Experienced lawbreaker with a reliable liaison to an underworld network of fences and smugglers."
  },
  {
    id: "entertainer", name: "Entertainer", source: "PHB p.130",
    skills: ["Acrobatics", "Performance"], tools: "Disguise kit, one musical instrument",
    feature: "By Popular Demand",
    desc: "Crowd-pleasing performer who can always find a stage, free lodging, and food in exchange for a show."
  },
  {
    id: "folk-hero", name: "Folk Hero", source: "PHB p.131",
    skills: ["Animal Handling", "Survival"], tools: "One artisan's tools, land vehicles",
    feature: "Rustic Hospitality",
    desc: "Humble champion of common folk who will hide and shelter you from the law or pursuers."
  },
  {
    id: "guild-artisan", name: "Guild Artisan", source: "PHB p.132",
    skills: ["Insight", "Persuasion"], tools: "One artisan's tools · one extra language",
    feature: "Guild Membership",
    desc: "Skilled crafter backed by a guild that offers lodging, legal aid, and political connections."
  },
  {
    id: "hermit", name: "Hermit", source: "PHB p.134",
    skills: ["Medicine", "Religion"], tools: "Herbalism kit · one extra language",
    feature: "Discovery",
    desc: "Years of secluded contemplation revealed a unique and powerful truth about the cosmos."
  },
  {
    id: "noble", name: "Noble", source: "PHB p.135",
    skills: ["History", "Persuasion"], tools: "One gaming set · one extra language",
    feature: "Position of Privilege",
    desc: "Born to wealth and title; high society welcomes you and commoners try to accommodate you."
  },
  {
    id: "outlander", name: "Outlander", source: "PHB p.136",
    skills: ["Athletics", "Survival"], tools: "One musical instrument · one extra language",
    feature: "Wanderer",
    desc: "Grew up in the wilds with an excellent memory for terrain and the ability to forage for six people."
  },
  {
    id: "sage", name: "Sage", source: "PHB p.137",
    skills: ["Arcana", "History"], tools: "None · two extra languages",
    feature: "Researcher",
    desc: "Lifelong scholar who knows exactly which library, archive, or expert holds the missing answer."
  },
  {
    id: "sailor", name: "Sailor", source: "PHB p.139",
    skills: ["Athletics", "Perception"], tools: "Navigator's tools, water vehicles",
    feature: "Ship's Passage",
    desc: "Seasoned deckhand who can secure free passage on sailing ships for yourself and companions."
  },
  {
    id: "soldier", name: "Soldier", source: "PHB p.140",
    skills: ["Athletics", "Intimidation"], tools: "One gaming set, land vehicles",
    feature: "Military Rank",
    desc: "Veteran of an army or mercenary company; loyal troops still recognize and defer to your rank."
  },
  {
    id: "urchin", name: "Urchin", source: "PHB p.141",
    skills: ["Sleight of Hand", "Stealth"], tools: "Disguise kit, thieves' tools",
    feature: "City Secrets",
    desc: "Street-raised survivor who knows the hidden alleys that let you move through a city at double speed."
  }
];

// Default background per class when the player has not picked one.
window.FORGE_DATA.CLASS_DEFAULT_BG = {
  barbarian: "outlander", bard: "entertainer", cleric: "acolyte", druid: "hermit",
  fighter: "soldier", monk: "hermit", paladin: "noble", ranger: "outlander",
  rogue: "charlatan", sorcerer: "hermit", warlock: "charlatan", wizard: "sage"
};

window.FORGE_DATA.ALIGNMENTS = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil"
];

// Lore-authentic name suggestions per species, drawn from PHB and Volo's naming tables.
window.FORGE_DATA.NAME_BANK = {
  human: ["Aldric", "Brienne", "Cassian", "Darvin", "Esvele", "Helder", "Kethra", "Morgan"],
  elf: ["Aelar", "Thia", "Erevan", "Naivara", "Soveliss", "Keyleth", "Galinndan", "Shava"],
  dwarf: ["Bruenor", "Eldeth", "Harbek", "Vistra", "Thoradin", "Audhild", "Rurik", "Kathra"],
  halfling: ["Milo", "Seraphina", "Roscoe", "Kithri", "Garret", "Verna", "Osborn", "Lavinia"],
  dragonborn: ["Arjhan", "Sora", "Medrash", "Kava", "Balasar", "Farideh", "Rhogar", "Surina"],
  gnome: ["Boddynock", "Ellywick", "Dimble", "Nissa", "Fonkin", "Bimpnottin", "Zook", "Waywocket"],
  tiefling: ["Akmenos", "Kallista", "Damakos", "Orianna", "Mordai", "Nemeia", "Leucis", "Rieta"],
  "half-orc": ["Krusk", "Baggi", "Thokk", "Yevelda", "Dench", "Ovak", "Mhurren", "Shautha"],
  "half-elf": ["Arannis", "Elara", "Corwin", "Mialee", "Theren", "Lianna", "Kaelen", "Seraphine"],
  goliath: ["Aukan", "Vaunea", "Gauthak", "Keothi", "Thotham", "Pethani", "Vimak", "Nalla"],
  aasimar: ["Aurelia", "Cassiel", "Elarion", "Imrael", "Lumiel", "Seraphiel", "Thalion", "Valenna"],
  tabaxi: ["Cloud on the Mountaintop", "Five Timber", "Jade Shoe", "Left-Handed Hummingbird", "Seven Thundercloud", "Skirt of Snakes", "Smoking Mirror", "Rain on Dry Stone"]
};

// Starting equipment choice groups per class. Each group lists mutually exclusive options the user must pick; fixed groups are always granted.
window.FORGE_DATA.STARTING_EQUIPMENT_CHOICES = {
  barbarian: [
    { label: "Weapon 1", options: ["Greataxe", "Any Martial Melee Weapon"] },
    { label: "Weapon 2", options: ["Two Handaxes", "Any Simple Weapon"] },
    { label: "Pack", fixed: true, options: ["Explorer's Pack + 4 Javelins"] }
  ],
  bard: [
    { label: "Weapon", options: ["Rapier", "Longsword", "Any Simple Weapon"] },
    { label: "Pack", options: ["Diplomat's Pack", "Entertainer's Pack"] },
    { label: "Instrument", options: ["Lute", "Any Other Musical Instrument"] },
    { label: "Always Included", fixed: true, options: ["Leather Armor + Dagger"] }
  ],
  cleric: [
    { label: "Weapon", options: ["Mace", "Warhammer if proficient"] },
    { label: "Armor", options: ["Scale Mail", "Leather Armor", "Chain Mail if proficient"] },
    { label: "Ranged", options: ["Light Crossbow + 20 Bolts", "Any Simple Weapon"] },
    { label: "Pack", options: ["Priest's Pack", "Explorer's Pack"] },
    { label: "Always Included", fixed: true, options: ["Shield + Holy Symbol"] }
  ],
  druid: [
    { label: "Off-Hand", options: ["Wooden Shield", "Any Simple Weapon"] },
    { label: "Weapon", options: ["Scimitar", "Any Simple Melee Weapon"] },
    { label: "Always Included", fixed: true, options: ["Leather Armor + Explorer's Pack + Druidic Focus"] }
  ],
  fighter: [
    { label: "Armor", options: ["Chain Mail", "Leather Armor + Longbow + 20 Arrows"] },
    { label: "Weapons", options: ["Martial Weapon + Shield", "Two Martial Weapons"] },
    { label: "Ranged", options: ["Light Crossbow + 20 Bolts", "Two Handaxes"] },
    { label: "Pack", options: ["Dungeoneer's Pack", "Explorer's Pack"] }
  ],
  monk: [
    { label: "Weapon", options: ["Shortsword", "Any Simple Weapon"] },
    { label: "Pack", options: ["Dungeoneer's Pack", "Explorer's Pack"] },
    { label: "Always Included", fixed: true, options: ["10 Darts"] }
  ],
  paladin: [
    { label: "Weapons", options: ["Martial Weapon + Shield", "Two Martial Weapons"] },
    { label: "Secondary", options: ["Five Javelins", "Any Simple Melee Weapon"] },
    { label: "Pack", options: ["Priest's Pack", "Explorer's Pack"] },
    { label: "Always Included", fixed: true, options: ["Chain Mail + Holy Symbol"] }
  ],
  ranger: [
    { label: "Armor", options: ["Scale Mail", "Leather Armor"] },
    { label: "Weapons", options: ["Two Shortswords", "Two Simple Melee Weapons"] },
    { label: "Pack", options: ["Dungeoneer's Pack", "Explorer's Pack"] },
    { label: "Always Included", fixed: true, options: ["Longbow + Quiver of 20 Arrows"] }
  ],
  rogue: [
    { label: "Weapon", options: ["Rapier", "Shortsword"] },
    { label: "Secondary", options: ["Shortbow + Quiver of 20 Arrows", "Shortsword"] },
    { label: "Pack", options: ["Burglar's Pack", "Dungeoneer's Pack", "Explorer's Pack"] },
    { label: "Always Included", fixed: true, options: ["Leather Armor + Two Daggers + Thieves' Tools"] }
  ],
  sorcerer: [
    { label: "Weapon", options: ["Light Crossbow + 20 Bolts", "Any Simple Weapon"] },
    { label: "Focus", options: ["Component Pouch", "Arcane Focus"] },
    { label: "Pack", options: ["Dungeoneer's Pack", "Explorer's Pack"] },
    { label: "Always Included", fixed: true, options: ["Two Daggers"] }
  ],
  warlock: [
    { label: "Weapon", options: ["Light Crossbow + 20 Bolts", "Any Simple Weapon"] },
    { label: "Focus", options: ["Component Pouch", "Arcane Focus"] },
    { label: "Pack", options: ["Scholar's Pack", "Dungeoneer's Pack"] },
    { label: "Always Included", fixed: true, options: ["Leather Armor + Any Simple Weapon + Two Daggers"] }
  ],
  wizard: [
    { label: "Weapon", options: ["Quarterstaff", "Dagger"] },
    { label: "Focus", options: ["Component Pouch", "Arcane Focus"] },
    { label: "Pack", options: ["Scholar's Pack", "Explorer's Pack"] },
    { label: "Always Included", fixed: true, options: ["Spellbook"] }
  ]
};
