# DESIGN.md — Wahyu Andika Putra Portfolio

## Brand Identity & Aesthetic Direction

- **Persona**: Software Engineer & Cybersecurity Specialist (Web2/Web3)
- **Concept**: Obsidian Cyber-Editorial (Phosphor Terminal meets ObsidianUI micro-interactions)
- **Mood**: High-craft, technical precision, editorial discipline, security telemetry.
- **Dial**: ENERGY 2 / RHYTHM 2 / MOTION 2

---

## 1. Color Palette

- **Base Noir**: `oklch(16% 0.015 260)` — deep obsidian canvas.
- **Surface**: `oklch(20% 0.016 260)` — matte dark panel.
- **Surface Raised**: `oklch(24% 0.018 260)` — elevated card / modal layer.
- **Text Primary**: `oklch(94% 0.01 80)` — high-clarity off-white (WCAG AAA compliant).
- **Text Muted**: `oklch(62% 0.015 80)` — readable secondary information (WCAG AA > 4.5:1 compliant).
- **Accent Phosphor**: `oklch(72% 0.14 55)` — warm amber gold phosphor glow for primary focus.
- **Accent Steel**: `oklch(75% 0.08 220)` — telemetry cyan-steel for web3 / system metadata.
- **Border Subtle**: `oklch(30% 0.02 260 / 40%)` with dynamic cursor spotlight highlights.

---

## 2. Typography

- **Display**: Fraunces Variable (high-contrast editorial serif, used for section titles and primary headlines).
- **Sans**: Geist Variable (refined geometric neo-grotesque for UI, labels, and readable prose).
- **Mono**: Geist Mono Variable (tabular numbers, telemetry coordinates, category tags, code snippets).

---

## 3. Interactive Component Standards (ObsidianUI-Inspired)

1. **Spotlight Cards**:
   - Cards dynamically track the cursor's coordinates (`--mouse-x`, `--mouse-y`).
   - Radial ambient sheen reveals a subtle phosphor glow and illuminates crisp card borders.
   - Corner bracket crosshairs (`.cyber-corner`) add technical terminal authenticity without visual clutter.

2. **Magnetic Buttons with Inner Sheen**:
   - Primary: High-contrast dark obsidian core, phosphor border beam, and radial sheen follow.
   - Secondary: Subtle dark border with smooth hover illuminate effect.
   - Retains smooth magnetic pull for fine pointers (`(hover: hover)`), instant fallbacks for touch.

3. **Cyber Text Decryption**:
   - Interactive hover effect on project titles and key telemetry markers.
   - Scrambles through technical glyphs before snapping into place with crisp typography.
   - Respects `prefers-reduced-motion` by preserving static text.

4. **Telemetry Badges**:
   - Monospace brackets, subtle border tint, no bloated pill glow.
   - Functional categorization: `[SECURITY]`, `[WEB2]`, `[WEB3]`.
