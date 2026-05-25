'use client'

import { useRouter } from 'next/navigation'
import ScanForm from './ScanForm'

export default function RefreshOnScan() {
  const router = useRouter()
  return <ScanForm onNewCard={() => router.refresh()} />
}
