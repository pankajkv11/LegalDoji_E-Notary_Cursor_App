'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, Save, User, Mail, Phone, MapPin, Building2, Award, FileText,
  Calendar, CreditCard, Shield, CheckCircle, Upload, Camera, Star, Briefcase
} from 'lucide-react'

export default function NotaryProfilePage() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: 'Adv. Ramesh Kumar',
    email: 'ramesh.kumar@email.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
    dateOfBirth: '1985-05-15',
    gender: 'male',

    // Professional Information
    licenseNumber: 'MH-NOT-2024-001',
    barCouncilNumber: 'BAR/MH/2018/1234',
    barCouncilState: 'Maharashtra',
    enrollmentDate: '2018-06-01',
    experience: '6',
    specialization: 'Property & Real Estate Law',

    // Address
    address: 'Shop 12, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    country: 'India',

    // Bank Details
    accountHolderName: 'Ramesh Kumar',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branchName: 'Andheri West Branch',

    // Professional Details
    languages: 'English, Hindi, Marathi',
    consultationFee: '999',
    bio: 'Experienced notary with 6+ years of expertise in property law and legal documentation. Committed to providing professional and efficient notarization services.',

    // Verification Status
    isVerified: true,
    verificationDate: '2024-01-10'
  })

  const handleSave = async () => {
    setSaveStatus('saving')
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/notary/dashboard"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
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
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {saveStatus === 'saving' && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  Saving...
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle className="h-6 w-6" />
                  Saved!
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <Save className="h-6 w-6" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Basic details about you</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-semibold"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Alternate Phone</label>
                    <input
                      type="tel"
                      value={profileData.alternatePhone}
                      onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Gender *</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Your credentials and qualifications</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Notary License Number *</label>
                    <input
                      type="text"
                      value={profileData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bar Council Number *</label>
                    <input
                      type="text"
                      value={profileData.barCouncilNumber}
                      onChange={(e) => handleInputChange('barCouncilNumber', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bar Council State *</label>
                    <select
                      value={profileData.barCouncilState}
                      onChange={(e) => handleInputChange('barCouncilState', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Enrollment Date *</label>
                    <input
                      type="date"
                      value={profileData.enrollmentDate}
                      onChange={(e) => handleInputChange('enrollmentDate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience *</label>
                    <input
                      type="number"
                      value={profileData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Consultation Fee (₹) *</label>
                    <input
                      type="number"
                      value={profileData.consultationFee}
                      onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Specialization *</label>
                  <input
                    type="text"
                    value={profileData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="e.g., Property & Real Estate Law"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Languages Known *</label>
                  <input
                    type="text"
                    value={profileData.languages}
                    onChange={(e) => handleInputChange('languages', e.target.value)}
                    placeholder="e.g., English, Hindi, Marathi"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professional Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    placeholder="Tell clients about your expertise and experience..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Your office/practice location</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Office Address *</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code *</label>
                    <input
                      type="text"
                      value={profileData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Bank Details</h2>
                  <p className="text-sm text-gray-600 mt-1">For receiving payments</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name *</label>
                  <input
                    type="text"
                    value={profileData.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Account Number *</label>
                    <input
                      type="text"
                      value={profileData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code *</label>
                    <input
                      type="text"
                      value={profileData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name *</label>
                    <input
                      type="text"
                      value={profileData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Branch Name *</label>
                    <input
                      type="text"
                      value={profileData.branchName}
                      onChange={(e) => handleInputChange('branchName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
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
                <div className="relative mb-6">
                  <div className="w-40 h-40 bg-gray-900 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    RK
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white border-2 border-gray-900 rounded-full p-3 hover:bg-gray-100 transition-colors">
                    <Camera className="h-6 w-6 text-gray-900" />
                  </button>
                </div>
                <button className="w-full bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Upload className="h-5 w-5" />
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Verification Status */}
            {profileData.isVerified && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900 mb-2 text-lg">Verified Account</h4>
                    <p className="text-sm text-green-800 mb-1">
                      Your profile has been verified by our team
                    </p>
                    <p className="text-xs text-green-700">
                      Verified on: {profileData.verificationDate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Upload */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Documents
              </h3>
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Notary Certificate</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500">Uploaded & Verified</p>
                </div>
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Bar Council Certificate</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500">Uploaded & Verified</p>
                </div>
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">ID Proof</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500">Uploaded & Verified</p>
                </div>
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
                  <span className="font-bold">4.8/5.0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    <span className="text-sm font-medium">Sessions</span>
                  </div>
                  <span className="font-bold">68</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span className="text-sm font-medium">Reviews</span>
                  </div>
                  <span className="font-bold">45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
