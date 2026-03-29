'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, DollarSign, TrendingUp, Calendar, CheckCircle,
  AlertCircle, Loader2, FileText, User, Download
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
  documentType: string | null
  scheduledDate: string
  scheduledTime: string
  amount: number
  clientName: string | null
}

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function NotaryEarningsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const json = await gql(`query {
          notaryAppointments(status: "COMPLETED") {
            id documentType scheduledDate scheduledTime amount clientName
          }
        }`)
        setSessions(json.data?.notaryAppointments ?? [])
      } catch {
        setError('Failed to load earnings data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const total = sessions.reduce((s, a) => s + a.amount, 0)
  const thisMonth = sessions.filter(a => a.scheduledDate >= monthStartStr).reduce((s, a) => s + a.amount, 0)
  const thisWeek = sessions.filter(a => a.scheduledDate >= weekStartStr).reduce((s, a) => s + a.amount, 0)
  const today = sessions.filter(a => a.scheduledDate === todayStr).reduce((s, a) => s + a.amount, 0)

  // Build monthly breakdown
  const monthMap: Record<string, { label: string; amount: number; count: number }> = {}
  for (const s of sessions) {
    const key = s.scheduledDate.slice(0, 7) // YYYY-MM
    if (!monthMap[key]) {
      monthMap[key] = { label: monthLabel(s.scheduledDate), amount: 0, count: 0 }
    }
    monthMap[key].amount += s.amount
    monthMap[key].count += 1
  }
  const months = Object.entries(monthMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)

  const maxMonthAmount = Math.max(...months.map(([, v]) => v.amount), 1)

  // Filter sessions by selected month
  const displaySessions = selectedMonth === 'ALL'
    ? [...sessions].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
    : sessions.filter(s => s.scheduledDate.startsWith(selectedMonth))
        .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading earnings…</p>
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
              <h1 className="text-3xl font-bold">Earnings</h1>
              <p className="text-gray-300 text-sm mt-1">Track your income from completed sessions</p>
            </div>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Today", value: formatCurrency(today), sub: `${sessions.filter(s => s.scheduledDate === todayStr).length} sessions` },
              { label: "This Week", value: formatCurrency(thisWeek), sub: `${sessions.filter(s => s.scheduledDate >= weekStartStr).length} sessions` },
              { label: "This Month", value: formatCurrency(thisMonth), sub: `${sessions.filter(s => s.scheduledDate >= monthStartStr).length} sessions` },
              { label: "All Time", value: formatCurrency(total), sub: `${sessions.length} sessions total` },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
                <p className="text-sm text-gray-300 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No earnings yet</h3>
            <p className="text-gray-500 text-sm">Complete sessions to see your earnings here.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Monthly chart */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-700" />
                    Monthly Breakdown
                  </h2>
                  <button
                    onClick={() => {
                      const csv = ['Month,Sessions,Earnings',
                        ...months.map(([k, v]) => `${v.label},${v.count},${v.amount}`)
                      ].join('\n')
                      const a = document.createElement('a')
                      a.href = 'data:text/csv,' + encodeURIComponent(csv)
                      a.download = 'earnings.csv'
                      a.click()
                    }}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>

                {months.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No monthly data yet</p>
                ) : (
                  <div className="space-y-3">
                    {months.map(([key, m]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedMonth(selectedMonth === key ? 'ALL' : key)}
                        className={`w-full text-left group transition-all ${selectedMonth === key ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${selectedMonth === key ? 'text-gray-900' : 'text-gray-700'}`}>
                            {m.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{m.count} sessions</span>
                            <span className="text-sm font-bold text-green-600">{formatCurrency(m.amount)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${selectedMonth === key ? 'bg-gray-900' : 'bg-green-500 group-hover:bg-green-600'}`}
                            style={{ width: `${(m.amount / maxMonthAmount) * 100}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Session list */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-gray-700" />
                    {selectedMonth === 'ALL' ? 'All Completed Sessions' : `Sessions — ${monthMap[selectedMonth]?.label ?? selectedMonth}`}
                  </h2>
                  {selectedMonth !== 'ALL' && (
                    <button onClick={() => setSelectedMonth('ALL')} className="text-xs text-gray-500 hover:text-gray-900 underline">
                      Show all
                    </button>
                  )}
                </div>

                {displaySessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sessions for this period</p>
                ) : (
                  <div className="space-y-3">
                    {displaySessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.documentType || 'Document Notarization'}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />{s.clientName || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{formatDate(s.scheduledDate)} · {s.scheduledTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-base font-bold text-green-600 flex-shrink-0">{formatCurrency(s.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Average per session */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Total Sessions', value: sessions.length, fmt: (v: number) => String(v) },
                    { label: 'Avg. Per Session', value: sessions.length ? Math.round(total / sessions.length) : 0, fmt: formatCurrency },
                    { label: 'Best Month', value: months.length ? Math.max(...months.map(([, v]) => v.amount)) : 0, fmt: formatCurrency },
                    { label: 'This Month Sessions', value: sessions.filter(s => s.scheduledDate >= monthStartStr).length, fmt: (v: number) => String(v) },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.fmt(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top document types */}
              {(() => {
                const typeMap: Record<string, { count: number; amount: number }> = {}
                for (const s of sessions) {
                  const t = s.documentType || 'General'
                  if (!typeMap[t]) typeMap[t] = { count: 0, amount: 0 }
                  typeMap[t].count += 1
                  typeMap[t].amount += s.amount
                }
                const types = Object.entries(typeMap).sort((a, b) => b[1].amount - a[1].amount).slice(0, 5)
                if (types.length === 0) return null
                return (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Top Document Types</h3>
                    <div className="space-y-3">
                      {types.map(([type, data]) => (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium truncate max-w-[60%]">{type}</span>
                            <span className="text-green-600 font-semibold">{formatCurrency(data.amount)}</span>
                          </div>
                          <p className="text-xs text-gray-400">{data.count} session{data.count !== 1 ? 's' : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
