'use client'

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, HelpCircle, Eye, EyeOff, FileText, CheckCircle, MessageCircle, X, Mail, Lock, Star, MapPin, User, ChevronDown } from 'lucide-react'
import {
  documentTemplates,
  documentCategories,
  getDocumentTitle,
  getShortDescription,
  saveCreateDraft,
  type CreateDraft,
} from '@/lib/document-templates'
import { getUser, saveUser, saveToken, getToken } from '@/lib/auth'
import { getFieldConfig } from '@/lib/document-fields'

interface Advocate {
  id: string
  name: string
  rating: number
  reviews: number
  experience: number
  specialization: string[]
  location: string
  fee: number
  availability: string
  bio: string
}

const FALLBACK_ADVOCATES: Advocate[] = [
  {
    id: '1',
    name: 'Adv. Rajesh Kumar',
    rating: 4.9,
    reviews: 287,
    experience: 12,
    specialization: ['Property Law', 'Civil Law'],
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
    specialization: ['Family Law', 'Affidavits'],
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
    specialization: ['Corporate Law', 'Contracts'],
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
    specialization: ['Property Law', 'Rental Agreements'],
    location: 'Hyderabad, Telangana',
    fee: 999,
    availability: 'Available Today',
    bio: 'Specializing in property law and rental agreements with a focus on customer satisfaction.',
  },
]

function CreateDocumentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showDocumentSelector, setShowDocumentSelector] = useState(true)
  const [showAdvocateSelector, setShowAdvocateSelector] = useState(false)
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [autoSaved, setAutoSaved] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [draftError, setDraftError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [advocates, setAdvocates] = useState<Advocate[]>(FALLBACK_ADVOCATES)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch real notaries from backend; fall back to static list on error
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query {
          notaries {
            id fullName experience specialization location consultationFee rating reviewsCount bio
          }
        }`,
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        const items: Advocate[] = (json.data?.notaries ?? []).map((n: {
          id: string; fullName: string; experience: number; specialization: string[];
          location: string; consultationFee: number; rating: number; reviewsCount: number; bio?: string;
        }) => ({
          id: n.id,
          name: n.fullName,
          rating: n.rating,
          reviews: n.reviewsCount,
          experience: n.experience,
          specialization: n.specialization,
          location: n.location,
          fee: n.consultationFee,
          availability: 'Available Today',
          bio: n.bio ?? '',
        }))
        if (items.length > 0) setAdvocates(items)
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const templateFromUrl = searchParams.get('template')
  const draftIdFromUrl = searchParams.get('draft')

  useEffect(() => {
    if (!templateFromUrl || !documentTemplates[templateFromUrl]) return
    const t = documentTemplates[templateFromUrl]
    setSelectedTemplate(templateFromUrl)
    setShowDocumentSelector(false)

    if (draftIdFromUrl) {
      const token = getToken()
      if (token) {
        fetch(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            query: `query GetDraft($id: String!) {
              document(id: $id) { id formData currentStep }
            }`,
            variables: { id: draftIdFromUrl },
          }),
        })
          .then((r) => r.json())
          .then((json) => {
            const doc = json.data?.document
            if (doc) {
              setFormData({ ...t.defaultValues, ...(doc.formData as Record<string, string>) })
              setCurrentStep(doc.currentStep || 1)
            } else {
              setFormData(t.defaultValues)
              setCurrentStep(1)
            }
          })
          .catch(() => {
            setFormData(t.defaultValues)
            setCurrentStep(1)
          })
        return
      }
    }
    setFormData(t.defaultValues)
    setCurrentStep(1)
  }, [templateFromUrl, draftIdFromUrl])

  const currentTemplate = useMemo(() => {
    return documentTemplates[selectedTemplate] || documentTemplates['flat-rental-agreement']
  }, [selectedTemplate])

  const totalSteps = currentTemplate?.steps?.length || 4

  const handleDocumentSelect = () => {
    if (selectedTemplate) {
      const template = documentTemplates[selectedTemplate]
      if (template) {
        setFormData(template.defaultValues)
      }
      setShowDocumentSelector(false)
      setShowAdvocateSelector(true)
      setCurrentStep(1)
    } else {
      alert('Please select a document type')
    }
  }

  const handleAdvocateContinue = () => {
    if (!selectedAdvocate) {
      alert('Please select an advocate to continue')
      return
    }
    setShowAdvocateSelector(false)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
    }
    setTimeout(() => {
      setAutoSaved(true)
      setTimeout(() => setAutoSaved(false), 2000)
    }, 500)
  }

  const validateCurrentStep = (): boolean => {
    const step = currentTemplate.steps.find((s: any) => s.id === currentStep)
    if (!step) return true
    const errors: Record<string, string> = {}
    for (const fieldName of step.fields) {
      const config = getFieldConfig(fieldName)
      if (!config.required) continue
      const value = (formData[fieldName] || '').trim()
      if (!value) {
        errors[fieldName] = `${config.label} is required.`
        continue
      }
      if (config.type === 'tel') {
        if (!/^[+]?[\d\s\-()]{7,15}$/.test(value))
          errors[fieldName] = 'Enter a valid phone number.'
      } else if (config.type === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          errors[fieldName] = 'Enter a valid email address.'
      } else if (config.type === 'number') {
        if (isNaN(Number(value)) || Number(value) <= 0)
          errors[fieldName] = 'Enter a valid positive number.'
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function buildDraft(): CreateDraft | null {
    if (!selectedTemplate || !currentTemplate) return null
    return {
      templateId: selectedTemplate,
      templateName: currentTemplate.name,
      formData: { ...formData },
      documentTitle: getDocumentTitle(selectedTemplate, formData),
      shortDescription: getShortDescription(selectedTemplate, formData),
      notaryId: selectedAdvocate?.id,
    }
  }

  const handleSaveDraft = async () => {
    const draft = buildDraft()
    if (!draft) return
    setDraftError(null)
    const token = getToken()
    if (token) {
      setDraftSaving(true)
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              query: `mutation SaveDraft($input: CreateDocumentInput!) {
                createDocument(input: $input) { id title status }
              }`,
              variables: {
                input: {
                  templateId: draft.templateId,
                  title: draft.documentTitle,
                  formData: draft.formData,
                  currentStep,
                },
              },
            }),
          }
        )
        const json = await res.json()
        if (json.errors?.length) {
          setDraftError(json.errors[0].message ?? 'Failed to save draft. Please try again.')
          return
        }
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 3000)
      } catch {
        setDraftError('Network error. Please check your connection and try again.')
      } finally {
        setDraftSaving(false)
      }
      return
    }
    // Not logged in — save locally and prompt to sign in
    saveCreateDraft(draft)
    setDraftError('Sign in to save your draft to your account. Saved locally for now.')
    setTimeout(() => setDraftError(null), 4000)
  }

  const handleContinueToCheckout = () => {
    const draft = buildDraft()
    if (!draft) return
    saveCreateDraft(draft)
    const user = getUser()
    if (!user) {
      setShowLoginModal(true)
      return
    }
    router.push('/create/checkout')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `mutation Login($email: String!, $password: String!) {
              login(input: { method: "EMAIL", email: $email, password: $password }) {
                accessToken
                user { id name email phone role }
              }
            }`,
            variables: { email: loginEmail, password: loginPassword },
          }),
        }
      )
      const json = await res.json()
      if (json.errors?.length) { setLoginError(json.errors[0].message); return }
      const payload = json.data?.login
      if (!payload) { setLoginError('Invalid email or password.'); return }
      const roleMap: Record<string, 'user' | 'notary' | 'admin'> = { USER: 'user', NOTARY: 'notary', ADMIN: 'admin' }
      saveToken(payload.accessToken)
      saveUser({ name: payload.user.name, email: payload.user.email, phone: payload.user.phone ?? '', role: roleMap[payload.user.role] ?? 'user' })
      setShowLoginModal(false)
      router.push('/create/checkout')
    } catch {
      setLoginError('Network error. Please check your connection.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Render field based on configuration
  const renderField = (fieldName: string) => {
    const config = getFieldConfig(fieldName)
    const value = formData[fieldName] || ''
    const error = fieldErrors[fieldName]
    const baseClass = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
    const inputClass = `${baseClass} ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`

    if (config.type === 'textarea') {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.label} {config.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            required={config.required}
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            placeholder={config.placeholder}
            rows={config.rows || 3}
            className={inputClass}
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {!error && config.help && <p className="text-xs text-gray-500 mt-1">{config.help}</p>}
        </div>
      )
    } else if (config.type === 'select') {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.label} {config.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            className={inputClass}
          >
            {config.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {!error && config.help && <p className="text-xs text-gray-500 mt-1">{config.help}</p>}
        </div>
      )
    } else {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.label} {config.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={config.type}
            required={config.required}
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            placeholder={config.placeholder}
            className={inputClass}
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {!error && config.help && <p className="text-xs text-gray-500 mt-1">{config.help}</p>}
        </div>
      )
    }
  }

  // Render document preview based on template type
  const renderPreview = () => {
    switch (selectedTemplate) {
      case 'flat-rental-agreement':
      case 'house-rental-agreement':
      case 'commercial-office-agreement':
      case 'commercial-shop-rental':
        return (
          <div className="prose prose-sm max-w-none">
            <h1 className="text-xl font-bold text-center mb-6">RENTAL AGREEMENT</h1>
            <p className="mb-4">This Rental Agreement is made on {formData.startDate || '________'} between:</p>
            <div className="mb-4">
              <p className="font-semibold">LANDLORD:</p>
              <p>{formData.landlordName || '[Landlord Name]'}</p>
              <p className="text-sm text-gray-600">{formData.landlordAddress || '[Landlord Address]'}</p>
              <p className="text-sm text-gray-600">Phone: {formData.landlordPhone || '[Phone Number]'}</p>
            </div>
            <div className="mb-4">
              <p className="font-semibold">TENANT:</p>
              <p>{formData.tenantName || '[Tenant Name]'}</p>
              <p className="text-sm text-gray-600">{formData.tenantAddress || '[Tenant Address]'}</p>
              <p className="text-sm text-gray-600">Phone: {formData.tenantPhone || '[Phone Number]'}</p>
            </div>
            <p className="font-semibold mb-2">PROPERTY DETAILS:</p>
            <p className="mb-4">{formData.propertyAddress || '[Property Address]'}</p>
            <p className="mb-4">Type: {formData.propertyType === 'residential' ? 'Residential' : 'Commercial'}</p>
            <p className="font-semibold mb-2">TERMS & CONDITIONS:</p>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>The monthly rent is ₹{formData.rentAmount || '_____'} payable on or before the 5th of every month.</li>
              <li>The security deposit amount is ₹{formData.securityDeposit || '_____'}.</li>
              <li>The agreement is for a period of {formData.duration || '__'} months starting from {formData.startDate || '________'}.</li>
              <li>Either party may terminate this agreement by giving {formData.noticePeriod || '_'} month(s) written notice.</li>
              <li>The tenant shall use the property for {formData.propertyType === 'residential' ? 'residential' : 'commercial'} purposes only.</li>
              <li>The tenant shall maintain the property in good condition.</li>
            </ol>
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <p className="mb-12 border-t border-gray-300 pt-2">Landlord&apos;s Signature</p>
                <p className="text-sm">{formData.landlordName || '[Name]'}</p>
              </div>
              <div>
                <p className="mb-12 border-t border-gray-300 pt-2">Tenant&apos;s Signature</p>
                <p className="text-sm">{formData.tenantName || '[Name]'}</p>
              </div>
            </div>
          </div>
        )

      case 'general-affidavit':
      case 'name-change-affidavit':
      case 'address-proof-affidavit':
        return (
          <div className="prose prose-sm max-w-none">
            <h1 className="text-xl font-bold text-center mb-6">AFFIDAVIT</h1>
            <p className="mb-4">I, {formData.deponentName || '[Deponent Name]'}, aged {formData.deponentAge || '__'} years, residing at {formData.deponentAddress || '[Address]'}, do hereby solemnly affirm and declare as follows:</p>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>That I am the deponent herein and I am competent to swear this affidavit.</li>
              <li>That the purpose of this affidavit is: {formData.affidavitPurpose || '[Purpose]'}.</li>
              <li>That {formData.statement || '[Your statement/declaration]'}.</li>
              <li>That the above statement is true to the best of my knowledge and belief.</li>
            </ol>
            <div className="mt-12">
              <p className="mb-2">Place: {formData.placeOfExecution || '[Place]'}</p>
              <p className="mb-12">Date: {new Date().toLocaleDateString()}</p>
              <div className="border-t border-gray-300 pt-2 inline-block">
                <p className="text-sm">{formData.deponentName || '[Deponent Name]'}</p>
                <p className="text-xs text-gray-600">Deponent</p>
              </div>
            </div>
          </div>
        )

      case 'general-power-of-attorney':
      case 'special-power-of-attorney':
        return (
          <div className="prose prose-sm max-w-none">
            <h1 className="text-xl font-bold text-center mb-6">POWER OF ATTORNEY</h1>
            <p className="mb-4">This Power of Attorney is executed on {formData.effectiveDate || '________'}</p>
            <div className="mb-4">
              <p className="font-semibold">BY (Principal/Grantor):</p>
              <p>{formData.principalName || '[Principal Name]'}, aged {formData.principalAge || '__'} years</p>
              <p className="text-sm text-gray-600">{formData.principalAddress || '[Principal Address]'}</p>
            </div>
            <div className="mb-4">
              <p className="font-semibold">IN FAVOUR OF (Attorney/Grantee):</p>
              <p>{formData.attorneyName || '[Attorney Name]'}, aged {formData.attorneyAge || '__'} years</p>
              <p className="text-sm text-gray-600">{formData.attorneyAddress || '[Attorney Address]'}</p>
            </div>
            <p className="font-semibold mb-2">POWERS GRANTED:</p>
            <p className="mb-4">{formData.powersGranted || '[Description of powers granted]'}</p>
            <p className="mb-4">This Power of Attorney shall be effective from {formData.effectiveDate || '[Date]'} {formData.expiryDate ? `until ${formData.expiryDate}` : 'until revoked'}.</p>
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <p className="mb-12 border-t border-gray-300 pt-2">Principal&apos;s Signature</p>
                <p className="text-sm">{formData.principalName || '[Name]'}</p>
              </div>
              <div>
                <p className="mb-12 border-t border-gray-300 pt-2">Attorney&apos;s Acceptance</p>
                <p className="text-sm">{formData.attorneyName || '[Name]'}</p>
              </div>
            </div>
          </div>
        )

      case 'non-disclosure-agreement-(nda)':
        return (
          <div className="prose prose-sm max-w-none">
            <h1 className="text-xl font-bold text-center mb-6">NON-DISCLOSURE AGREEMENT</h1>
            <p className="mb-4">This Non-Disclosure Agreement is entered into on {formData.agreementDate || '________'}</p>
            <div className="mb-4">
              <p className="font-semibold">DISCLOSING PARTY:</p>
              <p>{formData.disclosingPartyName || '[Company/Individual Name]'}</p>
              <p className="text-sm text-gray-600">{formData.disclosingPartyAddress || '[Address]'}</p>
              <p className="text-sm text-gray-600">Email: {formData.disclosingPartyEmail || '[Email]'}</p>
            </div>
            <div className="mb-4">
              <p className="font-semibold">RECEIVING PARTY:</p>
              <p>{formData.receivingPartyName || '[Company/Individual Name]'}</p>
              <p className="text-sm text-gray-600">{formData.receivingPartyAddress || '[Address]'}</p>
              <p className="text-sm text-gray-600">Email: {formData.receivingPartyEmail || '[Email]'}</p>
            </div>
            <p className="font-semibold mb-2">PURPOSE:</p>
            <p className="mb-4">{formData.confidentialPurpose || '[Purpose of disclosure]'}</p>
            <p className="font-semibold mb-2">TERMS:</p>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>The Receiving Party agrees to keep confidential all information disclosed by the Disclosing Party.</li>
              <li>The confidential information shall not be disclosed to any third party without prior written consent.</li>
              <li>This agreement shall remain in effect for {formData.duration || '__'} years from the date of execution.</li>
              <li>The Receiving Party shall use the confidential information solely for the stated purpose.</li>
            </ol>
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <p className="mb-12 border-t border-gray-300 pt-2">Disclosing Party</p>
                <p className="text-sm">{formData.disclosingPartyName || '[Name]'}</p>
              </div>
              <div>
                <p className="mb-12 border-t border-gray-300 pt-2">Receiving Party</p>
                <p className="text-sm">{formData.receivingPartyName || '[Name]'}</p>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="prose prose-sm max-w-none">
            <h1 className="text-xl font-bold text-center mb-6">{currentTemplate.name?.toUpperCase()}</h1>
            <p className="text-gray-500 text-center">Preview will be generated based on your input</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Document Selection Screen */}
      {showDocumentSelector ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <FileText className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Legal Document</h1>
              <p className="text-gray-600">Select the type of document you need to create</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Document Type *
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <span className={selectedTemplate ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedTemplate
                      ? documentCategories.flatMap(c => c.documents).find(d => d.toLowerCase().replace(/\s+/g, '-') === selectedTemplate) ?? selectedTemplate
                      : '-- Choose a document type --'}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                    <div
                      onClick={() => { setSelectedTemplate(''); setShowDropdown(false) }}
                      className="px-4 py-2.5 text-gray-400 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                    >
                      -- Choose a document type --
                    </div>
                    {documentCategories.map((cat) => (
                      <div key={cat.category}>
                        <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-gray-100 sticky top-0">
                          {cat.category}
                        </div>
                        {cat.documents.map((doc) => {
                          const value = doc.toLowerCase().replace(/\s+/g, '-')
                          return (
                            <div
                              key={doc}
                              onClick={() => { setSelectedTemplate(value); setShowDropdown(false) }}
                              className={`px-6 py-2.5 cursor-pointer text-sm transition-colors ${
                                selectedTemplate === value
                                  ? 'bg-primary-50 text-primary-700 font-semibold'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {doc}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleDocumentSelect}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 mt-6"
              >
                Continue
              </button>

              <Link
                href="/services"
                className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4"
              >
                ← Back to Services
              </Link>
            </div>
          </div>
        </div>
      ) : showAdvocateSelector ? (
        /* Advocate Selection Screen */
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-gray-800 to-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setShowAdvocateSelector(false); setShowDocumentSelector(true) }}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                  aria-label="Back to document selection"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Select Your Advocate</h1>
                  <p className="text-gray-300">
                    Choose an advocate to assist with your{' '}
                    <span className="text-white font-semibold">
                      {selectedTemplate.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="grid md:grid-cols-2 gap-6">
                  {advocates.map((advocate) => (
                    <button
                      key={advocate.id}
                      type="button"
                      onClick={() => setSelectedAdvocate(advocate)}
                      className={`text-left bg-white rounded-2xl border-2 p-6 shadow-lg transition-all ${
                        selectedAdvocate?.id === advocate.id
                          ? 'border-gray-900 ring-2 ring-gray-900/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-900">{advocate.rating}</span>
                        <span className="text-gray-600 text-sm">({advocate.reviews} reviews)</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{advocate.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {advocate.location}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {advocate.specialization.map((s) => (
                          <span key={s} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{advocate.bio}</p>
                      {selectedAdvocate?.id === advocate.id && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-900 font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>{selectedTemplate.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                    </div>
                    {selectedAdvocate && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span>{selectedAdvocate.name}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAdvocateContinue}
                    disabled={!selectedAdvocate}
                    className="w-full bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-colors"
                  >
                    {selectedAdvocate ? `Continue with ${selectedAdvocate.name.split(' ')[1]}` : 'Select an Advocate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowAdvocateSelector(true)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Create {selectedTemplate ? selectedTemplate.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Document'}
                    </h1>
                    <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {autoSaved && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Auto-saved
                    </span>
                  )}
                  {draftSaved && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Draft saved!
                    </span>
                  )}
                  {draftError && (
                    <span className="text-sm text-red-600 flex items-center gap-1 max-w-xs text-right">
                      {draftError}
                    </span>
                  )}
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!showDocumentSelector && !showAdvocateSelector && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Step Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex gap-2 mb-6">
                {currentTemplate.steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => { if (step.id < currentStep) { setCurrentStep(step.id); setFieldErrors({}) } }}
                    disabled={step.id > currentStep}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                      currentStep === step.id
                        ? 'bg-primary-600 text-white'
                        : step.id < currentStep
                        ? 'bg-green-100 text-green-700 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {step.id < currentStep && <CheckCircle className="h-4 w-4 inline mr-1" />}
                    Step {step.id}
                  </button>
                ))}
              </div>

              {/* Dynamic Step Rendering */}
              {currentTemplate.steps.map((step: any) => (
                currentStep === step.id && (
                  <div key={step.id} className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {step.title}
                      <span title={`Enter ${step.title.toLowerCase()}`}>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </span>
                    </h2>
                    {step.fields.map((fieldName: string) => renderField(fieldName))}
                  </div>
                )
              ))}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {currentStep < totalSteps && (
                  <button
                    onClick={() => { if (validateCurrentStep()) setCurrentStep(currentStep + 1) }}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Next
                  </button>
                )}

                {/* Bottom Action Buttons - Only show in final step */}
                {currentStep === totalSteps && (
                  <>
                    <button
                      onClick={handleSaveDraft}
                      disabled={draftSaving}
                      className="flex-1 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-300"
                    >
                      <Save className="h-5 w-5" />
                      {draftSaving ? 'Saving…' : 'Save Draft'}
                    </button>
                    <button
                      onClick={handleContinueToCheckout}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Continue to Checkout
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-blue-700">
                    Our AI assistant is here to guide you through the process
                  </p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    Chat with Assistant →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="p-8 bg-white max-h-[calc(100vh-200px)] overflow-y-auto">
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sign in to continue</h2>
              <p className="text-sm text-gray-500 mt-1">Your document progress is saved. Sign in to proceed to checkout.</p>
            </div>
            {loginError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {loginLoading ? 'Signing in...' : 'Sign In & Continue to Checkout'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateDocumentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-xl" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    }>
      <CreateDocumentContent />
    </Suspense>
  )
}
