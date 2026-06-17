/**
 * Calculate eco points earned from recycling
 * @param {number} weightKg - weight in kilograms
 * @param {string} category - device category
 * @returns {number} points earned
 */
function calculatePoints(weightKg, category) {
  const BASE_RATE = 40; // pts per kg

  const CATEGORY_MULTIPLIERS = {
    'Laptop / Computer': 1.2,
    'Smartphone / Tablet': 1.1,
    'Printer / Scanner': 1.0,
    'TV / Monitor': 1.0,
    'Kitchen Appliance': 0.9,
    'Other Electronics': 1.0,
  };

  const multiplier = CATEGORY_MULTIPLIERS[category] || 1.0;
  return Math.round(parseFloat(weightKg) * BASE_RATE * multiplier);
}

/**
 * Calculate estimated CO2 reduction in kg
 * @param {number} weightKg
 * @returns {number}
 */
function calculateCO2(weightKg) {
  return Math.round(parseFloat(weightKg) * 2.8 * 10) / 10;
}

/**
 * Calculate energy conserved in kWh
 * @param {number} weightKg
 * @returns {number}
 */
function calculateEnergy(weightKg) {
  return Math.round(parseFloat(weightKg) * 5.28 * 10) / 10;
}

module.exports = { calculatePoints, calculateCO2, calculateEnergy };
