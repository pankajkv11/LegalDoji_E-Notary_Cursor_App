'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Video, ChevronRight, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useServicesQuery, useMeQuery } from '@/graphql/generated/hooks'
import { getAccessToken } from '@/lib/auth'

export default function ServicesPage() {
  const router = useRouter()
  const { data, loading, error } = useServicesQuery()
  const { data: userData, loading: userLoading } = useMeQuery({
    errorPolicy: 'ignore' // Don't throw error if not authenticated
  })
  
  const isAuthenticated = !!userData?.me || !!getAccessToken()

  // Map GraphQL services to component format
  const services = React.useMemo(() => {
    if (!data?.services) return []
    
    return data.services.map((service) => ({
      id: service.id,
      name: service.name,
      icon: service.name.toLowerCase().includes('video') || service.name.toLowerCase().includes('consultation') ? Video : FileText,
      price: service.price,
      basePrice: service.basePrice ? `₹${service.basePrice}` : null,
      deliveryFee: service.deliveryFee ? `₹${service.deliveryFee}` : null,
      discount: null,
      description: service.description,
      flow: service.flow || [],
      features: service.features || [],
      includes: service.includes || [],
      popular: service.popular || false,
      color: service.popular ? 'bg-gray-800' : 'bg-gray-900',
      cta: service.name.toLowerCase().includes('video') || service.name.toLowerCase().includes('consultation') 
        ? 'Schedule Video Consultation' 
        : 'Create Document'
    }))
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading services: {error.message}</p>
          <Link href="/" className="text-primary-600 hover:underline">Go back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Professional legal document services at affordable prices. All documents are legally valid and accepted across India.
          </p>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl font-bold mb-1">
              Choose Your Perfect Plan
            </p>
            <p className="text-blue-100 text-sm">
              Physical delivery or video consultation - we've got you covered
            </p>
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Service</h2>
            <p className="text-xl text-gray-600">Select the service that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.id}
                  className={`relative bg-white rounded-xl border-2 ${
                    service.popular ? 'border-gray-900 shadow-xl' : 'border-gray-200 shadow-md'
                  } overflow-hidden transition-all hover:shadow-lg`}
                >
                  {/* Discount Badge */}
                  {service.discount && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {service.discount}
                    </div>
                  )}

                  {service.popular && (
                    <div className="bg-gray-900 text-white text-center py-1.5 font-semibold text-xs">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="p-10">
                    {/* Icon */}
                    <div className={`${service.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
                    <p className="text-gray-600 mb-8">{service.description}</p>

                    {/* Pricing */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-4xl font-bold text-gray-900">{service.price}</span>
                      </div>
                      {service.basePrice && service.deliveryFee ? (
                        <p className="text-sm text-gray-600">
                          {service.basePrice} (document) + {service.deliveryFee} (delivery)
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">All inclusive</p>
                      )}
                    </div>

                    {/* Flow */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 text-sm">How It Works:</h4>
                      <ol className="space-y-2">
                        {service.flow.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                            <span className="font-bold text-blue-900 flex-shrink-0">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        {service.id === 'physical-delivery' ? 'Document Types:' : 'Consultation Features:'}
                      </h4>
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <ChevronRight className="h-4 w-4 text-gray-900 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {service.features.length > 4 && (
                          <li className="text-sm text-gray-500 italic">
                            +{service.features.length - 4} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Includes */}
                    <div className="mb-6 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">What's Included:</h4>
                      <ul className="space-y-2">
                        {service.includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button - redirect based on auth status */}
                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          // Logged in: redirect to dashboard immediately
                          router.push('/dashboard')
                        } else {
                          // Not logged in: go to service flow
                          // Use name-based check to identify video consultation service
                          const isVideoConsultation = service.name.toLowerCase().includes('video') || 
                                                      service.name.toLowerCase().includes('consultation') ||
                                                      service.name.toLowerCase().includes('notarization')
                          
                          if (isVideoConsultation) {
                            // Show appointment page to schedule video consultation
                            router.push('/consultation')
                          } else {
                            // Show categories page to select document
                            router.push('/create')
                          }
                        }
                      }}
                      className={`block w-full py-4 px-6 rounded-lg font-semibold text-center transition-all transform hover:scale-105 ${
                        service.popular
                          ? 'bg-gray-900 text-white hover:bg-black shadow-lg'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {service.cta}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LegalDoji?</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Legally Valid</h3>
              <p className="text-gray-600 text-sm">Court-accepted across India</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Expert Drafted</h3>
              <p className="text-gray-600 text-sm">Templates by legal professionals</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Notaries</h3>
              <p className="text-gray-600 text-sm">500+ background-checked notaries</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Instant digital download</p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Create your legal document in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/create"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Create Document <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
