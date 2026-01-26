'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, CheckCircle, Tag, Save, Loader2, AlertCircle } from 'lucide-react'
import { 
  useCheckoutSummaryQuery, 
  useApplyCouponMutation, 
  useCreateOrderMutation,
  useDocumentQuery 
} from '@/graphql/generated/hooks'

export default function CreateCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentId = searchParams.get('documentId')
  
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch document details
  const { data: documentData, loading: documentLoading } = useDocumentQuery({
    variables: { id: documentId || '' },
    skip: !documentId
  })

  // Fetch checkout summary
  const { data: checkoutData, loading: checkoutLoading, refetch: refetchCheckout } = useCheckoutSummaryQuery({
    variables: { 
      documentId: documentId || '',
      couponCode: couponApplied ? couponCode : undefined
    },
    skip: !documentId
  })

  const [applyCoupon, { loading: applyingCoupon }] = useApplyCouponMutation({
    onCompleted: () => {
      setCouponApplied(true)
      refetchCheckout()
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  const [createOrder, { loading: creatingOrder }] = useCreateOrderMutation({
    onCompleted: (data) => {
      if (data.createOrder) {
        router.push(`/create/payment?orderId=${data.createOrder.id}`)
      }
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  useEffect(() => {
    if (!documentId) {
      router.replace('/create')
    }
  }, [documentId, router])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !documentId) return
    setError(null)
    await applyCoupon({
      variables: {
        documentId,
        code: couponCode.trim()
      }
    })
  }

  const handlePay = async () => {
    if (!documentId || !checkoutData?.checkoutSummary) return
    
    // First create the order
    try {
      await createOrder({
        variables: {
          input: {
            documentId,
            deliveryAddressId: '', // This should come from user's saved addresses or form
            couponCode: couponApplied ? couponCode : undefined
          }
        }
      })
    } catch (err) {
      // Error handled by onError callback
    }
  }

  const summary = checkoutData?.checkoutSummary
  const document = documentData?.document

  if (documentLoading || checkoutLoading || !documentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!document || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Document not found</p>
          <Link href="/create" className="text-primary-600 hover:underline">Go back to create</Link>
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
              href="/create"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Back to create"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-600">Review and complete your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Document Summary</h2>
            <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{document.title || 'Document'}</h3>
                <p className="text-sm text-gray-600 mt-1">Category: {document.category || 'General'}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Created: {new Date(document.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Status: {document.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Price Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Document Creation</p>
                  <p className="text-sm text-gray-500">E-notarized {document.category?.toLowerCase() || 'document'}</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">₹{summary.basePrice}</p>
              </div>
              {summary.deliveryFee > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Delivery Fee</p>
                    <p className="text-sm text-gray-500">Physical delivery included</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">₹{summary.deliveryFee}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <p className="text-gray-700">Subtotal</p>
                <p className="text-lg font-medium text-gray-900">₹{summary.subtotal}</p>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Discount
                  </p>
                  <p className="text-lg font-medium">-₹{summary.discount}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                <p className="text-xl font-bold text-gray-900">Total Amount</p>
                <p className="text-3xl font-bold text-primary-600">₹{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary-600" />
              Have a Coupon Code?
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                disabled={couponApplied}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                aria-label="Coupon code"
              />
              {!summary.couponApplied ? (
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {applyingCoupon ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCouponApplied(false)
                    setCouponCode('')
                    refetchCheckout()
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            {summary.couponApplied && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Coupon applied! You saved ₹{summary.discount}
              </p>
            )}

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePay}
                disabled={creatingOrder}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {creatingOrder ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${summary.total}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
