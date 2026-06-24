<template>
  <section class="edit-listing-page">
    <router-link class="back-link" to="/landlord">← 返回房東管理</router-link>

    <div v-if="!loaded" class="loading-card">載入房源中...</div>

    <div v-else class="form-card">
      <h1>編輯房源</h1>

      <label class="field">
        <span>標題 <span class="required">*</span></span>
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
        <span>月租 (NT$) <span class="required">*</span></span>
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
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="number" v-model.number="form.floor" placeholder="所在樓層" />
          <span>/</span>
          <input type="number" v-model.number="form.totalFloors" placeholder="總樓層" />
        </div>
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
import { ListingApiService } from "../lib/ListingApiService";
import { readCurrentUser } from "../lib/ui";

export default {
  data() {
    return {
      id: this.$route.params.id || null,
      form: {
        title: "",
        city: "",
        address: "",
        rent: 0,
        deposit: 0,
        managementFee: 0,
        size: 0,
        layout: "",
        floor: null,
        totalFloors: null,
        availableFrom: "",
        image: "",
        description: "",
        featuresText: "",
      },
      loaded: false,
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      // In a real app, we would fetch by ID: const item = await ListingApiService.getById(this.id)
      // Since ListingApiService doesn't have getById, we can search in published or landlord listings
      // But we can also just fetch all published to find it
      const all = await ListingApiService.getAllPublished();
      const item = all.find((l) => l.id == this.id);
      
      if (!item) {
        // Might be pending or private, try getting landlord's listings
        const user = readCurrentUser();
        if (user && user.id) {
           const landlordListings = await ListingApiService.getByLandlord(user.id);
           const ownItem = landlordListings.find(l => l.id == this.id);
           if (ownItem) {
               this.fillForm(ownItem);
               this.loaded = true;
               return;
           }
        }
        alert("找不到房源");
        this.$router.push("/landlord");
        return;
      }

      this.fillForm(item);
      this.loaded = true;
    },
    fillForm(item) {
      this.form.title = item.title;
      this.form.city = item.city;
      this.form.address = item.address;
      this.form.rent = item.rent || (item.feeDisclosure ? item.feeDisclosure.rent : 0);
      this.form.deposit = item.deposit || (item.feeDisclosure ? item.feeDisclosure.deposit : 0);
      this.form.managementFee = item.managementFee || (item.feeDisclosure ? item.feeDisclosure.managementFee : 0);
      this.form.size = item.size || item.area;
      this.form.layout = item.layout;
      this.form.floor = item.floor;
      this.form.totalFloors = item.totalFloors;
      this.form.availableFrom = item.availableFrom;
      this.form.image = item.image || item.imageUrl;
      this.form.description = item.description;
      this.form.featuresText = (item.features || []).join(", ");
    },
    async save() {
      if (!this.form.title || !this.form.rent) {
        return alert("請至少填寫標題與租金");
      }
      
      const current = readCurrentUser() || { username: "unknown", id: "00000000-0000-0000-0000-000000000000" };

      const updated = {
        title: this.form.title,
        city: this.form.city,
        address: this.form.address,
        area: Number(this.form.size),
        size: Number(this.form.size),
        layout: this.form.layout,
        floor: Number(this.form.floor),
        totalFloors: Number(this.form.totalFloors),
        availableFrom: this.form.availableFrom,
        image: this.form.image || undefined,
        imageUrl: this.form.image || undefined,
        description: this.form.description,
        features: (this.form.featuresText || "").split(",").map((s) => s.trim()).filter(Boolean),
        propertyType: "SUITE", // Hardcoded for prototype editing
        landlordId: current.id,
        feeDisclosure: {
            rent: this.form.rent,
            deposit: this.form.deposit,
            managementFee: this.form.managementFee,
            waterElectricityRules: "依台水台電" // hardcoded if missing
        }
      };

      try {
        await ListingApiService.updateListing(this.id, updated);
        alert("儲存成功，房源已重新送審！");
        this.$router.push("/landlord");
      } catch (e) {
        console.error(e);
        alert(e.message || "儲存失敗");
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
.field > span { display:block; font-weight:600; margin-bottom:6px }
.required { color: #e05c5c; margin-left: 4px; display: inline; }
.field input, .field textarea { width:100%; padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.08) }
.action-row { display:flex; gap:12px; margin-top:12px }
</style>
