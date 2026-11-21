// Small wrapper around localStorage. Storage can be missing or full, so every call is guarded.
function get(key, fallback){
  try { var v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; }
  catch (e) { return fallback; }
}
function put(key, value){
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}
export { get, put };
