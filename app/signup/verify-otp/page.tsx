'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Phone, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { useMutation, gql } from '@apollo/client'
import { setAuthTokens } from '@/lib/auth'

const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        name
        email
        phone
        role
        status
        emailVerified
        phoneVerified
        permissions
      }
    }
  }
`

const RESEND_OTP_MUTATION = gql`
  mutation ResendOtp($tempToken: String!) {
    resendOtp(tempToken: $tempToken) {
      success
      message
      tempToken
      expiresIn
    }
  }
`

function OTPVerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get params from URL
  const initialToken = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''
  const phone = searchParams.get('phone') || ''
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  
  // Store current token in state (can be updated by resend)
  const [currentToken, setCurrentToken] = useState(initialToken)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [verifyOtp, { loading: verifyLoading }] = useMutation(VERIFY_OTP_MUTATION, {
    onCompleted: (data) => {
      if (data.verifyOtp) {
        setAuthTokens(
          data.verifyOtp.accessToken,
          data.verifyOtp.refreshToken,
          data.verifyOtp.user
        )
        setSuccess('Account verified successfully! Redirecting...')
        setTimeout(() => {
          const target = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
          router.push(target)
        }, 1500)
      }
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  const [resendOtp, { loading: resendLoading }] = useMutation(RESEND_OTP_MUTATION, {
    onCompleted: (data) => {
      if (data.resendOtp?.success) {
        // Update token if new one is provided (JWT tokens have expiry)
        if (data.resendOtp.tempToken) {
          setCurrentToken(data.resendOtp.tempToken)
        }
        setSuccess(data.resendOtp.message)
        setResendCooldown(60) // 60 second cooldown
        setTimeout(() => setSuccess(null), 3000)
      }
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Redirect if no token
  useEffect(() => {
    if (!currentToken && !initialToken) {
      router.push('/signup')
    }
  }, [currentToken, initialToken, router])

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp]
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      // Focus last filled input or last input
      const lastIndex = Math.min(pastedData.length - 1, 5)
      inputRefs.current[lastIndex]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    await verifyOtp({
      variables: {
        input: {
          tempToken: currentToken,
          otp: otpString
        }
      }
    })
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return
    setError(null)
    
    await resendOtp({
      variables: {
        tempToken: currentToken
      }
    })
  }

  // Mask email for display
  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : ''
  // Mask phone for display
  const maskedPhone = phone ? phone.replace(/(.{3})(.*)(.{4})/, '$1****$3') : ''

  if (!currentToken) {
    return null // Will redirect
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify Your Account
          </h2>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code sent to your phone
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Contact Info Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">OTP sent to <strong>{maskedPhone}</strong></span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2 text-gray-700 mt-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Email: <strong>{maskedEmail}</strong></span>
              </div>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    disabled={verifyLoading || !!success}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500 text-center">
                For testing, use OTP: <strong>123456</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={verifyLoading || !!success}
              className="w-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              {verifyLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Verified!
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading || !!success}
                className="text-primary-600 hover:text-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend OTP
                  </>
                )}
              </button>
            </p>
          </div>
        </div>

        {/* Back to Signup Link */}
        <p className="mt-6 text-center text-gray-600">
          Need to change your details?{' '}
          <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
            Back to Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-xl" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    }>
      <OTPVerificationForm />
    </Suspense>
  )
}
