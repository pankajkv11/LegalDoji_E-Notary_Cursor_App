import Link from 'next/link'
import { DollarSign, Calendar, MapPin, Shield, TrendingUp, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export default function JoinNotaryPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn ₹50,000+ per month',
      description: 'Flexible earnings based on sessions completed. Top notaries earn ₹1 lakh+'
    },
    {
      icon: Calendar,
      title: 'Flexible Schedule',
      description: 'Set your own availability. Work full-time or part-time, your choice'
    },
    {
      icon: MapPin,
      title: 'Work from Anywhere',
      description: 'No office required. Conduct sessions from the comfort of your home'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'All sessions are recorded and encrypted. Legal protection provided'
    },
    {
      icon: TrendingUp,
      title: 'Growing Demand',
      description: 'Join India\'s fastest growing e-notary platform with 1000+ requests daily'
    },
    {
      icon: Users,
      title: 'Professional Network',
      description: 'Connect with fellow notaries and expand your professional network'
    }
  ]

  const requirements = [
    'Valid notary registration certificate',
    'Government-issued ID proof',
    'Active contact number and email',
    'Webcam and stable internet connection',
    'Professional demeanor and communication skills',
    'Minimum 2 hours availability per day'
  ]

  const process = [
    {
      step: 1,
      title: 'Submit Application',
      description: 'Fill out the application form with your details and credentials',
      duration: '5 minutes'
    },
    {
      step: 2,
      title: 'Document Verification',
      description: 'Our team verifies your notary certificate and credentials',
      duration: '24-48 hours'
    },
    {
      step: 3,
      title: 'Video Interview',
      description: 'Quick video call to verify your identity and explain the process',
      duration: '15 minutes'
    },
    {
      step: 4,
      title: 'Platform Training',
      description: 'Watch tutorial videos and learn how to use the platform',
      duration: '30 minutes'
    },
    {
      step: 5,
      title: 'Start Earning',
      description: 'Set your availability and start accepting notarization requests',
      duration: 'Ongoing'
    }
  ]

  const earnings = [
    { sessions: '5-10', amount: '₹15,000', time: 'per month (part-time)' },
    { sessions: '15-20', amount: '₹35,000', time: 'per month (regular)' },
    { sessions: '30+', amount: '₹75,000+', time: 'per month (full-time)' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Join as a Notary & Earn from Home
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Be part of India's leading e-notary platform. Flexible hours, competitive earnings, and nationwide reach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/notary/apply"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
                >
                  Apply Now <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-sm text-gray-300">Active Notaries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">50K+</div>
                  <div className="text-sm text-gray-300">Documents Notarized</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">28</div>
                  <div className="text-sm text-gray-300">States Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">4.9/5</div>
                  <div className="text-sm text-gray-300">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join LegalDoji?</h2>
            <p className="text-xl text-gray-600">Benefits of being part of our notary network</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-gray-900 transition-all">
                  <div className="bg-gray-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Potential Earnings</h2>
            <p className="text-xl text-gray-600">Based on average ₹500-700 per session</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {earnings.map((tier, index) => (
              <div key={index} className={`bg-white rounded-xl p-8 border-2 ${index === 1 ? 'border-gray-900 shadow-xl scale-105' : 'border-gray-200'} text-center`}>
                <div className="text-sm text-gray-600 mb-2">{tier.sessions} sessions {tier.time}</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{tier.amount}</div>
                <ul className="text-left space-y-2 mt-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Instant payouts
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    No commission fees
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Bonuses for top performers
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Process</h2>
            <p className="text-xl text-gray-600">5 simple steps to start earning</p>
          </div>
          <div className="space-y-6">
            {process.map((step) => (
              <div key={step.step} className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 flex items-center gap-6">
                <div className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {step.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Requirements</h2>
            <p className="text-xl text-gray-600">What you need to join</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
            <ul className="space-y-4">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Notaries Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Adv. Ramesh Kumar',
                location: 'Mumbai',
                quote: 'LegalDoji has transformed my practice. I now serve clients across India without leaving home. Earning ₹80K monthly!',
                earnings: '₹80,000/mo'
              },
              {
                name: 'Adv. Priya Menon',
                location: 'Bangalore',
                quote: 'Perfect for work-life balance. I work 3 hours daily and make good supplementary income. The platform is very user-friendly.',
                earnings: '₹35,000/mo'
              },
              {
                name: 'Adv. Suresh Patel',
                location: 'Delhi',
                quote: 'Best decision of my career. Steady stream of clients, instant payments, and full flexibility. Highly recommended!',
                earnings: '₹95,000/mo'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                  <div className="text-sm text-green-600 font-semibold mt-2">Earning {testimonial.earnings}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form CTA */}
      <section id="apply" className="py-20 bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Start your application today and begin earning within 48 hours
          </p>
          <Link
            href="/notary/apply"
            className="inline-block bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            Submit Application Now
          </Link>
          <p className="mt-4 text-gray-400 text-sm">
            Have questions? Email us at notary@legaldoji.com
          </p>
        </div>
      </section>
    </div>
  )
}
