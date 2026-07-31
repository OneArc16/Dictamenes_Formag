export type PermisoOption = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  modulo: string | null;
};

export type PermisoGroup = {
  key: string;
  label: string;
  description: string;
  items: PermisoOption[];
};

const MODULE_ORDER = ['module', 'reception', 'appointment', 'dictamen', 'recomendacion', 'admin'] as const;

const MODULE_META: Record<string, { label: string; description: string }> = {
  module: {
    label: 'Acceso a modulos',
    description: 'Permisos base para que el perfil pueda ver y entrar a cada modulo.',
  },
  dictamen: {
    label: 'Dictamenes',
    description: 'Permisos operativos del flujo de dictamen medico.',
  },
  recomendacion: {
    label: 'Recomendaciones',
    description: 'Permisos operativos del flujo de recomendaciones laborales.',
  },
  reception: {
    label: 'Recepción de pacientes',
    description: 'Consulta institucional y actualización de contacto de pacientes.',
  },
  appointment: {
    label: 'Citas',
    description: 'Asignación y gestión operativa de citas médicas.',
  },
  admin: {
    label: 'Administrador',
    description: 'Permisos del modulo administrativo y su auditoria.',
  },
};

function resolveModuloKey(permiso: PermisoOption) {
  const rawModulo = String(permiso.modulo ?? '').trim().toLowerCase();
  if (rawModulo) return rawModulo;

  if (permiso.codigo.startsWith('module.')) return 'module';
  if (permiso.codigo.startsWith('dictamen.')) return 'dictamen';
  if (permiso.codigo.startsWith('recomendacion.')) return 'recomendacion';
  if (permiso.codigo.startsWith('agenda.')) return 'agenda';
  if (permiso.codigo.startsWith('reception.')) return 'reception';
  if (permiso.codigo.startsWith('appointment.')) return 'appointment';
  if (permiso.codigo.startsWith('admin.')) return 'admin';

  return 'otros';
}

function resolveGroupMeta(key: string) {
  if (MODULE_META[key]) return MODULE_META[key];

  return {
    label: key.replace(/[_.-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    description: 'Permisos agrupados automaticamente por su codigo.',
  };
}

export function groupPermisos(permisos: PermisoOption[]): PermisoGroup[] {
  const groups = new Map<string, PermisoGroup>();

  for (const permiso of permisos) {
    const key = resolveModuloKey(permiso);
    const meta = resolveGroupMeta(key);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: meta.label,
        description: meta.description,
        items: [],
      });
    }

    groups.get(key)?.items.push(permiso);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((left, right) => {
        if (left.codigo !== right.codigo) return left.codigo.localeCompare(right.codigo);
        return left.nombre.localeCompare(right.nombre);
      }),
    }))
    .sort((left, right) => {
      const leftIndex = MODULE_ORDER.indexOf(left.key as (typeof MODULE_ORDER)[number]);
      const rightIndex = MODULE_ORDER.indexOf(right.key as (typeof MODULE_ORDER)[number]);
      const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

      if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight;
      return left.label.localeCompare(right.label);
    });
}
