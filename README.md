# D&D 5e Character Forge

Zero-dependency interactive **Species × Class Synergy Explorer, Tactical Playbook & Character Sheet Builder** for Dungeons & Dragons 5e.

## Highlights

- **12 × 12 Species & Class Synergy Matrix:** Live `Combat`, `Synergy`, and `Durability` ratings, sub-race & sub-class comparison previews, upgrade recommendations, and custom portraits (`images/portraits/<class>/<species>.webp`) with instant LQIP crossfades.
- **Tactical Playbook & Turn-by-Turn Maximizer:** Build- and level-aware (`Lv 1–20`) 4-phase action-economy blueprint (`Opening Setup`, `Sustained Max Loop`, `Boss / Nova Turn`, `Off-Turn Reaction`), strike & defense combinations, and rule interactions.
- **5-Step Character Sheet Builder:** Guided creation flow (Identity & Appearance, Standard Array / 27-Point Buy / Slot-Targeted `4d6` Drop Lowest with a sticky 3D polyhedral dice dock, Skills & Starting Equipment with *PHB* p. 143 coinage guide, Roleplay Matrix, and Review Gate) paired with a live two-card Character Sheet Preview.
- **Unified Vector + Grayscale Portrait PDF Engine:** Dependency-free client-side PDF 1.4 generator (`js/playbook.js`) that embeds a print-tuned grayscale character portrait and renders an identical 3-page Character Sheet + Tactical Playbook for both **Print Sheet** and **Export PDF**.

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
│   ├── data.js         # PHB species, classes, subclasses, gear & appendix data
│   ├── synergy.js      # Species × Class synergy & rating engine
│   ├── dice3d.js       # 3D polyhedral dice meshes & landing poses
│   ├── playbook.js     # Turn-by-turn maximizer & 3-page PDF 1.4 generator
│   ├── portraits-lq.js # Inline LQIP preload thumbnails
│   ├── avatar.js       # Double-buffered portrait loader
│   └── app.js          # UI state, sheet builder, 3D dice physics & PDF print/export
└── images/
    └── portraits/      # 12 class folders × 12 species (.webp + .lq.webp)
```
