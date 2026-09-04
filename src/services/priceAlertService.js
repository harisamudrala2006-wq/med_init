// Price Anomaly & Comparative Analysis Service
// Identifies significant unit price differences without accusatory terminology
export const priceAlertService = {
  /**
   * Compares the purchase rate of an item against historical purchases
   */
  detectPriceDifference(item, historicalBatches = []) {
    const matchingBatches = historicalBatches.filter(
      b => b.productName && 
           b.productName.toLowerCase() === item.productName.toLowerCase() &&
           b.purchaseRate > 0
    );

    if (matchingBatches.length === 0) return null;

    // Find lowest historical purchase rate
    const lowestRate = Math.min(...matchingBatches.map(b => Number(b.purchaseRate)));
    const currentRate = Number(item.purchaseRate);

    if (lowestRate > 0 && currentRate > lowestRate * 1.05) {
      const percentDiff = (((currentRate - lowestRate) / lowestRate) * 100).toFixed(1);
      const prevDistributor = matchingBatches.find(b => Number(b.purchaseRate) === lowestRate)?.distributorName || "Other Distributor";

      return {
        hasAnomaly: true,
        alertType: "Potential Price Anomaly",
        productName: item.productName,
        currentRate,
        lowestRate,
        percentDifference: percentDiff,
        message: `Price Difference Detected: Charged ₹${currentRate.toFixed(2)} (+${percentDiff}% above ₹${lowestRate.toFixed(2)} previously from ${prevDistributor})`
      };
    }

    return null;
  }
};
