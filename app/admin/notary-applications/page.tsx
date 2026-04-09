'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Search, CheckCircle2, XCircle, Clock, Mail, Phone,
  FileText, User, Loader2, AlertCircle, Eye, RefreshCw, AlertTriangle
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

interface NotaryApplication {
  id: string
  applicationNumber: string
  firstName: string
  middleName: string | null
  lastName: string
  email: string
  phone: string
  licenseNumber: string | null
  barCouncilNumber: string | null
  experience: string | null
  specialization: string | null
  location: string | null
  status: string
  appliedAt: string
  reviewedAt: string | null
}

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
type ModalType = 'approve' | 'reject' | null

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ApproveModal({
  app,
  loading,
  onConfirm,
  onCancel,
}: {
  app: NotaryApplication
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const fullName = [app.firstName, app.middleName, app.lastName].filter(Boolean).join(' ')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Approve Application?</h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          You are about to approve <span className="font-semibold text-gray-700">{fullName}</span> as a verified notary.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">{app.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Application</span><span className="font-mono text-gray-600">{app.applicationNumber}</span></div>
          {app.location && <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-gray-800">{app.location}</span></div>}
        </div>
        <p className="text-xs text-gray-400 text-center mb-5">
          Their role will be upgraded to <strong>Notary</strong> and they will receive a confirmation email.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Approve & Activate
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({
  app,
  loading,
  onConfirm,
  onCancel,
}: {
  app: NotaryApplication
  loading: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  const fullName = [app.firstName, app.middleName, app.lastName].filter(Boolean).join(' ')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Reject Application?</h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          You are rejecting the application from <span className="font-semibold text-gray-700">{fullName}</span>.
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Incomplete documents, Invalid Bar Council number…"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">This reason will be included in the rejection email sent to the applicant.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={loading || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject Application
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotaryApplicationsPage() {
  const [applications, setApplications] = useState<NotaryApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<NotaryApplication | null>(null)

  // Modal state
  const [modal, setModal] = useState<{ type: ModalType; app: NotaryApplication } | null>(null)

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await gql(`query {
        notaryApplications {
          id applicationNumber firstName middleName lastName email phone
          licenseNumber barCouncilNumber experience specialization location
          status appliedAt reviewedAt
        }
      }`)
      if (json.errors?.length) { setError(json.errors[0].message); return }
      setApplications(json.data?.notaryApplications ?? [])
    } catch {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [])

  const confirmApprove = async () => {
    if (!modal) return
    setActionLoading(true)
    try {
      const json = await gql(
        `mutation Approve($id: String!) { approveNotaryApplication(applicationId: $id) { id status } }`,
        { id: modal.app.id }
      )
      if (json.errors?.length) { setError(json.errors[0].message); return }
      setApplications(prev => prev.map(a => a.id === modal.app.id ? { ...a, status: 'APPROVED' } : a))
      if (selectedApp?.id === modal.app.id) setSelectedApp(prev => prev ? { ...prev, status: 'APPROVED' } : null)
      setModal(null)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const confirmReject = async (reason: string) => {
    if (!modal) return
    setActionLoading(true)
    try {
      const json = await gql(
        `mutation Reject($id: String!, $reason: String) { rejectNotaryApplication(applicationId: $id, reason: $reason) { id status } }`,
        { id: modal.app.id, reason }
      )
      if (json.errors?.length) { setError(json.errors[0].message); return }
      setApplications(prev => prev.map(a => a.id === modal.app.id ? { ...a, status: 'REJECTED' } : a))
      if (selectedApp?.id === modal.app.id) setSelectedApp(prev => prev ? { ...prev, status: 'REJECTED' } : null)
      setModal(null)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = applications.filter(a => {
    const matchStatus = activeFilter === 'ALL' || a.status === activeFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.applicationNumber.toLowerCase().includes(q) ||
      (a.phone ?? '').includes(q)
    return matchStatus && matchSearch
  })

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  }

  const TABS: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {modal?.type === 'approve' && (
        <ApproveModal
          app={modal.app}
          loading={actionLoading}
          onConfirm={confirmApprove}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'reject' && (
        <RejectModal
          app={modal.app}
          loading={actionLoading}
          onConfirm={confirmReject}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Notary Applications</h1>
                <p className="text-gray-300 mt-1">Review and approve notary applicants</p>
              </div>
            </div>
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: counts.ALL, color: 'text-gray-900' },
            { label: 'Pending', value: counts.PENDING, color: 'text-yellow-600' },
            { label: 'Approved', value: counts.APPROVED, color: 'text-green-600' },
            { label: 'Rejected', value: counts.REJECTED, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, email, or application number…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs">Clear</button>
                )}
              </div>
              <div className="flex overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveFilter(tab.value)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeFilter === tab.value
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {counts[tab.value] > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        activeFilter === tab.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {counts[tab.value]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                <p className="text-gray-500 text-sm">Loading applications…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No applications found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => {
                  const isPending = app.status === 'PENDING'
                  const fullName = [app.firstName, app.middleName, app.lastName].filter(Boolean).join(' ')
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-sm ${
                        selectedApp?.id === app.id ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-gray-400">{app.applicationNumber}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {app.status}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{fullName}</h3>
                          <p className="text-sm text-gray-500">{app.email}</p>
                          <p className="text-xs text-gray-400 mt-1">Applied: {formatDate(app.appliedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          {isPending && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setModal({ type: 'approve', app }) }}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setModal({ type: 'reject', app }) }}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedApp(selectedApp?.id === app.id ? null : app) }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              {selectedApp ? (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">Application Detail</h3>
                    <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                  </div>

                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedApp.firstName[0]}{selectedApp.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {[selectedApp.firstName, selectedApp.middleName, selectedApp.lastName].filter(Boolean).join(' ')}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[selectedApp.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {selectedApp.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />{selectedApp.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />{selectedApp.phone}
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Application ID</p>
                        <p className="font-mono text-xs text-gray-500">{selectedApp.applicationNumber}</p>
                      </div>
                    </div>
                    {selectedApp.barCouncilNumber && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Bar Council No.</p>
                          <p className="font-mono text-xs text-gray-500">{selectedApp.barCouncilNumber}</p>
                        </div>
                      </div>
                    )}
                    {selectedApp.experience && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />{selectedApp.experience} years experience
                      </div>
                    )}
                    {selectedApp.specialization && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Specialization</p>
                          <p className="text-gray-500">{selectedApp.specialization}</p>
                        </div>
                      </div>
                    )}
                    {selectedApp.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4 text-gray-400" />{selectedApp.location}
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-100 text-xs text-gray-400">
                      <p>Applied: {formatDate(selectedApp.appliedAt)}</p>
                      {selectedApp.reviewedAt && <p>Reviewed: {formatDate(selectedApp.reviewedAt)}</p>}
                    </div>
                  </div>

                  {selectedApp.status === 'PENDING' && (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setModal({ type: 'approve', app: selectedApp })}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve & Activate
                      </button>
                      <button
                        onClick={() => setModal({ type: 'reject', app: selectedApp })}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Application
                      </button>
                    </div>
                  )}

                  {selectedApp.status === 'APPROVED' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-green-800">Application Approved</p>
                      <p className="text-xs text-green-600 mt-1">Notary has been notified via email</p>
                    </div>
                  )}

                  {selectedApp.status === 'REJECTED' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-red-800">Application Rejected</p>
                      <p className="text-xs text-red-600 mt-1">Applicant has been notified via email</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Select an application to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
