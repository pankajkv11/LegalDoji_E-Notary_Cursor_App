'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, MessageCircle, Mail, Loader2 } from 'lucide-react'
import { useFaQsQuery } from '@/graphql/generated/hooks'

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'general', name: 'General' },
    { id: 'documents', name: 'Document Creation' },
    { id: 'notarization', name: 'Notarization' },
    { id: 'pricing', name: 'Pricing & Payment' },
    { id: 'delivery', name: 'Delivery & Tracking' },
    { id: 'account', name: 'Account & Security' }
  ]

  // Fetch FAQs from GraphQL
  const { data, loading, error } = useFaQsQuery({
    variables: {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchQuery || undefined
    }
  })

  // Map GraphQL FAQs to component format
  const faqs = useMemo(() => {
    if (!data?.faqs) return []
    return data.faqs.map((faq) => ({
      category: faq.category.toLowerCase(),
      question: faq.question,
      answer: faq.answer
    }))
  }, [data])

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
      const matchesSearch = !searchQuery || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [faqs, selectedCategory, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading FAQs: {error.message}</p>
          <Link href="/" className="text-primary-600 hover:underline">Go back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">
            Find answers to common questions about LegalDoji
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 mb-6">
            Showing <span className="font-semibold">{filteredFAQs.length}</span> questions
          </p>

          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <details key={index} className="bg-white rounded-lg border-2 border-gray-200 p-6 group hover:border-gray-400 transition-colors">
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-xl text-gray-600">Our support team is here to help</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/contact" className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-gray-900 transition-all text-center group">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">Get a response within 24 hours</p>
              <span className="text-gray-900 font-semibold">support@legaldoji.com</span>
            </Link>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border-2 border-gray-900 text-center text-white">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Live Chat</h3>
              <p className="text-gray-300 text-sm mb-4">Chat with us in real-time</p>
              <button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition-all">
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
