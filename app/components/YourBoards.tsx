import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './AuthForm'
import Link from 'next/link'
import { Board } from '../types/board'

const YourBoards = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{ boards: Board[] }, Error>({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await apiFetch(`${baseUrl}/api/board`, {
        method: 'GET',
        credentials: 'include',
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(
          json?.error || json?.message || 'Failed to load boards'
        )
      }

      return json
    },
  })

  const boards = data?.boards || []

  if (isLoading) {
    return (
      <div className='mt-6 rounded-lg border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm text-neutral-300'>
        Loading your boards...
      </div>
    )
  }

  if (isError) {
    return (
      <div className='mt-6 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-200'>
        {error?.message || 'Failed to load boards'}
      </div>
    )
  }

  if (!boards.length) {
    return (
      <div className='mt-6 rounded-lg border border-dashed border-neutral-800 bg-neutral-900/40 px-4 py-6 text-center'>
        <p className='text-lg font-medium text-neutral-200'>No boards yet</p>
        <p className='mt-1 text-sm text-neutral-500'>
          Create your first board to get started.
        </p>
      </div>
    )
  }

  return (
    <div className='mt-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-neutral-50'>Your boards</h2>
        <span className='text-xs uppercase tracking-wide text-neutral-500'>
          {boards.length} total
        </span>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.id}`}
            className='group rounded-lg border border-neutral-800 bg-neutral-900/70 px-4 py-3 transition duration-150 hover:-translate-y-0.5 hover:border-blue-500'
          >
            <div className='flex items-center justify-between gap-3'>
              <span className='text-lg font-medium text-neutral-100'>
                {board.name}
              </span>
              <span className='text-[11px] uppercase tracking-wide text-blue-300/70 group-hover:text-blue-200'>
                Open
              </span>
            </div>
            {board.created_at && (
              <p className='mt-1 text-xs text-neutral-500'>
                Created {new Date(board.created_at).toLocaleDateString()}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default YourBoards
