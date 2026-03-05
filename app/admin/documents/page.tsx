'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText, Shield, ArrowLeft, Search, Download,
  Eye, Trash2, ChevronDown, UserCheck, Users,
  CheckCircle, Clock, AlertTriangle, XCircle,
  Calendar, Tag, BarChart3, FileCheck
} from 'lucide-react'

type DocStatus = 'draft' | 'in_progress' | 'completed' | 'signed' | 'notarized'
type DocCategory = 'property' | 'corporate' | 'affidavit' | 'power_of_attorney' | 'nda' | 'other'

interface Document {
  id: string
  title: string
  category: DocCategory
  client: string
  clientEmail: string
  notary: string
  status: DocStatus
  amount: number
  createdDate: string
  updatedDate: string
  completion: number
}

const MOCK_DOCS: Document[] = [
  { id: 'DOC-1234', title: 'Flat Rental Agreement', category: 'property', client: 'Rajesh Kumar', clientEmail: 'rajesh.k@email.com', notary: 'Adv. Ramesh Iyer', status: 'completed', amount: 398, createdDate: '2024-01-20', updatedDate: '2024-01-23', completion: 100 },
  { id: 'DOC-1235', title: 'General Power of Attorney', category: 'power_of_attorney', client: 'Priya Sharma', clientEmail: 'priya.s@email.com', notary: 'Pending Assignment', status: 'in_progress', amount: 999, createdDate: '2024-01-21', updatedDate: '2024-01-23', completion: 60 },
  { id: 'DOC-1236', title: 'General Affidavit', category: 'affidavit', client: 'Amit Verma', clientEmail: 'amit.v@email.com', notary: 'Adv. Meera Nair', status: 'draft', amount: 398, createdDate: '2024-01-22', updatedDate: '2024-01-22', completion: 30 },
  { id: 'DOC-1237', title: 'Non-Disclosure Agreement', category: 'nda', client: 'TechStart Pvt Ltd', clientEmail: 'legal@techstart.com', notary: 'Adv. Suresh Reddy', status: 'signed', amount: 1499, createdDate: '2024-01-19', updatedDate: '2024-01-23', completion: 100 },
  { id: 'DOC-1238', title: 'Commercial Office Agreement', category: 'property', client: 'Sunita Joshi', clientEmail: 'sunita.j@email.com', notary: 'Adv. Ramesh Iyer', status: 'notarized', amount: 799, createdDate: '2024-01-18', updatedDate: '2024-01-22', completion: 100 },
  { id: 'DOC-1239', title: 'House Rental Agreement', category: 'property', client: 'Pooja Gupta', clientEmail: 'pooja.g@email.com', notary: 'Pending Assignment', status: 'draft', amount: 398, createdDate: '2024-01-23', updatedDate: '2024-01-23', completion: 15 },
  { id: 'DOC-1240', title: 'Name Change Affidavit', category: 'affidavit', client: 'Kiran Reddy', clientEmail: 'kiran.r@email.com', notary: 'Adv. Anjali Singh', status: 'in_progress', amount: 499, createdDate: '2024-01-22', updatedDate: '2024-01-23', completion: 75 },
  { id: 'DOC-1241', title: 'Special Power of Attorney', category: 'power_of_attorney', client: 'Rajesh Kumar', clientEmail: 'rajesh.k@email.com', notary: 'Adv. Meera Nair', status: 'completed', amount: 1199, createdDate: '2024-01-17', updatedDate: '2024-01-20', completion: 100 },
]

const statusBadge = (status: DocStatus) => {
  switch (status) {
    case 'completed':   return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" />Completed</span>
    case 'notarized':   return <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><FileCheck className="h-3 w-3" />Notarized</span>
    case 'signed':      return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" />Signed</span>
    case 'in_progress': return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><Clock className="h-3 w-3" />In Progress</span>
    case 'draft':       return <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" />Draft</span>
  }
}

const categoryLabel = (cat: DocCategory) => {
  const map: Record<DocCategory, string> = {
    property: 'Property',
    corporate: 'Corporate',
    affidavit: 'Affidavit',
    power_of_attorney: 'Power of Attorney',
    nda: 'NDA',
    other: 'Other',
  }
  return map[cat]
}

const categoryColor = (cat: DocCategory) => {
  const map: Record<DocCategory, string> = {
    property: 'bg-green-100 text-green-700',
    corporate: 'bg-blue-100 text-blue-700',
    affidavit: 'bg-purple-100 text-purple-700',
    power_of_attorney: 'bg-orange-100 text-orange-700',
    nda: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
  }
  return map[cat]
}

export default function DocumentManagementPage() {
  const [docs, setDocs] = useState<Document[]>(MOCK_DOCS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DocStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | DocCategory>('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const filtered = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  })

  const stats = {
    total: docs.length,
    completed: docs.filter(d => d.status === 'completed' || d.status === 'notarized' || d.status === 'signed').length,
    inProgress: docs.filter(d => d.status === 'in_progress').length,
    drafts: docs.filter(d => d.status === 'draft').length,
    revenue: docs.reduce((acc, d) => acc + d.amount, 0),
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocs(prev => prev.filter(d => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
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
                  <h1 className="text-2xl font-bold">Document Management</h1>
                  <p className="text-gray-300 text-sm">View and manage all platform documents & orders</p>
                </div>
              </div>
            </div>
            <button className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm">
              <Download className="h-4 w-4" />
              Export All
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: stats.total, icon: FileText, color: 'bg-gray-800' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-600' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-yellow-500' },
            { label: 'Drafts', value: stats.drafts, icon: AlertTriangle, color: 'bg-gray-400' },
            { label: 'Total Revenue', value: `₹${(stats.revenue / 100).toFixed(0)}`, icon: BarChart3, color: 'bg-emerald-600' },
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

        <div className="flex gap-6">
          {/* Main Table */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, client or document ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'all' | DocStatus)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="signed">Signed</option>
                    <option value="notarized">Notarized</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value as 'all' | DocCategory)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="property">Property</option>
                    <option value="affidavit">Affidavit</option>
                    <option value="power_of_attorney">Power of Attorney</option>
                    <option value="corporate">Corporate</option>
                    <option value="nda">NDA</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4 text-gray-600" />
                </button>
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-500">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="font-medium">No documents found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : filtered.map(doc => (
                    <tr
                      key={doc.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
                        <p className="text-xs text-gray-500 font-mono">{doc.id}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColor(doc.category)}`}>
                          {categoryLabel(doc.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                            {doc.client[0]}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{doc.client}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <UserCheck className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs">{doc.notary}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{statusBadge(doc.status)}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-gray-900">₹{doc.amount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {doc.createdDate}
                        </div>
                      </td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedDoc(doc)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Eye className="h-4 w-4" /></button>
                          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="Download PDF"><Download className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>Showing {filtered.length} of {docs.length} documents</span>
              <span className="font-semibold text-gray-700">
                Revenue: ₹{filtered.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}
              </span>
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
                <p className="text-xs text-gray-500 font-mono mt-1">{selectedDoc.id}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {statusBadge(selectedDoc.status)}
                </div>
              </div>

              {/* Completion Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Completion</span>
                  <span className="font-semibold">{selectedDoc.completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${selectedDoc.completion === 100 ? 'bg-green-500' : 'bg-gray-800'}`}
                    style={{ width: `${selectedDoc.completion}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex items-center gap-3 text-gray-700"><Tag className="h-4 w-4 text-gray-400" /><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColor(selectedDoc.category)}`}>{categoryLabel(selectedDoc.category)}</span></div>
                <div className="flex items-start gap-3 text-gray-700"><Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" /><div><p className="font-medium">{selectedDoc.client}</p><p className="text-xs text-gray-500">{selectedDoc.clientEmail}</p></div></div>
                <div className="flex items-center gap-3 text-gray-700"><UserCheck className="h-4 w-4 text-gray-400" />{selectedDoc.notary}</div>
                <div className="flex items-center gap-3 text-gray-700"><Calendar className="h-4 w-4 text-gray-400" />Created {selectedDoc.createdDate}</div>
                <div className="flex items-center gap-3 text-gray-700"><Calendar className="h-4 w-4 text-gray-400" />Updated {selectedDoc.updatedDate}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Document Fee</span>
                <span className="text-lg font-bold text-gray-900">₹{selectedDoc.amount}</span>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-red-200 transition-colors"
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
