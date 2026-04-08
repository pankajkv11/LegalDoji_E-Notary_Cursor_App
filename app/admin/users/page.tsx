'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, Shield, ArrowLeft, Search,
  Eye, Trash2, ChevronDown, Mail, Phone, Calendar,
  FileText, UserCheck, AlertTriangle, CheckCircle,
  XCircle, Ban, MoreVertical, RefreshCw, Loader2, ShieldCheck, ShieldX, Clock
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

type UserRole = 'USER' | 'NOTARY' | 'ADMIN'
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'

type KycStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

interface AdminUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  documentCount: number
  createdAt: string
  updatedAt: string
  kycStatus: KycStatus
  kycPanNumber: string | null
  kycAadharLast4: string | null
  kycData: Record<string, string> | null
}

const roleBadge = (role: UserRole) => {
  switch (role) {
    case 'ADMIN':   return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">Admin</span>
    case 'NOTARY':  return <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-full">Notary</span>
    default:        return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">User</span>
  }
}

const statusBadge = (status: UserStatus) => {
  switch (status) {
    case 'ACTIVE':               return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" />Active</span>
    case 'SUSPENDED':            return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" />Suspended</span>
    case 'INACTIVE':             return <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" />Inactive</span>
    case 'PENDING_VERIFICATION': return <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><RefreshCw className="h-3 w-3" />Pending</span>
  }
}

const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

const kycBadge = (status: KycStatus) => {
  switch (status) {
    case 'APPROVED':      return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><ShieldCheck className="h-3 w-3" />KYC Approved</span>
    case 'SUBMITTED':     return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><Clock className="h-3 w-3" />KYC Pending</span>
    case 'REJECTED':      return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><ShieldX className="h-3 w-3" />KYC Rejected</span>
    default:              return <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><ShieldX className="h-3 w-3" />KYC Not Submitted</span>
  }
}

const LIST_USERS_QUERY = `
  query AdminUsers($role: String, $status: String, $search: String) {
    adminListUsers(role: $role, status: $status, search: $search) {
      id name email phone role status documentCount createdAt updatedAt
      kycStatus kycPanNumber kycAadharLast4 kycData
    }
  }
`

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await gql(LIST_USERS_QUERY, {
        role: roleFilter !== 'all' ? roleFilter : null,
        status: statusFilter !== 'all' ? statusFilter : null,
        search: search || null,
      })
      if (json.errors?.length) { setError(json.errors[0].message); return }
      setUsers(json.data?.adminListUsers ?? [])
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [roleFilter, statusFilter])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleStatusChange = async (id: string, status: UserStatus) => {
    setActionLoading(id)
    setOpenMenu(null)
    try {
      const json = await gql(
        `mutation UpdateStatus($input: AdminUpdateUserStatusInput!) { adminUpdateUserStatus(input: $input) { id status } }`,
        { input: { userId: id, status } }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
      if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, status } : null)
    } catch { alert('Network error. Please try again.') }
    finally { setActionLoading(null) }
  }

  const handleKyc = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      const mutation = action === 'approve' ? 'adminApproveKyc' : 'adminRejectKyc'
      const json = await gql(
        `mutation KycAction($userId: String!) { ${mutation}(userId: $userId) { success kycStatus } }`,
        { userId: id }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      const newKycStatus = json.data?.[mutation]?.kycStatus as KycStatus
      setUsers(prev => prev.map(u => u.id === id ? { ...u, kycStatus: newKycStatus } : u))
      if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, kycStatus: newKycStatus } : null)
    } catch { alert('Network error. Please try again.') }
    finally { setActionLoading(null) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    setActionLoading(id)
    try {
      const json = await gql(
        `mutation DeleteUser($userId: String!) { adminDeleteUser(userId: $userId) }`,
        { userId: id }
      )
      if (json.errors?.length) { alert(json.errors[0].message); return }
      setUsers(prev => prev.filter(u => u.id !== id))
      if (selectedUser?.id === id) setSelectedUser(null)
    } catch { alert('Network error. Please try again.') }
    finally { setActionLoading(null) }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
    pending: users.filter(u => u.status === 'PENDING_VERIFICATION').length,
  }

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
                  <h1 className="text-2xl font-bold">User Management</h1>
                  <p className="text-gray-300 text-sm">Manage all platform users and roles</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchUsers}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: 'bg-blue-500' },
            { label: 'Active', value: stats.active, icon: CheckCircle, color: 'bg-green-500' },
            { label: 'Suspended', value: stats.suspended, icon: AlertTriangle, color: 'bg-yellow-500' },
            { label: 'Pending Verification', value: stats.pending, icon: RefreshCw, color: 'bg-gray-500' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${s.color} p-2 rounded-lg`}><Icon className="h-5 w-5 text-white" /></div>
                  <span className="text-sm font-medium text-gray-600">{s.label}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
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
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as 'all' | UserRole)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">User</option>
                    <option value="NOTARY">Notary</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'all' | UserStatus)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING_VERIFICATION">Pending</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Docs</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Loader2 className="h-8 w-8 text-gray-300 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Loading users…</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="font-medium">No users found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : users.map(user => {
                    const isActing = actionLoading === user.id
                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {initials(user.name)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500 font-mono truncate max-w-[120px]">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-700">{user.email}</p>
                          <p className="text-xs text-gray-500">{user.phone ?? '—'}</p>
                        </td>
                        <td className="py-3 px-4">{roleBadge(user.role)}</td>
                        <td className="py-3 px-4">{statusBadge(user.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {user.documentCount}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={isActing}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openMenu === user.id && (
                                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
                                  {user.status !== 'ACTIVE' && (
                                    <button onClick={() => handleStatusChange(user.id, 'ACTIVE')} className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4" /> Activate
                                    </button>
                                  )}
                                  {user.status !== 'SUSPENDED' && (
                                    <button onClick={() => handleStatusChange(user.id, 'SUSPENDED')} className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4" /> Suspend
                                    </button>
                                  )}
                                  {user.status !== 'INACTIVE' && (
                                    <button onClick={() => handleStatusChange(user.id, 'INACTIVE')} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                                      <Ban className="h-4 w-4" /> Deactivate
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
              {loading ? 'Loading…' : `Showing ${users.length} users`}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedUser && (
            <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {initials(selectedUser.name)}
                </div>
                <h4 className="font-bold text-gray-900">{selectedUser.name}</h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5 break-all">{selectedUser.id}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {roleBadge(selectedUser.role)}
                  {statusBadge(selectedUser.status)}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 break-all">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{selectedUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">
                    Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{selectedUser.documentCount} documents</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <UserCheck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Role: {selectedUser.role}</span>
                </div>
              </div>

              {/* KYC Section */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">KYC Verification</h4>
                <div className="mb-3">{kycBadge(selectedUser.kycStatus)}</div>
                {selectedUser.kycStatus !== 'NOT_SUBMITTED' && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    {selectedUser.kycPanNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">PAN</span>
                        <span className="font-mono font-medium text-gray-900">{selectedUser.kycPanNumber}</span>
                      </div>
                    )}
                    {selectedUser.kycAadharLast4 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Aadhaar</span>
                        <span className="font-mono font-medium text-gray-900">••••••••{selectedUser.kycAadharLast4}</span>
                      </div>
                    )}
                    {selectedUser.kycData?.full_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Full Name</span>
                        <span className="font-medium text-gray-900">{selectedUser.kycData.full_name}</span>
                      </div>
                    )}
                    {selectedUser.kycData?.dob && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">DOB</span>
                        <span className="font-medium text-gray-900">{selectedUser.kycData.dob}</span>
                      </div>
                    )}
                    {selectedUser.kycData?.city && selectedUser.kycData?.state && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium text-gray-900">{selectedUser.kycData.city}, {selectedUser.kycData.state}</span>
                      </div>
                    )}
                  </div>
                )}
                {selectedUser.kycStatus === 'SUBMITTED' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleKyc(selectedUser.id, 'approve')}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedUser.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleKyc(selectedUser.id, 'reject')}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedUser.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldX className="h-3 w-3" />}
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {selectedUser.status !== 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE')}
                    disabled={actionLoading === selectedUser.id}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Activate Account
                  </button>
                )}
                {selectedUser.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'SUSPENDED')}
                    disabled={actionLoading === selectedUser.id}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                    Suspend Account
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  disabled={actionLoading === selectedUser.id}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-red-200 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
