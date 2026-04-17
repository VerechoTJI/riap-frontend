<template>
  <div style="padding:16px">
    <h1>登入 / 註冊</h1>
    <div>
      <input v-model="username" placeholder="帳號或 Email" />
    </div>
    <div>
      <select v-model="role">
        <option value="tenant">承租者</option>
        <option value="landlord">房東</option>
        <option value="admin">管理員</option>
      </select>
    </div>
    <div>
      <button @click="login">模擬登入</button>
    </div>
  </div>
</template>

<script>
export default {
  data(){ return { username:'', role:'tenant' } },
  methods:{
    login(){
      const user = {id:Date.now(), username:this.username||('user'+Date.now()), role:this.role}
      localStorage.setItem('riap_user', JSON.stringify(user))
      this.$router.push('/')
    }
  }
}
</script>
