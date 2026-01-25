'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FileText, Upload, Package, Clock, CheckCircle, AlertCircle, Plus, Eye, Download,
  TrendingUp, Calendar, Video, MapPin, Truck, Edit, User, Phone, Mail
} from 'lucide-react'

export default function UserDashboardPage() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: 'APT-001',
      notaryName: 'Adv. Ramesh Iyer',
      documentType: 'Rental Agreement',
      date: '2024-01-25',
      time: '3:00 PM',
      meetingLink: 'https://meet.legaldoji.com/apt-001',
      status: 'confirmed',
      notaryPhone: '+91 98765 43210',
      location: 'Mumbai, Maharashtra'
    },
    {
      id: 'APT-002',
      notaryName: 'Adv. Meera Nair',
      documentType: 'Power of Attorney',
      date: '2024-01-26',
      time: '11:00 AM',
      meetingLink: 'https://meet.legaldoji.com/apt-002',
      status: 'pending',
      notaryPhone: '+91 98765 43211',
      location: 'Bangalore, Karnataka'
    }
  ])

  const deliveryTracking = [
    {
      id: 'DEL-8921',
      documentName: 'Rental Agreement - Mumbai Property',
      status: 'in-transit',
      courierPartner: 'Delhivery',
      trackingNumber: 'DEL1234567890',
      currentLocation: 'Mumbai Hub',
      expectedDelivery: '2024-01-26',
      stages: [
        { name: 'Document Created', completed: true, date: '2024-01-22' },
        { name: 'Notarized', completed: true, date: '2024-01-23' },
        { name: 'Printed & Packed', completed: true, date: '2024-01-24' },
        { name: 'In Transit', completed: true, date: '2024-01-25' },
        { name: 'Out for Delivery', completed: false, date: null },
        { name: 'Delivered', completed: false, date: null }
      ]
    },
    {
      id: 'DEL-8920',
      documentName: 'Affidavit - General',
      status: 'processing',
      courierPartner: 'Blue Dart',
      trackingNumber: 'BD9876543210',
      currentLocation: 'Processing Center',
      expectedDelivery: '2024-01-28',
      stages: [
        { name: 'Document Created', completed: true, date: '2024-01-24' },
        { name: 'Notarized', completed: true, date: '2024-01-25' },
        { name: 'Printed & Packed', completed: false, date: null },
        { name: 'In Transit', completed: false, date: null },
        { name: 'Out for Delivery', completed: false, date: null },
        { name: 'Delivered', completed: false, date: null }
      ]
    }
  ]

  const savedDrafts = [
    {
      id: 'DFT-001',
      name: 'Sale Deed - Property Transfer',
      documentType: 'Sale Deed',
      lastEdited: '2024-01-24',
      completionPercentage: 75,
      step: 'Step 3 of 4'
    },
    {
      id: 'DFT-002',
      name: 'NDA Agreement - Business',
      documentType: 'NDA',
      lastEdited: '2024-01-23',
      completionPercentage: 40,
      step: 'Step 2 of 4'
    },
    {
      id: 'DFT-003',
      name: 'Employment Contract',
      documentType: 'Contract',
      lastEdited: '2024-01-22',
      completionPercentage: 20,
      step: 'Step 1 of 4'
    }
  ]

  const stats = [
    { name: 'Total Documents', value: '12', icon: FileText, color: 'bg-blue-500', trend: '+3 this month' },
    { name: 'Active Orders', value: '3', icon: Package, color: 'bg-green-500', trend: '2 in transit' },
    { name: 'Saved Drafts', value: savedDrafts.length.toString(), icon: Clock, color: 'bg-yellow-500', trend: 'Complete them' },
    { name: 'Appointments', value: upcomingAppointments.length.toString(), icon: Calendar, color: 'bg-purple-500', trend: 'Upcoming' }
  ]

  const recentDocuments = [
    {
      id: 'DOC-001',
      name: 'Rental Agreement - Mumbai Property',
      type: 'Property',
      status: 'completed',
      date: '2024-01-20',
      amount: '₹398',
      notary: 'Adv. Ramesh Iyer'
    },
    {
      id: 'DOC-002',
      name: 'Employment Agreement - Tech Corp',
      type: 'Business',
      status: 'in-progress',
      date: '2024-01-22',
      amount: '₹999',
      notary: 'Adv. Meera Nair'
    },
    {
      id: 'DOC-003',
      name: 'General Affidavit',
      type: 'Personal',
      status: 'notarized',
      date: '2024-01-23',
      amount: '₹398',
      notary: 'Adv. Suresh Reddy'
    }
  ]

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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
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
            <Link href="/dashboard/appointments" className="text-gray-900 hover:text-black font-semibold text-sm">
              View All
            </Link>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-900 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{appointment.id}</span>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{appointment.documentType}</h3>
                    </div>
                    <Video className="h-8 w-8 text-gray-700" />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{appointment.notaryName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{appointment.date} at {appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{appointment.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{appointment.notaryPhone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Join Meeting
                    </a>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming appointments</p>
              <Link
                href="/consultation"
                className="inline-block mt-4 text-gray-900 hover:text-black font-semibold text-sm"
              >
                Schedule a Consultation
              </Link>
            </div>
          )}
        </div>

        {/* Physical Delivery Tracking */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-6 w-6 text-gray-700" />
              Physical Delivery Tracking
            </h2>
          </div>

          {deliveryTracking.length > 0 ? (
            <div className="space-y-6">
              {deliveryTracking.map((delivery) => (
                <div key={delivery.id} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-500">{delivery.id}</span>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{delivery.documentName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {delivery.courierPartner}
                        </span>
                        <span className="font-mono">{delivery.trackingNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Expected Delivery</p>
                      <p className="text-sm font-bold text-gray-900">{delivery.expectedDelivery}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <MapPin className="h-4 w-4 text-gray-700" />
                      <span className="font-semibold text-gray-900">Current Location:</span>
                      <span className="text-gray-700">{delivery.currentLocation}</span>
                    </div>
                  </div>

                  {/* Delivery Progress */}
                  <div className="space-y-3">
                    {delivery.stages.map((stage, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          stage.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                          {stage.completed && <CheckCircle className="h-4 w-4 text-white" />}
                          {!stage.completed && <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${stage.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                              {stage.name}
                            </p>
                            {stage.date && (
                              <p className="text-xs text-gray-500">{stage.date}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Track on {delivery.courierPartner} Website
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No active deliveries</p>
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
                  {savedDrafts.length} drafts
                </span>
              </div>

              {savedDrafts.length > 0 ? (
                <div className="space-y-4">
                  {savedDrafts.map((draft) => (
                    <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">{draft.id}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {draft.documentType}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{draft.name}</h3>
                          <p className="text-xs text-gray-600">Last edited: {draft.lastEdited}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{draft.step}</span>
                          <span className="font-semibold">{draft.completionPercentage}% complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{ width: `${draft.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/create?draft=${draft.id}`}
                          className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors"
                        >
                          Continue Editing
                        </Link>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Edit className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No saved drafts</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Documents</h2>
              <div className="space-y-3">
                {recentDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gray-500">{doc.id}</span>
                      {getStatusBadge(doc.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{doc.name}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{doc.date}</span>
                      <span className="font-bold text-gray-900">{doc.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                <Link
                  href="/create"
                  className="block w-full bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors"
                >
                  Create New Document
                </Link>
                <Link
                  href="/dashboard/upload"
                  className="block w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Upload Document
                </Link>
                <Link
                  href="/consultation"
                  className="block w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
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
