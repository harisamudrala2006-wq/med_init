// Inventory & Batch Management Service
// Batch-level tracking, manual adjustments with audit reasons, and expiry categorisation
export const inventoryService = {
  /**
   * Evaluates batch expiry status based on days remaining
   */
  getExpiryCategory(expiryDateStr) {
    if (!expiryDateStr) return 'valid';
    const now = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'expired';
    if (diffDays <= 30) return 'critical_30';
    if (diffDays <= 60) return 'warning_60';
    if (diffDays <= 90) return 'caution_90';
    return 'valid';
  },

  /**
   * Filters batches by expiry category
   */
  filterBatchesByExpiry(batches = [], maxDays = 60) {
    const now = new Date();
    return batches.filter(batch => {
      if (!batch.expiryDate) return false;
      const expiry = new Date(batch.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= maxDays;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }
};
