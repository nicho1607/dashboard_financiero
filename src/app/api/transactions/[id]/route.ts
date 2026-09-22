import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serializeTransaction } from "@/lib/serialize";
import { VALID_TYPES, TransactionType } from "@/lib/validation";

type Params = { params: { id: string } };

// GET /api/transactions/[id] — obtener una transacción del usuario
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
  });

  if (!transaction) {
    return NextResponse.json(
      { detail: "Transacción no encontrada" },
      { status: 404 }
    );
  }
  return NextResponse.json(serializeTransaction(transaction));
}

// PUT /api/transactions/[id] — actualizar una transacción del usuario
export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json(
      { detail: "Transacción no encontrada" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || body.description.trim().length === 0) {
        return NextResponse.json({ detail: "Descripción inválida" }, { status: 422 });
      }
      data.description = body.description.trim();
    }
    if (body.amount !== undefined) {
      if (typeof body.amount !== "number" || body.amount <= 0) {
        return NextResponse.json({ detail: "El monto debe ser mayor a 0" }, { status: 422 });
      }
      data.amount = body.amount;
    }
    if (body.category !== undefined) {
      if (typeof body.category !== "string" || body.category.trim().length === 0) {
        return NextResponse.json({ detail: "Categoría inválida" }, { status: 422 });
      }
      data.category = body.category.trim();
    }
    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type as TransactionType)) {
        return NextResponse.json({ detail: "Tipo inválido" }, { status: 422 });
      }
      data.type = body.type;
    }
    if (body.date !== undefined) {
      if (Number.isNaN(Date.parse(body.date))) {
        return NextResponse.json({ detail: "Fecha inválida" }, { status: 422 });
      }
      data.date = new Date(body.date);
    }

    const updated = await prisma.transaction.update({ where: { id }, data });
    return NextResponse.json(serializeTransaction(updated));
  } catch {
    return NextResponse.json(
      { detail: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] — eliminar una transacción del usuario
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json(
      { detail: "Transacción no encontrada" },
      { status: 404 }
    );
  }

  await prisma.transaction.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
