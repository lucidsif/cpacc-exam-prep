// src/storage.js — missed-question set persistence.
//
// Two deploy targets supported:
//   - Local `node server.js` — exposes a /missed endpoint backed by data.json
//     for cross-device sync on the same Wi-Fi (LAN).
//   - Cloudflare Pages (static + Functions) — no /missed endpoint; the store
//     transparently falls back to per-browser localStorage.
//
// fetchFromServer() probes /missed once at boot. If the endpoint returns
// anything other than 200, we treat it as "no server sync available" and
// stop attempting writes for the rest of the session.
//
// Exports createMissedStore() — a closure holding the in-memory mirror.
// Unit-tested in tests/storage.test.js (with `fetch` mocked).

const MISSED_KEY = 'cpacc:missed';

function loadLocal() {
  try { return new Set(JSON.parse(localStorage.getItem(MISSED_KEY) || '[]')); }
  catch (e) { return new Set(); }
}

function saveLocal(set) {
  try { localStorage.setItem(MISSED_KEY, JSON.stringify([...set])); }
  catch (e) { /* private mode or quota — non-fatal */ }
}

/**
 * Create a missed-set store. One instance per app session.
 * @param {{ fetch?: typeof fetch }} [opts] - inject fetch for tests
 */
export function createMissedStore(opts = {}) {
  const _fetch = opts.fetch || ((...args) => fetch(...args));
  let _missed = new Set();
  let _ready = false;
  let _serverAvailable = true;   // set false on first failed probe

  return {
    /** Snapshot of current missed-set (caller should not mutate). */
    get() { return _missed; },

    /** True once the initial server fetch has resolved (success or fallback). */
    isReady() { return _ready; },

    /** Mark a question as missed. */
    add(id) { _missed.add(id); },

    /** Remove a question from the missed set. */
    remove(id) { _missed.delete(id); },

    /**
     * Read missed list from server, falling back to localStorage on error.
     * If the server returns non-200 (e.g. 404 on Cloudflare Pages where no
     * /missed endpoint exists), mark the server as unavailable for the rest
     * of the session so persist()/clear() don't keep hammering it.
     */
    async fetchFromServer() {
      try {
        const r = await _fetch('/missed');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        _missed = new Set(d.ids || []);
        saveLocal(_missed);    // keep local copy in sync as a cache
      } catch (e) {
        _serverAvailable = false;
        _missed = loadLocal();
      }
      _ready = true;
    },

    /** Persist current missed-set to server (if available) and local cache. */
    async persist() {
      saveLocal(_missed);      // always write local cache first
      if (!_serverAvailable) return;
      try {
        await _fetch('/missed', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [..._missed] })
        });
      } catch (e) { /* offline — local cache only */ }
    },

    /** Wipe missed list everywhere we know about. */
    async clear() {
      _missed = new Set();
      saveLocal(_missed);
      if (!_serverAvailable) return;
      try { await _fetch('/missed', { method: 'DELETE' }); } catch (e) {}
    },
  };
}
