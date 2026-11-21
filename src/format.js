import { G } from "./calc.js";

function kN(x, d){ return isFinite(x) ? x.toFixed(d === undefined ? (Math.abs(x) < 10 ? 2 : 1) : d) + " kN" : "–"; }
function kg(x){ if (!isFinite(x)) return ""; var v = x * 1000 / G; return Math.round(v >= 1000 ? v / 10 : v) * (v >= 1000 ? 10 : 1); }
function kgs(x){ return isFinite(x) ? kg(x).toLocaleString("en-NZ") + " kg" : ""; }
function both(x){ return isFinite(x) ? kN(x) + " · " + kgs(x) : "–"; }

export { kN, kg, kgs, both };
