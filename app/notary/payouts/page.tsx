'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, DollarSign, Building2, CreditCard, CheckCircle,
  Clock, AlertCircle, Loader2, Info, ArrowDownToLine, Calendar
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

interface Session {
  id: string
  scheduledDate: string
  amount: number
  documentType: string | null
  clientName: string | null
}

interface NotaryProfile {
  fullName: string
  bankAccountHolder: string | null
  bankAccountNumber: string | null
  bankIfsc: string | null
  bankName: string | null
  bankBranch: string | null
}

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function maskAccount(num: string | null) {
  if (!num || num.length < 4) return '****'
  return '•'.repeat(num.length - 4) + num.slice(-4)
}

export default function NotaryPayoutsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [profile, setProfile] = useState<NotaryProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const json = await gql(`query {
          myNotaryProfile {
            fullName bankAccountHolder bankAccountNumber bankIfsc bankName bankBranch
          }
          notaryAppointments(status: "COMPLETED") {
            id scheduledDate amount documentType clientName
          }
        }`)
        setProfile(json.data?.myNotaryProfile ?? null)
        setSessions(json.data?.notaryAppointments ?? [])
      } catch {
        setError('Failed to load payout data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const now = new Date()
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  // Simulate: sessions in previous months are "paid out", this month is "pending"
  const paid = sessions.filter(s => s.scheduledDate < monthStartStr)
  const pending = sessions.filter(s => s.scheduledDate >= monthStartStr)

  const pendingAmount = pending.reduce((s, a) => s + a.amount, 0)
  const paidAmount = paid.reduce((s, a) => s + a.amount, 0)
  const totalAmount = sessions.reduce((s, a) => s + a.amount, 0)

  const hasBankDetails = !!(profile?.bankAccountNumber && profile?.bankIfsc)

  const handleRequestPayout = async () => {
    if (!hasBankDetails) {
      alert('Please add your bank details in Profile settings before requesting a payout.')
      return
    }
    if (pendingAmount === 0) {
      alert('No pending earnings to payout.')
      return
    }
    setRequesting(true)
    try {
      const json = await gql(
        `mutation RequestPayout($amount: Int!) { requestPayout(amount: $amount) }`,
        { amount: pendingAmount }
      )
      if (json.errors?.length) {
        alert(json.errors[0].message ?? 'Payout request failed.')
        return
      }
      setRequestSent(true)
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading payout info…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/notary/dashboard" className="text-gray-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Payouts</h1>
              <p className="text-gray-300 text-sm mt-1">Manage your earnings and withdrawal requests</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-5">
              <p className="text-sm text-yellow-200 mb-1">Pending Payout</p>
              <p className="text-3xl font-bold">{formatCurrency(pendingAmount)}</p>
              <p className="text-xs text-yellow-300 mt-1">{pending.length} sessions this month</p>
            </div>
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-5">
              <p className="text-sm text-green-200 mb-1">Total Paid Out</p>
              <p className="text-3xl font-bold">{formatCurrency(paidAmount)}</p>
              <p className="text-xs text-green-300 mt-1">{paid.length} sessions settled</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-5">
              <p className="text-sm text-gray-300 mb-1">Lifetime Earnings</p>
              <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">{sessions.length} total sessions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: request payout + history */}
          <div className="lg:col-span-2 space-y-6">

            {/* Request payout card */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5 text-gray-700" />
                Request Payout
              </h2>

              {requestSent ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-green-900 mb-2">Payout Requested!</h3>
                  <p className="text-green-700 text-sm">
                    Your payout of <strong>{formatCurrency(pendingAmount)}</strong> has been requested.
                    Funds will be credited to your bank account within 2–3 business days.
                  </p>
                  <button
                    onClick={() => setRequestSent(false)}
                    className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
                  >
                    Request again
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">Payout Policy</p>
                      <ul className="space-y-1 text-gray-600 list-disc list-inside">
                        <li>Payouts are processed within 2–3 business days</li>
                        <li>Minimum payout amount: ₹500</li>
                        <li>Bank details must be saved in your profile</li>
                        <li>Only completed sessions are eligible for payout</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Available for payout</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pending.length} sessions this month</p>
                    </div>
                    {!hasBankDetails && (
                      <div className="text-right">
                        <p className="text-xs text-red-600 font-semibold mb-1">No bank details</p>
                        <Link
                          href="/notary/profile"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Add in Profile →
                        </Link>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleRequestPayout}
                    disabled={requesting || pendingAmount === 0 || !hasBankDetails}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requesting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" />Processing…</>
                    ) : (
                      <><ArrowDownToLine className="h-5 w-5" />Request Payout of {formatCurrency(pendingAmount)}</>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Payout history */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-700" />
                Payout History
              </h2>

              {paid.length === 0 ? (
                <div className="text-center py-10">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No payouts processed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Group by month */}
                  {(() => {
                    const grouped: Record<string, Session[]> = {}
                    for (const s of paid) {
                      const key = s.scheduledDate.slice(0, 7)
                      if (!grouped[key]) grouped[key] = []
                      grouped[key].push(s)
                    }
                    return Object.entries(grouped)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([key, items]) => {
                        const monthTotal = items.reduce((s, a) => s + a.amount, 0)
                        const label = new Date(key + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                        return (
                          <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between bg-green-50 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-gray-900 text-sm">{label}</span>
                                <span className="text-xs text-gray-500">{items.length} sessions</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-green-600">{formatCurrency(monthTotal)}</span>
                                <span className="block text-xs text-green-600">Paid</span>
                              </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                              {items.map(s => (
                                <div key={s.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                  <div>
                                    <p className="font-medium text-gray-800">{s.documentType || 'Document Notarization'}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                      <Calendar className="h-3 w-3" />{formatDate(s.scheduledDate)}
                                      {s.clientName ? ` · ${s.clientName}` : ''}
                                    </p>
                                  </div>
                                  <span className="font-semibold text-gray-700">{formatCurrency(s.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Right: bank details */}
          <div>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-700" />
                Bank Account
              </h3>

              {hasBankDetails ? (
                <div className="space-y-3">
                  {[
                    { label: 'Account Holder', value: profile?.bankAccountHolder },
                    { label: 'Account Number', value: maskAccount(profile?.bankAccountNumber ?? null) },
                    { label: 'IFSC Code', value: profile?.bankIfsc },
                    { label: 'Bank', value: profile?.bankName },
                    { label: 'Branch', value: profile?.bankBranch },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-semibold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                  <Link
                    href="/notary/profile"
                    className="flex items-center justify-center gap-2 w-full mt-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg py-2 transition-all hover:bg-gray-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    Update Bank Details
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    No bank details added yet. Add your bank account to receive payouts.
                  </p>
                  <Link
                    href="/notary/profile"
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                  >
                    <Building2 className="h-4 w-4" />
                    Add Bank Details
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
