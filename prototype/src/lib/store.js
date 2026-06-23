// Simple client-side store with two modes: 'local' (uses localStorage) and 'memory' (ephemeral)
let mode = "local"; // 'local' or 'memory'
let listings = null;
let users = null;
let messages = null;
let initialized = false;

export function setMode(m) {
  if (m !== "local" && m !== "memory") console.warn("store: unknown mode", m);
  mode = m;
  // force re-init on next call
  initialized = false;
}

async function fetchJson(path) {
  try {
    const r = await fetch(`/fixtures/${path}`);
    if (!r.ok) return [];
    return await r.json();
  } catch (e) {
    return [];
  }
}

export async function init() {
  if (initialized) return;
  const [baseListings, baseUsers, baseMessages] = await Promise.all([
    fetchJson("listings.json"),
    fetchJson("users.json"),
    fetchJson("messages.json"),
  ]);

  if (mode === "memory") {
    listings = baseListings.slice();
    users = baseUsers.slice();
    messages = baseMessages.slice();
  } else {
    try {
      const storedListings = JSON.parse(localStorage.getItem("riap_local_listings") || "[]");
      const storedUsers = JSON.parse(localStorage.getItem("riap_local_users") || "[]");
      const storedMessages = JSON.parse(localStorage.getItem("riap_local_messages") || "[]");
      listings = [...storedListings, ...baseListings];
      users = [...storedUsers, ...baseUsers];
      messages = [...storedMessages, ...baseMessages];
    } catch (e) {
      listings = baseListings.slice();
      users = baseUsers.slice();
      messages = baseMessages.slice();
    }
  }

  initialized = true;
}

export async function getListings() {
  await init();
  return (listings || []).slice();
}

export async function getUsers() {
  await init();
  return (users || []).slice();
}

export async function getMessages() {
  await init();
  return (messages || []).slice();
}

function saveLocal(key, arr) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.error("store: saveLocal failed", e);
  }
}

export async function addListing(item) {
  await init();
  const entry = { ...item };
  if (!entry.id) entry.id = Date.now();
  if (!listings) listings = [];
  listings.unshift(entry);
  if (mode === "local") {
    try {
      const stored = JSON.parse(localStorage.getItem("riap_local_listings") || "[]");
      stored.unshift(entry);
      saveLocal("riap_local_listings", stored);
    } catch (e) {
      saveLocal("riap_local_listings", [entry]);
    }
  }
  window.dispatchEvent(new CustomEvent("riap-listings-changed", { detail: entry }));
  return entry;
}

export async function updateListing(updated) {
  await init();
  const idx = (listings || []).findIndex((l) => l.id === updated.id);
  if (idx >= 0) listings[idx] = { ...listings[idx], ...updated };
  if (mode === "local") {
    try {
      const stored = JSON.parse(localStorage.getItem("riap_local_listings") || "[]");
      const sidx = stored.findIndex((l) => l.id === updated.id);
      if (sidx >= 0) stored[sidx] = { ...stored[sidx], ...updated };
      saveLocal("riap_local_listings", stored);
    } catch (e) {
      console.error(e);
    }
  }
  window.dispatchEvent(new CustomEvent("riap-listings-changed", { detail: updated }));
  return updated;
}

export async function addUser(user) {
  await init();
  const entry = { ...user };
  if (!entry.id) entry.id = Date.now();
  if (!users) users = [];
  users.unshift(entry);
  if (mode === "local") {
    try {
      const stored = JSON.parse(localStorage.getItem("riap_local_users") || "[]");
      stored.unshift(entry);
      saveLocal("riap_local_users", stored);
    } catch (e) {
      saveLocal("riap_local_users", [entry]);
    }
  }
  window.dispatchEvent(new CustomEvent("riap-users-changed", { detail: entry }));
  return entry;
}

export async function addMessage(msg) {
  await init();
  const entry = { ...msg };
  if (!entry.id) entry.id = Date.now();
  if (!messages) messages = [];
  messages.unshift(entry);
  if (mode === "local") {
    try {
      const stored = JSON.parse(localStorage.getItem("riap_local_messages") || "[]");
      stored.unshift(entry);
      saveLocal("riap_local_messages", stored);
    } catch (e) {
      saveLocal("riap_local_messages", [entry]);
    }
  }
  window.dispatchEvent(new CustomEvent("riap-messages-changed", { detail: entry }));
  return entry;
}

// expose a quick debug handle on window in dev
if (typeof window !== "undefined") {
  window.riapStore = {
    setMode,
    getListings,
    getUsers,
    getMessages,
    addListing,
    addUser,
    addMessage,
    updateListing,
  };
  window.riapSetStoreMode = setMode;
}
