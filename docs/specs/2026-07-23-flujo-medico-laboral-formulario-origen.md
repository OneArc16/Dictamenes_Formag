# Especificación técnica: Flujo médico-laboral y Formulario de Determinación de Origen

| Campo | Valor |
| --- | --- |
| Nombre del spec | `2026-07-23-flujo-medico-laboral-formulario-origen` |
| Estado | Propuesto |
| Versión | 1.0 |
| Fecha de creación | 2026-07-23 |
| Última actualización | 2026-07-23 |
| Producto | Dictámenes Formag / Dictamy |
| Módulo | Medicina Laboral / Dictámenes |
| Stack actual | Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Prisma y PostgreSQL |
| Impacto en base de datos | Sí, requiere migración |
| Spec relacionado | `docs/specs/2026-07-22-medicina-laboral.md` |

## 1. Resumen ejecutivo

Se implementará un flujo médico-laboral obligatorio de dos documentos dentro del submódulo **Dictámenes**:

1. **Formulario de Dictamen para la Determinación del Origen del Accidente o la Enfermedad**.
2. **Dictamen de Pérdida de Capacidad Laboral (PCL)** existente.

Todo nuevo expediente creado después de la entrada en vigor de este flujo deberá iniciar con el Formulario de Origen en estado borrador. El Dictamen PCL permanecerá bloqueado hasta que el médico finalice el Formulario de Origen.

Ambos documentos tendrán persistencia, estados, diagnósticos, auditoría, permisos, reapertura y versiones independientes. El Formulario de Origen no se implementará añadiendo campos al formulario PCL ni compartiendo registros editables entre ambos documentos.

La pantalla del Formulario de Origen conservará la identidad visual y la metodología de trabajo del PCL: resumen del docente y datos del documento a la izquierda, contenido por pestañas en el centro y acciones/progreso a la derecha. La reutilización se realizará mediante componentes presentacionales pequeños y controlados; no se duplicarán paneles completos acoplados a endpoints o reglas del PCL.

El flujo deberá ser seguro ante acceso directo por URL, concurrencia, reintentos, dobles envíos y reaperturas. La autorización y las transiciones de estado se validarán siempre en el servidor.

## 2. Contexto actual

El sistema dispone actualmente de:

- Registro y actualización de docentes.
- Creación inmediata de un registro `Dictamen` después de guardar el docente.
- Detalle PCL en `/medico/dictamen/[id]`.
- Estados PCL derivados de los booleanos `estado` y `reabierto`.
- Cierre, reapertura, motivos de reapertura e historial del PCL.
- Permisos operativos `dictamen.*`.
- Panel izquierdo con información del docente, número, fecha y procedimiento.
- Panel central PCL con pestañas.
- Selector CIE-10 y editor de diagnósticos.
- Selector de tipo de evento y origen dentro de Sustentación.
- Borradores locales mediante Dexie en diferentes secciones.
- Búsqueda asíncrona de instituciones educativas y cargos docentes.

La creación actual del docente y la creación del dictamen se realizan mediante solicitudes separadas. Esto permite que el docente sea guardado aunque la creación del expediente falle. La implementación del nuevo flujo deberá reemplazar esta orquestación por un caso de uso transaccional e idempotente para Dictámenes.

También existen implementaciones distintas para previsualizar o generar el número del dictamen. Antes de reutilizar esta capacidad, deberá existir una única función canónica compartida por servidor y presentación.

## 3. Objetivos

1. Exigir el Formulario de Origen antes de habilitar el PCL para nuevos expedientes.
2. Mantener separados los ciclos de vida de Origen y PCL.
3. Conservar la experiencia visual del PCL sin copiar componentes acoplados.
4. Permitir guardar y reanudar borradores desde diferentes equipos.
5. Generar el número del Formulario de Origen mediante la misma regla canónica del PCL.
6. Eliminar la selección de procedimiento A/B del Formulario de Origen.
7. Implementar las cinco pestañas clínicas acordadas.
8. Finalizar y bloquear el Formulario de Origen con validación integral.
9. Permitir la reapertura controlada de Origen o PCL mediante un modal único.
10. Configurar permisos y motivos de reapertura desde Administración.
11. Conservar versiones inmutables y auditoría de los documentos finalizados.
12. Mantener operativos los dictámenes históricos sin crear formularios ficticios.
13. Evitar código espagueti mediante capas, componentes controlados y reglas centralizadas.
14. Cubrir el flujo mediante pruebas unitarias, integración, seguridad, accesibilidad y extremo a extremo.

## 4. Fuera de alcance

- Modificar los cálculos, tablas o reglas matemáticas actuales del PCL.
- Rediseñar el módulo Recomendaciones.
- Migrar las rutas canónicas de Medicina Laboral.
- Compartir en tiempo real las mismas filas de diagnóstico entre Origen y PCL.
- Cargar archivos o adjuntos de los soportes en la primera versión, salvo decisión posterior.
- Implementar firma digital o integración con un proveedor externo de firma.
- Inferir automáticamente `N.A.` a partir de campos vacíos.
- Alterar retroactivamente el contenido de un PCL o Formulario de Origen finalizado.
- Inventar campos legales adicionales sin validar la versión oficial aprobada del formato.

## 5. Condición previa de producto y cumplimiento

Antes de aprobar la salida a producción y el certificado/PDF se deberá disponer de:

1. Copia oficial o institucional aprobada del Formulario de Origen.
2. Identificador o versión del formato.
3. Definición de campos obligatorios y condicionales.
4. Definición del contenido exacto del certificado.
5. Confirmación de responsables autorizados para finalizar y reabrir.
6. Confirmación de si el tratamiento requiere un campo narrativo independiente.
7. Confirmación de retención, impresión y entrega de versiones anteriores.

El modelo incluirá `formatoVersion` para que futuras modificaciones del documento no cambien el significado de formularios ya finalizados.

## 6. Decisiones arquitectónicas

### 6.1 Agregado principal

Por compatibilidad, `Dictamen` continuará siendo el agregado o expediente principal que relaciona:

- Docente.
- Médico responsable.
- Sede.
- Tipo de dictamen.
- Flujo aplicable.
- Formulario de Origen.
- Documento PCL existente.

No se creará inicialmente una tercera tabla genérica de expediente. En el dominio y los casos de uso podrá utilizarse el término `CasoDictamen`, pero la tabla actual seguirá siendo la raíz persistida.

### 6.2 Documento independiente

`FormularioOrigen` será una entidad uno a uno con `Dictamen`:

```text
Dictamen
├── FormularioOrigen
│   ├── HistorialLaboralOrigen[]
│   ├── SoporteFundamentoOrigen[]
│   ├── DiagnosticoOrigen[]
│   ├── VersionFormularioOrigen[]
│   └── HistorialFormularioOrigen[]
└── Documento PCL actual
```

Los datos de Origen no se guardarán en columnas clínicas del PCL.

### 6.3 Reutilización por composición

Se reutilizarán o extraerán componentes presentacionales:

- `ClinicalDocumentLayout`, generalización del layout de tres columnas.
- `DocenteSummaryCard`.
- `DocumentMetaCard`.
- `ClinicalTabs`.
- `DiagnosticosEditor`.
- `TipoEventoOrigenSelector`.
- `AsyncInstitucionCombobox`.
- Controles de textarea, estado de guardado y resumen de errores.

Se crearán contenedores independientes:

- `FormularioOrigenLeftPanel`.
- `FormularioOrigenCenterPanel`.
- `FormularioOrigenRightPanel`.
- Una pestaña de Origen por sección.

Los componentes compartidos recibirán valor, callbacks, estado de carga, errores y `readOnly`. No realizarán solicitudes específicas de PCL en su interior.

### 6.4 Fuente de verdad

- PostgreSQL será la fuente de verdad del borrador.
- El guardado de secciones se realizará en el servidor con debounce.
- IndexedDB/Dexie podrá utilizarse como recuperación local temporal.
- No se almacenará información clínica en `localStorage`.
- Todo borrador local deberá estar aislado por usuario y documento, tener expiración y eliminarse al finalizar o cerrar sesión.

### 6.5 Regla de habilitación

La política para acceder al PCL será única:

```text
canAccessPcl =
  flujoVersion == LEGACY
  OR formularioOrigen.estado == FINALIZADO
```

La política de edición añadirá permisos, propiedad/asignación, estado PCL y bloqueo por revisión:

```text
canEditPcl =
  canAccessPcl
  AND permiso de edición
  AND PCL no cerrado
  AND formularioOrigen no reabierto
```

Esta política deberá consumirse desde páginas, APIs y casos de uso. No se duplicará como condiciones diferentes en cada componente.

## 7. Flujo funcional

### 7.1 Nuevo expediente

```text
Registrar docente
       ↓
Crear expediente y Origen BORRADOR
       ↓
Diligenciar Formulario de Origen
       ↓
Finalizar Origen
       ↓
Habilitar Dictamen PCL
       ↓
Iniciar PCL
       ↓
Cerrar PCL
```

### 7.2 Registro transaccional

El caso de uso `RegistrarCasoDictamen` deberá:

1. Validar sesión y `dictamen.create`.
2. Validar el payload del docente.
3. Buscar, crear o actualizar al docente según las reglas actuales.
4. Detectar expedientes activos incompatibles para evitar duplicados.
5. Resolver médico responsable y sede.
6. Crear `Dictamen` con flujo `ORIGEN_PREVIO`.
7. Crear `FormularioOrigen` en `BORRADOR`.
8. Registrar el evento de creación.
9. Confirmar toda la operación en una transacción.
10. Retornar el ID del expediente y la ruta `/medico/dictamen/[id]/origen`.

Se utilizará una clave de idempotencia o un identificador de operación para que un reintento no cree dos expedientes.

### 7.3 Inicio del PCL

Después de finalizar Origen:

- La acción `Diligenciar PCL` se habilita.
- El acceso directo a `/medico/dictamen/[id]` es permitido.
- La primera apertura editable o la primera escritura registra `pclIniciadoEn`.
- Los diagnósticos de Origen podrán copiarse una sola vez como propuesta inicial.
- La copia será independiente; editar PCL no modificará Origen.

## 8. Estados y máquina de transición

### 8.1 Formulario de Origen

```text
BORRADOR → FINALIZADO → REABIERTO → FINALIZADO
```

| Estado | Editable | Permite PCL | Acción principal |
| --- | --- | --- | --- |
| `BORRADOR` | Sí | No | Continuar formulario |
| `FINALIZADO` | No | Sí | Ver formulario |
| `REABIERTO` | Sí | No | Continuar formulario |

No se almacenará un estado `CERRADO` adicional. En interfaz, un Origen `FINALIZADO` podrá presentarse como “Finalizado” o “Cerrado”, pero el valor de dominio será único.

### 8.2 PCL

Se conservarán los estados funcionales:

- `PENDIENTE`.
- `CERRADO`.
- `REABIERTO`.

Se añadirá `pclIniciadoEn` para diferenciar un PCL habilitado pero todavía no iniciado de un PCL pendiente en elaboración.

### 8.3 Estado visible del expediente

| Condición | Etapa | Estado visible |
| --- | --- | --- |
| Origen `BORRADOR` | Formulario de Origen | Borrador |
| Origen `REABIERTO` | Formulario de Origen | Reabierto |
| Origen `FINALIZADO`, PCL sin iniciar | Dictamen PCL | Habilitado |
| PCL iniciado y abierto | Dictamen PCL | Pendiente |
| PCL cerrado | Dictamen PCL | Cerrado |
| PCL reabierto | Dictamen PCL | Reabierto |
| Flujo anterior | PCL | Estado actual con etiqueta “Flujo anterior” |

La etapa visible será derivada. No se guardarán dos estados que puedan quedar desincronizados.

## 9. Número y fecha del Formulario de Origen

El Formulario de Origen tendrá:

- `fechaDictamenOrigen`.
- `numeroDictamenOrigen`.

La función canónica recibirá:

- Fecha ISO `YYYY-MM-DD`.
- Documento normalizado del docente.

La regla inicial será la misma utilizada por el servidor PCL:

```text
DDMMYYYY + documento numérico
```

Restricciones:

1. Existirá una sola implementación de dominio para construir el número.
2. El cliente podrá utilizar la misma función pura para previsualizar.
3. El servidor siempre recalculará y validará el valor.
4. Mientras sea borrador, cambiar la fecha actualizará la previsualización.
5. Al finalizar, número y fecha quedarán bloqueados.
6. Reabrir no cambiará el número; incrementará la versión interna.
7. El número no se utilizará como llave primaria.
8. No se añadirá unicidad global sin confirmar la regla ante dos dictámenes del mismo docente en la misma fecha.

## 10. Modelo de datos conceptual

### 10.1 Enums

```text
FlujoDictamenVersion:
  LEGACY
  ORIGEN_PREVIO

EstadoFormularioOrigen:
  BORRADOR
  FINALIZADO
  REABIERTO

EstadoSoporteOrigen:
  APORTADO
  NO_APORTADO
  NO_APLICA

JornadaEvento:
  NORMAL
  EXTRA
  NO_DETERMINADA

TipoSoporteOrigen:
  REPORTE_ACCIDENTE_TRABAJO
  DESCRIPCION_EVENTO
  EPICRISIS_RESUMEN_HISTORIA
  CERTIFICADO_DEFUNCION
  ANALISIS_PUESTO_TRABAJO
  EXAMENES_PREOCUPACIONALES
  INVESTIGACION_ACCIDENTE
  OTRO

ObjetivoReapertura:
  ORIGEN
  PCL
```

Los enums `TipoEvento`, `OrigenEvento` y tipo de diagnóstico deberán reutilizar las definiciones de dominio vigentes cuando su semántica sea idéntica.

### 10.2 Cambios en `Dictamen`

Campos conceptuales nuevos:

| Campo | Tipo | Propósito |
| --- | --- | --- |
| `flujoVersion` | enum | Distinguir registros históricos de los nuevos |
| `pclIniciadoEn` | fecha nullable | Distinguir PCL habilitado de iniciado |
| `pclRequiereRevision` | boolean | Señalar que Origen cambió después de iniciar/cerrar PCL |
| `origenVersionUtilizadaPcl` | entero nullable | Versión de Origen en la que se basó el PCL |

### 10.3 `FormularioOrigen`

Campos conceptuales:

| Grupo | Campos |
| --- | --- |
| Identidad | `id`, `dictamenId` único |
| Estado | `estado`, `formatoVersion`, `versionActual` |
| Documento | `fechaDictamenOrigen`, `numeroDictamenOrigen` |
| Descripción | `descripcion` |
| Evento | `fechaOcurrencia`, `horaOcurrencia`, `jornadaEvento` |
| Diagnóstico/tratamiento | `tratamiento` |
| Sustentación | `concepto`, `fundamentosDerecho`, `tipoEvento`, `origenEvento` |
| Auditoría | `createdAt`, `updatedAt`, `finalizadoEn`, `finalizadoPorId`, `reabiertoEn`, `reabiertoPorId` |
| Concurrencia | versión numérica o `updatedAt` esperado |

El día de la semana se calculará desde `fechaOcurrencia` en la zona `America/Bogota`; no se persistirá como texto editable.

### 10.4 `HistorialLaboralOrigen`

| Campo | Propósito |
| --- | --- |
| `formularioOrigenId` | Padre |
| `institucionId` nullable | Relación con catálogo |
| `institucionNombreSnapshot` | Nombre histórico inmutable |
| `cargoId` nullable | Sugerencia de catálogo cuando aplique |
| `cargoNombreSnapshot` | Cargo histórico, permite texto libre |
| `riesgosLaborales` | Texto libre |
| `jornadaLaboral` | Texto libre |
| `tiempoExposicionAnios` | Decimal no negativo |
| `orden` | Orden de presentación |

### 10.5 `SoporteFundamentoOrigen`

| Campo | Propósito |
| --- | --- |
| `formularioOrigenId` | Padre |
| `tipo` | Tipo de soporte |
| `estado` | Aportado, no aportado o no aplica |
| `fechaDocumento` | Requerida cuando corresponda |
| `seTuvoEnCuenta` | Texto clínico libre |
| `nombreOtro` | Requerido para tipo `OTRO` |
| `orden` | Orden estable |

Los siete soportes fijos tendrán máximo una fila por formulario. `OTRO` podrá repetirse.

### 10.6 `DiagnosticoOrigen`

Contendrá:

- `formularioOrigenId`.
- `cie10Codigo`.
- Tipo de diagnóstico.
- `esPrincipal`.
- `orden`.

Tendrá relaciones propias y no reutilizará `DictamenDiagnostico`.

### 10.7 Versiones e historial

`VersionFormularioOrigen` conservará un snapshot completo al finalizar:

- Número de versión.
- Datos del documento.
- Historial laboral.
- Soportes.
- Diagnósticos.
- Actor.
- Fecha.
- Motivo que originó la nueva versión, cuando aplique.

`HistorialFormularioOrigen` registrará:

- Creación.
- Ediciones relevantes.
- Finalización.
- Reapertura.
- Estado anterior y nuevo.
- Actor.
- Motivo y observación.
- Cambios resumidos.

## 11. Diseño de la página

### 11.1 Ruta

```text
/medico/dictamen/[id]/origen
```

La ruta existente del PCL se conserva:

```text
/medico/dictamen/[id]
```

### 11.2 Distribución

Escritorio:

- Panel izquierdo fijo o sticky: docente y datos de Origen.
- Panel central flexible: pestañas y formularios.
- Panel derecho sticky: progreso, guardado y finalización.

Móvil/tablet:

- Contenido apilado.
- Resumen del docente colapsable si la altura lo requiere.
- Pestañas desplazables o selector accesible sin scroll horizontal de página.
- Acciones principales visibles sin cubrir campos.

### 11.3 Panel izquierdo

#### Tarjeta del docente

- Nombre completo.
- Tipo y número de documento.
- Tipo de dictamen.
- Edad.
- Secretaría.
- Institución actual.
- Botón Editar cuando el estado y permiso lo permitan.

#### Datos de Origen

- Número del Dictamen de Origen.
- Estado.
- Fecha del dictamen.
- Indicador de guardado.
- Sin selección de procedimiento A/B.

### 11.4 Pestañas

Las pestañas serán:

1. Descripción.
2. Historial laboral.
3. Información y Fundamentos.
4. Diagnóstico y tratamiento.
5. Sustentación.

La pestaña activa podrá representarse en el query string, por ejemplo `?tab=historial-laboral`, para conservar contexto después de refrescar o volver.

Cada pestaña informará uno de estos estados:

- Sin iniciar.
- Incompleta.
- Completa.
- No aplica, cuando corresponda.

## 12. Especificación de pestañas

### 12.1 Descripción

Campos:

- `Descripción`: textarea de texto libre.

Comportamiento:

- Guardado automático con debounce.
- Contador de caracteres informativo.
- Estado Guardando, Guardado o Error al guardar.
- Validación junto al campo.
- Acción Guardar y continuar.

No se impondrá un máximo arbitrario antes de validar el formato oficial y la capacidad del certificado.

### 12.2 Historial laboral

Será un editor de filas repetibles similar al patrón de diagnósticos.

Cada registro incluye:

1. Institución educativa.
2. Cargo.
3. Riesgos laborales.
4. Jornada laboral.
5. Tiempo de exposición en años.
6. Acción Quitar.

Reglas:

- El combobox de institución buscará asíncronamente en el catálogo.
- Se guardarán ID y nombre snapshot.
- Permitirá “Otra institución/no encontrada”.
- El cargo sugerirá el catálogo, pero permitirá texto histórico libre.
- El tiempo de exposición será numérico decimal.
- Agregar institución insertará una nueva fila vacía al final.
- Quitar una fila con datos solicitará confirmación.
- En móvil cada registro se presentará como tarjeta vertical.
- El formulario conservará el orden definido por el médico.

### 12.3 Información y Fundamentos

#### Datos de ocurrencia

Campos:

- Fecha de ocurrencia.
- Hora de ocurrencia.
- Día de la semana calculado y de solo lectura.
- Jornada: Normal, Extra o No determinada.

Reglas:

- Jornada será radio group o control de selección exclusiva, no checkboxes independientes.
- Para `ACCIDENTE`, fecha, hora y jornada serán obligatorias al finalizar.
- Para `ENFERMEDAD`, los campos exclusivos del accidente podrán quedar vacíos y el certificado mostrará `N.A.` cuando corresponda.
- La fecha no podrá estar en el futuro ni ser posterior a la fecha del Dictamen de Origen.
- Los cálculos de fecha usarán `America/Bogota` y evitarán desplazamientos UTC.

#### Acordeones de soportes

Se mostrarán:

1. Reporte de Accidente de Trabajo.
2. Descripción del Evento Ocurrido.
3. Epicrisis o Resumen de Historia Clínica.
4. Certificado de Defunción.
5. Análisis de Puesto de Trabajo.
6. Exámenes Preocupacionales.
7. Investigación del Accidente Realizada.
8. Otros.

Cada acordeón mostrará una etiqueta de estado:

- Pendiente.
- Aportado/completo.
- No aportado.
- N.A.

Cada elemento exigirá selección explícita de estado. Si está `APORTADO`, habilitará:

- Fecha.
- Texto `Se tuvo en cuenta`.

Si está `NO_APLICA`:

- El certificado imprimirá `N.A.`.
- Fecha y texto no serán requeridos.
- Si existían datos, cambiar a N.A. solicitará confirmación antes de limpiarlos.

`NO_APORTADO` será diferente de `NO_APLICA`. Un campo vacío nunca implicará automáticamente N.A.

`OTRO` añadirá nombre del documento y permitirá varias filas.

### 12.4 Diagnóstico y tratamiento

Se reutilizará un `DiagnosticosEditor` controlado con:

- Selector CIE-10.
- Tipo de diagnóstico.
- Diagnóstico principal.
- Agregar diagnóstico.
- Quitar diagnóstico.
- Validaciones inline.

Reglas:

- Debe existir al menos un diagnóstico principal para finalizar.
- Los diagnósticos se guardarán en `DiagnosticoOrigen`.
- Al habilitar el PCL se podrán copiar como valores iniciales.
- La copia al PCL será idempotente y no volverá a sobrescribir diagnósticos PCL editados.

Se añadirá `Tratamiento recibido o actual` como textarea si la validación del formato oficial confirma que es un campo del documento. Hasta dicha confirmación podrá mantenerse opcional y detrás de una bandera de formato.

### 12.5 Sustentación

Campos:

- `Concepto`: texto libre.
- `Fundamentos de Derecho`: texto libre.
- `Tipo de evento`: Enfermedad o Accidente.
- `Origen`: Laboral o Común.

El selector de tipo de evento y origen será un componente compartido con el PCL, pero guardará en el documento que lo consume.

Reglas:

- Concepto será obligatorio para finalizar.
- Fundamentos de Derecho será obligatorio para finalizar, sujeto a validación del formato.
- Tipo de evento y origen serán obligatorios.
- Cambiar el tipo de evento revalidará los campos condicionales de Información y Fundamentos.
- La UI mostrará advertencias antes de limpiar datos de accidente que dejan de aplicar.

## 13. Panel derecho y finalización

El panel derecho mostrará:

- Estado del Formulario de Origen.
- Versión actual.
- Progreso `n de 5 secciones completas`.
- Lista resumida de secciones incompletas.
- Estado del guardado.
- Acción Guardar borrador.
- Acción Finalizar formulario.
- Vista previa del certificado cuando esté disponible.

### 13.1 Finalización

El caso de uso `FinalizarFormularioOrigen` deberá:

1. Verificar `formulario_origen.finalize`.
2. Verificar asignación y alcance sobre el expediente.
3. Verificar estado `BORRADOR` o `REABIERTO`.
4. Bloquear la fila o comprobar versión optimista.
5. Validar todas las secciones en servidor.
6. Generar y persistir el número definitivo.
7. Crear snapshot de versión.
8. Registrar actor y fecha.
9. Cambiar el estado a `FINALIZADO`.
10. Limpiar el indicador local de borrador.
11. Habilitar el PCL.
12. Registrar el evento de historial.
13. Confirmar la operación en una transacción.

Si existen errores:

- No habrá finalización parcial.
- La respuesta agrupará errores por pestaña y campo.
- La interfaz mostrará un resumen con enlaces.
- El foco se moverá al primer error.

## 14. Listado de Dictámenes

El listado distinguirá etapa y estado. Se recomienda:

| Columna | Contenido |
| --- | --- |
| Fecha | Fecha del documento correspondiente a la etapa |
| Secretaría | Secretaría del docente |
| Documento | Identificación del docente |
| Docente | Nombre completo |
| Etapa | Formulario de Origen, Dictamen PCL o Flujo anterior |
| Estado | Borrador, Finalizado, Habilitado, Pendiente, Cerrado o Reabierto |
| Médico | Responsable |
| Acciones | Acciones disponibles por estado y permiso |

Acciones posibles:

- Diligenciar/continuar Formulario de Origen.
- Ver Formulario de Origen.
- Diligenciar/continuar PCL.
- Ver PCL.
- Reabrir.

Antes de finalizar Origen, PCL aparecerá bloqueado con explicación visible:

> Debes finalizar el Formulario de Determinación de Origen para diligenciar el Dictamen PCL.

No se dependerá exclusivamente de iconos. En escritorio se usarán etiquetas o tooltips accesibles; en móvil podrá utilizarse un menú de acciones con nombres completos.

## 15. Reapertura unificada

### 15.1 Botón y modal

El listado y/o detalle tendrá un único botón `Reabrir`. Al activarlo se abrirá el modal:

**Título:** Reabrir documento
**Pregunta:** ¿Qué documento deseas reabrir?

Las opciones se calcularán en el servidor según:

- Estado.
- Dependencias.
- Permisos.
- Asignación o alcance.

Cuando ambos estén cerrados se mostrarán tarjetas o radios:

- Formulario de Determinación de Origen.
- Dictamen PCL.

Después de seleccionar:

- Motivo de reapertura obligatorio.
- Descripción del motivo.
- Observación adicional según configuración.
- Confirmación específica del documento.

### 15.2 Matriz de elegibilidad

| Origen | PCL | Opciones |
| --- | --- | --- |
| `FINALIZADO` | Pendiente o reabierto | Solo Origen |
| `FINALIZADO` | Cerrado | Origen o PCL |
| `BORRADOR` o `REABIERTO` | Cerrado | No mostrar PCL |
| `BORRADOR` o `REABIERTO` | Pendiente o reabierto | No hay documento elegible |
| `FINALIZADO` | No iniciado | Solo Origen |

Además:

- Sin `formulario_origen.reopen`, no aparecerá Origen.
- Sin `dictamen.reopen`, no aparecerá PCL.
- Sin opciones elegibles, no se mostrará el botón.
- El backend repetirá toda validación al confirmar.

### 15.3 Reabrir Origen

Al reabrir Origen:

1. Se conserva la versión finalizada anterior.
2. Se cambia Origen a `REABIERTO`.
3. Se incrementa la versión de trabajo.
4. Se bloquea la edición del PCL mientras Origen esté abierto.
5. Si PCL ya fue iniciado, se marca `pclRequiereRevision = true`.
6. PCL no se reabre automáticamente.
7. Se registra motivo, observación, actor y fecha.

Si PCL estaba cerrado:

- Permanece cerrado y vinculado a la versión de Origen utilizada.
- Continúa disponible como documento histórico.
- Se presenta como pendiente de revisión frente a la nueva versión de Origen.
- Después de finalizar nuevamente Origen, PCL podrá reabrirse mediante el mismo modal.

Si PCL estaba pendiente:

- Permanece pendiente, pero bloqueado.
- Al finalizar nuevamente Origen, recupera edición y conserva la advertencia de revisión.

### 15.4 Reabrir PCL

PCL solo podrá reabrirse si:

- Está cerrado.
- Origen está `FINALIZADO` o el flujo es `LEGACY`.
- El usuario tiene `dictamen.reopen`.
- Se seleccionó un motivo habilitado para PCL.

Al reabrir PCL se conservarán las reglas actuales de historial y bloqueo.

### 15.5 Concurrencia

La reapertura enviará:

- Objetivo: `ORIGEN` o `PCL`.
- Motivo.
- Observación.
- Versión esperada del expediente/documento.

Si el estado cambió mientras el modal estaba abierto, el servidor responderá conflicto y la interfaz actualizará las opciones.

## 16. Permisos y Administración

Se añadirán:

- `formulario_origen.read`.
- `formulario_origen.edit`.
- `formulario_origen.finalize`.
- `formulario_origen.reopen`.

Se conservarán los permisos `dictamen.*` para PCL.

Reglas:

1. Los permisos se asignarán mediante la administración RBAC existente.
2. No se comprobarán nombres de rol en componentes o APIs.
3. Reabrir Origen y reabrir PCL serán permisos independientes.
4. Ocultar una acción no sustituirá la autorización del servidor.
5. La lectura de versiones e historial respetará los permisos de lectura del documento.

### 16.1 Motivos de reapertura

El catálogo actual deberá admitir alcances configurables:

- Formulario de Origen.
- Dictamen PCL.
- Recomendación, para preservar el dominio existente.

Se recomienda una relación de alcances por motivo en lugar de un enum limitado `ORIGEN/PCL/AMBOS`, porque el catálogo ya puede ser compartido por otros documentos.

Administración permitirá:

- Crear y editar motivos.
- Activar o desactivar.
- Definir descripción.
- Definir documentos en los que aplica.
- Definir si exige observación adicional.

## 17. Diseño de APIs y casos de uso

Las rutas serán delgadas. Validación, transacciones y reglas vivirán en casos de uso o servicios de aplicación.

### 17.1 Registro

```text
POST /api/dictamenes/casos
```

Responsabilidad:

- Crear/actualizar docente.
- Crear expediente.
- Crear Origen borrador.
- Responder de forma idempotente.

El POST actual de `/api/dictamenes/medico` podrá mantenerse temporalmente para compatibilidad, pero la UI nueva no deberá orquestar dos solicitudes independientes.

### 17.2 Formulario de Origen

```text
GET   /api/dictamenes/[id]/origen
PATCH /api/dictamenes/[id]/origen/descripcion
PUT   /api/dictamenes/[id]/origen/historial-laboral
PATCH /api/dictamenes/[id]/origen/informacion-fundamentos
PUT   /api/dictamenes/[id]/origen/diagnosticos
PATCH /api/dictamenes/[id]/origen/sustentacion
POST  /api/dictamenes/[id]/origen/finalizar
GET   /api/dictamenes/[id]/origen/versiones
GET   /api/dictamenes/[id]/origen/pdf
```

Los nombres exactos podrán adaptarse a las convenciones existentes, manteniendo una responsabilidad por sección y contratos tipados.

### 17.3 Reapertura

```text
GET  /api/dictamenes/[id]/reapertura/opciones
POST /api/dictamenes/[id]/reapertura
```

El endpoint existente de reapertura PCL podrá delegar al nuevo caso de uso durante la transición.

### 17.4 Contratos y validación

- Schemas Zod compartidos entre transporte y aplicación cuando sea apropiado.
- Respuestas de error con código estable, mensaje y errores por campo.
- Fechas en formato ISO sin ambigüedad.
- No registrar cuerpos clínicos completos en logs.
- Toda mutación comprobará permisos, estado y versión.

## 18. Protección del PCL

La interfaz no será la única barrera.

Deberán protegerse:

- Página PCL.
- Lectura editable del detalle.
- Actualización general.
- Procedimiento.
- Antecedentes.
- Diagnósticos.
- Deficiencias.
- AVD–AIVD.
- Capítulo 2.
- Título III.
- Sustentación.
- Cierre.
- Reapertura.
- Generación del documento vigente.

Comportamiento:

- Sin Origen finalizado: responder con estado de conflicto o acceso bloqueado y una razón estable.
- La página redirigirá a Origen cuando el usuario pueda editarlo.
- En solo lectura se podrá mostrar la causa del bloqueo.
- Los registros `LEGACY` omitirán el prerrequisito.

## 19. Certificado/PDF de Origen

El certificado se generará desde la versión finalizada, no desde un borrador mutable.

Reglas:

- Número y fecha definitivos.
- Datos del docente como snapshot.
- Orden estable de historial laboral y soportes.
- `N.A.` únicamente para elementos `NO_APLICA`.
- `No aportado` se imprimirá diferente de `N.A.`.
- Día de la semana calculado.
- Versión del formato.
- Médico responsable y fecha de emisión.
- Una versión histórica seguirá reproduciendo su snapshot original.

La vista previa de borrador deberá indicar claramente que no es un documento final.

## 20. Compatibilidad y migración

### 20.1 Registros existentes

Todos los dictámenes existentes antes de la migración se marcarán:

```text
flujoVersion = LEGACY
```

No se crearán formularios de Origen finalizados ficticios.

Los nuevos expedientes se crearán:

```text
flujoVersion = ORIGEN_PREVIO
```

### 20.2 Estrategia de migración

1. Añadir enums y tablas nuevas.
2. Añadir campos compatibles y nullables a `Dictamen`.
3. Establecer `LEGACY` para registros existentes.
4. Crear índices y restricciones uno a uno.
5. Extender catálogo de permisos.
6. Extender alcances de motivos sin eliminar relaciones actuales.
7. Desplegar lectura compatible.
8. Activar creación del nuevo flujo mediante bandera o despliegue coordinado.
9. Verificar métricas y errores.
10. Retirar gradualmente el POST antiguo cuando no tenga consumidores.

La migración deberá ser reversible a nivel de aplicación mientras no existan nuevos documentos finalizados. No se eliminarán columnas PCL.

## 21. Validación de finalización

Como mínimo:

### Documento

- Fecha de Dictamen de Origen requerida.
- Número generado por servidor.

### Descripción

- Descripción requerida, sujeta a confirmación del formato.

### Historial laboral

- Al menos un registro completo.
- Institución de catálogo o nombre manual.
- Cargo.
- Riesgos laborales.
- Jornada laboral.
- Tiempo de exposición válido.

### Información y Fundamentos

- Todos los soportes fijos con estado explícito.
- Si `APORTADO`, fecha y `Se tuvo en cuenta`.
- Si `NO_APLICA`, no exigir contenido.
- Si accidente, fecha, hora y jornada.

### Diagnóstico y tratamiento

- Al menos un diagnóstico.
- Exactamente un diagnóstico principal.
- Códigos CIE-10 válidos y sin duplicados incompatibles.

### Sustentación

- Concepto.
- Fundamentos de Derecho, si el formato lo exige.
- Tipo de evento.
- Origen.

Las reglas finales deberán ser versionadas por `formatoVersion`.

## 22. Reglas contra código espagueti

1. No copiar `DictamenLeftPanel` para borrar el selector de procedimiento.
2. No copiar `TabDiagnosticos` cambiando solamente el endpoint.
3. No reutilizar las mismas filas de base de datos para diagnósticos de Origen y PCL.
4. No añadir campos de Origen directamente a componentes PCL.
5. No mantener más de una función para generar el número.
6. No guardar una segunda etapa persistida si puede derivarse de estados canónicos.
7. No confiar en un botón deshabilitado para proteger PCL.
8. No realizar transiciones de estado desde componentes visuales.
9. No mezclar consultas Prisma con renderizado.
10. No utilizar roles cuando existen permisos.
11. No guardar el formulario completo únicamente como JSON.
12. No inferir N.A. por ausencia de texto.
13. No sobrescribir snapshots finalizados.
14. No registrar datos clínicos completos en consola o auditoría técnica.
15. No crear endpoints genéricos que acepten campos arbitrarios.
16. No duplicar schemas de validación entre finalización y guardado.
17. No usar `any` para contratos del formulario.
18. No depender exclusivamente de Dexie para conservar el trabajo.
19. No generar un PDF final desde datos no finalizados.
20. Mantener componentes de presentación, hooks, casos de uso y repositorios en capas distinguibles.

## 23. Estructura de código sugerida

```text
src/features/formulario-origen/
├── domain/
│   ├── estados.ts
│   ├── policies.ts
│   ├── numero-dictamen.ts
│   └── validation.ts
├── application/
│   ├── registrar-caso-dictamen.ts
│   ├── guardar-seccion-origen.ts
│   ├── finalizar-formulario-origen.ts
│   ├── obtener-opciones-reapertura.ts
│   └── reabrir-documento.ts
├── infrastructure/
│   └── prisma-formulario-origen-repository.ts
└── presentation/
    ├── FormularioOrigenPage.tsx
    ├── FormularioOrigenLeftPanel.tsx
    ├── FormularioOrigenCenterPanel.tsx
    ├── FormularioOrigenRightPanel.tsx
    └── tabs/
```

Los componentes realmente compartidos vivirán en una ubicación neutral, por ejemplo:

```text
src/components/clinical-document/
```

No se moverán componentes PCL sin necesidad. La extracción será incremental y deberá mantener pruebas de regresión.

## 24. Plan de implementación

### Fase 0: Validación funcional

1. Obtener el formato oficial aprobado.
2. Confirmar campos y obligatoriedad.
3. Confirmar contenido del PDF.
4. Confirmar tratamiento y soportes.
5. Asignar `formatoVersion`.

### Fase 1: Fundaciones compartidas

1. Unificar el generador de número.
2. Añadir pruebas del generador.
3. Extraer `DocenteSummaryCard`.
4. Extraer `DocumentMetaCard`.
5. Generalizar el layout y tabs.
6. Extraer `DiagnosticosEditor`.
7. Extraer `TipoEventoOrigenSelector`.
8. Verificar que PCL no cambió funcionalmente.

### Fase 2: Persistencia y RBAC

1. Añadir modelos, enums e índices.
2. Migrar registros actuales a `LEGACY`.
3. Crear permisos de Origen.
4. Extender motivos y alcances.
5. Añadir repositorios y políticas.

### Fase 3: Registro y flujo

1. Implementar `RegistrarCasoDictamen`.
2. Hacer la operación transaccional e idempotente.
3. Redirigir a Origen.
4. Actualizar listado con etapa/estado.
5. Proteger PCL.

### Fase 4: Formulario

1. Implementar página y paneles.
2. Implementar Descripción.
3. Implementar Historial laboral.
4. Implementar Información y Fundamentos.
5. Implementar Diagnóstico y tratamiento.
6. Implementar Sustentación.
7. Añadir autosave y recuperación.
8. Añadir progreso y validación por pestaña.

### Fase 5: Finalización y PCL

1. Implementar validación integral.
2. Crear snapshot.
3. Bloquear Origen.
4. Habilitar PCL.
5. Copiar diagnósticos de forma idempotente.
6. Registrar versión utilizada por PCL.

### Fase 6: Reapertura

1. Implementar cálculo server-side de opciones.
2. Construir modal unificado.
3. Filtrar motivos por alcance.
4. Reabrir Origen.
5. Reabrir PCL.
6. Bloquear PCL durante reapertura de Origen.
7. Implementar revisión requerida.

### Fase 7: PDF, auditoría y endurecimiento

1. Generar PDF desde snapshot.
2. Imprimir N.A. explícito.
3. Completar historial y versiones.
4. Añadir protección de datos en logs y borradores locales.
5. Ejecutar pruebas de concurrencia y seguridad.

## 25. Estrategia de pruebas

### 25.1 Unitarias

- Generación canónica del número.
- Día de la semana en `America/Bogota`.
- Máquina de estados de Origen.
- Política `canAccessPcl`.
- Política `canEditPcl`.
- Elegibilidad de reapertura.
- Filtrado de motivos por alcance.
- Validación condicional Accidente/Enfermedad.
- Validación Aportado/No aportado/No aplica.
- Cálculo de progreso.
- Copia idempotente de diagnósticos.

### 25.2 Integración

- Registro transaccional completo.
- Rollback si falla la creación de Origen.
- Idempotencia ante reintento.
- Rechazo de expediente duplicado incompatible.
- Guardado de cada sección.
- Concurrencia con versión obsoleta.
- Finalización atómica.
- Snapshot correcto.
- Bloqueo de todas las APIs PCL.
- Reapertura por objetivo.
- Permisos independientes.
- Motivos por alcance.
- Compatibilidad `LEGACY`.

### 25.3 UI

- Fecha actualiza la previsualización del número.
- No aparece Procedimiento A/B.
- Tabs conservan estado.
- Repeater laboral agrega y elimina.
- Combobox de institución maneja carga, vacío y error.
- Día de semana no es editable.
- Jornada es exclusiva.
- Acordeones reflejan estado.
- N.A. requiere selección explícita.
- Diagnóstico principal se valida.
- Guardado muestra feedback.
- Finalización enfoca el primer error.
- Solo lectura se distingue de deshabilitado.
- Modal de reapertura muestra opciones correctas.

### 25.4 Extremo a extremo

1. Registrar docente nuevo.
2. Crear Origen borrador.
3. Confirmar PCL bloqueado por UI y URL.
4. Completar cinco pestañas.
5. Finalizar Origen.
6. Abrir y cerrar PCL.
7. Con ambos cerrados, elegir reabrir Origen.
8. Confirmar PCL histórico y revisión requerida.
9. Finalizar nueva versión de Origen.
10. Reabrir PCL con permiso y motivo.

Casos adicionales:

- Ambos cerrados y elegir PCL.
- Solo permiso de reapertura de Origen.
- Solo permiso de reapertura PCL.
- Sin permisos.
- Motivo inactivo.
- Estado cambiado mientras el modal estaba abierto.
- Dictamen histórico `LEGACY`.

### 25.5 Accesibilidad y responsive

- Navegación completa por teclado.
- Tablist con roles y estados correctos.
- Acordeones con `aria-expanded` y relación encabezado/panel.
- Labels visibles y asociados.
- Errores anunciados.
- Foco visible.
- No depender solo del color.
- Objetivos táctiles de al menos 44 por 44 px.
- Sin scroll horizontal de página a 375, 768, 1024 y 1440 px.
- Contenido no cubierto por elementos sticky.
- Contraste mínimo WCAG AA.
- Respeto de `prefers-reduced-motion`.

## 26. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Acoplar Origen al PCL | Entidades, endpoints y contenedores independientes |
| Regresión en PCL al extraer componentes | Refactor incremental y pruebas antes de construir Origen |
| Datos perdidos por borrador local | Servidor como fuente de verdad y recuperación local temporal |
| Estados contradictorios | Máquina de estados y políticas centralizadas |
| Acceso PCL por URL | Guards en página y todas las APIs |
| PCL basado en Origen modificado | Versiones, `origenVersionUtilizadaPcl` y revisión requerida |
| N.A. incorrecto por campos vacíos | Estado explícito por soporte |
| Números diferentes cliente/servidor | Generador canónico único |
| Duplicados por doble envío | Transacción e idempotencia |
| Ediciones simultáneas | Control de versión optimista |
| Catálogo histórico incompleto | ID nullable y snapshot de nombre |
| Motivos mezclados entre documentos | Alcances configurables |
| Filtración de información clínica | No loguear payloads y controlar borradores locales |
| Formato legal cambiante | `formatoVersion` y snapshots inmutables |

## 27. Criterios de aceptación

1. Un nuevo expediente inicia en Formulario de Origen `BORRADOR`.
2. La creación de docente, expediente y Origen es transaccional.
3. Un reintento no crea expedientes duplicados.
4. La pantalla de Origen mantiene la metodología visual del PCL.
5. No aparece selección de procedimiento A/B.
6. La fecha genera una previsualización del número mediante la regla canónica.
7. Origen y PCL conservan fechas y números independientes.
8. La información del docente utiliza un componente compartido.
9. Las cinco pestañas acordadas están disponibles.
10. Historial laboral permite múltiples instituciones.
11. Institución y cargo conservan snapshots históricos.
12. El día de la semana se calcula automáticamente.
13. Jornada Normal/Extra es una selección exclusiva.
14. Cada soporte exige Aportado, No aportado o N.A.
15. El certificado imprime N.A. solo cuando fue seleccionado.
16. Diagnósticos de Origen son independientes de PCL.
17. Los diagnósticos pueden copiarse al PCL sin compartir registros.
18. Los borradores se guardan en servidor y pueden reanudarse.
19. Finalizar valida todas las pestañas en servidor.
20. Un Origen finalizado queda en solo lectura y crea snapshot.
21. PCL permanece bloqueado hasta finalizar Origen.
22. El bloqueo también se aplica a acceso directo y APIs.
23. El listado muestra etapa, estado y acciones coherentes.
24. El botón Reabrir abre un modal único.
25. Con Origen y PCL cerrados se puede elegir cuál reabrir.
26. PCL no aparece como opción mientras Origen esté abierto o reabierto.
27. Motivo de reapertura es obligatorio y filtrado por alcance.
28. Los permisos de reapertura de Origen y PCL son independientes y administrables.
29. Reabrir Origen conserva la versión anterior.
30. Reabrir Origen bloquea PCL y activa revisión cuando corresponda.
31. Reabrir Origen no reabre automáticamente PCL.
32. La concurrencia obsoleta produce conflicto recuperable.
33. Los dictámenes `LEGACY` continúan funcionando.
34. No se crean formularios históricos ficticios.
35. PDF, historial y versiones utilizan snapshots inmutables.
36. Pruebas, lint, TypeScript y build finalizan correctamente.
37. El flujo es usable con teclado y en dispositivos móviles.

## 28. Definición de terminado

La implementación estará terminada cuando:

- El formato aprobado y su versión estén documentados.
- La migración haya sido ejecutada y validada.
- Los permisos sean administrables.
- El registro transaccional esté activo.
- Las cinco pestañas guarden y recuperen datos.
- El PCL esté protegido por una política server-side única.
- Finalización, PDF, versiones y auditoría funcionen.
- La reapertura unificada respete estados, dependencias, motivos y permisos.
- Los registros históricos pasen regresión.
- Todas las pruebas críticas estén automatizadas.
- No existan errores de TypeScript, lint o build.
- Se haya verificado escritorio, tablet, móvil y teclado.
- La revisión de código confirme separación de responsabilidades y ausencia de lógica duplicada.

## 29. Referencias funcionales

- Decreto 1655 de 2015, determinación del origen y calificación PCL para educadores.
- Resolución 156 de 2005, reporte de accidente o enfermedad como elemento probatorio.
- Resolución 1843 de 2025, antecedentes ocupacionales y soportes de evaluaciones médicas.
- Spec del módulo: `docs/specs/2026-07-22-medicina-laboral.md`.

Estas referencias no sustituyen la validación jurídica y clínica de la versión exacta del formulario institucional.
