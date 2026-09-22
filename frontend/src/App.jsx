import { useState, useEffect } from "react";
import api from "./api";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import DashboardCards from "./components/DashboardCards";
import Chart from "./components/Chart";
import TransactionList from "./components/TransactionList";
import PerformanceBreakdown from "./components/PerformanceBreakdown";
import TransactionsPage from "./pages/TransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import CalendarPage from "./pages/CalendarPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { FiLogOut } from "react-icons/fi";

function App() {
  const { user, loading, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
    transaction_count: 0,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [transRes, summaryRes] = await Promise.all([
        api.get("/transactions/"),
        api.get("/transactions/summary"),
      ]);
      setTransactions(transRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      await api.post("/transactions/", transaction);
      fetchData();
    } catch (error) {
      console.error("Error al crear transacción:", error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
    }
  };

  // Pantalla de carga inicial mientras se verifica el token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-dark">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar login
  if (!user) {
    return <LoginPage />;
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
                <TransactionList
                  transactions={transactions}
                  onDelete={handleDeleteTransaction}
                />
              </div>
            </div>
          </>
        );
      case "transactions":
        return (
          <TransactionsPage
            transactions={transactions}
            onAdd={handleAddTransaction}
            onDelete={handleDeleteTransaction}
          />
        );
      case "reports":
        return <ReportsPage transactions={transactions} darkMode={darkMode} />;
      case "calendar":
        return <CalendarPage transactions={transactions} />;
      case "alerts":
        return <AlertsPage transactions={transactions} summary={summary} />;
      case "settings":
        return <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return null;
    }
  };

  const pageTitle = {
    dashboard: "Dashboard",
    transactions: "Transacciones",
    reports: "Reportes",
    calendar: "Calendario",
    alerts: "Alertas",
    settings: "Configuración",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark transition-colors duration-300">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-border-dark px-8 py-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {pageTitle[currentPage]}
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

        {/* Content */}
        <main className="p-8 space-y-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
