import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiActivity } from "react-icons/fi";
import { formatMoney } from "../utils/formatMoney";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const sparkData = {
  balance: [
    { v: 40 }, { v: 45 }, { v: 42 }, { v: 50 }, { v: 48 }, { v: 55 }, { v: 60 }, { v: 58 }, { v: 65 },
  ],
  income: [
    { v: 20 }, { v: 25 }, { v: 30 }, { v: 28 }, { v: 35 }, { v: 40 }, { v: 38 }, { v: 45 }, { v: 50 },
  ],
  expenses: [
    { v: 30 }, { v: 28 }, { v: 35 }, { v: 32 }, { v: 30 }, { v: 25 }, { v: 28 }, { v: 22 }, { v: 20 },
  ],
  count: [
    { v: 5 }, { v: 8 }, { v: 12 }, { v: 10 }, { v: 15 }, { v: 18 }, { v: 20 }, { v: 22 }, { v: 25 },
  ],
};

function DashboardCards({ summary }) {
  const cards = [
    {
      title: "Balance Total",
      value: summary.balance,
      icon: FiDollarSign,
      change: "+23.68%",
      positive: true,
      color: "#10b981",
      spark: sparkData.balance,
    },
    {
      title: "Ingresos Netos",
      value: summary.total_income,
      icon: FiTrendingUp,
      change: "+19.34%",
      positive: true,
      color: "#10b981",
      spark: sparkData.income,
    },
    {
      title: "Gastos Totales",
      value: summary.total_expenses,
      icon: FiTrendingDown,
      change: "-6.21%",
      positive: false,
      color: "#ef4444",
      spark: sparkData.expenses,
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
                  {card.isCount
                    ? card.value
                    : `$${formatMoney(card.value)}`}
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

export default DashboardCards;
