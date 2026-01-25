'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, CheckCircle, Tag, Save } from 'lucide-react'
import {
  loadCreateDraft,
  saveCreateDraft,
  BASE_PRICE,
  DELIVERY_FEE,
  type CreateDraft,
} from '@/lib/document-templates'

export default function CreateCheckoutPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<CreateDraft | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  useEffect(() => {
    const d = loadCreateDraft()
    if (!d) {
      router.replace('/create')
      return
    }
    setDraft(d)
  }, [router])

  const calculateSubtotal = () => BASE_PRICE + DELIVERY_FEE
  const calculateDiscount = () =>
    couponApplied ? Math.round(calculateSubtotal() * 0.1) : 0
  const calculateTotal = () => calculateSubtotal() - calculateDiscount()

  const handleApplyCoupon = () => {
    if (couponCode.trim()) setCouponApplied(true)
  }

  const handlePay = () => {
    router.push('/create/payment')
  }

  const handleSaveDraft = () => {
    if (draft) {
      saveCreateDraft(draft)
      router.push('/create')
    }
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
                <h3 className="font-semibold text-gray-900">{draft.documentTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">{draft.shortDescription}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Created: {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Type: {draft.templateName}</span>
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
                  <p className="text-sm text-gray-500">E-notarized {draft.templateName.toLowerCase()}</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">₹{BASE_PRICE}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Delivery Fee</p>
                  <p className="text-sm text-gray-500">Physical delivery included</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">₹{DELIVERY_FEE}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <p className="text-gray-700">Subtotal</p>
                <p className="text-lg font-medium text-gray-900">₹{calculateSubtotal()}</p>
              </div>
              {couponApplied && (
                <div className="flex justify-between items-center text-green-600">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Discount (10%)
                  </p>
                  <p className="text-lg font-medium">-₹{calculateDiscount()}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                <p className="text-xl font-bold text-gray-900">Total Amount</p>
                <p className="text-3xl font-bold text-primary-600">₹{calculateTotal()}</p>
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
              {!couponApplied ? (
                <button
                  onClick={handleApplyCoupon}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCouponApplied(false)
                    setCouponCode('')
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {couponApplied && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Coupon applied! You saved ₹{calculateDiscount()}
              </p>
            )}

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveDraft}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="h-5 w-5" />
                Save Draft
              </button>
              <button
                onClick={handlePay}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Pay ₹{calculateTotal()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
