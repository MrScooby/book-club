import { redirect } from 'next/navigation'
import { currentYear } from '@/lib/years'

export default function Home() {
  redirect(`/${currentYear()}`)
}
