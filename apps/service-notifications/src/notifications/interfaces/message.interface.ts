// Interfaz para los mensajes de eventos de clientes
export interface Customer {
  id: string;
  name: string;
  email?: string;
  status?: string;
  activatedAt?: string;
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

export interface CustomerPromotedMessage {
  customerId: string;
  customer: Customer;
  timestamp: string;
}

// Tipo genérico para mensajes Kafka
export type KafkaMessage =
  | CustomerOnboardedMessage
  | CustomerActivatedMessage
  | CustomerPromotedMessage;
