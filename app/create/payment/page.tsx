'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react'
import { loadCreateDraft, BASE_PRICE, DELIVERY_FEE } from '@/lib/document-templates'

export default function CreatePaymentPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<{ documentTitle: string } | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const d = loadCreateDraft()
    if (!d) {
      router.replace('/create')
      return
    }
    setDraft(d)
  }, [router])

  const total = BASE_PRICE + DELIVERY_FEE

  const handlePay = () => {
    setPaying(true)
    // Placeholder: simulate Razorpay. In production, integrate Razorpay SDK.
    setTimeout(() => {
      const orderId = `ORD-${Date.now()}`
      router.replace(`/create/confirmation?order=${orderId}`)
    }, 1500)
  }

  if (!draft) {
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
            <Link
              href="/create/checkout"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Back to checkout"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
              <p className="text-sm text-gray-600">Complete your purchase securely</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
            <CreditCard className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {draft.documentTitle}
          </h2>
          <p className="text-3xl font-bold text-primary-600 text-center mb-8">
            ₹{total}
          </p>
          <p className="text-sm text-gray-600 text-center mb-6">
            Secure payment via Razorpay (Card, UPI, Net Banking). Integration placeholder.
          </p>
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {paying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing…
              </>
            ) : (
              <>Pay ₹{total}</>
            )}
          </button>
          <Link
            href="/create/checkout"
            className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            ← Back to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
