import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/auth';

export const runtime = 'nodejs';

const LoginSchema = z.object({
  username: z.string().min(3), // Documento o email
  password: z.string().min(1), // Empleado.contrasena
});

// Mapeo de perfil (id o nombre) → rol del sistema
function perfilToRole(perfilId?: number | null, perfilNombre?: string | null) {
  // Por ID
  if (perfilId === 2) return 'ADMIN';
  if (perfilId === 1) return 'ADMISIONISTA';
  if (perfilId === 3) return 'MEDICO';

  // Por nombre (fallback)
  if (perfilNombre?.toUpperCase() === 'ADMIN') return 'ADMIN';
  if (perfilNombre?.toUpperCase() === 'ADMISIONISTA') return 'ADMISIONISTA';
  if (perfilNombre?.toUpperCase() === 'MEDICO') return 'MEDICO';

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = LoginSchema.parse(body);

    const login = username.trim();
    const pass = password.trim();

    // 1) Buscar empleado por número de identidad o email
    const empleado = await prisma.empleado.findFirst({
      where: {
        activo: true,
        OR: [{ numeroIdentidad: login }, { email: login }],
      },
      include: {
        perfil: true,
      },
    });

    if (!empleado) {
      return NextResponse.json(
        { ok: false, error: 'Usuario o contraseña inválidos' },
        { status: 401 },
      );
    }

    // 2) Verificar contraseña (texto plano)
    const claveDB = (empleado.contrasena ?? '').trim();
    if (!claveDB || claveDB !== pass) {
      return NextResponse.json(
        { ok: false, error: 'Usuario o contraseña inválidos' },
        { status: 401 },
      );
    }

    // 3) Mapear rol desde el perfil
    const role = perfilToRole(
      empleado.perfilId ?? null,
      empleado.perfil?.nombre ?? null,
    );
    if (!role) {
      return NextResponse.json(
        { ok: false, error: 'Sin rol asignado (perfil inválido)' },
        { status: 403 },
      );
    }

    // 4) Firmar JWT (un solo argumento, el payload)
    const nombreCompleto = `${empleado.primerNombre} ${empleado.primerApellido}`.trim();

    const token = await signJwt({
      sub: String(empleado.id), // ID interno del empleado en dictamy
      role: role as any, // 'ADMIN' | 'ADMISIONISTA' | 'MEDICO'
      name: nombreCompleto || 'Usuario',
    });

    // 5) Redirección según rol
    const redirect =
      role === 'ADMIN'
        ? '/admin'
        : role === 'ADMISIONISTA'
        ? '/admisiones'
        : '/medico';

    // 6) Responder y setear cookie en NextResponse
    const res = NextResponse.json({ ok: true, redirect });
    res.cookies.set('auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 🔥 cookie válida 7 días
    });

    return res;
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || 'Error';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
