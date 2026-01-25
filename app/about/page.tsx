import Link from 'next/link'
import { Target, Eye, Users, MapPin, Award, TrendingUp, CheckCircle } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { value: '50,000+', label: 'Documents Created', icon: CheckCircle },
    { value: '500+', label: 'Verified Notaries', icon: Users },
    { value: '28', label: 'States Covered', icon: MapPin },
    { value: '99.9%', label: 'Customer Satisfaction', icon: Award }
  ]

  const whyChooseUs = [
    {
      title: 'Pan-India Coverage',
      description: 'Access to verified notaries across all major cities in India',
      icon: MapPin
    },
    {
      title: 'Court-Accepted Documents',
      description: 'All our documents are legally valid and accepted by courts',
      icon: Award
    },
    {
      title: 'Fast & Reliable',
      description: 'Get your documents notarized within hours, not days',
      icon: TrendingUp
    },
    {
      title: 'Verified Professionals',
      description: 'All notaries are background-verified and certified',
      icon: Users
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About LegalDoji</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            India's most trusted digital platform for creating, notarizing, and managing legal documents online.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Target className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To democratize access to legal document services across India by providing affordable, fast, and reliable e-notarization solutions that empower individuals and businesses to handle their legal paperwork with ease.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become India's leading legal-tech platform, making legal documentation simple, accessible, and affordable for every Indian, while maintaining the highest standards of security and legal validity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose LegalDoji?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers today
          </p>
          <Link
            href="/dashboard/create"
            className="inline-block bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            Create Your First Document
          </Link>
        </div>
      </section>
    </div>
  )
}
