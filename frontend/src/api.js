import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Adjuntar el token JWT a cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es inválido (401), cerrar sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Recargar para volver al login
      if (!window.location.pathname.includes("login")) {
        window.dispatchEvent(new Event("unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
