import { getAuthHeaders } from './auth';

const STATUS_MAP = {
  AVAILABLE: "published",
  PENDING: "pending",
  REJECTED: "returned",
  RENTED: "rented",
  REMOVED: "removed",
};

function normalize(item) {
  const features = [];
  if (item.hasInternet) features.push("網路");
  if (item.hasFurniture) features.push("家具");
  if (item.hasAC) features.push("冷氣");
  if (item.petFriendly) features.push("可養寵物");
  if (item.hasParking) features.push("有車位");

  const propTypeMap = {
    "SUITE": "套房",
    "APARTMENT": "整層住家",
    "SHARED_ROOM": "雅房",
    "HOUSE": "透天厝"
  };

  return {
    ...item,
    rent: item.feeDisclosure?.rent ?? Math.round((item.rentCents || 0) / 100),
    deposit: item.feeDisclosure?.deposit ?? Math.round((item.depositCents || 0) / 100),
    managementFee: item.feeDisclosure?.managementFee ?? Math.round((item.managementFeeCents || 0) / 100),
    size: item.area || item.sizePing || item.size,
    image: item.imageUrl || null,
    status: STATUS_MAP[item.status] ?? item.status?.toLowerCase() ?? "unknown",
    features,
    layout: item.layout || "開放式格局",
    floor: item.floor ? `${item.floor}F / ${item.totalFloors || 1}F` : (`${item.floor || 1}F / ${item.totalFloors || 1}F`),
    type: item.propertyType ? (propTypeMap[item.propertyType] || item.propertyType) : "一般房源",
    postedAt: item.postedAt ? new Date(item.postedAt).toLocaleDateString() : "未知時間",
    landlord: item.landlordName || "房東"
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

  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return (data.listings || []).map(normalize);
}

export async function getListingById(id) {
  const url = new URL(`/api/listings/${id}`, window.location.origin);
  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return normalize(data);
}
