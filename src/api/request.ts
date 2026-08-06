import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 使用相对路径，通过 Vite 代理转发
const request: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        console.log('📤 请求:', config.method?.toUpperCase(), config.url)
        console.log('📤 Token:', token ? '有' : '无')
        if (token) {
            config.headers.Authorization = token
        }
        return config
    },
    (error) => {
        console.error('请求拦截器错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('📥 响应:', response.status, response.data)
        return response.data
    },
    (error) => {
        console.error('❌ 响应错误:', error)

        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            ElMessage.error('⚠️ 网络连接失败，请确保后端服务已启动 (端口8080)')
            return Promise.reject(error)
        }

        if (error.response) {
            const { status, data } = error.response
            if (status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('userId')
                localStorage.removeItem('username')
                ElMessage.warning('登录已过期，请重新登录')
                setTimeout(() => {
                    window.location.href = '/login'
                }, 1000)
            } else if (data?.message) {
                ElMessage.error(data.message)
            }
        }
        return Promise.reject(error)
    }
)

export default request