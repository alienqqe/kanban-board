'use client'
import BoardPage from '@/app/components/BoardPage'
import { useParams } from 'next/navigation'
import React from 'react'

const Page = () => {
  const params = useParams<{ id: string }>()

  return <BoardPage params={params} />
}

export default Page
