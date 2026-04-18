<template>
  <section class="listings-page">
    <div class="hero-card">
      <div class="hero-copy">
        <span class="eyebrow">精選房源</span>
        <h1>把條件拉近一點，理想的房子就會更快出現。</h1>
        <p>
          透過關鍵字、城市與租金區間，即可在前端快速搜尋房源。
        </p>

        <div class="hero-stats">
          <div>
            <strong>{{ filtered.length }}</strong>
            <span>筆結果</span>
          </div>
          <div>
            <strong>{{ cities.length }}</strong>
            <span>個城市</span>
          </div>
          <div>
            <strong>本機</strong>
            <span>JSON 假資料</span>
          </div>
        </div>
      </div>

      <div class="hero-media">
        <img
          src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
          alt="房源示意圖"
        />
      </div>
    </div>

    <div class="filters-card">
      <div class="filters-grid">
        <label class="field field-search">
          <span>關鍵字</span>
          <input v-model="q" placeholder="搜尋地點、描述、特色" />
        </label>

        <label class="field">
          <span>城市</span>
          <select v-model="city">
            <option value="">全部城市</option>
            <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <label class="field">
          <span>最低租金</span>
          <input v-model.number="minRent" type="number" min="0" placeholder="0" />
        </label>

        <label class="field">
          <span>最高租金</span>
          <input v-model.number="maxRent" type="number" min="0" placeholder="50000" />
        </label>
      </div>

      <div class="filter-actions">
        <div class="filter-note">預設只顯示已審核房源。</div>
        <button class="ghost-button" @click="clearFilters">清除條件</button>
      </div>
    </div>

    <div class="listing-grid">
      <router-link
        v-for="item in paged"
        :key="item.id"
        class="listing-card"
        :to="`/listing/${item.id}`"
      >
        <div class="listing-card__media">
          <img :src="listingImage(item)" :alt="item.title" @error="handleListingImageError($event, item)" />
          <span class="status-badge" :class="statusTone(item.status)">{{ statusLabel(item.status) }}</span>
        </div>

        <div class="listing-card__body">
          <div class="listing-card__topline">
            <h2>{{ item.title }}</h2>
            <strong>NT$ {{ formatTwd(item.rent) }}</strong>
          </div>
          <p>{{ item.description }}</p>
          <div class="listing-meta">
            <span>{{ item.city }}</span>
            <span>押金 NT$ {{ formatTwd(item.deposit || item.rent * 2) }}</span>
            <span>{{ item.size || 0 }} 坪</span>
          </div>
        </div>
      </router-link>
    </div>

    <div v-if="paged.length === 0" class="empty-state">
      <h3>找不到符合條件的房源</h3>
      <p>可以放寬關鍵字、城市或租金條件，再試一次。</p>
    </div>

    <div class="pagination">
      <button class="ghost-button" @click="prev" :disabled="page === 1">上一頁</button>
      <span>第 {{ page }} / {{ pages }} 頁</span>
      <button class="ghost-button" @click="next" :disabled="page >= pages">下一頁</button>
    </div>
  </section>
</template>

<script>
import { getListings } from "../lib/fixtures";
import { formatTwd, handleListingImageError, listingImage, statusLabel, statusTone } from "../lib/ui";

export default {
  data() {
    return {
      q: "",
      city: "",
      minRent: null,
      maxRent: null,
      page: 1,
      per: 6,
      all: [],
    };
  },
  async created() {
    try {
      this.all = await getListings();
    } catch (error) {
      console.error(error);
    }
  },
  computed: {
    cities() {
      return Array.from(new Set(this.all.map((listing) => listing.city))).filter(Boolean);
    },
    filtered() {
      return this.all
        .filter((listing) => {
          if (listing.status !== "published") return false;
          if (this.city && listing.city !== this.city) return false;
          if (this.q) {
            const searchable = `${listing.title} ${listing.description} ${listing.city} ${(listing.features || []).join(" ")}`.toLowerCase();
            if (!searchable.includes(this.q.toLowerCase())) return false;
          }
          if (this.minRent !== null && this.minRent !== "" && Number(listing.rent) < Number(this.minRent)) return false;
          if (this.maxRent !== null && this.maxRent !== "" && Number(listing.rent) > Number(this.maxRent)) return false;
          return true;
        })
        .sort((left, right) => Number(right.id) - Number(left.id));
    },
    pages() {
      return Math.max(1, Math.ceil(this.filtered.length / this.per));
    },
    paged() {
      return this.filtered.slice((this.page - 1) * this.per, this.page * this.per);
    },
  },
  methods: {
    formatTwd,
    handleListingImageError,
    listingImage,
    statusLabel,
    statusTone,
    prev() {
      if (this.page > 1) this.page -= 1;
    },
    next() {
      if (this.page < this.pages) this.page += 1;
    },
    clearFilters() {
      this.q = "";
      this.city = "";
      this.minRent = null;
      this.maxRent = null;
      this.page = 1;
    },
  },
};
</script>

<style scoped>
.listings-page {
  display: grid;
  gap: 20px;
}

.hero-card,
.filters-card,
.listing-card,
.empty-state {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: var(--card);
  box-shadow: var(--shadow);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  overflow: hidden;
}

.hero-copy {
  padding: 34px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(180, 95, 52, 0.12);
  color: var(--primary-dark);
  font-size: 0.85rem;
}

.hero-copy h1 {
  margin: 18px 0 12px;
  font-size: clamp(2rem, 3vw, 3.6rem);
  line-height: 1.05;
}

.hero-copy p {
  color: var(--muted);
  line-height: 1.8;
  max-width: 58ch;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}

.hero-stats div {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.hero-stats strong,
.hero-stats span {
  display: block;
}

.hero-stats strong {
  font-size: 1.35rem;
  margin-bottom: 4px;
}

.hero-stats span {
  color: var(--muted);
}

.hero-media {
  min-height: 280px;
}

.hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.filters-card {
  padding: 22px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: var(--muted);
  font-size: 0.92rem;
}

.field input,
.field select {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.82);
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: rgba(180, 95, 52, 0.55);
  box-shadow: 0 0 0 4px rgba(180, 95, 52, 0.12);
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
}

.filter-note {
  color: var(--secondary);
  font-size: 0.95rem;
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.listing-card {
  overflow: hidden;
  display: grid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.listing-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 58px rgba(31, 41, 55, 0.18);
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

.status-badge.success {
  background: rgba(40, 125, 95, 0.92);
}

.status-badge.warning {
  background: rgba(187, 125, 36, 0.92);
}

.status-badge.danger {
  background: rgba(165, 57, 57, 0.92);
}

.listing-card__body {
  padding: 20px 20px 22px;
}

.listing-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.listing-card__topline h2 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
}

.listing-card__topline strong {
  white-space: nowrap;
  color: var(--primary-dark);
}

.listing-card__body p {
  color: var(--muted);
  line-height: 1.7;
}

.listing-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--secondary);
  font-size: 0.92rem;
}

.empty-state {
  padding: 28px;
  text-align: center;
}

.empty-state h3,
.empty-state p {
  margin: 0;
}

.empty-state p {
  color: var(--muted);
  margin-top: 8px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.ghost-button {
  border: 1px solid rgba(23, 50, 77, 0.12);
  background: rgba(255, 255, 255, 0.78);
  color: var(--secondary);
  border-radius: 14px;
  padding: 10px 14px;
  cursor: pointer;
}

@media (max-width: 980px) {
  .hero-card,
  .listing-grid,
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
