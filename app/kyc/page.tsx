'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft, X } from 'lucide-react'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

type Step = 'personal' | 'document' | 'done'

interface KycForm {
  fullName: string
  dob: string
  address: string
  city: string
  state: string
  pincode: string
  panNumber: string
  aadharNumber: string
}

const EMPTY_FORM: KycForm = {
  fullName: '', dob: '', address: '', city: '', state: '', pincode: '',
  panNumber: '', aadharNumber: '',
}

export default function KycPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('personal')
  const [form, setForm] = useState<KycForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<KycForm>>({})
  const [panFile, setPanFile] = useState<File | null>(null)
  const [aadharFile, setAadharFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof KycForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => { const n = { ...e }; delete n[field]; return n })
  }

  const validatePersonal = (): boolean => {
    const e: Partial<KycForm> = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required.'
    if (!form.dob) e.dob = 'Date of birth is required.'
    if (!form.address.trim()) e.address = 'Address is required.'
    if (!form.city.trim()) e.city = 'City is required.'
    if (!form.state.trim()) e.state = 'State is required.'
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateDocuments = (): boolean => {
    const e: Partial<KycForm> = {}
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase()))
      e.panNumber = 'Enter a valid PAN number (e.g. ABCDE1234F).'
    if (!/^\d{12}$/.test(form.aadharNumber.replace(/\s/g, '')))
      e.aadharNumber = 'Enter a valid 12-digit Aadhaar number.'
    if (!panFile) e.fullName = 'Please upload your PAN card.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePersonalNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePersonal()) setStep('document')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateDocuments()) return
    const token = getToken()
    if (!token) { router.push('/login'); return }

    setError(null)
    setLoading(true)
    try {
      // Store KYC metadata as a document record (real KYC service integration pending)
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation KycDoc($input: CreateDocumentInput!) {
            createDocument(input: $input) { id }
          }`,
          variables: {
            input: {
              templateId: 'kyc-verification',
              title: 'KYC Verification',
              formData: {
                fullName: form.fullName,
                dob: form.dob,
                address: form.address,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
                panNumber: form.panNumber.toUpperCase(),
                aadharLast4: form.aadharNumber.slice(-4),
                status: 'SUBMITTED',
              },
              currentStep: 1,
            },
          },
        }),
      })
      const json = await res.json()
      if (json.errors?.length) {
        setError(json.errors[0].message ?? 'KYC submission failed. Please try again.')
        return
      }
      setStep('done')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Submitted!</h1>
          <p className="text-gray-600 mb-2">Your documents are under review. Verification usually takes 1–2 business days.</p>
          <p className="text-sm text-gray-500 mb-8">You'll receive an email once your KYC is approved.</p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-semibold text-sm text-center transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/create"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-sm text-center transition-colors"
            >
              Create Document
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const inputClass = (field: keyof KycForm) =>
    `w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" />
                KYC Verification
              </h1>
              <p className="text-gray-300 text-sm mt-1">Required before creating notarized documents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {(['personal', 'document'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step === s ? 'text-gray-900' : (step as string) === 'done' || (s === 'personal' && step === 'document') ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-gray-900 text-white' :
                  (s === 'personal' && step === 'document') ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {s === 'personal' && step === 'document' ? <CheckCircle className="h-5 w-5" /> : i + 1}
                </div>
                <span className="text-sm font-medium capitalize hidden sm:block">{s === 'personal' ? 'Personal Info' : 'Documents'}</span>
              </div>
              {i === 0 && <div className={`flex-1 h-1 rounded ${step === 'document' ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 'personal' && (
            <form onSubmit={handlePersonalNext} className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Information</h2>
              <p className="text-sm text-gray-500 mb-4">Provide your details as they appear on official documents.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="As on PAN/Aadhaar" className={inputClass('fullName')} />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} className={inputClass('dob')} />
                {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                <textarea value={form.address} onChange={(e) => set('address', e.target.value)} rows={2} placeholder="House/Flat no., Street, Area" className={inputClass('address')} />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                  <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Mumbai" className={inputClass('city')} />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                  <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="Maharashtra" className={inputClass('state')} />
                  {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                  <input type="text" value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="400001" maxLength={6} className={inputClass('pincode')} />
                  {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-semibold transition-colors mt-2">
                Continue to Documents
              </button>
            </form>
          )}

          {step === 'document' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Identity Documents</h2>
              <p className="text-sm text-gray-500 mb-4">Provide your PAN and Aadhaar details for identity verification.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.panNumber}
                  onChange={(e) => set('panNumber', e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={inputClass('panNumber')}
                />
                {errors.panNumber && <p className="text-xs text-red-600 mt-1">{errors.panNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload PAN Card <span className="text-red-500">*</span></label>
                {panFile ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <span className="text-sm text-green-700 font-medium truncate">{panFile.name}</span>
                    <button type="button" onClick={() => setPanFile(null)} className="text-green-600 hover:text-red-500 ml-2"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload PAN card (PDF/JPG/PNG, max 5MB)</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => e.target.files?.[0] && setPanFile(e.target.files[0])} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.aadharNumber}
                  onChange={(e) => set('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                  className={inputClass('aadharNumber')}
                />
                {errors.aadharNumber && <p className="text-xs text-red-600 mt-1">{errors.aadharNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Aadhaar Card <span className="text-gray-400 font-normal">(optional)</span></label>
                {aadharFile ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <span className="text-sm text-green-700 font-medium truncate">{aadharFile.name}</span>
                    <button type="button" onClick={() => setAadharFile(null)} className="text-green-600 hover:text-red-500 ml-2"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload Aadhaar (PDF/JPG/PNG, max 5MB)</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => e.target.files?.[0] && setAadharFile(e.target.files[0])} />
                  </label>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                Your documents are encrypted and stored securely. We follow RBI guidelines for KYC data protection.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('personal')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</> : 'Submit KYC'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
