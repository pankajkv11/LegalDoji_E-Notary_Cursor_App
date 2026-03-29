'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { loadCreateDraft } from '@/lib/document-templates'
import { getToken, getUser } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

interface PaymentInit {
  paymentId: string
  orderId: string
  orderNumber: string
  razorpayOrderId: string
  razorpayKeyId: string
  amount: number  // paise
  currency: string
  documentTitle: string
  isTestMode: boolean
}

async function gql(query: string, variables: Record<string, unknown> = {}) {
  const token = getToken()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CreatePaymentPage() {
  const router = useRouter()
  const [paymentInit, setPaymentInit] = useState<PaymentInit | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const draft = loadCreateDraft()
      if (!draft) { router.replace('/create'); return }

      const token = getToken()
      if (!token) { router.replace('/login'); return }

      if (!draft.documentId) {
        setError('Document not saved. Please go back to checkout.')
        setLoading(false)
        return
      }

      try {
        const json = await gql(
          `mutation InitPay($documentId: String!, $addressId: String) {
            initiatePayment(documentId: $documentId, deliveryAddressId: $addressId) {
              paymentId orderId orderNumber
              razorpayOrderId razorpayKeyId
              amount currency documentTitle isTestMode
            }
          }`,
          { documentId: draft.documentId, addressId: draft.deliveryAddressId ?? null }
        )

        if (json.errors?.length) {
          setError(json.errors[0].message ?? 'Failed to initiate payment.')
          setLoading(false)
          return
        }

        const data = json.data?.initiatePayment
        if (!data) { setError('Failed to initiate payment.'); setLoading(false); return }

        setPaymentInit({
          paymentId: data.paymentId,
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          razorpayOrderId: data.razorpayOrderId,
          razorpayKeyId: data.razorpayKeyId,
          amount: data.amount,
          currency: data.currency,
          documentTitle: data.documentTitle,
          isTestMode: data.isTestMode,
        })
      } catch {
        setError('Network error. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handlePay = async () => {
    if (!paymentInit) return
    setError(null)
    setPaying(true)

    // Test mode: simulate payment without Razorpay SDK
    if (paymentInit.isTestMode) {
      try {
        const json = await gql(
          `mutation ConfirmPay($orderId: String!, $paymentId: String!) {
            confirmPayment(orderId: $orderId, razorpayPaymentId: $paymentId) { id status }
          }`,
          { orderId: paymentInit.orderId, paymentId: `pay_test_${Date.now()}` }
        )
        if (json.errors?.length) {
          setError(json.errors[0].message ?? 'Payment confirmation failed.')
          setPaying(false)
          return
        }
        router.replace(`/create/confirmation?order=${paymentInit.orderNumber}`)
      } catch {
        setError('Network error during payment confirmation.')
        setPaying(false)
      }
      return
    }

    // Real Razorpay SDK
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setError('Failed to load Razorpay. Please check your internet connection.')
      setPaying(false)
      return
    }

    const user = getUser()
    const rzp = new (window as any).Razorpay({
      key: paymentInit.razorpayKeyId,
      amount: paymentInit.amount,
      currency: paymentInit.currency,
      name: 'LegalDoji',
      description: paymentInit.documentTitle,
      order_id: paymentInit.razorpayOrderId,
      prefill: {
        name: user?.name ?? '',
        email: user?.email ?? '',
        contact: user?.phone ?? '',
      },
      theme: { color: '#1f2937' },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
      }) => {
        try {
          const json = await gql(
            `mutation ConfirmPay($orderId: String!, $paymentId: String!, $sig: String) {
              confirmPayment(orderId: $orderId, razorpayPaymentId: $paymentId, razorpaySignature: $sig) {
                id status
              }
            }`,
            {
              orderId: paymentInit.orderId,
              paymentId: response.razorpay_payment_id,
              sig: response.razorpay_signature,
            }
          )
          if (json.errors?.length) {
            setError(json.errors[0].message ?? 'Payment verification failed.')
            setPaying(false)
            return
          }
          router.replace(`/create/confirmation?order=${paymentInit.orderNumber}`)
        } catch {
          setError('Payment succeeded but verification failed. Contact support.')
          setPaying(false)
        }
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
    })
    rzp.open()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Preparing payment…</p>
        </div>
      </div>
    )
  }

  if (error && !paymentInit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full mx-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">Payment Setup Failed</p>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <Link href="/create/checkout" className="text-gray-900 font-semibold hover:underline text-sm">
            ← Back to Checkout
          </Link>
        </div>
      </div>
    )
  }

  const displayAmount = paymentInit ? paymentInit.amount / 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/create/checkout" className="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Back to checkout">
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
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6 mx-auto">
            <CreditCard className="h-8 w-8 text-gray-700" />
          </div>

          {paymentInit?.isTestMode && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 text-center">
              <strong>Test Mode</strong> — No real payment. Add Razorpay keys in <code>backend/.env</code> for live payments.
            </div>
          )}

          <h2 className="text-lg font-bold text-gray-900 text-center mb-1 line-clamp-2">
            {paymentInit?.documentTitle}
          </h2>
          <p className="text-3xl font-bold text-gray-900 text-center mb-2">
            ₹{displayAmount}
          </p>
          {paymentInit?.orderNumber && (
            <p className="text-xs text-gray-500 text-center mb-6">
              Order: {paymentInit.orderNumber}
            </p>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-gray-900 hover:bg-black disabled:opacity-70 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {paying ? (
              <><Loader2 className="h-5 w-5 animate-spin" />Processing…</>
            ) : (
              <>{paymentInit?.isTestMode ? 'Simulate Payment' : `Pay ₹${displayAmount}`}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4" />
            <span>
              {paymentInit?.isTestMode
                ? 'Test mode — safe to proceed'
                : 'Secured by Razorpay · Card, UPI, Net Banking'}
            </span>
          </div>

          <Link href="/create/checkout" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
            ← Back to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
