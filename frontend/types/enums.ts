export enum OrderStatus {
  PENDING = 'PENDING',       // Ödeme Bekliyor
  PAID = 'PAID',             // Ödendi
  PREPARING = 'PREPARING',   // Hazırlanıyor
  SHIPPED = 'SHIPPED',       // Kargoda
  DELIVERED = 'DELIVERED',   // Teslim Edildi
  CANCELLED = 'CANCELLED',   // İptal
  REFUNDED = 'REFUNDED'      // İade
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled', // Müşteri tamamen gitti
  UPGRADED = 'upgraded',   // Daha üst pakete geçti (Olumlu ayrılma)
  EXPIRED = 'expired',
  PAYMENT_FAILED = 'payment_failed'
}