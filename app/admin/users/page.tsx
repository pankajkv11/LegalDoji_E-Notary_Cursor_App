'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users, Shield, ArrowLeft, Search, Filter, Download,
  Eye, Trash2, ChevronDown, Mail, Phone, Calendar,
  FileText, UserCheck, AlertTriangle, CheckCircle,
  XCircle, Ban, MoreVertical, UserPlus, RefreshCw
} from 'lucide-react'

type UserRole = 'user' | 'notary' | 'admin'
type UserStatus = 'active' | 'suspended' | 'blocked' | 'pending'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  joinDate: string
  documents: number
  lastLogin: string
}

const MOCK_USERS: User[] = [
  { id: 'USR-001', name: 'Rajesh Kumar', email: 'rajesh.k@email.com', phone: '+91 98765 43210', role: 'user', status: 'active', joinDate: '2024-01-20', documents: 3, lastLogin: '2024-01-23' },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya.s@email.com', phone: '+91 98765 43211', role: 'user', status: 'active', joinDate: '2024-01-21', documents: 1, lastLogin: '2024-01-22' },
  { id: 'USR-003', name: 'Adv. Ramesh Iyer', email: 'ramesh@notary.com', phone: '+91 98765 43212', role: 'notary', status: 'active', joinDate: '2024-01-19', documents: 45, lastLogin: '2024-01-23' },
  { id: 'USR-004', name: 'Sneha Patel', email: 'sneha.p@email.com', phone: '+91 98765 43213', role: 'user', status: 'suspended', joinDate: '2024-01-22', documents: 0, lastLogin: '2024-01-22' },
  { id: 'USR-005', name: 'Amit Verma', email: 'amit.v@email.com', phone: '+91 98765 43214', role: 'user', status: 'active', joinDate: '2024-01-18', documents: 2, lastLogin: '2024-01-21' },
  { id: 'USR-006', name: 'Adv. Meera Nair', email: 'meera@notary.com', phone: '+91 98765 43215', role: 'notary', status: 'active', joinDate: '2024-01-15', documents: 89, lastLogin: '2024-01-23' },
  { id: 'USR-007', name: 'Kiran Reddy', email: 'kiran.r@email.com', phone: '+91 98765 43216', role: 'user', status: 'blocked', joinDate: '2024-01-10', documents: 0, lastLogin: '2024-01-15' },
  { id: 'USR-008', name: 'Sunita Joshi', email: 'sunita.j@email.com', phone: '+91 98765 43217', role: 'user', status: 'pending', joinDate: '2024-01-23', documents: 0, lastLogin: 'Never' },
  { id: 'USR-009', name: 'Adv. Suresh Reddy', email: 'suresh@notary.com', phone: '+91 98765 43218', role: 'notary', status: 'active', joinDate: '2024-01-12', documents: 112, lastLogin: '2024-01-23' },
  { id: 'USR-010', name: 'Pooja Gupta', email: 'pooja.g@email.com', phone: '+91 98765 43219', role: 'user', status: 'active', joinDate: '2024-01-17', documents: 1, lastLogin: '2024-01-20' },
]

const roleBadge = (role: UserRole) => {
  switch (role) {
    case 'admin':    return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">Admin</span>
    case 'notary':   return <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-full">Notary</span>
    default:         return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">User</span>
  }
}

const statusBadge = (status: UserStatus) => {
  switch (status) {
    case 'active':    return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" />Active</span>
    case 'suspended': return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" />Suspended</span>
    case 'blocked':   return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" />Blocked</span>
    case 'pending':   return <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><RefreshCw className="h-3 w-3" />Pending</span>
  }
}

const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending: users.filter(u => u.status === 'pending').length,
  }

  const handleStatusChange = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
    setOpenMenu(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.id !== id))
      if (selectedUser?.id === id) setSelectedUser(null)
    }
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
            <button className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm">
              <UserPlus className="h-4 w-4" />
              Add New User
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
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              </div>
            )
          })}
        </div>

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
                    <option value="user">User</option>
                    <option value="notary">Notary</option>
                    <option value="admin">Admin</option>
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
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 text-gray-600" />
                </button>
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="font-medium">No users found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : filtered.map(user => (
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
                            <p className="text-xs text-gray-500 font-mono">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </td>
                      <td className="py-3 px-4">{roleBadge(user.role)}</td>
                      <td className="py-3 px-4">{statusBadge(user.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {user.documents}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {user.joinDate}
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
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
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
                                {user.status !== 'active' && (
                                  <button onClick={() => handleStatusChange(user.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" /> Activate
                                  </button>
                                )}
                                {user.status !== 'suspended' && (
                                  <button onClick={() => handleStatusChange(user.id, 'suspended')} className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Suspend
                                  </button>
                                )}
                                {user.status !== 'blocked' && (
                                  <button onClick={() => handleStatusChange(user.id, 'blocked')} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                                    <Ban className="h-4 w-4" /> Block
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
              Showing {filtered.length} of {users.length} users
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
                <p className="text-sm text-gray-500 font-mono">{selectedUser.id}</p>
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
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Joined {selectedUser.joinDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{selectedUser.documents} documents</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <UserCheck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Last login: {selectedUser.lastLogin}</span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedUser.status !== 'active' && (
                  <button onClick={() => { handleStatusChange(selectedUser.id, 'active'); setSelectedUser({ ...selectedUser, status: 'active' }) }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle className="h-4 w-4" /> Activate Account
                  </button>
                )}
                {selectedUser.status === 'active' && (
                  <button onClick={() => { handleStatusChange(selectedUser.id, 'suspended'); setSelectedUser({ ...selectedUser, status: 'suspended' }) }}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <AlertTriangle className="h-4 w-4" /> Suspend Account
                  </button>
                )}
                <button onClick={() => handleDelete(selectedUser.id)}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-red-200">
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
