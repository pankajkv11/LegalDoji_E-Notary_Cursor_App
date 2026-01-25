'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, Download, BarChart3, TrendingUp, TrendingDown,
  Users, FileText, DollarSign, Calendar, Filter, Search,
  Eye, RefreshCw, ChevronDown, Award, Clock, CheckCircle
} from 'lucide-react'

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('last30days')
  const [exportFormat, setExportFormat] = useState('pdf')

  // Analytics Data
  const analytics = {
    totalRevenue: '₹12,45,890',
    revenueChange: '+23.5%',
    totalDocuments: 8921,
    documentsChange: '+12.3%',
    totalUsers: 2543,
    usersChange: '+8.7%',
    avgOrderValue: '₹612',
    avgChange: '+5.2%'
  }

  // Revenue by Document Type
  const revenueByType = [
    { type: 'Rental Agreements', amount: '₹4,25,000', count: 1067, percentage: 34 },
    { type: 'Power of Attorney', amount: '₹3,12,000', count: 312, percentage: 25 },
    { type: 'Affidavits', amount: '₹2,45,000', count: 615, percentage: 20 },
    { type: 'Sale Deeds', amount: '₹1,89,000', count: 189, percentage: 15 },
    { type: 'Others', amount: '₹74,890', count: 187, percentage: 6 }
  ]

  // Top Notaries
  const topNotaries = [
    { name: 'Adv. Ramesh Iyer', location: 'Mumbai', documents: 245, revenue: '₹2,44,510', rating: 4.9 },
    { name: 'Adv. Suresh Reddy', location: 'Hyderabad', documents: 312, revenue: '₹3,11,880', rating: 4.8 },
    { name: 'Adv. Meera Nair', location: 'Bangalore', documents: 189, revenue: '₹1,88,110', rating: 4.9 },
    { name: 'Adv. Priya Kapoor', location: 'Delhi', documents: 178, revenue: '₹1,77,220', rating: 4.7 },
    { name: 'Adv. Amit Sharma', location: 'Pune', documents: 156, revenue: '₹1,55,440', rating: 4.6 }
  ]

  // Recent Transactions
  const recentTransactions = [
    { id: 'TXN-9847', document: 'Rental Agreement', client: 'Rajesh Kumar', amount: '₹398', date: '2024-01-23', time: '10:30 AM', status: 'completed' },
    { id: 'TXN-9846', document: 'Power of Attorney', client: 'Priya Sharma', amount: '₹999', date: '2024-01-23', time: '09:15 AM', status: 'completed' },
    { id: 'TXN-9845', document: 'Affidavit', client: 'Amit Verma', amount: '₹398', date: '2024-01-22', time: '04:45 PM', status: 'completed' },
    { id: 'TXN-9844', document: 'Sale Deed', client: 'Neha Patel', amount: '₹999', date: '2024-01-22', time: '02:30 PM', status: 'pending' },
    { id: 'TXN-9843', document: 'Rental Agreement', client: 'Suresh Reddy', amount: '₹398', date: '2024-01-22', time: '11:00 AM', status: 'completed' }
  ]

  // Monthly Revenue Data
  const monthlyRevenue = [
    { month: 'Jul', revenue: 95000 },
    { month: 'Aug', revenue: 105000 },
    { month: 'Sep', revenue: 98000 },
    { month: 'Oct', revenue: 112000 },
    { month: 'Nov', revenue: 118000 },
    { month: 'Dec', revenue: 124589 }
  ]

  const handleExport = () => {
    alert(`Exporting report as ${exportFormat.toUpperCase()}...`)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Completed</span>
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">Pending</span>
      case 'failed':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">Failed</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                  <p className="text-gray-300 mt-1">Platform performance insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisyear">This Year</option>
              </select>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <button
                onClick={handleExport}
                className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <Download className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {analytics.revenueChange}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalRevenue}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-blue-600 text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {analytics.documentsChange}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Documents</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalDocuments.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-purple-600 text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {analytics.usersChange}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-orange-600 text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {analytics.avgChange}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Avg Order Value</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.avgOrderValue}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
                  <p className="text-sm text-gray-600">Monthly revenue overview</p>
                </div>
                <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {monthlyRevenue.map((data, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{data.month}</span>
                      <span className="text-sm font-bold text-gray-900">₹{(data.revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-gray-700 to-gray-900 h-3 rounded-full transition-all"
                        style={{ width: `${(data.revenue / 125000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Document Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Revenue by Document Type</h2>
                  <p className="text-sm text-gray-600">Performance breakdown</p>
                </div>
              </div>

              <div className="space-y-4">
                {revenueByType.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.type}</h3>
                        <p className="text-sm text-gray-600">{item.count} documents</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{item.amount}</p>
                        <p className="text-sm text-gray-600">{item.percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                  <p className="text-sm text-gray-600">Latest payment activities</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Transaction ID</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Document</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date/Time</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm font-mono text-gray-600">{txn.id}</td>
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">{txn.document}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{txn.client}</td>
                        <td className="py-3 px-2 text-sm font-bold text-gray-900">{txn.amount}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          <div>{txn.date}</div>
                          <div className="text-xs text-gray-500">{txn.time}</div>
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(txn.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-center">
                <button className="text-gray-900 hover:text-black font-semibold text-sm">
                  View All Transactions
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Notaries */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Top Notaries</h3>
                  <p className="text-xs text-gray-600">By documents completed</p>
                </div>
              </div>

              <div className="space-y-4">
                {topNotaries.map((notary, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <h4 className="font-semibold text-gray-900 text-sm">{notary.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{notary.location}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-yellow-600">⭐ {notary.rating}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{notary.documents} docs</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-bold text-gray-900">{notary.revenue}</p>
                      <p className="text-xs text-gray-600">Total revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">94.2%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Avg Processing</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">2.3 hrs</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Avg Rating</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">4.7 ⭐</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Active Users</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">1,847</span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Export Reports</h3>
              <p className="text-sm text-gray-300 mb-4">Download detailed analytics</p>
              <div className="space-y-2">
                <button
                  onClick={() => { setExportFormat('pdf'); handleExport(); }}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export as PDF
                </button>
                <button
                  onClick={() => { setExportFormat('excel'); handleExport(); }}
                  className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export as Excel
                </button>
                <button
                  onClick={() => { setExportFormat('csv'); handleExport(); }}
                  className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
