# Especificación: captura de firma y huella del paciente

## 1. Estado del documento

- Estado: **idea a futuro**. No está aprobada para implementación ni priorizada.
- Propósito: dejar registrado el análisis técnico para no repetir la investigación
  cuando se retome.
- Alcance técnico: Next.js 16, React 19, TypeScript, Prisma, PostgreSQL.
- Fecha: 5 de noviembre de 2026.

## 2. Objetivo

Permitir que, en un formato que lo requiera, el **paciente firme** en una tableta
de firma y **registre su huella** en un lector biométrico. Ambas capturas deben
quedar en el formato y en el sistema como evidencia.

El formato concreto que usará esta captura está por definir (ver 11).

## 3. Contexto técnico actual

- El sistema corre en el navegador y no tiene ninguna integración con tabletas
  de firma ni con lectores biométricos.
- Las firmas que existen hoy se guardan como imagen (`firma` en `Bytes` y
  `firmaMime`). Pertenecen a **empleados** (`Empleado.firma`) y a la **junta**
  (`DictamenJunta.firma`), que las suben como archivo.
- **No existe** almacenamiento de firma ni huella del **paciente**. Se necesita
  un modelo nuevo (ver 7).

## 4. Hardware disponible

| Dispositivo | Modelo | Conexión | Captura |
|---|---|---|---|
| Tableta de firma | ePadLink **ePad VP9801** | USB | Solo firma. No tiene pantalla: la firma se ve en el monitor del PC. |
| Lector de huellas | DigitalPersona **U.are.U 4500** (hoy HID Global) | USB | Huella dactilar. |

## 5. Restricción principal

Un navegador **no puede comunicarse directamente** con dispositivos USB como
estos. En cada PC que tenga los dispositivos debe instalarse el software del
fabricante, que actúa como puente entre el navegador y el hardware.

## 6. Integración por dispositivo

### 6.1 Firma: ePad VP9801

- Componente: **ePadLink SigCaptureWeb SDK**, que se instala en el PC, más su
  extensión de navegador.
- Navegadores: Chrome, Edge, Firefox y Opera.
- Sistemas operativos: Windows (1.2.10, mayo de 2024) y Linux (1.1, junio de 2023).
- Resultado: imagen **PNG en base64** de la firma capturada.
- **Pendiente:** la lista de compatibilidad del SDK menciona "ePad USB",
  "ePad-ink" y "ePad-vision", pero **no nombra la VP9801**. Hay que confirmarlo
  con soporte (support@epadlink.com) antes de desarrollar.

### 6.2 Huella: U.are.U 4500

- Componente: **U.are.U SDK** de HID Global, que se instala en el PC e incluye un
  servicio local, más su librería JavaScript (`Fingerprint.WebApi`).
- Flujo de la librería: seleccionar el lector, iniciar la captura y recibir
  eventos. Se captura en imagen con
  `startAcquisition(Fingerprint.SampleFormat.PngImage)`.
- Sistema operativo: **solo Windows**, según la documentación de la integración
  web.
- **Pendientes:**
  - descargar la versión vigente desde HID Global, porque la marca pasó por
    DigitalPersona, Crossmatch y HID y hay documentación desactualizada;
  - confirmar la licencia para uso web;
  - instalar en equipos limpios: hay reportes de fallas cuando queda un runtime
    viejo de U.are.U.

### 6.3 Consecuencia

Los PCs donde se capture deben ser **Windows**, con los dos componentes
instalados y los dos dispositivos conectados.

## 7. Datos y almacenamiento

- Se guarda la **imagen** de la firma y la **imagen** de la huella, como
  evidencia del formato. Este alcance no incluye plantillas biométricas.
- Se propone un modelo nuevo, ligado al formato y al paciente, con:
  - imagen y tipo MIME de la firma;
  - imagen y tipo MIME de la huella;
  - fecha y hora de cada captura;
  - empleado que realizó la captura;
  - referencia al consentimiento de tratamiento de datos (ver 8).
- El PDF del formato incrusta ambas imágenes en el espacio de firma y huella.
- **Verificar identidad** (comparar una huella con otra ya registrada) queda
  **fuera de alcance**. Requeriría plantillas biométricas y un nivel de
  seguridad mayor.

## 8. Seguridad y cumplimiento

- La huella es un **dato biométrico sensible** según la **Ley 1581 de 2012**
  (Colombia). Implica:
  - consentimiento **explícito** del paciente antes de capturarla;
  - informar la finalidad del tratamiento;
  - restringir con permisos quién puede ver y descargar la imagen;
  - registrar en la auditoría las capturas y las consultas.
- Las imágenes no deben exponerse en listados ni en respuestas de la API que no
  las necesiten.
- Se recomienda un permiso nuevo para ver y descargar firma y huella del
  paciente, separado del permiso para capturarlas.

## 9. Flujo de usuario propuesto

1. El usuario abre el formato del paciente y pulsa **Capturar firma y huella**.
2. El sistema verifica que los componentes locales respondan y que los
   dispositivos estén conectados. Si falta alguno, muestra qué falta y cómo
   resolverlo.
3. Se registra el consentimiento del paciente.
4. El paciente firma en la ePad. La firma se ve en pantalla y se puede repetir
   antes de confirmar.
5. El paciente pone el dedo en el lector. La huella se ve en pantalla y se
   puede repetir.
6. El usuario confirma. Las dos imágenes se guardan y el formato las incluye.

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| La VP9801 no es compatible con el SDK web vigente | Confirmar con ePadLink antes de iniciar. |
| SDK de huellas desactualizado o con licencia restringida | Validar descarga y licencia con HID Global. |
| PCs que no son Windows | Inventariar equipos y definir los puestos de captura. |
| Fallas de instalación por runtimes viejos | Instalación limpia y guía de instalación por puesto. |
| Exposición de datos biométricos | Permisos dedicados, auditoría y consentimiento explícito. |
| Componente local caído durante la atención | Mensaje claro y opción de reintentar sin perder el formato. |

## 11. Pendientes por definir

- Qué formato o formatos llevan firma y huella del paciente.
- Si la firma se usa también en otros documentos (por ejemplo, consentimientos).
- Qué equipos o puestos tendrán los dispositivos.
- Confirmación de ePadLink sobre la compatibilidad de la VP9801.
- Versión, descarga y licencia vigentes del SDK de HID Global.
- Texto del consentimiento, validado por el área jurídica.

## 12. Fases sugeridas

1. **Validación técnica:** prueba de concepto en un PC Windows que capture firma
   y huella como PNG desde una página de prueba.
2. **Modelo y permisos:** modelo de datos, permiso nuevo y auditoría.
3. **Formato:** integración en el formato elegido y en su PDF.
4. **Despliegue:** guía de instalación por puesto y piloto en una sede.

## 13. Fuentes

- [ePad (VP9801)](https://epadlink.myshopify.com/products/epad)
- [SigCaptureWeb SDK for ePadLink](https://epadlink.myshopify.com/pages/sigcaptureweb)
- [SigCaptureWeb SDK Guide v1.2 (PDF)](https://www.epadlink.com/guides/SigCaptureWebSDKGuide.pdf)
- [Integration Guide SigCaptureWeb SDK v1.2 (PDF)](http://www.epadsupport.com/SigCaptureWeb/IntegrationGuide.pdf)
- [DigitalPersona U.are.U SDK 2.3 Developer Guide (PDF)](https://descargas.diprotec.cl/contenido/drivers/Digital-Persona/UAreU-4500/U.are.U_SDK_Developer_Guide.pdf)
- [Crossmatch U.are.U SDK Developer Guide (PDF)](https://descargas.diprotec.cl/contenido/drivers/Digital-Persona/EikonTouch710/710-SDK-Developer-Guide.pdf)
- [U.are.U 4500 Integration with Web HTML/Javascript (Airray UK)](https://www.airrayuk.com/blog/fingerprint-reader-digitalpersona-u-are-u-4500-integration-with-web-html-javascript/)
