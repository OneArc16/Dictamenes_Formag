# Especificación técnica: Módulo Medicina Laboral

| Campo | Valor |
| --- | --- |
| Nombre del spec | `2026-07-22-medicina-laboral` |
| Estado | Implementado |
| Versión | 1.0 |
| Fecha de creación | 2026-07-22 |
| Última actualización | 2026-07-22 |
| Producto | Dictámenes Formag / Dictamy |
| Stack actual | Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Prisma y PostgreSQL |
| Impacto en base de datos | Ninguno previsto |

## 1. Resumen ejecutivo

Se creará un módulo principal llamado **Medicina Laboral** que agrupará dos submódulos existentes:

- **Dictámenes**, correspondiente al módulo visible actualmente como Médico.
- **Recomendaciones**, correspondiente al módulo visible actualmente con el mismo nombre.

Medicina Laboral será la única entrada de este dominio en el Home y en la navegación global. Dictámenes y Recomendaciones aparecerán como navegación secundaria contextual dentro del módulo y se filtrarán de acuerdo con los permisos vigentes de cada persona.

La primera versión conservará las rutas públicas existentes, los endpoints, los modelos de datos y los permisos operativos. Se añadirá `/medicina-laboral` como ruta de entrada estable que enviará a cada persona al primer submódulo que tenga autorizado. Esta estrategia entrega la nueva arquitectura de información sin introducir una migración riesgosa de URLs ni romper enlaces profundos.

La implementación debe mantener una sola fuente de verdad para el catálogo de navegación, separar la identidad visual del módulo de las áreas protegidas por autorización y resolver permisos en el servidor. No se permitirán condicionales especiales dispersos para Medicina Laboral ni duplicación de reglas entre Home, sidebar, layouts y guards.

## 2. Contexto actual

El repositorio ya dispone de la mayor parte de la infraestructura necesaria:

- `src/lib/module-navigation.ts` define los módulos globales, sus permisos, rutas de entrada y navegación secundaria.
- `src/app/inicio/page.tsx` construye las tarjetas del Home a partir del catálogo central.
- `ModuleAppShell`, `SidebarNavigation` y `MobileNavigationDrawer` componen la navegación adaptativa compartida.
- `src/app/medico/layout.tsx` protege y presenta el flujo de Dictámenes.
- `src/app/recomendaciones/layout.tsx` protege y presenta el flujo de Recomendaciones.
- Los permisos `module.medico.access` y `module.recomendaciones.access` controlan actualmente el acceso a cada área.
- Los permisos `dictamen.*` y `recomendacion.*` protegen las operaciones específicas.
- Los guards de páginas y APIs vuelven a validar autorización en el servidor.

Actualmente Médico y Recomendaciones son módulos globales independientes. Esto expone dos accesos del mismo dominio al mismo nivel y utiliza el nombre de un rol, Médico, para representar una capacidad de negocio, Dictámenes.

El tipo `ModuleKey` también se utiliza tanto para navegación como para autorización. Al introducir un módulo padre visual, mantener ambas responsabilidades acopladas obligaría a crear excepciones o a relajar guards. La implementación debe separar esos conceptos.

## 3. Objetivos

1. Crear Medicina Laboral como módulo principal visible en Home y navegación global.
2. Renombrar visualmente el módulo Médico como Dictámenes.
3. Presentar Dictámenes y Recomendaciones como submódulos contextuales.
4. Mostrar únicamente los submódulos autorizados para la persona autenticada.
5. Resolver una entrada válida aunque la persona solo tenga acceso a uno de los submódulos.
6. Conservar las URLs profundas, APIs y marcadores existentes.
7. Mantener los permisos operativos y guards actuales sin reducir seguridad.
8. Evitar duplicación de catálogos, evaluadores de permisos y lógica de rutas.
9. Mantener navegación accesible en escritorio, teclado y dispositivos táctiles.
10. Cubrir la nueva jerarquía mediante pruebas unitarias y regresión funcional.

## 4. Fuera de alcance

- Rediseñar formularios, filtros, tablas o detalles internos de Dictámenes.
- Rediseñar formularios, filtros, tablas o detalles internos de Recomendaciones.
- Cambiar modelos Prisma o ejecutar migraciones de base de datos.
- Renombrar endpoints bajo `/api/dictamenes` o `/api/recomendaciones`.
- Mover en esta fase las páginas a `/medicina-laboral/dictamenes` o `/medicina-laboral/recomendaciones`.
- Unificar los permisos funcionales `dictamen.*` y `recomendacion.*`.
- Crear un dashboard, métricas o contenido propio para Medicina Laboral.
- Cambiar las capacidades asignadas actualmente a los perfiles.
- Introducir una segunda implementación de sidebar, tabs o drawer.
- Modificar el comportamiento clínico u operativo de los dos submódulos.

## 5. Decisiones adoptadas

1. El nombre visible será **Medicina Laboral**, con ortografía y acentuación consistentes.
2. Medicina Laboral será una agrupación funcional, no un nuevo dominio de datos.
3. La clave de navegación sugerida será `medicina-laboral`.
4. Dictámenes y Recomendaciones dejarán de aparecer como módulos globales independientes.
5. El acceso al módulo padre se derivará de la autorización de al menos un submódulo.
6. No se creará inicialmente el permiso `module.medicina_laboral.access`, porque podría quedar desincronizado de los permisos hijos y no existe contenido exclusivo del padre.
7. Se conservarán `module.medico.access` y `module.recomendaciones.access` como permisos de acceso a las áreas protegidas existentes.
8. Se conservarán `/medico` y `/recomendaciones` como rutas canónicas de trabajo en esta fase.
9. `/medicina-laboral` será una ruta de entrada y no una pantalla intermedia.
10. Dictámenes tendrá prioridad como destino cuando ambos submódulos estén autorizados.
11. Si solo Recomendaciones está autorizado, la entrada dirigirá a `/recomendaciones`.
12. Si ninguno está autorizado, Medicina Laboral no será visible y la entrada directa llevará a `/sin-acceso`.
13. La ruta activa se resolverá desde configuración declarativa y no mediante condicionales por clave dentro de los componentes.

## 6. Arquitectura de información

### 6.1 Nivel global

```text
Inicio
├── Medicina Laboral
├── Admisiones
├── Agenda Médica
└── Administración
```

La lista exacta continuará dependiendo de los permisos del usuario. No se modificará el orden de los módulos no relacionados salvo decisión posterior de producto.

### 6.2 Nivel de Medicina Laboral

```text
Medicina Laboral
├── Dictámenes
└── Recomendaciones
```

| Submódulo | Ruta de trabajo | Permiso de acceso | Permisos operativos |
| --- | --- | --- | --- |
| Dictámenes | `/medico` | `module.medico.access` | `dictamen.*` |
| Recomendaciones | `/recomendaciones` | `module.recomendaciones.access` | `recomendacion.*` |

Los detalles, formularios de creación e impresión permanecen dentro del submódulo correspondiente aunque no aparezcan como enlaces permanentes del sidebar.

### 6.3 Home

El Home mostrará una sola tarjeta de Medicina Laboral cuando la persona tenga acceso a Dictámenes, Recomendaciones o ambos.

| Propiedad | Valor propuesto |
| --- | --- |
| Título | Medicina Laboral |
| Descripción | Gestión de dictámenes y recomendaciones laborales para docentes. |
| Icono | Icono médico-laboral de Lucide, resuelto por el mapa de iconos existente |
| Acción | Ingresar |
| Destino | Primer submódulo autorizado |

La tarjeta completa seguirá siendo interactiva, tendrá foco visible y no dependerá únicamente del color para comunicar interacción.

### 6.4 Sidebar y drawer

- El nivel global mostrará Medicina Laboral una sola vez.
- Al estar en una ruta de Dictámenes o Recomendaciones, Medicina Laboral aparecerá como módulo activo.
- La sección secundaria tendrá el encabezado Medicina Laboral.
- Solo se renderizarán los submódulos autorizados.
- El submódulo actual utilizará `aria-current="page"`.
- El drawer móvil reutilizará la misma definición y el mismo filtrado del sidebar de escritorio.
- Los objetivos táctiles mantendrán al menos 44 por 44 px.
- El orden de tabulación coincidirá con el orden visual.

## 7. Estrategia de rutas

### 7.1 Rutas conservadas

| Capacidad | Ruta |
| --- | --- |
| Lista de dictámenes | `/medico` |
| Nuevo dictamen | `/medico/dictamenes/nuevo` |
| Detalle de dictamen | `/medico/dictamen/[id]` |
| Impresión de dictamen | `/medico/dictamen/[id]/imprimir` |
| Lista de recomendaciones | `/recomendaciones` |
| Detalle de recomendación | `/recomendaciones/[id]` |

Los endpoints existentes no cambian. La reorganización es de navegación y composición visual, no de transporte ni persistencia.

### 7.2 Ruta de entrada

`/medicina-laboral` resolverá el destino en el servidor utilizando permisos vigentes:

1. Con `module.medico.access`, redirigir a `/medico`.
2. Sin acceso a Dictámenes y con `module.recomendaciones.access`, redirigir a `/recomendaciones`.
3. Sin acceso a ninguno, redirigir a `/sin-acceso`.
4. Sin sesión válida, aplicar el flujo común hacia `/login`.

La resolución debe reutilizar el mismo evaluador que utiliza el Home. No se mantendrá una lista o prioridad distinta en la página de entrada.

### 7.3 Reconocimiento del módulo activo

La definición de Medicina Laboral declarará todos sus prefijos de ruta relevantes. Como mínimo:

- `/medicina-laboral`.
- `/medico`.
- `/recomendaciones`.

La función que determina el módulo actual realizará coincidencias por segmento completo: una ruta coincide si es igual al prefijo o comienza con `prefijo + "/"`. No se utilizará una comparación de texto ambigua que pueda marcar rutas con nombres parecidos.

El orden de las definiciones no debe utilizarse para resolver conflictos silenciosos. Durante desarrollo, rutas solapadas entre módulos deben detectarse mediante pruebas o validación del catálogo.

## 8. Modelo de autorización

### 8.1 Regla del módulo padre

Medicina Laboral será visible cuando se cumpla al menos una de estas condiciones:

- La persona posee `module.medico.access`.
- La persona posee `module.recomendaciones.access`.

Esta es una política de acceso por cualquiera de varios permisos. El catálogo debe representarla de forma genérica, reutilizable por otros módulos, y no mediante una excepción como `if (module.key === "medicina-laboral")`.

### 8.2 Reglas de los submódulos

1. Dictámenes solo se muestra con `module.medico.access`.
2. Recomendaciones solo se muestra con `module.recomendaciones.access`.
3. Las páginas de Dictámenes continúan usando su guard actual.
4. Las páginas de Recomendaciones continúan usando su guard actual.
5. Las APIs continúan exigiendo el permiso del área y el permiso específico de la operación.
6. Ocultar un enlace nunca reemplaza la autorización de servidor.
7. El rol visible no concede permisos implícitos.
8. Una revocación de permisos se respeta en la siguiente validación de servidor.

### 8.3 Comportamiento por perfil inicial

Según la asignación RBAC actual, el resultado esperado es:

| Perfil | Medicina Laboral | Dictámenes | Recomendaciones | Destino de entrada |
| --- | --- | --- | --- | --- |
| Administrador | Visible | Visible | Visible | `/medico` |
| Médico | Visible | Visible | Visible | `/medico` |
| Admisionista | Visible | Oculto | Visible | `/recomendaciones` |
| Sin permisos hijos | Oculto | Oculto | Oculto | `/sin-acceso` |

La tabla describe el seed actual, pero la aplicación evaluará permisos reales del perfil y no nombres de rol.

## 9. Diseño técnico y separación de responsabilidades

### 9.1 Identidades diferentes

La implementación distinguirá dos conceptos:

| Concepto | Responsabilidad | Ejemplos |
| --- | --- | --- |
| Módulo de navegación | Agrupar contenido en Home y shell | `medicina-laboral`, `agenda`, `admin` |
| Área protegida | Validar acceso a páginas y APIs existentes | `medico`, `recomendaciones`, `agenda`, `admin` |

No se debe ampliar un único tipo con significados incompatibles. Se recomienda introducir nombres de tipo diferentes, por ejemplo `NavigationModuleKey` y `ProtectedAreaKey`, o una separación equivalente que mantenga explícitas las fronteras.

### 9.2 Catálogo central

El catálogo de navegación continuará siendo la única fuente de verdad para:

- Tarjetas del Home.
- Módulos del sidebar.
- Navegación secundaria.
- Ruta de entrada autorizada.
- Reconocimiento del módulo activo.
- Etiquetas, descripciones e iconos.

La definición conceptual de un módulo podrá contener:

| Campo | Responsabilidad |
| --- | --- |
| `key` | Identidad estable de navegación |
| `label` | Nombre visible |
| `description` | Descripción del Home |
| `iconKey` | Clave para resolver un icono Lucide |
| `entryPath` | Ruta estable de entrada |
| `routePrefixes` | Rutas que pertenecen visualmente al módulo |
| `requiredAbility` | Permiso único, cuando aplique |
| `requiredAnyAbilities` | Alternativas de acceso, cuando aplique |
| `secondaryNavigation` | Submódulos y accesos internos ordenados |

Se debe definir y validar una regla clara cuando existan políticas de acceso: una entrada utilizará permiso único, cualquiera de varios permisos o todos los permisos, pero no combinaciones ambiguas.

### 9.3 Funciones puras de navegación

La lógica de catálogo se concentrará en funciones puras, sin React, cookies, Prisma ni acceso al navegador:

- Evaluar si un módulo es visible.
- Filtrar módulos globales.
- Filtrar navegación secundaria.
- Elegir la primera ruta autorizada.
- Determinar el módulo activo por pathname.
- Determinar el submódulo activo.

Estas funciones recibirán permisos y configuración como datos. Esto permite pruebas unitarias deterministas y evita repetir condiciones en componentes.

### 9.4 Autorización de servidor

Los guards de autorización no dependerán del catálogo visual para proteger operaciones clínicas. Los permisos seguirán resolviéndose desde el contexto de autorización respaldado por base de datos.

La agrupación visual puede conocer los permisos necesarios para decidir visibilidad, pero no debe reemplazar ni debilitar:

- `requireMedicoModule`.
- `requireRecomendacionesModule`.
- `requireMedicoApi`.
- `requireRecomendacionesApi`.
- Los permisos `dictamen.*` y `recomendacion.*`.

### 9.5 Presentación

- `ModuleAppShell` recibe una clave de navegación y no contiene reglas particulares de Medicina Laboral.
- Los layouts de `/medico` y `/recomendaciones` seleccionan el mismo módulo visual, Medicina Laboral, después de ejecutar su guard específico.
- `ModulePageLayout` muestra Medicina Laboral como contexto del módulo y conserva un título específico por página.
- El mapa de iconos sigue separado del catálogo para no almacenar componentes React en la capa de configuración.
- Home, sidebar y drawer consumen el mismo catálogo ya filtrado.

## 10. Reglas contra código espagueti

La implementación deberá cumplir estas restricciones:

1. No crear listas independientes de módulos para Home, sidebar y móvil.
2. No comprobar roles para decidir acceso cuando existen permisos.
3. No añadir condicionales por pathname dentro de componentes visuales si pueden expresarse en el catálogo.
4. No añadir condicionales por la clave `medicina-laboral` en evaluadores genéricos.
5. No mezclar resolución de sesión, consultas Prisma y renderizado del menú en el mismo componente.
6. No mover lógica de autorización a hooks de cliente.
7. No modificar guards existentes para que acepten el permiso del módulo hermano.
8. No crear un componente nuevo que duplique `ModuleAppShell`.
9. No cambiar APIs, modelos o páginas internas que no sean necesarias para la agrupación.
10. No ocultar fallos de configuración con valores predeterminados inseguros.
11. No introducir dependencias circulares entre navegación, autorización e iconos.
12. No usar cadenas mágicas repetidas; las rutas y permisos de navegación deben vivir en configuración tipada.
13. No mezclar la migración opcional de URLs futuras con esta implementación.
14. Mantener funciones pequeñas, nombres orientados al dominio y pruebas cercanas a la lógica pura.

## 11. Impacto previsto por área

### 11.1 Navegación

- Extender el modelo de acceso del catálogo para aceptar cualquiera de varios permisos.
- Añadir soporte para varios prefijos de ruta por módulo.
- Crear la definición de Medicina Laboral con sus dos submódulos.
- Retirar Médico y Recomendaciones como entradas globales independientes.
- Incorporar las nuevas claves de iconos requeridas.

### 11.2 Layouts y páginas

- Hacer que los layouts de Dictámenes y Recomendaciones utilicen Medicina Laboral como módulo visual.
- Ajustar los encabezados visibles para usar Dictámenes y Recomendaciones laborales.
- Añadir la página de entrada `/medicina-laboral` con resolución de servidor.
- Conservar los guards particulares antes de renderizar contenido interno.

### 11.3 Autorización

- Separar el tipo de clave visual del tipo utilizado por los guards.
- Mantener el mapa de permisos de áreas protegidas sin conceder acceso transversal.
- No modificar el seed RBAC en esta fase, salvo que las pruebas revelen una inconsistencia previa.

### 11.4 Pruebas

- Ampliar las pruebas unitarias del catálogo.
- Añadir casos de entrada dinámica y rutas profundas.
- Ejecutar regresión de lint y build.
- Verificar manualmente sidebar expandido, rail compacto y drawer móvil.

## 12. Plan de implementación

### Fase 1: Contratos y pruebas de navegación

1. Separar las claves de navegación de las claves de áreas protegidas.
2. Extender los tipos del catálogo con políticas de acceso y prefijos de ruta.
3. Escribir primero las pruebas de visibilidad, entrada y reconocimiento de rutas.
4. Implementar las funciones puras hasta satisfacer los casos definidos.

### Fase 2: Catálogo de Medicina Laboral

1. Añadir la definición del módulo padre.
2. Añadir Dictámenes y Recomendaciones como navegación secundaria.
3. Resolver sus iconos mediante el mapa existente.
4. Eliminar únicamente las dos entradas globales reemplazadas.

### Fase 3: Integración con shells

1. Configurar ambos layouts para renderizar el mismo módulo visual.
2. Verificar estado activo en listas, detalles, creación e impresión.
3. Confirmar que el drawer móvil cierre después de navegar.
4. Confirmar que Home muestre una sola tarjeta.

### Fase 4: Entrada estable y textos

1. Crear `/medicina-laboral` como resolución server-first.
2. Reutilizar el evaluador de entrada del catálogo.
3. Corregir nombres visibles y acentuación.
4. Mantener intactas las rutas internas existentes.

### Fase 5: Verificación de seguridad y regresión

1. Probar perfiles con ambos permisos, con cada permiso individual y sin permisos.
2. Probar navegación directa a rutas profundas.
3. Confirmar respuestas 401 y 403 de APIs sin autorización.
4. Ejecutar pruebas unitarias, lint y build.
5. Realizar revisión responsive y de teclado.

## 13. Estrategia de pruebas

### 13.1 Pruebas unitarias mínimas

1. Medicina Laboral es visible con `module.medico.access` solamente.
2. Medicina Laboral es visible con `module.recomendaciones.access` solamente.
3. Medicina Laboral es visible una sola vez con ambos permisos.
4. Medicina Laboral se oculta sin permisos hijos.
5. Solo Dictámenes aparece con permiso de Médico.
6. Solo Recomendaciones aparece con su permiso de módulo.
7. Ambos submódulos aparecen en el orden definido cuando están autorizados.
8. La entrada elige `/medico` cuando ambos están autorizados.
9. La entrada elige `/recomendaciones` cuando es el único acceso.
10. `/medico/dictamen/42` resuelve Medicina Laboral como módulo activo.
11. `/recomendaciones/42` resuelve Medicina Laboral como módulo activo.
12. Una ruta con prefijo textual parecido no produce una coincidencia falsa.
13. Los módulos no relacionados conservan visibilidad y rutas de entrada.
14. La lógica de guards conserva las claves de área protegida existentes.

### 13.2 Pruebas de integración

- Home muestra una tarjeta en lugar de Médico y Recomendaciones por separado.
- `/medicina-laboral` redirige según permisos vigentes.
- Una persona sin acceso no recibe contenido del módulo.
- Los layouts de ambas rutas muestran el mismo encabezado contextual.
- Los enlaces profundos siguen cargando después de refrescar el navegador.
- El historial Atrás/Adelante mantiene un comportamiento predecible.
- Las acciones de crear, editar, cerrar, reabrir, imprimir y exportar conservan sus permisos.

### 13.3 Verificación UX y accesibilidad

- Estado activo visible mediante más de un indicador, no solo color.
- `aria-current` aplicado al submódulo activo.
- Foco visible en tarjeta, enlaces y botón del drawer.
- Orden de foco lógico en sidebar y drawer.
- Navegación posible sin hover.
- Objetivos táctiles de al menos 44 por 44 px.
- El drawer gestiona Escape, scrim, cierre y devolución de foco.
- Las transiciones respetan `prefers-reduced-motion`.
- No existe scroll horizontal a 375, 768, 1024 y 1440 px.
- El contenido no queda cubierto por encabezados o navegación fija.

## 14. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Reducir accidentalmente la seguridad al agrupar permisos | Mantener guards independientes por área y operaciones |
| Mostrar el módulo sin un destino autorizado | Derivar visibilidad y ruta de entrada del mismo conjunto de hijos |
| Marcar incorrectamente el módulo activo | Usar prefijos declarativos y coincidencia por segmento |
| Romper enlaces guardados | Conservar las rutas actuales |
| Duplicar lógica entre entrada, Home y sidebar | Centralizar evaluadores puros en el catálogo |
| Acoplar navegación con autorización | Separar claves de navegación y áreas protegidas |
| Crear permisos redundantes | No añadir permiso padre mientras no exista contenido exclusivo |
| Regresar errores por orden del catálogo | Probar solapamientos y prioridades explícitas |
| Aumentar innecesariamente el alcance | No tocar modelos, APIs ni flujos clínicos internos |

## 15. Criterios de aceptación

1. El Home muestra Medicina Laboral como una sola tarjeta.
2. Médico y Recomendaciones ya no aparecen como módulos globales separados.
3. El nombre Dictámenes reemplaza visualmente a Médico dentro del nuevo módulo.
4. El sidebar y el drawer muestran únicamente submódulos autorizados.
5. Medicina Laboral permanece activo en todas las rutas profundas de ambos submódulos.
6. `/medicina-laboral` lleva al primer submódulo autorizado.
7. Las URLs existentes continúan funcionando sin cambios.
8. Los guards de páginas y APIs conservan su comportamiento previo.
9. No se introducen cambios de base de datos.
10. Home, sidebar, drawer y ruta de entrada utilizan el mismo catálogo.
11. La solución no contiene condiciones especiales de Medicina Laboral dispersas en componentes.
12. Las pruebas de navegación, lint y build terminan correctamente.
13. La navegación funciona con teclado y en dispositivos táctiles.
14. No se altera el comportamiento funcional de Dictámenes ni Recomendaciones.

## 16. Definición de terminado

La implementación estará terminada cuando:

- Todos los criterios de aceptación estén verificados.
- Las pruebas automatizadas cubran permisos individuales, combinados y ausentes.
- No existan errores de TypeScript, lint o build.
- Los flujos actuales de ambos submódulos pasen regresión básica.
- Se haya verificado escritorio, tablet y móvil.
- La documentación del catálogo de módulos refleje la nueva jerarquía.
- No existan migraciones de base de datos ni cambios de permisos no justificados.
- La revisión de código confirme separación de responsabilidades y ausencia de lógica duplicada.

## 17. Evolución futura opcional

Una fase posterior podrá migrar las rutas públicas a:

- `/medicina-laboral/dictamenes`.
- `/medicina-laboral/recomendaciones`.

Esa migración deberá incluir redirecciones permanentes o compatibles, actualización de enlaces, pruebas de impresión y validación de marcadores. No forma parte de esta implementación porque no aporta valor funcional suficiente para justificar el riesgo actual.
