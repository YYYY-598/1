import request from './request'

export interface MeProfile {
  id: number
  username: string
  email: string
  role: string
  avatar_url: string
  signature: string
  created_at: string
  post_count: number
}

export interface MyPostSummary {
  id: number
  title: string
  summary: string
  board_id: number
  board_name: string
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export function getMe() {
  return request.get<MeProfile>('/me')
}

export function updateProfile(data: { signature: string }) {
  return request.put<MeProfile>('/me/profile', data)
}

export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ avatar_url: string }>('/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function updatePassword(data: { old_password: string; new_password: string }) {
  return request.put<{ success: true }>('/me/password', data)
}

export function getMyPosts(page = 1, pageSize = 10) {
  return request.get<PaginatedResponse<MyPostSummary>>('/me/posts', {
    params: { page, pageSize },
  })
}
