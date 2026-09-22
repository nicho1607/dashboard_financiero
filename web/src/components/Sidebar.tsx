"use client";

import {
  FiGrid,
  FiPieChart,
  FiFileText,
  FiSettings,
  FiDollarSign,
  FiCalendar,
  FiBell,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { icon: FiGrid, label: "Dashboard", id: "dashboard" },
  { icon: FiFileText, label: "Transacciones", id: "transactions" },
  { icon: FiPieChart, label: "Reportes", id: "reports" },
  { icon: FiCalendar, label: "Calendario", id: "calendar" },
  { icon: FiBell, label: "Alertas", id: "alerts" },
  { icon: FiSettings, label: "Configuración", id: "settings" },
];

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: Props) {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-sidebar-dark border-r border-gray-200 dark:border-border-dark flex flex-col z-20 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FiDollarSign className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              FINANZAS
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard Pro</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-hover-dark hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Usuario actual */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-border-dark">
          <button
            onClick={() => onNavigate("settings")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-hover-dark transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
