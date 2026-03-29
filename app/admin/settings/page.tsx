'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, Save, Settings, Bell, CreditCard, FileText,
  Users, Shield, Globe, Mail, Phone, MapPin, Building2,
  Lock, Key, Database, Server, AlertCircle, CheckCircle
} from 'lucide-react'
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

export default function AdminSettingsPage() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'LegalDoji E-Notary',
    siteUrl: 'https://legaldoji.com',
    supportEmail: 'support@legaldoji.com',
    supportPhone: '+91 1800-123-4567',
    address: 'Mumbai, Maharashtra, India',

    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    notifyOnNewUser: true,
    notifyOnNewDocument: true,
    notifyOnPayment: true,

    // Payment Settings
    razorpayEnabled: true,
    razorpayKey: 'rzp_test_xxxxxxxxxxxxx',
    stripeEnabled: false,
    stripeKey: 'sk_test_xxxxxxxxxxxxx',
    upiEnabled: true,

    // Document Settings
    maxDocumentSize: '10',
    allowedFormats: 'PDF, DOC, DOCX',
    autoDeleteDrafts: '30',
    documentRetention: '365',

    // Notary Settings
    requireVerification: true,
    minExperience: '2',
    maxSessionDuration: '60',
    notaryCommission: '15',

    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    maxLoginAttempts: '5',

    // System Settings
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    backupFrequency: 'daily'
  })

  // Load settings from backend on mount
  useEffect(() => {
    gql(`query { adminGetSettings }`)
      .then(json => {
        const d = json.data?.adminGetSettings
        if (!d) return
        setSettings(prev => ({
          ...prev,
          siteName: d.siteName ?? prev.siteName,
          siteUrl: d.siteUrl ?? prev.siteUrl,
          supportEmail: d.supportEmail ?? prev.supportEmail,
          supportPhone: d.supportPhone ?? prev.supportPhone,
          address: d.address ?? prev.address,
          maintenanceMode: d.maintenanceMode ?? prev.maintenanceMode,
          emailNotifications: d.emailNotifications ?? prev.emailNotifications,
          smsNotifications: d.smsNotifications ?? prev.smsNotifications,
          razorpayEnabled: d.razorpayEnabled ?? prev.razorpayEnabled,
          razorpayKey: d.razorpayKey ?? prev.razorpayKey,
        }))
      })
      .catch(() => {/* silently ignore — defaults remain */})
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      const json = await gql(
        `mutation UpdateSettings($input: AdminSettingsInput!) { updateAdminSettings(input: $input) }`,
        {
          input: {
            siteName: settings.siteName,
            siteUrl: settings.siteUrl,
            supportEmail: settings.supportEmail,
            supportPhone: settings.supportPhone,
            address: settings.address,
            maintenanceMode: settings.maintenanceMode,
            emailNotifications: settings.emailNotifications,
            smsNotifications: settings.smsNotifications,
            razorpayEnabled: settings.razorpayEnabled,
            razorpayKey: settings.razorpayKey,
          },
        }
      )
      if (json.errors?.length) {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleInputChange = (field: string, value: unknown) => {
    setSettings({ ...settings, [field]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">Admin Settings</h1>
                  <p className="text-gray-300 mt-1">Configure platform settings</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all text-white ${
                saveStatus === 'saved'  ? 'bg-green-600 hover:bg-green-700' :
                saveStatus === 'error'  ? 'bg-red-600 hover:bg-red-700' :
                saveStatus === 'saving' ? 'bg-gray-400 cursor-not-allowed' :
                'bg-white !text-gray-900 hover:bg-gray-100'
              }`}
            >
              {saveStatus === 'saving' && <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-1"></div>Saving...</>}
              {saveStatus === 'saved'  && <><CheckCircle className="h-5 w-5" />Saved!</>}
              {saveStatus === 'error'  && <><AlertCircle className="h-5 w-5" />Save Failed</>}
              {saveStatus === 'idle'   && <><Save className="h-5 w-5 text-gray-900" /><span className="text-gray-900">Save Changes</span></>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Settings Menu</h3>
              <nav className="space-y-1">
                <a href="#general" className="block px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg">
                  General Settings
                </a>
                <a href="#notifications" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Notifications
                </a>
                <a href="#payment" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Payment Settings
                </a>
                <a href="#documents" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Document Settings
                </a>
                <a href="#notary" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Notary Settings
                </a>
                <a href="#security" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Security
                </a>
                <a href="#system" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  System
                </a>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <div id="general" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                  <p className="text-sm text-gray-600">Basic platform configuration</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Site URL</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Support Phone</label>
                    <input
                      type="tel"
                      value={settings.supportPhone}
                      onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Office Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div id="notifications" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                  <p className="text-sm text-gray-600">Configure notification preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div id="payment" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Settings</h2>
                  <p className="text-sm text-gray-600">Configure payment gateways</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Razorpay</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.razorpayEnabled}
                        onChange={(e) => handleInputChange('razorpayEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.razorpayKey}
                    onChange={(e) => handleInputChange('razorpayKey', e.target.value)}
                    placeholder="Razorpay API Key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Stripe</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.stripeEnabled}
                        onChange={(e) => handleInputChange('stripeEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.stripeKey}
                    onChange={(e) => handleInputChange('stripeKey', e.target.value)}
                    placeholder="Stripe Secret Key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">UPI Payments</p>
                    <p className="text-sm text-gray-600">Accept payments via UPI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.upiEnabled}
                      onChange={(e) => handleInputChange('upiEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Document Settings */}
            <div id="documents" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Document Settings</h2>
                  <p className="text-sm text-gray-600">Configure document handling</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Document Size (MB)</label>
                  <input
                    type="number"
                    value={settings.maxDocumentSize}
                    onChange={(e) => handleInputChange('maxDocumentSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Allowed File Formats</label>
                  <input
                    type="text"
                    value={settings.allowedFormats}
                    onChange={(e) => handleInputChange('allowedFormats', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Auto-delete Drafts (days)</label>
                    <input
                      type="number"
                      value={settings.autoDeleteDrafts}
                      onChange={(e) => handleInputChange('autoDeleteDrafts', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Retention (days)</label>
                    <input
                      type="number"
                      value={settings.documentRetention}
                      onChange={(e) => handleInputChange('documentRetention', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notary Settings */}
            <div id="notary" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notary Settings</h2>
                  <p className="text-sm text-gray-600">Configure notary requirements</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Require Verification</p>
                    <p className="text-sm text-gray-600">All notaries must be verified</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireVerification}
                      onChange={(e) => handleInputChange('requireVerification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Experience (years)</label>
                    <input
                      type="number"
                      value={settings.minExperience}
                      onChange={(e) => handleInputChange('minExperience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Session Duration (min)</label>
                    <input
                      type="number"
                      value={settings.maxSessionDuration}
                      onChange={(e) => handleInputChange('maxSessionDuration', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Platform Commission (%)</label>
                  <input
                    type="number"
                    value={settings.notaryCommission}
                    onChange={(e) => handleInputChange('notaryCommission', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div id="security" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-600">Configure security policies</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Session Timeout (min)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password Expiry (days)</label>
                    <input
                      type="number"
                      value={settings.passwordExpiry}
                      onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleInputChange('maxLoginAttempts', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div id="system" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
                  <p className="text-sm text-gray-600">Configure system behavior</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">Put site in maintenance mode</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Debug Mode</p>
                    <p className="text-sm text-gray-600">Enable debug logging</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.debugMode}
                      onChange={(e) => handleInputChange('debugMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Cache Enabled</p>
                    <p className="text-sm text-gray-600">Enable application caching</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.cacheEnabled}
                      onChange={(e) => handleInputChange('cacheEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
