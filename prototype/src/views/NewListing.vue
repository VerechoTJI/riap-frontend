<template>
  <section class="new-listing-page">
    <router-link class="back-link" to="/landlord">← 返回房東管理</router-link>

    <div class="form-card">
      <h1>新增房源</h1>

      <label class="field">
        <span>標題 <span class="required">*</span></span>
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
        <span>房源類型</span>
        <select v-model="form.propertyType">
          <option value="SUITE">分租套房</option>
          <option value="STUDIO">獨立套房</option>
          <option value="APARTMENT">公寓</option>
          <option value="WHOLE_FLOOR">整層住家</option>
          <option value="OTHER">其他</option>
        </select>
      </label>

      <label class="field">
        <span>月租 (NT$) <span class="required">*</span></span>
        <input type="number" v-model.number="form.rent" />
      </label>

      <label class="field">
        <span>押金 (NT$) <span class="required">*</span></span>
        <input type="number" v-model.number="form.deposit" />
      </label>

      <label class="field">
        <span>管理費 (NT$) <span class="required">*</span></span>
        <input type="number" v-model.number="form.managementFee" />
      </label>

      <label class="field">
        <span>水電費計算基準 <span class="required">*</span></span>
        <input v-model="form.waterElectricityRules" placeholder="例如：台水台電、一度5元" />
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
import { ListingApiService } from "../lib/ListingApiService";
import { readCurrentUser } from "../lib/ui";

export default {
  data() {
    return {
      form: {
        title: "",
        city: "",
        address: "",
        rent: null,
        deposit: null,
        managementFee: null,
        waterElectricityRules: "",
        size: null,
        layout: "",
        floor: null,
        totalFloors: null,
        availableFrom: "",
        image: "",
        description: "",
        featuresText: "",
        propertyType: "SUITE"
      },
    };
  },
  methods: {
    async submit() {
      // Robust client-side validation (AC-LMS-01)
      if (!this.form.title || !this.form.rent || !this.form.deposit || 
          !this.form.managementFee || !this.form.waterElectricityRules) {
        return alert("請填寫標題與所有必填費用欄位（租金、押金、管理費、水電規則）");
      }

      const current = readCurrentUser() || { username: "unknown", id: "00000000-0000-0000-0000-000000000000" };
      
      const listingEntity = {
        title: this.form.title,
        description: this.form.description,
        area: Number(this.form.size),
        size: Number(this.form.size),
        city: this.form.city,
        address: this.form.address,
        layout: this.form.layout,
        floor: Number(this.form.floor),
        totalFloors: Number(this.form.totalFloors),
        availableFrom: this.form.availableFrom,
        image: this.form.image || undefined,
        features: (this.form.featuresText || "").split(/\s*,\s*/).map(s => s.trim()).filter(Boolean),
        propertyType: this.form.propertyType,
        landlordId: current.id,
        landlord: current.displayName || current.username,
        feeDisclosure: {
          rent: this.form.rent,
          deposit: this.form.deposit,
          managementFee: this.form.managementFee,
          waterElectricityRules: this.form.waterElectricityRules
        }
      };

      try {
        await ListingApiService.publish(listingEntity);
        alert("刊登成功，請靜候管理員審核");
        this.$router.push("/landlord");
      } catch (e) {
        console.error(e);
        alert(e.message || "儲存失敗，請稍後再試");
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
.field > span { display: block; font-weight: 600; margin-bottom: 6px; }
.required { color: #e05c5c; margin-left: 4px; display: inline; }
.field input, .field textarea { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); }
.action-row { display:flex; gap:12px; margin-top:12px; }
</style>
