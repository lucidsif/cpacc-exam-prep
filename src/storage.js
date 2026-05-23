// src/storage.js — missed-question set persistence.
//
// Source of truth: the server's data.json (shared across devices on the
// same Wi-Fi via the /missed endpoint). localStorage is a fallback cache
// for when the server is unreachable.
//
// Exports `missedStore` — a small closure holding the in-memory mirror.
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

  return {
    /** Snapshot of current missed-set (caller should not mutate). */
    get() { return _missed; },

    /** True once the initial server fetch has resolved (success or fallback). */
    isReady() { return _ready; },

    /** Mark a question as missed. */
    add(id) { _missed.add(id); },

    /** Remove a question from the missed set. */
    remove(id) { _missed.delete(id); },

    /** Read missed list from server, falling back to localStorage on error. */
    async fetchFromServer() {
      try {
        const r = await _fetch('/missed');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        _missed = new Set(d.ids || []);
        saveLocal(_missed);    // keep local copy in sync as a cache
      } catch (e) {
        _missed = loadLocal();
      }
      _ready = true;
    },

    /** Persist current missed-set to server (and local cache). */
    async persist() {
      saveLocal(_missed);      // always write local cache first
      try {
        await _fetch('/missed', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [..._missed] })
        });
      } catch (e) { /* offline — local cache only */ }
    },

    /** Wipe missed list everywhere. */
    async clear() {
      _missed = new Set();
      saveLocal(_missed);
      try { await _fetch('/missed', { method: 'DELETE' }); } catch (e) {}
    },
  };
}
