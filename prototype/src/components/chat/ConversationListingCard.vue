<template>
  <div class="conversation-card">
    <div class="conversation-card__media">
      <img :src="image" alt="目前對話房源" />
    </div>
    <div class="conversation-card__meta">
      <div class="meta-header">
        <div>
          <strong>{{ title }}</strong>
          <span>{{ city }}</span>
        </div>
        <router-link
          v-if="listing"
          :to="`/listing/${listing.id}`"
          class="listing-link"
        >
          查看房源
        </router-link>
      </div>
      <div class="conversation-card__specs" v-if="listing">
        <span>月租: NT$ {{ formatTwd(listing.rent) }}</span>
        <span>押金: NT$ {{ formatTwd(listing.deposit || listing.rent * 2) }}</span>
        <span>管理費: NT$ {{ formatTwd(listing.managementFee || 0) }}</span>
        <span>坪數: {{ listing.size }} 坪</span>
        <span>格局: {{ listing.layout }}</span>
        <span>樓層: {{ listing.floor }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatTwd } from "../../lib/ui";

export default {
  name: "ConversationListingCard",
  props: {
    listing: {
      type: Object,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  methods: {
    formatTwd,
  },
};
</script>

<style scoped>
.conversation-card {
  border-radius: 28px;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 16px;
}

.conversation-card__media {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  border-radius: 16px;
  overflow: hidden;
  margin: 0;
}

.conversation-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.conversation-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px 0 0;
  flex: 1;
}

.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.meta-header > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.conversation-card__meta span {
  color: var(--muted);
  font-size: 0.85rem;
}

.conversation-card__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 6px;
}

.conversation-card__specs span {
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
}

.listing-link {
  font-size: 0.85rem;
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.listing-link:hover {
  color: #a34e2c;
}
</style>
