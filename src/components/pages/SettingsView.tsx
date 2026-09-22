"use client";

import { FiUser, FiDollarSign, FiBell, FiGlobe, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

interface Props {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export default function SettingsView({ darkMode, setDarkMode }: Props) {
  const { user, logout } = useAuth();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personaliza tu experiencia</p>
      </div>

      {/* Perfil */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiUser className="text-indigo-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Perfil</h3>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            {memberSince && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Miembro desde {memberSince}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          <FiLogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      {/* Apariencia */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiGlobe className="text-indigo-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apariencia</h3>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Modo Oscuro</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cambia entre tema claro y oscuro</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-indigo-600" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </div>

      {/* Moneda */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiDollarSign className="text-indigo-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Moneda</h3>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Moneda principal</label>
          <select className="w-full max-w-xs px-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <option>COP - Peso Colombiano</option>
            <option>USD - Dólar Estadounidense</option>
            <option>EUR - Euro</option>
            <option>MXN - Peso Mexicano</option>
          </select>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiBell className="text-indigo-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Alertas de gastos excesivos", desc: "Notificar cuando un gasto sea muy alto" },
            { label: "Resumen semanal", desc: "Recibir un resumen cada semana" },
            { label: "Balance negativo", desc: "Alertar cuando el balance sea negativo" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <button className="relative w-12 h-6 bg-indigo-600 rounded-full">
                <span className="absolute top-0.5 translate-x-6 w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
