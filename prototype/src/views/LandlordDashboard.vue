<template>
  <div style="padding:16px">
    <h1>房東儀表板</h1>
    <div>
      <button @click="create">新增房源（僅記憶體）</button>
    </div>
    <div v-for="l in myListings" :key="l.id" style="border:1px solid #ddd;padding:8px;margin-top:8px">
      <div>{{l.title}} · {{l.city}} · 月租 {{l.rent}}</div>
      <div>
        <button @click="edit(l)">編輯</button>
        <button @click="remove(l)">刪除</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getListings } from '../lib/fixtures'
export default {
  data(){ return { all: [] } },
  async created(){ try{ this.all = await getListings() }catch(e){ console.error(e) } },
  computed:{
    myListings(){
      return this.all
    }
  },
  methods:{
    create(){
      const n = { id: Date.now(), title: '新房源 '+Date.now(), description:'', rent:0, city:'', status:'published' }
      this.all.unshift(n)
    },
    edit(l){
      const t = prompt('修改標題', l.title)
      if(t!==null) l.title = t
    },
    remove(l){
      this.all = this.all.filter(x=>x.id!==l.id)
    }
  }
}
</script>
