import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const ALG = 'HS256';

export type JwtPayload = {
  sub: string;
  role: 'ADMIN' | 'ADMISIONISTA' | 'MEDICO';
  name: string;
  perfilId?: number | null;
  perfilNombre?: string | null;
  permissions?: string[];
};

export async function signJwt(payload: JwtPayload, expiresIn = '8h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as JwtPayload;
}