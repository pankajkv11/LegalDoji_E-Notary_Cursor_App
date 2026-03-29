'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Star, MessageSquare, TrendingUp,
  AlertCircle, Loader2, User, Calendar
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

interface Review {
  id: string
  rating: number
  comment: string | null
  reviewerName: string | null
  reviewerInitials: string | null
  createdAt: string
}

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function NotaryReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const json = await gql(`query {
          myNotaryReviews {
            id rating comment reviewerName reviewerInitials createdAt
          }
        }`)
        setReviews(json.data?.myNotaryReviews ?? [])
      } catch {
        setError('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Stats
  const total = reviews.length
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: total ? Math.round((reviews.filter(r => r.rating === star).length / total) * 100) : 0,
  }))

  const filtered = filterRating
    ? reviews.filter(r => r.rating === filterRating)
    : reviews

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading reviews…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/notary/dashboard" className="text-gray-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">My Reviews</h1>
              <p className="text-gray-300 text-sm mt-1">Client feedback and ratings for your sessions</p>
            </div>
          </div>

          {total > 0 && (
            <div className="flex items-center gap-6 bg-white/10 border border-white/20 rounded-xl p-5 w-fit">
              <div className="text-center">
                <p className="text-5xl font-bold">{avg.toFixed(1)}</p>
                <div className="flex justify-center mt-1">
                  <StarRow rating={Math.round(avg)} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-1.5 min-w-[160px]">
                {dist.map(d => (
                  <button
                    key={d.star}
                    onClick={() => setFilterRating(filterRating === d.star ? null : d.star)}
                    className={`flex items-center gap-2 w-full group transition-opacity ${filterRating && filterRating !== d.star ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <span className="text-xs text-gray-300 w-3">{d.star}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300 w-6 text-right">{d.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
          </div>
        )}

        {total === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Reviews will appear here after clients complete their sessions and leave feedback.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-700" />
                  {filterRating ? `${filterRating}-Star Reviews (${filtered.length})` : `All Reviews (${total})`}
                </h2>
                {filterRating && (
                  <button
                    onClick={() => setFilterRating(null)}
                    className="text-sm text-gray-500 hover:text-gray-900 underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <p className="text-gray-500 text-sm">No {filterRating}-star reviews.</p>
                </div>
              ) : (
                filtered.map(review => (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {review.reviewerInitials || <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.reviewerName || 'Anonymous'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRow rating={review.rating} />
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        review.rating >= 4 ? 'bg-green-100 text-green-700' :
                        review.rating === 3 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {review.rating}/5
                      </span>
                    </div>

                    {review.comment && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 leading-relaxed">"{review.comment}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Sidebar stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-700" />
                  Rating Breakdown
                </h3>
                <div className="space-y-3">
                  {dist.map(d => (
                    <div key={d.star}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <button
                          onClick={() => setFilterRating(filterRating === d.star ? null : d.star)}
                          className="flex items-center gap-1 hover:text-gray-900 text-gray-700 font-medium"
                        >
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                          {d.star} stars
                        </button>
                        <span className="text-gray-500">{d.count} ({d.pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Total Reviews', value: total },
                    { label: 'Average Rating', value: `${avg.toFixed(2)} / 5.0` },
                    { label: '5-Star Reviews', value: `${dist[0].count} (${dist[0].pct}%)` },
                    { label: 'Positive (4+)', value: `${dist[0].count + dist[1].count}` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
