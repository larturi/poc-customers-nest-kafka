export interface Customer {
  id: string;
  name: string;
  email: string;
  status?: string;
  activatedAt?: string;
  firstPaymentAt?: string;
}

export interface Payment {
  customerId: string;
  amount: number;
  paymentMethod: string;
  description: string;
  processedAt: string;
}

export interface Profile {
  customerId: string;
  riskScore: number;
  segment: string;
  recommendations: string[];
  createdAt?: string;
  lastUpdated?: string;
}

export interface Promotion {
  customerId: string;
  type: string;
  discount: number;
  description: string;
  validUntil: string;
  activatedAt: string;
  paymentAmount?: number;
  newTier?: string;
  reason?: string;
}

export interface CustomerOnboardedMessage {
  customerId: string;
  customer: Customer;
  timestamp: string;
}

export interface CustomerActivatedMessage {
  customerId: string;
  customer: Customer;
  timestamp: string;
}

export interface FirstPaymentMessage {
  customerId: string;
  payment: Payment;
  customer: Customer;
  timestamp: string;
}

export interface CustomerProfiledMessage {
  customerId: string;
  profile?: Profile;
  promotion?: Promotion;
  timestamp: string;
}

export interface PromotionActivatedMessage {
  customerId: string;
  promotion: Promotion;
  timestamp: string;
}

export type ProfilingKafkaMessage =
  | CustomerOnboardedMessage
  | CustomerActivatedMessage
  | FirstPaymentMessage
  | CustomerProfiledMessage
  | PromotionActivatedMessage;
