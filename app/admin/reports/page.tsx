'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Download, BarChart3, TrendingUp,
  Users, FileText, DollarSign, Calendar, Filter, Search,
  RefreshCw, Award, Clock, CheckCircle, Loader2
} from 'lucide-react'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

interface Analytics {
  totalRevenue: string
  revenueChange: string
  totalDocuments: number
  documentsChange: string
  totalUsers: number
  usersChange: string
  pendingOrders: number
  activeNotaries: number
}

interface RevenueByType {
  type: string
  amount: string
  count: number
  percentage: number
}

interface TopNotary {
  id: string
  name: string
  location: string
  documents: number
  revenue: string
  rating: number
}

interface Transaction {
  id: string
  document: string
  client: string
  amount: string
  date: string
  time: string
  status: string
}

interface MonthlyRevenue {
  month: string
  revenue: number
}

async function gql(query: string, variables?: Record<string, unknown>) {
  const token = getToken()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

function fmt(paise: number) {
  return '₹' + (paise).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('last30days')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: '₹0', revenueChange: '+0%',
    totalDocuments: 0, documentsChange: '+0%',
    totalUsers: 0, usersChange: '+0%',
    pendingOrders: 0, activeNotaries: 0,
  })
  const [revenueByType, setRevenueByType] = useState<RevenueByType[]>([])
  const [topNotaries, setTopNotaries] = useState<TopNotary[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, revByType, topN, txns, monthly] = await Promise.all([
        gql(`query { adminStats {
          totalUsers totalDocuments activeNotaries pendingApplications
          revenueMonth pendingOrders activeSessions supportTickets
        }}`),
        gql(`query AdminRevByType($dr: String) {
          adminRevenueByType(dateRange: $dr) { type amount count percentage }
        }`, { dr: dateRange }),
        gql(`query AdminTopN($dr: String) {
          adminTopNotaries(dateRange: $dr, limit: 5) { id name location documents revenue rating }
        }`, { dr: dateRange }),
        gql(`query AdminTxns($dr: String) {
          adminRecentTransactions(dateRange: $dr, limit: 10) { id document client amount date time status }
        }`, { dr: dateRange }),
        gql(`query { adminMonthlyRevenue(months: 6) }`),
      ])

      const s = statsData.adminStats
      setAnalytics({
        totalRevenue: fmt(s.revenueMonth),
        revenueChange: '+0%',
        totalDocuments: s.totalDocuments,
        documentsChange: '+0%',
        totalUsers: s.totalUsers,
        usersChange: '+0%',
        pendingOrders: s.pendingOrders,
        activeNotaries: s.activeNotaries,
      })

      setRevenueByType(
        (revByType.adminRevenueByType ?? []).map((r: { type: string; amount: number; count: number; percentage: number }) => ({
          type: r.type,
          amount: fmt(r.amount),
          count: r.count,
          percentage: r.percentage,
        }))
      )

      setTopNotaries(
        (topN.adminTopNotaries ?? []).map((n: { id: string; name: string; location: string; documents: number; revenue: number; rating: number }) => ({
          id: n.id,
          name: n.name,
          location: n.location,
          documents: n.documents,
          revenue: fmt(n.revenue),
          rating: n.rating,
        }))
      )

      setRecentTransactions(
        (txns.adminRecentTransactions ?? []).map((t: { id: string; document: string; client: string; amount: number; date: string; time: string; status: string }) => ({
          id: t.id,
          document: t.document,
          client: t.client,
          amount: fmt(t.amount),
          date: t.date,
          time: t.time ?? '',
          status: t.status,
        }))
      )

      setMonthlyRevenue(monthly.adminMonthlyRevenue ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => { fetchAll() }, [fetchAll])

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue), 1)

  const handleExport = (format: string) => {
    if (format === 'csv') {
      const rows = [
        ['Transaction ID', 'Document', 'Client', 'Amount', 'Date', 'Time', 'Status'],
        ...recentTransactions.map((t) => [t.id, t.document, t.client, t.amount, t.date, t.time, t.status]),
      ]
      const csv = rows.map((r) => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${dateRange}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      alert(`${format.toUpperCase()} export requires a server-side PDF/Excel library. Download CSV instead.`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Completed</span>
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">Pending</span>
      case 'failed':
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">Failed</span>
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded capitalize">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
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
              <button
                onClick={fetchAll}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <Download className="h-5 w-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error} — <button onClick={fetchAll} className="font-semibold underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-3 text-gray-600">Loading report data...</span>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Revenue (This Month)</h3>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalRevenue}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Documents</h3>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalDocuments.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Orders</h3>
                <p className="text-3xl font-bold text-gray-900">{analytics.pendingOrders}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
                    <p className="text-sm text-gray-600">Monthly revenue overview (last 6 months)</p>
                  </div>
                  {monthlyRevenue.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No revenue data for this period</p>
                  ) : (
                    <div className="space-y-4">
                      {monthlyRevenue.map((data, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{data.month}</span>
                            <span className="text-sm font-bold text-gray-900">{fmt(data.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-gray-700 to-gray-900 h-3 rounded-full transition-all"
                              style={{ width: `${(data.revenue / maxMonthlyRevenue) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Revenue by Document Type */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Revenue by Document Type</h2>
                    <p className="text-sm text-gray-600">Performance breakdown for selected period</p>
                  </div>
                  {revenueByType.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No completed orders in this period</p>
                  ) : (
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
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {recentTransactions.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No transactions in this period</p>
                  ) : (
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
                  )}
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
                      <p className="text-xs text-gray-600">By revenue in period</p>
                    </div>
                  </div>
                  {topNotaries.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">No data for this period</p>
                  ) : (
                    <div className="space-y-4">
                      {topNotaries.map((notary, index) => (
                        <div key={notary.id} className="border border-gray-200 rounded-lg p-4">
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
                                <span className="text-yellow-600">⭐ {notary.rating.toFixed(1)}</span>
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
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Active Notaries</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics.activeNotaries}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Pending Orders</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics.pendingOrders}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Total Documents</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics.totalDocuments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">Total Users</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Export Reports</h3>
                  <p className="text-sm text-gray-300 mb-4">Download transaction data</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export as Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
