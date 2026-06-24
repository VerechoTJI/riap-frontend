<template>
  <aside class="thread-list">
    <div class="section-title">對話列表</div>
    <div
      v-for="room in chatRooms"
      :key="room.id"
      class="thread-item"
      :class="{ active: room.id === activeChatRoomId }"
      @click="$emit('select', room.id)"
    >
      <img :src="room.image" :alt="room.title" />
      <div>
        <strong>
          <span v-if="room.hasUnread" class="unread-dot"></span>
          {{ room.otherUserName }}
        </strong>
        <p class="listing-ref">{{ room.title }}</p>
        <p>{{ room.preview }}</p>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: "ChatRoomList",
  props: {
    chatRooms: {
      type: Array,
      required: true,
    },
    activeChatRoomId: {
      type: String,
      default: null,
    },
  },
  emits: ["select"],
};
</script>

<style scoped>
.thread-list {
  display: grid;
  gap: 12px;
  align-content: start;
}

.section-title {
  display: inline-flex;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: inherit;
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

.listing-ref {
  font-size: 0.85em;
  color: var(--primary);
  margin-top: 2px !important;
  margin-bottom: 2px !important;
}

.unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--danger, #ef4444);
  border-radius: 50%;
  margin-right: 6px;
}
</style>
