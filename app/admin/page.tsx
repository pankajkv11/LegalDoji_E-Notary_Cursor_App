'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Users, FileText, Video, DollarSign, TrendingUp, Settings,
  UserCheck, Clock, CheckCircle, AlertTriangle, Search,
  Filter, Download, Eye, Edit, Trash2, BarChart3, Shield,
  Calendar, Mail, Phone, MapPin, Building2, CreditCard,
  XCircle, CheckCircle2, FileCheck, Award, Briefcase, Loader2
} from 'lucide-react'
import {
  useNotaryApplicationsQuery,
  useApproveNotaryApplicationMutation,
  useRejectNotaryApplicationMutation,
} from '@/graphql/generated/hooks'

export default function AdminPage() {
  // Fetch pending notary applications from GraphQL
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError, refetch: refetchApplications } = useNotaryApplicationsQuery({
    variables: { status: 'PENDING' },
    errorPolicy: 'all',
  })

  const [approveApplication, { loading: approving }] = useApproveNotaryApplicationMutation({
    onCompleted: () => {
      refetchApplications()
    },
    onError: (error) => {
      alert(`Failed to approve: ${error.message}`)
    },
  })

  const [rejectApplication, { loading: rejecting }] = useRejectNotaryApplicationMutation({
    onCompleted: () => {
      refetchApplications()
    },
    onError: (error) => {
      alert(`Failed to reject: ${error.message}`)
    },
  })

  // Transform GraphQL data to component format (handle potential errors gracefully)
  const pendingApplications = applicationsData?.notaryApplications?.map(app => ({
    id: app.applicationNumber,
    dbId: app.id,
    name: `${app.firstName}${app.middleName ? ' ' + app.middleName : ''} ${app.lastName}`,
    email: app.email,
    phone: app.phone,
    licenseNumber: app.licenseNumber || 'Not provided',
    barCouncilNumber: app.barCouncilNumber || 'Not provided',
    experience: app.experience || 'Not provided',
    specialization: app.specialization || 'Not specified',
    location: app.location || 'Not specified',
    documents: {
      certificate: 'notary_certificate.pdf',
      idProof: 'id_proof.pdf',
      barCouncilCert: 'bar_council_cert.pdf'
    },
    appliedDate: app.appliedAt ? new Date(app.appliedAt).toISOString().split('T')[0] : 'N/A',
    status: app.status?.toLowerCase() || 'pending'
  })) || []

  // Show auth error message if query fails due to permission
  const authError = applicationsError?.message?.includes('Admin only') || applicationsError?.message?.includes('Authentication')

  // Admin Statistics
  const adminStats = [
    { name: 'Total Users', value: '2,543', change: '+12%', icon: Users, color: 'bg-blue-500', trend: 'up' },
    { name: 'Total Documents', value: '8,921', change: '+8%', icon: FileText, color: 'bg-green-500', trend: 'up' },
    { name: 'Active Notaries', value: '47', change: '+5', icon: UserCheck, color: 'bg-purple-500', trend: 'up' },
    { name: 'Pending Applications', value: pendingApplications.length.toString(), change: '+3', icon: FileCheck, color: 'bg-yellow-500', trend: 'up' },
    { name: 'Revenue (Month)', value: '₹4.2L', change: '+18%', icon: DollarSign, color: 'bg-emerald-500', trend: 'up' },
    { name: 'Pending Orders', value: '156', change: '-3%', icon: Clock, color: 'bg-orange-500', trend: 'down' },
    { name: 'Active Sessions', value: '12', change: '0', icon: Video, color: 'bg-red-500', trend: 'neutral' },
    { name: 'Support Tickets', value: '23', change: '-15%', icon: AlertTriangle, color: 'bg-pink-500', trend: 'down' }
  ]

  // Recent Users
  const recentUsers = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh.k@email.com', phone: '+91 98765 43210', type: 'Client', joinDate: '2024-01-20', status: 'active', documents: 3 },
    { id: 2, name: 'Priya Sharma', email: 'priya.s@email.com', phone: '+91 98765 43211', type: 'Client', joinDate: '2024-01-21', status: 'active', documents: 1 },
    { id: 3, name: 'Adv. Ramesh Iyer', email: 'ramesh@notary.com', phone: '+91 98765 43212', type: 'Notary', joinDate: '2024-01-19', status: 'active', documents: 45 },
    { id: 4, name: 'Sneha Patel', email: 'sneha.p@email.com', phone: '+91 98765 43213', type: 'Client', joinDate: '2024-01-22', status: 'inactive', documents: 0 }
  ]

  // Recent Documents
  const recentDocuments = [
    { id: 'DOC-1234', title: 'Rental Agreement', client: 'Rajesh Kumar', notary: 'Adv. Ramesh Iyer', status: 'completed', amount: '₹398', date: '2024-01-23', sessionTime: '10:30 AM' },
    { id: 'DOC-1235', title: 'Power of Attorney', client: 'Priya Sharma', notary: 'Pending Assignment', status: 'in-progress', amount: '₹999', date: '2024-01-23', sessionTime: '2:00 PM' },
    { id: 'DOC-1236', title: 'Affidavit', client: 'Amit Verma', notary: 'Adv. Kavita Menon', status: 'draft', amount: '₹398', date: '2024-01-22', sessionTime: 'Not Scheduled' }
  ]

  // Active Notaries
  const activeNotaries = [
    { id: 1, name: 'Adv. Ramesh Iyer', location: 'Mumbai', rating: 4.8, completedDocs: 245, status: 'Available' },
    { id: 2, name: 'Adv. Meera Nair', location: 'Bangalore', rating: 4.9, completedDocs: 189, status: 'Busy' },
    { id: 3, name: 'Adv. Suresh Reddy', location: 'Hyderabad', rating: 4.7, completedDocs: 312, status: 'Available' },
    { id: 4, name: 'Adv. Anjali Singh', location: 'Delhi', rating: 4.6, completedDocs: 156, status: 'Offline' }
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

  // Handler functions for application actions
  const handleApproveApplication = async (applicationId: string, dbId: string) => {
    if (confirm('Are you sure you want to approve this application?')) {
      try {
        await approveApplication({
          variables: { applicationId: dbId },
        })
        alert(`Application ${applicationId} approved successfully!`)
      } catch (error) {
        // Error handled by onError callback
      }
    }
  }

  const handleRejectApplication = async (applicationId: string, dbId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (confirm('Are you sure you want to reject this application?')) {
      try {
        await rejectApplication({
          variables: { applicationId: dbId, reason: reason || undefined },
        })
        alert(`Application ${applicationId} rejected.`)
      } catch (error) {
        // Error handled by onError callback
      }
    }
  }

  const handleDownloadDocument = (docName: string) => {
    alert(`Downloading ${docName}...`)
  }

  const handleViewProfile = (applicationId: string) => {
    alert(`Opening full profile for ${applicationId}...`)
  }

  // Show login prompt if authentication error
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 max-w-md w-full mx-4 text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in as an administrator to access this page.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Admin Credentials:</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> admin@legaldoji.com
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Password:</span> Admin@123
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold text-center transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
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
          {adminStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <span className={`text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
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
          <Link href="/admin/notaries" className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-xl p-6 transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 group-hover:bg-gray-900 p-3 rounded-lg transition-colors">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Notary Management</h3>
                <p className="text-sm text-gray-600">Manage notary applications</p>
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
              {pendingApplications.map((application) => (
                <div key={application.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-all">
                  {/* Application Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{application.name}</h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {application.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{application.id}</span>
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
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{application.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Applied on</p>
                      <p className="text-sm font-semibold text-gray-900">{application.appliedDate}</p>
                    </div>
                  </div>

                  {/* Application Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notary License Number</p>
                      <p className="text-sm font-semibold text-gray-900">{application.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bar Council Number</p>
                      <p className="text-sm font-semibold text-gray-900">{application.barCouncilNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Experience</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-gray-700" />
                        {application.experience}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Specialization</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Award className="h-4 w-4 text-gray-700" />
                        {application.specialization}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-gray-700" />
                        {application.location}
                      </p>
                    </div>
                  </div>

                  {/* Submitted Documents */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">Submitted Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDownloadDocument('Notary Certificate')}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Notary Certificate
                        <Download className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument('ID Proof')}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        ID Proof
                        <Download className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument('Bar Council Certificate')}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Bar Council Certificate
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewProfile(application.id)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                      View Full Profile
                    </button>
                    <button
                      onClick={() => handleRejectApplication(application.id, application.dbId)}
                      disabled={rejecting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {rejecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveApplication(application.id, application.dbId)}
                      disabled={approving}
                      className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {approving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      Approve & Activate
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {applicationsLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Applications...</h3>
              </div>
            )}

            {!applicationsLoading && pendingApplications.length === 0 && (
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
            {/* Documents Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="h-5 w-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{doc.id}</span>
                          {getStatusBadge(doc.status)}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{doc.client}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            <span>{doc.notary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{doc.date} at {doc.sessionTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{doc.amount}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button className="flex-1 bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/documents" className="block mt-4 text-center text-gray-900 hover:text-black font-semibold text-sm">
                View All Documents
              </Link>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
                <Link href="/admin/users" className="text-gray-900 hover:text-black font-semibold text-sm">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${user.type === 'Notary' ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white'}`}>
                            {user.type}
                          </span>
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(user.status)}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            <button className="text-gray-700 hover:text-gray-900 p-1">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-700 hover:text-gray-900 p-1">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Notaries */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Active Notaries</h3>
              <div className="space-y-3">
                {activeNotaries.map((notary) => (
                  <div key={notary.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{notary.name}</h4>
                        <p className="text-xs text-gray-600">{notary.location}</p>
                      </div>
                      {getStatusBadge(notary.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>⭐ {notary.rating}</span>
                      <span>{notary.completedDocs} docs</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/notaries" className="block mt-4 text-center text-gray-900 hover:text-black font-semibold text-sm">
                View All Notaries
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/users/new"
                  className="block w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Add New User
                </Link>
                <Link
                  href="/admin/notaries/applications"
                  className="block w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Review Notary Applications
                </Link>
                <Link
                  href="/admin/broadcast"
                  className="block w-full bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Send Broadcast
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
