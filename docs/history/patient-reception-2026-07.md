# Historial técnico — Recepción de Pacientes

**Actualizado:** 31 de julio de 2026
**Estado:** implementación base en curso; modelo, API, UI operativa y controles
de integridad principales ya incorporados. Las integraciones institucionales y la
batería de pruebas integral siguen pendientes.
**Especificación canónica:** [`docs/specs/patient-reception.md`](../specs/patient-reception.md)
**Commit de implementación inicial:** `bd481e2 feat(reception): implementar recepción de pacientes`

## Propósito de este registro

Este documento conserva las decisiones de producto, arquitectura y seguridad que
se acordaron al diseñar el submódulo **Recepción de Pacientes**. Sirve como guía
de contexto antes de implementar o modificar el módulo; no reemplaza la
especificación canónica, que contiene el contrato completo y los criterios de
aceptación verificables.

## Estado de implementación al 31 de julio de 2026

Ya se implementaron:

- ruta, navegación, RBAC y vista de Recepción de Pacientes;
- búsqueda global exacta, edición de contacto con `contactVersion`, agenda de
  disponibilidad, asignación, activación, cancelación y reprogramación;
- modelo `Cita`, historial append-only, políticas por sede, motivos de cambio,
  auditoría, cuota PostgreSQL por empleado y recordatorio PDF cifrado;
- idempotencia persistida básica, exclusión de solapamiento e integridad
  diferida entre cita y cupo;
- transición clínica interna `markAppointmentAttended`, e infraestructura
  append-only para recibir mensajes clínicos externos;
- endpoint y pantalla administrativa para versionar políticas de recepción.

Siguen pendientes la verificación institucional de firmas del inbox externo,
HMAC/leases de idempotencia, diálogos UI de motivos y pruebas automatizadas
integrales. La migración y el seed RBAC aún deben aplicarse por entorno y el
PDF requiere `RECEPTION_DOCUMENT_KEY` (base64, 32 bytes).

## Resultado acordado

Recepción de Pacientes pertenece a **Admisiones** y se propone en la ruta
`/admisiones/recepcion-pacientes`. Debe permitir buscar un paciente por documento
en el directorio institucional, editar sus datos de contacto y asignarle un cupo
de una agenda médica desde una vista compacta.

El flujo no crea agendas médicas: consume los `CupoMedico` generados por Agenda.
La creación de Agenda y la asignación de una cita son responsabilidades separadas.

## Decisiones funcionales que no deben cambiarse por accidente

### Pacientes y sedes

- Los pacientes viven en `Usuario` y forman un directorio institucional global.
  `Usuario.idSede` no indica pertenencia ni limita dónde se puede buscar o
  atender al paciente.
- La sede seleccionada es la **sede de atención**, no la sede del paciente. Por
  defecto se toma de `Empleado.idSede`.
- Sin `reception.site.select`, un usuario solo opera cupos de su sede asignada.
  Con ese permiso puede operar en otra sede activa autorizada.
- Cambiar la sede de atención conserva el paciente cargado y limpia únicamente
  los campos dependientes de asignación: especialidad, fecha, médico y cupo.
- El servidor deriva sede, médico e intervalo del cupo; nunca confía en estos
  campos si llegan desde el navegador.

### Búsqueda y datos del paciente

- La búsqueda es exacta por documento y se ejecuta solo con Enter o `Buscar`.
  No se hacen búsquedas parciales ni autocompletado por cada pulsación.
- El documento viaja en el body de un `POST`, nunca en URL, query string ni clave
  de caché del cliente.
- Si no existe, el mensaje es: `El paciente no existe. Debes crearlo antes de
  agendar una cita.` Se limpian los datos de la búsqueda anterior y se ofrece
  recuperación, no una falsa respuesta de error técnico.
- Solo son editables celular, teléfono, correo y dirección. `Guardar datos`
  inicia deshabilitado y se habilita exclusivamente cuando hay cambios válidos.
- `contactVersion` protege contra actualizaciones perdidas. Un trigger de base de
  datos incrementa esa versión incluso si el contacto cambia desde otro módulo.

### Asignación y estados

- Orden de asignación: **Especialidad → Fecha de cita → Médico → Hora/cupo →
  Medio de solicitud → Modalidad → Agendar cita**.
- Medio de solicitud es un catálogo cerrado: `PRESENCIAL`, `TELEFONO`, `CORREO`
  y `WHATSAPP`.
- Estados de una cita: `ASIGNADA`, `ATENDIDA`, `REPROGRAMADA` y `CANCELADA`.
  **Cupo libre** no es un estado de cita: es la etiqueta de Agenda para un
  `CupoMedico.DISPONIBLE`.
- Al cancelar, la cita se conserva como `CANCELADA` en el historial y el cupo
  vuelve a `DISPONIBLE`; puede ser usado posteriormente por otro paciente.
- `ATENDIDA` solo se origina en una integración clínica autorizada, nunca en un
  botón de Recepción.

### Reprogramación

- Reprogramar es atómico: reclama el nuevo cupo, libera el anterior, conserva la
  cita original como `REPROGRAMADA` y crea una nueva cita `ASIGNADA`.
- La nueva cita conserva paciente, especialidad, modalidad y medio de solicitud;
  la nueva sede, médico y horario provienen exclusivamente del nuevo cupo.
- La nueva cita comienza sin activación. Los recordatorios de la cita original
  se conservan como evidencia, pero ya no pueden renderizarse; se genera un
  recordatorio nuevo para la nueva cita.
- Cambiar especialidad o modalidad no es una reprogramación. Requiere cancelar
  la cita vigente y realizar una nueva asignación explícita.

### Recordatorios y soporte clínico

- El recordatorio no se envía por SMS, correo ni WhatsApp. Es un PDF que se
  genera desde un snapshot cifrado y se entrega para abrir o imprimir.
- Generar el documento y registrar el evento funcional es atómico. Renderizarlo
  es una acción técnica auditada, no prueba que el paciente lo descargó o imprimió.
- Los endpoints PDF usan `private, no-store`, `nosniff`, `no-referrer`, CORP
  `same-origin` y protección contra embedding.
- Una cita `ATENDIDA` solo muestra el soporte de historia clínica si ese soporte
  existe y el usuario tiene su permiso específico.

## Arquitectura y datos

| Responsabilidad | Decisión |
| --- | --- |
| Maestro de paciente | `Usuario` |
| Disponibilidad temporal | `CupoMedico` de Agenda |
| Asignación actual | nueva entidad `Cita` |
| Bitácora funcional | `CitaHistorial` append-only |
| Auditoría técnica y de acceso | `AuditoriaRecepcion` append-only |
| Idempotencia | `OperacionIdempotente` con huella SHA-256 canónica y replay básico; faltan HMAC y leases |
| Política temporal | `ReceptionSitePolicy` versionada por sede |
| Documento PDF | `DocumentoCita` con snapshot cifrado |
| Entrada clínica externa | `ClinicalEncounterInboxMessage` + `ClinicalEncounterInboxEvent` |

### Invariantes de datos

- La base de datos impide dos citas `ASIGNADA` superpuestas para el mismo
  paciente mediante exclusión PostgreSQL con rangos `tstzrange`.
- La cita deriva sede, médico e intervalo desde el cupo en el servicio; falta la
  FK compuesta que convierta esa defensa en una restricción adicional de base.
- Un constraint trigger diferido valida al commit que una cita `ASIGNADA` o
  `ATENDIDA` tenga un cupo `ASIGNADO`, y que un cupo `ASIGNADO` tenga exactamente
  una cita vigente. Esto permite estados intermedios dentro de la transacción,
  pero no permite confirmarlos de forma inconsistente.
- `CitaHistorial`, auditoría e inbox clínico no se actualizan ni eliminan con el
  rol de aplicación. Las correcciones se registran como eventos nuevos.
- Cancelación y reprogramación exigen motivo de catálogo, snapshot de etiqueta y
  la versión de política aplicada; otros eventos no admiten esos campos.

### Idempotencia y concurrencia

- Las operaciones iniciadas en la UI usan `Idempotency-Key` UUID. La clave se
  vincula a actor, tipo de operación y la huella SHA-256 del payload canónico,
  sin almacenar datos personales ni el body original.
- La ampliación pendiente sustituirá la huella simple por HMAC versionado e
  incorporará `ownerToken`, `lockVersion` y leases recuperables.
- Reservar un cupo usa aislamiento `Serializable`, actualización condicional y
  reintentos acotados. Nunca se confía en una consulta previa del cliente.

### Integración clínica externa

- El mensaje externo se persiste primero como
  `ClinicalEncounterInboxMessage`, inmutable y único por `(issuer, messageId)`.
- Su procesamiento es otro log: `ClinicalEncounterInboxEvent`. No existe un
  campo mutable como `processedAt` que contradiga el diseño append-only.
- `PROCESSED`, la transición a `ATENDIDA` y el evento de historial se confirman
  en una única transacción. Un mensaje inválido o no mapeable produce `REJECTED`
  sin cambiar la cita.
- La identidad del actor clínico proviene de sesión o de un principal técnico
  verificado; jamás de un campo enviado por el cliente.

## Seguridad y privacidad

- Búsqueda, proyección del paciente e historial se auditan obligatoriamente por
  identificadores internos. Una búsqueda inexistente no guarda documento, hash ni
  fingerprint del valor buscado.
- Las búsquedas, proyecciones e historial se auditan; queda pendiente convertir
  una indisponibilidad de auditoría en error de bloqueo `AUDIT_UNAVAILABLE`.
- Las rutas validan sesión, RBAC, body limitado y Zod. La protección uniforme de
  `Origin`, Fetch Metadata, CSRF y el adaptador HTTP único aún está pendiente.
- Las cookies de sesión deben ser `Secure`, `HttpOnly` y `SameSite=Lax` o más
  estrictas.

## Experiencia y accesibilidad

- La pantalla es compacta, con un único scroll vertical. En escritorio el
  historial es tabla desde 1280 px; en tablet es lista expandible; en móvil son
  tarjetas y el calendario muestra un mes.
- El calendario visualiza dos meses en escritorio y usa verde para disponibilidad,
  sin depender solamente del color para comunicar el estado.
- Las acciones iconográficas requieren `aria-label`, tooltip y área de al menos
  44 × 44 px.
- Para `Paciente no encontrado` hay un mensaje persistente en línea con región
  viva. El toast paralelo es visual (`aria-hidden="true"`) para evitar doble
  anuncio a lectores de pantalla.
- Validar la UI, como mínimo, en 320, 375, 768, 1024 y 1440 px, además de zoom
  200 %, teclado, lector de pantalla y popup de PDF permitido/bloqueado.

## Permisos relevantes

- `reception.read`
- `reception.schedule`
- `reception.patient.update`
- `reception.site.select`
- `reception.appointment.activate`
- `reception.appointment.reminder.print`
- `reception.appointment.cancel`
- `reception.appointment.reschedule`
- `reception.clinical-support.print`
- `appointment.attend` para el flujo clínico, no para la UI de Recepción
- `admin.reception.policy.manage` para versionar políticas por sede

Todos requieren la validación de servidor correspondiente; ocultar un botón no
es un control de seguridad.

## Hallazgos que se resolvieron durante el diseño

1. Se eliminó la ambigüedad entre estado de cita y estado de cupo: cancelada en
   el historial, disponible en Agenda.
2. Se reemplazó el recordatorio por mensajes externos por un PDF imprimible.
3. Se confirmó que los pacientes no están vinculados a una sede y que la sede
   solo limita los cupos sobre los que opera el empleado.
4. Se corrigió la idempotencia para que un propietario de lease vencido tampoco
   pueda escribir un resultado `FAILED` tardío.
5. Se dividió el inbox clínico en mensaje recibido y eventos de procesamiento
   para preservar inmutabilidad real.
6. Se añadieron política temporal versionada por sede, trigger de integridad
   cita-cupo, auditoría obligatoria de acceso global y checks exhaustivos de
   motivos.
7. Se fijaron nombres SQL derivados de Prisma y un adaptador HTTP común para no
   duplicar seguridad ni contratos entre rutas.
8. Se corrigió el doble anuncio accesible entre mensaje en línea y toast.

## Implementación pendiente recomendada

1. Aplicar migración, seed RBAC y configurar la clave institucional del PDF por
   entorno.
2. Implementar HMAC, leases y recuperación segura de operaciones idempotentes.
3. Conectar el verificador de firma institucional al inbox clínico externo.
4. Completar los diálogos de motivos y el historial paginado por cursor.
5. Añadir contratos OpenAPI y pruebas de seguridad, integración, concurrencia,
   accesibilidad, E2E y carga.

## Insumos que siguen pendientes de la institución

- Valores y modalidad predeterminada del catálogo de modalidades.
- Códigos y etiquetas de motivos de cancelación y reprogramación.
- Logo, texto aprobado, recomendaciones y responsable de la plantilla PDF.
- Fuente y formato del soporte de historia clínica.
- Ruta o permiso del flujo existente para crear un paciente inexistente.
- Gestor KMS/secretos, responsables de rotación y retención de claves.
- Política de retención y perfiles autorizados para logs, documentos y auditoría.
- Fuente autoritativa e identificador único del encuentro clínico que marca una
  cita como atendida.

## Antes de modificar este módulo

1. Leer primero la especificación canónica y este historial.
2. Mantener la separación entre directorio global de pacientes y alcance de sede
   de los cupos.
3. No eliminar constraints de base de datos para resolver conflictos de UI.
4. No introducir actualizaciones genéricas sobre `Cita`, historial, auditoría o
   inbox; usar transiciones y eventos explícitos.
5. Revalidar permisos, hora de base de datos, disponibilidad y política de sede
   dentro de cada transacción.
6. Actualizar este historial, la especificación, pruebas y migraciones en el
   mismo cambio cuando una decisión de dominio cambie.
