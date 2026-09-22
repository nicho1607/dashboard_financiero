"use client";

import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";

const CATEGORIES: Record<string, string[]> = {
  income: ["Salario", "Freelance", "Inversiones", "Ventas", "Otros"],
  expense: ["Comida", "Transporte", "Vivienda", "Entretenimiento", "Salud", "Educación", "Servicios", "Otros"],
};

/** Convierte un string con formato latino (143.955,38) a número float. */
function parseLatinNumber(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned);
}

export interface NewTransaction {
  description: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

interface Props {
  onSubmit: (data: NewTransaction) => void;
}

export default function TransactionForm({ onSubmit }: Props) {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[\d.,]*$/.test(value)) {
      setForm((prev) => ({ ...prev, amount: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category) return;

    const numericAmount = parseLatinNumber(form.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Ingrese un monto válido (ej: 143.955,38)");
      return;
    }

    onSubmit({
      description: form.description,
      amount: numericAmount,
      category: form.category,
      type: form.type,
      date: form.date,
    });

    setForm({
      description: "",
      amount: "",
      category: "",
      type: form.type,
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 transition-colors duration-300">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Nueva Transacción
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, type: "expense", category: "" }))}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.type === "expense"
                ? "bg-red-500/20 text-red-500 border border-red-500/30"
                : "bg-gray-100 dark:bg-hover-dark text-gray-500 dark:text-gray-400 border border-transparent"
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, type: "income", category: "" }))}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.type === "income"
                ? "bg-green-500/20 text-green-500 border border-green-500/30"
                : "bg-gray-100 dark:bg-hover-dark text-gray-500 dark:text-gray-400 border border-transparent"
            }`}
          >
            Ingreso
          </button>
        </div>

        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-colors"
          required
        />

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">$</span>
          <input
            type="text"
            name="amount"
            value={form.amount}
            onChange={handleAmountChange}
            placeholder="143.955,38"
            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-colors"
            required
          />
        </div>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-colors"
          required
        >
          <option value="">Seleccionar categoría</option>
          {CATEGORIES[form.type].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-colors"
          required
        />

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FiPlusCircle size={18} />
          Agregar Transacción
        </button>
      </form>
    </div>
  );
}
