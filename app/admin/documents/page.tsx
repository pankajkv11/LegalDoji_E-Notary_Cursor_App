'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText, Shield, ArrowLeft, Search, Download,
  Eye, Trash2, ChevronDown, UserCheck, Users,
  CheckCircle, Clock, AlertTriangle, XCircle,
  Calendar, Tag, BarChart3, FileCheck, Loader2, RefreshCw
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

type DocStatus = 'DRAFT' | 'IN_PROGRESS' | 'NOTARIZED' | 'COMPLETED' | 'CANCELLED'

interface AdminDoc {
  id: string
  userId: string
  notaryId: string | null
  orderId: string | null
  templateSlug: string
  title: string
  category: string
  status: DocStatus
  completionPercentage: number | null
  pdfUrl: string | null
  clientName: string | null
  clientEmail: string | null
  notaryName: string | null
  orderAmount: number | null   // paise
  createdAt: string
  updatedAt: string
}

const statusBadge = (status: DocStatus) => {
  switch (status) {
    case 'COMPLETED':  return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" />Completed</span>
    case 'NOTARIZED':  return <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><FileCheck className="h-3 w-3" />Notarized</span>
    case 'IN_PROGRESS':return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><Clock className="h-3 w-3" />In Progress</span>
    case 'CANCELLED':  return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" />Cancelled</span>
    default:           return <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" />Draft</span>
  }
}

const categoryColor = (cat: string) => {
  const map: Record<string, string> = {
    PROPERTY: 'bg-green-100 text-green-700',
    RENT_LEASE: 'bg-teal-100 text-teal-700',
    PERSONAL: 'bg-blue-100 text-blue-700',
    BUSINESS: 'bg-orange-100 text-orange-700',
    MANAGING_BUSINESS: 'bg-indigo-100 text-indigo-700',
    LEGAL: 'bg-purple-100 text-purple-700',
    AFFIDAVITS: 'bg-pink-100 text-pink-700',
  }
  return map[cat] ?? 'bg-gray-100 text-gray-700'
}

const categoryLabel = (cat: string) =>
  cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function DocumentManagementPage() {
  const [docs, setDocs] = useState<AdminDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState<AdminDoc | null>(null)

  const fetchDocs = async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await gql(`
        query AdminDocs($status: String, $search: String) {
          adminListDocuments(status: $status, search: $search) {
            id userId notaryId orderId templateSlug title category status
            completionPercentage pdfUrl clientName clientEmail notaryName
            orderAmount createdAt updatedAt
          }
        }
      `, {
        status: statusFilter !== 'all' ? statusFilter : null,
        search: search || null,
      })
      if (json.errors?.length) { setError(json.errors[0].message); return }
      setDocs(json.data?.adminListDocuments ?? [])
    } catch {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [statusFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchDocs(), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    setActionLoading(id)
    try {
      // Note: adminDeleteDocument mutation can be added to backend when needed
      // For now just remove from local state after confirmation
      setDocs(prev => prev.filter(d => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
    } finally {
      setActionLoading(null)
    }
  }

  const stats = {
    total: docs.length,
    completed: docs.filter(d => d.status === 'COMPLETED' || d.status === 'NOTARIZED').length,
    inProgress: docs.filter(d => d.status === 'IN_PROGRESS').length,
    drafts: docs.filter(d => d.status === 'DRAFT').length,
    revenue: docs.reduce((acc, d) => acc + (d.orderAmount ?? 0), 0),
  }

  const fmt = (dt: string) => new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

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
                  <h1 className="text-2xl font-bold">Document Management</h1>
                  <p className="text-gray-300 text-sm">View and manage all platform documents</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchDocs}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: loading ? '—' : stats.total, icon: FileText, color: 'bg-gray-800' },
            { label: 'Completed', value: loading ? '—' : stats.completed, icon: CheckCircle, color: 'bg-green-600' },
            { label: 'In Progress', value: loading ? '—' : stats.inProgress, icon: Clock, color: 'bg-yellow-500' },
            { label: 'Drafts', value: loading ? '—' : stats.drafts, icon: AlertTriangle, color: 'bg-gray-400' },
            { label: 'Total Revenue', value: loading ? '—' : `₹${(stats.revenue / 100).toLocaleString()}`, icon: BarChart3, color: 'bg-emerald-600' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${s.color} p-2 rounded-lg`}><Icon className="h-5 w-5 text-white" /></div>
                  <span className="text-xs font-medium text-gray-600 leading-tight">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            )
          })}
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
                  placeholder="Search by title or document ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="NOTARIZED">Notarized</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notary</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={8} className="py-16 text-center">
                      <Loader2 className="h-8 w-8 text-gray-300 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading documents…</p>
                    </td></tr>
                  ) : docs.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium">No documents found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td></tr>
                  ) : docs.map(doc => {
                    const isActing = actionLoading === doc.id
                    return (
                      <tr
                        key={doc.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedDoc(doc)}
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
                          <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{doc.id}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColor(doc.category)}`}>
                            {categoryLabel(doc.category)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                              {(doc.clientName ?? '?')[0].toUpperCase()}
                            </div>
                            <p className="text-sm text-gray-900 truncate max-w-[100px]">{doc.clientName ?? '—'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <UserCheck className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[100px]">{doc.notaryName ?? 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{statusBadge(doc.status as DocStatus)}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-gray-900">
                            {doc.orderAmount != null ? `₹${(doc.orderAmount / 100).toLocaleString()}` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {fmt(doc.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedDoc(doc)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                            {doc.pdfUrl && (
                              <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="Download PDF"><Download className="h-4 w-4" /></a>
                            )}
                            <button onClick={() => handleDelete(doc.id)} disabled={isActing} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50">
                              {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>{loading ? 'Loading…' : `Showing ${docs.length} documents`}</span>
              {!loading && (
                <span className="font-semibold text-gray-700">
                  Revenue: ₹{(docs.reduce((a, d) => a + (d.orderAmount ?? 0), 0) / 100).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedDoc && (
            <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900">Document Details</h3>
                <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-bold text-gray-900 text-sm">{selectedDoc.title}</h4>
                <p className="text-xs text-gray-400 font-mono mt-1 break-all">{selectedDoc.id}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {statusBadge(selectedDoc.status as DocStatus)}
                </div>
              </div>

              {/* Completion Bar */}
              {selectedDoc.completionPercentage != null && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Completion</span>
                    <span className="font-semibold">{selectedDoc.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${selectedDoc.completionPercentage === 100 ? 'bg-green-500' : 'bg-gray-800'}`}
                      style={{ width: `${selectedDoc.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex items-center gap-3 text-gray-700">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColor(selectedDoc.category)}`}>
                    {categoryLabel(selectedDoc.category)}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{selectedDoc.clientName ?? '—'}</p>
                    {selectedDoc.clientEmail && <p className="text-xs text-gray-500">{selectedDoc.clientEmail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <UserCheck className="h-4 w-4 text-gray-400" />
                  {selectedDoc.notaryName ?? 'Not Assigned'}
                </div>
                <div className="flex items-center gap-3 text-gray-700"><Calendar className="h-4 w-4 text-gray-400" />Created {fmt(selectedDoc.createdAt)}</div>
                <div className="flex items-center gap-3 text-gray-700"><Calendar className="h-4 w-4 text-gray-400" />Updated {fmt(selectedDoc.updatedAt)}</div>
              </div>

              {selectedDoc.orderAmount != null && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Amount</span>
                  <span className="text-lg font-bold text-gray-900">₹{(selectedDoc.orderAmount / 100).toLocaleString()}</span>
                </div>
              )}

              <div className="space-y-2">
                {selectedDoc.pdfUrl ? (
                  <a
                    href={selectedDoc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                ) : (
                  <button disabled className="w-full bg-gray-200 text-gray-400 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                    <Download className="h-4 w-4" /> No PDF Available
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  disabled={actionLoading === selectedDoc.id}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-red-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
