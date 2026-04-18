<template>
  <section class="new-listing-page">
    <router-link class="back-link" to="/landlord">← 返回房東管理</router-link>

    <div class="form-card">
      <h1>新增房源</h1>

      <label class="field">
        <span>標題</span>
        <input v-model="form.title" placeholder="例如：近捷運高質感套房" />
      </label>

      <label class="field">
        <span>城市</span>
        <input v-model="form.city" />
      </label>

      <label class="field">
        <span>地址</span>
        <input v-model="form.address" />
      </label>

      <label class="field">
        <span>月租 (NT$)</span>
        <input type="number" v-model.number="form.rent" />
      </label>

      <label class="field">
        <span>押金 (NT$)</span>
        <input type="number" v-model.number="form.deposit" />
      </label>

      <label class="field">
        <span>管理費 (NT$)</span>
        <input type="number" v-model.number="form.managementFee" />
      </label>

      <label class="field">
        <span>坪數</span>
        <input type="number" v-model.number="form.size" />
      </label>

      <label class="field">
        <span>格局</span>
        <input v-model="form.layout" />
      </label>

      <label class="field">
        <span>樓層</span>
        <input v-model="form.floor" />
      </label>

      <label class="field">
        <span>可入住日</span>
        <input v-model="form.availableFrom" placeholder="YYYY-MM-DD" />
      </label>

      <label class="field">
        <span>圖片 URL</span>
        <input v-model="form.image" placeholder="(可選) 圖片網址" />
      </label>

      <label class="field">
        <span>房源描述</span>
        <textarea v-model="form.description"></textarea>
      </label>

      <label class="field">
        <span>特色 (以逗號分隔)</span>
        <input v-model="form.featuresText" placeholder="例如：可開伙,近捷運" />
      </label>

      <div class="action-row">
        <button class="primary-button" @click="submit">送出刊登</button>
        <button class="ghost-button" @click="$router.back()">取消</button>
      </div>
    </div>
  </section>
</template>

<script>
import { readCurrentUser } from "../lib/ui";
import { addListing } from "../lib/fixtures";

export default {
  data() {
    return {
      form: {
        title: "",
        city: "",
        address: "",
        rent: 0,
        deposit: 0,
        managementFee: 0,
        size: 0,
        layout: "",
        floor: "",
        availableFrom: "",
        image: "",
        description: "",
        featuresText: "",
      },
    };
  },
  methods: {
    async submit() {
      if (!this.form.title || !this.form.rent) {
        return alert("請填寫標題與月租");
      }

      const current = readCurrentUser() || { username: "unknown", displayName: "未知房東" };
      const newListing = {
        id: Date.now(),
        title: this.form.title,
        description: this.form.description,
        rent: Number(this.form.rent || 0),
        city: this.form.city || "",
        address: this.form.address || "",
        deposit: Number(this.form.deposit || 0),
        managementFee: Number(this.form.managementFee || 0),
        size: Number(this.form.size || 0),
        layout: this.form.layout || "",
        floor: this.form.floor || "",
        availableFrom: this.form.availableFrom || "",
        landlord: current.displayName || current.username,
        status: "pending",
        image: this.form.image || undefined,
        features: (this.form.featuresText || "").split(/\s*,\s*/).filter(Boolean),
        postedAt: new Date().toISOString(),
      };

      try {
        await addListing(newListing);
        this.$router.push("/landlord");
      } catch (e) {
        console.error(e);
        alert("儲存失敗，請稍後再試");
      }
    },
  },
};
</script>

<style scoped>
.new-listing-page {
  display: grid;
  gap: 16px;
}
.form-card {
  padding: 20px;
  border-radius: 18px;
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.6);
}
.field { display: block; margin: 10px 0; }
.field span { display: block; font-weight: 600; margin-bottom: 6px; }
.field input, .field textarea { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); }
.action-row { display:flex; gap:12px; margin-top:12px; }
</style>
