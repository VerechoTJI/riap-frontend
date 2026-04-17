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
import listings from '/public/fixtures/listings.json'
export default {
  data(){ return { listing:null } },
  created(){
    const id = Number(this.$route.params.id)
    this.listing = listings.find(l=>l.id===id) || {title:'找不到',description:'',rent:0,city:''}
  }
}
</script>
