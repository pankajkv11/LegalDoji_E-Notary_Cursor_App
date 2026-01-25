/**
 * Shared consultation booking data for /consultation flow.
 */

export const CONSULTATION_DRAFT_KEY = 'legaldoji-consultation-draft'

export interface ConsultationDraft {
  advocateId: string
  advocateName: string
  advocateFee: number
  date: string
  time: string
}

export function saveConsultationDraft(draft: ConsultationDraft): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CONSULTATION_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    /* ignore */
  }
}

export function loadConsultationDraft(): ConsultationDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CONSULTATION_DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsultationDraft
  } catch {
    return null
  }
}

export function clearConsultationDraft(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(CONSULTATION_DRAFT_KEY)
  } catch {
    /* ignore */
  }
}
