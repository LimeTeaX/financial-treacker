// Example utility function
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Example utility function
export const calculatePercentage = (value, total) => {
  return ((value / total) * 100).toFixed(2);
};