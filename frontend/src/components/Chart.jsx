import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { formatMoney } from "../utils/formatMoney";

const COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];

function Chart({ transactions, darkMode }) {
  const [period, setPeriod] = useState("daily");

  const categoryData = transactions.reduce((acc, t) => {
    if (t.type === "expense") {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
    }
    return acc;
  }, []);

  // --- Balance data grouped by period ---
  const getBalanceData = () => {
    if (transactions.length === 0) return [];

    if (period === "daily") {
      const dailyData = transactions.reduce((acc, t) => {
        const date = t.date;
        const existing = acc.find((item) => item.key === date);
        if (existing) {
          if (t.type === "income") existing.income += t.amount;
          else existing.expense += t.amount;
        } else {
          acc.push({
            key: date,
            income: t.type === "income" ? t.amount : 0,
            expense: t.type === "expense" ? t.amount : 0,
          });
        }
        return acc;
      }, []);
      dailyData.sort((a, b) => a.key.localeCompare(b.key));

      let cum = 0;
      return dailyData.map((d) => {
        cum += d.income - d.expense;
        const parts = d.key.split("-");
        return { label: `${parts[2]}/${parts[1]}`, balance: cum };
      });
    }

    if (period === "weekly") {
      // Agrupar por semana ISO
      const weeklyMap = {};
      transactions.forEach((t) => {
        const date = new Date(t.date);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startOfYear) / 86400000);
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        const key = `${date.getFullYear()}-S${String(week).padStart(2, "0")}`;
        if (!weeklyMap[key]) weeklyMap[key] = { income: 0, expense: 0 };
        if (t.type === "income") weeklyMap[key].income += t.amount;
        else weeklyMap[key].expense += t.amount;
      });

      const sorted = Object.entries(weeklyMap).sort((a, b) => a[0].localeCompare(b[0]));
      let cum = 0;
      return sorted.map(([key, val]) => {
        cum += val.income - val.expense;
        return { label: key.split("-")[1], balance: cum };
      });
    }

    if (period === "monthly") {
      const monthlyMap = {};
      transactions.forEach((t) => {
        const month = t.date.substring(0, 7);
        if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
        if (t.type === "income") monthlyMap[month].income += t.amount;
        else monthlyMap[month].expense += t.amount;
      });

      const sorted = Object.entries(monthlyMap).sort((a, b) => a[0].localeCompare(b[0]));
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      let cum = 0;
      return sorted.map(([key, val]) => {
        cum += val.income - val.expense;
        const [, m] = key.split("-");
        return { label: monthNames[parseInt(m) - 1], balance: cum };
      });
    }

    return [];
  };

  const balanceData = getBalanceData();

  // Monthly bar chart data
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7);
    const existing = acc.find((item) => item.month === month);
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
  monthlyData.sort((a, b) => a.month.localeCompare(b.month));

  const formatMonth = (month) => {
    const [, m] = month.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return months[parseInt(m) - 1];
  };

  const textColor = darkMode ? "#9ca3af" : "#6b7280";
  const gridColor = darkMode ? "#1f2937" : "#e5e7eb";
  const totalExpenses = categoryData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-4">
      {/* Area Chart - Balance Growth */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Crecimiento del Balance
          </h3>
          <div className="flex gap-1 bg-gray-100 dark:bg-surface-dark rounded-lg p-1">
            {[
              { label: "Diario", value: "daily" },
              { label: "Semanal", value: "weekly" },
              { label: "Mensual", value: "monthly" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === opt.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {balanceData.length === 0 ? (
          <p className="text-gray-400 text-center py-16">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={balanceData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  color: darkMode ? "#f3f4f6" : "#111827",
                }}
                formatter={(value) => [`$${formatMoney(value)}`, "Balance"]}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#6366f1"
                fill="url(#balanceGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row: Donut + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución de Gastos
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-gray-400 text-center py-16">Sin gastos aún</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px", color: darkMode ? "#f3f4f6" : "#111827" }} formatter={(value) => `$${formatMoney(value)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    ${formatMoney(totalExpenses)}
                  </span>
                  Total Gastos
                </p>
              </div>
              <div className="w-1/2 space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{cat.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {((cat.value / totalExpenses) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rendimiento Mensual
          </h3>
          {monthlyData.length === 0 ? (
            <p className="text-gray-400 text-center py-16">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: gridColor }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px", color: darkMode ? "#f3f4f6" : "#111827" }} formatter={(value) => `$${formatMoney(value)}`} />
                <Legend wrapperStyle={{ fontSize: "12px", color: textColor }} />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chart;
