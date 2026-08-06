<template>
  <div class="orders-container">
    <div class="header">
      <h2>📋 我的订单</h2>
      <el-button type="primary" size="small" @click="loadOrders">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 订单列表 -->
    <div v-loading="loading">
      <div v-if="orders.length === 0" class="empty">
        <el-empty description="暂无订单" />
      </div>
      <div v-else class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
          <div class="order-body">
            <div class="order-info">
              <div class="product-name">商品ID：{{ order.productId }}</div>
              <div class="order-price">秒杀价：¥{{ order.price }}</div>
              <div class="order-quantity">数量：{{ order.quantity || 1 }}</div>
              <div class="order-total">总金额：¥{{ order.totalAmount || order.price }}</div>
            </div>
            <div class="order-time">
              创建时间：{{ order.createTime }}
            </div>
          </div>
          <div class="order-actions">
            <!-- 待支付：显示取消和支付按钮 -->
            <template v-if="order.status === 0">
              <el-button type="primary" size="small" @click="handlePay(order.id)">去支付</el-button>
              <el-button type="danger" size="small" @click="handleCancel(order.id)">取消订单</el-button>
            </template>
            <!-- 已取消：显示删除按钮 -->
            <template v-if="order.status === 2">
              <el-button type="danger" size="small" @click="handleDelete(order.id)">删除订单</el-button>
            </template>
            <!-- 已支付：显示查看详情 -->
            <template v-if="order.status === 1">
              <el-button type="info" size="small" disabled>已支付</el-button>
            </template>
            <!-- 已退款：显示已退款 -->
            <template v-if="order.status === 3">
              <el-button type="info" size="small" disabled>已退款</el-button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { orderApi, type OrderVO } from '@/api/order'

const router = useRouter()
const loading = ref(false)
const orders = ref<OrderVO[]>([])

const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已退款'
  }
  return map[status] || '未知'
}

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await orderApi.getMyOrders()
    console.log('订单数据:', res)
    if (res.code === 200) {
      orders.value = res.data || []
    } else {
      ElMessage.error(res.message || '加载订单失败')
    }
  } catch (error: any) {
    console.error('加载订单错误:', error)
    if (error.response?.status === 401) {
      router.push('/login')
    }
    ElMessage.error(error.response?.data?.message || '加载订单失败')
  } finally {
    loading.value = false
  }
}

const handlePay = (orderId: number) => {
  ElMessage.info('恭喜你，零元购成功')
}

// 取消订单（取消后恢复库存）
const handleCancel = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
        '取消订单后，库存将恢复，您可以重新秒杀该商品。确定要取消吗？',
        '提示',
        {
          confirmButtonText: '确定取消',
          cancelButtonText: '再想想',
          type: 'warning'
        }
    )

    const res = await orderApi.cancelOrder(orderId)
    if (res.code === 200) {
      ElMessage.success('✅ 订单已取消，库存已恢复，可以重新秒杀')
      await loadOrders()
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败')
    }
  }
}

// 删除订单（已取消的订单）
const handleDelete = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这个订单吗？',
        '提示',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const res = await orderApi.deleteOrder(orderId)
    if (res.code === 200) {
      ElMessage.success('✅ 订单已删除')
      await loadOrders()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除订单失败')
    }
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.empty {
  padding: 50px 0;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.order-no {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 30px;
}

.order-info .product-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.order-info .order-price {
  color: #f56c6c;
  font-weight: 500;
}

.order-info .order-quantity,
.order-info .order-total {
  color: #666;
  font-size: 14px;
}

.order-time {
  color: #999;
  font-size: 13px;
  text-align: right;
  min-width: 180px;
}

.order-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .order-body {
    flex-direction: column;
  }

  .order-info {
    grid-template-columns: 1fr;
    margin-bottom: 12px;
  }

  .order-time {
    text-align: left;
  }
}
</style>