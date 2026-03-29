'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  UserCheck, Shield, ArrowLeft, Search,
  Star, MapPin, Briefcase, Award, CheckCircle2,
  XCircle, Eye, Trash2, FileText, ChevronDown,
  Phone, Mail, AlertTriangle, Loader2, RefreshCw
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

interface Notary {
  id: string
  userId: string
  fullName: string
  email: string
  phone: string
  licenseNumber: string
  barCouncilNumber: string
  barCouncilState: string
  experience: number
  specialization: string[]
  location: string
  consultationFee: number
  rating: number
  reviewsCount: number
  completedSessions: number
  bio: string | null
  isVerified: boolean
  verificationDate: string | null
  createdAt: string
  updatedAt: string
}

type TabType = 'notaries' | 'applications'

const statusBadge = (isVerified: boolean) =>
  isVerified
    ? <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="h-3 w-3" />Verified</span>
    : <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" />Unverified</span>

export default function NotaryManagementPage() {
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'true' | 'false'>('all')
  const [activeTab, setActiveTab] = useState<TabType>('notaries')
  const [selectedNotary, setSelectedNotary] = useState<Notary | null>(null)

  const fetchNotaries = async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await gql(`
        query AdminNotaries($search: String, $isVerified: Boolean) {
          adminListNotaries(search: $search, isVerified: $isVerified) {
            id userId fullName email phone licenseNumber barCouncilNumber
            barCouncilState experience specialization location consultationFee
            rating reviewsCount completedSessions bio isVerified verificationDate
            createdAt updatedAt
          }
        }
      `, {
        search: search || null,
        isVerified: verifiedFilter === 'all' ? null : verifiedFilter === 'true',
      })
      if (json.errors?.length) { setError(json.errors[0].message); return }
      setNotaries(json.data?.adminListNotaries ?? [])
    } catch {
      setError('Failed to load notaries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotaries() }, [verifiedFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchNotaries(), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleToggleVerification = async (id: string, current: boolean) => {
    const action = current ? 'suspend' : 'verify'
    if (!confirm(`Are you sure you want to ${action} this notary?`)) return
    setActionLoading(id)
    try {
      const json = await gql(
        `mutation UpdateNotary($id: String!, $isVerified: Boolean!) { adminUpdateNotaryStatus(notaryId: $id, isVerified: $isVerified) { id isVerified } }`,
        { id, isVerified: !current }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      setNotaries(prev => prev.map(n => n.id === id ? { ...n, isVerified: !current } : n))
      if (selectedNotary?.id === id) setSelectedNotary(prev => prev ? { ...prev, isVerified: !current } : null)
    } catch { alert('Network error. Please try again.') }
    finally { setActionLoading(null) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notary? This action cannot be undone.')) return
    setActionLoading(id)
    try {
      const json = await gql(
        `mutation DeleteNotary($id: String!) { adminDeleteNotary(notaryId: $id) }`,
        { id }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      setNotaries(prev => prev.filter(n => n.id !== id))
      if (selectedNotary?.id === id) setSelectedNotary(null)
    } catch { alert('Network error. Please try again.') }
    finally { setActionLoading(null) }
  }

  const stats = {
    total: notaries.length,
    verified: notaries.filter(n => n.isVerified).length,
    unverified: notaries.filter(n => !n.isVerified).length,
  }

  const fmt = (dt: string | null) => dt
    ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7" />
                <div>
                  <h1 className="text-2xl font-bold">Notary Management</h1>
                  <p className="text-gray-300 text-sm">Manage verified notaries on the platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotaries}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/admin/notary-applications"
                className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm"
              >
                <FileText className="h-4 w-4" />
                Review Applications
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Notaries', value: loading ? '—' : stats.total, color: 'bg-gray-800' },
            { label: 'Verified', value: loading ? '—' : stats.verified, color: 'bg-green-600' },
            { label: 'Unverified', value: loading ? '—' : stats.unverified, color: 'bg-yellow-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`${s.color} p-3 rounded-lg`}><UserCheck className="h-6 w-6 text-white" /></div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-600 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-6">
          {/* Main Table */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, license or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <select
                  value={verifiedFilter}
                  onChange={e => setVerifiedFilter(e.target.value as 'all' | 'true' | 'false')}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notary</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">License</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={8} className="py-16 text-center">
                      <Loader2 className="h-8 w-8 text-gray-300 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading notaries…</p>
                    </td></tr>
                  ) : notaries.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-500">
                      <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium">No notaries found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </td></tr>
                  ) : notaries.map(n => {
                    const isActing = actionLoading === n.id
                    return (
                      <tr
                        key={n.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedNotary?.id === n.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedNotary(n)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {n.fullName.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{n.fullName}</p>
                              <p className="text-xs text-gray-500">{n.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-600">{n.licenseNumber}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[100px]">{n.location}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {n.specialization.slice(0, 2).map((s, i) => (
                              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                            {n.specialization.length > 2 && (
                              <span className="text-xs text-gray-400">+{n.specialization.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-gray-900">{n.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({n.reviewsCount})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{n.completedSessions}</td>
                        <td className="py-3 px-4">{statusBadge(n.isVerified)}</td>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedNotary(n)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                            <button
                              onClick={() => handleToggleVerification(n.id, n.isVerified)}
                              disabled={isActing}
                              className={`p-1.5 rounded transition-colors disabled:opacity-50 ${n.isVerified ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                              title={n.isVerified ? 'Suspend' : 'Verify'}
                            >
                              {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : n.isVerified ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(n.id)}
                              disabled={isActing}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
              {loading ? 'Loading…' : `${notaries.length} notaries`}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedNotary && (
            <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900">Notary Details</h3>
                <button onClick={() => setSelectedNotary(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {selectedNotary.fullName.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <h4 className="font-bold text-gray-900">{selectedNotary.fullName}</h4>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{selectedNotary.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({selectedNotary.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center justify-center mt-2">{statusBadge(selectedNotary.isVerified)}</div>
              </div>

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex items-center gap-3 text-gray-700"><Mail className="h-4 w-4 text-gray-400 flex-shrink-0" /><span className="break-all">{selectedNotary.email}</span></div>
                <div className="flex items-center gap-3 text-gray-700"><Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />{selectedNotary.phone}</div>
                <div className="flex items-center gap-3 text-gray-700"><MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />{selectedNotary.location}</div>
                <div className="flex items-center gap-3 text-gray-700"><Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />{selectedNotary.experience} years experience</div>
                <div className="flex items-start gap-3 text-gray-700">
                  <Award className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {selectedNotary.specialization.map((s, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700"><FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />{selectedNotary.completedSessions} sessions completed</div>
                <div className="text-xs text-gray-400 pt-1 border-t">
                  <p>License: <span className="font-mono">{selectedNotary.licenseNumber}</span></p>
                  <p className="mt-0.5">Bar Council: <span className="font-mono">{selectedNotary.barCouncilNumber}</span></p>
                  {selectedNotary.verificationDate && <p className="mt-0.5">Verified: {fmt(selectedNotary.verificationDate)}</p>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultation Fee</span>
                <span className="text-lg font-bold text-gray-900">₹{selectedNotary.consultationFee}</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleToggleVerification(selectedNotary.id, selectedNotary.isVerified)}
                  disabled={actionLoading === selectedNotary.id}
                  className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                    selectedNotary.isVerified
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {actionLoading === selectedNotary.id ? <Loader2 className="h-4 w-4 animate-spin" /> : selectedNotary.isVerified ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {selectedNotary.isVerified ? 'Suspend Notary' : 'Verify Notary'}
                </button>
                <button
                  onClick={() => handleDelete(selectedNotary.id)}
                  disabled={actionLoading === selectedNotary.id}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-red-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete Notary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
