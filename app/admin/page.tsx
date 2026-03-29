'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Users, FileText, Video, DollarSign, Settings,
  UserCheck, Clock, CheckCircle, AlertTriangle, Search,
  Filter, Download, Eye, Edit, Trash2, BarChart3, Shield,
  Calendar, Mail, Phone, MapPin, Building2,
  XCircle, CheckCircle2, FileCheck, Award, Briefcase, Loader2, RefreshCw
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

interface PendingApplication {
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
}

interface AdminStats {
  totalUsers: number
  totalDocuments: number
  activeNotaries: number
  pendingApplications: number
  revenueMonth: number
  pendingOrders: number
  activeSessions: number
  supportTickets: number
}

function formatRevenue(rupees: number): string {
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`
  return `₹${rupees}`
}

export default function AdminPage() {
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setLoadingStats(true)
    try {
      const json = await gql(`query {
        adminStats {
          totalUsers totalDocuments activeNotaries pendingApplications
          revenueMonth pendingOrders activeSessions supportTickets
        }
        notaryApplications(status: "PENDING") {
          id applicationNumber firstName middleName lastName email phone
          licenseNumber barCouncilNumber experience specialization location
          status appliedAt
        }
      }`)
      if (!json.errors) {
        setStats(json.data?.adminStats ?? null)
        setPendingApplications(json.data?.notaryApplications ?? [])
      }
    } catch {
      // silently fall through — UI will show dashes
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

  const handleApproveApplication = async (id: string) => {
    if (!confirm('Approve this notary application?')) return
    setActionLoading(id)
    try {
      const json = await gql(
        `mutation Approve($id: String!) { approveNotaryApplication(applicationId: $id) { id status } }`,
        { id }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      setPendingApplications(prev => prev.filter(a => a.id !== id))
      if (stats) setStats({ ...stats, pendingApplications: stats.pendingApplications - 1 })
    } catch { alert('Network error. Please try again.') }
    finally { setActionLoading(null) }
  }

  const handleRejectApplication = async (id: string) => {
    const reason = prompt('Reason for rejection (sent to applicant):')
    if (!reason) return
    setActionLoading(id)
    try {
      const json = await gql(
        `mutation Reject($id: String!, $reason: String) { rejectNotaryApplication(applicationId: $id, reason: $reason) { id status } }`,
        { id, reason }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      setPendingApplications(prev => prev.filter(a => a.id !== id))
      if (stats) setStats({ ...stats, pendingApplications: stats.pendingApplications - 1 })
    } catch { alert('Network error. Please try again.') }
    finally { setActionLoading(null) }
  }

  const statCards = [
    { name: 'Total Users', value: stats ? stats.totalUsers.toLocaleString() : '—', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Documents', value: stats ? stats.totalDocuments.toLocaleString() : '—', icon: FileText, color: 'bg-green-500' },
    { name: 'Active Notaries', value: stats ? stats.activeNotaries.toLocaleString() : '—', icon: UserCheck, color: 'bg-purple-500' },
    { name: 'Pending Applications', value: stats ? stats.pendingApplications.toLocaleString() : '—', icon: FileCheck, color: 'bg-yellow-500' },
    { name: 'Revenue (Month)', value: stats ? formatRevenue(stats.revenueMonth) : '—', icon: DollarSign, color: 'bg-emerald-500' },
    { name: 'Pending Orders', value: stats ? stats.pendingOrders.toLocaleString() : '—', icon: Clock, color: 'bg-orange-500' },
    { name: 'Active Sessions', value: stats ? stats.activeSessions.toLocaleString() : '—', icon: Video, color: 'bg-red-500' },
    { name: 'Support Tickets', value: stats ? stats.supportTickets.toLocaleString() : '—', icon: AlertTriangle, color: 'bg-pink-500' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Completed</span>
      case 'in-progress':
        return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">In Progress</span>
      case 'draft':
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">Draft</span>
      case 'active':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Active</span>
      case 'inactive':
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">Inactive</span>
      case 'available':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Available</span>
      case 'busy':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">Busy</span>
      case 'offline':
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">Offline</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-gray-300 mt-1">E-Notary Platform Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                disabled={loadingStats}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/admin/settings"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
              <Link
                href="/admin/reports"
                className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <BarChart3 className="h-5 w-5" />
                Reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {loadingStats && <Loader2 className="h-4 w-4 text-gray-300 animate-spin" />}
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Pending Notary/Advocate Applications Alert */}
        {pendingApplications.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {pendingApplications.length} Pending Notary Application{pendingApplications.length > 1 ? 's' : ''} Require Your Attention
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Review and approve qualified advocates to join your notary network
                </p>
                <a
                  href="#pending-applications"
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  <FileCheck className="h-4 w-4" />
                  Review Applications
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users" className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-xl p-6 transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-gray-700 group-hover:bg-gray-800 p-3 rounded-lg transition-colors">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage all users and roles</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/notary-applications" className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-xl p-6 transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 group-hover:bg-gray-900 p-3 rounded-lg transition-colors">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Notary Applications</h3>
                <p className="text-sm text-gray-600">Review & approve applicants</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/documents" className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-xl p-6 transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-gray-900 group-hover:bg-black p-3 rounded-lg transition-colors">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Document Management</h3>
                <p className="text-sm text-gray-600">View all documents & orders</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Pending Applications Section */}
        <div id="pending-applications" className="mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Pending Notary Applications</h2>
                  <p className="text-sm text-gray-600">Review and approve qualified advocates</p>
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold">
                {pendingApplications.length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {pendingApplications.map((application) => {
                const fullName = [application.firstName, application.middleName, application.lastName].filter(Boolean).join(' ')
                const isActing = actionLoading === application.id
                return (
                <div key={application.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-all">
                  {/* Application Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                          PENDING
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{application.applicationNumber}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{application.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{application.phone}</span>
                        </div>
                        {application.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Applied on</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(application.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Application Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notary License Number</p>
                      <p className="text-sm font-semibold text-gray-900">{application.licenseNumber ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bar Council Number</p>
                      <p className="text-sm font-semibold text-gray-900">{application.barCouncilNumber ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Experience</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-gray-700" />
                        {application.experience ?? '—'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Specialization</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Award className="h-4 w-4 text-gray-700" />
                        {application.specialization ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-gray-700" />
                        {application.location ?? '—'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Link
                      href="/admin/notary-applications"
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                      View Full Profile
                    </Link>
                    <button
                      onClick={() => handleRejectApplication(application.id)}
                      disabled={isActing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {isActing ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveApplication(application.id)}
                      disabled={isActing}
                      className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {isActing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      Approve & Activate
                    </button>
                  </div>
                </div>
                )
              })}
            </div>

            {pendingApplications.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Applications</h3>
                <p className="text-gray-600">All notary applications have been reviewed</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                <Link href="/admin/documents" className="text-gray-900 hover:text-black font-semibold text-sm flex items-center gap-1">
                  <Eye className="h-4 w-4" /> View All
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-12 w-12 text-gray-200 mb-3" />
                <p className="text-gray-500 text-sm mb-3">View and manage all platform documents</p>
                <Link href="/admin/documents" className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Open Document Management
                </Link>
              </div>
            </div>

            {/* Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Users</h2>
                <Link href="/admin/users" className="text-gray-900 hover:text-black font-semibold text-sm flex items-center gap-1">
                  <Eye className="h-4 w-4" /> View All
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="h-12 w-12 text-gray-200 mb-3" />
                <p className="text-gray-500 text-sm mb-3">
                  {stats ? `${stats.totalUsers.toLocaleString()} registered users on the platform` : 'Manage all platform users and roles'}
                </p>
                <Link href="/admin/users" className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Open User Management
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notaries Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notaries</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <UserCheck className="h-10 w-10 text-gray-200 mb-2" />
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats ? stats.activeNotaries : '—'}
                </p>
                <p className="text-sm text-gray-500 mb-4">Verified Notaries</p>
                <Link href="/admin/notaries" className="text-gray-900 hover:text-black font-semibold text-sm">
                  View All Notaries →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/users"
                  className="block w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/notary-applications"
                  className="block w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Review Notary Applications
                </Link>
                <Link
                  href="/admin/reports"
                  className="block w-full bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  View Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
