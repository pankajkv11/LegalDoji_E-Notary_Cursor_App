'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Phone, User, Lock, Eye, EyeOff, Chrome, CheckCircle } from 'lucide-react'
import { saveUser, saveToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

async function gql(query: string, variables: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'info' | 'otp' | 'password'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    acceptTerms: false,
  })

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const json = await gql(
        `mutation SendOtp($email: String, $phone: String) {
          sendOtp(email: $email, phone: $phone) { success message }
        }`,
        { email: formData.email, phone: formData.phone || null },
      )
      if (json.errors?.length) { setError(json.errors[0].message); return }
      const result = json.data?.sendOtp
      if (!result?.success) { setError(result?.message ?? 'Failed to send OTP.'); return }
      setStep('otp')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const json = await gql(
        `mutation VerifyOtp($contact: String!, $code: String!) {
          verifyOtp(contact: $contact, code: $code) { success message }
        }`,
        { contact: formData.phone, code: formData.otp },
      )
      if (json.errors?.length) { setError(json.errors[0].message); return }
      const result = json.data?.verifyOtp
      if (!result?.success) { setError(result?.message ?? 'Invalid OTP.'); return }
      setStep('password')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const json = await gql(
        `mutation Signup($input: SignupInput!) {
          signup(input: $input) {
            accessToken refreshToken expiresIn
            user { id name email phone role }
          }
        }`,
        {
          input: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            password: formData.password,
            acceptTerms: formData.acceptTerms,
          },
        },
      )
      if (json.errors?.length) { setError(json.errors[0].message); return }
      const payload = json.data?.signup
      if (!payload) { setError('Signup failed. Please try again.'); return }
      const roleMap: Record<string, 'user' | 'notary' | 'admin'> = {
        USER: 'user', NOTARY: 'notary', ADMIN: 'admin',
      }
      saveToken(payload.accessToken)
      saveUser({
        name: payload.user.name,
        email: payload.user.email,
        phone: payload.user.phone ?? '',
        role: roleMap[payload.user.role] ?? 'user',
      })
      router.push('/kyc')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setLoading(true)
    try {
      const json = await gql(
        `mutation SendOtp($email: String, $phone: String) {
          sendOtp(email: $email, phone: $phone) { success message }
        }`,
        { email: formData.email, phone: formData.phone || null },
      )
      const result = json.data?.sendOtp
      if (!result?.success) setError(result?.message ?? 'Failed to resend OTP.')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">LegalDoji</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-gray-600">Join thousands of users creating legal documents</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step === 'info' ? 'text-primary-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'}`}>
                {step === 'info' ? '1' : <CheckCircle className="h-5 w-5" />}
              </div>
              <span className="ml-2 text-sm font-medium">Basic Info</span>
            </div>
            <div className={`h-1 flex-1 mx-4 ${step !== 'info' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'otp' ? 'text-primary-600' : step === 'password' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'otp' ? 'bg-primary-600 text-white' : step === 'password' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step === 'password' ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Verify</span>
            </div>
            <div className={`h-1 flex-1 mx-4 ${step === 'password' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'password' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'password' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Password</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {step === 'info' && (
            <>
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 bg-gray-50 border-2 border-gray-200 text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed mb-6 relative"
                title="Google sign-up coming soon"
              >
                <Chrome className="h-5 w-5 opacity-50" />
                Sign up with Google
                <span className="absolute right-3 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Coming Soon</span>
              </button>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>
            </>
          )}

          <form
            onSubmit={step === 'info' ? handleInfoSubmit : step === 'otp' ? handleOtpSubmit : handlePasswordSubmit}
            className="space-y-4"
          >
            {step === 'info' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">Terms & Conditions</Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  {loading ? 'Sending OTP…' : 'Continue'}
                </button>
              </>
            )}

            {step === 'otp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <p className="text-sm text-gray-600 mb-4">
                    We&apos;ve sent a 6-digit verification code to{' '}
                    <strong>{formData.email}</strong>
                    {formData.phone && <> and <strong>{formData.phone}</strong></>}.
                  </p>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    placeholder="000000"
                    className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="text-center text-sm">
                  <span className="text-gray-600">Didn&apos;t receive code? </span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleResendOtp}
                    className="text-primary-600 hover:text-primary-700 font-semibold disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || formData.otp.length < 6}
                  className="w-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  {loading ? 'Verifying…' : 'Verify'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('info'); setError(null) }}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Back
                </button>
              </>
            )}

            {step === 'password' && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Email verified successfully!</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Password requirements:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• At least 8 characters</li>
                    <li>• One uppercase letter</li>
                    <li>• One number</li>
                    <li>• One special character</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
        </p>

        {step === 'password' && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Next step:</strong> Complete KYC verification to create notarized documents.{' '}
              <Link href="/kyc" className="font-semibold underline text-yellow-900 hover:text-yellow-700">
                Verify Now →
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
