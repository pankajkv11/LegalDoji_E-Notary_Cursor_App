'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserCheck, Shield, ArrowLeft, Search, Download,
  Star, MapPin, Briefcase, Award, CheckCircle2,
  XCircle, Eye, Trash2, FileText, ChevronDown,
  Phone, Mail, AlertTriangle, Clock, Calendar
} from 'lucide-react'

type NotaryStatus = 'verified' | 'pending' | 'suspended' | 'rejected'

interface Notary {
  id: string
  name: string
  email: string
  phone: string
  licenseNumber: string
  barCouncilNumber: string
  experience: number
  specialization: string[]
  location: string
  rating: number
  completedDocs: number
  consultationFee: number
  status: NotaryStatus
  joinDate: string
  isAvailable: boolean
}

interface Application {
  id: string
  name: string
  email: string
  phone: string
  licenseNumber: string
  barCouncilNumber: string
  experience: string
  specialization: string
  location: string
  appliedDate: string
}

const MOCK_NOTARIES: Notary[] = [
  { id: 'NOT-001', name: 'Adv. Ramesh Iyer', email: 'ramesh@notary.com', phone: '+91 98765 43212', licenseNumber: 'MH-NOT-2021-001', barCouncilNumber: 'BAR/MH/2018/001', experience: 6, specialization: ['Property', 'Real Estate'], location: 'Mumbai, Maharashtra', rating: 4.8, completedDocs: 245, consultationFee: 999, status: 'verified', joinDate: '2024-01-19', isAvailable: true },
  { id: 'NOT-002', name: 'Adv. Meera Nair', email: 'meera@notary.com', phone: '+91 98765 43215', licenseNumber: 'KA-NOT-2021-045', barCouncilNumber: 'BAR/KA/2017/045', experience: 9, specialization: ['Family Law', 'Matrimonial'], location: 'Bangalore, Karnataka', rating: 4.9, completedDocs: 189, consultationFee: 1499, status: 'verified', joinDate: '2024-01-15', isAvailable: false },
  { id: 'NOT-003', name: 'Adv. Suresh Reddy', email: 'suresh@notary.com', phone: '+91 98765 43218', licenseNumber: 'TS-NOT-2020-023', barCouncilNumber: 'BAR/TS/2016/023', experience: 11, specialization: ['Corporate', 'Business'], location: 'Hyderabad, Telangana', rating: 4.7, completedDocs: 312, consultationFee: 1299, status: 'verified', joinDate: '2024-01-12', isAvailable: true },
  { id: 'NOT-004', name: 'Adv. Anjali Singh', email: 'anjali@notary.com', phone: '+91 98765 43220', licenseNumber: 'DL-NOT-2022-067', barCouncilNumber: 'BAR/DL/2019/067', experience: 5, specialization: ['Civil', 'Criminal'], location: 'New Delhi', rating: 4.6, completedDocs: 156, consultationFee: 899, status: 'suspended', joinDate: '2024-01-10', isAvailable: false },
]

const MOCK_APPLICATIONS: Application[] = [
  { id: 'APP-001', name: 'Kavita Menon', email: 'kavita.m@email.com', phone: '+91 98765 43214', licenseNumber: 'KL-NOT-2024-012', barCouncilNumber: 'BAR/KL/2020/1234', experience: '5 years', specialization: 'Property & Real Estate Law', location: 'Kochi, Kerala', appliedDate: '2024-01-22' },
  { id: 'APP-002', name: 'Arjun Malhotra', email: 'arjun.malhotra@email.com', phone: '+91 98765 43225', licenseNumber: 'UP-NOT-2024-089', barCouncilNumber: 'BAR/UP/2019/5678', experience: '8 years', specialization: 'Corporate & Business Law', location: 'Noida, UP', appliedDate: '2024-01-23' },
  { id: 'APP-003', name: 'Neha Deshmukh', email: 'neha.d@email.com', phone: '+91 98765 43226', licenseNumber: 'MH-NOT-2024-045', barCouncilNumber: 'BAR/MH/2021/9012', experience: '3 years', specialization: 'Family & Matrimonial Law', location: 'Pune, Maharashtra', appliedDate: '2024-01-23' },
]

const statusBadge = (status: NotaryStatus) => {
  switch (status) {
    case 'verified':  return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="h-3 w-3" />Verified</span>
    case 'pending':   return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><Clock className="h-3 w-3" />Pending</span>
    case 'suspended': return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" />Suspended</span>
    case 'rejected':  return <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" />Rejected</span>
  }
}

export default function NotaryManagementPage() {
  const [activeTab, setActiveTab] = useState<'notaries' | 'applications'>('notaries')
  const [notaries, setNotaries] = useState<Notary[]>(MOCK_NOTARIES)
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | NotaryStatus>('all')
  const [selectedNotary, setSelectedNotary] = useState<Notary | null>(null)

  const filteredNotaries = notaries.filter(n => {
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.location.toLowerCase().includes(search.toLowerCase()) ||
      n.licenseNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || n.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleApprove = (id: string) => {
    if (confirm('Approve this notary application?')) {
      setApplications(prev => prev.filter(a => a.id !== id))
    }
  }

  const handleReject = (id: string) => {
    if (confirm('Reject this notary application?')) {
      setApplications(prev => prev.filter(a => a.id !== id))
    }
  }

  const handleSuspend = (id: string) => {
    setNotaries(prev => prev.map(n => n.id === id ? { ...n, status: 'suspended' } : n))
    if (selectedNotary?.id === id) setSelectedNotary(prev => prev ? { ...prev, status: 'suspended' } : null)
  }

  const handleActivate = (id: string) => {
    setNotaries(prev => prev.map(n => n.id === id ? { ...n, status: 'verified' } : n))
    if (selectedNotary?.id === id) setSelectedNotary(prev => prev ? { ...prev, status: 'verified' } : null)
  }

  const stats = {
    total: notaries.length,
    verified: notaries.filter(n => n.status === 'verified').length,
    pending: applications.length,
    suspended: notaries.filter(n => n.status === 'suspended').length,
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
                  <h1 className="text-2xl font-bold">Notary Management</h1>
                  <p className="text-gray-300 text-sm">Manage verified notaries and review applications</p>
                </div>
              </div>
            </div>
            {applications.length > 0 && (
              <button
                onClick={() => setActiveTab('applications')}
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                {applications.length} Pending Applications
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Notaries', value: stats.total, icon: UserCheck, color: 'bg-gray-800' },
            { label: 'Verified', value: stats.verified, icon: CheckCircle2, color: 'bg-green-600' },
            { label: 'Pending Applications', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
            { label: 'Suspended', value: stats.suspended, icon: XCircle, color: 'bg-red-500' },
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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('notaries')}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'notaries' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            All Notaries ({notaries.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Applications
            {applications.length > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{applications.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'notaries' && (
          <div className="flex gap-6">
            {/* Notary Table */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, license or location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'all' | NotaryStatus)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notary</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Docs</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredNotaries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-gray-500">
                          <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="font-medium">No notaries found</p>
                        </td>
                      </tr>
                    ) : filteredNotaries.map(notary => (
                      <tr
                        key={notary.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedNotary?.id === notary.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedNotary(notary)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {notary.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{notary.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{notary.licenseNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {notary.location.split(',')[0]}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {notary.specialization.slice(0, 2).map(s => (
                              <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            {notary.rating}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">{notary.completedDocs}</span>
                        </td>
                        <td className="py-3 px-4">{statusBadge(notary.status)}</td>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedNotary(notary)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Eye className="h-4 w-4" /></button>
                            {notary.status === 'verified' ? (
                              <button onClick={() => handleSuspend(notary.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Suspend"><XCircle className="h-4 w-4" /></button>
                            ) : (
                              <button onClick={() => handleActivate(notary.id)} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Activate"><CheckCircle2 className="h-4 w-4" /></button>
                            )}
                            <button onClick={() => { if (confirm('Delete notary?')) setNotaries(p => p.filter(n => n.id !== notary.id)) }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
                Showing {filteredNotaries.length} of {notaries.length} notaries
              </div>
            </div>

            {/* Notary Detail Panel */}
            {selectedNotary && (
              <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Notary Details</h3>
                  <button onClick={() => setSelectedNotary(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
                </div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    {selectedNotary.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-gray-900">{selectedNotary.name}</h4>
                  <p className="text-xs text-gray-500 font-mono mb-2">{selectedNotary.licenseNumber}</p>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.floor(selectedNotary.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                    <span className="text-sm font-semibold ml-1">{selectedNotary.rating}</span>
                  </div>
                  {statusBadge(selectedNotary.status)}
                </div>

                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-gray-400" />{selectedNotary.email}</div>
                  <div className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4 text-gray-400" />{selectedNotary.phone}</div>
                  <div className="flex items-center gap-2 text-gray-700"><MapPin className="h-4 w-4 text-gray-400" />{selectedNotary.location}</div>
                  <div className="flex items-center gap-2 text-gray-700"><Briefcase className="h-4 w-4 text-gray-400" />{selectedNotary.experience} years experience</div>
                  <div className="flex items-center gap-2 text-gray-700"><FileText className="h-4 w-4 text-gray-400" />{selectedNotary.completedDocs} docs completed</div>
                  <div className="flex items-center gap-2 text-gray-700"><Award className="h-4 w-4 text-gray-400" />{selectedNotary.barCouncilNumber}</div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Specializations</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedNotary.specialization.map(s => (
                      <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between text-sm">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-bold text-gray-900">₹{selectedNotary.consultationFee}</span>
                </div>

                <div className="space-y-2">
                  {selectedNotary.status === 'verified' ? (
                    <button onClick={() => handleSuspend(selectedNotary.id)} className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-red-200 transition-colors">
                      <XCircle className="h-4 w-4" /> Suspend Notary
                    </button>
                  ) : (
                    <button onClick={() => handleActivate(selectedNotary.id)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle2 className="h-4 w-4" /> Activate Notary
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">All Clear!</h3>
                <p className="text-gray-500">No pending notary applications to review.</p>
              </div>
            ) : applications.map(app => (
              <div key={app.id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{app.name}</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">PENDING</span>
                      <span className="text-xs text-gray-500 font-mono">{app.id}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><Mail className="h-4 w-4" />{app.email}</div>
                      <div className="flex items-center gap-1"><Phone className="h-4 w-4" />{app.phone}</div>
                      <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{app.location}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">Applied on</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1"><Calendar className="h-3 w-3" />{app.appliedDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                  <div><p className="text-xs text-gray-500 mb-1">License Number</p><p className="text-sm font-semibold text-gray-900">{app.licenseNumber}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Bar Council</p><p className="text-sm font-semibold text-gray-900">{app.barCouncilNumber}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Experience</p><p className="text-sm font-semibold text-gray-900 flex items-center gap-1"><Briefcase className="h-4 w-4 text-gray-500" />{app.experience}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Specialization</p><p className="text-sm font-semibold text-gray-900 flex items-center gap-1"><Award className="h-4 w-4 text-gray-500" />{app.specialization}</p></div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Submitted Documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Notary Certificate', 'ID Proof', 'Bar Council Certificate'].map(doc => (
                      <button key={doc} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                        <FileText className="h-4 w-4" />{doc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Eye className="h-5 w-5" /> View Full Profile
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="h-5 w-5" /> Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="h-5 w-5" /> Approve & Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
