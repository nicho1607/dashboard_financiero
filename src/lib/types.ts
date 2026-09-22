// Tipos compartidos del frontend

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Summary {
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
