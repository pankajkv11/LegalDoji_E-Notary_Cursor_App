'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Calendar, Video, DollarSign, CheckCircle, XCircle, Clock, User,
  Phone, Mail, MapPin, FileText, Award, TrendingUp, Eye, MessageSquare,
  AlertCircle, Star, Briefcase
} from 'lucide-react'

export default function NotaryDashboardPage() {
  const [pendingAppointments, setPendingAppointments] = useState([
    {
      id: 'APT-001',
      clientName: 'Rajesh Kumar',
      clientEmail: 'rajesh.k@email.com',
      clientPhone: '+91 98765 43210',
      documentType: 'Rental Agreement',
      scheduledDate: '2024-01-25',
      scheduledTime: '3:00 PM',
      timeUntilAppointment: '2 hours',
      hoursUntil: 2,
      status: 'pending',
      amount: '₹999',
      meetingLink: 'https://meet.legaldoji.com/apt-001',
      notes: 'Client needs assistance with property rental agreement for Mumbai flat'
    },
    {
      id: 'APT-002',
      clientName: 'Priya Sharma',
      clientEmail: 'priya.s@email.com',
      clientPhone: '+91 98765 43211',
      documentType: 'Power of Attorney',
      scheduledDate: '2024-01-25',
      scheduledTime: '5:00 PM',
      timeUntilAppointment: '3.5 hours',
      hoursUntil: 3.5,
      status: 'pending',
      amount: '₹999',
      meetingLink: 'https://meet.legaldoji.com/apt-002',
      notes: 'General Power of Attorney for property matters'
    },
    {
      id: 'APT-003',
      clientName: 'Amit Verma',
      clientEmail: 'amit.v@email.com',
      clientPhone: '+91 98765 43212',
      documentType: 'Affidavit',
      scheduledDate: '2024-01-26',
      scheduledTime: '11:00 AM',
      timeUntilAppointment: '22 hours',
      hoursUntil: 22,
      status: 'pending',
      amount: '₹999',
      meetingLink: 'https://meet.legaldoji.com/apt-003',
      notes: 'Name change affidavit required urgently'
    }
  ])

  const confirmedAppointments = [
    {
      id: 'APT-004',
      clientName: 'Neha Patel',
      documentType: 'Sale Deed',
      scheduledDate: '2024-01-27',
      scheduledTime: '2:00 PM',
      status: 'confirmed',
      amount: '₹999'
    }
  ]

  const earningsData = {
    todayEarnings: '₹2,997',
    weekEarnings: '₹15,984',
    monthEarnings: '₹67,932',
    totalEarnings: '₹2,45,678',
    pendingPayouts: '₹8,991',
    completedSessions: 68,
    averageRating: 4.8,
    totalReviews: 45
  }

  const recentCompletedSessions = [
    {
      id: 'SES-098',
      clientName: 'Suresh Reddy',
      documentType: 'Rental Agreement',
      completedDate: '2024-01-24',
      completedTime: '4:30 PM',
      duration: '45 mins',
      earnings: '₹999',
      rating: 5,
      review: 'Excellent service, very professional and helpful'
    },
    {
      id: 'SES-097',
      clientName: 'Kavita Menon',
      documentType: 'NDA',
      completedDate: '2024-01-24',
      completedTime: '11:00 AM',
      duration: '30 mins',
      earnings: '₹999',
      rating: 5,
      review: 'Quick and efficient, highly recommended'
    },
    {
      id: 'SES-096',
      clientName: 'Arjun Malhotra',
      documentType: 'Affidavit',
      completedDate: '2024-01-23',
      completedTime: '3:15 PM',
      duration: '40 mins',
      earnings: '₹999',
      rating: 4,
      review: 'Good experience overall'
    }
  ]

  const stats = [
    { name: 'Today\'s Earnings', value: earningsData.todayEarnings, icon: DollarSign, color: 'bg-green-500', trend: '+3 sessions' },
    { name: 'Pending Appointments', value: pendingAppointments.length.toString(), icon: Clock, color: 'bg-yellow-500', trend: 'Awaiting action' },
    { name: 'Confirmed Today', value: '2', icon: CheckCircle, color: 'bg-blue-500', trend: 'Ready to start' },
    { name: 'Average Rating', value: earningsData.averageRating.toString(), icon: Star, color: 'bg-purple-500', trend: `${earningsData.totalReviews} reviews` }
  ]

  const handleAcceptAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to accept this appointment?')) {
      setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      alert(`Appointment ${appointmentId} accepted! Meeting link has been sent to the client.`)
    }
  }

  const handleDeclineAppointment = (appointmentId: string) => {
    const reason = prompt('Please provide a reason for declining (will be sent to client):')
    if (reason) {
      setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      alert(`Appointment ${appointmentId} declined. Client has been notified.`)
    }
  }

  const canTakeAction = (hoursUntil: number) => {
    return hoursUntil >= 4
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-gray-300 text-lg">Manage your appointments and track earnings</p>
            </div>
          </div>

          {/* Quick Actions - Top Right */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/notary/availability"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105"
              >
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">Set Availability</div>
              </Link>
              <Link
                href="/notary/profile"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105"
              >
                <User className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">My Profile</div>
              </Link>
              <Link
                href="/notary/payouts"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105"
              >
                <DollarSign className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">View Payouts</div>
              </Link>
              <Link
                href="/notary/sessions"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-center transition-all hover:scale-105"
              >
                <Video className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold text-sm">My Sessions</div>
              </Link>
            </div>
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

        {/* Pending Appointment Requests - Accept/Decline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-gray-700" />
              Pending Appointment Requests
            </h2>
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
              {pendingAppointments.length} pending
            </span>
          </div>

          {pendingAppointments.length > 0 ? (
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => {
                const canAct = canTakeAction(appointment.hoursUntil)
                return (
                  <div key={appointment.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6 hover:border-yellow-400 transition-all">
                    {/* Warning for appointments within 4 hours */}
                    {!canAct && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900">Action Required Soon</p>
                          <p className="text-xs text-red-700">
                            This appointment is in {appointment.timeUntilAppointment}. Accept or decline is disabled as it's less than 4 hours away.
                            Please contact client directly if needed.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-500">{appointment.id}</span>
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">
                            PENDING APPROVAL
                          </span>
                          {!canAct && (
                            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                              &lt; 4 HOURS
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{appointment.documentType}</h3>
                        <p className="text-sm text-gray-600">Scheduled: {appointment.scheduledDate} at {appointment.scheduledTime}</p>
                        <p className="text-xs text-gray-500">Time until appointment: {appointment.timeUntilAppointment}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{appointment.amount}</p>
                        <p className="text-xs text-gray-500">Session fee</p>
                      </div>
                    </div>

                    {/* Client Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Client Name</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          {appointment.clientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          {appointment.clientPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-600" />
                          {appointment.clientEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Meeting Link</p>
                        <a
                          href={appointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Join Link
                        </a>
                      </div>
                    </div>

                    {/* Client Notes */}
                    {appointment.notes && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Client Notes:</p>
                        <p className="text-sm text-blue-800">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptAppointment(appointment.id)}
                        disabled={!canAct}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                          canAct
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                        Accept Appointment
                      </button>
                      <button
                        onClick={() => handleDeclineAppointment(appointment.id)}
                        disabled={!canAct}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                          canAct
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <XCircle className="h-5 w-5" />
                        Decline Appointment
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                        Contact Client
                      </button>
                    </div>

                    {!canAct && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Accept/Decline disabled - appointment is less than 4 hours away
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No pending appointment requests</p>
            </div>
          )}
        </div>

        {/* Earnings Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-gray-700" />
            Earnings Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Today's Earnings</p>
              <p className="text-3xl font-bold mb-2">{earningsData.todayEarnings}</p>
              <p className="text-xs opacity-75">3 sessions completed</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{earningsData.weekEarnings}</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+12% from last week</span>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{earningsData.monthEarnings}</p>
              <p className="text-xs text-gray-500">{earningsData.completedSessions} sessions</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{earningsData.totalEarnings}</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Pending Payouts</h3>
                <p className="text-2xl font-bold text-yellow-700">{earningsData.pendingPayouts}</p>
                <p className="text-xs text-gray-600 mt-1">Will be transferred in next payout cycle</p>
              </div>
              <Link
                href="/notary/payouts"
                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Payout Details
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Confirmed Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-gray-700" />
                Confirmed Appointments
              </h2>
              {confirmedAppointments.length > 0 ? (
                <div className="space-y-3">
                  {confirmedAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">{appointment.id}</span>
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                              CONFIRMED
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{appointment.documentType}</h3>
                          <p className="text-sm text-gray-600">Client: {appointment.clientName}</p>
                          <p className="text-sm text-gray-600">{appointment.scheduledDate} at {appointment.scheduledTime}</p>
                        </div>
                        <p className="font-bold text-green-600">{appointment.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No confirmed appointments</p>
              )}
            </div>

            {/* Recent Completed Sessions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-gray-700" />
                Recent Completed Sessions
              </h2>
              <div className="space-y-4">
                {recentCompletedSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{session.id}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: session.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900">{session.documentType}</h3>
                        <p className="text-sm text-gray-600">Client: {session.clientName}</p>
                        <p className="text-xs text-gray-500">{session.completedDate} at {session.completedTime} • {session.duration}</p>
                      </div>
                      <p className="font-bold text-green-600">{session.earnings}</p>
                    </div>
                    {session.review && (
                      <div className="mt-2 bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-700 italic">"{session.review}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/notary/sessions"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-center mt-4 transition-colors"
              >
                View All Sessions
              </Link>
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-gray-700" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Average Rating</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{earningsData.averageRating}/5.0</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Total Sessions</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{earningsData.completedSessions}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Total Reviews</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{earningsData.totalReviews}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
