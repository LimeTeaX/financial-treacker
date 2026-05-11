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

export const filterByPeriod = (transactions, period) => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "Week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "Month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3 Months":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "6 Months":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "Year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(0);
  }

  return transactions.filter((transaction) => new Date(transaction.date) >= startDate);
};
