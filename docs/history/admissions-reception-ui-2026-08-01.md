# Copia de seguridad — Admisiones y asignación de citas

**Fecha:** 1 de agosto de 2026

**Punto de partida:** `a5944aa feat(reception): ampliar ficha editable del paciente`

**Estado:** versión funcional preparada para commit de respaldo.

## Propósito

Este registro conserva el alcance del refinamiento realizado en Admisiones y
permite identificar con precisión el estado que debe recuperarse desde Git si
se necesita volver a esta versión.

## Conservación del módulo original de Admisiones

El listado original de dictámenes no fue eliminado. Se trasladó desde
`/admisiones` a `/admisiones/dictamenes` y mantiene sus filtros, tabla,
exportación, impresión y reapertura. La ruta `/admisiones` quedó como entrada
segura que dirige al primer submódulo autorizado:

- `Dictamen`: `/admisiones/dictamenes`;
- `Recepción de pacientes`: `/admisiones/recepcion-pacientes`.

También se actualizó el retorno desde el detalle del dictamen y se agregaron
pruebas para la visibilidad, ruta inicial y estado activo de ambos submódulos.

## Refinamiento visual de Asignar cita

La lógica de negocio, permisos, API y persistencia no fueron modificados. Los
cambios se concentran en presentación, interacción y accesibilidad:

- calendario de disponibilidad con encabezado, contador, selección visible,
  leyenda y comportamiento adaptable;
- selector de horarios mediante tarjetas con estados de carga, disponibilidad y
  hora elegida;
- resumen claro de la fecha seleccionada en reemplazo de la barra oscura;
- historial de citas con filtro múltiple compacto, menú sólido y estados
  identificables;
- acciones de cita convertidas a iconos minimalistas con tooltip, `aria-label`,
  foco visible y área táctil de 44 por 44 píxeles;
- modal de movimientos corregido para usar una superficie blanca real y una
  línea de tiempo con eventos, fecha, transiciones de cita/cupo y motivo;
- componente base de diálogo con contraste explícito, cierre accesible,
  superposición moderada y respeto por movimiento reducido.

## Archivos incluidos en el punto de restauración

- `src/app/admisiones/page.tsx`;
- `src/app/admisiones/dictamenes/layout.tsx`;
- `src/app/admisiones/dictamenes/page.tsx`;
- `src/app/admisiones/dictamenes/[id]/page.tsx`;
- `src/features/reception/presentation/PatientReceptionPage.tsx`;
- `src/components/ui/dialog.tsx`;
- `src/app/globals.css`;
- `src/lib/module-navigation.ts`;
- `src/lib/module-navigation.test.ts`;
- `docs/history/patient-reception-2026-07.md`;
- este documento de respaldo.

## Verificaciones del respaldo

Antes de crear el commit se verifican:

- compilación de TypeScript con `npx tsc --noEmit --pretty false`;
- lint focalizado de los componentes modificados;
- pruebas de Recepción con `npm run test:reception`;
- pruebas de navegación con `npm run test:navigation`;
- ausencia de errores de espacios con `git diff --check`.

## Recuperación

El commit que contiene este archivo usa el asunto
`feat(admissions): preserve and refine appointment workflows`. Su identificador
puede obtenerse con:

```bash
git log --oneline --grep="preserve and refine appointment workflows"
```

Para inspeccionar el respaldo sin modificar el árbol de trabajo:

```bash
git show --stat <identificador-del-commit>
```

La recuperación debe realizarse con las operaciones normales de Git y revisando
primero cualquier cambio posterior para evitar sobrescribir trabajo nuevo.
