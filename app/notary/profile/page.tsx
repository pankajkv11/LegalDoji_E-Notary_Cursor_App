'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft, Save, User, MapPin, Award, FileText,
  CreditCard, Shield, CheckCircle, Upload, Camera, Star, Briefcase,
  Loader2, AlertCircle
} from 'lucide-react'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

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

const EMPTY_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  alternatePhone: '',
  dateOfBirth: '',
  gender: 'male',
  licenseNumber: '',
  barCouncilNumber: '',
  barCouncilState: 'Maharashtra',
  enrollmentDate: '',
  experience: '',
  specialization: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
  branchName: '',
  languages: '',
  consultationFee: '',
  bio: '',
  isVerified: false,
  verificationDate: '',
  rating: 0,
  completedSessions: 0,
  reviewsCount: 0,
}

export default function NotaryProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState(EMPTY_PROFILE)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const json = await gql(`query {
          myNotaryProfile {
            id fullName email phone photoUrl licenseNumber barCouncilNumber barCouncilState
            enrollmentDate experience specialization languages location consultationFee
            bio isVerified verificationDate completedSessions rating reviewsCount
            bankAccountHolder bankAccountNumber bankIfsc bankName bankBranch
          }
        }`)
        const n = json.data?.myNotaryProfile
        if (n) {
          if (n.photoUrl) setPhotoUrl(n.photoUrl)
          // Split location into address parts best-effort
          const locParts = (n.location || '').split(',').map((s: string) => s.trim())
          setProfileData({
            fullName: n.fullName ?? '',
            email: n.email ?? '',
            phone: n.phone ?? '',
            alternatePhone: '',
            dateOfBirth: '',
            gender: 'male',
            licenseNumber: n.licenseNumber ?? '',
            barCouncilNumber: n.barCouncilNumber ?? '',
            barCouncilState: n.barCouncilState ?? 'Maharashtra',
            enrollmentDate: n.enrollmentDate ?? '',
            experience: String(n.experience ?? ''),
            specialization: (n.specialization || []).join(', '),
            address: locParts[0] ?? '',
            city: locParts[1] ?? '',
            state: locParts[2] ?? '',
            pincode: '',
            country: 'India',
            accountHolderName: n.bankAccountHolder ?? '',
            accountNumber: n.bankAccountNumber ?? '',
            ifscCode: n.bankIfsc ?? '',
            bankName: n.bankName ?? '',
            branchName: n.bankBranch ?? '',
            languages: (n.languages || []).join(', '),
            consultationFee: String(n.consultationFee ?? ''),
            bio: n.bio ?? '',
            isVerified: n.isVerified ?? false,
            verificationDate: n.verificationDate ? new Date(n.verificationDate).toLocaleDateString('en-IN') : '',
            rating: n.rating ?? 0,
            completedSessions: n.completedSessions ?? 0,
            reviewsCount: n.reviewsCount ?? 0,
          })
        }
      } catch {
        // keep empty form
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const json = await gql(
        `mutation UpdateProfile($input: UpdateNotaryProfileInput!) {
          updateNotaryProfile(input: $input) { id fullName phone consultationFee bio }
        }`,
        {
          input: {
            fullName: profileData.fullName || null,
            phone: profileData.phone || null,
            languages: profileData.languages || null,
            address: profileData.address || null,
            city: profileData.city || null,
            state: profileData.state || null,
            consultationFee: profileData.consultationFee ? parseInt(profileData.consultationFee) : null,
            bio: profileData.bio || null,
            accountHolderName: profileData.accountHolderName || null,
            accountNumber: profileData.accountNumber || null,
            ifscCode: profileData.ifscCode || null,
            bankName: profileData.bankName || null,
            branchName: profileData.branchName || null,
          },
        }
      )
      if (json.errors?.length) {
        setSaveError(json.errors[0].message)
        setSaveStatus('error')
        return
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveError('Network error. Please try again.')
      setSaveStatus('error')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be under 2 MB')
      return
    }
    setPhotoUploading(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const json = await gql(
        `mutation UpdatePhoto($input: UpdateNotaryProfileInput!) {
          updateNotaryProfile(input: $input) { id photoUrl }
        }`,
        { input: { photoUrl: dataUrl } }
      )
      if (json.errors?.length) {
        alert(json.errors[0].message ?? 'Failed to upload photo')
        return
      }
      setPhotoUrl(dataUrl)
    } catch {
      alert('Failed to upload photo. Please try again.')
    } finally {
      setPhotoUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/notary/dashboard" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                <p className="text-gray-300 text-lg">Manage your professional information</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                saveStatus === 'saved'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {saveStatus === 'saving' && <><Loader2 className="h-5 w-5 animate-spin" />Saving...</>}
              {saveStatus === 'saved' && <><CheckCircle className="h-6 w-6" />Saved!</>}
              {saveStatus === 'error' && <><AlertCircle className="h-6 w-6" />Error</>}
              {saveStatus === 'idle' && <><Save className="h-6 w-6" />Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl"><User className="h-7 w-7 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Basic details about you</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                  <input type="text" value={profileData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-semibold" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input type="email" value={profileData.email} disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl"><Award className="h-7 w-7 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Your credentials and qualifications</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Notary License Number</label>
                    <input type="text" value={profileData.licenseNumber} disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-mono cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bar Council Number</label>
                    <input type="text" value={profileData.barCouncilNumber} disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-mono cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" value={profileData.experience} disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Consultation Fee (₹) *</label>
                    <input type="number" value={profileData.consultationFee} onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Languages Known *</label>
                  <input type="text" value={profileData.languages} onChange={(e) => handleInputChange('languages', e.target.value)}
                    placeholder="e.g., English, Hindi, Marathi"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professional Bio</label>
                  <textarea value={profileData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={4}
                    placeholder="Tell clients about your expertise and experience..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl"><MapPin className="h-7 w-7 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Your office/practice location</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Office Address *</label>
                  <input type="text" value={profileData.address} onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                    <input type="text" value={profileData.city} onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                    <input type="text" value={profileData.state} onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl"><CreditCard className="h-7 w-7 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Bank Details</h2>
                  <p className="text-sm text-gray-600 mt-1">For receiving payments</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name *</label>
                  <input type="text" value={profileData.accountHolderName} onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Account Number *</label>
                    <input type="text" value={profileData.accountNumber} onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code *</label>
                    <input type="text" value={profileData.ifscCode} onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name *</label>
                    <input type="text" value={profileData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Branch Name *</label>
                    <input type="text" value={profileData.branchName} onChange={(e) => handleInputChange('branchName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <div className="relative mb-6">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gray-900 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {profileData.fullName ? profileData.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'NA'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="absolute bottom-0 right-0 bg-white border-2 border-gray-900 rounded-full p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {photoUploading ? <Loader2 className="h-6 w-6 text-gray-900 animate-spin" /> : <Camera className="h-6 w-6 text-gray-900" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="w-full bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {photoUploading ? <><Loader2 className="h-5 w-5 animate-spin" />Uploading…</> : <><Upload className="h-5 w-5" />Upload Photo</>}
                </button>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP · max 2 MB</p>
              </div>
            </div>

            {/* Verification Status */}
            <div className={`${profileData.isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-2xl p-6`}>
              <div className="flex items-start gap-3">
                <Shield className={`h-8 w-8 ${profileData.isVerified ? 'text-green-600' : 'text-yellow-600'} flex-shrink-0`} />
                <div>
                  <h4 className={`font-bold ${profileData.isVerified ? 'text-green-900' : 'text-yellow-900'} mb-2 text-lg`}>
                    {profileData.isVerified ? 'Verified Account' : 'Pending Verification'}
                  </h4>
                  <p className={`text-sm ${profileData.isVerified ? 'text-green-800' : 'text-yellow-800'}`}>
                    {profileData.isVerified
                      ? 'Your profile has been verified by our team'
                      : 'Your account is under review by our admin team'}
                  </p>
                  {profileData.isVerified && profileData.verificationDate && (
                    <p className="text-xs text-green-700 mt-1">Verified on: {profileData.verificationDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Documents
              </h3>
              <div className="space-y-4">
                {['Notary Certificate', 'Bar Council Certificate', 'ID Proof'].map((doc) => (
                  <div key={doc} className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{doc}</span>
                      {profileData.isVerified
                        ? <CheckCircle className="h-5 w-5 text-green-600" />
                        : <Upload className="h-5 w-5 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-500">{profileData.isVerified ? 'Uploaded & Verified' : 'Not uploaded'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-6">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <span className="font-bold">{profileData.rating.toFixed(1)}/5.0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    <span className="text-sm font-medium">Sessions</span>
                  </div>
                  <span className="font-bold">{profileData.completedSessions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span className="text-sm font-medium">Reviews</span>
                  </div>
                  <span className="font-bold">{profileData.reviewsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
