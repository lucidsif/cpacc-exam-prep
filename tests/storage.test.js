// tests/storage.test.js — unit tests for src/storage.js (missed-set store)
//
// Stubs both `fetch` (injected) and `localStorage` (globalThis polyfill).

import { createMissedStore } from '../src/storage.js';

function makeFakeFetch(responses) {
  // responses: array of { ok, json } or thrown errors.
  let i = 0;
  const calls = [];
  const fn = async (url, opts) => {
    calls.push({ url, opts });
    const r = responses[i++];
    if (r instanceof Error) throw r;
    return {
      ok: r.ok !== false,
      status: r.status || 200,
      async json() { return r.json || {}; }
    };
  };
  fn.calls = calls;
  return fn;
}

// Tiny in-memory localStorage polyfill for the test environment.
function installFakeLocalStorage() {
  const data = {};
  globalThis.localStorage = {
    getItem: (k) => (k in data) ? data[k] : null,
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    clear: () => { for (const k of Object.keys(data)) delete data[k]; },
    _data: data,
  };
}

export async function run({ test, assertTrue, assertEq }) {
  await test('fetchFromServer populates set on success', async () => {
    installFakeLocalStorage();
    const f = makeFakeFetch([{ json: { ids: [1, 2, 3] } }]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    assertTrue(store.isReady());
    const ids = [...store.get()].sort((a, b) => a - b);
    assertEq(ids.join(','), '1,2,3');
  });

  await test('fetchFromServer falls back to localStorage on error', async () => {
    installFakeLocalStorage();
    localStorage.setItem('cpacc:missed', JSON.stringify([7, 8, 9]));
    const f = makeFakeFetch([new Error('network')]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    assertTrue(store.isReady());
    const ids = [...store.get()].sort((a, b) => a - b);
    assertEq(ids.join(','), '7,8,9');
  });

  await test('fetchFromServer falls back to empty set when no local cache and server fails', async () => {
    installFakeLocalStorage();
    const f = makeFakeFetch([new Error('network')]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    assertEq(store.get().size, 0);
  });

  await test('add / remove mutate the set', async () => {
    installFakeLocalStorage();
    const f = makeFakeFetch([{ json: { ids: [] } }, { json: {} }]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    store.add(42);
    store.add(99);
    store.remove(42);
    const ids = [...store.get()];
    assertEq(ids.length, 1);
    assertEq(ids[0], 99);
  });

  await test('persist writes to server with PUT and to localStorage cache', async () => {
    installFakeLocalStorage();
    const f = makeFakeFetch([{ json: { ids: [] } }, { json: {} }]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    store.add(5);
    store.add(6);
    await store.persist();
    const cached = JSON.parse(localStorage.getItem('cpacc:missed'));
    assertEq(cached.slice().sort((a, b) => a - b).join(','), '5,6');
    const putCall = f.calls[1];
    assertEq(putCall.opts.method, 'PUT');
    const body = JSON.parse(putCall.opts.body);
    assertEq(body.ids.slice().sort((a, b) => a - b).join(','), '5,6');
  });

  await test('persist still updates local cache even if server PUT fails', async () => {
    installFakeLocalStorage();
    const f = makeFakeFetch([{ json: { ids: [] } }, new Error('offline')]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    store.add(11);
    await store.persist(); // server fails but localStorage gets the data
    const cached = JSON.parse(localStorage.getItem('cpacc:missed'));
    assertEq(cached.join(','), '11');
  });

  await test('when server probe fails (e.g. Cloudflare deploy with no /missed), subsequent writes skip the network', async () => {
    installFakeLocalStorage();
    // Initial GET fails (server unavailable). After that no further fetches
    // should fire — the store should detect "no server" and skip persist/clear.
    const f = makeFakeFetch([new Error('404')]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    store.add(42);
    await store.persist();
    await store.clear();
    // Only one fetch call (the initial probe).
    assertEq(f.calls.length, 1);
    // localStorage still got the persist + clear writes.
    const cached = JSON.parse(localStorage.getItem('cpacc:missed'));
    assertEq(cached.length, 0);
  });

  await test('clear wipes the in-memory set and local cache', async () => {
    installFakeLocalStorage();
    const f = makeFakeFetch([{ json: { ids: [1, 2, 3] } }, { json: {} }]);
    const store = createMissedStore({ fetch: f });
    await store.fetchFromServer();
    await store.clear();
    assertEq(store.get().size, 0);
    const cached = JSON.parse(localStorage.getItem('cpacc:missed'));
    assertEq(cached.length, 0);
    assertEq(f.calls[1].opts.method, 'DELETE');
  });
}
