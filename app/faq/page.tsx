'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, MessageCircle, Mail } from 'lucide-react'

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'general', name: 'General' },
    { id: 'documents', name: 'Document Creation' },
    { id: 'notarization', name: 'Notarization' },
    { id: 'pricing', name: 'Pricing & Payment' },
    { id: 'delivery', name: 'Delivery & Tracking' },
    { id: 'account', name: 'Account & Security' }
  ]

  const faqs = [
    {
      category: 'general',
      question: 'What is LegalDoji?',
      answer: 'LegalDoji is India\'s leading e-notary platform that allows you to create, notarize, and manage legal documents online. We connect you with verified notaries via video call for instant notarization services.'
    },
    {
      category: 'general',
      question: 'Are the documents legally valid?',
      answer: 'Yes, absolutely! All documents notarized through our platform are court-accepted and legally binding across India. Our notaries are registered, verified, and authorized to provide notarization services.'
    },
    {
      category: 'general',
      question: 'Which states do you cover?',
      answer: 'We have pan-India coverage with verified notaries available in all major cities across 28 states and UTs. You can use our services from anywhere in India.'
    },
    {
      category: 'documents',
      question: 'What types of documents can I create?',
      answer: 'We offer 50+ document templates including rental agreements, affidavits, power of attorney, wills, NDAs, employment contracts, partnership deeds, and more. You can also upload your own documents for notarization.'
    },
    {
      category: 'documents',
      question: 'Can I upload my own document instead of using a template?',
      answer: 'Yes! You can upload existing documents in PDF or Word format. Our notaries will review and notarize them during the video session.'
    },
    {
      category: 'documents',
      question: 'How long does it take to create a document?',
      answer: 'Document creation typically takes 5-10 minutes. Our guided forms make it easy to fill in all required information. Your progress is auto-saved, so you can return anytime.'
    },
    {
      category: 'documents',
      question: 'Can I edit a document after creating it?',
      answer: 'Yes, you can edit saved drafts anytime before finalizing. Once a document is notarized, you\'ll need to create a new document with any changes.'
    },
    {
      category: 'notarization',
      question: 'How does video notarization work?',
      answer: 'You join a secure video call with a verified notary, show your ID for verification, review the document together, and the notary digitally signs it. The entire session is recorded for legal validity.'
    },
    {
      category: 'notarization',
      question: 'How long does notarization take?',
      answer: 'A typical notarization session takes 15-30 minutes. You can choose instant notarization (usually within 2 hours) or schedule an appointment for later.'
    },
    {
      category: 'notarization',
      question: 'What do I need for video notarization?',
      answer: 'You need: 1) A valid government ID (Aadhaar, PAN, Passport, or Driver\'s License), 2) Good internet connection, 3) A device with camera and microphone, 4) A quiet, well-lit place for the video call.'
    },
    {
      category: 'notarization',
      question: 'Can I schedule notarization for a specific time?',
      answer: 'Yes! You can either opt for instant notarization or schedule an appointment. Our notaries are available Monday to Saturday, 9 AM to 7 PM.'
    },
    {
      category: 'notarization',
      question: 'What if the notary rejects my document?',
      answer: 'If a notary cannot notarize your document due to legal issues or missing information, you\'ll receive a full refund. We\'ll also provide guidance on how to fix the issues.'
    },
    {
      category: 'pricing',
      question: 'How much does it cost?',
      answer: 'Document Creation: ₹249 (includes template and digital document). Video Notarization: ₹999 (includes online consultation with notary). Physical Delivery: +₹149. E-stamp charges are additional and vary by state.'
    },
    {
      category: 'pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods through Razorpay: Credit/Debit cards, UPI, Net Banking, Wallets (Paytm, PhonePe, etc.). All payments are secure and encrypted.'
    },
    {
      category: 'pricing',
      question: 'Do you offer refunds?',
      answer: 'Yes. Full refund if: 1) Document creation fails on our end, 2) Notarization cannot be completed due to technical issues from our side, 3) You cancel before the notarization session. No refund after successful notarization.'
    },
    {
      category: 'pricing',
      question: 'Are there any hidden charges?',
      answer: 'No! Our pricing is completely transparent. What you see during checkout is what you pay. E-stamp duty (if applicable) is calculated based on your state and shown before payment.'
    },
    {
      category: 'pricing',
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! For 10+ documents, please contact our sales team at support@legaldoji.com for custom pricing. We offer special rates for businesses and organizations.'
    },
    {
      category: 'delivery',
      question: 'How do I get my document after notarization?',
      answer: 'You can download your notarized document immediately as a PDF. If you opted for physical delivery (+₹149), we\'ll print and courier it to your address within 3-5 business days.'
    },
    {
      category: 'delivery',
      question: 'Can I track my physical delivery?',
      answer: 'Yes! Once your document is shipped, you\'ll receive a tracking number via email and SMS. You can track the delivery status in real-time from your dashboard.'
    },
    {
      category: 'delivery',
      question: 'What if I need additional physical copies?',
      answer: 'You can order additional copies anytime from your dashboard. Additional copies cost ₹79 each + delivery charges.'
    },
    {
      category: 'account',
      question: 'Do I need an account to use LegalDoji?',
      answer: 'You can browse templates without an account, but you\'ll need to create one to complete document creation and payment. It\'s quick and free!'
    },
    {
      category: 'account',
      question: 'Is my personal information secure?',
      answer: 'Absolutely! We use bank-grade 256-bit SSL encryption for all data. Your documents and personal information are stored securely and never shared with third parties.'
    },
    {
      category: 'account',
      question: 'What is KYC and why is it required?',
      answer: 'KYC (Know Your Customer) verification helps us confirm your identity for notarization services. You\'ll need to upload your Aadhaar/PAN for verification. This is required by law for notarization services.'
    },
    {
      category: 'account',
      question: 'Can I access my documents later?',
      answer: 'Yes! All your documents are stored in your dashboard. You can access, download, or re-order them anytime. Documents are stored securely for your account lifetime.'
    },
    {
      category: 'general',
      question: 'What if I need help during the process?',
      answer: 'We\'re here to help! You can: 1) Use live chat on our website, 2) Email us at support@legaldoji.com, 3) Call +91 123-456-7890 (Mon-Sat, 9 AM - 7 PM), 4) Check this FAQ page for quick answers.'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
