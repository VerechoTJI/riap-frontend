<template>
  <div style="padding:16px">
    <h1>訊息</h1>
    <div>
      <textarea v-model="body" placeholder="寫訊息給房東..."></textarea>
    </div>
    <div>
      <button @click="send">傳送（僅記憶體）</button>
    </div>
    <div style="margin-top:12px">
      <h3>目前對話</h3>
      <div v-for="m in messages" :key="m.id" style="border-bottom:1px solid #eee;padding:6px 0">{{m.from}} → {{m.to}}: {{m.body}}</div>
    </div>
  </div>
</template>

<script>
import msgs from '/public/fixtures/messages.json'
export default {
  data(){ return { body:'', messages: [...msgs] } },
  methods:{
    send(){
      const user = JSON.parse(localStorage.getItem('riap_user')||'null') || {username:'匿名'}
      this.messages.push({ id: Date.now(), from: user.username, to: 'landlord', body: this.body })
      this.body = ''
    }
  }
}
</script>
