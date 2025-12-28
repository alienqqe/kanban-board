import { TaskStatus } from './TaskStatus'

export type Task = {
  id: string
  title: string
  status: TaskStatus
  board_id: string
  position?: number
}
