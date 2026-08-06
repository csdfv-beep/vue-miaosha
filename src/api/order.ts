import request from './request'

export interface OrderVO {
    id: number
    orderNo: string
    userId: number
    productId: number
    price: number
    quantity: number
    totalAmount: number
    status: number
    createTime: string
    updateTime: string
    payTime?: string
    cancelTime?: string
}

export const orderApi = {
    // 获取我的订单
    getMyOrders(): Promise<{ code: number; data: OrderVO[]; message?: string }> {
        return request.get('/orders/my')
    },

    // 取消订单
    cancelOrder(orderId: number): Promise<{ code: number; message: string }> {
        return request.put(`/orders/${orderId}/cancel`)
    },

    // 新增：删除订单
    deleteOrder(orderId: number): Promise<{ code: number; message: string }> {
        return request.delete(`/orders/${orderId}`)
    }
}