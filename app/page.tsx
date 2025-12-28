import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import HomeShell from './components/HomeShell'

export default async function Home() {
  const accessToken = (await cookies()).get('accessToken')

  if (!accessToken) {
    redirect('/login')
  }

  return <HomeShell />
}
