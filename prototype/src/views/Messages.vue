<template>
  <section class="messages-page">
    <div v-if="!user" class="messages-lock">
      <div class="messages-lock__card">
        <span class="eyebrow">需要登入</span>
        <h1>訊息功能僅供登入使用</h1>
        <p>請先登入，才能查看對話、發送訊息與切換房源聊天串。</p>
        <router-link class="primary-button" :to="{ path: '/login', query: { redirect: '/messages' } }">前往登入</router-link>
      </div>
    </div>

    <template v-else>
    <div class="messages-hero">
      <div>
        <span class="eyebrow">即時溝通</span>
        <h1>把詢問、回覆與房源脈絡整理成一條清晰的對話。</h1>
        <p>
          訊息內容只儲存在前端記憶體，適合用於展示 tenant / landlord 的互動流程。
        </p>
      </div>

      <div class="conversation-card">
        <div class="conversation-card__media">
          <img :src="listingHero" alt="目前對話房源" />
        </div>
        <div class="conversation-card__meta">
          <strong>{{ currentListingTitle }}</strong>
          <span>{{ currentListingCity }}</span>
        </div>
      </div>
    </div>

    <div class="messages-layout">
      <aside class="thread-list">
        <div class="section-title">對話列表</div>
        <div v-for="thread in threads" :key="thread.id" class="thread-item" :class="{ active: thread.id === activeThreadId }" @click="activeThreadId = thread.id">
          <img :src="thread.image" :alt="thread.title" />
          <div>
            <strong>{{ thread.title }}</strong>
            <p>{{ thread.preview }}</p>
          </div>
        </div>
      </aside>

      <main class="chat-panel">
        <div class="chat-panel__header">
          <div>
            <span class="eyebrow">{{ currentThread.statusLabel }}</span>
            <h2>{{ currentThread.title }}</h2>
          </div>
          <div class="chat-panel__users">
            <span>{{ currentThread.from }}</span>
            <span>→</span>
            <span>{{ currentThread.to }}</span>
          </div>
        </div>

        <div class="chat-stream">
          <article v-for="message in threadMessages" :key="message.id" class="bubble" :class="message.from === currentThread.from ? 'outbound' : 'inbound'">
            <div class="bubble__meta">
              <strong>{{ message.from }}</strong>
              <span>{{ formatDate(message.createdAt) }}</span>
            </div>
            <p>{{ message.body }}</p>
          </article>
        </div>

        <div class="composer">
          <textarea v-model="body" placeholder="輸入訊息，與房東建立第一句對話..."></textarea>
          <div class="composer__actions">
            <span>{{ body.length }}/240</span>
            <button class="primary-button" @click="send">傳送訊息</button>
          </div>
        </div>
      </main>
    </div>
    </template>
  </section>
</template>

<script>
import { getListings, getMessages } from "../lib/fixtures";
import { formatDate, formatTwd, listingImage, readCurrentUser } from "../lib/ui";

export default {
  data() {
    return {
      body: "",
      messages: [],
      threads: [],
      activeThreadId: null,
      listings: [],
      user: readCurrentUser(),
    };
  },
  computed: {
    activeThread() {
      return this.threads.find((thread) => thread.id === this.activeThreadId) || this.threads[0] || null;
    },
    currentThread() {
      const listing = this.listings.find((item) => item.id === this.activeThread?.listingId) || this.listings[0] || {};
      return {
        title: listing.title || "租屋對話",
        from: readCurrentUser()?.displayName || readCurrentUser()?.username || "我",
        to: listing.landlord || "房東",
        statusLabel: "目前詢問",
      };
    },
    currentListingTitle() {
      return this.activeThread?.title || "租屋對話";
    },
    currentListingCity() {
      return this.activeThread?.city || "尚未選擇房源";
    },
    listingHero() {
      return this.activeThread?.image || listingImage(this.listings[0] || { id: 1 });
    },
    threadMessages() {
      return this.messages.filter((message) => message.listingId === this.activeThreadId);
    },
  },
  async created() {
    this.user = readCurrentUser();
    if (!this.user) return;
    try {
      const [messages, listings] = await Promise.all([getMessages(), getListings()]);
      this.messages = messages;
      this.listings = listings;
      this.threads = listings.slice(0, 3).map((listing) => ({
        id: listing.id,
        listingId: listing.id,
        title: listing.title,
        city: listing.city,
        image: listingImage(listing),
        preview: messages.find((message) => message.listingId === listing.id)?.body || `${listing.city} · NT$ ${formatTwd(listing.rent)}`,
      }));
      this.activeThreadId = Number(this.$route.query.listing) || this.threads[0]?.id || null;
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    formatDate,
    send() {
      const user = readCurrentUser() || this.user || { username: "匿名", displayName: "匿名" };
      if (!this.body.trim()) return;
      this.messages.push({
        id: Date.now(),
        listingId: this.activeThreadId,
        from: user.displayName || user.username,
        to: this.currentThread.to,
        body: this.body.trim(),
        createdAt: new Date().toISOString(),
      });
      this.body = "";
    },
  },
};
</script>

<style scoped>
.messages-page {
  display: grid;
  gap: 18px;
}

.messages-lock {
  min-height: 60vh;
  display: grid;
  place-items: center;
}

.messages-lock__card {
  width: min(560px, 100%);
  padding: 34px;
  border-radius: 28px;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: var(--shadow);
  text-align: center;
}

.messages-lock__card h1 {
  margin: 16px 0 10px;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
}

.messages-lock__card p {
  margin: 0 0 24px;
  color: var(--muted);
  line-height: 1.8;
}

.messages-hero,
.messages-layout {
  display: grid;
  gap: 18px;
}

.messages-hero {
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  align-items: stretch;
}

.messages-hero > div,
.conversation-card,
.thread-list,
.chat-panel {
  border-radius: 28px;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: var(--shadow);
}

.messages-hero > div:first-child {
  padding: 34px;
  background: linear-gradient(135deg, rgba(23, 50, 77, 0.96), rgba(180, 95, 52, 0.76));
  color: #fff;
}

.eyebrow,
.section-title {
  display: inline-flex;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: inherit;
}

.messages-hero h1 {
  font-size: clamp(2rem, 3vw, 3.4rem);
  line-height: 1.08;
  margin: 18px 0 12px;
}

.messages-hero p {
  max-width: 58ch;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.86);
}

.conversation-card {
  overflow: hidden;
}

.conversation-card__media {
  height: 100%;
  min-height: 240px;
}

.conversation-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.conversation-card__meta {
  padding: 16px 18px 18px;
  display: grid;
  gap: 4px;
}

.conversation-card__meta span {
  color: var(--muted);
}

.messages-layout {
  grid-template-columns: 320px minmax(0, 1fr);
}

.thread-list,
.chat-panel {
  padding: 18px;
}

.thread-list {
  display: grid;
  gap: 12px;
  align-content: start;
}

.thread-item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(17, 24, 39, 0.06);
  cursor: pointer;
}

.thread-item.active {
  border-color: rgba(180, 95, 52, 0.35);
  background: rgba(180, 95, 52, 0.08);
}

.thread-item img {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
}

.thread-item strong,
.thread-item p {
  display: block;
  margin: 0;
}

.thread-item p {
  color: var(--muted);
  margin-top: 4px;
}

.chat-panel {
  display: grid;
  gap: 16px;
}

.chat-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.chat-panel__header h2 {
  margin: 12px 0 0;
}

.chat-panel__users {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(23, 50, 77, 0.06);
  color: var(--secondary);
}

.chat-stream {
  display: grid;
  gap: 12px;
  max-height: 520px;
  overflow: auto;
  padding-right: 4px;
}

.bubble {
  max-width: 82%;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.bubble.inbound {
  justify-self: start;
  background: rgba(255, 255, 255, 0.86);
}

.bubble.outbound {
  justify-self: end;
  background: linear-gradient(135deg, rgba(180, 95, 52, 0.16), rgba(242, 215, 191, 0.42));
}

.bubble__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 0.88rem;
}

.bubble p {
  margin: 10px 0 0;
  line-height: 1.8;
}

.composer {
  display: grid;
  gap: 12px;
  padding-top: 8px;
}

.composer textarea {
  min-height: 140px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.84);
}

.composer__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--primary), #d78145);
  color: #fff;
  font-weight: 700;
}

@media (max-width: 980px) {
  .messages-hero,
  .messages-layout {
    grid-template-columns: 1fr;
  }

  .bubble {
    max-width: 100%;
  }
}
</style>
