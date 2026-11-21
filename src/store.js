// On-device storage.
// In a browser this is localStorage. Inside the native apps it also writes to Capacitor
// Preferences, because iOS can clear a web view's localStorage when the phone is short of space.
// Every call is guarded: storage can be missing, full or blocked.
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

var cache = {}, native = false;
try { native = Capacitor.isNativePlatform(); } catch (e) { native = false; }

// Call once at start-up with the keys the app uses. Resolves when native values are loaded.
function ready(keys){
  if (!native) return Promise.resolve();
  return Promise.all(keys.map(function(k){
    return Preferences.get({key:k}).then(function(r){
      if (r && r.value !== null && r.value !== undefined) { try { cache[k] = JSON.parse(r.value); } catch (e) {} }
    });
  })).catch(function(){});
}
function get(key, fallback){
  if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
  try { var v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; }
  catch (e) { return fallback; }
}
function put(key, value){
  var ok = false, text = JSON.stringify(value);
  try { localStorage.setItem(key, text); ok = true; } catch (e) {}
  if (native) { cache[key] = value; Preferences.set({key:key, value:text}).catch(function(){}); ok = true; }
  return ok;
}
function isNative(){ return native; }
export { ready, get, put, isNative };
