'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Video, User, Phone, Mail, FileText,
  Clock, CheckCircle, XCircle, AlertCircle, Search, Loader2,
  ExternalLink, Filter
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
  status: string
  amount: number
  meetingLink: string | null
  notes: string | null
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  createdAt: string
}

type TabType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle },
  COMPLETED: { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200',    icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export default function NotarySessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabType>('ALL')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const fields = `id documentType scheduledDate scheduledTime status amount
          meetingLink notes clientName clientEmail clientPhone createdAt`
        const json = await gql(`query {
          all: notaryAppointments { ${fields} }
        }`)
        setSessions(json.data?.all ?? [])
      } catch {
        setError('Failed to load sessions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = sessions.filter(s => {
    if (tab !== 'ALL' && s.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (s.clientName ?? '').toLowerCase().includes(q) ||
        (s.documentType ?? '').toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleComplete = async (sessionId: string) => {
    if (!confirm('Mark this session as completed?')) return
    setCompleting(sessionId)
    try {
      const json = await gql(
        `mutation Complete($id: String!) { completeAppointment(appointmentId: $id) { id status } }`,
        { id: sessionId }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'COMPLETED' } : s))
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setCompleting(null)
    }
  }

  const counts = {
    ALL: sessions.length,
    PENDING: sessions.filter(s => s.status === 'PENDING').length,
    CONFIRMED: sessions.filter(s => s.status === 'CONFIRMED').length,
    COMPLETED: sessions.filter(s => s.status === 'COMPLETED').length,
    CANCELLED: sessions.filter(s => s.status === 'CANCELLED').length,
  }

  const tabs: TabType[] = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading sessions…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/notary/dashboard" className="text-gray-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">My Sessions</h1>
              <p className="text-gray-300 text-sm mt-1">All your appointment sessions in one place</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total', value: counts.ALL, color: 'bg-white/10' },
              { label: 'Pending', value: counts.PENDING, color: 'bg-yellow-500/20' },
              { label: 'Confirmed', value: counts.CONFIRMED, color: 'bg-blue-500/20' },
              { label: 'Completed', value: counts.COMPLETED, color: 'bg-green-500/20' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center`}>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-300 mt-1">{s.label}</p>
              </div>
            ))}
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

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name, document type, session ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400 mr-1" />
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t} ({counts[t]})
              </button>
            ))}
          </div>
        </div>

        {/* Sessions list */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No sessions found</h3>
            <p className="text-gray-500 text-sm">
              {tab === 'ALL' ? 'You have no sessions yet.' : `No ${tab.toLowerCase()} sessions.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(session => {
              const cfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG['PENDING']
              const StatusIcon = cfg.icon
              const isExpanded = expanded === session.id
              const isUpcoming = session.status === 'CONFIRMED'
              const isPending = session.status === 'PENDING'

              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-xl border-2 transition-all ${
                    isExpanded ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {/* Row header */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : session.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">{session.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${cfg.cls}`}>
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                          {isUpcoming && session.meetingLink && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2 py-0.5 rounded">
                              MEETING READY
                            </span>
                          )}
                          {isPending && (
                            <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold px-2 py-0.5 rounded">
                              ACTION NEEDED
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {session.documentType || 'Document Notarization'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {session.clientName || 'Unknown Client'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(session.scheduledDate)} at {session.scheduledTime}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-green-600">{formatCurrency(session.amount)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client Details</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{session.clientName || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{session.clientEmail || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{session.clientPhone || '—'}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Session Details</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{session.documentType || 'General Notarization'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(session.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{session.scheduledTime}</span>
                          </div>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-800 mb-1">Notes</p>
                          <p className="text-sm text-blue-700">{session.notes}</p>
                        </div>
                      )}

                      {session.meetingLink && (
                        <div className="mt-4">
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                          >
                            <Video className="h-4 w-4" />
                            Join Meeting
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <p className="text-xs text-gray-400 mt-1 ml-1">{session.meetingLink}</p>
                        </div>
                      )}

                      {session.status === 'CONFIRMED' && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleComplete(session.id)}
                            disabled={completing === session.id}
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                          >
                            {completing === session.id
                              ? <><Loader2 className="h-4 w-4 animate-spin" />Completing…</>
                              : <><CheckCircle className="h-4 w-4" />Mark as Completed</>}
                          </button>
                          <p className="text-xs text-gray-400 mt-1 ml-1">
                            Mark this session done once the notarization is finished
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>Session ID: {session.id}</span>
                        <span>Booked: {formatDate(session.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
