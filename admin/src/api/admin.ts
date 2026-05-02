import request from './request'

// 认证
export interface LoginParams { email: string; password: string }
export interface AuthResponse {
  token: string
  user: { id: number; username: string; email: string; role: string }
}
export function adminLogin(data: LoginParams) {
  return request.post<AuthResponse>('/auth/login', data)
}

// 板块
export interface Board { id: number; name: string; description: string; created_at: string }
export function getBoards() {
  return request.get<Board[]>('/boards')
}
export function createBoard(data: { name: string; description: string }) {
  return request.post<Board>('/admin/boards', data)
}
export function updateBoard(id: number, data: { name: string; description: string }) {
  return request.put<Board>(`/admin/boards/${id}`, data)
}
export function deleteBoard(id: number) {
  return request.delete(`/admin/boards/${id}`)
}

// 帖子
export interface Post {
  id: number; title: string; username: string; board_name: string
  like_count: number; comment_count: number; created_at: string
}
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }
export function getPosts(page = 1, pageSize = 20) {
  return request.get<Paginated<Post>>('/admin/posts', { params: { page, pageSize } })
}
export function deletePost(id: number) {
  return request.delete(`/admin/posts/${id}`)
}

// 评论
export interface Comment {
  id: number; content: string; username: string; post_title: string; created_at: string
}
export function getComments(page = 1, pageSize = 20) {
  return request.get<Paginated<Comment>>('/admin/comments', { params: { page, pageSize } })
}
export function deleteComment(id: number) {
  return request.delete(`/admin/comments/${id}`)
}

// 用户
export interface User {
  id: number; username: string; email: string; role: string; is_banned: boolean; created_at: string
}
export function getUsers(page = 1, pageSize = 20) {
  return request.get<Paginated<User>>('/admin/users', { params: { page, pageSize } })
}
export function banUser(id: number, isBanned: boolean) {
  return request.put(`/admin/users/${id}/ban`, { is_banned: isBanned })
}
