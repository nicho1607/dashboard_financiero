import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serializeTransaction } from "@/lib/serialize";
import { validateTransaction } from "@/lib/validation";

// GET /api/transactions — lista las transacciones del usuario (con filtros opcionales)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { userId: user.id };
  if (type) where.type = type;
  if (category) where.category = category;

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions.map(serializeTransaction));
}

// POST /api/transactions — crea una transacción para el usuario
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const error = validateTransaction(body);
    if (error) {
      return NextResponse.json({ detail: error }, { status: 422 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        description: String(body.description).trim(),
        amount: Number(body.amount),
        category: String(body.category).trim(),
        type: body.type,
        date: new Date(body.date),
      },
    });

    return NextResponse.json(serializeTransaction(transaction), { status: 201 });
  } catch {
    return NextResponse.json(
      { detail: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
