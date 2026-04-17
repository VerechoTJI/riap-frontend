<template>
  <div style="padding:16px">
    <h1>{{listing.title}}</h1>
    <div>{{listing.city}} · 月租 {{listing.rent}} 元</div>
    <p>{{listing.description}}</p>
    <div style="margin-top:12px">
      <router-link to="/">回到列表</router-link>
    </div>
  </div>
</template>

<script>
import { getListings } from '../lib/fixtures'
export default {
  data(){ return { listing:null } },
  async created(){
    try{
      const id = Number(this.$route.params.id)
      const all = await getListings()
      this.listing = all.find(l=>l.id===id) || {title:'找不到',description:'',rent:0,city:''}
    }catch(e){ console.error(e); this.listing = {title:'錯誤',description:'',rent:0,city:''} }
  }
}
</script>
