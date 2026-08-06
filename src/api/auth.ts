import request from './request'

export interface LoginParams {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    userId: number
    username: string
}

export const authApi = {
    login(data: LoginParams): Promise<{ code: number; message: string; data: LoginResponse }> {
        return request.post('/auth/login', data)
    },

    logout(): Promise<{ code: number; message: string }> {
        return request.post('/auth/logout')
    }
}