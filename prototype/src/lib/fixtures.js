export async function getListings() {
  const r = await fetch("/fixtures/listings.json");
  if (!r.ok) throw new Error("Failed to load listings");
  return await r.json();
}

export async function getMessages() {
  const r = await fetch("/fixtures/messages.json");
  if (!r.ok) throw new Error("Failed to load messages");
  return await r.json();
}

export async function getUsers() {
  const r = await fetch("/fixtures/users.json");
  if (!r.ok) throw new Error("Failed to load users");
  return await r.json();
}
