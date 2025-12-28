'use client'
import { useAuth } from '../zustand/auth'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiResponse } from '../types/auth'

export async function apiFetch(url: string, options: RequestInit = {}) {
  const { accessToken, setToken } = useAuth.getState()

  const headers: HeadersInit = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  let res = await fetch(url, { ...options, headers, credentials: 'include' })

  if (res.status === 401) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
      {
        method: 'GET',
        credentials: 'include',
      }
    )

    const refreshJSON = await refreshRes.json()

    if (refreshRes.ok && refreshJSON.accessToken) {
      setToken(refreshJSON.accessToken)

      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${refreshJSON.accessToken}`,
        },
        credentials: 'include',
      })
    } else {
      window.location.href = '/login'
    }
  }

  return res
}

const AuthForm = ({ mode }: { mode: 'login' | 'register' }) => {
  const router = useRouter()
  const { setToken } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const authMutation = useMutation<
    ApiResponse,
    Error,
    { username: string; password: string }
  >({
    mutationFn: async ({ username, password }) => {
      const url =
        mode === 'login'
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })

      const data: ApiResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      return data
    },
    onSuccess: (data) => {
      setSuccessMessage(null)

      if (mode === 'register') {
        setSuccessMessage(data.message || 'Registered')
        router.push('/login')
        return
      }

      if (data.accessToken) setToken(data.accessToken)

      router.push('/')
    },
    onError: () => setSuccessMessage(null),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    authMutation.mutate({ username, password })
  }

  return (
    <div className='flex text-center items-center justify-center h-screen text-white flex-col gap-4'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-72'>
        <h1 className='text-2xl font-bold'>
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        <input
          className='p-2 rounded bg-neutral-800 border border-neutral-700'
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className='p-2 rounded bg-neutral-800 border border-neutral-700'
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {successMessage && <p className='text-green-500'>{successMessage}</p>}
        {authMutation.error && (
          <p className='text-red-500'>
            {authMutation.error.message || 'Something went wrong'}
          </p>
        )}

        <button
          className='p-2 bg-blue-600 hover:bg-blue-700 rounded'
          type='submit'
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>

        <p className='text-sm text-neutral-400'>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <a href='/register' className='text-blue-400'>
                Register
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href='/login' className='text-blue-400'>
                Login
              </a>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
export default AuthForm
