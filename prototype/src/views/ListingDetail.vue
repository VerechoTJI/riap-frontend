<template>
  <section class="detail-page">
    <router-link class="back-link" to="/">← 回到列表</router-link>

    <div v-if="listing" class="detail-shell">
      <div class="detail-hero">
        <img :src="listingImage(listing)" :alt="listing.title" @error="handleListingImageError($event, listing)" />
        <div class="detail-hero__overlay">
          <span class="status-badge" :class="statusTone(listing.status)">{{ statusLabel(listing.status) }}</span>
          <h1>{{ listing.title }}</h1>
          <p>{{ listing.city }} · {{ listing.address }}</p>
        </div>
      </div>

      <div class="detail-content">
        <div class="detail-main">
          <div class="price-card">
            <div>
              <span>月租</span>
              <strong>NT$ {{ formatTwd(listing.rent) }}</strong>
            </div>
            <div>
              <span>押金</span>
              <strong>NT$ {{ formatTwd(listing.deposit || listing.rent * 2) }}</strong>
            </div>
            <div>
              <span>管理費</span>
              <strong>NT$ {{ formatTwd(listing.managementFee || 0) }}</strong>
            </div>
          </div>

          <div class="section-card">
            <h2>房源說明</h2>
            <p>{{ listing.description }}</p>
          </div>

          <div class="section-card">
            <h2>重點規格</h2>
            <div class="spec-grid">
              <div><span>坪數</span><strong>{{ listing.size }} 坪</strong></div>
              <div><span>格局</span><strong>{{ listing.layout }}</strong></div>
              <div><span>樓層</span><strong>{{ listing.floor }}</strong></div>
              <div><span>可入住</span><strong>{{ listing.availableFrom }}</strong></div>
            </div>
          </div>

          <div class="section-card">
            <h2>特色</h2>
            <div class="feature-tags">
              <span v-for="feature in listing.features || []" :key="feature">{{ feature }}</span>
            </div>
          </div>
        </div>

        <aside class="detail-aside">
          <div class="contact-card">
            <span class="eyebrow">聯繫房東</span>
            <h3>{{ listing.landlord }}</h3>
            <p>從這個細節頁可直接前往訊息頁，延續這筆房源的詢問流程。</p>
            <router-link class="primary-button" :to="{ path: '/messages', query: { listing: listing.id } }">
              立即詢問
            </router-link>
          </div>

          <div class="section-card note-card">
            <h2>補充資訊</h2>
            <ul>
              <li>刊登時間：{{ listing.postedAt }}</li>
              <li>類型：{{ listing.type }}</li>
              <li>備註：{{ listing.reviewNote || '無' }}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>

    <div v-else class="loading-card">載入房源中...</div>
  </section>
</template>

<script>
import { getListings } from "../lib/fixtures";
import { formatTwd, handleListingImageError, listingImage, statusLabel, statusTone } from "../lib/ui";

export default {
  data() {
    return {
      listing: {
        title: "載入中",
        description: "",
        rent: 0,
        city: "",
        address: "",
        deposit: 0,
        managementFee: 0,
        size: 0,
        layout: "",
        floor: "",
        availableFrom: "",
        landlord: "",
        features: [],
        status: "published",
      },
    };
  },
  async created() {
    try {
      const id = Number(this.$route.params.id);
      const all = await getListings();
      this.listing = all.find((item) => item.id === id) || null;
    } catch (error) {
      console.error(error);
      this.listing = null;
    }
  },
  methods: {
    formatTwd,
    handleListingImageError,
    listingImage,
    statusLabel,
    statusTone,
  },
};
</script>

<style scoped>
.detail-page {
  display: grid;
  gap: 16px;
}

.back-link {
  color: var(--secondary);
  font-weight: 600;
}

.detail-shell {
  display: grid;
  gap: 18px;
}

.detail-hero {
  position: relative;
  min-height: 360px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.detail-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-hero__overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 30px;
  background: linear-gradient(180deg, transparent, rgba(17, 24, 39, 0.82));
  color: #fff;
}

.detail-hero__overlay h1 {
  margin: 12px 0 6px;
  font-size: clamp(1.8rem, 4vw, 3.2rem);
}

.detail-hero__overlay p {
  margin: 0;
  color: rgba(255, 255, 255, 0.84);
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(290px, 0.6fr);
  gap: 18px;
}

.detail-main,
.detail-aside {
  display: grid;
  gap: 18px;
}

.price-card,
.section-card,
.contact-card,
.loading-card {
  border-radius: 24px;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: var(--shadow);
}

.price-card {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 18px;
}

.price-card span,
.spec-grid span,
.eyebrow {
  color: var(--muted);
}

.price-card strong {
  display: block;
  font-size: 1.15rem;
  margin-top: 6px;
}

.section-card,
.contact-card {
  padding: 22px;
}

.section-card h2,
.contact-card h3 {
  margin-top: 0;
}

.section-card p {
  color: var(--muted);
  line-height: 1.8;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.spec-grid div {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(23, 50, 77, 0.04);
}

.spec-grid strong {
  display: block;
  margin-top: 6px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feature-tags span {
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(180, 95, 52, 0.1);
  color: var(--primary-dark);
}

.contact-card {
  display: grid;
  gap: 12px;
  background: linear-gradient(160deg, rgba(23, 50, 77, 0.96), rgba(60, 92, 123, 0.9));
  color: #fff;
}

.contact-card p,
.note-card li {
  color: rgba(255, 255, 255, 0.84);
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f3d0b4, #f6b17e);
  color: #1f2937;
  font-weight: 700;
}

.note-card {
  background: rgba(23, 50, 77, 0.95);
  color: #fff;
}

.note-card ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
}

.loading-card {
  padding: 26px;
}

@media (max-width: 980px) {
  .detail-content,
  .price-card {
    grid-template-columns: 1fr;
  }
}
</style>
