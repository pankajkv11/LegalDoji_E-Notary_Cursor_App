'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Download, Truck, FileText, ArrowRight } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order') || 'ORD-' + Date.now()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your document has been created successfully. You will receive an email with the PDF shortly.
        </p>
        <p className="text-sm text-gray-500 font-mono mb-8">
          Order #{orderId}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </button>
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            <Truck className="h-5 w-5" />
            Track Delivery
          </Link>
          <Link
            href="/create"
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            <FileText className="h-5 w-5" />
            Create Another Document
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Link
          href="/"
          className="inline-block mt-6 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function CreateConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
