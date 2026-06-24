import * as fixtures from "./fixtures";
import { getAuthHeaders } from "./auth";

const API_BASE_URL = '/api/listings';

// Helper to check if backend is reachable
async function tryFetch(url, options = {}) {
  try {
    const headers = { ...options.headers, ...getAuthHeaders() };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        // If it's a 404 or other error, we might still want to fallback if it's the backend being missing
        return { ok: false, status: response.status };
    }
    return { ok: true, data: await response.json() };
  } catch (e) {
    // Connection refused or other network error
    return { ok: false, error: e };
  }
}

export const ListingApiService = {
  async getAllPublished() {
    const res = await tryFetch(`${API_BASE_URL}/published`);
    if (res.ok) return res.data;
    
    // Fallback to fixtures
    const all = await fixtures.getListings();
    return all.filter(l => l.status === 'published' || l.status === 'PUBLISHED');
  },

  async getPending() {
    const res = await tryFetch(`${API_BASE_URL}/pending`);
    if (res.ok) return res.data;

    // Fallback to fixtures
    const all = await fixtures.getListings();
    return all.filter(l => l.status === 'pending' || l.status === 'PENDING');
  },

  async getByLandlord(landlordId) {
    const res = await tryFetch(`${API_BASE_URL}/landlord/${landlordId}`);
    if (res.ok) return res.data;

    // Fallback to fixtures
    const all = await fixtures.getListings();
    // In prototype, landlord might be a name or ID string
    return all.filter(l => l.landlordId === landlordId || l.landlord === landlordId);
  },

  async publish(listing) {
    const res = await tryFetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    });
    if (res.ok) return res.data;

    // Fallback to fixtures
    return await fixtures.addListing({
        ...listing,
        id: Date.now(),
        status: 'pending',
        // Map backend-style feeDisclosure back to flat prototype fields if needed
        rent: listing.feeDisclosure?.rent,
        deposit: listing.feeDisclosure?.deposit,
        managementFee: listing.feeDisclosure?.managementFee,
        waterElectricityRules: listing.feeDisclosure?.waterElectricityRules
    });
  },

  async review(id, status, reason) {
    const res = await tryFetch(`${API_BASE_URL}/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason })
    });
    if (res.ok) return res.data;

    // Fallback to fixtures
    const all = await fixtures.getListings();
    const item = all.find(l => l.id == id);
    if (item) {
        item.status = status.toLowerCase();
        item.reviewNote = reason;
        return await fixtures.updateListing(item);
    }
    throw new Error('找不到房源');
  },

  async unpublish(id) {
    const res = await tryFetch(`${API_BASE_URL}/${id}/unpublish`, {
      method: 'PATCH'
    });
    if (res.ok) return res.data;

    // Fallback to fixtures
    const all = await fixtures.getListings();
    const item = all.find(l => l.id == id);
    if (item) {
        item.status = 'private';
        return await fixtures.updateListing(item);
    }
    throw new Error('下架失敗');
  },

  async resubmit(id) {
    const res = await tryFetch(`${API_BASE_URL}/${id}/resubmit`, {
      method: 'PATCH'
    });
    if (res.ok) return res.data;

    // Fallback to fixtures
    const all = await fixtures.getListings();
    const item = all.find(l => l.id == id);
    if (item) {
        item.status = 'pending';
        item.reviewNote = null;
        return await fixtures.updateListing(item);
    }
    throw new Error('重新送審失敗');
  },

  async bulkUnpublish(landlordId) {
    const res = await tryFetch(`${API_BASE_URL}/bulk-unpublish/${landlordId}`, {
      method: 'PATCH'
    });
    if (res.ok) return null;

    // Fallback to fixtures
    const all = await fixtures.getListings();
    const mine = all.filter(l => (l.landlordId === landlordId || l.landlord === landlordId) && (l.status === 'published' || l.status === 'PUBLISHED'));
    for (const item of mine) {
        item.status = 'private';
        await fixtures.updateListing(item);
    }
    return null;
  }
};
