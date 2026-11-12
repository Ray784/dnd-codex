# D&D 5e Player Codex — Builds, Sheets & Tactical Playbook

Zero-dependency interactive **D&D 5e Character Builder, Vector Character Sheet Generator & Tactical Gameplay Companion**.

## What It Does

- **12 × 12 Species × Class Synergy Matrix:** Live `Combat`, `Synergy`, and `Durability` ratings, sub-race & sub-class comparison previews, upgrade paths, and 144 custom species-by-class portraits (`images/portraits/<class>/<species>.webp`) with instant LQIP double-buffered crossfades.
- **5-Step Character Sheet Builder & Live Sheet Preview:** Guided creation workflow (Identity & Appearance, Standard Array / 27-Point Buy / Slot-Targeted `4d6` Drop Lowest with a sticky 3D polyhedral dice dock, Skills & Starting Equipment with *PHB* p. 143 coinage reference, Roleplay Matrix, and Review Gate) paired with a live two-card Character Sheet Preview.
- **Unified Vector + Grayscale Portrait PDF Engine:** Dependency-free client-side PDF 1.4 generator (`js/playbook.js`) that embeds a print-tuned grayscale character portrait (`/DCTDecode` XObject) and produces the exact same 3-page Character Sheet + Tactical Playbook for both **Print Sheet** and **Export PDF**.
- **Tactical Playbook & Turn-by-Turn Maximizer:** Build- and level-aware (`Lv 1–20`) 4-phase action-economy blueprint (`Turn 1 Opening Setup`, `Turn 2+ Sustained Max Loop`, `Boss / Nova Turn`, `Off-Turn Reaction`), strike & defense combinations, and build-specific rule interactions.

## Roadmap & Future Scope

- **Live In-Game Session Mode:** Lock a finished character sheet into an active table view with HP / Temp HP / Death Save tracking, Spell Slot & Class Resource expenditure, and 1-click Short / Long Rest recovery.
- **Context-Aware Gameplay Suggestions:** Real-time turn advisor suggesting optimal actions, bonus actions, reactions, and positioning based on remaining resources, active conditions, and party state.
- **Campaign & Session Notes:** Structured session logs, NPC / quest trackers, loot ledgers, and persistent per-campaign journal entries alongside your character sheet.

---

## Die Randomness Algorithm & 3D Roll Physics

Every die roll in the app (`d4`, `d6`, `d8`, `d10`, `d12`, `d20`, ability-score `4d6`, and inline attack/damage rolls) uses **cryptographically secure rejection sampling** decoupled from a **deterministic 3D landing solver** so rolls are both mathematically unbiased and physically readable.

### 1. Why Naive `Math.random()` and `rand % sides` Are Biased

1. `Math.random()` uses a non-cryptographic browser PRNG (`xorshift128+`) not intended for fair gaming draws.
2. Even with a 32-bit random integer `rand` in `[0, 2^32 - 1]` (`4,294,967,296` values), computing `(rand % sides) + 1` directly introduces **modulo bias** whenever `sides` does not evenly divide `2^32`:
   - For a **`d6`**: `4,294,967,296 % 6 = 4`, so faces `1, 2, 3, 4` each receive `715,827,883` integers while `5, 6` receive `715,827,882`.
   - For a **`d20`**: `4,294,967,296 % 20 = 16`, over-weighting faces `1–16` relative to `17–20` (slightly depressing `Nat 20`!).

### 2. Unbiased CSPRNG Rejection Sampling (`rollUniform` in `js/app.js`)

```js
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
```

- **Entropy source:** `crypto.getRandomValues` pulls 32 bits from the OS CSPRNG.
- **Rejection threshold (`limit`):** Largest exact multiple of `sides` less than or equal to `2^32` (`0x100000000 = 4,294,967,296`). Any draw in the incomplete tail `[limit, 2^32 - 1]` is discarded and re-drawn, leaving **zero modulo bias** (`P(face = k) = 1 / sides` exactly).

#### Worked Example A — Rolling a `d6` & `4d6 Drop Lowest` (`scoreRollSet`)

1. **Threshold calculation (`sides = 6`):**
   - `limit = Math.floor(4294967296 / 6) * 6 = 715827882 * 6 = 4294967292`.
   - Valid range: `0 .. 4,294,967,291` (every face `1..6` maps to **exactly** `715,827,882` integers). The 4 tail values `4,294,967,292 .. 4,294,967,295` are rejected.
2. **Four `d6` draws for an Ability Score slot:**
   - **Roll 1:** OS CSPRNG draws `4,294,967,294` -> `>= 4,294,967,292` (**rejected**, re-drawn!) -> next draw `19,088,743` `< limit` -> `(19088743 % 6) + 1 = 1 + 1 =` **`2`**.
   - **Roll 2:** Draws `3,000,000,005` `< limit` -> `(3000000005 % 6) + 1 = 5 + 1 =` **`6`**.
   - **Roll 3:** Draws `1,200,000,003` `< limit` -> `(1200000003 % 6) + 1 = 3 + 1 =` **`4`**.
   - **Roll 4:** Draws `800,000,002` `< limit` -> `(800000002 % 6) + 1 = 4 + 1 =` **`5`**.
3. **Drop-Lowest scoring (`scoreRollSet([2, 6, 4, 5])`):**
   - Scans the 4-die array for the minimum value (`droppedIdx = 0`, value `2`), marks that pip dropped in the UI (`[2̶, 6, 4, 5]`), and sums the remaining three dice: `6 + 4 + 5 =` **`15`**.

#### Worked Example B — Rolling a `d20` Attack or Saving Throw

- `sides = 20` -> `limit = Math.floor(4294967296 / 20) * 20 = 214748364 * 20 = 4294967280`.
- The top 16 integers (`4,294,967,280 .. 4,294,967,295`) are rejected; every outcome from **`1` (Nat 1)** to **`20` (Nat 20)** maps to `214,748,364 / 4,294,967,280 = 5.0000000%` exact probability.

### 3. Decelerating 3D Tumble & Post-Animation Reveal

To give rolls physical weight without biasing the random result:

1. **Draw first, reveal last:** `finalVal = rollUniform(sides)` is sampled once when clicked, but `state.dice.values[sides]` and ability-score pips stay hidden until the 3D roll finishes (`settle()`).
2. **Forward-only multi-cycle target (`exactSpinTarget`):** Given current angle `cur`, the target face orientation `target` (from `CUBE_FACE_ANGLES` for `d6` or `DICE_3D.getLandingPose` for `d4/d8/d10/d12/d20`), period `P` (`360°` or `2π`), and random `cycles` in `{2, 3}`:
   ```js
   const base = cur + cycles * P;
   const k = Math.ceil((base - target) / P);
   const endAngle = target + k * P;
   ```
   For example, if the `d6` rests at `cur = 90°`, `finalVal = 6` requires `target = 180°`, and `cycles = 3`, then `base = 90 + 1080 = 1170`, `k = Math.ceil((1170 - 180) / 360) = 3`, and `endAngle = 180 + 1080 = 1260°` (`3.25` smooth forward revolutions landing flush on face `6`).
3. **Table-friction easing (`naturalDieEase`):** Over `~1.05s–1.35s`, normalized time `p` in `[0, 1]` is eased via `1 - (1 - p)^2.55` so Cycle 1 spins briskly, Cycle 2 noticeably loses momentum, and the final turn settles smoothly onto the landed face.

---

## Run Locally

Serve the repository root with any static HTTP server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Project Structure

```text
├── index.html          # Main Forge & Sheet Builder shell
├── static/
│   ├── styles.css      # Responsive dark-obsidian theme & sheet layout
│   └── favicon.svg
├── js/
│   ├── data.js         # PHB species, classes, subclasses, coinage & appendix data
│   ├── synergy.js      # Species × Class synergy & rating engine
│   ├── dice3d.js       # 3D polyhedral dice meshes & face-landing poses
│   ├── playbook.js     # Turn-by-turn maximizer & 3-page PDF 1.4 generator
│   ├── portraits-lq.js # Inline LQIP preload thumbnails
│   ├── avatar.js       # Double-buffered portrait crossfade loader
│   └── app.js          # UI state, sheet builder, CSPRNG dice physics & PDF print/export
└── images/
    └── portraits/      # 12 class folders × 12 species (.webp + .lq.webp)
```
