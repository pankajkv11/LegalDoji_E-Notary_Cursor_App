import Link from 'next/link'
import { CheckCircle, X, HelpCircle, FileText, Stamp, Truck, Video, Clock, Shield } from 'lucide-react'

export default function PricingPage() {
  const pricingPlans = [
    {
      name: 'Basic',
      price: '₹249',
      period: 'per document',
      description: 'Perfect for simple digital documents',
      features: [
        { name: 'Digital document creation', included: true },
        { name: 'Basic templates library', included: true },
        { name: 'PDF download', included: false },
        { name: 'Email support', included: false },
        { name: 'Valid across India', included: true },
        { name: 'Video notarization', included: false },
        { name: 'E-stamp paper', included: false },
        { name: 'Physical delivery', included: false },
        { name: 'Priority support', included: false }
      ],
      cta: 'Get Started',
      popular: false,
      color: 'blue'
    },
   
    {
      name: 'Premium',
      price: '₹999/',
      period: '30 min',
      description: 'Complete service with delivery',
      features: [
        { name: 'Everything in Standard', included: true },
        { name: 'E-stamp paper (state-wise)', included: true },
        { name: 'Physical document printing', included: true },
        { name: 'Courier delivery (₹149)', included: true },
        { name: 'Express processing', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Document storage', included: true },
        { name: 'Re-print service', included: true },
        { name: 'Track & trace', included: true }
      ],
      cta: 'Go Premium',
      popular: false,
      color: 'purple'
    }
  ]

  const addOns = [
    {
      name: 'E-Stamp Paper',
      icon: Stamp,
      description: 'State-specific stamp duty',
      price: 'Varies by state',
      details: '₹10 - ₹5000+ depending on document type and state'
    },
    {
      name: 'Physical Delivery',
      icon: Truck,
      description: 'Printed & couriered to your address',
      price: '₹149',
      details: 'Delivery within 3-5 business days'
    },
    {
      name: 'Express Notarization',
      icon: Clock,
      description: 'Get notarized within 2 hours',
      price: '₹99',
      details: 'Priority queue for video calls'
    },
    {
      name: 'Additional Copies',
      icon: FileText,
      description: 'Extra physical copies',
      price: '₹79/copy',
      details: 'Same as original with notary seal'
    }
  ]

  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets through Razorpay.'
    },
    {
      question: 'Is there any refund policy?',
      answer: 'Yes, we offer full refund if the document is not created. For notarization, refunds are available if the session couldn\'t be completed due to technical issues on our end.'
    },
    {
      question: 'How is e-stamp duty calculated?',
      answer: 'E-stamp duty varies by state and document type. It\'s calculated automatically based on your document details and location. You\'ll see the exact amount before payment.'
    },
    {
      question: 'Can I upgrade my plan later?',
      answer: 'Yes! You can add notarization, e-stamp, or delivery services to any existing document from your dashboard.'
    },
    {
      question: 'Are there any hidden charges?',
      answer: 'Absolutely not. The price you see is the price you pay. All additional services (e-stamp, delivery) are clearly shown before checkout.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, for 10+ documents, contact our sales team for custom pricing. Business accounts get special rates.'
    }
  ]

  const comparisonTable = [
    { feature: 'Document Templates', basic: '20+', standard: '50+', premium: '50+' },
    { feature: 'Notarization', basic: '✕', standard: '✓', premium: '✓' },
    { feature: 'Support Response Time', basic: '24 hrs', standard: '12 hrs', premium: '2 hrs' },
    { feature: 'Document Revisions', basic: '1', standard: '3', premium: 'Unlimited' },
    { feature: 'Storage Period', basic: '30 days', standard: '1 year', premium: 'Lifetime' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl ${
                  plan.popular
                    ? 'border-2 border-primary-500 shadow-2xl scale-105'
                    : 'border border-gray-200 shadow-lg'
                } overflow-hidden transition-all hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="bg-primary-600 text-white text-center py-2 font-semibold text-sm">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/create"
                    className={`block w-full py-3 px-6 rounded-lg font-semibold text-center mb-6 transition-all ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Detailed Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Basic</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 bg-primary-50">Standard</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{row.basic}</td>
                    <td className="py-4 px-4 text-center text-gray-900 bg-primary-50 font-semibold">{row.standard}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600">Customize your package with these add-ons</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => {
              const Icon = addon.icon
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{addon.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{addon.description}</p>
                  <div className="text-2xl font-bold text-primary-600 mb-2">{addon.price}</div>
                  <p className="text-xs text-gray-500">{addon.details}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Pricing FAQs
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-gray-50 rounded-lg p-6 group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                  {faq.question}
                  <HelpCircle className="h-5 w-5 text-primary-600" />
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">Money-Back Guarantee</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              If you're not satisfied with our service, we'll refund 100% of your payment. No questions asked.
            </p>
            <Link
              href="/refund-policy"
              className="inline-block bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              View Refund Policy
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Create your first document today and experience the convenience
          </p>
          <Link
            href="/dashboard/create"
            className="inline-block bg-primary-600 text-white hover:bg-primary-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            Start Creating Documents
          </Link>
        </div>
      </section>
    </div>
  )
}
