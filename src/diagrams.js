// Schematic SVG diagrams drawn from the current inputs and results.
import { si, num } from "./calc.js";
import { kN } from "./format.js";

function f1(x){ return x.toFixed(1); }
function clamp(x, a, b){ return isFinite(x) ? Math.max(a, Math.min(b, x)) : 0; }
function mk(id){ return '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fa"/></marker></defs>'; }
function svg(w, h, body, label){ return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '">' + body + '</svg>'; }
function tx(x, y, t, cls, anchor){ return '<text x="' + f1(x) + '" y="' + f1(y) + '"' + (cls ? ' class="' + cls + '"' : '') + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + t + '</text>'; }
function ln(x1, y1, x2, y2, cls, extra){ return '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '" class="' + cls + '"' + (extra || '') + '/>'; }
function pth(d, cls){ return '<path d="' + d + '" class="' + cls + '"/>'; }
function circ(x, y, rad, cls){ return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + rad + '" class="' + cls + '"/>'; }
function tower(x, top, g){ return ln(x, top - 8, x, g, "ln") + ln(x - 9, top, x + 9, top, "ln"); }
function para(x1, y1, x2, y2, sg){
  var us = Math.max(0, Math.min(1, 0.5 + (y2 - y1) / (8 * sg)));
  function pt(u){ return [x1 + (x2 - x1) * u, y1 + (y2 - y1) * u + 4 * sg * u * (1 - u)]; }
  function path(a, b){ var d = "", i, q; for (i = 0; i <= 24; i++) { q = pt(a + (b - a) * i / 24); d += (i ? "L" : "M") + f1(q[0]) + " " + f1(q[1]); } return d; }
  return {pt:pt, path:path, us:us, low:pt(us)};
}
function dVert(r, E){
  var g = 150, off = 0;
  if (E.vmode === "calc") off = clamp(((si(E, "h1") || 0) + (si(E, "h2") || 0)) / 2 * 0.6, -26, 26);
  var ym = 58 - off, A = para(40, 58, 170, ym, 34), B = para(170, ym, 300, 58, 34), dy = 124;
  var b = mk("ahv") + ln(10, g, 330, g, "gd") + tower(40, 58, g) + tower(170, ym, g) + tower(300, 58, g);
  b += pth(A.path(0, 1), "ln") + pth(B.path(0, 1), "ln") + pth(A.path(A.us, 1), "hi") + pth(B.path(0, B.us), "hi");
  b += circ(A.low[0], A.low[1], 3, "dot") + circ(B.low[0], B.low[1], 3, "dot");
  b += ln(A.low[0], A.low[1], A.low[0], dy + 4, "ds") + ln(B.low[0], B.low[1], B.low[0], dy + 4, "ds") + ln(A.low[0], dy, B.low[0], dy, "gd", ' marker-start="url(#ahv)" marker-end="url(#ahv)"');
  b += tx(170, g + 14, "Weight span" + (isFinite(r.ws) ? " " + r.ws.toFixed(0) + " m" : "") + ", low point to low point", "a", "middle");
  b += ln(170, ym + 4, 170, ym + 34, "ar", ' marker-end="url(#ahv)"');
  b += tx(170, ym - 14, "This structure: " + (isFinite(r.v) ? kN(r.v) + " down" : "weight down"), "a", "middle");
  b += tx(A.low[0] - 7, A.low[1] + 4, "low point", "m", "end") + tx(B.low[0] + 7, B.low[1] + 4, "low point", "m");
  return svg(340, 168, b, "Three structures with the weight span highlighted between the low points of the two spans");
}
function dAngle(r, E){
  var dv = num(E.dev), d = clamp(dv, 4, 60) * Math.PI / 180, cx = 150, cy = 40, c = Math.cos(d), sn = Math.sin(d);
  var rx = c - 1, ry = sn, rl = Math.sqrt(rx * rx + ry * ry) || 1; rx /= rl; ry /= rl;
  var b = mk("aha") + ln(20, cy, cx, cy, "cd") + ln(cx, cy, 310, cy, "ds") + ln(cx, cy, cx + 150 * c, cy + 150 * sn, "cd");
  b += ln(cx, cy, 96, cy, "ar", ' marker-end="url(#aha)"') + ln(cx, cy, cx + 54 * c, cy + 54 * sn, "ar", ' marker-end="url(#aha)"');
  b += ln(cx, cy, cx + 52 * rx, cy + 52 * ry, "hi", ' marker-end="url(#aha)"') + circ(cx, cy, 5, "bk");
  b += tx(100, cy - 8, "tension", "m", "middle") + tx(250, cy - 6, f1(dv) + "° deviation", "m");
  b += tx(cx + 52 * rx - 8, cy + 52 * ry + 18, "Sideways pull" + (isFinite(r.tr) && r.tr > 0 ? " " + kN(r.tr) : ""), "a", "end");
  b += tx(20, cy + 16, "Plan view", "m");
  return svg(340, 180, b, "Plan view of an angle structure showing the tension in each span and the sideways pull toward the inside of the angle");
}
function dTens(r, E){
  var g = 150, x1 = 60, x2 = 290, adv = E.tab === "adv";
  var hpx = adv ? clamp((si(E, "tH") || 0) * 0.6, -36, 36) : 0, y1 = 62 - hpx / 2, y2 = 62 + hpx / 2, sg = 38, P = para(x1, y1, x2, y2, sg);
  var dx = x2 - x1, dyy = (y2 - y1) + 4 * sg, dl = Math.sqrt(dx * dx + dyy * dyy), mid = P.pt(0.5), ch = (y1 + y2) / 2;
  var L = si(E, "tSpan"), showSpan = E.tmode === "sag" || E.tmode === "wave" || adv;
  var b = mk("aht") + ln(10, g, 340, g, "gd") + tower(x1, y1, g) + tower(x2, y2, g) + pth(P.path(0, 1), "ln");
  b += ln(x1, y1, hpx ? x2 + 18 : x1 + 84, y1, "ds");
  b += ln(x1, y1, x1 + 62 * dx / dl, y1 + 62 * dyy / dl, "ar", ' marker-end="url(#aht)"');
  b += tx(x1 + 6, y1 - 14, "Pull on rigging" + (isFinite(r.tTot) ? " " + kN(r.tTot) : "") + (isFinite(r.depAng) ? ", " + f1(Math.abs(r.depAng)) + "° " + (r.depAng >= 0 ? "below" : "above") + " horizontal" : ""), "a");
  if (E.tmode === "sag") b += ln(x1, y1, x2, y2, "ds") + ln(mid[0], ch, mid[0], mid[1], "gd", ' marker-start="url(#aht)" marker-end="url(#aht)"') + tx(mid[0] + 6, ch + sg / 2 + 10, "sag" + (isFinite(si(E, "tSag")) ? " " + si(E, "tSag").toFixed(1) + " m" : ""), "m");
  if (E.tmode === "wave") b += ln(mid[0] - 40, mid[1] + 12, mid[0] + 40, mid[1] + 12, "gd", ' marker-start="url(#aht)" marker-end="url(#aht)"') + tx(mid[0], mid[1] + 26, "wave out and back" + (num(E.wN) > 0 ? " × " + num(E.wN) : ""), "m", "middle");
  if (hpx) b += circ(P.low[0], P.low[1], 3, "dot") + ln(x2 + 18, y1, x2 + 18, y2, "gd", ' marker-start="url(#aht)" marker-end="url(#aht)"') + tx(x2 + 23, ch + 4, Math.abs(si(E, "tH")).toFixed(0) + " m", "m");
  b += tx(x1, g + 13, "This structure", "m", "middle") + tx(x2, g + 13, "Far structure", "m", "middle");
  if (showSpan && isFinite(L)) b += tx((x1 + x2) / 2, g + 13, "span " + L.toFixed(0) + " m", "m", "middle");
  return svg(350, 168, b, "One span showing the pull on the rigging at this structure, the sag and the angle the conductor leaves at");
}
function dRig(r, E){
  var g = 166, lift = E.task === "lift", tackle = E.method === "tackle", o = r.out;
  var ax = lift ? 190 : 150, ay = 34, lx = lift ? 190 : 300, ly = lift ? 122 : 46;
  var dx = lx - ax, dy = ly - ay, dl = Math.sqrt(dx * dx + dy * dy), ux = dx / dl, uy = dy / dl, px = -uy, py = ux, mx = (ax + lx) / 2, my = (ay + ly) / 2;
  var b = ln(10, g + 2, 330, g + 2, "gd") + ln(30, g + 2, 30, 20, "ln") + ln(30, ay, ax + 12, ay, "ln") + ln(30, 64, 84, ay, "gd");
  if (lift) {
    b += ln(150, 142, 232, 142, "cd");
    if (String(E.legs) === "2") b += ln(lx, ly, 170, 142, "ln") + ln(lx, ly, 210, 142, "ln"); else b += ln(lx, ly, lx, 142, "ln");
    b += tx(238, 139, "Sling " + kN(o.sling), "m") + (String(E.legs) === "2" ? tx(238, 152, "per leg", "m") : "");
    b += tx(150, 157, "conductor", "m");
  } else {
    b += pth("M" + lx + " " + ly + "Q322 52 340 66", "cd") + tx(lx + 4, ly - 10, "conductor", "m", "middle");
  }
  if (tackle) {
    var b1x = ax + 16 * ux, b1y = ay + 16 * uy, b2x = lx - 12 * ux, b2y = ly - 12 * uy, np = Math.min(4, Math.max(1, Math.round(num(E.parts) || 1))), i, of;
    for (i = 0; i < np; i++) { of = (i - (np - 1) / 2) * 4; b += ln(b1x + of * px, b1y + of * py, b2x + of * px, b2y + of * py, "ln"); }
    b += ln(ax, ay, b1x, b1y, "ln") + ln(b2x, b2y, lx, ly, "ln");
    b += ln(b1x, b1y, 60, g - 6, "ln") + ln(60, g - 6, 292, g - 6, "ln");
    b += circ(b1x, b1y, 6, "bk") + circ(b2x, b2y, 6, "bk") + circ(60, g - 6, 6, "bk") + '<rect x="290" y="' + (g - 16) + '" width="24" height="18" class="bk"/>';
    b += tx((b1x + 60) / 2 - 8, (b1y + g - 6) / 2 - 2, "Lead " + kN(o.rope), "m", "end");
    b += tx(64, g + 17, "Redirect " + kN(o.redir), "m", "middle") + tx(302, g + 17, "Capstan", "m", "middle");
    b += lift ? tx(mx + 14, my + 4, "Blocks " + kN(o.hoist), "m") : tx(mx, my + 20, "Blocks " + kN(o.hoist), "m", "middle");
  } else {
    b += ln(ax, ay, lx, ly, "ln") + '<rect x="' + f1(mx - (lift ? 7 : 12)) + '" y="' + f1(my - (lift ? 12 : 7)) + '" width="' + (lift ? 14 : 24) + '" height="' + (lift ? 24 : 14) + '" class="bk"/>';
    b += lift ? tx(mx + 14, my + 4, "Hoist " + kN(o.hoist), "m") : tx(mx, my + 22, "Hoist " + kN(o.hoist), "m", "middle");
  }
  b += circ(ax, ay, 3, "dot") + tx(ax + (lift ? 10 : 0), ay - 9, "Anchor " + kN(o.anchor), "a", lift ? "" : "middle");
  b += lift ? tx(238, 122, "Load " + kN(r.d), "a") : tx(lx + 34, ly + 34, "Load " + kN(r.d), "a", "end");
  return svg(340, 190, b, "The rigging arrangement with the load on the anchor, hoist or blocks, lead line, redirect block and sling");
}

export { dVert, dAngle, dTens, dRig };
