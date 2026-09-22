// Validaciones reutilizables para las API Routes

export const VALID_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof VALID_TYPES)[number];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

/** Contraseña fuerte: mínimo 8 caracteres, al menos una letra y un número. */
export function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }
  if (!/[A-Za-z]/.test(password)) {
    return "La contraseña debe contener al menos una letra";
  }
  if (!/\d/.test(password)) {
    return "La contraseña debe contener al menos un número";
  }
  return null;
}

export function validateName(name: string): string | null {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "El nombre debe tener al menos 2 caracteres";
  }
  return null;
}

/** Valida los campos de una transacción. Devuelve mensaje de error o null. */
export function validateTransaction(data: {
  description?: unknown;
  amount?: unknown;
  category?: unknown;
  type?: unknown;
  date?: unknown;
}): string | null {
  if (typeof data.description !== "string" || data.description.trim().length === 0) {
    return "La descripción es obligatoria";
  }
  if (typeof data.amount !== "number" || Number.isNaN(data.amount) || data.amount <= 0) {
    return "El monto debe ser un número mayor a 0";
  }
  if (typeof data.category !== "string" || data.category.trim().length === 0) {
    return "La categoría es obligatoria";
  }
  if (typeof data.type !== "string" || !VALID_TYPES.includes(data.type as TransactionType)) {
    return "El tipo debe ser 'income' o 'expense'";
  }
  if (typeof data.date !== "string" || Number.isNaN(Date.parse(data.date))) {
    return "La fecha no es válida";
  }
  return null;
}
