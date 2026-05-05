import request from './request'

export interface Comment {
  id: number
  content: string
  username: string
  avatar_url: string
  user_id: number
  created_at: string
}

export function getComments(postId: number) {
  return request.get<Comment[]>(`/posts/${postId}/comments`)
}

export function createComment(postId: number, data: { content: string }) {
  return request.post<Comment>(`/posts/${postId}/comments`, data)
}

export function deleteComment(id: number) {
  return request.delete(`/comments/${id}`)
}
