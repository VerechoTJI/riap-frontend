<template>
  <div style="padding:16px">
    <h1>房源列表</h1>
    <div style="margin-bottom:8px">
      <input v-model="q" placeholder="關鍵字搜尋" />
      <select v-model="city">
        <option value="">全部城市</option>
        <option v-for="c in cities" :key="c">{{c}}</option>
      </select>
      <button @click="clearFilters">清除</button>
    </div>

    <div v-for="item in paged" :key="item.id" style="border:1px solid #ddd;padding:8px;margin-bottom:8px">
      <router-link :to="`/listing/${item.id}`"><h2>{{item.title}}</h2></router-link>
      <div>{{item.city}} · 月租 {{item.rent}} 元</div>
    </div>

    <div style="margin-top:12px">
      <button @click="prev" :disabled="page===1">上一頁</button>
      <span>第 {{page}} 頁</span>
      <button @click="next" :disabled="page>=pages">下一頁</button>
    </div>
  </div>
</template>

<script>
import { getListings } from '../lib/fixtures'
export default {
  data(){
    return { q:'', city:'', page:1, per:5, all:[] }
  },
  async created(){
    try{ this.all = await getListings() }catch(e){ console.error(e) }
  },
  computed:{
    cities(){
      return Array.from(new Set(this.all.map(l=>l.city)))
    },
    filtered(){
      return this.all.filter(l=>{
        if(this.city && l.city!==this.city) return false
        if(this.q){
          const s = (l.title+' '+l.description).toLowerCase()
          return s.includes(this.q.toLowerCase())
        }
        return true
      }).filter(l=>l.status==='published')
    },
    pages(){ return Math.max(1, Math.ceil(this.filtered.length/this.per)) },
    paged(){ return this.filtered.slice((this.page-1)*this.per, this.page*this.per) }
  },
  methods:{
    prev(){ if(this.page>1) this.page-- },
    next(){ if(this.page<this.pages) this.page++ },
    clearFilters(){ this.q=''; this.city=''; this.page=1 }
  }
}
</script>
