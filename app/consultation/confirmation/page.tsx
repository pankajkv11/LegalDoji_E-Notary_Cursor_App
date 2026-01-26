'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Video, Calendar, ArrowRight } from 'lucide-react'
import { loadConsultationDraft } from '@/lib/consultation'

export default function ConsultationConfirmationPage() {
  const [draft, setDraft] = useState<{ advocateName: string; date: string; time: string } | null>(null)

  useEffect(() => {
    setDraft(loadConsultationDraft())
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your video consultation has been scheduled. A meeting link will be sent to your email.
        </p>

        {draft && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">{draft.advocateName}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="h-5 w-5 text-gray-600" />
              {new Date(draft.date).toLocaleDateString('en-IN', { dateStyle: 'long' })} at {draft.time}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold"
          >
            <Video className="h-5 w-5" />
            Go to Dashboard
          </Link>
          <Link
            href="/consultation"
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-lg font-semibold"
          >
            Book Another
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Link href="/" className="inline-block mt-6 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
