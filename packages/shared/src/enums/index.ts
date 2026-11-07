export enum StaffRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum UserType {
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export enum CustomerWholesaleStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum OrderType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  TRANSFERENCIA = 'TRANSFERENCIA',
  EFECTIVO = 'EFECTIVO',
  MERCADOPAGO = 'MERCADOPAGO',
  OTRO = 'OTRO'
}

export enum DeliveryMethod {
  RETIRO_LOCAL = 'RETIRO_LOCAL',
  ENVIO_DOMICILIO = 'ENVIO_DOMICILIO'
}

export enum AuditLogTag {
  AUTH = 'AUTH',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  SETTINGS = 'SETTINGS',
  SYSTEM = 'SYSTEM'
}
