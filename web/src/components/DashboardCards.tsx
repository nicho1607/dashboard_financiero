"use client";

import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiActivity } from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { formatMoney } from "@/lib/formatMoney";
import { Summary } from "@/lib/types";

const sparkData = {
  balance: [40, 45, 42, 50, 48, 55, 60, 58, 65].map((v) => ({ v })),
  income: [20, 25, 30, 28, 35, 40, 38, 45, 50].map((v) => ({ v })),
  expenses: [30, 28, 35, 32, 30, 25, 28, 22, 20].map((v) => ({ v })),
  count: [5, 8, 12, 10, 15, 18, 20, 22, 25].map((v) => ({ v })),
};

interface Props {
  summary: Summary;
}

export default function DashboardCards({ summary }: Props) {
  const cards = [
    {
      title: "Balance Total",
      value: summary.balance,
      icon: FiDollarSign,
      change: "+23.68%",
      positive: true,
      color: "#10b981",
      spark: sparkData.balance,
      isCount: false,
    },
    {
      title: "Ingresos Netos",
      value: summary.total_income,
      icon: FiTrendingUp,
      change: "+19.34%",
      positive: true,
      color: "#10b981",
      spark: sparkData.income,
      isCount: false,
    },
    {
      title: "Gastos Totales",
      value: summary.total_expenses,
      icon: FiTrendingDown,
      change: "-6.21%",
      positive: false,
      color: "#ef4444",
      spark: sparkData.expenses,
      isCount: false,
    },
    {
      title: "Total Transacciones",
      value: summary.transaction_count,
      icon: FiActivity,
      change: "+8.57%",
      positive: true,
      color: "#6366f1",
      spark: sparkData.count,
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-5 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {card.title}
              </span>
              <Icon className="text-gray-400 dark:text-gray-500" size={16} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.isCount ? card.value : `$${formatMoney(card.value)}`}
                </p>
                <span
                  className={`text-xs font-medium ${
                    card.positive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <div className="w-20 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.spark}>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={card.color}
                      fill={card.color}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
