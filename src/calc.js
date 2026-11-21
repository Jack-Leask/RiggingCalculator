// Pure load calculations. No DOM access, so this file can be unit tested.
var G = 9.80665;

var F = {kgm:1, lbft:1.488164, kN:1, kgf:0.00980665, lbf:0.00444822, m:1, lk:0.201168, ft:0.3048, kg:1, lb:0.45359237};
var UNITOF = {mass:"massU", tKnown:"tU", ws:"wsU", l1:"spU", l2:"spU", tSpan:"spU", h1:"hU", h2:"hU", tSag:"hU", tH:"hU", wt:"wtU"};
function si(s, k){ return num(s[k]) * (F[s[UNITOF[k]]] || 1); }
var METRIC = {massU:"kgm", tU:"kN", wsU:"m", spU:"m", hU:"m", wtU:"kg"};
function eff(s0){
  var s = {}, k;
  for (k in s0) s[k] = s0[k];
  s.task = s.load === "tens" ? "tension" : "lift";
  if (s.tab !== "adv") {
    for (k in METRIC) s[k] = METRIC[k];
    s.vmode = "ws"; s.tH = 0; s.hw = 0; s.wt = 0; s.dev = 0; s.dyn = 1; s.method = "direct"; s.legs = "1";
    if (s.tmode === "known") s.tmode = "sag";
  }
  return s;
}
function calc(s){
  s = eff(s);
  var r = {};
  var n = Math.max(1, Math.round(num(s.n) || 1));
  var w = si(s, "mass") * G;                 // N/m per conductor
  r.n = n; r.w = w;
  // tension per conductor, kN
  var t1 = NaN;
  if (s.tmode === "known") t1 = si(s, "tKnown");
  else if (s.tmode === "sag") { var L = si(s, "tSpan"), sg = si(s, "tSag"); t1 = sg > 0 ? w * L * L / (8 * sg) / 1000 : NaN; }
  else if (s.tmode === "wave") {
    // n returns over a span L take t seconds: wave speed = 2Ln/t, tension = mass x speed^2
    var Lw = si(s, "tSpan"), tw = num(s.wTime), nw = num(s.wN);
    var cw = tw > 0 ? 2 * Lw * nw / tw : NaN;
    t1 = si(s, "mass") * cw * cw / 1000;
    r.sagW = nw > 0 ? G * tw * tw / (32 * nw * nw) : NaN;
  }
  else { t1 = num(s.uts) * num(s.tPct) / 100; }
  // tension at the attachment = horizontal tension + unit weight x height of the attachment above the span's low point
  var ts = t1, Ls = si(s, "tSpan"), hs = si(s, "tH") || 0;
  if (s.task === "tension" && Ls > 0 && t1 > 0 && w > 0) {
    var cc = t1 * 1000 / w, xs = Ls / 2 + cc * hs / Ls;
    r.drop = xs * xs / (2 * cc);
    ts = t1 + w * r.drop / 1000;
    r.depAng = Math.atan(xs / cc) * 180 / Math.PI;   // slope of the conductor at the attachment
    r.vPart = n * w * xs / 1000;
  }
  r.t1 = t1; r.tSup = ts; r.hTot = t1 * n; r.tTot = ts * n;
  r.tPct = num(s.uts) > 0 ? ts / num(s.uts) * 100 : NaN;
  // weight span, m
  var ws;
  if (s.vmode === "ws") { ws = si(s, "ws"); r.wsA = NaN; r.wsB = NaN; }
  else {
    var c = (t1 * 1000) / w;               // catenary constant, m
    r.wsA = side(si(s, "l1"), si(s, "h1"), c);
    r.wsB = side(si(s, "l2"), si(s, "h2"), c);
    ws = r.wsA + r.wsB;
  }
  r.ws = ws;
  r.wCond = n * w * ws / 1000;             // kN
  r.wHw = ((num(s.hw) || 0) + (si(s, "wt") || 0)) * G / 1000;     // kN
  r.v = r.wCond + r.wHw;
  var dev = (num(s.dev) || 0) * Math.PI / 180;
  r.tr = dev > 0 ? 2 * r.hTot * Math.sin(dev / 2) : 0;
  if (!isFinite(r.tr)) r.tr = NaN;
  r.lift = Math.sqrt(r.v * r.v + (r.tr || 0) * (r.tr || 0));
  r.liftAng = r.v !== 0 ? Math.atan2(Math.abs(r.tr || 0), Math.abs(r.v)) * 180 / Math.PI : 0;
  // rigging
  var base = s.task === "lift" ? r.lift : r.tTot;
  var k = Math.max(1, num(s.dyn) || 1);
  r.base = base; r.d = base * k;
  var out = {};
  out.hoist = r.d;
  if (s.method === "tackle") {
    var N = Math.max(1, Math.round(num(s.parts) || 1));
    var ns = Math.max(0, Math.round(num(s.sheaves) || 0));
    var f = (num(s.fric) || 0) / 100;
    var p = r.d * Math.pow(1 + f, ns) / N;
    var a = (num(s.redir) || 0) * Math.PI / 180;
    out.rope = p;
    out.anchor = r.d + p;
    out.redir = 2 * p * Math.cos(a / 2);
  } else {
    out.rope = null; out.redir = null;
    out.anchor = r.d;
  }
  if (String(s.legs) === "2") {
    var sa = (num(s.slingAngle) || 0) * Math.PI / 180;
    var cs = Math.cos(sa / 2);
    out.sling = cs > 0.01 ? r.d / (2 * cs) : NaN;
  } else out.sling = r.d;
  r.out = out;
  return r;
}
function side(L, h, c){ if (!(L > 0)) return 0; return L / 2 + c * (h || 0) / L; }
function num(v){ if (v === "" || v === null || v === undefined) return NaN; var x = parseFloat(v); return isFinite(x) ? x : NaN; }

export { G, F, UNITOF, METRIC, si, eff, calc, side, num };
