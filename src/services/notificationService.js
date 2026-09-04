// Notification Management Service
// Real-time notification aggregation and status tracking
export const notificationService = {
  createNotification({ pharmacyId, type, title, message, entityId = '', severity = 'info' }) {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      pharmacyId,
      type, // 'expiry' | 'payment_due' | 'price_anomaly' | 'bill_verification' | 'system'
      title,
      message,
      entityId,
      severity, // 'warning' | 'error' | 'info' | 'success'
      isRead: false,
      createdAt: new Date().toISOString()
    };
  }
};
