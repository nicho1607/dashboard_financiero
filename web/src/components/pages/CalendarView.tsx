"use client";

import { useState, ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatMoney } from "@/lib/formatMoney";
import { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
}

export default function CalendarView({ transactions }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const byDay: Record<number, Transaction[]> = {};
  transactions.forEach((t) => {
    if (t.date.startsWith(monthStr)) {
      const day = parseInt(t.date.split("-")[2]);
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(t);
    }
  });

  const cells: ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-24" />);
  }
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTrans = byDay[day] || [];
    let income = 0;
    let expense = 0;
    dayTrans.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    const isToday =
      day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    cells.push(
      <div
        key={day}
        className={`h-24 p-2 border border-gray-100 dark:border-border-dark rounded-lg ${
          isToday
            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-500"
            : "hover:bg-gray-50 dark:hover:bg-hover-dark"
        } transition-colors`}
      >
        <span
          className={`text-xs font-medium ${
            isToday ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {day}
        </span>
        {dayTrans.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {income > 0 && (
              <p className="text-[10px] text-green-500 font-medium truncate">
                +${formatMoney(income)}
              </p>
            )}
            {expense > 0 && (
              <p className="text-[10px] text-red-500 font-medium truncate">
                -${formatMoney(expense)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendario</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Visualiza tus transacciones por día
        </p>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-hover-dark rounded-lg transition-colors">
            <FiChevronLeft className="text-gray-600 dark:text-gray-400" size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-hover-dark rounded-lg transition-colors">
            <FiChevronRight className="text-gray-600 dark:text-gray-400" size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((name) => (
            <div key={name} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    </div>
  );
}
