'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, Save, CheckCircle, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

async function gql(query: string, variables: Record<string, unknown> = {}) {
  const token = getToken()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
type DaySlot = { start: string; end: string }
type DayData = { enabled: boolean; slots: DaySlot[] }
type AvailabilityState = Record<DayKey, DayData>

const DEFAULT_AVAILABILITY: AvailabilityState = {
  monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  saturday: { enabled: false, slots: [{ start: '09:00', end: '13:00' }] },
  sunday: { enabled: false, slots: [] },
}

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

export default function SetAvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityState>(DEFAULT_AVAILABILITY)
  const [breakTime, setBreakTime] = useState({ enabled: true, start: '13:00', end: '14:00' })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const json = await gql(`query { myNotaryAvailability { days breakStart breakEnd } }`)
        const avail = json.data?.myNotaryAvailability
        if (avail && Array.isArray(avail.days) && avail.days.length > 0) {
          const state = { ...DEFAULT_AVAILABILITY }
          for (const d of avail.days as { day: DayKey; enabled: boolean; slots: DaySlot[] }[]) {
            if (d.day in state) {
              state[d.day] = { enabled: d.enabled, slots: d.slots || [] }
            }
          }
          setAvailability(state)
          if (avail.breakStart || avail.breakEnd) {
            setBreakTime({
              enabled: true,
              start: avail.breakStart ?? '13:00',
              end: avail.breakEnd ?? '14:00',
            })
          }
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const days = DAYS.map(({ key }) => ({
        day: key,
        enabled: availability[key].enabled,
        slots: availability[key].slots,
      }))
      const json = await gql(
        `mutation UpdateAvail($input: AvailabilityInput!) {
          updateNotaryAvailability(input: $input) { days breakStart breakEnd }
        }`,
        {
          input: {
            days,
            breakStart: breakTime.enabled ? breakTime.start : null,
            breakEnd: breakTime.enabled ? breakTime.end : null,
          },
        }
      )
      if (json.errors?.length) {
        setSaveError(json.errors[0].message)
        setSaveStatus('error')
        return
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveError('Network error. Please try again.')
      setSaveStatus('error')
    }
  }

  const toggleDay = (day: DayKey) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }

  const updateSlot = (day: DayKey, index: number, field: 'start' | 'end', value: string) => {
    const slots = [...availability[day].slots]
    slots[index] = { ...slots[index], [field]: value }
    setAvailability(prev => ({ ...prev, [day]: { ...prev[day], slots } }))
  }

  const addSlot = (day: DayKey) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, { start: '09:00', end: '17:00' }] },
    }))
  }

  const removeSlot = (day: DayKey, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], slots: prev[day].slots.filter((_, i) => i !== index) },
    }))
  }

  const applyPreset = (preset: '9-5' | '10-6') => {
    const [start, end] = preset === '9-5' ? ['09:00', '17:00'] : ['10:00', '18:00']
    const weekdays: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    const updated = { ...availability }
    for (const d of weekdays) {
      updated[d] = { enabled: true, slots: [{ start, end }] }
    }
    if (preset === '9-5') {
      updated.saturday = { enabled: false, slots: [{ start: '09:00', end: '13:00' }] }
    } else {
      updated.saturday = { enabled: true, slots: [{ start: '10:00', end: '14:00' }] }
    }
    updated.sunday = { enabled: false, slots: [] }
    setAvailability(updated)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading availability…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/notary/dashboard" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">Set Availability</h1>
                <p className="text-gray-300 text-lg">Manage your working hours and schedule</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                saveStatus === 'saved'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {saveStatus === 'saving' && <><Loader2 className="h-5 w-5 animate-spin" />Saving...</>}
              {saveStatus === 'saved' && <><CheckCircle className="h-6 w-6" />Saved!</>}
              {saveStatus === 'error' && <><AlertCircle className="h-6 w-6" />Error</>}
              {saveStatus === 'idle' && <><Save className="h-6 w-6" />Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-900 p-3 rounded-xl"><Calendar className="h-7 w-7 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
                  <p className="text-sm text-gray-600 mt-1">Set your available hours for each day</p>
                </div>
              </div>

              <div className="space-y-6">
                {DAYS.map(({ key, label }) => {
                  const dayData = availability[key]
                  return (
                    <div key={key} className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={dayData.enabled} onChange={() => toggleDay(key)} className="sr-only peer" />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-900"></div>
                          </label>
                          <h3 className="text-lg font-bold text-gray-900">{label}</h3>
                        </div>
                        {dayData.enabled && (
                          <button onClick={() => addSlot(key)}
                            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                            <Plus className="h-4 w-4" />
                            Add Slot
                          </button>
                        )}
                      </div>

                      {dayData.enabled && (
                        <div className="space-y-3">
                          {dayData.slots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                <Clock className="h-5 w-5 text-gray-500" />
                                <input type="time" value={slot.start} onChange={(e) => updateSlot(key, index, 'start', e.target.value)}
                                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-semibold" />
                                <span className="text-gray-500 font-semibold">to</span>
                                <input type="time" value={slot.end} onChange={(e) => updateSlot(key, index, 'end', e.target.value)}
                                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-semibold" />
                              </div>
                              {dayData.slots.length > 1 && (
                                <button onClick={() => removeSlot(key, index)}
                                  className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors">
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {!dayData.enabled && (
                        <p className="text-gray-500 text-sm italic">Not available on {label}s</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Break Time */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Break Time</h3>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-gray-700">Enable Break</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={breakTime.enabled}
                    onChange={(e) => setBreakTime({ ...breakTime, enabled: e.target.checked })} className="sr-only peer" />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-900"></div>
                </label>
              </div>
              {breakTime.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input type="time" value={breakTime.start} onChange={(e) => setBreakTime({ ...breakTime, start: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-semibold" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input type="time" value={breakTime.end} onChange={(e) => setBreakTime({ ...breakTime, end: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-semibold" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-4">Quick Presets</h3>
              <div className="space-y-3">
                <button onClick={() => applyPreset('9-5')}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all">
                  <div className="font-bold">9 AM - 5 PM</div>
                  <div className="text-xs text-gray-300">Mon–Fri, Weekends off</div>
                </button>
                <button onClick={() => applyPreset('10-6')}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all">
                  <div className="font-bold">10 AM - 6 PM</div>
                  <div className="text-xs text-gray-300">Mon–Sat, Sunday off</div>
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Important</h4>
                  <p className="text-sm text-blue-800">
                    Changes are saved immediately. Clients can only book during your available hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
