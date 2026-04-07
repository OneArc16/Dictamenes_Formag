import { NextResponse } from 'next/server';
import { z } from 'zod';

import { signJwt } from '@/lib/auth';
import {
  inferAppRoleFromPermissionCodes,
  normalizeAppRole,
} from '@/lib/auth/authorization';
import { getDefaultPathForUser } from '@/lib/module-navigation';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = LoginSchema.parse(body);

    const login = username.trim();
    const pass = password.trim();

    const empleado = await prisma.empleado.findFirst({
      where: {
        activo: true,
        OR: [{ numeroIdentidad: login }, { email: login }],
      },
      include: {
        perfil: {
          include: {
            permisos: {
              where: {
                permitido: true,
                permiso: { estado: 1 },
              },
              include: {
                permiso: {
                  select: { codigo: true },
                },
              },
            },
          },
        },
      },
    });

    if (!empleado) {
      return NextResponse.json(
        { ok: false, error: 'Usuario o contrasena invalidos' },
        { status: 401 },
      );
    }

    const claveDB = (empleado.contrasena ?? '').trim();
    if (!claveDB || claveDB !== pass) {
      return NextResponse.json(
        { ok: false, error: 'Usuario o contrasena invalidos' },
        { status: 401 },
      );
    }

    const permissionCodes = Array.from(
      new Set(
        (empleado.perfil?.permisos ?? [])
          .map((perfilPermiso) => perfilPermiso.permiso.codigo)
          .filter((codigo): codigo is string => Boolean(codigo)),
      ),
    );

    const role = inferAppRoleFromPermissionCodes(
      permissionCodes,
      normalizeAppRole(empleado.perfil?.nombre ?? null),
    );

    if (!role) {
      return NextResponse.json(
        { ok: false, error: 'Sin rol asignado' },
        { status: 403 },
      );
    }

    const nombreCompleto = `${empleado.primerNombre} ${empleado.primerApellido}`.trim();

    const token = await signJwt({
      sub: String(empleado.id),
      role,
      name: nombreCompleto || 'Usuario',
      perfilId: empleado.perfilId ?? null,
      perfilNombre: empleado.perfil?.nombre ?? null,
      permissions: permissionCodes,
    });

    const res = NextResponse.json({
      ok: true,
      redirect: getDefaultPathForUser({ role, permissions: permissionCodes }),
    });

    res.cookies.set('auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    const err = error as { issues?: Array<{ message?: string }>; message?: string };
    const message = err?.issues?.[0]?.message || err?.message || 'Error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}