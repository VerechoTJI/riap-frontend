<template>
  <section class="edit-listing-page">
    <router-link class="back-link" to="/landlord">← 返回房東管理</router-link>

    <div v-if="!loaded" class="loading-card">載入房源中...</div>

    <div v-else class="form-card">
      <h1>編輯房源</h1>

      <label class="field">
        <span>標題</span>
        <input v-model="form.title" />
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
        <input v-model="form.featuresText" />
      </label>

      <div class="action-row">
        <button class="primary-button" @click="save">儲存變更</button>
        <button class="ghost-button" @click="$router.back()">取消</button>
      </div>
    </div>
  </section>
</template>

<script>
import { getListings, updateListing } from "../lib/fixtures";
import { readCurrentUser } from "../lib/ui";

export default {
  data() {
    return {
      id: Number(this.$route.params.id) || null,
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
      loaded: false,
    };
  },
  async created() {
    try {
      const listings = await getListings();
      const item = listings.find((l) => Number(l.id) === Number(this.id));
      if (!item) {
        alert("找不到該房源");
        this.$router.push("/landlord");
        return;
      }
      this.form = {
        title: item.title || "",
        city: item.city || "",
        address: item.address || "",
        rent: item.rent || 0,
        deposit: item.deposit || 0,
        managementFee: item.managementFee || 0,
        size: item.size || 0,
        layout: item.layout || "",
        floor: item.floor || "",
        availableFrom: item.availableFrom || "",
        image: item.image || "",
        description: item.description || "",
        featuresText: (item.features || []).join(","),
      };
      this.loaded = true;
    } catch (e) {
      console.error(e);
      alert("載入失敗");
      this.$router.push("/landlord");
    }
  },
  methods: {
    async save() {
      if (!this.form.title || !this.form.rent) return alert("請填寫標題與月租");
      const user = readCurrentUser() || { displayName: "未知房東" };
      const updated = {
        id: this.id,
        title: this.form.title,
        city: this.form.city,
        address: this.form.address,
        rent: Number(this.form.rent || 0),
        deposit: Number(this.form.deposit || 0),
        managementFee: Number(this.form.managementFee || 0),
        size: Number(this.form.size || 0),
        layout: this.form.layout,
        floor: this.form.floor,
        availableFrom: this.form.availableFrom,
        image: this.form.image || undefined,
        description: this.form.description,
        features: (this.form.featuresText || "").split(/\s*,\s*/).filter(Boolean),
        landlord: user.displayName || user.username,
      };

      try {
        await updateListing(updated);
        this.$router.push("/landlord");
      } catch (e) {
        console.error(e);
        alert("儲存失敗");
      }
    },
  },
};
</script>

<style scoped>
.edit-listing-page { display: grid; gap: 16px; }
.loading-card { padding: 20px; border-radius: 18px; background: var(--card); }
.form-card { padding: 20px; border-radius: 18px; background: var(--card); }
.field { display:block; margin:10px 0 }
.field span { display:block; font-weight:600; margin-bottom:6px }
.field input, .field textarea { width:100%; padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.08) }
.action-row { display:flex; gap:12px; margin-top:12px }
</style>
