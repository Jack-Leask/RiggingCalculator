# Conductor Rigging Loads

A calculator for the loads that conductors put on rigging on transmission and distribution lines.

- **Basic** is for field crews: weight span × conductor weight for vertical load, and sag, return wave or % of UTS for tension.
- **Advanced** works from a route plan and profile in the drawing's own units (links, feet, lb, kg, kN). It allows for angle structures, hardware, hold-down weights and height differences, and gives the load on each piece of rigging.

**Reference aid only.** Every figure must be checked against the route plan and profile, the manufacturer's ratings and company procedure before rigging. The formulas and conductor data have not yet been independently checked by an engineer.

## Run it

Needs Node 20 or later.

```
npm install
npm run dev      # open the address it prints
npm test         # run the load maths tests
npm run build    # writes the finished web files to dist/
```

## Layout

| File | What it holds |
|---|---|
| `index.html` | The page markup |
| `src/calc.js` | All load maths. No screen code, so it can be tested on its own |
| `src/conductors.js` | Conductor list: mass and breaking load |
| `src/help.js` | Help text for each input and section |
| `src/diagrams.js` | The diagrams, drawn from the inputs |
| `src/format.js` | Number formatting (kN, kg) |
| `src/main.js` | Screen logic: showing and hiding inputs, results, saved jobs, my conductors, terms |
| `src/summary.js` | The text summary used by Share result |
| `src/store.js` | Guarded access to on-device storage |
| `src/styles.css` | Styles, light and dark |
| `tests/calc.test.js` | Known jobs with hand-worked answers |

Fonts are bundled, so the built app makes no network requests and works offline.

## Method

- Vertical load = conductor mass × 9.81 × weight span, plus hardware and hold-down weights.
- Weight span each side = span ÷ 2 + (tension ÷ unit weight) × (height difference ÷ span).
- Sideways pull at an angle structure = 2 × tension × sin(deviation angle ÷ 2).
- Tension from sag = unit weight × span² ÷ (8 × sag).
- Tension from return wave = mass × (2 × span × returns ÷ time)².
- Tension at a structure = horizontal tension + unit weight × height of the attachment above the span's low point.
- Still air only. No wind or ice.

## Open items

- Independent engineering check of the formulas and conductor data.
- Confirm the meaning of the `Sed` label on PLS-CADD drawings (treated as everyday weight span).
- Default dynamic factor (1.1) and sheave friction (5%) are placeholders.
- Saved jobs, my conductors and accepted terms are kept in the browser's local storage on the device. Move these to Capacitor Preferences when the native apps are added, because iOS can clear web storage.
- Result sharing is a text summary. A PDF export is not built.
- Next: Capacitor for iOS and Android (needs the app ID), then store listings.
