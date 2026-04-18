<template>
  <section class="review-page">
    <div class="review-hero">
      <div>
        <span class="eyebrow">管理員審核</span>
        <h1>待審核房源一眼看清，發布與退回都有明確動作。</h1>
        <p>這個畫面用於展示審核節奏、回覆原因與狀態切換。</p>
      </div>

      <div class="review-count">
        <strong>{{ pending.length }}</strong>
        <span>筆待審核</span>
      </div>
    </div>

    <div class="review-grid">
      <article v-for="listing in pending" :key="listing.id" class="review-card">
        <div class="review-card__media">
          <img :src="listingImage(listing)" :alt="listing.title" @error="handleListingImageError($event, listing)" />
          <span class="status-badge" :class="statusTone(listing.status)">{{ statusLabel(listing.status) }}</span>
        </div>

        <div class="review-card__body">
          <h2>{{ listing.title }}</h2>
          <p>{{ listing.description }}</p>

          <div class="review-meta">
            <span>{{ listing.city }}</span>
            <span>NT$ {{ formatTwd(listing.rent) }}</span>
            <span>{{ listing.landlord }}</span>
          </div>

          <div class="action-row">
            <router-link class="ghost-button" :to="{ path: '/listing/' + listing.id }">檢視詳情</router-link>
            <button class="primary-button" @click="publish(listing)">發布</button>
            <button class="ghost-button" @click="returnItem(listing)">退回</button>
          </div>

          <p v-if="listing.reviewNote" class="review-note">退回原因：{{ listing.reviewNote }}</p>
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
    pending() {
      return this.all.filter((listing) => listing.status === "pending");
    },
  },
  methods: {
    formatTwd,
    handleListingImageError,
    listingImage,
    statusLabel,
    statusTone,
    publish(listing) {
      listing.status = "published";
      listing.reviewNote = "";
    },
    returnItem(listing) {
      const reason = prompt("請輸入退回原因", "照片需要補充更多角度");
      if (reason === null) return;
      listing.status = "returned";
      listing.reviewNote = reason.trim();
    },
  },
};
</script>

<style scoped>
.review-page {
  display: grid;
  gap: 18px;
}

.review-hero,
.review-card {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: var(--card);
  box-shadow: var(--shadow);
}

.review-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(23, 50, 77, 0.96), rgba(180, 95, 52, 0.74));
  color: #fff;
}

.review-hero h1 {
  margin: 16px 0 10px;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.08;
}

.review-hero p {
  max-width: 54ch;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.8;
}

.eyebrow,
.status-badge {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
}

.eyebrow {
  width: fit-content;
  background: rgba(255, 255, 255, 0.14);
}

.review-count {
  display: grid;
  gap: 4px;
  min-width: 120px;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.14);
  text-align: center;
}

.review-count strong {
  font-size: 2rem;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.review-card {
  overflow: hidden;
}

.review-card__media {
  position: relative;
  aspect-ratio: 16 / 10;
}

.review-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  color: #fff;
}

.status-badge.warning { background: rgba(187, 125, 36, 0.92); }

.review-card__body {
  padding: 20px;
}

.review-card__body h2 {
  margin-top: 0;
}

.review-card__body p,
.review-note {
  color: var(--muted);
  line-height: 1.8;
}

.review-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 14px 0 18px;
  color: var(--secondary);
}

.action-row {
  display: flex;
  gap: 10px;
}

.primary-button,
.ghost-button {
  border: 0;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  background: linear-gradient(135deg, var(--primary), #d78145);
  color: #fff;
}

.ghost-button {
  border: 1px solid rgba(23, 50, 77, 0.12);
  background: rgba(255, 255, 255, 0.78);
  color: var(--secondary);
}

.review-note {
  margin-bottom: 0;
}

@media (max-width: 980px) {
  .review-hero,
  .review-grid {
    grid-template-columns: 1fr;
  }

  .review-hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
