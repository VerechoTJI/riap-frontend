<template>
  <main class="chat-panel">
    <div class="chat-panel__header">
      <div>
        <button class="mobile-back-btn" @click="$emit('back')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          返回列表
        </button>
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
      :currentUserId="currentUserId"
    />

    <ChatComposer @send="text => $emit('send', text)" />
  </main>
</template>

<script>
import ChatStream from "./ChatStream.vue";
import ChatComposer from "./ChatComposer.vue";

export default {
  name: "ChatPanel",
  components: {
    ChatStream,
    ChatComposer,
  },
  props: {
    currentChatRoom: {
      type: Object,
      required: true,
    },
    messages: {
      type: Array,
      default: () => [],
    },
    currentUserId: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ["send", "back"],
};
</script>

<style scoped>
.chat-panel {
  padding: 18px;
  display: grid;
  gap: 16px;
  border-radius: 28px;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: var(--shadow);
  height: 100%;
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

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: inherit;
  font-size: 0.85rem;
}

.chat-panel__header h2 {
  margin: 12px 0 0;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
}

.chat-panel__users {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(23, 50, 77, 0.06);
  color: var(--secondary);
  font-size: 0.9rem;
}

.mobile-back-btn {
  display: none;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--primary-dark);
  font-weight: 600;
  padding: 8px 12px 8px 0;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 1rem;
}

@media (max-width: 980px) {
  .mobile-back-btn {
    display: flex;
  }
}
</style>
