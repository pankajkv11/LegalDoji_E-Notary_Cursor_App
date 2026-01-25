'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  CheckCircle,
} from 'lucide-react'
import { saveConsultationDraft } from '@/lib/consultation'

interface Advocate {
  id: string
  name: string
  rating: number
  reviews: number
  experience: number
  specialization: string[]
  languages: string[]
  location: string
  fee: number
  availability: string
  bio: string
}

interface TimeSlot {
  date: string
  slots: string[]
}

const ADVOCATES: Advocate[] = [
  {
    id: '1',
    name: 'Adv. Rajesh Kumar',
    rating: 4.9,
    reviews: 287,
    experience: 12,
    specialization: ['Property Law', 'Civil Law', 'Notarization'],
    languages: ['English', 'Hindi', 'Tamil'],
    location: 'Mumbai, Maharashtra',
    fee: 999,
    availability: 'Available Today',
    bio: 'Specialized in property documentation and civil matters with over 12 years of experience.',
  },
  {
    id: '2',
    name: 'Adv. Priya Sharma',
    rating: 4.8,
    reviews: 198,
    experience: 8,
    specialization: ['Family Law', 'Affidavits', 'Notarization'],
    languages: ['English', 'Hindi'],
    location: 'Delhi NCR',
    fee: 999,
    availability: 'Available Tomorrow',
    bio: 'Expert in family law matters and documentation with comprehensive notarization services.',
  },
  {
    id: '3',
    name: 'Adv. Amit Patel',
    rating: 4.9,
    reviews: 342,
    experience: 15,
    specialization: ['Corporate Law', 'Contracts', 'Notarization'],
    languages: ['English', 'Hindi', 'Gujarati'],
    location: 'Ahmedabad, Gujarat',
    fee: 999,
    availability: 'Available Today',
    bio: 'Corporate law specialist with extensive experience in business documentation and contracts.',
  },
  {
    id: '4',
    name: 'Adv. Meera Reddy',
    rating: 4.7,
    reviews: 156,
    experience: 10,
    specialization: ['Property Law', 'Rental Agreements', 'Notarization'],
    languages: ['English', 'Hindi', 'Telugu'],
    location: 'Hyderabad, Telangana',
    fee: 999,
    availability: 'Available Today',
    bio: 'Specializing in property law and rental agreements with a focus on customer satisfaction.',
  },
]

const SLOTS: TimeSlot[] = [
  { date: '2024-01-26', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
  { date: '2024-01-27', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'] },
  { date: '2024-01-28', slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ConsultationPage() {
  const router = useRouter()
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const canProceed = selectedAdvocate && selectedDate && selectedTime
  const currentDaySlots = SLOTS.find((s) => s.date === selectedDate)?.slots ?? []

  const handleProceedToPayment = () => {
    if (!canProceed || !selectedAdvocate) return
    saveConsultationDraft({
      advocateId: selectedAdvocate.id,
      advocateName: selectedAdvocate.name,
      advocateFee: selectedAdvocate.fee,
      date: selectedDate,
      time: selectedTime,
    })
    router.push('/consultation/payment')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-2">Schedule Video Consultation</h1>
              <p className="text-gray-300 text-lg">
                Choose advocate, date & time — then proceed to payment
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Advocate</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {ADVOCATES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelectedAdvocate(a)
                      setSelectedDate('')
                      setSelectedTime('')
                    }}
                    className={`text-left bg-white rounded-2xl border-2 p-6 shadow-lg transition-all ${
                      selectedAdvocate?.id === a.id ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{a.rating}</span>
                      <span className="text-gray-600 text-sm">({a.reviews} reviews)</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{a.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      {a.location}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {a.specialization.slice(0, 2).map((s, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{a.bio}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">₹{a.fee}</span>
                      <span className="text-xs text-green-600 font-medium">{a.availability}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {selectedAdvocate && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Date & Time</h2>
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Date</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {SLOTS.map((s) => (
                      <button
                        key={s.date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(s.date)
                          setSelectedTime('')
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedDate === s.date ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-gray-700" />
                          <div>
                            <div className="font-bold text-gray-900">{formatDate(s.date)}</div>
                            <div className="text-sm text-gray-600">{s.slots.length} slots</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedDate && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3">Time</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {currentDaySlots.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                              selectedTime === t
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                {selectedAdvocate ? (
                  <>
                    <div className="space-y-3 text-sm text-gray-700 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {selectedAdvocate.name}
                      </div>
                      {selectedDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatDate(selectedDate)}
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {selectedTime}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Consultation</span>
                        <span className="font-bold text-gray-900">₹{selectedAdvocate.fee}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-sm text-gray-500">
                        <span>E-notarization & delivery</span>
                        <span>Included</span>
                      </div>
                    </div>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={!canProceed}
                      className="w-full bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Video className="h-5 w-5" />
                      Proceed to Payment — ₹{selectedAdvocate.fee}
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Select an advocate to continue.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
