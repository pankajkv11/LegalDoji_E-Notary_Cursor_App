'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle, FileText, User, Mail, Phone, File, AlertCircle, Briefcase, MapPin, BookOpen } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

export default function NotaryApplicationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    barCouncilNumber: '',
    experience: '',
    specialization: '',
    location: '',
    barCouncilFile: null as File | null,
  })

  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applicationNumber, setApplicationNumber] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, barCouncilFile: e.target.files[0] })
    }
  }

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [key]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUploading(true)

    try {
      let barCouncilFileBase64: string | null = null
      if (formData.barCouncilFile) {
        barCouncilFileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(formData.barCouncilFile!)
        })
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation Apply($input: NotaryApplicationInput!) {
            submitNotaryApplication(input: $input) {
              id applicationNumber status
            }
          }`,
          variables: {
            input: {
              firstName: formData.firstName,
              middleName: formData.middleName || null,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              licenseNumber: formData.licenseNumber || null,
              barCouncilNumber: formData.barCouncilNumber || null,
              experience: formData.experience || null,
              specialization: formData.specialization || null,
              location: formData.location || null,
              barCouncilFile: barCouncilFileBase64,
            },
          },
        }),
      })

      const json = await res.json()
      if (json.errors?.length) {
        setError(json.errors[0].message ?? 'Submission failed. Please try again.')
        return
      }
      const result = json.data?.submitNotaryApplication
      if (!result) {
        setError('Submission failed. Please try again.')
        return
      }
      setApplicationNumber(result.applicationNumber)
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to join LegalDoji as a notary. Your application has been received and is under review.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Our admin team will verify your documents within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email with the verification status</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Once approved, you can access your notary dashboard</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Application ID: <span className="font-mono font-semibold">{applicationNumber}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold text-center transition-all"
              >
                Go to Homepage
              </Link>
              <Link
                href="/login"
                className="flex-1 bg-gray-100 text-gray-900 hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold text-center transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const inputCls = 'w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <Link href="/join-notary" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notary Application Form</h1>
              <p className="text-sm text-gray-600">Fill in your details to join as a verified notary</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Info Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Before You Apply</h3>
              <p className="text-sm text-blue-700 mb-2">
                Make sure you have your Bar Council registration certificate ready to upload. The file should be in PDF, JPG, or PNG format (max 5MB).
              </p>
              <p className="text-sm text-blue-700 mb-2">
                Your application will be reviewed by our admin team within 24-48 hours.
              </p>
              <div className="flex flex-wrap gap-3 text-xs mt-2">
                <a href="mailto:notary@legaldoji.com" className="text-blue-800 font-semibold hover:underline">
                  📧 notary@legaldoji.com
                </a>
                <a href="tel:+911234567890" className="text-blue-800 font-semibold hover:underline">
                  📞 +91 123-456-7890
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Personal Information ── */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Personal Information
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" required value={formData.firstName} onChange={set('firstName')} placeholder="John" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Middle Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" value={formData.middleName} onChange={set('middleName')} placeholder="Kumar" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" required value={formData.lastName} onChange={set('lastName')} placeholder="Doe" className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" required value={formData.email} onChange={set('email')} placeholder="john@example.com" className={inputCls} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">We'll send verification updates to this email</p>
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel" required value={formData.phone} onChange={set('phone')} placeholder="+91 98765 43210" className={inputCls} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Include country code</p>
                </div>
              </div>
            </div>

            {/* ── Professional Details ── */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Professional Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Notary License Number</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" value={formData.licenseNumber} onChange={set('licenseNumber')} placeholder="LIC-XXXX-YYYY" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Bar Council Number</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" value={formData.barCouncilNumber} onChange={set('barCouncilNumber')} placeholder="BCN-XXXX" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="number" min="0" max="50" value={formData.experience} onChange={set('experience')} placeholder="5" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>City / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" value={formData.location} onChange={set('location')} placeholder="Mumbai, Maharashtra" className={inputCls} />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Specialization Areas</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={set('specialization')}
                    placeholder="Property, Affidavit, Power of Attorney (comma-separated)"
                    className={inputCls}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter areas separated by commas</p>
              </div>
            </div>

            {/* ── Document Upload ── */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4" /> Document Upload
              </h3>
              <div>
                <label className={labelCls}>Bar Council Registration Certificate *</label>
                <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  formData.barCouncilFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex flex-col items-center justify-center py-4">
                    {formData.barCouncilFile ? (
                      <>
                        <CheckCircle className="h-10 w-10 text-green-600 mb-2" />
                        <p className="text-sm font-semibold text-green-900">{formData.barCouncilFile.name}</p>
                        <p className="text-xs text-green-700 mt-1">{(formData.barCouncilFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Upload Bar Council Certificate</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                        <p className="text-xs text-gray-500">Click to browse or drag and drop</p>
                      </>
                    )}
                  </div>
                  <input type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                I confirm that all the information provided is accurate and I agree to the{' '}
                <Link href="/terms" className="text-gray-900 font-semibold hover:underline">Terms & Conditions</Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-gray-900 font-semibold hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-2">
              <Link
                href="/join-notary"
                className="flex-1 bg-gray-100 text-gray-900 hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold text-center transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <File className="h-5 w-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
