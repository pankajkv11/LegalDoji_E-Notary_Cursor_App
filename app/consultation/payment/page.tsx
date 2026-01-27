'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video, Loader2 } from 'lucide-react'
import { loadConsultationDraft } from '@/lib/consultation'
import { useMeQuery } from '@/graphql/generated/hooks'
import { getAccessToken } from '@/lib/auth'

export default function ConsultationPaymentPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<{ advocateName: string; advocateFee: number; date: string; time: string } | null>(null)
  const [paying, setPaying] = useState(false)
  
  // Check authentication
  const { data: userData, loading: userLoading } = useMeQuery({
    errorPolicy: 'ignore'
  })
  const isAuthenticated = !!userData?.me || !!getAccessToken()

  useEffect(() => {
    const d = loadConsultationDraft()
    if (!d) {
      router.replace('/consultation')
      return
    }
    setDraft(d)
    
    // Redirect to login if not authenticated, preserving consultation flow
    if (!userLoading && !isAuthenticated) {
      router.push('/login?redirect=/consultation/payment')
    }
  }, [router, userLoading, isAuthenticated])

  const handlePay = () => {
    setPaying(true)
    setTimeout(() => {
      router.replace('/consultation/confirmation')
    }, 1500)
  }

  if (!draft || userLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/consultation" className="text-gray-600 hover:text-gray-900" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
              <p className="text-sm text-gray-600">Video consultation — ₹{draft.advocateFee}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
            <Video className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{draft.advocateName}</h2>
          <p className="text-sm text-gray-600 text-center mb-2">
            {new Date(draft.date).toLocaleDateString('en-IN', { dateStyle: 'long' })} at {draft.time}
          </p>
          <p className="text-3xl font-bold text-primary-600 text-center mb-8">₹{draft.advocateFee}</p>
          {!isAuthenticated ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 mb-3 text-center">Please sign in to complete your booking</p>
              <div className="flex gap-3">
                <Link
                  href="/login?redirect=/consultation/payment"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup?redirect=/consultation/payment"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing…
                </>
              ) : (
                <>Pay ₹{draft.advocateFee}</>
              )}
            </button>
          )}
          <Link href="/consultation" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  )
}
