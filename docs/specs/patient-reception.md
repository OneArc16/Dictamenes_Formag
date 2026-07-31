# Especificación: Recepción de Pacientes

## 1. Estado del documento

- Estado: cerrada técnicamente y lista para implementación; solo quedan por
  suministrar los catálogos, formatos y fuentes institucionales enumerados en 17.
- Módulo padre: Admisiones.
- Submódulo: Recepción de Pacientes.
- Ruta propuesta: `/admisiones/recepcion-pacientes`.
- Alcance técnico: Next.js 16, React 19, TypeScript, React Query, Prisma,
  PostgreSQL, Tailwind, Radix UI, React DayPicker y Lucide.
- Zona horaria operativa: `America/Bogota`.
- Fecha: 31 de julio de 2026.

## 2. Objetivo

Permitir que un usuario autorizado busque un paciente por número de documento,
actualice sus datos de contacto cuando sea necesario, consulte la disponibilidad
real de las agendas médicas y asigne un cupo sin abandonar una vista compacta.

La misma vista mostrará el historial de citas del paciente y las acciones
permitidas para cada estado, con las fechas más recientes primero.

## 3. Contexto técnico actual

El proyecto ya dispone de:

- pacientes almacenados en `Usuario`;
- sedes en `Sede` y sede asignada en `Empleado.idSede`;
- especialidades en `EspecialidadMedica`;
- médicos y sus especialidades en `Empleado` y `EmpleadoEspecialidad`;
- agendas y cupos en `GeneracionAgenda` y `CupoMedico`;
- selección controlada de otras sedes mediante el patrón usado por
  `agenda.site.select`;
- calendario con React DayPicker y presentación de dos meses en escritorio;
- RBAC, React Query, toasts, botones, diálogos, checkbox y tooltips reutilizables.

`CupoMedico` todavía no está relacionado con `Usuario`. Por tanto, este
submódulo requiere una entidad de cita: no se debe agregar lógica de paciente
directamente a la generación de agendas ni usar el estado del cupo como único
historial clínico-operativo.

`Usuario.idSede`, aunque exista en el esquema actual, no representa pertenencia
ni limita la atención del paciente. El directorio de pacientes es institucional
y global: un paciente puede buscarse desde cualquier sede autorizada y puede
recibir una cita en cualquier sede donde el empleado tenga permiso para operar.

La ruta actual `GET /api/pacientes/search` tampoco es contrato suficiente para
este caso de uso: admite búsquedas parciales, devuelve varios resultados y no
expresa el control de permisos específico de recepción. Se creará un contrato
exacto y autenticado para este submódulo.

## 4. Principios de diseño y arquitectura

### 4.1 Separación de responsabilidades

- `Usuario` conserva los datos maestros del paciente.
- `CupoMedico` conserva el espacio temporal y su disponibilidad.
- `Cita` conserva la asignación y el estado actual de la cita del paciente.
- `CitaHistorial` es la tabla log append-only que conserva cada movimiento,
  evento y transición de la cita del paciente.
- Los componentes presentan datos y emiten intenciones; no consultan Prisma.
- Las rutas API traducen HTTP a comandos; no concentran reglas de negocio.
- Los servicios de aplicación coordinan transacciones, permisos y concurrencia.
- El dominio valida transiciones sin conocer React, HTTP, Prisma o Tailwind.

### 4.2 Servidor como autoridad

El cliente puede anticipar disponibilidad, pero el servidor siempre volverá a
validar, dentro de la transacción:

- usuario, permiso y sede autorizada;
- paciente existente y activo en el directorio institucional global;
- médico activo, asociado a la sede y a la especialidad;
- cupo perteneciente a la sede, médico y fecha solicitados;
- cupo todavía disponible y no vencido;
- catálogos activos;
- idempotencia de la solicitud;
- transición de estado permitida.

### 4.3 Estado explícito

La pantalla se modelará con estados discriminados. No se usarán combinaciones
ambiguas de booleanos como `patientFound`, `isSearching`, `notFound` y
`hasPatient` simultáneamente.

Estados mínimos del flujo:

```text
patient: idle | searching | found | not-found | error
booking: idle | loading-options | editing | submitting | success | conflict | error
patientSave: pristine | dirty | saving | saved | error
```

### 4.4 Privacidad por diseño

- No registrar datos personales completos en logs de aplicación.
- En auditoría guardar identificadores internos, actor, fecha, acción y cambios
  relevantes; el número de documento debe ir enmascarado cuando sea necesario.
- No precargar historiales hasta encontrar un paciente válido.
- Todos los endpoints de recepción requieren sesión y permiso explícito.
- La búsqueda exacta recibe el documento en el cuerpo de un `POST`; no lo expone
  en URL, historial del navegador ni query strings de observabilidad.
- Las respuestas con paciente, historial o PDF usan
  `Cache-Control: private, no-store` y nunca se guardan en caché persistente.
- React Query usa `staleTime: 0` y `gcTime: 0` para paciente e historial, elimina
  esas consultas al cambiar de paciente y limpia todo el caché al cerrar sesión.
- Se limita la frecuencia de búsqueda globalmente por empleado, sin multiplicar
  la cuota al cambiar de sede; los abusos se auditan sin almacenar el documento
  completo.
- Toda mutación y todo `POST` sensible, incluida la búsqueda exacta, valida
  `Origin` y Fetch Metadata además de la cookie de sesión; si no puede probar un
  origen confiable exige token CSRF. La cookie de sesión institucional debe ser
  `Secure`, `HttpOnly`, `SameSite=Lax` o más estricta y de alcance mínimo.

### 4.5 Idempotencia y operaciones

Toda operación que pueda repetirse por doble clic, reintento de red o timeout es
idempotente. Agendar, actualizar contacto, activar, generar recordatorio PDF,
cancelar y reprogramar reciben una clave UUID mediante el header
`Idempotency-Key`. En la integración clínica interna o externa, la clave estable
se deriva en servidor de la identidad única del encuentro o de
`(issuer, messageId)` y nunca se acepta como autoridad del emisor.

El comando se valida con Zod, se normaliza y se serializa canónicamente con una
única función compartida. Su huella se calcula con `HMAC-SHA-256` y una clave
versionada obtenida del gestor institucional de secretos; no se usa SHA-256
simple sobre teléfonos, correos o documentos de baja entropía.

El protocolo tiene dos fases:

1. una transacción corta crea o reclama `OperacionIdempotente` en estado
   `PROCESSING`, con `ownerToken` aleatorio y `leaseUntil`;
2. la transacción de dominio bloquea la operación, verifica propietario y lease,
   ejecuta todos los cambios y la marca `COMPLETED` de forma atómica.

Si la clave ya existe:

- mismo actor, operación y HMAC en `COMPLETED`: devuelve el resultado estable;
- mismo actor y operación, pero HMAC diferente: responde
  `409 IDEMPOTENCY_KEY_REUSED`;
- `PROCESSING` con lease vigente: responde `409 OPERATION_IN_PROGRESS` y
  `Retry-After`;
- `PROCESSING` con lease vencido: un único proceso puede reclamarla mediante
  actualización condicional de versión y nuevo `ownerToken`;
- `FAILED` determinístico: devuelve el mismo código de error; un fallo transitorio
  no se conserva como resultado definitivo.

Tanto `COMPLETED` como `FAILED` se escriben con compare-and-set sobre
`status = PROCESSING`, `ownerToken`, `lockVersion` y `leaseUntil > now()`. Si la
actualización afecta cero filas, el proceso perdió la propiedad: vuelve a leer la
operación y no puede confirmar dominio, sobrescribir el resultado ni marcarla
como fallida. Esta regla evita que un propietario lento corrompa el resultado
después de que otro proceso recupere el lease.

El resultado idempotente no guarda bodies con PII. Conserva un acknowledgment
inmutable: `operationId`, `resultType`, `resourceId`, `resourceVersion`,
`responseStatus` y `responseCode`. El cliente consulta después la proyección
actual del recurso. La clave no sustituye restricciones de base de datos: las
mutaciones usan aislamiento `Serializable`, actualización condicional,
recuperación de colisiones y reintentos acotados con backoff y jitter. No se
realizan llamadas de red dentro de una transacción.

## 5. Alcance

### 5.1 Incluido

- Nueva entrada secundaria `Recepción de Pacientes` dentro de Admisiones.
- Directorio institucional global: búsqueda, datos básicos e historial sin
  limitar pacientes por `Usuario.idSede`.
- Búsqueda exacta por número de documento con Enter o botón `Buscar`.
- Presentación compacta de datos básicos del paciente.
- Edición controlada de celular, teléfono, correo y dirección.
- Botón `Guardar datos` habilitado solo cuando existan cambios válidos.
- Sede asignada precargada y selector de otras sedes con permiso específico.
- Consulta dependiente en el orden especialidad, fecha, médico, hora disponible,
  medio de solicitud y modalidad.
- Calendario de selección de una sola fecha, con dos meses visibles en
  escritorio y un mes en pantallas pequeñas.
- Marcación verde de días con disponibilidad real.
- Asignación transaccional e idempotente de un cupo.
- Historial del paciente en orden descendente por fecha de cita.
- Filtro multiselección de estados mediante combobox buscable con checkbox.
- Activación, generación e impresión del recordatorio PDF, cancelación,
  reprogramación e impresión de soporte, cuando el estado y los permisos lo
  permitan.
- Auditoría y pruebas automáticas de reglas críticas.

### 5.2 Fuera de alcance

- Crear pacientes desde esta misma entrega. Ante un paciente inexistente se
  informa que debe crearse mediante el flujo vigente.
- Crear o modificar horarios laborales o generaciones de agenda.
- Sobrecupos o citas sin un `CupoMedico` válido.
- Cambiar datos de identidad, nombres, fecha de nacimiento, sexo o EPS desde
  recepción.
- Implementar una historia clínica nueva.
- Enviar recordatorios por SMS, correo, WhatsApp u otro proveedor externo. El
  recordatorio de esta entrega es exclusivamente un formato PDF para imprimir y
  entregar al paciente.
- Permitir fechas u horas pasadas.

## 6. Decisiones funcionales

### 6.1 Sede y alcance

- Se separan dos conceptos que nunca deben mezclarse:
  - **alcance del paciente**: institucional y global, sin filtro por
    `Usuario.idSede`;
  - **alcance de operación**: sede donde se prestará la cita y desde la cual se
    consultan especialidades, médicos, fechas y cupos.
- La sede asignada al empleado autenticado aparece seleccionada por defecto.
- Sin `reception.site.select`, la sede es visible y de solo lectura.
- Con `reception.site.select`, se puede escoger otra sede activa.
- Si el empleado no tiene sede asignada, puede buscar pacientes globales. La
  asignación permanece deshabilitada con explicación visible; con
  `reception.site.select` debe escoger una sede activa antes de consultar
  disponibilidad.
- Al cambiar de sede se limpian especialidad, fecha, médico y cupo seleccionado.
- El paciente encontrado no se limpia al cambiar de sede.
- Cambiar la sede operativa nunca cambia, oculta ni invalida al paciente
  encontrado; únicamente reinicia las opciones dependientes de agenda.
- Las especialidades, médicos, fechas y cupos siempre se limitan a la sede
  seleccionada.
- El permiso no se confía al cliente: cada consulta y mutación valida la sede en
  servidor.
- La búsqueda, lectura de datos básicos e historial no comparan
  `Usuario.idSede` con la sede del empleado ni con la sede seleccionada. Sí exigen
  `module.admisiones.access` y `reception.read`.
- Actualizar contacto exige `reception.patient.update`, pero tampoco cambia
  `Usuario.idSede` ni lo usa como frontera de acceso.
- Agendar en otra sede exige `reception.site.select`; la sede de la nueva cita se
  deriva del cupo autorizado, no de una supuesta sede del paciente.

Se propone un permiso propio de recepción, en vez de reutilizar
`agenda.site.select`, para respetar mínimo privilegio. Poder crear agendas no
debe implicar automáticamente poder asignar citas en otras sedes, ni viceversa.

### 6.2 Búsqueda del paciente

1. El usuario escribe el número de documento.
2. La búsqueda se ejecuta solo con Enter o clic en `Buscar`; no se consulta por
   cada pulsación.
3. Se normalizan espacios externos. No se eliminan ceros a la izquierda.
4. La consulta es exacta sobre `Usuario.identificacion` en el directorio global;
   no incluye una condición por `Usuario.idSede`.
5. Si existe un único paciente, se muestran sus datos y se carga el historial.
6. Si no existe, se limpian los datos anteriores y se muestra el toast:
   `El paciente no existe. Debes crearlo antes de agendar una cita.`
   El mismo mensaje permanece visible en línea junto al buscador, con
   `role="status"`, `aria-live="polite"` y `aria-atomic="true"`. Este mensaje en
   línea es el único anuncio para tecnologías de asistencia; el toast paralelo
   es visual y se configura `aria-hidden="true"` para no duplicarlo.
7. Si el mismo número existe con más de un tipo documental, se revela un selector
   compacto de tipo de documento para desambiguar. Esta excepción es necesaria
   porque la unicidad actual es `(identificacion, tipoIdentificacion)`.
8. Un error de red o servidor no debe mostrarse como paciente inexistente. Se
   conserva el documento y se ofrece `Reintentar`.

### 6.3 Datos del paciente

Datos de solo lectura:

- tipo y número de documento;
- nombres y apellidos;
- fecha de nacimiento y edad calculada;
- sexo;
- EPS;
- municipio.

Datos editables:

- celular;
- teléfono;
- correo electrónico;
- dirección.

Reglas del botón `Guardar datos`:

- inicia deshabilitado;
- se habilita únicamente si el valor normalizado difiere del snapshot cargado y
  todos los campos modificados son válidos;
- vuelve a deshabilitarse si el usuario revierte los cambios;
- durante el envío permanece deshabilitado y muestra `Guardando…`;
- después de guardar, la respuesta del servidor se convierte en el nuevo
  snapshot y el estado vuelve a `pristine`;
- usa control optimista mediante `contactVersion`; el cliente envía
  `expectedContactVersion`, la actualización condiciona `id + contactVersion`.
  Un trigger PostgreSQL incrementa la versión cuando cambie celular, teléfono,
  correo o dirección, incluso si el cambio proviene de otro módulo o de SQL. Así
  no se pierden actualizaciones y tampoco se producen conflictos por campos no
  relacionados. Ante edición concurrente responde `409 STALE_CONTACT_VERSION`,
  devuelve únicamente la versión actual y solicita recargar los datos.

Cambiar de paciente con cambios sin guardar exige confirmación antes de
descartar el formulario.

### 6.4 Orden y dependencia de la asignación

La sección conservará el orden solicitado:

1. `Especialidad`.
2. `Fecha cita`.
3. `Médico`.
4. `Hora disponible`, presentada como resultado compacto del médico; es
   obligatoria aunque no estuviera enumerada originalmente, porque una fecha
   puede contener varios cupos.
5. `Medio de solicitud`.
6. `Modalidad`.
7. Botón `Agendar cita`.

Dependencias:

- Especialidad lista solo especialidades activas con al menos un médico y cupo
  disponible en la sede.
- Antes de elegir médico, el calendario marca en verde los días donde cualquier
  médico de la especialidad tiene cupos disponibles.
- Médico lista solo profesionales activos de la sede, con la especialidad
  seleccionada y al menos un cupo disponible en la fecha.
- Después de seleccionar médico se consultan sus horas disponibles. Si una
  actualización deja la fecha sin disponibilidad, se limpian médico y hora y se
  explica el motivo.
- Cambiar un campo superior limpia todos sus dependientes.
- `Agendar cita` solo se habilita con paciente, sede, especialidad, fecha,
  médico, hora, medio y modalidad válidos.

### 6.5 Calendario

- React DayPicker en modo `single`.
- Dos meses visibles desde `768px`; un mes por debajo de ese ancho.
- No se seleccionan rangos: la apariencia de dos meses es únicamente visual.
- Días pasados, sin agenda o sin cupos disponibles quedan deshabilitados.
- Día con disponibilidad: fondo verde suave, indicador y texto accesible
  `Tiene citas disponibles`.
- Día seleccionado: estilo primario con borde/foco visible.
- El verde nunca será el único indicador: se añade un punto o icono y una
  leyenda textual.
- Al navegar de mes se consulta la ventana visible, con caché por sede y
  especialidad.
- Las fechas se intercambian como `YYYY-MM-DD`; la hora se guarda como
  `timestamptz` y se presenta en `America/Bogota`.

### 6.6 Medio de solicitud

Catálogo cerrado inicial:

| Código | Etiqueta |
| --- | --- |
| `PRESENCIAL` | Presencial |
| `TELEFONO` | Teléfono |
| `CORREO` | Correo |
| `WHATSAPP` | WhatsApp |

Se almacena el código, no la etiqueta visible.

### 6.7 Modalidad

`Modalidad` será un catálogo activo consultado desde la base de datos, no un
literal duplicado en componentes y rutas. Los valores iniciales deben ser
confirmados por negocio antes de construir la migración; se propone como base
`Presencial` y `Teleconsulta`. La arquitectura y los contratos no dependen de
que el catálogo tenga únicamente esos dos valores.

### 6.8 Asignación y concurrencia

Al pulsar `Agendar cita`, el coordinador reclama primero la operación en una
transacción corta según 4.5. Con un `ownerToken` válido ejecuta la transacción de
dominio:

1. bloquea `OperacionIdempotente` y verifica propietario, HMAC y lease;
2. valida permisos y alcance de sede;
3. vuelve a leer paciente, médico, especialidad, modalidad y cupo;
4. reclama el cupo con una actualización condicional desde `DISPONIBLE` a
   `ASIGNADO`;
5. si no se actualizó exactamente una fila, responde
   `409 SLOT_NOT_AVAILABLE`;
6. crea `Cita` en estado `ASIGNADA` con snapshots temporales y descriptivos;
7. crea el primer evento en `CitaHistorial` con el `operationId`;
8. registra auditoría y marca la operación `COMPLETED`;
9. confirma la transacción y devuelve la cita creada.

La operación usa aislamiento `Serializable`. Un conflicto serializable se
reintenta como máximo dos veces con backoff y jitter; una colisión de clave única
se resuelve leyendo la operación o cita ya confirmada. Reintentar la misma
petición no crea dos citas. Mientras se procesa, el botón queda deshabilitado y
no acepta doble clic.

Además de reclamar el cupo, la base de datos impide que un paciente tenga dos
citas `ASIGNADA` con intervalos superpuestos. La migración reutiliza la extensión
`btree_gist` ya instalada por Agenda y crea una exclusión PostgreSQL sobre
`usuarioId` y `tstzrange(inicioProgramado, finProgramado, '[)')`. Los intervalos
adyacentes son válidos. Si se viola, el servidor responde
`409 PATIENT_APPOINTMENT_OVERLAP` con una explicación recuperable, sin revelar
datos de la otra cita a un actor no autorizado.

Tras éxito:

- toast `Cita agendada correctamente.`;
- se invalida la disponibilidad afectada;
- se limpia solo el formulario de asignación;
- se conserva el paciente;
- se actualiza el historial y se anuncia el resultado mediante `aria-live`.

### 6.9 Estados de la cita y del cupo

| Estado de la cita | Significado | Estado del cupo en Agenda |
| --- | --- | --- |
| `ASIGNADA` | Cita vigente del paciente | `CupoMedico.ASIGNADO` |
| `ATENDIDA` | Atención finalizada | permanece `ASIGNADO` |
| `REPROGRAMADA` | Registro original sustituido por otra cita | `CupoMedico.DISPONIBLE` |
| `CANCELADA` | Cita cancelada por el paciente o un usuario autorizado | `CupoMedico.DISPONIBLE` |

`Cupo libre` no es un estado de `Cita`. Es la etiqueta operativa que Agenda
mostrará cuando `CupoMedico.estado = DISPONIBLE`. Cuando se cancela una cita, el
log del paciente conserva el movimiento y la cita queda `CANCELADA`, aunque ese
mismo cupo sea asignado posteriormente a otro paciente.

La activación y la generación del recordatorio PDF son eventos de una cita
`ASIGNADA`, no estados adicionales. La activación registra una única confirmación
operativa sin cambiar la etiqueta visible. `activadaAt` es inmutable: otra clave
idempotente no puede activar nuevamente ni sobrescribir la primera activación.

### 6.10 Transiciones

```text
                         reprogramar
                    ┌──────────────────> REPROGRAMADA
                    │                         + nueva ASIGNADA
ASIGNADA ───────────┼── cancelar ──────> CANCELADA
   │                │
   ├── activar ─────┤  (evento; conserva ASIGNADA)
   ├── recordatorio PDF ┤  (evento; conserva ASIGNADA)
   └── atender ────────────────────────> ATENDIDA
```

Reglas:

- No se cancelan ni reprograman citas atendidas.
- No se ejecutan acciones mutables sobre `REPROGRAMADA` o `CANCELADA`.
- Activar exige `activadaAt IS NULL` y usa una actualización condicional. Un
  replay con la misma clave devuelve el resultado almacenado; una operación
  diferente sobre una cita ya activada responde
  `409 APPOINTMENT_ALREADY_ACTIVATED` sin crear otro evento.
- Reprogramar reclama el nuevo cupo y libera el anterior en una sola transacción.
- En reprogramación se reclama primero el nuevo cupo; luego se marca la cita
  original como `REPROGRAMADA`, se libera el cupo anterior y se inserta la nueva
  cita. Si cualquier paso falla, el rollback restaura ambos cupos y la cita
  original; actualizarla antes del `INSERT` evita colisión con la exclusión de
  solapamiento.
- Si falla la reclamación del nuevo cupo, la cita original permanece intacta.
- La cita nueva referencia a la cita original, conserva paciente, especialidad,
  modalidad y medio de solicitud, y deriva sede, médico, inicio y fin
  exclusivamente del nuevo cupo. El servidor valida que el nuevo médico atienda
  la especialidad conservada, que la modalidad continúe activa y compatible y
  que el actor tenga alcance sobre la nueva sede.
- La nueva cita inicia sin activar: `activadaAt = null` y `activadaBy = null`.
  Los documentos de recordatorio de la cita original permanecen como evidencia
  histórica, pero su endpoint de contenido rechaza el render cuando la cita ya
  no está `ASIGNADA`; se debe generar un nuevo recordatorio para la nueva cita.
- Cambiar especialidad o modalidad no es reprogramar: requiere cancelar la cita
  vigente y ejecutar una nueva asignación explícita, cada operación con su motivo,
  permisos, auditoría e idempotencia.
- Cancelar actualiza la cita a `CANCELADA`, devuelve el cupo a `DISPONIBLE` y
  agrega el movimiento a `CitaHistorial` dentro de la misma transacción.
- La transición a `ATENDIDA` proviene del flujo clínico autorizado, no de un
  botón nuevo en esta pantalla.

### 6.11 Política temporal

- Todas las decisiones usan la hora de la base de datos y timestamps UTC; la UI
  presenta fechas en `America/Bogota`.
- Agendar exige `CupoMedico.inicio > now()` dentro de la transacción.
- Activar, generar recordatorio, cancelar y reprogramar exigen cita `ASIGNADA` y
  `now() < inicioProgramado`.
- El cierre de cancelación y reprogramación se obtiene de la versión activa de
  `ReceptionSitePolicy` de la sede de la cita, dentro de la misma transacción y
  usando `now()` de PostgreSQL. Cada sede activa debe tener exactamente una
  política inicial sembrada; no existe fallback silencioso a variables de
  entorno. El valor inicial de ambos cortes es `0`, equivalente a permitir la
  acción hasta el comienzo.
- La disponibilidad de acciones que recibe la UI es orientativa. Cancelación y
  reprogramación vuelven a leer la política bajo transacción y registran su
  `policyVersion` en metadata del movimiento y de auditoría.
- La condición exacta es `now() < inicioProgramado - cutoffMinutes * interval
  '1 minute'`, usando `cancelCutoffMinutes` o `rescheduleCutoffMinutes` según la
  acción; la fila de política se lee con bloqueo compartido o semántica
  equivalente durante la transición.
- Una acción fuera de ventana responde `409 APPOINTMENT_WINDOW_CLOSED` y no
  genera movimientos.

### 6.12 Recordatorio PDF

`Imprimir recordatorio` no envía mensajes. Ejecuta este flujo:

1. `POST` crea de forma idempotente un `DocumentoCita` tipo
   `RECORDATORIO_CITA` con snapshot validado, versión de plantilla y checksum del
   ciphertext;
2. en la misma transacción agrega `RECORDATORIO_GENERADO` a `CitaHistorial`;
3. en esa transacción audita `REMINDER_DOCUMENT_CREATED`; si falla cifrado o la
   creación, registra `REMINDER_DOCUMENT_CREATE_FAILED` en una transacción corta
   sin conservar snapshot ni PII;
4. el resultado estable devuelve `documentId` y `resourceVersion`, nunca PII;
5. `GET .../reminder-documents/:documentId/content` autoriza nuevamente, exige
   que la cita siga `ASIGNADA`, registra `REMINDER_RENDER_REQUESTED` y genera el
   PDF desde el snapshot;
6. el servidor produce los bytes y persiste `REMINDER_RENDERED` en
   `AuditoriaRecepcion`; no agrega otro movimiento funcional a la cita;
7. el navegador permite descargar o abrir el diálogo de impresión.

Si no se puede persistir la auditoría obligatoria, no se entregan los bytes y se
responde `503 AUDIT_UNAVAILABLE`; nunca se inicia un stream antes de completar
autorización, descifrado, render y auditoría.

El PDF se renderiza en el servidor mediante un adaptador local, sin proveedor ni
llamadas de red. Incluye como mínimo institución, paciente, documento, sede,
especialidad, médico, fecha, hora, modalidad, código de cita, fecha de generación
y recomendaciones aprobadas. Se responde `application/pdf`,
`Content-Disposition: inline`, `Cache-Control: private, no-store`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`,
`Cross-Origin-Resource-Policy: same-origin`,
`Content-Security-Policy: frame-ancestors 'none'` y `X-Frame-Options: DENY`.

No se registra `RECORDATORIO_DESCARGADO` ni `RECORDATORIO_IMPRESO`: el servidor
puede demostrar que renderizó bytes, pero no que el navegador recibió la
respuesta completa ni que la impresora produjo el documento. El historial de la
cita conserva `RECORDATORIO_GENERADO`; la auditoría técnica conserva intentos,
éxitos y fallos de render.

Para evitar bloqueos de ventanas emergentes, el clic abre inmediatamente una
pestaña `about:blank`, conserva su `WindowProxy` y establece de inmediato
`popup.opener = null`; después del `POST`, reemplaza su ubicación por el `GET`
autorizado. Si `window.open` devuelve `null` o falla la creación, se cierra la
pestaña cuando aplique y se muestra recuperación en línea. Como alternativa
siempre visible se ofrece `Descargar PDF` mediante enlace seguro.

### 6.13 Integración con atención clínica

`ATENDIDA` se alcanza mediante el caso de uso interno
`markAppointmentAttended`, no mediante un botón de Recepción. Para una invocación
interna, el comando de dominio recibe `citaId`, `clinicalEncounterSource` y
`clinicalEncounterId`; la idempotencia se deriva de la identidad única del
encuentro y no de un header arbitrario del cliente. La fecha de atención proviene
del encuentro persistido, no del navegador. El actor nunca llega como dato
confiable del body: se deriva de la sesión clínica autenticada o de una identidad
de servicio verificada y se inyecta como contexto de ejecución.

En una transacción `Serializable`:

1. valida permiso clínico y correspondencia entre encuentro, paciente y cita;
2. exige cita `ASIGNADA` y encuentro no futuro;
3. actualiza condicionalmente `ASIGNADA -> ATENDIDA`;
4. conserva `CupoMedico.ASIGNADO`;
5. agrega el evento `ATENDIDA` y completa la operación idempotente.

El par `(clinicalEncounterSource, clinicalEncounterId)` es único en `Cita`. Si el
encuentro pertenece a esta base se usa FK. Si es externo, no se usa una consulta
remota seguida de una escritura vulnerable a TOCTOU. Un consumidor autenticado
persiste primero un `ClinicalEncounterInboxMessage` inmutable con el sobre
firmado ya verificado y deduplicado por `(issuer, messageId)`. El procesamiento
se registra únicamente agregando filas a `ClinicalEncounterInboxEvent`; nunca se
actualiza el mensaje recibido. La transición a `ATENDIDA`, su movimiento y el
evento inbox `PROCESSED` se confirman en la misma transacción. El módulo clínico
del mismo backend puede invocar el caso de uso directamente. No se publica una
acción en esta UI.

En la integración externa, el emisor es el principal técnico autenticado y el
sujeto clínico firmado debe mapearse a un `Empleado` interno activo con
`appointment.attend`; ese empleado se registra como actor funcional. Si no existe
un mapeo inequívoco, el mensaje se rechaza y no cambia la cita.

## 7. Historial del paciente

- Se carga después de encontrar al paciente.
- Incluye las citas del paciente en todas las sedes; cambiar la sede de atención
  no filtra ni recarga el historial por sede.
- La tabla principal presenta una fila por cita y usa `Cita.estado` como
  proyección actual. `CitaHistorial` actúa como log de todos los movimientos y
  es la fuente de trazabilidad.
- Cada cita puede exponer sus movimientos bajo demanda mediante una fila
  expandible o un diálogo compacto `Ver movimientos`; no se cargan todos los
  eventos de todas las citas en la consulta inicial.
- Los movimientos se paginan por `(createdAt DESC, id DESC)` y muestran primero
  el evento más reciente, independientemente de la sede donde ocurrió.
- Orden predeterminado: `inicioProgramado DESC, id DESC`. El cursor contiene
  ambos valores para no omitir ni duplicar filas cuando varias citas comparten
  fecha y hora.
- El filtro de estado es un combobox buscable multiselección con checkbox.
- El filtro anuncia cantidad seleccionada, permite `Limpiar filtros`, implementa
  navegación completa por teclado y expone semántica multiselección; los
  checkboxes visuales no sustituyen los roles y estados accesibles.
- Estados disponibles: Asignada, Atendida, Reprogramada y Cancelada.
- Sin selección se interpreta `Todos`.
- Se usa paginación por cursor, 20 registros por página; no se descarga todo el
  historial al navegador.
- Columnas compactas: fecha/hora, especialidad, médico, sede, modalidad, medio,
  estado y acciones.
- La tabla completa se usa únicamente desde `1280px`. Entre `768px` y `1279px`
  se usa una lista compacta con datos secundarios expandibles; por debajo de
  `768px`, cada cita es una tarjeta. No habrá scroll horizontal.
- Estado vacío: `Este paciente aún no tiene citas registradas.`
- Error: mensaje en línea con botón `Reintentar`.

Acciones por fila:

| Estado | Acciones visibles |
| --- | --- |
| Asignada sin activar | Activar cita, imprimir recordatorio PDF, cancelar cita y reprogramar |
| Asignada activada | Imprimir recordatorio PDF, cancelar cita y reprogramar |
| Atendida | Imprimir soporte de historia clínica |
| Reprogramada | Ninguna |
| Cancelada | Ninguna |

La cita activada muestra un indicador textual accesible `Activada`; no vuelve a
mostrar la acción de activación. Los iconos serán de Lucide, de trazo consistente
y sin emojis. Cada acción
iconográfica tendrá `aria-label`, tooltip, estado de foco, estado de carga y un
área interactiva mínima de 44 × 44 px. Cancelar y reprogramar requieren diálogo
de confirmación y un motivo seleccionado de catálogo. En esta entrega no se
aceptan motivos libres para evitar almacenar accidentalmente información clínica
o datos personales en el log.

El botón de soporte solo se habilita si el backend confirma que existe un
documento imprimible. La UI no construye ni supone la URL del soporte.

## 8. Estructura de la vista

```text
┌──────────────────────────────────────────────────────────────────────┐
│ RECEPCIÓN DE PACIENTES       Sede de atención: [Asignada       ▾]   │
├──────────────────────────────────────────────────────────────────────┤
│ Documento [____________________] [Buscar]                            │
├──────────────────────────────────────────────────────────────────────┤
│ Paciente: nombre · documento · edad · sexo · EPS                     │
│ Celular [____] Teléfono [____] Correo [____] Dirección [________]   │
│                                            [Guardar datos disabled]  │
├──────────────────────────────────────────────────────────────────────┤
│ Especialidad [____▾]  Fecha [calendario▾]  Médico [___________▾]    │
│ Hora disponible [08:00] [08:20] [08:40] ...                         │
│ Medio [________▾]  Modalidad [________▾]       [Agendar cita]       │
├──────────────────────────────────────────────────────────────────────┤
│ Historial de citas                         Estado [☑ Asignada ...]  │
│ Fecha │ Especialidad │ Médico │ Sede │ Estado │ Acciones            │
└──────────────────────────────────────────────────────────────────────┘
```

### 8.1 Densidad y responsive

- Usar `ModulePageLayout` con hero compacto o encabezado integrado.
- Etiquetar el selector como `Sede de atención`, no `Sede del paciente`, para
  hacer visible que el paciente pertenece al directorio global.
- Contenedor alineado al ancho del módulo; no abrir el submódulo como modal ni
  como una ventana excesivamente ancha.
- Separación basada en escala de 4/8 px y tarjetas con padding de 12–16 px.
- Campos de escritorio con anchos por contenido, no todos a `width: 100%`.
- Altura visual compacta, conservando un área interactiva mínima de 44 px.
- En escritorio, paciente y asignación usan rejillas adaptables.
- Desde `1280px`, el historial usa tabla; entre `768px` y `1279px`, lista
  compacta expandible; en móvil, una columna, un mes de calendario y tarjetas.
- Los campos de texto tienen fuente mínima de 16 px en móvil para evitar zoom
  automático; las acciones excedentes se agrupan en un menú accesible, sin
  reducir sus áreas interactivas.
- Evitar scroll interno anidado. La página tendrá un único scroll vertical.
- No usar cabeceras decorativas grandes, gradientes nuevos ni neumorfismo; se
  mantienen los tokens y superficies actuales del módulo.

## 9. Permisos propuestos

Todos requieren además `module.admisiones.access`.

| Permiso | Capacidad |
| --- | --- |
| `reception.read` | Entrar al submódulo, buscar paciente y consultar historial |
| `reception.schedule` | Asignar citas |
| `reception.patient.update` | Modificar datos de contacto del paciente |
| `reception.site.select` | Operar en una sede activa diferente a la asignada |
| `reception.appointment.activate` | Activar una cita asignada |
| `reception.appointment.reminder.print` | Generar y obtener recordatorio PDF |
| `reception.appointment.cancel` | Cancelar y liberar el cupo |
| `reception.appointment.reschedule` | Reprogramar una cita |
| `reception.clinical-support.print` | Obtener soporte de una cita atendida |

Los botones pueden ocultarse si falta permiso, pero el endpoint siempre debe
responder `403` ante acceso no autorizado. La migración asignará los permisos
operativos al perfil de Admisiones y todos al perfil Administrador; no se deben
inferir permisos por el nombre del perfil en tiempo de ejecución.

La integración clínica es la excepción a la matriz visual anterior: el caso de
uso `markAppointmentAttended` exige `appointment.attend` y alcance sobre el
encuentro clínico, pero no `module.admisiones.access`. Ese permiso no muestra un
botón en Recepción y solo se asigna al flujo/perfil clínico correspondiente y al
Administrador.

`ReceptionSitePolicy` no se edita desde esta pantalla. Su caso de uso
administrativo exige `admin.reception.policy.manage`, activa versiones de forma
atómica y registra `SITE_POLICY_ACTIVATED`; el permiso no se asigna por defecto a
Admisiones.

## 10. Modelo de datos propuesto

Los nombres definitivos pueden ajustarse a la convención Prisma, conservando
estas responsabilidades.

### 10.1 Catálogos y enums

```text
MedioSolicitudCita
  PRESENCIAL | TELEFONO | CORREO | WHATSAPP

EstadoCita
  ASIGNADA | ATENDIDA | REPROGRAMADA | CANCELADA

TipoEventoCita
  CREADA | ACTIVADA | RECORDATORIO_GENERADO
  CANCELADA | REPROGRAMADA | ATENDIDA

TipoDocumentoCita
  RECORDATORIO_CITA

TipoMotivoCambioCita
  CANCELACION | REPROGRAMACION

EstadoOperacionIdempotente
  PROCESSING | COMPLETED | FAILED

TipoEventoClinicalInbox
  RECEIVED | PROCESSED | REJECTED

TipoEventoAuditoriaRecepcion
  PATIENT_SEARCH | PATIENT_VIEWED | APPOINTMENT_HISTORY_VIEWED
  PATIENT_CONTACT_UPDATED | APPOINTMENT_CREATED
  APPOINTMENT_ACTIVATED | APPOINTMENT_CANCELLED | APPOINTMENT_RESCHEDULED
  APPOINTMENT_ATTENDED | REMINDER_DOCUMENT_CREATED
  REMINDER_DOCUMENT_CREATE_FAILED
  REMINDER_RENDER_REQUESTED | REMINDER_RENDERED | REMINDER_RENDER_FAILED
  DOCUMENT_DECRYPTION_FAILED | CLINICAL_SUPPORT_RENDER_REQUESTED
  CLINICAL_SUPPORT_RENDERED | CLINICAL_SUPPORT_RENDER_FAILED
  SITE_POLICY_ACTIVATED | ACCESS_DENIED

ResultadoAuditoriaRecepcion
  SUCCESS | DENIED | CONFLICT | FAILURE
```

`ModalidadCita` será tabla de catálogo con `codigo`, `nombre`, `estado`,
`createdAt` y `updatedAt`. `MotivoCambioCita` tendrá además `tipo` con
`CANCELACION | REPROGRAMACION` y `UNIQUE(tipo, codigo)`. Los motivos se almacenan
por tipo/código y conservan un snapshot de la etiqueta en el evento; no se acepta
texto libre en la primera entrega.

### 10.2 Cita

Campos mínimos:

- `id`;
- `usuarioId`;
- `cupoMedicoId`;
- `sedeId`, `medicoId`, `especialidadId` y `modalidadId` como referencias;
- `inicioProgramado` y `finProgramado` como `timestamptz` inmutables;
- `sedeNombre`, `medicoNombre`, `especialidadNombre` y `modalidadNombre` como
  snapshots descriptivos inmutables para conservar la lectura histórica aunque
  cambien los catálogos;
- `medioSolicitud`;
- `estado`;
- `activadaAt`, `activadaBy` opcionales;
- `citaOrigenId` opcional para reprogramación;
- `clinicalEncounterSource` y `clinicalEncounterId` textuales opcionales,
  asignados al marcar atención;
- `lockVersion` entero, iniciado en `0`;
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy`.

Índices mínimos:

- `(usuarioId, inicioProgramado DESC, id DESC)`;
- `(usuarioId, estado, inicioProgramado DESC, id DESC)`;
- `(cupoMedicoId)`;
- `(citaOrigenId)`;
- `UNIQUE(clinicalEncounterSource, clinicalEncounterId)` cuando no sean nulos;
- `UNIQUE(id, usuarioId, cupoMedicoId)` como destino de la FK compuesta del log;

Como un cupo cancelado puede asignarse posteriormente a otro paciente, no se
usará `cupoMedicoId UNIQUE` sin condición. La migración PostgreSQL añadirá un
índice único parcial que impida más de una cita ocupante para el mismo cupo en
estados `ASIGNADA` o `ATENDIDA`. Las claves foráneas de cita y log usan
`ON DELETE RESTRICT`; los registros clínico-operativos no se eliminan en cascada.

La migración añade también esta defensa final, coherente con las exclusiones que
Agenda ya usa:

```sql
ALTER TABLE citas
ADD CONSTRAINT citas_paciente_intervalo_asignado_excl
EXCLUDE USING gist (
  "usuarioId" WITH =,
  tstzrange("inicioProgramado", "finProgramado", '[)') WITH &&
)
WHERE ("estado" = 'ASIGNADA');
```

El SQL manual usa los identificadores físicos reales y entrecomillados de la
migración Prisma. El ejemplo asume columnas `camelCase`, como las actuales de
`CupoMedico`, y tabla mapeada a `citas`; si el schema define un `@map`, el SQL se
actualiza con el nombre generado, nunca con una conversión inferida a
`snake_case`. `schema.prisma` y las migraciones son la única fuente de verdad. CI
aplica la migración desde cero en una base vacía y en una copia representativa
anonimizada antes del despliegue.

La aplicación traduce la violación de esta restricción a
`PATIENT_APPOINTMENT_OVERLAP`; nunca depende únicamente de una consulta previa.
La migración agrega además
`UNIQUE(id, sedeId, medicoId, inicio, fin)` en `CupoMedico` y una FK compuesta
desde `(cupoMedicoId, sedeId, medicoId, inicioProgramado, finProgramado)` de
`Cita`. Esto impide que una escritura defectuosa atribuya a la cita otra sede,
médico u horario. Los snapshots descriptivos siguen siendo copias históricas,
pero los identificadores y tiempos quedan protegidos por la base de datos.
El repositorio no expone una actualización genérica de `Cita`: usa métodos
condicionales por transición y una allowlist de columnas. Los campos temporales y
snapshots no se modifican; reprogramar siempre crea otra cita.

### 10.3 Operación idempotente

`OperacionIdempotente` tendrá:

- `id` UUID, `idempotencyKey`, `actorEmpleadoId`, `operationType`,
  `targetResourceType` y `targetResourceId` textual opcional cuando el agregado
  todavía no existe;
- `payloadMac`, `macKeyVersion`, `status`, `ownerToken` y `leaseUntil`;
- `resultType`, `resultResourceId` textual, `resultResourceVersion`,
  `responseStatus`, `responseCode` y `errorCode` opcionales;
- `lockVersion`, `createdAt`, `updatedAt`, `completedAt` y `failedAt`.

Restricciones e índices:

- `UNIQUE(actorEmpleadoId, operationType, idempotencyKey)`;
- índice `(status, leaseUntil)` para recuperar leases vencidos;
- `payloadMac` se compara en tiempo constante y la clave HMAC nunca se almacena
  en la base de datos;
- la reclamación inicial confirma sola; posteriormente, los cambios de dominio y
  `COMPLETED` confirman en una misma transacción protegida por `ownerToken`;
- recuperar un lease usa `UPDATE ... WHERE status = 'PROCESSING' AND leaseUntil
  < now() AND lockVersion = :expectedVersion` e incrementa `lockVersion`;
- una falla determinística se registra como `FAILED` en una transacción corta;
  errores transitorios liberan o dejan expirar el lease y no se memorizan;
- registrar `FAILED` usa `UPDATE ... WHERE status = 'PROCESSING' AND ownerToken
  = :ownerToken AND lockVersion = :expectedVersion AND leaseUntil > now()` e
  incrementa `lockVersion`; cero filas significa pérdida de propiedad y obliga a
  releer, sin escribir el error;
- las operaciones relacionadas con citas se conservan con la misma retención del
  registro asistencial para mantener correlación y evitar reejecuciones tardías;
- no se guarda el body del PDF, el comando original ni datos personales.

El lease inicial será corto y configurable, con base de 30 segundos. No se
renueva con un heartbeat dentro de la transacción de negocio; los casos de uso
deben permanecer breves. Si un proceso necesita más tiempo, reclama un lease
mayor antes de iniciar y nunca mantiene una transacción abierta mientras espera.

### 10.4 Historial

`CitaHistorial` tendrá:

- `id`, `operationId`, `citaId`, `usuarioId`, `cupoMedicoId`, `tipoEvento`;
- `estadoAnterior`, `estadoNuevo` opcionales;
- `estadoCupoAnterior`, `estadoCupoNuevo` opcionales;
- `actorEmpleadoId` y `createdAt`;
- `reasonType`, `reasonCode` y `reasonLabelSnapshot` opcionales; el par
  `(reasonType, reasonCode)` es FK hacia `MotivoCambioCita(tipo, codigo)`;
- `sitePolicyId` y `policyVersion` opcionales, obligatorios solo para cancelación
  y reprogramación; `sitePolicyId` es FK `RESTRICT` y `policyVersion` conserva la
  versión aplicada;
- `metadataSchemaVersion` y `metadata` JSON limitado a identificadores y
  resultados no sensibles.

Los eventos son append-only. Corregir una cita genera otro evento; no modifica
ni elimina el historial previo. `usuarioId` y `cupoMedicoId` se derivan en el
servidor desde la cita y nunca se aceptan como autoridad desde el cliente. Se
añade el índice `(usuarioId, createdAt DESC, id DESC)` para consultar de forma
estable el log de movimientos del paciente. También se añade
`UNIQUE(operationId, citaId, tipoEvento)` para impedir que el mismo efecto se
registre dos veces por un reintento.

La integridad no depende solo del servicio: `(citaId, usuarioId, cupoMedicoId)`
es una FK compuesta hacia `Cita(id, usuarioId, cupoMedicoId)` y `operationId` es
FK `RESTRICT` hacia `OperacionIdempotente`. Así, un log no puede atribuirse a
otro paciente o cupo aunque un proceso defectuoso intente insertarlo.

`metadata` no es un objeto libre: se valida con un esquema Zod discriminado por
`tipoEvento`, tiene lista permitida de campos, máximo de 8 KB y versión explícita.
Los cambios incompatibles crean una nueva versión; nunca se reinterpretan
silenciosamente eventos históricos.

Cancelación y reprogramación persisten `reasonCode` y el snapshot de su etiqueta;
los catálogos no incluyen información del paciente.

Movimientos mínimos registrados:

- creación: `null -> ASIGNADA` y `DISPONIBLE -> ASIGNADO`;
- activación y generación de recordatorio: eventos sin cambio de estado;
- atención: `ASIGNADA -> ATENDIDA`;
- cancelación: `ASIGNADA -> CANCELADA` y `ASIGNADO -> DISPONIBLE`;
- reprogramación: cita original `ASIGNADA -> REPROGRAMADA`, cupo original
  `ASIGNADO -> DISPONIBLE` y creación de una nueva cita `ASIGNADA` sobre el
  nuevo cupo.

Una operación puede producir varios movimientos. La reprogramación escribe un
evento `REPROGRAMADA` para la cita original y un evento `CREADA` para la nueva,
ambos con el mismo `operationId`. No se impone “un movimiento por operación”; se
impone exactamente un evento por cada efecto de dominio confirmado.

La migración instala un trigger que rechaza `UPDATE` y `DELETE` sobre
`CitaHistorial` para el rol de aplicación. Solo un rol de mantenimiento separado,
auditado y no usado por el runtime puede ejecutar la política institucional de
retención. El repositorio de aplicación expone `append`, nunca `update` o
`delete`.

### 10.5 Documento de cita

`DocumentoCita` tendrá:

- `id` UUID generado antes de cifrar, `citaId`, `tipo`, `templateVersion` y
  `snapshotSchemaVersion`;
- `encryptionAlgorithm = AES_256_GCM`, `encryptionKeyId`,
  `encryptionKeyVersion`, `nonce`, `authTag` y `snapshotCiphertext`;
- `aadVersion`, `ciphertextChecksumSha256`, `createdAt` y `createdBy`;
- `operationId` de generación.

`citaId` y `operationId` son FKs `ON DELETE RESTRICT`; se agrega
`UNIQUE(operationId, tipo)` para que un replay no genere otro documento del
mismo efecto.

El snapshot canónico se valida antes de cifrarlo y contiene solo los datos
necesarios para el formato. Se protege con cifrado autenticado y gestión
institucional de claves y rotación; no se implementa criptografía propia. No
aparece en logs y se somete a la política de retención de documentos
asistenciales. El PDF se genera desde este snapshot; no depende de que los datos
maestros cambien después.

El puerto `DocumentSnapshotCipher` encapsula cifrado y descifrado. El adaptador
usa primitivas auditadas de la plataforma con nonce aleatorio de 96 bits; el AAD
incluye `documentId`, `citaId`, tipo, versión de plantilla y versión de snapshot.
Las claves provienen del gestor de secretos/KMS, nunca del repositorio, la base de
datos o un literal. Una versión anterior continúa disponible para lectura durante
la rotación. Fallar autenticación cancela el render, registra
`DOCUMENT_DECRYPTION_FAILED` sin PII y nunca devuelve contenido parcial.
Las claves de cifrado, HMAC de comandos e HMAC de IP son distintas y tienen
propósito, permisos y rotación independientes.

### 10.6 Auditoría de recepción

`AuditoriaRecepcion` se separa de `CitaHistorial`: el primero registra seguridad
y operación técnica; el segundo, hechos funcionales de la cita.

Campos mínimos:

- `id`, `requestId`, `operationId` opcional y `occurredAt`;
- `actorEmpleadoId`, `sedeId` opcional, `action` y `result`;
- `resourceType`, `resourceId` textual, `reasonCode` y `httpStatus` opcionales;
- `ipFingerprint` HMAC y `userAgentFamily` opcionales, pseudonimizados según
  política y con clave diferente a la idempotencia;
- `metadataSchemaVersion` y `metadata` sin PII, máximo 4 KB.

`sedeId` representa la sede operativa de la cita o la sede seleccionada en la
pantalla; nunca se interpreta como pertenencia del paciente. Puede ser nulo en
una búsqueda global cuando el empleado todavía no ha seleccionado sede.

Índices: `(actorEmpleadoId, occurredAt DESC)`, `(resourceType, resourceId,
occurredAt DESC)`, `(action, result, occurredAt DESC)` y `requestId`. No se
almacenan documento, teléfono, correo, dirección, body, PDF ni snapshot. Las
búsquedas exitosas registran el `usuarioId` interno. Toda proyección exitosa de
paciente agrega `PATIENT_VIEWED` y toda lectura de su historial agrega
`APPOINTMENT_HISTORY_VIEWED`, sin datos de contacto. La búsqueda registra
`PATIENT_SEARCH` con su resultado; si no encuentra paciente, no guarda el
documento, su hash ni otra huella reversible. Cuando `operationId` exista será FK
`ON DELETE RESTRICT`.

La tabla es append-only con la misma protección de rol/trigger del historial,
retención explícita y acceso mediante `admin.auditoria.read`. Fallar al escribir
un evento de acceso obligatorio impide entregar paciente o historial y responde
`503 AUDIT_UNAVAILABLE`; fallar un evento de seguridad crítico impide confirmar
la mutación. Telemetría técnica no crítica puede usar un sink separado sin
bloquear el flujo clínico. Conflictos
que provoquen rollback se auditan en una transacción corta posterior, porque no
pueden sobrevivir dentro de la transacción fallida.

### 10.7 Integridad adicional

- `Usuario` incorpora `contactVersion INT NOT NULL DEFAULT 0`. Un trigger `BEFORE
  UPDATE` la incrementa solo cuando cambian celular, teléfono, correo o dirección;
  todos los escritores existentes quedan cubiertos sin depender de que recuerden
  incrementar la versión desde Prisma.
  El trigger compara valores con `IS DISTINCT FROM`, asigna siempre
  `NEW.contactVersion = OLD.contactVersion + 1` ante cambio de contacto y conserva
  `OLD.contactVersion` en los demás casos; ningún cliente puede fijar la versión.
- Una restricción parcial única impide más de un evento `ACTIVADA` por cita,
  independientemente de la clave idempotente utilizada:
  `UNIQUE(citaId) WHERE tipoEvento = 'ACTIVADA'`.
- Los campos duplicados de `CitaHistorial` se calculan en servidor y mantienen
  FK compuesta y claves foráneas `RESTRICT`; nunca se aceptan desde el cliente.
- Restricciones `CHECK` validan que `finProgramado > inicioProgramado` y que la
  longitud de snapshots de catálogo y metadata permanezca dentro de sus límites.
- Un `CHECK` exhaustivo sobre `tipoEvento` exige: `CANCELADA` implica
  `reasonType = CANCELACION` y código, snapshot de etiqueta, `sitePolicyId` y
  `policyVersion` no nulos; `REPROGRAMADA` implica
  `reasonType = REPROGRAMACION` y esos mismos campos no nulos; cualquier otro
  evento exige los cinco campos nulos. La FK
  compuesta hacia `MotivoCambioCita(tipo, codigo)` usa `ON DELETE RESTRICT`.
- La migración crea índices concurrentemente cuando el volumen y la estrategia
  de despliegue lo requieran, con verificación previa de datos incompatibles.
- Para disponibilidad se añade un índice parcial sobre
  `CupoMedico(sedeId, inicio, medicoId) WHERE estado = 'DISPONIBLE'` y otro sobre
  `(medicoId, inicio) WHERE estado = 'DISPONIBLE'`; su utilidad se valida con
  `EXPLAIN (ANALYZE, BUFFERS)` sobre volúmenes representativos.

La migración instala un `CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED` sobre
`Cita` y `CupoMedico` para validar al confirmar la transacción:

- toda cita `ASIGNADA` o `ATENDIDA` referencia un cupo `ASIGNADO`;
- todo cupo `ASIGNADO` tiene exactamente una cita vigente `ASIGNADA` o
  `ATENDIDA`;
- un cupo `DISPONIBLE` o `CANCELADO` no tiene una cita vigente.

`RESERVADO` puede existir temporalmente sin cita y no se sobre-restringe. Todos
los casos de uso actualizan cita y cupo en la misma transacción; el trigger
diferido permite el estado intermedio, pero impide confirmarlo. El despliegue
ejecuta primero una consulta de reconciliación y publica una métrica periódica de
inconsistencias; cualquier hallazgo bloquea la migración o genera alerta crítica.

### 10.8 Inbox clínico externo

`ClinicalEncounterInboxMessage` representa el hecho recibido y es inmutable:

- `id`, `issuer`, `messageId`, `subject`, `citaIdEsperada` y
  `usuarioIdEsperado`;
- `clinicalEncounterSource`, `clinicalEncounterId` y `encounterOccurredAt`;
- `evidenceDigest`, `signatureKeyId`, `signatureAlgorithm`, `receivedAt` y
  `receivedByPrincipalId`;
- `UNIQUE(issuer, messageId)` y `UNIQUE(issuer, clinicalEncounterSource,
  clinicalEncounterId)` cuando el contrato del emisor lo garantice.

No almacena contenido clínico ni tiene `processedAt`, resultado u otra columna
mutable. Un trigger y los privilegios del rol de aplicación rechazan `UPDATE` y
`DELETE`.

`ClinicalEncounterInboxEvent` es el log append-only del procesamiento:

- `id`, `messageId` como FK `RESTRICT`, `sequence`, `tipoEvento`, `occurredAt`;
- `operationId` opcional, `resultCode`, `reasonCode` y metadata no sensible
  validada por versión;
- `UNIQUE(messageId, sequence)` y un índice parcial único que permite como máximo
  un evento `RECEIVED` y otro índice parcial que permite como máximo un evento
  terminal `PROCESSED` o `REJECTED` por mensaje.

La recepción agrega `RECEIVED`. El consumidor bloquea el mensaje, comprueba que
no tenga evento terminal y, en una transacción `Serializable`, agrega
`PROCESSED` junto con `Cita ASIGNADA -> ATENDIDA`, `CitaHistorial.ATENDIDA` y la
operación idempotente derivada de `(issuer, messageId)`. Una evidencia inválida o
un mapeo no inequívoco agrega `REJECTED` sin cambiar la cita. Los reintentos leen
el evento terminal y devuelven el mismo resultado.

### 10.9 Política operativa por sede

`ReceptionSitePolicy` tendrá:

- `id`, `sedeId`, `version`, `active`;
- `cancelCutoffMinutes` y `rescheduleCutoffMinutes`;
- `createdAt`, `createdBy`, `activatedAt` y `activatedBy`.

Se aplica `UNIQUE(sedeId, version)`, un índice único parcial
`UNIQUE(sedeId) WHERE active`, FK `RESTRICT` a sede y `CHECK` de ambos cortes
entre `0` y `43200` minutos. Activar una versión nueva desactiva la anterior y
activa la nueva en una transacción administrativa auditada. El seed crea versión
`1` activa con ambos valores en `0` para cada sede activa; crear una sede exige
crear su política en la misma operación. La cita no copia la política: el evento
de cancelación o reprogramación conserva `sitePolicyId + policyVersion`. Un
trigger valida que la política referenciada pertenezca a la sede de la cita y
que su versión coincida con el snapshot. Un `CONSTRAINT TRIGGER DEFERRABLE
INITIALLY DEFERRED` sobre sede y política exige exactamente una versión activa
por sede activa al confirmar; permite el reemplazo atómico, pero no una sede
operativa sin política.

## 11. Contratos HTTP propuestos

| Método y ruta | Responsabilidad |
| --- | --- |
| `GET /api/reception/context` | Sede predeterminada, sedes permitidas y capacidades |
| `POST /api/reception/patients/search` | Búsqueda exacta; documento únicamente en el body |
| `GET /api/reception/patients/:id` | Refrescar proyección autorizada por identificador interno |
| `PATCH /api/reception/patients/:id/contact` | Actualizar contacto con `expectedContactVersion` |
| `GET /api/reception/specialties?siteId=` | Especialidades con disponibilidad |
| `GET /api/reception/availability/dates` | Días disponibles en la ventana visible |
| `GET /api/reception/doctors` | Médicos por sede, especialidad y fecha |
| `GET /api/reception/slots` | Cupos disponibles por médico y fecha |
| `GET /api/reception/modalities` | Modalidades activas |
| `GET /api/reception/appointment-reasons?type=` | Motivos activos de cancelación o reprogramación |
| `POST /api/reception/appointments` | Asignar cita de forma idempotente |
| `GET /api/reception/patients/:id/appointments` | Historial filtrado y paginado |
| `POST /api/reception/appointments/:id/activate` | Activar cita |
| `POST /api/reception/appointments/:id/reminder-documents` | Crear snapshot del recordatorio PDF |
| `GET /api/reception/appointments/:id/reminder-documents/:documentId/content` | Renderizar PDF autorizado y auditar resultado técnico |
| `POST /api/reception/appointments/:id/cancel` | Cancelar y liberar cupo |
| `POST /api/reception/appointments/:id/reschedule` | Reprogramar transaccionalmente |
| `GET /api/reception/appointments/:id/movements` | Log paginado de movimientos de la cita |
| `GET /api/reception/appointments/:id/clinical-support/content` | Renderizar soporte autorizado y auditar resultado técnico |

Todos los errores usan una envoltura consistente:

```ts
type ApiError = {
  ok: false;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  requestId: string;
};

type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId: string;
  meta?: {
    nextCursor?: string | null;
  };
};
```

Códigos relevantes: `PATIENT_NOT_FOUND`, `AMBIGUOUS_DOCUMENT`,
`SITE_FORBIDDEN`, `SLOT_NOT_AVAILABLE`, `INVALID_TRANSITION`,
`STALE_CONTACT_VERSION`, `STALE_APPOINTMENT_VERSION`,
`APPOINTMENT_ALREADY_ACTIVATED`, `APPOINTMENT_WINDOW_CLOSED`,
`IDEMPOTENCY_KEY_REUSED`,
`OPERATION_IN_PROGRESS`, `PATIENT_APPOINTMENT_OVERLAP`,
`REMINDER_DOCUMENT_NOT_RENDERABLE`, `DOCUMENT_DECRYPTION_FAILED`,
`PDF_GENERATION_FAILED` y `RATE_LIMITED`.
También `AUDIT_UNAVAILABLE` y `RATE_LIMIT_UNAVAILABLE` para dependencias críticas.

Reglas del contrato:

- agendar, actualizar contacto, activar, generar documento, cancelar y
  reprogramar reciben `Idempotency-Key` UUID y comandos Zod; marcar atención usa
  una clave derivada en servidor de la evidencia clínica. Búsqueda y render de
  contenido son lecturas y no reclaman operación idempotente;
- creación responde `201`; un replay conserva el status almacenado y agrega
  `Idempotency-Replayed: true`. Consultas responden `200`, conflicto `409`, falta
  de permiso `403`, validación `422` y límite `429`;
- paciente, historial y PDF responden `Cache-Control: private, no-store`;
- los endpoints PDF son la excepción binaria a `ApiSuccess<T>`: retornan
  `application/pdf`, pero conservan `X-Request-Id` y la misma envoltura de error;
- toda ruta JSON exige `Content-Type: application/json`, limita bytes antes de
  deserializar y rechaza JSON inválido o profundo con error estable. Búsqueda usa
  máximo 16 KB y limita el documento al tamaño soportado por
  `Usuario.identificacion`; no admite búsquedas parciales;
- disponibilidad acepta como máximo 62 días por solicitud;
- historial acepta `pageSize` entre 1 y 50, por defecto 20, hasta cuatro estados
  conocidos y cursor opaco firmado o validado por esquema;
- todos los identificadores, fechas, enums y límites se rechazan por allowlist;
- el cliente cancela solicitudes obsoletas mediante `AbortSignal`;
- paciente, contacto e historial aplican autenticación y permiso sobre el
  directorio institucional global, sin filtrar por `Usuario.idSede`;
- disponibilidad y mutaciones de cita aplican además alcance de la sede derivada
  del cupo; cada documento se valida contra su cita y cada cita contra su
  paciente. La UI nunca es la barrera de seguridad.
- el contenido de un recordatorio solo se renderiza mientras su cita sea
  `ASIGNADA`; una cita `REPROGRAMADA`, `CANCELADA` o `ATENDIDA` conserva el
  snapshot histórico, pero responde `409 REMINDER_DOCUMENT_NOT_RENDERABLE`;
- todas las rutas pasan por el adaptador HTTP común descrito en 11.4; ninguna
  implementa manualmente una variante de autenticación, errores o headers.

### 11.1 Contratos tipados mínimos

Los esquemas Zod son la fuente de verdad y generan OpenAPI y tipos TypeScript;
no se mantienen tres definiciones manuales. DTO mínimos:

```ts
type PatientSearchCommand = {
  documentNumber: string;
  documentType?: string;
};

type UpdatePatientContactCommand = {
  expectedContactVersion: number;
  celular?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
};

type ScheduleAppointmentCommand = {
  patientId: number;
  specialtyId: number;
  slotId: number;
  requestMedium: MedioSolicitudCita;
  modalityId: number;
};

type RescheduleAppointmentCommand = {
  expectedVersion: number;
  newSlotId: number;
  reasonCode: string;
};

type CancelAppointmentCommand = {
  expectedVersion: number;
  reasonCode: string;
};

type MutationAck<TId extends string | number = number> = {
  operationId: string;
  resultType: string;
  resourceId: TId;
  resourceVersion: number;
  replayed: boolean;
};

type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
```

Los límites de texto provienen del esquema real de Prisma y se reutilizan en Zod.
Cada comando usa `.strict()` para rechazar campos desconocidos. El contrato
OpenAPI documenta ejemplos de éxito, validación, conflicto, permiso, rate limit e
idempotent replay.

`siteId`, `doctorId`, inicio y fin no se aceptan como autoridad al agendar: se
derivan de `slotId`. `specialtyId` sí forma parte de la intención porque un médico
puede tener varias especialidades, pero el servidor comprueba que esté activa y
asociada al médico del cupo. Los identificadores derivados se incluyen en la
respuesta de proyección, no como datos redundantes del comando.

Reprogramar tampoco acepta paciente, especialidad, modalidad ni medio de
solicitud: los conserva de la cita original y deriva sede, médico e intervalo de
`newSlotId`. Si el usuario necesita cambiar especialidad o modalidad, el cliente
lo guía por cancelación y nueva asignación; el servidor rechaza campos extra por
el `.strict()` del comando.

Se seleccionará un generador OpenAPI compatible con la versión fijada de Zod. La
salida se genera en CI desde los esquemas, se compara con el contrato versionado y
el build falla ante drift. También se generan y prueban esquemas de respuesta,
errores y cursores; no solo los comandos de entrada.

### 11.2 Límite de búsquedas

Como no existe Redis en la arquitectura actual, la primera implementación usa un
contador PostgreSQL atómico compartido por todas las instancias, sin incluir el
documento ni la sede en la clave de búsqueda. Política inicial configurable:

- 30 búsquedas por minuto por `actorEmpleadoId` en todo el directorio;
- máximo adicional de 120 por cinco minutos por actor;
- techo institucional configurable para proteger la base de datos sin reducir la
  cuota legítima de un actor al cambiar la sede de atención;
- respuesta `429 RATE_LIMITED` con `Retry-After` y `X-RateLimit-Reset`;
- expiración periódica de ventanas sin registrar valores buscados;
- accesos denegados o patrones anómalos generan `AuditoriaRecepcion`.

Las ventanas se actualizan en una transacción con `INSERT ... ON CONFLICT DO
UPDATE` condicional; no se hace `SELECT` seguido de `UPDATE`. El contador usa
`(scopeType, scopeId, windowType, windowStart)`: `ACTOR` identifica al empleado e
`INSTITUTION` usa un identificador fijo no sensible. Si cualquier ventana rechaza
el incremento, toda la transacción de cuota revierte antes de ejecutar la
búsqueda. Un job elimina ventanas vencidas por lotes.

El limitador falla cerrado: si no puede comprobar la cuota responde
`503 RATE_LIMIT_UNAVAILABLE` y genera alerta operativa; nunca convierte un error
técnico en `PATIENT_NOT_FOUND` ni permite una búsqueda sin control.

### 11.3 Presupuesto del PDF

El endpoint de contenido declara runtime Node.js y reutiliza
`@react-pdf/renderer` o `pdf-lib`, ya instalados. El recordatorio es de una página,
tamaño Carta, idioma/metadatos `es-CO`, máximo 2 MB y timeout de render de cinco
segundos. Fuentes y logo se cargan desde assets locales versionados; no se hacen
solicitudes de red. Superar un límite responde `503 PDF_GENERATION_FAILED`, se
audita sin PII y ofrece reintento.

### 11.4 Adaptador HTTP común

`withReceptionApi` envuelve cada route handler y es el único punto que traduce
excepciones de aplicación a `ApiError`. Reutiliza los guards institucionales y
centraliza:

- sesión, RBAC y contexto de sede; `requestId` validado o generado y
  `X-Request-Id` en toda respuesta;
- validación de `Origin`, Fetch Metadata y CSRF para mutaciones y `POST`
  sensibles, incluida la búsqueda;
- allowlist de métodos y `Content-Type`, lectura acotada del body antes de
  `JSON.parse`, validación Zod y rechazo de payloads desconocidos;
- mapeo exhaustivo de errores tipados a status/código sin filtrar stack, SQL,
  rutas ni PII;
- `Cache-Control`, headers de seguridad y auditoría de accesos denegados;
- límite de tamaño de respuesta y cancelación mediante `AbortSignal` cuando el
  caso de uso lo permita.

Los handlers solo declaran permiso, esquema, límite y caso de uso. El adaptador
no contiene reglas de citas ni consultas Prisma. Los endpoints binarios reutilizan
la misma preautorización y envoltura de error, y agregan los headers PDF definidos
en 6.12 antes de entregar bytes.

## 12. Arquitectura de archivos objetivo

```text
src/
├── app/
│   ├── admisiones/recepcion-pacientes/page.tsx
│   └── api/reception/
│       ├── context/route.ts
│       ├── patients/search/route.ts
│       ├── patients/[id]/route.ts
│       ├── patients/[id]/appointments/route.ts
│       ├── patients/[id]/contact/route.ts
│       ├── specialties/route.ts
│       ├── availability/dates/route.ts
│       ├── doctors/route.ts
│       ├── slots/route.ts
│       ├── modalities/route.ts
│       ├── appointment-reasons/route.ts
│       └── appointments/.../route.ts
├── lib/
│   ├── module-navigation.ts
│   ├── admin/permisos.ts
│   └── http/
│       ├── with-reception-api.ts
│       └── bounded-json-body.ts
└── features/reception/
    ├── domain/
    │   ├── appointment.ts
    │   ├── appointment-transitions.ts
    │   ├── schemas.ts
    │   └── types.ts
    ├── application/
    │   ├── patient-directory-policy.ts
    │   ├── appointment-site-scope.ts
    │   ├── reception-site-policy.ts
    │   ├── find-patient-by-document.ts
    │   ├── update-patient-contact.ts
    │   ├── availability-service.ts
    │   ├── schedule-appointment.ts
    │   ├── cancel-appointment.ts
    │   ├── reschedule-appointment.ts
    │   ├── mark-appointment-attended.ts
    │   ├── consume-clinical-encounter-completion.ts
    │   ├── appointment-idempotency.ts
    │   ├── reception-audit-service.ts
    │   └── reminder-document-service.ts
    ├── infrastructure/
    │   ├── appointment-repository.ts
    │   ├── availability-repository.ts
    │   ├── idempotency-repository.ts
    │   ├── reception-audit-repository.ts
    │   ├── reception-site-policy-repository.ts
    │   ├── postgres-search-rate-limiter.ts
    │   ├── command-mac.ts
    │   ├── document-snapshot-cipher.ts
    │   ├── clinical-inbox-message-repository.ts
    │   ├── clinical-inbox-event-repository.ts
    │   └── pdf-renderer.ts
    └── presentation/
        ├── PatientReceptionPage.tsx
        ├── PatientSearch.tsx
        ├── PatientSummaryForm.tsx
        ├── AppointmentComposer.tsx
        ├── SingleDateAvailabilityPicker.tsx
        ├── AvailableTimeSlots.tsx
        ├── AppointmentHistory.tsx
        ├── AppointmentStatusFilter.tsx
        ├── AppointmentActions.tsx
        ├── appointment-form-reducer.ts
        ├── api-client.ts
        ├── usePatientSearch.ts
        ├── usePatientContact.ts
        ├── useAppointmentComposer.ts
        ├── useAppointmentHistory.ts
        └── usePatientReceptionController.ts

prisma/
├── migrations/..._patient_reception/
└── seed-rbac.ts
```

Límites obligatorios:

- `PatientReceptionPage` compone secciones; no contiene todas las llamadas y
  reglas en un único archivo.
- `usePatientReceptionController` es un orquestador delgado que compone los hooks
  de búsqueda, contacto, asignación e historial; no concentra todas las consultas
  y mutaciones, no retorna JSX y no conoce clases CSS.
- `appointment-form-reducer` implementa transiciones puras y limpieza de campos
  dependientes.
- `availability-service` es la única capa que traduce agenda/cupos a opciones de
  recepción.
- `patient-directory-policy` autoriza búsqueda, lectura, contacto e historial a
  nivel institucional y nunca recibe `siteId`; `appointment-site-scope` valida la
  sede del cupo para disponibilidad y mutaciones. No existe un filtro genérico
  que pueda aplicar accidentalmente `Usuario.idSede` al paciente.
- Los servicios de mutación reciben comandos tipados y se prueban sin React.
- No se duplican DTO Prisma en componentes; se mapean a DTO de presentación.
- Validación Zod compartida para el contrato, y validación definitiva en dominio.
- `pdf-renderer` solo transforma un snapshot validado en bytes; no consulta la
  base de datos, no autoriza y no modifica estados.
- `document-snapshot-cipher` implementa el puerto de cifrado con claves externas;
  dominio y presentación nunca conocen nonces, tags o material de clave.
- `appointment-idempotency` es el único coordinador de leases, HMAC y replay; los
  casos de uso no reimplementan ese protocolo.
- `reception-audit-service` recibe eventos tipados y aplica allowlist de metadata;
  no se llama directamente a Prisma desde rutas o componentes.
- los repositorios de inbox separan el mensaje clínico inmutable de su log de
  procesamiento; exponen `insertMessage` y `appendEvent`, nunca `update`, y
  ningún componente ni ruta de Recepción recibe un actor clínico declarado por
  el cliente.
- `reception-site-policy` obtiene la versión activa dentro de la transacción; no
  usa configuración ambiental como fallback ni confía en la disponibilidad de
  acciones calculada por el navegador.
- La migración, `seed-rbac.ts`, `module-navigation.ts`, el catálogo administrativo
  de permisos y sus pruebas se actualizan en la misma entrega.
- `module-navigation.ts` agrega Recepción bajo Admisiones con
  `requiredAbility: reception.read`; `admin/permisos.ts` incorpora metadata y
  orden explícito para los grupos `reception` y `appointment`.
- `seed-rbac.ts` asigna permisos operativos de recepción a Admisiones,
  `appointment.attend` únicamente al perfil clínico definido y todos al
  Administrador; las pruebas verifican que un permiso clínico no habilite la UI
  de Recepción.
- Las rutas usan `withReceptionApi`, que compone el guard central de Admisiones,
  y no duplican sesión, permisos, alcance de sede, parseo acotado, protección de
  origen, `requestId`, errores ni headers.

Pruebas mínimas de archivos e integración:

```text
src/features/reception/**/*.test.ts
src/features/reception/**/*.integration.test.ts
src/app/api/reception/**/*.route.test.ts
src/lib/module-navigation.test.ts
e2e/patient-reception/*.spec.ts
```

## 13. Rendimiento, accesibilidad y experiencia

- Consultas de disponibilidad con React Query y claves que incluyan sede,
  especialidad, fecha y médico según corresponda.
- Cancelar solicitudes obsoletas al cambiar filtros.
- `staleTime` corto para fechas y cupos; la reserva siempre se confirma en
  servidor.
- Las claves de disponibilidad incluyen toda dependencia: sede, especialidad,
  ventana de fechas, médico y zona horaria. Paciente e historial usan claves por
  identificador interno, `staleTime: 0`, `gcTime: 0` y no se persisten.
- La búsqueda por documento se ejecuta como mutación controlada y no crea una
  query key que contenga el documento.
- Skeleton reservado para cargas mayores a 300 ms, evitando saltos de layout.
- Paginación por cursor del historial y virtualización solo si la evidencia de
  volumen lo requiere.
- Etiqueta visible para cada campo; el placeholder no sustituye la etiqueta.
- Navegación completa por teclado y orden de foco igual al orden visual.
- Errores cerca del campo y resumen enfocable si existen varios.
- Existe una sola región viva por resultado. Los toasts generales usan
  `aria-live="polite"`, duran 3–5 segundos y no roban foco; cuando un resultado
  ya se anuncia en línea, como `Paciente no encontrado`, su toast es solo visual,
  lleva `aria-hidden="true"` y no publica el mismo texto en la región global.
- Contraste WCAG AA y foco visible.
- No transmitir significado solo mediante verde, rojo o ámbar.
- Respetar `prefers-reduced-motion`.
- Iconos con tooltip accesible y acciones destructivas claramente diferenciadas.
- El clic de impresión abre primero una pestaña segura y luego la dirige al
  endpoint `GET` del PDF; cualquier bloqueo ofrece `Descargar PDF` como
  alternativa y el botón anuncia `Generando recordatorio…`.
- El nombre de archivo se construye con identificadores internos, se sanitiza y
  la respuesta agrega `X-Content-Type-Options: nosniff`; nunca incluye el número
  de documento en `Content-Disposition`.
- El menú de acciones en tablet mantiene `aria-expanded`, foco administrado,
  Escape para cerrar y objetivos de 44 × 44 px.
- Los diálogos de cancelación y reprogramación presentan un combobox de motivos
  activos, error junto al campo y resumen enfocable; no incluyen un textarea de
  motivo libre.
- El resultado `Paciente no encontrado` permanece en línea hasta una nueva
  búsqueda o edición del documento, además del toast solicitado.

## 14. Auditoría

Registrar como mínimo:

- toda búsqueda de paciente con resultado, sin documento ni huella reversible;
- toda proyección exitosa del paciente y toda consulta de su historial, usando
  únicamente `usuarioId` interno como recurso;
- actualización de contacto con campos modificados, no valores completos;
- creación, activación, generación del recordatorio PDF, cancelación y
  reprogramación de cita;
- activación administrativa de una versión de política por sede;
- intento fallido por conflicto de cupo;
- render exitoso o fallido de recordatorio y soporte clínico;
- actor, sede operativa, paciente, cita, cupo, fecha y resultado.

No registrar el documento completo del paciente, el contenido del PDF, snapshots
de documentos ni datos clínicos en logs o `metadata` del historial. El
`requestId`, `operationId` y `documentId` permiten correlación sin exponer PII.

`CitaHistorial` no sustituye esta auditoría: conserva hechos funcionales y se
muestra al usuario autorizado; `AuditoriaRecepcion` conserva seguridad, accesos y
resultados técnicos y solo se consulta desde el flujo administrativo autorizado.

## 15. Estrategia de pruebas

### 15.1 Dominio

- Matriz completa de transiciones permitidas y rechazadas.
- Limpieza de dependencias al cambiar sede, especialidad, fecha o médico.
- Normalización de documento y datos de contacto.
- Interpretación de fechas en `America/Bogota`.
- La sede del paciente nunca participa en la política de búsqueda o asignación;
  la sede operativa siempre se deriva del cupo.
- Reprogramar conserva paciente, especialidad, modalidad y medio de solicitud;
  el nuevo cupo determina sede, médico e intervalo. Cambiar especialidad o
  modalidad exige cancelar y crear una asignación nueva.
- Los cortes por sede se evalúan con hora de base de datos y la versión activa de
  `ReceptionSitePolicy`.

### 15.2 Integración

- Dos solicitudes concurrentes por el mismo cupo: solo una confirma.
- Dos cupos diferentes con horarios superpuestos para el mismo paciente: la
  exclusión PostgreSQL confirma solo uno; intervalos adyacentes sí son válidos.
- Reintento con la misma clave y payload devuelve el mismo resultado; la misma
  clave con payload diferente responde `409 IDEMPOTENCY_KEY_REUSED`.
- El HMAC es estable para comandos canónicamente equivalentes y cambia ante una
  modificación semántica; nunca se persiste el comando ni la clave HMAC.
- Lease vigente responde `OPERATION_IN_PROGRESS`; lease vencido tiene un solo
  nuevo propietario y el propietario anterior no puede confirmar.
- El propietario anterior tampoco puede escribir `FAILED` después de un takeover;
  el compare-and-set afecta cero filas y conserva el resultado del nuevo dueño.
- Un replay devuelve el mismo `resourceId` y `resourceVersion`, aunque la
  proyección actual del recurso haya cambiado después.
- Agendar, actualizar contacto, activar, generar PDF, cancelar y reprogramar son
  idempotentes ante doble envío y timeout del cliente.
- Reprogramación exitosa actualiza cita original, nueva cita y ambos cupos.
- La nueva cita reprogramada conserva especialidad, modalidad y medio, toma
  sede/médico/tiempos del nuevo cupo e inicia con activación nula. Un médico no
  habilitado para esa especialidad o una modalidad incompatible abortan todo.
- Conflicto al reprogramar no altera la cita original.
- El recordatorio anterior permanece almacenado, pero no puede volver a
  renderizarse después de reprogramar; la cita nueva requiere otro documento.
- Cancelación deja la cita `CANCELADA`, conserva el movimiento en el log y
  devuelve el cupo a `DISPONIBLE`.
- Cada efecto de dominio confirmado agrega exactamente un evento append-only.
  Reprogramar agrega dos eventos correlacionados por el mismo `operationId` y un
  reintento no los duplica.
- Generar el recordatorio crea snapshot y evento en una transacción; el PDF
  conserva sus datos aunque cambien después los catálogos o el paciente.
- Un error de render no crea un movimiento funcional; un render exitoso agrega
  `REMINDER_RENDERED` solo a auditoría y devuelve un PDF válido con headers
  privados y sin caché.
- Si falla la auditoría obligatoria, el endpoint no inicia el stream y responde
  `503 AUDIT_UNAVAILABLE`.
- Una transacción fallida no deja cambios parciales en `Cita`, `CupoMedico` ni
  `CitaHistorial`.
- El constraint trigger diferido acepta estados intermedios dentro de la
  transacción y rechaza al commit toda discordancia cita-cupo; la reconciliación
  previa al despliegue devuelve cero inconsistencias.
- Usuario sin `reception.site.select` no consulta ni agenda en otra sede.
- El mismo usuario sí puede buscar un paciente cuyo `Usuario.idSede` sea otra
  sede o sea nulo, consultar su historial global y agendarlo en su propia sede.
- Con `reception.site.select`, el usuario puede conservar ese paciente y
  agendarlo en cualquier otra sede activa autorizada.
- El historial devuelve las citas del paciente de todas las sedes y permanece
  igual al cambiar únicamente la sede de atención seleccionada.
- Acceso directo por `patientId` aplica los mismos permisos que la búsqueda y no
  introduce filtros accidentales por `Usuario.idSede`.
- Médico de otra sede o especialidad es rechazado aunque se manipule el payload.
- El comando de asignación rechaza campos desconocidos como `siteId`, `doctorId`,
  inicio o fin; sede, médico e intervalo se derivan del cupo dentro del servidor.
- Actualización concurrente del paciente devuelve `409`.
- Un escritor existente que modifique contacto sin conocer `contactVersion`
  dispara el trigger; una edición de Recepción con la versión anterior responde
  `STALE_CONTACT_VERSION`. Cambios no relacionados no incrementan esa versión.
- Búsqueda por documento no expone el valor en URL, logs ni claves persistidas de
  caché y aplica límite de frecuencia.
- Buscar, refrescar paciente y consultar historial generan los eventos de
  auditoría obligatorios; una búsqueda inexistente no almacena documento, hash ni
  fingerprint del valor buscado.
- Si la auditoría de acceso no está disponible, paciente e historial no se
  entregan y responden `503 AUDIT_UNAVAILABLE`.
- Todas las mutaciones y el `POST` de búsqueda rechazan origen no confiable;
  `withReceptionApi` aplica de forma uniforme permiso, `requestId`, body acotado,
  content type, errores y headers.
- La migración conserva citas canceladas cuando su cupo vuelve a utilizarse.
- Marcar atención vincula un único encuentro clínico, registra `ATENDIDA` una vez
  y conserva el cupo `ASIGNADO`; un encuentro futuro o ajeno es rechazado.
- El body no puede suplantar al actor clínico. Un evento externo repetido se
  consume una vez por `(issuer, messageId)`; el mensaje recibido nunca se
  actualiza y el procesamiento solo agrega eventos. Evidencia discordante, emisor
  no autorizado o cambio posterior agrega `REJECTED` y no genera transición.
- `PROCESSED`, la transición a `ATENDIDA` y el movimiento se confirman
  atómicamente; no puede existir un evento procesado sin la cita atendida ni a la
  inversa.
- Activar con dos claves idempotentes diferentes crea un solo evento y conserva
  el primer `activadaAt`; la segunda operación responde
  `APPOINTMENT_ALREADY_ACTIVATED`.
- Alterar ciphertext, nonce, tag o AAD impide descifrar; una clave rotada continúa
  leyendo documentos de versiones anteriores durante la retención.
- La FK compuesta impide atribuir un movimiento a otro paciente o cupo.
- La FK compuesta entre `Cita` y `CupoMedico` impide guardar sede, médico o
  intervalo discordantes.
- El `CHECK` de motivos rechaza razones en eventos distintos de cancelación o
  reprogramación y exige tipo, código, snapshot y versión de política en ambos.
- El rol de aplicación no puede actualizar ni eliminar historial o auditoría.
- El rate limiter es compartido entre instancias, retorna `Retry-After` y nunca
  almacena el documento buscado; cambiar de sede no reinicia ni multiplica la
  cuota global del actor.
- Auditoría cubre creación y fallos del documento, además de solicitud, éxito y
  fallo de render del soporte clínico.
- Los contratos OpenAPI generados en CI coinciden con request, response y errores
  de las rutas implementadas.
- Las migraciones se ejecutan desde cero y sobre una base representativa usando
  los nombres físicos reales de Prisma; la exclusión de solapamiento se crea y se
  viola en una prueba controlada.

### 15.3 Componentes e interacción

- Enter y botón ejecutan la misma búsqueda una sola vez.
- Paciente inexistente muestra el texto exacto y limpia datos anteriores.
- Paciente inexistente conserva un mensaje en línea accesible y el toast visual;
  una prueba de lector de pantalla verifica un único anuncio, no dos.
- Error técnico no se presenta como inexistencia.
- `Guardar datos` refleja `pristine`, `dirty`, reversión, error y éxito.
- Calendario muestra dos meses en escritorio, uno en móvil y selecciona una fecha.
- Cambio de campo superior limpia los dependientes.
- El filtro multiselección combina estados correctamente.
- El filtro permite limpiar, anuncia selección y funciona con teclado sin
  depender de los checkboxes visuales.
- Acciones visibles dependen de estado y permiso.
- Diálogos restauran el foco al cerrarse.
- El recordatorio muestra estado de generación, abre el PDF o permite descargarlo
  si el navegador bloquea la nueva pestaña.
- Las rutas PDF incluyen CSP `frame-ancestors 'none'`, CORP `same-origin`,
  `X-Frame-Options: DENY`, `nosniff`, no-referrer y no-store.

### 15.4 Accesibilidad y responsive

- Teclado y lector de pantalla en búsqueda, calendario, combobox y acciones.
- Contraste, foco, `aria-label`, `aria-live` y objetivos de 44 × 44 px.
- Validación manual en 320, 375, 768, 1024 y 1440 px.
- Validación adicional en orientación horizontal para móvil y tablet, con zoom y
  tamaño de texto aumentado.
- Sin scroll horizontal ni contenido cubierto por acciones fijas.
- Tabla desde 1280 px, lista expandible en tablet y tarjetas en móvil.
- Zoom al 200 % sin pérdida de funcionalidad.
- El flujo de impresión funciona con popup permitido y bloqueado, conserva foco
  recuperable y ofrece descarga mediante teclado.
- Pruebas automatizadas E2E cubren RBAC, paciente global, cambio de sede,
  asignación, activación, cancelación, reprogramación y PDF; axe no reporta
  violaciones críticas o serias en los estados principales.
- Una prueba de carga concurrente valida reclamación de cupos, latencia de
  disponibilidad y rate limiting con varias instancias.

## 16. Criterios de aceptación

1. Un usuario autorizado entra desde Admisiones a `Recepción de Pacientes`.
2. La sede de atención asignada aparece por defecto; solo quien tiene permiso
   puede cambiarla.
3. Buscar un documento exacto con Enter o `Buscar` muestra un único paciente del
   directorio institucional, sin filtrar por `Usuario.idSede`.
4. Un documento inexistente muestra el toast definido y no conserva datos de una
   búsqueda anterior.
5. Editar un dato válido habilita `Guardar datos`; sin cambios permanece
   deshabilitado.
6. Solo se listan especialidades, médicos, fechas y horas con disponibilidad en
   la sede autorizada.
7. El calendario muestra dos meses en escritorio, permite una fecha y distingue
   accesiblemente los días disponibles en verde.
8. El usuario elige un cupo horario concreto antes de agendar.
9. Medio de solicitud ofrece exactamente Presencial, Teléfono, Correo y WhatsApp.
10. Una doble solicitud concurrente nunca asigna el mismo cupo dos veces.
11. La cita creada aparece de inmediato como `Asignada` en el historial.
12. El historial inicia por la cita más reciente y filtra varios estados con
    checkbox.
13. Las citas asignadas no activadas muestran Activar, Imprimir recordatorio PDF,
    Cancelar y Reprogramar cuando el actor posee permiso. Después de activar se
    muestra el indicador `Activada` y no vuelve a aparecer esa acción; el
    recordatorio no envía mensajes.
14. Las citas atendidas muestran impresión de soporte solo cuando existe soporte.
15. Cancelar deja la cita `Cancelada` en el historial/log del paciente y devuelve
    el cupo a `Disponible`, mostrado como `Cupo libre` únicamente en Agenda.
16. Reprogramar crea una nueva cita asignada y conserva la original como
    `Reprogramada`, de forma atómica.
17. Todos los endpoints rechazan sedes, médicos, cupos, transiciones o acciones
    fuera del alcance, aunque el cliente sea manipulado.
18. La pantalla cabe en una composición compacta, sin campos innecesariamente
    largos, sin scroll horizontal y sin un componente monolítico.
19. Cada efecto de dominio confirmado genera exactamente un registro append-only
    en `CitaHistorial`; el log se consulta por paciente/cita con las fechas más
    recientes primero y nunca muestra `Cupo libre` como estado de la cita.
20. Una reprogramación genera los eventos de la cita original y de la nueva con
    un mismo `operationId`, sin duplicarlos al reintentar.
21. El documento del paciente no aparece en URLs y las respuestas sensibles no
    se almacenan en caché.
22. El recordatorio se genera como PDF versionado desde un snapshot, tiene
    permiso propio y audita generación y render, no descarga o impresión física.
23. Las mutaciones con la misma clave y comando son repetibles; reutilizar la
    clave con otro comando responde `409`.
24. Un paciente no puede conservar dos citas asignadas cuyos intervalos se
    superpongan, aunque pertenezcan a médicos y cupos diferentes.
25. Una operación abandonada puede recuperarse al vencer su lease y el
    propietario anterior no puede confirmar cambios posteriores.
26. `ATENDIDA` solo se origina en un encuentro clínico válido, único e idempotente.
27. Historial y auditoría son append-only, mantienen integridad referencial y no
    contienen documento, contacto, PDF o snapshot en texto claro.
28. Un paciente con `idSede` diferente o nulo puede consultarse y agendarse en la
    sede operativa del empleado; con `reception.site.select`, puede agendarse en
    otra sede autorizada sin modificar su registro maestro.
29. Cambiar la sede de atención conserva al paciente y limpia únicamente
    especialidad, fecha, médico y cupo dependientes.
30. `contactVersion` detecta cambios de contacto realizados por cualquier módulo
    mediante trigger y no cambia por actualizaciones ajenas al contacto.
31. Una cita solo puede activarse una vez aunque se usen claves idempotentes
    diferentes; la primera fecha y actor permanecen inmutables.
32. La base de datos impide que una cita referencie un cupo con sede, médico o
    intervalo discordantes.
33. Cancelar y reprogramar exigen un motivo activo de catálogo y no aceptan texto
    libre en esta entrega.
34. La identidad que marca `ATENDIDA` proviene de sesión o servicio autenticado;
    un evento clínico externo queda deduplicado y trazable en el inbox.
35. Reprogramar conserva paciente, especialidad, modalidad y medio de solicitud;
    deriva sede, médico e intervalo del nuevo cupo y crea la nueva cita sin
    activar. Cambiar especialidad o modalidad exige cancelar y agendar de nuevo.
36. Un recordatorio de la cita original queda como evidencia histórica después
    de reprogramar, pero no puede renderizarse; la nueva cita requiere su propio
    recordatorio.
37. Un proceso que perdió el lease no puede escribir `COMPLETED` ni `FAILED`,
    incluso si termina después del nuevo propietario.
38. Toda lectura exitosa del paciente y su historial se audita por identificador
    interno; una búsqueda fallida no almacena el documento ni una huella suya.
39. Cada sede activa tiene una única `ReceptionSitePolicy` activa y versionada;
    cancelación y reprogramación registran la versión aplicada usando hora de BD.
40. La base rechaza al commit cualquier discordancia entre cita vigente y estado
    del cupo, y el despliegue comprueba previamente cero inconsistencias.
41. Cancelación y reprogramación exigen exactamente el tipo de motivo,
    catálogo, snapshot y versión de política correspondientes; los demás eventos
    no admiten estos campos.
42. El inbox externo separa mensaje recibido inmutable y eventos append-only;
    `PROCESSED` se confirma atómicamente con `ATENDIDA` y su movimiento.
43. Todas las rutas usan el adaptador HTTP común; búsqueda también valida origen
    y los PDF aplican headers contra caché, sniffing, embedding y origen cruzado.
44. `Paciente no encontrado` aparece en línea y en toast visual, pero tecnologías
    de asistencia reciben exactamente un anuncio.

## 17. Dependencias por confirmar antes de implementar

Estas decisiones no cambian la arquitectura, pero sí catálogos o contenido
institucional final:

1. Valores oficiales del catálogo `Modalidad` y cuál debe venir por defecto.
2. Códigos y etiquetas oficiales de motivos de cancelación y reprogramación. La
   solución técnica ya queda cerrada como catálogo sin texto libre.
3. Logo, textos, recomendaciones y responsable de aprobar la plantilla PDF del
   recordatorio. El canal ya queda cerrado: se imprime y entrega al paciente.
4. Fuente y formato del `soporte de la HC` para una cita atendida.
5. Ruta/permiso del flujo existente para crear al paciente, si se desea añadir
   una acción directa desde el toast en una iteración posterior.
6. Gestor institucional de secretos/KMS, responsables de rotación y periodo de
   disponibilidad de claves anteriores para descifrar documentos retenidos.
7. Retención y perfiles autorizados para `CitaHistorial`, `DocumentoCita`,
   `OperacionIdempotente` y `AuditoriaRecepcion`.
8. Fuente autoritativa e identificador único del encuentro clínico que dispara
   `ATENDIDA`; el esquema actual todavía no contiene una entidad de encuentro.

## 18. Orden recomendado de implementación

1. Confirmar las ocho dependencias funcionales y de seguridad anteriores.
2. Alinear `prisma` y `@prisma/client` en la misma versión y validar generación.
3. Seleccionar el generador OpenAPI compatible con Zod, publicar el contrato y la
   matriz de permisos/transiciones, y activar la verificación de drift en CI.
4. Crear migración de citas, operación idempotente, historial, auditoría, rate
   limit, documentos, modalidad, motivos, `ReceptionSitePolicy`,
   `contactVersion` con trigger, FK compuesta cita-cupo, constraint trigger
   diferido, las dos tablas append-only del inbox clínico, snapshots, índices
   parciales y permisos. Ejecutar reconciliación y smoke tests de migración.
5. Implementar dominio y pruebas de transiciones, solapamientos, ventanas e
   idempotencia con leases.
6. Implementar el adaptador HTTP común, directorio global de pacientes, alcance
   independiente de sede de atención, auditoría obligatoria, repositorios y
   casos transaccionales.
7. Implementar cifrado y adaptador local de PDF con pruebas de rotación,
   manipulación, snapshot y checksum.
8. Publicar contratos de contexto, paciente y disponibilidad.
9. Construir la vista compacta, hooks especializados y orquestador de
   presentación delgado.
10. Integrar historial, atención clínica, acciones por estado y flujo de PDF.
11. Ejecutar pruebas unitarias, integración, E2E, carga concurrente, seguridad,
    RBAC, OpenAPI, axe, accesibilidad manual y responsive.
12. Habilitar por perfil y desplegar con métricas de conflictos, leases vencidos,
    límites de búsqueda, auditoría y PDFs fallidos.
