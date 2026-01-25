/**
 * Field config for document create form. Used by CreateForm.
 */

export function getFieldConfig(fieldName: string): {
  label: string
  type: string
  placeholder?: string
  required: boolean
  rows?: number
  help?: string
  options?: { value: string; label: string }[]
} {
  const configs: Record<string, { label: string; type: string; placeholder?: string; required: boolean; rows?: number; help?: string; options?: { value: string; label: string }[] }> = {
    landlordName: { label: 'Landlord Full Name', type: 'text', placeholder: "Enter landlord's full name", required: true },
    landlordAddress: { label: 'Landlord Address', type: 'textarea', placeholder: 'Complete address with city, state, and PIN code', required: true, rows: 3 },
    landlordPhone: { label: 'Landlord Phone Number', type: 'tel', placeholder: '+91 98765 43210', required: true },
    tenantName: { label: 'Tenant Full Name', type: 'text', placeholder: "Enter tenant's full name", required: true },
    tenantAddress: { label: 'Tenant Address', type: 'textarea', placeholder: 'Complete address with city, state, and PIN code', required: true, rows: 3 },
    tenantPhone: { label: 'Tenant Phone Number', type: 'tel', placeholder: '+91 98765 43210', required: true },
    propertyAddress: { label: 'Property Address', type: 'textarea', placeholder: 'Complete address of the rental property', required: true, rows: 3 },
    propertyType: { label: 'Property Type', type: 'select', options: [{ value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }], required: true },
    rentAmount: { label: 'Monthly Rent (₹)', type: 'number', placeholder: '25000', required: true },
    securityDeposit: { label: 'Security Deposit (₹)', type: 'number', placeholder: '50000', required: true },
    startDate: { label: 'Agreement Start Date', type: 'date', required: true },
    duration: { label: 'Agreement Duration (months)', type: 'select', options: [{ value: '11', label: '11 months (Recommended)' }, { value: '12', label: '12 months' }, { value: '24', label: '24 months' }, { value: '36', label: '36 months' }], help: '11 months is recommended to avoid registration requirements', required: true },
    noticePeriod: { label: 'Notice Period (months)', type: 'select', options: [{ value: '1', label: '1 month' }, { value: '2', label: '2 months' }, { value: '3', label: '3 months' }], required: true },
    deponentName: { label: 'Deponent Name', type: 'text', placeholder: 'Enter full name', required: true },
    deponentAddress: { label: 'Deponent Address', type: 'textarea', placeholder: 'Complete residential address', required: true, rows: 3 },
    deponentAge: { label: 'Age', type: 'number', placeholder: '25', required: true },
    affidavitPurpose: { label: 'Purpose of Affidavit', type: 'text', placeholder: 'e.g., Name correction in documents', required: true },
    statement: { label: 'Statement/Declaration', type: 'textarea', placeholder: 'Write your statement or declaration here...', required: true, rows: 5 },
    placeOfExecution: { label: 'Place of Execution', type: 'text', placeholder: 'City name', required: true },
    principalName: { label: 'Principal Name (Grantor)', type: 'text', placeholder: 'Person granting the power', required: true },
    principalAddress: { label: 'Principal Address', type: 'textarea', placeholder: 'Complete address', required: true, rows: 3 },
    principalAge: { label: 'Principal Age', type: 'number', placeholder: '30', required: true },
    attorneyName: { label: 'Attorney Name (Grantee)', type: 'text', placeholder: 'Person receiving the power', required: true },
    attorneyAddress: { label: 'Attorney Address', type: 'textarea', placeholder: 'Complete address', required: true, rows: 3 },
    attorneyAge: { label: 'Attorney Age', type: 'number', placeholder: '28', required: true },
    powersGranted: { label: 'Powers Granted', type: 'textarea', placeholder: 'Describe the powers being granted...', required: true, rows: 4 },
    effectiveDate: { label: 'Effective Date', type: 'date', required: true },
    expiryDate: { label: 'Expiry Date (Optional)', type: 'date', required: false },
    disclosingPartyName: { label: 'Disclosing Party Name', type: 'text', placeholder: 'Company/Individual name', required: true },
    disclosingPartyAddress: { label: 'Disclosing Party Address', type: 'textarea', placeholder: 'Complete address', required: true, rows: 3 },
    disclosingPartyEmail: { label: 'Disclosing Party Email', type: 'email', placeholder: 'contact@company.com', required: true },
    receivingPartyName: { label: 'Receiving Party Name', type: 'text', placeholder: 'Company/Individual name', required: true },
    receivingPartyAddress: { label: 'Receiving Party Address', type: 'textarea', placeholder: 'Complete address', required: true, rows: 3 },
    receivingPartyEmail: { label: 'Receiving Party Email', type: 'email', placeholder: 'contact@company.com', required: true },
    agreementDate: { label: 'Agreement Date', type: 'date', required: true },
    confidentialPurpose: { label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'Describe the purpose...', required: true, rows: 3 },
  }
  return { ...(configs[fieldName] || { label: fieldName, type: 'text', placeholder: '', required: false }) }
}
