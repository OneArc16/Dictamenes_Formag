# Dictamy — Guion para presentar el proyecto

Presentación en español basada en el código y documentación local. Las primeras 17 diapositivas forman el recorrido principal (12–15 minutos); la 18 es un anexo técnico. Los diagramas son ilustrativos, sin datos de pacientes. Los beneficios son esperados y los indicadores se proponen para un piloto. No se verificó un despliegue productivo.

El PowerPoint incluye estas explicaciones en sus notas del presentador. La versión PDF conserva el contenido visual. Todos los textos y diagramas del PowerPoint son editables.

## 01. Dictamy — Portada

Apertura sugerida: “Dictamy es una plataforma web para organizar procesos de medicina laboral dirigidos a docentes. Reúne la disponibilidad de los médicos, la recepción del paciente y la elaboración de documentos con seguimiento de sus cambios”. El nombre Dictamy aparece en la interfaz; el contexto FOMAG se toma del proyecto. En esta exposición hablaremos de funciones implementadas en el repositorio y del valor que se espera validar en operación. Duración sugerida: 12–15 minutos para las primeras 17 diapositivas; la 18 es un anexo técnico.

Fuentes revisadas:
- `src/app/login/page.tsx`
- `src/components/home/HomeHeader.tsx`
- `package.json`

## 02. ¿Qué hace Dictamy?

La propuesta es reunir procesos que suelen requerir coordinación entre varios equipos. El usuario ingresa desde el navegador y ve los módulos que su perfil tiene autorizados. PCL significa pérdida de capacidad laboral. El sistema organiza la información y apoya el cálculo y la documentación; la valoración y la sustentación corresponden al profesional responsable. No se ha comprobado aquí el uso productivo, el número de usuarios ni el volumen de casos.

Fuentes revisadas:
- `src/lib/module-navigation.ts`
- `src/app/inicio/page.tsx`

## 03. Problemas que el proyecto busca resolver

Presentar estas dificultades como necesidades a las que responde el diseño, no como resultados de una encuesta institucional. Cada problema tiene una función verificable: formularios y directorio para centralizar; cálculos y PDF para reducir digitación; control de cupos para coordinar citas; estados para seguimiento; historial y permisos para controlar cambios. Evitar porcentajes de ahorro o reducción de errores: no se encontraron mediciones que permitan afirmarlos.

Fuentes revisadas:
- `src/lib/module-navigation.ts`
- `src/features/reception/application/reception-service.ts`
- `src/lib/admin/auditoria.ts`
- `src/components/dictamen/DictamenRightPanel.tsx`

## 04. ¿Quiénes lo utilizan?

Aquí se describen responsabilidades operativas. Gestión de agenda no implica que exista un rol técnico adicional con ese nombre: su acceso depende de permisos. Los roles base identificados son administración, médico y admisiones, con perfiles configurables. El docente es beneficiario y titular de la información; no se encontró un portal de autoservicio del paciente que deba presentarse como función implementada.

Fuentes revisadas:
- `src/lib/module-navigation.ts`
- `src/lib/auth/authorization.ts`
- `src/app/admin/perfiles/[id]/permisos/page.tsx`

## 05. Cuatro módulos, un entorno de trabajo

El mapa se toma de la definición de navegación del sistema. La determinación de origen está dentro del flujo de dictámenes en Medicina Laboral. Admisiones incluye tanto la consulta operativa de dictámenes como la recepción de pacientes. Agenda administra oferta de atención. Administración organiza el acceso y la configuración. La cantidad de cuatro corresponde a módulos visibles definidos en código, no a una estimación.

Fuentes revisadas:
- `src/lib/module-navigation.ts`

## 06. De la planificación al documento

Este diagrama es conceptual: ilustra una secuencia de trabajo y no promete que al agendar se cree automáticamente un dictamen. Agenda y recepción comparten cupos; los casos clínicos se administran mediante sus propios flujos. La atención clínica confirmada requiere una integración autorizada. En el flujo nuevo de dictámenes se finaliza el formulario de origen antes de iniciar la PCL; existen excepciones de compatibilidad para registros previos. Una recomendación laboral también dispone de su propio ciclo documental.

Fuentes revisadas:
- `src/features/reception/application/reception-service.ts`
- `src/features/formulario-origen/application/registrar-caso-dictamen.ts`
- `src/features/formulario-origen/domain/policies.ts`

## 07. Planificar la disponibilidad con control

Explicar un ejemplo: el responsable elige sede y médicos, define el período y los minutos de consulta, y revisa el resultado antes de confirmar. Se admiten horarios temporales y duración individual sin reemplazar la configuración permanente. Los festivos de Colombia y las exclusiones forman parte del manejo de fechas. El calendario mostrado es una ilustración, no una captura ni una agenda real. La lógica implementa controles de conflictos y repetición segura de una confirmación.

Fuentes revisadas:
- `src/features/agenda/application/agenda-service.ts`
- `src/features/agenda/application/schedule-service.ts`
- `docs/history/agenda-medica-2026-07.md`

## 08. Gestionar la cita desde una misma vista

En recepción se busca un paciente del directorio institucional y se puede actualizar su perfil. La disponibilidad guía la selección de especialidad, fecha, médico y hora. Al cancelar, el historial conserva la cita y el cupo se libera; al reprogramar, se relaciona la cita original con la nueva. Activar no equivale a marcar como atendida: el estado ATENDIDA proviene de una integración clínica autorizada. El recordatorio es un PDF para abrir o imprimir, no un servicio de envío automático por WhatsApp, correo o SMS. Los medios de solicitud son datos de registro.

Fuentes revisadas:
- `src/features/reception/presentation/PatientReceptionPage.tsx`
- `src/features/reception/application/reception-service.ts`
- `src/features/reception/application/reminder-document-service.ts`

## 09. Determinar el origen con información estructurada

Las cinco secciones corresponden a pestañas implementadas. La plataforma ayuda a ordenar fundamentos y a registrar el concepto; no determina el origen de forma autónoma. En los casos que usan el flujo ORIGEN_PREVIO, se exige finalizar esta etapa antes de iniciar PCL. Al reabrir el origen, la PCL queda bloqueada durante la corrección. Existen condiciones de compatibilidad para casos LEGACY y borradores con PCL ya iniciada; por eso la regla se presenta como propia del flujo nuevo. Las versiones conservan la referencia empleada por la PCL.

Fuentes revisadas:
- `src/features/formulario-origen/presentation/FormularioOrigenCenterPanel.tsx`
- `src/features/formulario-origen/domain/policies.ts`
- `src/lib/dictamen/pcl-access.ts`

## 10. Apoyar la valoración de pérdida de capacidad laboral

El formulario contempla antecedentes, diagnóstico y tratamiento, deficiencias, actividades de la vida diaria e instrumentales, limitación laboral, análisis ocupacional y sustentación. Las secciones aplicables dependen del procedimiento A o B configurado; no deben presentarse todas como obligatorias para cada caso. La interfaz consolida los totales y permite cerrar el dictamen, que pasa a estar bloqueado para edición hasta una reapertura autorizada. Esta presentación describe el software; no certifica las fórmulas ni realiza una interpretación clínica o normativa. No se incluyen porcentajes de un caso real.

Fuentes revisadas:
- `src/components/dictamen/DictamenCenterPanel.tsx`
- `src/components/dictamen/DictamenRightPanel.tsx`
- `src/app/api/dictamenes/[id]/cerrar/route.ts`
- `src/lib/react-pdf/DictamenReactPdf.tsx`

## 11. Convertir el concepto médico en un documento

Este módulo dispone de un documento propio, separado del formulario PCL. Permite registrar los exámenes, el motivo y el texto de recomendaciones, observaciones y restricciones. El ciclo principal mostrado es borrador, cierre y reapertura; el modelo también contempla un estado anulada. La reapertura exige permisos y un motivo configurado, y el historial conserva los eventos. No se está afirmando que el sistema supervise automáticamente la aplicación de las recomendaciones en el lugar de trabajo.

Fuentes revisadas:
- `src/components/recomendaciones/detail/RecomendacionTabFormulario.tsx`
- `src/components/recomendaciones/detail/RecomendacionDetalleRightPanel.tsx`
- `src/lib/recomendaciones/historial.ts`

## 12. Saber quién puede actuar y qué cambió

Los permisos se resuelven desde perfiles y se validan en el servidor. Hay reglas de acceso al caso y controles de sede para agenda y recepción. Dictámenes y recomendaciones registran eventos de edición, cierre y reapertura; recepción tiene historial y auditoría propios. La exportación CSV/Excel mostrada corresponde al módulo de auditoría de dictámenes y recomendaciones, no a todos los datos del sistema. Son controles implementados: no equivalen por sí solos a una certificación de seguridad o cumplimiento normativo.

Fuentes revisadas:
- `src/lib/auth/authorization.ts`
- `src/lib/auth/case-scope.ts`
- `src/features/agenda/application/agenda-creation-scope.ts`
- `src/lib/admin/auditoria.ts`
- `src/app/api/admin/auditoria/export/route.ts`

## 13. Información lista para consultar y compartir

Las rutas de generación de PDF están presentes para origen, PCL y recomendaciones. Recepción genera un recordatorio de la cita para abrir o imprimir; el documento requiere la clave institucional correspondiente en el entorno. Auditoría exporta registros filtrados a CSV o XLSX. No se muestran formatos con pacientes reales. Los diagramas de esta presentación son ilustrativos y editables. La generación de documentos no implica envío automático ni firma digital certificada.

Fuentes revisadas:
- `src/app/api/dictamenes/[id]/origen/pdf/route.ts`
- `src/app/api/dictamenes/[id]/pdf-react/route.ts`
- `src/app/api/recomendaciones/[id]/pdf-react/route.ts`
- `src/features/reception/application/reminder-document-service.ts`
- `src/app/api/admin/auditoria/export/route.ts`

## 14. Un docente requiere una valoración laboral

Narración sugerida: “Un docente necesita una valoración. Primero debe existir disponibilidad médica; luego admisiones busca al paciente y asigna la cita. Los cambios de fecha quedan registrados. El médico documenta la valoración en el flujo que corresponda y, una vez revisado, cierra y genera el documento. Más adelante un usuario autorizado puede consultar el estado o revisar una modificación”. Es un ejemplo conceptual, sin datos personales ni supuestos resultados médicos. La cita y el dictamen tienen flujos propios; no se ha verificado una creación automática del segundo a partir de la primera.

Fuentes revisadas:
- `src/features/reception/application/reception-service.ts`
- `src/features/formulario-origen/application/origin-service.ts`
- `src/components/dictamen/DictamenRightPanel.tsx`

## 15. Qué mejora y cómo comprobarlo

No se encontraron métricas de impacto del proyecto, por lo que los beneficios se expresan como hipótesis a validar. Se propone tomar una línea base antes del piloto y comparar un período equivalente después. Para citas, medir tiempos y ocupación; para documentos, devoluciones y tiempo hasta el cierre; para trazabilidad, verificar la presencia de motivos y eventos. Estos indicadores son una propuesta de evaluación y no se presentan como un tablero analítico ya implementado. No comprometer porcentajes de ahorro sin evidencia.

Fuentes revisadas:
- `src/lib/module-navigation.ts`
- `prisma/schema.prisma`

## 16. Funciones implementadas y próximos pasos

La revisión confirma archivos de interfaz, rutas, servicios, modelos y pruebas para las funciones descritas, pero no acredita despliegue productivo ni éxito en todos los entornos. El procesador de eventos clínicos existe, pero su comentario técnico indica que no expone endpoint HTTP hasta contar con el verificador institucional. La documentación de recepción lista catálogos, formatos, fuentes de soporte clínico y configuración de secretos pendientes de la institución. Antes de uso real corresponde confirmar el estado de esos insumos, migraciones, permisos y pruebas integrales. Se presenta como próximos pasos de implementación, no como una auditoría de cumplimiento.

Fuentes revisadas:
- `src/features/reception/application/clinical-inbox-service.ts`
- `docs/history/patient-reception-2026-07.md`
- `package.json`

## 17. Cierre

Cierre sugerido: “El valor de Dictamy está en reunir el trabajo operativo y documental en una plataforma con responsabilidades y seguimiento. La siguiente etapa es validar el flujo con los usuarios, completar la configuración institucional y medir el resultado de un piloto”. Abrir espacio para preguntas sobre funciones o una demostración. Si la audiencia es no técnica, finalizar aquí; la siguiente diapositiva es un anexo para explicar la base tecnológica.

Fuentes revisadas:
- `src/lib/module-navigation.ts`
- `docs/history/patient-reception-2026-07.md`

## 18. Base técnica del proyecto

La arquitectura se describe a partir de package.json, las carpetas del código y el esquema Prisma. Next.js y React construyen la interfaz; TypeScript y validaciones estructuran los contratos; Prisma accede a PostgreSQL. Agenda, recepción y origen cuentan con separación de dominio, aplicación y presentación. La generación de PDF usa librerías incluidas en el proyecto. Hay scripts de pruebas para navegación, origen, agenda y recepción. En esta tarea no se ejecutaron pruebas de toda la aplicación ni se certificó su rendimiento: la verificación realizada corresponde a la presentación. No se infiere escalabilidad, alta disponibilidad o integración FOMAG externa a partir del nombre del proyecto.

Fuentes revisadas:
- `package.json`
- `prisma/schema.prisma`
- `src/features/agenda`
- `src/features/reception`
- `src/features/formulario-origen`

## Demostración sugerida (opcional, 5 minutos)

1. Ingresar con un usuario de demostración y mostrar sus módulos.
2. En Agenda, configurar una disponibilidad y revisar la vista previa.
3. En Recepción, consultar un paciente ficticio y mostrar cupos e historial.
4. Abrir un caso de demostración y explicar origen, PCL y cierre.
5. Mostrar una salida PDF y un registro de auditoría.

Utilizar un entorno de demostración y registros ficticios. Si no hay un entorno preparado, los diagramas de esta presentación permiten explicar el recorrido.

## Preguntas frecuentes

**¿El sistema toma la decisión médica?** La plataforma organiza datos, aplica cálculos programados y genera documentos; la valoración y su sustentación corresponden al profesional.

**¿Envía recordatorios por WhatsApp o correo?** La función identificada genera un recordatorio PDF. El medio de solicitud de cita es un dato de registro, no una integración de mensajería.

**¿Cuenta con historia clínica externa integrada?** Existe un procesador para eventos clínicos verificados. El código documenta que falta conectar el verificador institucional y no expone todavía ese endpoint externo.

**¿Cuánto tiempo ahorra?** No hay una medición de impacto verificada. Se propone comparar tiempos e indicadores antes y después de un piloto.

**¿Está listo en producción?** La revisión demuestra implementación en el repositorio. El estado de despliegue, configuración institucional y validación integral debe confirmarse en el entorno objetivo.

## Reproducir los archivos

El generador `generar-presentacion.cjs` utiliza PptxGenJS y las dependencias transitivas PDFKit/Sharp del proyecto. Por defecto busca PptxGenJS en `/tmp/dictamy-presentation-tools/node_modules/pptxgenjs`; también acepta `PPTXGENJS_PATH` con otra ubicación.

Ejecutar desde la raíz: `node docs/presentacion/generar-presentacion.cjs`.