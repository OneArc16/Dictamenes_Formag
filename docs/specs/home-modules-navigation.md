# Especificación técnica: Home de módulos y navegación lateral adaptativa

| Campo | Valor |
| --- | --- |
| Estado | Implementado |
| Rama de trabajo | `home` |
| Producto | Dictámenes Formag / Dictamy |
| Stack actual | Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Prisma |
| Última actualización | 2026-07-17 |

## 1. Resumen ejecutivo

Después de autenticarse, toda persona debe llegar a un Home que muestre exclusivamente los módulos a los que tiene acceso. Al seleccionar un módulo, la aplicación debe utilizar una navegación lateral común y persistente que permita cambiar entre los módulos autorizados.

En escritorio, la navegación se presentará como un rail compacto con iconos. Al recibir hover o foco de teclado, se expandirá dentro del layout sin cubrir el contenido y podrá fijarse abierta mediante una acción explícita. En dispositivos táctiles se utilizará un drawer accionado por un botón visible; el acceso nunca dependerá únicamente del hover.

La autorización se resolverá en el servidor a partir de los permisos vigentes en base de datos. Ocultar tarjetas o enlaces es una medida de experiencia de usuario, no un control de seguridad. Las rutas, Server Actions y API routes deben conservar sus validaciones independientes.

La solución debe consolidar los shells existentes, evitar duplicar reglas de permisos y mantener separadas las responsabilidades de autorización, configuración de navegación, estado interactivo y presentación.

## 2. Contexto actual

La aplicación ya dispone de varios elementos aprovechables:

- `src/lib/module-navigation.ts` contiene el catálogo de módulos, sus rutas y permisos requeridos.
- `src/lib/auth/authorization.ts` obtiene el empleado activo y sus permisos vigentes desde la base de datos.
- `src/lib/auth/guards.ts` protege los módulos mediante permisos `module.*.access`.
- `src/app/page.tsx` y el endpoint de login redirigen actualmente al módulo predeterminado.
- `src/app/inicio/page.tsx` no es un Home real: redirige a `/`.
- `src/components/module-shell/ModuleSidebarShell.tsx` implementa el shell de Médico, Admisiones y Recomendaciones.
- `src/app/admin/ui/AdminShell.tsx` implementa un shell similar, pero separado, para Administración.
- `useAuthMe` vuelve a consultar el usuario desde el cliente y los shells calculan nuevamente los módulos visibles.

La principal deuda técnica es que la navegación y el filtrado de módulos se resuelven en más de un lugar. Además, el catálogo actual permite acceso visual por permiso o por rol, mientras que los guards usan permisos. Esto puede producir discrepancias entre lo que una persona ve y lo que realmente puede abrir.

## 3. Objetivos

1. Crear un Home autenticado como punto de entrada después del login.
2. Mostrar únicamente módulos autorizados por permisos vigentes.
3. Mantener una navegación lateral coherente en todos los módulos.
4. Ofrecer navegación compacta en escritorio y drawer en pantallas táctiles.
5. Unificar las implementaciones de shell y eliminar duplicación.
6. Mantener la autorización del servidor como fuente de verdad.
7. Proporcionar navegación accesible por teclado, lector de pantalla y preferencias de reducción de movimiento.
8. Evitar saltos de layout, parpadeos de contenido no autorizado y dependencias de animación innecesarias.

## 4. Fuera de alcance

- Rediseñar los formularios y tablas internos de cada módulo.
- Modificar el modelo de base de datos de perfiles y permisos, salvo que durante la implementación se detecte una ausencia real de permisos sembrados.
- Crear un sistema de personalización visual completo o editor de temas.
- Reordenar módulos mediante drag and drop.
- Añadir notificaciones en tiempo real.
- Implementar analítica de producto externa.
- Incorporar transiciones experimentales de página de Next.js.

## 5. Principios de diseño y arquitectura

### 5.1 Una sola fuente de verdad

El catálogo de módulos debe ser el único origen para Home y sidebar. No se mantendrán listas independientes por pantalla.

La configuración conceptual de cada módulo contendrá:

| Campo | Responsabilidad |
| --- | --- |
| Clave estable | Identificar el módulo en permisos, rutas, pruebas y telemetría |
| Etiqueta | Nombre visible para la persona usuaria |
| Descripción | Explicar el propósito en la tarjeta del Home |
| Ruta de entrada | Destino canónico del módulo |
| Clave de icono | Resolver un icono Lucide desde la capa de UI |
| Permiso de acceso | Autoridad necesaria para mostrar y abrir el módulo |
| Navegación secundaria | Accesos internos opcionales, cada uno con su propio permiso |
| Orden | Posición estable en Home y navegación |

No se almacenarán componentes React, estado de UI ni consultas de datos dentro del catálogo de dominio. Los iconos se resolverán mediante una clave en la capa de presentación.

### 5.2 Permisos antes que roles

Los permisos `module.*.access` serán la autoridad final. El rol o nombre del perfil podrá utilizarse como información visible y para compatibilidad durante una migración controlada, pero no debe conceder acceso por sí solo.

Si temporalmente se conserva compatibilidad por rol, Home, sidebar y guards deberán utilizar exactamente el mismo evaluador. No puede existir una regla para renderizar y otra distinta para proteger la ruta.

### 5.3 Separación de responsabilidades

- La capa de autorización determina quién puede acceder.
- El catálogo describe qué módulos existen.
- El shell organiza navegación y contenido.
- El controlador de interacción gestiona rail, hover, foco, drawer y preferencia fijada.
- Los módulos proporcionan solamente su contenido y navegación secundaria.
- La librería de animación expresa transiciones; no controla permisos ni navegación.

### 5.4 Server-first

El Home y los layouts protegidos resolverán la sesión y los permisos en el servidor. El cliente recibirá un snapshot mínimo y serializable del usuario y de su navegación autorizada.

Esto evita:

- Mostrar módulos y ocultarlos después de hidratar.
- Duplicar consultas de autorización en cada componente visual.
- Confiar en datos del navegador para proteger contenido.
- Acoplar Prisma o el JWT a componentes de presentación.

## 6. Modelo de autorización

### 6.1 Permisos de módulos existentes

| Módulo | Permiso requerido | Ruta canónica |
| --- | --- | --- |
| Médico | `module.medico.access` | `/medico` |
| Admisiones | `module.admisiones.access` | `/admisiones` |
| Recomendaciones | `module.recomendaciones.access` | `/recomendaciones` |
| Administración | `module.admin.access` | `/admin` |

### 6.2 Reglas

1. Una tarjeta se muestra si y solo si el usuario activo posee el permiso requerido.
2. Un enlace del sidebar se muestra bajo la misma condición.
3. Una ruta de módulo vuelve a validar el permiso en el servidor.
4. Cada API route, Server Action o mutación conserva su guard específico.
5. Los accesos secundarios del módulo se filtran por sus permisos particulares.
6. Un usuario autenticado sin permiso recibe una respuesta o pantalla 403; no se le envía al login.
7. Una sesión ausente, inválida o expirada sí redirige al login.
8. Los datos del JWT pueden identificar la sesión, pero los permisos vigentes se obtienen mediante el contexto de autorización respaldado por base de datos.

### 6.3 Cambios de permisos durante una sesión

La seguridad no dependerá de que el sidebar se actualice en tiempo real: toda operación protegida se valida en servidor. Al refrescar, cambiar de ruta o revalidar la sesión, la navegación debe reconciliarse con los permisos actuales.

Si se revoca el módulo que la persona está usando, la siguiente validación debe llevarla a `/sin-acceso` con una acción para regresar al Home. La interfaz no debe entrar en un ciclo entre login, Home y módulo.

## 7. Arquitectura de información

### 7.1 Nivel global

- Inicio.
- Módulos autorizados.
- Información del usuario o perfil.
- Cerrar sesión, separado de la navegación normal.

### 7.2 Nivel del módulo

Cuando el módulo activo tenga rutas internas, se mostrará una sección secundaria contextual. Solo debe presentarse la navegación interna del módulo actual.

Ejemplo para Administración:

- Empleados.
- Perfiles.
- Motivos de reapertura.
- Notificadores PCL.
- Auditoría.

No se mezclarán simultáneamente los accesos internos de todos los módulos. Esto mantiene una jerarquía predecible y reduce la densidad del menú.

## 8. Flujo funcional

### 8.1 Inicio de sesión

1. La persona envía credenciales.
2. El servidor valida empleado, contraseña, estado y perfil.
3. El servidor crea la sesión.
4. La respuesta de login utiliza `/inicio` como destino exitoso.
5. El navegador realiza navegación completa o reemplazo hacia `/inicio`.
6. `/inicio` vuelve a validar la sesión y consulta permisos vigentes.
7. El Home renderiza los módulos autorizados.

`/` actuará como puerta de entrada:

- Sin sesión válida: `/login`.
- Con sesión válida: `/inicio`.

No se redirigirá automáticamente a un módulo aunque solo exista uno visible, porque el requerimiento establece el Home como punto de entrada posterior al login.

### 8.2 Selección de módulo

1. La persona activa una tarjeta mediante clic, toque o teclado.
2. Se muestra feedback de presión inmediato.
3. Se navega a la ruta canónica.
4. El layout del módulo valida nuevamente el permiso.
5. El módulo se presenta dentro del shell común.
6. El enlace correspondiente queda marcado como activo.

### 8.3 Navegación directa

Las URLs profundas deben continuar funcionando. Una persona autorizada puede abrir directamente una ruta interna sin pasar primero por el Home. El shell debe identificar el módulo activo a partir de la URL.

## 9. Especificación del Home

### 9.1 Estructura

- Encabezado con marca, nombre del usuario, perfil y cierre de sesión.
- Contenido principal con saludo y explicación breve.
- Grid responsivo de módulos autorizados.
- Estado vacío cuando no existan módulos.
- Sin sidebar lateral.

### 9.2 Tarjeta de módulo

Cada tarjeta debe incluir:

- Icono SVG de Lucide.
- Nombre del módulo.
- Descripción de una o dos líneas.
- Indicador textual de acción, por ejemplo “Ingresar”.
- Área interactiva completa, no únicamente el botón o icono.
- Estado hover, focus-visible, active y disabled cuando corresponda.

La tarjeta debe utilizar navegación semántica y ser activable con teclado. El color no será el único indicador de interacción o selección.

### 9.3 Casos por cantidad de módulos

| Cantidad | Comportamiento |
| --- | --- |
| 0 | Mostrar estado vacío, explicación y canal de soporte; no mostrar un grid vacío |
| 1 | Mostrar una tarjeta sin redirección automática |
| 2–4 | Grid equilibrado con orden estable |
| Más de 4 | Mantener grid responsivo y orden del catálogo; no introducir carrusel |

## 10. Especificación del sidebar

### 10.1 Escritorio

En viewports de escritorio, el shell reservará aproximadamente 72 px cuando el rail esté compacto y 256 px cuando esté expandido.

El panel expandido tendrá aproximadamente 248–264 px y participará en el layout. El área principal adaptará su ancho durante hover, foco o fijación, pero nunca quedará cubierta por la navegación ni producirá scroll horizontal.

El rail mostrará:

- Marca compacta.
- Inicio.
- Iconos de los módulos autorizados.
- Indicador del módulo activo.
- Acceso a perfil, si aplica.
- Cerrar sesión al final y separado visualmente.

Cuando el panel esté expandido mostrará etiquetas, identidad del usuario y navegación secundaria contextual.

### 10.2 Estados del sidebar

| Estado | Entrada | Salida | Resultado |
| --- | --- | --- | --- |
| Compacto | Estado inicial en escritorio | Hover, foco o fijar | Rail visible solo con iconos |
| Vista previa | Hover sobre rail o `focus-within` | Salir del área, Escape o perder foco | Panel expandido con su ancho reservado |
| Fijado | Activar control de fijación | Desfijar | Panel expandido persistente |
| Drawer móvil abierto | Activar botón Menú | Cerrar, Escape, backdrop o navegación | Panel modal lateral con scrim |

La prioridad de estados será: drawer móvil, fijado, vista previa y compacto.

### 10.3 Interacciones

- El hover puede abrir la vista previa, pero nunca será la única vía.
- El foco sobre cualquier enlace debe expandir el panel.
- Escape cierra la vista previa o el drawer y devuelve el foco al control que lo abrió.
- Los iconos del rail compacto tendrán tooltips accesibles.
- En estado compacto, el destino activo resaltará únicamente el contenedor del icono; el fondo y el borde de fila completa solo se mostrarán al expandir el panel.
- En estado compacto, el bloque de identidad mostrará solo el icono de usuario, sin fondo ni borde de tarjeta recortados; el nombre y el perfil aparecerán con la expansión.
- El elemento activo utilizará `aria-current="page"` o el valor semántico correspondiente.
- El botón de fijación anunciará su estado mediante `aria-pressed` o semántica equivalente.
- Al interactuar con un menú, diálogo o tooltip contenido en el panel, este no debe cerrarse accidentalmente.
- La preferencia fijada se guardará por usuario, no como preferencia global compartida entre cuentas del mismo navegador.
- Si el almacenamiento local falla, la navegación seguirá funcionando en estado compacto.

### 10.4 Móvil y tablet táctil

- No existirá expansión basada en hover.
- Se mostrará un botón Menú visible en el encabezado.
- El drawer tendrá un ancho máximo que deje contexto visual del fondo.
- Un scrim de 40–60 % separará el drawer del contenido.
- El foco quedará atrapado dentro del drawer mientras esté abierto.
- Al cerrarlo, el foco volverá al botón Menú.
- Seleccionar una ruta cerrará el drawer.
- Los objetivos táctiles tendrán un mínimo de 44 × 44 px y separación suficiente.
- El contenido no quedará oculto bajo encabezados o controles fijos.

### 10.5 Matriz responsiva

| Viewport | Patrón |
| --- | --- |
| Menos de 768 px | Encabezado compacto y drawer |
| 768–1023 px | Drawer por defecto; se prioriza compatibilidad táctil |
| 1024 px o más | Rail compacto con expansión y opción de fijación |

La detección principal será por viewport y capacidades de interacción CSS. No se implementará lógica basada exclusivamente en el user-agent.

## 11. Arquitectura propuesta

### 11.1 Layout autenticado

Se recomienda una agrupación lógica de rutas autenticadas, sin que el nombre del grupo afecte las URLs públicas. Este layout resolverá el contexto de autorización y proveerá un snapshot de usuario común.

El Home utilizará un layout autenticado sin sidebar. Los módulos utilizarán el mismo contexto y un shell de módulo compartido.

### 11.2 Shell común

Un único shell reemplazará progresivamente las responsabilidades duplicadas de `ModuleSidebarShell` y `AdminShell`.

Responsabilidades permitidas:

- Componer rail, panel expandido, drawer, encabezado y contenido.
- Renderizar navegación ya autorizada.
- Identificar la ruta activa.
- Gestionar estado de interacción y preferencia fijada.
- Renderizar un slot de navegación secundaria y acciones de módulo.

Responsabilidades prohibidas:

- Consultar Prisma.
- Interpretar el JWT.
- Inventar permisos por rol.
- Conocer reglas de negocio de dictámenes o recomendaciones.
- Duplicar listas de módulos.
- Realizar mutaciones funcionales de los módulos.

### 11.3 Proveedores y estado

El estado compartido debe ser mínimo:

- Snapshot del usuario autenticado.
- Navegación autorizada.
- Preferencia local fijada del sidebar.
- Estado efímero de drawer o vista previa.

No se añadirá Zustand para resolver un estado que puede vivir en el shell. Si en el futuro múltiples zonas no relacionadas necesitan controlar la navegación, se evaluará un contexto pequeño y específico. No se creará un store global genérico.

### 11.4 Navegación secundaria

Cada módulo declarará su navegación secundaria como datos. El shell la filtrará con el evaluador común y la renderizará en la sección contextual.

Las páginas internas no crearán sidebars propios. Podrán proporcionar:

- Título.
- Descripción.
- Acciones del encabezado.
- Breadcrumb cuando existan tres o más niveles reales.
- Contenido principal.

## 12. Animación y movimiento

### 12.1 Decisión de librerías

Se utilizará la siguiente estrategia:

1. CSS y Tailwind para hover, focus, opacidad, color, tooltips y estados simples.
2. La dependencia existente `tailwindcss-animate` para entradas y salidas sencillas de componentes Radix.
3. Motion para transiciones coordinadas de layout, presencia e indicador activo cuando CSS no sea suficiente.

No se añadirá GSAP: sus timelines y plugins exceden las necesidades de una aplicación administrativa. Tampoco se añadirá AutoAnimate inicialmente, porque no existe un requisito central de reordenamiento dinámico de listas. No se utilizará View Transitions de Next.js mientras su integración se mantenga experimental para producción.

Referencias de implementación futura:

- Motion para React: <https://motion.dev/docs/react>
- Accesibilidad en Motion: <https://motion.dev/docs/react-accessibility>
- Reducción de bundle: <https://motion.dev/docs/react-reduce-bundle-size>

### 12.2 Tokens de movimiento

| Interacción | Duración objetivo | Curva |
| --- | --- | --- |
| Feedback de presión | 100–140 ms | Ease-out |
| Hover y focus visual | 150–180 ms | Ease-out |
| Vista previa del sidebar | 180–240 ms | Ease-out o spring suave |
| Cierre del sidebar | 140–180 ms | Ease-in |
| Drawer móvil | 220–280 ms | Ease-out al entrar, ease-in al salir |
| Tarjetas del Home | 200–300 ms | Ease-out, stagger máximo de 30–40 ms |

### 12.3 Reglas de rendimiento

- Priorizar `transform` y `opacity`.
- Limitar la transición de ancho al contenedor lateral; no animar propiedades internas del contenido principal.
- El área principal se recalculará sin quedar bajo el panel y sus tablas o formularios deberán responder al ancho disponible.
- No ejecutar animaciones decorativas continuas.
- Toda animación será interrumpible y no bloqueará la entrada.
- Motion se cargará con el conjunto mínimo de capacidades necesario.
- Con `prefers-reduced-motion: reduce`, se eliminarán desplazamientos y escalados no esenciales; se conservarán cambios instantáneos o fades breves cuando aporten contexto.

## 13. Accesibilidad

La implementación debe cumplir como mínimo:

- Contraste WCAG AA: 4.5:1 para texto normal y 3:1 para texto grande o componentes relevantes.
- Navegación completa por teclado.
- Indicadores `focus-visible` perceptibles.
- Enlace “Saltar al contenido principal” antes de una navegación extensa.
- Orden de tabulación coherente con el orden visual.
- Etiquetas accesibles en botones con solo icono.
- Tooltips que no sean la única fuente de información crítica.
- Uso de `nav`, encabezados y landmarks semánticos.
- Estado activo y expandido comunicado a tecnologías de asistencia.
- Drawer con manejo correcto de foco y Escape.
- Soporte de `prefers-reduced-motion`.
- Zoom del navegador y aumento de texto sin pérdida de funcionalidad.
- Ninguna acción primaria dependerá exclusivamente del color, hover o animación.

## 14. Rendimiento y experiencia de carga

- El Home será Server Component por defecto; solo las interacciones necesarias serán Client Components.
- La autorización se resolverá antes de renderizar las tarjetas para evitar parpadeo de módulos no permitidos.
- No se realizará una solicitud `/api/auth/me` independiente desde cada sección del sidebar.
- Las listas de navegación usarán claves estables.
- El shell no debe provocar scroll horizontal.
- El objetivo de CLS para la nueva experiencia será menor de 0.1.
- El feedback visual de interacción debe aparecer en menos de 100 ms.
- Si la validación supera 300 ms, se mostrará un estado de carga reservado que no cambie el layout.

## 15. Estados excepcionales

### 15.1 Sin módulos autorizados

Mostrar una pantalla informativa con:

- Mensaje claro: el perfil no tiene módulos asignados.
- Nombre o perfil de la persona.
- Acción para cerrar sesión.
- Canal de soporte definido por el producto.

No se seleccionará un módulo por rol como fallback silencioso.

### 15.2 Sesión expirada

Redirigir al login conservando, si se decide posteriormente, una ruta de retorno segura. No mostrar un 403 cuando la sesión ya no existe.

### 15.3 Acceso prohibido

Mostrar `/sin-acceso` con:

- Explicación sin revelar detalles sensibles.
- Acción “Volver al inicio”.
- Acción “Cerrar sesión”.
- Código o correlación de soporte si el sistema incorpora observabilidad.

### 15.4 Error al cargar autorización

No asumir permisos. Presentar un estado seguro con reintento y registrar el fallo en servidor. Nunca renderizar todos los módulos como fallback.

## 16. Estrategia de pruebas

### 16.1 Unitarias

- Filtrado de módulos con cero, uno y múltiples permisos.
- Independencia del orden de permisos.
- Rechazo de acceso por rol sin permiso.
- Resolución de módulo activo para rutas raíz y profundas.
- Filtrado de navegación secundaria.
- Persistencia por usuario del estado fijado.

### 16.2 Integración

- Login exitoso devuelve `/inicio`.
- `/` diferencia correctamente sesión válida e inválida.
- `/inicio` usa permisos vigentes de base de datos.
- Guards y catálogo producen el mismo resultado.
- Usuario autenticado sin permiso recibe 403.
- Sesión inválida redirige a login.
- Revocación de permiso se aplica en la siguiente validación.

### 16.3 Componentes

- Rail compacto y panel expandido.
- Expansión por hover y por foco.
- Fijar y desfijar.
- Tooltips en modo compacto.
- Indicador activo.
- Drawer, scrim, Escape y restauración de foco.
- Tarjetas activables por teclado.
- Reduced motion.

### 16.4 End-to-end

Se deben cubrir al menos estos perfiles:

1. Usuario con un solo módulo.
2. Usuario con varios módulos.
3. Administrador con navegación secundaria completa.
4. Usuario sin módulos.
5. Usuario que intenta abrir una URL no autorizada.
6. Usuario cuyo permiso se revoca durante la sesión.

Viewports mínimos: 375, 768, 1024 y 1440 px. También se verificará navegación solo con teclado y emulación de reducción de movimiento.

## 17. Criterios de aceptación

- **AC-01:** Dado un login exitoso, cuando termina la autenticación, entonces el destino es `/inicio`.
- **AC-02:** Dado un usuario autenticado, cuando abre `/inicio`, entonces solo ve módulos cuyo permiso `module.*.access` posee.
- **AC-03:** Dado un usuario con un único módulo, cuando abre el Home, entonces ve una tarjeta y no es redirigido automáticamente.
- **AC-04:** Dado un usuario sin módulos, cuando abre el Home, entonces ve un estado vacío seguro y accionable.
- **AC-05:** Dado un usuario autenticado sin permiso, cuando abre directamente un módulo, entonces recibe una experiencia 403 y no el login.
- **AC-06:** Dado un viewport de escritorio, cuando se carga un módulo, entonces se muestra un rail compacto con los módulos autorizados.
- **AC-07:** Dado el rail compacto, cuando recibe hover o foco, entonces aparece el panel expandido y el contenido principal adapta su ancho sin quedar oculto ni cubierto.
- **AC-08:** Dado el panel expandido, cuando se fija, entonces permanece abierto al retirar el cursor y conserva la preferencia para ese usuario.
- **AC-09:** Dado un dispositivo táctil, cuando se navega por un módulo, entonces existe un botón visible para abrir un drawer y ninguna acción depende del hover.
- **AC-10:** Dado el drawer abierto, cuando se presiona Escape, se toca el scrim o se elige una ruta, entonces se cierra y restaura correctamente el foco.
- **AC-11:** Dada una ruta interna, cuando se renderiza el shell, entonces el módulo y el acceso secundario activos se identifican visual y semánticamente.
- **AC-12:** Dado un usuario con reducción de movimiento, cuando usa Home y sidebar, entonces no recibe desplazamientos o escalados no esenciales.
- **AC-13:** Dado un cambio de permisos, cuando ocurre la siguiente validación del servidor, entonces tarjetas, enlaces y acceso efectivo reflejan el nuevo estado.
- **AC-14:** Dado cualquier módulo, cuando se navega por teclado, entonces todos los destinos y controles son alcanzables y tienen foco visible.
- **AC-15:** Dado el sidebar en cualquier módulo, cuando se comparan sus módulos visibles con el Home, entonces ambos conjuntos son iguales.

## 18. Plan de implementación

### Fase 1: Alinear autorización

- Consolidar el evaluador de acceso a módulos.
- Auditar perfiles existentes para confirmar permisos `module.*.access`.
- Eliminar o controlar el fallback por rol.
- Incorporar la experiencia 403.

### Fase 2: Home autenticado

- Convertir `/inicio` en una página protegida real.
- Ajustar `/` y el redirect de login.
- Renderizar tarjetas desde el catálogo común.
- Cubrir estados de cero, uno y múltiples módulos.

### Fase 3: Shell unificado

- Extraer las responsabilidades comunes de los shells actuales.
- Migrar Médico, Admisiones y Recomendaciones.
- Migrar Administración y su navegación secundaria.
- Retirar implementaciones duplicadas solo después de completar la migración.

### Fase 4: Interacción adaptativa

- Implementar rail, vista previa, fijación y tooltips.
- Implementar drawer móvil y manejo de foco.
- Añadir persistencia por usuario.
- Validar rutas profundas.

### Fase 5: Movimiento y endurecimiento

- Añadir transiciones CSS.
- Incorporar Motion únicamente donde aporte continuidad real.
- Validar reduced motion, rendimiento y CLS.
- Ejecutar pruebas unitarias, integración, componentes y E2E.

## 19. Impacto previsto en el repositorio

Los nombres definitivos podrán ajustarse durante la implementación, pero el impacto esperado es:

| Área | Acción prevista |
| --- | --- |
| `src/lib/module-navigation.ts` | Consolidar catálogo y autorización visual |
| `src/lib/auth/authorization.ts` | Mantener contexto servidor como fuente de verdad |
| `src/lib/auth/guards.ts` | Diferenciar sesión ausente de acceso prohibido |
| `src/app/page.tsx` | Redirigir a login o Home |
| `src/app/inicio/page.tsx` | Implementar Home autenticado |
| `src/app/api/auth/login/route.ts` | Cambiar destino exitoso a `/inicio` |
| `src/app/login/page.tsx` | Enviar sesiones existentes al Home |
| `ModuleSidebarShell` y `AdminShell` | Migrar hacia un shell compartido |
| Layouts de módulos | Consumir el shell común y navegación contextual |
| Estilos globales o tokens | Incorporar tokens de navegación y movimiento |
| Pruebas | Añadir cobertura de RBAC, Home y navegación adaptativa |

Los archivos actualmente modificados por otros trabajos no deben sobrescribirse. La implementación deberá revisar el estado Git antes de cada fase y aislar cambios relacionados con este spec.

## 20. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Roles y permisos existentes no coinciden | Auditar perfiles antes de retirar fallback; usar un evaluador común durante la transición |
| Duplicación temporal de shells | Migrar módulo por módulo y retirar el shell anterior al terminar la fase |
| Parpadeo de navegación no autorizada | Resolver permisos en servidor y entregar navegación filtrada |
| Sidebar que cubre el contenido | Reservar dinámicamente el ancho del rail y mantener `min-width: 0` en el área principal |
| Hover inaccesible en táctil o teclado | Drawer explícito, `focus-within`, tooltips y control de fijación |
| Bundle de animación innecesario | CSS-first y carga mínima de Motion |
| Pérdida de foco al cerrar drawer | Focus trap y restauración al disparador |
| Preferencia fijada compartida entre cuentas | Clave de almacenamiento asociada al identificador del usuario |
| Permiso revocado con UI desactualizada | Guards de servidor en cada acceso y reconciliación en navegación/refresco |

## 21. Definición de terminado

La funcionalidad se considera terminada cuando:

- Todos los criterios de aceptación están cubiertos y aprobados.
- Home y sidebar utilizan el mismo catálogo y evaluador de permisos.
- No existen dos shells activos con lógica equivalente.
- Las rutas y APIs siguen protegidas en servidor.
- Los flujos 401 y 403 están diferenciados.
- La navegación funciona con mouse, tacto y teclado.
- Reduced motion y focus-visible fueron verificados.
- No hay scroll horizontal ni contenido cubierto al expandir el sidebar.
- Los módulos existentes conservan sus funciones y rutas profundas.
- Lint, build y pruebas relacionadas pasan.
- No se introducen listas duplicadas, stores globales genéricos ni condiciones por rol dispersas en componentes.

## 22. Decisiones adoptadas

Para evitar ambigüedades durante la implementación, este spec adopta las siguientes decisiones:

1. El Home se mostrará siempre después del login, incluso con un solo módulo.
2. El Home no tendrá sidebar.
3. El sidebar de módulos tendrá un rail visible; no quedará completamente invisible en escritorio.
4. La expansión participará en el layout de escritorio y no cubrirá el contenido.
5. Existirá una alternativa por foco y un control para fijar el panel.
6. En móvil se utilizará drawer, no hover.
7. Los permisos serán la autoridad; el rol no concederá acceso definitivo.
8. Se consolidarán `ModuleSidebarShell` y `AdminShell`.
9. Se aplicará una estrategia CSS-first y Motion como única librería adicional de animación si resulta necesaria.
10. Los accesos no autorizados se tratarán como 403, no como ausencia de sesión.
