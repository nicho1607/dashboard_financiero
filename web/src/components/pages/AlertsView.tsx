"use client";

import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { formatMoney } from "@/lib/formatMoney";
import { Transaction, Summary } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  summary: Summary;
}

interface Alert {
  type: "danger" | "success" | "warning" | "info";
  icon: typeof FiInfo;
  title: string;
  message: string;
  time: string;
}

export default function AlertsView({ transactions, summary }: Props) {
  const alerts: Alert[] = [];

  if (summary.total_expenses > summary.total_income && summary.transaction_count > 0) {
    alerts.push({
      type: "danger",
      icon: FiAlertTriangle,
      title: "Gastos superan ingresos",
      message: `Tus gastos ($${formatMoney(summary.total_expenses)}) superan tus ingresos ($${formatMoney(summary.total_income)}). Revisa tu presupuesto.`,
      time: "Ahora",
    });
  }

  if (summary.balance > 0) {
    alerts.push({
      type: "success",
      icon: FiCheckCircle,
      title: "Balance positivo",
      message: `Tu balance es de $${formatMoney(summary.balance)}. ¡Vas por buen camino!`,
      time: "Ahora",
    });
  }

  const expenses = transactions.filter((t) => t.type === "expense");
  if (expenses.length > 0) {
    const avgExpense = summary.total_expenses / expenses.length;
    alerts.push({
      type: "info",
      icon: FiInfo,
      title: "Gasto promedio",
      message: `Tu gasto promedio por transacción es de $${formatMoney(avgExpense)}.`,
      time: "Hoy",
    });

    const byCategory: Record<string, number> = {};
    expenses.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    alerts.push({
      type: "warning",
      icon: FiAlertTriangle,
      title: `Mayor gasto en ${top[0]}`,
      message: `Has gastado $${formatMoney(top[1])} en ${top[0]}. Es tu categoría de mayor gasto.`,
      time: "Esta semana",
    });
  }

  if (summary.transaction_count === 0) {
    alerts.push({
      type: "info",
      icon: FiInfo,
      title: "Sin transacciones",
      message: "Aún no has registrado transacciones. Agrega tu primera para empezar a ver reportes.",
      time: "Ahora",
    });
  }

  const typeStyles: Record<string, string> = {
    danger: "border-red-500/30 bg-red-500/5",
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
  };
  const iconStyles: Record<string, string> = {
    danger: "text-red-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alertas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Notificaciones y alertas de tus finanzas
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
          <FiBell className="text-indigo-600 dark:text-indigo-400" size={14} />
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {alerts.length} alertas
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-4 p-4 rounded-xl border ${typeStyles[alert.type]} transition-colors`}
            >
              <div className="mt-0.5">
                <Icon className={iconStyles[alert.type]} size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
