import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const ALGORITHM = "HS256";
const TOKEN_EXPIRATION = "24h";

/** Obtiene la clave secreta como Uint8Array (requerido por jose). */
function getSecretKey(): Uint8Array {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SECRET_KEY no está configurada. Es obligatoria en producción.");
    }
    return new TextEncoder().encode("clave-solo-para-desarrollo-no-usar-en-produccion");
  }
  return new TextEncoder().encode(secret);
}

/** Genera el hash de una contraseña con bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Verifica una contraseña contra su hash. */
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

/** Crea un JWT firmado con el id del usuario. */
export async function createAccessToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(getSecretKey());
}

/** Verifica un token y devuelve el userId, o null si es inválido. */
export async function verifyAccessToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [ALGORITHM],
    });
    const sub = payload.sub;
    if (!sub) return null;
    return Number(sub);
  } catch {
    return null;
  }
}

/**
 * Obtiene el usuario autenticado a partir del header Authorization de la petición.
 * Devuelve el usuario o null si no está autenticado.
 */
export async function getCurrentUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const userId = await verifyAccessToken(token);
  if (userId === null || Number.isNaN(userId)) {
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}
