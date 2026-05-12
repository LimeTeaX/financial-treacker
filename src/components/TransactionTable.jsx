// src/components/TransactionTable.jsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingCart, Utensils, Car, Home, Smartphone, TrendingUp } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const categoryIcons = {
  Food: Utensils,
  Transport: Car,
  Utilities: Home,
  Shopping: ShoppingCart,
  Internet: Smartphone,
  Gaming: Smartphone,
  Salary: TrendingUp,
  Subscription: ShoppingCart,
  Education: Home,
  Entertainment: Utensils,
};

export default function TransactionTable() {
  const { transactions, settings } = useAppContext();

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  const symbol = settings?.currency === "USD" ? "$" : "Rp";

  if (recentTransactions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300"
    >
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg md:text-xl text-foreground font-semibold">
              Recent Transactions
            </h3>
            <p className="text-sm text-muted-foreground">
              Last 5 transactions
            </p>
          </div>
          <button className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 md:px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Transaction
              </th>
              <th className="text-left px-4 md:px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="text-right px-4 md:px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx, index) => {
              const Icon = categoryIcons[tx.category] || ShoppingCart;
              const isExpense = tx.type === "expense";
              const formattedDate = new Date(tx.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });

              return (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 md:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          isExpense ? "bg-secondary/50" : "bg-primary/10"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isExpense ? "text-muted-foreground" : "text-primary"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {tx.merchant}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {tx.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-sm text-muted-foreground">
                    {formattedDate}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-right">
                    <p
                      className={`text-sm font-mono-money font-semibold ${
                        isExpense ? "text-rose-400" : "text-primary"
                      }`}
                    >
                      {isExpense ? "-" : "+"}
                      {symbol} {Math.abs(tx.amount).toLocaleString()}
                    </p>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}