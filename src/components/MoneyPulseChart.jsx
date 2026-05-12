// src/components/MoneyPulseChart.jsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppContext } from "../context/AppContext";

export default function MoneyPulseChart() {
  const { transactions, settings } = useAppContext();

  // Group transaksi per bulan
  const chartData = useMemo(() => {
    const months = {};
    const now = new Date();
    const currentYear = now.getFullYear();

    // Inisialisasi 12 bulan terakhir
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      months[monthName] = { income: 0, expense: 0 };
    }

    // Akumulasi transaksi
    transactions.forEach((tx) => {
      if (!tx.date) return;
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() !== currentYear) return;
      const monthName = txDate.toLocaleDateString("en-US", { month: "short" });
      if (months[monthName]) {
        if (tx.type === "income") {
          months[monthName].income += Math.abs(tx.amount);
        } else {
          months[monthName].expense += Math.abs(tx.amount);
        }
      }
    });

    return Object.entries(months).map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
    }));
  }, [transactions]);

  const symbol = settings?.currency === "USD" ? "$" : "Rp";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-4 md:p-6 hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg md:text-xl text-foreground font-semibold">
            Money Pulse
          </h3>
          <p className="text-sm text-muted-foreground">
            Monthly cash flow
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="text-xs text-muted-foreground">Expense</span>
          </div>
        </div>
      </div>

      <div className="h-72 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${symbol}${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
              formatter={(value) => [`${symbol} ${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#fb7185"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}