'use client'

import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import AddBoardForm from './AddBoardForm'
import YourBoards from './YourBoards'
import { User } from '../types/user'
import { useAuth } from '../zustand/auth'

export default function HomeShell() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
  const { logout: clearToken } = useAuth()

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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || json?.message || 'Failed to log out')
      }
    },
    onSuccess: () => {
      clearToken()
      window.location.href = '/login'
    },
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

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
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-sm text-neutral-400'>You are logged in</p>
            <h1 className='mt-2 text-3xl font-semibold'>
              Welcome back{user?.username ? `, ${user.username}` : ''}!
            </h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className='rounded bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-900/50'
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {logoutMutation.error && (
          <div className='mt-3 rounded border border-red-800 bg-red-900/30 px-3 py-2 text-sm text-red-200'>
            {logoutMutation.error instanceof Error
              ? logoutMutation.error.message
              : 'Failed to log out'}
          </div>
        )}

        <YourBoards />
      </div>
      <div className='mt-8'>
        <AddBoardForm />
      </div>
    </div>
  )
}
