'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Loader2, AlertCircle } from 'lucide-react'
import { useOrderQuery, useCreatePaymentMutation, useConfirmPaymentMutation } from '@/graphql/generated/hooks'

export default function CreatePaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string | null>(null)

  // Fetch order details
  const { data: orderData, loading: orderLoading } = useOrderQuery({
    variables: { id: orderId || '' },
    skip: !orderId
  })

  const [createPayment, { loading: creatingPayment }] = useCreatePaymentMutation({
    onCompleted: async (data) => {
      if (data.createPayment && data.createPayment.razorpayOrderId) {
        // Initialize Razorpay payment
        // This is a placeholder - in production, integrate Razorpay SDK
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
          amount: data.createPayment.amount * 100, // Convert to paise
          currency: data.createPayment.currency,
          name: 'LegalDoji',
          description: `Payment for Order ${orderData?.order?.orderNumber || orderId}`,
          order_id: data.createPayment.razorpayOrderId,
          handler: async function (response: any) {
            setRazorpayPaymentId(response.razorpay_payment_id)
            // Confirm payment on backend
            await confirmPayment({
              variables: {
                orderId: orderId || '',
                razorpayPaymentId: response.razorpay_payment_id
              }
            })
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          },
          theme: {
            color: '#1f2937'
          }
        }

        // In production, use Razorpay SDK:
        // const razorpay = new (window as any).Razorpay(options)
        // razorpay.open()
        
        // For now, simulate payment
        setTimeout(() => {
          const mockPaymentId = `pay_${Date.now()}`
          setRazorpayPaymentId(mockPaymentId)
          confirmPayment({
            variables: {
              orderId: orderId || '',
              razorpayPaymentId: mockPaymentId
            }
          })
        }, 1500)
      }
    },
    onError: (err) => {
      setError(err.message)
      setPaying(false)
    }
  })

  const [confirmPayment, { loading: confirmingPayment }] = useConfirmPaymentMutation({
    onCompleted: (data) => {
      if (data.confirmPayment && data.confirmPayment.status === 'COMPLETED') {
        router.push(`/create/confirmation?order=${orderId}`)
      }
    },
    onError: (err) => {
      setError(err.message)
      setPaying(false)
    }
  })

  useEffect(() => {
    if (!orderId) {
      router.replace('/create/checkout')
    }
  }, [orderId, router])

  const handlePay = async () => {
    if (!orderId) return
    setPaying(true)
    setError(null)
    
    try {
      await createPayment({
        variables: {
          orderId
        }
      })
    } catch (err) {
      // Error handled by onError callback
    }
  }

  const order = orderData?.order

  if (orderLoading || !orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link href="/create/checkout" className="text-primary-600 hover:underline">Go back to checkout</Link>
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
            Order {order.orderNumber}
          </h2>
          {order.documentId && (
            <p className="text-sm text-gray-600 text-center mb-2">
              Document ID: {order.documentId}
            </p>
          )}
          <p className="text-3xl font-bold text-primary-600 text-center mb-8">
            ₹{order.totalAmount}
          </p>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {order.status === 'PAID' || order.status === 'PROCESSING' ? (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-semibold">Payment already completed!</p>
              <Link
                href={`/create/confirmation?order=${orderId}`}
                className="text-green-600 hover:underline text-sm mt-2 inline-block"
              >
                View confirmation →
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 text-center mb-6">
                Secure payment via Razorpay (Card, UPI, Net Banking, Wallet)
              </p>
              <button
                onClick={handlePay}
                disabled={paying || creatingPayment || confirmingPayment}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {paying || creatingPayment || confirmingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>Pay ₹{order.totalAmount}</>
                )}
              </button>
            </>
          )}
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
