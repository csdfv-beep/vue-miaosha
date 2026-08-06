<template>
  <div class="product-manage">
    <div class="header">
      <h2>📦 商品管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加秒杀商品
      </el-button>
    </div>

    <!-- 商品列表 -->
    <el-table :data="productList" style="width: 100%" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="price" label="原价" width="120">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="seckillPrice" label="秒杀价" width="120">
        <template #default="{ row }">
          <span style="color: #f56c6c; font-weight: bold">¥{{ row.seckillPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="seckillStock" label="秒杀库存" width="120" />
      <el-table-column prop="statusText" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="seckillStartTime" label="开始时间" width="180" />
      <el-table-column prop="seckillEndTime" label="结束时间" width="180" />
      <!-- 新增：操作列 -->
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
              type="danger"
              size="small"
              @click="handleDeleteProduct(row.id, row.name)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加商品对话框 -->
    <el-dialog
        v-model="showAddDialog"
        title="添加秒杀商品"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-input v-model="formData.image" placeholder="请输入图片URL（可选）" />
        </el-form-item>
        <el-form-item label="原价" prop="price">
          <el-input-number
              v-model="formData.price"
              :precision="2"
              :min="0.01"
              :step="0.5"
              controls-position="right"
          />
        </el-form-item>
        <el-form-item label="秒杀价" prop="seckillPrice">
          <el-input-number
              v-model="formData.seckillPrice"
              :precision="2"
              :min="0.01"
              :step="0.5"
              controls-position="right"
          />
        </el-form-item>
        <el-form-item label="总库存" prop="stock">
          <el-input-number
              v-model="formData.stock"
              :min="1"
              :step="10"
              controls-position="right"
          />
        </el-form-item>
        <el-form-item label="秒杀库存" prop="seckillStock">
          <el-input-number
              v-model="formData.seckillStock"
              :min="1"
              :step="10"
              controls-position="right"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="seckillStartTime">
          <el-date-picker
              v-model="formData.seckillStartTime"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="seckillEndTime">
          <el-date-picker
              v-model="formData.seckillEndTime"
              type="datetime"
              placeholder="选择结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAddProduct">
          确认添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { productApi, type ProductVO, type ProductDTO } from '@/api/product'

const loading = ref(false)
const submitting = ref(false)
const showAddDialog = ref(false)
const productList = ref<ProductVO[]>([])
const formRef = ref()

// 获取当前时间作为默认值
const getDefaultStartTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1)
  return formatDate(now)
}

const getDefaultEndTime = () => {
  const now = new Date()
  now.setHours(now.getHours() + 2)
  return formatDate(now)
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formData = reactive<ProductDTO>({
  name: '',
  description: '',
  image: '',
  price: 0.01,
  seckillPrice: 0.01,
  stock: 100,
  seckillStock: 10,
  seckillStartTime: getDefaultStartTime(),
  seckillEndTime: getDefaultEndTime()
})

const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  seckillPrice: [{ required: true, message: '请输入秒杀价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  seckillStock: [{ required: true, message: '请输入秒杀库存', trigger: 'blur' }],
  seckillStartTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  seckillEndTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await productApi.getAllProducts()
    if (res.code === 200) {
      productList.value = res.data || []
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

const handleAddProduct = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    submitting.value = true
    try {
      console.log('📤 发送数据:', JSON.stringify(formData, null, 2))
      const res = await productApi.addProduct(formData)
      console.log('📥 响应:', res)
      if (res.code === 200) {
        ElMessage.success('✅ 添加成功')
        showAddDialog.value = false
        Object.assign(formData, {
          name: '',
          description: '',
          image: '',
          price: 0.01,
          seckillPrice: 0.01,
          stock: 100,
          seckillStock: 10,
          seckillStartTime: getDefaultStartTime(),
          seckillEndTime: getDefaultEndTime()
        })
        await loadProducts()
      } else {
        ElMessage.error(res.message || '添加失败')
      }
    } catch (error: any) {
      console.error('❌ 添加商品错误:', error)
      const message = error.response?.data?.message || error.message || '添加失败，请重试'
      ElMessage.error(message)
    } finally {
      submitting.value = false
    }
  })
}

// 新增：删除商品
const handleDeleteProduct = async (productId: number, productName: string) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除商品 "${productName}" 吗？删除后将同时清除Redis缓存数据。`,
        '提示',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const res = await productApi.deleteProduct(productId)
    if (res.code === 200) {
      ElMessage.success('✅ 商品删除成功')
      await loadProducts()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除商品失败')
    }
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-manage {
  padding: 20px;
  max-width: 1400px;
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

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>