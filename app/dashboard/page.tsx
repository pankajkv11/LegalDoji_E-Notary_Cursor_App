'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  FileText, Package, Clock, CheckCircle, Plus, Edit, User,
  Phone, Calendar, Video, MapPin, Truck,
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

interface Appointment {
  id: string
  documentType: string
  scheduledDate: string
  scheduledTime: string
  status: string
  notes: string
}

export default function UserDashboardPage() {
  const [drafts, setDrafts] = useState<Document[]>([])
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken()
        if (!token) {
          setSessionExpired(true)
          return
        }
        const [draftsRes, docsRes, aptsRes] = await Promise.all([
          gql(`query {
            myDocuments(filter: { status: "DRAFT", limit: 10 }) {
              nodes { id title status templateId templateSlug currentStep createdAt updatedAt }
            }
          }`),
          gql(`query {
            myDocuments(filter: { limit: 5 }) {
              nodes { id title status templateId templateSlug currentStep createdAt updatedAt }
            }
          }`),
          gql(`query {
            myAppointments {
              id documentType scheduledDate scheduledTime status notes
            }
          }`),
        ])

        // Check for auth errors in any response
        const allResponses = [draftsRes, docsRes, aptsRes]
        const authError = allResponses.some((r) =>
          r.errors?.some((e: { message: string }) =>
            /auth|permission|unauthenticated/i.test(e.message)
          )
        )
        if (authError) {
          setSessionExpired(true)
          return
        }

        setDrafts(draftsRes.data?.myDocuments?.nodes ?? [])
        setRecentDocs(docsRes.data?.myDocuments?.nodes ?? [])
        setAppointments(aptsRes.data?.myAppointments ?? [])
      } catch {
        // network error — keep empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalDocs = recentDocs.length
  const activeDrafts = drafts.length
  const upcomingApts = appointments.filter(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  )

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': case 'CONFIRMED': case 'DELIVERED':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Completed</span>
      case 'IN_PROGRESS': case 'PENDING': case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">In Progress</span>
      case 'NOTARIZED':
        return <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded">Notarized</span>
      case 'DRAFT':
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">Draft</span>
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">Cancelled</span>
      default:
        return <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded">{status}</span>
    }
  }

  const formatDate = (iso: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const draftProgress = (doc: Document) => {
    // rough estimate: currentStep out of 4 steps
    const total = 4
    const pct = Math.round(((doc.currentStep || 1) / total) * 100)
    return { pct, label: `Step ${doc.currentStep || 1} of ${total}` }
  }

  const stats = [
    { name: 'Total Documents', value: loading ? '—' : totalDocs.toString(), icon: FileText, color: 'bg-blue-500', trend: 'All time' },
    { name: 'Active Orders', value: loading ? '—' : recentDocs.filter(d => d.status === 'IN_PROGRESS').length.toString(), icon: Package, color: 'bg-green-500', trend: 'In progress' },
    { name: 'Saved Drafts', value: loading ? '—' : activeDrafts.toString(), icon: Clock, color: 'bg-yellow-500', trend: 'Complete them' },
    { name: 'Appointments', value: loading ? '—' : upcomingApts.length.toString(), icon: Calendar, color: 'bg-purple-500', trend: 'Upcoming' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-gray-300 mt-1">Welcome back! Here's your document overview.</p>
            </div>
            <Link
              href="/create"
              className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <Plus className="h-5 w-5" />
              New Document
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session expired banner */}
        {sessionExpired && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-4 flex items-center justify-between">
            <p className="text-yellow-800 text-sm font-medium">
              Your session has expired. Please sign in again to see your documents.
            </p>
            <Link
              href="/login"
              className="ml-4 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className={`${stat.color} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-gray-600 text-sm font-medium">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
            )
          })}
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-gray-700" />
              Upcoming Appointments
            </h2>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">Loading…</div>
          ) : upcomingApts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingApts.map((apt) => (
                <div key={apt.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-900 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{apt.id.slice(0, 8).toUpperCase()}</span>
                        {getStatusBadge(apt.status)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{apt.documentType}</h3>
                    </div>
                    <Video className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(apt.scheduledDate)} at {apt.scheduledTime}</span>
                    </div>
                    {apt.notes && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{apt.notes}</span>
                      </div>
                    )}
                  </div>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full">
                    Reschedule
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming appointments</p>
              <Link href="/consultation" className="inline-block mt-4 text-gray-900 hover:text-black font-semibold text-sm">
                Schedule a Consultation
              </Link>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Saved Drafts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Edit className="h-6 w-6 text-gray-700" />
                  Saved Drafts
                </h2>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {activeDrafts} drafts
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading…</div>
              ) : drafts.length > 0 ? (
                <div className="space-y-4">
                  {drafts.map((doc) => {
                    const { pct, label } = draftProgress(doc)
                    return (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-gray-500">{doc.id.slice(0, 8).toUpperCase()}</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">
                                {doc.templateId?.replace(/-/g, ' ')}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{doc.title || doc.templateId}</h3>
                            <p className="text-xs text-gray-600">Last edited: {formatDate(doc.updatedAt)}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>{label}</span>
                            <span className="font-semibold">{pct}% complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/create?template=${doc.templateSlug}&draft=${doc.id}`}
                            className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors"
                          >
                            Continue Editing
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Edit className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No saved drafts</p>
                  <Link href="/create" className="inline-block mt-4 text-gray-900 font-semibold text-sm">
                    Create a Document
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Documents</h2>
              {loading ? (
                <div className="text-center py-4 text-gray-400 text-sm">Loading…</div>
              ) : recentDocs.filter(d => d.status !== 'DRAFT').length > 0 ? (
                <div className="space-y-3">
                  {recentDocs.filter(d => d.status !== 'DRAFT').slice(0, 5).map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-500">{doc.id.slice(0, 8).toUpperCase()}</span>
                        {getStatusBadge(doc.status)}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{doc.title || doc.templateId}</h3>
                      <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No documents yet</p>
                </div>
              )}
              <Link
                href="/dashboard/documents"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-center mt-4 transition-colors"
              >
                View All Documents
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/create" className="block w-full bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors">
                  Create New Document
                </Link>
                <Link href="/dashboard/upload" className="block w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors">
                  Upload Document
                </Link>
                <Link href="/consultation" className="block w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors">
                  Schedule Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
