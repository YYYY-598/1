import request from './request'

export interface Board {
  id: number
  name: string
  description: string
  sort_order: number
  created_at: string
}

export function getBoards() {
  return request.get<Board[]>('/boards')
}

export function getBoard(id: number) {
  return request.get<Board>(`/boards/${id}`)
}
