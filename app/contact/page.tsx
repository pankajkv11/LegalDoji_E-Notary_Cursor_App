'use client'

import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for contacting us! We will get back to you soon.')
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@legaldoji.com',
      link: 'mailto:support@legaldoji.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 123-456-7890',
      link: 'tel:+911234567890'
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Mumbai, Maharashtra, India',
      link: null
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Mon-Sat: 9 AM - 7 PM',
      link: null
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">
            Have questions? We're here to help!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="notary">Notary Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Send className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {contactInfo.map((item) => {
                  const Icon = item.icon
                  const content = (
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-700">{item.value}</p>
                      </div>
                    </div>
                  )

                  return item.link ? (
                    <a
                      key={item.title}
                      href={item.link}
                      className="block hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={item.title}>{content}</div>
                  )
                })}
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-8 text-white">
              <MessageCircle className="h-12 w-12 mb-4 text-blue-200" />
              <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
              <p className="text-blue-100 mb-6">
                Chat with our support team in real-time
              </p>
              <button className="w-full bg-white text-primary-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all">
                Start Live Chat
              </button>
            </div>

            {/* FAQ Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Looking for Quick Answers?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Check out our FAQ page for instant answers to common questions
              </p>
              <a
                href="/faq"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                View FAQs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
