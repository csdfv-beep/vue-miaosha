import request from './request'

export const seckillApi = {
    seckill(productId: number): Promise<{ code: number; message: string }> {
        return request.post(`/seckill/${productId}`)
    }
}