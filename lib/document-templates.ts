/**
 * Shared document templates, categories, and helpers for /create and /create/checkout.
 */

export const BASE_PRICE = 249
export const DELIVERY_FEE = 149
export const TOTAL_DEFAULT = BASE_PRICE + DELIVERY_FEE

export const documentTemplates: Record<string, {
  name: string
  steps: { id: number; title: string; fields: string[] }[]
  defaultValues: Record<string, string>
}> = {
  'flat-rental-agreement': {
    name: 'Flat Rental Agreement',
    steps: [
      { id: 1, title: 'Landlord Details', fields: ['landlordName', 'landlordAddress', 'landlordPhone'] },
      { id: 2, title: 'Tenant Details', fields: ['tenantName', 'tenantAddress', 'tenantPhone'] },
      { id: 3, title: 'Property Details', fields: ['propertyAddress', 'propertyType', 'rentAmount', 'securityDeposit'] },
      { id: 4, title: 'Agreement Terms', fields: ['startDate', 'duration', 'noticePeriod'] },
    ],
    defaultValues: {
      landlordName: '', landlordAddress: '', landlordPhone: '',
      tenantName: '', tenantAddress: '', tenantPhone: '',
      propertyAddress: '', propertyType: 'residential', rentAmount: '', securityDeposit: '',
      startDate: '', duration: '11', noticePeriod: '1',
    },
  },
  'general-affidavit': {
    name: 'General Affidavit',
    steps: [
      { id: 1, title: 'Personal Details', fields: ['deponentName', 'deponentAddress', 'deponentAge'] },
      { id: 2, title: 'Affidavit Details', fields: ['affidavitPurpose', 'statement', 'placeOfExecution'] },
    ],
    defaultValues: {
      deponentName: '', deponentAddress: '', deponentAge: '',
      affidavitPurpose: '', statement: '', placeOfExecution: '',
    },
  },
  'general-power-of-attorney': {
    name: 'General Power Of Attorney',
    steps: [
      { id: 1, title: 'Principal Details', fields: ['principalName', 'principalAddress', 'principalAge'] },
      { id: 2, title: 'Attorney Details', fields: ['attorneyName', 'attorneyAddress', 'attorneyAge'] },
      { id: 3, title: 'Powers Granted', fields: ['powersGranted', 'effectiveDate', 'expiryDate'] },
    ],
    defaultValues: {
      principalName: '', principalAddress: '', principalAge: '',
      attorneyName: '', attorneyAddress: '', attorneyAge: '',
      powersGranted: '', effectiveDate: '', expiryDate: '',
    },
  },
  'non-disclosure-agreement-(nda)': {
    name: 'Non-Disclosure Agreement (NDA)',
    steps: [
      { id: 1, title: 'Disclosing Party', fields: ['disclosingPartyName', 'disclosingPartyAddress', 'disclosingPartyEmail'] },
      { id: 2, title: 'Receiving Party', fields: ['receivingPartyName', 'receivingPartyAddress', 'receivingPartyEmail'] },
      { id: 3, title: 'Agreement Terms', fields: ['agreementDate', 'confidentialPurpose', 'duration'] },
    ],
    defaultValues: {
      disclosingPartyName: '', disclosingPartyAddress: '', disclosingPartyEmail: '',
      receivingPartyName: '', receivingPartyAddress: '', receivingPartyEmail: '',
      agreementDate: '', confidentialPurpose: '', duration: '2',
    },
  },
  'house-rental-agreement': {
    name: 'House Rental Agreement',
    steps: [
      { id: 1, title: 'Landlord Details', fields: ['landlordName', 'landlordAddress', 'landlordPhone'] },
      { id: 2, title: 'Tenant Details', fields: ['tenantName', 'tenantAddress', 'tenantPhone'] },
      { id: 3, title: 'Property Details', fields: ['propertyAddress', 'propertyType', 'rentAmount', 'securityDeposit'] },
      { id: 4, title: 'Agreement Terms', fields: ['startDate', 'duration', 'noticePeriod'] },
    ],
    defaultValues: {
      landlordName: '', landlordAddress: '', landlordPhone: '',
      tenantName: '', tenantAddress: '', tenantPhone: '',
      propertyAddress: '', propertyType: 'residential', rentAmount: '', securityDeposit: '',
      startDate: '', duration: '11', noticePeriod: '1',
    },
  },
  'commercial-office-agreement': {
    name: 'Commercial Office Agreement',
    steps: [
      { id: 1, title: 'Landlord Details', fields: ['landlordName', 'landlordAddress', 'landlordPhone'] },
      { id: 2, title: 'Tenant Details', fields: ['tenantName', 'tenantAddress', 'tenantPhone'] },
      { id: 3, title: 'Property Details', fields: ['propertyAddress', 'propertyType', 'rentAmount', 'securityDeposit'] },
      { id: 4, title: 'Agreement Terms', fields: ['startDate', 'duration', 'noticePeriod'] },
    ],
    defaultValues: {
      landlordName: '', landlordAddress: '', landlordPhone: '',
      tenantName: '', tenantAddress: '', tenantPhone: '',
      propertyAddress: '', propertyType: 'commercial', rentAmount: '', securityDeposit: '',
      startDate: '', duration: '11', noticePeriod: '1',
    },
  },
  'commercial-shop-rental': {
    name: 'Commercial Shop Rental',
    steps: [
      { id: 1, title: 'Landlord Details', fields: ['landlordName', 'landlordAddress', 'landlordPhone'] },
      { id: 2, title: 'Tenant Details', fields: ['tenantName', 'tenantAddress', 'tenantPhone'] },
      { id: 3, title: 'Property Details', fields: ['propertyAddress', 'propertyType', 'rentAmount', 'securityDeposit'] },
      { id: 4, title: 'Agreement Terms', fields: ['startDate', 'duration', 'noticePeriod'] },
    ],
    defaultValues: {
      landlordName: '', landlordAddress: '', landlordPhone: '',
      tenantName: '', tenantAddress: '', tenantPhone: '',
      propertyAddress: '', propertyType: 'commercial', rentAmount: '', securityDeposit: '',
      startDate: '', duration: '11', noticePeriod: '1',
    },
  },
  'name-change-affidavit': {
    name: 'Name Change Affidavit',
    steps: [
      { id: 1, title: 'Personal Details', fields: ['deponentName', 'deponentAddress', 'deponentAge'] },
      { id: 2, title: 'Affidavit Details', fields: ['affidavitPurpose', 'statement', 'placeOfExecution'] },
    ],
    defaultValues: {
      deponentName: '', deponentAddress: '', deponentAge: '',
      affidavitPurpose: 'Name Change', statement: '', placeOfExecution: '',
    },
  },
  'address-proof-affidavit': {
    name: 'Address Proof Affidavit',
    steps: [
      { id: 1, title: 'Personal Details', fields: ['deponentName', 'deponentAddress', 'deponentAge'] },
      { id: 2, title: 'Affidavit Details', fields: ['affidavitPurpose', 'statement', 'placeOfExecution'] },
    ],
    defaultValues: {
      deponentName: '', deponentAddress: '', deponentAge: '',
      affidavitPurpose: 'Address Proof', statement: '', placeOfExecution: '',
    },
  },
  'special-power-of-attorney': {
    name: 'Special Power Of Attorney',
    steps: [
      { id: 1, title: 'Principal Details', fields: ['principalName', 'principalAddress', 'principalAge'] },
      { id: 2, title: 'Attorney Details', fields: ['attorneyName', 'attorneyAddress', 'attorneyAge'] },
      { id: 3, title: 'Powers Granted', fields: ['powersGranted', 'effectiveDate', 'expiryDate'] },
    ],
    defaultValues: {
      principalName: '', principalAddress: '', principalAge: '',
      attorneyName: '', attorneyAddress: '', attorneyAge: '',
      powersGranted: '', effectiveDate: '', expiryDate: '',
    },
  },
}

export const documentCategories = [
  {
    category: 'Rent & Lease',
    documents: [
      'Flat Rental Agreement',
      'House Rental Agreement',
      'Commercial Office Agreement',
      'Commercial Shop Rental',
      'Room Agreement',
      'Office Sharing Agreement',
      'Car Parking Agreement',
      'Leave And Licence Agreement',
    ],
  },
  {
    category: 'Personal & Family',
    documents: [
      'General Power Of Attorney',
      'Special Power Of Attorney',
      'Power Of Attorney For Property',
      'Simple Will',
      'Will With Multiple Beneficiaries',
      'Gift Deed',
      'Consumer Complaint',
    ],
  },
  {
    category: 'Affidavits',
    documents: [
      'General Affidavit',
      'Name Change Affidavit',
      'Address Proof Affidavit',
      'Income Proof Affidavit',
      'Date of Birth Affidavit',
      'One And The Same Person Affidavit',
      'Marriage Registration Affidavit',
      'Domicile Certificate Affidavit',
    ],
  },
  {
    category: 'Managing Business',
    documents: [
      'Non-Disclosure Agreement (NDA)',
      'Job Offer And Employment Contract',
      'Consultancy Agreement',
      'Commercial Rental Agreement',
      'Partnership Deed',
    ],
  },
] as const

export function getDocumentTitle(templateId: string, formData: Record<string, string>): string {
  const t = documentTemplates[templateId]
  if (!t) return 'Legal Document'
  if (templateId.includes('rental') || templateId.includes('agreement')) {
    const prop = formData.propertyAddress || 'Property'
    return `${t.name} - ${String(prop).slice(0, 40)}${String(prop).length > 40 ? '…' : ''}`
  }
  if (templateId.includes('affidavit')) return `${t.name} - ${formData.deponentName || 'Deponent'}`
  if (templateId.includes('power-of-attorney')) return `${t.name} - ${formData.principalName || 'Principal'}`
  if (templateId.includes('nda')) return `${t.name} - ${formData.disclosingPartyName || 'Parties'}`
  return t.name
}

export function getShortDescription(templateId: string, formData: Record<string, string>): string {
  const t = documentTemplates[templateId]
  if (!t) return 'Legal document'
  if (templateId.includes('rental') || templateId.includes('agreement')) {
    const months = formData.duration || '11'
    const type = formData.propertyType === 'commercial' ? 'commercial' : 'residential'
    return `${months}-month ${type} rental agreement`
  }
  if (templateId.includes('affidavit')) return formData.affidavitPurpose ? `Affidavit: ${formData.affidavitPurpose}` : 'Affidavit'
  if (templateId.includes('power-of-attorney')) return 'Power of Attorney'
  if (templateId.includes('nda')) return 'Non-disclosure agreement'
  return t.name
}

export const CREATE_DRAFT_KEY = 'legaldoji-create-draft'

export interface CreateDraft {
  templateId: string
  templateName: string
  formData: Record<string, string>
  documentTitle: string
  shortDescription: string
  documentId?: string          // DB document id after saving to API
  deliveryAddressId?: string   // DB address id after saving delivery address
}

export function saveCreateDraft(draft: CreateDraft): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    /* ignore */
  }
}

export function loadCreateDraft(): CreateDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CREATE_DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CreateDraft
  } catch {
    return null
  }
}

export function clearCreateDraft(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(CREATE_DRAFT_KEY)
  } catch {
    /* ignore */
  }
}
