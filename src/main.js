import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./styles.css";
import { G, F, UNITOF, METRIC, si, eff, calc, num } from "./calc.js";
import { kN, kgs, both } from "./format.js";
import { PRESETS } from "./conductors.js";
import { HELP, GUIDES } from "./help.js";
import { dVert, dAngle, dTens, dRig } from "./diagrams.js";

var DEFAULTS = {
  tab:"basic", load:"vert",
  cond:"wolf", mass:0.730, uts:69.2, n:1,
  massU:"kgm", tU:"kN", wsU:"m", spU:"m", hU:"m", wt:0, wtU:"kg",
  tmode:"sag", tKnown:14, tSpan:350, tSag:8, tPct:20, wTime:15.3, wN:3, tH:0,
  vmode:"ws", ws:400, l1:450, h1:20, l2:450, h2:20, hw:60, dev:0,
  task:"lift", method:"tackle", dyn:1.1, parts:2, sheaves:2, fric:5, redir:90,
  legs:"1", slingAngle:60,
  wHoist:"", wRope:"", wAnchor:"", wRedir:"", wSling:""
};
var CHECKS = [
  ["Hoist","hoist","Hoist or tackle blocks","Full design load"],
  ["Rope","rope","Haul rope and capstan","Pull on the lead line"],
  ["Anchor","anchor","Top anchor point","Load plus lead line pull"],
  ["Redir","redir","Redirect block","Both rope legs on one block"],
  ["Sling","sling","Sling or strop, per leg","Share of design load"]
];
var KEY = "conductor-rigging-loads-v5";
var RADIOS = ["tab","load","tmode","vmode","method"];
var S = {};
function $(id){return document.getElementById(id);}

function set(id, t){ $(id).textContent = t; }
function big(id, x){ $(id).innerHTML = isFinite(x) ? (Math.abs(x) < 10 ? x.toFixed(2) : x.toFixed(1)) + "<small>kN</small>" : "–"; }
function note(id, msg, crit){ var e = $(id); if (!msg) { e.hidden = true; return; } e.hidden = false; e.textContent = msg; e.className = "note" + (crit ? " crit" : ""); }

/* ---------- render ---------- */
function render(){
  var r = calc(S);
  // conditional fields
  var E = eff(S), adv = E.tab === "adv", vert = E.load === "vert";
  var shows = document.querySelectorAll("[data-show]");
  for (var i = 0; i < shows.length; i++) {
    var kv = shows[i].getAttribute("data-show").split("=");
    shows[i].hidden = String(E[kv[0]]) !== kv[1];
  }
  var needT = !vert || (adv && (num(E.dev) > 0 || E.vmode === "calc"));
  $("secT").hidden = !needT;
  set("hT", vert ? (E.vmode === "calc" ? "Tension, needed for the weight span" : "Tension, needed for the angle") : "Tension");
  $("fSpan").hidden = !(E.tmode === "sag" || E.tmode === "wave" || (adv && !vert));
  $("fTH").hidden = !(adv && !vert);
  $("fUts").hidden = !(adv || (needT && E.tmode === "uts"));
  document.body.className = adv ? "" : "basic";
  var main = vert ? r.lift : r.tTot;
  set("sL", vert ? (r.tr > 0 ? "Lift load at angle" : "Vertical load") : "Tension load");
  big("sV", main); set("sVk", kgs(main));
  big("sD", r.d); set("sDk", kgs(r.d));
  set("oRlab", adv ? (r.tr > 0 ? "Lift load, " + r.liftAng.toFixed(0) + "° off vertical" : "Lift load on rigging") : "Vertical load");

  set("oT1", both(r.t1)); set("oTs", both(r.tSup));
  set("oAng", isFinite(r.depAng) ? Math.abs(r.depAng).toFixed(1) + "° " + (r.depAng >= 0 ? "below" : "above") + " horizontal" : "–");
  set("oHp", both(r.hTot)); set("oVp", isFinite(r.vPart) ? both(Math.abs(r.vPart)) + (r.vPart >= 0 ? " down" : " up") : "–");
  $("figT").hidden = vert; if (!vert) $("figT").innerHTML = dTens(r, E);
  if (vert) $("figV").innerHTML = dVert(r, E);
  var ang = vert && adv && num(E.dev) > 0; $("figA").hidden = !ang; if (ang) $("figA").innerHTML = dAngle(r, E);
  if (adv) $("figR").innerHTML = dRig(r, E);
  set("oSag", isFinite(r.sagW) ? r.sagW.toFixed(2) + " m" : "–");
  set("oTpct", isFinite(r.tPct) ? r.tPct.toFixed(0) + "%" : "–");
  set("oTtot", both(r.tTot));
  var tn = "";
  if (E.tmode === "sag" && isFinite(r.t1)) tn = "Use sag measured on the day, in still air.";
  if (E.tmode === "wave" && isFinite(r.t1)) tn = "Strike the conductor near the structure, start the watch on the strike and stop it on the last return counted. Three or more returns gives a better figure.";
  if (E.tmode === "uts" && !(num(S.uts) > 0)) tn = "Enter the conductor breaking load to use % of UTS.";
  if (isFinite(r.tPct) && r.tPct > 50) tn = "Tension is over half the breaking load. Check the inputs.";
  note("nT", tn, isFinite(r.tPct) && r.tPct > 50);

  var wsTxt = isFinite(r.ws) ? r.ws.toFixed(0) + " m" : "–";
  if (E.vmode === "calc" && isFinite(r.ws)) wsTxt = r.wsA.toFixed(0) + " + " + r.wsB.toFixed(0) + " = " + r.ws.toFixed(0) + " m";
  set("oWs", wsTxt);
  set("oWc", both(r.wCond));
  set("oHw", both(r.wHw));
  set("oV", both(r.v));
  set("oTr", r.tr > 0 ? both(r.tr) : "none");
  set("oR", isFinite(r.lift) ? both(r.lift) : "–");
  var vn = "", vc = false;
  if (E.vmode === "calc" && !isFinite(r.t1)) vn = "Enter a tension above to work out the weight span.";
  else if (num(E.dev) > 0 && !isFinite(r.t1)) vn = "Enter a tension above to work out the sideways pull at the angle.";
  else if (isFinite(r.wCond) && r.wCond < 0) { vn = "Negative weight span: the conductor is in uplift at this structure. The rigging has to hold it down, not lift it."; vc = true; }
  note("nV", vn, vc);

  var worst = "";
  for (var j = 0; j < CHECKS.length; j++) {
    var c = CHECKS[j], id = c[1], load = r.out[id], row = $("c-" + id);
    if (load === null) { row.hidden = true; continue; }
    row.hidden = false;
    set("l-" + id, kN(load));
    set("k-" + id, isFinite(load) ? "needs WLL of at least " + kgs(load) : "");
    var wll = num(S["w" + c[0]]), pill = $("p-" + id), bar = $("b-" + id);
    if (wll > 0 && isFinite(load)) {
      var u = (load * 1000 / G) / wll, cls = u > 1 ? "over" : (u > 0.85 ? "near" : "ok");
      pill.className = "pill " + cls;
      pill.textContent = (cls === "over" ? "OVER " : cls === "near" ? "CLOSE " : "OK ") + Math.round(u * 100) + "%";
      bar.className = cls; bar.style.width = Math.min(100, u * 100) + "%";
      if (cls === "over") worst = c[2];
    } else {
      pill.className = "pill"; pill.textContent = "NO WLL"; bar.className = ""; bar.style.width = "0";
    }
  }
  var rn = "", rc = false;
  if (worst) { rn = worst + " is over its working load limit."; rc = true; }
  else if (String(S.legs) === "2" && num(S.slingAngle) > 120) rn = "Sling angle is over 120°. Leg loads climb steeply past this.";
  else if (E.task === "tension" && E.method === "tackle") rn = "Taking tension on rope and blocks: check the anchor takes the pull along the line.";
  note("nR", rn, rc);
}

/* ---------- wiring ---------- */
function load(){
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  S = {};
  for (var k in DEFAULTS) S[k] = (saved && saved[k] !== undefined) ? saved[k] : DEFAULTS[k];
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function push(){
  for (var k in S) {
    if (RADIOS.indexOf(k) >= 0) {
      var rs = document.getElementsByName(k);
      for (var i = 0; i < rs.length; i++) rs[i].checked = rs[i].value === S[k];
    } else if ($(k)) $(k).value = S[k];
  }
  var us = document.querySelectorAll("select[data-u]");
  for (var j = 0; j < us.length; j++) us[j].value = S[us[j].getAttribute("data-u")];
}
function setUnits(target){
  for (var k in UNITOF) {
    var uk = UNITOF[k], v = si(S, k);
    if (isFinite(v)) S[k] = parseFloat((v / F[target[uk]]).toPrecision(6));
  }
  for (var u in target) S[u] = target[u];
  push(); render(); save();
}
function build(){
  var sel = $("cond");
  for (var i = 0; i < PRESETS.length; i++) {
    var o = document.createElement("option");
    o.value = PRESETS[i][0];
    o.textContent = PRESETS[i][1];
    sel.appendChild(o);
  }
  var UOPT = {massU:[["kgm","kg/m"],["lbft","lb/ft"]], tU:[["kN","kN"],["kgf","kg"],["lbf","lb"]], wsU:[["m","m"],["lk","links"],["ft","ft"]], spU:[["m","m"],["lk","links"],["ft","ft"]], hU:[["m","m"],["ft","ft"]], wtU:[["kg","kg"],["lb","lb"]]};
  var ins = document.querySelectorAll("input[data-unit]");
  for (var q = 0; q < ins.length; q++) {
    var inp = ins[q], key = inp.getAttribute("data-unit"), d = document.createElement("div"), us = document.createElement("select");
    d.className = "iu"; inp.parentNode.insertBefore(d, inp); d.appendChild(inp);
    us.id = "u-" + inp.id; us.setAttribute("data-u", key); us.setAttribute("aria-label", "Unit");
    for (var z = 0; z < UOPT[key].length; z++) { var uo = document.createElement("option"); uo.value = UOPT[key][z][0]; uo.textContent = UOPT[key][z][1]; us.appendChild(uo); }
    d.appendChild(us);
  }
  var labs = document.querySelectorAll("label.f");
  for (var a = 0; a < labs.length; a++) {
    var lab = labs[a], ctl = lab.querySelector("input[id],select[id]:not([data-u])");
    if (!ctl || !HELP[ctl.id] || lab.firstChild.nodeType !== 3) continue;
    var lt = document.createElement("span"), nm = document.createElement("span"), qb = document.createElement("button"), hp = document.createElement("div");
    lt.className = "lt"; nm.textContent = lab.firstChild.textContent.replace(/\s+/g, " ").trim(); lab.removeChild(lab.firstChild);
    qb.type = "button"; qb.className = "q"; qb.textContent = "?"; qb.setAttribute("aria-label", "Help: " + nm.textContent); qb.setAttribute("aria-expanded", "false");
    hp.className = "help"; hp.hidden = true; hp.textContent = HELP[ctl.id];
    lt.appendChild(nm); lt.appendChild(qb); lab.insertBefore(lt, lab.firstChild); lab.appendChild(hp);
    toggler(qb, hp);
  }
  var secs = ["secC", "secT", "secV", "secR"];
  for (var b = 0; b < secs.length; b++) {
    var h2 = $(secs[b]).querySelector("h2"), gb = document.createElement("button"), gd = document.createElement("div");
    gb.type = "button"; gb.className = "reset gbtn"; gb.textContent = "Guide"; gb.setAttribute("aria-expanded", "false");
    gd.className = "help"; gd.hidden = true; gd.innerHTML = GUIDES[secs[b]];
    h2.appendChild(gb); h2.parentNode.insertBefore(gd, h2.nextSibling);
    toggler(gb, gd);
  }
  $("g-top").innerHTML = GUIDES.top; toggler($("helpTop"), $("g-top"));
  var box = $("checks"), h = "";
  for (var j = 0; j < CHECKS.length; j++) {
    var c = CHECKS[j], id = c[1];
    h += '<div class="chk" id="c-' + id + '"><div class="chk-h"><span class="nm">' + c[2] + '<span class="why">' + c[3] + '</span></span><span class="pill" id="p-' + id + '">NO WLL</span></div>' +
         '<div class="chk-b"><div class="ld"><b id="l-' + id + '">–</b><span id="k-' + id + '"></span></div>' +
         '<label class="f">WLL <span class="u">kg</span><input type="number" id="w' + c[0] + '" inputmode="decimal" step="any" min="0"></label></div>' +
         '<div class="bar"><i id="b-' + id + '"></i></div></div>';
  }
  box.innerHTML = h;
}
function toggler(btn, panel){
  btn.addEventListener("click", function(ev){
    ev.preventDefault(); ev.stopPropagation();
    panel.hidden = !panel.hidden; btn.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
  });
}
function onInput(e){
  var t = e.target;
  if (t.getAttribute && t.getAttribute("data-u")) { S[t.getAttribute("data-u")] = t.value; push(); render(); save(); return; }
  if (t.type === "radio") S[t.name] = t.value;
  if (t.name === "tab" && t.value === "basic") { if (S.tmode === "known") S.tmode = "sag"; setUnits(METRIC); return; }
  else if (t.id) S[t.id] = t.value;
  if (t.id === "cond") {
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i][0] === t.value && PRESETS[i][2]) {
      S.mass = PRESETS[i][2]; S.uts = PRESETS[i][3]; S.massU = "kgm"; $("u-mass").value = "kgm"; $("mass").value = S.mass; $("uts").value = S.uts;
    }
  }
  if (t.id === "mass" || t.id === "uts") { S.cond = "custom"; $("cond").value = "custom"; }
  render(); save();
}
build(); load(); push(); render();
document.addEventListener("input", onInput);
document.addEventListener("change", onInput);
$("reset").addEventListener("click", function(){
  S = {}; for (var k in DEFAULTS) S[k] = DEFAULTS[k];
  push(); render(); save();
});
$("uImp").addEventListener("click", function(){ setUnits({massU:"lbft", tU:"lbf", wsU:"lk", spU:"lk", hU:"ft", wtU:"lb"}); });
$("uMet").addEventListener("click", function(){ setUnits(METRIC); });
