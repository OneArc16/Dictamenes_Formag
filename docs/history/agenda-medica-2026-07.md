# Historial técnico — Agenda médica

**Actualizado:** 31 de julio de 2026  
**Estado:** implementado y publicado en `origin/origen`.

## Propósito

La creación de agenda médica pasó de un flujo disperso a una única vista compacta. El objetivo es que el usuario pueda elegir médicos, período, exclusiones, horarios temporales y duración sin pasos adicionales, con una vista previa confiable antes de confirmar los cupos.

## Decisiones funcionales vigentes

### Sede y permisos

- Por defecto, la agenda usa la sede asignada al usuario autenticado.
- El permiso nuevo `agenda.site.select` permite elegir otra sede activa al crear una agenda.
- Al cambiar de sede, se reinicia el formulario para evitar mezclar médicos, horarios temporales o previews de la sede anterior.
- La búsqueda de médicos, horarios efectivos, preview y confirmación verifican el alcance en servidor. Sin el permiso, una sede distinta se rechaza aunque se manipule el payload.
- La migración `20260730110000_add_agenda_site_select_permission` registra el permiso y lo asigna a los perfiles `ADMIN`/`ADMINISTRADOR`.

### Período, calendario y fechas

- Se usa `react-day-picker` para seleccionar un rango inclusivo de hasta 90 días.
- Se usa `date-holidays` para identificar festivos de Colombia.
- Los festivos se muestran en ámbar; sábados y domingos visibles, en rojo suave con borde discontinuo; una fecha excluida conserva la señalización roja diagonal.
- Los días no laborables y festivos se marcan por defecto en el modal de fechas, pero el usuario puede desmarcarlos para habilitarlos sin pasos adicionales.
- Las exclusiones globales se aplican a todos los médicos; cada fecha dentro de la tarjeta de un médico también tiene una acción directa para excluirla o volver a incluirla.

### Médicos y horarios

- El buscador permite encontrar médicos por nombre, documento o especialidad y añadir todos los activos mediante una acción iconográfica.
- Las tarjetas de médicos muestran las fechas y bloques horarios efectivos para el período.
- Cada médico puede tener un horario temporal por agenda y una duración de consulta individual, sin modificar su horario persistido.
- Las acciones de editar horario, duración, quitar y excluir fechas son iconográficas, con tooltip accesible y área de interacción de al menos 44 px.

### Preview y cupos

- El preview separa los cupos **candidatos**, **nuevos**, **omitidos** y **conflictos**.
- `Candidatos` son todos los espacios derivados del horario; `Nuevos` son los que se crearán; `Omitidos` son los descartados por fechas/reglas aplicables; `Conflictos` son choques con cupos existentes.
- El servidor vuelve a validar horarios y conflictos al confirmar.
- En la consulta de agenda se añadieron selección masiva, cancelación masiva y filtros por médico y fecha.

## Diseño e interacción

- Se eliminó el hero de la creación de agenda y se integró el identificador de "Agenda médica" sobre la sede.
- La cabecera, los controles y las tarjetas se compactaron para reducir scroll y espacios vacíos.
- "Agregar médicos", "Período de la agenda" y las acciones de período viven en una sola tarjeta adaptable.
- El selector de calendario abre como overlay, sin ser recortado por el contenedor.
- El componente compartido `Tooltip` tiene animación mínima (opacidad + desplazamiento), funciona con hover y teclado y no queda fijo tras clic de ratón.
- El modal de minutos por consulta se redujo: mensaje general en etiqueta breve, texto mínimo y acciones concisas.

## Arquitectura relevante

| Responsabilidad | Ubicación principal |
| --- | --- |
| Contexto de creación y sede | `src/features/agenda/application/agenda-creation-context.ts` |
| Control de alcance de sede | `src/features/agenda/application/agenda-creation-scope.ts` |
| Página y selector de sede | `src/app/agenda/crear/page.tsx`, `AgendaCreationHeader.tsx` |
| Formulario y estado de creación | `AgendaCreationForm.tsx`, `useAgendaCreationController.ts`, `agenda-creation-reducer.ts` |
| Calendario de período | `AgendaDateSelector.tsx`, `src/app/globals.css` |
| Resumen de fechas por médico | `DoctorScheduleSummary.tsx` |
| Duración individual | `AgendaDoctorDurationDialog.tsx` |
| Tooltip compartido | `src/components/ui/icon-tooltip.tsx` |
| Migración de permiso de sede | `prisma/migrations/20260730110000_add_agenda_site_select_permission/migration.sql` |

## Contratos de seguridad

El permiso `agenda.site.select` debe validarse tanto en UI como en API. Las rutas protegidas son:

- `GET /api/agenda/medicos/options`
- `GET /api/agenda/medicos/horarios-efectivos`
- `GET /api/agenda/medicos/:id/horario-efectivo`
- `POST /api/agenda/generaciones/preview`
- `POST /api/agenda/generaciones`

Nunca confiar únicamente en el `sedeId` enviado desde el navegador.

## Validación aplicada

- `npx eslint` en archivos modificados.
- `npx tsc --noEmit`.
- `npm run test:agenda`.
- `npm run build`.
- Migración aplicada satisfactoriamente a PostgreSQL local el 31 de julio de 2026.

## Commits publicados

- `88a680d feat(agenda): compactar creación y mejorar calendario`
- `a6ca763 feat(agenda): permitir selección autorizada de sede`

## Recomendaciones para cambios futuros

1. Preservar la validación de alcance en servidor al agregar cualquier endpoint de agenda.
2. Si se agrega una nueva variante de tooltip, reutilizar `Tooltip` en vez de implementar otro flotante ad hoc.
3. Mantener las acciones iconográficas con `aria-label`, tooltip y tamaño mínimo de 44 px.
4. Probar manualmente calendario, cambio de sede y preview con un perfil sin `agenda.site.select` y otro que sí lo tenga.
5. Antes de modificar el motor de cupos, revisar los tests de dominio y los contratos de preview/confirmación.
