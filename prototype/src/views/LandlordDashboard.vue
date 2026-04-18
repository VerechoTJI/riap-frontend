<template>
  <section class="dashboard-page">
    <div class="dashboard-hero">
      <div>
        <span class="eyebrow">房東管理</span>
        <h1>以卡片方式檢視你的房源，編輯與新增都保留在這個前端切片內。</h1>
        <p>目前仍是本機資料，適合展示房東管理流程、刊登狀態與快速修改操作。</p>
      </div>

      <button class="primary-button" @click="create">新增房源</button>
    </div>

    <div class="dashboard-metrics">
      <div>
        <strong>{{ myListings.length }}</strong>
        <span>總房源</span>
      </div>
      <div>
        <strong>{{ publishedCount }}</strong>
        <span>已刊登</span>
      </div>
      <div>
        <strong>{{ pendingCount }}</strong>
        <span>待審核</span>
      </div>
    </div>

    <div class="listing-grid">
      <article v-for="listing in myListings" :key="listing.id" class="listing-card">
        <div class="listing-card__media">
          <img :src="listingImage(listing)" :alt="listing.title" @error="handleListingImageError($event, listing)" />
          <span class="status-badge" :class="statusTone(listing.status)">{{ statusLabel(listing.status) }}</span>
        </div>

        <div class="listing-card__body">
          <div class="listing-card__topline">
            <h2>{{ listing.title }}</h2>
            <strong>NT$ {{ formatTwd(listing.rent) }}</strong>
          </div>
          <p>{{ listing.city }} · {{ listing.address }}</p>
          <div class="listing-meta">
            <span>{{ listing.size }} 坪</span>
            <span>押金 NT$ {{ formatTwd(listing.deposit || listing.rent * 2) }}</span>
          </div>
          <div class="action-row">
            <button class="ghost-button" @click="edit(listing)">編輯</button>
            <button class="ghost-button danger" @click="remove(listing)">刪除</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
import { getListings } from "../lib/fixtures";
import { formatTwd, handleListingImageError, listingImage, statusLabel, statusTone } from "../lib/ui";

export default {
  data() {
    return { all: [] };
  },
  async created() {
    try {
      this.all = await getListings();
    } catch (error) {
      console.error(error);
    }
  },
  computed: {
    myListings() {
      return this.all;
    },
    publishedCount() {
      return this.all.filter((listing) => listing.status === "published").length;
    },
    pendingCount() {
      return this.all.filter((listing) => listing.status === "pending").length;
    },
  },
  methods: {
    formatTwd,
    handleListingImageError,
    listingImage,
    statusLabel,
    statusTone,
    create() {
      const title = prompt("新房源標題", "近捷運高質感套房");
      if (title === null) return;
      const city = prompt("城市", "台北市") || "台北市";
      const rent = Number(prompt("月租", "18000") || 18000);
      const description = prompt("簡短描述", "採光好、生活機能佳") || "採光好、生活機能佳";
      this.all.unshift({
        id: Date.now(),
        title,
        description,
        rent,
        city,
        address: `${city} 新增路 1 號`,
        deposit: rent * 2,
        managementFee: 1000,
        size: 16,
        layout: "1房1廳1衛",
        floor: "8F / 12F",
        availableFrom: "2026-05-01",
        landlord: "新增房東",
        status: "published",
        features: ["可開伙", "近捷運"],
      });
    },
    edit(listing) {
      const title = prompt("修改標題", listing.title);
      if (title === null) return;
      const rent = prompt("修改月租", String(listing.rent));
      if (rent === null) return;
      listing.title = title;
      listing.rent = Number(rent || listing.rent);
    },
    remove(listing) {
      if (!confirm(`確定刪除「${listing.title}」？`)) return;
      this.all = this.all.filter((item) => item.id !== listing.id);
    },
  },
};
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 18px;
}

.dashboard-hero,
.dashboard-metrics,
.listing-card {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: var(--card);
  box-shadow: var(--shadow);
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(23, 50, 77, 0.96), rgba(61, 90, 118, 0.9));
  color: #fff;
}

.dashboard-hero h1 {
  margin: 16px 0 10px;
  font-size: clamp(2rem, 3vw, 3.2rem);
  line-height: 1.08;
}

.dashboard-hero p {
  max-width: 56ch;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.86);
}

.eyebrow {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.primary-button {
  border: 0;
  border-radius: 18px;
  padding: 15px 18px;
  background: linear-gradient(135deg, #f3d0b4, #f6b17e);
  color: #1f2937;
  font-weight: 700;
  white-space: nowrap;
}

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 18px;
}

.dashboard-metrics div {
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
}

.dashboard-metrics strong,
.dashboard-metrics span {
  display: block;
}

.dashboard-metrics strong {
  font-size: 1.4rem;
}

.dashboard-metrics span,
.listing-card p {
  color: var(--muted);
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.listing-card {
  overflow: hidden;
}

.listing-card__media {
  position: relative;
  aspect-ratio: 16 / 10;
}

.listing-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 7px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.8rem;
}

.status-badge.success { background: rgba(40, 125, 95, 0.92); }
.status-badge.warning { background: rgba(187, 125, 36, 0.92); }
.status-badge.danger { background: rgba(165, 57, 57, 0.92); }

.listing-card__body {
  padding: 20px;
}

.listing-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.listing-card__topline h2 {
  margin: 0;
}

.listing-card__topline strong {
  white-space: nowrap;
  color: var(--primary-dark);
}

.listing-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0 16px;
}

.action-row {
  display: flex;
  gap: 10px;
}

.ghost-button {
  border: 1px solid rgba(23, 50, 77, 0.12);
  background: rgba(255, 255, 255, 0.78);
  color: var(--secondary);
  border-radius: 14px;
  padding: 10px 14px;
  cursor: pointer;
}

.ghost-button.danger {
  color: #9b2c2c;
}

@media (max-width: 980px) {
  .dashboard-hero,
  .dashboard-metrics,
  .listing-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
