<template>
  <div class="login-container">
    <div class="login-card">
      <h2>🔥 秒杀系统</h2>
      <h3>用户登录</h3>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="demo-tips">
        <p>测试账号：admin / 123456</p>
        <p>或使用：testuser1 ~ testuser5 / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await authApi.login(loginForm)
      if (res.code === 200) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userId', String(res.data.userId))
        localStorage.setItem('username', res.data.username)

        ElMessage.success('登录成功')
        router.push('/')
      } else {
        ElMessage.error(res.message || '登录失败')
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-card h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.login-card h3 {
  text-align: center;
  color: #666;
  font-weight: 400;
  margin-bottom: 30px;
}

.demo-tips {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
}

.demo-tips p {
  margin: 5px 0;
}
</style>