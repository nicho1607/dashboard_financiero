import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createAccessToken } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";
import { isValidEmail, validatePassword, validateName } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body ?? {};

    // Validaciones
    const nameError = validateName(name);
    if (nameError) return NextResponse.json({ detail: nameError }, { status: 422 });

    if (!isValidEmail(email)) {
      return NextResponse.json({ detail: "El email no es válido" }, { status: 422 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ detail: passwordError }, { status: 422 });
    }

    // Verificar que el email no exista
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { detail: "El email ya está registrado" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name: name.trim(), email, password: hashed },
    });

    const token = await createAccessToken(user.id);
    return NextResponse.json(
      { access_token: token, token_type: "bearer", user: serializeUser(user) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { detail: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
