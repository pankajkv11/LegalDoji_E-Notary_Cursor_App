'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Bell, Shield, Eye, EyeOff, Lock,
  CheckCircle, AlertCircle, Loader2, Save, Smartphone,
  Mail, Toggle, LogOut
} from 'lucide-react'
import { getToken, saveToken } from '@/lib/auth'

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

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function NotarySettingsPage() {
  // Notification prefs (stored in localStorage — no backend table yet)
  const [notifs, setNotifs] = useState({
    newAppointment: true,
    appointmentReminder: true,
    payoutProcessed: true,
    newReview: true,
    systemUpdates: false,
  })

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [pwStatus, setPwStatus] = useState<SaveStatus>('idle')
  const [pwError, setPwError] = useState<string | null>(null)

  // Account info
  const [email, setEmail] = useState('')
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  useEffect(() => {
    // Load notification prefs from localStorage
    try {
      const saved = localStorage.getItem('notary_notif_prefs')
      if (saved) setNotifs(JSON.parse(saved))
    } catch { /* ignore */ }

    // Fetch email from profile
    gql(`query { myNotaryProfile { email } }`)
      .then(json => {
        const e = json.data?.myNotaryProfile?.email
        if (e) setEmail(e)
      })
      .catch(() => {/* ignore */})
  }, [])

  const saveNotifPrefs = (updated: typeof notifs) => {
    setNotifs(updated)
    localStorage.setItem('notary_notif_prefs', JSON.stringify(updated))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.newPw.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }
    setPwStatus('saving')
    try {
      const json = await gql(
        `mutation ChangePw($input: ChangePasswordInput!) { changePassword(input: $input) }`,
        { input: { currentPassword: pwForm.current, newPassword: pwForm.newPw } }
      )
      if (json.errors?.length) {
        setPwError(json.errors[0].message ?? 'Failed to change password')
        setPwStatus('error')
        return
      }
      setPwStatus('saved')
      setPwForm({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setPwStatus('idle'), 3000)
    } catch {
      setPwError('Network error. Please try again.')
      setPwStatus('error')
    }
  }

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) return
    try {
      await gql(`mutation { logout }`)
    } catch { /* ignore */ }
    saveToken('')
    window.location.href = '/login'
  }

  const inputCls = 'w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link href="/notary/dashboard" className="text-gray-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-gray-300 text-sm mt-1">Manage your account preferences and security</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Notification Preferences ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Choose what you want to be notified about</p>
            </div>
          </div>

          <div className="space-y-4">
            {([
              { key: 'newAppointment',      label: 'New appointment request',       desc: 'When a client books an appointment with you' },
              { key: 'appointmentReminder', label: 'Appointment reminders',          desc: '1 hour before each confirmed appointment' },
              { key: 'payoutProcessed',     label: 'Payout processed',              desc: 'When your payout request is completed' },
              { key: 'newReview',           label: 'New review received',           desc: 'When a client leaves a review after a session' },
              { key: 'systemUpdates',       label: 'Platform updates & news',       desc: 'Product announcements and feature releases' },
            ] as { key: keyof typeof notifs; label: string; desc: string }[]).map(item => (
              <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => saveNotifPrefs({ ...notifs, [item.key]: !notifs[item.key] })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    notifs[item.key] ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      notifs[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
            <Smartphone className="h-3.5 w-3.5" />
            Email notifications go to: <span className="font-semibold">{email || '—'}</span>
          </p>
        </div>

        {/* ── Security ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-2.5 rounded-xl">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500">Manage your password and account security</p>
            </div>
          </div>

          {/* Change password */}
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <h3 className="text-base font-semibold text-gray-900">Change Password</h3>

            {pwError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {pwError}
              </div>
            )}

            {([
              { field: 'current', label: 'Current Password', key: 'current' as const },
              { field: 'newPw',   label: 'New Password',     key: 'newPw' as const },
              { field: 'confirm', label: 'Confirm New Password', key: 'confirm' as const },
            ]).map(({ field, label, key }) => (
              <div key={field}>
                <label className={labelCls}>{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPw[key] ? 'text' : 'password'}
                    value={pwForm[key as keyof typeof pwForm]}
                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw({ ...showPw, [key]: !showPw[key] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={pwStatus === 'saving'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                pwStatus === 'saved'
                  ? 'bg-green-600 text-white'
                  : pwStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50'
              }`}
            >
              {pwStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>}
              {pwStatus === 'saved'  && <><CheckCircle className="h-4 w-4" />Password Changed!</>}
              {pwStatus === 'error'  && <><AlertCircle className="h-4 w-4" />Failed</>}
              {pwStatus === 'idle'   && <><Save className="h-4 w-4" />Update Password</>}
            </button>
          </form>

          {/* 2FA */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 mt-0.5">Add extra security to your account via OTP on login</p>
              </div>
              <button
                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
                  twoFAEnabled ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${twoFAEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {twoFAEnabled && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                OTP will be sent to {email || 'your registered email'} on every login
              </p>
            )}
          </div>
        </div>

        {/* ── Account ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">Email Address</p>
                <p className="text-xs text-gray-500 mt-0.5">{email || '—'}</p>
              </div>
              <Link href="/notary/profile" className="text-xs text-blue-600 hover:underline">
                Change in Profile →
              </Link>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">Profile & Bank Details</p>
                <p className="text-xs text-gray-500 mt-0.5">Name, location, consultation fee, bank account</p>
              </div>
              <Link href="/notary/profile" className="text-xs text-blue-600 hover:underline">
                Edit Profile →
              </Link>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-red-600">Sign Out</p>
                <p className="text-xs text-gray-500 mt-0.5">Log out of your notary account</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
