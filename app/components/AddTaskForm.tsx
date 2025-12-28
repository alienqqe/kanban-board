'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { FormEvent, useState } from 'react'
import { apiFetch } from './AuthForm'
import { TaskStatus } from '../types/TaskStatus'
import { useParams } from 'next/navigation'
import { Task } from '../types/task'

const AddTaskForm = () => {
  const params = useParams()
  const boardId = params?.id as string
  const [newTaskName, setTaskName] = useState('')
  const [newTaskStatus, setTaskStatus] = useState<TaskStatus>('Todo')
  const [success, setSuccess] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

  const addTask = useMutation<
    { message?: string },
    Error,
    { title: string; status: TaskStatus; position: number; boardId: string }
  >({
    mutationFn: async ({ title, status, position, boardId }) => {
      const url = `${baseUrl}/api/tasks/add`
      const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status, position, boardId }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Something went wrong')
      }

      return data
    },
    onSuccess: (data, variables) => {
      setSuccess(
        data.message ||
          `Task "${variables.title}" created in column ${variables.status}!`
      )
      setTaskName('')
      // Invalidate board tasks and tasks-by-status caches.
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] })
      queryClient.invalidateQueries({
        queryKey: ['tasksByStatus', boardId, variables.status],
      })
    },
    onError: () => setSuccess(null),
  })

  const tasksByStatus = useQuery<{ tasks: Task[] }, Error>({
    queryKey: ['tasksByStatus', boardId, newTaskStatus],
    enabled: Boolean(boardId),
    queryFn: async () => {
      const res = await apiFetch(
        `${baseUrl}/api/tasks/getByStatus/${boardId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newTaskStatus }),
          credentials: 'include',
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to load tasks')
      }

      return data
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccess(null)

    const position = tasksByStatus.data?.tasks?.length ?? 0

    await addTask.mutateAsync({
      title: newTaskName,
      status: newTaskStatus,
      position,
      boardId: boardId,
    })
  }

  const isSubmitting = addTask.isPending

  return (
    <div className='flex w-full justify-center mt-4'>
      <div className='w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-900/70 p-5 shadow'>
        <h3 className='text-lg font-semibold text-neutral-50'>
          Add a new task
        </h3>
        <p className='mt-1 text-sm text-neutral-400'>
          Give it a name and choose where it starts.
        </p>

        <form className='mt-4 flex flex-col gap-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='taskName' className='text-sm text-neutral-300'>
              Title
            </label>
            <input
              id='taskName'
              className='w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none'
              type='text'
              placeholder='Enter task name'
              value={newTaskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='taskStatus' className='text-sm text-neutral-300'>
              Status
            </label>
            <select
              name='taskStatus'
              id='taskStatus'
              value={newTaskStatus}
              onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
              className='w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 focus:border-blue-500 focus:outline-none'
            >
              <option value='Todo'>Todo</option>
              <option value='Doing'>Doing</option>
              <option value='Done'>Done</option>
            </select>
          </div>

          {addTask.error && (
            <p className='text-sm text-red-400'>
              {addTask.error.message || 'Something went wrong'}
            </p>
          )}
          {success && <p className='text-sm text-green-400'>{success}</p>}

          <button
            className='mt-1 inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-900/50'
            type='submit'
            disabled={isSubmitting || !newTaskName}
          >
            {isSubmitting ? 'Adding...' : 'Add task'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddTaskForm
