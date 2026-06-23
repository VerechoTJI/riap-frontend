<template>
  <div class="app-shell">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <header class="topbar">
      <router-link class="brand" to="/">
        <span class="brand-mark">RIAP</span>
        <span class="brand-copy">
          <strong>租屋原型</strong>
          <small>快速預覽房源與流程</small>
        </span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/">房源</router-link>
        <router-link v-if="user" to="/messages">訊息</router-link>
        <router-link v-if="user?.role === 'landlord'" to="/landlord">房東</router-link>
        <router-link v-if="user?.role === 'admin'" to="/admin">審核</router-link>
      </nav>

      <div class="user-panel" v-if="user">
        <div class="user-avatar">{{ initials(user.username || user.displayName) }}</div>
        <div>
          <strong>{{ user.displayName || user.username }}</strong>
          <small>{{ roleText }}</small>
        </div>
        <button class="ghost-button" @click="logout">登出</button>
      </div>
      <router-link v-else class="ghost-button login-button" to="/login">登入</router-link>
    </header>

    <main class="page-frame">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
import { clearCurrentUser, initials, readCurrentUser, roleLabel } from "./lib/ui";

export default {
  name: "App",
  data() {
    return {
      user: readCurrentUser(),
    };
  },
  computed: {
    roleText() {
      return roleLabel(this.user?.role);
    },
  },
  mounted() {
    window.addEventListener("storage", this.syncUser);
    window.addEventListener("riap-user-changed", this.syncUser);
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.syncUser);
    window.removeEventListener("riap-user-changed", this.syncUser);
  },
  methods: {
    initials,
    syncUser() {
      this.user = readCurrentUser();
    },
    logout() {
      clearCurrentUser();
      this.user = null;
      this.$router.push("/");
    },
  },
};
</script>

<style>
:root {
  color-scheme: light;
  --bg: #f3efe8;
  --bg-soft: rgba(255, 255, 255, 0.7);
  --card: rgba(255, 255, 255, 0.84);
  --text: #1f2937;
  --muted: #6b7280;
  --line: rgba(17, 24, 39, 0.1);
  --primary: #b45f34;
  --primary-dark: #7c3f23;
  --secondary: #17324d;
  --accent: #f2d7bf;
  --shadow: 0 22px 60px rgba(31, 41, 55, 0.15);
}

html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

body {
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(180, 95, 52, 0.12), transparent 30%),
    radial-gradient(circle at right 20%, rgba(23, 50, 77, 0.12), transparent 24%),
    linear-gradient(180deg, #fbf7f2 0%, var(--bg) 100%);
  color: var(--text);
}

* {
  box-sizing: border-box;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.ambient {
  position: fixed;
  inset: auto;
  border-radius: 999px;
  filter: blur(14px);
  opacity: 0.5;
  pointer-events: none;
}

.ambient-one {
  top: -60px;
  left: -50px;
  width: 260px;
  height: 260px;
  background: rgba(180, 95, 52, 0.2);
}

.ambient-two {
  right: -80px;
  top: 220px;
  width: 320px;
  height: 320px;
  background: rgba(23, 50, 77, 0.14);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 28px;
  backdrop-filter: blur(16px);
  background: rgba(251, 247, 242, 0.7);
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--secondary), #415c77);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: var(--shadow);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-copy strong {
  font-size: 1.05rem;
}

.brand-copy small {
  color: var(--muted);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.nav-links a {
  color: var(--muted);
  padding: 8px 12px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-links a.router-link-active {
  background: var(--secondary);
  color: #fff;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.user-panel strong,
.user-panel small {
  display: block;
}

.user-panel small {
  color: var(--muted);
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), #d88d5e);
  color: #fff;
  font-weight: 700;
}

.ghost-button {
  border: 1px solid rgba(23, 50, 77, 0.12);
  background: rgba(255, 255, 255, 0.78);
  color: var(--secondary);
  border-radius: 14px;
  padding: 10px 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.ghost-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(23, 50, 77, 0.12);
}

.login-button {
  display: inline-flex;
  align-items: center;
}

.page-frame {
  width: min(1240px, calc(100% - 32px));
  margin: 28px auto 48px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 900px) {
  .topbar {
    flex-wrap: wrap;
    padding: 16px;
  }

  .nav-links {
    width: 100%;
    justify-content: space-between;
    overflow-x: auto;
  }

  .user-panel {
    margin-left: auto;
  }

  .page-frame {
    width: min(100% - 20px, 1240px);
    margin-top: 18px;
  }
}
</style>
