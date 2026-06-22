<template>
  <div class="chat-stream" ref="chatStream">
    <article
      v-for="message in messages"
      :key="message.id"
      class="bubble"
      :class="isFromCurrentUser(message) ? 'outbound' : 'inbound'"
    >
      <div class="bubble__meta">
        <strong>{{ message.from }}</strong>
        <span>
          {{ formatDate(message.createdAt) }}
          <span v-if="isFromCurrentUser(message) && message.isRead" class="read-status">已讀</span>
        </span>
      </div>
      <p>{{ message.body }}</p>
    </article>
  </div>
</template>

<script>
import { formatDate } from "../../lib/ui";

export default {
  name: "ChatStream",
  props: {
    messages: {
      type: Array,
      required: true,
    },
    currentUserId: {
      type: [String, Number],
      required: true,
    },
  },
  methods: {
    formatDate,
    isFromCurrentUser(message) {
      return message.senderUserId === String(this.currentUserId);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatStream;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    },
  },
  watch: {
    messages: {
      deep: true,
      handler() {
        this.scrollToBottom();
      },
    },
  },
};
</script>

<style scoped>
.chat-stream {
  display: flex;
  flex-direction: column;
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
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.86);
}

.bubble.outbound {
  align-self: flex-end;
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
  white-space: pre-wrap;
}

.read-status {
  margin-left: 6px;
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 600;
}
</style>
