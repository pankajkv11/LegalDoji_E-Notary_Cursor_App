'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, HelpCircle, Eye, FileText, CheckCircle, MessageCircle } from 'lucide-react'
import {
  documentTemplates,
  documentCategories,
  getDocumentTitle,
  getShortDescription,
  saveCreateDraft,
  type CreateDraft,
} from '@/lib/document-templates'
import { getFieldConfig } from '@/lib/document-fields'

function CreateDocumentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showDocumentSelector, setShowDocumentSelector] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [autoSaved, setAutoSaved] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const templateFromUrl = searchParams.get('template')

  useEffect(() => {
    if (templateFromUrl && documentTemplates[templateFromUrl]) {
      setSelectedTemplate(templateFromUrl)
      const t = documentTemplates[templateFromUrl]
      setFormData(t.defaultValues)
      setShowDocumentSelector(false)
      setCurrentStep(1)
    }
  }, [templateFromUrl])

  const currentTemplate = useMemo(() => {
    return documentTemplates[selectedTemplate] || documentTemplates['flat-rental-agreement']
  }, [selectedTemplate])

  const totalSteps = currentTemplate?.steps?.length || 4

  const handleDocumentSelect = () => {
    if (selectedTemplate) {
      // Initialize form data with template defaults
      const template = documentTemplates[selectedTemplate]
      if (template) {
        setFormData(template.defaultValues)
      }
      setShowDocumentSelector(false)
      setCurrentStep(1)
    } else {
      alert('Please select a document type')
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Simulate auto-save
    setTimeout(() => {
      setAutoSaved(true)
      setTimeout(() => setAutoSaved(false), 2000)
    }, 500)
  }

  function buildDraft(): CreateDraft | null {
    if (!selectedTemplate || !currentTemplate) return null
    return {
      templateId: selectedTemplate,
      templateName: currentTemplate.name,
      formData: { ...formData },
      documentTitle: getDocumentTitle(selectedTemplate, formData),
      shortDescription: getShortDescription(selectedTemplate, formData),
    }
  }

  const handleSaveDraft = () => {
    const draft = buildDraft()
    if (draft) {
      saveCreateDraft(draft)
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 3000)
    }
  }

  const handleContinueToCheckout = () => {
    const draft = buildDraft()
    if (!draft) return
    saveCreateDraft(draft)
    router.push('/create/checkout')
  }

  // Render field based on configuration
  const renderField = (fieldName: string) => {
    const config = getFieldConfig(fieldName)
    const value = formData[fieldName] || ''

    if (config.type === 'textarea') {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.label} {config.required && '*'}
          </label>
          <textarea
            required={config.required}
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            placeholder={config.placeholder}
            rows={config.rows || 3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {config.help && <p className="text-xs text-gray-500 mt-1">{config.help}</p>}
        </div>
      )
    } else if (config.type === 'select') {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.label} {config.required && '*'}
          </label>
          <select
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {config.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {config.help && <p className="text-xs text-gray-500 mt-1">{config.help}</p>}
        </div>
      )
    } else {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.label} {config.required && '*'}
          </label>
          <input
            type={config.type}
            required={config.required}
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            placeholder={config.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {config.help && <p className="text-xs text-gray-500 mt-1">{config.help}</p>}
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
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option value="">-- Choose a document type --</option>
                {documentCategories.map((cat) => (
                  <optgroup key={cat.category} label={cat.category}>
                    {cat.documents.map((doc) => (
                      <option key={doc} value={doc.toLowerCase().replace(/\s+/g, '-')}>
                        {doc}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

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
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowDocumentSelector(true)}
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

      {!showDocumentSelector && (
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
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                      currentStep === step.id
                        ? 'bg-primary-600 text-white'
                        : step.id < currentStep
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
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
                    onClick={() => setCurrentStep(currentStep + 1)}
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
                      className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-300"
                    >
                      <Save className="h-5 w-5" />
                      Save Draft
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
