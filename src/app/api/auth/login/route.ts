import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dnaPrisma } from '@/lib/prisma';
import { signJwt } from '@/lib/auth';

export const runtime = 'nodejs';

const LoginSchema = z.object({
  username: z.string().min(3),   // Documento (identificación)
  password: z.string().min(1),   // Clave (empleados.Clave)
});

function perfilToRole(perfil?: number | null) {
  if (perfil === 1) return 'ADMIN';
  if (perfil === 10) return 'ADMISIONISTA';
  if (perfil === 2) return 'MEDICO';
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = LoginSchema.parse(body);

    // 1) Buscar empleado por Documento (o por código, por si acaso)
    const empleado = await dnaPrisma.empleados.findFirst({
      where: {
        OR: [
          { Documento: username.trim() },
          { C_digo_empleado: username.trim() }, // fallback
        ],
      },
      select: {
        C_digo_empleado: true,
        Nombre_empleado: true,
        Documento: true,
        Clave: true,
        Perfil: true,
        Estado_Empleado: true,
      },
    });

    if (!empleado) {
      return NextResponse.json(
        { ok: false, error: 'Usuario o contraseña inválidos' },
        { status: 401 }
      );
    }

    // 2) Opcional: bloquear si el empleado está inactivo
    if (empleado.Estado_Empleado === false) {
      return NextResponse.json(
        { ok: false, error: 'Usuario inactivo' },
        { status: 401 }
      );
    }

    // 3) Verificar clave (en DNA suele ir en texto plano)
    const claveDB = (empleado.Clave ?? '').trim();
    if (!claveDB || claveDB !== password.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Usuario o contraseña inválidos' },
        { status: 401 }
      );
    }

    // 4) Mapear rol desde Perfil
    const role = perfilToRole(empleado.Perfil ?? null);
    if (!role) {
      return NextResponse.json(
        { ok: false, error: 'Sin rol asignado (perfil inválido)' },
        { status: 403 }
      );
    }

    // 5) Firmar JWT
    const token = await signJwt({
      sub: empleado.C_digo_empleado,          // ID técnico del empleado
      role: role as any,                      // 'ADMIN' | 'ADMISIONISTA' | 'MEDICO'
      name: empleado.Nombre_empleado ?? 'Usuario',
    });

    // 6) Redirección según rol
    const redirect =
      role === 'ADMIN' ? '/admin' :
      role === 'ADMISIONISTA' ? '/admisiones' :
      '/medico';

    // 7) Responder y setear cookie en NextResponse
    const res = NextResponse.json({ ok: true, redirect });
    res.cookies.set('auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8, // 8h
    });
    return res;

  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || 'Error';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
