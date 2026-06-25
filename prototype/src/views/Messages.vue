<template>
  <section class="messages-page">
    <div v-if="!user" class="messages-lock">
      <div class="messages-lock__card">
        <span class="eyebrow">會員專屬</span>
        <h1>登入以查看訊息</h1>
        <p>登入後即可與房東或房客進行對話，隨時掌握租屋動態。</p>
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
            <span class="eyebrow">訊息中心</span>
            <h1>隨時與房東或房客保持聯繫</h1>
            <p>
              在這裡查看所有的對話紀錄，即時回覆訊息，並追蹤每一筆房源的討論進度。
            </p>
          </div>

          <ConversationListingCard
            :listing="activeListing"
            :title="currentListingTitle"
            :city="currentListingCity"
            :image="listingHero"
          />
        </div>

        <div class="messages-layout">
          <div class="messages-sidebar">
            <ChatRoomList
              :chatRooms="chatRooms"
              :activeChatRoomId="activeChatRoomId"
              @select="selectRoom"
            />

            <div class="chat-room-actions" v-if="chatRooms.length > 0">
              <button class="danger-button" @click="clearAllRooms">清除所有聊天室</button>
            </div>
          </div>

          <main class="chat-panel" v-if="activeRoom">
            <div class="chat-panel__header">
              <div>
                <div class="chat-panel__status">
                  <span class="eyebrow">{{ currentChatRoom.statusLabel }}</span>
                </div>
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

<style scoped>
.messages-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chat-room-actions {
  margin-top: 1rem;
  padding: 0 4px;
  display: flex;
  justify-content: center;
}
.danger-button {
  background-color: transparent;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  padding: 4px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.danger-button:hover {
  background-color: #ff4d4f;
  color: white;
}
</style>

<script>
import { getUsers } from "../lib/fixtures";
import { ListingApiService } from "../lib/ListingApiService";
import { listingImage, readCurrentUser, formatTwd } from "../lib/ui";
import ChatRoomList from "../components/chat/ChatRoomList.vue";
import ChatStream from "../components/chat/ChatStream.vue";
import ChatComposer from "../components/chat/ChatComposer.vue";
import ConversationListingCard from "../components/chat/ConversationListingCard.vue";

const API_BASE = "http://localhost:8080/api/chat";
const WS_BASE = "ws://localhost:8080/ws/chat/connect";

export default {
  components: {
    ChatRoomList,
    ChatStream,
    ChatComposer,
    ConversationListingCard
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
      const user = this.user || { displayName: null, username: null };
      return {
        title: this.activeRoom?.title || "租屋對話",
        from: user.displayName || user.username || "我",
        to: this.activeRoom?.otherUserName || "對方",
        statusLabel: "目前詢問",
      };
    },
    currentListingTitle() {
      if (this.activeRoom?.title) return this.activeRoom.title;
      return this.activeListing ? this.activeListing.title : "租屋對話";
    },
    currentListingCity() {
      if (this.activeRoom?.city) return this.activeRoom.city;
      return this.activeListing ? this.activeListing.city : "尚未選擇房源";
    },
    listingHero() {
      return this.activeRoom?.image || listingImage(this.activeListing || { id: 1 });
    },
    activeListing() {
      if (!this.listings.length) return null;
      if (!this.activeRoom?.listingId) return this.listings[0];
      return this.listings.find((l) => String(l.id) === String(this.activeRoom.listingId)) || this.listings[0];
    },
  },
  async created() {
    this.user = readCurrentUser();
    if (!this.user) return;
    try {
      const published = await ListingApiService.getAllPublished();
      const pending = await ListingApiService.getPending();
      this.listings = [...published, ...pending];
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
    formatTwd,
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
          return {
            id: room.id,
            listingId: room.listingId,
            tenantId: room.tenantId,
            landlordId: room.landlordId,
            otherUserName: room.otherUserName || "對方",
            title: room.listingTitle || "租屋對話",
            city: room.listingCity || "",
            image: room.listingImageUrl || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80",
            preview: room.lastMessage || "尚未有對話",
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
    
    async clearAllRooms() {
      if (!confirm("確定要清除所有聊天室與訊息嗎？此動作無法復原。")) return;
      
      try {
        const res = await fetch(`${API_BASE}/rooms`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${this.user.token}` }
        });
        
        if (!res.ok) throw new Error("Delete failed");
        
        // Clear local state
        this.chatRooms = [];
        this.activeChatRoomId = null;
        this.messages = [];
        
        window.dispatchEvent(new Event("riap-clear-unread"));
        alert("聊天室已全部清除");
        
        // redirect to clear route query
        this.$router.push("/messages");
      } catch (e) {
        console.error("Failed to clear rooms", e);
        alert("清除失敗");
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

.messages-hero > div:first-child,
.chat-panel {
  border-radius: 28px;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: var(--shadow);
}

.messages-hero > div:first-child {
  padding: 16px 24px;
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
  font-size: clamp(1.4rem, 2vw, 2rem);
  line-height: 1.15;
  margin: 10px 0 8px;
}

.messages-hero p {
  max-width: 58ch;
  line-height: 1.5;
  font-size: 0.9rem;
  margin-bottom: 0;
  color: rgba(255, 255, 255, 0.86);
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
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.chat-panel__status {
  display: flex;
  align-items: center;
  gap: 12px;
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
