import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/transactions/summary — resumen del dashboard del usuario
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  const [incomeAgg, expenseAgg, count] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "income" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "expense" },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { userId: user.id } }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;

  return NextResponse.json({
    total_income: totalIncome,
    total_expenses: totalExpenses,
    balance: totalIncome - totalExpenses,
    transaction_count: count,
  });
}
