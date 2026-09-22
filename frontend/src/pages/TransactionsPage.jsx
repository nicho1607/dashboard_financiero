import { useState } from "react";
import { FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

function TransactionsPage({ transactions, onAdd, onDelete }) {
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
      {/* Header */}
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

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
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

      {/* Form (collapsible) */}
      {showForm && (
        <TransactionForm
          onSubmit={(data) => {
            onAdd(data);
            setShowForm(false);
          }}
        />
      )}

      {/* List */}
      <TransactionList transactions={filtered} onDelete={onDelete} />
    </div>
  );
}

export default TransactionsPage;
