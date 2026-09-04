// Audit Log Service
// Creates immutable audit trail records for compliance and accounting verification
export const auditService = {
  createAuditRecord({ pharmacyId, userId, userName, action, entity, entityId, details }) {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      pharmacyId,
      userId: userId || "usr_system",
      userName: userName || "Clinical User",
      action, // e.g. "Bill Verified", "Payment Recorded", "Inventory Adjusted"
      entity, // "purchaseBills", "payments", "batches", "distributors", "settings"
      entityId: String(entityId || ''),
      details: String(details || ''),
      timestamp: new Date().toISOString()
    };
  }
};
