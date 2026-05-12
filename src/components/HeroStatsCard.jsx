// src/components/HeroStatsCard.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// Mock data buat sparkline (nanti bisa diganti data real dari transaksi per hari)
const mockSparklineData = [
  { value: 8500000 },
  { value: 9200000 },
  { value: 8800000 },
  { value: 10500000 },
  { value: 11200000 },
  { value: 10800000 },
  { value: 12847520 },
];

export default function HeroStatsCard() {
  const { transactions, settings } = useAppContext();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Hitung balance real dari transaksi (income - expense)
  const totalBalance = transactions.reduce((acc, tx) => {
    return acc + (tx.type === "income" ? tx.amount : -Math.abs(tx.amount));
  }, 0);

  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const formattedBalance = Math.abs(totalBalance).toLocaleString(
    settings?.currency === "USD" ? "en-US" : "id-ID"
  );

  // Hitung persentase perubahan bulan ini (mock, bisa dikembangkan)
  const monthlyChange = 1240000;
  const changePercent = ((monthlyChange / (totalBalance - monthlyChange)) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-card to-card/80 border border-border rounded-3xl p-6 md:p-8 overflow-hidden group hover:border-primary/30 transition-all duration-300"
    >
      {/* Background Sparkline (dekorasi) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockSparklineData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Glow effect di pojok */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-500" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-sm md:text-base font-medium text-muted-foreground">
                Total Balance
              </h2>
              <button
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="p-1.5 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                {isBalanceVisible ? (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground font-mono-money font-bold tracking-tight">
              {isBalanceVisible
                ? `${symbol} ${formattedBalance}`
                : `${symbol} •••••••`}
            </h1>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs md:text-sm font-semibold text-primary">
                  +{symbol} {monthlyChange.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                (+{changePercent}% from last month)
              </span>
            </div>
          </div>

          {/* Mini sparkline chart (desktop only) */}
          <div className="hidden lg:block w-48 h-24 bg-secondary/30 backdrop-blur-sm border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Last 7 days</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6 pt-4 border-t border-border">
          <div className="bg-secondary/30 backdrop-blur-sm border border-border rounded-xl p-3 md:p-4">
            <p className="text-xs text-muted-foreground mb-1">Connected Accounts</p>
            <p className="text-xl md:text-2xl text-foreground font-mono-money font-bold">
              3
            </p>
          </div>
          <div className="bg-secondary/30 backdrop-blur-sm border border-border rounded-xl p-3 md:p-4">
            <p className="text-xs text-muted-foreground mb-1">Transactions (This Month)</p>
            <p className="text-xl md:text-2xl text-foreground font-mono-money font-bold">
              {transactions.length}
            </p>
          </div>
          <div className="bg-secondary/30 backdrop-blur-sm border border-border rounded-xl p-3 md:p-4">
            <p className="text-xs text-muted-foreground mb-1">Savings Goal</p>
            <p className="text-xl md:text-2xl text-primary font-mono-money font-bold">
              67%
            </p>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-[67%] bg-primary rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}