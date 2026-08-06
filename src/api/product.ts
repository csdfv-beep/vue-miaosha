import request from './request'

export interface ProductDTO {
    name: string
    description?: string
    image?: string
    price: number
    seckillPrice: number
    stock: number
    seckillStock: number
    seckillStartTime: string
    seckillEndTime: string
}

export interface ProductVO {
    id: number
    name: string
    description: string
    image: string
    price: number
    seckillPrice: number
    seckillStock: number
    seckillStartTime: string
    seckillEndTime: string
    status: number
    remainSeconds: number
    statusText: string
}

export const productApi = {
    // 添加商品
    addProduct(data: ProductDTO): Promise<{ code: number; message: string; data: any }> {
        return request.post('/products/add', data)
    },

    // 获取所有商品
    getAllProducts(): Promise<{ code: number; data: ProductVO[] }> {
        return request.get('/products/all')
    },

    // 获取秒杀商品
    getSeckillProducts(): Promise<{ code: number; data: ProductVO[] }> {
        return request.get('/products/seckill')
    },

    // 新增：删除商品
    deleteProduct(productId: number): Promise<{ code: number; message: string }> {
        return request.delete(`/products/${productId}`)
    }
}