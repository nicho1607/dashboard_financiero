"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Transaction, Summary } from "@/lib/types";
import { NewTransaction } from "./TransactionForm";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import DashboardCards from "./DashboardCards";
import Chart from "./Chart";
import TransactionList from "./TransactionList";
import PerformanceBreakdown from "./PerformanceBreakdown";
import LoginView from "./pages/LoginView";
import TransactionsView from "./pages/TransactionsView";
import ReportsView from "./pages/ReportsView";
import CalendarView from "./pages/CalendarView";
import AlertsView from "./pages/AlertsView";
import SettingsView from "./pages/SettingsView";
import { FiLogOut } from "react-icons/fi";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  transactions: "Transacciones",
  reports: "Reportes",
  calendar: "Calendario",
  alerts: "Alertas",
  settings: "Configuración",
};

const EMPTY_SUMMARY: Summary = {
  total_income: 0,
  total_expenses: 0,
  balance: 0,
  transaction_count: 0,
};

export default function DashboardApp() {
  const { user, loading, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);

  // Aplicar tema
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const fetchData = useCallback(async () => {
    try {
      const [trans, sum] = await Promise.all([
        apiFetch<Transaction[]>("/transactions"),
        apiFetch<Summary>("/transactions/summary"),
      ]);
      setTransactions(trans);
      setSummary(sum);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const handleAdd = async (data: NewTransaction) => {
    try {
      await apiFetch("/transactions", { method: "POST", body: data });
      fetchData();
    } catch (error) {
      console.error("Error al crear transacción:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
    }
  };

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-dark">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Sin sesión -> login
  if (!user) {
    return <LoginView />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
            <DashboardCards summary={summary} />
            <Chart transactions={transactions} darkMode={darkMode} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PerformanceBreakdown transactions={transactions} />
              <div className="lg:col-span-2">
                <TransactionList transactions={transactions} onDelete={handleDelete} />
              </div>
            </div>
          </>
        );
      case "transactions":
        return (
          <TransactionsView transactions={transactions} onAdd={handleAdd} onDelete={handleDelete} />
        );
      case "reports":
        return <ReportsView transactions={transactions} darkMode={darkMode} />;
      case "calendar":
        return <CalendarView transactions={transactions} />;
      case "alerts":
        return <AlertsView transactions={transactions} summary={summary} />;
      case "settings":
        return <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark transition-colors duration-300">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="ml-64">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-border-dark px-8 py-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {PAGE_TITLES[currentPage]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hola, {user.name}. Aquí está tu resumen financiero.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-hover-dark transition-colors"
              >
                <FiLogOut size={16} />
                Salir
              </button>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-6">{renderPage()}</main>
      </div>
    </div>
  );
}
