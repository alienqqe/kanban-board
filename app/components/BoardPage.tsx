'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Column from './Column'
import { apiFetch } from './AuthForm'
import { Task } from '../types/task'
import { TaskStatus } from '../types/TaskStatus'
import AddTaskForm from './AddTaskForm'
import { useMemo, useRef } from 'react'

export default function BoardPage({ params }: { params: { id: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
  const STATUSES: TaskStatus[] = ['Todo', 'Doing', 'Done']

  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery<
    { tasks: Task[] },
    Error
  >({
    queryKey: ['tasks', params.id],
    enabled: Boolean(params?.id),
    queryFn: async () => {
      const res = await apiFetch(`${baseUrl}/api/tasks/${params.id}`, {
        method: 'GET',
        credentials: 'include',
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || json?.message || 'Failed to load tasks')
      }

      return json
    },
  })

  const columns = useMemo(() => {
    const next = { Todo: [], Doing: [], Done: [] } as Record<TaskStatus, Task[]>
    ;(data?.tasks ?? []).forEach((t) => next[t.status].push(t))
    return next
  }, [data?.tasks])

  const columnRefs = useRef<Record<TaskStatus, HTMLDivElement | null>>({
    Todo: null,
    Doing: null,
    Done: null,
  })

  const findColumnAtPoint = (x: number, y: number): TaskStatus | null => {
    for (const status of STATUSES) {
      const el = columnRefs.current[status]
      if (!el) continue
      // get columns left, right, top, bottom edges
      const rect = el.getBoundingClientRect()
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return status
      }
    }
    return null
  }

  const updateTask = useMutation({
    mutationFn: ({
      id,
      status,
      position,
    }: {
      id: string
      status: TaskStatus
      position: number
    }) =>
      apiFetch(`${baseUrl}/api/tasks/updateTask/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, position }),
        credentials: 'include',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', params.id] })
    },
  })

  const moveTask = (taskId: string, from: TaskStatus, to: TaskStatus) => {
    if (from === to) return
    const nextPosition = columns[to].length

    queryClient.setQueryData<{ tasks: Task[] }>(
      ['tasks', params.id],
      (prev) => {
        if (!prev) return prev
        const updated = prev.tasks.map((task) =>
          task.id === taskId
            ? { ...task, status: to, position: nextPosition }
            : task
        )
        return { ...prev, tasks: updated }
      }
    )

    updateTask.mutate({
      id: taskId,
      status: to,
      position: nextPosition,
    })
  }

  const deleteTask = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${baseUrl}/api/tasks/deleteTask/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', params.id] })
    },
  })

  const onDeleteTask = (taskId: string) => deleteTask.mutate(taskId)

  if (isLoading) {
    return <div className='p-4 text-neutral-300'>Loading tasks...</div>
  }

  if (isError) {
    return (
      <div className='p-4 text-red-300'>
        {error?.message || 'Failed to load tasks'}
      </div>
    )
  }

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4'>
        {Object.entries(columns).map(([col, items]) => (
          <Column
            key={col}
            name={col as TaskStatus}
            tasks={items}
            findColumnAtPoint={findColumnAtPoint}
            ref={(el) => {
              columnRefs.current[col as TaskStatus] = el
            }}
            onDropTask={moveTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
      <AddTaskForm />
    </>
  )
}
