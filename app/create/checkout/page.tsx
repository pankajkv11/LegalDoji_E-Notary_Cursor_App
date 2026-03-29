'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, CheckCircle, Tag, Save, Loader2, MapPin } from 'lucide-react'
import {
  loadCreateDraft,
  saveCreateDraft,
  BASE_PRICE,
  DELIVERY_FEE,
  type CreateDraft,
} from '@/lib/document-templates'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

interface AddressForm {
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  country: string
}

const EMPTY_ADDRESS: AddressForm = { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' }

export default function CreateCheckoutPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<CreateDraft | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS)
  const [addressErrors, setAddressErrors] = useState<Partial<AddressForm>>({})

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

  const validateAddress = (): boolean => {
    const errs: Partial<AddressForm> = {}
    if (!address.line1.trim()) errs.line1 = 'Address line 1 is required.'
    if (!address.city.trim()) errs.city = 'City is required.'
    if (!address.state.trim()) errs.state = 'State is required.'
    if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode.'
    setAddressErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePay = async () => {
    if (!draft) return
    if (!validateAddress()) return
    setPayError(null)
    setPaying(true)
    try {
      const token = getToken()
      let documentId = draft.documentId
      let deliveryAddressId = draft.deliveryAddressId

      // Save document to DB first if not already saved
      if (token && !documentId) {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            query: `mutation SaveDoc($input: CreateDocumentInput!) {
              createDocument(input: $input) { id }
            }`,
            variables: {
              input: {
                templateId: draft.templateId,
                title: draft.documentTitle,
                formData: draft.formData,
              },
            },
          }),
        })
        const json = await res.json()
        if (json.errors?.length) {
          setPayError(json.errors[0].message ?? 'Failed to save document. Please try again.')
          return
        }
        documentId = json.data?.createDocument?.id
      }

      // Save delivery address
      if (token && !deliveryAddressId) {
        const addrRes = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            query: `mutation CreateAddr($input: CreateAddressInput!) {
              createAddress(input: $input) { id }
            }`,
            variables: {
              input: {
                label: 'Delivery',
                line1: address.line1,
                line2: address.line2 || null,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                country: address.country,
                isDefault: false,
              },
            },
          }),
        })
        const addrJson = await addrRes.json()
        if (!addrJson.errors?.length) {
          deliveryAddressId = addrJson.data?.createAddress?.id
        }
      }

      const updated = { ...draft, documentId, deliveryAddressId }
      saveCreateDraft(updated)
      setDraft(updated)

      router.push('/create/payment')
    } catch {
      setPayError('Network error. Please check your connection.')
    } finally {
      setPaying(false)
    }
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

          {/* Delivery Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              Delivery Address
            </h2>
            <p className="text-sm text-gray-500 mb-4">Where should we deliver your notarized document?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={address.line1}
                  onChange={(e) => { setAddress({ ...address, line1: e.target.value }); setAddressErrors({ ...addressErrors, line1: undefined }) }}
                  placeholder="House/Flat no., Street, Area"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${addressErrors.line1 ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {addressErrors.line1 && <p className="text-xs text-red-600 mt-1">{addressErrors.line1}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  placeholder="Landmark (optional)"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => { setAddress({ ...address, city: e.target.value }); setAddressErrors({ ...addressErrors, city: undefined }) }}
                  placeholder="Mumbai"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${addressErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {addressErrors.city && <p className="text-xs text-red-600 mt-1">{addressErrors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => { setAddress({ ...address, state: e.target.value }); setAddressErrors({ ...addressErrors, state: undefined }) }}
                  placeholder="Maharashtra"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${addressErrors.state ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {addressErrors.state && <p className="text-xs text-red-600 mt-1">{addressErrors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={address.pincode}
                  onChange={(e) => { setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }); setAddressErrors({ ...addressErrors, pincode: undefined }) }}
                  placeholder="400001"
                  maxLength={6}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${addressErrors.pincode ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {addressErrors.pincode && <p className="text-xs text-red-600 mt-1">{addressErrors.pincode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  readOnly
                />
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

            {payError && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {payError}
              </p>
            )}
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveDraft}
                disabled={paying}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="h-5 w-5" />
                Save Draft
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {paying ? <><Loader2 className="h-5 w-5 animate-spin" />Saving…</> : <>Pay ₹{calculateTotal()}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
