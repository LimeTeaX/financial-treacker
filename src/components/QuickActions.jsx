// src/components/QuickActions.jsx
import { motion } from "framer-motion";
import { Plus, ArrowUpRight, ArrowDownLeft, Repeat } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { id: "add", icon: Plus, label: "Add Transaction", color: "primary", primary: true },
    { id: "send", icon: ArrowUpRight, label: "Transfer", color: "blue" },
    { id: "receive", icon: ArrowDownLeft, label: "Receive", color: "purple" },
    { id: "recurring", icon: Repeat, label: "Recurring", color: "orange" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-4 md:p-6 hover:border-primary/30 transition-all duration-300"
    >
      <h3 className="text-lg md:text-xl text-foreground font-semibold mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          if (action.primary) {
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="col-span-2 flex items-center justify-center gap-3 p-3 md:p-4 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary/30"
              >
                <div className="p-1.5 bg-black/10 rounded-lg">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm md:text-base font-semibold">
                  {action.label}
                </span>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center gap-2 p-3 md:p-4 bg-secondary/30 hover:bg-secondary/50 border border-border rounded-xl transition-all duration-300"
            >
              <div className="p-2.5 bg-secondary rounded-lg">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}