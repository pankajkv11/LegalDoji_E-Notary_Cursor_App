'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Search, Plus, Edit, ArrowLeft,
  Clock, CheckCircle, AlertCircle, Loader2, Eye,
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

interface Document {
  id: string
  title: string
  status: string
  templateId: string
  templateSlug: string
  currentStep: number
  createdAt: string
  updatedAt: string
}

type FilterTab = 'ALL' | 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'NOTARIZED'

const TABS: { label: string; value: FilterTab; icon: React.ElementType }[] = [
  { label: 'All', value: 'ALL', icon: FileText },
  { label: 'Drafts', value: 'DRAFT', icon: Edit },
  { label: 'In Progress', value: 'IN_PROGRESS', icon: Clock },
  { label: 'Completed', value: 'COMPLETED', icon: CheckCircle },
  { label: 'Notarized', value: 'NOTARIZED', icon: CheckCircle },
]

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-green-100 text-green-700',
  NOTARIZED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  DELIVERED: 'Delivered',
  NOTARIZED: 'Notarized',
  CANCELLED: 'Cancelled',
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase()
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABEL[s] ?? status}
    </span>
  )
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function draftProgress(doc: Document) {
  const total = 4
  const pct = Math.min(100, Math.round(((doc.currentStep || 1) / total) * 100))
  return { pct, label: `Step ${doc.currentStep || 1} of ${total}` }
}

const PAGE_SIZE = 20

export default function MyDocumentsPage() {
  const [allDocs, setAllDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [offset, setOffset] = useState(0)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [search, setSearch] = useState('')

  const fetchDocs = async (currentOffset: number, append: boolean) => {
    const token = getToken()
    if (!token) { setSessionExpired(true); setLoading(false); return }
    try {
      const json = await gql(`query GetDocs($limit: Int, $offset: Int) {
        myDocuments(filter: { limit: $limit, offset: $offset }) {
          nodes { id title status templateId templateSlug currentStep createdAt updatedAt }
          pageInfo { hasNextPage totalCount }
        }
      }`, { limit: PAGE_SIZE, offset: currentOffset })
      const authError = json.errors?.some((e: { message: string }) =>
        /auth|permission|unauthenticated/i.test(e.message)
      )
      if (authError) { setSessionExpired(true); return }
      const nodes: Document[] = json.data?.myDocuments?.nodes ?? []
      const pageInfo = json.data?.myDocuments?.pageInfo
      setAllDocs((prev) => append ? [...prev, ...nodes] : nodes)
      setHasNextPage(pageInfo?.hasNextPage ?? false)
      setOffset(currentOffset + nodes.length)
    } catch {
      // network error — keep existing state
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchDocs(0, false)
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await fetchDocs(offset, true)
    setLoadingMore(false)
  }

  const filtered = allDocs.filter((doc) => {
    const matchesTab =
      activeTab === 'ALL' ||
      doc.status?.toUpperCase() === activeTab ||
      (activeTab === 'IN_PROGRESS' && doc.status?.toUpperCase() === 'PROCESSING')
    const matchesSearch =
      !search.trim() ||
      doc.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.templateId?.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const countFor = (tab: FilterTab) => {
    if (tab === 'ALL') return allDocs.length
    if (tab === 'IN_PROGRESS') return allDocs.filter(d => ['IN_PROGRESS','PROCESSING'].includes(d.status?.toUpperCase())).length
    return allDocs.filter(d => d.status?.toUpperCase() === tab).length
  }

  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-yellow-200 p-8 max-w-md w-full mx-4 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">Session Expired</p>
          <p className="text-gray-600 text-sm mb-6">Please sign in again to view your documents.</p>
          <Link href="/login" className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-black transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">My Documents</h1>
                <p className="text-gray-300 mt-1">
                  {loading ? 'Loading…' : `${allDocs.length} document${allDocs.length !== 1 ? 's' : ''} total`}
                </p>
              </div>
            </div>
            <Link
              href="/create"
              className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm"
            >
              <Plus className="h-4 w-4" />
              New Document
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats row */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: allDocs.length, color: 'text-gray-900' },
              { label: 'Drafts', value: countFor('DRAFT'), color: 'text-yellow-600' },
              { label: 'In Progress', value: countFor('IN_PROGRESS'), color: 'text-blue-600' },
              { label: 'Completed', value: countFor('COMPLETED') + countFor('NOTARIZED'), color: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search documents by title or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs">
                Clear
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const count = countFor(tab.value)
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Document list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
            <p className="text-gray-500 text-sm">Loading your documents…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <FileText className="h-14 w-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg mb-2">
              {search ? 'No results found' : 'No documents here'}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {search
                ? `No documents match "${search}"`
                : activeTab === 'ALL'
                ? "You haven't created any documents yet."
                : `No ${activeTab.toLowerCase().replace('_', ' ')} documents.`}
            </p>
            {activeTab === 'ALL' && !search && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-black transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create your first document
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((doc) => {
              const isDraft = doc.status?.toUpperCase() === 'DRAFT'
              const { pct, label } = draftProgress(doc)
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition-all flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{doc.id.slice(0, 8).toUpperCase()}</span>
                        <StatusBadge status={doc.status} />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                        {doc.title || doc.templateId?.replace(/-/g, ' ')}
                      </h3>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>

                  {/* Draft progress bar */}
                  {isDraft && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{label}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-yellow-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="text-xs text-gray-400 space-y-0.5 mb-4 flex-1">
                    <p>Created: {formatDate(doc.createdAt)}</p>
                    {doc.updatedAt !== doc.createdAt && (
                      <p>Updated: {formatDate(doc.updatedAt)}</p>
                    )}
                  </div>

                  {/* Action */}
                  {isDraft ? (
                    <Link
                      href={`/create?template=${doc.templateSlug}&draft=${doc.id}`}
                      className="block w-full bg-gray-900 hover:bg-black text-white text-center text-sm font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Continue Editing
                    </Link>
                  ) : (
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/documents/${doc.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Load More */}
        {!loading && hasNextPage && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 bg-white border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Loading more…</>
              ) : (
                'Load More Documents'
              )}
            </button>
          </div>
        )}

        {!loading && !hasNextPage && allDocs.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">
            All {allDocs.length} document{allDocs.length !== 1 ? 's' : ''} loaded
          </p>
        )}
      </div>
    </div>
  )
}
