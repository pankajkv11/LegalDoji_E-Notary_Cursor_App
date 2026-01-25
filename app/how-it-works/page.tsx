import Link from 'next/link'
import { FileText, Video, Download, CheckCircle, ArrowRight, Play, Truck } from 'lucide-react'

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Add the Details - Submit Form',
      description: 'Fill in your document details and submit the form',
      icon: FileText,
      details: [
        'Choose from 50+ document templates',
        'Fill the simple guided form with your details',
        'Upload existing documents if you have them',
        'Live preview as you fill the form',
        'Auto-save - never lose your progress',
        'Submit the form when ready'
      ],
      image: '📝',
      color: 'bg-gray-800'
    },
    {
      number: 2,
      title: 'Notary Document Will Be Delivered',
      description: 'Receive your notarized document via digital or physical delivery',
      icon: Download,
      details: [
        'Download digital copy instantly',
        'Court-accepted PDF with digital signature',
        'Option for physical delivery (+₹149)',
        'Printed on quality paper',
        'Delivered to your doorstep in 3-5 days',
        'Track your delivery in real-time'
      ],
      image: '📦',
      color: 'bg-gray-700'
    },
    {
      number: 3,
      title: 'Online Consultation - E-Notarised',
      description: 'Connect with verified notary for video consultation and e-notarization',
      icon: Video,
      details: [
        'Video call with verified notary (₹999)',
        'Show your ID for verification',
        'Notary reviews your document',
        'Professional consultation included',
        'Digital signature & notary seal applied',
        'Legally valid across India'
      ],
      image: '🎥',
      color: 'bg-gray-900'
    }
  ]

  const pricing = [
    { service: 'Document Creation', price: '₹249' },
    { service: 'Physical Delivery', price: '+₹149' },
    { service: 'Online Consultation & E-Notarization', price: '₹999' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">How It Works</h1>
            <p className="text-xl text-gray-300">
              Get your legal documents created, notarized, and delivered in 3 simple steps
            </p>
          </div>
        </div>
      </section>

      {/* Video Tutorial CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-4 rounded-full">
                <Play className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Watch Video Tutorial</h3>
                <p className="text-gray-300">See the complete process in action</p>
              </div>
            </div>
            <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all">
              Watch Now
            </button>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple 3-Step Process</h2>
            <p className="text-xl text-gray-600">Easy, fast, and legally valid</p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative">
                  <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                    <div className="grid md:grid-cols-5 gap-8">
                      {/* Left side - Number and Icon */}
                      <div className={`md:col-span-2 ${step.color} text-white p-8 flex flex-col justify-center`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-white text-gray-900 w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">
                            {step.number}
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg">
                            <Icon className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-3">{step.title}</h3>
                        <p className="text-gray-200 text-lg">{step.description}</p>
                        <div className="text-7xl mt-6 opacity-50">{step.image}</div>
                      </div>

                      {/* Right side - Details */}
                      <div className="md:col-span-3 p-8">
                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">What happens:</h4>
                        <ul className="space-y-3">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-6">
                      <div className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-6 w-6 rotate-90" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees - pay only for what you need</p>
          </div>

          <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {pricing.map((item, index) => (
                <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-gray-900 text-lg">{item.service}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Complete Package (All 3)</span>
                <span className="text-3xl font-bold">₹1,397</span>
              </div>
              <p className="text-sm text-gray-300 mt-2">Document creation + Delivery + E-Notarization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LegalDoji?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-xl">Legally Valid</h3>
              <p className="text-gray-600">All documents are court-accepted across India</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-xl">Verified Notaries</h3>
              <p className="text-gray-600">500+ background-verified professional notaries</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-xl">Fast Delivery</h3>
              <p className="text-gray-600">Digital instantly, physical in 3-5 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Create your first document now - it only takes a few minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/create"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Create Document <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
