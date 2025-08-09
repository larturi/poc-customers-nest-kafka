export interface Customer {
  id: string;
  name: string;
  email: string;
  status?: string;
  activatedAt?: string;
  deactivatedAt?: string;
  firstPaymentAt?: string;
  promotedAt?: string;
  createdAt?: string;
}

export interface Payment {
  customerId: string;
  amount: number;
  paymentMethod?: string;
  description?: string;
  processedAt: string;
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

export interface CustomerDeactivatedMessage {
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

export interface CustomerPromotedMessage {
  customerId: string;
  customer: Customer;
  timestamp: string;
}

export interface NotificationSentMessage {
  customerId: string;
  type: string;
  template: string;
  recipient: string;
  timestamp: string;
}

export type CustomersKafkaMessage =
  | CustomerOnboardedMessage
  | CustomerActivatedMessage
  | CustomerDeactivatedMessage
  | FirstPaymentMessage
  | CustomerPromotedMessage
  | NotificationSentMessage;
