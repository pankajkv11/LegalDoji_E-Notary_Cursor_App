'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Calendar, Video, DollarSign, CheckCircle, XCircle, Clock, User,
  Phone, Mail, FileText, Award, TrendingUp, MessageSquare,
  AlertCircle, Star, Briefcase, Loader2, Settings
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

interface Appointment {
  id: string
  userId: string
  notaryId: string
  documentType: string | null
  scheduledDate: string
  scheduledTime: string
  status: string
  amount: number
  meetingLink: string | null
  notes: string | null
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  createdAt: string
}

interface NotaryProfile {
  id: string
  fullName: string
  rating: number
  reviewsCount: number
  completedSessions: number
  consultationFee: number
  isVerified: boolean
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [timePart, period] = timeStr.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  const dt = new Date(dateStr)
  dt.setHours(h, m, 0, 0)
  return dt
}

function hoursUntil(dateStr: string, timeStr: string): number {
  return (parseDateTime(dateStr, timeStr).getTime() - Date.now()) / 3_600_000
}

function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function NotaryDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [pendingApts, setPendingApts] = useState<Appointment[]>([])
  const [confirmedApts, setConfirmedApts] = useState<Appointment[]>([])
  const [completedApts, setCompletedApts] = useState<Appointment[]>([])
  const [profile, setProfile] = useState<NotaryProfile | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const json = await gql(`query {
          myNotaryProfile {
            id fullName rating reviewsCount completedSessions consultationFee isVerified
          }
          pending: notaryAppointments(status: "PENDING") {
            id userId notaryId documentType scheduledDate scheduledTime status amount
            meetingLink notes clientName clientEmail clientPhone createdAt
          }
          confirmed: notaryAppointments(status: "CONFIRMED") {
            id userId notaryId documentType scheduledDate scheduledTime status amount
            meetingLink notes clientName clientEmail clientPhone createdAt
          }
          completed: notaryAppointments(status: "COMPLETED") {
            id documentType scheduledDate scheduledTime amount clientName createdAt
          }
        }`)
        setProfile(json.data?.myNotaryProfile ?? null)
        setPendingApts(json.data?.pending ?? [])
        setConfirmedApts(json.data?.confirmed ?? [])
        setCompletedApts(json.data?.completed ?? [])
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAccept = async (appointmentId: string) => {
    if (!confirm('Accept this appointment?')) return
    setActionLoading(appointmentId)
    try {
      const json = await gql(
        `mutation Accept($id: String!) { acceptAppointment(appointmentId: $id) { id status } }`,
        { id: appointmentId }
      )
      if (json.errors?.length) {
        alert(json.errors[0].message)
        return
      }
      setPendingApts(prev => prev.filter(a => a.id !== appointmentId))
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (appointmentId: string) => {
    const reason = prompt('Reason for declining (sent to client):')
    if (!reason) return
    setActionLoading(appointmentId)
    try {
      const json = await gql(
        `mutation Reject($id: String!, $reason: String) { rejectAppointment(appointmentId: $id, reason: $reason) { id status } }`,
        { id: appointmentId, reason }
      )
      if (json.errors?.length) {
        alert(json.errors[0].message)
        return
      }
      setPendingApts(prev => prev.filter(a => a.id !== appointmentId))
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Earnings computed from completed appointments
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const totalEarnings = completedApts.reduce((s, a) => s + a.amount, 0)
  const monthEarnings = completedApts.filter(a => a.scheduledDate >= monthStartStr).reduce((s, a) => s + a.amount, 0)
  const weekEarnings = completedApts.filter(a => a.scheduledDate >= weekStartStr).reduce((s, a) => s + a.amount, 0)
  const todayEarnings = completedApts.filter(a => a.scheduledDate === todayStr).reduce((s, a) => s + a.amount, 0)

  const stats = [
    { name: "Today's Earnings", value: formatCurrency(todayEarnings), icon: DollarSign, color: 'bg-green-500', trend: `${completedApts.filter(a => a.scheduledDate === todayStr).length} sessions` },
    { name: 'Pending Appointments', value: String(pendingApts.length), icon: Clock, color: 'bg-yellow-500', trend: 'Awaiting action' },
    { name: 'Confirmed Today', value: String(confirmedApts.filter(a => a.scheduledDate === todayStr).length), icon: CheckCircle, color: 'bg-blue-500', trend: 'Ready to start' },
    { name: 'Average Rating', value: profile ? `${profile.rating.toFixed(1)}` : '—', icon: Star, color: 'bg-purple-500', trend: `${profile?.reviewsCount ?? 0} reviews` },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-gray-300 text-lg">
                {profile ? `Welcome, ${profile.fullName}` : 'Manage your appointments and track earnings'}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link href="/notary/availability" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">Availability</div>
              </Link>
              <Link href="/notary/profile" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105">
                <User className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">My Profile</div>
              </Link>
              <Link href="/notary/sessions" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105">
                <Video className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">Sessions</div>
              </Link>
              <Link href="/notary/earnings" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105">
                <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">Earnings</div>
              </Link>
              <Link href="/notary/payouts" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105">
                <DollarSign className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">Payouts</div>
              </Link>
              <Link href="/notary/settings" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105">
                <Settings className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">Settings</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
            )
          })}
        </div>

        {/* Pending Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-gray-700" />
              Pending Appointment Requests
            </h2>
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
              {pendingApts.length} pending
            </span>
          </div>

          {pendingApts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No pending appointment requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApts.map((apt) => {
                const hrs = hoursUntil(apt.scheduledDate, apt.scheduledTime)
                const canAct = hrs >= 4
                const isActing = actionLoading === apt.id
                return (
                  <div key={apt.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6 hover:border-yellow-400 transition-all">
                    {!canAct && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">
                          Appointment is less than 4 hours away — accept/decline disabled. Contact client directly if needed.
                        </p>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-500">{apt.id.slice(0, 8).toUpperCase()}</span>
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">PENDING APPROVAL</span>
                          {!canAct && <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">&lt; 4 HOURS</span>}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{apt.documentType || 'Document Notarization'}</h3>
                        <p className="text-sm text-gray-600">Scheduled: {formatDate(apt.scheduledDate)} at {apt.scheduledTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(apt.amount)}</p>
                        <p className="text-xs text-gray-500">Session fee</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Client Name</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          {apt.clientName || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          {apt.clientPhone || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-600" />
                          {apt.clientEmail || '—'}
                        </p>
                      </div>
                      {apt.meetingLink && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Meeting Link</p>
                          <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Join Link
                          </a>
                        </div>
                      )}
                    </div>

                    {apt.notes && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Client Notes:</p>
                        <p className="text-sm text-blue-800">{apt.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAccept(apt.id)}
                        disabled={!canAct || isActing}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                          canAct && !isActing
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isActing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                        Accept Appointment
                      </button>
                      <button
                        onClick={() => handleDecline(apt.id)}
                        disabled={!canAct || isActing}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                          canAct && !isActing
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isActing ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                        Decline
                      </button>
                    </div>

                    {!canAct && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Accept/Decline disabled — appointment is less than 4 hours away
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Earnings Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-gray-700" />
            Earnings Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Today&apos;s Earnings</p>
              <p className="text-3xl font-bold mb-2">{formatCurrency(todayEarnings)}</p>
              <p className="text-xs opacity-75">{completedApts.filter(a => a.scheduledDate === todayStr).length} sessions</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(weekEarnings)}</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>{completedApts.filter(a => a.scheduledDate >= weekStartStr).length} sessions</span>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(monthEarnings)}</p>
              <p className="text-xs text-gray-500">{completedApts.filter(a => a.scheduledDate >= monthStartStr).length} sessions</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalEarnings)}</p>
              <p className="text-xs text-gray-500">{completedApts.length} sessions all time</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Confirmed Appointments + Recent Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-gray-700" />
                Confirmed Appointments
              </h2>
              {confirmedApts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No confirmed appointments</p>
              ) : (
                <div className="space-y-3">
                  {confirmedApts.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">{apt.id.slice(0, 8).toUpperCase()}</span>
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">CONFIRMED</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{apt.documentType || 'Document Notarization'}</h3>
                          <p className="text-sm text-gray-600">Client: {apt.clientName || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{formatDate(apt.scheduledDate)} at {apt.scheduledTime}</p>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(apt.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-gray-700" />
                Recent Completed Sessions
              </h2>
              {completedApts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No completed sessions yet</p>
              ) : (
                <div className="space-y-4">
                  {completedApts.slice(0, 5).map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono text-gray-500">{session.id.slice(0, 8).toUpperCase()}</span>
                          <h3 className="font-semibold text-gray-900">{session.documentType || 'Document Notarization'}</h3>
                          <p className="text-sm text-gray-600">Client: {session.clientName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{formatDate(session.scheduledDate)} at {session.scheduledTime}</p>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(session.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-gray-700" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Average Rating</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{profile ? `${profile.rating.toFixed(1)}/5.0` : '—'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Total Sessions</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{profile?.completedSessions ?? completedApts.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Total Reviews</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{profile?.reviewsCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Consultation Fee</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{profile ? formatCurrency(profile.consultationFee) : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
