"use client";

import { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import TransactionForm, { NewTransaction } from "../TransactionForm";
import TransactionList from "../TransactionList";
import { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  onAdd: (data: NewTransaction) => void;
  onDelete: (id: number) => void;
}

export default function TransactionsView({ transactions, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transacciones
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus ingresos y gastos
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FiPlus size={16} />
          Nueva Transacción
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar transacciones..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {[
            { label: "Todos", value: "all" },
            { label: "Ingresos", value: "income" },
            { label: "Gastos", value: "expense" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                filterType === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-hover-dark"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <TransactionForm
          onSubmit={(data) => {
            onAdd(data);
            setShowForm(false);
          }}
        />
      )}

      <TransactionList transactions={filtered} onDelete={onDelete} />
    </div>
  );
}
