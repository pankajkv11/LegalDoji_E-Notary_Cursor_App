'use client'

import React from 'react'
import Link from 'next/link'
import {
  FileText, Upload, Package, Clock, CheckCircle, AlertCircle, Plus, Eye, Download,
  TrendingUp, Calendar, Video, MapPin, Truck, Edit, User, Phone, Mail, Loader2
} from 'lucide-react'
import { useMeQuery, useMyDocumentsQuery, useMyOrdersQuery, useMyAppointmentsQuery, useMyDeliveriesQuery } from '@/graphql/generated/hooks'

export default function UserDashboardPage() {
  // Fetch user data
  const { data: userData, loading: userLoading } = useMeQuery()
  
  // Fetch documents
  const { data: documentsData, loading: documentsLoading } = useMyDocumentsQuery({
    variables: { filter: { limit: 10 } }
  })

  // Fetch orders
  const { data: ordersData, loading: ordersLoading } = useMyOrdersQuery({
    variables: { filter: { limit: 10 } }
  })

  // Fetch appointments
  const { data: appointmentsData, loading: appointmentsLoading } = useMyAppointmentsQuery({
    variables: { status: undefined }
  })

  // Fetch deliveries
  const { data: deliveriesData, loading: deliveriesLoading } = useMyDeliveriesQuery()

  // Map GraphQL data to component format
  const upcomingAppointments = React.useMemo(() => {
    if (!appointmentsData?.myAppointments) return []
    return appointmentsData.myAppointments
      .filter((apt: any) => apt.status === 'PENDING' || apt.status === 'CONFIRMED')
      .slice(0, 2)
      .map((apt: any) => ({
        id: apt.id,
        notaryName: 'Notary', // Would need to fetch notary details
        documentType: apt.documentType || 'Document',
        date: apt.scheduledDate,
        time: apt.scheduledTime,
        meetingLink: apt.meetingLink || '#',
        status: apt.status.toLowerCase(),
        notaryPhone: '+91 98765 43210',
        location: 'Location'
      }))
  }, [appointmentsData])

  const deliveryTracking = React.useMemo(() => {
    if (!deliveriesData?.myDeliveries) return []
    return deliveriesData.myDeliveries.slice(0, 2).map((del: any) => ({
      id: del.id,
      documentName: del.documentName,
      status: del.status.toLowerCase().replace('_', '-'),
      courierPartner: del.courierPartner,
      trackingNumber: del.trackingNumber,
      currentLocation: del.currentLocation || 'Processing',
      expectedDelivery: del.expectedDelivery,
      stages: del.stages?.map((stage: any) => ({
        name: stage.name,
        completed: stage.completed,
        date: stage.date
      })) || []
    }))
  }, [deliveriesData])

  const savedDrafts = React.useMemo(() => {
    if (!documentsData?.myDocuments?.nodes) return []
    return documentsData.myDocuments.nodes
      .filter((doc: any) => doc.status === 'DRAFT')
      .slice(0, 3)
      .map((doc: any) => ({
        id: doc.id,
        name: doc.title,
        documentType: doc.category,
        lastEdited: new Date(doc.updatedAt).toLocaleDateString(),
        completionPercentage: doc.completionPercentage || 0,
        step: `Step ${doc.currentStep || 1} of ${doc.currentStep ? doc.currentStep + 1 : 4}`
      }))
  }, [documentsData])

  const stats = React.useMemo(() => {
    const totalDocs = documentsData?.myDocuments?.pageInfo?.totalCount || 0
    const activeOrders = ordersData?.myOrders?.nodes?.filter((o: any) => 
      o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
    ).length || 0
    const drafts = savedDrafts.length
    const appointments = upcomingAppointments.length

    return [
      { name: 'Total Documents', value: totalDocs.toString(), icon: FileText, color: 'bg-blue-500', trend: '+3 this month' },
      { name: 'Active Orders', value: activeOrders.toString(), icon: Package, color: 'bg-green-500', trend: '2 in transit' },
      { name: 'Saved Drafts', value: drafts.toString(), icon: Clock, color: 'bg-yellow-500', trend: 'Complete them' },
      { name: 'Appointments', value: appointments.toString(), icon: Calendar, color: 'bg-purple-500', trend: 'Upcoming' }
    ]
  }, [documentsData, ordersData, savedDrafts, upcomingAppointments])

  const recentDocuments = React.useMemo(() => {
    if (!documentsData?.myDocuments?.nodes) return []
    return documentsData.myDocuments.nodes.slice(0, 3).map((doc: any) => ({
      id: doc.id,
      name: doc.title,
      type: doc.category,
      status: doc.status.toLowerCase(),
      date: new Date(doc.createdAt).toLocaleDateString(),
      amount: '₹398', // Would need to fetch from order
      notary: 'Notary' // Would need to fetch notary details
    }))
  }, [documentsData])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData?.me) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your dashboard</p>
          <Link href="/login" className="text-primary-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'delivered':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Completed</span>
      case 'in-progress':
      case 'pending':
      case 'processing':
        return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">In Progress</span>
      case 'in-transit':
        return <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded">In Transit</span>
      case 'notarized':
        return <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded">Notarized</span>
      case 'draft':
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">Draft</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userData?.me?.name?.split(' ')[0] || 'User'}!</h1>
              <p className="text-primary-100 mt-1">Here's your document overview and quick actions.</p>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              New Document
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Links Section - Moved Up */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Quick Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/create"
              className="flex flex-col items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Create Document</span>
            </Link>
            <Link
              href="/dashboard/upload"
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Upload Document</span>
            </Link>
            <Link
              href="/consultation"
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Book Consultation</span>
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Track Orders</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.name}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
                  </div>
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid - Two Columns */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Appointments & Saved Drafts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Upcoming Appointments
                </h2>
                <Link href="/dashboard/appointments" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                  View All →
                </Link>
              </div>

              <div className="p-6">
                {upcomingAppointments.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusBadge(appointment.status)}
                            </div>
                            <h3 className="font-bold text-gray-900">{appointment.documentType}</h3>
                          </div>
                          <Video className="h-6 w-6 text-primary-600" />
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{appointment.notaryName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{appointment.date} at {appointment.time}</span>
                          </div>
                        </div>

                        <a
                          href={appointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Join Meeting
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-3">No upcoming appointments</p>
                    <Link
                      href="/consultation"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Schedule a Consultation →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Drafts */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit className="h-5 w-5 text-yellow-600" />
                  Saved Drafts
                </h2>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {savedDrafts.length} drafts
                </span>
              </div>

              <div className="p-6">
                {savedDrafts.length > 0 ? (
                  <div className="space-y-4">
                    {savedDrafts.map((draft) => (
                      <div key={draft.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                                {draft.documentType}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{draft.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">Last edited: {draft.lastEdited}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <span>{draft.step}</span>
                            <span className="font-semibold text-gray-700">{draft.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all"
                              style={{ width: `${draft.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/create?draft=${draft.id}`}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors"
                          >
                            Continue Editing
                          </Link>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Edit className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-3">No saved drafts</p>
                    <Link
                      href="/create"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Create a Document →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Docs & Delivery */}
          <div className="space-y-6">
            {/* Recent Documents */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Recent Documents
                </h2>
              </div>
              <div className="p-4">
                {recentDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {recentDocuments.slice(0, 4).map((doc) => (
                      <div key={doc.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{doc.name}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{doc.type}</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No documents yet</p>
                  </div>
                )}
                <Link
                  href="/dashboard/documents"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium text-center mt-4 transition-colors"
                >
                  View All Documents
                </Link>
              </div>
            </div>

            {/* Delivery Tracking Compact */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  Deliveries
                </h2>
              </div>
              <div className="p-4">
                {deliveryTracking.length > 0 ? (
                  <div className="space-y-3">
                    {deliveryTracking.slice(0, 2).map((delivery) => (
                      <div key={delivery.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{delivery.documentName}</h3>
                          {getStatusBadge(delivery.status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{delivery.currentLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>Expected: {delivery.expectedDelivery}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Truck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No active deliveries</p>
                  </div>
                )}
                <Link
                  href="/dashboard/deliveries"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium text-center mt-4 transition-colors"
                >
                  Track All Deliveries
                </Link>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-primary-100 text-sm mb-4">Our support team is available 24/7 to assist you.</p>
              <div className="space-y-2">
                <Link
                  href="/contact"
                  className="block w-full bg-white text-primary-700 hover:bg-primary-50 px-4 py-2.5 rounded-lg text-sm font-semibold text-center transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  href="/faq"
                  className="block w-full bg-white/15 hover:bg-white/25 px-4 py-2.5 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
