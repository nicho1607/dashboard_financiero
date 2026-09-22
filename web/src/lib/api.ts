// Cliente API para el frontend. Usa fetch y adjunta el token JWT.
// Como el backend está en el mismo dominio (Next.js API Routes), la base es /api.

const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Sesión expirada o inválida
  if (res.status === 401 && auth) {
    clearToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("unauthorized"));
    }
  }

  if (!res.ok) {
    let detail = "Ocurrió un error";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new Error(detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}
