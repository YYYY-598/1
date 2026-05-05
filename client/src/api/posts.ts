import request from './request'

export interface PostSummary {
  id: number
  title: string
  summary: string
  username: string
  avatar_url?: string
  user_id?: number
  board_id?: number
  board_name?: string
  cover_url?: string
  images?: string[]
  like_count: number
  comment_count: number
  created_at: string
}

export interface PostDetail {
  id: number
  title: string
  content: string
  username: string
  avatar_url: string
  user_id: number
  board_id: number
  board_name: string
  like_count: number
  liked: boolean
  created_at: string
  updated_at: string
  comments?: Array<{
    id: number
    content: string
    username: string
    avatar_url: string
    user_id: number
    created_at: string
  }>
  cover_url?: string
  images?: string[]
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

export function getFeed(page = 1, pageSize = 20, boardId?: number) {
  return request.get<PaginatedResponse<PostSummary>>('/feed', {
    params: { page, pageSize, boardId },
  })
}

export function searchPosts(q: string, page = 1, pageSize = 20) {
  return request.get<PaginatedResponse<PostSummary>>('/posts/search', {
    params: { q, page, pageSize },
  })
}

export function getPost(id: number) {
  return request.get<PostDetail>(`/posts/${id}`)
}

export function createPost(boardId: number, data: { title: string; content: string }) {
  return request.post<PostDetail>(`/boards/${boardId}/posts`, data)
}

export function uploadPostImages(postId: number, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return request.post<{ images: Array<{ id: number; url: string; sort_order: number }> }>(
    `/posts/${postId}/images`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}

export function updatePost(id: number, data: { title: string; content: string }) {
  return request.put<PostDetail>(`/posts/${id}`, data)
}

export function deletePost(id: number) {
  return request.delete(`/posts/${id}`)
}
