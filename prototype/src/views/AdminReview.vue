<template>
  <div style="padding:16px">
    <h1>管理員審核（僅前端）</h1>
    <div v-for="l in pending" :key="l.id" style="border:1px solid #f0ad4e;padding:8px;margin-top:8px">
      <h3>{{l.title}}</h3>
      <div>{{l.description}}</div>
      <div style="margin-top:8px">
        <button @click="publish(l)">發布</button>
        <button @click="returnItem(l)">退回</button>
      </div>
    </div>
  </div>
</template>

<script>
import listings from '/public/fixtures/listings.json'
export default {
  data(){ return { all: [...listings] } },
  computed:{ pending(){ return this.all.filter(l=>l.status==='pending') } },
  methods:{
    publish(l){ l.status='published' },
    returnItem(l){ const r = prompt('請輸入退回原因'); if(r!==null) l.status='returned' }
  }
}
</script>
