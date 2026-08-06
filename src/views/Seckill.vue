<template>
  <div class="seckill-container">
    <div class="header">
      <h1>🔥 商品秒杀活动</h1>
      <div class="user-info">
        <span>欢迎，{{ username }}</span>
        <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
      </div>
    </div>

    <div class="product-grid">
      <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          :class="{ ended: product.status === 2 }"
      >
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <el-tag :type="getStatusType(product.status)" size="small">
            {{ product.statusText }}
          </el-tag>
        </div>
        <div class="product-desc">{{ product.description || '暂无描述' }}</div>
        <div class="price-section">
          <span class="seckill-price">秒杀价：¥{{ product.seckillPrice }}</span>
          <span class="original-price">原价：¥{{ product.price }}</span>
        </div>
        <div class="stock-info">
          剩余库存：<span :class="{ danger: product.seckillStock <= 10 }">
            {{ product.seckillStock }}
          </span>
        </div>
        <div class="count-down" v-if="product.status !== 2">
          <span v-if="product.status === 0">距离开始：</span>
          <span v-else>距离结束：</span>
          <Countdown
              :target-time="product.status === 0 ? product.seckillStartTime : product.seckillEndTime"
              @finish="loadProducts"
          />
        </div>
        <div v-else class="count-down ended-text">活动已结束</div>
        <button
            class="kill-btn"
            :disabled="product.status !== 1 || product.seckillStock <= 0"
            @click="handleSeckill(product.id)"
        >
          {{ getButtonText(product) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productApi, type ProductVO } from '@/api/product'
import { seckillApi } from '@/api/seckill'
import Countdown from '@/components/Countdown.vue'

const router = useRouter()
const products = ref<ProductVO[]>([])
const loading = ref(false)
let refreshTimer: number | null = null

const username = computed(() => localStorage.getItem('username') || '用户')

const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const getButtonText = (product: ProductVO) => {
  if (product.status === 0) return '未开始'
  if (product.status === 2 || product.seckillStock <= 0) return '已售罄'
  return '立即秒杀'
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await productApi.getSeckillProducts()
    if (res.code === 200) {
      products.value = res.data
    }
  } catch (error) {
    console.error('加载商品失败', error)
  } finally {
    loading.value = false
  }
}

const handleSeckill = async (productId: number) => {
  try {
    const res = await seckillApi.seckill(productId)
    if (res.code === 200) {
      ElMessage.success(res.message || '秒杀成功！')
      await loadProducts()
    } else {
      ElMessage.error(res.message || '秒杀失败')
    }
  } catch (error: any) {
    const message = error.response?.data?.message || '秒杀失败，请重试'
    ElMessage.error(message)
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  router.push('/login')
  ElMessage.success('已退出登录')
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  loadProducts()
  refreshTimer = window.setInterval(loadProducts, 10000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.seckill-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header h1 { margin: 0; color: #333; }

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.product-card.ended { opacity: 0.7; }

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.product-header h3 { margin: 0; font-size: 18px; color: #333; }

.product-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  min-height: 40px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.seckill-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.stock-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.stock-info .danger { color: #f56c6c; font-weight: bold; }

.count-down {
  font-size: 18px;
  color: #e64340;
  font-weight: 500;
  margin: 15px 0;
  padding: 10px;
  background: #fef0f0;
  border-radius: 6px;
  text-align: center;
}

.ended-text { color: #999; background: #f5f5f5; }

.kill-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  background: #f56c6c;
  color: white;
}

.kill-btn:hover:not(:disabled) {
  background: #e64340;
  transform: scale(1.02);
}

.kill-btn:disabled {
  background: #c8c9cc;
  cursor: not-allowed;
}
</style>