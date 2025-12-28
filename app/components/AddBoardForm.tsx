'use client'
import React, { FormEvent, useState } from 'react'
import { apiFetch } from './AuthForm'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const AddBoardForm = () => {
  const [newBoardName, setBoardName] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

  const addBoard = useMutation<{ message?: string }, Error, { name: string }>({
    mutationFn: async ({ name }) => {
      const url = `${baseUrl}/api/board/add`
      const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      return data
    },
    onSuccess: (data, variables) => {
      setSuccess(data.message || `Board "${variables.name}" created`)
      setBoardName('')
      // Ensure board list refreshes without a manual reload.
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
    onError: () => setSuccess(null),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccess(null)

    await addBoard.mutateAsync({ name: newBoardName })
  }

  return (
    <div>
      <form className='flex flex-col gap-4 w-72' onSubmit={handleSubmit}>
        <input
          className='p-2 rounded bg-neutral-800 border border-neutral-700'
          type='text'
          placeholder='Enter board name'
          value={newBoardName}
          onChange={(e) => setBoardName(e.target.value)}
        />

        {addBoard.error && (
          <p className='text-red-500 text-sm'>
            {addBoard.error.message || 'Something went wrong'}
          </p>
        )}
        {success && <p className='text-green-500 text-sm'>{success}</p>}

        <button
          className='p-2 bg-blue-600 hover:bg-blue-700 rounded'
          type='submit'
        >
          Add new board
        </button>
      </form>
    </div>
  )
}

export default AddBoardForm
