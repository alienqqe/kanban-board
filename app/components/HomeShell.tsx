'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import AddBoardForm from './AddBoardForm'
import YourBoards from './YourBoards'
import { User } from '../types/user'

export default function HomeShell() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<User | null, Error>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        credentials: 'include',
      })

      if (res.status === 401) {
        return null
      }

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.message || 'Failed to verify session')
      }

      return (await res.json()) as User
    },
    retry: false,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login'
    }
  }, [isLoading, user])

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-200'>
        Checking session...
      </div>
    )
  }

  if (isError) {
    return (
      <div className='min-h-screen bg-neutral-950 text-neutral-200'>
        <div className='bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 text-sm text-center'>
          {error?.message || 'Failed to verify session'}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className='flex min-h-screen items-center justify-center flex-col  bg-neutral-950 text-neutral-100'>
      <div className='w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 px-8 py-10 shadow-xl'>
        <p className='text-sm text-neutral-400'>You are logged in</p>
        <h1 className='mt-2 text-3xl font-semibold'>
          Welcome back{user?.username ? `, ${user.username}` : ''}!
        </h1>

        <YourBoards />
      </div>
      <div className='mt-8'>
        <AddBoardForm />
      </div>
    </div>
  )
}
