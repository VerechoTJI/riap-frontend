import * as store from "./store";

export function setStoreMode(mode) {
  store.setMode(mode);
}
export async function getListings() {
  return await store.getListings();
}

export async function getMessages() {
  return await store.getMessages();
}

export async function getUsers() {
  return await store.getUsers();
}

export async function addListing(listing) {
  return await store.addListing(listing);
}

export async function addUser(user) {
  return await store.addUser(user);
}

export async function addMessage(message) {
  return await store.addMessage(message);
}
