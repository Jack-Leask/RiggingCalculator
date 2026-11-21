// Plain-text summary of a calculation, for sharing or pasting into a job pack.
import { F, UNITOF, si, num } from "./calc.js";
import { kN, kgs } from "./format.js";

var UNAME = {kgm:"kg/m", lbft:"lb/ft", kN:"kN", kgf:"kg", lbf:"lb", m:"m", lk:"links", ft:"ft", kg:"kg", lb:"lb"};
var SIUNIT = {massU:"kg/m", tU:"kN", wsU:"m", spU:"m", hU:"m", wtU:"kg"};

// A figure as the user entered it, with the metric value in brackets when it was not metric.
function entered(S, k){
  var uk = UNITOF[k], u = S[uk], v = num(S[k]);
  if (!isFinite(v)) return "not entered";
  var t = v + " " + UNAME[u];
  if (F[u] !== 1) t += " (" + parseFloat(si(S, k).toPrecision(4)) + " " + SIUNIT[uk] + ")";
  return t;
}
function ld(x){ return isFinite(x) ? kN(x) + " (" + kgs(x) + ")" : "not worked out"; }

// S = raw state, E = effective state (eff(S)), r = calc(S), opts = {name, conductor, date, checks}
function summary(S, E, r, opts){
  var adv = E.tab === "adv", vert = E.load === "vert", L = [], o = opts || {};
  L.push("CONDUCTOR RIGGING LOADS");
  if (o.name) L.push("Job: " + o.name);
  if (o.date) L.push("Date: " + o.date);
  L.push("Mode: " + (adv ? "Advanced" : "Basic") + ", " + (vert ? "vertical load" : "tension load"));
  L.push("");
  L.push("INPUTS");
  L.push("Conductor: " + (o.conductor || "Custom") + ", " + entered(E, "mass"));
  L.push("Conductors on this rigging: " + r.n);
  var needT = !vert || (adv && (num(E.dev) > 0 || E.vmode === "calc"));
  if (needT) {
    if (E.tmode === "known") L.push("Tension from drawing: " + entered(E, "tKnown"));
    if (E.tmode === "sag") L.push("Tension from sag: span " + entered(E, "tSpan") + ", sag " + entered(E, "tSag"));
    if (E.tmode === "wave") L.push("Tension from return wave: span " + entered(E, "tSpan") + ", " + num(E.wN) + " returns in " + num(E.wTime) + " s");
    if (E.tmode === "uts") L.push("Tension at " + num(E.tPct) + "% of breaking load " + num(E.uts) + " kN");
    if (adv && !vert) L.push("Span " + entered(E, "tSpan") + ", height above far structure " + entered(E, "tH"));
  }
  if (vert) {
    if (E.vmode === "calc") L.push("Back span " + entered(E, "l1") + ", height above it " + entered(E, "h1") + "; ahead span " + entered(E, "l2") + ", height above it " + entered(E, "h2"));
    else L.push("Weight span: " + entered(E, "ws"));
    if (adv) {
      L.push("Hardware lifted: " + (num(E.hw) || 0) + " kg");
      L.push("Hold-down weights: " + entered(E, "wt"));
      L.push("Line deviation angle: " + (num(E.dev) || 0) + " degrees");
    }
  }
  L.push("");
  L.push("RESULTS");
  if (needT) {
    L.push("Horizontal tension, per conductor: " + ld(r.t1));
    if (!vert) {
      L.push("Tension at this structure, per conductor: " + ld(r.tSup));
      L.push("Tension load on rigging: " + ld(r.tTot));
      if (isFinite(r.depAng)) {
        L.push("Conductor leaves at " + Math.abs(r.depAng).toFixed(1) + " degrees " + (r.depAng >= 0 ? "below" : "above") + " horizontal");
        L.push("Horizontal part " + ld(r.hTot) + ", vertical part " + ld(Math.abs(r.vPart)) + (r.vPart >= 0 ? " down" : " up"));
      }
    }
  }
  if (vert) {
    if (E.vmode === "calc" && isFinite(r.ws)) L.push("Weight span worked out: " + r.ws.toFixed(0) + " m");
    L.push("Vertical load: " + ld(r.v));
    if (r.tr > 0) {
      L.push("Sideways pull from angle: " + ld(r.tr));
      L.push("Lift load: " + ld(r.lift) + " at " + r.liftAng.toFixed(0) + " degrees off vertical");
    }
    if (r.wCond < 0) L.push("WARNING: negative weight span. The conductor is in uplift at this structure.");
  }
  if (adv) {
    L.push("");
    L.push("RIGGING (" + (E.method === "tackle" ? "rope and blocks" : "hoist in line") + ", dynamic factor " + (Math.max(1, num(E.dyn) || 1)) + ")");
    L.push("Design load: " + ld(r.d));
    var ch = o.checks || [];
    for (var i = 0; i < ch.length; i++) {
      var c = ch[i], x = r.out[c.id];
      if (x === null || x === undefined) continue;
      var line = c.name + ": " + ld(x), wll = num(c.wll);
      if (wll > 0 && isFinite(x)) { var u = (x * 1000 / 9.80665) / wll; line += ", WLL " + wll + " kg, " + Math.round(u * 100) + "% used" + (u > 1 ? " OVER LIMIT" : ""); }
      L.push(line);
    }
  }
  L.push("");
  L.push("Reference aid only. Check every figure against the route plan and profile, the manufacturer's ratings and company procedure before rigging. Still air, no wind or ice.");
  return L.join("\n");
}
export { summary, entered };
