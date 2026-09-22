"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatMoney } from "@/lib/formatMoney";
import { Transaction } from "@/lib/types";

const COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface Props {
  transactions: Transaction[];
  darkMode: boolean;
}

function groupByCategory(list: Transaction[]) {
  return list
    .reduce<{ name: string; value: number }[]>((acc, t) => {
      const existing = acc.find((x) => x.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);
}

export default function ReportsView({ transactions, darkMode }: Props) {
  const incomes = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const expenseByCategory = groupByCategory(expenses);
  const incomeByCategory = groupByCategory(incomes);

  const monthly = transactions.reduce<
    { month: string; ingresos: number; gastos: number }[]
  >((acc, t) => {
    const month = t.date.substring(0, 7);
    const existing = acc.find((x) => x.month === month);
    if (existing) {
      if (t.type === "income") existing.ingresos += t.amount;
      else existing.gastos += t.amount;
    } else {
      acc.push({
        month,
        ingresos: t.type === "income" ? t.amount : 0,
        gastos: t.type === "expense" ? t.amount : 0,
      });
    }
    return acc;
  }, []);
  monthly.sort((a, b) => a.month.localeCompare(b.month));

  const textColor = darkMode ? "#9ca3af" : "#6b7280";
  const gridColor = darkMode ? "#1f2937" : "#e5e7eb";
  const tooltipStyle = {
    backgroundColor: darkMode ? "#1f2937" : "#fff",
    border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
    borderRadius: "8px",
    color: darkMode ? "#f3f4f6" : "#111827",
  };
  const formatMonth = (m: string) => MONTHS[parseInt(m.split("-")[1]) - 1];

  const cards = [
    { label: "Ingresos Totales", value: `$${formatMoney(totalIncome)}`, color: "text-green-500" },
    { label: "Gastos Totales", value: `$${formatMoney(totalExpenses)}`, color: "text-red-500" },
    { label: "Ahorro", value: `$${formatMoney(savings)}`, color: savings >= 0 ? "text-green-500" : "text-red-500" },
    { label: "Tasa de Ahorro", value: `${savingsRate.toFixed(1)}%`, color: "text-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Análisis detallado de tus finanzas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: "Gastos por Categoría", data: expenseByCategory },
          { title: "Ingresos por Categoría", data: incomeByCategory },
        ].map((section) => (
          <div key={section.title} className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h3>
            {section.data.length === 0 ? (
              <p className="text-gray-400 text-center py-12">Sin datos</p>
            ) : (
              <div className="flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={section.data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {section.data.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${formatMoney(v)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {section.data.map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{cat.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">${formatMoney(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comparativo Mensual</h3>
        {monthly.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: gridColor }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${formatMoney(v)}`} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
