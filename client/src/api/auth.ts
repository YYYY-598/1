import request from './request'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    username: string
    email: string
    role: string
    avatar_url?: string
    signature?: string
  }
}

export function login(data: LoginParams) {
  return request.post<AuthResponse>('/auth/login', data)
}

export function register(data: RegisterParams) {
  return request.post<AuthResponse>('/auth/register', data)
}
