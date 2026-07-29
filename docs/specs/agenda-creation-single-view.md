# Especificación: creación de agenda médica en una sola vista

## 1. Estado del documento

- Estado: implementada.
- Módulo: Agenda médica.
- Ruta afectada: `/agenda/crear`.
- Alcance técnico: Next.js 16, React 19, TypeScript, React Query, Prisma y Tailwind.
- Fecha: 2026-07-28.

## 2. Objetivo

Reemplazar el asistente actual de cuatro pasos por una sola vista de creación de
agenda que:

1. Cargue automáticamente la sede asignada al usuario autenticado.
2. Permita buscar y agregar varios médicos desde un combobox con escritura.
3. Incorpore un componente específico para seleccionar el periodo, excluir
   fechas y definir la duración de cada consulta.
4. Muestre debajo los médicos seleccionados y permita administrar sus
   exclusiones particulares.
5. Calcule, muestre y confirme la vista previa sin abandonar la página.

La solución debe conservar las reglas actuales de generación, los controles de
concurrencia, la idempotencia y la validación definitiva en el servidor.

## 3. Principios de diseño y arquitectura

### 3.1 Responsabilidad única

Cada componente debe representar una responsabilidad visible o de interacción.
La coordinación del proceso no debe mezclarse con la representación de
calendarios, resultados de búsqueda o tarjetas de médicos.

### 3.2 Fuente única de verdad

El formulario tendrá un único estado canónico. Los identificadores de médicos,
el rango, la duración y las exclusiones se derivarán de ese estado. No se deben
mantener copias independientes que puedan desincronizarse.

### 3.3 Servidor como autoridad

Las validaciones del cliente mejoran la experiencia, pero no conceden
autorización ni garantizan disponibilidad. El servidor debe volver a validar:

- sede autorizada;
- médicos activos y pertenecientes a la sede;
- horarios efectivos;
- rango y duración;
- exclusiones;
- conflictos y cupos existentes;
- fingerprint de la vista previa;
- idempotency key.

### 3.4 Estados explícitos

La vista previa y la confirmación se modelarán como estados discriminados. No
se usarán combinaciones ambiguas de booleanos como `isPreview`,
`hasCalculated`, `isReady` y `isDirty`.

### 3.5 Dependencias dirigidas hacia el dominio

La presentación construye comandos y consume DTO; no contiene consultas Prisma
ni replica el motor de generación. Las rutas API delegan en servicios de
aplicación y no contienen reglas de negocio extensas.

### 3.6 Accesibilidad desde el contrato

La navegación con teclado, el foco, los mensajes anunciados y los tamaños de
interacción forman parte de los criterios de aceptación, no de una mejora
posterior.

## 4. Alcance

### 4.1 Incluido

- Sustitución visual y funcional de `AgendaCreationWizard`.
- Precarga de la sede desde `Empleado.idSede`.
- Sede visible y no editable en el flujo de creación.
- Búsqueda asíncrona de médicos de la sede y acción para agregar en lote todos
  los médicos activos disponibles.
- Selección múltiple de hasta 50 médicos.
- Calendario de rango inclusivo con máximo de 90 días.
- Exclusión global de fechas dentro del rango.
- Identificación anticipada de fechas no laborables según la unión de los
  horarios efectivos de los médicos seleccionados.
- Duraciones rápidas y duración personalizada.
- Exclusiones particulares por médico.
- Personalización temporal de los bloques semanales de cada médico, aplicable
  únicamente a la agenda en creación y sin modificar su horario predeterminado.
- Vista previa, errores, resumen y confirmación en la misma página.
- Invalidación de la vista previa al modificar datos.
- Protección del alcance de sede en preview y confirmación.
- Pruebas unitarias, de integración y de interacción esenciales.

### 4.2 Fuera de alcance

- Modificar el algoritmo de generación de cupos.
- Modificar las tablas de agenda o crear una migración.
- Permitir que un usuario cree agendas para una sede distinta a la asignada.
- Editar horarios laborales desde la pantalla de creación.
- Guardar borradores.
- Seleccionar horas o cupos individualmente.
- Cambiar la zona horaria `America/Bogota`.
- Rediseñar el listado o el detalle de generaciones.

## 5. Decisiones funcionales

### 5.1 Sede

La sede de creación será `Empleado.idSede` del usuario autenticado.

- Se mostrará como contexto de solo lectura.
- El cliente no decidirá la sede autorizada.
- Si el usuario no tiene sede, la vista quedará bloqueada.
- Si la sede está inactiva o no existe, la vista quedará bloqueada.
- Preview y confirmación rechazarán un `sedeId` diferente, aunque el cliente sea
  manipulado.

Esta decisión evita que una precarga visual sea confundida con una regla de
seguridad.

### 5.2 Selección de fechas

Se conserva el modelo actual:

- `fechaInicial`;
- `fechaFinal`;
- `fechasExcluidas`;
- `exclusionesPorMedico`.

El calendario nuevo representa un rango continuo y permite excluir fechas
dentro de él. No se introduce un modelo alternativo de fechas arbitrarias.

### 5.3 Vista previa

La vista previa será explícita y bajo demanda. No se calculará automáticamente
con cada pulsación para evitar solicitudes costosas y resultados inestables.

Después de cualquier cambio:

- una vista previa anterior se marca como desactualizada;
- el botón de confirmar queda inhabilitado;
- el usuario debe volver a calcular.

### 5.4 Confirmación

La confirmación solo se habilita cuando la última vista previa:

- corresponde exactamente a la revisión actual del formulario;
- no está bloqueada;
- contiene al menos un cupo nuevo;
- tiene fingerprint vigente;
- dispone de idempotency key.

## 6. Flujo de usuario

1. El usuario abre `/agenda/crear`.
2. El servidor valida `agenda.create` y resuelve su sede.
3. La página muestra la sede y habilita el formulario.
4. El usuario escribe en el combobox y agrega uno o varios médicos.
5. Los médicos aparecen inmediatamente en la sección inferior.
6. El usuario selecciona el rango; el sistema marca las fechas donde ninguno
   de los médicos seleccionados tiene horario.
7. El usuario define la duración y, si lo necesita, exclusiones generales.
8. Opcionalmente configura exclusiones particulares desde cada médico.
9. Opcionalmente personaliza las horas de un médico solo para esta generación.
10. El usuario pulsa `Calcular agenda`.
11. La página muestra el resumen y los conflictos sin cambiar de ruta.
12. Si el resultado es válido, el usuario pulsa `Confirmar N cupos`.
13. El servidor recalcula y confirma de forma idempotente.
14. La aplicación navega al detalle de la generación creada.

## 7. Estructura de la vista

```text
┌───────────────────────────────────────────────────────────────┐
│ Crear agenda médica                                          │
│ Sede asignada: [Nombre de la sede]                            │
├───────────────────────────────┬───────────────────────────────┤
│ Buscar médicos              │ Periodo y duración              │
│ [Nombre, documento...]      │ [Calendario / rango]            │
│ [Resultados del combobox]   │ [15][20][30][45][60][Otro]      │
├───────────────────────────────┴───────────────────────────────┤
│ Médicos seleccionados (N)                                    │
│ [Médico + datos + exclusiones particulares + quitar]          │
│ [Médico + datos + exclusiones particulares + quitar]          │
├───────────────────────────────────────────────────────────────┤
│ Vista previa / errores / métricas / detalle por médico        │
├───────────────────────────────────────────────────────────────┤
│ [Cancelar]              [Calcular agenda / Confirmar N cupos] │
└───────────────────────────────────────────────────────────────┘
```

### 7.1 Escritorio

- Rejilla superior de dos columnas.
- Combobox a la izquierda y selector de fechas a la derecha.
- Médicos y vista previa a ancho completo.
- Ancho coherente con `ModulePageLayout`.

### 7.2 Móvil

- Una sola columna.
- Orden: sede, médicos, fechas, seleccionados, preview y acciones.
- Sin regiones de desplazamiento horizontal.
- El calendario muestra un mes.
- Los controles mantienen una altura mínima de 44 px.
- Si se implementa una barra de acciones sticky, debe reservar espacio inferior
  para no cubrir el contenido.

## 8. Arquitectura propuesta

### 8.1 Capas

| Capa | Responsabilidad | No debe hacer |
|---|---|---|
| Página servidor | Autorizar y cargar el contexto inicial | Administrar estado interactivo |
| Servicio de aplicación | Resolver alcance y ejecutar casos de uso | Renderizar o devolver clases CSS |
| Rutas API | Traducir HTTP a comandos y respuestas | Contener reglas extensas |
| Controlador de presentación | Coordinar formulario, preview y confirmación | Renderizar calendarios o listas complejas |
| Componentes de UI | Renderizar y emitir eventos semánticos | Consultar Prisma o construir reglas de negocio |
| Dominio | Validar y calcular agenda | Conocer React, HTTP o Tailwind |

### 8.2 Estructura de archivos objetivo

```text
src/
├── app/
│   └── agenda/
│       └── crear/
│           └── page.tsx
├── features/
│   └── agenda/
│       ├── application/
│       │   ├── agenda-creation-context.ts
│       │   └── agenda-creation-scope.ts
│       ├── domain/
│       │   ├── validation.ts
│       │   └── types.ts
│       └── presentation/
│           └── creation/
│               ├── AgendaCreationForm.tsx
│               ├── AgendaCreationHeader.tsx
│               ├── AgendaDoctorCombobox.tsx
│               ├── AgendaDateSelector.tsx
│               ├── AgendaDurationSelector.tsx
│               ├── SelectedDoctorsSection.tsx
│               ├── SelectedDoctorCard.tsx
│               ├── AgendaPreviewPanel.tsx
│               ├── AgendaCreationActions.tsx
│               ├── agenda-creation-reducer.ts
│               ├── agenda-creation-payload.ts
│               ├── agenda-creation-types.ts
│               └── useAgendaCreationController.ts
```

Los nombres pueden ajustarse durante la implementación, pero deben conservarse
los límites de responsabilidad.

### 8.3 Componentes y responsabilidades

#### `AgendaCreationForm`

- Compone las secciones.
- Recibe el contexto inicial.
- Usa el controlador.
- No implementa búsqueda, lógica de calendario ni llamadas HTTP directamente.
- No debe convertirse en una copia monolítica de `AgendaCreationWizard`.

#### `useAgendaCreationController`

- Expone el estado del formulario y acciones semánticas.
- Coordina preview y confirmación mediante React Query.
- Invalida el preview cuando cambia el formulario.
- Controla foco de errores globales.
- Genera la idempotency key únicamente al obtener un preview válido.
- No devuelve JSX ni conoce clases CSS.

#### `agenda-creation-reducer`

- Contiene transiciones puras del formulario.
- Evita múltiples `setState` relacionados que puedan quedar a mitad de una
  transición.
- Elimina automáticamente las exclusiones de un médico al quitarlo.
- Elimina exclusiones fuera del rango cuando este cambia.
- Incrementa la revisión del formulario ante cambios relevantes.

#### `agenda-creation-payload`

- Convierte el estado de presentación al contrato del backend.
- Ordena identificadores y fechas antes de enviarlos.
- No realiza solicitudes HTTP.
- Evita construir el mismo payload en preview y confirmación por separado.

#### `AgendaDoctorCombobox`

- Administra únicamente texto, apertura, opción activa y navegación del menú.
- Recibe opciones y seleccionados.
- Emite `onSelect(doctor)`.
- No es dueño de la lista final de médicos.
- No elimina médicos ni modifica exclusiones.

#### `AgendaDateSelector`

- Administra la interacción visual de rango y exclusiones globales.
- Recibe valores controlados.
- Emite cambios tipados.
- Deshabilita fechas pasadas y fechas que excedan el máximo permitido.
- No consulta disponibilidad por su cuenta.

#### `AgendaDurationSelector`

- Presenta duraciones rápidas y personalizada.
- Valida formato localmente.
- Emite un número de minutos.
- No conoce el payload completo.

#### `SelectedDoctorsSection`

- Renderiza el estado vacío o la colección.
- Delega cada fila a `SelectedDoctorCard`.
- No duplica el estado de selección.

#### `SelectedDoctorCard`

- Presenta identidad, especialidad y origen de horario.
- Permite quitar al médico.
- Permite expandir exclusiones particulares.
- Solo recibe las fechas relevantes y emite eventos.

#### `AgendaPreviewPanel`

- Renderiza métricas, errores y detalle por médico.
- No calcula cupos.
- Diferencia visual y semánticamente `ready`, `blocked`, `stale` y `error`.

#### `AgendaCreationActions`

- Muestra una única acción primaria según el estado.
- Emite calcular o confirmar.
- No decide por sí mismo si el formulario es válido.

## 9. Modelo de estado

### 9.1 Estado del formulario

El estado canónico debe contener:

- contexto de sede inmutable;
- médicos seleccionados;
- fecha inicial;
- fecha final;
- duración en minutos;
- fechas excluidas globalmente;
- exclusiones por médico;
- revisión numérica del formulario;
- campos tocados o errores de presentación, si son necesarios.

Las opciones de búsqueda, el texto del combobox y su opción activa son estado
efímero del combobox, no del formulario.

### 9.2 Estado del proceso

Estados permitidos:

```text
idle
  └── calculate ──> calculating
                       ├── success ──> ready
                       └── failure ──> error

ready
  ├── form changed ──> stale
  └── confirm ───────> confirming
                          ├── success ──> redirected
                          └── failure ──> error

stale
  └── recalculate ──> calculating
```

Reglas:

- Solo `ready` puede confirmar.
- `ready` conserva la revisión usada para calcular.
- Si la revisión actual cambia, pasa a `stale`.
- Una respuesta asíncrona correspondiente a una revisión anterior no debe
  reemplazar el estado actual.
- `confirming` bloquea doble envío.

## 10. Contexto inicial y seguridad

### 10.1 Resolución en servidor

La página debe:

1. Ejecutar `requireAbility('agenda.create')`.
2. Obtener el `empleadoId` del contexto autorizado.
3. Resolver el empleado con su sede activa mediante un servicio de aplicación.
4. Entregar un DTO mínimo al componente cliente.

El DTO no debe exponer el modelo Prisma completo.

### 10.2 Resultado esperado

El contexto inicial tendrá conceptualmente:

- estado: disponible o bloqueado;
- `sedeId`;
- `sedeNombre`;
- zona horaria;
- límites de médicos, rango y duración;
- mensaje recuperable cuando esté bloqueado.

### 10.3 Protección de alcance

Las rutas:

- `POST /api/agenda/generaciones/preview`;
- `POST /api/agenda/generaciones`;

deben verificar que `payload.sedeId` coincide con la sede activa del empleado
que crea la agenda.

La misma política debe compartirse en un servicio o guard de aplicación. No se
debe copiar la consulta y el mensaje de error en ambas rutas.

Respuesta recomendada ante manipulación o cambio de sede:

- HTTP 403 si el usuario intenta operar en otra sede;
- HTTP 409 si su asignación cambió después de cargar la página;
- mensaje con instrucción para recargar o contactar al administrador.

## 11. Contratos de datos

### 11.1 Búsqueda de médicos

Se conserva:

`GET /api/agenda/medicos/options?sedeId={id}&search={texto}`

Reglas adicionales:

- exigir `agenda.create`, `agenda.schedule.manage` o la habilidad que corresponda;
- aplicar alcance de sede para creación;
- devolver máximo 100 resultados;
- búsqueda normalizada por nombre, documento y especialidad;
- nunca devolver médicos inactivos, sin perfil médico o de otra sede.

El resultado debe conservar:

- `id`;
- `nombre`;
- `documento`;
- `especialidadPrincipal`;
- `tieneHorarioParticular`;
- sede mínima necesaria.

### 11.2 Preview

Se conserva el contrato de `agendaGenerationSchema`.

La UI construye:

- `sedeId`;
- `medicoIds`;
- `fechaInicial`;
- `fechaFinal`;
- `duracionMinutos`;
- `fechasExcluidas`;
- `exclusionesPorMedico`.

El servidor devuelve `AgendaPreview`, incluyendo fingerprint, métricas,
errores, fechas evaluadas y detalle por médico.

### 11.3 Confirmación

Se conserva `confirmAgendaGenerationSchema` y se añaden:

- `idempotencyKey`;
- `previewFingerprint`.

La idempotency key pertenece a una vista previa concreta. No debe reutilizarse
después de modificar o recalcular el formulario.

### 11.4 Normalización

Antes de enviar:

- ordenar `medicoIds`;
- ordenar fechas globales;
- ordenar exclusiones por `medicoId`;
- ordenar fechas de cada médico;
- eliminar duplicados;
- eliminar exclusiones de médicos no seleccionados;
- eliminar fechas fuera del rango.

El backend debe repetir las validaciones esenciales.

## 12. Reglas de negocio

1. Debe existir al menos un médico y máximo 50.
2. Todos los médicos deben pertenecer a la sede autorizada.
3. La fecha inicial debe ser hoy o futura en `America/Bogota`.
4. La fecha final no puede ser anterior a la inicial.
5. El rango inclusivo no puede superar 90 días naturales.
6. La duración debe estar entre 5 y 240 minutos.
7. La duración debe ser múltiplo de 5.
8. Solo se pueden excluir fechas dentro del rango.
9. Las exclusiones particulares solo pueden pertenecer a médicos seleccionados.
10. Los días sin horario efectivo no generan cupos.
11. Los cupos existentes, pasados o en conflicto se omiten conforme al motor
    actual.
12. Confirmar siempre recalcula para proteger cambios concurrentes.

## 13. Especificación del combobox

### 13.1 Interacción

- Label visible: `Buscar médicos`.
- Placeholder: `Escribe nombre, documento o especialidad`.
- Búsqueda con debounce de 300 ms.
- La consulta inicia con 2 caracteres; al enfocar vacío puede mostrar una lista
  inicial limitada si el rendimiento lo permite.
- Seleccionar agrega el médico y conserva abierto el flujo para agregar otro.
- Después de seleccionar, limpia el texto.
- Las opciones ya seleccionadas aparecen marcadas y no vuelven a agregarse.
- Escape cierra la lista.
- Click fuera cierra la lista.
- El foco permanece en el input después de agregar.

### 13.2 Teclado y semántica

- Input con `role="combobox"`.
- `aria-expanded`, `aria-controls` y `aria-activedescendant`.
- Lista con `role="listbox"`.
- Opciones con `role="option"` y `aria-selected`.
- Flecha abajo/arriba cambia la opción activa.
- Enter selecciona.
- Escape cierra sin alterar la selección.
- No se implementará con simples botones y retrasos de `blur` que produzcan
  cierres frágiles.

### 13.3 Estados

- reposo;
- escribiendo;
- cargando;
- resultados;
- sin resultados;
- error con reintento;
- límite de 50 alcanzado.

## 14. Especificación del selector de fechas

### 14.1 Calendario

- Construido sobre `react-day-picker`, ya incluido en el proyecto.
- Un mes en móvil y dos meses desde `md`.
- Idioma `es-CO`.
- Navegación de mes accesible.
- Fechas pasadas deshabilitadas.
- Selección de rango inclusivo.
- El segundo extremo no puede superar 89 días desde el primero.
- No se deben usar formatos ambiguos; el resumen será localizado.

### 14.2 Exclusiones globales

- Una fecha incluida puede marcarse como excluida.
- El estado excluido debe comunicarse con texto o icono, no solo color.
- Cuando hay médicos seleccionados, sus horarios efectivos se consultan en una
  sola operación y las fechas donde ninguno trabaja se muestran marcadas,
  deshabilitadas y con la etiqueta `No laborable`.
- Una fecha no laborable no se agrega a `fechasExcluidas` ni aumenta el contador
  de exclusiones manuales; el motor ya evita generar cupos en ella.
- Si al menos un médico trabaja una fecha, esta continúa disponible como
  exclusión general.
- Las personalizaciones temporales de horario actualizan inmediatamente esta
  clasificación.
- Cambiar el rango limpia las exclusiones que queden fuera de él.
- La vista previa vuelve a validar las fechas laborales; la clasificación
  anticipada es una ayuda visual y no reemplaza la autoridad del servidor.

### 14.3 Duración

- Opciones rápidas: 15, 20, 30, 45 y 60 minutos.
- Valor inicial: 30 minutos.
- Campo personalizado con `min=5`, `max=240`, `step=5`.
- Solo una duración activa.
- Los errores aparecen junto al selector.

## 15. Médicos seleccionados

### 15.1 Estado vacío

Mostrar:

`Aún no has agregado médicos. Búscalos en el campo superior para comenzar.`

No se debe mostrar un contenedor vacío sin explicación.

### 15.2 Tarjeta

Cada tarjeta incluye:

- nombre completo;
- documento, si existe;
- especialidad principal o `Sin especialidad principal`;
- `Horario particular` o `Horario de sede`;
- botón `Quitar médico`;
- control expandible `Excluir fechas para este médico`.

### 15.3 Eliminación

Quitar un médico:

- lo elimina de la selección;
- elimina sus exclusiones particulares;
- invalida el preview;
- anuncia el cambio en una región `aria-live="polite"`;
- no requiere confirmación porque es reversible antes de crear la agenda.

## 16. Preview y confirmación

### 16.1 Métricas

Mostrar:

- médicos;
- candidatos;
- nuevos;
- omitidos;
- conflictos, cuando sea relevante.

Los números usarán cifras tabulares.

### 16.2 Errores

- Errores de campos: junto al campo.
- Error global: al inicio del formulario con `role="alert"`.
- Error de preview: dentro del panel con acción `Reintentar`.
- Conflictos: texto, icono y detalle; no depender exclusivamente de amarillo o
  rojo.
- Tras un error de envío, el foco va al primer error relevante.

### 16.3 Estado desactualizado

Cuando el usuario cambia el formulario después de calcular:

- conservar el resultado anterior solo como referencia opcional;
- mostrar `La configuración cambió. Calcula nuevamente la agenda.`;
- deshabilitar confirmación;
- priorizar visualmente `Recalcular agenda`.

### 16.4 Acción primaria

Solo habrá una acción primaria visible:

- `Calcular agenda` en `idle`, `error` o `stale`;
- `Calculando…` en `calculating`;
- `Confirmar N cupos` en `ready`;
- `Confirmando…` en `confirming`.

`Cancelar` o `Volver a agendas` será una acción secundaria.

## 17. Manejo de consultas y concurrencia

### 17.1 Búsqueda

- React Query usa una key con sede y término normalizado.
- Debounce antes de cambiar la query key.
- No mezclar resultados de sedes o términos diferentes.
- Mantener resultados anteriores solo si se identifican como tales y no inducen
  a seleccionar una opción obsoleta.

### 17.2 Preview

- La mutación captura la revisión del formulario.
- Al resolver, solo se acepta si esa revisión sigue vigente.
- Una respuesta antigua no puede sobrescribir una más reciente.

### 17.3 Confirmación

- El botón se deshabilita durante el envío.
- La misma idempotency key protege reintentos de la misma confirmación.
- Si el fingerprint dejó de ser válido, se presenta el conflicto y se obliga a
  recalcular.

## 18. Validación

### 18.1 Cliente

- Reutilizar las reglas del dominio cuando sea posible.
- Mantener mensajes asociados a campos.
- Validar al abandonar el campo o al intentar calcular.
- No mostrar errores agresivos en cada pulsación.

### 18.2 Servidor

- `agendaGenerationSchema` sigue siendo la validación del contrato.
- El servicio de aplicación valida alcance de sede.
- `calculateAgenda` valida médicos, horarios y fechas.
- `confirmAgendaGeneration` recalcula y protege concurrencia.

No se debe copiar manualmente el mismo conjunto de condiciones en componentes,
rutas y servicios. Las reglas puras compartibles pertenecen al dominio.

## 19. Accesibilidad y calidad visual

- Contraste mínimo 4.5:1 para texto normal.
- Foco visible de 2 a 4 px.
- Controles con mínimo 44 × 44 px.
- Labels visibles; el placeholder no reemplaza el label.
- Orden de tabulación igual al orden visual.
- Todos los botones de icono tienen nombre accesible.
- Los cambios asíncronos se anuncian sin robar foco.
- Los errores usan `role="alert"` o una región apropiada.
- Los estados no dependen únicamente del color.
- Se respetará `prefers-reduced-motion`.
- Se usarán iconos Lucide consistentes, no emoji.
- Animaciones limitadas a transiciones útiles de 150–300 ms.
- Se conservarán los tokens y la estética actual del módulo; no se introducirán
  colores o tipografías aislados solo para esta página.

## 20. Rendimiento

- Debounce de búsqueda.
- Máximo de resultados controlado en servidor.
- No recalcular preview en cada cambio.
- Valores derivados con memoización solo cuando evite trabajo real; no aplicar
  `useMemo` indiscriminadamente.
- Evitar almacenar objetos duplicados en varios estados.
- No renderizar los dos meses del calendario en móvil.
- Reservar espacio razonable para estados de carga y evitar saltos de layout.
- Si la lista alcanza 50 médicos, evaluar renderización contenida; no introducir
  virtualización antes de medir su necesidad.

## 21. Manejo de errores y recuperación

| Caso | Comportamiento |
|---|---|
| Usuario sin sede | Bloquear formulario y orientar al administrador |
| Sede inactiva | Bloquear y solicitar recarga/contacto |
| Error buscando médicos | Mantener texto y ofrecer reintento |
| Médico dejó de ser elegible | Mostrar error del servidor y permitir quitarlo |
| Rango inválido | Error junto al calendario |
| Preview fallido | Mantener formulario y permitir reintentar |
| Preview desactualizado | Exigir recálculo |
| Confirmación en conflicto | Mantener datos, invalidar preview y recalcular |
| Error de red al confirmar | Permitir reintento seguro con idempotencia |
| Generación confirmada | Navegar al detalle una sola vez |

## 22. Estrategia de pruebas

### 22.1 Dominio

- rango inclusivo válido;
- fecha inicial pasada;
- rango superior a 90 días;
- duración inválida;
- médicos duplicados;
- exclusiones fuera de selección;
- normalización determinista del payload.

### 22.2 Reducer/controlador

- agregar médico sin duplicarlo;
- quitar médico elimina sus exclusiones;
- cambiar rango elimina exclusiones fuera del rango;
- cualquier cambio incrementa revisión e invalida preview;
- una respuesta de revisión antigua se ignora;
- solo `ready` puede confirmar;
- recalcular genera una nueva idempotency key.

### 22.3 Componentes

- combobox navegable con flechas, Enter y Escape;
- label y atributos ARIA correctos;
- estados cargando, vacío y error;
- calendario impide fechas pasadas y rangos superiores a 90 días;
- médico seleccionado aparece debajo;
- quitar médico devuelve el foco a un lugar predecible;
- mensajes de error se anuncian.

### 22.4 Integración API

- usuario con `agenda.create` y sede activa obtiene contexto;
- usuario sin sede no puede crear;
- sede del payload diferente a la del usuario devuelve 403;
- médico de otra sede es rechazado;
- preview válido conserva el contrato actual;
- confirmación con fingerprint obsoleto falla de forma recuperable;
- doble confirmación con la misma key no duplica cupos.

### 22.5 Pruebas de flujo

1. Crear agenda con un médico y rango válido.
2. Crear agenda con varios médicos.
3. Excluir una fecha global.
4. Excluir una fecha para un solo médico.
5. Modificar duración después del preview y verificar que confirmar se
   deshabilita.
6. Simular cambio concurrente y recalcular.
7. Usar toda la vista únicamente con teclado.
8. Verificar 375, 768, 1024 y 1440 px.

## 23. Plan de implementación

### Fase 1: contexto y seguridad

- Crear servicio para resolver el contexto de creación.
- Precargar sede desde la página servidor.
- Crear guard compartido de alcance de sede.
- Aplicarlo en preview, confirmación y búsqueda correspondiente.
- Añadir pruebas de autorización.

### Fase 2: estado y contratos de presentación

- Definir tipos, reducer y constructor de payload.
- Cubrir transiciones con pruebas unitarias.
- Mantener el backend y el motor sin cambios.

### Fase 3: componentes independientes

- Implementar combobox.
- Implementar selector de fechas.
- Implementar duración.
- Implementar lista y tarjeta de médicos.
- Implementar panel de preview y acciones.

### Fase 4: composición

- Crear `AgendaCreationForm`.
- Sustituir el wizard en `/agenda/crear`.
- Conectar preview y confirmación.
- Retirar el indicador de pasos y el estado `step`.

### Fase 5: verificación

- Ejecutar pruebas de agenda.
- Ejecutar lint y TypeScript/build.
- Validar interacción con teclado.
- Revisar responsive y contraste.
- Confirmar que no cambió el resultado del motor de cupos.

## 24. Reglas para evitar código espagueti

1. Ningún componente visual consulta Prisma.
2. Ninguna ruta API replica el algoritmo de agenda.
3. Preview y confirmación usan el mismo constructor de payload.
4. La política de sede se implementa una sola vez.
5. Las transiciones relacionadas se realizan mediante reducer, no con cadenas
   de `setState`.
6. El combobox no administra la lista final.
7. El calendario no consulta horarios.
8. El panel de preview no calcula estadísticas.
9. Los componentes reciben props tipadas y emiten eventos semánticos.
10. No introducir estados derivados que puedan calcularse desde el estado
    canónico.
11. No silenciar errores TypeScript con `any`.
12. No usar efectos para sincronizar dos copias del mismo dato.
13. No crear abstracciones genéricas antes de tener un segundo caso real.
14. No modificar el motor de agenda como parte del rediseño visual.
15. Cada archivo nuevo debe poder describirse con una responsabilidad principal
    en una sola frase.

## 25. Criterios de aceptación

- [ ] La ruta muestra una sola vista, sin pasos ni botones siguiente/anterior.
- [ ] La sede asignada aparece desde la primera renderización.
- [ ] La sede no puede alterarse desde el cliente ni mediante el payload.
- [ ] Un usuario sin sede recibe un estado bloqueado comprensible.
- [ ] El combobox busca por nombre, documento y especialidad.
- [ ] El combobox funciona con teclado y lector de pantalla.
- [ ] Se pueden agregar entre 1 y 50 médicos sin duplicados.
- [ ] Los médicos aparecen debajo y pueden quitarse.
- [ ] El calendario selecciona un rango inclusivo de máximo 90 días.
- [ ] Las fechas pasadas están deshabilitadas.
- [ ] Se pueden excluir fechas globales y por médico.
- [ ] La duración admite opciones rápidas y múltiplos de 5 entre 5 y 240.
- [ ] El preview se muestra en la misma página.
- [ ] Cambiar el formulario invalida el preview.
- [ ] Solo una vista previa vigente puede confirmarse.
- [ ] Confirmar recalcula y conserva idempotencia.
- [ ] Los errores ofrecen una forma clara de recuperación.
- [ ] La vista es usable desde 375 px sin desplazamiento horizontal.
- [ ] Todos los controles interactivos tienen al menos 44 px.
- [ ] Las pruebas existentes del motor continúan pasando.
- [ ] Las nuevas responsabilidades están separadas según esta especificación.

## 26. Definición de terminado

La funcionalidad se considera terminada cuando:

1. Todos los criterios de aceptación están cumplidos.
2. Las pruebas de dominio, reducer, alcance e integración pasan.
3. Lint, TypeScript y build no presentan errores nuevos.
4. La vista se verificó con teclado y en los breakpoints definidos.
5. Preview y confirmación no permiten operar fuera de la sede del usuario.
6. No se añadieron migraciones ni cambios innecesarios al motor de generación.
7. El archivo monolítico anterior fue retirado o reducido a una compatibilidad
   temporal claramente documentada.
