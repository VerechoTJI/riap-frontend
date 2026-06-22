<template>
  <div class="composer">
    <textarea
      v-model="text"
      placeholder="輸入訊息..."
      @keydown.enter.exact.prevent="send"
    ></textarea>
    <div class="composer__actions">
      <span :class="{ 'text-danger': text.length > 240 }">{{ text.length }}/240</span>
      <button class="primary-button" @click="send" :disabled="!text.trim() || text.length > 240">傳送訊息</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatComposer",
  data() {
    return {
      text: "",
    };
  },
  emits: ["send"],
  methods: {
    send() {
      if (!this.text.trim() || this.text.length > 240) return;
      this.$emit("send", this.text.trim());
      this.text = "";
    },
  },
};
</script>

<style scoped>
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
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-danger {
  color: var(--danger, #ef4444);
}
</style>
