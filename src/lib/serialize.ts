// Helpers para serializar datos de Prisma a JSON limpio para el frontend

type UserLike = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
};

type TransactionLike = {
  id: number;
  description: string;
  amount: number;
  category: string;
  type: string;
  date: Date;
  createdAt: Date;
};

/** Devuelve el usuario sin la contraseña, con fechas en ISO. */
export function serializeUser(user: UserLike) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt.toISOString(),
  };
}

/** Formatea una transacción para el frontend (fecha YYYY-MM-DD). */
export function serializeTransaction(t: TransactionLike) {
  return {
    id: t.id,
    description: t.description,
    amount: t.amount,
    category: t.category,
    type: t.type,
    date: t.date.toISOString().split("T")[0],
    created_at: t.createdAt.toISOString(),
  };
}
