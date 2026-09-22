import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Credenciales inválidas" },
      { status: 401 }
    );
  }
  return NextResponse.json(serializeUser(user));
}
