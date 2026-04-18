const listingImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560185008-b033106af5a4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
];

function svgFallback(title) {
  const safeTitle = String(title || "房源照片").replace(/[&<>\"']/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#17324d"/>
          <stop offset="100%" stop-color="#b45f34"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <circle cx="980" cy="150" r="120" fill="rgba(255,255,255,0.16)"/>
      <rect x="190" y="270" width="820" height="280" rx="32" fill="rgba(255,255,255,0.14)"/>
      <text x="600" y="390" fill="#fff" font-family="Arial, sans-serif" font-size="58" text-anchor="middle">${safeTitle}</text>
      <text x="600" y="460" fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif" font-size="28" text-anchor="middle">房源圖片暫時無法載入</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function listingImage(listing) {
  if (listing?.image) return listing.image;
  const index = Math.abs(Number(listing?.id || 0) - 1) % listingImages.length;
  return listingImages[index];
}

export function listingImageFallback(listing) {
  return svgFallback(listing?.title);
}

export function handleListingImageError(event, listing) {
  event.target.onerror = null;
  event.target.src = listingImageFallback(listing);
}

export function formatTwd(value) {
  return new Intl.NumberFormat("zh-TW").format(Number(value || 0));
}

export function statusLabel(status) {
  switch (status) {
    case "published":
      return "已刊登";
    case "pending":
      return "待審核";
    case "returned":
      return "已退回";
    default:
      return status || "未知";
  }
}

export function statusTone(status) {
  switch (status) {
    case "published":
      return "success";
    case "pending":
      return "warning";
    case "returned":
      return "danger";
    default:
      return "neutral";
  }
}

export function roleLabel(role) {
  switch (role) {
    case "tenant":
      return "承租者";
    case "landlord":
      return "房東";
    case "admin":
      return "管理員";
    default:
      return role || "訪客";
  }
}

export function initials(name) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatDate(value) {
  if (!value) return "剛剛";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function readCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("riap_user") || "null");
  } catch {
    return null;
  }
}

export function writeCurrentUser(user) {
  localStorage.setItem("riap_user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("riap-user-changed", { detail: user }));
}

export function clearCurrentUser() {
  localStorage.removeItem("riap_user");
  window.dispatchEvent(new CustomEvent("riap-user-changed", { detail: null }));
}
