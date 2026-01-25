import Link from 'next/link'
import { ArrowRight, FileText, Home as HomeIcon, Briefcase, Scale, CheckCircle, Upload, Video, Download, Shield, Award, Clock, Star, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const documentCategories = [
    {
      title: 'Property Documents',
      icon: HomeIcon,
      description: 'Rental agreements, sale deeds, leases, NOCs',
      examples: ['Rental Agreement', 'Sale Deed', 'Lease Agreement', 'NOC'],
      color: 'bg-gray-700',
      href: '/services?category=property'
    },
    {
      title: 'Personal Documents',
      icon: FileText,
      description: 'Affidavits, POA, wills, name change',
      examples: ['Affidavit', 'Power of Attorney', 'Will', 'Name Change'],
      color: 'bg-gray-600',
      href: '/services?category=personal'
    },
    {
      title: 'Business Documents',
      icon: Briefcase,
      description: 'NDAs, employment, partnership agreements',
      examples: ['NDA', 'Employment Contract', 'Partnership Deed', 'Service Agreement'],
      color: 'bg-gray-800',
      href: '/services?category=business'
    },
    {
      title: 'Legal Documents',
      icon: Scale,
      description: 'Vakalatnama, court affidavits, undertakings',
      examples: ['Vakalatnama', 'Court Affidavit', 'Undertaking', 'Legal Notice'],
      color: 'bg-gray-900',
      href: '/services?category=legal'
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Create or Upload',
      description: 'Choose a document template or upload your own document',
      icon: Upload,
      color: 'bg-gray-700'
    },
    {
      step: 2,
      title: 'Get Notarized',
      description: 'Connect with verified notaries via video call for instant notarization',
      icon: Video,
      color: 'bg-gray-800'
    },
    {
      step: 3,
      title: 'Download & Use',
      description: 'Download your legally valid document or get physical delivery',
      icon: Download,
      color: 'bg-gray-900'
    }
  ]

  const pricingPlans = [
    {
      name: 'Document Creation',
      price: '₹249',
      description: 'Perfect for simple documents',
      features: [
        'Digital document creation',
        'Professional templates',
        'PDF download',
        'Email support',
        'Valid across India',
        'Add ₹149 for delivery'
      ],
      cta: 'Get Started',
      popular: false,
      href: '/dashboard/create'
    },
    {
      name: 'Video Notarization',
      price: '₹999',
      description: 'Complete notarization service',
      features: [
        'Online video consultation',
        'Verified notary session',
        'Digital signature & seal',
        'Court-accepted documents',
        'Priority support',
        'Instant processing'
      ],
      cta: 'Choose Video Notarization',
      popular: true,
      href: '/dashboard/create'
    }
  ]

  const trustIndicators = [
    { icon: Shield, label: 'Verified Notaries', value: '500+' },
    { icon: Award, label: 'Court-Accepted', value: '100%' },
    { icon: FileText, label: 'Documents Created', value: '50K+' },
    { icon: Clock, label: 'Average Time', value: '15 min' }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Small Business Owner',
      content: 'LegalDoji made creating rental agreements so easy! Got it notarized within 30 minutes. Highly recommended!',
      rating: 5,
      location: 'Mumbai'
    },
    {
      name: 'Priya Sharma',
      role: 'Homemaker',
      content: 'I needed an affidavit urgently. The video notarization was seamless and the document was accepted by authorities.',
      rating: 5,
      location: 'Delhi'
    },
    {
      name: 'Amit Patel',
      role: 'HR Manager',
      content: 'We use LegalDoji for all our employment agreements. Professional service and very cost-effective.',
      rating: 5,
      location: 'Bangalore'
    }
  ]

  const faqs = [
    { question: 'Are documents legally valid?', answer: 'Yes, all notarized documents are court-accepted across India' },
    { question: 'How long does notarization take?', answer: 'Typically 15-30 minutes for video notarization' },
    { question: 'What documents do I need?', answer: 'Valid ID proof (Aadhaar/PAN) for notarization' },
    { question: 'Is my data secure?', answer: 'Yes, we use bank-grade encryption for all documents' }
  ]

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Create & Notarize Legal Documents in Minutes
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-gray-300">
                India's fastest e-notary platform. Get court-accepted documents with verified notaries via video call.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/create"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/consultation"
                  className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="h-5 w-5" /> Video Consultation
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>No hidden charges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Instant delivery</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                  <FileText className="h-32 w-32 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon
              return (
                <div key={index} className="text-center">
                  <Icon className="h-8 w-8 text-gray-900 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900">{indicator.value}</div>
                  <div className="text-sm text-gray-600">{indicator.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Document Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Document Type
            </h2>
            <p className="text-xl text-gray-600">
              Select from our comprehensive library of legal document templates
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <Link
                  key={index}
                  href={category.href}
                  className="group bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 p-6 transition-all hover:shadow-xl"
                >
                  <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <ul className="space-y-1 mb-4">
                    {category.examples.slice(0, 3).map((example, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-gray-900" />
                        {example}
                      </li>
                    ))}
                  </ul>
                  <div className="text-gray-900 font-semibold text-sm flex items-center gap-1">
                    Create Document <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your documents notarized in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="relative">
                  <div className="bg-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full border-2 border-gray-200">
                    <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mb-6`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute top-8 -left-4 bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {step.step < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 font-semibold text-lg"
            >
              Learn More About Our Process <Video className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the service that works for you. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 ${
                  plan.popular ? 'border-gray-900 shadow-2xl scale-105' : 'border-gray-200 shadow-lg'
                } p-8 transition-all hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{plan.price}</div>
                  <div className="text-gray-500 text-sm">per document</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.popular ? '/consultation' : '/create'}
                  className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="text-gray-900 hover:text-gray-700 font-semibold"
            >
              View detailed pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg border-2 border-gray-200">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-lg border-2 border-gray-200 p-6 group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                  {faq.question}
                  <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-gray-900 hover:text-gray-700 font-semibold"
            >
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of satisfied customers and create your legal document today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Create Document <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/join-notary"
              className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Join as Notary
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
