export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  documentType?: string
  documentNumber?: string
  birthDate?: string
  status: string
  createdAt: string
  activatedAt?: string
  deactivatedAt?: string
  firstPaymentAt?: string
  hasFirstPayment?: boolean
  promotedAt?: string
}
