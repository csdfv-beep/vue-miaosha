import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Seckill from '@/views/Seckill.vue'
import ProductManage from '@/views/ProductManage.vue'
import Orders from '@/views/Orders.vue'

const routes = [
    { path: '/login', name: 'Login', component: Login },
    { path: '/', name: 'Seckill', component: Seckill },
    { path: '/products', name: 'ProductManage', component: ProductManage },
    { path: '/orders', name: 'Orders', component: Orders }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.path !== '/login' && !token) {
        next('/login')
    } else if (to.path === '/login' && token) {
        next('/')
    } else {
        next()
    }
})

export default router