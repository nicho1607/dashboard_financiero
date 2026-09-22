"use client";

import { useState } from "react";
import { FiDollarSign, FiMail, FiLock, FiUser } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function LoginView() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-dark p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <FiDollarSign className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FINANZAS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isRegister ? "Crea tu cuenta" : "Inicia sesión en tu cuenta"}
          </p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-border-dark p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nombre
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={isRegister ? 8 : undefined}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                />
              </div>
              {isRegister && (
                <p className="text-xs text-gray-400 mt-1">
                  Mínimo 8 caracteres, con al menos una letra y un número.
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Procesando..." : isRegister ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
              <button
                onClick={toggleMode}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                {isRegister ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
