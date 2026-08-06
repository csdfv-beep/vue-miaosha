<template>
  <div id="app">
    <nav class="navbar" v-if="isLoggedIn">
      <div class="nav-container">
        <div class="nav-brand" @click="$router.push('/')" style="cursor: pointer">
          🔥 秒杀系统
        </div>
        <div class="nav-menu">
          <router-link to="/" class="nav-link" active-class="active">秒杀首页</router-link>
          <router-link to="/products" class="nav-link" active-class="active">商品管理</router-link>
          <router-link to="/orders" class="nav-link" active-class="active">我的订单</router-link>
        </div>
        <div class="nav-user">
          <span>欢迎，{{ username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const token = localStorage.getItem('token')
const isLoggedIn = computed(() => !!token)
const username = computed(() => localStorage.getItem('username') || '用户')

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }

.navbar {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 15px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #f56c6c;
  background: #fef0f0;
}

.nav-link.active {
  color: #f56c6c;
  font-weight: 500;
  background: #fef0f0;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
}
</style>