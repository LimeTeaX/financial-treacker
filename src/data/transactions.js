// src/data/transactions.js

export const TRANSACTIONS = [
    { id: 1, type: 'income', category: 'Salary', amount: 5000000, date: '2026-01-15' },
    { id: 2, type: 'income', category: 'Freelance', amount: 1500000, date: '2026-01-20' },
    { id: 3, type: 'income', category: 'Salary', amount: 5000000, date: '2026-02-15' },
    { id: 4, type: 'income', category: 'Freelance', amount: 2000000, date: '2026-02-22' },
    { id: 5, type: 'income', category: 'Salary', amount: 5000000, date: '2026-03-15' },
    { id: 6, type: 'income', category: 'Freelance', amount: 1800000, date: '2026-03-18' },
    { id: 7, type: 'income', category: 'Salary', amount: 5000000, date: '2026-04-15' },
    { id: 8, type: 'income', category: 'Freelance', amount: 2200000, date: '2026-04-25' },
    { id: 9, type: 'income', category: 'Salary', amount: 5000000, date: '2026-05-15' },
    { id: 10, type: 'income', category: 'Freelance', amount: 2500000, date: '2026-05-20' },
    { id: 11, type: 'income', category: 'Salary', amount: 5000000, date: '2026-06-15' },
    { id: 12, type: 'income', category: 'Freelance', amount: 3000000, date: '2026-06-28' },
    { id: 13, type: 'expense', category: 'Food', amount: 150000, date: '2026-01-05' },
    { id: 14, type: 'expense', category: 'Food', amount: 200000, date: '2026-01-12' },
    { id: 15, type: 'expense', category: 'Internet', amount: 350000, date: '2026-01-10' },
    { id: 16, type: 'expense', category: 'Subscription', amount: 120000, date: '2026-01-08' },
    { id: 17, type: 'expense', category: 'Gaming/Top-up', amount: 500000, date: '2026-01-18' },
    { id: 18, type: 'expense', category: 'Food', amount: 180000, date: '2026-02-03' },
    { id: 19, type: 'expense', category: 'Food', amount: 250000, date: '2026-02-14' },
    { id: 20, type: 'expense', category: 'Internet', amount: 350000, date: '2026-02-10' },
    { id: 21, type: 'expense', category: 'Subscription', amount: 120000, date: '2026-02-08' },
    { id: 22, type: 'expense', category: 'Gaming/Top-up', amount: 800000, date: '2026-02-20' },
    { id: 23, type: 'expense', category: 'Food', amount: 160000, date: '2026-03-05' },
    { id: 24, type: 'expense', category: 'Food', amount: 220000, date: '2026-03-15' },
    { id: 25, type: 'expense', category: 'Internet', amount: 350000, date: '2026-03-10' },
    { id: 26, type: 'expense', category: 'Subscription', amount: 120000, date: '2026-03-08' },
    { id: 27, type: 'expense', category: 'Gaming/Top-up', amount: 450000, date: '2026-03-22' },
    { id: 28, type: 'expense', category: 'Food', amount: 190000, date: '2026-04-04' },
    { id: 29, type: 'expense', category: 'Food', amount: 240000, date: '2026-04-16' },
    { id: 30, type: 'expense', category: 'Internet', amount: 350000, date: '2026-04-10' },
    { id: 31, type: 'expense', category: 'Subscription', amount: 120000, date: '2026-04-08' },
    { id: 32, type: 'expense', category: 'Gaming/Top-up', amount: 1000000, date: '2026-04-25' },
    { id: 33, type: 'expense', category: 'Food', amount: 170000, date: '2026-05-03' },
    { id: 34, type: 'expense', category: 'Food', amount: 260000, date: '2026-05-17' },
    { id: 35, type: 'expense', category: 'Internet', amount: 350000, date: '2026-05-10' },
    { id: 36, type: 'expense', category: 'Subscription', amount: 120000, date: '2026-05-08' },
    { id: 37, type: 'expense', category: 'Gaming/Top-up', amount: 1200000, date: '2026-05-20' },
    { id: 38, type: 'expense', category: 'Food', amount: 200000, date: '2026-06-05' },
    { id: 39, type: 'expense', category: 'Food', amount: 230000, date: '2026-06-14' },
    { id: 40, type: 'expense', category: 'Internet', amount: 350000, date: '2026-06-10' },
    { id: 41, type: 'expense', category: 'Subscription', amount: 120000, date: '2026-06-08' },
    { id: 42, type: 'expense', category: 'Gaming/Top-up', amount: 900000, date: '2026-06-18' },
]

export const filterByPeriod = (transactions, period) => {
    const now = new Date()
    let startDate = new Date()

    switch (period) {
        case 'Week': startDate.setDate(now.getDate() - 7); break
        case 'Month': startDate.setMonth(now.getMonth() - 1); break
        case '3 Months': startDate.setMonth(now.getMonth() - 3); break
        case '6 Months': startDate.setMonth(now.getMonth() - 6); break
        case 'Year': startDate.setFullYear(now.getFullYear() - 1); break
        default: startDate = new Date(0)
    }

    return transactions.filter(tx => new Date(tx.date) >= startDate)
}