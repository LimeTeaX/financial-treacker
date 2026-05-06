// src/context/AppContext.jsx
import { createContext, useContext, useState } from "react";
import { TRANSACTIONS as INITIAL_DATA } from "../data/transactions";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(INITIAL_DATA);

  const addTransaction = (newTx) => {
    const tx = {
      id: Date.now(),
      ...newTx,
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedData } : tx)),
    );
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
}
