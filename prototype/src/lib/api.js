const STATUS_MAP = {
  AVAILABLE: "published",
  PENDING: "pending",
  REJECTED: "returned",
  RENTED: "rented",
  REMOVED: "removed",
};

function normalize(item) {
  return {
    ...item,
    rent: Math.round((item.rentCents || 0) / 100),
    deposit: Math.round((item.depositCents || 0) / 100),
    managementFee: Math.round((item.managementFeeCents || 0) / 100),
    size: item.sizePing,
    image: item.imageUrl || null,
    status: STATUS_MAP[item.status] ?? item.status?.toLowerCase() ?? "unknown",
  };
}

export async function searchListings(params = {}) {
  const url = new URL("/api/listings", window.location.origin);

  if (params.keyword)                             url.searchParams.set("keyword", params.keyword);
  if (params.city)                                url.searchParams.set("city", params.city);
  if (params.propertyType)                        url.searchParams.set("propertyType", params.propertyType);
  if (params.minRent != null && params.minRent !== "") url.searchParams.set("minRent", params.minRent * 100);
  if (params.maxRent != null && params.maxRent !== "") url.searchParams.set("maxRent", params.maxRent * 100);
  if (params.hasInternet != null)                 url.searchParams.set("hasInternet", params.hasInternet);
  if (params.hasFurniture != null)                url.searchParams.set("hasFurniture", params.hasFurniture);
  if (params.hasAC != null)                       url.searchParams.set("hasAC", params.hasAC);
  if (params.petFriendly != null)                 url.searchParams.set("petFriendly", params.petFriendly);
  if (params.hasParking != null)                  url.searchParams.set("hasParking", params.hasParking);
  if (params.page != null)                        url.searchParams.set("page", params.page);
  if (params.size != null)                        url.searchParams.set("size", params.size);
  if (params.sort)                                url.searchParams.set("sort", params.sort);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return (data.listings || []).map(normalize);
}

export async function getListingById(id) {
  const url = new URL(`/api/listings/${id}`, window.location.origin);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return normalize(data);
}
