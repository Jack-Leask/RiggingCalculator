// Known jobs run through the load maths. If a change to calc.js moves any of these
// answers, the test fails. Expected figures were worked out by hand.
import { describe, it, expect } from "vitest";
import { calc } from "../src/calc.js";

const base = {
  tab: "adv", load: "vert", mass: 0.73, uts: 69.2, n: 1,
  massU: "kgm", tU: "kN", wsU: "m", spU: "m", hU: "m", wt: 0, wtU: "kg",
  tmode: "known", tKnown: 14, tSpan: 350, tSag: 8, tPct: 20, wTime: 15.3, wN: 3, tH: 0,
  vmode: "ws", ws: 400, l1: 450, h1: 20, l2: 450, h2: 20, hw: 0, dev: 0,
  dyn: 1, method: "direct", parts: 2, sheaves: 2, fric: 5, redir: 90, legs: "1", slingAngle: 60
};
const run = (o) => calc({ ...base, ...o });

describe("vertical load", () => {
  it("Basic: weight span x conductor weight (Wolf, 400 m)", () => {
    const r = run({ tab: "basic" });
    expect(r.v).toBeCloseTo(0.73 * 9.80665 * 400 / 1000, 3); // 2.864 kN
    expect(r.d).toBeCloseTo(r.v, 6);                         // Basic applies no dynamic factor
  });
  it("CST-SFD A Tower 54: 2168 links at 0.49 lb/ft is about 701 lb", () => {
    const r = run({ mass: 0.49, massU: "lbft", ws: 2168, wsU: "lk" });
    expect(r.v).toBeCloseTo(3.119, 2);
  });
  it("WRK-WKM C T66: duplex Sulphur, 265 m weight span, 180 kg of weights", () => {
    const r = run({ n: 2, mass: 1.86, ws: 265, wt: 180 });
    expect(r.v).toBeCloseTo(2 * 1.86 * 9.80665 * 265 / 1000 + 180 * 9.80665 / 1000, 3); // 11.43 kN
  });
  it("works out weight span from spans and heights", () => {
    const r = run({ vmode: "calc" });
    // each side: 450/2 + (14000 / 7.159) x 20/450 = 311.9 m
    expect(r.wsA).toBeCloseTo(311.9, 0);
    expect(r.ws).toBeCloseTo(623.8, 0);
  });
  it("angle structure: sideways pull is 2 x T x sin(angle / 2)", () => {
    const r = run({ dev: 10 });
    expect(r.tr).toBeCloseTo(2.440, 3);
    expect(r.lift).toBeCloseTo(Math.hypot(r.v, 2.440), 3);
  });
  it("flags uplift as a negative weight", () => {
    const r = run({ vmode: "calc", h1: -60, h2: -60 });
    expect(r.wCond).toBeLessThan(0);
  });
});

describe("tension load", () => {
  it("from sag: w x L^2 / (8 x sag)", () => {
    const r = run({ tab: "basic", load: "tens", tmode: "sag" });
    expect(r.t1).toBeCloseTo(13.70, 2);
  });
  it("return wave: mass x (2 x L x n / t)^2, and the sag it implies", () => {
    const r = run({ tab: "basic", load: "tens", tmode: "wave" });
    expect(r.t1).toBeCloseTo(13.75, 2);
    expect(r.sagW).toBeCloseTo(7.97, 2);
  });
  it("% of UTS", () => {
    const r = run({ tab: "basic", load: "tens", tmode: "uts" });
    expect(r.t1).toBeCloseTo(13.84, 2);
  });
  it("drawing tension in lb converts to kN", () => {
    const r = run({ load: "tens", tKnown: 2850, tU: "lbf", tSpan: "" });
    expect(r.t1).toBeCloseTo(12.677, 2);
  });
  it("tension at the structure rises with height above the far end", () => {
    const level = run({ load: "tens" }), up = run({ load: "tens", tH: 50 }), down = run({ load: "tens", tH: -50 });
    expect(level.tSup).toBeCloseTo(14.056, 3);
    expect(up.tSup).toBeCloseTo(14.378, 3);
    expect(down.tSup).toBeCloseTo(14.020, 3);
    expect(up.tSup - down.tSup).toBeCloseTo(0.73 * 9.80665 * 50 / 1000, 3); // unit weight x height
    expect(up.depAng).toBeCloseTo(13.08, 1);       // atan(454.4 / 1955.6)
    expect(up.vPart).toBeCloseTo(3.25, 1);         // unit weight x 454.4 m
  });
});

describe("rigging", () => {
  it("rope and blocks: lead pull, anchor, redirect and sling leg", () => {
    const r = run({ hw: 60, dyn: 1.1, method: "tackle", legs: "2" });
    expect(r.d).toBeCloseTo(3.797, 3);          // (2.864 + 0.588) x 1.1
    expect(r.out.rope).toBeCloseTo(2.093, 3);   // 3.797 x 1.05^2 / 2
    expect(r.out.anchor).toBeCloseTo(5.890, 3); // load + lead
    expect(r.out.redir).toBeCloseTo(2.960, 3);  // 2 x lead x cos 45
    expect(r.out.sling).toBeCloseTo(2.192, 3);  // 3.797 / (2 x cos 30)
  });
  it("hoist in line: every item carries the design load", () => {
    const r = run({ load: "tens", dyn: 1.1 });
    expect(r.out.hoist).toBeCloseTo(r.tTot * 1.1, 6);
    expect(r.out.anchor).toBeCloseTo(r.out.hoist, 6);
    expect(r.out.rope).toBeNull();
  });
});

import { eff } from "../src/calc.js";
import { summary } from "../src/summary.js";

describe("share summary", () => {
  it("lists the inputs as entered and the results", () => {
    const S = { ...base, mass: 0.49, massU: "lbft", ws: 2168, wsU: "lk", wHoist: 500 };
    const text = summary(S, eff(S), calc(S), { name: "CST-SFD A Tower 54", conductor: "Custom", date: "21 Nov 2026",
      checks: [{ id: "hoist", name: "Hoist or tackle blocks", wll: 500 }, { id: "rope", name: "Haul rope and capstan", wll: "" }] });
    expect(text).toContain("Job: CST-SFD A Tower 54");
    expect(text).toContain("Weight span: 2168 links (436.1 m)");
    expect(text).toContain("0.49 lb/ft (0.7292 kg/m)");
    expect(text).toContain("Vertical load: 3.12 kN (318 kg)");
    expect(text).toContain("Hoist or tackle blocks: 3.12 kN (318 kg), WLL 500 kg, 64% used");
    expect(text).not.toContain("Haul rope");   // not part of a hoist-in-line set-up
    expect(text).toContain("Reference aid only");
  });
  it("Basic tension summary leaves out rigging", () => {
    const S = { ...base, tab: "basic", load: "tens", tmode: "wave" };
    const text = summary(S, eff(S), calc(S), {});
    expect(text).toContain("3 returns in 15.3 s");
    expect(text).not.toContain("RIGGING (");
  });
});
