import request from './request'

export function toggleLike(postId: number) {
  return request.post<{ liked: boolean; like_count: number }>(`/posts/${postId}/like`)
}
