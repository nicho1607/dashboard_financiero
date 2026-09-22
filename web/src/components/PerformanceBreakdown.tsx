"use client";

import { formatMoney } from "@/lib/formatMoney";
import { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
}

export default function PerformanceBreakdown({ transactions }: Props) {
  const incomes = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const maxIncome = incomes.length > 0 ? Math.max(...incomes.map((t) => t.amount)) : 0;
  const maxExpense = expenses.length > 0 ? Math.max(...expenses.map((t) => t.amount)) : 0;

  const stats = [
    { label: "Ingreso Bruto", value: totalIncome, positive: true },
    { label: "Gasto Total", value: totalExpenses, positive: false },
    { label: "Beneficio Neto", value: netProfit, positive: netProfit >= 0 },
    { label: "Ingreso Promedio", value: avgIncome, positive: true },
    { label: "Gasto Promedio", value: avgExpense, positive: false },
    { label: "Mayor Ingreso", value: maxIncome, positive: true },
    { label: "Mayor Gasto", value: maxExpense, positive: false },
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Desglose de Rendimiento
      </h3>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-border-dark last:border-0"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </span>
            <span
              className={`text-sm font-semibold ${
                stat.positive ? "text-green-500" : "text-red-500"
              }`}
            >
              {stat.positive ? "" : "-"}${formatMoney(Math.abs(stat.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
