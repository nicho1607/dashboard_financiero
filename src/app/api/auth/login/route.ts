import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createAccessToken } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { detail: "Email y contraseña son obligatorios" },
        { status: 422 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Mensaje genérico para no revelar si el email existe
    const invalid = NextResponse.json(
      { detail: "Email o contraseña incorrectos" },
      { status: 401 }
    );

    if (!user) return invalid;

    const ok = await verifyPassword(password, user.password);
    if (!ok) return invalid;

    const token = await createAccessToken(user.id);
    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: serializeUser(user),
    });
  } catch {
    return NextResponse.json(
      { detail: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
