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
      <div v-if="chatRooms.length === 0" class="messages-lock">
        <div class="messages-lock__card">
          <span class="eyebrow">尚無對話</span>
          <h1>目前沒有聊天紀錄</h1>
          <p>您還沒有與任何房東或房客進行過對話，趕快去探索有興趣的房源吧！</p>
          <router-link class="primary-button" to="/">探索房源</router-link>
        </div>
      </div>

      <template v-else>
        <div class="messages-hero">
          <div>
            <span class="eyebrow">即時溝通</span>
            <h1>把詢問、回覆與房源脈絡整理成一條清晰的對話。</h1>
            <p>
              訊息內容儲存在記憶體，用於展示 tenant / landlord 的互動流程。
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
          <ChatRoomList
            :chatRooms="chatRooms"
            :activeChatRoomId="activeChatRoomId"
            @select="selectRoom"
          />

          <main class="chat-panel" v-if="activeRoom">
            <div class="chat-panel__header">
              <div>
                <span class="eyebrow">{{ currentChatRoom.statusLabel }}</span>
                <h2>{{ currentChatRoom.title }}</h2>
              </div>
              <div class="chat-panel__users">
                <span>{{ currentChatRoom.from }}</span>
                <span>→</span>
                <span>{{ currentChatRoom.to }}</span>
              </div>
            </div>

            <ChatStream
              :messages="messages"
              :currentUserId="user.id"
            />

            <ChatComposer @send="sendMessage" />
          </main>

          <main class="chat-panel chat-panel--empty" v-else>
            <div class="empty-selection">
              <span class="empty-icon">💬</span>
              <p>請從左側列表選擇對話</p>
            </div>
          </main>
        </div>
      </template>
    </template>
  </section>
</template>

<script>
import { getListings, getUsers } from "../lib/fixtures";
import { listingImage, readCurrentUser } from "../lib/ui";
import ChatRoomList from "../components/chat/ChatRoomList.vue";
import ChatStream from "../components/chat/ChatStream.vue";
import ChatComposer from "../components/chat/ChatComposer.vue";

const API_BASE = "http://localhost:8080/api/chat";
const WS_BASE = "ws://localhost:8080/ws/chat/connect";

export default {
  components: {
    ChatRoomList,
    ChatStream,
    ChatComposer
  },
  data() {
    return {
      messages: [],
      chatRooms: [],
      activeChatRoomId: null,
      listings: [],
      users: [],
      user: readCurrentUser(),
      ws: null
    };
  },
  computed: {
    activeRoom() {
      return this.chatRooms.find((room) => room.id === this.activeChatRoomId) || null;
    },
    currentChatRoom() {
      const listing = this.listings.find((item) => String(item.id) === String(this.activeRoom?.listingId)) || this.listings[0] || {};
      const user = this.user || { displayName: null, username: null, role: null };

      let fromName = user.displayName || user.username || "我";
      let toName = "對方";
      if (this.activeRoom) {
         const otherUserId = user.role === "landlord" ? this.activeRoom.tenantId : this.activeRoom.landlordId;
         const otherUser = this.users.find(u => String(u.id) === String(otherUserId));
         if (otherUser) {
             toName = otherUser.displayName || otherUser.username;
         }
      }

      return {
        title: listing.title || "租屋對話",
        from: user.displayName || user.username || "我",
        to: listing.landlord || "房東",
        statusLabel: "目前詢問",
      };
    },
    currentListingTitle() {
      return this.activeRoom?.title || "租屋對話";
    },
    currentListingCity() {
      return this.activeRoom?.city || "尚未選擇房源";
    },
    listingHero() {
      return this.activeRoom?.image || listingImage(this.listings[0] || { id: 1 });
    },
  },
  async created() {
    this.user = readCurrentUser();
    if (!this.user) return;
    try {
      this.listings = await getListings();
      this.users = await getUsers();
      await this.fetchRooms();
      this.activeChatRoomId = this.$route.query.roomId || null;
      
      if (this.activeChatRoomId) {
        await this.fetchHistory(this.activeChatRoomId);
      }
      
      window.addEventListener("riap-ws-message", this.handleWsMessage);
    } catch (error) {
      console.error("Initialization error:", error);
    }
  },

  beforeUnmount() {
    window.removeEventListener("riap-ws-message", this.handleWsMessage);
  },
  methods: {
    selectRoom(roomId) {
      this.activeChatRoomId = roomId;
      // Also update URL so refresh works
      this.$router.replace({ query: { ...this.$route.query, roomId } });
    },
    async fetchRooms() {
      try {
        const res = await fetch(`${API_BASE}/rooms`, {
          headers: { "Authorization": `Bearer ${this.user.token}` },
          cache: "no-store"
        });
        const rooms = await res.json();
        
        this.chatRooms = rooms.map(room => {
          const listing = this.listings.find(l => String(l.id) === String(room.listingId)) || {};
          
          return {
            id: room.id,
            listingId: room.listingId,
            tenantId: room.tenantId,
            landlordId: room.landlordId,
            otherUserName: room.otherUserName || "對方",
            title: room.listingTitle || "租屋對話",
            city: listing.city || "",
            image: listingImage(listing),
            preview: "點擊查看對話",
            hasUnread: room.hasUnread || false
          };
        });
      } catch (e) {
        console.error("Failed to fetch rooms", e);
      }
    },
    
    async fetchHistory(roomId) {
      if (!roomId) return;
      try {
        const res = await fetch(`${API_BASE}/history/${roomId}`, {
          headers: { "Authorization": `Bearer ${this.user.token}` },
          cache: "no-store"
        });
        const msgs = await res.json();
        
        // Map backend message format to frontend format
        this.messages = msgs.map(m => {
          const isMe = String(m.senderUserId) === String(this.user.id);
          let fromName = "我";
          if (!isMe) {
            const senderUser = this.users.find(u => String(u.id) === String(m.senderUserId));
            fromName = senderUser ? (senderUser.displayName || senderUser.username) : "對方";
          }
          return {
            id: m.id,
            body: m.content,
            senderUserId: m.senderUserId,
            from: fromName,
            createdAt: m.sentAt,
            isRead: m.isRead !== undefined ? m.isRead : m.read
          };
        });
        
        // Clear unread dot for this room
        const room = this.chatRooms.find(r => r.id === roomId);
        if (room) {
          room.hasUnread = false;
        }

        // Only dispatch global clear event if there are no other unread rooms
        const hasAnyUnread = this.chatRooms.some(r => r.hasUnread);
        if (!hasAnyUnread) {
          window.dispatchEvent(new Event("riap-clear-unread"));
        }

        // Mark as read
        await fetch(`${API_BASE}/read/${roomId}`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${this.user.token}` }
        });
      } catch (e) {
        console.error("Failed to fetch history", e);
      }
    },

    async sendMessage(text) {
      if (!this.activeChatRoomId) return alert("請先選擇對話或房源");
      
      try {
        await fetch(`${API_BASE}/sendMessage`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${this.user.token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chatRoomId: this.activeChatRoomId,
            content: text
          })
        });
        
        // Update local preview immediately
        const room = this.chatRooms.find(r => r.id === this.activeChatRoomId);
        if (room) room.preview = `我: ${text}`;

      } catch (e) {
        console.error(e);
        alert("傳送失敗，請稍後再試");
      }
    },
    
    handleWsMessage(event) {
      try {
        const data = event.detail;
        
        if (data.connectionStatus) return; // ignore connection ack
        
        if (data.readBy) {
          // Read receipt received from the other party
          if (data.chatRoomId === this.activeChatRoomId && String(data.readBy) !== String(this.user.id)) {
            this.messages.forEach(m => m.isRead = true);
          }
          return;
        }
        
        // New message received
        if (data.chatRoomId === this.activeChatRoomId) {
          this.fetchHistory(this.activeChatRoomId);
        } else {
          // Notification for other room
          const room = this.chatRooms.find(r => r.id === data.chatRoomId);
          if (room) {
            room.preview = "新訊息: " + data.content;
            room.hasUnread = true;
          } else {
             this.fetchRooms();
          }
        }
      } catch (e) {
        console.error("WS message error", e);
      }
    },
  },
  watch: {
    activeChatRoomId(newId) {
      if (newId) {
        this.fetchHistory(newId);
      }
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

.eyebrow {
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

.chat-panel {
  padding: 18px;
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

.chat-panel--empty {
  display: grid;
  place-items: center;
  min-height: 400px;
}

.empty-selection {
  text-align: center;
  color: var(--muted);
}

.empty-selection .empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.6;
}

@media (max-width: 980px) {
  .messages-hero,
  .messages-layout {
    grid-template-columns: 1fr;
  }
}
</style>
