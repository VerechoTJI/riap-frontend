<template>
  <div class="auth-layout">
    <section class="auth-hero">
      <div class="auth-hero__overlay"></div>
      <div class="auth-hero__copy">
        <p class="eyebrow">前端原型 · 模擬登入</p>
        <h1>把登入、找房、訊息與審核流程放在同一個乾淨視覺裡。</h1>
        <p>
          這個切片使用本機 fixtures 與 Vue state 模擬完整租屋流程，方便快速展示和迭代。
        </p>
      </div>
      <div class="auth-hero__stats">
        <div>
          <strong>3</strong>
          <span>角色</span>
        </div>
        <div>
          <strong>localStorage</strong>
          <span>保留登入狀態</span>
        </div>
        <div>
          <strong>0</strong>
          <span>後端依賴</span>
        </div>
      </div>
    </section>

    <section class="auth-card">
      <div class="auth-card__header">
        <span class="badge">快速進入</span>
        <h2>登入 / 註冊</h2>
        <p>可輸入任意帳號，也可以直接點選示範帳號。</p>
      </div>

      <div class="field-grid">
        <label class="field">
          <span>帳號或 Email</span>
          <input v-model="username" placeholder="例如 alice / bob@example.com" />
        </label>
        <label class="field">
          <span>密碼</span>
          <input type="password" v-model="password" placeholder="請輸入密碼" />
        </label>
        <label class="field">
          <span>角色</span>
          <select v-model="role">
            <option value="tenant">房客</option>
            <option value="landlord">房東</option>
            <option value="admin">管理員</option>
          </select>
        </label>
      </div>

      <button class="primary-button" @click="login">登入 / 註冊（需密碼）</button>

      <div class="demo-list">
        <div class="demo-list__title">示範帳號</div>
        <button
          v-for="user in demoUsers"
          :key="user.id"
          class="demo-chip"
          @click="quickLogin(user)"
        >
          <span>{{ user.displayName }}</span>
          <small>{{ roleLabel(user.role) }}</small>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { getUsers, addUser } from "../lib/fixtures";
import { roleLabel, writeCurrentUser, hashPassword } from "../lib/ui";

export default {
  data() {
    return {
      username: "",
      password: "",
      role: "tenant",
      demoUsers: [],
    };
  },
  async created() {
    try {
      this.demoUsers = (await getUsers()).map((user) => ({
        ...user,
        displayName: user.displayName || user.username,
      }));
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    roleLabel,
    async login() {
      const name = (this.username || "").trim();
      if (!name) return alert("請輸入帳號或 Email");
      try {
        const users = await getUsers();
        const found = users.find((u) => u.username === name || u.email === name);

        if (found) {
          // existing user: if passwordHash present, validate
          if (found.passwordHash) {
            if (!this.password) return alert("請輸入密碼以登入");
            const h = await hashPassword(this.password);
            if (h !== found.passwordHash) return alert("密碼錯誤");
          }
          writeCurrentUser(found);
          this.$router.push(this.$route.query.redirect || "/");
          return;
        }

        // new registration requires password
        if (!this.password) return alert("註冊需設定密碼");
        const passwordHash = await hashPassword(this.password);
        const newUser = {
          username: name,
          displayName: name,
          role: this.role,
          passwordHash,
        };
        try {
          const created = await addUser(newUser);
          writeCurrentUser(created);
          this.$router.push(this.$route.query.redirect || "/");
        } catch (e) {
          console.error(e);
          alert('註冊失敗');
        }
      } catch (e) {
        console.error(e);
        alert("登入失敗，請稍後再試");
      }
    },
    quickLogin(user) {
      writeCurrentUser(user);
      this.$router.push(this.$route.query.redirect || "/");
    },
  },
};
</script>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
  gap: 24px;
  align-items: stretch;
}

.auth-hero,
.auth-card {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.auth-hero {
  min-height: 600px;
  padding: 40px;
  background:
    linear-gradient(135deg, rgba(17, 50, 77, 0.92), rgba(180, 95, 52, 0.62)),
    url("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80") center/cover;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.auth-hero__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 30%);
}

.auth-hero__copy,
.auth-hero__stats {
  position: relative;
  z-index: 1;
}

.eyebrow,
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.85rem;
}

.auth-hero h1 {
  max-width: 12ch;
  font-size: clamp(2.4rem, 4vw, 4.8rem);
  line-height: 1;
  margin: 18px 0;
}

.auth-hero p {
  max-width: 56ch;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.8;
}

.auth-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.auth-hero__stats div {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
}

.auth-hero__stats strong,
.auth-hero__stats span {
  display: block;
}

.auth-hero__stats strong {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.auth-card {
  padding: 32px;
  background: var(--card);
}

.auth-card__header h2 {
  margin: 14px 0 6px;
  font-size: 2rem;
}

.auth-card__header p {
  margin: 0 0 24px;
  color: var(--muted);
}

.field-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 18px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 0.95rem;
  color: var(--muted);
}

.field input,
.field select {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--text);
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: rgba(180, 95, 52, 0.55);
  box-shadow: 0 0 0 4px rgba(180, 95, 52, 0.12);
}

.primary-button {
  width: 100%;
  border: 0;
  border-radius: 18px;
  padding: 15px 18px;
  background: linear-gradient(135deg, var(--primary), #d78145);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(180, 95, 52, 0.24);
}

.demo-list {
  margin-top: 24px;
  display: grid;
  gap: 10px;
}

.demo-list__title {
  color: var(--muted);
  font-size: 0.95rem;
}

.demo-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
}

.demo-chip span {
  font-weight: 700;
}

.demo-chip small {
  color: var(--muted);
}

@media (max-width: 900px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    min-height: 460px;
    padding: 28px;
  }

  .auth-hero__stats {
    grid-template-columns: 1fr;
  }
}
</style>
