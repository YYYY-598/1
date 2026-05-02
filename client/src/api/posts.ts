import request from './request'

export interface PostSummary {
  id: number
  title: string
  summary: string
  username: string
  like_count: number
  comment_count: number
  created_at: string
}

export interface PostDetail {
  id: number
  title: string
  content: string
  username: string
  user_id: number
  board_id: number
  board_name: string
  like_count: number
  liked: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export function getPosts(boardId: number, page = 1, pageSize = 10) {
  return request.get<PaginatedResponse<PostSummary>>(`/boards/${boardId}/posts`, {
    params: { page, pageSize },
  })
}

export function getPost(id: number) {
  return request.get<PostDetail>(`/posts/${id}`)
}

export function createPost(boardId: number, data: { title: string; content: string }) {
  return request.post<PostDetail>(`/boards/${boardId}/posts`, data)
}

export function deletePost(id: number) {
  return request.delete(`/posts/${id}`)
}
