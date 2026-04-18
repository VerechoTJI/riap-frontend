import { listingImage } from "./ui";

export function sortMessagesAsc(messages) {
  return (messages || [])
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function buildThreads(listingsArg, messagesArg, topN = 3) {
  const msgs = messagesArg || [];
  const lst = listingsArg || [];
  const all = lst.map((listing) => {
    const m = msgs.filter((mm) => mm.listingId === listing.id);
    const recent = m
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return {
      id: listing.id,
      listingId: listing.id,
      title: listing.title,
      city: listing.city,
      image: listingImage(listing),
      preview: recent?.body || `${listing.city} · NT$ ${listing.rent}`,
      recentAt: recent?.createdAt || listing.postedAt || null,
    };
  });
  all.sort((a, b) => new Date(b.recentAt || 0) - new Date(a.recentAt || 0));
  return all.slice(0, topN);
}

export function moveThreadToTop(
  threads,
  listingId,
  preview,
  recentAt,
  topN = 3,
) {
  const copy = (threads || []).slice();
  const idx = copy.findIndex((t) => t.id === listingId);
  if (idx >= 0) {
    const existing = copy.splice(idx, 1)[0];
    const updated = {
      ...existing,
      preview: preview || existing.preview,
      recentAt: recentAt || existing.recentAt,
    };
    copy.unshift(updated);
  } else {
    copy.unshift({
      id: listingId,
      listingId,
      title: "租屋對話",
      city: "",
      image: null,
      preview: preview || "",
      recentAt: recentAt || null,
    });
  }
  if (copy.length > topN) copy.splice(topN);
  return copy;
}
