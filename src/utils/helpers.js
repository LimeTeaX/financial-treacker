// src/utils/helpers.js
export const filterByPeriod = (transactions, period) => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'Week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'Month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3 Months':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6 Months':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'Year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(0);
  }

  return transactions.filter(tx => tx.date && new Date(tx.date) >= startDate);
};